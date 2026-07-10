import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, ArrowLeftRight, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface TransferOrder {
  id: string;
  code: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  status: string;
  transfer_date: string;
  operator_name: string;
  created_at: string;
  approved_at: string;
}

interface WarehouseData {
  id: string;
  code: string;
  name: string;
}

interface TransferItem {
  id: string;
  sku_id: string;
  material_id: string;
  qty: number;
  unit: string;
}

const STATUS_MAP = { pending: '待审批', approved: '已审批', completed: '已完成' };

export default function TransferPage() {
  const [orders, setOrders] = useState<TransferOrder[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [formData, setFormData] = useState({ from_warehouse_id: '', to_warehouse_id: '', operator_name: '' });
  const [items, setItems] = useState<TransferItem[]>([{ id: '1', sku_id: '', material_id: '', qty: 1, unit: '双' }]);

  useEffect(() => {
    Promise.all([
      fetch('/api/transfer-orders').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json())
    ]).then(([orderData, whData]) => {
      setOrders(Array.isArray(orderData) ? orderData : []);
      setWarehouses(Array.isArray(whData) ? whData.filter((w: any) => w.status === 'active') : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { id: String(Date.now()), sku_id: '', material_id: '', qty: 1, unit: '双' }]);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field as keyof TransferItem] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleCreate = async () => {
    if (!formData.from_warehouse_id || !formData.to_warehouse_id) {
      message.warning('请选择调出和调入仓库');
      return;
    }
    if (formData.from_warehouse_id === formData.to_warehouse_id) {
      message.warning('调出和调入仓库不能相同');
      return;
    }
    if (!items.some(i => i.sku_id || i.material_id)) {
      message.warning('请至少添加一个调拨物品');
      return;
    }

    try {
      await fetch('/api/transfer-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, items })
      });
      message.success('调拨单创建成功');
      setFormOpen(false);
      setItems([{ id: '1', sku_id: '', material_id: '', qty: 1, unit: '双' }]);
      setFormData({ from_warehouse_id: '', to_warehouse_id: '', operator_name: '' });
      fetch('/api/transfer-orders').then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('确定审批这个调拨单吗？')) return;
    try {
      await fetch(`/api/transfer-orders/${id}/approve`, { method: 'POST' });
      message.success('审批成功');
      fetch('/api/transfer-orders').then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const handleComplete = async (id: string) => {
    if (!window.confirm('确定完成调拨吗？')) return;
    try {
      await fetch(`/api/transfer-orders/${id}/complete`, { method: 'POST' });
      message.success('调拨完成');
      fetch('/api/transfer-orders').then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || '-';

  const filtered = orders.filter(o => {
    if (selectedStatus && o.status !== selectedStatus) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return o.code.toLowerCase().includes(kw) || getWarehouseName(o.from_warehouse_id).toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/warehouse" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center"><ArrowLeftRight className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">库存调拨</h1><p className="text-sm text-gray-500">仓库间库存转移</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="搜索调拨单号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setFormOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> 新建调拨</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">调拨单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">调出仓库</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">调入仓库</th>
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
                  <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><Warehouse className="w-3 h-3 text-gray-400" />{getWarehouseName(item.from_warehouse_id)}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><Warehouse className="w-3 h-3 text-gray-400" />{getWarehouseName(item.to_warehouse_id)}</span></td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.operator_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <button onClick={() => handleApprove(item.id)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">审批</button>
                      )}
                      {item.status === 'approved' && (
                        <button onClick={() => handleComplete(item.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">完成</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无调拨单</p>
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl m-4 p-6">
            <h2 className="text-lg font-semibold mb-6">新建调拨单</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">调出仓库 *</label><select value={formData.from_warehouse_id} onChange={(e) => setFormData({ ...formData, from_warehouse_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="">请选择仓库</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">调入仓库 *</label><select value={formData.to_warehouse_id} onChange={(e) => setFormData({ ...formData, to_warehouse_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="">请选择仓库</option>{warehouses.filter(w => w.id !== formData.from_warehouse_id).map(w => <option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">操作人</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">调拨明细</label></div>
              {items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div><input type="text" placeholder="SKU编码" value={item.sku_id} onChange={(e) => handleUpdateItem(index, 'sku_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div><input type="text" placeholder="物料编码" value={item.material_id} onChange={(e) => handleUpdateItem(index, 'material_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div><input type="number" placeholder="数量" value={item.qty} onChange={(e) => handleUpdateItem(index, 'qty', parseFloat(e.target.value) || 1)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleRemoveItem(index)} disabled={items.length === 1} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30">删除</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleAddItem} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm"><Plus className="w-4 h-4" /> 添加一行</button>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setFormOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button><button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">创建调拨单</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
