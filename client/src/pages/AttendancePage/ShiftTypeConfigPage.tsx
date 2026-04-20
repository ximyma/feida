import React, { useState, useEffect } from 'react';

const TABLE_NAME = 'shift_types';
const PAGE_TITLE = '班次配置';
const FIELDS = ["name","workStartTime","workEndTime","breakStartTime","breakEndTime","workHours","isActive"];

export default function ShifttypesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${TABLE_NAME}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error('获取数据失败', e);
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setForm({});
    setDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = editingItem 
        ? `/api/${TABLE_NAME}/${editingItem.id}`
        : `/api/${TABLE_NAME}`;
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        setDialogOpen(false);
        fetchData();
      } else {
        alert('保存失败');
      }
    } catch (e) {
      alert('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该记录吗？')) return;
    try {
      await fetch(`/api/${TABLE_NAME}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      alert('删除失败');
    }
  };

  const filtered = data.filter(item => {
    if (!search) return true;
    return JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
  });

  const columns = data.length > 0 ? Object.keys(data[0]).filter(c => !c.startsWith('_')) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{PAGE_TITLE}</h1>
          <p className="text-sm text-muted-foreground mt-1">共 {data.length} 条记录</p>
        </div>
        <button 
          onClick={openAddDialog}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          ➕ 新增
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="mb-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="搜索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 max-w-sm px-3 py-2 border border-input rounded-lg bg-background"
          />
          <button 
            onClick={fetchData}
            className="px-3 py-2 border border-input rounded-lg hover:bg-muted"
          >
            🔄 刷新
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">暂无数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.slice(0, 10).map(col => (
                    <th key={col} className="text-left p-3 font-medium">{col}</th>
                  ))}
                  <th className="text-left p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((item, i) => (
                  <tr key={item.id || i} className="border-b hover:bg-muted/30">
                    {columns.slice(0, 10).map(col => (
                      <td key={col} className="p-3">
                        {typeof item[col] === 'boolean' 
                          ? (item[col] ? '✓' : '✕')
                          : String(item[col] || '-').slice(0, 30)}
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditDialog(item)}
                          className="text-primary hover:underline text-xs"
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:underline text-xs"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDialogOpen(false)}>
          <div className="bg-card rounded-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingItem ? '编辑' : '新增'}</h2>
              <button onClick={() => setDialogOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map(field => (
                <div key={field}>
                  <label className="block text-sm text-muted-foreground mb-1">{field}</label>
                  <input
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                    value={form[field] || ''}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    placeholder={field}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-input rounded-lg hover:bg-muted">
                取消
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
