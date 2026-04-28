import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, Row, Col, Statistic, Tabs, Alert
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  CalendarOutlined, TeamOutlined, CopyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const TABLE = 'schedules';

const SHIFT_MAP: Record<string, { label: string; color: string }> = {
  morning: { label: '早班', color: 'blue' },
  afternoon: { label: '中班', color: 'orange' },
  night: { label: '晚班', color: 'purple' },
  day_off: { label: '休息', color: 'default' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  scheduled: { label: '已排班', color: 'blue' },
  normal: { label: '正常', color: 'green' },
  late: { label: '迟到', color: 'orange' },
  absent: { label: '缺勤', color: 'red' },
  leave: { label: '请假', color: 'gold' },
};

interface IRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  shiftType?: string;
  date?: string;
  status?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  [k: string]: any;
}

interface IEmployee {
  id: string;
  name: string;
  department?: string;
  entryDate?: string;
}

interface ShiftType {
  id: string;
  name: string;
  kind: string;
  startTime: string;
  endTime: string;
  workHours: number;
}

interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  year: string;
  leaveType: string;
  totalDays: number;
  usedDays: number;
  availableDays: number;
}

interface AnnualLeaveRule {
  baseDays: number;
  incrementPerYear: number;
  maxDays: number;
  maxCarryOver: number;
}

export default function ScheduleManagementPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [leaveForm] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('');
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [annualRule, setAnnualRule] = useState<AnnualLeaveRule>({ baseDays: 5, incrementPerYear: 1, maxDays: 15, maxCarryOver: 5 });
  const [messageApi, contextHolder] = message.useMessage();

  const stats = {
    total: data.length,
    morning: data.filter(r => r.shiftType === 'morning').length,
    afternoon: data.filter(r => r.shiftType === 'afternoon').length,
    night: data.filter(r => r.shiftType === 'night').length,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pagination.current > 1) params.set('page', String(pagination.current));
      if (pagination.pageSize !== 20) params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('search', search);
      if (shiftFilter) params.set('shiftType', shiftFilter);
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setData(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
    } catch {
      messageApi.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search, shiftFilter, messageApi]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?pageSize=200');
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setEmployees(rows.map((e: any) => ({
        id: e.id, name: e.name || e.employeeName, department: e.department, entryDate: e.entryDate
      })));
    } catch { /* ignore */ }
  }, []);

  const fetchShiftTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/shift-types');
      const data = await res.json();
      setShiftTypes(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, []);

  const fetchLeaveBalances = useCallback(async () => {
    try {
      const year = new Date().getFullYear().toString();
      const res = await fetch(`/api/leave/balances?year=${year}&leaveType=annual`);
      const data = await res.json();
      setLeaveBalances(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, []);

  const fetchAnnualRule = useCallback(async () => {
    try {
      const res = await fetch('/api/leave/annual-rules');
      const data = await res.json();
      setAnnualRule(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { fetchShiftTypes(); }, [fetchShiftTypes]);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };

  const openEdit = (r: IRecord) => {
    setEditing(r);
    form.setFieldsValue({ ...r, date: r.date ? dayjs(r.date) : undefined });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields();
      const submitData = { ...vals, date: vals.date?.format('YYYY-MM-DD') };
      const url = editing ? `/api/${TABLE}/${editing.id}` : `/api/${TABLE}`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      if (res.ok) { messageApi.success(editing ? '修改成功' : '新增成功'); setModalOpen(false); fetchData(); }
      else { messageApi.error('保存失败'); }
    } catch { /* validation */ }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' });
    messageApi.success('删除成功');
    fetchData();
  };

  // 批量生成排班
  const handleBatchGenerate = async () => {
    try {
      const vals = await batchForm.validateFields();
      const selected = selectedEmployees.length > 0 ? selectedEmployees : employees.slice(0, 10).map(e => e.id);
      
      const res = await fetch('/api/schedule/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeIds: selected,
          startDate: vals.dateRange?.[0]?.format('YYYY-MM-DD'),
          endDate: vals.dateRange?.[1]?.format('YYYY-MM-DD'),
          shiftTypeId: vals.shiftTypeId,
          shiftTypeName: shiftTypes.find(s => s.id === vals.shiftTypeId)?.name || '标准班',
          pattern: vals.pattern || 'daily',
          restDays: vals.restDays || [],
          overwrite: vals.overwrite || false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        messageApi.success(data.message);
        setBatchModalOpen(false);
        fetchData();
      } else {
        messageApi.error(data.message || '批量排班失败');
      }
    } catch { /* validation */ }
  };

  // 批量更新年假余额
  const handleBatchUpdateLeave = async () => {
    try {
      const vals = await leaveForm.validateFields();
      const res = await fetch('/api/leave/batch-accrual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: vals.year?.format('YYYY') || new Date().getFullYear().toString() }),
      });
      const data = await res.json();
      if (data.success) {
        messageApi.success(data.message);
        fetchLeaveBalances();
      } else {
        messageApi.error(data.message || '更新失败');
      }
    } catch { /* validation */ }
  };

  const columns = [
    {
      title: '员工', dataIndex: 'employeeName', key: 'employeeName', width: 120,
      render: (v: string, r: IRecord) => (
        <Space>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <span className="font-medium">{v || r.employeeId}</span>
        </Space>
      ),
    },
    {
      title: '部门', dataIndex: 'department', key: 'department', width: 100,
    },
    {
      title: '日期', dataIndex: 'date', key: 'date', width: 110,
      render: (v: string) => v ? String(v).slice(0, 10) : '-',
    },
    {
      title: '班次', dataIndex: 'shiftType', key: 'shiftType', width: 100,
      render: (v: string) => {
        const s = SHIFT_MAP[v];
        return <Tag color={s?.color || 'default'}>{s?.label || v || '-'}</Tag>;
      },
    },
    {
      title: '上班', dataIndex: 'scheduledStart', key: 'start', width: 80,
      render: (v: string) => v || '-',
    },
    {
      title: '下班', dataIndex: 'scheduledEnd', key: 'end', width: 80,
      render: (v: string) => v || '-',
    },
    {
      title: '操作', key: 'action', fixed: 'right' as const, width: 120,
      render: (_: any, r: IRecord) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const leaveColumns = [
    { title: '员工', dataIndex: 'employeeName', key: 'name', width: 120 },
    { title: '年度', dataIndex: 'year', key: 'year', width: 80 },
    { title: '类型', dataIndex: 'leaveType', key: 'type', width: 80, render: (v: string) => v === 'annual' ? '年假' : v },
    { title: '总额', dataIndex: 'totalDays', key: 'total', width: 80 },
    { title: '已用', dataIndex: 'usedDays', key: 'used', width: 80 },
    { title: '可用', dataIndex: 'availableDays', key: 'available', width: 80, render: (v: number) => <span className={v < 3 ? 'text-red-500' : ''}>{v}</span> },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">📅 排班管理</h1>
          <p className="text-sm text-gray-500 mt-1">批量排班、调班、年假规则联动</p>
        </div>
        <Space>
          <Button icon={<ClockCircleOutlined />} onClick={() => {
            fetchLeaveBalances();
            fetchAnnualRule();
            setLeaveModalOpen(true);
          }}>年假管理</Button>
          <Button icon={<CopyOutlined />} onClick={() => {
            fetchShiftTypes();
            batchForm.resetFields();
            setBatchModalOpen(true);
          }}>批量排班</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            fetchShiftTypes();
            openAdd();
          }}>新增排班</Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="排班总数" value={stats.total} prefix={<CalendarOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="早班" value={stats.morning} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="中班" value={stats.afternoon} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="晚班" value={stats.night} valueStyle={{ color: '#722ed1' }} /></Card></Col>
      </Row>

      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 16px 0' }}>
          <Space wrap>
            <Input.Search placeholder="搜索员工..." value={search} onChange={e => setSearch(e.target.value)}
              onSearch={() => setPagination(p => ({ ...p, current: 1 }))} style={{ width: 220 }} allowClear />
            <Select placeholder="班次" value={shiftFilter || undefined}
              onChange={v => { setShiftFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}
              options={Object.entries(SHIFT_MAP).map(([k, v]) => ({ value: k, label: v.label }))} allowClear style={{ width: 120 }} />
            <Button icon={<ReloadOutlined />} onClick={() => { setPagination(p => ({ ...p, current: 1 })); fetchData(); }}>刷新</Button>
          </Space>
        </div>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, showQuickJumper: true, showTotal: (t: number) => `共 ${t} 条` }}
          onChange={pag => setPagination(p => ({ ...p, current: pag.current || 1, pageSize: pag.pageSize || 20 }))}
          scroll={{ x: 800 }} size="middle" style={{ marginTop: 8 }} />
      </Card>

      {/* 新增/编辑排班弹窗 */}
      <Modal title={(editing ? '编辑' : '新增') + '排班'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)}
        width={600} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="员工" name="employeeId" rules={[{ required: true, message: '请选择员工' }]}>
                <Select showSearch optionFilterProp="label" placeholder="请选择员工"
                  options={employees.map(e => ({ value: e.id, label: `${e.name}${e.department ? ' - ' + e.department : ''}` }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="日期" name="date" rules={[{ required: true, message: '请选择日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="班次" name="shiftType" rules={[{ required: true, message: '请选择班次' }]}>
                <Select placeholder="请选择班次" options={Object.entries(SHIFT_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="状态" name="status">
                <Select placeholder="请选择状态" options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 批量排班弹窗 */}
      <Modal title="批量排班" open={batchModalOpen} onOk={handleBatchGenerate} onCancel={() => setBatchModalOpen(false)}
        width={600} okText="批量生成" cancelText="取消">
        <Alert message="批量排班说明" description="选择员工、日期范围和班次，系统将自动生成排班记录。支持排除休息日。" type="info" showIcon className="mb-4" />
        <Form form={batchForm} layout="vertical">
          <Form.Item label="选择员工" name="employeeIds">
            <Select mode="multiple" placeholder="选择员工（留空则选择前10名）"
              options={employees.map(e => ({ value: e.id, label: `${e.name}${e.department ? ' - ' + e.department : ''}` }))}
              onChange={v => setSelectedEmployees(v)} allowClear />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="开始日期" name={['dateRange', 0]} rules={[{ required: true, message: '请选择' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="结束日期" name={['dateRange', 1]} rules={[{ required: true, message: '请选择' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="班次" name="shiftTypeId" rules={[{ required: true, message: '请选择' }]}>
                <Select placeholder="选择班次" options={shiftTypes.map(s => ({ value: s.id, label: `${s.name} (${s.startTime}-${s.endTime})` }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="重复模式" name="pattern" initialValue="daily">
                <Select options={[
                  { value: 'daily', label: '每天' },
                  { value: 'weekly', label: '每周' },
                  { value: 'biweekly', label: '每两周' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="排除休息日" name="restDays" initialValue={[0]}>
            <Select mode="multiple" placeholder="选择排除的星期"
              options={[
                { value: 0, label: '周日' },
                { value: 1, label: '周一' },
                { value: 2, label: '周二' },
                { value: 3, label: '周三' },
                { value: 4, label: '周四' },
                { value: 5, label: '周五' },
                { value: 6, label: '周六' },
              ]} />
          </Form.Item>
          <Form.Item label="覆盖已有排班" name="overwrite" initialValue={false}>
            <Select options={[
              { value: false, label: '否（跳过已有）' },
              { value: true, label: '是（覆盖）' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 年假管理弹窗 */}
      <Modal title="年假管理" open={leaveModalOpen} onCancel={() => setLeaveModalOpen(false)}
        width={800} footer={null} cancelText="关闭">
        <Tabs items={[
          {
            key: 'balances',
            label: '年假余额',
            children: (
              <>
                <Alert
                  message={`年假规则：入职满1年享受 ${annualRule.baseDays} 天年假，以后每年增加 ${annualRule.incrementPerYear} 天，最高 ${annualRule.maxDays} 天。结转上限 ${annualRule.maxCarryOver} 天。`}
                  type="info" showIcon className="mb-4"
                />
                <Table dataSource={leaveBalances} columns={leaveColumns} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
              </>
            ),
          },
          {
            key: 'update',
            label: '批量更新',
            children: (
              <>
                <Alert message="批量更新年假余额将根据员工的入职年限重新计算年假天数。" type="warning" showIcon className="mb-4" />
                <Form form={leaveForm} layout="vertical">
                  <Form.Item label="年度" name="year" initialValue={dayjs()} rules={[{ required: true }]}>
                    <DatePicker picker="year" style={{ width: 200 }} />
                  </Form.Item>
                  <Button type="primary" onClick={handleBatchUpdateLeave}>执行批量更新</Button>
                </Form>
              </>
            ),
          },
        ]} />
      </Modal>
    </div>
  );
}
