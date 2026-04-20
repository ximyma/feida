import React, { useState, useEffect } from 'react';

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetch(`/api/attendance_records?date=${date}`)
      .then(r => r.json())
      .then(data => { setRecords(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [date]);

  const statusColors: Record<string, string> = {
    normal: 'bg-success/10 text-success',
    late: 'bg-yellow-100 text-yellow-700',
    early_leave: 'bg-orange-100 text-orange-700',
    absent: 'bg-destructive/10 text-destructive',
    leave: 'bg-blue-100 text-blue-700',
    overtime: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🕐 考勤管理</h1>
        <p className="text-sm text-muted-foreground mt-1">查看和管理员工考勤记录</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium">选择日期：</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg text-sm bg-background" />
          <span className="text-sm text-muted-foreground">共 {records.length} 条记录</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>暂无 {date} 的考勤记录</p>
            <p className="text-xs mt-2">系统将在员工打卡后自动生成考勤记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {['工号', '姓名', '部门', '上班打卡', '下班打卡', '工时', '状态'].map(h => (
                    <th key={h} className="text-left p-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id || i} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{r.employeeId}</td>
                    <td className="p-3 font-medium">{r.employeeName}</td>
                    <td className="p-3">{r.department || '-'}</td>
                    <td className="p-3">{r.clockIn || '-'}</td>
                    <td className="p-3">{r.clockOut || '-'}</td>
                    <td className="p-3">{r.workHours || 0}h</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-muted'}`}>
                        {{ normal: '正常', late: '迟到', early_leave: '早退', absent: '旷工', leave: '请假', overtime: '加班' }[r.status] || r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="今日应到" value={48} icon="👥" />
        <StatCard label="已打卡" value={records.filter(r => r.clockIn).length} icon="✅" />
        <StatCard label="迟到" value={records.filter(r => r.status === 'late').length} icon="⏰" color="text-yellow-600" />
        <StatCard label="请假" value={records.filter(r => r.status === 'leave').length} icon="🏖️" color="text-blue-600" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = 'text-foreground' }: { label: string; value: number; icon: string; color?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
