import { readFileSync } from 'node:fs';
const file = 'src/data/problem-generators.ts';
const lines = readFileSync(file, 'utf8').split('\n');
const log = readFileSync('/tmp/mf-pg-local.log', 'utf8').trim().split('\n');
for (const entry of log) {
  const m = entry.match(/\((\d+),\d+\): error TS6133: '(\w+)'/);
  if (!m) continue;
  const n = Number(m[1]); const name = m[2];
  console.log(`\n### line ${n}  var=${name}`);
  for (let i = n - 4; i <= n + 4; i++) {
    if (i < 1 || i > lines.length) continue;
    console.log(`${i === n ? '>>' : '  '} ${i}: ${lines[i - 1]}`);
  }
}
