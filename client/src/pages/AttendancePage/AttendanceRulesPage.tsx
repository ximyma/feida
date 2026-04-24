import React, { useState, useEffect } from 'react';

interface ShiftType {
  id: string;
  name: string;
  kind: 'regular' | 'night' | 'half' | 'rest_day';
  startTime: string;
  endTime: string;
  lateThreshold: number;
  earlyLeaveThreshold: number;
  overtimeThreshold: number;
  workHours: number;
  isActive: number;
  color: string;
}

interface Schedule {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  shiftTypeId: string;
  shiftTypeName: string;
}

interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  isExemptAttendance: number;
}

const shiftKindMap: Record<string, { label: string; color: string }> = {
  regular: { label: '常规班', color: 'bg-blue-500' },
  night: { label: '夜班', color: 'bg-purple-500' },
  half: { label: '半天班', color: 'bg-yellow-500' },
  rest_day: { label: '休息日加班', color: 'bg-green-500' },
};

export default function AttendanceRulesPage() {
  const [activeTab, setActiveTab] = useState<'shift' | 'schedule' | 'leave' | 'exempt'>('shift');
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 筛选
  const [deptFilter, setDeptFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  
  // 表单
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'shift' | 'schedule' | 'leave'>('shift');
  const [formData, setFormData] = useState<any>({});
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shiftRes, scheduleRes, balanceRes, empRes] = await Promise.all([
        fetch('/api/shift_types'),
        fetch(`/api/schedules?date=${dateFilter}`),
        fetch('/api/leave_balances'),
        fetch('/api/employees'),
      ]);
      
      const shiftData = await shiftRes.json();
      const scheduleData = await scheduleRes.json();
      const balanceData = await balanceRes.json();
      const empData = await empRes.json();
      
      setShiftTypes(Array.isArray(shiftData) ? shiftData : []);
      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
      setLeaveBalances(Array.isArray(balanceData) ? balanceData : []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (e) {
      console.error('加载数据失败:', e);
    }
    setLoading(false);
  };

  // 班次管理
  const handleShiftSubmit = async () => {
    const data = {
      ...formData,
      id: editingItem?.id || `shift_${Date.now()}`,
      isActive: formData.isActive ? 1 : 0,
    };
    
    try {
      if (editingItem) {
        await fetch(`/api/shift_types/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch('/api/shift_types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      setShowDialog(false);
      loadData();
    } catch (e) {
      console.error('保存失败:', e);
    }
  };

  const handleShiftDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return;
    try {
      await fetch(`/api/shift_types/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error('删除失败:', e);
    }
  };

  // 排班管理
  const handleScheduleSubmit = async () => {
    const employee = employees.find(e => e.id === formData.employeeId);
    const shift = shiftTypes.find(s => s.id === formData.shiftTypeId);
    
    const data = {
      employeeId: formData.employeeId,
      employeeName: employee?.name,
      department: employee?.department,
      date: formData.date,
      shiftTypeId: formData.shiftTypeId,
      shiftTypeName: shift?.name,
    };
    
    try {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setShowDialog(false);
      loadData();
    } catch (e) {
      console.error('保存失败:', e);
    }
  };

  const handleScheduleBatch = async () => {
    const deptEmployees = employees.filter(e => e.department === deptFilter);
    const shift = shiftTypes.find(s => s.id === formData.shiftTypeId);
    
    for (const emp of deptEmployees) {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          date: formData.date,
          shiftTypeId: formData.shiftTypeId,
          shiftTypeName: shift?.name,
        }),
      });
    }
    setShowDialog(false);
    loadData();
  };

  // 年假规则
  const [leaveRules, setLeaveRules] = useState({
    annualDays: 15, // 每年年假天数
    carryoverDays: 5, // 可结转天数
    maxDays: 30, // 最高累积天数
    accrueMonth: 1, // 每月累积月份
  });

  const handleLeaveRuleSave = () => {
    // TODO: 保存到配置表
    alert('规则已保存');
  };

  // 免考勤设置
  const handleExemptToggle = async (emp: Employee) => {
    try {
      await fetch(`/api/employees/${emp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isExemptAttendance: emp.isExemptAttendance ? 0 : 1 }),
      });
      loadData();
    } catch (e) {
      console.error('更新失败:', e);
    }
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const renderShiftTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">班次管理</h2>
        <button
          onClick={() => { setDialogType('shift'); setEditingItem(null); setFormData({ name: '', kind: 'regular', startTime: '09:00', endTime: '18:00', lateThreshold: 15, earlyLeaveThreshold: 15, overtimeThreshold: 60, workHours: 8, isActive: true, color: '#3b82f6' }); setShowDialog(true); }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          + 新增班次
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {shiftTypes.map(shift => (
          <div key={shift.id} className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: shift.color }} />
                <span className="font-medium">{shift.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${shift.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {shift.isActive ? '启用' : '停用'}
              </span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>类型: {shiftKindMap[shift.kind]?.label || shift.kind}</p>
              <p>时间: {shift.startTime} - {shift.endTime}</p>
              <p>工时: {shift.workHours}h</p>
              <p>迟到阈值: {shift.lateThreshold}min</p>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <button
                onClick={() => { setDialogType('shift'); setEditingItem(shift); setFormData(shift); setShowDialog(true); }}
                className="text-sm text-primary hover:underline"
              >
                编辑
              </button>
              <button onClick={() => handleShiftDelete(shift.id)} className="text-sm text-destructive hover:underline">删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderScheduleTab = () => (
    <div>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">部门</label>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="">全部部门</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">日期</label>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-2 border rounded-lg" />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setDialogType('schedule'); setFormData({ date: dateFilter, shiftTypeId: '', employeeId: '' }); setShowDialog(true); }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            + 手动排班
          </button>
        </div>
      </div>
      
      <div className="bg-card border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">员工</th>
              <th className="p-3 text-left">部门</th>
              <th className="p-3 text-center">日期</th>
              <th className="p-3 text-center">班次</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {schedules.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">暂无排班记录</td></tr>
            ) : (
              schedules.map(s => (
                <tr key={s.id} className="hover:bg-accent/30">
                  <td className="p-3 font-medium">{s.employeeName}</td>
                  <td className="p-3 text-sm">{s.department}</td>
                  <td className="p-3 text-center">{s.date}</td>
                  <td className="p-3 text-center">{s.shiftTypeName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLeaveTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">年假规则配置</h2>
      <div className="max-w-xl bg-card border rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">每年年假天数</label>
          <input
            type="number"
            value={leaveRules.annualDays}
            onChange={e => setLeaveRules({ ...leaveRules, annualDays: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">可结转天数</label>
          <input
            type="number"
            value={leaveRules.carryoverDays}
            onChange={e => setLeaveRules({ ...leaveRules, carryoverDays: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">最高累积天数</label>
          <input
            type="number"
            value={leaveRules.maxDays}
            onChange={e => setLeaveRules({ ...leaveRules, maxDays: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <button onClick={handleLeaveRuleSave} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          保存规则
        </button>
      </div>
      
      <h3 className="font-medium mt-8 mb-3">年假余额</h3>
      <div className="bg-card border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">员工</th>
              <th className="p-3 text-left">年份</th>
              <th className="p-3 text-center">年假天数</th>
              <th className="p-3 text-center">已用</th>
              <th className="p-3 text-center">剩余</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leaveBalances.filter(b => b.leaveType === '年假').length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">暂无年假记录</td></tr>
            ) : (
              leaveBalances.filter(b => b.leaveType === '年假').map(b => (
                <tr key={b.id} className="hover:bg-accent/30">
                  <td className="p-3">{b.employeeId}</td>
                  <td className="p-3">{b.year}</td>
                  <td className="p-3 text-center">{b.totalDays}</td>
                  <td className="p-3 text-center">{b.usedDays}</td>
                  <td className="p-3 text-center font-medium text-green-600">{b.remainingDays}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExemptTab = () => {
    const exemptEmployees = employees.filter(e => e.isExemptAttendance);
    const regularEmployees = employees.filter(e => !e.isExemptAttendance);
    
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">免考勤设置</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3 text-green-600">免考勤人员 ({exemptEmployees.length})</h3>
            <div className="bg-card border rounded-lg max-h-96 overflow-y-auto">
              {exemptEmployees.length === 0 ? (
                <p className="p-4 text-muted-foreground">暂无</p>
              ) : (
                exemptEmployees.map(emp => (
                  <div key={emp.id} className="p-3 border-b flex items-center justify-between">
                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </div>
                    <button onClick={() => handleExemptToggle(emp)} className="text-sm text-red-600 hover:underline">
                      取消免考勤
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-muted-foreground">普通考勤人员 ({regularEmployees.length})</h3>
            <div className="bg-card border rounded-lg max-h-96 overflow-y-auto">
              {regularEmployees.length === 0 ? (
                <p className="p-4 text-muted-foreground">暂无</p>
              ) : (
                regularEmployees.map(emp => (
                  <div key={emp.id} className="p-3 border-b flex items-center justify-between">
                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </div>
                    <button onClick={() => handleExemptToggle(emp)} className="text-sm text-green-600 hover:underline">
                      设为免考勤
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <h3 className="font-medium mt-8 mb-3">考勤设备对接</h3>
        <div className="grid grid-cols-3 gap-4">
          {['中控考勤机', '钉钉', '企业微信'].map(device => (
            <div key={device} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{device}</span>
                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">未配置</span>
              </div>
              <button className="text-sm text-primary hover:underline">配置对接</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDialog = () => {
    const isShift = dialogType === 'shift';
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl w-full max-w-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{isShift ? '班次设置' : '排班设置'}</h3>
            <button onClick={() => setShowDialog(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {isShift ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">班次名称 *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">班次类型</label>
                  <select
                    value={formData.kind || 'regular'}
                    onChange={e => setFormData({ ...formData, kind: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="regular">常规班</option>
                    <option value="night">夜班</option>
                    <option value="half">半天班</option>
                    <option value="rest_day">休息日加班</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">上班时间</label>
                    <input
                      type="time"
                      value={formData.startTime || ''}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">下班时间</label>
                    <input
                      type="time"
                      value={formData.endTime || ''}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">工时(h)</label>
                    <input
                      type="number"
                      value={formData.workHours || 8}
                      onChange={e => setFormData({ ...formData, workHours: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">迟到阈值(min)</label>
                    <input
                      type="number"
                      value={formData.lateThreshold || 15}
                      onChange={e => setFormData({ ...formData, lateThreshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">早退阈值(min)</label>
                    <input
                      type="number"
                      value={formData.earlyLeaveThreshold || 15}
                      onChange={e => setFormData({ ...formData, earlyLeaveThreshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">颜色</label>
                  <input
                    type="color"
                    value={formData.color || '#3b82f6'}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label>启用</label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">排班日期 *</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">选择班次 *</label>
                  <select
                    value={formData.shiftTypeId || ''}
                    onChange={e => setFormData({ ...formData, shiftTypeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">请选择班次</option>
                    {shiftTypes.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">选择员工</label>
                  <select
                    value={formData.employeeId || ''}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">全部员工（批量）</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} - {e.department}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="p-4 border-t flex justify-end gap-2">
            <button onClick={() => setShowDialog(false)} className="px-4 py-2 border rounded-lg hover:bg-accent">取消</button>
            <button
              onClick={isShift ? handleShiftSubmit : formData.employeeId ? handleScheduleSubmit : handleScheduleBatch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">⏰ 考勤规则管理</h1>
          <p className="text-sm text-muted-foreground mt-1">配置班次、排班、年假规则、免考勤设置</p>
        </div>
      </div>
      
      <div className="border-b mb-4">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('shift')} className={`px-4 py-2 border-b-2 ${activeTab === 'shift' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            班次管理
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`px-4 py-2 border-b-2 ${activeTab === 'schedule' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            排班管理
          </button>
          <button onClick={() => setActiveTab('leave')} className={`px-4 py-2 border-b-2 ${activeTab === 'leave' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            年假规则
          </button>
          <button onClick={() => setActiveTab('exempt')} className={`px-4 py-2 border-b-2 ${activeTab === 'exempt' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            免考勤设置
          </button>
        </div>
      </div>
      
      {activeTab === 'shift' && renderShiftTab()}
      {activeTab === 'schedule' && renderScheduleTab()}
      {activeTab === 'leave' && renderLeaveTab()}
      {activeTab === 'exempt' && renderExemptTab()}
      
      {showDialog && renderDialog()}
    </div>
  );
}
