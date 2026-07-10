import { useState, useEffect } from 'react';
import { DollarSign, FileText, TrendingUp, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FinancePage() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalIncome: 0,
    totalExpense: 0,
    arTotal: 0,
    apTotal: 0
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/accounts').then(r => r.json()),
      fetch('/api/ar-invoices').then(r => r.json()),
      fetch('/api/ap-invoices').then(r => r.json())
    ]).then(([accounts, arInvoices, apInvoices]) => {
      const accList = Array.isArray(accounts) ? accounts : [];
      const arList = Array.isArray(arInvoices) ? arInvoices : [];
      const apList = Array.isArray(apInvoices) ? apInvoices : [];

      const totalAssets = accList.filter((a: any) => a.type === 'asset').reduce((sum, a) => sum + (a.balance || 0), 0);
      const totalLiabilities = accList.filter((a: any) => a.type === 'liability').reduce((sum, a) => sum + (a.balance || 0), 0);
      const totalIncome = accList.filter((a: any) => a.type === 'income').reduce((sum, a) => sum + (a.balance || 0), 0);
      const totalExpense = accList.filter((a: any) => a.type === 'expense').reduce((sum, a) => sum + (a.balance || 0), 0);
      const arTotal = arList.filter((i: any) => i.status !== 'paid').reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0);
      const apTotal = apList.filter((i: any) => i.status !== 'paid').reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0);

      setStats({ totalAssets, totalLiabilities, totalIncome, totalExpense, arTotal, apTotal });
    }).catch(() => {});
  }, []);

  const modules = [
    { label: '科目管理', path: '/finance/accounts', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { label: '凭证管理', path: '/finance/journal-entries', icon: FileText, color: 'from-green-500 to-green-600' },
    { label: '应收发票', path: '/finance/ar-invoices', icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
    { label: '应付发票', path: '/finance/ap-invoices', icon: DollarSign, color: 'from-purple-500 to-purple-600' },
    { label: '收付款管理', path: '/finance/payments', icon: Wallet, color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">财务管理</h1><p className="text-sm text-gray-500">企业财务核算与资金管理</p></div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总资产</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssets.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总负债</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLiabilities.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-red-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">净资产</p>
              <p className="text-2xl font-bold text-green-600">{(stats.totalAssets - stats.totalLiabilities).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Wallet className="w-5 h-5 text-green-600" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">应收账款</p>
              <p className="text-2xl font-bold text-orange-600">{stats.arTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-orange-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">应付账款</p>
              <p className="text-2xl font-bold text-purple-600">{stats.apTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">净利润</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.totalIncome - stats.totalExpense).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-gray-600" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {modules.map((module, index) => (
          <Link key={index} to={module.path} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center mb-3`}>
              <module.icon className="w-6 h-6 text-white" />
            </div>
            <p className="font-medium text-gray-900">{module.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
