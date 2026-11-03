import { readFileSync } from 'node:fs';
const file = 'src/data/problem-generators.ts';
const lines = readFileSync(file, 'utf8').split('\n');
const log = readFileSync('/tmp/mf-pg-local.log', 'utf8').trim().split('\n');
for (const e of log) {
  const m = e.match(/\((\d+),\d+\): error TS6133: '(\w+)'/);
  if (!m) continue;
  const n = Number(m[1]); const name = m[2];
  const txt = lines[n - 1];
  const single = /^\s*const \w+ = .*;\s*$/.test(txt);
  console.log(`${single ? 'LINE ' : 'MULT '} ${n} [${name}] ${txt.trim()}`);
}
