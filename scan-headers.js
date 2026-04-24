const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';
const results = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative('D:/feida/client/src', filePath);
  
  // Find <th> tags
  const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/gi;
  let match;
  const englishHeaders = [];
  while ((match = thRegex.exec(content)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text && /[a-zA-Z]/.test(text) && !/[\u4e00-\u9fff]/.test(text)) {
      englishHeaders.push(text);
    }
  }
  
  // Also check for table header patterns in JSX like { key: 'xxx', label: 'XXX' } or title: 'XXX'
  const labelRegex = /(?:label|title|header|name):\s*['"]([A-Z][a-zA-Z\s]+)['"]/g;
  while ((match = labelRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && !/[\u4e00-\u9fff]/.test(text)) {
      englishHeaders.push(`[label] ${text}`);
    }
  }
  
  if (englishHeaders.length > 0) {
    results.push({ file: relPath, headers: englishHeaders });
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(fullPath);
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) scanFile(fullPath);
  }
}

walkDir(pagesDir);
console.log(`Found ${results.length} files with English headers:\n`);
for (const r of results) {
  console.log(`📄 ${r.file}`);
  r.headers.forEach(h => console.log(`   - ${h}`));
  console.log('');
}
