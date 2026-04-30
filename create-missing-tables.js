const Database = require('better-sqlite3');
const db = new Database('data/ehr.db');

try {
  // 创建 document_permissions 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS document_permissions (
      id TEXT PRIMARY KEY,
      documentId TEXT NOT NULL,
      targetType TEXT NOT NULL,
      targetId TEXT NOT NULL,
      permission TEXT DEFAULT 'read',
      grantedBy TEXT,
      grantedAt TEXT,
      FOREIGN KEY (documentId) REFERENCES documents(id)
    )
  `);
  console.log('✓ Created document_permissions table');
} catch (e) { console.log('document_permissions:', e.message); }

try {
  // 创建 folder_permissions 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS folder_permissions (
      id TEXT PRIMARY KEY,
      folderId TEXT NOT NULL,
      targetType TEXT NOT NULL,
      targetId TEXT NOT NULL,
      permission TEXT DEFAULT 'read',
      inherited INTEGER DEFAULT 0,
      grantedBy TEXT,
      grantedAt TEXT,
      FOREIGN KEY (folderId) REFERENCES document_folders(id)
    )
  `);
  console.log('✓ Created folder_permissions table');
} catch (e) { console.log('folder_permissions:', e.message); }

try {
  // 创建 file_storage 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS file_storage (
      id TEXT PRIMARY KEY,
      documentId TEXT NOT NULL,
      originalName TEXT NOT NULL,
      storedName TEXT NOT NULL,
      filePath TEXT NOT NULL,
      mimeType TEXT,
      size INTEGER DEFAULT 0,
      uploadedBy TEXT,
      uploadedAt TEXT,
      FOREIGN KEY (documentId) REFERENCES documents(id)
    )
  `);
  console.log('✓ Created file_storage table');
} catch (e) { console.log('file_storage:', e.message); }

try {
  // 创建 survey_options 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_options (
      id TEXT PRIMARY KEY,
      surveyId TEXT NOT NULL,
      questionId TEXT,
      optionText TEXT NOT NULL,
      optionOrder INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (surveyId) REFERENCES surveys(id)
    )
  `);
  console.log('✓ Created survey_options table');
} catch (e) { console.log('survey_options:', e.message); }

try {
  // 创建 doc_folders 视图或别名表（实际表名是 document_folders）
  // 为了兼容代码中的引用，创建一个视图
  db.exec(`CREATE VIEW IF NOT EXISTS doc_folders AS SELECT * FROM document_folders`);
  console.log('✓ Created doc_folders view');
} catch (e) { console.log('doc_folders view:', e.message); }

console.log('\nAll missing tables created successfully');
db.close();
