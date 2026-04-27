const fs = require('fs');

// Read the database.service.ts file
const filePath = 'D:/feida/server/modules/database/database.service.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// Find the insertion point - before the closing backtick after CREATE INDEX statements
const marker = "      CREATE INDEX IF NOT EXISTS idx_cfg_cat ON report_configs(category);\n    `;";

const newTables = `      CREATE INDEX IF NOT EXISTS idx_cfg_cat ON report_configs(category);
      CREATE TABLE IF NOT EXISTS workflow_templates (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
        description TEXT, steps TEXT DEFAULT '[]', isActive INTEGER DEFAULT 1,
        createdBy TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS meeting_rooms (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, capacity INTEGER DEFAULT 10,
        location TEXT, equipment TEXT DEFAULT '[]', status TEXT DEFAULT 'available',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, roomId TEXT NOT NULL,
        organizer TEXT, organizerId TEXT, startTime TEXT, endTime TEXT,
        participants TEXT DEFAULT '[]', description TEXT, status TEXT DEFAULT 'scheduled',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS office_supplies (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT,
        stock INTEGER DEFAULT 0, unit TEXT, price REAL DEFAULT 0,
        safetyStock INTEGER DEFAULT 10, supplier TEXT, location TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS supply_requests (
        id TEXT PRIMARY KEY, supplyId TEXT NOT NULL, supplyName TEXT,
        quantity INTEGER DEFAULT 1, requesterId TEXT, requesterName TEXT,
        purpose TEXT, pickupTime TEXT, status TEXT DEFAULT 'pending',
        approver TEXT, approvedAt TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS talent_tags (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT DEFAULT 'blue',
        type TEXT DEFAULT 'talent', description TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS email_templates (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
        subject TEXT, content TEXT, variables TEXT DEFAULT '[]',
        isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS email_logs (
        id TEXT PRIMARY KEY, templateId TEXT, templateName TEXT,
        recipientName TEXT, recipientEmail TEXT, subject TEXT,
        status TEXT DEFAULT 'pending', sentAt TEXT, error TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS training_classes (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, planId TEXT,
        instructor TEXT, startDate TEXT, endDate TEXT,
        location TEXT, capacity INTEGER DEFAULT 30, enrolledCount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'upcoming', qrCode TEXT, description TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS assessment_templates (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, applicableCourse TEXT,
        questionTypes TEXT DEFAULT '[]', totalScore INTEGER DEFAULT 100,
        passingScore INTEGER DEFAULT 60, isActive INTEGER DEFAULT 1,
        questions TEXT DEFAULT '[]', createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    \`;`;

if (content.includes(marker)) {
  content = content.replace(marker, newTables);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('SUCCESS: Added 10 new tables to database.service.ts');
} else {
  console.log('ERROR: Could not find insertion marker');
  // Try alternative marker
  const altMarker = "CREATE INDEX IF NOT EXISTS idx_cfg_cat ON report_configs(category);";
  if (content.includes(altMarker)) {
    console.log('Found alternative marker, trying that...');
    content = content.replace(altMarker, newTables.replace('\n    `;', ''));
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('SUCCESS with alternative marker');
  }
}
