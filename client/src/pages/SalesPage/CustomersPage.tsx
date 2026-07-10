import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Building, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Customer {
  id: string;
  code: string;
  name: string;
  short_name: string;
  group_id: string;
  group_name: string;
  contact_person: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  credit_limit: number;
  available_credit: number;
  status: string;
  created_at: string;
}

interface GroupData {
  id: string;
  code: string;
  name: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ 
    code: '', name: '', short_name: '', group_id: '', contact_person: '', 
    phone: '', mobile: '', email: '', address: '', province: '', city: '', 
    district: '', tax_no: '', bank_name: '', bank_account: '', 
    credit_limit: 0, status: 'active', remark: '' 
  });
  const [searchText, setSearchText] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/customer-groups').then(r => r.json())
    ]).then(([customerData, groupData]) => {
      setCustomers(Array.isArray(customerData) ? customerData : []);
      setGroups(Array.isArray(groupData) ? groupData : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      message.warning('请填写客户编码和名称');
      return;
    }
    try {
      if (editing) {
        await fetch(`/api/customers/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        message.success('更新成功');
      } else {
        await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        message.success('添加成功');
      }
      setModalOpen(false);
      setEditing(null);
      setFormData({ 
        code: '', name: '', short_name: '', group_id: '', contact_person: '', 
        phone: '', mobile: '', email: '', address: '', province: '', city: '', 
        district: '', tax_no: '', bank_name: '', bank_account: '', 
        credit_limit: 0, status: 'active', remark: '' 
      });
      fetch('/api/customers').then(r => r.json()).then(data => setCustomers(Array.isArray(data) ? data : []));
    } catch (e) { message.error('保存失败'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个客户吗？')) return;
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetch('/api/customers').then(r => r.json()).then(data => setCustomers(Array.isArray(data) ? data : []));
    } catch (e) { message.error('删除失败'); }
  };

  const handleEdit = (item: Customer) => {
    setEditing(item);
    setFormData({
      code: item.code,
      name: item.name,
      short_name: item.short_name || '',
      group_id: item.group_id || '',
      contact_person: item.contact_person || '',
      phone: item.phone || '',
      mobile: item.mobile || '',
      email: item.email || '',
      address: item.address || '',
      province: (item as any).province || '',
      city: (item as any).city || '',
      district: (item as any).district || '',
      tax_no: (item as any).tax_no || '',
      bank_name: (item as any).bank_name || '',
      bank_account: (item as any).bank_account || '',
      credit_limit: item.credit_limit || 0,
      status: item.status || 'active',
      remark: item.remark || ''
    });
    setModalOpen(true);
  };

  const getGroupName = (id: string) => groups.find(g => g.id === id)?.name || '-';

  const filtered = customers.filter(c => {
    if (selectedGroup && c.group_id !== selectedGroup) return false;
    if (selectedStatus && c.status !== selectedStatus) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return c.code.toLowerCase().includes(kw) || c.name.toLowerCase().includes(kw) || 
             c.contact_person?.toLowerCase().includes(kw) || c.phone?.includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/sales" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><Building className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">客户档案</h1><p className="text-sm text-gray-500">客户基本信息管理</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索客户..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部分组</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部状态</option>
              <option value="active">正常</option>
              <option value="inactive">停用</option>
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> 新增客户</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">客户编码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">客户名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">所属分组</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">联系人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">联系电话</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">信用额度</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{getGroupName(item.group_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.contact_person || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{item.phone || item.mobile || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">¥{item.credit_limit.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.status === 'active' ? '正常' : '停用'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无客户</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl m-4 p-6">
            <h2 className="text-lg font-semibold mb-6">{editing ? '编辑客户' : '新增客户'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">客户编码 *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">客户名称 *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">简称</label><input type="text" value={formData.short_name} onChange={(e) => setFormData({ ...formData, short_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">客户分组</label><select value={formData.group_id} onChange={(e) => setFormData({ ...formData, group_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">请选择分组</option>{groups.map(g => <option key={g.id} value={g.id}>{g.code} - {g.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">联系人</label><input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">固定电话</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">手机</label><input type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">详细地址</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">省份</label><input type="text" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">城市</label><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">区/县</label><input type="text" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">税号</label><input type="text" value={formData.tax_no} onChange={(e) => setFormData({ ...formData, tax_no: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">开户银行</label><input type="text" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">银行账号</label><input type="text" value={formData.bank_account} onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">信用额度</label><input type="number" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">状态</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="active">正常</option><option value="inactive">停用</option></select></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
