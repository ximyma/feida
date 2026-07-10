import { useState, useEffect } from 'react';
import { Shield, ClipboardCheck, AlertTriangle, Wrench, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QualityPage() {
  const [stats, setStats] = useState({
    standards: 0,
    inspections: 0,
    defects: 0,
    pendingDefects: 0
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/quality-standards').then(r => r.json()),
      fetch('/api/quality-inspections').then(r => r.json()),
      fetch('/api/quality-defects').then(r => r.json())
    ]).then(([standards, inspections, defects]) => {
      setStats({
        standards: Array.isArray(standards) ? standards.length : 0,
        inspections: Array.isArray(inspections) ? inspections.length : 0,
        defects: Array.isArray(defects) ? defects.length : 0,
        pendingDefects: Array.isArray(defects) ? defects.filter((d: any) => d.status === 'open').length : 0
      });
    }).catch(() => {});
  }, []);

  const modules = [
    { label: '质量标准', path: '/quality/standards', icon: FileText, color: 'from-blue-500 to-blue-600', count: stats.standards },
    { label: '质量检验', path: '/quality/inspections', icon: ClipboardCheck, color: 'from-green-500 to-green-600', count: stats.inspections },
    { label: '缺陷管理', path: '/quality/defects', icon: AlertTriangle, color: 'from-red-500 to-red-600', count: stats.pendingDefects },
    { label: '纠正措施', path: '/quality/corrective-actions', icon: Wrench, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">质量管理</h1><p className="text-sm text-gray-500">产品质量控制与缺陷管理</p></div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {modules.map((module, index) => (
          <Link key={index} to={module.path} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center mb-3`}>
              <module.icon className="w-6 h-6 text-white" />
            </div>
            <p className="font-medium text-gray-900">{module.label}</p>
            {module.count !== undefined && <p className="text-sm text-gray-500">{module.count} 条记录</p>}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">质量管理流程</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2"><FileText className="w-8 h-8 text-blue-600" /></div>
              <p className="text-sm text-gray-600">制定标准</p>
            </div>
            <div className="w-24 h-1 bg-gray-200"></div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2"><ClipboardCheck className="w-8 h-8 text-green-600" /></div>
              <p className="text-sm text-gray-600">质量检验</p>
            </div>
            <div className="w-24 h-1 bg-gray-200"></div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
              <p className="text-sm text-gray-600">缺陷记录</p>
            </div>
            <div className="w-24 h-1 bg-gray-200"></div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2"><Wrench className="w-8 h-8 text-purple-600" /></div>
              <p className="text-sm text-gray-600">纠正改进</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}