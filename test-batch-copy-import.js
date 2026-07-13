require('./fetch-polyfill');
// 验证 #100 跨栏目复制 / 批量替换 / 导入导出
const BASE = process.env.BASE || 'http://localhost:3000';
const post = (p, b) => fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
const put = (p, b) => fetch(BASE + p, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
const get = (p) => fetch(BASE + p).then(r => r.json());
const del = (p) => fetch(BASE + p, { method: 'DELETE' }).then(r => r.json());

let pass = 0, fail = 0;
const check = (n, c) => { if (c) { pass++; console.log('  PASS', n); } else { fail++; console.log('  FAIL', n); } };
const created = [];
const TS = Date.now();

(async () => {
 try {
  // 准备：取一个栏目作源，创建一个新栏目作跨栏目目标（code 唯一避免唯一约束冲突）
  const chs = await get('/api/cms-channels');
  const srcCh = (chs.list || chs || [])[0];
  const newCh = await post('/api/cms-channels', { name: '测试栏目_' + TS, code: 'test_' + TS });
  created.push({ t: 'ch', id: newCh.id });
  const srcChId = srcCh ? srcCh.id : (newCh.id);

  console.log('1) 创建测试文章');
  const A = await post('/api/cms-articles', {
    title: '批量测试文_' + TS, channel_id: srcChId, status: 'published',
    content: '<p>旧词旧词内容</p>', summary: '旧词摘要'
  });
  created.push({ t: 'art', id: A.id });
  check('文章创建', !!A.id);

  console.log('2) 跨栏目复制');
  const cp = await post(`/api/cms-articles/${A.id}/copy`, { channel_id: newCh.id });
  created.push({ t: 'art', id: cp.id });
  check('复制返回新 id', !!cp.id);
  const cpDetail = await get(`/api/cms-articles/${cp.id}`);
  check('副本标题带(副本)', (cpDetail.title || '').includes('(副本)'));
  check('副本到目标栏目', cpDetail.channel_id === newCh.id);
  check('副本为草稿', cpDetail.status === 'draft');

  console.log('3) 批量替换（字段 + 文本）');
  const br = await post('/api/cms-articles/batch-replace', {
    ids: [A.id], field: 'status', value: 'draft',
    search: '旧词', replacement: '新词'
  });
  check('批量更新完成', br.done === 1);
  const A2 = await get(`/api/cms-articles/${A.id}`);
  check('状态改为 draft', A2.status === 'draft');
  check('文本替换生效', (A2.content || '').includes('新词') && !(A2.content || '').includes('旧词'));
  check('摘要文本替换生效', (A2.summary || '').includes('新词'));

  console.log('4) 导出');
  const exp = await get('/api/cms-export');
  check('导出为数组', Array.isArray(exp.articles) && exp.articles.length >= 1);
  check('导出含测试文章', exp.articles.some(a => a.id === A.id));

  console.log('5) 导入');
  const imp = await post('/api/cms-import', { articles: [{ title: '导入文_' + TS, channel_id: srcChId, content: '<p>导入内容</p>' }] });
  check('导入成功 imported=1', imp.imported === 1);
  const all = await get('/api/cms-articles?pageSize=200');
  check('导入文出现在列表', all.list.some(a => a.title === '导入文_' + TS));

  console.log('6) 清理');
  for (const c of created) {
    if (c.t === 'art') await del(`/api/cms-articles/${c.id}`);
    else await del(`/api/cms-channels/${c.id}`);
  }
  // 删除导入文
  const importedOne = (await get('/api/cms-articles?pageSize=200')).list.find(a => a.title === '导入文_' + TS);
  if (importedOne) await del(`/api/cms-articles/${importedOne.id}`);
  const after = await get('/api/cms-articles?pageSize=200');
  check('清理后无测试残留', !after.list.some(a => (a.title || '').includes('批量测试文_') || (a.title || '').includes('导入文_') || (a.title || '').includes('(副本)')));

  console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
 } catch (e) {
  console.error('ERR', e);
  fail++;
 } finally {
  // 无论如何都清理已创建的资源
  for (const c of created) {
    try { if (c.t === 'art') await del(`/api/cms-articles/${c.id}`); else await del(`/api/cms-channels/${c.id}`); } catch {}
  }
  try { const io = (await get('/api/cms-articles?pageSize=200')).list.find(a => (a.title||'').includes('导入文_' + TS)); if (io) await del(`/api/cms-articles/${io.id}`); } catch {}
 }
  process.exit(fail === 0 ? 0 : 1);
})();
