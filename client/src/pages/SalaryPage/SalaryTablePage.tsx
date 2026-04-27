import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Select, InputNumber, Tag,
  Space, Popconfirm, message, Row, Col, Statistic, Drawer, Descriptions
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// ============ 与 DB salaries 表字段完全对应 ============
interface Salary {
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
  companyPension: number;
  companyMedical: number;
  companyUnemployment: number;
  companyInjury: number;
  companyMaternity: number;
  companyHousingFund: number;
  companyTotal: number;
  status: 'draft' | 'confirmed' | 'paid';
  paidAt?: string;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  confirmed: { label: '已确认', color: 'blue' },
  paid: { label: '已发放', color: 'green' },
};

const fmt = (n: number) => (n || 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 });

export default function SalaryTablePage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'department' | 'report' | 'adjust'>('personal');
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const loadSalaries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/salaries?month=${monthFilter}`);
      const json = await res.json();
      setSalaries(Array.isArray(json) ? json : []);
    } catch { messageApi.error('加载工资数据失败'); }
    setLoading(false);
  };

  const loadEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const json = await res.json();
      setEmployees(Array.isArray(json) ? json : []);
    } catch {}
  };

  useEffect(() => { loadSalaries(); loadEmployees(); }, [monthFilter]);

  const getEmpDept = (empId: string) => employees.find(e => e.id === empId)?.department || '-';
  const getEmpPos = (empId: string) => employees.find(e => e.id === empId)?.position || '-';

  const filteredSalaries = salaries.filter(s => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (deptFilter && getEmpDept(s.employeeId) !== deptFilter) return false;
    return true;
  });

  // 部门汇总
  const getDepartmentSummary = () => {
    const deptMap = new Map<string, { count: number; totalNet: number; totalGross: number; totalBase: number }>();
    salaries.forEach(s => {
      const dept = getEmpDept(s.employeeId);
      const prev = deptMap.get(dept) || { count: 0, totalNet: 0, totalGross: 0, totalBase: 0 };
      deptMap.set(dept, {
        count: prev.count + 1,
        totalNet: prev.totalNet + (s.netSalary || 0),
        totalGross: prev.totalGross + (s.grossSalary || 0),
        totalBase: prev.totalBase + (s.baseSalary || 0) + (s.positionSalary || 0),
      });
    });
    return Array.from(deptMap.entries())
      .map(([dept, data]) => ({ department: dept, ...data, avgNet: data.count > 0 ? Math.round(data.totalNet / data.count) : 0 }))
      .sort((a, b) => b.totalNet - a.totalNet);
  };

  // 标记发放
  const handleMarkPaid = async (salary: Salary) => {
    await fetch(`/api/salaries/${salary.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid', paidAt: new Date().toISOString() }),
    });
    messageApi.success('已标记为已发放');
    loadSalaries();
  };

  // 删除记录
  const handleDelete = async (id: string) => {
    await fetch(`/api/salaries/${id}`, { method: 'DELETE' });
    messageApi.success('已删除');
    loadSalaries();
  };

  // 导出 CSV
  const handleExport = () => {
    const headers = ['姓名','部门','月份','基本工资','岗位工资','绩效','加班','餐补','交通','应发合计','社保公积金','个税','其他扣款','实发工资','状态'];
    const rows = filteredSalaries.map(s => [
      s.employeeName, getEmpDept(s.employeeId), s.month,
      s.baseSalary||0, s.positionSalary||0, s.performance||0, s.overtime||0,
      (s.mealAllowance||0)+(s.transportAllowance||0)+(s.otherAllowance||0),
      (s.socialInsurance||0)+(s.medicalInsurance||0)+(s.housingFund||0),
      s.tax||0, s.otherDeduction||0, s.grossSalary||0, s.netSalary||0,
      STATUS_MAP[s.status]?.label || s.status,
    ]);
    const csv = ['\ufeff'+headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `工资表_${monthFilter}.csv`; a.click();
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const personalCols = [
    { title: '员工', key: 'emp', width: 160, fixed: 'left' as const, render: (_: any, s: Salary) => (
      <div><div className="font-medium">{s.employeeName}</div><div className="text-xs text-muted-foreground">{getEmpDept(s.employeeId)} · {getEmpPos(s.employeeId)}</div></div>
    )},
    { title: '基本工资', dataIndex: 'baseSalary', key: 'base', width: 100, align: 'right' as const, render: (v: number) => <span>¥{fmt(v)}</span> },
    { title: '岗位工资', dataIndex: 'positionSalary', key: 'pos', width: 100, align: 'right' as const, render: (v: number) => <span>¥{fmt(v)}</span> },
    { title: '绩效', dataIndex: 'performance', key: 'perf', width: 80, align: 'right' as const, render: (v: number) => <span className="text-green-600">¥{fmt(v)}</span> },
    { title: '加班', dataIndex: 'overtime', key: 'ot', width: 80, align: 'right' as const, render: (v: number) => <span>¥{fmt(v)}</span> },
    { title: '补贴', key: 'allow', width: 80, align: 'right' as const, render: (_: any, s: Salary) => <span>¥{fmt((s.mealAllowance||0)+(s.transportAllowance||0)+(s.otherAllowance||0))}</span> },
    { title: '应发', dataIndex: 'grossSalary', key: 'gross', width: 100, align: 'right' as const, render: (v: number) => <span className="font-medium">¥{fmt(v)}</span> },
    { title: '社保公积金', key: 'ins', width: 110, align: 'right' as const, render: (_: any, s: Salary) => <span className="text-orange-600">¥{fmt((s.socialInsurance||0)+(s.medicalInsurance||0)+(s.housingFund||0))}</span> },
    { title: '个税', dataIndex: 'tax', key: 'tax', width: 80, align: 'right' as const, render: (v: number) => <span className="text-red-500">¥{fmt(v)}</span> },
    { title: '实发', dataIndex: 'netSalary', key: 'net', width: 100, align: 'right' as const, render: (v: number) => <span className="font-bold text-green-600">¥{fmt(v)}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.label}</Tag> },
    { title: '操作', key: 'action', width: 150, fixed: 'right' as const, render: (_: any, s: Salary) => (
      <Space size="small" wrap>
        <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedSalary(s); setDrawerVisible(true); }}>详情</Button>
        {s.status !== 'paid' && <Button size="small" type="link" style={{color:'#52c41a'}} onClick={() => handleMarkPaid(s)}>发放</Button>}
        <Popconfirm title="确定删除?" onConfirm={() => handleDelete(s.id)}>
          <Button size="small" type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  const renderPersonalTab = () => (
    <div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">月份</label>
          <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">部门筛选</label>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg min-w-[140px]">
            <option value="">全部部门</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">状态筛选</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg min-w-[120px]">
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="confirmed">已确认</option>
            <option value="paid">已发放</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={() => { setDeptFilter(''); setStatusFilter(''); }}>重置</Button>
          <Button type="primary" onClick={handleExport}>📥 导出CSV</Button>
        </div>
      </div>

      {/* 汇总统计行 */}
      <Row gutter={12} className="mb-3">
        <Col span={4}><div className="bg-blue-50 rounded p-3 text-center"><div className="text-xs text-blue-500">人数</div><div className="text-xl font-bold text-blue-700">{filteredSalaries.length}</div></div></Col>
        <Col span={5}><div className="bg-green-50 rounded p-3 text-center"><div className="text-xs text-green-500">应发总额</div><div className="text-xl font-bold text-green-700">¥{fmt(filteredSalaries.reduce((s,r)=>s+(r.grossSalary||0),0))}</div></div></Col>
        <Col span={5}><div className="bg-orange-50 rounded p-3 text-center"><div className="text-xs text-orange-500">扣除总额</div><div className="text-xl font-bold text-orange-700">¥{fmt(filteredSalaries.reduce((s,r)=>s+(r.socialInsurance||0)+(r.medicalInsurance||0)+(r.housingFund||0)+(r.tax||0)+(r.otherDeduction||0),0))}</div></div></Col>
        <Col span={5}><div className="bg-emerald-50 rounded p-3 text-center"><div className="text-xs text-emerald-500">实发总额</div><div className="text-xl font-bold text-emerald-700">¥{fmt(filteredSalaries.reduce((s,r)=>s+(r.netSalary||0),0))}</div></div></Col>
        <Col span={5}><div className="bg-purple-50 rounded p-3 text-center"><div className="text-xs text-purple-500">平均工资</div><div className="text-xl font-bold text-purple-700">¥{fmt(filteredSalaries.length ? Math.round(filteredSalaries.reduce((s,r)=>s+(r.netSalary||0),0)/filteredSalaries.length) : 0)}</div></div></Col>
      </Row>

      <Table dataSource={filteredSalaries} rowKey="id" columns={personalCols} loading={loading}
        pagination={{ pageSize: 15 }} scroll={{ x: 1400 }} size="middle"
        locale={{ emptyText: '当前月份暂无工资数据' }} />
    </div>
  );

  const renderDepartmentTab = () => {
    const summary = getDepartmentSummary();
    const totalStaff = summary.reduce((s, d) => s + d.count, 0);
    const totalNet = summary.reduce((s, d) => s + d.totalNet, 0);
    const totalGross = summary.reduce((s, d) => s + d.totalGross, 0);
    return (
      <div>
        <Row gutter={16} className="mb-4">
          <Col span={6}><Card size="small"><Statistic title="在职人数" value={totalStaff} /></Card></Col>
          <Col span={6}><Card size="small"><Statistic title="工资总额" value={totalNet} precision={0} prefix="¥" valueStyle={{ color: '#52c41a' }} /></Card></Col>
          <Col span={6}><Card size="small"><Statistic title="应发总额" value={totalGross} precision={0} prefix="¥" /></Card></Col>
          <Col span={6}><Card size="small"><Statistic title="平均实发" value={totalStaff ? Math.round(totalNet/totalStaff) : 0} precision={0} prefix="¥" /></Card></Col>
        </Row>
        <Table
          dataSource={summary}
          rowKey="department"
          pagination={false}
          columns={[
            { title: '部门', dataIndex: 'department', key: 'dept', render: (v: string) => <span className="font-medium">{v}</span> },
            { title: '人数', dataIndex: 'count', key: 'cnt', align: 'right' as const },
            { title: '基本/岗位工资', dataIndex: 'totalBase', key: 'base', align: 'right' as const, render: (v: number) => <span>¥{fmt(v)}</span> },
            { title: '应发总额', dataIndex: 'totalGross', key: 'gross', align: 'right' as const, render: (v: number) => <span>¥{fmt(v)}</span> },
            { title: '实发总额', dataIndex: 'totalNet', key: 'net', align: 'right' as const, render: (v: number) => <span className="font-medium">¥{fmt(v)}</span> },
            { title: '平均实发', dataIndex: 'avgNet', key: 'avg', align: 'right' as const, render: (v: number) => <span className="font-bold text-green-600">¥{fmt(v)}</span> },
          ]}
          size="middle"
        />
      </div>
    );
  };

  const renderReportTab = () => (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: '个人月工资明细表', icon: '👤', desc: '查看指定月份员工工资明细', badge: '推荐' },
          { name: '部门月工资汇总表', icon: '🏢', desc: '按部门汇总月工资数据', badge: '' },
          { name: '年度工资汇总表', icon: '📅', desc: '按年度汇总工资数据', badge: '' },
          { name: '工资条发放记录', icon: '📋', desc: '查看工资条发放状态', badge: '' },
          { name: '社保公积金台账', icon: '🏦', desc: '企业社保公积金缴费记录', badge: '查看' },
          { name: '薪资调整记录', icon: '📝', desc: '员工调薪历史记录', badge: '查看' },
        ].map((report, i) => (
          <Card key={i} hoverable className="cursor-pointer" onClick={() => {
            if (report.name.includes('社保')) setActiveTab('personal');
            if (report.name.includes('调整')) setShowAdjustDialog(true);
          }}>
            <div className="text-3xl mb-2">{report.icon}</div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{report.name}</h3>
              {report.badge && <Tag color="blue">{report.badge}</Tag>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{report.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAdjustTab = () => (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📝</div>
      <h2 className="text-xl font-bold mb-2">薪资调整管理</h2>
      <p className="text-muted-foreground mb-6">管理员工补贴、扣款、普调等调薪记录</p>
      <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setShowAdjustDialog(true)}>
        前往薪资调整
      </Button>
    </div>
  );

  const deptSummary = getDepartmentSummary();
  const totalSummary = {
    staff: salaries.length,
    gross: salaries.reduce((s, r) => s + (r.grossSalary || 0), 0),
    net: salaries.reduce((s, r) => s + (r.netSalary || 0), 0),
  };

  return (
    <div className="p-6">
      {contextHolder}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">💵 薪资核算表格</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {monthFilter} · 共 {salaries.length} 条工资记录 · 实发合计 ¥{fmt(totalSummary.net)}
          </p>
        </div>
      </div>

      <div className="border-b mb-4">
        <div className="flex gap-1 flex-wrap">
          {[
            { key: 'personal', label: '📋 个人月工资' },
            { key: 'department', label: '🏢 部门汇总' },
            { key: 'report', label: '📊 工资报表' },
            { key: 'adjust', label: '📝 薪资调整' },
          ].map(t => (
            <button key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 border-b-2 transition-colors ${activeTab === t.key ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'personal' && renderPersonalTab()}
      {activeTab === 'department' && renderDepartmentTab()}
      {activeTab === 'report' && renderReportTab()}
      {activeTab === 'adjust' && renderAdjustTab()}

      {/* 详情抽屉 */}
      <Drawer title={`工资明细 — ${selectedSalary?.employeeName || ''}`}
        placement="right" width={520} open={drawerVisible}
        onClose={() => { setDrawerVisible(false); setSelectedSalary(null); }}>
        {selectedSalary && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="员工">{selectedSalary.employeeName}</Descriptions.Item>
            <Descriptions.Item label="部门">{getEmpDept(selectedSalary.employeeId)}</Descriptions.Item>
            <Descriptions.Item label="岗位">{getEmpPos(selectedSalary.employeeId)}</Descriptions.Item>
            <Descriptions.Item label="月份">{selectedSalary.month}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={STATUS_MAP[selectedSalary.status]?.color}>{STATUS_MAP[selectedSalary.status]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="基本工资">¥{fmt(selectedSalary.baseSalary)}</Descriptions.Item>
            <Descriptions.Item label="岗位工资">¥{fmt(selectedSalary.positionSalary)}</Descriptions.Item>
            <Descriptions.Item label="绩效工资">¥{fmt(selectedSalary.performance)}</Descriptions.Item>
            <Descriptions.Item label="加班费">¥{fmt(selectedSalary.overtime)}</Descriptions.Item>
            <Descriptions.Item label="餐补/交通/其他">¥{fmt((selectedSalary.mealAllowance||0)+(selectedSalary.transportAllowance||0)+(selectedSalary.otherAllowance||0))}</Descriptions.Item>
            <Descriptions.Item label="应发工资"><span className="font-bold">¥{fmt(selectedSalary.grossSalary)}</span></Descriptions.Item>
            <Descriptions.Item label="养老保险">-¥{fmt(selectedSalary.socialInsurance)}</Descriptions.Item>
            <Descriptions.Item label="医疗保险">-¥{fmt(selectedSalary.medicalInsurance)}</Descriptions.Item>
            <Descriptions.Item label="住房公积金">-¥{fmt(selectedSalary.housingFund)}</Descriptions.Item>
            <Descriptions.Item label="其他扣款">-¥{fmt(selectedSalary.otherDeduction)}</Descriptions.Item>
            <Descriptions.Item label="个人所得税">-¥{fmt(selectedSalary.tax)}</Descriptions.Item>
            <Descriptions.Item label="实发工资">
              <span className="text-green-600 font-bold text-lg">¥{fmt(selectedSalary.netSalary)}</span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
