import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Grid3X3, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { message } from 'antd';

interface Category {
  id: string;
  name: string;
  code: string;
  parent_id: string;
  type: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    parent_id: '',
    type: '',
    sort_order: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/product_categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error('获取品类数据失败');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      message.warning('请输入品类名称');
      return;
    }
    try {
      const url = editingCategory ? `/api/product_categories/${editingCategory.id}` : '/api/product_categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        message.success(editingCategory ? '修改成功' : '添加成功');
        setModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', code: '', parent_id: '', type: '', sort_order: 0 });
        fetchCategories();
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      code: category.code || '',
      parent_id: category.parent_id || '',
      type: category.type || '',
      sort_order: category.sort_order || 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该品类？')) return;
    try {
      const res = await fetch(`/api/product_categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchCategories();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const getParentName = (parentId: string) => {
    if (!parentId) return '-';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : '-';
  };

  const filteredCategories = categories.filter(c =>
    c.name.includes(searchText) || (c.code && c.code.includes(searchText))
  );

  const rootCategories = filteredCategories.filter(c => !c.parent_id);
  const getChildren = (parentId: string) => filteredCategories.filter(c => c.parent_id === parentId);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      shoe: { label: '鞋类', color: 'bg-purple-100 text-purple-700' },
      clothing: { label: '服装', color: 'bg-rose-100 text-rose-700' },
      accessory: { label: '配件', color: 'bg-orange-100 text-orange-700' },
      material: { label: '材料', color: 'bg-teal-100 text-teal-700' },
    };
    const config = typeMap[type] || { label: type || '未分类', color: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-0.5 rounded text-xs ${config.color}`}>{config.label}</span>;
  };

  // 渲染树形节点
  const renderTreeNode = (category: Category, level: number = 0) => {
    const children = getChildren(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}>
        <div
          className={`flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer ${level > 0 ? 'ml-6' : ''}`}
          onClick={() => hasChildren && toggleExpand(category.id)}
        >
          {hasChildren ? (
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          ) : (
            <span className="w-4" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-5 h-5 text-blue-500" />
          ) : (
            <Folder className="w-5 h-5 text-gray-400" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{category.name}</span>
              {category.code && (
                <span className="text-xs text-gray-400 font-mono">{category.code}</span>
              )}
              {getTypeBadge(category.type)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasChildren && (
              <span className="text-xs text-gray-400 mr-2">{children.length}个子品类</span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
              className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }}
              className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-gray-200 ml-6 pl-2">
            {children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">品类管理</h1>
        <p className="text-gray-500 mt-1">管理产品品类，支持多级品类分类（鞋类、服装、配件等）</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索品类..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === 'tree' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                树形
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                表格
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', code: '', parent_id: '', type: '', sort_order: 0 });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加品类
          </button>
        </div>

        <div className="p-4">
          {viewMode === 'tree' ? (
            <div className="space-y-1">
              {rootCategories.map(category => renderTreeNode(category))}
              {filteredCategories.length === 0 && !loading && (
                <div className="p-12 text-center text-gray-500">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无品类数据</p>
                  <button onClick={() => setModalOpen(true)} className="mt-4 text-blue-600 hover:underline">
                    添加第一个品类
                  </button>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">编码</th>
                  <th className="pb-3 font-medium">名称</th>
                  <th className="pb-3 font-medium">上级品类</th>
                  <th className="pb-3 font-medium">类型</th>
                  <th className="pb-3 font-medium">排序</th>
                  <th className="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {rootCategories.map((category) => (
                  <React.Fragment key={category.id}>
                    <tr className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-mono text-sm">{category.code || '-'}</td>
                      <td className="py-3 font-medium">{category.name}</td>
                      <td className="py-3 text-gray-500">-</td>
                      <td className="py-3">{getTypeBadge(category.type)}</td>
                      <td className="py-3 text-gray-500">{category.sort_order}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {getChildren(category.id).map((child) => (
                      <tr key={child.id} className="border-b border-gray-50 hover:bg-gray-50 bg-gray-25">
                        <td className="py-3 font-mono text-sm pl-8">{child.code || '-'}</td>
                        <td className="py-3 font-medium pl-8">└─ {child.name}</td>
                        <td className="py-3 text-gray-500">{getParentName(child.parent_id)}</td>
                        <td className="py-3">{getTypeBadge(child.type)}</td>
                        <td className="py-3 text-gray-500">{child.sort_order}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(child)}
                              className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(child.id)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}

          {viewMode === 'table' && filteredCategories.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <Grid3X3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无品类数据</p>
              <button onClick={() => setModalOpen(true)} className="mt-4 text-blue-600 hover:underline">
                添加第一个品类
              </button>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingCategory ? '编辑品类' : '添加品类'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品类名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：运动鞋、皮鞋、服装"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品类编码</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="用于自动编码规则"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">上级品类</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">无（顶级品类）</option>
                  {categories.filter(c => !c.parent_id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  <option value="shoe">鞋类</option>
                  <option value="clothing">服装</option>
                  <option value="accessory">配件</option>
                  <option value="material">材料</option>
                </select>
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