import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'MathForge 数学计算工作台',
        short_name: 'MathForge',
        description: '公式速查、科学计算、符号代数、2D/3D 绘图、刷题与错题复习。',
        lang: 'zh-CN',
        theme_color: '#0b0f19',
        background_color: '#0b0f19',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        icons: [
          { src: './icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: './icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,ttf}'],
        globIgnores: ['**/icon-1024.png'],
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  base: './',
  // 开发期把 /api 转发到本地后端（server/index.ts）
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
  // plotly.js 按需源码包的 WebGL 内核在浏览器里裸用 Node 全局 global，
  // 统一映射到 globalThis（浏览器即 window），避免 ReferenceError: Can't find variable: global
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'shared'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          // React 运行时与路由
          if (/[\\/]node_modules[\\/](react|react-dom|react-router-dom|react-router|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          // 公式排版：几乎每个页面都要（MathRenderer），必须是独立小 chunk
          if (/[\\/]node_modules[\\/]katex[\\/]/.test(id)) {
            return 'vendor-katex';
          }
          // 数学引擎：只有计算器/求导/积分这类页面需要，绝不能和 katex 混在一起，
          // 否则首屏为了 katex 会把 1.5MB 的 mathjs 一起拉下来
          if (/[\\/]node_modules[\\/]mathjs[\\/]/.test(id)) {
            return 'vendor-mathjs';
          }
          // 动画库
          if (/[\\/]node_modules[\\/]framer-motion[\\/]/.test(id)) {
            return 'vendor-animation';
          }
          // 日期工具
          if (/[\\/]node_modules[\\/]date-fns[\\/]/.test(id)) {
            return 'vendor-date';
          }
          // 其余通用 UI 基础库（radix、图标、表单、组件原语）
          if (/[\\/]node_modules[\\/](@radix-ui|lucide-react|sonner|class-variance-authority|clsx|tailwind-merge|react-hook-form|@hookform|zod|cmdk|embla-carousel-react|react-day-picker|react-resizable-panels|vaul|input-otp)[\\/]/.test(id)) {
            return 'vendor-ui';
          }
          return undefined;
        },
      },
    },
  },
})
