import React, { useState, useEffect } from 'react';

const TITLE = '系统概览';

export default function SystemOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [dashboard, users, roles, configs, logs, backups] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/roles').then(r => r.json()),
        fetch('/api/system_config').then(r => r.json()),
        fetch('/api/audit_logs').then(r => r.json()),
        fetch('/api/data_backups').then(r => r.json()),
      ]);
      setStats({
        dashboard,
        users: Array.isArray(users) ? users : [],
        roles: Array.isArray(roles) ? roles : [],
        configs: Array.isArray(configs) ? configs : [],
        logs: Array.isArray(logs) ? logs : [],
        backups: Array.isArray(backups) ? backups : [],
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading || !stats) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>;
  }

  const activeUsers = stats.users.filter((u: any) => u.status === 'active').length;
  const systemRoles = stats.roles.filter((r: any) => r.type === 'system').length;
  const customRoles = stats.roles.filter((r: any) => r.type !== 'system').length;
  const recentLogs = [...stats.logs].sort((a: any, b: any) => (b.timestamp || b.createdAt || '').localeCompare(a.timestamp || a.createdAt || '')).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">{TITLE}</h2>
        <p className="text-sm text-gray-500">系统运行状态总览</p>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="text-blue-100 text-sm mb-1">员工总数</div>
          <div className="text-3xl font-bold">{stats.dashboard?.totalEmployees || 0}</div>
          <div className="text-blue-200 text-xs mt-1">在职 {(stats.dashboard?.activeEmployees || 0)} 人</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="text-green-100 text-sm mb-1">系统用户</div>
          <div className="text-3xl font-bold">{stats.users.length}</div>
          <div className="text-green-200 text-xs mt-1">活跃 {activeUsers} 人</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="text-purple-100 text-sm mb-1">系统角色</div>
          <div className="text-3xl font-bold">{stats.roles.length}</div>
          <div className="text-purple-200 text-xs mt-1">系统 {systemRoles} / 自定义 {customRoles}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="text-orange-100 text-sm mb-1">审计日志</div>
          <div className="text-3xl font-bold">{stats.logs.length}</div>
          <div className="text-orange-200 text-xs mt-1">备份 {stats.backups.length} 次</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 用户列表 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm mb-3">👤 用户概览</h3>
          <div className="space-y-2">
            {stats.users.map((u: any, i: number) => (
              <div key={u.id || i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {(u.realName || '?').slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{u.realName}</div>
                    <div className="text-xs text-gray-400">@{u.username}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {u.status === 'active' ? '正常' : u.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 最近审计日志 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm mb-3">📋 最近操作</h3>
          {recentLogs.length > 0 ? (
            <div className="space-y-2">
              {recentLogs.map((log: any, i: number) => (
                <div key={log.id || i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="text-lg mt-0.5">{log.action === 'login' ? '🔑' : log.action === 'create' ? '➕' : log.action === 'delete' ? '🗑️' : '📋'}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{log.realName || log.username} - {log.action}</div>
                    <div className="text-xs text-gray-400 truncate">{log.detail || log.module}</div>
                    <div className="text-xs text-gray-300 mt-0.5">{(log.timestamp || log.createdAt || '').slice(0, 19).replace('T', ' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">暂无操作日志</div>
          )}
        </div>
      </div>

      {/* 系统配置概览 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-sm mb-3">⚙️ 系统配置</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.configs.map((c: any, i: number) => (
            <div key={c.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium">{c.label || c.key}</div>
                <div className="text-xs text-gray-400">{c.key}</div>
              </div>
              <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
