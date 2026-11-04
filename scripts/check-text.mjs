// 文本规范体检：中文标点、全半角、术语一致性、占位符残留
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'src/data');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

// 字符串字面量：单引号 / 双引号 / 反引号（反引号用 \u0060 表示，避免与外层冲突）
const STRING_RE = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|\u0060((?:[^\u0060\\]|\\.)*)\u0060/g;

const CJK = /[\u4e00-\u9fa5]/;
const issues = [];

const TERMS = [
  ['傅立叶', '傅里叶'],
  ['罗必达', '洛必达'],
  ['洛比达', '洛必达'],
  ['拉格郎日', '拉格朗日'],
  ['特怔值', '特征值'],
  ['矩陈', '矩阵'],
  ['概律', '概率'],
  ['非数学A', '非数学 A'],
  ['非数学类A', '非数学类 A'],
];

const FORBIDDEN = ['TODO', 'FIXME', '暂无内容', '待补充'];

// 公式/代码语境：出现这些符号就跳过标点类检查（只查术语与占位符）
function isFormulaLike(text) {
  return /[=≈↔°]|\\/.test(text) || /[A-Za-z]\(/.test(text) || /\b(sin|cos|tan|log|ln|det|span)\b/.test(text);
}

function checkString(text, file, line) {
  if (!CJK.test(text)) return;
  const push = (rule, detail) =>
    issues.push({ file, line, rule, detail, text: text.slice(0, 70) });

  const formulaLike = isFormulaLike(text);
  if (!formulaLike && (/[\u4e00-\u9fa5][,;:?!]/.test(text) || /[,;:?!][\u4e00-\u9fa5]/.test(text))) {
    push('中文旁的半角标点', '应使用，；：？！');
  }
  if (!formulaLike && /[\u4e00-\u9fa5]\.(?!\.)(?!\d)/.test(text) && !/[A-Za-z]\./.test(text)) {
    push('中文旁的半角句号', '应使用。');
  }
  // 只有「前半角括号、内含纯中文短语」才算问题；公式里的函数括号不算
  const paren = text.match(/(?:^|[\u4e00-\u9fa5])\(([^()]*[\u4e00-\u9fa5][^()]*)\)/);
  if (!formulaLike && paren && !/[A-Za-z0-9=+\-*/]/.test(paren[1])) push('半角括号包中文', '应使用（）');
  if (/\u3000/.test(text)) push('全角空格', '');
  if (/[。，；：]{2,}/.test(text)) push('重复中文标点', '');
  for (const [bad, good] of TERMS) {
    if (text.includes(bad)) push('术语不一致', bad + ' -> ' + good);
  }
  for (const bad of FORBIDDEN) {
    if (text.includes(bad)) push('残留占位符', bad);
  }
  if (/[\u4e00-\u9fa5] +[，。；：]/.test(text)) push('标点前有空格', '');
}

let scanned = 0;
for (const file of walk(DATA_DIR)) {
  const rel = path.relative(ROOT, file);
  const src = fs.readFileSync(file, 'utf8');
  src.split('\n').forEach((lineText, i) => {
    if (/^\s*(import|export|type|interface|\/\/)/.test(lineText)) return;
    let m;
    STRING_RE.lastIndex = 0;
    while ((m = STRING_RE.exec(lineText))) {
      const text = m[1] ?? m[2] ?? m[3] ?? '';
      scanned++;
      checkString(text, rel, i + 1);
    }
  });
}

console.log('扫描字符串:', scanned);
console.log('问题数:', issues.length);
const byRule = {};
for (const it of issues) byRule[it.rule] = (byRule[it.rule] || 0) + 1;
for (const [rule, n] of Object.entries(byRule)) console.log('  - ' + rule + ': ' + n);
for (const it of issues.slice(0, 25)) {
  console.log('---');
  console.log(it.file + ':' + it.line + ' [' + it.rule + ']' + (it.detail ? ' ' + it.detail : ''));
  console.log('  ' + it.text);
}
process.exit(issues.length === 0 ? 0 : 1);
