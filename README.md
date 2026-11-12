# MathForge 数学计算工作台

面向数学学习与竞赛备考的纯前端工作台。公式速查、科学计算、符号代数、2D/3D 绘图、刷题、错题复习、知识图谱，全部在一个 SPA 里。

![数学键盘](docs/assets/math-keyboard.png)

## 特性

- **精确符号输出**：KaTeX 渲染，默认给精确形式，不主动给小数近似
- **完整学习闭环**：错题本、错因标签、艾宾浩斯复习、学习报告、热力图
- **课程化内容**：647 个考点、64 个课程包、313 章、733 个知识点挂载
- **可验证题目**：881 条 sympy 断言、参数化生成器、双解一致性校验
- **多端可用**：响应式 Web、Electron 桌面端、Android APK（离线可用）
- **双皮肤**：夜航（深色）/ 草稿纸（浅色），支持 light / dark / system

## 技术栈

React 19 · Vite 8 · TypeScript 5.9 · Tailwind CSS 4 · KaTeX · math.js · Plotly · ECharts · Radix UI · react-router-dom 7

后端是本地 Node 服务（`server/`），只负责 AI 出题、讲解草稿、题目池与审核；不登录、不云同步，学习数据存在浏览器 localStorage。

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`（见 `.nvmrc`，推荐 `nvm use`）
- Python 3.10+，完整质量关需要 `sympy` 与 `numpy`
- 无图形环境跑质量关时设 `SKIP_UI_SNAP=1`

## 快速开始

```bash
npm install
npm run dev          # 前端 http://localhost:5173
npm run server       # 本地后端 http://127.0.0.1:8787
npm run dev:full     # 同时启动前端和后端
```

AI 功能需要模型配置：复制 `.env.example` 为 `.env`，填入任意 OpenAI 风格接口的 `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL`。不配置也能用计算、绘图、题库和课程。

## 质量关

```bash
npm run check
```

一次跑 10 项：类型检查、ESLint、生产构建、sympy 公式断言、生成器复核、KaTeX 渲染、文本规范、交叉引用、服务端测试、UI 快照、文档数字。任何一项失败都不应提交；`npm install` 会自动把 git hooks 指向 `.githooks/`，提交前强制执行。

单独运行：

```bash
npm run typecheck
npm run lint
npm run build
npm run test:server
npm run docs:check
```

## 目录

```text
src/            React 页面、组件、hooks、数据层
server/         本地 Node 后端（AI 出题 / 审核 / 题目池）
shared/         前后端共享类型
scripts/        质量检查、内容生成、构建与备份脚本
docs/           维护者文档（质量关、课程模型、覆盖表）
android-native/ 安卓壳工程
electron/       桌面端主进程
```

## 构建

```bash
npm run build          # Web 静态产物 dist/
npm run app:build      # Electron 桌面端（macOS）
npm run build:android  # Android APK
```

## 文档

- [质量关](docs/quality-gates.md)：提交前必须过哪几道关
- [课程模型](docs/course-plan.md)：六件套结构与数据模型
- [学科覆盖](docs/coverage.md)：62 个数学分支的覆盖状态
- [公式规范](docs/notation.md)：LaTeX 书写与检查规则
- [后端说明](docs/backend.md)：AI 出题、审核、题目池与桌面打包

## License

[MIT](LICENSE)
