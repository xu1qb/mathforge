# 学科覆盖对照表

对照参考：《数学的 62 个分支 · From Concrete to Abstract》。
用途：明确「现在有什么」，缺口写在这里，后续按需补，不重复讨论。

> **数据源**：分支的结构化定义在 `src/data/branches.ts`（11 大类，62 个学术分支 + 4 个竞赛分支）。
> 「学科总览」页 `/branches`、首页分支条都从它派生；覆盖状态由 `pagePath` / `courseId` / `tags` 推导，不手工维护。
> 下表由分支数据生成，新增分支或课程时请同时更新数据与本文档。

图例：✅ 有独立页面 · ● 有课程包 · ◐ 有专门考点 · — 暂无

有内容分支：57/62（62 个学术分支里，只剩 5 个前沿交叉分支暂缓）

> 2026-11 更新：64 个课程包全部建成（313 章、733 个知识点挂载）。
> 本轮补上三角学与欧氏几何两个课程包，初等数学这条线补齐；
> 随机过程、递归论等分支也挂回了已有课程包。

## 课程包总览

- **64 个课程包**，覆盖 12 个学科大类（含「初等数学」）；每包 3–9 章，章节带教材对照（`textbookRef`）
- 知识点文章 647 篇，全部满足「内容厚度标准」（定义 / 定理 / 例题 / 易错点 / 步骤）
- 课程首页、章节页、知识点页、练习集、学科介绍、应用与交叉六件套齐备

## 1. 基础数学 Foundations

| 分支 | 状态 | 对应入口 |
|---|---|---|
| 算术 Arithmetic | ✅ | `/calculator` |
| 初等代数 Elementary Algebra | ✅ | `/symbolic` |
| 欧氏几何 Euclidean Geometry | ● | 课程包：欧氏几何（/course/euclidean-geometry） |
| 初等数论 Elementary Number Theory | ✅ | `/number-theory` |
| 三角学 Trigonometry | ● | 课程包：三角学（/course/trigonometry） |
| 解析几何 Analytic Geometry | ✅ | `/plot-2d` |
| 线性代数 Linear Algebra | ✅ | `/linear-algebra` |
| 抽象代数 Abstract Algebra | ✅ | `/modern` |

## 2. 分析学 Analysis

| 分支 | 状态 | 对应入口 |
|---|---|---|
| 微积分 Calculus | ✅ | `/calculus` |
| 实分析 Real Analysis | ✅ | `/multivariable` |
| 复分析 Complex Analysis | ✅ | `/complex` |
| 泛函分析 Functional Analysis | ✅ | `/modern` |
| 调和分析 Harmonic Analysis | ✅ | `/fourier` |
| 测度论 Measure Theory | ◐ | 考点：测度论 |
| 常微分方程 ODE | ✅ | `/ode` |
| 偏微分方程 PDE | ✅ | `/pde` |

## 3. 几何与拓扑 Geometry & Topology

| 分支 | 状态 | 对应入口 |
|---|---|---|
| 非欧几何 Non-Euclidean Geometry | ◐ | 考点：非欧几何 |
| 射影几何 Projective Geometry | ◐ | 考点：射影几何 |
| 微分几何 Differential Geometry | ✅ | `/diff-geo` |
| 代数几何 Algebraic Geometry | ● | 课程包：代数几何（/course/algebraic-geometry） |
| 拓扑学 Topology | ◐ | 考点：拓扑 |
| 代数拓扑 Algebraic Topology | ◐ | 考点：代数拓扑 |
| 微分拓扑 Differential Topology | ● | 课程包：微分拓扑（/course/differential-topology） |

## 4. 代数与数论 Algebra & Number Theory

| 分支 | 状态 | 对应入口 |
|---|---|---|
| 群论 Group Theory | ◐ | 考点：代数 |
| 环论 Ring Theory | ◐ | 考点：环论 |
| 域论 Field Theory | ◐ | 考点：伽罗瓦 |
| 伽罗瓦理论 Galois Theory | ◐ | 考点：伽罗瓦 |
| 代数数论 Algebraic Number Theory | ● | 课程包：代数数论（/course/algebraic-number-theory） |
| 解析数论 Analytic Number Theory | ◐ | 考点：解析数论 |
| 表示论 Representation Theory | ◐ | 考点：表示论 |

## 5. 组合与离散 Combinatorics & Discrete

| 分支 | 状态 | 对应入口 |
|---|---|---|
| 组合数学 Combinatorics | ✅ | `/discrete` |
| 图论 Graph Theory | ✅ | `/discrete` |
| 数理逻辑 Mathematical Logic | ✅ | `/discrete` |
| 集合论 Set Theory | ◐ | 考点：集合论 |
| 范畴论 Category Theory | ◐ | 考点：范畴论 |
| 格论 Lattice Theory | ● | 课程包：格论（/course/lattice-theory） |
| 信息论 Information Theory | ◐ | 考点：信息论 |
| 可计算性 Computability | ◐ | 考点：可计算性 |

## 6. 概率与统计 Probability & Statistics

| 分支 | 状态 | 对应入口 |
|---|---|---|
| 概率论 Probability Theory | ✅ | `/probability` |
| 数理统计 Mathematical Statistics | ✅ | `/probability` |
| 随机过程 Stochastic Processes | ● | 课程包：随机过程（/course/stochastic-process-course） |
| 博弈论 Game Theory | ◐ | 考点：博弈论 |
| 金融数学 Mathematical Finance | ◐ | 考点：金融数学 |

## 7. 计算与算法 Computation & Algorithms

| 分支 | 状态 | 对应入口 |
|---|---|---|
| 数值分析 Numerical Analysis | ✅ | `/numerical` |
| 计算数学 Computational Mathematics | ✅ | `/numerical` |
| 密码学 Cryptography | ◐ | 考点：密码学 |
| 理论计算机科学 Theoretical CS | ◐ | 考点：计算复杂性 |

## 8. 应用数学 Applied Mathematics

| 分支 | 状态 | 对应入口 |
|---|---|---|
| 数学物理 Mathematical Physics | ✅ | `/pde` |
| 力学 Mechanics | ◐ | 考点：力学 |
| 流体力学 Fluid Dynamics | ● | 课程包：流体力学（/course/fluid-dynamics） |
| 生物数学 Mathematical Biology | ◐ | 考点：生物数学 |
| 运筹学 Operations Research | ◐ | 考点：运筹学 |
| 控制论 Control Theory | ◐ | 考点：控制论 |

## 9. 逻辑与基础 Logic & Foundations

| 分支 | 状态 | 对应入口 |
|---|---|---|
| 公理化集合论 Axiomatic Set Theory | ● | 课程包：公理化集合论（/course/axiomatic-set-theory） |
| 模型论 Model Theory | ● | 课程包：模型论（/course/model-theory） |
| 递归论 Recursion Theory | ● | 课程包：递归论（/course/logic-foundations） |
| 证明论 Proof Theory | ● | 课程包：证明论（/course/proof-theory） |

## 10. 前沿与交叉 Frontiers & Interdiscipline

| 分支 | 状态 | 对应入口 |
|---|---|---|
| 高阶范畴论 Higher Category Theory | — | 超纲 · 暂缓 |
| 几何群论 Geometric Group Theory | — | 超纲 · 暂缓 |
| 随机矩阵 Random Matrix Theory | — | 超纲 · 暂缓 |
| 拓扑数据分析 Topological Data Analysis | — | 超纲 · 暂缓 |
| 量子计算 Quantum Computation | — | 超纲 · 暂缓 |


## 产品层（不属于 62 分支，但决定产品定位）

竞赛备战中心、原理讲解、解题流程图、练习训练、知识地图、每日盲盒、公式咒语、数学家测试、我当老师、拍照识题、AI 出题实验室、讲解实验室、实用工具、数据图表、微积分可视化。

## 暂缓清单（5 个，超纲或需要大量前置）

前沿交叉的五个分支仍暂缓，在 `/branches` 首页不计入「有内容」：

- **前沿与交叉**：高阶范畴论、几何群论、随机矩阵、拓扑数据分析、量子计算

判断依据：这些内容写在「入门考点」里只能变成名词解释，对非数学 A 备考没有实际帮助，
与其降低整体内容质量，不如明确标注「暂不覆盖」。量子计算另有一门「量子数学基础」导论课
（`/course/quantum-math`），可作为该方向的入口。

## 补内容的优先级建议

1. **加厚已有课程**：每个分支都有课程包了，接下来是给薄章节补例题、补 sympy 断言。
2. **竞赛向深化**：平面几何与三角的竞赛技法（塞瓦、梅涅劳斯、圆幂）可扩成专题训练。
3. **前沿五分支**：维持暂缓；除非明确要做「现代数学导论」式的科普层。
