const Database = require('better-sqlite3');
const db = new Database('data/ehr.db', { readonly: true });

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('=== 所有表 ===');
tables.forEach(t => console.log(t.name));

const check = (name) => {
  try {
    const cols = db.prepare(`PRAGMA table_info(${name})`).all();
    console.log(`\n=== ${name} 字段 ===`);
    cols.forEach(c => console.log(c.name, c.type, c.notnull ? 'NOTNULL' : ''));
    const cnt = db.prepare(`SELECT COUNT(*) as cnt FROM ${name}`).get();
    console.log(`数据量: ${cnt.cnt}`);
    const rows = db.prepare(`SELECT * FROM ${name} LIMIT 3`).all();
    console.log('示例:', JSON.stringify(rows));
  } catch(e) { console.log(`${name}表错误: ${e.message}`); }
};

['canteens', 'meal_menus', 'meal_orders', 'meal_records'].forEach(check);
db.close();
