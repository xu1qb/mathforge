// EXPORTS: (script)
// AI 题库抽检：随机取样打印，配合人工独立推演；发现问题用 --reject=id 下架

const args = new Map(
  process.argv.slice(2).flatMap((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [[m[1], m[2] ?? 'true']] : [];
  }),
);

const BASE = process.env.MF_API || 'http://127.0.0.1:8787/api';
const n = Number(args.get('n') ?? 10);
const rejectId = args.get('reject');

const main = async () => {
  if (rejectId) {
    const res = await fetch(BASE + '/ai/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rejectId, action: 'reject', note: '抽检发现答案错误' }),
    }).then((r) => r.json());
    console.log('已下架:', res.question?.topic, '→', res.question?.status);
    return;
  }

  const data = await fetch(BASE + '/ai/queue?status=approved').then((r) => r.json());
  const pool = data.questions;
  if (!pool.length) {
    console.log('池子是空的');
    return;
  }
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

  for (const [i, q] of picked.entries()) {
    console.log('');
    console.log((i + 1) + '. 【' + q.topic + ' / ' + q.difficulty + '】 id=' + q.id);
    console.log('   题: ' + q.question.replace(/\n/g, ' ').slice(0, 200));
    console.log('   答: ' + q.answer.slice(0, 120));
    console.log('   校验: ' + (q.validation?.dualSolve ?? '?') + ' / ' + (q.validation?.method ?? ''));
  }
  console.log('');
  console.log('共 ' + picked.length + ' 道。发现问题用 --reject=<id> 下架。');
};

main().catch((e) => {
  console.error('抽检失败:', e.message);
  process.exit(1);
});
