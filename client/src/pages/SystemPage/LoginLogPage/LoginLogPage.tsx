import React, { useState, useEffect } from 'react';

const TABLE = 'login_logs';
const TITLE = '登录日志';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  success: { label: '成功', color: 'bg-green-100 text-green-700' },
  failed:  { label: '失败', color: 'bg-red-100 text-red-700' },
  locked:  { label: '锁定', color: 'bg-orange-100 text-orange-700' },
};

export default function LoginLogPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const pageSize = 20;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/' + TABLE);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : [];
      arr.sort((a: any, b: any) => (b.loginTime || b.createdAt || '').localeCompare(a.loginTime || a.createdAt || ''));
      setData(arr);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || (r.username || '').toLowerCase().includes(q) || (r.ipAddress || '').includes(q) || (r.realName || '').toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const successCount = data.filter(r => r.status === 'success').length;
  const failedCount  = data.filter(r => r.status === 'failed').length;
  const todayCount   = data.filter(r => (r.loginTime || '').startsWith(new Date().toISOString().slice(0, 10))).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">记录所有用户的登录行为与安全事件</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">刷新</button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '总记录', value: data.length, color: 'from-blue-500 to-blue-600' },
          { label: '今日登录', value: todayCount, color: 'from-green-500 to-green-600' },
          { label: '登录成功', value: successCount, color: 'from-emerald-500 to-emerald-600' },
          { label: '登录失败', value: failedCount, color: 'from-red-500 to-red-600' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-xl p-5 text-white`}>
            <div className="text-white/80 text-sm mb-1">{c.label}</div>
            <div className="text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="搜索用户名 / 姓名 / IP地址..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
        >
          <option value="">全部状态</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
          <option value="locked">锁定</option>
        </select>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['用户名','姓名','登录时间','IP地址','登录方式','浏览器/设备','状态','操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">加载中...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">暂无数据</td></tr>
              ) : paged.map((row, i) => {
                const st = STATUS_MAP[row.status] || { label: row.status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={row.id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.username || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.realName || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{(row.loginTime || row.createdAt || '').replace('T', ' ').slice(0, 19)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.ipAddress || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.loginMethod || '密码登录'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{row.userAgent || row.device || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelected(row); setDetailOpen(true); }} className="text-blue-600 hover:text-blue-800 text-xs">详情</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">共 {filtered.length} 条</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50">上一页</button>
              <span className="px-3 py-1 text-sm text-gray-600">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50">下一页</button>
            </div>
          </div>
        )}
      </div>

      {detailOpen && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold">登录详情</h3>
              <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-3">
              {[
                ['用户名', selected.username],
                ['姓名', selected.realName],
                ['登录时间', (selected.loginTime || selected.createdAt || '').replace('T', ' ').slice(0, 19)],
                ['IP地址', selected.ipAddress],
                ['登录方式', selected.loginMethod || '密码登录'],
                ['状态', STATUS_MAP[selected.status]?.label || selected.status],
                ['失败原因', selected.failReason],
                ['浏览器/设备', selected.userAgent || selected.device],
                ['地理位置', selected.location],
                ['备注', selected.remark],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="flex gap-3">
                  <span className="text-gray-500 text-sm w-24 flex-shrink-0">{k}</span>
                  <span className="text-gray-900 text-sm break-all">{v as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
