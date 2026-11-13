// EXPORTS: generateComprehensiveQuiz, type ComprehensiveQuiz
// 本地综合大题生成器：不依赖模型也能无限出「多问、跨知识点」的大题。
// 每道题 2–3 小问，参数随机、答案可复核，用于 AI 出题页的「综合大题」模式。

export interface ComprehensiveQuiz {
  topic: string;
  fusion: string[];
  question: string;
  solution: string;
  answer: string;
}

const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
function frac(a: number, b: number): string {
  if (b === 0) return '不存在';
  const s = b < 0 ? -1 : 1;
  const g = gcd(a, b) || 1;
  const n = (s * a) / g;
  const d = Math.abs(b) / g;
  return d === 1 ? String(n) : `${n}/${d}`;
}
const c = (n: number) => n * (n - 1) / 2;
const fib = (n: number): number => (n <= 2 ? 1 : fib(n - 1) + fib(n - 2));

function polyTerm(coef: number, power: number): string {
  if (coef === 0) return '';
  const sign = coef > 0 ? '+' : '-';
  const abs = Math.abs(coef);
  if (power === 0) return `${sign}${abs}`;
  const body = power === 1 ? 'x' : `x^{${power}}`;
  return `${sign}${abs === 1 ? '' : abs}${body}`;
}

// ============ 1. 三次函数综合 ============
function cubicQuiz(): ComprehensiveQuiz {
  // p、q 为保证系数整数的驻点（p+q 为偶数）
  const pairs: [number, number][] = [[-2, 2], [-2, 0], [0, 2], [-1, 3], [-3, 1], [1, 5], [-4, 2], [2, 4]];
  const [p, q] = pick(pairs);
  const shift = rnd(0, 3);
  const A = (-3 * (p + q)) / 2;
  const B = 3 * p * q;
  const f = (x: number) => x ** 3 + A * x ** 2 + B * x + shift;
  const candidates = [0, 2, p, q].filter((x, i, arr) => x >= 0 && x <= 2 && arr.indexOf(x) === i);
  const values = candidates.map((x) => ({ x, y: f(x) }));
  const maxV = values.reduce((a, b) => (b.y > a.y ? b : a));
  const minV = values.reduce((a, b) => (b.y < a.y ? b : a));

  return {
    topic: '导数应用 · 三次函数综合',
    fusion: ['导数', '单调性', '最值'],
    question: `已知函数 $f(x)=x^{3}${polyTerm(A, 2)}${polyTerm(B, 1)}${polyTerm(shift, 0)}$。\n\n(1) 求 $f'(x)$，并写出 $f(x)$ 的单调区间；\n\n(2) 求 $f(x)$ 的极大值和极小值；\n\n(3) 求 $f(x)$ 在区间 $[0,2]$ 上的最大值与最小值。`,
    solution: `(1) $f'(x)=3x^{2}${polyTerm(2 * A, 1)}${polyTerm(B, 0)}=3(x-${p})(x-${q})$。\n\n当 $x<${p}$ 或 $x>${q}$ 时 $f'(x)>0$，$f$ 单调递增；当 $${p}<x<${q}$ 时 $f'(x)<0$，$f$ 单调递减。\n\n(2) 由单调性，极大值点为 $x=${p}$，极大值 $f(${p})=${f(p)}$；极小值点为 $x=${q}$，极小值 $f(${q})=${f(q)}$。\n\n(3) 区间 $[0,2]$ 内需比较端点与驻点：${values.map((v) => `$f(${v.x})=${v.y}$`).join('，')}。\n\n故最大值为 $${maxV.y}$（在 $x=${maxV.x}$ 处），最小值为 $${minV.y}$（在 $x=${minV.x}$ 处）。`,
    answer: `单调增区间 $(-\\infty,${p})\\cup(${q},+\\infty)$，减区间 $(${p},${q})$；极大值 $${f(p)}$，极小值 $${f(q)}$；[0,2] 上最大值 $${maxV.y}$，最小值 $${minV.y}$`,
  };
}

// ============ 2. 数列综合 ============
function sequenceQuiz(): ComprehensiveQuiz {
  const s = rnd(1, 4);
  const d = rnd(1, 3);
  const k = 2;
  const a = s + d;
  return {
    topic: '数列 · 递推与求和综合',
    fusion: ['数列', '递推', '极限'],
    question: `已知数列 $\\{a_n\\}$ 满足 $a_1=${s}$，$a_{n+1}=${k}a_n+${d}$（$n\\geq 1$）。\n\n(1) 求数列的通项公式 $a_n$；\n\n(2) 求前 $n$ 项和 $S_n$；\n\n(3) 求 $\\displaystyle \\lim_{n\\to\\infty}\\frac{S_n}{${k}^n}$。`,
    solution: `(1) 令 $b_n=a_n+${d}$，则 $b_{n+1}=a_{n+1}+${d}=${k}a_n+${d}+${d}=${k}(a_n+${d})=${k}b_n$。\n\n所以 $\\{b_n\\}$ 是首项 $b_1=${s + d}$、公比 ${k} 的等比数列：$b_n=${s + d}\\cdot ${k}^{n-1}$。\n\n故 $a_n=${s + d}\\cdot ${k}^{n-1}-${d}$。\n\n(2) $S_n=\\sum_{i=1}^{n}(${s + d}\\cdot ${k}^{i-1}-${d})=${s + d}(${k}^n-1)-${d}n$。\n\n(3) $\\displaystyle \\frac{S_n}{${k}^n}=${s + d}(1-${k}^{-n})-\\frac{${d}n}{${k}^n}$。\n\n因为 ${k}^{-n}\\to 0$，$\\frac{${d}n}{${k}^n}\\to 0$，所以极限为 $${a}$。`,
    answer: `$a_n=${a}\\cdot ${k}^{n-1}-${d}$；$S_n=${a}(${k}^n-1)-${d}n$；$\\displaystyle\\lim_{n\\to\\infty}\\frac{S_n}{${k}^n}=${a}$`,
  };
}

// ============ 3. 概率综合 ============
function probabilityQuiz(): ComprehensiveQuiz {
  const r = rnd(3, 9);
  const w = rnd(2, 8);
  const total = r + w;
  const same = c(r) + c(w);
  const all = c(total);
  return {
    topic: '概率 · 不放回抽样综合',
    fusion: ['古典概型', '组合计数', '条件概率'],
    question: `袋中有 ${r} 个红球和 ${w} 个白球，从中不放回地任取 2 个球。\n\n(1) 求第一次取到红球的概率；\n\n(2) 求两次取到的球颜色相同的概率；\n\n(3) 已知两次取到的球颜色相同，求两次都是红球的概率。`,
    solution: `(1) 第一次取到红球的概率 $P_1=\\dfrac{${r}}{${total}}$。\n\n(2) 两次同色 = 两次都红 或 两次都白：\n\n$\\displaystyle P_2=\\frac{C_{${r}}^{2}+C_{${w}}^{2}}{C_{${total}}^{2}}=\\frac{${c(r)}+${c(w)}}{${all}}=\\frac{${same}}{${all}}=${frac(same, all)}$。\n\n(3) 条件概率：\n\n$\\displaystyle P(\\text{都红}\\mid\\text{同色})=\\frac{C_{${r}}^{2}}{C_{${r}}^{2}+C_{${w}}^{2}}=\\frac{${c(r)}}{${same}}=${frac(c(r), same)}$。`,
    answer: `$P_1=\\dfrac{${r}}{${total}}$；$P_2=${frac(same, all)}$；$P(\\text{都红}\\mid\\text{同色})=${frac(c(r), same)}$`,
  };
}

// ============ 4. 矩阵与递推 ============
function matrixQuiz(): ComprehensiveQuiz {
  const n = rnd(8, 13);
  return {
    topic: '矩阵 × 递推数列',
    fusion: ['矩阵', '递推', '数学归纳法'],
    question: `设矩阵 $A=\\begin{pmatrix}1 & 1 \\\\ 1 & 0\\end{pmatrix}$，Fibonacci 数列满足 $F_1=F_2=1$，$F_{n}=F_{n-1}+F_{n-2}$。\n\n(1) 求 $A^{2}$；\n\n(2) 用数学归纳法证明 $A^{n}=\\begin{pmatrix}F_{n+1} & F_{n}\\\\ F_{n} & F_{n-1}\\end{pmatrix}$；\n\n(3) 利用 (2) 求 $F_{${n}}$。`,
    solution: `(1) $A^{2}=\\begin{pmatrix}1 & 1\\\\ 1 & 0\\end{pmatrix}\\begin{pmatrix}1 & 1\\\\ 1 & 0\\end{pmatrix}=\\begin{pmatrix}2 & 1\\\\ 1 & 1\\end{pmatrix}$。\n\n(2) $n=2$ 时由 (1) 与 $F_3=2,F_2=1,F_1=1$ 知结论成立。\n\n假设 $n=k$ 成立，则 $A^{k+1}=A^{k}A=\\begin{pmatrix}F_{k+1} & F_{k}\\\\ F_{k} & F_{k-1}\\end{pmatrix}\\begin{pmatrix}1 & 1\\\\ 1 & 0\\end{pmatrix}=\\begin{pmatrix}F_{k+1}+F_k & F_{k+1}\\\\ F_k+F_{k-1} & F_k\\end{pmatrix}=\\begin{pmatrix}F_{k+2} & F_{k+1}\\\\ F_{k+1} & F_k\\end{pmatrix}$，结论对 $k+1$ 也成立。\n\n(3) 取 $n=${n}$，$A^{${n}}$ 左下角元素为 $F_{${n}}$。逐项递推得 $F_{${n}}=${fib(n)}$。`,
    answer: `$A^{2}=\\begin{pmatrix}2 & 1\\\\ 1 & 1\\end{pmatrix}$；$A^{n}=\\begin{pmatrix}F_{n+1} & F_{n}\\\\ F_{n} & F_{n-1}\\end{pmatrix}$；$F_{${n}}=${fib(n)}$`,
  };
}

// ============ 5. 积分综合 ============
function integralQuiz(): ComprehensiveQuiz {
  const k = rnd(1, 3);
  return {
    topic: '积分 · 反常积分与旋转体',
    fusion: ['分部积分', '反常积分', '旋转体体积'],
    question: `设 $f(x)=xe^{-${k}x}$（$x\\geq 0$）。\n\n(1) 求 $f'(x)$，并说明 $f$ 的最大值点；\n\n(2) 计算反常积分 $\\displaystyle\\int_0^{+\\infty}f(x)\\,dx$；\n\n(3) 将曲线 $y=f(x)$（$0\\leq x<+\\infty$）绕 $x$ 轴旋转，求旋转体体积。`,
    solution: `(1) $f'(x)=e^{-${k}x}-${k}xe^{-${k}x}=(1-${k}x)e^{-${k}x}$。令 $f'(x)=0$ 得 $x=\\dfrac{1}{${k}}$，且两侧导数由正变负，故最大值点为 $x=\\dfrac{1}{${k}}$。\n\n(2) 分部积分：$\\displaystyle\\int_0^{+\\infty}xe^{-${k}x}dx=\\left[-\\frac{x}{${k}}e^{-${k}x}\\right]_0^{+\\infty}+\\frac{1}{${k}}\\int_0^{+\\infty}e^{-${k}x}dx=0+\\frac{1}{${k}^{2}}=${frac(1, k * k)}$。\n\n(3) $\\displaystyle V=\\pi\\int_0^{+\\infty}x^{2}e^{-2${k}x}dx=\\pi\\cdot\\frac{2}{(2${k})^{3}}=\\frac{\\pi}{${4 * k ** 3}}$。`,
    answer: `$f'(x)=(1-${k}x)e^{-${k}x}$，最大值点 $x=\\dfrac{1}{${k}}$；$\\displaystyle\\int_0^{+\\infty}f(x)dx=${frac(1, k * k)}$；$V=\\dfrac{\\pi}{${4 * k ** 3}}$`,
  };
}

// ============ 6. 多元条件极值 ============
function multivariableQuiz(): ComprehensiveQuiz {
  const s = rnd(2, 8);
  return {
    topic: '多元微分 · 条件极值',
    fusion: ['多元函数', '拉格朗日乘数法', '几何意义'],
    question: `在约束 $x+y=${s}$ 下，求 $z=x^{2}+y^{2}$ 的最小值。\n\n(1) 写出拉格朗日函数与驻点方程组；\n\n(2) 求出最小值点与最小值；\n\n(3) 从几何角度解释该结果（点到直线距离）。`,
    solution: `(1) 令 $L=x^{2}+y^{2}-\\lambda(x+y-${s})$，则\n\n$L_x=2x-\\lambda=0$，$L_y=2y-\\lambda=0$，$x+y=${s}$。\n\n(2) 由前两式得 $x=y=\\dfrac{\\lambda}{2}$，代入约束得 $x=y=\\dfrac{${s}}{2}$。\n\n此时 $z_{\\min}=2\\cdot\\left(\\dfrac{${s}}{2}\\right)^{2}=\\dfrac{${s * s}}{2}$。\n\n(3) $x^{2}+y^{2}$ 是点 $(x,y)$ 到原点距离的平方；约束 $x+y=${s}$ 是一条直线。故最小值就是原点到该直线距离的平方：$d=\\dfrac{${s}}{\\sqrt{2}}$，$d^{2}=\\dfrac{${s * s}}{2}$，与代数结果一致。`,
    answer: `$x=y=\\dfrac{${s}}{2}$，最小值 $\\dfrac{${s * s}}{2}$；几何上为原点到直线 $x+y=${s}$ 距离的平方`,
  };
}

// ============ 7. 中值定理证明 ============
function meanValueQuiz(): ComprehensiveQuiz {
  return {
    topic: '微分中值定理 · 不等式证明',
    fusion: ['导数', '单调性', '不等式证明'],
    question: `证明：当 $x>0$ 时，$\\dfrac{x}{1+x}<\\ln(1+x)<x$。\n\n(1) 构造辅助函数证明右半边不等式；\n\n(2) 构造辅助函数证明左半边不等式；\n\n(3) 指出等号成立的条件。`,
    solution: `(1) 令 $h(x)=x-\\ln(1+x)$，则 $h(0)=0$，$h'(x)=1-\\dfrac{1}{1+x}=\\dfrac{x}{1+x}>0$（$x>0$）。\n\n所以 $h$ 在 $[0,+\\infty)$ 上严格递增，$h(x)>h(0)=0$，即 $\\ln(1+x)<x$。\n\n(2) 令 $g(x)=\\ln(1+x)-\\dfrac{x}{1+x}$，则 $g(0)=0$，\n\n$g'(x)=\\dfrac{1}{1+x}-\\dfrac{1}{(1+x)^{2}}=\\dfrac{x}{(1+x)^{2}}>0$（$x>0$）。\n\n所以 $g$ 严格递增，$g(x)>g(0)=0$，即 $\\dfrac{x}{1+x}<\\ln(1+x)$。\n\n(3) 两个不等式在 $x=0$ 时都取等号；$x>0$ 时均为严格不等式。`,
    answer: '证明见解析；等号仅在 $x=0$ 处成立',
  };
}

// ============ 8. 幂级数综合 ============
function seriesQuiz(): ComprehensiveQuiz {
  return {
    topic: '幂级数 · 收敛域与和函数',
    fusion: ['级数', '收敛半径', '和函数'],
    question: `考虑幂级数 $\\displaystyle\\sum_{n=1}^{\\infty}\\frac{x^{n}}{n\\cdot 2^{n}}$。\n\n(1) 求收敛半径 $R$；\n\n(2) 求收敛域；\n\n(3) 求其和函数 $S(x)$。`,
    solution: `(1) 记 $a_n=\\dfrac{1}{n\\cdot 2^{n}}$，则 $\\displaystyle\\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|=\\frac{1}{2}$，故 $R=2$。\n\n(2) 当 $x=2$ 时级数为 $\\sum\\frac{1}{n}$，发散；当 $x=-2$ 时为 $\\sum\\frac{(-1)^{n}}{n}$，条件收敛。故收敛域为 $[-2,2)$。\n\n(3) 在 $|x|<2$ 内逐项求导：\n\n$S'(x)=\\displaystyle\\sum_{n=1}^{\\infty}\\frac{x^{n-1}}{2^{n}}=\\frac{1}{2}\\cdot\\frac{1}{1-x/2}=\\frac{1}{2-x}$。\n\n又 $S(0)=0$，积分得 $S(x)=-\\ln\\left(1-\\dfrac{x}{2}\\right)$。`,
    answer: '$R=2$；收敛域 $[-2,2)$；$S(x)=-\\ln\\left(1-\\dfrac{x}{2}\\right)$',
  };
}

// ============ 9. 三角 × 复数 ============
function trigComplexQuiz(): ComprehensiveQuiz {
  return {
    topic: '三角 × 复数',
    fusion: ['复数', '棣莫弗公式', '定积分'],
    question: `设 $z=\\cos\\theta+i\\sin\\theta$。\n\n(1) 用棣莫弗公式展开 $z^{3}$，并比较实部求 $\\cos 3\\theta$；\n\n(2) 用 (1) 的结果把 $\\cos^{3}\\theta$ 表示成 $\\cos\\theta$ 与 $\\cos 3\\theta$ 的组合；\n\n(3) 计算 $\\displaystyle\\int_0^{\\pi/2}\\cos^{3}\\theta\\,d\\theta$。`,
    solution: `(1) $z^{3}=(\\cos\\theta+i\\sin\\theta)^{3}=\\cos3\\theta+i\\sin3\\theta$。\n\n另一方面按二项式展开，实部为 $\\cos^{3}\\theta-3\\cos\\theta\\sin^{2}\\theta$。\n\n所以 $\\cos3\\theta=\\cos^{3}\\theta-3\\cos\\theta(1-\\cos^{2}\\theta)=4\\cos^{3}\\theta-3\\cos\\theta$。\n\n(2) 由上式反解：$\\cos^{3}\\theta=\\dfrac{\\cos3\\theta+3\\cos\\theta}{4}$。\n\n(3) $\\displaystyle\\int_0^{\\pi/2}\\cos^{3}\\theta\\,d\\theta=\\frac{1}{4}\\int_0^{\\pi/2}(\\cos3\\theta+3\\cos\\theta)d\\theta=\\frac{1}{4}\\left[\\frac{\\sin3\\theta}{3}+3\\sin\\theta\\right]_0^{\\pi/2}$\n\n$=\\dfrac{1}{4}\\left(-\\dfrac{1}{3}+3\\right)=\\dfrac{1}{4}\\cdot\\dfrac{8}{3}=\\dfrac{2}{3}$。`,
    answer: `$\\cos3\\theta=4\\cos^{3}\\theta-3\\cos\\theta$；$\\cos^{3}\\theta=\\dfrac{\\cos3\\theta+3\\cos\\theta}{4}$；$\\displaystyle\\int_0^{\\pi/2}\\cos^{3}\\theta\\,d\\theta=\\dfrac{2}{3}$`,
  };
}

const GENERATORS: (() => ComprehensiveQuiz)[] = [
  cubicQuiz,
  sequenceQuiz,
  probabilityQuiz,
  matrixQuiz,
  integralQuiz,
  multivariableQuiz,
  meanValueQuiz,
  seriesQuiz,
  trigComplexQuiz,
];

/** 随机生成一道多问综合大题 */
export function generateComprehensiveQuiz(): ComprehensiveQuiz {
  return pick(GENERATORS)();
}
