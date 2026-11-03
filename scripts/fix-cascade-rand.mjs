import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/data/problem-generators.ts';
const lines = readFileSync(file, 'utf8').split('\n');

const keepDiff = [1171,1474,4836,4896,5167,5572,9012,9922,11245]; // generate(rand, diff) -> generate(_rand, diff)
const noDiffSingle = [2649,4770];                                  // generate(rand) -> generate()
const bothUnderscore = [7076,7807,8161,8537,8796,9166,11797,12363,13334,13439,13504,14183,15341]; // -> generate()

const plan = new Map();
for (const n of keepDiff) plan.set(n, { from: 'generate(rand, diff) {', to: 'generate(_rand, diff) {' });
for (const n of noDiffSingle) plan.set(n, { from: 'generate(rand) {', to: 'generate() {' });
for (const n of bothUnderscore) plan.set(n, { from: 'generate(rand, _diff) {', to: 'generate() {' });

let mismatch = 0;
for (const [n, p] of plan) {
  const raw = lines[n - 1];
  if (raw.trim() !== p.from) { console.log(`MISMATCH ${n}: got ${raw.trim()} want ${p.from}`); mismatch++; }
}
console.log('mismatch =', mismatch, 'total =', plan.size);
if (process.argv.includes('--apply') && mismatch === 0) {
  for (const [n, p] of plan) {
    const indent = lines[n - 1].match(/^(\s*)/)[1];
    lines[n - 1] = indent + p.to;
  }
  writeFileSync(file, lines.join('\n'));
  console.log('applied', plan.size);
}
