import { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, Download, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface QuickLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function PurchasePage() {
  const [stats, setStats] = useState<StatCard[]>([
    { title: '供应商总数', value: '--', icon: <Users className="w-5 h-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: '采购订单', value: '--', icon: <ShoppingCart className="w-5 h-5" />, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: '待入库', value: '--', icon: <Download className="w-5 h-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: '本月采购额', value: '--', icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ]);

  const quickLinks: QuickLink[] = [
    { label: '供应商分组', href: '/purchase/supplier-groups', icon: <Users className="w-5 h-5" /> },
    { label: '供应商档案', href: '/purchase/suppliers', icon: <Package className="w-5 h-5" /> },
    { label: '采购订单', href: '/purchase/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { label: '采购入库', href: '/purchase/receipts', icon: <Download className="w-5 h-5" /> },
  ];

  useEffect(() => {
    Promise.all([
      fetch('/api/suppliers').then(r => r.json()),
      fetch('/api/purchase-orders').then(r => r.json()),
    ]).then(([suppliers, orders]) => {
      const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'approved').length;
      const pendingReceipts = orders.filter((o: any) => o.status === 'approved' || o.status === 'received').length;
      const monthOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.order_date || o.created_at);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      });
      const monthAmount = monthOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

      setStats([
        { title: '供应商总数', value: Array.isArray(suppliers) ? suppliers.length.toString() : '--', icon: <Users className="w-5 h-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { title: '采购订单', value: Array.isArray(orders) ? orders.length.toString() : '--', icon: <ShoppingCart className="w-5 h-5" />, color: 'text-green-600', bgColor: 'bg-green-50' },
        { title: '待入库', value: pendingReceipts.toString(), icon: <Download className="w-5 h-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { title: '本月采购额', value: `¥${monthAmount.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      ]);
    });
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">采购管理</h1><p className="text-sm text-gray-500">供应商管理、采购订单、入库管理</p></div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center ${stat.color}`}>{stat.icon}</span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">快捷操作</h2>
        </div>
        <div className="grid grid-cols-4 gap-4 p-4">
          {quickLinks.map((link, index) => (
            <Link key={index} to={link.href} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
              <span className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">{link.icon}</span>
              <span className="text-sm font-medium text-gray-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
