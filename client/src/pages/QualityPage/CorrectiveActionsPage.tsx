import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Wrench, CheckCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { message } from 'antd';

interface CorrectiveAction {
  id: string;
  defect_id: string;
  action_type: string;
  description: string;
  responsible_person: string;
  due_date: string;
  status: string;
  completed_date: string;
  effect_evaluation: string;
  created_at: string;
}

interface Defect {
  id: string;
  code: string;
  description: string;
}

const ACTION_TYPE_MAP: Record<string, string> = { correction: '纠正', preventive: '预防', improvement: '改进' };
const STATUS_MAP: Record<string, string> = { pending: '待执行', in_progress: '进行中', completed: '已完成' };

export default function CorrectiveActionsPage() {
  const [searchParams] = useSearchParams();
  const defectIdFromUrl = searchParams.get('defect_id');
  
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [formData, setFormData] = useState({ 
    defect_id: defectIdFromUrl || '', action_type: 'correction',
    description: '', responsible_person: '', due_date: ''
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/quality-corrective-actions').then(r => r.json()),
      fetch('/api/quality-defects').then(r => r.json())
    ]).then(([actionsData, defectsData]) => {
      setActions(Array.isArray(actionsData) ? actionsData : []);
      setDefects(Array.isArray(defectsData) ? defectsData : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (defectIdFromUrl) {
      setFormData({ ...formData, defect_id: defectIdFromUrl });
    }
  }, [defectIdFromUrl]);

  const handleSubmit = async () => {
    if (!formData.description || !formData.defect_id) {
      message.warning('请选择关联缺陷并填写措施描述');
      return;
    }
    try {
      await fetch('/api/quality-corrective-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success('纠正措施创建成功');
      setModalOpen(false);
      setFormData({ defect_id: '', action_type: 'correction', description: '', responsible_person: '', due_date: '' });
      fetch('/api/quality-corrective-actions').then(r => r.json()).then(data => setActions(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/quality-corrective-actions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      message.success('状态更新成功');
      fetch('/api/quality-corrective-actions').then(r => r.json()).then(data => setActions(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const filtered = actions.filter(a => {
    if (selectedStatus && a.status !== selectedStatus) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return a.description?.toLowerCase().includes(kw) || a.responsible_person?.toLowerCase().includes(kw);
    }
    return true;
  });

  const pendingCount = actions.filter(a => a.status === 'pending').length;
  const overdueCount = actions.filter(a => {
    if (a.status === 'completed') return false;
    if (!a.due_date) return false;
    return new Date(a.due_date) < new Date();
  }).length;

  const getDefectCode = (defectId: string) => {
    const defect = defects.find(d => d.id === defectId);
    return defect?.code || '-';
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/quality" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"><Wrench className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">纠正措施</h1><p className="text-sm text-gray-500">质量缺陷纠正与预防措施</p></div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-600">待执行措施</p>
          <p className="text-2xl font-bold text-purple-700">{pendingCount}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">逾期措施</p>
          <p className="text-2xl font-bold text-red-700">{overdueCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-600">已完成</p>
          <p className="text-2xl font-bold text-green-700">{actions.filter(a => a.status === 'completed').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索措施..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><Plus className="w-4 h-4" /> 新增措施</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">关联缺陷</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">措施类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">描述</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">责任人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">截止日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{getDefectCode(item.defect_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ACTION_TYPE_MAP[item.action_type as keyof typeof ACTION_TYPE_MAP] || item.action_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{item.description || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.responsible_person || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed' ? 'text-red-600' : 'text-gray-700'}>
                      {item.due_date?.split('T')[0] || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                      item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <button onClick={() => handleUpdateStatus(item.id, 'in_progress')} className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700">执行</button>
                      )}
                      {item.status === 'in_progress' && (
                        <button onClick={() => handleUpdateStatus(item.id, 'completed')} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">完成</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无纠正措施</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">新增纠正措施</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">关联缺陷 *</label><select value={formData.defect_id} onChange={(e) => setFormData({ ...formData, defect_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">请选择缺陷</option>
                {defects.filter(d => d.status !== 'closed').map(d => <option key={d.id} value={d.id}>{d.code} - {d.description?.slice(0, 30)}</option>)}
              </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">措施类型</label><select value={formData.action_type} onChange={(e) => setFormData({ ...formData, action_type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  {Object.entries(ACTION_TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label><input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">措施描述 *</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" rows={3} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">责任人</label><input type="text" value={formData.responsible_person} onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setFormData({ defect_id: '', action_type: 'correction', description: '', responsible_person: '', due_date: '' }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}