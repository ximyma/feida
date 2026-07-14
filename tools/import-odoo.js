#!/usr/bin/env node
/**
 * Odoo批量导入工具 — 一键导入Odoo所有核心模块
 * 用法: node import-odoo.js
 *
 * 步骤:
 *   1. 从Odoo base/models/ 解析所有模型
 *   2. 生成飞达模块 modules/odoo_base/
 *   3. 构建并重启服务
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ODOO_MODELS_DIR = 'D:/myapps/odoo/odoo/addons/base/models';
const OUTPUT_DIR = 'modules/odoo_base';
const MODULE_NAME = 'odoo_base';

// 主要模型文件 (跳过继承链的mixin文件)
const TARGET_FILES = [
  'res_partner.py', 'res_users.py', 'res_company.py', 'res_country.py',
  'res_bank.py', 'res_currency.py', 'res_lang.py', 'ir_attachment.py',
  'ir_actions.py', 'ir_model.py', 'ir_http.py',
];

console.log('[Import] 从 Odoo base 模块导入...');
console.log(`  源: ${ODOO_MODELS_DIR}`);
console.log(`  目标: ${OUTPUT_DIR}`);

// Step 1: 解析
let allModels = [];
for (const f of TARGET_FILES) {
  const fp = path.join(ODOO_MODELS_DIR, f);
  if (!fs.existsSync(fp)) { console.log(`  ⚠️ 跳过: ${f}`); continue; }
  try {
    const result = execSync(`python tools/odoo-parser.py "${fp}"`, { encoding: 'utf-8', maxBuffer: 10*1024*1024 });
    const models = JSON.parse(result);
    console.log(`  ✓ ${f}: ${models.length} 模型`);
    allModels = allModels.concat(models);
  } catch (e) {
    console.log(`  ✗ ${f}: ${e.message}`);
  }
}

// 去重
const seen = new Set();
allModels = allModels.filter(m => {
  if (seen.has(m._name)) return false;
  seen.add(m._name);
  return true;
});

console.log(`\n[Import] 总计: ${allModels.length} 个唯一模型`);
const totalFields = allModels.reduce((s, m) => s + Object.keys(m._fields).length, 0);
console.log(`[Import] 字段总数: ${totalFields}`);

// Step 2: 保存JSON
const jsonPath = 'tools/_odoo_base_models.json';
fs.writeFileSync(jsonPath, JSON.stringify(allModels, null, 2));
console.log(`[Import] JSON已保存: ${jsonPath}`);

// Step 3: 生成模块
try {
  execSync(`node tools/odoo2feida.js ${jsonPath} ${OUTPUT_DIR} ${MODULE_NAME}`, { stdio: 'inherit' });
} catch (e) {
  console.error('转换失败:', e.message);
  process.exit(1);
}

console.log('\n[Import] ✅ 完成! 下一步:');
console.log('  npm run build:server');
console.log('  node dist/server/standalone.js');
