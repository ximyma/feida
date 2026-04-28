const db = require('better-sqlite3')('D:/feida/data/ehr.db');
console.log('=== canteens ===');
console.log(JSON.stringify(db.prepare("PRAGMA table_info(canteens)").all(), null, 2));
console.log('\n=== meal_records ===');
console.log(JSON.stringify(db.prepare("PRAGMA table_info(meal_records)").all(), null, 2));
console.log('\n=== canteens data ===');
console.log(JSON.stringify(db.prepare("SELECT * FROM canteens").all(), null, 2));
console.log('\n=== meal_records data (first 5) ===');
console.log(JSON.stringify(db.prepare("SELECT * FROM meal_records LIMIT 5").all(), null, 2));
