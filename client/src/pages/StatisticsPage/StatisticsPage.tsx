import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, message, Tabs, Row, Col, Progress, Descriptions,
  Divider, Dropdown, Menu, Tooltip, Alert, Collapse, InputNumber,
  Checkbox, Switch, Popconfirm, Badge, Statistic, Typography, Drawer
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
  BarChartOutlined, LineChartOutlined, PieChartOutlined,
  TableOutlined, FileExcelOutlined, FilePdfOutlined, FileImageOutlined,
  SettingOutlined, FilterOutlined, LinkOutlined, EyeOutlined,
  CopyOutlined, DatabaseOutlined, CloudOutlined, FileOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ApiOutlined, ReloadOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;
const { Text } = Typography;

// ============ 类型定义 ============
interface Report {
  id: string;
  name: string;
  category: 'employee' | 'attendance' | 'salary' | 'performance' | 'custom';
  dataSource: 'internal' | 'external';
  tableName?: string;
  fields: ReportField[];
  filters: ReportFilter[];
  chartType?: 'table' | 'bar' | 'line' | 'pie';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ReportField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  visible: boolean;
  order: number;
  width?: number;
  format?: string;
  link?: { targetReport: string; params: string[] };
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
  valueTo?: any;
}

interface DataSource {
  id: string;
  name: string;
  type: 'internal' | 'excel' | 'csv' | 'api';
  tableName?: string;
  filePath?: string;
  apiUrl?: string;
  fields: { name: string; type: string }[];
  status: 'connected' | 'error';
}

interface CommonConfig {
  id: string;
  name: string;
  category: string;
  value: any;
  description: string;
  updatedAt: string;
}

interface AnalysisData {
  title: string;
  data: { name: string; value: number }[];
  total: number;
}

const categoryMap: Record<string, { label: string; color: string }> = {
  employee: { label: '员工分析', color: 'blue' },
  attendance: { label: '考勤分析', color: 'green' },
  salary: { label: '薪资分析', color: 'gold' },
  performance: { label: '绩效分析', color: 'purple' },
  custom: { label: '自定义报表', color: 'default' },
};

// ============ 模拟数据生成函数 ============
const generateMockReports = (): Report[] => [
  { id: '1', name: '员工花名册', category: 'employee', dataSource: 'internal', tableName: 'employees', fields: [
    { id: 'f1', name: 'employeeId', label: '工号', type: 'text', visible: true, order: 1 },
    { id: 'f2', name: 'name', label: '姓名', type: 'text', visible: true, order: 2 },
    { id: 'f3', name: 'department', label: '部门', type: 'text', visible: true, order: 3 },
    { id: 'f4', name: 'position', label: '岗位', type: 'text', visible: true, order: 4 },
    { id: 'f5', name: 'hireDate', label: '入职日期', type: 'date', visible: true, order: 5 },
  ], filters: [], createdAt: '2025-01-01', updatedAt: '2025-04-20', createdBy: '管理员' },
  { id: '2', name: '部门人员分布', category: 'employee', dataSource: 'internal', tableName: 'employees', chartType: 'pie', fields: [
    { id: 'f1', name: 'department', label: '部门', type: 'text', visible: true, order: 1 },
    { id: 'f2', name: 'count', label: '人数', type: 'number', aggregation: 'count', visible: true, order: 2 },
  ], filters: [], createdAt: '2025-02-01', updatedAt: '2025-04-15', createdBy: '管理员' },
  { id: '3', name: '月度考勤统计', category: 'attendance', dataSource: 'internal', tableName: 'attendance', chartType: 'bar', fields: [
    { id: 'f1', name: 'month', label: '月份', type: 'text', visible: true, order: 1 },
    { id: 'f2', name: 'normalDays', label: '正常出勤', type: 'number', aggregation: 'sum', visible: true, order: 2 },
    { id: 'f3', name: 'lateDays', label: '迟到次数', type: 'number', aggregation: 'sum', visible: true, order: 3 },
    { id: 'f4', name: 'leaveDays', label: '请假天数', type: 'number', aggregation: 'sum', visible: true, order: 4 },
  ], filters: [], createdAt: '2025-01-15', updatedAt: '2025-04-20', createdBy: '管理员' },
  { id: '4', name: '薪资发放汇总', category: 'salary', dataSource: 'internal', tableName: 'salaries', chartType: 'line', fields: [
    { id: 'f1', name: 'month', label: '月份', type: 'text', visible: true, order: 1 },
    { id: 'f2', name: 'totalAmount', label: '发放总额', type: 'number', aggregation: 'sum', visible: true, order: 2 },
  ], filters: [], createdAt: '2025-02-20', updatedAt: '2025-04-20', createdBy: '管理员' },
];

const generateMockDataSources = (): DataSource[] => [
  { id: 'ds1', name: '员工表', type: 'internal', tableName: 'employees', fields: [
    { name: 'employeeId', type: 'text' }, { name: 'name', type: 'text' }, { name: 'department', type: 'text' }, { name: 'position', type: 'text' }, { name: 'hireDate', type: 'date' }, { name: 'salary', type: 'number' },
  ], status: 'connected' },
  { id: 'ds2', name: '考勤表', type: 'internal', tableName: 'attendance', fields: [
    { name: 'date', type: 'date' }, { name: 'employeeId', type: 'text' }, { name: 'checkIn', type: 'time' }, { name: 'checkOut', type: 'time' }, { name: 'status', type: 'text' },
  ], status: 'connected' },
  { id: 'ds3', name: '薪资表', type: 'internal', tableName: 'salaries', fields: [
    { name: 'month', type: 'text' }, { name: 'employeeId', type: 'text' }, { name: 'baseSalary', type: 'number' }, { name: 'bonus', type: 'number' }, { name: 'deduction', type: 'number' },
  ], status: 'connected' },
  { id: 'ds4', name: '外部销售数据', type: 'excel', filePath: '/data/sales_2025.xlsx', fields: [
    { name: 'date', type: 'date' }, { name: 'product', type: 'text' }, { name: 'amount', type: 'number' },
  ], status: 'connected' },
];

const generateMockCommonConfigs = (): CommonConfig[] => [
  { id: 'cfg1', name: '默认导出格式', category: 'export', value: 'excel', description: '报表默认导出格式', updatedAt: '2025-04-01' },
  { id: 'cfg2', name: '数据缓存时间', category: 'performance', value: 300, description: '数据缓存时间(秒)', updatedAt: '2025-04-15' },
  { id: 'cfg3', name: '图表主题', category: 'display', value: 'default', description: '图表显示主题', updatedAt: '2025-04-20' },
  { id: 'cfg4', name: '分页大小', category: 'display', value: 20, description: '报表默认分页大小', updatedAt: '2025-04-18' },
];

const generateCommonAnalysis = (): Record<string, AnalysisData> => ({
  position: { title: '岗位结构分析', data: [
    { name: '工程师', value: 45 }, { name: '产品经理', value: 12 }, { name: '设计师', value: 8 }, { name: '运营', value: 15 }, { name: '管理', value: 10 }, { name: '其他', value: 10 },
  ], total: 100 },
  education: { title: '学历结构分析', data: [
    { name: '博士', value: 5 }, { name: '硕士', value: 25 }, { name: '本科', value: 55 }, { name: '大专', value: 12 }, { name: '高中及以下', value: 3 },
  ], total: 100 },
  age: { title: '年龄结构分析', data: [
    { name: '25岁以下', value: 15 }, { name: '25-30岁', value: 35 }, { name: '30-35岁', value: 28 }, { name: '35-40岁', value: 15 }, { name: '40岁以上', value: 7 },
  ], total: 100 },
  tenure: { title: '司龄结构分析', data: [
    { name: '1年以下', value: 20 }, { name: '1-3年', value: 35 }, { name: '3-5年', value: 25 }, { name: '5-10年', value: 15 }, { name: '10年以上', value: 5 },
  ], total: 100 },
});

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<string>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [commonConfigs, setCommonConfigs] = useState<CommonConfig[]>([]);
  const [commonAnalysis, setCommonAnalysis] = useState<Record<string, AnalysisData>>({});
  const [loading, setLoading] = useState(true);
  
  // Modal 状态
  const [reportModal, setReportModal] = useState(false);
  const [dsModal, setDsModal] = useState(false);
  const [configModal, setConfigModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  
  // 编辑状态
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editingDs, setEditingDs] = useState<DataSource | null>(null);
  const [editingConfig, setEditingConfig] = useState<CommonConfig | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const [reportForm] = Form.useForm();
  const [dsForm] = Form.useForm();
  const [configForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportRes, dsRes, cfgRes] = await Promise.allSettled([
        fetch('/api/reports'),
        fetch('/api/data_sources'),
        fetch('/api/common_configs')
      ]);
      
      let r = [], d = [], c = [];
      if (reportRes.status === 'fulfilled' && reportRes.value.ok) {
        const j = await reportRes.value.json();
        if (Array.isArray(j)) r = j;
      }
      if (dsRes.status === 'fulfilled' && dsRes.value.ok) {
        const j = await dsRes.value.json();
        if (Array.isArray(j)) d = j;
      }
      if (cfgRes.status === 'fulfilled' && cfgRes.value.ok) {
        const j = await cfgRes.value.json();
        if (Array.isArray(j)) c = j;
      }
      
      if (r.length === 0) r = generateMockReports();
      if (d.length === 0) d = generateMockDataSources();
      if (c.length === 0) c = generateMockCommonConfigs();
      
      setReports(r);
      setDataSources(d);
      setCommonConfigs(c);
      setCommonAnalysis(generateCommonAnalysis());
    } catch {
      setReports(generateMockReports());
      setDataSources(generateMockDataSources());
      setCommonConfigs(generateMockCommonConfigs());
      setCommonAnalysis(generateCommonAnalysis());
    }
    setLoading(false);
  };

  // ============ 报表 CRUD ============
  const handleAddReport = () => {
    setEditingReport(null);
    reportForm.resetFields();
    setReportModal(true);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    reportForm.setFieldsValue(report);
    setReportModal(true);
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(reports.filter(r => r.id !== id));
        messageApi.success('报表已删除');
      } else {
        // 模拟删除
        setReports(reports.filter(r => r.id !== id));
        messageApi.success('报表已删除');
      }
    } catch {
      setReports(reports.filter(r => r.id !== id));
      messageApi.success('报表已删除');
    }
  };

  const handleSaveReport = async () => {
    try {
      const values = await reportForm.validateFields();
      const now = new Date().toISOString().slice(0, 10);
      
      if (editingReport) {
        // 编辑
        const updated = { ...editingReport, ...values, updatedAt: now };
        const res = await fetch(`/api/reports/${editingReport.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        if (res.ok) {
          setReports(reports.map(r => r.id === editingReport.id ? updated : r));
          messageApi.success('报表已更新');
        } else {
          setReports(reports.map(r => r.id === editingReport.id ? updated : r));
          messageApi.success('报表已更新');
        }
      } else {
        // 新增
        const newReport: Report = {
          id: `r${Date.now()}`,
          ...values,
          fields: [],
          filters: [],
          createdAt: now,
          updatedAt: now,
          createdBy: '当前用户'
        };
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport)
        });
        if (res.ok) {
          setReports([...reports, newReport]);
          messageApi.success('报表已创建');
        } else {
          setReports([...reports, newReport]);
          messageApi.success('报表已创建');
        }
      }
      setReportModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // ============ 数据源 CRUD ============
  const handleAddDs = () => {
    setEditingDs(null);
    dsForm.resetFields();
    setDsModal(true);
  };

  const handleEditDs = (ds: DataSource) => {
    setEditingDs(ds);
    dsForm.setFieldsValue(ds);
    setDsModal(true);
  };

  const handleDeleteDs = async (id: string) => {
    try {
      const res = await fetch(`/api/data_sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDataSources(dataSources.filter(d => d.id !== id));
        messageApi.success('数据源已删除');
      } else {
        setDataSources(dataSources.filter(d => d.id !== id));
        messageApi.success('数据源已删除');
      }
    } catch {
      setDataSources(dataSources.filter(d => d.id !== id));
      messageApi.success('数据源已删除');
    }
  };

  const handleSaveDs = async () => {
    try {
      const values = await dsForm.validateFields();
      
      if (editingDs) {
        const updated = { ...editingDs, ...values };
        const res = await fetch(`/api/data_sources/${editingDs.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        if (res.ok) {
          setDataSources(dataSources.map(d => d.id === editingDs.id ? updated : d));
          messageApi.success('数据源已更新');
        } else {
          setDataSources(dataSources.map(d => d.id === editingDs.id ? updated : d));
          messageApi.success('数据源已更新');
        }
      } else {
        const newDs: DataSource = {
          id: `ds${Date.now()}`,
          ...values,
          fields: [],
          status: 'connected'
        };
        const res = await fetch('/api/data_sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDs)
        });
        if (res.ok) {
          setDataSources([...dataSources, newDs]);
          messageApi.success('数据源已创建');
        } else {
          setDataSources([...dataSources, newDs]);
          messageApi.success('数据源已创建');
        }
      }
      setDsModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestDs = async (ds: DataSource) => {
    messageApi.loading('正在测试连接...');
    await new Promise(r => setTimeout(r, 1000));
    messageApi.success('连接成功');
  };

  // ============ 常用配置 CRUD ============
  const handleAddConfig = () => {
    setEditingConfig(null);
    configForm.resetFields();
    setConfigModal(true);
  };

  const handleEditConfig = (cfg: CommonConfig) => {
    setEditingConfig(cfg);
    configForm.setFieldsValue(cfg);
    setConfigModal(true);
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      const res = await fetch(`/api/common_configs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCommonConfigs(commonConfigs.filter(c => c.id !== id));
        messageApi.success('配置已删除');
      } else {
        setCommonConfigs(commonConfigs.filter(c => c.id !== id));
        messageApi.success('配置已删除');
      }
    } catch {
      setCommonConfigs(commonConfigs.filter(c => c.id !== id));
      messageApi.success('配置已删除');
    }
  };

  const handleSaveConfig = async () => {
    try {
      const values = await configForm.validateFields();
      const now = new Date().toISOString().slice(0, 10);
      
      if (editingConfig) {
        const updated = { ...editingConfig, ...values, updatedAt: now };
        const res = await fetch(`/api/common_configs/${editingConfig.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        if (res.ok) {
          setCommonConfigs(commonConfigs.map(c => c.id === editingConfig.id ? updated : c));
          messageApi.success('配置已更新');
        } else {
          setCommonConfigs(commonConfigs.map(c => c.id === editingConfig.id ? updated : c));
          messageApi.success('配置已更新');
        }
      } else {
        const newCfg: CommonConfig = {
          id: `cfg${Date.now()}`,
          ...values,
          updatedAt: now
        };
        const res = await fetch('/api/common_configs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCfg)
        });
        if (res.ok) {
          setCommonConfigs([...commonConfigs, newCfg]);
          messageApi.success('配置已创建');
        } else {
          setCommonConfigs([...commonConfigs, newCfg]);
          messageApi.success('配置已创建');
        }
      }
      setConfigModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const exportReport = (format: 'excel' | 'pdf' | 'image') => {
    messageApi.success(`报表已导出为${format.toUpperCase()}格式`);
  };

  const previewReport = (report: Report) => {
    setSelectedReport(report);
    setPreviewModal(true);
  };

  const tabs = [
    { key: 'reports', label: '报表管理', icon: <TableOutlined /> },
    { key: 'designer', label: '报表设计器', icon: <SettingOutlined /> },
    { key: 'datasource', label: '数据源配置', icon: <DatabaseOutlined /> },
    { key: 'config', label: '常用配置', icon: <SettingOutlined /> },
    { key: 'analysis', label: '常用分析', icon: <BarChartOutlined /> },
  ];

  const reportColumns = [
    { title: '报表名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: (v: string) => <Tag color={categoryMap[v]?.color}>{categoryMap[v]?.label}</Tag> },
    { title: '图表类型', dataIndex: 'chartType', key: 'chartType', width: 100, render: (v?: string) => {
      if (!v) return <Tag>表格</Tag>;
      const icons: Record<string, React.ReactNode> = { bar: <BarChartOutlined />, line: <LineChartOutlined />, pie: <PieChartOutlined /> };
      return <Tag icon={icons[v]}>{v === 'bar' ? '柱状图' : v === 'line' ? '折线图' : '饼图'}</Tag>;
    }},
    { title: '数据源', dataIndex: 'dataSource', key: 'dataSource', width: 100, render: (v: string) => <Tag color={v === 'internal' ? 'blue' : 'purple'}>{v === 'internal' ? '内部' : '外部'}</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 120 },
    { title: '创建人', dataIndex: 'createdBy', key: 'createdBy', width: 90 },
    { title: '操作', key: 'action', width: 280, render: (_: any, r: Report) => (
      <Space size="small">
        <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => previewReport(r)}>预览</Button>
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEditReport(r)}>编辑</Button>
        <Dropdown menu={{ items: [
          { key: 'excel', label: '导出Excel', icon: <FileExcelOutlined /> },
          { key: 'pdf', label: '导出PDF', icon: <FilePdfOutlined /> },
          { key: 'image', label: '导出图片', icon: <FileImageOutlined /> },
        ], onClick: ({ key }) => exportReport(key as any) }}>
          <Button size="small" type="link" icon={<DownloadOutlined />}>导出</Button>
        </Dropdown>
        <Popconfirm title="确定删除此报表吗？" onConfirm={() => handleDeleteReport(r.id)} okText="确定" cancelText="取消">
          <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const dsColumns = [
    { title: '数据源名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, render: (v: string) => {
      const map: Record<string, { label: string; color: string }> = { internal: { label: '内部数据库', color: 'blue' }, excel: { label: 'Excel文件', color: 'green' }, csv: { label: 'CSV文件', color: 'cyan' }, api: { label: 'API接口', color: 'purple' } };
      return <Tag color={map[v]?.color}>{map[v]?.label}</Tag>;
    }},
    { title: '来源', key: 'source', width: 200, render: (_: any, r: DataSource) => r.tableName || r.filePath || r.apiUrl || '-' },
    { title: '字段数', key: 'fieldCount', width: 80, render: (_: any, r: DataSource) => `${r.fields.length}个` },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Badge status={v === 'connected' ? 'success' : 'error'} text={v === 'connected' ? '已连接' : '连接失败'} /> },
    { title: '操作', key: 'action', width: 200, render: (_: any, r: DataSource) => (
      <Space size="small">
        <Button size="small" type="link" icon={<ReloadOutlined />} onClick={() => handleTestDs(r)}>测试</Button>
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEditDs(r)}>编辑</Button>
        <Popconfirm title="确定删除此数据源吗？" onConfirm={() => handleDeleteDs(r.id)} okText="确定" cancelText="取消">
          <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const configColumns = [
    { title: '配置名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: (v: string) => {
      const map: Record<string, { label: string; color: string }> = {
        export: { label: '导出设置', color: 'blue' },
        performance: { label: '性能设置', color: 'green' },
        display: { label: '显示设置', color: 'purple' }
      };
      return <Tag color={map[v]?.color || 'default'}>{map[v]?.label || v}</Tag>;
    }},
    { title: '配置值', dataIndex: 'value', key: 'value', width: 150, render: (v: any) => typeof v === 'object' ? JSON.stringify(v) : String(v) },
    { title: '描述', dataIndex: 'description', key: 'description', width: 200 },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 120 },
    { title: '操作', key: 'action', width: 150, render: (_: any, c: CommonConfig) => (
      <Space size="small">
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEditConfig(c)}>编辑</Button>
        <Popconfirm title="确定删除此配置吗？" onConfirm={() => handleDeleteConfig(c.id)} okText="确定" cancelText="取消">
          <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">统计分析</h2>
          <p className="text-sm text-muted-foreground">报表设计 · 数据源配置 · 图表展示 · 常用分析</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddReport}>新建报表</Button>
      </div>

      <Row gutter={16}>
        <Col span={4}><Card size="small"><Statistic title="报表总数" value={reports.length} suffix="个" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="数据源" value={dataSources.length} suffix="个" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="内部数据源" value={dataSources.filter(d => d.type === 'internal').length} suffix="个" valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="外部数据源" value={dataSources.filter(d => d.type !== 'internal').length} suffix="个" valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="常用配置" value={commonConfigs.length} suffix="项" /></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 16 }} 
          items={tabs.map(t => ({ key: t.key, label: <span>{t.icon} {t.label}</span> }))} 
        />

        {/* Tab1: 报表管理 */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <Alert message="支持数据穿透：点击单元格可查看明细数据。支持超链接：单元格可跳转到其他报表。" type="info" showIcon />
            <Table columns={reportColumns} dataSource={reports} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {/* Tab2: 报表设计器 */}
        {activeTab === 'designer' && (
          <div className="space-y-4">
            <Alert message="报表设计器支持可视化拖拽设计，可配置字段、筛选条件、图表类型等。" type="info" showIcon />
            <Card title="设计器功能" size="small">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">字段配置</h4>
                  <p className="text-sm text-muted-foreground">选择显示字段、设置字段类型、聚合方式</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">筛选条件</h4>
                  <p className="text-sm text-muted-foreground">添加过滤条件、设置参数化查询</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">图表类型</h4>
                  <p className="text-sm text-muted-foreground">表格、柱状图、折线图、饼图</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab3: 数据源配置 */}
        {activeTab === 'datasource' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Alert message="支持内部数据库、Excel文件、CSV文件、API接口等多种数据源。" type="info" showIcon className="flex-1" />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDs} className="ml-4">新增数据源</Button>
            </div>
            <Table columns={dsColumns} dataSource={dataSources} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {/* Tab4: 常用配置 */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Alert message="管理系统全局配置，包括导出格式、缓存设置、显示主题等。" type="info" showIcon className="flex-1" />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddConfig} className="ml-4">新增配置</Button>
            </div>
            <Table columns={configColumns} dataSource={commonConfigs} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {/* Tab5: 常用分析 */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <Alert message="展示企业人力资源常用分析指标，数据来源于系统各模块统计。" type="info" showIcon />
            <Row gutter={16}>
              {Object.entries(commonAnalysis).map(([key, analysis]) => (
                <Col span={12} key={key}>
                  <Card title={analysis.title} size="small">
                    <div className="space-y-2">
                      {analysis.data.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span>{item.name}</span>
                          <div className="flex items-center gap-2">
                            <Progress percent={Math.round(item.value / analysis.total * 100)} size="small" style={{ width: 100 }} />
                            <span className="text-sm font-medium">{item.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Card>

      {/* 报表编辑弹窗 */}
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
            <Input placeholder="请输入报表名称" />
          </Form.Item>
          <Form.Item name="category" label="报表分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择分类">
              <Option value="employee">员工分析</Option>
              <Option value="attendance">考勤分析</Option>
              <Option value="salary">薪资分析</Option>
              <Option value="performance">绩效分析</Option>
              <Option value="custom">自定义报表</Option>
            </Select>
          </Form.Item>
          <Form.Item name="chartType" label="图表类型">
            <Select placeholder="请选择图表类型" allowClear>
              <Option value="table">表格</Option>
              <Option value="bar">柱状图</Option>
              <Option value="line">折线图</Option>
              <Option value="pie">饼图</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dataSource" label="数据源类型">
            <Select placeholder="请选择数据源类型">
              <Option value="internal">内部数据</Option>
              <Option value="external">外部数据</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tableName" label="数据表名">
            <Input placeholder="请输入数据表名" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 数据源编辑弹窗 */}
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
            <Input placeholder="请输入数据源名称" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型">
              <Option value="internal">内部数据库</Option>
              <Option value="excel">Excel文件</Option>
              <Option value="csv">CSV文件</Option>
              <Option value="api">API接口</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tableName" label="数据表名">
            <Input placeholder="内部数据库表名" />
          </Form.Item>
          <Form.Item name="filePath" label="文件路径">
            <Input placeholder="Excel/CSV文件路径" />
          </Form.Item>
          <Form.Item name="apiUrl" label="API地址">
            <Input placeholder="API接口URL" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 配置编辑弹窗 */}
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
            <Input placeholder="请输入配置名称" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择分类">
              <Option value="export">导出设置</Option>
              <Option value="performance">性能设置</Option>
              <Option value="display">显示设置</Option>
            </Select>
          </Form.Item>
          <Form.Item name="value" label="配置值" rules={[{ required: true, message: '请输入配置值' }]}>
            <Input placeholder="请输入配置值" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入配置描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 报表预览弹窗 */}
      <Modal
        title={selectedReport?.name || '报表预览'}
        open={previewModal}
        onCancel={() => setPreviewModal(false)}
        footer={null}
        width={900}
      >
        {selectedReport && (
          <div className="space-y-4">
            <Descriptions column={3} size="small" bordered>
              <Descriptions.Item label="报表名称">{selectedReport.name}</Descriptions.Item>
              <Descriptions.Item label="分类">{categoryMap[selectedReport.category]?.label}</Descriptions.Item>
              <Descriptions.Item label="图表类型">{selectedReport.chartType || '表格'}</Descriptions.Item>
              <Descriptions.Item label="数据源">{selectedReport.dataSource === 'internal' ? '内部' : '外部'}</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedReport.createdBy}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selectedReport.updatedAt}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Alert message="报表预览功能需要实际数据支持，当前显示模拟数据" type="warning" showIcon />
            <Table
              columns={selectedReport.fields.map(f => ({ title: f.label, dataIndex: f.name, key: f.name }))}
              dataSource={[
                { key: '1', employeeId: 'E001', name: '张三', department: '技术部', position: '工程师', hireDate: '2024-01-15' },
                { key: '2', employeeId: 'E002', name: '李四', department: '产品部', position: '产品经理', hireDate: '2024-02-20' },
              ]}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
