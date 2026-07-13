require('./fetch-polyfill');
// 验证 #99 智能标签：suggest-tags 接口
const BASE = process.env.BASE || 'http://localhost:3000';
const post = (path, body) => fetch(BASE + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
}).then(r => r.json());

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; console.log('  PASS', name); } else { fail++; console.log('  FAIL', name); } };

(async () => {
  // 先创建一篇带已知标签的文章，作为词库来源
  const seed = await post('/api/cms-articles', {
    title: '行业动态：人工智能在HR领域的应用', channel_id: 'ch_001', status: 'published',
    content: '<p>人工智能技术正在改变人力资源管理模式。机器学习帮助企业进行人才招聘，大模型提升培训效率。</p>',
    tags: ['行业动态', '人工智能']
  });

  console.log('1) 词库命中：标题/正文含已有标签');
  const r1 = await post('/api/cms-articles/suggest-tags', {
    title: '行业动态周报：人工智能发展新趋势',
    content: '<p>本周人工智能领域又有新突破，大模型在培训场景落地。机器学习岗位需求上升。</p>'
  });
  console.log('   suggestions =', JSON.stringify(r1.suggestions));
  check('返回数组', Array.isArray(r1.suggestions));
  check('命中已有标签"行业动态"', r1.suggestions.includes('行业动态'));
  check('命中已有标签"人工智能"', r1.suggestions.includes('人工智能'));

  console.log('2) 新词挖掘：高频 CJK 短语（去碎片，保留完整短语）');
  const r2 = await post('/api/cms-articles/suggest-tags', {
    title: '区块链技术应用分析',
    content: '<p>区块链技术支持供应链金融。区块链技术支持数据安全。区块链技术应用广泛，提升信任机制。</p>'
  });
  console.log('   suggestions =', JSON.stringify(r2.suggestions));
  check('挖掘出含"区块链"的完整短语', r2.suggestions.some(s => s.includes('区块链')));
  check('不含纯碎片"区块"', !r2.suggestions.includes('区块'));
  check('不含纯碎片"链技"', !r2.suggestions.includes('链技'));

  console.log('3) 空输入防空');
  const r3 = await post('/api/cms-articles/suggest-tags', { title: '', content: '' });
  check('空输入返回空数组', Array.isArray(r3.suggestions) && r3.suggestions.length === 0);

  console.log('4) 上限控制');
  check('建议数不超过 12', r1.suggestions.length <= 12);

  // 清理种子文章
  if (seed.id) await fetch(BASE + '/api/cms-articles/' + seed.id, { method: 'DELETE' });

  console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('ERR', e); process.exit(2); });
