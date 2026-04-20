const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'client/src/pages');
const files = [];

function scanDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
}

scanDir(pagesDir);

console.log(`Found ${files.length} pages\n`);

const issues = [];
const ok = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relative = path.relative(pagesDir, file);
  
  // Check for useAPI import
  const hasUseAPI = content.includes('useAPI') || content.includes('fetch');
  
  // Check for hardcoded data (useState with array)
  const hasHardcoded = /useState\s*<[^>]*>\s*\(\s*\[/.test(content) || /useState\s*\(\s*\[\s*\{/.test(content);
  
  // Check for sessionStorage
  const hasSessionStorage = content.includes('sessionStorage');
  
  if (hasHardcoded && !hasUseAPI) {
    issues.push({ file: relative, reason: 'Hardcoded data, no API' });
  } else if (hasSessionStorage) {
    issues.push({ file: relative, reason: 'Uses sessionStorage' });
  } else if (!hasUseAPI && !content.includes('LoginPage') && !content.includes('NotFound')) {
    issues.push({ file: relative, reason: 'No API calls' });
  } else {
    ok.push(relative);
  }
}

console.log('=== Pages with issues ===');
issues.forEach(i => console.log(`  ${i.file}: ${i.reason}`));

console.log(`\n=== OK pages (${ok.length}) ===`);
ok.slice(0, 10).forEach(f => console.log(`  ${f}`));
if (ok.length > 10) console.log(`  ... and ${ok.length - 10} more`);

console.log(`\nTotal: ${files.length}, Issues: ${issues.length}, OK: ${ok.length}`);
