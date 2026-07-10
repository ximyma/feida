import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Switch, Slider, message, Space, Tag, Popconfirm, Tooltip } from 'antd';
import { Plus, Edit, Delete, CheckCircle, Link, KeyRound, Cpu, Globe, Zap } from 'lucide-react';

interface ModelConfig {
  id: string;
  name: string;
  base_url: string;
  api_key: string;
  model: string;
  is_active: number;
  provider_type: string;
}

export default function AISettingsPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ModelConfig | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [form] = Form.useForm();

  // 运行时参数
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modelsRes, configRes] = await Promise.all([
        fetch('/api/ai/models').then(r => r.json()),
        fetch('/api/ai/config').then(r => r.json()),
      ]);
      setModels(modelsRes.data || []);
      if (configRes.data) {
        setTemperature(configRes.data.temperature || 0.7);
        setMaxTokens(configRes.data.maxTokens || 2048);
      }
    } catch {} finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await fetch(`/api/ai/models/${editing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
        });
        message.success('模型配置已更新');
      } else {
        await fetch('/api/ai/models', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
        });
        message.success('模型配置已添加');
      }
      setModalOpen(false); form.resetFields(); loadData();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/ai/models/${id}`, { method: 'DELETE' });
    message.success('已删除'); loadData();
  };

  const handleToggleActive = async (config: ModelConfig, active: boolean) => {
    await fetch(`/api/ai/models/${config.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: active ? 1 : 0 }),
    });
    loadData();
  };

  const handleTest = async (config: ModelConfig) => {
    setTesting(prev => ({ ...prev, [config.id]: true }));
    setTestResult(prev => ({ ...prev, [config.id]: '' }));
    try {
      const res = await fetch(`/api/ai/models/${config.id}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResult(prev => ({ ...prev, [config.id]: data.success ? 'OK' : data.error || 'FAIL' }));
      message[data.success ? 'success' : 'error'](data.success ? '连接成功！' : data.error || '连接失败');
    } catch (e: any) {
      setTestResult(prev => ({ ...prev, [config.id]: 'FAIL' }));
    } finally {
      setTesting(prev => ({ ...prev, [config.id]: false }));
    }
  };

  const saveRuntimeConfig = async () => {
    await fetch('/api/ai/config', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperature, maxTokens }),
    });
    message.success('运行时参数已保存');
  };

  const columns = [
    {
      title: '名称', dataIndex: 'name', key: 'name', render: (t: string, r: ModelConfig) => (
        <span>
          <Cpu size={14} style={{ marginRight: 6, color: r.is_active ? '#52c41a' : '#999' }} />
          {t}
          {r.is_active ? <Tag color="green" style={{ marginLeft: 8, fontSize: 10 }}>当前使用</Tag> : null}
        </span>
      ),
    },
    { title: 'API地址', dataIndex: 'base_url', key: 'base_url', ellipsis: true },
    { title: '模型ID', dataIndex: 'model', key: 'model', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '类型', dataIndex: 'provider_type', key: 'type', width: 80, render: (v: string) => <Tag>{v === 'ollama' ? 'Ollama' : 'OpenAI兼容'}</Tag> },
    {
      title: '状态', key: 'active', width: 100,
      render: (_: any, r: ModelConfig) => (
        <Space>
          <Switch checked={r.is_active === 1} onChange={(v) => handleToggleActive(r, v)} size="small" />
          {testResult[r.id] && (
            <Tag color={testResult[r.id] === 'OK' ? 'green' : 'red'} style={{ fontSize: 10 }}>{testResult[r.id]}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '操作', key: 'action', width: 160,
      render: (_: any, r: ModelConfig) => (
        <Space>
          <Button size="small" type="link" icon={<Zap size={14} />} loading={testing[r.id]} onClick={() => handleTest(r)}>测试</Button>
          <Button size="small" type="link" icon={<Edit size={14} />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" type="link" danger icon={<Delete size={14} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000 }}>
      <Card title={<Space><Cpu size={18} color="#1890ff" /> <span>AI模型配置</span></Space>}
        style={{ marginBottom: 16 }}
        extra={<Button type="primary" icon={<Plus size={14} />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>添加模型</Button>}
      >
        <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
          添加任意AI模型——只要兼容 OpenAI API 格式即可（DeepSeek / OpenAI / 硅基流动 / 通义千问 / Ollama 等）。支持同时配置多个模型，通过开关切换当前使用的模型。
        </p>
        <Table columns={columns} dataSource={models} rowKey="id" loading={loading} pagination={false} size="small" />
      </Card>

      <Card title="运行时参数" size="small">
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>创意度 Temperature: {temperature}</div>
            <Slider min={0} max={1.5} step={0.1} value={temperature} onChange={setTemperature} style={{ width: 200 }} marks={{ 0: '精确', 0.7: '平衡', 1.5: '随机' }} />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>最大输出 Max Tokens</div>
            <Select value={maxTokens} onChange={setMaxTokens} style={{ width: 130 }} size="small">
              {[512, 1024, 2048, 4096, 8192].map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
            </Select>
          </div>
          <Button icon={<CheckCircle size={14} />} onClick={saveRuntimeConfig} size="small">保存参数</Button>
        </div>
      </Card>

      <Modal title={editing ? '编辑模型配置' : '添加模型配置'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={560} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={{ provider_type: 'openai' }}>
          <Form.Item name="name" label="配置名称" rules={[{ required: true }]}>
            <Input placeholder="例如：DeepSeek V3 / 硅基流动 Qwen / 本地Ollama" />
          </Form.Item>
          <Form.Item name="base_url" label="API地址" rules={[{ required: true }]} extra="完整的API基础URL，例如 https://api.deepseek.com">
            <Input placeholder="https://api.deepseek.com" />
          </Form.Item>
          <Form.Item name="model" label="模型ID" rules={[{ required: true }]} extra="例如: deepseek-chat / gpt-4o / qwen-plus / deepseek-r1:8b">
            <Input placeholder="deepseek-chat" />
          </Form.Item>
          <Form.Item name="api_key" label={<Space><KeyRound size={14} /> API Key</Space>}>
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item name="provider_type" label="接口类型">
            <Select>
              <Select.Option value="openai">OpenAI 兼容（DeepSeek/硅基流动/通义千问等）</Select.Option>
              <Select.Option value="ollama">Ollama 本地模型</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
