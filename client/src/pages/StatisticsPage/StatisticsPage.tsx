import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, message, Tabs, Row, Col, Progress, Descriptions,
  Divider, Dropdown, Menu, Tooltip, Alert, Collapse, InputNumber,
  Checkbox, Switch, Popconfirm, Badge, Statistic, Typography, Drawer, Empty
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
  BarChartOutlined, LineChartOutlined, PieChartOutlined, ReloadOutlined,
  TableOutlined, FileExcelOutlined, FilePdfOutlined, FileImageOutlined,
  SettingOutlined, FilterOutlined, EyeOutlined, DatabaseOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ApiOutlined,
  TeamOutlined, AuditOutlined, MoneyCollectOutlined, ProjectOutlined,
  CalendarOutlined, FileTextOutlined, BookOutlined, ProfileOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const { Option } = Select;
const { Panel } = Collapse;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// ============ 类型定义 ============
interface ReportDef {
  id: string;
  name: string;
  description?: string;
  category: string;
  tableName?: string;
  chartType?: string;
  xField?: string;
  yFields?: string;
  fields?: string;
  filters?: string;
  config?: string;
  isBuiltIn?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface DataSource {
  id: string;
  name: string;
  description?: string;
  type: string;
  tableName?: string;
  filePath?: string;
  apiUrl?: string;
  fields?: string;
  status?: string;
  lastTestedAt?: string;
  config?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ReportConfig {
  id: string;
  name: string;
  category: string;
  configKey: string;
  configValue?: string;
  description?: string;
  sortOrder?: number;
  updatedBy?: string;
  updatedAt: string;
}

interface StatisticsData {
  overview: any;
  deptDistribution: { name: string; value: number }[];
  eduDistribution: { name: string; value: number }[];
  genderDistribution: { name: string; value: number }[];
  tenureDistribution: { name: string; value: number }[];
  hireTrendData: { month: string; value: number }[];
  monthAttendance: { name: string; value: number }[];
  attendanceTrendData: { month: string; normal: number; late: number; absent: number }[];
  salaryDistribution: { name: string; value: number }[];
  salaryTrendData: { name: string; value: number }[];
  sourceDistribution: { name: string; value: number }[];
  gradeDistribution: { name: string; value: number }[];
  leaveTypeDistribution: { name: string; value: number }[];
  contractTypeDistribution: { name: string; value: number }[];
}

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  span?: number;
}

// ============ 图表配色 ============
const CHART_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];

// ============ 工具函数 ============
const getColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

const makePieOption = (title: string, data: { name: string; value: number }[], color?: string) => ({
  color: color ? [color] : CHART_COLORS,
  title: { text: title, left: 'center', textStyle: { fontSize: 14, fontWeight: 'normal' } },
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  series: [{
    type: 'pie', radius: ['40%', '70%'],
    data: data.map(d => ({ name: d.name || '未知', value: d.value })),
    label: { formatter: '{b}\n{d}%', fontSize: 11 },
    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
  }]
});

const makeBarOption = (title: string, xData: string[], yData: number[], yName?: string) => ({
  color: CHART_COLORS,
  title: { text: title, left: 'center', textStyle: { fontSize: 14, fontWeight: 'normal' } },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
  xAxis: { type: 'category', data: xData, axisLabel: { rotate: 30, fontSize: 10 } },
  yAxis: { type: 'value', name: yName, nameTextStyle: { fontSize: 11 } },
  series: [{ data: yData, type: 'bar', smooth: true, areaStyle: { opacity: 0.2 } }]
});

const makeLineOption = (title: string, xData: string[], series: { name: string; data: number[]; color?: string }[]) => ({
  color: CHART_COLORS,
  title: { text: title, left: 'center', textStyle: { fontSize: 14, fontWeight: 'normal' } },
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0, data: series.map(s => s.name) },
  grid: { left: '3%', right: '4%', bottom: '40px', top: '40px', containLabel: true },
  xAxis: { type: 'category', data: xData, boundaryGap: false },
  yAxis: { type: 'value' },
  series: series.map(s => ({ name: s.name, data: s.data, type: 'line', smooth: true, areaStyle: { opacity: 0.15 } }))
});

// ============ 图表卡片组件 ============
function ChartCard({ title, icon, children, span = 12 }: ChartCardProps) {
  return (
    <Col span={span}>
      <Card size="small" title={<span>{icon} {title}</span>} style={{ height: 340 }}>
        {children}
      </Card>
    </Col>
  );
}

// ============ 主页面 ============
export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [reports, setReports] = useState<ReportDef[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [configs, setConfigs] = useState<ReportConfig[]>([]);

  // Modal 状态
  const [reportModal, setReportModal] = useState(false);
  const [dsModal, setDsModal] = useState(false);
  const [configModal, setConfigModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const [editingReport, setEditingReport] = useState<ReportDef | null>(null);
  const [editingDs, setEditingDs] = useState<DataSource | null>(null);
  const [editingConfig, setEditingConfig] = useState<ReportConfig | null>(null);

  const [reportForm] = Form.useForm();
  const [dsForm] = Form.useForm();
  const [configForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // ============ 加载数据 ============
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/statistics');
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch {
      messageApi.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  const loadReports = useCallback(async () => {
    try {
      const res = await fetch('/api/report_definitions');
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch {}
  }, []);

  const loadDataSources = useCallback(async () => {
    try {
      const res = await fetch('/api/data_sources');
      const data = await res.json();
      if (Array.isArray(data)) setDataSources(data);
    } catch {}
  }, []);

  const loadConfigs = useCallback(async () => {
    try {
      const res = await fetch('/api/report_configs');
      const data = await res.json();
      if (Array.isArray(data)) setConfigs(data);
    } catch {}
  }, []);

  useEffect(() => {
    loadStats();
    loadReports();
    loadDataSources();
    loadConfigs();
  }, [loadStats, loadReports, loadDataSources, loadConfigs]);

  // ============ 报表 CRUD ============
  const handleSaveReport = async () => {
    try {
      const values = await reportForm.validateFields();
      const now = new Date().toISOString().slice(0, 10);
      const method = editingReport ? 'PUT' : 'POST';
      const url = editingReport ? `/api/report_definitions/${editingReport.id}` : '/api/report_definitions';
      const payload = { ...values, updatedAt: now, createdAt: editingReport?.createdAt || now };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        messageApi.success(editingReport ? '报表已更新' : '报表已创建');
        setReportModal(false);
        loadReports();
      }
    } catch {}
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await fetch(`/api/report_definitions/${id}`, { method: 'DELETE' });
      setReports(reports.filter(r => r.id !== id));
      messageApi.success('报表已删除');
    } catch { setReports(reports.filter(r => r.id !== id)); }
  };

  const handleTestDs = async (ds: DataSource) => {
    messageApi.loading('正在测试连接...', 1);
    try {
      const res = await fetch('/api/data_sources/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ds.id }) });
      const json = await res.json();
      if (json.success) messageApi.success(json.message || '连接成功');
      else messageApi.error(json.message || '连接失败');
      loadDataSources();
    } catch { messageApi.error('测试连接失败'); }
  };

  const handleSaveDs = async () => {
    try {
      const values = await dsForm.validateFields();
      const now = new Date().toISOString().slice(0, 10);
      const method = editingDs ? 'PUT' : 'POST';
      const url = editingDs ? `/api/data_sources/${editingDs.id}` : '/api/data_sources';
      const payload = { ...values, updatedAt: now, createdAt: editingDs?.createdAt || now };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        messageApi.success(editingDs ? '数据源已更新' : '数据源已创建');
        setDsModal(false);
        loadDataSources();
      }
    } catch {}
  };

  const handleDeleteDs = async (id: string) => {
    try {
      await fetch(`/api/data_sources/${id}`, { method: 'DELETE' });
      setDataSources(dataSources.filter(d => d.id !== id));
      messageApi.success('数据源已删除');
    } catch { setDataSources(dataSources.filter(d => d.id !== id)); }
  };

  const handleSaveConfig = async () => {
    try {
      const values = await configForm.validateFields();
      const now = new Date().toISOString().slice(0, 10);
      const method = editingConfig ? 'PUT' : 'POST';
      const url = editingConfig ? `/api/report_configs/${editingConfig.id}` : '/api/report_configs';
      const payload = { ...values, updatedAt: now, createdAt: editingConfig?.createdAt || now };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        messageApi.success(editingConfig ? '配置已更新' : '配置已创建');
        setConfigModal(false);
        loadConfigs();
      }
    } catch {}
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      await fetch(`/api/report_configs/${id}`, { method: 'DELETE' });
      setConfigs(configs.filter(c => c.id !== id));
      messageApi.success('配置已删除');
    } catch { setConfigs(configs.filter(c => c.id !== id)); }
  };

  const handlePreviewReport = (report: ReportDef) => {
    if (!stats) { messageApi.warning('请等待数据加载完成'); return; }
    const dataMap: Record<string, any> = {
      deptDistribution: stats.deptDistribution,
      eduDistribution: stats.eduDistribution,
      genderDistribution: stats.genderDistribution,
      tenureDistribution: stats.tenureDistribution,
      hireTrendData: stats.hireTrendData,
      monthAttendance: stats.monthAttendance,
      attendanceTrendData: stats.attendanceTrendData,
      salaryDistribution: stats.salaryDistribution,
      salaryTrendData: stats.salaryTrendData,
      sourceDistribution: stats.sourceDistribution,
      gradeDistribution: stats.gradeDistribution,
      leaveTypeDistribution: stats.leaveTypeDistribution,
      contractTypeDistribution: stats.contractTypeDistribution,
    };
    setPreviewData({ report, chartData: dataMap[report.tableName || ''] || [] });
    setPreviewModal(true);
  };

  // ============ 内部数据源表清单 ============
  const internalTables = [
    { value: 'deptDistribution', label: '部门人员分布' },
    { value: 'eduDistribution', label: '学历结构分布' },
    { value: 'genderDistribution', label: '性别分布' },
    { value: 'tenureDistribution', label: '司龄结构分布' },
    { value: 'hireTrendData', label: '月度入职趋势' },
    { value: 'monthAttendance', label: '本月考勤状态分布' },
    { value: 'attendanceTrendData', label: '考勤月度趋势' },
    { value: 'salaryDistribution', label: '薪资档位分布' },
    { value: 'salaryTrendData', label: '薪资月度趋势' },
    { value: 'sourceDistribution', label: '招聘来源分布' },
    { value: 'gradeDistribution', label: '绩效等级分布' },
    { value: 'leaveTypeDistribution', label: '请假类型分布' },
    { value: 'contractTypeDistribution', label: '合同类型分布' },
  ];

  // ============ 报表列定义 ============
  const reportColumns = [
    { title: '报表名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: (v: string) => <Tag color="blue">{v || '自定义'}</Tag> },
    { title: '数据表', dataIndex: 'tableName', key: 'tableName', width: 150, render: (v: string) => <Text type="secondary">{v ? internalTables.find(t => t.value === v)?.label || v : '-'}</Text> },
    { title: '图表类型', dataIndex: 'chartType', key: 'chartType', width: 100, render: (v: string) => {
      const icons: Record<string, React.ReactNode> = { table: <TableOutlined />, bar: <BarChartOutlined />, line: <LineChartOutlined />, pie: <PieChartOutlined /> };
      const labels: Record<string, string> = { table: '表格', bar: '柱状图', line: '折线图', pie: '饼图' };
      return <Tag icon={icons[v]}>{labels[v] || '表格'}</Tag>;
    }},
    { title: '内置', dataIndex: 'isBuiltIn', key: 'isBuiltIn', width: 70, render: (v: number) => v ? <Tag color="gold">是</Tag> : <Tag>否</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 120 },
    { title: '操作', key: 'action', width: 220, render: (_: any, r: ReportDef) => (
      <Space size="small">
        <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => handlePreviewReport(r)}>预览</Button>
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => { setEditingReport(r); reportForm.setFieldsValue(r); setReportModal(true); }}>编辑</Button>
        <Popconfirm title="确定删除？" onConfirm={() => handleDeleteReport(r.id)} okText="确定" cancelText="取消">
          <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const dsColumns = [
    { title: '数据源名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 120, render: (v: string) => {
      const map: Record<string, { label: string; color: string }> = { internal: { label: '内部数据库', color: 'blue' }, excel: { label: 'Excel文件', color: 'green' }, csv: { label: 'CSV文件', color: 'cyan' }, api: { label: 'API接口', color: 'purple' } };
      return <Tag color={map[v]?.color}>{map[v]?.label}</Tag>;
    }},
    { title: '来源', key: 'source', width: 200, render: (_: any, r: DataSource) => r.tableName || r.filePath || r.apiUrl || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (v: string) => <Badge status={v === 'connected' ? 'success' : 'error'} text={v === 'connected' ? '已连接' : '未连接'} /> },
    { title: '测试时间', dataIndex: 'lastTestedAt', key: 'lastTestedAt', width: 160, render: (v: string) => v ? v.slice(0, 16) : '-' },
    { title: '操作', key: 'action', width: 200, render: (_: any, r: DataSource) => (
      <Space size="small">
        <Button size="small" type="link" icon={<ReloadOutlined />} onClick={() => handleTestDs(r)}>测试</Button>
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => { setEditingDs(r); dsForm.setFieldsValue(r); setDsModal(true); }}>编辑</Button>
        <Popconfirm title="确定删除？" onConfirm={() => handleDeleteDs(r.id)} okText="确定" cancelText="取消">
          <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const configColumns = [
    { title: '配置名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: (v: string) => <Tag color="purple">{v}</Tag> },
    { title: '配置键', dataIndex: 'configKey', key: 'configKey', width: 160, render: (v: string) => <Text code>{v}</Text> },
    { title: '配置值', dataIndex: 'configValue', key: 'configValue', width: 150, render: (v: string) => v || '-' },
    { title: '描述', dataIndex: 'description', key: 'description', width: 200, render: (v: string) => v || '-' },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160 },
    { title: '操作', key: 'action', width: 150, render: (_: any, c: ReportConfig) => (
      <Space size="small">
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => { setEditingConfig(c); configForm.setFieldsValue(c); setConfigModal(true); }}>编辑</Button>
        <Popconfirm title="确定删除？" onConfirm={() => handleDeleteConfig(c.id)} okText="确定" cancelText="取消">
          <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const tabs = [
    { key: 'overview', label: <span><ProjectOutlined /> 数据总览</span> },
    { key: 'reports', label: <span><TableOutlined /> 报表管理</span> },
    { key: 'datasource', label: <span><DatabaseOutlined /> 数据源配置</span> },
    { key: 'config', label: <span><SettingOutlined /> 常用配置</span> },
    { key: 'employee', label: <span><TeamOutlined /> 员工分析</span> },
    { key: 'attendance', label: <span><CalendarOutlined /> 考勤分析</span> },
    { key: 'salary', label: <span><MoneyCollectOutlined /> 薪资分析</span> },
  ];

  // ============ 渲染 ============
  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">统计分析</h2>
          <p className="text-sm text-muted-foreground">多维度人力资源数据分析与可视化报表</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadStats}>刷新数据</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingReport(null); reportForm.resetFields(); setReportModal(true); }}>新建报表</Button>
        </Space>
      </div>

      {stats && stats.overview && (
        <Row gutter={12}>
          <Col span={4}><Card size="small"><Statistic title="员工总数" value={stats.overview.totalEmployees} suffix="人" valueStyle={{ fontSize: 22 }} /></Card></Col>
          <Col span={4}><Card size="small"><Statistic title="在职员工" value={stats.overview.activeEmployees} suffix="人" valueStyle={{ fontSize: 22, color: '#52c41a' }} /></Card></Col>
          <Col span={4}><Card size="small"><Statistic title="今日考勤" value={stats.overview.todayAttendanceCount} suffix="人" valueStyle={{ fontSize: 22 }} /></Card></Col>
          <Col span={4}><Card size="small"><Statistic title="本月迟到" value={stats.overview.todayLateCount || 0} suffix="次" valueStyle={{ fontSize: 22, color: '#faad14' }} /></Card></Col>
          <Col span={4}><Card size="small"><Statistic title="本月发薪" value={stats.overview.salaryStats?.count || 0} suffix="人" prefix="¥" valueStyle={{ fontSize: 22 }} /></Card></Col>
          <Col span={4}><Card size="small"><Statistic title="待审批假" value={stats.overview.leaveStats?.pending || 0} suffix="条" valueStyle={{ fontSize: 22, color: '#1677ff' }} /></Card></Col>
        </Row>
      )}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 16 }}
          items={tabs.map(t => ({ key: t.key, label: t.label }))}
        />

        {/* ========== 数据总览 ========== */}
        {activeTab === 'overview' && !loading && stats && (
          <div className="space-y-4">
            <Alert message="以下数据均来自系统数据库，实时统计各模块业务数据" type="info" showIcon />
            <Row gutter={12}>
              <ChartCard title="部门人员分布" icon={<TeamOutlined />} span={8}>
                {stats.deptDistribution.length > 0
                  ? <ReactECharts option={makePieOption('', stats.deptDistribution)} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
              <ChartCard title="考勤状态分布" icon={<CalendarOutlined />} span={8}>
                {stats.monthAttendance.length > 0
                  ? <ReactECharts option={makePieOption('', stats.monthAttendance)} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无考勤数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
              <ChartCard title="薪资档位分布" icon={<MoneyCollectOutlined />} span={8}>
                {stats.salaryDistribution.length > 0
                  ? <ReactECharts option={makePieOption('', stats.salaryDistribution)} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无薪资数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
            </Row>
            <Row gutter={12}>
              <ChartCard title="员工学历结构" icon={<BookOutlined />} span={8}>
                {stats.eduDistribution.length > 0
                  ? <ReactECharts option={makeBarOption('', stats.eduDistribution.map(d => d.name), stats.eduDistribution.map(d => d.value))} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无学历数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
              <ChartCard title="司龄结构分布" icon={<ProfileOutlined />} span={8}>
                {stats.tenureDistribution.length > 0
                  ? <ReactECharts option={makePieOption('', stats.tenureDistribution)} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无司龄数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
              <ChartCard title="请假类型分布" icon={<AuditOutlined />} span={8}>
                {stats.leaveTypeDistribution.length > 0
                  ? <ReactECharts option={makePieOption('', stats.leaveTypeDistribution)} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无请假数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Card size="small" title={<span><LineChartOutlined /> 入职趋势（近12月）</span>}>
                  {stats.hireTrendData.length > 0
                    ? <ReactECharts option={makeLineOption('', stats.hireTrendData.map(d => d.month), [{ name: '入职人数', data: stats.hireTrendData.map(d => d.value) }])} style={{ height: 220 }} notMerge={true} />
                    : <Empty description="暂无入职数据" style={{ paddingTop: 40 }} />}
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* ========== 员工分析 ========== */}
        {activeTab === 'employee' && !loading && stats && (
          <div className="space-y-4">
            <Alert message="员工结构分析 — 展示企业人员构成、学历、年龄、司龄等多维度分布" type="info" showIcon />
            <Row gutter={12}>
              <ChartCard title="部门人员分布" icon={<TeamOutlined />} span={8}>
                {stats.deptDistribution.length > 0
                  ? <ReactECharts option={makePieOption('', stats.deptDistribution)} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
              <ChartCard title="学历结构" icon={<BookOutlined />} span={8}>
                {stats.eduDistribution.length > 0
                  ? <ReactECharts option={makePieOption('', stats.eduDistribution)} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
              <ChartCard title="性别分布" icon={<TeamOutlined />} span={8}>
                {stats.genderDistribution.length > 0
                  ? <ReactECharts option={makePieOption('', stats.genderDistribution)} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
            </Row>
            <Row gutter={12}>
              <ChartCard title="司龄结构" icon={<ProfileOutlined />} span={12}>
                {stats.tenureDistribution.length > 0
                  ? <ReactECharts option={makeBarOption('', stats.tenureDistribution.map(d => d.name), stats.tenureDistribution.map(d => d.value))} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
              <ChartCard title="月度入职趋势" icon={<LineChartOutlined />} span={12}>
                {stats.hireTrendData.length > 0
                  ? <ReactECharts option={makeLineOption('', stats.hireTrendData.map(d => d.month), [{ name: '入职人数', data: stats.hireTrendData.map(d => d.value) }])} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
            </Row>
          </div>
        )}

        {/* ========== 考勤分析 ========== */}
        {activeTab === 'attendance' && !loading && stats && (
          <div className="space-y-4">
            <Alert message="考勤分析 — 展示考勤状态分布、月度趋势、迟到统计等" type="info" showIcon />
            <Row gutter={12}>
              <ChartCard title="考勤状态分布（本月）" icon={<CalendarOutlined />} span={8}>
                {stats.monthAttendance.length > 0
                  ? <ReactECharts option={makePieOption('', stats.monthAttendance)} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无考勤数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
              <Col span={16}>
                <Card size="small" title={<span><LineChartOutlined /> 考勤月度趋势（近6月）</span>} style={{ height: 340 }}>
                  {stats.attendanceTrendData.length > 0
                    ? <ReactECharts option={{
                      tooltip: { trigger: 'axis' },
                      legend: { bottom: 0, data: ['正常', '迟到', '缺勤'] },
                      grid: { left: '3%', right: '4%', bottom: '40px', top: '40px', containLabel: true },
                      xAxis: { type: 'category', data: stats.attendanceTrendData.map(d => d.month) },
                      yAxis: { type: 'value', name: '人次' },
                      series: [
                        { name: '正常', data: stats.attendanceTrendData.map(d => d.normal), type: 'line', smooth: true, itemStyle: { color: '#52c41a' } },
                        { name: '迟到', data: stats.attendanceTrendData.map(d => d.late), type: 'line', smooth: true, itemStyle: { color: '#faad14' } },
                        { name: '缺勤', data: stats.attendanceTrendData.map(d => d.absent), type: 'line', smooth: true, itemStyle: { color: '#ff4d4f' } },
                      ]
                    }} style={{ height: 260 }} notMerge={true} />
                    : <Empty description="暂无数据" style={{ paddingTop: 60 }} />}
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* ========== 薪资分析 ========== */}
        {activeTab === 'salary' && !loading && stats && (
          <div className="space-y-4">
            <Alert message="薪资分析 — 展示薪资档位分布、月度趋势、社保缴纳等" type="info" showIcon />
            {stats.overview?.salaryStats && (
              <Row gutter={12}>
                <Col span={6}><Card size="small"><Statistic title="本月应发总额" value={stats.overview.salaryStats.totalGross || 0} prefix="¥" precision={0} valueStyle={{ fontSize: 18 }} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="本月实发总额" value={stats.overview.salaryStats.totalNet || 0} prefix="¥" precision={0} valueStyle={{ fontSize: 18 }} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="平均应发" value={stats.overview.salaryStats.avgGross || 0} prefix="¥" precision={0} valueStyle={{ fontSize: 18 }} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="平均实发" value={stats.overview.salaryStats.avgNet || 0} prefix="¥" precision={0} valueStyle={{ fontSize: 18 }} /></Card></Col>
              </Row>
            )}
            <Row gutter={12}>
              <ChartCard title="薪资档位分布" icon={<MoneyCollectOutlined />} span={12}>
                {stats.salaryDistribution.length > 0
                  ? <ReactECharts option={makeBarOption('', stats.salaryDistribution.map(d => d.name), stats.salaryDistribution.map(d => d.value), '人数')} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
              <ChartCard title="薪资月度趋势" icon={<LineChartOutlined />} span={12}>
                {stats.salaryTrendData.length > 0
                  ? <ReactECharts option={makeLineOption('', stats.salaryTrendData.map(d => d.name), [{ name: '实发总额', data: stats.salaryTrendData.map(d => d.value / 10000) }])} style={{ height: 260 }} notMerge={true} />
                  : <Empty description="暂无数据" style={{ paddingTop: 60 }} />}
              </ChartCard>
            </Row>
          </div>
        )}

        {/* ========== 报表管理 ========== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <Alert message="报表管理 — 可视化配置内部数据库统计报表，支持柱状图、折线图、饼图等多种图表类型" type="info" showIcon />
            <Table columns={reportColumns} dataSource={reports} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small" />
          </div>
        )}

        {/* ========== 数据源配置 ========== */}
        {activeTab === 'datasource' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Alert message="数据源配置 — 支持连接内部数据库、Excel文件、CSV文件、API接口等外部数据源" type="info" showIcon className="flex-1" />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingDs(null); dsForm.resetFields(); setDsModal(true); }} className="ml-4">新增数据源</Button>
            </div>
            <Table columns={dsColumns} dataSource={dataSources} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small" />
          </div>
        )}

        {/* ========== 常用配置 ========== */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Alert message="常用配置 — 管理报表全局配置，包括导出格式、缓存策略、图表主题等" type="info" showIcon className="flex-1" />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingConfig(null); configForm.resetFields(); setConfigModal(true); }} className="ml-4">新增配置</Button>
            </div>
            <Table columns={configColumns} dataSource={configs} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small" />
          </div>
        )}
      </Card>

      {/* ========== 报表编辑弹窗 ========== */}
      <Modal
        title={editingReport ? '编辑报表' : '新建报表'}
        open={reportModal}
        onOk={handleSaveReport}
        onCancel={() => setReportModal(false)}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={reportForm} layout="vertical">
          <Form.Item name="name" label="报表名称" rules={[{ required: true, message: '请输入报表名称' }]}>
            <Input placeholder="如：部门人员分布报表" />
          </Form.Item>
          <Form.Item name="description" label="报表描述">
            <Input.TextArea placeholder="简要描述此报表的用途" rows={2} />
          </Form.Item>
          <Form.Item name="category" label="分类" initialValue="custom">
            <Select placeholder="请选择分类">
              <Option value="employee">员工分析</Option>
              <Option value="attendance">考勤分析</Option>
              <Option value="salary">薪资分析</Option>
              <Option value="performance">绩效分析</Option>
              <Option value="custom">自定义报表</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tableName" label="数据表" rules={[{ required: true, message: '请选择数据表' }]}>
            <Select placeholder="选择统计数据的来源表">
              {internalTables.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="chartType" label="图表类型" initialValue="pie">
            <Select placeholder="选择图表类型">
              <Option value="pie">饼图</Option>
              <Option value="bar">柱状图</Option>
              <Option value="line">折线图</Option>
              <Option value="table">数据表格</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* ========== 数据源编辑弹窗 ========== */}
      <Modal
        title={editingDs ? '编辑数据源' : '新增数据源'}
        open={dsModal}
        onOk={handleSaveDs}
        onCancel={() => setDsModal(false)}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={dsForm} layout="vertical">
          <Form.Item name="name" label="数据源名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：内部HR数据库" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="简要描述此数据源" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]} initialValue="internal">
            <Select>
              <Option value="internal">内部数据库（SQLite）</Option>
              <Option value="excel">Excel文件</Option>
              <Option value="csv">CSV文件</Option>
              <Option value="api">API接口</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tableName" label="数据表名">
            <Select allowClear placeholder="选择内部数据库表（可选）">
              {internalTables.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="filePath" label="文件路径">
            <Input placeholder="Excel或CSV文件的完整路径" />
          </Form.Item>
          <Form.Item name="apiUrl" label="API地址">
            <Input placeholder="外部API接口URL" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ========== 配置编辑弹窗 ========== */}
      <Modal
        title={editingConfig ? '编辑配置' : '新增配置'}
        open={configModal}
        onOk={handleSaveConfig}
        onCancel={() => setConfigModal(false)}
        width={500}
        okText="保存"
        cancelText="取消"
      >
        <Form form={configForm} layout="vertical">
          <Form.Item name="name" label="配置名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：默认导出格式" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select>
              <Option value="export">导出设置</Option>
              <Option value="performance">性能设置</Option>
              <Option value="display">显示设置</Option>
            </Select>
          </Form.Item>
          <Form.Item name="configKey" label="配置键" rules={[{ required: true, message: '请输入配置键' }]}>
            <Input placeholder="如：default_export_format" />
          </Form.Item>
          <Form.Item name="configValue" label="配置值" rules={[{ required: true, message: '请输入配置值' }]}>
            <Input placeholder="如：xlsx" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="配置说明" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ========== 报表预览弹窗 ========== */}
      <Modal
        title={previewData?.report?.name || '报表预览'}
        open={previewModal}
        onCancel={() => setPreviewModal(false)}
        footer={null}
        width={900}
      >
        {previewData && (
          <div className="space-y-4">
            <Descriptions column={3} size="small" bordered>
              <Descriptions.Item label="报表名称">{previewData.report.name}</Descriptions.Item>
              <Descriptions.Item label="分类">{previewData.report.category || '自定义'}</Descriptions.Item>
              <Descriptions.Item label="图表类型">{previewData.report.chartType === 'pie' ? '饼图' : previewData.report.chartType === 'bar' ? '柱状图' : previewData.report.chartType === 'line' ? '折线图' : '表格'}</Descriptions.Item>
              <Descriptions.Item label="数据源">{previewData.report.tableName}</Descriptions.Item>
              <Descriptions.Item label="内置报表">{previewData.report.isBuiltIn ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{previewData.report.updatedAt}</Descriptions.Item>
            </Descriptions>
            <Divider />
            {Array.isArray(previewData.chartData) && previewData.chartData.length > 0 ? (
              previewData.report.chartType === 'bar' ? (
                <ReactECharts option={makeBarOption('', previewData.chartData.map((d: any) => d.name), previewData.chartData.map((d: any) => d.value))} style={{ height: 300 }} />
              ) : previewData.report.chartType === 'line' ? (
                <ReactECharts option={makeLineOption('', previewData.chartData.map((d: any) => d.name || d.month), [{ name: previewData.report.name, data: previewData.chartData.map((d: any) => d.value || 0) }])} style={{ height: 300 }} />
              ) : (
                <ReactECharts option={makePieOption('', previewData.chartData)} style={{ height: 300 }} />
              )
            ) : (
              <Alert message="该报表暂无数据" type="warning" showIcon />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
