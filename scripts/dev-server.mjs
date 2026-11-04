import { createServer } from 'vite';
const server = await createServer({
  root: process.cwd(),
  configFile: './vite.config.ts',
  cacheDir: '/tmp/mf-vite-cache',
  server: { port: 5173, strictPort: true },
});
await server.listen();
console.log('vite ready on 5173');
