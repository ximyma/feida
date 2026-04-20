const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function test() {
  console.log('=== 测试打卡功能 API ===\n');
  
  try {
    // 1. 测试打卡
    console.log('1. 测试打卡');
    const clockIn = await post('/api/attendance/clock-in', {
      employeeId: 'emp-1',
      employeeName: '张明辉',
      location: '总部',
      remark: '上班打卡'
    });
    console.log('打卡结果:', JSON.stringify(clockIn, null, 2));
    
    // 2. 测试查询今日打卡记录
    console.log('\n2. 查询今日打卡记录');
    const today = await get('/api/attendance/today/emp-1');
    console.log('今日记录:', JSON.stringify(today, null, 2));
    
    // 3. 测试签退
    console.log('\n3. 测试签退');
    const clockOut = await post('/api/attendance/clock-out', {
      employeeId: 'emp-1',
      remark: '下班签退'
    });
    console.log('签退结果:', JSON.stringify(clockOut, null, 2));
    
    // 4. 查询我的考勤记录
    console.log('\n4. 查询我的考勤记录');
    const myRecords = await get('/api/attendance/my-records/emp-1');
    console.log('记录数:', myRecords.length);
    console.log('最新记录:', JSON.stringify(myRecords[0], null, 2));
    
    console.log('\n✅ 打卡功能测试完成');
  } catch (e) {
    console.log('❌ 错误:', e.message);
    console.log('\n服务器可能未启动，请先运行:');
    console.log('  cd D:/feida && npx ts-node server/standalone.ts');
  }
}

test();
