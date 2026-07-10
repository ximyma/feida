'use strict';
const fs = require('fs');
const path = require('path');

const root = process.argv[2] || '.';
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const declared = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]);

const builtins = new Set([
  'fs','path','http','https','net','os','util','events','stream','crypto','child_process',
  'url','querystring','dns','zlib','assert','buffer','tls','cluster','worker_threads','module',
  'readline','tty','punycode','timers','console','process','string_decoder','vm','dgram','perf_hooks',
  'async_hooks','constants','sys','domain','repl','v8','inspector','fs/promises','path/posix',
]);

function topLevel(spec) {
  if (spec.startsWith('node:')) return null;
  if (spec.startsWith('@')) {
    const parts = spec.split('/');
    // real scoped package: @scope/name (parts.length >= 2 and parts[1] not empty)
    if (parts.length < 2 || parts[1] === '') return null; // alias like @/foo
    return parts[0] + '/' + parts[1];
  }
  return spec.split('/')[0];
}

const exts = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
// capture specifiers only
const reFrom = /(?:from|import)\s*['"]([^'"]+)['"]/g;
const reRequire = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const reDynamic = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const found = new Map(); // pkgName -> Set(file)
function scanFile(full, rel) {
  let src;
  try { src = fs.readFileSync(full, 'utf8'); } catch { return; }
  const specs = new Set();
  let m;
  for (const re of [reFrom, reRequire, reDynamic]) {
    re.lastIndex = 0;
    while ((m = re.exec(src))) specs.add(m[1]);
  }
  for (const spec of specs) {
    if (spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('@/')) continue;
    const name = topLevel(spec);
    if (!name || builtins.has(name)) continue;
    if (!found.has(name)) found.set(name, new Set());
    found.get(name).add(rel);
  }
}
function walk(dir) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'DEPLOY_PACKAGE'].includes(e.name)) continue;
      walk(full);
    } else if (e.isFile() && exts.includes(path.extname(e.name))) {
      scanFile(full, path.relative(root, full));
    }
  }
}

walk(path.join(root, 'client', 'src'));
walk(path.join(root, 'server'));
for (const f of fs.readdirSync(root)) {
  if (f.endsWith('.js') && fs.statSync(path.join(root, f)).isFile()) {
    scanFile(path.join(root, f), f);
  }
}

const missing = [];
const present = [];
for (const [name, files] of found) {
  if (declared.has(name)) { present.push(name); continue; }
  let ver = 'latest';
  const candidates = [
    path.join(root, 'node_modules', name, 'package.json'),
    path.join(root, 'node_modules', name.split('/')[0], 'package.json'),
  ];
  for (const c of candidates) {
    try { ver = JSON.parse(fs.readFileSync(c, 'utf8')).version; break; } catch {}
  }
  missing.push({ name, ver, files: [...files].slice(0, 2) });
}

console.log('=== MISSING (used but not declared) ===');
for (const m of missing.sort((a,b)=>a.name.localeCompare(b.name))) {
  console.log(`${m.name}@${m.ver}  e.g. ${m.files.join(', ')}`);
}
console.log(`\nTOTAL missing: ${missing.length}`);
console.log(`\n=== DECLARED & used (${present.length}) ===`);
console.log(present.sort().join(', '));
