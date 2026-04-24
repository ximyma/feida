import React, { useState, useEffect } from 'react';

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
  status: 'pending' | 'calculated' | 'paid';
  paidAt?: string;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
}

export default function SalaryTablePage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'department' | 'report' | 'adjust'>('personal');
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 筛选
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 详情弹窗
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  
  // 调薪表单
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    employeeId: '',
    adjustType: 'rise',
    amount: 0,
    reason: '',
    effectiveDate: '',
  });

  useEffect(() => {
    loadData();
  }, [monthFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [salaryRes, empRes] = await Promise.all([
        fetch(`/api/salaries?month=${monthFilter}`),
        fetch('/api/employees'),
      ]);
      
      const salaryData = await salaryRes.json();
      const empData = await empRes.json();
      
      setSalaries(Array.isArray(salaryData) ? salaryData : []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (e) {
      console.error('加载数据失败:', e);
    }
    setLoading(false);
  };

  const filteredSalaries = salaries.filter(s => {
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  // 部门汇总
  const getDepartmentSummary = () => {
    const deptMap = new Map<string, { count: number; total: number; baseTotal: number; bonusTotal: number }>();
    
    salaries.forEach(s => {
      const dept = employees.find(e => e.id === s.employeeId)?.department || '未知';
      const existing = deptMap.get(dept) || { count: 0, total: 0, baseTotal: 0, bonusTotal: 0 };
      deptMap.set(dept, {
        count: existing.count + 1,
        total: existing.total + (s.netSalary || 0),
        baseTotal: existing.baseTotal + (s.baseSalary || 0) + (s.positionSalary || 0),
        bonusTotal: existing.bonusTotal + (s.performance || 0) + (s.overtime || 0),
      });
    });
    
    return Array.from(deptMap.entries()).map(([dept, data]) => ({
      department: dept,
      ...data,
      avgSalary: data.count > 0 ? Math.round(data.total / data.count) : 0,
    }));
  };

  const handleMarkPaid = async (salary: Salary) => {
    try {
      await fetch(`/api/salaries/${salary.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paidAt: new Date().toISOString() }),
      });
      loadData();
    } catch (e) {
      console.error('更新失败:', e);
    }
  };

  const handleExport = () => {
    const headers = ['员工姓名', '员工ID', '部门', '基本工资', '岗位工资', '绩效', '加班费', '补贴', '社保', '公积金', '个税', '应发工资', '实发工资', '状态'];
    const rows = filteredSalaries.map(s => {
      const emp = employees.find(e => e.id === s.employeeId);
      return [
        s.employeeName,
        s.employeeId,
        emp?.department || '',
        s.baseSalary || 0,
        s.positionSalary || 0,
        s.performance || 0,
        s.overtime || 0,
        (s.mealAllowance || 0) + (s.transportAllowance || 0) + (s.otherAllowance || 0),
        s.socialInsurance || 0,
        s.housingFund || 0,
        s.tax || 0,
        s.grossSalary || 0,
        s.netSalary || 0,
        s.status === 'paid' ? '已发放' : s.status === 'calculated' ? '已核算' : '待核算',
      ].join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `工资表_${monthFilter}.csv`;
    a.click();
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const renderPersonalTab = () => (
    <div>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">月份</label>
          <input
            type="month"
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">状态</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">全部</option>
            <option value="pending">待核算</option>
            <option value="calculated">已核算</option>
            <option value="paid">已发放</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleExport} className="px-4 py-2 border rounded-lg hover:bg-accent">
            导出CSV
          </button>
        </div>
      </div>
      
      <div className="bg-card border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">员工</th>
              <th className="p-3 text-left">部门</th>
              <th className="p-3 text-right">基本工资</th>
              <th className="p-3 text-right">岗位工资</th>
              <th className="p-3 text-right">绩效</th>
              <th className="p-3 text-right">应发合计</th>
              <th className="p-3 text-right">扣款合计</th>
              <th className="p-3 text-right">实发工资</th>
              <th className="p-3 text-center">状态</th>
              <th className="p-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSalaries.length === 0 ? (
              <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">暂无工资数据</td></tr>
            ) : (
              filteredSalaries.map(salary => {
                const emp = employees.find(e => e.id === salary.employeeId);
                const deductions = (salary.socialInsurance || 0) + (salary.medicalInsurance || 0) + 
                                  (salary.housingFund || 0) + (salary.otherDeduction || 0) + (salary.tax || 0);
                return (
                  <tr key={salary.id} className="hover:bg-accent/30">
                    <td className="p-3">
                      <p className="font-medium">{salary.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{salary.employeeId}</p>
                    </td>
                    <td className="p-3 text-sm">{emp?.department || '-'}</td>
                    <td className="p-3 text-right">{(salary.baseSalary || 0).toLocaleString()}</td>
                    <td className="p-3 text-right">{(salary.positionSalary || 0).toLocaleString()}</td>
                    <td className="p-3 text-right">{(salary.performance || 0).toLocaleString()}</td>
                    <td className="p-3 text-right font-medium">{(salary.grossSalary || 0).toLocaleString()}</td>
                    <td className="p-3 text-right text-red-500">-{deductions.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-green-600">{(salary.netSalary || 0).toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        salary.status === 'paid' ? 'bg-green-100 text-green-700' :
                        salary.status === 'calculated' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {salary.status === 'paid' ? '已发放' : salary.status === 'calculated' ? '已核算' : '待核算'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => setSelectedSalary(salary)} className="text-primary hover:underline mr-2">详情</button>
                      {salary.status !== 'paid' && (
                        <button onClick={() => handleMarkPaid(salary)} className="text-green-600 hover:underline">发放</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDepartmentTab = () => {
    const summary = getDepartmentSummary();
    const totalStaff = summary.reduce((s, d) => s + d.count, 0);
    const totalSalary = summary.reduce((s, d) => s + d.total, 0);
    
    return (
      <div>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">月份</label>
            <input
              type="month"
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">在职人数</p>
            <p className="text-3xl font-bold">{totalStaff}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">工资总额</p>
            <p className="text-3xl font-bold">{totalSalary.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">平均工资</p>
            <p className="text-3xl font-bold">{totalStaff > 0 ? Math.round(totalSalary / totalStaff).toLocaleString() : 0}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">部门数量</p>
            <p className="text-3xl font-bold">{summary.length}</p>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">部门</th>
                <th className="p-3 text-right">人数</th>
                <th className="p-3 text-right">基本/岗位工资</th>
                <th className="p-3 text-right">绩效/加班</th>
                <th className="p-3 text-right">工资总额</th>
                <th className="p-3 text-right">平均工资</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {summary.map(s => (
                <tr key={s.department} className="hover:bg-accent/30">
                  <td className="p-3 font-medium">{s.department}</td>
                  <td className="p-3 text-right">{s.count}</td>
                  <td className="p-3 text-right">{s.baseTotal.toLocaleString()}</td>
                  <td className="p-3 text-right">{s.bonusTotal.toLocaleString()}</td>
                  <td className="p-3 text-right font-medium">{s.total.toLocaleString()}</td>
                  <td className="p-3 text-right font-bold text-green-600">{s.avgSalary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/30">
              <tr>
                <td className="p-3 font-medium">合计</td>
                <td className="p-3 text-right font-medium">{totalStaff}</td>
                <td className="p-3 text-right font-medium">{summary.reduce((s, d) => s + d.baseTotal, 0).toLocaleString()}</td>
                <td className="p-3 text-right font-medium">{summary.reduce((s, d) => s + d.bonusTotal, 0).toLocaleString()}</td>
                <td className="p-3 text-right font-medium">{totalSalary.toLocaleString()}</td>
                <td className="p-3 text-right font-bold">{totalStaff > 0 ? Math.round(totalSalary / totalStaff).toLocaleString() : 0}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const renderReportTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">工资报表</h2>
      
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: '个人月工资明细表', icon: '👤', desc: '查看指定月份员工工资明细' },
          { name: '部门月工资汇总表', icon: '🏢', desc: '按部门汇总月工资数据' },
          { name: '年度工资汇总表', icon: '📅', desc: '按年度汇总工资数据' },
          { name: '工资条发放记录', icon: '📋', desc: '查看工资条发放状态' },
        ].map((report, idx) => (
          <div key={idx} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-2xl mb-2">{report.icon}</div>
            <h3 className="font-medium">{report.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{report.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdjustTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">工资调整</h2>
        <button onClick={() => setShowAdjustDialog(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          + 发起调薪
        </button>
      </div>
      
      <div className="bg-card border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">员工</th>
              <th className="p-3 text-left">部门</th>
              <th className="p-3 text-center">调整类型</th>
              <th className="p-3 text-right">调整金额</th>
              <th className="p-3 text-center">生效日期</th>
              <th className="p-3 text-left">原因</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                暂无调薪记录，点击"发起调薪"创建新的调薪申请
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDetailDialog = () => {
    if (!selectedSalary) return null;
    
    const emp = employees.find(e => e.id === selectedSalary.employeeId);
    const deductions = (selectedSalary.socialInsurance || 0) + (selectedSalary.medicalInsurance || 0) + 
                      (selectedSalary.housingFund || 0) + (selectedSalary.otherDeduction || 0) + (selectedSalary.tax || 0);
    const companyCost = (selectedSalary.netSalary || 0) + (selectedSalary.companyPension || 0) + 
                       (selectedSalary.companyMedical || 0) + (selectedSalary.companyUnemployment || 0) +
                       (selectedSalary.companyInjury || 0) + (selectedSalary.companyMaternity || 0) + 
                       (selectedSalary.companyHousingFund || 0);
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">工资明细 - {selectedSalary.employeeName}</h3>
            <button onClick={() => setSelectedSalary(null)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="p-4 space-y-6">
            <div>
              <h4 className="font-medium mb-3 text-green-700">应发项目</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-muted-foreground">基本工资</p>
                  <p className="text-lg font-bold">{(selectedSalary.baseSalary || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-muted-foreground">岗位工资</p>
                  <p className="text-lg font-bold">{(selectedSalary.positionSalary || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-muted-foreground">绩效工资</p>
                  <p className="text-lg font-bold">{(selectedSalary.performance || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-muted-foreground">加班费</p>
                  <p className="text-lg font-bold">{(selectedSalary.overtime || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-muted-foreground">各项补贴</p>
                  <p className="text-lg font-bold">{((selectedSalary.mealAllowance || 0) + (selectedSalary.transportAllowance || 0) + (selectedSalary.otherAllowance || 0)).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-muted-foreground">应发工资</p>
                  <p className="text-lg font-bold text-green-600">{(selectedSalary.grossSalary || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-red-700">扣款项目</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-50 rounded">
                  <p className="text-sm text-muted-foreground">社保</p>
                  <p className="text-lg font-bold">{(selectedSalary.socialInsurance || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <p className="text-sm text-muted-foreground">公积金</p>
                  <p className="text-lg font-bold">{(selectedSalary.housingFund || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <p className="text-sm text-muted-foreground">个税</p>
                  <p className="text-lg font-bold">{(selectedSalary.tax || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-muted-foreground">实发工资</p>
                  <p className="text-3xl font-bold text-green-600">{(selectedSalary.netSalary || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">公司总成本</p>
                  <p className="text-xl font-bold">{companyCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdjustDialog = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">发起调薪</h3>
          <button onClick={() => setShowAdjustDialog(false)} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">选择员工</label>
            <select
              value={adjustForm.employeeId}
              onChange={e => setAdjustForm({ ...adjustForm, employeeId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">请选择员工</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} - {e.department}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">调薪类型</label>
            <select
              value={adjustForm.adjustType}
              onChange={e => setAdjustForm({ ...adjustForm, adjustType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="rise">普调</option>
              <option value="individual">个别调薪</option>
              <option value="bonus">奖金</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">调整金额</label>
            <input
              type="number"
              value={adjustForm.amount}
              onChange={e => setAdjustForm({ ...adjustForm, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">生效日期</label>
            <input
              type="date"
              value={adjustForm.effectiveDate}
              onChange={e => setAdjustForm({ ...adjustForm, effectiveDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">调薪原因</label>
            <textarea
              value={adjustForm.reason}
              onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={() => setShowAdjustDialog(false)} className="px-4 py-2 border rounded-lg hover:bg-accent">取消</button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">提交</button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">💵 薪资核算表格</h1>
          <p className="text-sm text-muted-foreground mt-1">查看工资明细、部门汇总、工资报表</p>
        </div>
      </div>
      
      <div className="border-b mb-4">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('personal')} className={`px-4 py-2 border-b-2 ${activeTab === 'personal' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            个人月工资
          </button>
          <button onClick={() => setActiveTab('department')} className={`px-4 py-2 border-b-2 ${activeTab === 'department' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            部门汇总
          </button>
          <button onClick={() => setActiveTab('report')} className={`px-4 py-2 border-b-2 ${activeTab === 'report' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            工资报表
          </button>
          <button onClick={() => setActiveTab('adjust')} className={`px-4 py-2 border-b-2 ${activeTab === 'adjust' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            工资调整
          </button>
        </div>
      </div>
      
      {activeTab === 'personal' && renderPersonalTab()}
      {activeTab === 'department' && renderDepartmentTab()}
      {activeTab === 'report' && renderReportTab()}
      {activeTab === 'adjust' && renderAdjustTab()}
      
      {selectedSalary && renderDetailDialog()}
      {showAdjustDialog && renderAdjustDialog()}
    </div>
  );
}
