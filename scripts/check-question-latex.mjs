// 实测竞赛题库题干/答案 Latex 字段渲染
import katex from 'katex';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, '..', 'src', 'data');
const files = ['competition-questions.ts', 'competition-mock.ts', 'competition-real-exams.ts', 'competition-sprint.ts'];

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
        case 'f': out += '\f'; i++; break;
        default: out += '\\' + next; i++;
      }
    } else out += ch;
  }
  return out;
}

let total = 0;
const fail = [];
for (const f of files) {
  const src = fs.readFileSync(path.join(base, f), 'utf8');
  const re = /(questionLatex|answerLatex|coreLatex|fracLatex)\s*:\s*(`[^`]*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g;
  let m;
  while ((m = re.exec(src))) {
    const raw = decodeJs(m[2].slice(1, -1), m[2][0]);
    total++;
    try {
      katex.renderToString(raw, { throwOnError: true, strict: false });
    } catch (e) {
      fail.push({ f, field: m[1], latex: raw.slice(0, 120), err: String(e.message || e).slice(0, 90) });
    }
  }
}
console.log(`实测 ${total} 个题干/答案公式，失败 ${fail.length}`);
fail.forEach(x => console.log(`\n[${x.f}:${x.field}]\n  ${x.latex}\n  ${x.err}`));
