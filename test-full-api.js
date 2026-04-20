const http = require('http');

function testAPI(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data: data.substring(0, 100) });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== API功能测试 ===\n');
  
  // Test 1: 登录
  console.log('1. 登录API...');
  try {
    const login = await testAPI('/api/auth/login', 'POST', { username: 'admin', password: 'admin123' });
    console.log('   Status:', login.status);
    console.log('   Success:', login.data.success);
    console.log('   User:', login.data.user?.realName);
  } catch(e) { console.log('   Error:', e.message); }

  // Test 2: 获取员工列表
  console.log('\n2. 员工列表...');
  try {
    const emps = await testAPI('/api/employees');
    console.log('   Count:', Array.isArray(emps.data) ? emps.data.length : 'N/A');
  } catch(e) { console.log('   Error:', e.message); }

  // Test 3: Dashboard统计
  console.log('\n3. Dashboard统计...');
  try {
    const stats = await testAPI('/api/dashboard/stats');
    console.log('   TotalEmployees:', stats.data.totalEmployees);
    console.log('   MonthPayroll:', stats.data.monthPayroll);
  } catch(e) { console.log('   Error:', e.message); }

  // Test 4: 打卡
  console.log('\n4. 打卡API...');
  try {
    const clock = await testAPI('/api/attendance/clock-in', 'POST', { 
      employeeId: 'emp-1', 
      employeeName: '张明辉',
      location: '总部',
      remark: '测试打卡'
    });
    console.log('   Status:', clock.status);
    console.log('   Success:', clock.data.success);
    console.log('   Message:', clock.data.message);
  } catch(e) { console.log('   Error:', e.message); }

  // Test 5: 请假记录
  console.log('\n5. 请假记录...');
  try {
    const leaves = await testAPI('/api/leave_records');
    console.log('   Count:', Array.isArray(leaves.data) ? leaves.data.length : 'N/A');
  } catch(e) { console.log('   Error:', e.message); }

  // Test 6: 薪资记录
  console.log('\n6. 薪资记录...');
  try {
    const salaries = await testAPI('/api/salaries');
    console.log('   Count:', Array.isArray(salaries.data) ? salaries.data.length : 'N/A');
  } catch(e) { console.log('   Error:', e.message); }

  // Test 7: 审批流程
  console.log('\n7. 审批流程...');
  try {
    const flows = await testAPI('/api/approval_flows');
    console.log('   Count:', Array.isArray(flows.data) ? flows.data.length : 'N/A');
  } catch(e) { console.log('   Error:', e.message); }

  // Test 8: 审批请求
  console.log('\n8. 审批请求...');
  try {
    const requests = await testAPI('/api/approval_requests');
    console.log('   Count:', Array.isArray(requests.data) ? requests.data.length : 'N/A');
  } catch(e) { console.log('   Error:', e.message); }

  console.log('\n=== 测试完成 ===');
}

runTests();
