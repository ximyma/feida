const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';

// 页面配置
const pageConfigs = {
  // 审批管理
  'ApprovalPage/LeavePage.tsx': { table: 'leave_records', title: '请假审批', fields: ['employeeId', 'employeeName', 'leaveType', 'startDate', 'endDate', 'days', 'reason', 'status'] },
  'ApprovalPage/OvertimePage.tsx': { table: 'overtime_records', title: '加班审批', fields: ['employeeId', 'employeeName', 'date', 'hours', 'reason', 'status'] },
  'ApprovalPage/RecordPage.tsx': { table: 'approval_records', title: '审批记录', fields: ['requestId', 'requestType', 'applicantId', 'applicantName', 'approverId', 'approverName', 'status', 'comment'] },
  'ApprovalPage/ResignationPage.tsx': { table: 'employee_changes', title: '离职审批', fields: ['employeeId', 'employeeName', 'changeType', 'effectiveDate', 'reason', 'status'] },
  
  // 考勤管理
  'AttendancePage/AttendanceRulesPage.tsx': { table: 'attendance_rules', title: '考勤规则', fields: ['name', 'workStartTime', 'workEndTime', 'lateThreshold', 'earlyLeaveThreshold', 'isActive'] },
  'AttendancePage/AttendanceStatisticsPage.tsx': { table: 'monthly_attendance_summary', title: '考勤统计', fields: ['employeeId', 'employeeName', 'month', 'workDays', 'actualDays', 'lateCount', 'earlyLeaveCount', 'absentCount'] },
  'AttendancePage/LeaveManagementPage.tsx': { table: 'leave_records', title: '请假管理', fields: ['employeeId', 'employeeName', 'leaveType', 'startDate', 'endDate', 'days', 'reason', 'status'] },
  'AttendancePage/OvertimeManagementPage.tsx': { table: 'overtime_records', title: '加班管理', fields: ['employeeId', 'employeeName', 'date', 'startTime', 'endTime', 'hours', 'reason', 'status'] },
  'AttendancePage/ScheduleManagementPage.tsx': { table: 'schedules', title: '排班管理', fields: ['employeeId', 'employeeName', 'date', 'shiftTypeId', 'shiftName', 'workStartTime', 'workEndTime'] },
  'AttendancePage/ShiftTypeConfigPage.tsx': { table: 'shift_types', title: '班次配置', fields: ['name', 'workStartTime', 'workEndTime', 'breakStartTime', 'breakEndTime', 'workHours', 'isActive'] },
  
  // 后勤管理
  'LogisticsPage/CanteenPage.tsx': { table: 'canteens', title: '食堂管理', fields: ['name', 'location', 'capacity', 'manager', 'openTime', 'closeTime', 'status'] },
  'LogisticsPage/DormitoryPage.tsx': { table: 'dormitories', title: '宿舍管理', fields: ['building', 'roomNumber', 'type', 'capacity', 'occupied', 'manager', 'status'] },
  'LogisticsPage/VehiclePage.tsx': { table: 'vehicles', title: '车辆管理', fields: ['plateNumber', 'type', 'brand', 'model', 'department', 'driver', 'status'] },
  'LogisticsPage/VisitorPage.tsx': { table: 'visitors', title: '访客管理', fields: ['name', 'phone', 'company', 'visitPerson', 'visitReason', 'visitTime', 'leaveTime', 'status'] },
  
  // 办公管理
  'OfficePage/AnnouncementPage.tsx': { table: 'announcements', title: '公告管理', fields: ['title', 'content', 'type', 'priority', 'authorId', 'authorName', 'publishAt', 'status'] },
  'OfficePage/DocumentPage.tsx': { table: 'documents', title: '文档管理', fields: ['docName', 'docType', 'category', 'fileSize', 'downloadUrl', 'uploadedBy', 'status'] },
  'OfficePage/SurveyPage.tsx': { table: 'surveys', title: '问卷调查', fields: ['surveyName', 'description', 'type', 'targetEmployees', 'deadline', 'status'] },
  
  // 绩效管理
  'PerformancePage/CyclePage.tsx': { table: 'performance_cycles', title: '考核周期', fields: ['name', 'startDate', 'endDate', 'status', 'description'] },
  'PerformancePage/GradePage.tsx': { table: 'performance_grades', title: '绩效等级', fields: ['name', 'minScore', 'maxScore', 'description', 'color'] },
  'PerformancePage/KPIPage.tsx': { table: 'kpis', title: 'KPI指标', fields: ['name', 'category', 'weight', 'targetValue', 'unit', 'description', 'isActive'] },
  'PerformancePage/RecordPage.tsx': { table: 'performance_records', title: '考核记录', fields: ['employeeId', 'employeeName', 'cycleId', 'cycleName', 'score', 'grade', 'comment'] },
  
  // 人事管理
  'PersonnelPage/AssessmentPage.tsx': { table: 'assessment_tools', title: '测评工具', fields: ['name', 'type', 'description', 'isActive', 'questions'] },
  'PersonnelPage/ContractManagementPage.tsx': { table: 'contracts', title: '合同管理', fields: ['employeeId', 'employeeName', 'contractType', 'contractNo', 'startDate', 'endDate', 'status'] },
  'PersonnelPage/EmployeeChangePage.tsx': { table: 'employee_changes', title: '员工异动', fields: ['employeeId', 'employeeName', 'changeType', 'fromDepartment', 'toDepartment', 'fromPosition', 'toPosition', 'effectiveDate', 'reason', 'status'] },
  'PersonnelPage/EmployeeSubsetPage.tsx': { table: 'employee_subsets', title: '员工子集', fields: ['employeeId', 'type', 'data'] },
  'PersonnelPage/FieldConfigPage.tsx': { table: 'field_definitions', title: '字段配置', fields: ['name', 'fieldKey', 'type', 'group', 'visibility', 'required', 'order'] },
  'PersonnelPage/PrintTemplatePage.tsx': { table: 'print_templates', title: '打印模板', fields: ['name', 'type', 'content', 'fields', 'isDefault'] },
  'PersonnelPage/ReminderManagementPage.tsx': { table: 'reminders', title: '提醒设置', fields: ['name', 'type', 'module', 'advanceDays', 'isActive', 'targetRoles'] },
  'PersonnelPage/TalentReportPage.tsx': { table: 'talent_reports', title: '人才报告', fields: ['name', 'period', 'summary', 'createdAt'] },
  
  // 招聘管理
  'RecruitmentPage/CandidatePage.tsx': { table: 'candidates', title: '候选人列表', fields: ['name', 'phone', 'email', 'positionId', 'positionName', 'source', 'status', 'interviewDate'] },
  'RecruitmentPage/OfferPage.tsx': { table: 'offers', title: 'Offer记录', fields: ['candidateId', 'candidateName', 'positionId', 'positionName', 'salary', 'startDate', 'status', 'sentAt'] },
  'RecruitmentPage/PositionPage.tsx': { table: 'recruitment_positions', title: '招聘职位', fields: ['title', 'department', 'count', 'requirements', 'salary', 'deadline', 'status'] },
  'RecruitmentPage/ResumePage.tsx': { table: 'resumes', title: '简历投递', fields: ['name', 'phone', 'email', 'positionId', 'positionName', 'source', 'status', 'receivedAt'] },
  
  // 薪资管理
  'SalaryPage/CompanyContributionPage.tsx': { table: 'company_contributions', title: '企业缴纳', fields: ['employeeId', 'employeeName', 'month', 'pension', 'medical', 'unemployment', 'injury', 'maternity', 'housingFund', 'total'] },
  'SalaryPage/SalaryAdjustmentDialog.tsx': { table: 'salary_adjustments', title: '薪资调整', fields: ['employeeId', 'employeeName', 'adjustType', 'oldSalary', 'newSalary', 'effectiveDate', 'reason', 'status'] },
  'SalaryPage/SalaryConfigPage.tsx': { table: 'salary_items', title: '薪资配置', fields: ['name', 'type', 'category', 'formula', 'isTaxable', 'isActive'] },
  'SalaryPage/SalaryTablePage.tsx': { table: 'salaries', title: '工资表', fields: ['employeeId', 'employeeName', 'month', 'baseSalary', 'positionSalary', 'performanceSalary', 'allowances', 'bonus', 'deductions', 'netSalary', 'status'] },
  
  // 培训管理
  'TrainingPage/CoursePage.tsx': { table: 'training_courses', title: '培训课程', fields: ['courseName', 'category', 'duration', 'instructor', 'description', 'status'] },
  'TrainingPage/TrainingPage.tsx': { table: 'training_plans', title: '培训计划', fields: ['name', 'description', 'trainer', 'startDate', 'endDate', 'location', 'maxParticipants', 'status'] },
};

// 生成完整的CRUD页面代码
function generateCRUDPage(config) {
  const { table, title, fields } = config;
  const componentName = path.basename(table, '.tsx').replace(/_/g, '').replace(/-/g, '');
  
  return `import React, { useState, useEffect } from 'react';

const TABLE_NAME = '${table}';
const PAGE_TITLE = '${title}';
const FIELDS = ${JSON.stringify(fields)};

export default function ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(\`/api/\${TABLE_NAME}\`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error('获取数据失败', e);
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setForm({});
    setDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = editingItem 
        ? \`/api/\${TABLE_NAME}/\${editingItem.id}\`
        : \`/api/\${TABLE_NAME}\`;
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        setDialogOpen(false);
        fetchData();
      } else {
        alert('保存失败');
      }
    } catch (e) {
      alert('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该记录吗？')) return;
    try {
      await fetch(\`/api/\${TABLE_NAME}/\${id}\`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      alert('删除失败');
    }
  };

  const filtered = data.filter(item => {
    if (!search) return true;
    return JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
  });

  const columns = data.length > 0 ? Object.keys(data[0]).filter(c => !c.startsWith('_')) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{PAGE_TITLE}</h1>
          <p className="text-sm text-muted-foreground mt-1">共 {data.length} 条记录</p>
        </div>
        <button 
          onClick={openAddDialog}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          ➕ 新增
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="mb-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="搜索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 max-w-sm px-3 py-2 border border-input rounded-lg bg-background"
          />
          <button 
            onClick={fetchData}
            className="px-3 py-2 border border-input rounded-lg hover:bg-muted"
          >
            🔄 刷新
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">暂无数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.slice(0, 10).map(col => (
                    <th key={col} className="text-left p-3 font-medium">{col}</th>
                  ))}
                  <th className="text-left p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((item, i) => (
                  <tr key={item.id || i} className="border-b hover:bg-muted/30">
                    {columns.slice(0, 10).map(col => (
                      <td key={col} className="p-3">
                        {typeof item[col] === 'boolean' 
                          ? (item[col] ? '✓' : '✕')
                          : String(item[col] || '-').slice(0, 30)}
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditDialog(item)}
                          className="text-primary hover:underline text-xs"
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:underline text-xs"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDialogOpen(false)}>
          <div className="bg-card rounded-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingItem ? '编辑' : '新增'}</h2>
              <button onClick={() => setDialogOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map(field => (
                <div key={field}>
                  <label className="block text-sm text-muted-foreground mb-1">{field}</label>
                  <input
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                    value={form[field] || ''}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    placeholder={field}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 border border-input rounded-lg hover:bg-muted">
                取消
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;
}

// 批量生成页面
let count = 0;
for (const [relPath, config] of Object.entries(pageConfigs)) {
  const fullPath = path.join(pagesDir, relPath);
  if (fs.existsSync(fullPath)) {
    const newCode = generateCRUDPage(config);
    fs.writeFileSync(fullPath, newCode, 'utf-8');
    console.log(`✅ 已修复: ${relPath}`);
    count++;
  } else {
    console.log(`❌ 不存在: ${relPath}`);
  }
}

console.log(`\n共修复 ${count} 个页面的CRUD功能`);
