// 薪酬模块疑似 bug 修复回归测试（# 立项修复）
// 覆盖：netSalary 漏扣个人五险一金 / generate 蛇形列错位 / 企业缴纳回写联动
const BASE = process.env.BASE || 'http://localhost:3400';
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}` + (extra ? ` — ${extra}` : '')); }
}

async function main() {
  console.log(`薪酬修复回归测试 @ ${BASE}`);
  const H = { 'Content-Type': 'application/json' };

  // 0. 确保 salary_items 有默认项（自愈：若表空则从 /api/salary/default-items 写入）
  let items = await (await fetch(`${BASE}/api/salary_items`)).json();
  if (!Array.isArray(items) || items.length === 0) {
    const defs = await (await fetch(`${BASE}/api/salary/default-items`)).json();
    for (const it of (Array.isArray(defs) ? defs : [])) {
      await fetch(`${BASE}/api/salary/items`, { method: 'POST', headers: H, body: JSON.stringify(it) });
    }
    items = await (await fetch(`${BASE}/api/salary_items`)).json();
  }
  ok('salary_items 已就绪(>=9 默认项)', Array.isArray(items) && items.length >= 9, 'count=' + (items || []).length);

  // 1. 取一个有效员工，确保有 baseSalary（无则临时置 10000 以验证社保计算）
  const emps = await (await fetch(`${BASE}/api/employees?status=active`)).json();
  ok('员工列表可获取', Array.isArray(emps) && emps.length > 0);
  let emp = (Array.isArray(emps) ? emps : []).find(e => e.baseSalary > 0) || emps[0];
  ok('取到测试员工', !!emp, 'id=' + (emp && emp.id));
  if (emp && (!emp.baseSalary || emp.baseSalary <= 0)) {
    await fetch(`${BASE}/api/employees/${emp.id}`, { method: 'PUT', headers: H, body: JSON.stringify({ baseSalary: 10000 }) });
    emp = { ...emp, baseSalary: 10000 };
  }
  const base = emp.baseSalary || 10000;
  ok('员工 baseSalary 有效(>0)', base > 0, 'base=' + base);
  const month = '2026-07';

  // 2. 计算薪资（修复前：netSalary 未扣个人五险一金，几乎等于 gross）
  const calc = await (await fetch(`${BASE}/api/salary/calculate`, {
    method: 'POST', headers: H, body: JSON.stringify({ employeeId: emp.id, month }),
  })).json();
  ok('薪资计算返回 success', calc.success === true, 'msg=' + calc.message);
  // 引擎返回的 insurance 为扁平结构：{ social, medical, housingFund, pension(个人合计) }
  const personalTotal = (calc.insurance && calc.insurance.pension) || 0;
  ok('个人五险一金已计算(>0)', personalTotal > 0, 'personal=' + personalTotal);
  // 修复核心：应扣总额必须包含个人社保
  ok('应扣额 totalDeductions 含个人五险一金', calc.totalDeductions >= (personalTotal - 0.01),
    `deductions=${calc.totalDeductions} personal=${personalTotal}`);
  // netSalary == gross - totalDeductions(含社保) - tax
  const expNet = Math.round((calc.grossSalary - calc.totalDeductions - calc.tax) * 100) / 100;
  ok('netSalary 与公式一致(已正确扣减)', calc.netSalary === expNet, `net=${calc.netSalary} exp=${expNet}`);
  ok('netSalary 明显低于 gross(实发未虚高)', calc.netSalary < calc.grossSalary - 1,
    `net=${calc.netSalary} gross=${calc.grossSalary}`);

  // 3. 生成薪资条（修复前：...r.items 蛇形列导致 no such column -> 500）
  const gen = await (await fetch(`${BASE}/api/salary/generate`, {
    method: 'POST', headers: H, body: JSON.stringify({ month, employeeId: emp.id }),
  })).json();
  ok('生成薪资条 success', gen.success === true, 'msg=' + gen.message);
  ok('生成包含该员工记录', gen.message && gen.message.includes('1'), gen.message);

  // 4. 查询 salaries 记录：验证驼峰列映射（无蛇形列、字段可读）
  const sals = await (await fetch(`${BASE}/api/salaries?employeeId=${emp.id}&month=${month}`)).json();
  const rec = (Array.isArray(sals) ? sals : []).find(s => s.employeeId === emp.id && s.month === month);
  ok('salaries 记录可查到', !!rec, 'id=' + (rec && rec.id));
  if (rec) {
    ok('salaries 含驼峰 baseSalary 字段(number)', typeof rec.baseSalary === 'number', 'baseSalary=' + rec.baseSalary);
    ok('salaries 无蛇形 base_salary 列(修复前会 500/错位)', !('base_salary' in rec));
    ok('salaries.netSalary 与计算一致', rec.netSalary === calc.netSalary, `db=${rec.netSalary} calc=${calc.netSalary}`);
    ok('salaries.socialInsurance 已落列', typeof rec.socialInsurance === 'number' && rec.socialInsurance >= 0);
    ok('salaries.housingFund 已落列', typeof rec.housingFund === 'number');
  }

  // 5. 企业缴纳回写（bug5 轻量联动：generate 同时写 company_contributions）
  const ccs = await (await fetch(`${BASE}/api/company_contributions?employeeId=${emp.id}&month=${month}`)).json();
  const cc = (Array.isArray(ccs) ? ccs : []).find(c => c.employeeId === emp.id && c.month === month);
  ok('company_contributions 已回写(企业缴纳联动)', !!cc, 'total=' + (cc && cc.total));
  if (cc) ok('企业缴纳合计>0', (cc.total || 0) > 0, 'total=' + cc.total);

  console.log(`\n薪酬修复回归: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('测试异常:', e); process.exit(1); });
