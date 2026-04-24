const http = require('http');

function postAPI(path, body) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: 3000, path, method: 'POST', headers: { 'Content-Type': 'application/json' } };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, raw: data.slice(0, 200) }); }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function seedAuditLogs() {
  const actions = [
    { username: 'admin', realName: '系统管理员', action: 'login', module: 'system', detail: '管理员登录系统', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'create', module: 'system', detail: '创建新用户：技术管理员', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'update', module: 'system', detail: '修改系统配置：考勤规则', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'create', module: 'personnel', detail: '新增员工：李明远', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'update', module: 'personnel', detail: '修改员工信息：张明辉 调整部门', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'delete', module: 'personnel', detail: '删除员工：测试用户', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'export', module: 'salary', detail: '导出3月薪资表', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'approve', module: 'approval', detail: '审批通过：张明辉的请假申请', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'update', module: 'attendance', detail: '修改考勤规则：允许弹性打卡', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'backup', module: 'system', detail: '执行数据库备份', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'create', module: 'recruitment', detail: '发布招聘职位：高级前端工程师', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'update', module: 'performance', detail: '设置Q1绩效考核周期', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'import', module: 'system', detail: '导入员工数据：48条记录', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'query', module: 'logistics', detail: '查询宿舍分配情况', ip: '192.168.1.100' },
    { username: 'tech_admin', realName: '技术管理员', action: 'login', module: 'system', detail: '技术管理员登录系统', ip: '192.168.1.101' },
    { username: 'tech_admin', realName: '技术管理员', action: 'update', module: 'system', detail: '修改系统配置：公司名称', ip: '192.168.1.101' },
    { username: 'admin', realName: '系统管理员', action: 'change_password', module: 'system', detail: '重置用户密码：emp_13810000010', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'create', module: 'personnel', detail: '新增员工合同：张明辉 续签', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'reject', module: 'approval', detail: '驳回：王建国的加班申请', ip: '192.168.1.100' },
    { username: 'admin', realName: '系统管理员', action: 'create', module: 'logistics', detail: '新增车辆：商务车粤B88888', ip: '192.168.1.100' },
  ];

  let count = 0;
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    try {
      const now = new Date();
      now.setMinutes(now.getMinutes() - (actions.length - i) * 120);
      const result = await postAPI('/api/audit_logs', {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: 'user_admin',
        username: a.username,
        realName: a.realName,
        action: a.action,
        module: a.module,
        detail: a.detail,
        ip: a.ip,
        timestamp: now.toISOString(),
      });
      if (result.status === 200) count++;
      else console.log(`Failed (${result.status})`, result.raw || '');
    } catch (e) { console.log('Error:', e.message); }
  }
  console.log(`\nSeeded ${count}/${actions.length} audit logs`);
}

seedAuditLogs();
