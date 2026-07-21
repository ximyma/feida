/**
 * 低代码平台 v2 — 集成模板设计器
 *
 * 步骤:
 *   1. 应用信息 (名称/图标/描述)
 *   2. 设计数据表 (模板设计器: 40+字段画廊+拖拽+属性面板)
 *   3. 配置应用 (菜单+主页布局+多表)
 *   4. 一键发布
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Steps, Card, Button, Input, Form, Select, Space, Tag, message, Divider, Typography, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, RocketOutlined, TableOutlined, HomeOutlined, SettingOutlined, FormOutlined, AppstoreOutlined } from '@ant-design/icons';
import { TemplateDesigner, toModelFields, FieldDef } from './TemplateDesigner';

const { Title, Text } = Typography;
const BASE = '/api';
const APP_ICONS = ['📊','📋','🏪','👥','📦','💰','📅','🏥','🎓','⚙️','🏭','🚚'];

const LowCodeBuilder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editMode = searchParams.get('edit') || '';
  const [step, setStep] = useState(0);
  // Step 1
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [appIcon, setAppIcon] = useState('📊');
  const [moduleName, setModuleName] = useState('');
  // Step 2
  const [tables, setTables] = useState<Array<{ name: string; label: string; icon: string; fields: FieldDef[] }>>([
    { name: '', label: '', icon: '📋', fields: [] },
  ]);
  const [activeTableIdx, setActiveTableIdx] = useState(0);
  const [existingTables, setExistingTables] = useState<string[]>([]);
  // State
  const [creating, setCreating] = useState(false);
  const [deployed, setDeployed] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/addons/list`).then(r => r.json()).then(data => {
      const all: string[] = [];
      (data || []).forEach((g: any) => g.models?.forEach((m: any) => all.push(m.name)));
      setExistingTables(all);
    });
    // 自动生成模块名 (基于应用名)
    if (!moduleName) setModuleName('app_' + Date.now().toString(36));

    // 应用名变化时自动更新模块名(slug)
    const updateAppName = (name: string) => {
      setAppName(name);
      // 编辑模式不改变模块名(已固定)
      if (!editMode && name) {
        const slug = name.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase() || ('app_' + Date.now().toString(36));
        setModuleName(slug);
      }
    };

    // 编辑模式: 加载已有应用配置(含字段)
    if (editMode) {
      setModuleName(editMode);
      Promise.all([
        fetch(`${BASE}/apps/${editMode}/config?t=${Date.now()}`).then(r => r.json()),
        fetch(`${BASE}/addons/${editMode}/models/list?t=${Date.now()}`).then(r => r.json()).catch(() => ({ models: [] })),
      ]).then(([cfg, modelData]) => {
        setAppName(cfg.name || editMode);
        setAppDesc(cfg.description || '');
        setAppIcon(cfg.icon || '📊');
        if (cfg.menu) {
          setTables(cfg.menu.map((m: any) => {
            // 从模型数据中加载字段定义
            const model = (modelData.models || []).find((md: any) => md.name === m.table);
            let fields: FieldDef[] = [];
            if (model?.fields) {
              fields = model.fields.map((f: any, i: number) => ({
                key: `e${i}_${Date.now()}`,
                name: f.name || '',
                type: f.type || 'char',
                label: f.label || f.name || '',
                required: !!f.required,
                default: f.default,
                placeholder: f.placeholder,
                tooltip: f.description,
                selection: f.selection || f.options,
                relation: f.relation,
              }));
            }
            return { name: m.table, label: m.label, icon: m.icon || '📋', fields };
          }));
        }
      });
    }
  }, []);

  const activeTable = tables[activeTableIdx] || tables[0];
  const totalFields = tables.reduce((s, t) => s + t.fields.length, 0);
  const validTables = tables.filter(t => t.name && t.fields.length > 0);

  const addTable = () => {
    setTables([...tables, { name: '', label: '', icon: '📋', fields: [] }]);
    setActiveTableIdx(tables.length);
  };

  const removeTable = (idx: number) => {
    if (tables.length <= 1) return;
    setTables(tables.filter((_, i) => i !== idx));
    if (activeTableIdx >= tables.length - 1) setActiveTableIdx(Math.max(0, tables.length - 2));
  };

  const updateTable = (key: string, value: string) => {
    const newTables = [...tables];
    (newTables[activeTableIdx] as any)[key] = value;
    if (key === 'label' && !newTables[activeTableIdx].name) {
      newTables[activeTableIdx].name = value.replace(/[^a-z0-9_]/g, '_').toLowerCase() || '';
    }
    setTables(newTables);
  };

  const updateFields = useCallback((fields: FieldDef[]) => {
    const newTables = [...tables];
    newTables[activeTableIdx].fields = fields;
    setTables(newTables);
  }, [tables, activeTableIdx]);

  const handleDeploy = async () => {
    if (!moduleName || !appName) { message.error('填写应用名和模块名'); return; }
    if (validTables.length === 0) { message.error('至少建一个表并添加字段'); return; }
    setCreating(true);
    try {
      const models = validTables.map(t => ({
        _name: t.name,
        _description: t.label || t.name,
        _fields: toModelFields(t.fields),
      }));
      // 创建模块
      const r1 = await fetch(`${BASE}/lowcode/create-module`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName, models }),
      });
      const j1 = await r1.json();
      if (j1.error) { message.error(j1.error); setCreating(false); return; }

      // 生成 app.json (应用配置)
      const appConfig = {
        name: appName, description: appDesc, icon: appIcon, color: '#1677ff',
        menu: validTables.map(t => ({ label: t.label || t.name, table: t.name, icon: t.icon, desc: `管理${t.label || t.name}` })),
      };
      const r2 = await fetch(`${BASE}/lowcode/save-app-config`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName, config: appConfig }),
      });
      await r2.json();

      // 部署
      await fetch(`${BASE}/lowcode/deploy`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName }),
      });

      message.success(`🎉 应用「${appName}」发布成功！`);
      setDeployed(true);
      setStep(3);
    } catch (e: any) { message.error(e.message); }
    setCreating(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <Title level={3}><AppstoreOutlined /> 低代码平台</Title>

      <Steps current={step} onChange={setStep} style={{ marginBottom: 32 }} items={[
        { title: '应用信息', icon: <HomeOutlined /> },
        { title: `设计表单 (${totalFields}字段)`, icon: <FormOutlined /> },
        { title: '配置应用', icon: <SettingOutlined /> },
        { title: '完成', icon: <RocketOutlined /> },
      ]} />

      {/* Step 0: 应用信息 */}
      {step === 0 && (
        <Card title="步骤1: 应用信息">
          <Form layout="vertical" style={{ maxWidth: 500 }}>
            <Form.Item label="应用名称" required>
              <Input placeholder="客户关系管理" value={appName} onChange={e => updateAppName(e.target.value)} />
            </Form.Item>
            <Form.Item label="应用图标">
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {APP_ICONS.map(icon => (
                  <Button key={icon} type={appIcon === icon ? 'primary' : 'default'} size="small"
                    onClick={() => setAppIcon(icon)} style={{ fontSize: 18 }}>{icon}</Button>
                ))}
              </div>
            </Form.Item>
            <Form.Item label="应用描述">
              <Input.TextArea placeholder="管理客户、订单和产品..." value={appDesc} onChange={e => setAppDesc(e.target.value)} rows={2} />
            </Form.Item>
            <Form.Item label="模块名 (英文)" required extra="自动生成，用于文件目录">
              <Input value={moduleName} onChange={e => setModuleName(e.target.value.replace(/[^a-z0-9_]/g, ''))} />
            </Form.Item>
            <Button type="primary" onClick={() => { if (!appName || !moduleName) { message.warning('填写完成'); return; } setStep(1); }}>
              下一步: 设计表单
            </Button>
          </Form>
        </Card>
      )}

      {/* Step 1: 设计表单 (模板设计器) */}
      {step === 1 && (
        <Card title={<Space><FormOutlined /> 步骤2: 设计数据表</Space>}
          extra={<Space>
            {tables.map((t, i) => (
              <Button key={i} size="small" type={activeTableIdx === i ? 'primary' : 'default'}
                onClick={() => setActiveTableIdx(i)}>
                {t.icon} {t.label || `表${i + 1}`}
                {t.fields.length > 0 && <Tag style={{ marginLeft: 4, fontSize: 10 }}>{t.fields.length}f</Tag>}
              </Button>
            ))}
            <Button size="small" icon={<PlusOutlined />} onClick={addTable}>新表</Button>
            {tables.length > 1 && <Button size="small" danger onClick={() => removeTable(activeTableIdx)}>删当前表</Button>}
          </Space>}>
          <Row gutter={8} style={{ marginBottom: 12 }}>
            <Col span={8}>
              <Input size="small" addonBefore="表名" placeholder="my_table" value={activeTable.name}
                onChange={e => updateTable('name', e.target.value.replace(/[^a-z0-9_]/g, ''))} />
            </Col>
            <Col span={6}>
              <Input size="small" addonBefore="中文" placeholder="我的表" value={activeTable.label}
                onChange={e => updateTable('label', e.target.value)} />
            </Col>
            <Col span={4}>
              <Select size="small" value={activeTable.icon} onChange={v => updateTable('icon', v)}
                options={APP_ICONS.map(i => ({ label: i, value: i }))} style={{ width: '100%' }} />
            </Col>
            <Col span={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>提示: 默认4字符填充</Text>
            </Col>
          </Row>
          <TemplateDesigner fields={activeTable.fields} onChange={updateFields} tables={validTables.map(t => t.name)} />
          <Divider />
          <Space>
            <Button onClick={() => setStep(0)}>上一步</Button>
            <Button type="primary" disabled={validTables.length === 0} onClick={() => setStep(2)}>
              下一步: 配置应用 ({validTables.length}表)
            </Button>
          </Space>
        </Card>
      )}

      {/* Step 2: 配置应用 */}
      {step === 2 && (
        <Card title={<Space><SettingOutlined /> 步骤3: 配置应用「{appName}」</Space>}>
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="导航菜单" style={{ marginBottom: 16 }}>
                {validTables.map((t, i) => (
                  <div key={i} style={{ padding: '6px 10px', margin: '4px 0', background: '#fafafa', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <Text strong>{t.label || t.name}</Text>
                    <Tag>{t.name}</Tag>
                    <Tag color="blue">{t.fields.length}字段</Tag>
                  </div>
                ))}
              </Card>
              <Card size="small" title="应用文件">
                <Text code style={{ fontSize: 11 }}>
                  addons/{moduleName}/<br/>
                  ├── manifest.json<br/>
                  ├── app.json<br/>
                  └── models/<br/>
                  {validTables.map(t => `│   ├── ${t.name}.js\n`).join('')}
                </Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="发布预览" style={{ background: '#f0f2f5' }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: 16, minHeight: 200 }}>
                  <Title level={4} style={{ color: '#1677ff' }}>{appIcon} {appName}</Title>
                  <Text type="secondary">{appDesc}</Text>
                  <div style={{ marginTop: 16 }}>
                    {validTables.map((t, i) => (
                      <Card key={i} size="small" hoverable style={{ marginBottom: 8, borderLeft: '3px solid #1677ff' }}>
                        <Space>
                          <span style={{ fontSize: 20 }}>{t.icon}</span>
                          <div>
                            <Text strong>{t.label || t.name}</Text>
                            <div><Tag>{t.name}</Tag> <Text type="secondary" style={{ fontSize: 12 }}>{t.fields.length}字段</Text></div>
                          </div>
                        </Space>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
          <Divider />
          <Space>
            <Button onClick={() => setStep(1)}>上一步: 修改表单</Button>
            <Button type="primary" icon={<RocketOutlined />} loading={creating} size="large" onClick={handleDeploy}>
              一键发布应用
            </Button>
          </Space>
        </Card>
      )}

      {/* Step 3: 完成 */}
      {step === 3 && (
        <Card title={deployed ? '🎉 发布成功！' : '发布中...'} style={{ textAlign: 'center', padding: 40 }}>
          <span style={{ fontSize: 64 }}>{appIcon}</span>
          <Title level={4} style={{ marginTop: 16 }}>{appName}</Title>
          <Text type="secondary">{appDesc}</Text>
          <div style={{ margin: '24px auto', maxWidth: 500, textAlign: 'left' }}>
            <Card size="small">
              <p><Tag color="blue">模块</Tag> {moduleName}</p>
              <p><Tag color="green">{validTables.length}个表</Tag>
                {validTables.map(t => ` ${t.name}(${t.fields.length}字段)`).join(', ')}
              </p>
              <p><Tag color="orange">总字段</Tag> {totalFields}</p>
              <p><Tag>文件</Tag> addons/{moduleName}/</p>
            </Card>
          </div>
          <Space size="large">
            <Button type="primary" size="large" icon={<RocketOutlined />}
              onClick={() => window.open(`/app/${moduleName}`, '_self')}>
              进入应用主页
            </Button>
            <Button size="large" onClick={() => { setStep(0); setDeployed(false); setTables([{ name: '', label: '', icon: '📋', fields: [] }]);
              setActiveTableIdx(0); setAppName(''); setAppDesc(''); setModuleName(''); }}>
              继续新建
            </Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default LowCodeBuilder;
