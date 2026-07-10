import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Payment {
  id: string;
  code: string;
  type: string;
  customer_id: string;
  supplier_id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  bank_account: string;
  created_at: string;
}

const TYPE_MAP: Record<string, string> = { receive: '收款', pay: '付款' };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const [formData, setFormData] = useState({ 
    type: 'receive', customer_id: '', supplier_id: '', invoice_id: '', 
    payment_date: '', amount: '', payment_method: '', bank_account: '', 
    remark: '', operator_name: '' 
  });

  useEffect(() => {
    fetch('/api/payments').then(r => r.json()).then(data => {
      setPayments(Array.isArray(data) ? data : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      message.warning('请输入有效金额');
      return;
    }
    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success(formData.type === 'receive' ? '收款成功' : '付款成功');
      setModalOpen(false);
      setFormData({ type: 'receive', customer_id: '', supplier_id: '', invoice_id: '', payment_date: '', amount: '', payment_method: '', bank_account: '', remark: '', operator_name: '' });
      fetch('/api/payments').then(r => r.json()).then(data => setPayments(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const filtered = payments.filter(p => {
    if (selectedType && p.type !== selectedType) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return p.code.toLowerCase().includes(kw);
    }
    return true;
  });

  const receiveTotal = payments.filter(p => p.type === 'receive').reduce((sum, p) => sum + p.amount, 0);
  const payTotal = payments.filter(p => p.type === 'pay').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/finance" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center"><Wallet className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">收付款管理</h1><p className="text-sm text-gray-500">管理收款和付款记录</p></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">收款总额</p>
              <p className="text-2xl font-bold text-green-700">{receiveTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Wallet className="w-5 h-5 text-green-600" /></div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">付款总额</p>
              <p className="text-2xl font-bold text-red-700">{payTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><Wallet className="w-5 h-5 text-red-600" /></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索单据号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">全部类型</option>
              {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Plus className="w-4 h-4" /> 新增收付款</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">单据号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">日期</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">金额</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">付款方式</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">银行账户</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'receive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {TYPE_MAP[item.type as keyof typeof TYPE_MAP] || item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.payment_date?.split('T')[0]}</td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${item.type === 'receive' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'receive' ? '+' : '-'}{item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.payment_method || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.bank_account || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无收付款记录</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">新增{formData.type === 'receive' ? '收款' : '付款'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" value="receive" checked={formData.type === 'receive'} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="text-green-600" /> <span className="text-sm">收款</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" value="pay" checked={formData.type === 'pay'} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="text-red-600" /> <span className="text-sm">付款</span></label>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{formData.type === 'receive' ? '客户ID' : '供应商ID'}</label><input type="text" value={formData.type === 'receive' ? formData.customer_id : formData.supplier_id} onChange={(e) => setFormData({ ...formData, [formData.type === 'receive' ? 'customer_id' : 'supplier_id']: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="可选" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">关联发票ID</label><input type="text" value={formData.invoice_id} onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="可选" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">日期</label><input type="date" value={formData.payment_date} onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">金额 *</label><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">付款方式</label><input type="text" value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="现金、银行转账等" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">银行账户</label><input type="text" value={formData.bank_account} onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">操作员</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setFormData({ type: 'receive', customer_id: '', supplier_id: '', invoice_id: '', payment_date: '', amount: '', payment_method: '', bank_account: '', remark: '', operator_name: '' }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className={`px-4 py-2 ${formData.type === 'receive' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg`}>
                {formData.type === 'receive' ? '确认收款' : '确认付款'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
