import React, { useState, useEffect } from 'react';

interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
}

export default function PluginManagePage() {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/plugins');
      const d = await r.json();
      setPlugins(Array.isArray(d) ? d : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggle = async (p: PluginInfo) => {
    setBusy(p.id);
    try {
      await fetch(`/api/plugins/${p.id}/toggle`, { method: 'POST' });
      await fetchData();
    } catch (e) { console.error(e); }
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">插件管理</h2>
        <p className="text-sm text-gray-500">已注册插件列表，可启停。插件在后端静态注册，运行时按启用状态决定是否响应请求。</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plugins.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-base">{p.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{p.id} · v{p.version}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.enabled ? '已启用' : '已停用'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{p.description || '暂无描述'}</p>
              <button
                disabled={busy === p.id}
                onClick={() => toggle(p)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${p.enabled ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
              >
                {busy === p.id ? '处理中...' : (p.enabled ? '停用' : '启用')}
              </button>
            </div>
          ))}
          {plugins.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">暂无插件</div>}
        </div>
      )}
    </div>
  );
}
