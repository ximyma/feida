const Database = require('better-sqlite3');
const db = new Database('./data/ehr.db');

console.log('=== Creating document permission tables ===');

// 1. 文档权限表 - 精确到每个用户/角色的权限
db.exec(`
  CREATE TABLE IF NOT EXISTS document_permissions (
    id TEXT PRIMARY KEY,
    documentId TEXT NOT NULL,
    targetType TEXT NOT NULL,  -- 'user', 'role', 'department', 'all'
    targetId TEXT,              -- userId/roleId/departmentId, null for 'all'
    permission TEXT NOT NULL,   -- 'read', 'write', 'delete', 'admin'
    grantedBy TEXT,             -- 授权人userId
    grantedAt TEXT,
    FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
  )
`);

// 2. 文件夹权限表
db.exec(`
  CREATE TABLE IF NOT EXISTS folder_permissions (
    id TEXT PRIMARY KEY,
    folderId TEXT NOT NULL,
    targetType TEXT NOT NULL,
    targetId TEXT,
    permission TEXT NOT NULL,
    inherited INTEGER DEFAULT 0,  -- 是否继承自父文件夹
    grantedBy TEXT,
    grantedAt TEXT,
    FOREIGN KEY (folderId) REFERENCES doc_folders(id) ON DELETE CASCADE
  )
`);

// 3. 文件存储表 - 记录实际上传的文件
db.exec(`
  CREATE TABLE IF NOT EXISTS file_storage (
    id TEXT PRIMARY KEY,
    documentId TEXT NOT NULL,
    originalName TEXT NOT NULL,
    storedName TEXT NOT NULL,    -- 服务器存储的文件名
    filePath TEXT NOT NULL,      -- 实际存储路径
    mimeType TEXT,
    size INTEGER,
    uploadedBy TEXT,
    uploadedAt TEXT,
    FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
  )
`);

// 4. 部门表检查
const deptTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='departments'").get();
if (!deptTable) {
  console.log('Creating departments table...');
  db.exec(`
    CREATE TABLE departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parentId TEXT,
      managerId TEXT,
      createdAt TEXT
    )
  `);
}

// 创建索引
db.exec(`CREATE INDEX IF NOT EXISTS idx_doc_perm_doc ON document_permissions(documentId)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_doc_perm_target ON document_permissions(targetType, targetId)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_folder_perm_folder ON folder_permissions(folderId)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_file_storage_doc ON file_storage(documentId)`);

console.log('=== Tables created successfully ===');

// 检查现有员工数据
const employees = db.prepare('SELECT id, realName, departmentId FROM employees LIMIT 10').all();
console.log('\nSample employees:', employees.length);
employees.forEach(e => console.log('  ', e.id, e.realName, e.departmentId));

// 检查部门数据
const depts = db.prepare('SELECT id, name FROM departments LIMIT 10').all();
console.log('\nDepartments:', depts.length);
depts.forEach(d => console.log('  ', d.id, d.name));

db.close();
console.log('\n=== Done ===');
