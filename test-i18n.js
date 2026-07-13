require('./fetch-polyfill');
// #107 多语言 i18n 骨架验证
const BASE = process.env.BASE || 'http://localhost:3000';
let pass = 0, fail = 0;
function ok(name, cond, extra) { if (cond) { pass++; console.log(`  ✅ ${name}`); } else { fail++; console.log(`  ❌ ${name}` + (extra ? ` — ${extra}` : '')); } }

async function main() {
  console.log(`#107 i18n 测试 @ ${BASE}`);

  // 1. 可用语言列表
  const r1 = await fetch(`${BASE}/api/i18n/available`);
  const d1 = await r1.json();
  ok('available 返回 200', r1.status === 200, 'status=' + r1.status);
  ok('含 zh-CN', Array.isArray(d1) && d1.some(l => l.code === 'zh-CN'));
  ok('含 en', Array.isArray(d1) && d1.some(l => l.code === 'en'));

  // 2. 英文译文
  const r2 = await fetch(`${BASE}/api/i18n/messages?lang=en`);
  const d2 = await r2.json();
  ok('en messages 返回 200', r2.status === 200);
  ok('en locale 正确', d2.locale === 'en');
  ok('保存→Save', d2.messages && d2.messages['保存'] === 'Save', JSON.stringify(d2.messages && d2.messages['保存']));
  ok('系统管理→System', d2.messages && d2.messages['系统管理'] === 'System');

  // 3. 中文（回退：空译文）
  const r3 = await fetch(`${BASE}/api/i18n/messages?lang=zh-CN`);
  const d3 = await r3.json();
  ok('zh-CN messages 返回 200', r3.status === 200);
  ok('zh-CN locale 正确', d3.locale === 'zh-CN');
  ok('zh-CN 译文为空对象(回退到 key)', d3.messages && Object.keys(d3.messages).length === 0);

  console.log(`\n#107 结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('测试异常:', e); process.exit(1); });
