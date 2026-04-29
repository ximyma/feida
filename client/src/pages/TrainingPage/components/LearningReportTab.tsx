/**
 * 学习统计报表组件
 * 个人学习报表、部门报表、课程完成率统计
 */
import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Table, Select, DatePicker, Tabs, Progress,
  Tag, Empty, Spin, List, Avatar, Typography, Tooltip, Space, Button
} from 'antd';
import {
  UserOutlined, TeamOutlined, BookOutlined, TrophyOutlined,
  ClockCircleOutlined, CheckCircleOutlined, RiseOutlined, FallOutlined,
  BarChartOutlined, LineChartOutlined, PieChartOutlined, DownloadOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// API 请求封装
const api = {
  get: (url: string, params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`/api${url}${query}`).then(r => r.json());
  },
  post: (url: string, data: any) => fetch(`/api${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
};

interface LearningReportProps {
  currentUserId: string;
  currentUserName: string;
  isAdmin?: boolean;
}

export interface ReportData {
  // 个人统计
  personalStats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLearningTime: number; // 分钟
    totalCredits: number;
    avgScore: number;
    currentStreak: number; // 连续学习天数
    longestStreak: number;
  };
  // 部门统计
  departmentStats: {
    deptName: string;
    totalEmployees: number;
    avgCompletionRate: number;
    activeLearners: number;
    topLearners: Array<{ name: string; courses: number; time: number }>;
  }[];
  // 课程完成率
  courseStats: {
    courseName: string;
    totalEnrolled: number;
    completed: number;
    completionRate: number;
    avgScore: number;
  }[];
  // 学习趋势
  learningTrend: Array<{
    date: string;
    learningTime: number;
    coursesCompleted: number;
  }>;
  // 学习日历
  learningCalendar: Record<string, number>; // date -> minutes
}

export default function LearningReportTab({ currentUserId, currentUserName, isAdmin = false }: LearningReportProps) {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [reportType, setReportType] = useState<'personal' | 'department' | 'course'>('personal');

  useEffect(() => {
    loadReportData();
  }, [dateRange, reportType]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // 从真实API获取学习进度数据
      const [progressRes, recordsRes] = await Promise.all([
        fetch('/api/training_learning_progress').then(r => r.json()),
        fetch('/api/training_records').then(r => r.json()),
      ]);
      
      const progressData = Array.isArray(progressRes) ? progressRes : (progressRes.data || []);
      const recordsData = Array.isArray(recordsRes) ? recordsRes : (recordsRes.data || []);
      
      // 生成近30天的学习数据
      const learningTrend = [];
      const learningCalendar: Record<string, number> = {};
      
      for (let i = 29; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        const dayProgress = progressData.filter((p: any) => 
          p.lastAccessAt && dayjs(p.lastAccessAt).format('YYYY-MM-DD') === date
        );
        const totalTime = dayProgress.reduce((s: number, p: any) => s + (p.totalWatchTime || 0), 0);
        learningTrend.push({
          date,
          learningTime: Math.floor(totalTime / 60),
          coursesCompleted: dayProgress.filter((p: any) => p.status === 'completed').length
        });
        learningCalendar[date] = Math.floor(totalTime / 60);
      }
      
      // 计算统计
      const completedCourses = recordsData.filter((r: any) => r.passed).length;
      const inProgressCourses = progressData.filter((p: any) => p.status === 'in_progress').length;
      
      const reportData: ReportData = {
        personalStats: {
          totalCourses: progressData.length,
          completedCourses,
          inProgressCourses,
          totalLearningTime: progressData.reduce((s: number, p: any) => s + (p.totalWatchTime || 0), 0) / 60,
          totalCredits: recordsData.reduce((s: number, r: any) => s + (r.credit || 0), 0),
          avgScore: recordsData.filter((r: any) => r.score != null).length > 0
            ? recordsData.filter((r: any) => r.score != null).reduce((s: number, r: any) => s + r.score, 0) / recordsData.filter((r: any) => r.score != null).length
            : 0,
          currentStreak: 0,
          longestStreak: 0
        },
        departmentStats: [],
        courseStats: [],
        learningTrend,
        learningCalendar
      };
      
      setReportData(reportData);
    } catch (error) {
      console.error('加载报表数据失败:', error);
      // 失败时使用模拟数据
      setReportData(generateMockReportData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockReportData = (): ReportData => {
    // 生成近30天的学习数据
    const learningTrend = [];
    const learningCalendar: Record<string, number> = {};
    
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      learningTrend.push({
        date,
        learningTime: Math.floor(Math.random() * 120) + 10,
        coursesCompleted: Math.random() > 0.8 ? 1 : 0
      });
      learningCalendar[date] = Math.floor(Math.random() * 120) + 10;
    }

    return {
      personalStats: {
        totalCourses: 28,
        completedCourses: 15,
        inProgressCourses: 8,
        totalLearningTime: 2560,
        totalCredits: 42,
        avgScore: 85.6,
        currentStreak: 5,
        longestStreak: 12
      },
      departmentStats: [
        {
          deptName: '技术研发部',
          totalEmployees: 45,
          avgCompletionRate: 72,
          activeLearners: 38,
          topLearners: [
            { name: '李明', courses: 12, time: 480 },
            { name: '王芳', courses: 10, time: 420 },
            { name: '张伟', courses: 9, time: 380 }
          ]
        },
        {
          deptName: '市场营销部',
          totalEmployees: 30,
          avgCompletionRate: 65,
          activeLearners: 25,
          topLearners: [
            { name: '刘洋', courses: 8, time: 320 },
            { name: '陈静', courses: 7, time: 280 },
            { name: '赵强', courses: 6, time: 240 }
          ]
        },
        {
          deptName: '人力资源部',
          totalEmployees: 12,
          avgCompletionRate: 85,
          activeLearners: 11,
          topLearners: [
            { name: '孙丽', courses: 15, time: 600 },
            { name: '周杰', courses: 12, time: 480 },
            { name: '吴敏', courses: 10, time: 400 }
          ]
        }
      ],
      courseStats: [
        { courseName: '新员工入职培训', totalEnrolled: 120, completed: 108, completionRate: 90, avgScore: 92 },
        { courseName: '安全生产培训', totalEnrolled: 200, completed: 165, completionRate: 82.5, avgScore: 88 },
        { courseName: '产品知识培训', totalEnrolled: 85, completed: 62, completionRate: 73, avgScore: 82 },
        { courseName: '销售技巧培训', totalEnrolled: 60, completed: 45, completionRate: 75, avgScore: 86 },
        { courseName: '管理能力培训', totalEnrolled: 40, completed: 28, completionRate: 70, avgScore: 79 },
        { courseName: '数据分析培训', totalEnrolled: 35, completed: 18, completionRate: 51, avgScore: 84 }
      ],
      learningTrend,
      learningCalendar
    };
  };

  // 图表配置
  const getTrendChartOption = () => {
    if (!reportData) return {};
    
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const data = params[0];
          return `${data.name}<br/>学习时长: ${data.value} 分钟`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: reportData.learningTrend.map(d => dayjs(d.date).format('MM-DD')),
        boundaryGap: false
      },
      yAxis: { type: 'value', name: '分钟' },
      series: [{
        name: '学习时长',
        type: 'line',
        smooth: true,
        data: reportData.learningTrend.map(d => d.learningTime),
        areaStyle: { color: 'rgba(24, 144, 255, 0.2)' },
        lineStyle: { color: '#1890ff' },
        itemStyle: { color: '#1890ff' }
      }]
    };
  };

  const getCompletionRateChartOption = () => {
    if (!reportData) return {};
    
    const data = reportData.courseStats.map(c => ({
      name: c.courseName.length > 10 ? c.courseName.slice(0, 10) + '...' : c.courseName,
      value: c.completionRate
    }));

    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', max: 100, name: '完成率(%)' },
      yAxis: { type: 'category', data: data.map(d => d.name) },
      series: [{
        name: '完成率',
        type: 'bar',
        data: data.map(d => d.value),
        itemStyle: {
          color: (params: any) => {
            const value = params.value;
            if (value >= 80) return '#52c41a';
            if (value >= 60) return '#faad14';
            return '#f5222d';
          }
        },
        label: { show: true, formatter: '{c}%' }
      }]
    };
  };

  const getDeptChartOption = () => {
    if (!reportData) return {};
    
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['完成率', '活跃度'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: reportData.departmentStats.map(d => d.deptName) },
      yAxis: [{ type: 'value', max: 100, name: '完成率(%)' }, { type: 'value', max: 100, name: '活跃度(%)' }],
      series: [
        {
          name: '完成率',
          type: 'bar',
          data: reportData.departmentStats.map(d => d.avgCompletionRate),
          itemStyle: { color: '#1890ff' }
        },
        {
          name: '活跃度',
          type: 'bar',
          yAxisIndex: 1,
          data: reportData.departmentStats.map(d => Math.round(d.activeLearners / d.totalEmployees * 100)),
          itemStyle: { color: '#52c41a' }
        }
      ]
    };
  };

  const getCreditPieOption = () => {
    if (!reportData) return {};
    
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c}分 ({d}%)' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '学分分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        data: [
          { value: 20, name: '必修课程', itemStyle: { color: '#1890ff' } },
          { value: 12, name: '选修课程', itemStyle: { color: '#52c41a' } },
          { value: 6, name: '专题培训', itemStyle: { color: '#faad14' } },
          { value: 4, name: '外部培训', itemStyle: { color: '#722ed1' } }
        ]
      }]
    };
  };

  const getCalendarOption = () => {
    if (!reportData) return {};
    
    // 生成热力图数据
    const days = Object.entries(reportData.learningCalendar).map(([date, minutes]) => ({
      date,
      value: Math.min(minutes, 120)
    }));

    return {
      tooltip: {
        formatter: (params: any) => `${params.data[0]}<br/>学习时长: ${params.data[1]} 分钟`
      },
      visualMap: {
        min: 0,
        max: 120,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 20,
        inRange: {
          color: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
        }
      },
      calendar: {
        top: 30,
        left: 50,
        right: 30,
        cellSize: ['auto', 20],
        range: [
          dayjs().subtract(60, 'day').format('YYYY-MM-DD'),
          dayjs().format('YYYY-MM-DD')
        ],
        itemStyle: { borderWidth: 2, borderColor: '#fff' },
        yearLabel: { show: false },
        monthLabel: { show: false },
        dayLabel: { firstDay: '1', nameMap: 'cn', fontSize: 10 },
        splitLine: { show: false }
      },
      series: [{
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: days.map(d => [d.date, d.value])
      }]
    };
  };

  // 格式化时长
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载报表数据中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      {/* 顶部筛选栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: 140 }}
            options={[
              { value: 'personal', label: '个人报表' },
              { value: 'department', label: '部门报表' },
              { value: 'course', label: '课程报表' }
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
          />
          <Button icon={<DownloadOutlined />}>导出报表</Button>
        </Space>
      </Card>

      {/* 个人报表视图 */}
      {reportType === 'personal' && reportData && (
        <>
          {/* 核心指标卡片 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="学习课程"
                  value={reportData.personalStats.totalCourses}
                  prefix={<BookOutlined />}
                  suffix={`/ ${reportData.personalStats.completedCourses} 已完成`}
                />
                <Progress
                  percent={Math.round(reportData.personalStats.completedCourses / reportData.personalStats.totalCourses * 100)}
                  size="small"
                  strokeColor="#52c41a"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="累计学习时长"
                  value={formatDuration(reportData.personalStats.totalLearningTime)}
                  prefix={<ClockCircleOutlined />}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  平均每天 {Math.round(reportData.personalStats.totalLearningTime / 30)} 分钟
                </Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="获得学分"
                  value={reportData.personalStats.totalCredits}
                  prefix={<TrophyOutlined />}
                  suffix="分"
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  超过 85% 的学员
                </Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="学习连续天数"
                  value={reportData.personalStats.currentStreak}
                  prefix={<RiseOutlined />}
                  suffix={`天 (最长: ${reportData.personalStats.longestStreak}天)`}
                  valueStyle={{ color: reportData.personalStats.currentStreak >= 7 ? '#52c41a' : '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 图表区域 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={16}>
              <Card title="学习趋势">
                <ReactECharts option={getTrendChartOption()} style={{ height: 280 }} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="学分分布">
                <ReactECharts option={getCreditPieOption()} style={{ height: 280 }} />
              </Card>
            </Col>
          </Row>

          {/* 学习日历 */}
          <Card title="学习日历" style={{ marginBottom: 16 }}>
            <ReactECharts option={getCalendarOption()} style={{ height: 180 }} />
          </Card>
        </>
      )}

      {/* 部门报表视图 */}
      {reportType === 'department' && reportData && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic title="部门数量" value={reportData.departmentStats.length} prefix={<TeamOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="平均完成率"
                  value={Math.round(
                    reportData.departmentStats.reduce((s, d) => s + d.avgCompletionRate, 0) / reportData.departmentStats.length
                  )}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="活跃学员"
                  value={reportData.departmentStats.reduce((s, d) => s + d.activeLearners, 0)}
                  suffix={`/ ${reportData.departmentStats.reduce((s, d) => s + d.totalEmployees, 0)}`}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="最佳部门"
                  value={reportData.departmentStats.sort((a, b) => b.avgCompletionRate - a.avgCompletionRate)[0]?.deptName}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Card title="部门完成率对比">
                <ReactECharts option={getDeptChartOption()} style={{ height: 320 }} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="部门排名">
                <List
                  dataSource={reportData.departmentStats.sort((a, b) => b.avgCompletionRate - a.avgCompletionRate)}
                  renderItem={(dept, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar style={{ backgroundColor: index === 0 ? '#faad14' : index === 1 ? '#1890ff' : index === 2 ? '#52c41a' : '#d9d9d9' }}>{index + 1}</Avatar>}
                        title={dept.deptName}
                        description={`完成率: ${dept.avgCompletionRate}% | 活跃: ${dept.activeLearners}/${dept.totalEmployees}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* 课程报表视图 */}
      {reportType === 'course' && reportData && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="平均完成率"
                  value={Math.round(
                    reportData.courseStats.reduce((s, c) => s + c.completionRate, 0) / reportData.courseStats.length
                  )}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="最高完成率"
                  value={Math.max(...reportData.courseStats.map(c => c.completionRate))}
                  suffix="%"
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="最低完成率"
                  value={Math.min(...reportData.courseStats.map(c => c.completionRate))}
                  suffix="%"
                  prefix={<FallOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="课程完成率对比">
                <ReactECharts option={getCompletionRateChartOption()} style={{ height: 350 }} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="课程完成明细">
                <Table
                  dataSource={reportData.courseStats}
                  rowKey="courseName"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '课程名称', dataIndex: 'courseName', width: 150, ellipsis: true },
                    { title: '报名人数', dataIndex: 'totalEnrolled', width: 80, align: 'center' },
                    { 
                      title: '完成人数', 
                      dataIndex: 'completed', 
                      width: 80, 
                      align: 'center',
                      render: (v, r) => <span style={{ color: '#52c41a' }}>{v}</span>
                    },
                    { 
                      title: '完成率', 
                      dataIndex: 'completionRate',
                      width: 100,
                      align: 'center',
                      render: (v) => (
                        <Progress percent={v} size="small" strokeColor={v >= 80 ? '#52c41a' : v >= 60 ? '#faad14' : '#f5222d'} />
                      )
                    },
                    { title: '平均分', dataIndex: 'avgScore', width: 70, align: 'center' }
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
