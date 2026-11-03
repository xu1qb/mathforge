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
];


