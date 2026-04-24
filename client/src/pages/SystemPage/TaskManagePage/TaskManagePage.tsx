import React, { useState, useEffect } from 'react';

const TITLE = '任务管理';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待执行', color: 'bg-yellow-100 text-yellow-700' },
  running: { label: '执行中', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  failed: { label: '失败', color: 'bg-red-100 text-red-700' },
};

const TYPE_MAP: Record<string, { label: string; icon: string }> = {
  sync: { label: '数据同步', icon: '🔄' },
  backup: { label: '数据备份', icon: '💾' },
  report: { label: '报表生成', icon: '📊' },
  notification: { label: '消息通知', icon: '📧' },
  cleanup: { label: '数据清理', icon: '🗑️' },
  import: { label: '数据导入', icon: '📥' },
  export: { label: '数据导出', icon: '📤' },
};

export default function TaskManagePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'sync', schedule: '', config: '' });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setLoading(true);
    // Mock data
    setTasks([
      { id: 't1', name: '每日考勤同步', type: 'sync', status: 'completed', lastRun: '2026-04-22T08:00:00', nextRun: '2026-04-23T08:00:00', schedule: '0 8 * * *', progress: 100 },
      { id: 't2', name: '薪资月度备份', type: 'backup', status: 'completed', lastRun: '2026-04-01T00:00:00', nextRun: '2026-05-01T00:00:00', schedule: '0 0 1 * *', progress: 100 },
      { id: 't3', name: '员工生日提醒', type: 'notification', status: 'running', lastRun: '2026-04-22T09:00:00', nextRun: '2026-04-22T09:00:00', schedule: '0 9 * * *', progress: 45 },
      { id: 't4', name: '过期数据清理', type: 'cleanup', status: 'pending', lastRun: '2026-04-21T02:00:00', nextRun: '2026-04-23T02:00:00', schedule: '0 2 * * *', progress: 0 },
      { id: 't5', name: '月度考勤报表', type: 'report', status: 'failed', lastRun: '2026-04-20T10:00:00', nextRun: '2026-04-20T10:00:00', schedule: '0 10 20 * *', progress: 30, error: '数据库连接超时' },
    ]);
    setLoading(false);
  };

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q);
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchType = !filterType || t.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const handleCreate = async () => {
    setDialogOpen(false);
    fetchTasks();
  };

  const handleRun = async (taskId: string) => {
    alert('任务已触发: ' + taskId);
  };

  const handleStop = async (taskId: string) => {
    alert('任务已停止: ' + taskId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">管理系统定时任务与后台作业</p>
        </div>
        <button onClick={() => setDialogOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">新建任务</button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_MAP).map(([key, val]) => {
          const count = tasks.filter(t => t.status === key).length;
          return (
            <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${val.color}`}>{val.label}</span>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="搜索任务名称..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">全部状态</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">全部类型</option>
          {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['任务名称','类型','状态','上次执行','下次执行','进度','操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">加载中...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">暂无数据</td></tr>
              ) : filtered.map(task => {
                const typeInfo = TYPE_MAP[task.type] || { label: task.type, icon: '📌' };
                const statusInfo = STATUS_MAP[task.status] || { label: task.status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeInfo.icon}</span>
                        <span className="font-medium text-gray-900">{task.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{typeInfo.label}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{task.lastRun ? task.lastRun.replace('T', ' ').slice(0, 16) : '-'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{task.nextRun ? task.nextRun.replace('T', ' ').slice(0, 16) : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[80px]">
                          <div className={`h-full ${task.status === 'failed' ? 'bg-red-500' : task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {task.status === 'pending' && <button onClick={() => handleRun(task.id)} className="text-green-600 hover:text-green-800 text-xs">执行</button>}
                        {task.status === 'running' && <button onClick={() => handleStop(task.id)} className="text-red-600 hover:text-red-800 text-xs">停止</button>}
                        <button className="text-blue-600 hover:text-blue-800 text-xs">日志</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新建任务弹窗 */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold">新建定时任务</h3>
              <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">任务名称</label>
                <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">任务类型</label>
                <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cron 表达式</label>
                <input type="text" value={form.schedule} onChange={e => setForm(prev => ({ ...prev, schedule: e.target.value }))} placeholder="0 8 * * *" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">示例: 0 8 * * * 表示每天8点执行</p>
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-2">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">取消</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
