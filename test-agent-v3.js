/**
 * Agent v3 端到端测试 — 多场景覆盖
 */
const BASE = process.env.BASE || 'http://localhost:3400';
let passed = 0, failed = 0;

async function test(name, fn) {
  try { await fn(); console.log(`  ✅ ${name}`); passed++; }
  catch (e) { console.log(`  ❌ ${name}: ${e.message}`); failed++; }
}

async function agentAsk(msg, maxSteps = 5) {
  const resp = await fetch(`${BASE}/api/ai/code-agent/run`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: msg }],
      options: { model: 'model_1783692522319_4m71', maxIterations: maxSteps, temperature: 0.1 }
    })
  });
  const data = await resp.json();
  if (!data.success) throw new Error(`API error: ${JSON.stringify(data)}`);
  return data.data;
}

async function main() {
  console.log('\n=== Agent v3 端到端测试 ===\n');

  await test('SQL查询: 表总数', async () => {
    const r = await agentAsk('SELECT COUNT(*) FROM employees');
    if (!r.content.includes('48')) throw new Error('预期48条记录');
    if (r.steps.length < 1) throw new Error('应使用sql_query工具');
  });

  await test('SQL查询: 表结构', async () => {
    const r = await agentAsk('查看departments表有哪些字段', 3);
    if (!r.content.includes('departments') && !r.content.includes('字段')) throw new Error('未返回表结构');
    if (r.steps.length < 1) throw new Error('应使用sql_query工具');
  });

  await test('多表查询: employee+department', async () => {
    const r = await agentAsk('列出前3个员工的名字和所属部门名称', 8);
    if (r.steps.length < 2) throw new Error(`应多次调用工具,实际${r.steps.length}次`);
    if (!r.content) throw new Error('无返回内容');
  });

  await test('简单对话: 无需工具', async () => {
    const r = await agentAsk('你好，简单介绍一下自己', 3);
    if (!r.content || r.content.length < 10) throw new Error('回复太短');
  });

  await test('SQL+筛选: 条件查询', async () => {
    const r = await agentAsk('查询status为active的员工数量', 5);
    if (!r.content.match(/\d+/)) throw new Error('未返回数字');
  });

  await test('错误恢复: 不存在的表', async () => {
    const r = await agentAsk('查询 nonexistent_table 表的结构', 5);
    // 应该包含错误信息或说明表不存在
    if (!r.content) throw new Error('无返回');
  });

  await test('会话ID生成', async () => {
    const r = await agentAsk('hi', 1);
    if (!r.sessionId) throw new Error('无sessionId');
    if (typeof r.sessionId !== 'string') throw new Error('sessionId应为字符串');
  });

  console.log(`\n=== 结果: ${passed}通过 ${failed}失败 ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
