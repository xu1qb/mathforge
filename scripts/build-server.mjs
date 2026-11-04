// 把 server/ 打成单文件 ESM，供 Electron 内置启动
import { build } from 'esbuild';
import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('server-dist', { recursive: true });
await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: 'server-dist/index.mjs',
  // katex 一并打包，避免运行时解析 node_modules
  external: [],
  logLevel: 'warning',
});
copyFileSync('server/verify.py', 'server-dist/verify.py');
console.log('server-dist/index.mjs + verify.py 已生成');
