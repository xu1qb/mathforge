// 公式转换回归检查：确认表达式能转成规范书面 LaTeX
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const cache = new Map();
function load(file) {
  const abs = path.resolve(file);
  if (cache.has(abs)) return cache.get(abs).exports;
  const src = fs.readFileSync(abs, 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: abs,
  }).outputText;
  const module = { exports: {} };
  cache.set(abs, module);
  const req = (spec) => {
    if (spec.startsWith('.')) {
      const target = path.resolve(path.dirname(abs), spec);
      for (const ext of ['', '.ts', '.tsx']) if (fs.existsSync(target + ext)) return load(target + ext);
    }
    return {};
  };
  new Function('exports', 'require', 'module', js)(module.exports, req, module);
  return module.exports;
}

const { expressionToLatex } = load('src/lib/expression-to-latex.ts');
const { normalizeMathInput } = load('src/lib/math-normalize.ts');

// [输入, 期望包含的片段, 说明]
const CASES = [
  ['[[1,2],[3,4]]', '\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}', '2×2 矩阵'],
  ['[[1,2,3]]+[[3,-2,1]]', '\\begin{pmatrix} 1 & 2 & 3 \\end{pmatrix}', '行向量'],
  ['(−2, 12, 4)', '\\left( -2,\\ 12,\\ 4 \\right)', '圆括号元组'],
  ['(1,2,3)+(-1,0,1)', '\\left( 1,\\ 2,\\ 3 \\right)', '元组相加'],
  ['x²+1', '{x}^{2}', '上标归一化'],
  ['√2', '\\sqrt{2}', '根号'],
  ['a/b', '\\frac{a}{b}', '分数'],
  ['π', '\\pi', '圆周率'],
  ['x^2+2x+1', '{x}^{2}', '幂次'],
];

let fail = 0;
for (const [input, expect, label] of CASES) {
  const out = expressionToLatex(input);
  if (!out.includes(expect)) {
    fail++;
    console.log('FAIL  ' + label + '  输入: ' + input);
    console.log('      期望包含: ' + expect);
    console.log('      实际: ' + out);
  }
}

// 输入层：书面写法应被接受
const INPUT_CASES = [
  ['x²', 'x^2'],
  ['√2', 'sqrt(2)'],
  ['π', 'pi'],
  ['2×3', '2*3'],
  ['1÷2', '1/2'],
  ['−3', '-3'],
];
for (const [input, expect] of INPUT_CASES) {
  const out = normalizeMathInput(input);
  if (!out.includes(expect)) {
    fail++;
    console.log('FAIL  输入归一化: ' + input + ' → ' + out + '（期望含 ' + expect + '）');
  }
}


// ---- 源码守卫：生成器里的 LaTeX 命令必须写双反斜杠 ----
const B = String.fromCharCode(92);
const CMDS = 'begin end frac sqrt mathrm mathbf mathcal mathbb text left right cdot times pm mp le leq ge geq ne neq infty pi alpha beta gamma delta epsilon theta lambda mu nu sigma omega phi psi eta rho tau xi zeta kappa chi upsilon sum prod int partial nabla quad qquad overline underline vec hat tilde bar dot ddot ldots cdots dots vdots ddots to rightarrow Rightarrow Leftrightarrow in notin subset subseteq supset cup cap setminus emptyset forall exists approx sim simeq equiv propto circ prime degree det log ln lg sin cos tan cot sec csc arcsin arccos arctan sinh cosh tanh max min sup inf arg dim ker deg gcd mod bmod pmod operatorname'.split(' ');
const srcPat = new RegExp('(?<!' + B + B + ')' + B + B + '(' + [...new Set(CMDS)].sort((a, b) => b.length - a.length).join('|') + ')(?![a-zA-Z])', 'g');
const SRC_FILES = ['src/lib/math-practice.ts', 'src/data/problem-generators.ts'];
for (const file of SRC_FILES) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) continue;
  const text = fs.readFileSync(abs, 'utf8');
  const hits = text.match(srcPat) || [];
  if (hits.length > 0) {
    fail++;
    console.log('FAIL  ' + file + ' 有 ' + hits.length + ' 处单反斜杠 LaTeX 命令（应写双反斜杠）');
    console.log('      例: ' + [...new Set(hits)].slice(0, 6).join(', '));
  }
}

console.log('公式转换与输入归一化：' + (CASES.length + INPUT_CASES.length) + ' 项，失败 ' + fail);
process.exit(fail === 0 ? 0 : 1);
