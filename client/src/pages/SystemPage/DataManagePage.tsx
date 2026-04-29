import React, { useState, useEffect } from 'react';

const TITLE = '数据管理';

const SAFE_TABLES = [
  'permissions', 'roles', 'users', 'system_config',
  'departments', 'positions', 'ranks', 'shift_types',
  'check_locations', 'attendance_rules', 'leave_rule_configs',
  'training_categories'
];

export default function DataManagePage() {
  const [dbStats, setDbStats] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateTarget, setMigrateTarget] = useState('postgres');
  const [migrateConfig, setMigrateConfig] = useState({
    host: 'localhost',
    port: 5432,
    database: 'ehr',
    username: 'postgres',
    password: ''
  });
  const [migrateModalOpen, setMigrateModalOpen] = useState(false);
  const [operationMessage, setOperationMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const tables = [
        'employees', 'departments', 'positions', 'ranks', 'users', 'roles', 'permissions',
        'shift_types', 'schedules', 'attendance_records', 'leave_records', 'leave_balances',
        'overtime_records', 'salaries', 'contracts', 'candidates', 'interviews', 'offers',
        'kpis', 'performance_records', 'approval_requests', 'approval_records',
        'dormitories', 'vehicles', 'visitors', 'announcements', 'documents',
        'system_config', 'audit_logs', 'login_logs', 'data_backups',
        'employee_changes', 'field_definitions', 'reminders',
        'training_plans', 'training_courses', 'training_records',
        'recruitment_positions', 'resumes', 'talent_profiles',
        'company_contributions', 'salary_adjustments', 'salary_items',
        'survey_questions', 'survey_responses', 'surveys',
        'assessment_tools', 'assessment_results', 'competency_items',
        'canteens', 'meal_records', 'vehicle_usage', 'dormitory_assignments',
        'daily_attendance_reports', 'monthly_attendance_summary',
        'approval_flows', 'shift_change_requests', 'check_locations',
        'attendance_rules', 'contract_templates', 'document_folders',
        'performance_cycles', 'performance_grades', 'print_templates',
        'employee_subsets', 'subset_records', 'reminder_logs',
        'talent_pools', 'talent_reports', 'training_evaluations',
        'model_competencies', 'competency_levels', 'competency_models',
        'announcement_reads', 'data_backups', 'login_logs',
        'salary_item_templates', 'location_allowances',
        'training_categories', 'training_courses_v2', 'training_chapters',
        'training_reviews', 'training_review_replies', 'training_notes',
        'training_live_sessions', 'training_live_messages', 'training_live_attendances',
        'training_live_reservations', 'training_learning_paths', 'training_path_courses',
        'training_learning_progress', 'training_notifications',
        'workflow_definitions', 'workflow_form_configs', 'workflow_instances',
        'workflow_instance_nodes', 'workflow_node_assignees', 'workflow_comments',
        'meeting_rooms', 'meetings', 'office_supplies', 'supply_requests',
        'talent_tags', 'email_templates', 'email_logs',
        'training_classes', 'assessment_templates',
        'attendance_devices', 'leave_rule_configs',
        'report_definitions', 'data_sources', 'report_configs',
        'insurance_schemes', 'insured_employees', 'insurance_changes', 'insurance_ledger',
        'document_permissions', 'folder_permissions', 'file_storage',
        'survey_options', 'workflow_templates'
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
      
      try {
        const res = await fetch('/api/data_backups');
        const data = await res.json();
        setBackups(Array.isArray(data) ? data : []);
      } catch {}
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const showMsg = (msg: string) => {
    setOperationMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
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
      showMsg('数据导出成功！');
    } catch { showMsg('导出失败'); }
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
        showMsg(`导入完成！共导入 ${imported} 条数据`);
        fetchAllData();
      } catch { showMsg('导入失败，请检查文件格式'); }
      setImporting(false);
    };
    input.click();
  };

  const handleClearTable = async (tableName: string) => {
    if (SAFE_TABLES.includes(tableName)) {
      alert('此表为系统核心表，不允许清空！');
      return;
    }
    if (!confirm(`⚠️ 确定清空表「${tableName}」的所有数据？此操作不可撤销！`)) return;
    try {
      const res = await fetch(`/api/${tableName}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          try { await fetch(`/api/${tableName}/${item.id}`, { method: 'DELETE' }); } catch {}
        }
        showMsg(`已清空 ${tableName}（${data.length} 条）`);
        fetchAllData();
      }
    } catch { showMsg('操作失败'); }
  };

  const handleInitializeDB = async () => {
    if (!confirm('⚠️ 警告！此操作将清空数据库中除系统核心数据外的所有数据！\n\n保留的数据包括：\n- 管理员用户、角色、权限\n- 部门、职位、职级信息\n- 班次类型、考勤规则\n- 系统配置\n\n请确保已备份重要数据，此操作不可撤销！')) {
      return;
    }
    setInitializing(true);
    try {
      const res = await fetch('/api/db/initialize', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showMsg('数据库初始化完成！');
        fetchAllData();
      } else {
        showMsg(result.message || '初始化失败');
      }
    } catch {
      showMsg('初始化失败');
    }
    setInitializing(false);
  };

  const handleCompressDB = async () => {
    if (!confirm('确定压缩数据库？此操作将整理数据库文件，可能需要一些时间。')) return;
    setCompressing(true);
    try {
      const res = await fetch('/api/db/compress', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showMsg(`数据库压缩完成！节省空间: ${result.savedSpace || '未知'}`);
        fetchAllData();
      } else {
        showMsg(result.message || '压缩失败');
      }
    } catch {
      showMsg('压缩失败');
    }
    setCompressing(false);
  };

  const handleMigrateDB = async () => {
    if (!confirm(`确定迁移数据库到${migrateTarget === 'postgres' ? 'PostgreSQL' : 'MySQL'}？请确保目标数据库已正确配置。`)) return;
    setMigrating(true);
    try {
      const res = await fetch(`/api/db/migrate/${migrateTarget}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(migrateConfig)
      });
      const result = await res.json();
      if (result.success) {
        showMsg(`迁移完成！成功迁移 ${result.migratedTables} 张表，共 ${result.migratedRows} 条记录`);
      } else {
        showMsg(result.message || '迁移失败');
      }
    } catch (e: any) {
      showMsg('迁移失败: ' + e.message);
    }
    setMigrating(false);
    setMigrateModalOpen(false);
  };

  const totalRecords = dbStats.reduce((sum, s) => sum + s.count, 0);
  const tableCount = dbStats.length;

  return (
    <div className="space-y-6">
      {showMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg">
          {operationMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">数据库备份与恢复、数据导入导出、数据库维护</p>
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

      {/* 数据库操作卡片 */}
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

      {/* 数据库操作按钮 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-sm mb-4">⚙️ 数据库维护操作</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleInitializeDB} disabled={initializing}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2">
            <span>🔄</span>
            {initializing ? '初始化中...' : '一键初始化'}
          </button>
          <button onClick={handleCompressDB} disabled={compressing}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center gap-2">
            <span>📦</span>
            {compressing ? '压缩中...' : '压缩数据库'}
          </button>
          <button onClick={() => setMigrateModalOpen(true)} disabled={migrating}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2">
            <span>🚀</span>
            {migrating ? '迁移中...' : '迁移到其他数据库'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          💡 初始化数据库将保留：管理员用户、角色权限、部门职位、系统配置等核心数据，清空其他业务数据（员工、考勤、薪资等）
        </p>
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
            <p className="text-xs text-gray-400 mt-1">点击「清空」可删除表中所有数据（系统核心表不可清空）</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-600">表名</th>
                  <th className="text-right p-3 font-medium text-gray-600">记录数</th>
                  <th className="text-right p-3 font-medium text-gray-600">占比</th>
                  <th className="text-center p-3 font-medium text-gray-600">状态</th>
                  <th className="text-center p-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {dbStats.map((s, i) => {
                  const isSafe = SAFE_TABLES.includes(s.table);
                  return (
                    <tr key={s.table} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs">{s.table}</td>
                      <td className="p-3 text-right font-bold">{s.count.toLocaleString()}</td>
                      <td className="p-3 text-right text-xs text-gray-500">{totalRecords > 0 ? (s.count / totalRecords * 100).toFixed(1) : 0}%</td>
                      <td className="p-3 text-center">
                        {isSafe && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">系统核心</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleClearTable(s.table)}
                          disabled={isSafe}
                          className={`px-2 py-1 text-xs rounded border ${
                            isSafe 
                              ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed' 
                              : 'text-red-600 hover:bg-red-50 border-red-200'
                          }`}
                        >
                          {isSafe ? '保护' : '清空'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 迁移配置弹窗 */}
      {migrateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setMigrateModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">🚀 数据库迁移</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目标数据库类型</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setMigrateTarget('postgres'); setMigrateConfig({...migrateConfig, port: 5432}); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      migrateTarget === 'postgres' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    PostgreSQL
                  </button>
                  <button 
                    onClick={() => { setMigrateTarget('mysql'); setMigrateConfig({...migrateConfig, port: 3306}); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      migrateTarget === 'mysql' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    MySQL
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">主机地址</label>
                  <input 
                    type="text" 
                    value={migrateConfig.host}
                    onChange={e => setMigrateConfig({...migrateConfig, host: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="localhost"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">端口</label>
                  <input 
                    type="number" 
                    value={migrateConfig.port}
                    onChange={e => setMigrateConfig({...migrateConfig, port: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数据库名称</label>
                <input 
                  type="text" 
                  value={migrateConfig.database}
                  onChange={e => setMigrateConfig({...migrateConfig, database: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="ehr"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <input 
                    type="text" 
                    value={migrateConfig.username}
                    onChange={e => setMigrateConfig({...migrateConfig, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder={migrateTarget === 'postgres' ? 'postgres' : 'root'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <input 
                    type="password" 
                    value={migrateConfig.password}
                    onChange={e => setMigrateConfig({...migrateConfig, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
                ⚠️ 迁移前请确保：
                <ul className="list-disc list-inside mt-1">
                  <li>目标数据库已创建且为空</li>
                  <li>目标数据库服务已启动</li>
                  <li>已备份当前数据库数据</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setMigrateModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                取消
              </button>
              <button onClick={handleMigrateDB} disabled={migrating} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                {migrating ? '迁移中...' : '开始迁移'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}