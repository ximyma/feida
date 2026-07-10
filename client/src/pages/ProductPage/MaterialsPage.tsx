import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Material {
  id: string;
  code: string;
  name: string;
  category_id: string;
  attribute_id: string;
  unit: string;
  spec: string;
  safety_stock: number;
  price: number;
  status: string;
  category_name?: string;
  attribute_name?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Attribute {
  id: string;
  name: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    code: '', name: '', category_id: '', attribute_id: '', unit: '双',
    spec: '', safety_stock: 0, price: 0, status: 'active'
  });
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAttribute, setFilterAttribute] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [materialsData, categoriesData, attributesData] = await Promise.all([
        fetch('/api/materials').then(r => r.json()),
        fetch('/api/product_categories').then(r => r.json()),
        fetch('/api/material-attributes').then(r => r.json()),
      ]);
      setMaterials(Array.isArray(materialsData) ? materialsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setAttributes(Array.isArray(attributesData) ? attributesData : []);
    } catch (e) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      message.warning('请输入物料名称');
      return;
    }
    try {
      const payload = { ...formData };
      if (editing) {
        await fetch(`/api/materials/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        message.success('更新成功');
      } else {
        await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        message.success('添加成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (e) {
      message.error('保存失败');
    }
  };

  const handleEdit = (item: Material) => {
    setEditing(item);
    setFormData({
      code: item.code || '',
      name: item.name,
      category_id: item.category_id || '',
      attribute_id: item.attribute_id || '',
      unit: item.unit || '双',
      spec: item.spec || '',
      safety_stock: item.safety_stock || 0,
      price: item.price || 0,
      status: item.status || 'active',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该物料？')) return;
    try {
      await fetch(`/api/materials/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || '-';
  const getAttributeName = (id: string) => attributes.find(a => a.id === id)?.name || '-';

  const filteredMaterials = materials.filter(m => {
    const matchSearch = !searchText ||
      m.name.toLowerCase().includes(searchText.toLowerCase()) ||
      m.code?.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = !filterCategory || m.category_id === filterCategory;
    const matchAttribute = !filterAttribute || m.attribute_id === filterAttribute;
    return matchSearch && matchCategory && matchAttribute;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/plm" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">物料主数据</h1>
          <p className="text-sm text-gray-500">管理原材料、半成品、辅料等物料信息</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索物料编码/名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部品类</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filterAttribute}
            onChange={(e) => setFilterAttribute(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部属性</option>
            {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button
            onClick={() => {
              setEditing(null);
              setFormData({ code: '', name: '', category_id: '', attribute_id: '', unit: '双', spec: '', safety_stock: 0, price: 0, status: 'active' });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加物料
          </button>
        </div>

        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">物料编码</th>
                <th className="pb-3 font-medium">物料名称</th>
                <th className="pb-3 font-medium">品类</th>
                <th className="pb-3 font-medium">属性</th>
                <th className="pb-3 font-medium">规格</th>
                <th className="pb-3 font-medium">单价</th>
                <th className="pb-3 font-medium">状态</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-mono text-sm">{material.code || '-'}</td>
                  <td className="py-3 font-medium">{material.name}</td>
                  <td className="py-3 text-gray-500">{getCategoryName(material.category_id)}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {getAttributeName(material.attribute_id)}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{material.spec || '-'}</td>
                  <td className="py-3 text-gray-500">¥{material.price || 0}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${material.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {material.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(material)} className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(material.id)} className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMaterials.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无物料数据</p>
              <button onClick={() => setModalOpen(true)} className="mt-4 text-blue-600 hover:underline">
                添加第一个物料
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 弹窗 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? '编辑物料' : '添加物料'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">物料编码</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="自动生成"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">物料名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="物料名称"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">物料品类</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">物料属性</label>
                  <select
                    value={formData.attribute_id}
                    onChange={(e) => setFormData({ ...formData, attribute_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择</option>
                    {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">规格</label>
                  <input
                    type="text"
                    value={formData.spec}
                    onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：1.2mm厚"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单价(元)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">安全库存</label>
                <input
                  type="number"
                  value={formData.safety_stock}
                  onChange={(e) => setFormData({ ...formData, safety_stock: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                取消
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
