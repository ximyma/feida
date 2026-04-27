const db = require('better-sqlite3')('D:/feida/data/ehr.db');

console.log('=== approval_requests schema ===');
try {
  const schema = db.prepare("PRAGMA table_info('approval_requests')").all();
  console.log(JSON.stringify(schema, null, 2));
} catch(e) { console.log('Error:', e.message); }

console.log('\n=== Sample approval_request ===');
try {
  const sample = db.prepare("SELECT * FROM approval_requests LIMIT 1").get();
  console.log(JSON.stringify(sample, null, 2));
} catch(e) { console.log('Error:', e.message); }

console.log('\n=== workflow_templates schema ===');
try {
  const schema = db.prepare("PRAGMA table_info('workflow_templates')").all();
  console.log(JSON.stringify(schema, null, 2));
} catch(e) { console.log('Error:', e.message); }

console.log('\n=== Sample workflow_template ===');
try {
  const sample = db.prepare("SELECT * FROM workflow_templates LIMIT 1").get();
  console.log(JSON.stringify(sample, null, 2));
} catch(e) { console.log('Error:', e.message); }

db.close();
