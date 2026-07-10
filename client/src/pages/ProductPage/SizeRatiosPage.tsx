import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Grid3X3, Save } from 'lucide-react';
import { message } from 'antd';

interface SizeRatio {
  id: string;
  style_id: string;
  size_group_id: string;
  size_id: string;
  ratio: number;
}

interface Style {
  id: string;
  code: string;
  name: string;
}

interface SizeGroup {
  id: string;
  name: string;
}

interface Size {
  id: string;
  name: string;
}

interface SizeGroupItem {
  id: string;
  size_group_id: string;
  size_id: string;
  sort_order: number;
}

export default function SizeRatiosPage() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [sizeGroups, setSizeGroups] = useState<SizeGroup[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [sizeGroupItems, setSizeGroupItems] = useState<SizeGroupItem[]>([]);
  const [ratios, setRatios] = useState<SizeRatio[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState('');
  const [selectedSizeGroupId, setSelectedSizeGroupId] = useState('');
  const [ratioValues, setRatioValues] = useState<Record<string, number>>({});
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stylesRes, groupsRes, sizesRes, itemsRes, ratiosRes] = await Promise.all([
        fetch('/api/product_styles'),
        fetch('/api/size_groups'),
        fetch('/api/sizes'),
        fetch('/api/size_group_items'),
        fetch('/api/size_ratios'),
      ]);
      const stylesData = await stylesRes.json();
      const groupsData = await groupsRes.json();
      const sizesData = await sizesRes.json();
      const itemsData = await itemsRes.json();
      const ratiosData = await ratiosRes.json();

      setStyles(Array.isArray(stylesData) ? stylesData : []);
      setSizeGroups(Array.isArray(groupsData) ? groupsData : []);
      setSizes(Array.isArray(sizesData) ? sizesData : []);
      setSizeGroupItems(Array.isArray(itemsData) ? itemsData : []);
      setRatios(Array.isArray(ratiosData) ? ratiosData : []);
    } catch (e) {
      message.error('获取数据失败');
    }
    setLoading(false);
  };

  // 获取选中尺码组的尺码列表
  const getSizesForGroup = () => {
    if (!selectedSizeGroupId) return [];
    const items = sizeGroupItems.filter(item => item.size_group_id === selectedSizeGroupId);
    return items.map(item => {
      const size = sizes.find(s => s.id === item.size_id);
      return { ...item, size_name: size?.name || '' };
    }).sort((a, b) => a.sort_order - b.sort_order);
  };

  // 获取已保存的配码比例
  const getSavedRatios = () => {
    if (!selectedStyleId || !selectedSizeGroupId) return {};
    const saved = ratios.filter(r =>
      r.style_id === selectedStyleId && r.size_group_id === selectedSizeGroupId
    );
    const map: Record<string, number> = {};
    saved.forEach(r => { map[r.size_id] = r.ratio; });
    return map;
  };

  // 初始化配码值
  useEffect(() => {
    if (selectedStyleId && selectedSizeGroupId) {
      const savedRatios = getSavedRatios();
      const groupSizes = getSizesForGroup();
      const initial: Record<string, number> = {};
      groupSizes.forEach(item => {
        initial[item.size_id] = savedRatios[item.size_id] || 1;
      });
      setRatioValues(initial);
    }
  }, [selectedStyleId, selectedSizeGroupId]);

  const handleSaveRatios = async () => {
    if (!selectedStyleId || !selectedSizeGroupId) {
      message.warning('请选择款号和尺码组');
      return;
    }

    const groupSizes = getSizesForGroup();
    if (groupSizes.length === 0) {
      message.warning('该尺码组没有尺码');
      return;
    }

    try {
      // 先删除旧的配码规则
      const oldRatios = ratios.filter(r =>
        r.style_id === selectedStyleId && r.size_group_id === selectedSizeGroupId
      );
      for (const old of oldRatios) {
        await fetch(`/api/size_ratios/${old.id}`, { method: 'DELETE' });
      }

      // 保存新的配码规则
      const savedCount = 0;
      for (const item of groupSizes) {
        const ratio = ratioValues[item.size_id] || 1;
        if (ratio > 0) {
          await fetch('/api/size_ratios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              style_id: selectedStyleId,
              size_group_id: selectedSizeGroupId,
              size_id: item.size_id,
              ratio: ratio,
            }),
          });
        }
      }

      message.success('配码规则保存成功');
      fetchData();
    } catch (e) {
      message.error('保存失败');
    }
  };

  const handleRatioChange = (sizeId: string, value: number) => {
    setRatioValues(prev => ({ ...prev, [sizeId]: Math.max(0, value) }));
  };

  const filteredStyles = styles.filter(s =>
    s.name.includes(searchText) || s.code.includes(searchText)
  );

  // 计算总配数
  const getTotalRatio = () => {
    return Object.values(ratioValues).reduce((sum, v) => sum + (v || 0), 0);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">配码规则管理</h1>
        <p className="text-gray-500 mt-1">管理款号的尺码配比规则，用于订单录入和生产配码</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
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
            <select
              value={selectedStyleId}
              onChange={(e) => {
                setSelectedStyleId(e.target.value);
                setSelectedSizeGroupId('');
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">选择款号</option>
              {filteredStyles.map((s) => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
            <select
              value={selectedSizeGroupId}
              onChange={(e) => setSelectedSizeGroupId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedStyleId}
            >
              <option value="">选择尺码组</option>
              {sizeGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {selectedStyleId && selectedSizeGroupId && (
              <button
                onClick={handleSaveRatios}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                保存配码
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {selectedStyleId && selectedSizeGroupId ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {styles.find(s => s.id === selectedStyleId)?.name} - {sizeGroups.find(g => g.id === selectedSizeGroupId)?.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  设置各尺码的配比数量，总配数：<span className="font-medium text-blue-600">{getTotalRatio()}</span>
                </p>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {getSizesForGroup().map((item) => (
                  <div key={item.size_id} className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-lg font-medium text-gray-900 mb-3">{item.size_name}</div>
                    <input
                      type="number"
                      value={ratioValues[item.size_id] || 1}
                      onChange={(e) => handleRatioChange(item.size_id, parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-500 mt-2">配比数量</div>
                  </div>
                ))}
              </div>

              {getSizesForGroup().length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>该尺码组暂无尺码，请先在尺码管理中添加尺码</p>
                </div>
              )}

              {/* 配码预览 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">配码预览（示例：10箱）</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-3">
                    {getSizesForGroup().map((item) => {
                      const ratio = ratioValues[item.size_id] || 1;
                      const total = ratio * 10;
                      return (
                        <div key={item.size_id} className="bg-white rounded px-3 py-2 border border-gray-200">
                          <span className="font-medium">{item.size_name}</span>
                          <span className="text-gray-500 mx-2">×</span>
                          <span className="text-blue-600 font-medium">{total}</span>
                          <span className="text-gray-500 text-sm">双</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    总计：<span className="font-medium">{getTotalRatio() * 10}</span> 双
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Grid3X3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>请选择款号和尺码组来配置配码规则</p>
              <p className="text-sm mt-2">配码规则用于订单录入时自动计算各尺码数量</p>
            </div>
          )}
        </div>
      </div>

      {/* 已保存的配码规则列表 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">已保存的配码规则</h3>
        </div>
        <div className="p-4">
          {ratios.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">款号</th>
                  <th className="pb-3 font-medium">尺码组</th>
                  <th className="pb-3 font-medium">尺码</th>
                  <th className="pb-3 font-medium">配比</th>
                  <th className="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {ratios.map((ratio) => {
                  const style = styles.find(s => s.id === ratio.style_id);
                  const group = sizeGroups.find(g => g.id === ratio.size_group_id);
                  const size = sizes.find(s => s.id === ratio.size_id);
                  return (
                    <tr key={ratio.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3">{style?.code} - {style?.name}</td>
                      <td className="py-3">{group?.name}</td>
                      <td className="py-3">{size?.name}</td>
                      <td className="py-3 font-medium">{ratio.ratio}</td>
                      <td className="py-3">
                        <button
                          onClick={async () => {
                            if (!confirm('确定删除该配码规则？')) return;
                            try {
                              const res = await fetch(`/api/size_ratios/${ratio.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                message.success('删除成功');
                                fetchData();
                              }
                            } catch (e) {
                              message.error('删除失败');
                            }
                          }}
                          className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>暂无配码规则数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}