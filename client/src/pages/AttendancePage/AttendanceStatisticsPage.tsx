import React, { useState, useEffect, useMemo } from 'react';
import { fieldToLabel } from '@/utils/fieldLabels';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workHours?: number;
  status?: string;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  status: string;
}

export default function AttendanceStatisticsPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [abnormalFilter, setAbnormalFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/attendance_records').then(r => r.json()),
      fetch('/api/employees').then(r => r.json())
    ]).then(([recs, emps]) => {
      setRecords(Array.isArray(recs) ? recs : []);
      setEmployees(Array.isArray(emps) ? emps : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const departments = useMemo(() => {
    const depts = [...new Set(employees.map(e => e.department).filter(Boolean))];
    return depts.sort();
  }, [employees]);

  const monthRecords = useMemo(() => {
    return records.filter(r => r.date && r.date.startsWith(selectedMonth));
  }, [records, selectedMonth]);

  const filteredRecords = useMemo(() => {
    let result = monthRecords;
    if (selectedDept !== 'all') {
      const deptEmpIds = employees.filter(e => e.department === selectedDept).map(e => e.employeeId);
      result = result.filter(r => deptEmpIds.includes(r.employeeId));
    }
    if (abnormalFilter !== 'all') {
      result = result.filter(r => {
        if (abnormalFilter === 'late') return (r.lateMinutes || 0) > 0;
        if (abnormalFilter === 'early') return (r.earlyLeaveMinutes || 0) > 0;
        if (abnormalFilter === 'absent') return r.status === 'absent';
        if (abnormalFilter === 'leave') return r.status === 'leave';
        return true;
      });
    }
    return result;
  }, [monthRecords, selectedDept, abnormalFilter, employees]);

  // 计算统计数据
  const stats = useMemo(() => {
    const workDays = new Set(monthRecords.map(r => r.date)).size;
    const totalRecords = monthRecords.length;
    const normalCount = monthRecords.filter(r => r.status === '正常' || r.status === 'normal').length;
    const lateCount = monthRecords.filter(r => (r.lateMinutes || 0) > 0).length;
    const earlyCount = monthRecords.filter(r => (r.earlyLeaveMinutes || 0) > 0).length;
    const leaveCount = monthRecords.filter(r => r.status === 'leave' || r.status === '请假').length;

    return {
      workDays,
      actualDays: workDays,
      attendanceRate: workDays > 0 ? ((normalCount / (workDays * employees.filter(e => e.status === 'active').length)) * 100).toFixed(1) : 0,
      lateCount,
      earlyCount,
      leaveDays: leaveCount
    };
  }, [monthRecords, employees]);

  // 部门考勤统计
  const deptStats = useMemo(() => {
    const deptMap: Record<string, { 
      name: string; 
      shouldAttend: number; 
      actualAttend: number; 
      lateTimes: number; 
      earlyTimes: number; 
      leaveTimes: number; 
    }> = {};

    departments.forEach(dept => {
      const deptEmps = employees.filter(e => e.department === dept && e.status === 'active');
      const empIds = deptEmps.map(e => e.employeeId);
      const deptRecs = monthRecords.filter(r => empIds.includes(r.employeeId));

      deptMap[dept] = {
        name: dept,
        shouldAttend: deptEmps.length * stats.workDays,
        actualAttend: deptRecs.filter(r => r.clockIn).length,
        lateTimes: deptRecs.filter(r => (r.lateMinutes || 0) > 0).length,
        earlyTimes: deptRecs.filter(r => (r.earlyLeaveMinutes || 0) > 0).length,
        leaveTimes: deptRecs.filter(r => r.status === 'leave').length
      };
    });

    return Object.values(deptMap);
  }, [departments, employees, monthRecords, stats.workDays]);

  // 异常记录
  const abnormalRecords = useMemo(() => {
    return filteredRecords.filter(r => 
      (r.lateMinutes || 0) > 0 || 
      (r.earlyLeaveMinutes || 0) > 0 || 
      r.status === 'absent' ||
      !r.clockIn
    ).map(r => {
      const emp = employees.find(e => e.employeeId === r.employeeId);
      return {
        ...r,
        department: emp?.department || '未知',
        abnormalType: (r.lateMinutes || 0) > 0 ? '迟到' : 
                      (r.earlyLeaveMinutes || 0) > 0 ? '早退' : 
                      !r.clockIn ? '缺勤' : '旷工'
      };
    });
  }, [filteredRecords, employees]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 标题和筛选 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📊 考勤统计</h1>
          <p className="text-sm text-muted-foreground mt-1">月度考勤数据统计分析</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="border border-input rounded-lg px-3 py-2 bg-background text-sm"
          >
            <option value="all">全部部门</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="border border-input rounded-lg px-3 py-2 bg-background text-sm"
          />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard icon="📅" label="应出勤天数" value={stats.workDays} color="blue" />
        <StatCard icon="✅" label="实际出勤天数" value={stats.actualDays} color="green" />
        <StatCard icon="📈" label="出勤率" value={`${stats.attendanceRate}%`} color="purple" />
        <StatCard icon="🏃" label="迟到人次" value={stats.lateCount} color="orange" />
        <StatCard icon="⏰" label="早退人次" value={stats.earlyCount} color="red" />
        <StatCard icon="🏖️" label="请假天数" value={stats.leaveDays} color="teal" />
      </div>

      {/* 部门考勤对比表 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">🏢 部门考勤对比</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">部门名称</th>
                <th className="text-center p-3 font-medium">应到人次</th>
                <th className="text-center p-3 font-medium">实到人次</th>
                <th className="text-center p-3 font-medium">出勤率</th>
                <th className="text-center p-3 font-medium">迟到人次</th>
                <th className="text-center p-3 font-medium">早退人次</th>
                <th className="text-center p-3 font-medium">请假人次</th>
              </tr>
            </thead>
            <tbody>
              {deptStats.map(dept => (
                <tr key={dept.name} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{dept.name}</td>
                  <td className="p-3 text-center">{dept.shouldAttend}</td>
                  <td className="p-3 text-center">{dept.actualAttend}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      dept.shouldAttend > 0 && (dept.actualAttend / dept.shouldAttend * 100) >= 95 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {dept.shouldAttend > 0 ? (dept.actualAttend / dept.shouldAttend * 100).toFixed(1) : 0}%
                    </span>
                  </td>
                  <td className="p-3 text-center text-warning">{dept.lateTimes}</td>
                  <td className="p-3 text-center text-destructive">{dept.earlyTimes}</td>
                  <td className="p-3 text-center text-muted-foreground">{dept.leaveTimes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 考勤异常明细 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">⚠️ 考勤异常明细</h2>
          <div className="flex items-center gap-2">
            <select
              value={abnormalFilter}
              onChange={e => setAbnormalFilter(e.target.value)}
              className="border border-input rounded-lg px-3 py-1.5 bg-background text-sm"
            >
              <option value="all">全部异常</option>
              <option value="late">迟到</option>
              <option value="early">早退</option>
              <option value="absent">旷工</option>
              <option value="leave">请假</option>
            </select>
            <button className="px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80">
              📤 导出
            </button>
          </div>
        </div>

        {abnormalRecords.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-2">🎉</div>
            <p>太棒了，本月暂无考勤异常</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">工号</th>
                  <th className="text-left p-3 font-medium">姓名</th>
                  <th className="text-left p-3 font-medium">部门</th>
                  <th className="text-left p-3 font-medium">日期</th>
                  <th className="text-left p-3 font-medium">上班</th>
                  <th className="text-left p-3 font-medium">下班</th>
                  <th className="text-left p-3 font-medium">异常类型</th>
                  <th className="text-left p-3 font-medium">时长</th>
                </tr>
              </thead>
              <tbody>
                {abnormalRecords.slice(0, 50).map(r => (
                  <tr key={r.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">{r.employeeId}</td>
                    <td className="p-3 font-medium">{r.employeeName}</td>
                    <td className="p-3">{r.department}</td>
                    <td className="p-3">{r.date}</td>
                    <td className="p-3">{r.clockIn || '-'}</td>
                    <td className="p-3">{r.clockOut || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        r.abnormalType === '迟到' ? 'bg-warning/10 text-warning' :
                        r.abnormalType === '早退' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {r.abnormalType}
                      </span>
                    </td>
                    <td className="p-3">
                      {(r.lateMinutes || r.earlyLeaveMinutes || 0)}分钟
                    </td>
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

function StatCard({ icon, label, value, color }: { 
  icon: string; label: string; value: string | number; color: string;
}) {
  const colorClass: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    teal: 'from-teal-500 to-teal-600'
  };
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorClass[color]} flex items-center justify-center text-white text-xs font-bold`}>
          {typeof value === 'number' ? value : value.slice(0, 4)}
        </div>
      </div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
