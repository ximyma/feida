import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, Row, Col, Statistic, Tooltip
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  CalendarOutlined, TeamOutlined, SwapOutlined
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
  shiftType?: string;
  date?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  [k: string]: any;
}

interface IEmployee {
  id: string;
  name: string;
  department?: string;
}

export default function ScheduleManagementPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('');
  const [employees, setEmployees] = useState<IEmployee[]>([]);

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
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search, shiftFilter]);

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
      if (res.ok) { message.success(editing ? '修改成功' : '新增成功'); setModalOpen(false); fetchData(); }
      else { message.error('保存失败'); }
    } catch { /* validation */ }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' });
    message.success('删除成功');
    fetchData();
  };

  const columns = [
    {
      title: '员工', dataIndex: 'employeeName', key: 'employeeName', width: 100,
      render: (v: string, r: IRecord) => <Space><TeamOutlined style={{ color: '#1890ff' }} />{v || r.employeeId}</Space>,
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
      title: '上班时间', dataIndex: 'startTime', key: 'startTime', width: 90,
    },
    {
      title: '下班时间', dataIndex: 'endTime', key: 'endTime', width: 90,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (v: string) => {
        const s = STATUS_MAP[v];
        return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{v || '-'}</Tag>;
      },
    },
    {
      title: '操作', key: 'action', fixed: 'right' as const, width: 140,
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

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" hoverable><Statistic title="排班总数" value={stats.total} prefix={<CalendarOutlined />} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="早班" value={stats.morning} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="中班" value={stats.afternoon} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="晚班" value={stats.night} valueStyle={{ color: '#722ed1' }} /></Card></Col>
      </Row>

      <Card
        title={<span style={{ fontSize: 18, fontWeight: 600 }}>排班管理</span>}
        extra={
          <Space>
            <Button icon={<SwapOutlined />}>批量排班</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增排班</Button>
          </Space>
        }
        styles={{ body: { padding: 0 } }}
      >
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
          scroll={{ x: 'max-content' }} size="middle" style={{ marginTop: 8 }} />
      </Card>

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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="上班时间" name="startTime"><Input placeholder="如 09:00" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="下班时间" name="endTime"><Input placeholder="如 18:00" /></Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
