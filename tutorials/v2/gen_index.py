# -*- coding: utf-8 -*-
"""
Sowork AI 企业智能ERP系统 · 教程系列 V2 索引导航生成器
- 扫描 tutorials/v2 下 NN-*.md，生成 index.html（交互式）与 README.md（Markdown 目录）
- 元数据（PART / 读者向 / 摘要）集中在此维护；字数额度从文件实际大小估算
用法：python gen_index.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# PART 顺序与标题
PARTS = [
    ("PART 0", "认知与入门（管理者 + 开发者共同起点）"),
    ("PART 1", "底层架构（技术地基）"),
    ("PART 2", "AI 与低代码（差异化能力）"),
    ("PART 3", "HR 人力资源（逐模块逐功能）"),
    ("PART 4", "ERP 企业资源（逐模块逐功能）"),
    ("PART 5", "CMS 内容门户"),
    ("PART 6", "商城 ShopXO 超集"),
    ("PART 7", "系统管理与综合"),
]

# 每篇元数据：(编号, 文件名, PART序号, 读者向, 摘要)
# 读者向: manager(管理者向) / dev(开发者向) / both(双读者)
ARTICLES = [
    ("00", "00-开篇-什么是SoworkAI企业智能ERP.md", 0, "both", "定位、能力地图、双读者指南、学习路径，全模块能力地图概览。"),
    ("01", "01-功能全景图-一张图看懂所有模块.md", 0, "manager", "管理者视角的能力地图 + 模块到业务价值映射，覆盖全部 27 个一级模块。"),
    ("02", "02-5分钟跑起来-环境搭建与首次启动.md", 0, "both", "clone→装依赖→启动→登录端到端，含依赖陷阱、端口、默认账号。"),

    ("03", "03-整体架构与请求生命周期.md", 1, "both", "单体全栈、中间件链、apiRouter、catch-all 铁律，请求全链路剖析。"),
    ("04", "04-数据库层-驱动抽象与自动建表迁移.md", 1, "dev", "SQLite/PG 双驱动、_ensureTable/_migrateColumns，WAL、字段约定、迁移。"),
    ("05", "05-自研ORM引擎源码精读.md", 1, "dev", "Environment/Recordset/ModelRegistry/BaseModel，search/create/write/关联/Proxy 脏写。"),
    ("06", "06-后端引擎-中间件路由与登录安全.md", 1, "dev", "IP 限速、账号锁定、API 鉴权，限流/锁账号/鉴权中间件。"),
    ("07", "07-前端架构-路由权限渲染与防白屏.md", 1, "both", "usePermission、菜单过滤、双层 ErrorBoundary，路由表/权限渲染/防白屏。"),
    ("08", "08-企业级管控-RBAC权限点与i18n.md", 1, "both", "三层 RBAC、站点 scope、双语字典，权限点/角色/站点/多语言。"),

    ("09", "09-AI助手-SSE流式RAG与工具循环.md", 2, "dev", "流式解析、混合检索、code-agent 工具循环，对话/知识问答/代码助手。"),
    ("10", "10-知识库BI分析与智能预警.md", 2, "both", "知识库管理、BI、预警规则，/ai-knowledge、/ai-bianalytics、/ai-alerts。"),
    ("11", "11-低代码平台-4步向导到模型热部署.md", 2, "dev", "create-module/add-field 全链路，建模向导/字段/菜单/热部署。"),
    ("12", "12-应用管理插件与Odoo模型集成.md", 2, "both", "应用管理、插件、Odoo 导入/浏览，apps-manager/plugins/odoo-browser。"),

    ("13", "13-HR总览-组织架构成员主档.md", 3, "manager", "部门/职位/职级/员工主档，组织架构与成员主档。"),
    ("14", "14-人事管理-合同变动子集考核人才.md", 3, "both", "9 个子页：合同/变动/子集/考核/人才逐一说清。"),
    ("15", "15-考勤管理-班次排班规则打卡统计.md", 3, "both", "8 个子页：班次/排班/规则/打卡/假期/加班/统计/日报，布局+流程+逻辑+代码。"),
    ("16", "16-薪酬管理-工资表配置公式社保.md", 3, "manager", "5 个子页：薪酬首页/工资表/薪资配置/薪资公式/企业缴纳。"),
    ("17", "17-绩效管理-KPI周期记录等级.md", 3, "both", "4 子页：KPI/周期/记录/等级。"),
    ("18", "18-招聘管理-职位简历候选人Offer.md", 3, "both", "5 子页：职位/简历/候选人/Offer/人才库。"),
    ("19", "19-后勤管理-宿舍食堂车辆访客.md", 3, "both", "4 子页：宿舍/食堂/车辆/访客。"),
    ("20", "20-培训管理-课程学习评估直播.md", 3, "both", "课程/学习/评估/直播。"),
    ("21", "21-流程审批-请假加班离职审批流引擎.md", 3, "both", "4 子页 + workflow 引擎：请假/加班/离职/审批流。"),
    ("22", "22-员工自助门户.md", 3, "both", "个人门户：请假/考勤/薪资查询。"),

    ("23", "23-ERP总览与产品基础档案.md", 4, "both", "产品 9 子页：颜色/尺码/分类/款式/SKU/箱规/编码/尺码比。"),
    ("24", "24-PLM工艺管理-物料BOM工艺路线.md", 4, "both", "10 子页：物料属性/物料/工艺/路线/组件/BOM/废料/鞋底/季节。"),
    ("25", "25-仓储管理-仓库货位库存入出库盘点调拨条码.md", 4, "dev", "9 子页：仓库/货位/库存/入库/出库/盘点/调拨/条码。"),
    ("26", "26-销售管理-客户订单发货退货.md", 4, "both", "5 子页：客户组/客户/订单/发货/退货。"),
    ("27", "27-采购管理-供应商订单入库.md", 4, "both", "4 子页：供应商组/供应商/订单/入库。"),
    ("28", "28-生产管理-工作中心计划工单报工.md", 4, "both", "4 子页：工作中心/计划/工单/报工，MRP 展开。"),
    ("29", "29-财务管理-科目凭证应收应付收付款.md", 4, "both", "5 子页 + 分析会计：科目/凭证/应收/应付/收付款。"),
    ("30", "30-质量管理-标准检验缺陷纠正措施.md", 4, "both", "4 子页：标准/检验/缺陷/纠正措施。"),

    ("31", "31-CMS总览与栏目管理.md", 5, "manager", "栏目树/拖拽排序/模板，CMSAdminPage。"),
    ("32", "32-文章编辑-Tiptap富文本与素材库.md", 5, "both", "富文本/水印/缩略图，articles/media/banners/comments。"),
    ("33", "33-标签智能提取审核流回收站SEO.md", 5, "both", "标签 n-gram、审核、软删除、SEO、Sitemap。"),

    ("34", "34-商城总览与商品管理.md", 6, "manager", "SKU/相册/参数/多分类/规格图，ShopAdminPage。"),
    ("35", "35-营销中心-优惠券秒杀拼团砍价分销.md", 6, "both", "5 大营销：优惠券/秒杀/拼团/砍价/分销。"),
    ("36", "36-订单与支付-库存联动线下支付确认.md", 6, "dev", "下单扣库存、支付确认，orders/pay、applyStockChange。"),
    ("37", "37-售后-退货退款状态机.md", 6, "both", "pending→…→refunded 状态机，aftersale。"),
    ("38", "38-余额积分快递地区页面装修.md", 6, "both", "辅助能力：余额/积分/快递/地区/装修。"),
    ("39", "39-商城前台-首页详情购物车结算用户中心.md", 6, "both", "用户侧全流程：ShopHome/ProductDetail/Cart/Checkout/Pay/User。"),

    ("40", "40-系统管理-用户角色配置数据日志.md", 7, "manager", "系统 15 子页（核心）：用户/角色/配置/数据/审计/登录日志。"),
    ("41", "41-集成-企业微信钉钉API文档任务插件.md", 7, "both", "系统 15 子页（集成）：企业微信/钉钉/API文档/任务/插件。"),
    ("42", "42-仪表盘与数据统计.md", 7, "both", "首页看板 + 统计，Dashboard/Statistics。"),
    ("43", "43-综合事务-通知公告文档问卷办公.md", 7, "both", "office 3 + 会议室/物料：公告/文档/问卷/会议/物料。"),
    ("44", "44-测试与质量保障.md", 7, "both", "端到端断言体系，test-*.js、ok()、副作用验证。"),
    ("45", "45-部署与运维.md", 7, "both", "Docker/compose/启动 bat/备份，Dockerfile/docker-compose。"),
    ("46", "46-二次开发与生态.md", 7, "both", "modules vs addons、Odoo 移植、社区贡献。"),
]

AUD_LABEL = {"manager": "管理者向", "dev": "开发者向", "both": "双读者"}
AUD_CLASS = {"manager": "tag-manager", "dev": "tag-dev", "both": "tag-both"}


def est_chars(size_bytes):
    return max(1, round(size_bytes / 3))


def build_html():
    total = len(ARTICLES)
    total_chars = sum(est_chars(os.path.getsize(os.path.join(HERE, f))) for _, f, _, _, _ in ARTICLES
                      if os.path.exists(os.path.join(HERE, f)))
    parts_html = []
    for pidx, (pkey, ptitle) in enumerate(PARTS):
        items = [a for a in ARTICLES if a[2] == pidx]
        cards = []
        for num, fname, _, aud, summary in items:
            fpath = os.path.join(HERE, fname)
            chars = est_chars(os.path.getsize(fpath)) if os.path.exists(fpath) else 0
            missing = "" if os.path.exists(fpath) else ' style="opacity:.5"'
            cards.append(f'''      <a class="card" href="./{fname}"{missing} data-search="{num} {fname} {summary} {AUD_LABEL[aud]}">
        <div class="card-top">
          <span class="num">{num}</span>
          <span class="tag {AUD_CLASS[aud]}">{AUD_LABEL[aud]}</span>
        </div>
        <div class="card-title">{fname[3:-3]}</div>
        <div class="card-sum">{summary}</div>
        <div class="card-foot">约 {chars:,} 字</div>
      </a>''')
        parts_html.append(f'''  <section class="part" data-part="{pkey}">
    <h2>{pkey} · {ptitle} <span class="pct">（{len(items)} 篇）</span></h2>
    <div class="grid">
{chr(10).join(cards)}
    </div>
  </section>''')

    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sowork AI 企业智能ERP系统 · 教程系列索引</title>
<style>
  :root {{
    --bg:#ffffff; --panel:#f6f8fa; --line:#e5e8ec; --ink:#1f2329; --sub:#6b7280;
    --brand:#1677ff; --brand-soft:#e8f1ff;
    --mgr:#16a34a; --mgr-soft:#e7f6ec; --dev:#1677ff; --dev-soft:#e8f1ff; --both:#8b5cf6; --both-soft:#f1ebfd;
  }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--ink);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; line-height:1.6; }}
  header {{ padding:32px 24px 20px; background:linear-gradient(180deg,#f0f6ff,#ffffff); border-bottom:1px solid var(--line); }}
  .wrap {{ max-width:1180px; margin:0 auto; padding:0 20px; }}
  h1 {{ margin:0 0 6px; font-size:26px; }}
  .sub {{ color:var(--sub); margin:0 0 16px; font-size:14px; }}
  .stats {{ display:flex; gap:10px; flex-wrap:wrap; }}
  .stat {{ background:var(--brand-soft); color:var(--brand); border-radius:10px; padding:8px 14px; font-size:13px; font-weight:600; }}
  .search {{ margin:18px 0 4px; }}
  .search input {{ width:100%; max-width:460px; padding:11px 14px; border:1px solid var(--line); border-radius:10px;
    font-size:15px; outline:none; background:var(--panel); }}
  .search input:focus {{ border-color:var(--brand); background:#fff; }}
  main {{ padding:8px 0 60px; }}
  .part {{ margin-top:30px; }}
  .part h2 {{ font-size:18px; border-left:4px solid var(--brand); padding-left:10px; margin:0 0 14px; }}
  .pct {{ color:var(--sub); font-weight:400; font-size:14px; }}
  .grid {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }}
  .card {{ display:block; text-decoration:none; color:inherit; background:var(--panel); border:1px solid var(--line);
    border-radius:12px; padding:14px; transition:.15s; }}
  .card:hover {{ border-color:var(--brand); box-shadow:0 4px 14px rgba(22,119,255,.12); transform:translateY(-2px); }}
  .card-top {{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }}
  .num {{ font-weight:800; color:var(--brand); font-size:15px; background:var(--brand-soft); border-radius:8px; padding:1px 9px; }}
  .tag {{ font-size:12px; padding:2px 8px; border-radius:999px; font-weight:600; }}
  .tag-manager {{ color:var(--mgr); background:var(--mgr-soft); }}
  .tag-dev {{ color:var(--dev); background:var(--dev-soft); }}
  .tag-both {{ color:var(--both); background:var(--both-soft); }}
  .card-title {{ font-weight:700; font-size:15px; margin-bottom:6px; }}
  .card-sum {{ color:var(--sub); font-size:13px; min-height:54px; }}
  .card-foot {{ color:#9aa3af; font-size:12px; margin-top:8px; }}
  footer {{ color:var(--sub); font-size:12px; border-top:1px solid var(--line); padding:18px 0 40px; }}
  .note {{ background:#fff8e6; border:1px solid #ffe2a8; color:#8a6100; border-radius:10px; padding:10px 14px; font-size:13px; margin-top:14px; }}
  .empty {{ color:var(--sub); padding:40px; text-align:center; display:none; }}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <h1>Sowork AI 企业智能ERP系统 · 技术教程系列索引</h1>
    <p class="sub">版本 v1.2.0 ｜ 代码级深度教程 ｜ 双读者（企业管理者 + 技术开发）｜ 配套大纲：<a href="../教程系列写作大纲V2.md">教程系列写作大纲 V2</a></p>
    <div class="stats">
      <span class="stat">共 {total} 篇</span>
      <span class="stat">8 大 PART</span>
      <span class="stat">约 {total_chars:,} 字</span>
      <span class="stat">每篇 ~3000 字起</span>
    </div>
    <div class="search"><input id="q" type="text" placeholder="搜索编号 / 标题 / 关键词（如 考勤、ORM、薪酬、SEO）…" oninput="filter()"></div>
    <div class="note">提示：目录下另有一个无编号的 <code>薪酬管理-工资表配置公式社保.md</code>，为扩写前的旧版残留，已被本索引忽略，建议归档或删除（权威版本为 <code>16-薪酬管理-*.md</code>）。</div>
  </div>
</header>
<main class="wrap">
{chr(10).join(parts_html)}
  <div class="empty" id="empty">没有匹配的教程，换个关键词试试。</div>
  <footer>
    本索引由 <code>gen_index.py</code> 自动生成。产品名 <strong>Sowork AI 企业智能ERP系统</strong>，绝不用“飞达/Feida”。依赖安装一律 <code>npm install --legacy-peer-deps</code>。
  </footer>
</main>
<script>
function filter() {{
  var q = document.getElementById('q').value.trim().toLowerCase();
  var cards = document.querySelectorAll('.card');
  var visibleParts = 0;
  document.querySelectorAll('.part').forEach(function(p) {{
    var seen = 0;
    p.querySelectorAll('.card').forEach(function(c) {{
      var hit = !q || c.getAttribute('data-search').toLowerCase().indexOf(q) !== -1;
      c.style.display = hit ? '' : 'none';
      if (hit) seen++;
    }});
    p.style.display = seen ? '' : 'none';
    if (seen) visibleParts++;
  }});
  document.getElementById('empty').style.display = visibleParts ? 'none' : 'block';
}}
</script>
</body>
</html>'''


def build_readme():
    lines = []
    lines.append("# Sowork AI 企业智能ERP系统 · 教程系列索引（V2）\n")
    lines.append("> 版本 v1.2.0 ｜ 代码级深度教程，服务「企业管理者」+「技术开发」双读者 ｜ 配套大纲：[教程系列写作大纲 V2](../教程系列写作大纲V2.md)\n")
    total = len(ARTICLES)
    total_chars = sum(est_chars(os.path.getsize(os.path.join(HERE, f))) for _, f, _, _, _ in ARTICLES
                      if os.path.exists(os.path.join(HERE, f)))
    lines.append(f"- 共 **{total} 篇**，分 **8 大 PART**，约 **{total_chars:,} 字**")
    lines.append("- 交互式导航页：[index.html](./index.html)（支持搜索 / 按 PART 折叠）\n")
    for pidx, (pkey, ptitle) in enumerate(PARTS):
        items = [a for a in ARTICLES if a[2] == pidx]
        lines.append(f"## {pkey} · {ptitle}\n")
        lines.append("| # | 标题 | 读者向 | 篇幅 | 链接 |")
        lines.append("|---|------|--------|------|------|")
        for num, fname, _, aud, summary in items:
            fpath = os.path.join(HERE, fname)
            chars = est_chars(os.path.getsize(fpath)) if os.path.exists(fpath) else 0
            title = fname[3:-3]
            lines.append(f"| {num} | {title} | {AUD_LABEL[aud]} | 约 {chars:,} 字 | [打开](./{fname}) |")
        lines.append("")
    lines.append("## 说明\n")
    lines.append("- 扩写前的旧版 `薪酬管理-工资表配置公式社保.md` 已归档至 `tutorials/_v1_archive/`（权威版本为 `16-薪酬管理-*.md`）。")
    lines.append("- 本索引由 `gen_index.py` 自动生成；产品名 **Sowork AI 企业智能ERP系统**，绝不用“飞达/Feida”。")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    html = build_html()
    readme = build_readme()
    with open(os.path.join(HERE, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    with open(os.path.join(HERE, "README.md"), "w", encoding="utf-8") as f:
        f.write(readme)
    # 校验缺失文件
    missing = [f for _, f, _, _, _ in ARTICLES if not os.path.exists(os.path.join(HERE, f))]
    print(f"OK: 生成 index.html + README.md，共 {len(ARTICLES)} 篇")
    if missing:
        print("警告：以下文件未找到 ->", missing)
