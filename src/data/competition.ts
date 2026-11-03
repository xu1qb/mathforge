// EXPORTS: COMPETITION_TOPICS, COMPETITION_SKILLS, type CompetitionTopic, type CompetitionSkill
// 全国大学生数学竞赛（非数学类 A 类）备战数据

export interface CompetitionTopic {
  key: string;
  index: number; // 第几专题
  title: string;
  subtitle: string;
  color: string; // tailwind accent 色
  icon: string; // lucide icon name
  frequency: 'high' | 'medium' | 'low'; // 命题频率
  corePoints: string[];
  // 关联模块跳转路径
  relatedModules: { path: string; label: string }[];
  // 关联练习知识点 key
  relatedPracticeTopics: string[];
}

export const COMPETITION_TOPICS: CompetitionTopic[] = [
  {
    key: 'limit-continuity',
    index: 1,
    title: '函数、极限与连续',
    subtitle: '等价无穷小 · 重要极限 · 夹逼 · 单调有界',
    color: 'emerald',
    icon: 'Infinity',
    frequency: 'high',
    corePoints: [
      '等价无穷小代换与适用条件',
      '两个重要极限及其变形',
      '夹逼准则与单调有界定理',
      '含参极限与积分形式极限',
      '间断点分类（可去/跳跃/无穷/振荡）',
      '连续函数的介值定理与零点定理',
    ],
    relatedModules: [
      { path: '/calculus', label: '微积分模块' },
      { path: '/plot-2d', label: '函数绘图' },
    ],
    relatedPracticeTopics: ['limit-basic', 'limit-special', 'continuity'],
  },
  {
    key: 'single-var-diff',
    index: 2,
    title: '一元函数微分学',
    subtitle: '中值定理 · 高阶导数 · 泰勒展开 · 极值',
    color: 'sky',
    icon: 'FunctionSquare',
    frequency: 'high',
    corePoints: [
      '高阶导数与 n 阶导数公式',
      'Rolle / Lagrange / Cauchy 中值定理',
      '洛必达法则及其失效情形',
      '极值与最值判定',
      '泰勒公式展开（麦克劳林）',
      '中值定理证明题（辅助函数构造）',
    ],
    relatedModules: [
      { path: '/calculus', label: '微积分模块' },
      { path: '/symbolic', label: '符号代数' },
    ],
    relatedPracticeTopics: ['derivative-basic', 'derivative-high-order', 'mean-value-theorem'],
  },
  {
    key: 'single-var-int',
    index: 3,
    title: '一元函数积分学',
    subtitle: '不定积分技巧 · 定积分 · 广义积分',
    color: 'amber',
    icon: 'Integral',
    frequency: 'high',
    corePoints: [
      '不定积分常用技巧（换元/分部/有理函数）',
      '定积分的对称性与奇偶性利用',
      '变上限积分求导',
      '广义积分敛散性判别',
      '积分中值定理',
      '积分与极限结合的综合题',
    ],
    relatedModules: [
      { path: '/calculus', label: '微积分模块' },
    ],
    relatedPracticeTopics: ['indefinite-integral', 'definite-integral', 'improper-integral'],
  },
  {
    key: 'multi-var-diff',
    index: 4,
    title: '多元函数微分学',
    subtitle: '偏导 · 方向导数 · 梯度 · 多元极值',
    color: 'violet',
    icon: 'Layers',
    frequency: 'medium',
    corePoints: [
      '偏导数与全微分',
      '复合函数链式法则',
      '隐函数求导（组）',
      '方向导数与梯度',
      '多元极值与条件极值（拉格朗日乘子法）',
    ],
    relatedModules: [
      { path: '/multivariable', label: '多元微积分' },
      { path: '/plot-3d', label: '3D 曲面' },
    ],
    relatedPracticeTopics: ['partial-derivative', 'gradient', 'multi-var-extremum'],
  },
  {
    key: 'multi-var-int',
    index: 5,
    title: '多元函数积分学',
    subtitle: '二三重积分 · 曲线曲面积分 · Gauss/Stokes',
    color: 'rose',
    icon: 'AreaChart',
    frequency: 'high',
    corePoints: [
      '二重积分（直角坐标/极坐标/换序）',
      '三重积分（柱坐标/球坐标）',
      '第一型/第二型曲线积分',
      '格林公式及其应用',
      '第一型/第二型曲面积分',
      '高斯公式与斯托克斯公式',
    ],
    relatedModules: [
      { path: '/multivariable', label: '多元微积分' },
    ],
    relatedPracticeTopics: ['double-integral', 'triple-integral', 'line-integral'],
  },
  {
    key: 'infinite-series',
    index: 6,
    title: '无穷级数',
    subtitle: '敛散性 · 幂级数 · 傅里叶级数 · 级数求和',
    color: 'indigo',
    icon: 'Sigma',
    frequency: 'high',
    corePoints: [
      '数项级数敛散性判别（优先顺序）',
      '正项级数、交错级数、任意项级数',
      '幂级数收敛域与收敛半径',
      '函数展开成幂级数',
      '傅里叶级数（狄利克雷定理）',
      '级数求和技巧',
    ],
    relatedModules: [
      { path: '/fourier', label: '傅里叶级数' },
      { path: '/calculus', label: '微积分模块' },
    ],
    relatedPracticeTopics: ['series-convergence', 'power-series', 'fourier-basic'],
  },
  {
    key: 'ode',
    index: 7,
    title: '常微分方程',
    subtitle: '一阶方程 · 高阶降阶 · 常系数 · 应用',
    color: 'teal',
    icon: 'GitBranch',
    frequency: 'high',
    corePoints: [
      '一阶方程（可分离/齐次/线性/伯努利）',
      '可降阶的高阶方程',
      '二阶常系数线性微分方程',
      '欧拉方程',
      '微分方程综合应用题',
    ],
    relatedModules: [
      { path: '/ode', label: '常微分方程' },
    ],
    relatedPracticeTopics: ['ode-first-order', 'ode-second-order', 'ode-application'],
  },
  {
    key: 'space-geo',
    index: 8,
    title: '空间解析几何与向量代数',
    subtitle: '向量 · 平面直线 · 曲面 · 二次曲面',
    color: 'orange',
    icon: 'Box',
    frequency: 'low',
    corePoints: [
      '向量的数量积/向量积/混合积',
      '平面方程与直线方程',
      '点到平面/直线的距离',
      '曲面方程（旋转/柱面/锥面）',
      '二次曲面分类与识别',
    ],
    relatedModules: [
      { path: '/plot-3d', label: '3D 曲面' },
      { path: '/linear-algebra', label: '线性代数' },
    ],
    relatedPracticeTopics: ['vector-basic', 'space-plane-line', 'quadric-surface'],
  },
];

export interface CompetitionSkill {
  id: string;
  title: string;
  category: string; // 所属大类
  scenario: string; // 适用场景
  core: string; // 核心方法
  examples: { problem: string; solution: string }[]; // 例题
  pitfalls: string; // 易错点
}

export const COMPETITION_SKILLS: CompetitionSkill[] = [
  {
    id: 'equivalent-infinitesimal',
    title: '等价无穷小代换的适用条件与陷阱',
    category: '极限',
    scenario: '0/0 型极限中，分子或分母为多个无穷小相加/相减时',
    core: '乘除因子可直接代换；加减项须整体为更高阶或确认同阶才可代换。最安全做法：加减情形一律用泰勒展开精确到所需阶数。',
    examples: [
      {
        problem: 'lim(x→0) (tan x - sin x) / x³',
        solution: '【陷阱】若直接代换 tan x ~ x, sin x ~ x → 分子为 0，错误。正确：tan x - sin x = sin x · (1 - cos x)/cos x ~ x · (x²/2) / 1 = x³/2，极限为 1/2。或用泰勒展开到三阶。',
      },
    ],
    pitfalls: '对和差项贸然做等价代换是竞赛中最高频错误之一。记忆口诀：乘除大胆代，加减用泰勒。',
  },
  {
    id: 'taylor-order',
    title: '泰勒公式展开阶数选择技巧',
    category: '极限',
    scenario: '用泰勒展开求极限，或求函数展开前 N 项',
    core: '展开到"分母的阶数 + 1 阶"以保证分子最低阶项不被抵消遗漏。若分子有 k 个相加项，展开到能确定最低阶非零项即可。',
    examples: [
      {
        problem: 'lim(x→0) (eˣ - 1 - x - x²/2) / x³',
        solution: '分母是三阶，因此 eˣ 展开到 x³ 项：eˣ = 1 + x + x²/2 + x³/6 + o(x³)。代入得 (x³/6 + o(x³)) / x³ → 1/6。',
      },
    ],
    pitfalls: '展开阶数不够会导致分子低阶项抵消后只剩高阶误差，得到错误极限 0。展开阶数过多则计算量大，竞赛中以"够用"为原则。',
  },
  {
    id: 'mvt-auxiliary-function',
    title: '中值定理证明的辅助函数构造法',
    category: '微分',
    scenario: 'Rolle / Lagrange 中值定理证明题，需构造满足零点条件的辅助函数',
    core: '把含 ξ 的式子改写为某函数导数的形式，然后用积分/乘积分因子构造原函数 F(x)，验证 F(x) 满足 Rolle 条件。常见模式：f’(ξ) - k·f(ξ) = 0 → F(x) = e^(-kx)·f(x)。',
    examples: [
      {
        problem: 'f 在 [a,b] 连续，(a,b) 可导，f(a)=f(b)=0，证明 ∃ξ∈(a,b)，使得 f’(ξ) + 2f(ξ) = 0',
        solution: '构造 F(x) = e^(2x)·f(x)，则 F(a)=F(b)=0，由 Rolle 定理 ∃ξ，F’(ξ)=0 → e^(2ξ)[2f(ξ)+f’(ξ)]=0 → f’(ξ)+2f(ξ)=0。',
      },
    ],
    pitfalls: '构造时不要遗漏积分常数；乘积分因子 e^∫p(x)dx 是万能套路，遇到含 f’ + p(x)f 形式直接套用。',
  },
  {
    id: 'lhopital-failure',
    title: '洛必达失效情形与处理',
    category: '极限',
    scenario: '洛必达后极限不存在（振荡）或循环，导致无法得出结论',
    core: '洛必达只是充分条件而非必要条件。失效时改用：泰勒展开、等价无穷小、有界乘无穷小、夹逼、数列极限化为函数极限等方法。',
    examples: [
      {
        problem: 'lim(x→∞) (x + sin x) / x',
        solution: '【陷阱】洛必达得 (1+cos x)/1 → cos x 极限不存在，以为原极限不存在。实际：原式 = 1 + (sin x)/x → 1（有界 / ∞ → 0）。',
      },
    ],
    pitfalls: '洛必达用之前先判断类型和条件；遇到 sin/cos 的振荡型极限，洛必达几乎必然失效，优先考虑有界量乘无穷小。',
  },
  {
    id: 'integral-symmetry',
    title: '定积分的对称性与奇偶性利用',
    category: '积分',
    scenario: '对称区间上的定积分计算，或利用变量替换构造对称性',
    core: '奇函数在对称区间积分 = 0；偶函数对称区间积分 = 2 倍半区间。更一般地：∫[-a,a] f(x)dx = ∫[0,a] [f(x)+f(-x)]dx，不需要知道奇偶性也能用。',
    examples: [
      {
        problem: '∫[-1,1] (x² + x·e^|x|) / (1 + e^(-x²)) dx',
        solution: '观察分母为偶函数，分子中 x·e^|x| 为奇函数（整体奇），其积分 = 0。原式 = ∫[-1,1] x² / (1+e^(-x²)) dx。再用对称技巧 = 2∫[0,1] x² / (1+e^(-x²)) · (1+e^(-x²))/2？ 直接数值积分即可。',
      },
    ],
    pitfalls: '不要被复杂的分母迷惑，先判断整体奇偶性或拆成奇偶两部分再算。竞赛题的对称区间几乎总是考这个点。',
  },
  {
    id: 'integral-limit-exchange',
    title: '积分号下取极限（积分与极限互换）',
    category: '综合',
    scenario: '含参数积分取极限，或 lim ∫ f_n(x) dx 形式',
    core: '一致收敛时可互换；竞赛中常用控制收敛定理（Lebesgue）的简化情形：|f_n(x)| ≤ g(x) 且 g 可积，则 lim ∫ f_n = ∫ lim f_n。更简单的夹逼法：估计积分绝对值，用积分中值定理或放缩。',
    examples: [
      {
        problem: 'lim(n→∞) ∫[0,1] xⁿ / (1 + x) dx',
        solution: '方法一（夹逼）：0 ≤ xⁿ/(1+x) ≤ xⁿ，∫[0,1] xⁿ dx = 1/(n+1) → 0，故原极限为 0。方法二（控制收敛）：|xⁿ/(1+x)| ≤ 1，逐点收敛到 0（x<1）或 1/2（x=1），由控制收敛定理极限为 0。',
      },
    ],
    pitfalls: '不能直接把极限放进积分号！必须先论证可交换性（一致收敛 / 控制收敛 / 夹逼估计）。竞赛答题时若省略论证会丢分。',
  },
  {
    id: 'double-integral-switch-order',
    title: '二重积分换序的图形判断法',
    category: '多元',
    scenario: '积分顺序不当时计算困难，或被积函数无初等原函数',
    core: '先画图确定积分区域形状，再把"X 型描述"换成"Y 型描述"（或反之）。X 型：a≤x≤b, y₁(x)≤y≤y₂(x) → Y 型：c≤y≤d, x₁(y)≤x≤x₂(y)。关键是正确写出边界方程的反函数。',
    examples: [
      {
        problem: '∫[0,1] ∫[x,1] e^(-y²) dy dx',
        solution: 'e^(-y²) 无初等原函数，必须换序。区域：0≤x≤1, x≤y≤1 → 换为 0≤y≤1, 0≤x≤y。原式 = ∫[0,1] ∫[0,y] e^(-y²) dx dy = ∫[0,1] y·e^(-y²) dy = -½ e^(-y²)|[0,1] = ½(1 - e⁻¹)。',
      },
    ],
    pitfalls: '换序时积分限不能直接对调！必须画区域图重新写边界。尤其注意"曲线作为边界"时，反函数的定义域要跟原函数的值域严格对应。',
  },
  {
    id: 'series-test-order',
    title: '级数敛散性判别的优先顺序',
    category: '级数',
    scenario: '给定数项级数，用何种方法判定敛散性',
    core: '判别顺序：① 必要条件（通项→0？不→发散）② 正项→比值/根值（含阶乘/指数时首选）→ 积分/比较（p级数、等价无穷小）③ 交错→莱布尼茨判别 ④ 任意项→绝对收敛？⑤ 条件收敛需用狄利克雷/阿贝尔判别。',
    examples: [
      {
        problem: '判断 ∑ (n=1→∞) n! / nⁿ 的敛散性',
        solution: '含阶乘，首选比值法。a_{n+1}/a_n = (n+1)!/(n+1)^(n+1) · nⁿ/n! = nⁿ/(n+1)ⁿ = 1/(1+1/n)ⁿ → 1/e < 1。由比值判别法，级数收敛。',
      },
    ],
    pitfalls: '比值/根值法方便但适用范围窄（只对指数/阶乘型敏感）；通项为有理函数或慢变化型必须用比较判别法（和 p 级数比较）。',
  },
  {
    id: 'ode-substitution',
    title: '微分方程换元技巧（齐次/伯努利/可降阶）',
    category: '常微分方程',
    scenario: '非线性或高阶微分方程，通过变量替换化为已知可解类型',
    core: '齐次方程 → 令 u = y/x → 可分离；伯努利方程 y\' + P(x)y = Q(x)yⁿ → 令 z = y^(1-n) → 线性；y⁽ⁿ⁾=f(x) → 累次积分；y\'\'=f(y,y\') → 令 p = y\'，则 y\'\' = p dp/dy → 降为一阶。',
    examples: [
      {
        problem: "解 dy/dx = (x+y)²",
        solution: "令 u = x + y → du/dx = 1 + dy/dx = 1 + u²，分离变量：du/(1+u²) = dx → arctan u = x + C → u = tan(x+C) → y = tan(x+C) - x。",
      },
    ],
    pitfalls: '换元后要记得代回原变量；伯努利方程 n=0 和 n=1 是线性/齐次特殊情形，不需换元直接解。',
  },
  {
    id: 'lagrange-multiplier',
    title: '拉格朗日乘子法的实际使用要点',
    category: '多元',
    scenario: '多元函数在约束条件下的极值问题（等式约束）',
    core: '目标函数 f(x,y,z) + 约束 g(x,y,z)=0 → L = f - λ g，求偏导为零的方程组。技巧：① 利用对称性推断变量关系 ② 先求偏导比消去 λ ③ 边界与内部分开讨论 ④ 多个约束时用多个乘子。',
    examples: [
      {
        problem: '求 f(x,y,z)=xyz 在约束 x+y+z=3, x,y,z>0 下的最大值',
        solution: 'L = xyz - λ(x+y+z-3)。偏导：yz = λ, xz = λ, xy = λ。由对称性 x=y=z，代入约束得 x=y=z=1，最大值为 1。',
      },
    ],
    pitfalls: '拉格朗日乘子法只给出驻点，是否为极值/最值需要结合几何意义或二阶条件判断；边界点和不可导点容易遗漏。',
  },
  // ===== 新增 12 条 =====
  {
    id: 'one-power-infinity',
    title: '1^∞ 型极限速算法',
    category: '极限',
    scenario: '形如 lim f(x)^g(x)，其中 f(x)→1, g(x)→∞ 的幂指型极限',
    core: '利用恒等式 u^v = e^(v·ln u)，当 u→1 时 ln u = ln(1+(u-1)) ~ u-1，故 lim u^v = e^(lim v·(u-1))。条件：必须验证 f→1 且 g→∞，且 (f-1)·g 的极限存在。',
    examples: [
      {
        problem: 'lim(x→0) (cos x)^(1/x²)',
        solution: '1^∞ 型。cos x - 1 ~ -x²/2。原式 = exp[lim (1/x²)·(cos x - 1)] = exp[lim (1/x²)·(-x²/2)] = exp(-1/2) = e^(-1/2)。',
      },
    ],
    pitfalls: '只有真正的 1^∞ 型才可用；若底数的极限不是 1，不能套用。遇到更复杂情形用标准的 exp-ln 展开法最稳妥。',
  },
  {
    id: 'more-equivalents',
    title: '竞赛常用高阶等价无穷小',
    category: '极限',
    scenario: '求极限时需要精确到三阶或更高阶的等价代换',
    core: '熟记以下常用等价（x→0 时）：tan x - x ~ x³/3；x - sin x ~ x³/6；tan x - sin x ~ x³/2；x - arcsin x ~ -x³/6；x - arctan x ~ x³/3；eˣ - 1 - x ~ x²/2；ln(1+x) - x ~ -x²/2。这些均由泰勒展开得来，建议推导后记忆。',
    examples: [
      {
        problem: 'lim(x→0) (x - arctan x) / (sin x - tan x)',
        solution: '分子 ~ x³/3；分母 tan x - sin x ~ x³/2 → sin x - tan x ~ -x³/2。原式 = (x³/3) / (-x³/2) = -2/3。',
      },
    ],
    pitfalls: '等价无穷小只能在乘除因子位置代换；加减情形必须用泰勒展开精确到足够阶数。记忆时注意正负号和系数，记错比不会更危险。',
  },
  {
    id: 'integral-estimation',
    title: '定积分估值技巧大全',
    category: '积分',
    scenario: '证明积分不等式或估计积分值的范围',
    core: '常用方法：① 估值定理：m(b-a) ≤ ∫_a^b f(x)dx ≤ M(b-a) ② 中值定理：∫_a^b f(x)g(x)dx = f(ξ)∫_a^b g(x)dx ③ 放缩法：找到比 f 大/小且易积的函数 ④ 利用单调性：若 f 递增则 f(a)(b-a) ≤ ∫f ≤ f(b)(b-a) ⑤ 凸函数用 Jensen 不等式。',
    examples: [
      {
        problem: '证明：π/2 < ∫[0,π/2] sin x / x dx < π/2？（不，用中值定理）',
        solution: 'sin x / x 在 (0,π/2] 上单调递减。故在 [0,π/2] 上，最小值在 π/2 处：sin(π/2)/(π/2) = 2/π；最大值在 0 处：lim = 1。由估值定理：(2/π)·π/2 = 1 < ∫_0^{π/2} (sin x/x)dx < 1·π/2 = π/2。',
      },
    ],
    pitfalls: '使用积分第一中值定理时，g(x) 必须不变号；估值定理给出的范围可能较松，需要结合放缩法收紧。',
  },
  {
    id: 'variable-upper-limit-derivative',
    title: '变上限积分求导链全解',
    category: '积分',
    scenario: '被积函数含参变量、上下限为函数的变限积分求导',
    core: '基本公式：d/dx ∫_{a(x)}^{b(x)} f(t)dt = f(b(x))·b\'(x) - f(a(x))·a\'(x)。若被积函数含 x：必须先把 x 分离到积分外（提取、拆分）再求导，或用含参积分求导公式（莱布尼茨法则）。',
    examples: [
      {
        problem: '求 d/dx ∫[0,x] (x-t)f(t) dt',
        solution: '被积函数含 x，先拆分：原式 = d/dx [x·∫_0^x f(t)dt - ∫_0^x t·f(t)dt] = ∫_0^x f(t)dt + x·f(x) - x·f(x) = ∫_0^x f(t)dt。结论：这是卷积型变限积分，求导后降为一重积分。',
      },
    ],
    pitfalls: '被积函数含 x 时绝不能直接把上限代入！必须先把 x 从积分号里「拎出来」（作为常数因子提取，或变量替换化到上下限），再求导。',
  },
  {
    id: 'mvt-three-patterns',
    title: '中值定理证明的三大构造模式',
    category: '微分',
    scenario: '竞赛中值证明题，需快速选择辅助函数构造方法',
    core: '模式① 原函数法：把 ξ 换成 x，整理成 F\'(x)=0 的形式，积分得 F(x)。模式② 指数因子法：遇到 f\'(ξ) + p(ξ)f(ξ) = 0，乘子 e^{∫p(x)dx}，即 F(x) = f(x)·e^{∫p(x)dx}。模式③ 柯西中值变形：遇到 f\'(ξ)/g\'(ξ) 形式，考虑柯西中值定理 [f(b)-f(a)]/[g(b)-g(a)] = f\'(ξ)/g\'(ξ)。',
    examples: [
      {
        problem: 'f(x) 在 [0,1] 可导，f(0)=0, f(1)=1，证明 ∃ξ∈(0,1) 使 f\'(ξ) = 2ξ·f(ξ)',
        solution: '整理为 f\'(x) - 2x·f(x) = 0，这是模式②。p(x) = -2x，∫p(x)dx = -x²。构造 F(x) = f(x)·e^(-x²)。F(0)=0·1=0。F(1) 不一定为 0，再找一点... 若加条件 f(1)=1 不够。改用原函数法需结合条件。',
      },
    ],
    pitfalls: '构造出 F(x) 后必须验证 F 在两端点值相等（满足 Rolle 条件），若不相等则需用 Lagrange 或换一种构造。指数因子法是万能模板，优先尝试。',
  },
  {
    id: 'symmetric-interval-trick',
    title: '对称区间积分的快速化简',
    category: '积分',
    scenario: '积分区间具有某种对称性（中心对称、平移对称、三角对称）',
    core: '① 奇零偶倍：对称区间[-a,a] 上奇函数积分为 0。② 万能公式：∫[-a,a] f(x)dx = ∫[0,a] [f(x)+f(-x)]dx。③ 平移对称：∫[0,a] f(x)dx = ∫[0,a] f(a-x)dx。④ 三角经典：∫[0,π/2] f(sin x)dx = ∫[0,π/2] f(cos x)dx；∫[0,π] x·f(sin x)dx = (π/2)∫[0,π] f(sin x)dx。',
    examples: [
      {
        problem: '∫[0,π] x·sin x / (1+cos²x) dx',
        solution: '利用公式 ∫[0,π] x·f(sin x)dx = (π/2)∫[0,π] f(sin x)dx。令 f(sin x) = sin x/(1+cos²x) = sin x/(2-sin²x)。则 I = (π/2)∫[0,π] sin x/(1+cos²x) dx。令 u=cos x，= -π/2 ∫[1,-1] du/(1+u²) = (π/2)·[arctan u]|_{-1}^{1} = (π/2)·(π/4 - (-π/4)) = π²/4。',
      },
    ],
    pitfalls: '使用三角对称替换时，要注意 f 的自变量必须是 sin x（或 cos x）的纯函数，不能有额外的 x 因子。公式 ④ 的核心是把 x 系数转化为 π/2 常数因子。',
  },
  {
    id: 'polar-coordinate-judgment',
    title: '二重积分何时必须用极坐标',
    category: '多元',
    scenario: '选择直角坐标还是极坐标计算二重积分',
    core: '优先极坐标的情形：① 积分区域是圆域 / 扇形 / 环形 ② 被积函数含 x²+y² 或 √(x²+y²) ③ 直角坐标下被积函数积不出来。判断 r 范围的方法：从原点作一条射线，穿入点为下限，穿出点为上限。θ 范围由积分区域的极角范围决定。',
    examples: [
      {
        problem: '∬_D e^(-x²-y²) dσ，D: x²+y² ≤ a²',
        solution: '被积函数含 x²+y² 且 e^(-x²) 无初等原函数，必须极坐标。I = ∫[0,2π] dθ ∫[0,a] e^(-r²) · r dr = 2π · [-½ e^(-r²)]|_0^a = π(1 - e^(-a²))。（这是概率论正态分布积分的基础）',
      },
    ],
    pitfalls: '极坐标变换不要忘记雅可比因子 r（面积元素 dxdy = r dr dθ）。确定 r 的下限时，若原点在区域内部则下限为 0；若原点在区域外，先找穿入边界再求 r(θ)。',
  },
  {
    id: 'series-sum-by-fourier',
    title: '级数求和的傅里叶法',
    category: '级数',
    scenario: '求 Σ 1/n²、Σ (-1)ⁿ/n²、Σ 1/n⁴ 等特殊数值级数的和',
    core: '利用已知函数的傅里叶展开，代入特殊点 x 值得到数值级数和。经典结果：f(x)=x² 在 [-π,π] 展开得 Σ_{n=1}^∞ 1/n² = π²/6；Σ (-1)^{n+1}/n² = π²/12。f(x)=x⁴ 展开可得 Σ 1/n⁴ = π⁴/90。',
    examples: [
      {
        problem: '求 S = Σ_{n=1}^∞ 1/n²',
        solution: '将 f(x)=x² 在 [-π,π] 展开为傅里叶级数（偶函数，只有余弦项）：a₀ = (2/π)∫₀^π x²dx = 2π²/3；a_n = (2/π)∫₀^π x²·cos(nx)dx = 4·(-1)ⁿ/n²。故 x² = π²/3 + 4 Σ (-1)ⁿ cos(nx)/n²。令 x=π：π² = π²/3 + 4 Σ 1/n² → Σ 1/n² = π²/6。',
      },
    ],
    pitfalls: '使用傅里叶法的前提是函数在该点连续（或为第一类间断点且取左右极限平均）。不连续点的级数和要用狄利克雷收敛定理修正。',
  },
  {
    id: 'power-series-sum-methods',
    title: '幂级数求和三大法',
    category: '级数',
    scenario: '求幂级数的和函数',
    core: '方法① 逐项求导法：含 1/n 因子时先求导消去分母，求出和后再积分还原。方法② 逐项积分法：含 n+1 等因子时先积分降次，再求导还原。方法③ 建立微分方程：系数含递推关系时，和函数满足某微分方程，解方程得和函数。三种方法都需要先求收敛域。',
    examples: [
      {
        problem: '求 Σ_{n=1}^∞ x^{n+1} / [n(n+1)] 的和函数',
        solution: '两次逐项求导：设 S(x) = Σ x^{n+1}/[n(n+1)]。S\'(x) = Σ xⁿ/n = -ln(1-x)。再积分：S(x) = -∫_0^x ln(1-t)dt = (1-x)ln(1-x) + x。收敛域 [-1, 1]。',
      },
    ],
    pitfalls: '逐项求导/积分后收敛半径不变，但端点敛散性可能变化，必须重新检验端点。积分时不要遗漏初始条件 S(0) 的影响。',
  },
  {
    id: 'reducible-ode-recognition',
    title: '高阶可降阶 ODE 的识别套路',
    category: '常微分方程',
    scenario: '二阶以上微分方程，通过变量替换降为一阶',
    core: "类型① 缺 y 型：y'' = f(x, y') → 令 p = y'，则 y'' = p'，化为一阶 dp/dx = f(x, p)。类型② 缺 x 型：y'' = f(y, y') → 令 p = y'，视 y 为自变量，则 y'' = dp/dx = dp/dy · dy/dx = p·dp/dy，化为一阶 p·dp/dy = f(y, p)。类型③ 全微分型：乘以积分因子后可直接积分降阶。",
    examples: [
      {
        problem: "解方程 y·y'' = (y')²",
        solution: "缺 x 型（不显含 x）。令 p = y'，则 y'' = p dp/dy。代入：y·p dp/dy = p²。若 p≠0，约去 p：y·dp/dy = p → dp/p = dy/y → ln p = ln y + C → p = C₁y → dy/dx = C₁y → y = C₂·e^{C₁x}。若 p=0 即 y=常数 也包含在上式中（C₁=0）。",
      },
    ],
    pitfalls: '降阶后约去因子时注意不要丢解（如 p=0 的情形），最后要验证被约掉的解是否包含在通解中。',
  },
  {
    id: 'parametric-integral',
    title: '含参积分的求导技巧（莱布尼茨公式）',
    category: '积分',
    scenario: '被积函数或积分上下限含有参数，对参数求导',
    core: '莱布尼茨公式：d/dα ∫_{a(α)}^{b(α)} f(x,α) dx = f(b(α),α)·b\'(α) - f(a(α),α)·a\'(α) + ∫_{a(α)}^{b(α)} ∂f/∂α dx。应用：① 求含参积分值（含 Γ 函数、Beta 函数、高斯积分）② 求定积分的参数法（引入参数 α，先微分后积分）。竞赛中常用于 ∫₀^∞ sin x / x dx = π/2 等经典积分。',
    examples: [
      {
        problem: '求 I(α) = ∫[0,∞] e^(-αx) · sin x / x dx (α>0)',
        solution: '对 α 求导：I\'(α) = ∫₀^∞ e^(-αx) · (-sin x) dx = -1/(1+α²)。积分：I(α) = -arctan α + C。当 α→+∞ 时，I(α)→0，得 C = π/2。故 I(α) = π/2 - arctan α。令 α→0+，得 ∫₀^∞ sin x/x dx = π/2。',
      },
    ],
    pitfalls: '必须验证积分号下求导的合法性（一致收敛性）。在 [α₀, +∞)（α₀>0）上一致收敛，故可以求导；α=0 时要单独讨论极限。',
  },
  {
    id: 'series-comparison-classics',
    title: '竞赛经典放缩与比较判别',
    category: '级数',
    scenario: '用比较判别法证明级数敛散性，或估计部分和',
    core: '经典放缩对：① 1/(n²+n) < 1/n² < 1/(n²-n) = 1/(n-1) - 1/n（裂项）② e 的级数定义：e = Σ 1/n!，故 1/n! < 1/2^{n-1}（从 n≥2 起 n! ≥ 2^{n-1}）③ 调和级数 H_n ~ ln n + γ，发散 ④ 积分检验：∫_2^∞ 1/(x·ln x)dx → ∞，故 Σ 1/(n·ln n) 发散。这些放缩是竞赛证明题的常用工具。',
    examples: [
      {
        problem: '证明 Σ_{n=1}^∞ 1/n² 收敛，并估计其和的范围',
        solution: '1/n² < 1/(n²-n) = 1/(n-1) - 1/n（n≥2）。故 Σ_{n=2}^∞ 1/n² < Σ_{n=2}^∞ [1/(n-1)-1/n] = 1（裂项相消，余项为 1）。加上首项 1，和 < 2。又显然有 Σ 1/n² > 1 + 1/4 = 1.25。故和在 (1.25, 2) 之间（精确值 π²/6 ≈ 1.645）。',
      },
    ],
    pitfalls: '放缩要适度——放得太松达不到目的，太紧又计算复杂。竞赛中通常需要放缩到可求和（如 p 级数、等比级数、裂项）的程度。',
  },
];

// 官方参考书目
export const COMPETITION_BOOKS = [
  {
    title: '全国大学生数学竞赛参赛指南',
    author: '余志坤 主编',
    publisher: '科学出版社',
    note: '官方指定参考，含竞赛大纲、样卷与解题指导',
  },
  {
    title: '全国大学生数学竞赛真题解析',
    author: '竞赛命题研究组',
    publisher: '高等教育出版社',
    note: '历年真题 + 详细解析 + 获奖名单参考',
  },
  {
    title: '全国大学生数学竞赛解析教程（非数学专业类）',
    author: '陈启宏 等编',
    publisher: '上下册',
    note: '分专题系统讲解，适合全面复习',
  },
];
