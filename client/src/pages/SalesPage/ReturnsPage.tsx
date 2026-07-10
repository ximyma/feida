import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, RefreshCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Return {
  id: string;
  code: string;
  order_id: string;
  order_code: string;
  customer_id: string;
  customer_name: string;
  return_date: string;
  reason: string;
  status: string;
  total_amount: number;
  operator_name: string;
  created_at: string;
}

interface CustomerData {
  id: string;
  code: string;
  name: string;
}

interface SalesOrder {
  id: string;
  code: string;
  customer_name: string;
}

const STATUS_MAP = { pending: '待审核', approved: '已审核', completed: '已完成' };

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [formData, setFormData] = useState({ 
    order_id: '', customer_id: '', customer_name: '', return_date: '', 
    reason: '', remark: '', operator_name: '' 
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/returns').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/sales-orders').then(r => r.json())
    ]).then(([returnData, customerData, orderData]) => {
      setReturns(Array.isArray(returnData) ? returnData : []);
      setCustomers(Array.isArray(customerData) ? customerData.filter((c: any) => c.status === 'active') : []);
      setOrders(Array.isArray(orderData) ? orderData.filter((o: any) => o.status === 'completed' || o.status === 'shipping') : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleCustomerChange = (id: string) => {
    const customer = customers.find(c => c.id === id);
    setFormData({ ...formData, customer_id: id, customer_name: customer?.name || '' });
  };

  const handleSubmit = async () => {
    if (!formData.customer_id) {
      message.warning('请选择客户');
      return;
    }
    try {
      await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success('退货单创建成功');
      setModalOpen(false);
      setFormData({ order_id: '', customer_id: '', customer_name: '', return_date: '', reason: '', remark: '', operator_name: '' });
      fetch('/api/returns').then(r => r.json()).then(data => setReturns(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('确定审核通过这个退货申请吗？')) return;
    try {
      await fetch(`/api/returns/${id}/approve`, { method: 'POST' });
      message.success('审核成功');
      fetch('/api/returns').then(r => r.json()).then(data => setReturns(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const handleComplete = async (id: string) => {
    if (!window.confirm('确定完成退货处理吗？')) return;
    try {
      await fetch(`/api/returns/${id}/complete`, { method: 'POST' });
      message.success('处理完成');
      fetch('/api/returns').then(r => r.json()).then(data => setReturns(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || '-';
  const getOrderCode = (id: string) => orders.find(o => o.id === id)?.code || '-';

  const filtered = returns.filter(r => {
    if (selectedStatus && r.status !== selectedStatus) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return r.code.toLowerCase().includes(kw) || r.customer_name?.toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/sales" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center"><RefreshCcw className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">退货管理</h1><p className="text-sm text-gray-500">退货申请与处理</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索退货单号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Plus className="w-4 h-4" /> 新建退货</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">退货单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">订单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">客户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">退货日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">退货原因</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">金额</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{getOrderCode(item.order_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.customer_name || getCustomerName(item.customer_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.return_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.reason || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">¥{item.total_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <button onClick={() => handleApprove(item.id)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">审核</button>
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
              <RefreshCcw className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无退货申请</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">新建退货单</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">客户 *</label><select value={formData.customer_id} onChange={(e) => handleCustomerChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"><option value="">请选择客户</option>{customers.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">关联订单</label><select value={formData.order_id} onChange={(e) => setFormData({ ...formData, order_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"><option value="">请选择订单</option>{orders.map(o => <option key={o.id} value={o.id}>{o.code} - {o.customer_name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">退货日期</label><input type="date" value={formData.return_date} onChange={(e) => setFormData({ ...formData, return_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">退货原因</label><textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={3} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">操作人</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={3} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">创建退货单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
