import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, DollarSign, Users, Activity } from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change?: string;
  icon: any;
  color: string;
}

interface ChartData {
  labels: string[];
  values: number[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [salesChart, setSalesChart] = useState<ChartData>({ labels: [], values: [] });
  const [stockChart, setStockChart] = useState<ChartData>({ labels: [], values: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/sales-orders').then(r => r.json()),
      fetch('/api/inventory').then(r => r.json()),
      fetch('/api/work-orders').then(r => r.json()),
      fetch('/api/ar-invoices').then(r => r.json()),
      fetch('/api/ap-invoices').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
    ]).then(([salesData, invData, prodData, arData, apData, customerData]) => {
      const sales = Array.isArray(salesData) ? salesData : [];
      const inventory = Array.isArray(invData) ? invData : [];
      const workOrders = Array.isArray(prodData) ? prodData : [];
      const arInvoices = Array.isArray(arData) ? arData : [];
      const apInvoices = Array.isArray(apData) ? apData : [];
      const customers = Array.isArray(customerData) ? customerData : [];

      const totalSales = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const totalStock = inventory.reduce((sum, i) => sum + (i.qty || 0), 0);
      const totalStockValue = inventory.reduce((sum, i) => sum + ((i.qty || 0) * (i.cost_price || 0)), 0);
      const completedOrders = workOrders.filter(w => w.status === 'completed').length;
      const pendingOrders = workOrders.filter(w => w.status !== 'completed').length;
      const arTotal = arInvoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0);
      const apTotal = apInvoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0);

      setStats([
        { title: '今日销售额', value: totalSales.toLocaleString('zh-CN', { minimumFractionDigits: 2 }), change: '+12.5%', icon: DollarSign, color: 'from-green-500 to-green-600' },
        { title: '库存总量', value: totalStock.toString(), icon: Package, color: 'from-blue-500 to-blue-600' },
        { title: '库存价值', value: totalStockValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 }), icon: DollarSign, color: 'from-purple-500 to-purple-600' },
        { title: '客户数量', value: customers.length.toString(), icon: Users, color: 'from-orange-500 to-orange-600' },
        { title: '完工工单', value: completedOrders.toString(), icon: Activity, color: 'from-teal-500 to-teal-600' },
        { title: '待处理工单', value: pendingOrders.toString(), icon: Activity, color: 'from-red-500 to-red-600' },
        { title: '应收账款', value: arTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 }), icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
        { title: '应付账款', value: apTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 }), icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
      ]);

      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      const salesByMonth = months.map((_, m) => {
        return sales.filter(s => {
          const month = new Date(s.created_at || s.order_date).getMonth();
          return month === m;
        }).reduce((sum, s) => sum + (s.total_amount || 0), 0);
      });
      setSalesChart({ labels: months, values: salesByMonth });

      const stockByCategory = ['成品', '半成品', '原材料'].map(cat => {
        return inventory.filter(i => i.category === cat).reduce((sum, i) => sum + (i.qty || 0), 0);
      });
      setStockChart({ labels: ['成品', '半成品', '原材料'], values: stockByCategory });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const maxSales = Math.max(...salesChart.values, 1);
  const maxStock = Math.max(...stockChart.values, 1);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">数据中心</h1><p className="text-sm text-gray-500">企业运营数据概览</p></div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{stat.title}</p>
              <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            {stat.change && <p className="text-xs text-green-600 mt-1">{stat.change}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">月度销售额趋势</h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {salesChart.labels.map((label, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t" 
                  style={{ height: `${(salesChart.values[index] / maxSales) * 240}px` }}>
                </div>
                <span className="text-xs text-gray-500 mt-2">{label}</span>
                <span className="text-xs font-medium text-gray-700">{salesChart.values[index].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">库存分类统计</h3>
          <div className="flex items-end justify-around h-64">
            {stockChart.labels.map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-24 rounded-t ${
                  index === 0 ? 'bg-gradient-to-t from-green-500 to-green-400' :
                  index === 1 ? 'bg-gradient-to-t from-yellow-500 to-yellow-400' :
                  'bg-gradient-to-t from-orange-500 to-orange-400'
                }`} style={{ height: `${(stockChart.values[index] / maxStock) * 200}px` }}>
                </div>
                <span className="text-sm font-medium text-gray-700 mt-2">{label}</span>
                <span className="text-xs text-gray-500">{stockChart.values[index]} 件</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">销售订单状态</h3>
          <div className="space-y-3">
            {['待审核', '已审核', '已发货', '已完成'].map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(index + 1) * 25}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">{(index + 1) * 15}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">采购订单状态</h3>
          <div className="space-y-3">
            {['待审核', '已下单', '已到货', '已入库'].map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(index + 1) * 20}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">{(index + 1) * 12}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">生产工单进度</h3>
          <div className="space-y-3">
            {['待派工', '已派工', '进行中', '已完成'].map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(index === 3 ? 45 : (index + 1) * 18)}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">{index === 3 ? 28 : (index + 1) * 8}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
