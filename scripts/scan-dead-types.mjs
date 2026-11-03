// 扫描全工程导出的 interface / type：外部词命中 + 同文件内部使用（剔除声明行）
// 输出外部=0 且 同文件使用=0 的死类型候选；外部=0 但同文件在用的列为内部保留
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
const allFiles = walk(root);
const contents = new Map(allFiles.map((f) => [f, fs.readFileSync(f, 'utf8')]));

const declRe = /export\s+(interface|type)\s+([A-Za-z0-9_]+)/g;

const dead = [], internal = [], external = [];

for (const [file, code] of contents) {
  let m;
  declRe.lastIndex = 0;
  while ((m = declRe.exec(code))) {
    const kind = m[1], name = m[2];
    const word = new RegExp(`\\b${name}\\b`);
    const externalFiles = allFiles.filter((f) => f !== file && word.test(contents.get(f)));
    // 同文件使用：剔除声明行
    const internalLines = code.split('\n').filter((l) => !new RegExp(`export\\s+(interface|type)\\s+${name}\\b`).test(l));
    const internalHits = internalLines.filter((l) => word.test(l)).length;
    const rel = path.relative(root, file);
    const rec = { rel, kind, name, ext: externalFiles.length, internal: internalHits, extFiles: externalFiles.map((f) => path.relative(root, f)) };
    if (externalFiles.length > 0) external.push(rec);
    else if (internalHits > 0) internal.push(rec);
    else dead.push(rec);
  }
}

const show = (title, arr) => {
  console.log(`\n===== ${title}: ${arr.length} =====`);
  const by = new Map();
  arr.forEach((r) => { (by.get(r.rel) || by.set(r.rel, []).get(r.rel)).push(r); });
  for (const [f, rs] of [...by.entries()].sort()) {
    console.log(f);
    rs.forEach((r) => console.log(`   - ${r.name} [${r.kind}] 外部=${r.ext} 内部=${r.internal}${r.ext ? ' → ' + r.extFiles.join(',') : ''}`));
  }
};
show('外部零引用且同文件零使用（死类型候选）', dead);
show('外部零引用但同文件在用（内部类型，保留）', internal);
console.log(`\n外部有引用类型: ${external.length}`);
