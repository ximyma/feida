// 食堂管理系统完整建表 + 种子数据
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'data', 'ehr.db'));

// --- 建表语句 ---
db.exec(`
  CREATE TABLE IF NOT EXISTS canteens (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT DEFAULT '',
    capacity INTEGER DEFAULT 100,
    managerId TEXT DEFAULT '',
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meal_menus (
    id TEXT PRIMARY KEY,
    canteenId TEXT NOT NULL,
    date TEXT NOT NULL,
    mealType TEXT NOT NULL,
    dishes TEXT DEFAULT '[]',
    totalPrice REAL DEFAULT 0,
    status TEXT DEFAULT 'draft',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meal_orders (
    id TEXT PRIMARY KEY,
    menuId TEXT DEFAULT '',
    canteenId TEXT NOT NULL,
    employeeId TEXT NOT NULL,
    employeeName TEXT DEFAULT '',
    date TEXT NOT NULL,
    mealType TEXT NOT NULL,
    dishes TEXT DEFAULT '[]',
    totalPrice REAL DEFAULT 0,
    status TEXT DEFAULT 'ordered',
    remark TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);
console.log('建表完成');

// --- 清空旧数据 ---
['canteens', 'meal_menus', 'meal_orders'].forEach(t => { try { db.exec('DELETE FROM ' + t); console.log('已清空 ' + t); } catch(e) {} });

// --- 插入食堂数据 ---
const insertCanteen = db.prepare('INSERT INTO canteens (id, name, location, capacity, managerId, isActive) VALUES (?, ?, ?, ?, ?, 1)');
[['c_001','一号食堂','总部大楼一楼',200,'emp-admin'],['c_002','二号食堂','研发中心A栋负一楼',150,'emp-admin'],['c_003','员工餐厅','行政楼二楼',80,'emp-admin']].forEach(d => insertCanteen.run(...d));
console.log('食堂: 3条');

// --- 插入菜谱数据 ---
const insertMenu = db.prepare('INSERT INTO meal_menus (id, canteenId, date, mealType, dishes, totalPrice, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
const fmtDate = (d) => d.toISOString().slice(0, 10);
const today = new Date();

const menusData = [
  ['c_001', fmtDate(today), 'breakfast', '["小米粥¥3","茶叶蛋¥2","素包子¥2","油条¥3","咸菜¥1"]', 11, 'published'],
  ['c_001', fmtDate(today), 'lunch',     '["红烧肉¥18","清蒸鲈鱼¥22","蒜蓉西兰花¥8","酸辣土豆丝¥6","米饭¥2","紫菜蛋汤¥5"]', 61, 'published'],
  ['c_001', fmtDate(today), 'dinner',   '["糖醋排骨¥20","番茄炒蛋¥8","炒时蔬¥6","米饭¥2","玉米排骨汤¥8"]', 44, 'published'],
  ['c_002', fmtDate(today), 'breakfast', '["豆浆¥3","油条¥3","煎饼果子¥8","茶叶蛋¥2"]', 16, 'published'],
  ['c_002', fmtDate(today), 'lunch',     '["麻辣香锅¥25","凉拌黄瓜¥6","米饭¥2","可乐¥5"]', 38, 'published'],
  ['c_002', fmtDate(today), 'dinner',   '["宫保鸡丁¥18","鱼香肉丝¥16","炒时蔬¥6","米饭¥2"]', 42, 'published'],
  ['c_001', fmtDate(new Date(today.getTime()+86400000)), 'lunch', '["可乐鸡翅¥22","清蒸鲈鱼¥22","凉拌木耳¥8","米饭¥2","紫菜蛋汤¥5"]', 59, 'draft'],
  ['c_002', fmtDate(new Date(today.getTime()+86400000)), 'lunch', '["水煮鱼¥28","干煸四季豆¥8","炒时蔬¥6","米饭¥2"]', 44, 'draft'],
  ['c_001', fmtDate(new Date(today.getTime()+172800000)), 'lunch', '["红烧牛肉¥25","香菇炒肉¥12","炒青菜¥6","米饭¥2","西红柿蛋汤¥5"]', 50, 'draft'],
  ['c_002', fmtDate(new Date(today.getTime()+172800000)), 'dinner', '["烤鱼¥28","蒜蓉粉丝¥8","凉拌黄瓜¥6","米饭¥2"]', 44, 'draft'],
];

let idx = 1;
menusData.forEach(d => {
  insertMenu.run('mm_'+idx++, d[0], d[1], d[2], d[3], d[4], d[5]);
});
console.log('菜谱: ' + menusData.length + '条');

// --- 插入订餐记录 ---
const insertOrder = db.prepare('INSERT INTO meal_orders (id, menuId, canteenId, employeeId, employeeName, date, mealType, dishes, totalPrice, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const ordersData = [
  ['', 'c_001', 'emp-1', '张明辉', fmtDate(today), 'lunch',    '["红烧肉¥18","蒜蓉西兰花¥8","米饭¥2"]', 28, 'completed'],
  ['', 'c_001', 'emp-2', '李雪梅', fmtDate(today), 'lunch',    '["清蒸鲈鱼¥22","米饭¥2"]', 24, 'completed'],
  ['', 'c_002', 'emp-3', '王建国', fmtDate(today), 'lunch',    '["麻辣香锅¥25","米饭¥2"]', 27, 'completed'],
  ['', 'c_001', 'emp-1', '张明辉', fmtDate(today), 'breakfast','["小米粥¥3","茶叶蛋¥2","素包子¥2"]', 7, 'completed'],
  ['', 'c_001', 'emp-4', '赵小燕', fmtDate(new Date(today.getTime()-86400000)), 'lunch', '["红烧肉¥18","酸辣土豆丝¥6","米饭¥2"]', 26, 'completed'],
  ['', 'c_002', 'emp-5', '陈大伟', fmtDate(new Date(today.getTime()-86400000)), 'dinner','["宫保鸡丁¥18","炒青菜¥6","米饭¥2"]', 26, 'completed'],
];
ordersData.forEach((d, i) => insertOrder.run('mo_'+(i+1), d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8]));
console.log('订餐: ' + ordersData.length + '条');

// --- 验证 ---
console.log('\n=== 验证 ===');
['canteens','meal_menus','meal_orders'].forEach(t => {
  const cnt = db.prepare('SELECT COUNT(*) as c FROM '+t).get();
  console.log(t + ': ' + cnt.c + '条');
});

db.close();
console.log('\n✅ 完成！');
