import { readFileSync, readdirSync } from 'node:fs';

const v2 = readFileSync(new URL('../src/lib/practice-v2.ts', import.meta.url), 'utf8');
const topics = new Set([...v2.matchAll(/topic: '([a-z-]+)'/g)].map((m) => m[1]));
console.log('知识点（去重）:', topics.size);
console.log('生成器分支:', (v2.match(/topic: '/g) || []).length);

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
console.log('路由:', new Set([...app.matchAll(/path="(\/[a-z0-9/:-]*)"/g)].map((m) => m[1])).size);

const courses = readdirSync(new URL('../src/data/courses', import.meta.url)).filter((f) => f.endsWith('.ts'));
console.log('课程文件:', courses.length);

for (const url of ['http://127.0.0.1:8787/api/health', 'http://127.0.0.1:8799/api/health']) {
  try {
    const h = await fetch(url).then((r) => r.json());
    console.log('后端', url, '→', h.mode);
    const q = await fetch(url.replace('/health', '/ai/queue')).then((r) => r.json());
    console.log('  题库:', q.questions.length, '条');
    break;
  } catch {}
}
