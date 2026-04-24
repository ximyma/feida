const http = require('http');

function get(path) {
  return new Promise((resolve) => {
    http.get({ hostname: 'localhost', port: 3000, path }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ raw: d.slice(0, 200) }); }
      });
    }).on('error', e => resolve({ error: e.message }));
  });
}

(async () => {
  console.log('=== Admin User Verification ===');
  const users = await get('/api/users');
  const admin = users.find(u => u.username === 'admin');
  console.log('User:', { username: admin.username, realName: admin.realName, employeeId: admin.employeeId, userType: admin.userType });

  console.log('\n=== Admin Employee Record ===');
  const emp = await get('/api/employees/emp_admin_virtual');
  console.log('Employee:', emp.name, '-', emp.department, '-', emp.position);

  console.log('\n=== Leave Balance for Admin ===');
  const lbs = await get('/api/leave_balances?employeeId=emp_admin_virtual');
  if (Array.isArray(lbs)) {
    lbs.forEach(lb => console.log(`  ${lb.leaveType}: ${lb.remainingDays}/${lb.totalDays}天`));
  } else {
    console.log('  No leave balance found');
  }

  console.log('\n=== SelfService Page Test ===');
  const page = await get('/');
  console.log('Frontend status:', page.raw ? 'Error' : 'OK');
})();
