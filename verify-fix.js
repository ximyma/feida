const Database = require('better-sqlite3');
const http = require('http');

const db = new Database('data/ehr.db');

console.log('=== 数据库验证 ===\n');

// 检查缺少的列是否已添加
const tablesToCheck = {
  'approval_requests': ['requesterId'],
  'workflow_instances': ['requesterId'],
  'employee_changes': ['requesterId'],
  'employee_subsets': ['subsetType'],
};

for (const [table, columns] of Object.entries(tablesToCheck)) {
  try {
    const info = db.prepare(`PRAGMA table_info(${table})`).all();
    const cols = info.map(c => c.name);
    for (const col of columns) {
      if (cols.includes(col)) {
        console.log(`✓ ${table}.${col} 存在`);
      } else {
        console.log(`✗ ${table}.${col} 不存在!`);
      }
    }
  } catch (e) {
    console.log(`✗ 表 ${table} 不存在:`, e.message);
  }
}

console.log('\n=== 表存在性验证 ===\n');

const tablesToExist = [
  'document_permissions',
  'folder_permissions',
  'file_storage',
  'survey_options',
  'doc_folders',  // view
];

for (const table of tablesToExist) {
  try {
    // Try to query the table
    db.prepare(`SELECT * FROM ${table} LIMIT 1`).all();
    console.log(`✓ 表/视图 ${table} 存在并可查询`);
  } catch (e) {
    console.log(`✗ 表/视图 ${table} 不存在或无法查询: ${e.message}`);
  }
}

console.log('\n=== API 端点测试 ===\n');

// 测试 API 端点
const endpoints = [
  '/api/salary_items',
  '/api/kpis',
  '/api/performance_records',
  '/api/performance_cycles',
  '/api/doc_folders',
  '/api/document_permissions',
  '/api/folder_permissions',
  '/api/file_storage',
  '/api/survey_options',
];

const testEndpoint = (path) => {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✓ ${path} - ${res.statusCode}`);
        } else {
          console.log(`✗ ${path} - ${res.statusCode} ${data.slice(0, 100)}`);
        }
        resolve();
      });
    }).on('error', (e) => {
      console.log(`✗ ${path} - 错误: ${e.message}`);
      resolve();
    });
  });
};

(async () => {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n=== 修复完成 ===');
  console.log('请访问以下页面验证:');
  console.log('  http://localhost:3000/salary/formula');
  console.log('  http://localhost:3000/performance');
  
  db.close();
})();
