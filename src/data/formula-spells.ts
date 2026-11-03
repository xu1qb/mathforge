// EXPORTS: FORMULA_SPELL_CARDS, FormulaSpellCard, FormulaSpellSet, FORMULA_SETS

export interface FormulaSpellCard {
  id: string;
  name: string;
  set: string;
  /** LaTeX 公式（大字展示） */
  formula: string;
  /** 咒语口诀（一句话记忆） */
  mantra: string;
  /** 适用条件 */
  condition: string;
  /** 默写答案的关键词（模糊匹配用），满足其中的主要关键词即算对 */
  keywords: string[];
  /** 难度 1-5 */
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface FormulaSpellSet {
  id: string;
  name: string;
  icon: string;
  /** 集齐解锁的称号 */
  title: string;
  description: string;
  color: string;
}

export const FORMULA_SETS: FormulaSpellSet[] = [
  {
    id: 'differential',
    name: '微分套组',
    icon: 'TrendingUp',
    title: '泰勒传人',
    description: '掌握微分学全部核心武器',
    color: 'indigo',
  },
  {
    id: 'integral',
    name: '积分套组',
    icon: 'Integral',
    title: '积分大师',
    description: '游刃有余地处理各类积分',
    color: 'emerald',
  },
  {
    id: 'series',
    name: '级数套组',
    icon: 'Sigma',
    title: '傅里叶召唤师',
    description: '在无穷级数中自由穿梭',
    color: 'violet',
  },
  {
    id: 'advanced',
    name: '综合套组',
    icon: 'Orbit',
    title: '格林判官',
    description: '贯通多元微积分三大公式',
    color: 'amber',
  },
  {
    id: 'inequality',
    name: '不等式套组',
    icon: 'EqualNotEqual',
    title: '不等式守序者',
    description: '熟知所有经典不等式关系',
    color: 'rose',
  },
];

export const FORMULA_SPELL_CARDS: FormulaSpellCard[] = [
  // ===== 微分套组（6张）=====
  {
    id: 'diff-taylor',
    name: '泰勒展开',
    set: 'differential',
    formula: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(x_0)}{n!}(x-x_0)^n',
    mantra: '函数展开成幂级数，各阶导数除以阶乘乘增量',
    condition: 'f(x) 在 x₀ 邻域内具有任意阶导数；余项分皮亚诺型与拉格朗日型',
    keywords: ['泰勒', 'f(x)', 'f^{(n)}', 'n!', '(x-x_0)', 'sum', 'infty'],
    difficulty: 3,
  },
  {
    id: 'diff-lhospital',
    name: '洛必达法则',
    set: 'differential',
    formula: '\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f\'(x)}{g\'(x)}',
    mantra: '0/0 或 ∞/∞，上下求导再比极限',
    condition: '必须是 0/0 或 ∞/∞ 型不定式；f\'、g\' 在 a 的去心邻域存在且 g\'(x) ≠ 0',
    keywords: ['lim', 'f(x)', 'g(x)', "f'(x)", "g'(x)", '\\to'],
    difficulty: 2,
  },
  {
    id: 'diff-rolle-lagrange',
    name: '罗尔与拉格朗日中值定理',
    set: 'differential',
    formula: 'f\'(\\xi) = \\frac{f(b)-f(a)}{b-a}',
    mantra: '闭区间连续开区间可导，中间必有切线平行割线',
    condition: 'f 在 [a,b] 连续、(a,b) 可导；罗尔定理增加 f(a)=f(b) ⇒ f\'(ξ)=0',
    keywords: ['f(\\xi)', 'f(b)', 'f(a)', 'b-a', "f'"],
    difficulty: 2,
  },
  {
    id: 'diff-cauchy-mvt',
    name: '柯西中值定理',
    set: 'differential',
    formula: '\\frac{f\'(\\xi)}{g\'(\\xi)} = \\frac{f(b)-f(a)}{g(b)-g(a)}',
    mantra: '两个函数割线斜率比，等于某点导数比',
    condition: 'f, g 在 [a,b] 连续、(a,b) 可导，且 g\'(x) ≠ 0',
    keywords: ['f(\\xi)', 'g(\\xi)', 'f(b)', 'f(a)', 'g(b)', 'g(a)'],
    difficulty: 3,
  },
  {
    id: 'diff-fermat',
    name: '费马引理与极值必要条件',
    set: 'differential',
    formula: 'f\'(x_0) = 0',
    mantra: '可导极值点，导数必为零',
    condition: 'f 在 x₀ 处可导且取得极值 ⇒ f\'(x₀)=0；驻点不一定是极值点',
    keywords: ["f'(x_0)", '= 0', '极值'],
    difficulty: 1,
  },
  {
    id: 'diff-chain-rule',
    name: '导数定义与链式法则',
    set: 'differential',
    formula: '\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}',
    mantra: '复合函数求导，外层乘内层，像链条一样连起来',
    condition: 'u=g(x) 在 x 处可导，y=f(u) 在对应 u 处可导',
    keywords: ['dy/dx', 'dy/du', 'du/dx', '\\frac{dy}{dx}', '\\frac{dy}{du}', '\\frac{du}{dx}'],
    difficulty: 1,
  },

  // ===== 积分套组（6张）=====
  {
    id: 'int-newton-leibniz',
    name: '牛顿-莱布尼茨公式',
    set: 'integral',
    formula: '\\int_{a}^{b} f(x) dx = F(b) - F(a)',
    mantra: '定积分 = 原函数在上下限处的差',
    condition: 'f 在 [a,b] 上可积，F 是 f 的一个原函数',
    keywords: ['int', 'f(x)', 'dx', 'F(b)', 'F(a)', 'a', 'b'],
    difficulty: 1,
  },
  {
    id: 'int-substitution',
    name: '换元积分法',
    set: 'integral',
    formula: '\\int f(\\varphi(x))\\varphi\'(x) dx = \\int f(u) du',
    mantra: '第一类凑微分，第二类做变量代换',
    condition: 'f 连续，φ 可导且 φ\' 连续，u = φ(x)',
    keywords: ['int', 'f(\\varphi)', "\\varphi'(x)", 'dx', 'du', 'f(u)'],
    difficulty: 2,
  },
  {
    id: 'int-by-parts',
    name: '分部积分法',
    set: 'integral',
    formula: '\\int u \\, dv = uv - \\int v \\, du',
    mantra: '反对幂指三，谁在前谁做 u',
    condition: 'u(x), v(x) 具有连续导数',
    keywords: ['int', 'u', 'dv', 'uv', 'v', 'du'],
    difficulty: 2,
  },
  {
    id: 'int-fundamental-thm',
    name: '变上限积分求导',
    set: 'integral',
    formula: '\\frac{d}{dx}\\int_{a}^{x} f(t) dt = f(x)',
    mantra: '变上限积分求导，就是把上限代入被积函数',
    condition: 'f 在 [a,b] 上连续，则变上限积分在 [a,b] 上可导',
    keywords: ['d/dx', 'int', 'f(t)', 'dt', 'f(x)'],
    difficulty: 2,
  },
  {
    id: 'int-wallis',
    name: '华里士公式',
    set: 'integral',
    formula: '\\int_{0}^{\\pi/2} \\sin^n x dx = \\begin{cases} \\frac{n-1}{n} \\cdot \\frac{n-3}{n-2} \\cdots \\frac{1}{2} \\cdot \\frac{\\pi}{2} & n\\text{偶} \\\\ \\frac{n-1}{n} \\cdot \\frac{n-3}{n-2} \\cdots \\frac{2}{3} \\cdot 1 & n\\text{奇} \\end{cases}',
    mantra: '偶乘π/2，奇乘1，递推双阶乘',
    condition: 'n 为正整数；也适用于 cosⁿx 在 [0, π/2] 的积分',
    keywords: ['int', 'sin^n', 'n-1', 'n', 'n-3', 'n-2'],
    difficulty: 3,
  },
  {
    id: 'int-mvt',
    name: '积分中值定理',
    set: 'integral',
    formula: '\\int_{a}^{b} f(x) dx = f(\\xi)(b-a)',
    mantra: '连续函数定积分，等于区间内某点函数值乘区间长',
    condition: 'f 在 [a,b] 上连续；则存在 ξ ∈ [a,b] 使等式成立',
    keywords: ['int', 'f(x)', 'dx', 'f(\\xi)', 'b-a'],
    difficulty: 2,
  },

  // ===== 级数套组（5张）=====
  {
    id: 'series-geometric',
    name: '几何级数求和',
    set: 'series',
    formula: '\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r} \\quad (|r| < 1)',
    mantra: '公比绝对值小于1，首项除以1减公比',
    condition: '等比级数；|r| < 1 时收敛，|r| ≥ 1 时发散',
    keywords: ['sum', 'ar^n', 'a', '1-r', 'infty'],
    difficulty: 1,
  },
  {
    id: 'series-ratio-root',
    name: '比值与根值判别法',
    set: 'series',
    formula: '\\lim_{n\\to\\infty} \\left| \\frac{a_{n+1}}{a_n} \\right| = \\rho, \\quad \\lim_{n\\to\\infty} \\sqrt[n]{|a_n|} = \\rho',
    mantra: '后项比前项、开n次方，极限小于1收敛大于1发散',
    condition: 'ρ < 1 收敛，ρ > 1 发散，ρ = 1 判别法失效',
    keywords: ['lim', 'a_{n+1}', 'a_n', 'sqrt', '\\rho', 'infty'],
    difficulty: 2,
  },
  {
    id: 'series-leibniz',
    name: '莱布尼茨判别法',
    set: 'series',
    formula: '\\sum_{n=1}^{\\infty} (-1)^{n-1} u_n \\text{ 收敛 } \\iff u_n \\searrow 0',
    mantra: '交错级数：通项递减趋于零就收敛',
    condition: 'u_n > 0，{u_n} 单调递减且 lim u_n = 0',
    keywords: ['sum', '(-1)', 'u_n', '收敛', '递减'],
    difficulty: 2,
  },
  {
    id: 'series-radius',
    name: '幂级数收敛半径',
    set: 'series',
    formula: 'R = \\frac{1}{\\rho}, \\quad \\rho = \\lim_{n\\to\\infty} \\left| \\frac{a_{n+1}}{a_n} \\right|',
    mantra: '收敛半径 = 系数比极限的倒数',
    condition: 'lim |a_{n+1}/a_n| = ρ 存在（或为 ∞）',
    keywords: ['R', 'a_{n+1}', 'a_n', '\\rho', 'lim'],
    difficulty: 2,
  },
  {
    id: 'series-fourier-coeff',
    name: '傅里叶系数公式',
    set: 'series',
    formula: 'a_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\cos nx dx, \\quad b_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\sin nx dx',
    mantra: 'a_n 配余弦，b_n 配正弦，除以周期半长积分',
    condition: 'f(x) 以 2π 为周期且在 [-π, π] 上可积',
    keywords: ['a_n', 'b_n', 'int', 'cos', 'sin', 'nx', 'dx'],
    difficulty: 3,
  },

  // ===== 综合套组（6张）=====
  {
    id: 'adv-green',
    name: '格林公式',
    set: 'advanced',
    formula: '\\oint_L P dx + Q dy = \\iint_D \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) d\\sigma',
    mantra: '闭合曲线积分转二重积分，Q偏x减P偏y',
    condition: 'D 是平面有界闭区域，L 是 D 的正向边界，P, Q 在 D 上具有一阶连续偏导',
    keywords: ['oint', 'P', 'Q', 'dx', 'dy', 'iint', 'partial', 'partial x', 'partial y'],
    difficulty: 4,
  },
  {
    id: 'adv-gauss',
    name: '高斯公式',
    set: 'advanced',
    formula: '\\oiint_\\Sigma P dydz + Q dzdx + R dxdy = \\iiint_\\Omega \\left( \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z} \\right) dv',
    mantra: '曲面积分转三重积分，散度的体积分',
    condition: 'Ω 是空间有界闭区域，Σ 是 Ω 的外侧边界曲面，P, Q, R 一阶连续偏导',
    keywords: ['oiint', 'iiint', 'P', 'Q', 'R', 'partial', 'div'],
    difficulty: 4,
  },
  {
    id: 'adv-stokes',
    name: '斯托克斯公式',
    set: 'advanced',
    formula: '\\oint_\\Gamma P dx + Q dy + R dz = \\iint_\\Sigma \\mathrm{rot} \\mathbf{F} \\cdot d\\mathbf{S}',
    mantra: '空间闭合曲线积分 = 旋度穿过曲面的通量',
    condition: 'Γ 是有向曲面 Σ 的正向边界，P, Q, R 一阶连续偏导',
    keywords: ['oint', 'iint', 'rot', 'P', 'Q', 'R', 'dx', 'dy', 'dz'],
    difficulty: 5,
  },
  {
    id: 'adv-gradient',
    name: '方向导数与梯度',
    set: 'advanced',
    formula: '\\frac{\\partial f}{\\partial l} = \\nabla f \\cdot \\mathbf{l}^\\circ = |\\nabla f| \\cos\\theta',
    mantra: '方向导数 = 梯度点乘方向单位向量，梯度方向增长最快',
    condition: 'f 在该点可微；梯度方向是函数值增长最快的方向',
    keywords: ['nabla', 'grad', 'partial', 'cos', '方向导数'],
    difficulty: 3,
  },
  {
    id: 'adv-lagrange-multiplier',
    name: '拉格朗日乘数法',
    set: 'advanced',
    formula: '\\nabla f = \\lambda \\nabla g, \\quad L = f - \\lambda g',
    mantra: '条件极值：目标梯度平行约束梯度，构造拉格朗日函数',
    condition: '求 f(x,y) 在约束 g(x,y)=0 下的极值；f, g 具有连续偏导且 ∇g ≠ 0',
    keywords: ['nabla', 'lambda', 'L', 'f', 'g', '拉格朗日'],
    difficulty: 3,
  },
  {
    id: 'adv-change-variables',
    name: '重积分换元公式',
    set: 'advanced',
    formula: '\\iint_D f(x,y) dxdy = \\iint_{D\'} f(x(u,v), y(u,v)) |J| dudv',
    mantra: '换元要乘雅可比行列式的绝对值',
    condition: '变换 x=x(u,v), y=y(u,v) 具有连续偏导且雅可比行列式 J ≠ 0',
    keywords: ['iint', 'f(x,y)', 'dxdy', 'J', '雅可比', 'dudv'],
    difficulty: 3,
  },

  // ===== 不等式套组（5张）=====
  {
    id: 'ineq-triangle',
    name: '三角不等式',
    set: 'inequality',
    formula: '|a + b| \\leq |a| + |b|',
    mantra: '两边之和大于第三边，等号当且仅当同号',
    condition: '对任意实数 a, b 成立；向量/复数也满足类似形式',
    keywords: ['|a + b|', '|a|', '|b|', 'leq'],
    difficulty: 1,
  },
  {
    id: 'ineq-am-gm',
    name: '均值不等式 AM ≥ GM',
    set: 'inequality',
    formula: '\\frac{a_1 + a_2 + \\cdots + a_n}{n} \\geq \\sqrt[n]{a_1 a_2 \\cdots a_n}',
    mantra: '算术平均大于等于几何平均，等号当且仅当各数相等',
    condition: 'a₁, a₂, …, a_n 均为非负实数；等号当且仅当 a₁=a₂=…=a_n',
    keywords: ['frac', 'a_1', 'a_n', 'geq', 'sqrt', '算术', '几何'],
    difficulty: 1,
  },
  {
    id: 'ineq-cauchy-schwarz',
    name: '柯西-施瓦茨不等式',
    set: 'inequality',
    formula: '\\left( \\sum_{i=1}^n a_i b_i \\right)^2 \\leq \\left( \\sum_{i=1}^n a_i^2 \\right) \\left( \\sum_{i=1}^n b_i^2 \\right)',
    mantra: '内积方 ≤ 模方乘积，向量成比例时等号成立',
    condition: '对任意实数 a_i, b_i 成立；等号当且仅当 {a_i} 与 {b_i} 成比例',
    keywords: ['sum', 'a_i', 'b_i', 'leq', 'cauchy'],
    difficulty: 2,
  },
  {
    id: 'ineq-integral-chain',
    name: '积分不等式链',
    set: 'inequality',
    formula: '\\left| \\int_a^b f(x)g(x) dx \\right| \\leq \\int_a^b |f(x)g(x)| dx \\leq \\sqrt{\\int_a^b f^2 dx \\int_a^b g^2 dx}',
    mantra: '柯西施瓦茨积分版，绝对值放缩再用内积估计',
    condition: 'f, g 在 [a,b] 上可积；右半部分即积分形式的柯西不等式',
    keywords: ['int', 'f(x)', 'g(x)', 'dx', 'leq', 'sqrt'],
    difficulty: 3,
  },
  {
    id: 'ineq-jensen',
    name: '琴生不等式',
    set: 'inequality',
    formula: 'f(\\lambda_1 x_1 + \\lambda_2 x_2) \\leq \\lambda_1 f(x_1) + \\lambda_2 f(x_2)',
    mantra: '凸函数的加权平均 ≥ 加权平均的函数值',
    condition: 'f 是凸函数（下凸），λ₁+λ₂=1，λᵢ≥0；凹函数则不等号反向',
    keywords: ['f(', 'lambda', 'leq', '凸', 'jensen'],
    difficulty: 3,
  },
];
