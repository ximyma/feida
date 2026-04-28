const db = require('better-sqlite3')('D:/feida/data/ehr.db');

// 1. 创建每日菜谱表
db.exec(`
  CREATE TABLE IF NOT EXISTS meal_menus (
    id TEXT PRIMARY KEY,
    canteenId TEXT NOT NULL,
    date TEXT NOT NULL,
    mealType TEXT NOT NULL,  -- breakfast/lunch/dinner
    dishes TEXT NOT NULL,     -- JSON array of dish objects [{name, price, category}]
    totalPrice REAL DEFAULT 0,
    status TEXT DEFAULT 'published',  -- published/draft/closed
    createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
    updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP)
  )
`);

// 2. 创建订餐表
db.exec(`
  CREATE TABLE IF NOT EXISTS meal_orders (
    id TEXT PRIMARY KEY,
    menuId TEXT NOT NULL,
    canteenId TEXT NOT NULL,
    employeeId TEXT NOT NULL,
    employeeName TEXT,
    date TEXT NOT NULL,
    mealType TEXT NOT NULL,
    dishes TEXT,              -- JSON: selected dish names
    totalPrice REAL DEFAULT 0,
    status TEXT DEFAULT 'ordered',  -- ordered/cancelled/completed
    remark TEXT,
    createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
    updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP)
  )
`);

// 3. 插入种子菜谱数据
const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

const seedMenus = [
  // 一号食堂 - 今天
  {
    id: 'mm_1_breakfast_today',
    canteenId: 'can_1',
    date: today,
    mealType: 'breakfast',
    dishes: JSON.stringify([
      { name: '白粥', price: 2, category: '主食' },
      { name: '豆浆', price: 2, category: '饮品' },
      { name: '油条', price: 2, category: '主食' },
      { name: '煎蛋', price: 2, category: '蛋类' },
      { name: '肉包', price: 3, category: '主食' },
      { name: '菜包', price: 2, category: '主食' }
    ]),
    totalPrice: 8,
    status: 'published'
  },
  {
    id: 'mm_1_lunch_today',
    canteenId: 'can_1',
    date: today,
    mealType: 'lunch',
    dishes: JSON.stringify([
      { name: '红烧排骨', price: 8, category: '荤菜' },
      { name: '宫保鸡丁', price: 7, category: '荤菜' },
      { name: '鱼香肉丝', price: 6, category: '荤菜' },
      { name: '麻婆豆腐', price: 4, category: '素菜' },
      { name: '清炒时蔬', price: 3, category: '素菜' },
      { name: '番茄蛋汤', price: 2, category: '汤类' },
      { name: '米饭', price: 1, category: '主食' }
    ]),
    totalPrice: 15,
    status: 'published'
  },
  {
    id: 'mm_1_dinner_today',
    canteenId: 'can_1',
    date: today,
    mealType: 'dinner',
    dishes: JSON.stringify([
      { name: '清蒸鲈鱼', price: 10, category: '荤菜' },
      { name: '回锅肉', price: 7, category: '荤菜' },
      { name: '蒜蓉西兰花', price: 4, category: '素菜' },
      { name: '凉拌黄瓜', price: 3, category: '凉菜' },
      { name: '紫菜蛋花汤', price: 2, category: '汤类' },
      { name: '米饭', price: 1, category: '主食' }
    ]),
    totalPrice: 12,
    status: 'published'
  },
  // 二号食堂 - 今天
  {
    id: 'mm_2_breakfast_today',
    canteenId: 'can_2',
    date: today,
    mealType: 'breakfast',
    dishes: JSON.stringify([
      { name: '小米粥', price: 2, category: '主食' },
      { name: '牛奶', price: 3, category: '饮品' },
      { name: '鸡蛋灌饼', price: 4, category: '主食' },
      { name: '茶叶蛋', price: 2, category: '蛋类' },
      { name: '豆沙包', price: 3, category: '主食' }
    ]),
    totalPrice: 8,
    status: 'published'
  },
  {
    id: 'mm_2_lunch_today',
    canteenId: 'can_2',
    date: today,
    mealType: 'lunch',
    dishes: JSON.stringify([
      { name: '水煮牛肉', price: 10, category: '荤菜' },
      { name: '糖醋里脊', price: 8, category: '荤菜' },
      { name: '干煸四季豆', price: 4, category: '素菜' },
      { name: '酸辣土豆丝', price: 3, category: '素菜' },
      { name: '冬瓜排骨汤', price: 3, category: '汤类' },
      { name: '米饭', price: 1, category: '主食' }
    ]),
    totalPrice: 16,
    status: 'published'
  },
  {
    id: 'mm_2_dinner_today',
    canteenId: 'can_2',
    date: today,
    mealType: 'dinner',
    dishes: JSON.stringify([
      { name: '烤鸭', price: 12, category: '荤菜' },
      { name: '京酱肉丝', price: 7, category: '荤菜' },
      { name: '地三鲜', price: 4, category: '素菜' },
      { name: '皮蛋豆腐', price: 3, category: '凉菜' },
      { name: '银耳红枣汤', price: 3, category: '汤类' },
      { name: '米饭', price: 1, category: '主食' }
    ]),
    totalPrice: 14,
    status: 'published'
  },
  // 一号食堂 - 明天（草稿）
  {
    id: 'mm_1_breakfast_tomorrow',
    canteenId: 'can_1',
    date: tomorrow,
    mealType: 'breakfast',
    dishes: JSON.stringify([
      { name: '皮蛋瘦肉粥', price: 3, category: '主食' },
      { name: '牛奶', price: 3, category: '饮品' },
      { name: '三明治', price: 5, category: '主食' },
      { name: '煮鸡蛋', price: 2, category: '蛋类' }
    ]),
    totalPrice: 10,
    status: 'draft'
  }
];

// 插入订餐种子数据
const seedOrders = [
  {
    id: 'mo_1',
    menuId: 'mm_1_lunch_today',
    canteenId: 'can_1',
    employeeId: 'emp-1',
    employeeName: '张明辉',
    date: today,
    mealType: 'lunch',
    dishes: JSON.stringify(['红烧排骨', '清炒时蔬', '米饭']),
    totalPrice: 12,
    status: 'ordered',
    remark: '少油'
  },
  {
    id: 'mo_2',
    menuId: 'mm_2_lunch_today',
    canteenId: 'can_2',
    employeeId: 'emp-2',
    employeeName: '李雅琴',
    date: today,
    mealType: 'lunch',
    dishes: JSON.stringify(['糖醋里脊', '酸辣土豆丝', '米饭']),
    totalPrice: 12,
    status: 'ordered',
    remark: ''
  },
  {
    id: 'mo_3',
    menuId: 'mm_1_breakfast_today',
    canteenId: 'can_1',
    employeeId: 'emp-1',
    employeeName: '张明辉',
    date: today,
    mealType: 'breakfast',
    dishes: JSON.stringify(['白粥', '肉包', '煎蛋']),
    totalPrice: 7,
    status: 'completed',
    remark: ''
  },
  {
    id: 'mo_4',
    menuId: 'mm_1_dinner_today',
    canteenId: 'can_1',
    employeeId: 'emp-3',
    employeeName: '王建国',
    date: today,
    mealType: 'dinner',
    dishes: JSON.stringify(['回锅肉', '蒜蓉西兰花', '米饭']),
    totalPrice: 12,
    status: 'ordered',
    remark: '多辣'
  }
];

const insertMenu = db.prepare(`
  INSERT OR IGNORE INTO meal_menus (id, canteenId, date, mealType, dishes, totalPrice, status)
  VALUES (@id, @canteenId, @date, @mealType, @dishes, @totalPrice, @status)
`);

const insertOrder = db.prepare(`
  INSERT OR IGNORE INTO meal_orders (id, menuId, canteenId, employeeId, employeeName, date, mealType, dishes, totalPrice, status, remark)
  VALUES (@id, @menuId, @canteenId, @employeeId, @employeeName, @date, @mealType, @dishes, @totalPrice, @status, @remark)
`);

const txn = db.transaction(() => {
  let mCount = 0, oCount = 0;
  for (const m of seedMenus) {
    const r = insertMenu.run(m);
    mCount += r.changes;
  }
  for (const o of seedOrders) {
    const r = insertOrder.run(o);
    oCount += r.changes;
  }
  console.log(`Inserted ${mCount} menus, ${oCount} orders`);
});

txn();

// Verify
console.log('\n=== meal_menus count ===');
console.log(db.prepare('SELECT COUNT(*) as c FROM meal_menus').get().c);
console.log('\n=== meal_orders count ===');
console.log(db.prepare('SELECT COUNT(*) as c FROM meal_orders').get().c);
console.log('\n=== sample menu ===');
console.log(JSON.stringify(db.prepare('SELECT * FROM meal_menus LIMIT 1').get(), null, 2));
console.log('\n=== sample order ===');
console.log(JSON.stringify(db.prepare('SELECT * FROM meal_orders LIMIT 1').get(), null, 2));
