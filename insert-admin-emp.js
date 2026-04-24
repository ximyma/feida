const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

const emp = {
  id: 'emp_admin_virtual',
  employeeId: 'FD-ADMIN-001',
  name: '系统管理员',
  gender: 'male',
  phone: '13800000001',
  email: 'admin@feida.com',
  department: '总经理办公室',
  deptId: 'dept_1',
  position: '系统管理员',
  positionId: 'pos_admin',
  rank: 'P8',
  hireDate: '2024-01-01',
  status: 'active',
  education: '本科',
  birthday: '1990-01-01',
  idCard: '440000199001010001',
  address: '广东省深圳市',
  emergencyContact: '-',
  emergencyPhone: '-',
  remark: '系统虚拟员工账户',
  createdAt: new Date().toISOString(),
};

try {
  const stmt = db.prepare(`INSERT INTO employees (
    id, employeeId, name, gender, phone, email, department, deptId,
    position, positionId, rank, hireDate, status, education, birthday,
    idCard, address, emergencyContact, emergencyPhone, remark, createdAt
  ) VALUES (
    @id, @employeeId, @name, @gender, @phone, @email, @department, @deptId,
    @position, @positionId, @rank, @hireDate, @status, @education, @birthday,
    @idCard, @address, @emergencyContact, @emergencyPhone, @remark, @createdAt
  )`);
  stmt.run(emp);
  console.log('✅ Employee inserted');
} catch (e) {
  console.log('❌ Insert error:', e.message);
}

// Verify
const check = db.prepare('SELECT id, name, department, position FROM employees WHERE id = ?').get('emp_admin_virtual');
console.log('Verification:', check);

db.close();
