// 分析 components/ui 原语的引用闭包：
// 1. 收集业务代码（非 ui 目录）对 ui 模块的引用，作为根集合
// 2. 从根集合沿 ui 内部 import 做闭包扩散
// 3. 未进入闭包的 ui 文件即为可移除候选
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src');
const uiDir = path.join(root, 'components', 'ui');

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const allFiles = walk(root);
const importRe = /from\s+["']([^"']+)["']/g;

// 文件 -> 其引用的模块名集合
const refsOf = new Map();
for (const f of allFiles) {
  const c = fs.readFileSync(f, 'utf8');
  const refs = new Set();
  let m;
  while ((m = importRe.exec(c))) refs.add(m[1]);
  refsOf.set(f, refs);
}

// 业务文件（不在 ui 目录）
const businessFiles = allFiles.filter((f) => !f.includes(`${path.sep}ui${path.sep}`));

// 根集合：被业务文件直接 import 的 ui 模块
const rootUi = new Set();
for (const f of businessFiles) {
  for (const r of refsOf.get(f)) {
    if (r.startsWith('@/components/ui/')) rootUi.add(r.replace('@/components/ui/', ''));
  }
}

// ui 内部依赖闭包
const closure = new Set(rootUi);
let changed = true;
while (changed) {
  changed = false;
  for (const uiName of closure) {
    const uiFile = path.join(uiDir, `${uiName}.tsx`);
    if (!fs.existsSync(uiFile)) continue;
    for (const r of refsOf.get(uiFile)) {
      if (r.startsWith('@/components/ui/')) {
        const dep = r.replace('@/components/ui/', '');
        if (!closure.has(dep)) { closure.add(dep); changed = true; }
      }
    }
  }
}

const uiFiles = walk(uiDir).map((f) => path.basename(f, '.tsx'));
const used = new Set(closure);
const unused = uiFiles.filter((n) => !used.has(n));
const usedList = uiFiles.filter((n) => used.has(n));

console.log('业务直接引用的 ui 模块数:', rootUi.size);
console.log('闭包内（被间接依赖保留）:', usedList.length);
console.log('=== 保留清单 ===');
usedList.forEach((n) => console.log('  *', n));
console.log('=== 可移除候选（业务与 ui 内部均无引用）:', unused.length, '===');
unused.forEach((n) => console.log(' -', n));

// 精确路径引用复核：对每个候选，扫描业务文件中 @/components/ui/<name> 精确 import
console.log('\n=== 精确路径引用复核（业务文件）===');
for (const n of unused) {
  const needle = `@/components/ui/${n}`;
  const hits = businessFiles.filter((f) => {
    const c = fs.readFileSync(f, 'utf8');
    return c.includes(needle);
  });
  if (hits.length) {
    console.log(`【需保留】${n} 被业务 import:`);
    hits.forEach((h) => console.log('    ', h.replace(root + '/', '')));
  }
}
