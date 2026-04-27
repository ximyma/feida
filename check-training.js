const {DatabaseService} = require('D:/feida/dist/server/modules/database/database.service.js');
const db = new DatabaseService();
const targets = ['training_plans', 'training_courses', 'training_classes', 'training_records', 'assessment_templates', 'employees'];

const tables = db.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
console.log('=== Table existence ===');
targets.forEach(n => console.log(n, tables.includes(n) ? '✓' : '✗'));

console.log('\n=== Row counts ===');
targets.forEach(t => {
  try {
    const c = db.db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get().c;
    console.log(`${t}: ${c} rows`);
  } catch(e) { console.log(`${t}: ERROR - ${e.message}`); }
});

// Sample data from training_plans
try {
  const plans = db.db.prepare('SELECT * FROM training_plans LIMIT 2').all();
  console.log('\n=== training_plans sample ===');
  if (plans.length) console.log('Fields:', Object.keys(plans[0]).join(', '));
  else console.log('(empty)');
} catch(e) { console.log('training_plans:', e.message); }

// Sample from training_classes
try {
  const classes = db.db.prepare('SELECT * FROM training_classes LIMIT 2').all();
  console.log('\n=== training_classes sample ===');
  if (classes.length) console.log('Fields:', Object.keys(classes[0]).join(', '));
  else console.log('(empty)');
} catch(e) { console.log('training_classes:', e.message); }

// Sample from training_records
try {
  const recs = db.db.prepare('SELECT * FROM training_records LIMIT 2').all();
  console.log('\n=== training_records sample ===');
  if (recs.length) console.log('Fields:', Object.keys(recs[0]).join(', '));
  else console.log('(empty)');
} catch(e) { console.log('training_records:', e.message); }