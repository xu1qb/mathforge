// EXPORTS: (script)
// 批量预生成：按知识点列表逐个补题，串行执行，每个知识点补完再下一个
//
// 用法：npm run ai:fill:batch -- --target=5
//       npm run ai:fill:batch -- --topics=极限计算,函数求导 --target=3

const args = new Map(
  process.argv.slice(2).flatMap((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [[m[1], m[2] ?? 'true']] : [];
  }),
);

const BASE = process.env.MF_API || 'http://127.0.0.1:8787/api';
const target = Number(args.get('target') ?? 5);
const difficulty = (args.get('difficulty') ?? 'basic');
const DEFAULT_TOPICS = [
  '一元二次方程', '因式分解', '极限计算', '函数求导',
  '不定积分', '平面几何', '古典概型', '矩阵运算',
];
const topics = (args.get('topics') ?? DEFAULT_TOPICS.join(',')).split(',').map((t) => t.trim()).filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const health = await fetch(BASE + '/health').then((r) => r.json()).catch(() => null);
  if (!health) {
    console.error('后端没起：先运行 npm run server');
    process.exit(2);
  }
  if (health.mode !== 'live') {
    console.error('mock 模式无法预生成，请先配置 LLM_API_KEY');
    process.exit(2);
  }

  let ok = 0;
  let failed = 0;
  const started = Date.now();

  for (const [i, topic] of topics.entries()) {
    const before = await fetch(BASE + '/ai/pool/status?topic=' + encodeURIComponent(topic)).then((r) => r.json());
    console.log('[' + (i + 1) + '/' + topics.length + '] ' + topic + ' ' + difficulty + '（已有 ' + before.total + ' 题）');
    if (before.total >= target) {
      console.log('  已达标，跳过');
      continue;
    }
    const res = await fetch(BASE + '/ai/pool/fill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, difficulty, target }),
    }).then((r) => r.json());
    if (!res.job) {
      console.log('  启动失败，跳过');
      failed++;
      continue;
    }
    for (let k = 0; k < 200; k++) {
      await sleep(3000);
      const { job } = await fetch(BASE + '/ai/pool/job?id=' + res.job.id).then((r) => r.json());
      if (!job.running) {
        if (job.filled > 0) {
          ok += job.filled;
          console.log('  完成：+' + job.filled + ' 题（尝试 ' + job.attempts + ' 次）');
        } else {
          failed++;
          console.log('  没产出：' + (job.error ?? '未知原因'));
        }
        break;
      }
    }
  }

  const mins = ((Date.now() - started) / 60000).toFixed(1);
  console.log('\n全部结束：新增 ' + ok + ' 题，失败 ' + failed + ' 个知识点，耗时 ' + mins + ' 分钟');
};

main().catch((e) => {
  console.error('批量补题失败:', e.message);
  process.exit(1);
});
