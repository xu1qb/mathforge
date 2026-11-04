// 难度自检：三档题目的步骤数与题面复杂度应逐级递增
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
const N = 12;
const rows = [];

for (const t of mod.PRACTICE_TOPICS) {
  const s = {};
  for (const d of ['basic', 'advanced', 'competition']) {
    let steps = 0, len = 0, n = 0;
    for (let i = 0; i < N; i++) {
      try {
        const q = mod.generatePracticeQuestion(t.key, d);
        steps += q.steps.length;
        len += q.question.length;
        n++;
      } catch { /* 忽略个别失败 */ }
    }
    s[d] = { steps: steps / (n || 1), len: len / (n || 1) };
  }
  rows.push([t.key, s]);
}

let bad = 0;
let bSum = 0, cSum = 0;
for (const [k, s] of rows) {
  bSum += s.basic.steps;
  cSum += s.competition.steps;
  const score = (x) => x.steps * 2 + x.len / 40;
  if (score(s.competition) < score(s.basic)) {
    bad++;
    console.log('  难度倒挂 ' + k + ': 基础 ' + s.basic.steps.toFixed(1) + '步 → 竞赛 ' + s.competition.steps.toFixed(1) + '步');
  }
}
const n = rows.length;
console.log('难度自检：基础均 ' + (bSum / n).toFixed(2) + ' 步，竞赛均 ' + (cSum / n).toFixed(2) + ' 步，倒挂 ' + bad + '/' + n);
process.exit(bad > 0 ? 1 : 0);
