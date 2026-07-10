// 商城模拟数据 v2 — 修正字段名
const BASE = process.env.BASE || 'http://localhost:3400';
const API = (path, opts = {}) => fetch(BASE + '/api' + path, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log(' ✅', msg); } else { fail++; console.log(' ❌', msg); } }

async function main() {
  // ---- 品牌 ----
  console.log('=== 品牌 ===\n');
  const brands = [
    { name: '飞达自营', logo_url: 'https://picsum.photos/100/100?random=10', description: '飞达自有品牌', sort_order: 1 },
    { name: 'TechGear', logo_url: 'https://picsum.photos/100/100?random=11', description: '科技装备品牌', sort_order: 2 },
    { name: 'SmartLife', logo_url: 'https://picsum.photos/100/100?random=12', description: '智能生活品牌', sort_order: 3 },
  ];
  for (const b of brands) {
    const r = await API('/shop-brands', { method: 'POST', body: JSON.stringify(b) });
    ok(r.success || r.id, b.name + (r.success||r.id ? '' : ' ' + JSON.stringify(r)));
  }

  // ---- 商品 ----
  console.log('\n=== 商品 ===\n');
  const goods = [
    { name: '智能办公本 Pro', price: 2999, original_price: 3999, stock: 500, unit: '台', images: JSON.stringify(['https://picsum.photos/800/800?random=20','https://picsum.photos/800/800?random=21']), description: 'AI语音转写·手写笔记·云端同步' },
    { name: '飞达AI学习机', price: 1999, original_price: 2599, stock: 800, unit: '台', images: JSON.stringify(['https://picsum.photos/800/800?random=30']), description: '个性化学习·智能推荐·家长管控' },
    { name: '无线降噪耳机 X1', price: 599, original_price: 799, stock: 2000, unit: '副', images: JSON.stringify(['https://picsum.photos/800/800?random=40']), description: 'ANC主动降噪·40h续航·Hi-Res音质' },
    { name: '智能手表 S3', price: 1299, original_price: 1599, stock: 1200, unit: '块', images: JSON.stringify(['https://picsum.photos/800/800?random=50']), description: '健康监测·运动模式·7天续航' },
    { name: '便携蓝牙音箱 B2', price: 299, original_price: 399, stock: 3000, unit: '台', images: JSON.stringify(['https://picsum.photos/800/800?random=60']), description: 'IPX7防水·20h播放·TWS串联' },
    { name: '企业定制礼盒套装', price: 399, original_price: 599, stock: 500, unit: '套', images: JSON.stringify(['https://picsum.photos/800/800?random=70']), description: '钢笔·记事本·保温杯·U盘' },
    { name: '无线充电板 Pad', price: 149, original_price: 199, stock: 5000, unit: '个', images: JSON.stringify(['https://picsum.photos/800/800?random=80']), description: '15W快充·双设备·超薄' },
    { name: '机械键盘 K87', price: 699, original_price: 899, stock: 600, unit: '把', images: JSON.stringify(['https://picsum.photos/800/800?random=90']), description: 'Cherry轴·RGB背光·热插拔' },
  ];
  for (const g of goods) {
    const r = await API('/shop-goods', { method: 'POST', body: JSON.stringify(g) });
    ok(!!r.id, g.name + (r.id ? '' : ' ' + (r.message||r.error||'')));
  }

  // ---- 优惠券 ----
  console.log('\n=== 优惠券 ===\n');
  const coupons = [
    { name: '新用户专享券', type: 'fixed', value: 50, min_amount: 200, total: 1000, status: 1 },
    { name: '满500减80', type: 'fixed', value: 80, min_amount: 500, total: 500, status: 1 },
    { name: '9折优惠券', type: 'percent', value: 10, min_amount: 100, total: 2000, status: 1 },
  ];
  for (const c of coupons) {
    const r = await API('/shop-coupons', { method: 'POST', body: JSON.stringify(c) });
    ok(r.success || r.id, c.name + (r.success||r.id ? '' : ' ' + JSON.stringify(r)));
  }

  console.log(`\n========== 完成：${pass} 通过 / ${fail} 失败 ==========`);
}

main().catch(e => { console.error(e); process.exit(1); });
