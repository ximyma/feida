/**
 * 批量改造前端页面 - 从假数据改为API调用
 * 
 * 运行: node batch-transform-pages.js
 */

const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';

// 需要改造的页面列表（按模块分组）
const pagesToTransform = [
  // 审批模块
  { path: 'ApprovalPage/LeavePage.tsx', api: 'leave_records', name: '请假审批' },
  { path: 'ApprovalPage/OvertimePage.tsx', api: 'overtime_records', name: '加班审批' },
  { path: 'ApprovalPage/RecordPage.tsx', api: 'approval_requests', name: '审批记录' },
  { path: 'ApprovalPage/ResignationPage.tsx', api: 'employee_changes', name: '离职审批' },
  
  // 考勤模块
  { path: 'AttendancePage/AttendanceRulesPage.tsx', api: 'attendance_rules', name: '考勤规则' },
  { path: 'AttendancePage/AttendanceStatisticsPage.tsx', api: 'monthly_attendance_summary', name: '考勤统计' },
  { path: 'AttendancePage/ScheduleManagementPage.tsx', api: 'schedules', name: '排班管理' },
  
  // 后勤模块
  { path: 'LogisticsPage/CanteenPage.tsx', api: 'canteens', name: '食堂管理' },
  { path: 'LogisticsPage/LogisticsPage.tsx', api: 'dormitories', name: '后勤管理' },
  
  // 绩效模块
  { path: 'PerformancePage/CyclePage.tsx', api: 'performance_cycles', name: '考核周期' },
  { path: 'PerformancePage/GradePage.tsx', api: 'performance_records', name: '绩效等级' },
  { path: 'PerformancePage/RecordPage.tsx', api: 'performance_records', name: '绩效记录' },
  
  // 人事模块
  { path: 'PersonnelPage/AssessmentPage.tsx', api: 'assessment_results', name: '评估管理' },
  { path: 'PersonnelPage/ContractManagementPage.tsx', api: 'contracts', name: '合同管理' },
  { path: 'PersonnelPage/EmployeeChangePage.tsx', api: 'employee_changes', name: '人事变动' },
  { path: 'PersonnelPage/EmployeeSubsetPage.tsx', api: 'employee_subsets', name: '员工子集' },
  { path: 'PersonnelPage/FieldConfigPage.tsx', api: 'field_definitions', name: '字段配置' },
  { path: 'PersonnelPage/PrintTemplatePage.tsx', api: 'print_templates', name: '打印模板' },
  { path: 'PersonnelPage/ReminderManagementPage.tsx', api: 'reminders', name: '提醒管理' },
  { path: 'PersonnelPage/TalentReportPage.tsx', api: 'talent_reports', name: '人才报告' },
  
  // 招聘模块
  { path: 'RecruitmentPage/CandidatePage.tsx', api: 'candidates', name: '候选人' },
  { path: 'RecruitmentPage/OfferPage.tsx', api: 'offers', name: 'Offer管理' },
  { path: 'RecruitmentPage/ResumePage.tsx', api: 'resumes', name: '简历管理' },
  
  // 薪酬模块
  { path: 'SalaryPage/CompanyContributionPage.tsx', api: 'company_contributions', name: '企业缴纳' },
  { path: 'SalaryPage/SalaryAdjustmentDialog.tsx', api: 'salary_adjustments', name: '调薪' },
  { path: 'SalaryPage/SalaryTablePage.tsx', api: 'salaries', name: '工资表' }
];

console.log('=== 批量改造前端页面 ===\n');

let successCount = 0;
let errorCount = 0;

pagesToTransform.forEach(page => {
  const filePath = path.join(pagesDir, page.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${page.path}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // 1. 添加 useAPI hook 导入（如果还没有）
    if (!content.includes("import { useAPI }") && !content.includes("from '../../hooks/useAPI'")) {
      // 计算相对路径深度
      const depth = page.path.split('/').length;
      const relativePath = '../'.repeat(depth) + 'hooks/useAPI';
      
      // 在文件开头添加导入
      const importStatement = `import { useAPI } from '${relativePath}';\n`;
      
      // 找到最后一个 import 语句
      const lastImportMatch = content.match(/^import .+?;$/gm);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        content = content.replace(lastImport, lastImport + '\n' + importStatement);
      } else {
        content = importStatement + content;
      }
    }
    
    // 2. 添加 API hook 使用
    const apiHookName = page.api.replace(/_/g, '') + 'API';
    const apiHookUsage = `  const { data: ${page.api}Data, loading, create, update, remove } = useAPI('${page.api}');\n`;
    
    // 查找组件内部的开始位置
    const componentMatch = content.match(/(export default function \w+\([^)]*\)\s*\{[\s\S]*?)(const \[[\s\S]*?\]|const \{[\s\S]*?\}|return)/);
    if (componentMatch && !content.includes(apiHookUsage)) {
      content = content.replace(componentMatch[2], apiHookUsage + '\n  ' + componentMatch[2]);
    }
    
    // 3. 替换假数据为 API 数据
    content = content.replace(/const \[\w+,\s*set\w+\]\s*=\s*useState\(\[[\s\S]*?\]\);?/g, (match) => {
      // 提取变量名
      const varMatch = match.match(/const \[(\w+),/);
      if (varMatch) {
        return `  // 使用API数据替代假数据\n  const ${varMatch[1]} = ${page.api}Data || [];`;
      }
      return match;
    });
    
    // 4. 替换具体的假数据数组
    const hardcodedArrays = content.match(/const \w+\s*=\s*\[[\s\S]*?\];/g);
    if (hardcodedArrays) {
      hardcodedArrays.forEach(arr => {
        if (arr.includes('{') && arr.includes('id:') && !arr.includes('import')) {
          // 这是一个假数据数组
          const varMatch = arr.match(/const (\w+) =/);
          if (varMatch && !arr.includes('useState')) {
            content = content.replace(arr, `  // 使用API数据\n  const ${varMatch[1]} = ${page.api}Data || [];`);
          }
        }
      });
    }
    
    // 5. 保存修改后的文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ ${page.name}: ${page.path}`);
      successCount++;
    } else {
      console.log(`⏭️  无需修改: ${page.name}`);
    }
    
  } catch (error) {
    console.log(`❌ ${page.name}: ${error.message}`);
    errorCount++;
  }
});

console.log('\n=== 改造完成 ===');
console.log(`✅ 成功: ${successCount}`);
console.log(`❌ 失败: ${errorCount}`);
console.log(`📊 总计: ${pagesToTransform.length}`);
