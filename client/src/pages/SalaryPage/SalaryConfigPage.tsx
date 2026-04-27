import React, { useState, useEffect } from 'react';

interface SalaryItem {
  id: string;
  name: string;
  code: string;
  type: 'earnings' | 'deduction' | 'insurance' | 'tax';
  dataType: 'number' | 'text' | 'date';
  decimalPlaces: number;
  formula?: string;
  defaultValue?: number;
  isTaxable: number;
  sortOrder: number;
  isActive: number;
  category?: string;
}

interface RankSalary {
  rankId: string;
  rankName: string;
  items: Record<string, number>;
}

const salaryItemTypeMap: Record<string, { label: string; color: string }> = {
  earnings: { label: '应发项', color: 'bg-green-100 text-green-700' },
  deduction: { label: '扣款项', color: 'bg-red-100 text-red-700' },
  insurance: { label: '社保', color: 'bg-blue-100 text-blue-700' },
  tax: { label: '税', color: 'bg-purple-100 text-purple-700' },
};

export default function SalaryConfigPage() {
  const [activeTab, setActiveTab] = useState<'items' | 'rank' | 'scheme' | 'analysis'>('items');
  const [salaryItems, setSalaryItems] = useState<SalaryItem[]>([]);
  const [ranks, setRanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 表单状态
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingItem, setEditingItem] = useState<SalaryItem | null>(null);
  
  // 职级工资
  const [selectedRank, setSelectedRank] = useState<string>('');
  const [rankSalaries, setRankSalaries] = useState<Record<string, Record<string, number>>>({});
  
  // 分析
  const [analysisConfig, setAnalysisConfig] = useState({
    department: '',
    month: new Date().toISOString().slice(0, 7),
    items: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemRes, rankRes] = await Promise.all([
        fetch('/api/salary_items'),
        fetch('/api/ranks'),
      ]);
      
      const itemData = await itemRes.json();
      const rankData = await rankRes.json();
      
      setSalaryItems(Array.isArray(itemData) ? itemData : []);
      setRanks(Array.isArray(rankData) ? rankData : []);
    } catch (e) {
      console.error('加载数据失败:', e);
    }
    setLoading(false);
  };

  // 工资项管理
  const handleItemSubmit = async () => {
    const data = {
      ...formData,
      id: editingItem?.id || `item_${Date.now()}`,
      isActive: formData.isActive ? 1 : 0,
      isTaxable: formData.isTaxable ? 1 : 0,
    };
    
    try {
      if (editingItem) {
        await fetch(`/api/salary_items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch('/api/salary_items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      setShowDialog(false);
      loadData();
    } catch (e) {
      console.error('保存失败:', e);
    }
  };

  const handleItemDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return;
    try {
      await fetch(`/api/salary_items/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error('删除失败:', e);
    }
  };

  // 职级工资
  const handleRankSalaryChange = (rankId: string, itemId: string, value: number) => {
    setRankSalaries(prev => ({
      ...prev,
      [rankId]: {
        ...(prev[rankId] || {}),
        [itemId]: value,
      },
    }));
  };

  const handleRankSalarySave = async () => {
    // 保存到后端
    alert('职级工资标准已保存');
  };

  const renderItemsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">工资项目管理</h2>
        <button
          onClick={() => { setEditingItem(null); setFormData({ name: '', code: '', type: 'earnings', dataType: 'number', decimalPlaces: 2, defaultValue: 0, isTaxable: false, sortOrder: 0, isActive: true, formula: '' }); setShowDialog(true); }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          + 新增工资项
        </button>
      </div>
      
      <div className="bg-card border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">项目名称</th>
              <th className="p-3 text-left">编码</th>
              <th className="p-3 text-center">类型</th>
              <th className="p-3 text-center">数据类型</th>
              <th className="p-3 text-center">小数位</th>
              <th className="p-3 text-center">计税</th>
              <th className="p-3 text-center">状态</th>
              <th className="p-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {salaryItems.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">暂无工资项</td></tr>
            ) : (
              salaryItems.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(item => (
                <tr key={item.id} className="hover:bg-accent/30">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-sm font-mono">{item.code}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${salaryItemTypeMap[item.type]?.color || 'bg-gray-100'}`}>
                      {salaryItemTypeMap[item.type]?.label || item.type}
                    </span>
                  </td>
                  <td className="p-3 text-center">{item.dataType}</td>
                  <td className="p-3 text-center">{item.decimalPlaces}</td>
                  <td className="p-3 text-center">{item.isTaxable ? '是' : '否'}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.isActive ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => { setEditingItem(item); setFormData(item); setShowDialog(true); }}
                      className="text-primary hover:underline mr-2"
                    >
                      编辑
                    </button>
                    <button onClick={() => handleItemDelete(item.id)} className="text-destructive hover:underline">删除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRankTab = () => {
    const earningsItems = salaryItems.filter(i => i.type === 'earnings' && i.isActive);
    
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">职级工资标准</h2>
          <button onClick={handleRankSalarySave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            保存设置
          </button>
        </div>
        
        <div className="bg-card border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left min-w-[120px]">职级</th>
                {earningsItems.map(item => (
                  <th key={item.id} className="p-3 text-center min-w-[100px]">
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {ranks.length === 0 ? (
                <tr><td colSpan={earningsItems.length + 1} className="p-8 text-center text-muted-foreground">暂无职级数据</td></tr>
              ) : (
                ranks.map(rank => (
                  <tr key={rank.id} className="hover:bg-accent/30">
                    <td className="p-3 font-medium">{rank.name}</td>
                    {earningsItems.map(item => (
                      <td key={item.id} className="p-2">
                        <input
                          type="number"
                          value={rankSalaries[rank.id]?.[item.id] || 0}
                          onChange={e => handleRankSalaryChange(rank.id, item.id, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border rounded text-center"
                          placeholder="0"
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2">
          * 设置各职级对应工资项的标准金额，用于新员工定薪或调薪参考
        </p>
      </div>
    );
  };

  const renderSchemeTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">工资方案</h2>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          + 新增方案
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {[
          { name: '默认方案', desc: '适用于所有员工的标准工资方案', items: salaryItems.filter(i => i.isActive).length },
          { name: '高管方案', desc: '适用于管理层，含绩效奖金', items: salaryItems.filter(i => i.isActive).length },
          { name: '销售方案', desc: '适用于销售人员，含提成', items: salaryItems.filter(i => i.isActive).length },
        ].map((scheme, idx) => (
          <div key={idx} className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{scheme.name}</h3>
              <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">启用中</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{scheme.desc}</p>
            <div className="text-sm">
              <span className="text-muted-foreground">工资项：</span>
              <span className="font-medium">{scheme.items} 项</span>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <button className="text-sm text-primary hover:underline">编辑</button>
              <button className="text-sm text-muted-foreground hover:underline">复制</button>
              <button className="text-sm text-destructive hover:underline">删除</button>
            </div>
          </div>
        ))}
      </div>
      
      <h3 className="font-medium mt-8 mb-3">计算公式示例</h3>
      <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm">
        <p>应发工资 = 基本工资 + 岗位工资 + 绩效工资 + 加班费 + 各项补贴</p>
        <p>实发工资 = 应发工资 - 个人社保 - 个人公积金 - 个税</p>
        <p>公司成本 = 实发工资 + 公司社保 + 公司公积金</p>
      </div>
    </div>
  );

  const renderAnalysisTab = () => {
    const [results, setResults] = useState<any[]>([]);
    const departments = ['研发部', '销售部', '人事部', '财务部', '行政部'];
    
    const handleAnalysis = async () => {
      try {
        const params = new URLSearchParams();
        if (analysisConfig.department) params.set('department', analysisConfig.department);
        if (analysisConfig.month) params.set('month', analysisConfig.month);
        const res = await fetch(`/api/salary_analysis?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : data.results || []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      }
    };
    
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">工资分析表</h2>
        
        <div className="bg-card border rounded-lg p-4 mb-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">部门</label>
              <select
                value={analysisConfig.department}
                onChange={e => setAnalysisConfig({ ...analysisConfig, department: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">全部部门</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">月份</label>
              <input
                type="month"
                value={analysisConfig.month}
                onChange={e => setAnalysisConfig({ ...analysisConfig, month: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button onClick={handleAnalysis} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                开始分析
              </button>
            </div>
          </div>
        </div>
        
        {results.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">部门人数</p>
                <p className="text-2xl font-bold">{results[0].count}</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">平均工资</p>
                <p className="text-2xl font-bold">{results[0].avgSalary.toLocaleString()}</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">工资总额</p>
                <p className="text-2xl font-bold">{results[0].total.toLocaleString()}</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">最高工资</p>
                <p className="text-2xl font-bold text-green-600">{results[0].highest.toLocaleString()}</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">最低工资</p>
                <p className="text-2xl font-bold text-orange-600">{results[0].lowest.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-card border rounded-lg">
              <div className="p-4 border-b">
                <h3 className="font-medium">详细数据</h3>
              </div>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">部门</th>
                    <th className="p-3 text-right">人数</th>
                    <th className="p-3 text-right">平均工资</th>
                    <th className="p-3 text-right">总工资</th>
                    <th className="p-3 text-right">最高</th>
                    <th className="p-3 text-right">最低</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr key={idx} className="hover:bg-accent/30">
                      <td className="p-3 font-medium">{r.dept}</td>
                      <td className="p-3 text-right">{r.count}</td>
                      <td className="p-3 text-right">{r.avgSalary.toLocaleString()}</td>
                      <td className="p-3 text-right">{r.total.toLocaleString()}</td>
                      <td className="p-3 text-right">{r.highest.toLocaleString()}</td>
                      <td className="p-3 text-right">{r.lowest.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>请设置筛选条件后点击"开始分析"</p>
          </div>
        )}
      </div>
    );
  };

  const renderDialog = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">{editingItem ? '编辑工资项' : '新增工资项'}</h3>
          <button onClick={() => setShowDialog(false)} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">项目名称 *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="如：基本工资"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">项目编码 *</label>
            <input
              type="text"
              value={formData.code || ''}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="如：base_salary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">类型</label>
              <select
                value={formData.type || 'earnings'}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="earnings">应发项</option>
                <option value="deduction">扣款项</option>
                <option value="insurance">社保</option>
                <option value="tax">税</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">数据类型</label>
              <select
                value={formData.dataType || 'number'}
                onChange={e => setFormData({ ...formData, dataType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="number">数字</option>
                <option value="text">文本</option>
                <option value="date">日期</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">小数位数</label>
              <input
                type="number"
                value={formData.decimalPlaces ?? 2}
                onChange={e => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">默认值</label>
              <input
                type="number"
                value={formData.defaultValue || 0}
                onChange={e => setFormData({ ...formData, defaultValue: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">计算公式</label>
            <textarea
              value={formData.formula || ''}
              onChange={e => setFormData({ ...formData, formula: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
              rows={2}
              placeholder="如：base_salary * 0.2"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isTaxable !== false}
                onChange={e => setFormData({ ...formData, isTaxable: e.target.checked })}
              />
              <span className="text-sm">计入个税</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive !== false}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className="text-sm">启用</span>
            </label>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={() => setShowDialog(false)} className="px-4 py-2 border rounded-lg hover:bg-accent">取消</button>
          <button onClick={handleItemSubmit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">保存</button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">💰 薪资配置管理</h1>
          <p className="text-sm text-muted-foreground mt-1">配置工资项、职级工资、工资方案、薪资分析</p>
        </div>
      </div>
      
      <div className="border-b mb-4">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('items')} className={`px-4 py-2 border-b-2 ${activeTab === 'items' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            工资项管理
          </button>
          <button onClick={() => setActiveTab('rank')} className={`px-4 py-2 border-b-2 ${activeTab === 'rank' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            职级工资
          </button>
          <button onClick={() => setActiveTab('scheme')} className={`px-4 py-2 border-b-2 ${activeTab === 'scheme' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            工资方案
          </button>
          <button onClick={() => setActiveTab('analysis')} className={`px-4 py-2 border-b-2 ${activeTab === 'analysis' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            薪资分析
          </button>
        </div>
      </div>
      
      {activeTab === 'items' && renderItemsTab()}
      {activeTab === 'rank' && renderRankTab()}
      {activeTab === 'scheme' && renderSchemeTab()}
      {activeTab === 'analysis' && renderAnalysisTab()}
      
      {showDialog && renderDialog()}
    </div>
  );
}
