import { readFileSync } from 'node:fs';
const file = 'src/data/problem-generators.ts';
const lines = readFileSync(file, 'utf8').split('\n');
const sig = lines.map((l, i) => /^\s*generate\(/.test(l) ? i : -1).filter(i => i >= 0);
const log = readFileSync('/tmp/mf-pg.log', 'utf8').trim().split('\n');
for (const e of log) {
  const m = e.match(/\((\d+),\d+\): error TS6133: 'rand'/);
  if (!m) continue;
  const n = Number(m[1]);
  const t = n - 1;
  const next = sig.find(s => s > t);
  const body = lines.slice(t + 1, next).join('\n');
  const diffUse = (body.match(/\bdiff\b/g) || []).length;
  console.log(`${n} diff=${diffUse} | ${lines[t].trim()}`);
}
