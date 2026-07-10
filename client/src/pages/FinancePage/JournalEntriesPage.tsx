import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface JournalEntry {
  id: string;
  code: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: string;
  created_at: string;
}

const STATUS_MAP: Record<string, string> = { draft: '草稿', posted: '已过账' };

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const [formData, setFormData] = useState({ 
    description: '', entry_date: '', remark: '', operator_name: '',
    items: [{ account_id: '', account_code: '', account_name: '', debit: '', credit: '' }]
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/journal-entries').then(r => r.json()),
      fetch('/api/accounts').then(r => r.json())
    ]).then(([entryData, accountData]) => {
      setEntries(Array.isArray(entryData) ? entryData : []);
      setAccounts(Array.isArray(accountData) ? accountData : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleAccountChange = (index: number, accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    const newItems = [...formData.items];
    newItems[index] = { 
      ...newItems[index], 
      account_id: accountId,
      account_code: account?.code || '',
      account_name: account?.name || ''
    };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { account_id: '', account_code: '', account_name: '', debit: '', credit: '' }] });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async () => {
    if (!formData.description) {
      message.warning('请填写凭证摘要');
      return;
    }
    const totalDebit = formData.items.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
    const totalCredit = formData.items.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
    if (totalDebit !== totalCredit) {
      message.warning('借贷不平衡');
      return;
    }
    try {
      await fetch('/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success('凭证创建成功');
      setModalOpen(false);
      setFormData({ description: '', entry_date: '', remark: '', operator_name: '', items: [{ account_id: '', account_code: '', account_name: '', debit: '', credit: '' }] });
      fetch('/api/journal-entries').then(r => r.json()).then(data => setEntries(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handlePost = async (id: string) => {
    if (!window.confirm('确定过账此凭证吗？')) return;
    try {
      await fetch(`/api/journal-entries/${id}/post`, { method: 'POST' });
      message.success('过账成功');
      fetch('/api/journal-entries').then(r => r.json()).then(data => setEntries(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const filtered = entries.filter(e => 
    e.code.toLowerCase().includes(searchText.toLowerCase()) || 
    e.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/finance" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">凭证管理</h1><p className="text-sm text-gray-500">管理会计凭证</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索凭证号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus className="w-4 h-4" /> 新增凭证</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">凭证号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">摘要</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">借方</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">贷方</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.entry_date?.split('T')[0]}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{item.total_debit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{item.total_credit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm">
                    {item.status === 'posted' ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" /> 已过账</span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"><AlertCircle className="w-3 h-3" /> 草稿</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === 'draft' && (
                      <button onClick={() => handlePost(item.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">过账</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无凭证</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">新增凭证</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">凭证日期</label><input type="date" value={formData.entry_date} onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">制单人</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">摘要</label><input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">分录明细</label></div>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-3 items-end">
                  <select value={item.account_id} onChange={(e) => handleAccountChange(index, e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">请选择科目</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                  </select>
                  <input type="text" value={item.account_code} readOnly className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100" />
                  <input type="text" value={item.account_name} readOnly className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100" />
                  <input type="number" value={item.debit} onChange={(e) => { const newItems = [...formData.items]; newItems[index].debit = e.target.value; setFormData({ ...formData, items: newItems }); }} placeholder="借方" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <div className="flex gap-2">
                    <input type="number" value={item.credit} onChange={(e) => { const newItems = [...formData.items]; newItems[index].credit = e.target.value; setFormData({ ...formData, items: newItems }); }} placeholder="贷方" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    {formData.items.length > 1 && <button onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">×</button>}
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="text-green-600 text-sm">+ 添加分录</button>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setFormData({ description: '', entry_date: '', remark: '', operator_name: '', items: [{ account_id: '', account_code: '', account_name: '', debit: '', credit: '' }] }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">创建凭证</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
