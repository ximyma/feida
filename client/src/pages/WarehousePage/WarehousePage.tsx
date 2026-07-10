import { Package, MapPin, PackageOpen, BarChart3, ClipboardList, ScanLine, ArrowLeftRight, Boxes } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WarehousePage() {
  const modules = [
    {
      title: '仓库管理',
      icon: Boxes,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      items: [
        { label: '仓库档案', to: '/warehouse/warehouses', desc: '仓库基本信息管理' },
        { label: '货位管理', to: '/warehouse/locations', desc: '库位编码与状态' },
      ],
    },
    {
      title: '库存管理',
      icon: Package,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      items: [
        { label: '库存查询', to: '/warehouse/inventory', desc: '实时库存数量查询' },
        { label: '入库管理', to: '/warehouse/stock-in', desc: '采购入库/生产入库' },
        { label: '出库管理', to: '/warehouse/stock-out', desc: '销售出库/领料出库' },
      ],
    },
    {
      title: '仓储作业',
      icon: ClipboardList,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      items: [
        { label: '库存盘点', to: '/warehouse/stock-check', desc: '盘点单管理与执行' },
        { label: '库存调拨', to: '/warehouse/transfer', desc: '仓库间库存转移' },
        { label: '条码管理', to: '/warehouse/barcodes', desc: '条码生成与打印' },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><PackageOpen className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">仓储物流管理</h1><p className="text-sm text-gray-500">仓库、库存、条码一体化管理</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className={`p-4 ${module.bgColor} border-b border-gray-100`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-3`}>
                <module.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${module.textColor}`}>{module.title}</h3>
            </div>
            <div className="p-4">
              {module.items.map((item, i) => (
                <Link key={i} to={item.to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors mb-2 last:mb-0">
                  <div className={`w-8 h-8 rounded-lg ${module.bgColor} flex items-center justify-center`}>
                    <MapPin className={`w-4 h-4 ${module.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">库存统计概览</h3></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600 mt-1">仓库数量</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600 mt-1">库存总量</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600 mt-1">SKU种类</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600 mt-1">本月出入库</div>
          </div>
        </div>
      </div>
    </div>
  );
}
