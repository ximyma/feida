// 网站 & 商城模拟数据生成脚本
// 通过 API 批量创建有意义的测试数据
// 用法: BASE=http://localhost:3400 node seed-mock-data.js

const BASE = process.env.BASE || 'http://localhost:3400';
const API = (path, opts = {}) => fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  ✅', msg); } else { fail++; console.log('  ❌', msg); } }

async function main() {
  console.log('=== 清理旧测试数据 ===\n');

  // 删除旧的测试栏目
  try {
    const oldChannels = await API('/api/cms-channels');
    const testChannels = (Array.isArray(oldChannels) ? oldChannels : []).filter(c => c.name && c.name.includes('测试栏目_'));
    for (const ch of testChannels) {
      await API('/api/cms-channels/' + ch.id, { method: 'DELETE' });
    }
    console.log(`  已清理 ${testChannels.length} 个测试栏目`);
  } catch (e) { console.log('  清理栏目失败:', e.message); }

  // 删除旧文章
  try {
    const oldArticles = await API('/api/cms-articles?limit=200');
    const list = oldArticles.list || (Array.isArray(oldArticles) ? oldArticles : []);
    for (const a of list) {
      await API('/api/cms-articles/' + a.id, { method: 'DELETE' });
    }
    console.log(`  已清理 ${list.length} 篇文章`);
  } catch (e) { console.log('  清理文章失败:', e.message); }

  console.log('\n=== 创建 CMS 栏目 ===\n');

  const channels = [
    { name: '公司新闻', code: 'company-news', type: 'list', content_model: 'article', sort_order: 1, is_show: 1, description: '飞达智能科技最新动态与公司新闻', seo_title: '公司新闻 - 飞达智能科技', seo_keywords: '飞达,新闻,动态' },
    { name: '产品动态', code: 'product-updates', type: 'list', content_model: 'article', sort_order: 2, is_show: 1, description: '飞达产品更新、发布与功能动态', seo_title: '产品动态 - 飞达智能科技', seo_keywords: '产品,更新,功能' },
    { name: '技术博客', code: 'tech-blog', type: 'list', content_model: 'article', sort_order: 3, is_show: 1, description: '飞达技术团队分享开发经验与技术洞察', seo_title: '技术博客 - 飞达智能科技', seo_keywords: '技术,开发,AI' },
    { name: '关于我们', code: 'about-us', type: 'page', content_model: 'article', sort_order: 4, is_show: 1, description: '了解飞达团队、文化与愿景', seo_title: '关于我们 - 飞达智能科技', seo_keywords: '关于,团队,文化' },
  ];

  const channelMap = {};
  for (const ch of channels) {
    const r = await API('/api/cms-channels', { method: 'POST', body: JSON.stringify(ch) });
    if (r.id) {
      channelMap[ch.code] = r.id;
      console.log(`  栏目: ${ch.name} (${r.id})`);
      ok(true, ch.name);
    } else {
      ok(false, ch.name + ': ' + (r.error || '创建失败'));
    }
  }

  console.log('\n=== 创建 CMS 文章 ===\n');

  const articles = [
    { title: '飞达智能科技完成A轮融资', channel: 'company-news', author: '市场部', tags: ['融资', 'AI', '科技'], summary: '飞达智能科技宣布完成亿元人民币A轮融资，用于AI产品研发与团队扩展。', is_top: 1, is_recommend: 1, status: 'published', content: '<h2>飞达完成新一轮融资</h2><p>飞达智能科技今日宣布完成亿元人民币A轮融资，本轮由红杉资本领投，原有股东跟投。资金将用于AI核心技术研发、产品矩阵扩展以及团队建设。</p><p>飞达CEO表示："本轮融资标志着公司在AI驱动的企业管理软件赛道上的领先地位得到资本市场认可。我们将加速产品迭代，为客户提供更智能的HR与ERP解决方案。"</p><p>飞达目前已服务超过500家企业客户，覆盖制造、零售、科技等多个行业。</p>' },
    { title: '飞达eHR V2.0 正式发布', channel: 'product-updates', author: '产品团队', tags: ['HR', '发布', 'V2.0'], summary: '全新升级的人力资源管理系统，集成AI招聘、智能排班等重磅功能。', is_top: 1, is_hot: 1, status: 'published', content: '<h2>飞达eHR V2.0 重磅升级</h2><p>今日，飞达正式发布eHR V2.0版本，新版本带来了多项突破性功能：</p><ul><li>AI智能招聘：自动解析简历、智能匹配JD、面试安排自动化</li><li>智能排班：基于历史数据和业务需求自动生成最优排班方案</li><li>绩效管理：引入OKR与KPI双轨评估体系</li><li>培训管理：在线课程体系与学习路径规划</li></ul><p>新版本即日起开放升级，现有客户可免费升级至V2.0。</p>' },
    { title: '深入理解 React 19 的并发渲染机制', channel: 'tech-blog', author: '前端架构组', tags: ['React', '前端', '并发'], summary: 'React 19 引入的并发渲染如何提升用户体验？本文从原理到实践深入解析。', is_recommend: 1, is_hot: 1, status: 'published', content: '<h2>React 19 并发渲染深度解析</h2><p>React 19 最令人期待的特性之一就是并发渲染（Concurrent Rendering）的全面稳定化。本文将深入探讨其工作原理和最佳实践。</p><h3>什么是并发渲染？</h3><p>并发渲染允许 React 在渲染过程中中断和恢复工作。这意味着 React 可以根据用户交互的优先级，暂停低优先级的渲染任务，优先处理高优先级的更新。</p><h3>核心特性</h3><ol><li><strong>useTransition</strong> — 标记非紧急更新，保持UI响应</li><li><strong>useDeferredValue</strong> — 延迟更新非关键数据</li><li><strong>Suspense 增强</strong> — 数据加载与代码分割的统一方案</li></ol><p>在我们的飞达eHR项目中，我们利用这些特性实现了表格大数据量渲染的极致流畅体验。</p>' },
    { title: 'AI如何重塑企业培训的未来', channel: 'tech-blog', author: 'AI研究院', tags: ['AI', '培训', '机器学习'], summary: '从传统课堂到AI个性化学习路径，企业培训正在经历深刻变革。', is_recommend: 1, status: 'published', content: '<h2>AI驱动的企业培训变革</h2><p>在数字化转型的大潮中，企业培训正从"千人一面"走向"千人千面"。AI技术的引入让个性化学习路径成为现实。</p><p>飞达eHR的AI培训模块通过以下方式实现智能培训：</p><ul><li>根据员工岗位、技能水平和职业规划自动匹配课程</li><li>学习行为分析与知识薄弱点识别</li><li>自适应学习路径动态调整</li><li>培训效果智能评估与反馈</li></ul><p>数据显示，使用AI个性化培训的企业，员工学习效率提升40%，培训成本降低30%。</p>' },
    { title: '飞达获评"年度最具创新力企业软件"', channel: 'company-news', author: '公关部', tags: ['获奖', '创新', '荣誉'], summary: '在中国企业软件年度评选中，飞达凭借AI驱动的全栈管理平台荣获创新力大奖。', is_recommend: 1, status: 'published', content: '<h2>飞达荣获年度创新力大奖</h2><p>在刚刚结束的"中国企业软件年度评选"中，飞达智能科技凭借其AI驱动的全栈企业管理平台，荣获"年度最具创新力企业软件"大奖。</p><p>评委会评价："飞达将AI深度融入HR、ERP、CMS等企业管理核心场景，实现从传统信息化到智能化的跨越，代表了企业软件的发展方向。"</p>' },
    { title: 'Node.js 22 性能提升详解', channel: 'tech-blog', author: '后端架构组', tags: ['Node.js', '后端', '性能'], summary: 'Node.js 22 带来了 V8 引擎升级和诸多性能优化，对我们的服务有哪些实际影响？', is_hot: 1, status: 'published', content: '<h2>Node.js 22 性能深度评测</h2><p>Node.js 22 于2024年发布，搭载 V8 12.x 引擎，带来了显著的性能提升。我们的团队在飞达项目中进行了全面测试。</p><h3>关键提升</h3><ul><li>JSON.parse 性能提升约 15%</li><li>ArrayBuffer 操作优化 20%</li><li>fetch API 稳定性增强</li><li>WebSocket 连接管理优化</li></ul><p>在飞达eHR的API压力测试中，QPS提升了约12%，内存使用降低了8%。</p>' },
    { title: '飞达平台Q3功能路线图公布', channel: 'product-updates', author: '产品团队', tags: ['路线图', '规划', 'Q3'], summary: '三季度将上线智能BI分析、多语言工作台、移动端PWA等重磅功能。', is_top: 1, status: 'published', content: '<h2>Q3产品路线图</h2><p>飞达产品团队今日公布了2026年Q3产品路线图：</p><ol><li><strong>7月</strong>：智能BI分析看板上线，支持拖拽式报表设计</li><li><strong>8月</strong>：多语言工作台全面支持中/英/日三种语言</li><li><strong>9月</strong>：移动端PWA应用发布，支持离线打卡与审批</li></ol><p>用户可通过飞达社区投票决定优先级排序。</p>' },
    { title: '飞达与腾讯云达成战略合作', channel: 'company-news', author: '市场部', tags: ['合作', '腾讯云', '生态'], summary: '飞达与腾讯云签署战略合作协议，共同打造云原生企业管理解决方案。', is_top: 1, is_recommend: 1, status: 'published', content: '<h2>飞达与腾讯云战略合作</h2><p>飞达智能科技今日与腾讯云签署战略合作协议，双方将在云原生、AI大模型、安全合规等领域展开深度合作。</p><p>合作内容包括：</p><ul><li>飞达全线产品部署至腾讯云，享受原生云服务</li><li>对接混元大模型，强化AI对话与智能分析能力</li><li>联合打造企业级安全合规方案</li></ul><p>该合作将大幅提升飞达产品的稳定性、安全性和智能化水平。</p>' },
    { title: 'CSS Container Queries 实战指南', channel: 'tech-blog', author: '前端架构组', tags: ['CSS', '前端', '响应式'], summary: '告别 Media Queries 的局限，用 Container Queries 打造真正的组件级响应式设计。', status: 'published', content: '<h2>Container Queries 实战</h2><p>CSS Container Queries 是现代CSS最令人兴奋的特性之一。它允许我们基于容器尺寸而非视口尺寸来做响应式设计。</p><h3>为什么需要 Container Queries？</h3><p>传统的 Media Queries 只能基于视口宽度调整样式，但同一个组件在不同宽度的容器中表现不同，Media Queries 无法解决这个问题。</p><h3>基本语法</h3><pre><code>.card-container { container-type: inline-size; }</code><code>@container (min-width: 400px) { .card { display: grid; grid-template-columns: 1fr 1fr; } }</code></pre><p>我们在飞达的Dashboard组件中全面采用了Container Queries，实现了一次编写、处处适配的效果。</p>' },
    { title: '企业数字化转型的五个关键步骤', channel: 'company-news', author: '咨询团队', tags: ['数字化转型', '方法论', '管理'], summary: '从战略规划到技术落地，企业数字化转型的完整方法论。', status: 'published', content: '<h2>企业数字化转型五步法</h2><p>基于飞达服务超过500家企业的实践经验，我们总结出企业数字化转型的五个关键步骤：</p><ol><li><strong>数字化诊断</strong> — 全面评估现有流程与数据资产</li><li><strong>战略规划</strong> — 制定分阶段数字化路线图</li><li><strong>平台建设</strong> — 搭建统一的数字化管理平台</li><li><strong>数据驱动</strong> — 建立数据采集、分析与决策体系</li><li><strong>持续优化</strong> — 基于数据反馈持续迭代</li></ol><p>飞达全栈管理平台正是为这一方法论量身打造的工具。</p>' },
    { title: '飞达商城V1.0上线内测', channel: 'product-updates', author: '商城团队', tags: ['商城', '电商', 'V1.0'], summary: '集成优惠券、秒杀、拼团、分销等营销工具的企业级电商解决方案。', is_top: 1, is_hot: 1, status: 'published', content: '<h2>飞达商城V1.0上线</h2><p>飞达商城V1.0今日正式上线内测！这是一个面向企业的一站式电商解决方案：</p><ul><li>完整的商品管理系统（SKU、规格、参数、相册）</li><li>丰富的营销工具（优惠券、秒杀、拼团、砍价）</li><li>分销体系（多级佣金、邀请码、提现管理）</li><li>仓储物流（库存管理、快递对接）</li><li>页面装修（拖拽式DIY首页）</li></ul><p>内测期间免费开放所有功能，欢迎体验反馈。</p>' },
    { title: '关于飞达智能科技', channel: 'about-us', author: '飞达团队', tags: ['关于', '介绍'], summary: '飞达智能科技——AI驱动的企业管理软件领导者，致力于让每个企业都拥有智能管理能力。', is_top: 1, status: 'published', content: '<h2>关于飞达智能科技</h2><p>飞达智能科技成立于2020年，总部位于深圳，是一家专注于AI驱动的企业管理软件的高科技企业。</p><h3>我们的使命</h3><p>让每个企业都拥有智能管理能力，用AI技术降低管理成本、提升运营效率。</p><h3>核心产品</h3><ul><li><strong>飞达eHR</strong> — 智能人力资源管理</li><li><strong>飞达ERP</strong> — 一体化企业资源管理</li><li><strong>飞达CMS</strong> — 内容管理与门户系统</li><li><strong>飞达商城</strong> — 企业级电商解决方案</li></ul><h3>联系我们</h3><p>官网：www.feida.com | 邮箱：contact@feida.com</p>' },
  ];

  for (const a of articles) {
    const channelId = channelMap[a.channel];
    if (!channelId) { ok(false, `${a.title}: 栏目不存在 ${a.channel}`); continue; }
    const body = {
      title: a.title, channel_id: channelId, author: a.author || '系统',
      tags: a.tags ? JSON.stringify(a.tags) : '[]',
      summary: a.summary || '', content: a.content || '<p>内容建设中...</p>',
      is_top: a.is_top || 0, is_recommend: a.is_recommend || 0, is_hot: a.is_hot || 0,
      status: a.status || 'draft', publish_time: a.status === 'published' ? new Date().toISOString() : null,
    };
    const r = await API('/api/cms-articles', { method: 'POST', body: JSON.stringify(body) });
    if (r.id) {
      ok(true, a.title);
      // 发布
      if (a.status === 'published') {
        await API('/api/cms-articles/' + r.id + '/review', { method: 'PUT', body: JSON.stringify({ action: 'approve' }) });
      }
    } else {
      ok(false, a.title + ': ' + (r.error || '创建失败'));
    }
  }

  console.log('\n=== 创建 Banner ===\n');

  // 使用占位图片
  const banners = [
    { title: '飞达eHR V2.0 全新发布', image_url: 'https://picsum.photos/1200/400?random=1', link_url: '/site/articles', sort_order: 1, is_show: 1 },
    { title: 'AI赋能企业管理新时代', image_url: 'https://picsum.photos/1200/400?random=2', link_url: '/site/articles', sort_order: 2, is_show: 1 },
    { title: '飞达商城正式上线', image_url: 'https://picsum.photos/1200/400?random=3', link_url: '/shop', sort_order: 3, is_show: 1 },
  ];

  for (const b of banners) {
    const r = await API('/cms-banners', { method: 'POST', body: JSON.stringify(b) });
    ok(!!r.id, b.title);
  }

  // ===== 商城模拟数据 =====

  console.log('\n=== 创建商城品牌 ===\n');

  const brands = [
    { name: '飞达自营', logo: 'https://picsum.photos/100/100?random=10', description: '飞达自有品牌', sort_order: 1 },
    { name: 'TechGear', logo: 'https://picsum.photos/100/100?random=11', description: '科技装备品牌', sort_order: 2 },
    { name: 'SmartLife', logo: 'https://picsum.photos/100/100?random=12', description: '智能生活品牌', sort_order: 3 },
  ];

  for (const b of brands) {
    const r = await API('/shop-brands', { method: 'POST', body: JSON.stringify(b) });
    ok(!!r.id, b.name);
  }

  console.log('\n=== 创建商城商品 ===\n');

  const goods = [
    { title: '智能办公本 Pro', subtitle: 'AI语音转写·手写笔记·云端同步', category_ids: '[]', price: 2999, market_price: 3999, stock: 500, unit: '台', description: '飞达智能办公本 Pro，支持AI语音实时转写，手写笔记自动识别，云端多端同步。', content: '<p>飞达智能办公本 Pro 是新一代智能办公工具。</p><h3>核心功能</h3><ul><li>AI语音实时转写，准确率98%</li><li>手写笔记自动识别并转为可编辑文本</li><li>云端多端同步，随时访问</li><li>超长续航，待机30天</li></ul>', images: JSON.stringify(['https://picsum.photos/800/800?random=20','https://picsum.photos/800/800?random=21']) },
    { title: '飞达AI学习机', subtitle: '个性化学习·智能推荐·家长管控', category_ids: '[]', price: 1999, market_price: 2599, stock: 800, unit: '台', description: '专为学生打造的AI学习平板，个性化学习路径，智能推荐题目，家长远程管控。', content: '<p>飞达AI学习机，让每个孩子拥有专属AI家教。</p>', images: JSON.stringify(['https://picsum.photos/800/800?random=30']) },
    { title: '无线降噪耳机 X1', subtitle: 'ANC主动降噪·40h续航·Hi-Res音质', category_ids: '[]', price: 599, market_price: 799, stock: 2000, unit: '副', description: '飞达X1无线降噪耳机，ANC主动降噪，40小时超长续航，支持Hi-Res高解析音频。', content: '<p>飞达X1，静享好声音。</p>', images: JSON.stringify(['https://picsum.photos/800/800?random=40']) },
    { title: '智能手表 S3', subtitle: '健康监测·运动模式·7天续航', category_ids: '[]', price: 1299, market_price: 1599, stock: 1200, unit: '块', description: '飞达S3智能手表，支持心率/血氧/睡眠监测，100+运动模式，7天超长续航。', content: '<p>飞达S3，你的腕上健康管家。</p>', images: JSON.stringify(['https://picsum.photos/800/800?random=50']) },
    { title: '便携蓝牙音箱 B2', subtitle: 'IPX7防水·20h播放·TWS串联', category_ids: '[]', price: 299, market_price: 399, stock: 3000, unit: '台', description: '飞达B2蓝牙音箱，IPX7级防水，20小时连续播放，支持TWS双机串联立体声。', content: '<p>飞达B2，随身音乐厅。</p>', images: JSON.stringify(['https://picsum.photos/800/800?random=60']) },
    { title: '企业定制礼盒套装', subtitle: '钢笔·记事本·保温杯·U盘', category_ids: '[]', price: 399, market_price: 599, stock: 500, unit: '套', description: '飞达企业定制礼盒，包含定制钢笔、真皮记事本、真空保温杯、定制U盘。可印企业Logo。', content: '<p>企业专属礼盒，彰显品牌品质。</p>', images: JSON.stringify(['https://picsum.photos/800/800?random=70']) },
  ];

  for (const g of goods) {
    const r = await API('/shop-goods', { method: 'POST', body: JSON.stringify(g) });
    if (r.id) {
      ok(true, g.title);
      // 上架
      await API('/shop-goods/' + r.id, { method: 'PUT', body: JSON.stringify({ is_sale: 1 }) });
    } else {
      ok(false, g.title + ': ' + (r.error || '创建失败'));
    }
  }

  console.log(`\n========== 完成 ==========`);
  console.log(`通过: ${pass} / 失败: ${fail}`);
  console.log(`==========================`);
}

main().catch(e => { console.error(e); process.exit(1); });
