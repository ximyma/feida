import React, { useState, useEffect } from 'react';

const TABLE = 'audit_logs';
const TITLE = '审计日志';

const ACTION_ICONS: Record<string, string> = {
  'login': '🔑', 'logout': '🚪', 'create': '➕', 'update': '✏️', 'delete': '🗑️',
  'export': '📤', 'import': '📥', 'query': '🔍', 'approve': '✅', 'reject': '❌',
  'change_password': '🔐', 'backup': '💾',
};

const MODULE_COLORS: Record<string, string> = {
  'system': 'bg-purple-100 text-purple-700',
  'personnel': 'bg-blue-100 text-blue-700',
  'attendance': 'bg-green-100 text-green-700',
  'salary': 'bg-yellow-100 text-yellow-700',
  'performance': 'bg-orange-100 text-orange-700',
  'recruitment': 'bg-pink-100 text-pink-700',
  'logistics': 'bg-teal-100 text-teal-700',
  'approval': 'bg-indigo-100 text-indigo-700',
};

export default function AuditLogPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const pageSize = 20;

  useEffect(() => { fetchData(); }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${TABLE}`);
      const json = await res.json();
      let result = Array.isArray(json) ? json : [];
      // Sort by timestamp descending
      result.sort((a: any, b: any) => {
        const ta = a.timestamp || a.createdAt || '';
        const tb = b.timestamp || b.createdAt || '';
        return tb.localeCompare(ta);
      });
      setData(result);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getUnique = (field: string) => [...new Set(data.map((d: any) => d[field]).filter(Boolean))].sort();

  const filtered = data.filter((log: any) => {
    const ts = log.timestamp || log.createdAt || '';
    const matchSearch = !search ||
      log.username?.includes(search) ||
      log.realName?.includes(search) ||
      log.action?.includes(search) ||
      log.detail?.includes(search) ||
      ts.includes(search);
    const matchModule = !filterModule || log.module === filterModule;
    const matchAction = !filterAction || log.action === filterAction;
    return matchSearch && matchModule && matchAction;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleClearLogs = async () => {
    if (!confirm('⚠️ 确定清空所有审计日志？此操作不可撤销！')) return;
    try {
      for (const item of data) {
        try { await fetch(`/api/${TABLE}/${item.id}`, { method: 'DELETE' }); } catch {}
      }
      alert(`已清空 ${data.length} 条日志`);
      fetchData();
    } catch { alert('清空失败'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">共 {filtered.length} 条记录，第 {page}/{totalPages || 1} 页</p>
        </div>
        <button onClick={handleClearLogs} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
          🗑️ 清空日志
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input type="text" placeholder="搜索用户名、操作、详情..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        <select value={filterModule} onChange={e => { setFilterModule(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">全部模块</option>
          {getUnique('module').map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">全部操作</option>
          {getUnique('action').map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">时间</th>
                    <th className="text-left p-3 font-medium text-gray-600">用户</th>
                    <th className="text-left p-3 font-medium text-gray-600">模块</th>
                    <th className="text-left p-3 font-medium text-gray-600">操作</th>
                    <th className="text-left p-3 font-medium text-gray-600">详情</th>
                    <th className="text-left p-3 font-medium text-gray-600">IP地址</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((log, i) => {
                    const ts = log.timestamp || log.createdAt || '-';
                    return (
                      <tr key={log.id || i} className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => { setSelectedLog(log); setDetailOpen(true); }}>
                        <td className="p-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                          {ts.length > 19 ? ts.slice(0, 19).replace('T', ' ') : ts}
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-sm">{log.realName || log.username || '-'}</div>
                          {log.realName && log.username && (
                            <div className="text-xs text-gray-400">{log.username}</div>
                          )}
                        </td>
                        <td className="p-3">
                          {log.module && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${MODULE_COLORS[log.module] || 'bg-gray-100 text-gray-600'}`}>
                              {log.module}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{ACTION_ICONS[log.action] || '📋'} {log.action || '-'}</span>
                        </td>
                        <td className="p-3 text-xs text-gray-500 max-w-[300px] truncate">{log.detail || '-'}</td>
                        <td className="p-3 text-xs text-gray-400 font-mono">{log.ip || '-'}</td>
                      </tr>
                    );
                  })}
                  {pageData.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">暂无日志记录</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">上一页</button>
              <span className="px-4 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">下一页</button>
            </div>
          )}
        </>
      )}

      {/* 详情弹窗 */}
      {detailOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetailOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">📋 日志详情</h3>
            <div className="space-y-3">
              {[
                ['时间', selectedLog.timestamp || selectedLog.createdAt],
                ['用户', `${selectedLog.realName || '-'}（${selectedLog.username || '-'}）`],
                ['模块', selectedLog.module],
                ['操作', `${ACTION_ICONS[selectedLog.action] || ''} ${selectedLog.action}`],
                ['详情', selectedLog.detail],
                ['IP地址', selectedLog.ip],
                ['ID', selectedLog.id],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-sm text-gray-500 w-16 shrink-0">{label}</span>
                  <span className="text-sm font-mono break-all">{value || '-'}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setDetailOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
