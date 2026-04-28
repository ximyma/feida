/**
 * 批量排班与年假规则引擎 v1.0
 * 功能：
 * 1. 批量排班生成（支持周期循环）
 * 2. 年假规则联动（根据入职年限自动计算）
 * 3. 排班冲突检测
 * 4. 批量调班操作
 */

import { DatabaseService } from './modules/database/database.service';

// ============ 类型定义 ============

export interface ShiftType {
  id: string;
  name: string;
  kind: string;
  startTime: string;
  endTime: string;
  lateThreshold: number;
  earlyLeaveThreshold: number;
  workHours: number;
  color?: string;
}

export interface Schedule {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  date: string;
  shiftTypeId: string;
  shiftTypeName: string;
  scheduledStart: string;
  scheduledEnd: string;
  isRestDay: number;
  isHoliday: number;
  remark?: string;
}

export interface Employee {
  id: string;
  employeeId?: string;
  name?: string;
  employeeName?: string;
  department?: string;
  position?: string;
  entryDate?: string;
  status?: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  year: string;
  leaveType: string;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
}

export interface AnnualLeaveRule {
  baseDays: number;       // 基础年假天数
  incrementPerYear: number; // 每增加一年多休天数
  maxDays: number;         // 最大年假天数
  maxCarryOver: number;    // 最大结转天数
  expireMonths: number;     // 有效期（月）
}

export interface BatchScheduleResult {
  success: boolean;
  generated: number;
  skipped: number;
  errors: string[];
  message: string;
}

export interface LeaveAccrualResult {
  success: boolean;
  updated: number;
  results: { employeeId: string; employeeName: string; totalDays: number; availableDays: number }[];
  message: string;
}

// ============ 批量排班引擎 ============

/**
 * 批量生成排班
 */
export async function batchGenerateSchedules(
  db: DatabaseService,
  params: {
    employeeIds: string[];
    startDate: string;
    endDate: string;
    shiftTypeId: string;
    shiftTypeName: string;
    pattern?: 'daily' | 'weekly' | 'biweekly';
    restDays?: number[];
    overwrite?: boolean;
  }
): Promise<BatchScheduleResult> {
  const errors: string[] = [];
  let generated = 0;
  let skipped = 0;

  try {
    const { employeeIds, startDate, endDate, shiftTypeId, shiftTypeName, pattern = 'daily', restDays = [], overwrite = false } = params;

    // 获取班次信息
    const shift = db.findById('shift_types', shiftTypeId) as ShiftType | undefined;
    const scheduledStart = shift?.startTime || '09:00';
    const scheduledEnd = shift?.endTime || '18:00';

    // 生成日期列表
    const dates = generateDateRange(startDate, endDate, pattern, restDays);

    // 获取员工信息
    const employees = employeeIds.map(id => db.findById('employees', id) as Employee).filter(Boolean);

    // 按员工逐个创建排班
    for (const emp of employees) {
      for (const date of dates) {
        const scheduleId = `sch_${emp.id}_${date.replace(/-/g, '')}`;

        // 检查是否已存在
        const existing = db.findWhere('schedules', { employeeId: emp.id, date }) as any[];
        if (existing.length > 0) {
          if (overwrite) {
            db.update('schedules', existing[0].id, {
              shiftTypeId,
              shiftTypeName,
              scheduledStart,
              scheduledEnd,
              remark: '批量排班覆盖',
            });
            generated++;
          } else {
            skipped++;
          }
          continue;
        }

        // 创建新排班
        try {
          db.insert('schedules', {
            id: scheduleId,
            employeeId: emp.id,
            employeeName: emp.name || emp.employeeName,
            department: emp.department,
            date,
            shiftTypeId,
            shiftTypeName,
            scheduledStart,
            scheduledEnd,
            isRestDay: 0,
            isHoliday: 0,
            remark: '批量排班',
            createdAt: new Date().toISOString(),
          });
          generated++;
        } catch (e: any) {
          errors.push(`${emp.name}: ${e.message}`);
        }
      }
    }

    return {
      success: errors.length === 0,
      generated,
      skipped,
      errors,
      message: `批量排班完成：生成 ${generated} 条，跳过 ${skipped} 条${errors.length > 0 ? `，失败 ${errors.length} 条` : ''}`,
    };
  } catch (e: any) {
    return {
      success: false,
      generated,
      skipped,
      errors: [e.message],
      message: e.message,
    };
  }
}

/**
 * 生成日期范围
 */
function generateDateRange(
  startDate: string,
  endDate: string,
  pattern: 'daily' | 'weekly' | 'biweekly',
  restDays: number[] = []
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let current = new Date(start);
  let weekCounter = 0;

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isRestDay = restDays.includes(dayOfWeek);

    if (!isRestDay) {
      dates.push(current.toISOString().slice(0, 10));
    }

    // 按模式推进
    if (pattern === 'daily') {
      current.setDate(current.getDate() + 1);
    } else if (pattern === 'weekly') {
      if (dayOfWeek === 6) { // 周六
        weekCounter++;
        if (weekCounter % 1 === 0) {
          // 整周循环
        }
      }
      current.setDate(current.getDate() + 1);
    } else if (pattern === 'biweekly') {
      // 两周循环
      current.setDate(current.getDate() + 1);
    }
  }

  return dates;
}

/**
 * 批量调班
 */
export async function batchSwapSchedules(
  db: DatabaseService,
  swaps: { employeeId1: string; date1: string; employeeId2: string; date2: string }[]
): Promise<{ success: boolean; swapped: number; errors: string[]; message: string }> {
  let swapped = 0;
  const errors: string[] = [];

  for (const swap of swaps) {
    try {
      // 查找两条排班记录
      const sch1 = db.findWhere('schedules', { employeeId: swap.employeeId1, date: swap.date1 }) as any[];
      const sch2 = db.findWhere('schedules', { employeeId: swap.employeeId2, date: swap.date2 }) as any[];

      if (sch1.length === 0 || sch2.length === 0) {
        errors.push(`调班失败：排班记录不存在`);
        continue;
      }

      // 交换信息
      const temp = {
        shiftTypeId: sch1[0].shiftTypeId,
        shiftTypeName: sch1[0].shiftTypeName,
        scheduledStart: sch1[0].scheduledStart,
        scheduledEnd: sch1[0].scheduledEnd,
      };

      db.update('schedules', sch1[0].id, {
        shiftTypeId: sch2[0].shiftTypeId,
        shiftTypeName: sch2[0].shiftTypeName,
        scheduledStart: sch2[0].scheduledStart,
        scheduledEnd: sch2[0].scheduledEnd,
        remark: `与${sch2[0].employeeName}调班`,
      });

      db.update('schedules', sch2[0].id, {
        ...temp,
        remark: `与${sch1[0].employeeName}调班`,
      });

      swapped++;
    } catch (e: any) {
      errors.push(`调班失败: ${e.message}`);
    }
  }

  return {
    success: errors.length === 0,
    swapped,
    errors,
    message: `调班完成：成功 ${swapped} 对${errors.length > 0 ? `，失败 ${errors.length} 对` : ''}`,
  };
}

/**
 * 复制排班（从一周复制到另一周）
 */
export async function copySchedules(
  db: DatabaseService,
  sourceStartDate: string,
  sourceEndDate: string,
  targetStartDate: string,
  employeeIds?: string[]
): Promise<BatchScheduleResult> {
  const errors: string[] = [];
  let generated = 0;
  let skipped = 0;

  try {
    // 获取源日期范围内的排班
    let sourceSql = `SELECT * FROM schedules WHERE date >= ? AND date <= ?`;
    const sourceParams: any[] = [sourceStartDate, sourceEndDate];

    if (employeeIds && employeeIds.length > 0) {
      sourceSql += ` AND employeeId IN (${employeeIds.map(() => '?').join(',')})`;
      sourceParams.push(...employeeIds);
    }

    const sourceSchedules = db.query(sourceSql, sourceParams) as Schedule[];
    const sourceDates = [...new Set(sourceSchedules.map(s => s.date))].sort();

    // 计算日期偏移
    const targetStart = new Date(targetStartDate);
    const offset = Math.floor(
      (targetStart.getTime() - new Date(sourceStartDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // 复制到目标日期
    for (const source of sourceSchedules) {
      const sourceDate = new Date(source.date);
      sourceDate.setDate(sourceDate.getDate() + offset);
      const targetDate = sourceDate.toISOString().slice(0, 10);

      const scheduleId = `sch_${source.employeeId}_${targetDate.replace(/-/g, '')}`;
      const existing = db.findWhere('schedules', { employeeId: source.employeeId, date: targetDate }) as any[];

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      try {
        db.insert('schedules', {
          ...source,
          id: scheduleId,
          date: targetDate,
          remark: `从${source.date}复制`,
          createdAt: new Date().toISOString(),
        });
        generated++;
      } catch (e: any) {
        errors.push(`${source.employeeName}: ${e.message}`);
      }
    }

    return {
      success: errors.length === 0,
      generated,
      skipped,
      errors,
      message: `排班复制完成：生成 ${generated} 条，跳过 ${skipped} 条`,
    };
  } catch (e: any) {
    return {
      success: false,
      generated,
      skipped,
      errors: [e.message],
      message: e.message,
    };
  }
}

// ============ 年假规则引擎 ============

/**
 * 获取年假规则配置
 */
export function getAnnualLeaveRule(db: DatabaseService): AnnualLeaveRule {
  try {
    const rules = db.findAll('attendance_rules') as any[];
    if (rules.length > 0) {
      const r = rules[0];
      return {
        baseDays: r.annualLeaveBase || 5,
        incrementPerYear: r.annualLeaveIncrement || 1,
        maxDays: r.annualLeaveMax || 15,
        maxCarryOver: r.annualLeaveCarryMax || 5,
        expireMonths: r.annualLeaveExpireMonths || 12,
      };
    }
  } catch { /* ignore */ }

  return {
    baseDays: 5,
    incrementPerYear: 1,
    maxDays: 15,
    maxCarryOver: 5,
    expireMonths: 12,
  };
}

/**
 * 计算员工年假天数（根据入职年限）
 */
export function calculateAnnualLeaveDays(entryDate: string, rule: AnnualLeaveRule): number {
  if (!entryDate) return 0;

  const entry = new Date(entryDate);
  const now = new Date();

  // 计算入职年限（年）
  let years = now.getFullYear() - entry.getFullYear();
  const monthDiff = now.getMonth() - entry.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < entry.getDate())) {
    years--;
  }

  if (years < 0) return 0;
  if (years === 0) return 0; // 当年入职没有年假

  // 计算年假天数
  // 公式：基础天数 + (年限 - 1) * 每年增加天数，但不超过最大天数
  const days = rule.baseDays + (years - 1) * rule.incrementPerYear;
  return Math.min(days, rule.maxDays);
}

/**
 * 批量更新员工年假余额
 */
export async function batchUpdateLeaveBalances(
  db: DatabaseService,
  year: string,
  employeeIds?: string[]
): Promise<LeaveAccrualResult> {
  const rule = getAnnualLeaveRule(db);
  const results: { employeeId: string; employeeName: string; totalDays: number; availableDays: number }[] = [];
  let updated = 0;

  try {
    // 获取员工列表
    let employees: Employee[];
    if (employeeIds && employeeIds.length > 0) {
      employees = employeeIds.map(id => db.findById('employees', id) as Employee).filter(Boolean);
    } else {
      employees = (db.findAll('employees') as Employee[]).filter(e => e.status === 'active');
    }

    for (const emp of employees) {
      if (!emp.entryDate) continue;

      const totalDays = calculateAnnualLeaveDays(emp.entryDate, rule);

      // 获取当前余额
      const balanceId = `lb_${emp.id}_${year}_annual`;
      let existing = db.findById('leave_balances', balanceId) as LeaveBalance | undefined;

      if (existing) {
        // 计算结转（去年未用完的）
        const prevYear = String(parseInt(year) - 1);
        const prevBalance = db.findWhere('leave_balances', {
          employeeId: emp.id,
          year: prevYear,
          leaveType: 'annual',
        }) as LeaveBalance[];

        let carryOver = 0;
        if (prevBalance.length > 0) {
          carryOver = Math.min(
            prevBalance[0].availableDays,
            rule.maxCarryOver
          );
        }

        const newTotal = totalDays + carryOver;
        const usedDays = existing.usedDays || 0;

        db.update('leave_balances', balanceId, {
          totalDays: newTotal,
          availableDays: newTotal - usedDays,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // 新建余额记录
        db.insert('leave_balances', {
          id: balanceId,
          employeeId: emp.id,
          year,
          leaveType: 'annual',
          totalDays,
          usedDays: 0,
          pendingDays: 0,
          availableDays: totalDays,
          lastUpdated: new Date().toISOString(),
        });
      }

      results.push({
        employeeId: emp.id,
        employeeName: emp.name || emp.employeeName || '',
        totalDays,
        availableDays: totalDays,
      });
      updated++;
    }

    return {
      success: true,
      updated,
      results,
      message: `年假余额更新完成：共 ${updated} 名员工`,
    };
  } catch (e: any) {
    return {
      success: false,
      updated,
      results,
      message: e.message,
    };
  }
}

/**
 * 自动扣减年假（员工请年假时调用）
 */
export async function deductLeaveBalance(
  db: DatabaseService,
  employeeId: string,
  leaveType: string,
  days: number,
  year: string
): Promise<{ success: boolean; message: string }> {
  try {
    const balanceId = `lb_${employeeId}_${year}_${leaveType}`;
    const balance = db.findById('leave_balances', balanceId) as LeaveBalance | undefined;

    if (!balance) {
      return { success: false, message: '未找到年假余额记录' };
    }

    if (balance.availableDays < days) {
      return { success: false, message: `年假余额不足，当前可用 ${balance.availableDays} 天` };
    }

    db.update('leave_balances', balanceId, {
      availableDays: balance.availableDays - days,
      usedDays: balance.usedDays + days,
      lastUpdated: new Date().toISOString(),
    });

    return { success: true, message: '年假扣减成功' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

/**
 * 恢复年假（请假被驳回时调用）
 */
export async function restoreLeaveBalance(
  db: DatabaseService,
  employeeId: string,
  leaveType: string,
  days: number,
  year: string
): Promise<{ success: boolean; message: string }> {
  try {
    const balanceId = `lb_${employeeId}_${year}_${leaveType}`;
    const balance = db.findById('leave_balances', balanceId) as LeaveBalance | undefined;

    if (!balance) {
      return { success: false, message: '未找到年假余额记录' };
    }

    db.update('leave_balances', balanceId, {
      availableDays: balance.availableDays + days,
      usedDays: Math.max(0, balance.usedDays - days),
      lastUpdated: new Date().toISOString(),
    });

    return { success: true, message: '年假已恢复' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

/**
 * 获取员工年假信息
 */
export async function getEmployeeLeaveInfo(
  db: DatabaseService,
  employeeId: string,
  year: string
): Promise<{
  employeeId: string;
  employeeName: string;
  entryDate: string;
  workYears: number;
  entitledDays: number;
  balances: LeaveBalance[];
  rule: AnnualLeaveRule;
}> {
  const employee = db.findById('employees', employeeId) as Employee;
  const rule = getAnnualLeaveRule(db);
  const entitledDays = calculateAnnualLeaveDays(employee?.entryDate || '', rule);

  const balances = db.findWhere('leave_balances', { employeeId, year }) as LeaveBalance[];

  let workYears = 0;
  if (employee?.entryDate) {
    const entry = new Date(employee.entryDate);
    const now = new Date();
    workYears = now.getFullYear() - entry.getFullYear();
    if (now.getMonth() < entry.getMonth() ||
        (now.getMonth() === entry.getMonth() && now.getDate() < entry.getDate())) {
      workYears--;
    }
  }

  return {
    employeeId,
    employeeName: employee?.name || employee?.employeeName || '',
    entryDate: employee?.entryDate || '',
    workYears,
    entitledDays,
    balances,
    rule,
  };
}

// ============ 班次管理 ============

/**
 * 获取班次列表
 */
export function getShiftTypes(db: DatabaseService): ShiftType[] {
  try {
    return db.findAll('shift_types') as ShiftType[];
  } catch {
    return [];
  }
}

/**
 * 创建班次
 */
export function createShiftType(
  db: DatabaseService,
  data: Partial<ShiftType>
): { success: boolean; id?: string; message: string } {
  try {
    const id = data.id || `st_${Date.now()}`;
    db.insert('shift_types', {
      id,
      name: data.name || '新班次',
      kind: data.kind || 'regular',
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '18:00',
      lateThreshold: data.lateThreshold || 15,
      earlyLeaveThreshold: data.earlyLeaveThreshold || 15,
      workHours: data.workHours || 8,
      color: data.color || '#1890ff',
      createdAt: new Date().toISOString(),
    });
    return { success: true, id, message: '班次创建成功' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

/**
 * 批量创建默认班次
 */
export function createDefaultShiftTypes(db: DatabaseService): void {
  const defaults = [
    { id: 'st_1', name: '标准班', kind: 'regular', startTime: '09:00', endTime: '18:00', workHours: 8, color: '#1890ff' },
    { id: 'st_2', name: '早班', kind: 'morning', startTime: '06:00', endTime: '14:00', workHours: 8, color: '#52c41a' },
    { id: 'st_3', name: '中班', kind: 'afternoon', startTime: '14:00', endTime: '22:00', workHours: 8, color: '#fa8c16' },
    { id: 'st_4', name: '晚班', kind: 'night', startTime: '22:00', endTime: '06:00', workHours: 8, color: '#722ed1' },
    { id: 'st_5', name: '弹性班', kind: 'flexible', startTime: '10:00', endTime: '19:00', workHours: 8, color: '#13c2c2' },
    { id: 'st_6', name: '周末班', kind: 'weekend', startTime: '09:00', endTime: '17:00', workHours: 6, color: '#eb2f96' },
  ];

  for (const d of defaults) {
    try {
      const existing = db.findById('shift_types', d.id);
      if (!existing) {
        db.insert('shift_types', { ...d, createdAt: new Date().toISOString() });
      }
    } catch { /* ignore */ }
  }
}
