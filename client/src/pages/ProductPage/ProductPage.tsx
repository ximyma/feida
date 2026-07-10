import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Palette,
  Ruler,
  Package,
  Grid3X3,
  Layers,
  Box,
  Hash,
  Scale,
  Settings,
  ChevronRight,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface Stats {
  colors: number;
  sizes: number;
  sizeGroups: number;
  categories: number;
  styles: number;
  styleColors: number;
  skus: number;
  boxTypes: number;
}

const modules = [
  {
    path: '/product/colors',
    icon: Palette,
    title: '颜色库',
    description: '管理产品颜色档案，支持潘通色号、自定义色号',
    color: 'bg-pink-500',
    statKey: 'colors',
  },
  {
    path: '/product/sizes',
    icon: Ruler,
    title: '尺码管理',
    description: '管理尺码库和尺码组，支持鞋服行业多码制',
    color: 'bg-blue-500',
    statKey: 'sizes',
  },
  {
    path: '/product/categories',
    icon: Grid3X3,
    title: '品类管理',
    description: '管理产品品类，支持多级品类分类',
    color: 'bg-green-500',
    statKey: 'categories',
  },
  {
    path: '/product/styles',
    icon: Layers,
    title: '款号管理',
    description: '管理款号档案（SPU），支持季节、品牌',
    color: 'bg-purple-500',
    statKey: 'styles',
  },
  {
    path: '/product/style-colors',
    icon: Palette,
    title: '款色管理',
    description: '管理款号+颜色变体，支持多图展示',
    color: 'bg-rose-500',
    statKey: 'styleColors',
  },
  {
    path: '/product/skus',
    icon: Package,
    title: 'SKU管理',
    description: '管理产品SKU，支持批量生成和条码管理',
    color: 'bg-orange-500',
    statKey: 'skus',
  },
  {
    path: '/product/box-types',
    icon: Box,
    title: '箱型管理',
    description: '管理包装箱型，设置箱装数量和尺寸',
    color: 'bg-cyan-500',
    statKey: 'boxTypes',
  },
  {
    path: '/product/coding-rules',
    icon: Hash,
    title: '编码规则',
    description: '配置SKU、物料等编码规则，支持表达式',
    color: 'bg-teal-500',
    statKey: null,
  },
  {
    path: '/product/size-ratios',
    icon: Scale,
    title: '配码规则',
    description: '配置款号尺码配比，用于订单和生产',
    color: 'bg-indigo-500',
    statKey: null,
  },
];

export default function ProductPage() {
  const [stats, setStats] = useState<Stats>({
    colors: 0,
    sizes: 0,
    sizeGroups: 0,
    categories: 0,
    styles: 0,
    styleColors: 0,
    skus: 0,
    boxTypes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const endpoints = [
        { key: 'colors', url: '/api/colors' },
        { key: 'sizes', url: '/api/sizes' },
        { key: 'sizeGroups', url: '/api/size_groups' },
        { key: 'categories', url: '/api/product_categories' },
        { key: 'styles', url: '/api/product_styles' },
        { key: 'styleColors', url: '/api/product_style_colors' },
        { key: 'skus', url: '/api/product_skus' },
        { key: 'boxTypes', url: '/api/box_types' },
      ];

      const results = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          const res = await fetch(url);
          const data = await res.json();
          return { key, count: Array.isArray(data) ? data.length : 0 };
        })
      );

      const newStats: Stats = { ...stats };
      results.forEach(({ key, count }) => {
        (newStats as any)[key] = count;
      });
      setStats(newStats);
    } catch (e) {
      console.error('获取统计数据失败', e);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">产品基础档案</h1>
        <p className="text-gray-500 mt-1">管理鞋服行业产品基础数据，包括颜色、尺码、款号、SKU等</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <Palette className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{stats.colors}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">颜色数</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <Ruler className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{stats.sizes}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">尺码数</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <Layers className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{stats.styles}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">款号数</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <Palette className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{stats.styleColors}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">款色数</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <Package className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{stats.skus}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">SKU数</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <Box className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{stats.boxTypes}</span>
          </div>
          <p className="text-sm opacity-80 mt-2">箱型数</p>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="mb-6 flex items-center gap-3">
        <NavLink
          to="/product/skus"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Zap className="w-4 h-4" />
          批量生成SKU
        </NavLink>
        <NavLink
          to="/product/coding-rules"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
          配置编码规则
        </NavLink>
      </div>

      {/* 功能模块 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <NavLink
            key={mod.path}
            to={mod.path}
            className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className={`${mod.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <mod.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {mod.title}
                  </h3>
                  {mod.statKey && (
                    <span className="text-sm text-gray-400">
                      {(stats as any)[mod.statKey] || 0}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {mod.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
            </div>
          </NavLink>
        ))}
      </div>

      {/* 使用说明 */}
      <div className="mt-8 bg-blue-50 rounded-xl border border-blue-100 p-5">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          使用指南
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-2">初始化步骤</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. 配置编码规则 → 设置SKU自动编码格式</li>
              <li>2. 颜色库 → 添加产品颜色（支持潘通色号）</li>
              <li>3. 尺码管理 → 创建尺码库和尺码组</li>
              <li>4. 品类管理 → 设置产品分类（鞋类/服装/配件）</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-2">产品录入步骤</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. 款号管理 → 创建款号（SPU），配置尺码组</li>
              <li>2. 款色管理 → 为款号添加颜色变体</li>
              <li>3. SKU管理 → 批量生成SKU（款色+尺码）</li>
              <li>4. 配码规则 → 设置订单配码比例</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 数据关系说明 */}
      <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="font-medium text-gray-900 mb-3">数据关系图</h3>
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-medium">款号(SPU)</div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg font-medium">款色</div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-medium">SKU</div>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          款号 + 颜色 = 款色 | 款色 + 尺码 = SKU（最终产品）
        </div>
      </div>
    </div>
  );
}