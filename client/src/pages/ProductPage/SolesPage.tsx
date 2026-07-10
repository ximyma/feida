import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, CircleDot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Sole {
  id: string;
  code: string;
  name: string;
  sole_type: string;
  material: string;
  color: string;
  mold_no: string;
  unit_price: number;
  status: string;
}

export default function SolesPage() {
  const [soles, setSoles] = useState<Sole[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sole | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', sole_type: '', material: '', color: '', mold_no: '', unit_price: 0, description: '' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const data = await fetch('/api/soles').then(r => r.json()); setSoles(Array.isArray(data) ? data : []); }
    catch (e) { message.error('获取数据失败'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.name) { message.warning('请输入大底名称'); return; }
    try {
      if (editing) { await fetch(`/api/soles/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); message.success('更新成功'); }
      else { await fetch('/api/soles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); message.success('添加成功'); }
      setModalOpen(false); fetchData();
    } catch (e) { message.error('保存失败'); }
  };

  const handleEdit = (item: Sole) => { setEditing(item); setFormData({ code: item.code || '', name: item.name, sole_type: item.sole_type || '', material: item.material || '', color: item.color || '', mold_no: item.mold_no || '', unit_price: item.unit_price || 0, description: item.description || '' }); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除？')) return; try { await fetch(`/api/soles/${id}`, { method: 'DELETE' }); message.success('删除成功'); fetchData(); } catch (e) { message.error('删除失败'); } };

  const filtered = soles.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()) || s.code?.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/plm" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center"><CircleDot className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">大底资料库</h1><p className="text-sm text-gray-500">管理鞋底型号、模具、材质（制鞋行业专项）</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="搜索大底..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <button onClick={() => { setEditing(null); setFormData({ code: '', name: '', sole_type: '', material: '', color: '', mold_no: '', unit_price: 0, description: '' }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> 添加大底</button>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead><tr className="text-left text-sm text-gray-500 border-b"><th className="pb-3 font-medium">编码</th><th className="pb-3 font-medium">名称</th><th className="pb-3 font-medium">类型</th><th className="pb-3 font-medium">材质</th><th className="pb-3 font-medium">模具号</th><th className="pb-3 font-medium">单价</th><th className="pb-3 font-medium">操作</th></tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-mono text-sm">{s.code || '-'}</td>
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{s.sole_type || '-'}</span></td>
                  <td className="py-3 text-gray-500">{s.material || '-'}</td>
                  <td className="py-3 text-gray-500 font-mono">{s.mold_no || '-'}</td>
                  <td className="py-3 text-gray-500">¥{s.unit_price || 0}</td>
                  <td className="py-3"><div className="flex items-center gap-2"><button onClick={() => handleEdit(s)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(s.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && <div className="p-12 text-center text-gray-500"><CircleDot className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>暂无大底数据</p></div>}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? '编辑大底' : '添加大底'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">编码</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">类型</label><input type="text" value={formData.sole_type} onChange={(e) => setFormData({ ...formData, sole_type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="如：MD底、橡胶底" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">材质</label><input type="text" value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">模具号</label><input type="text" value={formData.mold_no} onChange={(e) => setFormData({ ...formData, mold_no: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">单价(元)</label><input type="number" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button><button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">保存</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
