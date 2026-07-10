import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, MapPin, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: string;
  location: string;
  area: number;
  capacity: number;
  manager_name: string;
  status: string;
  remark: string;
  created_at: string;
}

const WAREHOUSE_TYPES = { raw: '原材料仓', wip: '半成品仓', finished: '成品仓', tool: '工具仓' };

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', type: 'raw', location: '', area: 0, capacity: 0, manager_name: '', remark: '' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await fetch('/api/warehouses').then(r => r.json());
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (e) { message.error('获取数据失败'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) { message.warning('请填写仓库编码和名称'); return; }
    try {
      if (editing) {
        await fetch(`/api/warehouses/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        message.success('更新成功');
      } else {
        await fetch('/api/warehouses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        message.success('添加成功');
      }
      setModalOpen(false);
      setEditing(null);
      setFormData({ code: '', name: '', type: 'raw', location: '', area: 0, capacity: 0, manager_name: '', remark: '' });
      fetchData();
    } catch (e) { message.error('保存失败'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个仓库吗？')) return;
    try {
      await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch (e) { message.error('删除失败'); }
  };

  const handleEdit = (item: Warehouse) => {
    setEditing(item);
    setFormData({
      code: item.code,
      name: item.name,
      type: item.type,
      location: item.location || '',
      area: item.area || 0,
      capacity: item.capacity || 0,
      manager_name: item.manager_name || '',
      remark: item.remark || ''
    });
    setModalOpen(true);
  };

  const filtered = warehouses.filter(w => 
    w.code.toLowerCase().includes(searchText.toLowerCase()) ||
    w.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/warehouse" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">仓库档案</h1><p className="text-sm text-gray-500">管理仓库基本信息</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="搜索仓库..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> 新增仓库</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库编码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">位置</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">面积/容量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">负责人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{WAREHOUSE_TYPES[item.type as keyof typeof WAREHOUSE_TYPES] || item.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1 text-gray-600"><MapPin className="w-3 h-3" />{item.location}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.area}m² / {item.capacity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.manager_name || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.status === 'active' ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无仓库数据</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? '编辑仓库' : '新增仓库'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">仓库编码 *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="如: WH001" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">仓库名称 *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="如: 一号原材料仓" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">仓库类型</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">{Object.entries(WAREHOUSE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">位置</label><input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="如: A栋1楼" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">面积 (m²)</label><input type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">容量</label><input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">负责人</label><input type="text" value={formData.manager_name} onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button><button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
