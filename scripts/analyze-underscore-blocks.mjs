import { readFileSync } from 'node:fs';
const file = 'src/data/problem-generators.ts';
const lines = readFileSync(file, 'utf8').split('\n');

// 所有 generate 签名行
const sig = [];
lines.forEach((l, i) => { if (/^\s*generate\(/.test(l)) sig.push(i); });

const targets = [9286,9427,10208,10630,10710,10956,12486,12625].map(n => n - 1);
for (const t of targets) {
  const next = sig.find(s => s > t);
  const body = lines.slice(t + 1, next).join('\n');
  const randUse = (body.match(/\brand\b/g) || []).length;
  const diffUse = (body.match(/\bdiff\b/g) || []).length;
  console.log(`line ${t+1}: rand=${randUse} diff=${diffUse} | ${lines[t].trim()}`);
}
