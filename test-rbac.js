// #108 RBAC 细化权限验证
const BASE = process.env.BASE || 'http://localhost:3400';
let pass = 0, fail = 0;
function ok(name, cond, extra) { if (cond) { pass++; console.log(`  ✅ ${name}`); } else { fail++; console.log(`  ❌ ${name}` + (extra ? ` — ${extra}` : '')); } }

async function main() {
  console.log(`#108 RBAC 测试 @ ${BASE}`);

  // 1. 权限目录（分组）
  const r1 = await fetch(`${BASE}/api/rbac/permissions`);
  const d1 = await r1.json();
  ok('permissions 返回 200', r1.status === 200);
  ok('分组含 cms 模块', Array.isArray(d1) && d1.some(g => g.moduleKey === 'cms'));
  const cms = (Array.isArray(d1) ? d1.find(g => g.moduleKey === 'cms') : null);
  ok('cms 含细粒度点 cms:article:delete', !!cms && cms.points.some(p => p.key === 'cms:article:delete'));

  // 2. 角色与默认权限映射
  const r2 = await fetch(`${BASE}/api/rbac/roles`);
  const d2 = await r2.json();
  ok('roles 返回 200', r2.status === 200);
  ok('含 super_admin', Array.isArray(d2) && d2.some(r => r.code === 'super_admin'));
  const sa = d2.find(r => r.code === 'super_admin');
  ok('super_admin 含 cms:article:delete', !!sa && sa.permissionIds.includes('cms:article:delete'));
  const emp = d2.find(r => r.code === 'employee');
  ok('employee 无细粒度 cms 权限', !!emp && !emp.permissionIds.some(p => p.startsWith('cms:')));

  // 3. 通用 CRUD 也已播种（供 RoleManagePage 使用）
  const r0 = await fetch(`${BASE}/api/permissions`);
  const d0 = await r0.json();
  ok('通用 /api/permissions 已含目录', Array.isArray(d0) && d0.length > 0);

  // 4. 创建角色
  const code = 'test_role_' + Date.now();
  const r3 = await fetch(`${BASE}/api/rbac/roles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '测试角色', code, description: 't', permissionIds: ['cms:article:view', 'hr:employee:manage'], type: 'custom' }) });
  const d3 = await r3.json();
  ok('创建角色 200', r3.status === 200, 'status=' + r3.status);
  ok('返回新角色 id', !!d3.id);
  const newId = d3.id;

  // 5. 更新角色权限
  const r4 = await fetch(`${BASE}/api/rbac/roles/${newId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permissionIds: ['cms:article:delete', 'system:user:manage'] }) });
  ok('更新角色 200', r4.status === 200);
  const r4b = await fetch(`${BASE}/api/rbac/roles/${newId}`);
  const d4b = await r4b.json();
  ok('更新后含 cms:article:delete', d4b.permissionIds.includes('cms:article:delete'));

  // 6. resolve 解析
  const r5 = await fetch(`${BASE}/api/rbac/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roleIds: ['role_employee'] }) });
  const d5 = await r5.json();
  ok('resolve employee 不含 cms:article:delete', Array.isArray(d5.permissions) && !d5.permissions.includes('cms:article:delete'));
  const r5b = await fetch(`${BASE}/api/rbac/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roleIds: ['role_super_admin'] }) });
  const d5b = await r5b.json();
  ok('resolve super_admin 含 cms:article:delete', d5b.permissions.includes('cms:article:delete'));

  // 7. 系统角色不可删
  const r6 = await fetch(`${BASE}/api/rbac/roles/${sa.id}`, { method: 'DELETE' });
  ok('系统角色删除被拒(403)', r6.status === 403, 'status=' + r6.status);

  // 8. 清理自定义测试角色
  const r7 = await fetch(`${BASE}/api/rbac/roles/${newId}`, { method: 'DELETE' });
  ok('删除自定义角色 200', r7.status === 200);
  const r7b = await fetch(`${BASE}/api/rbac/roles/${newId}`);
  ok('删除后查询 404', r7b.status === 404);

  console.log(`\n#108 结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('测试异常:', e); process.exit(1); });
