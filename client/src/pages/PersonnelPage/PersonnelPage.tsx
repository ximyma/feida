import React, { useState, useEffect } from 'react';

interface IEmployee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  departmentId?: string;
  position: string;
  positionId?: string;
  rank: string;
  rankId?: string;
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  hireDate: string;
  phone: string;
  email: string;
  salaryLocation: string;
  birthday?: string;
  gender?: 'male' | 'female';
  education?: string;
  major?: string;
  idCard?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bankName?: string;
  bankAccount?: string;
}

interface IContract {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  signDate?: string;
}

interface IChange {
  id: string;
  employeeId: string;
  type: string;
  fromValue: string;
  toValue: string;
  effectiveDate: string;
  status: string;
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
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);
  const [detailTab, setDetailTab] = useState('basic');
  const [contracts, setContracts] = useState<IContract[]>([]);
  const [changes, setChanges] = useState<IChange[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(null);
  const pageSize = 15;

  useEffect(() => {
    fetch('/api/employees')
      .then(r => r.json())
      .then(data => { setEmployees(Array.isArray(data) ? data : []); setLoading(false); })
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

  // 统计数据
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    pending: employees.filter(e => e.status === 'pending').length,
    inactive: employees.filter(e => e.status === 'inactive').length,
    thisMonth: employees.filter(e => e.hireDate?.startsWith(new Date().toISOString().slice(0, 7))).length,
  };

  // 查看员工详情
  const viewEmployee = (emp: IEmployee) => {
    setSelectedEmployee(emp);
    setDetailTab('basic');
    // 加载合同和异动记录
    Promise.all([
      fetch(`/api/contracts?employeeId=${emp.id}`).then(r => r.json()),
      fetch(`/api/employee_changes?employeeId=${emp.id}`).then(r => r.json()),
    ]).then(([contractData, changeData]) => {
      setContracts(Array.isArray(contractData) ? contractData : []);
      setChanges(Array.isArray(changeData) ? changeData : []);
    });
  };

  // 保存员工
  const saveEmployee = (emp: Partial<IEmployee>) => {
    const method = editingEmployee ? 'PUT' : 'POST';
    const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emp),
    })
      .then(r => r.json())
      .then(() => {
        setShowAddModal(false);
        setEditingEmployee(null);
        fetch('/api/employees')
          .then(r => r.json())
          .then(data => setEmployees(Array.isArray(data) ? data : []));
      });
  };

  // 删除员工
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const deleteEmployee = (id: string) => {
    fetch(`/api/employees/${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(() => {
        setShowDeleteConfirm(null);
        setSelectedEmployee(null);
        fetch('/api/employees')
          .then(r => r.json())
          .then(data => setEmployees(Array.isArray(data) ? data : []));
      })
      .catch(err => console.error('删除失败:', err));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">👥 人事管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理员工档案、合同、异动等信息</p>
        </div>
        <button
          onClick={() => { setEditingEmployee(null); setShowAddModal(true); }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <span>+</span> 新增员工
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="员工总数" value={stats.total} icon="👥" color="blue" />
        <StatCard label="在职人数" value={stats.active} icon="✅" color="green" />
        <StatCard label="待入职" value={stats.pending} icon="⏳" color="yellow" />
        <StatCard label="已离职" value={stats.inactive} icon="🚪" color="gray" />
        <StatCard label="本月入职" value={stats.thisMonth} icon="📅" color="purple" />
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
                <th className="text-left p-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">加载中...</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">暂无数据</td></tr>
              ) : pageData.map((emp, i) => (
                <tr key={emp.id} className={`border-b hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                  <td className="p-3 font-mono text-xs">{emp.employeeId}</td>
                  <td className="p-3">
                    <button
                      onClick={() => viewEmployee(emp)}
                      className="font-medium text-primary hover:underline text-left"
                    >
                      {emp.name}
                    </button>
                  </td>
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
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => viewEmployee(emp)} className="text-primary hover:underline text-xs">查看</button>
                      <button onClick={() => { setEditingEmployee(emp); setShowAddModal(true); }} className="text-yellow-600 hover:underline text-xs">编辑</button>
                      <button onClick={() => setShowDeleteConfirm(emp.id)} className="text-red-600 hover:underline text-xs">删除</button>
                    </div>
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

      {/* 员工详情弹窗 */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 弹窗头部 */}
            <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedEmployee.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.employeeId} · {selectedEmployee.department} · {selectedEmployee.position}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[selectedEmployee.status]?.className}`}>
                    {statusMap[selectedEmployee.status]?.label}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="text-muted-foreground hover:text-foreground text-2xl">&times;</button>
            </div>

            {/* Tab 切换 */}
            <div className="border-b px-6">
              {['basic', 'work', 'contract', 'salary', 'change'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    detailTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'basic' && '📋 基本信息'}
                  {tab === 'work' && '💼 工作信息'}
                  {tab === 'contract' && '📄 合同记录'}
                  {tab === 'salary' && '💰 薪资信息'}
                  {tab === 'change' && '🔄 异动记录'}
                </button>
              ))}
            </div>

            {/* Tab 内容 */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailTab === 'basic' && (
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="工号" value={selectedEmployee.employeeId} />
                  <InfoRow label="姓名" value={selectedEmployee.name} />
                  <InfoRow label="性别" value={selectedEmployee.gender === 'male' ? '男' : selectedEmployee.gender === 'female' ? '女' : '-'} />
                  <InfoRow label="出生日期" value={selectedEmployee.birthday} />
                  <InfoRow label="身份证号" value={selectedEmployee.idCard} />
                  <InfoRow label="学历" value={selectedEmployee.education} />
                  <InfoRow label="专业" value={selectedEmployee.major} />
                  <InfoRow label="手机号" value={selectedEmployee.phone} />
                  <InfoRow label="邮箱" value={selectedEmployee.email} />
                  <InfoRow label="现住址" value={selectedEmployee.address} span2 />
                  <InfoRow label="紧急联系人" value={selectedEmployee.emergencyContact} />
                  <InfoRow label="紧急联系电话" value={selectedEmployee.emergencyPhone} />
                  <InfoRow label="开户银行" value={selectedEmployee.bankName} />
                  <InfoRow label="银行账号" value={selectedEmployee.bankAccount} />
                </div>
              )}

              {detailTab === 'work' && (
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="部门" value={selectedEmployee.department} />
                  <InfoRow label="职位" value={selectedEmployee.position} />
                  <InfoRow label="职级" value={selectedEmployee.rank} />
                  <InfoRow label="入职日期" value={selectedEmployee.hireDate} />
                  <InfoRow label="薪资地点" value={selectedEmployee.salaryLocation} />
                  <InfoRow label="员工状态" value={statusMap[selectedEmployee.status]?.label} />
                </div>
              )}

              {detailTab === 'contract' && (
                <div>
                  {contracts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">暂无合同记录</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">合同类型</th>
                          <th className="text-left p-3 font-medium">开始日期</th>
                          <th className="text-left p-3 font-medium">结束日期</th>
                          <th className="text-left p-3 font-medium">签订日期</th>
                          <th className="text-left p-3 font-medium">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contracts.map((c, i) => (
                          <tr key={c.id} className={`border-b ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                            <td className="p-3">{c.type}</td>
                            <td className="p-3">{c.startDate}</td>
                            <td className="p-3">{c.endDate}</td>
                            <td className="p-3">{c.signDate || '-'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                c.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                              }`}>
                                {c.status === 'active' ? '有效' : c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {detailTab === 'salary' && (
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-muted-foreground text-sm">当前薪资信息暂未开放</div>
                    <div className="text-xs text-muted-foreground mt-1">请联系HR部门查询</div>
                  </div>
                </div>
              )}

              {detailTab === 'change' && (
                <div>
                  {changes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">暂无异动记录</div>
                  ) : (
                    <div className="space-y-3">
                      {changes.map(c => (
                        <div key={c.id} className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{c.type}</span>
                            <span className="text-xs text-muted-foreground">{c.effectiveDate}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {c.fromValue} → {c.toValue}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 弹窗底部 */}
            <div className="border-t p-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 border border-input rounded-lg hover:bg-muted"
              >
                关闭
              </button>
              <button
                onClick={() => { setEditingEmployee(selectedEmployee); setSelectedEmployee(null); setShowAddModal(true); }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                编辑信息
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增/编辑员工弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{editingEmployee ? '编辑员工' : '新增员工'}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <EmployeeForm
                employee={editingEmployee}
                onSave={saveEmployee}
                onCancel={() => { setShowAddModal(false); setEditingEmployee(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">确认删除</h3>
              <p className="text-muted-foreground mb-6">确定要删除此员工吗？此操作不可撤销。</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-2 border border-input rounded-lg hover:bg-muted"
                >
                  取消
                </button>
                <button
                  onClick={() => deleteEmployee(showDeleteConfirm)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 统计卡片组件
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    yellow: 'bg-yellow-500/10 text-yellow-600',
    gray: 'bg-gray-500/10 text-gray-600',
    purple: 'bg-purple-500/10 text-purple-600',
  };
  return (
    <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs opacity-80">{label}</div>
        </div>
      </div>
    </div>
  );
}

// 信息行组件
function InfoRow({ label, value, span2 }: { label: string; value?: string; span2?: boolean }) {
  return (
    <div className={`bg-muted/30 rounded-lg p-3 ${span2 ? 'col-span-2' : ''}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium mt-1">{value || '-'}</div>
    </div>
  );
}

// 员工表单组件
function EmployeeForm({ employee, onSave, onCancel }: {
  employee: IEmployee | null;
  onSave: (emp: Partial<IEmployee>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<IEmployee>>(employee || {
    name: '', employeeId: '', department: '', position: '', rank: '',
    status: 'pending', hireDate: new Date().toISOString().slice(0, 10),
    phone: '', email: '', gender: 'male', education: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">姓名 *</label>
          <input
            required
            value={form.name || ''}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">工号 *</label>
          <input
            required
            value={form.employeeId || ''}
            onChange={e => setForm({ ...form, employeeId: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">部门</label>
          <input
            value={form.department || ''}
            onChange={e => setForm({ ...form, department: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">职位</label>
          <input
            value={form.position || ''}
            onChange={e => setForm({ ...form, position: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">职级</label>
          <input
            value={form.rank || ''}
            onChange={e => setForm({ ...form, rank: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">入职日期</label>
          <input
            type="date"
            value={form.hireDate || ''}
            onChange={e => setForm({ ...form, hireDate: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">手机号</label>
          <input
            value={form.phone || ''}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input
            type="email"
            value={form.email || ''}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">性别</label>
          <select
            value={form.gender || 'male'}
            onChange={e => setForm({ ...form, gender: e.target.value as 'male' | 'female' })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">状态</label>
          <select
            value={form.status || 'pending'}
            onChange={e => setForm({ ...form, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          >
            <option value="active">在职</option>
            <option value="pending">待入职</option>
            <option value="inactive">离职</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-input rounded-lg hover:bg-muted">
          取消
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          {employee ? '保存' : '创建'}
        </button>
      </div>
    </form>
  );
}
