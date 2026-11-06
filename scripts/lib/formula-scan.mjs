// 公式收集：渲染体检（check-formulas）与文档数字核对（check-docs-stats）共用同一套口径，
// 避免两处各数一遍、数字各不相同。
import fs from 'node:fs';
import path from 'node:path';

// 走 KaTeX 渲染的公式字段文件
export const FORMULA_FILES = [
  'src/data/explainers.ts',
  'src/data/flows.ts',
  'src/data/formulas.ts',
  'src/data/competition-formulas.ts',
  'src/data/competition-knowledge.ts',
  'src/data/competition-proofs.ts',
  'src/data/courses/linear-algebra.ts',
];

// 课程数据用 $...$ 内联公式，按 $ 配对切分，奇数段才是公式
export const INLINE_FILES = ['src/data/courses/linear-algebra.ts'];

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

/**
 * 收集所有会被渲染的公式。
 * @returns {{ file: string, line: number, latex: string, display: boolean }[]}
 */
export function collectFormulaCandidates(root = process.cwd()) {
  const out = [];
  for (const rel of FORMULA_FILES) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    const src = fs.readFileSync(abs, 'utf8');
    let m;
    FIELD_RE.lastIndex = 0;
    while ((m = FIELD_RE.exec(src))) {
      const latex = decode(m[1]);
      if (!latex.includes('\\')) continue;
      const line = src.slice(0, m.index).split('\n').length;
      out.push({ file: rel, line, latex, display: true });
    }
  }
  for (const rel of INLINE_FILES) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    const src = fs.readFileSync(abs, 'utf8');
    src.split('\n').forEach((text, idx) => {
      const parts = text.split('$');
      for (let i = 1; i < parts.length; i += 2) {
        const raw = parts[i];
        if (!raw || raw.trim() === '') continue;
        out.push({ file: rel, line: idx + 1, latex: raw.replace(/\\\\/g, '\\'), display: false });
      }
    });
  }
  return out;
}
