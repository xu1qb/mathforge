// 诊断脚本：正确模拟 JS 字符串转义，抽取 latex/tex/formula 字段，实测 KaTeX 渲染
import katex from 'katex';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'data');

// 按 JS 规则解码：\\ -> \, \t -> tab, \n -> 换行, 其余 \x 保留 \x
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
        default: out += '\\' + next; i++;
      }
    } else {
      out += ch;
    }
  }
  return out;
}

function hasBareChinese(latex) {
  const stripped = latex.replace(/\\text\s*\{[^{}]*\}/g, '');
  return /[一-龥]/.test(stripped);
}

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));
const failures = [];
const bareChinese = [];
let total = 0;

const fieldStart = /(latex|tex|formula|questionLatex|answerLatex|coreLatex|fracLatex)\s*:\s*/g;
const strRe = /(`[\s\S]*?`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g;

for (const file of files) {
  const src = fs.readFileSync(path.join(dataDir, file), 'utf8');
  let fm;
  fieldStart.lastIndex = 0;
  while ((fm = fieldStart.exec(src)) !== null) {
    let pos = fm.index + fm[0].length;
    let latex = '';
    let collected = false;
    while (true) {
      while (pos < src.length && /\s/.test(src[pos])) pos++;
      if (src[pos] === '+') { pos++; continue; }
      strRe.lastIndex = pos;
      const sm = strRe.exec(src);
      if (!sm || sm.index !== pos) break;
      const raw = sm[0];
      latex += decodeJs(raw.slice(1, -1), raw[0]);
      collected = true;
      pos = sm.index + raw.length;
    }
    if (!collected) continue;
    total++;
    const line = src.slice(0, fm.index).split('\n').length;
    if (hasBareChinese(latex)) bareChinese.push({ file, line, latex });
    try {
      katex.renderToString(latex, { displayMode: false, throwOnError: true, strict: false, output: 'html' });
    } catch (err) {
      failures.push({ file, line, latex, error: String(err.message || err).split('\n')[0] });
    }
  }
}

console.log(`=== 共测试 ${total} 个公式 ===`);
console.log(`渲染失败: ${failures.length} 个`);
console.log(`含裸中文(非 \\text 包裹): ${bareChinese.length} 个\n`);

if (failures.length) {
  console.log('===== 渲染失败清单 =====');
  for (const f of failures) {
    console.log(`\n[${f.file}:${f.line}]`);
    console.log(`  公式: ${f.latex.slice(0, 220)}`);
    console.log(`  错误: ${f.error}`);
  }
}
if (bareChinese.length) {
  console.log('\n===== 裸中文清单 =====');
  for (const b of bareChinese) console.log(`[${b.file}:${b.line}] ${b.latex.slice(0, 150)}`);
}
