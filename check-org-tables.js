const db = require('better-sqlite3')('D:/feida/data/ehr.db');

// 获取相关表
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
  .filter(t => t.name.includes('position') || t.name.includes('headcount') || t.name.includes('rank') || t.name.includes('department'));

console.log('相关表:');
tables.forEach(t => console.log(' -', t.name));

// 获取positions表结构
console.log('\npositions表结构:');
const posSchema = db.prepare("PRAGMA table_info(positions)").all();
posSchema.forEach(col => console.log(`  ${col.name}: ${col.type}`));

// 获取departments表结构
console.log('\ndepartments表结构:');
const deptSchema = db.prepare("PRAGMA table_info(departments)").all();
deptSchema.forEach(col => console.log(`  ${col.name}: ${col.type}`));

// 获取ranks表结构
console.log('\nranks表结构:');
const rankSchema = db.prepare("PRAGMA table_info(ranks)").all();
rankSchema.forEach(col => console.log(`  ${col.name}: ${col.type}`));

// 检查是否有headcount相关表
const hcTables = tables.filter(t => t.name.includes('headcount'));
if (hcTables.length > 0) {
  console.log('\nheadcount相关表:');
  hcTables.forEach(t => {
    console.log(`\n${t.name}表结构:`);
    const schema = db.prepare(`PRAGMA table_info(${t.name})`).all();
    schema.forEach(col => console.log(`  ${col.name}: ${col.type}`));
  });
}

// 获取positions数据样例
console.log('\npositions数据样例:');
const posData = db.prepare('SELECT * FROM positions LIMIT 3').all();
console.log(JSON.stringify(posData, null, 2));

// 获取departments数据样例
console.log('\ndepartments数据样例:');
const deptData = db.prepare('SELECT * FROM departments LIMIT 3').all();
console.log(JSON.stringify(deptData, null, 2));
