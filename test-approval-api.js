// 测试审批流程 API
const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api' + path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ raw: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000/api' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ raw: data }); }
      });
    }).on('error', reject);
  });
}

async function test() {
  console.log('=== 测试审批流程 API ===\n');

  // 1. 创建审批流程
  console.log('1. 创建审批流程');
  const flow = await post('/approval/flow/create', {
    name: '请假审批流程',
    module: 'leave',
    steps: [
      { stepIndex: 1, stepName: '部门主管审批', approverRole: 'dept_manager', approverIds: ['user_admin'] },
      { stepIndex: 2, stepName: '人事审批', approverRole: 'hr_admin', approverIds: ['user_admin'] }
    ]
  });
  console.log('流程创建:', flow.success ? '✅' : '❌', flow.message || '');
  if (!flow.success) { console.log(flow); return; }

  // 2. 发起审批请求
  console.log('\n2. 发起审批请求');
  const request = await post('/approval/create', {
    flowId: flow.data.id,
    module: 'leave',
    title: '请假申请 - 张三',
    applicantId: 'emp_001',
    applicantName: '张三',
    formData: { leaveType: '年假', days: 3, reason: '家庭事务' }
  });
  console.log('请求创建:', request.success ? '✅ ' + request.data.id : '❌', request.message || '');

  // 3. 查询待审批列表
  console.log('\n3. 查询待审批列表');
  const pending = await get('/approval/pending?approverId=user_admin');
  console.log('待审批数量:', pending.data?.length || 0);

  // 4. 执行第一步审批
  console.log('\n4. 执行第一步审批（部门主管）');
  const result1 = await post('/approval/process', {
    requestId: request.data.id,
    approverId: 'user_admin',
    approverName: '管理员',
    action: 'approve',
    comment: '同意请假'
  });
  console.log('审批结果:', result1);

  // 5. 查询审批历史
  console.log('\n5. 查询审批历史');
  const history = await get('/approval/history/' + request.data.id);
  console.log('审批记录数:', history.data?.length || 0);
  history.data?.forEach(r => console.log(`  步骤${r.stepIndex}: ${r.action} - ${r.comment || '待审批'}`));

  // 6. 执行第二步审批
  console.log('\n6. 执行第二步审批（人事）');
  const result2 = await post('/approval/process', {
    requestId: request.data.id,
    approverId: 'user_admin',
    approverName: '管理员',
    action: 'approve',
    comment: '人事同意'
  });
  console.log('审批结果:', result2);

  console.log('\n✅ 审批流程测试完成');
}

test().catch(console.error);
