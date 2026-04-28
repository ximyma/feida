import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, message, Upload, Tree, Badge, Row, Col, Statistic,
  Drawer, Descriptions, Progress, Tooltip, Breadcrumb, Divider, TreeSelect,
  Transfer, Tabs, List, Avatar, Checkbox
} from 'antd';
import type { TransferProps } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  FolderOutlined, FolderOpenOutlined, FileOutlined, FilePdfOutlined,
  FileWordOutlined, FileTextOutlined, UploadOutlined, DownloadOutlined,
  EyeOutlined, StarOutlined, StarFilled, LeftOutlined, RightOutlined,
  LockOutlined, TeamOutlined, GlobalOutlined, ExclamationCircleOutlined,
  SettingOutlined, UserOutlined, SafetyOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const DOC_TABLE = 'documents';
const FOLDER_TABLE = 'doc_folders';

const { Dragger } = Upload;
const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

// 文件类型 → 图标/颜色映射
const FILE_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pdf: { icon: <FilePdfOutlined />, color: '#ff4d4f', label: 'PDF' },
  doc: { icon: <FileWordOutlined />, color: '#1677ff', label: 'Word' },
  docx: { icon: <FileWordOutlined />, color: '#1677ff', label: 'Word' },
  xls: { icon: <FileTextOutlined />, color: '#52c41a', label: 'Excel' },
  xlsx: { icon: <FileTextOutlined />, color: '#52c41a', label: 'Excel' },
  ppt: { icon: <FileTextOutlined />, color: '#fa8c16', label: 'PPT' },
  pptx: { icon: <FileTextOutlined />, color: '#fa8c16', label: 'PPT' },
  txt: { icon: <FileTextOutlined />, color: '#8c8c8c', label: '文本' },
  zip: { icon: <FileOutlined />, color: '#722ed1', label: '压缩包' },
  default: { icon: <FileOutlined />, color: '#8c8c8c', label: '其他' },
};

const getFileConfig = (mimeType: string, name: string) => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return FILE_TYPE_CONFIG[ext] || FILE_TYPE_CONFIG[mimeType?.toLowerCase()] || FILE_TYPE_CONFIG.default;
};

const ACCESS_LABELS: Record<string, string> = {
  all: '全员可见', hr: '人事可见', finance: '财务可见',
  admin: '管理员可见', tech: '技术部可见', marketing: '市场部可见',
  custom: '自定义权限'
};
const ACCESS_COLORS: Record<string, string> = {
  all: 'green', hr: 'blue', finance: 'orange',
  admin: 'red', tech: 'purple', marketing: 'cyan', custom: 'gold'
};

interface Folder { id: string; name: string; parentId: string; accessLevel: string; createdBy: string; createdAt: string; children?: Folder[] }
interface DocRecord { id: string; name: string; folderId: string; type: string; mimeType: string; url: string; accessLevel: string; uploaderName: string; createdAt: string; size?: number; fileName?: string; downloads?: number; content?: string; [k: string]: any }
interface User { id: string; username: string; realName: string; userType: string }
interface Role { id: string; name: string; code: string }
interface Dept { id: string; name: string; parentId: string }
interface Permission { id: string; documentId: string; targetType: string; targetId: string; permission: string; grantedBy: string; grantedAt: string }

export default function DocumentPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderMap, setFolderMap] = useState<Record<string, Folder>>({});
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocRecord | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailDoc, setDetailDoc] = useState<DocRecord | null>(null);
  
  // 权限管理状态
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionDoc, setPermissionDoc] = useState<DocRecord | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [allUserAccess, setAllUserAccess] = useState(false);

  // 文件上传状态
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadingFolderId, setUploadingFolderId] = useState<string>('');
  const uploadRef = useRef<any>(null);

  // 构建树形数据
  const buildTree = (flat: Folder[]): Folder[] => {
    const map: Record<string, Folder> = {};
    flat.forEach(f => { map[f.id] = { ...f, children: [] }; });
    const roots: Folder[] = [];
    flat.forEach(f => {
      if (f.parentId && map[f.parentId]) {
        map[f.parentId].children!.push(map[f.id]);
      } else {
        roots.push(map[f.id]);
      }
    });
    return roots;
  };

  // 获取面包屑路径
  const getPath = (id: string, flat: Folder[]): Folder[] => {
    const path: Folder[] = [];
    let cur = folderMap[id];
    while (cur) {
      path.unshift(cur);
      cur = cur.parentId ? folderMap[cur.parentId] : undefined;
    }
    return path;
  };

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch(`/api/${FOLDER_TABLE}`);
      const json = await res.json();
      const rows: Folder[] = Array.isArray(json) ? json : (json.data || []);
      const map: Record<string, Folder> = {};
      rows.forEach((f: Folder) => { map[f.id] = f; });
      setFolders(buildTree(rows));
      setFolderMap(map);
    } catch { message.error('加载文件夹失败'); }
  }, []);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pagination.current));
      params.set('pageSize', String(pagination.pageSize));
      if (selectedFolder) params.set('folderId', selectedFolder);
      if (search) params.set('search', search);
      const res = await fetch(`/api/${DOC_TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows: DocRecord[] = Array.isArray(json) ? json : (json.data || []);
      setDocs(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
    } catch { message.error('加载文档失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, selectedFolder, search]);

  const fetchUsersAndRoles = useCallback(async () => {
    try {
      const [usersRes, rolesRes, deptsRes] = await Promise.all([
        fetch('/api/users/all'),
        fetch('/api/roles/all'),
        fetch('/api/departments/all')
      ]);
      setUsers(await usersRes.json());
      setRoles(await rolesRes.json());
      setDepartments(await deptsRes.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchFolders(); fetchUsersAndRoles(); }, [fetchFolders, fetchUsersAndRoles]);
  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // 点击文件夹
  const handleFolderClick = (folderId: string | null) => {
    setSelectedFolder(folderId);
    setPagination(p => ({ ...p, current: 1 }));
    if (folderId) {
      setBreadcrumbs(getPath(folderId, Object.values(folderMap)));
    } else {
      setBreadcrumbs([]);
    }
  };

  // 新建文件夹
  const handleAddFolder = () => {
    setEditingFolder(null);
    folderForm.resetFields();
    folderForm.setFieldsValue({ accessLevel: 'all', parentId: selectedFolder || '' });
    setFolderModalOpen(true);
  };

  const handleEditFolder = (f: Folder) => {
    setEditingFolder(f);
    folderForm.setFieldsValue(f);
    setFolderModalOpen(true);
  };

  const handleSaveFolder = async () => {
    const values = await folderForm.validateFields();
    const body = editingFolder
      ? { ...editingFolder, ...values }
      : { id: `f_${Date.now()}`, ...values, createdBy: JSON.parse(sessionStorage.getItem('__current_user') || '{}').realName || 'admin', createdAt: new Date().toISOString() };
    const method = editingFolder ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${FOLDER_TABLE}${editingFolder ? '/' + editingFolder.id : ''}`, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      message.success(editingFolder ? '文件夹已更新' : '文件夹已创建');
      setFolderModalOpen(false);
      fetchFolders();
    } catch { message.error('保存失败'); }
  };

  const handleDeleteFolder = async (id: string) => {
    const hasDocs = docs.some(d => d.folderId === id);
    const subFolders = Object.values(folderMap).filter(f => f.parentId === id);
    if (hasDocs || subFolders.length > 0) {
      message.warning('请先删除或移动文件夹内的文档和子文件夹');
      return;
    }
    try {
      await fetch(`/api/${FOLDER_TABLE}/${id}`, { method: 'DELETE' });
      message.success('文件夹已删除');
      if (selectedFolder === id) handleFolderClick(null);
      fetchFolders();
    } catch { message.error('删除失败'); }
  };

  // 文件上传 - 使用真实的multipart/form-data
  const handleUploadFiles = async () => {
    if (fileList.length === 0) {
      message.warning('请选择要上传的文件');
      return;
    }

    const user = JSON.parse(sessionStorage.getItem('__current_user') || '{}');
    let successCount = 0;
    let failCount = 0;

    for (const file of fileList) {
      const formData = new FormData();
      formData.append('file', file.originFileObj as File);
      formData.append('folderId', uploadingFolderId || '');
      formData.append('accessLevel', allUserAccess ? 'all' : 'custom');
      formData.append('uploaderId', user.id || '');
      formData.append('uploaderName', user.realName || '管理员');

      try {
        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
          // 如果是自定义权限，设置权限
          if (!allUserAccess) {
            const perms: any[] = [];
            selectedUsers.forEach(uid => perms.push({ targetType: 'user', targetId: uid, permission: 'read' }));
            selectedRoles.forEach(rid => perms.push({ targetType: 'role', targetId: rid, permission: 'read' }));
            selectedDepts.forEach(did => perms.push({ targetType: 'department', targetId: did, permission: 'read' }));
            if (perms.length > 0) {
              await fetch(`/api/documents/${data.document.id}/permissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions: perms, grantedBy: user.id })
              });
            }
          }
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      message.success(`成功上传 ${successCount} 个文件`);
      setFileList([]);
      setUploadModalOpen(false);
      fetchDocs();
    }
    if (failCount > 0) {
      message.error(`${failCount} 个文件上传失败`);
    }
  };

  const uploadProps: UploadProps = {
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      setFileList(prev => [...prev, file as unknown as UploadFile]);
      return false;
    },
    onRemove: (file) => {
      setFileList(prev => prev.filter(f => f.uid !== file.uid));
    }
  };

  const handlePreview = (doc: DocRecord) => {
    setPreviewDoc(doc);
    setPreviewOpen(true);
  };

  const handleDownload = async (doc: DocRecord) => {
    const user = JSON.parse(sessionStorage.getItem('__current_user') || '{}');
    const downloadUrl = `/api/documents/download/${doc.id}?userId=${user.id}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = doc.name || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    fetchDocs();
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await fetch(`/api/${DOC_TABLE}/${id}`, { method: 'DELETE' });
      message.success('文档已删除');
      fetchDocs();
    } catch { message.error('删除失败'); }
  };

  // 权限管理
  const handleOpenPermission = async (doc: DocRecord) => {
    setPermissionDoc(doc);
    try {
      const res = await fetch(`/api/documents/${doc.id}/permissions`);
      const perms: Permission[] = await res.json();
      setPermissions(perms);
      setSelectedUsers(perms.filter(p => p.targetType === 'user').map(p => p.targetId));
      setSelectedRoles(perms.filter(p => p.targetType === 'role').map(p => p.targetId));
      setSelectedDepts(perms.filter(p => p.targetType === 'department').map(p => p.targetId));
      setAllUserAccess(perms.some(p => p.targetType === 'all'));
    } catch {
      setPermissions([]);
    }
    setPermissionModalOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!permissionDoc) return;
    const user = JSON.parse(sessionStorage.getItem('__current_user') || '{}');
    
    const perms: any[] = [];
    if (allUserAccess) {
      perms.push({ targetType: 'all', targetId: '', permission: 'read' });
    } else {
      selectedUsers.forEach(uid => perms.push({ targetType: 'user', targetId: uid, permission: 'read' }));
      selectedRoles.forEach(rid => perms.push({ targetType: 'role', targetId: rid, permission: 'read' }));
      selectedDepts.forEach(did => perms.push({ targetType: 'department', targetId: did, permission: 'read' }));
    }

    try {
      await fetch(`/api/documents/${permissionDoc.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: perms, grantedBy: user.id })
      });
      message.success('权限已保存');
      setPermissionModalOpen(false);
    } catch {
      message.error('保存权限失败');
    }
  };

  // 统计数据
  const stats = {
    total: docs.length,
    folders: Object.keys(folderMap).length,
    totalSize: docs.reduce((s, d) => s + (d.size || 0), 0),
    downloads: docs.reduce((s, d) => s + (d.downloads || 0), 0)
  };

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      ellipsis: true,
      render: (v: string, r: DocRecord) => {
        const config = getFileConfig(r.mimeType || '', v);
        return (
          <Space>
            <span style={{ color: config.color }}>{config.icon}</span>
            <span>{v}</span>
            {r.type && <Tag>{r.type.toUpperCase()}</Tag>}
          </Space>
        );
      }
    },
    { title: '大小', dataIndex: 'size', width: 100, render: (v: number) => v ? `${(v / 1024).toFixed(1)} KB` : '—' },
    { title: '上传者', dataIndex: 'uploaderName', width: 100 },
    {
      title: '权限', dataIndex: 'accessLevel', width: 100,
      render: (v: string) => {
        const label = ACCESS_LABELS[v] || v || '全员可见';
        const color = ACCESS_COLORS[v] || 'default';
        return <Tag color={color} icon={v === 'all' ? <GlobalOutlined /> : <LockOutlined />}>{label}</Tag>;
      }
    },
    { title: '下载', dataIndex: 'downloads', width: 80, render: (v: number) => v || 0 },
    { title: '上传时间', dataIndex: 'createdAt', width: 160, render: (v: string) => v?.slice(0, 16) || '—' },
    {
      title: '操作', width: 200, fixed: 'right' as const,
      render: (_: any, r: DocRecord) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(r)}>预览</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(r)}>下载</Button>
          <Button type="link" size="small" icon={<SafetyOutlined />} onClick={() => handleOpenPermission(r)}>权限</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDeleteDoc(r.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="文档总数" value={stats.total} prefix={<FileOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="文件夹数" value={stats.folders} prefix={<FolderOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="总大小" value={(stats.totalSize / 1024 / 1024).toFixed(2)} suffix="MB" /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="下载次数" value={stats.downloads} prefix={<DownloadOutlined />} /></Card></Col>
      </Row>

      {/* 主内容区 */}
      <Card>
        <div style={{ display: 'flex', gap: 16 }}>
          {/* 左侧文件夹树 */}
          <div style={{ width: 240, borderRight: '1px solid #f0f0f0', paddingRight: 16 }}>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500 }}>文件夹</span>
              <Button type="link" size="small" icon={<PlusOutlined />} onClick={handleAddFolder}>新建</Button>
            </div>
            <div
              style={{ padding: '4px 8px', cursor: 'pointer', background: !selectedFolder ? '#e6f7ff' : 'transparent', borderRadius: 4, marginBottom: 4 }}
              onClick={() => handleFolderClick(null)}
            >
              <GlobalOutlined /> 全部文档
            </div>
            {folders.map(f => (
              <div key={f.id}>
                <div
                  style={{ padding: '4px 8px', cursor: 'pointer', background: selectedFolder === f.id ? '#e6f7ff' : 'transparent', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => handleFolderClick(f.id)}
                >
                  <span><FolderOutlined /> {f.name}</span>
                  <Space size={0}>
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEditFolder(f); }} />
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.id); }} />
                  </Space>
                </div>
              </div>
            ))}
          </div>

          {/* 右侧文档列表 */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Input.Search placeholder="搜索文档" allowClear style={{ width: 200 }} onSearch={v => setSearch(v)} />
                {selectedFolder && (
                  <Button onClick={() => handleFolderClick(null)}>返回全部</Button>
                )}
              </Space>
              <Space>
                <Button type="primary" icon={<UploadOutlined />} onClick={() => { setUploadingFolderId(selectedFolder || ''); setUploadModalOpen(true); }}>上传文件</Button>
                <Button icon={<ReloadOutlined />} onClick={() => { fetchDocs(); fetchFolders(); }}>刷新</Button>
              </Space>
            </div>

            {/* 面包屑 */}
            {breadcrumbs.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <Breadcrumb>
                  <Breadcrumb.Item onClick={() => handleFolderClick(null)} style={{ cursor: 'pointer' }}>全部</Breadcrumb.Item>
                  {breadcrumbs.map((b, i) => (
                    <Breadcrumb.Item key={b.id}>{b.name}</Breadcrumb.Item>
                  ))}
                </Breadcrumb>
              </div>
            )}

            <Table
              dataSource={docs}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ ...pagination, showSizeChanger: true, showTotal: t => `共 ${t} 条` }}
              onChange={(p) => setPagination(prev => ({ ...prev, current: p.current || 1, pageSize: p.pageSize || 20 }))}
              scroll={{ x: 1000 }}
            />
          </div>
        </div>
      </Card>

      {/* 上传Modal */}
      <Modal
        title="上传文件"
        open={uploadModalOpen}
        onCancel={() => { setUploadModalOpen(false); setFileList([]); }}
        onOk={handleUploadFiles}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="目标文件夹">
            <TreeSelect
              value={uploadingFolderId}
              onChange={setUploadingFolderId}
              treeData={[{ id: '', name: '根目录', children: folders }]}
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              placeholder="选择文件夹（可选）"
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="选择文件">
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon"><UploadOutlined /></p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持单个或批量上传</p>
            </Dragger>
          </Form.Item>
          <Form.Item label="访问权限">
            <Checkbox checked={allUserAccess} onChange={e => setAllUserAccess(e.target.checked)}>全员可见</Checkbox>
            {!allUserAccess && (
              <div style={{ marginTop: 12 }}>
                <Tabs size="small">
                  <Tabs.TabPane tab="用户" key="users">
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="选择用户"
                      value={selectedUsers}
                      onChange={setSelectedUsers}
                      options={users.map(u => ({ label: u.realName, value: u.id }))}
                    />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="角色" key="roles">
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="选择角色"
                      value={selectedRoles}
                      onChange={setSelectedRoles}
                      options={roles.map(r => ({ label: r.name, value: r.id }))}
                    />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="部门" key="depts">
                    <TreeSelect
                      multiple
                      style={{ width: '100%' }}
                      placeholder="选择部门"
                      value={selectedDepts}
                      onChange={setSelectedDepts}
                      treeData={departments}
                      fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                    />
                  </Tabs.TabPane>
                </Tabs>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* 新建/编辑文件夹Modal */}
      <Modal
        title={editingFolder ? '编辑文件夹' : '新建文件夹'}
        open={folderModalOpen}
        onCancel={() => setFolderModalOpen(false)}
        onOk={handleSaveFolder}
      >
        <Form form={folderForm} layout="vertical">
          <Form.Item name="name" label="文件夹名称" rules={[{ required: true }]}>
            <Input placeholder="输入文件夹名称" />
          </Form.Item>
          <Form.Item name="parentId" label="父文件夹">
            <TreeSelect
              treeData={[{ id: '', name: '根目录', children: folders }]}
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              placeholder="选择父文件夹（可选）"
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 预览Modal */}
      <Modal
        title={previewDoc?.name}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={800}
      >
        {previewDoc && (
          <div>
            <Descriptions column={2}>
              <Descriptions.Item label="文件类型">{previewDoc.type?.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="大小">{previewDoc.size ? `${(previewDoc.size / 1024).toFixed(1)} KB` : '—'}</Descriptions.Item>
              <Descriptions.Item label="上传者">{previewDoc.uploaderName}</Descriptions.Item>
              <Descriptions.Item label="上传时间">{previewDoc.createdAt?.slice(0, 16)}</Descriptions.Item>
              <Descriptions.Item label="下载次数">{previewDoc.downloads || 0}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <div style={{ textAlign: 'center', padding: 40 }}>
              <FileOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />
              <p style={{ marginTop: 16, color: '#8c8c8c' }}>
                {previewDoc.type === 'pdf' ? 'PDF预览需要额外组件支持' : '请下载后查看文件内容'}
              </p>
              <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload(previewDoc)}>下载文件</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 权限管理Modal */}
      <Modal
        title={`权限管理 - ${permissionDoc?.name || ''}`}
        open={permissionModalOpen}
        onCancel={() => setPermissionModalOpen(false)}
        onOk={handleSavePermissions}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Checkbox checked={allUserAccess} onChange={e => setAllUserAccess(e.target.checked)}>
            <GlobalOutlined /> 全员可见（所有用户都可以查看）
          </Checkbox>
        </div>
        {!allUserAccess && (
          <div>
            <Divider>自定义权限</Divider>
            <Tabs size="small">
              <Tabs.TabPane tab={`用户 (${selectedUsers.length})`} key="users">
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="搜索并选择用户"
                  value={selectedUsers}
                  onChange={setSelectedUsers}
                  showSearch
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={users.map(u => ({ label: u.realName, value: u.id }))}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={`角色 (${selectedRoles.length})`} key="roles">
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="选择角色"
                  value={selectedRoles}
                  onChange={setSelectedRoles}
                  options={roles.map(r => ({ label: r.name, value: r.id }))}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={`部门 (${selectedDepts.length})`} key="depts">
                <TreeSelect
                  multiple
                  style={{ width: '100%' }}
                  placeholder="选择部门"
                  value={selectedDepts}
                  onChange={setSelectedDepts}
                  treeData={departments}
                  fieldNames={{ label: 'name', value: 'id' }}
                  showSearch
                  treeNodeFilterProp="name"
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
}
