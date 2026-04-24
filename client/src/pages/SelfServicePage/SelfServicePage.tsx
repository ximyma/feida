import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, message, Tabs, Row, Col, Progress, Descriptions,
  Divider, Timeline, Badge, List, Avatar, Collapse, Alert,
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
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  education: string;
  idCard: string;
  bankAccount: string;
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

// ============ 模拟数据 ============
const mockProfile: EmployeeProfile = {
  id: '1', employeeId: 'EMP0001', name: '张伟', department: '研发部', position: '高级工程师',
  hireDate: '2023-01-15', phone: '13800138000', email: 'zhangwei@feida.com',
  address: '北京市朝阳区xxx街道', emergencyContact: '张三', emergencyPhone: '13900139000',
  education: '本科', idCard: '11010119900101****', bankAccount: '6222****1234', status: 'active',
};

const mockChangeRecords: ChangeRecord[] = [
  { id: '1', type: 'transfer', before: '市场部', after: '研发部', date: '2024-01-01', reason: '业务调整' },
  { id: '2', type: 'promotion', before: '工程师', after: '高级工程师', date: '2024-06-01', reason: '表现优秀' },
];

const mockAttendance: AttendanceRecord[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2025, 3, i + 1).toISOString().slice(0, 10),
  checkIn: ['08:55', '09:00', '09:05', '08:58', '09:02'][i % 5],
  checkOut: ['18:05', '18:30', '20:00', '18:00', '19:00'][i % 5],
  status: i % 7 === 0 ? 'leave' : i % 5 === 0 ? 'late' : 'normal',
  overtime: i % 3 === 0 ? 2 : undefined,
}));

const mockLeaveBalance: LeaveBalance[] = [
  { type: '年假', total: 10, used: 3, remaining: 7 },
  { type: '病假', total: 15, used: 2, remaining: 13 },
  { type: '事假', total: 5, used: 1, remaining: 4 },
];

const mockSalaryRecords: SalaryRecord[] = Array.from({ length: 6 }, (_, i) => ({
  month: `2025-0${i + 1}`,
  baseSalary: 15000,
  bonus: [2000, 1500, 3000, 1000, 2500, 1800][i],
  deduction: 0,
  tax: [1200, 1100, 1500, 1000, 1400, 1150][i],
  insurance: 2200,
  netSalary: [13600, 13200, 14300, 12800, 13900, 13450][i],
}));

const mockTodos: TodoItem[] = [
  { id: '1', type: 'approval', title: '审批李娜的请假申请', deadline: '2025-04-23', priority: 'high' },
  { id: '2', type: 'evaluation', title: '完成Q1绩效自评', deadline: '2025-04-25', priority: 'medium' },
  { id: '3', type: 'survey', title: '员工满意度调查', deadline: '2025-04-28', priority: 'low' },
  { id: '4', type: 'training', title: '信息安全培训评估', deadline: '2025-04-30', priority: 'medium' },
];

const mockApplications: MyApplication[] = [
  { id: '1', type: '请假申请', title: '年假申请', status: 'pending', currentNode: 'HR审批', submittedAt: '2025-04-22' },
  { id: '2', type: '加班申请', title: '周末加班', status: 'approved', currentNode: '已完成', submittedAt: '2025-04-20' },
];

const mockNotifications: Notification[] = [
  { id: '1', title: '您的请假申请已通过', content: '您提交的年假申请已通过审批。', type: 'approval', isRead: false, createdAt: '2025-04-22 10:00' },
  { id: '2', title: '系统维护通知', content: '系统将于本周六凌晨进行维护升级。', type: 'system', isRead: true, createdAt: '2025-04-21 15:00' },
  { id: '3', title: '新公告：五一放假安排', content: '公司五一放假时间为5月1日至5月5日。', type: 'announcement', isRead: false, createdAt: '2025-04-20 09:00' },
];

export default function SelfServicePage() {
  const [activeTab, setActiveTab] = useState<string>('profile');
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // 模拟API调用
      await new Promise(r => setTimeout(r, 500));
      setProfile(mockProfile);
      setChangeRecords(mockChangeRecords);
      setAttendance(mockAttendance);
      setLeaveBalance(mockLeaveBalance);
      setSalaryRecords(mockSalaryRecords);
      setTodos(mockTodos);
      setApplications(mockApplications);
      setNotifications(mockNotifications);
      setLoading(false);
    };
    loadData();
  }, []);

  const submitEditRequest = async () => {
    try {
      const values = await editForm.validateFields();
      messageApi.success('修改申请已提交，请等待管理员审核');
      setEditModal(false);
    } catch { }
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
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => {
      const map: Record<string, { color: string; label: string }> = { normal: { color: 'green', label: '正常' }, late: { color: 'orange', label: '迟到' }, early: { color: 'purple', label: '早退' }, absent: { color: 'red', label: '缺勤' }, leave: { color: 'blue', label: '请假' } };
      return <Tag color={map[v]?.color}>{map[v]?.label}</Tag>;
    }},
    { title: '加班(h)', dataIndex: 'overtime', key: 'overtime', width: 80, render: (v?: number) => v ? `${v}h` : '-' },
  ];

  const todoColumns = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, render: (v: string) => {
      const map: Record<string, { color: string; label: string }> = { approval: { color: 'blue', label: '审批' }, evaluation: { color: 'purple', label: '评估' }, survey: { color: 'cyan', label: '问卷' }, training: { color: 'green', label: '培训' } };
      return <Tag color={map[v]?.color}>{map[v]?.label}</Tag>;
    }},
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline', width: 120 },
    { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80, render: (v: string) => {
      const map: Record<string, { color: string }> = { high: { color: 'red' }, medium: { color: 'orange' }, low: { color: 'default' } };
      return <Tag color={map[v]?.color}>{v === 'high' ? '高' : v === 'medium' ? '中' : '低'}</Tag>;
    }},
    { title: '操作', key: 'action', width: 100, render: (_: any, r: TodoItem) => (
      <Button size="small" type="link" onClick={() => handleTodo(r)}>去处理</Button>
    )},
  ];

  const statusColors: Record<string, string> = { pending: 'processing', approved: 'success', rejected: 'error' };
  const statusLabels: Record<string, string> = { pending: '处理中', approved: '已通过', rejected: '已拒绝' };

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">员工自助</h2><p className="text-sm text-muted-foreground">档案查询 · 考勤打卡 · 薪资查询 · 待办处理</p></div>
        {profile && <Tag color="green">当前用户：{profile.name}</Tag>}
      </div>

      <Row gutter={16}>
        <Col span={4}><Card size="small"><Statistic title="年假余额" value={leaveBalance.find(l => l.type === '年假')?.remaining || 0} suffix="天" valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="本月加班" value={attendance.filter(a => a.overtime).reduce((s, a) => s + (a.overtime || 0), 0)} suffix="小时" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="待办事项" value={todos.length} suffix="项" valueStyle={{ color: todos.length > 0 ? '#faad14' : '#52c41a' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="未读消息" value={notifications.filter(n => !n.isRead).length} suffix="条" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="审批中申请" value={applications.filter(a => a.status === 'pending').length} suffix="个" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="本月实发" value={salaryRecords[0]?.netSalary || 0} prefix="¥" /></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 16 }} items={tabs.map(t => ({ key: t.key, label: <span>{t.icon} {t.label}</span> }))} />

        {/* Tab1: 我的档案 */}
        {activeTab === 'profile' && profile && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Text type="secondary">查看和申请修改个人档案信息</Text>
              <Button icon={<EditOutlined />} onClick={() => { editForm.setFieldsValue(profile); setEditModal(true); }}>申请修改档案</Button>
            </div>
            <Row gutter={16}>
              <Col span={16}>
                <Card title="基本信息" size="small">
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="工号">{profile.employeeId}</Descriptions.Item>
                    <Descriptions.Item label="姓名">{profile.name}</Descriptions.Item>
                    <Descriptions.Item label="部门">{profile.department}</Descriptions.Item>
                    <Descriptions.Item label="岗位">{profile.position}</Descriptions.Item>
                    <Descriptions.Item label="入职日期">{profile.hireDate}</Descriptions.Item>
                    <Descriptions.Item label="学历">{profile.education}</Descriptions.Item>
                    <Descriptions.Item label="手机号">{profile.phone}</Descriptions.Item>
                    <Descriptions.Item label="邮箱">{profile.email}</Descriptions.Item>
                    <Descriptions.Item label="家庭住址" span={2}>{profile.address}</Descriptions.Item>
                    <Descriptions.Item label="紧急联系人">{profile.emergencyContact}</Descriptions.Item>
                    <Descriptions.Item label="紧急联系电话">{profile.emergencyPhone}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="异动记录" size="small">
                  <Timeline items={changeRecords.map(r => ({
                    color: r.type === 'promotion' ? 'green' : 'blue',
                    children: <div><Text strong>{r.type === 'transfer' ? '调动' : r.type === 'promotion' ? '晋升' : '变更'}</Text><br/><Text type="secondary">{r.before} → {r.after}</Text><br/><Text type="secondary">{r.date}</Text></div>,
                  }))} />
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* Tab2: 我的考勤 */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <Row gutter={16}>
              {leaveBalance.map(l => (
                <Col span={6} key={l.type}>
                  <Card size="small">
                    <Statistic title={l.type} value={l.remaining} suffix={`/ ${l.total} 天`} />
                    <Progress percent={(l.remaining / l.total) * 100} size="small" showInfo={false} />
                  </Card>
                </Col>
              ))}
            </Row>
            <Table columns={attendanceColumns} dataSource={attendance} rowKey="date" loading={loading} pagination={{ pageSize: 10 }} size="small" />
          </div>
        )}

        {/* Tab3: 我的薪资 */}
        {activeTab === 'salary' && (
          <div className="space-y-4">
            <Alert message="薪资信息为敏感数据，请妥善保管。" type="info" showIcon />
            <Table
              columns={[
                { title: '月份', dataIndex: 'month', key: 'month', width: 100 },
                { title: '基本工资', dataIndex: 'baseSalary', key: 'base', width: 100, render: (v: number) => `¥${v.toLocaleString()}` },
                { title: '奖金', dataIndex: 'bonus', key: 'bonus', width: 100, render: (v: number) => <Text type="success">+¥{v.toLocaleString()}</Text> },
                { title: '个税', dataIndex: 'tax', key: 'tax', width: 100, render: (v: number) => <Text type="danger">-¥{v.toLocaleString()}</Text> },
                { title: '社保公积金', dataIndex: 'insurance', key: 'insurance', width: 120, render: (v: number) => <Text type="danger">-¥{v.toLocaleString()}</Text> },
                { title: '实发工资', dataIndex: 'netSalary', key: 'net', width: 120, render: (v: number) => <Text strong style={{ color: '#1677ff' }}>¥{v.toLocaleString()}</Text> },
                { title: '操作', key: 'action', width: 80, render: (_: any, r: SalaryRecord) => <Button size="small" type="link" onClick={() => setSalaryDetail(r)}>详情</Button> },
              ]}
              dataSource={salaryRecords} rowKey="month" loading={loading} pagination={{ pageSize: 10 }} size="small"
            />
          </div>
        )}

        {/* Tab4: 我的待办 */}
        {activeTab === 'todo' && (
          <div className="space-y-4">
            <Alert message="以下事项需要您处理，请及时完成。" type="warning" showIcon />
            <Table columns={todoColumns} dataSource={todos} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small" />
          </div>
        )}

        {/* Tab5: 我的申请 */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <Table
              columns={[
                { title: '申请类型', dataIndex: 'type', key: 'type', width: 100 },
                { title: '申请标题', dataIndex: 'title', key: 'title' },
                { title: '当前节点', dataIndex: 'currentNode', key: 'node', width: 120, render: (v: string) => <Tag>{v}</Tag> },
                { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v]}</Tag> },
                { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt', width: 120 },
                { title: '操作', key: 'action', width: 80, render: () => <Button size="small" type="link">查看</Button> },
              ]}
              dataSource={applications} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small"
            />
          </div>
        )}

        {/* Tab6: 消息中心 */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              renderItem={item => (
                <List.Item actions={[<Button size="small" type="link">查看</Button>]}>
                  <List.Item.Meta
                    avatar={<Badge dot={!item.isRead}><Avatar icon={<BellOutlined />} /></Badge>}
                    title={<span>{!item.isRead && <Tag color="red" style={{ marginRight: 8 }}>新</Tag>}{item.title}</span>}
                    description={<span><Text type="secondary">{item.content}</Text><br/><Text type="secondary" className="text-xs">{item.createdAt}</Text></span>}
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>

      {/* 申请修改档案弹窗 */}
      <Modal title="申请修改档案信息" open={editModal} onOk={submitEditRequest} onCancel={() => setEditModal(false)} width={600}>
        <Alert message="修改申请将提交给管理员审核，审核通过后生效。" type="info" showIcon style={{ marginBottom: 16 }} />
        <Form form={editForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="phone" label="手机号"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="email" label="邮箱"><Input /></Form.Item></Col>
            <Col span={24}><Form.Item name="address" label="家庭住址"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="emergencyContact" label="紧急联系人"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="emergencyPhone" label="紧急联系电话"><Input /></Form.Item></Col>
            <Col span={24}><Form.Item name="reason" label="修改原因"><Input.TextArea rows={2} placeholder="请说明修改原因" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* 工资详情弹窗 */}
      <Modal title={`工资条 - ${salaryDetail?.month}`} open={!!salaryDetail} onCancel={() => setSalaryDetail(null)} footer={null} width={500}>
        {salaryDetail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="基本工资">¥{salaryDetail.baseSalary.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="奖金"><Text type="success">+¥{salaryDetail.bonus.toLocaleString()}</Text></Descriptions.Item>
            <Descriptions.Item label="扣款"><Text type="danger">-¥{salaryDetail.deduction.toLocaleString()}</Text></Descriptions.Item>
            <Descriptions.Item label="个人所得税"><Text type="danger">-¥{salaryDetail.tax.toLocaleString()}</Text></Descriptions.Item>
            <Descriptions.Item label="社保公积金"><Text type="danger">-¥{salaryDetail.insurance.toLocaleString()}</Text></Descriptions.Item>
            <Descriptions.Item label="实发工资"><Text strong style={{ fontSize: 18, color: '#1677ff' }}>¥{salaryDetail.netSalary.toLocaleString()}</Text></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
