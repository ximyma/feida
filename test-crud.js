const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 3000, path, method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(data.substring(0, 200)); }
      });
    });
    req.on('error', e => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('=== CRUD 测试 ===\n');
  
  // 1. 查询 employee_changes
  let list = await request('GET', '/api/employee_changes');
  console.log(`1. 查询 employee_changes: ${Array.isArray(list) ? list.length + '条' : 'ERROR'}`);
  
  // 2. 新增
  const newItem = await request('POST', '/api/employee_changes', {
    employeeId: 'emp-1', employeeName: '张三', changeType: 'transfer',
    fromDepartment: '研发部', toDepartment: '市场部',
    fromPosition: '开发工程师', toPosition: '产品经理',
    effectiveDate: '2026-05-01', reason: '调岗测试', status: 'pending'
  });
  console.log(`2. 新增: id=${newItem?.id || 'FAIL'}`);
  
  // 3. 查询单条
  if (newItem?.id) {
    const item = await request('GET', `/api/employee_changes/${newItem.id}`);
    console.log(`3. 查询详情: employeeName=${item?.employeeName || 'FAIL'}`);
    
    // 4. 更新
    const updated = await request('PUT', `/api/employee_changes/${newItem.id}`, {
      status: 'approved', approverId: 'user_admin', approverName: '管理员', approveTime: new Date().toISOString()
    });
    console.log(`4. 更新: status=${updated?.status || 'FAIL'}`);
    
    // 5. 删除
    const del = await request('DELETE', `/api/employee_changes/${newItem.id}`);
    console.log(`5. 删除: ${del?.success ? '成功' : 'FAIL'}`);
  }
  
  // 测试其他表
  console.log('\n=== 其他表数据量 ===');
  const tables = ['schedules', 'leave_records', 'overtime_records', 'company_contributions', 'offers', 'candidates', 'salaries', 'performance_cycles', 'kpis'];
  for (const t of tables) {
    const data = await request('GET', `/api/${t}`);
    console.log(`  ${t}: ${Array.isArray(data) ? data.length : 'ERROR'} 条`);
  }
  
  console.log('\n✅ CRUD测试完成');
}

test().catch(e => console.error('测试失败:', e));
