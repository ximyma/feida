import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package, Zap } from 'lucide-react';
import { message } from 'antd';

interface SKU {
  id: string;
  style_id: string;
  style_color_id: string;
  size_id: string;
  sku_code: string;
  barcode: string;
  status: string;
  created_at: string;
}

interface Style {
  id: string;
  code: string;
  name: string;
}

interface StyleColor {
  id: string;
  style_id: string;
  color_id: string;
}

interface Color {
  id: string;
  name: string;
}

interface Size {
  id: string;
  name: string;
}

interface SizeGroup {
  id: string;
  name: string;
}

interface EnrichedSKU extends SKU {
  style_name?: string;
  style_code?: string;
  color_name?: string;
  size_name?: string;
}

export default function SKUsPage() {
  const [skus, setSKUs] = useState<EnrichedSKU[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [styleColors, setStyleColors] = useState<StyleColor[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [sizeGroups, setSizeGroups] = useState<SizeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState('');
  const [formData, setFormData] = useState({
    style_id: '',
    style_color_id: '',
    size_id: '',
    sku_code: '',
    barcode: '',
  });
  const [generateFormData, setGenerateFormData] = useState({
    styleId: '',
    styleColorId: '',
    sizeGroupId: '',
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [skusRes, stylesRes, styleColorsRes, colorsRes, sizesRes, sizeGroupsRes] = await Promise.all([
        fetch('/api/product_skus'),
        fetch('/api/product_styles'),
        fetch('/api/product_style_colors'),
        fetch('/api/colors'),
        fetch('/api/sizes'),
        fetch('/api/size_groups'),
      ]);
      const skusData = await skusRes.json();
      const stylesData = await stylesRes.json();
      const styleColorsData = await styleColorsRes.json();
      const colorsData = await colorsRes.json();
      const sizesData = await sizesRes.json();
      const sizeGroupsData = await sizeGroupsRes.json();

      // Enrich SKUs
      const enriched = (Array.isArray(skusData) ? skusData : []).map((sku: SKU) => {
        const sc = (Array.isArray(styleColorsData) ? styleColorsData : []).find((s: StyleColor) => s.id === sku.style_color_id);
        const style = (Array.isArray(stylesData) ? stylesData : []).find((s: Style) => s.id === (sc?.style_id || sku.style_id));
        const color = sc ? (Array.isArray(colorsData) ? colorsData : []).find((c: Color) => c.id === sc.color_id) : null;
        const size = (Array.isArray(sizesData) ? sizesData : []).find((s: Size) => s.id === sku.size_id);
        return {
          ...sku,
          style_name: style?.name,
          style_code: style?.code,
          color_name: color?.name,
          size_name: size?.name,
        };
      });
      setSKUs(enriched);
      setStyles(Array.isArray(stylesData) ? stylesData : []);
      setStyleColors(Array.isArray(styleColorsData) ? styleColorsData : []);
      setColors(Array.isArray(colorsData) ? colorsData : []);
      setSizes(Array.isArray(sizesData) ? sizesData : []);
      setSizeGroups(Array.isArray(sizeGroupsData) ? sizeGroupsData : []);
    } catch (e) {
      message.error('获取数据失败');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.style_color_id || !formData.size_id) {
      message.warning('请选择款色和尺码');
      return;
    }
    try {
      const url = editingSKU ? `/api/product_skus/${editingSKU.id}` : '/api/product_skus';
      const method = editingSKU ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        message.success(editingSKU ? '修改成功' : '添加成功');
        setModalOpen(false);
        setEditingSKU(null);
        setFormData({ style_id: '', style_color_id: '', size_id: '', sku_code: '', barcode: '' });
        fetchData();
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleGenerate = async () => {
    if (!generateFormData.styleId || !generateFormData.styleColorId || !generateFormData.sizeGroupId) {
      message.warning('请选择款号、款色和尺码组');
      return;
    }
    try {
      const res = await fetch('/api/product_skus/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateFormData),
      });
      const data = await res.json();
      if (data.success) {
        message.success(`成功生成 ${data.count} 个SKU`);
        setGenerateModalOpen(false);
        setGenerateFormData({ styleId: '', styleColorId: '', sizeGroupId: '' });
        fetchData();
      } else {
        message.error(data.message || '生成失败');
      }
    } catch (e) {
      message.error('生成失败');
    }
  };

  const handleEdit = (sku: EnrichedSKU) => {
    setEditingSKU(sku);
    setFormData({
      style_id: sku.style_id,
      style_color_id: sku.style_color_id,
      size_id: sku.size_id,
      sku_code: sku.sku_code || '',
      barcode: sku.barcode || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该SKU？')) return;
    try {
      const res = await fetch(`/api/product_skus/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchData();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const filteredSKUs = skus.filter(sku =>
    (sku.sku_code && sku.sku_code.includes(searchText)) ||
    (sku.style_name && sku.style_name.includes(searchText)) ||
    (sku.color_name && sku.color_name.includes(searchText)) ||
    (sku.size_name && sku.size_name.includes(searchText))
  );

  const getStyleColorOptions = () => {
    if (!selectedStyleId) return [];
    return styleColors.filter(sc => sc.style_id === selectedStyleId);
  };

  const getColorName = (colorId: string) => {
    const color = colors.find(c => c.id === colorId);
    return color ? color.name : '-';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SKU管理</h1>
        <p className="text-gray-500 mt-1">管理产品SKU（款色+尺码），支持批量生成和条码管理</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索SKU..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setGenerateFormData({ styleId: '', styleColorId: '', sizeGroupId: '' });
                setGenerateModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              批量生成
            </button>
            <button
              onClick={() => {
                setEditingSKU(null);
                setFormData({ style_id: '', style_color_id: '', size_id: '', sku_code: '', barcode: '' });
                setModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加SKU
            </button>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">SKU编码</th>
                <th className="pb-3 font-medium">款号</th>
                <th className="pb-3 font-medium">颜色</th>
                <th className="pb-3 font-medium">尺码</th>
                <th className="pb-3 font-medium">条码</th>
                <th className="pb-3 font-medium">状态</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredSKUs.map((sku) => (
                <tr key={sku.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-mono text-sm">{sku.sku_code || '-'}</td>
                  <td className="py-3">
                    <span className="font-medium">{sku.style_name || '-'}</span>
                    {sku.style_code && <span className="text-gray-400 text-xs ml-1">({sku.style_code})</span>}
                  </td>
                  <td className="py-3 text-gray-500">{sku.color_name || '-'}</td>
                  <td className="py-3 text-gray-500">{sku.size_name || '-'}</td>
                  <td className="py-3 font-mono text-sm text-gray-500">{sku.barcode || '-'}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                      sku.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {sku.status === 'active' ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(sku)}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sku.id)}
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

          {filteredSKUs.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无SKU数据</p>
              <p className="text-sm mt-1">建议使用批量生成功能根据款色和尺码组生成</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingSKU ? '编辑SKU' : '添加SKU'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">款号 *</label>
                <select
                  value={formData.style_id}
                  onChange={(e) => {
                    setFormData({ ...formData, style_id: e.target.value, style_color_id: '' });
                    setSelectedStyleId(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择款号</option>
                  {styles.map((s) => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">款色 *</label>
                <select
                  value={formData.style_color_id}
                  onChange={(e) => setFormData({ ...formData, style_color_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择款色</option>
                  {getStyleColorOptions().map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {getColorName(sc.color_id)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">尺码 *</label>
                <select
                  value={formData.size_id}
                  onChange={(e) => setFormData({ ...formData, size_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择尺码</option>
                  {sizes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU编码</label>
                <input
                  type="text"
                  value={formData.sku_code}
                  onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
                  placeholder="留空将自动生成"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">条码</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="条码号"
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

      {/* Generate Modal */}
      {generateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">批量生成SKU</h2>
            <p className="text-sm text-gray-500 mb-4">根据款色和尺码组批量生成SKU编码</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">款号 *</label>
                <select
                  value={generateFormData.styleId}
                  onChange={(e) => setGenerateFormData({ ...generateFormData, styleId: e.target.value, styleColorId: '' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择款号</option>
                  {styles.map((s) => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">款色 *</label>
                <select
                  value={generateFormData.styleColorId}
                  onChange={(e) => setGenerateFormData({ ...generateFormData, styleColorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择款色</option>
                  {styleColors.filter(sc => sc.style_id === generateFormData.styleId).map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {getColorName(sc.color_id)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">尺码组 *</label>
                <select
                  value={generateFormData.sizeGroupId}
                  onChange={(e) => setGenerateFormData({ ...generateFormData, sizeGroupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择尺码组</option>
                  {sizeGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setGenerateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                取消
              </button>
              <button onClick={handleGenerate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}