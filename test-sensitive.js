require('./fetch-polyfill');
const BASE = process.env.BASE || 'http://localhost:3000';
const get = (p) => fetch(BASE + p).then(r => r.json());
const post = (p, b) => fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
const del = (p) => fetch(BASE + p, { method: 'DELETE' }).then(r => r.json());

let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) { pass++; console.log('  ✅', name); } else { fail++; console.log('  ❌', name); } };
const created = [];

(async () => {
  console.log('1) 敏感词表（含种子）');
  const list = await get('/api/sensitive-words');
  check('种子词存在(暴力)', Array.isArray(list) && list.some(w => w.word === '暴力'));

  console.log('2) 新增敏感词');
  const add = await post('/api/sensitive-words', { word: '测试违禁词_' + Date.now() });
  check('新增成功', add.success === true);
  if (add.success) created.push(add.id);

  console.log('3) 预检端点命中');
  const pre = await post('/api/cms-articles/check-sensitive', { title: '正常标题', content: '<p>这是一段关于暴力的描述</p>' });
  check('命中"暴力"', Array.isArray(pre.hits) && pre.hits.includes('暴力'));

  console.log('4) 保存文章标记命中（拦截关闭，默认）');
  const art = await post('/api/cms-articles', { title: '含敏感词文章', status: 'draft', content: '<p>涉及暴力内容测试</p>' });
  check('保存成功', art.success === true);
  if (art.success) {
    created.push('art:' + art.id);
    check('响应带回 sensitive_hits 含暴力', Array.isArray(art.sensitive_hits) && art.sensitive_hits.includes('暴力'));
    const detail = await get('/api/cms-articles/' + art.id);
    check('详情 sensitive_hits 持久化', Array.isArray(detail.sensitive_hits) && detail.sensitive_hits.includes('暴力'));
  }

  console.log('5) 开启拦截后保存被拒');
  await post('/api/sensitive-words/config', { block: true });
  const blocked = await post('/api/cms-articles', { title: '拦截测试', status: 'published', content: '<p>包含赌博字样</p>' });
  check('命中敏感词被拦截(400 风格)', blocked.success === false && Array.isArray(blocked.hits) && blocked.hits.includes('赌博'));
  // 复位拦截开关，避免影响其他测试
  await post('/api/sensitive-words/config', { block: false });

  console.log('6) 清理');
  for (const c of created) {
    if (c.startsWith('art:')) await del('/api/cms-articles/' + c.slice(4));
    else await del('/api/sensitive-words/' + c);
  }
  const after = await get('/api/sensitive-words');
  check('测试词已清理', !after.some(w => (w.id || '').startsWith('sw_') === false && (w.word || '').includes('测试违禁词')));

  console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('ERR', e); process.exit(2); });
