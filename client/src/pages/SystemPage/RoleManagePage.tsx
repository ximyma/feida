import React, { useState, useEffect } from 'react';

const TABLE = 'roles';
const TITLE = '角色权限';

export default function RoleManagePage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>(['*']);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, p, s] = await Promise.all([
        fetch(`/api/${TABLE}`).then(r => r.json()),
        fetch('/api/permissions').then(r => r.json()),
        fetch('/api/rbac/sites').then(r => r.json()).catch(() => []),
      ]);
      setRoles(Array.isArray(r) ? r : []);
      setPermissions(Array.isArray(p) ? p : []);
      setSites(Array.isArray(s) ? s : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const parseSites = (v: any): string[] => {
    try {
      const a = Array.isArray(v) ? v : (typeof v === 'string' ? JSON.parse(v) : []);
      return Array.isArray(a) && a.length ? a : ['*'];
    } catch { return ['*']; }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm({ name: '', code: '', type: 'custom', description: '', isActive: true });
    setSelectedPerms([]);
    setSelectedSites(['*']);
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setForm({ ...item });
    try {
      const perms = Array.isArray(item.permissionIds) ? item.permissionIds : (typeof item.permissionIds === 'string' ? JSON.parse(item.permissionIds) : []);
      setSelectedPerms(perms);
    } catch { setSelectedPerms([]); }
    setSelectedSites(parseSites(item.siteScope));
    setDialogOpen(true);
  };

  // 切换站点：选择'全部站点'与具体站点互斥
  const toggleSite = (code: string) => {
    if (code === '*') { setSelectedSites(['*']); return; }
    setSelectedSites(prev => {
      const base = prev.filter(s => s !== '*');
      const next = base.includes(code) ? base.filter(s => s !== code) : [...base, code];
      return next.length ? next : ['*'];
    });
  };

  const handleSave = async () => {
    try {
      const body: Record<string, any> = { ...form, permissionIds: JSON.stringify(selectedPerms), siteScope: JSON.stringify(selectedSites.length ? selectedSites : ['*']) };
      if (editingItem) {
        await fetch(`/api/${TABLE}/${editingItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        body.id = `${TABLE.slice(0, 3)}_${Date.now()}`;
        body.createdAt = new Date().toISOString();
        await fetch(`/api/${TABLE}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`确定删除角色「${item.name}」？`)) return;
    try {
      await fetch(`/api/${TABLE}/${item.id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const togglePerm = (permId: string) => {
    setSelectedPerms(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  const filtered = roles.filter((r: any) => !search || r.name?.includes(search) || r.code?.includes(search));

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">共 {filtered.length} 个角色</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">+ 添加角色</button>
      </div>

      <div className="relative">
        <input type="text" placeholder="搜索角色名称..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => {
            try {
              var perms = Array.isArray(r.permissionIds) ? r.permissionIds : (typeof r.permissionIds === 'string' ? JSON.parse(r.permissionIds) : []);
            } catch { perms = []; }
            return (
              <div key={r.id || i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base">{r.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{r.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.type === 'system' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {r.type === 'system' ? '系统' : '自定义'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${r.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{r.description || '暂无描述'}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {perms.slice(0, 5).map((p: string) => (
                    <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{p}</span>
                  ))}
                  {perms.length > 5 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">+{perms.length - 5}</span>}
                </div>
                <p className="text-xs text-gray-400 mb-1">{perms.length} 个权限</p>
                <p className="text-xs text-gray-400 mb-3">站点：{parseSites(r.siteScope).includes('*') ? '全部站点' : parseSites(r.siteScope).map((c: string) => (sites.find((s: any) => s.code === c)?.name || c)).join('、')}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(r)} className="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200">编辑权限</button>
                  {r.type !== 'system' && (
                    <button onClick={() => handleDelete(r)} className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200">删除</button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">暂无角色</div>}
        </div>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editingItem ? '编辑角色' : '添加角色'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>角色名称 *</label>
                  <input className={inputCls} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="如：HR管理员" />
                </div>
                <div>
                  <label className={labelCls}>角色编码 *</label>
                  <input className={inputCls} value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="如：hr_admin" />
                </div>
              </div>
              <div>
                <label className={labelCls}>描述</label>
                <input className={inputCls} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="角色描述" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>类型</label>
                  <select className={inputCls} value={form.type || 'custom'} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="system">系统角色</option>
                    <option value="custom">自定义角色</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>状态</label>
                  <select className={inputCls} value={form.isActive !== false ? 'true' : 'false'} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                    <option value="true">启用</option>
                    <option value="false">禁用</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>站点范围（站点级权限 scope）</label>
                <div className="flex flex-wrap gap-2 mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${selectedSites.includes('*') ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100 border border-transparent'}`}>
                    <input type="checkbox" checked={selectedSites.includes('*')} onChange={() => toggleSite('*')} className="rounded" />
                    全部站点
                  </label>
                  {sites.map((s: any) => (
                    <label key={s.code} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${selectedSites.includes(s.code) ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100 border border-transparent'}`}>
                      <input type="checkbox" checked={selectedSites.includes(s.code)} onChange={() => toggleSite(s.code)} className="rounded" />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>权限配置（已选 {selectedPerms.length} 项）</label>
                <div className="grid grid-cols-3 gap-2 mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  {permissions.map((p: any) => (
                    <label key={p.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedPerms.includes(p.id) ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100 border border-transparent'}`}>
                      <input type="checkbox" checked={selectedPerms.includes(p.id)} onChange={() => togglePerm(p.id)} className="rounded" />
                      <div>
                        <div className="text-sm font-medium">{p.name || p.module || p.id}</div>
                        <div className="text-xs text-gray-400">{p.id}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
