import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Defect {
  id: string;
  code: string;
  inspection_id: string;
  defect_type: string;
  defect_level: string;
  description: string;
  quantity: number;
  cause: string;
  solution: string;
  status: string;
  responsible_person: string;
  created_at: string;
}

const TYPE_MAP: Record<string, string> = { appearance: '外观', dimension: '尺寸', function: '功能', material: '材质' };
const LEVEL_MAP: Record<string, string> = { minor: '轻微', major: '重大', critical: '严重' };
const STATUS_MAP: Record<string, string> = { open: '待处理', processing: '处理中', closed: '已关闭' };

export default function DefectsPage() {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  
  const [formData, setFormData] = useState({ 
    inspection_id: '', defect_type: 'appearance', defect_level: 'minor',
    description: '', quantity: 1, cause: '', solution: '', responsible_person: ''
  });

  useEffect(() => {
    fetch('/api/quality-defects').then(r => r.json()).then(data => {
      setDefects(Array.isArray(data) ? data : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!formData.description) {
      message.warning('请填写缺陷描述');
      return;
    }
    try {
      await fetch('/api/quality-defects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success('缺陷记录创建成功');
      setModalOpen(false);
      setFormData({ inspection_id: '', defect_type: 'appearance', defect_level: 'minor', description: '', quantity: 1, cause: '', solution: '', responsible_person: '' });
      fetch('/api/quality-defects').then(r => r.json()).then(data => setDefects(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/quality-defects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      message.success('状态更新成功');
      fetch('/api/quality-defects').then(r => r.json()).then(data => setDefects(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const filtered = defects.filter(d => {
    if (selectedStatus && d.status !== selectedStatus) return false;
    if (selectedLevel && d.defect_level !== selectedLevel) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return d.code.toLowerCase().includes(kw) || d.description?.toLowerCase().includes(kw);
    }
    return true;
  });

  const openCount = defects.filter(d => d.status === 'open').length;
  const criticalCount = defects.filter(d => d.defect_level === 'critical').length;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/quality" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">缺陷管理</h1><p className="text-sm text-gray-500">质量缺陷记录与处理</p></div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">待处理缺陷</p>
          <p className="text-2xl font-bold text-red-700">{openCount}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm text-orange-600">严重缺陷</p>
          <p className="text-2xl font-bold text-orange-700">{criticalCount}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-600">缺陷总数</p>
          <p className="text-2xl font-bold text-blue-700">{defects.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索缺陷..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">全部级别</option>
              {Object.entries(LEVEL_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Plus className="w-4 h-4" /> 新增缺陷</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">缺陷编号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">级别</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">描述</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">责任人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{TYPE_MAP[item.defect_type as keyof typeof TYPE_MAP] || item.defect_type}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.defect_level === 'critical' ? 'bg-red-100 text-red-700' :
                      item.defect_level === 'major' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {LEVEL_MAP[item.defect_level as keyof typeof LEVEL_MAP] || item.defect_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{item.description || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.responsible_person || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'open' ? 'bg-red-100 text-red-700' :
                      item.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'open' && (
                        <button onClick={() => handleUpdateStatus(item.id, 'processing')} className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700">处理</button>
                      )}
                      {item.status === 'processing' && (
                        <button onClick={() => handleUpdateStatus(item.id, 'closed')} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">关闭</button>
                      )}
                      <Link to={`/quality/corrective-actions?defect_id=${item.id}`} className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">措施</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无缺陷记录</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">新增缺陷记录</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">缺陷类型</label><select value={formData.defect_type} onChange={(e) => setFormData({ ...formData, defect_type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">缺陷级别</label><select value={formData.defect_level} onChange={(e) => setFormData({ ...formData, defect_level: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  {Object.entries(LEVEL_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">缺陷描述 *</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">数量</label><input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">责任人</label><input type="text" value={formData.responsible_person} onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">原因分析</label><textarea value={formData.cause} onChange={(e) => setFormData({ ...formData, cause: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">解决方案</label><textarea value={formData.solution} onChange={(e) => setFormData({ ...formData, solution: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setFormData({ inspection_id: '', defect_type: 'appearance', defect_level: 'minor', description: '', quantity: 1, cause: '', solution: '', responsible_person: '' }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}