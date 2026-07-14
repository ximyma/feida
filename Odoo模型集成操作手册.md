# Odoo 模型集成操作手册

> 飞达 v1.2.0 | 2026-07-14

---

## 目录

1. [概述](#1-概述)
2. [环境准备](#2-环境准备)
3. [工具链](#3-工具链)
4. [单文件导入](#4-单文件导入)
5. [批量导入](#5-批量导入)
6. [继承模型处理](#6-继承模型处理)
7. [数据移植](#7-数据移植)
8. [字段类型对照](#8-字段类型对照)
9. [常见问题](#9-常见问题)
10. [参考命令](#10-参考命令)

---

## 1. 概述

飞达提供了一条完整的工具链，可以从 Odoo 的 Python 模型定义文件自动生成飞达 ORM 模块。

```
 Odoo .py 源文件    →    odoo-parser.py    →    JSON 中间格式    →    odoo2feida.js    →    飞达模块
 (res_partner.py)         (Python 解析器)        (结构化描述)          (JS 转换器)         (modules/my_mod/)
```

### 当前已导入

| Odoo 源模块 | 模型数 | 字段数 | 飞达模块名 |
|------------|-------|-------|-----------|
| base (核心) | 40 | 424 | `modules/odoo_base/` |
| base + res_users | 12 | 105 | `modules/odoo_res_partner/` |

### 核心模型清单

```
res_partner        — 联系人/客户
res_users          — 用户
res_company        — 公司
res_currency       — 货币汇率
res_country        — 国家/省/市
res_bank           — 银行账户
ir_attachment      — 附件
ir_model           — ORM 模型元数据
ir_actions         — 动作/窗口/URL
```

---

## 2. 环境准备

### 前提条件

- 本地有 Odoo 源码目录（如 `D:/myapps/odoo/`）
- Python 3.8+（解析器用）
- Node.js 22+（转换器 + 飞达服务）

### 确认 Odoo 模型文件位置

```bash
# Odoo 核心模型在此
ls D:/myapps/odoo/odoo/addons/base/models/

# 常见文件:
#   res_partner.py      — 联系人
#   res_users.py        — 用户
#   res_company.py      — 公司
#   res_currency.py     — 货币
#   ir_model.py         — ORM 模型
#   ir_attachment.py    — 附件
```

---

## 3. 工具链

### 3.1 odoo-parser.py

**功能**: 解析 Odoo `.py` 模型文件，输出 JSON

**用法**:
```bash
# 解析单个文件
python tools/odoo-parser.py "D:/myapps/odoo/odoo/addons/base/models/res_partner.py"

# 解析整个目录
python tools/odoo-parser.py "D:/myapps/odoo/odoo/addons/base/models/"

# 输出到文件
python tools/odoo-parser.py "D:/myapps/odoo/odoo/addons/base/models/res_partner.py" > partner.json
```

**输出格式**:
```json
[
  {
    "_name": "res_partner",
    "_odoo_name": "res.partner",
    "_description": "Contact",
    "_inherit": [],
    "_fields": {
      "name": { "type": "char", "label": "Name", "index": true },
      "email": { "type": "char", "label": "Email" },
      "active": { "type": "boolean", "label": "Active", "default": true },
      "country_id": { "type": "many2one", "label": "Country", "relation": "res_country" },
      "lang": { "type": "selection", "label": "Language",
        "selection": [{"label": "English", "value": "en_US"}, ...] }
    }
  }
]
```

**解析规则**:

| Odoo Python | 解析结果 |
|------------|---------|
| `_name = 'res.partner'` | `"_name": "res_partner"` |
| `_inherit = 'res.partner'` | `"_inherit": ["res_partner"]` |
| `_description = 'Contact'` | `"_description": "Contact"` |
| `name = fields.Char('Name')` | `"name": {"type":"char", "label":"Name"}` |
| `required=True` | `"required": true` |
| `default=True` | `"default": true` |
| `index=True` | `"index": true` |
| `selection=[('a','A')]` | `"selection":[{"label":"A","value":"a"}]` |
| `Many2one('res.country')` | `"type":"many2one", "relation":"res_country"` |

### 3.2 odoo2feida.js

**功能**: 将解析后的 JSON 转换为飞达模块

**用法**:
```bash
node tools/odoo2feida.js <parsed.json> [output_dir] [module_name]

# 基本用法
node tools/odoo2feida.js partner.json modules/odoo_partner odoo_partner

# 参数说明:
#   parsed.json  - odoo-parser.py 的输出
#   output_dir   - 飞达模块目录（默认: modules/odoo_import）
#   module_name  - 模块技术名（默认: odoo_import）
```

**生成的目录结构**:
```
modules/odoo_partner/
├── manifest.json              # 模块清单
└── models/
    ├── res_partner.js          # 独立模型: exports.model = {...}
    ├── res_partner_category.js
    ├── res_company.js
    └── ...
```

**生成的模型文件示例** (`models/res_partner.js`):
```javascript
// Auto-generated from Odoo model: res.partner
// Description: Contact

exports.model = {
  "_name": "res_partner",
  "_description": "Contact",
  "_fields": {
    "name": { "type": "char", "label": "Name", "index": true },
    "email": { "type": "char", "label": "Email" },
    "phone": { "type": "char", "label": "Phone" },
    "active": { "type": "boolean", "label": "Active", "default": true }
  }
};
```

### 3.3 import-odoo.js

**功能**: 一键批量导入 Odoo 全部核心模型

**用法**:
```bash
node tools/import-odoo.js
```

**流程**:
1. 扫描 Odoo `base/models/*.py`
2. 调用 `odoo-parser.py` 逐个解析
3. 去重合并
4. 调用 `odoo2feida.js` 生成飞达模块
5. 输出统计信息

**可修改的配置**（编辑 `tools/import-odoo.js`）:
```javascript
const ODOO_MODELS_DIR = 'D:/myapps/odoo/odoo/addons/base/models';
const OUTPUT_DIR = 'modules/odoo_base';
const MODULE_NAME = 'odoo_base';

// 要导入的文件列表
const TARGET_FILES = [
  'res_partner.py', 'res_users.py', 'res_company.py',
  'res_country.py', 'res_bank.py', 'res_currency.py',
  'res_lang.py', 'ir_attachment.py', 'ir_actions.py',
  'ir_model.py', 'ir_http.py',
];
```

---

## 4. 单文件导入

### 4.1 完整流程

```bash
# Step 1: 解析 Odoo 文件
python tools/odoo-parser.py "D:/myapps/odoo/odoo/addons/sale/models/sale_order.py" > tools/sale_order.json

# Step 2: 检查解析结果
cat tools/sale_order.json | node -e "
  const models = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
  models.forEach(m => console.log(m._name, ':', Object.keys(m._fields).length, '字段'));
"

# Step 3: 转换为飞达模块
node tools/odoo2feida.js tools/sale_order.json modules/odoo_sale odoo_sale

# Step 4: 构建
npm run build:server

# Step 5: 启动验证
node dist/server/standalone.js &
sleep 8
curl http://localhost:3000/api/model/list | node -e "
  process.stdin.on('data', d => {
    const a = JSON.parse(d);
    console.log('总模型数:', a.length);
    const sale = a.filter(m => m.name.startsWith('sale_'));
    console.log('销售模块:', sale.map(m => m.name).join(', '));
  });
"
```

### 4.2 验证模型

```bash
# 查看新模型的表结构
curl http://localhost:3000/api/model/sale_order/search?limit=1

# 查看字段列表（需要先注册）
node -e "
  const db = require('better-sqlite3')('data/ehr.db');
  const cols = db.prepare(\"PRAGMA table_info(sale_order)\").all();
  console.log('sale_order 列数:', cols.length);
  cols.slice(0, 10).forEach(c => console.log(' ', c.name, c.type));
"
```

---

## 5. 批量导入

### 5.1 导入 Odoo 基础模块

```bash
node tools/import-odoo.js
```

### 5.2 导入自定义模块集合

```bash
# 创建自定义导入脚本
cat > tools/import_custom.js << 'EOF'
const { execSync } = require('child_process');
const fs = require('fs');

const SOURCES = [
  { file: 'D:/myapps/odoo/odoo/addons/account/models/account_move.py', module: 'account_move' },
  { file: 'D:/myapps/odoo/odoo/addons/hr/models/hr_employee.py', module: 'hr_employee' },
];

let allModels = [];
for (const src of SOURCES) {
  const result = execSync(`python tools/odoo-parser.py "${src.file}"`, { encoding: 'utf-8' });
  const models = JSON.parse(result);
  allModels = allModels.concat(models);
  console.log(`  ${src.module}: ${models.length} 模型`);
}

fs.writeFileSync('tools/_custom.json', JSON.stringify(allModels));
execSync('node tools/odoo2feida.js tools/_custom.json modules/odoo_custom odoo_custom', { stdio: 'inherit' });
EOF

node tools/import_custom.js
```

### 5.3 批量导入所有 addons

```bash
# 遍历 Odoo 的 community addons 目录
for addon in D:/myapps/odoo/odoo/addons/*/; do
  addon_name=$(basename "$addon")
  if [ "$addon_name" = "base" ]; then continue; fi

  model_dir="$addon/models"
  if [ -d "$model_dir" ]; then
    echo "处理: $addon_name"
    python tools/odoo-parser.py "$model_dir" > "tools/_${addon_name}.json" 2>/dev/null
    model_count=$(node -e "try{const j=require('./tools/_${addon_name}.json');process.stdout.write(String(j.length))}catch(e){process.stdout.write('0')}")
    if [ "$model_count" -gt 0 ]; then
      node tools/odoo2feida.js "tools/_${addon_name}.json" "modules/odoo_${addon_name}" "odoo_${addon_name}"
    fi
  fi
done
```

---

## 6. 继承模型处理

### 6.1 场景

Odoo 大量使用模型继承。例如 `hr.employee` 扩展 `res.partner`:

```python
# Odoo: hr/models/hr_employee.py
class HrEmployee(models.Model):
    _name = "hr.employee"
    _inherit = "res.partner"       # ← 继承
    job_title = fields.Char('职位')
```

### 6.2 飞达处理方式 (v1.2+)

```javascript
// 飞达: 自动生成继承模型
exports.model = {
  "_name": "hr_employee",
  "_inherit": "res_partner",     // ← 继承到 res_partner 表
  "_fields": {
    "job_title": { "type": "char", "label": "职位" }
  }
};
```

**模组安装时自动执行**:
1. `ALTER TABLE res_partner ADD COLUMN job_title TEXT DEFAULT ''` — 向父表加列
2. 父模型字段合并 — `res_partner._fields` 扩展了 `job_title`
3. CRUD 操作透传 — `POST /model/res_partner/create` 现在接受 `job_title`

### 6.3 注意事项

- **单继承**: 当前只取第一个 `_inherit` 值
- **多继承**: Odoo 的 `_inherit = ['a', 'b']` 只取第一个
- **列冲突**: 同名字段会被子模型覆盖
- **手动验证**: 导入后检查 `PRAGMA table_info(res_partner)` 确认新列已添加

---

## 7. 数据移植

### 7.1 种子数据

```sql
-- modules/odoo_base/data/seed.sql
INSERT INTO res_company (id, name, phone, email)
VALUES ('company_1', '飞达科技', '010-88888888', 'contact@feida.com');

INSERT INTO res_currency (id, name, symbol, rate)
VALUES
  ('cny', '人民币', '¥', 1.0),
  ('usd', '美元', '$', 0.14),
  ('eur', '欧元', '€', 0.13);

INSERT INTO res_country (id, name, code)
VALUES
  ('cn', '中国', 'CN'),
  ('us', '美国', 'US'),
  ('jp', '日本', 'JP');
```

然后在 `manifest.json` 中声明:
```json
{
  "data": ["data/seed.sql"]
}
```

### 7.2 PostgreSQL 数据导出

```bash
# 从 Odoo 的 PostgreSQL 导出数据
pg_dump -U odoo -h localhost -t res_partner -t res_company --data-only --inserts odoo_db > odoo_data.sql
```

### 7.3 批量插入示例

```javascript
// 脚本: tools/seed_odoo_data.js
const db = require('better-sqlite3')('data/ehr.db');

const currencies = [
  { id: 'cny', name: '人民币', symbol: '¥' },
  { id: 'usd', name: '美元', symbol: '$' },
];

const stmt = db.prepare('INSERT OR REPLACE INTO res_currency (id, name, symbol) VALUES (?, ?, ?)');
for (const c of currencies) stmt.run(c.id, c.name, c.symbol);

console.log('种子数据已写入');
db.close();
```

---

## 8. 字段类型对照

| Odoo Python | 飞达 type | SQL 列类型 | 校验规则 |
|------------|----------|-----------|---------|
| `fields.Char()` | `char` | TEXT | 字符串、maxLength |
| `fields.Text()` | `text` | TEXT | 字符串 |
| `fields.Html()` | `text` | TEXT | 字符串 |
| `fields.Integer()` | `integer` | INTEGER | 整数 |
| `fields.Float()` | `float` | REAL | 数字 |
| `fields.Monetary()` | `float` | REAL | 数字 |
| `fields.Boolean()` | `boolean` | INTEGER DEFAULT 0 | 布尔/0/1 |
| `fields.Date()` | `date` | TEXT | — |
| `fields.Datetime()` | `datetime` | TEXT | — |
| `fields.Selection()` | `selection` | TEXT | 枚举值 |
| `fields.Many2one()` | `many2one` | TEXT DEFAULT '' | — |
| `fields.One2many()` | `one2many` | TEXT | — |
| `fields.Many2many()` | `many2many` | TEXT | — |
| `fields.Binary()` | `text` | TEXT | — |
| `fields.Image()` | `text` | TEXT | — |

### SQL DDL 生成逻辑

```typescript
// 来源: server/modules/orm/fields.ts

function fieldToColumnDDL(name, field) {
  const sqlType = SQL_TYPE_MAP[field.type];

  // 有默认值 → DEFAULT xxx
  if (field.required && field.default !== undefined)
    ddl += ` DEFAULT ${field.default}`;

  // 必填但无默认值:
  //   char/text/many2one → DEFAULT ''（避免 NOT NULL 报错）
  //   其他类型          → NOT NULL
  if (field.required && field.default === undefined && field.type !== 'boolean')
    ddl += (isTextType ? " DEFAULT ''" : ' NOT NULL');
}
```

---

## 9. 常见问题

### Q1: 解析结果为空
```
模型数: 0
```
**原因**: Odoo 文件路径不对或 Python 编码问题。

**解决**:
```bash
# 确认文件存在
ls "D:/myapps/odoo/odoo/addons/base/models/res_partner.py"

# 用绝对路径
python tools/odoo-parser.py "D:/myapps/odoo/odoo/addons/base/models/res_partner.py"

# 检查 Python 版本
python --version  # 需要 3.8+
```

### Q2: NOT NULL constraint failed
```
SqliteError: NOT NULL constraint failed: res_company.partner_id
```
**原因**: Odoo 的 `required=True` 被映射为 NOT NULL，但插入时未提供值。

**解决**:
1. **自动修复** (v1.2.0): char/text/many2one 类型自动 `DEFAULT ''`
2. **手动修复**: 删除旧表重建
```bash
node -e "const db=require('better-sqlite3')('data/ehr.db'); db.exec('DROP TABLE IF EXISTS res_company')"
# 重启服务，表会重新自动创建
```

### Q3: 模型未出现在列表中
```
[ORM] 总计注册 5 个模型  # 期望 69 个
```
**原因**: 模块目录或 manifest.json 有问题。

**检查**:
```bash
# 确认模块目录存在
ls modules/odoo_base/manifest.json
ls modules/odoo_base/models/

# 确认 models/ 下有 .js 文件
ls modules/odoo_base/models/ | head -5
```

### Q4: 多 Many2one 解析失败
```
⚠️ many2one 缺少 relation
```
**原因**: 正则表达式未能提取到关联模型名。

**手动修复**: 编辑生成的 `.js` 文件，手动添加 `relation`:
```javascript
"country_id": { "type": "many2one", "label": "Country", "relation": "res_country" }
```

### Q5: 性能问题（69个模型启动慢）
**原因**: `ensureTable()` 对每个模型执行 `CREATE TABLE IF NOT EXISTS`。

**优化**: 已存在的表不会重复创建，第二次启动几乎无耗时。

### Q6: Odoo 版本兼容性
| Odoo 版本 | 兼容性 |
|----------|-------|
| 16.0 | ✅ 完全兼容 |
| 17.0 | ✅ 完全兼容 |
| 18.0 | ✅ 完全兼容 |
| 19.0 | ✅ 完全兼容 (当前基准) |
| 14.0+ | ✅ 应该兼容 (字段 API 未变) |

字段 API (`fields.Char()` 等) 自 Odoo 8 以来基本稳定。

---

## 10. 参考命令

### 完整导入流程（一键）

```bash
# 1. 导入 Odoo base 模型
node tools/import-odoo.js

# 2. 构建
npm run build:server

# 3. 重启
# Ctrl+C 停止当前服务
node dist/server/standalone.js

# 4. 验证
curl http://localhost:3000/api/model/list | python -c "
import json, sys
data = json.loads(sys.stdin.read())
print(f'总模型: {len(data)}')
odoo = [m for m in data if 'res_' in m['name'] or 'ir_' in m['name']]
print(f'Odoo导入: {len(odoo)}')
for m in odoo[:10]:
    print(f'  {m[\"name\"]} - {m[\"description\"]}')
"
```

### 模型 CRUD

```bash
# 搜索
curl "http://localhost:3000/api/model/res_partner/search?limit=10"

# 浏览单条
curl "http://localhost:3000/api/model/res_currency/browse/cny"

# 创建（自动校验）
curl -X POST http://localhost:3000/api/model/res_company/create \
  -H "Content-Type: application/json" \
  -d '{"name":"新公司","phone":"010-12345678","email":"info@example.com"}'

# 更新
curl -X PUT http://localhost:3000/api/model/res_company/write/company_1 \
  -H "Content-Type: application/json" \
  -d '{"name":"新名称"}'

# 删除
curl -X DELETE http://localhost:3000/api/model/res_company/unlink/company_1
```

### 诊断命令

```bash
# 查看所有模块状态
curl http://localhost:3000/api/modules/list | node -e "
  process.stdin.on('data',d=>JSON.parse(d).forEach(m=>console.log(m.name,m.state)))
"

# 查看特定模型字段
node -e "
  const db=require('better-sqlite3')('data/ehr.db');
  const cols=db.prepare('PRAGMA table_info(res_partner)').all();
  console.log(cols.length,'列');
  cols.forEach(c=>console.log(c.name,c.type,c.notnull?':NOT NULL':''));
"

# 查看表行数
node -e "
  const db=require('better-sqlite3')('data/ehr.db');
  ['res_company','res_currency','res_country'].forEach(t=>{
    const r=db.prepare('SELECT COUNT(*) c FROM '+t).get();
    console.log(t,r.c,'行');
  });
"

# 安装/卸载模块
curl -X POST http://localhost:3000/api/modules/odoo_base/install
curl -X POST http://localhost:3000/api/modules/odoo_base/uninstall

# 模块升级
curl -X POST http://localhost:3000/api/modules/odoo_base/upgrade
```

---

## 附录: 工具文件清单

| 文件 | 语言 | 功能 |
|------|------|------|
| `tools/odoo-parser.py` | Python | 解析 .py → JSON |
| `tools/odoo2feida.js` | Node.js | JSON → 飞达模块 |
| `tools/import-odoo.js` | Node.js | 一键批量导入 |
| `server/modules/orm/fields.ts` | TypeScript | 字段类型系统 |
| `server/modules/orm/orm-model.ts` | TypeScript | ORM 模型基类 |
| `server/modules/orm/model-registry.ts` | TypeScript | 模型注册表 |
| `server/modules/module-registry.ts` | TypeScript | 模块生命周期 |

## 导入成果总览

```
版本:     v1.2.0
总模型:   69 个
Odoo导入: 52 个 (40 base + 12 extended)
飞达原生: 17 个
总字段:   424+ 个 (仅 Odoo 导入)
测试通过: 25/25
```
