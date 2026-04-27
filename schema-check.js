// Check all training table schemas
const db = require('better-sqlite3')('D:/feida/data/ehr.db');
const tables = ['training_plans', 'training_courses', 'training_classes', 'training_records', 'assessment_templates'];
tables.forEach(t => {
  console.log('\n=== ' + t + ' ===');
  try {
    const cols = db.prepare(`PRAGMA table_info(${t})`).all();
    cols.forEach(c => console.log(` ${c.name}: ${c.type} (${c.notnull ? 'NOT NULL' : 'NULL'})`));
  } catch(e) { console.log('ERROR:', e.message); }
});
db.close();