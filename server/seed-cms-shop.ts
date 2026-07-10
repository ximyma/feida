/**
 * CMS + Shop 种子数据脚本
 * 在数据库初始化后运行，确保CMS网站和商城有初始内容
 */
function seedCmsShopData(db: any) {
  // CMS频道种子
  const channelCount = db.query("SELECT COUNT(*) as c FROM cms_channels") as any[];
  if (!channelCount.length || channelCount[0].c === 0) {
    db.insert('cms_channels', { id: 'ch_news', name: '公司新闻', code: 'news', parent_id: '', sort_order: 1 });
    db.insert('cms_channels', { id: 'ch_notice', name: '通知公告', code: 'notice', parent_id: '', sort_order: 2 });
    db.insert('cms_channels', { id: 'ch_culture', name: '企业文化', code: 'culture', parent_id: '', sort_order: 3 });
    db.insert('cms_channels', { id: 'ch_activity', name: '员工活动', code: 'activity', parent_id: '', sort_order: 4 });
  }

  // CMS文章种子
  const articleCount = db.query("SELECT COUNT(*) as c FROM cms_articles") as any[];
  if (!articleCount.length || articleCount[0].c === 0) {
    db.insert('cms_articles', { id: 'a_001', title: '飞达2026年度战略规划发布', channel_id: 'ch_news', summary: '公司发布2026年度战略规划', content: '<p>聚焦技术创新与市场深耕</p>', author: '系统管理员', view_count: 1520, is_recommend: 1, status: 'published', publish_time: new Date().toISOString() });
    db.insert('cms_articles', { id: 'a_002', title: '春节放假安排通知', channel_id: 'ch_notice', summary: '春节放假安排', content: '<p>2月10日至2月17日放假8天</p>', author: '行政部', view_count: 890, is_recommend: 1, status: 'published', publish_time: new Date().toISOString() });
    db.insert('cms_articles', { id: 'a_003', title: '优秀员工表彰大会', channel_id: 'ch_culture', summary: '年度优秀员工表彰', content: '<p>表彰大会圆满举办</p>', author: 'HR部', view_count: 420, is_recommend: 0, status: 'published', publish_time: new Date().toISOString() });
    db.insert('cms_articles', { id: 'a_004', title: '春季团建活动报名', channel_id: 'ch_activity', summary: '春季团建活动', content: '<p>3月20-21日深圳大鹏</p>', author: '行政部', view_count: 310, is_recommend: 1, status: 'published', publish_time: new Date().toISOString() });
    db.insert('cms_articles', { id: 'a_005', title: '新版HR系统V3.0上线', channel_id: 'ch_news', summary: 'HR系统全新升级', content: '<p>新增AI助手知识库等功能</p>', author: '技术部', view_count: 780, is_recommend: 1, status: 'published', publish_time: new Date().toISOString() });
  }

  // Shop分类种子
  const catCount = db.query("SELECT COUNT(*) as c FROM shop_categories") as any[];
  if (!catCount.length || catCount[0].c === 0) {
    db.insert('shop_categories', { id: 'scat_office', name: '办公用品', parent_id: '', sort_order: 1, is_show: 1 });
    db.insert('shop_categories', { id: 'scat_electronic', name: '电子产品', parent_id: '', sort_order: 2, is_show: 1 });
    db.insert('shop_categories', { id: 'scat_welfare', name: '员工福利', parent_id: '', sort_order: 3, is_show: 1 });
  }

  // Shop商品种子
  const goodsCount = db.query("SELECT COUNT(*) as c FROM shop_goods") as any[];
  if (!goodsCount.length || goodsCount[0].c === 0) {
    db.insert('shop_goods', { id: 'g_001', name: '飞达定制笔记本套装', category_id: 'scat_office', price: 68, original_price: 88, stock: 200, main_image: 'https://picsum.photos/seed/nb/400/400', sales_count: 56, is_hot: 1, is_recommend: 1, description: '高品质定制笔记本+钢笔套装', status: 'on' });
    db.insert('shop_goods', { id: 'g_002', name: '无线蓝牙降噪耳机', category_id: 'scat_electronic', price: 299, original_price: 499, stock: 50, main_image: 'https://picsum.photos/seed/hp/400/400', sales_count: 128, is_hot: 1, is_recommend: 1, description: 'ANC主动降噪40小时续航', status: 'on' });
    db.insert('shop_goods', { id: 'g_003', name: '便携移动电源20000mAh', category_id: 'scat_electronic', price: 89, original_price: 129, stock: 150, main_image: 'https://picsum.photos/seed/pb/400/400', sales_count: 203, is_hot: 1, is_recommend: 0, description: '大容量快充Type-C双向', status: 'on' });
    db.insert('shop_goods', { id: 'g_004', name: '企业定制保温杯', category_id: 'scat_office', price: 45, original_price: 65, stock: 300, main_image: 'https://picsum.photos/seed/cup/400/400', sales_count: 89, is_hot: 0, is_recommend: 1, description: '316不锈钢12小时保温', status: 'on' });
    db.insert('shop_goods', { id: 'g_005', name: '高档茶礼盒套装', category_id: 'scat_welfare', price: 168, original_price: 258, stock: 80, main_image: 'https://picsum.photos/seed/tea/400/400', sales_count: 45, is_hot: 0, is_recommend: 1, description: '精选龙井铁观音大红袍', status: 'on' });
    db.insert('shop_goods', { id: 'g_006', name: '无线充电鼠标垫', category_id: 'scat_electronic', price: 129, original_price: 169, stock: 120, main_image: 'https://picsum.photos/seed/pad/400/400', sales_count: 67, is_hot: 1, is_recommend: 0, description: '10W无线快充二合一', status: 'on' });
  }

  // Shop品牌种子
  const brandCount = db.query("SELECT COUNT(*) as c FROM shop_brands") as any[];
  if (!brandCount.length || brandCount[0].c === 0) {
    db.insert('shop_brands', { id: 'br_001', name: '得力', description: '办公文具领导品牌', sort_order: 1 });
    db.insert('shop_brands', { id: 'br_002', name: '晨光', description: '学生和办公文具品牌', sort_order: 2 });
    db.insert('shop_brands', { id: 'br_003', name: '小米', description: '智能电子产品品牌', sort_order: 3 });
    db.insert('shop_brands', { id: 'br_004', name: '华为', description: '通信和智能设备品牌', sort_order: 4 });
    db.insert('shop_brands', { id: 'br_005', name: '飞达定制', description: '企业专属定制品牌', sort_order: 5 });
  }

  // 支付方式种子
  const payCount = db.query("SELECT COUNT(*) as c FROM shop_payment_methods") as any[];
  if (!payCount.length || payCount[0].c === 0) {
    db.insert('shop_payment_methods', { id: 'pay_alipay', name: '支付宝', code: 'alipay', sort_order: 1, is_enable: 1, config: '{}' });
    db.insert('shop_payment_methods', { id: 'pay_wechat', name: '微信支付', code: 'wechat', sort_order: 2, is_enable: 1, config: '{}' });
    db.insert('shop_payment_methods', { id: 'pay_wallet', name: '余额支付', code: 'wallet', sort_order: 3, is_enable: 1, config: '{}' });
  }

  // 优惠券种子
  const couponCount = db.query("SELECT COUNT(*) as c FROM shop_coupons") as any[];
  if (!couponCount.length || couponCount[0].c === 0) {
    db.insert('shop_coupons', { id: 'cp_001', name: '新用户专享券', type: 'discount', value: 20, min_amount: 100, total: 100, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 30*86400000).toISOString(), description: '新用户首单满100减20' });
    db.insert('shop_coupons', { id: 'cp_002', name: '满减优惠券', type: 'reduction', value: 50, min_amount: 300, total: 200, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 60*86400000).toISOString(), description: '满300减50' });
    db.insert('shop_coupons', { id: 'cp_003', name: '全场9折券', type: 'discount', value: 10, min_amount: 0, total: 500, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 90*86400000).toISOString(), description: '全场商品9折优惠' });
  }

  // 会员等级种子
  const mlCount = db.query("SELECT COUNT(*) as c FROM shop_member_levels") as any[];
  if (!mlCount.length || mlCount[0].c === 0) {
    db.insert('shop_member_levels', { id: 'ml_1', name: '普通会员', level: 1, min_points: 0, discount: 1, icon: '👤', description: '注册即享基础权益' });
    db.insert('shop_member_levels', { id: 'ml_2', name: '银卡会员', level: 2, min_points: 500, discount: 0.95, icon: '🥈', description: '消费满500积分升级，享95折' });
    db.insert('shop_member_levels', { id: 'ml_3', name: '金卡会员', level: 3, min_points: 2000, discount: 0.9, icon: '🥇', description: '消费满2000积分升级，享9折' });
    db.insert('shop_member_levels', { id: 'ml_4', name: '钻石会员', level: 4, min_points: 5000, discount: 0.85, icon: '💎', description: '消费满5000积分升级，享85折' });
  }

  // 分销全局配置种子
  const dcCount = db.query("SELECT COUNT(*) as c FROM shop_distribution_config") as any[];
  if (!dcCount.length || dcCount[0].c === 0) {
    db.insert('shop_distribution_config', { id: 'dc_default', is_open: 1, level_mode: 2, settle_type: 'paid', commission_base: 'pay', created_at: new Date().toISOString() });
  }

  // 分销等级种子
  const dlCount = db.query("SELECT COUNT(*) as c FROM shop_distribution_levels") as any[];
  if (!dlCount.length || dlCount[0].c === 0) {
    db.insert('shop_distribution_levels', { id: 'dl_1', name: '初级分销员', level: 1, rate1: 0.10, rate2: 0.05, rate3: 0, icon: '🥉', description: '一级佣金10%，二级5%' });
    db.insert('shop_distribution_levels', { id: 'dl_2', name: '高级分销员', level: 2, rate1: 0.15, rate2: 0.08, rate3: 0.03, icon: '🏆', description: '一级15%，二级8%，三级3%' });
  }

  // 默认仓库种子
  const whCount = db.query("SELECT COUNT(*) as c FROM shop_warehouse") as any[];
  if (!whCount.length || whCount[0].c === 0) {
    db.insert('shop_warehouse', { id: 'wh_default', name: '总仓', code: 'WH001', address: '', contact: '', remark: '系统默认仓库', is_default: 1, status: 1, created_at: new Date().toISOString() });
  }

  // 拼团活动种子
  const gbCount = db.query("SELECT COUNT(*) as c FROM shop_group_buy") as any[];
  if (!gbCount.length || gbCount[0].c === 0) {
    db.insert('shop_group_buy', { id: 'gb_001', goods_id: 'g_001', group_price: 58, group_stock: 100, group_size: 3, limit_count: 1, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 15*86400000).toISOString(), status: 'ongoing' });
    db.insert('shop_group_buy', { id: 'gb_002', goods_id: 'g_002', group_price: 259, group_stock: 60, group_size: 2, limit_count: 1, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 15*86400000).toISOString(), status: 'ongoing' });
  }

  // 砍价活动种子
  const bgCount = db.query("SELECT COUNT(*) as c FROM shop_bargain") as any[];
  if (!bgCount.length || bgCount[0].c === 0) {
    db.insert('shop_bargain', { id: 'bg_001', goods_id: 'g_002', start_price: 299, floor_price: 199, bargain_stock: 50, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 15*86400000).toISOString(), status: 'ongoing' });
    db.insert('shop_bargain', { id: 'bg_002', goods_id: 'g_006', start_price: 129, floor_price: 89, bargain_stock: 40, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 15*86400000).toISOString(), status: 'ongoing' });
  }

  // CMS内容分组种子
  const cgCount = db.query("SELECT COUNT(*) as c FROM cms_content_groups") as any[];
  if (!cgCount.length || cgCount[0].c === 0) {
    db.insert('cms_content_groups', { id: 'cg_001', name: '公司动态精选', type: 'topic', description: '公司新闻与系统动态合集', image_url: 'https://picsum.photos/seed/news/400/200', article_ids: JSON.stringify(['a_001', 'a_005']), sort_order: 1, is_show: 1, created_at: new Date().toISOString() });
  }

  // 地区数据种子(省市区)
  const regionCount = db.query("SELECT COUNT(*) as c FROM shop_region") as any[];
  if (!regionCount.length || regionCount[0].c === 0) {
    try {
      const fs = require('fs');
      const path = require('path');
      const regionFile = path.resolve('server', 'region-data.json');
      if (fs.existsSync(regionFile)) {
        const list = JSON.parse(fs.readFileSync(regionFile, 'utf-8')) as any[];
        for (const r of list) db.insert('shop_region', { id: r.id, name: r.name, parent_id: r.parent_id, level: r.level, code: r.code, sort_order: r.sort_order || 0 });
      } else {
        console.warn('地区数据文件缺失:', regionFile);
      }
    } catch (e) { console.error('地区数据种子失败', e); }
  }

  // 支付方式配置种子
  const pmCount = db.query("SELECT COUNT(*) as c FROM shop_pay_methods") as any[];
  if (!pmCount.length || pmCount[0].c === 0) {
    db.insert('shop_pay_methods', { id: 'pm_online', name: '在线支付', type: 'online', is_open: 1, config: '{}', sort_order: 1 });
    db.insert('shop_pay_methods', { id: 'pm_offline', name: '线下支付(转账/汇款)', type: 'offline', is_open: 1, config: JSON.stringify({ account_name: '飞达科技有限公司', bank_name: '招商银行深圳分行', bank_account: '7559 0000 0000 0000', remark: '请汇款后联系客服确认' }), sort_order: 2 });
  }

  // 系统配置种子
  const scCount = db.query("SELECT COUNT(*) as c FROM shop_sys_config") as any[];
  if (!scCount.length || scCount[0].c === 0) {
    const defaults = [
      { cfg_key: 'site_theme', cfg_value: 'default', remark: '前台主题' },
      { cfg_key: 'sms_gateway', cfg_value: '{}', remark: '短信网关配置' },
      { cfg_key: 'email_config', cfg_value: '{}', remark: '邮件SMTP配置' },
      { cfg_key: 'site_name', cfg_value: '飞达企业门户', remark: '站点名称' },
      { cfg_key: 'icp_no', cfg_value: '', remark: '备案号' },
    ];
    for (const d of defaults) db.insert('shop_sys_config', { id: 'cfg_' + d.cfg_key, cfg_key: d.cfg_key, cfg_value: d.cfg_value, remark: d.remark, updated_at: new Date().toISOString() });
  }

  // 页面装修种子(首页)
  const pdCount = db.query("SELECT COUNT(*) as c FROM shop_page_design") as any[];
  if (!pdCount.length || pdCount[0].c === 0) {
    db.insert('shop_page_design', {
      id: 'pd_home', page_key: 'home', title: '商城首页', status: 1, updated_at: new Date().toISOString(),
      blocks: JSON.stringify([
        { id: 'b1', type: 'banner', title: '欢迎光临', image: 'https://picsum.photos/seed/home/1200/400', url: '' },
        { id: 'b2', type: 'goods', title: '热销推荐', goods_ids: ['g_001', 'g_002', 'g_003'] },
        { id: 'b3', type: 'text', title: '企业公告', content: '<p>飞达企业商城正式上线，全场包邮！</p>' }
      ])
    });
  }
}

// TypeScript export
export default seedCmsShopData;
