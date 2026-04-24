import React, { useState, useEffect } from 'react';

export default function SystemPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'config'>('users');

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/roles').then(r => r.json()),
      fetch('/api/system_config').then(r => r.json()),
    ]).then(([u, ro, c]) => {
      setUsers(Array.isArray(u) ? u : []);
      setRoles(Array.isArray(ro) ? ro : []);
      setConfigs(Array.isArray(c) ? c : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'users', label: '👤 用户管理', count: users.length },
    { key: 'roles', label: '🎭 角色权限', count: roles.length },
    { key: 'config', label: '⚙️ 系统配置', count: configs.length },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">⚙️ 系统管理</h1>
        <p className="text-sm text-muted-foreground mt-1">用户管理、角色权限、系统配置、数据管理和审计日志</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-card shadow-sm' : 'hover:bg-muted'}`}>
            {tab.label} <span className="ml-1 text-xs text-muted-foreground">({tab.count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : (
        <>
          {activeTab === 'users' && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">用户列表</h2>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">+ 添加用户</button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {['用户名', '姓名', '手机号', '邮箱', '用户类型', '状态'].map(h => (
                      <th key={h} className="text-left p-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id || i} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs">{u.username}</td>
                      <td className="p-3 font-medium">{u.realName}</td>
                      <td className="p-3 text-xs">{u.phone || '-'}</td>
                      <td className="p-3 text-xs">{u.email || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${u.userType === 'super_admin' ? 'bg-purple-100 text-purple-700' : u.userType === 'tech_admin' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                          {{super_admin: '超级管理员', tech_admin: '技术管理员', employee: '员工'}[u.userType as keyof {super_admin:string;tech_admin:string;employee:string}] || u.userType}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${u.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {{active: '正常', inactive: '停用', locked: '锁定', pending: '待激活'}[u.status as keyof {active:string;inactive:string;locked:string;pending:string}] || u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">角色列表</h2>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">+ 添加角色</button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {['角色名称', '编码', '类型', '权限数量', '状态', '描述'].map(h => (
                      <th key={h} className="text-left p-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r, i) => {
                    const perms = Array.isArray(r.permissionIds) ? r.permissionIds : (typeof r.permissionIds === 'string' ? JSON.parse(r.permissionIds) : []);
                    return (
                      <tr key={r.id || i} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">{r.name}</td>
                        <td className="p-3 font-mono text-xs">{r.code}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${r.type === 'system' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}>{r.type === 'system' ? '系统' : '自定义'}</span>
                        </td>
                        <td className="p-3">{perms.length} 个</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${r.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{r.isActive ? '启用' : '禁用'}</span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{r.description || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">系统配置</h2>
              </div>
              <div className="divide-y">
                {configs.map((c, i) => (
                  <div key={c.id || i} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div>
                      <div className="font-medium text-sm">{c.label}</div>
                      <div className="text-xs text-muted-foreground">{c.key}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm bg-muted px-3 py-1 rounded font-mono">{c.value}</span>
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded">{c.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
