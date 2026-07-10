import { useState, useEffect } from 'react';
import { ArrowLeft, Users, ShoppingCart, Truck, RefreshCcw, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SalesPage() {
  const [stats, setStats] = useState({
    customerCount: 0,
    orderCount: 0,
    orderAmount: 0,
    deliveryCount: 0,
    returnCount: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/sales-orders').then(r => r.json()),
      fetch('/api/deliveries').then(r => r.json()),
      fetch('/api/returns').then(r => r.json())
    ]).then(([customers, orders, deliveries, returns]) => {
      const orderList = Array.isArray(orders) ? orders : [];
      setStats({
        customerCount: Array.isArray(customers) ? customers.filter((c: any) => c.status === 'active').length : 0,
        orderCount: orderList.length,
        orderAmount: orderList.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
        deliveryCount: Array.isArray(deliveries) ? deliveries.filter((d: any) => d.status === 'shipped').length : 0,
        returnCount: Array.isArray(returns) ? returns.length : 0,
        pendingOrders: orderList.filter((o: any) => o.status === 'pending').length
      });
    });
  }, []);

  const modules = [
    {
      title: '客户管理',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      items: [
        { label: '客户分组', to: '/sales/customer-groups', desc: '客户分类与折扣配置' },
        { label: '客户档案', to: '/sales/customers', desc: '客户基本信息管理' },
      ],
    },
    {
      title: '订单管理',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      items: [
        { label: '销售订单', to: '/sales/orders', desc: '订单录入与审核（含矩阵）' },
        { label: '发货管理', to: '/sales/deliveries', desc: '发货单与物流跟踪' },
        { label: '退货管理', to: '/sales/returns', desc: '退货申请与处理' },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">销售管理</h1><p className="text-sm text-gray-500">客户、订单、发货全流程管理</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">活跃客户</span><Users className="w-5 h-5 text-blue-500" /></div>
          <div className="text-2xl font-bold text-gray-900">{stats.customerCount}</div>
          <div className="text-xs text-gray-400 mt-1">位客户</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">待审核订单</span><ShoppingCart className="w-5 h-5 text-green-500" /></div>
          <div className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</div>
          <div className="text-xs text-gray-400 mt-1">笔订单</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">订单总金额</span><DollarSign className="w-5 h-5 text-purple-500" /></div>
          <div className="text-2xl font-bold text-gray-900">¥{stats.orderAmount.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">本月累计</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">订单总数</span><Package className="w-5 h-5 text-orange-500" /></div>
          <div className="text-2xl font-bold text-gray-900">{stats.orderCount}</div>
          <div className="text-xs text-gray-400 mt-1">笔订单</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">发货中</span><Truck className="w-5 h-5 text-cyan-500" /></div>
          <div className="text-2xl font-bold text-gray-900">{stats.deliveryCount}</div>
          <div className="text-xs text-gray-400 mt-1">单发货</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">退货申请</span><RefreshCcw className="w-5 h-5 text-red-500" /></div>
          <div className="text-2xl font-bold text-gray-900">{stats.returnCount}</div>
          <div className="text-xs text-gray-400 mt-1">笔退货</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modules.map((module, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center`}>
                  <module.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{module.title}</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {module.items.map((item, idx) => (
                  <Link key={idx} to={item.to} className={`flex items-center justify-between p-3 rounded-lg ${module.bgColor} hover:opacity-80 transition-opacity`}>
                    <div>
                      <div className={`font-medium ${module.textColor}`}>{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                    <ArrowLeft className={`w-4 h-4 ${module.textColor}`} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
