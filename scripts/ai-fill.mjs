// EXPORTS: (script)
// 给某个知识点预生成 AI 题，跑完自动入库（严格档验证通过才算数）
//
// 用法：npm run ai:fill -- --topic=极限计算 --count=10 --difficulty=basic
// 注意：需要后端在跑（npm run server）且配置了 LLM_API_KEY

const args = new Map(
  process.argv.slice(2).flatMap((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [[m[1], m[2] ?? 'true']] : [];
  }),
);

const BASE = process.env.MF_API || 'http://127.0.0.1:8787/api';
const topic = args.get('topic');
const count = Number(args.get('count') ?? 10);
const difficulty = args.get('difficulty') ?? 'basic';

if (!topic) {
  console.error('用法：npm run ai:fill -- --topic=极限计算 [--count=10] [--difficulty=basic]');
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const health = await fetch(BASE + '/health').then((r) => r.json()).catch(() => null);
  if (!health) {
    console.error('后端没起：先运行 npm run server');
    process.exit(2);
  }
  console.log('后端模式:', health.mode);
  if (health.mode !== 'live') {
    console.error('mock 模式无法预生成，请在「桌面端/移动端配置」里填 API Key');
    process.exit(2);
  }

  const before = await fetch(BASE + '/ai/pool/status?topic=' + encodeURIComponent(topic)).then((r) => r.json());
  console.log('当前题库:', before.total, '道；本次目标:', count, '道');

  const res = await fetch(BASE + '/ai/pool/fill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, difficulty, target: count }),
  }).then((r) => r.json());

  if (!res.job) {
    console.error('启动失败:', JSON.stringify(res).slice(0, 200));
    process.exit(1);
  }

  let last = -1;
  for (;;) {
    await sleep(1500);
    const { job } = await fetch(BASE + '/ai/pool/job?id=' + res.job.id).then((r) => r.json());
    if (job.filled !== last) {
      last = job.filled;
      console.log('  已生成', job.filled, '/', job.target, '（尝试', job.attempts, '次，失败', job.failures, '）');
    }
    if (!job.running) {
      if (job.error) console.log('结束原因:', job.error);
      const after = await fetch(BASE + '/ai/pool/status?topic=' + encodeURIComponent(topic)).then((r) => r.json());
      console.log('完成。题库现有', after.total, '道');
      process.exit(job.filled > 0 ? 0 : 1);
    }
  }
};

main().catch((e) => {
  console.error('失败:', e.message);
  process.exit(1);
});
