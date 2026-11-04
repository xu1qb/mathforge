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
## 五、综合创新题（跨知识点融合）

除了单点参数化，还有一类**结构融合题**：不靠参数组合，而是把两个知识点的结构拼在一起，
生成竞赛风格的复合题（生成器 `genFusion`，知识点 key = `fusion`）。

| 融合 | 题目结构 |
|---|---|
| 数列 × 数论 | aₙ = aⁿ 的余数（找 mod 周期）、个位数字（4 循环） |
| 数论 × 组合 | 1..N 中与 6 互素的个数（容斥原理） |
| 数列 × 不等式 | aₙ = n/(n²+a²) 的最大值（均值不等式 + 取等条件） |
| 矩阵 × 递推 | 用 Fibonacci 转移矩阵求 Fₙ |
| 概率 × 组合 | 同时取两球同色的概率（组合数之比） |
| 极限 × 指数 | lim(1+k/n)^(mn) = e^(km) |
| 复数 × 三角 | 棣莫弗定理求 Re(zⁿ) |
| 导数 × 不等式 | f(x)=x³−3ax 的极小值（求导 + 二阶导判定） |
| 级数 × 概率 | 几何分布的期望 = 1/p（级数求和） |
| 数论 × 数列 | n²+n 恒被 2 整除（连续整数之积） |

这类题只有「竞赛」档，结构固定但参数随机，答案全部可验算。

## 六、难度梯度

`check-difficulty.mjs` 抽样 12 次/档，检查步骤数是否逐级递增：

- 基础：按题型原样给步骤（约 2.6 步）
- 进阶：多加一步「方法：先确定可直接套用的公式」
- 竞赛：多了「思路选择」与「结果回代检验」两步（约 4.7 步）

当前：基础 2.63 步 → 竞赛 4.67 步，30 个知识点**无倒挂**。
