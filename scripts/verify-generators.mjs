// 本地生成器复核：抽样出题 → 收集 verify 声明 → 交给 sympy 独立重算
// 用法：node scripts/verify-generators.mjs   （需要 PYTHONPATH 指向 sympy）
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
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
const PER_TOPIC = 8;
const claims = [];
let sampled = 0;

for (const t of mod.PRACTICE_TOPICS) {
  for (const d of ['basic', 'advanced', 'competition']) {
    for (let i = 0; i < PER_TOPIC; i++) {
      let q;
      try { q = mod.generatePracticeQuestion(t.key, d); } catch { continue; }
      if (!q) continue;
      sampled++;
      if (q.verify) claims.push({ id: q.id, topic: t.key, claim: q.verify });
    }
  }
}

fs.writeFileSync('/tmp/mf-claims.json', JSON.stringify(claims));
const pyPath = path.resolve(process.cwd(), '..', '.tooling', 'py');
const env = { ...process.env, PYTHONPATH: pyPath };
const raw = execFileSync('python3', ['scripts/verify-claims.py', '/tmp/mf-claims.json'], { env, maxBuffer: 20 * 1024 * 1024 });
const results = JSON.parse(raw.toString());

const failed = results.filter((r) => !r.ok);
const byTopic = {};
for (const r of results) {
  byTopic[r.topic] = byTopic[r.topic] ?? { total: 0, ok: 0 };
  byTopic[r.topic].total++;
  if (r.ok) byTopic[r.topic].ok++;
}

console.log('生成器复核：抽样 ' + sampled + ' 题，可复核 ' + claims.length + ' 题，通过 ' + (results.length - failed.length) + '，失败 ' + failed.length);
// 覆盖率：哪些知识点还没有可复核声明
const coverage = {};
for (const it of claims) coverage[it.topic] = (coverage[it.topic] ?? 0) + 1;
const perTopic = {};
for (const t of mod.PRACTICE_TOPICS) perTopic[t.key] = { sampled: 0, claimed: 0 };
for (const t of mod.PRACTICE_TOPICS) perTopic[t.key].sampled = PER_TOPIC * 3;
for (const it of claims) perTopic[it.topic].claimed++;
const low = Object.entries(perTopic)
  .filter(([, v]) => v.claimed < v.sampled)
  .sort((a, b) => a[1].claimed - b[1].claimed)
  .slice(0, 8);
if (low.length) {
  console.log('  低覆盖知识点：' + low.map(([k, v]) => k + ' ' + v.claimed + '/' + v.sampled).join('，'));
}
for (const f of failed.slice(0, 10)) {
  console.log('  FAIL [' + f.topic + '] claim=' + f.claim + ' computed=' + f.computed + (f.error ? ' err=' + f.error : ''));
}
if (failed.length > 0) process.exit(1);
