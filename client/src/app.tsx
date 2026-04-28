import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import LoginPage from './pages/LoginPage/LoginPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import OrganizationPage from './pages/OrganizationPage/OrganizationPage';
import PersonnelPage from './pages/PersonnelPage/PersonnelPage';
import FieldConfigPage from './pages/PersonnelPage/FieldConfigPage';
import ContractManagementPage from './pages/PersonnelPage/ContractManagementPage';
import EmployeeChangePage from './pages/PersonnelPage/EmployeeChangePage';
import ReminderManagementPage from './pages/PersonnelPage/ReminderManagementPage';
import EmployeeSubsetPage from './pages/PersonnelPage/EmployeeSubsetPage';
import PrintTemplatePage from './pages/PersonnelPage/PrintTemplatePage';
import AssessmentPage from './pages/PersonnelPage/AssessmentPage';
import TalentReportPage from './pages/PersonnelPage/TalentReportPage';
import AttendancePage from './pages/AttendancePage/AttendancePage';
import ShiftTypeConfigPage from './pages/AttendancePage/ShiftTypeConfigPage';
import ScheduleManagementPage from './pages/AttendancePage/ScheduleManagementPage';
import AttendanceRulesPage from './pages/AttendancePage/AttendanceRulesPage';
import LeaveManagementPage from './pages/AttendancePage/LeaveManagementPage';
import OvertimeManagementPage from './pages/AttendancePage/OvertimeManagementPage';
import AttendanceStatisticsPage from './pages/AttendancePage/AttendanceStatisticsPage';
import AttendanceDailyReportPage from './pages/AttendancePage/AttendanceDailyReportPage';
import SalaryPage from './pages/SalaryPage/SalaryPage';
import SalaryTablePage from './pages/SalaryPage/SalaryTablePage';
import SalaryConfigPage from './pages/SalaryPage/SalaryConfigPage';
import SalaryFormulaPage from './pages/SalaryPage/SalaryFormulaPage';
import CompanyContributionPage from './pages/SalaryPage/CompanyContributionPage';
import StatisticsPage from './pages/StatisticsPage/StatisticsPage';
import PerformancePage from './pages/PerformancePage/PerformancePage';
import KPIPage from './pages/PerformancePage/KPIPage';
import CyclePage from './pages/PerformancePage/CyclePage';
import RecordPage from './pages/PerformancePage/RecordPage';
import GradePage from './pages/PerformancePage/GradePage';
import RecruitmentPage from './pages/RecruitmentPage/RecruitmentPage';
import PositionPage from './pages/RecruitmentPage/PositionPage';
import ResumePage from './pages/RecruitmentPage/ResumePage';
import CandidatePage from './pages/RecruitmentPage/CandidatePage';
import OfferPage from './pages/RecruitmentPage/OfferPage';
import LogisticsPage from './pages/LogisticsPage/LogisticsPage';
import DormitoryPage from './pages/LogisticsPage/DormitoryPage';
import CanteenPage from './pages/LogisticsPage/CanteenPage';
import VehiclePage from './pages/LogisticsPage/VehiclePage';
import VisitorPage from './pages/LogisticsPage/VisitorPage';
import ApprovalPage from './pages/ApprovalPage/ApprovalPage';
import LeavePage from './pages/ApprovalPage/LeavePage';
import OvertimeApprovalPage from './pages/ApprovalPage/OvertimePage';
import ResignationPage from './pages/ApprovalPage/ResignationPage';
import ApprovalRecordPage from './pages/ApprovalPage/RecordPage';
import SystemPage from './pages/SystemPage/SystemPage';
import SystemOverviewPage from './pages/SystemPage/SystemOverviewPage';
import UserManagePage from './pages/SystemPage/UserManagePage';
import RoleManagePage from './pages/SystemPage/RoleManagePage';
import SystemConfigPage from './pages/SystemPage/SystemConfigPage';
import DataManagePage from './pages/SystemPage/DataManagePage';
import AuditLogPage from './pages/SystemPage/AuditLogPage';
import LoginLogPage from './pages/SystemPage/LoginLogPage/LoginLogPage';
import AppSettingsPage from './pages/SystemPage/AppSettingsPage/AppSettingsPage';
import WeChatSettingsPage from './pages/SystemPage/WeChatSettingsPage/WeChatSettingsPage';
import DingTalkSettingsPage from './pages/SystemPage/DingTalkSettingsPage/DingTalkSettingsPage';
import ApiDocPage from './pages/SystemPage/ApiDocPage/ApiDocPage';
import TaskManagePage from './pages/SystemPage/TaskManagePage/TaskManagePage';
import TrainingPage from './pages/TrainingPage/TrainingPage';
import CoursePage from './pages/TrainingPage/CoursePage';
import AnnouncementPage from './pages/OfficePage/AnnouncementPage';
import DocumentPage from './pages/OfficePage/DocumentPage';
import SurveyPage from './pages/OfficePage/SurveyPage';
import SelfServicePage from './pages/SelfServicePage/SelfServicePage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const currentUser = sessionStorage.getItem('__current_user');
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard><Layout /></AuthGuard>}>
        <Route index element={<DashboardPage />} />
        <Route path="/organization" element={<OrganizationPage />} />

        {/* 人事管理 */}
        <Route path="/personnel" element={<PersonnelPage />} />
        <Route path="/personnel/field" element={<FieldConfigPage />} />
        <Route path="/personnel/contract" element={<ContractManagementPage />} />
        <Route path="/personnel/change" element={<EmployeeChangePage />} />
        <Route path="/personnel/reminder" element={<ReminderManagementPage />} />
        <Route path="/personnel/subset" element={<EmployeeSubsetPage />} />
        <Route path="/personnel/print" element={<PrintTemplatePage />} />
        <Route path="/personnel/assessment" element={<AssessmentPage />} />
        <Route path="/personnel/talent" element={<TalentReportPage />} />

        {/* 考勤管理 */}
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendance/shift" element={<ShiftTypeConfigPage />} />
        <Route path="/attendance/schedule" element={<ScheduleManagementPage />} />
        <Route path="/attendance/rules" element={<AttendanceRulesPage />} />
        <Route path="/attendance/leave" element={<LeaveManagementPage />} />
        <Route path="/attendance/overtime" element={<OvertimeManagementPage />} />
        <Route path="/attendance/statistics" element={<AttendanceStatisticsPage />} />
        <Route path="/attendance/daily-report" element={<AttendanceDailyReportPage />} />

        {/* 薪酬管理 */}
        <Route path="/salary" element={<SalaryPage />} />
        <Route path="/salary/table" element={<SalaryTablePage />} />
        <Route path="/salary/config" element={<SalaryConfigPage />} />
        <Route path="/salary/formula" element={<SalaryFormulaPage />} />
        <Route path="/salary/company" element={<CompanyContributionPage />} />

        {/* 统计分析 */}
        <Route path="/statistics" element={<StatisticsPage />} />

        {/* 绩效管理 */}
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/performance/kpi" element={<KPIPage />} />
        <Route path="/performance/cycle" element={<CyclePage />} />
        <Route path="/performance/record" element={<RecordPage />} />
        <Route path="/performance/grade" element={<GradePage />} />

        {/* 招聘管理 */}
        <Route path="/recruitment" element={<RecruitmentPage />} />
        <Route path="/recruitment/position" element={<PositionPage />} />
        <Route path="/recruitment/resume" element={<ResumePage />} />
        <Route path="/recruitment/candidate" element={<CandidatePage />} />
        <Route path="/recruitment/offer" element={<OfferPage />} />

        {/* 后勤管理 */}
        <Route path="/logistics" element={<LogisticsPage />} />
        <Route path="/logistics/dormitory" element={<DormitoryPage />} />
        <Route path="/logistics/canteen" element={<CanteenPage />} />
        <Route path="/logistics/vehicle" element={<VehiclePage />} />
        <Route path="/logistics/visitor" element={<VisitorPage />} />

        {/* 审批流程 */}
        <Route path="/approval" element={<ApprovalPage />} />
        <Route path="/approval/leave" element={<LeavePage />} />
        <Route path="/approval/overtime" element={<OvertimeApprovalPage />} />
        <Route path="/approval/resignation" element={<ResignationPage />} />
        <Route path="/approval/record" element={<ApprovalRecordPage />} />

        {/* 培训管理 */}
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/training/course" element={<CoursePage />} />

        {/* 综合事务 */}
        <Route path="/office/announcement" element={<AnnouncementPage />} />
        <Route path="/office/document" element={<DocumentPage />} />
        <Route path="/office/survey" element={<SurveyPage />} />

        {/* 员工自助 */}
        <Route path="/selfservice" element={<SelfServicePage />} />

        {/* 系统管理 */}
        <Route path="/system" element={<SystemOverviewPage />} />
        <Route path="/system/users" element={<UserManagePage />} />
        <Route path="/system/roles" element={<RoleManagePage />} />
        <Route path="/system/config" element={<SystemConfigPage />} />
        <Route path="/system/data" element={<DataManagePage />} />
        <Route path="/system/logs" element={<AuditLogPage />} />
        <Route path="/system/login-logs" element={<LoginLogPage />} />
        <Route path="/system/app-settings" element={<AppSettingsPage />} />
        <Route path="/system/wechat" element={<WeChatSettingsPage />} />
        <Route path="/system/dingtalk" element={<DingTalkSettingsPage />} />
        <Route path="/system/api-doc" element={<ApiDocPage />} />
        <Route path="/system/tasks" element={<TaskManagePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
