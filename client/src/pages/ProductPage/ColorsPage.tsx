import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Palette } from 'lucide-react';
import { message } from 'antd';

interface Color {
  id: string;
  name: string;
  pantone_code: string;
  custom_code: string;
  hex_color: string;
  image_url: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    pantone_code: '',
    custom_code: '',
    hex_color: '#000000',
    image_url: '',
    sort_order: 0,
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/colors');
      const data = await res.json();
      setColors(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error('获取颜色数据失败');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      message.warning('请输入颜色名称');
      return;
    }
    try {
      const url = editingColor ? `/api/colors/${editingColor.id}` : '/api/colors';
      const method = editingColor ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        message.success(editingColor ? '修改成功' : '添加成功');
        setModalOpen(false);
        setEditingColor(null);
        setFormData({ name: '', pantone_code: '', custom_code: '', hex_color: '#000000', image_url: '', sort_order: 0 });
        fetchColors();
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleEdit = (color: Color) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      pantone_code: color.pantone_code || '',
      custom_code: color.custom_code || '',
      hex_color: color.hex_color || '#000000',
      image_url: color.image_url || '',
      sort_order: color.sort_order || 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该颜色？')) return;
    try {
      const res = await fetch(`/api/colors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchColors();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const filteredColors = colors.filter(c =>
    c.name.includes(searchText) ||
    (c.pantone_code && c.pantone_code.includes(searchText)) ||
    (c.custom_code && c.custom_code.includes(searchText))
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">颜色库管理</h1>
        <p className="text-gray-500 mt-1">管理产品颜色档案，支持潘通色号、自定义色号和颜色图片</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索颜色..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setEditingColor(null);
              setFormData({ name: '', pantone_code: '', custom_code: '', hex_color: '#000000', image_url: '', sort_order: 0 });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加颜色
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {filteredColors.map((color) => (
            <div key={color.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-lg border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: color.hex_color || '#e5e7eb' }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{color.name}</h3>
                  {color.pantone_code && (
                    <p className="text-xs text-gray-500 mt-1">潘通: {color.pantone_code}</p>
                  )}
                  {color.custom_code && (
                    <p className="text-xs text-gray-500">自编码: {color.custom_code}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(color)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(color.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredColors.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-500">
            <Palette className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无颜色数据</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 text-blue-600 hover:underline"
            >
              添加第一个颜色
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingColor ? '编辑颜色' : '添加颜色'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">颜色名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：经典黑"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">潘通色号</label>
                <input
                  type="text"
                  value={formData.pantone_code}
                  onChange={(e) => setFormData({ ...formData, pantone_code: e.target.value })}
                  placeholder="例如：PANTONE 19-1664"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">自定义色号</label>
                <input
                  type="text"
                  value={formData.custom_code}
                  onChange={(e) => setFormData({ ...formData, custom_code: e.target.value })}
                  placeholder="企业内部色号编码"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">颜色值</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.hex_color}
                    onChange={(e) => setFormData({ ...formData, hex_color: e.target.value })}
                    className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.hex_color}
                    onChange={(e) => setFormData({ ...formData, hex_color: e.target.value })}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}