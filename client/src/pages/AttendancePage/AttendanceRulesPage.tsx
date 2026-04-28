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
  employeeName?: string;
  department?: string;
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  availableDays?: number;
  year: number;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  isExemptAttendance: number;
}

interface AttendanceDevice {
  id: string;
  name: string;
  deviceType: string;
  status: string;
  config: string | Record<string, any>;
  lastSyncAt: string | null;
  syncCount: number;
  remark: string;
}

const shiftKindMap: Record<string, { label: string; color: string }> = {
  regular: { label: '常规班', color: 'bg-blue-500' },
  night:   { label: '夜班',   color: 'bg-purple-500' },
  half:    { label: '半天班', color: 'bg-yellow-500' },
  rest_day:{ label: '休息日加班', color: 'bg-green-500' },
};

const DEVICE_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  zktime:   { label: '中控考勤机', icon: '🖥️', color: 'bg-gray-100 text-gray-800' },
  dingtalk: { label: '钉钉',       icon: '📱', color: 'bg-blue-50 text-blue-800' },
  wechat:   { label: '企业微信',   icon: '💬', color: 'bg-green-50 text-green-800' },
  feishu:   { label: '飞书',       icon: '🦅', color: 'bg-indigo-50 text-indigo-800' },
  app:      { label: 'APP内置',    icon: '📲', color: 'bg-purple-50 text-purple-800' },
};

const DEVICE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  active:       { label: '已连接',  color: 'bg-green-100 text-green-700' },
  unconfigured: { label: '未配置',  color: 'bg-gray-100 text-gray-600' },
  error:        { label: '连接失败',color: 'bg-red-100 text-red-700' },
  syncing:      { label: '同步中',  color: 'bg-yellow-100 text-yellow-700' },
};

function parseConfig(config: string | Record<string, any>): Record<string, any> {
  if (typeof config === 'string') {
    try { return JSON.parse(config); } catch { return {}; }
  }
  return config || {};
}

export default function AttendanceRulesPage() {
  const [activeTab, setActiveTab] = useState<'shift' | 'schedule' | 'leave' | 'exempt' | 'device'>('shift');
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [devices, setDevices] = useState<AttendanceDevice[]>([]);
  const [loading, setLoading] = useState(true);

  // 筛选
  const [deptFilter, setDeptFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // 默认空=显示全部排班

  // 表单
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'shift' | 'schedule' | 'leave' | 'device'>('shift');
  const [formData, setFormData] = useState<any>({});
  const [editingItem, setEditingItem] = useState<any>(null);

  // 年假规则（数据库）
  const [leaveRules, setLeaveRules] = useState({
    annualDays: 15,
    carryoverDays: 5,
    maxDays: 30,
    accrueMonth: 1,
  });
  const [leaveRuleLoading, setLeaveRuleLoading] = useState(false);
  const [leaveRuleSaving, setLeaveRuleSaving] = useState(false);

  // 设备操作状态
  const [deviceOp, setDeviceOp] = useState<Record<string, 'testing' | 'syncing' | null>>({});
  const [deviceMsg, setDeviceMsg] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});
  const [showDeviceDialog, setShowDeviceDialog] = useState(false);
  const [editingDevice, setEditingDevice] = useState<AttendanceDevice | null>(null);
  const [deviceForm, setDeviceForm] = useState<Record<string, any>>({});
  const [syncDate, setSyncDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 排班：有日期过滤时按日期查，否则取最近30天
      const scheduleUrl = dateFilter
        ? `/api/schedules?date=${dateFilter}`
        : `/api/schedules`;
      const [shiftRes, scheduleRes, balanceRes, empRes, deviceRes] = await Promise.all([
        fetch('/api/shift_types'),
        fetch(scheduleUrl),
        fetch('/api/attendance/leave-balances?leaveType=%E5%B9%B4%E5%81%87'), // 年假余额（带员工姓名）
        fetch('/api/employees'),
        fetch('/api/attendance/devices'),
      ]);
      setShiftTypes(await shiftRes.json().then(d => Array.isArray(d) ? d : []));
      setSchedules(await scheduleRes.json().then(d => Array.isArray(d) ? d : []));
      setLeaveBalances(await balanceRes.json().then(d => Array.isArray(d) ? d : []));
      setEmployees(await empRes.json().then(d => Array.isArray(d) ? d : []));
      setDevices(await deviceRes.json().then(d => Array.isArray(d) ? d : []));
    } catch (e) {
      console.error('加载数据失败:', e);
    }
    setLoading(false);
  };

  // 加载年假规则
  useEffect(() => {
    if (activeTab === 'leave') {
      setLeaveRuleLoading(true);
      fetch('/api/attendance/leave-rules')
        .then(r => r.json())
        .then(data => {
          if (data && data.annualDays !== undefined) {
            setLeaveRules({
              annualDays: data.annualDays,
              carryoverDays: data.carryoverDays,
              maxDays: data.maxDays,
              accrueMonth: data.accrueMonth,
            });
          }
        })
        .catch(() => {})
        .finally(() => setLeaveRuleLoading(false));
    }
  }, [activeTab]);

  // 班次管理
  const handleShiftSubmit = async () => {
    const data = {
      ...formData,
      id: editingItem?.id || `shift_${Date.now()}`,
      isActive: formData.isActive ? 1 : 0,
    };
    try {
      if (editingItem) {
        await fetch(`/api/shift_types/${editingItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      } else {
        await fetch('/api/shift_types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      }
      setShowDialog(false);
      loadData();
    } catch (e) { console.error('保存失败:', e); }
  };

  const handleShiftDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return;
    try {
      await fetch(`/api/shift_types/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) { console.error('删除失败:', e); }
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
      await fetch('/api/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      setShowDialog(false);
      loadData();
    } catch (e) { console.error('保存失败:', e); }
  };

  const handleScheduleBatch = async () => {
    const deptEmployees = employees.filter(e => e.department === deptFilter);
    const shift = shiftTypes.find(s => s.id === formData.shiftTypeId);
    for (const emp of deptEmployees) {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: emp.id, employeeName: emp.name, department: emp.department, date: formData.date, shiftTypeId: formData.shiftTypeId, shiftTypeName: shift?.name }),
      });
    }
    setShowDialog(false);
    loadData();
  };

  // 年假规则 - 真实保存到数据库
  const handleLeaveRuleSave = async () => {
    setLeaveRuleSaving(true);
    try {
      const res = await fetch('/api/attendance/leave-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveRules),
      });
      const data = await res.json();
      if (data.success) {
        alert('年假规则已保存');
      } else {
        alert('保存失败: ' + (data.message || '未知错误'));
      }
    } catch {
      alert('保存失败，请检查网络');
    }
    setLeaveRuleSaving(false);
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
    } catch (e) { console.error('更新失败:', e); }
  };

  // ---- 设备操作 ----
  const openDeviceConfig = (device: AttendanceDevice) => {
    setEditingDevice(device);
    setDeviceForm(parseConfig(device.config));
    setShowDeviceDialog(true);
  };

  const saveDeviceConfig = async () => {
    if (!editingDevice) return;
    try {
      const res = await fetch(`/api/attendance/devices/${editingDevice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: deviceForm }),
      });
      const data = await res.json();
      if (data.success) {
        setShowDeviceDialog(false);
        loadData();
        setDeviceMsg(prev => ({ ...prev, [editingDevice.id]: { type: 'success', text: '配置已保存' } }));
        setTimeout(() => setDeviceMsg(prev => { const n = { ...prev }; delete n[editingDevice!.id]; return n; }), 3000);
      }
    } catch { alert('保存失败'); }
  };

  const testDevice = async (device: AttendanceDevice) => {
    setDeviceOp(prev => ({ ...prev, [device.id]: 'testing' }));
    try {
      const res = await fetch(`/api/attendance/devices/${device.id}/test`, { method: 'POST' });
      const data = await res.json();
      setDeviceMsg(prev => ({ ...prev, [device.id]: { type: data.success ? 'success' : 'error', text: data.message } }));
      if (data.success) loadData();
    } catch {
      setDeviceMsg(prev => ({ ...prev, [device.id]: { type: 'error', text: '网络错误' } }));
    }
    setDeviceOp(prev => ({ ...prev, [device.id]: null }));
    setTimeout(() => setDeviceMsg(prev => { const n = { ...prev }; delete n[device.id]; return n; }), 6000);
  };

  const syncDevice = async (device: AttendanceDevice) => {
    setDeviceOp(prev => ({ ...prev, [device.id]: 'syncing' }));
    try {
      const res = await fetch(`/api/attendance/devices/${device.id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: syncDate, endDate: syncDate }),
      });
      const data = await res.json();
      setDeviceMsg(prev => ({ ...prev, [device.id]: { type: data.success ? 'success' : 'error', text: data.message } }));
      if (data.success) loadData();
    } catch {
      setDeviceMsg(prev => ({ ...prev, [device.id]: { type: 'error', text: '同步请求失败' } }));
    }
    setDeviceOp(prev => ({ ...prev, [device.id]: null }));
    setTimeout(() => setDeviceMsg(prev => { const n = { ...prev }; delete n[device.id]; return n; }), 8000);
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  // ===== 渲染：班次 =====
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
              <button onClick={() => { setDialogType('shift'); setEditingItem(shift); setFormData(shift); setShowDialog(true); }} className="text-sm text-primary hover:underline">编辑</button>
              <button onClick={() => handleShiftDelete(shift.id)} className="text-sm text-destructive hover:underline">删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ===== 渲染：排班 =====
  const renderScheduleTab = () => {
    // 前端过滤：日期+部门
    const filteredSchedules = schedules.filter(s => {
      const matchDate = !dateFilter || s.date === dateFilter;
      const matchDept = !deptFilter || s.department === deptFilter;
      return matchDate && matchDept;
    });
    // 最多显示200条
    const displaySchedules = filteredSchedules.slice(0, 200);
    return (
    <div>
      <div className="flex gap-4 mb-4 flex-wrap items-end">
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
        {dateFilter && (
          <button onClick={() => setDateFilter('')} className="px-3 py-2 text-sm border rounded-lg hover:bg-accent text-muted-foreground">
            清除日期（显示全部）
          </button>
        )}
        <div className="flex items-end ml-auto">
          <button
            onClick={() => { setDialogType('schedule'); setFormData({ date: dateFilter || new Date().toISOString().slice(0,10), shiftTypeId: '', employeeId: '' }); setShowDialog(true); }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            + 手动排班
          </button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mb-2">
        共 {filteredSchedules.length} 条排班记录{filteredSchedules.length > 200 ? '，仅显示前200条' : ''}
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
            {displaySchedules.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">
                {dateFilter ? `${dateFilter} 暂无排班记录` : '暂无排班记录'}
              </td></tr>
            ) : (
              displaySchedules.map(s => (
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
  };

  // ===== 渲染：年假 =====
  const renderLeaveTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">年假规则配置</h2>
      {leaveRuleLoading ? (
        <div className="text-muted-foreground">加载中...</div>
      ) : (
        <div className="max-w-xl bg-card border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">每年年假天数</label>
            <input type="number" value={leaveRules.annualDays} onChange={e => setLeaveRules({ ...leaveRules, annualDays: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">可结转天数</label>
            <input type="number" value={leaveRules.carryoverDays} onChange={e => setLeaveRules({ ...leaveRules, carryoverDays: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">最高累积天数</label>
            <input type="number" value={leaveRules.maxDays} onChange={e => setLeaveRules({ ...leaveRules, maxDays: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <button onClick={handleLeaveRuleSave} disabled={leaveRuleSaving} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60">
            {leaveRuleSaving ? '保存中...' : '保存规则'}
          </button>
        </div>
      )}
      <h3 className="font-medium mt-8 mb-3">年假余额</h3>
      <div className="bg-card border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">员工</th>
              <th className="p-3 text-left">部门</th>
              <th className="p-3 text-left">年份</th>
              <th className="p-3 text-center">年假天数</th>
              <th className="p-3 text-center">已用</th>
              <th className="p-3 text-center">剩余</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leaveBalances.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">暂无年假记录</td></tr>
            ) : (
              leaveBalances.map(b => (
                <tr key={b.id} className="hover:bg-accent/30">
                  <td className="p-3 font-medium">{b.employeeName || b.employeeId}</td>
                  <td className="p-3 text-sm text-muted-foreground">{b.department || '-'}</td>
                  <td className="p-3">{String(b.year).replace('.0','')}</td>
                  <td className="p-3 text-center">{b.totalDays}</td>
                  <td className="p-3 text-center">{b.usedDays}</td>
                  <td className="p-3 text-center font-medium text-green-600">{b.availableDays ?? b.remainingDays ?? (b.totalDays - b.usedDays)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ===== 渲染：免考勤 =====
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
              {exemptEmployees.length === 0 ? <p className="p-4 text-muted-foreground">暂无</p> : exemptEmployees.map(emp => (
                <div key={emp.id} className="p-3 border-b flex items-center justify-between">
                  <div><p className="font-medium">{emp.name}</p><p className="text-xs text-muted-foreground">{emp.department}</p></div>
                  <button onClick={() => handleExemptToggle(emp)} className="text-sm text-red-600 hover:underline">取消免考勤</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3 text-muted-foreground">普通考勤人员 ({regularEmployees.length})</h3>
            <div className="bg-card border rounded-lg max-h-96 overflow-y-auto">
              {regularEmployees.length === 0 ? <p className="p-4 text-muted-foreground">暂无</p> : regularEmployees.map(emp => (
                <div key={emp.id} className="p-3 border-b flex items-center justify-between">
                  <div><p className="font-medium">{emp.name}</p><p className="text-xs text-muted-foreground">{emp.department}</p></div>
                  <button onClick={() => handleExemptToggle(emp)} className="text-sm text-green-600 hover:underline">设为免考勤</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===== 渲染：设备对接 =====
  const renderDeviceTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">考勤设备对接</h2>
          <p className="text-sm text-muted-foreground mt-1">配置并管理各渠道考勤设备，同步员工打卡数据</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">同步日期：</label>
          <input type="date" value={syncDate} onChange={e => setSyncDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {devices.map(device => {
          const typeInfo = DEVICE_TYPE_LABELS[device.deviceType] || { label: device.deviceType, icon: '🔧', color: 'bg-gray-100 text-gray-800' };
          const statusInfo = DEVICE_STATUS_MAP[device.status] || { label: device.status, color: 'bg-gray-100 text-gray-600' };
          const cfg = parseConfig(device.config);
          const isOp = !!deviceOp[device.id];
          const msg = deviceMsg[device.id];
          const isActive = device.status === 'active';
          return (
            <div key={device.id} className="bg-card border rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{typeInfo.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{device.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{device.remark}</p>
                    {device.lastSyncAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        上次同步：{new Date(device.lastSyncAt).toLocaleString('zh-CN')} · 已同步 {device.syncCount} 条
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openDeviceConfig(device)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent">⚙️ 配置</button>
                  <button onClick={() => testDevice(device)} disabled={isOp} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-blue-50 text-blue-700 disabled:opacity-50">
                    {deviceOp[device.id] === 'testing' ? '测试中...' : '🔌 测试连接'}
                  </button>
                  <button onClick={() => syncDevice(device)} disabled={isOp || (!isActive && device.deviceType !== 'app')} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40">
                    {deviceOp[device.id] === 'syncing' ? '同步中...' : '🔄 同步数据'}
                  </button>
                </div>
              </div>
              {/* 配置摘要 */}
              <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-x-4 text-sm">
                {device.deviceType === 'zktime' && (
                  <>
                    <div><span className="text-muted-foreground">IP地址：</span>{cfg.host || <span className="text-red-500">未配置</span>}</div>
                    <div><span className="text-muted-foreground">端口：</span>{cfg.port || 4370}</div>
                    <div><span className="text-muted-foreground">设备序列号：</span>{cfg.serialNumber || '未填'}</div>
                  </>
                )}
                {device.deviceType === 'dingtalk' && (
                  <>
                    <div><span className="text-muted-foreground">AppKey：</span>{cfg.appKey ? '✅ 已配置' : <span className="text-red-500">未配置</span>}</div>
                    <div><span className="text-muted-foreground">AppSecret：</span>{cfg.appSecret ? '✅ 已配置' : <span className="text-red-500">未配置</span>}</div>
                    <div><span className="text-muted-foreground">CorpId：</span>{cfg.corpId || '未填'}</div>
                  </>
                )}
                {device.deviceType === 'wechat' && (
                  <>
                    <div><span className="text-muted-foreground">CorpID：</span>{cfg.corpId ? '✅ 已配置' : <span className="text-red-500">未配置</span>}</div>
                    <div><span className="text-muted-foreground">Secret：</span>{cfg.secret ? '✅ 已配置' : <span className="text-red-500">未配置</span>}</div>
                    <div><span className="text-muted-foreground">AgentId：</span>{cfg.agentId || '未填'}</div>
                  </>
                )}
                {device.deviceType === 'feishu' && (
                  <>
                    <div><span className="text-muted-foreground">App ID：</span>{cfg.appId ? '✅ 已配置' : <span className="text-red-500">未配置</span>}</div>
                    <div><span className="text-muted-foreground">App Secret：</span>{cfg.appSecret ? '✅ 已配置' : <span className="text-red-500">未配置</span>}</div>
                    <div></div>
                  </>
                )}
                {device.deviceType === 'app' && (
                  <>
                    <div><span className="text-muted-foreground">GPS打卡：</span>{cfg.gpsRequired ? '必须' : '可选'}</div>
                    <div><span className="text-muted-foreground">打卡范围：</span>{cfg.radiusMeters || 500}米</div>
                    <div><span className="text-muted-foreground">WiFi限制：</span>{cfg.wifiRequired ? '开启' : '关闭'}</div>
                  </>
                )}
              </div>
              {/* 操作反馈 */}
              {msg && (
                <div className={`mt-3 px-4 py-2 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {msg.type === 'success' ? '✅' : '❌'} {msg.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* 说明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
        <p className="font-medium mb-2">📋 使用说明</p>
        <ul className="space-y-1 list-disc list-inside text-xs">
          <li>点击「⚙️ 配置」填写对应平台的 API 密钥，保存后才能连接</li>
          <li>点击「🔌 测试连接」验证配置是否正确</li>
          <li>点击「🔄 同步数据」将指定日期的打卡记录导入系统（钉钉/企业微信需员工已设置对应ID）</li>
          <li>中控考勤机需在服务器安装 ZKTime SDK，联系管理员完成部署</li>
          <li>APP内置打卡由员工直接在本系统打卡，无需额外同步</li>
        </ul>
      </div>
    </div>
  );

  // ===== 设备配置弹窗 =====
  const renderDeviceDialog = () => {
    if (!editingDevice) return null;
    const dt = editingDevice.deviceType;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl w-full max-w-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{DEVICE_TYPE_LABELS[dt]?.icon} 配置 {editingDevice.name}</h3>
            <button onClick={() => setShowDeviceDialog(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="p-4 space-y-4">
            {dt === 'zktime' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">设备 IP 地址 <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="例：192.168.1.100" value={deviceForm.host || ''} onChange={e => setDeviceForm({ ...deviceForm, host: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">端口（默认 4370）</label>
                  <input type="number" value={deviceForm.port || 4370} onChange={e => setDeviceForm({ ...deviceForm, port: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">设备序列号（可选）</label>
                  <input type="text" value={deviceForm.serialNumber || ''} onChange={e => setDeviceForm({ ...deviceForm, serialNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </>
            )}
            {dt === 'dingtalk' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">AppKey <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="钉钉开放平台应用的 AppKey" value={deviceForm.appKey || ''} onChange={e => setDeviceForm({ ...deviceForm, appKey: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">AppSecret <span className="text-red-500">*</span></label>
                  <input type="password" placeholder="钉钉开放平台应用的 AppSecret" value={deviceForm.appSecret || ''} onChange={e => setDeviceForm({ ...deviceForm, appSecret: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CorpId（可选）</label>
                  <input type="text" value={deviceForm.corpId || ''} onChange={e => setDeviceForm({ ...deviceForm, corpId: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <p className="text-xs text-muted-foreground">⚠️ 同步打卡记录需员工信息中设置 dingUserId 字段</p>
              </>
            )}
            {dt === 'wechat' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">企业ID (CorpID) <span className="text-red-500">*</span></label>
                  <input type="text" value={deviceForm.corpId || ''} onChange={e => setDeviceForm({ ...deviceForm, corpId: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Secret <span className="text-red-500">*</span></label>
                  <input type="password" value={deviceForm.secret || ''} onChange={e => setDeviceForm({ ...deviceForm, secret: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">AgentId</label>
                  <input type="text" value={deviceForm.agentId || ''} onChange={e => setDeviceForm({ ...deviceForm, agentId: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <p className="text-xs text-muted-foreground">⚠️ 同步打卡记录需员工信息中设置 wxUserId 字段</p>
              </>
            )}
            {dt === 'feishu' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">App ID <span className="text-red-500">*</span></label>
                  <input type="text" value={deviceForm.appId || ''} onChange={e => setDeviceForm({ ...deviceForm, appId: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">App Secret <span className="text-red-500">*</span></label>
                  <input type="password" value={deviceForm.appSecret || ''} onChange={e => setDeviceForm({ ...deviceForm, appSecret: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <p className="text-xs text-muted-foreground">⚠️ 飞书打卡同步需要企业自建应用并申请「考勤数据读取」权限</p>
              </>
            )}
            {dt === 'app' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">GPS打卡必须</span>
                  <input type="checkbox" checked={!!deviceForm.gpsRequired} onChange={e => setDeviceForm({ ...deviceForm, gpsRequired: e.target.checked })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">打卡范围（米）</label>
                  <input type="number" value={deviceForm.radiusMeters || 500} onChange={e => setDeviceForm({ ...deviceForm, radiusMeters: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">WiFi白名单限制</span>
                  <input type="checkbox" checked={!!deviceForm.wifiRequired} onChange={e => setDeviceForm({ ...deviceForm, wifiRequired: e.target.checked })} />
                </div>
              </>
            )}
          </div>
          <div className="p-4 border-t flex justify-end gap-2">
            <button onClick={() => setShowDeviceDialog(false)} className="px-4 py-2 border rounded-lg hover:bg-accent">取消</button>
            <button onClick={saveDeviceConfig} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">保存配置</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== 班次/排班弹窗 =====
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
                  <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">班次类型</label>
                  <select value={formData.kind || 'regular'} onChange={e => setFormData({ ...formData, kind: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="regular">常规班</option>
                    <option value="night">夜班</option>
                    <option value="half">半天班</option>
                    <option value="rest_day">休息日加班</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">上班时间</label>
                    <input type="time" value={formData.startTime || ''} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">下班时间</label>
                    <input type="time" value={formData.endTime || ''} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">工时(h)</label>
                    <input type="number" value={formData.workHours || 8} onChange={e => setFormData({ ...formData, workHours: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">迟到阈值(min)</label>
                    <input type="number" value={formData.lateThreshold || 15} onChange={e => setFormData({ ...formData, lateThreshold: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">早退阈值(min)</label>
                    <input type="number" value={formData.earlyLeaveThreshold || 15} onChange={e => setFormData({ ...formData, earlyLeaveThreshold: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">颜色</label>
                  <input type="color" value={formData.color || '#3b82f6'} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full h-10 rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={!!formData.isActive && formData.isActive !== 0} onChange={e => setFormData({ ...formData, isActive: e.target.checked ? 1 : 0 })} />
                  <label>启用</label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">排班日期 *</label>
                  <input type="date" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">选择班次 *</label>
                  <select value={formData.shiftTypeId || ''} onChange={e => setFormData({ ...formData, shiftTypeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">请选择班次</option>
                    {shiftTypes.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">选择员工</label>
                  <select value={formData.employeeId || ''} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">全部员工（批量）</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.department}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="p-4 border-t flex justify-end gap-2">
            <button onClick={() => setShowDialog(false)} className="px-4 py-2 border rounded-lg hover:bg-accent">取消</button>
            <button onClick={isShift ? handleShiftSubmit : formData.employeeId ? handleScheduleSubmit : handleScheduleBatch} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
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
          <p className="text-sm text-muted-foreground mt-1">配置班次、排班、年假规则、免考勤设置、设备对接</p>
        </div>
      </div>

      <div className="border-b mb-4">
        <div className="flex gap-1">
          {[
            { key: 'shift', label: '班次管理' },
            { key: 'schedule', label: '排班管理' },
            { key: 'leave', label: '年假规则' },
            { key: 'exempt', label: '免考勤设置' },
            { key: 'device', label: '设备对接', badge: devices.filter(d => d.status === 'unconfigured').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 border-b-2 flex items-center gap-1 ${activeTab === tab.key ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}
            >
              {tab.label}
              {tab.badge ? <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">{tab.badge}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'shift' && renderShiftTab()}
      {activeTab === 'schedule' && renderScheduleTab()}
      {activeTab === 'leave' && renderLeaveTab()}
      {activeTab === 'exempt' && renderExemptTab()}
      {activeTab === 'device' && renderDeviceTab()}

      {showDialog && renderDialog()}
      {showDeviceDialog && renderDeviceDialog()}
    </div>
  );
}
