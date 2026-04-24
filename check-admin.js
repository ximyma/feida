const http = require('http');
function get(path) {
  return new Promise((resolve) => {
    http.get({ hostname: 'localhost', port: 3000, path }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    }).on('error', e => resolve({ error: e.message }));
  });
}

(async () => {
  // Check admin user
  const users = await get('/api/users');
  const admin = users.find(u => u.username === 'admin');
  console.log('=== Admin User ===');
  console.log(JSON.stringify(admin, null, 2));

  // Check if admin has employee record
  const emps = await get('/api/employees');
  const adminEmp = emps.find(e => e.name && (e.name.includes('系统') || e.name.includes('admin')));
  console.log('\n=== Employees (admin related) ===');
  if (adminEmp) console.log(JSON.stringify(adminEmp, null, 2));
  else console.log('No admin employee record found');

  // Check all employees count and departments
  console.log('\n=== Departments ===');
  const depts = await get('/api/departments');
  console.log(depts.map(d => `${d.id}: ${d.name}`).join('\n'));
  
  console.log('\n=== Total employees ===');
  console.log(emps.length);
  
  // Check self-service page
  console.log('\n=== SelfService page ===');
  const fs = require('fs');
  const ssPath = 'D:/feida/client/src/pages/SelfServicePage/SelfServicePage.tsx';
  if (fs.existsSync(ssPath)) {
    const content = fs.readFileSync(ssPath, 'utf8');
    console.log('File size:', content.length);
    console.log('First 500 chars:', content.slice(0, 500));
  } else {
    console.log('SelfServicePage.tsx not found');
    // Try to find it
    const { execSync } = require('child_process');
    const files = execSync('dir /s /b D:\\feida\\client\\src\\pages\\*Self*').toString().trim();
    console.log('Found files:', files);
  }
})();
