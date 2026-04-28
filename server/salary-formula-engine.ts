/**
 * 薪资公式引擎 v1.0
 * 功能：
 * 1. 公式解析与执行
 * 2. 内置函数支持（IF, ROUND, MAX, MIN, VLOOKUP等）
 * 3. 变量引用（员工属性、考勤数据、社保等）
 * 4. 个税计算（个税专项附加扣除）
 * 5. 批量薪资计算
 */

import { DatabaseService } from './modules/database/database.service';

export interface Employee {
  id: string;
  employeeId?: string;
  name?: string;
  employeeName?: string;
  department?: string;
  position?: string;
  rank?: string;
  baseSalary?: number;
  entryDate?: string;
  [key: string]: any;
}

export interface SalaryContext {
  employee: Employee;
  month: string;
  baseSalary: number;
  positionSalary: number;
  performance: number;
  overtimeHours: number;
  lateCount: number;
  absentCount: number;
  leaveDays: number;
  [key: string]: any;
}

export interface FormulaResult {
  success: boolean;
  value: number;
  error?: string;
}

export interface SalaryCalculationResult {
  success: boolean;
  employeeId: string;
  employeeName: string;
  month: string;
  items: Record<string, number>;
  grossSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  tax: number;
  netSalary: number;
  insurance: {
    social: number;
    medical: number;
    housingFund: number;
    pension: number;
  };
  companyContributions: {
    pension: number;
    medical: number;
    unemployment: number;
    injury: number;
    maternity: number;
    housingFund: number;
  };
  errors: string[];
  message: string;
}

// ============ 公式解析器 ============

/**
 * 解析并执行公式
 */
export function evaluateFormula(
  formula: string,
  context: SalaryContext
): FormulaResult {
  try {
    // 替换变量
    let expr = replaceVariables(formula, context);
    
    // 预处理函数（替换中文括号等）
    expr = preprocessExpression(expr);
    
    // 执行计算
    const value = evaluateExpression(expr);
    
    if (isNaN(value) || !isFinite(value)) {
      return { success: false, value: 0, error: '计算结果无效' };
    }
    
    return { success: true, value: Math.round(value * 100) / 100 };
  } catch (e: any) {
    return { success: false, value: 0, error: e.message };
  }
}

/**
 * 替换变量为实际值
 */
function replaceVariables(expr: string, context: SalaryContext): string {
  let result = expr;
  
  // 替换常量
  const constants: Record<string, number> = {
    '基本工资': context.baseSalary,
    '岗位工资': context.positionSalary,
    '绩效工资': context.performance,
    '加班小时数': context.overtimeHours,
    '迟到次数': context.lateCount,
    '缺勤次数': context.absentCount,
    '请假天数': context.leaveDays,
  };
  
  for (const [name, value] of Object.entries(constants)) {
    const regex = new RegExp(`"${name}"|'${name}'|${name}`, 'g');
    result = result.replace(regex, String(value));
  }
  
  // 替换员工属性
  const emp = context.employee;
  const empFields: Record<string, string | number> = {
    'baseSalary': emp.baseSalary || context.baseSalary,
    'department': emp.department || '',
    'position': emp.position || '',
    'entryDate': emp.entryDate || '',
  };
  
  for (const [field, value] of Object.entries(empFields)) {
    const regex = new RegExp(`employee\\.${field}|emp\\.${field}|\\$${field}`, 'g');
    result = result.replace(regex, typeof value === 'string' ? `"${value}"` : String(value));
  }
  
  // 替换 context 顶层属性
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'number') {
      const regex = new RegExp(`\\$\\[?${key}\\]?|context\\.${key}`, 'gi');
      result = result.replace(regex, String(value));
    }
  }
  
  return result;
}

/**
 * 预处理表达式
 */
function preprocessExpression(expr: string): string {
  let result = expr;
  
  // 替换中文标点
  result = result.replace(/（/g, '(').replace(/）/g, ')');
  result = result.replace(/，/g, ',').replace(/；/g, ';');
  result = result.replace(/：/g, ':').replace(/＝/g, '=');
  result = result.replace(/＋/g, '+').replace(/－/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
  
  // 处理 IF 函数（支持嵌套）
  // 格式：IF(条件, 真值, 假值) 或 IF(条件, 真值)
  result = processIfFunction(result);
  
  // 处理 ROUND 函数
  result = processRoundFunction(result);
  
  // 处理 MAX/MIN 函数
  result = processMaxMinFunction(result, 'MAX');
  result = processMaxMinFunction(result, 'MIN');
  
  // 处理 ABS 函数
  result = processAbsFunction(result);
  
  // 处理 IFERROR 函数
  result = processIfErrorFunction(result);
  
  return result;
}

/**
 * 处理 IF 函数
 */
function processIfFunction(expr: string): string {
  const ifRegex = /IF\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*(?:,\s*([^)]+))?\s*\)/gi;
  
  return expr.replace(ifRegex, (_match, condition, trueVal, falseVal) => {
    const cond = condition.trim();
    const tv = trueVal.trim();
    const fv = (falseVal || '0').trim();
    return `((${cond}) ? (${tv}) : (${fv}))`;
  });
}

/**
 * 处理 ROUND 函数
 */
function processRoundFunction(expr: string): string {
  const roundRegex = /ROUND\s*\(\s*([^,]+)\s*,\s*(\d+)\s*\)/gi;
  
  return expr.replace(roundRegex, (_match, num, digits) => {
    const n = num.trim();
    const d = parseInt(digits);
    const factor = Math.pow(10, d);
    return `Math.round(${n} * ${factor}) / ${factor}`;
  });
}

/**
 * 处理 MAX/MIN 函数
 */
function processMaxMinFunction(expr: string, func: 'MAX' | 'MIN'): string {
  const regex = new RegExp(`${func}\\s*\\(\\s*([^)]+)\\s*\\)`, 'gi');
  
  return expr.replace(regex, (_match, args) => {
    const argList = args.split(',').map((a: string) => a.trim());
    const mathFunc = func === 'MAX' ? 'Math.max' : 'Math.min';
    
    // 处理多个参数
    const numbers = argList.filter(a => !a.includes('[') && !a.includes('('));
    const others = argList.filter(a => a.includes('[') || a.includes('('));
    
    if (numbers.length > 0) {
      return `${mathFunc}(${argList.join(',')})`;
    }
    return `${mathFunc}(${argList.join(',')})`;
  });
}

/**
 * 处理 ABS 函数
 */
function processAbsFunction(expr: string): string {
  const absRegex = /ABS\s*\(\s*([^)]+)\s*\)/gi;
  return expr.replace(absRegex, 'Math.abs($1)');
}

/**
 * 处理 IFERROR 函数
 */
function processIfErrorFunction(expr: string): string {
  const iferrorRegex = /IFERROR\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi;
  return expr.replace(iferrorRegex, '((($1) instanceof Error || isNaN($1)) ? ($2) : ($1))');
}

/**
 * 简单表达式求值（支持基本运算和比较）
 */
function evaluateExpression(expr: string): number {
  // 清理空白
  let e = expr.replace(/\s+/g, '');
  
  // 处理数组访问 [index]
  e = e.replace(/\[(\d+)\]/g, '[$1]');
  
  // 安全替换 Math 函数（已预处理的）
  e = e.replace(/Math\.max/g, '__max__');
  e = e.replace(/Math\.min/g, '__min__');
  e = e.replace(/Math\.abs/g, '__abs__');
  e = e.replace(/Math\.round/g, '__round__');
  
  // 替换运算符
  e = e.replace(/<>|!=/g, '!=');
  e = e.replace(/=/g, '===');
  e = e.replace(/AND|&&/gi, '&&');
  e = e.replace(/OR|\|\|/gi, '||');
  e = e.replace(/NOT|!/gi, '!');
  
  // 还原 Math 函数
  e = e.replace(/__max__/g, 'Math.max');
  e = e.replace(/__min__/g, 'Math.min');
  e = e.replace(/__abs__/g, 'Math.abs');
  e = e.replace(/__round__/g, 'Math.round');
  
  // 评估
  try {
    // 安全的 eval（只允许数字和运算符）
    const cleanExpr = sanitizeExpression(e);
    const result = new Function(`"use strict"; return (${cleanExpr})`)();
    return typeof result === 'number' ? result : 0;
  } catch (ex) {
    // 如果失败，尝试用简化逻辑
    return evaluateSimpleExpression(e);
  }
}

/**
 * 清理表达式，只保留安全字符
 */
function sanitizeExpression(expr: string): string {
  // 只允许数字、运算符、括号、点、空格
  return expr.replace(/[^0-9+\-*/.()[\] ,<>!=&|]/g, '');
}

/**
 * 简化表达式求值（用于无法解析的情况）
 */
function evaluateSimpleExpression(expr: string): number {
  try {
    // 移除所有空格
    let e = expr.replace(/\s+/g, '');
    
    // 处理括号
    while (e.includes('(')) {
      const match = e.match(/\(([^()]+)\)/);
      if (!match) break;
      const inner = match[1];
      const result = evaluateSimpleExpression(inner);
      e = e.replace(match[0], String(result));
    }
    
    // 处理加减
    const addMatch = e.match(/^(-?\d+\.?\d*)([+-]\d+\.?\d*)+$/);
    if (addMatch) {
      let total = 0;
      const nums = e.match(/[+-]?\d+\.?\d*/g);
      if (nums) {
        for (const n of nums) {
          total += parseFloat(n);
        }
        return total;
      }
    }
    
    // 尝试直接求值
    return eval(e);
  } catch {
    return 0;
  }
}

// ============ 个税计算 ============

/**
 * 计算个人所得税
 * 使用超额累进税率
 */
export function calculateTax(
  taxableIncome: number,
  socialSecurity: number = 0,
  housingFund: number = 0
): number {
  // 专项附加扣除（默认值，可配置）
  const specialDeductions = {
    children: 1000,        // 子女教育
    continuing: 400,       // 继续教育
    housing: 1000,         // 住房租金/贷款
    elderly: 2000,         // 赡养老人
  };
  
  const totalSpecial = Object.values(specialDeductions).reduce((a, b) => a + b, 0);
  
  // 应纳税所得额 = 税前工资 - 5000 - 社保 - 公积金 - 专项附加扣除
  const taxable = Math.max(0, taxableIncome - 5000 - socialSecurity - housingFund - totalSpecial);
  
  if (taxable <= 0) return 0;
  
  // 超额累进税率表
  const taxBrackets = [
    { max: 3000, rate: 0.03, deduction: 0 },
    { max: 12000, rate: 0.10, deduction: 210 },
    { max: 25000, rate: 0.20, deduction: 1410 },
    { max: 35000, rate: 0.25, deduction: 2660 },
    { max: 55000, rate: 0.30, deduction: 4410 },
    { max: 80000, rate: 0.35, deduction: 7160 },
    { max: Infinity, rate: 0.45, deduction: 15160 },
  ];
  
  for (const bracket of taxBrackets) {
    if (taxable <= bracket.max) {
      return Math.round(taxable * bracket.rate - bracket.deduction);
    }
  }
  
  return 0;
}

// ============ 社保计算 ============

export interface InsuranceParams {
  baseSalary: number;
  city: string;
  scheme?: any;
}

export interface InsuranceResult {
  personal: {
    pension: number;
    medical: number;
    unemployment: number;
    housingFund: number;
    total: number;
  };
  company: {
    pension: number;
    medical: number;
    unemployment: number;
    injury: number;
    maternity: number;
    housingFund: number;
    total: number;
  };
}

/**
 * 计算社保（个人+公司部分）
 */
export function calculateInsurance(
  params: InsuranceParams,
  scheme?: any
): InsuranceResult {
  const { baseSalary, city } = params;
  
  // 默认比例（深圳标准）
  const defaultRates = {
    personal: {
      pension: 0.08,
      medical: 0.02,
      unemployment: 0.005,
      housingFund: 0.05,
    },
    company: {
      pension: 0.16,
      medical: 0.06,
      unemployment: 0.008,
      injury: 0.004,
      maternity: 0.008,
      housingFund: 0.05,
    },
  };
  
  const rates = scheme || defaultRates;
  
  const calc = (amount: number, rate: number) => Math.round(amount * rate * 100) / 100;
  
  // 个人部分
  const personal = {
    pension: calc(baseSalary, rates.personal?.pension ?? 0.08),
    medical: calc(baseSalary, rates.personal?.medical ?? 0.02),
    unemployment: calc(baseSalary, rates.personal?.unemployment ?? 0.005),
    housingFund: calc(baseSalary, rates.personal?.housingFund ?? 0.05),
    total: 0,
  };
  personal.total = personal.pension + personal.medical + personal.unemployment + personal.housingFund;
  
  // 公司部分
  const company = {
    pension: calc(baseSalary, rates.company?.pension ?? 0.16),
    medical: calc(baseSalary, rates.company?.medical ?? 0.06),
    unemployment: calc(baseSalary, rates.company?.unemployment ?? 0.008),
    injury: calc(baseSalary, rates.company?.injury ?? 0.004),
    maternity: calc(baseSalary, rates.company?.maternity ?? 0.008),
    housingFund: calc(baseSalary, rates.company?.housingFund ?? 0.05),
    total: 0,
  };
  company.total = company.pension + company.medical + company.unemployment + 
                   company.injury + company.maternity + company.housingFund;
  
  return { personal, company };
}

// ============ 薪资计算主函数 ============

/**
 * 计算单个员工薪资
 */
export async function calculateSalary(
  db: DatabaseService,
  employeeId: string,
  month: string
): Promise<SalaryCalculationResult> {
  const errors: string[] = [];
  
  try {
    // 1. 获取员工信息
    const employee = db.findById('employees', employeeId) as any;
    if (!employee) {
      return {
        success: false, employeeId, employeeName: '', month,
        items: {}, grossSalary: 0, totalEarnings: 0, totalDeductions: 0,
        tax: 0, netSalary: 0, insurance: { social: 0, medical: 0, housingFund: 0, pension: 0 },
        companyContributions: { pension: 0, medical: 0, unemployment: 0, injury: 0, maternity: 0, housingFund: 0 },
        errors: ['员工不存在'],
        message: '员工不存在',
      };
    }
    
    // 2. 获取薪资项配置
    const salaryItems = db.findAll('salary_items') as any[];
    const activeItems = salaryItems.filter((i: any) => i.isActive);
    
    // 3. 获取考勤数据
    const context = await buildSalaryContext(db, employee, month);
    
    // 4. 计算各项薪资
    const items: Record<string, number> = {};
    let totalEarnings = 0;
    let totalDeductions = 0;
    
    for (const item of activeItems) {
      try {
        let value: number;
        
        if (item.formula) {
          // 有公式，使用公式计算
          const result = evaluateFormula(item.formula, context);
          if (result.success) {
            value = result.value;
          } else {
            value = item.defaultValue || 0;
            errors.push(`${item.name}: ${result.error}`);
          }
        } else {
          // 无公式，使用默认值
          value = item.defaultValue || 0;
        }
        
        items[item.code] = Math.round(value * 100) / 100;
        
        // 累计到对应类别
        if (item.type === 'earnings' || item.type === 'allowance') {
          totalEarnings += value;
        } else if (item.type === 'deductions' || item.type === 'insurance' || item.type === 'tax') {
          totalDeductions += value;
        }
      } catch (e: any) {
        items[item.code] = item.defaultValue || 0;
        errors.push(`${item.name}: 计算错误 - ${e.message}`);
      }
    }
    
    // 5. 计算社保（如果有配置）
    const insurance = await calculateEmployeeInsurance(db, employee, items);
    
    // 6. 计算个税
    const taxableIncome = totalEarnings;
    const socialSecurity = insurance.personal.total;
    const housingFund = items['housing_fund'] || 0;
    const tax = calculateTax(taxableIncome, socialSecurity, housingFund);
    
    // 7. 计算实发工资
    const grossSalary = totalEarnings;
    const netSalary = grossSalary - totalDeductions - tax;
    
    return {
      success: true,
      employeeId,
      employeeName: employee.name || employee.employeeName || '',
      month,
      items,
      grossSalary: Math.round(grossSalary * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      netSalary: Math.round(netSalary * 100) / 100,
      insurance: {
        social: insurance.personal.pension + insurance.personal.unemployment,
        medical: insurance.personal.medical,
        housingFund: insurance.personal.housingFund,
        pension: insurance.personal.total,
      },
      companyContributions: {
        pension: insurance.company.pension,
        medical: insurance.company.medical,
        unemployment: insurance.company.unemployment,
        injury: insurance.company.injury,
        maternity: insurance.company.maternity,
        housingFund: insurance.company.housingFund,
      },
      errors,
      message: errors.length === 0 ? '计算成功' : `计算完成，有 ${errors.length} 项警告`,
    };
  } catch (e: any) {
    return {
      success: false, employeeId, employeeName: '', month,
      items: {}, grossSalary: 0, totalEarnings: 0, totalDeductions: 0,
      tax: 0, netSalary: 0, insurance: { social: 0, medical: 0, housingFund: 0, pension: 0 },
      companyContributions: { pension: 0, medical: 0, unemployment: 0, injury: 0, maternity: 0, housingFund: 0 },
      errors: [e.message],
      message: e.message,
    };
  }
}

/**
 * 构建薪资计算上下文
 */
async function buildSalaryContext(
  db: DatabaseService,
  employee: any,
  month: string
): Promise<SalaryContext> {
  // 获取当月考勤汇总
  const attendance = getAttendanceSummary(db, employee.id, month);
  
  // 获取当月加班记录
  const overtime = getOvertimeSummary(db, employee.id, month);
  
  // 获取当月请假记录
  const leave = getLeaveSummary(db, employee.id, month);
  
  // 获取岗位工资
  const positionSalary = getPositionSalary(db, employee);
  
  return {
    employee,
    month,
    baseSalary: employee.baseSalary || 0,
    positionSalary,
    performance: 0, // 绩效需要单独评估
    overtimeHours: overtime.totalHours,
    lateCount: attendance.lateCount,
    absentCount: attendance.absentCount,
    leaveDays: leave.totalDays,
    ...employee,
  };
}

/**
 * 获取考勤汇总
 */
function getAttendanceSummary(db: DatabaseService, employeeId: string, month: string): {
  lateCount: number;
  absentCount: number;
  normalDays: number;
} {
  try {
    const startDate = `${month}-01`;
    const endDate = getMonthEndDate(month);
    
    const records = db.db.prepare(`
      SELECT status, COUNT(*) as count
      FROM attendance_records
      WHERE employeeId = ? AND date >= ? AND date <= ?
      GROUP BY status
    `).all(employeeId, startDate, endDate) as any[];
    
    let lateCount = 0, absentCount = 0, normalDays = 0;
    
    for (const r of records) {
      if (r.status === '迟到' || r.status === 'late') lateCount += r.count;
      else if (r.status === '缺勤' || r.status === 'absent') absentCount += r.count;
      else if (r.status === '正常' || r.status === 'normal') normalDays += r.count;
    }
    
    return { lateCount, absentCount, normalDays };
  } catch {
    return { lateCount: 0, absentCount: 0, normalDays: 0 };
  }
}

/**
 * 获取加班汇总
 */
function getOvertimeSummary(db: DatabaseService, employeeId: string, month: string): {
  totalHours: number;
  count: number;
} {
  try {
    const rows = db.db.prepare(`
      SELECT SUM(hours) as totalHours, COUNT(*) as count
      FROM overtime_records
      WHERE employeeId = ? AND date LIKE ? AND status = 'approved'
    `).get(employeeId, `${month}%`) as any;
    
    return {
      totalHours: rows?.totalHours || 0,
      count: rows?.count || 0,
    };
  } catch {
    return { totalHours: 0, count: 0 };
  }
}

/**
 * 获取请假汇总
 */
function getLeaveSummary(db: DatabaseService, employeeId: string, month: string): {
  totalDays: number;
  byType: Record<string, number>;
} {
  try {
    const rows = db.db.prepare(`
      SELECT leaveType, SUM(totalDays) as days
      FROM leave_records
      WHERE employeeId = ? AND status = 'approved'
      AND ((startDate <= ? AND endDate >= ?) OR startDate LIKE ?)
      GROUP BY leaveType
    `).all(employeeId, `${month}-31`, `${month}-01`, `${month}%`) as any[];
    
    const byType: Record<string, number> = {};
    let totalDays = 0;
    
    for (const r of rows) {
      byType[r.leaveType] = r.days;
      totalDays += r.days;
    }
    
    return { totalDays, byType };
  } catch {
    return { totalDays: 0, byType: {} };
  }
}

/**
 * 获取岗位工资
 */
function getPositionSalary(db: DatabaseService, employee: any): number {
  try {
    const position = db.findById('positions', employee.positionId || employee.position);
    return position?.baseSalary || 0;
  } catch {
    return 0;
  }
}

/**
 * 计算员工社保
 */
async function calculateEmployeeInsurance(
  db: DatabaseService,
  employee: any,
  items: Record<string, number>
): Promise<{ personal: any; company: any }> {
  const baseSalary = employee.baseSalary || 0;
  const city = employee.location || '深圳';
  
  // 尝试获取社保方案
  let scheme;
  try {
    const schemes = db.findWhere('insurance_schemes', { city, isActive: 1 }) as any[];
    if (schemes.length > 0) {
      scheme = schemes[0];
    }
  } catch { /* ignore */ }
  
  return calculateInsurance({ baseSalary, city, scheme });
}

/**
 * 获取月份最后一天
 */
function getMonthEndDate(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m, 0);
  return `${year}-${String(m).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ============ 批量薪资计算 ============

export interface BatchSalaryResult {
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results: SalaryCalculationResult[];
  message: string;
}

/**
 * 批量计算薪资
 */
export async function batchCalculateSalary(
  db: DatabaseService,
  month: string,
  employeeIds?: string[]
): Promise<BatchSalaryResult> {
  let employees: any[];
  
  if (employeeIds && employeeIds.length > 0) {
    employees = employeeIds.map(id => db.findById('employees', id)).filter(Boolean);
  } else {
    // 获取当月在职员工
    try {
      employees = db.db.prepare(`
        SELECT * FROM employees WHERE status = 'active'
        AND (entryDate IS NULL OR entryDate <= ?)
      `).all(`${month}-31`) as any[];
    } catch {
      employees = (db.findAll('employees') as any[]).filter((e: any) => e.status === 'active');
    }
  }
  
  const results: SalaryCalculationResult[] = [];
  let succeeded = 0;
  let failed = 0;
  
  for (const emp of employees) {
    const result = await calculateSalary(db, emp.id, month);
    results.push(result);
    
    if (result.success) {
      succeeded++;
    } else {
      failed++;
    }
  }
  
  return {
    success: failed === 0,
    total: employees.length,
    succeeded,
    failed,
    results,
    message: `批量计算完成：成功 ${succeeded} 人，失败 ${failed} 人`,
  };
}

/**
 * 验证公式语法
 */
export function validateFormula(formula: string): { valid: boolean; error?: string } {
  if (!formula || formula.trim() === '') {
    return { valid: true };
  }
  
  try {
    // 检查括号匹配
    let depth = 0;
    for (const char of formula) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (depth < 0) return { valid: false, error: '括号不匹配' };
    }
    if (depth !== 0) return { valid: false, error: '括号不匹配' };
    
    // 测试执行（使用空上下文）
    const testContext: SalaryContext = {
      employee: { id: '', name: '', department: '' },
      month: '2024-01',
      baseSalary: 10000,
      positionSalary: 0,
      performance: 0,
      overtimeHours: 0,
      lateCount: 0,
      absentCount: 0,
      leaveDays: 0,
    };
    
    const result = evaluateFormula(formula, testContext);
    return { valid: result.success, error: result.error };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}

/**
 * 获取默认薪资项配置
 */
export function getDefaultSalaryItems(): any[] {
  return [
    { id: 'base_salary', name: '基本工资', code: 'base_salary', type: 'earnings', formula: '基本工资', defaultValue: 0, isTaxable: 1, sortOrder: 1 },
    { id: 'position_salary', name: '岗位工资', code: 'position_salary', type: 'earnings', formula: '岗位工资', defaultValue: 0, isTaxable: 1, sortOrder: 2 },
    { id: 'performance', name: '绩效工资', code: 'performance', type: 'earnings', formula: '绩效工资', defaultValue: 0, isTaxable: 1, sortOrder: 3 },
    { id: 'overtime_pay', name: '加班费', code: 'overtime_pay', type: 'earnings', formula: '加班小时数 * 50', defaultValue: 0, isTaxable: 1, sortOrder: 4 },
    { id: 'meal_allowance', name: '餐补', code: 'meal_allowance', type: 'allowance', defaultValue: 300, isTaxable: 0, sortOrder: 10 },
    { id: 'transport_allowance', name: '交通补贴', code: 'transport_allowance', type: 'allowance', defaultValue: 200, isTaxable: 0, sortOrder: 11 },
    { id: 'communication_allowance', name: '通讯补贴', code: 'communication_allowance', type: 'allowance', defaultValue: 100, isTaxable: 0, sortOrder: 12 },
    { id: 'late_deduction', name: '迟到扣款', code: 'late_deduction', type: 'deductions', formula: '迟到次数 * 50', defaultValue: 0, isTaxable: 0, sortOrder: 20 },
    { id: 'absence_deduction', name: '缺勤扣款', code: 'absence_deduction', type: 'deductions', formula: '缺勤次数 * 200', defaultValue: 0, isTaxable: 0, sortOrder: 21 },
  ];
}