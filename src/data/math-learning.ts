// EXPORTS: LEARNING_CARDS, type LearningCard

export interface LearningCard {
  /** 模块 key，对应页面 */
  moduleKey: string;
  /** 卡片 id */
  id: string;
  /** 卡片标题 */
  title: string;
  /** 简短定义 */
  definition: string;
  /** 核心公式（LaTeX 字符串数组） */
  formulas: string[];
  /** 使用注意事项 */
  notes: string[];
  /** 经典示例（描述 + 公式） */
  example: { description: string; formula: string };
}

export const LEARNING_CARDS: LearningCard[] = [
  // ========== 微积分 ==========
  {
    moduleKey: 'calculus',
    id: 'calc-derivative-def',
    title: '导数定义',
    definition: '导数 f\'(x₀) 表示函数 f(x) 在 x₀ 处的瞬时变化率，即割线斜率的极限。',
    formulas: [
      "f'(x_0) = \\lim_{\\Delta x \\to 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}",
      "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
    ],
    notes: [
      '可导必连续，连续不一定可导',
      '几何意义：函数图像在该点切线的斜率',
      '物理意义：瞬时速度、瞬时变化率',
      '左导数 = 右导数 时函数在该点可导',
    ],
    example: { description: 'f(x) = x² 在 x=2 处的导数', formula: "f'(2) = \\lim_{h\\to0}\\frac{(2+h)^2-4}{h}=4" },
  },
  {
    moduleKey: 'calculus',
    id: 'calc-integral-def',
    title: '积分定义',
    definition: '定积分是黎曼和的极限，表示曲线下方面积；不定积分是求导的逆运算。',
    formulas: [
      "\\int_a^b f(x)\\, dx = \\lim_{n\\to\\infty} \\sum_{i=1}^n f(x_i^*)\\Delta x",
      "\\int f(x)\\, dx = F(x) + C \\quad \\Longleftrightarrow \\quad F'(x) = f(x)",
      "\\int_a^b f(x)\\, dx = F(b) - F(a) \\quad \\text{(牛顿-莱布尼茨公式)}",
    ],
    notes: [
      '不定积分结果必须加常数 C',
      '定积分存在条件：f 在 [a,b] 上连续或仅有有限个间断点',
      '∫ 符号由莱布尼茨引入，是 sum 的拉长 S',
      '几何意义：曲线 y=f(x)、x 轴、x=a、x=b 围成的面积的代数和',
    ],
    example: { description: '∫₀¹ x² dx', formula: '\\int_0^1 x^2 dx = \\left[\\frac{x^3}{3}\\right]_0^1 = \\frac{1}{3}' },
  },
  {
    moduleKey: 'calculus',
    id: 'calc-limit-def',
    title: '极限定义',
    definition: '当 x 无限趋近于 a 时，f(x) 无限趋近于常数 L，则称 L 为 f(x) 在 x→a 时的极限。',
    formulas: [
      "\\lim_{x \\to a} f(x) = L \\quad \\Longleftrightarrow \\quad \\forall \\varepsilon>0, \\exists \\delta>0, 0<|x-a|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon",
      "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\qquad \\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x = e",
    ],
    notes: [
      '极限存在 ⟺ 左极限 = 右极限',
      '函数在 a 点的极限与 f(a) 是否存在无关',
      '∞ 是趋势，不是数',
      '0/0 型、∞/∞ 型、0·∞ 型、∞-∞ 型等不定式需要化简后再求',
    ],
    example: { description: '第一个重要极限', formula: '\\lim_{x\\to0}\\frac{\\sin x}{x} = 1' },
  },
  {
    moduleKey: 'calculus',
    id: 'calc-chain-rule',
    title: '复合函数求导（链式法则）',
    definition: '复合函数 y = f(g(x)) 的导数等于外层函数导数乘以内层函数导数。',
    formulas: [
      "\\frac{d}{dx}f(g(x)) = f'(g(x)) \\cdot g'(x)",
      "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}",
    ],
    notes: [
      '可以形象理解为"链条"：一环套一环，逐层求导相乘',
      '多层复合继续扩展：y=f(g(h(x))) → y\' = f\'(g(h(x)))·g\'(h(x))·h\'(x)',
      '常见错误：漏掉内层导数',
    ],
    example: { description: '(sin x²)\'', formula: "(\\sin x^2)' = \\cos(x^2) \\cdot 2x = 2x\\cos(x^2)" },
  },
  {
    moduleKey: 'calculus',
    id: 'calc-series',
    title: '级数与收敛',
    definition: '无穷级数是无穷多项依次相加的和；若部分和数列有有限极限，则级数收敛。',
    formulas: [
      "\\sum_{n=1}^\\infty a_n = \\lim_{N\\to\\infty} \\sum_{n=1}^N a_n",
      "\\sum_{n=0}^\\infty ar^n = \\frac{a}{1-r} \\quad (|r| < 1, \\text{等比级数})",
      "\\sum_{n=1}^\\infty \\frac{1}{n^p} \\text{ 收敛} \\iff p > 1 \\quad \\text{(p-级数判别法)}",
    ],
    notes: [
      '级数收敛的必要条件：lim aₙ = 0，但充分性不成立',
      '调和级数 Σ1/n 发散（虽然通项趋于0）',
      '绝对收敛 ⇒ 收敛，反之不一定',
      '交错级数用莱布尼茨判别法：通项递减趋于0则收敛',
    ],
    example: { description: '等比级数求和', formula: '\\sum_{n=0}^\\infty \\frac{1}{2^n} = \\frac{1}{1-1/2} = 2' },
  },
  {
    moduleKey: 'calculus',
    id: 'calc-taylor',
    title: '泰勒展开',
    definition: '将函数在某点附近用多项式逼近，阶数越高精度越好。',
    formulas: [
      "f(x) = \\sum_{n=0}^\\infty \\frac{f^{(n)}(a)}{n!}(x-a)^n",
      "e^x = \\sum_{n=0}^\\infty \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots",
      "\\sin x = \\sum_{n=0}^\\infty (-1)^n \\frac{x^{2n+1}}{(2n+1)!}",
    ],
    notes: [
      '麦克劳林级数是泰勒级数在 a=0 的特例',
      '收敛半径内泰勒级数收敛于原函数',
      '低阶泰勒展开常用于近似计算',
      'e^(iθ) = cosθ + i·sinθ（欧拉公式）可以通过泰勒展开证明',
    ],
    example: { description: 'eˣ 的麦克劳林展开', formula: 'e^x = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + \\cdots' },
  },
  {
    moduleKey: 'calculus',
    id: 'calc-lhopital',
    title: '洛必达法则',
    definition: '对于 0/0 型或 ∞/∞ 型不定式，极限等于其导数之比的极限。',
    formulas: [
      "\\lim_{x\\to a} \\frac{f(x)}{g(x)} = \\lim_{x\\to a} \\frac{f'(x)}{g'(x)} \\quad \\text{（0/0 或 } \\infty/\\infty\\text{ 型）}",
    ],
    notes: [
      '只能用于 0/0 或 ∞/∞ 型，其他型（0·∞、∞-∞、1^∞ 等）需先转化',
      '可以多次使用，但每次使用前必须验证是否为不定式',
      '右边极限不存在时，不能得出左边极限不存在的结论',
      '与等价无穷小替换结合可以大大简化计算',
    ],
    example: { description: 'lim sin(x)/x (x→0)', formula: '\\lim_{x\\to0}\\frac{\\sin x}{x} = \\lim_{x\\to0}\\frac{\\cos x}{1} = 1' },
  },

  // ========== 线性代数 ==========
  {
    moduleKey: 'linear',
    id: 'la-matrix-op',
    title: '矩阵基本运算',
    definition: '矩阵是数的矩形阵列，支持加法、数乘、乘法三种基本运算。',
    formulas: [
      "A + B = (a_{ij} + b_{ij})_{m\\times n}",
      "k \\cdot A = (k \\cdot a_{ij})_{m\\times n}",
      "(AB)_{ij} = \\sum_{k=1}^n a_{ik}b_{kj} \\quad (A: m\\times n,\\ B: n\\times p)",
    ],
    notes: [
      '矩阵乘法不满足交换律：AB ≠ BA（一般情况）',
      '矩阵乘法满足结合律：(AB)C = A(BC)',
      '只有同型矩阵才能相加',
      'A的列数必须等于B的行数才能相乘 AB',
    ],
    example: { description: '2×2 矩阵乘法', formula: '\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\\begin{bmatrix}5&6\\\\7&8\\end{bmatrix}=\\begin{bmatrix}19&22\\\\43&50\\end{bmatrix}' },
  },
  {
    moduleKey: 'linear',
    id: 'la-determinant',
    title: '行列式',
    definition: '行列式是方阵的一个数值，反映矩阵的"缩放因子"。',
    formulas: [
      "\\det(A) = |A| = \\sum_{j=1}^n (-1)^{i+j}a_{ij}M_{ij} \\quad \\text{(按第i行展开)}",
      "\\begin{vmatrix}a&b\\\\c&d\\end{vmatrix} = ad - bc \\quad \\text{(2×2)}",
      "\\det(AB) = \\det(A)\\det(B) \\quad \\det(kA) = k^n\\det(A)",
    ],
    notes: [
      '只有方阵才有行列式',
      'det(A) = 0 ⟺ A 不可逆 ⟺ 行/列线性相关',
      '行变换对行列式的影响：交换行变号、某行乘k乘k、倍加行不变',
      '几何意义：n维空间中线性变换的体积缩放因子',
    ],
    example: { description: '三阶行列式', formula: '\\begin{vmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{vmatrix} = 0' },
  },
  {
    moduleKey: 'linear',
    id: 'la-inverse',
    title: '逆矩阵',
    definition: '若存在矩阵 B 使得 AB = BA = I，则称 B 为 A 的逆矩阵，记作 A⁻¹。',
    formulas: [
      "A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A) \\quad \\text{(伴随矩阵法)}",
      "(AB)^{-1} = B^{-1}A^{-1}",
      "(A^T)^{-1} = (A^{-1})^T",
    ],
    notes: [
      '矩阵可逆 ⟺ det(A) ≠ 0 ⟺ 满秩 ⟺ 行/列线性无关',
      '求逆的方法：伴随矩阵法、高斯-约旦消元法',
      '2×2 快速公式：[[a,b],[c,d]]⁻¹ = (1/(ad-bc))·[[d,-b],[-c,a]]',
      '可逆矩阵又称非奇异矩阵',
    ],
    example: { description: '2×2 矩阵求逆', formula: '\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}^{-1} = \\frac{1}{-2}\\begin{bmatrix}4&-2\\\\-3&1\\end{bmatrix}' },
  },
  {
    moduleKey: 'linear',
    id: 'la-eigen',
    title: '特征值与特征向量',
    definition: '若 Av = λv（v ≠ 0），则 λ 为特征值，v 为对应的特征向量。',
    formulas: [
      "Av = \\lambda v \\quad \\Longleftrightarrow \\quad (A - \\lambda I)v = 0",
      "\\det(A - \\lambda I) = 0 \\quad \\text{(特征方程)}",
      "\\text{tr}(A) = \\sum_{i=1}^n \\lambda_i \\quad \\det(A) = \\prod_{i=1}^n \\lambda_i",
    ],
    notes: [
      '特征向量刻画了线性变换中"方向不变"的向量',
      '不同特征值对应的特征向量线性无关',
      '实对称矩阵的特征值都是实数，且特征向量正交',
      '特征值之和等于迹（主对角线元素之和）',
    ],
    example: { description: '2×2 矩阵特征值', formula: 'A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix},\\ \\lambda_1=3,\\lambda_2=1' },
  },
  {
    moduleKey: 'linear',
    id: 'la-rank',
    title: '矩阵的秩',
    definition: '矩阵的秩 = 行秩 = 列秩 = 非零子式的最高阶数 = 行阶梯形中非零行数。',
    formulas: [
      "\\text{rank}(A) = \\text{行秩} = \\text{列秩}",
      "\\text{rank}(AB) \\leq \\min\\{\\text{rank}(A), \\text{rank}(B)\\}",
      "\\text{rank}(A + B) \\leq \\text{rank}(A) + \\text{rank}(B)",
    ],
    notes: [
      '初等行变换不改变矩阵的秩',
      'A 为 m×n 矩阵，则 r(A) ≤ min(m, n)',
      '齐次方程组 Ax=0 解空间维数 = n - r(A)',
      '满秩 ⟺ 可逆 ⟺ det≠0',
    ],
    example: { description: '秩的计算', formula: 'A=\\begin{bmatrix}1&2&3\\\\2&4&6\\\\3&6&9\\end{bmatrix},\\ \\text{rank}(A)=1' },
  },
  {
    moduleKey: 'linear',
    id: 'la-gauss',
    title: '高斯消元法',
    definition: '通过行变换将线性方程组化为行阶梯形，从而求解的方法。',
    formulas: [
      "\\begin{cases} a_{11}x_1+\\cdots = b_1 \\\\ \\cdots \\end{cases} \\xrightarrow{\\text{行变换}} \\text{行阶梯形方程组}",
    ],
    notes: [
      '三种初等行变换：交换两行、某行乘非零数、一行倍数加到另一行',
      '高斯消元 = 自上而下消元（变成上三角）+ 回代',
      '高斯-约旦消元 = 继续消元变成对角矩阵（直接得解）',
      '解的判定：r(A) < r(A|b) 无解；= 唯一解；< 无穷多解',
    ],
    example: { description: '三元一次方程组', formula: '\\begin{cases}x+y+z=6\\\\2y+z=5\\\\3z=6\\end{cases} \\Rightarrow z=2,y=1.5,x=2.5' },
  },

  // ========== 概率统计 ==========
  {
    moduleKey: 'probability',
    id: 'prob-expectation',
    title: '期望',
    definition: '期望是随机变量取值的加权平均，反映随机变量的平均水平。',
    formulas: [
      "E(X) = \\sum_i x_i p_i \\quad \\text{(离散)}",
      "E(X) = \\int_{-\\infty}^{+\\infty} x f(x)\\, dx \\quad \\text{(连续)}",
      "E(aX + bY) = aE(X) + bE(Y) \\quad \\text{(线性性)}",
    ],
    notes: [
      '期望又称均值，是"长期平均"的数学刻画',
      '期望不一定等于任何一个可能取值',
      'X,Y 独立时有 E(XY) = E(X)E(Y)，反之不成立',
      '期望存在 ⇒ 绝对收敛',
    ],
    example: { description: '掷一枚骰子的期望', formula: 'E(X) = \\frac{1+2+3+4+5+6}{6} = 3.5' },
  },
  {
    moduleKey: 'probability',
    id: 'prob-variance',
    title: '方差与标准差',
    definition: '方差衡量随机变量取值相对于期望的分散程度，标准差是方差的平方根。',
    formulas: [
      "D(X) = \\text{Var}(X) = E[(X - E(X))^2]",
      "D(X) = E(X^2) - [E(X)]^2 \\quad \\text{(常用计算公式)}",
      "\\sigma(X) = \\sqrt{D(X)} \\quad \\text{(标准差)}",
      "D(aX + b) = a^2 D(X)",
    ],
    notes: [
      '方差总是非负的',
      '方差越大，数据越分散；越小越集中',
      'X,Y 独立时，D(X+Y) = D(X) + D(Y)',
      '标准差与随机变量同量纲，比方差更直观',
    ],
    example: { description: '掷骰子的方差', formula: 'D(X) = \\frac{35}{12} \\approx 2.92' },
  },
  {
    moduleKey: 'probability',
    id: 'prob-normal',
    title: '正态分布',
    definition: '最重要的连续概率分布，又称高斯分布，钟形曲线。',
    formulas: [
      "X \\sim N(\\mu, \\sigma^2)",
      "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}",
      "Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1) \\quad \\text{(标准化)}",
    ],
    notes: [
      'μ 决定位置（对称轴），σ 决定胖瘦',
      '68-95-99.7 法则：±1σ 内约 68%，±2σ 内约 95%，±3σ 内约 99.7%',
      '标准正态分布 Φ(x) = P(Z ≤ x)',
      '中心极限定理：大量独立同分布随机变量之和近似正态',
    ],
    example: { description: '考试成绩 ~ N(70, 10²)，高于90分占比', formula: 'P(X>90) = 1 - \\Phi(2) \\approx 2.3\\%' },
  },
  {
    moduleKey: 'probability',
    id: 'prob-binomial',
    title: '二项分布',
    definition: 'n 次独立伯努利试验中成功次数的分布，每次成功概率为 p。',
    formulas: [
      "X \\sim B(n, p)",
      "P(X = k) = C_n^k p^k (1-p)^{n-k}",
      "E(X) = np \\qquad D(X) = np(1-p)",
    ],
    notes: [
      'n=1 时为伯努利分布（0-1分布）',
      '适用条件：各次试验独立、每次只有两种结果、概率 p 不变',
      'n 很大 p 很小时，可用泊松分布近似',
      'np 和 n(1-p) 都较大时，可用正态分布近似',
    ],
    example: { description: '抛10次硬币，恰好5次正面的概率', formula: 'P(X=5) = C_{10}^5 (0.5)^{10} \\approx 0.246' },
  },
  {
    moduleKey: 'probability',
    id: 'prob-bayes',
    title: '贝叶斯公式',
    definition: '条件概率的重要公式，用于"由果推因"。',
    formulas: [
      "P(A|B) = \\frac{P(B|A)P(A)}{P(B)}",
      "P(A_i|B) = \\frac{P(B|A_i)P(A_i)}{\\sum_j P(B|A_j)P(A_j)} \\quad \\text{(全概率+贝叶斯)}",
    ],
    notes: [
      'P(A) 是先验概率，P(A|B) 是后验概率',
      '全概率公式是贝叶斯公式的分母',
      '贝叶斯思维：根据新证据更新信念',
      '广泛应用于机器学习、医学诊断、垃圾邮件过滤',
    ],
    example: { description: '贝叶斯公式：检测阳性时真正患病概率', formula: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B|A)P(A)+P(B|\\neg A)P(\\neg A)}' },
  },
  {
    moduleKey: 'probability',
    id: 'prob-binomial-coef',
    title: '排列组合',
    definition: '排列考虑顺序，组合不考虑顺序。',
    formulas: [
      "P_n^k = \\frac{n!}{(n-k)!} \\quad \\text{(排列)}",
      "C_n^k = \\binom{n}{k} = \\frac{n!}{k!(n-k)!} \\quad \\text{(组合)}",
      "\\binom{n}{k} + \\binom{n}{k+1} = \\binom{n+1}{k+1} \\quad \\text{(帕斯卡恒等式)}",
    ],
    notes: [
      'C(n, k) = C(n, n-k)（对称性）',
      '有放回抽样用 n^k；无放回有序用排列；无放回无序用组合',
      '二项式定理：(a+b)^n = ΣC(n,k) a^(n-k) b^k',
      '组合数是帕斯卡三角形（杨辉三角）的第 n 行第 k 列',
    ],
    example: { description: '从5人中选3人排队的方法数', formula: 'P_5^3 = 60 \\text{（排列）}, C_5^3 = 10 \\text{（组合）}' },
  },

  // ========== 常微分方程 ==========
  {
    moduleKey: 'ode',
    id: 'ode-linear-first',
    title: '一阶线性 ODE',
    definition: '形如 y\' + P(x)y = Q(x) 的方程，可用积分因子法求解。',
    formulas: [
      "y' + P(x)y = Q(x)",
      "\\mu(x) = e^{\\int P(x)\\, dx} \\quad \\text{(积分因子)}",
      "y = \\frac{1}{\\mu(x)} \\left( \\int \\mu(x) Q(x)\\, dx + C \\right)",
    ],
    notes: [
      '必须先化为标准形式（y\' 的系数为 1）',
      '积分因子 μ(x) 只需一个原函数即可，不需要加 C',
      '两边同乘积分因子后，左边恰好是 (μ·y)\'',
      '齐次方程 Q(x)=0 是可分离变量方程的特例',
    ],
    example: { description: 'y\' + y = e^(-x)', formula: '\\mu = e^x,\\quad y = e^{-x}(x + C)' },
  },
  {
    moduleKey: 'ode',
    id: 'ode-second-order',
    title: '二阶常系数齐次 ODE',
    definition: "形如 y'' + py' + qy = 0 的方程，通过特征方程求解。",
    formulas: [
      "y'' + py' + qy = 0",
      "r^2 + pr + q = 0 \\quad \\text{(特征方程)}",
      "y = \\begin{cases} C_1 e^{r_1 x} + C_2 e^{r_2 x} & \\Delta > 0 \\\\ (C_1 + C_2 x)e^{r x} & \\Delta = 0 \\\\ e^{\\alpha x}(C_1\\cos\\beta x + C_2\\sin\\beta x) & \\Delta < 0 \\end{cases}",
    ],
    notes: [
      '解的结构：两个线性无关解的线性组合 = 通解',
      'Δ>0 两个不等实根：指数函数',
      'Δ=0 重根：乘 x 找第二个解',
      'Δ<0 共轭复根：欧拉公式化为三角函数形式',
    ],
    example: { description: 'y\'\' - 3y\' + 2y = 0', formula: 'r^2-3r+2=0 \\Rightarrow r_1=1,r_2=2 \\Rightarrow y=C_1 e^x + C_2 e^{2x}' },
  },
  {
    moduleKey: 'ode',
    id: 'ode-separable',
    title: '可分离变量方程',
    definition: '可以化为 f(y)dy = g(x)dx 形式的一阶方程，两边积分即得通解。',
    formulas: [
      "\\frac{dy}{dx} = f(x)g(y) \\quad \\Longrightarrow \\quad \\int \\frac{dy}{g(y)} = \\int f(x)\\, dx + C",
    ],
    notes: [
      '分离变量时注意 g(y) = 0 的解可能丢失',
      '积分后得到的是隐式通解，尽量化为显式 y = φ(x)',
      '齐次方程 y\' = f(y/x) 通过 u = y/x 换元可化为可分离变量',
      '是最简单也是最基础的 ODE 类型',
    ],
    example: { description: 'dy/dx = 2xy', formula: '\\int\\frac{dy}{y}=\\int 2x dx \\Rightarrow \\ln|y|=x^2+C \\Rightarrow y = Ce^{x^2}' },
  },

  // ========== 傅里叶级数 ==========
  {
    moduleKey: 'fourier',
    id: 'fourier-coeff',
    title: '傅里叶系数公式',
    definition: '周期函数 f(x) 可展开为三角函数级数，系数由积分确定。',
    formulas: [
      "f(x) = \\frac{a_0}{2} + \\sum_{n=1}^\\infty (a_n \\cos n\\omega x + b_n \\sin n\\omega x)",
      "a_0 = \\frac{2}{T}\\int_0^T f(x)\\, dx",
      "a_n = \\frac{2}{T}\\int_0^T f(x)\\cos n\\omega x\\, dx \\qquad b_n = \\frac{2}{T}\\int_0^T f(x)\\sin n\\omega x\\, dx",
    ],
    notes: [
      'ω = 2π/T 为基频，nω 为 n 次谐波',
      'a₀/2 是直流分量（平均值）',
      '奇次谐波构成方波',
      '吉布斯现象：间断点附近有约 9% 的超调，不能通过增加项数消除',
    ],
    example: { description: '方波的傅里叶级数', formula: 'f(x) = \\frac{4}{\\pi}\\sum_{n=1,3,5...}^\\infty \\frac{\\sin nx}{n}' },
  },
  {
    moduleKey: 'fourier',
    id: 'fourier-convergence',
    title: '收敛定理（狄利克雷）',
    definition: '满足狄利克雷条件的周期函数，其傅里叶级数收敛于 f(x) 的左右极限平均值。',
    formulas: [
      "S_n(x) \\to \\frac{f(x^+) + f(x^-)}{2} \\quad (n\\to\\infty)",
    ],
    notes: [
      '狄利克雷条件：一个周期内有限个极值点、有限个间断点、绝对可积',
      '连续点处收敛于 f(x)',
      '间断点处收敛于左右极限的平均值',
      '工程中大多数周期信号都满足狄利克雷条件',
    ],
    example: { description: '方波在间断点', formula: '\\text{在间断点 } x=x_0 \\text{ 处，级数收敛于 } \\frac{f(x_0^+)+f(x_0^-)}{2}' },
  },
  {
    moduleKey: 'fourier',
    id: 'fourier-parseval',
    title: '帕塞瓦尔恒等式',
    definition: '信号的能量（平方积分）等于各谐波分量能量之和。',
    formulas: [
      "\\frac{1}{T}\\int_0^T [f(x)]^2 dx = \\frac{a_0^2}{4} + \\frac{1}{2}\\sum_{n=1}^\\infty (a_n^2 + b_n^2)",
    ],
    notes: [
      '物理意义：能量守恒（时域能量 = 频域能量）',
      '可用于计算无穷级数的和',
      '在信号处理中非常重要',
      '是更一般的普朗歇尔定理的特例',
    ],
    example: { description: '利用帕塞瓦尔求级数和', formula: '\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6}' },
  },

  // ========== 复变函数 ==========
  {
    moduleKey: 'complex',
    id: 'complex-cr',
    title: '柯西-黎曼方程',
    definition: '复变函数 f(z) = u(x,y) + iv(x,y) 解析的必要（且在一定条件下充分）条件。',
    formulas: [
      "\\frac{\\partial u}{\\partial x} = \\frac{\\partial v}{\\partial y} \\qquad \\frac{\\partial u}{\\partial y} = -\\frac{\\partial v}{\\partial x}",
      "f'(z) = u_x + iv_x = v_y - iu_y",
    ],
    notes: [
      'C-R 方程是解析的必要条件，加上 u,v 偏导连续才是充要条件',
      '解析函数 = 在区域内每一点都可导',
      '可导 ⇒ 实虚部调和（满足拉普拉斯方程）',
      'f(z) = eˣ(cos y + i sin y) = eᶻ 在全平面解析',
    ],
    example: { description: 'f(z) = z² = (x²-y²) + i(2xy) 解析', formula: 'u_x=2x=v_y,\\ u_y=-2y=-v_x \\quad \\text{满足 C-R}' },
  },
  {
    moduleKey: 'complex',
    id: 'complex-residue',
    title: '留数定理',
    definition: '解析函数沿闭曲线的积分等于 2πi 乘以曲线所围各奇点留数之和。',
    formulas: [
      "\\oint_C f(z)\\, dz = 2\\pi i \\sum_{k} \\text{Res}(f, z_k)",
      "\\text{Res}(f, z_0) = \\lim_{z\\to z_0} (z-z_0)f(z) \\quad \\text{(一阶极点)}",
      "\\text{Res}(f, z_0) = \\frac{1}{(m-1)!}\\lim_{z\\to z_0}\\frac{d^{m-1}}{dz^{m-1}}[(z-z_0)^m f(z)] \\quad \\text{(m阶极点)}",
    ],
    notes: [
      '留数：洛朗展开中 -1 次项的系数',
      '可以用来计算实轴上的定积分（围道积分法）',
      '计算实积分的强大工具（无穷积分、三角函数积分等）',
      '柯西积分公式是留数定理的特例',
    ],
    example: { description: 'f(z) = 1/z 在 z=0 的留数', formula: '\\text{Res}(1/z, 0) = 1,\\quad \\oint \\frac{dz}{z} = 2\\pi i' },
  },

  // ========== 数论 ==========
  {
    moduleKey: 'number-theory',
    id: 'nt-congruence',
    title: '同余',
    definition: '若 m | (a-b)，则称 a, b 模 m 同余，记作 a ≡ b (mod m)。',
    formulas: [
      "a \\equiv b \\pmod{m} \\quad \\Longleftrightarrow \\quad m \\mid (a - b)",
      "a \\equiv b \\Rightarrow a+c \\equiv b+c,\\ ac \\equiv bc \\pmod{m}",
      "a \\equiv b,\\ c \\equiv d \\Rightarrow ac \\equiv bd \\pmod{m}",
    ],
    notes: [
      '同余保持加法、减法、乘法运算',
      '除法不保持：ac ≡ bc (mod m) 不一定推出 a ≡ b（当 gcd(c,m)≠1 时）',
      '同余类构成模 m 的完全剩余系 {0, 1, ..., m-1}',
      '费马小定理、欧拉定理都是同余的重要结果',
    ],
    example: { description: '17 ≡ 5 (mod 6)', formula: '17 \\equiv 5 \\pmod{6} \\quad \\because 6 \\mid (17-5)=12' },
  },
  {
    moduleKey: 'number-theory',
    id: 'nt-euler',
    title: '欧拉定理',
    definition: '若 a 与 m 互素，则 a^φ(m) ≡ 1 (mod m)，其中 φ(m) 为欧拉函数。',
    formulas: [
      "a^{\\varphi(m)} \\equiv 1 \\pmod{m} \\quad (\\gcd(a,m) = 1)",
      "\\varphi(n) = n \\prod_{p|n} \\left(1 - \\frac{1}{p}\\right)",
      "a^{p-1} \\equiv 1 \\pmod{p} \\quad \\text{(费马小定理，m=p为素数)}",
    ],
    notes: [
      'φ(m) 表示 1..m 中与 m 互素的数的个数',
      'φ 是积性函数：若 gcd(m,n)=1，则 φ(mn)=φ(m)φ(n)',
      '常用于简化大指数模运算（降幂）',
      'RSA 加密算法的理论基础',
    ],
    example: { description: '求 3¹⁰⁰ mod 7', formula: '3^6\\equiv1\\pmod{7}, \\ 3^{100}=3^{6\\cdot16+4}\\equiv3^4=81\\equiv4\\pmod{7}' },
  },
  {
    moduleKey: 'number-theory',
    id: 'nt-gcd',
    title: '最大公约数与欧几里得算法',
    definition: 'gcd(a, b) 是 a, b 的公共因数中最大的那个，可通过辗转相除法高效计算。',
    formulas: [
      "\\gcd(a, b) = \\gcd(b, a \\bmod b)",
      "a \\times b = \\gcd(a,b) \\times \\text{lcm}(a,b)",
      "\\exists x,y \\in \\mathbb{Z},\\ ax + by = \\gcd(a,b) \\quad \\text{(贝祖定理)}",
    ],
    notes: [
      '欧几里得算法时间复杂度 O(log min(a,b))，非常高效',
      '扩展欧几里得算法可以同时求出贝祖系数 x,y',
      '求模逆元、解线性同余方程都依赖扩展欧几里得',
      'gcd(a, b) 是集合 {ax+by | x,y∈ℤ} 中的最小正整数',
    ],
    example: { description: 'gcd(48, 18)', formula: '48=2\\cdot18+12,\\ 18=1\\cdot12+6,\\ 12=2\\cdot6+0 \\Rightarrow \\gcd=6' },
  },

  // ========== 数学竞赛 ==========
  {
    moduleKey: 'competition',
    id: 'comp-amgm',
    title: 'AM-GM 不等式',
    definition: '算术均值 ≥ 几何均值，等号成立当且仅当各数相等。',
    formulas: [
      "\\frac{a_1 + a_2 + \\cdots + a_n}{n} \\geq \\sqrt[n]{a_1 a_2 \\cdots a_n} \\quad (a_i > 0)",
      "a + b \\geq 2\\sqrt{ab} \\quad \\text{(二元特例)}",
      "a + b + c \\geq 3\\sqrt[3]{abc} \\quad \\text{(三元特例)}",
    ],
    notes: [
      '等号成立当且仅当 a₁ = a₂ = ... = aₙ',
      '常用于求最值（和定积最大，积定和最小）',
      '使用技巧：凑项、拆项、配系数',
      '是均值不等式链的中间：调和 ≤ 几何 ≤ 算术 ≤ 平方',
    ],
    example: { description: 'x>0 时 x+1/x 的最小值', formula: 'x + \\frac{1}{x} \\geq 2\\sqrt{x\\cdot\\frac{1}{x}} = 2,\\ x=1 \\text{ 时取等}' },
  },
  {
    moduleKey: 'competition',
    id: 'comp-cauchy',
    title: '柯西不等式',
    definition: '向量内积的绝对值不超过模长的乘积。',
    formulas: [
      "(a_1^2+a_2^2+\\cdots+a_n^2)(b_1^2+\\cdots+b_n^2) \\geq (a_1b_1+\\cdots+a_nb_n)^2",
      "|a \\cdot b| \\leq |a| \\cdot |b| \\quad \\text{(向量形式)}",
    ],
    notes: [
      '等号成立当且仅当两个向量成比例（对应分量比值相等）',
      '二维形式：(a²+b²)(c²+d²) ≥ (ac+bd)²',
      '积分形式也叫柯西-施瓦茨不等式',
      '竞赛中常用于证明不等式、求最值',
    ],
    example: { description: '已知 a²+b²=1，求 a+2b 最大值', formula: '(a^2+b^2)(1^2+2^2)\\geq(a+2b)^2 \\Rightarrow a+2b\\leq\\sqrt{5}' },
  },
  {
    moduleKey: 'competition',
    id: 'comp-jensen',
    title: '琴生不等式',
    definition: '凸函数的函数值平均 ≥ 平均的函数值；凹函数反之。',
    formulas: [
      "f\\left(\\frac{x_1+\\cdots+x_n}{n}\\right) \\leq \\frac{f(x_1)+\\cdots+f(x_n)}{n} \\quad \\text{(凸函数,下凸)}",
      "f(\\lambda x_1 + (1-\\lambda)x_2) \\leq \\lambda f(x_1) + (1-\\lambda)f(x_2)",
    ],
    notes: [
      '二阶导数 ≥ 0 为凸函数（下凸），≤ 0 为凹函数（上凸）',
      '琴生不等式是很多经典不等式的统一形式（AM-GM 是 -lnx 的琴生）',
      '加权形式也成立：f(Σλᵢxᵢ) ≤ Σλᵢf(xᵢ)（Σλᵢ=1, λᵢ≥0）',
      '竞赛中常用于对称不等式证明',
    ],
    example: { description: 'sin x 在 (0, π) 上凹', formula: '\\frac{\\sin A+\\sin B+\\sin C}{3} \\leq \\sin\\frac{A+B+C}{3} = \\frac{\\sqrt{3}}{2}' },
  },
  {
    moduleKey: 'competition',
    id: 'comp-inequality-chain',
    title: '均值不等式链',
    definition: '调和均值 ≤ 几何均值 ≤ 算术均值 ≤ 平方均值。',
    formulas: [
      "\\frac{n}{\\frac{1}{a_1}+\\cdots+\\frac{1}{a_n}} \\leq \\sqrt[n]{a_1\\cdots a_n} \\leq \\frac{a_1+\\cdots+a_n}{n} \\leq \\sqrt{\\frac{a_1^2+\\cdots+a_n^2}{n}}",
      "H \\leq G \\leq A \\leq Q",
    ],
    notes: [
      '等号均成立当且仅当 a₁ = a₂ = ... = aₙ',
      'HM-GM-AM 常用于正数最值问题',
      'QM-AM 可由柯西不等式直接推出',
      '还有加权形式的均值不等式链',
    ],
    example: { description: 'a,b>0, a+b=1 时 1/a + 1/b 的最小值', formula: '\\frac{1}{a}+\\frac{1}{b} = \\frac{a+b}{ab} = \\frac{1}{ab} \\geq \\frac{1}{(\\frac{a+b}{2})^2} = 4' },
  },
];
