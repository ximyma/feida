require('./fetch-polyfill');
// #130 站点级权限 scope 验证
const BASE = process.env.BASE || 'http://localhost:3000';
let pass = 0, fail = 0;
function ok(name, cond, extra) { if (cond) { pass++; console.log(`  ✅ ${name}`); } else { fail++; console.log(`  ❌ ${name}` + (extra ? ` — ${extra}` : '')); } }

async function main() {
  console.log(`#130 站点级权限 scope 测试 @ ${BASE}`);

  // 1. 站点目录
  const r1 = await fetch(`${BASE}/api/rbac/sites`);
  const d1 = await r1.json();
  ok('sites 返回 200', r1.status === 200);
  ok('含 3 个站点(main/shop/portal)', Array.isArray(d1) && ['main', 'shop', 'portal'].every(c => d1.some(s => s.code === c)), JSON.stringify(d1));

  // 2. 角色列表返回 siteScope
  const r2 = await fetch(`${BASE}/api/rbac/roles`);
  const d2 = await r2.json();
  const sa = d2.find(r => r.code === 'super_admin');
  const ha = d2.find(r => r.code === 'hr_admin');
  const emp = d2.find(r => r.code === 'employee');
  ok('super_admin siteScope 为全部(*)', !!sa && Array.isArray(sa.siteScope) && sa.siteScope.includes('*'), JSON.stringify(sa && sa.siteScope));
  ok('hr_admin siteScope 含 main 与 shop', !!ha && ha.siteScope.includes('main') && ha.siteScope.includes('shop'), JSON.stringify(ha && ha.siteScope));
  ok('hr_admin siteScope 不含 portal', !!ha && !ha.siteScope.includes('portal'));

  // 3. resolve 返回 siteScope（并集，* 优先）
  const rs1 = await fetch(`${BASE}/api/rbac/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roleIds: ['role_super_admin'] }) });
  const ds1 = await rs1.json();
  ok('resolve super_admin siteScope=[*]', Array.isArray(ds1.siteScope) && ds1.siteScope.length === 1 && ds1.siteScope[0] === '*');
  ok('resolve 返回 sites 目录', Array.isArray(ds1.sites) && ds1.sites.length === 3);

  const rs2 = await fetch(`${BASE}/api/rbac/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roleIds: ['role_hr_admin'] }) });
  const ds2 = await rs2.json();
  ok('resolve hr_admin siteScope=[main,shop]', ['main', 'shop'].every(s => ds2.siteScope.includes(s)) && !ds2.siteScope.includes('*'), JSON.stringify(ds2.siteScope));

  const rs3 = await fetch(`${BASE}/api/rbac/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roleIds: ['role_employee'] }) });
  const ds3 = await rs3.json();
  ok('resolve employee siteScope 为空', Array.isArray(ds3.siteScope) && ds3.siteScope.length === 0, JSON.stringify(ds3.siteScope));

  // 4. 多角色并集：super_admin(*) + hr_admin => *
  const rs4 = await fetch(`${BASE}/api/rbac/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roleIds: ['role_super_admin', 'role_hr_admin'] }) });
  const ds4 = await rs4.json();
  ok('resolve 含*角色时并集为[*]', ds4.siteScope.length === 1 && ds4.siteScope[0] === '*');

  // 5. 创建带 siteScope 的自定义角色
  const code = 'test_site_' + Date.now();
  const rc = await fetch(`${BASE}/api/rbac/roles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '站点测试角色', code, permissionIds: ['cms:article:view'], type: 'custom', siteScope: ['shop'] }) });
  const dc = await rc.json();
  ok('创建角色 200', rc.status === 200);
  const newId = dc.id;
  const rcg = await fetch(`${BASE}/api/rbac/roles/${newId}`);
  const dcg = await rcg.json();
  ok('新角色 siteScope=[shop]', Array.isArray(dcg.siteScope) && dcg.siteScope.length === 1 && dcg.siteScope[0] === 'shop', JSON.stringify(dcg.siteScope));

  // 6. 更新 siteScope
  const ru = await fetch(`${BASE}/api/rbac/roles/${newId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteScope: ['main', 'portal'] }) });
  ok('更新 siteScope 200', ru.status === 200);
  const rug = await fetch(`${BASE}/api/rbac/roles/${newId}`);
  const dug = await rug.json();
  ok('更新后 siteScope=[main,portal]', ['main', 'portal'].every(s => dug.siteScope.includes(s)) && dug.siteScope.length === 2, JSON.stringify(dug.siteScope));

  // 7. 非法站点码被过滤
  const ru2 = await fetch(`${BASE}/api/rbac/roles/${newId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteScope: ['main', 'hacker_site'] }) });
  ok('非法站点更新 200', ru2.status === 200);
  const rug2 = await fetch(`${BASE}/api/rbac/roles/${newId}`);
  const dug2 = await rug2.json();
  ok('非法站点码被过滤', !dug2.siteScope.includes('hacker_site') && dug2.siteScope.includes('main'), JSON.stringify(dug2.siteScope));

  // 8. 清理
  const rd = await fetch(`${BASE}/api/rbac/roles/${newId}`, { method: 'DELETE' });
  ok('删除测试角色 200', rd.status === 200);

  console.log(`\n#130 结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('测试异常:', e); process.exit(1); });
