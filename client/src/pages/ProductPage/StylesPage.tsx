import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Layers, ChevronRight } from 'lucide-react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface Style {
  id: string;
  code: string;
  name: string;
  category_id: string;
  brand: string;
  season: string;
  year: number;
  description: string;
  status: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface SizeGroup {
  id: string;
  name: string;
}

export default function StylesPage() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizeGroups, setSizeGroups] = useState<SizeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sizeConfigModalOpen, setSizeConfigModalOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category_id: '',
    brand: '',
    season: '',
    year: new Date().getFullYear(),
    description: '',
  });
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stylesRes, categoriesRes, sizeGroupsRes] = await Promise.all([
        fetch('/api/product_styles'),
        fetch('/api/product_categories'),
        fetch('/api/size_groups'),
      ]);
      const stylesData = await stylesRes.json();
      const categoriesData = await categoriesRes.json();
      const sizeGroupsData = await sizeGroupsRes.json();
      setStyles(Array.isArray(stylesData) ? stylesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setSizeGroups(Array.isArray(sizeGroupsData) ? sizeGroupsData : []);
    } catch (e) {
      message.error('获取数据失败');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      message.warning('请输入款号编码和名称');
      return;
    }
    try {
      const url = editingStyle ? `/api/product_styles/${editingStyle.id}` : '/api/product_styles';
      const method = editingStyle ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        message.success(editingStyle ? '修改成功' : '添加成功');
        setModalOpen(false);
        setEditingStyle(null);
        setFormData({ code: '', name: '', category_id: '', brand: '', season: '', year: new Date().getFullYear(), description: '' });
        fetchData();
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleEdit = (style: Style) => {
    setEditingStyle(style);
    setFormData({
      code: style.code,
      name: style.name,
      category_id: style.category_id || '',
      brand: style.brand || '',
      season: style.season || '',
      year: style.year || new Date().getFullYear(),
      description: style.description || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该款号？')) return;
    try {
      const res = await fetch(`/api/product_styles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchData();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleConfigSize = (style: Style) => {
    setSelectedStyle(style);
    setSizeConfigModalOpen(true);
  };

  const handleAddSizeConfig = async (sizeGroupId: string) => {
    if (!selectedStyle) return;
    try {
      const res = await fetch('/api/product_style_size_configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style_id: selectedStyle.id,
          size_group_id: sizeGroupId,
        }),
      });
      if (res.ok) {
        message.success('添加成功');
        fetchSizeConfigs(selectedStyle.id);
      }
    } catch (e) {
      message.error('添加失败');
    }
  };

  const handleRemoveSizeConfig = async (configId: string) => {
    try {
      const res = await fetch(`/api/product_style_size_configs/${configId}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('移除成功');
        if (selectedStyle) fetchSizeConfigs(selectedStyle.id);
      }
    } catch (e) {
      message.error('移除失败');
    }
  };

  const fetchSizeConfigs = async (styleId: string) => {
    try {
      const res = await fetch(`/api/product_styles/${styleId}/size-config`);
      const data = await res.json();
      // Update the selectedStyle with new configs
      if (selectedStyle && data.data) {
        setSelectedStyle({ ...selectedStyle, sizeConfigs: data.data });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : '-';
  };

  const filteredStyles = styles.filter(s =>
    s.name.includes(searchText) || s.code.includes(searchText)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">款号管理</h1>
        <p className="text-gray-500 mt-1">管理产品款号档案（SPU），是鞋服行业产品的核心主数据</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索款号..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setEditingStyle(null);
              setFormData({ code: '', name: '', category_id: '', brand: '', season: '', year: new Date().getFullYear(), description: '' });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加款号
          </button>
        </div>

        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">款号</th>
                <th className="pb-3 font-medium">名称</th>
                <th className="pb-3 font-medium">品类</th>
                <th className="pb-3 font-medium">品牌</th>
                <th className="pb-3 font-medium">季节</th>
                <th className="pb-3 font-medium">状态</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredStyles.map((style) => (
                <tr key={style.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-mono">{style.code}</td>
                  <td className="py-3 font-medium">{style.name}</td>
                  <td className="py-3 text-gray-500">{getCategoryName(style.category_id)}</td>
                  <td className="py-3 text-gray-500">{style.brand || '-'}</td>
                  <td className="py-3 text-gray-500">{style.season || '-'}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                      style.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {style.status === 'active' ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/product/style-colors?styleId=${style.id}`)}
                        className="text-purple-600 hover:bg-purple-50 p-1 rounded transition-colors"
                        title="款色管理"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleConfigSize(style)}
                        className="text-teal-600 hover:bg-teal-50 p-1 rounded transition-colors"
                        title="配置尺码组"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(style)}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(style.id)}
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

          {filteredStyles.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无款号数据</p>
              <button onClick={() => setModalOpen(true)} className="mt-4 text-blue-600 hover:underline">
                添加第一个款号
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{editingStyle ? '编辑款号' : '添加款号'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">款号编码 *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="例如：FD2026001"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">款号名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：经典跑鞋"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品类</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="品牌名称"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">季节</label>
                  <input
                    type="text"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    placeholder="例如：2026春夏"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="款号描述..."
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

      {/* Size Config Modal */}
      {sizeConfigModalOpen && selectedStyle && (
        <SizeConfigModal
          style={selectedStyle}
          sizeGroups={sizeGroups}
          onClose={() => { setSizeConfigModalOpen(false); setSelectedStyle(null); }}
          onAdd={handleAddSizeConfig}
          onRemove={handleRemoveSizeConfig}
          fetchConfigs={fetchSizeConfigs}
        />
      )}
    </div>
  );
}

interface SizeConfigModalProps {
  style: Style;
  sizeGroups: SizeGroup[];
  onClose: () => void;
  onAdd: (sizeGroupId: string) => void;
  onRemove: (configId: string) => void;
  fetchConfigs: (styleId: string) => void;
}

function SizeConfigModal({ style, sizeGroups, onClose, onAdd, onRemove, fetchConfigs }: SizeConfigModalProps) {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigsData();
  }, [style.id]);

  const fetchConfigsData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/product_styles/${style.id}/size-config`);
      const data = await res.json();
      if (data.success) {
        setConfigs(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAdd = (sizeGroupId: string) => {
    onAdd(sizeGroupId);
  };

  const handleRemove = (configId: string) => {
    onRemove(configId);
  };

  const addedGroupIds = configs.map(c => c.size_group_id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">配置尺码组 - {style.name}</h2>
        <p className="text-sm text-gray-500 mb-4">为款号分配尺码组，决定该款产品有哪些尺码</p>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {sizeGroups.map((group) => {
            const isAdded = addedGroupIds.includes(group.id);
            const config = configs.find(c => c.size_group_id === group.id);
            return (
              <div key={group.id} className="flex items-center justify-between p-2 border border-gray-100 rounded">
                <span>{group.name}</span>
                {isAdded ? (
                  <button
                    onClick={() => config && handleRemove(config.id)}
                    className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                  >
                    移除
                  </button>
                ) : (
                  <button
                    onClick={() => handleAdd(group.id)}
                    className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                  >
                    添加
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">已配置：{configs.length} 个尺码组</p>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}