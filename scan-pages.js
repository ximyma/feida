const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';
const results = { api: [], mock: [], unknown: [] };

function scan(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      scan(fullPath);
    } else if (item.name.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const hasApi = /fetch\(|useAPI|axios|api\.\w+\(/.test(content);
      const hasMock = /useState\(\[|useState\(\s*\[|mockData|MOCK/.test(content);
      const relPath = path.relative(pagesDir, fullPath).replace(/\\/g, '/');
      
      if (hasApi) {
        results.api.push(relPath);
      } else if (hasMock && !hasApi) {
        results.mock.push(relPath);
      } else {
        results.unknown.push(relPath);
      }
    }
  }
}

scan(pagesDir);

console.log('=== 页面改造状态 ===\n');
console.log(`已改造 (使用API): ${results.api.length} 个`);
console.log(`待改造 (使用Mock): ${results.mock.length} 个`);
console.log(`状态未知: ${results.unknown.length} 个\n`);

console.log('\n=== 待改造页面列表 (使用Mock数据) ===');
results.mock.forEach(f => console.log('  ' + f));
