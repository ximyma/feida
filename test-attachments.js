const BASE = process.env.BASE || 'http://localhost:3400';
const fs = require('fs');
const path = require('path');
const get = (p) => fetch(BASE + p).then(r => r.json());
const post = (p, b) => fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
const postFile = (p, buf, name) => {
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'text/plain' }), name);
  return fetch(BASE + p, { method: 'POST', body: fd }).then(r => r.json());
};
const del = (p) => fetch(BASE + p, { method: 'DELETE' }).then(r => r.json());

let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) { pass++; console.log('  ✅', name); } else { fail++; console.log('  ❌', name); } };

(async () => {
  const tmp = path.join('D:/feida/uploads/attachments/_test_att.txt');
  fs.writeFileSync(tmp, '这是测试附件内容 hello attachment');

  console.log('1) 创建文章');
  const art = await post('/api/cms-articles', { title: '带附件的文章', status: 'published', content: '<p>正文</p>' });
  check('文章创建', !!art.id);

  console.log('2) 上传附件');
  const up = await postFile('/api/cms-articles/' + art.id + '/attachments', Buffer.from('这是测试附件内容 hello attachment'), '测试附件.txt');
  check('上传成功', up.success === true && !!up.attachment);
  check('返回 file_path', up.attachment && up.attachment.file_path.startsWith('/uploads/attachments/'));

  console.log('3) 列表与详情可见');
  const list = await get('/api/cms-articles/' + art.id + '/attachments');
  check('列表含附件', Array.isArray(list) && list.length === 1 && !!list[0].file_name);
  const detail = await get('/api/cms-articles/' + art.id);
  check('详情 attachments_list 含附件', Array.isArray(detail.attachments_list) && detail.attachments_list.length === 1);

  console.log('4) 删除附件');
  await del('/api/cms-article-attachments/' + up.attachment.id);
  const list2 = await get('/api/cms-articles/' + art.id + '/attachments');
  check('删除后列表为空', Array.isArray(list2) && list2.length === 0);

  console.log('5) 清理');
  await del('/api/cms-articles/' + art.id);
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  const after = await get('/api/cms-articles?pageSize=200');
  check('无残留', !after.list.some(a => (a.title || '') === '带附件的文章'));

  console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('ERR', e); process.exit(2); });
