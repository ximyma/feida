import React, { useState, useEffect } from 'react';

interface ClockStatus {
  hasClockedIn: boolean;
  hasClockedOut: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  workHours: number;
  status: string;
}

export default function ClockInWidget({ 
  employeeId, 
  employeeName 
}: { 
  employeeId: string; 
  employeeName: string;
}) {
  const [clockStatus, setClockStatus] = useState<ClockStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState('总部');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTodayStatus();
  }, [employeeId]);

  const fetchTodayStatus = async () => {
    try {
      const res = await fetch(`/api/attendance/today/${employeeId}`);
      const data = await res.json();
      
      if (data) {
        setClockStatus({
          hasClockedIn: !!data.clockIn,
          hasClockedOut: !!data.clockOut,
          clockInTime: data.clockIn,
          clockOutTime: data.clockOut,
          workHours: data.workHours || 0,
          status: data.status || 'normal'
        });
      } else {
        setClockStatus({
          hasClockedIn: false,
          hasClockedOut: false,
          clockInTime: null,
          clockOutTime: null,
          workHours: 0,
          status: '未打卡'
        });
      }
    } catch (e) {
      console.error('获取打卡状态失败', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!employeeId || !employeeName) {
      setMessage('请先登录');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/attendance/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeId, 
          employeeName, 
          location,
          remark: ''
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(data.message || '打卡成功');
        fetchTodayStatus();
      } else {
        setMessage(data.message || '打卡失败');
      }
    } catch (e) {
      setMessage('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    if (!employeeId) {
      setMessage('请先登录');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/attendance/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, remark: '' })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(`签退成功，今日工作${data.workHours}小时`);
        fetchTodayStatus();
      } else {
        setMessage(data.message || '签退失败');
      }
    } catch (e) {
      setMessage('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const currentTime = new Date().toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const currentDate = new Date().toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="text-center text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-primary mb-2">{currentTime}</div>
        <div className="text-sm text-muted-foreground">{currentDate}</div>
      </div>

      {/* 打卡位置选择 */}
      <div className="mb-4">
        <label className="text-sm text-muted-foreground block mb-1">打卡位置</label>
        <select 
          value={location} 
          onChange={e => setLocation(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
        >
          <option value="总部">总部</option>
          <option value="分公司">分公司</option>
          <option value="工厂">工厂</option>
          <option value="外勤">外勤</option>
        </select>
      </div>

      {/* 打卡状态显示 */}
      {clockStatus && (
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">上班打卡：</span>
              <span className={clockStatus.hasClockedIn ? 'text-success' : 'text-muted-foreground'}>
                {clockStatus.clockInTime || '未打卡'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">下班打卡：</span>
              <span className={clockStatus.hasClockedOut ? 'text-success' : 'text-muted-foreground'}>
                {clockStatus.clockOutTime || '未打卡'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">工作时长：</span>
              <span>{clockStatus.workHours}小时</span>
            </div>
            <div>
              <span className="text-muted-foreground">状态：</span>
              <span className={
                clockStatus.status === '正常' ? 'text-success' :
                clockStatus.status === '迟到' ? 'text-yellow-600' :
                clockStatus.status === '早退' ? 'text-orange-600' :
                'text-muted-foreground'
              }>
                {clockStatus.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 打卡按钮 */}
      <div className="flex gap-4">
        {!clockStatus?.hasClockedIn ? (
          <button
            onClick={handleClockIn}
            disabled={submitting}
            className="flex-1 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? '打卡中...' : '上班打卡'}
          </button>
        ) : !clockStatus?.hasClockedOut ? (
          <button
            onClick={handleClockOut}
            disabled={submitting}
            className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {submitting ? '签退中...' : '下班签退'}
          </button>
        ) : (
          <div className="flex-1 py-4 bg-success/10 text-success rounded-xl font-semibold text-lg text-center">
            ✅ 今日打卡完成
          </div>
        )}
      </div>

      {/* 提示消息 */}
      {message && (
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-center">
          {message}
        </div>
      )}
    </div>
  );
}
