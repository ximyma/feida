require('./fetch-polyfill');
const BASE = process.env.BASE || 'http://localhost:3000';
const get = (p) => fetch(BASE + p).then(r => r.json());
const post = (p, b) => fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
const put = (p, b) => fetch(BASE + p, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
const del = (p) => fetch(BASE + p, { method: 'DELETE' }).then(r => r.json());

let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) { pass++; console.log('  ✅', name); } else { fail++; console.log('  ❌', name); } };

(async () => {
  console.log('1) 创建目标文章（用于被插入链接）');
  const target = await post('/api/cms-articles', { title: '被引用文章_链接测试', status: 'published', content: '<p>正文</p>' });
  check('目标文章创建', !!target.id);

  console.log('2) 关键词搜索端点（富文本弹窗依赖）');
  const search = await get('/api/cms-articles?keyword=' + encodeURIComponent('被引用文章') + '&pageSize=10');
  check('搜索能命中目标文章', (search.list || []).some(a => a.id === target.id));

  console.log('3) 文章正文内插入站内文章链接的 HTML 往返');
  const html = `<p>参见 <a href="/site/articles/${target.id}">被引用文章_链接测试</a> 了解详情。</p>`;
  const art = await post('/api/cms-articles', { title: '含站内链接的文章', status: 'published', content: html });
  const fetched = await get('/api/cms-articles/' + art.id);
  check('详情返回 content 含链接', (fetched.content || '').includes(`/site/articles/${target.id}`));
  check('链接文本保留', (fetched.content || '').includes('被引用文章_链接测试'));

  console.log('4) 清理');
  await del('/api/cms-articles/' + target.id);
  await del('/api/cms-articles/' + art.id);
  const after = await get('/api/cms-articles?pageSize=200');
  check('清理后无残留', !after.list.some(a => (a.title || '').includes('链接测试')));

  console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('ERR', e); process.exit(2); });
