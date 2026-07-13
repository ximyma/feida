require('./fetch-polyfill');
const BASE = process.env.BASE || 'http://localhost:3000';
const get = (p) => fetch(BASE + p).then(r => r.json());
const post = (p, b) => fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
const put = (p, b) => fetch(BASE + p, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
const del = (p) => fetch(BASE + p, { method: 'DELETE' }).then(r => r.json());

let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) { pass++; console.log('  ✅', name); } else { fail++; console.log('  ❌', name); } };
const created = [];

(async () => {
  console.log('1) 栏目模板 + 图片字段保存');
  const ch = await post('/api/cms-channels', {
    name: '栏目特性测试_' + Date.now(),
    code: 'chfeat_' + Date.now(),
    type: 'article',
    image_url: 'https://example.com/cover.jpg',
    template_list: 'list_a',
    template_detail: 'detail_b',
    sort_order: 50
  });
  created.push(ch.id);
  const ch2 = await post('/api/cms-channels', {
    name: '栏目特性测试2_' + Date.now(),
    code: 'chfeat2_' + Date.now(),
    type: 'article',
    sort_order: 60
  });
  created.push(ch2.id);
  const fetched = await get('/api/cms-channels');
  const fc = (fetched.list || fetched).find(c => c.id === ch.id);
  check('image_url 持久化', fc && fc.image_url === 'https://example.com/cover.jpg');
  check('template_list 持久化', fc && fc.template_list === 'list_a');
  check('template_detail 持久化', fc && fc.template_detail === 'detail_b');

  console.log('2) 拖拽排序端点');
  // 当前 ch(sort 50) 应在 ch2(sort 60) 之前
  let list = await get('/api/cms-channels');
  const arr = list.list || list;
  const i1 = arr.findIndex(c => c.id === ch.id);
  const i2 = arr.findIndex(c => c.id === ch2.id);
  check('初始顺序 ch 在 ch2 前', i1 < i2);
  // 拖拽：把 ch2 放到 ch 之前
  const reordered = arr.map(c => c.id);
  reordered.splice(i2, 1);
  reordered.unshift(ch2.id);
  const ro = await post('/api/cms-channels/reorder', { orderedIds: reordered });
  check('reorder 返回 success', ro.success === true);
  list = await get('/api/cms-channels');
  const arr2 = list.list || list;
  const j1 = arr2.findIndex(c => c.id === ch.id);
  const j2 = arr2.findIndex(c => c.id === ch2.id);
  check('拖拽后 ch2 在 ch 前', j2 < j1);
  check('sort_order 已按新序写入', arr2[j2].sort_order < arr2[j1].sort_order);

  console.log('3) 上下移按钮(等价 reorder)');
  const back = arr2.map(c => c.id).filter(id => id === ch.id || id === ch2.id);
  // 恢复 ch 在前
  const restore = reordered.slice().reverse();
  await post('/api/cms-channels/reorder', { orderedIds: restore });
  const list3 = await get('/api/cms-channels');
  const arr3 = list3.list || list3;
  check('恢复后 ch 回到 ch2 前', arr3.findIndex(c => c.id === ch.id) < arr3.findIndex(c => c.id === ch2.id));

  console.log('4) 清理');
  for (const id of created) await del(`/api/cms-channels/${id}`);
  const after = await get('/api/cms-channels');
  const arrA = after.list || after;
  check('清理后无测试残留', !arrA.some(c => (c.name || '').includes('栏目特性测试')));

  console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('ERR', e); process.exit(2); });
