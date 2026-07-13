require('./fetch-polyfill');
// #128 细粒度权限点测试：验证 /api/rbac/resolve 返回正确权限点（前端按钮显隐的数据来源）
const BASE = process.env.BASE || 'http://localhost:3000';
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  \u2713 ' + msg); } else { fail++; console.log('  \u2717 ' + msg); } }

async function resolve(roleIds) {
  const r = await fetch(BASE + '/api/rbac/resolve', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleIds })
  });
  return r.json();
}

async function main() {
  console.log('=== #128 细粒度权限点解析测试 ===');

  // 1. 权限目录端点
  const cat = await (await fetch(BASE + '/api/rbac/permissions')).json().catch(() => null);
  ok(Array.isArray(cat) && cat.length >= 4, 'permissions 目录返回 >=4 模块');

  // 2. super_admin 拥有全部关键点
  const sa = await resolve(['super_admin']);
  const P = sa.permissions || [];
  ok(P.includes('cms:article:delete'), 'super_admin 含 cms:article:delete');
  ok(P.includes('cms:channel:manage'), 'super_admin 含 cms:channel:manage');
  ok(P.includes('cms:comment:moderate'), 'super_admin 含 cms:comment:moderate');

  // 3. hr_admin 有创建/编辑但【无】删除（删除按钮应隐藏）
  const ha = await resolve(['hr_admin']);
  const HP = ha.permissions || [];
  ok(HP.includes('cms:article:create'), 'hr_admin 含 cms:article:create（显示"添加文章"）');
  ok(HP.includes('cms:article:edit'), 'hr_admin 含 cms:article:edit（显示"编辑"）');
  ok(!HP.includes('cms:article:delete'), 'hr_admin 【不】含 cms:article:delete（隐藏"删除"）');
  ok(HP.includes('cms:comment:moderate'), 'hr_admin 含 cms:comment:moderate（显示审核）');

  // 4. hr_staff 仅 view+create（编辑/删除/审核按钮应隐藏）
  const hs = await resolve(['hr_staff']);
  const SP = hs.permissions || [];
  ok(SP.includes('cms:article:create'), 'hr_staff 含 cms:article:create');
  ok(!SP.includes('cms:article:edit'), 'hr_staff 【不】含 cms:article:edit（隐藏"编辑"）');
  ok(!SP.includes('cms:article:delete'), 'hr_staff 【不】含 cms:article:delete');
  ok(!SP.includes('cms:comment:moderate'), 'hr_staff 【不】含 cms:comment:moderate');
  ok(!SP.includes('cms:channel:manage'), 'hr_staff 【不】含 cms:channel:manage（隐藏栏目操作）');

  // 5. employee 无任何 CMS 点（所有操作按钮隐藏）
  const em = await resolve(['employee']);
  const EP = em.permissions || [];
  ok(!EP.some(p => p.startsWith('cms:')), 'employee 无任何 cms:* 权限点');

  // 6. 多角色并集
  const merged = await resolve(['hr_staff', 'dept_manager']);
  const MP = merged.permissions || [];
  ok(MP.includes('cms:article:create') && MP.includes('hr:approval:manage'), '多角色权限点并集正确');

  console.log('\n通过 ' + pass + ' / 失败 ' + fail);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
