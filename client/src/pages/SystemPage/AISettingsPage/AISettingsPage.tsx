import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Switch, Slider, message, Space, Tag, Popconfirm, Tabs } from 'antd';
import { Plus, Edit, Delete, CheckCircle, KeyRound, Cpu, Zap, Bot, Database, HelpCircle, BookOpen } from 'lucide-react';

const { TextArea } = Input;

interface ModelConfig { id: string; name: string; base_url: string; api_key: string; model: string; is_active: number; provider_type: string; }
interface CsConfig { systemPrompt: string; kbIds: string[]; welcomeMsg: string; }
interface Faq { id: string; question: string; answer: string; category: string; sort_order: number; }

export default function AISettingsPage() {
  const [activeTab, setActiveTab] = useState('models');

  // ---- 模型管理 ----
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [modelLoading, setModelLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ModelConfig | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [modelForm] = Form.useForm();

  // ---- 客服配置 ----
  const [csConfig, setCsConfig] = useState<CsConfig>({ systemPrompt: '', kbIds: [], welcomeMsg: '' });
  const [csConfigForm] = Form.useForm();
  const [kbList, setKbList] = useState<any[]>([]);

  // ---- 问答对 ----
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqModal, setFaqModal] = useState(false);
  const [faqEdit, setFaqEdit] = useState<Faq | null>(null);
  const [faqForm] = Form.useForm();

  useEffect(() => { loadModels(); loadCsConfig(); loadKbList(); loadFaqs(); }, []);

  // ========== 模型管理方法 ==========
  const loadModels = async () => {
    setModelLoading(true);
    try {
      const [m, c] = await Promise.all([fetch('/api/ai/models').then(r => r.json()), fetch('/api/ai/config').then(r => r.json())]);
      setModels(m.data || []);
      if (c.data) { setTemperature(c.data.temperature || 0.7); setMaxTokens(c.data.maxTokens || 2048); }
    } catch {} finally { setModelLoading(false); }
  };
  const saveModel = async () => {
    const v = await modelForm.validateFields();
    // 掩码值或空key不传，保持旧值
    if (v.api_key === '***' || v.api_key === '') delete v.api_key;
    if (editing) { await fetch(`/api/ai/models/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }); }
    else { await fetch('/api/ai/models', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }); }
    message.success('已保存'); setModalOpen(false); modelForm.resetFields(); loadModels();
  };
  const delModel = async (id: string) => { await fetch(`/api/ai/models/${id}`, { method: 'DELETE' }); loadModels(); };
  const toggleActive = async (c: ModelConfig, a: boolean) => {
    await fetch(`/api/ai/models/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: a ? 1 : 0 }) });
    loadModels();
  };
  const testModel = async (c: ModelConfig) => {
    setTesting(p => ({ ...p, [c.id]: true }));
    const r = await fetch(`/api/ai/models/${c.id}/test`, { method: 'POST' }).then(r => r.json());
    setTestResult(p => ({ ...p, [c.id]: r.success ? 'OK' : 'FAIL' }));
    message[r.success ? 'success' : 'error'](r.success ? '连接成功！' : r.error || '连接失败');
    setTesting(p => ({ ...p, [c.id]: false }));
  };
  const saveRuntime = async () => {
    await fetch('/api/ai/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ temperature, maxTokens }) });
    message.success('参数已保存');
  };

  // ========== 客服配置方法 ==========
  const loadCsConfig = async () => {
    const r = await fetch('/api/ai/cs-config').then(r => r.json());
    if (r.success && r.data) { setCsConfig(r.data); csConfigForm.setFieldsValue(r.data); }
  };
  const loadKbList = async () => {
    const r = await fetch('/api/ai/kb').then(r => r.json());
    setKbList(Array.isArray(r) ? r : (r.data || []));
  };
  const saveCsConfig = async () => {
    const v = await csConfigForm.validateFields();
    await fetch('/api/ai/cs-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) });
    setCsConfig(v); message.success('客服配置已保存');
  };

  // ========== 问答对方法 ==========
  const loadFaqs = async () => {
    setFaqLoading(true);
    try { const r = await fetch('/api/ai/faqs').then(r => r.json()); setFaqs(Array.isArray(r) ? r : []); }
    catch {} finally { setFaqLoading(false); }
  };
  const saveFaq = async () => {
    const v = await faqForm.validateFields();
    if (faqEdit) { await fetch(`/api/ai/faqs/${faqEdit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }); }
    else { await fetch('/api/ai/faqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }); }
    message.success('已保存'); setFaqModal(false); faqForm.resetFields(); loadFaqs();
  };
  const delFaq = async (id: string) => { await fetch(`/api/ai/faqs/${id}`, { method: 'DELETE' }); loadFaqs(); };

  // ========== 模型列表列定义 ==========
  const modelCols = [
    { title: '名称', dataIndex: 'name', render: (t: string, r: ModelConfig) => <span><Cpu size={14} style={{ marginRight: 6, color: r.is_active ? '#52c41a' : '#999' }} />{t}{r.is_active ? <Tag color="green" style={{ marginLeft: 8 }}>当前</Tag> : null}</span> },
    { title: 'API地址', dataIndex: 'base_url', ellipsis: true },
    { title: '模型ID', dataIndex: 'model', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '类型', dataIndex: 'provider_type', width: 80, render: (v: string) => <Tag>{v === 'ollama' ? 'Ollama' : 'OpenAI兼容'}</Tag> },
    { title: '状态', width: 100, render: (_: any, r: ModelConfig) => <Space><Switch checked={r.is_active===1} onChange={v=>toggleActive(r,v)} size="small" />{testResult[r.id]&&<Tag color={testResult[r.id]==='OK'?'green':'red'}>{testResult[r.id]}</Tag>}</Space> },
    { title: '操作', width: 160, render: (_: any, r: ModelConfig) => <Space>
      <Button size="small" type="link" icon={<Zap size={14}/>} loading={testing[r.id]} onClick={()=>testModel(r)}>测试</Button>
      <Button size="small" type="link" icon={<Edit size={14}/>} onClick={()=>{const v={...r};if(v.api_key==='***')v.api_key='';setEditing(r);modelForm.setFieldsValue(v);setModalOpen(true)}} />
      <Popconfirm title="确认删除？" onConfirm={()=>delModel(r.id)}><Button size="small" type="link" danger icon={<Delete size={14}/>} /></Popconfirm>
    </Space> },
  ];

  // ========== 问答对列定义 ==========
  const faqCols = [
    { title: '分类', dataIndex: 'category', width: 90, render: (v: string) => <Tag>{v || 'general'}</Tag> },
    { title: '问题', dataIndex: 'question', ellipsis: true },
    { title: '答案', dataIndex: 'answer', ellipsis: true, render: (v: string) => <span style={{ color: '#666' }}>{v?.slice(0, 80)}{v?.length>80?'...':''}</span> },
    { title: '排序', dataIndex: 'sort_order', width: 60 },
    { title: '操作', width: 120, render: (_: any, r: Faq) => <Space>
      <Button size="small" type="link" icon={<Edit size={14}/>} onClick={()=>{setFaqEdit(r);faqForm.setFieldsValue(r);setFaqModal(true)}}>编辑</Button>
      <Popconfirm title="确认删除？" onConfirm={()=>delFaq(r.id)}><Button size="small" type="link" danger icon={<Delete size={14}/>} /></Popconfirm>
    </Space> },
  ];

  const tabItems = [
    {
      key: 'models', label: <span><Cpu size={14} /> 模型管理</span>,
      children: (
        <div style={{ maxWidth: 1000 }}>
          <Card extra={<Button type="primary" icon={<Plus size={14}/>} onClick={()=>{setEditing(null);modelForm.resetFields();setModalOpen(true)}}>添加模型</Button>}
            style={{ marginBottom: 16 }}>
            <p style={{color:'#666',fontSize:13,marginBottom:12}}>添加任意兼容 OpenAI API 格式的模型（DeepSeek / OpenAI / 硅基流动 / 通义千问 / Ollama 等）。开关控制当前使用的模型。</p>
            <Table columns={modelCols} dataSource={models} rowKey="id" loading={modelLoading} pagination={false} size="small" />
          </Card>
          <Card title="运行时参数" size="small">
            <div style={{display:'flex',gap:40,alignItems:'flex-end',flexWrap:'wrap'}}>
              <div><div style={{marginBottom:4,fontSize:12,color:'#666'}}>创意度: {temperature}</div><Slider min={0} max={1.5} step={0.1} value={temperature} onChange={setTemperature} style={{width:200}} /></div>
              <div><div style={{marginBottom:4,fontSize:12,color:'#666'}}>最大输出</div><Select value={maxTokens} onChange={setMaxTokens} style={{width:130}} size="small">{ [512,1024,2048,4096,8192].map(v=><Select.Option key={v} value={v}>{v}</Select.Option>) }</Select></div>
              <Button icon={<CheckCircle size={14}/>} onClick={saveRuntime} size="small">保存参数</Button>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'cs', label: <span><Bot size={14} /> 客服配置</span>,
      children: (
        <div style={{ maxWidth: 800 }}>
          <Card title={<span><Bot size={16} style={{color:'#1890ff',marginRight:8}}/>AI客服配置</span>} style={{marginBottom:16}}>
            <Form form={csConfigForm} layout="vertical" initialValues={csConfig}>
              <Form.Item name="welcomeMsg" label="欢迎语">
                <TextArea rows={2} placeholder="您好！我是飞达AI智能客服..." />
              </Form.Item>
              <Form.Item name="systemPrompt" label="系统提示词" extra="定义AI客服的角色、知识和回答风格">
                <TextArea rows={4} placeholder="你是飞达智能科技的AI客服助手。飞达主要产品有：eHR(人力资源管理)、ERP、CMS、商城。回答简洁友好。" />
              </Form.Item>
              <Form.Item name="kbIds" label="关联知识库" extra="选择客服可检索的知识库，AI回答时会优先从这些知识库中搜索相关内容">
                <Select mode="multiple" placeholder="选择知识库" allowClear options={kbList.map((k:any) => ({label: k.name || k.id, value: k.id}))} />
              </Form.Item>
              <Button type="primary" icon={<CheckCircle size={14}/>} onClick={saveCsConfig}>保存客服配置</Button>
            </Form>
          </Card>
          <Card title={<span><BookOpen size={16} style={{color:'#1890ff',marginRight:8}}/>知识库概览</span>} size="small">
            {kbList.length > 0 ? (
              <Table dataSource={kbList} rowKey="id" pagination={false} size="small"
                columns={[
                  { title: '名称', dataIndex: 'name', ellipsis: true },
                  { title: 'ID', dataIndex: 'id', ellipsis: true, render: (v: string) => <Tag>{v}</Tag> },
                  { title: '状态', dataIndex: 'status', width: 70, render: (v: string) => <Tag color={v==='active'?'green':'default'}>{v||'active'}</Tag> },
                ]} />
            ) : <p style={{ color: '#999' }}>暂无知识库，可在「知识库」页面创建</p>}
            <Button type="link" href="/ai-knowledge" style={{ marginTop: 8 }}>前往知识库管理 <Database size={14} /></Button>
          </Card>
        </div>
      ),
    },
    {
      key: 'faqs', label: <span><HelpCircle size={14} /> 问答对</span>,
      children: (
        <div style={{ maxWidth: 900 }}>
          <Card extra={<Button type="primary" icon={<Plus size={14}/>} onClick={()=>{setFaqEdit(null);faqForm.resetFields();setFaqModal(true)}}>添加问答</Button>}>
            <p style={{color:'#666',fontSize:13,marginBottom:12}}>预设常见问答对，AI客服会优先匹配这些答案。支持按分类管理。</p>
            <Table columns={faqCols} dataSource={faqs} rowKey="id" loading={faqLoading} pagination={{pageSize:20}} size="small" />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Cpu size={22} color="#1890ff" /> AI 设置
      </h2>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {/* 模型弹窗 */}
      <Modal title={editing ? '编辑模型' : '添加模型'} open={modalOpen} onOk={saveModel} onCancel={()=>setModalOpen(false)} width={560} destroyOnClose>
        <Form form={modelForm} layout="vertical" initialValues={{provider_type:'openai'}}>
          <Form.Item name="name" label="名称" rules={[{required:true}]}><Input placeholder="DeepSeek V3" /></Form.Item>
          <Form.Item name="base_url" label="API地址" rules={[{required:true}]}><Input placeholder="https://api.deepseek.com" /></Form.Item>
          <Form.Item name="model" label="模型ID" rules={[{required:true}]}><Input placeholder="deepseek-chat" /></Form.Item>
          <Form.Item name="api_key" label="API Key"><Input.Password placeholder="sk-..." /></Form.Item>
          <Form.Item name="provider_type" label="接口类型"><Select options={[{label:'OpenAI兼容',value:'openai'},{label:'Ollama本地',value:'ollama'}]} /></Form.Item>
        </Form>
      </Modal>

      {/* 问答弹窗 */}
      <Modal title={faqEdit ? '编辑问答' : '添加问答'} open={faqModal} onOk={saveFaq} onCancel={()=>setFaqModal(false)} width={560} destroyOnClose>
        <Form form={faqForm} layout="vertical">
          <Form.Item name="category" label="分类" initialValue="general">
            <Select options={[{label:'通用',value:'general'},{label:'产品',value:'product'},{label:'售后',value:'aftersale'},{label:'技术',value:'tech'}]} />
          </Form.Item>
          <Form.Item name="question" label="问题" rules={[{required:true}]}><Input placeholder="常见问题" maxLength={200} /></Form.Item>
          <Form.Item name="answer" label="答案" rules={[{required:true}]}><TextArea rows={4} placeholder="回答内容" maxLength={500} /></Form.Item>
          <Form.Item name="sort_order" label="排序" initialValue={0}><Input type="number" style={{width:80}} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
