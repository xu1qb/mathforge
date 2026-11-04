# 公式书写规范

> 目标：所有公式（讲解、题目、解答、课程）都按**纸质教材**的写法呈现。
> 检查方式：`npm run check` 第 5 步的 `check-latex`（静态）与 `check-generators`（生成题抽样）。

## 一、基本规则

| 项目 | 规范写法 | 禁止写法 |
|---|---|---|
| 幂次 | `x^{2}`、`e^{-x}` | `x^2`、`e^-x` |
| 分式 | `\dfrac{a}{b}`（行内也可）、`\frac{a}{b}` | `a/b` 当作数学式子 |
| 根号 | `\sqrt{x}`、`\sqrt[3]{x}` | `sqrt(x)` |
| 乘法 | `\cdot` 或直接相邻 | `*` |
| 不等号 | `\leq \geq\ \neq` | `<= >= !=` |
| 箭头 | `\to`、`\Rightarrow`、`\Leftrightarrow` | `->`、`=>` |
| 省略号 | `\cdots`（居中）、`\ldots`（基线） | `...` |
| 圆周率 | `\pi` | `pi` |
| 无穷 | `\infty` | `inf`、`∞`（公式内） |
| 角度 | `90^{\circ}` | `90°`（公式内） |
| 集合 | `\{x \mid x>0\}` | `{x \| x>0}` |
| 积分 | `\int_{a}^{b} f(x)\,dx`（dx 前加细空格） | `\int f(x)dx` |
| 极限 | `\lim_{x \to a}` | `lim(x→a)`（公式内） |

## 二、矩阵与向量

矩阵一律用 `pmatrix`，行分隔符必须是**双反斜杠**（源码里写四个）：

```latex
\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}
```

- 行列式用 `vmatrix`
- 行向量用 `\begin{pmatrix} a & b & c \end{pmatrix}`
- 圆括号元组用 `\left( a,\ b,\ c \right)`

## 三、中文与公式混排

- 公式里出现中文说明放 `\text{...}`，例如 `\text{解方程：}`
- 正文叙述里的公式用 `$...$` 包起来，交给 `RichMath` 渲染
- **不要**在数学模式里直接写中文（会触发 KaTeX 警告）

## 四、源码层面的硬性要求

在 TS 模板字符串里写 LaTeX，**每个反斜杠都要写两次**：

```ts
// 对
const tex = `\\dfrac{1}{2}`;
// 错：\d、\f 会被 JS 当转义符吃掉
const bad = `\dfrac{1}{2}`;
```

检查器会扫描 `math-practice.ts`、`problem-generators.ts`，发现单反斜杠 LaTeX 命令直接失败。

## 五、检查清单（提交前自动跑）

| 检查 | 覆盖 |
|---|---|
| `check-latex.mjs` | 15 项转换断言 + 单反斜杠源码守卫 |
| `check-generators.mjs` | 430 道生成题：KaTeX 渲染 + 幂次/斜杠分式/双负号/星号/箭头/比较符 |

新增写法规则时，**同步更新这两个脚本的规则数组和本文档**。
