import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, Tag, message, Space, Popconfirm, Tabs, Progress, Upload, Tooltip, Empty, Badge, Dropdown, List } from 'antd';
import {
  Plus, Edit, Delete, BookOpen, Search, Sparkles, Target,
  UploadCloud, FolderOpen, FileText, Trash2, Download, MoreHorizontal,
  Database, RefreshCw, Inbox,
} from 'lucide-react';
import type { UploadFile } from 'antd';

const { TextArea } = Input;
const { Dragger } = Upload;

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  is_default: number;
  itemCount: number;
  docCount: number;
  created_at: string;
}

interface KnowledgeItem {
  id: string;
  kb_id: string;
  title: string;
  category: string;
  content: string;
  tags: string;
  source_type: string;
  source_file: string;
  score?: number;
  scorePercent?: number;
  created_at: string;
}

interface KnowledgeDocument {
  id: string;
  kb_id: string;
  original_name: string;
  file_type: string;
  file_size: number;
  chunk_count: number;
  status: string;
  created_at: string;
}

const CATEGORIES = ['hr_policy', 'salary', 'attendance', 'recruitment', 'training', 'performance', 'welfare', 'general'];
const CATEGORY_LABELS: Record<string, string> = {
  hr_policy: '人事制度', salary: '薪酬福利', attendance: '考勤管理',
  recruitment: '招聘入职', training: '培训发展', performance: '绩效考核',
  welfare: '员工关怀', general: '通用知识',
};

export default function AIKnowledgePage() {
  const [kbases, setKbases] = useState<KnowledgeBase[]>([]);
  const [activeKb, setActiveKb] = useState<KnowledgeBase | null>(null);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('items');

  // 知识库弹窗
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [editingKb, setEditingKb] = useState<KnowledgeBase | null>(null);
  const [kbForm] = Form.useForm();

  // 知识条目弹窗
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [itemForm] = Form.useForm();

  // 上传状态
  const [uploading, setUploading] = useState(false);

  // 搜索
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // 命中测试
  const [hitQuery, setHitQuery] = useState('');
  const [hitResults, setHitResults] = useState<any[]>([]);
  const [hitTesting, setHitTesting] = useState(false);
  const [hitTopK, setHitTopK] = useState(5);

  useEffect(() => { loadKBs(); }, []);

  useEffect(() => {
    if (activeKb) { loadItems(); loadDocuments(); }
  }, [activeKb]);

  const loadKBs = async () => {
    try {
      const res = await fetch('/api/ai/kb');
      const data = await res.json();
      const list = data.data || [];
      setKbases(list);
      if (!activeKb && list.length > 0) setActiveKb(list[0]);
    } catch {}
  };

  const loadItems = async () => {
    if (!activeKb) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/knowledge?kbId=${activeKb.id}`);
      const data = await res.json();
      setItems(data.data || []);
    } catch {} finally { setLoading(false); }
  };

  const loadDocuments = async () => {
    if (!activeKb) return;
    try {
      const res = await fetch(`/api/ai/kb/${activeKb.id}/documents`);
      const data = await res.json();
      setDocuments(data.data || []);
    } catch {}
  };

  // KB CRUD
  const handleSaveKb = async () => {
    try {
      const values = await kbForm.validateFields();
      if (editingKb) {
        await fetch(`/api/ai/kb/${editingKb.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
        message.success('知识库更新成功');
      } else {
        await fetch('/api/ai/kb', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
        message.success('知识库创建成功');
      }
      setKbModalOpen(false); kbForm.resetFields(); loadKBs();
    } catch {}
  };

  const handleDeleteKb = async (id: string) => {
    try {
      await fetch(`/api/ai/kb/${id}`, { method: 'DELETE' });
      if (activeKb?.id === id) setActiveKb(null);
      message.success('知识库已删除'); loadKBs();
    } catch (e: any) { message.error(e.message || '删除失败'); }
  };

  // Item CRUD
  const handleSaveItem = async () => {
    try {
      const values = await itemForm.validateFields();
      values.kb_id = activeKb?.id;
      if (editingItem) {
        await fetch(`/api/ai/knowledge/${editingItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
        message.success('修改成功');
      } else {
        await fetch('/api/ai/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
        message.success('添加成功');
      }
      setItemModalOpen(false); itemForm.resetFields(); loadItems();
    } catch {}
  };

  const handleDeleteItem = async (id: string) => {
    await fetch(`/api/ai/knowledge/${id}`, { method: 'DELETE' });
    message.success('删除成功'); loadItems();
  };

  // 文件上传
  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      const res = await fetch(`/api/ai/kb/${activeKb?.id}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        message.success(`上传成功，解析了 ${data.data?.[0]?.chunks || 0} 个知识条目`);
        loadItems(); loadDocuments();
      } else {
        message.error(data.error || '上传失败');
      }
    } catch { message.error('上传失败'); }
    finally { setUploading(false); return false; }
  };

  // 批量上传
  const handleBatchUpload = async (files: File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      const res = await fetch(`/api/ai/kb/${activeKb?.id}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const totalChunks = data.data.reduce((sum: number, d: any) => sum + (d.chunks || 0), 0);
        message.success(`上传 ${data.data.length} 个文件，解析了 ${totalChunks} 个知识条目`);
        loadItems(); loadDocuments();
      }
    } catch { message.error('上传失败'); }
    finally { setUploading(false); }
  };

  // 删除文档
  const handleDeleteDoc = async (docId: string) => {
    await fetch(`/api/ai/kb/${activeKb?.id}/documents/${docId}`, { method: 'DELETE' });
    message.success('文档已删除'); loadItems(); loadDocuments();
  };

  // 搜索
  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch('/api/ai/search-knowledge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, kbId: activeKb?.id, topK: 10 }),
      });
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch {} finally { setSearching(false); }
  };

  // 命中测试
  const runHitTest = async () => {
    if (!hitQuery.trim()) return;
    setHitTesting(true);
    try {
      const res = await fetch('/api/ai/hit-testing', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: hitQuery, topK: hitTopK }),
      });
      const data = await res.json();
      setHitResults(data.data || []);
    } catch {} finally { setHitTesting(false); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const itemColumns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, render: (t: string) => <strong>{t}</strong> },
    { title: '分类', dataIndex: 'category', key: 'category', render: (v: string) => <Tag color="blue">{CATEGORY_LABELS[v] || v}</Tag> },
    { title: '内容预览', dataIndex: 'content', key: 'content', ellipsis: true, width: 250, render: (t: string) => t?.substring(0, 60) + (t?.length > 60 ? '...' : '') },
    {
      title: '来源', dataIndex: 'source_type', key: 'source_type', width: 80,
      render: (v: string) => v === 'file' ? <Tag color="green">文件</Tag> : <Tag>手动</Tag>,
    },
    { title: '标签', dataIndex: 'tags', key: 'tags', render: (t: string) => t?.split(',').filter(Boolean).map((tag, i) => <Tag key={i} style={{ marginBottom: 2 }}>{tag.trim()}</Tag>) },
    {
      title: '操作', key: 'action', width: 140,
      render: (_: any, r: KnowledgeItem) => (
        <Space>
          <Button size="small" type="link" icon={<Edit size={14} />} onClick={() => { setEditingItem(r); itemForm.setFieldsValue(r); setItemModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteItem(r.id)}>
            <Button size="small" type="link" danger icon={<Trash2 size={14} />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const docColumns = [
    { title: '文件名', dataIndex: 'original_name', key: 'name', ellipsis: true, render: (t: string) => <Space><FileText size={14} /> {t}</Space> },
    { title: '类型', dataIndex: 'file_type', key: 'type', width: 80, render: (v: string) => <Tag>{v.toUpperCase()}</Tag> },
    { title: '大小', dataIndex: 'file_size', key: 'size', width: 100, render: (v: number) => formatSize(v) },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (v: string) => <Tag color={v === 'completed' ? 'green' : v === 'parsing' ? 'orange' : 'default'}>{v === 'completed' ? '已完成' : v}</Tag>,
    },
    { title: '时间', dataIndex: 'created_at', key: 'time', width: 150, render: (v: string) => v ? new Date(v).toLocaleString() : '-' },
    {
      title: '操作', key: 'action', width: 80,
      render: (_: any, r: KnowledgeDocument) => (
        <Popconfirm title="删除文档及关联知识条目？" onConfirm={() => handleDeleteDoc(r.id)}>
          <Button size="small" type="link" danger icon={<Trash2 size={14} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 12 }}>
      {/* 左侧知识库列表 */}
      <div style={{ width: 260, flexShrink: 0, overflow: 'hidden' }}>
        <Card size="small" style={{ height: '100%' }}
          title={<Space><Database size={14} color="#1890ff" /> 知识库列表</Space>}
          extra={<Button type="text" size="small" icon={<Plus size={14} />} onClick={() => { setEditingKb(null); kbForm.resetFields(); setKbModalOpen(true); }} />}
        >
          <div style={{ overflow: 'auto', maxHeight: 'calc(100% - 10px)' }}>
            {kbases.map(kb => (
              <div key={kb.id} onClick={() => setActiveKb(kb)}
                style={{
                  padding: '10px', borderRadius: 6, cursor: 'pointer', marginBottom: 6,
                  backgroundColor: activeKb?.id === kb.id ? '#e6f7ff' : 'transparent',
                  border: activeKb?.id === kb.id ? '1px solid #91d5ff' : '1px solid transparent',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: activeKb?.id === kb.id ? 'bold' : 'normal', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {kb.name} {kb.is_default ? <Tag color="blue" style={{ fontSize: 10, padding: '0 4px' }}>默认</Tag> : null}
                    </div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                      {kb.itemCount}条知识 · {kb.docCount}个文档
                    </div>
                  </div>
                  {!kb.is_default && (
                    <Dropdown menu={{ items: [
                      { key: 'edit', label: '编辑', icon: <Edit size={12} /> },
                      { key: 'delete', label: '删除', icon: <Trash2 size={12} />, danger: true },
                    ], onClick: ({ key }) => {
                      if (key === 'edit') { setEditingKb(kb); kbForm.setFieldsValue(kb); setKbModalOpen(true); }
                      if (key === 'delete') handleDeleteKb(kb.id);
                    }}}>
                      <Button type="text" size="small" icon={<MoreHorizontal size={14} />} onClick={e => e.stopPropagation()} />
                    </Dropdown>
                  )}
                </div>
              </div>
            ))}
            {kbases.length === 0 && <Empty description="暂无知识库" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          </div>
        </Card>
      </div>

      {/* 右侧内容区 */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {activeKb ? (
          <>
            <Card size="small" style={{ marginBottom: 8 }}
              title={<Space><BookOpen size={16} color="#1890ff" /> {activeKb.name}</Space>}
              extra={<Button type="primary" size="small" icon={<Plus size={14} />} onClick={() => { setEditingItem(null); itemForm.resetFields(); setItemModalOpen(true); }}>添加知识</Button>}>
              <span style={{ fontSize: 12, color: '#999' }}>{activeKb.description || '暂无描述'}</span>
            </Card>

            <Tabs activeKey={activeTab} onChange={setActiveTab} size="small">
              <Tabs.TabPane tab={<span><FileText size={14} /> 知识条目 ({items.length})</span>} key="items">
                <Card size="small" style={{ marginBottom: 8 }}>
                  <Input.Search placeholder="搜索当前知识库..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onSearch={handleSearch} loading={searching} enterButton="搜索" style={{ maxWidth: 400 }} />
                  {searchResults.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 12, color: '#666', marginBottom: 4 }}>搜索结果 ({searchResults.length})</div>
                      {searchResults.map((item: any, idx: number) => (
                        <div key={idx} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <strong>{item.title}</strong>
                          {item.score !== undefined && <Tag color="green" style={{ marginLeft: 8, fontSize: 10 }}>{(item.score * 100).toFixed(0)}%</Tag>}
                          <div style={{ color: '#999' }}>{item.content?.substring(0, 100)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                <Table columns={itemColumns} dataSource={items} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} size="small" />
              </Tabs.TabPane>

              <Tabs.TabPane tab={<span><UploadCloud size={14} /> 文档管理 ({documents.length})</span>} key="docs">
                <Card size="small" style={{ marginBottom: 8 }}>
                  <div style={{ marginBottom: 12 }}>
                    <Dragger
                      multiple
                      showUploadList={false}
                      beforeUpload={(file) => { handleUpload(file); return false; }}
                      disabled={uploading}
                      style={{ padding: '12px' }}
                    >
                      <p style={{ margin: 0 }}><Inbox size={24} style={{ color: '#1890ff' }} /></p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>点击或拖拽文件到此处上传</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#bbb' }}>支持 TXT / PDF / DOCX / MD / CSV</p>
                    </Dragger>
                    {uploading && <div style={{ textAlign: 'center', marginTop: 8 }}><Tag color="processing">正在解析文件...</Tag></div>}
                  </div>
                  <Table columns={docColumns} dataSource={documents} rowKey="id" pagination={{ pageSize: 10 }} size="small" />
                </Card>
              </Tabs.TabPane>

              <Tabs.TabPane tab={<span><Target size={14} /> 命中测试</span>} key="hittest">
                <Card size="small">
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <Input.Search placeholder="测试查询文本..." value={hitQuery} onChange={e => setHitQuery(e.target.value)} onSearch={runHitTest} loading={hitTesting} enterButton="测试" style={{ maxWidth: 400 }} />
                      <Select value={hitTopK} onChange={setHitTopK} size="small" style={{ width: 70 }}>
                        {[3,5,10,20].map(k => <Select.Option key={k} value={k}>{k}</Select.Option>)}
                      </Select>
                    </div>
                  </div>
                  {hitResults.map((item, idx) => (
                    <Card key={idx} size="small" style={{ marginBottom: 6, borderLeft: `3px solid ${item.scorePercent > 50 ? '#52c41a' : item.scorePercent > 20 ? '#faad14' : '#d9d9d9'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: 13 }}>{item.title}</div>
                          <div style={{ color: '#666', fontSize: 11 }}>{item.content?.substring(0, 200)}</div>
                        </div>
                        <Progress type="circle" percent={item.scorePercent || Math.round((item.score || 0) * 100)} size={50} strokeColor={item.scorePercent > 50 ? '#52c41a' : '#1890ff'} />
                      </div>
                    </Card>
                  ))}
                </Card>
              </Tabs.TabPane>
            </Tabs>
          </>
        ) : (
          <Empty description="请选择或创建一个知识库" style={{ marginTop: 80 }} />
        )}
      </div>

      {/* KB弹窗 */}
      <Modal title={editingKb ? '编辑知识库' : '新建知识库'} open={kbModalOpen} onOk={handleSaveKb} onCancel={() => setKbModalOpen(false)}>
        <Form form={kbForm} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input placeholder="例如：HR制度库" /></Form.Item>
          <Form.Item name="description" label="描述"><TextArea rows={3} placeholder="知识库描述..." /></Form.Item>
        </Form>
      </Modal>

      {/* Item弹窗 */}
      <Modal title={editingItem ? '编辑知识' : '添加知识'} open={itemModalOpen} onOk={handleSaveItem} onCancel={() => setItemModalOpen(false)} width={700} destroyOnClose>
        <Form form={itemForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="分类" initialValue="general">
            <Select>{CATEGORIES.map(c => <Select.Option key={c} value={c}>{CATEGORY_LABELS[c]}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}><TextArea rows={8} /></Form.Item>
          <Form.Item name="tags" label="标签"><Input placeholder="逗号分隔" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
