/**
 * Addon 模块运行界面 — 通用模型 CRUD 页面
 *
 * 从 URL 读取模块名+模型名,自动生成:
 *   - 数据列表 (Table)
 *   - 创建/编辑表单 (Modal)
 *   - 字段浏览 (FieldDefs)
 *
 * 路由: /addon/:addon/:model?tab=data|schema
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Tabs, Card, Button, Space, Tag, message, Modal, Form, Input, Select, Popconfirm, Tooltip, Descriptions, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, EyeOutlined, TableOutlined } from '@ant-design/icons';

const { Text } = Typography;
const BASE = '/api';

interface FieldDef { name: string; type: string; label: string; required: boolean; selection?: Array<{label:string;value:string}> }

const ModuleRunPage: React.FC = () => {
  const { addon, model } = useParams<{ addon: string; model: string }>();
  const navigate = useNavigate();
  const [fieldDefs, setFieldDefs] = useState<FieldDef[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'data'|'schema'>('data');
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    if (!model) return;
    setLoading(true);
    try {
      const [fRes, dRes] = await Promise.all([
        fetch(`${BASE}/model/${model}/fields`),
        fetch(`${BASE}/model/${model}/search?limit=100`),
      ]);
      const fJson = await fRes.json();
      const dJson = await dRes.json();
      setFieldDefs(Array.isArray(fJson.fields) ? fJson.fields : []);
      setData(Array.isArray(dJson.data) ? dJson.data : []);
    } catch { message.error('加载数据失败'); }
    setLoading(false);
  }, [model]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const url = editRecord
        ? `${BASE}/model/${model}/write/${editRecord.id}`
        : `${BASE}/model/${model}/create`;
      const res = await fetch(url, {
        method: editRecord ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.error) { message.error(typeof json.error === 'string' ? json.error : '操作失败'); return; }
      message.success(editRecord ? '更新成功' : '创建成功');
      setModalOpen(false); form.resetFields(); setEditRecord(null);
      loadData();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${BASE}/model/${model}/unlink/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.error) { message.error(json.error); return; }
    message.success('删除成功');
    loadData();
  };

  const handleEdit = (rec: any) => { setEditRecord(rec); form.setFieldsValue(rec); setModalOpen(true); };

  const dataColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 140, ellipsis: true },
    ...fieldDefs.slice(0, 6).map(f => ({
      title: f.label || f.name, dataIndex: f.name, key: f.name, ellipsis: true,
      render: f.type === 'boolean' ? (v: any) => <Tag color={v ? 'green' : 'default'}>{v ? '是' : '否'}</Tag> : undefined,
    })),
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', width: 160, ellipsis: true },
    { title: '操作', key: 'actions', width: 100, render: (_:any, rec:any) => (
      <Space size="small">
        <Tooltip title="编辑"><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(rec)} /></Tooltip>
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(rec.id)}>
          <Tooltip title="删除"><Button type="link" size="small" danger icon={<DeleteOutlined />} /></Tooltip>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card
        title={<Space><TableOutlined /> {addon} / {model}</Space>}
        extra={
          <Space>
            <Button icon={<PlusOutlined />} type="primary" onClick={() => { setEditRecord(null); form.resetFields(); setModalOpen(true); }}>
              新建
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>刷新</Button>
          </Space>
        }
      >
        <Descriptions size="small" column={3} style={{ marginBottom: 12 }}>
          <Descriptions.Item label="字段数">{fieldDefs.length}</Descriptions.Item>
          <Descriptions.Item label="记录数">{data.length}</Descriptions.Item>
          <Descriptions.Item label="来源">addons/{addon}/</Descriptions.Item>
        </Descriptions>

        <Tabs activeKey={activeTab} onChange={(k: any) => setActiveTab(k)} items={[
          { key: 'data', label: `数据 (${data.length})`,
            children: <Table dataSource={data} columns={dataColumns} rowKey="id" size="small" scroll={{x:800}} loading={loading}
              pagination={{ pageSize: 15, size: 'small', showSizeChanger: false, showTotal: (t,r)=>`${r[0]}-${r[1]} / ${t}` }} /> },
          { key: 'schema', label: `字段定义 (${fieldDefs.length})`,
            children: <Table dataSource={fieldDefs} rowKey="name" size="small" pagination={false}
              columns={[
                { title: '字段名', dataIndex: 'name', width: 160 },
                { title: '标签', dataIndex: 'label' },
                { title: '类型', dataIndex: 'type', render: (v:string)=><Tag color="blue">{v}</Tag> },
                { title: '必填', dataIndex: 'required', width: 60, render: (v:boolean)=>v?<Tag color="red">必填</Tag>:null },
              ]} /> },
        ]} />
      </Card>

      <Modal title={(editRecord?'编辑':'新建')+` — ${model}`} open={modalOpen} onOk={handleSubmit}
        onCancel={()=>{setModalOpen(false);setEditRecord(null);form.resetFields()}} width={600}>
        <Form form={form} layout="vertical">
          {fieldDefs.slice(0, 12).map(f => (
            <Form.Item key={f.name} name={f.name} label={f.label||f.name}
              rules={f.required?[{required:true,message:`${f.label} 为必填`}]:[]}>
              {f.type === 'selection' && f.selection
                ? <Select allowClear options={f.selection.map(s=>({label:s.label,value:s.value}))} />
                : f.type === 'boolean'
                ? <Select options={[{label:'是',value:'1'},{label:'否',value:'0'}]} />
                : f.type === 'float' || f.type === 'integer'
                ? <Input type="number" />
                : <Input />}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default ModuleRunPage;
