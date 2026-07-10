import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Package, Warehouse, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface WarehouseData {
  id: string;
  code: string;
  name: string;
}

interface StockOutItem {
  id: string;
  sku_id: string;
  material_id: string;
  qty: number;
  unit: string;
  remark: string;
}

export default function StockOutPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [formData, setFormData] = useState({ warehouse_id: '', source_doc_type: 'sales', source_doc_id: '', remark: '', operator_name: '' });
  const [items, setItems] = useState<StockOutItem[]>([{ id: '1', sku_id: '', material_id: '', qty: 1, unit: '双', remark: '' }]);

  useEffect(() => {
    Promise.all([
      fetch('/api/warehouses').then(r => r.json()),
      fetch('/api/inventory/transactions?type=out').then(r => r.json())
    ]).then(([whData, trxData]) => {
      setWarehouses(Array.isArray(whData) ? whData.filter((w: any) => w.status === 'active') : []);
      setTransactions(Array.isArray(trxData) ? trxData : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { id: String(Date.now()), sku_id: '', material_id: '', qty: 1, unit: '双', remark: '' }]);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field as keyof StockOutItem] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!formData.warehouse_id) { message.warning('请选择出库仓库'); return; }
    if (!items.some(i => i.sku_id || i.material_id)) { message.warning('请至少添加一个出库物品'); return; }
    
    try {
      for (const item of items) {
        if (!item.sku_id && !item.material_id) continue;
        await fetch('/api/inventory/transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'out',
            warehouse_id: formData.warehouse_id,
            sku_id: item.sku_id,
            material_id: item.material_id,
            qty: item.qty,
            unit: item.unit,
            source_doc_id: formData.source_doc_id,
            source_doc_type: formData.source_doc_type,
            remark: item.remark || formData.remark,
            operator_name: formData.operator_name
          })
        });
      }
      message.success('出库成功');
      setFormOpen(false);
      setItems([{ id: '1', sku_id: '', material_id: '', qty: 1, unit: '双', remark: '' }]);
      setFormData({ warehouse_id: '', source_doc_type: 'sales', source_doc_id: '', remark: '', operator_name: '' });
      fetch('/api/inventory/transactions?type=out').then(r => r.json()).then(data => setTransactions(Array.isArray(data) ? data : []));
    } catch (e) { message.error('出库失败'); }
  };

  const filtered = transactions.filter(t => 
    t.batch_no?.toLowerCase().includes(searchText.toLowerCase()) ||
    t.source_doc_id?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/warehouse" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">出库管理</h1><p className="text-sm text-gray-500">销售出库/领料出库</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="搜索批次/单号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
          <button onClick={() => setFormOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Plus className="w-4 h-4" /> 新增出库</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">SKU/物料</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">批次号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">来源单据</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><Warehouse className="w-3 h-3 text-gray-400" />{warehouses.find(w => w.id === item.warehouse_id)?.code || '-'}</span></td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.sku_id || item.material_id}</td>
                  <td className="px-4 py-3 text-sm text-red-600">-{item.qty} {item.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.batch_no || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><FileText className="w-3 h-3 text-gray-400" />{item.source_doc_id || '-'}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.operator_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无出库记录</p>
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl m-4 p-6">
            <h2 className="text-lg font-semibold mb-6">新增出库</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">出库仓库 *</label><select value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="">请选择仓库</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">出库类型</label><select value={formData.source_doc_type} onChange={(e) => setFormData({ ...formData, source_doc_type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="sales">销售出库</option><option value="production">领料出库</option><option value="return">退货出库</option><option value="other">其他</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">销售单号</label><input type="text" value={formData.source_doc_id} onChange={(e) => setFormData({ ...formData, source_doc_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">操作人</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">出库明细</label></div>
              {items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-5 gap-4">
                    <div><input type="text" placeholder="SKU编码" value={item.sku_id} onChange={(e) => handleUpdateItem(index, 'sku_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                    <div><input type="text" placeholder="物料编码" value={item.material_id} onChange={(e) => handleUpdateItem(index, 'material_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                    <div><input type="number" placeholder="数量" value={item.qty} onChange={(e) => handleUpdateItem(index, 'qty', parseFloat(e.target.value) || 1)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                    <div><input type="text" placeholder="备注" value={item.remark} onChange={(e) => handleUpdateItem(index, 'remark', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleRemoveItem(index)} disabled={items.length === 1} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30">删除</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleAddItem} className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm"><Plus className="w-4 h-4" /> 添加一行</button>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setFormOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button><button onClick={handleSubmit} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">确认出库</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
