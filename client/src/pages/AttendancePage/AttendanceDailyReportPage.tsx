import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, Row, Col, Statistic, Alert, Tabs, Badge
} from 'antd';
import {
  ReloadOutlined, PlayCircleOutlined, FileTextOutlined, TeamOutlined,
  CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface DailyReport {
  id: string;
  date: string;
  department: string;
  totalEmployees: number;
  normalCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  leaveCount: number;
  overtimeCount: number;
  restDayCount: number;
  holidayCount: number;
  details?: EmployeeDetail[];
  createdAt?: string;
}

interface EmployeeDetail {
  employeeId: string;
  employeeName: string;
  department: string;
  status: string;
  statusLabel: string;
  clockIn?: string;
  clockOut?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  workHours?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  leaveType?: string;
  overtimeHours?: number;
  remark?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  normal: { label: '正常', color: 'success', icon: <CheckCircleOutlined /> },
  late: { label: '迟到', color: 'warning', icon: <ClockCircleOutlined /> },
  early: { label: '早退', color: 'warning', icon: <ClockCircleOutlined /> },
  absent: { label: '缺勤', color: 'error', icon: <ExclamationCircleOutlined /> },
  leave: { label: '请假', color: 'processing', icon: <FileTextOutlined /> },
  overtime: { label: '加班', color: 'purple', icon: <ClockCircleOutlined /> },
  rest: { label: '休息日', color: 'default', icon: <TeamOutlined /> },
  holiday: { label: '节假日', color: 'gold', icon: <TeamOutlined /> },
  unknown: { label: '未知', color: 'default', icon: <WarningOutlined /> },
};

export default function AttendanceDailyReportPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  // 筛选条件
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.set('startDate', dateRange[0].format('YYYY-MM-DD'));
        params.set('endDate', dateRange[1].format('YYYY-MM-DD'));
      }
      const res = await fetch(`/api/attendance/daily-reports?${params.toString()}`);
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch {
      messageApi.error('加载日报失败');
    }
    setLoading(false);
  }, [dateRange, messageApi]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // 生成指定日期的日报
  const handleGenerate = async (date: string, department?: string) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/attendance/daily-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, department }),
      });
      const data = await res.json();
      if (data.success) {
        messageApi.success(data.message || '日报生成成功');
        fetchReports();
      } else {
        messageApi.error(data.message || '日报生成失败');
      }
    } catch {
      messageApi.error('网络错误');
    }
    setGenerating(false);
  };

  // 批量生成历史日报
  const handleBatchGenerate = async () => {
    const values = await form.validateFields();
    const [startDate, endDate] = values.dateRange;
    
    setGenerating(true);
    try {
      const res = await fetch('/api/attendance/daily-report/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
        }),
      });
      const data = await res.json();
      if (data.success) {
        messageApi.success(data.message);
        fetchReports();
        setActiveTab('list');
      } else {
        messageApi.error(data.message || '批量生成失败');
      }
    } catch {
      messageApi.error('网络错误');
    }
    setGenerating(false);
  };

  // 查看日报详情
  const handleViewDetail = async (report: DailyReport) => {
    try {
      const res = await fetch(`/api/attendance/daily-report/${report.id}`);
      const data = await res.json();
      if (data.success !== false) {
        setSelectedReport(data);
        setShowDetailModal(true);
      }
    } catch {
      messageApi.error('加载详情失败');
    }
  };

  // 统计数据
  const totalStats = reports.reduce((acc, r) => ({
    total: acc.total + r.totalEmployees,
    normal: acc.normal + r.normalCount,
    late: acc.late + r.lateCount,
    absent: acc.absent + r.absentCount,
    leave: acc.leave + r.leaveCount,
  }), { total: 0, normal: 0, late: 0, absent: 0, leave: 0 });

  const reportColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
      sorter: (a: DailyReport, b: DailyReport) => a.date.localeCompare(b.date),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '应到人数',
      dataIndex: 'totalEmployees',
      key: 'total',
      width: 90,
      align: 'center' as const,
    },
    {
      title: '正常',
      dataIndex: 'normalCount',
      key: 'normal',
      width: 70,
      align: 'center' as const,
      render: (v: number) => <Tag color="success">{v}</Tag>,
    },
    {
      title: '迟到',
      dataIndex: 'lateCount',
      key: 'late',
      width: 70,
      align: 'center' as const,
      render: (v: number) => v > 0 ? <Tag color="warning">{v}</Tag> : <span className="text-gray-400">0</span>,
    },
    {
      title: '早退',
      dataIndex: 'earlyLeaveCount',
      key: 'early',
      width: 70,
      align: 'center' as const,
      render: (v: number) => v > 0 ? <Tag color="warning">{v}</Tag> : <span className="text-gray-400">0</span>,
    },
    {
      title: '缺勤',
      dataIndex: 'absentCount',
      key: 'absent',
      width: 70,
      align: 'center' as const,
      render: (v: number) => v > 0 ? <Tag color="error">{v}</Tag> : <span className="text-gray-400">0</span>,
    },
    {
      title: '请假',
      dataIndex: 'leaveCount',
      key: 'leave',
      width: 70,
      align: 'center' as const,
      render: (v: number) => v > 0 ? <Tag color="processing">{v}</Tag> : <span className="text-gray-400">0</span>,
    },
    {
      title: '加班',
      dataIndex: 'overtimeCount',
      key: 'overtime',
      width: 70,
      align: 'center' as const,
      render: (v: number) => v > 0 ? <Tag color="purple">{v}</Tag> : <span className="text-gray-400">0</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, r: DailyReport) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleViewDetail(r)}>
            查看详情
          </Button>
          <Button type="link" size="small" onClick={() => handleGenerate(r.date, r.department === '全公司' ? undefined : r.department)}>
            重新生成
          </Button>
        </Space>
      ),
    },
  ];

  const detailColumns = [
    {
      title: '员工姓名',
      dataIndex: 'employeeName',
      key: 'name',
      width: 100,
      render: (v: string, r: EmployeeDetail) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <div className="text-xs text-gray-400">{r.employeeId}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'statusLabel',
      key: 'status',
      width: 100,
      render: (v: string, r: EmployeeDetail) => {
        const cfg = statusConfig[r.status] || statusConfig.unknown;
        return <Tag color={cfg.color} icon={cfg.icon}>{v}</Tag>;
      },
    },
    {
      title: '上班打卡',
      dataIndex: 'clockIn',
      key: 'clockIn',
      width: 90,
      render: (v: string, r: EmployeeDetail) => (
        <span className={r.lateMinutes ? 'text-orange-500' : ''}>
          {v || '-'}
          {r.lateMinutes && <span className="text-xs ml-1">(+{r.lateMinutes}分)</span>}
        </span>
      ),
    },
    {
      title: '下班打卡',
      dataIndex: 'clockOut',
      key: 'clockOut',
      width: 90,
      render: (v: string, r: EmployeeDetail) => (
        <span className={r.earlyLeaveMinutes ? 'text-orange-500' : ''}>
          {v || '-'}
          {r.earlyLeaveMinutes && <span className="text-xs ml-1">(-{r.earlyLeaveMinutes}分)</span>}
        </span>
      ),
    },
    {
      title: '工时',
      dataIndex: 'workHours',
      key: 'hours',
      width: 70,
      align: 'center' as const,
      render: (v: number) => v ? `${v}h` : '-',
    },
    {
      title: '加班',
      dataIndex: 'overtimeHours',
      key: 'ot',
      width: 70,
      align: 'center' as const,
      render: (v: number) => v ? <Tag color="purple">{v}h</Tag> : '-',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (v: string) => v || '-',
    },
  ];

  return (
    <div className="space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📊 考勤日报</h1>
          <p className="text-sm text-muted-foreground mt-1">自动生成员工每日考勤汇总报表</p>
        </div>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={fetchReports}>刷新</Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'list',
          label: '📋 日报列表',
          children: (
            <>
              {/* 统计卡片 */}
              <Row gutter={16} className="mb-4">
                <Col span={4}><Card size="small"><Statistic title="总应到人次" value={totalStats.total} /></Card></Col>
                <Col span={4}><Card size="small"><Statistic title="正常人次" value={totalStats.normal} valueStyle={{ color: '#52c41a' }} /></Card></Col>
                <Col span={4}><Card size="small"><Statistic title="迟到人次" value={totalStats.late} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
                <Col span={4}><Card size="small"><Statistic title="缺勤人次" value={totalStats.absent} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
                <Col span={4}><Card size="small"><Statistic title="请假人次" value={totalStats.leave} valueStyle={{ color: '#1890ff' }} /></Card></Col>
                <Col span={4}>
                  <Card size="small">
                    <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setActiveTab('generate')} loading={generating}>
                      生成日报
                    </Button>
                  </Card>
                </Col>
              </Row>

              <Card>
                <Table
                  dataSource={reports}
                  columns={reportColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t: number) => `共 ${t} 条` }}
                  size="middle"
                />
              </Card>
            </>
          ),
        },
        {
          key: 'generate',
          label: '⚡ 生成日报',
          children: (
            <Card title="生成考勤日报">
              <Alert
                message="日报生成说明"
                description={
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• <strong>生成单日报</strong>：选择日期，点击「立即生成」，系统将汇总当日所有员工考勤数据</li>
                    <li>• <strong>批量生成</strong>：选择日期范围，一键生成历史日报（建议分批执行，每次不超过30天）</li>
                    <li>• 日报数据来源：打卡记录、请假记录、排班信息、加班记录</li>
                    <li>• 生成后的日报可随时重新生成覆盖</li>
                  </ul>
                }
                type="info"
                showIcon
                className="mb-4"
              />

              <Row gutter={24}>
                <Col span={12}>
                  <Card title="📅 生成单日报" size="small">
                    <Form layout="vertical">
                      <Form.Item label="选择日期" required>
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="部门（可选）">
                        <Select allowClear placeholder="不选则生成全公司日报" options={[
                          { value: '技术部', label: '技术部' },
                          { value: '销售部', label: '销售部' },
                          { value: '人事部', label: '人事部' },
                          { value: '财务部', label: '财务部' },
                        ]} />
                      </Form.Item>
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={() => {
                          const dateInput = document.querySelector('.ant-picker')?.querySelector('input');
                          if (dateInput) {
                            const date = (dateInput as HTMLInputElement).value;
                            if (date) handleGenerate(date);
                            else messageApi.warning('请先选择日期');
                          }
                        }}
                        loading={generating}
                        block
                      >
                        立即生成
                      </Button>
                    </Form>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="📅 批量生成历史日报" size="small">
                    <Form form={form} layout="vertical">
                      <Form.Item
                        label="日期范围"
                        name="dateRange"
                        rules={[{ required: true, message: '请选择日期范围' }]}
                      >
                        <RangePicker style={{ width: '100%' }} />
                      </Form.Item>
                      <Alert
                        message="注意"
                        description="批量生成可能会消耗较多资源，建议每次不超过30天"
                        type="warning"
                        showIcon
                        className="mb-3"
                      />
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={handleBatchGenerate}
                        loading={generating}
                        block
                      >
                        开始批量生成
                      </Button>
                    </Form>
                  </Card>
                </Col>
              </Row>

              <Card title="💡 快速操作" size="small" className="mt-4">
                <Space wrap>
                  <Button onClick={() => handleGenerate(dayjs().format('YYYY-MM-DD'))}>
                    生成今日日报
                  </Button>
                  <Button onClick={() => handleGenerate(dayjs().subtract(1, 'day').format('YYYY-MM-DD'))}>
                    生成昨日日报
                  </Button>
                  <Button onClick={() => {
                    const weekAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
                    const today = dayjs().format('YYYY-MM-DD');
                    form.setFieldsValue({ dateRange: [dayjs(weekAgo), dayjs(today)] });
                  }}>
                    近7天
                  </Button>
                  <Button onClick={() => {
                    const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
                    const today = dayjs().format('YYYY-MM-DD');
                    form.setFieldsValue({ dateRange: [dayjs(monthStart), dayjs(today)] });
                  }}>
                    本月
                  </Button>
                </Space>
              </Card>
            </Card>
          ),
        },
      ]} />

      {/* 日报详情弹窗 */}
      <Modal
        title={`考勤日报详情 - ${selectedReport?.date || ''} ${selectedReport?.department || ''}`}
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        width={1000}
      >
        {selectedReport && (
          <>
            <Row gutter={16} className="mb-4">
              <Col span={3}><Statistic title="应到" value={selectedReport.totalEmployees} /></Col>
              <Col span={3}><Statistic title="正常" value={selectedReport.normalCount} valueStyle={{ color: '#52c41a' }} /></Col>
              <Col span={3}><Statistic title="迟到" value={selectedReport.lateCount} valueStyle={{ color: '#fa8c16' }} /></Col>
              <Col span={3}><Statistic title="早退" value={selectedReport.earlyLeaveCount} valueStyle={{ color: '#fa8c16' }} /></Col>
              <Col span={3}><Statistic title="缺勤" value={selectedReport.absentCount} valueStyle={{ color: '#ff4d4f' }} /></Col>
              <Col span={3}><Statistic title="请假" value={selectedReport.leaveCount} valueStyle={{ color: '#1890ff' }} /></Col>
              <Col span={3}><Statistic title="加班" value={selectedReport.overtimeCount} valueStyle={{ color: '#722ed1' }} /></Col>
            </Row>

            <Tabs items={[
              {
                key: 'details',
                label: '明细列表',
                children: (
                  <Table
                    dataSource={selectedReport.details || []}
                    columns={detailColumns}
                    rowKey="employeeId"
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    size="small"
                    scroll={{ x: 800 }}
                  />
                ),
              },
              {
                key: 'summary',
                label: '状态分布',
                children: (
                  <div className="grid grid-cols-4 gap-4 p-4">
                    {(['normal', 'late', 'early', 'absent', 'leave', 'overtime', 'rest', 'holiday'] as const).map(status => {
                      const cfg = statusConfig[status];
                      const count = (selectedReport.details || []).filter(d => d.status === status).length;
                      if (count === 0) return null;
                      return (
                        <Card key={status} size="small">
                          <div className="flex items-center gap-2">
                            <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>
                            <span className="text-xl font-bold">{count}人</span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ),
              },
            ]} />
          </>
        )}
      </Modal>
    </div>
  );
}
