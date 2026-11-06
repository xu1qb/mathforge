// EXPORTS: (script)
// UI 快照回归：抓关键页面截图 + 异常检测 + 与基线对比
//
// 用法：
//   npm run ui:snap                  抓全部关键页（1440 / 390 两档）
//   npm run ui:snap -- --routes=/practice,/progress
//   npm run ui:snap -- --update      把本次结果写为基线
//
// 产物：artifacts/ui/<时间戳>/*.png + report.json；基线 artifacts/ui/baseline.json

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const args = new Map(
  process.argv.slice(2).flatMap((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [[m[1], m[2] ?? 'true']] : [];
  }),
);

const BASE = process.env.SNAP_BASE || 'http://localhost:5173';
const CDP = process.env.SNAP_CDP || 'http://127.0.0.1:9222';
const ROUTES = (args.get('routes') ?? '/,/practice,/wrong-book,/progress,/ai-lab')
  .split(',')
  .map((r) => (r.startsWith('/') ? r : '/' + r));
const WIDTHS = [1440, 390];
const WAIT = Number(args.get('wait') ?? 2200);
const OUT_ROOT = path.resolve('artifacts/ui');
const UPDATE = args.has('update');
// 首页/练习页每次打开都会随机出题或显示倒计时，截图天然不同，只做结构检查不参与哈希比对
const DYNAMIC_ROUTES = new Set(['/', '/practice']);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);

async function ensureDevServer() {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(1500) });
    if (res.ok) return { started: false };
  } catch {}
  const child = spawn('node', ['scripts/dev-server.mjs'], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      const res = await fetch(BASE, { signal: AbortSignal.timeout(1200) });
      if (res.ok) return { started: true, child };
    } catch {}
  }
  throw new Error('dev server 起不来：' + BASE);
}

async function ensureChrome() {
  try {
    const list = await (await fetch(CDP + '/json/list', { signal: AbortSignal.timeout(1200) })).json();
    if (list.length) return { started: false, page: list.find((t) => t.type === 'page') ?? list[0] };
  } catch {}
  const dir = '/tmp/mf-snap-chrome-' + Date.now();
  const child = spawn(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox', '--disable-breakpad',
    '--disable-crash-reporter', '--no-first-run',
    '--user-data-dir=' + dir, '--remote-debugging-port=9222', 'about:blank',
  ], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const list = await (await fetch(CDP + '/json/list', { signal: AbortSignal.timeout(1200) })).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return { started: true, child, page };
    } catch {}
  }
  throw new Error('无头 Chrome 起不来');
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let seq = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params?.exceptionDetails?.text ?? 'exception');
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
    }
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const ready = new Promise((r) => ws.addEventListener('open', r));
  const send = (method, params = {}) =>
    new Promise((res) => {
      const id = ++seq;
      pending.set(id, res);
      ws.send(JSON.stringify({ id, method, params }));
    });
  return { ws, send, ready, errors };
}

const main = async () => {
  const dev = await ensureDevServer();
  const chrome = await ensureChrome();
  const { send, ready, errors } = connect(chrome.page.webSocketDebuggerUrl);
  await ready;
  await send('Page.enable');
  await send('Runtime.enable');

  // 预热：首次访问要等 Vite 编译，避免把「还在编译」误判成空白页
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: BASE + '/?warm=1#' });
  await sleep(Math.max(WAIT, 2500));

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(OUT_ROOT, stamp);
  fs.mkdirSync(outDir, { recursive: true });

  const baselinePath = path.join(OUT_ROOT, 'baseline.json');
  const baselineExisted = fs.existsSync(baselinePath);
  const baseline = baselineExisted ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')) : {};
  const nextBaseline = {};
  const report = { base: BASE, startedDevServer: dev.started, startedChrome: chrome.started, shots: [] };

  for (const width of WIDTHS) {
    for (const route of ROUTES) {
      errors.length = 0;
      await send('Emulation.setDeviceMetricsOverride', {
        width, height: 900, deviceScaleFactor: 1, mobile: width < 600,
      });
      await send('Page.navigate', { url: BASE + '/?t=' + Date.now() + '#' + route });
      await sleep(WAIT);

      const readInfo = async () =>
        JSON.parse(
          (
            await send('Runtime.evaluate', {
              expression:
                'JSON.stringify({ text: document.body.innerText.length, sw: document.documentElement.scrollWidth, vw: window.innerWidth })',
              returnByValue: true,
            })
          ).result?.result?.value ?? '{}',
        );

      let info = await readInfo();
      // 轮询等待首屏渲染完成：内容变多后首次渲染可能慢于固定等待，
      // 这里等到正文超过 80 字符（或 8 秒超时）再判空白。
      for (let i = 0; i < 32 && (info.text ?? 0) < 80; i++) {
        await sleep(250);
        info = await readInfo();
      }
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      const buf = Buffer.from(shot.result.data, 'base64');
      const key = route.replace(/\//g, '_') + '@' + width;
      const file = path.join(outDir, key + '.png');
      fs.writeFileSync(file, buf);

      const hash = sha(buf);
      const dynamic = DYNAMIC_ROUTES.has(route.split('?')[0]);
      if (!dynamic) nextBaseline[key] = hash;
      const prev = baseline[key];
      const changed = dynamic ? null : prev ? prev !== hash : null;

      report.shots.push({
        route, width, file,
        hash, previous: prev ?? null, changed,
        blank: (info.text ?? 0) < 30,
        overflow: (info.sw ?? 0) > (info.vw ?? 0) + 1,
        consoleErrors: [...new Set(errors)].slice(0, 5),
      });
    }
  }

  const problems = report.shots.filter((s) => s.blank || s.overflow || s.consoleErrors.length);
  const changed = report.shots.filter((s) => s.changed === true);
  report.problems = problems;
  report.changed = changed.map((s) => s.route + '@' + s.width);

  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

  // 只保留最近 5 次，避免产物堆积
  try {
    const runs = fs.readdirSync(OUT_ROOT).filter((d) => /^\d{4}-/.test(d)).sort();
    for (const old of runs.slice(0, Math.max(0, runs.length - 5))) {
      fs.rmSync(path.join(OUT_ROOT, old), { recursive: true, force: true });
    }
  } catch {
    // 删除失败不影响结果
  }
  if (UPDATE || !baselineExisted) {
    fs.writeFileSync(baselinePath, JSON.stringify(nextBaseline, null, 2));
  }

  console.log('截图目录:', outDir);
  console.log('页面:', report.shots.length, '张（' + WIDTHS.join(' / ') + '）');
  const comparable = report.shots.filter((s) => s.changed !== null);
  if (!baselineExisted || UPDATE) console.log('基线已更新（下次运行开始比对）');
  else if (changed.length) console.log('与基线不同:', changed.map((s) => s.route + '@' + s.width).join(', '));
  else if (comparable.length === 0) console.log('本次全部是动态页，跳过哈希比对');
  else console.log('与基线一致');

  if (problems.length) {
    console.log('发现问题:');
    for (const p of problems) {
      const why = [
        p.blank ? '空白页' : '',
        p.overflow ? '横向溢出' : '',
        p.consoleErrors.length ? '控制台报错: ' + p.consoleErrors.join(' | ') : '',
      ].filter(Boolean).join('；');
      console.log('  ✗', p.route + '@' + p.width, '→', why);
    }
  }

  if (dev.started) dev.child.kill();
  if (chrome.started) chrome.child.kill();
  process.exit(problems.length ? 1 : 0);
};

main().catch((e) => {
  console.error('快照失败:', e.message);
  process.exit(2);
});
