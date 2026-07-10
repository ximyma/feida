// 新功能后端验证：地区数据 / 支付方式 / 系统配置 / 页面装修 / 线下支付
const BASE = process.env.BASE || 'http://localhost:3400';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓', m); } else { fail++; console.log('  ✗', m); } };
async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method, headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = text; }
  return { status: res.status, data };
}

(async () => {
  console.log('--- 地区数据 ---');
  const provinces = await api('GET', '/api/shop-region?parent_id=0');
  ok(Array.isArray(provinces.data) && provinces.data.length >= 30, '省级列表 >=30 条 (实际 ' + (provinces.data && provinces.data.length) + ')');
  const p0 = provinces.data[0];
  const cities = await api('GET', '/api/shop-region?parent_id=' + p0.id);
  ok(Array.isArray(cities.data) && cities.data.length > 0, p0.name + ' 下级城市 >0 (实际 ' + (cities.data && cities.data.length) + ')');
  const c0 = cities.data[0];
  const districts = await api('GET', '/api/shop-region?parent_id=' + c0.id);
  ok(Array.isArray(districts.data), c0.name + ' 下级区县可查询 (实际 ' + (districts.data && districts.data.length) + ')');

  console.log('--- 支付方式 ---');
  const pms = await api('GET', '/api/shop-pay-methods');
  ok(Array.isArray(pms.data) && pms.data.some(x => x.type === 'online') && pms.data.some(x => x.type === 'offline'), '含 在线 + 线下 支付方式');
  const off = pms.data.find(x => x.type === 'offline');
  await api('PUT', '/api/shop-pay-methods/' + off.id, { is_open: 1 });
  ok(true, '线下支付方式可更新状态');

  console.log('--- 系统配置 ---');
  const sc0 = await api('GET', '/api/sys-config');
  ok(sc0.data && sc0.data.site_theme, '系统配置含 site_theme (' + (sc0.data && sc0.data.site_theme) + ')');
  await api('PUT', '/api/sys-config', { site_name: '飞达测试商城', site_theme: 'red' });
  const sc1 = await api('GET', '/api/sys-config');
  ok(sc1.data.site_name === '飞达测试商城' && sc1.data.site_theme === 'red', '系统配置更新生效');

  console.log('--- 页面装修 ---');
  const pc = await api('POST', '/api/shop-page-design', { page_key: 'test_page', title: '测试页', blocks: [{ id: 'b1', type: 'text', title: 'T', content: 'hi' }] });
  ok(pc.data && pc.data.success, '创建装修页成功');
  const plist = await api('GET', '/api/shop-page-design');
  ok(Array.isArray(plist.data) && plist.data.some(x => x.page_key === 'test_page'), '装修页列表包含新建页');
  const pid = plist.data.find(x => x.page_key === 'test_page').id;
  await api('PUT', '/api/shop-page-design/' + pid, { title: '测试页改', blocks: [{ id: 'b1', type: 'banner', title: 'B', image: 'x' }] });
  const plist2 = await api('GET', '/api/shop-page-design?page_key=test_page');
  ok(plist2.data[0].title === '测试页改' && JSON.parse(plist2.data[0].blocks)[0].type === 'banner', '装修页更新生效');
  await api('DELETE', '/api/shop-page-design/' + pid);
  const plist3 = await api('GET', '/api/shop-page-design');
  ok(!plist3.data.some(x => x.id === pid), '装修页删除成功');

  console.log('--- 线下支付流程 ---');
  const before = await api('GET', '/api/shop-goods/g_001');
  const stockBefore = before.data.stock;
  const o = await api('POST', '/api/shop-orders', { user_id: 'u_offline_test', user_name: 'Offline', items: [{ goods_id: 'g_001', goods_name: 'x', price: 50, quantity: 2 }] });
  ok(o.data && o.data.id, '创建订单成功');
  const pay = await api('POST', '/api/shop-orders/' + o.data.id + '/pay', { payment_method: 'offline' });
  ok(pay.data && pay.data.success && pay.data.pay_type === 'offline', '线下支付提交成功(待确认)');
  const ord1 = await api('GET', '/api/shop-orders/' + o.data.id);
  ok(ord1.data.pay_status === 'offline_pending' && ord1.data.order_status === 'offline_pending', '订单状态=线下待确认');
  const confirm = await api('POST', '/api/shop-orders/' + o.data.id + '/confirm-pay');
  ok(confirm.data && confirm.data.success, '管理员确认收款成功');
  const ord2 = await api('GET', '/api/shop-orders/' + o.data.id);
  ok(ord2.data.pay_status === 'paid' && ord2.data.order_status === 'paid', '确认后订单生效(paid)');
  const after = await api('GET', '/api/shop-goods/g_001');
  ok(after.data.stock === stockBefore - 2, '确认收款后库存扣减 (-2): ' + stockBefore + '→' + after.data.stock);

  console.log('\n结果: ' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('测试异常', e); process.exit(1); });
