import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Select, InputNumber, Input,
  Tag, Space, Popconfirm, message, Row, Col, Statistic, Tabs, Alert,
  Divider, Tooltip, Collapse
} from 'antd';
import {
  DollarOutlined, CalculatorOutlined, SaveOutlined, PlayCircleOutlined,
  FileTextOutlined, SettingOutlined, CheckCircleOutlined, WarningOutlined,
  FunctionOutlined, CodeOutlined, DeleteOutlined, EditOutlined, PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Panel } = Collapse;

interface SalaryItem {
  id: string;
  name: string;
  code: string;
  type: 'earnings' | 'deductions' | 'allowance' | 'insurance' | 'tax';
  formula?: string;
  defaultValue: number;
  isTaxable: number;
  sortOrder: number;
  isActive: number;
}

interface CalculationResult {
  success: boolean;
  employeeId: string;
  employeeName: string;
  month: string;
  items: Record<string, number>;
  grossSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  tax: number;
  netSalary: number;
  insurance: { social: number; medical: number; housingFund: number; pension: number };
  companyContributions: Record<string, number>;
  errors: string[];
  message: string;
}

const TYPE_COLORS: Record<string, string> = {
  earnings: 'green',
  deductions: 'red',
  allowance: 'blue',
  insurance: 'orange',
  tax: 'purple',
};

const TYPE_LABELS: Record<string, string> = {
  earnings: '应发',
  deductions: '扣款',
  allowance: '补贴',
  insurance: '社保',
  tax: '个税',
};

export default function SalaryFormulaPage() {
  const [items, setItems] = useState<SalaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [previewResult, setPreviewResult] = useState<CalculationResult | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SalaryItem | null>(null);
  const [itemForm] = Form.useForm();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [formulaPreview, setFormulaPreview] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  // 公式模板
  const formulaTemplates = [
    { label: '基本工资', formula: '基本工资' },
    { label: '岗位工资', formula: '岗位工资' },
    { label: '绩效工资', formula: '绩效工资' },
    { label: '加班费 = 加班小时 * 50', formula: '加班小时数 * 50' },
    { label: '迟到扣款 = 次数 * 50', formula: '迟到次数 * 50' },
    { label: '缺勤扣款 = 次数 * 200', formula: '缺勤次数 * 200' },
    { label: '请假扣款 = 天数 * 日薪', formula: '请假天数 * (基本工资 / 22)' },
    { label: 'IF条件判断', formula: 'IF(迟到次数 > 3, 200, 0)' },
    { label: '四舍五入', formula: 'ROUND(绩效工资 * 0.8, 2)' },
    { label: '最大值', formula: 'MAX(绩效工资, 1000)' },
  ];

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/salary_items');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      messageApi.error('加载薪资项失败');
    }
    setLoading(false);
  }, [messageApi]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // 预览公式
  const handlePreviewFormula = async (formula: string) => {
    try {
      const res = await fetch('/api/salary/preview-formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formula }),
      });
      const data = await res.json();
      setFormulaPreview(data.success ? `结果: ${data.value}` : `错误: ${data.error}`);
    } catch {
      setFormulaPreview('预览失败');
    }
  };

  // 保存薪资项
  const handleSaveItem = async () => {
    try {
      const values = await itemForm.validateFields();
      
      // 验证公式
      if (values.formula) {
        const validRes = await fetch('/api/salary/validate-formula', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formula: values.formula }),
        });
        const validData = await validRes.json();
        if (!validData.valid) {
          messageApi.error(`公式语法错误: ${validData.error}`);
          return;
        }
      }
      
      const url = editingItem 
        ? `/api/salary/items/${editingItem.id}` 
        : '/api/salary/items';
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, id: editingItem?.id }),
      });
      
      if (res.ok) {
        messageApi.success(editingItem ? '更新成功' : '添加成功');
        setShowItemModal(false);
        setEditingItem(null);
        itemForm.resetFields();
        fetchItems();
      }
    } catch { /* validation */ }
  };

  // 删除薪资项
  const handleDeleteItem = async (id: string) => {
    try {
      await fetch(`/api/salary_items/${id}`, { method: 'DELETE' });
      messageApi.success('删除成功');
      fetchItems();
    } catch {
      messageApi.error('删除失败');
    }
  };

  // 切换启用状态
  const handleToggleActive = async (item: SalaryItem) => {
    try {
      await fetch(`/api/salary/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, isActive: item.isActive ? 0 : 1 }),
      });
      messageApi.success(item.isActive ? '已停用' : '已启用');
      fetchItems();
    } catch {
      messageApi.error('操作失败');
    }
  };

  // 计算薪资
  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/salary/batch-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth }),
      });
      const data = await res.json();
      if (data.success) {
        messageApi.success(data.message);
        setPreviewResult({
          success: true,
          employeeId: 'all',
          employeeName: '全员',
          month: selectedMonth,
          items: {},
          grossSalary: data.results.reduce((s: number, r: any) => s + r.grossSalary, 0),
          totalEarnings: data.results.reduce((s: number, r: any) => s + r.totalEarnings, 0),
          totalDeductions: data.results.reduce((s: number, r: any) => s + r.totalDeductions, 0),
          tax: data.results.reduce((s: number, r: any) => s + r.tax, 0),
          netSalary: data.results.reduce((s: number, r: any) => s + r.netSalary, 0),
          insurance: { social: 0, medical: 0, housingFund: 0, pension: 0 },
          companyContributions: {},
          errors: data.results.flatMap((r: any) => r.errors || []),
          message: data.message,
        });
      } else {
        messageApi.error(data.message || '计算失败');
      }
    } catch {
      messageApi.error('网络错误');
    }
    setCalculating(false);
  };

  // 生成薪资记录
  const handleGenerateRecords = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/salary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth }),
      });
      const data = await res.json();
      if (data.success) {
        messageApi.success(data.message);
      } else {
        messageApi.error(data.message || '生成失败');
      }
    } catch {
      messageApi.error('网络错误');
    }
    setCalculating(false);
  };

  const columns = [
    {
      title: '薪资项名称',
      dataIndex: 'name',
      key: 'name',
      width: 140,
      render: (v: string, r: SalaryItem) => (
        <div className="flex items-center gap-2">
          <Tag color={TYPE_COLORS[r.type]}>{TYPE_LABELS[r.type]}</Tag>
          <span style={{ fontWeight: r.formula ? 600 : 400 }}>{v}</span>
        </div>
      ),
    },
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
    },
    {
      title: '公式',
      dataIndex: 'formula',
      key: 'formula',
      render: (v: string, r: SalaryItem) => (
        <div>
          {v ? (
            <code style={{ fontSize: 11, color: '#722ed1' }}>{v}</code>
          ) : (
            <span className="text-gray-400">默认值: {r.defaultValue}</span>
          )}
        </div>
      ),
    },
    {
      title: '计税',
      dataIndex: 'isTaxable',
      key: 'taxable',
      width: 70,
      align: 'center' as const,
      render: (v: number) => v ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'active',
      width: 70,
      align: 'center' as const,
      render: (v: number, r: SalaryItem) => (
        <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, r: SalaryItem) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => {
            setEditingItem(r);
            itemForm.setFieldsValue(r);
            setShowItemModal(true);
          }}>编辑</Button>
          <Button type="link" size="small" onClick={() => handlePreviewFormula(r.formula || String(r.defaultValue))}>
            预览
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDeleteItem(r.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">💰 薪资公式引擎</h1>
          <p className="text-sm text-muted-foreground mt-1">配置薪资项公式，批量计算员工工资</p>
        </div>
        <Space>
          <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 130 }}>
            {[...Array(12)].map((_, i) => {
              const d = dayjs().subtract(i, 'month');
              return <Select.Option key={d.format('YYYY-MM')} value={d.format('YYYY-MM')}>
                {d.format('YYYY年MM月')}
              </Select.Option>;
            })}
          </Select>
          <Button icon={<CalculatorOutlined />} onClick={handleCalculate} loading={calculating}>
            计算薪资
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleGenerateRecords} loading={calculating}>
            生成薪资记录
          </Button>
        </Space>
      </div>

      <Tabs items={[
        {
          key: 'items',
          label: '📋 薪资项配置',
          children: (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <Alert
                  message="公式说明"
                  description={
                    <div className="text-sm">
                      支持变量：基本工资、岗位工资、绩效工资、加班小时数、迟到次数、缺勤次数、请假天数<br/>
                      支持函数：IF(条件, 真值, 假值)、ROUND(数值, 小数位)、MAX/MIN(值1, 值2)、ABS(数值)
                    </div>
                  }
                  type="info"
                  showIcon
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                  setEditingItem(null);
                  itemForm.resetFields();
                  setShowItemModal(true);
                }}>
                  新增薪资项
                </Button>
              </div>

              <Table
                dataSource={items}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="middle"
              />
            </Card>
          ),
        },
        {
          key: 'templates',
          label: '📝 公式模板',
          children: (
            <Card title="常用公式模板">
              <Row gutter={[16, 16]}>
                {formulaTemplates.map((t, i) => (
                  <Col span={8} key={i}>
                    <Card size="small" hoverable onClick={() => {
                      itemForm.setFieldValue('formula', t.formula);
                      handlePreviewFormula(t.formula);
                    }}>
                      <div className="font-medium">{t.label}</div>
                      <code className="text-xs text-purple-600 mt-1 block">{t.formula}</code>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Divider />

              <Card title="公式语法参考">
                <Collapse>
                  <Panel header="IF 条件判断" key="if">
                    <code className="block mb-2">IF(条件, 真值, 假值)</code>
                    <div className="text-sm text-gray-600">
                      示例：IF(迟到次数 {'>'} 3, 200, 0)<br/>
                      含义：如果迟到次数大于3，则返回200，否则返回0
                    </div>
                  </Panel>
                  <Panel header="ROUND 四舍五入" key="round">
                    <code className="block mb-2">ROUND(数值, 小数位数)</code>
                    <div className="text-sm text-gray-600">
                      示例：ROUND(基本工资 * 1.2, 2)<br/>
                      含义：基本工资乘以1.2，保留2位小数
                    </div>
                  </Panel>
                  <Panel header="MAX/MIN 最大最小值" key="maxmin">
                    <code className="block mb-2">MAX(值1, 值2, ...)</code>
                    <div className="text-sm text-gray-600">
                      示例：MAX(绩效工资, 1000)<br/>
                      含义：返回绩效工资和1000中的较大值
                    </div>
                  </Panel>
                  <Panel header="ABS 绝对值" key="abs">
                    <code className="block mb-2">ABS(数值)</code>
                    <div className="text-sm text-gray-600">
                      示例：ABS(扣款金额)<br/>
                      含义：返回数值的绝对值
                    </div>
                  </Panel>
                </Collapse>
              </Card>
            </Card>
          ),
        },
        {
          key: 'preview',
          label: '🔍 计算预览',
          children: (
            <Row gutter={16}>
              <Col span={16}>
                <Card title="公式预览测试">
                  <Form layout="vertical">
                    <Form.Item label="测试公式">
                      <Input
                        placeholder="输入公式，如: 基本工资 + 岗位工资"
                        value={itemForm.getFieldValue('formula')}
                        onChange={e => itemForm.setFieldValue('formula', e.target.value)}
                        suffix={
                          <Button size="small" onClick={() => handlePreviewFormula(itemForm.getFieldValue('formula'))}>
                            测试
                          </Button>
                        }
                      />
                    </Form.Item>
                    {formulaPreview && (
                      <Alert
                        message={formulaPreview}
                        type={formulaPreview.startsWith('结果') ? 'success' : 'error'}
                        showIcon
                      />
                    )}
                  </Form>
                </Card>

                {previewResult && (
                  <Card title={`${selectedMonth} 薪资汇总`} className="mt-4">
                    <Row gutter={16}>
                      <Col span={6}><Statistic title="应发合计" value={previewResult.totalEarnings} prefix="¥" /></Col>
                      <Col span={6}><Statistic title="扣款合计" value={previewResult.totalDeductions} prefix="¥" /></Col>
                      <Col span={6}><Statistic title="个税" value={previewResult.tax} prefix="¥" /></Col>
                      <Col span={6}><Statistic title="实发合计" value={previewResult.netSalary} prefix="¥" valueStyle={{ color: '#52c41a' }} /></Col>
                    </Row>
                    {previewResult.errors.length > 0 && (
                      <Alert
                        message="计算警告"
                        description={previewResult.errors.slice(0, 5).join('；')}
                        type="warning"
                        showIcon
                        className="mt-4"
                      />
                    )}
                  </Card>
                )}
              </Col>
              <Col span={8}>
                <Card title="可用变量">
                  <div className="space-y-2">
                    <div className="font-medium text-green-600">📥 应发项</div>
                    <code className="block text-xs">基本工资</code>
                    <code className="block text-xs">岗位工资</code>
                    <code className="block text-xs">绩效工资</code>
                    <code className="block text-xs">加班小时数</code>
                    
                    <div className="font-medium text-red-600 mt-4">📤 扣款项</div>
                    <code className="block text-xs">迟到次数</code>
                    <code className="block text-xs">缺勤次数</code>
                    <code className="block text-xs">请假天数</code>
                    
                    <div className="font-medium text-blue-600 mt-4">🔧 函数</div>
                    <code className="block text-xs">IF(cond, a, b)</code>
                    <code className="block text-xs">ROUND(x, n)</code>
                    <code className="block text-xs">MAX(a, b, ...)</code>
                    <code className="block text-xs">MIN(a, b, ...)</code>
                    <code className="block text-xs">ABS(x)</code>
                  </div>
                </Card>
              </Col>
            </Row>
          ),
        },
      ]} />

      {/* 薪资项编辑弹窗 */}
      <Modal
        title={editingItem ? '编辑薪资项' : '新增薪资项'}
        open={showItemModal}
        onOk={handleSaveItem}
        onCancel={() => { setShowItemModal(false); setEditingItem(null); itemForm.resetFields(); }}
        width={600}
      >
        <Form form={itemForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="如：基本工资" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="代码" name="code" rules={[{ required: true, message: '请输入代码' }]}>
                <Input placeholder="如：base_salary" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="类型" name="type" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="earnings">应发</Select.Option>
                  <Select.Option value="deductions">扣款</Select.Option>
                  <Select.Option value="allowance">补贴</Select.Option>
                  <Select.Option value="insurance">社保</Select.Option>
                  <Select.Option value="tax">个税</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="默认值" name="defaultValue">
                <InputNumber style={{ width: '100%' }} placeholder="无公式时的默认值" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="计算公式" name="formula">
            <TextArea
              rows={3}
              placeholder="如：基本工资 + 岗位工资 或 IF(迟到次数 > 3, 200, 0)"
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="是否计税" name="isTaxable" valuePropName="checked">
                <Select>
                  <Select.Option value={1}>是</Select.Option>
                  <Select.Option value={0}>否</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="排序" name="sortOrder">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="启用" name="isActive" valuePropName="checked">
                <Select>
                  <Select.Option value={1}>是</Select.Option>
                  <Select.Option value={0}>否</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Button
            type="link"
            icon={<CalculatorOutlined />}
            onClick={() => handlePreviewFormula(itemForm.getFieldValue('formula') || '0')}
          >
            预览公式结果
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
