import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Layers, Package, Settings2, Cpu, Wrench, Box, FileText, AlertTriangle,
  ChevronRight, TrendingUp, Calendar, Database, Home, ArrowLeft
} from 'lucide-react';

interface Stats {
  materials: number;
  processes: number;
  routes: number;
  boms: number;
  components: number;
  soles: number;
}

export default function PLMPage() {
  const location = useLocation();
  const [stats, setStats] = useState<Stats>({
    materials: 0,
    processes: 0,
    routes: 0,
    boms: 0,
    components: 0,
    soles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [materials, processes, routes, boms, components, soles] = await Promise.all([
        fetch('/api/materials').then(r => r.json()),
        fetch('/api/processes').then(r => r.json()),
        fetch('/api/process-routes').then(r => r.json()),
        fetch('/api/boms').then(r => r.json()),
        fetch('/api/components').then(r => r.json()),
        fetch('/api/soles').then(r => r.json()),
      ]);
      setStats({
        materials: Array.isArray(materials) ? materials.length : 0,
        processes: Array.isArray(processes) ? processes.length : 0,
        routes: Array.isArray(routes) ? routes.length : 0,
        boms: Array.isArray(boms) ? boms.length : 0,
        components: Array.isArray(components) ? components.length : 0,
        soles: Array.isArray(soles) ? soles.length : 0,
      });
    } catch (e) {
      console.error('获取统计数据失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      title: '物料管理',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      items: [
        { label: '物料属性类型', to: '/plm/material-attributes', desc: '原材料/半成品/辅料等分类' },
        { label: '物料主数据', to: '/plm/materials', desc: '物料编码、规格、供应商' },
        { label: '大底资料库', to: '/plm/soles', desc: '鞋底型号、模具、供应商' },
        { label: '季节物料库', to: '/plm/season-materials', desc: '按季节管理物料' },
      ],
    },
    {
      title: '工艺管理',
      icon: Settings2,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      items: [
        { label: '工序库', to: '/plm/processes', desc: '裁断/针车/成型/包装工序' },
        { label: '工艺路线', to: '/plm/process-routes', desc: '工序组合与标准工时' },
        { label: '部件库', to: '/plm/components', desc: '鞋面/鞋底/内里等部件' },
        { label: '损耗规则', to: '/plm/scrap-rules', desc: '物料/工艺损耗配置' },
      ],
    },
    {
      title: 'BOM管理',
      icon: Layers,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      items: [
        { label: 'BOM清单', to: '/plm/boms', desc: '物料清单（开发BOM/技术BOM）' },
        { label: 'BOM明细', to: '/plm/bom-items', desc: '物料用量、损耗率' },
      ],
    },
  ];

  const statCards = [
    { label: '物料数', value: stats.materials, icon: Package, color: 'blue' },
    { label: '工序数', value: stats.processes, icon: Wrench, color: 'purple' },
    { label: '工艺路线', value: stats.routes, icon: Cpu, color: 'green' },
    { label: 'BOM数', value: stats.boms, icon: Layers, color: 'orange' },
    { label: '部件数', value: stats.components, icon: Box, color: 'pink' },
    { label: '大底数', value: stats.soles, icon: AlertTriangle, color: 'red' },
  ];

  return (
    <div className="p-6">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/product" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">工艺管理 / PLM</h1>
            <p className="text-sm text-gray-500">产品生命周期管理 - BOM、工艺路线、工序配置</p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-${card.color}-500`}>
                <card.icon className="w-5 h-5" />
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '-' : card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 功能模块 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${module.color} p-4`}>
              <div className="flex items-center gap-3 text-white">
                <module.icon className="w-6 h-6" />
                <h2 className="text-lg font-semibold">{module.title}</h2>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {module.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 使用指南 */}
      <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          使用流程指南
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3 text-sm font-bold">1</div>
            <h4 className="font-medium text-gray-900 mb-1">基础数据维护</h4>
            <p className="text-sm text-gray-500">先配置物料属性类型、颜色、尺码等基础数据</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3 text-sm font-bold">2</div>
            <h4 className="font-medium text-gray-900 mb-1">建立物料库</h4>
            <p className="text-sm text-gray-500">录入所有原材料、半成品、辅料等物料信息</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3 text-sm font-bold">3</div>
            <h4 className="font-medium text-gray-900 mb-1">配置工艺路线</h4>
            <p className="text-sm text-gray-500">定义工序库和工艺路线，设置标准工时和计件单价</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3 text-sm font-bold">4</div>
            <h4 className="font-medium text-gray-900 mb-1">编制BOM</h4>
            <p className="text-sm text-gray-500">为产品编制物料清单和工艺清单</p>
          </div>
        </div>
      </div>

      {/* 鞋服行业说明 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          鞋服行业PLM特点
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>支持物料按颜色、尺码维度管理（同一物料有多个颜色/尺码变体）</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>BOM用量支持颜色×尺码矩阵配置（不同尺码用量不同）</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>工艺路线含计件工资配置，直接对接薪酬管理</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>大底资料库专项管理鞋底型号、模具、材质</span>
          </div>
        </div>
      </div>
    </div>
  );
}
