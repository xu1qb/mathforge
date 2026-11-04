# 出题机制

> 目标：每个知识点都能产出**大量不同**的题目，而不是几道题来回换。
> 检查：`npm run check` 第 5 步的 `check-variety.mjs`（多样性）、`check-generators.mjs`（渲染与书写）。

## 一、难度分级

参照高考「容易 : 中档 : 难 ≈ 3 : 5 : 2」与全国大学生数学竞赛（非数学类）初赛难度，本站三档定义为：

| 档位 | 特征 | 典型步数 | 对应水平 |
|---|---|---|---|
| **基础** | 概念直用、套一个公式 | 1 步 | 课本例题、会考 |
| **进阶** | 需要选方法、两步以上、含简单讨论 | 2–4 步 | 高考中档、考研基础 |
| **竞赛** | 构造、技巧性变形、多步推理 | 4 步以上 | 联赛一试、竞赛初赛 |

各档题目都由生成器保证「答案可算」，并在抽样检查中被验证渲染无误。

## 二、生成模型：题型 × 参数

旧机制是「模板池」：每个知识点固定 3–5 道题，抽到就重复。

新机制是**参数化生成**：

```
题目 = 题型（3–6 种） × 随机参数（区间较大的整数/分数）
```

例如「极限计算」：
- 题型：约分型 / sin(kx)/x / 次数比 / (1+a/x)^(bx) / 1−cos / ln(1+ax) / 根式有理化
- 参数：a ∈ [−12,12]、k ∈ [2,19]、次数 1–4、系数 2–30

单知识点可组合出数百到数千道题，同一道题连出的概率极低。

### 参数化生成器清单（13 个）

| 生成器 | 知识点 | 题型数 |
|---|---|---|
| `genLimitV2` | 极限计算 | 7 |
| `genDerivativeV2` | 求导 | 5 |
| `genIntegralV2` | 积分 | 5 |
| `genTrigIdentityV2` | 三角恒等 | 5 |
| `genTrigSpecialV2` | 特殊角 | 3 |
| `genSequenceLimitV2` | 数列极限 | 6 |
| `genSequenceRecurrenceV2` | 数列递推 | 3 |
| `genSeriesV2` | 级数敛散 | 5 |
| `genFourierV2` | 傅里叶 | 4 |
| `genFunctionPropertyV2` | 函数性质 | 6 |
| `genHyperbolicV2` | 双曲函数 | 4 |
| `genRandomVariableV2` | 随机变量 | 4 |
| `genOdeV2` | 微分方程 | 5 |

## 三、多样性门槛

`check-variety.mjs` 会对每个知识点抽 60 次，要求：

- 全局平均去重率 **≥ 60%**
- 每个知识点 **≥ 20 道不同题**

当前：**78.2%**（1360/1740）。

## 四、仍待改造

以下知识点仍使用模板池（题型固定、参数空间较小），下一步按同一模式改造：

`conic-sections`、`vector-op`、`log-equation`、`exp-power`、`sequence-limit`（参数仍偏少）、
`hyperbolic-func`、`series-convergence`、`geometry-basic`、`solid-geometry`、`coordinate-geometry`。

## 五、新增题型的写法

1. 在 `src/lib/practice-v2.ts` 加一个 `genXxxV2`，用 `mk({...})` 构造；
2. LaTeX 里用 `@` 代替反斜杠（`mk` 会自动还原），中文会自动包进 `\text{}`；
3. 答案必须由参数**算出来**，不能写死；
4. 在 `generatePracticeQuestion` 里把对应 `case` 指到新生成器；
5. 跑 `npm run check`，确认 `generators` 与 `variety` 都通过。
