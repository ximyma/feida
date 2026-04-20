const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';

// 页面到API表的映射
const pageToTable = {
  // 审批
  'ApprovalPage/LeavePage.tsx': 'leave_records',
  'ApprovalPage/OvertimePage.tsx': 'overtime_records',
  'ApprovalPage/RecordPage.tsx': 'approval_records',
  'ApprovalPage/ResignationPage.tsx': 'employee_changes',
  // 考勤
  'AttendancePage/AttendanceRulesPage.tsx': 'attendance_rules',
  'AttendancePage/AttendanceStatisticsPage.tsx': 'monthly_attendance_summary',
  'AttendancePage/LeaveManagementPage.tsx': 'leave_records',
  'AttendancePage/OvertimeManagementPage.tsx': 'overtime_records',
  'AttendancePage/ScheduleManagementPage.tsx': 'schedules',
  'AttendancePage/ShiftTypeConfigPage.tsx': 'shift_types',
  // 后勤
  'LogisticsPage/CanteenPage.tsx': 'canteens',
  'LogisticsPage/DormitoryPage.tsx': 'dormitories',
  'LogisticsPage/LogisticsPage.tsx': 'logistics',
  'LogisticsPage/VehiclePage.tsx': 'vehicles',
  'LogisticsPage/VisitorPage.tsx': 'visitors',
  // 办公
  'OfficePage/AnnouncementPage.tsx': 'announcements',
  'OfficePage/DocumentPage.tsx': 'documents',
  'OfficePage/SurveyPage.tsx': 'surveys',
  // 组织
  'OrganizationPage/OrganizationPage.tsx': 'departments',
  // 绩效
  'PerformancePage/CyclePage.tsx': 'performance_cycles',
  'PerformancePage/GradePage.tsx': 'performance_grades',
  'PerformancePage/KPIPage.tsx': 'kpis',
  'PerformancePage/RecordPage.tsx': 'performance_records',
  // 人事
  'PersonnelPage/AssessmentPage.tsx': 'assessment_tools',
  'PersonnelPage/ContractManagementPage.tsx': 'contracts',
  'PersonnelPage/EmployeeChangePage.tsx': 'employee_changes',
  'PersonnelPage/EmployeeSubsetPage.tsx': 'employee_subsets',
  'PersonnelPage/FieldConfigPage.tsx': 'field_definitions',
  'PersonnelPage/PrintTemplatePage.tsx': 'print_templates',
  'PersonnelPage/ReminderManagementPage.tsx': 'reminders',
  'PersonnelPage/TalentReportPage.tsx': 'talent_reports',
  // 招聘
  'RecruitmentPage/CandidatePage.tsx': 'candidates',
  'RecruitmentPage/OfferPage.tsx': 'offers',
  'RecruitmentPage/PositionPage.tsx': 'recruitment_positions',
  'RecruitmentPage/RecruitmentPage.tsx': 'recruitment_positions',
  'RecruitmentPage/ResumePage.tsx': 'resumes',
  // 薪资
  'SalaryPage/CompanyContributionPage.tsx': 'company_contributions',
  'SalaryPage/SalaryAdjustmentDialog.tsx': 'salary_adjustments',
  'SalaryPage/SalaryConfigPage.tsx': 'salary_items',
  'SalaryPage/SalaryTablePage.tsx': 'salaries',
  // 培训
  'TrainingPage/CoursePage.tsx': 'training_courses',
  'TrainingPage/TrainingPage.tsx': 'training_plans',
};

// 获取页面的标题
function getPageTitle(relPath) {
  const titles = {
    'ApprovalPage/LeavePage.tsx': '请假审批',
    'ApprovalPage/OvertimePage.tsx': '加班审批',
    'ApprovalPage/RecordPage.tsx': '审批记录',
    'ApprovalPage/ResignationPage.tsx': '离职审批',
    'AttendancePage/AttendanceRulesPage.tsx': '考勤规则',
    'AttendancePage/AttendanceStatisticsPage.tsx': '考勤统计',
    'AttendancePage/LeaveManagementPage.tsx': '请假管理',
    'AttendancePage/OvertimeManagementPage.tsx': '加班管理',
    'AttendancePage/ScheduleManagementPage.tsx': '排班管理',
    'AttendancePage/ShiftTypeConfigPage.tsx': '班次配置',
    'LogisticsPage/CanteenPage.tsx': '食堂管理',
    'LogisticsPage/DormitoryPage.tsx': '宿舍管理',
    'LogisticsPage/LogisticsPage.tsx': '后勤管理',
    'LogisticsPage/VehiclePage.tsx': '车辆管理',
    'LogisticsPage/VisitorPage.tsx': '访客管理',
    'OfficePage/AnnouncementPage.tsx': '公告管理',
    'OfficePage/DocumentPage.tsx': '文档管理',
    'OfficePage/SurveyPage.tsx': '问卷调查',
    'OrganizationPage/OrganizationPage.tsx': '组织架构',
    'PerformancePage/CyclePage.tsx': '考核周期',
    'PerformancePage/GradePage.tsx': '绩效等级',
    'PerformancePage/KPIPage.tsx': 'KPI指标',
    'PerformancePage/RecordPage.tsx': '考核记录',
    'PersonnelPage/AssessmentPage.tsx': '测评工具',
    'PersonnelPage/ContractManagementPage.tsx': '合同管理',
    'PersonnelPage/EmployeeChangePage.tsx': '员工异动',
    'PersonnelPage/EmployeeSubsetPage.tsx': '员工子集',
    'PersonnelPage/FieldConfigPage.tsx': '字段配置',
    'PersonnelPage/PrintTemplatePage.tsx': '打印模板',
    'PersonnelPage/ReminderManagementPage.tsx': '提醒设置',
    'PersonnelPage/TalentReportPage.tsx': '人才报告',
    'RecruitmentPage/CandidatePage.tsx': '候选人列表',
    'RecruitmentPage/OfferPage.tsx': 'Offer记录',
    'RecruitmentPage/PositionPage.tsx': '招聘职位',
    'RecruitmentPage/RecruitmentPage.tsx': '招聘管理',
    'RecruitmentPage/ResumePage.tsx': '简历投递',
    'SalaryPage/CompanyContributionPage.tsx': '企业缴纳',
    'SalaryPage/SalaryAdjustmentDialog.tsx': '薪资调整',
    'SalaryPage/SalaryConfigPage.tsx': '薪资配置',
    'SalaryPage/SalaryTablePage.tsx': '工资表',
    'TrainingPage/CoursePage.tsx': '培训课程',
    'TrainingPage/TrainingPage.tsx': '培训计划',
  };
  return titles[relPath] || '数据管理';
}

// 生成新的页面代码
function generatePageCode(relPath, tableName) {
  const title = getPageTitle(relPath);
  const componentName = path.basename(relPath, '.tsx');
  
  return `import React, { useState, useEffect } from 'react';

const TABLE_NAME = '${tableName}';

export default function ${componentName}() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  // 获取列名
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">${title}</h1>
          <p className="text-sm text-muted-foreground mt-1">共 {data.length} 条记录</p>
        </div>
        <button 
          onClick={() => alert('新增功能开发中')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          ➕ 新增
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="搜索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-input rounded-lg bg-background"
          />
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
                {filtered.slice(0, 50).map((item, i) => (
                  <tr key={item.id || i} className="border-b hover:bg-muted/30">
                    {columns.slice(0, 10).map(col => (
                      <td key={col} className="p-3">
                        {typeof item[col] === 'boolean' 
                          ? (item[col] ? '✓' : '✕')
                          : String(item[col] || '-').slice(0, 30)}
                      </td>
                    ))}
                    <td className="p-3">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:underline text-xs"
                      >
                        删除
                      </button>
                    </td>
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
`;
}

// 批量生成页面
let count = 0;
for (const [relPath, tableName] of Object.entries(pageToTable)) {
  const fullPath = path.join(pagesDir, relPath);
  if (fs.existsSync(fullPath)) {
    const newCode = generatePageCode(relPath, tableName);
    fs.writeFileSync(fullPath, newCode, 'utf-8');
    console.log(`✅ 已修复: ${relPath}`);
    count++;
  } else {
    console.log(`❌ 不存在: ${relPath}`);
  }
}

console.log(`\n共修复 ${count} 个页面`);
