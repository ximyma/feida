/**
 * 考勤日报自动生成引擎 v1.0
 * 功能：
 * 1. 根据打卡记录、请假记录、排班信息自动汇总每日考勤
 * 2. 支持按部门或全员生成日报
 * 3. 识别异常情况（迟到、早退、缺勤、请假、加班）
 * 4. 记录详细考勤数据供后续分析
 */

import { DatabaseService } from './modules/database/database.service';

export interface Employee {
  id: string;
  employeeName?: string;
  name?: string;
  department?: string;
  status?: string;
  entryDate?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workHours?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  status?: string;
  isRestDay?: number;
  isHoliday?: number;
  remark?: string;
}

export interface Schedule {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  shiftTypeName?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  isRestDay?: number;
  isHoliday?: number;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  status?: string;
}

export interface OvertimeRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  date?: string;
  hours?: number;
  overtimeType?: string;
  status?: string;
}

export interface DailyReportResult {
  success: boolean;
  date: string;
  department?: string;
  totalEmployees: number;
  normalCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  leaveCount: number;
  overtimeCount: number;
  restDayCount: number;
  holidayCount: number;
  details: EmployeeDailyDetail[];
  message: string;
}

export interface EmployeeDailyDetail {
  employeeId: string;
  employeeName: string;
  department: string;
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave' | 'overtime' | 'rest' | 'holiday' | 'unknown';
  statusLabel: string;
  clockIn?: string;
  clockOut?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  workHours?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  leaveType?: string;
  overtimeHours?: number;
  remark?: string;
}

/**
 * 生成指定日期的考勤日报
 */
export async function generateDailyAttendanceReport(
  db: DatabaseService,
  date: string,
  department?: string
): Promise<DailyReportResult> {
  try {
    // 1. 获取当日有效员工列表
    const employees = getActiveEmployees(db, department);
    if (employees.length === 0) {
      return {
        success: false,
        date,
        totalEmployees: 0,
        normalCount: 0,
        lateCount: 0,
        earlyLeaveCount: 0,
        absentCount: 0,
        leaveCount: 0,
        overtimeCount: 0,
        restDayCount: 0,
        holidayCount: 0,
        details: [],
        message: '没有找到有效员工',
      };
    }

    // 2. 获取当日打卡记录
    const attendanceRecords = getAttendanceRecords(db, date);

    // 3. 获取当日排班信息
    const schedules = getSchedules(db, date);

    // 4. 获取当日请假记录
    const leaveRecords = getLeaveRecords(db, date);

    // 5. 获取当日加班记录
    const overtimeRecords = getOvertimeRecords(db, date);

    // 6. 考勤规则
    const rules = getAttendanceRules(db);

    // 7. 逐个员工计算考勤状态
    const details: EmployeeDailyDetail[] = [];
    const stats = {
      normal: 0,
      late: 0,
      early: 0,
      absent: 0,
      leave: 0,
      overtime: 0,
      rest: 0,
      holiday: 0,
    };

    for (const emp of employees) {
      const detail = calculateEmployeeAttendance(
        emp,
        date,
        attendanceRecords,
        schedules,
        leaveRecords,
        overtimeRecords,
        rules
      );
      details.push(detail);

      // 更新统计
      if (detail.status === 'normal') stats.normal++;
      else if (detail.status === 'late') stats.late++;
      else if (detail.status === 'early') stats.early++;
      else if (detail.status === 'absent') stats.absent++;
      else if (detail.status === 'leave') stats.leave++;
      else if (detail.status === 'overtime') stats.overtime++;
      else if (detail.status === 'rest') stats.rest++;
      else if (detail.status === 'holiday') stats.holiday++;
    }

    // 8. 保存日报到数据库
    const reportId = department
      ? `dar_${department}_${date.replace(/-/g, '')}`
      : `dar_all_${date.replace(/-/g, '')}`;

    const reportData = {
      id: reportId,
      date,
      department: department || '全公司',
      totalEmployees: employees.length,
      normalCount: stats.normal,
      lateCount: stats.late,
      earlyLeaveCount: stats.early,
      absentCount: stats.absent,
      leaveCount: stats.leave,
      overtimeCount: stats.overtime,
      restDayCount: stats.rest,
      holidayCount: stats.holiday,
      data: JSON.stringify({
        details,
        generatedAt: new Date().toISOString(),
      }),
      updatedAt: new Date().toISOString(),
    };

    // 检查是否已存在，存在则更新
    const existing = db.findById('daily_attendance_reports', reportId);
    if (existing) {
      db.update('daily_attendance_reports', reportId, reportData);
    } else {
      db.insert('daily_attendance_reports', reportData);
    }

    return {
      success: true,
      date,
      department: department || undefined,
      totalEmployees: employees.length,
      normalCount: stats.normal,
      lateCount: stats.late,
      earlyLeaveCount: stats.early,
      absentCount: stats.absent,
      leaveCount: stats.leave,
      overtimeCount: stats.overtime,
      restDayCount: stats.rest,
      holidayCount: stats.holiday,
      details,
      message: `成功生成 ${date} 考勤日报，共 ${employees.length} 名员工`,
    };
  } catch (error: any) {
    console.error('[AttendanceReport] 生成日报失败:', error);
    return {
      success: false,
      date,
      totalEmployees: 0,
      normalCount: 0,
      lateCount: 0,
      earlyLeaveCount: 0,
      absentCount: 0,
      leaveCount: 0,
      overtimeCount: 0,
      restDayCount: 0,
      holidayCount: 0,
      details: [],
      message: `生成日报失败: ${error.message}`,
    };
  }
}

/**
 * 获取有效员工列表
 */
function getActiveEmployees(db: DatabaseService, department?: string): Employee[] {
  let sql = `SELECT id, employeeName, name, department, status, entryDate FROM employees WHERE status = 'active'`;
  const params: any[] = [];

  if (department) {
    sql += ` AND department = ?`;
    params.push(department);
  }

  try {
    const employees = db.db.prepare(sql).all(...params) as Employee[];
    return employees.map(e => ({
      ...e,
      employeeName: e.employeeName || e.name || '',
    }));
  } catch {
    // 如果表不存在或出错，返回空数组
    return [];
  }
}

/**
 * 获取指定日期的打卡记录
 */
function getAttendanceRecords(db: DatabaseService, date: string): Map<string, AttendanceRecord> {
  const records = new Map<string, AttendanceRecord>();
  try {
    const rows = db.findWhere('attendance_records', { date }) as AttendanceRecord[];
    for (const r of rows) {
      records.set(r.employeeId, r);
    }
  } catch {
    // 表不存在
  }
  return records;
}

/**
 * 获取指定日期的排班信息
 */
function getSchedules(db: DatabaseService, date: string): Map<string, Schedule> {
  const schedules = new Map<string, Schedule>();
  try {
    const rows = db.findWhere('schedules', { date }) as Schedule[];
    for (const s of rows) {
      schedules.set(s.employeeId, s);
    }
  } catch {
    // 表不存在
  }
  return schedules;
}

/**
 * 获取指定日期的请假记录
 */
function getLeaveRecords(db: DatabaseService, date: string): LeaveRecord[] {
  try {
    // 查询日期范围内的已批准请假
    const rows = db.db.prepare(`
      SELECT * FROM leave_records
      WHERE status = 'approved'
      AND startDate <= ?
      AND endDate >= ?
    `).all(date, date) as LeaveRecord[];
    return rows;
  } catch {
    return [];
  }
}

/**
 * 获取指定日期的加班记录
 */
function getOvertimeRecords(db: DatabaseService, date: string): OvertimeRecord[] {
  try {
    const rows = db.db.prepare(`
      SELECT * FROM overtime_records
      WHERE status = 'approved'
      AND date = ?
    `).all(date) as OvertimeRecord[];
    return rows;
  } catch {
    return [];
  }
}

/**
 * 获取考勤规则
 */
function getAttendanceRules(db: DatabaseService): { lateThreshold: number; defaultWorkHours: number } {
  try {
    const rule = db.findById('attendance_rules', 'default') ||
                 (db.findAll('attendance_rules') as any[])[0];
    return {
      lateThreshold: rule?.lateThreshold || rule?.latePenaltyRule?.lateThreshold || 15,
      defaultWorkHours: 8,
    };
  } catch {
    return { lateThreshold: 15, defaultWorkHours: 8 };
  }
}

/**
 * 计算单个员工的考勤明细
 */
function calculateEmployeeAttendance(
  employee: Employee,
  date: string,
  attendanceRecords: Map<string, AttendanceRecord>,
  schedules: Map<string, Schedule>,
  leaveRecords: LeaveRecord[],
  overtimeRecords: OvertimeRecord[],
  rules: { lateThreshold: number; defaultWorkHours: number }
): EmployeeDailyDetail {
  const empId = employee.id;
  const empName = employee.employeeName || employee.name || '未知';
  const dept = employee.department || '未知部门';

  // 默认排班
  const defaultShift = {
    scheduledStart: '09:00',
    scheduledEnd: '18:00',
  };

  // 1. 检查是否在请假中
  const leave = leaveRecords.find(l => l.employeeId === empId);
  if (leave) {
    return {
      employeeId: empId,
      employeeName: empName,
      department: dept,
      status: 'leave',
      statusLabel: getLeaveTypeLabel(leave.leaveType || '事假'),
      leaveType: leave.leaveType,
      scheduledStart: defaultShift.scheduledStart,
      scheduledEnd: defaultShift.scheduledEnd,
      remark: `请假期间：${leave.startDate} ~ ${leave.endDate}`,
    };
  }

  // 2. 检查排班（休息日/节假日）
  const schedule = schedules.get(empId);
  if (schedule) {
    if (schedule.isRestDay) {
      // 检查是否有加班
      const ot = overtimeRecords.find(o => o.employeeId === empId);
      if (ot) {
        return {
          employeeId: empId,
          employeeName: empName,
          department: dept,
          status: 'overtime',
          statusLabel: '周末加班',
          scheduledStart: schedule.scheduledStart || defaultShift.scheduledStart,
          scheduledEnd: schedule.scheduledEnd || defaultShift.scheduledEnd,
          overtimeHours: ot.hours,
          remark: '休息日加班',
        };
      }
      return {
        employeeId: empId,
        employeeName: empName,
        department: dept,
        status: 'rest',
        statusLabel: '休息日',
        scheduledStart: schedule.scheduledStart || defaultShift.scheduledStart,
        scheduledEnd: schedule.scheduledEnd || defaultShift.scheduledEnd,
        remark: '今日为休息日',
      };
    }
    if (schedule.isHoliday) {
      return {
        employeeId: empId,
        employeeName: empName,
        department: dept,
        status: 'holiday',
        statusLabel: '节假日',
        scheduledStart: schedule.scheduledStart || defaultShift.scheduledStart,
        scheduledEnd: schedule.scheduledEnd || defaultShift.scheduledEnd,
        remark: '今日为法定节假日',
      };
    }
  }

  // 3. 获取打卡记录
  const record = attendanceRecords.get(empId);

  if (!record) {
    // 无打卡记录，算缺勤
    return {
      employeeId: empId,
      employeeName: empName,
      department: dept,
      status: 'absent',
      statusLabel: '缺勤',
      scheduledStart: schedule?.scheduledStart || defaultShift.scheduledStart,
      scheduledEnd: schedule?.scheduledEnd || defaultShift.scheduledEnd,
      remark: '无打卡记录',
    };
  }

  // 4. 分析打卡状态
  const clockIn = record.clockIn;
  const clockOut = record.clockOut;
  const scheduledStart = schedule?.scheduledStart || record.scheduledStart || defaultShift.scheduledStart;
  const scheduledEnd = schedule?.scheduledEnd || record.scheduledEnd || defaultShift.scheduledEnd;

  // 计算迟到分钟数
  let lateMinutes = 0;
  if (clockIn) {
    const clockInMinutes = timeToMinutes(clockIn);
    const scheduledMinutes = timeToMinutes(scheduledStart);
    const graceMinutes = 5; // 宽限期5分钟
    if (clockInMinutes > scheduledMinutes + graceMinutes) {
      lateMinutes = clockInMinutes - scheduledMinutes;
    }
  }

  // 计算早退分钟数
  let earlyLeaveMinutes = 0;
  if (clockOut) {
    const clockOutMinutes = timeToMinutes(clockOut);
    const scheduledMinutes = timeToMinutes(scheduledEnd);
    const graceMinutes = 5;
    if (clockOutMinutes < scheduledMinutes - graceMinutes) {
      earlyLeaveMinutes = scheduledMinutes - clockOutMinutes;
    }
  }

  // 计算工时
  let workHours = record.workHours || 0;
  if (clockIn && clockOut) {
    const inMin = timeToMinutes(clockIn);
    const outMin = timeToMinutes(clockOut);
    if (outMin > inMin) {
      workHours = Math.round((outMin - inMin) / 60 * 10) / 10;
    }
  }

  // 判断状态
  let status: EmployeeDailyDetail['status'] = 'normal';
  let statusLabel = '正常';

  if (lateMinutes >= rules.lateThreshold) {
    status = 'late';
    statusLabel = `迟到 ${lateMinutes} 分钟`;
  } else if (earlyLeaveMinutes >= rules.lateThreshold) {
    status = 'early';
    statusLabel = `早退 ${earlyLeaveMinutes} 分钟`;
  } else if (lateMinutes > 0) {
    statusLabel = '正常(稍迟)';
  }

  // 检查是否有加班
  const ot = overtimeRecords.find(o => o.employeeId === empId);
  if (ot && status === 'normal') {
    status = 'overtime';
    statusLabel = '正常(加班)';
  }

  return {
    employeeId: empId,
    employeeName: empName,
    department: dept,
    status,
    statusLabel,
    clockIn: clockIn || undefined,
    clockOut: clockOut || undefined,
    scheduledStart,
    scheduledEnd,
    workHours,
    lateMinutes: lateMinutes > 0 ? lateMinutes : undefined,
    earlyLeaveMinutes: earlyLeaveMinutes > 0 ? earlyLeaveMinutes : undefined,
    overtimeHours: ot?.hours,
    remark: record.remark || undefined,
  };
}

/**
 * 将时间字符串转换为分钟数
 */
function timeToMinutes(time: string): number {
  const parts = time.split(':');
  if (parts.length >= 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 0;
}

/**
 * 获取请假类型标签
 */
function getLeaveTypeLabel(type: string): string {
  const map: Record<string, string> = {
    annual: '年假',
    sick: '病假',
    personal: '事假',
    marriage: '婚假',
    maternity: '产假',
    paternity: '陪产假',
    funeral: '丧假',
    official: '公假',
    half: '半天假',
  };
  return map[type] || type;
}

/**
 * 批量生成历史日报（用于初始化）
 */
export async function generateHistoricalReports(
  db: DatabaseService,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; generated: number; failed: number; message: string }> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let generated = 0;
  let failed = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const result = await generateDailyAttendanceReport(db, dateStr);
    if (result.success) {
      generated++;
    } else {
      failed++;
    }
  }

  return {
    success: failed === 0,
    generated,
    failed,
    message: `历史日报生成完成：成功 ${generated} 天，失败 ${failed} 天`,
  };
}
