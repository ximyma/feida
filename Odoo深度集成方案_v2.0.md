# Odoo 模块深度集成方案 v2.0

> 分析日期: 2026-07-21 | 基于 Odoo `account` 模块实测

---

## 一、现状问题

以 account 模块为例，导入后生成 48 个数据表 → 1 个平铺应用 → **完全不可用**。

原因：Odoo 模块不只是「数据表+字段」，它是一个完整的 MVC 应用。

### Odoo 模块的完整组成

```
D:\myapps\odoo\addons\account/
├── __manifest__.py      ← 模块元数据: 名称/依赖/加载顺序
├── models/              ← 55个.py: 数据定义+业务逻辑+约束+计算字段
├── views/               ← 44个.xml: 表单布局/列表/搜索视图/Menuitems/Actions
├── security/            ← 权限规则/访问控制
├── data/                ← 种子数据/报表模板/邮件模板
├── wizard/              ← 向导对话框(多步骤交互)
├── controllers/         ← Web控制器(自定义路由)
├── static/              ← JS/CSS/图片
└── report/              ← PDF报表模板
```

| 组成部分 | Odoo源文件 | 作用 | 当前是否导入 |
|---------|-----------|------|------------|
| 数据表+字段 | `models/*.py` (fields) | 数据结构 | ✅ 已导入 |
| 业务方法 | `models/*.py` (methods) | 校验/计算/工作流 | ❌ |
| 表单布局 | `views/*.xml` (form) | 字段分组/页签/排序 | ❌ |
| 菜单导航 | `views/*.xml` (menuitem) | 分层菜单结构 | ❌ |
| 动作映射 | `views/*.xml` (action) | 菜单→模型→视图 | ❌ |
| 列表视图 | `views/*.xml` (tree) | 列表字段选择/排序 | ❌ |
| 搜索过滤 | `views/*.xml` (search) | 默认搜索/过滤器 | ❌ |
| 种子数据 | `data/*.csv` | 会计科目/税率表 | ❌ |
| 权限规则 | `security/*` | 角色/操作/记录规则 | ❌ |

---

## 二、关键洞察

### 2.1 55个模型 ≠ 55个用户界面

account 模块的 48 个模型中，只有约 **18 个**是用户直接操作的：

```
用户操作模型 (有菜单入口):
  account.move          → 会计凭证/发票
  account.move.line     → 凭证行/日记账条目
  account.payment       → 付款
  account.account       → 会计科目
  account.journal       → 日记账
  account.tax           → 税率
  account.bank.statement → 银行对账单
  account.reconcile     → 对账
  account.cash.rounding → 现金舍入
  ...约18个

技术辅助模型 (无独立菜单):
  account.full.reconcile    → 对账匹配(内部)
  account.partial.reconcile → 部分对账(内部)
  account.tax.repartition.line → 税率分配行(内部)
  account.move.send         → 凭证发送向导
  ...约30个
```

### 2.2 Odoo 已有完整的菜单→模型→视图映射

从 `account_menuitem.xml` 解析出的菜单树：

```
Invoicing
├── Dashboard          → action_open_account_journal_dashboard → account.journal
├── Customers
│   ├── Invoices       → action_move_out_invoice              → account.move
│   ├── Credit Notes   → action_move_out_refund               → account.move
│   ├── Payments       → action_account_payments              → account.payment
│   └── Customers      → res_partner_action_customer          → res.partner
├── Vendors
│   ├── Bills          → action_move_in_invoice               → account.move
│   ├── Refunds        → action_move_in_refund                → account.move
│   └── Payments       → action_account_payments_payable      → account.payment
├── Accounting
│   ├── Journal Items  → action_move_journal_line             → account.move.line
│   ├── Analytic Items → account_analytic_line_action         → account.analytic.line
│   └── Chart of Accounts → action_account_form               → account.account
├── Review
│   └── All Entries    → action_account_moves_all             → account.move.line
├── Reporting
│   ├── Partner Reports
│   ├── Taxes & Fiscal
│   └── Management
│       ├── Invoice Analysis → action_account_invoice_report  → report
│       └── Analytic Report  → action_analytic_reporting       → report
└── Configuration
    └── Accounting
        ├── Accounts    → action_account_form                 → account.account
        ├── Taxes       → action_tax_form                     → account.tax
        ├── Journals    → action_account_journal_form         → account.journal
        ├── Fiscal Positions → action_account_fiscal_position_form
        └── ...
```

### 2.3 XML 视图定义了完整表单布局

```xml
<!-- Odoo: account_move_views.xml -->
<form string="Journal Entry">
    <sheet>
        <group>                          <!-- 字段分组 -->
            <field name="name"/>
            <field name="partner_id"/>
        </group>
        <notebook>                       <!-- Tab 页签 -->
            <page string="Journal Items" name="items">
                <field name="line_ids" widget="one2many">  <!-- 内嵌子表 -->
                    <tree>
                        <field name="account_id"/>           <!-- 列 -->
                        <field name="name"/>
                        <field name="debit"/>
                        <field name="credit"/>
                    </tree>
                </field>
            </page>
            <page string="Other Info" name="other">
                <group>
                    <field name="ref"/>
                </group>
            </page>
        </notebook>
    </sheet>
</form>
```

**可直接转换为飞达表单布局**：

| Odoo XML | 飞达等效 |
|----------|---------|
| `<group string="Amount">` | 字段组/卡片标题 |
| `<notebook><page string="Items">` | Tabs.TabPane |
| `<field name="line_ids" widget="one2many">` | 内嵌子表(关联表) |
| `<tree>` | 子表列定义 |
| `<field readonly="1"/>` | 只读字段 |
| `invisible="条件"` | 条件显示 |

---

## 三、解决方案

### 阶段 1 (可实现) — 智能应用构建器

不做完整的 Odoo 运行时，而是从源文件中**提取信息**来构建更好的飞达应用：

#### 3.1 XML 解析器 — 新增 `odoo-view-parser.py`

```
输入: D:\myapps\odoo\addons\account\views\
输出: JSON 结构
{
  menus: [{ id, name, parent, action, children: [...] }],
  actions: [{ id, name, model, view_id, context, domain }],
  models: [{ name, form_groups, list_columns, search_filters }]
}
```

#### 3.2 智能应用构建流程

```
Odoo 模块目录
    │
    ├── models/*.py ──────→ odoo-parser.py ──→ 数据表定义
    ├── views/*.xml ──────→ odoo-view-parser.py ──→ 菜单/表单结构
    │
    ▼
  「智能应用构建器」
    │
    ├── ① 解析菜单树 → 生成应用菜单结构
    ├── ② 提取 action → 标记「用户操作模型」
    ├── ③ 标记「技术辅助模型」→ 隐藏/仅关联查找
    ├── ④ 提取 form 结构 → 字段分组/页签布局
    ├── ⑤ 提取 tree 视图 → 列表默认显示字段
    └── ⑥ 提取 search 视图 → 默认搜索字段
    │
    ▼
  飞达应用 (app.json + models/)
    │
    ├── 分层菜单结构与 Odoo 一致
    ├── 仅显示用户操作模型 (18个非48个)
    ├── 表单字段按 XML 布局分组
    ├── 技术表标记为 hidden/relation-only
    └── 多表关联关系完整保留
```

#### 3.3 导入前后的对比

| 维度 | 当前 (v1) | 优化后 (v2) |
|------|----------|-----------|
| 表数量 | 48个全部暴露 | 18个用户操作 + 30个隐藏关联 |
| 菜单 | 48个平铺列表 | 分层菜单树 (6个一级菜单) |
| 表单 | 全字段平铺 | 按XML分组+页签+只读标记 |
| 列表 | 显示所有字段 | 仅显示XML定义的列表字段 |
| 可发现性 | 用户完全不知道从哪开始 | 清晰的业务导航 (客户→发票→付款) |
| 关联表 | 全部平级展示 | 子表作为内嵌表单显示 |

---

## 四、技术可行性

### 4.1 XML 解析 (Python)

```python
# 解析菜单
import xml.etree.ElementTree as ET
tree = ET.parse('account_menuitem.xml')
for menu in tree.findall('.//menuitem'):
    name = menu.get('name')        # "Customers"
    action = menu.get('action')     # "action_move_out_invoice"
    parent = menu.get('parent')     # 父菜单ID

# 解析动作
for record in tree.findall(".//record[@model='ir.actions.act_window']"):
    model = record.find("field[@name='res_model']").text  # "account.move"
    name = record.find("field[@name='name']").text        # "Invoices"

# 解析表单视图 (get field grouping)
form_arch = ...  # XML in <field name="arch">
for group in form_arch.findall('.//group'):
    fields = [f.get('name') for f in group.findall('field')]
for page in form_arch.findall('.//page'):
    tab_name = page.get('string')
```

### 4.2 前端构建器改造

- 解析结果传入 `openAppBuilder()` 模态框
- 显示「主模型」(有菜单) vs「辅助模型」(仅关联)
- 勾选/取消勾选
- 生成分层菜单结构

### 4.3 不可行部分 (明确边界)

| 无法导入的内容 | 原因 |
|-------------|------|
| Python 业务方法 | 需要 Odoo 运行时 (ORM/API/上下文) |
| 计算字段公式 | Python 表达式无法直接转为 SQL/JS |
| 工作流状态机 | 需要 Odoo workflow 引擎 |
| Domain 过滤器 | Odoo 的 domain 语法 (Polymorphic) |
| 权限/访问控制 | 需要 Odoo auth 框架 |
| QWeb 报表模板 | 需要 QWeb 模板引擎 |
| `@api.constrains` | Python 校验逻辑 |

---

## 五、实施计划

### v2.0 — XML 视图解析 + 智能构建器 (可实现)

| 步骤 | 内容 | 工作量 |
|------|------|-------|
| 1 | `odoo-view-parser.py` — 解析 XML 菜单/动作/表单 | 核心 |
| 2 | 菜单树→飞达分层菜单 | 前端 |
| 3 | 主模型(有菜单) vs 辅助模型自动分类 | 前端 |
| 4 | 表单布局 (group/page)→飞达字段分组 | 前端 |
| 5 | 列表字段→默认显示列 | 前端 |
| 6 | 关联表内嵌显示 (one2many widget) | 前端+后端 |
| 7 | XML `readonly`/`invisible`→飞达只读/隐藏 | 前端 |
| 8 | `__manifest__.py` 解析→应用名称/描述/版本 | 简单 |

### 预期效果

account 模块导入后：

```
Invoicing (应用)
├── 📊 Dashboard
├── 👥 Customers
│   ├── 📄 Invoices (account.move 表单: 基本信息/明细行/税务/付款)
│   ├── 💳 Payments (account.payment)
│   └── 🏢 Customers (res.partner)
├── 🏭 Vendors
│   ├── 📄 Bills
│   └── 💳 Payments
├── 📚 Accounting
│   ├── 📊 Journal Items
│   └── 📋 Chart of Accounts
└── ⚙️ Configuration
    ├── 📋 Accounts
    ├── 💰 Taxes
    └── 📖 Journals
```

**可见模型**: 18个 (从48个精简)  
**表单布局**: 分组+页签 (不是全字段平铺)  
**关联表**: 内嵌显示 (如发票→明细行)  
**用户体验**: 有业务导向的菜单 → 知道从哪开始用

---

## 六、决策建议

| 方案 | 可行性 | 效果 |
|------|--------|------|
| **v2.0 (XML解析)** | ✅ 高 — 纯解析+前端映射 | 从"不可用"到"基本可用" |
| v3.0 (轻量运行时) | ⚠️ 中 — 需实现计算字段/domain引擎 | 从"基本可用"到"好用" |
| v4.0 (完整Odoo兼容) | ❌ 低 — 需要完整ORM+工作流+视图引擎 | 相当于重写Odoo |

**建议**: 立即启动 v2.0 (XML 解析 + 智能构建器)，这是投入产出比最高的改进。从 48 个平铺表 → 分层菜单 + 分组表单，体验提升 10 倍。

---

**结论**: Odoo 模块集成不是简单的"导入数据表"，但我们可以通过解析 Odoo 自带的菜单/动作/视图 XML，把「数据表」变成「有结构和导航的应用」。这是可行的，并且效果显著。
