import React, { useState, useEffect } from 'react';

export default function ApprovalPage() {
  const [leaveRecords, setLeaveRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leave_records')
      .then(r => r.json())
      .then(data => { setLeaveRecords(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
    cancelled: 'bg-muted text-muted-foreground',
  };

  const statusLabels: Record<string, string> = {
    pending: '待审批', approved: '已通过', rejected: '已驳回', cancelled: '已取消',
  };

  const typeLabels: Record<string, string> = {
    annual: '年假', sick: '病假', personal: '事假', maternity: '产假', marriage: '婚假', bereavement: '丧假',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">✅ 流程审批</h1>
        <p className="text-sm text-muted-foreground mt-1">管理请假、加班、离职等审批流程</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="text-3xl mb-1">📝</div>
          <div className="text-3xl font-bold">{leaveRecords.length}</div>
          <div className="text-sm text-muted-foreground">请假记录</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="text-3xl mb-1">⏰</div>
          <div className="text-3xl font-bold">{leaveRecords.filter(r => r.status === 'pending').length}</div>
          <div className="text-sm text-muted-foreground">待审批</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="text-3xl mb-1">✅</div>
          <div className="text-3xl font-bold">{leaveRecords.filter(r => r.status === 'approved').length}</div>
          <div className="text-sm text-muted-foreground">已通过</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="text-3xl mb-1">❌</div>
          <div className="text-3xl font-bold">{leaveRecords.filter(r => r.status === 'rejected').length}</div>
          <div className="text-sm text-muted-foreground">已驳回</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">请假申请记录</h2>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">+ 新建申请</button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : leaveRecords.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">暂无请假记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {['申请人', '工号', '假期类型', '开始日期', '结束日期', '天数', '原因', '状态'].map(h => (
                    <th key={h} className="text-left p-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaveRecords.map((r, i) => (
                  <tr key={r.id || i} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{r.employeeName || '-'}</td>
                    <td className="p-3 font-mono text-xs">{r.employeeId || '-'}</td>
                    <td className="p-3">{typeLabels[r.leaveType] || r.leaveType || '-'}</td>
                    <td className="p-3">{r.startDate || '-'}</td>
                    <td className="p-3">{r.endDate || '-'}</td>
                    <td className="p-3">{r.days || 0}天</td>
                    <td className="p-3 max-w-xs truncate">{r.reason || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || ''}`}>
                        {statusLabels[r.status] || r.status || '-'}
                      </span>
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
