/**
 * OdooModelBrowser — Odoo模型浏览器
 * 浏览系统Odoo模块模型，一键导入为低代码应用
 */
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Typography, Tag, Empty, Spin, message, Modal, Input, Collapse, Table } from 'antd';
import { FileSearchOutlined, ImportOutlined, AppstoreOutlined, CopyOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const BASE = '/api';

interface OdooModule {
  name: string; label: string;
  models: Array<{ name: string; description: string; fields: number }>;
}

interface ModelDetail {
  module: string; model: string; description: string;
  fields: Record<string, any>;
}

const OdooModelBrowser: React.FC = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<OdooModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [detailModel, setDetailModel] = useState<ModelDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const loadModules = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/odoo/modules`);
      setModules(await r.json());
    } catch { message.error('加载失败'); }
    setLoading(false);
  };

  useEffect(() => { loadModules(); }, []);

  const showDetail = async (modelName: string) => {
    setDetailOpen(true); setDetailLoading(true);
    try {
      const r = await fetch(`${BASE}/odoo/model/${modelName}`);
      setDetailModel(await r.json());
    } catch { message.error('加载详情失败'); }
    setDetailLoading(false);
  };

  const importAsApp = async (modelName: string) => {
    setImportLoading(true);
    try {
      // 加载模型定义
      const r1 = await fetch(`${BASE}/odoo/model/${modelName}`);
      const modelDef = await r1.json();
      if (!modelDef || modelDef.error) { message.error('未找到模型'); setImportLoading(false); return; }

      // 转换为FieldDef并创建应用
      const fields = modelDef.fields || {};
      const fieldList = Object.entries(fields).filter(([k]) => k !== 'id').map(([name, def]: [string, any]) => ({
        name, type: def.type || 'char', label: def.label || name, required: !!def.required,
      }));

      const moduleName = 'app_odoo_' + modelName.replace(/\./g, '_');
      const models = [{
        _name: modelName,
        _description: modelDef.description || modelName,
        _fields: Object.fromEntries(fieldList.map(f => [f.name, { type: f.type, label: f.label, required: f.required }])),
      }];

      const r2 = await fetch(`${BASE}/lowcode/create-module`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName, models }),
      });
      const j2 = await r2.json();
      if (j2.error) { message.error(j2.error); setImportLoading(false); return; }

      // 保存app.json
      const appConfig = {
        name: modelDef.description || modelName, description: '从Odoo模型导入: ' + modelName,
        icon: '📦', color: '#1677ff',
        menu: [{ label: modelDef.description || modelName, table: modelName, icon: '📋', desc: modelDef.description || '' }],
      };
      await fetch(`${BASE}/lowcode/save-app-config`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName, config: appConfig }),
      });

      // 部署
      await fetch(`${BASE}/lowcode/deploy`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName }),
      });

      message.success({ content: `已导入 "${modelDef.description || modelName}" (${fieldList.length}字段)。请按 F5 刷新后在应用管理中查看`, duration: 6 });
    } catch (e: any) { message.error(e.message); }
    setImportLoading(false);
  };

  const filtered = modules
    .filter(m => !search || m.label.includes(search) || m.models.some(md => md.name.includes(search) || md.description.includes(search)))
    .sort((a, b) => a.label.localeCompare(b.label));

  const totalModels = modules.reduce((s, m) => s + m.models.length, 0);
  const totalFields = modules.reduce((s, m) => s + m.models.reduce((ss, md) => ss + md.fields, 0), 0);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={3}><AppstoreOutlined /> Odoo 模型浏览器</Title>
          <Text type="secondary">浏览 {modules.length} 个模块的 {totalModels} 个模型（{totalFields} 字段），一键导入为低代码应用</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadModules}>刷新</Button>
          <Button type="primary" icon={<EyeOutlined />} onClick={() => navigate('/apps-manager')}>应用管理</Button>
        </Space>
      </div>

      <Input.Search placeholder="搜索模块或模型..." allowClear onSearch={setSearch} style={{ marginBottom: 16, maxWidth: 400 }} />

      {loading ? <Spin size="large" style={{ display: 'block', margin: '60px auto' }} /> :
       filtered.length === 0 ? <Empty description="无匹配结果" /> : (
        <Collapse activeKey={expanded} onChange={keys => setExpanded(keys as string[])}>
          {filtered.map(mod => (
            <Collapse.Panel key={mod.name} header={
              <Space>
                <strong>{mod.label}</strong>
                <Tag>{mod.models.length} 模型</Tag>
                <Tag color="blue">{mod.models.reduce((s, m) => s + m.fields, 0)} 字段</Tag>
              </Space>
            }>
              <Table dataSource={mod.models} rowKey="name" size="small" pagination={false}
                columns={[
                  { title: '模型名', dataIndex: 'name', key: 'name', render: (v: string) => <Text code>{v}</Text> },
                  { title: '描述', dataIndex: 'description', key: 'desc', ellipsis: true },
                  { title: '字段数', dataIndex: 'fields', key: 'fields', width: 80, align: 'center' as const, render: (v: number) => <Tag color="green">{v}</Tag> },
                  { title: '操作', key: 'actions', width: 200,
                    render: (_: any, record: any) => (
                      <Space size={4}>
                        <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(record.name)}>字段</Button>
                        <Button size="small" type="primary" icon={<ImportOutlined />} loading={importLoading}
                          onClick={() => importAsApp(record.name)}>导入</Button>
                      </Space>
                    )
                  },
                ]}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
      )}

      <Modal title={`模型详情: ${detailModel?.model || ''}`} open={detailOpen} onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => { setDetailOpen(false); importAsApp(detailModel?.model || ''); }} type="primary" icon={<ImportOutlined />} loading={importLoading}>导入为应用</Button>}
        width={700}>
        {detailLoading ? <Spin /> : detailModel && (
          <Table dataSource={Object.entries(detailModel.fields).map(([name, def]: any) => ({ name, ...def }))}
            rowKey="name" size="small" pagination={{ pageSize: 20 }}
            columns={[
              { title: '字段名', dataIndex: 'name', render: (v: string) => <Text code>{v}</Text> },
              { title: '类型', dataIndex: 'type', width: 100, render: (v: string) => <Tag>{v}</Tag> },
              { title: '标签', dataIndex: 'label', ellipsis: true },
              { title: '必填', dataIndex: 'required', width: 60, render: (v: any) => v ? <Tag color="red">是</Tag> : null },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default OdooModelBrowser;
