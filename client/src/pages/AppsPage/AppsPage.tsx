/**
 * 更多应用 — CRUD 全面增强
 * 博客/论坛/学习/财务/鞋服 支持 增删改查
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tabs, Card, Button, Space, Tag, message, Modal, Form, Input, InputNumber, Select, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

const BASE = '/api';

interface TabCfg {
  title: string; table: string;
  columns: Array<{ title: string; dataIndex: string; key?: string; render?: (v: any, rec: any) => React.ReactNode }>;
  formFields: Array<{ name: string; label: string; type: 'text'|'number'|'select'; required?: boolean; options?: Array<{label:string;value:string}> }>;
}

const tabConfig: Record<string, TabCfg> = {
  blog: {
    title: '博客文章',
    table: 'blog_posts',
    columns: [
      { title: '标题', dataIndex: 'title' },
      { title: '摘要', dataIndex: 'summary', render: (v: string) => <span title={v}>{(v||'').substring(0,40)}</span> },
      { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v==='published'?'green':v==='draft'?'orange':'default'}>{v||'draft'}</Tag> },
      { title: '发布时间', dataIndex: 'published_at' },
    ],
    formFields: [
      { name: 'title', label: '标题', type: 'text', required: true },
      { name: 'summary', label: '摘要', type: 'text' },
      { name: 'content', label: '内容', type: 'text' },
      { name: 'category_id', label: '分类', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [{label:'草稿',value:'draft'},{label:'已发布',value:'published'}] },
    ],
  },
  forum: {
    title: '论坛帖子',
    table: 'forum_threads',
    columns: [
      { title: '标题', dataIndex: 'title' },
      { title: '版块', dataIndex: 'board_id' },
      { title: '作者', dataIndex: 'author_name' },
      { title: '回复', dataIndex: 'reply_count' },
      { title: '置顶', dataIndex: 'is_pinned', render: (v: any) => v ? <Tag color="red">置顶</Tag> : null },
    ],
    formFields: [
      { name: 'title', label: '标题', type: 'text', required: true },
      { name: 'content', label: '内容', type: 'text' },
      { name: 'board_id', label: '版块', type: 'select', options: [{label:'技术讨论',value:'board_001'},{label:'产品反馈',value:'board_002'},{label:'综合水区',value:'board_003'}] },
      { name: 'is_pinned', label: '置顶', type: 'select', options: [{label:'否',value:'0'},{label:'是',value:'1'}] },
    ],
  },
  elearning: {
    title: '在线课程',
    table: 'elearning_courses',
    columns: [
      { title: '课程名', dataIndex: 'title' },
      { title: '讲师', dataIndex: 'instructor_name' },
      { title: '难度', dataIndex: 'difficulty' },
      { title: '时长(分)', dataIndex: 'duration_minutes' },
      { title: '报名', dataIndex: 'enrollment_count' },
    ],
    formFields: [
      { name: 'title', label: '课程名', type: 'text', required: true },
      { name: 'description', label: '描述', type: 'text' },
      { name: 'instructor_name', label: '讲师', type: 'text' },
      { name: 'difficulty', label: '难度', type: 'select', options: [{label:'初级',value:'beginner'},{label:'中级',value:'intermediate'},{label:'高级',value:'advanced'}] },
      { name: 'duration_minutes', label: '时长(分)', type: 'number' },
    ],
  },
  finance: {
    title: '会计科目表',
    table: 'account_chart',
    columns: [
      { title: '编码', dataIndex: 'code' },
      { title: '名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: (v: string) => {
        const map: Record<string, string> = { asset:'资产', liability:'负债', equity:'权益', cost:'成本', revenue:'收入', expense:'费用' };
        return <Tag color="blue">{map[v]||v}</Tag>;
      }},
      { title: '级次', dataIndex: 'level' },
      { title: '上级', dataIndex: 'parent_code' },
    ],
    formFields: [
      { name: 'code', label: '编码', type: 'text', required: true },
      { name: 'name', label: '名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        {label:'资产',value:'asset'},{label:'负债',value:'liability'},{label:'权益',value:'equity'},
        {label:'成本',value:'cost'},{label:'收入',value:'revenue'},{label:'费用',value:'expense'}
      ]},
      { name: 'parent_code', label: '上级编码', type: 'text' },
      { name: 'level', label: '级次', type: 'number' },
    ],
  },
  shoe: {
    title: '款号管理',
    table: 'product_styles',
    columns: [
      { title: '款号', dataIndex: 'style_no' },
      { title: '名称', dataIndex: 'name' },
      { title: '性别', dataIndex: 'gender' },
      { title: '季节', dataIndex: 'season' },
      { title: '年份', dataIndex: 'year' },
    ],
    formFields: [
      { name: 'style_no', label: '款号', type: 'text', required: true },
      { name: 'name', label: '名称', type: 'text', required: true },
      { name: 'gender', label: '性别', type: 'select', options: [{label:'男',value:'male'},{label:'女',value:'female'},{label:'中性',value:'unisex'}] },
      { name: 'season', label: '季节', type: 'select', options: [{label:'春',value:'spring'},{label:'夏',value:'summer'},{label:'秋',value:'autumn'},{label:'冬',value:'winter'}] },
      { name: 'year', label: '年份', type: 'number' },
    ],
  },
};

export default function AppsPage() {
  const [activeTab, setActiveTab] = useState('blog');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');

  const cfg = tabConfig[activeTab];

  const loadData = useCallback(async () => {
    if (!cfg) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: '200' });
      if (search) params.set('search', search);
      const res = await fetch(`${BASE}/${cfg.table}?${params}`);
      const json = await res.json();
      const items = json.list || json.data || json || [];
      setData(Array.isArray(items) ? items : []);
    } catch { setData([]); }
    setLoading(false);
  }, [cfg, search]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (rec: any) => {
    setEditRecord(rec);
    form.setFieldsValue(rec);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${BASE}/${cfg.table}/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      loadData();
    } catch { message.error('删除失败'); }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const url = editRecord
        ? `${BASE}/${cfg.table}/${editRecord.id}`
        : `${BASE}/${cfg.table}`;
      const method = editRecord ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.error) { message.error(json.error); return; }
      message.success(editRecord ? '更新成功' : '创建成功');
      setModalOpen(false);
      loadData();
    } catch {}
  };

  const tabs = Object.entries(tabConfig).map(([key, c]) => ({ key, label: c.title }));

  const actionCol = {
    title: '操作', key: 'actions', width: 120,
    render: (_: any, rec: any) => (
      <Space size="small">
        <Tooltip title="编辑"><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(rec)} /></Tooltip>
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(rec.id)}>
          <Tooltip title="删除"><Button type="link" size="small" danger icon={<DeleteOutlined />} /></Tooltip>
        </Popconfirm>
      </Space>
    ),
  };

  return (
    <Card
      title={cfg?.title || '更多应用'}
      extra={
        <Space>
          <Input.Search placeholder="搜索..." allowClear size="small" style={{width:200}}
            value={search} onChange={e=>setSearch(e.target.value)} onSearch={()=>loadData()} />
          <Button icon={<ReloadOutlined />} size="small" onClick={loadData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} size="small" onClick={handleAdd}>新增</Button>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />
      <Table
        dataSource={data}
        columns={[...(cfg?.columns||[]), actionCol]}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 20, showTotal: (t: number) => `共 ${t} 条` }}
      />

      <Modal
        title={editRecord ? '编辑' : '新增'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{marginTop:16}}>
          {cfg?.formFields.map((f) => (
            <Form.Item key={f.name} name={f.name} label={f.label} rules={f.required?[{required:true,message:`请输入${f.label}`}]:undefined}>
              {f.type === 'select' ? <Select options={f.options} allowClear /> :
               f.type === 'number' ? <InputNumber style={{width:'100%'}} /> :
               <Input />}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </Card>
  );
}
