// 生成新颖度基线：抽样本地参数化生成器，得到「已有题型骨架」
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
const out = [];
for (const t of mod.PRACTICE_TOPICS) {
  for (const d of ['basic', 'advanced', 'competition']) {
    for (let i = 0; i < 12; i++) {
      try {
        const q = mod.generatePracticeQuestion(t.key, d);
        if (q && q.questionLatex) out.push({ latex: q.questionLatex, answer: q.answer, source: t.key });
      } catch { /* 跳过 */ }
    }
  }
}
fs.writeFileSync('server/novelty-baseline.json', JSON.stringify(out, null, 0));
console.log('baseline:', out.length);
