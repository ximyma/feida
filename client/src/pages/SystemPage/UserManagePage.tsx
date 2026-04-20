import React, { useState, useEffect } from 'react';

const TABLE = 'users';
const TITLE = '用户管理';

const TYPE_MAP: Record<string, string> = { super_admin: '超级管理员', tech_admin: '技术管理员', employee: '普通员工' };
const STATUS_MAP: Record<string, string> = { active: '正常', inactive: '停用', locked: '锁定', pending: '待激活' };

export default function UserManagePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${TABLE}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm({ username: '', realName: '', phone: '', email: '', password: '', userType: 'employee', roleIds: '[]', status: 'active' });
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setForm({ ...item, password: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const body = { ...form };
      if (editingItem) {
        // 编辑时不更新密码（除非手动输入了新密码）
        if (!body.password) delete body.password;
        await fetch(`/api/${TABLE}/${editingItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        if (!body.password) { alert('请输入密码'); return; }
        body.id = `user_${Date.now()}`;
        body.createdAt = new Date().toISOString();
        await fetch(`/api/${TABLE}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`确定删除用户「${item.realName}」？`)) return;
    try {
      await fetch(`/api/${TABLE}/${item.id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleResetPwd = async (item: any) => {
    if (!confirm(`确定重置「${item.realName}」的密码为 123456？`)) return;
    try {
      // 简单hash计算
      let hash = 0;
      for (let i = 0; i < '123456'.length; i++) { hash = ((hash << 5) - hash) + '123456'.charCodeAt(i); hash = hash & hash; }
      await fetch(`/api/${TABLE}/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: String(hash) }) });
      alert('密码已重置为 123456');
    } catch (e) { console.error(e); }
  };

  const filtered = data.filter((u: any) =>
    !search || u.username?.includes(search) || u.realName?.includes(search) || u.phone?.includes(search)
  );

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">共 {filtered.length} 条记录</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">+ 添加用户</button>
      </div>

      <div className="relative">
        <input type="text" placeholder="搜索用户名、姓名、手机号..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600">用户名</th>
                  <th className="text-left p-3 font-medium text-gray-600">姓名</th>
                  <th className="text-left p-3 font-medium text-gray-600">手机号</th>
                  <th className="text-left p-3 font-medium text-gray-600">邮箱</th>
                  <th className="text-left p-3 font-medium text-gray-600">用户类型</th>
                  <th className="text-left p-3 font-medium text-gray-600">状态</th>
                  <th className="text-left p-3 font-medium text-gray-600">创建时间</th>
                  <th className="text-center p-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id || i} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono text-xs">{u.username}</td>
                    <td className="p-3 font-medium">{u.realName}</td>
                    <td className="p-3 text-xs">{u.phone || '-'}</td>
                    <td className="p-3 text-xs text-gray-500">{u.email || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.userType === 'super_admin' ? 'bg-purple-100 text-purple-700' : u.userType === 'tech_admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {TYPE_MAP[u.userType] || u.userType}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-700' : u.status === 'locked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_MAP[u.status] || u.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">{u.createdAt ? u.createdAt.slice(0, 10) : '-'}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(u)} className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded">编辑</button>
                        <button onClick={() => handleResetPwd(u)} className="px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded">重置密码</button>
                        <button onClick={() => handleDelete(u)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">暂无数据</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 弹窗 */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editingItem ? '编辑用户' : '添加用户'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>用户名 *</label>
                <input className={inputCls} value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="请输入用户名" />
              </div>
              <div>
                <label className={labelCls}>姓名 *</label>
                <input className={inputCls} value={form.realName || ''} onChange={e => setForm({ ...form, realName: e.target.value })} placeholder="请输入姓名" />
              </div>
              <div>
                <label className={labelCls}>手机号</label>
                <input className={inputCls} value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="请输入手机号" />
              </div>
              <div>
                <label className={labelCls}>邮箱</label>
                <input className={inputCls} value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="请输入邮箱" />
              </div>
              <div>
                <label className={labelCls}>{editingItem ? '新密码（留空不修改）' : '密码 *'}</label>
                <input type="password" className={inputCls} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editingItem ? '留空则不修改' : '请输入密码'} />
              </div>
              <div>
                <label className={labelCls}>用户类型</label>
                <select className={inputCls} value={form.userType || 'employee'} onChange={e => setForm({ ...form, userType: e.target.value })}>
                  <option value="employee">普通员工</option>
                  <option value="tech_admin">技术管理员</option>
                  <option value="super_admin">超级管理员</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>状态</label>
                <select className={inputCls} value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">正常</option>
                  <option value="inactive">停用</option>
                  <option value="locked">锁定</option>
                  <option value="pending">待激活</option>
                </select>
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
