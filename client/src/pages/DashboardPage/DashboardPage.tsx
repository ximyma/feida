import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface IStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingEmployees: number;
  monthPayroll: number;
  departmentStats: { department: string; count: string }[];
}

const quickLinks = [
  { to: '/organization', icon: '🏢', label: '组织架构', color: 'from-blue-500 to-blue-600' },
  { to: '/personnel', icon: '👥', label: '人事管理', color: 'from-emerald-500 to-emerald-600' },
  { to: '/attendance', icon: '🕐', label: '考勤打卡', color: 'from-purple-500 to-purple-600' },
  { to: '/salary', icon: '💰', label: '薪酬查询', color: 'from-orange-500 to-orange-600' },
  { to: '/statistics', icon: '📊', label: '数据统计', color: 'from-teal-500 to-teal-600' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<IStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="text-muted-foreground">加载中...</span></div>;
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">首页仪表盘</h1>
        <p className="text-sm text-muted-foreground mt-1">欢迎使用飞达智能人力资源系统</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="总人数" value={stats?.totalEmployees ?? 0} icon="👥" trend="+2" color="blue" />
        <KPICard title="在职人数" value={stats?.activeEmployees ?? 0} icon="✅" trend="+1" color="green" />
        <KPICard title="考勤率" value="96.5%" icon="📅" trend="+0.5" color="purple" />
        <KPICard title="月工资总额" value={`¥${((stats?.monthPayroll ?? 0) / 10000).toFixed(0)}万`} icon="💵" trend="+3.2" color="orange" />
      </div>

      {/* Quick Links */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">⚡ 快捷入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {quickLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br ${link.color} text-white hover:scale-105 hover:shadow-lg transition-all text-center`}>
              <span className="text-3xl">{link.icon}</span>
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Department Stats */}
      {stats?.departmentStats && stats.departmentStats.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">📊 部门人员分布</h2>
          <div className="space-y-3">
            {stats.departmentStats.map((dept) => (
              <div key={dept.department} className="flex items-center gap-4">
                <span className="w-32 text-sm text-muted-foreground truncate">{dept.department}</span>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full flex items-center justify-end px-2"
                    style={{ width: `${Math.min(Number(dept.count) / 10 * 100, 100)}%` }}>
                    <span className="text-xs text-white font-medium">{dept.count}人</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">📋 系统概览</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard label="数据库表" value="12" icon="🗄️" />
          <InfoCard label="职级数量" value="5" icon="📑" />
          <InfoCard label="系统角色" value="6" icon="🎭" />
          <InfoCard label="权限模块" value="9" icon="🔐" />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, trend, color }: { title: string; value: string | number; icon: string; trend: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600', green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600', orange: 'from-orange-500 to-orange-600',
  };
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">▲ {trend}%</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
