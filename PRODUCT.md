# Product

<!-- impeccable:product-schema 1 -->

## Platform

web（响应式，手机和电脑同等重要，都要完整体验）

## Stack

React 19 + Vite 8 + TypeScript 5.9 + Tailwind CSS 4 + KaTeX 0.19 + math.js 15.2 + Plotly 4.1 + ECharts 6.1 + Radix UI + react-router-dom 7 + framer-motion/GSAP。纯前端 SPA，当前数据存浏览器 localStorage。

## Users

主用户：备赛全国大学生数学竞赛（非数学类 A 类）的理工科大学生，尤其是像徐秋博这样大二、同步在学高数/线代/概率的学生。
使用场景：手机碎片时间刷题/看公式/对答案；电脑整块时间做微积分推导、2D/3D 绘图、长时段练习。两边都重，不是移动端附属。

## Product Purpose

MathForge 是数学学习工作台，为 2026-11-14 全国大学生数学竞赛（非数学 A 类）备考服务。从公式速查、科学计算、符号代数、绘图，到刷题、错因诊断、遗忘曲线排期、知识点可视化，一站式。成功标准：用户靠这个产品在竞赛中拿奖。

## Positioning

和 Wolfram Alpha / GeoGebra / Mathway / 搜题 App 比，MathForge 三个都要、缺一不可：
1. **竞赛备考闭环**：按数竞考纲组织知识点，错题自动归类，按艾宾浩斯曲线排期重做，仪表盘暴露薄弱模块——不是通用计算器，也不是散题库。
2. **精确符号输出**：卡西欧式 √/竖排分数/π/∞/∫，拒绝小数近似，推导不跳步。
3. **游戏化坚持**：GitHub 式热力图、知识大陆点亮、盲盒图鉴、公式咒语称号，让学生愿意每天打开。

## Operating Context

- 手机竖屏碎片刷题；电脑宽屏长时段推导和绘图
- 首页有竞赛倒计时 D-day，按考试日期倒排每日计划
- 当前数据 localStorage 本地缓存 + Supabase 云端同步；登录后自动同步，未登录不可用
- 开发命令：`npm run dev` / `npm run build` / `npm run typecheck` / `npm run lint`
- 源码在 GitHub 公开维护：https://github.com/xu1qb/mathforge；本地副本在 `/Users/xuqiubo/dev/mathforge-source`，要求代码公开、随时可导出、本地能跑

## Capabilities and Constraints

- 44 个页面目录（46 条路由）：首页、公式手册、科学计算器、符号代数、微积分、线代、概率统计、数论、2D/3D 绘图、多元微积分、ODE、数值分析、傅里叶级数、复变、离散数学、现代数学、PDE、微分几何、竞赛专区（20+ 子面板）、刷题（错题本/统计/挑战模式）、知识图谱、工具箱、拍照解题、盲盒图鉴、公式咒语、数学家测试
- **硬 UI 规范**：全站 KaTeX 公式渲染（行内 $...$、块 $$...$$，不得出现裸 LaTeX 源码）；深浅双主题（light/dark/system）；卡片圆角 12px；间距 16px；主内容居中排版；禁用紫/靛色渐变
- **两套皮肤**：夜航（深色琥珀）/ 草稿纸（米色手账）；旧像素/手账皮肤已迁移，新皮肤通过 CSS 变量 token 扩展
- **账号体系**：Supabase 邮箱 + 密码登录；每个账号一份学习数据快照，登录自动同步，退出登录清本机缓存
- 已实现功能：苏格拉底分层提示、错因标签（计算失误/概念不清/方法不会/审题错）、艾宾浩斯 1/3/7/15 天重做、母题派生 3 道变式、TTS 听题、蒙对检测器（<8 秒标记+3 天重考）、知识大陆战争迷雾地图、数学家人格测试、每日盲盒图鉴、公式咒语默写点亮、GitHub 式刷题热力图+年度报告
- 未做功能：你出题 AI 来做、桌角学习搭子
- 符号风格：卡西欧计算器式（√ 不写 sqrt，分数竖排，π/∞/∫ 用符号），默认精确形式，不主动给小数近似

## Brand Commitments

- 产品名：MathForge 数学计算工作台
- 语气：轻松好玩但数学内容必须准确；像陪练老师，不灌输答案
- 禁止：紫/靛色渐变（用户硬性要求）、浅色死白、emoji 当图标

## Evidence on Hand

- `src/data/`：competition.ts、competition-sprint.ts、competition-topic-detail.ts、competition-formulas.ts、competition-questions.ts、competition-traps.ts、cheatsheets.ts、blind-box.ts、mathematician-quiz.ts 等数据文件
- `src/pages/`：44 个页面目录
- 源码直链：https://github.com/xu1qb/mathforge
- 无真实用户数据、无外部 testimonials、无第三方统计——不要编造

## Product Principles

1. 为竞赛拿奖服务：所有功能最终指向"2026-11-14 能上场"
2. 精确优先：给符号不给近似，给推导不给跳步
3. KaTeX 零裸源码：渲染失败只显示"公式渲染失败"，源码打 console
4. 手机电脑两端同等重要，不做移动端附属
5. 两套皮肤是身份不是换皮：颜色走 CSS 变量 token，新皮肤能加、旧皮肤不丢
6. 代码公开：本地能 `npm install && npm run dev` 跑起来

## Accessibility & Inclusion

- light/dark/system 三模式，KaTeX 颜色和图表跟随主题重绘
- 手机端 375px 不溢出，长公式横向滚动
- 打印页适配
