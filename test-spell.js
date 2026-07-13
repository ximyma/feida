require('./fetch-polyfill');
// #110 CMS 拼写检查验证
const BASE = process.env.BASE || 'http://localhost:3000';
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('  ✅', name); } else { fail++; console.log('  ❌', name); } };

const post = async (path, body) => (await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
const get = async (path) => (await fetch(BASE + path)).json();

(async () => {
  console.log('===== #110 拼写检查 =====');
  // 1. 中文繁体/错别字 + 英文疑似拼写
  const r1 = await post('/api/cms-articles/check-spell', {
    title: '帳號問題說明',
    summary: '用戶登陸後發現錯誤',
    content: 'hello world teh xzqw 這是一個測試'
  });
  ok('返回 hits 数组', Array.isArray(r1.hits));
  const cn = r1.hits.find(h => h.type === 'cn');
  ok('检测中文繁体 帳號→账号', !!cn && cn.word === '帳號' && cn.suggestion === '账号');
  const en = r1.hits.filter(h => h.type === 'en').map(h => h.word.toLowerCase());
  ok('检测英文疑似拼写 teh', en.includes('teh'));
  ok('检测英文疑似拼写 xzqw', en.includes('xzqw'));
  ok('不误报 hello', !en.includes('hello'));
  ok('不误报 world', !en.includes('world'));

  // 2. 干净文本应无命中
  const r2 = await post('/api/cms-articles/check-spell', {
    title: '账号密码说明',
    summary: '用户登录后未发现错误',
    content: 'hello world this is a test'
  });
  ok('干净中文无 cn 命中', !r2.hits.some(h => h.type === 'cn'));
  ok('干净英文无 en 命中', !r2.hits.some(h => h.type === 'en'));

  // 3. 空内容不报错
  const r3 = await post('/api/cms-articles/check-spell', {});
  ok('空内容返回空 hits', Array.isArray(r3.hits) && r3.hits.length === 0);

  console.log(`\n#110 结果: ${pass} 通过 / ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
})();
