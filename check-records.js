const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db', { readonly: true });
try {
  const cnt = db.prepare('SELECT COUNT(*) as c FROM meal_records').get();
  console.log('meal_records exists: ' + cnt.c + '条');
  if (cnt.c > 0) {
    const rows = db.prepare('SELECT * FROM meal_records LIMIT 2').all();
    console.log(JSON.stringify(rows, null, 2));
  }
} catch(e) {
  console.log('meal_records ERROR: ' + e.message);
}
db.close();
