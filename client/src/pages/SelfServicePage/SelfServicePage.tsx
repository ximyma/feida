import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, message, Tabs, Row, Col, Progress, Descriptions,
  Divider, Timeline, Badge, List, Collapse, Alert,
  Steps, Statistic, Empty, Tooltip, Drawer, Typography
} from 'antd';
import {
  UserOutlined, CalendarOutlined, WalletOutlined,
  FileTextOutlined, BellOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CloseCircleOutlined, EditOutlined,
  SendOutlined, EyeOutlined, RightOutlined, PhoneOutlined,
  MailOutlined, HomeOutlined, TeamOutlined, TrophyOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;
const { Text } = Typography;

// ============ 类型定义 ============
interface EmployeeProfile {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  hireDate: string;
  phone: string;
  email: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  education?: string;
  idCard?: string;
  bankCard?: string;
  status: string;
}

interface ChangeRecord {
  id: string;
  type: 'transfer' | 'promotion' | 'salary' | 'position';
  before: string;
  after: string;
  date: string;
  reason: string;
}

interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave';
  overtime?: number;
}

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
}

interface SalaryRecord {
  month: string;
  baseSalary: number;
  positionSalary: number;
  performance: number;
  bonus: number;
  deduction: number;
  tax: number;
  insurance: number;
  netSalary: number;
}

interface TodoItem {
  id: string;
  type: 'approval' | 'evaluation' | 'survey' | 'training';
  title: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface MyApplication {
  id: string;
  type: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  currentNode: string;
  submittedAt: string;
}

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'approval' | 'announcement';
  isRead: boolean;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  normal: 'green', late: 'orange', early: 'gold', absent: 'red', leave: 'blue'
};

const changeTypeLabels: Record<string, { label: string; color: string }> = {
  transfer: { label: '调岗', color: 'blue' },
  promotion: { label: '晋升', color: 'green' },
  salary: { label: '调薪', color: 'gold' },
  position: { label: '职位变动', color: 'purple' }
};

const priorityColors: Record<string, string> = {
  high: 'red', medium: 'orange', low: 'blue'
};

const typeIcons: Record<string, React.ReactNode> = {
  approval: <FileTextOutlined />,
  evaluation: <TrophyOutlined />,
  survey: <FileTextOutlined />,
  training: <TeamOutlined />
};

// 从登录态读取当前用户ID
function getCurrentUserId(): string {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // 优先使用 employeeId，其次用 id
      return user.employeeId || user.id || '';
    }
  } catch { /* ignore */ }
  return '';
}

export default function SelfServicePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [changeRecords, setChangeRecords] = useState<ChangeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [editModal, setEditModal] = useState(false);
  const [salaryDetail, setSalaryDetail] = useState<SalaryRecord | null>(null);
  const [editForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // 加载所有数据
  const loadAll = useCallback(async () => {
    setLoading(true);
    const currentUserId = getCurrentUserId();
    try {
      // 并行加载所有数据
      const [empRes, changesRes, attRes, leaveRes, salaryRes, apprRes, annRes] = await Promise.all([
        fetch(`/api/employees/${currentUserId}`).then(r => r.json()).catch(() => null),
        fetch(`/api/employee_changes?employeeId=${currentUserId}`).then(r => r.json()).catch(() => []),
        fetch(`/api/attendance_records?employeeId=${currentUserId}`).then(r => r.json()).catch(() => []),
        fetch(`/api/leave_balances?employeeId=${currentUserId}`).then(r => r.json()).catch(() => []),
        fetch(`/api/salaries?employeeId=${currentUserId}`).then(r => r.json()).catch(() => []),
        fetch(`/api/approval_requests?requesterId=${currentUserId}`).then(r => r.json()).catch(() => []),
        fetch(`/api/announcements`).then(r => r.json()).catch(() => []),
      ]);

      // 设置员工档案
      if (empRes && !empRes.error) {
        setProfile({
          id: empRes.id,
          employeeId: empRes.employeeId,
          name: empRes.name,
          department: empRes.department,
          position: empRes.position,
          hireDate: empRes.hireDate,
          phone: empRes.phone || '',
          email: empRes.email || '',
          address: empRes.address || '',
          emergencyContact: empRes.emergencyContact || '',
          emergencyPhone: empRes.emergencyPhone || '',
          education: empRes.education || '',
          idCard: empRes.idCard || '',
          bankCard: empRes.bankCard || '',
          status: empRes.status || 'active'
        });
      }

      // 变动记录
      if (Array.isArray(changesRes)) {
        setChangeRecords(changesRes.map((c: any) => ({
          id: c.id,
          type: c.changeType || 'transfer',
          before: c.before || '-',
          after: c.after || '-',
          date: c.changeDate || c.createdAt,
          reason: c.reason || ''
        })));
      }

      // 考勤记录
      if (Array.isArray(attRes)) {
        setAttendance(attRes.slice(0, 30).map((a: any) => ({
          date: a.date,
          checkIn: a.clockIn || '--:--',
          checkOut: a.clockOut || '--:--',
          status: a.status || 'normal',
          overtime: a.workHours > 8 ? a.workHours - 8 : 0
        })));
      }

      // 假期余额
      if (Array.isArray(leaveRes)) {
        setLeaveBalance(leaveRes.map((l: any) => ({
          type: l.leaveType || l.type,
          total: l.totalDays || l.total || 0,
          used: l.usedDays || l.used || 0,
          remaining: (l.totalDays || l.total || 0) - (l.usedDays || l.used || 0)
        })));
      }

      // 薪资记录
      if (Array.isArray(salaryRes)) {
        setSalaryRecords(salaryRes.map((s: any) => ({
          month: s.month,
          baseSalary: s.baseSalary || 0,
          positionSalary: s.positionSalary || 0,
          performance: s.performance || 0,
          bonus: (s.mealAllowance || 0) + (s.transportAllowance || 0) + (s.overtime || 0),
          deduction: s.otherDeduction || 0,
          tax: s.tax || 0,
          insurance: (s.socialInsurance || 0) + (s.medicalInsurance || 0) + (s.housingFund || 0),
          netSalary: s.netSalary || 0
        })));
      }

      // 我的申请
      if (Array.isArray(apprRes)) {
        setApplications(apprRes.map((a: any) => ({
          id: a.id,
          type: a.type || '请假申请',
          title: a.title || a.type,
          status: a.status,
          currentNode: a.currentApprover || '待审批',
          submittedAt: a.createdAt?.slice(0, 10) || ''
        })));
        // 待办事项从申请中提取
        setTodos(apprRes.filter((a: any) => a.status === 'pending').slice(0, 5).map((a: any) => ({
          id: a.id,
          type: 'approval',
          title: `处理：${a.title || a.type}`,
          deadline: a.createdAt?.slice(0, 10) || '',
          priority: 'high' as const
        })));
      }

      // 通知消息
      if (Array.isArray(annRes)) {
        setNotifications(annRes.slice(0, 10).map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content?.slice(0, 100) || '',
          type: 'announcement' as const,
          isRead: false,
          createdAt: n.createdAt?.slice(0, 10) || ''
        })));
      }

    } catch (e) {
      messageApi.error('加载数据失败');
    }
    setLoading(false);
  }, [messageApi]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const submitEditRequest = async () => {
    try {
      const values = await editForm.validateFields();
      // 创建修改申请
      const res = await fetch('/api/approval_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `ar_${Date.now()}`,
          type: '信息修改申请',
          title: '员工信息修改申请',
          requesterId: getCurrentUserId(),
          requesterName: profile?.name,
          content: JSON.stringify(values),
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      });
      if (res.ok) {
        messageApi.success('修改申请已提交，请等待管理员审核');
        setEditModal(false);
        loadAll();
      }
    } catch {}
  };

  const handleTodo = (todo: TodoItem) => {
    messageApi.success(`已处理：${todo.title}`);
    setTodos(prev => prev.filter(t => t.id !== todo.id));
  };

  const tabs = [
    { key: 'profile', label: '我的档案', icon: <UserOutlined /> },
    { key: 'attendance', label: '我的考勤', icon: <CalendarOutlined /> },
    { key: 'salary', label: '我的薪资', icon: <WalletOutlined /> },
    { key: 'todo', label: '我的待办', icon: <FileTextOutlined /> },
    { key: 'applications', label: '我的申请', icon: <SendOutlined /> },
    { key: 'notifications', label: '消息中心', icon: <BellOutlined /> },
  ];

  const attendanceColumns = [
    { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
    { title: '上班打卡', dataIndex: 'checkIn', key: 'checkIn', width: 100, render: (v: string) => <Tag color="green">{v}</Tag> },
    { title: '下班打卡', dataIndex: 'checkOut', key: 'checkOut', width: 100, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={statusColors[v]}>{v === 'normal' ? '正常' : v === 'late' ? '迟到' : v === 'early' ? '早退' : v === 'absent' ? '缺勤' : '请假'}</Tag> },
    { title: '加班(h)', dataIndex: 'overtime', key: 'overtime', width: 80, render: (v: number) => v ? <Text type="warning">{v.toFixed(1)}</Text> : '-' }
  ];

  const salaryColumns = [
    { title: '月份', dataIndex: 'month', key: 'month', width: 100 },
    { title: '基本工资', dataIndex: 'baseSalary', key: 'base', width: 100, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: '岗位工资', dataIndex: 'positionSalary', key: 'pos', width: 100, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: '绩效', dataIndex: 'performance', key: 'perf', width: 80, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: '补贴', dataIndex: 'bonus', key: 'bonus', width: 80, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: '扣款', dataIndex: 'deduction', key: 'ded', width: 80, render: (v: number) => <Text type="danger">¥{v?.toLocaleString()}</Text> },
    { title: '个税', dataIndex: 'tax', key: 'tax', width: 80, render: (v: number) => <Text type="warning">¥${v?.toLocaleString()}</Text> },
    { title: '社保公积金', dataIndex: 'insurance', key: 'ins', width: 100, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: '实发', dataIndex: 'netSalary', key: 'net', width: 100, render: (v: number) => <Text strong style={{color:'#cf1322'}}>¥{v?.toLocaleString()}</Text> },
    { title: '操作', key: 'action', width: 80, render: (_: any, r: SalaryRecord) => <Button size="small" type="link" onClick={() => setSalaryDetail(r)}>详情</Button> }
  ];

  const todoColumns = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (v: string) => typeIcons[v] },
    { title: '事项', dataIndex: 'title', key: 'title' },
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline', width: 100 },
    { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80, render: (v: string) => <Tag color={priorityColors[v]}>{v === 'high' ? '高' : v === 'medium' ? '中' : '低'}</Tag> },
    { title: '操作', key: 'action', width: 80, render: (_: any, r: TodoItem) => <Button size="small" type="link" onClick={() => handleTodo(r)}>处理</Button> }
  ];

  const applicationColumns = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (v: string) => <Tag color={v === 'approved' ? 'green' : v === 'rejected' ? 'red' : 'orange'}>{v === 'approved' ? '已通过' : v === 'rejected' ? '已驳回' : '审批中'}</Tag> },
    { title: '当前节点', dataIndex: 'currentNode', key: 'node', width: 120 }
  ];

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">👤 员工自助服务</h2>
          <p className="text-sm text-muted-foreground mt-1">查看个人档案、考勤、薪资、待办事项</p>
        </div>
      </div>

      {/* 快捷统计 */}
      <Row gutter={16}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="本月出勤" value={attendance.length} suffix="天" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="待办事项" value={todos.length} suffix="项" valueStyle={{ color: todos.length > 0 ? '#faad14' : '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="年假余额" value={leaveBalance.find(l => l.type === '年假')?.remaining || 0} suffix="天" />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="本月薪资" value={salaryRecords[0]?.netSalary || 0} prefix="¥" precision={0} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="我的申请" value={applications.length} suffix="条" />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="未读消息" value={notifications.filter(n => !n.isRead).length} suffix="条" valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />

        {/* 档案 Tab */}
        {activeTab === 'profile' && profile && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserOutlined style={{ fontSize: 40, color: '#1677ff' }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.employeeId} · {profile.department} · {profile.position}</p>
                  <Tag color={profile.status === 'active' ? 'green' : 'default'}>{profile.status === 'active' ? '在职' : profile.status}</Tag>
                </div>
              </div>
              <Button icon={<EditOutlined />} onClick={() => { editForm.setFieldsValue(profile); setEditModal(true); }}>修改信息</Button>
            </div>
            <Divider />
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="工号">{profile.employeeId}</Descriptions.Item>
              <Descriptions.Item label="姓名">{profile.name}</Descriptions.Item>
              <Descriptions.Item label="部门">{profile.department}</Descriptions.Item>
              <Descriptions.Item label="职位">{profile.position}</Descriptions.Item>
              <Descriptions.Item label="入职日期">{profile.hireDate}</Descriptions.Item>
              <Descriptions.Item label="手机"><PhoneOutlined /> {profile.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱"><MailOutlined /> {profile.email}</Descriptions.Item>
              <Descriptions.Item label="身份证号">{profile.idCard || '-'}</Descriptions.Item>
              <Descriptions.Item label="学历">{profile.education || '-'}</Descriptions.Item>
              <Descriptions.Item label="银行卡号">{profile.bankCard || '-'}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{profile.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="紧急联系人">{profile.emergencyContact || '-'}</Descriptions.Item>
              <Descriptions.Item label="紧急联系电话">{profile.emergencyPhone || '-'}</Descriptions.Item>
            </Descriptions>

            {changeRecords.length > 0 && (
              <>
                <Divider>人事变动记录</Divider>
                <Timeline>
                  {changeRecords.map(r => (
                    <Timeline.Item key={r.id} color={r.type === 'promotion' ? 'green' : 'blue'}>
                      <Text strong>{changeTypeLabels[r.type]?.label || r.type}</Text>
                      <Text type="secondary" className="ml-2">{r.date}</Text>
                      <br />
                      <Text>{r.before} → {r.after}</Text>
                      {r.reason && <Text type="secondary" className="ml-2">({r.reason})</Text>}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </>
            )}
          </div>
        )}

        {/* 考勤 Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <Alert message="显示最近30天的考勤记录" type="info" showIcon />
            <Table columns={attendanceColumns} dataSource={attendance} rowKey="date" loading={loading}
              pagination={{ pageSize: 10 }} size="small" />
            <Card title="假期余额" size="small">
              <Row gutter={16}>
                {leaveBalance.map(l => (
                  <Col span={6} key={l.type}>
                    <Statistic title={l.type} value={l.remaining} suffix={`天 (总${l.total}天)`} />
                  </Col>
                ))}
              </Row>
            </Card>
          </div>
        )}

        {/* 薪资 Tab */}
        {activeTab === 'salary' && (
          <div className="space-y-4">
            <Alert message="薪资信息仅供参考，最终以财务部门核算为准" type="info" showIcon />
            <Table columns={salaryColumns} dataSource={salaryRecords} rowKey="month" loading={loading}
              pagination={{ pageSize: 6 }} size="small" />
          </div>
        )}

        {/* 待办 Tab */}
        {activeTab === 'todo' && (
          <Table columns={todoColumns} dataSource={todos} rowKey="id" loading={loading}
            pagination={{ pageSize: 10 }} locale={{ emptyText: '暂无待办事项' }} />
        )}

        {/* 申请 Tab */}
        {activeTab === 'applications' && (
          <Table columns={applicationColumns} dataSource={applications} rowKey="id" loading={loading}
            pagination={{ pageSize: 10 }} locale={{ emptyText: '暂无申请记录' }} />
        )}

        {/* 消息 Tab */}
        {activeTab === 'notifications' && (
          <List
            loading={loading}
            dataSource={notifications}
            renderItem={n => (
              <List.Item actions={[<Button size="small" type="link">查看</Button>]}>
                <List.Item.Meta
                  avatar={<BellOutlined style={{ fontSize: 24, color: n.isRead ? '#999' : '#1677ff' }} />}
                  title={<Text strong={!n.isRead}>{n.title}</Text>}
                  description={<><Text type="secondary">{n.createdAt}</Text> · {n.content}</>}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 修改信息弹窗 */}
      <Modal title="修改个人信息申请" open={editModal} onOk={submitEditRequest} onCancel={() => setEditModal(false)} okText="提交申请" cancelText="取消">
        <Alert message="您的修改请求将提交给管理员审核，审核通过后生效。" type="info" showIcon style={{ marginBottom: 16 }} />
        <Form form={editForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="phone" label="手机号"><Input prefix={<PhoneOutlined />} /></Form.Item></Col>
            <Col span={12}><Form.Item name="email" label="邮箱"><Input prefix={<MailOutlined />} /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="地址"><Input prefix={<HomeOutlined />} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="emergencyContact" label="紧急联系人"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="emergencyPhone" label="紧急联系电话"><Input /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* 薪资详情弹窗 */}
      <Modal title={`薪资详情 - ${salaryDetail?.month}`} open={!!salaryDetail} onCancel={() => setSalaryDetail(null)} footer={null} width={600}>
        {salaryDetail && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="基本工资">¥{salaryDetail.baseSalary?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="岗位工资">¥{salaryDetail.positionSalary?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="绩效工资">¥{salaryDetail.performance?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="补贴合计">¥{salaryDetail.bonus?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="其他扣款"><Text type="danger">¥{salaryDetail.deduction?.toLocaleString()}</Text></Descriptions.Item>
            <Descriptions.Item label="个人所得税"><Text type="warning">¥{salaryDetail.tax?.toLocaleString()}</Text></Descriptions.Item>
            <Descriptions.Item label="社保公积金"><Text type="secondary">¥{salaryDetail.insurance?.toLocaleString()}</Text></Descriptions.Item>
            <Descriptions.Item label="实发工资"><Text strong style={{ fontSize: 18, color: '#cf1322' }}>¥{salaryDetail.netSalary?.toLocaleString()}</Text></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
