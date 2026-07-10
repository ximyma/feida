import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { I18nProvider } from './i18n';
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
import PluginManagePage from './pages/SystemPage/PluginManagePage';
import DingTalkSettingsPage from './pages/SystemPage/DingTalkSettingsPage/DingTalkSettingsPage';
import ApiDocPage from './pages/SystemPage/ApiDocPage/ApiDocPage';
import TaskManagePage from './pages/SystemPage/TaskManagePage/TaskManagePage';
import TrainingPage from './pages/TrainingPage/TrainingPage';
import CoursePage from './pages/TrainingPage/CoursePage';
import AnnouncementPage from './pages/OfficePage/AnnouncementPage';
import DocumentPage from './pages/OfficePage/DocumentPage';
import SurveyPage from './pages/OfficePage/SurveyPage';
import SelfServicePage from './pages/SelfServicePage/SelfServicePage';
import ProductPage from './pages/ProductPage/ProductPage';
import ColorsPage from './pages/ProductPage/ColorsPage';
import SizesPage from './pages/ProductPage/SizesPage';
import CategoriesPage from './pages/ProductPage/CategoriesPage';
import StylesPage from './pages/ProductPage/StylesPage';
import StyleColorsPage from './pages/ProductPage/StyleColorsPage';
import SKUsPage from './pages/ProductPage/SKUsPage';
import BoxTypesPage from './pages/ProductPage/BoxTypesPage';
import CodingRulesPage from './pages/ProductPage/CodingRulesPage';
import SizeRatiosPage from './pages/ProductPage/SizeRatiosPage';
import PLMPage from './pages/ProductPage/PLMPage';
import MaterialAttributesPage from './pages/ProductPage/MaterialAttributesPage';
import MaterialsPage from './pages/ProductPage/MaterialsPage';
import ProcessesPage from './pages/ProductPage/ProcessesPage';
import ProcessRoutesPage from './pages/ProductPage/ProcessRoutesPage';
import ComponentsPage from './pages/ProductPage/ComponentsPage';
import BOMsPage from './pages/ProductPage/BOMsPage';
import ScrapRulesPage from './pages/ProductPage/ScrapRulesPage';
import SolesPage from './pages/ProductPage/SolesPage';
import SeasonMaterialsPage from './pages/ProductPage/SeasonMaterialsPage';
import WarehousePage from './pages/WarehousePage/WarehousePage';
import WarehousesPage from './pages/WarehousePage/WarehousesPage';
import LocationsPage from './pages/WarehousePage/LocationsPage';
import InventoryPage from './pages/WarehousePage/InventoryPage';
import StockInPage from './pages/WarehousePage/StockInPage';
import StockOutPage from './pages/WarehousePage/StockOutPage';
import StockCheckPage from './pages/WarehousePage/StockCheckPage';
import TransferPage from './pages/WarehousePage/TransferPage';
import BarcodesPage from './pages/WarehousePage/BarcodesPage';
import SalesPage from './pages/SalesPage/SalesPage';
import CustomerGroupsPage from './pages/SalesPage/CustomerGroupsPage';
import CustomersPage from './pages/SalesPage/CustomersPage';
import SalesOrdersPage from './pages/SalesPage/SalesOrdersPage';
import DeliveriesPage from './pages/SalesPage/DeliveriesPage';
import ReturnsPage from './pages/SalesPage/ReturnsPage';
import PurchasePage from './pages/PurchasePage/PurchasePage';
import SupplierGroupsPage from './pages/PurchasePage/SupplierGroupsPage';
import SuppliersPage from './pages/PurchasePage/SuppliersPage';
import PurchaseOrdersPage from './pages/PurchasePage/PurchaseOrdersPage';
import PurchaseReceiptsPage from './pages/PurchasePage/PurchaseReceiptsPage';
import ProductionPage from './pages/ProductionPage/ProductionPage';
import WorkCentersPage from './pages/ProductionPage/WorkCentersPage';
import ProductionPlansPage from './pages/ProductionPage/ProductionPlansPage';
import WorkOrdersPage from './pages/ProductionPage/WorkOrdersPage';
import ReportingPage from './pages/ProductionPage/ReportingPage';
import FinancePage from './pages/FinancePage/FinancePage';
import AccountsPage from './pages/FinancePage/AccountsPage';
import JournalEntriesPage from './pages/FinancePage/JournalEntriesPage';
import ARInvoicesPage from './pages/FinancePage/ARInvoicesPage';
import APInvoicesPage from './pages/FinancePage/APInvoicesPage';
import PaymentsPage from './pages/FinancePage/PaymentsPage';
import QualityPage from './pages/QualityPage/QualityPage';
import StandardsPage from './pages/QualityPage/StandardsPage';
import InspectionsPage from './pages/QualityPage/InspectionsPage';
import DefectsPage from './pages/QualityPage/DefectsPage';
import CorrectiveActionsPage from './pages/QualityPage/CorrectiveActionsPage';
import SiteHomePage from './pages/SiteHomePage/SiteHomePage';
import ArticleListPageV2 from './pages/SiteHomePage/ArticleListPageV2';
import ArticleDetailPageV2 from './pages/SiteHomePage/ArticleDetailPageV2';
import ShopHomePageV2 from './pages/ShopHomePage/ShopHomePageV2';
import ProductDetailPageV2 from './pages/ShopHomePage/ProductDetailPageV2';
import CartPage from './pages/ShopHomePage/CartPage';
import ShopUserCenter from './pages/ShopHomePage/ShopUserCenter';
import ShopFavoritesPage from './pages/ShopHomePage/ShopFavoritesPage';
import ShopOrdersPage from './pages/ShopHomePage/ShopOrdersPage';
import CheckoutPage from './pages/ShopHomePage/CheckoutPage';
import PayPage from './pages/ShopHomePage/PayPage';
import ShopAdminPage from './pages/Admin/ShopAdminPage';
import CMSAdminPage from './pages/Admin/CMSAdminPage';
import AIAssistantPage from './pages/AIAssistantPage/AIAssistantPage';
import AIKnowledgePage from './pages/AIKnowledgePage/AIKnowledgePage';
import AIBIAnalyticsPage from './pages/AIBIAnalyticsPage/AIBIAnalyticsPage';
import AIAlertsPage from './pages/AIAlertsPage/AIAlertsPage';
import AISettingsPage from './pages/SystemPage/AISettingsPage/AISettingsPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const currentUser = sessionStorage.getItem('__current_user');
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <I18nProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* 网站前台（无需登录） */}
      <Route path="/site" element={<SiteHomePage />} />
      <Route path="/site/articles" element={<ArticleListPageV2 />} />
      <Route path="/site/article/:id" element={<ArticleDetailPageV2 />} />

      {/* 商城前台（无需登录）增强版 */}
      <Route path="/shop" element={<ShopHomePageV2 />} />
      <Route path="/shop/goods/:id" element={<ProductDetailPageV2 />} />
      <Route path="/shop/category/:id" element={<ShopHomePageV2 />} />
      <Route path="/shop/brand/:id" element={<ShopHomePageV2 />} />
      <Route path="/shop/search" element={<ShopHomePageV2 />} />
      <Route path="/shop/cart" element={<CartPage />} />
      <Route path="/shop/checkout" element={<CheckoutPage />} />
      <Route path="/shop/pay/:id" element={<PayPage />} />
      <Route path="/shop/user" element={<ShopUserCenter />} />
      <Route path="/shop/favorites" element={<ShopFavoritesPage />} />
      <Route path="/shop/orders" element={<ShopOrdersPage />} />
      <Route path="/shop/order/:id" element={<ShopOrdersPage />} />

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

        {/* 产品基础档案 */}
        <Route path="/product" element={<ProductPage />} />
        <Route path="/product/colors" element={<ColorsPage />} />
        <Route path="/product/sizes" element={<SizesPage />} />
        <Route path="/product/categories" element={<CategoriesPage />} />
        <Route path="/product/styles" element={<StylesPage />} />
        <Route path="/product/style-colors" element={<StyleColorsPage />} />
        <Route path="/product/skus" element={<SKUsPage />} />
        <Route path="/product/box-types" element={<BoxTypesPage />} />
        <Route path="/product/coding-rules" element={<CodingRulesPage />} />
        <Route path="/product/size-ratios" element={<SizeRatiosPage />} />

        {/* 工艺管理/PLM */}
        <Route path="/plm" element={<PLMPage />} />
        <Route path="/plm/material-attributes" element={<MaterialAttributesPage />} />
        <Route path="/plm/materials" element={<MaterialsPage />} />
        <Route path="/plm/processes" element={<ProcessesPage />} />
        <Route path="/plm/process-routes" element={<ProcessRoutesPage />} />
        <Route path="/plm/components" element={<ComponentsPage />} />
        <Route path="/plm/boms" element={<BOMsPage />} />
        <Route path="/plm/scrap-rules" element={<ScrapRulesPage />} />
        <Route path="/plm/soles" element={<SolesPage />} />
        <Route path="/plm/season-materials" element={<SeasonMaterialsPage />} />

        {/* 仓储物流管理 */}
        <Route path="/warehouse" element={<WarehousePage />} />
        <Route path="/warehouse/warehouses" element={<WarehousesPage />} />
        <Route path="/warehouse/locations" element={<LocationsPage />} />
        <Route path="/warehouse/inventory" element={<InventoryPage />} />
        <Route path="/warehouse/stock-in" element={<StockInPage />} />
        <Route path="/warehouse/stock-out" element={<StockOutPage />} />
        <Route path="/warehouse/stock-check" element={<StockCheckPage />} />
        <Route path="/warehouse/transfer" element={<TransferPage />} />
        <Route path="/warehouse/barcodes" element={<BarcodesPage />} />

        {/* 销售管理 */}
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/customer-groups" element={<CustomerGroupsPage />} />
        <Route path="/sales/customers" element={<CustomersPage />} />
        <Route path="/sales/orders" element={<SalesOrdersPage />} />
        <Route path="/sales/deliveries" element={<DeliveriesPage />} />
        <Route path="/sales/returns" element={<ReturnsPage />} />

        {/* 采购管理 */}
        <Route path="/purchase" element={<PurchasePage />} />
        <Route path="/purchase/supplier-groups" element={<SupplierGroupsPage />} />
        <Route path="/purchase/suppliers" element={<SuppliersPage />} />
        <Route path="/purchase/orders" element={<PurchaseOrdersPage />} />
        <Route path="/purchase/receipts" element={<PurchaseReceiptsPage />} />

        {/* 生产现场管理 */}
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/production/work-centers" element={<WorkCentersPage />} />
        <Route path="/production/plans" element={<ProductionPlansPage />} />
        <Route path="/production/work-orders" element={<WorkOrdersPage />} />
        <Route path="/production/reporting" element={<ReportingPage />} />

        {/* 财务管理 */}
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/finance/accounts" element={<AccountsPage />} />
        <Route path="/finance/journal-entries" element={<JournalEntriesPage />} />
        <Route path="/finance/ar-invoices" element={<ARInvoicesPage />} />
        <Route path="/finance/ap-invoices" element={<APInvoicesPage />} />
        <Route path="/finance/payments" element={<PaymentsPage />} />

        {/* 网站与商城管理后台 */}
        <Route path="/admin/shop" element={<ShopAdminPage />} />
        <Route path="/admin/cms" element={<CMSAdminPage />} />

        {/* 质量管理 */}
        <Route path="/quality" element={<QualityPage />} />
        <Route path="/quality/standards" element={<StandardsPage />} />
        <Route path="/quality/inspections" element={<InspectionsPage />} />
        <Route path="/quality/defects" element={<DefectsPage />} />
        <Route path="/quality/corrective-actions" element={<CorrectiveActionsPage />} />

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
        <Route path="/system/plugins" element={<PluginManagePage />} />

        {/* AI智能功能 */}
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/ai-knowledge" element={<AIKnowledgePage />} />
        <Route path="/ai-bianalytics" element={<AIBIAnalyticsPage />} />
        <Route path="/ai-alerts" element={<AIAlertsPage />} />

        {/* AI系统设置 */}
        <Route path="/system/ai-settings" element={<AISettingsPage />} />

      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </I18nProvider>
  );
}
