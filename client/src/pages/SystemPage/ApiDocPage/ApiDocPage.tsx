import React, { useState, useEffect } from 'react';

const TITLE = 'API接口文档';

const API_MODULES = [
  { id: 'personnel', name: '人事管理', icon: '👤', endpoints: [
    { method: 'GET', path: '/api/employees', desc: '获取员工列表' },
    { method: 'GET', path: '/api/employees/:id', desc: '获取员工详情' },
    { method: 'POST', path: '/api/employees', desc: '创建员工' },
    { method: 'PUT', path: '/api/employees/:id', desc: '更新员工' },
    { method: 'DELETE', path: '/api/employees/:id', desc: '删除员工' },
    { method: 'GET', path: '/api/departments', desc: '获取部门列表' },
    { method: 'GET', path: '/api/positions', desc: '获取岗位列表' },
    { method: 'GET', path: '/api/contracts', desc: '获取合同列表' },
  ]},
  { id: 'attendance', name: '考勤管理', icon: '⏰', endpoints: [
    { method: 'GET', path: '/api/attendance_records', desc: '获取考勤记录' },
    { method: 'POST', path: '/api/attendance_records', desc: '提交打卡记录' },
    { method: 'GET', path: '/api/leave_records', desc: '获取请假记录' },
    { method: 'POST', path: '/api/leave_records', desc: '提交请假申请' },
    { method: 'GET', path: '/api/overtime_records', desc: '获取加班记录' },
    { method: 'GET', path: '/api/shift_types', desc: '获取班次类型' },
    { method: 'GET', path: '/api/schedules', desc: '获取排班数据' },
  ]},
  { id: 'salary', name: '薪酬管理', icon: '💰', endpoints: [
    { method: 'GET', path: '/api/salaries', desc: '获取薪资列表' },
    { method: 'GET', path: '/api/salaries/:id', desc: '获取薪资详情' },
    { method: 'POST', path: '/api/salaries', desc: '创建薪资记录' },
    { method: 'GET', path: '/api/salary_items', desc: '获取薪资项' },
    { method: 'GET', path: '/api/company_contributions', desc: '获取企业缴纳' },
  ]},
  { id: 'approval', name: '审批流程', icon: '📋', endpoints: [
    { method: 'GET', path: '/api/approval_requests', desc: '获取审批请求' },
    { method: 'POST', path: '/api/approval_requests', desc: '提交审批请求' },
    { method: 'PUT', path: '/api/approval_requests/:id/approve', desc: '审批通过' },
    { method: 'PUT', path: '/api/approval_requests/:id/reject', desc: '审批拒绝' },
    { method: 'GET', path: '/api/approval_flows', desc: '获取审批流程' },
  ]},
  { id: 'system', name: '系统管理', icon: '⚙️', endpoints: [
    { method: 'GET', path: '/api/users', desc: '获取用户列表' },
    { method: 'POST', path: '/api/users', desc: '创建用户' },
    { method: 'GET', path: '/api/roles', desc: '获取角色列表' },
    { method: 'GET', path: '/api/permissions', desc: '获取权限列表' },
    { method: 'GET', path: '/api/audit_logs', desc: '获取审计日志' },
    { method: 'GET', path: '/api/login_logs', desc: '获取登录日志' },
    { method: 'GET', path: '/api/system_config', desc: '获取系统配置' },
  ]},
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
  PATCH: 'bg-purple-100 text-purple-700',
};

export default function ApiDocPage() {
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);

  const filteredModules = API_MODULES.map(m => ({
    ...m,
    endpoints: m.endpoints.filter(e => 
      !search || e.path.toLowerCase().includes(search.toLowerCase()) || e.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(m => m.endpoints.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">{TITLE}</h2>
        <p className="text-sm text-gray-500">查看系统提供的所有API接口文档</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索接口路径或描述..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 接口列表 */}
        <div className="lg:col-span-2 space-y-4">
          {filteredModules.map(module => (
            <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{module.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm">{module.name}</h3>
                    <p className="text-xs text-gray-500">{module.endpoints.length} 个接口</p>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${selectedModule === module.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {selectedModule === module.id && (
                <div className="border-t border-gray-200 divide-y divide-gray-100">
                  {module.endpoints.map((ep, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedEndpoint(ep)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${selectedEndpoint?.path === ep.path ? 'bg-blue-50' : ''}`}
                    >
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                      <code className="text-sm text-gray-600 flex-1">{ep.path}</code>
                      <span className="text-xs text-gray-400">{ep.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 接口详情 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-6">
          {selectedEndpoint ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${METHOD_COLORS[selectedEndpoint.method]}`}>{selectedEndpoint.method}</span>
                <code className="text-sm font-mono">{selectedEndpoint.path}</code>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2">描述</h4>
                <p className="text-sm text-gray-600">{selectedEndpoint.desc}</p>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2">请求示例</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{`curl -X ${selectedEndpoint.method} \\
  ${selectedEndpoint.path} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>"`}
                </pre>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2">响应示例</h4>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{`{
  "success": true,
  "data": [...],
  "total": 100
}`}
                </pre>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">在线测试</button>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">📄</div>
              <p>选择一个接口查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
