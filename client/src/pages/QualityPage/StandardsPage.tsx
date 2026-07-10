import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, FileText, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Standard {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string;
  items: string;
  status: string;
  created_at: string;
}

const TYPE_MAP: Record<string, string> = { product: '产品', process: '工序', material: '物料' };

export default function StandardsPage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null);
  
  const [formData, setFormData] = useState({ 
    code: '', name: '', type: 'product', description: '',
    items: [{ name: '', standard: '', method: '' }]
  });

  useEffect(() => {
    fetch('/api/quality-standards').then(r => r.json()).then(data => {
      setStandards(Array.isArray(data) ? data : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { name: '', standard: '', method: '' }] });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      message.warning('请填写标准编码和名称');
      return;
    }
    try {
      if (editingStandard) {
        await fetch(`/api/quality-standards/${editingStandard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            code: formData.code, name: formData.name, type: formData.type,
            description: formData.description, items: JSON.stringify(formData.items)
          })
        });
        message.success('标准更新成功');
      } else {
        await fetch('/api/quality-standards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            code: formData.code, name: formData.name, type: formData.type,
            description: formData.description, items: JSON.stringify(formData.items)
          })
        });
        message.success('标准创建成功');
      }
      setModalOpen(false);
      setEditingStandard(null);
      setFormData({ code: '', name: '', type: 'product', description: '', items: [{ name: '', standard: '', method: '' }] });
      fetch('/api/quality-standards').then(r => r.json()).then(data => setStandards(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const handleEdit = (standard: Standard) => {
    setEditingStandard(standard);
    const items = standard.items ? JSON.parse(standard.items) : [{ name: '', standard: '', method: '' }];
    setFormData({ 
      code: standard.code, name: standard.name, type: standard.type,
      description: standard.description || '', items
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/quality-standards/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetch('/api/quality-standards').then(r => r.json()).then(data => setStandards(Array.isArray(data) ? data : []));
    } catch (e) { message.error('删除失败'); }
  };

  const filtered = standards.filter(s => {
    if (selectedType && s.type !== selectedType) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return s.code.toLowerCase().includes(kw) || s.name.toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/quality" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">质量标准</h1><p className="text-sm text-gray-500">产品、工序、物料检验标准管理</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索标准..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部类型</option>
              {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => { setEditingStandard(null); setFormData({ code: '', name: '', type: 'product', description: '', items: [{ name: '', standard: '', method: '' }] }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> 新增标准</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">标准编码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">标准名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">检验项目数</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => {
                const itemCount = item.items ? JSON.parse(item.items).length : 0;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{TYPE_MAP[item.type as keyof typeof TYPE_MAP] || item.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{itemCount}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {item.status === 'active' ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1 text-gray-500 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无质量标准</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">{editingStandard ? '编辑质量标准' : '新增质量标准'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">标准编码 *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">标准名称 *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">标准类型</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">检验项目</label></div>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-3 items-end">
                  <input type="text" value={item.name} onChange={(e) => { const newItems = [...formData.items]; newItems[index].name = e.target.value; setFormData({ ...formData, items: newItems }); }} placeholder="项目名称" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={item.standard} onChange={(e) => { const newItems = [...formData.items]; newItems[index].standard = e.target.value; setFormData({ ...formData, items: newItems }); }} placeholder="标准值" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={item.method} onChange={(e) => { const newItems = [...formData.items]; newItems[index].method = e.target.value; setFormData({ ...formData, items: newItems }); }} placeholder="检验方法" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex gap-2">
                    {formData.items.length > 1 && <button onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">×</button>}
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="text-blue-600 text-sm">+ 添加检验项</button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setEditingStandard(null); setFormData({ code: '', name: '', type: 'product', description: '', items: [{ name: '', standard: '', method: '' }] }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingStandard ? '更新' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}