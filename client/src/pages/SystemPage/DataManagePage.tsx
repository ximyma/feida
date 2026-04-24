import React, { useState, useEffect } from 'react';

const TITLE = '数据管理';

export default function DataManagePage() {
  const [dbStats, setDbStats] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const tables = [
        'employees','departments','positions','ranks','users','roles','permissions',
        'shift_types','schedules','attendance_records','leave_records','leave_balances',
        'overtime_records','salaries','contracts','candidates','interviews','offers',
        'kpis','performance_records','approval_requests','approval_records',
        'dormitories','vehicles','visitors','announcements','documents',
        'system_config','audit_logs','login_logs','data_backups',
        'employee_changes','field_definitions','reminders',
        'training_plans','training_courses','training_records',
        'recruitment_positions','resumes','talent_profiles',
        'company_contributions','salary_adjustments','salary_items',
        'survey_questions','survey_responses','surveys',
        'assessment_tools','assessment_results','competency_items',
        'canteens','meal_records','vehicle_usage','dormitory_assignments',
        'daily_attendance_reports','monthly_attendance_summary',
        'approval_flows','shift_change_requests','check_locations',
        'attendance_rules','contract_templates','document_folders',
        'performance_cycles','performance_grades','print_templates',
        'employee_subsets','subset_records','reminder_logs',
        'talent_pools','talent_reports','training_evaluations',
        'model_competencies','competency_levels','competency_models',
        'announcement_reads','data_backups','login_logs',
        'salary_item_templates','location_allowances'
      ];

      const results = await Promise.all(
        tables.map(async (t) => {
          try {
            const res = await fetch(`/api/${t}`);
            const data = await res.json();
            return { table: t, count: Array.isArray(data) ? data.length : 0 };
          } catch { return { table: t, count: -1 }; }
        })
      );

      setDbStats(results.filter(r => r.count >= 0).sort((a, b) => b.count - a.count));
      
      // Get backups
      try {
        const res = await fetch('/api/data_backups');
        const data = await res.json();
        setBackups(Array.isArray(data) ? data : []);
      } catch {}
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const allData: Record<string, any[]> = {};
      for (const stat of dbStats) {
        try {
          const res = await fetch(`/api/${stat.table}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) allData[stat.table] = data;
        } catch {}
      }
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feida-hr-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      alert('数据导出成功！');
    } catch { alert('导出失败'); }
    setExporting(false);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!confirm(`确定导入文件「${file.name}」？此操作将覆盖现有数据！`)) return;
      setImporting(true);
      try {
        const text = await file.text();
        const allData = JSON.parse(text);
        let imported = 0;
        for (const [table, items] of Object.entries(allData)) {
          if (!Array.isArray(items)) continue;
          for (const item of items as any[]) {
            try {
              const body = { ...item };
              if (!body.id) body.id = `${table.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
              if (!body.createdAt) body.createdAt = new Date().toISOString();
              await fetch(`/api/${table}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
              imported++;
            } catch {}
          }
        }
        alert(`导入完成！共导入 ${imported} 条数据`);
        fetchAllData();
      } catch { alert('导入失败，请检查文件格式'); }
      setImporting(false);
    };
    input.click();
  };

  const handleClearTable = async (tableName: string) => {
    if (!confirm(`⚠️ 确定清空表「${tableName}」的所有数据？此操作不可撤销！`)) return;
    try {
      const res = await fetch(`/api/${tableName}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          try { await fetch(`/api/${tableName}/${item.id}`, { method: 'DELETE' }); } catch {}
        }
        alert(`已清空 ${tableName}（${data.length} 条）`);
        fetchAllData();
      }
    } catch { alert('操作失败'); }
  };

  const totalRecords = dbStats.reduce((sum, s) => sum + s.count, 0);
  const tableCount = dbStats.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">数据库备份与恢复、数据导入导出</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleImportData} disabled={importing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50">
            {importing ? '⏳ 导入中...' : '📥 导入数据'}
          </button>
          <button onClick={handleExportAll} disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
            {exporting ? '⏳ 导出中...' : '📤 导出全部'}
          </button>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">数据表总数</div>
          <div className="text-3xl font-bold text-blue-600">{tableCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">总记录数</div>
          <div className="text-3xl font-bold text-green-600">{totalRecords.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">备份记录</div>
          <div className="text-3xl font-bold text-purple-600">{backups.length}</div>
        </div>
      </div>

      {/* 备份历史 */}
      {backups.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm mb-3">📦 备份历史</h3>
          <div className="space-y-2">
            {backups.map((b: any, i: number) => (
              <div key={b.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💾</span>
                  <div>
                    <div className="text-sm font-medium">{b.name || b.fileName || `备份 #${i + 1}`}</div>
                    <div className="text-xs text-gray-400">{b.createdAt ? b.createdAt.slice(0, 19).replace('T', ' ') : '-'}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{b.size || '-'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 表数据详情 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-sm">📊 数据表统计</h3>
            <p className="text-xs text-gray-400 mt-1">点击「清空」可删除表中所有数据（谨慎操作）</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-600">表名</th>
                  <th className="text-right p-3 font-medium text-gray-600">记录数</th>
                  <th className="text-right p-3 font-medium text-gray-600">占比</th>
                  <th className="text-center p-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {dbStats.map((s, i) => (
                  <tr key={s.table} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{s.table}</td>
                    <td className="p-3 text-right font-bold">{s.count.toLocaleString()}</td>
                    <td className="p-3 text-right text-xs text-gray-500">{totalRecords > 0 ? (s.count / totalRecords * 100).toFixed(1) : 0}%</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleClearTable(s.table)}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200">
                        清空
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
