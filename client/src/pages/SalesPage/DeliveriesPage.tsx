import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Truck, Package, CheckCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Delivery {
  id: string;
  code: string;
  order_id: string;
  order_code: string;
  warehouse_id: string;
  warehouse_name: string;
  delivery_date: string;
  carrier: string;
  tracking_no: string;
  status: string;
  total_qty: number;
  operator_name: string;
  created_at: string;
}

interface SalesOrder {
  id: string;
  code: string;
  customer_name: string;
}

interface WarehouseData {
  id: string;
  code: string;
  name: string;
}

const STATUS_MAP = { pending: '待发货', shipped: '已发货', delivered: '已签收' };

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [formData, setFormData] = useState({ 
    order_id: '', warehouse_id: '', delivery_date: '', 
    carrier: '', tracking_no: '', remark: '', operator_name: '' 
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/deliveries').then(r => r.json()),
      fetch('/api/sales-orders').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json())
    ]).then(([deliveryData, orderData, warehouseData]) => {
      setDeliveries(Array.isArray(deliveryData) ? deliveryData : []);
      setOrders(Array.isArray(orderData) ? orderData.filter((o: any) => o.status === 'approved') : []);
      setWarehouses(Array.isArray(warehouseData) ? warehouseData.filter((w: any) => w.status === 'active') : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!formData.order_id || !formData.warehouse_id) {
      message.warning('请选择订单和仓库');
      return;
    }
    try {
      await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success('发货单创建成功');
      setModalOpen(false);
      setFormData({ order_id: '', warehouse_id: '', delivery_date: '', carrier: '', tracking_no: '', remark: '', operator_name: '' });
      fetch('/api/deliveries').then(r => r.json()).then(data => setDeliveries(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleShip = async (id: string) => {
    if (!window.confirm('确定发货吗？')) return;
    try {
      await fetch(`/api/deliveries/${id}/ship`, { method: 'POST' });
      message.success('发货成功');
      fetch('/api/deliveries').then(r => r.json()).then(data => setDeliveries(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const handleComplete = async (id: string) => {
    if (!window.confirm('确定完成签收吗？')) return;
    try {
      await fetch(`/api/deliveries/${id}/complete`, { method: 'POST' });
      message.success('签收成功');
      fetch('/api/deliveries').then(r => r.json()).then(data => setDeliveries(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const getOrderInfo = (id: string) => orders.find(o => o.id === id);
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || '-';

  const filtered = deliveries.filter(d => {
    if (selectedStatus && d.status !== selectedStatus) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return d.code.toLowerCase().includes(kw) || getOrderInfo(d.order_id)?.customer_name?.toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/sales" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">发货管理</h1><p className="text-sm text-gray-500">发货单与物流跟踪</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索发货单号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"><Plus className="w-4 h-4" /> 新建发货</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">发货单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">订单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">客户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">发货仓库</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">物流公司</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">运单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => {
                const order = getOrderInfo(item.order_id);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order?.code || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order?.customer_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{getWarehouseName(item.warehouse_id)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.carrier || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.tracking_no || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.total_qty}双</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        item.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.status === 'pending' && (
                          <button onClick={() => handleShip(item.id)} className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700"><Send className="w-3 h-3" /> 发货</button>
                        )}
                        {item.status === 'shipped' && (
                          <button onClick={() => handleComplete(item.id)} className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"><CheckCircle className="w-3 h-3" /> 签收</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无发货单</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">新建发货单</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">销售订单 *</label><select value={formData.order_id} onChange={(e) => setFormData({ ...formData, order_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"><option value="">请选择订单</option>{orders.map(o => <option key={o.id} value={o.id}>{o.code} - {o.customer_name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">发货仓库 *</label><select value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"><option value="">请选择仓库</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">发货日期</label><input type="date" value={formData.delivery_date} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">物流公司</label><input type="text" value={formData.carrier} onChange={(e) => setFormData({ ...formData, carrier: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">运单号</label><input type="text" value={formData.tracking_no} onChange={(e) => setFormData({ ...formData, tracking_no: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">操作人</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" rows={3} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">创建发货单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
