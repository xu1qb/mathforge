import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/data/problem-generators.ts';
const lines = readFileSync(file, 'utf8').split('\n');
const log = readFileSync('/tmp/mf-pg-local.log', 'utf8').trim().split('\n');
const items = [];
for (const e of log) {
  const m = e.match(/\((\d+),\d+\): error TS6133: '(\w+)'/);
  if (m) items.push({ n: Number(m[1]), name: m[2] });
}
let mismatch = 0;
for (const it of items) {
  const txt = lines[it.n - 1];
  if (!new RegExp(`^\\s*const ${it.name} =`).test(txt)) {
    console.log(`MISMATCH ${it.n} [${it.name}]: ${txt}`);
    mismatch++;
  }
}
console.log('mismatch =', mismatch, 'count =', items.length);
if (process.argv.includes('--apply') && mismatch === 0) {
  const toDelete = new Set(items.map(i => i.n));
  const kept = lines.filter((_, i) => !toDelete.has(i + 1));
  writeFileSync(file, kept.join('\n'));
  console.log('deleted', toDelete.size, 'lines');
}
