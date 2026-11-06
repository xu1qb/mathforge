import { createServer } from 'vite';
const server = await createServer({
  root: process.cwd(),
  configFile: './vite.config.ts',
  cacheDir: '/tmp/mf-vite-cache',
  // 绑定 127.0.0.1：macOS 上默认只监听 [::1]，会让只解析 IPv4 的 curl/Node fetch 连不上
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
});
await server.listen();
console.log('vite ready on 5173');
