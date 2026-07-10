import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, MapPin, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Location {
  id: string;
  warehouse_id: string;
  code: string;
  row_no: string;
  shelf_no: string;
  level_no: string;
  area: number;
  capacity: number;
  status: string;
  remark: string;
  created_at: string;
}

interface WarehouseData {
  id: string;
  code: string;
  name: string;
}

const STATUS_MAP = { available: '可用', occupied: '占用', reserved: '预留', deleted: '已删除' };

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ warehouse_id: '', code: '', row_no: '', shelf_no: '', level_no: '', area: 0, capacity: 0, remark: '' });
  const [searchText, setSearchText] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  useEffect(() => {
    Promise.all([fetch('/api/locations').then(r => r.json()), fetch('/api/warehouses').then(r => r.json())])
      .then(([locData, whData]) => {
        setLocations(Array.isArray(locData) ? locData : []);
        setWarehouses(Array.isArray(whData) ? whData.filter((w: any) => w.status === 'active') : []);
      })
      .catch(() => message.error('获取数据失败'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!formData.warehouse_id || !formData.code) { message.warning('请选择仓库和填写货位编码'); return; }
    try {
      if (editing) {
        await fetch(`/api/locations/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        message.success('更新成功');
      } else {
        await fetch('/api/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        message.success('添加成功');
      }
      setModalOpen(false);
      setEditing(null);
      setFormData({ warehouse_id: '', code: '', row_no: '', shelf_no: '', level_no: '', area: 0, capacity: 0, remark: '' });
      fetch('/api/locations').then(r => r.json()).then(data => setLocations(Array.isArray(data) ? data : []));
    } catch (e) { message.error('保存失败'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个货位吗？')) return;
    try {
      await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetch('/api/locations').then(r => r.json()).then(data => setLocations(Array.isArray(data) ? data : []));
    } catch (e) { message.error('删除失败'); }
  };

  const handleEdit = (item: Location) => {
    setEditing(item);
    setFormData({
      warehouse_id: item.warehouse_id,
      code: item.code,
      row_no: item.row_no || '',
      shelf_no: item.shelf_no || '',
      level_no: item.level_no || '',
      area: item.area || 0,
      capacity: item.capacity || 0,
      remark: item.remark || ''
    });
    setModalOpen(true);
  };

  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || '-';

  const filtered = locations.filter(l => {
    if (selectedWarehouse && l.warehouse_id !== selectedWarehouse) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return l.code.toLowerCase().includes(kw) || getWarehouseName(l.warehouse_id).toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/warehouse" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">货位管理</h1><p className="text-sm text-gray-500">管理仓库货位信息</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="搜索货位..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div className="relative w-48">
              <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white">
                <option value="">全部仓库</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus className="w-4 h-4" /> 新增货位</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">所属仓库</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">货位编码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">货位位置</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">面积/容量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><Warehouse className="w-3 h-3 text-gray-400" />{getWarehouseName(item.warehouse_id)}</span></td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.row_no && `排:${item.row_no}`}
                    {item.shelf_no && ` 架:${item.shelf_no}`}
                    {item.level_no && ` 层:${item.level_no}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.area}m² / {item.capacity}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'available' ? 'bg-green-100 text-green-700' :
                      item.status === 'occupied' ? 'bg-yellow-100 text-yellow-700' :
                      item.status === 'reserved' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无货位数据</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? '编辑货位' : '新增货位'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">所属仓库 *</label><select value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"><option value="">请选择仓库</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">货位编码 *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="如: A01-01-01" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">排</label><input type="text" value={formData.row_no} onChange={(e) => setFormData({ ...formData, row_no: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">架</label><input type="text" value={formData.shelf_no} onChange={(e) => setFormData({ ...formData, shelf_no: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">层</label><input type="text" value={formData.level_no} onChange={(e) => setFormData({ ...formData, level_no: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">面积 (m²)</label><input type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">容量</label><input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button><button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">保存</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
