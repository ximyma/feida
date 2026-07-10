import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, ScanLine, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Barcode {
  id: string;
  code: string;
  type: string;
  target_id: string;
  warehouse_id: string;
  location_id: string;
  batch_no: string;
  expiry_date: string;
  qty: number;
  created_at: string;
}

interface WarehouseData {
  id: string;
  code: string;
  name: string;
}

const TYPE_MAP = { sku: '产品条码', material: '物料条码', location: '货位条码' };

export default function BarcodesPage() {
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Barcode | null>(null);
  const [formData, setFormData] = useState({ code: '', type: 'sku', target_id: '', warehouse_id: '', batch_no: '', expiry_date: '', qty: 1 });
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/barcodes').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json())
    ]).then(([barcodeData, whData]) => {
      setBarcodes(Array.isArray(barcodeData) ? barcodeData : []);
      setWarehouses(Array.isArray(whData) ? whData.filter((w: any) => w.status === 'active') : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      if (editing) {
        await fetch(`/api/barcodes/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        message.success('更新成功');
      } else {
        await fetch('/api/barcodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        message.success('添加成功');
      }
      setModalOpen(false);
      setEditing(null);
      setFormData({ code: '', type: 'sku', target_id: '', warehouse_id: '', batch_no: '', expiry_date: '', qty: 1 });
      fetch('/api/barcodes').then(r => r.json()).then(data => setBarcodes(Array.isArray(data) ? data : []));
    } catch (e) { message.error('保存失败'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个条码吗？')) return;
    try {
      await fetch(`/api/barcodes/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetch('/api/barcodes').then(r => r.json()).then(data => setBarcodes(Array.isArray(data) ? data : []));
    } catch (e) { message.error('删除失败'); }
  };

  const handleEdit = (item: Barcode) => {
    setEditing(item);
    setFormData({
      code: item.code,
      type: item.type,
      target_id: item.target_id || '',
      warehouse_id: item.warehouse_id || '',
      batch_no: item.batch_no || '',
      expiry_date: item.expiry_date || '',
      qty: item.qty || 1
    });
    setModalOpen(true);
  };

  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || '-';

  const filtered = barcodes.filter(b => {
    if (selectedType && b.type !== selectedType) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return b.code.toLowerCase().includes(kw) || b.batch_no?.toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/warehouse" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center"><ScanLine className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">条码管理</h1><p className="text-sm text-gray-500">条码生成与打印</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="搜索条码..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">全部类型</option>
              {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"><Plus className="w-4 h-4" /> 新增条码</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">条码编号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">关联对象</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">批次</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">到期日</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{TYPE_MAP[item.type as keyof typeof TYPE_MAP] || item.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.target_id || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><Warehouse className="w-3 h-3 text-gray-400" />{getWarehouseName(item.warehouse_id)}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.batch_no || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.expiry_date || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ScanLine className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无条码数据</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? '编辑条码' : '新增条码'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">条码编号</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="自动生成" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">条码类型</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">{Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">关联对象ID</label><input type="text" value={formData.target_id} onChange={(e) => setFormData({ ...formData, target_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="SKU/物料/货位ID" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">所属仓库</label><select value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"><option value="">请选择仓库</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">批次号</label><input type="text" value={formData.batch_no} onChange={(e) => setFormData({ ...formData, batch_no: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">到期日</label><input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">数量</label><input type="number" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: parseFloat(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button><button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">保存</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
