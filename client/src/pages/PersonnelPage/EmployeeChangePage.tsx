import React, { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  rank: string;
  status: string;
  hireDate: string;
  birthday?: string;
  deptId?: string;
  positionId?: string;
  rankId?: string;
}

interface EmployeeChange {
  id: string;
  employeeId: string;
  employeeName: string;
  changeType: string;
  fromDepartment: string;
  toDepartment: string;
  fromPosition: string;
  toPosition: string;
  fromRank: string;
  toRank: string;
  fromSalary?: number;
  toSalary?: number;
  effectiveDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approverName?: string;
  approveTime?: string;
  createdAt: string;
}

interface ReminderRule {
  id: string;
  type: 'probation' | 'retire' | 'work_anniversary';
  daysBefore: number;
  enabled: boolean;
  targetRoles: string[];
  content: string;
}

const changeTypeMap: Record<string, { label: string; color: string }> = {
  positive: { label: '转正', color: 'bg-green-100 text-green-700' },
  transfer: { label: '调岗', color: 'bg-blue-100 text-blue-700' },
  secondment: { label: '借调', color: 'bg-purple-100 text-purple-700' },
  resign: { label: '离职', color: 'bg-red-100 text-red-700' },
  retire: { label: '退休', color: 'bg-orange-100 text-orange-700' },
  reinstate: { label: '复职', color: 'bg-cyan-100 text-cyan-700' },
};

export default function EmployeeChangePage() {
  const [activeTab, setActiveTab] = useState<'apply' | 'records' | 'reminders'>('apply');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [changes, setChanges] = useState<EmployeeChange[]>([]);
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 表单状态
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    changeType: 'transfer',
    toDepartment: '',
    toPosition: '',
    toRank: '',
    toSalary: 0,
    effectiveDate: '',
    reason: '',
  });
  
  // 筛选
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, changeRes, reminderRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/employee_changes'),
        fetch('/api/reminder_rules'),
      ]);
      const empData = await empRes.json();
      const changeData = await changeRes.json();
      const reminderData = await reminderRes.json();
      
      setEmployees(Array.isArray(empData) ? empData : []);
      setChanges(Array.isArray(changeData) ? changeData : []);
      setReminderRules(Array.isArray(reminderData) ? reminderData : []);
    } catch (e) {
      console.error('加载数据失败:', e);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    const change: Partial<EmployeeChange> = {
      employeeId: employee.id,
      employeeName: employee.name,
      changeType: formData.changeType,
      fromDepartment: employee.department,
      toDepartment: formData.toDepartment || employee.department,
      fromPosition: employee.position,
      toPosition: formData.toPosition || employee.position,
      fromRank: employee.rank,
      toRank: formData.toRank || employee.rank,
      effectiveDate: formData.effectiveDate,
      reason: formData.reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/employee_changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(change),
      });
      setShowDialog(false);
      setFormData({
        employeeId: '',
        changeType: 'transfer',
        toDepartment: '',
        toPosition: '',
        toRank: '',
        toSalary: 0,
        effectiveDate: '',
        reason: '',
      });
      loadData();
    } catch (e) {
      console.error('提交失败:', e);
    }
  };

  const handleApprove = async (change: EmployeeChange) => {
    try {
      await fetch(`/api/employee_changes/${change.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', approverName: 'Admin', approveTime: new Date().toISOString() }),
      });
      loadData();
    } catch (e) {
      console.error('审批失败:', e);
    }
  };

  const handleReject = async (change: EmployeeChange) => {
    try {
      await fetch(`/api/employee_changes/${change.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', approverName: 'Admin', approveTime: new Date().toISOString() }),
      });
      loadData();
    } catch (e) {
      console.error('拒绝失败:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要撤销此异动申请吗？')) return;
    try {
      await fetch(`/api/employee_changes/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error('撤销失败:', e);
    }
  };

  const filteredChanges = changes.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (typeFilter && c.changeType !== typeFilter) return false;
    return true;
  });

  // 计算待提醒列表
  const getReminderList = () => {
    const reminders: { type: string; employee: Employee; date: string; daysUntil: number }[] = [];
    const today = new Date();
    
    employees.forEach(emp => {
      // 转正提醒
      if (emp.status === 'pending' && emp.hireDate) {
        const hireDate = new Date(emp.hireDate);
        const probationEnd = new Date(hireDate);
        probationEnd.setMonth(probationEnd.getMonth() + 3);
        const daysUntil = Math.ceil((probationEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 30) {
          reminders.push({ type: '转正', employee: emp, date: probationEnd.toISOString().split('T')[0], daysUntil });
        }
      }
      
      // 退休提醒（60岁）
      if (emp.birthday) {
        const birthDate = new Date(emp.birthday);
        const retireDate = new Date(birthDate);
        retireDate.setFullYear(retireDate.getFullYear() + 60);
        const daysUntil = Math.ceil((retireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 90) {
          reminders.push({ type: '退休', employee: emp, date: retireDate.toISOString().split('T')[0], daysUntil });
        }
      }
      
      // 工龄提醒
      if (emp.hireDate) {
        const hireDate = new Date(emp.hireDate);
        const years = Math.floor((today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
        if (years > 0 && years % 5 === 0) {
          const annivDate = new Date(hireDate);
          annivDate.setFullYear(today.getFullYear());
          if (annivDate > today) {
            const daysUntil = Math.ceil((annivDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntil <= 30) {
              reminders.push({ type: '工龄', employee: emp, date: annivDate.toISOString().split('T')[0], daysUntil });
            }
          }
        }
      }
    });
    
    return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const renderApplyTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">发起异动申请</h2>
        <button onClick={() => setShowDialog(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          + 新增异动
        </button>
      </div>
      
      <div className="bg-card border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">员工</th>
              <th className="p-3 text-left">异动类型</th>
              <th className="p-3 text-left">异动内容</th>
              <th className="p-3 text-center">生效日期</th>
              <th className="p-3 text-center">状态</th>
              <th className="p-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredChanges.filter(c => c.status === 'pending').length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">暂无待审批的异动申请</td></tr>
            ) : (
              filteredChanges.filter(c => c.status === 'pending').map(change => (
                <tr key={change.id} className="hover:bg-accent/30">
                  <td className="p-3">
                    <p className="font-medium">{change.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{change.employeeId}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${changeTypeMap[change.changeType]?.color || 'bg-gray-100'}`}>
                      {changeTypeMap[change.changeType]?.label || change.changeType}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {change.changeType === 'transfer' && <>{change.fromPosition} → {change.toPosition}</>}
                    {change.changeType === 'positive' && <>试用期 → 正式员工</>}
                    {change.changeType === 'resign' && <>离职</>}
                    {change.changeType === 'retire' && <>退休</>}
                    {change.changeType === 'reinstate' && <>复职</>}
                    {change.changeType === 'secondment' && <>{change.fromDepartment} → {change.toDepartment}</>}
                  </td>
                  <td className="p-3 text-center">{change.effectiveDate}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">待审批</span>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleApprove(change)} className="text-green-600 hover:underline mr-2">批准</button>
                    <button onClick={() => handleReject(change)} className="text-red-600 hover:underline mr-2">拒绝</button>
                    <button onClick={() => handleDelete(change.id)} className="text-muted-foreground hover:underline">撤销</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRecordsTab = () => (
    <div>
      <div className="flex gap-4 mb-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="">全部状态</option>
          <option value="pending">待审批</option>
          <option value="approved">已批准</option>
          <option value="rejected">已拒绝</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="">全部类型</option>
          <option value="positive">转正</option>
          <option value="transfer">调岗</option>
          <option value="secondment">借调</option>
          <option value="resign">离职</option>
          <option value="retire">退休</option>
          <option value="reinstate">复职</option>
        </select>
      </div>
      
      <div className="bg-card border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">员工</th>
              <th className="p-3 text-left">类型</th>
              <th className="p-3 text-left">异动内容</th>
              <th className="p-3 text-center">生效日期</th>
              <th className="p-3 text-center">状态</th>
              <th className="p-3 text-center">审批人</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredChanges.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">暂无异动记录</td></tr>
            ) : (
              filteredChanges.map(change => (
                <tr key={change.id} className="hover:bg-accent/30">
                  <td className="p-3">
                    <p className="font-medium">{change.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{change.employeeId}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${changeTypeMap[change.changeType]?.color || 'bg-gray-100'}`}>
                      {changeTypeMap[change.changeType]?.label || change.changeType}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {change.fromDepartment && <div>部门: {change.fromDepartment} → {change.toDepartment}</div>}
                    {change.fromPosition && <div>岗位: {change.fromPosition} → {change.toPosition}</div>}
                    {change.fromRank && <div>职级: {change.fromRank} → {change.toRank}</div>}
                    {change.fromSalary && <div>薪资: {change.fromSalary} → {change.toSalary}</div>}
                  </td>
                  <td className="p-3 text-center">{change.effectiveDate}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      change.status === 'approved' ? 'bg-green-100 text-green-700' :
                      change.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {change.status === 'approved' ? '已批准' : change.status === 'rejected' ? '已拒绝' : '待审批'}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm">{change.approverName || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRemindersTab = () => {
    const reminders = getReminderList();
    
    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800">提醒规则设置</h3>
          <p className="text-sm text-yellow-700 mt-1">系统自动识别转正、退休、工龄提醒，您可以在此查看待提醒列表</p>
        </div>
        
        <h3 className="text-lg font-semibold mb-3">待提醒列表 ({reminders.length})</h3>
        
        <div className="grid gap-3">
          {reminders.length === 0 ? (
            <p className="text-muted-foreground p-4">暂无待提醒事项</p>
          ) : (
            reminders.map((r, idx) => (
              <div key={idx} className="bg-card border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.employee.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      r.type === '转正' ? 'bg-green-100 text-green-700' :
                      r.type === '退休' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{r.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {r.employee.department} | {r.employee.position}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{r.date}</p>
                  <p className="text-sm text-muted-foreground">还有 {r.daysUntil} 天</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderDialog = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">发起异动申请</h3>
          <button onClick={() => setShowDialog(false)} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">选择员工 *</label>
            <select
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">请选择员工</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.department} - {emp.position}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">异动类型 *</label>
            <select
              value={formData.changeType}
              onChange={e => setFormData({ ...formData, changeType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="positive">转正</option>
              <option value="transfer">调岗</option>
              <option value="secondment">借调</option>
              <option value="resign">离职</option>
              <option value="retire">退休</option>
              <option value="reinstate">复职</option>
            </select>
          </div>
          
          {(formData.changeType === 'transfer' || formData.changeType === 'secondment') && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">目标部门</label>
                <input
                  type="text"
                  value={formData.toDepartment}
                  onChange={e => setFormData({ ...formData, toDepartment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="调入部门"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">目标岗位</label>
                <input
                  type="text"
                  value={formData.toPosition}
                  onChange={e => setFormData({ ...formData, toPosition: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="新岗位"
                />
              </div>
            </>
          )}
          
          {formData.changeType === 'transfer' && (
            <div>
              <label className="block text-sm font-medium mb-1">目标职级</label>
              <input
                type="text"
                value={formData.toRank}
                onChange={e => setFormData({ ...formData, toRank: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="新职级"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">生效日期 *</label>
            <input
              type="date"
              value={formData.effectiveDate}
              onChange={e => setFormData({ ...formData, effectiveDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">异动原因</label>
            <textarea
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="请输入异动原因"
            />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={() => setShowDialog(false)} className="px-4 py-2 border rounded-lg hover:bg-accent">取消</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">提交</button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🔄 人事异动管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理员工转正、调岗、离职、退休等异动</p>
        </div>
      </div>
      
      <div className="border-b mb-4">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-2 border-b-2 ${activeTab === 'apply' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}
          >
            异动申请
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 border-b-2 ${activeTab === 'records' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}
          >
            异动记录
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 border-b-2 ${activeTab === 'reminders' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}
          >
            异动提醒
          </button>
        </div>
      </div>
      
      {activeTab === 'apply' && renderApplyTab()}
      {activeTab === 'records' && renderRecordsTab()}
      {activeTab === 'reminders' && renderRemindersTab()}
      
      {showDialog && renderDialog()}
    </div>
  );
}
