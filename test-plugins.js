require('./fetch-polyfill');
// #109 插件系统验证
const BASE = process.env.BASE || 'http://localhost:3000';
let pass = 0, fail = 0;
function ok(name, cond, extra) { if (cond) { pass++; console.log(`  ✅ ${name}`); } else { fail++; console.log(`  ❌ ${name}` + (extra ? ` — ${extra}` : '')); } }

async function main() {
  console.log(`#109 插件系统测试 @ ${BASE}`);

  // 1. 插件列表
  const r1 = await fetch(`${BASE}/api/plugins`);
  const d1 = await r1.json();
  ok('plugins 返回 200', r1.status === 200);
  ok('含 demo 插件', Array.isArray(d1) && d1.some(p => p.id === 'demo'));
  ok('含 stats 插件', Array.isArray(d1) && d1.some(p => p.id === 'stats'));
  const demo = d1.find(p => p.id === 'demo');
  ok('demo 默认启用', !!demo && demo.enabled === true);

  // 2. 插件路由可用
  const r2 = await fetch(`${BASE}/api/plugin/demo/ping`);
  const d2 = await r2.json();
  ok('demo/ping 返回 200', r2.status === 200);
  ok('返回 pong', d2.pong === true);

  const r2b = await fetch(`${BASE}/api/plugin/stats/overview`);
  ok('stats/overview 返回 200', r2b.status === 200);

  // 3. 停用 demo
  const r3 = await fetch(`${BASE}/api/plugins/demo/toggle`, { method: 'POST' });
  const d3 = await r3.json();
  ok('toggle 返回 200', r3.status === 200);
  ok('停用后 enabled=false', d3.enabled === false);

  const r4 = await fetch(`${BASE}/api/plugin/demo/ping`);
  ok('停用后 ping 被拒(403)', r4.status === 403, 'status=' + r4.status);

  // 4. 重新启用
  const r5 = await fetch(`${BASE}/api/plugins/demo/toggle`, { method: 'POST' });
  const d5 = await r5.json();
  ok('重新启用 enabled=true', d5.enabled === true);
  const r6 = await fetch(`${BASE}/api/plugin/demo/ping`);
  ok('启用后 ping 恢复 200', r6.status === 200);

  // 5. 不存在的插件
  const r7 = await fetch(`${BASE}/api/plugins/nope/toggle`, { method: 'POST' });
  ok('未知插件 toggle 404', r7.status === 404);
  const r8 = await fetch(`${BASE}/api/plugin/nope/ping`);
  ok('未知插件 ping 403', r8.status === 403);

  console.log(`\n#109 结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('测试异常:', e); process.exit(1); });
