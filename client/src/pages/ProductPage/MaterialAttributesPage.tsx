import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface MaterialAttribute {
  id: string;
  name: string;
  code: string;
  description: string;
}

export default function MaterialAttributesPage() {
  const [attributes, setAttributes] = useState<MaterialAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialAttribute | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await fetch('/api/material-attributes').then(r => r.json());
      setAttributes(Array.isArray(data) ? data : []);
    } catch (e) { message.error('获取数据失败'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.name) { message.warning('请输入属性名称'); return; }
    try {
      if (editing) {
        await fetch(`/api/material-attributes/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        message.success('更新成功');
      } else {
        await fetch('/api/material-attributes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        message.success('添加成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (e) { message.error('保存失败'); }
  };

  const handleEdit = (item: MaterialAttribute) => {
    setEditing(item);
    setFormData({ name: item.name, code: item.code || '', description: item.description || '' });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return;
    try {
      await fetch(`/api/material-attributes/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch (e) { message.error('删除失败'); }
  };

  const filtered = attributes.filter(a =>
    a.name.toLowerCase().includes(searchText.toLowerCase()) ||
    a.code?.toLowerCase().includes(searchText.toLowerCase())
  );

  const ATTRIBUTE_TYPES = ['原材料', '半成品', '成品', '辅料', '包装材料', '其他'];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/plm" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">物料属性类型</h1>
          <p className="text-sm text-gray-500">管理物料属性（原材料/半成品/辅料等）</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => { setEditing(null); setFormData({ name: '', code: '', description: '' }); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> 添加属性
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ATTRIBUTE_TYPES.map((type) => {
            const attr = attributes.find(a => a.name === type);
            return (
              <div key={type} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{type}</h3>
                    <p className="text-sm text-gray-500">{attr?.description || '暂无描述'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {attr ? (
                      <>
                        <button onClick={() => handleEdit(attr)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(attr.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <button onClick={() => { setEditing(null); setFormData({ name: type, code: '', description: '' }); setModalOpen(true); }}
                        className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm">添加</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? '编辑属性' : '添加属性'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">属性名称 *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">编码</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
