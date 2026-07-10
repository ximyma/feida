import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface SupplierGroup {
  id: string;
  code: string;
  name: string;
  remark: string;
  created_at: string;
}

export default function SupplierGroupsPage() {
  const [groups, setGroups] = useState<SupplierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState('');
  const [formData, setFormData] = useState({ code: '', name: '', remark: '' });

  useEffect(() => {
    fetch('/api/supplier-groups').then(r => r.json()).then(data => {
      setGroups(Array.isArray(data) ? data : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      message.warning('请填写编码和名称');
      return;
    }
    try {
      if (editingId) {
        await fetch(`/api/supplier-groups/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        message.success('更新成功');
      } else {
        await fetch('/api/supplier-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        message.success('创建成功');
      }
      setModalOpen(false);
      setFormData({ code: '', name: '', remark: '' });
      setEditingId('');
      fetch('/api/supplier-groups').then(r => r.json()).then(data => setGroups(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const handleEdit = (item: SupplierGroup) => {
    setFormData({ code: item.code, name: item.name, remark: item.remark });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除该分组吗？')) return;
    try {
      await fetch(`/api/supplier-groups/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetch('/api/supplier-groups').then(r => r.json()).then(data => setGroups(Array.isArray(data) ? data : []));
    } catch (e) { message.error('删除失败'); }
  };

  const filtered = groups.filter(g => 
    g.code.toLowerCase().includes(searchText.toLowerCase()) || 
    g.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/purchase" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><Plus className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">供应商分组</h1><p className="text-sm text-gray-500">管理供应商分组信息</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索分组..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> 新增分组</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">分组编码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">分组名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">备注</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">创建时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.remark || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无分组数据</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingId ? '编辑分组' : '新增分组'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">分组编码 *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">分组名称 *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setEditingId(''); setFormData({ code: '', name: '', remark: '' }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
