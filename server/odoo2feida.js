/**
 * odoo2feida.js — Odoo JSON → 飞达 ORM 模块转换器
 * 将 parser 输出的 JSON 转换为飞达 modules/ 目录下的可加载模块
 * 用法: node odoo2feida.js <json文件> [目标目录]
 */
const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('用法: node odoo2feida.js <json文件> [输出目录]');
    console.error('  json文件: odoo-parser.py 输出的 JSON');
    console.error('  输出目录: 默认 modules/<module_name>');
    process.exit(1);
  }

  const jsonFile = args[0];
  const targetDir = args[1] || path.join(process.cwd(), 'modules');

  const raw = fs.readFileSync(jsonFile, 'utf-8');
  const data = JSON.parse(raw);

  if (!data.module || !data.models || data.models.length === 0) {
    console.error('错误: JSON 格式无效，需包含 module 和 models 字段');
    process.exit(1);
  }

  const moduleDir = path.join(targetDir, data.module);
  const modelsDir = path.join(moduleDir, 'models');
  fs.mkdirSync(modelsDir, { recursive: true });

  // 将模型按 _name 分组写入 models.js (飞达格式)
  const models = data.models.map(m => {
    const def = { ...m };
    // 清理: 移除 Python 特有的 None 值
    if (def._fields) {
      for (const [k, v] of Object.entries(def._fields)) {
        if (v.default === null) delete v.default;
        if (v.relation === null) delete v.relation;
      }
    }
    return def;
  });

  const content = '// Odoo 模块: ' + data.module + '\n' +
    '// 由 odoo-parser.py + odoo2feida.js 自动生成\n' +
    'exports.models = ' + JSON.stringify(models, null, 2) + ';\n';

  fs.writeFileSync(path.join(modelsDir, 'models.js'), content, 'utf-8');

  // 生成 manifest
  const manifest = {
    name: data.module,
    version: '1.0.0',
    author: 'Odoo Import',
    description: '从 Odoo 模块导入: ' + data.module,
    depends: [],
    installable: true,
    auto_install: false,
  };
  fs.writeFileSync(path.join(moduleDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  const totalFields = models.reduce((s, m) => s + Object.keys(m._fields || {}).length, 0);
  console.log(JSON.stringify({
    module: data.module,
    models: models.length,
    fields: totalFields,
    path: moduleDir,
  }));
}

main();
