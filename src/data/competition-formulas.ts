// EXPORTS: type CompetitionFormula, type FormulaCategory, FORMULA_CATEGORIES, FORMULA_ITEMS
// 竞赛公式速查表：8 大专题共 62 条核心公式
// 公式使用 LaTeX 语法，KaTeX 渲染

export interface CompetitionFormula {
  id: string;
  category: FormulaCategory;
  title: string;
  /** 主公式 LaTeX */
  latex: string;
  /** 简短说明 */
  description: string;
  /** 适用场景标签 */
  tags: string[];
}

export type FormulaCategory =
  | 'limit'
  | 'diff'
  | 'integral'
  | 'multi-diff'
  | 'multi-int'
  | 'series'
  | 'ode'
  | 'geometry';

export const FORMULA_CATEGORIES: { key: FormulaCategory; label: string; count: number; icon: string }[] = [
  { key: 'limit', label: '极限与连续', count: 13, icon: 'Infinity' },
  { key: 'diff', label: '一元微分', count: 11, icon: 'FunctionSquare' },
  { key: 'integral', label: '一元积分', count: 21, icon: 'Integral' },
  { key: 'multi-diff', label: '多元微分', count: 9, icon: 'Layers' },
  { key: 'multi-int', label: '多元积分', count: 8, icon: 'Box' },
  { key: 'series', label: '级数', count: 13, icon: 'Sigma' },
  { key: 'ode', label: '常微分方程', count: 8, icon: 'GitBranch' },
  { key: 'geometry', label: '解析几何', count: 7, icon: 'Cube3d' },
];

// ============================================================
// 公式条目（62 条）
// ============================================================
export const FORMULA_ITEMS: CompetitionFormula[] = [
  // ===== 1. 极限与连续（10 条） =====
  {
    id: 'limit-1',
    category: 'limit',
    title: '第一重要极限',
    latex: `\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1`,
    description: '当 x → 0 时，sin x 与 x 是等价无穷小',
    tags: ['重要极限', '等价无穷小'],
  },
  {
    id: 'limit-2',
    category: 'limit',
    title: '第二重要极限',
    latex: `\\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x = e, \\quad \\lim_{x \\to 0} (1+x)^{\\frac{1}{x}} = e`,
    description: 'e 的定义式，竞赛中常需凑成此形式',
    tags: ['重要极限', 'e 的定义'],
  },
  {
    id: 'limit-3',
    category: 'limit',
    title: '等价无穷小表（乘除可用）',
    latex:
      `\\begin{aligned}` +
      `\\sin x &\\sim x, \\quad \\tan x \\sim x \\\\ ` +
      `\\arcsin x &\\sim x, \\quad \\arctan x \\sim x \\\\ ` +
      `\\ln(1+x) &\\sim x, \\quad e^x - 1 \\sim x \\\\ ` +
      `1-\\cos x &\\sim \\frac{x^2}{2}, \\quad (1+x)^\\alpha-1 \\sim \\alpha x \\\\ ` +
      `x-\\sin x &\\sim \\frac{x^3}{6}, \\quad \\tan x - x \\sim \\frac{x^3}{3} \\\\ ` +
      `\\tan x - \\sin x &\\sim \\frac{x^3}{2}` +
      `\\end{aligned}`,
    description: '乘除因子可直接代换；加减项慎用，最好用泰勒展开',
    tags: ['等价无穷小', '高频考点'],
  },
  {
    id: 'limit-4',
    category: 'limit',
    title: '洛必达法则（0/0 型）',
    latex: `\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)} \\quad (\\frac{0}{0} \\text{ 或 } \\frac{\\infty}{\\infty})`,
    description: '条件：① 0/0 或 ∞/∞ 型 ② f\'、g\' 存在且 g\'≠0 ③ 右端极限存在（或为∞）',
    tags: ['洛必达', '计算'],
  },
  {
    id: 'limit-5',
    category: 'limit',
    title: '夹逼定理',
    latex: `g(x) \\le f(x) \\le h(x) \\text{ 且 } \\lim g(x) = \\lim h(x) = A \\implies \\lim f(x) = A`,
    description: '数列极限和函数极限均适用，常用于 n 项和或根式形式',
    tags: ['定理', '证明'],
  },
  {
    id: 'limit-6',
    category: 'limit',
    title: '单调有界准则',
    latex: `\\{x_n\\}\\text{ 单调有界} \\implies \\lim_{n\\to\\infty} x_n \\text{ 存在}`,
    description: '单调递增有上界 或 单调递减有下界，极限必存在。常用于递推数列',
    tags: ['定理', '数列极限'],
  },
  {
    id: 'limit-7',
    category: 'limit',
    title: '海涅定理（数列-函数转化）',
    latex: `\\lim_{x\\to a}f(x)=A \\iff \\forall x_n\\to a\\,(x_n\\neq a), \\lim_{n\\to\\infty}f(x_n)=A`,
    description: '将函数极限问题转化为数列极限，常用于证明极限不存在',
    tags: ['定理', '转化'],
  },
  {
    id: 'limit-8',
    category: 'limit',
    title: '间断点分类',
    latex:
      `\\begin{cases} ` +
      `\\text{第一类：} f(a^-) \\text{ 与 } f(a^+) \\text{ 均存在} ` +
      `\\begin{cases} \\text{可去：} f(a^-)=f(a^+) \\neq f(a) \\\\ \\text{跳跃：} f(a^-) \\neq f(a^+) \\end{cases} \\\\ ` +
      `\\text{第二类：至少一侧极限不存在}` +
      `\\end{cases}`,
    description: '竞赛高频：找间断点并判断类型，特别注意分母零点与分段点',
    tags: ['间断点', '分类'],
  },
  {
    id: 'limit-9',
    category: 'limit',
    title: '介值定理（零点定理）',
    latex: `f \\in C[a,b], f(a) \\cdot f(b) < 0 \\implies \\exists \\xi \\in (a,b), f(\\xi)=0`,
    description: '连续函数在端点异号则区间内必有零点，证明方程根存在的常用工具',
    tags: ['连续', '证明'],
  },
  {
    id: 'limit-10',
    category: 'limit',
    title: '一致连续性定理',
    latex: `f \\in C[a,b] \\implies f \\text{ 在 } [a,b] \\text{ 上一致连续}`,
    description: '闭区间上连续函数一定一致连续；开区间上需两端极限都存在',
    tags: ['连续', '定理'],
  },
  {
    id: 'limit-11',
    category: 'limit',
    title: '常用等价无穷小（x→0）',
    latex: `\\begin{aligned}
&\\sin x \\sim x,\\quad \\tan x \\sim x,\\quad \\arcsin x \\sim x,\\quad \\arctan x \\sim x \\\\
&\\ln(1+x) \\sim x,\\quad e^x-1 \\sim x,\\quad a^x-1 \\sim x\\ln a \\\\
&1-\\cos x \\sim \\frac{1}{2}x^2,\\quad \\sqrt{1+x}-1 \\sim \\frac{1}{2}x \\\\
&(1+x)^\\alpha-1 \\sim \\alpha x,\\quad x - \\ln(1+x) \\sim \\frac{1}{2}x^2
\\end{aligned}`,
    description: 'x→0 时高频等价无穷小9组，乘除可放心替换，加减慎用',
    tags: ['极限', '等价无穷小', '高频'],
  },
  {
    id: 'limit-12',
    category: 'limit',
    title: 'e 的极限定义',
    latex: `e = \\lim_{n \\to \\infty} \\left(1+\\frac{1}{n}\\right)^n = \\lim_{x \\to \\infty} \\left(1+\\frac{1}{x}\\right)^x = \\lim_{t \\to 0} (1+t)^{\\frac{1}{t}}`,
    description: '第二个重要极限：1^∞ 型未定式的标准答案。幂指函数求极限常用：u^v = e^{v ln u}',
    tags: ['极限', '重要极限', 'e'],
  },
  {
    id: 'limit-13',
    category: 'limit',
    title: '第一个重要极限',
    latex: `\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1,\\qquad \\lim_{x \\to 0} \\frac{\\tan x}{x} = 1,\\qquad \\lim_{x \\to 0} \\frac{\\arcsin x}{x} = 1`,
    description: '0/0 型的经典极限，本质是 sinx ~ x（x→0）。注意：x 必须趋于 0 才能用',
    tags: ['极限', '重要极限'],
  },

  // ===== 2. 一元微分（8 条） =====
  {
    id: 'diff-1',
    category: 'diff',
    title: '罗尔定理（Rolle）',
    latex: `f \\in C[a,b] \\cap D(a,b), f(a)=f(b) \\implies \\exists\\xi\\in(a,b), f'(\\xi)=0`,
    description: '三条件：闭连续、开可导、端点等值 → 内部有水平切线',
    tags: ['中值定理', '证明'],
  },
  {
    id: 'diff-2',
    category: 'diff',
    title: '拉格朗日中值定理（Lagrange）',
    latex: `f \\in C[a,b] \\cap D(a,b) \\implies \\exists\\xi\\in(a,b), f(b)-f(a) = f'(\\xi)(b-a)`,
    description: '割线斜率 = 某点切线斜率。是罗尔定理的推广',
    tags: ['中值定理', '高频'],
  },
  {
    id: 'diff-3',
    category: 'diff',
    title: '柯西中值定理（Cauchy）',
    latex: `\\frac{f(b)-f(a)}{g(b)-g(a)} = \\frac{f'(\\xi)}{g'(\\xi)} \\quad (g' \\neq 0)`,
    description: '两函数增量之比 = 导数之比。参数方程下的拉格朗日',
    tags: ['中值定理', '证明'],
  },
  {
    id: 'diff-4',
    category: 'diff',
    title: '泰勒公式（带 Peano 余项）',
    latex: `f(x) = \\sum_{k=0}^n \\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k + o((x-x_0)^n)`,
    description: '局部泰勒展开，用于极限计算、等价无穷小推导。余项是高阶无穷小',
    tags: ['泰勒', '极限计算'],
  },
  {
    id: 'diff-5',
    category: 'diff',
    title: '泰勒公式（带 Lagrange 余项）',
    latex: `f(x) = \\sum_{k=0}^n \\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k + \\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x-x_0)^{n+1}`,
    description: '整体泰勒展开，用于不等式证明、误差估计',
    tags: ['泰勒', '证明', '估计'],
  },
  {
    id: 'diff-6',
    category: 'diff',
    title: '莱布尼茨高阶导数公式',
    latex: `(uv)^{(n)} = \\sum_{k=0}^n \\binom{n}{k} u^{(k)} v^{(n-k)}`,
    description: '两函数乘积的 n 阶导数，类似二项式展开',
    tags: ['高阶导数', '公式'],
  },
  {
    id: 'diff-7',
    category: 'diff',
    title: '常见 n 阶导数公式',
    latex:
      `\\begin{aligned}` +
      `(e^x)^{(n)} &= e^x, \\quad (\\sin x)^{(n)} = \\sin\\left(x + \\frac{n\\pi}{2}\\right) \\\\ ` +
      `(\\cos x)^{(n)} &= \\cos\\left(x + \\frac{n\\pi}{2}\\right), \\quad (x^\\alpha)^{(n)} = \\alpha^{(\\underline{n})} x^{\\alpha-n} \\\\ ` +
      `(\\ln(1+x))^{(n)} &= \\frac{(-1)^{n-1}(n-1)!}{(1+x)^n}, \\quad \\left(\\frac{1}{1+x}\\right)^{(n)} = \\frac{(-1)^n n!}{(1+x)^{n+1}}` +
      `\\end{aligned}`,
    description: '竞赛必备的 6 组 n 阶导数公式，必须熟记',
    tags: ['高阶导数', '记忆'],
  },
  {
    id: 'diff-8',
    category: 'diff',
    title: '极值与拐点判定',
    latex:
      `\\begin{cases} ` +
      `f'(x_0)=0, f''(x_0) > 0 \\implies \\text{极小值} \\\\ ` +
      `f'(x_0)=0, f''(x_0) < 0 \\implies \\text{极大值} \\\\ ` +
      `f''(x_0)=0, f'''(x_0) \\neq 0 \\implies \\text{拐点} ` +
      `\\end{cases}`,
    description: '一阶导判驻点，二阶导判极值，三阶导判拐点。左右变号也可判定',
    tags: ['极值', '拐点', '判定'],
  },
  {
    id: 'diff-9',
    category: 'diff',
    title: '曲率与曲率半径',
    latex: `\\kappa = \\frac{|y''|}{(1+y'^2)^{\\frac{3}{2}}},\\qquad \\rho = \\frac{1}{\\kappa} = \\frac{(1+y'^2)^{\\frac{3}{2}}}{|y''|}`,
    description: '曲率 κ 描述曲线弯曲程度，曲率半径 ρ 是曲率的倒数。直线曲率为 0，圆曲率 = 1/R',
    tags: ['曲率', '几何应用'],
  },
  {
    id: 'diff-10',
    category: 'diff',
    title: '渐近线求法',
    latex:
      `\\begin{aligned}` +
      `\\text{水平渐近线：}&\\lim_{x \\to \\pm\\infty} f(x) = A \\implies y = A \\\\ ` +
      `\\text{垂直渐近线：}&\\lim_{x \\to x_0} f(x) = \\infty \\implies x = x_0 \\\\ ` +
      `\\text{斜渐近线：}&k=\\lim_{x \\to \\infty}\\frac{f(x)}{x},\\; b=\\lim_{x \\to \\infty}[f(x)-kx] \\implies y = kx + b` +
      `\\end{aligned}`,
    description: '找三类渐近线：水平（无穷远极限）、垂直（瑕点）、斜（斜率+截距）。最多两条水平/斜渐近线',
    tags: ['渐近线', '图像分析'],
  },
  {
    id: 'diff-11',
    category: 'diff',
    title: '极值第二充分条件与边界点',
    latex:
      `\\begin{cases}` +
      `f'(x_0)=0, f''(x_0)>0 \\implies x_0\\text{ 是极小值点} \\\\ ` +
      `f'(x_0)=0, f''(x_0)<0 \\implies x_0\\text{ 是极大值点} \\\\ ` +
      `f''(x_0)=0 \\implies \\text{判别法失效，用一阶导变号或更高阶导判断} \\\\ ` +
      `\\text{闭区间求最值：}f_{max}=\\max\\{f(\\text{驻点}), f(\\text{端点}), f(\\text{不可导点})\\}` +
      `\\end{cases}`,
    description: '求最值别忘了比较端点！闭区间上连续函数必有最值，驻点 + 端点 + 不可导点一起比',
    tags: ['极值', '最值', '判定'],
  },

  // ===== 3. 一元积分（10 条） =====
  {
    id: 'int-1',
    category: 'integral',
    title: '基本积分表（核心 6 条）',
    latex:
      `\\begin{aligned}` +
      `\\int \\sec^2 x\\,dx &= \\tan x + C \\\\ ` +
      `\\int \\frac{1}{1+x^2}\\,dx &= \\arctan x + C \\\\ ` +
      `\\int \\frac{1}{\\sqrt{1-x^2}}\\,dx &= \\arcsin x + C \\\\ ` +
      `\\int \\tan x\\,dx &= -\\ln|\\cos x| + C \\\\ ` +
      `\\int \\ln x\\,dx &= x\\ln x - x + C \\\\ ` +
      `\\int \\sec x\\,dx &= \\ln|\\sec x + \\tan x| + C` +
      `\\end{aligned}`,
    description: '竞赛必背基本积分，直接套用或变形后套用',
    tags: ['基本积分', '记忆'],
  },
  {
    id: 'int-2',
    category: 'integral',
    title: '分部积分法（LIATE 选择）',
    latex: `\\int u\\,dv = uv - \\int v\\,du \\quad (\\text{LIATE 顺序选 } u)`,
    description: 'LIATE：Logarithmic 对 / Inverse trig 反 / Algebraic 代 / Trig 三 / Exponential 指',
    tags: ['分部积分', '方法'],
  },
  {
    id: 'int-3',
    category: 'integral',
    title: '换元积分（三角代换）',
    latex:
      `\\begin{cases} ` +
      `\\sqrt{a^2-x^2} \\implies x = a\\sin t \\\\ ` +
      `\\sqrt{a^2+x^2} \\implies x = a\\tan t \\\\ ` +
      `\\sqrt{x^2-a^2} \\implies x = a\\sec t ` +
      `\\end{cases}`,
    description: '根式积分的标准套路，根据被积函数形式选择三角代换',
    tags: ['换元法', '技巧'],
  },
  {
    id: 'int-4',
    category: 'integral',
    title: '奇零偶倍（对称区间）',
    latex: `\\int_{-a}^a f(x)dx = \\begin{cases} 0, & f\\text{ 奇} \\\\ 2\\int_0^a f(x)dx, & f\\text{ 偶} \\end{cases}`,
    description: '对称区间上先看奇偶性，奇函数积分直接为 0',
    tags: ['对称性', '技巧'],
  },
  {
    id: 'int-5',
    category: 'integral',
    title: '对称区间一般公式',
    latex: `\\int_{-a}^a f(x)dx = \\int_0^a [f(x) + f(-x)] dx`,
    description: '不需要判断奇偶性也能用，竞赛常用的对称区间万能公式',
    tags: ['对称性', '万能公式'],
  },
  {
    id: 'int-6',
    category: 'integral',
    title: '定积分公式（正弦加权）',
    latex: `\\int_0^\\pi x f(\\sin x) dx = \\frac{\\pi}{2} \\int_0^\\pi f(\\sin x) dx`,
    description: '含 x·f(sinx) 的 [0,π] 积分，x 可提为 π/2 后只剩 sinx 函数',
    tags: ['公式', '高频'],
  },
  {
    id: 'int-7',
    category: 'integral',
    title: '变上限积分求导（基本）',
    latex: `\\frac{d}{dx} \\int_a^{\\varphi(x)} f(t)dt = f[\\varphi(x)] \\cdot \\varphi'(x)`,
    description: '上限是函数时，用链式法则：f(上限) · 上限的导数',
    tags: ['变上限积分', '求导'],
  },
  {
    id: 'int-8',
    category: 'integral',
    title: '变上限积分求导（复合上下限）',
    latex: `\\frac{d}{dx} \\int_{\\psi(x)}^{\\varphi(x)} f(t)dt = f[\\varphi(x)]\\varphi'(x) - f[\\psi(x)]\\psi'(x)`,
    description: '上下限都是函数时，上限减下限，各自用链式法则',
    tags: ['变上限积分', '复合'],
  },
  {
    id: 'int-9',
    category: 'integral',
    title: '广义积分收敛判别（p 判别）',
    latex:
      `\\int_1^{+\\infty} \\frac{1}{x^p}dx \\begin{cases} \\text{收敛,} & p>1 \\\\ \\text{发散,} & p\\le 1 \\end{cases} \\quad ` +
      `\\int_0^1 \\frac{1}{x^p}dx \\begin{cases} \\text{收敛,} & p<1 \\\\ \\text{发散,} & p\\ge 1 \\end{cases}`,
    description: '无穷积分与瑕积分的 p 判别法，作为比较判别法的基准',
    tags: ['广义积分', '判别法'],
  },
  {
    id: 'int-10',
    category: 'integral',
    title: '积分中值定理',
    latex: `f \\in C[a,b] \\implies \\exists \\xi \\in [a,b], \\int_a^b f(x)dx = f(\\xi)(b-a)`,
    description: '积分 = 区间长度 × 某点函数值，f(ξ) 叫平均值',
    tags: ['定理', '估计'],
  },
  {
    id: 'int-11',
    category: 'integral',
    title: '华里士（Wallis）公式',
    latex:
      `\\int_0^{\\frac{\\pi}{2}} \\sin^n x \\,dx = \\int_0^{\\frac{\\pi}{2}} \\cos^n x \\,dx = ` +
      `\\begin{cases}` +
      `\\dfrac{n-1}{n}\\cdot\\dfrac{n-3}{n-2}\\cdot\\cdots\\cdot\\dfrac{1}{2}\\cdot\\dfrac{\\pi}{2}, & n\\text{ 为正偶数} \\ ` +
      `\\dfrac{n-1}{n}\\cdot\\dfrac{n-3}{n-2}\\cdot\\cdots\\cdot\\dfrac{2}{3}, & n\\text{ 为大于1的奇数}` +
      `\\end{cases}`,
    description: '点火公式：n=1时点不着=1，n=2时点着了=π/4。n奇偶结果形式不同',
    tags: ['定积分', '华里士', '点火公式'],
  },
  {
    id: 'int-12',
    category: 'integral',
    title: '常见可积组合',
    latex:
      `\\begin{aligned}` +
      `\\int e^x(\\sin x + \\cos x)\\,dx &= e^x \\sin x + C \\ ` +
      `\\int e^x(\\sin x - \\cos x)\\,dx &= -e^x \\cos x + C \\ ` +
      `\\int e^x[f(x)+f'(x)]\\,dx &= e^x f(x) + C \\ ` +
      `\\int \\frac{f'(x)}{f(x)}\\,dx &= \\ln|f(x)| + C` +
      `\\end{aligned}`,
    description: '识别出这些组合直接出结果，不用分部积分。尤其 e^x(f+f\') 型是竞赛常客',
    tags: ['不定积分', '技巧', '可积组合'],
  },
  {
    id: 'int-13',
    category: 'integral',
    title: '定积分常用结论',
    latex: `\\int_0^\\pi x f(\\sin x)\\,dx = \\frac{\\pi}{2}\\int_0^\\pi f(\\sin x)\\,dx = \\pi\\int_0^{\\frac{\\pi}{2}} f(\\sin x)\\,dx`,
    description: '被积函数含 x·f(sinx) 在 [0,π] 上积分，用 x=π-t 换元后相加，x 因子可消去',
    tags: ['定积分', '技巧', '对称'],
  },
  {
    id: 'int-14',
    category: 'integral',
    title: '周期函数积分平移',
    latex: `\\int_a^{a+T} f(x)\\,dx = \\int_0^T f(x)\\,dx,\\qquad \\int_0^{nT} f(x)\\,dx = n\\int_0^T f(x)\\,dx`,
    description: '周期函数在任意一个整周期上的积分都相等，与起点无关。n个整周期就是n倍',
    tags: ['定积分', '周期性'],
  },
  {
    id: 'int-15',
    category: 'integral',
    title: '积分不等式链',
    latex:
      `\\begin{aligned}` +
      `\\text{柯西-施瓦茨：}&\\left(\\int_a^b fg\\,dx\\right)^2 \\le \\int_a^b f^2 dx \\cdot \\int_a^b g^2 dx \\\\ ` +
      `\\text{取 g=1 特例：}&\\left(\\int_a^b f\\,dx\\right)^2 \\le (b-a)\\int_a^b f^2 dx \\\\ ` +
      `\\text{切比雪夫：}& f,g\\text{ 同单调} \\implies \\frac{1}{b-a}\\int_a^b fg \\ge \\frac{1}{b-a}\\int_a^b f \\cdot \\frac{1}{b-a}\\int_a^b g` +
      `\\end{aligned}`,
    description: '柯西-施瓦茨最常用，等号当且仅当 f,g 线性相关成立',
    tags: ['积分不等式', '竞赛常客'],
  },
  {
    id: 'int-16',
    category: 'integral',
    title: '旋转体体积',
    latex:
      `\\begin{aligned}` +
      `\\text{绕 }x\\text{ 轴（圆盘法）：}&V = \\pi\\int_a^b y^2(x)\\,dx \\\\ ` +
      `\\text{绕 }y\\text{ 轴（柱壳法）：}&V = 2\\pi\\int_a^b x\\cdot y(x)\\,dx \\\\ ` +
      `\\text{绕 }y\\text{ 轴（圆盘法）：}&V = \\pi\\int_c^d x^2(y)\\,dy` +
      `\\end{aligned}`,
    description: '圆盘法和柱壳法选哪个？看积分变量哪个方便。柱壳法绕y轴但对x积分',
    tags: ['几何应用', '体积'],
  },
  {
    id: 'int-17',
    category: 'integral',
    title: '平面曲线弧长',
    latex:
      `\\begin{aligned}` +
      `\\text{直角坐标 }y=y(x):\\; & s = \\int_a^b \\sqrt{1+y'^2(x)}\\,dx \\\\ ` +
      `\\text{参数方程：}& s = \\int_\\alpha^\\beta \\sqrt{x'^2(t)+y'^2(t)}\\,dt \\\\ ` +
      `\\text{极坐标 }r=r(\\theta):\\; & s = \\int_\\alpha^\\beta \\sqrt{r^2(\\theta)+r'^2(\\theta)}\\,d\\theta` +
      `\\end{aligned}`,
    description: '弧长元素 ds = √(dx²+dy²)，不同形式展开不同。弧长总是正的',
    tags: ['几何应用', '弧长'],
  },
  {
    id: 'int-18',
    category: 'integral',
    title: '旋转曲面面积',
    latex: `S = 2\\pi\\int_a^b y\\cdot\\sqrt{1+y'^2}\\,dx \\quad (\\text{绕}x\\text{轴旋转})`,
    description: '曲线 y=y(x) 绕x轴旋转所得曲面面积。被积函数是「周长 × 弧长元素」：2πy · ds',
    tags: ['几何应用', '曲面面积'],
  },
  {
    id: 'int-19',
    category: 'integral',
    title: '高斯积分（泊松积分）',
    latex: `\\int_0^{+\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2},\\qquad \\int_{-\\infty}^{+\\infty} e^{-x^2} dx = \\sqrt{\\pi}`,
    description: '概率论常客，了解级别。证明用二重积分极坐标或含参积分法。竞赛选择填空可直接用',
    tags: ['反常积分', '高斯积分', '了解'],
  },
  {
    id: 'int-20',
    category: 'integral',
    title: '狄利克雷判别法与阿贝尔判别法',
    latex:
      `\\begin{aligned}` +
      `\\text{Dirichlet：}&\\begin{cases}F(A)=\\int_a^A f\\,dx\\text{ 有界} \\\\ g(x)\\text{ 单调趋于}0\\end{cases}` +
      `\\implies \\int_a^{+\\infty}fg\\,dx\\text{ 收敛} \\\\ ` +
      `\\text{Abel：}&\\begin{cases}\\int_a^{+\\infty}f\\,dx\\text{ 收敛} \\\\ g(x)\\text{ 单调有界}\\end{cases}` +
      `\\implies \\int_a^{+\\infty}fg\\,dx\\text{ 收敛}` +
      `\\end{aligned}`,
    description: '反常积分条件收敛的判别法（比较法只能判绝对收敛）。级数也有完全平行的版本',
    tags: ['反常积分', '判敛', '条件收敛'],
  },
  {
    id: 'int-21',
    category: 'integral',
    title: '欧拉-泊松积分推广',
    latex:
      `\\begin{aligned}` +
      `\\int_0^{+\\infty} e^{-ax^2} dx &= \\frac{1}{2}\\sqrt{\\frac{\\pi}{a}}\\quad (a>0) \\\\ ` +
      `\\int_0^{+\\infty} x^{2n} e^{-ax^2} dx &= \\frac{(2n-1)!!}{2^{n+1}a^n}\\sqrt{\\frac{\\pi}{a}} \\\\ ` +
      `\\int_0^{+\\infty} x^{2n+1} e^{-ax^2} dx &= \\frac{n!}{2a^{n+1}}` +
      `\\end{aligned}`,
    description: '高斯积分的一般形式，含x^n因子的可以用分部积分或伽马函数递推。了解级别',
    tags: ['反常积分', '高斯积分', '了解'],
  },

  // ===== 4. 多元微分（6 条） =====
  {
    id: 'mdiff-1',
    category: 'multi-diff',
    title: '复合函数链式法则',
    latex:
      `z = f(u,v), u = \\varphi(x,y), v = \\psi(x,y) \\implies ` +
      `\\frac{\\partial z}{\\partial x} = \\frac{\\partial z}{\\partial u}\\frac{\\partial u}{\\partial x} + \\frac{\\partial z}{\\partial v}\\frac{\\partial v}{\\partial x}`,
    description: '路径相加原则：每个中间变量贡献一条路径，各路径导数相乘再相加',
    tags: ['链式法则', '复合函数'],
  },
  {
    id: 'mdiff-2',
    category: 'multi-diff',
    title: '隐函数求导公式',
    latex: `F(x,y)=0 \\implies \\frac{dy}{dx} = -\\frac{F_x}{F_y} \\quad (F_y \\neq 0)`,
    description: '隐函数一阶导数 = -Fx/Fy，注意负号和分子分母顺序',
    tags: ['隐函数', '求导'],
  },
  {
    id: 'mdiff-3',
    category: 'multi-diff',
    title: '方向导数与梯度',
    latex: `\\frac{\\partial f}{\\partial \\mathbf{l}} = \\nabla f \\cdot \\mathbf{u}, \\quad |\\nabla f| = \\max_{|\\mathbf{u}|=1} \\frac{\\partial f}{\\partial \\mathbf{l}}`,
    description: '方向导数 = 梯度 · 单位方向向量；梯度方向是方向导数最大的方向',
    tags: ['梯度', '方向导数'],
  },
  {
    id: 'mdiff-4',
    category: 'multi-diff',
    title: '无条件极值判别（AC-B²）',
    latex:
      `f_x=f_y=0 \\text{ 时, } A=f_{xx}, B=f_{xy}, C=f_{yy}:` +
      `\\begin{cases} AC-B^2 > 0 \\text{ 且 } A>0 \\implies \\text{极小值} \\\\ AC-B^2 > 0 \\text{ 且 } A<0 \\implies \\text{极大值} \\\\ AC-B^2 < 0 \\implies \\text{不是极值} \\end{cases}`,
    description: '驻点处用二阶偏导组成的判别式 AC-B² 判断极值类型',
    tags: ['极值', '判别'],
  },
  {
    id: 'mdiff-5',
    category: 'multi-diff',
    title: '拉格朗日乘数法',
    latex:
      `\\min/\\max f(x,y) \\text{ s.t. } \\varphi(x,y)=0 \\implies ` +
      `L = f + \\lambda\\varphi, \\quad \\begin{cases} L_x = f_x+\\lambda\\varphi_x = 0 \\\\ L_y = f_y+\\lambda\\varphi_y = 0 \\\\ L_\\lambda = \\varphi = 0 \\end{cases}`,
    description: '条件极值的标准方法，构造拉格朗日函数令偏导为 0',
    tags: ['条件极值', '方法'],
  },
  {
    id: 'mdiff-6',
    category: 'multi-diff',
    title: '全微分形式不变性',
    latex: `dz = \\frac{\\partial z}{\\partial u}du + \\frac{\\partial z}{\\partial v}dv \\quad (u,v \\text{ 无论是自变量还是中间变量})`,
    description: '全微分形式与变量是自变量还是中间变量无关，常用于快速求偏导',
    tags: ['全微分', '性质'],
  },
  {
    id: 'mdiff-7',
    category: 'multi-diff',
    title: '方向导数与梯度',
    latex:
      `\\begin{aligned}` +
      `\\frac{\\partial f}{\\partial l} &= \\nabla f \\cdot \\mathbf{e}_l = f_x\\cos\\alpha + f_y\\cos\\beta + f_z\\cos\\gamma \\\\ ` +
      `\\nabla f &= (f_x, f_y, f_z) \\quad (\\text{梯度向量}) \\\\ ` +
      `\\max\\frac{\\partial f}{\\partial l} &= |\\nabla f|,\\quad \\text{方向沿梯度方向}` +
      `\\end{aligned}`,
    description: '方向导数是函数沿指定方向的变化率；梯度是方向导数最大的方向，大小为最大变化率',
    tags: ['偏导数', '梯度', '方向导数'],
  },
  {
    id: 'mdiff-8',
    category: 'multi-diff',
    title: '曲面切平面与法线（隐式 F=0）',
    latex:
      `\\begin{aligned}` +
      `\\text{切平面：}& F_x(x_0,y_0,z_0)(x-x_0) + F_y(y-y_0) + F_z(z-z_0) = 0 \\\\ ` +
      `\\text{法线：}& \\frac{x-x_0}{F_x} = \\frac{y-y_0}{F_y} = \\frac{z-z_0}{F_z} \\\\ ` +
      `\\text{法向量：}& \\mathbf{n} = (F_x, F_y, F_z)\\big|_{M_0}` +
      `\\end{aligned}`,
    description: '隐式曲面 F(x,y,z)=0 在 M₀ 处的切平面方程：梯度向量就是法向量',
    tags: ['曲面', '切平面', '法线'],
  },
  {
    id: 'mdiff-9',
    category: 'multi-diff',
    title: '空间曲线切线与法平面（参数式）',
    latex:
      `\\begin{aligned}` +
      `\\text{切线：}& \\frac{x-x_0}{x'(t_0)} = \\frac{y-y_0}{y'(t_0)} = \\frac{z-z_0}{z'(t_0)} \\\\ ` +
      `\\text{法平面：}& x'(t_0)(x-x_0) + y'(t_0)(y-y_0) + z'(t_0)(z-z_0) = 0 \\\\ ` +
      `\\text{切向量：}& \\boldsymbol{\\tau} = (x'(t_0), y'(t_0), z'(t_0))` +
      `\\end{aligned}`,
    description: '参数方程 x=x(t), y=y(t), z=z(t) 在 t=t₀ 处的切向量就是各分量导数构成的向量',
    tags: ['曲线', '切线', '法平面'],
  },

  // ===== 5. 多元积分（8 条） =====
  {
    id: 'mint-1',
    category: 'multi-int',
    title: '二重积分极坐标变换',
    latex: `x = r\\cos\\theta, \\quad y = r\\sin\\theta, \\quad dxdy = r\\, dr d\\theta`,
    description: '圆域、环形域或被积函数含 x²+y² 时首选极坐标',
    tags: ['二重积分', '极坐标'],
  },
  {
    id: 'mint-2',
    category: 'multi-int',
    title: '积分换序（富比尼定理）',
    latex:
      `\\int_a^b dx \\int_{\\varphi_1(x)}^{\\varphi_2(x)} f(x,y)dy = ` +
      `\\int_c^d dy \\int_{\\psi_1(y)}^{\\psi_2(y)} f(x,y)dx`,
    description: '交换积分次序：先画积分区域图，再重新确定上下限',
    tags: ['换序', '技巧'],
  },
  {
    id: 'mint-3',
    category: 'multi-int',
    title: '三重积分球坐标',
    latex:
      `\\begin{cases} x = r\\sin\\varphi\\cos\\theta \\\\ y = r\\sin\\varphi\\sin\\theta \\\\ z = r\\cos\\varphi \\end{cases}, \\quad dv = r^2\\sin\\varphi\\,dr d\\varphi d\\theta`,
    description: '球域或被积函数含 x²+y²+z² 时用球坐标，注意雅可比行列式',
    tags: ['三重积分', '球坐标'],
  },
  {
    id: 'mint-4',
    category: 'multi-int',
    title: '格林公式（Green）',
    latex: `\\oint_L Pdx + Qdy = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dxdy`,
    description: '闭合曲线积分 → 二重积分。条件：L 正向闭合，P、Q 在 D 内有连续偏导',
    tags: ['曲线积分', '格林公式'],
  },
  {
    id: 'mint-5',
    category: 'multi-int',
    title: '高斯公式（Gauss）',
    latex:
      `\\oiint_\\Sigma P dydz + Q dzdx + R dxdy = ` +
      `\\iiint_\\Omega \\left(\\frac{\\partial P}{\\partial x}+\\frac{\\partial Q}{\\partial y}+\\frac{\\partial R}{\\partial z}\\right)dv`,
    description: '闭合曲面积分 → 三重积分。散度定理',
    tags: ['曲面积分', '高斯公式'],
  },
  {
    id: 'mint-6',
    category: 'multi-int',
    title: '斯托克斯公式（Stokes）',
    latex:
      `\\oint_\\Gamma Pdx+Qdy+Rdz = \\iint_\\Sigma ` +
      `\\begin{vmatrix} dydz & dzdx & dxdy \\\\ \\frac{\\partial}{\\partial x} & \\frac{\\partial}{\\partial y} & \\frac{\\partial}{\\partial z} \\\\ P & Q & R \\end{vmatrix}`,
    description: '空间闭合曲线积分 → 以其为边界的曲面积分',
    tags: ['曲线积分', '斯托克斯'],
  },
  {
    id: 'mint-7',
    category: 'multi-int',
    title: '路径无关条件',
    latex: `\\text{单连通域内 } \\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x} \\iff \\text{曲线积分与路径无关}`,
    description: 'P_y = Q_x 是平面曲线积分与路径无关的充要条件（单连通域）',
    tags: ['曲线积分', '路径无关'],
  },
  {
    id: 'mint-8',
    category: 'multi-int',
    title: '两类曲线积分的关系',
    latex: `\\int_L Pdx + Qdy = \\int_L (P\\cos\\alpha + Q\\cos\\beta)ds`,
    description: '对坐标的曲线积分可转为对弧长的曲线积分，用方向余弦转换',
    tags: ['曲线积分', '转换'],
  },

  // ===== 6. 级数（8 条） =====
  {
    id: 'ser-1',
    category: 'series',
    title: '正项级数比较判别法',
    latex:
      `0 \\le u_n \\le v_n \\implies ` +
      `\\begin{cases} \\sum v_n \\text{ 收敛} \\implies \\sum u_n \\text{ 收敛} \\\\ \\sum u_n \\text{ 发散} \\implies \\sum v_n \\text{ 发散} \\end{cases}`,
    description: '大收→小收，小散→大散。常以 p 级数、等比级数作为比较标准',
    tags: ['正项级数', '判别法'],
  },
  {
    id: 'ser-2',
    category: 'series',
    title: '比值判别法（达朗贝尔）',
    latex:
      `\\rho = \\lim_{n\\to\\infty} \\frac{u_{n+1}}{u_n} \\implies ` +
      `\\begin{cases} \\rho < 1 \\text{ 收敛} \\\\ \\rho > 1 \\text{ 发散} \\\\ \\rho = 1 \\text{ 失效} \\end{cases}`,
    description: '含 n! 或 a^n 的级数优先考虑比值判别法',
    tags: ['正项级数', '判别法'],
  },
  {
    id: 'ser-3',
    category: 'series',
    title: '根值判别法（柯西）',
    latex:
      `\\rho = \\lim_{n\\to\\infty} \\sqrt[n]{u_n} \\implies ` +
      `\\begin{cases} \\rho < 1 \\text{ 收敛} \\\\ \\rho > 1 \\text{ 发散} \\\\ \\rho = 1 \\text{ 失效} \\end{cases}`,
    description: '含 n 次方的级数优先用根值判别法，比比值判别法适用更广',
    tags: ['正项级数', '判别法'],
  },
  {
    id: 'ser-4',
    category: 'series',
    title: '莱布尼茨判别法（交错级数）',
    latex: `\\sum (-1)^{n-1}u_n \\text{ 满足 } u_n \\searrow 0 \\implies \\text{收敛}`,
    description: '交错级数收敛的充分条件：通项绝对值单调递减趋于 0',
    tags: ['交错级数', '判别法'],
  },
  {
    id: 'ser-5',
    category: 'series',
    title: '绝对收敛与条件收敛',
    latex:
      `\\sum |u_n| \\text{ 收敛} \\implies \\sum u_n \\text{ 收敛（绝对收敛）}; ` +
      `\\quad \\sum u_n \\text{ 收敛但} \\sum |u_n| \\text{ 发散} \\implies \\text{条件收敛}`,
    description: '绝对收敛→收敛；条件收敛说明正项和负项各自都发散',
    tags: ['收敛性', '概念'],
  },
  {
    id: 'ser-6',
    category: 'series',
    title: '幂级数收敛半径',
    latex: `R = \\lim_{n\\to\\infty} \\left| \\frac{a_n}{a_{n+1}} \\right| \\quad \\text{（比值法, } a_n \\neq 0\\text{）}`,
    description: '收敛半径 = 相邻系数比的极限（绝对值），端点需单独讨论',
    tags: ['幂级数', '收敛半径'],
  },
  {
    id: 'ser-7',
    category: 'series',
    title: '常见麦克劳林展开（5 个必背）',
    latex:
      `\\begin{aligned}` +
      `e^x &= \\sum_{n=0}^\\infty \\frac{x^n}{n!} & (|x|<\\infty) \\\\ ` +
      `\\sin x &= \\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n+1}}{(2n+1)!} & (|x|<\\infty) \\\\ ` +
      `\\cos x &= \\sum_{n=0}^\\infty \\frac{(-1)^n x^{2n}}{(2n)!} & (|x|<\\infty) \\\\ ` +
      `\\ln(1+x) &= \\sum_{n=1}^\\infty \\frac{(-1)^{n-1}x^n}{n} & (-1<x\\le 1) \\\\ ` +
      `(1+x)^\\alpha &= 1+\\sum_{n=1}^\\infty \\binom{\\alpha}{n} x^n & (-1,1) ` +
      `\\end{aligned}`,
    description: '竞赛必须熟记的 5 组展开式，求和与展开互逆都要用',
    tags: ['幂级数展开', '记忆'],
  },
  {
    id: 'ser-8',
    category: 'series',
    title: '常见级数和',
    latex:
      `\\begin{aligned}` +
      `\\sum_{n=1}^\\infty \\frac{1}{n^2} &= \\frac{\\pi^2}{6}, \\\\ ` +
      `\\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{n} = \\ln 2 \\\\ ` +
      `\\sum_{n=1}^\\infty \\frac{n}{2^n} &= 2, \\\\ ` +
      `\\sum_{n=0}^\\infty \\frac{1}{2^n} = 2` +
      `\\end{aligned}`,
    description: '填空中可以直接套用的常见级数和',
    tags: ['级数和', '公式'],
  },
  {
    id: 'ser-9',
    category: 'series',
    title: '常用幂级数展开（麦克劳林）',
    latex:
      `\\begin{aligned}` +
      `e^x &= \\sum_{n=0}^\\infty \\frac{x^n}{n!},\\; x\\in\\mathbb{R} \\\\ ` +
      `\\sin x &= \\sum_{n=0}^\\infty (-1)^n\\frac{x^{2n+1}}{(2n+1)!},\\; x\\in\\mathbb{R} \\\\ ` +
      `\\cos x &= \\sum_{n=0}^\\infty (-1)^n\\frac{x^{2n}}{(2n)!},\\; x\\in\\mathbb{R} \\\\ ` +
      `\\ln(1+x) &= \\sum_{n=1}^\\infty (-1)^{n-1}\\frac{x^n}{n},\\; x\\in(-1,1] \\\\ ` +
      `(1+x)^\\alpha &= \\sum_{n=0}^\\infty \\binom{\\alpha}{n}x^n,\\; x\\in(-1,1) \\\\ ` +
      `\\frac{1}{1-x} &= \\sum_{n=0}^\\infty x^n,\\; |x|<1` +
      `\\end{aligned}`,
    description: '6个最常用的麦克劳林展开，求极限、求和、展开都用。必须熟记收敛域',
    tags: ['幂级数', '展开', '麦克劳林'],
  },
  {
    id: 'ser-10',
    category: 'series',
    title: 'p-级数敛散性',
    latex: `\\sum_{n=1}^\\infty \\frac{1}{n^p} \\;\\text{敛散性：}\\begin{cases} p > 1, &\\text{收敛} \\ p \\le 1, &\\text{发散} \end{cases}`,
    description: '比较判别法的参照标尺。p=1 时是调和级数，发散但很慢',
    tags: ['级数', 'p级数', '判敛参照'],
  },
  {
    id: 'ser-11',
    category: 'series',
    title: '几何级数（等比级数）',
    latex: `\\sum_{n=0}^\\infty ar^n = \\frac{a}{1-r},\\qquad |r| < 1\\;\\text{收敛};\\quad |r| \\ge 1\\;\\text{发散}`,
    description: '比值法、根值法本质上都是跟几何级数比较。求和公式：首项/(1-公比)',
    tags: ['级数', '几何级数', '判敛参照'],
  },
  {
    id: 'ser-12',
    category: 'series',
    title: '条件收敛经典例子',
    latex:
      `\\begin{aligned}` +
      `\\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{n} &\\;\\text{条件收敛（莱布尼茨级数，和为}\\ln 2\\text{）} \\\\ ` +
      `\\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{\\sqrt{n}} &\\;\\text{条件收敛（}p=1/2<1\\text{，绝对值发散）} \\\\ ` +
      `\\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{n^2} &\\;\\text{绝对收敛（}p=2>1\\text{）}` +
      `\\end{aligned}`,
    description: '交错p-级数: p>1绝对收敛, 0<p≤1条件收敛, p≤0发散。条件收敛的典型参照',
    tags: ['级数', '条件收敛', '交错级数'],
  },
  {
    id: 'ser-13',
    category: 'series',
    title: '傅里叶系数公式',
    latex:
      `\\begin{aligned}` +
      `a_0 &= \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\,dx \\\\ ` +
      `a_n &= \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\cos nx\\,dx \\\\ ` +
      `b_n &= \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\sin nx\\,dx \\\\ ` +
      `f(x) &= \\frac{a_0}{2} + \\sum_{n=1}^\\infty (a_n\\cos nx + b_n\\sin nx)` +
      `\\end{aligned}`,
    description: '周期2π函数的傅里叶展开。收敛定理：连续点收敛于f(x)，间断点收敛于左右极限平均值',
    tags: ['傅里叶', '三角级数'],
  },

  // ===== 7. 常微分方程（6 条） =====
  {
    id: 'ode-1',
    category: 'ode',
    title: '一阶线性方程（积分因子法）',
    latex: `y' + P(x)y = Q(x) \\implies y = e^{-\\int Pdx}\\left(\\int Q\\cdot e^{\\int Pdx} dx + C\\right)`,
    description: '一阶线性非齐次方程通解公式：积分因子 μ = e^∫Pdx',
    tags: ['一阶方程', '公式'],
  },
  {
    id: 'ode-2',
    category: 'ode',
    title: '伯努利方程换元',
    latex: `y' + P(x)y = Q(x)y^n \\implies z = y^{1-n}, \\quad z' + (1-n)P z = (1-n)Q`,
    description: '令 z = y^(1-n)，转化为一阶线性方程再求解',
    tags: ['伯努利', '换元'],
  },
  {
    id: 'ode-3',
    category: 'ode',
    title: '齐次方程换元',
    latex: `y' = f\\left(\\frac{y}{x}\\right) \\implies u = \\frac{y}{x}, \\quad u + x\\frac{du}{dx} = f(u)`,
    description: '令 u = y/x 转化为可分离变量方程',
    tags: ['齐次方程', '换元'],
  },
  {
    id: 'ode-4',
    category: 'ode',
    title: '二阶常系数齐次方程通解',
    latex:
      `r_{1,2} = \\frac{-p \\pm \\sqrt{p^2-4q}}{2} \\implies ` +
      `\\begin{cases} y = C_1 e^{r_1x} + C_2 e^{r_2x} & (\\Delta>0) \\\\ y = (C_1+C_2x)e^{rx} & (\\Delta=0) \\\\ y = e^{\\alpha x}(C_1\\cos\\beta x + C_2\\sin\\beta x) & (\\Delta<0) \\end{cases}`,
    description: '解特征方程 r²+pr+q=0，按根的三种情形写通解',
    tags: ['二阶方程', '特征方程'],
  },
  {
    id: 'ode-5',
    category: 'ode',
    title: '非齐次特解形式表（指数+多项式）',
    latex:
      `f(x) = P_m(x)e^{\\lambda x} \\implies y^* = x^k Q_m(x)e^{\\lambda x}` +
      `\\quad (k = \\lambda \\text{ 作为特征根的重数})`,
    description: 'k 取 0/1/2：λ 不是特征根取 0，单根取 1，二重根取 2',
    tags: ['非齐次', '特解形式'],
  },
  {
    id: 'ode-6',
    category: 'ode',
    title: '欧拉方程换元',
    latex: `x^2 y'' + p x y' + q y = f(x) \\implies x = e^t, \\quad xy' = Dy, \\quad x^2 y'' = D(D-1)y`,
    description: '令 t = lnx，用微分算子 D = d/dt 替换后化为常系数方程',
    tags: ['欧拉方程', '换元'],
  },
  {
    id: 'ode-7',
    category: 'ode',
    title: '伯努利方程',
    latex: `y' + P(x)y = Q(x)y^n \\implies z = y^{1-n},\\quad z' + (1-n)P(x)z = (1-n)Q(x)`,
    description: 'n=0时是一阶线性；n=1时可分离变量；其他情况令 z=y^{1-n} 化为一阶线性方程',
    tags: ['一阶', '伯努利', '换元'],
  },
  {
    id: 'ode-8',
    category: 'ode',
    title: '全微分方程与积分因子',
    latex:
      `\\begin{aligned}` +
      `\\text{全微分：}&\\frac{\\partial P}{\\partial y}=\\frac{\\partial Q}{\\partial x} \\implies \\int_{x_0}^x P(x,y_0)dx + \\int_{y_0}^y Q(x,y)dy = C \\\\ ` +
      `\\text{积分因子（仅含}x\\text{）：}&\\mu(x)=e^{\\int\\frac{P_y-Q_x}{Q}dx} \\\\ ` +
      `\\text{积分因子（仅含}y\\text{）：}&\\mu(y)=e^{\\int\\frac{Q_x-P_y}{P}dy}` +
      `\\end{aligned}`,
    description: '判断Pdx+Qdy是否是全微分。不是的话找积分因子μ，使 μPdx+μQdy 成为全微分',
    tags: ['一阶', '全微分', '积分因子'],
  },

  // ===== 8. 解析几何（6 条） =====
  {
    id: 'geo-1',
    category: 'geometry',
    title: '向量三种乘法的几何意义',
    latex:
      `\\begin{aligned}` +
      `\\mathbf{a} \\cdot \\mathbf{b} &= |\\mathbf{a}||\\mathbf{b}|\\cos\\theta \\quad (\\text{投影，标量}) \\\\ ` +
      `|\\mathbf{a} \\times \\mathbf{b}| &= |\\mathbf{a}||\\mathbf{b}|\\sin\\theta \\quad (\\text{面积，向量}) \\\\ ` +
      `[\\mathbf{a}\\ \\mathbf{b}\\ \\mathbf{c}] &= (\\mathbf{a} \\times \\mathbf{b}) \\cdot \\mathbf{c} \\quad (\\text{混合积=体积})` +
      `\\end{aligned}`,
    description: '点积·投影；叉积·面积；混合积·体积。三种运算各有用途',
    tags: ['向量运算', '基础'],
  },
  {
    id: 'geo-2',
    category: 'geometry',
    title: '平面点法式方程',
    latex: `A(x-x_0) + B(y-y_0) + C(z-z_0) = 0 \\quad (\\mathbf{n} = \\{A,B,C\\})`,
    description: '已知平面上一点和法向量，直接写出平面方程',
    tags: ['平面方程', '基本'],
  },
  {
    id: 'geo-3',
    category: 'geometry',
    title: '直线点向式方程',
    latex: `\\frac{x-x_0}{m} = \\frac{y-y_0}{n} = \\frac{z-z_0}{p} \\quad (\\mathbf{s} = \\{m,n,p\\})`,
    description: '已知直线上一点和方向向量，写出对称式方程',
    tags: ['直线方程', '基本'],
  },
  {
    id: 'geo-4',
    category: 'geometry',
    title: '距离公式（点到平面/直线）',
    latex:
      `d_{\\text{点-平面}} = \\frac{|Ax_0+By_0+Cz_0+D|}{\\sqrt{A^2+B^2+C^2}}, \\quad ` +
      `d_{\\text{点-直线}} = \\frac{|\\mathbf{s} \\times \\overrightarrow{M_0M}|}{|\\mathbf{s}|}`,
    description: '点到平面代公式；点到直线用叉积除以方向向量模长',
    tags: ['距离', '公式'],
  },
  {
    id: 'geo-5',
    category: 'geometry',
    title: '夹角公式（两平面/两直线）',
    latex:
      `\\cos\\theta = \\frac{|\\mathbf{n_1} \\cdot \\mathbf{n_2}|}{|\\mathbf{n_1}||\\mathbf{n_2}|} \\quad (\\text{两平面}), \\qquad ` +
      `\\cos\\theta = \\frac{|\\mathbf{s_1} \\cdot \\mathbf{s_2}|}{|\\mathbf{s_1}||\\mathbf{s_2}|} \\quad (\\text{两直线})`,
    description: '夹角取锐角，所以分子加绝对值',
    tags: ['夹角', '公式'],
  },
  {
    id: 'geo-6',
    category: 'geometry',
    title: '二次曲面标准方程',
    latex:
      `\\begin{aligned}` +
      `\\text{椭球面：} & \\frac{x^2}{a^2} + \\frac{y^2}{b^2} + \\frac{z^2}{c^2} = 1 \\\\ ` +
      `\\text{单叶双曲面：} & \\frac{x^2}{a^2} + \\frac{y^2}{b^2} - \\frac{z^2}{c^2} = 1 \\\\ ` +
      `\\text{双叶双曲面：} & \\frac{x^2}{a^2} + \\frac{y^2}{b^2} - \\frac{z^2}{c^2} = -1 \\\\ ` +
      `\\text{椭圆抛物面：} & \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 2pz \\\\ ` +
      `\\text{双曲抛物面：} & \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 2pz` +
      `\\end{aligned}`,
    description: '5 种常见二次曲面标准方程，注意正负号和右端常数',
    tags: ['二次曲面', '识别'],
  },
  {
    id: 'geo-7',
    category: 'geometry',
    title: '旋转曲面方程',
    latex:
      `\\begin{aligned}` +
      `\\text{曲线 }f(y,z)=0\\text{ 绕}z\\text{轴旋转：}& f(\\pm\\sqrt{x^2+y^2},\\, z) = 0 \\\\ ` +
      `\\text{曲线 }f(x,z)=0\\text{ 绕}x\\text{轴旋转：}& f(x,\\;\\pm\\sqrt{y^2+z^2}) = 0 \\\\ ` +
      `\\text{口诀：}& \\text{绕谁转谁不变，另一个换成 }\\pm\\sqrt{...}` +
      `\\end{aligned}`,
    description: '坐标平面内的曲线绕坐标轴旋转得到旋转曲面。圆锥面、旋转抛物面、球面都是旋转曲面',
    tags: ['曲面', '旋转', '口诀'],
  },
];
