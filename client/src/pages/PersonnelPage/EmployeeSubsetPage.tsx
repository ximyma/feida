import React, { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  status: string;
}

interface SubsetRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  subsetType: string;
  data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[];
  visible: boolean;
}

const subsetTypeMap: Record<string, { label: string; icon: string; fields: FieldConfig[] }> = {
  education: {
    label: '学历信息',
    icon: '🎓',
    fields: [
      { key: 'school', label: '学校', type: 'text', required: true, visible: true },
      { key: 'degree', label: '学历', type: 'select', required: true, visible: true, options: ['初中', '高中', '中专', '大专', '本科', '硕士', '博士'] },
      { key: 'major', label: '专业', type: 'text', required: false, visible: true },
      { key: 'graduationYear', label: '毕业年份', type: 'number', required: false, visible: true },
      { key: 'educationType', label: '学历类型', type: 'select', required: false, visible: true, options: ['全日制', '非全日制', '网络教育', '自学考试'] },
    ],
  },
  work_experience: {
    label: '工作经历',
    icon: '💼',
    fields: [
      { key: 'company', label: '公司名称', type: 'text', required: true, visible: true },
      { key: 'position', label: '岗位', type: 'text', required: true, visible: true },
      { key: 'startDate', label: '开始日期', type: 'date', required: true, visible: true },
      { key: 'endDate', label: '结束日期', type: 'date', required: false, visible: true },
      { key: 'reason', label: '离职原因', type: 'text', required: false, visible: true },
    ],
  },
  family_members: {
    label: '家庭成员',
    icon: '👨‍👩‍👧',
    fields: [
      { key: 'name', label: '姓名', type: 'text', required: true, visible: true },
      { key: 'relation', label: '关系', type: 'select', required: true, visible: true, options: ['父亲', '母亲', '配偶', '子女', '兄弟姐妹', '其他'] },
      { key: 'birthday', label: '出生日期', type: 'date', required: false, visible: true },
      { key: 'phone', label: '联系电话', type: 'text', required: false, visible: true },
      { key: 'company', label: '工作单位', type: 'text', required: false, visible: true },
      { key: 'position', label: '职位', type: 'text', required: false, visible: true },
    ],
  },
  certifications: {
    label: '证书资质',
    icon: '📜',
    fields: [
      { key: 'name', label: '证书名称', type: 'text', required: true, visible: true },
      { key: 'issueOrg', label: '颁发机构', type: 'text', required: false, visible: true },
      { key: 'issueDate', label: '颁发日期', type: 'date', required: false, visible: true },
      { key: 'expireDate', label: '有效期至', type: 'date', required: false, visible: true },
      { key: 'certNo', label: '证书编号', type: 'text', required: false, visible: true },
    ],
  },
  training: {
    label: '培训记录',
    icon: '📚',
    fields: [
      { key: 'name', label: '培训名称', type: 'text', required: true, visible: true },
      { key: 'org', label: '培训机构', type: 'text', required: false, visible: true },
      { key: 'startDate', label: '开始日期', type: 'date', required: false, visible: true },
      { key: 'endDate', label: '结束日期', type: 'date', required: false, visible: true },
      { key: 'hours', label: '培训时长(小时)', type: 'number', required: false, visible: true },
      { key: 'result', label: '培训结果', type: 'select', required: false, visible: true, options: ['通过', '未通过', '优秀'] },
    ],
  },
  awards: {
    label: '奖惩记录',
    icon: '🏆',
    fields: [
      { key: 'type', label: '类型', type: 'select', required: true, visible: true, options: ['奖励', '惩罚'] },
      { key: 'name', label: '奖项/惩罚名称', type: 'text', required: true, visible: true },
      { key: 'date', label: '日期', type: 'date', required: false, visible: true },
      { key: 'reason', label: '原因', type: 'text', required: false, visible: true },
      { key: 'result', label: '结果', type: 'text', required: false, visible: true },
    ],
  },
};

export default function EmployeeSubsetPage() {
  const [activeTab, setActiveTab] = useState<'subset' | 'apply' | 'config'>('subset');
  const [subsetType, setSubsetType] = useState<string>('education');
  const [records, setRecords] = useState<SubsetRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 表单状态
  const [showDialog, setShowDialog] = useState(false);
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // 筛选
  const [employeeFilter, setEmployeeFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [subsetType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, subsetRes] = await Promise.all([
        fetch('/api/employees'),
        fetch(`/api/employee_subsets?subsetType=${subsetType}`),
      ]);
      const empData = await empRes.json();
      const subsetData = await subsetRes.json();
      
      setEmployees(Array.isArray(empData) ? empData : []);
      setRecords(Array.isArray(subsetData) ? subsetData : []);
    } catch (e) {
      console.error('加载数据失败:', e);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formEmployeeId) return;
    const employee = employees.find(e => e.id === formEmployeeId);
    
    const record: Partial<SubsetRecord> = {
      employeeId: formEmployeeId,
      employeeName: employee?.name,
      subsetType,
      data: formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/employee_subsets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      setShowDialog(false);
      setFormEmployeeId('');
      setFormData({});
      loadData();
    } catch (e) {
      console.error('提交失败:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return;
    try {
      await fetch(`/api/employee_subsets/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error('删除失败:', e);
    }
  };

  const handleApprove = async (record: SubsetRecord) => {
    try {
      await fetch(`/api/employee_subsets/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      loadData();
    } catch (e) {
      console.error('审批失败:', e);
    }
  };

  const handleReject = async (record: SubsetRecord) => {
    try {
      await fetch(`/api/employee_subsets/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      loadData();
    } catch (e) {
      console.error('拒绝失败:', e);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp?.name || employeeId;
  };

  const filteredRecords = records.filter(r => {
    if (employeeFilter && !getEmployeeName(r.employeeId).includes(employeeFilter)) return false;
    return true;
  });

  // 生成二维码链接（模拟）
  const generateQRCode = () => {
    const url = `${window.location.origin}/self-service/register?token=${Date.now()}`;
    return url;
  };

  const renderSubsetTab = () => {
    const config = subsetTypeMap[subsetType];
    const fields = config?.fields.filter(f => f.visible) || [];
    
    return (
      <div>
        <div className="flex gap-2 mb-4">
          {Object.entries(subsetTypeMap).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setSubsetType(key)}
              className={`px-3 py-1.5 rounded-lg text-sm ${subsetType === key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            >
              {val.icon} {val.label}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="搜索员工..."
            value={employeeFilter}
            onChange={e => setEmployeeFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg w-64"
          />
          <button onClick={() => setShowDialog(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            + 添加{config?.label}
          </button>
        </div>
        
        <div className="bg-card border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">员工</th>
                {fields.map(f => (
                  <th key={f.key} className="p-3 text-left">{f.label}</th>
                ))}
                <th className="p-3 text-center">状态</th>
                <th className="p-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRecords.length === 0 ? (
                <tr><td colSpan={fields.length + 3} className="p-8 text-center text-muted-foreground">暂无记录</td></tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-accent/30">
                    <td className="p-3 font-medium">{getEmployeeName(record.employeeId)}</td>
                    {fields.map(f => (
                      <td key={f.key} className="p-3 text-sm">
                        {f.type === 'select' ? f.options?.find(o => o === record.data[f.key]) || '-' : record.data[f.key] || '-'}
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'approved' ? 'bg-green-100 text-green-700' :
                        record.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.status === 'approved' ? '已通过' : record.status === 'rejected' ? '已拒绝' : '待审批'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDelete(record.id)} className="text-destructive hover:underline">删除</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderApplyTab = () => {
    const pendingRecords = records.filter(r => r.status === 'pending');
    
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">员工信息修改申请</h2>
        <div className="bg-card border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">员工</th>
                <th className="p-3 text-left">子集类型</th>
                <th className="p-3 text-left">修改内容</th>
                <th className="p-3 text-center">提交时间</th>
                <th className="p-3 text-center">状态</th>
                <th className="p-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pendingRecords.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">暂无待审批的申请</td></tr>
              ) : (
                pendingRecords.map(record => (
                  <tr key={record.id} className="hover:bg-accent/30">
                    <td className="p-3 font-medium">{getEmployeeName(record.employeeId)}</td>
                    <td className="p-3">{subsetTypeMap[record.subsetType]?.label || record.subsetType}</td>
                    <td className="p-3 text-sm">
                      {Object.entries(record.data).slice(0, 2).map(([k, v]) => (
                        <div key={k}>{k}: {v}</div>
                      ))}
                    </td>
                    <td className="p-3 text-center text-sm">{new Date(record.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">待审批</span>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleApprove(record)} className="text-green-600 hover:underline mr-2">通过</button>
                      <button onClick={() => handleReject(record)} className="text-red-600 hover:underline">拒绝</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderConfigTab = () => {
    const [fieldConfigs, setFieldConfigs] = useState<Record<string, FieldConfig[]>>({});
    
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">子集字段配置</h2>
        <p className="text-sm text-muted-foreground mb-4">配置各子集类型的字段，可设置字段显示/隐藏</p>
        
        <div className="space-y-6">
          {Object.entries(subsetTypeMap).map(([key, config]) => (
            <div key={key} className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-3">{config.icon} {config.label}</h3>
              <div className="space-y-2">
                {config.fields.map(field => (
                  <div key={field.key} className="flex items-center gap-4 p-2 bg-muted/30 rounded">
                    <input
                      type="checkbox"
                      checked={field.visible}
                      onChange={e => {
                        const newConfigs = { ...fieldConfigs };
                        if (!newConfigs[key]) newConfigs[key] = [...config.fields];
                        const idx = newConfigs[key].findIndex(f => f.key === field.key);
                        if (idx >= 0) newConfigs[key][idx].visible = e.target.checked;
                        setFieldConfigs(newConfigs);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="w-24">{field.label}</span>
                    <span className="text-xs text-muted-foreground">{field.type}</span>
                    {field.required && <span className="text-xs text-red-500">必填</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            保存配置
          </button>
        </div>
      </div>
    );
  };

  const renderDialog = () => {
    const config = subsetTypeMap[subsetType];
    const fields = config?.fields.filter(f => f.visible) || [];
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">添加{config?.label}</h3>
            <button onClick={() => setShowDialog(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">选择员工 *</label>
              <select
                value={formEmployeeId}
                onChange={e => setFormEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">请选择员工</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.department}</option>
                ))}
              </select>
            </div>
            
            {fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">请选择</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={formData[field.key] || ''}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <input
                    type={field.type === 'date' ? 'date' : 'text'}
                    value={formData[field.key] || ''}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex justify-end gap-2">
            <button onClick={() => setShowDialog(false)} className="px-4 py-2 border rounded-lg hover:bg-accent">取消</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">提交</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📋 人事子集管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理员工学历、工作经历、家庭成员等子集信息</p>
        </div>
      </div>
      
      <div className="border-b mb-4">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('subset')} className={`px-4 py-2 border-b-2 ${activeTab === 'subset' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            子集管理
          </button>
          <button onClick={() => setActiveTab('apply')} className={`px-4 py-2 border-b-2 ${activeTab === 'apply' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            修改申请
          </button>
          <button onClick={() => setActiveTab('config')} className={`px-4 py-2 border-b-2 ${activeTab === 'config' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground'}`}>
            字段配置
          </button>
        </div>
      </div>
      
      {activeTab === 'subset' && renderSubsetTab()}
      {activeTab === 'apply' && renderApplyTab()}
      {activeTab === 'config' && renderConfigTab()}
      
      {showDialog && renderDialog()}
    </div>
  );
}
