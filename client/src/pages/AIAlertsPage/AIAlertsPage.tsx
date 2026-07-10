import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Space, Badge, Tabs, Modal, Form, Select, InputNumber, Input, Switch } from 'antd';
import { AlertTriangle, Bell, CheckCircle, Clock, X, Plus, Settings, RefreshCw } from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  type: string;
  threshold: number;
  enabled: boolean;
  description: string;
}

interface AlertRecord {
  id: string;
  rule_name: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  status: 'active' | 'resolved' | 'ignored';
  created_at: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  high: 'red',
  medium: 'orange',
  low: 'blue',
};

const TYPE_LABELS: Record<string, string> = {
  attendance: '考勤异常',
  resignation: '离职风险',
  performance: '绩效异常',
  overtime: '加班过量',
  training: '培训滞后',
  contract: '合同到期',
};

export default function AIAlertsPage() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [records, setRecords] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'rules') {
        const res = await fetch('/api/ai/alert-rules');
        const data = await res.json();
        setRules(data.data || getDefaultRules());
      } else {
        const res = await fetch('/api/ai/alert-records');
        const data = await res.json();
        setRecords(data.data || generateSampleRecords());
      }
    } catch {
      if (activeTab === 'rules') setRules(getDefaultRules());
      else setRecords(generateSampleRecords());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultRules = (): AlertRule[] => [
    { id: 'rule_1', name: '连续迟到预警', type: 'attendance', threshold: 3, enabled: true, description: '员工连续迟到超过N次触发预警' },
    { id: 'rule_2', name: '加班超时预警', type: 'overtime', threshold: 36, enabled: true, description: '月加班超过N小时触发预警' },
    { id: 'rule_3', name: '合同到期提醒', type: 'contract', threshold: 30, enabled: true, description: '劳动合同剩余天数少于N天提醒' },
    { id: 'rule_4', name: '绩效下滑预警', type: 'performance', threshold: 2, enabled: true, description: '连续N个月绩效评分下降触发' },
    { id: 'rule_5', name: '培训完成率预警', type: 'training', threshold: 70, enabled: true, description: '培训完成率低于N%触发预警' },
  ];

  const generateSampleRecords = (): AlertRecord[] => [
    { id: 'rec_1', rule_name: '连续迟到预警', type: 'attendance', severity: 'high', message: '张伟（生产部）本月已连续迟到5次', status: 'active', created_at: new Date().toISOString() },
    { id: 'rec_2', rule_name: '合同到期提醒', type: 'contract', severity: 'medium', message: '李明（研发部）劳动合同将于30天内到期', status: 'active', created_at: new Date().toISOString() },
    { id: 'rec_3', rule_name: '绩效下滑预警', type: 'performance', severity: 'low', message: '王芳（销售部）连续2月绩效评分下降', status: 'active', created_at: new Date().toISOString() },
    { id: 'rec_4', rule_name: '加班超时预警', type: 'overtime', severity: 'high', message: '赵强（生产部）本月加班已达42小时', status: 'active', created_at: new Date().toISOString() },
    { id: 'rec_5', rule_name: '培训完成率预警', type: 'training', severity: 'medium', message: '新员工培训完成率仅62%，低于70%阈值', status: 'active', created_at: new Date().toISOString() },
  ];

  const handleResolve = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    message.success('已标记为已处理');
  };

  const handleIgnore = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'ignored' } : r));
    message.success('已标记为已忽略');
  };

  const handleSaveRule = async () => {
    try {
      const values = await form.validateFields();
      if (editingRule) {
        setRules(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...values } : r));
        message.success('规则更新成功');
      } else {
        setRules(prev => [...prev, { id: 'rule_' + Date.now(), ...values }]);
        message.success('规则添加成功');
      }
      setRuleModalOpen(false);
      form.resetFields();
    } catch {}
  };

  const ruleColumns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag>{TYPE_LABELS[v] || v}</Tag> },
    { title: '阈值', dataIndex: 'threshold', key: 'threshold' },
    { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '启用', dataIndex: 'enabled', key: 'enabled', render: (v: boolean, record: AlertRule) => (
      <Switch checked={v} onChange={(checked) => {
        setRules(prev => prev.map(r => r.id === record.id ? { ...r, enabled: checked } : r));
      }} />
    )},
  ];

  const recordColumns = [
    { title: '预警内容', dataIndex: 'message', key: 'message', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag>{TYPE_LABELS[v] || v}</Tag> },
    {
      title: '严重程度', dataIndex: 'severity', key: 'severity',
      render: (v: string) => <Badge status={v === 'high' ? 'error' : v === 'medium' ? 'warning' : 'processing'} text={v === 'high' ? '严重' : v === 'medium' ? '中等' : '轻度'} />,
    },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => (
      <Tag color={v === 'active' ? 'red' : v === 'resolved' ? 'green' : 'default'}>
        {v === 'active' ? '待处理' : v === 'resolved' ? '已处理' : '已忽略'}
      </Tag>
    )},
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    {
      title: '操作', key: 'action',
      render: (_: any, record: AlertRecord) => record.status === 'active' ? (
        <Space>
          <Button size="small" type="link" icon={<CheckCircle size={14} />} onClick={() => handleResolve(record.id)}>处理</Button>
          <Button size="small" type="link" icon={<X size={14} />} onClick={() => handleIgnore(record.id)}>忽略</Button>
        </Space>
      ) : null,
    },
  ];

  const activeCount = records.filter(r => r.status === 'active').length;

  return (
    <div>
      <Card
        title={<Space><Bell size={18} color="#faad14" /> <span>智能预警系统</span></Space>}
        extra={
          <Badge count={activeCount} offset={[-5, 5]}>
            <Button icon={<RefreshCw size={14} />} onClick={loadData} loading={loading}>刷新</Button>
          </Badge>
        }
        style={{ marginBottom: 16 }}
      >
        <p style={{ color: '#666', marginBottom: 0 }}>
          🔔 基于AI和规则的智能预警系统，自动检测HR异常数据并推送预警提醒。当前 <Tag color="red">{activeCount}</Tag> 条待处理预警。
        </p>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab={<span><AlertTriangle size={14} /> 预警记录 <Badge count={activeCount} /></span>} key="alerts">
          <Card>
            <Table
              columns={recordColumns}
              dataSource={records}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><Settings size={14} /> 预警规则</span>} key="rules">
          <Card
            extra={
              <Button type="primary" icon={<Plus size={14} />} onClick={() => { setEditingRule(null); form.resetFields(); setRuleModalOpen(true); }}>
                添加规则
              </Button>
            }
          >
            <Table
              columns={ruleColumns}
              dataSource={rules}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>

      {/* 规则编辑弹窗 */}
      <Modal
        title={editingRule ? '编辑预警规则' : '添加预警规则'}
        open={ruleModalOpen}
        onOk={handleSaveRule}
        onCancel={() => setRuleModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
            <Input placeholder="例如：连续迟到预警" />
          </Form.Item>
          <Form.Item name="type" label="预警类型" rules={[{ required: true }]}>
            <Select>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="threshold" label="预警阈值">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="规则说明">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
