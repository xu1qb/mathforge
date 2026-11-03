// EXPORTS: TRAP_CATEGORIES, TrapCategory, TrapPoint, TrapQuestion, getTrapQuestionsByCategory, getAllTrapQuestions, getTrapQuestionsByTopic
// 易错陷阱题集：6 大类别 × 每类 4-6 条陷阱点 × 每类 4 道配套陷阱题

export interface TrapPoint {
  id: string;
  /** 陷阱描述 */
  title: string;
  /** 错误解法（错误示范） */
  wrongExample: string;
  /** 正确解法 */
  correctExample: string;
  /** 一句话口诀/提醒 */
  reminder: string;
}

export interface TrapQuestion {
  id: string;
  categoryId: string;
  topicKey: string; // 对应 8 大专题 key
  type: 'fill-blank' | 'calculation';
  difficulty: 1 | 2 | 3;
  /** 题目（LaTeX） */
  problem: string;
  /** 答案 */
  answer: string;
  /** 解析（含 "易错点" 标注） */
  solution: string;
  /** 关联的陷阱点 id */
  relatedTrapId: string;
  /** 分值 */
  score: number;
}

export interface TrapCategory {
  id: string;
  name: string;
  /** 对应 8 大专题 key */
  topicKey: string;
  description: string;
  trapPoints: TrapPoint[];
}

export const TRAP_CATEGORIES: TrapCategory[] = [
  // ============ 1. 极限与连续 ============
  {
    id: 'limit',
    name: '极限与连续',
    topicKey: 'limit-continuity',
    description: '等价无穷小、洛必达法则、未定式等高频陷阱',
    trapPoints: [
      {
        id: 'limit-equiv-add',
        title: '等价无穷小代换只能用于乘除，不能直接用于加减',
        wrongExample:
          'lim(x→0) (tan x - sin x) / x³ ≠ lim(x→0) (x - x) / x³ = 0\n（错误：分子是减号，不能分别代换）',
        correctExample:
          'lim(x→0) (tan x - sin x) / x³\n= lim(x→0) sin x(1 - cos x) / (x³ cos x)\n= lim(x→0) x · (x²/2) / x³ = 1/2\n（正确：先变形为乘积形式再代换）',
        reminder: '加减不代换，乘除才代换',
      },
      {
        id: 'limit-lhopital-abuse',
        title: '洛必达法则滥用：不是 0/0 或 ∞/∞ 也用',
        wrongExample:
          'lim(x→0) (1 - cos x) / (x + x²)\n用洛必达：lim(x→0) sin x / (1 + 2x) = 0 / 1 = 0\n（虽然结果对，但此处原极限其实是 0/1 型，不能直接用洛必达）',
        correctExample:
          '使用洛必达前必先验证未定式类型：\nlim(x→0) (1 - cos x) = 0，lim(x→0) (x + x²) = 0 ✔ 0/0 型\n→ 可用洛必达：lim sin x / (1+2x) = 0\n\n若 lim g(x) ≠ 0，则不能用洛必达！',
        reminder: '洛必达前先判型：0/0 或 ∞/∞ 才能用',
      },
      {
        id: 'limit-zero-infty',
        title: '0·∞ 未定式需先转化为 0/0 或 ∞/∞',
        wrongExample:
          'lim(x→0+) x · ln x ≠ 0 · (-∞) = 0\n（错误：0 乘无穷大是未定式，结果不一定为 0）',
        correctExample:
          'lim(x→0+) x · ln x\n= lim(x→0+) ln x / (1/x)   （∞/∞ 型）\n= lim(x→0+) (1/x) / (-1/x²)   （洛必达）\n= lim(x→0+) (-x) = 0',
        reminder: '0·∞ 要变型，倒一个分母',
      },
      {
        id: 'limit-inf-minus-inf',
        title: '∞ - ∞ 未定式：通分或有理化后再求极限',
        wrongExample:
          'lim(x→+∞) (√(x²+x) - x) ≠ ∞ - ∞ = 0\n（错误：无穷减无穷是未定式）',
        correctExample:
          'lim(x→+∞) (√(x²+x) - x)\n= lim [ (√(x²+x) - x)(√(x²+x) + x) ] / (√(x²+x) + x)\n= lim x / (√(x²+x) + x)\n= lim 1 / (√(1+1/x) + 1) = 1/2',
        reminder: '∞-∞ 要通分/有理化',
      },
      {
        id: 'limit-continuity-piecwise',
        title: '分段函数分界点需分别讨论左右极限',
        wrongExample:
          'f(x) = { x+1, x>0; x-1, x≤0 }，x→0 时极限 = 1\n（错误：仅算了右极限）',
        correctExample:
          'lim(x→0+) f(x) = lim(x→0+) (x+1) = 1\nlim(x→0-) f(x) = lim(x→0-) (x-1) = -1\n左右极限不相等 → x=0 处极限不存在',
        reminder: '分段点求极限：左右都要算',
      },
    ],
  },

  // ============ 2. 一元微分 ============
  {
    id: 'diff',
    name: '一元微分',
    topicKey: 'single-var-diff',
    description: '复合函数、隐函数、中值定理等高频陷阱',
    trapPoints: [
      {
        id: 'diff-chain-miss',
        title: '复合函数求导遗漏内层导数',
        wrongExample:
          '(sin 2x)\' ≠ cos 2x\n（错误：漏掉了内层 2x 的导数 2）',
        correctExample:
          '(sin 2x)\' = cos 2x · (2x)\' = 2 cos 2x\n链式法则：[f(g(x))]\' = f\'(g(x)) · g\'(x)，一层都不能漏',
        reminder: '链式法则层层剥，一层都不能漏',
      },
      {
        id: 'diff-implicit-miss',
        title: '隐函数求导忘记 y 是 x 的函数，漏乘 y\'',
        wrongExample:
          'x² + y² = 1 两边对 x 求导：\n2x + 2y = 0 → y\' = -x/y\n（错误：y² 求导是 2y·y\'，不是 2y）',
        correctExample:
          'x² + y² = 1 对 x 求导：\n2x + 2y · y\' = 0\n→ y\' = -x/y\n（注意：y 是 x 的函数，y² 导数要用链式法则）',
        reminder: '隐函数求导：y 是 x 的函数，别忘了 y\'',
      },
      {
        id: 'diff-abs-notdiff',
        title: '绝对值函数在尖点处不可导',
        wrongExample:
          'f(x) = |x|，f\'(0) = 0\n（错误：x=0 是尖点，不可导）',
        correctExample:
          'f(x) = |x| 在 x=0 处：\nf\'_+(0) = lim(h→0+) |h|/h = 1\nf\'_-(0) = lim(h→0-) |h|/h = -1\n左右导数不相等 → f(x) 在 x=0 处不可导',
        reminder: '尖点、折角处不可导',
      },
      {
        id: 'diff-rolle-condition',
        title: '中值定理使用前必须验证条件',
        wrongExample:
          'f(x) = x 在 [0,1] 上 f(0)=0, f(1)=1，\n由罗尔定理，存在 ξ 使 f\'(ξ) = 0\n（错误：f(0) ≠ f(1)，罗尔定理条件不满足）',
        correctExample:
          '罗尔定理三条件：闭连续、开可导、端点等\nf(0)=0 ≠ f(1)=1 → 不满足罗尔定理条件\n\n应使用拉格朗日中值定理：\nf\'(ξ) = (f(1)-f(0))/(1-0) = 1',
        reminder: '中值定理先验条件，不要想当然',
      },
    ],
  },

  // ============ 3. 一元积分 ============
  {
    id: 'integral',
    name: '一元积分',
    topicKey: 'single-var-int',
    description: '换元回代、绝对值、奇偶性、变上限积分等陷阱',
    trapPoints: [
      {
        id: 'int-substitute-back',
        title: '换元积分后忘记回代原变量',
        wrongExample:
          '∫ √(2x+1) dx，令 u=2x+1，du=2dx\n= (1/2) ∫ √u du = (1/2) · (2/3) u^(3/2)\n= (1/3) u^(3/2) + C\n（错误：不定积分必须回代为 x）',
        correctExample:
          '∫ √(2x+1) dx = (1/3) u^(3/2) + C\n= (1/3) (2x+1)^(3/2) + C\n\n定积分换元要换上下限，不需要回代；\n不定积分换元必须回代！',
        reminder: '不定积分换元：最后一定记得回代',
      },
      {
        id: 'int-1x-abs',
        title: '∫ 1/x dx = ln|x| + C，不要漏绝对值',
        wrongExample:
          '∫ (1/x) dx = ln x + C\n（错误：x<0 时 ln x 无意义）',
        correctExample:
          '∫ (1/x) dx = ln|x| + C\n\nx>0 时导数为 1/x ✔\nx<0 时 [ln(-x)]\' = (1/(-x))·(-1) = 1/x ✔\n绝对值保证了 x<0 时也有意义',
        reminder: '∫1/x dx = ln|x|+C，绝对值别忘',
      },
      {
        id: 'int-odd-misuse',
        title: '奇偶函数积分性质误用：忽略对称区间条件',
        wrongExample:
          '∫₀¹ x³ dx = 0（因为是奇函数）\n（错误：积分区间 [0,1] 不对称）',
        correctExample:
          '奇偶积分性质：必须在对称区间 [-a, a] 上\n∫_{-a}^{a} 奇函数 dx = 0\n∫_{-a}^{a} 偶函数 dx = 2 ∫₀^a 偶函数 dx\n\n非对称区间：老老实实算\n∫₀¹ x³ dx = 1/4',
        reminder: '奇偶积分要对称，不对称就别偷懒',
      },
      {
        id: 'int-var-upper',
        title: '变上限积分求导漏掉上限函数的导数',
        wrongExample:
          'd/dx ∫₀^{x²} sin t dt ≠ sin(x²)\n（错误：上限是 x²，要用链式法则乘以上限导数）',
        correctExample:
          'd/dx ∫₀^{u(x)} f(t) dt = f(u(x)) · u\'(x)\n\n→ d/dx ∫₀^{x²} sin t dt = sin(x²) · 2x = 2x·sin(x²)',
        reminder: '变上限求导：f(上限)×上限导',
      },
      {
        id: 'int-improper-abs',
        title: '反常积分收敛需绝对值收敛吗？（条件收敛与绝对收敛）',
        wrongExample:
          '∫₁^∞ (sin x)/x dx 不绝对收敛 → 发散\n（错误：不绝对收敛不一定发散，可能条件收敛）',
        correctExample:
          '∫₁^∞ (sin x)/x dx 条件收敛：\n不绝对收敛（|sin x/x| ≥ sin²x/x，可证发散），\n但由狄利克雷判别法，原积分是收敛的。\n\n绝对收敛 ⇒ 收敛，反之不成立',
        reminder: '绝对收敛强，条件收敛弱',
      },
    ],
  },

  // ============ 4. 多元 ============
  {
    id: 'multi',
    name: '多元微分与积分',
    topicKey: 'multi-var-diff',
    description: '偏导与可微、链式法则、格林公式、极值判别等陷阱',
    trapPoints: [
      {
        id: 'multi-partial-ne-diff',
        title: '偏导存在 ≠ 可微',
        wrongExample:
          'f(x,y) 在 (0,0) 处两个偏导都存在 → f 在 (0,0) 处可微\n（错误：偏导存在只是可微的必要条件，不是充分条件）',
        correctExample:
          '可微的定义：\nΔz = f_x·Δx + f_y·Δy + o(ρ)，其中 ρ=√(Δx²+Δy²)\n\n经典反例 f(x,y)=|x|+|y|：\n(0,0) 处偏导不存在 → 不可微\n\n反例 f(x,y)=xy/√(x²+y²)（f(0,0)=0）：\n偏导都存在（=0），但可微性验证失败 → 偏导存在但不可微',
        reminder: '偏导存在是可微的必要不充分条件',
      },
      {
        id: 'multi-chain-sign',
        title: '复合函数偏导符号混淆：∂z/∂x 和 dz/dx',
        wrongExample:
          'z = f(x, y)，y = g(x)，则 dz/dx = ∂z/∂x\n（错误：全导 ≠ 偏导）',
        correctExample:
          '全导数公式（链式法则）：\ndz/dx = ∂z/∂x + ∂z/∂y · dy/dx\n\n∂z/∂x 是把 y 看作常数对 x 求偏导；\ndz/dx 是 z 作为 x 的一元函数的全导数。',
        reminder: '偏导 ∂ 和全导 d，写法不同含义不同',
      },
      {
        id: 'multi-green-direction',
        title: '格林公式：闭合曲线方向为正向（逆时针），否则加负号',
        wrongExample:
          '顺时针闭合曲线 L，直接用格林公式\n∮_L Pdx+Qdy = ∬_D (∂Q/∂x - ∂P/∂y) dσ\n（错误：格林公式要求正向——逆时针）',
        correctExample:
          '格林公式：∮_L Pdx+Qdy = ∬_D (∂Q/∂x - ∂P/∂y) dσ\nL 必须是正向闭合（逆时针）\n\n若 L 是顺时针：\n∮_L = - ∮_{L⁺} = - ∬_D (∂Q/∂x - ∂P/∂y) dσ\n\n若区域有洞（复连通）：外边界逆时针，内边界顺时针',
        reminder: '格林公式正向逆，顺时针要加负号',
      },
      {
        id: 'multi-extreme-acb2',
        title: '二元极值判别：别忘 AC - B² 的顺序',
        wrongExample:
          '极值判别式 = A C + B² → 大于 0 有极值\n（错误：判别式是 AC - B²）',
        correctExample:
          '设 A = f_xx, B = f_xy, C = f_yy\n判别式 Δ = AC - B²\n\nΔ > 0 且 A > 0 → 极小值\nΔ > 0 且 A < 0 → 极大值\nΔ < 0 → 不是极值（鞍点）\nΔ = 0 → 无法判别',
        reminder: '判别式 AC - B²，是减号不是加号',
      },
    ],
  },

  // ============ 5. 级数 ============
  {
    id: 'series',
    name: '无穷级数',
    topicKey: 'infinite-series',
    description: '比值判别、条件收敛、端点讨论、和函数定义域等陷阱',
    trapPoints: [
      {
        id: 'series-ratio-one',
        title: '比值判别法极限为 1 时不能判，需要换方法',
        wrongExample:
          'lim a_{n+1}/a_n = 1 → 级数收敛\n（错误：比值判别 = 1 时失效）',
        correctExample:
          '比值判别法：lim |a_{n+1}/a_n| = L\nL < 1 → 收敛；L > 1 → 发散；L = 1 → 无法判别\n\nL=1 的经典例子：\nΣ 1/n 发散，但 lim (1/(n+1))/(1/n) = 1\nΣ 1/n² 收敛，lim 也 = 1\n\nL=1 时换：比较判别法、积分判别法、莱布尼茨',
        reminder: '比值等于 1，换个方法判',
      },
      {
        id: 'series-cond-abs',
        title: '条件收敛 ≠ 绝对收敛，性质差别大',
        wrongExample:
          'Σ (-1)^n / n 收敛 → 可以任意重排\n（错误：条件收敛级数重排后和可以变）',
        correctExample:
          '绝对收敛：Σ |a_n| 收敛 → 可任意重排，和不变\n条件收敛：Σ a_n 收敛但 Σ |a_n| 发散 → 重排可改变和\n\n经典：交错调和级数 Σ (-1)^{n+1}/n = ln 2\n重排后可以等于任意实数（黎曼重排定理）',
        reminder: '条件收敛不能随便重排',
      },
      {
        id: 'series-power-endpoint',
        title: '幂级数收敛区间端点需要单独讨论',
        wrongExample:
          'Σ x^n/n 的收敛半径 R=1 → 收敛域 (-1, 1)\n（错误：端点 x=-1 处条件收敛）',
        correctExample:
          '求收敛域三步：\n1. 求收敛半径 R（比值/根值）\n2. 确定开区间 (-R, R)\n3. 单独讨论端点 x=±R 处的敛散性\n\nΣ x^n/n：\nR = lim |a_n/a_{n+1}| = lim (n+1)/n = 1\nx=1: Σ 1/n 发散（调和级数）\nx=-1: Σ (-1)^n/n 收敛（莱布尼茨）\n→ 收敛域 [-1, 1)',
        reminder: '幂级数求收敛域：端点必须单独讨论',
      },
      {
        id: 'series-sum-domain',
        title: '和函数的定义域 = 收敛域，不是全体实数',
        wrongExample:
          '1/(1-x) = Σ x^n 对所有 x 成立\n（错误：只有 |x| < 1 时级数收敛）',
        correctExample:
          '幂级数的和函数只在收敛域内有定义\n1/(1-x) = Σ_{n=0}^∞ x^n，仅当 |x|<1\n\n求完和函数后，务必标注定义域（收敛域）\n端点处即使收敛，和函数表达式可能也要分段讨论',
        reminder: '和函数有定义域，收敛域内才成立',
      },
    ],
  },

  // ============ 6. 微分方程 ============
  {
    id: 'ode',
    name: '常微分方程',
    topicKey: 'ode',
    description: '分离变量丢解、一阶线性公式、重根特解、初值代错等陷阱',
    trapPoints: [
      {
        id: 'ode-separable-lose',
        title: '分离变量时除以可能为 0 的因子，丢掉特解',
        wrongExample:
          'y\' = y² → dy/y² = dx → -1/y = x + C → y = -1/(x+C)\n（错误：分离时除以了 y²，丢失了 y=0 这个解）',
        correctExample:
          'y\' = y²\n当 y ≠ 0 时：dy/y² = dx → y = -1/(x+C)\n当 y = 0 时：代入验证 y\' = 0 = y² ✔，y=0 也是解\n\n全部解：y = -1/(x+C) 及 y = 0\n（y=0 是奇解，不包含在通解中）',
        reminder: '分离变量除式可能为零，别忘了检验特解',
      },
      {
        id: 'ode-linear-formula',
        title: '一阶线性公式：别忘了前面的 e^∫Pdx',
        wrongExample:
          'y\' + P(x)y = Q(x) 的解为 y = ∫ Q(x) e^{-∫Pdx} dx + C\n（错误：少乘了 e^{-∫Pdx} 或公式记错）',
        correctExample:
          '一阶线性方程 y\' + P(x)y = Q(x)\n积分因子 μ(x) = e^{∫P(x)dx}\n通解：y = (1/μ(x)) [∫ μ(x)Q(x) dx + C]\n\n口诀：乘因子，两边积，除以因子得通解',
        reminder: '一阶线性公式：因子乘积分除以因子',
      },
      {
        id: 'ode-multiple-root',
        title: '二阶常系数齐次：重根时第二个特解要乘 x',
        wrongExample:
          'y\'\' - 2y\' + y = 0，特征根 r₁=r₂=1\n通解 y = C₁ e^x + C₂ e^x = (C₁+C₂)e^x\n（错误：重根第二个特解要乘 x）',
        correctExample:
          'y\'\' + py\' + qy = 0，特征方程 r² + pr + q = 0\n\n相异实根 r₁≠r₂：y = C₁ e^{r₁x} + C₂ e^{r₂x}\n重根 r₁=r₂=r：y = (C₁ + C₂x) e^{rx}\n共轭复根 α±iβ：y = e^{αx}(C₁ cos βx + C₂ sin βx)\n\n重根一定要乘 x！',
        reminder: '重根特解要乘 x',
      },
      {
        id: 'ode-init-wrong',
        title: '初值条件代入通解时代错变量',
        wrongExample:
          'y\' = 2y，y(0)=1 → y = Ce^{2x}，代入 y(0)=1：\n1 = Ce^{2·0} = C·0 = 0 → C=0\n（错误：e^0 = 1，不是 0）',
        correctExample:
          '常见初值代入错误：\n1. e^0 = 1 ≠ 0\n2. sin 0 = 0, cos 0 = 1\n3. ln 1 = 0, ln e = 1\n4. 代入的是 x=x₀，不是 y=y₀\n\n正确代入：y(0)=1，即 x=0 时 y=1\n1 = C·e^0 = C → C = 1 → y = e^{2x}',
        reminder: '初值代入心要细，特殊函数值别记错',
      },
    ],
  },
];

// ============================================================
// 配套陷阱题（24 题，每类 4 题）
// ============================================================

export const TRAP_QUESTIONS: TrapQuestion[] = [
  // --- 极限类 ---
  {
    id: 'trap-limit-1',
    categoryId: 'limit',
    topicKey: 'limit-continuity',
    type: 'fill-blank',
    difficulty: 2,
    problem: '求极限：$\\\\lim_{x \\\\to 0} \\\\frac{\\\\tan x - \\\\sin x}{x^3}$',
    answer: '1/2',
    solution:
      '【易错点】分子是减法，不能直接用等价无穷小将 tan x ~ x 和 sin x ~ x 分别代换！\n\n正确解法：\n$\\\\frac{\\\\tan x - \\\\sin x}{x^3} = \\\\frac{\\\\sin x (1 - \\\\cos x)}{x^3 \\\\cos x}$\n\n当 $x \\\\to 0$ 时：$\\\\sin x \\\\sim x$，$1 - \\\\cos x \\\\sim \\\\frac{x^2}{2}$\n\n$\\\\lim = \\\\frac{x \\\\cdot x^2/2}{x^3 \\\\cdot 1} = \\\\frac{1}{2}$',
    relatedTrapId: 'limit-equiv-add',
    score: 6,
  },
  {
    id: 'trap-limit-2',
    categoryId: 'limit',
    topicKey: 'limit-continuity',
    type: 'fill-blank',
    difficulty: 2,
    problem: '求极限：$\\\\lim_{x \\\\to 0^+} x \\\\ln x$',
    answer: '0',
    solution:
      '【易错点】0·∞ 是未定式，不能直接认为 0 乘任何数都是 0！\n\n正确解法：变型为 ∞/∞ 型再用洛必达\n$\\\\lim_{x \\\\to 0^+} x \\\\ln x = \\\\lim_{x \\\\to 0^+} \\\\frac{\\\\ln x}{1/x}$\n\n洛必达：$= \\\\lim_{x \\\\to 0^+} \\\\frac{1/x}{-1/x^2} = \\\\lim_{x \\\\to 0^+} (-x) = 0$',
    relatedTrapId: 'limit-zero-infty',
    score: 6,
  },
  {
    id: 'trap-limit-3',
    categoryId: 'limit',
    topicKey: 'limit-continuity',
    type: 'calculation',
    difficulty: 3,
    problem:
      '讨论函数 $f(x)=\\begin{cases} \\dfrac{\\sin x}{x}, & x>0 \\\\ a+x, & x\\le 0 \\end{cases}$ 在 $x=0$ 处的连续性，求 $a$ 的值使得 $f(x)$ 在 $x=0$ 连续。',
    answer: 'a = 1',
    solution:
      '【易错点】分段函数分界点必须分别求左右极限！\n\n解：\n右极限：$\\\\lim_{x \\\\to 0^+} f(x) = \\\\lim_{x \\\\to 0^+} \\\\frac{\\\\sin x}{x} = 1$\n左极限：$\\\\lim_{x \\\\to 0^-} f(x) = \\\\lim_{x \\\\to 0^-} (a+x) = a$\n$f(0) = a + 0 = a$\n\n连续条件：左极限 = 右极限 = 函数值\n即 $a = 1$\n\n当 $a = 1$ 时，$f(x)$ 在 $x=0$ 处连续。',
    relatedTrapId: 'limit-continuity-piecwise',
    score: 10,
  },
  {
    id: 'trap-limit-4',
    categoryId: 'limit',
    topicKey: 'limit-continuity',
    type: 'fill-blank',
    difficulty: 2,
    problem: '$\\\\lim_{x \\\\to +\\\\infty} (\\\\sqrt{x^2 + x} - x)$',
    answer: '1/2',
    solution:
      '【易错点】∞ - ∞ 是未定式，不能认为 ∞ - ∞ = 0！\n\n正确解法：有理化\n$\\\\sqrt{x^2+x} - x = \\\\frac{(\\\\sqrt{x^2+x}-x)(\\\\sqrt{x^2+x}+x)}{\\\\sqrt{x^2+x}+x}$\n$= \\\\frac{x}{\\\\sqrt{x^2+x}+x} = \\\\frac{1}{\\\\sqrt{1+1/x}+1}$\n\n当 $x \\\\to +\\\\infty$ 时：$\\\\lim = \\\\frac{1}{1+1} = \\\\frac{1}{2}$',
    relatedTrapId: 'limit-inf-minus-inf',
    score: 6,
  },

  // --- 微分类 ---
  {
    id: 'trap-diff-1',
    categoryId: 'diff',
    topicKey: 'single-var-diff',
    type: 'fill-blank',
    difficulty: 1,
    problem: '求导数：$(\\\\sin 3x)\' = $？',
    answer: '3 cos 3x',
    solution:
      '【易错点】复合函数求导不要漏内层导数！sin 3x 的导数不是 cos 3x。\n\n正确解法：链式法则\n设 u = 3x，则 (sin u)\' = cos u · u\' = cos 3x · 3 = 3 cos 3x',
    relatedTrapId: 'diff-chain-miss',
    score: 6,
  },
  {
    id: 'trap-diff-2',
    categoryId: 'diff',
    topicKey: 'single-var-diff',
    type: 'fill-blank',
    difficulty: 2,
    problem: '设 $x^2 + y^2 = 1$，求 $y\'$。',
    answer: "y' = -x/y",
    solution:
      "【易错点】隐函数求导时，y 是 x 的函数，y² 的导数要用链式法则！\n\n正确解法：\n两边对 x 求导：\n2x + 2y · y' = 0\n→ y' = -2x / 2y = -x/y",
    relatedTrapId: 'diff-implicit-miss',
    score: 6,
  },
  {
    id: 'trap-diff-3',
    categoryId: 'diff',
    topicKey: 'single-var-diff',
    type: 'calculation',
    difficulty: 3,
    problem:
      '设 $f(x) = x|x|$，讨论 $f(x)$ 在 $x=0$ 处的可导性。若可导，求 $f\'(0)$。',
    answer: "f'(0) = 0",
    solution:
      '【易错点】带绝对值的函数在分界点处需用定义分别求左右导数！\n\n解：\n当 x > 0 时，f(x) = x²，f\'(x) = 2x\n当 x < 0 时，f(x) = -x²，f\'(x) = -2x\n\n用定义求 0 处的导数：\nf\'_+(0) = lim(h→0+) [f(h)-f(0)]/h = lim h²/h = 0\nf\'_-(0) = lim(h→0-) [f(h)-f(0)]/h = lim (-h²)/h = 0\n\n左右导数相等 → f(x) 在 x=0 处可导，f\'(0) = 0',
    relatedTrapId: 'diff-abs-notdiff',
    score: 10,
  },
  {
    id: 'trap-diff-4',
    categoryId: 'diff',
    topicKey: 'single-var-diff',
    type: 'calculation',
    difficulty: 3,
    problem:
      '证明：对任意实数 $a,b$，有 $|\\\\sin a - \\\\sin b| \\\\le |a - b|$。',
    answer: '利用拉格朗日中值定理可证',
    solution:
      '【易错点】中值定理使用前必须验证条件！\n\n证明：设 f(x) = sin x，它在 (-∞, +∞) 上连续可导。\n\n若 a = b，不等式显然成立。\n\n若 a ≠ b，不妨设 a < b。f(x) 在 [a,b] 上满足拉格朗日中值定理条件：\n- [a,b] 上连续 ✔\n- (a,b) 内可导 ✔\n\n故存在 ξ ∈ (a,b)，使 f(b) - f(a) = f\'(ξ)(b - a)\n即 sin b - sin a = cos ξ · (b - a)\n\n|sin a - sin b| = |cos ξ| · |a - b| ≤ 1 · |a - b| = |a - b|\n\n证毕。',
    relatedTrapId: 'diff-rolle-condition',
    score: 12,
  },

  // --- 积分类 ---
  {
    id: 'trap-int-1',
    categoryId: 'integral',
    topicKey: 'single-var-int',
    type: 'fill-blank',
    difficulty: 1,
    problem: '计算不定积分：$\\\\int \\\\frac{1}{2x+1} dx$',
    answer: '(1/2) ln|2x+1| + C',
    solution:
      '【易错点】① 不定积分换元要回代 ② ∫1/x dx 结果有绝对值\n\n正确解法：\n令 u = 2x+1，du = 2dx，dx = du/2\n∫ 1/(2x+1) dx = (1/2) ∫ 1/u du = (1/2) ln|u| + C\n= (1/2) ln|2x+1| + C',
    relatedTrapId: 'int-1x-abs',
    score: 6,
  },
  {
    id: 'trap-int-2',
    categoryId: 'integral',
    topicKey: 'single-var-int',
    type: 'fill-blank',
    difficulty: 2,
    problem: '求定积分：$\\\\int_{-1}^{1} (x^2 + x) dx$',
    answer: '2/3',
    solution:
      '【易错点】奇偶积分性质只能用在对称区间，且要分项看：\nx² 是偶函数，x 是奇函数。\n\n正确解法：\n∫_{-1}^{1} (x² + x) dx = ∫_{-1}^{1} x² dx + ∫_{-1}^{1} x dx\n\n= 2 ∫₀¹ x² dx + 0 （奇函数在对称区间积分 = 0）\n= 2 · [x³/3]₀¹ = 2 · 1/3 = 2/3',
    relatedTrapId: 'int-odd-misuse',
    score: 6,
  },
  {
    id: 'trap-int-3',
    categoryId: 'integral',
    topicKey: 'single-var-int',
    type: 'fill-blank',
    difficulty: 2,
    problem:
      '设 $F(x) = \\\\int_0^{x^2} \\\\sin t^2 dt$，求 $F\'(x)$。',
    answer: "F'(x) = 2x·sin(x⁴)",
    solution:
      "【易错点】变上限积分求导要乘以上限函数的导数！\n\n正确解法：\n设 u(x) = x²，则 F(x) = ∫₀^{u(x)} sin t² dt\n\n由变上限积分求导公式和链式法则：\nF'(x) = sin[u(x)]² · u'(x)\n= sin(x²)² · 2x\n= 2x · sin(x⁴)",
    relatedTrapId: 'int-var-upper',
    score: 6,
  },
  {
    id: 'trap-int-4',
    categoryId: 'integral',
    topicKey: 'single-var-int',
    type: 'calculation',
    difficulty: 2,
    problem: '计算：$\\\\int x \\\\ln x dx$',
    answer: '(x²/2)ln x - x²/4 + C',
    solution:
      '【易错点】分部积分选 u 和 v\'：对反三指幂，顺序在前的当 u（lnx 是对数，排前面）\n\n解：设 u = ln x，dv = x dx\n则 du = (1/x) dx，v = x²/2\n\n∫ x ln x dx = (x²/2)ln x - ∫ (x²/2)(1/x) dx\n= (x²/2)ln x - (1/2) ∫ x dx\n= (x²/2)ln x - (1/2)(x²/2) + C\n= (x²/2)ln x - x²/4 + C',
    relatedTrapId: 'int-substitute-back',
    score: 10,
  },

  // --- 多元类 ---
  {
    id: 'trap-multi-1',
    categoryId: 'multi',
    topicKey: 'multi-var-diff',
    type: 'fill-blank',
    difficulty: 2,
    problem:
      '设 $z = f(x^2 + y^2, xy)$，其中 $f$ 具有连续偏导，求 $\\\\frac{\\\\partial z}{\\\\partial x}$。',
    answer: '2x · f₁ + y · f₂',
    solution:
      '【易错点】二元复合函数偏导要用链式法则，注意 ∂ 和 d 的区别！\n\n解：设 u = x² + y²，v = xy，则 z = f(u, v)\n\n∂z/∂x = ∂z/∂u · ∂u/∂x + ∂z/∂v · ∂v/∂x\n= f₁ · 2x + f₂ · y\n= 2x f₁ + y f₂\n\n（其中 f₁ 表示对第一个变量求偏导，f₂ 对第二个变量）',
    relatedTrapId: 'multi-chain-sign',
    score: 6,
  },
  {
    id: 'trap-multi-2',
    categoryId: 'multi',
    topicKey: 'multi-var-diff',
    type: 'calculation',
    difficulty: 3,
    problem:
      '求 $f(x, y) = x^3 + y^3 - 3x - 3y$ 的极值。',
    answer: '极大值 f(-1,-1)=4，极小值 f(1,1)=-4',
    solution:
      '【易错点】求极值用判别式 AC - B²，注意是减号！\n\n解：f_x = 3x² - 3，f_y = 3y² - 3\n令 f_x = 0, f_y = 0 得驻点：(±1, ±1)\n\nA = f_xx = 6x，B = f_xy = 0，C = f_yy = 6y\nΔ = AC - B² = 36xy\n\n① (1, 1)：Δ = 36 > 0，A = 6 > 0 → 极小值 f(1,1) = -4\n② (1, -1)：Δ = -36 < 0 → 不是极值\n③ (-1, 1)：Δ = -36 < 0 → 不是极值\n④ (-1, -1)：Δ = 36 > 0，A = -6 < 0 → 极大值 f(-1,-1) = 4',
    relatedTrapId: 'multi-extreme-acb2',
    score: 12,
  },
  {
    id: 'trap-multi-3',
    categoryId: 'multi',
    topicKey: 'multi-var-int',
    type: 'calculation',
    difficulty: 3,
    problem:
      '设 $L$ 为正向圆周 $x^2 + y^2 = a^2$，求 $\\\\oint_L x dy - y dx$。',
    answer: '2πa²',
    solution:
      '【易错点】格林公式是 ∂Q/∂x - ∂P/∂y，注意符号和顺序！\n\n解：P = -y，Q = x\n∂Q/∂x = 1，∂P/∂y = -1\n∂Q/∂x - ∂P/∂y = 1 - (-1) = 2\n\n由格林公式（L 是正向，逆时针）：\n∮_L x dy - y dx = ∬_D (1 - (-1)) dσ = 2 ∬_D dσ\n= 2 · πa² = 2πa²',
    relatedTrapId: 'multi-green-direction',
    score: 10,
  },
  {
    id: 'trap-multi-4',
    categoryId: 'multi',
    topicKey: 'multi-var-diff',
    type: 'fill-blank',
    difficulty: 2,
    problem:
      '函数 $f(x, y) = x^2 + 2y^2$ 在点 $(1, 1)$ 处方向导数的最大值为？',
    answer: '2√5',
    solution:
      '【易错点】方向导数最大值 = 梯度的模长，梯度方向是函数值增长最快的方向。\n\n解：梯度 ∇f = (f_x, f_y) = (2x, 4y)\n在 (1,1) 处：∇f(1,1) = (2, 4)\n\n方向导数最大值 = |∇f| = √(2² + 4²) = √(4+16) = √20 = 2√5\n方向导数最小值 = -|∇f| = -2√5',
    relatedTrapId: 'multi-partial-ne-diff',
    score: 6,
  },

  // --- 级数类 ---
  {
    id: 'trap-series-1',
    categoryId: 'series',
    topicKey: 'infinite-series',
    type: 'calculation',
    difficulty: 2,
    problem:
      '求幂级数 $\\\\sum_{n=1}^{\\\\infty} \\\\frac{x^n}{n}$ 的收敛域。',
    answer: '[-1, 1)',
    solution:
      '【易错点】收敛半径只是开区间，端点必须单独讨论！\n\n解：\n收敛半径：R = lim |a_n/a_{n+1}| = lim (n+1)/n = 1\n收敛开区间：(-1, 1)\n\n端点讨论：\nx = 1：Σ 1/n → 调和级数，发散\nx = -1：Σ (-1)^n/n → 交错调和级数，莱布尼茨判别收敛\n\n∴ 收敛域为 [-1, 1)',
    relatedTrapId: 'series-power-endpoint',
    score: 10,
  },
  {
    id: 'trap-series-2',
    categoryId: 'series',
    topicKey: 'infinite-series',
    type: 'fill-blank',
    difficulty: 2,
    problem:
      '判断级数 $\\\\sum_{n=1}^{\\\\infty} \\\\frac{n+1}{n^2 + 1}$ 的敛散性。',
    answer: '发散',
    solution:
      '【易错点】比值判别极限为 1 时失效！要换比较判别法。\n\n解：lim |a_{n+1}/a_n| = ... = 1 → 比值法失效\n\n改用极限比较法：取 b_n = 1/n\nlim_{n→∞} a_n / b_n = lim (n+1)/(n²+1) · n/1 = lim (n²+n)/(n²+1) = 1 > 0\n\nΣ 1/n 发散 → 由比较判别法极限形式，原级数发散',
    relatedTrapId: 'series-ratio-one',
    score: 6,
  },
  {
    id: 'trap-series-3',
    categoryId: 'series',
    topicKey: 'infinite-series',
    type: 'fill-blank',
    difficulty: 2,
    problem:
      '幂级数 $\\\\sum_{n=0}^{\\\\infty} (-1)^n \\\\frac{x^{2n+1}}{2n+1}$ 的和函数为？（$|x|<1$）',
    answer: 'arctan x',
    solution:
      '【易错点】和函数只在收敛域内成立！不要忘了标注 |x| < 1。\n\n解：设 S(x) = Σ_{n=0}^{∞} (-1)^n x^{2n+1}/(2n+1)\n逐项求导：S\'(x) = Σ_{n=0}^{∞} (-1)^n x^{2n} = 1/(1+x²)，|x| < 1\n\nS(x) = ∫₀ˣ 1/(1+t²) dt = arctan x\n（S(0) = 0，积分常数为 0）\n\n注意：端点 x=±1 处级数也收敛，和函数连续延拓后仍等于 arctan x。',
    relatedTrapId: 'series-sum-domain',
    score: 6,
  },
  {
    id: 'trap-series-4',
    categoryId: 'series',
    topicKey: 'infinite-series',
    type: 'calculation',
    difficulty: 2,
    problem:
      '判别级数 $\\\\sum_{n=1}^{\\\\infty} (-1)^{n+1} \\\\frac{1}{\\\\sqrt{n}}$ 是绝对收敛、条件收敛还是发散。',
    answer: '条件收敛',
    solution:
      '【易错点】条件收敛和绝对收敛不要混淆！\n\n解：先看绝对值级数：Σ 1/√n = Σ n^{-1/2}\n这是 p 级数，p = 1/2 < 1 → 发散\n∴ 不绝对收敛\n\n再看原级数（交错级数）：\nu_n = 1/√n 单调递减趋于 0\n由莱布尼茨判别法，原级数收敛\n\n综上：原级数条件收敛',
    relatedTrapId: 'series-cond-abs',
    score: 10,
  },

  // --- 微分方程类 ---
  {
    id: 'trap-ode-1',
    categoryId: 'ode',
    topicKey: 'ode',
    type: 'calculation',
    difficulty: 2,
    problem: "求微分方程 $y' = y^2$ 的全部解。",
    answer: 'y = -1/(x+C) 和 y = 0',
    solution:
      '【易错点】分离变量时分母可能为 0，会丢失奇解！\n\n解：当 y ≠ 0 时，分离变量：dy/y² = dx\n积分：-1/y = x + C → y = -1/(x+C)\n\n当 y = 0 时，代入方程：左边 y\' = 0，右边 y² = 0 ✔\n∴ y = 0 也是解（不包含在通解中，是奇解）\n\n全部解：y = -1/(x+C)（C 为任意常数）及 y = 0',
    relatedTrapId: 'ode-separable-lose',
    score: 10,
  },
  {
    id: 'trap-ode-2',
    categoryId: 'ode',
    topicKey: 'ode',
    type: 'calculation',
    difficulty: 2,
    problem: "求一阶线性方程 $y' + 2xy = 2xe^{-x^2}$ 的通解。",
    answer: 'y = (x² + C) e^{-x²}',
    solution:
      '【易错点】一阶线性公式别记错！是 y = (∫ μQ dx + C) / μ\n\n解：P(x) = 2x，Q(x) = 2x e^{-x²}\n积分因子 μ = e^{∫ 2x dx} = e^{x²}\n\n通解：y = (1/μ)[∫ μQ dx + C]\n= e^{-x²}[∫ e^{x²} · 2x e^{-x²} dx + C]\n= e^{-x²}[∫ 2x dx + C]\n= e^{-x²}(x² + C)\n\n验证：y\' = -2x(x²+C)e^{-x²} + 2x·e^{-x²}，代入左边 y\'+2xy = 2xe^{-x²} ✔',
    relatedTrapId: 'ode-linear-formula',
    score: 10,
  },
  {
    id: 'trap-ode-3',
    categoryId: 'ode',
    topicKey: 'ode',
    type: 'fill-blank',
    difficulty: 2,
    problem: "求方程 $y'' - 4y' + 4y = 0$ 的通解。",
    answer: 'y = (C₁ + C₂x)e^{2x}',
    solution:
      '【易错点】重根时第二个特解要乘 x！不要写成 y = C₁e^{2x} + C₂e^{2x}。\n\n解：特征方程 r² - 4r + 4 = 0\n(r-2)² = 0 → 二重根 r₁ = r₂ = 2\n\n重根时通解形式：y = (C₁ + C₂x) e^{rx}\n\n即 y = (C₁ + C₂x) e^{2x}',
    relatedTrapId: 'ode-multiple-root',
    score: 6,
  },
  {
    id: 'trap-ode-4',
    categoryId: 'ode',
    topicKey: 'ode',
    type: 'calculation',
    difficulty: 2,
    problem:
      "求初值问题：$y' = 2xy$，$y(0) = 1$ 的特解。",
    answer: 'y = e^{x²}',
    solution:
      '【易错点】初值条件代入时注意 e⁰ = 1 不是 0！\n\n解：分离变量：dy/y = 2x dx\n积分：ln|y| = x² + C₁ → y = C e^{x²}（C = ±e^{C₁}）\n\n代入初值 y(0) = 1：\n1 = C · e⁰ = C · 1 → C = 1\n\n特解：y = e^{x²}',
    relatedTrapId: 'ode-init-wrong',
    score: 10,
  },
];

// ============================================================
// 工具函数
// ============================================================

export function getTrapQuestionsByCategory(categoryId: string): TrapQuestion[] {
  return TRAP_QUESTIONS.filter((q) => q.categoryId === categoryId);
}

export function getAllTrapQuestions(): TrapQuestion[] {
  return TRAP_QUESTIONS;
}

export function getTrapQuestionsByTopic(topicKey: string): TrapQuestion[] {
  return TRAP_QUESTIONS.filter((q) => q.topicKey === topicKey);
}

export function getTrapCategoryById(categoryId: string): TrapCategory | undefined {
  return TRAP_CATEGORIES.find((c) => c.id === categoryId);
}
