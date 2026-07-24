# 第 11 章 · 商城 ShopXO 超集：库存联动与售后状态机

> Sowork AI 企业智能ERP系统 · 代码级技术教程
> 源码锚点：`server/standalone.ts`（库存助手 8871~8889、支付收尾 10894~10902、支付端点 10904~10957、售后回滚 10963~10971、售后状态机 10984~11047）

---

## 学习目标

- 读懂"库存变动助手"`applyStockChange`：一处封装商品总库存 + 仓库库存 + 流水日志
- 精读订单支付如何联动扣减库存（在线支付 + 线下支付两条路径）
- 逐段读懂售后状态机：仅退款 vs 退货退款两条流转线，以及退货如何自动回库
- 理解"防重复回滚"的设计（`received_at` 去重）
- （管理者）理解库存准确性、资金安全、售后闭环的业务价值

---

## 核心概念：Sowork AI 商城是 ShopXO 免费版的"超集"

Sowork AI 的商城模块参照 ShopXO 6.9。关键背景（见项目源码对照结论）：**ShopXO 6.9 免费版的优惠券/秒杀/拼团/砍价/分销都是官方付费插件，源码不含实现**。Sowork AI 把这些统统自建了，所以是免费版的**超集**。

本章聚焦商城最核心、最容易出错的两块：**库存联动**和**售后状态机**。这两块一旦出错，直接影响真金白银——库存算错会超卖，售后回滚漏掉会丢库存。

核心数据表：

```
shop_goods              商品（含 stock 总库存）
shop_orders             订单（pay_status/order_status/pay_method/paid_at…）
shop_order_items        订单明细
shop_warehouse          仓库（is_default 标记默认仓）
shop_warehouse_goods    仓库-商品库存
shop_stock_logs         库存流水（每次变动一条）
shop_order_aftersale    售后单（状态机核心）
shop_order_logs         订单操作追溯日志
```

---

## 源码剖析一：库存变动助手（一处封装，三处生效）

所有库存增减都走同一个助手函数，这是保证库存一致性的关键。源码在 `server/standalone.ts:8871-8889`：

```ts
// server/standalone.ts:8871-8889
// 库存变动助手：更新商品总库存 + 仓库库存 + 写日志（被手动调整与下单支付复用）
const applyStockChange = (warehouseId: string | null, goodsId: string, skuCode: string, num: number, type: string, remark: string, operator: string) => {
  const g = db.findById('shop_goods', goodsId);
  if (g) db.update('shop_goods', goodsId, { stock: Math.max(0, (g.stock || 0) + num) });
  let after = 0;
  if (warehouseId) {
    const allWg = db.findWhere('shop_warehouse_goods', { warehouse_id: warehouseId }) as any[];
    let wg = allWg.find((x: any) => x.goods_id === goodsId);
    if (!wg) { wg = { id: 'swg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), warehouse_id: warehouseId, goods_id: goodsId, sku_code: skuCode || '', stock: 0, freeze_stock: 0 }; db.insert('shop_warehouse_goods', wg); }
    after = Math.max(0, (wg.stock || 0) + num);
    db.update('shop_warehouse_goods', wg.id, { stock: after, sku_code: skuCode || wg.sku_code || '' });
  }
  db.insert('shop_stock_logs', {
    id: 'sl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    warehouse_id: warehouseId, goods_id: goodsId, sku_code: skuCode || '',
    type, num, after_stock: after, remark: remark || '', operator: operator || '',
    created_at: new Date().toISOString()
  });
};
```

逐段拆解这个"库存的唯一入口"：

1. **`num` 是有符号增量**：正数入库，负数出库。调用方传 `-(quantity)` 表示扣减，传 `+quantity` 表示回库——**加减用同一函数，不写两套逻辑**。
2. **`Math.max(0, ...)`**：库存永不为负。即使并发导致算出负数，也兜底为 0。
3. **双层库存**：既更新商品总库存（`shop_goods.stock`），又更新指定仓库的库存（`shop_warehouse_goods.stock`）。仓库不存在该商品记录时**自动创建**（`if (!wg)`）。
4. **强制写流水**：每次变动都往 `shop_stock_logs` 插一条，记录 `type`（order/return/manual…）、`num`、`after_stock`、操作人。**库存的每一分变动都可追溯**。

🔑 **为什么必须封装成一个函数？** 库存变动发生在很多地方：下单支付扣减、售后退货回滚、手动盘点调整。如果每处各写一遍"改总库存 + 改仓库库存 + 写日志"，迟早会有地方漏写日志或漏改某一层，导致库存对不上。**一处封装 = 一致性保证**。这是全章最重要的工程原则。

---

## 源码剖析二：支付联动扣减库存

订单支付成功后，收尾函数 `finalizePaidOrder` 会调用库存助手扣减。核心片段在 `server/standalone.ts:10894-10902`：

```ts
// server/standalone.ts:10894-10902
// 库存扣减：支付成功后按订单明细扣减商品总库存与默认仓库库存
try {
  const wh = (db.findOne('shop_warehouse', { is_default: 1 }) as any) || (db.findAll('shop_warehouse') as any[])[0];
  const items = db.findWhere('shop_order_items', { order_id: order.id }) as any[];
  items.forEach((it: any) => {
    applyStockChange(wh ? wh.id : null, it.product_id, it.sku || '', -(it.quantity || 0), 'order', '订单支付扣减 #' + order.order_no, 'system');
  });
} catch (e) { console.error('库存扣减失败', e); }
```

要点：

1. **默认仓优先**：`findOne({ is_default: 1 })` 找默认仓，没有则取第一个仓。扣减记在这个仓上。
2. **遍历订单明细扣减**：每个 `shop_order_items` 调一次 `applyStockChange`，传 `-(it.quantity)`（负数 = 扣减），`type='order'`。
3. **`try/catch` 包裹**：库存扣减失败不影响支付流程主线（但会打日志）。

**关键时机问题：为什么在"支付成功"而不是"下单"时扣库存？** 因为下单未付款的订单可能被取消，若下单就扣库存，取消后要回补，逻辑更复杂且容易超卖。**"付款成功才扣"** 是电商的通行做法。

支付端点区分在线/线下两条路径（`server/standalone.ts:10904-10936`）：

```ts
// server/standalone.ts:10914-10935（节选）
const pm = payment_method || 'online';
// 线下支付：提交后等待管理员确认收款
if (pm === 'offline') {
  db.update('shop_orders', req.params.id, {
    pay_status: 'offline_pending', pay_method: 'offline',
    order_status: 'offline_pending', paid_at: null
  });
  logOrder(req.params.id, 'pay_offline_pending', '提交线下支付，待管理员确认', 'user');
  res.json({ success: true, message: '已提交线下支付，等待管理员确认收款', pay_type: 'offline' });
  return;
}
// 在线支付：直接置为已支付并收尾
db.update('shop_orders', req.params.id, { pay_status: 'paid', pay_method: 'online', paid_at: new Date().toISOString() });
logOrder(req.params.id, 'paid', '在线支付成功', 'user');
finalizePaidOrder(order);   // ← 这里触发库存扣减
```

- **在线支付**：立即置 `paid` 并调 `finalizePaidOrder`（扣库存）。
- **线下支付**：先置 `offline_pending`，等管理员在后台 `/confirm-pay`（`server/standalone.ts:10939-10957`）确认收款后，才 `finalizePaidOrder`。

🔑 注意字段命名（项目 schema 铁律）：`shop_orders` 用的是 `pay_method / paid_at / order_status / pay_status`——**不是** `payment_method / payment_time`。改这块代码务必对齐字段名，否则数据写不进去。

---

## 源码剖析三：售后状态机（本章重头戏）

售后是电商最复杂的流程之一，因为它牵涉资金退回和货物回流。源码把状态机注释写得很清楚（`server/standalone.ts:10959-10962`）：

```
仅退款(refund):  pending → approved → refunded | rejected
退货退款(return): pending → approved → return_shipped → return_received → refunded | rejected
```

两条线的区别：**仅退款**不涉及货物回流（比如虚拟商品、少发货补偿）；**退货退款**要等买家寄回、商家收货，才退款并回库。

售后申请提交（`server/standalone.ts:10984-11000`）——注意防重设计：

```ts
// server/standalone.ts:10984-10999（节选）
router.post('/shop-order-aftersale', (req, res) => {
  const { order_id, user_id, type, reason, refund_amount, description, order_goods_id, images } = req.body;
  if (!order_id || !type) return res.status(400).json({ success: false, message: '缺少参数' });
  if (!['refund', 'return'].includes(type)) return res.status(400).json({ success: false, message: '售后类型无效' });
  // 防重：同一订单已有非 rejected 售后单则拦截
  const existing = (db.findWhere('shop_order_aftersale', { order_id }) as any[]).filter((r: any) => r.status !== 'rejected');
  if (existing.length) return res.status(400).json({ success: false, message: '该订单已有售后申请，无法重复提交' });
  const id = 'as_' + Date.now();
  db.insert('shop_order_aftersale', { id, order_id, /* … */ type, status: 'pending', created_at: new Date().toISOString() });
  const order = db.findById('shop_orders', order_id);
  if (order) db.update('shop_orders', order_id, { order_status: 'refunding' });
  res.json({ success: true, id });
});
```

**防重逻辑**：同一订单若已有非 `rejected` 的售后单，拒绝新申请。这样一个订单同一时间只有一个"活的"售后流程，避免重复退款。被拒绝（`rejected`）的可以重新申请。

状态流转的核心（`server/standalone.ts:11024-11045`）——每个状态触发不同的库存/订单动作：

```ts
// server/standalone.ts:11024-11045
const st = newStatus || as.status;
const order = db.findById('shop_orders', as.order_id) as any;
const operator = body.reviewer || 'admin';
if (st === 'approved') {
  db.update('shop_orders', as.order_id, { order_status: 'refunding' });
  logOrder(as.order_id, 'aftersale_approved', '售后申请通过（' + (as.type === 'return' ? '退货退款' : '仅退款') + '）', operator);
} else if (st === 'rejected') {
  const back = order && order.pay_status === 'paid' ? 'paid' : 'completed';
  db.update('shop_orders', as.order_id, { order_status: back });
  logOrder(as.order_id, 'aftersale_rejected', '售后申请被拒绝' + (body.reject_reason ? '：' + body.reject_reason : ''), operator);
} else if (st === 'return_received') {
  // 商家收货确认 → 商品回库（仅退货类型，且此前未回滚过）
  if (as.type === 'return' && !as.received_at) restoreAftersaleStock(as.order_id);
  db.update('shop_orders', as.order_id, { order_status: 'refunding' });
  logOrder(as.order_id, 'aftersale_received', '商家已收货，待退款', operator);
} else if (st === 'refunded') {
  // 退货类型若此前未走收货回滚，则在此补回滚，避免丢库存
  if (as.type === 'return' && !as.received_at) restoreAftersaleStock(as.order_id);
  db.update('shop_order_aftersale', req.params.id, { refunded_at: now });
  db.update('shop_orders', as.order_id, { order_status: 'refunded' });
  logOrder(as.order_id, 'aftersale_refunded', '退款完成' + (body.refund_method ? '（' + body.refund_method + '）' : ''), operator);
}
```

逐个状态解读：

- **`approved`**：审核通过，订单进入 `refunding`。此时还没退款也没回库——退货类型还要等买家寄回。
- **`rejected`**：拒绝，订单状态回退到 `paid` 或 `completed`（看之前的支付状态），不动库存。
- **`return_received`**：**商家确认收到退货 → 回库**。调用 `restoreAftersaleStock` 把库存加回来。
- **`refunded`**：退款完成，订单置 `refunded`，记录 `refunded_at`。

---

## 源码剖析四：防重复回滚（`received_at` 去重）

看上面 `return_received` 和 `refunded` 两个分支，都有同一个守卫：

```ts
if (as.type === 'return' && !as.received_at) restoreAftersaleStock(as.order_id);
```

这里藏着一个精妙的**幂等设计**。回库函数本身（`server/standalone.ts:10963-10971`）：

```ts
// server/standalone.ts:10963-10971
const restoreAftersaleStock = (orderId: string) => {
  try {
    const wh = (db.findOne('shop_warehouse', { is_default: 1 }) as any) || (db.findAll('shop_warehouse') as any[])[0];
    const items = db.findWhere('shop_order_items', { order_id: orderId }) as any[];
    items.forEach((it: any) => {
      applyStockChange(wh ? wh.id : null, it.product_id, it.sku || '', (it.quantity || 0), 'return', '售后退货回滚 #' + orderId, 'system');
    });
  } catch (e) { console.error('售后库存回滚失败', e); }
};
```

注意它传的是 `+(it.quantity)`（正数 = 回库），复用同一个 `applyStockChange`。

**为什么要 `!as.received_at` 守卫？** 考虑这个坑：一个退货单可能先走 `return_received`（收货回库），再走 `refunded`（退款）。如果两个状态都无条件回库，库存就**加了两次**！

解决方案：`return_received` 时若还没回滚过（`!as.received_at`）就回库，且更新时会写入 `received_at`（`server/standalone.ts:11018`）。等到 `refunded` 时，`as.received_at` 已存在，守卫为 false，**不再重复回库**。

但代码还考虑了另一种路径：如果管理员直接把状态从 `approved` 跳到 `refunded`（跳过 `return_received`），此时 `received_at` 为空，`refunded` 分支的 `!as.received_at` 为 true，**补一次回库**——避免漏掉。

🔑 **这就是幂等 + 补偿的双保险**：无论走"收货→退款"还是"直接退款"，库存都恰好回滚一次，不多不少。这类"操作可能重复触发"的场景，去重标记（`received_at`）是标准解法。

---

## 实战代码：完整售后闭环

```bash
# 1. 用户申请退货退款
curl -X POST http://localhost:3000/api/shop-order-aftersale \
  -H "Content-Type: application/json" \
  -d '{"order_id":"o_123","user_id":"u_1","type":"return","reason":"尺码不合","refund_amount":199}'
# → {"success":true,"id":"as_1690000000000"}

# 2. 商家审核通过
curl -X PUT http://localhost:3000/api/shop-order-aftersale/as_1690000000000 \
  -H "Content-Type: application/json" -d '{"status":"approved","reviewer":"admin"}'

# 3. 商家确认收货（→ 自动回库）
curl -X PUT http://localhost:3000/api/shop-order-aftersale/as_1690000000000 \
  -H "Content-Type: application/json" -d '{"status":"return_received","reviewer":"admin"}'

# 4. 退款完成
curl -X PUT http://localhost:3000/api/shop-order-aftersale/as_1690000000000 \
  -H "Content-Type: application/json" -d '{"status":"refunded","refund_method":"原路退回"}'

# 5. 查库存流水，验证回库
curl "http://localhost:3000/api/shop-stock-logs?order_id=o_123"
# → 能看到 type='order'（下单扣减 -1）和 type='return'（售后回滚 +1）各一条
```

---

## 运行演示：用库存流水验证一致性

跑完上面的售后闭环后，查 `shop_stock_logs`，你会看到该商品恰好两条流水：一条 `order`（-N，支付扣减），一条 `return`（+N，售后回库）。总账相抵，库存回到售前水平。**如果你看到两条 `return` 流水，说明防重逻辑出了 bug**——这就是用流水日志做对账的价值。

---

## 管理者视角

| 关注点 | 商城模块给出的答案 |
|--------|--------------------|
| **库存准确性** | 所有变动走同一个 `applyStockChange`，双层库存 + 强制流水，杜绝"改了库存忘了记账"。 |
| **资金安全** | 库存"付款才扣"、售后"收货才回库/退款"，且防重复退款、防重复回库，避免资损。 |
| **售后可追溯** | 每个订单操作、每笔库存变动都写日志（`shop_order_logs` / `shop_stock_logs`），纠纷时有据可查。 |
| **线下场景兼容** | 支持线下支付（提交→管理员确认收款），适配 B 端对公转账、门店自提等真实业务。 |

给决策者一句话：**商城模块把"钱货一致"做进了每一个状态流转里——这是电商系统能不能上生产的分水岭**。

---

## 注意事项

- ⚠️ **库存变动只能走 `applyStockChange`**，绝不要在别处直接 `UPDATE shop_goods SET stock`，否则会漏写流水、漏更新仓库库存。
- ⚠️ **`shop_orders` 字段名是 `pay_method/paid_at/order_status/pay_status`**，不是 `payment_method/payment_time`。写错字段数据静默丢失。
- ⚠️ **售后回库的 `received_at` 去重不能删**——删了会导致"收货 + 退款"两次回库，库存虚高。
- ⚠️ **当前库存操作非事务/无行锁**（better-sqlite3 单进程串行，天然缓解，但高并发多实例部署时需加锁）。
- 🔑 库存"付款才扣"是刻意设计，理解这个时机才能正确扩展（如加"下单预占库存"需另设 `freeze_stock`）。

---

## 练习

1. 阅读 `applyStockChange`（8871 行），解释为什么它同时更新 `shop_goods.stock` 和 `shop_warehouse_goods.stock` 两处，而不是只留一处。
2. 画出退货退款的完整状态图，标注每个状态转移时对"库存"和"订单状态"分别做了什么。
3. **读源码猜作用**：售后申请时 `existing.filter(r => r.status !== 'rejected')` 排除了被拒的售后单。猜猜为什么被拒的单要允许重新申请。
4. 动手：故意把 `refunded` 分支的 `!as.received_at` 守卫去掉，走完"收货→退款"流程，查 `shop_stock_logs`，观察库存被回滚了几次，验证防重设计的必要性。

---

> **系列导航**：上一章 ← [第 10 章 · CMS 内容门户：富文本与标签智能提取](./10-CMS内容门户-富文本与标签智能提取.md) ｜ 下一章 → [第 12 章 · 企业级管控：RBAC 权限与 i18n 国际化](./12-企业级管控-RBAC权限与i18n.md)
