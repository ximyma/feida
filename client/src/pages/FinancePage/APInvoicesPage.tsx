import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Invoice {
  id: string;
  code: string;
  supplier_id: string;
  supplier_name: string;
  order_code: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  created_at: string;
}

interface Supplier {
  id: string;
  code: string;
  name: string;
}

const STATUS_MAP: Record<string, string> = { unpaid: '未付款', partial: '部分付款', paid: '已付清', overdue: '逾期' };

export default function APInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [formData, setFormData] = useState({ supplier_id: '', supplier_name: '', order_id: '', order_code: '', invoice_date: '', due_date: '', total_amount: '', remark: '', operator_name: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/ap-invoices').then(r => r.json()),
      fetch('/api/suppliers').then(r => r.json())
    ]).then(([invoiceData, supplierData]) => {
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleSupplierChange = (id: string) => {
    const supplier = suppliers.find(s => s.id === id);
    setFormData({ ...formData, supplier_id: id, supplier_name: supplier?.name || '' });
  };

  const handleSubmit = async () => {
    if (!formData.supplier_id || !formData.total_amount) {
      message.warning('请选择供应商和输入金额');
      return;
    }
    try {
      await fetch('/api/ap-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success('发票创建成功');
      setModalOpen(false);
      setFormData({ supplier_id: '', supplier_name: '', order_id: '', order_code: '', invoice_date: '', due_date: '', total_amount: '', remark: '', operator_name: '' });
      fetch('/api/ap-invoices').then(r => r.json()).then(data => setInvoices(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const filtered = invoices.filter(o => {
    if (selectedStatus && o.status !== selectedStatus) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return o.code.toLowerCase().includes(kw) || o.supplier_name?.toLowerCase().includes(kw);
    }
    return true;
  });

  const unpaidTotal = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/finance" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">应付发票</h1><p className="text-sm text-gray-500">管理供应商应付账款</p></div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600">应付账款总额</p>
            <p className="text-2xl font-bold text-purple-700">{unpaidTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><Plus className="w-4 h-4" /> 新增发票</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索发票号或供应商..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">发票号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">供应商</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">订单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">开票日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">到期日</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">金额</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">已付</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">未付</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.supplier_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.order_code || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.invoice_date?.split('T')[0]}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.due_date?.split('T')[0]}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{item.total_amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{(item.paid_amount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-purple-600">{(item.total_amount - (item.paid_amount || 0)).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'unpaid' ? 'bg-gray-100 text-gray-700' :
                      item.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      item.status === 'paid' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无应付发票</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">新增应付发票</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">供应商 *</label><select value={formData.supplier_id} onChange={(e) => handleSupplierChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="">请选择供应商</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">订单号</label><input type="text" value={formData.order_code} onChange={(e) => setFormData({ ...formData, order_code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">开票日期</label><input type="date" value={formData.invoice_date} onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">到期日</label><input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">金额 *</label><input type="number" value={formData.total_amount} onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">制单人</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setFormData({ supplier_id: '', supplier_name: '', order_id: '', order_code: '', invoice_date: '', due_date: '', total_amount: '', remark: '', operator_name: '' }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">创建发票</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
