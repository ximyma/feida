import React, { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  status: string;
  birthday?: string;
  hireDate?: string;
  phone?: string;
  email?: string;
}

interface Contract {
  id: string;
  employeeId: string;
  employeeName: string;
  contractType: 'fixed_term' | 'no_term' | 'task_based';
  startDate: string;
  endDate: string;
  duration: number;
  signCount: number;
  status: 'signing' | 'active' | 'expired' | 'terminated';
  remindDays: number;
  attachment?: string;
  remark?: string;
  electronicContractId?: string;
  signedAt?: string;
  createdAt: string;
}

interface BirthdayCard {
  id: string;
  employeeId: string;
  employeeName: string;
  birthday: string;
  sent: boolean;
  sentAt?: string;
}

const contractTypeMap: Record<string, { label: string; color: string }> = {
  fixed_term: { label: '固定期限', color: 'bg-blue-100 text-blue-700' },
  no_term: { label: '无固定期限', color: 'bg-green-100 text-green-700' },
  task_based: { label: '以完成一定任务', color: 'bg-purple-100 text-purple-700' },
};

export default function ContractManagementPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'sign' | 'import' | 'remind' | 'birthday'>('list');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // 表单状态
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    contractType: 'fixed_term',
    startDate: '',
    endDate: '',
    duration: 12,
    remindDays: 30,
  });
  
  // 批量导入
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  
  // 提醒规则
  const [remindRules, setRemindRules] = useState({
    daysBefore: 30,
    enabled: true,
    targetRoles: ['HR', 'Manager'],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, contractRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/contracts'),
      ]);
      const empData = await empRes.json();
      const contractData = await contractRes.json();
      
      setEmployees(Array.isArray(empData) ? empData : []);
      setContracts(Array.isArray(contractData) ? contractData : []);
    } catch (e) {
      console.error('加载数据失败:', e);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    const contract: Partial<Contract> = {
      employeeId: employee.id,
      employeeName: employee.name,
      contractType: formData.contractType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: formData.duration,
      signCount: 1,
      status: 'signing',
      remindDays: formData.remindDays,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contract),
      });
      setShowDialog(false);
      setFormData({
        employeeId: '',
        contractType: 'fixed_term',
        startDate: '',
        endDate: '',
        duration: 12,
        remindDays: 30,
      });
      loadData();
    } catch (e) {
      console.error('提交失败:', e);
    }
  };

  const handleRenew = async (contract: Contract) => {
    const newStartDate = contract.endDate;
    const newEndDate = new Date(contract.endDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + contract.duration);
    
    try {
      await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: contract.employeeId,
          employeeName: contract.employeeName,
          contractType: contract.contractType,
          startDate: newStartDate,
          endDate: newEndDate.toISOString().split('T')[0],
          duration: contract.duration,
          signCount: contract.signCount + 1,
          status: 'signing',
          remindDays: contract.remindDays,
        }),
      });
      loadData();
    } catch (e) {
      console.error('续签失败:', e);
    }
  };

  const handleTerminate = async (contract: Contract) => {
    if (!confirm('确定要终止此合同吗？')) return;
    try {
      await fetch(`/api/contracts/${contract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'terminated' }),
      });
      loadData();
    } catch (e) {
      console.error('终止失败:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return;
    try {
      await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error('删除失败:', e);
    }
  };

  // 计算到期合同
  const getExpiringContracts = () => {
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 30);
    
    return contracts.filter(c => {
      if (c.status !== 'active') return false;
      const endDate = new Date(c.endDate);
      return endDate <= threshold && endDate >= today;
    });
  };

  // 生日列表
  const getBirthdayList = () => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisDate = today.getDate();
    
    return employees
      .filter(emp => {
        if (!emp.status || emp.status === 'inactive') return false;
        if (!emp.birthday) return false;
        const b = new Date(emp.birthday);
        return b.getMonth() === thisMonth && b.getDate() === thisDate;
      })
      .map(emp => ({
        id: emp.id,
        employeeId: emp.id,
        employeeName: emp.name,
        birthday: emp.birthday,
        sent: false,
      }));
  };

  const filteredContracts = contracts.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const renderListTab = () => (
    <div>
      <div className="flex gap-4 mb-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="">全部状态</option>
          <option value="signing">签订中</option>
          <option value="active">生效中</option>
          <option value="expired">已到期</option>
          <option value="terminated">已终止</option>
        </select>
        <div className="ml-auto text-sm text-muted-foreground">
          待续签合同: {getExpiringContracts().length} 份
        </div>
      </div>
      
      {getExpiringContracts().length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800">⚠️ 合同到期预警</h3>
          <div className="mt-2 space-y-1">
            {getExpiringContracts().map(c => (
              <p key={c.id} className="text-sm text-yellow-700">
                {c.employeeName} - {c.endDate} 到期
              </p>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-card border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">员工</th>
              <th className="p-3 text-left">合同类型</th>
              <th className="p-3 text-left">合同期限</th>
              <th className="p-3 text-center">签订次数</th>
              <th className="p-3 text-center">到期日期</th>
              <th className="p-3 text-center">状态</th>
              <th className="p-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredContracts.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">暂无合同</td></tr>
            ) : (
              filteredContracts.map(contract => (
                <tr key={contract.id} className="hover:bg-accent/30">
                  <td className="p-3">
                    <p className="font-medium">{contract.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{contract.employeeId}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${contractTypeMap[contract.contractType]?.color || 'bg-gray-100'}`}>
                      {contractTypeMap[contract.contractType]?.label || contract.contractType}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {contract.startDate} ~ {contract.endDate}
                    <span className="text-muted-foreground ml-1">({contract.duration}个月)</span>
                  </td>
                  <td className="p-3 text-center">{contract.signCount}次</td>
                  <td className="p-3 text-center">{contract.endDate}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      contract.status === 'active' ? 'bg-green-100 text-green-700' :
                      contract.status === 'expired' ? 'bg-red-100 text-red-700' :
                      contract.status === 'terminated' ? 'bg-gray-100 text-gray-600' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {contract.status === 'active' ? '生效中' : 
                       contract.status === 'expired' ? '已到期' : 
                       contract.status === 'terminated' ? '已终止' : '签订中'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {contract.status === 'active' && (
                      <>
                        <button onClick={() => handleRenew(contract)} className="text-blue-600 hover:underline mr-2">续签</button>
                        <button onClick={() => handleTerminate(contract)} className="text-red-600 hover:underline mr-2">终止</button>
                      </>
                    )}
                    <button onClick={() => handleDelete(contract.id)} className="text-muted-foreground hover:underline">删除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSignTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">签订新合同</h2>
      <div className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">选择员工 *</label>
          <select
            value={formData.employeeId}
            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">请选择员工</option>
            {employees.filter(e => e.status === 'active').map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} - {emp.department}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">合同类型 *</label>
          <select
            value={formData.contractType}
            onChange={e => setFormData({ ...formData, contractType: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="fixed_term">固定期限劳动合同</option>
            <option value="no_term">无固定期限劳动合同</option>
            <option value="task_based">以完成一定工作任务为期限的劳动合同</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">合同开始日期 *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">合同结束日期 *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">合同期限（月）</label>
            <input
              type="number"
              value={formData.duration}
              onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">提前提醒天数</label>
            <input
              type="number"
              value={formData.remindDays}
              onChange={e => setFormData({ ...formData, remindDays: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        
        <button onClick={handleSubmit} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          提交签订
        </button>
      </div>
    </div>
  );

  const renderImportTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">批量导入合同</h2>
      <div className="max-w-xl">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">上传 CSV 或 Excel 文件批量导入合同</p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={e => setImportFile(e.target.files?.[0] || null)}
            className="hidden"
            id="import-file"
          />
          <label htmlFor="import-file" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90">
            选择文件
          </label>
          {importFile && <p className="mt-2 text-sm">{importFile.name}</p>}
        </div>
        
        <div className="mt-4 bg-muted/30 rounded-lg p-4">
          <h3 className="font-medium mb-2">CSV格式要求</h3>
          <pre className="text-sm text-muted-foreground overflow-x-auto">
employeeId,contractType,startDate,endDate,duration,remindDays{'\n'}
EMP001,fixed_term,2024-01-01,2025-12-31,24,30
          </pre>
        </div>
      </div>
    </div>
  );

  const renderRemindTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">合同到期提醒设置</h2>
      <div className="max-w-xl bg-card border rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">启用提醒</label>
            <input
              type="checkbox"
              checked={remindRules.enabled}
              onChange={e => setRemindRules({ ...remindRules, enabled: e.target.checked })}
              className="w-5 h-5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">提前提醒天数</label>
            <input
              type="number"
              value={remindRules.daysBefore}
              onChange={e => setRemindRules({ ...remindRules, daysBefore: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">合同到期前N天发送提醒</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">提醒对象</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remindRules.targetRoles.includes('HR')}
                  onChange={e => {
                    const roles = e.target.checked
                      ? [...remindRules.targetRoles, 'HR']
                      : remindRules.targetRoles.filter(r => r !== 'HR');
                    setRemindRules({ ...remindRules, targetRoles: roles });
                  }}
                />
                <span>HR</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remindRules.targetRoles.includes('Manager')}
                  onChange={e => {
                    const roles = e.target.checked
                      ? [...remindRules.targetRoles, 'Manager']
                      : remindRules.targetRoles.filter(r => r !== 'Manager');
                    setRemindRules({ ...remindRules, targetRoles: roles });
                  }}
                />
                <span>部门经理</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remindRules.targetRoles.includes('Employee')}
                  onChange={e => {
                    const roles = e.target.checked
                      ? [...remindRules.targetRoles, 'Employee']
                      : remindRules.targetRoles.filter(r => r !== 'Employee');
                    setRemindRules({ ...remindRules, targetRoles: roles });
                  }}
                />
                <span>员工本人</span>
              </label>
            </div>
          </div>
          
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            保存设置
          </button>
        </div>
      </div>
    </div>
  );

  const renderBirthdayTab = () => {
    const birthdayList = getBirthdayList();
    const allBirthdays = employees
      .filter(e => e.status === 'active' && e.birthday)
      .map(emp => ({
        ...emp,
        birthday: emp.birthday,
        month: new Date(emp.birthday).getMonth() + 1,
        day: new Date(emp.birthday).getDate(),
      }))
      .sort((a, b) => a.month - b.month || a.day - b.day);
    
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">生日管理</h2>
        
        {birthdayList.length > 0 && (
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-pink-800">🎂 今日生日</h3>
            <div className="mt-2 flex gap-2 flex-wrap">
              {birthdayList.map(b => (
                <span key={b.id} className="px-3 py-1 bg-pink-200 text-pink-800 rounded-full">
                  {b.employeeName}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <h3 className="font-medium mb-3">全部生日列表</h3>
        <div className="bg-card border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">员工</th>
                <th className="p-3 text-left">部门</th>
                <th className="p-3 text-center">生日</th>
                <th className="p-3 text-center">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allBirthdays.map(emp => (
                <tr key={emp.id} className="hover:bg-accent/30">
                  <td className="p-3 font-medium">{emp.name}</td>
                  <td className="p-3 text-sm">{emp.department}</td>
                  <td className="p-3 text-center">{emp.month}月{emp.day}日</td>
                  <td className="p-3 text-center">
                    {new Date().getMonth() + 1 === emp.month && new Date().getDate() === emp.day ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-700">🎂 今日</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📄 劳动合同管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理劳动合同签订、续签、到期提醒</p>
        </div>
        <button onClick={() => setShowDialog(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          + 签订合同
        </button>
      </div>
      
      <div className="border-b mb-4">
        <div className="flex gap-1 overflow-x-auto">
          <button onClick={() => setActiveTab('list')} className={`px-4 py-2 border-b-2 whitespace-nowrap ${activeTab === 'list' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            合同列表
          </button>
          <button onClick={() => setActiveTab('sign')} className={`px-4 py-2 border-b-2 whitespace-nowrap ${activeTab === 'sign' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            合同签订
          </button>
          <button onClick={() => setActiveTab('import')} className={`px-4 py-2 border-b-2 whitespace-nowrap ${activeTab === 'import' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            批量导入
          </button>
          <button onClick={() => setActiveTab('remind')} className={`px-4 py-2 border-b-2 whitespace-nowrap ${activeTab === 'remind' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            到期提醒
          </button>
          <button onClick={() => setActiveTab('birthday')} className={`px-4 py-2 border-b-2 whitespace-nowrap ${activeTab === 'birthday' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            生日管理
          </button>
        </div>
      </div>
      
      {activeTab === 'list' && renderListTab()}
      {activeTab === 'sign' && renderSignTab()}
      {activeTab === 'import' && renderImportTab()}
      {activeTab === 'remind' && renderRemindTab()}
      {activeTab === 'birthday' && renderBirthdayTab()}
    </div>
  );
}
