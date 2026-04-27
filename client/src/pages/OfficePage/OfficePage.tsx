import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, message, Tabs, Row, Col, Progress, Descriptions,
  Divider, Badge, List, Collapse, Alert, Upload, DatePicker,
  InputNumber, Checkbox, Drawer, Timeline, Statistic, Tooltip
} from 'antd';
const { TextArea } = Input;
import {
  FolderOutlined, FileOutlined, NotificationOutlined, SurveyOutlined,
  HomeOutlined, ToolOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  UploadOutlined, DownloadOutlined, SearchOutlined, CalendarOutlined,
  TeamOutlined, UserOutlined, EyeOutlined, BellOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// ============ 类型定义 ============
interface DocumentFolder {
  id: string;
  name: string;
  parentId: string | null;
  permission: string;
  createdAt: string;
  createdBy?: string;
}

interface Document {
  id: string;
  name: string;
  folderId: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  downloads?: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  publisher: string;
  publishDate: string;
  status: string;
  isTop?: number;
  category?: string;
  viewCount?: number;
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  creator?: string;
  createdAt: string;
  startTime?: string;
  endTime?: string;
  status: string;
  questionCount?: number;
  responseCount?: number;
}

interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment?: string;
  status: string;
}

interface Meeting {
  id: string;
  title: string;
  roomId: string;
  organizer?: string;
  organizerId?: string;
  startTime: string;
  endTime: string;
  participants?: string;
  description?: string;
  status: string;
}

interface Supply {
  id: string;
  name: string;
  category?: string;
  stock: number;
  unit?: string;
  price?: number;
  safetyStock?: number;
  supplier?: string;
  location?: string;
}

interface SupplyRequest {
  id: string;
  supplyId: string;
  supplyName?: string;
  quantity: number;
  requesterId?: string;
  requesterName?: string;
  purpose?: string;
  pickupTime?: string;
  status: string;
  approver?: string;
  approvedAt?: string;
}

const fmt = (n: number) => n?.toLocaleString('zh-CN') || '0';

export default function OfficePage() {
  const [activeTab, setActiveTab] = useState('documents');
  const [loading, setLoading] = useState(true);

  // 文档管理
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // 公告问卷
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [announcementDetail, setAnnouncementDetail] = useState<Announcement | null>(null);

  // 会议管理
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // 办公用品
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);

  // 弹窗状态
  const [folderModal, setFolderModal] = useState(false);
  const [documentModal, setDocumentModal] = useState(false);
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [roomModal, setRoomModal] = useState(false);
  const [meetingModal, setMeetingModal] = useState(false);
  const [supplyModal, setSupplyModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);

  const [editingFolder, setEditingFolder] = useState<DocumentFolder | null>(null);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);

  const [searchText, setSearchText] = useState('');

  const [folderForm] = Form.useForm();
  const [announcementForm] = Form.useForm();
  const [roomForm] = Form.useForm();
  const [meetingForm] = Form.useForm();
  const [supplyForm] = Form.useForm();
  const [requestForm] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();

  // ============ 数据加载 ============
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [foldersRes, docsRes, annRes, surveysRes, roomsRes, meetingsRes, suppliesRes, requestsRes] = await Promise.all([
        fetch('/api/document_folders').then(r => r.json()).catch(() => []),
        fetch('/api/documents').then(r => r.json()).catch(() => []),
        fetch('/api/announcements').then(r => r.json()).catch(() => []),
        fetch('/api/surveys').then(r => r.json()).catch(() => []),
        fetch('/api/meeting_rooms').then(r => r.json()).catch(() => []),
        fetch('/api/meetings').then(r => r.json()).catch(() => []),
        fetch('/api/office_supplies').then(r => r.json()).catch(() => []),
        fetch('/api/supply_requests').then(r => r.json()).catch(() => []),
      ]);

      setFolders(Array.isArray(foldersRes) ? foldersRes : []);
      setDocuments(Array.isArray(docsRes) ? docsRes : []);
      setAnnouncements(Array.isArray(annRes) ? annRes : []);
      setSurveys(Array.isArray(surveysRes) ? surveysRes : []);
      setMeetingRooms(Array.isArray(roomsRes) ? roomsRes : []);
      setMeetings(Array.isArray(meetingsRes) ? meetingsRes : []);
      setSupplies(Array.isArray(suppliesRes) ? suppliesRes : []);
      setSupplyRequests(Array.isArray(requestsRes) ? requestsRes : []);
    } catch {
      messageApi.error('加载数据失败');
    }
    setLoading(false);
  }, [messageApi]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ============ 文档夹操作 ============
  const openFolderModal = (folder?: DocumentFolder) => {
    setEditingFolder(folder || null);
    if (folder) folderForm.setFieldsValue(folder);
    else folderForm.resetFields();
    setFolderModal(true);
  };

  const saveFolder = async () => {
    try {
      const values = await folderForm.validateFields();
      const payload = {
        ...values,
        id: editingFolder?.id || `df_${Date.now()}`,
        createdAt: editingFolder?.createdAt || new Date().toISOString()
      };
      const url = editingFolder ? `/api/document_folders/${editingFolder.id}` : '/api/document_folders';
      const method = editingFolder ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        messageApi.success(editingFolder ? '文件夹已更新' : '文件夹已创建');
        setFolderModal(false);
        loadAll();
      }
    } catch {}
  };

  const deleteFolder = async (id: string) => {
    await fetch(`/api/document_folders/${id}`, { method: 'DELETE' });
    messageApi.success('文件夹已删除');
    loadAll();
  };

  // ============ 会议室操作 ============
  const openRoomModal = (room?: MeetingRoom) => {
    setEditingRoom(room || null);
    if (room) roomForm.setFieldsValue(room);
    else roomForm.resetFields();
    setRoomModal(true);
  };

  const saveRoom = async () => {
    try {
      const values = await roomForm.validateFields();
      const payload = {
        ...values,
        id: editingRoom?.id || `mr_${Date.now()}`,
        status: values.status || 'available'
      };
      const url = editingRoom ? `/api/meeting_rooms/${editingRoom.id}` : '/api/meeting_rooms';
      const method = editingRoom ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        messageApi.success(editingRoom ? '会议室已更新' : '会议室已创建');
        setRoomModal(false);
        loadAll();
      }
    } catch {}
  };

  const deleteRoom = async (id: string) => {
    await fetch(`/api/meeting_rooms/${id}`, { method: 'DELETE' });
    messageApi.success('会议室已删除');
    loadAll();
  };

  // ============ 办公用品操作 ============
  const openSupplyModal = (supply?: Supply) => {
    setEditingSupply(supply || null);
    if (supply) supplyForm.setFieldsValue(supply);
    else supplyForm.resetFields();
    setSupplyModal(true);
  };

  const saveSupply = async () => {
    try {
      const values = await supplyForm.validateFields();
      const payload = {
        ...values,
        id: editingSupply?.id || `os_${Date.now()}`
      };
      const url = editingSupply ? `/api/office_supplies/${editingSupply.id}` : '/api/office_supplies';
      const method = editingSupply ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        messageApi.success(editingSupply ? '物品已更新' : '物品已添加');
        setSupplyModal(false);
        loadAll();
      }
    } catch {}
  };

  const deleteSupply = async (id: string) => {
    await fetch(`/api/office_supplies/${id}`, { method: 'DELETE' });
    messageApi.success('物品已删除');
    loadAll();
  };

  // ============ 物品领用申请 ============
  const openRequestModal = (supply?: Supply) => {
    requestForm.resetFields();
    if (supply) {
      requestForm.setFieldsValue({ supplyId: supply.id, supplyName: supply.name, quantity: 1 });
    }
    setRequestModal(true);
  };

  const saveRequest = async () => {
    try {
      const values = await requestForm.validateFields();
      const payload = {
        ...values,
        id: `sr_${Date.now()}`,
        requesterId: 'emp-1',
        requesterName: '张明辉',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      const res = await fetch('/api/supply_requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        messageApi.success('领用申请已提交');
        setRequestModal(false);
        loadAll();
      }
    } catch {}
  };

  const approveRequest = async (id: string) => {
    const res = await fetch(`/api/supply_requests/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved', approver: '管理员', approvedAt: new Date().toISOString() }) });
    if (res.ok) {
      messageApi.success('已批准');
      loadAll();
    }
  };

  // ============ 会议预订 ============
  const openMeetingModal = (roomId?: string) => {
    meetingForm.resetFields();
    if (roomId) meetingForm.setFieldsValue({ roomId });
    setMeetingModal(true);
  };

  const saveMeeting = async () => {
    try {
      const values = await meetingForm.validateFields();
      const room = meetingRooms.find(r => r.id === values.roomId);
      const payload = {
        ...values,
        id: `mt_${Date.now()}`,
        organizer: '张明辉',
        organizerId: 'emp-1',
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      const res = await fetch('/api/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        messageApi.success('会议已预订');
        setMeetingModal(false);
        loadAll();
      }
    } catch {}
  };

  // ============ 列定义 ============
  const folderColumns = [
    { title: '文件夹名称', dataIndex: 'name', key: 'name' },
    { title: '权限', dataIndex: 'permission', key: 'permission', render: (v: string) => ({ all: '全员可见', department: '部门可见', role: '角色可见' }[v] || v) },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v?.slice(0, 10) },
    { title: '操作', key: 'action', width: 150, render: (_: any, r: DocumentFolder) => (
      <Space size="small">
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openFolderModal(r)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => deleteFolder(r.id)}>
          <Button size="small" danger type="link" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )}
  ];

  const roomColumns = [
    { title: '会议室名称', dataIndex: 'name', key: 'name' },
    { title: '容量', dataIndex: 'capacity', key: 'capacity', render: (v: number) => `${v}人` },
    { title: '位置', dataIndex: 'location', key: 'location' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'available' ? 'green' : 'red'}>{v === 'available' ? '可用' : '占用'}</Tag> },
    { title: '操作', key: 'action', width: 200, render: (_: any, r: MeetingRoom) => (
      <Space size="small">
        <Button size="small" type="link" onClick={() => openMeetingModal(r.id)}>预订</Button>
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openRoomModal(r)} />
        <Popconfirm title="确认删除？" onConfirm={() => deleteRoom(r.id)}>
          <Button size="small" danger type="link" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )}
  ];

  const meetingColumns = [
    { title: '会议主题', dataIndex: 'title', key: 'title' },
    { title: '会议室', dataIndex: 'roomId', key: 'room', render: (v: string) => meetingRooms.find(r => r.id === v)?.name || v },
    { title: '组织者', dataIndex: 'organizer', key: 'organizer' },
    { title: '开始时间', dataIndex: 'startTime', key: 'start', render: (v: string) => v?.slice(0, 16) },
    { title: '结束时间', dataIndex: 'endTime', key: 'end', render: (v: string) => v?.slice(0, 16) },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'scheduled' ? 'blue' : v === 'completed' ? 'green' : 'default'}>{v === 'scheduled' ? '已安排' : v === 'completed' ? '已完成' : v}</Tag> }
  ];

  const supplyColumns = [
    { title: '物品名称', dataIndex: 'name', key: 'name' },
    { title: '类别', dataIndex: 'category', key: 'category' },
    { title: '库存', dataIndex: 'stock', key: 'stock', render: (v: number, r: Supply) => <span style={{ color: v < (r.safetyStock || 10) ? '#ff4d4f' : '#52c41a' }}>{v} {r.unit || '个'}</span> },
    { title: '单价', dataIndex: 'price', key: 'price', render: (v: number) => `¥${fmt(v)}` },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
    { title: '操作', key: 'action', width: 200, render: (_: any, r: Supply) => (
      <Space size="small">
        <Button size="small" type="link" onClick={() => openRequestModal(r)}>领用</Button>
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openSupplyModal(r)} />
        <Popconfirm title="确认删除？" onConfirm={() => deleteSupply(r.id)}>
          <Button size="small" danger type="link" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )}
  ];

  const requestColumns = [
    { title: '物品名称', dataIndex: 'supplyName', key: 'name' },
    { title: '数量', dataIndex: 'quantity', key: 'qty' },
    { title: '申请人', dataIndex: 'requesterName', key: 'requester' },
    { title: '用途', dataIndex: 'purpose', key: 'purpose' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'approved' ? 'green' : v === 'pending' ? 'orange' : 'red'}>{v === 'approved' ? '已批准' : v === 'pending' ? '待审批' : '已拒绝'}</Tag> },
    { title: '操作', key: 'action', width: 100, render: (_: any, r: SupplyRequest) => r.status === 'pending' && <Button size="small" type="link" onClick={() => approveRequest(r.id)}>批准</Button> }
  ];

  const announcementColumns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '发布人', dataIndex: 'publisher', key: 'publisher' },
    { title: '发布日期', dataIndex: 'publishDate', key: 'date', render: (v: string) => v?.slice(0, 10) },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'published' ? 'green' : 'default'}>{v === 'published' ? '已发布' : v}</Tag> },
    { title: '阅读量', dataIndex: 'viewCount', key: 'views' },
    { title: '操作', key: 'action', width: 100, render: (_: any, r: Announcement) => <Button size="small" type="link" onClick={() => setAnnouncementDetail(r)}>查看</Button> }
  ];

  const surveyColumns = [
    { title: '问卷标题', dataIndex: 'title', key: 'title' },
    { title: '创建者', dataIndex: 'creator', key: 'creator' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v?.slice(0, 10) },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '进行中' : '已结束'}</Tag> },
    { title: '题目数', dataIndex: 'questionCount', key: 'questions' },
    { title: '回复数', dataIndex: 'responseCount', key: 'responses' }
  ];

  const tabs = [
    { key: 'documents', label: '📁 文档管理', icon: <FolderOutlined /> },
    { key: 'announcements', label: '📢 公告问卷', icon: <NotificationOutlined /> },
    { key: 'meetings', label: '📅 会议管理', icon: <CalendarOutlined /> },
    { key: 'supplies', label: '📦 办公用品', icon: <ToolOutlined /> }
  ];

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">🏢 综合事务管理</h2>
          <p className="text-sm text-muted-foreground mt-1">文档管理 · 公告问卷 · 会议预订 · 办公用品</p>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={4}><Card size="small"><Statistic title="文档数量" value={documents.length} suffix="个" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="公告数量" value={announcements.length} suffix="条" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="会议室" value={meetingRooms.length} suffix="间" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="本周会议" value={meetings.length} suffix="场" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="办公用品" value={supplies.length} suffix="种" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="待审批" value={supplyRequests.filter(r => r.status === 'pending').length} suffix="条" valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />

        {/* 文档管理 */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Space>
                <Input placeholder="搜索文档" prefix={<SearchOutlined />} allowClear style={{ width: 200 }} value={searchText} onChange={e => setSearchText(e.target.value)} />
              </Space>
              <Space>
                <Button icon={<PlusOutlined />} onClick={() => openFolderModal()}>新建文件夹</Button>
                <Button icon={<UploadOutlined />}>上传文档</Button>
              </Space>
            </div>
            <Table columns={folderColumns} dataSource={folders} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {/* 公告问卷 */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <Table columns={announcementColumns} dataSource={announcements} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
            <Divider>问卷列表</Divider>
            <Table columns={surveyColumns} dataSource={surveys} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {/* 会议管理 */}
        {activeTab === 'meetings' && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="会议室列表" size="small" extra={<Button size="small" icon={<PlusOutlined />} onClick={() => openRoomModal()}>添加</Button>}>
                  <Table columns={roomColumns} dataSource={meetingRooms} rowKey="id" loading={loading} pagination={false} size="small" />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="会议预订" size="small">
                  <Table columns={meetingColumns} dataSource={meetings} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} size="small" />
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* 办公用品 */}
        {activeTab === 'supplies' && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={16}>
                <Card title="物品库存" size="small" extra={<Button size="small" icon={<PlusOutlined />} onClick={() => openSupplyModal()}>添加物品</Button>}>
                  <Table columns={supplyColumns} dataSource={supplies} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small" />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="领用申请" size="small">
                  <Table columns={requestColumns} dataSource={supplyRequests} rowKey="id" loading={loading} pagination={false} size="small" />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* 文件夹弹窗 */}
      <Modal title={editingFolder ? '编辑文件夹' : '新建文件夹'} open={folderModal} onOk={saveFolder} onCancel={() => setFolderModal(false)} okText="保存" cancelText="取消">
        <Form form={folderForm} layout="vertical" size="small">
          <Form.Item name="name" label="文件夹名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="parentId" label="父文件夹"><Select allowClear><Option value={null}>无</Option>{folders.map(f => <Option key={f.id} value={f.id}>{f.name}</Option>)}</Select></Form.Item>
          <Form.Item name="permission" label="权限"><Select><Option value="all">全员可见</Option><Option value="department">部门可见</Option><Option value="role">角色可见</Option></Select></Form.Item>
        </Form>
      </Modal>

      {/* 会议室弹窗 */}
      <Modal title={editingRoom ? '编辑会议室' : '添加会议室'} open={roomModal} onOk={saveRoom} onCancel={() => setRoomModal(false)} okText="保存" cancelText="取消">
        <Form form={roomForm} layout="vertical" size="small">
          <Form.Item name="name" label="会议室名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="capacity" label="容量"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="location" label="位置"><Input /></Form.Item>
          <Form.Item name="equipment" label="设备"><Input placeholder="投影仪, 麦克风, 白板..." /></Form.Item>
          <Form.Item name="status" label="状态"><Select><Option value="available">可用</Option><Option value="occupied">占用</Option></Select></Form.Item>
        </Form>
      </Modal>

      {/* 办公用品弹窗 */}
      <Modal title={editingSupply ? '编辑物品' : '添加物品'} open={supplyModal} onOk={saveSupply} onCancel={() => setSupplyModal(false)} okText="保存" cancelText="取消">
        <Form form={supplyForm} layout="vertical" size="small">
          <Form.Item name="name" label="物品名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="类别"><Input /></Form.Item>
          <Form.Item name="stock" label="库存"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="unit" label="单位"><Input /></Form.Item>
          <Form.Item name="price" label="单价"><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="safetyStock" label="安全库存"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="supplier" label="供应商"><Input /></Form.Item>
        </Form>
      </Modal>

      {/* 领用申请弹窗 */}
      <Modal title="物品领用申请" open={requestModal} onOk={saveRequest} onCancel={() => setRequestModal(false)} okText="提交" cancelText="取消">
        <Form form={requestForm} layout="vertical" size="small">
          <Form.Item name="supplyId" label="物品ID" rules={[{ required: true }]}><Input disabled /></Form.Item>
          <Form.Item name="supplyName" label="物品名称"><Input disabled /></Form.Item>
          <Form.Item name="quantity" label="领用数量" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="purpose" label="用途"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="pickupTime" label="领取时间"><Input type="date" /></Form.Item>
        </Form>
      </Modal>

      {/* 会议预订弹窗 */}
      <Modal title="预订会议" open={meetingModal} onOk={saveMeeting} onCancel={() => setMeetingModal(false)} okText="预订" cancelText="取消">
        <Form form={meetingForm} layout="vertical" size="small">
          <Form.Item name="roomId" label="会议室" rules={[{ required: true }]}>
            <Select>{meetingRooms.filter(r => r.status === 'available').map(r => <Option key={r.id} value={r.id}>{r.name} ({r.capacity}人)</Option>)}</Select>
          </Form.Item>
          <Form.Item name="title" label="会议主题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="startTime" label="开始时间"><Input type="datetime-local" /></Form.Item>
          <Form.Item name="endTime" label="结束时间"><Input type="datetime-local" /></Form.Item>
          <Form.Item name="participants" label="参会人员"><Input placeholder="多人用逗号分隔" /></Form.Item>
          <Form.Item name="description" label="会议说明"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* 公告详情弹窗 */}
      <Modal title={announcementDetail?.title} open={!!announcementDetail} onCancel={() => setAnnouncementDetail(null)} footer={null} width={700}>
        {announcementDetail && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              发布人：{announcementDetail.publisher} · 发布时间：{announcementDetail.publishDate?.slice(0, 10)}
            </div>
            <Divider />
            <div dangerouslySetInnerHTML={{ __html: announcementDetail.content }} />
          </div>
        )}
      </Modal>
    </div>
  );
}
