import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  TrophyOutlined, StarOutlined
} from '@ant-design/icons';

const TABLE = 'performance_grades';
const { Option } = Select;

const DEFAULT_GRADES = ['S', 'A', 'B', 'C', 'D'];

interface IRecord { id: string; [k: string]: any }

export default function GradePage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, highestMax: 0, lowestMin: 100, avgMultiplier: 0 });

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
      const maxes = rows.map((r: any) => r.scoreMax || 0);
      const mins = rows.map((r: any) => r.scoreMin || 0);
      const mults = rows.map((r: any) => r.bonusMultiplier || 1);
      setStats({
        total: rows.length,
        highestMax: maxes.length ? Math.max(...maxes) : 0,
        lowestMin: mins.length ? Math.min(...mins) : 0,
        avgMultiplier: mults.length ? Math.round(mults.reduce((a: number, b: number) => a + b, 0) / mults.length * 100) / 100 : 0
      });
    } catch { message.error('加载数据失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search]);

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
    const body = editing ? { ...editing, ...values } : { id: `grade_${Date.now()}`, ...values, createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功');
      setModalOpen(false);
      fetchData();
    } catch { message.error('操作失败'); }
  };

  const columns = [
    { title: '等级编号', dataIndex: 'id', width: 110 },
    { title: '等级名称', dataIndex: 'name', width: 140, render: (v: string, r: any) => <Tag color={r.color || 'blue'}>{v}</Tag> },
    { title: '等级', dataIndex: 'level', width: 80, render: (v: string) => <Tag color="geekblue">{v}</Tag> },
    { title: '最低分', dataIndex: 'scoreMin', width: 100, align: 'right' as const },
    { title: '最高分', dataIndex: 'scoreMax', width: 100, align: 'right' as const },
    { title: '奖金倍数', dataIndex: 'bonusMultiplier', width: 100, align: 'right' as const, render: (v: number) => `${v}x` },
    { title: '说明', dataIndex: 'description', width: 200, ellipsis: true },
    { title: '排序', dataIndex: 'sortOrder', width: 70, align: 'center' as const },
    { title: '颜色', dataIndex: 'color', width: 80, render: (v: string) => v ? <Tag color={v}>{v}</Tag> : '-' },
    { title: '操作', width: 140, render: (_: any, r: IRecord) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        <Popconfirm title="确认删除此等级?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="等级总数" value={stats.total} prefix={<TrophyOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="最高分上限" value={stats.highestMax} valueStyle={{ color: '#3f8600' }} prefix={<StarOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="最低分下限" value={stats.lowestMin} valueStyle={{ color: '#cf1322' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="平均奖金倍数" value={stats.avgMultiplier} suffix="x" valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Card title="绩效等级管理" extra={
        <Space>
          <Input.Search placeholder="搜索等级" allowClear style={{ width: 200 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增等级</Button>
        </Space>
      }>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination}
          onChange={(p) => setPagination(p)} scroll={{ x: 1100 }} />
      </Card>

      <Modal title={editing ? '编辑绩效等级' : '新增绩效等级'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="等级名称" rules={[{ required: true }]}>
                <Input placeholder="如：S-卓越" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="level" label="等级标识" rules={[{ required: true }]}>
                <Select placeholder="选择等级">
                  {DEFAULT_GRADES.map(g => <Option key={g} value={g}>{g}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scoreMin" label="最低分" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} precision={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scoreMax" label="最高分" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} precision={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bonusMultiplier" label="奖金倍数">
                <InputNumber min={0} max={5} step={0.1} precision={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sortOrder" label="排序">
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="color" label="标识颜色">
                <Select placeholder="选择颜色" allowClear>
                  <Option value="#10B981">绿色</Option>
                  <Option value="#3B82F6">蓝色</Option>
                  <Option value="#F59E0B">橙色</Option>
                  <Option value="#8B5CF6">紫色</Option>
                  <Option value="#EF4444">红色</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="description" label="说明">
                <Input placeholder="等级描述" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
