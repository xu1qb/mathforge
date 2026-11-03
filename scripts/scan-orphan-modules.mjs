// 一次性分析：扫描未被任何模块 import 的孤立源码文件
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src');

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(root);
const refs = new Set();
const staticRe = /from\s+["'](@\/[^"']+|\.\/[^"']+|\.\.\/[^"']+)["']/g;
const dynamicRe = /import\(\s*["'](@\/[^"']+|\.\/[^"']+|\.\.\/[^"']+)["']\s*\)/g;
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = staticRe.exec(c))) refs.add(m[1]);
  while ((m = dynamicRe.exec(c))) refs.add(m[1]);
}

function norm(p) {
  return p.replace(/^src\//, '').replace(/\.(ts|tsx)$/, '');
}

const entry = ['src/index.tsx', 'src/app.tsx'];
const isolated = [];
for (const f of files) {
  if (entry.includes(f.replace(root, 'src'))) continue;
  const n = norm(f);
  const base = path.basename(f).replace(/\.(ts|tsx)$/, '');
  let used = false;
  for (const r of refs) {
    if (r === n || r.endsWith('/' + base) || r === base) { used = true; break; }
  }
  if (!used) isolated.push(f);
}

console.log('孤立模块数量:', isolated.length);
isolated.forEach((f) => console.log(' -', f.replace(root + '/', '')));
