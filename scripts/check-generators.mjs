// 生成题抽样体检：29 个知识点 × 3 难度 × 5 道，检查渲染与书写规范
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import katex from 'katex';
const cache = new Map();
function load(file) {
  const abs = path.resolve(file);
  if (cache.has(abs)) return cache.get(abs).exports;
  const src = fs.readFileSync(abs, 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: abs }).outputText;
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
const topics = mod.PRACTICE_TOPICS.map((t) => t.key);
const diffs = ['basic', 'advanced', 'competition'];
function mathSegments(s) {
  if (!s.includes('$')) return [s];
  const parts = s.split('$');
  const out = [];
  for (let i = 1; i < parts.length; i += 2) if (parts[i].trim()) out.push(parts[i]);
  return out;
}
const rules = [
  { id: 'caret', name: '幂次未加花括号 (x^2)', test: (s) => /\^(?![{\s\\])/.test(s) },
  { id: 'sqrtcall', name: '用了 sqrt()', test: (s) => /sqrt\(/.test(s) },
  { id: 'doubleminus', name: '双负号 (x--4)', test: (s) => /--/.test(s) },
  { id: 'brackets', name: '残留 [[ ]]', test: (s) => /\[\[/.test(s) },
  { id: 'star', name: '用 * 当乘号', test: (s) => /\*/.test(s) },
];
const stats = {};
const samples = {};
let total = 0, renderFail = 0, textMode = 0, latexMode = 0;
const failSamples = [];
for (const topic of topics) {
  for (const diff of diffs) {
    for (let i = 0; i < 5; i++) {
      let q;
      try { q = mod.generatePracticeQuestion(topic, diff); } catch { continue; }
      if (!q || !q.questionLatex) continue;
      total++;
      const raw = q.questionLatex;
      if (raw.includes('$')) textMode++; else latexMode++;
      for (const seg of mathSegments(raw)) {
        if (/[一-龥]/.test(seg) && !seg.includes(String.fromCharCode(92))) continue;
        try { katex.renderToString(seg, { displayMode: true, throwOnError: true, strict: 'error' }); }
        catch (e) {
          renderFail++;
          if (failSamples.length < 5) failSamples.push([topic + '/' + diff, seg.slice(0, 60), String(e.message).slice(0, 60)]);
        }
        for (const r of rules) if (r.test(seg)) {
          stats[r.id] = (stats[r.id] || 0) + 1;
          if (!samples[r.id]) samples[r.id] = [topic + '/' + diff, seg.slice(0, 70)];
        }
      }
    }
  }
}
console.log('生成题抽样:', total, '| 纯 LaTeX:', latexMode, '| 文本+$公式$:', textMode, '| 渲染失败:', renderFail);
for (const f of failSamples) console.log('  FAIL [' + f[0] + '] ' + JSON.stringify(f[1]) + ' :: ' + f[2]);
for (const r of rules) {
  const n = stats[r.id] || 0;
  if (!n) continue;
  console.log('  ' + r.name + ': ' + n);
  if (samples[r.id]) console.log('      例 [' + samples[r.id][0] + '] ' + samples[r.id][1]);
}
const failed = renderFail > 0 || Object.values(stats).some((n) => n > 0);
if (failed) {
  console.log('存在问题：渲染失败 ' + renderFail + '，风格问题 ' + JSON.stringify(stats));
}
process.exit(failed ? 1 : 0);
