import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Ruler, Layers } from 'lucide-react';
import { message } from 'antd';

interface Size {
  id: string;
  name: string;
  category: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

interface SizeGroup {
  id: string;
  name: string;
  description: string;
  is_active: number;
  created_at: string;
}

interface SizeGroupItem {
  id: string;
  size_group_id: string;
  size_id: string;
  sort_order: number;
}

export default function SizesPage() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [sizeGroups, setSizeGroups] = useState<SizeGroup[]>([]);
  const [groupItems, setGroupItems] = useState<Record<string, SizeGroupItem[]>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sizes' | 'groups'>('sizes');
  const [modalOpen, setModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [editingGroup, setEditingGroup] = useState<SizeGroup | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SizeGroup | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '', sort_order: 0 });
  const [groupFormData, setGroupFormData] = useState({ name: '', description: '' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sizesRes, groupsRes] = await Promise.all([
        fetch('/api/sizes'),
        fetch('/api/size_groups'),
      ]);
      const sizesData = await sizesRes.json();
      const groupsData = await groupsRes.json();
      setSizes(Array.isArray(sizesData) ? sizesData : []);
      setSizeGroups(Array.isArray(groupsData) ? groupsData : []);

      // Fetch group items for each group
      const groups = Array.isArray(groupsData) ? groupsData : [];
      const itemsMap: Record<string, SizeGroupItem[]> = {};
      for (const g of groups) {
        const itemsRes = await fetch(`/api/size_group_items?size_group_id=${g.id}`);
        const itemsData = await itemsRes.json();
        itemsMap[g.id] = Array.isArray(itemsData) ? itemsData : [];
      }
      setGroupItems(itemsMap);
    } catch (e) {
      message.error('获取数据失败');
    }
    setLoading(false);
  };

  const handleSizeSubmit = async () => {
    if (!formData.name) {
      message.warning('请输入尺码名称');
      return;
    }
    try {
      const url = editingSize ? `/api/sizes/${editingSize.id}` : '/api/sizes';
      const method = editingSize ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        message.success(editingSize ? '修改成功' : '添加成功');
        setModalOpen(false);
        setEditingSize(null);
        setFormData({ name: '', category: '', sort_order: 0 });
        fetchData();
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleGroupSubmit = async () => {
    if (!groupFormData.name) {
      message.warning('请输入尺码组名称');
      return;
    }
    try {
      const url = editingGroup ? `/api/size_groups/${editingGroup.id}` : '/api/size_groups';
      const method = editingGroup ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupFormData),
      });
      if (res.ok) {
        message.success(editingGroup ? '修改成功' : '添加成功');
        setGroupModalOpen(false);
        setEditingGroup(null);
        setGroupFormData({ name: '', description: '' });
        fetchData();
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleAddSizeToGroup = async (sizeId: string) => {
    if (!selectedGroup) return;
    try {
      const res = await fetch('/api/size_group_items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size_group_id: selectedGroup.id,
          size_id: sizeId,
          sort_order: 0,
        }),
      });
      if (res.ok) {
        message.success('添加成功');
        fetchData();
      }
    } catch (e) {
      message.error('添加失败');
    }
  };

  const handleRemoveSizeFromGroup = async (itemId: string) => {
    try {
      const res = await fetch(`/api/size_group_items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('移除成功');
        fetchData();
      }
    } catch (e) {
      message.error('移除失败');
    }
  };

  const handleDeleteSize = async (id: string) => {
    if (!confirm('确定删除该尺码？')) return;
    try {
      const res = await fetch(`/api/sizes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchData();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('确定删除该尺码组？')) return;
    try {
      const res = await fetch(`/api/size_groups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchData();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const filteredSizes = sizes.filter(s =>
    s.name.includes(searchText) || (s.category && s.category.includes(searchText))
  );

  const getSizeById = (id: string) => sizes.find(s => s.id === id);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">尺码管理</h1>
        <p className="text-gray-500 mt-1">管理尺码库和尺码组，支持鞋服行业多码制配置</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('sizes')}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'sizes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Ruler className="w-4 h-4 inline mr-2" />
              尺码库
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'groups'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers className="w-4 h-4 inline mr-2" />
              尺码组
            </button>
          </div>
        </div>

        {activeTab === 'sizes' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索尺码..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  setEditingSize(null);
                  setFormData({ name: '', category: '', sort_order: 0 });
                  setModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加尺码
              </button>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {filteredSizes.map((size) => (
                <div key={size.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <span className="text-lg font-medium">{size.name}</span>
                    {size.category && (
                      <p className="text-xs text-gray-500 mt-1">{size.category}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setEditingSize(size);
                        setFormData({ name: size.name, category: size.category || '', sort_order: size.sort_order || 0 });
                        setModalOpen(true);
                      }}
                      className="flex-1 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteSize(size.id)}
                      className="flex-1 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredSizes.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <Ruler className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无尺码数据</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">尺码组是一组尺码的集合，用于款号的码制配置</p>
              <button
                onClick={() => {
                  setEditingGroup(null);
                  setGroupFormData({ name: '', description: '' });
                  setGroupModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加尺码组
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sizeGroups.map((group) => {
                const items = groupItems[group.id] || [];
                const groupSizes = items.map(item => getSizeById(item.size_id)).filter(Boolean);
                return (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
                            setItemModalOpen(true);
                          }}
                          className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                        >
                          管理尺码
                        </button>
                        <button
                          onClick={() => {
                            setEditingGroup(group);
                            setGroupFormData({ name: group.name, description: group.description || '' });
                            setGroupModalOpen(true);
                          }}
                          className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {groupSizes.map((size) => size && (
                        <span key={size.id} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {size.name}
                        </span>
                      ))}
                      {groupSizes.length === 0 && (
                        <span className="text-xs text-gray-400">暂未添加尺码</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {sizeGroups.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无尺码组</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Size Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingSize ? '编辑尺码' : '添加尺码'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">尺码名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：39、40、S、M、L"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择</option>
                  <option value="shoe">鞋类</option>
                  <option value="clothing">服装</option>
                  <option value="accessory">配件</option>
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
              <button onClick={handleSizeSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Modal */}
      {groupModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingGroup ? '编辑尺码组' : '添加尺码组'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">尺码组名称 *</label>
                <input
                  type="text"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  placeholder="例如：女鞋尺码组、男鞋尺码组"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  placeholder="尺码组描述..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setGroupModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                取消
              </button>
              <button onClick={handleGroupSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Items Modal */}
      {itemModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">管理尺码组 - {selectedGroup.name}</h2>
            <div className="max-h-80 overflow-y-auto">
              <div className="space-y-2">
                {sizes.map((size) => {
                  const isInGroup = (groupItems[selectedGroup.id] || []).some(item => item.size_id === size.id);
                  const item = (groupItems[selectedGroup.id] || []).find(item => item.size_id === size.id);
                  return (
                    <div key={size.id} className="flex items-center justify-between p-2 border border-gray-100 rounded hover:bg-gray-50">
                      <span>{size.name} {size.category && <span className="text-gray-400">({size.category})</span>}</span>
                      {isInGroup ? (
                        <button
                          onClick={() => item && handleRemoveSizeFromGroup(item.id)}
                          className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                        >
                          移除
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddSizeToGroup(size.id)}
                          className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                        >
                          添加
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setItemModalOpen(false); setSelectedGroup(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}