const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

console.log('=== positions 表结构 ===');
const posInfo = db.prepare('PRAGMA table_info(positions)').all();
console.log(JSON.stringify(posInfo, null, 2));

console.log('\n=== positions 样本数据 ===');
const posSample = db.prepare('SELECT * FROM positions LIMIT 3').all();
console.log(JSON.stringify(posSample, null, 2));

console.log('\n=== recruitment_positions 表结构 ===');
const rpInfo = db.prepare('PRAGMA table_info(recruitment_positions)').all();
console.log(JSON.stringify(rpInfo, null, 2));

db.close();
