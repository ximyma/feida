import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Button, Modal, Form, Select, InputNumber, Input,
  Tag, Space, Popconfirm, message, Row, Col, Statistic, Tabs, Divider
} from 'antd';
import {
  DollarOutlined, SettingOutlined, BarChartOutlined,
  FileTextOutlined, TeamOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, CheckCircleOutlined,
  CalculatorOutlined
} from '@ant-design/icons';

// ============ DB 真实字段类型 ============
interface ISalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  baseSalary: number;
  positionSalary: number;
  performance: number;
  overtime: number;
  mealAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  socialInsurance: number;
  medicalInsurance: number;
  housingFund: number;
  otherDeduction: number;
  tax: number;
  grossSalary: number;
  netSalary: number;
  status: 'draft' | 'confirmed' | 'paid';
  paidAt?: string;
}

interface ISalaryItem {
  id: string;
  name: string;
  code: string;
  type: 'earnings' | 'deductions' | 'allowance' | 'insurance' | 'tax';
  dataType: string;
  formula?: string;
  defaultValue: number;
  isTaxable: number;
  sortOrder: number;
  isActive: number;
  category?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  confirmed: { label: '已确认', color: 'blue' },
  paid: { label: '已发放', color: 'green' },
};

const fmt = (n: number) => n?.toLocaleString('zh-CN', { maximumFractionDigits: 0 }) || '0';

export default function SalaryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [salaryRecords, setSalaryRecords] = useState<ISalaryRecord[]>([]);
  const [salaryItems, setSalaryItems] = useState<ISalaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ISalaryRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<ISalaryRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ISalaryItem | null>(null);
  const [itemForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => { loadAll(); }, [selectedMonth]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [salaryRes, itemRes] = await Promise.all([
        fetch('/api/salaries').then(r => r.json()).catch(() => []),
        fetch('/api/salary_items').then(r => r.json()).catch(() => []),
      ]);
      setSalaryRecords(Array.isArray(salaryRes) ? salaryRes : []);
      setSalaryItems(Array.isArray(itemRes) ? itemRes : []);
    } catch { messageApi.error('加载失败'); }
    setLoading(false);
  };

  const currentMonthRecords = salaryRecords.filter(r => r.month === selectedMonth);

  const s = {
    totalEmployees: currentMonthRecords.length,
    totalBase: currentMonthRecords.reduce((sum, r) => sum + (r.baseSalary || 0), 0),
    totalPosition: currentMonthRecords.reduce((sum, r) => sum + (r.positionSalary || 0), 0),
    totalPerf: currentMonthRecords.reduce((sum, r) => sum + (r.performance || 0) + (r.overtime || 0), 0),
    totalAllowance: currentMonthRecords.reduce((sum, r) => sum + (r.mealAllowance || 0) + (r.transportAllowance || 0) + (r.otherAllowance || 0), 0),
    totalInsurance: currentMonthRecords.reduce((sum, r) => sum + (r.socialInsurance || 0) + (r.medicalInsurance || 0) + (r.housingFund || 0), 0),
    totalTax: currentMonthRecords.reduce((sum, r) => sum + (r.tax || 0), 0),
    totalGross: currentMonthRecords.reduce((sum, r) => sum + (r.grossSalary || 0), 0),
    totalActualPay: currentMonthRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0),
    draftCount: currentMonthRecords.filter(r => r.status === 'draft').length,
    confirmedCount: currentMonthRecords.filter(r => r.status === 'confirmed').length,
    paidCount: currentMonthRecords.filter(r => r.status === 'paid').length,
  };

  const confirmSalary = (id: string) => {
    fetch(`/api/salaries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) })
      .then(() => { loadAll(); messageApi.success('已确认'); });
  };

  const paySalary = (id: string) => {
    fetch(`/api/salaries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid', paidAt: new Date().toISOString() }) })
      .then(() => { loadAll(); messageApi.success('已发放'); });
  };

  const handleDeleteRecord = (id: string) => {
    fetch(`/api/salaries/${id}`, { method: 'DELETE' }).then(() => { loadAll(); messageApi.success('已删除'); });
  };

  const handleEditRecord = (r: ISalaryRecord) => { setEditingRecord({ ...r }); setShowEditModal(true); };

  const handleSaveRecord = () => {
    if (!editingRecord) return;
    const r = editingRecord;
    const baseSalary = Number(r.baseSalary) || 0;
    const positionSalary = Number(r.positionSalary) || 0;
    const performance = Number(r.performance) || 0;
    const overtime = Number(r.overtime) || 0;
    const mealAllowance = Number(r.mealAllowance) || 0;
    const transportAllowance = Number(r.transportAllowance) || 0;
    const otherAllowance = Number(r.otherAllowance) || 0;
    const socialInsurance = Number(r.socialInsurance) || 0;
    const medicalInsurance = Number(r.medicalInsurance) || 0;
    const housingFund = Number(r.housingFund) || 0;
    const otherDeduction = Number(r.otherDeduction) || 0;
    const tax = Number(r.tax) || 0;
    const grossSalary = baseSalary + positionSalary + performance + overtime + mealAllowance + transportAllowance + otherAllowance;
    const netSalary = grossSalary - socialInsurance - medicalInsurance - housingFund - otherDeduction - tax;

    fetch(`/api/salaries/${editingRecord.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editingRecord, baseSalary, positionSalary, performance, overtime, mealAllowance, transportAllowance, otherAllowance, socialInsurance, medicalInsurance, housingFund, otherDeduction, tax, grossSalary, netSalary }),
    }).then(() => { loadAll(); setShowEditModal(false); setEditingRecord(null); messageApi.success('已更新'); });
  };

  const batchConfirm = () => {
    const drafts = currentMonthRecords.filter(r => r.status === 'draft');
    Promise.all(drafts.map(r => fetch(`/api/salaries/${r.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) })))
      .then(() => { loadAll(); messageApi.success(`批量确认 ${drafts.length} 条`); });
  };

  // ===== 薪资项目 CRUD =====
  const openAddItem = () => {
    setEditingItem(null);
    itemForm.resetFields();
    itemForm.setFieldsValue({ type: 'earnings', isActive: true, isTaxable: true, dataType: 'number', decimalPlaces: 2, sortOrder: 99 });
    setShowItemModal(true);
  };

  const openEditItem = (item: ISalaryItem) => {
    setEditingItem(item);
    itemForm.setFieldsValue({ ...item, isActive: item.isActive === 1, isTaxable: item.isTaxable === 1 });
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    try {
      const values = await itemForm.validateFields();
      const payload = {
        id: editingItem?.id || `si_${Date.now()}`,
        name: values.name, code: values.code || values.name, type: values.type,
        dataType: values.dataType || 'number', decimalPlaces: values.decimalPlaces ?? 2,
        formula: values.formula || null, defaultValue: Number(values.defaultValue) || 0,
        isTaxable: values.isTaxable ? 1 : 0, sortOrder: Number(values.sortOrder) || 99,
        isActive: values.isActive ? 1 : 0, category: values.category || 'salary',
      };
      const url = editingItem ? `/api/salary_items/${editingItem.id}` : '/api/salary_items';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok || res.status === 200) { messageApi.success(editingItem ? '已更新' : '已添加'); setShowItemModal(false); loadAll(); }
      else { const e = await res.json(); messageApi.error('保存失败: ' + (e.error || '未知错误')); }
    } catch {}
  };

  const handleDeleteItem = async (id: string) => {
    await fetch(`/api/salary_items/${id}`, { method: 'DELETE' });
    loadAll(); messageApi.success('已删除');
  };

  const quickActions = [
    { title: '工资表', desc: '查看工资明细', icon: <FileTextOutlined style={{ fontSize: 28, color: '#1890ff' }} />, path: '/salary/table', color: '#e6f7ff' },
    { title: '公式引擎', desc: '配置公式批量计算', icon: <CalculatorOutlined style={{ fontSize: 28, color: '#722ed1' }} />, path: '/salary/formula', color: '#f9f0ff' },
    { title: '薪资配置', desc: '薪资项目设置', icon: <SettingOutlined style={{ fontSize: 28, color: '#52c41a' }} />, path: '/salary/config', color: '#f6ffed' },
    { title: '社保公积金', desc: '企业/个人缴纳', icon: <TeamOutlined style={{ fontSize: 28, color: '#fa8c16' }} />, path: '/salary/company', color: '#fff7e6' },
  ];

  const itemTypeCards: Record<string, { label: string; color: string }> = {
    earnings: { label: '💰 应发项', color: 'bg-green-50 border-green-200' },
    allowance: { label: '🛡️ 补贴项', color: 'bg-blue-50 border-blue-200' },
    deductions: { label: '➖ 扣款项', color: 'bg-red-50 border-red-200' },
    insurance: { label: '🏥 社保项', color: 'bg-purple-50 border-purple-200' },
    tax: { label: '📋 税务项', color: 'bg-orange-50 border-orange-200' },
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">💰 薪资管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理员工薪资、薪资项目、发放记录</p>
        </div>
        <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-input rounded-lg bg-background" />
      </div>

      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={4}><Card size="small"><Statistic title="本月人数" value={s.totalEmployees} valueStyle={{ color: '#1890ff' }} prefix={<TeamOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="应发总额" value={s.totalGross} precision={0} prefix="¥" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="社保公积金" value={s.totalInsurance} precision={0} prefix="¥" valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="代扣个税" value={s.totalTax} precision={0} prefix="¥" valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="实发总额" value={s.totalActualPay} precision={0} prefix="¥" valueStyle={{ color: '#cf1322' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="草稿/确认/已发" value={`${s.draftCount}/${s.confirmedCount}/${s.paidCount}`} valueStyle={{ fontSize: 16 }} /></Card></Col>
      </Row>

      {/* 快捷操作 */}
      <Card title="⚡ 快捷操作" size="small">
        <Row gutter={16}>
          {quickActions.map((action, i) => (
            <Col span={6} key={i}>
              <Card hoverable size="small" className="text-center cursor-pointer"
                style={{ backgroundColor: action.color, borderColor: 'transparent' }}
                onClick={() => action.tab ? setActiveTab(action.tab) : navigate(action.path)}>
                <div className="mb-2">{action.icon}</div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{action.desc}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'overview', label: '📊 薪资总览' },
          { key: 'records', label: '📝 薪资记录' },
          { key: 'items', label: '⚙️ 薪资项目' },
          { key: 'analysis', label: '📈 薪资分析' },
        ]} />

        {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> : (
          <>
            {/* 总览 */}
            {activeTab === 'overview' && (
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="📊 发放状态" size="small">
                    <Row gutter={8}>
                      <Col span={8}><div className="bg-muted rounded p-3 text-center"><div className="text-2xl font-bold">{s.draftCount}</div><div className="text-xs text-muted-foreground">草稿</div></div></Col>
                      <Col span={8}><div className="bg-blue-50 rounded p-3 text-center"><div className="text-2xl font-bold text-blue-600">{s.confirmedCount}</div><div className="text-xs text-muted-foreground">已确认</div></div></Col>
                      <Col span={8}><div className="bg-green-50 rounded p-3 text-center"><div className="text-2xl font-bold text-green-600">{s.paidCount}</div><div className="text-xs text-muted-foreground">已发放</div></div></Col>
                    </Row>
                    {s.draftCount > 0 && <Button type="primary" block className="mt-3" onClick={batchConfirm}>批量确认全部草稿</Button>}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="💰 薪资构成" size="small">
                    {[
                      { label: '基本工资', value: s.totalBase, color: '#1890ff' },
                      { label: '岗位工资', value: s.totalPosition, color: '#13c2c2' },
                      { label: '绩效/加班', value: s.totalPerf, color: '#52c41a' },
                      { label: '各项补贴', value: s.totalAllowance, color: '#fa8c16' },
                      { label: '社保公积金', value: s.totalInsurance, color: '#722ed1' },
                      { label: '代扣个税', value: s.totalTax, color: '#cf1322' },
                    ].map(item => (
                      <div key={item.label} className="mb-2">
                        <div className="flex justify-between text-sm mb-1"><span>{item.label}</span><span className="font-medium">¥{fmt(item.value)}</span></div>
                        <div style={{height:6,background:'#f0f0f0',borderRadius:3}}>
                          <div style={{height:6,width:`${Math.min((item.value / Math.max(s.totalGross, 1)) * 100, 100)}%`,background:item.color,borderRadius:3,transition:'width .3s'}} />
                        </div>
                      </div>
                    ))}
                  </Card>
                </Col>
              </Row>
            )}

            {/* 薪资记录 */}
            {activeTab === 'records' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Tag color="blue">{selectedMonth} 共 {currentMonthRecords.length} 条记录</Tag>
                  {s.draftCount > 0 && <Button type="primary" onClick={batchConfirm}>批量确认</Button>}
                </div>
                <Table dataSource={currentMonthRecords} rowKey="id" loading={loading} pagination={{ pageSize: 10 }}
                  scroll={{ x: 1500 }}
                  columns={[
                    { title: '员工', dataIndex: 'employeeName', key: 'name', width: 100, fixed: 'left' as const },
                    { title: '基本工资', dataIndex: 'baseSalary', key: 'base', width: 100, align: 'right' as const, render: (v: number) => <span>¥{fmt(v)}</span> },
                    { title: '岗位工资', dataIndex: 'positionSalary', key: 'pos', width: 100, align: 'right' as const, render: (v: number) => <span>¥{fmt(v)}</span> },
                    { title: '绩效/加班', key: 'perf', width: 100, align: 'right' as const, render: (_: any, r: ISalaryRecord) => <span className="text-green-600">¥{fmt((r.performance||0)+(r.overtime||0))}</span> },
                    { title: '补贴合计', key: 'allow', width: 90, align: 'right' as const, render: (_: any, r: ISalaryRecord) => <span>¥{fmt((r.mealAllowance||0)+(r.transportAllowance||0)+(r.otherAllowance||0))}</span> },
                    { title: '社保公积金', key: 'ins', width: 110, align: 'right' as const, render: (_: any, r: ISalaryRecord) => <span className="text-orange-600">¥{fmt((r.socialInsurance||0)+(r.medicalInsurance||0)+(r.housingFund||0))}</span> },
                    { title: '个税', dataIndex: 'tax', key: 'tax', width: 80, align: 'right' as const, render: (v: number) => <span className="text-red-500">¥{fmt(v)}</span> },
                    { title: '应发工资', dataIndex: 'grossSalary', key: 'gross', width: 100, align: 'right' as const, render: (v: number) => <span className="font-medium">¥{fmt(v)}</span> },
                    { title: '实发工资', dataIndex: 'netSalary', key: 'net', width: 100, align: 'right' as const, render: (v: number) => <span className="font-bold text-green-600">¥{fmt(v)}</span> },
                    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.label}</Tag> },
                    { title: '操作', key: 'action', width: 180, fixed: 'right' as const, render: (_: any, r: ISalaryRecord) => (
                      <Space size="small" wrap>
                        <Button size="small" type="link" onClick={() => { setSelectedRecord(r); setShowDetailModal(true); }}>详情</Button>
                        {r.status === 'draft' && <>
                          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEditRecord(r)} />
                          <Button size="small" type="link" onClick={() => confirmSalary(r.id)}>确认</Button>
                          <Popconfirm title="确定删除?" onConfirm={() => handleDeleteRecord(r.id)}>
                            <Button size="small" type="link" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </>}
                        {r.status === 'confirmed' && <Button size="small" type="link" style={{color:'#52c41a'}} icon={<CheckCircleOutlined />} onClick={() => paySalary(r.id)}>发放</Button>}
                      </Space>
                    )},
                  ]}
                />
              </div>
            )}

            {/* 薪资项目 */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button type="primary" icon={<PlusOutlined />} onClick={openAddItem}>新增薪资项目</Button>
                </div>
                <Row gutter={16}>
                  {Object.entries(itemTypeCards).map(([type, { label, color }]) => {
                    const items = salaryItems.filter(i => i.type === type);
                    return (
                      <Col span={12} key={type}>
                        <Card size="small" title={label} className={`border ${color}`}>
                          {items.length === 0 ? (
                            <div className="text-center text-muted-foreground py-4 text-sm">暂无此类项目</div>
                          ) : (
                            <Table dataSource={items} rowKey="id" pagination={false} size="small" columns={[
                              { title: '名称', dataIndex: 'name', key: 'name', render: (v: string) => <span className="font-medium">{v}</span> },
                              { title: '编码', dataIndex: 'code', key: 'code', render: (v: string) => <Tag>{v}</Tag> },
                              { title: '默认值', dataIndex: 'defaultValue', key: 'val', align: 'right' as const, render: (v: number) => <span>¥{fmt(v)}</span> },
                              { title: '计税', dataIndex: 'isTaxable', key: 'tax', render: (v: number) => <Tag color={v ? 'green' : 'default'}>{v ? '是' : '否'}</Tag> },
                              { title: '操作', key: 'act', width: 80, render: (_: any, item: ISalaryItem) => (
                                <Space size="small">
                                  <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEditItem(item)} />
                                  <Popconfirm title="确定删除?" onConfirm={() => handleDeleteItem(item.id)}>
                                    <Button size="small" type="link" danger icon={<DeleteOutlined />} />
                                  </Popconfirm>
                                </Space>
                              )},
                            ]} />
                          )}
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            )}

            {/* 薪资分析 */}
            {activeTab === 'analysis' && (
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="📊 薪资档位分布" size="small">
                    {[
                      { label: '5k以下', min: 0, max: 5000 },
                      { label: '5k-10k', min: 5000, max: 10000 },
                      { label: '10k-15k', min: 10000, max: 15000 },
                      { label: '15k-20k', min: 15000, max: 20000 },
                      { label: '20k以上', min: 20000, max: Infinity },
                    ].map(item => {
                      const count = currentMonthRecords.filter(r => (r.netSalary||0) >= item.min && (r.netSalary||0) < item.max).length;
                      const buckets = [0,5000,10000,15000,20000].map((m,i) => currentMonthRecords.filter(r => (r.netSalary||0) >= m && (r.netSalary||0) < [5000,10000,15000,20000,Infinity][i]).length);
                      const maxCount = Math.max(1, ...buckets);
                      return (
                        <div key={item.label} className="mb-2">
                          <div className="flex justify-between text-sm mb-1"><span>{item.label}</span><span className="font-medium">{count}人</span></div>
                          <div style={{height:8,background:'#f0f0f0',borderRadius:4}}>
                            <div style={{height:8,width:`${(count/maxCount)*100}%`,background:'#722ed1',borderRadius:4}} />
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="💰 收入/扣款构成" size="small">
                    <Row gutter={8}>
                      <Col span={8}><div className="bg-green-50 rounded p-3 text-center"><div className="text-xs text-green-600">应发合计</div><div className="text-lg font-bold text-green-700">¥{fmt(s.totalGross)}</div></div></Col>
                      <Col span={8}><div className="bg-orange-50 rounded p-3 text-center"><div className="text-xs text-orange-600">社保公积金</div><div className="text-lg font-bold text-orange-700">¥{fmt(s.totalInsurance)}</div></div></Col>
                      <Col span={8}><div className="bg-red-50 rounded p-3 text-center"><div className="text-xs text-red-600">代扣个税</div><div className="text-lg font-bold text-red-700">¥{fmt(s.totalTax)}</div></div></Col>
                    </Row>
                    <Divider className="my-3" />
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">本月实发总额</div>
                      <div className="text-3xl font-bold text-green-600">¥{fmt(s.totalActualPay)}</div>
                      <div className="text-xs text-muted-foreground mt-1">共 {s.totalEmployees} 人</div>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}
          </>
        )}
      </Card>

      {/* ===== 详情弹窗 ===== */}
      <Modal title="薪资详情" open={showDetailModal} onCancel={() => setShowDetailModal(false)} footer={null} width={520}>
        {selectedRecord && (r => (
          <div className="space-y-4">
            <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-4xl font-bold text-green-700">¥{fmt(r.netSalary || 0)}</div>
              <div className="text-sm text-green-600 mt-1">实发工资 · {r.month}</div>
              <Tag color={STATUS_MAP[r.status]?.color} className="mt-2">{STATUS_MAP[r.status]?.label}</Tag>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">员工</span><span className="font-medium">{r.employeeName}</span></div>
              <Divider className="my-2" />
              <div className="flex justify-between text-sm"><span>基本工资</span><span>¥{fmt(r.baseSalary)}</span></div>
              <div className="flex justify-between text-sm"><span>岗位工资</span><span>¥{fmt(r.positionSalary)}</span></div>
              <div className="flex justify-between text-sm text-green-600"><span>绩效工资</span><span>+¥{fmt(r.performance)}</span></div>
              <div className="flex justify-between text-sm text-green-600"><span>加班费</span><span>+¥{fmt(r.overtime)}</span></div>
              <div className="flex justify-between text-sm text-green-600"><span>餐补/交通/其他</span><span>+¥{fmt((r.mealAllowance||0)+(r.transportAllowance||0)+(r.otherAllowance||0))}</span></div>
              <div className="flex justify-between text-sm text-muted"><span>---</span><span>---</span></div>
              <div className="flex justify-between text-sm"><span>应发工资</span><span className="font-medium">¥{fmt(r.grossSalary)}</span></div>
              <div className="flex justify-between text-sm text-red-400"><span>养老保险</span><span>-¥{fmt(r.socialInsurance)}</span></div>
              <div className="flex justify-between text-sm text-red-400"><span>医疗保险</span><span>-¥{fmt(r.medicalInsurance)}</span></div>
              <div className="flex justify-between text-sm text-red-400"><span>住房公积金</span><span>-¥{fmt(r.housingFund)}</span></div>
              <div className="flex justify-between text-sm text-red-500"><span>个人所得税</span><span>-¥{fmt(r.tax)}</span></div>
              {r.otherDeduction > 0 && <div className="flex justify-between text-sm text-red-500"><span>其他扣款</span><span>-¥{fmt(r.otherDeduction)}</span></div>}
            </div>
          </div>
        ))(selectedRecord)}
      </Modal>

      {/* ===== 编辑薪资记录弹窗 ===== */}
      <Modal title={`编辑薪资 — ${editingRecord?.employeeName || ''} ${editingRecord?.month || ''}`}
        open={showEditModal} onOk={handleSaveRecord} onCancel={() => { setShowEditModal(false); setEditingRecord(null); }}
        width={600} okText="保存" cancelText="取消">
        {editingRecord && (
          <div className="space-y-3">
            <Row gutter={12}>
              <Col span={8}><Form.Item label="基本工资"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.baseSalary} onChange={v => setEditingRecord({...editingRecord, baseSalary: v||0})} prefix="¥" /></Form.Item></Col>
              <Col span={8}><Form.Item label="岗位工资"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.positionSalary} onChange={v => setEditingRecord({...editingRecord, positionSalary: v||0})} prefix="¥" /></Form.Item></Col>
              <Col span={8}><Form.Item label="绩效工资"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.performance} onChange={v => setEditingRecord({...editingRecord, performance: v||0})} prefix="¥" /></Form.Item></Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}><Form.Item label="加班费"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.overtime} onChange={v => setEditingRecord({...editingRecord, overtime: v||0})} prefix="¥" /></Form.Item></Col>
              <Col span={8}><Form.Item label="餐补"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.mealAllowance} onChange={v => setEditingRecord({...editingRecord, mealAllowance: v||0})} prefix="¥" /></Form.Item></Col>
              <Col span={8}><Form.Item label="交通补贴"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.transportAllowance} onChange={v => setEditingRecord({...editingRecord, transportAllowance: v||0})} prefix="¥" /></Form.Item></Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}><Form.Item label="养老保险"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.socialInsurance} onChange={v => setEditingRecord({...editingRecord, socialInsurance: v||0})} prefix="¥" /></Form.Item></Col>
              <Col span={8}><Form.Item label="医疗保险"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.medicalInsurance} onChange={v => setEditingRecord({...editingRecord, medicalInsurance: v||0})} prefix="¥" /></Form.Item></Col>
              <Col span={8}><Form.Item label="住房公积金"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.housingFund} onChange={v => setEditingRecord({...editingRecord, housingFund: v||0})} prefix="¥" /></Form.Item></Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}><Form.Item label="其他扣款"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.otherDeduction} onChange={v => setEditingRecord({...editingRecord, otherDeduction: v||0})} prefix="¥" /></Form.Item></Col>
              <Col span={12}><Form.Item label="个人所得税"><InputNumber min={0} style={{width:'100%'}} value={editingRecord.tax} onChange={v => setEditingRecord({...editingRecord, tax: v||0})} prefix="¥" /></Form.Item></Col>
            </Row>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <span className="text-muted-foreground">实发工资：</span>
              <span className="text-2xl font-bold text-green-700 ml-2">
                ¥{fmt(
                  (editingRecord.baseSalary||0)+(editingRecord.positionSalary||0)+(editingRecord.performance||0)+(editingRecord.overtime||0)+(editingRecord.mealAllowance||0)+(editingRecord.transportAllowance||0)+(editingRecord.otherAllowance||0)
                  -(editingRecord.socialInsurance||0)-(editingRecord.medicalInsurance||0)-(editingRecord.housingFund||0)-(editingRecord.otherDeduction||0)-(editingRecord.tax||0)
                )}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* ===== 新增/编辑薪资项目弹窗 ===== */}
      <Modal title={editingItem ? '编辑薪资项目' : '新增薪资项目'} open={showItemModal}
        onOk={handleSaveItem} onCancel={() => setShowItemModal(false)} width={480}
        okText="保存" cancelText="取消">
        <Form form={itemForm} layout="vertical" className="mt-4">
          <Row gutter={12}>
            <Col span={12}><Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入名称' }]}><Input placeholder="如：基本工资" /></Form.Item></Col>
            <Col span={12}><Form.Item name="code" label="项目编码"><Input placeholder="如：BASE" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="type" label="项目类型" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'earnings', label: '💰 应发项' },
                  { value: 'allowance', label: '🛡️ 补贴项' },
                  { value: 'deductions', label: '➖ 扣款项' },
                  { value: 'insurance', label: '🏥 社保项' },
                  { value: 'tax', label: '📋 税务项' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}><Form.Item name="category" label="所属分类"><Input placeholder="salary" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="defaultValue" label="默认值"><InputNumber min={0} style={{width:'100%'}} prefix="¥" /></Form.Item></Col>
            <Col span={8}><Form.Item name="sortOrder" label="排序号"><InputNumber min={0} style={{width:'100%'}} /></Form.Item></Col>
            <Col span={8}><Form.Item name="dataType" label="数据类型"><Select options={[{value:'number',label:'数字'},{value:'text',label:'文本'},{value:'date',label:'日期'}]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="isActive" label="启用" valuePropName="checked"><span className="text-xs text-muted-foreground">勾选=启用</span></Form.Item></Col>
            <Col span={12}><Form.Item name="isTaxable" label="是否计税" valuePropName="checked"><span className="text-xs text-muted-foreground">勾选=计入个税基数</span></Form.Item></Col>
          </Row>
          <Form.Item name="formula" label="计算公式（可选）"><Input placeholder="如：baseSalary * 0.2" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
