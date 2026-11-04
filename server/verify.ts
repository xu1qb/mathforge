// EXPORTS: answersEquivalent, verifyAvailable
// 答案等价判定：交给 sympy（Python 子进程）；没有 Python 时退化为字符串比较

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from './config.ts';

const cache = new Map<string, { equal: boolean; method: string }>();

function pythonPath(): string {
  if (config.pythonPath) return config.pythonPath;
  const guess = resolve(process.cwd(), '..', '.tooling', 'py');
  return existsSync(guess) ? guess : '';
}

export function verifyAvailable(): boolean {
  const p = pythonPath();
  return p ? existsSync(p) : true;
}

export function answersEquivalent(a: string, b: string): Promise<{ equal: boolean; method: string }> {
  const key = a + '\u0000' + b;
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);

  const payload = JSON.stringify({ a, b });
  const env = { ...process.env };
  const pp = pythonPath();
  if (pp) env.PYTHONPATH = pp;

  return new Promise((resolvePromise) => {
    const child = spawn('python3', [resolve(process.cwd(), 'server', 'verify.py')], { env });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
    }, 15000);
    child.stdout.on('data', (c) => { out += String(c); });
    child.stderr.on('data', (c) => { err += String(c); });
    child.on('error', () => {
      clearTimeout(timer);
      resolvePromise({ equal: false, method: 'spawn-error' });
    });
    child.on('close', () => {
      clearTimeout(timer);
      try {
        const parsed = JSON.parse(out.trim()) as { equal?: boolean; method?: string; error?: string };
        const result = { equal: Boolean(parsed.equal), method: parsed.method ?? (parsed.error ? 'error' : 'unknown') };
        cache.set(key, result);
        resolvePromise(result);
      } catch {
        resolvePromise({ equal: false, method: 'parse-fail' + (err ? ': ' + err.slice(0, 80) : '') });
      }
    });
    child.stdin.write(payload);
    child.stdin.end();
  });
}
