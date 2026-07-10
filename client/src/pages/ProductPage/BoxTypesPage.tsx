import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Box } from 'lucide-react';
import { message } from 'antd';

interface BoxType {
  id: string;
  name: string;
  code: string;
  length: number;
  width: number;
  height: number;
  unit: string;
  description: string;
  is_active: number;
  created_at: string;
}

export default function BoxTypesPage() {
  const [boxTypes, setBoxTypes] = useState<BoxType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<BoxType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    length: 0,
    width: 0,
    height: 0,
    unit: 'cm',
    description: '',
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/box_types');
      const data = await res.json();
      setBoxTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error('获取箱型数据失败');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      message.warning('请输入箱型名称和编码');
      return;
    }
    try {
      const url = editingBox ? `/api/box_types/${editingBox.id}` : '/api/box_types';
      const method = editingBox ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        message.success(editingBox ? '修改成功' : '添加成功');
        setModalOpen(false);
        setEditingBox(null);
        setFormData({ name: '', code: '', length: 0, width: 0, height: 0, unit: 'cm', description: '' });
        fetchData();
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleEdit = (box: BoxType) => {
    setEditingBox(box);
    setFormData({
      name: box.name,
      code: box.code,
      length: box.length || 0,
      width: box.width || 0,
      height: box.height || 0,
      unit: box.unit || 'cm',
      description: box.description || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该箱型？')) return;
    try {
      const res = await fetch(`/api/box_types/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchData();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const filteredBoxTypes = boxTypes.filter(b =>
    b.name.includes(searchText) || b.code.includes(searchText)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">箱型管理</h1>
        <p className="text-gray-500 mt-1">管理产品包装箱型规格，用于物流和仓储管理</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索箱型..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setEditingBox(null);
              setFormData({ name: '', code: '', length: 0, width: 0, height: 0, unit: 'cm', description: '' });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加箱型
          </button>
        </div>

        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">编码</th>
                <th className="pb-3 font-medium">名称</th>
                <th className="pb-3 font-medium">尺寸 (长×宽×高)</th>
                <th className="pb-3 font-medium">单位</th>
                <th className="pb-3 font-medium">描述</th>
                <th className="pb-3 font-medium">状态</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredBoxTypes.map((box) => (
                <tr key={box.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-mono">{box.code}</td>
                  <td className="py-3 font-medium">{box.name}</td>
                  <td className="py-3 text-gray-500">
                    {box.length} × {box.width} × {box.height}
                  </td>
                  <td className="py-3 text-gray-500">{box.unit || 'cm'}</td>
                  <td className="py-3 text-gray-500 text-sm">{box.description || '-'}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                      box.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {box.is_active === 1 ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(box)}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(box.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBoxTypes.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <Box className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无箱型数据</p>
              <button onClick={() => setModalOpen(true)} className="mt-4 text-blue-600 hover:underline">
                添加第一个箱型
              </button>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingBox ? '编辑箱型' : '添加箱型'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">箱型编码 *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="例如：BOX-01"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">箱型名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：标准鞋盒"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">长度</label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">宽度</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">高度</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cm">厘米 (cm)</option>
                  <option value="mm">毫米 (mm)</option>
                  <option value="inch">英寸 (inch)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="箱型描述..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                取消
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}