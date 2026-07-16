/**
 * 低代码平台 — 建模块→建表→建菜单→一键运行
 *
 * 4步向导:
 *   1. 模块信息 (名称/描述)
 *   2. 设计数据表 (添加字段:名称/类型/必填/默认值)
 *   3. 配置菜单 (表单预览+导航)
 *   4. 部署运行
 */
import React, { useState, useEffect } from 'react';
import { Steps, Card, Button, Input, Form, Select, Table, Space, Tag, message, Popconfirm, Divider, Typography, Descriptions, Tooltip, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckOutlined, RocketOutlined, TableOutlined, MenuOutlined, FormOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const BASE = '/api';

const FIELD_TYPES = [
  { label: '文本 (char)', value: 'char' },
  { label: '长文本 (text)', value: 'text' },
  { label: '整数 (integer)', value: 'integer' },
  { label: '小数 (float)', value: 'float' },
  { label: '布尔 (boolean)', value: 'boolean' },
  { label: '日期 (date)', value: 'date' },
  { label: '日期时间 (datetime)', value: 'datetime' },
  { label: '下拉选择 (selection)', value: 'selection' },
  { label: '关联表 (many2one)', value: 'many2one' },
];

interface FieldDef { name: string; type: string; label: string; required: boolean; default?: any }

const LowCodeBuilder: React.FC = () => {
  const [step, setStep] = useState(0);
  // Step 1: 模块
  const [moduleName, setModuleName] = useState('');
  const [tableName, setTableName] = useState('');
  const [tableDesc, setTableDesc] = useState('');
  // Step 2: 字段
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [fieldForm] = Form.useForm();
  // Step 3: 菜单
  const [menuLabel, setMenuLabel] = useState('');
  const [deployed, setDeployed] = useState(false);
  const [creating, setCreating] = useState(false);

  // 同步菜单名称
  useEffect(() => { if (!menuLabel) setMenuLabel(tableDesc || tableName); }, [tableDesc, tableName]);

  const addField = () => {
    const vals = fieldForm.getFieldsValue();
    if (!vals.fname || !vals.ftype) { message.warning('填写字段名和类型'); return; }
    const exists = fields.find(f => f.name === vals.fname);
    if (exists) { message.warning('字段名重复'); return; }
    setFields([...fields, { name: vals.fname, type: vals.ftype, label: vals.flabel || vals.fname, required: vals.frequired || false, default: vals.fdefault }]);
    fieldForm.resetFields();
  };

  const removeField = (name: string) => setFields(fields.filter(f => f.name !== name));

  const handleDeploy = async () => {
    if (!moduleName || !tableName) { message.error('先填写模块名和表名'); return; }
    if (fields.length === 0) { message.error('至少添加一个字段'); return; }
    setCreating(true);
    try {
      // 构建模型定义
      const fieldMap: Record<string, any> = {};
      fields.forEach(f => {
        const fd: any = { type: f.type, label: f.label || f.name, required: f.required };
        if (f.default !== undefined && f.default !== null && f.default !== '') fd.default = f.default;
        fieldMap[f.name] = fd;
      });
      const modelDef = { _name: tableName, _description: tableDesc || tableName, _fields: fieldMap };

      // Step1: 创建模块
      const r1 = await fetch(BASE + '/lowcode/create-module', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName, models: [modelDef] }),
      });
      const j1 = await r1.json();
      if (j1.error) { message.error(j1.error); setCreating(false); return; }
      message.success(`模块 ${moduleName} 创建成功`);

      // Step2: 部署
      const r2 = await fetch(BASE + '/lowcode/deploy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName }),
      });
      const j2 = await r2.json();
      if (j2.error) { message.error(j2.error); setCreating(false); return; }

      setDeployed(true);
      message.success(`🎉 部署成功！导航菜单已配置: ${menuLabel || tableName}`);
      setStep(3);
    } catch (e: any) { message.error(e.message); }
    setCreating(false);
  };

  // 字段列表列
  const fieldCols = [
    { title: '字段名', dataIndex: 'name', key: 'name', width: 120 },
    { title: '标签', dataIndex: 'label', key: 'label', width: 100 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '必填', dataIndex: 'required', key: 'required', width: 60, render: (v: boolean) => v ? <Tag color="red">必填</Tag> : null },
    { title: '默认值', dataIndex: 'default', key: 'default', width: 80 },
    { title: '', key: 'act', width: 40, render: (_: any, rec: FieldDef) => (
      <Popconfirm title="删除?" onConfirm={() => removeField(rec.name)}>
        <Button type="link" danger size="small" icon={<DeleteOutlined />} />
      </Popconfirm>
    )},
  ];

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Title level={3}><RocketOutlined /> 低代码平台</Title>
      <Steps current={step} onChange={setStep} style={{ marginBottom: 32 }} items={[
        { title: '模块信息', icon: <FormOutlined /> },
        { title: '设计数据表', icon: <TableOutlined /> },
        { title: '配置菜单', icon: <MenuOutlined /> },
        { title: '运行', icon: <RocketOutlined /> },
      ]} />

      {/* Step 0: 模块信息 */}
      {step === 0 && (
        <Card title="第1步: 新建模块">
          <Form layout="vertical">
            <Form.Item label="模块技术名(英文)" required extra="例: my_crm — 用于 addons/ 目录和文件命名">
              <Input placeholder="my_crm" value={moduleName} onChange={e => setModuleName(e.target.value.replace(/[^a-z0-9_]/g, ''))} />
            </Form.Item>
            <Form.Item label="数据表名(英文)" required extra="例: my_task — 数据库表名，自动 CREATE TABLE">
              <Input placeholder="my_task" value={tableName} onChange={e => setTableName(e.target.value.replace(/[^a-z0-9_]/g, ''))} />
            </Form.Item>
            <Form.Item label="表描述(中文)" extra="用于前端页面标题">
              <Input placeholder="任务管理" value={tableDesc} onChange={e => setTableDesc(e.target.value)} />
            </Form.Item>
            <Button type="primary" onClick={() => { if (!moduleName || !tableName) { message.warning('填写完成'); return; } setStep(1); }}>
              下一步: 设计字段
            </Button>
          </Form>
        </Card>
      )}

      {/* Step 1: 设计数据表 */}
      {step === 1 && (
        <Card title={`第2步: 设计字段 — ${tableName || '(未命表)'}`} extra={<Tag>{fields.length} 个字段</Tag>}>
          <Form form={fieldForm} layout="inline" style={{ marginBottom: 16, gap: 8 }}>
            <Form.Item name="fname" rules={[{ required: true }]}>
              <Input placeholder="字段名(title)" style={{ width: 130 }} />
            </Form.Item>
            <Form.Item name="flabel">
              <Input placeholder="标签(标题)" style={{ width: 110 }} />
            </Form.Item>
            <Form.Item name="ftype" initialValue="char">
              <Select options={FIELD_TYPES} style={{ width: 140 }} placeholder="类型" />
            </Form.Item>
            <Form.Item name="frequired" valuePropName="checked">
              <Select options={[{ label: '可选', value: false }, { label: '必填', value: true }]} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item name="fdefault">
              <Input placeholder="默认值" style={{ width: 80 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<PlusOutlined />} onClick={addField}>添加字段</Button>
            </Form.Item>
          </Form>
          <Table dataSource={fields} columns={fieldCols} rowKey="name" size="small" pagination={false}
            locale={{ emptyText: '暂无字段，请添加上方添加' }} />
          <Divider />
          <Space>
            <Button onClick={() => setStep(0)}>上一步</Button>
            <Button type="primary" disabled={fields.length === 0} onClick={() => setStep(2)}>下一步: 配置菜单</Button>
          </Space>
        </Card>
      )}

      {/* Step 2: 配置菜单 */}
      {step === 2 && (
        <Card title="第3步: 配置菜单 + 预览">
          <Form layout="vertical">
            <Form.Item label="菜单名称" extra="显示在左侧「更多应用」栏目">
              <Input placeholder="任务管理" value={menuLabel} onChange={e => setMenuLabel(e.target.value)} />
            </Form.Item>
            <Form.Item label="表单预览">
              <Card size="small" style={{ background: '#fafafa' }}>
                <Title level={5}>{tableDesc || tableName}</Title>
                <Descriptions column={2} size="small">
                  {fields.map(f => (
                    <Descriptions.Item key={f.name} label={f.label || f.name}>
                      <Tag>{f.type}</Tag> {f.required && <Tag color="red">必填</Tag>}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
                <Text type="secondary">
                  运行后可在「更多应用 → {menuLabel || tableName}」访问
                </Text>
              </Card>
            </Form.Item>
          </Form>
          <Divider />
          <Space>
            <Button onClick={() => setStep(1)}>上一步: 修改字段</Button>
            <Button type="primary" icon={<RocketOutlined />} loading={creating} onClick={handleDeploy}>
              一键部署运行
            </Button>
          </Space>
        </Card>
      )}

      {/* Step 3: 完成 */}
      {step === 3 && (
        <Card title={deployed ? '✅ 部署成功！' : '部署中...'} style={{ textAlign: 'center' }}>
          <RocketOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
          <Title level={4}>{tableDesc || tableName}</Title>
          <Descriptions column={1} style={{ maxWidth: 400, margin: '0 auto 24px' }}>
            <Descriptions.Item label="模块">{moduleName}</Descriptions.Item>
            <Descriptions.Item label="表名">{tableName}</Descriptions.Item>
            <Descriptions.Item label="字段数">{fields.length}</Descriptions.Item>
            <Descriptions.Item label="菜单">
              <Tag color="blue">{menuLabel || tableName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="文件位置">addons/{moduleName}/</Descriptions.Item>
          </Descriptions>
          <Space size="middle">
            <Button type="primary" size="large" icon={<RocketOutlined />}
              onClick={() => window.open(`/addon/${moduleName}/${tableName}`, '_self')}>
              进入运行界面
            </Button>
            <Button size="large" onClick={() => { setStep(0); setFields([]); setModuleName(''); setTableName(''); setTableDesc(''); setDeployed(false); }}>
              继续新建模块
            </Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default LowCodeBuilder;
