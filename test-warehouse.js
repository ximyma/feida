require('./fetch-polyfill');
// 仓库与库存管理 端到端测试
const BASE = process.env.BASE || 'http://localhost:3000';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✅', m); } else { fail++; console.log('  ❌', m); } };

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

(async () => {
  console.log('=== 仓库与库存管理测试 ===');

  // 1. 默认仓库已播种
  const whs = await api('GET', '/api/shop-warehouses');
  ok(Array.isArray(whs.data) && whs.data.some(w => w.is_default), '默认仓库(总仓)已存在');
  const def = whs.data.find(w => w.is_default) || whs.data[0];
  const wid = def.id;

  // 2. 新增仓库
  const nw = await api('POST', '/api/shop-warehouses', { name: '华东仓', code: 'EAST', contact: '张三' });
  ok(nw.data && nw.data.success && nw.data.id, '新增仓库 华东仓 成功');
  const wid2 = nw.data.id;

  // 3. 库存调整（入库 +50 到默认仓）
  const before = await api('GET', '/api/shop-goods/' + 'g_001').catch(() => null);
  const goodsBefore = before && before.data ? (before.data.stock || 0) : 0;
  const wgBefore = await api('GET', '/api/shop-warehouse-goods?warehouse_id=' + wid);
  const wgBeforeStock = (wgBefore.data.find(x => x.goods_id === 'g_001') || {}).stock || 0;
  const adj = await api('POST', '/api/shop-warehouse/adjust', { warehouse_id: wid, goods_id: 'g_001', sku_code: 'SKU001', num: 50, type: 'in', remark: '测试入库' });
  ok(adj.data && adj.data.success, '默认仓 g_001 入库 +50 成功');

  const wg = await api('GET', '/api/shop-warehouse-goods?warehouse_id=' + wid);
  const wgItem = wg.data.find(x => x.goods_id === 'g_001');
  ok(wgItem && wgItem.stock === wgBeforeStock + 50, '默认仓 g_001 入库后 = ' + wgBeforeStock + '+50 (实际 ' + (wgItem && wgItem.stock) + ')');

  const gAfter = await api('GET', '/api/shop-goods/' + 'g_001');
  ok(gAfter.data && gAfter.data.stock === goodsBefore + 50, '商品总库存同步 +50 (原 ' + goodsBefore + ' → ' + (gAfter.data && gAfter.data.stock) + ')');

  // 4. 出库 -20
  const wgMid = await api('GET', '/api/shop-warehouse-goods?warehouse_id=' + wid);
  const wgMidStock = (wgMid.data.find(x => x.goods_id === 'g_001') || {}).stock || 0;
  await api('POST', '/api/shop-warehouse/adjust', { warehouse_id: wid, goods_id: 'g_001', num: -20, type: 'out', remark: '测试出库' });
  const wg2 = await api('GET', '/api/shop-warehouse-goods?warehouse_id=' + wid);
  const wgItem2 = wg2.data.find(x => x.goods_id === 'g_001');
  ok(wgItem2 && wgItem2.stock === wgMidStock - 20, '默认仓 g_001 出库 -20 后 = ' + wgMidStock + '-20 (实际 ' + (wgItem2 && wgItem2.stock) + ')');

  // 5. 库存日志
  const logs = await api('GET', '/api/shop-stock-logs?goods_id=g_001');
  ok(Array.isArray(logs.data) && logs.data.length >= 2, '库存变动日志 >= 2 条 (实际 ' + (logs.data ? logs.data.length : 0) + ')');
  ok(logs.data.some(l => l.type === 'in' && l.num === 50), '日志含 入库+50');
  ok(logs.data.some(l => l.type === 'out' && l.num === -20), '日志含 出库-20');

  // 6. 下单支付联动扣库存
  const stockBeforePay = (await api('GET', '/api/shop-goods/' + 'g_001')).data.stock;
  const ord = await api('POST', '/api/shop-orders', { user_id: 'u_wh_test', user_name: 'WH', items: [{ goods_id: 'g_001', goods_name: '测试', price: 10, quantity: 3 }] });
  ok(ord.data && ord.data.id, '创建订单(数量3)成功');
  const pay = await api('POST', '/api/shop-orders/' + ord.data.id + '/pay', { payment_method: 'online' });
  ok(pay.data && pay.data.success, '订单支付成功，触发库存扣减');
  const stockAfterPay = (await api('GET', '/api/shop-goods/' + 'g_001')).data.stock;
  ok(stockAfterPay === stockBeforePay - 3, '支付后商品总库存 -3 (' + stockBeforePay + ' → ' + stockAfterPay + ')');
  const orderLogs = await api('GET', '/api/shop-stock-logs?goods_id=g_001&type=order');
  ok(orderLogs.data.some(l => l.num === -3), '库存日志含 订单扣减-3');

  // 7. 删除新增仓库
  const del = await api('DELETE', '/api/shop-warehouses/' + wid2);
  ok(del.data && del.data.success, '删除华东仓成功');

  console.log(`\n=== 结果: ${pass} 通过 / ${fail} 失败 ===`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('测试异常', e); process.exit(1); });
