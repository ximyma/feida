import React, { useState, useEffect } from 'react';

export default function StatisticsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employees')
      .then(r => r.json())
      .then(data => { setEmployees(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const byDept = employees.reduce((acc: Record<string, number>, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});

  const byStatus = employees.reduce((acc: Record<string, number>, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  const byLocation = employees.reduce((acc: Record<string, number>, e) => {
    const loc = e.salaryLocation || '未知';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const maxDept = Math.max(...Object.values(byDept), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📊 数据统计</h1>
        <p className="text-sm text-muted-foreground mt-1">多维度分析公司人力资源数据</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <div className="text-3xl mb-1">👥</div>
              <div className="text-3xl font-bold">{employees.length}</div>
              <div className="text-sm text-muted-foreground">员工总数</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <div className="text-3xl mb-1">🏢</div>
              <div className="text-3xl font-bold">{Object.keys(byDept).length}</div>
              <div className="text-sm text-muted-foreground">部门数量</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <div className="text-3xl mb-1">📍</div>
              <div className="text-3xl font-bold">{Object.keys(byLocation).length}</div>
              <div className="text-sm text-muted-foreground">薪资地区</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <div className="text-3xl mb-1">✅</div>
              <div className="text-3xl font-bold text-success">{byStatus.active || 0}</div>
              <div className="text-sm text-muted-foreground">在职人数</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">部门人员分布</h2>
              <div className="space-y-3">
                {Object.entries(byDept).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                  <div key={dept} className="flex items-center gap-3">
                    <span className="w-28 text-sm truncate">{dept}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full flex items-center px-2"
                        style={{ width: `${(count / maxDept) * 100}%` }}>
                        <span className="text-xs text-white font-medium">{count}人</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">员工状态分布</h2>
              <div className="space-y-4">
                {Object.entries(byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        status === 'active' ? 'bg-success' : status === 'pending' ? 'bg-yellow-400' : 'bg-muted'
                      }`} />
                      <span className="text-sm">{{ active: '在职', pending: '待入职', inactive: '离职' }[status] || status}</span>
                    </div>
                    <span className="font-semibold">{count}人</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">薪资地区分布</h2>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(byLocation).map(([loc, count]) => (
                <div key={loc} className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">{{ shenzhen: '🏙️', nanjing: '🏯', jiangxi: '🌄' }[loc] || '📍'}</div>
                  <div className="text-xl font-bold">{count}人</div>
                  <div className="text-sm text-muted-foreground">{{ shenzhen: '深圳', nanjing: '南京', jiangxi: '江西' }[loc] || loc}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
