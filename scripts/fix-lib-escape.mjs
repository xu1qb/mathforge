// 修复 src/lib、src/pages 中运行时题目/公式串里被 JS 转义吞掉反斜杠的 LaTeX 命令
// 保护已有成对 \\；不碰 String.raw；普通 \n 换行（纯文本叙述）保留
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const targets = [
  'src/lib/math-practice.ts',
  'src/lib/step-by-step.ts',
  'src/lib/expression-to-latex.ts',
  'src/lib/latex-to-speech.ts',
  'src/pages/Competition/sections/FormulaReferenceTab.tsx',
];

// 首字母会被 JS 当作转义序列消费反斜杠的命令：f t b r v；n 开头仅公式命令
const CMD = ['frac','dfrac','cfrac','text','textrm','textit','textbf','tan','tanh','theta','vartheta',
  'to','times','begin','end','bar','beta','binom','bmod','right','rho','rangle','root',
  'varphi','varepsilon','vdots','vec','nu','neq','nmid','notin'];
const cmdAlt = CMD.sort((a, b) => b.length - a.length).join('|');
const cmdRe = new RegExp(`\\\\(${cmdAlt})(?![a-zA-Z])`, 'g');

function fixLiteral(lit) {
  let s = lit.replace(/\\\\/g, '@@BS@@');
  let count = 0;
  s = s.replace(cmdRe, (_m, cmd) => { count++; return '\\\\' + cmd; });
  s = s.replace(/@@BS@@/g, '\\\\');
  return { fixed: s, count };
}

function processSource(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  let changed = 0;
  let strings = 0;

  while (i < n) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i);
      const end = nl === -1 ? n : nl;
      out += src.slice(i, end); i = end; continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      const cl = src.indexOf('*/', i + 2);
      const end = cl === -1 ? n : cl + 2;
      out += src.slice(i, end); i = end; continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      let j = i + 1;
      let lit = '';
      while (j < n) {
        const c = src[j];
        if (c === '\\') { lit += src.slice(j, j + 2); j += 2; continue; }
        if (c === quote) break;
        lit += c; j++;
      }
      const before = out.replace(/\s+$/, '');
      if (!before.endsWith('String.raw')) {
        const { fixed, count } = fixLiteral(lit);
        changed += count;
        out += quote + fixed + quote;
      } else {
        out += quote + lit + quote;
      }
      strings++;
      i = j + 1;
      continue;
    }
    out += ch; i++;
  }
  return { out, strings, changed };
}

for (const rel of targets) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) { console.log(`跳过(不存在): ${rel}`); continue; }
  const src = fs.readFileSync(p, 'utf8');
  const { out, strings, changed } = processSource(src);
  fs.writeFileSync(p, out);
  console.log(`${rel}: 字符串 ${strings} 个，补反斜杠 ${changed} 处`);
}
