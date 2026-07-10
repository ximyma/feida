import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface WorkOrder {
  id: string;
  code: string;
  style_code: string;
  style_name: string;
  process_code: string;
  process_name: string;
  scheduled_qty: number;
  actual_qty: number;
  status: string;
}

const STATUS_MAP: Record<string, string> = { pending: '待派工', dispatched: '已派工', in_progress: '进行中', completed: '已完成' };

export default function ReportingPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [reportModal, setReportModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [reportData, setReportData] = useState({ actual_qty: '', scrap_qty: '', remark: '' });

  useEffect(() => {
    fetch('/api/work-orders').then(r => r.json()).then(data => {
      const inProgressOrders = (Array.isArray(data) ? data : []).filter((o: any) => o.status === 'in_progress');
      setOrders(inProgressOrders);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const handleReport = (order: WorkOrder) => {
    setSelectedOrder(order);
    setReportData({ actual_qty: '', scrap_qty: '', remark: '' });
    setReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedOrder || !reportData.actual_qty) {
      message.warning('请填写报工数量');
      return;
    }
    try {
      await fetch(`/api/work-orders/${selectedOrder.id}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      message.success('报工成功');
      setReportModal(false);
      setSelectedOrder(null);
      fetch('/api/work-orders').then(r => r.json()).then(data => {
        const inProgressOrders = (Array.isArray(data) ? data : []).filter((o: any) => o.status === 'in_progress');
        setOrders(inProgressOrders);
      });
    } catch (e) { message.error('报工失败'); }
  };

  const filtered = orders.filter(o => 
    o.code.toLowerCase().includes(searchText.toLowerCase()) || 
    o.style_code?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/production" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">报工管理</h1><p className="text-sm text-gray-500">生产进度报工</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索工单号..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <span className="text-sm text-gray-500">当前进行中工单: {orders.length} 个</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">工单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">款号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">工序</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">计划数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">已完成</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">进度</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => {
                const progress = item.scheduled_qty > 0 ? Math.round((item.actual_qty / item.scheduled_qty) * 100) : 0;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.style_code} - {item.style_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.process_code} - {item.process_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.scheduled_qty}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.actual_qty}</td>
                    <td className="px-4 py-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{progress}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleReport(item)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">报工</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无进行中的工单</p>
            </div>
          )}
        </div>
      </div>

      {reportModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">报工 - {selectedOrder.code}</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">款号: {selectedOrder.style_code} - {selectedOrder.style_name}</p>
              <p className="text-sm text-gray-600">工序: {selectedOrder.process_code} - {selectedOrder.process_name}</p>
              <p className="text-sm text-gray-600">计划数量: {selectedOrder.scheduled_qty} | 已完成: {selectedOrder.actual_qty}</p>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">报工数量 *</label><input type="number" value={reportData.actual_qty} onChange={(e) => setReportData({ ...reportData, actual_qty: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="本次完成数量" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">损耗数量</label><input type="number" value={reportData.scrap_qty} onChange={(e) => setReportData({ ...reportData, scrap_qty: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="损耗数量" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={reportData.remark} onChange={(e) => setReportData({ ...reportData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" rows={3} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setReportModal(false); setSelectedOrder(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmitReport} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">提交报工</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
