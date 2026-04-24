import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber,
  Tag, Space, Popconfirm, message, Switch, Statistic, Row, Col, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  AimOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';

const TABLE = 'kpis';
const { Option } = Select;
const { TextArea } = Input;

const CATEGORY_OPTIONS = ['财务', '运营', '研发', '销售', '人事', '综合'];
const METHOD_OPTIONS = ['manual', 'formula', 'auto'];
const METHOD_LABELS: Record<string, string> = {
  'manual': '人工评定',
  'formula': '公式计算',
  'auto': '自动采集'
};
const STATUS_COLORS: Record<string, string> = {
  'active': 'green',
  'inactive': 'default'
};

interface IRecord { id: string; [k: string]: any }

export default function KPIPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, financial: 0, ops: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pagination.current > 1) params.set('page', String(pagination.current));
      if (pagination.pageSize !== 20) params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setData(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
      setStats({
        total: rows.length,
        active: rows.filter((r: any) => r.isActive).length,
        financial: rows.filter((r: any) => r.category === '财务').length,
        ops: rows.filter((r: any) => r.category === '运营').length
      });
    } catch { message.error('加载数据失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (r: IRecord) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch { message.error('删除失败'); }
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const body = editing ? { ...editing, ...values } : { id: `kpi_${Date.now()}`, ...values, isActive: true, createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功');
      setModalOpen(false);
      fetchData();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    { title: 'KPI编号', dataIndex: 'id', width: 120 },
    { title: '指标名称', dataIndex: 'name', width: 150, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '指标分类', dataIndex: 'category', width: 100, render: (v: string) => <Tag color={v === '财务' ? 'gold' : 'cyan'}>{v}</Tag> },
    { title: '权重(%)', dataIndex: 'weight', width: 80, align: 'right' as const },
    { title: '目标值', dataIndex: 'target', width: 150 },
    { title: '评分方式', dataIndex: 'scoringMethod', width: 100, render: (v: string) => METHOD_LABELS[v] || v },
    { title: '状态', dataIndex: 'isActive', width: 80, render: (v: boolean) => <Badge status={v ? 'success' : 'default'} text={v ? '启用' : '停用'} /> },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: (v: string) => v?.slice(0, 16) },
    { title: '操作', width: 140, render: (_: any, r: IRecord) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="KPI总数" value={stats.total} prefix={<AimOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="启用数" value={stats.active} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="财务类" value={stats.financial} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="运营类" value={stats.ops} valueStyle={{ color: '#13c2c2' }} /></Card></Col>
      </Row>

      <Card title="KPI指标管理" extra={
        <Space>
          <Input.Search placeholder="搜索KPI" allowClear style={{ width: 200 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Select placeholder="分类筛选" allowClear style={{ width: 120 }} onChange={v => { setCategoryFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}>
            {CATEGORY_OPTIONS.map(c => <Option key={c} value={c}>{c}</Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增KPI</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination}
          onChange={(p) => setPagination(p)} scroll={{ x: 1200 }} />
      </Card>

      <Modal title={editing ? '编辑KPI' : '新增KPI'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="指标名称" rules={[{ required: true }]}>
                <Input placeholder="请输入指标名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="指标分类" rules={[{ required: true }]}>
                <Select placeholder="选择分类">{CATEGORY_OPTIONS.map(c => <Option key={c} value={c}>{c}</Option>)}</Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="weight" label="权重(%)" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scoringMethod" label="评分方式" rules={[{ required: true }]}>
                <Select placeholder="选择评分方式">{METHOD_OPTIONS.map(m => <Option key={m} value={m}>{METHOD_LABELS[m]}</Option>)}</Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="target" label="目标值">
                <Input placeholder="如：Bug率 < 3%，交付率 >= 90%" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="指标说明">
                <TextArea rows={3} placeholder="描述该KPI的考核标准和数据来源" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="formula" label="计算公式">
                <Input placeholder="如：得分 = (实际值/目标值) * 100" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="dataSource" label="数据来源">
                <Input placeholder="如：Bug管理系统、工时系统" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="是否启用" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
