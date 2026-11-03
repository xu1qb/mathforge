// 静态实测：抽取 math-practice / step-by-step 中 latex 字段，模拟 JS 解码，替换 ${} 后实测 KaTeX
import katex from 'katex';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const files = [
  'src/lib/math-practice.ts',
  'src/lib/step-by-step.ts',
];

function decodeJs(str, quote) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '\\' && i + 1 < str.length) {
      const next = str[i + 1];
      switch (next) {
        case '\\': out += '\\'; i++; break;
        case quote: out += quote; i++; break;
        case 'n': out += '\n'; i++; break;
        case 't': out += '\t'; i++; break;
        case 'r': out += '\r'; i++; break;
        case 'b': out += '\b'; i++; break;
        case 'f': out += '\f'; i++; break;
        case 'v': out += '\v'; i++; break;
        default: out += '\\' + next; i++;
      }
    } else out += ch;
  }
  return out;
}

const fields = /(questionLatex|answerLatex|resultLatex|latex)\s*:\s*/g;
const strRe = /(`[\s\S]*?`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g;
let total = 0, failures = [];

for (const rel of files) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  let fm;
  fields.lastIndex = 0;
  while ((fm = fields.exec(src)) !== null) {
    let pos = fm.index + fm[0].length;
    while (pos < src.length && /\s/.test(src[pos])) pos++;
    strRe.lastIndex = pos;
    const sm = strRe.exec(src);
    if (!sm || sm.index !== pos) continue;
    const raw = sm[0];
    let latex = decodeJs(raw.slice(1, -1), raw[0]);
    // 替换插值为示例数值
    latex = latex.replace(/\$\{[^}]*\}/g, '2');
    total++;
    const line = src.slice(0, fm.index).split('\n').length;
    try {
      katex.renderToString(latex, { throwOnError: true, strict: false, output: 'html' });
    } catch (err) {
      failures.push({ rel, line, latex, error: String(err.message || err).split('\n')[0] });
    }
  }
}

console.log(`=== 共实测 ${total} 个运行时公式 ===`);
console.log(`渲染失败: ${failures.length} 个\n`);
for (const f of failures) {
  console.log(`[${f.rel}:${f.line}]`);
  console.log(`  ${f.latex.slice(0, 180)}`);
  console.log(`  错误: ${f.error}\n`);
}
