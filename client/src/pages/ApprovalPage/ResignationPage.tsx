import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, Row, Col, Statistic,
  Drawer, Descriptions, Badge, Divider, Tooltip, Steps
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  ClockCircleOutlined, LogoutOutlined, UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const TABLE = 'employee_changes';

const CHANGE_TYPES = [
  { value: '离职', label: '离职', color: 'red' },
  { value: '转正', label: '转正', color: 'green' },
  { value: '调岗', label: '调岗', color: 'blue' },
  { value: '晋升', label: '晋升', color: 'purple' },
  { value: '降职', label: '降职', color: 'orange' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待审批', color: 'gold' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已拒绝', color: 'red' },
};

interface IRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  changeType?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  status?: string;
  fromDepartment?: string;
  toDepartment?: string;
  fromPosition?: string;
  toPosition?: string;
  approvedBy?: string;
  approvedAt?: string;
  [k: string]: any;
}

interface IEmployee {
  id: string;
  name: string;
  department?: string;
  position?: string;
}

export default function ResignationPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<IRecord | null>(null);

  const stats = {
    pending: data.filter(r => r.status === 'pending').length,
    approved: data.filter(r => r.status === 'approved').length,
    resignations: data.filter(r => r.changeType === '离职').length,
    transfers: data.filter(r => r.changeType === '调岗').length,
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
        id: e.id, name: e.name || e.employeeName,
        department: e.department, position: e.position
      })));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

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
      fromDate: r.fromDate ? dayjs(r.fromDate) : undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields();
      const submitData = { ...vals, fromDate: vals.fromDate?.format('YYYY-MM-DD') };
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
        // 启动离职申请工作流
        if (!editing) {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const savedData = await res.clone().json().catch(() => ({}));
          try {
            await fetch('/api/workflow/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                definitionId: 'wf_resignation',
                businessId: savedData.id || `resignation_${Date.now()}`,
                businessType: vals.changeType === '离职' ? 'resignation' : vals.changeType === '转正' ? 'regular' : 'transfer',
                title: `${vals.changeType}申请 - ${vals.employeeName || currentUser.realName || '员工'}`,
                applicantId: currentUser.id || vals.employeeId || '',
                applicantName: currentUser.realName || vals.employeeName || '',
                formData: submitData,
              })
            });
          } catch {}
        }
      } else {
        message.error('保存失败');
      }
    } catch { /* validation */ }
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
      if (res.ok) { message.success('审批通过'); setDrawerOpen(false); fetchData(); }
    } catch { message.error('操作失败'); }
  };

  const handleReject = async (r: IRecord) => {
    Modal.confirm({
      title: '拒绝异动申请',
      content: <Input.TextArea id="reject-reason-ec" rows={3} placeholder="请输入拒绝原因" />,
      onOk: async () => {
        const el = document.getElementById('reject-reason-ec') as HTMLTextAreaElement;
        try {
          const res = await fetch(`/api/${TABLE}/${r.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...r, status: 'rejected', rejectReason: el?.value || '', approvedAt: new Date().toISOString() })
          });
          if (res.ok) { message.success('已拒绝'); setDrawerOpen(false); fetchData(); }
        } catch { message.error('操作失败'); }
      },
    });
  };

  const viewDetail = (r: IRecord) => { setViewing(r); setDrawerOpen(true); };

  const columns = [
    {
      title: '员工', dataIndex: 'employeeName', key: 'employeeName', width: 100,
      render: (v: string, r: IRecord) => <Space><UserOutlined style={{ color: '#1890ff' }} />{v || r.employeeId}</Space>,
    },
    {
      title: '异动类型', dataIndex: 'changeType', key: 'changeType', width: 100,
      render: (v: string) => {
        const t = CHANGE_TYPES.find(x => x.value === v);
        return <Tag color={t?.color || 'default'}>{v || '-'}</Tag>;
      },
    },
    {
      title: '原部门', dataIndex: 'fromDepartment', key: 'fromDepartment', width: 100, ellipsis: true,
    },
    {
      title: '新部门', dataIndex: 'toDepartment', key: 'toDepartment', width: 100, ellipsis: true,
    },
    {
      title: '原岗位', dataIndex: 'fromPosition', key: 'fromPosition', width: 100, ellipsis: true,
    },
    {
      title: '新岗位', dataIndex: 'toPosition', key: 'toPosition', width: 100, ellipsis: true,
    },
    {
      title: '生效日期', dataIndex: 'fromDate', key: 'fromDate', width: 110,
      render: (v: string) => v ? String(v).slice(0, 10) : '-',
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
        <Col span={6}><Card size="small" hoverable><Statistic title="待审批" value={stats.pending} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="已通过" value={stats.approved} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="离职" value={stats.resignations} valueStyle={{ color: '#ff4d4f' }} prefix={<LogoutOutlined />} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="调岗" value={stats.transfers} valueStyle={{ color: '#1890ff' }} /></Card></Col>
      </Row>

      <Card
        title={<span style={{ fontSize: 18, fontWeight: 600 }}>异动审批</span>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增异动</Button>}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 16px 0' }}>
          <Space wrap>
            <Input.Search placeholder="搜索员工..." value={search} onChange={e => setSearch(e.target.value)}
              onSearch={() => setPagination(p => ({ ...p, current: 1 }))} style={{ width: 220 }} allowClear />
            <Select placeholder="异动类型" onChange={v => { setTypeFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}
              options={CHANGE_TYPES.map(t => ({ value: t.value, label: t.label }))} allowClear style={{ width: 140 }} />
            <Select placeholder="审批状态" value={statusFilter || undefined}
              onChange={v => { setStatusFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}
              options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} allowClear style={{ width: 140 }} />
            <Button icon={<ReloadOutlined />} onClick={() => { setPagination(p => ({ ...p, current: 1 })); fetchData(); }}>刷新</Button>
          </Space>
        </div>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, showQuickJumper: true, showTotal: (t: number) => `共 ${t} 条` }}
          onChange={pag => setPagination(p => ({ ...p, current: pag.current || 1, pageSize: pag.pageSize || 20 }))}
          scroll={{ x: 'max-content' }} size="middle" style={{ marginTop: 8 }} />
      </Card>

      <Modal title={(editing ? '编辑' : '新增') + '异动申请'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)}
        width={800} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="员工" name="employeeId" rules={[{ required: true, message: '请选择员工' }]}>
                <Select showSearch optionFilterProp="label" placeholder="请选择员工"
                  options={employees.map(e => ({ value: e.id, label: `${e.name}${e.department ? ' - ' + e.department : ''}` }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="异动类型" name="changeType" rules={[{ required: true, message: '请选择异动类型' }]}>
                <Select placeholder="请选择异动类型" options={CHANGE_TYPES.map(t => ({ value: t.value, label: t.label }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="原部门" name="fromDepartment"><Input placeholder="自动填充" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="新部门" name="toDepartment"><Input placeholder="请输入新部门" /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="原岗位" name="fromPosition"><Input placeholder="自动填充" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="新岗位" name="toPosition"><Input placeholder="请输入新岗位" /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="生效日期" name="fromDate" rules={[{ required: true, message: '请选择生效日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="异动原因" name="reason" rules={[{ required: true, message: '请输入原因' }]}>
            <Input.TextArea rows={3} placeholder="请详细说明异动原因" />
          </Form.Item>
          <Form.Item label="状态" name="status" hidden><Input /></Form.Item>
        </Form>
      </Modal>

      <Drawer title="异动详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}
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
              <Descriptions.Item label="异动类型">
                <Tag color={CHANGE_TYPES.find(t => t.value === viewing.changeType)?.color || 'default'}>{viewing.changeType || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="原部门 → 新部门">
                {viewing.fromDepartment || '-'} → {viewing.toDepartment || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="原岗位 → 新岗位">
                {viewing.fromPosition || '-'} → {viewing.toPosition || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="生效日期">{viewing.fromDate ? String(viewing.fromDate).slice(0, 10) : '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {(() => { const s = STATUS_MAP[viewing.status || '']; return s ? <Badge status={s.color === 'green' ? 'success' : s.color === 'red' ? 'error' : s.color === 'gold' ? 'warning' : 'default' as any} text={s.label} /> : <Tag>{viewing.status || '-'}</Tag>; })()}
              </Descriptions.Item>
              <Descriptions.Item label="异动原因">{viewing.reason || '-'}</Descriptions.Item>
            </Descriptions>
            {(viewing.approvedBy || viewing.approvedAt) && (
              <>
                <Divider>审批信息</Divider>
                <Descriptions column={1} bordered size="small">
                  {viewing.approvedBy && <Descriptions.Item label="审批人">{viewing.approvedBy}</Descriptions.Item>}
                  {viewing.approvedAt && <Descriptions.Item label="审批时间">{String(viewing.approvedAt).slice(0, 19).replace('T', ' ')}</Descriptions.Item>}
                </Descriptions>
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
