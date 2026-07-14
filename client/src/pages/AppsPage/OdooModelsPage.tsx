/**
 * Odoo 模型管理后台 — 模型列表/字段浏览/数据CRUD/导入
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tabs, Card, Button, Space, Tag, message, Modal, Form, Input, Select, Popconfirm, Typography, Divider, Descriptions, Tooltip, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, SearchOutlined, TableOutlined, ImportOutlined, KeyOutlined, FieldNumberOutlined, EyeOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const BASE = '/api';

interface ModelInfo { name: string; description: string; fields: number; tableRows?: number }
interface FieldDef { name: string; type: string; label: string; required: boolean; selection?: Array<{ label: string; value: string }> }
interface ColumnInfo { name: string; type: string }

const OdooModelsPage: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [fieldDefs, setFieldDefs] = useState<FieldDef[]>([]);
  const [schemaColumns, setSchemaColumns] = useState<ColumnInfo[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<'schema'|'data'>('data');

  // 加载模型列表
  const loadModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/model/list`);
      const json = await res.json();
      const list: ModelInfo[] = Array.isArray(json) ? json : [];
      // 获取每个模型的行数
      const enriched: ModelInfo[] = [];
      for (const m of list) {
        try {
          const r = await fetch(`${BASE}/model/${m.name}/count`);
          const c = await r.json();
          enriched.push({ ...m, tableRows: c.count });
        } catch { enriched.push({ ...m, tableRows: -1 }); }
      }
      setModels(enriched);
    } catch (e) { message.error('加载模型列表失败'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadModels(); }, [loadModels]);

  // 加载选定模型的字段+数据
  const loadModelDetails = useCallback(async (modelName: string) => {
    setSelectedModel(modelName);
    setDataLoading(true);
    try {
      // 字段定义
      const fRes = await fetch(`${BASE}/model/${modelName}/fields`);
      const fJson = await fRes.json();
      setFieldDefs(Array.isArray(fJson.fields) ? fJson.fields : []);
      // 数据库实际列
      const sRes = await fetch(`${BASE}/model/${modelName}/schema`);
      const sJson = await sRes.json();
      setSchemaColumns(Array.isArray(sJson.columns) ? sJson.columns : []);
      // 数据
      const dRes = await fetch(`${BASE}/model/${modelName}/search?limit=100`);
      const dJson = await dRes.json();
      setTableData(Array.isArray(dJson.data) ? dJson.data : []);
    } catch (e) { message.error('加载模型详情失败'); }
    setDataLoading(false);
  }, []);

  // 创建/更新
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const url = editRecord
        ? `${BASE}/model/${selectedModel}/write/${editRecord.id}`
        : `${BASE}/model/${selectedModel}/create`;
      const res = await fetch(url, {
        method: editRecord ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.error) { message.error(typeof json.error === 'string' ? json.error : '操作失败'); return; }
      message.success(editRecord ? '更新成功' : '创建成功');
      setModalOpen(false);
      form.resetFields();
      setEditRecord(null);
      if (selectedModel) loadModelDetails(selectedModel);
      loadModels();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${BASE}/model/${selectedModel}/unlink/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.error) { message.error(json.error); return; }
    message.success('删除成功');
    if (selectedModel) loadModelDetails(selectedModel);
    loadModels();
  };

  const handleEdit = (rec: any) => {
    setEditRecord(rec);
    form.setFieldsValue(rec);
    setModalOpen(true);
  };

  // 过滤模型
  const filtered = search
    ? models.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()))
    : models;
  const odooModels = filtered.filter(m => m.name.startsWith('res_') || m.name.startsWith('ir_') || m.name.startsWith('change_') || m.name.startsWith('server_'));
  const nativeModels = filtered.filter(m => !odooModels.includes(m));

  // 动态生成列（基于fieldDefs）
  const dataColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 140, ellipsis: true },
    ...fieldDefs.slice(0, 6).map(f => ({
      title: f.label || f.name,
      dataIndex: f.name,
      key: f.name,
      ellipsis: true,
      render: f.type === 'boolean' ? (v: any) => <Tag color={v ? 'green' : 'default'}>{v ? '是' : '否'}</Tag> : undefined,
    })),
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', width: 160 },
  ];

  // Schema 列
  const schemaCols = [
    { title: '列名', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag>{v}</Tag> },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card
        title={<Space><TableOutlined /> Odoo 模型管理 ({models.length} 个模型)</Space>}
        extra={<Button icon={<ReloadOutlined />} onClick={loadModels} loading={loading}>刷新</Button>}
      >
        <Input.Search
          placeholder="搜索模型名或描述..."
          allowClear
          onSearch={setSearch}
          style={{ marginBottom: 16, maxWidth: 400 }}
          prefix={<SearchOutlined />}
        />

        <Row gutter={24}>
          {/* 左侧：模型列表 */}
          <Col span={10}>
            <Card size="small" title="模型列表" style={{ maxHeight: '70vh', overflow: 'auto' }}>
              <div style={{ marginBottom: 8 }}>
                <Tag color="blue">Odoo导入: {odooModels.length}</Tag>
                <Tag color="green">飞达原生: {nativeModels.length}</Tag>
              </div>
              {filtered.map(m => (
                <div
                  key={m.name}
                  onClick={() => loadModelDetails(m.name)}
                  style={{
                    padding: '6px 10px', cursor: 'pointer', borderRadius: 4, marginBottom: 2,
                    background: selectedModel === m.name ? '#e6f7ff' : 'transparent',
                    borderLeft: selectedModel === m.name ? '3px solid #1890ff' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size={4}>
                      <Text strong>{m.name}</Text>
                      {m.name.startsWith('res_') || m.name.startsWith('ir_') ? (
                        <Tag color="orange" style={{ fontSize: 10, lineHeight: '14px' }}>Odoo</Tag>
                      ) : null}
                    </Space>
                    <Space size={8}>
                      <Text type="secondary" style={{ fontSize: 12 }}>{m.fields} 字段</Text>
                      {m.tableRows !== undefined && m.tableRows >= 0 && (
                        <Tag style={{ fontSize: 10 }}>{m.tableRows} 行</Tag>
                      )}
                    </Space>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{m.description}</Text>
                </div>
              ))}
            </Card>
          </Col>

          {/* 右侧：模型详情 */}
          <Col span={14}>
            {selectedModel ? (
              <Card
                size="small"
                title={<Space><TableOutlined /> {selectedModel}</Space>}
                extra={
                  <Button type="primary" size="small" icon={<PlusOutlined />}
                    onClick={() => { setEditRecord(null); form.resetFields(); setModalOpen(true); }}>
                    新建记录
                  </Button>
                }
              >
                {/* 摘要 */}
                <Descriptions size="small" column={3} style={{ marginBottom: 12 }}>
                  <Descriptions.Item label={<><TableOutlined /> 字段数</>}>{fieldDefs.length}</Descriptions.Item>
                  <Descriptions.Item label={<><FieldNumberOutlined /> 列数</>}>{schemaColumns.length}</Descriptions.Item>
                  <Descriptions.Item label={<><EyeOutlined /> 记录数</>}>{tableData.length}</Descriptions.Item>
                </Descriptions>

                {/* Tabs */}
                <Tabs activeKey={activeTab} onChange={(k: any) => setActiveTab(k)} items={[
                  {
                    key: 'data', label: `数据浏览 (${tableData.length})`,
                    children: (
                      <Table
                        dataSource={tableData} columns={[
                          ...dataColumns,
                          {
                            title: '操作', key: 'actions', width: 100,
                            render: (_: any, rec: any) => (
                              <Space size="small">
                                <Tooltip title="编辑"><Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(rec)} /></Tooltip>
                                <Popconfirm title="确认删除?" onConfirm={() => handleDelete(rec.id)}>
                                  <Tooltip title="删除"><Button type="link" size="small" danger icon={<DeleteOutlined />} /></Tooltip>
                                </Popconfirm>
                              </Space>
                            ),
                          },
                        ]}
                        rowKey="id" size="small" scroll={{ x: 800 }} loading={dataLoading}
                        pagination={{ pageSize: 15, size: 'small', showSizeChanger: false, showTotal: (t, r) => `${r[0]}-${r[1]} / ${t}` }}
                      />
                    ),
                  },
                  {
                    key: 'schema', label: `字段定义 (${fieldDefs.length})`,
                    children: (
                      <Table
                        dataSource={fieldDefs}
                        columns={[
                          { title: '字段名', dataIndex: 'name', key: 'name', width: 160 },
                          { title: '标签', dataIndex: 'label', key: 'label' },
                          { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag color="blue">{v}</Tag> },
                          { title: '必填', dataIndex: 'required', key: 'required', width: 60, render: (v: boolean) => v ? <Tag color="red">必填</Tag> : null },
                        ]}
                        rowKey="name" size="small" pagination={false}
                      />
                    ),
                  },
                  ...(schemaColumns.length > 0 ? [{
                    key: 'ddl', label: `数据库列 (${schemaColumns.length})`,
                    children: (
                      <Table
                        dataSource={schemaColumns} columns={schemaCols}
                        rowKey="name" size="small" pagination={false}
                      />
                    ),
                  }] : []),
                ]} />
              </Card>
            ) : (
              <Card size="small" style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <TableOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>← 选择左侧模型查看详情和操作数据</div>
              </Card>
            )}
          </Col>
        </Row>

        {/* 创建/编辑 Modal */}
        <Modal
          title={(editRecord ? '编辑' : '新建') + ` — ${selectedModel}`}
          open={modalOpen}
          onOk={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditRecord(null); form.resetFields(); }}
          width={600}
        >
          <Form form={form} layout="vertical">
            {fieldDefs.slice(0, 12).map(f => (
              <Form.Item key={f.name} name={f.name} label={f.label || f.name} rules={f.required ? [{ required: true, message: `${f.label} 为必填` }] : []}>
                {f.type === 'selection' && f.selection ? (
                  <Select allowClear options={f.selection.map(s => ({ label: s.label, value: s.value }))} />
                ) : f.type === 'boolean' ? (
                  <Select options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]} />
                ) : f.type === 'float' || f.type === 'integer' ? (
                  <Input type="number" />
                ) : (
                  <Input />
                )}
              </Form.Item>
            ))}
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default OdooModelsPage;
