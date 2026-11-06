// 把 server/ 打成单文件 ESM，供 Electron 内置启动
import { build } from 'esbuild';
import { copyFileSync, cpSync, mkdirSync } from 'node:fs';

mkdirSync('server-dist', { recursive: true });
await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: 'server-dist/index.mjs',
  // katex 一并打包；SQLite 是 WASM 包（自带 .wasm 与 __dirname 解析），
  // 打进单文件会破坏 wasm 定位，所以外置并整包复制到 server-dist/node_modules。
  external: ['node-sqlite3-wasm'],
  logLevel: 'warning',
});
copyFileSync('server/verify.py', 'server-dist/verify.py');
cpSync('node_modules/node-sqlite3-wasm', 'server-dist/node_modules/node-sqlite3-wasm', { recursive: true });
console.log('server-dist/index.mjs + verify.py + node-sqlite3-wasm 已生成');
