// 生成题多样性检查：同一知识点反复出题时，重复率不能过高
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
    if (spec.startsWith('@/')) { const t = path.join('src', spec.slice(2)); for (const e of ['', '.ts', '.tsx', '/index.ts']) if (fs.existsSync(t + e)) return load(t + e); return {}; }
    if (spec.startsWith('.')) { const t = path.resolve(path.dirname(abs), spec); for (const e of ['', '.ts', '.tsx']) if (fs.existsSync(t + e)) return load(t + e); }
    return {};
  };
  new Function('exports', 'require', 'module', js)(module.exports, req, module);
  return module.exports;
}

const mod = load('src/lib/math-practice.ts');
const N = 60;
const MIN_PER_TOPIC = 20; // 每知识点至少 20 道不同题（60 次抽取）
let totalDistinct = 0;
let totalN = 0;
const rows = [];

for (const t of mod.PRACTICE_TOPICS) {
  const seen = new Set();
  for (let i = 0; i < N; i++) {
    const d = ['basic', 'advanced', 'competition'][i % 3];
    try {
      const q = mod.generatePracticeQuestion(t.key, d);
      if (q && q.questionLatex) seen.add(q.questionLatex);
    } catch { /* 单个生成失败不影响统计 */ }
  }
  rows.push([t.key, seen.size]);
  totalDistinct += seen.size;
  totalN += N;
}

const rate = totalDistinct / totalN;
console.log('出题多样性：平均去重率 ' + (rate * 100).toFixed(1) + '%（' + totalDistinct + '/' + totalN + '）');

const low = rows.filter(([, n]) => n < MIN_PER_TOPIC);
if (low.length) {
  for (const [k, n] of low.sort((a, b) => a[1] - b[1])) {
    console.log('  偏低 ' + k + ': ' + n + '/' + N);
  }
}
if (rate < 0.6 || low.length > 0) {
  console.log('不合格：需要扩大参数空间或增加题型');
  process.exit(1);
}
