import React, { useState, useEffect } from 'react';

export default function PerformancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/performance_records')
      .then(r => r.json())
      .then(data => { setRecords(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🎯 绩效管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理KPI指标、考核周期、考核记录和等级</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="text-3xl mb-1">📋</div>
          <div className="text-3xl font-bold">{records.length}</div>
          <div className="text-sm text-muted-foreground">考核记录</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="text-3xl mb-1">🏆</div>
          <div className="text-3xl font-bold">4</div>
          <div className="text-sm text-muted-foreground">考核等级</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="text-3xl mb-1">📅</div>
          <div className="text-3xl font-bold">2</div>
          <div className="text-sm text-muted-foreground">进行中周期</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <div className="text-3xl mb-1">📊</div>
          <div className="text-3xl font-bold">85</div>
          <div className="text-sm text-muted-foreground">平均分</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-4">考核等级标准</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { grade: 'A', name: '卓越', score: '90-100', color: 'bg-purple-500', desc: '超出预期，表现卓越' },
            { grade: 'B', name: '优秀', score: '80-89', color: 'bg-success', desc: '达到预期，表现优秀' },
            { grade: 'C', name: '合格', score: '70-79', color: 'bg-yellow-500', desc: '基本达到预期' },
            { grade: 'D', name: '待改进', score: '60-69', color: 'bg-orange-500', desc: '需要改进提升' },
          ].map(g => (
            <div key={g.grade} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className={`w-12 h-12 rounded-lg ${g.color} flex items-center justify-center text-white text-xl font-bold`}>{g.grade}</div>
              <div>
                <div className="font-semibold">{g.name}</div>
                <div className="text-sm text-muted-foreground">{g.score}分 | {g.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">考核记录</h2>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">暂无考核记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {['姓名', '工号', '考核周期', '总分', '等级', '评价'].map(h => (
                    <th key={h} className="text-left p-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id || i} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{r.employeeName}</td>
                    <td className="p-3 font-mono text-xs">{r.employeeId}</td>
                    <td className="p-3">{r.cycleName || '-'}</td>
                    <td className="p-3">{r.totalScore}</td>
                    <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{r.grade || '-'}</span></td>
                    <td className="p-3 max-w-xs truncate">{r.feedback || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
