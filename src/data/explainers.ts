// 数竞高频知识点原理讲解数据
// 每条是一个"为什么/怎么用"的拆解，公式用 LaTeX（不带 $），交给 MathRenderer 渲染

export interface ExplainerStep {
  title: string;
  body: string;
  formula?: string;
}

export interface ExplainerTopic {
  id: string;
  title: string;
  tag: string;
  /** 难度：基础 / 进阶 / 竞赛 */
  level: '基础' | '进阶' | '竞赛';
  essence: string;
  whenToUse: string[];
  steps: ExplainerStep[];
  example: {
    problem: string;
    walkthrough: string[];
    result: string;
  };
}

export const EXPLAINER_TOPICS: ExplainerTopic[] = [
  {
    id: 'rolle',
    title: '罗尔定理：构造辅助函数',
    tag: '中值定理',
    level: '竞赛',
    essence:
      '要证"存在一点使某个等式成立"，把等式移项成"某函数的导数=0"，再验证这个函数在区间两端值相等，罗尔定理自动给出答案。',
    whenToUse: [
      '结论里出现"存在 ξ ∈ (a,b)"',
      '函数在 [a,b] 连续、(a,b) 可导',
      '要证的式子含 f 与 f′ 的混合等式',
    ],
    steps: [
      {
        title: '移项归零',
        body: '把要证的等式右边全部移到左边，让右边 = 0。',
      },
      {
        title: '认出 F(x)',
        body: '把 ξ 换成 x，把左边认成某个 F(x) 的导数 F′(x)。常见导数形式：',
        formula: "(e^{x}f(x))'=e^{x}(f+f')\\quad(f(x)g(x))'=f'g+fg'\\quad(f(x)-ax-b)'=f'-a",
      },
      {
        title: '验两端',
        body: '验证 F(a)=F(b)。若不等，重新猜 F；若相等，进入下一步。',
      },
      {
        title: '套定理回代',
        body: '由罗尔定理，存在 ξ 使 F′(ξ)=0，回代即得要证的等式。',
      },
    ],
    example: {
      problem:
        'f 在 [0,1] 连续、(0,1) 可导，f(0)=0，f(1)=1，证存在 ξ 使 f′(ξ)=2ξ。',
      walkthrough: [
        '移项：f′(ξ)−2ξ=0。',
        '认出 F(x)=f(x)−x²，其导数 F′(x)=f′(x)−2x。',
        '验两端：F(0)=0−0=0，F(1)=1−1=0，相等。',
        '罗尔：存在 ξ 使 F′(ξ)=0，即 f′(ξ)=2ξ。',
      ],
      result: 'f′(ξ)=2ξ',
    },
  },
  {
    id: 'squeeze',
    title: '夹逼定理：怎么"夹"',
    tag: '极限',
    level: '基础',
    essence:
      '找两个上下界 g、h，让 g≤f≤h，且 g 和 h 的极限相等，那么 f 被"挤"到同一个极限。',
    whenToUse: [
      'n 项和/积的极限，每项有波动',
      '含 sin、cos 等有界振荡量',
      '直接算太繁，但能放缩到好算的形式',
    ],
    steps: [
      {
        title: '找振荡量的界',
        body: '先把有界函数夹住，例如 sin、cos 的范围是 [-1,1]。',
        formula: '-1\\le\\sin x\\le 1',
      },
      {
        title: '全式放缩',
        body: '不等式三边同时乘/加同号量，保持不等号方向，得到 g(n)≤aₙ≤h(n)。',
      },
      {
        title: '算两端极限',
        body: '分别求 lim g(n) 与 lim h(n)。',
      },
      {
        title: '等号成立',
        body: '若两端极限相同 L，则 lim aₙ=L。',
        formula: 'g(n)\\le a_n\\le h(n),\\ \\lim g=\\lim h=L\\ \\Rightarrow\\ \\lim a_n=L',
      },
    ],
    example: {
      problem: '求 lim(n→∞) (sin n)/n。',
      walkthrough: [
        '由 −1≤sin n≤1，三边除以 n>0。',
        '得 −1/n ≤ (sin n)/n ≤ 1/n。',
        '两端极限：lim(−1/n)=0，lim(1/n)=0。',
        '夹逼：中间项极限也是 0。',
      ],
      result: '\\displaystyle\\lim_{n\\to\\infty}\\frac{\\sin n}{n}=0',
    },
  },
  {
    id: 'lhopital',
    title: '洛必达：什么时候才能用',
    tag: '极限',
    level: '基础',
    essence:
      '只有 0/0 或 ∞/∞ 型，且求导后极限存在（或为 ∞）时，才能上下分别求导再取极限。乱用必错。',
    whenToUse: [
      '代入后是 0/0 或 ∞/∞',
      '求导后式子更简单',
      '导函数之比极限存在',
    ],
    steps: [
      {
        title: '先定型',
        body: '代入 x→a，确认是 0/0 或 ∞/∞，不是这个型不能用。',
      },
      {
        title: '再验可导',
        body: '分母在邻域内不为 0，且分子分母都可导。',
      },
      {
        title: '分别求导',
        body: '分子、分母各自求导，不是对整个分式求导。',
        formula: '\\lim\\frac{f(x)}{g(x)}=\\lim\\frac{f\'(x)}{g\'(x)}',
      },
      {
        title: '可重复用',
        body: '若求导后仍是未定式，且条件满足，可再次洛必达。',
      },
    ],
    example: {
      problem: '求 lim(x→0) (sin x)/x。',
      walkthrough: [
        '代入 x=0：0/0，是未定式。',
        '分子求导 cos x，分母求导 1。',
        '得 lim cos x / 1 = cos 0 = 1。',
      ],
      result: '\\displaystyle\\lim_{x\\to 0}\\frac{\\sin x}{x}=1',
    },
  },
  {
    id: 'taylor',
    title: '泰勒展开：阶数怎么选',
    tag: '级数',
    level: '进阶',
    essence:
      '展到"抵消后余项刚好比需要的高阶"为止——多一项浪费，少一项消不掉。',
    whenToUse: [
      '求极限中含多个小量相加',
      '要判断无穷小的阶',
      '洛必达用不动的式子',
    ],
    steps: [
      {
        title: '标出每部分最低次',
        body: '看展开后各项 x 的幂次，找出最低那几项。',
        formula: '\\sin x=x-\\frac{x^3}{6}+o(x^3)',
      },
      {
        title: '抵消预测',
        body: '若两项最低次相同会相消，就多展一阶，直到出现不抵消的项。',
      },
      {
        title: '写皮亚诺余项',
        body: '末尾写 o(x^n)，表示高阶小量。',
      },
      {
        title: '代入求极限',
        body: '只保留最低非零次，比值即得极限。',
      },
    ],
    example: {
      problem: '求 lim(x→0) (sin x − x)/x³。',
      walkthrough: [
        'sin x = x − x³/6 + o(x³)。',
        '分子 sin x − x = −x³/6 + o(x³)。',
        '除以 x³：−1/6 + o(1)。',
      ],
      result: '\\displaystyle\\lim_{x\\to 0}\\frac{\\sin x-x}{x^3}=-\\frac{1}{6}',
    },
  },
  {
    id: 'equivalent',
    title: '等价无穷小：能在哪儿换',
    tag: '极限',
    level: '基础',
    essence:
      '乘除结构里可以把复杂的无穷小换成同阶的简单量，极限不变；加减结构里直接换会丢掉同阶项，必须多展一阶。',
    whenToUse: [
      '0/0 型极限，式子里出现 sin、tan、ln(1+x)、e^x−1',
      '复杂因子以乘除形式出现',
      '想快速判断无穷小的阶',
    ],
    steps: [
      {
        title: '认标准等价关系',
        body: 'x 趋于 0 时，下面这几组是最常用的替换。',
        formula:
          '\\sin x\\sim x,\\quad \\tan x\\sim x,\\quad \\ln(1+x)\\sim x,\\quad e^{x}-1\\sim x,\\quad 1-\\cos x\\sim\\frac{x^{2}}{2}',
      },
      {
        title: '只在乘除里直接换',
        body: '整个因子可以替换；因子处在加减里时，换完可能和别的项同阶相消，答案就错了。',
      },
      {
        title: '加减要展到不抵消',
        body: '改用泰勒，展到第一项不被抵消的阶，再比较系数。',
      },
      {
        title: '复核阶数',
        body: '替换后看分子分母的最低次是否匹配，阶数对不上说明换错了。',
      },
    ],
    example: {
      problem: '求 lim(x→0) (tan x − sin x)/x³。',
      walkthrough: [
        'tan x = x + x³/3 + o(x³)，sin x = x − x³/6 + o(x³)。',
        '相减得 x³/2 + o(x³)。',
        '除以 x³，极限为 1/2。',
      ],
      result: '\\displaystyle\\lim_{x\\to 0}\\frac{\\tan x-\\sin x}{x^{3}}=\\frac{1}{2}',
    },
  },
  {
    id: 'riemann',
    title: '定积分定义：和式变积分',
    tag: '积分',
    level: '基础',
    essence:
      'n 项和只要能凑成 (1/n)Σf(i/n)，它的极限就是 f 在 [0,1] 上的定积分——求和算不动时的标准出路。',
    whenToUse: [
      '求 n 项和的极限，分母次数比分子高一次',
      '和式里出现 i/n 这样的结构',
      '硬求和求不出来',
    ],
    steps: [
      {
        title: '提出 1/n',
        body: '把和式写成 (1/n)Σ 的形式，多出来的因子并进被积函数。',
      },
      {
        title: '认出被积函数',
        body: '把 i/n 整体看成 x，i 从 1 到 n 对应 x 从 0 到 1。',
        formula:
          '\\lim_{n\\to\\infty}\\frac{1}{n}\\sum_{i=1}^{n}f\\!\\left(\\frac{i}{n}\\right)=\\int_{0}^{1}f(x)\\,dx',
      },
      {
        title: '端点不影响极限',
        body: '取 i=1 到 n，还是 0 到 n−1，只差有限项，极限相同。',
      },
      {
        title: '算这个积分',
        body: '转成定积分后直接用牛顿-莱布尼茨求值。',
      },
    ],
    example: {
      problem: '求 lim (1/n)(√(1/n) + √(2/n) + … + √(n/n))。',
      walkthrough: [
        '写成 (1/n)Σ√(i/n)。',
        '对应 ∫₀¹ √x dx。',
        '算得 2/3。',
      ],
      result: '\\displaystyle\\int_{0}^{1}\\sqrt{x}\\,dx=\\frac{2}{3}',
    },
  },
  {
    id: 'byparts',
    title: '分部积分：谁当 u',
    tag: '积分',
    level: '基础',
    essence:
      '把不好积的 ∫u dv 换成 uv − ∫v du；u 选对了，剩下的积分一定比原来简单。',
    whenToUse: [
      '被积函数是两类函数相乘',
      '出现 ln x、arctan x 单独一个因子',
      '换元之后仍然积不出来',
    ],
    steps: [
      {
        title: '套公式',
        body: '目标是让 ∫v du 比原积分好算。',
        formula: '\\int u\\,dv=uv-\\int v\\,du',
      },
      {
        title: '按口诀选 u',
        body: '反对幂指三：反三角、对数、幂函数、指数、三角函数，排在前面的当 u。',
      },
      {
        title: '循环积分',
        body: 'e^x 乘三角函数这类，做两次会回到原式，移项解出即可。',
      },
      {
        title: '定积分带上下限',
        body: '上下限要跟着 uv 那一项一起代。',
        formula: '\\int_{a}^{b}u\\,dv=\\Bigl[uv\\Bigr]_{a}^{b}-\\int_{a}^{b}v\\,du',
      },
    ],
    example: {
      problem: '求 ∫ x e^x dx。',
      walkthrough: [
        '取 u = x，dv = e^x dx。',
        '则 du = dx，v = e^x。',
        '代公式：x e^x − ∫e^x dx = x e^x − e^x + C。',
      ],
      result: '\\displaystyle\\int x e^{x}\\,dx=(x-1)e^{x}+C',
    },
  },
  {
    id: 'series-test',
    title: '级数判敛：先排除再选法',
    tag: '级数',
    level: '基础',
    essence:
      '通项不趋于 0 直接发散；正项级数用比值或比较，交错级数用莱布尼茨，任意项先看绝对收敛。',
    whenToUse: [
      '判断 Σaₙ 的敛散性',
      '求收敛半径与收敛域',
      '解答里需要写明用了哪个判别法',
    ],
    steps: [
      {
        title: '通项先趋于 0',
        body: '这是必要条件，不满足就可以直接判发散。',
        formula: '\\lim_{n\\to\\infty}a_{n}=0',
      },
      {
        title: '正项：比值或根值',
        body: '极限小于 1 收敛，大于 1 发散，等于 1 判别法失效。',
        formula: '\\lim_{n\\to\\infty}\\frac{a_{n+1}}{a_{n}}=q',
      },
      {
        title: '正项：拿来比较',
        body: '用 p 级数当标尺，p 大于 1 时收敛。',
        formula: '\\sum_{n=1}^{\\infty}\\frac{1}{n^{p}}',
      },
      {
        title: '交错：莱布尼茨',
        body: '通项单调递减且趋于 0 即收敛，截断误差不超过第一个被舍去的项。',
        formula: 'a_{n}\\downarrow 0',
      },
      {
        title: '任意项：先看绝对收敛',
        body: '绝对收敛必然收敛；只有条件收敛时才要单独说明。',
        formula: '\\sum|a_{n}|<+\\infty',
      },
    ],
    example: {
      problem: '判断 Σ n/2ⁿ 的敛散性。',
      walkthrough: [
        '通项 n/2ⁿ 趋于 0，必要条件满足。',
        '比值 aₙ₊₁/aₙ = (n+1)/(2n) 趋于 1/2，小于 1。',
        '由比值判别法，级数收敛。',
      ],
      result: '\\displaystyle\\sum_{n=1}^{\\infty}\\frac{n}{2^{n}}=2',
    },
  },
  {
    id: 'rank',
    title: '矩阵的秩：一个数管三件事',
    tag: '线代',
    level: '基础',
    essence:
      '秩等于阶梯形的非零行数，也等于极大线性无关组中向量的个数；它同时决定方程组解的自由度和向量组的线性相关性。',
    whenToUse: [
      '含参数矩阵讨论秩',
      '判断向量组是否线性相关',
      '判断线性方程组解的结构',
    ],
    steps: [
      {
        title: '初等行变换',
        body: '只用行变换化成阶梯形，秩在这个过程中保持不变。',
      },
      {
        title: '数非零行',
        body: '非零行的个数就是秩，行秩等于列秩。',
        formula: 'r(A)=r(A^{\\mathsf{T}})',
      },
      {
        title: '自由度',
        body: 'Ax=0 的基础解系含有 n − r(A) 个向量。',
        formula: '\\dim\\ker A=n-r(A)',
      },
      {
        title: '解的判定',
        body: 'r(A) 与 r(A|b) 相等才有解：等于 n 唯一，小于 n 无穷多；不等则无解。',
      },
    ],
    example: {
      problem: '矩阵 A 的三行为 (1,2,3)、(2,4,6)、(1,1,1)，求 r(A)。',
      walkthrough: [
        '第二行是第一行的 2 倍，消去后归零。',
        '第一行减第三行得 (0,1,2)。',
        '还剩两个非零行。',
      ],
      result: 'r(A)=2',
    },
  },
  {
    id: 'positive-definite',
    title: '二次型正定：三种判法',
    tag: '线代',
    level: '基础',
    essence:
      '正定等价于顺序主子式全正，也等价于对称矩阵特征值全正；只判正定用主子式，要标准形时用特征值。',
    whenToUse: [
      '判断二次型是否正定',
      '求参数范围使二次型正定',
      '化标准形、求惯性指数',
    ],
    steps: [
      {
        title: '写出对称矩阵',
        body: '交叉项的系数要除以 2 才是矩阵里的元素。',
        formula: 'f(x)=x^{\\mathsf{T}}Ax',
      },
      {
        title: '顺序主子式',
        body: '从左上角起，所有顺序主子式都大于 0。',
        formula: '\\Delta_{1}>0,\\ \\Delta_{2}>0,\\ \\dots,\\ \\Delta_{n}>0',
      },
      {
        title: '特征值',
        body: '实对称矩阵特征值全大于 0，同样等价于正定。',
        formula: '\\lambda_{i}>0\\quad(i=1,\\dots,n)',
      },
      {
        title: '配方法',
        body: '化成平方和，正平方项的个数就是正惯性指数。',
      },
    ],
    example: {
      problem: 'f = x₁² + 2x₂² + 3x₃² + 2x₁x₂，判断它是否正定。',
      walkthrough: [
        '对称矩阵前两行列为 1、1、0 与 1、2、0，第三对角元为 3。',
        'Δ₁ = 1 > 0，Δ₂ = 2 − 1 = 1 > 0，Δ₃ = 3 > 0。',
        '顺序主子式全正，所以正定。',
      ],
      result: '\\Delta_{1}=1,\\ \\Delta_{2}=1,\\ \\Delta_{3}=3',
    },
  },
  {
    id: 'bayes',
    title: '全概率与贝叶斯：反推原因',
    tag: '概率',
    level: '基础',
    essence:
      '结果是若干原因之一造成的时候，先按原因分组算全概率，再用贝叶斯把分母换成它，反推到底是哪个原因。',
    whenToUse: [
      '题目分两步：先选来源，再做试验',
      '已知结果，反推原因的概率',
      '次品率、检测、抽签类问题',
    ],
    steps: [
      {
        title: '设完备事件组',
        body: '把原因 B₁ 到 Bₙ 取成互斥且覆盖整个样本空间。',
        formula: '\\sum_{i=1}^{n}P(B_{i})=1',
      },
      {
        title: '全概率公式',
        body: '按原因把结果 A 拆开再求和。',
        formula: 'P(A)=\\sum_{i=1}^{n}P(B_{i})\\,P(A\\mid B_{i})',
      },
      {
        title: '贝叶斯公式',
        body: '分子是某条原因贡献的那一份，分母就是上一步算出的全概率。',
        formula: 'P(B_{k}\\mid A)=\\frac{P(B_{k})\\,P(A\\mid B_{k})}{P(A)}',
      },
      {
        title: '检查分母',
        body: '分母必须等于全概率，漏项或重复计算都会让答案偏离。',
      },
    ],
    example: {
      problem: '两台机器产量占 60% 与 40%，次品率分别 1% 与 2%。任取一件是次品，它来自第一台的概率？',
      walkthrough: [
        'P(A) = 0.6×0.01 + 0.4×0.02 = 0.014。',
        '分子 = 0.6×0.01 = 0.006。',
        '相除得 3/7。',
      ],
      result: 'P(B_{1}\\mid A)=\\frac{3}{7}',
    },
  },
  {
    id: 'distribution',
    title: '分布识别：数次数还是等时间',
    tag: '概率',
    level: '基础',
    essence:
      '数成功次数用二项，稀有事件计数用泊松，不放回用超几何，等时间用指数；先定类型，再套期望方差。',
    whenToUse: [
      '写分布律或概率密度',
      '求期望与方差',
      '判断题目该用哪个分布',
    ],
    steps: [
      {
        title: '先定类型',
        body: '离散计数还是连续等待，这一步定错，后面全错。',
      },
      {
        title: '二项分布',
        body: 'n 次独立重复试验，每次成功概率为 p。',
        formula: 'X\\sim B(n,p),\\quad E(X)=np,\\quad D(X)=np(1-p)',
      },
      {
        title: '泊松分布',
        body: '单位时间或单位面积内的稀有事件计数，参数 λ = np。',
        formula: 'X\\sim P(\\lambda),\\quad E(X)=D(X)=\\lambda',
      },
      {
        title: '超几何与指数',
        body: '不放回抽样用超几何；等待时间且具有无记忆性用指数分布。',
      },
      {
        title: '正态标准化',
        body: '遇到正态分布先标准化，再查表。',
        formula: 'Z=\\frac{X-\\mu}{\\sigma}\\sim N(0,1)',
      },
    ],
    example: {
      problem: '100 件产品中有 5 件次品，不放回取 3 件，X 为其中的次品数，求分布律。',
      walkthrough: [
        '不放回抽样，属于超几何分布。',
        '从 5 件次品中取 k 件，从 95 件正品中取 3−k 件。',
        '再除以总取法 C(100,3)。',
      ],
      result: 'P(X=k)=\\frac{\\binom{5}{k}\\binom{95}{3-k}}{\\binom{100}{3}}',
    },
  },
  {
    id: 'taylor-table',
    title: '泰勒常用展开：背这张表',
    tag: '极限',
    level: '基础',
    essence:
      '求极限、判无穷小的阶、做近似，八成就用这几个展开；记到三次项，绝大多数题够用。',
    whenToUse: [
      '0/0 型但洛必达越算越复杂',
      '要判断无穷小的阶',
      '做近似计算或估计误差',
    ],
    steps: [
      {
        title: '基准点选 0',
        body: 'x 趋于 0 时用麦克劳林展开，项少、收敛快。',
        formula:
          'f(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(0)}{k!}x^{k}+o(x^{n})',
      },
      {
        title: '先记三角函数',
        body: 'sin 与 cos 的展开正负号交替，隔项出现。',
        formula:
          '\\sin x=x-\\frac{x^{3}}{6}+o(x^{3}),\\quad \\cos x=1-\\frac{x^{2}}{2}+\\frac{x^{4}}{24}+o(x^{4})',
      },
      {
        title: '再记指数与对数',
        body: '这两个最常出现在分母带 x² 或 x³ 的题里。',
        formula:
          'e^{x}=1+x+\\frac{x^{2}}{2}+\\frac{x^{3}}{6}+o(x^{3}),\\quad \\ln(1+x)=x-\\frac{x^{2}}{2}+\\frac{x^{3}}{3}+o(x^{3})',
      },
      {
        title: '幂函数与正切',
        body: 'α 是任意实数，(1+x)^α 的二项展开照样成立。',
        formula:
          '(1+x)^{\\alpha}=1+\\alpha x+\\frac{\\alpha(\\alpha-1)}{2}x^{2}+o(x^{2}),\\quad \\tan x=x+\\frac{x^{3}}{3}+o(x^{3})',
      },
      {
        title: '阶数取够就停',
        body: '分母是 x 的几次就展到几次，多展是浪费，少展会漏项。',
      },
    ],
    example: {
      problem: '求 lim(x→0) (e^x − 1 − x)/x²。',
      walkthrough: [
        'e^x = 1 + x + x²/2 + o(x²)。',
        '分子 = x²/2 + o(x²)。',
        '除以 x²，极限为 1/2。',
      ],
      result: '\\displaystyle\\lim_{x\\to 0}\\frac{e^{x}-1-x}{x^{2}}=\\frac{1}{2}',
    },
  },
  {
    id: 'mvt-construct',
    title: '中值定理：辅助函数对照表',
    tag: '中值定理',
    level: '竞赛',
    essence:
      '结论里 f 与 f′ 的搭配方式，基本决定了辅助函数长什么样；记住几组对照，比现场硬猜快得多。',
    whenToUse: [
      '要证的等式同时含 f 与 f′',
      '结论形如 ξf′(ξ) 加 kf(ξ) 等于 0',
      '想过一遍常见构造，避免漏解',
    ],
    steps: [
      {
        title: '先整理系数',
        body: '把结论整理成含 ξ 的表达式等于 0，观察 f 与 f′ 前面的系数。',
        formula: "f'(\\xi)+k\\,f(\\xi)=0",
      },
      {
        title: '见 f′ 加 kf：乘指数',
        body: '乘 e^{kx} 之后，乘积的导数正好提出这个组合。',
        formula: "\\bigl(e^{kx}f(x)\\bigr)'=e^{kx}\\bigl(f'(x)+k\\,f(x)\\bigr)",
      },
      {
        title: '见 ξf′ 加 f：乘 x',
        body: '乘 x 之后，乘积的导数就是 f 加 xf′。',
        formula: "\\bigl(x\\,f(x)\\bigr)'=f(x)+x\\,f'(x)",
      },
      {
        title: '见 ξf′ 减 f：除以 x',
        body: '除以 x 之后，商的导数分子正好是 xf′ 减 f。',
        formula: "\\left(\\frac{f(x)}{x}\\right)'=\\frac{x\\,f'(x)-f(x)}{x^{2}}",
      },
      {
        title: '回代验两端',
        body: '构造完先算 F(a) 与 F(b)，不相等就换一组因子重来。',
      },
    ],
    example: {
      problem:
        'f 在 [0,1] 上连续、(0,1) 内可导，且 f(0)=f(1)=0，证存在 ξ 使 f′(ξ)+f(ξ)=0。',
      walkthrough: [
        '结论已经写成 f′ + f = 0 的形式。',
        '乘 e^x 构造 F(x)=e^x f(x)，则 F′(x)=e^x(f′+f)。',
        'F(0)=0，F(1)=e·f(1)=0，两端相等。',
        '罗尔定理给出 F′(ξ)=0，即 f′(ξ)+f(ξ)=0。',
      ],
      result: "f'(\\xi)+f(\\xi)=0",
    },
  },
  {
    id: 'lagrange',
    title: '拉格朗日乘数法：条件极值',
    tag: '多元',
    level: '进阶',
    essence:
      '把约束乘上 λ 加进目标函数，条件极值就变成新函数的无条件驻点问题；λ 还顺便告诉你约束松一点能多赚多少。',
    whenToUse: [
      '求条件极值，约束是等式',
      '约束有两三个，目标函数可导',
      '应用题里求「在预算内最大化」这类问题',
    ],
    steps: [
      {
        title: '构造拉格朗日函数',
        body: '目标函数加上 λ 乘约束（约束写成 φ = 0 的形式）。',
        formula: 'L(x,y,\\lambda)=f(x,y)+\\lambda\\,\\varphi(x,y)',
      },
      {
        title: '所有偏导置零',
        body: '对每个变量和对 λ 各求一次偏导，全部等于 0。',
        formula: 'L_{x}=0,\\quad L_{y}=0,\\quad L_{\\lambda}=0',
      },
      {
        title: '消 λ 求解',
        body: '前两个方程消去 λ，得到 x 与 y 的关系，再代回约束方程。',
      },
      {
        title: '判断是最大还是最小',
        body: '实际问题按意义判断即可；理论题比较各候选点的函数值，或补二阶条件。',
      },
      {
        title: 'λ 的经济含义',
        body: 'λ 是最优值对约束右端的敏感度，约束放宽一个单位，最优值大约变化 λ。',
      },
    ],
    example: {
      problem: '求 f = xy 在约束 x + y = 1 下的最大值。',
      walkthrough: [
        '构造 L = xy + λ(x + y − 1)。',
        '偏导：y + λ = 0，x + λ = 0，得 x = y。',
        '代回约束：x = y = 1/2。',
        '最大值为 1/4，此时 λ = −1/2。',
      ],
      result: '\\max f=\\frac{1}{4}',
    },
  },
  {
    id: 'linear-ode',
    title: '一阶线性方程：通解公式',
    tag: '微分方程',
    level: '基础',
    essence:
      'y′ + P(x)y = Q(x) 有一套固定解法，背下公式最快；记不住就用积分因子现场推，两分钟能推完。',
    whenToUse: [
      '方程对 y 和 y′ 都是一次的',
      'Q(x) 是任意函数，不能分离变量',
      '带初值的一阶线性问题',
    ],
    steps: [
      {
        title: '化成标准形',
        body: '把 y′ 的系数化为 1，右边只剩 Q(x)。',
        formula: "y'+P(x)\\,y=Q(x)",
      },
      {
        title: '找积分因子',
        body: '把 P 积分后取指数，乘上去左边就变成一个乘积的导数。',
        formula: '\\mu(x)=e^{\\int P(x)\\,dx}',
      },
      {
        title: '套通解公式',
        body: '两边同乘积分因子再积分，直接得到通解。',
        formula:
          'y=e^{-\\int P\\,dx}\\left(\\int Q\\,e^{\\int P\\,dx}\\,dx+C\\right)',
      },
      {
        title: '代初值',
        body: '先写通解，再把 y(x₀)=y₀ 代进去定常数 C。',
      },
    ],
    example: {
      problem: '求 y′ + y = e^x 的通解。',
      walkthrough: [
        'P(x) = 1，积分因子为 e^x。',
        '两边乘 e^x：(e^x y)′ = e^{2x}。',
        '积分得 e^x y = e^{2x}/2 + C。',
        '除以 e^x：y = e^x/2 + Ce^{−x}。',
      ],
      result: 'y=\\frac{1}{2}e^{x}+Ce^{-x}',
    },
  },
  {
    id: 'double-integral-order',
    title: '二重积分：换序与极坐标',
    tag: '多元',
    level: '进阶',
    essence:
      '二重积分难的不是积分，是定限：先画区域图，再决定先对谁积；圆域直接上极坐标。',
    whenToUse: [
      '内层积不出原函数，比如 e 的 x 平方',
      '区域是圆、扇形、圆环',
      '被积函数含 x² + y²',
    ],
    steps: [
      {
        title: '先画区域',
        body: '把边界曲线和交点画清楚，后面所有上下限都从这张图读出来。',
      },
      {
        title: '写成 X 型或 Y 型',
        body: 'X 型：x 在固定区间内，y 夹在两条曲线之间，先对 y 积分。',
        formula:
          'D=\\{(x,y)\\mid a\\le x\\le b,\\ y_{1}(x)\\le y\\le y_{2}(x)\\}',
      },
      {
        title: '积不动就换序',
        body: '把区域按另一个方向重新切片，上下限整体换掉，区域本身不变。',
      },
      {
        title: '极坐标替换',
        body: '圆域用极坐标，面积元 dxdy 换成 r dr dθ，这个 r 千万不能丢。',
        formula:
          'x=r\\cos\\theta,\\quad y=r\\sin\\theta,\\quad dx\\,dy=r\\,dr\\,d\\theta',
      },
      {
        title: '定角度',
        body: '从原点出发画射线扫过整个区域，扫过的起止角就是 θ 的范围。',
      },
    ],
    example: {
      problem: 'D 由 y = x、y = 1、x = 0 围成，求 e 的 y 平方在 D 上的二重积分。',
      walkthrough: [
        '区域是三角形，先对 x 积：内层从 0 到 y。',
        '内层积出 y 乘 e 的 y 平方。',
        '再对 y 从 0 到 1 积分。',
        '结果等于 (e − 1) / 2。',
      ],
      result: '\\frac{e-1}{2}',
    },
  },
  {
    id: 'plane-equation',
    title: '平面方程：五种写法与距离',
    tag: '空间几何',
    level: '基础',
    essence:
      '一个平面由「一点 + 法向量」唯一确定，五种写法只是把法向量换不同的包装；点到平面的距离本质上是一段投影长度。',
    whenToUse: [
      '求过三点的平面方程',
      '判断两平面平行还是垂直',
      '求点到平面的距离',
      '空间直线与平面的位置关系',
    ],
    steps: [
      {
        title: '先抓法向量',
        body: '法向量垂直于平面内任意两个不共线的向量，用叉积一次求出。',
        formula: '\\vec{n}=\\overrightarrow{AB}\\times\\overrightarrow{AC}',
      },
      {
        title: '点法式（最通用）',
        body: '已知一点和法向量，直接写出方程，这是所有写法的源头。',
        formula: 'A(x-x_{0})+B(y-y_{0})+C(z-z_{0})=0',
      },
      {
        title: '一般式',
        body: '把点法式展开合并，得到最常见的 Ax + By + Cz + D = 0。',
        formula: 'Ax+By+Cz+D=0',
      },
      {
        title: '截距式',
        body: '平面与三个坐标轴的截距 a、b、c 都不为零时可用，写起来最快。',
        formula: '\\frac{x}{a}+\\frac{y}{b}+\\frac{z}{c}=1',
      },
      {
        title: '三点式',
        body: '给三个点，先叉积求法向量，再回到点法式，不要硬凑行列式。',
      },
      {
        title: '点到平面距离',
        body: '把点代进一般式取绝对值，再除以法向量的模长。',
        formula:
          'd=\\frac{|Ax_{0}+By_{0}+Cz_{0}+D|}{\\sqrt{A^{2}+B^{2}+C^{2}}}',
      },
      {
        title: '平行与垂直',
        body: '两平面的关系全看法向量：共线则平行，点积为零则垂直。',
        formula: '\\vec{n}_{1}\\parallel\\vec{n}_{2},\\qquad \\vec{n}_{1}\\cdot\\vec{n}_{2}=0',
      },
    ],
    example: {
      problem:
        '求过 A(1,0,0)、B(0,1,0)、C(0,0,1) 三点的平面方程，并求原点到该平面的距离。',
      walkthrough: [
        'AB = (−1,1,0)，AC = (−1,0,1)。',
        '叉积得法向量 (1,1,1)。',
        '点法式：(x−1) + y + z = 0，即 x + y + z = 1。',
        '原点到平面距离为 1/√3 = √3/3。',
      ],
      result: 'x+y+z=1,\\qquad d=\\frac{\\sqrt{3}}{3}',
    },
  },
  {
    id: 'sequence-limit',
    title: '数列极限：先证存在再求值',
    tag: '极限',
    level: '进阶',
    essence:
      '递推数列给不出通项时，先证「有界 + 单调」把极限的存在性坐实，再对递推式两边取极限解出值。',
    whenToUse: [
      '给出 aₙ₊₁ = f(aₙ)，求不出通项',
      '题目要求「证明极限存在」',
      '能用单调有界准则或夹逼的数列',
    ],
    steps: [
      {
        title: '先猜极限',
        body: '假设极限为 A，对递推式两边取极限解方程，得到候选值。这一步只是猜，不是证明。',
        formula: 'A=f(A)',
      },
      {
        title: '证有界',
        body: '用数学归纳法证明所有项都落在候选值所在的区间里。',
      },
      {
        title: '证单调',
        body: '算 aₙ₊₁ − aₙ 的符号；能判断 f 的单调性时也可以直接归纳。',
        formula: 'a_{n+1}-a_{n}=f(a_{n})-a_{n}',
      },
      {
        title: '用单调有界准则',
        body: '单调且全体有界，则极限存在。这是整个证明的落脚点。',
      },
      {
        title: '回代求值',
        body: '对递推式两边取极限得到关于 A 的方程，解出后舍去落在界外的根。',
      },
    ],
    example: {
      problem: 'a₁ = 1，aₙ₊₁ = √(2 + aₙ)，证明极限存在并求值。',
      walkthrough: [
        '设极限为 A，则 A = √(2 + A)，解得 A = 2（舍去 −1）。',
        '归纳证明 aₙ < 2：a₁ = 1 < 2；若 aₙ < 2，则 √(2 + aₙ) < √4 = 2。',
        '看单调性：aₙ₊₁ − aₙ 的分子等于 (2 − aₙ)(1 + aₙ)，在 aₙ < 2 时为正，故递增。',
        '单调有界，极限存在；回代解得极限为 2。',
      ],
      result: '\\lim_{n\\to\\infty}a_{n}=2',
    },
  },
  {
    id: 'definite-integral-substitution',
    title: '定积分换元与区间再现',
    tag: '积分',
    level: '竞赛',
    essence:
      '换元必须同时换上下限；遇到 f(x) 与 f(a+b−x) 配对的结构，用区间再现把两式相加，被积函数立刻变简单。',
    whenToUse: [
      '被积函数含 √(a²−x²)、1/(a²+x²) 这类结构',
      '积分区间关于原点对称',
      '式子形如 x·f(sin x) 而 f 本身好处理',
    ],
    steps: [
      {
        title: '换元要换三样',
        body: '被积函数、微分、上下限，一个都不能漏；漏下限是最常见的失分点。',
        formula: '\\int_{a}^{b}f(\\varphi(t))\\,\\varphi\'(t)\\,dt',
      },
      {
        title: '三角换元',
        body: '含 √(a²−x²) 令 x = a sin t，含 a²+x² 令 x = a tan t。',
      },
      {
        title: '对称区间化简',
        body: '奇函数在对称区间上积分为 0，偶函数可以翻倍成 2 倍半区间。',
        formula: 'f(-x)=-f(x)\\ \\Rightarrow\\ \\int_{-a}^{a}f(x)\\,dx=0',
      },
      {
        title: '区间再现',
        body: '对积分用 x = a+b−t 换元，得到同一个 I 的另一种写法，原式与它相加。',
        formula: 'I=\\int_{a}^{b}f(x)\\,dx=\\int_{a}^{b}f(a+b-x)\\,dx',
      },
      {
        title: '相加求解',
        body: '两式相加后 x 项被消掉，算出 2I 再除以 2。',
      },
    ],
    example: {
      problem: '求 I = ∫₀^π x sin x /(1 + cos²x) dx。',
      walkthrough: [
        '区间再现：I = ∫₀^π (π − x) sin x /(1 + cos²x) dx。',
        '两式相加：2I = π ∫₀^π sin x /(1 + cos²x) dx。',
        '令 u = cos x，区间变 -1 到 1：2I = π ∫₋₁¹ du/(1 + u²) = π · π/2。',
        '所以 I = π²/4。',
      ],
      result: '\\int_{0}^{\\pi}\\frac{x\\sin x}{1+\\cos^{2}x}\\,dx=\\frac{\\pi^{2}}{4}',
    },
  },
  {
    id: 'eigen-diagonalization',
    title: '特征值与相似对角化',
    tag: '线代',
    level: '进阶',
    essence:
      '特征值解 |λE−A| = 0，特征向量解 (λE−A)x = 0；凑够 n 个线性无关的特征向量，A 就能写成 PΛP⁻¹，幂运算随之变简单。',
    whenToUse: [
      '求矩阵的特征值与特征向量',
      '判断矩阵能否相似对角化',
      '求 A 的高次幂或矩阵函数',
    ],
    steps: [
      {
        title: '解特征方程',
        body: '把 |λE − A| 展开成关于 λ 的多项式，求全部根（含重根）。',
        formula: '|\\lambda E-A|=0',
      },
      {
        title: '求特征向量',
        body: '把每个 λ 代回齐次方程组，解出基础解系。',
        formula: '(\\lambda E-A)x=0',
      },
      {
        title: '判断可对角化',
        body: 'n 个线性无关的特征向量才可对角化；实对称矩阵一定满足。重根时要看几何重数是否等于代数重数。',
      },
      {
        title: '写成 PΛP⁻¹',
        body: 'P 的列是特征向量，Λ 的对角元是对应的特征值。',
        formula: 'A=P\\Lambda P^{-1}',
      },
      {
        title: '算幂',
        body: 'A 的 n 次幂只需对 Λ 的对角元取 n 次幂，再左右乘 P 与 P⁻¹。',
        formula: 'A^{n}=P\\Lambda^{n}P^{-1}',
      },
    ],
    example: {
      problem: 'A = [[2,1],[1,2]]，求 Aⁿ。',
      walkthrough: [
        '特征方程 (2−λ)² − 1 = 0，得 λ = 3 与 λ = 1。',
        'λ=3 时特征向量取 (1,1)，λ=1 时取 (1,−1)。',
        'P = [[1,1],[1,−1]]，P⁻¹ = (1/2)[[1,1],[1,−1]]。',
        '代 Aⁿ = P·diag(3ⁿ,1)·P⁻¹ 展开即得结果。',
      ],
      result:
        'A^{n}=\\frac{1}{2}\\begin{pmatrix}3^{n}+1 & 3^{n}-1\\\\ 3^{n}-1 & 3^{n}+1\\end{pmatrix}',
    },
  },
  {
    id: 'function-of-rv',
    title: '随机变量函数的分布',
    tag: '概率',
    level: '进阶',
    essence:
      '求 Y = g(X) 的分布，先写 F_Y(y) = P(g(X) ≤ y)，把事件翻译成 X 的区间，最后求导得密度——不要一上来就套公式。',
    whenToUse: [
      '已知 X 的密度，求 Y = g(X) 的密度',
      'g 不单调，例如 Y = X²',
      '二维随机变量求和、取最大值的分布',
    ],
    steps: [
      {
        title: '先写分布函数',
        body: 'F_Y(y) = P(Y ≤ y) = P(g(X) ≤ y)。这一步永远成立，不依赖 g 是否单调。',
        formula: 'F_{Y}(y)=P(g(X)\\le y)',
      },
      {
        title: '解不等式',
        body: '把 g(X) ≤ y 化成 X 落在哪些区间；g 不单调时要分段讨论，别漏负半轴。',
      },
      {
        title: '用 X 的分布表示',
        body: '把概率写成 F_X 或对 f_X 的积分。',
      },
      {
        title: '求导得密度',
        body: '在 F_Y 可导的区间上求导，分段点单独说明。',
        formula: 'f_{Y}(y)=F_{Y}\'(y)',
      },
      {
        title: '标清支撑集',
        body: '密度在 g 的取值范围之外恒为 0，漏写等于答案不完整。',
      },
    ],
    example: {
      problem: 'X 服从 (0,1) 上的均匀分布，Y = X²，求 Y 的密度。',
      walkthrough: [
        'F_Y(y) = P(X² ≤ y) = P(X ≤ √y)，这里 y 必须在 (0,1) 内。',
        'X 均匀分布，故 F_Y(y) = √y。',
        '求导得 f_Y(y) = 1/(2√y)。',
        '支撑集：0 < y < 1，其余为 0。',
      ],
      result: 'f_{Y}(y)=\\frac{1}{2\\sqrt{y}},\\quad 0<y<1',
    },
  },
  {
    id: 'inequality-proof',
    title: '不等式证明：三条主线',
    tag: '不等式',
    level: '竞赛',
    essence:
      '证不等式只有三条主线：移项求导看单调、用中值定理把差值换成导数、或者直接求最值；选哪条看式子里有没有 f(b)−f(a)。',
    whenToUse: [
      '题目要求「证明 f(x) ≥ g(x)」',
      '式子里出现 f(b) − f(a) 或 b − a',
      '含积分、级数的不等式估计',
    ],
    steps: [
      {
        title: '移项构造函数',
        body: '令 F = f − g，把要证的不等式变成 F ≥ 0，问题就转成了求下界。',
        formula: 'F(x)=f(x)-g(x)',
      },
      {
        title: '求导看单调',
        body: '算出 F′，判断符号；单调加上端点值，下界立刻出来。',
        formula: 'F\'(x)',
      },
      {
        title: '取端点或驻点',
        body: 'F 在端点或驻点处取到最小值，那个值就是不等式的下界。',
      },
      {
        title: '有差值就用中值定理',
        body: '看到 f(b) − f(a) 与 b − a 同时出现，直接用拉格朗日中值定理把差换成导数。',
        formula: 'f(b)-f(a)=f\'(\\xi)(b-a)',
      },
      {
        title: '积分不等式放缩',
        body: '被积函数能被常数或其他函数界住时，直接对积分放缩；也可以用单调性比较。',
      },
    ],
    example: {
      problem: '证明对任意实数 a、b，都有 |sin a − sin b| ≤ |a − b|。',
      walkthrough: [
        '不妨设 a ≠ b，在 [a,b]（或 [b,a]）上用拉格朗日中值定理。',
        '存在 ξ 使 sin a − sin b = cos ξ · (a − b)。',
        '两边取绝对值：|sin a − sin b| = |cos ξ| · |a − b|。',
        '而 |cos ξ| ≤ 1，所以不等式成立；a = b 时取等号显然成立。',
      ],
      result: '|\\sin a-\\sin b|\\le|a-b|',
    },
  },
  {
    id: 'series-sum',
    title: '级数求和：先裂项，再幂级数',
    tag: '级数',
    level: '竞赛',
    essence:
      '求和先看能不能裂成 telescoping，部分和会只剩首尾几项；裂不动就走幂级数，在收敛区间内逐项求导或积分把系数化掉。',
    whenToUse: [
      '求 Σ 1/(n(n+1)) 这类分式级数',
      '求含 x 的幂级数和函数',
      '已知 Σxⁿ 想推出带 n 系数的和',
    ],
    steps: [
      {
        title: '先试着裂项',
        body: '把通项拆成相邻两项之差，求和时中间项会相互抵消。',
        formula: '\\frac{1}{n(n+1)}=\\frac{1}{n}-\\frac{1}{n+1}',
      },
      {
        title: '写部分和取极限',
        body: 'S_N 展开后只剩首尾，令 N 趋于无穷即得和。',
      },
      {
        title: '幂级数先定收敛半径',
        body: '用比值法求出 R，后面所有逐项操作都只能在收敛区间内进行。',
        formula: 'R=\\lim_{n\\to\\infty}\\left|\\frac{a_{n}}{a_{n+1}}\\right|',
      },
      {
        title: '逐项求导或积分',
        body: '把 n 系数通过求导造出来，或通过积分消掉分母。',
        formula: '\\left(\\sum a_{n}x^{n}\\right)\'=\\sum na_{n}x^{n-1}',
      },
      {
        title: '端点单独判断',
        body: '收敛区间端点上的敛散性要单独用数项级数判别法确认，再写进答案。',
      },
    ],
    example: {
      problem: '求幂级数 Σₙ≥₁ n xⁿ⁻¹ 的和函数（|x| < 1），并求 Σ n/2ⁿ⁻¹。',
      walkthrough: [
        '由几何级数 Σ xⁿ = 1/(1−x)，收敛半径 R = 1。',
        '在收敛区间内逐项求导：Σ n xⁿ⁻¹ = 1/(1−x)²。',
        '代入 x = 1/2 得 Σ n/2ⁿ⁻¹ = 1/(1/2)² = 4。',
      ],
      result: '\\sum_{n=1}^{\\infty}nx^{n-1}=\\frac{1}{(1-x)^{2}}',
    },
  },
  {
    id: 'multivar-differentiability',
    title: '多元可微：偏导存在还不够',
    tag: '多元',
    level: '进阶',
    essence:
      '偏导存在推不出可微；判可微要用定义式看 Δz 减去全微分后是不是比 ρ 高阶，而「偏导连续」只是充分条件。',
    whenToUse: [
      '判断分段函数在原点是否可微',
      '区分连续、偏导存在、可微、偏导连续四者',
      '选择题里给一个分段函数让你判断',
    ],
    steps: [
      {
        title: '先看连续性',
        body: '不连续一定不可微，这一步能快速排除一批选项。',
      },
      {
        title: '用定义求偏导',
        body: '在原点求偏导必须用定义，不能直接对表达式求导。',
        formula:
          'f_{x}(0,0)=\\lim_{\\Delta x\\to 0}\\frac{f(\\Delta x,0)-f(0,0)}{\\Delta x}',
      },
      {
        title: '套可微定义式',
        body: '把增量减掉全微分，看剩下的部分是不是比 ρ 高阶。',
        formula:
          '\\Delta z-(A\\Delta x+B\\Delta y)=o(\\rho),\\quad \\rho=\\sqrt{\\Delta x^{2}+\\Delta y^{2}}',
      },
      {
        title: '沿特殊路径反证',
        body: '想证明不可微，取一条路径（如 Δy = Δx）让比值极限不为 0 即可。',
      },
      {
        title: '记住充分条件',
        body: '偏导在邻域内连续 ⇒ 可微；反过来不成立，所以不能用「偏导存在」去推可微。',
      },
    ],
    example: {
      problem: 'f(x,y) = √|xy|，判断它在原点是否可微。',
      walkthrough: [
        'f 连续，且 f(x,0) = 0 说明两个偏导都存在且等于 0。',
        '于是全微分为 0，只需看 Δz 是不是 o(ρ)。',
        '取 Δy = Δx = t，则 Δz = |t|，ρ = √2|t|，比值为 1/√2。',
        '极限不为 0，所以不可微。',
      ],
      result:
        '\\lim_{\\rho\\to 0}\\frac{\\sqrt{|\\Delta x\\,\\Delta y|}}{\\rho}\\ge\\frac{1}{\\sqrt{2}}\\neq 0',
    },
  },
  {
    id: 'linear-system',
    title: '线性方程组：先判解再求通解',
    tag: '线代',
    level: '基础',
    essence:
      '先比 r(A) 与 r(A|b) 定有没有解，再用 n − r(A) 定自由变量个数；非齐次通解 = 一个特解 + 齐次的基础解系。',
    whenToUse: [
      '讨论含参数方程组何时有解',
      '求方程组通解',
      '判断解唯一还是无穷多',
    ],
    steps: [
      {
        title: '写增广矩阵做行变换',
        body: '化成阶梯形，秩一目了然；含参数时注意分类讨论。',
        formula: '(A\\mid b)\\ \\longrightarrow\\ (\\text{row echelon form})',
      },
      {
        title: '判解的存在性',
        body: 'r(A) 与 r(A|b) 不等则无解；相等才有解，等于 n 时唯一，小于 n 时无穷多。',
      },
      {
        title: '数自由变量',
        body: '自由变量个数 = n − r(A)，也就是基础解系里向量的个数。',
        formula: 'n-r(A)',
      },
      {
        title: '求齐次基础解系',
        body: '自由变量轮流取 1、其余取 0，解出对应的基础解向量。',
      },
      {
        title: '拼出通解',
        body: '一个特解加上齐次通解，就是全部解。',
        formula: 'x=\\eta+c_{1}\\xi_{1}+\\cdots+c_{k}\\xi_{k}',
      },
    ],
    example: {
      problem: '解方程组 x₁+x₂+x₃=1，x₁+2x₂+3x₃=2。',
      walkthrough: [
        '增广矩阵行变换后有两行非零，r(A)=r(A|b)=2，未知数 n=3。',
        '自由变量 1 个，取 x₃ = t。',
        '两式相减得 x₂ + 2x₃ = 1，即 x₂ = 1 − 2t。',
        '代回得 x₁ = t，故通解为 (0,1,0)ᵀ + t(1,−2,1)ᵀ。',
      ],
      result:
        'x=\\begin{pmatrix}0\\\\1\\\\0\\end{pmatrix}+t\\begin{pmatrix}1\\\\-2\\\\1\\end{pmatrix}',
    },
  },
  {
    id: 'power-series-domain',
    title: '幂级数：收敛半径与收敛域',
    tag: '级数',
    level: '进阶',
    essence:
      '先求收敛半径拿到开区间，再把两个端点代回去当数项级数单独判——半径只给一半答案，端点才是丢分点。',
    whenToUse: [
      '求幂级数的收敛半径与收敛域',
      '判断端点是否收敛',
      '求导或积分后重新确定收敛域',
    ],
    steps: [
      {
        title: '求收敛半径',
        body: '用相邻系数之比的极限，或直接用根值法。',
        formula: 'R=\\lim_{n\\to\\infty}\\left|\\frac{a_{n}}{a_{n+1}}\\right|',
      },
      {
        title: '写出开区间',
        body: '在 |x − x₀| < R 内绝对收敛，大于 R 时发散。',
        formula: '|x-x_{0}|<R',
      },
      {
        title: '端点逐个代回',
        body: '端点处比值法失效，必须换成数项级数的判别法，两端可能一端收敛一端发散。',
      },
      {
        title: '逐项运算的影响',
        body: '逐项求导或积分不改变收敛半径，但端点的敛散性可能改变，要重新判。',
      },
      {
        title: '写成完整收敛域',
        body: '把开区间和端点的结论合并，注意方括号与圆括号的区别。',
      },
    ],
    example: {
      problem: '求幂级数 Σ xⁿ/n 的收敛域。',
      walkthrough: [
        '系数 aₙ = 1/n，比值极限为 1，故收敛半径 R = 1。',
        '开区间是 (−1, 1)。',
        'x = 1 时是调和级数，发散。',
        'x = −1 时是交错调和级数，收敛。',
        '合并得收敛域 [−1, 1)。',
      ],
      result: '[-1,\\,1)',
    },
  },
  {
    id: 'second-order-ode',
    title: '二阶常系数方程：看特征根',
    tag: '微分方程',
    level: '基础',
    essence:
      '把 y″ + py′ + qy = 0 换成特征方程 r² + pr + q = 0，三种根型对应三种通解；非齐次再按右端形式设特解。',
    whenToUse: [
      '解二阶常系数齐次方程',
      '求非齐次方程的通解',
      '带初值的定解问题',
    ],
    steps: [
      {
        title: '写特征方程',
        body: '把 y 的阶数换成 r 的幂次，得到一元二次方程。',
        formula: 'r^{2}+pr+q=0',
      },
      {
        title: '两个不同实根',
        body: '直接写两个指数函数的线性组合。',
        formula: 'y=C_{1}e^{r_{1}x}+C_{2}e^{r_{2}x}',
      },
      {
        title: '重根',
        body: '重根时第二个解要乘 x，否则两个解线性相关。',
        formula: 'y=(C_{1}+C_{2}x)e^{rx}',
      },
      {
        title: '共轭复根',
        body: '写成指数乘三角的形式，实部进指数、虚部进三角函数。',
        formula: 'y=e^{\\alpha x}\\left(C_{1}\\cos\\beta x+C_{2}\\sin\\beta x\\right)',
      },
      {
        title: '非齐次设特解',
        body: '右端是 e^{λx} 乘多项式时，特解也设成这个形状；λ 是 k 重特征根就再乘 x^k。',
      },
    ],
    example: {
      problem: '解方程 y″ − 3y′ + 2y = 0。',
      walkthrough: [
        '特征方程 r² − 3r + 2 = 0，分解得 (r−1)(r−2) = 0。',
        '两个不同实根 r = 1 与 r = 2。',
        '按第一种情形写通解。',
        '代回验证：y′ = C₁eˣ + 2C₂e²ˣ，y″ = C₁eˣ + 4C₂e²ˣ，组合后恒为 0。',
      ],
      result: 'y=C_{1}e^{x}+C_{2}e^{2x}',
    },
  },
  {
    id: 'line-plane-angle',
    title: '空间直线与平面：夹角与距离',
    tag: '空间几何',
    level: '基础',
    essence:
      '直线靠一个点加方向向量，平面靠一个点加法向量；所有夹角、距离问题都是在这两个向量之间做点积和叉积。',
    whenToUse: [
      '求直线与平面的夹角',
      '求两直线或两平面的夹角',
      '求点到直线的距离',
    ],
    steps: [
      {
        title: '写出方向向量与法向量',
        body: '对称式 (x−x₀)/m = (y−y₀)/n = (z−z₀)/p 的方向向量是 (m,n,p)；平面 Ax+By+Cz+D=0 的法向量是 (A,B,C)。',
      },
      {
        title: '线面夹角用正弦',
        body: '方向向量与法向量的夹角是线面夹角的余角，所以取正弦。',
        formula: '\\sin\\theta=\\frac{|\\vec{s}\\cdot\\vec{n}|}{|\\vec{s}|\\,|\\vec{n}|}',
      },
      {
        title: '线线、面面夹角用余弦',
        body: '两个方向向量之间、两个法向量之间都用点积求余弦，取绝对值保证是锐角。',
        formula: '\\cos\\theta=\\frac{|\\vec{s}_{1}\\cdot\\vec{s}_{2}|}{|\\vec{s}_{1}|\\,|\\vec{s}_{2}|}',
      },
      {
        title: '点到直线距离用叉积',
        body: '向量 AP 与方向向量的叉积模长，就是平行四边形的面积，除以底边长度即得高。',
        formula: 'd=\\frac{|\\overrightarrow{AP}\\times\\vec{s}|}{|\\vec{s}|}',
      },
      {
        title: '平行与垂直的判断',
        body: '线面平行看方向向量与法向量是否垂直；线面垂直看它们是否平行。',
      },
    ],
    example: {
      problem: '求直线 (x−1)/1 = y/2 = z/1 与平面 x+y+z=1 的夹角。',
      walkthrough: [
        '直线的方向向量 s = (1,2,1)，平面的法向量 n = (1,1,1)。',
        '点积 s·n = 1+2+1 = 4。',
        '模长 |s| = √6，|n| = √3。',
        'sin θ = 4/(√6·√3) = 4/√18 = 2√2/3。',
      ],
      result: '\\sin\\theta=\\frac{2\\sqrt{2}}{3}',
    },
  },
  {
    id: 'classic-inequalities',
    title: '三个经典不等式：均值、柯西、琴生',
    tag: '不等式',
    level: '竞赛',
    essence:
      '均值管「和与积」，柯西管「平方和与内积」，琴生管「凸函数的平均」；竞赛里的不等式题九成是这三个的变形。',
    whenToUse: [
      '证明含 a+b 与 ab 的不等式',
      '证明平方和与乘积的不等式',
      '证明对称的多元不等式',
    ],
    steps: [
      {
        title: '均值不等式',
        body: '两个正数的算术平均不小于几何平均，取等当且仅当两数相等。',
        formula: '\\frac{a+b}{2}\\ge\\sqrt{ab}\\quad(a,b>0)',
      },
      {
        title: '柯西不等式',
        body: '内积的平方不超过各自平方和的乘积，取等当两组数成比例。',
        formula:
          '\\left(\\sum_{i=1}^{n}a_{i}b_{i}\\right)^{2}\\le\\left(\\sum_{i=1}^{n}a_{i}^{2}\\right)\\left(\\sum_{i=1}^{n}b_{i}^{2}\\right)',
      },
      {
        title: '琴生不等式',
        body: 'f 为凸函数时，函数值的平均不小于平均值的函数值；凹函数方向相反。',
        formula:
          'f\\!\\left(\\frac{x_{1}+\\cdots+x_{n}}{n}\\right)\\le\\frac{f(x_{1})+\\cdots+f(x_{n})}{n}',
      },
      {
        title: '别忘了写取等条件',
        body: '三个不等式都有等号成立的条件，证明题里不写会扣分。',
      },
      {
        title: '配成平方和',
        body: '竞赛题最常见的收尾方式：把差写成若干平方之和，非负性一目了然。',
      },
    ],
    example: {
      problem: '证明对任意实数 a、b、c，都有 a²+b²+c² ≥ ab+bc+ca。',
      walkthrough: [
        '移项：a²+b²+c² − ab − bc − ca ≥ 0。',
        '乘以 2 并配方：2(a²+b²+c²−ab−bc−ca) = (a−b)²+(b−c)²+(c−a)²。',
        '右边是三个平方之和，恒非负。',
        '所以原不等式成立，且 a=b=c 时取等号。',
      ],
      result: 'a^{2}+b^{2}+c^{2}\\ge ab+bc+ca',
    },
  },
  {
    id: 'integral-applications',
    title: '定积分的几何应用',
    tag: '积分',
    level: '基础',
    essence:
      '面积、体积、弧长都是「写微元再累加」：先想清楚一片微元是什么形状，再定上下限积分。',
    whenToUse: [
      '求曲边梯形的面积',
      '求旋转体的体积',
      '求平面曲线的弧长',
    ],
    steps: [
      {
        title: '面积：上减下',
        body: '两条曲线围成的区域，用上边界减下边界，交叉处要分段。',
        formula: 'S=\\int_{a}^{b}\\left|f(x)-g(x)\\right|dx',
      },
      {
        title: '绕 x 轴旋转：圆盘法',
        body: '微元是一个薄圆盘，半径是 f(x)，面积 πf²，厚度 dx。',
        formula: 'V=\\pi\\int_{a}^{b}f^{2}(x)\\,dx',
      },
      {
        title: '绕 y 轴旋转：柱壳法',
        body: '微元是一个薄圆柱壳，周长 2πx、高 f(x)、厚 dx。',
        formula: 'V=2\\pi\\int_{a}^{b}x\\,f(x)\\,dx',
      },
      {
        title: '弧长',
        body: '用勾股定理把 ds 写成 √(1+(y′)²) dx；参数方程时换成 t 的微分。',
        formula: 'L=\\int_{a}^{b}\\sqrt{1+\\left(f\'(x)\\right)^{2}}\\,dx',
      },
      {
        title: '先画图再定限',
        body: '区域形状决定用哪种公式，定限永远从图上读，不要凭记忆写。',
      },
    ],
    example: {
      problem: '求 y = x² 在 [0,1] 上绕 x 轴旋转所得旋转体的体积。',
      walkthrough: [
        '用圆盘法：微元半径是 x²，面积是 πx⁴。',
        '在 [0,1] 上积分：V = π∫₀¹ x⁴ dx。',
        '原函数是 x⁵/5，代入上下限得 π/5。',
      ],
      result: 'V=\\frac{\\pi}{5}',
    },
  },
  {
    id: 'lagrange-cauchy',
    title: '拉格朗日与柯西：把差值换成导数',
    tag: '中值定理',
    level: '进阶',
    essence:
      '罗尔定理是最底层那根钉子；拉格朗日把函值之差换成导数乘区间长，柯西把两个函数的增量比换成导数比。',
    whenToUse: [
      '出现 f(b) − f(a) 与 b − a',
      '要估计函数值之差的上界',
      '两个函数同时出现且要求比值',
    ],
    steps: [
      {
        title: '拉格朗日中值定理',
        body: '把弦的斜率换成某点的切线斜率。',
        formula: 'f(b)-f(a)=f\'(\\xi)(b-a)',
      },
      {
        title: '柯西中值定理',
        body: '两个函数各自的增量之比，等于某点导数值之比；要求 g′ 在区间内不为零。',
        formula: '\\frac{f(b)-f(a)}{g(b)-g(a)}=\\frac{f\'(\\xi)}{g\'(\\xi)}',
      },
      {
        title: '怎么选',
        body: '只有一个函数出现就用拉格朗日；式子里有两个函数且要求比值，才用柯西。',
      },
      {
        title: '和罗尔的关系',
        body: '罗尔是 f(a) = f(b) 时的特例；拉格朗日可以由罗尔构造辅助函数证出。',
      },
      {
        title: '估计不等式的标准动作',
        body: '先用中值定理把差写成导数乘区间长，再用导数的界去放缩。',
      },
    ],
    example: {
      problem: '证明对任意实数 a、b，都有 |arctan a − arctan b| ≤ |a − b|。',
      walkthrough: [
        '设 f(x) = arctan x，在 a、b 之间用拉格朗日中值定理。',
        '存在 ξ 使 arctan a − arctan b = (a − b)/(1 + ξ²)。',
        '因为 1/(1 + ξ²) ≤ 1，两边取绝对值即得。',
      ],
      result: '|\\arctan a-\\arctan b|\\le|a-b|',
    },
  },
  {
    id: 'reducible-ode',
    title: '可降阶方程与欧拉方程',
    tag: '微分方程',
    level: '进阶',
    essence:
      '缺 y 的令 y′ = p(x)，缺 x 的令 y′ = p(y)；欧拉方程用 x = eᵗ 换成常系数，本质都是「换元降阶」。',
    whenToUse: [
      '方程里不显含 y 或不显含 x',
      '形如 x²y″ + pxy′ + qy = 0 的欧拉方程',
      '高阶但可以逐步降阶的方程',
    ],
    steps: [
      {
        title: '缺 y：令 p = y′',
        body: 'y″ 直接写成 dp/dx，方程降成一阶。',
        formula: 'y\'\'=\\frac{dp}{dx}',
      },
      {
        title: '缺 x：令 p = y′',
        body: '此时 y″ 要写成 p·dp/dy，方程同样降成一阶。',
        formula: 'y\'\'=p\\frac{dp}{dy}',
      },
      {
        title: '欧拉方程换元',
        body: '令 x = eᵗ，把 x 的幂次与导数合并成对 t 的常系数方程。',
        formula: 'x^{2}y\'\'=\\frac{d^{2}y}{dt^{2}}-\\frac{dy}{dt}',
      },
      {
        title: '解完再换回原变量',
        body: '按二阶常系数解出 y(t)，最后把 t 换成 ln x。',
      },
      {
        title: '别忘了回代 p',
        body: '降阶解出的是 p = y′，还要再积分一次才得到 y。',
      },
    ],
    example: {
      problem: '解欧拉方程 x²y″ − 2xy′ + 2y = 0（x > 0）。',
      walkthrough: [
        '令 x = eᵗ，方程化为 y″ − 3y′ + 2y = 0（对 t 求导）。',
        '特征根为 1 与 2，故 y = C₁eᵗ + C₂e^{2t}。',
        '把 eᵗ 换回 x，得 y = C₁x + C₂x²。',
        '代回验证：两个解分别满足原方程。',
      ],
      result: 'y=C_{1}x+C_{2}x^{2}',
    },
  },
  {
    id: 'vector-algebra',
    title: '向量代数：三种乘积各管什么',
    tag: '空间几何',
    level: '基础',
    essence:
      '数量积算夹角和投影，向量积算面积和法向量，混合积算体积和共面——空间几何题的第一步几乎都是在这三个里选一个。',
    whenToUse: [
      '求两向量夹角或一个向量在另一个上的投影',
      '求平面的法向量、三角形的面积',
      '判断三个向量是否共面、求平行六面体体积',
    ],
    steps: [
      {
        title: '数量积管夹角',
        body: '点积等于模长乘积乘余弦；点积为零就是垂直。',
        formula: '\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta',
      },
      {
        title: '向量积管面积',
        body: '叉积的模长等于两向量张成的平行四边形面积，方向按右手系垂直于两者。',
        formula: '|\\vec{a}\\times\\vec{b}|=|\\vec{a}||\\vec{b}|\\sin\\theta',
      },
      {
        title: '混合积管体积',
        body: '先叉积再点积，绝对值是平行六面体的体积。',
        formula: '\\left[\\vec{a}\\,\\vec{b}\\,\\vec{c}\\right]=(\\vec{a}\\times\\vec{b})\\cdot\\vec{c}',
      },
      {
        title: '共面的判据',
        body: '三个向量共面当且仅当混合积为零，等价于它们组成的行列式为零。',
      },
      {
        title: '典型用法',
        body: '求平面方程先叉积出法向量；求点到平面距离用向量在法向量上的投影。',
      },
    ],
    example: {
      problem: '设 a=(1,0,0)，b=(0,1,0)，c=(0,0,1)，求 a×b 与混合积 [a b c]。',
      walkthrough: [
        'a×b = (0,0,1)，模长为 1，正好是单位正方形的面积。',
        '混合积 = (a×b)·c = (0,0,1)·(0,0,1) = 1。',
        '这也等于由三个坐标向量张成的单位正方体体积。',
        '若把 c 换成 (1,1,0)，混合积变成 0，说明三向量共面。',
      ],
      result: '\\left[\\vec{a}\\,\\vec{b}\\,\\vec{c}\\right]=1',
    },
  },
  {
    id: 'implicit-diff',
    title: '隐函数求导：两边求导再解出',
    tag: '多元',
    level: '基础',
    essence:
      '方程 F(x,y)=0 确定 y=y(x) 时，两边对 x 求导并把 y 当复合函数，再解出 y′；二元情形用 F 的偏导直接写。',
    whenToUse: [
      '方程没有解出 y，但要求 y′',
      '求曲面 z=z(x,y) 的偏导',
      '求隐函数的二阶导数',
    ],
    steps: [
      {
        title: '一元隐函数公式',
        body: '由 F(x,y)=0 得 y′ 等于负的 F 对 x 偏导除以对 y 偏导。',
        formula: 'y\'=-\\frac{F_{x}}{F_{y}}',
      },
      {
        title: '二元隐函数',
        body: 'F(x,y,z)=0 确定 z=z(x,y) 时，两个偏导都按同样的方式写。',
        formula: 'z_{x}=-\\frac{F_{x}}{F_{z}},\\qquad z_{y}=-\\frac{F_{y}}{F_{z}}',
      },
      {
        title: '全微分形式不变性',
        body: '不论 x、y 是否独立，dz = z_x dx + z_y dy 都成立，这是推公式最省事的工具。',
        formula: 'dz=z_{x}\\,dx+z_{y}\\,dy',
      },
      {
        title: '求二阶导',
        body: '对一阶结果再对 x 求导，记得 y 仍然是 x 的函数，要把 y′ 代进去。',
      },
      {
        title: '验算',
        body: '把结果代回原方程应恒成立，尤其是含参数的题。',
      },
    ],
    example: {
      problem: 'x² + y² = 1 确定 y = y(x)，求 y′。',
      walkthrough: [
        '两边对 x 求导：2x + 2y·y′ = 0。',
        '解出 y′ = −x/y。',
        '等价写法：F = x² + y² − 1，F_x = 2x，F_y = 2y，故 y′ = −F_x/F_y = −x/y。',
      ],
      result: 'y\'=-\\frac{x}{y}',
    },
  },
  {
    id: 'directional-derivative',
    title: '方向导数与梯度',
    tag: '多元',
    level: '基础',
    essence:
      '梯度是函数增长最快的方向，方向导数是梯度在该方向单位向量上的投影；两者用点积一串就完了。',
    whenToUse: [
      '求函数在某点沿某方向的变化率',
      '求函数增长最快的方向',
      '解释梯度与等值线的关系',
    ],
    steps: [
      {
        title: '先求梯度',
        body: '梯度是由各偏导组成的向量，指向函数增长最快的方向。',
        formula: '\\nabla f=(f_{x},\\,f_{y})',
      },
      {
        title: '再乘单位方向向量',
        body: '方向必须是单位向量，没单位化是最常见的错。',
        formula: '\\frac{\\partial f}{\\partial l}=\\nabla f\\cdot\\vec{e}_{l}',
      },
      {
        title: '最大值就是梯度模长',
        body: '沿梯度方向方向导数取到最大值 |∇f|，沿反方向取到最小值。',
        formula: '\\max\\frac{\\partial f}{\\partial l}=|\\nabla f|',
      },
      {
        title: '与等值线垂直',
        body: '梯度垂直于等值线（等值面），这是几何意义，也是最快下降法的基础。',
      },
      {
        title: '三元同理',
        body: '三元函数只是多一个分量，公式形式完全一样。',
      },
    ],
    example: {
      problem: 'f(x,y) = x² + y²，求在点 (1,1) 沿方向 (1,1) 的方向导数。',
      walkthrough: [
        '梯度：∇f = (2x, 2y)，在 (1,1) 处为 (2,2)。',
        '方向 (1,1) 单位化后是 (1/√2, 1/√2)。',
        '点积：(2,2)·(1/√2,1/√2) = 4/√2 = 2√2。',
        '这等于 |∇f| = 2√2，说明该方向正好是梯度方向。',
      ],
      result: '\\frac{\\partial f}{\\partial l}=2\\sqrt{2}',
    },
  },
  {
    id: 'numeric-characteristics',
    title: '数字特征：期望与方差',
    tag: '概率',
    level: '基础',
    essence:
      '期望是加权平均，方差是偏离程度的平方平均；记住 D(X)=E(X²)−[E(X)]² 和线性变换的两条性质，八成题就够了。',
    whenToUse: [
      '求随机变量的期望与方差',
      '已知分布求数字特征',
      '判断独立与不独立时的方差可加性',
    ],
    steps: [
      {
        title: '期望',
        body: '离散型按取值加权求和，连续型换成积分。',
        formula: 'E(X)=\\sum_{i}x_{i}p_{i}',
      },
      {
        title: '方差的计算式',
        body: '先算 E(X²) 再减去期望的平方，通常比按定义算快。',
        formula: 'D(X)=E(X^{2})-\\left[E(X)\\right]^{2}',
      },
      {
        title: '线性变换',
        body: '常数可以提出，但方差提出去要平方。',
        formula: 'E(aX+b)=aE(X)+b,\\qquad D(aX+b)=a^{2}D(X)',
      },
      {
        title: '独立才可加',
        body: 'X 与 Y 独立时方差相加；不独立时要加上 2Cov(X,Y)。',
        formula: 'D(X\\pm Y)=D(X)+D(Y)\\pm 2\\mathrm{Cov}(X,Y)',
      },
      {
        title: '常见分布记牢',
        body: '二项 B(n,p)：np 与 np(1−p)；泊松：λ 与 λ；正态：μ 与 σ²；指数：1/λ 与 1/λ²。',
      },
    ],
    example: {
      problem: 'X 服从 B(10, 0.3)，求 E(X) 与 D(X)。',
      walkthrough: [
        '二项分布期望 E(X) = np = 10 × 0.3 = 3。',
        '方差 D(X) = np(1−p) = 10 × 0.3 × 0.7 = 2.1。',
        '也可用 E(X²) − [E(X)]² 验证：E(X²) = D + E² = 2.1 + 9 = 11.1。',
      ],
      result: 'E(X)=3,\\qquad D(X)=2.1',
    },
  },
  {
    id: 'linear-dependence',
    title: '向量组的线性相关性',
    tag: '线代',
    level: '基础',
    essence:
      '一组向量线性相关，等价于存在不全为零的系数让它们的线性组合为零，也等价于以它们为列的矩阵秩小于向量个数。',
    whenToUse: [
      '判断向量组线性相关还是无关',
      '求极大线性无关组与秩',
      '判断矩阵是否可逆（列向量是否无关）',
    ],
    steps: [
      {
        title: '定义式',
        body: '存在不全为零的 k 使得组合为零，就是线性相关。',
        formula: 'k_{1}\\alpha_{1}+\\cdots+k_{s}\\alpha_{s}=0',
      },
      {
        title: '秩判据',
        body: '把向量按列排成矩阵，秩小于向量个数即相关；相等即无关。',
      },
      {
        title: '行列式判据',
        body: 'n 个 n 维向量，行列式为零等价于线性相关。',
        formula: '\\det A=0\\iff\\text{singular}',
      },
      {
        title: '极大无关组',
        body: '秩就是极大无关组中向量的个数，也是这个向量组的「有效维数」。',
      },
      {
        title: '含参数时分类讨论',
        body: '令行列式为零解出参数，再逐一代回判断，别只写一个临界值。',
      },
    ],
    example: {
      problem: '判断 α₁=(1,2)、α₂=(2,4) 是否线性相关。',
      walkthrough: [
        '显然 α₂ = 2α₁，存在不全为零的系数使 2α₁ − α₂ = 0。',
        '用行列式：两向量组成的矩阵行列式为 1×4 − 2×2 = 0。',
        '行列式为零，所以线性相关，秩为 1。',
      ],
      result: '\\begin{vmatrix}1&2\\\\2&4\\end{vmatrix}=0',
    },
  },
  {
    id: 'fourier-series',
    title: '傅里叶级数：系数怎么算',
    tag: '级数',
    level: '进阶',
    essence:
      '周期函数展开成三角级数，系数靠正交性积分求出；奇函数只剩正弦项，偶函数只剩余弦项，先看奇偶性能省一半计算。',
    whenToUse: [
      '把周期函数展开成傅里叶级数',
      '求傅里叶系数 aₙ、bₙ',
      '判断级数在某点的收敛值',
    ],
    steps: [
      {
        title: '先看奇偶性',
        body: '奇函数的 aₙ 全为 0，偶函数的 bₙ 全为 0，这一眼就能省一半积分。',
      },
      {
        title: '余弦系数',
        body: 'f 乘以 cos nx 后在整周期上积分再除以 π。',
        formula: 'a_{n}=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}f(x)\\cos nx\\,dx',
      },
      {
        title: '正弦系数',
        body: 'f 乘以 sin nx 后同样积分。',
        formula: 'b_{n}=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}f(x)\\sin nx\\,dx',
      },
      {
        title: '收敛到哪一点',
        body: '狄利克雷条件下，级数在间断点收敛到左右极限的平均值，不是 f 本身。',
        formula: 'S(x)=\\frac{f(x^{+})+f(x^{-})}{2}',
      },
      {
        title: '系数衰减看光滑性',
        body: '函数越光滑系数衰减越快：方波是 1/n，抛物线是 1/n²。',
      },
    ],
    example: {
      problem: '把 f(x) = x 在 (−π, π) 上展开成傅里叶级数。',
      walkthrough: [
        'f 是奇函数，所以全部 aₙ = 0。',
        'bₙ = (1/π)∫_{-π}^{π} x sin nx dx，分部积分得 2(−1)ⁿ⁺¹/n。',
        '所以展开式为 2Σ(−1)ⁿ⁺¹ sin nx / n。',
        '在端点 x = ±π 处收敛到 0，等于左右极限的平均值。',
      ],
      result: 'x=2\\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n}\\sin nx',
    },
  },
  {
    id: 'one-to-infinity',
    title: '1 的无穷次型：三步取对数',
    tag: '极限',
    level: '竞赛',
    essence:
      '底数趋于 1、指数趋于无穷时，直接算会得出「1」，必须取对数或改写成 (1+u)^{1/u} 的形式，答案通常是 e 的某个幂。',
    whenToUse: [
      '代入后底数 → 1、指数 → ∞',
      '式子形如 (1+f(x))^{g(x)}',
      'n 次方根、连乘的极限',
    ],
    steps: [
      {
        title: '先定型',
        body: '确认是 1^∞；其他型别乱用这套。',
        formula: 'u^{v},\\quad u\\to 1,\\ v\\to\\infty',
      },
      {
        title: '取对数',
        body: '设 L 为原极限，则 ln L = lim v·ln u，把指数搬下来。',
        formula: '\\ln L=\\lim v\\ln u',
      },
      {
        title: '用等价无穷小',
        body: 'u → 1 时 ln u ~ u − 1，于是 ln L = lim v(u−1)。',
        formula: '\\ln u\\sim u-1\\ (u\\to 1)',
      },
      {
        title: '指数回代',
        body: '最后别忘了把 ln L 变回 L。',
        formula: 'L=e^{\\lim v(u-1)}',
      },
    ],
    example: {
      problem: '求 lim (1 + 1/n)ⁿ。',
      walkthrough: [
        '底数 → 1，指数 → ∞，是 1^∞ 型。',
        '取对数：ln L = lim n·ln(1 + 1/n)。',
        '用等价：ln(1 + 1/n) ~ 1/n，故 ln L = lim n·(1/n) = 1。',
        '所以 L = e。',
      ],
      result: '\\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^{n}=e',
    },
  },
  {
    id: 'radical-difference',
    title: '根式差：有理化再算',
    tag: '极限',
    level: '竞赛',
    essence:
      '遇到 √A − √B 直接代会得到 0/0 或 ∞−∞，先乘共轭把根号差变成商，往往一步就能约掉因子。',
    whenToUse: [
      '式子含 √(a+x) − √a',
      '∞ − ∞ 型且出现根号',
      '分母也是根式差',
    ],
    steps: [
      {
        title: '乘共轭',
        body: '分子分母同乘 √A + √B，差就变成了平方差。',
        formula: '\\sqrt{A}-\\sqrt{B}=\\frac{A-B}{\\sqrt{A}+\\sqrt{B}}',
      },
      {
        title: '约掉公因子',
        body: '分子通常是 x 的一次式，正好和分母的 x 约掉。',
      },
      {
        title: '代入或再用等价',
        body: '约完之后直接代入；仍不确定就用等价无穷小。',
      },
      {
        title: '留意单侧极限',
        body: '平方根要求被开方式非负，定义域可能只允许单侧趋近。',
      },
    ],
    example: {
      problem: '求 lim (√(1+x) − 1)/x。',
      walkthrough: [
        '分子分母同乘 √(1+x) + 1。',
        '分子变成 (1+x) − 1 = x。',
        '与分母的 x 约掉，剩下 1/(√(1+x) + 1)。',
        '代入 x = 0 得 1/2。',
      ],
      result: '\\lim_{x\\to 0}\\frac{\\sqrt{1+x}-1}{x}=\\frac{1}{2}',
    },
  },
  {
    id: 'infinitesimal-order',
    title: '无穷小阶的比较',
    tag: '极限',
    level: '竞赛',
    essence:
      '两个无穷小之比的极限决定它们的阶：趋于 0 是高阶，趋于无穷是低阶，趋于非零常数是同阶，等于 1 才是等价。',
    whenToUse: [
      '题目问「是几阶无穷小」',
      '需要在多个无穷小之间排序',
      '泰勒展开后判断主导项',
    ],
    steps: [
      {
        title: '写比值',
        body: '把两个无穷小相除，求 x → 0 时的极限。',
        formula: '\\lim_{x\\to 0}\\frac{\\alpha(x)}{\\beta(x)}=c',
      },
      {
        title: '按 c 分类',
        body: 'c = 0 高阶；c = ∞ 低阶；0 < c < ∞ 同阶；c = 1 等价。',
      },
      {
        title: '求阶数',
        body: '找最大的 k 使 α 与 β^k 同阶，k 就是阶。',
        formula: '\\alpha\\sim C\\beta^{k}',
      },
      {
        title: '用泰勒确认',
        body: '展开到第一个非零项，那一项的幂次就是阶，系数给出等价关系。',
      },
    ],
    example: {
      problem: '判断 1 − cos x 是 x 的几阶无穷小。',
      walkthrough: [
        '计算 (1 − cos x)/x² 的极限。',
        '用 1 − cos x ~ x²/2，比值极限为 1/2。',
        '极限是非零常数，说明与 x² 同阶。',
        '由于系数是 1/2，写成 1 − cos x ~ x²/2。',
      ],
      result: '1-\\cos x\\sim\\frac{x^{2}}{2}',
    },
  },
  {
    id: 'double-integral-symmetry',
    title: '二重积分：先用对称性砍一半',
    tag: '多元',
    level: '进阶',
    essence:
      '区域关于坐标轴对称时，被积函数对相应变量是奇函数就直接得 0，是偶函数就翻倍——先看对称性能省掉大半计算。',
    whenToUse: [
      '积分区域是圆、椭圆、正方形等对称图形',
      '被积函数含 x 或 y 的奇次幂',
      '被积函数关于 x、y 可交换',
    ],
    steps: [
      {
        title: '画区域看对称轴',
        body: '先判断区域关于 x 轴、y 轴还是原点对称。',
      },
      {
        title: '关于 y 轴对称',
        body: '此时被积函数里 x 的奇函数部分积分为 0；偶函数部分可以取右半区域乘 2。',
      },
      {
        title: '关于 x 轴对称',
        body: '同理，y 的奇函数部分为 0。',
      },
      {
        title: '轮换对称性',
        body: '区域关于 y = x 对称时，f(x,y) 与 f(y,x) 的积分相等，可用来配对化简。',
        formula: '\\iint_{D}f(x,y)\\,d\\sigma=\\iint_{D}f(y,x)\\,d\\sigma',
      },
    ],
    example: {
      problem: 'D 是单位圆，求 ∬_D x dσ。',
      walkthrough: [
        'D 关于 y 轴对称。',
        '被积函数 x 是 x 的奇函数。',
        '由对称性，积分值为 0。',
        '换成极坐标算也一样：∫₀^{2π}cos θ dθ 本身为 0。',
      ],
      result: '\\iint_{D}x\\,d\\sigma=0',
    },
  },
  {
    id: 'integral-estimate',
    title: '定积分不等式：放缩估界',
    tag: '积分',
    level: '竞赛',
    essence:
      '估界不用算出原函数：用被积函数的最值、单调性或柯西–施瓦茨，把积分夹在两个数之间即可。',
    whenToUse: [
      '题目要求「估计积分的值」或「证明不等式」',
      '被积函数没有初等原函数',
      '积分区间与函数单调性已知',
    ],
    steps: [
      {
        title: '最值放缩',
        body: '被积函数在区间上的最大值 M、最小值 m 给出上下界。',
        formula: 'm(b-a)\\le\\int_{a}^{b}f(x)\\,dx\\le M(b-a)',
      },
      {
        title: '单调性放缩',
        body: 'f 单调时用端点值代替最值，估计更粗但更快。',
      },
      {
        title: '柯西–施瓦茨',
        body: '两个函数乘积的积分，用平方积分来界。',
        formula:
          '\\left(\\int_{a}^{b}f g\\,dx\\right)^{2}\\le\\left(\\int_{a}^{b}f^{2}\\,dx\\right)\\left(\\int_{a}^{b}g^{2}\\,dx\\right)',
      },
      {
        title: '检查取等条件',
        body: '柯西取等要求 f 与 g 成比例；写证明时要说明等号能否取到。',
      },
    ],
    example: {
      problem: '估计 ∫₀¹ xⁿ dx（n 为正整数）的值。',
      walkthrough: [
        '在 [0,1] 上 xⁿ 单调递增，最小值 0、最大值 1。',
        '由最值放缩：0 ≤ ∫₀¹ xⁿ dx ≤ 1。',
        '直接算更精确：原函数是 xⁿ⁺¹/(n+1)，积分值等于 1/(n+1)。',
        'n 越大积分越小，符合直觉。',
      ],
      result: '\\int_{0}^{1}x^{n}\\,dx=\\frac{1}{n+1}',
    },
  },
  {
    id: 'trig-identity',
    title: '三角恒等变换：三组公式够用',
    tag: '三角学',
    level: '基础',
    essence:
      '和差角、倍角、辅助角三组公式串起来就能覆盖九成题；看到 a sin x + b cos x 的第一反应应该是辅助角。',
    whenToUse: [
      '化简三角表达式',
      '求 a sin x + b cos x 的最值',
      '证明三角恒等式',
    ],
    steps: [
      {
        title: '和差角',
        body: '正弦展开是「正余余正」，余弦展开是「余余正正」，符号相反。',
        formula:
          '\\sin(\\alpha\\pm\\beta)=\\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta',
      },
      {
        title: '倍角与降幂',
        body: '倍角公式反过来就是降幂公式，遇到平方优先降幂。',
        formula: '\\sin 2\\alpha=2\\sin\\alpha\\cos\\alpha',
      },
      {
        title: '辅助角',
        body: '把同角的正余弦合成一个正弦，相位由系数决定，最值立刻可见。',
        formula:
          'a\\sin x+b\\cos x=\\sqrt{a^{2}+b^{2}}\\,\\sin(x+\\varphi)',
      },
      {
        title: '和差化积',
        body: '两个正弦相加，化成乘积后常常能与分母约分。',
        formula:
          '\\sin A+\\sin B=2\\sin\\frac{A+B}{2}\\cos\\frac{A-B}{2}',
      },
      {
        title: '按结构选公式',
        body: '见平方先降幂，见乘积化和差，见 a sin + b cos 直接辅助角——别硬套。',
      },
    ],
    example: {
      problem: '化简 sin x + √3 cos x。',
      walkthrough: [
        '系数 a = 1，b = √3，幅值为 √(1+3) = 2。',
        '相位满足 cos φ = 1/2、sin φ = √3/2，即 φ = π/3。',
        '所以原式 = 2 sin(x + π/3)。',
        '由此可知最大值 2、最小值 −2。',
      ],
      result: '\\sin x+\\sqrt{3}\\cos x=2\\sin\\left(x+\\frac{\\pi}{3}\\right)',
    },
  },
  {
    id: 'euclidean-geometry',
    title: '平面几何：相似与圆幂',
    tag: '欧氏几何',
    level: '基础',
    essence:
      '平面几何题先找相似（角相等或边成比例），圆里的题则靠相交弦、切割线、弦切角三组定理把线段关系变成乘积。',
    whenToUse: [
      '证明线段成比例或乘积相等',
      '圆内两条弦相交求长度',
      '求切线与割线的关系',
    ],
    steps: [
      {
        title: '相似判定',
        body: '两角对应相等即可相似；相似给出对应边成比例。',
        formula: '\\frac{AB}{A\'B\'}=\\frac{BC}{B\'C\'}=\\frac{CA}{C\'A\'}',
      },
      {
        title: '相交弦定理',
        body: '圆内两弦交于一点，交点分出的两段乘积相等。',
        formula: 'PA\\cdot PB=PC\\cdot PD',
      },
      {
        title: '切割线定理',
        body: '从圆外一点引切线与割线，切线长的平方等于割线两段的乘积。',
        formula: 'PT^{2}=PA\\cdot PB',
      },
      {
        title: '弦切角',
        body: '弦切角等于它所夹弧对的圆周角，这是找相似最常用的入口。',
      },
      {
        title: '统一成圆幂',
        body: '点在圆内或圆外都可以用「点到两交点距离之积」表示，符号不同而已。',
      },
    ],
    example: {
      problem: '圆内两弦 AB、CD 交于 P，PA = 2，PB = 6，PC = 3，求 PD。',
      walkthrough: [
        '由相交弦定理：PA · PB = PC · PD。',
        '代入：2 × 6 = 3 × PD。',
        '解得 PD = 4。',
      ],
      result: 'PA\\cdot PB=PC\\cdot PD=12',
    },
  },
  {
    id: 'group-theory',
    title: '群论入门：先看阶',
    tag: '代数',
    level: '进阶',
    essence:
      '群是「集合 + 运算 + 四条公理」；入门题几乎都在算元素的阶、找子群，然后用拉格朗日定理卡住可能的大小。',
    whenToUse: [
      '判断一个集合配运算是否构成群',
      '求元素的阶、找子群',
      '用拉格朗日定理排除不可能的子群大小',
    ],
    steps: [
      {
        title: '四条公理',
        body: '封闭、结合、有单位元、每个元素有逆元，缺一不可；交换律不是必需的。',
        formula: '(ab)c=a(bc),\\quad ae=a,\\quad aa^{-1}=e',
      },
      {
        title: '元素的阶',
        body: '最小的正整数 k 使 a^k = e，就是这个元素的阶。',
        formula: 'a^{k}=e\\ \\Rightarrow\\ \\mathrm{ord}(a)\\mid k',
      },
      {
        title: '子群判定',
        body: '非空子集对运算与取逆都封闭，就是子群。',
      },
      {
        title: '拉格朗日定理',
        body: '子群的阶一定整除群的阶，这条能一秒排除大部分选项。',
        formula: '|G|=|H|\\cdot[G:H]',
      },
      {
        title: '循环群',
        body: '由一个元素生成的群，元素个数等于生成元的阶。',
      },
    ],
    example: {
      problem: '在加法群 Z₆ 中，求元素 2 的阶。',
      walkthrough: [
        'Z₆ 的单位元是 0，运算为模 6 加法。',
        '2×1 = 2，2×2 = 4，2×3 = 6 ≡ 0。',
        '最小的正整数是 3，所以阶为 3。',
        '由拉格朗日定理，3 必须整除 6，成立。',
      ],
      result: '\\mathrm{ord}(2)=3',
    },
  },
  {
    id: 'topology-intro',
    title: '拓扑学入门：只看开集',
    tag: '拓扑',
    level: '进阶',
    essence:
      '拓扑只关心「哪些子集算开集」；连续是开集的原像仍开，同胚是双向连续的双射——距离、角度全不重要。',
    whenToUse: [
      '判断映射是否连续',
      '判断两个空间是否同胚',
      '理解连通、紧致这类不变量',
    ],
    steps: [
      {
        title: '开集公理',
        body: '空集与全集是开集，任意并、有限交仍是开集。',
        formula: '\\varnothing,\\ X\\in\\tau',
      },
      {
        title: '连续性',
        body: '每个开集的原像都是开集，这是连续的定义，不依赖 ε-δ。',
        formula: 'f^{-1}(U)\\in\\tau_{X}',
      },
      {
        title: '连通',
        body: '不能拆成两个不相交的非空开集，就是连通。',
      },
      {
        title: '紧致',
        body: '任意开覆盖都有有限子覆盖；在欧氏空间里等价于有界闭集。',
      },
      {
        title: '同胚',
        body: '存在双向连续的双射，两个空间在拓扑上视为同一个。',
        formula: 'X\\cong Y',
      },
    ],
    example: {
      problem: '证明开区间 (0,1) 与实数轴 ℝ 同胚。',
      walkthrough: [
        '取 f(x) = tan(π(x − 1/2))，它把 (0,1) 映到 ℝ。',
        'f 连续且严格递增，反函数 arctan 也连续。',
        '所以 f 是双射且双向连续，两者同胚。',
        '这说明长度、有界性都不是拓扑性质。',
      ],
      result: '(0,1)\\cong\\mathbb{R}',
    },
  },
  {
    id: 'stochastic-process',
    title: '随机过程入门：马尔可夫与泊松',
    tag: '概率',
    level: '进阶',
    essence:
      '随机过程是一族随机变量；入门只要抓住两条：离散状态看马尔可夫链的转移矩阵，计数事件看泊松过程。',
    whenToUse: [
      '求马尔可夫链的平稳分布',
      '计算泊松过程在时间段内的事件数',
      '判断过程是否具有无记忆性',
    ],
    steps: [
      {
        title: '马尔可夫性',
        body: '下一步只依赖当前状态，与更早的历史无关，这就是无记忆性。',
        formula: 'P(X_{n+1}\\mid X_{n},\\dots,X_{0})=P(X_{n+1}\\mid X_{n})',
      },
      {
        title: '转移矩阵',
        body: '把从 i 到 j 的一步转移概率排成矩阵，每行和为 1。',
        formula: 'P_{ij}=P(X_{n+1}=j\\mid X_{n}=i)',
      },
      {
        title: '平稳分布',
        body: '解方程 πP = π 且各分量和为 1。',
        formula: '\\pi P=\\pi,\\qquad \\sum_{i}\\pi_{i}=1',
      },
      {
        title: '泊松过程',
        body: '单位时间到达率 λ，t 时间内到达次数服从泊松分布。',
        formula:
          'P(N_{t}=k)=\\frac{(\\lambda t)^{k}}{k!}e^{-\\lambda t}',
      },
      {
        title: '等待时间',
        body: '相邻两次到达的间隔服从参数 λ 的指数分布，期望是 1/λ。',
      },
    ],
    example: {
      problem: '两状态马尔可夫链，转移矩阵 P = [[0.7,0.3],[0.4,0.6]]，求平稳分布。',
      walkthrough: [
        '设 π = (π₁, π₂)，由 πP = π 得 π₁ = 0.7π₁ + 0.4π₂。',
        '化简：0.3π₁ = 0.4π₂，即 π₁ : π₂ = 4 : 3。',
        '再由 π₁ + π₂ = 1，得 π = (4/7, 3/7)。',
        '代回验证两边相等。',
      ],
      result: '\\pi=\\left(\\frac{4}{7},\\ \\frac{3}{7}\\right)',
    },
  },
  {
    id: 'set-cardinality',
    title: '集合论：用双射比大小',
    tag: '集合论',
    level: '基础',
    essence:
      '比较两个无限集合的大小，不比元素个数，比能不能一一配对（双射）；配不上的一方更大。',
    whenToUse: [
      '判断一个集合是可数还是不可数',
      '证明两个无限集合等势',
      '理解「无限也有大小之分」',
    ],
    steps: [
      {
        title: '用双射定义等势',
        body: '存在一一对应，就说两个集合等势。',
        formula: '|A|=|B|\\iff \\exists f:A\\to B\\ \\text{bijective}',
      },
      {
        title: '可数集合',
        body: '能和自然数一一对应的集合叫可数集：整数、有理数、代数数都可数。',
      },
      {
        title: '对角线法',
        body: '把区间里的数排成无穷表，再构造一个每行都对不上的数，就证明它不可数。',
      },
      {
        title: '幂集更大',
        body: '一个集合的幂集严格大于它本身，这是「没有最大无限」的来源。',
        formula: '|\\mathcal{P}(A)|=2^{|A|}>|A|',
      },
    ],
    example: {
      problem: '证明 (0,1) 里的实数不能排成一个序列。',
      walkthrough: [
        '假设能排成 a1, a2, a3, …，每个都写成小数。',
        '构造新数 b：第 k 位取 ak 第 k 位的相反数字（例如加 1 后取模 10）。',
        'b 与每个 ak 至少有一位不同，所以 b 不在列表里。',
        '与「已经全排完」矛盾，故 (0,1) 不可数。',
      ],
      result: '|\\mathbb{R}|>|\\mathbb{N}|',
    },
  },
  {
    id: 'graph-euler',
    title: '图论：欧拉公式与最短路',
    tag: '图论',
    level: '基础',
    essence:
      '连通平面图满足 V − E + F = 2；求最短路径用 Dijkstra，每步都从当前最近的未访问点扩张。',
    whenToUse: [
      '平面图计数面数或验证结构',
      '求带权图的最短路径',
      '判断一个图能否一笔画（欧拉回路）',
    ],
    steps: [
      {
        title: '欧拉公式',
        body: '对连通平面图，顶点数减边数加面数恒等于 2。',
        formula: 'V-E+F=2',
      },
      {
        title: '一笔画判定',
        body: '所有顶点度数为偶数则有欧拉回路；恰有两个奇度点则有欧拉路径。',
      },
      {
        title: 'Dijkstra',
        body: '每次取出距离最小的未访问点，用它松弛邻居，直到目标点确定。',
      },
      {
        title: '带权最短路',
        body: '松弛公式：新的距离等于当前距离加上边权，取更小者。',
        formula: 'd(v)\\leftarrow\\min(d(v),\\ d(u)+w(u,v))',
      },
    ],
    example: {
      problem: '用欧拉公式验证正四面体。',
      walkthrough: [
        '正四面体有 4 个顶点、6 条棱、4 个面。',
        '代入 V − E + F = 4 − 6 + 4 = 2。',
        '等式成立，说明它确实是连通平面图（可画在平面上）。',
      ],
      result: 'V-E+F=2',
    },
  },
  {
    id: 'information-entropy',
    title: '信息论：熵就是不确定性',
    tag: '信息论',
    level: '进阶',
    essence:
      '熵衡量一个随机变量的平均不确定性；分布越均匀，熵越大，公平硬币的熵正好是 1 bit。',
    whenToUse: [
      '计算随机变量的信息量',
      '比较两种分布的混乱程度',
      '理解编码长度的下界',
    ],
    steps: [
      {
        title: '熵的定义',
        body: '按概率加权取对数的负数，单位是 bit。',
        formula: 'H(X)=-\\sum_{x}p(x)\\log_{2}p(x)',
      },
      {
        title: '均匀分布熵最大',
        body: 'n 个等可能结果时熵为 log2 n，任何其它分布都更小。',
      },
      {
        title: '条件熵与互信息',
        body: '知道 Y 之后 X 剩下的不确定性是 H(X|Y)，减少的部分就是互信息。',
        formula: 'I(X;Y)=H(X)-H(X\\mid Y)',
      },
      {
        title: '编码下界',
        body: '无损编码的平均码长不可能低于熵。',
      },
    ],
    example: {
      problem: '一枚硬币正面概率 0.9，求它的熵。',
      walkthrough: [
        'H = −0.9·log2 0.9 − 0.1·log2 0.1。',
        'log2 0.9 ≈ −0.152，log2 0.1 ≈ −3.322。',
        'H ≈ 0.9×0.152 + 0.1×3.322 ≈ 0.469 bit。',
        '比公平硬币的 1 bit 小，因为结果更容易猜。',
      ],
      result: 'H\\approx 0.469\\ \\text{bit}',
    },
  },
  {
    id: 'game-nash',
    title: '博弈论：纳什均衡怎么找',
    tag: '博弈论',
    level: '基础',
    essence:
      '纳什均衡是一组策略组合，任何一方单独改变策略都不会让自己更好——找它的办法是「给定对方策略，看各自的最优反应」。',
    whenToUse: [
      '分析双方策略互相影响的情形',
      '判断合作能否维持',
      '解释囚徒困境这类反直觉结果',
    ],
    steps: [
      {
        title: '写出收益矩阵',
        body: '列出每种策略组合下双方的收益。',
      },
      {
        title: '逐个求最优反应',
        body: '固定对方的选择，圈出自己收益最大的那一格。',
      },
      {
        title: '找双方都满意的格子',
        body: '双方最优反应重合的组合就是纳什均衡。',
      },
      {
        title: '判别是否困境',
        body: '若存在让双方都更好、但在均衡下没人愿意先动，就是囚徒困境。',
      },
    ],
    example: {
      problem: '囚徒困境：双方都坦白是纳什均衡吗？',
      walkthrough: [
        '对方坦白时，我坦白比抵赖判得轻，所以坦白是最优反应。',
        '对方抵赖时，我坦白同样更好。',
        '无论对方怎么选，坦白都更优，因此（坦白，坦白）是均衡。',
        '但它比（抵赖，抵赖）更差，这就是困境。',
      ],
      result: '(\\text{Defect},\\ \\text{Defect})',
    },
  },
  {
    id: 'crypto-rsa',
    title: '密码学：RSA 三步',
    tag: '密码学',
    level: '基础',
    essence:
      'RSA 的安全性来自「大整数分解很难」：公钥加密、私钥解密，靠的是模逆元与欧拉定理。',
    whenToUse: [
      '理解公钥加密的基本流程',
      '计算小规模 RSA 的加解密',
      '解释为什么密钥要足够长',
    ],
    steps: [
      {
        title: '生成密钥',
        body: '选两个大素数 p、q，令 n = pq，欧拉函数 φ(n) = (p−1)(q−1)。',
        formula: 'n=pq,\\quad \\varphi(n)=(p-1)(q-1)',
      },
      {
        title: '选公钥指数',
        body: '取 e 满足 1 < e < φ(n) 且与 φ(n) 互素。',
      },
      {
        title: '算私钥',
        body: '求 d 使 e·d ≡ 1 (mod φ(n))，这就是 e 的模逆元。',
        formula: 'ed\\equiv 1\\pmod{\\varphi(n)}',
      },
      {
        title: '加解密',
        body: '加密 c = m^e mod n，解密 m = c^d mod n，由欧拉定理保证还原。',
        formula: 'c\\equiv m^{e}\\pmod n,\\qquad m\\equiv c^{d}\\pmod n',
      },
    ],
    example: {
      problem: '取 p = 61、q = 53、e = 17，加密 m = 65。',
      walkthrough: [
        'n = 61×53 = 3233，φ(n) = 60×52 = 3120。',
        '求 d：17d ≡ 1 (mod 3120)，得 d = 2753。',
        '加密：c = 65^17 mod 3233 = 2790。',
        '解密：2790^2753 mod 3233 = 65，还原成功。',
      ],
      result: 'c=2790',
    },
  },
  {
    id: 'measure-theory',
    title: '测度论：把长度变成函数',
    tag: '测度论',
    level: '进阶',
    essence:
      '测度是给集合赋「大小」的函数；勒贝格测度让「长度」适用于远比区间复杂的集合，也让积分能处理更多函数。',
    whenToUse: [
      '理解积分为什么需要「可测」',
      '计算奇怪集合的大小（如康托集）',
      '概率论的公理化基础',
    ],
    steps: [
      {
        title: '先选σ-代数',
        body: '能被赋测度的集合要构成σ-代数：对补集和可数并封闭。',
      },
      {
        title: '测度公理',
        body: '非负、空集为零、可数不交并的测度等于测度之和。',
        formula: 'm\\left(\\bigcup_{i} A_{i}\\right)=\\sum_{i} m(A_{i})',
      },
      {
        title: '勒贝格测度',
        body: '区间的测度就是长度，再通过σ-代数扩张到更多集合。',
        formula: 'm([a,b])=b-a',
      },
      {
        title: '零测集',
        body: '可数集的测度为零；康托集虽然不可数，测度也是零。',
      },
      {
        title: '勒贝格积分',
        body: '用简单函数从下方逼近，这比黎曼积分能处理更多函数。',
      },
    ],
    example: {
      problem: '求康托集三分构造中挖掉的总长度。',
      walkthrough: [
        '第 1 步挖掉 1/3，第 2 步挖掉 2 段各 1/9，第 3 步 4 段各 1/27。',
        '总长 = 1/3 + 2/9 + 4/27 + … = (1/3)/(1−2/3) = 1。',
        '原区间长度是 1，挖掉的总长也是 1。',
        '剩下的康托集测度为 0，尽管它不可数。',
      ],
      result: 'm(C)=0',
    },
  },
  {
    id: 'galois-theory',
    title: '伽罗瓦理论：五次方程为什么解不出',
    tag: '伽罗瓦',
    level: '进阶',
    essence:
      '方程能用根式解，当且仅当它的伽罗瓦群是可解群；一般五次方程的群是 S5，不可解，所以没有根式公式。',
    whenToUse: [
      '判断一个方程能否根式求解',
      '理解群与域扩张的对应',
      '解释「五次以上无求根公式」',
    ],
    steps: [
      {
        title: '域扩张',
        body: '把方程的根添进系数域，得到分裂域。',
        formula: 'K\\subseteq L',
      },
      {
        title: '伽罗瓦群',
        body: '保持基域不动的分裂域自同构，构成一个群。',
        formula: '\\mathrm{Gal}(L/K)',
      },
      {
        title: '可解群',
        body: '群能通过交换子群链一步步降到平凡群，就叫可解。',
        formula: 'G\\trianglerighteq G^{(1)}\\trianglerighteq\\cdots\\trianglerighteq\\{e\\}',
      },
      {
        title: '阿贝尔–鲁菲尼',
        body: '根式可解等价于伽罗瓦群可解；S5 与 A5 都不可解。',
      },
      {
        title: '具体判别',
        body: 'x^5 − x − 1 的分裂域伽罗瓦群是 S5，因此无根式解。',
      },
    ],
    example: {
      problem: '为什么 x^5 − x − 1 不能用根式求解？',
      walkthrough: [
        '它在有理数上不可约，实根恰好 1 个、复根 4 个。',
        '可以证明其伽罗瓦群同构于 S5。',
        'S5 的交换子群链停在 A5，而 A5 非交换，故 S5 不可解。',
        '由伽罗瓦对应，方程无根式解。',
      ],
      result: '\\mathrm{Gal}(x^{5}-x-1)\\cong S_{5}',
    },
  },
  {
    id: 'linear-programming',
    title: '线性规划：最优解在顶点',
    tag: '运筹学',
    level: '基础',
    essence:
      '目标与约束都是线性的，最优值一定在可行域的顶点取到；对偶问题给出同一最优值的上界。',
    whenToUse: [
      '资源分配、生产计划这类优化',
      '把文字约束写成线性不等式组',
      '用对偶检验最优性',
    ],
    steps: [
      {
        title: '写标准形',
        body: '目标求最大，约束全部写成 ≤ 并令变量非负。',
        formula: '\\max\\ c^{T}x\\quad \\text{s.t.}\\ Ax\\le b,\\ x\\ge 0',
      },
      {
        title: '顶点最优',
        body: '线性函数在多面体上的极值必在顶点，顶点由约束取等解出。',
      },
      {
        title: '单纯形法',
        body: '从一个顶点出发，沿使目标增大的边换到相邻顶点，直到无法改进。',
      },
      {
        title: '对偶',
        body: '原问题的上界由对偶问题给出，强对偶下两者最优值相等。',
        formula: '\\min\\ b^{T}y\\quad \\text{s.t.}\\ A^{T}y\\ge c',
      },
    ],
    example: {
      problem: '最大化 3x + 2y，约束 x + y ≤ 4、x ≤ 2、y ≤ 3、x, y ≥ 0。',
      walkthrough: [
        '可行域顶点：(0,0)、(2,0)、(2,2)、(1,3)、(0,3)。',
        '逐点代入：0、6、10、9、6。',
        '最大值为 10，在 (2,2) 取到。',
        '对偶变量可验算最优值一致。',
      ],
      result: '\\max=10\\ \\text{at}\\ (2,2)',
    },
  },
  {
    id: 'non-euclidean',
    title: '非欧几何：换掉平行公设',
    tag: '非欧几何',
    level: '进阶',
    essence:
      '把欧几里得的第五公设换掉，就得到非欧几何；双曲几何里过直线外一点有无数条平行线，三角形内角和小于 180°。',
    whenToUse: [
      '理解几何公理体系的作用',
      '区分欧氏、双曲、椭圆几何',
      '处理曲率不为零的空间',
    ],
    steps: [
      {
        title: '平行公设之争',
        body: '两千年里人们想证明第五公设，最后发现它独立于前四条。',
      },
      {
        title: '双曲几何',
        body: '过直线外一点至少有两条平行线，三角形内角和小于 π。',
        formula: '\\alpha+\\beta+\\gamma<\\pi',
      },
      {
        title: '椭圆几何',
        body: '任何两条直线都相交，三角形内角和大于 π，球面是典型模型。',
      },
      {
        title: '曲率判据',
        body: '高斯曲率为负是双曲、为零是欧氏、为正是椭圆。',
      },
      {
        title: '庞加莱圆盘',
        body: '圆盘内部是双曲平面，边界在无穷远处，距离越靠边越大。',
      },
    ],
    example: {
      problem: '双曲三角形内角和为 π/2，它的面积是多少？',
      walkthrough: [
        '曲率为 −1 时，面积等于角亏 π − (α + β + γ)。',
        '代入：π − π/2 = π/2。',
        '角亏越大，面积越大，这与欧氏几何不同。',
      ],
      result: 'S=\\pi-(\\alpha+\\beta+\\gamma)',
    },
  },
  {
    id: 'computability',
    title: '可计算性：停机问题不可判定',
    tag: '可计算性',
    level: '进阶',
    essence:
      '不是所有函数都能被算法算出；停机问题就是第一个被证明不可判定的问题，靠对角线法构造矛盾。',
    whenToUse: [
      '判断一个问题有没有算法解',
      '理解可判定与可识别的区别',
      '认识「程序数量可数而函数不可数」',
    ],
    steps: [
      {
        title: '图灵机',
        body: '一切算法都可以用图灵机描述，这是丘奇–图灵论题。',
      },
      {
        title: '可判定 vs 可识别',
        body: '可判定要求算法总能在有限步停机回答是或否；可识别只要求「是」时能停下来。',
      },
      {
        title: '停机问题',
        body: '不存在算法能对任意程序与输入判断它是否停机。',
      },
      {
        title: '对角线证明',
        body: '假设有判定器 H，构造程序 P 调用 H 后做相反的事，导出矛盾。',
      },
    ],
    example: {
      problem: '用对角线法证明停机问题不可判定。',
      walkthrough: [
        '假设 H(P, x) 能判定程序 P 在输入 x 上是否停机。',
        '构造 Q(x)：若 H(x, x) 回答「停机」，则 Q 死循环；否则 Q 立即停机。',
        '问 Q(Q) 是否停机：无论怎么答都与定义矛盾。',
        '所以 H 不存在。',
      ],
      result: '\\text{HALT}\\ \\text{undecidable}',
    },
  },

  {
    id: 'ring-ideal',
    title: '环论入门：理想与商环',
    tag: '环论',
    level: '进阶',
    essence:
      '环是能加能乘的代数结构；理想是对乘法封闭的加法子群，用它做商就像整数模 n，把「倍数」一次性归零。',
    whenToUse: [
      '判断一个子集是不是理想',
      '构造商环并判断它是否是域',
      '理解模运算的代数本质',
    ],
    steps: [
      {
        title: '环的公理',
        body: '加法成群、乘法结合、分配律；乘法交换且含幺元的叫交换幺环。',
        formula: 'a(b+c)=ab+ac',
      },
      {
        title: '零因子',
        body: '非零元素相乘得零，就说明有零因子，这样的环不是整环。',
        formula: 'ab=0,\\ a\\neq 0,\\ b\\neq 0',
      },
      {
        title: '理想',
        body: '加法子群且吸收乘法：环里任何元素乘理想里的元素，结果仍在理想中。',
        formula: 'r\\in R,\\ x\\in I\\ \\Rightarrow\\ rx\\in I',
      },
      {
        title: '商环',
        body: '按理想取陪集，得到的商环里理想变成零元素。',
        formula: 'R/I=\\{r+I\\}',
      },
      {
        title: '极大理想与域',
        body: 'I 是极大理想当且仅当 R/I 是域，这是造域的常用手法。',
      },
    ],
    example: {
      problem: '在 Z₆ 里找出零因子，并说明 ⟨2⟩ 是不是理想。',
      walkthrough: [
        '2×3 = 6 ≡ 0，而 2、3 都非零，所以 2 和 3 是零因子。',
        '⟨2⟩ = {0, 2, 4} 是加法子群。',
        '任取 r ∈ Z₆、x ∈ ⟨2⟩，rx 仍是偶数，仍在 ⟨2⟩ 中。',
        '所以 ⟨2⟩ 是理想，商环 Z₆/⟨2⟩ ≅ Z₂ 是域，⟨2⟩ 极大。',
      ],
      result: '\\mathbb{Z}_{6}/\\langle 2\\rangle\\cong\\mathbb{Z}_{2}',
    },
  },
  {
    id: 'projective-geometry',
    title: '射影几何：把平行线交于无穷远',
    tag: '射影几何',
    level: '进阶',
    essence:
      '射影平面在欧氏平面上加了一条无穷远线，平行线在那里相交；齐次坐标让「无穷远」和普通点用同一套公式处理。',
    whenToUse: [
      '处理平行线的交点问题',
      '化简圆锥曲线的分类',
      '理解透视投影下的不变量',
    ],
    steps: [
      {
        title: '齐次坐标',
        body: '平面点写成 (x : y : z)，整体乘非零常数表示同一个点。',
        formula: '(x:y:z)\\sim(\\lambda x:\\lambda y:\\lambda z)',
      },
      {
        title: '无穷远点',
        body: 'z = 0 的点就是无穷远点，所有方向各一个。',
      },
      {
        title: '平行线相交',
        body: '两条平行线在齐次坐标下解出 z = 0，交点正是它们的公共方向。',
      },
      {
        title: '交比',
        body: '四个共线点的交比在射影变换下不变，是最基本的射影不变量。',
        formula: '(A,B;C,D)=\\frac{AC\\cdot BD}{AD\\cdot BC}',
      },
    ],
    example: {
      problem: '求直线 x + y = 1 与 x + y = 2 的交点。',
      walkthrough: [
        '齐次化：x + y − z = 0 与 x + y − 2z = 0。',
        '相减得 z = 0。',
        '代回得 x + y = 0，即交点 (1 : −1 : 0)。',
        '它在无穷远线上，方向就是两直线的公共方向。',
      ],
      result: '(1:-1:0)',
    },
  },
  {
    id: 'fundamental-group',
    title: '代数拓扑：用基本群区分空间',
    tag: '代数拓扑',
    level: '进阶',
    essence:
      '基本群记录「绕不回来的圈有多少种」；圆周的基本群是整数，球面是平凡群，这个差别证明两者不同胚。',
    whenToUse: [
      '证明两个空间不同胚',
      '理解洞与环路的关系',
      '计算简单的拓扑不变量',
    ],
    steps: [
      {
        title: '环路与同伦',
        body: '从基点出发又回到基点的连续路径叫环路；能连续变形到一起的视为同一个。',
      },
      {
        title: '基本群',
        body: '环路的同伦类在首尾相接的运算下构成群。',
        formula: '\\pi_{1}(X,x_{0})',
      },
      {
        title: '圆周',
        body: '绕 k 圈就是整数 k，所以圆周的基本群是整数加群。',
        formula: '\\pi_{1}(S^{1})\\cong\\mathbb{Z}',
      },
      {
        title: '球面',
        body: '球面上任何环路都能缩成一点，基本群平凡。',
        formula: '\\pi_{1}(S^{2})=0',
      },
      {
        title: '推论',
        body: '基本群不同则空间不同胚，这是最常用的分类手段。',
      },
    ],
    example: {
      problem: '证明圆周与球面不同胚。',
      walkthrough: [
        '圆周的基本群是 Z，非平凡。',
        '球面的基本群是平凡群。',
        '两个群不同构，所以两空间不同胚。',
        '这也说明「有没有洞」是拓扑性质。',
      ],
      result: '\\pi_{1}(S^{1})\\not\\cong\\pi_{1}(S^{2})',
    },
  },
  {
    id: 'p-vs-np',
    title: '理论计算机：P 与 NP',
    tag: '计算复杂性',
    level: '进阶',
    essence:
      'P 是能快速求解的问题，NP 是能快速验证解的问题；P 是否等于 NP 是理论计算机最大的开放问题。',
    whenToUse: [
      '判断一个问题的复杂度类别',
      '理解「难解」的严格含义',
      '认识 NP 完全问题的意义',
    ],
    steps: [
      {
        title: 'P 类',
        body: '存在多项式时间算法求解的问题。',
      },
      {
        title: 'NP 类',
        body: '给定一个候选解，能在多项式时间内验证对错的问题。',
      },
      {
        title: '归约',
        body: 'A 归约到 B 意味着「会解 B 就会解 A」，用来传递难度。',
        formula: 'A\\le_{p} B',
      },
      {
        title: 'NP 完全',
        body: 'NP 中最难的一类：所有 NP 问题都能归约到它，SAT 是第一个。',
      },
      {
        title: '现状',
        body: 'P ≠ NP 被普遍相信，但至今没有证明。',
      },
    ],
    example: {
      problem: '为什么「验证解」比「求解」容易？',
      walkthrough: [
        '给一个数独答案，逐行检查是否合法只需扫描一遍。',
        '但从空盘出发求解，可能要大量搜索回溯。',
        '可快速验证正是 NP 的定义。',
        '若 P = NP，则所有可验证的问题都能快速求解。',
      ],
      result: '\\text{SAT}\\in\\text{NP-complete}',
    },
  },
  {
    id: 'control-theory',
    title: '控制论：极点决定稳定性',
    tag: '控制论',
    level: '进阶',
    essence:
      '线性系统的稳定性由极点在复平面的位置决定：全在左半平面就稳定，一旦进入右半平面就发散。',
    whenToUse: [
      '判断反馈系统是否稳定',
      '设计极点位置来调响应速度',
      '理解 PID 参数对稳定性的影响',
    ],
    steps: [
      {
        title: '传递函数',
        body: '把微分方程变成 s 的有理函数，输出与输入之比。',
        formula: 'G(s)=\\frac{Y(s)}{U(s)}',
      },
      {
        title: '极点',
        body: '分母的根就是极点，决定系统的自由响应。',
      },
      {
        title: '稳定性判据',
        body: '所有极点实部为负，系统渐近稳定；有实部为正则发散。',
        formula: '\\mathrm{Re}(s_{i})<0',
      },
      {
        title: '二阶系统',
        body: '阻尼比 ζ > 0 且自然频率 ω > 0 时，两个极点都在左半平面。',
        formula: 's^{2}+2\\zeta\\omega s+\\omega^{2}=0',
      },
      {
        title: '反馈的作用',
        body: '负反馈把极点往左拉，提高稳定性，但过强会引起振荡。',
      },
    ],
    example: {
      problem: '二阶系统 s² + 2s + 5 的极点在哪？稳定吗？',
      walkthrough: [
        '解 s² + 2s + 5 = 0，得 s = −1 ± 2i。',
        '两个极点的实部都是 −1，小于 0。',
        '所以系统渐近稳定，且会振荡（虚部非零）。',
        '阻尼比 ζ = 1/√5 ≈ 0.45，属于欠阻尼。',
      ],
      result: 's=-1\\pm 2i',
    },
  },
  {
    id: 'category-theory',
    title: '范畴论：对象与态射',
    tag: '范畴论',
    level: '进阶',
    essence:
      '范畴只关心对象之间的箭头（态射）以及它们怎么复合，不关心对象内部长什么样；函子是范畴之间的「保持结构的映射」。',
    whenToUse: [
      '统一不同数学领域的构造',
      '理解泛性质（积、余积、自由对象）',
      '看懂现代数学的通用语言',
    ],
    steps: [
      {
        title: '范畴',
        body: '一堆对象 + 一堆态射 + 复合 + 单位态射，复合满足结合律。',
        formula: 'f:A\\to B,\\ g:B\\to C\\ \\Rightarrow\\ g\\circ f:A\\to C',
      },
      {
        title: '函子',
        body: '把对象映成对象、态射映成态射，并保持复合与单位。',
        formula: 'F(g\\circ f)=F(g)\\circ F(f)',
      },
      {
        title: '自然变换',
        body: '在两个函子之间，为每个对象给一个态射，且与箭头相容。',
      },
      {
        title: '泛性质',
        body: '积、余积、自由对象都用「唯一存在的箭头」来定义，比具体构造更本质。',
      },
    ],
    example: {
      problem: '在集合范畴里，两个集合的积是什么？',
      walkthrough: [
        '对象取笛卡尔积 A × B。',
        '态射取两个投影 π₁、π₂。',
        '对任何集合 C 与一对映射，都存在唯一的映射到 A × B。',
        '这个唯一性正是「积」的泛性质。',
      ],
      result: '|A\\times B|=|A|\\cdot|B|',
    },
  },

  {
    id: 'prime-theorem',
    title: '解析数论：素数有多少个',
    tag: '解析数论',
    level: '进阶',
    essence:
      '素数越来越稀，但不会消失；素数定理说不超过 x 的素数大约有 x/ln x 个，欧拉乘积把这件事和 ζ 函数绑在一起。',
    whenToUse: [
      '估计某范围内的素数个数',
      '理解 ζ 函数与素数的关系',
      '判断素数分布的稀疏速度',
    ],
    steps: [
      {
        title: '素数计数函数',
        body: '记 π(x) 为不超过 x 的素数个数。',
        formula: '\\pi(x)=\\#\\{p\\le x: p\\ \\text{prime}\\}',
      },
      {
        title: '欧拉乘积',
        body: 'ζ 函数可以按素数拆成无穷乘积，这是解析数论的起点。',
        formula: '\\zeta(s)=\\prod_{p}\\left(1-p^{-s}\\right)^{-1}',
      },
      {
        title: '在 1 处发散',
        body: 's → 1 时 ζ 发散，对应「素数有无穷多个」的解析证明。',
      },
      {
        title: '素数定理',
        body: 'π(x) 与 x/ln x 之比趋于 1。',
        formula: '\\pi(x)\\sim\\frac{x}{\\ln x}',
      },
      {
        title: '误差与黎曼假设',
        body: '更好的误差估计等价于 ζ 的非平凡零点都在临界线上，这正是黎曼假设。',
      },
    ],
    example: {
      problem: '估计 1000 以内的素数个数，并与真值比较。',
      walkthrough: [
        '真值 π(1000) = 168。',
        '近似 x/ln x = 1000/6.9078 ≈ 144.8。',
        '比值 168/144.8 ≈ 1.16，x 越大越接近 1。',
        '这就是「素数定理是渐近式，不是等式」的含义。',
      ],
      result: '\\pi(1000)=168',
    },
  },
  {
    id: 'representation-theory',
    title: '表示论：把群变成矩阵',
    tag: '表示论',
    level: '进阶',
    essence:
      '把抽象群元素映成可计算的矩阵，就是表示；特征标（矩阵的迹）是表示最轻量的指纹，正交关系用来分解表示。',
    whenToUse: [
      '把对称性转成线性代数',
      '分解一个表示成不可约部分',
      '理解量子力学里的对称性',
    ],
    steps: [
      {
        title: '表示的定义',
        body: '群到可逆矩阵群的同态，保持乘法与单位。',
        formula: '\\rho(gh)=\\rho(g)\\rho(h)',
      },
      {
        title: '特征标',
        body: '每个群元素对应一个数：它在表示矩阵下的迹。',
        formula: '\\chi(g)=\\mathrm{tr}\\,\\rho(g)',
      },
      {
        title: '不可约表示',
        body: '没有非平凡不变子空间的表示叫不可约，是构造的基本砖块。',
      },
      {
        title: '正交关系',
        body: '不可约特征标彼此正交，可用来判断表示是否可约。',
        formula: '\\langle\\chi_{i},\\chi_{j}\\rangle=\\delta_{ij}',
      },
    ],
    example: {
      problem: '写出三阶循环群 Z₃ 的一维表示。',
      walkthrough: [
        'Z₃ 由元素 g 生成，g³ = e。',
        '一维表示必须满足 ρ(g)³ = 1。',
        '所以 ρ(g) 取 1、ω、ω² 三个三次单位根。',
        '三个一维表示的特征标互相正交。',
      ],
      result: '\\rho_{k}(g)=\\omega^{k},\\ \\omega=e^{2\\pi i/3}',
    },
  },
  {
    id: 'option-pricing',
    title: '金融数学：Black–Scholes 定价',
    tag: '金融数学',
    level: '进阶',
    essence:
      '期权的公允价格由「无套利 + 连续对冲」唯一确定；在风险中性测度下，折现后的价格是鞅，直接给出闭式公式。',
    whenToUse: [
      '计算欧式期权理论价格',
      '理解对冲与风险中性',
      '分析希腊字母对价格的影响',
    ],
    steps: [
      {
        title: '风险中性测度',
        body: '在等价鞅测度下，折现资产价格是鞅，漂移被无风险利率替代。',
      },
      {
        title: '几何布朗运动',
        body: '假设股价服从对数正态，波动率 σ 恒定。',
        formula: 'dS=\\mu S\\,dt+\\sigma S\\,dW',
      },
      {
        title: 'BS 公式',
        body: '看涨期权价格写成两个正态分布函数之差。',
        formula:
          'C=S\\,N(d_{1})-Ke^{-rT}N(d_{2}),\\quad d_{1,2}=\\frac{\\ln(S/K)+(r\\pm\\sigma^{2}/2)T}{\\sigma\\sqrt{T}}',
      },
      {
        title: '希腊字母',
        body: 'Delta、Gamma、Vega 等是价格对各参数的偏导，用来对冲。',
      },
      {
        title: '隐含波动率',
        body: '反解 σ：用市场价格倒推市场预期的波动率。',
      },
    ],
    example: {
      problem: 'S = 100、K = 100、r = 5%、σ = 20%、T = 1，求看涨期权价格。',
      walkthrough: [
        'd₁ = [ln1 + (0.05 + 0.02)·1] / 0.2 = 0.35。',
        'd₂ = d₁ − 0.2 = 0.15。',
        'N(0.35) ≈ 0.6368，N(0.15) ≈ 0.5596。',
        'C = 100×0.6368 − 100×e^(−0.05)×0.5596 ≈ 10.45。',
      ],
      result: 'C\\approx 10.45',
    },
  },
  {
    id: 'lagrangian-mechanics',
    title: '力学：用能量代替力',
    tag: '力学',
    level: '进阶',
    essence:
      '拉格朗日力学不写受力分析，只写动能减势能，再由欧拉–拉格朗日方程自动得到运动方程。',
    whenToUse: [
      '处理带约束的机械系统',
      '推导复杂系统的运动方程',
      '找守恒量与对称性的关系',
    ],
    steps: [
      {
        title: '广义坐标',
        body: '用最少的坐标描述系统，约束自动被消掉。',
      },
      {
        title: '拉格朗日量',
        body: '动能减势能，是坐标与速度的函数。',
        formula: 'L=T-V',
      },
      {
        title: '欧拉–拉格朗日方程',
        body: '对每个广义坐标写一条方程，直接得到运动方程。',
        formula: '\\frac{d}{dt}\\frac{\\partial L}{\\partial\\dot{q}}-\\frac{\\partial L}{\\partial q}=0',
      },
      {
        title: '对称性与守恒',
        body: 'L 不显含某个坐标，对应的广义动量守恒（诺特定理）。',
      },
    ],
    example: {
      problem: '用拉格朗日方法推导单摆方程。',
      walkthrough: [
        'T = ½mL²θ̇²，V = −mgL cosθ。',
        'L = ½mL²θ̇² + mgL cosθ。',
        '代入 EL 方程：mL²θ̈ − mgL·(−sinθ) = 0。',
        '化简得 θ̈ + (g/L) sinθ = 0。',
      ],
      result: '\\ddot{\\theta}+\\frac{g}{L}\\sin\\theta=0',
    },
  },
  {
    id: 'lotka-volterra',
    title: '生物数学：捕食者与猎物',
    tag: '生物数学',
    level: '进阶',
    essence:
      '捕食者–猎物模型没有稳定焦点，而是绕平衡点转圈：数量此消彼长，周期由初始条件决定。',
    whenToUse: [
      '解释种群数量的周期振荡',
      '求生态模型平衡点',
      '判断系统是否守恒',
    ],
    steps: [
      {
        title: '建立方程',
        body: '猎物自然增长、被捕食减少；捕食者靠猎物增长、自然死亡。',
        formula: '\\dot{x}=ax-bxy,\\qquad \\dot{y}=cxy-dy',
      },
      {
        title: '求平衡点',
        body: '令两个导数同时为零，得到非零平衡点。',
        formula: 'x^{*}=\\frac{d}{c},\\qquad y^{*}=\\frac{a}{b}',
      },
      {
        title: '首次积分',
        body: '存在守恒量，说明轨线是闭合曲线而不是螺旋。',
        formula: 'V=cx-d\\ln x+by-a\\ln y',
      },
      {
        title: '周期与初值',
        body: '振幅由初始种群决定，系统没有阻尼。',
      },
    ],
    example: {
      problem: '取 a = 1、b = 0.1、c = 0.075、d = 1.5，求平衡点。',
      walkthrough: [
        'x* = d/c = 1.5 / 0.075 = 20。',
        'y* = a/b = 1 / 0.1 = 10。',
        '平衡点 (20, 10)：猎物 20、捕食者 10。',
        '初始值偏离时，数量沿闭合轨道振荡。',
      ],
      result: '(x^{*},y^{*})=(20,10)',
    },
  },
];



/** 按 tag 分组，顺序按标签首次出现的顺序 */
export interface ExplainerGroup {
  tag: string;
  items: ExplainerTopic[];
}

export function groupExplainersByTag(): ExplainerGroup[] {
  const groups: ExplainerGroup[] = [];

  for (const topic of EXPLAINER_TOPICS) {
    const hit = groups.find((g) => g.tag === topic.tag);
    if (hit) hit.items.push(topic);
    else groups.push({ tag: topic.tag, items: [topic] });
  }
  return groups;
}
