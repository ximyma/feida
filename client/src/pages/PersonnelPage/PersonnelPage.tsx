import React, { useState, useEffect } from 'react';

interface IEmployee {
  id: string; name: string; employeeId: string; department: string; position: string;
  rank: string; status: 'active' | 'inactive' | 'pending' | 'terminated';
  hireDate: string; phone: string; email: string; salaryLocation: string;
  birthday?: string; gender?: string; education?: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: '在职', className: 'bg-success/10 text-success' },
  pending: { label: '待入职', className: 'bg-yellow-100 text-yellow-700' },
  inactive: { label: '离职', className: 'bg-muted text-muted-foreground' },
  terminated: { label: '已辞退', className: 'bg-destructive/10 text-destructive' },
};

export default function PersonnelPage() {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetch('/api/employees')
      .then(r => r.json())
      .then(data => { setEmployees(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const departments = [...new Set(employees.map(e => e.department))];

  const filtered = employees.filter(e => {
    const matchFilter = !filter || e.name.includes(filter) || e.employeeId.includes(filter) || e.phone.includes(filter);
    const matchDept = !deptFilter || e.department === deptFilter;
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchFilter && matchDept && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">👥 人事管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理员工档案、合同、异动等信息</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 flex flex-wrap gap-3">
        <input value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          placeholder="搜索姓名/工号/手机号" className="flex-1 min-w-[200px] px-3 py-2 border border-input rounded-lg text-sm bg-background" />
        <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">全部部门</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">全部状态</option>
          <option value="active">在职</option>
          <option value="pending">待入职</option>
          <option value="inactive">离职</option>
        </select>
        <span className="px-3 py-2 text-sm text-muted-foreground">共 {filtered.length} 人</span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">工号</th>
                <th className="text-left p-3 font-medium">姓名</th>
                <th className="text-left p-3 font-medium">部门</th>
                <th className="text-left p-3 font-medium">职位</th>
                <th className="text-left p-3 font-medium">职级</th>
                <th className="text-left p-3 font-medium">入职日期</th>
                <th className="text-left p-3 font-medium">手机号</th>
                <th className="text-left p-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center p-8 text-muted-foreground">加载中...</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-8 text-muted-foreground">暂无数据</td></tr>
              ) : pageData.map((emp, i) => (
                <tr key={emp.id} className={`border-b hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                  <td className="p-3 font-mono text-xs">{emp.employeeId}</td>
                  <td className="p-3 font-medium">{emp.name}</td>
                  <td className="p-3">{emp.department}</td>
                  <td className="p-3">{emp.position}</td>
                  <td className="p-3">{emp.rank}</td>
                  <td className="p-3">{emp.hireDate}</td>
                  <td className="p-3 text-xs">{emp.phone}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[emp.status]?.className || ''}`}>
                      {statusMap[emp.status]?.label || emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <span className="text-sm text-muted-foreground">第 {page} / {totalPages} 页</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 rounded border text-sm hover:bg-muted disabled:opacity-50">上一页</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 rounded border text-sm hover:bg-muted disabled:opacity-50">下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
