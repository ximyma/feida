import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, FileText, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  parent_id: string;
  level: number;
  balance: number;
  remark: string;
  created_at: string;
}

const TYPE_MAP: Record<string, string> = { asset: '资产', liability: '负债', equity: '权益', income: '收入', expense: '费用' };

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const [formData, setFormData] = useState({ code: '', name: '', type: 'asset', parent_id: '', level: '1', remark: '' });

  useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(data => {
      setAccounts(Array.isArray(data) ? data : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      message.warning('请填写科目编码和名称');
      return;
    }
    try {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success('科目创建成功');
      setModalOpen(false);
      setFormData({ code: '', name: '', type: 'asset', parent_id: '', level: '1', remark: '' });
      fetch('/api/accounts').then(r => r.json()).then(data => setAccounts(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除此科目吗？')) return;
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetch('/api/accounts').then(r => r.json()).then(data => setAccounts(Array.isArray(data) ? data : []));
    } catch (e) { message.error('删除失败'); }
  };

  const filtered = accounts.filter(o => {
    if (selectedType && o.type !== selectedType) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return o.code.toLowerCase().includes(kw) || o.name.toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/finance" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">科目管理</h1><p className="text-sm text-gray-500">管理会计科目体系</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索科目..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部类型</option>
              {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> 新增科目</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">科目编码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">科目名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">层级</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">余额</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'asset' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'liability' ? 'bg-red-100 text-red-700' :
                      item.type === 'equity' ? 'bg-purple-100 text-purple-700' :
                      item.type === 'income' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {TYPE_MAP[item.type as keyof typeof TYPE_MAP] || item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">第{item.level}级</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{item.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-500 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无科目</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">新增科目</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">科目编码 *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">科目名称 *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">科目类型</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">层级</label><input type="number" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setFormData({ code: '', name: '', type: 'asset', parent_id: '', level: '1', remark: '' }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
