// 扫描 data 目录所有字符串字面量，解码 JS 转义后提取 $...$ / $$...$$ 内嵌公式，实测 KaTeX
// 按行处理：行首带 String.raw 的模板串反斜杠原样保留；普通引号串做 JS 转义解码，避免跨行匹配错位
import katex from 'katex';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'data');

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

const strRe = /(`(?:[^`\\]|\\.)*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g;
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));
let total = 0;
const failures = [];

for (const file of files) {
  const src = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, li) => {
    const lineIsRaw = /String\.raw\s*`/.test(line);
    strRe.lastIndex = 0;
    let sm;
    while ((sm = strRe.exec(line))) {
      const raw = sm[0];
      const decoded = lineIsRaw ? raw.slice(1, -1) : decodeJs(raw.slice(1, -1), raw[0]);
      const lineNo = li + 1;
      // 先剥离 JS 模板插值 ${...}，避免其 $ 被误判为公式边界
      const stripped = decoded.replace(/\$\{[^}]*\}/g, '1');
      const mathRe = /\$\$([\s\S]*?)\$\$|\$([^$]+)\$/g;
      let mm;
      while ((mm = mathRe.exec(stripped))) {
        const latex = (mm[1] || mm[2] || '').trim();
        if (!latex) continue;
        total++;
        try {
          katex.renderToString(latex, { throwOnError: true, strict: false, output: 'html' });
        } catch (err) {
          failures.push({ file, line: lineNo, latex, error: String(err.message || err).split('\n')[0] });
        }
      }
    }
  });
}

console.log(`=== 内嵌公式共 ${total} 个 ===`);
console.log(`渲染失败: ${failures.length} 个\n`);
for (const f of failures) {
  console.log(`[${f.file}:${f.line}]`);
  console.log(`  公式: ${f.latex.slice(0, 180)}`);
  console.log(`  错误: ${f.error}\n`);
}
