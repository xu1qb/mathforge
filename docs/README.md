# 文档索引

这个目录放的是**给维护者看**的文档，不是给终端用户看的产品文案。

| 文档 | 内容 | 什么时候读 |
|---|---|---|
| [quality-gates.md](./quality-gates.md) | 七道质量关、加内容检查清单、已知坑 | 改代码前必读 |
| [course-plan.md](./course-plan.md) | 学科课程化方案：六件套模型、数据模型、P0–P3 路线 | 做课程化时 |
| [coverage.md](./coverage.md) | 62 个数学分支的覆盖状态、暂缓清单 | 补内容时 |
| [cloud-sync.md](./cloud-sync.md) | Supabase 账号、云同步、部署与 RLS | 接账号或部署时 |

## 三条最常忘的规矩

1. **提交前跑 `npm run check`**，十项全绿才能提交（pre-commit 钩子会强制）
2. **改了公式必须补 sympy 断言**，否则「算得对不对」没人验
3. **中文说明里不能出现裸 LaTeX**（`lim_{x→0}` 要写成 `lim(x→0)`），公式里不要塞中文

## 项目速览

- 647 个考点（原理讲解）、30 个练习知识点、9 张解题流程图
- 64 个课程包：313 章、733 个知识点挂载（教材对照见 coverage.md）
- 1354 条公式（全部 KaTeX strict 渲染通过）、881 条数学断言
- 纯前端 SPA：React 19 + Vite + TS + Tailwind + KaTeX
- 两套皮肤：夜航（深色）/ 草稿纸（浅色）
