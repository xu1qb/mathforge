// 公式渲染体检：把项目里所有公式字符串交给 KaTeX 真正渲染一遍（strict 模式）
import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';

const ROOT = process.cwd();
const FILES = [
  'src/data/explainers.ts',
  'src/data/flows.ts',
  'src/data/formulas.ts',
  'src/data/competition-formulas.ts',
  'src/data/competition-knowledge.ts',
  'src/data/competition-proofs.ts',
];

const FIELD_RE = /(?:formula|result|latex|expression):\s*'((?:[^'\\]|\\.)*)'/g;

// 逐字符解码 JS 单引号字符串：只处理 \\ 和 \'，其余原样保留
function decode(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && i + 1 < s.length) {
      const n = s[i + 1];
      if (n === '\\') { out += '\\'; i++; continue; }
      if (n === "'") { out += "'"; i++; continue; }
      out += c;
      continue;
    }
    out += c;
  }
  return out;
}

const failures = [];
let total = 0;

for (const rel of FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const src = fs.readFileSync(abs, 'utf8');
  let m;
  FIELD_RE.lastIndex = 0;
  while ((m = FIELD_RE.exec(src))) {
    const latex = decode(m[1]);
    if (!latex.includes('\\')) continue;
    total++;
    const line = src.slice(0, m.index).split('\n').length;
    try {
      katex.renderToString(latex, { displayMode: true, throwOnError: true, strict: 'error' });
    } catch (e) {
      failures.push({
        file: rel,
        line,
        latex: latex.slice(0, 90),
        error: String(e.message || e).slice(0, 140),
      });
    }
  }
}

console.log('公式总数（含 LaTeX 命令）:', total);
console.log('渲染失败:', failures.length);
for (const f of failures.slice(0, 25)) {
  console.log('---');
  console.log(f.file + ':' + f.line);
  console.log('  公式: ' + f.latex);
  console.log('  错误: ' + f.error);
}
process.exit(failures.length === 0 ? 0 : 1);
