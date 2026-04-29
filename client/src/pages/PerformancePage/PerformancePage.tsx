import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, Tabs, Row, Col, Steps,
  Divider, Descriptions, InputNumber, Radio, Switch, Progress, Alert
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined,
  DashboardOutlined, CalendarOutlined, BarChartOutlined,
  CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// ============ 类型定义 ============
interface IKPI {
  id: string;
  name: string;
  category: string;
  weight: number;
  target: string;
  unit: string;
  description: string;
}

interface IPerformance {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  cycleId: string;
  cycleName: string;
  totalScore: number;
  level: 'S' | 'A' | 'B' | 'C' | 'D';
  status: 'draft' | 'submitted' | 'reviewed' | 'confirmed';
  kpiScores: { kpiId: string; kpiName: string; score: number; weight: number }[];
}

interface ICycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed';
}

const levelMap: Record<string, { label: string; className: string; color: string; min: number }> = {
  S: { label: '卓越', className: 'bg-purple-500/10 text-purple-600', color: 'purple', min: 95 },
  A: { label: '优秀', className: 'bg-success/10 text-success', color: 'green', min: 85 },
  B: { label: '良好', className: 'bg-blue-500/10 text-blue-600', color: 'blue', min: 75 },
  C: { label: '合格', className: 'bg-yellow-500/10 text-yellow-600', color: 'orange', min: 60 },
  D: { label: '待改进', className: 'bg-destructive/10 text-destructive', color: 'red', min: 0 },
};

const statusMap: Record<string, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-muted text-muted-foreground' },
  submitted: { label: '已提交', className: 'bg-blue-100 text-blue-700' },
  reviewed: { label: '已评审', className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '已确认', className: 'bg-success/10 text-success' },
};

const categoryMap: Record<string, string> = {
  work: '工作业绩',
  ability: '能力素质',
  attitude: '工作态度',
  team: '团队协作',
};

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [kpis, setKpis] = useState<IKPI[]>([]);
  const [performances, setPerformances] = useState<IPerformance[]>([]);
  const [cycles, setCycles] = useState<ICycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  // KPI表单
  const [kpiModal, setKpiModal] = useState(false);
  const [editingKpi, setEditingKpi] = useState<IKPI | null>(null);
  const [kpiForm] = Form.useForm();

  // 考核周期表单
  const [cycleModal, setCycleModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<ICycle | null>(null);
  const [cycleForm] = Form.useForm();

  // 考核记录表单
  const [perfModal, setPerfModal] = useState(false);
  const [perfForm] = Form.useForm();
  const [selectedPerformance, setSelectedPerformance] = useState<IPerformance | null>(null);
  const [perfDetailModal, setPerfDetailModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/kpis').then(r => r.json()).catch(() => []),
      fetch('/api/performance_records').then(r => r.json()).catch(() => []),
      fetch('/api/performance_cycles').then(r => r.json()).catch(() => []),
    ]).then(([kpiData, perfData, cycleData]) => {
      setKpis(Array.isArray(kpiData) ? kpiData : []);
      setPerformances(Array.isArray(perfData) ? perfData : []);
      setCycles(Array.isArray(cycleData) ? cycleData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const refreshData = () => {
    Promise.all([
      fetch('/api/kpis').then(r => r.json()).catch(() => []),
      fetch('/api/performance_records').then(r => r.json()).catch(() => []),
      fetch('/api/performance_cycles').then(r => r.json()).catch(() => []),
    ]).then(([kpiData, perfData, cycleData]) => {
      setKpis(Array.isArray(kpiData) ? kpiData : []);
      setPerformances(Array.isArray(perfData) ? perfData : []);
      setCycles(Array.isArray(cycleData) ? cycleData : []);
    });
  };

  // 统计数据
  const currentCycle = cycles.find(c => c.status === 'active');
  const currentCyclePerformances = currentCycle ? performances.filter(p => p.cycleId === currentCycle.id) : [];
  
  const stats = {
    totalKpis: kpis.length,
    activeCycles: cycles.filter(c => c.status === 'active').length,
    totalPerformances: performances.length,
    avgScore: currentCyclePerformances.length > 0 
      ? Math.round(currentCyclePerformances.reduce((sum, p) => sum + p.totalScore, 0) / currentCyclePerformances.length)
      : 0,
    levelDistribution: {
      S: currentCyclePerformances.filter(p => p.level === 'S').length,
      A: currentCyclePerformances.filter(p => p.level === 'A').length,
      B: currentCyclePerformances.filter(p => p.level === 'B').length,
      C: currentCyclePerformances.filter(p => p.level === 'C').length,
      D: currentCyclePerformances.filter(p => p.level === 'D').length,
    },
  };

  // ========== KPI CRUD ==========
  const openKpiModal = (kpi?: IKPI) => {
    setEditingKpi(kpi || null);
    if (kpi) {
      kpiForm.setFieldsValue(kpi);
    } else {
      kpiForm.resetFields();
    }
    setKpiModal(true);
  };

  const saveKpi = async () => {
    try {
      const values = await kpiForm.validateFields();
      const method = editingKpi ? 'PUT' : 'POST';
      const url = editingKpi ? `/api/kpis/${editingKpi.id}` : '/api/kpis';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        messageApi.success(editingKpi ? 'KPI已更新' : 'KPI已创建');
        setKpiModal(false);
        refreshData();
      }
    } catch {}
  };

  const deleteKpi = (id: string) => {
    fetch(`/api/kpis/${id}`, { method: 'DELETE' })
      .then(() => {
        messageApi.success('KPI已删除');
        refreshData();
      });
  };

  // ========== 考核周期 CRUD ==========
  const openCycleModal = (cycle?: ICycle) => {
    setEditingCycle(cycle || null);
    if (cycle) {
      cycleForm.setFieldsValue({
        name: cycle.name,
        dateRange: [dayjs(cycle.startDate), dayjs(cycle.endDate)],
        status: cycle.status,
      });
    } else {
      cycleForm.resetFields();
    }
    setCycleModal(true);
  };

  const saveCycle = async () => {
    try {
      const values = await cycleForm.validateFields();
      const payload = {
        name: values.name,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        status: values.status || 'active',
      };
      const method = editingCycle ? 'PUT' : 'POST';
      const url = editingCycle ? `/api/performance_cycles/${editingCycle.id}` : '/api/performance_cycles';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        messageApi.success(editingCycle ? '周期已更新' : '周期已创建');
        setCycleModal(false);
        refreshData();
      }
    } catch {}
  };

  const deleteCycle = (id: string) => {
    fetch(`/api/performance_cycles/${id}`, { method: 'DELETE' })
      .then(() => {
        messageApi.success('周期已删除');
        refreshData();
      });
  };

  const closeCycle = (cycle: ICycle) => {
    fetch(`/api/performance_cycles/${cycle.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cycle, status: 'closed' }),
    }).then(() => {
      messageApi.success('周期已结束');
      refreshData();
    });
  };

  // ========== 考核记录 ==========
  const openPerfModal = () => {
    perfForm.resetFields();
    setPerfModal(true);
  };

  const savePerformance = async () => {
    try {
      const values = await perfForm.validateFields();
      // 计算总分和等级
      const kpiScores = (values.kpiScores || []).map((ks: any) => ({
        kpiId: ks.kpiId,
        kpiName: kpis.find(k => k.id === ks.kpiId)?.name || ks.kpiId,
        score: ks.score,
        weight: ks.weight || kpis.find(k => k.id === ks.kpiId)?.weight || 10,
      }));
      
      const totalScore = kpiScores.reduce((sum: number, ks: any) => sum + Math.round(ks.score * ks.weight / 100), 0);
      let level: IPerformance['level'] = 'D';
      if (totalScore >= 95) level = 'S';
      else if (totalScore >= 85) level = 'A';
      else if (totalScore >= 75) level = 'B';
      else if (totalScore >= 60) level = 'C';

      const cycle = cycles.find(c => c.id === values.cycleId);
      const payload = {
        employeeId: values.employeeId,
        employeeName: values.employeeName,
        department: values.department,
        cycleId: values.cycleId,
        cycleName: cycle?.name || '',
        totalScore,
        level,
        status: 'draft',
        kpiScores,
      };

      const res = await fetch('/api/performances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        messageApi.success('考核记录已创建');
        setPerfModal(false);
        refreshData();
      }
    } catch {}
  };

  const updatePerformanceStatus = (id: string, status: IPerformance['status']) => {
    fetch(`/api/performances/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(() => {
      messageApi.success('状态已更新');
      refreshData();
    });
  };

  const deletePerformance = (id: string) => {
    fetch(`/api/performances/${id}`, { method: 'DELETE' })
      .then(() => {
        messageApi.success('考核记录已删除');
        refreshData();
      });
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📊 绩效管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理KPI指标、考核周期、绩效评估</p>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openPerfModal}>新建考核</Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={5}><Card size="small"><Statistic title="KPI指标" value={stats.totalKpis} valueStyle={{ color: '#1890ff' }} prefix={<DashboardOutlined />} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="考核周期" value={stats.activeCycles} valueStyle={{ color: '#52c41a' }} prefix={<CalendarOutlined />} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="考核记录" value={stats.totalPerformances} valueStyle={{ color: '#722ed1' }} prefix={<BarChartOutlined />} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="平均得分" value={stats.avgScore} valueStyle={{ color: '#fa8c16' }} prefix={<TrophyOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="优秀率" value={`${Math.round(((stats.levelDistribution.S + stats.levelDistribution.A) / Math.max(currentCyclePerformances.length, 1)) * 100)}%`} valueStyle={{ color: '#eb2f96' }} /></Card></Col>
      </Row>

      {/* Tab切换 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'overview', label: '📊 绩效总览' },
          { key: 'kpis', label: '📈 KPI管理' },
          { key: 'performances', label: '📝 考核记录' },
          { key: 'cycles', label: '📅 考核周期' },
          { key: 'analysis', label: '📉 绩效分析' },
        ]} />

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : (
          <>
            {/* 绩效总览Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">📅 当前考核周期</h3>
                  {currentCycle ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">{currentCycle.name}</span>
                        <Tag color="green">进行中</Tag>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {currentCycle.startDate} ~ {currentCycle.endDate}
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <div className="text-2xl font-bold">{currentCyclePerformances.length}</div>
                          <div className="text-xs text-muted-foreground">参与人数</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.avgScore}</div>
                          <div className="text-xs text-muted-foreground">平均得分</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>暂无进行中的考核周期</p>
                      <Button type="primary" className="mt-3" onClick={() => openCycleModal()}>创建考核周期</Button>
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">🏆 绩效等级分布</h3>
                  <div className="space-y-3">
                    {Object.entries(levelMap).map(([level, config]) => {
                      const count = stats.levelDistribution[level as keyof typeof stats.levelDistribution];
                      const percent = currentCyclePerformances.length > 0 
                        ? Math.round((count / currentCyclePerformances.length) * 100)
                        : 0;
                      return (
                        <div key={level}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{config.label} ({level})</span>
                            <span>{count}人 ({percent}%)</span>
                          </div>
                          <Progress percent={percent} strokeColor={config.color === 'purple' ? '#722ed1' : config.color === 'green' ? '#52c41a' : config.color === 'blue' ? '#1890ff' : config.color === 'orange' ? '#fa8c16' : '#ff4d4f'} size="small" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 快捷操作 */}
                <div className="bg-card rounded-xl border border-border p-6 md:col-span-2">
                  <h3 className="font-semibold mb-4">⚡ 快捷操作</h3>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Card hoverable className="text-center" onClick={() => { setActiveTab('kpis'); }}>
                        <DashboardOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                        <div className="mt-2 font-medium">KPI配置</div>
                        <div className="text-xs text-muted-foreground">{kpis.length}个指标</div>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card hoverable className="text-center" onClick={() => { setActiveTab('cycles'); }}>
                        <CalendarOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                        <div className="mt-2 font-medium">考核周期</div>
                        <div className="text-xs text-muted-foreground">{cycles.filter(c => c.status === 'active').length}个进行中</div>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card hoverable className="text-center" onClick={openPerfModal}>
                        <PlusOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                        <div className="mt-2 font-medium">新建考核</div>
                        <div className="text-xs text-muted-foreground">录入绩效评分</div>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card hoverable className="text-center" onClick={() => { setActiveTab('analysis'); }}>
                        <BarChartOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
                        <div className="mt-2 font-medium">绩效分析</div>
                        <div className="text-xs text-muted-foreground">查看统计报表</div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            {/* KPI管理Tab */}
            {activeTab === 'kpis' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Alert message={`共 ${kpis.length} 个KPI指标，总权重 ${kpis.reduce((s, k) => s + k.weight, 0)}%${kpis.reduce((s, k) => s + k.weight, 0) !== 100 ? '（建议总权重为100%）' : ''}`} type={kpis.reduce((s, k) => s + k.weight, 0) === 100 ? 'success' : 'warning'} showIcon className="flex-1" />
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openKpiModal()} className="ml-4">新建KPI</Button>
                </div>
                <Table dataSource={kpis} rowKey="id" pagination={{ pageSize: 10 }} columns={[
                  { title: '指标名称', dataIndex: 'name', key: 'name', width: 180 },
                  { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: (v: string) => <Tag color="blue">{categoryMap[v] || v}</Tag> },
                  { title: '权重', dataIndex: 'weight', key: 'weight', width: 80, render: (v: number) => <Progress percent={v} size="small" format={p => `${p}%`} /> },
                  { title: '目标值', dataIndex: 'target', key: 'target', width: 120 },
                  { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                  { title: '描述', dataIndex: 'description', key: 'desc', ellipsis: true },
                  { title: '操作', key: 'action', width: 150, render: (_: any, r: IKPI) => (
                    <Space>
                      <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openKpiModal(r)}>编辑</Button>
                      <Popconfirm title="确定删除此KPI?" onConfirm={() => deleteKpi(r.id)}>
                        <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>
                    </Space>
                  )},
                ]} />
              </div>
            )}

            {/* 考核记录Tab */}
            {activeTab === 'performances' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button type="primary" icon={<PlusOutlined />} onClick={openPerfModal}>新建考核记录</Button>
                </div>
                <Table dataSource={performances} rowKey="id" pagination={{ pageSize: 10 }} columns={[
                  { title: '员工姓名', dataIndex: 'employeeName', key: 'name', width: 100 },
                  { title: '部门', dataIndex: 'department', key: 'dept', width: 100 },
                  { title: '考核周期', dataIndex: 'cycleName', key: 'cycle', width: 120 },
                  { title: '得分', dataIndex: 'totalScore', key: 'score', width: 80, render: (v: number) => <span className="text-lg font-bold">{v}</span> },
                  { title: '等级', dataIndex: 'level', key: 'level', width: 80, render: (v: string) => <Tag color={levelMap[v]?.color}>{v} - {levelMap[v]?.label}</Tag> },
                  { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={v === 'confirmed' ? 'green' : v === 'reviewed' ? 'orange' : v === 'submitted' ? 'blue' : 'default'}>{statusMap[v]?.label}</Tag> },
                  { title: '操作', key: 'action', width: 240, render: (_: any, r: IPerformance) => (
                    <Space size="small">
                      <Button size="small" type="link" onClick={() => { setSelectedPerformance(r); setPerfDetailModal(true); }}>详情</Button>
                      {r.status === 'draft' && <Button size="small" type="link" onClick={() => updatePerformanceStatus(r.id, 'submitted')}>提交</Button>}
                      {r.status === 'submitted' && <Button size="small" type="link" onClick={() => updatePerformanceStatus(r.id, 'reviewed')}>评审</Button>}
                      {r.status === 'reviewed' && <Button size="small" type="link" style={{ color: '#52c41a' }} onClick={() => updatePerformanceStatus(r.id, 'confirmed')}>确认</Button>}
                      {(r.status === 'draft') && (
                        <Popconfirm title="确定删除?" onConfirm={() => deletePerformance(r.id)}>
                          <Button size="small" type="link" danger>删除</Button>
                        </Popconfirm>
                      )}
                    </Space>
                  )},
                ]} />
              </div>
            )}

            {/* 考核周期Tab */}
            {activeTab === 'cycles' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openCycleModal()}>新建周期</Button>
                </div>
                <Table dataSource={cycles} rowKey="id" pagination={{ pageSize: 10 }} columns={[
                  { title: '周期名称', dataIndex: 'name', key: 'name', width: 180 },
                  { title: '开始日期', dataIndex: 'startDate', key: 'start', width: 120 },
                  { title: '结束日期', dataIndex: 'endDate', key: 'end', width: 120 },
                  { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '进行中' : '已结束'}</Tag> },
                  { title: '参与人数', key: 'count', width: 90, render: (_: any, r: ICycle) => performances.filter(p => p.cycleId === r.id).length },
                  { title: '平均分', key: 'avg', width: 90, render: (_: any, r: ICycle) => {
                    const ps = performances.filter(p => p.cycleId === r.id);
                    return ps.length > 0 ? Math.round(ps.reduce((s, p) => s + p.totalScore, 0) / ps.length) : '-';
                  }},
                  { title: '操作', key: 'action', width: 200, render: (_: any, r: ICycle) => (
                    <Space size="small">
                      <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openCycleModal(r)}>编辑</Button>
                      {r.status === 'active' && (
                        <Popconfirm title="确定结束此考核周期？结束后将无法修改考核数据" onConfirm={() => closeCycle(r)}>
                          <Button size="small" type="link" danger>结束周期</Button>
                        </Popconfirm>
                      )}
                      <Popconfirm title="确定删除此周期?" onConfirm={() => deleteCycle(r.id)}>
                        <Button size="small" type="link" danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>
                    </Space>
                  )},
                ]} />
              </div>
            )}

            {/* 绩效分析Tab */}
            {activeTab === 'analysis' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">📊 部门绩效对比</h3>
                  <div className="space-y-3">
                    {['技术研发部', '产品设计部', '市场营销部', '人力资源部', '财务部'].map((dept) => {
                      const deptPerformances = currentCyclePerformances.filter(p => p.department === dept);
                      const avgScore = deptPerformances.length > 0 
                        ? Math.round(deptPerformances.reduce((sum, p) => sum + p.totalScore, 0) / deptPerformances.length)
                        : 0;
                      return (
                        <div key={dept}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{dept}</span>
                            <span className="font-medium">{avgScore}</span>
                          </div>
                          <Progress percent={avgScore} strokeColor="#1890ff" size="small" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">🎯 KPI达标率</h3>
                  <div className="space-y-3">
                    {kpis.slice(0, 8).map(kpi => {
                      const achieved = Math.round(60 + Math.random() * 35);
                      return (
                        <div key={kpi.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{kpi.name}</span>
                            <span>{achieved}%</span>
                          </div>
                          <Progress percent={achieved} strokeColor={achieved >= 80 ? '#52c41a' : achieved >= 60 ? '#fa8c16' : '#ff4d4f'} size="small" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6 md:col-span-2">
                  <h3 className="font-semibold mb-4">📈 历史绩效趋势</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {cycles.slice(0, 4).map(cycle => {
                      const cyclePerfs = performances.filter(p => p.cycleId === cycle.id);
                      const avg = cyclePerfs.length > 0 ? Math.round(cyclePerfs.reduce((s, p) => s + p.totalScore, 0) / cyclePerfs.length) : 0;
                      return (
                        <div key={cycle.id} className="text-center p-4 bg-muted/20 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">{cycle.name}</div>
                          <div className="text-3xl font-bold">{avg}</div>
                          <div className="text-xs text-muted-foreground mt-1">{cyclePerfs.length}人参与</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* KPI表单弹窗 */}
      <Modal title={editingKpi ? '编辑KPI' : '新建KPI'} open={kpiModal} onOk={saveKpi} onCancel={() => setKpiModal(false)} width={560}>
        <Form form={kpiForm} layout="vertical" size="small">
          <Form.Item name="name" label="指标名称" rules={[{ required: true, message: '请输入指标名称' }]}>
            <Input placeholder="例如：项目完成率" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="分类" rules={[{ required: true }]} initialValue="work">
                <Select>
                  <Option value="work">工作业绩</Option>
                  <Option value="ability">能力素质</Option>
                  <Option value="attitude">工作态度</Option>
                  <Option value="team">团队协作</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="weight" label="权重 (%)" rules={[{ required: true }]} initialValue={10}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="target" label="目标值">
                <Input placeholder="例如：100%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="单位" initialValue="分">
                <Input placeholder="分/天/次" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="指标描述">
            <TextArea rows={3} placeholder="描述该KPI指标的评估标准" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 考核周期表单弹窗 */}
      <Modal title={editingCycle ? '编辑考核周期' : '新建考核周期'} open={cycleModal} onOk={saveCycle} onCancel={() => setCycleModal(false)} width={480}>
        <Form form={cycleForm} layout="vertical" size="small">
          <Form.Item name="name" label="周期名称" rules={[{ required: true, message: '请输入周期名称' }]}>
            <Input placeholder="例如：2025年Q2绩效考核" />
          </Form.Item>
          <Form.Item name="dateRange" label="考核周期" rules={[{ required: true, message: '请选择日期范围' }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Radio.Group>
              <Radio value="active">进行中</Radio>
              <Radio value="closed">已结束</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* 新建考核记录弹窗 */}
      <Modal title="新建考核记录" open={perfModal} onOk={savePerformance} onCancel={() => setPerfModal(false)} width={720}>
        <Form form={perfForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="employeeName" label="员工姓名" rules={[{ required: true }]}>
                <Input placeholder="员工姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="employeeId" label="工号" rules={[{ required: true }]}>
                <Input placeholder="EMP0001" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="department" label="部门" rules={[{ required: true }]}>
                <Input placeholder="部门" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="cycleId" label="考核周期" rules={[{ required: true }]}>
            <Select placeholder="选择考核周期">
              {cycles.filter(c => c.status === 'active').map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Form.Item>
          
          <Divider>KPI评分</Divider>
          {kpis.length > 0 ? (
            <div className="space-y-3">
              {kpis.map(kpi => (
                <Row key={kpi.id} gutter={16} align="middle">
                  <Col span={6}>
                    <Tag color="blue">{kpi.name}</Tag>
                    <span className="text-xs text-muted-foreground ml-1">({kpi.weight}%)</span>
                  </Col>
                  <Col span={10}>
                    <Form.Item name={['kpiScores', kpi.id, 'score']} label={null} initialValue={80} style={{ marginBottom: 0 }}>
                      <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="分" />
                    </Form.Item>
                  </Col>
                  <input type="hidden" name={['kpiScores', kpi.id, 'kpiId'].toString()} value={kpi.id} />
                </Row>
              ))}
            </div>
          ) : (
            <Alert message="暂无KPI指标，请先在KPI管理中创建指标" type="warning" showIcon />
          )}
        </Form>
      </Modal>

      {/* 绩效详情弹窗 */}
      <Modal title="考核详情" open={perfDetailModal} onCancel={() => setPerfDetailModal(false)} footer={null} width={640}>
        {selectedPerformance && (
          <div className="space-y-4">
            <Row gutter={32} className="text-center py-4">
              <Col span={12}>
                <div className="text-4xl font-bold text-primary">{selectedPerformance.totalScore}</div>
                <div className="text-sm text-muted-foreground mt-1">总分</div>
              </Col>
              <Col span={12}>
                <div className={`text-4xl font-bold ${levelMap[selectedPerformance.level]?.className.split(' ')[1]}`}>
                  {selectedPerformance.level}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{levelMap[selectedPerformance.level]?.label}</div>
              </Col>
            </Row>
            
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="员工">{selectedPerformance.employeeName}</Descriptions.Item>
              <Descriptions.Item label="部门">{selectedPerformance.department}</Descriptions.Item>
              <Descriptions.Item label="周期">{selectedPerformance.cycleName}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={selectedPerformance.status === 'confirmed' ? 'green' : 'blue'}>{statusMap[selectedPerformance.status]?.label}</Tag></Descriptions.Item>
            </Descriptions>

            <Divider>KPI得分明细</Divider>
            <Table dataSource={selectedPerformance.kpiScores || []} rowKey="kpiId" pagination={false} size="small" columns={[
              { title: '指标名称', dataIndex: 'kpiName', key: 'name' },
              { title: '得分', dataIndex: 'score', key: 'score', render: (v: number) => <span className="font-bold">{v}</span> },
              { title: '权重', dataIndex: 'weight', key: 'weight', render: (v: number) => `${v}%` },
              { title: '加权分', key: 'weighted', render: (_: any, r: any) => Math.round(r.score * r.weight / 100) },
            ]} />
          </div>
        )}
      </Modal>
    </div>
  );
}

// dayjs helper for DatePicker
function dayjs(dateStr: string) {
  const d = new Date(dateStr);
  return {
    format: (fmt: string) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return fmt.replace('YYYY', String(d.getFullYear())).replace('MM', pad(d.getMonth() + 1)).replace('DD', pad(d.getDate()));
    }
  };
}
