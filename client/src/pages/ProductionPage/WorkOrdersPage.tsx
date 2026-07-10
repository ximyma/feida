import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, ClipboardList, Play, StopCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface WorkOrder {
  id: string;
  code: string;
  plan_id: string;
  plan_code: string;
  style_id: string;
  style_code: string;
  style_name: string;
  process_id: string;
  process_code: string;
  process_name: string;
  work_center_id: string;
  work_center_name: string;
  scheduled_qty: number;
  actual_qty: number;
  status: string;
  created_at: string;
}

interface Style {
  id: string;
  code: string;
  name: string;
}

interface Process {
  id: string;
  code: string;
  name: string;
}

interface WorkCenter {
  id: string;
  code: string;
  name: string;
}

const STATUS_MAP: Record<string, string> = { pending: '待派工', dispatched: '已派工', in_progress: '进行中', completed: '已完成', cancelled: '已取消' };

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [formData, setFormData] = useState({ 
    plan_id: '', plan_code: '', style_id: '', style_code: '', style_name: '',
    process_id: '', process_code: '', process_name: '',
    work_center_id: '', work_center_name: '',
    scheduled_qty: '', start_date: '', end_date: '', remark: '', operator_name: ''
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/work-orders').then(r => r.json()),
      fetch('/api/product-styles').then(r => r.json()),
      fetch('/api/processes').then(r => r.json()),
      fetch('/api/work-centers').then(r => r.json())
    ]).then(([orderData, styleData, processData, centerData]) => {
      setOrders(Array.isArray(orderData) ? orderData : []);
      setStyles(Array.isArray(styleData) ? styleData : []);
      setProcesses(Array.isArray(processData) ? processData : []);
      setWorkCenters(Array.isArray(centerData) ? centerData.filter((c: any) => c.status === 'active') : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleStyleChange = (id: string) => {
    const style = styles.find(s => s.id === id);
    setFormData({ ...formData, style_id: id, style_code: style?.code || '', style_name: style?.name || '' });
  };

  const handleProcessChange = (id: string) => {
    const process = processes.find(p => p.id === id);
    setFormData({ ...formData, process_id: id, process_code: process?.code || '', process_name: process?.name || '' });
  };

  const handleWorkCenterChange = (id: string) => {
    const center = workCenters.find(c => c.id === id);
    setFormData({ ...formData, work_center_id: id, work_center_name: center?.name || '' });
  };

  const handleSubmit = async () => {
    if (!formData.style_id || !formData.process_id) {
      message.warning('请选择款号和工序');
      return;
    }
    try {
      await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success('工单创建成功');
      setModalOpen(false);
      setFormData({ plan_id: '', plan_code: '', style_id: '', style_code: '', style_name: '', process_id: '', process_code: '', process_name: '', work_center_id: '', work_center_name: '', scheduled_qty: '', start_date: '', end_date: '', remark: '', operator_name: '' });
      fetch('/api/work-orders').then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const handleStart = async (id: string) => {
    if (!window.confirm('确定开始执行此工单吗？')) return;
    try {
      await fetch(`/api/work-orders/${id}/start`, { method: 'POST' });
      message.success('已开始执行');
      fetch('/api/work-orders').then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const handleDispatch = async (id: string) => {
    const workerName = window.prompt('请输入操作工姓名');
    if (!workerName) return;
    try {
      await fetch(`/api/work-orders/${id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: '', workerName })
      });
      message.success('派工成功');
      fetch('/api/work-orders').then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : []));
    } catch (e) { message.error('操作失败'); }
  };

  const filtered = orders.filter(o => {
    if (selectedStatus && o.status !== selectedStatus) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return o.code.toLowerCase().includes(kw) || o.style_code?.toLowerCase().includes(kw);
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/production" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"><ClipboardList className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">生产工单</h1><p className="text-sm text-gray-500">创建和管理生产工单</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索工单号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">全部状态</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Plus className="w-4 h-4" /> 新建工单</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">工单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">款号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">工序</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">工作中心</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">计划数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">完成数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.style_code} - {item.style_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.process_code} - {item.process_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.work_center_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.scheduled_qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.actual_qty}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                      item.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      item.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {STATUS_MAP[item.status as keyof typeof STATUS_MAP] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <button onClick={() => handleDispatch(item.id)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">派工</button>
                      )}
                      {item.status === 'dispatched' && (
                        <button onClick={() => handleStart(item.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">开始</button>
                      )}
                      {item.status === 'in_progress' && (
                        <span className="text-sm text-orange-600">进行中...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无生产工单</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">新建生产工单</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">款号 *</label><select value={formData.style_id} onChange={(e) => handleStyleChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="">请选择款号</option>{styles.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">工序 *</label><select value={formData.process_id} onChange={(e) => handleProcessChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="">请选择工序</option>{processes.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">工作中心</label><select value={formData.work_center_id} onChange={(e) => handleWorkCenterChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="">请选择工作中心</option>{workCenters.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">计划数量</label><input type="number" value={formData.scheduled_qty} onChange={(e) => setFormData({ ...formData, scheduled_qty: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label><input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">操作人</label><input type="text" value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            </div>
            <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" rows={3} /></div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setFormData({ plan_id: '', plan_code: '', style_id: '', style_code: '', style_name: '', process_id: '', process_code: '', process_name: '', work_center_id: '', work_center_name: '', scheduled_qty: '', start_date: '', end_date: '', remark: '', operator_name: '' }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">创建工单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
