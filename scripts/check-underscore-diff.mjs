import { readFileSync } from 'node:fs';
const file = 'src/data/problem-generators.ts';
const lines = readFileSync(file, 'utf8').split('\n');
const sig = lines.map((l, i) => /^\s*generate\(/.test(l) ? i : -1).filter(i => i >= 0);
for (const n of [7807,11797,13334,13439]) {
  const t = n - 1;
  const next = sig.find(s => s > t);
  console.log(`=== ${n} ===`);
  for (let i = t; i < next; i++) if (/\bdiff\b/.test(lines[i])) console.log(`  ${i+1}: ${lines[i].trim()}`);
}
