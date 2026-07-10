// #129 i18n 扩充测试：验证 /api/i18n/messages?lang=en 含新词条
const BASE = process.env.BASE || 'http://localhost:3400';
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  \u2713 ' + msg); } else { fail++; console.log('  \u2717 ' + msg); } }

async function main() {
  console.log('=== #129 i18n 扩充测试 ===');

  // 1. available 含 en
  const avail = await (await fetch(BASE + '/api/i18n/available')).json();
  ok(Array.isArray(avail) && avail.some(a => (a.code || a) === 'en'), 'available 列表含 en');

  // 2. messages?lang=en 返回字典
  const en = await (await fetch(BASE + '/api/i18n/messages?lang=en')).json();
  ok(en && en.locale === 'en' && en.messages && typeof en.messages === 'object', 'messages?lang=en 返回 locale+messages');

  const m = (en && en.messages) || {};
  const total = Object.keys(m).length;
  console.log('  词条总数: ' + total);
  ok(total >= 80, '词条数量 >= 80 (扩充后, 实际 ' + total + ')');

  // 3. 新增关键词条存在且译文正确
  const expect = {
    '栏目管理': 'Channels',
    '文章管理': 'Articles',
    '评论管理': 'Comments',
    '添加文章': 'New Article',
    '批量删除': 'Batch Delete',
    '批量替换': 'Batch Replace',
    'Word导入': 'Import Word',
    '通过': 'Approve',
    '拒绝': 'Reject',
    '站点范围': 'Site Scope',
    '角色管理': 'Roles',
    '编辑': 'Edit',
    '删除': 'Delete',
    '导出': 'Export',
    '导入': 'Import',
  };
  let hit = 0;
  for (const [k, v] of Object.entries(expect)) {
    if (m[k] === v) hit++;
    else console.log('    \u26a0 缺失/不符: ' + k + ' => ' + JSON.stringify(m[k]) + ' (期望 ' + v + ')');
  }
  ok(hit === Object.keys(expect).length, '新增关键词条全部命中 (' + hit + '/' + Object.keys(expect).length + ')');

  // 4. 未知语言回退
  const zh = await (await fetch(BASE + '/api/i18n/messages?lang=zh')).json();
  ok(zh && (zh.locale === 'zh' || zh.messages), 'zh 请求正常返回');

  console.log('\n通过 ' + pass + ' / 失败 ' + fail);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
