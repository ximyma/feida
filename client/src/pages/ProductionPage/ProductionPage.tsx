import { useState, useEffect } from 'react';
import { Factory, Calendar, ClipboardList, Clock, ArrowRight } from 'lucide-react';
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

export default function ProductionPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { title: '工作中心', value: '--', icon: <Factory className="w-5 h-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: '生产计划', value: '--', icon: <Calendar className="w-5 h-5" />, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: '生产工单', value: '--', icon: <ClipboardList className="w-5 h-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: '进行中', value: '--', icon: <Clock className="w-5 h-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ]);

  const quickLinks: QuickLink[] = [
    { label: '工作中心', href: '/production/work-centers', icon: <Factory className="w-5 h-5" /> },
    { label: '生产计划', href: '/production/plans', icon: <Calendar className="w-5 h-5" /> },
    { label: '生产工单', href: '/production/work-orders', icon: <ClipboardList className="w-5 h-5" /> },
    { label: '报工管理', href: '/production/reporting', icon: <Clock className="w-5 h-5" /> },
  ];

  useEffect(() => {
    Promise.all([
      fetch('/api/work-centers').then(r => r.json()),
      fetch('/api/production-plans').then(r => r.json()),
      fetch('/api/work-orders').then(r => r.json()),
    ]).then(([centers, plans, orders]) => {
      const inProgressOrders = orders.filter((o: any) => o.status === 'in_progress').length;
      
      setStats([
        { title: '工作中心', value: Array.isArray(centers) ? centers.length.toString() : '--', icon: <Factory className="w-5 h-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { title: '生产计划', value: Array.isArray(plans) ? plans.length.toString() : '--', icon: <Calendar className="w-5 h-5" />, color: 'text-green-600', bgColor: 'bg-green-50' },
        { title: '生产工单', value: Array.isArray(orders) ? orders.length.toString() : '--', icon: <ClipboardList className="w-5 h-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { title: '进行中', value: inProgressOrders.toString(), icon: <Clock className="w-5 h-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      ]);
    });
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"><Factory className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">生产现场管理</h1><p className="text-sm text-gray-500">生产计划、工单管理、报工管理</p></div>
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
              <span className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">{link.icon}</span>
              <span className="text-sm font-medium text-gray-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
