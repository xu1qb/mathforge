// 函数/导出名级未使用扫描：
// 1. 收集每个源码文件的具名导出（function/const/interface/type/class）与 default 导出
// 2. 解析全工程 import 语句（具名/默认/命名空间/动态 import），统计被外部引用的符号
// 3. 输出未被任何外部文件 import 的具名导出候选（同文件内部使用不算外部引用）
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
const rel = (f) => path.relative(root, f).replace(/\\/g, '/');

// 模块路径别名映射：@/ -> src/
function resolveModule(spec, fromFile) {
  let base;
  if (spec.startsWith('@/')) base = path.join(root, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null; // 第三方
  for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
    if (fs.existsSync(base + ext)) return base + ext;
  }
  if (fs.existsSync(path.join(base, 'index.ts'))) return path.join(base, 'index.ts');
  if (fs.existsSync(path.join(base, 'index.tsx'))) return path.join(base, 'index.tsx');
  if (fs.existsSync(base)) return base;
  return null;
}

// 导出集合
const exportsOf = new Map(); // file -> { named:Set, hasDefault:bool, defaultName:string }

// 收集被外部引用的 (模块文件, 符号)
const referenced = new Map(); // file -> Set symbols
function markRef(moduleFile, symbol) {
  if (!referenced.has(moduleFile)) referenced.set(moduleFile, new Set());
  referenced.get(moduleFile).add(symbol);
}

const exportRe = /^export\s+(default\s+)?(async\s+)?(function|const|let|var|interface|type|class)\s+([A-Za-z0-9_$]+)/gm;
const exportBlockRe = /export\s*\{([^}]*)\}\s*(?:from\s*["']([^"']+)["'])*/g;

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const named = new Set();
  let hasDefault = false;
  let m;
  exportRe.lastIndex = 0;
  while ((m = exportRe.exec(c))) {
    if (m[1]) { hasDefault = true; continue; }
    named.add(m[4]);
  }
  exportBlockRe.lastIndex = 0;
  while ((m = exportBlockRe.exec(c))) {
    const fromSpec = m[2];
    // export { ... } from 'external'：转发外部模块，不计入本地导出；登记外部引用
    if (fromSpec) {
      const mod = resolveModule(fromSpec, f);
      if (mod && fs.existsSync(mod)) {
        m[1].split(',').forEach((item) => {
          const t = item.trim(); if (!t) return;
          const as = t.split(/\s+as\s+/);
          markRef(mod, as.length === 2 ? as[0].trim() : t);
        });
      }
      continue;
    }
    m[1].split(',').forEach((item) => {
      const t = item.trim();
      if (!t) return;
      const as = t.split(/\s+as\s+/);
      const out = as.length === 2 ? as[1].trim() : t;
      named.add(out);
    });
  }
  if (/export\s+default\s/.test(c)) hasDefault = true;
  exportsOf.set(f, { named, hasDefault });
}

const importRe = /import\s+(?:type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["']/g;
const dynamicImportRe = /import\(\s*["']([^"']+)["']\s*\)/g;

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  let m;
  importRe.lastIndex = 0;
  while ((m = importRe.exec(c))) {
    const clause = m[1].trim();
    const mod = resolveModule(m[2], f);
    if (!mod || !fs.existsSync(mod)) continue;
    // default: import X from
    // namespace: import * as X from
    // named: import { a, b as c } from
    let defMatch = null;
    if (/^\*\s+as\s+[A-Za-z0-9_$]+/.test(clause)) continue; // 命名空间，无法精确拆分
    // 拆分默认与具名
    const brace = clause.match(/\{([\s\S]*)\}/);
    const beforeBrace = clause.replace(/\{[\s\S]*\}/, '').replace(/,/g, '').trim();
    if (beforeBrace) defMatch = beforeBrace.split(/,/)[0].trim();
    if (defMatch) markRef(mod, '__default__');
    if (brace) {
      brace[1].split(',').forEach((item) => {
        const t = item.trim();
        if (!t) return;
        const as = t.split(/\s+as\s+/);
        const orig = as.length === 2 ? as[0].trim() : t;
        markRef(mod, orig);
      });
    }
  }
  dynamicImportRe.lastIndex = 0;
  while ((m = dynamicImportRe.exec(c))) {
    const mod = resolveModule(m[1], f);
    if (mod && fs.existsSync(mod)) markRef(mod, '__default__');
  }
}

// 差集输出：仅扫描业务目录（lib/hooks/components，排除 ui 预留与页面）
const scopeDirs = ['lib', 'hooks', 'components'];
const unused = [];
for (const f of files) {
  const r = rel(f);
  if (!scopeDirs.some((d) => r.startsWith(d + '/'))) continue;
  if (r.startsWith('components/ui/')) continue;
  const { named, hasDefault } = exportsOf.get(f);
  const ref = referenced.get(f) || new Set();
  for (const name of named) {
    if (!ref.has(name)) {
      // 排除类型：被别处 import type 已计入；记录为候选
      unused.push({ file: r, name });
    }
  }
  if (hasDefault && !ref.has('__default__')) unused.push({ file: r, name: '__default__' });
}

console.log('未被外部 import 的具名导出候选数量:', unused.length);
const byFile = new Map();
unused.forEach((u) => {
  if (!byFile.has(u.file)) byFile.set(u.file, []);
  byFile.get(u.file).push(u.name);
});
for (const [file, names] of [...byFile.entries()].sort()) {
  console.log(`\n${file}`);
  names.forEach((n) => console.log('   -', n));
}
