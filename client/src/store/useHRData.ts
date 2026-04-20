import { useState, useCallback, useEffect } from 'react';

// ==================== 类型定义 ====================

export type EmployeeStatus = 'active' | 'inactive' | 'pending';
export type SalaryLocation = '江西' | '深圳' | '南京' | string;

// ==================== 考勤管理类型 ====================

export type ShiftTypeKind = 'regular' | 'night' | 'halfday' | 'flexible' | 'rest';
export type AttendanceMode = 'device' | 'app' | 'exempt' | 'hybrid';
export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'marriage' | 'bereavement' | 'compensatory';

// 班次类型
export interface IShiftType {
  id: string;
  name: string;               // 如 "常规班"、"夜班"
  kind: ShiftTypeKind;
  startTime: string;          // 上班时间 "09:00"
  endTime: string;            // 下班时间 "18:00"
  lateThreshold: number;      // 迟到阈值(分钟) 如 15
  earlyLeaveThreshold: number;// 早退阈值(分钟)
  overtimeThreshold: number;  // 加班阈值(分钟，超过下班多久算加班)
  workHours: number;          // 工作时长(小时)
  isActive: boolean;
  remark?: string;
}

// 排班记录
export interface ISchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;               // YYYY-MM-DD
  shiftTypeId: string;
  shiftTypeName: string;
  isRestDay: boolean;
  isHoliday: boolean;
  remark?: string;
}

// 考勤规则（企业级别）
export interface IAttendanceRule {
  id: string;
  name: string;
  // 年假规则
  annualLeaveBase: number;            // 基础年假天数
  annualLeaveIncrement: number;       // 工龄每年增加天数
  annualLeaveMax: number;             // 年假上限
  annualLeaveCarryOver: boolean;      // 是否允许跨年结转
  annualLeaveCarryMax: number;        // 结转上限
  annualLeaveExpireMonths: number;    // 结转有效期(月)
  // 打卡规则
  defaultAttendanceMode: AttendanceMode;
  appCheckLocations: ICheckLocation[]; // APP打卡地点
  latePenaltyRule: ILatePenaltyRule;  // 违扣规则
  absentPenaltyRule: IAbsentPenaltyRule;
  // 免考勤人员
  exemptEmployeeIds: string[];
}

// APP打卡地点
export interface ICheckLocation {
  id: string;
  name: string;               // 地点名称 如 "总部大厦"
  address: string;
  latitude: number;
  longitude: number;
  radius: number;             // 允许范围(米) 如 100
  isActive: boolean;
}

// 迟到扣款规则
export interface ILatePenaltyRule {
  enabled: boolean;
  thresholdMinutes: number[]; // [10, 30, 60] 阶梯
  penaltyAmounts: number[];   // [0, 50, 100] 对应扣款
  halfDayThreshold: number;   // 超过多少分钟按半天旷工
}

// 旷工扣款规则
export interface IAbsentPenaltyRule {
  enabled: boolean;
  halfDayPenalty: number;     // 半天旷工扣款
  fullDayPenalty: number;     // 全天旷工扣款
  consecutiveAbsentRule: number; // 连续旷工天数触发严重处罚
}

// 考勤记录（增强版）
export interface IAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  shiftTypeId: string;
  shiftTypeName: string;
  scheduledStart: string;     // 排班上班时间
  scheduledEnd: string;       // 排班下班时间
  checkIn: string | null;     // 实际打卡上班时间
  checkOut: string | null;    // 实际打卡下班时间
  checkInLocation?: string;   // 打卡地点
  checkOutLocation?: string;
  checkInMode?: 'device' | 'app' | 'manual';
  checkOutMode?: 'device' | 'app' | 'manual';
  status: 'normal' | 'late' | 'early_leave' | 'absent_half' | 'absent_full' | 'leave' | 'overtime';
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  overtimeMinutes?: number;
  overtimeApproved?: boolean; // 加班是否审批通过
  leaveType?: LeaveType;
  leaveId?: string;           // 关联请假记录ID
  remark?: string;
  source?: 'device' | 'dingtalk' | 'wework' | 'app' | 'manual'; // 数据来源
}

// 请假记录（增强版）
export interface ILeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  usedHours?: number;         // 小时请假
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approver?: string;
  approveTime?: string;
  rejectReason?: string;
  attachmentUrl?: string;
}

// 年假余额
export interface ILeaveBalance {
  id: string;
  employeeId: string;
  employeeName: string;
  year: number;
  // 年假
  annualTotal: number;        // 本年总年假
  annualUsed: number;         // 已使用
  annualRemaining: number;    // 剩余
  annualCarryOver: number;    // 上年结转
  annualCarryExpiring: number;// 结转即将过期
  // 其他假期累计（可扩展）
  compensatoryTotal: number;  // 调休累计
  compensatoryUsed: number;
  remark?: string;
}

// 加班记录
export interface IOvertimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  overtimeType: 'workday' | 'restday' | 'holiday'; // 工作日加班/休息日加班/节假日加班
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approveTime?: string;
  compensatory: boolean;      // 是否调休
  compensatoryHours?: number; // 可调休时长
}

// 调班申请
export interface IShiftChangeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  originalDate: string;
  originalShiftId: string;
  targetDate: string;
  targetShiftId: string;
  targetEmployeeId?: string;  // 与他人换班时对方ID
  targetEmployeeName?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approveTime?: string;
}

// 出勤日报
export interface IDailyAttendanceReport {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  shiftTypeName: string;
  // 时间
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  // 状态
  isPresent: boolean;
  isLate: boolean;
  lateMinutes: number;
  isEarlyLeave: boolean;
  earlyLeaveMinutes: number;
  isAbsent: boolean;
  absentType: 'none' | 'half' | 'full';
  isOvertime: boolean;
  overtimeHours: number;
  // 请假
  isOnLeave: boolean;
  leaveType?: LeaveType;
  leaveHours?: number;
  // 统计
  workHours: number;          // 实际工作时长
  effectiveWorkHours: number; // 有效工作时长(扣除迟到早退)
  remark?: string;
}

// 月度统计报表
export interface IMonthlyAttendanceSummary {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;              // YYYY-MM
  // 出勤统计
  totalWorkDays: number;      // 应出勤天数
  actualWorkDays: number;     // 实际出勤天数
  absentDays: number;         // 旷工天数
  lateCount: number;          // 迟到次数
  lateMinutesTotal: number;   // 迟到总分钟
  earlyLeaveCount: number;    // 早退次数
  // 加班统计
  overtimeWorkday: number;    // 工作日加班时长(小时)
  overtimeRestday: number;    // 休息日加班时长
  overtimeHoliday: number;    // 节假日加班时长
  overtimeTotal: number;      // 总加班时长
  // 请假统计
  leaveAnnual: number;        // 年假天数
  leaveSick: number;          // 病假天数
  leavePersonal: number;      // 事假天数
  leaveMarriage: number;      // 婚假天数
  leaveMaternity: number;     // 产假天数
  leaveOther: number;         // 其他假期
  leaveTotal: number;         // 总请假天数
  // 有效工作时长
  effectiveHours: number;     // 有效工时(小时)
}

// ==================== 考勤工具函数 ====================

/** 计算两个时间字符串之间的小时数 */
function calculateHours(start: string, end: string): number {
  if (!start || !end) return 0;
  try {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMins = sh * 60 + (sm || 0);
    const endMins = eh * 60 + (em || 0);
    const diff = endMins - startMins;
    return diff > 0 ? diff / 60 : 0;
  } catch { return 0; }
}

/** 判断日期是否为工作日（周一至周五） */
export function isWorkday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

/** 生成月份所有日期 */
export function getMonthDates(year: number, month: number): string[] {
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, i) =>
    `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
  );
}

// ==================== 原有类型 ====================

export interface IEmployee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  rank: string;
  status: EmployeeStatus;
  hireDate: string;
  phone: string;
  email: string;
  salaryLocation: SalaryLocation;
}

export interface IRank {
  id: string;
  name: string;
  level: number;
  baseSalary: number;
  positionSalary: number;
  mealAllowance: number;
  transportAllowance: number;
  salaryRange: string;
  description: string;
}

export interface IPosition {
  id: string;
  name: string;
  department: string;
  count: number;
  status: 'active' | 'inactive';
}

export interface ISalary {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  baseSalary: number;
  positionSalary: number;
  performance: number;
  overtime: number;
  mealAllowance: number;
  transportAllowance: number;
  housingAllowance: number;
  grossSalary: number;      // 应发工资金额
  socialSecurity: number;   // 个人社保
  housingFund: number;      // 个人公积金
  tax: number;
  netSalary: number;
  // 企业缴纳部分
  companyPension: number;      // 企业养老保险
  companyMedical: number;      // 企业医疗保险
  companyUnemployment: number; // 企业失业保险
  companyInjury: number;       // 企业工伤保险
  companyMaternity: number;    // 企业生育保险
  companyHousingFund: number;  // 企业公积金
  companyTotal: number;        // 企业缴纳合计
}

export interface ILocationAllowance {
  location: SalaryLocation;
  housingAllowance: number;
  mealExtra: number;
  transportExtra: number;
  // 社保个人比例
  pensionRate: number;       // 养老保险
  medicalRate: number;       // 医疗保险
  unemploymentRate: number;  // 失业保险
  // 社保企业比例
  pensionCompanyRate: number;
  medicalCompanyRate: number;
  unemploymentCompanyRate: number;
  injuryCompanyRate: number;    // 工伤保险
  maternityCompanyRate: number; // 生育保险
}

// ==================== 工资调整项类型 ====================

export type AdjustmentType = 'addition' | 'deduction';
export type AdjustmentCategory = 'allowance' | 'bonus' | 'social' | 'housing' | 'fine' | 'other';

// 工资调整项模板（全局配置）
export interface ISalaryItemTemplate {
  id: string;
  name: string;           // 项目名称，如"高温补贴"、"全勤奖"、"迟到扣款"
  type: AdjustmentType;   // addition 增加 / deduction 扣除
  category: AdjustmentCategory;
  isPreTax: boolean;      // 是否税前扣除（影响个税计算）
  isCompany: boolean;     // 是否企业缴纳项（企业缴纳社保等）
  isRecurring: boolean;   // 每月自动应用
  isActive: boolean;      // 是否启用
  defaultAmount?: number; // 默认金额
  remark?: string;
}

// 每月工资调整项记录（实际数据）
export interface ISalaryAdjustment {
  id: string;
  employeeId: string;
  month: string;
  templateId?: string;    // 关联模板ID（可选）
  name: string;           // 项目名称
  type: AdjustmentType;
  category: AdjustmentCategory;
  amount: number;         // 金额（扣除时为负数或用type区分）
  isPreTax: boolean;
  isCompany: boolean;     // 是否企业缴纳项
  remark?: string;
}

// 默认调整项模板
export const defaultSalaryItemTemplates: ISalaryItemTemplate[] = [
  // 补贴类
  { id: 'tpl_1', name: '高温补贴', type: 'addition', category: 'allowance', isPreTax: true, isCompany: false, isRecurring: true, isActive: false, defaultAmount: 300, remark: '夏季高温天气补贴' },
  { id: 'tpl_2', name: '全勤奖', type: 'addition', category: 'bonus', isPreTax: true, isCompany: false, isRecurring: true, isActive: false, defaultAmount: 500, remark: '当月全勤奖励' },
  { id: 'tpl_3', name: '餐补', type: 'addition', category: 'allowance', isPreTax: true, isCompany: false, isRecurring: true, isActive: false, defaultAmount: 0, remark: '额外餐补' },
  { id: 'tpl_4', name: '交通补贴', type: 'addition', category: 'allowance', isPreTax: true, isCompany: false, isRecurring: true, isActive: false, defaultAmount: 0, remark: '额外交通补贴' },
  { id: 'tpl_5', name: '通讯补贴', type: 'addition', category: 'allowance', isPreTax: true, isCompany: false, isRecurring: true, isActive: false, defaultAmount: 100, remark: '手机通讯补贴' },
  { id: 'tpl_6', name: '住房补贴', type: 'addition', category: 'allowance', isPreTax: true, isCompany: false, isRecurring: true, isActive: false, defaultAmount: 0, remark: '额外住房补贴' },
  { id: 'tpl_7', name: '年终奖', type: 'addition', category: 'bonus', isPreTax: true, isCompany: false, isRecurring: false, isActive: false, defaultAmount: 0, remark: '年底一次性奖金' },
  // 扣款类
  { id: 'tpl_8', name: '迟到扣款', type: 'deduction', category: 'fine', isPreTax: false, isCompany: false, isRecurring: false, isActive: false, defaultAmount: 0, remark: '按迟到次数扣款' },
  { id: 'tpl_9', name: '请假扣款', type: 'deduction', category: 'fine', isPreTax: false, isCompany: false, isRecurring: false, isActive: false, defaultAmount: 0, remark: '事假、病假扣款' },
  { id: 'tpl_10', name: '旷工扣款', type: 'deduction', category: 'fine', isPreTax: false, isCompany: false, isRecurring: false, isActive: false, defaultAmount: 0, remark: '旷工扣款' },
  { id: 'tpl_11', name: '损坏公物赔偿', type: 'deduction', category: 'fine', isPreTax: false, isCompany: false, isRecurring: false, isActive: false, defaultAmount: 0, remark: '损坏公司财物赔偿' },
  // 社保公积金增项（企业）
  { id: 'tpl_12', name: '补充医疗保险(企)', type: 'addition', category: 'social', isPreTax: true, isCompany: true, isRecurring: true, isActive: false, defaultAmount: 200, remark: '企业补充商业医疗保险' },
  { id: 'tpl_13', name: '企业年金(企)', type: 'addition', category: 'social', isPreTax: true, isCompany: true, isRecurring: true, isActive: false, defaultAmount: 0, remark: '企业年金计划' },
  { id: 'tpl_14', name: '补充公积金(企)', type: 'addition', category: 'housing', isPreTax: true, isCompany: true, isRecurring: true, isActive: false, defaultAmount: 0, remark: '补充住房公积金' },
];

// ==================== 默认地区社保与补贴标准 ====================

export const defaultLocationAllowances: ILocationAllowance[] = [
  {
    location: '深圳',
    housingAllowance: 1500, mealExtra: 200, transportExtra: 300,
    pensionRate: 0.08, medicalRate: 0.02, unemploymentRate: 0.005,
    pensionCompanyRate: 0.16, medicalCompanyRate: 0.06, unemploymentCompanyRate: 0.008,
    injuryCompanyRate: 0.004, maternityCompanyRate: 0.005,
  },
  {
    location: '南京',
    housingAllowance: 1000, mealExtra: 100, transportExtra: 200,
    pensionRate: 0.08, medicalRate: 0.025, unemploymentRate: 0.005,
    pensionCompanyRate: 0.16, medicalCompanyRate: 0.09, unemploymentCompanyRate: 0.008,
    injuryCompanyRate: 0.004, maternityCompanyRate: 0.008,
  },
  {
    location: '江西',
    housingAllowance: 500, mealExtra: 0, transportExtra: 100,
    pensionRate: 0.08, medicalRate: 0.03, unemploymentRate: 0.005,
    pensionCompanyRate: 0.16, medicalCompanyRate: 0.06, unemploymentCompanyRate: 0.008,
    injuryCompanyRate: 0.004, maternityCompanyRate: 0.005,
  },
];

// ==================== 考勤管理默认数据 ====================

/** 默认班次类型 */
export const defaultShiftTypes: IShiftType[] = [
  { id: 'st_regular', name: '常规班', kind: 'regular', startTime: '09:00', endTime: '18:00', lateThreshold: 15, earlyLeaveThreshold: 15, overtimeThreshold: 30, workHours: 8, isActive: true, remark: '标准工作班次' },
  { id: 'st_night', name: '夜班', kind: 'night', startTime: '22:00', endTime: '06:00', lateThreshold: 15, earlyLeaveThreshold: 15, overtimeThreshold: 30, workHours: 8, isActive: true, remark: '夜间工作班次' },
  { id: 'st_halfday_morning', name: '半天班(上午)', kind: 'halfday', startTime: '09:00', endTime: '13:00', lateThreshold: 15, earlyLeaveThreshold: 15, overtimeThreshold: 0, workHours: 4, isActive: true, remark: '上午半天' },
  { id: 'st_halfday_afternoon', name: '半天班(下午)', kind: 'halfday', startTime: '14:00', endTime: '18:00', lateThreshold: 15, earlyLeaveThreshold: 15, overtimeThreshold: 0, workHours: 4, isActive: true, remark: '下午半天' },
  { id: 'st_flexible', name: '弹性班', kind: 'flexible', startTime: '09:00', endTime: '18:00', lateThreshold: 60, earlyLeaveThreshold: 60, overtimeThreshold: 30, workHours: 8, isActive: true, remark: '弹性工作班次，允许1小时弹性' },
  { id: 'st_rest', name: '休息日', kind: 'rest', startTime: '', endTime: '', lateThreshold: 0, earlyLeaveThreshold: 0, overtimeThreshold: 0, workHours: 0, isActive: true, remark: '非工作日' },
];

/** 默认考勤规则 */
export const defaultAttendanceRule: IAttendanceRule = {
  id: 'rule_default',
  name: '默认考勤规则',
  annualLeaveBase: 5,
  annualLeaveIncrement: 1,
  annualLeaveMax: 15,
  annualLeaveCarryOver: true,
  annualLeaveCarryMax: 5,
  annualLeaveExpireMonths: 6,
  defaultAttendanceMode: 'hybrid',
  appCheckLocations: [
    { id: 'loc_1', name: '总部大厦', address: '深圳市南山区科技园', latitude: 22.5431, longitude: 113.9344, radius: 100, isActive: true },
    { id: 'loc_2', name: '江西分公司', address: '南昌市红谷滩区', latitude: 28.6781, longitude: 115.8921, radius: 100, isActive: true },
    { id: 'loc_3', name: '南京办事处', address: '南京市鼓楼区', latitude: 32.0603, longitude: 118.7969, radius: 100, isActive: true },
  ],
  latePenaltyRule: {
    enabled: true,
    thresholdMinutes: [10, 30, 60],
    penaltyAmounts: [0, 50, 100],
    halfDayThreshold: 120,
  },
  absentPenaltyRule: {
    enabled: true,
    halfDayPenalty: 200,
    fullDayPenalty: 400,
    consecutiveAbsentRule: 3,
  },
  exemptEmployeeIds: [],
};

/** 假期类型映射 */
export const LEAVE_TYPE_MAP: Record<LeaveType, { name: string; maxDays: number; paid: boolean }> = {
  annual: { name: '年假', maxDays: 15, paid: true },
  sick: { name: '病假', maxDays: 180, paid: false },
  personal: { name: '事假', maxDays: 30, paid: false },
  maternity: { name: '产假', maxDays: 158, paid: true },
  marriage: { name: '婚假', maxDays: 10, paid: true },
  bereavement: { name: '丧假', maxDays: 5, paid: true },
  compensatory: { name: '调休', maxDays: 365, paid: true },
};

// ==================== 默认职级数据 ====================

export const defaultRanks: IRank[] = [
  { id: 'r1', name: '初级', level: 1, baseSalary: 6000, positionSalary: 1500, mealAllowance: 300, transportAllowance: 200, salaryRange: '6K-10K', description: '初级岗位，1-2年经验' },
  { id: 'r2', name: '中级', level: 2, baseSalary: 10000, positionSalary: 3000, mealAllowance: 400, transportAllowance: 300, salaryRange: '10K-18K', description: '中级岗位，3-5年经验' },
  { id: 'r3', name: '高级', level: 3, baseSalary: 18000, positionSalary: 5000, mealAllowance: 500, transportAllowance: 500, salaryRange: '18K-30K', description: '高级岗位，5-8年经验' },
  { id: 'r4', name: '专家', level: 4, baseSalary: 30000, positionSalary: 8000, mealAllowance: 600, transportAllowance: 800, salaryRange: '30K-50K', description: '专家岗位，8年以上经验' },
  { id: 'r5', name: '总监', level: 5, baseSalary: 50000, positionSalary: 15000, mealAllowance: 800, transportAllowance: 1000, salaryRange: '50K-80K', description: '总监级管理岗位' },
];

// ==================== 部门数据 ====================

export const DEPT_DATA = [
  { name: '人力资源部', positions: ['HR主管', 'HR专员', '招聘专员', '培训专员'] },
  { name: '财务部', positions: ['财务经理', '会计', '出纳', '审计专员'] },
  { name: '行政部', positions: ['行政主管', '行政专员', '前台', '后勤主管'] },
  { name: '前端开发组', positions: ['前端工程师', 'UI设计师', '前端组长'] },
  { name: '后端开发组', positions: ['后端工程师', '架构师', 'DBA', '后端组长'] },
  { name: '测试组', positions: ['测试工程师', '测试组长', 'QA工程师'] },
  { name: '移动开发组', positions: ['Android工程师', 'iOS工程师', '移动组长'] },
  { name: '数据组', positions: ['数据分析师', '数据工程师', 'BI工程师'] },
  { name: '运维组', positions: ['运维工程师', 'SRE', '运维组长'] },
  { name: '生产车间', positions: ['车间主管', '操作工', '技术员'] },
  { name: '质量管理部', positions: ['质检主管', '质检员', '质量工程师'] },
  { name: '仓储物流部', positions: ['仓库主管', '仓管员', '物流专员'] },
  { name: '市场部', positions: ['市场专员', '市场经理', '品牌专员'] },
  { name: '销售部', positions: ['销售经理', '销售代表', '大客户经理'] },
  { name: '研发基地A', positions: ['研究员', '高级研究员', '项目组长'] },
  { name: '研发基地B', positions: ['研究员', '高级研究员', '项目组长'] },
];

// ==================== 计算函数 ====================

export function calculateSocialSecurity(base: number, location: SalaryLocation): number {
  const loc = currentLocationAllowances.find(l => l.location === location) || currentLocationAllowances[2];
  return Math.round(base * (loc.pensionRate + loc.medicalRate + loc.unemploymentRate));
}

export function calculateHousingFund(base: number): number {
  return Math.round(base * 0.12);
}

export function calculateTax(grossIncome: number, socialSecurity: number, housingFund: number): number {
  const taxableIncome = grossIncome - socialSecurity - housingFund - 5000;
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 3000) return Math.round(taxableIncome * 0.03);
  if (taxableIncome <= 12000) return Math.round(taxableIncome * 0.1 - 210);
  if (taxableIncome <= 25000) return Math.round(taxableIncome * 0.2 - 1410);
  if (taxableIncome <= 35000) return Math.round(taxableIncome * 0.25 - 2660);
  if (taxableIncome <= 55000) return Math.round(taxableIncome * 0.3 - 4410);
  if (taxableIncome <= 80000) return Math.round(taxableIncome * 0.35 - 7160);
  return Math.round(taxableIncome * 0.45 - 15160);
}

/** 获取社保各险种明细 */
export function getSocialSecurityDetails(base: number, location: SalaryLocation) {
  const loc = currentLocationAllowances.find(l => l.location === location) || currentLocationAllowances[2];
  return [
    { name: '养老保险', rate: `${(loc.pensionRate * 100).toFixed(1)}%`, personal: Math.round(base * loc.pensionRate), company: Math.round(base * loc.pensionCompanyRate) },
    { name: '医疗保险', rate: `${(loc.medicalRate * 100).toFixed(1)}%`, personal: Math.round(base * loc.medicalRate), company: Math.round(base * loc.medicalCompanyRate) },
    { name: '失业保险', rate: `${(loc.unemploymentRate * 100).toFixed(1)}%`, personal: Math.round(base * loc.unemploymentRate), company: Math.round(base * loc.unemploymentCompanyRate) },
    { name: '工伤保险', rate: `${(loc.injuryCompanyRate * 100).toFixed(1)}%`, personal: 0, company: Math.round(base * loc.injuryCompanyRate) },
    { name: '生育保险', rate: `${(loc.maternityCompanyRate * 100).toFixed(1)}%`, personal: 0, company: Math.round(base * loc.maternityCompanyRate) },
    { name: '住房公积金', rate: '12%', personal: Math.round(base * 0.12), company: Math.round(base * 0.12) },
  ];
}

/** 计算企业缴纳社保公积金 */
export function calculateCompanyContributions(base: number, location: SalaryLocation) {
  const loc = currentLocationAllowances.find(l => l.location === location) || currentLocationAllowances[2];
  const companyPension = Math.round(base * loc.pensionCompanyRate);
  const companyMedical = Math.round(base * loc.medicalCompanyRate);
  const companyUnemployment = Math.round(base * loc.unemploymentCompanyRate);
  const companyInjury = Math.round(base * loc.injuryCompanyRate);
  const companyMaternity = Math.round(base * loc.maternityCompanyRate);
  const companyHousingFund = Math.round(base * 0.12);
  const companyTotal = companyPension + companyMedical + companyUnemployment + companyInjury + companyMaternity + companyHousingFund;
  return {
    companyPension,
    companyMedical,
    companyUnemployment,
    companyInjury,
    companyMaternity,
    companyHousingFund,
    companyTotal,
  };
}

// 当前使用的地区社保配置（会被动态替换）
let currentLocationAllowances: ILocationAllowance[] = [...defaultLocationAllowances];

/** 设置地区社保配置 */
export function setLocationAllowances(allowances: ILocationAllowance[]) {
  currentLocationAllowances = allowances;
}

/** 获取地区社保配置 */
export function getLocationAllowances(): ILocationAllowance[] {
  return currentLocationAllowances;
}

/** 根据职级自动生成完整的工资数据 */
export function buildSalaryFromTemplate(
  emp: IEmployee, month: string, rank: IRank,
  performance = 0, overtime = 0,
): ISalary {
  const loc = currentLocationAllowances.find(l => l.location === emp.salaryLocation) || currentLocationAllowances[2];
  const base = rank.baseSalary + rank.positionSalary;
  const socialSecurity = calculateSocialSecurity(base, emp.salaryLocation);
  const housingFund = calculateHousingFund(base);
  const mealAllowance = rank.mealAllowance + loc.mealExtra;
  const transportAllowance = rank.transportAllowance + loc.transportExtra;
  const housingAllowance = loc.housingAllowance;
  const grossSalary = rank.baseSalary + rank.positionSalary + performance + overtime + mealAllowance + transportAllowance + housingAllowance;
  const tax = calculateTax(grossSalary, socialSecurity, housingFund);
  const netSalary = grossSalary - socialSecurity - housingFund - tax;

  // 企业缴纳部分
  const companyContributions = calculateCompanyContributions(base, emp.salaryLocation);

  return {
    id: `sal-${emp.employeeId}-${month}`,
    employeeId: emp.employeeId,
    employeeName: emp.name,
    department: emp.department,
    month,
    baseSalary: rank.baseSalary,
    positionSalary: rank.positionSalary,
    performance,
    overtime,
    mealAllowance,
    transportAllowance,
    grossSalary,
    housingAllowance,
    socialSecurity,
    housingFund,
    tax,
    netSalary,
    ...companyContributions,
  };
}

// ==================== 生成模拟员工数据 ====================

function generateMockEmployees(): IEmployee[] {
  const names = [
    '张明', '李华', '王芳', '刘强', '陈静', '赵伟', '周敏', '吴涛', '孙丽', '郑杰',
    '杨帆', '林雪', '黄勇', '徐涛', '马丽', '胡军', '朱琳', '高峰', '方静', '任雪',
    '钱伟', '孙磊', '李娜', '王刚', '刘洋', '陈思', '赵敏', '周杰', '吴静', '孙浩',
  ];
  const ranks = defaultRanks.map(r => r.name);
  const locations: SalaryLocation[] = ['江西', '深圳', '南京'];
  const employees: IEmployee[] = [];

  for (let i = 0; i < 150; i++) {
    const dept = DEPT_DATA[i % DEPT_DATA.length];
    const position = dept.positions[i % dept.positions.length];
    const rank = ranks[Math.min(Math.floor(i / 30), ranks.length - 1)];
    const hireYear = 2018 + Math.floor(Math.random() * 6);
    const hireMonth = Math.floor(Math.random() * 12) + 1;
    const hireDay = Math.floor(Math.random() * 28) + 1;
    let status: EmployeeStatus = 'active';
    if (i % 20 === 0) status = 'pending';
    else if (i % 7 === 0) status = 'inactive';

    employees.push({
      id: `emp-${i + 1}`,
      name: names[i % names.length] + (i >= names.length ? `${Math.floor(i / names.length)}` : ''),
      employeeId: `FD${String(i + 1).padStart(3, '0')}`,
      department: dept.name,
      position,
      rank,
      status,
      hireDate: `${hireYear}-${String(hireMonth).padStart(2, '0')}-${String(hireDay).padStart(2, '0')}`,
      phone: `138****${String(i + 1).padStart(4, '0')}`,
      email: `${names[i % names.length].toLowerCase()}${i}@feida.com`,
      salaryLocation: locations[i % 3],
    });
  }
  return employees;
}

/** 生成模拟薪资数据 */
function generateMockSalaryData(employees: IEmployee[], ranks: IRank[]): ISalary[] {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const salaries: ISalary[] = [];
  const activeEmployees = employees.filter(e => e.status === 'active');

  for (const emp of activeEmployees.slice(0, 30)) {
    const rank = ranks.find(r => r.name === emp.rank) || ranks[0];
    for (const month of [lastMonth, currentMonth]) {
      const performance = Math.round(rank.baseSalary * (0.2 + Math.random() * 0.3));
      const overtime = Math.round(Math.random() * 2000);
      salaries.push(buildSalaryFromTemplate(emp, month, rank, performance, overtime));
    }
  }
  return salaries;
}

/** 生成默认岗位数据 */
function generateDefaultPositions(): IPosition[] {
  const positions: IPosition[] = [];
  let id = 1;
  for (const dept of DEPT_DATA) {
    for (const pos of dept.positions) {
      positions.push({ id: `pos-${id++}`, name: pos, department: dept.name, count: Math.floor(Math.random() * 8) + 2, status: 'active' });
    }
  }
  return positions;
}

// ==================== sessionStorage 工具 ====================

const KEYS = {
  employees: '__hr_employees',
  ranks: '__hr_ranks',
  positions: '__hr_positions',
  salaries: '__hr_salaries',
  locationAllowances: '__hr_location_allowances',
  salaryItemTemplates: '__hr_salary_item_templates',
  salaryAdjustments: '__hr_salary_adjustments',
  // 考勤管理
  shiftTypes: '__hr_shift_types',
  schedules: '__hr_schedules',
  attendanceRecords: '__hr_attendance_records',
  leaveRecords: '__hr_leave_records',
  overtimeRecords: '__hr_overtime_records',
  leaveBalances: '__hr_leave_balances',
  attendanceRule: '__hr_attendance_rule',
  shiftChangeRequests: '__hr_shift_change_requests',
};

function load<T>(key: string, fallback: T): T {
  try {
    const s = sessionStorage.getItem(key);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return fallback;
}

function save<T>(key: string, data: T) {
  try { sessionStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
}

// ==================== 全局数据 Hook ====================

export function useHRData() {
  const [employees, setEmployees] = useState<IEmployee[]>(() => load(KEYS.employees, generateMockEmployees()));
  const [ranks, setRanks] = useState<IRank[]>(() => load(KEYS.ranks, defaultRanks));
  const [positions, setPositions] = useState<IPosition[]>(() => load(KEYS.positions, generateDefaultPositions()));
  const [salaries, setSalaries] = useState<ISalary[]>(() => load(KEYS.salaries, generateMockSalaryData(load(KEYS.employees, generateMockEmployees()), load(KEYS.ranks, defaultRanks))));
  const [locationAllowances, setLocationAllowancesState] = useState<ILocationAllowance[]>(() => {
    const loaded = load<ILocationAllowance[]>(KEYS.locationAllowances, defaultLocationAllowances);
    currentLocationAllowances = loaded;
    return loaded;
  });

  // 工资调整项模板（全局配置）
  const [salaryItemTemplates, setSalaryItemTemplates] = useState<ISalaryItemTemplate[]>(() =>
    load<ISalaryItemTemplate[]>(KEYS.salaryItemTemplates, defaultSalaryItemTemplates)
  );

  // 每月工资调整项记录（员工-月份维度）
  const [salaryAdjustments, setSalaryAdjustments] = useState<ISalaryAdjustment[]>(() =>
    load<ISalaryAdjustment[]>(KEYS.salaryAdjustments, [])
  );

  // ---- 考勤管理状态 ----
  const [shiftTypes, setShiftTypes] = useState<IShiftType[]>(() =>
    load<IShiftType[]>(KEYS.shiftTypes, defaultShiftTypes)
  );
  const [schedules, setSchedules] = useState<ISchedule[]>(() =>
    load<ISchedule[]>(KEYS.schedules, [])
  );
  const [attendanceRecords, setAttendanceRecords] = useState<IAttendanceRecord[]>(() =>
    load<IAttendanceRecord[]>(KEYS.attendanceRecords, [])
  );
  const [leaveRecords, setLeaveRecords] = useState<ILeaveRecord[]>(() =>
    load<ILeaveRecord[]>(KEYS.leaveRecords, [])
  );
  const [overtimeRecords, setOvertimeRecords] = useState<IOvertimeRecord[]>(() =>
    load<IOvertimeRecord[]>(KEYS.overtimeRecords, [])
  );
  const [leaveBalances, setLeaveBalances] = useState<ILeaveBalance[]>(() =>
    load<ILeaveBalance[]>(KEYS.leaveBalances, [])
  );
  const [attendanceRule, setAttendanceRule] = useState<IAttendanceRule>(() =>
    load<IAttendanceRule>(KEYS.attendanceRule, defaultAttendanceRule)
  );
  const [shiftChangeRequests, setShiftChangeRequests] = useState<IShiftChangeRequest[]>(() =>
    load<IShiftChangeRequest[]>(KEYS.shiftChangeRequests, [])
  );

  // 持久化
  useEffect(() => { save(KEYS.employees, employees); }, [employees]);
  useEffect(() => { save(KEYS.ranks, ranks); }, [ranks]);
  useEffect(() => { save(KEYS.positions, positions); }, [positions]);
  useEffect(() => { save(KEYS.salaries, salaries); }, [salaries]);
  useEffect(() => {
    save(KEYS.locationAllowances, locationAllowances);
    setLocationAllowances(locationAllowances);
  }, [locationAllowances]);
  useEffect(() => { save(KEYS.salaryItemTemplates, salaryItemTemplates); }, [salaryItemTemplates]);
  useEffect(() => { save(KEYS.salaryAdjustments, salaryAdjustments); }, [salaryAdjustments]);
  // 考勤持久化
  useEffect(() => { save(KEYS.shiftTypes, shiftTypes); }, [shiftTypes]);
  useEffect(() => { save(KEYS.schedules, schedules); }, [schedules]);
  useEffect(() => { save(KEYS.attendanceRecords, attendanceRecords); }, [attendanceRecords]);
  useEffect(() => { save(KEYS.leaveRecords, leaveRecords); }, [leaveRecords]);
  useEffect(() => { save(KEYS.overtimeRecords, overtimeRecords); }, [overtimeRecords]);
  useEffect(() => { save(KEYS.leaveBalances, leaveBalances); }, [leaveBalances]);
  useEffect(() => { save(KEYS.attendanceRule, attendanceRule); }, [attendanceRule]);
  useEffect(() => { save(KEYS.shiftChangeRequests, shiftChangeRequests); }, [shiftChangeRequests]);

  // ---- 员工操作 ----
  const getEmployeeById = useCallback((employeeId: string) => employees.find(e => e.employeeId === employeeId), [employees]);
  const getActiveEmployees = useCallback(() => employees.filter(e => e.status === 'active'), [employees]);
  const getSalaryableEmployees = useCallback(() => employees.filter(e => e.status === 'active' || e.status === 'pending'), [employees]);
  const addEmployee = useCallback((emp: IEmployee) => setEmployees(prev => [...prev, emp]), []);
  const updateEmployee = useCallback((id: string, data: Partial<IEmployee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  }, []);
  const removeEmployee = useCallback((id: string) => setEmployees(prev => prev.filter(e => e.id !== id)), []);

  // ---- 职级操作 ----
  const getRankById = useCallback((id: string) => ranks.find(r => r.id === id) || null, [ranks]);
  const getRankByName = useCallback((name: string) => ranks.find(r => r.name === name) || null, [ranks]);
  const addRank = useCallback((rank: IRank) => setRanks(prev => [...prev, rank]), []);
  const updateRank = useCallback((id: string, data: Partial<IRank>) => {
    setRanks(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }, []);
  const removeRank = useCallback((id: string) => setRanks(prev => prev.filter(r => r.id !== id)), []);

  // ---- 地区社保配置操作 ----
  const getLocationAllowanceByLocation = useCallback((location: string) => locationAllowances.find(l => l.location === location) || null, [locationAllowances]);
  const addLocationAllowance = useCallback((allowance: ILocationAllowance) => {
    setLocationAllowancesState(prev => [...prev, allowance]);
  }, []);
  const updateLocationAllowance = useCallback((location: string, data: Partial<ILocationAllowance>) => {
    setLocationAllowancesState(prev => prev.map(l => l.location === location ? { ...l, ...data } : l));
  }, []);
  const removeLocationAllowance = useCallback((location: string) => {
    setLocationAllowancesState(prev => prev.filter(l => l.location !== location));
  }, []);
  const resetLocationAllowances = useCallback(() => {
    setLocationAllowancesState([...defaultLocationAllowances]);
  }, []);

  // ---- 岗位操作 ----
  const addPosition = useCallback((pos: IPosition) => setPositions(prev => [...prev, pos]), []);
  const updatePosition = useCallback((id: string, data: Partial<IPosition>) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);
  const removePosition = useCallback((id: string) => setPositions(prev => prev.filter(p => p.id !== id)), []);

  // ---- 薪资操作 ----
  const getSalariesByMonth = useCallback((month: string) => salaries.filter(s => s.month === month), [salaries]);
  const getSalary = useCallback((employeeId: string, month: string) => salaries.find(s => s.employeeId === employeeId && s.month === month), [salaries]);
  const getEmployeeSalaryHistory = useCallback((employeeId: string) => salaries.filter(s => s.employeeId === employeeId).sort((a, b) => b.month.localeCompare(a.month)), [salaries]);
  const saveSalary = useCallback((salary: ISalary) => {
    setSalaries(prev => {
      const idx = prev.findIndex(s => s.id === salary.id);
      if (idx >= 0) { const u = [...prev]; u[idx] = salary; return u; }
      return [...prev, salary];
    });
  }, []);
  const deleteSalary = useCallback((id: string) => setSalaries(prev => prev.filter(s => s.id !== id)), []);

  /** 批量为在职员工生成某月工资（模板填充） */
  const generateMonthSalaries = useCallback((month: string): number => {
    const salaryable = employees.filter(e => e.status === 'active' || e.status === 'pending');
    const existing = new Set(salaries.filter(s => s.month === month).map(s => s.employeeId));
    const prevMonth = (() => {
      const [y, m] = month.split('-').map(Number);
      return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
    })();
    const newItems: ISalary[] = [];

    for (const emp of salaryable) {
      if (existing.has(emp.employeeId)) continue;
      const rank = ranks.find(r => r.name === emp.rank) || ranks[0];
      const prevSalary = salaries.find(s => s.employeeId === emp.employeeId && s.month === prevMonth);
      newItems.push(buildSalaryFromTemplate(emp, month, rank, prevSalary?.performance || 0, 0));
    }

    if (newItems.length) setSalaries(prev => [...prev, ...newItems]);
    return newItems.length;
  }, [employees, ranks, salaries]);

  // ---- 工资调整项模板操作 ----
  const addSalaryItemTemplate = useCallback((tpl: ISalaryItemTemplate) => {
    setSalaryItemTemplates(prev => [...prev, tpl]);
  }, []);
  const updateSalaryItemTemplate = useCallback((id: string, data: Partial<ISalaryItemTemplate>) => {
    setSalaryItemTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);
  const removeSalaryItemTemplate = useCallback((id: string) => {
    setSalaryItemTemplates(prev => prev.filter(t => t.id !== id));
  }, []);
  const resetSalaryItemTemplates = useCallback(() => {
    setSalaryItemTemplates([...defaultSalaryItemTemplates]);
  }, []);

  // ---- 工资调整项记录操作 ----
  /** 获取某员工某月的所有调整项 */
  const getAdjustmentsByEmployeeMonth = useCallback((employeeId: string, month: string) => {
    return salaryAdjustments.filter(a => a.employeeId === employeeId && a.month === month);
  }, [salaryAdjustments]);

  /** 获取某月的所有调整项（跨所有员工） */
  const getAdjustmentsByMonth = useCallback((month: string) => {
    return salaryAdjustments.filter(a => a.month === month);
  }, [salaryAdjustments]);

  /** 添加一条调整项记录 */
  const addSalaryAdjustment = useCallback((adj: ISalaryAdjustment) => {
    setSalaryAdjustments(prev => [...prev, adj]);
  }, []);

  /** 批量添加调整项（从模板实例化） */
  const addSalaryAdjustmentsFromTemplate = useCallback((employeeId: string, month: string, templateId: string, amount: number) => {
    const tpl = salaryItemTemplates.find(t => t.id === templateId);
    if (!tpl) return;
    const adj: ISalaryAdjustment = {
      id: `adj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      employeeId,
      month,
      templateId,
      name: tpl.name,
      type: tpl.type,
      category: tpl.category,
      amount,
      isPreTax: tpl.isPreTax,
      isCompany: tpl.isCompany,
      remark: tpl.remark,
    };
    setSalaryAdjustments(prev => [...prev, adj]);
  }, [salaryItemTemplates]);

  /** 更新调整项记录 */
  const updateSalaryAdjustment = useCallback((id: string, data: Partial<ISalaryAdjustment>) => {
    setSalaryAdjustments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  }, []);

  /** 删除调整项记录 */
  const removeSalaryAdjustment = useCallback((id: string) => {
    setSalaryAdjustments(prev => prev.filter(a => a.id !== id));
  }, []);

  /** 删除某员工某月的所有调整项 */
  const clearAdjustmentsByEmployeeMonth = useCallback((employeeId: string, month: string) => {
    setSalaryAdjustments(prev => prev.filter(a => !(a.employeeId === employeeId && a.month === month)));
  }, []);

  /** 批量为某月所有员工应用模板中的自动项 */
  const applyRecurringToMonth = useCallback((month: string) => {
    const recurringTemplates = salaryItemTemplates.filter(t => t.isActive && t.isRecurring && t.defaultAmount && t.defaultAmount > 0);
    const salaryable = employees.filter(e => e.status === 'active' || e.status === 'pending');
    const newItems: ISalaryAdjustment[] = [];
    let idCounter = 0;

    for (const emp of salaryable) {
      for (const tpl of recurringTemplates) {
        const exists = salaryAdjustments.some(a => a.employeeId === emp.employeeId && a.month === month && a.templateId === tpl.id);
        if (!exists) {
          newItems.push({
            id: `adj-${Date.now()}-${idCounter++}`,
            employeeId: emp.employeeId,
            month,
            templateId: tpl.id,
            name: tpl.name,
            type: tpl.type,
            category: tpl.category,
            amount: tpl.defaultAmount!,
            isPreTax: tpl.isPreTax,
            isCompany: tpl.isCompany,
            remark: tpl.remark,
          });
        }
      }
    }
    if (newItems.length > 0) {
      setSalaryAdjustments(prev => [...prev, ...newItems]);
    }
    return { added: newItems.length, totalEmployees: salaryable.length, templates: recurringTemplates.length };
  }, [salaryItemTemplates, employees, salaryAdjustments]);

  // ==================== 考勤管理 CRUD 函数 ====================

  // ---- 班次类型操作 ----
  const getShiftTypeById = useCallback((id: string) => shiftTypes.find(s => s.id === id) || null, [shiftTypes]);
  const getActiveShiftTypes = useCallback(() => shiftTypes.filter(s => s.isActive), [shiftTypes]);
  const addShiftType = useCallback((shift: IShiftType) => setShiftTypes(prev => [...prev, shift]), []);
  const updateShiftType = useCallback((id: string, data: Partial<IShiftType>) => {
    setShiftTypes(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);
  const removeShiftType = useCallback((id: string) => setShiftTypes(prev => prev.filter(s => s.id !== id)), []);
  const resetShiftTypes = useCallback(() => setShiftTypes([...defaultShiftTypes]), []);

  // ---- 排班操作 ----
  const getSchedulesByEmployee = useCallback((employeeId: string) =>
    schedules.filter(s => s.employeeId === employeeId), [schedules]);
  const getSchedulesByMonth = useCallback((month: string) =>
    schedules.filter(s => s.date.startsWith(month)), [schedules]);
  const getSchedulesByDepartment = useCallback((department: string, month: string) =>
    schedules.filter(s => s.department === department && s.date.startsWith(month)), [schedules]);
  const batchAddSchedules = useCallback((newSchedules: ISchedule[]) => {
    setSchedules(prev => {
      const ids = new Set(newSchedules.map(s => `${s.employeeId}_${s.date}`));
      const filtered = prev.filter(s => !ids.has(`${s.employeeId}_${s.date}`));
      return [...filtered, ...newSchedules];
    });
  }, []);
  const updateSchedule = useCallback((id: string, data: Partial<ISchedule>) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);
  const deleteSchedule = useCallback((id: string) => setSchedules(prev => prev.filter(s => s.id !== id)), []);
  const deleteSchedulesByEmployee = useCallback((employeeId: string, month: string) => {
    setSchedules(prev => prev.filter(s => !(s.employeeId === employeeId && s.date.startsWith(month))));
  }, []);

  // ---- 考勤记录操作 ----
  const getAttendanceByEmployee = useCallback((employeeId: string) =>
    attendanceRecords.filter(r => r.employeeId === employeeId), [attendanceRecords]);
  const getAttendanceByMonth = useCallback((month: string) =>
    attendanceRecords.filter(r => r.date.startsWith(month)), [attendanceRecords]);
  const getAttendanceByDate = useCallback((date: string) =>
    attendanceRecords.filter(r => r.date === date), [attendanceRecords]);
  const addAttendanceRecord = useCallback((record: IAttendanceRecord) => {
    setAttendanceRecords(prev => {
      const existing = prev.findIndex(r => r.employeeId === record.employeeId && r.date === record.date);
      if (existing >= 0) {
        return prev.map((r, i) => i === existing ? { ...r, ...record } : r);
      }
      return [...prev, record];
    });
  }, []);
  const updateAttendanceRecord = useCallback((id: string, data: Partial<IAttendanceRecord>) => {
    setAttendanceRecords(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }, []);
  const batchAddAttendanceRecords = useCallback((records: IAttendanceRecord[]) => {
    setAttendanceRecords(prev => {
      const result = [...prev];
      for (const record of records) {
        const idx = result.findIndex(r => r.employeeId === record.employeeId && r.date === record.date);
        if (idx >= 0) {
          result[idx] = { ...result[idx], ...record };
        } else {
          result.push(record);
        }
      }
      return result;
    });
  }, []);

  // ---- 请假记录操作 ----
  const getLeaveByEmployee = useCallback((employeeId: string) =>
    leaveRecords.filter(l => l.employeeId === employeeId), [leaveRecords]);
  const getLeaveByMonth = useCallback((month: string) =>
    leaveRecords.filter(l => l.startDate.startsWith(month) || l.endDate.startsWith(month)), [leaveRecords]);
  const getLeaveByStatus = useCallback((status: ILeaveRecord['status']) =>
    leaveRecords.filter(l => l.status === status), [leaveRecords]);
  const addLeaveRecord = useCallback((record: ILeaveRecord) => setLeaveRecords(prev => [...prev, record]), []);
  const updateLeaveRecord = useCallback((id: string, data: Partial<ILeaveRecord>) => {
    setLeaveRecords(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  }, []);
  const approveLeave = useCallback((id: string, approver: string) => {
    setLeaveRecords(prev => prev.map(l => l.id === id ? { ...l, status: 'approved', approver, approveTime: new Date().toISOString() } : l));
  }, []);
  const rejectLeave = useCallback((id: string, approver: string, reason: string) => {
    setLeaveRecords(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected', approver, approveTime: new Date().toISOString(), rejectReason: reason } : l));
  }, []);

  // ---- 年假余额操作 ----
  const getLeaveBalanceByEmployee = useCallback((employeeId: string, year: number) =>
    leaveBalances.find(b => b.employeeId === employeeId && b.year === year) || null, [leaveBalances]);
  const initLeaveBalance = useCallback((employeeId: string, employeeName: string, year: number) => {
    const exist = leaveBalances.find(b => b.employeeId === employeeId && b.year === year);
    if (exist) return;
    const newBalance: ILeaveBalance = {
      id: `lb_${employeeId}_${year}`,
      employeeId, employeeName, year,
      annualTotal: 0, annualUsed: 0, annualRemaining: 0,
      annualCarryOver: 0, annualCarryExpiring: 0,
      compensatoryTotal: 0, compensatoryUsed: 0,
    };
    setLeaveBalances(prev => [...prev, newBalance]);
  }, [leaveBalances]);
  const updateLeaveBalance = useCallback((id: string, data: Partial<ILeaveBalance>) => {
    setLeaveBalances(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  }, []);
  const recalculateLeaveBalance = useCallback((employeeId: string, year: number) => {
    const balance = leaveBalances.find(b => b.employeeId === employeeId && b.year === year);
    if (!balance) return;
    const usedAnnual = leaveRecords
      .filter(l => l.employeeId === employeeId && l.status === 'approved' &&
        (l.startDate.startsWith(`${year}`) || l.endDate.startsWith(`${year}`)) &&
        l.leaveType === 'annual')
      .reduce((sum, l) => sum + l.totalDays, 0);
    setLeaveBalances(prev => prev.map(b =>
      b.employeeId === employeeId && b.year === year
        ? { ...b, annualUsed: usedAnnual, annualRemaining: b.annualTotal - usedAnnual + b.annualCarryOver }
        : b
    ));
  }, [leaveBalances, leaveRecords]);

  // ---- 加班记录操作 ----
  const getOvertimeByEmployee = useCallback((employeeId: string) =>
    overtimeRecords.filter(o => o.employeeId === employeeId), [overtimeRecords]);
  const getOvertimeByMonth = useCallback((month: string) =>
    overtimeRecords.filter(o => o.date.startsWith(month)), [overtimeRecords]);
  const getOvertimePending = useCallback(() =>
    overtimeRecords.filter(o => o.status === 'pending'), [overtimeRecords]);
  const addOvertimeRecord = useCallback((record: IOvertimeRecord) => setOvertimeRecords(prev => [...prev, record]), []);
  const approveOvertime = useCallback((id: string, approver: string, compensatory: boolean) => {
    const record = overtimeRecords.find(o => o.id === id);
    if (!record) return;
    setOvertimeRecords(prev => prev.map(o => o.id === id ? { ...o, status: 'approved', approver, compensatory, compensatoryHours: compensatory ? record.hours : undefined } : o));
  }, [overtimeRecords]);
  const rejectOvertime = useCallback((id: string, approver: string) => {
    setOvertimeRecords(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected', approver } : o));
  }, []);

  // ---- 考勤规则操作 ----
  const updateAttendanceRule = useCallback((data: Partial<IAttendanceRule>) => {
    setAttendanceRule(prev => ({ ...prev, ...data }));
  }, []);
  const addCheckLocation = useCallback((location: ICheckLocation) => {
    setAttendanceRule(prev => ({ ...prev, appCheckLocations: [...prev.appCheckLocations, location] }));
  }, []);
  const removeCheckLocation = useCallback((id: string) => {
    setAttendanceRule(prev => ({ ...prev, appCheckLocations: prev.appCheckLocations.filter(l => l.id !== id) }));
  }, []);

  // ---- 调班申请操作 ----
  const getShiftChangeByEmployee = useCallback((employeeId: string) =>
    shiftChangeRequests.filter(r => r.employeeId === employeeId), [shiftChangeRequests]);
  const getShiftChangePending = useCallback(() =>
    shiftChangeRequests.filter(r => r.status === 'pending'), [shiftChangeRequests]);
  const addShiftChangeRequest = useCallback((req: IShiftChangeRequest) => setShiftChangeRequests(prev => [...prev, req]), []);
  const approveShiftChange = useCallback((id: string, approver: string) => {
    const req = shiftChangeRequests.find(r => r.id === id);
    if (!req) return;
    setShiftChangeRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', approver, approveTime: new Date().toISOString() } : r));
    // 更新排班
    setSchedules(prev => prev.map(s =>
      (s.employeeId === req.employeeId && s.date === req.originalDate)
        ? { ...s, date: req.targetDate, shiftTypeId: req.targetShiftId, remark: `调班：${req.originalDate}→${req.targetDate}` }
        : s
    ));
  }, [shiftChangeRequests]);
  const rejectShiftChange = useCallback((id: string, approver: string) => {
    setShiftChangeRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', approver, approveTime: new Date().toISOString() } : r));
  }, []);

  // ---- 出勤日报生成 ----
  const generateDailyReport = useCallback((employeeId: string, date: string) => {
    const emp = employees.find(e => e.employeeId === employeeId);
    if (!emp) return null;
    const record = attendanceRecords.find(r => r.employeeId === employeeId && r.date === date);
    const leaves = leaveRecords.filter(l => l.employeeId === employeeId && l.status === 'approved' && l.startDate <= date && l.endDate >= date);
    const overtime = overtimeRecords.filter(o => o.employeeId === employeeId && o.status === 'approved' && o.date === date);
    const schedule = schedules.find(s => s.employeeId === employeeId && s.date === date);
    const shift = schedule ? shiftTypes.find(st => st.id === schedule.shiftTypeId) : null;
    const report: IDailyAttendanceReport = {
      id: `rpt_${employeeId}_${date}`,
      employeeId, employeeName: emp.name, department: emp.department, date,
      shiftTypeName: shift?.name || '常规班',
      scheduledStart: shift?.startTime || '09:00',
      scheduledEnd: shift?.endTime || '18:00',
      actualStart: record?.checkIn || null,
      actualEnd: record?.checkOut || null,
      isPresent: !!record?.checkIn,
      isLate: record?.status === 'late' || false,
      lateMinutes: record?.lateMinutes || 0,
      isEarlyLeave: record?.status === 'early_leave' || false,
      earlyLeaveMinutes: record?.earlyLeaveMinutes || 0,
      isAbsent: record?.status?.startsWith('absent') || false,
      absentType: record?.status === 'absent_full' ? 'full' : record?.status === 'absent_half' ? 'half' : 'none',
      isOvertime: overtime.length > 0,
      overtimeHours: overtime.reduce((sum, o) => sum + o.hours, 0),
      isOnLeave: leaves.length > 0,
      leaveType: leaves[0]?.leaveType,
      leaveHours: leaves.reduce((sum, l) => sum + l.totalDays * 8, 0),
      workHours: record?.checkIn && record?.checkOut ? calculateHours(record.checkIn, record.checkOut) : 0,
      effectiveWorkHours: 0,
    };
    report.effectiveWorkHours = report.workHours - (report.lateMinutes / 60) * 8;
    return report;
  }, [employees, attendanceRecords, leaveRecords, overtimeRecords, schedules, shiftTypes]);

  // ---- 月度统计汇总 ----
  const generateMonthlySummary = useCallback((employeeId: string, month: string) => {
    const emp = employees.find(e => e.employeeId === employeeId);
    if (!emp) return null;
    const records = attendanceRecords.filter(r => r.employeeId === employeeId && r.date.startsWith(month));
    const leaves = leaveRecords.filter(l => l.employeeId === employeeId && l.status === 'approved' &&
      (l.startDate.startsWith(month) || l.endDate.startsWith(month)));
    const overtime = overtimeRecords.filter(o => o.employeeId === employeeId && o.status === 'approved' && o.date.startsWith(month));
    // 计算应出勤天数（排除周末）
    const [year, mon] = month.split('-').map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    let totalWorkDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(year, mon - 1, d).getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) totalWorkDays++;
    }
    const summary: IMonthlyAttendanceSummary = {
      id: `summary_${employeeId}_${month}`,
      employeeId, employeeName: emp.name, department: emp.department, month,
      totalWorkDays,
      actualWorkDays: records.filter(r => r.status === 'normal' || r.checkIn).length,
      absentDays: records.filter(r => r.status?.startsWith('absent')).length,
      lateCount: records.filter(r => r.status === 'late').length,
      lateMinutesTotal: records.reduce((sum, r) => sum + (r.lateMinutes || 0), 0),
      earlyLeaveCount: records.filter(r => r.status === 'early_leave').length,
      overtimeWorkday: overtime.filter(o => o.overtimeType === 'workday').reduce((sum, o) => sum + o.hours, 0),
      overtimeRestday: overtime.filter(o => o.overtimeType === 'restday').reduce((sum, o) => sum + o.hours, 0),
      overtimeHoliday: overtime.filter(o => o.overtimeType === 'holiday').reduce((sum, o) => sum + o.hours, 0),
      overtimeTotal: overtime.reduce((sum, o) => sum + o.hours, 0),
      leaveAnnual: leaves.filter(l => l.leaveType === 'annual').reduce((sum, l) => sum + l.totalDays, 0),
      leaveSick: leaves.filter(l => l.leaveType === 'sick').reduce((sum, l) => sum + l.totalDays, 0),
      leavePersonal: leaves.filter(l => l.leaveType === 'personal').reduce((sum, l) => sum + l.totalDays, 0),
      leaveMarriage: leaves.filter(l => l.leaveType === 'marriage').reduce((sum, l) => sum + l.totalDays, 0),
      leaveMaternity: leaves.filter(l => l.leaveType === 'maternity').reduce((sum, l) => sum + l.totalDays, 0),
      leaveOther: leaves.filter(l => ['bereavement', 'compensatory'].includes(l.leaveType)).reduce((sum, l) => sum + l.totalDays, 0),
      leaveTotal: leaves.reduce((sum, l) => sum + l.totalDays, 0),
      effectiveHours: records.reduce((sum, r) => sum + calculateHours(r.checkIn || '', r.checkOut || ''), 0),
    };
    return summary;
  }, [employees, attendanceRecords, leaveRecords, overtimeRecords]);

  return {
    employees, ranks, positions, salaries, locationAllowances, salaryItemTemplates, salaryAdjustments,
    // 考勤管理
    shiftTypes, schedules, attendanceRecords, leaveRecords, overtimeRecords, leaveBalances, attendanceRule, shiftChangeRequests,
    getEmployeeById, getActiveEmployees, getSalaryableEmployees,
    addEmployee, updateEmployee, removeEmployee,
    getRankById, getRankByName, addRank, updateRank, removeRank,
    getLocationAllowanceByLocation, addLocationAllowance, updateLocationAllowance, removeLocationAllowance, resetLocationAllowances,
    addPosition, updatePosition, removePosition,
    getSalariesByMonth, getSalary, getEmployeeSalaryHistory,
    saveSalary, deleteSalary, generateMonthSalaries,
    // 工资调整项
    addSalaryItemTemplate, updateSalaryItemTemplate, removeSalaryItemTemplate, resetSalaryItemTemplates,
    getAdjustmentsByEmployeeMonth, getAdjustmentsByMonth,
    addSalaryAdjustment, addSalaryAdjustmentsFromTemplate, updateSalaryAdjustment, removeSalaryAdjustment,
    clearAdjustmentsByEmployeeMonth, applyRecurringToMonth,
    // 考勤管理
    getShiftTypeById, getActiveShiftTypes, addShiftType, updateShiftType, removeShiftType, resetShiftTypes,
    getSchedulesByEmployee, getSchedulesByMonth, getSchedulesByDepartment,
    batchAddSchedules, updateSchedule, deleteSchedule, deleteSchedulesByEmployee,
    getAttendanceByEmployee, getAttendanceByMonth, getAttendanceByDate,
    addAttendanceRecord, updateAttendanceRecord, batchAddAttendanceRecords,
    getLeaveByEmployee, getLeaveByMonth, getLeaveByStatus,
    addLeaveRecord, updateLeaveRecord, approveLeave, rejectLeave,
    getLeaveBalanceByEmployee, initLeaveBalance, updateLeaveBalance, recalculateLeaveBalance,
    getOvertimeByEmployee, getOvertimeByMonth, getOvertimePending,
    addOvertimeRecord, approveOvertime, rejectOvertime,
    updateAttendanceRule, addCheckLocation, removeCheckLocation,
    getShiftChangeByEmployee, getShiftChangePending,
    addShiftChangeRequest, approveShiftChange, rejectShiftChange,
    generateDailyReport, generateMonthlySummary,
  };
}
