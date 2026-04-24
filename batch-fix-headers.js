const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';
const modifiedFiles = [];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative('D:/feida/client/src', filePath);
  
  // Check if this file uses dynamic columns pattern
  if (!content.includes('Object.keys(data[0])')) return;
  
  let modified = false;
  
  // 1. Add import if not exists
  if (!content.includes("from '@/utils/fieldLabels'")) {
    // Find the last import statement
    const importRegex = /^import .+ from .+;?\s*$/gm;
    let lastImportMatch;
    let lastImportEnd = 0;
    while ((lastImportMatch = importRegex.exec(content)) !== null) {
      lastImportEnd = lastImportMatch.index + lastImportMatch[0].length;
    }
    if (lastImportEnd > 0) {
      const importStatement = "import { fieldToLabel } from '@/utils/fieldLabels';\n";
      content = content.slice(0, lastImportEnd) + importStatement + content.slice(lastImportEnd);
      modified = true;
    }
  }
  
  // 2. Replace table header: {col} -> {fieldToLabel(col)}
  // Pattern: <th ...>{col}</th>
  const thRegex = /<th([^>]*)>\s*\{col\}\s*<\/th>/g;
  if (thRegex.test(content)) {
    content = content.replace(/<th([^>]*)>\s*\{col\}\s*<\/th>/g, '<th$1>{fieldToLabel(col)}</th>');
    modified = true;
  }
  
  // 3. Replace form label: {field} -> {fieldToLabel(field)}
  // Pattern: <label ...>{field}</label>
  const labelRegex = /<label([^>]*)>\s*\{field\}\s*<\/label>/g;
  if (labelRegex.test(content)) {
    content = content.replace(/<label([^>]*)>\s*\{field\}\s*<\/label>/g, '<label$1>{fieldToLabel(field)}</label>');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles.push(relPath);
    console.log('✅ Modified:', relPath);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(fullPath);
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) processFile(fullPath);
  }
}

walkDir(pagesDir);
console.log(`\n=== Summary ===`);
console.log(`Modified ${modifiedFiles.length} files`);
