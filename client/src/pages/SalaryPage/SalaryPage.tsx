import React, { useState, useEffect } from 'react';

export default function SalaryPage() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    Promise.all([
      fetch('/api/employees').then(r => r.json()),
      fetch(`/api/salaries?month=${month}`).then(r => r.json()),
    ]).then(([emps, sals]) => {
      setEmployees(emps);
      setSalaries(Array.isArray(sals) ? sals : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [month]);

  const totalGross = salaries.reduce((sum, s) => sum + (s.grossSalary || 0), 0);
  const totalNet = salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);
  const totalCompany = salaries.reduce((sum, s) => sum + (s.companyTotal || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">💰 薪酬管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理工资表、社保、个税等薪酬数据</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground mb-1">应发工资合计</div>
          <div className="text-2xl font-bold text-primary">¥{totalGross.toLocaleString()}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground mb-1">实发工资合计</div>
          <div className="text-2xl font-bold text-success">¥{totalNet.toLocaleString()}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground mb-1">企业缴纳合计</div>
          <div className="text-2xl font-bold text-orange-500">¥{totalCompany.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium">选择月份：</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg text-sm bg-background" />
          <span className="text-sm text-muted-foreground">共 {salaries.length} 条记录</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : salaries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">暂无 {month} 月工资数据</p>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
              批量生成工资表
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {['姓名', '工号', '部门', '基础工资', '绩效', '应发合计', '社保公积金', '个税', '实发工资'].map(h => (
                    <th key={h} className="text-left p-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salaries.slice(0, 20).map((s, i) => (
                  <tr key={s.id || i} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{s.employeeName || employees.find(e => e.employeeId === s.employeeId)?.name || '-'}</td>
                    <td className="p-3 font-mono text-xs">{s.employeeId}</td>
                    <td className="p-3">{employees.find(e => e.employeeId === s.employeeId)?.department || '-'}</td>
                    <td className="p-3">¥{(s.baseSalary || 0).toLocaleString()}</td>
                    <td className="p-3">¥{(s.performance || 0).toLocaleString()}</td>
                    <td className="p-3 font-medium">¥{(s.grossSalary || 0).toLocaleString()}</td>
                    <td className="p-3 text-destructive">-¥{((s.socialInsurance || 0) + (s.housingFund || 0)).toLocaleString()}</td>
                    <td className="p-3 text-destructive">-¥{(s.tax || 0).toLocaleString()}</td>
                    <td className="p-3 font-bold text-success">¥{(s.netSalary || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
