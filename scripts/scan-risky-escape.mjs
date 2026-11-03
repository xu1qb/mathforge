// 静态扫描 v3：剔除成对双反斜杠后，只找真正单反斜杠、会被 JS 转义吞掉的危险 LaTeX 命令
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src');

const CMD = ['frac','dfrac','cfrac','text','textrm','textit','textbf','tan','tanh','theta','vartheta',
  'to','times','begin','end','bar','beta','binom','bmod','right','rightarrow','leftarrow','rho','rangle','root',
  'varphi','varepsilon','vdots','vec','boxed','bigg','Bigg','Big','big','left','tau','tilde','triangle','for','from','vline','cdot','cos','cot','csc','cap','cup','cdots','circ','sin','sec','sqrt','sum','lim','ln','log','int','infty','alpha','gamma','delta','lambda','mu','nu','pi','sigma','omega','Delta','Sigma','Omega','phi','psi','eta','kappa','chi','psi','partial','nabla','infty','le','ge','ne','pm','mp','leq','geq','approx','equiv','propto','infty','bullet','star','ast','circ','circ','perp','parallel','angle','degree','prime','cdots','ldots','dots','ddots','forall','exists','in','notin','subset','supset','subseteq','supseteq','cup','cap','setminus','emptyset','infty','nabla','partial','sqrt','frac','dfrac','cfrac','overset','underset','stackrel','frac'];
const cmdAlt = [...new Set(CMD)].sort((a,b)=>b.length-a.length).join('|');
const DANGER = new Set(['f','t','b','r','v']);
const errors = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(p)) scanFile(p);
  }
}

function scanFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, li) => {
    if (/String\.raw/.test(line)) return;
    const strRe = /(`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;
    let m;
    while ((m = strRe.exec(line))) {
      let masked = m[0].replace(/\\\\/g, '@@BS@@'); // 成对双反斜杠占位
      const escRe = new RegExp(`\\\\(${cmdAlt})(?![a-zA-Z])`, 'g');
      let e;
      while ((e = escRe.exec(masked))) {
        if (!DANGER.has(e[1][0])) continue;
        errors.push({ file: path.relative(root, file), line: li + 1, cmd: e[1], raw: m[0].slice(1, 100) });
      }
    }
  });
}

walk(root);
console.log(`真实单反斜杠危险命令：${errors.length} 处\n`);
const byFile = {};
for (const e of errors) (byFile[e.file] ||= []).push(e);
for (const [f, arr] of Object.entries(byFile)) {
  const uniq = [...new Map(arr.map(x => [x.line, x])).values()];
  console.log(`### ${f} (${arr.length} 命中, ${uniq.length} 行)`);
  uniq.forEach(e => console.log(`  L${e.line} [\\${e.cmd}] ${e.raw}`));
}
