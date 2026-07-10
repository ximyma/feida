import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Factory } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface WorkCenter {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  remark: string;
  created_at: string;
}

const TYPE_MAP: Record<string, string> = { cutting: '裁剪', sewing: '缝纫', finishing: '整烫', packaging: '包装' };

export default function WorkCentersPage() {
  const [centers, setCenters] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState('');
  const [formData, setFormData] = useState({ code: '', name: '', type: 'sewing', status: 'active', remark: '' });

  useEffect(() => {
    fetch('/api/work-centers').then(r => r.json()).then(data => {
      setCenters(Array.isArray(data) ? data : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      message.warning('请填写编码和名称');
      return;
    }
    try {
      if (editingId) {
        await fetch(`/api/work-centers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        message.success('更新成功');
      } else {
        await fetch('/api/work-centers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        message.success('创建成功');
      }
      setModalOpen(false);
      setFormData({ code: '', name: '', type: 'sewing', status: 'active', remark: '' });
      setEditingId('');
      fetch('/api/work-centers').then(r => r.json()).then(data => setCenters(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const handleEdit = (item: WorkCenter) => {
    setFormData(item);
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除该工作中心吗？')) return;
    try {
      await fetch(`/api/work-centers/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetch('/api/work-centers').then(r => r.json()).then(data => setCenters(Array.isArray(data) ? data : []));
    } catch (e) { message.error('删除失败'); }
  };

  const filtered = centers.filter(c => 
    c.code.toLowerCase().includes(searchText.toLowerCase()) || 
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/production" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"><Factory className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">工作中心</h1><p className="text-sm text-gray-500">管理生产工作中心</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索工作中心..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Plus className="w-4 h-4" /> 新增工作中心</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">编码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">创建时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{TYPE_MAP[item.type] || item.type}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.status === 'active' ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Factory className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无工作中心数据</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingId ? '编辑工作中心' : '新增工作中心'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">编码 *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">类型</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="cutting">裁剪</option><option value="sewing">缝纫</option><option value="finishing">整烫</option><option value="packaging">包装</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">状态</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="active">启用</option><option value="inactive">停用</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" rows={3} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setEditingId(''); setFormData({ code: '', name: '', type: 'sewing', status: 'active', remark: '' }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">{editingId ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
