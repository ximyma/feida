require('./fetch-polyfill');
// #106 Word 导入验证：上传 .docx → mammoth 解析 → 生成草稿 → 详情可查 → 清理
const BASE = process.env.BASE || 'http://localhost:3000';
const fs = require('fs');
const path = require('path');
const FIXTURE = path.join(__dirname, 'node_modules/mammoth/test/test-data/single-paragraph.docx');

let pass = 0, fail = 0;
function ok(name, cond, extra) { if (cond) { pass++; console.log(`  ✅ ${name}`); } else { fail++; console.log(`  ❌ ${name}` + (extra ? ` — ${extra}` : '')); } }

async function main() {
  console.log(`#106 Word 导入测试 @ ${BASE}`);
  if (!fs.existsSync(FIXTURE)) { console.log('  ❌ fixture 缺失: ' + FIXTURE); process.exit(1); }

  // 1. 上传 .docx
  const buf = fs.readFileSync(FIXTURE);
  const boundary = '----testboundary' + Date.now();
  const head = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="single-paragraph.docx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`;
  const tail = `\r\n--${boundary}--\r\n`;
  const body = Buffer.concat([Buffer.from(head, 'utf8'), buf, Buffer.from(tail, 'utf8')]);

  const r1 = await fetch(`${BASE}/api/cms-articles/import-word`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body
  });
  const d1 = await r1.json();
  ok('导入接口返回 200', r1.status === 200, 'status=' + r1.status);
  ok('返回 success=true', d1.success === true, JSON.stringify(d1).slice(0, 100));
  ok('返回新文章 id', typeof d1.id === 'string' && d1.id.length > 0, d1.id);
  ok('携带标题', typeof d1.title === 'string' && d1.title.length > 0, d1.title);
  ok('content 含 HTML 标签(<p>)', typeof d1.content === 'string' && d1.content.includes('<p'), (d1.content || '').slice(0, 80));

  let newId = d1.id;

  // 2. 详情可查
  if (newId) {
    const r2 = await fetch(`${BASE}/api/cms-articles/${newId}`);
    const d2 = await r2.json();
    ok('详情接口返回 200', r2.status === 200, 'status=' + r2.status);
    ok('状态为草稿 draft', d2.status === 'draft', d2.status);
    ok('详情 content 含 HTML', typeof d2.content === 'string' && d2.content.includes('<p'), (d2.content || '').slice(0, 80));
    ok('详情敏感词字段为数组', Array.isArray(d2.sensitive_hits), JSON.stringify(d2.sensitive_hits));

    // 3. 清理：软删除（status=deleted）
    const r3 = await fetch(`${BASE}/api/cms-articles/${newId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'deleted' })
    });
    ok('清理(软删除)成功', r3.status === 200, 'status=' + r3.status);
  }

  // 4. 非 docx 文件被拒绝
  const bad = Buffer.from('hello');
  const b2 = '----b' + Date.now();
  const h2 = `--${b2}\r\nContent-Disposition: form-data; name="file"; filename="x.txt"\r\nContent-Type: text/plain\r\n\r\n`;
  const t2 = `\r\n--${b2}--\r\n`;
  const body2 = Buffer.concat([Buffer.from(h2, 'utf8'), bad, Buffer.from(t2, 'utf8')]);
  const r4 = await fetch(`${BASE}/api/cms-articles/import-word`, {
    method: 'POST', headers: { 'Content-Type': `multipart/form-data; boundary=${b2}` }, body: body2
  });
  ok('非 docx 文件被拒绝(400)', r4.status === 400, 'status=' + r4.status);

  console.log(`\n#106 结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(e => { console.error('测试异常:', e); process.exit(1); });
