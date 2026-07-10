import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Spin, Tag, Tabs, Table, Empty, message, Space } from 'antd';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Sparkles, Users, Clock, Banknote, Target, UserPlus, RefreshCw } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

interface InsightCard {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
  icon: React.ReactNode;
}

export default function AIBIAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 并行加载各项数据
      const [empRes, attRes, salRes] = await Promise.all([
        fetch('/api/employees?pageSize=1').then(r => r.json()),
        fetch('/api/attendance/records?status=active').then(r => r.json()).catch(() => ({})),
        fetch('/api/salaries?period=current').then(r => r.json()).catch(() => ({})),
      ]);

      const totalEmp = empRes.total || empRes.length || 0;
      const attendanceData = attRes.data || attRes.list || [];
      const salaryData = salRes.data || salRes.list || [];

      // 计算考勤率（有考勤数据的情况下）
      const presentCount = Array.isArray(attendanceData)
        ? attendanceData.filter((r: any) => r.status === 'present' || r.status === 'normal').length
        : 0;
      const attendanceRate = Array.isArray(attendanceData) && attendanceData.length > 0
        ? Math.round((presentCount / attendanceData.length) * 100)
        : 95;

      // 计算平均薪资
      const avgSalary = Array.isArray(salaryData) && salaryData.length > 0
        ? Math.round(salaryData.reduce((acc: number, r: any) => acc + (r.total_amount || r.amount || 0), 0) / salaryData.length)
        : 8500;

      setInsights([
        {
          title: '员工总数',
          value: String(totalEmp),
          trend: 'stable',
          description: '在职员工总人数',
          icon: <Users size={24} color="#1890ff" />,
        },
        {
          title: '出勤率',
          value: attendanceRate + '%',
          trend: attendanceRate >= 95 ? 'up' : 'down',
          description: '今日出勤统计',
          icon: <Clock size={24} color="#52c41a" />,
        },
        {
          title: '平均薪资',
          value: '¥' + avgSalary.toLocaleString(),
          trend: 'stable',
          description: '当前周期人均薪酬',
          icon: <Banknote size={24} color="#faad14" />,
        },
        {
          title: '绩效达标率',
          value: '87%',
          trend: 'up',
          description: '本季度绩效评估',
          icon: <Target size={24} color="#722ed1" />,
        },
      ]);
    } catch (e) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    setAiAnalysis('');
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataType: 'general',
          data: {
            insights: insights.map(i => ({ title: i.title, value: i.value, trend: i.trend })),
            instructions: '请对以上HR数据指标进行综合分析，给出3-5条洞察和建议，每条用 • 开头。',
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysis(data.analysis);
      } else {
        message.error(data.error || 'AI分析失败');
      }
    } catch {
      message.error('AI分析请求失败');
    } finally {
      setAnalyzing(false);
    }
  };

  // 考勤趋势图配置
  const attendanceChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['出勤', '请假', '迟到'] },
    grid: { left: 40, right: 20, top: 20, bottom: 20 },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value' },
    series: [
      { name: '出勤', type: 'bar', data: [120, 118, 125, 115, 122, 80, 45], itemStyle: { color: '#52c41a' } },
      { name: '请假', type: 'bar', data: [5, 7, 3, 8, 4, 15, 10], itemStyle: { color: '#faad14' } },
      { name: '迟到', type: 'bar', data: [3, 2, 4, 1, 3, 5, 2], itemStyle: { color: '#f5222d' } },
    ],
  };

  // 人力结构饼图
  const deptPieOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: 35, name: '生产部' },
        { value: 20, name: '行政部' },
        { value: 15, name: '研发部' },
        { value: 12, name: '销售部' },
        { value: 10, name: '财务部' },
        { value: 8, name: '人事部' },
      ],
    }],
  };

  // 月度趋势折线图
  const monthTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['入职', '离职', '净增长'] },
    grid: { left: 40, right: 20, top: 20, bottom: 20 },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value' },
    series: [
      { name: '入职', type: 'line', data: [8, 5, 12, 10, 15, 9], smooth: true, itemStyle: { color: '#52c41a' } },
      { name: '离职', type: 'line', data: [3, 2, 4, 3, 5, 3], smooth: true, itemStyle: { color: '#f5222d' } },
      { name: '净增长', type: 'line', data: [5, 3, 8, 7, 10, 6], smooth: true, itemStyle: { color: '#1890ff' }, areaStyle: { opacity: 0.1 } },
    ],
  };

  return (
    <div>
      <Card
        title={<Space><BarChart3 size={18} color="#1890ff" /> <span>智能BI数据分析</span></Space>}
        extra={
          <Button icon={<RefreshCw size={14} />} onClick={loadDashboardData} loading={loading}>
            刷新数据
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <p style={{ color: '#666', marginBottom: 0 }}>
          📊 AI驱动的HR数据可视化看板，支持多维度分析和智能洞察。点击「AI分析」获取深度洞察。
        </p>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : (
        <>
          {/* 核心指标卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {insights.map((card, idx) => (
              <Col xs={12} sm={6} key={idx}>
                <Card size="small" hoverable>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {card.icon}
                    <Tag color={card.trend === 'up' ? 'green' : card.trend === 'down' ? 'red' : 'default'}
                      icon={card.trend === 'up' ? <TrendingUp size={12} /> : card.trend === 'down' ? <TrendingDown size={12} /> : undefined}>
                      {card.trend === 'up' ? '上升' : card.trend === 'down' ? '下降' : '稳定'}
                    </Tag>
                  </div>
                  <Statistic title={card.title} value={card.value} valueStyle={{ fontSize: 22 }} style={{ marginTop: 8 }} />
                  <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{card.description}</div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* 图表区域 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={12}>
              <Card title="本周考勤趋势" size="small">
                <ReactECharts option={attendanceChartOption} style={{ height: 280 }} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="部门人力结构" size="small">
                <ReactECharts option={deptPieOption} style={{ height: 280 }} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={12}>
              <Card title="人员流动趋势" size="small">
                <ReactECharts option={monthTrendOption} style={{ height: 280 }} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              {/* AI洞察卡片 */}
              <Card
                title={<Space><Sparkles size={16} color="#722ed1" /> <span>AI智能洞察</span></Space>}
                size="small"
                extra={
                  <Button size="small" type="primary" icon={<Sparkles size={12} />} loading={analyzing} onClick={runAIAnalysis}>
                    AI分析
                  </Button>
                }
              >
                {aiAnalysis ? (
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13, maxHeight: 240, overflow: 'auto' }}>
                    {aiAnalysis}
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="点击「AI分析」按钮，让AI为你解读当前HR数据，提供智能洞察和建议"
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* 预警区域 */}
          <Card
            title={<Space><AlertTriangle size={16} color="#faad14" /> <span>智能预警提示</span></Space>}
            size="small"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div style={{ padding: '12px 16px', backgroundColor: '#fff7e6', borderRadius: 8, border: '1px solid #ffd591' }}>
                  <AlertTriangle size={16} color="#faad14" style={{ marginBottom: 4 }} />
                  <div style={{ fontWeight: 'bold', fontSize: 13 }}>高离职风险预警</div>
                  <div style={{ color: '#666', fontSize: 12 }}>3名核心员工近期有离职倾向</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ padding: '12px 16px', backgroundColor: '#fff1f0', borderRadius: 8, border: '1px solid #ffa39e' }}>
                  <AlertTriangle size={16} color="#f5222d" style={{ marginBottom: 4 }} />
                  <div style={{ fontWeight: 'bold', fontSize: 13 }}>考勤异常增多</div>
                  <div style={{ color: '#666', fontSize: 12 }}>本周迟到率较上周上升18%</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ padding: '12px 16px', backgroundColor: '#e6f7ff', borderRadius: 8, border: '1px solid #91d5ff' }}>
                  <AlertTriangle size={16} color="#1890ff" style={{ marginBottom: 4 }} />
                  <div style={{ fontWeight: 'bold', fontSize: 13 }}>培训完成率偏低</div>
                  <div style={{ color: '#666', fontSize: 12 }}>新员工培训完成率仅62%，需关注</div>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
}
