const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';
const results = {
  emptyPages: [],
  mockOnlyPages: [],
  partialImpl: [],
  completePages: []
};

function analyzeFile(filePath, relPath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;
  
  // 检查是否是空壳页面
  const hasRealContent = content.includes('return (') && content.includes('<div');
  const hasAPI = /fetch\(|useAPI|axios|api\.\w+\(/.test(content);
  const hasMockData = /useState\(\[|mockData|MOCK_DATA|dummyData/.test(content);
  const hasFormHandler = /handleSubmit|onSubmit|handleSave|onSave/.test(content);
  const hasModal = /Modal|Dialog|Drawer/.test(content);
  const hasTable = /DataTable|Table|table/i.test(content);
  
  // 判断页面状态
  if (!hasRealContent || content.length < 500) {
    results.emptyPages.push({ path: relPath, lines, size: content.length });
  } else if (hasMockData && !hasAPI) {
    results.mockOnlyPages.push({ path: relPath, lines, hasForm: hasFormHandler, hasModal, hasTable });
  } else if (hasAPI) {
    results.completePages.push({ path: relPath, lines });
  } else {
    results.partialImpl.push({ path: relPath, lines });
  }
  
  return { hasAPI, hasMockData, hasFormHandler, hasModal, hasTable };
}

function scanDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      scanDir(fullPath);
    } else if (item.name.endsWith('.tsx')) {
      const relPath = path.relative(pagesDir, fullPath).replace(/\\/g, '/');
      analyzeFile(fullPath, relPath);
    }
  }
}

scanDir(pagesDir);

console.log('=== 页面功能分析 ===\n');
console.log(`空壳页面 (${results.emptyPages.length}):`);
results.emptyPages.forEach(p => console.log(`  ${p.path} (${p.lines}行, ${p.size}字节)`));

console.log(`\n仅Mock数据页面 (${results.mockOnlyPages.length}):`);
results.mockOnlyPages.forEach(p => {
  const features = [];
  if (p.hasForm) features.push('表单');
  if (p.hasModal) features.push('弹窗');
  if (p.hasTable) features.push('表格');
  console.log(`  ${p.path} (${p.lines}行) [${features.join(', ')}]`);
});

console.log(`\n部分实现页面 (${results.partialImpl.length}):`);
results.partialImpl.forEach(p => console.log(`  ${p.path} (${p.lines}行)`));

console.log(`\n完整实现页面 (${results.completePages.length}):`);
results.completePages.forEach(p => console.log(`  ${p.path} (${p.lines}行)`));
