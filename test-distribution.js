// 分销功能端到端测试
const BASE = process.env.BASE || 'http://localhost:3400';
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
  console.log('=== 分销功能测试 ===');

  // 1. 全局配置
  const cfg = await api('GET', '/api/shop-distribution-config');
  ok(cfg.data && cfg.data.is_open === 1, '分销开关默认开启 (is_open=1)');
  ok(cfg.data && (cfg.data.level_mode || 1) >= 2, '分销层级 >= 2 级');

  // 2. 分销等级
  const lv = await api('GET', '/api/shop-distribution-levels');
  ok(Array.isArray(lv.data) && lv.data.length >= 2, `分销等级已播种 (${Array.isArray(lv.data) ? lv.data.length : 0} 个)`);
  const dl1 = lv.data.find(l => l.id === 'dl_1');
  ok(dl1 && dl1.rate1 === 0.10, '初级分销员一级佣金比例 = 10%');

  // 2.5 准备测试商品（订单明细外键引用 shop_goods）
  let pid = 'g_dist_test';
  const gl = await api('GET', '/api/shop-goods?pageSize=1');
  const glist = gl.data && (gl.data.list || gl.data);
  if (Array.isArray(glist) && glist.length) pid = glist[0].id;
  else {
    const g = await api('POST', '/api/shop-goods', { name: '分销测试商品', price: 100, stock: 999, category_id: '' });
    pid = g.data.id || (g.data.success ? 'g_' + Date.now() : pid);
  }
  ok(!!pid, '准备测试商品 id=' + pid);

  // 3. 申请分销商 A（无邀请码）
  const a = await api('POST', '/api/shop-distribution/apply', { user_id: 'u_dist_a', user_name: 'A' });
  ok(a.data && a.data.success && a.data.member && a.data.member.invite_code, 'A 申请成为分销商，获得邀请码: ' + (a.data.member && a.data.member.invite_code));
  const codeA = a.data.member.invite_code;

  // 4. B 用 A 的邀请码申请（绑定上级 A）
  const b = await api('POST', '/api/shop-distribution/apply', { user_id: 'u_dist_b', user_name: 'B', invite_code: codeA });
  ok(b.data && b.data.member && b.data.member.parent_id === 'u_dist_a', 'B 通过邀请码绑定上级 A');
  const codeB = b.data.member.invite_code;

  // 5. C 用 B 的邀请码申请（二级关系）
  const c = await api('POST', '/api/shop-distribution/apply', { user_id: 'u_dist_c', user_name: 'C', invite_code: codeB });
  ok(c.data && c.data.member && c.data.member.parent_id === 'u_dist_b', 'C 通过邀请码绑定上级 B（二级团队）');

  // 6. 团队结构
  const team = await api('GET', '/api/shop-distribution/team?user_id=u_dist_a');
  ok(team.data && team.data.directCount === 1, 'A 直推成员数 = 1 (B)');
  ok(team.data && team.data.teamCount === 2, 'A 团队总人数 = 2 (B + C)');

  // 7. B 下单并支付 -> A 获得一级佣金
  const ordB = await api('POST', '/api/shop-orders', { user_id: 'u_dist_b', user_name: 'B', items: [{ goods_id: pid, goods_name: '测试商品', price: 100, quantity: 1 }] });
  ok(ordB.data && ordB.data.id, 'B 创建订单成功, 金额 100');
  const payB = await api('POST', `/api/shop-orders/${ordB.data.id}/pay`, { payment_method: 'online' });
  ok(payB.data && payB.data.success, 'B 订单支付成功，触发佣金结算');

  const mA1 = await api('GET', '/api/shop-distribution-members?user_id=u_dist_a');
  const A1 = mA1.data[0];
  ok(A1 && A1.withdrawable >= 10, `A 可提现佣金 >= 10 (实际 ${A1 && A1.withdrawable})`);
  const odA1 = await api('GET', `/api/shop-distribution-orders?distributor_id=u_dist_a`);
  const commB = odA1.data.find(o => o.order_id === ordB.data.id);
  ok(commB && commB.commission === 10 && commB.distribute_level === 1, 'A 从 B 订单获得一级佣金 10 元');

  // 8. C 下单并支付 -> B 一级佣金 + A 二级佣金
  const ordC = await api('POST', '/api/shop-orders', { user_id: 'u_dist_c', user_name: 'C', items: [{ goods_id: pid, goods_name: '测试商品2', price: 200, quantity: 1 }] });
  ok(ordC.data && ordC.data.id, 'C 创建订单成功, 金额 200');
  const payC = await api('POST', `/api/shop-orders/${ordC.data.id}/pay`, { payment_method: 'online' });
  ok(payC.data && payC.data.success, 'C 订单支付成功');

  const mB = await api('GET', '/api/shop-distribution-members?user_id=u_dist_b');
  const Bm = mB.data[0];
  ok(Bm && Bm.withdrawable >= 20, `B 可提现佣金 >= 20 (实际 ${Bm && Bm.withdrawable})`);
  const odB = await api('GET', `/api/shop-distribution-orders?distributor_id=u_dist_b`);
  const commC1 = odB.data.find(o => o.order_id === ordC.data.id);
  ok(commC1 && commC1.commission === 20 && commC1.distribute_level === 1, 'B 从 C 订单获得一级佣金 20 元');

  const mA2 = await api('GET', '/api/shop-distribution-members?user_id=u_dist_a');
  const A2 = mA2.data[0];
  ok(A2 && A2.withdrawable >= 20, `A 累计可提现佣金 >= 20 (实际 ${A2 && A2.withdrawable})`);
  const odA2 = await api('GET', `/api/shop-distribution-orders?distributor_id=u_dist_a`);
  const commC2 = odA2.data.find(o => o.order_id === ordC.data.id);
  ok(commC2 && commC2.commission === 10 && commC2.distribute_level === 2, 'A 从 C 订单获得二级佣金 10 元');

  // 9. A 申请提现
  const beforeW = A2.withdrawable;
  const wd = await api('POST', '/api/shop-distribution-withdraw', { user_id: 'u_dist_a', user_name: 'A', amount: 5, account: '支付宝' });
  ok(wd.data && wd.data.success, 'A 申请提现 5 元');
  const mA3 = await api('GET', '/api/shop-distribution-members?user_id=u_dist_a');
  const A3 = mA3.data[0];
  ok(A3 && Math.abs(A3.withdrawable - (beforeW - 5)) < 0.01, `A 提现后可提现 = ${beforeW} - 5 = ${A3.withdrawable}`);
  ok(A3 && A3.withdrawn >= 5, `A 已提现 >= 5 (实际 ${A3.withdrawn})`);

  // 10. 后台审核提现（打款）
  const wlist = await api('GET', '/api/shop-distribution-withdraw?user_id=u_dist_a');
  const wid = wlist.data[0] && wlist.data[0].id;
  ok(!!wid, '存在提现申请记录');
  if (wid) {
    const done = await api('POST', `/api/shop-distribution-withdraw/${wid}/done`);
    ok(done.data && done.data.success, '后台打款成功');
    const wlist2 = await api('GET', '/api/shop-distribution-withdraw?user_id=u_dist_a');
    ok(wlist2.data[0] && wlist2.data[0].status === 'done', '提现状态变为已打款(done)');
  }

  console.log(`\n=== 结果: ${pass} 通过 / ${fail} 失败 ===`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('测试异常', e); process.exit(1); });
