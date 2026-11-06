# 质量关卡（Quality Gates）

> 给接手这个项目的人 / agent 看的：提交前必须过哪几道关、每道关管什么、怎么加内容不会翻车。

## 一条命令

```bash
npm run check
```

依次跑 10 项，**任何一项失败都不能提交**。git pre-commit 钩子也会执行同一套。

| # | 检查 | 脚本 | 现在覆盖 | 管什么 |
|---|---|---|---|---|
| 1 | 类型检查 | `tsc --noEmit` | 全量 | 类型安全 |
| 2 | 代码规范 | `eslint src --quiet` | 全量 | 风格与常见错误 |
| 3 | 生产构建 | `vite build` → 临时目录 | 全量 | 能否打包 |
| 4 | 公式正确性 | `scripts/verify-formulas.py` | 881 条断言 | **算得对** |
| 5 | 公式渲染 | `scripts/check-formulas.mjs` | 1354 条公式 | **显示得出来** |
| 6 | 文本规范 | `scripts/check-text.mjs` | 58,302 个字符串 | **写得规范** |
| 7 | 交叉引用与死链 | `scripts/check-refs.mjs` | 路由 + 互引 | **连得上** |
| 8 | 服务端链路 | `server/test.ts` | 23 项（强制 mock） | **后端不崩** |
| 9 | UI 快照 | `scripts/ui-snapshots.mjs` | 5 页 × 2 宽度 | **没白屏/没溢出** |
| 10 | 文档数字 | `scripts/check-docs-stats.ts` | docs 里的统计量 | **文档不漂移** |

第 9 关会自己拉起 dev server 和无头 Chrome，约 30–40 秒。
没有 Chrome 或设了 `SKIP_UI_SNAP=1` 时会跳过（不算失败）。

第 10 关只读数据层和 docs，几秒钟跑完：内容扩写后忘了改 README 里的数字，
这一关会直接指出「文档 96 / 实际 633」这样的偏差。

单独跑某一项：

```bash
npm run typecheck
npm run lint
node scripts/check-formulas.mjs
node scripts/check-text.mjs
node scripts/check-refs.mjs
PYTHONPATH=../.tooling/py python3 scripts/verify-formulas.py
npm run ui:snap
./node_modules/.bin/tsx scripts/check-docs-stats.ts
```

## 每道关具体查什么

### 4. 公式正确性（verify-formulas.py）

用 sympy 断言数学结论成立。例如：

- `lim (1+1/n)^n = e`
- `det[[2,1],[3,4]] = 5`
- 康托集挖掉总测度 = 1
- RSA 加解密可还原

**改了公式就必须补断言**，否则「对不对」没人验。

### 5. 公式渲染（check-formulas.mjs）

把所有公式字符串交给 KaTeX，以 `strict: 'error'` 渲染一遍。同时禁止 `\text{}` 里出现中文。

两类问题会被拦下：
- 语法错误（括号不配、命令非法）
- 数学模式里直接写中文

### 6. 文本规范（check-text.mjs）

扫描数据文件里的字符串，8 条规则：

| 规则 | 例子 |
|---|---|
| 中文旁的半角标点 | `两不等实根,` → `两不等实根，` |
| 中文旁的半角句号 | `正确.` → `正确。` |
| 半角括号包中文 | `柯西不等式(内积形式)` → `（内积形式）` |
| 全角空格 | `\u3000` |
| 重复标点 | `。。` |
| 术语不一致 | `非数学A` → `非数学 A` |
| 残留占位符 | `TODO`、`暂无内容` |
| 标点前空格 | `中文 ，` |

**设计要点**：脚本会先判断字符串是不是「公式语境」（含 `=`、`≈`、`↔`、`°`、反斜杠或 `sin(` 这类函数调用），是的话跳过标点规则——否则 `P(不同)`、`圆: x=cos(t)` 会大量误报。

### 7. 交叉引用与死链（check-refs.mjs）

用 TypeScript 编译器 API 加载真实数据模块（不加依赖），校验：

- 考点 id 唯一、难度合法
- 课程 `lessonIds` / `practiceTopics` / `toolPath` 都存在
- 分支 `pagePath` 路由存在、`tags` 在考点标签里真实存在
- 考点→练习映射表的 key 有效
- 代码里所有 `navigate('/xxx')` 目标匹配已声明路由（支持 `:param`）

## 加内容时的检查清单

### 新增一个考点（explainers.ts）

1. `id` 唯一、`tag` 用已有标签、`level` 是 基础/进阶/竞赛
2. `formula` / `result` 里不能有裸中文
3. 跑到 `npm run check`，第 5、6 关会验
4. **补一条 sympy 断言**（第 4 关），否则算得对不对没人管

### 新增一道课程练习（courses/*.ts）

1. 题干/答案/步骤用 `$...$` 包住公式，交给 `RichMath` 渲染
2. 答案必须能用脚本验证 → 补断言
3. 第 7 关会校验章节引用的考点和练习 key 是否存在

### 新增一个分支（branches.ts）

1. `pagePath` 必须是已声明的路由
2. `tags` 必须是真实存在的考点标签
3. 补内容后同步更新 `docs/coverage.md`

## 已知坑（都踩过）

| 坑 | 现象 | 解法 |
|---|---|---|
| **黑板卡片文字深浅** | 草稿纸主题下深棕字压深绿底，对比度 1.0 | 卡片加 `board-surface` 类，强制浅色文字 |
| **HashRouter 参数** | `?topic=xxx` 取不到 | 用 `useSearchParams()`，不能读 `window.location.search` |
| **存储是 JSON 包装** | 直接写 `localStorage.setItem(k, 'paper')` 无效 | 必须 `JSON.stringify('paper')` |
| **MathRenderer 写死 text-foreground** | 深色卡片里公式变暗 | `.board-surface .math-renderer` 覆盖 |
| **检查器误报** | `navigate('/course/' + id)` 被截断成 `/course/` | 出现告警先确认真假，别急着放宽规则 |
| **沙箱不能删文件** | `rm` → EPERM | 临时文件丢 `dist/_junk`，构建输出到 `/tmp` |
| **参数化路由审计崩溃** | `/course/:subject` 当真实路径截图失败 | 审计里跳过 `:` 路由，补具体实例 |

## UI 体检（额外一步）

改了界面后额外跑：

```bash
# 需要 dev server（5173）+ 9222 上的无头 Chrome
node scripts/audit-site.mjs
```

检查项：横向溢出、重复 `h1`、固定浮层相交、控制台报错、`.katex-error`、页面上的裸 LaTeX。

### 10. 文档数字核对（check-docs-stats.ts）

从数据层重新数一遍，再和 docs 里写的数字比对：

- 考点数 / 练习知识点数 / 流程图数 / 课程包数 / 章节数 / 知识点挂载数
- 公式数（与第 5 关共用 `scripts/lib/formula-scan.mjs`，不会各数各的）
- 断言数（`verify-formulas.py` 里的 `chk(` 条数）
- 字符串数（与第 6 关共用 `scripts/lib/text-scan.mjs`）
- 服务端测试项数、快照页数
- 分支覆盖数、暂缓分支数

**改了内容就要同步 docs 里的数字**，否则提交会被这一关拦下。

## 拦不住的部分

自动化能保证：**算得对、显示得出来、写得规范、连得上**。

拦不住的（需要人工判断）：

- 讲解里的数学表述是否严谨
- 例题难度是否合适
- 教材章节对应是否准确
- 应用场景举的例子是否贴切

这些只能靠人读，或者继续补断言。
