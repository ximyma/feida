import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, Statistic, Row, Col,
  Descriptions, Drawer, Progress, Avatar, Tooltip, Badge, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  NotificationOutlined, EyeOutlined, CheckCircleOutlined,
  PushpinOutlined, ClockCircleOutlined, TeamOutlined, FileTextOutlined
} from '@ant-design/icons';

const TABLE = 'announcements';

const TYPE_OPTIONS = [
  { label: '通知公告', value: 'notice' },
  { label: '公司新闻', value: 'news' },
  { label: '人事任免', value: 'hr' },
  { label: '制度更新', value: 'policy' },
  { label: '活动通知', value: 'activity' },
  { label: '紧急通知', value: 'urgent' },
];

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', published: '已发布', archived: '已归档'
};
const STATUS_COLORS: Record<string, string> = {
  draft: 'default', published: 'green', archived: 'orange'
};
const PRIORITY_LABELS: Record<string, string> = {
  low: '低', normal: '普通', high: '高', urgent: '紧急'
};
const PRIORITY_COLORS: Record<string, string> = {
  low: 'default', normal: 'blue', high: 'orange', urgent: 'red'
};
const TYPE_LABELS: Record<string, string> = {
  notice: '通知公告', news: '公司新闻', hr: '人事任免',
  policy: '制度更新', activity: '活动通知', urgent: '紧急通知'
};

interface IRecord { id: string; [k: string]: any }

export default function AnnouncementPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<IRecord | null>(null);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [readRecords, setReadRecords] = useState<IRecord[]>([]);
  const [readLoading, setReadLoading] = useState(false);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, totalViews: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch('/api/employees');
      const json = await r.json();
      const employees = Array.isArray(json) ? json : (json.data || []);
      setTotalEmployees(employees.length);
    } catch { setTotalEmployees(0); }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pagination.current));
      params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      // Sort: pinned first, then by date
      rows.sort((a: IRecord, b: IRecord) => {
        if ((b.isPinned || 0) !== (a.isPinned || 0)) return (b.isPinned || 0) - (a.isPinned || 0);
        if ((b.isTop || 0) !== (a.isTop || 0)) return (b.isTop || 0) - (a.isTop || 0);
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setData(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
      setStats({
        total: rows.length,
        published: rows.filter((r: IRecord) => r.status === 'published').length,
        draft: rows.filter((r: IRecord) => r.status === 'draft').length,
        totalViews: rows.reduce((s: number, r: IRecord) => s + (r.readCount || 0), 0)
      });
    } catch { message.error('加载数据失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, typeFilter]);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  const fetchReadRecords = useCallback(async (annId: string) => {
    setReadLoading(true);
    try {
      const r = await fetch(`/api/announcement_reads?announcementId=${annId}`);
      const json = await r.json();
      setReadRecords(Array.isArray(json) ? json : (json.data || []));
    } catch { setReadRecords([]); }
    finally { setReadLoading(false); }
  }, []);

  const handleView = async (r: IRecord) => {
    setViewing(r);
    setDrawerOpen(true);
    await fetchReadRecords(r.id);
    // Auto-mark as read
    try {
      const user = JSON.parse(sessionStorage.getItem('__current_user') || '{}');
      await fetch(`/api/${TABLE}/${r.id}/read?employeeId=${user.employeeId || ''}&employeeName=${encodeURIComponent(user.realName || '')}`, { method: 'POST' });
      // Refresh current announcement readCount
      fetchData();
    } catch { /* silent */ }
  };

  const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (r: IRecord) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const handleDelete = async (id: string) => {
    try { await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' }); message.success('删除成功'); fetchData(); }
    catch { message.error('删除失败'); }
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const body = editing
      ? { ...editing, ...values }
      : { id: `ann_${Date.now()}`, ...values, status: 'draft', readCount: 0, publishAt: null, createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      message.success(editing ? '修改成功' : '添加成功');
      setModalOpen(false);
      fetchData();
    } catch { message.error('操作失败'); }
  };

  const handlePublish = async (id: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published', publishAt: new Date().toISOString() })
      });
      message.success('发布成功');
      fetchData();
    } catch { message.error('发布失败'); }
  };

  const handleArchive = async (id: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });
      message.success('已归档');
      fetchData();
    } catch { message.error('归档失败'); }
  };

  const handleTogglePin = async (id: string, current: number) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: current ? 0 : 1 })
      });
      fetchData();
    } catch { message.error('操作失败'); }
  };

  const readRate = totalEmployees > 0 ? Math.round((viewing?.readCount || 0) / totalEmployees * 100) : 0;

  const columns = [
    {
      title: '',
      dataIndex: 'isPinned',
      width: 40,
      render: (v: number) => v ? <PushpinOutlined style={{ color: '#faad14' }} /> : null
    },
    { title: '标题', dataIndex: 'title', width: 240, ellipsis: true,
      render: (v: string, r: IRecord) => (
        <Space>
          <Tag color={PRIORITY_COLORS[r.priority] || 'default'}>{PRIORITY_LABELS[r.priority] || '普通'}</Tag>
          <span style={{ fontWeight: 500 }}>{v}</span>
        </Space>
      )
    },
    { title: '类型', dataIndex: 'category', width: 100, render: (v: string) => TYPE_LABELS[v] || v },
    {
      title: '阅读', dataIndex: 'readCount', width: 100,
      render: (v: number, r: IRecord) => (
        <Tooltip title={`${v} / ${totalEmployees} 人阅读`}>
          <Progress
            percent={totalEmployees > 0 ? Math.round(v / totalEmployees * 100) : 0}
            size="small"
            format={() => v}
            strokeColor={readRate > 80 ? '#52c41a' : readRate > 50 ? '#1890ff' : '#faad14'}
          />
        </Tooltip>
      )
    },
    { title: '发布人', dataIndex: 'authorName', width: 90 },
    { title: '发布时间', dataIndex: 'publishAt', width: 160, render: (v: string) => v ? v.slice(0, 16) : '—' },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag> },
    {
      title: '操作', width: 220,
      render: (_: any, r: IRecord) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(r)}>查看</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Tooltip title={r.isPinned ? '取消置顶' : '置顶'}>
            <Button type="link" size="small" icon={<PushpinOutlined />} onClick={() => handleTogglePin(r.id, r.isPinned || 0)} />
          </Tooltip>
          {r.status === 'draft' && <Button type="link" size="small" onClick={() => handlePublish(r.id)}>发布</Button>}
          {r.status === 'published' && <Button type="link" size="small" onClick={() => handleArchive(r.id)}>归档</Button>}
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
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
        <Col span={6}><Card size="small"><Statistic title="公告总数" value={stats.total} prefix={<NotificationOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已发布" value={stats.published} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="草稿" value={stats.draft} valueStyle={{ color: '#faad14' }} prefix={<FileTextOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="总阅读人次" value={stats.totalViews} prefix={<EyeOutlined />} /></Card></Col>
      </Row>

      {/* 主表格 */}
      <Card extra={
        <Space wrap>
          <Input.Search placeholder="搜索标题/内容" allowClear style={{ width: 200 }}
            onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Select placeholder="类型筛选" allowClear style={{ width: 130 }}
            onChange={v => { setTypeFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}>
            {TYPE_OPTIONS.map(t => <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增公告</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, showTotal: t => `共 ${t} 条`, onChange: (p, ps) => setPagination(x => ({ ...x, current: p, pageSize: ps || 20 })) }}
          scroll={{ x: 1100 }} size="small" />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editing ? '编辑公告' : '新增公告'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={680}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'draft', category: 'notice', priority: 'normal', isPinned: 0 }}>
          <Row gutter={16}>
            <Col span={24}><Form.Item name="title" label="标题" rules={[{ required: true }]}><Input placeholder="公告标题" showCount maxLength={100} /></Form.Item></Col>
            <Col span={12}><Form.Item name="category" label="类型" rules={[{ required: true }]}><Select>{TYPE_OPTIONS.map(t => <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="priority" label="优先级"><Select><Select.Option value="low">低</Select.Option><Select.Option value="normal">普通</Select.Option><Select.Option value="high">高</Select.Option><Select.Option value="urgent">紧急</Select.Option></Select></Form.Item></Col>
            <Col span={24}><Form.Item name="content" label="内容" rules={[{ required: true }]}><Input.TextArea rows={8} placeholder="公告正文内容，支持多行文本" showCount maxLength={5000} /></Form.Item></Col>
            <Col span={8}>
              <Form.Item name="isPinned" label="置顶" valuePropName="checked">
                <Input type="checkbox" style={{ width: 60 }} />
              </Form.Item>
            </Col>
            <Col span={8}><Form.Item name="status" label="状态"><Select><Select.Option value="draft">草稿</Select.Option><Select.Option value="published">已发布</Select.Option><Select.Option value="archived">已归档</Select.Option></Select></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* 公告详情抽屉（包含阅读统计） */}
      <Drawer
        title={
          <Space>
            <NotificationOutlined />
            <span>{viewing?.title}</span>
            {viewing?.isPinned ? <Tag color="gold"><PushpinOutlined /> 置顶</Tag> : null}
          </Space>
        }
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setViewing(null); setReadRecords([]); }}
        width={600}
        extra={
          viewing?.status === 'published' && (
            <Button size="small" onClick={() => { setDrawerOpen(false); handleEdit(viewing); }}>
              <EditOutlined /> 编辑
            </Button>
          )
        }
      >
        {viewing && (
          <>
            {/* 基础信息 */}
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="类型">{TYPE_LABELS[viewing.category] || viewing.category}</Descriptions.Item>
              <Descriptions.Item label="优先级"><Tag color={PRIORITY_COLORS[viewing.priority]}>{PRIORITY_LABELS[viewing.priority] || '普通'}</Tag></Descriptions.Item>
              <Descriptions.Item label="发布人">{viewing.authorName}</Descriptions.Item>
              <Descriptions.Item label="发布时间">{viewing.publishAt?.slice(0, 16) || '—'}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={STATUS_COLORS[viewing.status]}>{STATUS_LABELS[viewing.status]}</Tag></Descriptions.Item>
              <Descriptions.Item label="总阅读">{viewing.readCount} 人次</Descriptions.Item>
            </Descriptions>

            {/* 阅读进度 */}
            <Card size="small" title={<Space><TeamOutlined /> 阅读情况</Space>} style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col span={16}>
                  <Progress
                    percent={readRate}
                    strokeColor={readRate > 80 ? '#52c41a' : readRate > 50 ? '#1890ff' : '#faad14'}
                    format={(p) => <span style={{ color: '#888', fontSize: 12 }}>{viewing.readCount} / {totalEmployees} 人（{p}%）</span>}
                  />
                </Col>
                <Col span={8}>
                  <Space>
                    <Badge status="success" text={<span style={{ fontSize: 12 }}>已读 {readRecords.length}</span>} />
                    <Badge status="default" text={<span style={{ fontSize: 12 }}>未读 {totalEmployees - readRecords.length}</span>} />
                  </Space>
                </Col>
              </Row>
              {totalEmployees > 0 && readRate < 50 && (
                <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
                  <ClockCircleOutlined /> 阅读率偏低，建议通过企业微信/邮件提醒未读员工
                </div>
              )}
            </Card>

            {/* 已读员工列表 */}
            <Card size="small" title={<Space><CheckCircleOutlined /> 已读员工列表 ({readRecords.length})</Space>} loading={readLoading} style={{ marginBottom: 16 }}>
              {readRecords.length === 0 ? (
                <div style={{ color: '#aaa', textAlign: 'center', padding: 16 }}>暂无阅读记录</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {readRecords.map((r, i) => (
                    <Tooltip key={r.id || i} title={`阅读时间: ${r.readAt?.slice(0, 16) || '—'}`}>
                      <Tag icon={<CheckCircleOutlined />} color="success" style={{ marginBottom: 4 }}>
                        {r.employeeName || r.userId}
                      </Tag>
                    </Tooltip>
                  ))}
                </div>
              )}
            </Card>

            <Divider />

            {/* 公告正文 */}
            <Card size="small" title="公告正文">
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'inherit', margin: 0, fontSize: 14, lineHeight: 1.8 }}>
                {viewing.content}
              </pre>
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
}
