import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select,
  Tag, Space, Popconfirm, message, Row, Col, Statistic, Switch, InputNumber
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  SettingOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';

const TABLE = 'attendance_rules';

const RULE_TYPES = [
  { value: '迟到', label: '迟到规则', color: 'orange' },
  { value: '早退', label: '早退规则', color: 'orange' },
  { value: '缺勤', label: '缺勤规则', color: 'red' },
  { value: '漏打卡', label: '漏打卡规则', color: 'gold' },
  { value: '加班', label: '加班规则', color: 'blue' },
];

interface IRecord {
  id: string;
  name?: string;
  type?: string;
  lateThreshold?: number;
  absentThreshold?: number;
  penaltyType?: string;
  penaltyValue?: number;
  isActive?: boolean;
  description?: string;
  [k: string]: any;
}

export default function AttendanceRulePage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');

  const stats = {
    total: data.length,
    active: data.filter(r => r.isActive).length,
    late: data.filter(r => r.type === '迟到').length,
    absent: data.filter(r => r.type === '缺勤').length,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pagination.current > 1) params.set('page', String(pagination.current));
      if (pagination.pageSize !== 20) params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('search', search);
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
  }, [pagination.current, pagination.pageSize, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ isActive: true }); setModalOpen(true); };
  const openEdit = (r: IRecord) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields();
      const url = editing ? `/api/${TABLE}/${editing.id}` : `/api/${TABLE}`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vals)
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

  const toggleActive = async (r: IRecord) => {
    try {
      await fetch(`/api/${TABLE}/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...r, isActive: !r.isActive })
      });
      message.success(r.isActive ? '已停用' : '已启用');
      fetchData();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    {
      title: '规则名称', dataIndex: 'name', key: 'name', width: 140,
      render: (v: string) => <span style={{ fontWeight: 600 }}>{v || '-'}</span>,
    },
    {
      title: '规则类型', dataIndex: 'type', key: 'type', width: 120,
      render: (v: string) => {
        const t = RULE_TYPES.find(x => x.value === v);
        return <Tag color={t?.color || 'default'}>{t?.label || v || '-'}</Tag>;
      },
    },
    {
      title: '迟到阈值(分)', dataIndex: 'lateThreshold', key: 'lateThreshold', width: 120, align: 'center' as const,
      render: (v: number) => v ? `${v} 分钟` : '-',
    },
    {
      title: '缺勤阈值(分)', dataIndex: 'absentThreshold', key: 'absentThreshold', width: 120, align: 'center' as const,
      render: (v: number) => v ? `${v} 分钟` : '-',
    },
    {
      title: '处罚类型', dataIndex: 'penaltyType', key: 'penaltyType', width: 100,
      render: (v: string) => {
        const map: Record<string, { label: string; color: string }> = {
          deduct_salary: { label: '扣薪', color: 'red' },
          deduct_leave: { label: '扣假', color: 'orange' },
          warning: { label: '警告', color: 'gold' },
        };
        const m = map[v];
        return m ? <Tag color={m.color}>{m.label}</Tag> : <Tag>{v || '-'}</Tag>;
      },
    },
    {
      title: '处罚值', dataIndex: 'penaltyValue', key: 'penaltyValue', width: 80, align: 'center' as const,
    },
    {
      title: '状态', dataIndex: 'isActive', key: 'isActive', width: 80,
      render: (v: boolean, r: IRecord) => (
        <Switch checked={!!v} onChange={() => toggleActive(r)} checkedChildren="启用" unCheckedChildren="停用" />
      ),
    },
    {
      title: '操作', key: 'action', fixed: 'right' as const, width: 140,
      render: (_: any, r: IRecord) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title="确定删除该规则？" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" hoverable><Statistic title="规则总数" value={stats.total} prefix={<SettingOutlined />} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="已启用" value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="迟到规则" value={stats.late} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="缺勤规则" value={stats.absent} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>

      <Card
        title={<span style={{ fontSize: 18, fontWeight: 600 }}>考勤规则</span>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增规则</Button>}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 16px 0' }}>
          <Space>
            <Input.Search placeholder="搜索规则名称..." value={search} onChange={e => setSearch(e.target.value)}
              onSearch={() => setPagination(p => ({ ...p, current: 1 }))} style={{ width: 240 }} allowClear />
            <Button icon={<ReloadOutlined />} onClick={() => { setPagination(p => ({ ...p, current: 1 })); fetchData(); }}>刷新</Button>
          </Space>
        </div>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, showQuickJumper: true, showTotal: (t: number) => `共 ${t} 条` }}
          onChange={pag => setPagination(p => ({ ...p, current: pag.current || 1, pageSize: pag.pageSize || 20 }))}
          scroll={{ x: 'max-content' }} size="middle" style={{ marginTop: 8 }} />
      </Card>

      <Modal title={(editing ? '编辑' : '新增') + '考勤规则'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)}
        width={700} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="规则名称" name="name" rules={[{ required: true, message: '请输入规则名称' }]}>
                <Input placeholder="如：迟到处罚规则" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="规则类型" name="type" rules={[{ required: true, message: '请选择规则类型' }]}>
                <Select placeholder="请选择" options={RULE_TYPES.map(t => ({ value: t.value, label: t.label }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="迟到阈值(分钟)" name="lateThreshold">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="迟到多少分钟算违规" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="缺勤阈值(分钟)" name="absentThreshold">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="超时多少分钟算缺勤" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="处罚类型" name="penaltyType">
                <Select placeholder="请选择处罚类型" options={[
                  { value: 'deduct_salary', label: '扣薪' },
                  { value: 'deduct_leave', label: '扣假' },
                  { value: 'warning', label: '警告' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="处罚值" name="penaltyValue">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="扣薪金额/扣假天数" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="启用状态" name="isActive" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="说明" name="description">
            <Input.TextArea rows={2} placeholder="描述该规则的详细说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
