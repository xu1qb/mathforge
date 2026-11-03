import katex from 'katex';
import fs from 'node:fs';

const file = 'src/data/competition-traps.ts';
const lines = fs.readFileSync(file, 'utf8').split('\n');

// 新的第 378 行（索引 377）。普通单引号串：命令用 \\，cases 换行用 \\\\
const newLine = String.raw`      '讨论函数 $f(x)=\\begin{cases} \\dfrac{\\sin x}{x}, & x>0 \\\\ a+x, & x\\le 0 \\end{cases}$ 在 $x=0$ 处的连续性，求 $a$ 的值使得 $f(x)$ 在 $x=0$ 连续。',`;

// dry-run：eval 新串，抽取公式实测
const runtime = eval(newLine.trim().replace(/,$/, ''));
const mathRe = /\$([^$]+)\$/g;
let mm, ok = true;
while ((mm = mathRe.exec(runtime))) {
  const latex = mm[1].trim();
  try {
    katex.renderToString(latex, { throwOnError: true, strict: false });
    console.log('OK  :', latex.slice(0, 90));
  } catch (e) {
    ok = false;
    console.log('FAIL:', latex.slice(0, 120), '\n  ', String(e.message).split('\n')[0]);
  }
}

if (!ok) { console.log('dry-run 失败，未写入'); process.exit(1); }
lines[377] = newLine;
fs.writeFileSync(file, lines.join('\n'));
console.log('已写入第 378 行');
