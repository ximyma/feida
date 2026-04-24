const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

console.log('=== Admin User ===');
const user = db.prepare('SELECT id, username, realName, employeeId FROM users WHERE username = ?').get('admin');
console.log(user);

console.log('\n=== Employee by employeeId ===');
const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get('emp_admin_virtual');
console.log(emp ? { id: emp.id, name: emp.name, department: emp.department } : 'Not found');

console.log('\n=== All employees with admin/system in name ===');
const emps = db.prepare("SELECT id, name, department FROM employees WHERE name LIKE ? OR name LIKE ?").all('%系统%', '%admin%');
console.log(emps);

db.close();
