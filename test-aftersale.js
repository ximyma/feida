// 售后退货退款 + 仅退款 + 退货物流 + 库存回滚 全流程验证
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
const getAs = async (oid, id) => {
  const r = await api('GET', '/api/shop-order-aftersale?order_id=' + oid);
  return Array.isArray(r.data) ? r.data.find(x => x.id === id) : null;
};

(async () => {
  const goodsId = 'g_001';
  const g0 = await api('GET', '/api/shop-goods/' + goodsId);
  const stockBefore = (g0.data && typeof g0.data.stock === 'number') ? g0.data.stock : null;
  console.log('商品', goodsId, '当前库存:', stockBefore);

  console.log('--- 售后：退货退款 + 库存回滚 ---');
  const o = await api('POST', '/api/shop-orders', { user_id: 'u_as_test', user_name: '售后测试', items: [{ goods_id: goodsId, goods_name: '测试商品', price: 50, quantity: 2 }] });
  ok(o.data && o.data.id, '创建订单成功');
  const orderId = o.data.id;
  await api('POST', '/api/shop-orders/' + orderId + '/pay', { payment_method: 'online' });
  const ordPaid = await api('GET', '/api/shop-orders/' + orderId);
  ok(ordPaid.data.pay_status === 'paid', '订单已支付(paid)');

  const as = await api('POST', '/api/shop-order-aftersale', { order_id: orderId, type: 'return', reason: '质量问题', refund_amount: 100 });
  ok(as.data && as.data.id, '提交退货退款申请成功');
  const asId = as.data.id;
  const asList = await api('GET', '/api/shop-order-aftersale?order_id=' + orderId);
  ok(asList.data[0].status === 'pending', '售后状态=待审核(pending)');
  const ordRefunding = await api('GET', '/api/shop-orders/' + orderId);
  ok(ordRefunding.data.order_status === 'refunding', '订单状态=refunding');

  await api('PUT', '/api/shop-order-aftersale/' + asId, { status: 'approved', reviewer: 'admin' });
  let a = await getAs(orderId, asId);
  ok(a.status === 'approved', '商家同意(approved)');

  await api('PUT', '/api/shop-order-aftersale/' + asId, { status: 'return_shipped', return_tracking_company: '顺丰', return_tracking_no: 'SF123456' });
  a = await getAs(orderId, asId);
  ok(a.status === 'return_shipped', '用户已寄回(return_shipped)');
  ok(a.return_tracking_no === 'SF123456', '退货物流单号已记录');

  await api('PUT', '/api/shop-order-aftersale/' + asId, { status: 'return_received' });
  a = await getAs(orderId, asId);
  ok(a.status === 'return_received', '商家已收货(return_received)');

  const logs = await api('GET', '/api/shop-stock-logs?goods_id=' + goodsId + '&type=return');
  ok(Array.isArray(logs.data) && logs.data.some(l => l.num > 0), '库存日志存在退货回滚(return, +' + (logs.data && logs.data.find(l => l.num > 0)?.num) + ')');
  const gReturned = await api('GET', '/api/shop-goods/' + goodsId);
  if (stockBefore !== null) ok(gReturned.data.stock === stockBefore, '商品库存已回滚(=' + stockBefore + ', 实际 ' + gReturned.data.stock + ')');

  await api('PUT', '/api/shop-order-aftersale/' + asId, { status: 'refunded', refund_method: 'original' });
  a = await getAs(orderId, asId);
  ok(a.status === 'refunded', '退款完成(refunded)');
  ok(!!a.refunded_at, '退款时间已记录');
  const ordRefunded = await api('GET', '/api/shop-orders/' + orderId);
  ok(ordRefunded.data.order_status === 'refunded', '订单状态=refunded');

  const dup = await api('POST', '/api/shop-order-aftersale', { order_id: orderId, type: 'return', reason: 'again' });
  ok(dup.status === 400, '重复售后申请被拦截(400)');

  console.log('--- 售后：仅退款(不回滚库存) ---');
  const o2 = await api('POST', '/api/shop-orders', { user_id: 'u_as_test2', user_name: '仅退款', items: [{ goods_id: goodsId, goods_name: 'x', price: 30, quantity: 1 }] });
  await api('POST', '/api/shop-orders/' + o2.data.id + '/pay', { payment_method: 'online' });
  const as2 = await api('POST', '/api/shop-order-aftersale', { order_id: o2.data.id, type: 'refund', reason: '不想要了', refund_amount: 30 });
  const logsBeforeRefund = await api('GET', '/api/shop-stock-logs?goods_id=' + goodsId + '&type=return');
  const returnCountBefore = logsBeforeRefund.data.length;
  await api('PUT', '/api/shop-order-aftersale/' + as2.data.id, { status: 'approved', reviewer: 'admin' });
  await api('PUT', '/api/shop-order-aftersale/' + as2.data.id, { status: 'refunded', refund_method: 'balance' });
  const a2 = await getAs(o2.data.id, as2.data.id);
  ok(a2.status === 'refunded', '仅退款完成(refunded)');
  const logsAfterRefund = await api('GET', '/api/shop-stock-logs?goods_id=' + goodsId + '&type=return');
  ok(logsAfterRefund.data.length === returnCountBefore, '仅退款不新增退货回滚日志(' + returnCountBefore + '→' + logsAfterRefund.data.length + ')');

  console.log('--- 售后：拒绝 ---');
  const o3 = await api('POST', '/api/shop-orders', { user_id: 'u_as_test3', user_name: '拒绝', items: [{ goods_id: goodsId, goods_name: 'x', price: 10, quantity: 1 }] });
  await api('POST', '/api/shop-orders/' + o3.data.id + '/pay', { payment_method: 'online' });
  const as3 = await api('POST', '/api/shop-order-aftersale', { order_id: o3.data.id, type: 'refund', reason: 'r' });
  await api('PUT', '/api/shop-order-aftersale/' + as3.data.id, { status: 'rejected', reviewer: 'admin', reject_reason: '不符合条件' });
  const a3 = await getAs(o3.data.id, as3.data.id);
  ok(a3.status === 'rejected', '已拒绝(rejected)');
  ok(a3.reject_reason === '不符合条件', '拒绝理由已记录');
  const ord3 = await api('GET', '/api/shop-orders/' + o3.data.id);
  ok(ord3.data.order_status === 'paid', '拒绝后订单退回paid');

  console.log(`\n结果: ${pass} 通过 / ${fail} 失败`);
  process.exit(fail ? 1 : 0);
})();
