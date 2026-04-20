const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';

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
      
      if (!hasApi && !hasMock) {
        console.log('\n=== ' + relPath + ' ===');
        console.log('前200字符:', content.slice(0, 500));
        console.log('...');
      }
    }
  }
}

scan(pagesDir);
