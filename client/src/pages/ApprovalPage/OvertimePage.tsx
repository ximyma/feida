import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, InputNumber, Row, Col, Statistic,
  Drawer, Descriptions, Badge, Divider, Tooltip
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  ClockCircleOutlined, ThunderboltOutlined, UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const TABLE = 'overtime_records';

const OVERTIME_TYPES = [
  { value: '工作日加班', label: '工作日加班', color: 'blue' },
  { value: '休息日加班', label: '休息日加班', color: 'orange' },
  { value: '节假日加班', label: '节假日加班', color: 'red' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待审批', color: 'gold' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已拒绝', color: 'red' },
  cancelled: { label: '已撤销', color: 'default' },
};

interface IRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  overtimeType?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  hours?: number;
  reason?: string;
  status?: string;
  createdAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectReason?: string;
  [k: string]: any;
}

interface IEmployee {
  id: string;
  name: string;
  department?: string;
}

export default function OvertimePage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<IRecord | null>(null);

  const stats = {
    pending: data.filter(r => r.status === 'pending').length,
    approved: data.filter(r => r.status === 'approved').length,
    totalHours: data.reduce((sum, r) => sum + (Number(r.hours) || 0), 0),
    weekHours: data.filter(r => r.overtimeType === '工作日加班').reduce((s, r) => s + (Number(r.hours) || 0), 0),
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pagination.current > 1) params.set('page', String(pagination.current));
      if (pagination.pageSize !== 20) params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setData(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search, statusFilter]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?pageSize=200');
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setEmployees(rows.map((e: any) => ({
        id: e.id, name: e.name || e.employeeName, department: e.department
      })));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // 自动计算加班时长
  const handleTimeChange = () => {
    const start = form.getFieldValue('startTime');
    const end = form.getFieldValue('endTime');
    if (start && end) {
      const hours = end.diff(start, 'hour', true);
      form.setFieldsValue({ hours: hours > 0 ? Math.round(hours * 2) / 2 : 0 });
    }
  };

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'pending' });
    setModalOpen(true);
  };

  const openEdit = (r: IRecord) => {
    setEditing(r);
    form.setFieldsValue({
      ...r,
      date: r.date ? dayjs(r.date) : undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields();
      const submitData = {
        ...vals,
        date: vals.date?.format('YYYY-MM-DD'),
      };
      const url = editing ? `/api/${TABLE}/${editing.id}` : `/api/${TABLE}`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      if (res.ok) {
        message.success(editing ? '修改成功' : '新增成功');
        setModalOpen(false);
        fetchData();
      } else {
        message.error('保存失败');
      }
    } catch { /* validation error */ }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' });
    message.success('删除成功');
    fetchData();
  };

  const handleApprove = async (r: IRecord) => {
    try {
      const res = await fetch(`/api/${TABLE}/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...r, status: 'approved', approvedAt: new Date().toISOString() })
      });
      if (res.ok) {
        message.success('审批通过');
        setDrawerOpen(false);
        fetchData();
      }
    } catch {
      message.error('操作失败');
    }
  };

  const handleReject = async (r: IRecord) => {
    Modal.confirm({
      title: '拒绝加班申请',
      content: (
        <div>
          <p>确定拒绝 <strong>{r.employeeName || r.employeeId}</strong> 的加班申请？</p>
          <Input.TextArea id="overtime-reject-reason" rows={3} placeholder="请输入拒绝原因" />
        </div>
      ),
      onOk: async () => {
        const el = document.getElementById('overtime-reject-reason') as HTMLTextAreaElement;
        try {
          const res = await fetch(`/api/${TABLE}/${r.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...r, status: 'rejected', rejectReason: el?.value || '', approvedAt: new Date().toISOString() })
          });
          if (res.ok) {
            message.success('已拒绝');
            setDrawerOpen(false);
            fetchData();
          }
        } catch {
          message.error('操作失败');
        }
      },
    });
  };

  const viewDetail = (r: IRecord) => {
    setViewing(r);
    setDrawerOpen(true);
  };

  const columns = [
    {
      title: '员工', dataIndex: 'employeeName', key: 'employeeName', width: 100,
      render: (v: string, r: IRecord) => (
        <Space><UserOutlined style={{ color: '#1890ff' }} /><span>{v || r.employeeId}</span></Space>
      ),
    },
    {
      title: '加班类型', dataIndex: 'overtimeType', key: 'overtimeType', width: 110,
      render: (v: string) => {
        const t = OVERTIME_TYPES.find(x => x.value === v);
        return <Tag color={t?.color || 'default'}>{v || '-'}</Tag>;
      },
    },
    {
      title: '加班日期', dataIndex: 'date', key: 'date', width: 110,
      render: (v: string) => v ? String(v).slice(0, 10) : '-',
    },
    {
      title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 90,
    },
    {
      title: '结束时间', dataIndex: 'endTime', key: 'endTime', width: 90,
    },
    {
      title: '时长(h)', dataIndex: 'hours', key: 'hours', width: 80, align: 'center' as const,
      render: (v: number) => <span style={{ fontWeight: 600, color: '#fa8c16' }}>{v || '-'}</span>,
    },
    {
      title: '原因', dataIndex: 'reason', key: 'reason', width: 150, ellipsis: true,
      render: (v: string) => <Tooltip title={v}><span>{v || '-'}</span></Tooltip>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string) => {
        const s = STATUS_MAP[v];
        return s ? <Badge status={s.color === 'green' ? 'success' : s.color === 'red' ? 'error' : s.color === 'gold' ? 'warning' : 'default' as any} text={s.label} /> : <Tag>{v || '-'}</Tag>;
      },
    },
    {
      title: '操作', key: 'action', fixed: 'right' as const, width: 200,
      render: (_: any, r: IRecord) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => viewDetail(r)}>详情</Button>
          {r.status === 'pending' && (
            <>
              <Button type="link" size="small" style={{ color: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => handleApprove(r)}>通过</Button>
              <Button type="link" size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleReject(r)}>拒绝</Button>
            </>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic title="待审批" value={stats.pending} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic title="已通过" value={stats.approved} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic title="加班总时长" value={stats.totalHours} suffix="小时" prefix={<ThunderboltOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic title="工作日加班" value={stats.weekHours} suffix="小时" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
      </Row>

      <Card
        title={<span style={{ fontSize: 18, fontWeight: 600 }}>加班审批</span>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增加班</Button>}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 16px 0' }}>
          <Space wrap>
            <Input.Search
              placeholder="搜索员工..." value={search}
              onChange={e => setSearch(e.target.value)}
              onSearch={() => setPagination(p => ({ ...p, current: 1 }))}
              style={{ width: 220 }} allowClear
            />
            <Select
              placeholder="审批状态" value={statusFilter || undefined}
              onChange={v => { setStatusFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}
              options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
              allowClear style={{ width: 140 }}
            />
            <Button icon={<ReloadOutlined />} onClick={() => { setPagination(p => ({ ...p, current: 1 })); fetchData(); }}>刷新</Button>
          </Space>
        </div>
        <Table
          columns={columns} dataSource={data} rowKey="id" loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, showQuickJumper: true, showTotal: (t: number) => `共 ${t} 条` }}
          onChange={pag => setPagination(p => ({ ...p, current: pag.current || 1, pageSize: pag.pageSize || 20 }))}
          scroll={{ x: 'max-content' }} size="middle" style={{ marginTop: 8 }}
        />
      </Card>

      <Modal
        title={(editing ? '编辑' : '新增') + '加班申请'}
        open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)}
        width={720} okText="保存" cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="员工" name="employeeId" rules={[{ required: true, message: '请选择员工' }]}>
                <Select showSearch optionFilterProp="label" placeholder="请选择员工"
                  options={employees.map(e => ({ value: e.id, label: `${e.name}${e.department ? ' - ' + e.department : ''}` }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="加班类型" name="overtimeType" rules={[{ required: true, message: '请选择加班类型' }]}>
                <Select placeholder="请选择加班类型" options={OVERTIME_TYPES.map(t => ({ value: t.value, label: t.label }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="加班日期" name="date" rules={[{ required: true, message: '请选择日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="加班时长(小时)" name="hours" rules={[{ required: true, message: '请输入时长' }]}>
                <InputNumber style={{ width: '100%' }} min={0.5} step={0.5} placeholder="输入开始结束时间后自动计算" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="加班原因" name="reason" rules={[{ required: true, message: '请输入加班原因' }]}>
            <Input.TextArea rows={3} placeholder="请详细说明加班原因" />
          </Form.Item>
          <Form.Item label="状态" name="status" hidden><Input /></Form.Item>
        </Form>
      </Modal>

      <Drawer title="加班详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}
        extra={viewing?.status === 'pending' ? (
          <Space>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => viewing && handleApprove(viewing)}>通过</Button>
            <Button danger icon={<CloseCircleOutlined />} onClick={() => viewing && handleReject(viewing)}>拒绝</Button>
          </Space>
        ) : null}
      >
        {viewing && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="员工">{viewing.employeeName || viewing.employeeId}</Descriptions.Item>
              <Descriptions.Item label="加班类型">
                <Tag color={OVERTIME_TYPES.find(t => t.value === viewing.overtimeType)?.color || 'default'}>{viewing.overtimeType || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="加班日期">{viewing.date ? String(viewing.date).slice(0, 10) : '-'}</Descriptions.Item>
              <Descriptions.Item label="加班时长"><span style={{ fontWeight: 600, fontSize: 16 }}>{viewing.hours || '-'}</span> 小时</Descriptions.Item>
              <Descriptions.Item label="状态">
                {(() => { const s = STATUS_MAP[viewing.status || '']; return s ? <Badge status={s.color === 'green' ? 'success' : s.color === 'red' ? 'error' : s.color === 'gold' ? 'warning' : 'default' as any} text={s.label} /> : <Tag>{viewing.status || '-'}</Tag>; })()}
              </Descriptions.Item>
              <Descriptions.Item label="加班原因">{viewing.reason || '-'}</Descriptions.Item>
            </Descriptions>
            {(viewing.approvedBy || viewing.approvedAt || viewing.rejectReason) && (
              <>
                <Divider>审批信息</Divider>
                <Descriptions column={1} bordered size="small">
                  {viewing.approvedBy && <Descriptions.Item label="审批人">{viewing.approvedBy}</Descriptions.Item>}
                  {viewing.approvedAt && <Descriptions.Item label="审批时间">{String(viewing.approvedAt).slice(0, 19).replace('T', ' ')}</Descriptions.Item>}
                  {viewing.rejectReason && <Descriptions.Item label="拒绝原因"><span style={{ color: '#ff4d4f' }}>{viewing.rejectReason}</span></Descriptions.Item>}
                </Descriptions>
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
