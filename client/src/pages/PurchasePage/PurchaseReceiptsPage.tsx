import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Download, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface PurchaseReceipt {
  id: string;
  code: string;
  order_id: string;
  supplier_id: string;
  warehouse_id: string;
  receipt_date: string;
  total_qty: number;
  status: string;
  operator_name: string;
  created_at: string;
}

interface PurchaseOrder {
  id: string;
  code: string;
  supplier_id: string;
  supplier_name: string;
}

interface Warehouse {
  id: string;
  name: string;
}

const STATUS_MAP = { pending: '待审核', approved: '已审核' };

export default function PurchaseReceiptsPage() {
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [formData, setFormData] = useState({ 
    order_id: '', supplier_id: '', warehouse_id: '', receipt_date: '', 
    remark: '', operator_name: '' 
  });
  const [receiptItems, setReceiptItems] = useState<{ order_item_id: string; material_id: string; sku_id: string; qty: number; unit: string; batch_no: string; remark: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/purchase-receipts').then(r => r.json()),
      fetch('/api/purchase-orders').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json())
    ]).then(([receiptData, orderData, warehouseData]) => {
      setReceipts(Array.isArray(receiptData) ? receiptData : []);
      setOrders(Array.isArray(orderData) ? orderData.filter((o: any) => o.status === 'approved' || o.status === 'received') : []);
      setWarehouses(Array.isArray(warehouseData) ? warehouseData.filter((w: any) => w.status === 'active') : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleOrderChange = (id: string) => {
    const order = orders.find(o => o.id === id);
    setFormData({ ...formData, order_id: id, supplier_id: order?.supplier_id || '' });
  };

  const addReceiptItem = () => {
    setReceiptItems([...receiptItems, { order_item_id: '', material_id: '', sku_id: '', qty: 1, unit: '双', batch_no: '', remark: '' }]);
  };

  const updateReceiptItem = (index: number, field: string, value: any) => {
    const newItems = [...receiptItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setReceiptItems(newItems);
  };

  const removeReceiptItem = (index: number) => {
    setReceiptItems(receiptItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.order_id || !formData.warehouse_id) {
      message.warning('请选择订单和仓库');
      return;
    }
    if (!receiptItems.length) {
      message.warning('请添加入库明细');
      return;
    }
    try {
      await fetch('/api/purchase-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, items: receiptItems })
      });
      message.success('入库单创建成功');
      setModalOpen(false);
      setFormData({ order_id: '', supplier_id: '', warehouse_id: '', receipt_date: '', remark: '', operator_name: '' });
      setReceiptItems([]);
      fetch('/api/purchase-receipts').then(r => r.json()).then(data => setReceipts(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('确定审核通过这个入库单吗？库存将自动更新。')) return;
    try {
      await fetch(`/api/purchase-receipts/${id}/approve`, { method: 'POST' });
      message.success('审核成功，库存已更新');
      fetch('/api/purchase-receipts').then(r => r.json()).then(data => setReceipts(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const getOrderCode = (id: string) => orders.find(o => o.id === id)?.code || '-';
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || '-';

  const filtered = receipts.filter(r => {
    if (selectedStatus && r.status !== selectedStatus) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return r.code.toLowerCase().includes(kw) || getOrderCode(r.order_id).toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/purchase" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><Download className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">采购入库</h1><p className="text-sm text-gray-500">采购到货入库管理</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索入库单号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> 新建入库单</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">入库单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">采购订单</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">入库仓库</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">入库日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">入库数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{getOrderCode(item.order_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{getWarehouseName(item.warehouse_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.receipt_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.total_qty}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <button onClick={() => handleApprove(item.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">审核入库</button>
                      )}
                      {item.status === 'approved' && (
                        <span className="text-sm text-green-600">已完成</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Download className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无入库单</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">新建入库单</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">采购订单 *</label><select value={formData.order_id} onChange={(e) => handleOrderChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">请选择订单</option>{orders.map(o => <option key={o.id} value={o.id}>{o.code}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">入库仓库 *</label><select value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">请选择仓库</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">入库日期</label><input type="date" value={formData.receipt_date} onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">操作人</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} /></div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">入库明细</label>
                  <button onClick={addReceiptItem} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"><Plus className="w-4 h-4" /> 添加明细</button>
                </div>
                {receiptItems.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg">
                    {receiptItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border-b border-gray-100 last:border-b-0">
                        <span className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">{index + 1}</span>
                        <input type="text" placeholder="物料/产品ID" value={item.material_id || item.sku_id} onChange={(e) => setFormData({ ...formData, material_id: e.target.value })} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
                        <input type="number" placeholder="数量" value={item.qty} onChange={(e) => updateReceiptItem(index, 'qty', parseInt(e.target.value) || 0)} className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
                        <input type="text" placeholder="单位" value={item.unit} onChange={(e) => updateReceiptItem(index, 'unit', e.target.value)} className="w-16 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
                        <input type="text" placeholder="批次号" value={item.batch_no} onChange={(e) => updateReceiptItem(index, 'batch_no', e.target.value)} className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
                        <button onClick={() => removeReceiptItem(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><XCircle className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">点击上方按钮添加入库明细</div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setReceiptItems([]); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">创建入库单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
