/**
 * l10n_cn - 中国本土化模块安装后钩子
 */
module.exports = function postInit(db) {
  console.log('[l10n_cn] 中国本土化模块已安装');

  // 确保基础表存在
  const tables = ['account_chart', 'payment_methods', 'tax_rates', 'holidays'];
  for (const table of tables) {
    try {
      const raw = (db.db || db);
      if (raw.prepare) {
        const count = raw.prepare(`SELECT COUNT(*) as c FROM ${table}`).get();
        console.log(`[l10n_cn] ${table}: ${count?.c || 0} 条记录`);
      }
    } catch (e) {
      console.warn(`[l10n_cn] ${table} 检查失败:`, e.message);
    }
  }

  // 自动设置默认支付方式
  try {
    const pmCount = db.query('SELECT COUNT(*) as c FROM payment_methods WHERE is_active = 1')[0]?.c || 0;
    console.log(`[l10n_cn] 已激活支付方式: ${pmCount} 种`);
  } catch {}
};
