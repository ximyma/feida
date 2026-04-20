const fs = require('fs');
const path = require('path');

const pagesDir = 'D:/feida/client/src/pages';
const problemPages = [];

// 检查页面是否有问题的函数
function checkPage(filePath, relPath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // 检查是否引用了不存在的类型
  const typeImports = content.match(/import\s*\{[^}]*\}\s*from\s*['"]@\/store\/usePersonnelData['"]/);
  if (typeImports) {
    // 检查是否使用了 IEmployeeChange, IReminder 等不存在的类型
    if (content.includes('IEmployeeChange') || content.includes('IReminder')) {
      issues.push('引用了不存在的类型(IEmployeeChange/IReminder)');
    }
    // 检查是否使用了不存在的方法
    if (content.includes('employeeChanges') || content.includes('addEmployeeChange')) {
      issues.push('使用了不存在的方法(employeeChanges/addEmployeeChange)');
    }
    if (content.includes('reminders') && !content.includes('reminderRules')) {
      issues.push('使用了不存在的方法(reminders)');
    }
  }
  
  // 检查是否只用了usePersonnelData而没有实际API调用
  if (content.includes('usePersonnelData') && !content.includes('fetch(') && !content.includes('useAPI')) {
    issues.push('只使用sessionStorage,未调用API');
  }
  
  // 检查是否有useAPI导入但未使用
  if (content.includes("import { useAPI }") && !content.includes('useAPI()')) {
    issues.push('导入了useAPI但未使用');
  }
  
  if (issues.length > 0) {
    problemPages.push({ path: relPath, issues, size: content.length });
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

console.log('=== 有问题的页面 (' + problemPages.length + ') ===\n');
problemPages.forEach(p => {
  console.log(`${p.path} (${p.size}字节)`);
  p.issues.forEach(i => console.log(`  - ${i}`));
});
