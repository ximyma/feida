import React, { useState, useEffect } from 'react';

const TABLE = 'system_config';
const TITLE = '系统配置';

const CATEGORY_COLORS: Record<string, string> = {
  'basic': 'bg-blue-100 text-blue-700',
  'attendance': 'bg-green-100 text-green-700',
  'salary': 'bg-yellow-100 text-yellow-700',
  'system': 'bg-purple-100 text-purple-700',
  'general': 'bg-gray-100 text-gray-600',
};

export default function SystemConfigPage() {
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
    setForm({ key: '', label: '', value: '', type: 'string', category: 'general', description: '' });
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await fetch(`/api/${TABLE}/${editingItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      } else {
        const body = { ...form, id: `${TABLE.slice(0, 3)}_${Date.now()}`, createdAt: new Date().toISOString() };
        await fetch(`/api/${TABLE}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`确定删除配置「${item.label}」？`)) return;
    try {
      await fetch(`/api/${TABLE}/${item.id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const filtered = data.filter((c: any) =>
    !search || c.key?.includes(search) || c.label?.includes(search) || c.value?.includes(search)
  );

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">共 {filtered.length} 项配置</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">+ 添加配置</button>
      </div>

      <div className="relative">
        <input type="text" placeholder="搜索配置键名、标签或值..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y">
            {filtered.map((c, i) => (
              <div key={c.id || i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">⚙️</div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{c.label || c.key}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.key}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-lg font-mono max-w-[200px] truncate">{c.value}</span>
                  {c.category && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[c.category] || CATEGORY_COLORS.general}`}>
                      {c.category}
                    </span>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(c)} className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded">编辑</button>
                    <button onClick={() => handleDelete(c)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">删除</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-gray-400">暂无配置</div>}
          </div>
        </div>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editingItem ? '编辑配置' : '添加配置'}</h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>配置键名 *</label>
                <input className={inputCls} value={form.key || ''} onChange={e => setForm({ ...form, key: e.target.value })} placeholder="如：company_name" />
              </div>
              <div>
                <label className={labelCls}>显示名称 *</label>
                <input className={inputCls} value={form.label || ''} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="如：公司名称" />
              </div>
              <div>
                <label className={labelCls}>配置值 *</label>
                <textarea className={inputCls + ' min-h-[80px]'} value={form.value || ''} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="配置值" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>值类型</label>
                  <select className={inputCls} value={form.type || 'string'} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="string">字符串</option>
                    <option value="number">数字</option>
                    <option value="boolean">布尔值</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>分类</label>
                  <select className={inputCls} value={form.category || 'general'} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="general">通用</option>
                    <option value="basic">基础</option>
                    <option value="attendance">考勤</option>
                    <option value="salary">薪资</option>
                    <option value="system">系统</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>描述</label>
                <input className={inputCls} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="配置说明" />
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
