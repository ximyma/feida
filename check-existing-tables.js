const db = require('better-sqlite3')('D:/feida/data/ehr.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('All tables:', tables.map(t => t.name).join(', '));

// Check specific tables
const check = ['approval_requests', 'workflow_templates', 'document_folders', 'documents', 
  'announcements', 'surveys', 'meeting_rooms', 'meetings', 'office_supplies', 'supply_requests',
  'recruitment_positions', 'candidates', 'talent_pools', 'talent_tags', 'interviews', 
  'email_templates', 'email_logs', 'training_plans', 'training_courses', 'training_classes',
  'training_records', 'assessment_templates', 'assessment_tools', 'competency_items',
  'competency_models', 'assessment_results', 'talent_reports', 'employee_changes'];

console.log('\n=== Checking specific tables ===');
for (const t of check) {
  try {
    const count = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get();
    console.log(`✓ ${t}: ${count.c} rows`);
  } catch(e) {
    console.log(`✗ ${t}: NOT EXISTS`);
  }
}
db.close();
