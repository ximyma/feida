#!/usr/bin/env node
/**
 * Odoo → 飞达 模块转换器
 * 用法: node odoo2feida.js <parsed.json> [output_dir] [module_name]
 *
 * 输入: odoo-parser.py 生成的 JSON
 * 输出: 飞达 modules/<module_name>/ 目录
 */
const fs = require('fs');
const path = require('path');

function main() {
  const jsonFile = process.argv[2];
  const outputDir = process.argv[3] || 'modules/odoo_import';
  const moduleName = process.argv[4] || 'odoo_import';

  if (!jsonFile) {
    console.error('Usage: node odoo2feida.js <parsed.json> [output_dir] [module_name]');
    console.error('  parsed.json: odoo-parser.py 的输出');
    console.error('  output_dir:  目标目录 (默认: modules/odoo_import)');
    console.error('  module_name: 模块技术名 (默认: odoo_import)');
    process.exit(1);
  }

  const models = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
  console.log(`[Converter] 解析到 ${models.length} 个 Odoo 模型`);

  // 创建模块目录
  const modDir = path.resolve(outputDir);
  const modelsDir = path.join(modDir, 'models');
  fs.mkdirSync(modelsDir, { recursive: true });

  // 生成 manifest.json
  const manifest = {
    name: moduleName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    name_en: moduleName,
    version: '1.0.0',
    author: 'Odoo Import',
    license: 'LGPL-3.0',
    category: 'Odoo/Import',
    depends: [],
    summary: `从 Odoo 导入的 ${models.length} 个模型`,
    description: `自动从 Odoo Python 模型定义转换而来。包含: ${models.map(m => m._odoo_name || m._name).join(', ')}`,
    installable: true,
    auto_install: true,
    application: false,
    sequence: 500,
    data: [],
  };

  // 分类模型: 独立模型 vs 继承模型
  const standalone = models.filter(m => !m._inherit || m._inherit.length === 0);
  const inherited = models.filter(m => m._inherit && m._inherit.length > 0);

  console.log("  - 独立模型: " + standalone.length);
  standalone.forEach(m => console.log("    " + m._name + " (" + (m._odoo_name || '') + ")"));
  console.log("  - 继承模型: " + inherited.length);
  inherited.forEach(m => console.log("    " + m._name + " → " + m._inherit.join(', ')));

  // 生成模型文件
  for (const model of [standalone, inherited]) {
    for (const m of model) {
      generateModelFile(m, modelsDir);
    }
  }

  // 生成 manifest
  fs.writeFileSync(path.join(modDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  
  // 统计
  const totalFields = models.reduce((s, m) => s + Object.keys(m._fields).length, 0);
  console.log(`\n[Converter] ✅ 完成:`);
  console.log(`  模块:   ${modDir}`);
  console.log(`  模型:   ${models.length} 个`);
  console.log(`  字段:   ${totalFields} 个`);
  console.log(`  独立:   ${standalone.length}`);
  console.log(`  继承:   ${inherited.length}`);

  // 列出可能不兼容的字段
  const unsupported = [];
  for (const m of models) {
    for (const [name, field] of Object.entries(m._fields)) {
      if (field.type === 'many2one' && !field.relation) {
        unsupported.push(`${m._name}.${name}: many2one 缺少 relation`);
      }
    }
  }
  if (unsupported.length) {
    console.log(`\n  ⚠️  ${unsupported.length} 个字段可能需手动调整:`);
    unsupported.slice(0, 5).forEach(u => console.log(`    - ${u}`));
  }
}

function generateModelFile(model, outputDir) {
  const suffix = model._inherit && model._inherit.length > 0 ? '_inherit' : '';
  const fileName = `${model._name}${suffix}.js`;
  const filePath = path.join(outputDir, fileName);

  const def = {
    _name: model._name,
    _description: model._description || model._name,
    _fields: model._fields,
  };

  if (model._inherit && model._inherit.length > 0) {
    def._inherit = model._inherit[0]; // 取第一个父模型
  }

  // 每个模型独立一个文件
  const content = `// Auto-generated from Odoo model: ${model._odoo_name || model._name}\n// Description: ${model._description}\n\nexports.model = ${JSON.stringify(def, null, 2)};\n`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

main();
