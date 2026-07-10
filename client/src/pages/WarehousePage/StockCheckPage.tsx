import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, CheckSquare, Warehouse, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface StockCheck {
  id: string;
  code: string;
  warehouse_id: string;
  location_id: string;
  status: string;
  check_date: string;
  operator_name: string;
  created_at: string;
  completed_at: string;
}

interface WarehouseData {
  id: string;
  code: string;
  name: string;
}

interface LocationData {
  id: string;
  code: string;
}

const STATUS_MAP = { draft: '草稿', in_progress: '盘点中', completed: '已完成' };

export default function StockCheckPage() {
  const [checks, setChecks] = useState<StockCheck[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ warehouse_id: '', location_id: '', operator_name: '' });
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/stock-checks').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
      fetch('/api/locations').then(r => r.json())
    ]).then(([checkData, whData, locData]) => {
      setChecks(Array.isArray(checkData) ? checkData : []);
      setWarehouses(Array.isArray(whData) ? whData.filter((w: any) => w.status === 'active') : []);
      setLocations(Array.isArray(locData) ? locData.filter((l: any) => l.status !== 'deleted') : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!formData.warehouse_id) { message.warning('请选择仓库'); return; }
    try {
      const res = await fetch('/api/stock-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      message.success('盘点单创建成功');
      setModalOpen(false);
      setFormData({ warehouse_id: '', location_id: '', operator_name: '' });
      fetch('/api/stock-checks').then(r => r.json()).then(data => setChecks(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleComplete = async (id: string) => {
    if (!window.confirm('确定完成盘点吗？')) return;
    try {
      await fetch(`/api/stock-checks/${id}/complete`, { method: 'POST' });
      message.success('盘点完成');
      fetch('/api/stock-checks').then(r => r.json()).then(data => setChecks(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || '-';
  const getLocationCode = (id: string) => locations.find(l => l.id === id)?.code || '-';

  const filtered = checks.filter(c => {
    if (selectedStatus && c.status !== selectedStatus) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return c.code.toLowerCase().includes(kw) || getWarehouseName(c.warehouse_id).toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/warehouse" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center"><CheckSquare className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">库存盘点</h1><p className="text-sm text-gray-500">盘点单管理与执行</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="搜索盘点单号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" /></div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"><Plus className="w-4 h-4" /> 新建盘点</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">盘点单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">货位</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">创建时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><Warehouse className="w-3 h-3 text-gray-400" />{getWarehouseName(item.warehouse_id)}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" />{getLocationCode(item.location_id)}</span></td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.operator_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status !== 'completed' && (
                        <button onClick={() => handleComplete(item.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">完成盘点</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无盘点单</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">新建盘点单</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">仓库 *</label><select value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"><option value="">请选择仓库</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">货位</label><select value={formData.location_id} onChange={(e) => setFormData({ ...formData, location_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"><option value="">全部货位</option>{locations.filter(l => !l.warehouse_id || l.warehouse_id === formData.warehouse_id).map(l => <option key={l.id} value={l.id}>{l.code}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">操作人</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button><button onClick={handleCreate} className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">创建</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
