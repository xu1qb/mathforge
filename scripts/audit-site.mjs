// 全站体检：批量打开每条路由，检查横向溢出、重复 h1、固定浮层相交、控制台报错
// 前置：
//   1) dev server 跑在 5173：npm run dev
//   2) 无头 Chrome 起在 9222：
//      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
//        --headless --no-sandbox --disable-gpu --disable-breakpad \
//        --user-data-dir=/tmp/mf-chrome --remote-debugging-port=9222 about:blank &
//   3) node scripts/audit-site.mjs
//
// 可选环境变量：
//   AUDIT_ROUTES=/competition,/practice   只查指定路由
//   AUDIT_WIDTHS=375                      只查指定宽度（默认 375,1440）
//   AUDIT_SHOTS=/tmp/mf-shots             截图与 audit.json 的输出目录
//   AUDIT_BASE / AUDIT_CDP                改端口时用

import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.AUDIT_BASE || 'http://127.0.0.1:5173';
const CDP = process.env.AUDIT_CDP || 'http://127.0.0.1:9222';
const WIDTHS = (process.env.AUDIT_WIDTHS || '375,1440').split(',').map(Number);
const SHOT_DIR = process.env.AUDIT_SHOTS || '/tmp/mf-shots';
const WAIT = Number(process.env.AUDIT_WAIT || 1900);

// 从 app.tsx 里抽路由，避免手工维护两份清单
const appSrc = fs.readFileSync(path.join(process.cwd(), 'src/app.tsx'), 'utf8');
const allRoutes = [...new Set([...appSrc.matchAll(/path="([^"]+)"/g)].map((m) => m[1]))]
  .filter((p) => p !== '*')
  .map((p) => (p.startsWith('/') ? p : '/' + p));
const ROUTES = process.env.AUDIT_ROUTES ? process.env.AUDIT_ROUTES.split(',') : allRoutes;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const list = await (await fetch(CDP + '/json/list')).json();
const target = list.find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let seq = 0;
const pending = new Map();
let errors = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    errors.push(((d.exception && d.exception.description) || d.text || '').split('\n')[0].slice(0, 120));
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    const t = (m.params.args || []).map((a) => a.value || a.description || '').join(' ').slice(0, 120);
    if (t && !t.includes('React DevTools')) errors.push(t);
  }
});
await new Promise((r) => ws.addEventListener('open', r));
const send = (method, params = {}) => new Promise((res) => {
  const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params }));
});
await send('Page.enable');
await send('Runtime.enable');

const PROBE = [
  '(() => {',
  '  const vw = window.innerWidth;',
  '  const sw = document.documentElement.scrollWidth;',
  '  const h1s = [...document.querySelectorAll("h1")].map(e => e.textContent.trim().slice(0, 18));',
  '  const fixed = [...document.querySelectorAll("body *")].filter(e => {',
  '    const s = getComputedStyle(e);',
  '    if (s.position !== "fixed" || s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;',
  '    const r = e.getBoundingClientRect();',
  '    return r.width > 18 && r.height > 18 && r.bottom > 0 && r.top < window.innerHeight;',
  '  }).map(e => { const r = e.getBoundingClientRect(); return { cls: String(e.className).slice(0, 34), l: Math.round(r.left), t: Math.round(r.top), r2: Math.round(r.right), b: Math.round(r.bottom) }; });',
  '  const overlaps = [];',
  '  for (let i = 0; i < fixed.length; i++) for (let j = i + 1; j < fixed.length; j++) {',
  '    const a = fixed[i], b = fixed[j];',
  '    const w = Math.min(a.r2, b.r2) - Math.max(a.l, b.l);',
  '    const h = Math.min(a.b, b.b) - Math.max(a.t, b.t);',
  '    if (w > 6 && h > 6) overlaps.push([a.cls, b.cls]);',
  '  }',
  '  return JSON.stringify({ vw, sw, h1s, overlaps: overlaps.slice(0, 3) });',
  '})()',
].join('\n');

fs.mkdirSync(SHOT_DIR, { recursive: true });
const out = [];
for (const width of WIDTHS) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  for (const route of ROUTES) {
    errors = [];
    await send('Page.navigate', { url: BASE + '/#' + route });
    await sleep(WAIT);
    const res = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true, awaitPromise: true });
    let d = {};
    try { d = JSON.parse(res.result.result.value); } catch { d = {}; }
    const rec = {
      w: width, route,
      sw: d.sw, vw: d.vw,
      overflow: (d.sw || 0) > (d.vw || 0) + 1,
      h1: d.h1s || [],
      overlaps: d.overlaps || [],
      errors: errors.slice(0, 2),
    };
    out.push(rec);
    if (rec.overflow || rec.h1.length > 1 || rec.overlaps.length || rec.errors.length) {
      const cap = await send('Page.captureScreenshot', { format: 'png' });
      const name = path.join(SHOT_DIR, 'audit-' + width + '-' + (route === '/' ? 'home' : route.slice(1)) + '.png');
      fs.writeFileSync(name, Buffer.from(cap.result.data, 'base64'));
    }
    const flags = [];
    if (rec.overflow) flags.push('OVERFLOW(' + rec.sw + '>' + rec.vw + ')');
    if (rec.h1.length > 1) flags.push('DUP-H1(' + rec.h1.length + ')');
    if (rec.overlaps.length) flags.push('FIXED-OVERLAP');
    if (rec.errors.length) flags.push('ERR:' + rec.errors[0]);
    if (flags.length) console.log(width + 'px ' + route + '  ' + flags.join(' | '));
  }
}
fs.writeFileSync(path.join(SHOT_DIR, 'audit.json'), JSON.stringify(out, null, 1));
console.log('DONE checks=' + out.length + ' routes=' + ROUTES.length + ' widths=' + WIDTHS.join('/'));
ws.close();
