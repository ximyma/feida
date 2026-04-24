import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Button, Modal, Tag, Space, Popconfirm, message,
  Row, Col, Statistic, Progress, Alert, Tabs, Divider, InputNumber
} from 'antd';
import {
  DollarOutlined, SettingOutlined, BarChartOutlined,
  FileTextOutlined, TeamOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, CheckCircleOutlined
} from '@ant-design/icons';

interface ISalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deduction: number;
  tax: number;
  insurance: number;
  actualPay: number;
  status: 'draft' | 'confirmed' | 'paid';
  payDate?: string;
}

interface ISalaryItem {
  id: string;
  name: string;
  type: 'income' | 'deduction';
  category: string;
  formula: string;
  isFixed: boolean;
  defaultValue: number;
}

const statusMap: Record<string, { label: string; className: string; color: string }> = {
  draft: { label: '草稿', className: 'bg-muted text-muted-foreground', color: 'default' },
  confirmed: { label: '已确认', className: 'bg-blue-100 text-blue-700', color: 'blue' },
  paid: { label: '已发放', className: 'bg-success/10 text-success', color: 'green' },
};

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
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    Promise.all([
      fetch('/api/salaries').then(r => r.json()).catch(() => []),
      fetch('/api/salary_items').then(r => r.json()).catch(() => []),
    ]).then(([salaryData, itemData]) => {
      setSalaryRecords(Array.isArray(salaryData) ? salaryData : []);
      setSalaryItems(Array.isArray(itemData) ? itemData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const currentMonthRecords = salaryRecords.filter(r => r.month === selectedMonth);

  const stats = {
    totalEmployees: currentMonthRecords.length,
    totalBaseSalary: currentMonthRecords.reduce((sum, r) => sum + r.baseSalary, 0),
    totalBonus: currentMonthRecords.reduce((sum, r) => sum + r.bonus, 0),
    totalDeduction: currentMonthRecords.reduce((sum, r) => sum + r.deduction + r.tax + r.insurance, 0),
    totalActualPay: currentMonthRecords.reduce((sum, r) => sum + r.actualPay, 0),
    draftCount: currentMonthRecords.filter(r => r.status === 'draft').length,
    confirmedCount: currentMonthRecords.filter(r => r.status === 'confirmed').length,
    paidCount: currentMonthRecords.filter(r => r.status === 'paid').length,
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
  };

  const confirmSalary = (id: string) => {
    fetch(`/api/salaries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    }).then(() => fetch('/api/salaries').then(r => r.json()).then(data => setSalaryRecords(Array.isArray(data) ? data : [])));
  };

  const paySalary = (id: string) => {
    fetch(`/api/salaries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid', payDate: new Date().toISOString().slice(0, 10) }),
    }).then(() => fetch('/api/salaries').then(r => r.json()).then(data => setSalaryRecords(Array.isArray(data) ? data : [])));
  };

  const batchConfirm = () => {
    const drafts = currentMonthRecords.filter(r => r.status === 'draft');
    Promise.all(drafts.map(r => 
      fetch(`/api/salaries/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      })
    )).then(() => {
      fetch('/api/salaries').then(r => r.json()).then(data => setSalaryRecords(Array.isArray(data) ? data : []));
      messageApi.success(`已批量确认 ${drafts.length} 条记录`);
    });
  };

  const handleEditRecord = (record: ISalaryRecord) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleDeleteRecord = (record: ISalaryRecord) => {
    fetch(`/api/salaries/${record.id}`, { method: 'DELETE' })
      .then(() => {
        fetch('/api/salaries').then(r => r.json()).then(data => setSalaryRecords(Array.isArray(data) ? data : []));
        messageApi.success('已删除');
      });
  };

  const handleSaveRecord = () => {
    if (editingRecord) {
      const actualPay = editingRecord.baseSalary + editingRecord.bonus - editingRecord.deduction - editingRecord.tax - editingRecord.insurance;
      fetch(`/api/salaries/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingRecord, actualPay }),
      }).then(() => {
        fetch('/api/salaries').then(r => r.json()).then(data => setSalaryRecords(Array.isArray(data) ? data : []));
        setShowEditModal(false);
        setEditingRecord(null);
        messageApi.success('薪资记录已更新');
      });
    }
  };

  // 快捷操作入口
  const quickActions = [
    { title: '工资表', desc: '查看员工工资明细', icon: <FileTextOutlined style={{ fontSize: 28, color: '#1890ff' }} />, path: '/salary/table', color: '#e6f7ff' },
    { title: '薪资配置', desc: '薪资项目、公式配置', icon: <SettingOutlined style={{ fontSize: 28, color: '#52c41a' }} />, path: '/salary/config', color: '#f6ffed' },
    { title: '社保公积金', desc: '企业/个人缴纳配置', icon: <TeamOutlined style={{ fontSize: 28, color: '#fa8c16' }} />, path: '/salary/company', color: '#fff7e6' },
    { title: '薪资分析', desc: '部门对比、趋势分析', icon: <BarChartOutlined style={{ fontSize: 28, color: '#722ed1' }} />, path: '/salary', color: '#f9f0ff', tab: 'analysis' },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">💰 薪资管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理员工薪资、薪资项目、发放记录</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={6}><Card size="small"><Statistic title="本月人数" value={stats.totalEmployees} valueStyle={{ color: '#1890ff' }} prefix={<TeamOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="应发总额" value={stats.totalActualPay} precision={2} prefix="¥" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="奖金总额" value={stats.totalBonus} precision={2} prefix="¥" valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="扣款总额" value={stats.totalDeduction} precision={2} prefix="¥" valueStyle={{ color: '#fa8c16' }} /></Card></Col>
      </Row>

      {/* ⚡ 快捷操作入口 */}
      <Card title="⚡ 快捷操作" size="small">
        <Row gutter={16}>
          {quickActions.map(action => (
            <Col span={6} key={action.path + (action.tab || '')}>
              <Card
                hoverable
                size="small"
                className="text-center cursor-pointer"
                style={{ backgroundColor: action.color, borderColor: 'transparent' }}
                onClick={() => {
                  if (action.tab) setActiveTab(action.tab);
                  else navigate(action.path);
                }}
              >
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

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">📊 发放状态</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span>草稿</span>
                      <span className="font-bold">{stats.draftCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span>已确认</span>
                      <span className="font-bold text-blue-600">{stats.confirmedCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>已发放</span>
                      <span className="font-bold text-green-600">{stats.paidCount}</span>
                    </div>
                  </div>
                  {stats.draftCount > 0 && (
                    <Button type="primary" block className="mt-4" onClick={batchConfirm}>批量确认全部草稿</Button>
                  )}
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">💰 薪资构成</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>基本工资</span><span>{formatMoney(stats.totalBaseSalary)}</span></div>
                      <Progress percent={Math.round((stats.totalBaseSalary / Math.max(stats.totalActualPay, 1)) * 100)} strokeColor="#1890ff" size="small" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>奖金</span><span>{formatMoney(stats.totalBonus)}</span></div>
                      <Progress percent={Math.round((stats.totalBonus / Math.max(stats.totalActualPay, 1)) * 100)} strokeColor="#52c41a" size="small" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>扣款</span><span>{formatMoney(stats.totalDeduction)}</span></div>
                      <Progress percent={Math.round((stats.totalDeduction / Math.max(stats.totalActualPay, 1)) * 100)} strokeColor="#fa8c16" size="small" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'records' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Alert message={`${selectedMonth} 共 ${currentMonthRecords.length} 条记录`} type="info" showIcon className="flex-1" />
                  {stats.draftCount > 0 && <Button type="primary" className="ml-4" onClick={batchConfirm}>批量确认</Button>}
                </div>
                <Table dataSource={currentMonthRecords} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
                  { title: '员工姓名', dataIndex: 'employeeName', key: 'name', width: 100 },
                  { title: '部门', dataIndex: 'department', key: 'dept', width: 100 },
                  { title: '基本工资', dataIndex: 'baseSalary', key: 'base', width: 100, align: 'right' as const, render: (v: number) => formatMoney(v) },
                  { title: '奖金', dataIndex: 'bonus', key: 'bonus', width: 90, align: 'right' as const, render: (v: number) => <span className="text-green-600">+{formatMoney(v)}</span> },
                  { title: '扣款', key: 'deduct', width: 90, align: 'right' as const, render: (_: any, r: ISalaryRecord) => <span className="text-red-500">-{formatMoney(r.deduction + r.tax + r.insurance)}</span> },
                  { title: '应发', dataIndex: 'actualPay', key: 'actual', width: 100, align: 'right' as const, render: (v: number) => <span className="font-bold">{formatMoney(v)}</span> },
                  { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
                  { title: '操作', key: 'action', width: 200, render: (_: any, r: ISalaryRecord) => (
                    <Space size="small">
                      <Button size="small" type="link" onClick={() => { setSelectedRecord(r); setShowDetailModal(true); }}>详情</Button>
                      {r.status === 'draft' && (
                        <>
                          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEditRecord(r)}>编辑</Button>
                          <Button size="small" type="link" onClick={() => confirmSalary(r.id)}>确认</Button>
                          <Popconfirm title="确定删除?" onConfirm={() => handleDeleteRecord(r)}>
                            <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
                          </Popconfirm>
                        </>
                      )}
                      {r.status === 'confirmed' && (
                        <Button size="small" type="link" style={{ color: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => paySalary(r.id)}>发放</Button>
                      )}
                    </Space>
                  )},
                ]} />
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button type="primary" icon={<PlusOutlined />}>新增薪资项目</Button>
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="➕ 收入项目" size="small">
                      <Table dataSource={salaryItems.filter(item => item.type === 'income')} rowKey="id" pagination={false} size="small" columns={[
                        { title: '名称', dataIndex: 'name', key: 'name' },
                        { title: '分类', dataIndex: 'category', key: 'cat' },
                        { title: '默认值', dataIndex: 'defaultValue', key: 'val', render: (v: number) => formatMoney(v) },
                        { title: '类型', dataIndex: 'isFixed', key: 'fixed', render: (v: boolean) => <Tag color={v ? 'blue' : 'orange'}>{v ? '固定' : '计算'}</Tag> },
                      ]} />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="➖ 扣款项目" size="small">
                      <Table dataSource={salaryItems.filter(item => item.type === 'deduction')} rowKey="id" pagination={false} size="small" columns={[
                        { title: '名称', dataIndex: 'name', key: 'name' },
                        { title: '分类', dataIndex: 'category', key: 'cat' },
                        { title: '默认值', dataIndex: 'defaultValue', key: 'val', render: (v: number) => formatMoney(v) },
                        { title: '类型', dataIndex: 'isFixed', key: 'fixed', render: (v: boolean) => <Tag color={v ? 'blue' : 'orange'}>{v ? '固定' : '计算'}</Tag> },
                      ]} />
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">📊 部门薪资对比</h3>
                  <div className="space-y-3">
                    {['技术研发部', '产品设计部', '市场营销部', '人力资源部', '财务部'].map((dept) => {
                      const deptRecords = currentMonthRecords.filter(r => r.department === dept);
                      const avgSalary = deptRecords.length > 0 
                        ? deptRecords.reduce((sum, r) => sum + r.actualPay, 0) / deptRecords.length
                        : 0;
                      return (
                        <div key={dept}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{dept}</span>
                            <span className="font-medium">{formatMoney(avgSalary)}</span>
                          </div>
                          <Progress percent={Math.min(Math.round((avgSalary / 20000) * 100), 100)} strokeColor="#1890ff" size="small" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">📈 薪资分布</h3>
                  <div className="space-y-3">
                    {[
                      { range: '5k以下', min: 0, max: 5000 },
                      { range: '5k-10k', min: 5000, max: 10000 },
                      { range: '10k-15k', min: 10000, max: 15000 },
                      { range: '15k-20k', min: 15000, max: 20000 },
                      { range: '20k以上', min: 20000, max: Infinity },
                    ].map((item) => {
                      const count = currentMonthRecords.filter(r => r.actualPay >= item.min && r.actualPay < item.max).length;
                      const maxCount = Math.max(...[
                        currentMonthRecords.filter(r => r.actualPay < 5000).length,
                        currentMonthRecords.filter(r => r.actualPay >= 5000 && r.actualPay < 10000).length,
                        currentMonthRecords.filter(r => r.actualPay >= 10000 && r.actualPay < 15000).length,
                        currentMonthRecords.filter(r => r.actualPay >= 15000 && r.actualPay < 20000).length,
                        currentMonthRecords.filter(r => r.actualPay >= 20000).length,
                      ]);
                      return (
                        <div key={item.range}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.range}</span>
                            <span>{count}人</span>
                          </div>
                          <Progress percent={Math.round((count / Math.max(maxCount, 1)) * 100)} strokeColor="#722ed1" size="small" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* 薪资详情弹窗 */}
      <Modal title="薪资详情" open={showDetailModal} onCancel={() => setShowDetailModal(false)} footer={null} width={480}>
        {selectedRecord && (
          <div className="space-y-4">
            <div className="text-center py-3 bg-muted/20 rounded-lg">
              <div className="text-3xl font-bold text-primary">{formatMoney(selectedRecord.actualPay)}</div>
              <div className="text-sm text-muted-foreground mt-1">实发工资 · {selectedRecord.month}</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">员工</span><span>{selectedRecord.employeeName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">部门</span><span>{selectedRecord.department}</span></div>
              <Divider className="my-2" />
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">基本工资</span><span>{formatMoney(selectedRecord.baseSalary)}</span></div>
              <div className="flex justify-between text-sm text-green-600"><span>奖金</span><span>+{formatMoney(selectedRecord.bonus)}</span></div>
              <div className="flex justify-between text-sm text-red-500"><span>个人所得税</span><span>-{formatMoney(selectedRecord.tax)}</span></div>
              <div className="flex justify-between text-sm text-red-500"><span>社保公积金</span><span>-{formatMoney(selectedRecord.insurance)}</span></div>
              <div className="flex justify-between text-sm text-red-500"><span>其他扣款</span><span>-{formatMoney(selectedRecord.deduction)}</span></div>
            </div>
            <div className="text-center pt-3 border-t">
              <Tag color={statusMap[selectedRecord.status]?.color} className="text-sm px-4 py-1">{statusMap[selectedRecord.status]?.label}</Tag>
            </div>
          </div>
        )}
      </Modal>

      {/* 编辑薪资记录弹窗 */}
      <Modal title="编辑薪资记录" open={showEditModal} onOk={handleSaveRecord} onCancel={() => { setShowEditModal(false); setEditingRecord(null); }} width={480}>
        {editingRecord && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">{editingRecord.employeeName} · {editingRecord.month}</div>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-muted-foreground mb-1">基本工资</div>
                <InputNumber min={0} style={{ width: '100%' }} value={editingRecord.baseSalary} onChange={v => setEditingRecord({ ...editingRecord, baseSalary: v || 0 })} prefix="¥" />
              </Col>
              <Col span={12}>
                <div className="text-xs text-muted-foreground mb-1">奖金</div>
                <InputNumber min={0} style={{ width: '100%' }} value={editingRecord.bonus} onChange={v => setEditingRecord({ ...editingRecord, bonus: v || 0 })} prefix="¥" />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-muted-foreground mb-1">其他扣款</div>
                <InputNumber min={0} style={{ width: '100%' }} value={editingRecord.deduction} onChange={v => setEditingRecord({ ...editingRecord, deduction: v || 0 })} prefix="¥" />
              </Col>
              <Col span={12}>
                <div className="text-xs text-muted-foreground mb-1">个人所得税</div>
                <InputNumber min={0} style={{ width: '100%' }} value={editingRecord.tax} onChange={v => setEditingRecord({ ...editingRecord, tax: v || 0 })} prefix="¥" />
              </Col>
            </Row>
            <div>
              <div className="text-xs text-muted-foreground mb-1">社保公积金</div>
              <InputNumber min={0} style={{ width: '100%' }} value={editingRecord.insurance} onChange={v => setEditingRecord({ ...editingRecord, insurance: v || 0 })} prefix="¥" />
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <span className="text-muted-foreground">实发工资：</span>
              <span className="text-2xl font-bold text-primary ml-2">
                {formatMoney(editingRecord.baseSalary + editingRecord.bonus - editingRecord.deduction - editingRecord.tax - editingRecord.insurance)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


