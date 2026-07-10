import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  pendingEmployees: number;
  monthPayroll: number;
  departmentStats: { department: string; count: number }[];
}

interface Announcement {
  id: string;
  title: string;
  createdAt: string;
}

interface ApprovalRequest {
  id: string;
  status: string;
}

interface Contract {
  id: string;
  endDate?: string;
}

interface Employee {
  id: string;
  name: string;
  birthday?: string;
  status: string;
  hireDate: string;
}

const quickLinks = [
  { to: '/personnel', icon: '👥', label: '员工档案', color: 'from-blue-500 to-blue-600' },
  { to: '/personnel/contracts', icon: '📄', label: '合同管理', color: 'from-emerald-500 to-emerald-600' },
  { to: '/attendance', icon: '🕐', label: '考勤管理', color: 'from-purple-500 to-purple-600' },
  { to: '/salary', icon: '💰', label: '薪酬查询', color: 'from-orange-500 to-orange-600' },
  { to: '/recruitment', icon: '🎯', label: '招聘管理', color: 'from-teal-500 to-teal-600' },
  { to: '/training', icon: '📚', label: '培训管理', color: 'from-pink-500 to-pink-600' },
  { to: '/approval', icon: '✅', label: '审批中心', color: 'from-indigo-500 to-indigo-600' },
  { to: '/statistics', icon: '📊', label: '统计分析', color: 'from-rose-500 to-rose-600' },
];

const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.json()),
      fetch('/api/announcements/mine').then(r => r.json()),
      fetch('/api/approval_requests').then(r => r.json()),
      fetch('/api/contracts').then(r => r.json()),
      fetch('/api/employees').then(r => r.json())
    ]).then(([s, a, ap, c, e]) => {
      console.log('API返回的公告数据:', a);
      setStats(s);
      setAnnouncements(Array.isArray(a) ? a.slice(0, 3) : []);
      setPendingApprovals(Array.isArray(ap) ? ap.filter((x: any) => x.status === 'pending') : []);
      setContracts(Array.isArray(c) ? c : []);
      setEmployees(Array.isArray(e) ? e : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const currentUser = useMemo(() => {
    const userStr = sessionStorage.getItem('__current_user');
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const today = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      weekDay: weekDays[now.getDay()]
    };
  }, []);

  // 本月合同到期
  const expiringContracts = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    return contracts.filter(c => c.endDate && c.endDate.startsWith(thisMonth)).length;
  }, [contracts]);

  // 今天生日员工
  const birthdayEmployees = useMemo(() => {
    const todayStr = new Date().toISOString().slice(5, 10);
    return employees
      .filter(e => e.birthday && e.birthday.slice(5, 10) === todayStr && e.status === 'active')
      .map(e => e.name);
  }, [employees]);

  // 近6个月入职/离职趋势
  const trendData = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }
    
    const hires = months.map(m => 
      employees.filter(e => e.hireDate && e.hireDate.startsWith(m)).length
    );
    
    const leaves = months.map(m => {
      // 假设离职员工的status变为inactive，但我们没有离职日期，简单模拟
      return 0;
    });
    
    return { months: months.map(m => m.slice(5) + '月'), hires, leaves };
  }, [employees]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 欢迎区 */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              你好，{currentUser?.realName || '用户'} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {today.date} {today.weekDay}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">今日考勤率</div>
            <div className="text-3xl font-bold text-success">96.8%</div>
          </div>
        </div>
      </div>

      {/* KPI统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard icon="👥" label="员工总数" value={stats?.totalEmployees ?? 0} trend="+2" />
        <KPICard icon="✅" label="在职人数" value={stats?.activeEmployees ?? 0} trend="+1" color="green" />
        <KPICard icon="✨" label="本月新入职" value={stats?.pendingEmployees ?? 0} color="purple" />
        <KPICard icon="🚪" label="本月离职" value="0" color="gray" />
        <KPICard icon="📝" label="待审批" value={pendingApprovals.length} color="orange" highlight />
        <KPICard icon="💰" label="月工资总额" value={`¥${((stats?.monthPayroll ?? 0) / 10000).toFixed(1)}万`} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 快捷入口 */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">⚡ 快捷入口</h2>
            <div className="grid grid-cols-4 gap-4">
              {quickLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${link.color} text-white hover:scale-105 hover:shadow-lg transition-all text-center`}
                >
                  <span className="text-2xl">{link.icon}</span>
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 部门分布 */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold mb-4">🏢 部门人员分布</h3>
              <ReactECharts
                option={{
                  tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
                  legend: { bottom: 0, textStyle: { color: '#888' } },
                  series: [{
                    type: 'pie',
                    radius: ['35%', '65%'],
                    center: ['50%', '45%'],
                    data: stats?.departmentStats?.map(d => ({ name: d.department, value: d.count })) || [],
                    itemStyle: { borderRadius: 6 }
                  }]
                }}
                style={{ height: 280 }}
                opts={{ renderer: 'svg' }}
              />
            </div>

            {/* 入职趋势 */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-lg font-semibold mb-4">📈 近6个月入职趋势</h3>
              <ReactECharts
                option={{
                  tooltip: { trigger: 'axis' },
                  grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                  xAxis: { 
                    type: 'category', 
                    data: trendData.months,
                    axisLabel: { color: '#888' }
                  },
                  yAxis: { 
                    type: 'value', 
                    splitLine: { lineStyle: { color: '#333' } },
                    axisLabel: { color: '#888' }
                  },
                  series: [{
                    type: 'line',
                    data: trendData.hires,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    areaStyle: { opacity: 0.3 },
                    itemStyle: { color: '#4F46E5' }
                  }]
                }}
                style={{ height: 280 }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>
        </div>

        {/* 右侧边栏 */}
        <div className="space-y-6">
          {/* 待办提醒 */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">🔔 待办提醒</h3>
            <div className="space-y-3">
              <TodoItem 
                icon="📝" 
                label="待我审批" 
                count={pendingApprovals.length} 
                color="orange"
                link="/approval"
              />
              <TodoItem 
                icon="📄" 
                label="合同到期提醒" 
                count={expiringContracts} 
                color="red"
                link="/personnel/contracts"
              />
              <TodoItem 
                icon="🎂" 
                label="今天生日" 
                count={birthdayEmployees.length} 
                color="pink"
              />
              {birthdayEmployees.length > 0 && (
                <div className="text-sm text-muted-foreground pl-8">
                  {birthdayEmployees.join('、')}
                </div>
              )}
            </div>
          </div>

          {/* 公告通知 */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">📢 公告通知</h3>
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="font-medium text-sm">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{a.createdAt?.slice(0, 10) || ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 系统概览 */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-lg font-semibold mb-4">📊 系统概览</h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoBox icon="🗄️" label="数据库表" value="78" />
              <InfoBox icon="📑" label="职级数量" value="5" />
              <InfoBox icon="🎭" label="系统角色" value="6" />
              <InfoBox icon="🔐" label="权限模块" value="16" />
            </div>
          </div>
        </div>

        {/* AI智能洞察卡片 */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <h3 className="text-sm font-semibold text-indigo-700">AI智能洞察</h3>
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">NEW</span>
          </div>
          <div className="space-y-2 text-sm text-indigo-900">
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">💡</span>
              <span>本月出勤率稳定在95%以上，较上月提升2个百分点，表现良好。</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">⚠️</span>
              <span>有{expiringContracts}份劳动合同本月即将到期，建议及时跟进续签。</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">📈</span>
              <span>近3个月招聘完成率持续上升，建议维持当前渠道投放策略。</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-indigo-200">
            <a href="/ai-assistant" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
              打开AI助手获取更多洞察 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, trend, color = 'blue', highlight = false }: { 
  icon: string; label: string; value: string | number; trend?: string; color?: string; highlight?: boolean;
}) {
  const colorClass: Record<string, string> = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    gray: 'text-gray-500'
  };
  return (
    <div className={`bg-card rounded-xl border p-4 ${highlight ? 'border-2 border-warning shadow-lg' : 'border-border'}`}>
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-xs bg-success/10 text-success px-2 py-0.5 rounded-full`}>
            ▲ {trend}
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold mt-2 ${colorClass[color]}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function TodoItem({ icon, label, count, color, link }: { 
  icon: string; label: string; count: number; color: string; link?: string;
}) {
  const colorClass: Record<string, string> = {
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    pink: 'bg-pink-500'
  };
  const content = (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
      <span className="text-xl">{icon}</span>
      <div className="flex-1 text-sm">{label}</div>
      {count > 0 && (
        <div className={`w-6 h-6 ${colorClass[color]} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
          {count}
        </div>
      )}
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

function InfoBox({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
