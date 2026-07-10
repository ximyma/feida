import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Layers, Image as ImageIcon } from 'lucide-react';
import { message } from 'antd';
import { useSearchParams } from 'react-router-dom';

interface Style {
  id: string;
  code: string;
  name: string;
}

interface Color {
  id: string;
  name: string;
  hex_color: string;
}

interface StyleColor {
  id: string;
  style_id: string;
  color_id: string;
  image_url_1: string;
  image_url_2: string;
  status: string;
  created_at: string;
}

interface StyleColorWithDetails extends StyleColor {
  style_name?: string;
  color_name?: string;
  color_hex?: string;
}

export default function StyleColorsPage() {
  const [searchParams] = useSearchParams();
  const styleIdFromUrl = searchParams.get('styleId');

  const [styles, setStyles] = useState<Style[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [styleColors, setStyleColors] = useState<StyleColorWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<StyleColor | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(styleIdFromUrl || '');
  const [formData, setFormData] = useState({
    style_id: styleIdFromUrl || '',
    color_id: '',
    image_url_1: '',
    image_url_2: '',
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (styleIdFromUrl) {
      setSelectedStyleId(styleIdFromUrl);
      setFormData(prev => ({ ...prev, style_id: styleIdFromUrl }));
    }
  }, [styleIdFromUrl]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stylesRes, colorsRes, styleColorsRes] = await Promise.all([
        fetch('/api/product_styles'),
        fetch('/api/colors'),
        fetch('/api/product_style_colors'),
      ]);
      const stylesData = await stylesRes.json();
      const colorsData = await colorsRes.json();
      const styleColorsData = await styleColorsRes.json();

      setStyles(Array.isArray(stylesData) ? stylesData : []);
      setColors(Array.isArray(colorsData) ? colorsData : []);

      // Enrich style colors with style and color details
      const enriched = (Array.isArray(styleColorsData) ? styleColorsData : []).map((sc: StyleColor) => {
        const style = (Array.isArray(stylesData) ? stylesData : []).find((s: Style) => s.id === sc.style_id);
        const color = (Array.isArray(colorsData) ? colorsData : []).find((c: Color) => c.id === sc.color_id);
        return {
          ...sc,
          style_name: style?.name,
          color_name: color?.name,
          color_hex: color?.hex_color,
        };
      });
      setStyleColors(enriched);
    } catch (e) {
      message.error('获取数据失败');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.style_id || !formData.color_id) {
      message.warning('请选择款号和颜色');
      return;
    }
    try {
      const url = editingColor ? `/api/product_style_colors/${editingColor.id}` : '/api/product_style_colors';
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
        setFormData({ style_id: selectedStyleId || '', color_id: '', image_url_1: '', image_url_2: '' });
        fetchData();
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleEdit = (sc: StyleColorWithDetails) => {
    setEditingColor(sc);
    setFormData({
      style_id: sc.style_id,
      color_id: sc.color_id,
      image_url_1: sc.image_url_1 || '',
      image_url_2: sc.image_url_2 || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该款色？')) return;
    try {
      const res = await fetch(`/api/product_style_colors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchData();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const filteredStyleColors = styleColors.filter(sc =>
    (sc.style_name && sc.style_name.includes(searchText)) ||
    (sc.color_name && sc.color_name.includes(searchText))
  );

  const displayedStyleColors = selectedStyleId
    ? filteredStyleColors.filter(sc => sc.style_id === selectedStyleId)
    : filteredStyleColors;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">款色管理</h1>
        <p className="text-gray-500 mt-1">管理款号+颜色变体，支持多图展示，是SKU生成的基础</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <div className="flex-1 relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索款色..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedStyleId}
            onChange={(e) => setSelectedStyleId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部款号</option>
            {styles.map((s) => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingColor(null);
              setFormData({ style_id: selectedStyleId || '', color_id: '', image_url_1: '', image_url_2: '' });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加款色
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedStyleColors.map((sc) => (
              <div key={sc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: sc.color_hex || '#e5e7eb' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{sc.style_name}</h3>
                    <p className="text-sm text-gray-500">{sc.color_name}</p>
                  </div>
                </div>

                {(sc.image_url_1 || sc.image_url_2) && (
                  <div className="flex gap-2 mb-3">
                    {sc.image_url_1 && (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img src={sc.image_url_1} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {sc.image_url_2 && (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img src={sc.image_url_2} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {!(sc.image_url_1 || sc.image_url_2) && (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(sc)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(sc.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {displayedStyleColors.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无款色数据</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 text-blue-600 hover:underline"
              >
                添加第一个款色
              </button>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingColor ? '编辑款色' : '添加款色'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">款号 *</label>
                <select
                  value={formData.style_id}
                  onChange={(e) => setFormData({ ...formData, style_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!styleIdFromUrl}
                >
                  <option value="">请选择款号</option>
                  {styles.map((s) => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">颜色 *</label>
                <select
                  value={formData.color_id}
                  onChange={(e) => setFormData({ ...formData, color_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择颜色</option>
                  {colors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片1 URL</label>
                <input
                  type="text"
                  value={formData.image_url_1}
                  onChange={(e) => setFormData({ ...formData, image_url_1: e.target.value })}
                  placeholder="图片链接"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片2 URL</label>
                <input
                  type="text"
                  value={formData.image_url_2}
                  onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                  placeholder="图片链接（可选）"
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