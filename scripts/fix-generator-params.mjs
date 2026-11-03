import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/data/problem-generators.ts';
const lines = readFileSync(file, 'utf8').split('\n');

const onlyDiff = [1365,1418,1828,2525,2654,3016,3121,3193,3332,3623,4777,6268,6718,7031];
const onlyRandStd = [2822,4468,5111,5217,5370,5481,5537,5629,5664,5697,5732,5860,16866];
const bothStd = [2898,3846,3919,3955,4088,4620,4660,4700,5445];
const bothUnderscore = [9286,9427,10208,10630,10710,10956,12486,12625];

const plan = new Map();
for (const n of onlyDiff) plan.set(n, { from: 'generate(rand, diff) {', to: 'generate(rand) {' });
for (const n of onlyRandStd) plan.set(n, { from: 'generate(rand, diff) {', to: 'generate(_rand, diff) {' });
for (const n of bothStd) plan.set(n, { from: 'generate(rand, diff) {', to: 'generate() {' });
for (const n of bothUnderscore) plan.set(n, { from: 'generate(rand, _diff) {', to: 'generate() {' });

let mismatch = 0;
for (const [n, p] of plan) {
  const raw = lines[n - 1];
  const expected = raw.match(/^\s*generate\(rand, diff\) \{$/) || raw.match(/^\s*generate\(rand, _diff\) \{$/);
  if (!expected) { console.log(`MISMATCH ${n}: ${raw}`); mismatch++; continue; }
  const want = raw.trim() === p.from;
  if (!want) { console.log(`SHAPE ${n}: got ${raw.trim()} want ${p.from}`); mismatch++; }
}
console.log('mismatch =', mismatch, 'total =', plan.size);

if (process.argv.includes('--apply') && mismatch === 0) {
  for (const [n, p] of plan) {
    const indent = lines[n - 1].match(/^(\s*)/)[1];
    lines[n - 1] = indent + p.to;
  }
  writeFileSync(file, lines.join('\n'));
  console.log('applied', plan.size, 'signature changes');
}
