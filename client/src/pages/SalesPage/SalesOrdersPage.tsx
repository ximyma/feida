import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, ShoppingCart, Calendar, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface SalesOrder {
  id: string;
  code: string;
  customer_id: string;
  customer_name: string;
  contact_person: string;
  contact_phone: string;
  order_date: string;
  delivery_date: string;
  warehouse_id: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  discount: number;
  status: string;
  operator_name: string;
  created_at: string;
}

interface CustomerData {
  id: string;
  code: string;
  name: string;
}

interface StyleData {
  id: string;
  code: string;
  name: string;
}

interface ColorData {
  id: string;
  code: string;
  name: string;
  hex: string;
}

interface SizeData {
  id: string;
  code: string;
  name: string;
}

const STATUS_MAP = { 
  pending: '待审核', 
  approved: '已审核', 
  production: '生产中', 
  shipping: '发货中', 
  completed: '已完成', 
  cancelled: '已取消' 
};

const PAYMENT_STATUS_MAP = { unpaid: '未付款', partial: '部分付款', paid: '已付清' };

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [styles, setStyles] = useState<StyleData[]>([]);
  const [colors, setColors] = useState<ColorData[]>([]);
  const [sizes, setSizes] = useState<SizeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  const [formData, setFormData] = useState({ 
    customer_id: '', customer_name: '', contact_person: '', contact_phone: '',
    order_date: new Date().toISOString().split('T')[0], delivery_date: '',
    warehouse_id: '', shipping_address: '', payment_method: '',
    discount: 0, remark: '', operator_name: ''
  });
  
  const [selectedStyle, setSelectedStyle] = useState('');
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/sales-orders').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/product-styles').then(r => r.json()),
      fetch('/api/product-colors').then(r => r.json()),
      fetch('/api/product-sizes').then(r => r.json())
    ]).then(([orderData, customerData, styleData, colorData, sizeData]) => {
      setOrders(Array.isArray(orderData) ? orderData : []);
      setCustomers(Array.isArray(customerData) ? customerData.filter((c: any) => c.status === 'active') : []);
      setStyles(Array.isArray(styleData) ? styleData : []);
      setColors(Array.isArray(colorData) ? colorData : []);
      setSizes(Array.isArray(sizeData) ? sizeData.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleCustomerChange = (id: string) => {
    const customer = customers.find(c => c.id === id);
    setFormData({ ...formData, customer_id: id, customer_name: customer?.name || '' });
  };

  const handleMatrixChange = (colorCode: string, sizeCode: string, qty: number) => {
    setMatrixData(prev => ({
      ...prev,
      [colorCode]: { ...prev[colorCode], [sizeCode]: qty }
    }));
  };

  const handleSubmit = async () => {
    if (!formData.customer_id) {
      message.warning('请选择客户');
      return;
    }
    if (!selectedStyle) {
      message.warning('请选择款号');
      return;
    }

    const items: any[] = [];
    let hasItems = false;
    
    colors.forEach(color => {
      sizes.forEach(size => {
        const qty = matrixData[color.code]?.[size.code] || 0;
        if (qty > 0) {
          hasItems = true;
          items.push({
            style_id: selectedStyle,
            color_id: color.id,
            size_id: size.id,
            color_code: color.code,
            size_code: size.code,
            qty,
            unit: '双',
            unit_price: 0
          });
        }
      });
    });

    if (!hasItems) {
      message.warning('请至少输入一个数量');
      return;
    }

    try {
      await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, items })
      });
      message.success('订单创建成功');
      setModalOpen(false);
      setFormData({ 
        customer_id: '', customer_name: '', contact_person: '', contact_phone: '',
        order_date: new Date().toISOString().split('T')[0], delivery_date: '',
        warehouse_id: '', shipping_address: '', payment_method: '',
        discount: 0, remark: '', operator_name: ''
      });
      setSelectedStyle('');
      setMatrixData({});
      fetch('/api/sales-orders').then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('确定审核通过这个订单吗？')) return;
    try {
      await fetch(`/api/sales-orders/${id}/approve`, { method: 'POST' });
      message.success('审核成功');
      fetch('/api/sales-orders').then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('确定取消这个订单吗？')) return;
    try {
      await fetch(`/api/sales-orders/${id}/cancel`, { method: 'POST' });
      message.success('取消成功');
      fetch('/api/sales-orders').then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const filtered = orders.filter(o => {
    if (selectedStatus && o.status !== selectedStatus) return false;
    if (selectedCustomer && o.customer_id !== selectedCustomer) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return o.code.toLowerCase().includes(kw) || o.customer_name?.toLowerCase().includes(kw);
    }
    return true;
  });

  const totalAmount = filtered.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/sales" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">销售订单</h1><p className="text-sm text-gray-500">订单录入与审核（含矩阵）</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索订单号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">全部客户</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus className="w-4 h-4" /> 新建订单</button>
        </div>
        <div className="p-4 flex items-center gap-6">
          <div><span className="text-sm text-gray-500">订单总数:</span> <span className="font-semibold text-gray-900">{filtered.length}笔</span></div>
          <div><span className="text-sm text-gray-500">订单总额:</span> <span className="font-semibold text-green-600">¥{totalAmount.toLocaleString()}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">订单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">客户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">订单日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">交货日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">金额</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">付款状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">订单状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.customer_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gray-400" />{new Date(item.order_date).toLocaleDateString()}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.delivery_date ? new Date(item.delivery_date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">¥{item.total_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                      item.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {PAYMENT_STATUS_MAP[item.payment_status as keyof typeof PAYMENT_STATUS_MAP] || item.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'completed' ? 'bg-green-100 text-green-700' :
                      item.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(item.id)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">审核</button>
                          <button onClick={() => handleCancel(item.id)} className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">取消</button>
                        </>
                      )}
                      {item.status === 'approved' && (
                        <span className="text-sm text-gray-400">已审核</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无销售订单</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl m-4 p-6">
            <h2 className="text-lg font-semibold mb-6">新建销售订单</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">客户 *</label><select value={formData.customer_id} onChange={(e) => handleCustomerChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"><option value="">请选择客户</option>{customers.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">联系人</label><input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label><input type="text" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">订单日期</label><input type="date" value={formData.order_date} onChange={(e) => setFormData({ ...formData, order_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">交货日期</label><input type="date" value={formData.delivery_date} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">付款方式</label><select value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"><option value="">请选择</option><option value="cash">现金</option><option value="transfer">转账</option><option value="credit">信用</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">款号 *</label><select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"><option value="">请选择款号</option>{styles.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">折扣率</label><input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">操作人</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            </div>
            
            {selectedStyle && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-700 mb-4">尺码矩阵录入</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-200 px-3 py-2 bg-gray-100 text-sm font-medium text-gray-600">颜色</th>
                        {sizes.map(size => (
                          <th key={size.id} className="border border-gray-200 px-3 py-2 bg-gray-100 text-sm font-medium text-gray-600">{size.code}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {colors.map(color => (
                        <tr key={color.id}>
                          <td className="border border-gray-200 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hex }}></div>
                              <span className="text-sm">{color.code}</span>
                            </div>
                          </td>
                          {sizes.map(size => (
                            <td key={size.id} className="border border-gray-200 px-2 py-1">
                              <input type="number" min="0" value={matrixData[color.code]?.[size.code] || ''} onChange={(e) => handleMatrixChange(color.code, size.code, parseInt(e.target.value) || 0)} className="w-full text-center px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => { setModalOpen(false); setSelectedStyle(''); setMatrixData({}); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">创建订单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
