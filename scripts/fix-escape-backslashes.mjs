// 批量修复 v3：保护成对双反斜杠，只给孤立单反斜杠的危险命令补反斜杠
// JS 单/反引号串中 \f \t \n \b \r \v 会被当转义序列消费掉反斜杠，导致 KaTeX 命令损坏
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'data');

const targets = [
  'competition-knowledge.ts',
  'competition-templates.ts',
  'competition-topic-detail.ts',
  'problem-generators.ts',
];

// 首字母会被 JS 转义消费反斜杠的命令（f t n b r v）；n 开头仅公式命令 nu/neq/nmid/notin，普通 \n 换行保留
const CMD = ['frac','dfrac','cfrac','text','textrm','textit','textbf','tan','tanh','theta','vartheta',
  'to','times','begin','end','bar','beta','binom','bmod','right','rho','rangle','root',
  'varphi','varepsilon','vdots','vec','nu','neq','nmid','notin'];
const cmdAlt = CMD.sort((a, b) => b.length - a.length).join('|');
const cmdRe = new RegExp(`\\\\(${cmdAlt})(?![a-zA-Z])`, 'g');

function fixLiteral(lit) {
  // 1) 保护成对双反斜杠，占位
  let s = lit.replace(/\\\\/g, '@@BS@@');
  // 2) 孤立单反斜杠危险命令 → 双反斜杠
  let count = 0;
  s = s.replace(cmdRe, (_m, cmd) => { count++; return '\\\\' + cmd; });
  // 3) 还原成对双反斜杠
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

for (const f of targets) {
  const p = path.join(root, f);
  const src = fs.readFileSync(p, 'utf8');
  const { out, strings, changed } = processSource(src);
  fs.writeFileSync(p, out);
  console.log(`${f}: 字符串 ${strings} 个，补反斜杠 ${changed} 处`);
}
