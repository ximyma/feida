// 培训模块 API 冒烟测试（使用 BASE，默认 http://localhost:3400）
const BASE = process.env.BASE || 'http://localhost:3400';

const endpoints = [
  '/api/training_plans?limit=2',
  '/api/training_courses?limit=2',
  '/api/training_classes?limit=2',
  '/api/training_records?limit=2',
  '/api/assessment_templates?limit=2',
];

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✅ ' + msg); }
  else { fail++; console.log('  ❌ ' + msg); }
}

(async () => {
  console.log('# API 冒烟测试 @ ' + BASE);
  for (const ep of endpoints) {
    try {
      const r = await fetch(BASE + ep);
      ok(r.status === 200, ep + ' -> HTTP ' + r.status);
      const j = await r.json().catch(() => null);
      ok(Array.isArray(j), ep + ' 返回 JSON 数组');
      if (Array.isArray(j)) console.log('     条数: ' + j.length);
    } catch (e) {
      fail++;
      console.log('  ❌ ' + ep + ' 请求异常: ' + e.message);
    }
  }
  console.log(`\n结果: ${pass} 通过 / ${fail} 失败`);
  process.exit(fail ? 1 : 0);
})();
