// 图片裁剪测试（需要原生 fetch + FormData）
if (typeof FormData === 'undefined') {
  console.log('SKIP: FormData not available (Node.js managed runtime)');
  process.exit(0);
}
const BASE = process.env.BASE || 'http://localhost:3000';
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const UPLOADS = path.join('D:/feida/uploads');
const SRC = path.join(UPLOADS, 'test_crop_src.png');
const REL = '/uploads/test_crop_src.png';

let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) { pass++; console.log('  ✅', name); } else { fail++; console.log('  ❌', name); } };

(async () => {
  // 生成测试原图 200x100
  const svg = '<svg width="200" height="100"><rect width="200" height="100" fill="#e74c3c"/><rect x="10" y="10" width="80" height="40" fill="#3498db"/></svg>';
  await sharp(Buffer.from(svg)).png().toFile(SRC);
  console.log('1) 生成测试原图 200x100 ->', fs.existsSync(SRC));

  console.log('2) 裁剪端点 (source 模式)');
  const fd = new FormData();
  fd.append('source', REL);
  fd.append('x', '10');
  fd.append('y', '10');
  fd.append('width', '80');
  fd.append('height', '40');
  const res = await fetch(BASE + '/api/image/crop', { method: 'POST', body: fd });
  const data = await res.json();
  check('返回 success', data.success === true);
  if (data.success) {
    const outRel = data.url;
    const outPath = path.join('D:/feida', outRel.replace(/^\/+/, ''));
    check('裁剪文件已生成', fs.existsSync(outPath));
    if (fs.existsSync(outPath)) {
      const meta = await sharp(outPath).metadata();
      check('裁剪尺寸 80x40', meta.width === 80 && meta.height === 40);
      fs.unlinkSync(outPath); // 清理裁剪产物
    }
  }

  console.log('3) 越界参数安全钳制');
  const fd2 = new FormData();
  fd2.append('source', REL);
  fd2.append('x', '9999');
  fd2.append('y', '9999');
  fd2.append('width', '9999');
  fd2.append('height', '9999');
  const res2 = await fetch(BASE + '/api/image/crop', { method: 'POST', body: fd2 });
  const data2 = await res2.json();
  check('越界裁剪仍成功(钳制到图内)', data2.success === true);
  if (data2 && data2.url) {
    const p2 = path.join('D:/feida', data2.url.replace(/^\/+/, ''));
    if (fs.existsSync(p2)) fs.unlinkSync(p2);
  }

  // 清理原图
  if (fs.existsSync(SRC)) fs.unlinkSync(SRC);

  console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('ERR', e); process.exit(2); });
