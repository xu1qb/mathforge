// EXPORTS: (script)
// 异构复核：用第二模型（LLM_VERIFY_MODEL）重解一遍已入库的题，和答案比对
// npm run ai:crosscheck -- --n=15
// npm run ai:crosscheck -- --n=15 --reject   # 把不一致的自动下架

import { config, hasVerifyModel } from '../server/config.ts';
import { independentSolve } from '../server/solve.ts';
import { answersEquivalent } from '../server/verify.ts';
import { listQueue, reviewQuestion } from '../server/store.ts';

const args = new Map(
  process.argv.slice(2).flatMap((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [[m[1], m[2] ?? 'true']] : [];
  }),
);

const n = Number(args.get('n') ?? 10);
const autoReject = args.has('reject');

if (!hasVerifyModel()) {
  console.error('未配置第二模型（LLM_VERIFY_*），复核会退化成同模型自校验，没有意义');
  process.exit(2);
}

const pool = listQueue('approved');
if (!pool.length) {
  console.log('池子是空的');
  process.exit(0);
}

// 按知识点分散抽样
const picked = [];
const seen = new Set();
for (const q of pool) {
  if (seen.has(q.topic)) continue;
  seen.add(q.topic);
  picked.push(q);
  if (picked.length >= n) break;
}
while (picked.length < n && picked.length < pool.length) {
  const q = pool[Math.floor(Math.random() * pool.length)];
  if (!picked.includes(q)) picked.push(q);
}

console.log('复核模型:', config.verifyModel, '| 样本:', picked.length, '道');

let ok = 0;
let bad = 0;
const problems = [];

for (const [i, q] of picked.entries()) {
  const tag = '[' + (i + 1) + '/' + picked.length + '] ' + q.topic;
  try {
    const second = await independentSolve(q.questionLatex);
    if (!second) {
      console.log(tag, '→ 复核未返回结果，跳过');
      continue;
    }
    const eq = await answersEquivalent(q.answer, second.answer);
    if (eq.equal) {
      ok++;
      console.log(tag, '→ 一致');
    } else {
      bad++;
      problems.push({ q, second });
      console.log(tag, '→ 不一致');
      console.log('    题库答案:', q.answer.slice(0, 80));
      console.log('    复核答案:', second.answer.slice(0, 80));
      if (autoReject) {
        reviewQuestion(q.id, 'reject', '异构复核不一致：' + second.answer.slice(0, 60));
        console.log('    已下架');
      }
    }
  } catch (e) {
    console.log(tag, '→ 复核出错:', String(e).slice(0, 80));
  }
}

console.log('');
console.log('复核结果：一致 ' + ok + ' 道，不一致 ' + bad + ' 道，不一致率 ' + (picked.length ? Math.round((bad / picked.length) * 100) : 0) + '%');
if (bad && !autoReject) console.log('加 --reject 可把不一致的自动下架');
