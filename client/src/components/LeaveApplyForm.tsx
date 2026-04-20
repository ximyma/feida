import React, { useState, useEffect } from 'react';

interface LeaveBalance {
  id: string;
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export default function LeaveApplyForm({
  employeeId,
  employeeName,
  department,
  onSuccess,
  onCancel
}: {
  employeeId: string;
  employeeName: string;
  department: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // 表单字段
  const [leaveType, setLeaveType] = useState('年假');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaveBalances();
  }, [employeeId]);

  const fetchLeaveBalances = async () => {
    try {
      const res = await fetch(`/api/leave_balances?employeeId=${employeeId}`);
      const data = await res.json();
      setLeaveBalances(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('获取假期余额失败', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, diff);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setMessage('请填写请假原因');
      return;
    }

    const days = calculateDays();
    if (days <= 0) {
      setMessage('请选择正确的日期范围');
      return;
    }

    // 检查假期余额（年假需要）
    if (leaveType === '年假') {
      const balance = leaveBalances.find(b => b.leaveType === '年假');
      if (balance && balance.remainingDays < days) {
        setMessage(`年假余额不足，剩余${balance.remainingDays}天`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // 1. 创建审批请求
      const approvalRes = await fetch('/api/approval/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowId: 'af_leave_001', // 请假审批流程ID
          module: 'leave',
          title: `请假申请 - ${employeeName}`,
          applicantId: employeeId,
          applicantName: employeeName,
          formData: {
            leaveType,
            startDate,
            endDate,
            days,
            reason,
            department,
            attachmentUrl
          }
        })
      });
      
      const approvalData = await approvalRes.json();
      
      if (approvalData.success) {
        // 2. 创建请假记录
        await fetch('/api/leave_records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `lr_${Date.now()}`,
            employeeId,
            employeeName,
            department,
            leaveType,
            startDate,
            endDate,
            days,
            reason,
            status: 'pending',
            approvalRequestId: approvalData.data.id,
            createdAt: new Date().toISOString()
          })
        });

        setMessage('请假申请已提交，等待审批');
        if (onSuccess) onSuccess();
      } else {
        setMessage(approvalData.message || '提交失败');
      }
    } catch (e) {
      setMessage('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">加载中...</div>;
  }

  const days = calculateDays();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 假期余额显示 */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-medium mb-2">假期余额</h3>
        <div className="grid grid-cols-3 gap-4">
          {leaveBalances.length > 0 ? leaveBalances.map(lb => (
            <div key={lb.id} className="text-center">
              <div className="text-xl font-bold text-primary">{lb.remainingDays}</div>
              <div className="text-xs text-muted-foreground">{lb.leaveType}</div>
              <div className="text-xs text-muted-foreground">共{lb.totalDays}天</div>
            </div>
          )) : (
            <div className="col-span-3 text-center text-muted-foreground text-sm">
              暂无假期余额记录
            </div>
          )}
        </div>
      </div>

      {/* 请假类型 */}
      <div>
        <label className="block text-sm font-medium mb-1">请假类型 *</label>
        <select
          value={leaveType}
          onChange={e => setLeaveType(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background"
        >
          <option value="年假">年假</option>
          <option value="病假">病假</option>
          <option value="事假">事假</option>
          <option value="婚假">婚假</option>
          <option value="产假">产假</option>
          <option value="陪产假">陪产假</option>
          <option value="丧假">丧假</option>
          <option value="调休">调休</option>
        </select>
      </div>

      {/* 日期范围 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">开始日期 *</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">结束日期 *</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
      </div>

      {/* 请假天数显示 */}
      {days > 0 && (
        <div className="bg-primary/10 text-primary rounded-lg px-4 py-2 text-center">
          请假天数：<span className="font-bold">{days}</span> 天
        </div>
      )}

      {/* 请假原因 */}
      <div>
        <label className="block text-sm font-medium mb-1">请假原因 *</label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          placeholder="请详细说明请假原因..."
          className="w-full px-3 py-2 border border-input rounded-lg bg-background resize-none"
        />
      </div>

      {/* 附件 */}
      <div>
        <label className="block text-sm font-medium mb-1">附件（可选）</label>
        <input
          type="url"
          value={attachmentUrl}
          onChange={e => setAttachmentUrl(e.target.value)}
          placeholder="附件链接（如医院证明等）"
          className="w-full px-3 py-2 border border-input rounded-lg bg-background"
        />
      </div>

      {/* 提示消息 */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('成功') || message.includes('已提交')
            ? 'bg-success/10 text-success'
            : 'bg-destructive/10 text-destructive'
        }`}>
          {message}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? '提交中...' : '提交申请'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-input rounded-lg hover:bg-muted"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}
