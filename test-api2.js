const http = require('http');

function fetchAPI(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve(data.substring(0, 200)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  // 测试关键表
  const tables = ['employees', 'reminders', 'candidates', 'employee_changes', 'schedules', 'company_contributions', 'offers', 'leave_records', 'overtime_records', 'salaries'];
  for (const t of tables) {
    const result = await fetchAPI(`/api/${t}`);
    if (Array.isArray(result)) {
      console.log(`${t}: ${result.length} 条`);
    } else {
      console.log(`${t}: NOT ARRAY - ${JSON.stringify(result).substring(0, 100)}`);
    }
  }
  
  // 测试新增
  console.log('\n--- 测试新增 ---');
  const newRec = await fetchAPI({
    method: 'POST',
    path: '/api/employee_changes',
    body: JSON.stringify({ employeeId: 'emp-1', employeeName: '测试', changeType: 'transfer', fromDepartment: '研发部', toDepartment: '市场部', effectiveDate: '2026-05-01', reason: '调岗', status: 'pending' })
  });
}

// Helper for POST
async function postAPI(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(d.substring(0, 200)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function fullTest() {
  // 先查看现有数据
  const tables = ['employees', 'reminders', 'candidates', 'employee_changes', 'schedules', 'company_contributions', 'offers', 'leave_records', 'overtime_records', 'salaries'];
  console.log('=== API数据量 ===');
  for (const t of tables) {
    const result = await fetchAPI(`/api/${t}`);
    const count = Array.isArray(result) ? result.length : 'ERR';
    console.log(`  ${t}: ${count}`);
  }
  
  // 测试新增
  console.log('\n=== 测试新增 employee_changes ===');
  const newRec = await postAPI('/api/employee_changes', {
    employeeId: 'emp-1', employeeName: '测试员工', changeType: 'transfer',
    fromDepartment: '研发部', toDepartment: '市场部',
    effectiveDate: '2026-05-01', reason: '调岗', status: 'pending'
  });
  console.log('新增结果:', JSON.stringify(newRec).substring(0, 200));
  
  // 再次查询
  const afterInsert = await fetchAPI('/api/employee_changes');
  console.log('新增后数量:', Array.isArray(afterInsert) ? afterInsert.length : 'ERR');
}

fullTest();
