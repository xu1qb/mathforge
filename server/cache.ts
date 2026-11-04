// EXPORTS: cacheKey, readCache, writeCache
// 文件缓存：同一个请求不重复花钱；键是参数 + 模型的 hash

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from './config.ts';

export function cacheKey(parts: unknown): string {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0, 32);
}

function pathOf(key: string): string {
  return join(config.cacheDir, key + '.json');
}

export function readCache<T>(key: string): T | null {
  const p = pathOf(key);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as T;
  } catch {
    return null;
  }
}

export function writeCache(key: string, value: unknown): void {
  mkdirSync(config.cacheDir, { recursive: true });
  writeFileSync(pathOf(key), JSON.stringify(value, null, 2), 'utf8');
}
