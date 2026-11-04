# 出题机制

> 目标：每个知识点都能产出**大量不同**的题目，而不是几道题来回换。
> 检查：`npm run check` 第 5 步的 `check-variety.mjs`（多样性）、`check-generators.mjs`（渲染与书写）。

## 一、难度分级

参照高考「容易 : 中档 : 难 ≈ 3 : 5 : 2」与全国大学生数学竞赛（非数学类）初赛难度：

| 档位 | 特征 | 典型步数 | 对应水平 |
|---|---|---|---|
| **基础** | 概念直用、套一个公式 | 1 步 | 课本例题、会考 |
| **进阶** | 需要选方法、两步以上、含简单讨论 | 2–4 步 | 高考中档、考研基础 |
| **竞赛** | 构造、技巧性变形、多步推理 | 4 步以上 | 联赛一试、竞赛初赛 |

## 二、生成模型：题型 × 参数

旧机制是「模板池」：每个知识点固定 3–5 道题，抽到就重复（极限计算 90 次只出 4 道不同题）。

新机制是**参数化生成**：

```
题目 = 题型（3–7 种） × 随机参数（大区间整数/分数）
```

29 个知识点全部改造完毕，统一写在 `src/lib/practice-v2.ts`，通过 `mk()` 构造：

- 源码里用 `@` 代表反斜杠，`mk()` 自动还原
- LaTeX 里裸露的中文会自动包进 `\text{...}`
- 答案一律由参数**算出来**，不写死

### 生成器一览

| 知识点 | 生成器 | 题型数 |
|---|---|---|
| 一元二次方程 / 因式分解 | `genAlgebraQuadV2` / `genAlgebraFactorV2` | 3 / 2 |
| 特殊角 / 三角恒等 | `genTrigSpecialV2` / `genTrigIdentityV2` | 3 / 5 |
| 求导 / 积分 / 极限 | `genDerivativeV2` / `genIntegralV2` / `genLimitV2` | 5 / 5 / 7 |
| 数列极限 / 递推 / 级数 | `genSequenceLimitV2` / `genSequenceRecurrenceV2` / `genSeriesV2` | 6 / 3 / 5 |
| 傅里叶 / 函数性质 / 双曲 | `genFourierV2` / `genFunctionPropertyV2` / `genHyperbolicV2` | 4 / 6 / 4 |
| 不等式求解 / 均值 | `genInequalitySolveV2` / `genInequalityAmgmV2` | 4 / 3 |
| 指数幂 / 对数 / 数论 | `genExpPowerV2` / `genLogEquationV2` / `genNumberTheoryV2` | 3 / 3 / 4 |
| 向量 / 矩阵 / 复数 | `genVectorOpV2` / `genMatrixOpV2` / `genComplexV2` | 4 / 5 / 4 |
| 平面 / 坐标 / 圆锥 / 立体 | `genGeometryV2` / `genCoordinateV2` / `genConicV2` / `genSolidV2` | 3 / 4 / 4 / 5 |
| 组合 / 概率 / 随机变量 | `genCombinatoricsV2` / `genProbabilityV2` / `genRandomVariableV2` | 3 / 3 / 4 |
| 微分方程 | `genOdeV2` | 5 |

## 三、多样性门槛

`check-variety.mjs`：每个知识点抽 60 次，要求

- 全局平均去重率 **≥ 60%**
- 每个知识点 **≥ 20 道不同题**

当前：**83.9%**（1460/1740），最低的知识点也有 40/60。

## 四、新增题型的写法

1. 在 `src/lib/practice-v2.ts` 加 `genXxxV2`，用 `mk({...})` 构造；
2. 参数要**出现在 LaTeX 里**，否则去重会把它当成同一题；
3. 答案必须由参数算出来；
4. 在 `generatePracticeQuestion` 里把对应 `case` 指到新生成器；
5. 跑 `npm run check`，确认 `generators` 与 `variety` 都通过。