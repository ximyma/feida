import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Component {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
}

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Component | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', category: '', description: '' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await fetch('/api/components').then(r => r.json());
      setComponents(Array.isArray(data) ? data : []);
    } catch (e) { message.error('获取数据失败'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.name) { message.warning('请输入部件名称'); return; }
    try {
      if (editing) {
        await fetch(`/api/components/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        message.success('更新成功');
      } else {
        await fetch('/api/components', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        message.success('添加成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (e) { message.error('保存失败'); }
  };

  const handleEdit = (item: Component) => { setEditing(item); setFormData({ name: item.name, code: item.code || '', category: item.category || '', description: item.description || '' }); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除？')) return; try { await fetch(`/api/components/${id}`, { method: 'DELETE' }); message.success('删除成功'); fetchData(); } catch (e) { message.error('删除失败'); } };

  const filtered = components.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()) || c.code?.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/plm" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"><Box className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">部件库</h1><p className="text-sm text-gray-500">管理鞋面、鞋底、内里等部件</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <button onClick={() => { setEditing(null); setFormData({ name: '', code: '', category: '', description: '' }); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Plus className="w-4 h-4" /> 添加部件</button>
        </div>

        <div className="p-4">
          <table className="w-full">
            <thead><tr className="text-left text-sm text-gray-500 border-b"><th className="pb-3 font-medium">编码</th><th className="pb-3 font-medium">部件名称</th><th className="pb-3 font-medium">分类</th><th className="pb-3 font-medium">操作</th></tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-mono text-sm">{c.code || '-'}</td>
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">{c.category || '-'}</span></td>
                  <td className="py-3"><div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(c)} className="text-orange-600 hover:bg-orange-50 p-1 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && <div className="p-12 text-center text-gray-500"><Box className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>暂无部件数据</p></div>}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? '编辑部件' : '添加部件'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">部件编码</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">部件名称 *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="如：鞋面、鞋底、内里" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">分类</label><input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
