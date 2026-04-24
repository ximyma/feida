const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: body ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      } : {}
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function test() {
  console.log('=== CRUD 功能验证 ===\n');
  
  // 测试各模块的GET
  const tables = [
    'employees', 'departments', 'positions', 'contracts',
    'attendance_records', 'leave_records', 'salaries',
    'approval_requests', 'users', 'roles', 'training_courses',
    'documents', 'announcements', 'vehicles', 'dormitories',
    'candidates', 'kpis', 'performance_records', 'schedules',
    'shift_types', 'overtime_records', 'salary_items'
  ];
  
  console.log('1. GET 测试 (各模块列表):');
  for (const table of tables) {
    try {
      const res = await request('GET', `/api/${table}?limit=1`);
      const data = JSON.parse(res.body);
      const count = Array.isArray(data) ? data.length : (data.data ? data.data.length : 1);
      console.log(`  ✓ ${table}: ${count} 条记录`);
    } catch (e) {
      console.log(`  ✗ ${table}: ${e.message}`);
    }
  }
  
  // 测试POST
  console.log('\n2. POST 测试 (创建员工):');
  try {
    const res = await request('POST', '/api/employees', {
      id: 'test-emp-crud',
      name: 'CRUD测试员工',
      employeeId: 'TESTCRUD',
      department: '测试部门',
      position: '测试岗位',
      status: 'active',
      hireDate: '2026-04-22',
      phone: '13900000000',
      email: 'crud@test.com'
    });
    console.log('  状态:', res.status);
    console.log('  响应:', res.body.substring(0, 100));
  } catch (e) {
    console.log('  ✗ POST失败:', e.message);
  }
  
  // 测试PUT
  console.log('\n3. PUT 测试 (更新员工):');
  try {
    const res = await request('PUT', '/api/employees/test-emp-crud', {
      name: 'CRUD测试员工-已修改',
      phone: '13900000001'
    });
    console.log('  状态:', res.status);
    console.log('  响应:', res.body.substring(0, 100));
  } catch (e) {
    console.log('  ✗ PUT失败:', e.message);
  }
  
  // 验证更新
  console.log('\n4. 验证更新:');
  try {
    const res = await request('GET', '/api/employees/test-emp-crud');
    const data = JSON.parse(res.body);
    console.log('  员工名称:', data.name || data.error);
  } catch (e) {
    console.log('  ✗ 验证失败:', e.message);
  }
  
  // 测试DELETE
  console.log('\n5. DELETE 测试 (删除员工):');
  try {
    const res = await request('DELETE', '/api/employees/test-emp-crud');
    console.log('  状态:', res.status);
    console.log('  响应:', res.body);
  } catch (e) {
    console.log('  ✗ DELETE失败:', e.message);
  }
  
  // 验证删除
  console.log('\n6. 验证删除:');
  try {
    const res = await request('GET', '/api/employees/test-emp-crud');
    const data = JSON.parse(res.body);
    console.log('  结果:', data.error || '记录仍存在');
  } catch (e) {
    console.log('  结果:', e.message);
  }
  
  console.log('\n=== 测试完成 ===');
}

test().catch(console.error);
