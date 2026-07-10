import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface ProductionPlan {
  id: string;
  code: string;
  name: string;
  style_id: string;
  style_code: string;
  style_name: string;
  planned_qty: number;
  start_date: string;
  end_date: string;
  status: string;
  remark: string;
  created_at: string;
}

interface Style {
  id: string;
  code: string;
  name: string;
}

const STATUS_MAP: Record<string, string> = { draft: '草稿', approved: '已审核', in_progress: '进行中', completed: '已完成' };

export default function ProductionPlansPage() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: '', style_id: '', style_code: '', style_name: '', 
    planned_qty: '', start_date: '', end_date: '', remark: '' 
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/production-plans').then(r => r.json()),
      fetch('/api/product_styles').then(r => r.json())
    ]).then(([planData, styleData]) => {
      setPlans(Array.isArray(planData) ? planData : []);
      setStyles(Array.isArray(styleData) ? styleData : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleStyleChange = (id: string) => {
    const style = styles.find(s => s.id === id);
    setFormData({ ...formData, style_id: id, style_code: style?.code || '', style_name: style?.name || '' });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.style_id) {
      message.warning('请填写计划名称和选择款号');
      return;
    }
    try {
      await fetch('/api/production-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success('生产计划创建成功');
      setModalOpen(false);
      setFormData({ name: '', style_id: '', style_code: '', style_name: '', planned_qty: '', start_date: '', end_date: '', remark: '' });
      fetch('/api/production-plans').then(r => r.json()).then(data => setPlans(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('确定审核通过这个生产计划吗？')) return;
    try {
      await fetch(`/api/production-plans/${id}/approve`, { method: 'POST' });
      message.success('审核成功');
      fetch('/api/production-plans').then(r => r.json()).then(data => setPlans(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const filtered = plans.filter(p => {
    if (selectedStatus && p.status !== selectedStatus) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw) || 
             p.style_code?.toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/production" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">生产计划</h1><p className="text-sm text-gray-500">创建和管理生产计划</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索计划..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Plus className="w-4 h-4" /> 新建生产计划</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">计划编号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">计划名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">款号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">计划数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">开始日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">结束日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.style_code} - {item.style_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.planned_qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.start_date ? new Date(item.start_date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.end_date ? new Date(item.end_date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'draft' && (
                        <button onClick={() => handleApprove(item.id)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">审核</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无生产计划</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">新建生产计划</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">计划名称 *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">款号 *</label><select value={formData.style_id} onChange={(e) => handleStyleChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="">请选择款号</option>{styles.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">计划数量</label><input type="number" value={formData.planned_qty} onChange={(e) => setFormData({ ...formData, planned_qty: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label><input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" rows={3} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setFormData({ name: '', style_id: '', style_code: '', style_name: '', planned_qty: '', start_date: '', end_date: '', remark: '' }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">创建计划</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
