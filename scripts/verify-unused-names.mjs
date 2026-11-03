// 二次核验 analyze-unused-exports 输出的候选符号：
// 对每个 (file, name)：
//  - 判断声明类型 function / const / interface / type
//  - 统计定义文件之外，出现该标识符（词边界）的文件集合 = 外部引用证据
//  - 统计定义文件内部（剔除 export 声明行）标识符出现次数 = 内部互调证据
// 仅外部零命中 且 内部也无调用 的函数/常量才进入可删候选；类型单独列出待人工确认
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

// 解析候选清单（由上一个脚本输出格式）
const log = fs.readFileSync(path.join(__dirname, 'tmp-unused.txt'), 'utf8');
const candidates = [];
let curFile = null;
for (const line of log.split('\n')) {
  if (/^(lib|hooks|components)\//.test(line.trim())) curFile = line.trim();
  else {
    const m = line.match(/^\s+-\s+(\S+)/);
    if (m && curFile) candidates.push({ file: curFile, name: m[1] });
  }
}

const declTypeRe = (name) => new RegExp(
  `export\\s+(default\\s+)?(async\\s+)?(function|const|let|var|interface|type|class)\\s+${name}\\b`
);

const deletable = [];
const internalOnly = [];
const typeCandidates = [];
const externalUsed = [];

for (const c of candidates) {
  const file = path.join(root, c.file);
  if (!contents.has(file)) continue;
  const code = contents.get(file);
  const dm = code.match(declTypeRe(c.name));
  const kind = dm ? (dm[3] || dm[2] || 'const') : 'unknown';
  const isType = kind === 'interface' || kind === 'type';

  const word = new RegExp(`\\b${c.name}\\b`);
  // 外部文件词命中
  const external = allFiles.filter((f) => f !== file && word.test(contents.get(f)));
  // 内部调用：剔除导出声明行后计数
  const internalLines = code.split('\n').filter((l) => !/^\s*export\s/.test(l));
  const internalCalls = internalLines.filter((l) => word.test(l)).length;

  const rec = { ...c, kind, externalFiles: external.length, internalCalls };
  if (external.length > 0) externalUsed.push(rec);
  else if (isType) typeCandidates.push(rec);
  else if (internalCalls > 0) internalOnly.push(rec);
  else deletable.push(rec);
}

function show(title, arr) {
  console.log(`\n===== ${title}: ${arr.length} =====`);
  const by = new Map();
  arr.forEach((r) => { (by.get(r.file) || by.set(r.file, []).get(r.file)).push(r); });
  for (const [f, rs] of [...by.entries()].sort()) {
    console.log(f);
    rs.forEach((r) => console.log(`   - ${r.name} [${r.kind}] 外部=${r.externalFiles} 内部调用=${r.internalCalls}`));
  }
}
show('外部零命中且内部无调用（可删候选）', deletable);
show('外部零命中但被同文件内部调用（保留）', internalOnly);
show('类型/接口候选（人工确认 import type）', typeCandidates);
console.log(`\n外部有词命中（脚本 import 识别偏差，保留）: ${externalUsed.length}`);
