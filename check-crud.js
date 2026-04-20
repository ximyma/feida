const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';
const issues = [];

function checkPage(filePath, relPath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const pageIssues = [];
  
  // 检查新增按钮
  if (content.includes("alert('新增功能开发中')") || content.includes('alert("新增功能开发中")')) {
    pageIssues.push('新增按钮未实现(仅alert)');
  }
  
  // 检查编辑按钮
  if (!content.includes('编辑') && !content.includes('edit') && !content.includes('Edit')) {
    pageIssues.push('缺少编辑功能');
  }
  
  // 检查表单/弹窗
  if (!content.includes('dialog') && !content.includes('Dialog') && !content.includes('Modal') && !content.includes('modal')) {
    pageIssues.push('缺少表单弹窗');
  }
  
  // 检查表单提交
  if (!content.includes('POST') && !content.includes('post') && !content.includes('method: \'POST\'') && !content.includes('method: "POST"')) {
    pageIssues.push('缺少新增API调用(POST)');
  }
  
  // 检查更新
  if (!content.includes('PUT') && !content.includes('put') && !content.includes('method: \'PUT\'')) {
    pageIssues.push('缺少更新API调用(PUT)');
  }
  
  if (pageIssues.length > 0) {
    issues.push({ path: relPath, issues: pageIssues, size: content.length });
  }
}

function scanDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      scanDir(fullPath);
    } else if (item.name.endsWith('.tsx')) {
      const relPath = path.relative(pagesDir, fullPath).replace(/\\/g, '/');
      checkPage(fullPath, relPath);
    }
  }
}

scanDir(pagesDir);

console.log('=== 需要完善CRUD的页面 (' + issues.length + ') ===\n');
issues.forEach(p => {
  console.log(`${p.path} (${p.size}字节)`);
  p.issues.forEach(i => console.log(`  - ${i}`));
});
