/**
 * 模块脚手架 — npx feida create-module <name>
 *
 * 参照 Odoo scaffold 命令，生成标准模块目录结构:
 *   modules/<name>/
 *     manifest.json
 *     models/
 *     views/        (前端页面)
 *     data/         (种子SQL)
 *     hooks/        (生命周期)
 *     security/     (访问控制)
 *     README.md
 */
import fs from 'fs';
import path from 'path';

interface ScaffoldOptions {
  name: string;
  name_en?: string;
  category: string;
  depends?: string[];
  application?: boolean;
  description?: string;
}

const MODULE_TEMPLATE = {
  manifest: (opts: ScaffoldOptions) => JSON.stringify({
    name: opts.name,
    name_en: opts.name_en || opts.name,
    version: '1.0.0',
    author: '飞达',
    license: 'Apache-2.0',
    category: opts.category,
    depends: opts.depends || ['base'],
    summary: `${opts.name}模块`,
    description: `${opts.name} - 自动生成的飞达模块`,
    installable: true,
    application: opts.application ?? false,
    sequence: 100,
    data: [`data/${toSnake(opts.name)}_seed.sql`],
    hooks: {
      post_init: 'hooks/post_init.js',
      uninstall: 'hooks/uninstall.js',
    },
  }, null, 2),

  seedSql: (opts: ScaffoldOptions) => `-- ${opts.name} 种子数据
-- INSERT INTO <table> (id, name) VALUES ('...', '...');
`,

  postInit: (opts: ScaffoldOptions) => `/**
 * ${opts.name} - 安装后钩子
 * 在模块数据文件加载完毕后执行
 *
 * @param {import('../../../server/modules/database/database-driver').IDatabaseDriver} db
 */
module.exports = function postInit(db) {
  console.log('[${opts.name}] 模块已安装');
  // 在这里执行安装后的初始化逻辑
};
`,

  uninstall: (opts: ScaffoldOptions) => `/**
 * ${opts.name} - 卸载钩子
 *
 * @param {import('../../../server/modules/database/database-driver').IDatabaseDriver} db
 */
module.exports = function uninstall(db) {
  console.log('[${opts.name}] 模块已卸载');
  // 在这里执行清理逻辑 (注意: 不删除数据表, 避免数据丢失)
};
`,

  readme: (opts: ScaffoldOptions) => `# ${opts.name}

${opts.description}

## 依赖
${(opts.depends || ['base']).map(d => `- ${d}`).join('\n')}

## 数据模型
- *(在此列出模块的数据表)*

## 前端页面
- *(在此列出模块的前端路由)*

## 安装
\`\`\`bash
npx feida install-module ${toSnake(opts.name)}
\`\`\`
`,

  security: () => `[
  { "model": "employee", "group": "hr_user", "perms": "read,write" },
  { "model": "department", "group": "hr_user", "perms": "read" }
]
`,
};

function toSnake(name: string): string {
  return name.toLowerCase().replace(/[\s\u4e00-\u9fa5]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function toPascal(name: string): string {
  return toSnake(name).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/** 生成模块骨架 */
export function scaffoldModule(opts: ScaffoldOptions, targetDir: string): string {
  const techName = toSnake(opts.name);
  const moduleDir = path.join(targetDir, techName);

  if (fs.existsSync(moduleDir)) {
    throw new Error(`模块目录已存在: ${moduleDir}`);
  }

  const dirs = ['models', 'views', 'data', 'hooks', 'security', 'static'];
  for (const d of dirs) {
    fs.mkdirSync(path.join(moduleDir, d), { recursive: true });
  }

  fs.writeFileSync(path.join(moduleDir, 'manifest.json'), MODULE_TEMPLATE.manifest(opts), 'utf-8');
  fs.writeFileSync(path.join(moduleDir, 'data', `${techName}_seed.sql`), MODULE_TEMPLATE.seedSql(opts), 'utf-8');
  fs.writeFileSync(path.join(moduleDir, 'hooks', 'post_init.js'), MODULE_TEMPLATE.postInit(opts), 'utf-8');
  fs.writeFileSync(path.join(moduleDir, 'hooks', 'uninstall.js'), MODULE_TEMPLATE.uninstall(opts), 'utf-8');
  fs.writeFileSync(path.join(moduleDir, 'README.md'), MODULE_TEMPLATE.readme(opts), 'utf-8');
  fs.writeFileSync(path.join(moduleDir, 'security', 'access.json'), MODULE_TEMPLATE.security(), 'utf-8');

  console.log(`✅ 模块已创建: ${moduleDir}`);
  console.log(`   技术名: ${techName}`);
  console.log(`   安装: npx feida install-module ${techName}`);

  return moduleDir;
}

/** CLI 入口 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const name = args[1];
  const category = args[2] || 'Uncategorized';

  if (cmd === 'create-module' && name) {
    const targetDir = path.resolve(process.cwd(), 'modules');
    scaffoldModule({ name, category }, targetDir);
  } else if (cmd === 'list-modules') {
    const dir = path.resolve(process.cwd(), 'modules');
    if (fs.existsSync(dir)) {
      const mods = fs.readdirSync(dir, { withFileTypes: true })
        .filter(e => e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'manifest.json')))
        .map(e => e.name);
      console.log('已安装模块:', mods.join(', ') || '(无)');
    }
  } else {
    console.log('飞达模块脚手架');
    console.log('  npx feida create-module <名称> [分类]   创建模块');
    console.log('  npx feida list-modules                    列出模块');
  }
}
