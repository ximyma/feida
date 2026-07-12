// 验证 #98 内容标签：标签云聚合 + ?tag= 筛选（健壮版：支持重复运行）
const BASE = process.env.BASE || 'http://localhost:3400';
const post = (path, body) => fetch(BASE + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
}).then(r => r.json());
const get = (path) => fetch(BASE + path).then(r => r.json());
const del = (path) => fetch(BASE + path, { method: 'DELETE' }).then(r => r.json());

const created = [];
let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; console.log('  PASS', name); } else { fail++; console.log('  FAIL', name); } };

(async () => {
  // 清理可能残留的旧测试数据
  const oldFiltered = await get('/api/cms-articles?title=' + encodeURIComponent('标签测试') + '&pageSize=50');
  if (oldFiltered.list && oldFiltered.list.length > 0) {
    console.log('  清理残留测试文章:', oldFiltered.list.length, '篇');
    for (const a of oldFiltered.list) { await del('/api/cms-articles/' + a.id); }
  }

  // 记录基线标签云
  const cloud0 = await get('/api/cms-tags');
  const industryBefore = (cloud0.find(t => t.name === '行业动态') || { count: 0 }).count;

  console.log('1) 创建带标签的测试文章');
  const a1 = await post('/api/cms-articles', { title: '标签测试A', channel_id: 'ch_001', content: 'x', tags: ['行业动态', '技术分享'], status: 'published' });
  const a2 = await post('/api/cms-articles', { title: '标签测试B', channel_id: 'ch_001', content: 'x', tags: ['行业动态', '产品评测'], status: 'published' });
  const a3 = await post('/api/cms-articles', { title: '标签测试C', channel_id: 'ch_001', content: 'x', tags: ['企业文化'], status: 'published' });
  created.push(a1.id, a2.id, a3.id);
  check('三篇文章创建成功', a1.id && a2.id && a3.id);

  console.log('2) 标签云聚合');
  const cloud = await get('/api/cms-tags');
  const industry = cloud.find(t => t.name === '行业动态');
  const tech = cloud.find(t => t.name === '技术分享');
  // 相对检查：创建后比创建前多2篇
  const expectedIndustry = industryBefore + 2;
  check(`行业动态 count>=${expectedIndustry} (基线${industryBefore}+新建2)`, industry && industry.count >= expectedIndustry);
  check('技术分享 count>=1', tech && tech.count >= 1);
  check('聚合结果按 count 降序', cloud[0].count >= cloud[1].count);

  console.log('3) ?tag= 筛选');
  const filtered = await get('/api/cms-articles?tag=' + encodeURIComponent('行业动态') + '&pageSize=50');
  check('筛选 行业动态 至少命中 2 篇', (filtered.total || 0) >= 2);

  console.log('4) 详情返回 tags_list');
  const detail = await get('/api/cms-articles/' + a1.id);
  check('详情 tags_list 含 行业动态', Array.isArray(detail.tags_list) && detail.tags_list.includes('行业动态'));

  console.log('5) 清理测试文章');
  for (const id of created) { await del('/api/cms-articles/' + id); }
  const after = await get('/api/cms-articles?tag=' + encodeURIComponent('行业动态') + '&pageSize=50');
  const afterCount = after.total || 0;
  check(`清理后 行业动态 回归基线 (${industryBefore})`, afterCount === industryBefore);

  console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('ERR', e); process.exit(2); });
