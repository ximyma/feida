import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface ScrapRule {
  id: string;
  rule_type: string;
  target_id: string;
  order_qty_min: number;
  order_qty_max: number;
  material_loss_rate: number;
  process_loss_rate: number;
  description: string;
}

export default function ScrapRulesPage() {
  const [rules, setRules] = useState<ScrapRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScrapRule | null>(null);
  const [formData, setFormData] = useState({ rule_type: 'material', target_id: '', order_qty_min: 0, order_qty_max: 999999, material_loss_rate: 0, process_loss_rate: 0, description: '' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const data = await fetch('/api/scrap-rules').then(r => r.json()); setRules(Array.isArray(data) ? data : []); }
    catch (e) { message.error('获取数据失败'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (editing) { await fetch(`/api/scrap-rules/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); message.success('更新成功'); }
      else { await fetch('/api/scrap-rules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); message.success('添加成功'); }
      setModalOpen(false); fetchData();
    } catch (e) { message.error('保存失败'); }
  };

  const handleEdit = (item: ScrapRule) => { setEditing(item); setFormData({ rule_type: item.rule_type, target_id: item.target_id || '', order_qty_min: item.order_qty_min, order_qty_max: item.order_qty_max, material_loss_rate: item.material_loss_rate, process_loss_rate: item.process_loss_rate, description: item.description || '' }); setModalOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm('确定删除？')) return; try { await fetch(`/api/scrap-rules/${id}`, { method: 'DELETE' }); message.success('删除成功'); fetchData(); } catch (e) { message.error('删除失败'); } };

  const filtered = rules.filter(r => !searchText || r.description?.toLowerCase().includes(searchText.toLowerCase()));

  const RULE_TYPES = [
    { value: 'material', label: '物料损耗' },
    { value: 'process', label: '工艺损耗' },
    { value: 'order_material', label: '订单物料损耗' },
    { value: 'order_process', label: '订单工艺损耗' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/plm" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">损耗规则</h1><p className="text-sm text-gray-500">配置物料和工艺的损耗率</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="搜索..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <button onClick={() => { setEditing(null); setFormData({ rule_type: 'material', target_id: '', order_qty_min: 0, order_qty_max: 999999, material_loss_rate: 0, process_loss_rate: 0, description: '' }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Plus className="w-4 h-4" /> 添加规则</button>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead><tr className="text-left text-sm text-gray-500 border-b"><th className="pb-3 font-medium">规则类型</th><th className="pb-3 font-medium">订单量区间</th><th className="pb-3 font-medium">物料损耗率</th><th className="pb-3 font-medium">工艺损耗率</th><th className="pb-3 font-medium">操作</th></tr></thead>
            <tbody>
              {filtered.map((r) => {
                const typeInfo = RULE_TYPES.find(t => t.value === r.rule_type);
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">{typeInfo?.label || r.rule_type}</span></td>
                    <td className="py-3 text-gray-500">{r.order_qty_min} - {r.order_qty_max}</td>
                    <td className="py-3 text-gray-500">{r.material_loss_rate}%</td>
                    <td className="py-3 text-gray-500">{r.process_loss_rate}%</td>
                    <td className="py-3"><div className="flex items-center gap-2"><button onClick={() => handleEdit(r)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDelete(r.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && <div className="p-12 text-center text-gray-500"><AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>暂无规则数据</p></div>}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? '编辑规则' : '添加规则'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">规则类型</label><select value={formData.rule_type} onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">{RULE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">订单量下限</label><input type="number" value={formData.order_qty_min} onChange={(e) => setFormData({ ...formData, order_qty_min: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">订单量上限</label><input type="number" value={formData.order_qty_max} onChange={(e) => setFormData({ ...formData, order_qty_max: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">物料损耗率(%)</label><input type="number" value={formData.material_loss_rate} onChange={(e) => setFormData({ ...formData, material_loss_rate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">工艺损耗率(%)</label><input type="number" value={formData.process_loss_rate} onChange={(e) => setFormData({ ...formData, process_loss_rate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button><button onClick={handleSave} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">保存</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
