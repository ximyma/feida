import React, { useState, useEffect } from 'react';
import ClockInWidget from '@/components/ClockInWidget';
import LeaveApplyForm from '@/components/LeaveApplyForm';
import ApprovalCenter from '@/components/ApprovalCenter';

interface IUser {
  id: string;
  username: string;
  realName: string;
  employeeId?: string;
  phone: string;
  email: string;
  userType: string;
  roleIds: string;
}

export default function SelfServicePage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [activeTab, setActiveTab] = useState('clockin');
  const [loading, setLoading] = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  
  // 员工个人数据
  const [profile, setProfile] = useState<any>(null);
  const [leaveBalance, setLeaveBalance] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    // 获取当前登录用户信息（从sessionStorage）
    const storedUser = sessionStorage.getItem('feida_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // 获取员工档案
      if (userData.employeeId) {
        Promise.all([
          fetch(`/api/employees/${userData.employeeId}`).then(r => r.json()),
          fetch(`/api/leave_balances?employeeId=${userData.employeeId}`).then(r => r.json()),
          fetch(`/api/attendance_records?employeeId=${userData.employeeId}&date=${new Date().toISOString().slice(0,7)}`).then(r => r.json()),
          fetch(`/api/approval_requests?applicantId=${userData.id}`).then(r => r.json()),
        ]).then(([profileData, leaveData, attData, requestData]) => {
          setProfile(profileData);
          setLeaveBalance(Array.isArray(leaveData) ? leaveData : []);
          setAttendance(Array.isArray(attData) ? attData : []);
          setMyRequests(Array.isArray(requestData) ? requestData : []);
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const menuItems = [
    { key: 'clockin', icon: '⏰', label: '打卡签到' },
    { key: 'profile', icon: '👤', label: '个人信息' },
    { key: 'leave', icon: '📝', label: '请假申请' },
    { key: 'attendance', icon: '🕐', label: '考勤记录' },
    { key: 'approval', icon: '✅', label: '审批中心' },
    { key: 'salary', icon: '💰', label: '薪资明细' },
  ];

  const refreshData = () => {
    if (user?.employeeId) {
      fetch(`/api/approval_requests?applicantId=${user.id}`)
        .then(r => r.json())
        .then(data => setMyRequests(Array.isArray(data) ? data : []));
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">请先登录后再访问员工自助服务</p>
          <a href="/login" className="text-primary hover:underline">前往登录</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">👤 员工自助服务</h1>
        <p className="text-sm text-muted-foreground mt-1">欢迎回来，{user.realName}</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 左侧菜单 */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="text-center mb-4">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-4xl mb-2">
                  {profile?.name?.charAt(0) || user.realName.charAt(0)}
                </div>
                <h3 className="font-semibold">{profile?.name || user.realName}</h3>
                <p className="text-sm text-muted-foreground">{profile?.department || '-'}</p>
                <p className="text-sm text-muted-foreground">{profile?.position || '-'}</p>
              </div>
              <div className="space-y-1">
                {menuItems.map(item => (
                  <button 
                    key={item.key} 
                    onClick={() => {
                      setActiveTab(item.key);
                      if (item.key === 'leave') setShowLeaveForm(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeTab === item.key 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-muted'
                    }`}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="md:col-span-3">
            {/* 打卡签到 */}
            {activeTab === 'clockin' && (
              <div className="space-y-4">
                <ClockInWidget 
                  employeeId={user.employeeId || user.id} 
                  employeeName={user.realName} 
                />
                
                {/* 今日考勤概况 */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-semibold mb-3">📊 本月考勤概况</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold">{attendance.length}</div>
                      <div className="text-xs text-muted-foreground">出勤天数</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {attendance.filter(a => a.status === 'late').length}
                      </div>
                      <div className="text-xs text-muted-foreground">迟到次数</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {leaveBalance.reduce((sum, lb) => sum + (lb.usedDays || 0), 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">请假天数</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold">
                        {(attendance.reduce((sum, a) => sum + (a.workHours || 0), 0) / 8).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">工作日</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 个人信息 */}
            {activeTab === 'profile' && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-lg mb-4">个人信息</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">工号：</span>{profile?.employeeId || '-'}</div>
                  <div><span className="text-muted-foreground">姓名：</span>{profile?.name || '-'}</div>
                  <div><span className="text-muted-foreground">部门：</span>{profile?.department || '-'}</div>
                  <div><span className="text-muted-foreground">职位：</span>{profile?.position || '-'}</div>
                  <div><span className="text-muted-foreground">职级：</span>{profile?.rank || '-'}</div>
                  <div><span className="text-muted-foreground">入职日期：</span>{profile?.hireDate || '-'}</div>
                  <div><span className="text-muted-foreground">手机号：</span>{profile?.phone || '-'}</div>
                  <div><span className="text-muted-foreground">邮箱：</span>{profile?.email || '-'}</div>
                  <div><span className="text-muted-foreground">性别：</span>{profile?.gender === 'male' ? '男' : profile?.gender === 'female' ? '女' : '-'}</div>
                  <div><span className="text-muted-foreground">状态：</span>{profile?.status === 'active' ? '在职' : profile?.status || '-'}</div>
                </div>
              </div>
            )}

            {/* 请假申请 */}
            {activeTab === 'leave' && (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">请假申请</h2>
                  {!showLeaveForm && (
                    <button 
                      onClick={() => setShowLeaveForm(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      + 发起请假
                    </button>
                  )}
                </div>
                
                {showLeaveForm ? (
                  <LeaveApplyForm 
                    employeeId={user.employeeId || user.id}
                    employeeName={user.realName}
                    department={profile?.department || ''}
                    onSuccess={() => {
                      setShowLeaveForm(false);
                      refreshData();
                    }}
                    onCancel={() => setShowLeaveForm(false)}
                  />
                ) : (
                  <div>
                    {/* 假期余额 */}
                    <div className="bg-muted/30 rounded-lg p-4 mb-4">
                      <h3 className="font-medium mb-2">假期余额</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {leaveBalance.length > 0 ? leaveBalance.map((lb: any) => (
                          <div key={lb.id} className="text-center">
                            <div className="text-xl font-bold text-primary">{lb.remainingDays || 0}</div>
                            <div className="text-xs text-muted-foreground">{lb.leaveType}</div>
                            <div className="text-xs text-muted-foreground">共{lb.totalDays || 0}天</div>
                          </div>
                        )) : (
                          <div className="col-span-4 text-center py-4 text-muted-foreground text-sm">
                            暂无假期余额记录
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 我的请假记录 */}
                    <h3 className="font-medium mb-2">我的请假记录</h3>
                    {myRequests.filter(r => r.module === 'leave').length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        暂无请假记录
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {myRequests.filter(r => r.module === 'leave').map((req: any) => (
                          <div key={req.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                              <div className="font-medium">{req.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(req.submittedAt).toLocaleString('zh-CN')}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              req.status === 'approved' ? 'bg-success/10 text-success' :
                              req.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {req.status === 'approved' ? '已通过' : 
                               req.status === 'rejected' ? '已拒绝' : '待审批'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 考勤记录 */}
            {activeTab === 'attendance' && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-lg mb-4">考勤记录 - {new Date().toISOString().slice(0,7)}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2">日期</th>
                        <th className="text-left p-2">上班</th>
                        <th className="text-left p-2">下班</th>
                        <th className="text-left p-2">工时</th>
                        <th className="text-left p-2">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.length === 0 ? (
                        <tr><td colSpan={5} className="text-center p-4 text-muted-foreground">暂无考勤记录</td></tr>
                      ) : attendance.map((att: any) => (
                        <tr key={att.id} className="border-b hover:bg-muted/20">
                          <td className="p-2">{att.date}</td>
                          <td className="p-2">{att.clockIn || '-'}</td>
                          <td className="p-2">{att.clockOut || '-'}</td>
                          <td className="p-2">{att.workHours || 0}h</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              att.status === 'normal' ? 'bg-success/10 text-success' :
                              att.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-muted'
                            }`}>
                              {att.status === 'normal' ? '正常' : att.status === 'late' ? '迟到' : att.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 审批中心 */}
            {activeTab === 'approval' && (
              <ApprovalCenter 
                approverId={user.id}
                approverName={user.realName}
              />
            )}

            {/* 薪资明细 */}
            {activeTab === 'salary' && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-lg mb-4">薪资明细 - {new Date().toISOString().slice(0,7)}</h2>
                <p className="text-center py-8 text-muted-foreground">
                  薪资数据将在此显示（请联系管理员配置薪资模块）
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
