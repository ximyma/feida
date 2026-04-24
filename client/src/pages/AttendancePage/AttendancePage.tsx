import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, message, Row, Col, Statistic, Progress, Alert, Tabs
} from 'antd';
import {
  ClockCircleOutlined, CheckCircleOutlined, CalendarOutlined,
  SettingOutlined, FormOutlined, BarChartOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, RightOutlined
} from '@ant-design/icons';

interface IAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave' | 'overtime';
  workHours?: number;
  overtimeHours?: number;
  remark?: string;
}

interface ISchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shiftType: string;
  startTime: string;
  endTime: string;
}

const statusMap: Record<string, { label: string; className: string; icon: string; color: string }> = {
  normal: { label: '正常', className: 'bg-success/10 text-success', icon: '✅', color: 'green' },
  late: { label: '迟到', className: 'bg-yellow-100 text-yellow-700', icon: '⏰', color: 'orange' },
  early: { label: '早退', className: 'bg-orange-100 text-orange-700', icon: '🏃', color: 'orange' },
  absent: { label: '缺勤', className: 'bg-destructive/10 text-destructive', icon: '❌', color: 'red' },
  leave: { label: '请假', className: 'bg-blue-100 text-blue-700', icon: '📝', color: 'blue' },
  overtime: { label: '加班', className: 'bg-purple-100 text-purple-700', icon: '🌙', color: 'purple' },
};

export default function AttendancePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [attendanceRecords, setAttendanceRecords] = useState<IAttendanceRecord[]>([]);
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<IAttendanceRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    Promise.all([
      fetch('/api/attendance_records').then(r => r.json()).catch(() => []),
      fetch('/api/schedules').then(r => r.json()).catch(() => []),
    ]).then(([attendanceData, scheduleData]) => {
      setAttendanceRecords(Array.isArray(attendanceData) ? attendanceData : []);
      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const todayRecords = attendanceRecords.filter(r => r.date === selectedDate);

  const stats = {
    totalEmployees: 48,
    todayPresent: todayRecords.filter(r => r.status === 'normal' || r.status === 'overtime').length,
    todayLate: todayRecords.filter(r => r.status === 'late').length,
    todayAbsent: todayRecords.filter(r => r.status === 'absent').length,
    todayLeave: todayRecords.filter(r => r.status === 'leave').length,
    todayOvertime: todayRecords.filter(r => r.status === 'overtime').length,
    totalWorkHours: todayRecords.reduce((sum, r) => sum + (r.workHours || 0), 0),
    totalOvertimeHours: todayRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0),
  };

  const handleClockIn = () => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    setClockInTime(time);
    messageApi.success(`上班打卡成功：${time}`);
  };

  const handleClockOut = () => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    setClockOutTime(time);
    messageApi.success(`下班打卡成功：${time}`);
  };

  const handleEditRecord = (record: IAttendanceRecord) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleDeleteRecord = (record: IAttendanceRecord) => {
    fetch(`/api/attendance_records/${record.id}`, { method: 'DELETE' })
      .then(() => {
        setAttendanceRecords(prev => prev.filter(r => r.id !== record.id));
        messageApi.success('记录已删除');
      });
  };

  const handleSaveRecord = () => {
    if (editingRecord) {
      fetch(`/api/attendance_records/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRecord),
      }).then(() => {
        setAttendanceRecords(prev => prev.map(r => r.id === editingRecord.id ? editingRecord : r));
        setShowEditModal(false);
        setEditingRecord(null);
        messageApi.success('记录已更新');
      });
    }
  };

  // 快捷操作入口
  const quickActions = [
    { title: '班次配置', desc: '管理早中晚班、弹性班', icon: <SettingOutlined style={{ fontSize: 28, color: '#1890ff' }} />, path: '/attendance/shift', color: '#e6f7ff' },
    { title: '排班管理', desc: '员工排班、调班', icon: <CalendarOutlined style={{ fontSize: 28, color: '#52c41a' }} />, path: '/attendance/schedule', color: '#f6ffed' },
    { title: '考勤规则', desc: '迟到早退规则配置', icon: <FormOutlined style={{ fontSize: 28, color: '#fa8c16' }} />, path: '/attendance/rules', color: '#fff7e6' },
    { title: '请假管理', desc: '请假申请与审批', icon: <ClockCircleOutlined style={{ fontSize: 28, color: '#722ed1' }} />, path: '/attendance/leave', color: '#f9f0ff' },
    { title: '加班管理', desc: '加班申请与审批', icon: <CheckCircleOutlined style={{ fontSize: 28, color: '#13c2c2' }} />, path: '/attendance/overtime', color: '#e6fffb' },
    { title: '考勤统计', desc: '月度统计、异常分析', icon: <BarChartOutlined style={{ fontSize: 28, color: '#eb2f96' }} />, path: '/attendance/statistics', color: '#fff0f6' },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">⏰ 考勤管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理员工考勤、排班、请假、加班</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg bg-background"
          />
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={5}><Card size="small"><Statistic title="今日出勤" value={stats.todayPresent} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="今日迟到" value={stats.todayLate} valueStyle={{ color: '#fa8c16' }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="今日请假" value={stats.todayLeave} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="今日缺勤" value={stats.todayAbsent} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="今日加班" value={stats.todayOvertime} valueStyle={{ color: '#722ed1' }} /></Card></Col>
      </Row>

      {/* ⚡ 快捷操作入口 */}
      <Card title="⚡ 快捷操作" size="small">
        <Row gutter={[16, 16]}>
          {quickActions.map(action => (
            <Col span={4} key={action.path}>
              <Card
                hoverable
                size="small"
                className="text-center cursor-pointer"
                style={{ backgroundColor: action.color, borderColor: 'transparent' }}
                onClick={() => navigate(action.path)}
              >
                <div className="mb-2">{action.icon}</div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{action.desc}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'overview', label: '📊 考勤总览' },
          { key: 'records', label: '📝 考勤记录' },
          { key: 'clock', label: '⏱️ 打卡签到' },
          { key: 'schedule', label: '📅 排班管理' },
        ]} />

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">📊 今日考勤概况</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span>应出勤人数</span>
                      <span className="font-bold">{stats.totalEmployees}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <span>实际出勤</span>
                      <span className="font-bold text-success">{stats.todayPresent}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                      <span>迟到/早退</span>
                      <span className="font-bold text-yellow-600">{stats.todayLate}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                      <span>缺勤</span>
                      <span className="font-bold text-destructive">{stats.todayAbsent}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Row gutter={16}>
                      <Col span={12} className="text-center">
                        <Statistic title="总工时" value={stats.totalWorkHours} suffix="h" valueStyle={{ fontSize: 20 }} />
                      </Col>
                      <Col span={12} className="text-center">
                        <Statistic title="加班工时" value={stats.totalOvertimeHours} suffix="h" valueStyle={{ fontSize: 20 }} />
                      </Col>
                    </Row>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">📈 今日出勤率</h3>
                  <div className="flex items-center justify-center py-4">
                    <Progress
                      type="dashboard"
                      percent={Math.round((stats.todayPresent / stats.totalEmployees) * 100)}
                      format={p => `${p}%`}
                      strokeColor="#52c41a"
                      size={160}
                    />
                  </div>
                  <Row gutter={16} className="mt-4">
                    <Col span={12} className="text-center">
                      <Statistic title="迟到" value={stats.todayLate} valueStyle={{ color: '#fa8c16', fontSize: 20 }} />
                    </Col>
                    <Col span={12} className="text-center">
                      <Statistic title="缺勤" value={stats.todayAbsent} valueStyle={{ color: '#ff4d4f', fontSize: 20 }} />
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            {activeTab === 'records' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button type="primary" icon={<PlusOutlined />}>补录考勤</Button>
                </div>
                <Table dataSource={todayRecords} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
                  { title: '员工姓名', dataIndex: 'employeeName', key: 'name', width: 100 },
                  { title: '部门', dataIndex: 'department', key: 'dept', width: 100 },
                  { title: '上班打卡', dataIndex: 'clockIn', key: 'clockIn', width: 100, render: (v: string) => v || '-' },
                  { title: '下班打卡', dataIndex: 'clockOut', key: 'clockOut', width: 100, render: (v: string) => v || '-' },
                  { title: '工时', dataIndex: 'workHours', key: 'hours', width: 70, render: (v: number) => v ? `${v}h` : '-' },
                  { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.icon} {statusMap[v]?.label}</Tag> },
                  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true, render: (v: string) => v || '-' },
                  { title: '操作', key: 'action', width: 130, render: (_: any, r: IAttendanceRecord) => (
                    <Space size="small">
                      <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEditRecord(r)}>编辑</Button>
                      <Popconfirm title="确定删除此记录?" onConfirm={() => handleDeleteRecord(r)}>
                        <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>
                    </Space>
                  )},
                ]} />
              </div>
            )}

            {activeTab === 'clock' && (
              <div className="max-w-md mx-auto">
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <div className="text-6xl mb-6">⏱️</div>
                  <div className="text-4xl font-bold mb-2">
                    {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-muted-foreground mb-8">
                    {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>

                  {clockInTime ? (
                    <div className="space-y-4">
                      <div className="bg-success/10 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">上班打卡时间</div>
                        <div className="text-2xl font-bold text-success">{clockInTime}</div>
                      </div>
                      {clockOutTime ? (
                        <div className="bg-blue-500/10 rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">下班打卡时间</div>
                          <div className="text-2xl font-bold text-blue-600">{clockOutTime}</div>
                        </div>
                      ) : (
                        <Button size="large" type="primary" onClick={handleClockOut} block>下班打卡</Button>
                      )}
                    </div>
                  ) : (
                    <Button size="large" type="primary" onClick={handleClockIn} block>上班打卡</Button>
                  )}

                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-medium mb-4">今日打卡记录</h4>
                    <Row gutter={16}>
                      <Col span={12} className="text-center bg-muted/30 rounded-lg p-3">
                        <div className="text-muted-foreground">上班</div>
                        <div className="font-medium">{clockInTime || '未打卡'}</div>
                      </Col>
                      <Col span={12} className="text-center bg-muted/30 rounded-lg p-3">
                        <div className="text-muted-foreground">下班</div>
                        <div className="font-medium">{clockOutTime || '未打卡'}</div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Alert message="排班管理支持批量排班和调班操作" type="info" showIcon className="flex-1" />
                  <Button type="primary" icon={<PlusOutlined />} className="ml-4" onClick={() => navigate('/attendance/schedule')}>前往排班管理</Button>
                </div>
                <Row gutter={[16, 16]}>
                  {['早班', '中班', '晚班', '弹性班', '周末班'].map((shiftType) => {
                    const shiftSchedules = schedules.filter(s => s.shiftType === shiftType);
                    return (
                      <Col span={8} key={shiftType}>
                        <Card size="small" title={shiftType} extra={<Tag>{shiftSchedules.length}人</Tag>}>
                          <div className="space-y-2 text-sm">
                            {shiftSchedules.slice(0, 5).map(s => (
                              <div key={s.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <span>{s.employeeName}</span>
                                <span className="text-muted-foreground text-xs">{s.startTime}-{s.endTime}</span>
                              </div>
                            ))}
                            {shiftSchedules.length === 0 && <div className="text-center text-muted-foreground py-4">暂无排班</div>}
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            )}
          </>
        )}
      </Card>

      {/* 编辑考勤记录弹窗 */}
      <Modal title="编辑考勤记录" open={showEditModal} onOk={handleSaveRecord} onCancel={() => { setShowEditModal(false); setEditingRecord(null); }} width={480}>
        {editingRecord && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">员工姓名</label>
              <Input value={editingRecord.employeeName} onChange={e => setEditingRecord({ ...editingRecord, employeeName: e.target.value })} className="mt-1" />
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <label className="text-sm text-muted-foreground">上班打卡</label>
                <Input type="time" value={editingRecord.clockIn || ''} onChange={e => setEditingRecord({ ...editingRecord, clockIn: e.target.value })} className="mt-1" />
              </Col>
              <Col span={12}>
                <label className="text-sm text-muted-foreground">下班打卡</label>
                <Input type="time" value={editingRecord.clockOut || ''} onChange={e => setEditingRecord({ ...editingRecord, clockOut: e.target.value })} className="mt-1" />
              </Col>
            </Row>
            <div>
              <label className="text-sm text-muted-foreground">状态</label>
              <Select value={editingRecord.status} style={{ width: '100%' }} onChange={v => setEditingRecord({ ...editingRecord, status: v })} className="mt-1">
                {Object.entries(statusMap).map(([key, val]) => <Option key={key} value={key}>{val.icon} {val.label}</Option>)}
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">备注</label>
              <Input.TextArea value={editingRecord.remark || ''} onChange={e => setEditingRecord({ ...editingRecord, remark: e.target.value })} rows={2} className="mt-1" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
