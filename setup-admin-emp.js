const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: 3000, path, method: 'POST', headers: { 'Content-Type': 'application/json' } };
    const req = http.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d }); } });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function put(path, body) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: 3000, path, method: 'PUT', headers: { 'Content-Type': 'application/json' } };
    const req = http.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d }); } });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  // Step 1: Create admin's employee record as virtual employee in 总经理办公室
  const empId = 'emp_admin_virtual';
  const employee = {
    id: empId,
    employeeId: 'FD-ADMIN-001',
    name: '系统管理员',
    gender: 'male',
    phone: '13800000001',
    email: 'admin@feida.com',
    department: '总经理办公室',
    departmentId: 'dept_1',
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
    workType: 'full-time',
    contractType: 'permanent',
    remark: '系统虚拟员工账户，用于管理员身份的员工自助功能',
    isVirtual: true,
  };

  console.log('Creating admin employee record...');
  const result = await post('/api/employees', employee);
  if (result.error) console.log('Create result:', result);
  else console.log('✅ Employee created:', result.id);

  // Step 2: Link user to employee
  console.log('\nLinking user_admin to employee...');
  const linkResult = await put('/api/users/user_admin', { employeeId: empId });
  if (linkResult.error) console.log('Link result:', linkResult);
  else console.log('✅ User linked, employeeId:', linkResult.employeeId);

  // Step 3: Create leave balance for admin
  console.log('\nCreating leave balance for admin...');
  const leaveBalances = [
    { id: 'lb_admin_1', employeeId: empId, leaveType: '年假', totalDays: 15, usedDays: 0, remainingDays: 15, year: 2026 },
    { id: 'lb_admin_2', employeeId: empId, leaveType: '病假', totalDays: 10, usedDays: 0, remainingDays: 10, year: 2026 },
    { id: 'lb_admin_3', employeeId: empId, leaveType: '事假', totalDays: 5, usedDays: 0, remainingDays: 5, year: 2026 },
  ];
  for (const lb of leaveBalances) {
    const r = await post('/api/leave_balances', lb);
    if (r.error && !r.error.includes('UNIQUE')) console.log('Leave balance result:', r.error?.slice(0, 80));
  }
  console.log('✅ Leave balances created');

  // Step 4: Verify
  const http2 = require('http');
  function get(path) {
    return new Promise((resolve) => {
      http2.get({ hostname: 'localhost', port: 3000, path }, (res) => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
      }).on('error', e => resolve({ error: e.message }));
    });
  }
  console.log('\n=== Verification ===');
  const user = await get('/api/users/user_admin');
  console.log('User employeeId:', user.employeeId);
  
  const emp = await get(`/api/employees/${empId}`);
  console.log('Employee name:', emp.name);
  console.log('Employee dept:', emp.department);
})();
