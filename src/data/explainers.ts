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
  /** 严格定义（教材写法），让学生知道概念到底怎么定义 */
  definition?: string;
  whenToUse: string[];
  steps: ExplainerStep[];
  /** 定理与公式：一条一篇讲解里可以有多条 */
  theorems?: { name: string; statement: string; formula?: string }[];
  /** 易错点 */
  pitfalls?: string[];
  example: {
    problem: string;
    walkthrough: string[];
    result: string;
  };
  /** 额外例题（教材通常一节课 2-3 道） */
  moreExamples?: {
    problem: string;
    walkthrough: string[];
    result: string;
  }[];
}

export const EXPLAINER_TOPICS: ExplainerTopic[] = [
  {
    id: 'rolle',
    title: '罗尔定理：构造辅助函数',
    tag: '中值定理',
    level: '竞赛',
    essence:
      '要证"存在一点使某个等式成立"，把等式移项成"某函数的导数=0"，再验证这个函数在区间两端值相等，罗尔定理自动给出答案。',
    definition:
      '罗尔定理：函数在闭区间连续、开区间可导、两端函数值相等时，区间内至少存在一点导数为零。',
    whenToUse: [
      '结论里出现"存在 ξ ∈ (a,b)"',
      '函数在 [a,b] 连续、(a,b) 可导',
      '要证的式子含 f 与 f′ 的混合等式',
    ],
    theorems: [
      {
        name: '罗尔定理',
        statement: '两端相等且连续可导，则存在导数为零的点。',
        formula: 'f(a)=f(b)\\;\\Rightarrow\\;\\exists\\xi,\\,f^{\\prime}(\\xi)=0',
      },
      {
        name: '辅助函数构造',
        statement: '要证的等式含函数与其导数时，把结论移项后识别成某个函数的导数，再用罗尔定理。',
      },
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
      {
        title: '先验三条件',
        body: '连续、可导、两端相等，缺一不可。',
      },
    ],
    pitfalls: [
      '漏验三个条件：连续、可导、两端相等，缺一不可。',
      '区间开闭混用：可导要求在开区间。',
      '辅助函数构造错：移项要彻底，右边化成零。',
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
    },    moreExamples: [
      {
        problem: '二次多项式减四 x 加三 在一到三上满足罗尔定理，求中间点。',
        walkthrough: [
          '两端函数值都为零。',
          '导数为二 x 减四。',
          '令其为零得 x 等于二。',
        ],
        result: '\\xi=2',
      },
    ],

  },
  {
    id: 'squeeze',
    title: '夹逼定理：怎么"夹"',
    tag: '极限',
    level: '基础',
    essence:
      '找两个上下界 g、h，让 g≤f≤h，且 g 和 h 的极限相等，那么 f 被"挤"到同一个极限。',
    definition:
      '若在去心邻域内始终有 g(x) ≤ f(x) ≤ h(x)，且 g 与 h 的极限都等于 A，则 f 的极限也存在且等于 A。夹逼的关键是两边都能算出来。',
    whenToUse: [
      'n 项和/积的极限，每项有波动',
      '含 sin、cos 等有界振荡量',
      '直接算太繁，但能放缩到好算的形式',
    ],
    theorems: [
      {
        name: '夹逼定理',
        statement: '两端函数的极限相同，被夹在中间的函数的极限也等于这个值。',
        formula: 'g\\le f\\le h,\\quad\\lim g=\\lim h=A\\;\\Rightarrow\\;\\lim f=A',
      },
      {
        name: '常用放缩',
        statement: '和式型极限常把分母统一放大或缩小，构造出两个相同的边界。',
      },
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
      {
        title: '单调有界也能夹',
        body: '无法直接放缩时，可以先用单调有界准则证明极限存在，再求值。',
      },
    ],
    pitfalls: [
      '两端极限不相等：只证明有界不能推出极限存在。',
      '不等式只在部分点成立：要求整个去心邻域内成立。',
      '忘记验证前提：g、h 的极限必须存在且相等。',
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
    },    moreExamples: [
      {
        problem: '求 n 项和从根号下 n 方加一加到根号下 n 方加 n 的极限。',
        walkthrough: [
          '每一项都介于最小与最大之间。',
          '把 n 项分别用最小项与最大项替代，得到上下界。',
          '上下界都趋于一。',
          '由夹逼定理，原极限为一。',
        ],
        result: '1',
      },
    ],

  },
  {
    id: 'lhopital',
    title: '洛必达：什么时候才能用',
    tag: '极限',
    level: '基础',
    essence:
      '只有 0/0 或 ∞/∞ 型，且求导后极限存在（或为 ∞）时，才能上下分别求导再取极限。乱用必错。',
    definition:
      '若两个函数在 x₀ 附近都可导、且都趋于零或都趋于无穷，则它们之商的极限可能等于导数之商的极限。这就是洛必达法则，本质是把「零比零」变成「导数之比」。',
    whenToUse: [
      '代入后是 0/0 或 ∞/∞',
      '求导后式子更简单',
      '导函数之比极限存在',
    ],
    theorems: [
      {
        name: '洛必达法则（零比零型）',
        statement: '在去心邻域内两函数可导且分母导数不为零，若两者都趋于零、导数之商极限存在，则原极限等于导数之商的极限。',
        formula: '\\lim\\frac{f}{g}=\\lim\\frac{f^{\\prime}}{g^{\\prime}}',
      },
      {
        name: '高阶无穷小之比',
        statement: '零比零型的极限由最低阶非零项决定，因此反复用洛必达直到分母不趋于零为止。',
      },
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
      {
        title: '换成等价量更快',
        body: '先用等价无穷小化简，再决定是否洛必达，常能少求一次导。',
      },
    ],
    pitfalls: [
      '没验证前提就套：导数之商不存在时，原极限仍可能存在，不能反推法则失效。',
      '在非未定式上用：一比二这种直接极限被拿去求导，结果全错。',
      '和等价无穷小混用：分子换了等价量、分母没换，极限值会变。',
    ],
    example: {
      problem: '求 lim(x→0) (sin x)/x。',
      walkthrough: [
        '代入 x=0：0/0，是未定式。',
        '分子求导 cos x，分母求导 1。',
        '得 lim cos x / 1 = cos 0 = 1。',
      ],
      result: '\\displaystyle\\lim_{x\\to 0}\\frac{\\sin x}{x}=1',
    },    moreExamples: [
      {
        problem: '求 x 趋于零时 (e 的 x 次方减一减 x) 除以 x 平方的极限。',
        walkthrough: [
          '这是零比零型，可以连续用两次洛必达。',
          '第一次求导后仍是零比零。',
          '第二次求导得指数除以二。',
          '代入零得二分之一。',
        ],
        result: '\\frac{1}{2}',
      },
    ],

  },
  {
    id: 'taylor',
    title: '泰勒展开：阶数怎么选',
    tag: '级数',
    level: '进阶',
    essence:
      '展到"抵消后余项刚好比需要的高阶"为止——多一项浪费，少一项消不掉。',
    definition:
      '用函数在某点的各阶导数构造多项式，使它与原函数在该点直到 n 阶导数都相同，余项刻画误差。这就是泰勒公式。',
    whenToUse: [
      '求极限中含多个小量相加',
      '要判断无穷小的阶',
      '洛必达用不动的式子',
    ],
    theorems: [
      {
        name: '带皮亚诺余项的泰勒公式',
        statement: '函数在一点 n 阶可导时，可以用 n 次多项式逼近，余项是比 x 减该点 n 次方高阶的无穷小。',
        formula: 'f(x)=\\sum\\frac{f^{(k)}(x_0)}{k!}(x-x_0)^{k}+o((x-x_0)^{n})',
      },
      {
        name: '带拉格朗日余项',
        statement: '余项可写成某中间点处第 n 加一阶导数乘以幂次除以阶乘，用于估计误差。',
      },
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
      {
        title: '用余项估误差',
        body: '近似计算时把余项放大成常数乘幂次，即可给出误差上界。',
      },
    ],
    pitfalls: [
      '阶数选不够：展开到抵消项之后的第一个非零项才够。',
      '展开点选错：要在极限点展开，不是原点。',
      '余项阶数写错：写成比实际低一阶的无穷小，结论会失效。',
    ],
    example: {
      problem: '求 lim(x→0) (sin x − x)/x³。',
      walkthrough: [
        'sin x = x − x³/6 + o(x³)。',
        '分子 sin x − x = −x³/6 + o(x³)。',
        '除以 x³：−1/6 + o(1)。',
      ],
      result: '\\displaystyle\\lim_{x\\to 0}\\frac{\\sin x-x}{x^3}=-\\frac{1}{6}',
    },    moreExamples: [
      {
        problem: '把指数函数展开到三阶，并求 x 趋于零时它与一加 x 加二分之 x 平方之差的阶。',
        walkthrough: [
          '指数展开到三阶得三阶多项式加四阶余项。',
          '与二次多项式相减，主项是三次项。',
          '因此差是三阶无穷小。',
        ],
        result: '\\frac{x^{3}}{6}',
      },
    ],

  },
  {
    id: 'equivalent',
    title: '等价无穷小：能在哪儿换',
    tag: '极限',
    level: '基础',
    essence:
      '乘除结构里可以把复杂的无穷小换成同阶的简单量，极限不变；加减结构里直接换会丢掉同阶项，必须多展一阶。',
    definition:
      '若两个无穷小之比的极限为一，则称它们等价，记作 α ~ β。等价替换的依据是：乘积因子可以用等价量替换而不改变极限，加减法不一定。',
    whenToUse: [
      '0/0 型极限，式子里出现 sin、tan、ln(1+x)、e^x−1',
      '复杂因子以乘除形式出现',
      '想快速判断无穷小的阶',
    ],
    theorems: [
      {
        name: '等价替换定理',
        statement: '在乘除运算中，无穷小因子可用其等价无穷小替换，极限不变。',
        formula: '\\lim\\frac{\\alpha\\beta}{\\gamma}=\\lim\\frac{\\alpha\\beta^{\\prime}}{\\gamma}',
      },
      {
        name: '常用等价关系',
        statement: '正弦、正切、反正弦、对数一加、指数减一等在零点都与自变量等价。',
        formula: '\\sin x\\sim x,\\quad\\ln(1+x)\\sim x,\\quad e^{x}-1\\sim x',
      },
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
      {
        title: '确认趋于零的前提',
        body: '等价替换要求自变量趋于零，趋于其他点要先平移。',
      },
    ],
    pitfalls: [
      '在加减法里直接替换：两个同阶项相减会抵消，替换后误差被放大，必须展开到不抵消的阶。',
      '忽略替换前提：只在自变量趋于零时成立，趋于其他点要平移。',
      '把阶数看错：高阶无穷小替换后可能把主导项换没了。',
    ],
    example: {
      problem: '求 lim(x→0) (tan x − sin x)/x³。',
      walkthrough: [
        'tan x = x + x³/3 + o(x³)，sin x = x − x³/6 + o(x³)。',
        '相减得 x³/2 + o(x³)。',
        '除以 x³，极限为 1/2。',
      ],
      result: '\\displaystyle\\lim_{x\\to 0}\\frac{\\tan x-\\sin x}{x^{3}}=\\frac{1}{2}',
    },    moreExamples: [
      {
        problem: '求 x 趋于零时 (tan x 减 sin x) 除以 x 立方的极限。',
        walkthrough: [
          '分子两项都是无穷小，不能直接相减替换。',
          '通分后化为 sin x 乘 (1 减 cos x) 除以 cos x 除以 x 立方。',
          '用等价关系：sin x 等价 x，1 减 cos x 等价二分之 x 平方。',
          '结果为二分之一。',
        ],
        result: '\\frac{1}{2}',
      },
    ],

  },
  {
    id: 'riemann',
    title: '定积分定义：和式变积分',
    tag: '积分',
    level: '基础',
    essence:
      'n 项和只要能凑成 (1/n)Σf(i/n)，它的极限就是 f 在 [0,1] 上的定积分——求和算不动时的标准出路。',
    definition:
      '把区间分成 n 份，用每份上某点的函数值乘区间长度求和，再让最大子区间长度趋于零。若极限存在，就称这个极限为定积分。它不依赖分法与取点。',
    whenToUse: [
      '求 n 项和的极限，分母次数比分子高一次',
      '和式里出现 i/n 这样的结构',
      '硬求和求不出来',
    ],
    theorems: [
      {
        name: '可积的充分条件',
        statement: '闭区间上连续的函数一定可积；有有限个第一类间断点的有界函数也可积。',
      },
      {
        name: '和式的标准化',
        statement: '把和式凑成 n 分之一乘某个函数在 i 比 n 处的取值，就能把求和式变成定积分。',
        formula: '\\lim\\frac{1}{n}\\sum f\\left(\\frac{i}{n}\\right)=\\int_{0}^{1}f(x)\\,dx',
      },
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
      {
        title: '取特殊分法',
        body: '证明可积时取等分与右端点，能覆盖大多数考试情形。',
      },
    ],
    pitfalls: [
      '区间长度写错：分成 n 份时每份长度是 n 分之一，不是 1。',
      '取点与分法不一致：写成函数在端点取值却按中点求和的思路，表达式对不上。',
      '把和式极限直接当积分：必须先凑成标准形式，否则提取不出被积函数。',
    ],
    example: {
      problem: '求 lim (1/n)(√(1/n) + √(2/n) + … + √(n/n))。',
      walkthrough: [
        '写成 (1/n)Σ√(i/n)。',
        '对应 ∫₀¹ √x dx。',
        '算得 2/3。',
      ],
      result: '\\displaystyle\\int_{0}^{1}\\sqrt{x}\\,dx=\\frac{2}{3}',
    },    moreExamples: [
      {
        problem: '把 i 从 1 到 n 的 (i 比 n) 平方求和再除以 n，求极限。',
        walkthrough: [
          '这正是标准形式：n 分之一乘 f(i/n)，其中 f 是平方。',
          '转成平方在零到一上的定积分。',
          '积分得三分之一。',
        ],
        result: '\\frac{1}{3}',
      },
    ],

  },
  {
    id: 'byparts',
    title: '分部积分：谁当 u',
    tag: '积分',
    level: '基础',
    essence:
      '把不好积的 ∫u dv 换成 uv − ∫v du；u 选对了，剩下的积分一定比原来简单。',
    definition:
      '分部积分由乘积求导公式移项得到：把被积式看成 u 乘 dv，积分等于 u 乘 v 减去 v 乘 du 的积分。它的作用是降低被积函数的复杂度。',
    whenToUse: [
      '被积函数是两类函数相乘',
      '出现 ln x、arctan x 单独一个因子',
      '换元之后仍然积不出来',
    ],
    theorems: [
      {
        name: '分部积分公式',
        statement: '两个可导函数乘积的积分，等于 u 乘 v 减去交换后的积分。',
        formula: '\\int u\\,dv=uv-\\int v\\,du',
      },
      {
        name: '选 u 的口诀',
        statement: '反三角、对数、幂、三角、指数，按此顺序优先取为 u，越靠前越应求导。',
      },
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
      {
        title: '连续两次分部',
        body: '多项式乘指数或三角时，按多项式阶数连续分部，直到降为零次。',
      },
    ],
    pitfalls: [
      'u 选反了：把指数当 u、多项式当 dv，积分会越做越复杂。',
      '循环积分忘记移项：两次分部回到原式后要移项解出，不能继续无限分部。',
      '定积分忘记端点项：定积分分部后有 uv 在端点的差，漏掉就错。',
    ],
    example: {
      problem: '求 ∫ x e^x dx。',
      walkthrough: [
        '取 u = x，dv = e^x dx。',
        '则 du = dx，v = e^x。',
        '代公式：x e^x − ∫e^x dx = x e^x − e^x + C。',
      ],
      result: '\\displaystyle\\int x e^{x}\\,dx=(x-1)e^{x}+C',
    },    moreExamples: [
      {
        problem: '计算 x 乘正弦 x 的积分。',
        walkthrough: [
          '取多项式为 u，正弦为 dv。',
          '分部得负 x 乘余弦加余弦的积分。',
          '余弦积分为正弦。',
          '结果为负 x 余弦加正弦加常数。',
        ],
        result: '-x\\cos x+\\sin x+C',
      },
    ],

  },
  {
    id: 'series-test',
    title: '级数判敛：先排除再选法',
    tag: '级数',
    level: '基础',
    essence:
      '通项不趋于 0 直接发散；正项级数用比值或比较，交错级数用莱布尼茨，任意项先看绝对收敛。',
    definition:
      '级数收敛指部分和数列有极限。判断收敛的通用路线是：先看通项是否趋于零，再按正项、交错、任意项分类选择判别法。',
    whenToUse: [
      '判断 Σaₙ 的敛散性',
      '求收敛半径与收敛域',
      '解答里需要写明用了哪个判别法',
    ],
    theorems: [
      {
        name: '收敛的必要条件',
        statement: '级数收敛则通项必趋于零；通项不趋于零时级数一定发散。',
        formula: '\\sum a_{n}<\\infty\\;\\Rightarrow\\;a_{n}\\to 0',
      },
      {
        name: '比值与根值判别',
        statement: '正项级数相邻项比值（或通项的 n 次根）极限小于一收敛、大于一发散、等于一时失效。',
        formula: '\\lim\\left|\\frac{a_{n+1}}{a_{n}}\\right|<1\\;\\Rightarrow\\;\\sum a_{n}<\\infty',
      },
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
      {
        title: '先看通项',
        body: '通项不趋于零可直接判发散，省掉后面所有判别步骤。',
      },
    ],
    pitfalls: [
      '反过来用必要条件：通项趋于零只是必要，调和级数就是反例。',
      '判据等于一时下结论：比值等于一时判别法失效，要换比较法。',
      '交错级数只看绝对值：绝对值收敛是绝对收敛，条件收敛要另判。',
    ],
    example: {
      problem: '判断 Σ n/2ⁿ 的敛散性。',
      walkthrough: [
        '通项 n/2ⁿ 趋于 0，必要条件满足。',
        '比值 aₙ₊₁/aₙ = (n+1)/(2n) 趋于 1/2，小于 1。',
        '由比值判别法，级数收敛。',
      ],
      result: '\\displaystyle\\sum_{n=1}^{\\infty}\\frac{n}{2^{n}}=2',
    },    moreExamples: [
      {
        problem: '判断 n 的阶乘除以 n 的 n 次方这个级数是否收敛。',
        walkthrough: [
          '这是正项级数，通项趋于零。',
          '算相邻项比值，极限为自然常数分之一。',
          '极限小于一。',
          '由比值判别法，级数收敛。',
        ],
        result: '\\sum_{n=1}^{\\infty}\\dfrac{n!}{n^{n}}<\\infty',
      },
    ],

  },
  {
    id: 'rank',
    title: '矩阵的秩：一个数管三件事',
    tag: '线代',
    level: '基础',
    essence:
      '秩等于阶梯形的非零行数，也等于极大线性无关组中向量的个数；它同时决定方程组解的自由度和向量组的线性相关性。',
    definition:
      '矩阵的秩是行向量组的极大线性无关组的大小，也等于化成梯形后非零行的个数。它衡量矩阵携带的有效信息量。',
    whenToUse: [
      '含参数矩阵讨论秩',
      '判断向量组是否线性相关',
      '判断线性方程组解的结构',
    ],
    theorems: [
      {
        name: '初等变换不改变秩',
        statement: '行初等变换保持秩不变，因此可用高斯消元求秩。',
      },
      {
        name: '秩与解',
        statement: '线性方程组有解当且仅当系数矩阵与增广矩阵的秩相等。',
        formula: 'r(A)=r(A|b)',
      },
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
      {
        title: '化到阶梯形',
        body: '初等行变换化成阶梯形，非零行数就是秩。',
      },
    ],
    pitfalls: [
      '把秩当行列式：非方阵也有秩。',
      '忘记化到最简：非零行个数要看清。',
      '增减行算错：初等变换不改变秩。',
    ],
    example: {
      problem: '矩阵 A 的三行为 (1,2,3)、(2,4,6)、(1,1,1)，求 r(A)。',
      walkthrough: [
        '第二行是第一行的 2 倍，消去后归零。',
        '第一行减第三行得 (0,1,2)。',
        '还剩两个非零行。',
      ],
      result: 'r(A)=2',
    },    moreExamples: [
      {
        problem: '求一、二、二、四 的秩。',
        walkthrough: [
          '两行成比例。',
          '只有一行独立。',
        ],
        result: '1',
      },
    ],

  },
  {
    id: 'positive-definite',
    title: '二次型正定：三种判法',
    tag: '线代',
    level: '基础',
    essence:
      '正定等价于顺序主子式全正，也等价于对称矩阵特征值全正；只判正定用主子式，要标准形时用特征值。',
    definition:
      '二次型正定指对任意非零向量取值都为正。判据是矩阵的所有顺序主子式都为正，或所有特征值为正。',
    whenToUse: [
      '判断二次型是否正定',
      '求参数范围使二次型正定',
      '化标准形、求惯性指数',
    ],
    theorems: [
      {
        name: '顺序主子式判据',
        statement: '对称矩阵正定当且仅当所有顺序主子式大于零。',
        formula: '\\Delta_k>0\\;\\forall k',
      },
      {
        name: '特征值判据',
        statement: '正定等价于所有特征值为正。',
      },
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
      {
        title: '验顺序主子式',
        body: '全部顺序主子式为正才正定。',
      },
    ],
    pitfalls: [
      '只验行列式：所有顺序主子式都要验。',
      '半正当正定：存在非零向量取零值时为半正定。',
      '非对称矩阵套用：判据针对对称矩阵。',
    ],
    example: {
      problem: 'f = x₁² + 2x₂² + 3x₃² + 2x₁x₂，判断它是否正定。',
      walkthrough: [
        '对称矩阵前两行列为 1、1、0 与 1、2、0，第三对角元为 3。',
        'Δ₁ = 1 > 0，Δ₂ = 2 − 1 = 1 > 0，Δ₃ = 3 > 0。',
        '顺序主子式全正，所以正定。',
      ],
      result: '\\Delta_{1}=1,\\ \\Delta_{2}=1,\\ \\Delta_{3}=3',
    },    moreExamples: [
      {
        problem: '判断 x 方加二 x y 加二 y 方是否正定。',
        walkthrough: [
          '一阶主子式为一。',
          '二阶行列式为一。',
          '都为正，因此正定。',
        ],
        result: '\\text{positive definite}',
      },
    ],

  },
  {
    id: 'bayes',
    title: '全概率与贝叶斯：反推原因',
    tag: '概率',
    level: '基础',
    essence:
      '结果是若干原因之一造成的时候，先按原因分组算全概率，再用贝叶斯把分母换成它，反推到底是哪个原因。',
    definition:
      '全概率公式把复杂事件按原因分解求和；贝叶斯公式反过来，由结果推断原因的概率，需要先验概率。',
    whenToUse: [
      '题目分两步：先选来源，再做试验',
      '已知结果，反推原因的概率',
      '次品率、检测、抽签类问题',
    ],
    theorems: [
      {
        name: '全概率公式',
        statement: '按一组互斥完备的原因分解事件概率。',
        formula: 'P(B)=\\sum P(A_i)P(B\\mid A_i)',
      },
      {
        name: '贝叶斯公式',
        statement: '后验概率正比于先验概率乘似然。',
        formula: 'P(A_i\\mid B)=\\frac{P(A_i)P(B\\mid A_i)}{P(B)}',
      },
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
      {
        title: '先算全概率',
        body: '贝叶斯公式的分母就是全概率，先算它。',
      },
    ],
    pitfalls: [
      '先验与后验混：贝叶斯里的分母是全概率。',
      '原因不互斥：分解必须互斥且完备。',
      '条件方向写反：是结果推原因，不是原因推结果。',
    ],
    example: {
      problem: '两台机器产量占 60% 与 40%，次品率分别 1% 与 2%。任取一件是次品，它来自第一台的概率？',
      walkthrough: [
        'P(A) = 0.6×0.01 + 0.4×0.02 = 0.014。',
        '分子 = 0.6×0.01 = 0.006。',
        '相除得 3/7。',
      ],
      result: 'P(B_{1}\\mid A)=\\frac{3}{7}',
    },    moreExamples: [
      {
        problem: '两个盒子取球，已知取到白球，求来自第一个盒子的概率。',
        walkthrough: [
          '先算取到白球的全概率。',
          '再算第一个盒子贡献的部分。',
          '相除得后验概率。',
        ],
        result: '\\frac{P(A_1)P(B\\mid A_1)}{P(B)}',
      },
    ],

  },
  {
    id: 'distribution',
    title: '分布识别：数次数还是等时间',
    tag: '概率',
    level: '基础',
    essence:
      '数成功次数用二项，稀有事件计数用泊松，不放回用超几何，等时间用指数；先定类型，再套期望方差。',
    definition:
      '随机变量的分布由分布函数刻画。离散型用分布律，连续型用密度函数；常见分布按「数次数」还是「等时间」来选。',
    whenToUse: [
      '写分布律或概率密度',
      '求期望与方差',
      '判断题目该用哪个分布',
    ],
    theorems: [
      {
        name: '分布函数性质',
        statement: '分布函数单调不减、右连续，两端极限为零与一。',
        formula: 'F(x)=P(X\\le x)',
      },
      {
        name: '密度与分布',
        statement: '连续型的密度是分布函数的导数，分布函数是密度的积分。',
      },
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
    pitfalls: [
      '离散连续混用：离散用求和，连续用积分。',
      '密度值当概率：连续型单点概率为零。',
      '参数意义记错：泊松是单位时间次数，指数是等待时间。',
    ],
    example: {
      problem: '100 件产品中有 5 件次品，不放回取 3 件，X 为其中的次品数，求分布律。',
      walkthrough: [
        '不放回抽样，属于超几何分布。',
        '从 5 件次品中取 k 件，从 95 件正品中取 3−k 件。',
        '再除以总取法 C(100,3)。',
      ],
      result: 'P(X=k)=\\frac{\\binom{5}{k}\\binom{95}{3-k}}{\\binom{100}{3}}',
    },    moreExamples: [
      {
        problem: '四次独立试验、每次成功率一半，求恰好两次成功的概率。',
        walkthrough: [
          '这是二项分布。',
          '组合数乘两个概率因子。',
        ],
        result: '\\frac{3}{8}',
      },
    ],

  },
  {
    id: 'taylor-table',
    title: '泰勒常用展开：背这张表',
    tag: '极限',
    level: '基础',
    essence:
      '求极限、判无穷小的阶、做近似，八成就用这几个展开；记到三次项，绝大多数题够用。',
    definition:
      '常用展开表是泰勒公式的具体化，记熟指数、正弦、余弦、对数、几何级数五组，其余靠代换与运算推出。',
    whenToUse: [
      '0/0 型但洛必达越算越复杂',
      '要判断无穷小的阶',
      '做近似计算或估计误差',
    ],
    theorems: [
      {
        name: '几何级数展开',
        statement: '公比绝对值小于一时，一减公比分之一可以展开成幂级数。',
        formula: '\\frac{1}{1-x}=\\sum_{n=0}^{\\infty}x^{n}',
      },
      {
        name: '指数展开',
        statement: '指数函数的展开式对所有实数收敛。',
        formula: 'e^{x}=\\sum_{n=0}^{\\infty}\\frac{x^{n}}{n!}',
      },
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
    pitfalls: [
      '收敛域记错：对数展开只在特定区间成立。',
      '代换后忘改收敛域：x 换成 x 平方后区间也变。',
      '阶乘漏写：指数与正弦展开的分母含阶乘。',
    ],
    example: {
      problem: '求 lim(x→0) (e^x − 1 − x)/x²。',
      walkthrough: [
        'e^x = 1 + x + x²/2 + o(x²)。',
        '分子 = x²/2 + o(x²)。',
        '除以 x²，极限为 1/2。',
      ],
      result: '\\displaystyle\\lim_{x\\to 0}\\frac{e^{x}-1-x}{x^{2}}=\\frac{1}{2}',
    },    moreExamples: [
      {
        problem: '写出正弦的三阶展开。',
        walkthrough: [
          '正弦展开只有奇次项。',
          '第一项为 x，第二项为负六分之 x 立方。',
        ],
        result: 'x-\\frac{x^{3}}{6}',
      },
    ],

  },
  {
    id: 'mvt-construct',
    title: '中值定理：辅助函数对照表',
    tag: '中值定理',
    level: '竞赛',
    essence:
      '结论里 f 与 f′ 的搭配方式，基本决定了辅助函数长什么样；记住几组对照，比现场硬猜快得多。',
    definition:
      '中值定理证明题的核心是构造辅助函数：把待证等式移项，使右边为零，再把左边认成某个函数的导数，然后用罗尔定理。',
    whenToUse: [
      '要证的等式同时含 f 与 f′',
      '结论形如 ξf′(ξ) 加 kf(ξ) 等于 0',
      '想过一遍常见构造，避免漏解',
    ],
    theorems: [
      {
        name: '常见辅助函数',
        statement: '结论中含 f 与 f 撇的混合式时，乘上指数或多项式因子可凑成乘积的导数。',
        formula: '(e^{x}f(x))^{\\prime}=e^{x}(f+f^{\\prime})',
      },
      {
        name: '构造原则',
        statement: '辅助函数要在两端取相同值，才能用罗尔定理。',
      },
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
    pitfalls: [
      '不移项就构造：右边不为零时容易认错导数形式。',
      '两端值不等：罗尔定理用不了。',
      '辅助函数选错：先试乘指数与乘多项式两类。',
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
    },    moreExamples: [
      {
        problem: '证明存在一点使函数等于二倍导数的等式成立，用什么辅助函数。',
        walkthrough: [
          '把结论移项成导数为零。',
          '识别为指数乘函数的导数。',
          '取该函数作辅助函数。',
        ],
        result: 'F(x)=e^{-2x}f(x)',
      },
    ],

  },
  {
    id: 'lagrange',
    title: '拉格朗日乘数法：条件极值',
    tag: '多元',
    level: '进阶',
    essence:
      '把约束乘上 λ 加进目标函数，条件极值就变成新函数的无条件驻点问题；λ 还顺便告诉你约束松一点能多赚多少。',
    definition:
      '条件极值在约束下求极值，拉格朗日乘数法把约束与目标合成一个函数，驻点满足梯度与约束梯度平行。',
    whenToUse: [
      '求条件极值，约束是等式',
      '约束有两三个，目标函数可导',
      '应用题里求「在预算内最大化」这类问题',
    ],
    theorems: [
      {
        name: '拉格朗日乘数法',
        statement: '在约束曲面上取极值的点，目标梯度与约束梯度成比例。',
        formula: '\\nabla f=\\lambda\\nabla g',
      },
      {
        name: '多约束情形',
        statement: '多个约束时引入多个乘数，梯度写成约束梯度的线性组合。',
      },
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
    pitfalls: [
      '漏解边界：乘数法给内部驻点，边界要单独比较。',
      '方程组解不全：非线性方程组可能有多组解。',
      '乘数符号纠结：λ 可正可负，不必先定符号。',
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
    },    moreExamples: [
      {
        problem: '求 x 加 y 在约束 x 平方加 y 平方等于一下的最大值。',
        walkthrough: [
          '梯度成比例得两个方程。',
          '结合约束解出两组解。',
          '比较得最大值。',
        ],
        result: '\\sqrt{2}',
      },
    ],

  },
  {
    id: 'linear-ode',
    title: '一阶线性方程：通解公式',
    tag: '微分方程',
    level: '基础',
    essence:
      'y′ + P(x)y = Q(x) 有一套固定解法，背下公式最快；记不住就用积分因子现场推，两分钟能推完。',
    definition:
      '一阶线性微分方程形如导数加系数乘函数等于右端项。解法是先求齐次通解，再用常数变易法求特解，两者相加得通解。',
    whenToUse: [
      '方程对 y 和 y′ 都是一次的',
      'Q(x) 是任意函数，不能分离变量',
      '带初值的一阶线性问题',
    ],
    theorems: [
      {
        name: '通解公式',
        statement: '一阶线性方程的通解由齐次解与一个特解相加，可用积分因子统一写出。',
        formula: 'y=e^{-\\int P}\\left(\\int Qe^{\\int P}dx+C\\right)',
      },
      {
        name: '解的存在唯一性',
        statement: '系数与右端项在区间上连续时，给定初值的解存在且唯一。',
      },
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
      {
        title: '先判别类型',
        body: '确认是一阶线性再套公式，可分离或齐次的优先用更简单的方法。',
      },
    ],
    pitfalls: [
      '漏写常数 C：通解必须含任意常数。',
      '积分因子符号错：指数上要带负号，符号错结果全反。',
      '初值代错：代入原方程与初值条件都要验。',
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
    },    moreExamples: [
      {
        problem: '解导数加二倍函数等于零，初值为一。',
        walkthrough: [
          '这是齐次方程。',
          '通解为指数乘常数。',
          '代入初值定常数为一。',
        ],
        result: 'y=e^{-2x}',
      },
    ],

  },
  {
    id: 'double-integral-order',
    title: '二重积分：换序与极坐标',
    tag: '多元',
    level: '进阶',
    essence:
      '二重积分难的不是积分，是定限：先画区域图，再决定先对谁积；圆域直接上极坐标。',
    definition:
      '二重积分可写成两种累次积分顺序。选择哪种，取决于区域用哪个变量描述更简单；换序时要把区域重新画清楚，上下限跟着变。',
    whenToUse: [
      '内层积不出原函数，比如 e 的 x 平方',
      '区域是圆、扇形、圆环',
      '被积函数含 x² + y²',
    ],
    theorems: [
      {
        name: '累次积分',
        statement: '区域可写成先对一个变量积分、再对另一个变量积分的形式，值相同。',
        formula: '\\iint_{D}f\\,d\\sigma=\\int_{a}^{b}dx\\int_{y_1(x)}^{y_2(x)}f\\,dy',
      },
      {
        name: '极坐标变换',
        statement: '圆或扇形区域用极坐标，面积元多一个径向因子。',
        formula: 'd\\sigma=r\\,dr\\,d\\theta',
      },
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
    pitfalls: [
      '换序不画图：上下限会写反或写成常数。',
      '极坐标漏 r：面积元漏掉径向因子，结果全错。',
      '内外层变量混：内层上限只能含外层变量。',
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
    },    moreExamples: [
      {
        problem: '把先对 y 后对 x 的积分改成先对 x 后对 y，区域为三角形。',
        walkthrough: [
          '画出三角形区域。',
          '按 x 方向重新描述上下界。',
          '写出新的累次积分。',
        ],
        result: '\\int dy\\int f\\,dx',
      },
    ],

  },
  {
    id: 'plane-equation',
    title: '平面方程：五种写法与距离',
    tag: '空间几何',
    level: '基础',
    essence:
      '一个平面由「一点 + 法向量」唯一确定，五种写法只是把法向量换不同的包装；点到平面的距离本质上是一段投影长度。',
    definition:
      '平面由一点与一个法向量确定，点法式方程是法向量与动点减定点之内积为零。',
    whenToUse: [
      '求过三点的平面方程',
      '判断两平面平行还是垂直',
      '求点到平面的距离',
      '空间直线与平面的位置关系',
    ],
    theorems: [
      {
        name: '点法式',
        statement: '已知平面上一点与法向量，可写出平面方程。',
        formula: 'A(x-x_{0})+B(y-y_{0})+C(z-z_{0})=0',
      },
      {
        name: '点到平面距离',
        statement: '点到平面的距离等于代入方程取绝对值再除以法向量长度。',
        formula: 'd=\\frac{|Ax_{0}+By_{0}+Cz_{0}+D|}{\\sqrt{A^{2}+B^{2}+C^{2}}}',
      },
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
    pitfalls: [
      '法向量取成方向向量：平面法向量垂直于平面内任意向量。',
      '距离公式漏除模长：分母是法向量长度。',
      '一般式系数按比例缩放：写成最简整数更规范。',
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
    },    moreExamples: [
      {
        problem: '求原点到平面 x 加二 y 减二 z 等于一的距离。',
        walkthrough: [
          '法向量长度为三。',
          '代入原点得常数项负一。',
          '取绝对值除以三。',
        ],
        result: '\\frac{1}{3}',
      },
    ],

  },
  {
    id: 'sequence-limit',
    title: '数列极限：先证存在再求值',
    tag: '极限',
    level: '进阶',
    essence:
      '递推数列给不出通项时，先证「有界 + 单调」把极限的存在性坐实，再对递推式两边取极限解出值。',
    definition:
      '对任意给定的正数，总存在一项之后所有项与常数之差的绝对值都小于它，就称数列收敛于该常数。这是极限的严格定义。',
    whenToUse: [
      '给出 aₙ₊₁ = f(aₙ)，求不出通项',
      '题目要求「证明极限存在」',
      '能用单调有界准则或夹逼的数列',
    ],
    theorems: [
      {
        name: '单调有界准则',
        statement: '单调递增且有上界（或单调递减且有下界）的数列一定收敛。',
      },
      {
        name: '递推数列求极限',
        statement: '先证数列有界且单调，确认极限存在，再在递推式两边取极限解方程。',
      },
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
    pitfalls: [
      '只证有界不证单调：有界数列不一定收敛。',
      '先取极限后证存在：顺序反了，极限可能不存在。',
      '解出的根不筛选：方程可能有两个根，要用单调性排除。',
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
    },    moreExamples: [
      {
        problem: '数列首项为一，后一项等于根号下二加前一项，求极限。',
        walkthrough: [
          '先证数列递增且有上界二。',
          '由单调有界准则，极限存在。',
          '在递推式两边取极限得方程。',
          '解方程并舍去负根。',
          '极限为二。',
        ],
        result: '2',
      },
    ],

  },
  {
    id: 'definite-integral-substitution',
    title: '定积分换元与区间再现',
    tag: '积分',
    level: '竞赛',
    essence:
      '换元必须同时换上下限；遇到 f(x) 与 f(a+b−x) 配对的结构，用区间再现把两式相加，被积函数立刻变简单。',
    definition:
      '定积分换元与不定积分同理，但上下限要随之变换；换元后直接在新变量下计算，不必换回原变量。区间再现指利用对称区间把困难积分转化。',
    whenToUse: [
      '被积函数含 √(a²−x²)、1/(a²+x²) 这类结构',
      '积分区间关于原点对称',
      '式子形如 x·f(sin x) 而 f 本身好处理',
    ],
    theorems: [
      {
        name: '定积分换元',
        statement: '换元后积分限换成新变量的取值，被积式与微分同步替换，值保持不变。',
        formula: '\\int_{a}^{b}f(g(x))g^{\\prime}(x)dx=\\int_{g(a)}^{g(b)}f(u)\\,du',
      },
      {
        name: '对称区间性质',
        statement: '对称区间上奇函数的积分为零，偶函数等于两倍的正半区间积分。',
        formula: '\\int_{-a}^{a}f=\\begin{cases}2\\int_{0}^{a}f,&f\\text{ even}\\\\0,&f\\text{ odd}\\end{cases}',
      },
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
    pitfalls: [
      '换元后限没换：最常见错误，结果会整体偏移。',
      '奇偶判断错：要先确认区间关于原点对称。',
      '上下限颠倒忘补负号：交换限要变号。',
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
    },    moreExamples: [
      {
        problem: '计算对称区间上 x 立方的定积分，区间为负一到一。',
        walkthrough: [
          '区间关于原点对称。',
          '被积函数是奇函数。',
          '积分为零。',
        ],
        result: '0',
      },
    ],

  },
  {
    id: 'eigen-diagonalization',
    title: '特征值与相似对角化',
    tag: '线代',
    level: '进阶',
    essence:
      '特征值解 |λE−A| = 0，特征向量解 (λE−A)x = 0；凑够 n 个线性无关的特征向量，A 就能写成 PΛP⁻¹，幂运算随之变简单。',
    definition:
      '矩阵可对角化，指存在可逆矩阵使其相似于对角矩阵。判据是有 n 个线性无关的特征向量，实对称矩阵一定满足。',
    whenToUse: [
      '求矩阵的特征值与特征向量',
      '判断矩阵能否相似对角化',
      '求 A 的高次幂或矩阵函数',
    ],
    theorems: [
      {
        name: '可对角化判据',
        statement: 'n 阶矩阵可对角化当且仅当每个特征值的几何重数等于代数重数。',
        formula: 'A\\sim\\Lambda',
      },
      {
        name: '实对称矩阵',
        statement: '实对称矩阵必可正交对角化，特征向量可取得两两正交。',
      },
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
    pitfalls: [
      '重根直接判可对角化：要看特征向量个数。',
      '特征向量不独立：凑够 n 个独立向量才行。',
      '把相似当相等：对角化是相似变换。',
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
    },    moreExamples: [
      {
        problem: '二、一、一、二 是否可对角化。',
        walkthrough: [
          '两个特征值不同。',
          '不同特征值的特征向量线性无关。',
          '因此可对角化。',
        ],
        result: '\\text{yes}',
      },
    ],

  },
  {
    id: 'function-of-rv',
    title: '随机变量函数的分布',
    tag: '概率',
    level: '进阶',
    essence:
      '求 Y = g(X) 的分布，先写 F_Y(y) = P(g(X) ≤ y)，把事件翻译成 X 的区间，最后求导得密度——不要一上来就套公式。',
    definition:
      '随机变量的函数仍是随机变量。求它的分布用分布函数法或密度变换公式，注意变换要单调可逆。',
    whenToUse: [
      '已知 X 的密度，求 Y = g(X) 的密度',
      'g 不单调，例如 Y = X²',
      '二维随机变量求和、取最大值的分布',
    ],
    theorems: [
      {
        name: '分布函数法',
        statement: '先写新变量的分布函数，再对自变量求导得密度。',
        formula: 'F_Y(y)=P(g(X)\\le y)',
      },
      {
        name: '密度变换',
        statement: '单调可逆变换下，新密度等于旧密度代入反函数乘以反函数导数的绝对值。',
        formula: 'f_Y(y)=f_X(g^{-1}(y))\\left|\\frac{d}{dy}g^{-1}(y)\\right|',
      },
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
    pitfalls: [
      '忘记绝对值：导数可能为负。',
      '非单调变换硬套：要分段处理。',
      '取值范围没定：新变量的支撑要写清。',
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
    },    moreExamples: [
      {
        problem: '均匀分布取平方后的密度，自变量为正。',
        walkthrough: [
          '分布函数法写出小于等于 y 的概率。',
          '求导。',
          '密度为二根号 y 分之一。',
        ],
        result: '\\frac{1}{2\\sqrt{y}}',
      },
    ],

  },
  {
    id: 'inequality-proof',
    title: '不等式证明：三条主线',
    tag: '不等式',
    level: '竞赛',
    essence:
      '证不等式只有三条主线：移项求导看单调、用中值定理把差值换成导数、或者直接求最值；选哪条看式子里有没有 f(b)−f(a)。',
    definition:
      '不等式证明有三条主线：作差构造函数用单调性、用中值定理把差值换成导数、用经典不等式（均值、柯西、琴生）放缩。',
    whenToUse: [
      '题目要求「证明 f(x) ≥ g(x)」',
      '式子里出现 f(b) − f(a) 或 b − a',
      '含积分、级数的不等式估计',
    ],
    theorems: [
      {
        name: '单调性法',
        statement: '把不等式移项成函数大于零，证明函数单调且端点值为零。',
      },
      {
        name: '琴生不等式',
        statement: '凸函数的函数值不超过割线，给出平均值与函数值的不等关系。',
        formula: 'f(\\sum\\lambda_i x_i)\\le\\sum\\lambda_i f(x_i)',
      },
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
    pitfalls: [
      '只验端点不验单调：区间内可能先减后增。',
      '放缩方向反：证明上界要放大，下界要缩小。',
      '等号条件忽略：要说明取等的情形。',
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
    },    moreExamples: [
      {
        problem: '证明自变量大于零时指数大于一加自变量。',
        walkthrough: [
          '构造函数为指数减一减自变量。',
          '导数在零处为零且递增。',
          '因此函数大于零。',
        ],
        result: 'e^{x}>1+x',
      },
    ],

  },
  {
    id: 'series-sum',
    title: '级数求和：先裂项，再幂级数',
    tag: '级数',
    level: '竞赛',
    essence:
      '求和先看能不能裂成 telescoping，部分和会只剩首尾几项；裂不动就走幂级数，在收敛区间内逐项求导或积分把系数化掉。',
    definition:
      '级数求和指求部分和数列的极限。常用手法是裂项相消、等比公式、幂级数逐项积分或求导。',
    whenToUse: [
      '求 Σ 1/(n(n+1)) 这类分式级数',
      '求含 x 的幂级数和函数',
      '已知 Σxⁿ 想推出带 n 系数的和',
    ],
    theorems: [
      {
        name: '等比级数',
        statement: '公比绝对值小于一时级数收敛，和为第一项除以一减公比。',
        formula: '\\sum_{n=0}^{\\infty}q^{n}=\\frac{1}{1-q}',
      },
      {
        name: '裂项相消',
        statement: '通项拆成相邻两项之差时，部分和只剩首尾少数项。',
      },
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
    pitfalls: [
      '公比判断错：公比绝对值不小于一时不能套求和公式。',
      '裂项后没对齐下标：首尾项容易漏。',
      '幂级数求和忘收敛域：求和只在收敛区间内成立。',
    ],
    example: {
      problem: '求幂级数 Σₙ≥₁ n xⁿ⁻¹ 的和函数（|x| < 1），并求 Σ n/2ⁿ⁻¹。',
      walkthrough: [
        '由几何级数 Σ xⁿ = 1/(1−x)，收敛半径 R = 1。',
        '在收敛区间内逐项求导：Σ n xⁿ⁻¹ = 1/(1−x)²。',
        '代入 x = 1/2 得 Σ n/2ⁿ⁻¹ = 1/(1/2)² = 4。',
      ],
      result: '\\sum_{n=1}^{\\infty}nx^{n-1}=\\frac{1}{(1-x)^{2}}',
    },    moreExamples: [
      {
        problem: '求二分之一的 n 次方从一到无穷的和。',
        walkthrough: [
          '这是等比级数。',
          '首项与公比都是二分之一。',
          '代入求和公式。',
        ],
        result: '1',
      },
    ],

  },
  {
    id: 'multivar-differentiability',
    title: '多元可微：偏导存在还不够',
    tag: '多元',
    level: '进阶',
    essence:
      '偏导存在推不出可微；判可微要用定义式看 Δz 减去全微分后是不是比 ρ 高阶，而「偏导连续」只是充分条件。',
    definition:
      '二元函数在一点可微，指函数增量能写成两个偏导乘自变量增量之和，再加一个比增量长度高阶的无穷小。偏导存在只是必要条件，可微更强：它要求函数在该点能被一个平面近似。',
    whenToUse: [
      '判断分段函数在原点是否可微',
      '区分连续、偏导存在、可微、偏导连续四者',
      '选择题里给一个分段函数让你判断',
    ],
    theorems: [
      {
        name: '可微的充分条件',
        statement: '若两个偏导在一点的某邻域内存在且在该点连续，则函数在该点可微。',
      },
      {
        name: '偏导存在但不可微的反例',
        statement: '分段函数在原点处两个偏导都存在，但沿某些方向的差商极限不同，因此不可微。',
      },
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
      {
        title: '沿不同直线逼近',
        body: '判断不可微常沿不同直线趋近，极限不同即可下结论。',
      },
    ],
    pitfalls: [
      '把偏导存在当可微：这是最典型的错误，多元情形比一元复杂。',
      '只沿着坐标轴验证：可微要求在任意方向都成立。',
      '忽略连续：可微必连续，连续不一定可微，判断顺序不能反。',
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
    },    moreExamples: [
      {
        problem: '判断分段函数在原点处是否可微，该函数在原点取零，其他点取 xy 除以根号下 x 平方加 y 平方。',
        walkthrough: [
          '两个偏导在原点都等于零。',
          '考察差商是否比增量长度高阶。',
          '沿不同方向取极限，结果不同。',
          '因此不可微。',
        ],
        result: '\\text{not differentiable}',
      },
    ],

  },
  {
    id: 'linear-system',
    title: '线性方程组：先判解再求通解',
    tag: '线代',
    level: '基础',
    essence:
      '先比 r(A) 与 r(A|b) 定有没有解，再用 n − r(A) 定自由变量个数；非齐次通解 = 一个特解 + 齐次的基础解系。',
    definition:
      '线性方程组的解集由系数矩阵的秩与增广矩阵的秩决定：秩不等无解，秩等于未知数个数有唯一解，秩更小则有无穷多解。',
    whenToUse: [
      '讨论含参数方程组何时有解',
      '求方程组通解',
      '判断解唯一还是无穷多',
    ],
    theorems: [
      {
        name: '有解判据',
        statement: '方程组有解当且仅当系数矩阵与增广矩阵的秩相等。',
        formula: 'r(A)=r(A|b)',
      },
      {
        name: '解的结构',
        statement: '非齐次方程的通解等于一个特解加上对应齐次方程的通解。',
      },
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
    pitfalls: [
      '只算系数矩阵秩：要同时比较增广矩阵。',
      '无穷解时忘记参数：基础解系要写全。',
      '特解与通解混淆：通解必须带任意常数。',
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
    },    moreExamples: [
      {
        problem: '判断两行相同但右端不同的方程组有解吗。',
        walkthrough: [
          '系数矩阵秩为一。',
          '增广矩阵秩为二。',
          '两者不等，无解。',
        ],
        result: '\\text{none}',
      },
    ],

  },
  {
    id: 'power-series-domain',
    title: '幂级数：收敛半径与收敛域',
    tag: '级数',
    level: '进阶',
    essence:
      '先求收敛半径拿到开区间，再把两个端点代回去当数项级数单独判——半径只给一半答案，端点才是丢分点。',
    definition:
      '幂级数在某个区间内绝对收敛、在外发散，这个区间的半长叫收敛半径。端点要单独代入判断，不能直接由半径决定。',
    whenToUse: [
      '求幂级数的收敛半径与收敛域',
      '判断端点是否收敛',
      '求导或积分后重新确定收敛域',
    ],
    theorems: [
      {
        name: '比值法求半径',
        statement: '相邻系数之比的极限的倒数就是收敛半径。',
        formula: 'R=\\lim\\left|\\frac{a_{n}}{a_{n+1}}\\right|',
      },
      {
        name: '逐项运算',
        statement: '在收敛区间内，幂级数可以逐项求导与逐项积分，收敛半径不变。',
      },
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
    pitfalls: [
      '端点不判：半径端点可能收敛也可能发散，必须代入原级数。',
      '半径与区间混淆：半径是长度的一半，不是区间端点。',
      '条件收敛当绝对收敛：端点处要说明收敛类型。',
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
    },    moreExamples: [
      {
        problem: '求 x 的 n 次方除以 n 的幂级数收敛域。',
        walkthrough: [
          '比值法得收敛半径一。',
          '端点一：调和级数发散。',
          '端点负一：交错调和级数收敛。',
          '收敛域为左闭右开。',
        ],
        result: '[-1,\\,1)',
      },
    ],

  },
  {
    id: 'second-order-ode',
    title: '二阶常系数方程：看特征根',
    tag: '微分方程',
    level: '基础',
    essence:
      '把 y″ + py′ + qy = 0 换成特征方程 r² + pr + q = 0，三种根型对应三种通解；非齐次再按右端形式设特解。',
    definition:
      '二阶常系数线性方程由特征方程决定解的形状：两个不同实根、重根、共轭复根三种情形对应三类通解。',
    whenToUse: [
      '解二阶常系数齐次方程',
      '求非齐次方程的通解',
      '带初值的定解问题',
    ],
    theorems: [
      {
        name: '特征根情形',
        statement: '两个不同实根给两个指数解，重根要给一项乘自变量的指数解，复根给正弦余弦。',
        formula: 'r^{2}+pr+q=0',
      },
      {
        name: '非齐次特解',
        statement: '非齐次方程的通解等于齐次通解加一个特解，特解形式按右端项类型设定。',
      },
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
    pitfalls: [
      '重根漏乘自变量：重根时第二个解要乘 x。',
      '复根符号错：实部取负号，虚部只取虚数部分。',
      '非齐次特解形式猜错：右端是多项式时特解也要设同次多项式。',
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
    },    moreExamples: [
      {
        problem: '求二阶导减函数等于零的通解。',
        walkthrough: [
          '特征方程为平方减一等于零。',
          '特征根为正负一。',
          '通解为两个指数解的组合。',
        ],
        result: 'y=C_{1}e^{x}+C_{2}e^{-x}',
      },
    ],

  },
  {
    id: 'line-plane-angle',
    title: '空间直线与平面：夹角与距离',
    tag: '空间几何',
    level: '基础',
    essence:
      '直线靠一个点加方向向量，平面靠一个点加法向量；所有夹角、距离问题都是在这两个向量之间做点积和叉积。',
    definition:
      '空间直线与平面的夹角由直线的方向向量与平面法向量决定：夹角的正弦等于方向向量与法向量夹角的余弦绝对值。',
    whenToUse: [
      '求直线与平面的夹角',
      '求两直线或两平面的夹角',
      '求点到直线的距离',
    ],
    theorems: [
      {
        name: '线面角',
        statement: '直线与平面夹角的正弦等于方向向量与法向量内积的绝对值除以模长乘积。',
        formula: '\\sin\\theta=\\frac{|\\vec s\\cdot\\vec n|}{|\\vec s||\\vec n|}',
      },
      {
        name: '线线角',
        statement: '两条直线的夹角由两个方向向量的内积给出，取锐角。',
      },
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
    pitfalls: [
      '把线面角当线线角：线面角用正弦而不是余弦。',
      '忘记取绝对值：夹角取锐角。',
      '法向量与方向向量混用：平面用做法向量。',
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
    },    moreExamples: [
      {
        problem: '求方向向量为一、零、零的直线与法向量为零、一、零的平面的夹角。',
        walkthrough: [
          '两个向量内积为零。',
          '正弦为零。',
          '夹角为零，直线平行于平面。',
        ],
        result: '0',
      },
    ],

  },
  {
    id: 'classic-inequalities',
    title: '三个经典不等式：均值、柯西、琴生',
    tag: '不等式',
    level: '竞赛',
    essence:
      '均值管「和与积」，柯西管「平方和与内积」，琴生管「凸函数的平均」；竞赛里的不等式题九成是这三个的变形。',
    definition:
      '三个经典不等式：均值不等式、柯西不等式、琴生不等式。它们分别刻画算术与几何平均、内积与模、凸性与期望。',
    whenToUse: [
      '证明含 a+b 与 ab 的不等式',
      '证明平方和与乘积的不等式',
      '证明对称的多元不等式',
    ],
    theorems: [
      {
        name: '均值不等式',
        statement: '非负数的算术平均不小于几何平均，等号当且仅当各数相等。',
        formula: '\\frac{a+b}{2}\\ge\\sqrt{ab}',
      },
      {
        name: '柯西不等式',
        statement: '内积的平方不超过两个模平方之积。',
        formula: '(\\sum a_ib_i)^{2}\\le(\\sum a_i^{2})(\\sum b_i^{2})',
      },
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
    pitfalls: [
      '忽略非负条件：均值不等式要求各数非负。',
      '柯西取等条件写错：两组数成比例。',
      '方向用反：不等号方向由大小关系决定。',
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
    },    moreExamples: [
      {
        problem: '用均值不等式求自变量加倒数的最小值，自变量为正。',
        walkthrough: [
          '两项都是正数。',
          '算术平均不小于几何平均。',
          '几何平均为一。',
        ],
        result: '2',
      },
    ],

  },
  {
    id: 'integral-applications',
    title: '定积分的几何应用',
    tag: '积分',
    level: '基础',
    essence:
      '面积、体积、弧长都是「写微元再累加」：先想清楚一片微元是什么形状，再定上下限积分。',
    definition:
      '定积分用来算面积、体积等几何量。方法是把区域切成微元，写出微元的表达式，再沿区间累加。',
    whenToUse: [
      '求曲边梯形的面积',
      '求旋转体的体积',
      '求平面曲线的弧长',
    ],
    theorems: [
      {
        name: '面积公式',
        statement: '两曲线之间的面积等于上函数减下函数在区间上的积分。',
        formula: 'S=\\int_{a}^{b}(f-g)\\,dx',
      },
      {
        name: '旋转体体积',
        statement: '绕 x 轴旋转的体积等于截面圆面积沿区间的积分。',
        formula: 'V=\\pi\\int_{a}^{b}y^{2}\\,dx',
      },
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
    pitfalls: [
      '上下函数写反：被积式变成负的，面积要取绝对值。',
      '交点没求：积分区间应由两曲线交点确定。',
      '旋转轴看错：绕 y 轴时公式换成对 x 的积分形式。',
    ],
    example: {
      problem: '求 y = x² 在 [0,1] 上绕 x 轴旋转所得旋转体的体积。',
      walkthrough: [
        '用圆盘法：微元半径是 x²，面积是 πx⁴。',
        '在 [0,1] 上积分：V = π∫₀¹ x⁴ dx。',
        '原函数是 x⁵/5，代入上下限得 π/5。',
      ],
      result: 'V=\\frac{\\pi}{5}',
    },    moreExamples: [
      {
        problem: '求直线与抛物线在零到一之间围成的面积。',
        walkthrough: [
          '区间内直线在抛物线上方。',
          '被积式是两者之差。',
          '积分得六分之一。',
        ],
        result: '\\frac{1}{6}',
      },
    ],

  },
  {
    id: 'lagrange-cauchy',
    title: '拉格朗日与柯西：把差值换成导数',
    tag: '中值定理',
    level: '进阶',
    essence:
      '罗尔定理是最底层那根钉子；拉格朗日把函值之差换成导数乘区间长，柯西把两个函数的增量比换成导数比。',
    definition:
      '拉格朗日中值定理说连续可导函数在区间内某点导数等于两端函数值之差除以区间长度；柯西中值定理把它推广到两个函数之比。',
    whenToUse: [
      '出现 f(b) − f(a) 与 b − a',
      '要估计函数值之差的上界',
      '两个函数同时出现且要求比值',
    ],
    theorems: [
      {
        name: '拉格朗日中值定理',
        statement: '闭区间连续、开区间可导时，存在一点导数等于割线斜率。',
        formula: 'f(b)-f(a)=f^{\\prime}(\\xi)(b-a)',
      },
      {
        name: '柯西中值定理',
        statement: '两个函数满足条件且分母导数不为零时，存在一点使两导数之比等于两端增量之比。',
        formula: '\\frac{f(b)-f(a)}{g(b)-g(a)}=\\frac{f^{\\prime}(\\xi)}{g^{\\prime}(\\xi)}',
      },
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
    pitfalls: [
      '区间开闭混淆：连续在闭区间、可导在开区间。',
      '把中值点当唯一：定理只保证存在。',
      '柯西定理漏验分母导数：分母导数为零时不能除。',
    ],
    example: {
      problem: '证明对任意实数 a、b，都有 |arctan a − arctan b| ≤ |a − b|。',
      walkthrough: [
        '设 f(x) = arctan x，在 a、b 之间用拉格朗日中值定理。',
        '存在 ξ 使 arctan a − arctan b = (a − b)/(1 + ξ²)。',
        '因为 1/(1 + ξ²) ≤ 1，两边取绝对值即得。',
      ],
      result: '|\\arctan a-\\arctan b|\\le|a-b|',
    },    moreExamples: [
      {
        problem: '用拉格朗日定理估计正弦函数在零点附近的值与自变量之差。',
        walkthrough: [
          '割线斜率等于某点余弦。',
          '余弦绝对值不超过一。',
          '因此差值不超过区间长度。',
        ],
        result: '|\\sin x|\\le|x|',
      },
    ],

  },
  {
    id: 'reducible-ode',
    title: '可降阶方程与欧拉方程',
    tag: '微分方程',
    level: '进阶',
    essence:
      '缺 y 的令 y′ = p(x)，缺 x 的令 y′ = p(y)；欧拉方程用 x = eᵗ 换成常系数，本质都是「换元降阶」。',
    definition:
      '可降阶方程指通过换元把高阶降为一阶：缺因变量的令导数为新变量，缺自变量的把导数看成未知函数。',
    whenToUse: [
      '方程里不显含 y 或不显含 x',
      '形如 x²y″ + pxy′ + qy = 0 的欧拉方程',
      '高阶但可以逐步降阶的方程',
    ],
    theorems: [
      {
        name: '缺因变量',
        statement: '方程不含未知函数时，令一阶导数为新变量，阶数降低一阶。',
        formula: 'y^{\\prime\\prime}=f(x,y^{\\prime})\\;\\Rightarrow\\;p=y^{\\prime}',
      },
      {
        name: '欧拉方程',
        statement: '变系数方程可通过自变量代换化为常系数。',
      },
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
    pitfalls: [
      '换元后变量没统一：新变量与旧变量混用。',
      '降阶后忘记回代：求出新变量要积回原函数。',
      '欧拉方程代换漏因子：自变量代换会带来额外系数。',
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
    },    moreExamples: [
      {
        problem: '解二阶导等于六倍自变量的方程。',
        walkthrough: [
          '右端只依赖自变量。',
          '连续积分两次。',
          '每次积分补一个常数。',
        ],
        result: 'y=x^{3}+C_{1}x+C_{2}',
      },
    ],

  },
  {
    id: 'vector-algebra',
    title: '向量代数：三种乘积各管什么',
    tag: '空间几何',
    level: '基础',
    essence:
      '数量积算夹角和投影，向量积算面积和法向量，混合积算体积和共面——空间几何题的第一步几乎都是在这三个里选一个。',
    definition:
      '向量有三种乘积：数量积给出数，向量积给出向量，混合积给出体积。它们的几何意义决定了各自用途。',
    whenToUse: [
      '求两向量夹角或一个向量在另一个上的投影',
      '求平面的法向量、三角形的面积',
      '判断三个向量是否共面、求平行六面体体积',
    ],
    theorems: [
      {
        name: '数量积与夹角',
        statement: '数量积等于模长乘积乘夹角余弦，可用于判断垂直。',
        formula: '\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta',
      },
      {
        name: '向量积的几何意义',
        statement: '向量积的模等于两向量张成的平行四边形面积，方向垂直于两者。',
        formula: '|\\vec a\\times\\vec b|=|\\vec a||\\vec b|\\sin\\theta',
      },
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
    pitfalls: [
      '把数量积当向量：数量积结果是数。',
      '混淆面积与体积：混合积才给体积。',
      '方向判错：向量积方向要按右手法则。',
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
    },    moreExamples: [
      {
        problem: '判断向量一、二、二与二、负一、零是否垂直。',
        walkthrough: [
          '算数量积。',
          '结果为零。',
          '因此垂直。',
        ],
        result: '0',
      },
    ],

  },
  {
    id: 'implicit-diff',
    title: '隐函数求导：两边求导再解出',
    tag: '多元',
    level: '基础',
    essence:
      '方程 F(x,y)=0 确定 y=y(x) 时，两边对 x 求导并把 y 当复合函数，再解出 y′；二元情形用 F 的偏导直接写。',
    definition:
      '方程确定隐函数时，两边同时对自变量求导，把未知导数当成整体解出，不必先解出显式函数。',
    whenToUse: [
      '方程没有解出 y，但要求 y′',
      '求曲面 z=z(x,y) 的偏导',
      '求隐函数的二阶导数',
    ],
    theorems: [
      {
        name: '隐函数求导',
        statement: '二元方程确定的隐函数，其导数等于两个偏导之比的相反数。',
        formula: 'y^{\\prime}=-\\frac{F_x}{F_y}',
      },
      {
        name: '隐函数存在定理',
        statement: '在一点偏导连续且对因变量的偏导不为零时，邻域内存在唯一的隐函数。',
      },
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
    pitfalls: [
      '忘记 y 是 x 的函数：对含 y 的项求导要乘 y 撇。',
      '解出后没化简：结果常可约分。',
      '偏导为零处硬用：要退回原始定义判断。',
    ],
    example: {
      problem: 'x² + y² = 1 确定 y = y(x)，求 y′。',
      walkthrough: [
        '两边对 x 求导：2x + 2y·y′ = 0。',
        '解出 y′ = −x/y。',
        '等价写法：F = x² + y² − 1，F_x = 2x，F_y = 2y，故 y′ = −F_x/F_y = −x/y。',
      ],
      result: 'y\'=-\\frac{x}{y}',
    },    moreExamples: [
      {
        problem: '求单位圆方程确定的隐函数导数。',
        walkthrough: [
          '两边对 x 求导。',
          '解出导数。',
          '结果为负 x 比 y。',
        ],
        result: '-\\frac{x}{y}',
      },
    ],

  },
  {
    id: 'directional-derivative',
    title: '方向导数与梯度',
    tag: '多元',
    level: '基础',
    essence:
      '梯度是函数增长最快的方向，方向导数是梯度在该方向单位向量上的投影；两者用点积一串就完了。',
    definition:
      '方向导数衡量函数沿某个方向的瞬时变化率，等于梯度与该方向单位向量的内积，因此梯度方向是增长最快的方向。',
    whenToUse: [
      '求函数在某点沿某方向的变化率',
      '求函数增长最快的方向',
      '解释梯度与等值线的关系',
    ],
    theorems: [
      {
        name: '方向导数公式',
        statement: '方向导数等于梯度与单位方向向量的内积。',
        formula: '\\frac{\\partial f}{\\partial l}=\\nabla f\\cdot\\vec e',
      },
      {
        name: '梯度方向',
        statement: '梯度方向是函数增长最快的方向，其模等于最大方向导数。',
      },
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
    pitfalls: [
      '方向没单位化：公式要求单位向量。',
      '把梯度当方向导数：梯度是向量，方向导数是数。',
      '在不可微点用：方向导数存在不代表可微。',
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
    },    moreExamples: [
      {
        problem: '求函数 x 平方乘 y 在点一、二沿方向三、四的方向导数。',
        walkthrough: [
          '梯度在点处为四、一。',
          '方向单位化为三五、四五。',
          '内积得五分之十六。',
        ],
        result: '\\frac{16}{5}',
      },
    ],

  },
  {
    id: 'numeric-characteristics',
    title: '数字特征：期望与方差',
    tag: '概率',
    level: '基础',
    essence:
      '期望是加权平均，方差是偏离程度的平方平均；记住 D(X)=E(X²)−[E(X)]² 和线性变换的两条性质，八成题就够了。',
    definition:
      '期望是随机变量的加权平均，方差是偏离期望的平方的平均。它们把分布压缩成两个数，但一般不唯一确定分布。',
    whenToUse: [
      '求随机变量的期望与方差',
      '已知分布求数字特征',
      '判断独立与不独立时的方差可加性',
    ],
    theorems: [
      {
        name: '期望的线性性',
        statement: '期望对和与常数倍线性，不需要独立性。',
        formula: 'E(aX+bY)=aE(X)+bE(Y)',
      },
      {
        name: '方差公式',
        statement: '方差等于平方的期望减期望的平方；独立时和的方差等于方差之和。',
        formula: 'D(X)=E(X^{2})-E(X)^{2}',
      },
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
      {
        title: '用量纲自检',
        body: '方差带平方量纲、期望与原变量同量纲，可快速自检结果。',
      },
    ],
    pitfalls: [
      '把线性性用到方差上：方差对和一般不线性，只有独立才可加。',
      '相关系数为零当成独立：它只排除线性关系。',
      '期望不存在的分布硬算：重尾分布的期望可能发散。',
    ],
    example: {
      problem: 'X 服从 B(10, 0.3)，求 E(X) 与 D(X)。',
      walkthrough: [
        '二项分布期望 E(X) = np = 10 × 0.3 = 3。',
        '方差 D(X) = np(1−p) = 10 × 0.3 × 0.7 = 2.1。',
        '也可用 E(X²) − [E(X)]² 验证：E(X²) = D + E² = 2.1 + 9 = 11.1。',
      ],
      result: 'E(X)=3,\\qquad D(X)=2.1',
    },    moreExamples: [
      {
        problem: '已知期望为二、方差为三，求二倍加一的期望与方差。',
        walkthrough: [
          '期望线性：二乘二加一等于五。',
          '方差乘系数平方：四乘三等于十二。',
          '常数不影响方差。',
        ],
        result: 'E=5,\\quad D=12',
      },
    ],

  },
  {
    id: 'linear-dependence',
    title: '向量组的线性相关性',
    tag: '线代',
    level: '基础',
    essence:
      '一组向量线性相关，等价于存在不全为零的系数让它们的线性组合为零，也等价于以它们为列的矩阵秩小于向量个数。',
    definition:
      '一组向量线性相关，指存在不全为零的系数使它们的线性组合为零；否则线性无关。判断时把它们按列排成矩阵看秩。',
    whenToUse: [
      '判断向量组线性相关还是无关',
      '求极大线性无关组与秩',
      '判断矩阵是否可逆（列向量是否无关）',
    ],
    theorems: [
      {
        name: '秩判据',
        statement: '向量组线性无关当且仅当矩阵的秩等于向量个数。',
        formula: 'r(\\alpha_1,\\dots,\\alpha_m)=m',
      },
      {
        name: '个数与维数',
        statement: 'n 维空间中任意多于 n 个向量必线性相关。',
      },
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
    pitfalls: [
      '只看个数：少于等于 n 个也可能相关。',
      '含零向量直接判无关：含零向量必相关。',
      '行列式条件用错：只对方阵适用。',
    ],
    example: {
      problem: '判断 α₁=(1,2)、α₂=(2,4) 是否线性相关。',
      walkthrough: [
        '显然 α₂ = 2α₁，存在不全为零的系数使 2α₁ − α₂ = 0。',
        '用行列式：两向量组成的矩阵行列式为 1×4 − 2×2 = 0。',
        '行列式为零，所以线性相关，秩为 1。',
      ],
      result: '\\begin{vmatrix}1&2\\\\2&4\\end{vmatrix}=0',
    },    moreExamples: [
      {
        problem: '判断三个二维向量一、零、零、一、一、一是否线性相关。',
        walkthrough: [
          '三个向量在二维空间中。',
          '个数超过维数。',
          '必线性相关。',
        ],
        result: '\\text{dependent}',
      },
    ],

  },
  {
    id: 'fourier-series',
    title: '傅里叶级数：系数怎么算',
    tag: '级数',
    level: '进阶',
    essence:
      '周期函数展开成三角级数，系数靠正交性积分求出；奇函数只剩正弦项，偶函数只剩余弦项，先看奇偶性能省一半计算。',
    definition:
      '周期函数可展开成三角级数，系数由函数与正弦余弦的内积给出。这是把周期信号分解成频率成分的工具。',
    whenToUse: [
      '把周期函数展开成傅里叶级数',
      '求傅里叶系数 aₙ、bₙ',
      '判断级数在某点的收敛值',
    ],
    theorems: [
      {
        name: '傅里叶系数',
        statement: '余弦与正弦系数分别是函数在一个周期上与对应三角函数的积分平均值。',
        formula: 'a_{n}=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}f(x)\\cos nx\\,dx',
      },
      {
        name: '狄利克雷条件',
        statement: '分段光滑的周期函数，其傅里叶级数在连续点收敛到函数值，在跳跃点收敛到左右极限平均。',
      },
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
    pitfalls: [
      '周期与区间不匹配：积分区间要覆盖一个完整周期。',
      '奇偶性没用：奇函数只含正弦项，可省一半计算。',
      '端点收敛值写错：跳跃点取左右极限平均。',
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
    },    moreExamples: [
      {
        problem: '求偶函数展开式中的正弦系数。',
        walkthrough: [
          '偶函数乘正弦是奇函数。',
          '对称区间积分为零。',
          '所有正弦系数为零。',
        ],
        result: 'b_{n}=0',
      },
    ],

  },
  {
    id: 'one-to-infinity',
    title: '1 的无穷次型：三步取对数',
    tag: '极限',
    level: '竞赛',
    essence:
      '底数趋于 1、指数趋于无穷时，直接算会得出「1」，必须取对数或改写成 (1+u)^{1/u} 的形式，答案通常是 e 的某个幂。',
    definition:
      '当底数趋于一、指数趋于无穷时，幂的极限是不确定的，称为一的无穷次型。标准做法是取对数，把幂变成乘积，再处理零乘无穷。',
    whenToUse: [
      '代入后底数 → 1、指数 → ∞',
      '式子形如 (1+f(x))^{g(x)}',
      'n 次方根、连乘的极限',
    ],
    theorems: [
      {
        name: '重要极限',
        statement: '调和底数的一的无穷次型收敛到自然常数。',
        formula: '\\lim\\left(1+\\frac{1}{n}\\right)^{n}=e',
      },
      {
        name: '通式',
        statement: '当底趋于一、指数趋于无穷时，可以直接用指数乘底减一的极限做指数。',
        formula: '\\lim f^{g}=e^{\\lim g(f-1)}',
      },
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
      {
        title: '底与指数分别看',
        body: '先确认底趋于一、指数趋于无穷，两个条件缺一不可。',
      },
    ],
    pitfalls: [
      '直接代成一：一加无穷小再取无穷次方并不等于一。',
      '底不趋于一时套用：底为其他常数时结论不同。',
      '取对数后忘了还原：对数结果是指数，别把答案写成对数值。',
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
    },    moreExamples: [
      {
        problem: '求一加 n 分之二的 n 次方的三倍极限。',
        walkthrough: [
          '先看一加 n 分之二的 n 次方，它趋于自然常数的平方。',
          '指数再乘三，就是自然常数的六次方。',
        ],
        result: 'e^{6}',
      },
    ],

  },
  {
    id: 'radical-difference',
    title: '根式差：有理化再算',
    tag: '极限',
    level: '竞赛',
    essence:
      '遇到 √A − √B 直接代会得到 0/0 或 ∞−∞，先乘共轭把根号差变成商，往往一步就能约掉因子。',
    definition:
      '根式差指两个根号之差的极限。常用手法是有理化：把差乘上共轭式，化成比值，再判断主导项。',
    whenToUse: [
      '式子含 √(a+x) − √a',
      '∞ − ∞ 型且出现根号',
      '分母也是根式差',
    ],
    theorems: [
      {
        name: '有理化恒等式',
        statement: '两根号之差等于被开方数之差除以两根号之和。',
        formula: '\\sqrt{A}-\\sqrt{B}=\\frac{A-B}{\\sqrt{A}+\\sqrt{B}}',
      },
      {
        name: '大数近似',
        statement: '当 x 很大时，根号下 x 方加 a 减去 x 约等于二 x 分之 a。',
        formula: '\\sqrt{x^{2}+a}-x\\sim\\frac{a}{2x}',
      },
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
      {
        title: '共轭式乘几次',
        body: '两个根号乘一次共轭即可，三个根号要分组两次。',
      },
    ],
    pitfalls: [
      '有理化后忘记化简：分子里能约掉的项没约，结果偏大。',
      '分母趋于无穷时符号判错：极限为零要说明是正的零。',
      '三个根号相加时仍用一次有理化：需要分组处理。',
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
    },    moreExamples: [
      {
        problem: '求根号下 n 方加 n 再减 n 的极限。',
        walkthrough: [
          '有理化得 n 除以两根号之和。',
          '分子分母同除以 n。',
          '分母趋于二。',
          '结果为二分之一。',
        ],
        result: '\\frac{1}{2}',
      },
    ],

  },
  {
    id: 'infinitesimal-order',
    title: '无穷小阶的比较',
    tag: '极限',
    level: '竞赛',
    essence:
      '两个无穷小之比的极限决定它们的阶：趋于 0 是高阶，趋于无穷是低阶，趋于非零常数是同阶，等于 1 才是等价。',
    definition:
      '两个无穷小之比的极限为零、非零常数或无穷时，分别称前者高阶、同阶、低阶；比值为一时称等价。这给出了比较无穷小快慢的统一标准。',
    whenToUse: [
      '题目问「是几阶无穷小」',
      '需要在多个无穷小之间排序',
      '泰勒展开后判断主导项',
    ],
    theorems: [
      {
        name: '阶的定义',
        statement: '若两个无穷小之比的 k 次幂极限为非零常数，则称前者是后者的 k 阶无穷小。',
        formula: '\\lim\\frac{\\alpha}{\\beta^{k}}=c\\ne 0',
      },
      {
        name: '泰勒与阶',
        statement: '函数在零点的展开式中第一个非零项的次数，就是它作为无穷小的阶。',
      },
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
      {
        title: '与泰勒对照',
        body: '展开式的第一非零项阶数就是无穷小阶数，两者互为检验。',
      },
    ],
    pitfalls: [
      '只看首项：系数与符号被忽略后阶数判错。',
      '混淆同阶与等价：同阶只要求比值是非零常数。',
      '忽略变量趋于哪个点：阶是相对于某个极限过程说的。',
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
    },    moreExamples: [
      {
        problem: '判断一减余弦在零点附近是几阶无穷小。',
        walkthrough: [
          '把余弦展开到二阶。',
          '一减余弦约等于二分之 x 平方。',
          '因此它是二阶无穷小。',
        ],
        result: '\\frac{x^{2}}{2}',
      },
    ],

  },
  {
    id: 'double-integral-symmetry',
    title: '二重积分：先用对称性砍一半',
    tag: '多元',
    level: '进阶',
    essence:
      '区域关于坐标轴对称时，被积函数对相应变量是奇函数就直接得 0，是偶函数就翻倍——先看对称性能省掉大半计算。',
    definition:
      '若积分区域关于坐标轴对称，而被积函数关于对应变量是奇函数，则积分为零；偶函数则可化为两倍的一半区域积分。',
    whenToUse: [
      '积分区域是圆、椭圆、正方形等对称图形',
      '被积函数含 x 或 y 的奇次幂',
      '被积函数关于 x、y 可交换',
    ],
    theorems: [
      {
        name: '奇偶对称',
        statement: '区域关于 y 轴对称时，被积函数对 x 为奇函数则积分为零。',
        formula: '\\iint_{D}f\\,d\\sigma=0\\quad(f(-x,y)=-f(x,y))',
      },
      {
        name: '轮换对称',
        statement: '区域关于直线 y 等于 x 对称时，交换被积函数的两个变量积分值不变。',
      },
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
      {
        title: '先验区域对称',
        body: '对称性要区域与函数同时满足，缺一不可。',
      },
    ],
    pitfalls: [
      '区域不对称就用：对称性前提是区域也对称。',
      '奇偶判错：要针对被积函数与对应变量。',
      '忘记乘二：偶函数化半区域时漏掉两倍。',
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
    },    moreExamples: [
      {
        problem: '求 x 乘 y 在关于原点对称的单位圆盘上的二重积分。',
        walkthrough: [
          '被积函数关于 x 是奇函数。',
          '区域关于 y 轴对称。',
          '积分为零。',
        ],
        result: '0',
      },
    ],

  },
  {
    id: 'integral-estimate',
    title: '定积分不等式：放缩估界',
    tag: '积分',
    level: '竞赛',
    essence:
      '估界不用算出原函数：用被积函数的最值、单调性或柯西–施瓦茨，把积分夹在两个数之间即可。',
    definition:
      '定积分不等式通过放缩被积函数来估计积分值，是证明题与近似计算的常用手段。',
    whenToUse: [
      '题目要求「估计积分的值」或「证明不等式」',
      '被积函数没有初等原函数',
      '积分区间与函数单调性已知',
    ],
    theorems: [
      {
        name: '保号性',
        statement: '被积函数非负则积分非负；被积函数在两函数之间则积分也在对应区间内。',
        formula: 'f\\le g\\;\\Rightarrow\\;\\int f\\le\\int g',
      },
      {
        name: '积分中值定理',
        statement: '连续函数在区间上的积分等于某点函数值乘区间长度。',
        formula: '\\int_{a}^{b}f=f(\\xi)(b-a)',
      },
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
      {
        title: '估算代替硬算',
        body: '证明题里常常只需给上下界，不必算精确值。',
      },
    ],
    pitfalls: [
      '放缩方向反：要证明上界就放大被积函数，别缩。',
      '忽略单调性：放缩时用了函数在区间的最大值或最小值要说明。',
      '等式条件忘写：中值定理要说明函数连续。',
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
    },    moreExamples: [
      {
        problem: '估计正弦函数在零到二分之圆周率上的积分范围。',
        walkthrough: [
          '正弦在该区间上介于零与一之间。',
          '积分介于零与区间长度之间。',
          '实际值为一。',
        ],
        result: '1',
      },
    ],

  },
  {
    id: 'trig-identity',
    title: '三角恒等变换：三组公式够用',
    tag: '三角学',
    level: '基础',
    essence:
      '和差角、倍角、辅助角三组公式串起来就能覆盖九成题；看到 a sin x + b cos x 的第一反应应该是辅助角。',
    definition:
      '三角恒等式是把同角或相关角的三角函数联系起来的等式，最基础的是平方和等于一与商数关系。',
    whenToUse: [
      '化简三角表达式',
      '求 a sin x + b cos x 的最值',
      '证明三角恒等式',
    ],
    theorems: [
      { name: '平方和恒等式', statement: '同角正弦平方加余弦平方等于一。', formula: '\\sin^{2}x+\\cos^{2}x=1' },
      { name: '和角公式', statement: '正弦与余弦的和角可展开为两项之和。', formula: '\\sin(a+b)=\\sin a\\cos b+\\cos a\\sin b' },
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
    pitfalls: ['忽略象限：开方或反三角要给符号。', '角度与弧度混用：公式默认弧度。', '恒等式方向搞反：化简与证明目标不同。'],
    example: {
      problem: '化简 sin x + √3 cos x。',
      walkthrough: [
        '系数 a = 1，b = √3，幅值为 √(1+3) = 2。',
        '相位满足 cos φ = 1/2、sin φ = √3/2，即 φ = π/3。',
        '所以原式 = 2 sin(x + π/3)。',
        '由此可知最大值 2、最小值 −2。',
      ],
      result: '\\sin x+\\sqrt{3}\\cos x=2\\sin\\left(x+\\frac{\\pi}{3}\\right)',
    },    moreExamples: [{ problem: '用和角公式求 75 度的正弦。', walkthrough: ['拆成 45 度加 30 度。', '套和角公式。'], result: '四项之和' }],

  },
  {
    id: 'euclidean-geometry',
    title: '平面几何：相似与圆幂',
    tag: '欧氏几何',
    level: '基础',
    essence:
      '平面几何题先找相似（角相等或边成比例），圆里的题则靠相交弦、切割线、弦切角三组定理把线段关系变成乘积。',
    definition:
      '欧氏几何是建立在五条公设上的几何体系，其中平行公设决定了平面几何的基本性质。',
    whenToUse: [
      '证明线段成比例或乘积相等',
      '圆内两条弦相交求长度',
      '求切线与割线的关系',
    ],
    theorems: [
      { name: '勾股定理', statement: '直角三角形斜边平方等于两直角边平方之和。', formula: 'a^{2}+b^{2}=c^{2}' },
      { name: '内角和', statement: '平面三角形内角和为 180 度。', },
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
    pitfalls: ['循环论证：用结论证明前提。', '辅助线无依据：要说明可作性。', '相似比例对应错边：先找对应角。'],
    example: {
      problem: '圆内两弦 AB、CD 交于 P，PA = 2，PB = 6，PC = 3，求 PD。',
      walkthrough: [
        '由相交弦定理：PA · PB = PC · PD。',
        '代入：2 × 6 = 3 × PD。',
        '解得 PD = 4。',
      ],
      result: 'PA\\cdot PB=PC\\cdot PD=12',
    },    moreExamples: [{ problem: '证明等腰三角形两底角相等。', walkthrough: ['作底边中线。', '用全等三角形。'], result: '底角相等' }],

  },
  {
    id: 'group-theory',
    title: '群论入门：先看阶',
    tag: '代数',
    level: '进阶',
    essence:
      '群是「集合 + 运算 + 四条公理」；入门题几乎都在算元素的阶、找子群，然后用拉格朗日定理卡住可能的大小。',
    definition:
      '群是集合配上一个满足封闭、结合、单位元与逆元四条的二元运算。群的阶是元素个数。',
    whenToUse: [
      '判断一个集合配运算是否构成群',
      '求元素的阶、找子群',
      '用拉格朗日定理排除不可能的子群大小',
    ],
    theorems: [
      { name: '拉格朗日定理', statement: '有限群中子群的阶整除群的阶。', formula: '|H|\\mid|G|' },
      { name: '第一同构定理', statement: '商群同构于同态的像。', formula: 'G/\\ker\\varphi\\cong\\operatorname{Im}\\varphi' },
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
    pitfalls: ['不验封闭：运算可能跑出集合。', '把交换律当必需：非交换群大量存在。', '混淆元素阶与群阶：前者是元素回到单位元的最小次数。'],
    example: {
      problem: '在加法群 Z₆ 中，求元素 2 的阶。',
      walkthrough: [
        'Z₆ 的单位元是 0，运算为模 6 加法。',
        '2×1 = 2，2×2 = 4，2×3 = 6 ≡ 0。',
        '最小的正整数是 3，所以阶为 3。',
        '由拉格朗日定理，3 必须整除 6，成立。',
      ],
      result: '\\mathrm{ord}(2)=3',
    },    moreExamples: [{ problem: '模六加法群有哪些子群阶？', walkthrough: ['群阶为六。', '子群阶只可能是 1、2、3、6。'], result: '1、2、3、6' }],

  },
  {
    id: 'topology-intro',
    title: '拓扑学入门：只看开集',
    tag: '拓扑',
    level: '进阶',
    essence:
      '拓扑只关心「哪些子集算开集」；连续是开集的原像仍开，同胚是双向连续的双射——距离、角度全不重要。',
    definition:
      '拓扑空间是集合配上一族开集，满足空集与全集开、任意并开、有限交开。连续映射指开集的原像开。',
    whenToUse: [
      '判断映射是否连续',
      '判断两个空间是否同胚',
      '理解连通、紧致这类不变量',
    ],
    theorems: [
      { name: '连续等价开集原像', statement: '映射连续当且仅当每个开集的原像是开集。', formula: 'f^{-1}(U)\\text{ open}' },
      { name: '同胚', statement: '双射且双向连续称同胚，拓扑性质在同胚下不变。', },
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
    pitfalls: ['把开集当欧氏开区间：拓扑可以很粗。', '连续只看点列：一般拓扑空间没有度量。', '同胚与同伦混淆：一个是等价，一个是形变。'],
    example: {
      problem: '证明开区间 (0,1) 与实数轴 ℝ 同胚。',
      walkthrough: [
        '取 f(x) = tan(π(x − 1/2))，它把 (0,1) 映到 ℝ。',
        'f 连续且严格递增，反函数 arctan 也连续。',
        '所以 f 是双射且双向连续，两者同胚。',
        '这说明长度、有界性都不是拓扑性质。',
      ],
      result: '(0,1)\\cong\\mathbb{R}',
    },    moreExamples: [{ problem: '实数轴上的开区间族能定义拓扑吗？', walkthrough: ['任意并与有限交仍是开区间并。', '满足三条公理。'], result: '可以' }],

  },
  {
    id: 'stochastic-process',
    title: '随机过程入门：马尔可夫与泊松',
    tag: '概率',
    level: '进阶',
    essence:
      '随机过程是一族随机变量；入门只要抓住两条：离散状态看马尔可夫链的转移矩阵，计数事件看泊松过程。',
    definition:
      '随机过程是一族随机变量，按时间索引。马尔可夫性指未来只依赖现在、与过去无关；泊松过程计数事件发生次数。',
    whenToUse: [
      '求马尔可夫链的平稳分布',
      '计算泊松过程在时间段内的事件数',
      '判断过程是否具有无记忆性',
    ],
    theorems: [
      {
        name: '马尔可夫性',
        statement: '给定现在的状态，未来与过去条件独立。',
        formula: 'P(X_{n+1}\\mid X_n,\\dots,X_0)=P(X_{n+1}\\mid X_n)',
      },
      {
        name: '泊松过程',
        statement: '强度为 λ 的泊松过程，时间 t 内事件数期望为 λt。',
        formula: 'E N(t)=\\lambda t',
      },
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
    pitfalls: [
      '把马尔可夫性当独立：未来仍依赖现在。',
      '泊松强度与概率混：强度是单位时间期望次数。',
      '忽略平稳性假设：泊松过程要求增量独立平稳。',
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
    },    moreExamples: [
      {
        problem: '强度为二的泊松过程，时间二内的期望事件数。',
        walkthrough: [
          '期望等于强度乘时间。',
          '二乘二。',
        ],
        result: '4',
      },
    ],

  },
  {
    id: 'set-cardinality',
    title: '集合论：用双射比大小',
    tag: '集合论',
    level: '基础',
    essence:
      '比较两个无限集合的大小，不比元素个数，比能不能一一配对（双射）；配不上的一方更大。',
    definition:
      '两个集合等势指存在双射。基数衡量集合大小，有限集的基数就是元素个数。',
    whenToUse: [
      '判断一个集合是可数还是不可数',
      '证明两个无限集合等势',
      '理解「无限也有大小之分」',
    ],
    theorems: [
      { name: '康托尔定理', statement: '幂集的基数严格大于原集合。', formula: '|P(A)|>|A|' },
      { name: '可数并', statement: '可数个可数集的并仍可数。', },
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
      {
        title: '构造显式双射',
        body: '等势证明最可靠的方式是写出双射公式并验证双向单射。',
      },
    ],
    pitfalls: ['把包含当基数更小：无限集可与真子集等势。', '无限基数当普通数做算术。', '忽略选择公理：某些等势证明依赖它。'],
    example: {
      problem: '证明 (0,1) 里的实数不能排成一个序列。',
      walkthrough: [
        '假设能排成 a1, a2, a3, …，每个都写成小数。',
        '构造新数 b：第 k 位取 ak 第 k 位的相反数字（例如加 1 后取模 10）。',
        'b 与每个 ak 至少有一位不同，所以 b 不在列表里。',
        '与「已经全排完」矛盾，故 (0,1) 不可数。',
      ],
      result: '|\\mathbb{R}|>|\\mathbb{N}|',
    },    moreExamples: [{ problem: '自然数与整数是否等势？', walkthrough: ['把整数按零、正负交替排列。', '构造双射。'], result: '等势' }],

  },
  {
    id: 'graph-euler',
    title: '图论：欧拉公式与最短路',
    tag: '图论',
    level: '基础',
    essence:
      '连通平面图满足 V − E + F = 2；求最短路径用 Dijkstra，每步都从当前最近的未访问点扩张。',
    definition:
      '图由顶点与边组成。欧拉迹经过每条边恰好一次，欧拉回路是闭合的欧拉迹。',
    whenToUse: [
      '平面图计数面数或验证结构',
      '求带权图的最短路径',
      '判断一个图能否一笔画（欧拉回路）',
    ],
    theorems: [
      { name: '欧拉公式', statement: '连通平面图的顶点减边加面等于二。', formula: 'V-E+F=2' },
      { name: '欧拉回路判据', statement: '连通图有欧拉回路当且仅当所有顶点度为偶数。', },
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
      {
        title: '数奇度顶点',
        body: '欧拉问题先数度为奇数的顶点：零个有回路，两个有迹，多于两个无解。',
      },
    ],
    pitfalls: ['忽略连通性：不连通谈欧拉回路无意义。', '把有欧拉迹当有回路：两个奇度点对应迹而非回路。', '欧拉公式用在非平面图：前提是平面。'],
    example: {
      problem: '用欧拉公式验证正四面体。',
      walkthrough: [
        '正四面体有 4 个顶点、6 条棱、4 个面。',
        '代入 V − E + F = 4 − 6 + 4 = 2。',
        '等式成立，说明它确实是连通平面图（可画在平面上）。',
      ],
      result: 'V-E+F=2',
    },    moreExamples: [{ problem: '立方体图满足欧拉公式吗？', walkthrough: ['顶点八、棱十二、面六。', '八减十二加六等于二。'], result: '满足' }],

  },
  {
    id: 'information-entropy',
    title: '信息论：熵就是不确定性',
    tag: '信息论',
    level: '进阶',
    essence:
      '熵衡量一个随机变量的平均不确定性；分布越均匀，熵越大，公平硬币的熵正好是 1 bit。',
    definition:
      '离散随机变量的香农熵是负的概率乘对数之和，度量平均不确定性。互信息衡量两个变量的相关程度。',
    whenToUse: [
      '计算随机变量的信息量',
      '比较两种分布的混乱程度',
      '理解编码长度的下界',
    ],
    theorems: [
      { name: '熵的范围', statement: '熵非负，且不超过支持集大小的对数。', formula: '0\\le H(X)\\le\\log|X|' },
      { name: '链式法则', statement: '联合熵等于条件熵之和。', formula: 'H(X,Y)=H(X)+H(Y\\mid X)' },
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
      {
        title: '选对数底',
        body: '底为二时单位是比特，底为 e 时是奈特。',
      },
    ],
    pitfalls: ['把熵当概率：它是期望信息量。', '对数底不同：单位不同（比特/奈特）。', '均匀分布熵最大：只在固定支持集时成立。'],
    example: {
      problem: '一枚硬币正面概率 0.9，求它的熵。',
      walkthrough: [
        'H = −0.9·log2 0.9 − 0.1·log2 0.1。',
        'log2 0.9 ≈ −0.152，log2 0.1 ≈ −3.322。',
        'H ≈ 0.9×0.152 + 0.1×3.322 ≈ 0.469 bit。',
        '比公平硬币的 1 bit 小，因为结果更容易猜。',
      ],
      result: 'H\\approx 0.469\\ \\text{bit}',
    },    moreExamples: [{ problem: '均匀抛硬币的熵是多少比特？', walkthrough: ['两种结果各一半。', '负二分之一乘对数两次。'], result: '1' }],

  },
  {
    id: 'game-nash',
    title: '博弈论：纳什均衡怎么找',
    tag: '博弈论',
    level: '基础',
    essence:
      '纳什均衡是一组策略组合，任何一方单独改变策略都不会让自己更好——找它的办法是「给定对方策略，看各自的最优反应」。',
    definition:
      '纳什均衡是一组策略组合，任何一方单独改变策略都不会使自己的收益更高。',
    whenToUse: [
      '分析双方策略互相影响的情形',
      '判断合作能否维持',
      '解释囚徒困境这类反直觉结果',
    ],
    theorems: [
      { name: '纳什存在定理', statement: '有限博弈的混合策略意义下总存在纳什均衡。', },
      { name: '占优策略', statement: '严格占优策略必出现在任何均衡中。', },
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
      {
        title: '用划线法',
        body: '在收益矩阵中逐列划出每个参与者的最优反应，交叉处即纯策略均衡。',
      },
    ],
    pitfalls: ['把占优策略当均衡：占优更强。', '只看纯策略：有些博弈只有混合均衡。', '收益矩阵方向写反：行列表头要对应。'],
    example: {
      problem: '囚徒困境：双方都坦白是纳什均衡吗？',
      walkthrough: [
        '对方坦白时，我坦白比抵赖判得轻，所以坦白是最优反应。',
        '对方抵赖时，我坦白同样更好。',
        '无论对方怎么选，坦白都更优，因此（坦白，坦白）是均衡。',
        '但它比（抵赖，抵赖）更差，这就是困境。',
      ],
      result: '(\\text{Defect},\\ \\text{Defect})',
    },    moreExamples: [{ problem: '囚徒困境的纳什均衡是什么？', walkthrough: ['双方都有占优策略。', '都选择背叛。'], result: '双方背叛' }],

  },
  {
    id: 'crypto-rsa',
    title: '密码学：RSA 三步',
    tag: '密码学',
    level: '基础',
    essence:
      'RSA 的安全性来自「大整数分解很难」：公钥加密、私钥解密，靠的是模逆元与欧拉定理。',
    definition:
      'RSA 用两个大素数乘积作为模数，公钥是模数与指数，私钥是指数的模逆。安全性依赖大整数分解困难。',
    whenToUse: [
      '理解公钥加密的基本流程',
      '计算小规模 RSA 的加解密',
      '解释为什么密钥要足够长',
    ],
    theorems: [
      { name: '欧拉定理', statement: '与模数互素的数的 φ 次幂模模数等于一。', formula: 'a^{\\varphi(n)}\\equiv 1' },
      { name: '解密正确性', statement: '加密再解密还原明文，因指数互为模逆。', },
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
      {
        title: '验证逆元',
        body: '算完私钥代回验证 ed 模 φ 等于一，是最快的自检。',
      },
    ],
    pitfalls: ['素数太小：可被分解。', '公钥指数与 φ 不互素：逆元不存在。', '不做填充：确定性加密不安全。'],
    example: {
      problem: '取 p = 61、q = 53、e = 17，加密 m = 65。',
      walkthrough: [
        'n = 61×53 = 3233，φ(n) = 60×52 = 3120。',
        '求 d：17d ≡ 1 (mod 3120)，得 d = 2753。',
        '加密：c = 65^17 mod 3233 = 2790。',
        '解密：2790^2753 mod 3233 = 65，还原成功。',
      ],
      result: 'c=2790',
    },    moreExamples: [{ problem: 'p=3、q=11、e=3 时私钥是多少？', walkthrough: ['模数为 20。', '求 3 的逆元。'], result: '7' }],

  },
  {
    id: 'measure-theory',
    title: '测度论：把长度变成函数',
    tag: '测度论',
    level: '进阶',
    essence:
      '测度是给集合赋「大小」的函数；勒贝格测度让「长度」适用于远比区间复杂的集合，也让积分能处理更多函数。',
    definition:
      '测度是定义在 σ 代数上的非负可列可加函数，空集为零。它把「大小」推广到一般集合族。',
    whenToUse: [
      '理解积分为什么需要「可测」',
      '计算奇怪集合的大小（如康托集）',
      '概率论的公理化基础',
    ],
    theorems: [
      { name: '可列可加', statement: '两两不交可测集的并的测度等于测度之和。', formula: '\\mu(\\cup A_n)=\\sum\\mu(A_n)' },
      { name: '单调性', statement: '包含关系的测度单调。', },
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
    pitfalls: ['忽略 σ 代数：不是所有子集都可测。', '把有限可加当可列：极限运算会失效。', '忘记零测集：它们不影响积分。'],
    example: {
      problem: '求康托集三分构造中挖掉的总长度。',
      walkthrough: [
        '第 1 步挖掉 1/3，第 2 步挖掉 2 段各 1/9，第 3 步 4 段各 1/27。',
        '总长 = 1/3 + 2/9 + 4/27 + … = (1/3)/(1−2/3) = 1。',
        '原区间长度是 1，挖掉的总长也是 1。',
        '剩下的康托集测度为 0，尽管它不可数。',
      ],
      result: 'm(C)=0',
    },    moreExamples: [{ problem: '可数集的勒贝格测度是多少？', walkthrough: ['单点测度为零。', '可列可加。'], result: '0' }],

  },
  {
    id: 'galois-theory',
    title: '伽罗瓦理论：五次方程为什么解不出',
    tag: '伽罗瓦',
    level: '进阶',
    essence:
      '方程能用根式解，当且仅当它的伽罗瓦群是可解群；一般五次方程的群是 S5，不可解，所以没有根式公式。',
    definition:
      '伽罗瓦理论用域扩张的自同构群研究方程可解性。伽罗瓦扩张的中间域与子群一一对应。',
    whenToUse: [
      '判断一个方程能否根式求解',
      '理解群与域扩张的对应',
      '解释「五次以上无求根公式」',
    ],
    theorems: [
      { name: '伽罗瓦对应', statement: '伽罗瓦扩张的中间域与伽罗瓦群的子群反序对应。', },
      { name: '可解性判据', statement: '方程可根式求解当且仅当伽罗瓦群可解。', },
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
    pitfalls: ['把任意扩张当伽罗瓦：需要正规且可分。', '群阶与扩张次数混淆：伽罗瓦扩张中二者相等。', '把可解群当交换群：可解更宽。'],
    example: {
      problem: '为什么 x^5 − x − 1 不能用根式求解？',
      walkthrough: [
        '它在有理数上不可约，实根恰好 1 个、复根 4 个。',
        '可以证明其伽罗瓦群同构于 S5。',
        'S5 的交换子群链停在 A5，而 A5 非交换，故 S5 不可解。',
        '由伽罗瓦对应，方程无根式解。',
      ],
      result: '\\mathrm{Gal}(x^{5}-x-1)\\cong S_{5}',
    },    moreExamples: [{ problem: '一般五次方程为什么无根式解？', walkthrough: ['伽罗瓦群是对称群。', '对称群不可解。'], result: '不可根式求解' }],

  },
  {
    id: 'linear-programming',
    title: '线性规划：最优解在顶点',
    tag: '运筹学',
    level: '基础',
    essence:
      '目标与约束都是线性的，最优值一定在可行域的顶点取到；对偶问题给出同一最优值的上界。',
    definition:
      '线性规划是在线性约束下优化线性目标。可行域是多面体，最优值在顶点取到（若有界）。',
    whenToUse: [
      '资源分配、生产计划这类优化',
      '把文字约束写成线性不等式组',
      '用对偶检验最优性',
    ],
    theorems: [
      { name: '顶点最优', statement: '有界可行域上线性目标的最优值在顶点取到。', },
      { name: '强对偶', statement: '原问题与对偶问题最优值相等（可行时）。', },
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
      {
        title: '画可行域',
        body: '二维问题先画图找顶点，再逐个比较目标值。',
      },
    ],
    pitfalls: ['忽略可行域无界：可能无最优解。', '把整数规划当线性规划：放松后取整不一定最优。', '约束方向写反：可行域会变空。'],
    example: {
      problem: '最大化 3x + 2y，约束 x + y ≤ 4、x ≤ 2、y ≤ 3、x, y ≥ 0。',
      walkthrough: [
        '可行域顶点：(0,0)、(2,0)、(2,2)、(1,3)、(0,3)。',
        '逐点代入：0、6、10、9、6。',
        '最大值为 10，在 (2,2) 取到。',
        '对偶变量可验算最优值一致。',
      ],
      result: '\\max=10\\ \\text{at}\\ (2,2)',
    },    moreExamples: [{ problem: '在 x 不超过二、y 不超过三时 x 加 y 的最大值？', walkthrough: ['可行域为矩形。', '右上角取到。'], result: '5' }],

  },
  {
    id: 'non-euclidean',
    title: '非欧几何：换掉平行公设',
    tag: '非欧几何',
    level: '进阶',
    essence:
      '把欧几里得的第五公设换掉，就得到非欧几何；双曲几何里过直线外一点有无数条平行线，三角形内角和小于 180°。',
    definition:
      '非欧几何是修改平行公设得到的几何。双曲几何中过直线外一点有多条平行线，球面几何中任意两条测地线相交。',
    whenToUse: [
      '理解几何公理体系的作用',
      '区分欧氏、双曲、椭圆几何',
      '处理曲率不为零的空间',
    ],
    theorems: [
      { name: '双曲内角和', statement: '双曲三角形内角和小于 180 度。', },
      { name: '球面内角和', statement: '球面三角形内角和大于 180 度。', },
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
    pitfalls: ['照搬欧氏结论：内角和不再固定。', '把球面几何当双曲：曲率符号相反。', '忽略模型：非欧几何需要具体模型才能验证。'],
    example: {
      problem: '双曲三角形内角和为 π/2，它的面积是多少？',
      walkthrough: [
        '曲率为 −1 时，面积等于角亏 π − (α + β + γ)。',
        '代入：π − π/2 = π/2。',
        '角亏越大，面积越大，这与欧氏几何不同。',
      ],
      result: 'S=\\pi-(\\alpha+\\beta+\\gamma)',
    },    moreExamples: [{ problem: '球面三角形的内角和是多少？', walkthrough: ['球面曲率为正。', '内角和大于 180 度。'], result: '大于 180 度' }],

  },
  {
    id: 'computability',
    title: '可计算性：停机问题不可判定',
    tag: '可计算性',
    level: '进阶',
    essence:
      '不是所有函数都能被算法算出；停机问题就是第一个被证明不可判定的问题，靠对角线法构造矛盾。',
    definition:
      '可计算函数指存在图灵机在有限步内算出结果的函数。停机问题问：给定程序与输入，是否存在算法判断它是否停机。',
    whenToUse: [
      '判断一个问题有没有算法解',
      '理解可判定与可识别的区别',
      '认识「程序数量可数而函数不可数」',
    ],
    theorems: [
      { name: '停机问题不可判定', statement: '不存在算法能对任意程序判断是否停机。', },
      { name: '通用图灵机', statement: '存在能模拟任意图灵机的图灵机。', },
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
      {
        title: '用对角线法',
        body: '假设判定器存在，构造调用自身的程序导出矛盾。',
      },
    ],
    pitfalls: ['把不可判定当不可计算：函数可计算但判定问题无算法。', '忽略编码：停机问题依赖程序编码。', '混淆可判定与半可判定：后者只保证停机时能确认。'],
    example: {
      problem: '用对角线法证明停机问题不可判定。',
      walkthrough: [
        '假设 H(P, x) 能判定程序 P 在输入 x 上是否停机。',
        '构造 Q(x)：若 H(x, x) 回答「停机」，则 Q 死循环；否则 Q 立即停机。',
        '问 Q(Q) 是否停机：无论怎么答都与定义矛盾。',
        '所以 H 不存在。',
      ],
      result: '\\text{HALT}\\ \\text{undecidable}',
    },    moreExamples: [{ problem: '存在能判断所有程序是否停机的算法吗？', walkthrough: ['假设存在。', '构造自指程序导出矛盾。'], result: '不存在' }],

  },

  {
    id: 'ring-ideal',
    title: '环论入门：理想与商环',
    tag: '环论',
    level: '进阶',
    essence:
      '环是能加能乘的代数结构；理想是对乘法封闭的加法子群，用它做商就像整数模 n，把「倍数」一次性归零。',
    definition:
      '环是集合配上加法与乘法，加法成交换群、乘法结合且对加法分配。理想是对加法与「环元素乘理想元素」封闭的子集。',
    whenToUse: [
      '判断一个子集是不是理想',
      '构造商环并判断它是否是域',
      '理解模运算的代数本质',
    ],
    theorems: [
      { name: '商环', statement: '理想给出商环，商映射是同态。', formula: 'R/I' },
      { name: '同态核', statement: '环同态的核是理想，像是子环。', },
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
    pitfalls: ['只验加法封闭：理想还要对左乘右乘封闭。', '把理想当子环：子环不要求吸收乘法。', '交换性想当然：非交换环左右理想不同。'],
    example: {
      problem: '在 Z₆ 里找出零因子，并说明 ⟨2⟩ 是不是理想。',
      walkthrough: [
        '2×3 = 6 ≡ 0，而 2、3 都非零，所以 2 和 3 是零因子。',
        '⟨2⟩ = {0, 2, 4} 是加法子群。',
        '任取 r ∈ Z₆、x ∈ ⟨2⟩，rx 仍是偶数，仍在 ⟨2⟩ 中。',
        '所以 ⟨2⟩ 是理想，商环 Z₆/⟨2⟩ ≅ Z₂ 是域，⟨2⟩ 极大。',
      ],
      result: '\\mathbb{Z}_{6}/\\langle 2\\rangle\\cong\\mathbb{Z}_{2}',
    },    moreExamples: [{ problem: '整数环中偶数集是理想吗？', walkthrough: ['偶数加偶数仍偶。', '任意整数乘偶数仍偶。'], result: '是' }],

  },
  {
    id: 'projective-geometry',
    title: '射影几何：把平行线交于无穷远',
    tag: '射影几何',
    level: '进阶',
    essence:
      '射影平面在欧氏平面上加了一条无穷远线，平行线在那里相交；齐次坐标让「无穷远」和普通点用同一套公式处理。',
    definition:
      '射影平面是向量空间的一维子空间全体，用齐次坐标表示，整体缩放视为同一点。',
    whenToUse: [
      '处理平行线的交点问题',
      '化简圆锥曲线的分类',
      '理解透视投影下的不变量',
    ],
    theorems: [
      { name: '德萨格定理', statement: '两个三角形对应顶点连线共点时，对应边交点共线。', },
      { name: '对偶原理', statement: '射影平面中点与线对偶，定理自动对偶成立。', },
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
      {
        title: '齐次化再验证',
        body: '把仿射坐标写成齐次坐标，检查结论是否包含无穷远情形。',
      },
    ],
    pitfalls: ['忽略无穷远点：平行线在射影平面相交。', '齐次坐标不整体缩放比较。', '把射影当欧氏：长度角度不再有定义。'],
    example: {
      problem: '求直线 x + y = 1 与 x + y = 2 的交点。',
      walkthrough: [
        '齐次化：x + y − z = 0 与 x + y − 2z = 0。',
        '相减得 z = 0。',
        '代回得 x + y = 0，即交点 (1 : −1 : 0)。',
        '它在无穷远线上，方向就是两直线的公共方向。',
      ],
      result: '(1:-1:0)',
    },    moreExamples: [{ problem: '两条平行线在射影平面中的交点？', walkthrough: ['方向相同。', '交于无穷远点。'], result: '无穷远点' }],

  },
  {
    id: 'fundamental-group',
    title: '代数拓扑：用基本群区分空间',
    tag: '代数拓扑',
    level: '进阶',
    essence:
      '基本群记录「绕不回来的圈有多少种」；圆周的基本群是整数，球面是平凡群，这个差别证明两者不同胚。',
    definition:
      '基本群是以基点为起终点的闭路在同伦意义下的群，运算是路的连接。它是同胚不变量。',
    whenToUse: [
      '证明两个空间不同胚',
      '理解洞与环路的关系',
      '计算简单的拓扑不变量',
    ],
    theorems: [
      { name: '圆的基本群', statement: '圆周的基本群同构于整数群。', formula: '\\pi_1(S^{1})\\cong\\mathbb{Z}' },
      { name: '同伦不变', statement: '同伦等价的空间有同构的基本群。', },
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
    pitfalls: ['忽略基点：不同基点需用道路连接。', '把同伦当同胚：同伦更弱。', '以为基本群总交换：一般非交换。'],
    example: {
      problem: '证明圆周与球面不同胚。',
      walkthrough: [
        '圆周的基本群是 Z，非平凡。',
        '球面的基本群是平凡群。',
        '两个群不同构，所以两空间不同胚。',
        '这也说明「有没有洞」是拓扑性质。',
      ],
      result: '\\pi_{1}(S^{1})\\not\\cong\\pi_{1}(S^{2})',
    },    moreExamples: [{ problem: '环面的基本群是什么？', walkthrough: ['两个独立绕圈方向。', '生成元两个且交换。'], result: '整数群的平方' }],

  },
  {
    id: 'p-vs-np',
    title: '理论计算机：P 与 NP',
    tag: '计算复杂性',
    level: '进阶',
    essence:
      'P 是能快速求解的问题，NP 是能快速验证解的问题；P 是否等于 NP 是理论计算机最大的开放问题。',
    definition:
      'P 是多项式时间可解的问题类，NP 是多项式时间可验证证书的问题类。P 是否等于 NP 是未解难题。',
    whenToUse: [
      '判断一个问题的复杂度类别',
      '理解「难解」的严格含义',
      '认识 NP 完全问题的意义',
    ],
    theorems: [
      { name: '库克－列文定理', statement: '布尔可满足性是 NP 完全的。', },
      { name: 'NP 完全性', statement: 'NP 完全问题有多项式算法则 P 等于 NP。', },
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
    pitfalls: ['把 NP 当不可解：NP 只是可验证。', '混淆求解与验证：证书验证更快。', '认为所有 NP 问题都难：有的在 P 中。'],
    example: {
      problem: '为什么「验证解」比「求解」容易？',
      walkthrough: [
        '给一个数独答案，逐行检查是否合法只需扫描一遍。',
        '但从空盘出发求解，可能要大量搜索回溯。',
        '可快速验证正是 NP 的定义。',
        '若 P = NP，则所有可验证的问题都能快速求解。',
      ],
      result: '\\text{SAT}\\in\\text{NP-complete}',
    },    moreExamples: [{ problem: '布尔可满足性属于哪个类？', walkthrough: ['解可在多项式时间验证。', '且是 NP 完全。'], result: 'NP 完全' }],

  },
  {
    id: 'control-theory',
    title: '控制论：极点决定稳定性',
    tag: '控制论',
    level: '进阶',
    essence:
      '线性系统的稳定性由极点在复平面的位置决定：全在左半平面就稳定，一旦进入右半平面就发散。',
    definition:
      '控制系统用状态方程描述：状态随时间的导数由当前状态与输入决定。稳定性由系统矩阵的极点决定。',
    whenToUse: [
      '判断反馈系统是否稳定',
      '设计极点位置来调响应速度',
      '理解 PID 参数对稳定性的影响',
    ],
    theorems: [
      { name: '极点判稳', statement: '连续系统稳定当且仅当所有极点在左半平面。', },
      { name: '能控性判据', statement: '能控性矩阵满秩等价于系统能控。', },
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
    pitfalls: ['开环当闭环：反馈改变极点。', '忽略能观性：状态不可测则无法任意配置。', '离散系统套连续判据：稳定域是单位圆内。'],
    example: {
      problem: '二阶系统 s² + 2s + 5 的极点在哪？稳定吗？',
      walkthrough: [
        '解 s² + 2s + 5 = 0，得 s = −1 ± 2i。',
        '两个极点的实部都是 −1，小于 0。',
        '所以系统渐近稳定，且会振荡（虚部非零）。',
        '阻尼比 ζ = 1/√5 ≈ 0.45，属于欠阻尼。',
      ],
      result: 's=-1\\pm 2i',
    },    moreExamples: [{ problem: '一阶系统极点为负三时稳定吗？', walkthrough: ['极点位于左半平面。', '稳定。'], result: '稳定' }],

  },
  {
    id: 'category-theory',
    title: '范畴论：对象与态射',
    tag: '范畴论',
    level: '进阶',
    essence:
      '范畴只关心对象之间的箭头（态射）以及它们怎么复合，不关心对象内部长什么样；函子是范畴之间的「保持结构的映射」。',
    definition:
      '范畴由对象与态射组成，态射可复合且每个对象有恒等态射。函子是范畴之间的映射，自然变换是函子之间的映射。',
    whenToUse: [
      '统一不同数学领域的构造',
      '理解泛性质（积、余积、自由对象）',
      '看懂现代数学的通用语言',
    ],
    theorems: [
      { name: '米田引理', statement: '对象由其表示函子决定，嵌入是全忠实的。', },
      { name: '泛性质', statement: '积、余积等由泛性质唯一确定（同构意义）。', },
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
      {
        title: '画交换图',
        body: '把定义写成交换图，检查所有路径复合相同，是最直接的理解方式。',
      },
    ],
    pitfalls: ['把对象当集合：范畴对象是抽象的。', '函子方向搞反：协变与反变不同。', '忽略自然性：交换图必须对所有对象成立。'],
    example: {
      problem: '在集合范畴里，两个集合的积是什么？',
      walkthrough: [
        '对象取笛卡尔积 A × B。',
        '态射取两个投影 π₁、π₂。',
        '对任何集合 C 与一对映射，都存在唯一的映射到 A × B。',
        '这个唯一性正是「积」的泛性质。',
      ],
      result: '|A\\times B|=|A|\\cdot|B|',
    },    moreExamples: [{ problem: '集合范畴中的积是什么？', walkthrough: ['满足泛性质的构造。', '即笛卡尔积。'], result: '笛卡尔积' }],

  },

  {
    id: 'prime-theorem',
    title: '解析数论：素数有多少个',
    tag: '解析数论',
    level: '进阶',
    essence:
      '素数越来越稀，但不会消失；素数定理说不超过 x 的素数大约有 x/ln x 个，欧拉乘积把这件事和 ζ 函数绑在一起。',
    definition:
      '素数计数函数统计不超过给定值的素数个数。素数定理说它与「该值除以其自然对数」之比的极限为一。',
    whenToUse: [
      '估计某范围内的素数个数',
      '理解 ζ 函数与素数的关系',
      '判断素数分布的稀疏速度',
    ],
    theorems: [
      { name: '素数定理', statement: '素数计数与对数积分渐近。', formula: '\\pi(x)\\sim\\frac{x}{\\ln x}' },
      { name: '欧拉乘积', statement: '黎曼 ζ 函数可写成素数的欧拉乘积。', },
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
    pitfalls: ['把渐近当等式：只是比值趋于一。', '忽略误差项：实际计数有波动。', '用初等证明套用：需要复分析。'],
    example: {
      problem: '估计 1000 以内的素数个数，并与真值比较。',
      walkthrough: [
        '真值 π(1000) = 168。',
        '近似 x/ln x = 1000/6.9078 ≈ 144.8。',
        '比值 168/144.8 ≈ 1.16，x 越大越接近 1。',
        '这就是「素数定理是渐近式，不是等式」的含义。',
      ],
      result: '\\pi(1000)=168',
    },    moreExamples: [{ problem: '一百以内的素数有多少个？', walkthrough: ['逐个筛去合数。', '共二十五个。'], result: '25' }],

  },
  {
    id: 'representation-theory',
    title: '表示论：把群变成矩阵',
    tag: '表示论',
    level: '进阶',
    essence:
      '把抽象群元素映成可计算的矩阵，就是表示；特征标（矩阵的迹）是表示最轻量的指纹，正交关系用来分解表示。',
    definition:
      '群的表示是把群元素映成向量空间上的可逆线性变换，并保持乘法。特征标是表示的迹。',
    whenToUse: [
      '把对称性转成线性代数',
      '分解一个表示成不可约部分',
      '理解量子力学里的对称性',
    ],
    theorems: [
      { name: '正交关系', statement: '不可约表示的特征标满足正交关系。', },
      { name: '完备性', statement: '有限群的正则表示分解为不可约表示之直和。', },
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
      {
        title: '先看维数',
        body: '一维表示最容易构造，先从它入手理解表示与特征标。',
      },
    ],
    pitfalls: ['把表示当群同构：表示不必忠实。', '混淆特征标与表示：特征标是迹函数。', '忽略基域：复表示与实表示不同。'],
    example: {
      problem: '写出三阶循环群 Z₃ 的一维表示。',
      walkthrough: [
        'Z₃ 由元素 g 生成，g³ = e。',
        '一维表示必须满足 ρ(g)³ = 1。',
        '所以 ρ(g) 取 1、ω、ω² 三个三次单位根。',
        '三个一维表示的特征标互相正交。',
      ],
      result: '\\rho_{k}(g)=\\omega^{k},\\ \\omega=e^{2\\pi i/3}',
    },    moreExamples: [{ problem: '一维表示对应什么矩阵？', walkthrough: ['一维空间上的线性变换。', '就是乘一个数。'], result: '数（1×1 矩阵）' }],

  },
  {
    id: 'option-pricing',
    title: '金融数学：Black–Scholes 定价',
    tag: '金融数学',
    level: '进阶',
    essence:
      '期权的公允价格由「无套利 + 连续对冲」唯一确定；在风险中性测度下，折现后的价格是鞅，直接给出闭式公式。',
    definition:
      '期权定价给出衍生品的无套利价格。Black－Scholes 模型假设标的服从几何布朗运动，价格由偏微分方程或风险中性期望给出。',
    whenToUse: [
      '计算欧式期权理论价格',
      '理解对冲与风险中性',
      '分析希腊字母对价格的影响',
    ],
    theorems: [
      { name: 'BS 方程', statement: '期权价格满足抛物型偏微分方程。', formula: '\\partial_t V+\\frac{1}{2}\\sigma^{2}S^{2}\\partial_{SS}V+rS\\partial_S V-rV=0' },
      { name: '风险中性定价', statement: '价格等于风险中性测度下的折现期望。', },
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
    pitfalls: ['把模型价格当真实价格：假设过强。', '忽略波动率微笑：实际偏离常数波动率。', '忘记无套利前提：有套利时公式失效。'],
    example: {
      problem: 'S = 100、K = 100、r = 5%、σ = 20%、T = 1，求看涨期权价格。',
      walkthrough: [
        'd₁ = [ln1 + (0.05 + 0.02)·1] / 0.2 = 0.35。',
        'd₂ = d₁ − 0.2 = 0.15。',
        'N(0.35) ≈ 0.6368，N(0.15) ≈ 0.5596。',
        'C = 100×0.6368 − 100×e^(−0.05)×0.5596 ≈ 10.45。',
      ],
      result: 'C\\approx 10.45',
    },    moreExamples: [{ problem: 'BS 模型中期权价格依赖哪些参数？', walkthrough: ['标的价格、执行价、期限、波动率、利率。'], result: '五个参数' }],

  },
  {
    id: 'lagrangian-mechanics',
    title: '力学：用能量代替力',
    tag: '力学',
    level: '进阶',
    essence:
      '拉格朗日力学不写受力分析，只写动能减势能，再由欧拉–拉格朗日方程自动得到运动方程。',
    definition:
      '拉格朗日力学用动能减势能构造拉格朗日量，运动方程由变分原理给出，与牛顿力学等价但更易处理约束。',
    whenToUse: [
      '处理带约束的机械系统',
      '推导复杂系统的运动方程',
      '找守恒量与对称性的关系',
    ],
    theorems: [
      { name: '欧拉－拉格朗日方程', statement: '作用量取极值给出运动方程。', formula: '\\frac{d}{dt}\\frac{\\partial L}{\\partial\\dot q}-\\frac{\\partial L}{\\partial q}=0' },
      { name: '诺特定理', statement: '对称性对应守恒量。', },
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
      {
        title: '写广义坐标',
        body: '先选独立广义坐标消去约束，再写动能与势能。',
      },
    ],
    pitfalls: ['把拉格朗日量当能量：它是动能减势能。', '忽略约束处理：广义坐标要选对。', '变分与普通极值混淆：是对函数求极值。'],
    example: {
      problem: '用拉格朗日方法推导单摆方程。',
      walkthrough: [
        'T = ½mL²θ̇²，V = −mgL cosθ。',
        'L = ½mL²θ̇² + mgL cosθ。',
        '代入 EL 方程：mL²θ̈ − mgL·(−sinθ) = 0。',
        '化简得 θ̈ + (g/L) sinθ = 0。',
      ],
      result: '\\ddot{\\theta}+\\frac{g}{L}\\sin\\theta=0',
    },    moreExamples: [{ problem: '拉格朗日量等于什么？', walkthrough: ['动能减势能。'], result: 'T 减 V' }],

  },
  {
    id: 'lotka-volterra',
    title: '生物数学：捕食者与猎物',
    tag: '生物数学',
    level: '进阶',
    essence:
      '捕食者–猎物模型没有稳定焦点，而是绕平衡点转圈：数量此消彼长，周期由初始条件决定。',
    definition:
      '洛特卡－沃尔泰拉方程描述捕食者与猎物的相互作用：猎物增长被捕食抑制，捕食者增长依赖猎物。',
    whenToUse: [
      '解释种群数量的周期振荡',
      '求生态模型平衡点',
      '判断系统是否守恒',
    ],
    theorems: [
      { name: '平衡点', statement: '两物种共存时存在非零平衡点。', },
      { name: '周期轨道', statement: '经典模型中轨道围绕平衡点闭合。', },
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
      {
        title: '找平衡点',
        body: '令两个导数同时为零，解出共存平衡与灭绝平衡。',
      },
    ],
    pitfalls: ['忽略参数范围：某些参数导致灭绝。', '把闭合轨道当稳定焦点。', '离散化后行为改变：数值方法可能失真。'],
    example: {
      problem: '取 a = 1、b = 0.1、c = 0.075、d = 1.5，求平衡点。',
      walkthrough: [
        'x* = d/c = 1.5 / 0.075 = 20。',
        'y* = a/b = 1 / 0.1 = 10。',
        '平衡点 (20, 10)：猎物 20、捕食者 10。',
        '初始值偏离时，数量沿闭合轨道振荡。',
      ],
      result: '(x^{*},y^{*})=(20,10)',
    },    moreExamples: [{ problem: '捕食者为零时猎物如何变化？', walkthrough: ['无捕食则指数增长。', '受资源限制时趋于饱和。'], result: '增长或饱和' }],

  },

  {
    id: 'det-basics',
    title: '行列式：三种算法',
    tag: '线代',
    level: '基础',
    essence:
      '行列式是一个「把方阵映成数」的函数；考试里九成靠三条性质化简，剩下才是硬展开。',
    definition:
      '行列式是对方阵定义的一个数，几何上是该矩阵对应线性变换对体积的伸缩倍数。二阶行列式等于主对角乘积减副对角乘积。',
    whenToUse: [
      '判断矩阵是否可逆（det ≠ 0）',
      '求特征多项式',
      '计算面积、体积的伸缩因子',
    ],
    theorems: [
      {
        name: '行列式与可逆',
        statement: '方阵可逆当且仅当行列式不为零。',
        formula: '\\det A\\ne 0\\;\\Leftrightarrow\\;A\\text{ invertible}',
      },
      {
        name: '转置不变',
        statement: '行列式对转置不变，因此行与列的性质完全对称。',
      },
    ],
    steps: [
      {
        title: '三条性质先化简',
        body: '交换两行变号；某行乘 k 行列式也乘 k；一行加上另一行的倍数不变。',
        formula: '|A|=|A^{T}|',
      },
      {
        title: '化成三角',
        body: '用倍加把主对角线下方清零，三角行列式等于对角元相乘。',
        formula: '|A|=\\prod_{i}a_{ii}',
      },
      {
        title: '按行（列）展开',
        body: '某行只有一个非零元时，沿该行展开最快。',
        formula: '|A|=\\sum_{j}(-1)^{i+j}a_{ij}M_{ij}',
      },
      {
        title: '记住特殊结构',
        body: '范德蒙德、分块对角、上下三角都有现成公式。',
      },
      {
        title: '先看矩阵大小',
        body: '二阶用公式，三阶以上先化简再展开。',
      },
    ],
    pitfalls: [
      '二阶公式记反：是主对角乘积减副对角乘积。',
      '把行列式与矩阵混：行列式是数，矩阵是表。',
      '为零就判不可逆：正确，但要注意是方阵。',
    ],
    example: {
      problem: '计算 A = [[1,2,3],[0,4,5],[0,0,6]] 的行列式。',
      walkthrough: [
        'A 已经是上三角矩阵。',
        '行列式等于对角元之积：1 × 4 × 6。',
        '结果为 24。',
        '若换成一般矩阵，先用倍加化三角再乘。',
      ],
      result: '|A|=24',
    },    moreExamples: [
      {
        problem: '计算二、一、三、四 的行列式。',
        walkthrough: [
          '主对角乘积为八。',
          '副对角乘积为三。',
          '相减得五。',
        ],
        result: '5',
      },
    ],

  },
  {
    id: 'matrix-algebra',
    title: '矩阵运算：为什么乘法不交换',
    tag: '线代',
    level: '基础',
    essence:
      '矩阵乘法对应「先做一个线性变换再做另一个」，顺序不同结果就不同；求逆的本质是解线性方程组。',
    definition:
      '矩阵的加法按元素进行，乘法是行乘列求和。乘法不满足交换律，但满足结合律与分配律。',
    whenToUse: [
      '做矩阵乘法与转置',
      '判断矩阵是否可逆并求逆',
      '解矩阵方程 AX = B',
    ],
    theorems: [
      {
        name: '乘法不可交换',
        statement: '一般情形下两个矩阵乘积与顺序有关，交换后结果不同。',
        formula: 'AB\\ne BA\\;\\text{(generally)}',
      },
      {
        name: '转置与逆的顺序',
        statement: '乘积的转置与逆都要交换顺序。',
        formula: '(AB)^{T}=B^{T}A^{T}',
      },
    ],
    steps: [
      {
        title: '乘法规则',
        body: '左矩阵的行 × 右矩阵的列，维度必须内标相等。',
        formula: '(AB)_{ij}=\\sum_{k}a_{ik}b_{kj}',
      },
      {
        title: '不交换',
        body: '一般 AB ≠ BA；但转置会反序：(AB)^T = B^T A^T。',
      },
      {
        title: '可逆判据',
        body: '方阵可逆当且仅当行列式不为零，也等价于秩等于阶数。',
        formula: '|A|\\neq 0',
      },
      {
        title: '二阶逆矩阵',
        body: '主对角互换、副对角变号，再除以行列式。',
        formula: 'A^{-1}=\\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}',
      },
      {
        title: '先看维度',
        body: '相乘前确认左列数等于右行数，否则无意义。',
      },
    ],
    pitfalls: [
      '维度不匹配就相乘：左列数要等于右行数。',
      '把乘法当逐元素乘：矩阵乘法是行乘列。',
      '默认可交换：顺序换了结果就变。',
    ],
    example: {
      problem: '求 A = [[1,2],[3,4]] 的逆。',
      walkthrough: [
        '行列式 = 1×4 − 2×3 = −2。',
        '主对角互换得 [[4,2],[3,1]]，副对角变号得 [[4,−2],[−3,1]]。',
        '除以 −2 得 [[−2,1],[1.5,−0.5]]。',
        '验证 A·A⁻¹ = I。',
      ],
      result: 'A^{-1}=\\begin{pmatrix}-2&1\\\\1.5&-0.5\\end{pmatrix}',
    },    moreExamples: [
      {
        problem: '计算一、二、三、四 乘单位矩阵。',
        walkthrough: [
          '单位矩阵乘任何矩阵不变。',
          '结果仍为原矩阵。',
        ],
        result: '\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}',
      },
    ],

  },
  {
    id: 'gauss-elimination',
    title: '高斯消元：解的结构',
    tag: '线代',
    level: '基础',
    essence:
      '初等行变换把方程组化成阶梯形，比较系数矩阵与增广矩阵的秩，就能判断是有唯一解、无穷多解还是无解。',
    definition:
      '高斯消元用行初等变换把增广矩阵化成阶梯形，再回代求解。它是解线性方程组的通用方法。',
    whenToUse: [
      '解线性方程组',
      '判断方程组解的情况',
      '求基础解系',
    ],
    theorems: [
      {
        name: '阶梯形判解',
        statement: '化为阶梯形后，出现零等于非零的行则无解；非零行数小于未知数个数则无穷多解。',
      },
      {
        name: '唯一解条件',
        statement: '非零行数等于未知数个数时解唯一。',
      },
    ],
    steps: [
      {
        title: '写增广矩阵',
        body: '系数与常数项并排，行变换时一起变。',
      },
      {
        title: '化阶梯形',
        body: '用主元把下方清零，得到上三角或阶梯形。',
      },
      {
        title: '比较秩',
        body: 'r(A) < r(A|b) 无解；相等且等于未知数个数则唯一；相等但小于未知数个数则无穷多解。',
        formula: 'r(A)=r(A|b)=n',
      },
      {
        title: '写通解',
        body: '自由变量取参数，其余变量用它表示。',
      },
      {
        title: '主元选非零',
        body: '主元为零先交换行，否则消元失效。',
      },
    ],
    pitfalls: [
      '消元时乘的系数漏乘右端：增广矩阵要一起变。',
      '主元为零不换行：应交换行选非零主元。',
      '回代顺序错：从最下面一行往上代。',
    ],
    example: {
      problem: '解方程组 x + y = 3，2x + 2y = 6。',
      walkthrough: [
        '增广矩阵 [[1,1,3],[2,2,6]]。',
        '第二行减两倍第一行，得 [[1,1,3],[0,0,0]]。',
        'r(A) = r(A|b) = 1 < 2，所以有无穷多解。',
        '通解：x = 3 − t，y = t。',
      ],
      result: '\\text{infinitely many solutions}',
    },    moreExamples: [
      {
        problem: '解 x 加 y 等于三、x 减 y 等于一。',
        walkthrough: [
          '两式相加得二 x 等于四。',
          '回代求 y。',
        ],
        result: 'x=2,\\,y=1',
      },
    ],

  },
  {
    id: 'vector-space-basis',
    title: '基与维数：向量空间的坐标系',
    tag: '线代',
    level: '进阶',
    essence:
      '基是「数量最少、能张成整个空间」的一组向量；维数是基的个数，与选哪组基无关。',
    definition:
      '向量空间的基是线性无关且能张成整个空间的一组向量，基所含向量个数叫维数，与基的选择无关。',
    whenToUse: [
      '判断一组向量能否构成基',
      '求向量空间的维数',
      '求向量在给定基下的坐标',
    ],
    theorems: [
      {
        name: '基与坐标',
        statement: '同一向量在不同基下的坐标不同，但坐标变换由过渡矩阵给出。',
      },
      {
        name: '维数不变',
        statement: '有限维空间的所有基含相同个数的向量。',
      },
    ],
    steps: [
      {
        title: '张成',
        body: '一组向量的所有线性组合构成一个子空间。',
        formula: '\\mathrm{span}\\{v_{1},\\dots,v_{k}\\}',
      },
      {
        title: '线性无关',
        body: '只有全零系数才能组合出零向量。',
      },
      {
        title: '基',
        body: '既线性无关又能张成整个空间的一组向量。',
      },
      {
        title: '维数',
        body: '同一个空间的任意两组基，向量个数相同。',
        formula: '\\dim\\mathbb{R}^{n}=n',
      },
      {
        title: '基不唯一',
        body: '同一空间有无穷多组基，但维数固定。',
      },
    ],
    pitfalls: [
      '只张成不无关：那不是基。',
      '只无关不张成：也不够。',
      '维数与向量个数混淆：基的个数才等于维数。',
    ],
    example: {
      problem: '判断 (1,1)、(1,−1) 是否为 R² 的基。',
      walkthrough: [
        '两个向量线性无关：c₁(1,1) + c₂(1,−1) = 0 只有零解。',
        'R² 的维数是 2，两个无关向量正好张成它。',
        '所以它们构成一组基。',
        '任意向量 (a,b) 的坐标是 ((a+b)/2, (a−b)/2)。',
      ],
      result: '\\dim=2',
    },    moreExamples: [
      {
        problem: '标准基一、零与零、一是否构成二维空间的基。',
        walkthrough: [
          '两者线性无关。',
          '能表示任意二维向量。',
          '因此是基。',
        ],
        result: '2',
      },
    ],

  },
  {
    id: 'eigen-basics',
    title: '特征值怎么求',
    tag: '线代',
    level: '进阶',
    essence:
      '特征值是使 Ax = λx 成立的数；解法固定：算特征多项式 det(A − λI) = 0，再代回求特征向量。',
    definition:
      '若存在非零向量 v 使得矩阵 A 乘 v 等于标量 λ 乘 v，则 λ 是特征值、v 是对应特征向量。特征值由特征方程给出，是相似变换下的不变量。',
    whenToUse: [
      '求矩阵的特征值与特征向量',
      '判断矩阵能否对角化',
      '分析动力系统的稳定性',
    ],
    theorems: [
      {
        name: '特征多项式',
        statement: '特征值是特征多项式为零的根，矩阵的迹等于特征值之和，行列式等于特征值之积。',
        formula: '\\det(A-\\lambda I)=0',
      },
      {
        name: '可对角化判据',
        statement: 'n 阶矩阵可对角化当且仅当有 n 个线性无关的特征向量；实对称矩阵一定可正交对角化。',
      },
    ],
    steps: [
      {
        title: '定义',
        body: '存在非零向量 x 使 Ax 与 x 同方向。',
        formula: 'Ax=\\lambda x',
      },
      {
        title: '特征方程',
        body: '把定义移项得 (A − λI)x = 0，有非零解要求行列式为零。',
        formula: '\\det(A-\\lambda I)=0',
      },
      {
        title: '解特征向量',
        body: '把每个 λ 代回 (A − λI)x = 0 求基础解系。',
      },
      {
        title: '两条速算性质',
        body: '特征值之和等于迹，之积等于行列式。',
        formula: '\\sum\\lambda_{i}=\\mathrm{tr}A,\\quad \\prod\\lambda_{i}=|A|',
      },
      {
        title: '代回验算',
        body: '求出特征向量后代回验证，能挡住大部分计算错误。',
      },
    ],
    pitfalls: [
      '把特征向量算成零向量：定义要求非零。',
      '忘记代回检验：求出的特征向量要验证 A v 等于 λ v。',
      '重特征值直接下结论：重根可能凑不够特征向量，需要看几何重数。',
    ],
    example: {
      problem: '求 A = [[2,1],[1,2]] 的特征值。',
      walkthrough: [
        '特征多项式 det(A − λI) = (2−λ)² − 1 = 0。',
        '解得 (2−λ)² = 1，即 λ = 1 或 3。',
        '验算：两者之和 4 = 迹 4，之积 3 = 行列式 3。',
        '代回可求得对应的特征向量。',
      ],
      result: '\\lambda_{1}=3,\\ \\lambda_{2}=1',
    },    moreExamples: [
      {
        problem: '求矩阵一、二、二、一 的特征值。',
        walkthrough: [
          '写出特征多项式，对角线减 λ。',
          '展开得 λ 减一的平方减四。',
          '解出两个根。',
          '特征值为三与负一。',
        ],
        result: '\\lambda=3,\\,-1',
      },
    ],

  },
  {
    id: 'quadratic-form',
    title: '二次型：标准形与正定',
    tag: '线代',
    level: '进阶',
    essence:
      '二次型是二次齐次多项式，写成 xᵀAx 后，通过配方法或正交变换化标准形；正负惯性指数决定它的形状。',
    definition:
      '二次型是二次齐次多项式，可用对称矩阵表示。化简二次型就是通过可逆线性变换把它变成只含平方项的标准形。',
    whenToUse: [
      '化二次型为标准形',
      '判断二次型是否正定',
      '求曲面类型（椭圆、双曲）',
    ],
    theorems: [
      {
        name: '矩阵表示',
        statement: '二次型与对称矩阵一一对应，矩阵元素取交叉项系数的一半。',
        formula: 'f=x^{T}Ax',
      },
      {
        name: '标准形',
        statement: '任何实二次型都可通过正交变换化为对角形。',
      },
    ],
    steps: [
      {
        title: '写成矩阵',
        body: '对称矩阵 A 的元素 a_ij 取 x_i x_j 系数的一半。',
        formula: 'f(x)=x^{T}Ax',
      },
      {
        title: '配方法',
        body: '逐个变量配方，得到只含平方项的标准形。',
      },
      {
        title: '正交变换',
        body: '求特征值，用正交矩阵对角化，标准形系数就是特征值。',
      },
      {
        title: '正定判据',
        body: '所有特征值大于零，或全部顺序主子式大于零。',
        formula: '\\lambda_{i}>0',
      },
      {
        title: '交叉项除二',
        body: '写矩阵时交叉项系数要除以二。',
      },
    ],
    pitfalls: [
      '交叉项系数忘除二：矩阵元素是系数的一半。',
      '矩阵不对称：二次型矩阵必须对称。',
      '变换不可逆：合同变换要求可逆。',
    ],
    example: {
      problem: '判断 f = x₁² + 2x₁x₂ + 2x₂² 是否正定。',
      walkthrough: [
        '矩阵 A = [[1,1],[1,2]]。',
        '顺序主子式：一阶 1 > 0，二阶 1×2 − 1 = 1 > 0。',
        '全部为正，所以二次型正定。',
        '配方验证：f = (x₁ + x₂)² + x₂²，两项平方和。',
      ],
      result: '\\lambda_{1}>0,\\ \\lambda_{2}>0',
    },    moreExamples: [
      {
        problem: '写出 x 方加二 x y 加 y 方的矩阵。',
        walkthrough: [
          '对角元取平方项系数。',
          '交叉项系数一半放在非对角。',
        ],
        result: '\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}',
      },
    ],

  },

  {
    id: 'special-matrices',
    title: '特殊矩阵：对角、三角、对称、正交',
    tag: '线代',
    level: '基础',
    essence:
      '矩阵的特殊结构能省掉大半计算：对角阵幂次只看对角元，三角阵行列式只乘对角元，对称阵一定能正交对角化。',
    definition:
      '特殊矩阵包括对角、三角、对称、正交与幂等矩阵，它们各有简化性质，识别出来能省大量计算。',
    whenToUse: [
      '快速算特殊矩阵的幂与行列式',
      '判断矩阵是否正交、是否可正交对角化',
      '用分块结构简化大矩阵运算',
    ],
    theorems: [
      {
        name: '对称矩阵',
        statement: '转置等于自身的矩阵为对称矩阵，其特征值全为实数且可正交对角化。',
        formula: 'A^{T}=A',
      },
      {
        name: '正交矩阵',
        statement: '转置等于逆的矩阵为正交矩阵，行列式为正负一。',
        formula: 'A^{T}A=I',
      },
    ],
    steps: [
      {
        title: '对角矩阵',
        body: '乘法逐元素相乘，幂就是对角元各自取幂。',
        formula: '\\Lambda^{k}=\\mathrm{diag}(\\lambda_{1}^{k},\\dots,\\lambda_{n}^{k})',
      },
      {
        title: '三角矩阵',
        body: '行列式等于主对角线元素之积，特征值就是对角元。',
        formula: '|A|=\\prod_{i}a_{ii}',
      },
      {
        title: '对称矩阵',
        body: '满足 $A^{T}=A$，特征值全是实数，且一定存在正交矩阵把它对角化。',
        formula: 'A^{T}=A',
      },
      {
        title: '正交矩阵',
        body: '满足 $Q^{T}Q=I$，保持向量长度与夹角，行列式只能是 $\\pm1$。',
        formula: 'Q^{T}Q=I',
      },
      {
        title: '分块矩阵',
        body: '分块对角阵的行列式是各块行列式之积，求逆也逐块求。',
      },
    ],
    pitfalls: [
      '对称与反对称混：转置等于负自身是反对称。',
      '正交矩阵行列式记为恒为一：也可能为负一。',
      '只凭外观判断：要按定义验证。',
    ],
    example: {
      problem: '验证旋转矩阵 $Q=\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{pmatrix}$ 是正交矩阵。',
      walkthrough: [
        '计算 $Q^{T}Q$：两个因子相乘后，非对角元是 $-\\cos\\theta\\sin\\theta+\\sin\\theta\\cos\\theta=0$。',
        '对角元是 $\\cos^{2}\\theta+\\sin^{2}\\theta=1$。',
        '所以 $Q^{T}Q=I$，$Q$ 是正交矩阵。',
        '行列式 $=\\cos^{2}\\theta+\\sin^{2}\\theta=1$，符合正交阵行列式为 $\\pm1$ 的结论。',
      ],
      result: 'Q^{T}Q=I',
    },    moreExamples: [
      {
        problem: '判断对角元素为二、三的对角矩阵是否对称。',
        walkthrough: [
          '转置后仍为自身。',
          '因此对称。',
        ],
        result: 'A^{T}=A',
      },
    ],

  },
  {
    id: 'cramers-rule',
    title: '克拉默法则：用行列式解方程组',
    tag: '线代',
    level: '基础',
    essence:
      '当系数行列式不为零时，每个未知数都等于「用常数列替换该列后的行列式」除以系数行列式。',
    definition:
      '克拉默法则用行列式解方程：每个未知数等于把系数矩阵对应列换成常数项后的行列式，除以原行列式。只适用于方程个数等于未知数且行列式非零。',
    whenToUse: [
      '未知数少、系数简单的方程组',
      '需要写出解的显式表达式',
      '判断齐次方程组是否只有零解',
    ],
    theorems: [
      {
        name: '克拉默法则',
        statement: '系数行列式非零时解唯一，每个未知数由替换列的行列式之比给出。',
        formula: 'x_i=\\frac{D_i}{D}',
      },
      {
        name: '适用条件',
        statement: '行列式为零时法则失效，需要退回消元法判断解的情况。',
      },
    ],
    steps: [
      {
        title: '前提',
        body: '系数行列式 $|A|\\neq0$，此时解唯一。',
      },
      {
        title: '替换求值',
        body: '把第 $i$ 列换成常数项，算出行列式 $|A_{i}|$。',
        formula: 'x_{i}=\\frac{|A_{i}|}{|A|}',
      },
      {
        title: '齐次推论',
        body: '齐次方程组 $Ax=0$ 只有零解当且仅当 $|A|\\neq0$。',
      },
      {
        title: '和消元法比',
        body: '克拉默法则形式漂亮但要算 $n+1$ 个行列式，未知数多时用高斯消元更快。',
      },
      {
        title: '只差一个行列式',
        body: '分母是同一个系数行列式，分子逐列替换。',
      },
    ],
    pitfalls: [
      '行列式为零仍用：此时解不存在或不唯一。',
      '替换列错位：第 i 个未知数换的是第 i 列。',
      '方程数不等于未知数：法则不适用。',
    ],
    example: {
      problem: '用克拉默法则解 $x+y=3$，$x-y=1$。',
      walkthrough: [
        '系数行列式 $|A|=\\det\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}=-2\\neq0$。',
        '$x$ 用常数列替换第一列：$|A_{1}|=\\det\\begin{pmatrix}3&1\\\\1&-1\\end{pmatrix}=-4$，所以 $x=2$。',
        '$y$ 替换第二列：$|A_{2}|=\\det\\begin{pmatrix}1&3\\\\1&1\\end{pmatrix}=-2$，所以 $y=1$。',
        '与消元法结果一致。',
      ],
      result: 'x=2,\\ y=1',
    },    moreExamples: [
      {
        problem: '用克拉默法则解二 x 等于四、三 y 等于九。',
        walkthrough: [
          '系数行列式为六。',
          '分别替换两列求两个行列式。',
          '相除得解。',
        ],
        result: 'x=2,\\,y=3',
      },
    ],

  },
  {
    id: 'gram-schmidt',
    title: '施密特正交化：把基变正交',
    tag: '线代',
    level: '进阶',
    essence:
      '用逐次减去投影的办法，把一组线性无关向量变成正交组，张成的空间不变，再单位化就得到标准正交基。',
    definition:
      '施密特正交化把线性无关组变成正交组：每个新向量减去它在已有正交向量上的投影，再单位化就得到标准正交基。',
    whenToUse: [
      '求标准正交基',
      '构造正交矩阵',
      '推导 QR 分解',
    ],
    theorems: [
      {
        name: '正交化递推',
        statement: '每个新向量减去在已有正交向量方向上的投影，得到与它们都正交的向量。',
        formula: 'v_k=u_k-\\sum_{i<k}\\frac{(u_k,v_i)}{(v_i,v_i)}v_i',
      },
      {
        name: '标准正交基',
        statement: '正交化后再除以模长，得到标准正交基，张成空间不变。',
      },
    ],
    steps: [
      {
        title: '第一个向量不变',
        body: '$\\beta_{1}=\\alpha_{1}$。',
      },
      {
        title: '逐个减投影',
        body: '每个新向量减去它在已得正交向量上的投影。',
        formula: '\\beta_{k}=\\alpha_{k}-\\sum_{i<k}\\frac{(\\alpha_{k},\\beta_{i})}{(\\beta_{i},\\beta_{i})}\\beta_{i}',
      },
      {
        title: '单位化',
        body: '每个 $\\beta_{i}$ 除以自己的长度，得到标准正交组。',
        formula: 'e_{i}=\\frac{\\beta_{i}}{\\|\\beta_{i}\\|}',
      },
      {
        title: '性质',
        body: '新向量组与原向量组张成同一个空间，且两两正交。',
      },
      {
        title: '先正交再单位化',
        body: '两步分开做，最后统一除以模长。',
      },
    ],
    pitfalls: [
      '投影系数漏分母：要除以已有向量的内积。',
      '忘记单位化：标准正交基要求模长为一。',
      '顺序依赖出错：前面向量的投影要全部减掉。',
    ],
    example: {
      problem: '把 $\\alpha_{1}=(1,1)$、$\\alpha_{2}=(1,0)$ 正交化。',
      walkthrough: [
        '$\\beta_{1}=\\alpha_{1}=(1,1)$。',
        '计算投影系数 $\\frac{(\\alpha_{2},\\beta_{1})}{(\\beta_{1},\\beta_{1})}=\\frac{1}{2}$。',
        '$\\beta_{2}=(1,0)-\\frac{1}{2}(1,1)=(\\frac{1}{2},-\\frac{1}{2})$。',
        '两个向量内积 $1\\cdot\\frac{1}{2}+1\\cdot(-\\frac{1}{2})=0$，正交。',
      ],
      result: '\\beta_{2}=\\left(\\tfrac{1}{2},-\\tfrac{1}{2}\\right)',
    },    moreExamples: [
      {
        problem: '把一、一与一、零正交化。',
        walkthrough: [
          '保留第一个向量。',
          '第二个减去在第一个上的投影。',
        ],
        result: '\\left(\\frac{1}{2},-\\frac{1}{2}\\right)',
      },
    ],

  },
  {
    id: 'jordan-form',
    title: '若尔当标准形：不能对角化怎么办',
    tag: '线代',
    level: '进阶',
    essence:
      '不能对角化的矩阵仍能化成「对角块 + 上三角 $1$」的若尔当标准形；差别就在于这些 $1$ 记录了广义特征向量的层次。',
    definition:
      '不能对角化的矩阵可以化成若尔当标准形：对角线上是特征值，上对角线上是零或一。它刻画了矩阵在相似意义下的最简结构。',
    whenToUse: [
      '处理不可对角化的矩阵',
      '计算矩阵的幂与指数函数',
      '理解重特征值对应的几何重数不足',
    ],
    theorems: [
      {
        name: '若尔当标准形',
        statement: '任意复矩阵都相似于若尔当标准形，且不计块次序时唯一。',
      },
      {
        name: '块数与几何重数',
        statement: '同一特征值的若尔当块个数等于其几何重数。',
      },
    ],
    steps: [
      {
        title: '可对角化的条件',
        body: '每个特征值的几何重数等于代数重数时才能对角化。',
      },
      {
        title: '广义特征向量',
        body: '当 $(A-\\lambda I)x=0$ 的解不够时，继续解 $(A-\\lambda I)^{2}x=0$ 补足。',
      },
      {
        title: '若尔当块',
        body: '对角线上是 $\\lambda$，上方一排 $1$。',
        formula: 'J_{k}(\\lambda)=\\begin{pmatrix}\\lambda&1&&\\\\&\\ddots&\\ddots&\\\\&&\\ddots&1\\\\&&&\\lambda\\end{pmatrix}',
      },
      {
        title: '用途',
        body: '若尔当形让矩阵幂和 $e^{At}$ 变得可算，是解线性微分方程组的工具。',
      },
      {
        title: '不能对角化看块',
        body: '缺陷矩阵用若尔当标准形，块数等于几何重数。',
      },
    ],
    pitfalls: [
      '以为所有矩阵都能对角化：缺陷矩阵只能到若尔当形。',
      '块次序纠结：标准形在不计次序意义下唯一。',
      '几何重数算错：等于特征空间的维数。',
    ],
    example: {
      problem: '说明 $A=\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$ 的若尔当标准形。',
      walkthrough: [
        '特征值只有 $\\lambda=1$（二重）。',
        '$(A-I)x=0$ 化得 $x_{2}=0$，只有一个线性无关特征向量。',
        '几何重数 $1<$ 代数重数 $2$，不能对角化。',
        '它的若尔当块就是 $J_{2}(1)=\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$ 本身。',
      ],
      result: 'J_{2}(1)',
    },    moreExamples: [
      {
        problem: '二阶矩阵只有一个特征值且特征空间维数为一，若尔当块是几阶。',
        walkthrough: [
          '几何重数为一。',
          '因此只有一个块。',
          '块为二阶。',
        ],
        result: 'J_{2}',
      },
    ],

  },
  {
    id: 'inertia-theorem',
    title: '惯性定理：标准形不唯一但规范',
    tag: '线代',
    level: '进阶',
    essence:
      '二次型用不同的可逆替换化标准形，系数会变，但正平方项和负平方项的个数——正负惯性指数——永远不变。',
    definition:
      '惯性定理说二次型的标准形中正负平方项的个数是合同不变量，分别叫正负惯性指数，与所用的可逆变换无关。',
    whenToUse: [
      '判断二次型的类型（正定、负定、不定）',
      '比较两个二次型是否合同',
      '求二次型的秩与符号差',
    ],
    theorems: [
      {
        name: '惯性定理',
        statement: '实二次型的正负惯性指数在可逆线性变换下不变。',
        formula: 'p+q=r',
      },
      {
        name: '合同分类',
        statement: '两个实对称矩阵合同当且仅当正负惯性指数相同。',
      },
    ],
    steps: [
      {
        title: '合同',
        body: '存在可逆矩阵 $C$ 使 $B=C^{T}AC$，就说 $A$ 与 $B$ 合同。',
        formula: 'B=C^{T}AC',
      },
      {
        title: '标准形',
        body: '合同变换能把二次型化成只含平方项的形式。',
        formula: 'f=d_{1}y_{1}^{2}+\\cdots+d_{n}y_{n}^{2}',
      },
      {
        title: '惯性定理',
        body: '正项个数 $p$ 与负项个数 $q$ 与变换无关，只由二次型本身决定。',
        formula: 'p+q=r=\\mathrm{rank}(A)',
      },
      {
        title: '正定判据',
        body: '$p=n$ 即全为正平方项，二次型正定。',
      },
      {
        title: '指数数个数',
        body: '正负惯性指数数的是平方项的个数。',
      },
    ],
    pitfalls: [
      '把系数当惯性指数：惯性指数数的是项的个数。',
      '变换后指数变化：惯性指数是合同不变量。',
      '秩与指数混：秩等于正负指数之和。',
    ],
    example: {
      problem: '求 $f=x^{2}-y^{2}$ 的正负惯性指数与秩。',
      walkthrough: [
        '矩阵为 $\\mathrm{diag}(1,-1)$。',
        '正平方项 $1$ 个，负平方项 $1$ 个，所以 $p=1$、$q=1$。',
        '秩 $r=p+q=2$。',
        '既有正又有负，属于不定二次型。',
      ],
      result: 'p=1,\\ q=1,\\ r=2',
    },    moreExamples: [
      {
        problem: 'x 方减 y 方的正负惯性指数。',
        walkthrough: [
          '正项一个。',
          '负项一个。',
        ],
        result: 'p=1,\\,q=1',
      },
    ],

  },

  {
    id: 'inverse-adjugate',
    title: '伴随矩阵：行列式与逆的桥梁',
    tag: '线代',
    level: '基础',
    essence:
      '伴随矩阵由各元素的代数余子式拼成，核心恒等式 $AA^{*}=|A|I$ 把行列式和逆矩阵直接连起来。',
    definition:
      '逆矩阵满足乘积为单位矩阵。二阶矩阵的逆是主对调、副变号再除以行列式；一般情形用伴随矩阵除以行列式。',
    whenToUse: [
      '用公式法求逆矩阵',
      '求 $|A^{*}|$ 或 $A^{-1}$ 的行列式',
      '证明与伴随矩阵有关的恒等式',
    ],
    theorems: [
      {
        name: '逆与伴随',
        statement: '可逆矩阵的逆等于伴随矩阵除以行列式。',
        formula: 'A^{-1}=\\frac{1}{\\det A}A^{*}',
      },
      {
        name: '二阶逆矩阵',
        statement: '二阶矩阵主对角互换、副对角变号，再除以行列式。',
      },
    ],
    steps: [
      {
        title: '代数余子式',
        body: '划去第 $i$ 行第 $j$ 列后的行列式，再乘 $(-1)^{i+j}$。',
        formula: 'A_{ij}=(-1)^{i+j}M_{ij}',
      },
      {
        title: '拼成伴随矩阵',
        body: '把代数余子式排成矩阵后**转置**。',
        formula: 'A^{*}=(A_{ij})^{T}',
      },
      {
        title: '核心恒等式',
        body: '矩阵乘伴随矩阵等于行列式乘单位阵，这是所有公式的来源。',
        formula: 'AA^{*}=A^{*}A=|A|I',
      },
      {
        title: '求逆公式',
        body: '把恒等式两边除以 $|A|$ 就得到逆矩阵。',
        formula: 'A^{-1}=\\frac{1}{|A|}A^{*}',
      },
      {
        title: '先算行列式',
        body: '行列式为零则不可逆，后面都不必做。',
      },
    ],
    pitfalls: [
      '行列式为零仍求逆：不可逆。',
      '伴随矩阵位置放反：主对调、副变号。',
      '忘记除行列式：只写了伴随矩阵。',
    ],
    example: {
      problem: '已知 $A$ 是三阶矩阵且 $|A|=2$，求 $|A^{*}|$。',
      walkthrough: [
        '由 $AA^{*}=|A|I$ 两边取行列式：$|A||A^{*}|=|A|^{3}$。',
        '代入 $|A|=2$：$2|A^{*}|=8$。',
        '所以 $|A^{*}|=4$，正好等于 $|A|^{n-1}$。',
      ],
      result: '|A^{*}|=|A|^{n-1}=4',
    },    moreExamples: [
      {
        problem: '求一、二、三、五 的逆矩阵。',
        walkthrough: [
          '行列式为负一。',
          '主对调、副变号。',
          '除以行列式。',
        ],
        result: '\\begin{pmatrix}-5&2\\\\3&-1\\end{pmatrix}',
      },
    ],

  },
  {
    id: 'rank-nullity',
    title: '秩-零化度定理',
    tag: '线代',
    level: '进阶',
    essence:
      '矩阵的秩加上零空间的维数，等于未知数的个数：能确定的信息和自由变量的自由度刚好互补。',
    definition:
      '秩加零度等于定义域维数。秩是像的维数，零度是核的维数。这条公式把线性映射的信息压缩与丢失联系起来。',
    whenToUse: [
      '求齐次方程组基础解系的个数',
      '判断解空间的维数',
      '分析线性映射的「损失」',
    ],
    theorems: [
      {
        name: '秩零度定理',
        statement: '线性映射的像维数加核维数等于定义域维数。',
        formula: '\\dim V=\\operatorname{rank}T+\\dim\\ker T',
      },
      {
        name: '单射与满射',
        statement: '核为零等价于单射；像维数等于目标维数等价于满射。',
      },
    ],
    steps: [
      {
        title: '零空间',
        body: '所有满足 $Ax=0$ 的 $x$ 构成的空间，也叫核。',
        formula: 'N(A)=\\{x\\mid Ax=0\\}',
      },
      {
        title: '秩',
        body: '列空间的维数，等于矩阵化为阶梯形后非零行的个数。',
        formula: 'r=\\dim C(A)',
      },
      {
        title: '定理',
        body: '秩与零化度之和等于列数（未知数个数）。',
        formula: 'r+\\dim N(A)=n',
      },
      {
        title: '用途',
        body: '基础解系的个数就是 $n-r$，直接给出自由变量个数。',
      },
      {
        title: '秩与零度互补',
        body: '知道一个就能算另一个，别重复求解。',
      },
    ],
    pitfalls: [
      '把秩当零度：两者互补不是相等。',
      '忽略有限维前提：无限维情形公式不同。',
      '核算错：解齐次方程要写全基础解系。',
    ],
    example: {
      problem: '方程组 $x+y+z=0$ 的基础解系有几个向量？',
      walkthrough: [
        '系数矩阵是 $1\\times3$，秩 $r=1$。',
        '未知数个数 $n=3$。',
        '由秩-零化度定理，零空间维数 $=3-1=2$。',
        '所以基础解系有 $2$ 个向量，例如 $(1,-1,0)$ 与 $(1,0,-1)$。',
      ],
      result: '\\dim N(A)=n-r=2',
    },    moreExamples: [
      {
        problem: '三维空间到三维空间的映射核维数为一，像维数是多少。',
        walkthrough: [
          '秩加零度等于三。',
          '零度为一。',
          '像维数为二。',
        ],
        result: '2',
      },
    ],

  },
  {
    id: 'homogeneous-basis',
    title: '齐次方程组：基础解系怎么取',
    tag: '线代',
    level: '基础',
    essence:
      '化行最简形后，自由变量逐个取 $1$、其余取 $0$，就得到基础解系；通解是所有解的线性组合。',
    definition:
      '齐次线性方程组的解集是一个子空间，其基础解系就是这组解空间的一组基，向量个数等于未知数个数减系数矩阵的秩。',
    whenToUse: [
      '求齐次方程组的通解',
      '判断解空间维数',
      '求特征向量（本质就是齐次方程组）',
    ],
    theorems: [
      {
        name: '基础解系',
        statement: '齐次方程的基础解系含 n 减 r 个线性无关的解向量。',
        formula: '\\dim\\ker A=n-r(A)',
      },
      {
        name: '通解形式',
        statement: '齐次方程的通解是基础解系的任意线性组合。',
      },
    ],
    steps: [
      {
        title: '化行最简形',
        body: '把系数矩阵化成行最简形，确定主元列与自由列。',
      },
      {
        title: '数自由变量',
        body: '自由变量个数 $=n-r$。',
      },
      {
        title: '逐个取特值',
        body: '每个自由变量取 $1$、其余取 $0$，回代解出主元变量。',
      },
      {
        title: '写通解',
        body: '通解是基础解系的任意线性组合。',
        formula: 'x=c_{1}\\xi_{1}+\\cdots+c_{n-r}\\xi_{n-r}',
      },
      {
        title: '自由变量给参数',
        body: '自由变量取单位向量代入，得到基础解系。',
      },
    ],
    pitfalls: [
      '自由变量选取不当：要选能解出主元的自由变量。',
      '基础解系不独立：取出的向量必须线性无关。',
      '个数算错：等于未知数减秩。',
    ],
    example: {
      problem: '求 $x_{1}+x_{2}+x_{3}=0$ 的基础解系。',
      walkthrough: [
        '已是最简形，主元是 $x_{1}$，自由变量是 $x_{2},x_{3}$。',
        '令 $x_{2}=1,x_{3}=0$，得 $x_{1}=-1$，解向量 $(-1,1,0)$。',
        '令 $x_{2}=0,x_{3}=1$，得 $x_{1}=-1$，解向量 $(-1,0,1)$。',
        '基础解系就是这两个向量，通解是它们的线性组合。',
      ],
      result: '\\xi_{1}=(-1,1,0),\\ \\xi_{2}=(-1,0,1)',
    },    moreExamples: [
      {
        problem: '两行成比例的三元齐次方程组，基础解系含几个向量。',
        walkthrough: [
          '系数矩阵秩为一。',
          '未知数为三。',
          '基础解系含两个向量。',
        ],
        result: '2',
      },
    ],

  },
  {
    id: 'subspace-test',
    title: '子空间：三条判定',
    tag: '线代',
    level: '基础',
    essence:
      '子空间要满足：含零向量、对加法封闭、对数乘封闭；三条都过才是子空间。',
    definition:
      '子空间要求对加法与数乘封闭且含零向量。判断时逐条验证，缺一不可。',
    whenToUse: [
      '判断一个集合是不是子空间',
      '验证解空间、列空间的性质',
      '找出不满足封闭性的反例',
    ],
    theorems: [
      {
        name: '子空间判据',
        statement: '非空子集对加法与数乘封闭即为子空间。',
        formula: 'u,v\\in W\\;\\Rightarrow\\;u+v,\\lambda u\\in W',
      },
      {
        name: '解空间是子空间',
        statement: '齐次线性方程组的解集构成子空间。',
      },
    ],
    steps: [
      {
        title: '含零向量',
        body: '不含零向量的集合一定不是子空间。',
      },
      {
        title: '对加法封闭',
        body: '任取两个元素，和仍在集合内。',
        formula: 'x,y\\in V\\Rightarrow x+y\\in V',
      },
      {
        title: '对数乘封闭',
        body: '任一元素乘任意数仍在集合内。',
        formula: 'x\\in V,\\ k\\in\\mathbb{R}\\Rightarrow kx\\in V',
      },
      {
        title: '常见反例',
        body: '$\\{(x,y)\\mid x+y=1\\}$ 不含零向量，不是子空间；$\\{x\\mid x_{1}x_{2}=0\\}$ 对加法不封闭。',
      },
      {
        title: '先查零向量',
        body: '不含零向量的集合直接排除。',
      },
    ],
    pitfalls: [
      '漏验零向量：不含零的集合不是子空间。',
      '只验加法：数乘也要验。',
      '非齐次解集当子空间：不过原点，不是。',
    ],
    example: {
      problem: '判断 $V=\\{(x,y,z)\\mid x+y+z=0\\}$ 是否为 $\\mathbb{R}^{3}$ 的子空间。',
      walkthrough: [
        '零向量满足 $0+0+0=0$，在 $V$ 内。',
        '若 $x,y$ 都满足坐标和为 $0$，则 $x+y$ 的坐标和也是 $0$。',
        '数乘 $kx$ 的坐标和是 $k\\cdot0=0$。',
        '三条都满足，所以是子空间（其实是一个平面）。',
      ],
      result: '\\dim V=2',
    },    moreExamples: [
      {
        problem: '判断平面 x 加 y 等于一上的点集是否为子空间。',
        walkthrough: [
          '原点不满足方程。',
          '因此不含零向量。',
          '不是子空间。',
        ],
        result: '\\text{no}',
      },
    ],

  },
  {
    id: 'transition-matrix',
    title: '过渡矩阵：换基之后坐标怎么变',
    tag: '线代',
    level: '进阶',
    essence:
      '同一向量在不同基下的坐标不同；过渡矩阵 $P$ 把新坐标换成旧坐标，求逆就能反着换。',
    definition:
      '过渡矩阵把一组基下的坐标换到另一组基。它的列是新基向量在旧基下的坐标，坐标变换用它的逆。',
    whenToUse: [
      '两组基之间转换坐标',
      '求基变换矩阵',
      '理解相似矩阵的来源',
    ],
    theorems: [
      {
        name: '坐标变换',
        statement: '旧坐标等于过渡矩阵乘新坐标。',
        formula: 'x_{\\text{old}}=P\\,x_{\\text{new}}',
      },
      {
        name: '过渡矩阵可逆',
        statement: '两组基之间的过渡矩阵一定可逆。',
      },
    ],
    steps: [
      {
        title: '约定方向',
        body: '设新基 $\\beta_{1},\\dots,\\beta_{n}$ 由旧基 $\\alpha$ 线性表示，系数排成矩阵 $P$。',
        formula: '(\\beta_{1},\\dots,\\beta_{n})=(\\alpha_{1},\\dots,\\alpha_{n})P',
      },
      {
        title: '坐标变换',
        body: '新坐标左乘 $P$ 得到旧坐标。',
        formula: 'x_{\\text{old}}=P\\,x_{\\text{new}}',
      },
      {
        title: '反向',
        body: '旧坐标化新坐标要乘 $P^{-1}$。',
      },
      {
        title: '与相似的关系',
        body: '同一个线性变换在不同基下的矩阵满足相似关系。',
        formula: 'B=P^{-1}AP',
      },
      {
        title: '列写新基坐标',
        body: '过渡矩阵的列是新基在旧基下的坐标。',
      },
    ],
    pitfalls: [
      '方向搞反：列是新基在旧基下的坐标。',
      '忘记取逆：从新到旧要乘逆矩阵。',
      '基向量不是列：按行写会转置错。',
    ],
    example: {
      problem: '旧基 $e_{1},e_{2}$，新基 $\\beta_{1}=(1,1)$、$\\beta_{2}=(1,-1)$，向量旧坐标为 $(2,0)$，求新坐标。',
      walkthrough: [
        '$\\beta_{1}=e_{1}+e_{2}$，$\\beta_{2}=e_{1}-e_{2}$，过渡矩阵 $P=\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}$。',
        '旧坐标 $=P\\times$ 新坐标，所以新坐标 $=P^{-1}(2,0)^{T}$。',
        '$P^{-1}=\\frac{1}{-2}\\begin{pmatrix}-1&-1\\\\-1&1\\end{pmatrix}$，乘得 $(1,1)^{T}$。',
        '验证：$1\\cdot(1,1)+1\\cdot(1,-1)=(2,0)$。',
      ],
      result: 'x_{\\text{new}}=(1,1)^{T}',
    },    moreExamples: [
      {
        problem: '从标准基到一、一与一、零的过渡矩阵。',
        walkthrough: [
          '第一列写第一个新基向量。',
          '第二列写第二个。',
        ],
        result: '\\begin{pmatrix}1&1\\\\1&0\\end{pmatrix}',
      },
    ],

  },
  {
    id: 'eigen-properties',
    title: '特征值的性质：迹、行列式与无关性',
    tag: '线代',
    level: '基础',
    essence:
      '特征值之和等于迹，之积等于行列式；不同特征值对应的特征向量一定线性无关，这两条能省掉大量计算。',
    definition:
      '特征值满足迹等于和、行列式等于积；不同特征值的特征向量线性无关；实对称矩阵不同特征值的特征向量正交。',
    whenToUse: [
      '已知部分特征值反求另一个',
      '快速检查算出的特征值对不对',
      '判断特征向量组是否线性无关',
    ],
    theorems: [
      {
        name: '迹与行列式',
        statement: '特征值之和等于迹，之积等于行列式。',
        formula: '\\sum\\lambda_i=\\operatorname{tr}A,\\quad\\prod\\lambda_i=\\det A',
      },
      {
        name: '正交性',
        statement: '实对称矩阵属于不同特征值的特征向量互相正交。',
      },
    ],
    steps: [
      {
        title: '和等于迹',
        body: '所有特征值（含重数）之和等于对角线元素之和。',
        formula: '\\sum\\lambda_{i}=\\mathrm{tr}A',
      },
      {
        title: '积等于行列式',
        body: '所有特征值之积等于行列式，因此可逆等价于没有零特征值。',
        formula: '\\prod\\lambda_{i}=|A|',
      },
      {
        title: '无关性',
        body: '属于不同特征值的特征向量线性无关。',
      },
      {
        title: '多项式关系',
        body: '$A^{k}$ 的特征值是 $\\lambda_{i}^{k}$，$f(A)$ 是 $f(\\lambda_{i})$。',
        formula: '\\lambda(A^{k})=\\lambda^{k}',
      },
      {
        title: '迹与行列式速查',
        body: '特征值之和等于迹、之积等于行列式，可快速校验。',
      },
    ],
    pitfalls: [
      '迹当行列式：一个是和一个是积。',
      '同特征值的向量也当正交：只对不同特征值成立。',
      '复特征值忽略：实矩阵也可能有复特征值。',
    ],
    example: {
      problem: '$A$ 是三阶矩阵，特征值为 $1,2,x$，且 $|A|=24$，求 $x$。',
      walkthrough: [
        '特征值之积等于行列式：$1\\times2\\times x=24$。',
        '所以 $x=12$。',
        '顺便可得迹 $=1+2+12=15$，等于对角元之和。',
      ],
      result: 'x=12',
    },    moreExamples: [
      {
        problem: '二阶矩阵迹为二、行列式为负三，求特征值。',
        walkthrough: [
          '特征值之和为二。',
          '之积为负三。',
          '解二次方程得三与负一。',
        ],
        result: '3,\\,-1',
      },
    ],

  },
  {
    id: 'matrix-power',
    title: '用对角化算矩阵的高次幂',
    tag: '线代',
    level: '进阶',
    essence:
      '把矩阵对角化成 $A=P\\Lambda P^{-1}$ 后，$A^{k}=P\\Lambda^{k}P^{-1}$，而对角阵的幂只是对角元取幂。',
    definition:
      '求矩阵的高次幂，通常先对角化：把矩阵写成相似变换形式，幂就变成对角元的幂，再乘回去。',
    whenToUse: [
      '求矩阵的高次幂',
      '分析马尔可夫链的长期行为',
      '求递推数列的通项',
    ],
    theorems: [
      {
        name: '对角化求幂',
        statement: '若矩阵可对角化，则它的 n 次幂等于相似变换矩阵乘对角元 n 次幂再乘逆。',
        formula: 'A^{n}=P\\Lambda^{n}P^{-1}',
      },
      {
        name: '若尔当块求幂',
        statement: '不可对角化时用若尔当块，幂次由二项式展开给出。',
      },
    ],
    steps: [
      {
        title: '对角化',
        body: '求特征值与特征向量，拼出 $P$ 与 $\\Lambda$。',
        formula: 'A=P\\Lambda P^{-1}',
      },
      {
        title: '幂次公式',
        body: '中间每两个 $P^{-1}P$ 都消掉，只剩首尾。',
        formula: 'A^{k}=P\\Lambda^{k}P^{-1}',
      },
      {
        title: '对角阵求幂',
        body: '对角元各自取 $k$ 次幂。',
        formula: '\\Lambda^{k}=\\mathrm{diag}(\\lambda_{1}^{k},\\dots,\\lambda_{n}^{k})',
      },
      {
        title: '极限行为',
        body: '$|\\lambda_{i}|<1$ 的项随 $k$ 趋于零，主导项由最大特征值决定。',
      },
      {
        title: '对角化后求幂',
        body: 'A 的 n 次幂等于 P 乘对角元 n 次幂再乘 P 逆。',
      },
    ],
    pitfalls: [
      '忘记乘回逆矩阵：只算了对角部分。',
      '特征值幂次算错：对角元逐个取幂。',
      '不可对角化硬套：需要若尔当形。',
    ],
    example: {
      problem: '已知 $A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ 可对角化，特征值为 $3,1$，求 $A^{k}$ 的主导项。',
      walkthrough: [
        '特征向量 $\\lambda=3$ 对应 $(1,1)$，$\\lambda=1$ 对应 $(1,-1)$。',
        '$A^{k}=P\\mathrm{diag}(3^{k},1^{k})P^{-1}$。',
        '展开后 $A^{k}=\\frac{1}{2}\\begin{pmatrix}3^{k}+1&3^{k}-1\\\\3^{k}-1&3^{k}+1\\end{pmatrix}$。',
        '$k$ 很大时由 $3^{k}$ 主导。',
      ],
      result: 'A^{k}=\\tfrac{1}{2}\\begin{pmatrix}3^{k}+1&3^{k}-1\\\\3^{k}-1&3^{k}+1\\end{pmatrix}',
    },    moreExamples: [
      {
        problem: '求一、一、零、一 的三次幂。',
        walkthrough: [
          '矩阵是单位阵加幂零阵。',
          '幂零项三次以上为零。',
          '展开得结果。',
        ],
        result: '\\begin{pmatrix}1&3\\\\0&1\\end{pmatrix}',
      },
    ],

  },
  {
    id: 'orthogonal-diagonalization',
    title: '正交变换化二次型为标准形',
    tag: '线代',
    level: '进阶',
    essence:
      '二次型矩阵是对称阵，一定能被正交矩阵对角化；标准形的系数就是特征值，且变换保持长度。',
    definition:
      '实对称矩阵可用正交矩阵对角化：先求特征值与特征向量，重特征值的向量做施密特正交化，再单位化拼成正交矩阵。',
    whenToUse: [
      '化二次型为标准形且要求变换是正交的',
      '判断二次型类型（看特征值符号）',
      '求曲面主轴方向',
    ],
    theorems: [
      {
        name: '正交对角化',
        statement: '实对称矩阵存在正交矩阵 Q 使其对角化。',
        formula: 'Q^{T}AQ=\\Lambda',
      },
      {
        name: '谱定理',
        statement: '实对称矩阵的特征值全为实数，特征向量可取得标准正交。',
      },
    ],
    steps: [
      {
        title: '写出矩阵',
        body: '对称矩阵 $A$，副对角元取交叉项系数的一半。',
        formula: 'f=x^{T}Ax',
      },
      {
        title: '求特征值',
        body: '解 $|A-\\lambda I|=0$，对称阵的特征值全是实数。',
      },
      {
        title: '正交单位化',
        body: '把各特征值的特征向量正交化、单位化，拼成正交矩阵 $Q$。',
        formula: 'Q^{T}AQ=\\Lambda',
      },
      {
        title: '写标准形',
        body: '令 $x=Qy$，二次型化为 $\\lambda_{1}y_{1}^{2}+\\cdots+\\lambda_{n}y_{n}^{2}$。',
      },
      {
        title: '重根先正交化',
        body: '同一特征值的特征向量若不正交，先做施密特。',
      },
    ],
    pitfalls: [
      '重特征值忘记正交化：同特征值的向量未必正交。',
      '忘记单位化：正交矩阵要求列向量模长为一。',
      '顺序不一致：特征值与特征向量要对应。',
    ],
    example: {
      problem: '用正交变换化 $f=2x_{1}^{2}+2x_{2}^{2}+2x_{1}x_{2}$ 为标准形。',
      walkthrough: [
        '矩阵 $A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$。',
        '特征值 $3$ 与 $1$，对应单位特征向量 $\\frac{1}{\\sqrt2}(1,1)$ 与 $\\frac{1}{\\sqrt2}(1,-1)$。',
        '取 $Q$ 由这两个向量组成（正交矩阵）。',
        '标准形为 $3y_{1}^{2}+y_{2}^{2}$，正定。',
      ],
      result: 'f=3y_{1}^{2}+y_{2}^{2}',
    },    moreExamples: [
      {
        problem: '把二、一、一、二 正交对角化后对角元是什么。',
        walkthrough: [
          '特征值为三与负一。',
          '实对称矩阵可正交对角化。',
          '对角元即特征值。',
        ],
        result: '3,\\,-1',
      },
    ],

  },
  {
    id: 'rayleigh-quotient',
    title: '瑞利商：二次型在单位球上的极值',
    tag: '线代',
    level: '竞赛',
    essence:
      '二次型除以长度平方就是瑞利商，它的最大值是最小特征值对应的极值——最大特征值对应最大值，最小特征值对应最小值。',
    definition:
      '瑞利商是二次型除以内积，它的取值范围被最小与最大特征值夹住，极值恰在对应特征向量处取到。',
    whenToUse: [
      '求二次型在单位球上的最值',
      '估计矩阵特征值的范围',
      '证明与特征值有关的不等式',
    ],
    theorems: [
      {
        name: '瑞利商范围',
        statement: '对称矩阵的瑞利商介于最小与最大特征值之间。',
        formula: '\\lambda_{\\min}\\le\\frac{x^{T}Ax}{x^{T}x}\\le\\lambda_{\\max}',
      },
      {
        name: '极值点',
        statement: '瑞利商在对应特征向量处取到特征值。',
      },
    ],
    steps: [
      {
        title: '定义',
        body: '对非零向量 $x$，瑞利商是二次型与长度平方之比。',
        formula: 'R(x)=\\frac{x^{T}Ax}{x^{T}x}',
      },
      {
        title: '极值定理',
        body: '$R(x)$ 的最大值是最大特征值，最小值是最小特征值。',
        formula: '\\lambda_{\\min}\\le R(x)\\le\\lambda_{\\max}',
      },
      {
        title: '取到条件',
        body: '极值在对应的特征向量处取到。',
      },
      {
        title: '推广',
        body: '在正交约束下逐层求极值，可得到全部特征值（库朗-费舍尔定理）。',
      },
      {
        title: '极值在特征向量',
        body: '瑞利商的极值点就是特征向量，极值就是特征值。',
      },
    ],
    pitfalls: [
      '忘记归一化：瑞利商分母要除以内积。',
      '矩阵不对称时套用：结论针对实对称。',
      '把极值点当任意向量：必须是对应特征向量。',
    ],
    example: {
      problem: '求 $f=x_{1}^{2}+2x_{2}^{2}$ 在 $x_{1}^{2}+x_{2}^{2}=1$ 上的最大值与最小值。',
      walkthrough: [
        '矩阵为 $\\mathrm{diag}(1,2)$，特征值 $1$ 与 $2$。',
        '瑞利商的取值范围是 $[1,2]$。',
        '最大值 $2$ 在 $x=(0,1)$ 处取到，最小值 $1$ 在 $x=(1,0)$ 处取到。',
      ],
      result: '\\max=2,\\ \\min=1',
    },    moreExamples: [
      {
        problem: '单位矩阵的瑞利商恒为多少。',
        walkthrough: [
          '二次型等于内积。',
          '相除恒为一。',
        ],
        result: '1',
      },
    ],

  },

  {
    id: 'determinant-expansion',
    title: '行列式按行展开与范德蒙德',
    tag: '线代',
    level: '基础',
    essence:
      '行列式可以按任一行（列）展开成代数余子式的加权和；零多的行展开最省力，范德蒙德行列式则有现成公式。',
    definition:
      '行列式可按任一行或列展开：每个元素乘它的代数余子式再求和。选零多的行或列能大幅减少计算。',
    whenToUse: [
      '行列式中某行零特别多时',
      '证明行列式恒等式',
      '识别范德蒙德结构并直接写结果',
    ],
    theorems: [
      {
        name: '按行展开',
        statement: '行列式等于某行各元素与其代数余子式乘积之和。',
        formula: '\\det A=\\sum_{j}a_{ij}(-1)^{i+j}M_{ij}',
      },
      {
        name: '上三角行列式',
        statement: '上三角行列式等于对角元之积。',
      },
    ],
    steps: [
      {
        title: '按行展开',
        body: '沿第 $i$ 行展开：每个元素乘自己的代数余子式再相加。',
        formula: '|A|=\\sum_{j=1}^{n}a_{ij}A_{ij}',
      },
      {
        title: '选零多的行',
        body: '展开的工作量取决于该行非零元个数，先用性质制造零再展开。',
      },
      {
        title: '范德蒙德行列式',
        body: '每行是同一个数的幂次时，行列式等于所有「后者减前者」的乘积。',
        formula: 'V_{n}=\\prod_{1\\le i<j\\le n}(x_{j}-x_{i})',
      },
      {
        title: '推论',
        body: '$x_{1},\\dots,x_{n}$ 互不相同时范德蒙德行列式不为零。',
      },
      {
        title: '挑零多的行',
        body: '按含零最多的行或列展开，计算量最小。',
      },
    ],
    pitfalls: [
      '符号因子漏写：余子式前面要乘负一的幂。',
      '展开行与余子式不匹配：去掉的是该元素所在行列。',
      '不先用性质化简：直接展开计算量大且易错。',
    ],
    example: {
      problem: '计算 $\\begin{vmatrix}1&1&1\\\\x_{1}&x_{2}&x_{3}\\\\x_{1}^{2}&x_{2}^{2}&x_{3}^{2}\\end{vmatrix}$ 当 $x_{1}=1,x_{2}=2,x_{3}=3$。',
      walkthrough: [
        '这是三阶范德蒙德行列式。',
        '按公式等于 $(x_{2}-x_{1})(x_{3}-x_{1})(x_{3}-x_{2})$。',
        '代入得 $(2-1)(3-1)(3-2)=1\\times2\\times1=2$。',
      ],
      result: 'V_{3}=2',
    },    moreExamples: [
      {
        problem: '计算对角元为二、三、四的上三角行列式。',
        walkthrough: [
          '上三角行列式等于对角元之积。',
          '二乘三乘四。',
        ],
        result: '24',
      },
    ],

  },
  {
    id: 'elementary-matrix',
    title: '初等矩阵：行变换的矩阵形式',
    tag: '线代',
    level: '进阶',
    essence:
      '对单位矩阵做一次初等变换就得到初等矩阵；左乘它等于对目标矩阵做同样的行变换，这就是高斯消元的代数本质。',
    definition:
      '初等矩阵是对单位矩阵做一次初等变换得到的矩阵。左乘初等矩阵等于做一次行变换，右乘等于做列变换。',
    whenToUse: [
      '把行变换写成矩阵乘法',
      '求逆矩阵（初等变换法）',
      '理解初等矩阵都可逆且逆同类',
    ],
    theorems: [
      {
        name: '初等矩阵与变换',
        statement: '左乘初等矩阵对应一次行变换，可逆矩阵可写成初等矩阵的乘积。',
        formula: 'EA\\;\\text{= row operation}',
      },
      {
        name: '求逆的简便方法',
        statement: '把矩阵与单位矩阵并排做行变换，化成单位矩阵时右侧就是逆矩阵。',
      },
    ],
    steps: [
      {
        title: '三种初等变换',
        body: '交换两行、某行乘非零数、某行加上另一行的倍数。',
      },
      {
        title: '左乘即行变换',
        body: '初等矩阵左乘一个矩阵，等于对它做对应的行变换。',
        formula: 'PA',
      },
      {
        title: '初等矩阵都可逆',
        body: '三种变换都有逆操作，逆矩阵仍是同类型初等矩阵。',
      },
      {
        title: '求逆的方法',
        body: '对 $(A\\mid I)$ 做行变换化成 $(I\\mid A^{-1})$，就得到逆矩阵。',
        formula: '(A\\mid I)\\to(I\\mid A^{-1})',
      },
      {
        title: '左行右列',
        body: '左乘做行变换、右乘做列变换，别用反。',
      },
    ],
    pitfalls: [
      '左右乘搞混：左乘行变换、右乘列变换。',
      '变换次数记错：每次对应一个初等矩阵。',
      '非方阵谈初等矩阵逆：初等矩阵都可逆。',
    ],
    example: {
      problem: '用初等变换求 $A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$ 的逆。',
      walkthrough: [
        '写增广矩阵 $(A\\mid I)=\\begin{pmatrix}1&2&1&0\\\\3&4&0&1\\end{pmatrix}$。',
        '第二行减三倍第一行：$\\begin{pmatrix}1&2&1&0\\\\0&-2&-3&1\\end{pmatrix}$。',
        '第二行除以 $-2$，再消去第一行的第二列，得 $(I\\mid A^{-1})$。',
        '读出 $A^{-1}=\\begin{pmatrix}-2&1\\\\1.5&-0.5\\end{pmatrix}$。',
      ],
      result: 'A^{-1}=\\begin{pmatrix}-2&1\\\\1.5&-0.5\\end{pmatrix}',
    },    moreExamples: [
      {
        problem: '交换两行的初等矩阵行列式是多少？',
        walkthrough: [
          '交换两行使行列式变号。',
          '原单位矩阵行列式为一。',
        ],
        result: '-1',
      },
    ],

  },
  {
    id: 'linear-space',
    title: '线性空间：把 $\\mathbb{R}^{n}$ 抽象掉',
    tag: '线代',
    level: '进阶',
    essence:
      '线性空间是满足八条运算法则的集合，元素可以是多项式、矩阵、函数；$\\mathbb{R}^{n}$ 只是其中一个例子。',
    definition:
      '线性空间是定义了加法与数乘并满足八条公理的集合。它把向量、多项式、函数统一在同一套语言下。',
    whenToUse: [
      '判断多项式空间、矩阵空间的维数',
      '理解「向量」不必是数组',
      '证明抽象空间中的线性性质',
    ],
    theorems: [
      {
        name: '维数公式',
        statement: '有限维线性空间的任意两组基含相同个数的向量。',
      },
      {
        name: '子空间',
        statement: '子空间对加法与数乘封闭且含零元。',
      },
    ],
    steps: [
      {
        title: '两个运算',
        body: '加法与数乘，满足封闭、结合、交换、有零元、有负元、分配律等八条。',
      },
      {
        title: '典型例子',
        body: '次数不超过 $n$ 的多项式构成 $n+1$ 维空间；$m\\times n$ 矩阵构成 $mn$ 维空间。',
        formula: '\\dim P_{n}[x]=n+1',
      },
      {
        title: '基与坐标',
        body: '线性空间里同样有基、维数、坐标，理论与 $\\mathbb{R}^{n}$ 完全平行。',
      },
      {
        title: '同构',
        body: '同为 $n$ 维的线性空间都同构于 $\\mathbb{R}^{n}$。',
      },
      {
        title: '先查公理',
        body: '判断线性空间逐条验八条公理，考试常只考封闭性。',
      },
    ],
    pitfalls: [
      '只验封闭不验零元：零元是公理之一。',
      '把多项式空间当有限维：次数不设上限时是无限维。',
      '混淆加法与数乘：两种运算都要验。',
    ],
    example: {
      problem: '求次数不超过 $2$ 的多项式空间 $P_{2}[x]$ 的一组基与维数。',
      walkthrough: [
        '一般元素是 $a+bx+cx^{2}$。',
        '任何元素都能写成 $1$、$x$、$x^{2}$ 的线性组合。',
        '这三个多项式线性无关（比较系数即得）。',
        '所以它们构成一组基，维数是 $3$。',
      ],
      result: '\\dim P_{2}[x]=3',
    },    moreExamples: [
      {
        problem: '次数不超过一的多项式空间维数是多少。',
        walkthrough: [
          '基为一与 x。',
          '共两个基向量。',
        ],
        result: '2',
      },
    ],

  },
  {
    id: 'linear-transformation',
    title: '线性变换与它的矩阵',
    tag: '线代',
    level: '进阶',
    essence:
      '线性变换是保持加法与数乘的映射；选定一组基后，它被唯一地表示成一个矩阵，换基则矩阵相似。',
    definition:
      '线性变换保持加法与数乘。选定基后，线性变换对应一个矩阵，矩阵的列是基向量的像。',
    whenToUse: [
      '把几何变换写成矩阵',
      '求线性变换在给定基下的矩阵',
      '理解相似矩阵的几何含义',
    ],
    theorems: [
      {
        name: '矩阵表示',
        statement: '线性变换在给定基下的矩阵，其列是基向量像的坐标。',
      },
      {
        name: '复合与乘法',
        statement: '线性变换的复合对应矩阵乘法，顺序相反。',
      },
    ],
    steps: [
      {
        title: '定义',
        body: '保持加法与数乘：$T(x+y)=T(x)+T(y)$，$T(kx)=kT(x)$。',
      },
      {
        title: '矩阵表示',
        body: '把每个基向量的像用基表示，系数按列排成矩阵。',
        formula: 'T(\\alpha_{j})=\\sum_{i}a_{ij}\\alpha_{i}',
      },
      {
        title: '换基变相似',
        body: '同一变换在不同基下的矩阵相似。',
        formula: 'B=P^{-1}AP',
      },
      {
        title: '几何例子',
        body: '平面旋转、投影、伸缩都是线性变换，对应 $2\\times2$ 矩阵。',
      },
      {
        title: '列是像的坐标',
        body: '变换矩阵的列是基向量的像。',
      },
    ],
    pitfalls: [
      '基没定就谈矩阵：矩阵依赖基的选择。',
      '复合顺序搞反：先作用的在右边。',
      '把非线性映射当线性：平移不是线性变换。',
    ],
    example: {
      problem: '求平面绕原点旋转 $90^{\\circ}$ 的线性变换的矩阵。',
      walkthrough: [
        '取标准基 $e_{1}=(1,0)$、$e_{2}=(0,1)$。',
        '$e_{1}$ 旋转后变成 $(0,1)$，$e_{2}$ 变成 $(-1,0)$。',
        '把像按列排：$A=\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}$。',
        '这正是前面见过的正交矩阵，行列式为 $1$。',
      ],
      result: 'A=\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}',
    },    moreExamples: [
      {
        problem: '变换把 x、y 映到二 x、y，在标准基下的矩阵。',
        walkthrough: [
          '第一个基向量映到二、零。',
          '第二个映到零、一。',
        ],
        result: '\\begin{pmatrix}2&0\\\\0&1\\end{pmatrix}',
      },
    ],

  },

  {
    id: 'kernel-image',
    title: '核与像：线性变换的两把尺子',
    tag: '线代',
    level: '进阶',
    essence:
      '核是「被映成零」的向量集合，像是「能映出来的」向量集合；两者维数之和等于定义域维数，这是秩-零化度定理的几何版本。',
    definition:
      '核是映到零的向量集合，像是所有像的集合。核衡量丢失的信息，像衡量能到达的范围。',
    whenToUse: [
      '判断线性变换是否单射或满射',
      '求变换的核空间与像空间',
      '验证维数公式',
    ],
    theorems: [
      {
        name: '秩零度定理',
        statement: '核维数加像维数等于定义域维数。',
        formula: '\\dim\\ker T+\\dim\\operatorname{Im}T=\\dim V',
      },
      {
        name: '单射判据',
        statement: '核为零等价于映射是单射。',
      },
    ],
    steps: [
      {
        title: '核（零空间）',
        body: '映到零向量的所有输入，反映「信息损失」。',
        formula: '\\ker T=\\{x\\mid T(x)=0\\}',
      },
      {
        title: '像（值域）',
        body: '所有可能的输出构成的空间，等于矩阵的列空间。',
        formula: '\\mathrm{im}\\,T=\\{T(x)\\mid x\\in V\\}',
      },
      {
        title: '维数公式',
        body: '核的维数加像的维数等于定义域的维数。',
        formula: '\\dim\\ker T+\\dim\\mathrm{im}\\,T=\\dim V',
      },
      {
        title: '单射与满射',
        body: '核为零则单射；像等于目标空间则满射；有限维同维数时两者等价。',
      },
      {
        title: '核看零原像',
        body: '核是所有映到零的向量，解齐次方程即得。',
      },
    ],
    pitfalls: [
      '核与像混淆：一个在定义域，一个在目标空间。',
      '只算维数不算基：求核要写出基。',
      '忽略零向量：核至少含零向量。',
    ],
    example: {
      problem: '求 $T(x,y)=(x+y,\\\\ x-y)$ 的核与像。',
      walkthrough: [
        '令 $T(x,y)=(0,0)$：$x+y=0$ 且 $x-y=0$。',
        '两式相加得 $2x=0$，所以 $x=y=0$。',
        '核只有零向量，维数为 $0$。',
        '由维数公式，像的维数 $=2-0=2$，即整个 $\\\\mathbb{R}^{2}$，是满射。',
      ],
      result: '\\\\ker T=\\\\{0\\\\},\\\\ \\\\dim\\\\mathrm{im}\\\\,T=2',
    },    moreExamples: [
      {
        problem: '变换 x、y 映到 x 加 y、零 的核维数。',
        walkthrough: [
          '解 x 加 y 等于零。',
          '解空间是一维。',
        ],
        result: '1',
      },
    ],

  },
  {
    id: 'isomorphism',
    title: '同构：维数相同就本质相同',
    tag: '线代',
    level: '进阶',
    essence:
      '两个线性空间之间存在可逆的线性映射，就叫同构；有限维下只需维数相等，因此所有 $n$ 维空间都同构于 $\\\\mathbb{R}^{n}$。',
    definition:
      '同构是可逆的线性映射，保持加法与数乘。同维数的有限维空间都同构。',
    whenToUse: [
      '判断两个空间是否「本质上一样」',
      '把抽象空间的问题搬到 $\\\\mathbb{R}^{n}$ 计算',
      '理解坐标映射的意义',
    ],
    theorems: [
      {
        name: '同构判据',
        statement: '有限维空间同构当且仅当维数相同。',
        formula: 'V\\cong W\\;\\Leftrightarrow\\;\\dim V=\\dim W',
      },
      {
        name: '同构保持结构',
        statement: '同构把基映成基，把线性关系原样保留。',
      },
    ],
    steps: [
      {
        title: '定义',
        body: '存在线性双射 $T:V\\\\to W$，就称 $V$ 与 $W$ 同构。',
        formula: 'V\\\\cong W',
      },
      {
        title: '有限维判据',
        body: '有限维下，同构当且仅当维数相等。',
        formula: '\\\\dim V=\\\\dim W',
      },
      {
        title: '坐标映射',
        body: '取一组基，每个向量对应它的坐标向量，这就是到 $\\\\mathbb{R}^{n}$ 的同构。',
      },
      {
        title: '意义',
        body: '同构保持线性运算，所以抽象空间的问题都能翻译成矩阵问题。',
      },
      {
        title: '同维即同构',
        body: '有限维空间只看维数是否相同。',
      },
    ],
    pitfalls: [
      '只看元素个数：无限集也可能同构。',
      '把同构当相等：同构是结构相同，元素不同。',
      '忘记线性：同构首先是线性映射。',
    ],
    example: {
      problem: '判断 $P_{2}[x]$ 与 $\\\\mathbb{R}^{3}$ 是否同构。',
      walkthrough: [
        '$P_{2}[x]$ 的基是 $1,x,x^{2}$，维数为 $3$。',
        '$\\\\mathbb{R}^{3}$ 的维数也是 $3$。',
        '映射 $a+bx+cx^{2}\\\\mapsto(a,b,c)$ 是线性双射。',
        '所以两者同构。',
      ],
      result: 'P_{2}[x]\\\\cong\\\\mathbb{R}^{3}',
    },    moreExamples: [
      {
        problem: '二维实空间与一次多项式空间是否同构。',
        walkthrough: [
          '两者维数都是二。',
          '因此同构。',
        ],
        result: '\\text{yes}',
      },
    ],

  },
  {
    id: 'derivative-sign',
    title: '导数符号：单调区间与极值怎么定',
    tag: '导数应用',
    level: '基础',
    essence:
      '单调性只看导数的正负，极值只看导数变号。做题顺序永远是：定义域 → 求导 → 分解 → 找临界点 → 列表判号。',
    definition:
      '导数符号决定单调性：正为增、负为减、零为驻点。结合二阶导或符号变化可判定极大极小。',
    whenToUse: [
      '求函数的单调区间、极值、闭区间最值',
      '证明不等式（把不等式变成函数的最值问题）',
      '判断方程有几个根（靠单调性和端点值）',
    ],
    theorems: [
      {
        name: '单调性判据',
        statement: '区间内导数恒正则函数递增，恒负则递减。',
        formula: 'f^{\\prime}>0\\;\\Rightarrow\\;\\text{increasing}',
      },
      {
        name: '极值第一充分条件',
        statement: '驻点两侧导数变号，则取极值：正变负为极大，负变正为极小。',
      },
    ],
    steps: [
      {
        title: '先定定义域',
        body: '所有结论都只在定义域内成立。分式要求分母不为零，根式要求根号内非负，对数要求真数为正。',
      },
      {
        title: '求导并因式分解',
        body: '导函数写成乘积形式，符号才好判断；能分解就一定要分解。',
        formula: "f'(x)=3x^{2}-3=3(x-1)(x+1)",
      },
      {
        title: '找临界点',
        body: '临界点有两类：导数为零的驻点，以及导数不存在的点。两类都要列出来，不能只解方程。',
      },
      {
        title: '列表判号',
        body: '用临界点把定义域切成若干段，每段取一个测试点判断导数正负，得到单调区间。',
      },
      {
        title: '定极值',
        body: '导数左正右负为极大值，左负右正为极小值。二阶导判据更快：二阶导小于零时取极大，大于零时取极小。',
      },
      {
        title: '闭区间比端点',
        body: '求最值时把驻点和两个端点的函数值都算出来比较，最大者即最大值。',
      },
    ],
    pitfalls: [
      '只看驻点：导数不存在的点也可能是极值点。',
      '变号判断错：要比较左右两侧符号。',
      '把驻点都当极值：不变号的驻点不是极值。',
    ],
    example: {
      problem: '求 f(x) = x³ − 3x 的单调区间与极值。',
      walkthrough: [
        '定义域是全体实数。',
        '求导得 3x² − 3，分解为 3(x − 1)(x + 1)。',
        '驻点为 x = −1 与 x = 1。',
        '在 (−∞, −1) 上导数为正，函数递增；在 (−1, 1) 上导数为负，递减；在 (1, +∞) 上导数为正，递增。',
        'x = −1 处导数由正变负，取极大值 2；x = 1 处由负变正，取极小值 −2。',
      ],
      result: '递增区间 (−∞, −1) 与 (1, +∞)，递减区间 (−1, 1)，极大值 2，极小值 −2。',
    },    moreExamples: [
      {
        problem: '求三次多项式减三倍自变量的极值。',
        walkthrough: [
          '导数等于零得两个驻点。',
          '判断两侧符号变化。',
          '一个极大一个极小。',
        ],
        result: '2,\\,-2',
      },
    ],

  },
  {
    id: 'recurrence-general-term',
    title: '递推数列：三步求出通项',
    tag: '数列',
    level: '进阶',
    essence:
      '递推题的难点不在算，而在第一步认结构。先看相邻项之间是差、是比、还是系数关系，再决定用累加、累乘还是待定系数。',
    definition:
      '递推数列求通项的常用手法：一阶线性递推用待定系数化为等比，分式递推可试不动点，二阶线性递推用特征方程。',
    whenToUse: [
      '给出首项与相邻项关系，要求通项',
      '判断数列是等差还是等比',
      '先求通项再求前 n 项和',
    ],
    theorems: [
      {
        name: '一阶线性递推',
        statement: '形式为下一项等于 a 倍当前项加 b 的递推，可平移成等比数列。',
        formula: 'a_{n+1}=aa_{n}+b',
      },
      {
        name: '特征方程法',
        statement: '二阶线性递推的通项由特征根决定，两根不同为两个指数的组合。',
      },
    ],
    steps: [
      {
        title: '写成标准形式',
        body: '把递推式整理成相邻两项的关系，常数项和系数各自归位，不要一上来就代数字试。',
      },
      {
        title: '看形状选方法',
        body: '相邻两项之差可求和时用累加法；之比可求积时用累乘法；形如后一项等于系数乘前一项再加常数时，用待定系数构造等比。',
      },
      {
        title: '构造等比数列',
        body: '当系数不为 1 时，两边同加一个常数，使新数列成为等比。解出这个常数，问题就化归成等比数列。',
      },
      {
        title: '写通项并回代检验',
        body: '算出等比部分后减回常数得到通项，再代入首项检验一次，防止平移量算错。',
      },
      {
        title: '不动点平移',
        body: '把递推平移到不动点，就化成等比数列。',
      },
    ],
    pitfalls: [
      '平移量算错：不动点是 b 除以一减 a。',
      '初值代入错：求出的常数要用首项确定。',
      '特征根重根：重根要给一项乘 n。',
    ],
    example: {
      problem: '数列满足首项为 1，后一项等于前一项的 2 倍再加 3，求通项。',
      walkthrough: [
        '这是系数加常数的形式，用待定系数构造等比。',
        '设两边同加 3，可验证新数列每项恰好是前一项的 2 倍。',
        '新数列首项为 4，公比为 2，所以第 n 项是 4 乘 2 的 n 减 1 次方。',
        '减去 3 得通项，代入 n = 1 得到 1，与已知一致。',
      ],
      result: '通项为 2 的 n 加 1 次方再减 3。',
    },    moreExamples: [
      {
        problem: '首项为一，下一项等于二倍当前项加三，求通项。',
        walkthrough: [
          '不动点为负三。',
          '平移后成等比数列。',
          '公比为二。',
          '整理得通项。',
        ],
        result: '2^{n+1}-3',
      },
    ],

  },
  {
    id: 'line-integral',
    title: '曲线积分：第一类与第二类怎么分',
    tag: '曲线与曲面积分',
    level: '进阶',
    essence:
      '两类曲线积分的区别只在微小元：乘弧长 ds 的第一类与方向无关，乘坐标 dx、dy 的第二类换个方向就变号。做法都是先把曲线参数化。',
    definition:
      '第一类曲线积分对弧长积分，与方向无关；第二类对坐标积分，方向相反则变号。计算时都要先参数化曲线。',
    whenToUse: [
      '积分号后面跟 ds，是求质量、质心一类的第一类',
      '积分号后面跟 dx 与 dy 的组合，是求做功、环流一类的第二类',
      '能用格林公式把闭曲线积分换成二重积分时',
    ],
    theorems: [
      {
        name: '第一类化定积分',
        statement: '参数化后代入被积函数并乘弧长微元。',
        formula: '\\int_{L}f\\,ds=\\int_{\\alpha}^{\\beta}f(x(t),y(t))\\sqrt{x^{\\prime 2}+y^{\\prime 2}}\\,dt',
      },
      {
        name: '第二类与方向',
        statement: '第二类曲线积分换方向要变号，这是它与第一类的本质区别。',
      },
    ],
    steps: [
      {
        title: '先认类型',
        body: '看微分元。含弧长元的是第一类，值与曲线方向无关；含坐标微分的是第二类，反向走一遍会差一个负号。',
      },
      {
        title: '参数化曲线',
        body: '把曲线写成参数方程，参数范围要覆盖整条曲线；闭曲线通常取逆时针。',
      },
      {
        title: '换掉微分元',
        body: '第一类把弧长元换成参数导数的模乘以参数微分；第二类把坐标微分分别对参数求导。',
        formula: 'ds=\\sqrt{x^{\\prime 2}+y^{\\prime 2}}\\,dt',
      },
      {
        title: '化成定积分算',
        body: '参数化之后只剩一个变量，按普通定积分算。闭曲线且满足条件时，用格林公式换成二重积分往往更快。',
        formula: '\\oint_{L}P\\,dx+Q\\,dy=\\iint_{D}(Q_{x}-P_{y})\\,d\\sigma',
      },
      {
        title: '先参数化',
        body: '两类曲线积分都先写出参数方程，再套各自的微元。',
      },
    ],
    pitfalls: [
      '两类混淆：第一类乘弧长，第二类乘坐标微分。',
      '参数区间写反：第二类会差符号。',
      '弧长微元漏项：根号里两个导数平方都要。',
    ],
    example: {
      problem: '计算沿单位圆逆时针方向的积分，被积式为 x 乘 dy 减去 y 乘 dx。',
      walkthrough: [
        '这是第二类曲线积分，先把圆参数化：余弦作 x，正弦作 y，参数从 0 到 2π。',
        '分别求微分，代入后被积式化简为 1。',
        '于是积分变成对参数 1 的积分，区间长度是 2π。',
        '也可以用格林公式验证：被积函数对应区域的二重积分等于 2 倍面积，单位圆面积是 π。',
      ],
      result: '结果为 2π。',
    },    moreExamples: [
      {
        problem: '求 x 沿直线 y 等于 x 从零到一的第一类曲线积分。',
        walkthrough: [
          '参数化后用 x 作参数。',
          '弧长微元为根号二 dx。',
          '积分得二分之根号二。',
        ],
        result: '\\frac{\\sqrt{2}}{2}',
      },
    ],

  },
  {
    id: 'triple-integral',
    title: '三重积分：柱坐标还是球坐标',
    tag: '重积分',
    level: '进阶',
    essence:
      '选坐标系看区域形状：绕轴旋转的柱体用柱坐标，球形或锥形用球坐标，棱角分明的长方体用直角坐标切片。选对了，限就好定。',
    definition:
      '三重积分是空间区域上的积分：把区域切成小体积块，用函数值乘体积求和再取极限。计算时化成累次积分，坐标系的选择取决于区域形状与被积函数。',
    whenToUse: [
      '求空间立体的质量、质心、转动惯量',
      '被积函数含 x 方加 y 方，或区域是旋转体',
      '区域是球、半球、锥与球之间',
    ],
    theorems: [
      {
        name: '柱坐标体积元',
        statement: '绕轴旋转的区域用柱坐标，体积元多一个径向因子。',
        formula: 'dV=r\\,dr\\,d\\theta\\,dz',
      },
      {
        name: '球坐标体积元',
        statement: '球形或锥形区域用球坐标，体积元多径向平方与正弦。',
        formula: 'dV=r^{2}\\sin\\varphi\\,dr\\,d\\varphi\\,d\\theta',
      },
    ],
    steps: [
      {
        title: '画区域再定序',
        body: '先想清楚区域的上下界，再决定按哪个变量先积。直角坐标下常用先一后二或先二后一。',
      },
      {
        title: '看对称性省一半',
        body: '区域关于坐标面对称、被积函数是奇函数时，积分直接为零；偶函数时算一半再乘二。',
      },
      {
        title: '换坐标要带雅可比',
        body: '柱坐标的体积元多一个径向因子；球坐标多一个径向平方和正弦因子。漏掉这个因子是这类题最常见的错。',
        formula: 'dV=r\\,dr\\,d\\theta\\,dz\\quad dV=r^{2}\\sin\\varphi\\,dr\\,d\\varphi\\,d\\theta',
      },
      {
        title: '定限后逐层积分',
        body: '由内向外逐层积，每层上限只含外层变量。上限写错时回头检查区域的边界描述。',
      },
      {
        title: '先画区域再定限',
        body: '画清楚区域形状再确定各层上下限，能避免限写反。',
      },
    ],
    pitfalls: [
      '漏掉雅可比因子：柱坐标少乘 r、球坐标少乘 r 方正弦，结果会差一大截。',
      '积分限写反：内层上限只能含外层变量。',
      '对称性用错：被积函数是奇函数才可直接判零。',
    ],
    example: {
      problem: '计算区域为上半单位球时，被积函数取 z 的三重积分。',
      walkthrough: [
        '区域是半球，用球坐标最省事：径向从 0 到 1，极角从 0 到 π 的一半，方位角一整圈。',
        '被积函数 z 换成径向乘余弦，体积元带径向平方与正弦。',
        '三个积分分别算出：方位角给 2π，极角给二分之一，径向给四分之一。',
        '三者相乘得到最终结果。',
      ],
      result: '结果为 π/4。',
    },    moreExamples: [
      {
        problem: '求单位球内被积函数取 1 的三重积分。',
        walkthrough: [
          '球坐标下径向从零到一、极角零到圆周率、方位角一整圈。',
          '体积元带径向平方与正弦。',
          '三个积分相乘。',
          '结果为三分之四倍圆周率。',
        ],
        result: '\\frac{4\\pi}{3}',
      },
    ],

  },
  {
    id: 'compactness',
    title: '紧致性：连续函数为什么一定有最大值',
    tag: '拓扑',
    level: '进阶',
    essence:
      '紧致性是有限性的无限版：任意开覆盖都能砍到有限个。连续映射保紧致，于是闭区间上的连续函数必然有界并取到最值。',
    definition:
      '紧致性指每个开覆盖都有有限子覆盖。欧氏空间中紧致等价于有界闭。连续函数在紧集上取到最值。',
    whenToUse: [
      '要证明某个函数在区域上取到最大值或最小值',
      '判断一个空间是否紧致（有界闭区间是最典型的例子）',
      '想把有限情形的结论推广到无限集合',
    ],
    theorems: [
      { name: '海涅－博雷尔', statement: '欧氏空间中紧致等价于有界闭。', },
      { name: '连续保紧', statement: '紧集的连续像是紧集。', },
    ],
    steps: [
      {
        title: '用开覆盖定义',
        body: '一个空间紧致，指任意一族开集只要覆盖了它，就存在有限个已经覆盖它。这是把有限性抽象出来。',
        formula: 'X=\\bigcup_{i\\in I}U_i\\;\\Rightarrow\\;X=\\bigcup_{k=1}^{n}U_{i_k}',
      },
      {
        title: '记住典型例子',
        body: '实数轴上的有界闭区间紧致，这是海涅－博雷尔定理；开区间与无界闭集都不紧致。',
      },
      {
        title: '连续映射保紧致',
        body: '连续像保持紧致性，这是最大值存在的核心：紧致集的连续像紧致，而实数中的紧致集有界且闭。',
      },
      {
        title: '推出极值存在',
        body: '有界闭集上的连续函数既取到上确界也取到下确界，所以最大值与最小值都存在。',
      },
      {
        title: '用有界闭判据',
        body: '欧氏空间先验有界与闭，能快速判断紧致性。',
      },
    ],
    pitfalls: ['把有界当紧：还需闭。', '只验一个覆盖：要对所有开覆盖。', '在非欧空间套用有界闭判据。'],
    example: {
      problem: '说明闭区间上的连续函数一定有最大值。',
      walkthrough: [
        '闭区间是有界闭集，因此紧致。',
        '函数连续，于是区间在函数下的像也紧致。',
        '实数中的紧致集有界且闭，所以像集有上确界并且取得到。',
        '这个取到的上确界就是最大值。',
      ],
      result: '连续函数在闭区间上必取到最大值与最小值。',
    },    moreExamples: [{ problem: '开区间零到一紧致吗？', walkthrough: ['不闭。', '不是紧集。'], result: '不紧致' }],

  },
  {
    id: 'group-homomorphism',
    title: '群同态：核与商群在做什么',
    tag: '抽象代数',
    level: '进阶',
    essence:
      '同态是保持运算的映射，核衡量它丢掉了多少信息。把核压成一个点得到商群，同态就变成单射，这就是第一同构定理。',
    definition:
      '群同态是保持运算的映射。核是映到单位元的元素集合，像是子群，二者由第一同构定理联系。',
    whenToUse: [
      '两个群结构相似，想说明它们差在哪',
      '构造商群、判断子群是否正规',
      '把复杂的群化归成简单的已知群',
    ],
    theorems: [
      { name: '第一同构定理', statement: '商群同构于同态的像。', formula: 'G/\\ker\\varphi\\cong\\operatorname{Im}\\varphi' },
      { name: '核是正规子群', statement: '同态的核总是正规子群。', },
    ],
    steps: [
      {
        title: '验证保运算',
        body: '群同态要求先乘再映等于先映再乘；再保持单位元与逆元。',
        formula: '\\varphi(ab)=\\varphi(a)\\varphi(b)',
      },
      {
        title: '算核与像',
        body: '核是被映到单位元的元素，像落在目标群里。核一定是正规子群，这是能作商的关键。',
      },
      {
        title: '用第一同构定理',
        body: '商掉核之后，源群与像同构。关于同态的问题基本都能化到这句话。',
        formula: 'G/\\ker\\varphi\\;\\cong\\;\\mathrm{im}\\,\\varphi',
      },
      {
        title: '对照整数取模',
        body: '整数群到 n 阶循环群的取模映射是最标准的例子：核是 n 的倍数，商群就是 n 阶循环群。',
      },
      {
        title: '算核与像',
        body: '先求核判断单射，再求像判断满射。',
      },
    ],
    pitfalls: ['核与像混淆：一个在定义域，一个在陪域。', '以为核总是平凡：非单同态核非平凡。', '忽略正规性：商群需要正规子群。'],
    example: {
      problem: '整数群通过取模映射映到六阶循环群，求核与商群。',
      walkthrough: [
        '取模映射保持加法，因此是同态。',
        '被映到零的元素正是 6 的倍数，所以核是 6 的整数倍集合。',
        '由第一同构定理，整数群除以 6 的倍数，与六阶循环群同构。',
      ],
      result: '核是 6 的倍数全体，商群同构于六阶循环群。',
    },    moreExamples: [{ problem: '模六到模三的约化映射核是什么？', walkthrough: ['映到零的元素是零与三。', '核有两个元素。'], result: '两元素子群' }],

  },
  {
    id: 'lebesgue-integral',
    title: '勒贝格积分：先切值域再测面积',
    tag: '测度论',
    level: '竞赛',
    essence:
      '黎曼积分切定义域，勒贝格积分切值域：先看函数取到哪些值，再测这些值的原像有多大。这样极限与积分可以交换次序。',
    definition:
      '勒贝格积分先对简单函数定义，再用上确界推广到非负可测函数，最后拆正负部处理一般函数。',
    whenToUse: [
      '函数太病态，黎曼不可积但仍想定义积分',
      '需要把极限搬到积分号内（单调收敛、控制收敛）',
      '概率论里把期望写成积分',
    ],
    theorems: [
      { name: '单调收敛', statement: '非负单调递增函数列可交换极限与积分。', },
      { name: '控制收敛', statement: '被可积函数控制时可交换。', },
    ],
    steps: [
      {
        title: '先有测度',
        body: '给集合指定大小的函数叫测度，要求空集为零、可列可加。区间长度是最基本的例子。',
      },
      {
        title: '再要可测函数',
        body: '函数在每个水平以下的原像都是可测集，这样的函数才谈得上积分。连续函数都满足。',
      },
      {
        title: '用简单函数逼近',
        body: '先用只取有限个值的简单函数求和式逼近，再取上确界定义积分；非负可测函数是这套定义的起点。',
        formula: '\\int f\\,d\\mu=\\sup\\left\\{\\sum_k a_k\\,\\mu(A_k)\\right\\}',
      },
      {
        title: '拿走收敛定理',
        body: '单调收敛定理与控制收敛定理，是这套积分比黎曼积分好用的真正原因：极限和积分可以换位置。',
      },
      {
        title: '先拆正负部',
        body: '一般可测函数拆成正部与负部，分别积分再相减。',
      },
    ],
    pitfalls: ['把黎曼可积当勒贝格：反之才成立。', '忽略零测集：不影响积分值。', '随意交换极限与积分：需定理保证。'],
    example: {
      problem: '说明有理数集上取 1、无理数上取 0 的函数在闭区间上的积分。',
      walkthrough: [
        '这个函数在闭区间上黎曼不可积：任何分割上下和的差都很大。',
        '但从测度看，有理数集可数、测度为零，无理数测度就是整个区间长度。',
        '按勒贝格积分，非零的那部分只在零测集上，所以积分等于零。',
      ],
      result: '勒贝格积分等于 0，与黎曼积分形成对比。',
    },    moreExamples: [{ problem: '有理数取一、无理数取零的函数积分？', walkthrough: ['有理数集零测。', '积分为零。'], result: '0' }],

  },
  {
    id: 'np-reduction',
    title: '归约：怎么证明一个问题很难',
    tag: '计算复杂性',
    level: '竞赛',
    essence:
      '证明一个新问题难，不需要从头论证，只要把已知的难问题在多项式时间内变成它。这种“搬运难度”的手法就是归约。',
    definition:
      '归约是把一个问题实例在多项式时间内改造成另一个问题实例，并保持答案一致。用它传递难度。',
    whenToUse: [
      '想说明某问题是 NP 困难的',
      '设计算法前判断问题有没有希望多项式求解',
      '做算法题时把陌生问题化归成熟悉的模型',
    ],
    theorems: [
      { name: '归约传递性', statement: '多项式归约可复合。', },
      { name: 'NP 完全定义', statement: '属于 NP 且所有 NP 问题可归约到它。', },
    ],
    steps: [
      {
        title: '先把问题写成判定形式',
        body: '复杂度理论讨论的是“是或否”的问题。优化问题要先改成“是否存在不超过某值的解”。',
      },
      {
        title: '定义多项式归约',
        body: '若能把问题甲的任意实例在多项式时间内改造成问题乙的实例，且两者答案一致，就记作甲归约到乙。',
      },
      {
        title: '背会第一个硬骨头',
        body: '布尔可满足性问题是 NP 完全的，这是库克－列文定理。之后所有 NP 完全性都从它出发。',
      },
      {
        title: '串起归约链',
        body: '可满足性归约到三元可满足性，再归约到团、顶点覆盖、哈密顿回路，形成一张难度地图。',
      },
      {
        title: '检查两方向',
        body: '归约要保证「原实例是」当且仅当「新实例是」，两个方向都要验。',
      },
    ],
    pitfalls: ['归约方向反：要从已知难问题归约到新问题。', '忽略多项式时间：指数量级归约无意义。', '答案不一致：归约必须保持等价。'],
    example: {
      problem: '说明“找最大团”至少和三元可满足性一样难。',
      walkthrough: [
        '把每个三元子句看成一组可以同时为真的文字。',
        '为每个文字建一个顶点，同一子句内的顶点相连，不同子句之间只连不冲突的文字。',
        '这个构造是多项式时间的，且子句可满足等价于图中有对应大小的团。',
        '于是三元可满足性归约到团问题，团问题是 NP 困难的。',
      ],
      result: '团问题是 NP 完全的。',
    },    moreExamples: [{ problem: '要证新问题 NP 困难，归约方向？', walkthrough: ['从已知 NP 完全问题出发。', '归约到新问题。'], result: '已知难问题 → 新问题' }],

  },
  {
    id: 'law-of-large-numbers',
    title: '大数定律与中心极限：平均值为什么稳定',
    tag: '概率',
    level: '进阶',
    essence:
      '大数定律说平均值会稳定到期望；中心极限定理更进一步，说明偏离期望的波动近似正态，且幅度是根号 n 分之一。',
    definition:
      '大数定律说样本均值依概率收敛到期望；中心极限定理进一步说明标准化后的均值趋向标准正态，误差阶是根号 n 分之一。',
    whenToUse: [
      '用频率估计概率，想知道要多少次才够准',
      '把二项分布近似成正态分布做计算',
      '估计样本均值的误差范围',
    ],
    theorems: [
      {
        name: '切比雪夫不等式',
        statement: '偏离期望超过 k 倍标准差的概率不超过 k 平方分之一。',
        formula: 'P(|X-\\mu|\\ge k\\sigma)\\le\\frac{1}{k^{2}}',
      },
      {
        name: '中心极限定理',
        statement: '独立同分布样本的标准化均值趋于标准正态分布。',
        formula: '\\frac{\\bar X-\\mu}{\\sigma/\\sqrt{n}}\\Rightarrow N(0,1)',
      },
    ],
    steps: [
      {
        title: '先算期望与方差',
        body: '独立同分布样本的均值，期望不变，方差被样本量缩成原来的 n 分之一。',
        formula: 'E\\bar X=\\mu,\\quad D\\bar X=\\frac{\\sigma^{2}}{n}',
      },
      {
        title: '用切比雪夫兜底',
        body: '只要方差有限，均值的偏离概率就有上界，这给出大数定律最朴素的证明。',
        formula: 'P(|\\bar X-\\mu|\\ge\\varepsilon)\\le\\frac{\\sigma^{2}}{n\\varepsilon^{2}}',
      },
      {
        title: '再上中心极限定理',
        body: '标准化之后，均值的分布趋向标准正态。这是把“稳定”升级成“误差可算”的关键一步。',
        formula: '\\frac{\\bar X-\\mu}{\\sigma/\\sqrt{n}}\\Rightarrow N(0,1)',
      },
      {
        title: '据此做近似计算',
        body: '二项分布当 n 大时用正态近似：均值 np，标准差是根号下 np 乘 1 减 p。',
      },
      {
        title: '先算期望方差',
        body: '均值方差是总体方差除以样本量。',
      },
    ],
    pitfalls: [
      '把依概率收敛当必然：大数定律说的是概率意义。',
      '样本量估算忽略根号：误差按根号 n 缩小。',
      '方差无限仍套用：需要有限方差的正态近似。',
    ],
    example: {
      problem: '抛 100 次均匀硬币，用正态近似估计正面次数落在 45 到 55 之间的概率。',
      walkthrough: [
        '单次期望是一半，方差是四分之一，所以 100 次的期望是 50、方差是 25。',
        '标准差为 5，把 45 与 55 分别标准化得到负 1 与正 1。',
        '标准正态在负 1 到正 1 之间的概率约百分之六十八。',
        '因此所求概率约为 0.68，比精确计算略粗略但足够直觉。',
      ],
      result: '约为 0.68。',
    },    moreExamples: [
      {
        problem: '抛一百次均匀硬币，正面次数的标准差。',
        walkthrough: [
          '这是二项分布。',
          '标准差等于根号下 n p 一减 p。',
        ],
        result: '5',
      },
    ],

  },
  {
    id: 'parameter-estimation',
    title: '参数估计：点估计与区间估计',
    tag: '概率',
    level: '进阶',
    essence:
      '点估计给一个数，区间估计给一个范围和一个置信度。评价点估计看有没有系统性偏差（无偏）与波动大小（有效性）。',
    definition:
      '点估计给一个数，区间估计给范围与置信度。评价点估计看无偏性与有效性；置信区间由分位数与标准误构造。',
    whenToUse: [
      '从样本推断总体均值、比例、方差',
      '报告结果时要说清误差范围',
      '比较两种估计方法哪个更好',
    ],
    theorems: [
      {
        name: '置信区间',
        statement: '总体标准差已知时，均值置信区间由正态分位数与标准误构造。',
        formula: '\\bar X\\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}',
      },
      {
        name: '无偏性',
        statement: '估计量的期望等于真参数时称无偏。',
        formula: 'E\\hat\\theta=\\theta',
      },
    ],
    steps: [
      {
        title: '先写点估计',
        body: '用样本均值估计总体均值，用样本比例估计总体比例。估计量是随机变量，评价要看它的分布。',
      },
      {
        title: '检查无偏性',
        body: '估计量的期望等于真参数就叫无偏。样本均值无偏；样本方差若除以 n 会有偏，除以 n 减 1 才无偏。',
        formula: 'E\\bar X=\\mu,\\quad E S^{2}=\\sigma^{2}',
      },
      {
        title: '搭区间',
        body: '已知标准差时用正态分位数，未知且样本量小时改用它分布，样本量大时仍可近似正态。',
        formula: '\\bar X\\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}',
      },
      {
        title: '读懂置信度',
        body: '置信度说的是重复抽样时区间覆盖真值的比例，不是“真值落在这次区间里的概率”。这是最常被误读的一句。',
      },
      {
        title: '先看无偏再比方差',
        body: '两个无偏估计中方差小的更有效。',
      },
    ],
    pitfalls: [
      '置信度理解为概率：它是重复抽样的覆盖比例。',
      '标准差与标准误混：标准误要除以根号 n。',
      '忘了无偏性检验：估计量要先看无偏。',
    ],
    example: {
      problem: '样本量 100、样本均值 50、总体标准差 10，求总体均值的百分之九十五置信区间。',
      walkthrough: [
        '正态分布的百分之九十五对应分位数约为 1.96。',
        '标准误等于标准差除以根号样本量，即 10 除以 10 得 1。',
        '区间半长等于 1.96 乘以标准误，约 1.96。',
        '于是区间约为 48.04 到 51.96。',
      ],
      result: '百分之九十五置信区间约为 (48.04, 51.96)。',
    },    moreExamples: [
      {
        problem: '样本量一百、总体标准差十，求百分之九十五置信区间半长。',
        walkthrough: [
          '标准误为十除以十等于一。',
          '分位数约一点九六。',
          '半长约为一点九六。',
        ],
        result: '1.96',
      },
    ],

  },
  {
    id: 'continuity-theorems',
    title: '闭区间连续三定理：零点、介值、最值',
    tag: '极限',
    level: '基础',
    essence:
      '闭区间上的连续函数有三条保命结论：必取到最大最小值、能取遍中间值、端点异号必有零点。做题时先确认「闭区间 + 连续」这两个前提。',
    definition:
      '函数在一点连续，指该点极限存在且等于函数值。在闭区间上连续的函数，具有三条重要性质：有界、取到最值、取遍中间值。',
    whenToUse: [
      '证明方程在某个区间内有根',
      '证明存在某点使函数取到指定值',
      '求最值时说明最大值确实存在',
    ],
    theorems: [
      {
        name: '零点定理',
        statement: '闭区间连续且两端异号，则区间内至少存在一点使函数值为零。',
        formula: 'f(a)f(b)<0\\;\\Rightarrow\\;\\exists\\xi\\in(a,b),\\;f(\\xi)=0',
      },
      {
        name: '最值定理',
        statement: '闭区间上的连续函数必取到最大值与最小值。',
      },
    ],
    steps: [
      {
        title: '先验前提',
        body: '函数必须在闭区间上连续。开区间或端点不连续时，三定理都不保证成立。',
      },
      {
        title: '端点异号得零点',
        body: '若两端函数值异号，则区间内至少存在一点使函数值为零。这是证明方程有根最常用的手段。',
        formula: 'f(a)f(b)<0\\;\\Rightarrow\\;\\exists\\xi\\in(a,b),\\;f(\\xi)=0',
      },
      {
        title: '介值定理接中间值',
        body: '连续函数在两端取值之间能取到任何值，于是「存在某点使函数等于 k」的题基本靠它。',
      },
      {
        title: '最值定理给保证',
        body: '闭区间连续函数必有最大值与最小值，这保证了后续求最值时不会出现「上确界取不到」的尴尬。',
      },
      {
        title: '配合单调证唯一',
        body: '零点定理只保证存在，再加单调性才能说明唯一。',
      },
    ],
    pitfalls: [
      '在开区间上用：端点未定义时结论不保证。',
      '函数不连续时套用：跳跃间断处可能取不到中间值。',
      '两端同号就断定无根：偶数个根时两端同号仍可能有根。',
    ],
    example: {
      problem: '证明方程三次多项式减一次多项式再减一在区间一到二之间至少有一个根。',
      walkthrough: [
        '把左边看成函数，它在闭区间上连续。',
        '代入左端点得负一，代入右端点得正五，两端异号。',
        '由零点定理，区间内至少存在一点使函数值为零。',
      ],
      result: '该方程在区间一到二之间有根。',
    },    moreExamples: [
      {
        problem: '证明三次多项式减一次多项式再减一在一到二之间有根。',
        walkthrough: [
          '函数在闭区间上连续。',
          '代入左端点为负、右端点为正。',
          '两端异号，由零点定理有根。',
          '再证导数恒正，说明根唯一。',
        ],
        result: '\\exists\\xi\\in(1,2)',
      },
    ],

  },
  {
    id: 'derivative-rules',
    title: '求导法则：一张网罩住所有初等函数',
    tag: '极限',
    level: '基础',
    essence:
      '求导只需要四把工具：基本公式、四则运算、复合函数链式法则、隐函数与参数方程。任何初等函数的导数都是这四样拼出来的。',
    definition:
      '函数在点 x₀ 的导数定义为差商的极限：若该极限存在，就说函数在 x₀ 可导。几何上它是切线斜率，物理上是瞬时变化率；可导必连续，连续不一定可导。',
    whenToUse: [
      '遇到复合结构，想不起怎么拆',
      '隐函数或参数方程给出曲线，要求切线斜率',
      '要判断一个求导结果对不对',
    ],
    steps: [
      {
        title: '先背基本公式',
        body: '幂、指数、对数、三角、反三角的导数必须脱口而出，其余都是组合。',
        formula: '(x^{n})^{\\prime}=nx^{n-1},\\quad(\\sin x)^{\\prime}=\\cos x',
      },
      {
        title: '四则运算分工',
        body: '乘积求导是「前导后不导加前不导后导」，商求导分子是「上导下减上不导下导」。',
      },
      {
        title: '链式法则由外向内',
        body: '复合函数从最外层开始求导，每层乘上内层导数，直到最里面。漏乘内层导数是最高频的错误。',
        formula: '\\frac{d}{dx}f(g(x))=f^{\\prime}(g(x))\\,g^{\\prime}(x)',
      },
      {
        title: '隐函数与参数方程',
        body: '隐函数两边同时对自变量求导，把未知导数当一个整体解出来；参数方程则两个导数相除。',
        formula: '\\frac{dy}{dx}=\\frac{y^{\\prime}(t)}{x^{\\prime}(t)}',
      },
      {
        title: '先化简再求导',
        body: '能拆成和、差、常数倍的先拆开，能取对数的先取对数（对数求导法），可以避免复杂的乘积与商法则。',
      },
      {
        title: '回头检验', 
        body: '把求出的导数在特殊点代入检验，或对结果再积一次看能否还原，能挡住大部分符号错误。',
      },
    ],
    theorems: [
      {
        name: '链式法则',
        statement: '若外层函数在对应点可导、内层函数在 x 处可导，则复合函数可导，且导数等于外层导数乘内层导数。',
        formula: '(f\\circ g)^{\\prime}(x)=f^{\\prime}(g(x))\\,g^{\\prime}(x)',
      },
      {
        name: '反函数求导',
        statement: '单调可导且导数不为零时，反函数的导数等于原函数导数的倒数。',
        formula: '(f^{-1})^{\\prime}(y)=\\frac{1}{f^{\\prime}(x)}',
      },
    ],
    pitfalls: [
      '漏乘内层导数：复合函数只对外层求导，是最常见的错误。',
      '把 ln(x²) 直接写成 2/x：应当先化简成 2ln x 再求导，或老实用链式法则。',
      '对 |x| 在零点求导：那里不可导，导数为 ±1 的分段结论不适用。',
    ],
    example: {
      problem: '求正弦的平方这个复合函数的导数。',
      walkthrough: [
        '外层是正弦，内层是平方。',
        '先对外层求导得余弦，再乘内层导数二倍。',
        '结果为二倍乘余弦。',
      ],
      result: '导数为二倍乘余弦。',
    },    moreExamples: [
      {
        problem: '求 y = ln(sin x) 的导数。',
        walkthrough: [
          '外层是对数，内层是正弦。',
          '外层求导得 1/sin x。',
          '乘内层导数 cos x。',
          '结果为 cot x。',
        ],
        result: '\\cot x',
      },
      {
        problem: '求隐函数 y² + x² = 1 在点 (0,1) 处的切线斜率。',
        walkthrough: [
          '两边对 x 求导得 2y 乘 y 撇加 2x 等于零。',
          '解出 y 撇等于负 x 比 y。',
          '代入点得斜率零。',
        ],
        result: '0',
      },
    ],

  },
  {
    id: 'newton-leibniz',
    title: '牛顿－莱布尼茨公式与反常积分',
    tag: '积分',
    level: '基础',
    essence:
      '定积分等于原函数在两端点的差。这条公式把「求极限的和式」变成「找原函数」，反常积分则是把无穷区间或无界函数也用同一个公式算出来。',
    definition:
      '设 f 在闭区间上连续，F 是它的一个原函数，则 f 在该区间上的定积分等于 F 在两端点之差。这条公式把「求和式的极限」化为「求原函数」，是微积分基本定理的实用形式。',
    whenToUse: [
      '算定积分，先找原函数再代上下限',
      '积分区间无穷，或被积函数在端点无界',
      '判断反常积分收敛还是发散',
    ],
    theorems: [
      {
        name: '微积分基本定理',
        statement: '变上限积分函数的导数等于被积函数本身，这说明求导与积分互为逆运算。',
        formula: '\\frac{d}{dx}\\int_{a}^{x}f(t)\\,dt=f(x)',
      },
      {
        name: '换元与分部',
        statement: '定积分换元要同步换限；分部积分公式在定积分上多出端点代入项。',
        formula: '\\int_{a}^{b}u\\,dv=[uv]_{a}^{b}-\\int_{a}^{b}v\\,du',
      },
    ],
    steps: [
      {
        title: '找到原函数',
        body: '先用不定积分的方法求出原函数，这一步和定积分本身无关。',
      },
      {
        title: '代上下限相减',
        body: '把上限与下限分别代入原函数再相减，这就是公式的全部内容。',
        formula: '\\int_{a}^{b}f(x)\\,dx=F(b)-F(a)',
      },
      {
        title: '反常积分改成极限',
        body: '无穷区间或无界点，先把边界换成参数，算完再让参数取极限。极限存在才叫收敛。',
        formula: '\\int_{a}^{\\infty}f(x)\\,dx=\\lim_{t\\to\\infty}\\int_{a}^{t}f(x)\\,dx',
      },
      {
        title: '记住常用参照',
        body: '倒数幂在指数大于一时收敛、小于等于一时发散，这是比较判别法的基准。',
      },
      {
        title: '核对积分区间',
        body: '换元后区间要跟着换；反常积分先取极限再代入端点。',
      },
    ],
    pitfalls: [
      '原函数不唯一：相差常数不影响定积分，但写答案时要说明用的是哪一个原函数。',
      '反常积分直接代端点：无界点要先取极限，不能把发散当有限值。',
      '换元忘了换限：用新变量算却仍代入旧上下限，结果差一个系数。',
    ],
    example: {
      problem: '计算正弦函数在零到 π 上的定积分，以及倒数平方在 1 到无穷上的反常积分。',
      walkthrough: [
        '正弦的原函数是负余弦，代入 π 与 0 相减得 2。',
        '倒数平方的原函数是负倒数，先算到参数 t。',
        '让 t 趋于无穷，负倒数趋于零，结果为 1。',
      ],
      result: '定积分为 2，反常积分为 1。',
    },    moreExamples: [
      {
        problem: '计算 x 乘指数 e 的 x 次方在零到一上的定积分。',
        walkthrough: [
          '先求原函数，用分部积分得 (x 减一) 乘指数。',
          '代入上限一得零。',
          '代入下限零得负一。',
          '相减得 1。',
        ],
        result: '1',
      },
    ],

  },
  {
    id: 'green-formula',
    title: '格林公式：把曲线积分换成二重积分',
    tag: '曲线与曲面积分',
    level: '进阶',
    essence:
      '沿闭曲线的第二类曲线积分，等于曲线围成区域上的二重积分，被积函数是两个偏导之差。它把「沿边界走一圈」换成「在内部算面积」。',
    definition:
      '设闭曲线 L 围成区域 D，P、Q 在 D 上有连续偏导，L 取正向，则沿 L 的第二类曲线积分等于 D 上两个偏导之差的二重积分。它把边界上的积分与内部的积分联系起来。',
    whenToUse: [
      '闭曲线上的第二类曲线积分，直接算很麻烦',
      '要由曲线积分反求区域面积',
      '判断积分是否与路径无关',
    ],
    theorems: [
      {
        name: '格林公式',
        statement: '闭曲线上的第二类曲线积分，等于围成区域上偏导之差的二重积分，方向取逆时针。',
        formula: '\\oint_{L}P\\,dx+Q\\,dy=\\iint_{D}(Q_{x}-P_{y})\\,d\\sigma',
      },
      {
        name: '路径无关条件',
        statement: '单连通区域上，曲线积分与路径无关当且仅当两个偏导恒相等，此时存在势函数。',
      },
    ],
    steps: [
      {
        title: '确认闭曲线与方向',
        body: '曲线必须闭合，且取正向（逆时针）。方向反了结果差一个负号。',
      },
      {
        title: '套公式',
        body: '把两个分量分别对另一变量求偏导再相减，作为二重积分的被积函数。',
        formula: '\\oint_{L}P\\,dx+Q\\,dy=\\iint_{D}(Q_{x}-P_{y})\\,d\\sigma',
      },
      {
        title: '用面积公式',
        body: '取特殊的分量时，右端正好是区域面积的两倍，于是能用曲线积分求面积。',
        formula: 'A=\\frac{1}{2}\\oint_{L}x\\,dy-y\\,dx',
      },
      {
        title: '检查路径无关',
        body: '当两个偏导相等时，在单连通区域上积分与路径无关，可以换一条好算的路径。',
      },
      {
        title: '补线凑闭合',
        body: '曲线不闭合时先补一段简单的线凑成闭曲线，算完再减去补线部分。',
      },
    ],
    pitfalls: [
      '方向取反：顺时针要补一个负号，否则结果正好差符号。',
      '区域有洞：多连通区域要挖洞后再用，不能直接套。',
      '偏导条件没验：P、Q 在区域内要有连续偏导，否则公式不成立。',
    ],
    example: {
      problem: '用格林公式计算沿单位圆正向的曲线积分，被积式为 x 乘 dy 减 y 乘 dx。',
      walkthrough: [
        '两个分量分别是负 y 与 x。',
        '对另一变量求偏导后相减，结果为常数 2。',
        '二重积分就是 2 乘单位圆面积，面积是 π。',
        '结果为 2π，与直接参数化算得一致。',
      ],
      result: '结果为 2π。',
    },    moreExamples: [
      {
        problem: '用格林公式求单位圆所围区域的面积。',
        walkthrough: [
          '取 P 为负 y、Q 为 x。',
          '偏导之差等于 2。',
          '二重积分等于 2 乘面积。',
          '面积公式给出半个环路积分，结果为圆周率。',
        ],
        result: '\\pi',
      },
    ],

  },
  {
    id: 'integral-applications-more',
    title: '定积分应用：弧长、旋转体与物理量',
    tag: '积分',
    level: '进阶',
    essence:
      '定积分应用都是同一套微元法：取一小段，写出它的长度、体积或功，再沿区间累加。关键是把「一小段」写对。',
    definition:
      '定积分的应用统一用微元法：取一小段写出长度、体积或功的微分，再积分累加。',
    whenToUse: [
      '求曲线弧长、旋转体体积与侧面积',
      '求变力做功、液体压力、质心',
      '题目给出「已知截面面积」求体积',
    ],
    theorems: [
      {
        name: '弧长公式',
        statement: '曲线弧长等于根号下一加导数平方沿区间的积分。',
        formula: 's=\\int_{a}^{b}\\sqrt{1+y^{\\prime 2}}\\,dx',
      },
      {
        name: '侧面积公式',
        statement: '旋转体侧面积等于周长乘弧长微元的积分。',
        formula: 'S=2\\pi\\int_{a}^{b}y\\,ds',
      },
    ],
    steps: [
      {
        title: '切一小段',
        body: '在积分变量上取一个小区间，把它对应的几何量或物理量写成微分形式，误差要比一阶小。',
        formula: 'ds=\\sqrt{1+y^{\\prime 2}}\\,dx',
      },
      {
        title: '写出微元',
        body: '绕 x 轴旋转的体积微元是截面圆面积乘厚度；侧面积微元是周长乘弧长微元。',
        formula: 'dV=\\pi y^{2}\\,dx,\\quad dS=2\\pi y\\,ds',
      },
      {
        title: '定出积分限',
        body: '积分限来自题目给出的区间。换元之后积分限要跟着换，别混用。',
      },
      {
        title: '累加成定积分',
        body: '把所有微元累加就是定积分。物理量也一样：功等于力乘位移微元的积分。',
      },
      {
        title: '先写微元再积分',
        body: '微元写对了积分只是机械步骤。',
      },
    ],
    pitfalls: [
      '微元写错阶：写成常数乘 dx 会丢掉曲率带来的修正。',
      '积分限没对应区间：换元后要同步换限。',
      '物理量单位混：功与压力的量纲不同不能相加。',
    ],
    example: {
      problem: '求上半单位圆绕 x 轴旋转所得立体的体积。',
      walkthrough: [
        '曲线方程是 y 等于根号下一减 x 平方，区间是负一到一。',
        '体积微元是圆周率乘 y 平方乘 dx。',
        '被积函数是一减 x 平方，积分得三分之四。',
        '结果为三分之四倍圆周率。',
      ],
      result: '体积为三分之四倍圆周率。',
    },    moreExamples: [
      {
        problem: '求上半单位圆绕 x 轴旋转的体积。',
        walkthrough: [
          '被积函数为一减 x 平方。',
          '积分区间负一到一。',
          '积得三分之四。',
          '乘圆周率得体积。',
        ],
        result: '\\frac{4\\pi}{3}',
      },
    ],

  },
  {
    id: 'surface-integral-gauss',
    title: '曲面积分与高斯公式',
    tag: '曲线与曲面积分',
    level: '竞赛',
    essence:
      '第一类曲面积分乘面积元，与方向无关；第二类乘有向投影，换侧就变号。闭曲面上的第二类积分可以用高斯公式换成三重积分。',
    definition:
      '第一类曲面积分对面积积分；第二类对坐标投影，与曲面取侧有关。闭曲面上的第二类积分可用高斯公式化为三重积分。',
    whenToUse: [
      '求曲面质量、流量或通量',
      '闭曲面通量，直接算很麻烦',
      '想用散度统一处理三个坐标方向的积分',
    ],
    theorems: [
      {
        name: '高斯公式',
        statement: '闭曲面外法向上的通量等于散度在围成区域上的三重积分。',
        formula: '\\oiint_{S}\\vec F\\cdot d\\vec S=\\iiint_{\\Omega}\\nabla\\cdot\\vec F\\,dV',
      },
      {
        name: '补面法',
        statement: '曲面不闭合时，可补一块简单的面凑成闭曲面，用高斯算完再减去补面部分。',
      },
    ],
    steps: [
      {
        title: '先分类型',
        body: '面积元对应第一类，坐标投影对应第二类。第二类要注意取的是哪一侧的法向。',
      },
      {
        title: '投影或参数化',
        body: '第一类投影到坐标面时要带面积伸缩因子；参数化则换成两个参数的二重积分。',
      },
      {
        title: '闭曲面用高斯',
        body: '把三个分量分别对各自变量求偏导再相加，得到散度，然后转成三重积分。',
        formula: '\\oiint_{S}P\\,dydz+Q\\,dzdx+R\\,dxdy=\\iiint_{\\Omega}(P_x+Q_y+R_z)\\,dV',
      },
      {
        title: '补面凑闭合',
        body: '曲面不闭合时，先补一块简单的面凑成闭曲面，用高斯算完再减去补面的积分。',
      },
      {
        title: '先看是否闭合',
        body: '闭合直接用高斯，不闭合先补面再减。',
      },
    ],
    pitfalls: [
      '方向取反：内法向要变号。',
      '投影漏因子：第一类投影到坐标面要乘面积伸缩因子。',
      '补面后忘记减：补上的那块要单独算并减去。',
    ],
    example: {
      problem: '求单位球面外法向上的通量，向量场取坐标为分量。',
      walkthrough: [
        '分量分别是三个坐标，散度为常数三。',
        '用高斯公式换成球内三重积分，等于三乘球体积。',
        '球体积是三分之四倍圆周率。',
        '通量为四倍圆周率。',
      ],
      result: '通量为四倍圆周率。',
    },    moreExamples: [
      {
        problem: '求单位球面外法向上坐标场的通量。',
        walkthrough: [
          '散度为常数三。',
          '化为三重积分等于三乘球体积。',
          '结果为四倍圆周率。',
        ],
        result: '4\\pi',
      },
    ],

  },
  {
    id: 'higher-derivative',
    title: '高阶导数与微分：求到第 n 阶',
    tag: '极限',
    level: '进阶',
    essence:
      '高阶导数就是反复求导。真正要学的是三件事：常见函数的 n 阶导公式、莱布尼茨公式、以及用微分做线性近似。',
    definition:
      '高阶导数是对导数再求导。常用的三类结果：幂函数、指数、正弦余弦的 n 阶导都有固定形式；乘积的 n 阶导用莱布尼茨公式。',
    whenToUse: [
      '题目要求第 n 阶导数的一般表达式',
      '两个函数乘积的高阶导数（莱布尼茨公式）',
      '用微分估计误差或用切线近似函数值',
    ],
    theorems: [
      {
        name: '莱布尼茨公式',
        statement: '两个函数乘积的 n 阶导数，按二项式系数展开求和。',
        formula: '(uv)^{(n)}=\\sum_{k=0}^{n}C_{n}^{k}u^{(n-k)}v^{(k)}',
      },
      {
        name: '常用 n 阶导',
        statement: '指数函数的 n 阶导是系数 n 次方乘自身，正弦余弦每四阶循环。',
        formula: '(e^{ax})^{(n)}=a^{n}e^{ax}',
      },
    ],
    steps: [
      {
        title: '先算几阶找规律',
        body: '连续求两三阶，观察系数与符号的变化，再猜一般式并用归纳法验证。',
        formula: '(x^{n})^{(n)}=n!',
      },
      {
        title: '背常用 n 阶导',
        body: '指数、正弦余弦、对数、倒数这几类的 n 阶导是标准结论，考试直接套。',
        formula: '(e^{ax})^{(n)}=a^{n}e^{ax}',
      },
      {
        title: '乘积用莱布尼茨',
        body: '两个函数乘积的 n 阶导，按二项式系数展开后求和，只有少数项非零时才好用。',
        formula: '(uv)^{(n)}=\\sum_{k=0}^{n}C_{n}^{k}u^{(n-k)}v^{(k)}',
      },
      {
        title: '微分做线性近似',
        body: '微分主部就是切线增量。小范围内用一阶近似，误差比增量高阶；这是误差估计的起点。',
        formula: 'f(x_0+\\Delta x)\\approx f(x_0)+f^{\\prime}(x_0)\\Delta x',
      },
      {
        title: '找规律再归纳',
        body: '算前三阶找系数与符号规律，猜出通式后用归纳法验证。',
      },
    ],
    pitfalls: [
      '符号循环搞错：正弦求导四次回到自身，别多算一次。',
      '莱布尼茨漏项：k 从零到 n 全部要写。',
      '阶乘忘记：n 阶导的系数含阶乘。',
    ],
    example: {
      problem: '求三次多项式的二阶导数。',
      walkthrough: [
        '先求一阶导，指数降一次并乘系数。',
        '再求一次，得到二阶导。',
        '三次多项式的二阶导是一次函数。',
      ],
      result: '二阶导为一次函数，系数由原式决定。',
    },    moreExamples: [
      {
        problem: '求三次多项式的二阶导数。',
        walkthrough: [
          '一阶导降一次幂。',
          '再求一次降到一次。',
        ],
        result: '6x',
      },
    ],

  },
  {
    id: 'integration-substitution',
    title: '换元积分法：把复合结构换掉',
    tag: '积分',
    level: '基础',
    essence:
      '换元就是把复合函数的内层整体换成一个新变量，让积分变成基本公式的样子。关键在内层导数是否已经出现在被积式里。',
    definition:
      '若被积式含复合函数且内层导数也在，可令内层为新变量，把积分化为基本公式；定积分换元时上下限要同步换。',
    whenToUse: [
      '被积式里有复合函数，且内层导数（差一个常数倍）也在',
      '根号内是一次式或二次式，想用三角换元',
      '定积分换元后要同步换积分限',
    ],
    theorems: [
      {
        name: '第一类换元',
        statement: '内层导数出现时，整体替换为新变量，积分变为新变量的积分。',
        formula: '\\int f(g(x))g^{\\prime}(x)\\,dx=\\int f(u)\\,du',
      },
      {
        name: '三角换元',
        statement: '根号下为平方差用正弦换元，平方和用正切换元，可去掉根号。',
        formula: '\\sqrt{a^{2}-x^{2}}\\;\\Rightarrow\\;x=a\\sin t',
      },
    ],
    steps: [
      {
        title: '找内层',
        body: '把复合结构的内层设为新变量，先看它的导数是否出现。出现了就是标准第一类换元。',
        formula: '\\int f(g(x))g^{\\prime}(x)\\,dx=\\int f(u)\\,du',
      },
      {
        title: '换完要换回来',
        body: '不定积分最后必须把变量换回原来的自变量，否则答案不完整。',
      },
      {
        title: '三角换元处理根号',
        body: '遇到根号下一减平方、一加平方这类结构，用正弦或正切换元能把根号去掉。',
        formula: '\\sqrt{a^{2}-x^{2}}\\;\\Rightarrow\\;x=a\\sin t',
      },
      {
        title: '定积分同步换限',
        body: '定积分换元时上下限也要换成新变量的值，换完直接算，不必换回原变量。',
      },
      {
        title: '先化简再换元',
        body: '能拆成有理式或先配方再换元，往往比硬换更省力。',
      },
    ],
    pitfalls: [
      '忘记换回原变量：不定积分的结果必须用原自变量表示。',
      '定积分忘换限：用新变量算却代入旧上下限，结果必错。',
      '换元后没乘导数：漏掉雅可比式的常数因子。',
    ],
    example: {
      problem: '计算被积式为二倍 x 乘余弦 x 平方的积分。',
      walkthrough: [
        '把 x 平方设为新变量，它的导数正是二倍 x。',
        '被积式正好是外层函数乘内层导数。',
        '换成新变量后就是余弦的积分，结果为正弦。',
        '换回原变量得到正弦 x 平方加常数。',
      ],
      result: '结果为正弦 x 平方加常数。',
    },    moreExamples: [
      {
        problem: '计算二倍 x 乘余弦 x 平方的积分。',
        walkthrough: [
          '令 u 为 x 平方。',
          '微分 du 等于二倍 x dx。',
          '被积式正好是余弦乘 du。',
          '积得正弦，换回原变量。',
        ],
        result: '\\sin(x^{2})+C',
      },
    ],

  },
  {
    id: 'separable-ode',
    title: '可分离变量与齐次方程',
    tag: '微分方程',
    level: '基础',
    essence:
      '一阶方程的两条基本路线：能分离的把两个变量分到两边再积分；齐次的用比值换元变成可分离。',
    definition:
      '可分离变量方程指导数能写成两个单变量函数之积。把含因变量的项移到一边、含自变量的移到另一边，两边积分即可。',
    whenToUse: [
      '方程能写成导数等于两个单变量函数之积',
      '右端只依赖 y 与 x 的比值（齐次方程）',
      '带初值条件求特解',
    ],
    theorems: [
      {
        name: '分离变量法',
        statement: '变量分离后两边各自积分，得到隐式通解。',
        formula: '\\frac{dy}{g(y)}=f(x)\\,dx',
      },
      {
        name: '齐次方程换元',
        statement: '右端只依赖比值时，令比值为新变量可化为可分离。',
        formula: 'u=\\frac{y}{x}\\;\\Rightarrow\\;y=ux',
      },
    ],
    steps: [
      {
        title: '分离变量',
        body: '把含 y 的部分移到一边、含 x 的部分移到另一边，两边各自积分，别忘了常数。',
        formula: '\\frac{dy}{g(y)}=f(x)\\,dx',
      },
      {
        title: '齐次方程换元',
        body: '右端只含比值时，令新变量等于 y 比 x，方程就变成可分离的。',
        formula: 'u=\\frac{y}{x}\\;\\Rightarrow\\;y=ux',
      },
      {
        title: '代初值定常数',
        body: '通解里的常数由初值确定。代入时要检查是否落在定义域内。',
      },
      {
        title: '检查漏解',
        body: '分离变量时除以过的因子可能为零，那些常数解要单独检查是否被通解包含。',
      },
      {
        title: '先化成标准形',
        body: '把导数写成微分之形式再分离，能看清哪些因子不能为零。',
      },
    ],
    pitfalls: [
      '除以零因子漏解：除以的因子为零时可能有常数解。',
      '积分常数位置错：常数加在任意一边都可以，但要写。',
      '初值代入前没化简：隐式解要先化成显式再代。',
    ],
    example: {
      problem: '解导数等于二倍 x 乘 y，且 x 为零时 y 等于一。',
      walkthrough: [
        '两边除以 y、乘 dx，变量就分开了。',
        '两边积分得对数形式，再取指数。',
        '通解是指数乘以常数。',
        '代入初值定常数为一。',
      ],
      result: '特解为 e 的 x 平方次方。',
    },    moreExamples: [
      {
        problem: '解导数等于二倍自变量乘函数，初值为一。',
        walkthrough: [
          '分离变量后两边积分。',
          '得到对数形式。',
          '取指数得通解。',
          '代入初值定常数。',
        ],
        result: 'y=e^{x^{2}}',
      },
    ],

  },
  {
    id: 'rational-integral',
    title: '有理函数积分：先拆成部分分式',
    tag: '积分',
    level: '进阶',
    essence:
      '有理函数积分只有一条路：假分式先做除法化成多项式加真分式，真分式再按分母因式拆成部分分式，最后逐项积分。',
    definition:
      '有理函数积分指两个多项式之比的积分。方法是假分式先做除法降次，真分式按分母因式拆成部分分式，再逐项积分。',
    whenToUse: [
      '被积式是多项式之比',
      '分母能因式分解成一次与二次因子',
      '三角有理式用万能代换后也归到这里',
    ],
    theorems: [
      {
        name: '部分分式分解',
        statement: '分母分解成一次与不可约二次因子后，真分式可拆成这些因子的幂的线性组合。',
        formula: '\\frac{P(x)}{(x-a)(x-b)}=\\frac{A}{x-a}+\\frac{B}{x-b}',
      },
      {
        name: '二次因子配方',
        statement: '不可约二次因子配方后化为反正切形式，分子缺项时先补成导数形式。',
        formula: '\\int\\frac{dx}{x^{2}+a^{2}}=\\frac{1}{a}\\arctan\\frac{x}{a}+C',
      },
    ],
    steps: [
      {
        title: '先化真分式',
        body: '分子次数不低于分母时先做多项式除法，把假分式拆成多项式加真分式。',
      },
      {
        title: '分母因式分解',
        body: '把分母拆成一次因子与不可约二次因子的乘积，重因子要按重数写多项。',
      },
      {
        title: '待定系数求拆分',
        body: '按因式类型写出部分分式的一般形式，通分比较系数解出待定常数。',
        formula: '\\frac{P(x)}{(x-a)(x-b)}=\\frac{A}{x-a}+\\frac{B}{x-b}',
      },
      {
        title: '逐项积分',
        body: '一次因子积出对数，不可约二次因子配方后积出反正切。',
        formula: '\\int\\frac{dx}{x^{2}+a^{2}}=\\frac{1}{a}\\arctan\\frac{x}{a}+C',
      },
      {
        title: '最后合并对数',
        body: '多个对数项可以用对数运算法则合并，答案更简洁。',
      },
    ],
    pitfalls: [
      '没先化真分式：分子次数不低于分母时必须先做除法。',
      '重因子写成单项：重根要按幂次写成多项。',
      '二次因子配错：配方后系数漏乘，反正切前要补系数。',
    ],
    example: {
      problem: '计算分母为 x 平方减一、分子为一的积分。',
      walkthrough: [
        '分母分解成两个一次因子之差。',
        '拆成两个简单分式，系数一正一负。',
        '分别积分得到两个对数。',
        '合并成半对数绝对值之比。',
      ],
      result: '结果为二分之一乘对数绝对值之比加常数。',
    },    moreExamples: [
      {
        problem: '计算分母为 x 方减一、分子为一的积分。',
        walkthrough: [
          '分母分解为两个一次因子。',
          '拆成两个简单分式，系数一正一负。',
          '分别积分得两个对数。',
          '合并为半对数绝对值之比。',
        ],
        result: '\\frac{1}{2}\\ln\\left|\\frac{x-1}{x+1}\\right|+C',
      },
    ],

  },
  {
    id: 'multivar-chain',
    title: '多元复合求导：链式法则的树状图',
    tag: '多元',
    level: '进阶',
    essence:
      '多元链式法则就是把依赖关系画成一棵树：对每条从目标到变量的路径，把偏导相乘，再把所有路径相加。',
    definition:
      '多元复合函数求导用链式法则：沿依赖路径把偏导相乘，再把所有路径相加。',
    whenToUse: [
      '中间变量由多个自变量决定',
      '求隐函数的偏导（把方程看成恒等式两边求导）',
      '求全导数（中间变量又依赖同一个自变量）',
    ],
    theorems: [
      {
        name: '链式法则',
        statement: '每个中间变量贡献一条路径，路径上的偏导相乘，结果相加。',
        formula: '\\frac{\\partial z}{\\partial t}=\\sum_{i}\\frac{\\partial z}{\\partial u_i}\\frac{\\partial u_i}{\\partial t}',
      },
      {
        name: '隐函数求导',
        statement: '方程确定隐函数时，两边求偏导再解出未知偏导。',
        formula: 'F(x,y)=0\\;\\Rightarrow\\;y^{\\prime}=-\\frac{F_x}{F_y}',
      },
    ],
    steps: [
      {
        title: '画依赖树',
        body: '先写清目标函数依赖哪些中间变量，中间变量又依赖哪些自变量。',
      },
      {
        title: '沿路径相乘',
        body: '每一条从目标到自变量的路径，把沿路的偏导相乘。',
        formula: '\\frac{\\partial z}{\\partial t}=\\frac{\\partial z}{\\partial u}\\frac{\\partial u}{\\partial t}+\\frac{\\partial z}{\\partial v}\\frac{\\partial v}{\\partial t}',
      },
      {
        title: '所有路径相加',
        body: '多个中间变量就是多条路径，结果相加。漏掉一条路径是最常见的错误。',
      },
      {
        title: '代入具体点',
        body: '最后把中间变量用自变量的值代回去，得到纯自变量的表达式。',
      },
      {
        title: '画依赖树',
        body: '把变量依赖关系画成树，每条路径相乘再相加，不会漏项。',
      },
    ],
    pitfalls: [
      '漏路径：多个中间变量时少算一条就错。',
      '偏导与全导混：中间变量只依赖一个自变量时才是全导。',
      '代错点：最后要把中间变量用具体值代回。',
    ],
    example: {
      problem: '目标函数是 x 平方乘 y，其中 x 等于 t、y 等于 t 平方，求对 t 的导数。',
      walkthrough: [
        '目标依赖两个中间变量，两个中间变量都依赖 t。',
        '分别算两条路径的偏导乘积。',
        '两条路径相加。',
        '直接代入也得到同样的四倍 t 立方。',
      ],
      result: '导数为四倍 t 立方。',
    },    moreExamples: [
      {
        problem: '已知目标为 x 平方乘 y，x 等于 t、y 等于 t 平方，求对 t 的导数。',
        walkthrough: [
          '两条路径分别算偏导乘积。',
          '相加后代入。',
          '结果为四倍 t 立方。',
        ],
        result: '4t^{3}',
      },
    ],

  },
  {
    id: 'multivar-extrema',
    title: '无条件极值：先用驻点，再看二阶判别式',
    tag: '多元',
    level: '进阶',
    essence:
      '多元极值分两步：先解一阶偏导为零找驻点，再用二阶偏导构成的判别式判断是极大、极小还是鞍点。',
    definition:
      '多元极值先解一阶偏导为零得驻点，再用二阶偏导构成的判别式判断极大、极小或鞍点；有界闭区域还要比较边界。',
    whenToUse: [
      '求二元函数的极大值、极小值',
      '应用题里求成本最小、利润最大',
      '判断一个驻点到底是极值还是鞍点',
    ],
    theorems: [
      {
        name: '二阶判别',
        statement: '判别式大于零时看自偏导符号，小于零为鞍点，等于零需另判。',
        formula: '\\Delta=f_{xx}f_{yy}-f_{xy}^{2}',
      },
      {
        name: '最值比较',
        statement: '闭区域上的最值出现在内部驻点或边界上，需逐一比较。',
      },
    ],
    steps: [
      {
        title: '解驻点方程',
        body: '令两个一阶偏导同时为零，解出所有驻点。这是极值点的唯一候选来源。',
        formula: 'f_x=0,\\quad f_y=0',
      },
      {
        title: '算二阶偏导',
        body: '分别求两个二阶自偏导与混合偏导，在驻点处取值。',
      },
      {
        title: '用判别式分类',
        body: '判别式大于零时再看自偏导符号：正为极小、负为极大；判别式小于零是鞍点；等于零时需另外分析。',
        formula: '\\Delta=f_{xx}f_{yy}-f_{xy}^{2}',
      },
      {
        title: '边界另算',
        body: '判别式只处理内部驻点。有界闭区域上的最值还要比较边界上的值。',
      },
      {
        title: '比较边界值',
        body: '闭区域最值要在驻点与边界上各算一遍再比较。',
      },
    ],
    pitfalls: [
      '漏边界：内部驻点不等于最值。',
      '判别式符号看反：大于零才是极值。',
      '混合偏导求错：f_xy 要对两个变量各求一次。',
    ],
    example: {
      problem: '求 x 平方加 x 乘 y 加 y 平方的极值。',
      walkthrough: [
        '两个偏导为零，解得唯一驻点是原点。',
        '二阶自偏导都为正二，混合偏导为正一。',
        '判别式为正三，大于零；自偏导为正，所以是极小值。',
        '极小值为零。',
      ],
      result: '原点处取极小值零。',
    },    moreExamples: [
      {
        problem: '求 x 方加 x y 加 y 方的极值。',
        walkthrough: [
          '驻点为原点。',
          '判别式为正三。',
          '自偏导为正，取极小。',
        ],
        result: '0',
      },
    ],

  },
  {
    id: 'implicit-parametric-diff',
    title: '隐函数与参数方程求导',
    tag: '极限',
    level: '进阶',
    essence:
      '隐函数求导把方程两边同时求导，把未知导数当整体解出来；参数方程求导就是两个导数相除。两者都不需要先解出显式函数。',
    definition:
      '隐函数求导对两边同时求导再解出导数；参数方程求导是两个导数相除，二阶导还要再除一次参数导数。',
    whenToUse: [
      '曲线由方程给出，解不出显式函数',
      '曲线用参数方程表示，要求切线斜率',
      '求二阶导（参数方程要再除一次参数导数）',
    ],
    theorems: [
      {
        name: '隐函数导数',
        statement: '二元方程确定的隐函数，导数为两个偏导之比的相反数。',
        formula: '\\frac{dy}{dx}=-\\frac{F_x}{F_y}',
      },
      {
        name: '参数方程导数',
        statement: '纵坐标导数除以横坐标导数即切线斜率。',
        formula: '\\frac{dy}{dx}=\\frac{y^{\\prime}(t)}{x^{\\prime}(t)}',
      },
    ],
    steps: [
      {
        title: '两边同时对自变量求导',
        body: '把 y 看成 x 的函数，遇到 y 的项要用链式法则多乘一个导数因子。',
        formula: 'x^{2}+y^{2}=1\\;\\Rightarrow\\;2x+2yy^{\\prime}=0',
      },
      {
        title: '解出导数',
        body: '把含导数的项留在一边，其余移走，最后除以系数。结果里通常同时含 x 与 y。',
      },
      {
        title: '参数方程用相除',
        body: '分别对参数求导，再把纵坐标导数除以横坐标导数，得到切线斜率。',
        formula: '\\frac{dy}{dx}=\\frac{y^{\\prime}(t)}{x^{\\prime}(t)}',
      },
      {
        title: '二阶导要再除一次',
        body: '参数方程的二阶导，是把一阶导再对参数求导后，除以横坐标导数，容易漏除。',
      },
      {
        title: '二阶导再除参数',
        body: '参数方程的二阶导要把一阶导再对参数求导后除以横坐标导数。',
      },
    ],
    pitfalls: [
      '对 y 求导漏乘 y 撇：链式法则不能省。',
      '二阶导忘记再除一次：容易只对 t 求导就完事。',
      '参数区间与点不对应：代值前先确认 t。',
    ],
    example: {
      problem: '单位圆方程给出曲线，求其导数表达式。',
      walkthrough: [
        '两边对 x 求导，注意 y 是 x 的函数。',
        '得到含导数的线性方程。',
        '解出导数等于负 x 比 y。',
      ],
      result: '导数为负 x 比 y。',
    },    moreExamples: [
      {
        problem: '求单位圆参数方程在四分之一处的切线斜率。',
        walkthrough: [
          '分别对参数求导。',
          '相除得负余切。',
          '代入参数值。',
        ],
        result: '-1',
      },
    ],

  },
  {
    id: 'concavity-curvature',
    title: '凹凸性与曲率：曲线有多「弯」',
    tag: '导数应用',
    level: '进阶',
    essence:
      '一阶导看升降，二阶导看弯曲方向：二阶导为正曲线凹向上，为负凹向下，变号处是拐点。曲率则把「弯的程度」量化成数。',
    definition:
      '二阶导为正曲线凹向上，为负凹向下，变号处是拐点。曲率刻画弯曲程度，等于二阶导绝对值除以一加一阶导平方的二分之三次方。',
    whenToUse: [
      '求曲线的凹凸区间与拐点',
      '求曲率与曲率半径',
      '证明不等式时用凸性（琴生不等式的来源）',
    ],
    theorems: [
      {
        name: '凹凸判据',
        statement: '区间内二阶导恒正则曲线凹向上，恒负则凹向下。',
      },
      {
        name: '曲率公式',
        statement: '曲率等于二阶导绝对值除以一加一阶导平方的二分之三次方。',
        formula: 'K=\\frac{|y^{\\prime\\prime}|}{(1+y^{\\prime 2})^{3/2}}',
      },
    ],
    steps: [
      {
        title: '求二阶导',
        body: '先求一阶导，再求一次。二阶导的符号决定凹凸，注意定义域内二阶导不存在的点也要列出。',
        formula: 'f^{\\prime\\prime}(x)>0\\;\\Rightarrow\\;\\text{concave up}',
      },
      {
        title: '找拐点',
        body: '二阶导变号的点才是拐点。只为零不变号（如三次方在原点）不是拐点。',
      },
      {
        title: '算曲率',
        body: '曲率等于二阶导绝对值除以一加一阶导平方的二分三次方；直线曲率为零，圆半径为 r 时曲率为 r 分之一。',
        formula: 'K=\\frac{|y^{\\prime\\prime}|}{(1+y^{\\prime 2})^{3/2}}',
      },
      {
        title: '用凸性证不等式',
        body: '凸函数上，割线在函数图像上方；这条性质把所有「平均值与函数值」的不等式统一起来。',
      },
      {
        title: '二阶导看凹凸',
        body: '一阶导看升降，二阶导看弯曲方向。',
      },
    ],
    pitfalls: [
      '二阶导为零就当拐点：要变号才是。',
      '曲率公式漏绝对值：曲率非负。',
      '把曲率半径当曲率：两者互为倒数。',
    ],
    example: {
      problem: '求单位圆的曲率。',
      walkthrough: [
        '圆的曲率处处相同。',
        '半径为一时，曲率等于一分之一。',
        '也就是恒等于 1。',
      ],
      result: '单位圆曲率为 1，曲率半径为 1。',
    },    moreExamples: [
      {
        problem: '求单位圆的曲率。',
        walkthrough: [
          '圆的曲率处处相同。',
          '半径为一，曲率等于一分之一。',
        ],
        result: '1',
      },
    ],

  },
  {
    id: 'improper-integral',
    title: '反常积分：无穷区间与无界函数',
    tag: '积分',
    level: '进阶',
    essence:
      '反常积分就是把边界换成参数再取极限。极限存在叫收敛，不存在叫发散。判别敛散常用比较法与 p 积分基准。',
    definition:
      '反常积分把无穷区间或无界点用极限处理：换成参数算定积分再取极限，极限存在称收敛。',
    whenToUse: [
      '积分区间一端或两端无穷',
      '被积函数在端点无界（如根号在分母）',
      '判断级数敛散时用积分判别法',
    ],
    theorems: [
      {
        name: '无穷区间',
        statement: '无穷区间的积分定义为上限趋于无穷时的极限。',
        formula: '\\int_{a}^{\\infty}f\\,dx=\\lim_{t\\to\\infty}\\int_{a}^{t}f\\,dx',
      },
      {
        name: 'p 积分判据',
        statement: '根号型在零点无界时，指数小于一收敛，否则发散。',
        formula: '\\int_{0}^{1}x^{-p}dx\\text{ converges iff }p<1',
      },
    ],
    steps: [
      {
        title: '先找奇点',
        body: '无穷端点与无界点都是奇点，有几个就拆成几个积分，每个单独判敛。',
      },
      {
        title: '换成极限',
        body: '把奇点换成参数，算定积分，再让参数趋向奇点。极限存在才收敛。',
        formula: '\\int_{a}^{b}f(x)\\,dx=\\lim_{t\\to b^{-}}\\int_{a}^{t}f(x)\\,dx',
      },
      {
        title: '记 p 积分基准',
        body: '根号型在端点附近，指数小于一时收敛；无穷区间上倒数幂指数大于一时收敛。',
        formula: '\\int_{0}^{1}\\frac{dx}{x^{p}}\\;\\text{converges iff}\\;p<1',
      },
      {
        title: '比较判别',
        body: '和已知收敛的积分比大小，小的收敛则大的也收敛；极限比较法更适合处理同阶情形。',
      },
      {
        title: '与 p 积分比较',
        body: '复杂被积式找到同阶的 p 积分作比较，判敛最快。',
      },
    ],
    pitfalls: [
      '把发散当有限：极限不存在时不能写数值。',
      '奇点漏判：区间内可能有多个无界点，要逐个拆开。',
      '直接代端点：无界点不能直接代入，必须先取极限。',
    ],
    example: {
      problem: '判断根号倒数在零到一上的积分是否收敛，并求值。',
      walkthrough: [
        '被积函数在零处无界，但指数是二分之一，小于一。',
        '原函数是二倍根号，代入上下限。',
        '下限取极限后为零。',
        '结果为 2。',
      ],
      result: '收敛，值为 2。',
    },    moreExamples: [
      {
        problem: '判断根号倒数在零到一上的积分是否收敛。',
        walkthrough: [
          '被积函数在零处无界。',
          '指数为二分之一，小于一。',
          '原函数为二倍根号，代入后极限存在。',
          '值为二。',
        ],
        result: '2',
      },
    ],

  },
  {
    id: 'power-series-expansion',
    title: '函数展开成幂级数：间接展开法',
    tag: '级数',
    level: '进阶',
    essence:
      '求展开式不必每次算泰勒系数。记住几个基本展开，再用代换、求导、积分、乘除把新函数化归到已知展开，这叫间接展开。',
    definition:
      '间接展开法：记住五个基本展开，再用代换、求导、积分把新函数化归到已知展开，最后确认收敛域。',
    whenToUse: [
      '题目要求把函数展开成幂级数',
      '求幂级数的和函数（反方向用）',
      '近似计算或求高阶导数在零点的值',
    ],
    theorems: [
      {
        name: '逐项求导与积分',
        statement: '收敛区间内幂级数可逐项求导与积分，收敛半径不变。',
      },
      {
        name: '常用展开',
        statement: '对数一加 x 的展开式为交替级数，收敛区间为左闭右开。',
        formula: '\\ln(1+x)=\\sum_{n=1}^{\\infty}\\frac{(-1)^{n-1}x^{n}}{n}',
      },
    ],
    steps: [
      {
        title: '背基本展开',
        body: '指数、正弦、余弦、对数、几何级数这五个展开式是地基，其余都从它们变形而来。',
        formula: 'e^{x}=\\sum_{n=0}^{\\infty}\\frac{x^{n}}{n!},\\quad \\frac{1}{1-x}=\\sum_{n=0}^{\\infty}x^{n}',
      },
      {
        title: '用代换',
        body: '把 x 换成负 x、x 平方等，收敛域同步变换。',
      },
      {
        title: '用求导与积分',
        body: '先展开导数或先积分，再逐项还原，收敛半径不变，端点要单独判。',
        formula: '\\ln(1+x)=\\sum_{n=1}^{\\infty}\\frac{(-1)^{n-1}x^{n}}{n}',
      },
      {
        title: '确认收敛域',
        body: '展开式只在收敛区间内成立。端点处要代回级数单独判断，别漏。',
      },
      {
        title: '先背五个展开',
        body: '指数、正弦、余弦、对数、几何级数五组是地基。',
      },
    ],
    pitfalls: [
      '端点不判：展开式在端点的收敛性要单独看。',
      '代换后收敛域没换：x 换成 x 平方，区间也变。',
      '求导后漏积分回去：两边要同步。',
    ],
    example: {
      problem: '把对数函数一加 x 展开成幂级数。',
      walkthrough: [
        '先对函数求导，得到几何级数形式。',
        '把几何级数展开后逐项积分。',
        '积分后系数变成倒数形式，符号交替。',
        '收敛区间是负一到一，端点单独判。',
      ],
      result: '展开式为交替符号的 x 的 n 次方除以 n 之和。',
    },    moreExamples: [
      {
        problem: '把一减 x 分之一展开成幂级数并写出收敛域。',
        walkthrough: [
          '这是几何级数。',
          '公比为 x。',
          '收敛条件为绝对值小于一。',
        ],
        result: '\\sum_{n=0}^{\\infty}x^{n},\\,|x|<1',
      },
    ],

  },
  {
    id: 'tangent-plane',
    title: '多元函数的几何应用：切平面与法线',
    tag: '多元',
    level: '进阶',
    essence:
      '曲面在一点的切平面由梯度张成：把函数写成隐式方程，梯度就是法向量，切平面与法线都能直接写出来。',
    definition:
      '曲面在一点的切平面由该点梯度给出法向量，点法式方程即可写出；法线方向就是梯度方向。',
    whenToUse: [
      '求曲面在某点的切平面或法线',
      '求曲线在空间中的切线',
      '用切平面做近似计算',
    ],
    theorems: [
      {
        name: '切平面方程',
        statement: '隐式曲面在一点的切平面，法向量为三元函数的梯度。',
        formula: 'F_x(x-x_0)+F_y(y-y_0)+F_z(z-z_0)=0',
      },
      {
        name: '全微分的几何意义',
        statement: '全微分就是切平面带来的线性增量，小范围内用切平面代替曲面。',
      },
    ],
    steps: [
      {
        title: '写成隐式方程',
        body: '把曲面写成某个三元函数等于零，这样梯度就是法向量。',
        formula: 'F(x,y,z)=0\\;\\Rightarrow\\;\\vec n=(F_x,F_y,F_z)',
      },
      {
        title: '写切平面',
        body: '用点法式：法向量与「动点减定点」的内积为零。',
        formula: 'F_x(P)(x-x_0)+F_y(P)(y-y_0)+F_z(P)(z-z_0)=0',
      },
      {
        title: '写法线',
        body: '法线方向就是法向量，写成对称式即可。',
      },
      {
        title: '用切平面近似',
        body: '小范围内用切平面代替曲面，这就是全微分的几何意义。',
      },
      {
        title: '法向量即梯度',
        body: '曲面写成隐式方程后，梯度就是法向量，切平面直接点法式。',
      },
    ],
    pitfalls: [
      '梯度算错：三个偏导都要在给定点取值。',
      '法向量与方向向量混：曲面切平面用梯度做法向。',
      '忘记代点：方程必须经过给定点。',
    ],
    example: {
      problem: '求抛物面在横纵坐标都为 1 处的切平面。',
      walkthrough: [
        '写成隐式方程后求三个偏导。',
        '在给定点处法向量为负二、负二与一。',
        '用点法式展开。',
        '整理成标准形式。',
      ],
      result: '切平面为二倍 x 加二倍 y 减 z 减二等于零。',
    },    moreExamples: [
      {
        problem: '求抛物面在横纵坐标都为一处的切平面。',
        walkthrough: [
          '写成隐式方程。',
          '求三个偏导。',
          '点法式展开。',
        ],
        result: '2x+2y-z-2=0',
      },
    ],

  },
  {
    id: 'multi-integral-applications',
    title: '重积分的应用：质心、转动惯量与引力',
    tag: '重积分',
    level: '竞赛',
    essence:
      '重积分应用统一成「密度乘微元再累加」：质量是密度积分，质心是一阶矩除以质量，转动惯量是距离平方乘密度。',
    definition:
      '重积分应用统一为密度乘微元再累加：质量是密度积分，质心是一阶矩除以质量，转动惯量是距离平方乘密度。',
    whenToUse: [
      '求平面薄片或空间立体的质量、质心',
      '求转动惯量',
      '求引力分量',
    ],
    theorems: [
      {
        name: '质心公式',
        statement: '质心坐标等于对应一阶矩除以总质量。',
        formula: '\\bar x=\\frac{1}{m}\\iint x\\rho\\,d\\sigma',
      },
      {
        name: '转动惯量',
        statement: '绕轴转动惯量是到轴距离平方乘密度再积分。',
        formula: 'I_x=\\iint y^{2}\\rho\\,d\\sigma',
      },
    ],
    steps: [
      {
        title: '先算质量',
        body: '密度在区域上的积分就是质量。均匀时直接等于密度乘面积或体积。',
        formula: 'm=\\iint_{D}\\rho(x,y)\\,d\\sigma',
      },
      {
        title: '算一阶矩',
        body: '质心坐标等于对应的一阶矩除以质量；均匀薄片的质心就是形心。',
        formula: '\\bar x=\\frac{1}{m}\\iint_{D}x\\rho\\,d\\sigma',
      },
      {
        title: '算转动惯量',
        body: '绕轴转动惯量是到轴距离平方乘密度再积分，注意是到轴的距离不是到原点。',
        formula: 'I_x=\\iint_{D}y^{2}\\rho\\,d\\sigma',
      },
      {
        title: '用对称性化简',
        body: '均匀且区域对称时，质心必在对称轴上，可以先判断再计算，省一半功夫。',
      },
      {
        title: '先算质量',
        body: '质心与转动惯量都从质量起步。',
      },
    ],
    pitfalls: [
      '距离算成到原点的距离：转动惯量用到轴距离。',
      '均匀时忘记密度：均匀可直接用面积或体积。',
      '对称性用错：不均匀时不能直接判质心在对称轴。',
    ],
    example: {
      problem: '求上半单位圆盘的形心纵坐标。',
      walkthrough: [
        '面积是二分之圆周率。',
        '纵坐标一阶矩等于对 y 的二重积分。',
        '用极坐标算得三分之二。',
        '除以面积得三分之四除以圆周率。',
      ],
      result: '形心纵坐标为圆周率分之四除以三。',
    },    moreExamples: [
      {
        problem: '求上半单位圆盘的形心纵坐标。',
        walkthrough: [
          '面积为二分之圆周率。',
          '纵坐标一阶矩为三分之二。',
          '相除得结果。',
        ],
        result: '\\frac{4}{3\\pi}',
      },
    ],

  },
  {
    id: 'stokes-formula',
    title: '斯托克斯公式：旋度与环量',
    tag: '曲线与曲面积分',
    level: '竞赛',
    essence:
      '沿空间闭曲线的环流，等于曲面上旋度的通量。它把「沿边界走一圈」换成「在曲面上积分」，是高维版的格林公式。',
    definition:
      '沿空间闭曲线的环流等于旋度在张成曲面上的通量，方向由右手法则确定。它是格林公式在空间中的推广。',
    whenToUse: [
      '空间闭曲线上的第二类曲线积分',
      '想用旋度判断场是否有势',
      '与高斯公式、格林公式一起构成三大公式',
    ],
    theorems: [
      {
        name: '斯托克斯公式',
        statement: '曲线积分等于旋度通过曲面的通量，曲线方向与曲面法向满足右手法则。',
        formula: '\\oint_{L}\\vec F\\cdot d\\vec r=\\iint_{S}(\\nabla\\times\\vec F)\\cdot\\vec n\\,dS',
      },
      {
        name: '旋度与有势场',
        statement: '旋度处处为零的单连通区域上，场为梯度场，环流为零。',
      },
    ],
    steps: [
      {
        title: '认边界与曲面',
        body: '曲线必须是某块曲面的边界，方向与曲面法向满足右手法则。',
      },
      {
        title: '算旋度',
        body: '把场写成三个分量，用行列式形式算出旋度向量。',
        formula: '\\nabla\\times\\vec F=\\left(F_{3y}-F_{2z},\\,F_{1z}-F_{3x},\\,F_{2x}-F_{1y}\\right)',
      },
      {
        title: '转成通量',
        body: '把旋度与曲面法向作内积，在曲面上做第一类曲面积分。',
        formula: '\\oint_{L}\\vec F\\cdot d\\vec r=\\iint_{S}(\\nabla\\times\\vec F)\\cdot\\vec n\\,dS',
      },
      {
        title: '选简单的曲面',
        body: '边界确定后曲面可以任选，通常取平面片最省事。',
      },
      {
        title: '右手法则定方向',
        body: '曲线方向与法向要对应，否则整体差一个负号。',
      },
    ],
    pitfalls: [
      '方向不匹配：曲线方向与法向不满足右手法则要变号。',
      '旋度算错：三个分量分别求差，注意次序。',
      '曲面选复杂：边界确定后应选最省事的平面片。',
    ],
    example: {
      problem: '在坐标平面上的单位圆上，求场 y、z、x 的环量。',
      walkthrough: [
        '曲面上 z 恒为零，法向竖直向上。',
        '旋度为三个负一。',
        '与法向内积得负一。',
        '曲面积分就是负的圆面积，即负圆周率。',
      ],
      result: '环量为负圆周率。',
    },    moreExamples: [
      {
        problem: '求坐标平面单位圆上场为 y、z、x 的环量。',
        walkthrough: [
          '旋度为三个负一。',
          '法向竖直向上。',
          '内积为负一，曲面面积为圆周率。',
        ],
        result: '-\\pi',
      },
    ],

  },
  {
    id: 'joint-distribution',
    title: '多维随机变量：联合、边缘与独立',
    tag: '概率',
    level: '进阶',
    essence:
      '联合分布描述两个变量一起取值；把它们分别求和或积分就得到边缘分布。联合密度能写成两个单变量密度之积，才是独立。',
    definition:
      '联合分布描述两个变量一起取值；把另一个变量求和或积分得到边缘分布。联合等于边缘之积才是独立。',
    whenToUse: [
      '题目给出联合分布律或联合密度',
      '求边缘分布、条件分布',
      '判断两个随机变量是否独立、求协方差',
    ],
    theorems: [
      {
        name: '边缘分布',
        statement: '连续型把另一变量积分掉即得边缘密度。',
        formula: 'f_X(x)=\\int f(x,y)\\,dy',
      },
      {
        name: '独立判据',
        statement: '联合密度等于两个边缘密度之积时独立。',
      },
    ],
    steps: [
      {
        title: '先看联合形式',
        body: '离散用联合分布律表，连续用联合密度。检查非负性与总概率为一是第一步。',
      },
      {
        title: '求边缘分布',
        body: '离散把另一变量求和，连续把它积分积掉。这是「只关心一个变量」的标准动作。',
        formula: 'f_X(x)=\\int_{-\\infty}^{\\infty}f(x,y)\\,dy',
      },
      {
        title: '判断独立',
        body: '联合等于边缘之积才独立。注意区域形状也是线索：矩形区域才可能让变量分离。',
        formula: 'f(x,y)=f_X(x)f_Y(y)\\;\\Leftrightarrow\\;\\text{independent}',
      },
      {
        title: '算协方差',
        body: '协方差等于乘积的期望减期望之积；为零只说明不线性相关，不保证独立。',
      },
      {
        title: '先求边缘',
        body: '独立性与协方差都要先求边缘分布。',
      },
    ],
    pitfalls: [
      '矩形区域外谈独立：区域形状限制独立性。',
      '相关系数为零当独立：只说明不线性相关。',
      '积分限写错：要按联合密度的支撑写。',
    ],
    example: {
      problem: '已知联合密度在单位正方形上为常数，判断两个变量是否独立。',
      walkthrough: [
        '常数密度意味着均匀分布。',
        '把另一个变量积分掉，边缘密度都等于一。',
        '两个边缘之积等于联合密度。',
        '因此两个变量独立。',
      ],
      result: '两个变量独立。',
    },    moreExamples: [
      {
        problem: '单位正方形上联合密度为一，判断两个变量是否独立。',
        walkthrough: [
          '边缘密度都为一。',
          '乘积等于联合密度。',
          '因此独立。',
        ],
        result: '\\text{independent}',
      },
    ],

  },
  {
    id: 'sampling-distribution',
    title: '抽样分布：卡方、t 与 F 三个分布',
    tag: '概率',
    level: '进阶',
    essence:
      '统计推断靠三个由正态样本造出来的分布：方差比对应卡方，均值除以样本标准差对应 t，两个方差之比对应 F。',
    definition:
      '抽样分布由正态样本构造：卡方是标准正态平方和，t 是标准正态除以卡方比自由度再开根，F 是两个卡方比自由度之比。',
    whenToUse: [
      '求样本均值的分布',
      '区间估计与假设检验要查分位数',
      '比较两组数据的方差',
    ],
    theorems: [
      {
        name: 't 分布构造',
        statement: '总体方差未知时，样本均值标准化后服从自由度为 n 减一的 t 分布。',
        formula: 't=\\frac{\\bar X-\\mu}{S/\\sqrt{n}}\\sim t(n-1)',
      },
      {
        name: '卡方数字特征',
        statement: '卡方分布期望等于自由度，方差是两倍自由度。',
        formula: 'E\\chi^{2}=n,\\quad D\\chi^{2}=2n',
      },
    ],
    steps: [
      {
        title: '记住构造方式',
        body: '卡方是标准正态的平方和；t 是标准正态除以卡方除自由度再开根；F 是两个卡方各除自由度之比。',
        formula: 't=\\frac{Z}{\\sqrt{\\chi^{2}/n}}',
      },
      {
        title: '样本均值标准化',
        body: '总体方差已知时用正态；未知时把标准差换成样本标准差，分布就变成 t，自由度是样本量减一。',
        formula: '\\frac{\\bar X-\\mu}{S/\\sqrt{n}}\\sim t(n-1)',
      },
      {
        title: '记基本数字特征',
        body: '卡方期望等于自由度、方差是两倍自由度；t 关于零对称，期望为零；F 的期望在自由度大于二时为对应比值。',
      },
      {
        title: '查表与近似',
        body: '样本量大时 t 接近正态，可以用正态分位数近似，这是工程里常用的简化。',
      },
      {
        title: '方差未知用 t',
        body: '总体方差未知时改查 t 表。',
      },
    ],
    pitfalls: [
      '方差未知仍用正态：应改用 t 分布。',
      '自由度算错：t 分布是 n 减一。',
      '样本量大时仍查 t 表：可用正态近似。',
    ],
    example: {
      problem: '样本量 10、总体方差未知时，样本均值标准化后服从什么分布？',
      walkthrough: [
        '总体方差未知，不能用正态。',
        '用样本标准差替换，构造比值。',
        '自由度为样本量减一。',
        '因此服从自由度为九的 t 分布。',
      ],
      result: '自由度为 9 的 t 分布。',
    },    moreExamples: [
      {
        problem: '卡方分布自由度五的期望与方差。',
        walkthrough: [
          '期望等于自由度。',
          '方差是两倍自由度。',
        ],
        result: 'E=5,\\,D=10',
      },
    ],

  },
  {
    id: 'hypothesis-testing',
    title: '假设检验：p 值与两类错误',
    tag: '概率',
    level: '进阶',
    essence:
      '假设检验先假定原假设成立，再看样本结果有多不可能。p 值就是这个不可能程度的量化；小于显著性水平就拒绝原假设。',
    definition:
      '假设检验先假定原假设成立，计算样本结果的极端程度即 p 值，小于显著性水平就拒绝原假设；两类错误分别是被控的第一类与与样本量有关的第二类。',
    whenToUse: [
      '判断均值、比例、方差是否等于某值',
      '比较两组数据是否有显著差异',
      '读懂论文或报告里的 p 值',
    ],
    theorems: [
      {
        name: 'p 值判据',
        statement: 'p 值小于显著性水平时拒绝原假设。',
        formula: 'p<\\alpha\\;\\Rightarrow\\;\\text{reject }H_0',
      },
      {
        name: '两类错误',
        statement: '第一类错误概率被显著性水平控制，第二类错误随样本量增大而减小。',
      },
    ],
    steps: [
      {
        title: '写两个假设',
        body: '原假设通常取「没有差异」，备择假设是研究者想证明的。两者互斥且穷尽。',
      },
      {
        title: '选统计量',
        body: '均值检验用 z 或 t，方差检验用卡方，两组方差比较用 F。选错统计量是最常见的错误。',
        formula: 'z=\\frac{\\bar X-\\mu_0}{\\sigma/\\sqrt{n}}',
      },
      {
        title: '算 p 值并决策',
        body: 'p 值小于显著性水平就拒绝原假设。p 值不是「原假设为真的概率」，这是最常被误读的一句。',
      },
      {
        title: '理解两类错误',
        body: '第一类错误是原假设为真却拒绝，概率被显著性水平控制；第二类错误是原假设为假却没拒绝，与样本量有关。',
      },
      {
        title: '先写清两个假设',
        body: '原假设取无差异，备择假设是研究者想证明的。',
      },
    ],
    pitfalls: [
      'p 值当原假设为真的概率：这是常见误读。',
      '统计显著当实际重要：显著性不等于效应大。',
      '多重比较不校正：会抬高假阳性率。',
    ],
    example: {
      problem: '显著性水平取百分之五，计算得到 p 值 0.03，如何判断？',
      walkthrough: [
        '把 p 值与显著性水平比较。',
        '零点零三小于零点零五。',
        '因此拒绝原假设。',
      ],
      result: '拒绝原假设，认为差异显著。',
    },    moreExamples: [
      {
        problem: '显著性水平零点零五、p 值为零点零三时的结论。',
        walkthrough: [
          '比较 p 值与显著性水平。',
          '零点零三小于零点零五。',
          '拒绝原假设。',
        ],
        result: '\\text{reject }H_0',
      },
    ],

  },
  {
    id: 'classical-probability',
    title: '古典概型：数得清才能算得准',
    tag: '概率',
    level: '进阶',
    essence:
      '古典概型要求样本点有限且等可能，概率就是有利结果数除以总结果数。难的不是公式，是把「结果」数对。',
    definition:
      '古典概型要求样本空间有限且每个样本点等可能，此时事件的概率等于有利样本点数除以总样本点数。',
    whenToUse: ['有限个等可能结果', '组合计数是主要工具', '几何概型则把计数换成面积比'],
    theorems: [
      {
        name: '古典概率',
        statement: '有利结果数除以总结果数。',
        formula: 'P(A)=\\frac{|A|}{|\\Omega|}',
      },
      {
        name: '加法公式',
        statement: '互斥事件概率相加，一般情形要减去交集。',
        formula: 'P(A\\cup B)=P(A)+P(B)-P(AB)',
      },
    ],
    steps: [
      {
        title: '先定样本空间',
        body: '数清楚一共有多少种等可能结果，这一步决定分母。',
      },
      {
        title: '再数有利结果',
        body: '用排列组合数有利情形，注意区分有序与无序。',
      },
      {
        title: '检查等可能性',
        body: '若各结果不等可能，就不能用古典公式，要换成条件概率或分布。',
      },
      {
        title: '几何概型换面积',
        body: '结果连续时，概率等于有利区域的测度除以总区域的测度。',
      },
      {
        title: '先数分母',
        body: '总结果数决定分母，再数有利结果。',
      },
    ],
    pitfalls: [
      '结果不等可能就用：各样本点必须等可能。',
      '有序无序混算：分子分母计数方式要一致。',
      '忘记扣重复：并事件要减去交集。',
    ],
    example: {
      problem: '袋中有 3 红 2 白，任取 2 个，求恰好 1 红 1 白的概率。',
      walkthrough: [
        '总取法是从 5 个里取 2 个，共 10 种。',
        '有利情形是 3 红取 1 乘 2 白取 1，共 6 种。',
        '概率为 6/10，即 3/5。',
      ],
      result: '概率为 3/5。',
    },    moreExamples: [
      {
        problem: '袋中三红两白，任取两个，求恰好一红一白的概率。',
        walkthrough: [
          '总取法为五选二。',
          '有利情形为三选一乘二选一。',
          '相比得五分之三。',
        ],
        result: '\\frac{3}{5}',
      },
    ],

  },
  {
    id: 'normal-distribution',
    title: '正态分布：标准化与查表',
    tag: '概率',
    level: '进阶',
    essence:
      '正态分布由均值与标准差完全确定。任何正态都可以通过标准化变成标准正态，于是查一张表就能算所有概率。',
    definition:
      '正态分布由均值与标准差确定，密度关于均值对称。任何正态变量减均值再除以标准差都变成标准正态。',
    whenToUse: ['题目给出正态分布求概率', '反过来由概率求分位数', '近似计算二项分布'],
    theorems: [
      {
        name: '标准化',
        statement: '减均值除以标准差后服从标准正态分布。',
        formula: 'Z=\\frac{X-\\mu}{\\sigma}',
      },
      {
        name: '对称性',
        statement: '标准正态分布关于零对称，负值概率可由正值概率补出。',
        formula: '\\Phi(-z)=1-\\Phi(z)',
      },
    ],
    steps: [
      {
        title: '记住两个参数',
        body: '均值决定位置，标准差决定胖瘦；标准化就是减均值再除以标准差。',
        formula: 'Z=\\dfrac{X-\\mu}{\\sigma}',
      },
      {
        title: '转成标准正态',
        body: '标准化后查标准正态分布表，得到累积概率。',
      },
      {
        title: '注意对称性',
        body: '标准正态关于零对称，于是负值概率可以用 1 减正值概率。',
        formula: '\\Phi(-z)=1-\\Phi(z)',
      },
      {
        title: '三分之一定则',
        body: '一倍标准差内约 68%，两倍约 95%，三倍约 99.7%，用于快速估算。',
      },
      {
        title: '先标准化',
        body: '任何正态先转标准正态再查表。',
      },
    ],
    pitfalls: [
      '忘记标准化：直接查表必须先转标准正态。',
      '对称性用错：负值要用一减。',
      '标准差与方差混：公式里是标准差。',
    ],
    example: {
      problem: '已知成绩服从均值 70、标准差 10 的正态分布，求 80 分以上的比例。',
      walkthrough: [
        '标准化得 (80-70)/10 = 1。',
        '查表得小于 1 的概率约 0.841。',
        '因此大于 1 的概率约 0.159。',
      ],
      result: '约 15.9%。',
    },    moreExamples: [
      {
        problem: '均值七十、标准差十的成绩，八十分以上的比例。',
        walkthrough: [
          '标准化得一点零。',
          '查表得小于一的概率约零点八四。',
          '补集约零点一六。',
        ],
        result: '0.159',
      },
    ],

  },
  {
    id: 'covariance-correlation',
    title: '协方差与相关系数',
    tag: '概率',
    level: '进阶',
    essence:
      '协方差衡量两个变量同向变动的程度，但带量纲；除以两个标准差得到相关系数，范围限定在负一到一。',
    definition:
      '协方差衡量两个变量同向变动的程度，带量纲；除以两个标准差得到相关系数，范围在负一到一之间。',
    whenToUse: ['判断两个变量是否线性相关', '计算组合方差', '回归分析的基础'],
    theorems: [
      {
        name: '协方差公式',
        statement: '协方差等于乘积期望减期望之积。',
        formula: 'Cov(X,Y)=E(XY)-E(X)E(Y)',
      },
      {
        name: '组合方差',
        statement: '和的方差等于方差之和加两倍协方差。',
        formula: 'D(X+Y)=D(X)+D(Y)+2Cov(X,Y)',
      },
    ],
    steps: [
      {
        title: '先算协方差',
        body: '协方差等于乘积的期望减去期望之积。',
        formula: 'Cov(X,Y)=E(XY)-E(X)E(Y)',
      },
      {
        title: '再标准化',
        body: '除以两个标准差得到相关系数，消掉量纲。',
        formula: '\\rho=\\dfrac{Cov(X,Y)}{\\sigma_X\\sigma_Y}',
      },
      {
        title: '相关系数为零不等于独立',
        body: '它只衡量线性关系；非线性关系可能相关但系数为零。',
      },
      {
        title: '组合方差公式',
        body: '和的方差等于方差之和加两倍协方差，这是风险分散的数学来源。',
      },
      {
        title: '协方差看同向',
        body: '正协方差表示同向变动，负表示反向。',
      },
    ],
    pitfalls: [
      '相关系数为零当独立：只排除线性关系。',
      '忘记除以标准差：协方差与相关系数不同。',
      '独立与不相关混淆：独立一定不相关，反之不然。',
    ],
    example: {
      problem: '两个变量独立且方差都为 1，求它们和的方差。',
      walkthrough: [
        '独立意味着协方差为零。',
        '和的方差等于两方差之和。',
        '结果为 2。',
      ],
      result: '方差为 2。',
    },    moreExamples: [
      {
        problem: '两个独立变量方差都为一，求和的方差。',
        walkthrough: [
          '独立则协方差为零。',
          '方差相加得二。',
        ],
        result: '2',
      },
    ],

  },
  {
    id: 'statistics-basics',
    title: '样本与统计量：自由度从哪来',
    tag: '概率',
    level: '进阶',
    essence:
      '统计量是样本的函数。样本方差除以 n-1 而不是 n，是为了让它无偏——这背后是「用样本均值代替总体均值」损失了一个自由度。',
    definition:
      '统计量是样本的函数且不含未知参数。样本均值无偏，样本方差除以 n 减一才无偏，因为用样本均值代替总体均值损失一个自由度。',
    whenToUse: ['理解样本均值与样本方差', '判断统计量是否无偏', '计算标准误'],
    theorems: [
      {
        name: '样本均值性质',
        statement: '均值的期望等于总体均值，方差是总体方差除以样本量。',
        formula: 'D\\bar X=\\frac{\\sigma^{2}}{n}',
      },
      {
        name: '无偏样本方差',
        statement: '除以 n 减一的样本方差是总体方差的无偏估计。',
        formula: 'S^{2}=\\frac{1}{n-1}\\sum(X_i-\\bar X)^{2}',
      },
    ],
    steps: [
      {
        title: '区分样本与总体',
        body: '样本是观测到的有限个值，统计量不含未知参数。',
      },
      {
        title: '样本均值无偏',
        body: '均值的期望等于总体均值，方差缩小为原来的 n 分之一。',
        formula: 'D\\bar X=\\dfrac{\\sigma^{2}}{n}',
      },
      {
        title: '样本方差除 n-1',
        body: '若除以 n 会系统性低估总体方差，除以 n-1 才无偏。',
        formula: 'S^{2}=\\dfrac{1}{n-1}\\sum(X_i-\\bar X)^{2}',
      },
      {
        title: '自由度解释',
        body: 'n 个偏差受「和为零」约束，独立变化只有 n-1 个。',
      },
      {
        title: '除 n 减一',
        body: '样本方差要除自由度，才无偏。',
      },
    ],
    pitfalls: [
      '除以 n 当无偏：会系统性低估。',
      '把统计量当参数：统计量只依赖样本。',
      '自由度解释错：n 个偏差受和为零约束。',
    ],
    example: {
      problem: '样本量 10，总体方差 4，求样本均值的方差。',
      walkthrough: [
        '均值方差是总体方差除以样本量。',
        '4 除以 10。',
        '结果为 0.4。',
      ],
      result: '方差为 0.4。',
    },    moreExamples: [
      {
        problem: '样本量为十、总体方差为四，求样本均值的方差。',
        walkthrough: [
          '均值方差等于总体方差除以样本量。',
          '四除以十。',
        ],
        result: '0.4',
      },
    ],

  },
  {
    id: 'maximum-likelihood',
    title: '最大似然估计：让数据最可能出现',
    tag: '概率',
    level: '进阶',
    essence:
      '最大似然的思想是：既然观测到了这组数据，就选让这组数据出现概率最大的参数。做法是写似然函数、取对数、求导置零。',
    definition:
      '最大似然估计选让观测数据出现概率最大的参数：写似然函数、取对数、对参数求导置零，解出估计量。',
    whenToUse: ['求未知参数的估计量', '题目出现「样本来自某分布」', '与矩估计对比'],
    theorems: [
      {
        name: '似然函数',
        statement: '独立样本的似然是各样本密度的乘积。',
        formula: 'L(\\theta)=\\prod f(x_i;\\theta)',
      },
      {
        name: '对数似然',
        statement: '取对数不改变极值点，把乘积化为求和便于求导。',
        formula: '\\ell(\\theta)=\\sum\\ln f(x_i;\\theta)',
      },
    ],
    steps: [
      {
        title: '写似然函数',
        body: '把 n 个观测的密度（或概率）相乘，得到关于参数的函数。',
        formula: 'L(\\theta)=\\prod f(x_i;\\theta)',
      },
      {
        title: '取对数化乘为加',
        body: '乘积求导麻烦，取对数后单调性不变，极值点相同。',
      },
      {
        title: '求导置零解参数',
        body: '对数似然对参数求导，令其为零，解出的驻点就是估计量。',
      },
      {
        title: '检查边界',
        body: '参数空间有界时，最大值可能在边界，不能只解方程。',
      },
      {
        title: '取对数再求导',
        body: '乘积取对数化加，极值点不变。',
      },
    ],
    pitfalls: [
      '忘记取对数：直接对乘积求导很麻烦。',
      '忽略参数范围：极值可能在边界。',
      '把估计量当参数：估计量是随机变量。',
    ],
    example: {
      problem: '样本来自指数分布，参数为 λ，求 λ 的最大似然估计。',
      walkthrough: [
        '似然函数是 λ 的 n 次方乘指数项。',
        '取对数后求导。',
        '解出估计量等于样本均值的倒数。',
      ],
      result: '估计量为样本均值的倒数。',
    },    moreExamples: [
      {
        problem: '指数分布参数的最大似然估计。',
        walkthrough: [
          '似然为参数的 n 次方乘指数项。',
          '取对数后求导置零。',
          '解出估计量为样本均值的倒数。',
        ],
        result: '\\hat\\lambda=\\frac{1}{\\bar X}',
      },
    ],

  },
  {
    id: 'set-basics',
    title: '集合与子集：数学的第一层语言',
    tag: '集合论',
    level: '进阶',
    essence:
      '集合是不定义的基本概念，但它的运算（并、交、差、幂集）有严格规则。所有数学对象最终都能写成集合。',
    definition:
      '集合是一些对象的全体，对象称为元素。若 A 的每个元素都属于 B，则称 A 是 B 的子集，记作 A ⊆ B；A 与 B 元素完全相同则相等。不含任何元素的集合叫空集。',
    whenToUse: ['判断两个集合的包含与相等', '计算并交差与幂集', '证明集合恒等式'],
    theorems: [
      {
        name: '子集判据',
        statement: 'A ⊆ B 当且仅当对任意 x，x 属于 A 推出 x 属于 B。',
        formula: 'A\\subseteq B\\;\\Leftrightarrow\\;\\forall x(x\\in A\\Rightarrow x\\in B)',
      },
      {
        name: '幂集大小',
        statement: '有限集合的幂集含 2 的 n 次方个元素。',
        formula: '|P(A)|=2^{|A|}',
      },
    ],
    steps: [
      {
        title: '先看元素',
        body: '要证包含关系，就从「任取一个元素」开始，推出它属于另一个集合。',
      },
      {
        title: '利用运算律',
        body: '并交差满足分配律与德摩根律，可把复杂表达式化简。',
        formula: 'A\\cap(B\\cup C)=(A\\cap B)\\cup(A\\cap C)',
      },
      {
        title: '处理空集',
        body: '空集是任何集合的子集，这一点在证明中常被忽略。',
      },
      {
        title: '幂集按元素计',
        body: '幂集元素是子集，不是原集合的元素，计数时用二的幂。',
      },
      {
        title: '回头验证',
        body: '用具体小集合代入检验恒等式，能快速发现符号错误。',
      },
    ],
    pitfalls: [
      '把元素与子集混淆：a 属于 A 与 a 包含于 A 是两件事。',
      '忽略空集：空集是任何集合的子集，且只有一个。',
      '幂集元素当元素：幂集的元素是子集。',
    ],
    example: {
      problem: '集合为一、二，求它的幂集。',
      walkthrough: [
        '空集是子集。',
        '单元素子集有两个。',
        '本身也是子集。',
      ],
      result: '四个子集，共 2 的 2 次方个',
    },
    moreExamples: [
      {
        problem: '证明空集是任何集合的子集。',
        walkthrough: ['任取元素属于空集。', '空集没有元素，命题空虚成立。', '因此包含关系成立。'],
        result: '\\varnothing\\subseteq A',
      },
    ],
  },
  {
    id: 'relations-functions',
    title: '关系与函数：有序对搭起的结构',
    tag: '集合论',
    level: '进阶',
    essence:
      '关系是有序对的集合，函数是特殊的关系。把「对应」写成集合，才能用集合论讨论函数。',
    definition:
      '两个集合的笛卡尔积是所有有序对构成的集合。笛卡尔积的子集叫二元关系；若对第一个集合的每个元素恰有一个第二个集合的元素与之对应，则这个关系是函数。',
    whenToUse: ['判断关系是否为函数', '计算笛卡尔积与定义域值域', '把映射写成集合'],
    theorems: [
      {
        name: '函数即关系',
        statement: '函数是满足单值性的关系：每个原像对应唯一的像。',
        formula: 'f\\subseteq A\\times B,\\;\\forall a\\exists! b\\,(a,b)\\in f',
      },
      {
        name: '笛卡尔积大小',
        statement: '有限集合的笛卡尔积元素个数等于两集合大小之积。',
        formula: '|A\\times B|=|A|\\cdot|B|',
      },
    ],
    steps: [
      {
        title: '先写有序对',
        body: '关系是集合，元素是有序对，顺序不能交换。',
      },
      {
        title: '检查单值性',
        body: '函数要求每个输入只对应一个输出，违反就不是函数。',
      },
      {
        title: '确定定义域',
        body: '定义域是关系中出现的第一分量全体，可能小于原集合。',
      },
      {
        title: '复合按顺序',
        body: '函数复合从右往左作用，写反顺序结果会变。',
      },
      {
        title: '核对像与原像',
        body: '值域是像的集合，不一定是目标集合全体。',
      },
    ],
    pitfalls: [
      '把关系当函数：允许多值的关系不是函数。',
      '定义域写错：关系的第一分量集合才是定义域。',
      '复合顺序反：先作用的写在右边。',
    ],
    example: {
      problem: '两个元素的集合与三个元素的集合，笛卡尔积有多少元素？',
      walkthrough: [
        '每个第一集合元素配三个第二集合元素。',
        '二乘三。',
      ],
      result: '6',
    },
    moreExamples: [
      {
        problem: '关系一、二、一、三是否构成函数？',
        walkthrough: ['同一个第一分量对应两个第二分量。', '违反单值性。', '不是函数。'],
        result: '不是函数',
      },
    ],
  },
  {
    id: 'equivalence-quotient',
    title: '等价关系与商集：把相同的东西粘起来',
    tag: '集合论',
    level: '进阶',
    essence:
      '等价关系把集合划分成互不相交的等价类，商集就是这些类的集合。这是「模运算」「商空间」的统一来源。',
    definition:
      '关系同时满足自反、对称、传递三条性质时叫等价关系。每个元素的等价类是与它等价的元素全体，所有等价类构成商集。',
    whenToUse: ['判断关系是否等价', '求等价类与商集', '构造模运算与商结构'],
    theorems: [
      {
        name: '等价类构成划分',
        statement: '等价类两两不交，并起来是整个集合。',
        formula: 'A=\\bigcup_{[a]\\in A/\\sim}[a]',
      },
      {
        name: '等价关系与划分一一对应',
        statement: '给定集合的每个划分都来自唯一的等价关系。',
      },
    ],
    steps: [
      {
        title: '验三条性质',
        body: '自反、对称、传递缺一不可，逐条检验。',
      },
      {
        title: '求等价类',
        body: '固定一个元素，找出所有与它等价的元素。',
      },
      {
        title: '看是否覆盖',
        body: '等价类并起来必须等于原集合，否则关系不完备。',
      },
      {
        title: '写商集',
        body: '商集的元素是等价类，不是原元素。',
      },
      {
        title: '联系模运算',
        body: '整数模 n 同余就是标准例子，商集有 n 个元素。',
      },
    ],
    pitfalls: [
      '漏验传递性：最容易被忽略的一条。',
      '等价类当元素：商集元素是类。',
      '类之间相交：等价类要么相同要么不交。',
    ],
    example: {
      problem: '整数模三同余的商集有几个元素？',
      walkthrough: [
        '等价类按余数分。',
        '余数有零、一、二三种。',
      ],
      result: '3',
    },
    moreExamples: [
      {
        problem: '「小于等于」是等价关系吗？',
        walkthrough: ['自反成立。', '对称不成立：三小于四但四不小于三。', '因此不是等价关系。'],
        result: '不是',
      },
    ],
  },
  {
    id: 'order-relations',
    title: '序关系与良序：比较大小的抽象',
    tag: '集合论',
    level: '进阶',
    essence:
      '偏序只要求自反、反对称、传递，不要求任意两个元素可比。良序是更强的要求：每个非空子集都有最小元。',
    definition:
      '集合上的关系若满足自反、反对称、传递，称为偏序。若任意两个元素都可比则称全序。全序且每个非空子集有最小元，称为良序。',
    whenToUse: ['判断偏序与全序', '用哈斯图表示偏序', '理解超限归纳与佐恩引理'],
    theorems: [
      {
        name: '良序即归纳可用',
        statement: '良序集上可以做超限归纳：若每个前段成立可推出当前成立，则全体成立。',
      },
      {
        name: '佐恩引理',
        statement: '若偏序集每条链都有上界，则存在极大元。它与选择公理等价。',
      },
    ],
    steps: [
      {
        title: '先画哈斯图',
        body: '去掉自反与传递边，只留覆盖关系，结构一目了然。',
      },
      {
        title: '找不可比元素',
        body: '偏序中可能存在互不可比的两元素，这不是错误。',
      },
      {
        title: '区分全序',
        body: '全序要求任意两个元素可比。',
      },
      {
        title: '找最小元',
        body: '良序要求每个非空子集有最小元，不只是整个集合。',
      },
      {
        title: '联系选择公理',
        body: '良序定理、佐恩引理、选择公理三者等价。',
      },
    ],
    pitfalls: [
      '把偏序当全序：不可比是正常的。',
      '最小元与极小元混淆：最小元要比所有元素小。',
      '良序与全序混淆：有理数全序但不良序。',
    ],
    example: {
      problem: '自然数集在通常大小关系下是否良序？',
      walkthrough: [
        '任意两个自然数可比。',
        '任意非空子集有最小元。',
      ],
      result: '是良序',
    },
    moreExamples: [
      {
        problem: '整数集在通常大小关系下是否良序？',
        walkthrough: ['存在没有最小元的非空子集。', '例如全体整数本身。'],
        result: '不是良序',
      },
    ],
  },
  {
    id: 'propositional-logic',
    title: '命题逻辑：联结词与真值表',
    tag: '数理逻辑',
    level: '进阶',
    essence: '命题逻辑只关心真假，不关心内容。五个联结词的真值表决定了复合命题的真假，是一切推理的起点。',
    definition: '命题是能判断真假的陈述句。由原子命题经否定、合取、析取、蕴含、等价五种联结词构成的表达式叫合式公式，其真值由原子命题的真值按真值表唯一确定。',
    whenToUse: ['判断复合命题真假', '化简逻辑表达式', '为推理找反例'],
    theorems: [
      { name: '蕴含的真值', statement: '蕴含只有在「前件真、后件假」时为假，其余都为真。',
        formula: 'P\\to Q\\equiv\\neg P\\vee Q', },
      { name: '德摩根律', statement: '否定合取等于析取否定，否定析取等于合取否定。',
        formula: '\\neg(P\\wedge Q)\\equiv\\neg P\\vee\\neg Q', },
    ],
    steps: [
      { title: '拆原子命题', body: '先把自然语言句子拆成原子命题，再确定联结词结构。', },
      { title: '列真值表', body: 'n 个原子命题有 2 的 n 次方行，逐行算复合命题真值。', },
      { title: '识别重言式', body: '所有行都为真的公式是重言式，是有效推理的基础。',
        formula: '\\models P\\vee\\neg P', },
      { title: '用等价变形化简', body: '蕴含化否定析取、德摩根律、分配律是主要工具。', },
      { title: '找反例检验', body: '只需一行真值让前件真后件假，就能否定蕴含。', },
    ],
    pitfalls: ['把蕴含当前提必然真：前件为假时蕴含恒真。', '混淆必要条件与充分条件：P 蕴含 Q 中 P 是充分条件。', '真值表少列一行：n 个原子必须有 2 的 n 次方行。'],
    example: {
      problem: '判断「若 $P$ 真则 $Q$ 真」在 $P$ 真 $Q$ 假时的真假。',
      walkthrough: ['这是蕴含式。', '前件真、后件假。', '只有这一种情况蕴含为假。'],
      result: '假',
    },
    moreExamples: [
      { problem: '判断 $P\\vee\\neg P$ 是否为重言式。', walkthrough: ['P 真时析取为真。', 'P 假时否定为真，析取仍真。', '所有情况为真。'], result: '是重言式' },
    ],
  },
  {
    id: 'first-order-logic',
    title: '一阶逻辑：量词与解释',
    tag: '数理逻辑',
    level: '进阶',
    essence: '一阶逻辑在命题逻辑上加了个体词、谓词与量词，能表达「所有」「存在」，是数学陈述的标准语言。',
    definition: '一阶语言由常元、函数符号、谓词符号与变量构成，加上量词与联结词。给定论域与符号的解释，公式才谈得上真假；自由变量需赋值。',
    whenToUse: ['把数学命题形式化', '判断公式在结构中是否成立', '区分语法与语义'],
    theorems: [
      { name: '全称与存在', statement: '全称量词要求论域中每个元素都满足，存在量词只要有一个。',
        formula: '\\forall x\\,P(x),\\quad\\exists x\\,P(x)', },
      { name: '量词否定', statement: '全称的否定是存在否定，存在的否定是全称否定。',
        formula: '\\neg\\forall xP(x)\\equiv\\exists x\\neg P(x)', },
    ],
    steps: [
      { title: '定论域', body: '先明确讨论的对象范围，论域不同真假可能相反。', },
      { title: '写原子公式', body: '用谓词符号表示关系，用函数符号表示运算。', },
      { title: '加量词', body: '确定每个变量的量词与辖域，注意同名变量遮蔽。', },
      { title: '代解释', body: '把符号换成具体关系，再判断真假。', },
      { title: '用否定变形', body: '把否定推进到量词内部，便于反证。', },
    ],
    pitfalls: ['量词顺序交换：全称存在与存在全称真假不同。', '自由变量当命题：未约束的变量使公式没有真值。', '辖域看错：量词只管它后面的部分。'],
    example: {
      problem: '在自然数上判断 $\\forall x\\exists y(x<y)$ 是否成立。',
      walkthrough: ['任取自然数 x。', '取 y 等于 x 加一。', '满足小于关系。'],
      result: '成立',
    },
    moreExamples: [
      { problem: '在自然数上 $\\exists y\\forall x(x<y)$ 是否成立？', walkthrough: ['需要有一个数比所有自然数都大。', '自然数无上界。', '不成立。'], result: '不成立' },
    ],
  },
  {
    id: 'proof-systems',
    title: '证明系统：从公理到可证',
    tag: '数理逻辑',
    level: '竞赛',
    essence: '证明系统把「可证」变成纯语法操作。可靠性说可证的一定真，完备性说真的一定可证。',
    definition: '形式证明是有限公式序列，每步或是公理，或由前面的公式经推理规则得到。末项叫定理，记作可证。语法上的可证与语义上的真由可靠性与完备性两个定理连接。',
    whenToUse: ['理解可证与真的区别', '判断推理规则是否保真', '为形式化验证打基础'],
    theorems: [
      { name: '可靠性', statement: '可证的公式在所有解释下都为真。',
        formula: '\\vdash\\varphi\\;\\Rightarrow\\;\\models\\varphi', },
      { name: '完备性', statement: '一阶逻辑中真的公式一定可证。',
        formula: '\\models\\varphi\\;\\Rightarrow\\;\\vdash\\varphi', },
    ],
    steps: [
      { title: '列公理', body: '选一套公理系统，常见有希尔伯特式与自然演绎。', },
      { title: '用推理规则', body: '分离规则是最基本的：由 P 与 P 蕴含 Q 得 Q。', },
      { title: '逐步构造', body: '每一步都要能说明来源，不能跳步。', },
      { title: '检查是否保真', body: '可靠系统的规则必须保真，否则会证出假命题。', },
      { title: '区分两个方向', body: '可证推出真容易，真推出可证需要完备性定理。', },
    ],
    pitfalls: ['把可证当显然：可证是语法概念，需要具体系统。', '混淆可靠与完备：方向相反。', '跳步：形式证明要求每步可查。'],
    example: {
      problem: '由 $P$ 与 $P\\to Q$ 能推出什么？',
      walkthrough: ['这是分离规则。', '前件成立且蕴含成立。', '得到后件。'],
      result: 'Q',
    },
    moreExamples: [
      { problem: '若系统能证出矛盾，可靠性还成立吗？', walkthrough: ['矛盾在所有解释下都为假。', '若可证则按可靠性应为真。', '因此不可靠。'], result: '不成立' },
    ],
  },
  {
    id: 'godel-incompleteness',
    title: '哥德尔不完备定理：真理多于可证',
    tag: '数理逻辑',
    level: '竞赛',
    essence: '任何足够强且一致的形式系统都存在既不能证明也不能否证的命题。数学真理不等于可证性。',
    definition: '第一不完备定理：包含算术的一致形式系统中存在不可判定的句子。第二不完备定理：这样的系统不能证明自身的一致性。证明核心是把语法编码成算术（哥德尔编码），构造自指句子。',
    whenToUse: ['理解形式系统的局限', '知道一致性与完备性的区别', '避免「一切都能证明」的误解'],
    theorems: [
      { name: '第一不完备定理', statement: '足够强且一致的系统存在不可判定命题。',
        formula: 'T\\nvdash G\\;\\text{and}\\;T\\nvdash\\neg G', },
      { name: '第二不完备定理', statement: '系统不能在自身内部证明自己的一致性。', },
    ],
    steps: [
      { title: '编码语法', body: '给符号、公式、证明编号，使语法操作变成算术。', },
      { title: '构造自指', body: '用对角线法造出「本句不可证」的句子。', },
      { title: '分析两种假设', body: '若可证则矛盾，若否定可证则矛盾。', },
      { title: '得出结论', body: '因此该句不可判定，系统不完备。', },
      { title: '推广到一致性', body: '把「系统一致」也编码，得到第二定理。', },
    ],
    pitfalls: ['误解为「数学不完备」：指形式系统，不是数学本身。', '忽略「足够强」条件：弱系统可能既一致又完备。', '把不可判定当不可知：句子为真但不可证。'],
    example: {
      problem: '哥德尔句 $G$ 为真吗？',
      walkthrough: ['G 声称自己不可证。', '由第一定理 G 确实不可证。', '因此 G 说的是真的。'],
      result: '为真但不可证',
    },
    moreExamples: [
      { problem: '一致但弱的系统（如只有命题逻辑）会不完备吗？', walkthrough: ['不完备定理要求系统能表达算术。', '太弱的系统可能完备。'], result: '不一定' },
    ],
  },
  {
    id: 'zfc-axioms',
    title: 'ZFC 公理系统：用规则重建集合',
    tag: '公理化集合论',
    level: '竞赛',
    essence: '罗素悖论说明「任意性质都能构成集合」行不通。ZFC 用一组公理规定哪些集合存在，避免自指矛盾。',
    definition: 'ZFC 由外延、空集、配对、并集、幂集、分离、替换、无穷、正则、选择等公理组成。分离公理只允许从已有集合中筛出子集，不再允许无限制概括。',
    whenToUse: ['判断朴素构造是否合法', '理解数学对象的存在依据', '阅读现代集合论文献'],
    theorems: [
      { name: '分离公理', statement: '只能从已知集合中取出满足性质的子集，不能凭空造集合。',
        formula: '\\{x\\in A:\\varphi(x)\\}', },
      { name: '正则公理', statement: '每个非空集合都有与自身不交的元素，排除自包含。',
        formula: '\\forall A\\ne\\varnothing\\,\\exists x\\in A\\,(x\\cap A=\\varnothing)', },
    ],
    steps: [
      { title: '先有母集', body: '造子集前必须先有已知集合，这是分离公理的要求。', },
      { title: '逐条对照', body: '判断构造合法时，找到它依据的公理。', },
      { title: '避免自指', body: '不允许「所有不含自身的集合」这类概括。', },
      { title: '无穷公理', body: '自然数集的存在性由无穷公理保证。', },
      { title: '选择公理单独看', body: '它不构造具体元素，只断言选择函数存在。', },
    ],
    pitfalls: ['无限制概括：罗素悖论的根源。', '把分离当造集：它只做筛选。', '忽略正则公理：自包含集合被排除。'],
    example: {
      problem: '「所有集合的集合」在 ZFC 中存在吗？',
      walkthrough: ['若存在，取它的幂集更大。', '与「所有」矛盾。'],
      result: '不存在',
    },
    moreExamples: [
      { problem: '$\\{x\\in A: x\\notin x\\}$ 是否合法？', walkthrough: ['有母集 A。', '符合分离公理。'], result: '合法' },
    ],
  },
  {
    id: 'ordinals',
    title: '序数与超限归纳',
    tag: '公理化集合论',
    level: '竞赛',
    essence: '序数是「数到无穷」的刻度。冯·诺依曼用「所有更小序数的集合」定义序数，使超限归纳成为可能。',
    definition: '序数是传递的良序集，用属于关系排序。自然数是有限序数，最小的无限序数记作 omega。序数上可做超限归纳与超限递归。',
    whenToUse: ['理解超限归纳', '比较良序集的长短', '为基数与累积层级编号'],
    theorems: [
      { name: '超限归纳', statement: '若每个序数的性质可由更小序数推出，则所有序数都成立。', },
      { name: '序数三分', statement: '任意两个序数可比，且属于、相等、反属于恰有一种成立。', },
    ],
    steps: [
      { title: '从自然数看起', body: '零是空集，后继是并上自身。', },
      { title: '后继与极限', body: '序数分后继序数与极限序数两类。', },
      { title: '归纳分两段', body: '超限归纳要处理后继步与极限步。', },
      { title: '比较大小', body: '序数比大小就是属于关系。', },
      { title: '用于基数', body: '基数是最小的同势序数。', },
    ],
    pitfalls: ['把序数当基数：序数管顺序，基数管大小。', '漏极限步：超限归纳必须处理极限序数。', '认为所有序数构成集合：全体序数不是集合。'],
    example: {
      problem: '最小的无限序数是哪个？',
      walkthrough: ['包含所有自然数。', '记作 omega。'],
      result: '\\omega',
    },
    moreExamples: [
      { problem: '全体序数是否构成集合？', walkthrough: ['若是集合则是序数。', '它属于自身，矛盾。'], result: '不构成集合' },
    ],
  },
  {
    id: 'cardinals-choice',
    title: '基数与选择公理',
    tag: '公理化集合论',
    level: '竞赛',
    essence: '基数是衡量集合大小的序数。选择公理断言任意族非空集合都有选择函数，它等价于良序定理与佐恩引理。',
    definition: '两个集合等势指存在双射，基数是最小的同势序数。选择公理：对任意非空集合族，存在函数从每个集合中选出一个元素。',
    whenToUse: ['比较无限集大小', '理解良序定理', '使用佐恩引理证明存在性'],
    theorems: [
      { name: '良序定理', statement: '每个集合都能被良序化，与选择公理等价。', },
      { name: '康托尔定理', statement: '幂集的基数严格大于原集合。',
        formula: '|P(A)|>|A|', },
    ],
    steps: [
      { title: '先找双射', body: '等势的判定标准是双射，不是包含关系。', },
      { title: '用康托尔定理', body: '证明不存在满射从集合到幂集。', },
      { title: '需要选择时声明', body: '非构造性存在证明通常依赖选择公理。', },
      { title: '用佐恩引理', body: '证明极大元存在时，先验证每条链有上界。', },
      { title: '区分可数与不可数', body: '自然数可数，实数不可数。', },
    ],
    pitfalls: ['把包含当更小：无限集可与真子集等势。', '默认选择公理：构造性证明中不能随便用。', '基数当序数：基数是最小的同势序数。'],
    example: {
      problem: '自然数集与实数集的基数哪个大？',
      walkthrough: ['自然数可数。', '实数不可数。', '因此实数基数更大。'],
      result: '实数更大',
    },
    moreExamples: [
      { problem: '选择公理对有限族需要吗？', walkthrough: ['有限族可逐个选。', '只有无限族才需要公理。'], result: '不需要' },
    ],
  },
  {
    id: 'consistency-independence',
    title: '相对一致性与独立性',
    tag: '公理化集合论',
    level: '竞赛',
    essence: '要证明一条命题独立于 ZFC，需要构造两个模型：一个让它真，一个让它假。连续统假设就是这样被证明独立的。',
    definition: '命题独立于公理系统，指系统既不能证明它也不能证明其否定。相对一致性用内模型或力迫法证明：若 ZFC 一致，则加上该命题仍一致。',
    whenToUse: ['理解连续统假设的地位', '知道相对一致性证明的思路', '读懂集合论前沿结论'],
    theorems: [
      { name: '哥德尔内模型', statement: '可构造集宇宙 L 满足选择公理与连续统假设。', },
      { name: '科恩力迫', statement: '力迫扩张可让连续统假设为假，因此它独立于 ZFC。', },
    ],
    steps: [
      { title: '先明确系统', body: '独立性总是相对于某个公理系统说的。', },
      { title: '构造内模型', body: '证明新命题在某个子模型中成立。', },
      { title: '构造扩张', body: '用力的方法让新命题的否定成立。', },
      { title: '推出独立', body: '两个方向都不能证，故独立。', },
      { title: '注意前提', body: '结论形如「若 ZFC 一致则……」。', },
    ],
    pitfalls: ['说「连续统假设是错的」：它只是独立。', '忽略一致性前提：相对一致性是条件结论。', '把独立当无关：独立命题仍有深刻影响。'],
    example: {
      problem: '连续统假设与 ZFC 的关系是什么？',
      walkthrough: ['哥德尔证明它在 L 中成立。', '科恩证明其否定可一致。', '因此独立。'],
      result: '独立于 ZFC',
    },
    moreExamples: [
      { problem: '独立性证明能否给出「真值」？', walkthrough: ['独立说明系统内不可判定。', '真值依赖所选模型。'], result: '不能' },
    ],
  },
  {
    id: 'sigma-algebra',
    title: '测度与 σ 代数：给集合指定大小',
    tag: '实分析',
    level: '竞赛',
    essence: '不是所有集合都能谈「大小」。σ 代数规定哪些集合可测，测度在这族集合上满足可列可加性。',
    definition: '集合族对补集与可列并封闭且含全集，称为 σ 代数。定义在其上的非负函数若空集为零且对可列不交并满足可加性，称为测度。',
    whenToUse: ['判断集合族是否构成 σ 代数', '构造勒贝格测度', '理解概率的公理化'],
    theorems: [
      { name: '可列可加', statement: '测度对可列个两两不交的可测集满足加性。',
        formula: '\\mu\\left(\\bigcup A_n\\right)=\\sum\\mu(A_n)', },
      { name: '由生成元构造', statement: '任意集合族都能生成包含它的最小 σ 代数。',
        formula: '\\sigma(\\mathcal{C})', },
    ],
    steps: [
      { title: '先验三条封闭性', body: '含全集、对补封闭、对可列并封闭，缺一不可。', },
      { title: '从半代数出发', body: '区间族生成的 σ 代数就是博雷尔集族。', },
      { title: '用可列可加算测度', body: '把集合拆成可列个不交部分再相加。', },
      { title: '处理零测集', body: '零测集的子集仍零测，可忽略。', },
      { title: '联系概率', body: '概率就是全测度为一的测度。', },
    ],
    pitfalls: ['只验有限并：σ 代数要求可列并。', '把测度当有限可加：可列可加才是关键。', '忽略零测集：它们不影响积分值。'],
    example: { problem: '实数轴上区间族生成的 σ 代数叫什么？', walkthrough: ['区间是最基本的生成元。', '生成的 σ 代数包含所有开集。'], result: '博雷尔 σ 代数' },
    moreExamples: [{ problem: '可数集的勒贝格测度是多少？', walkthrough: ['单点测度为零。', '可列可加。'], result: '0' },],
  },
  {
    id: 'measurable-functions',
    title: '可测函数：能谈积分的函数',
    tag: '实分析',
    level: '竞赛',
    essence: '可测函数是「每个水平集都可测」的函数。连续函数可测，可测函数的极限、和、积仍可测。',
    definition: '函数使每个水平集的原像可测，则称可测。等价地，对任意实数 a，集合 {x: f(x) > a} 可测。',
    whenToUse: ['判断函数是否可测', '构造简单函数逼近', '为勒贝格积分做准备'],
    theorems: [
      { name: '简单函数逼近', statement: '非负可测函数可被单调递增的简单函数列逼近。',
        formula: 'f=\\lim s_n', },
      { name: '可测性保持', statement: '可测函数的和、积、极限仍可测。', },
    ],
    steps: [
      { title: '看水平集', body: '检验 {f > a} 是否可测，是最直接的定义用法。', },
      { title: '从简单函数搭起', body: '先处理只取有限个值的函数。', },
      { title: '用逼近过渡', body: '把一般可测函数写成简单函数的极限。', },
      { title: '利用连续', body: '连续函数可测，可作为构造素材。', },
      { title: '注意几乎处处', body: '改动零测集上的值不改变可测性。', },
    ],
    pitfalls: ['把可测当连续：可测函数可以不连续。', '只验一个水平：要对所有 a 成立。', '忽略原像方向：是 f>a 的原像可测。'],
    example: { problem: '狄利克雷函数（有理数取 1、无理数取 0）可测吗？', walkthrough: ['有理数集可测。', '其原像可测。'], result: '可测' },
    moreExamples: [{ problem: '连续函数是否可测？', walkthrough: ['开集的原像是开集。', '开集可测。'], result: '可测' },],
  },
  {
    id: 'lebesgue-integral-theory',
    title: '勒贝格积分：从简单函数到一般函数',
    tag: '实分析',
    level: '竞赛',
    essence: '勒贝格积分先对简单函数定义，再用上确界推广到非负可测函数，最后用正负部分拆解一般可测函数。',
    definition: '非负简单函数的积分是取值乘测度求和。非负可测函数的积分是所有不超过它的简单函数积分之上确界。一般可测函数拆成正部与负部分别积分，两者都有限时称可积。',
    whenToUse: ['计算可测函数的积分', '判断可积性', '证明积分不等式'],
    theorems: [
      { name: '积分的线性', statement: '可积函数的和与数乘的积分等于积分的和与数乘。',
        formula: '\\int(af+bg)=a\\int f+b\\int g', },
      { name: '绝对可积', statement: '可积等价于绝对值的积分有限。',
        formula: '\\int|f|<\\infty', },
    ],
    steps: [
      { title: '先拆正负', body: '把函数写成正部减负部，分别处理。', },
      { title: '用简单函数逼近', body: '非负情形用单调简单函数列逼近。', },
      { title: '算极限', body: '积分等于简单函数积分的上确界。', },
      { title: '检查可积', body: '正负部分都有限才可积。', },
      { title: '与黎曼积分对照', body: '黎曼可积则勒贝格可积且值相同。', },
    ],
    pitfalls: ['把可积当积分有限：要正负部分都有限。', '忘记零测集：零测集上的值不影响积分。', '直接交换极限与积分：需要收敛定理保证。'],
    example: { problem: '有理数取 1、无理数取 0 的函数在零到一上的勒贝格积分？', walkthrough: ['有理数集测度为零。', '非零部分在零测集上。'], result: '0' },
    moreExamples: [{ problem: '黎曼可积的函数是否勒贝格可积？', walkthrough: ['黎曼可积意味着不连续点零测。', '因此勒贝格可积且值相同。'], result: '是' },],
  },
  {
    id: 'convergence-theorems',
    title: '收敛定理：什么时候能交换极限与积分',
    tag: '实分析',
    level: '竞赛',
    essence: '勒贝格积分最大的优势是三条收敛定理：单调收敛、法图引理、控制收敛，它们给出了交换极限与积分的充分条件。',
    definition: '单调收敛定理：非负可测函数单调递增时，极限的积分等于积分的极限。控制收敛定理：被一个可积函数控制时同样可交换。',
    whenToUse: ['证明积分与极限交换', '估计积分上界', '处理含参数的积分'],
    theorems: [
      { name: '单调收敛', statement: '非负且单调递增时可直接交换。',
        formula: '\\int\\lim f_n=\\lim\\int f_n', },
      { name: '控制收敛', statement: '被可积函数控制时可交换。',
        formula: '|f_n|\\le g,\\int g<\\infty', },
    ],
    steps: [
      { title: '先看单调性', body: '单调递增可直接用单调收敛定理。', },
      { title: '找控制函数', body: '不单调时找一个可积的 g 控制所有项。', },
      { title: '用法图引理', body: '只需下界估计时用法图引理。', },
      { title: '验证可积', body: '控制函数必须可积，否则结论不成立。', },
      { title: '反例检验', body: '没有控制时可能不交换，如尖峰函数列。', },
    ],
    pitfalls: ['无控制仍交换：尖峰函数列是反例。', '忽略非负前提：单调收敛要求非负。', '控制函数不可积：结论失效。'],
    example: { problem: '函数列在零到一上等于 n 倍示性函数（区间零到 n 分之一），积分极限与极限积分是否相等？', walkthrough: ['每项积分为一。', '极限函数几乎处处为零，积分为零。', '两者不等。'], result: '不相等' },
    moreExamples: [{ problem: '若函数列被常数一控制且收敛到零，积分极限是多少？', walkthrough: ['常数一在有限区间上可积。', '控制收敛定理可用。'], result: '0' },],
  },
  {
    id: 'complex-arithmetic',
    title: '复数与复平面：把数变成点',
    tag: '复分析',
    level: '基础',
    essence: '复数有代数与几何两副面孔：代数上是二元组，几何上是平面上的点。欧拉公式把指数与三角连接起来。',
    definition: '复数是形如 a 加 b i 的数，i 的平方为负一。模是到原点的距离，辐角是与实轴正方向的夹角；乘法等于模相乘、角相加。',
    whenToUse: ['计算复数的乘除与幂', '用几何直观理解复运算', '把三角恒等式化成复指数'],
    theorems: [
      { name: '欧拉公式', statement: '复指数等于余弦加 i 倍正弦。',
        formula: 'e^{i\\theta}=\\cos\\theta+i\\sin\\theta', },
      { name: '棣莫弗公式', statement: '复数幂的模取幂、角乘 n。',
        formula: 'z^{n}=r^{n}(\\cos n\\theta+i\\sin n\\theta)', },
    ],
    steps: [
      { title: '先化代数形', body: '加减用实部虚部分别处理。', },
      { title: '乘除用极形', body: '乘法模相乘角相加，除法模相除角相减。', },
      { title: '求模与辐角', body: '模是平方和开根，辐角用反正切并注意象限。', },
      { title: '用欧拉公式', body: '把三角运算换成指数运算，化简更快。', },
      { title: '注意多值性', body: '辐角有 2π 的多值性，开方会产生多个根。', },
    ],
    pitfalls: ['辐角象限判错：反正切只给主值。', '开方漏根：n 次方根有 n 个。', '把模当数：模是非负实数。'],
    example: { problem: '计算 $(1+i)^{2}$。', walkthrough: ['展开得 $1+2i+i^{2}$。', '$i^{2}=-1$。'], result: '2i' },
    moreExamples: [{ problem: '求 $e^{i\\pi}+1$。', walkthrough: ['$e^{i\\pi}=\\cos\\pi+i\\sin\\pi$。', '等于 $-1$。'], result: '0' },],
  },
  {
    id: 'analytic-functions',
    title: '解析函数与柯西－黎曼方程',
    tag: '复分析',
    level: '进阶',
    essence: '复可导比实可导强得多：要求沿所有方向逼近的差商相同。这等价于实部虚部满足柯西－黎曼方程。',
    definition: '函数在一点的邻域内处处复可导，则称在该点解析。若 f 等于 u 加 i v，则解析等价于 u、v 可微且满足 u 对 x 的偏导等于 v 对 y 的偏导、u 对 y 的偏导等于负的 v 对 x 的偏导。',
    whenToUse: ['判断函数是否解析', '由实部求虚部', '理解调和函数'],
    theorems: [
      { name: '柯西－黎曼方程', statement: '解析的必要条件，加上可微后充分。',
        formula: 'u_x=v_y,\\quad u_y=-v_x', },
      { name: '解析函数的实虚部调和', statement: '实部与虚部都满足拉普拉斯方程。',
        formula: '\\Delta u=0', },
    ],
    steps: [
      { title: '写出实虚部', body: '先把函数拆成 u 加 i v。', },
      { title: '验柯西－黎曼', body: '两个偏导等式都要满足。', },
      { title: '检查可微', body: '柯西－黎曼加可微才等价于解析。', },
      { title: '用调和性', body: '由实部可以反求虚部（差一个常数）。', },
      { title: '注意定义域', body: '在奇点处不解析，要挖洞。', },
    ],
    pitfalls: ['只验柯西－黎曼：还需可微。', '把共轭当解析：共轭函数不解析。', '忽略奇点：解析性要求邻域内处处可导。'],
    example: { problem: '验证 $z^{2}$ 的实虚部满足柯西－黎曼方程。', walkthrough: ['实部为 $x^{2}-y^{2}$，虚部为 $2xy$。', '$u_x=2x=v_y$，$u_y=-2y=-v_x$。'], result: '满足' },
    moreExamples: [{ problem: '函数 $|z|^{2}$ 在哪些点解析？', walkthrough: ['实部 $x^{2}+y^{2}$，虚部为零。', '柯西－黎曼只在原点成立。', '原点邻域不解析。'], result: '处处不解析' },],
  },
  {
    id: 'cauchy-integral',
    title: '柯西积分定理与积分公式',
    tag: '复分析',
    level: '进阶',
    essence: '解析函数沿闭曲线的积分为零；由这条定理可推出积分公式，把函数在内部的值由边界值决定。',
    definition: '若函数在单连通区域解析，则沿区域内任意闭曲线的积分为零。积分公式：内部一点的函数值等于沿边界积分除以二 π i 与差的商。',
    whenToUse: ['计算复积分', '用边界值求内部值', '证明解析函数无穷次可导'],
    theorems: [
      { name: '柯西积分定理', statement: '解析函数沿闭曲线积分为零。',
        formula: '\\oint_C f(z)\\,dz=0', },
      { name: '柯西积分公式', statement: '内部值由边界积分表示。',
        formula: 'f(a)=\\frac{1}{2\\pi i}\\oint_C\\frac{f(z)}{z-a}\\,dz', },
    ],
    steps: [
      { title: '先看是否解析', body: '区域内解析才能直接用定理。', },
      { title: '找奇点', body: '有洞的区域要挖去奇点再用。', },
      { title: '用积分公式', body: '被积函数有分母差时，直接用公式求值。', },
      { title: '高阶导数公式', body: '求导也可由积分表示，说明解析函数光滑。', },
      { title: '化为参数积分', body: '必要时参数化验证。', },
    ],
    pitfalls: ['区域有洞仍用：多连通要挖洞。', '奇点在曲线上：公式不适用。', '方向取反：逆时针为正。'],
    example: { problem: '计算沿单位圆顺时针的 $\\oint dz/z$。', walkthrough: ['被积函数在内部有奇点。', '逆时针值为 $2\\pi i$。', '顺时针取负。'], result: '-2\\pi i' },
    moreExamples: [{ problem: '$\\oint z\\,dz$ 沿任意闭曲线是多少？', walkthrough: ['$z$ 处处解析。', '由柯西定理。'], result: '0' },],
  },
  {
    id: 'residue-theorem',
    title: '留数定理：用奇点算积分',
    tag: '复分析',
    level: '竞赛',
    essence: '留数定理把闭曲线积分化为内部奇点留数之和。它让许多实积分可以用复方法轻易算出。',
    definition: '函数在孤立奇点处的留数是洛朗展开中负一次项的系数。留数定理：沿闭曲线的积分等于二 π i 乘内部所有奇点留数之和。',
    whenToUse: ['计算复积分', '算实积分（有理函数、三角积分）', '统计零点极点个数'],
    theorems: [
      { name: '留数定理', statement: '闭曲线积分等于内部留数之和乘二 π i。',
        formula: '\\oint_C f\\,dz=2\\pi i\\sum\\operatorname{Res}(f,a_k)', },
      { name: '留数计算', statement: '简单极点处留数等于极限 of (z 减 a) 乘 f。',
        formula: '\\operatorname{Res}(f,a)=\\lim_{z\\to a}(z-a)f(z)', },
    ],
    steps: [
      { title: '找奇点', body: '先确定曲线内部有哪些孤立奇点。', },
      { title: '判类型', body: '可去、极点、本性奇点决定留数求法。', },
      { title: '算留数', body: '简单极点用极限，高阶极点用求导公式。', },
      { title: '求和乘系数', body: '留数之和乘 $2\\pi i$。', },
      { title: '实积分套用', body: '把实积分补成闭路，避开实轴奇点。', },
    ],
    pitfalls: ['留数当积分值：要乘 $2\\pi i$。', '高阶极点用简单公式：要用导数公式。', '曲线内部奇点漏算：逐个检查。'],
    example: { problem: '计算沿单位圆的 $\\oint dz/z^{2}$。', walkthrough: ['奇点为原点，二阶极点。', '留数为零（无意项）。'], result: '0' },
    moreExamples: [{ problem: '计算沿单位圆逆时针的 $\\oint dz/z$。', walkthrough: ['简单极点，留数为一。', '乘 $2\\pi i$。'], result: '2\\pi i' },],
  },
  {
    id: 'lebesgue-measure',
    title: '勒贝格测度：从外测度到可测集',
    tag: '测度论',
    level: '竞赛',
    essence: '先用开区间覆盖定义外测度，再用卡拉泰奥多里条件筛出可测集。外测度对一切集合都有定义，可测性才是关键。',
    definition: '集合的外测度是所有覆盖它的可列开区间长度之和的下确界。集合可测指它对任意测试集都满足可加性等式。勒贝格测度是可测集上的外测度。',
    whenToUse: ['计算集合的测度', '判断可测性', '构造反例（不可测集）'],
    theorems: [
      { name: '卡拉泰奥多里条件', statement: '对任意测试集，外测度可加则集合可测。',
        formula: 'm^{*}(E)=m^{*}(E\\cap A)+m^{*}(E\\setminus A)', },
      { name: '可列可加', statement: '可测集的可列不交并的测度等于测度之和。', },
    ],
    steps: [
      { title: '先算外测度', body: '用覆盖的下确界估计大小。', },
      { title: '验证可测', body: '对任意测试集检验可加性等式。', },
      { title: '用可列可加', body: '可测集拆分后直接相加。', },
      { title: '注意零测集', body: '零测集可测且子集仍零测。', },
      { title: '构造不可测集', body: '维塔利集合依赖选择公理。', },
    ],
    pitfalls: ['把外测度当测度：外测度只次可加。', '忘记可测性：不是所有集合都可测。', '用选择公理不声明：不可测集构造依赖它。'],
    example: { problem: '闭区间零到一的勒贝格测度是多少？', walkthrough: ['区间本身可测。', '长度为一。'], result: '1' },
    moreExamples: [{ problem: '有理数集的勒贝格测度？', walkthrough: ['可数集。', '单点为零，可列可加。'], result: '0' },],
  },
  {
    id: 'caratheodory-extension',
    title: '卡拉泰奥多里扩张：从半环到测度',
    tag: '测度论',
    level: '竞赛',
    essence: '先在简单集合族（如区间）上定义预测度，再唯一扩张到生成的 σ 代数。这是构造勒贝格测度的标准路线。',
    definition: '半环上的预测度满足可列可加性。卡拉泰奥多里扩张定理说：预测度可唯一扩张到生成 σ 代数上的测度，且零测集完备化。',
    whenToUse: ['构造新测度', '把区间长度推广到博雷尔集', '理解测度唯一性'],
    theorems: [
      { name: '扩张定理', statement: '半环上的预测度唯一扩张为 σ 代数上的测度。', },
      { name: '唯一性条件', statement: '若预测度在全空间上有限，则扩张唯一。', },
    ],
    steps: [
      { title: '定义半环', body: '取区间族作为最基本的可测单位。', },
      { title: '验证可列可加', body: '在区间上验证预测度。', },
      { title: '生成外测度', body: '用覆盖构造外测度。', },
      { title: '筛出可测集', body: '用卡拉泰奥多里条件。', },
      { title: '完成扩张', body: '得到 σ 代数上的测度。', },
    ],
    pitfalls: ['跳过预测度直接定义测度：会失去唯一性保证。', '忽略有限性：唯一性需要条件。', '把半环当 σ 代数：半环对补不封闭。'],
    example: { problem: '区间长度能否直接扩张成整个博雷尔 σ 代数上的测度？', walkthrough: ['区间构成半环。', '长度是预测度。', '由扩张定理。'], result: '可以，且唯一' },
    moreExamples: [{ problem: '为什么需要完备化？', walkthrough: ['零测集的子集未必在 σ 代数中。', '完备化把子集补进来。'], result: '让零测集子集也可测' },],
  },
  {
    id: 'product-measure-fubini',
    title: '乘积测度与富比尼定理',
    tag: '测度论',
    level: '竞赛',
    essence: '两个测度空间可以乘出乘积测度，富比尼定理说明重积分可以化成累次积分，只要函数非负或可积。',
    definition: '乘积 σ 代数由可测矩形生成，乘积测度在矩形上等于两边测度之积。富比尼定理：非负可测函数的重积分等于任一顺序的累次积分。',
    whenToUse: ['计算重积分', '交换积分顺序', '处理独立随机变量'],
    theorems: [
      { name: '乘积测度', statement: '矩形上的测度等于两边测度相乘。',
        formula: '(\\mu\\times\\nu)(A\\times B)=\\mu(A)\\nu(B)', },
      { name: '富比尼－托内利', statement: '非负情形总可换序，可积情形几乎处处可换。',
        formula: '\\iint f\\,d(\\mu\\times\\nu)=\\int\\!\\int f\\,d\\mu\\,d\\nu', },
    ],
    steps: [
      { title: '先验非负', body: '非负可测函数可直接用托内利换序。', },
      { title: '检查可积', body: '一般情形要求绝对可积。', },
      { title: '化累次积分', body: '把一个重积分拆成两次一元积分。', },
      { title: '注意截面', body: '每个截面要可测。', },
      { title: '用富比尼算概率', body: '独立性等价于乘积测度分解。', },
    ],
    pitfalls: ['不验可积就换序：可能得到不同结果。', '忽略截面可测性：定理前提之一。', '把乘积测度当任意测度：它由矩形唯一确定。'],
    example: { problem: '单位正方形上常数一的重积分等于多少？', walkthrough: ['面积为 1。', '富比尼化为两次积分。'], result: '1' },
    moreExamples: [{ problem: '非负函数换序需要额外条件吗？', walkthrough: ['托内利定理保证总成立。'], result: '不需要' },],
  },
  {
    id: 'radon-nikodym',
    title: 'Radon－Nikodym 定理：测度的导数',
    tag: '测度论',
    level: '竞赛',
    essence: '若一个测度相对于另一个绝对连续，则前者可以写成后者的积分，被积函数就是「测度导数」。这是概率论中密度的来源。',
    definition: '测度 μ 关于 ν 绝对连续，指 ν 的零测集也是 μ 的零测集。此时存在非负可测函数 f，使 μ 等于 f 关于 ν 的积分，f 称为 Radon－Nikodym 导数。',
    whenToUse: ['求概率密度', '判断绝对连续', '做测度分解'],
    theorems: [
      { name: 'Radon－Nikodym 定理', statement: '绝对连续等价于存在密度函数。',
        formula: 'd\\mu=f\\,d\\nu', },
      { name: '勒贝格分解', statement: '任意测度可分解为绝对连续部分与奇异部分。', },
    ],
    steps: [
      { title: '先验绝对连续', body: '检查 ν 的零测集是否也是 μ 的零测集。', },
      { title: '找密度', body: '把 μ 写成积分形式。', },
      { title: '验证唯一性', body: '密度在几乎处处意义下唯一。', },
      { title: '做分解', body: '不绝对连续时先分离奇异部分。', },
      { title: '联系概率', body: '密度就是 Radon－Nikodym 导数。', },
    ],
    pitfalls: ['忽略绝对连续：不满足时密度不存在。', '把密度当函数值：它在零测集上可任意改。', '忘记奇异部分：分解要两项都写。'],
    example: { problem: '测度二倍勒贝格测度的密度是多少？', walkthrough: ['写成积分形式。', '被积函数为常数二。'], result: '2' },
    moreExamples: [{ problem: '密度是否唯一？', walkthrough: ['零测集上可任意改。', '几乎处处唯一。'], result: '几乎处处唯一' },],
  },
  {
    id: 'normed-spaces',
    title: '赋范空间与巴拿赫空间',
    tag: '泛函分析',
    level: '竞赛',
    essence: '赋范空间把「长度」抽象成范数；完备的赋范空间叫巴拿赫空间，完备性保证极限运算不会跑出空间。',
    definition: '向量空间上的非负函数若满足正定、齐次、三角不等式，称为范数。由范数诱导的距离使空间完备，则称巴拿赫空间。',
    whenToUse: ['判断函数是否为范数', '比较不同范数', '理解完备性的作用'],
    theorems: [
      { name: '三角不等式', statement: '范数满足和的范数不超过范数之和。',
        formula: '\\|x+y\\|\\le\\|x\\|+\\|y\\|', },
      { name: '有限维全范数等价', statement: '有限维空间上任意两个范数等价，收敛性一致。', },
    ],
    steps: [
      { title: '验三条公理', body: '正定、齐次、三角不等式逐条检查。', },
      { title: '构造距离', body: '用范数定义距离，再看完备性。', },
      { title: '判断完备', body: '柯西列是否收敛到空间内的点。', },
      { title: '比较范数', body: '有限维等价，无限维可能不等价。', },
      { title: '联系内积', body: '内积诱导范数，反之不一定。', },
    ],
    pitfalls: ['把范数当内积：内积还要求平行四边形律。', '忽略完备性：赋范不等于巴拿赫。', '无限维套用等价性：只在有限维成立。'],
    example: { problem: '在二维向量空间上，向量 $(1,-1)$ 的最大范数是多少？', walkthrough: ['最大范数取分量绝对值最大者。', '两个分量绝对值都是一。'], result: '1' },
    moreExamples: [{ problem: '欧氏范数是否由内积诱导？', walkthrough: ['欧氏范数平方等于自身内积。', '满足平行四边形律。'], result: '是' },],
  },
  {
    id: 'hilbert-spaces',
    title: '希尔伯特空间与正交投影',
    tag: '泛函分析',
    level: '竞赛',
    essence: '完备内积空间叫希尔伯特空间。它有正交、投影、正交基，是无限维的欧氏几何。',
    definition: '内积空间若按诱导范数完备，称为希尔伯特空间。闭子空间上每点都有唯一的最近点，即正交投影。',
    whenToUse: ['求最佳逼近', '展开正交基', '理解傅里叶级数'],
    theorems: [
      { name: '正交投影定理', statement: '希尔伯特空间中闭子空间上存在唯一最近点。', },
      { name: '毕达哥拉斯恒等式', statement: '正交向量的范数平方可加。',
        formula: '\\|x+y\\|^{2}=\\|x\\|^{2}+\\|y\\|^{2}', },
    ],
    steps: [
      { title: '验内积与完备', body: '先确认空间是希尔伯特空间。', },
      { title: '找闭子空间', body: '投影只在闭子空间上保证存在。', },
      { title: '求投影', body: '用正交条件：误差与子空间正交。', },
      { title: '用正交基展开', body: '把向量写成基的傅里叶系数组合。', },
      { title: '联系傅里叶级数', body: '三角系就是一组正交基。', },
    ],
    pitfalls: ['子空间不闭：投影可能不存在。', '把正交基当普通基：无限维需要收敛性。', '忽略完备性：内积空间未必是希尔伯特空间。'],
    example: { problem: '把向量 $(1,1)$ 投影到 $x$ 轴，结果是多少？', walkthrough: ['$x$ 轴是闭子空间。', '正交投影保留第一个分量。'], result: '(1,0)' },
    moreExamples: [{ problem: '正交向量的范数满足什么关系？', walkthrough: ['内积为零。', '展开后交叉项消失。'], result: '范数平方相加' },],
  },
  {
    id: 'bounded-operators',
    title: '有界线性算子与对偶空间',
    tag: '泛函分析',
    level: '竞赛',
    essence: '线性算子连续等价于有界。对偶空间是全体有界线性泛函，它把空间「反射」成数。',
    definition: '线性算子若存在常数使像的范数不超过常数乘原像范数，称为有界。所有有界线性泛函构成对偶空间，按算子范数成为巴拿赫空间。',
    whenToUse: ['判断算子是否有界', '计算算子范数', '用对偶讨论弱收敛'],
    theorems: [
      { name: '连续等价有界', statement: '线性算子连续当且仅当有界。', },
      { name: '哈恩－巴拿赫定理', statement: '子空间上的有界泛函可保范延拓到全空间。', },
    ],
    steps: [
      { title: '找常数', body: '证明有界就是找一个统一的放大常数。', },
      { title: '算算子范数', body: '取单位球上像的范数上确界。', },
      { title: '验线性连续', body: '线性加有界即连续。', },
      { title: '用延拓定理', body: '子空间上的泛函可延拓。', },
      { title: '联系对偶', body: '对偶空间元素就是有界线性泛函。', },
    ],
    pitfalls: ['把有界当像有界：是相对放大有界。', '忽略线性：非线性算子的结论不同。', '范数算成最大值：可能取不到上确界。'],
    example: { problem: '二倍恒等算子的算子范数是多少？', walkthrough: ['像的范数是原像两倍。', '上确界为二。'], result: '2' },
    moreExamples: [{ problem: '有限维空间上线性算子一定有界吗？', walkthrough: ['有限维算子可用矩阵表示。', '矩阵范数有限。'], result: '一定有界' },],
  },
  {
    id: 'spectral-theorem',
    title: '谱定理：紧自伴算子的对角化',
    tag: '泛函分析',
    level: '竞赛',
    essence: '紧自伴算子可以正交对角化：谱是离散的实特征值，特征向量构成正交基。这是矩阵谱定理的无限维版本。',
    definition: '算子的谱是使「算子减 λ 恒等」不可逆的 λ 全体。紧算子把有界集映成相对紧集。紧自伴算子的谱由实特征值组成，且至多可数、只有零是聚点。',
    whenToUse: ['求算子的谱', '理解量子力学可观测量', '做算子函数演算'],
    theorems: [
      { name: '谱定理', statement: '紧自伴算子存在正交特征向量基。', },
      { name: '谱的范围', statement: '自伴算子的谱落在实轴上。', },
    ],
    steps: [
      { title: '先验自伴', body: '自伴保证特征值为实。', },
      { title: '验紧性', body: '紧性保证谱离散。', },
      { title: '求特征值', body: '解算子方程得到谱。', },
      { title: '正交化', body: '不同特征值的特征向量正交。', },
      { title: '展开', body: '用特征向量基做算子函数演算。', },
    ],
    pitfalls: ['非紧算子也套：谱可能是连续区间。', '忽略自伴：非自伴谱可为复数。', '把谱当特征值：无限维中谱可能不含特征值。'],
    example: { problem: '对角矩阵（对角元二、三）的谱是什么？', walkthrough: ['特征值为对角元。', '谱即这两点。'], result: '两点的集合' },
    moreExamples: [{ problem: '自伴算子的特征值一定是实数吗？', walkthrough: ['自伴性给出内积为实。'], result: '是' },],
  },
  {
    id: 'fourier-transform',
    title: '傅里叶变换：把函数拆成频率',
    tag: '调和分析',
    level: '竞赛',
    essence: '傅里叶变换把时域函数变成频域函数，用积分把不同频率的正弦波重新加权叠加。它是信号分析的核心工具。',
    definition: '可积函数的傅里叶变换是它乘以复指数后的积分，逆变换形式对称。变换把微分变成乘法、把卷积变成乘积。',
    whenToUse: ['解偏微分方程', '分析信号频谱', '证明不等式（用变换）'],
    theorems: [
      { name: 'Fourier 变换', statement: '函数与其频域表示由积分公式互相确定。',
        formula: '\\hat f(\\xi)=\\int f(x)e^{-2\\pi i x\\xi}\\,dx', },
      { name: '微分变乘法', statement: '求导对应乘以频率因子。',
        formula: '\\widehat{f^{\\prime}}(\\xi)=2\\pi i\\xi\\hat f(\\xi)', },
    ],
    steps: [
      { title: '先验可积', body: '确认函数属于可积类，变换才有定义。', },
      { title: '算变换', body: '按定义积分，注意收敛性。', },
      { title: '用性质', body: '平移、缩放、求导都有对应简单规则。', },
      { title: '做逆变换', body: '需要收敛条件或改用 L2 理论。', },
      { title: '联系方程', body: '把微分方程化为代数方程求解。', },
    ],
    pitfalls: ['忽略收敛：并非所有函数都有经典变换。', '忘常数因子：不同教材约定不同。', '把变换当正变换：正逆方向要分清。'],
    example: { problem: '求高斯函数的傅里叶变换。', walkthrough: ['高斯函数在变换下保持形式。', '仍是高斯，宽度取倒数。'], result: '仍为高斯函数' },
    moreExamples: [{ problem: '变换能否把卷积变乘积？', walkthrough: ['这是傅里叶变换的核心性质。'], result: '能' },],
  },
  {
    id: 'convolution',
    title: '卷积：把叠加变成乘法',
    tag: '调和分析',
    level: '竞赛',
    essence: '卷积描述一个函数对另一个函数的加权平均。傅里叶变换把卷积变成逐点乘积，这是它最有用的性质。',
    definition: '两个函数的卷积是其中一个翻转平移后与另一个的积分。它是交换的、结合的，且与平移相容。',
    whenToUse: ['求解线性系统', '平滑与滤波', '证明不等式'],
    theorems: [
      { name: '卷积定理', statement: '卷积的傅里叶变换等于变换的乘积。',
        formula: '\\widehat{f*g}=\\hat f\\cdot\\hat g', },
      { name: '杨氏不等式', statement: '卷积的模不超过两个函数模的乘积。',
        formula: '\\|f*g\\|_r\\le\\|f\\|_p\\|g\\|_q', },
    ],
    steps: [
      { title: '写出定义', body: '注意翻转与平移，不要漏负号。', },
      { title: '验可积性', body: '两个可积函数的卷积仍可积。', },
      { title: '用变换化简', body: '卷积难算时转到频域相乘。', },
      { title: '回变换', body: '相乘后做逆变换得到结果。', },
      { title: '用于滤波', body: '与核函数卷积就是平滑。', },
    ],
    pitfalls: ['漏掉翻转：定义里有一个负号。', '卷积当乘法：逐点乘积不等于卷积。', '忽略定义域：有限区间要处理边界。'],
    example: { problem: '常数函数与可积函数卷积得到什么？', walkthrough: ['卷积是滑动平均。', '结果是该函数的一个平滑版本。'], result: '平滑后的函数' },
    moreExamples: [{ problem: '卷积满足交换律吗？', walkthrough: ['换元即可证明。'], result: '满足' },],
  },
  {
    id: 'l2-fourier',
    title: 'L² 理论与普朗歇尔定理',
    tag: '调和分析',
    level: '竞赛',
    essence: '在平方可积函数空间上，傅里叶变换是保内积的酉算子。普朗歇尔定理说它保持能量不变。',
    definition: '平方可积函数空间上的傅里叶变换由稠密子集上的定义延拓得到，满足保范性。这使得变换在整个空间上有定义。',
    whenToUse: ['信号能量分析', '证明正交基完备', '量子力学的动量表象'],
    theorems: [
      { name: '普朗歇尔定理', statement: '变换保持 L² 范数。',
        formula: '\\|\\hat f\\|_2=\\|f\\|_2', },
      { name: '帕塞瓦尔等式', statement: '内积也被保持。',
        formula: '\\langle f,g\\rangle=\\langle\\hat f,\\hat g\\rangle', },
    ],
    steps: [
      { title: '先在稠密子集定义', body: '取性质好的函数定义变换。', },
      { title: '用保范性延拓', body: '保范推出连续，可延拓。', },
      { title: '验证等距', body: '范数与内积都不变。', },
      { title: '得酉性', body: '变换可逆且逆是共轭转置。', },
      { title: '用于能量', body: '能量在频域守恒。', },
    ],
    pitfalls: ['把 L1 结论直接搬到 L2：收敛含义不同。', '忘记延拓：L2 上变换不是普通积分。', '混淆范数与内积保持：两者都保持。'],
    example: { problem: '单位脉冲在频域是什么？', walkthrough: ['脉冲变换为常数。', '能量集中变成全频段。'], result: '常数函数' },
    moreExamples: [{ problem: '变换是否可逆？', walkthrough: ['酉算子都有逆。', '逆为共轭变换。'], result: '可逆' },],
  },
  {
    id: 'fourier-series-convergence',
    title: '傅里叶级数的收敛性',
    tag: '调和分析',
    level: '竞赛',
    essence: '傅里叶级数何时收敛到原函数？连续不足以保证逐点收敛，但平方可积时一定在 L² 意义下收敛。',
    definition: '周期函数的傅里叶级数部分和是三角多项式。收敛性分逐点、一致、L² 三种意义，条件依次减弱。',
    whenToUse: ['判断级数收敛方式', '解释吉布斯现象', '为偏微分方程分离变量'],
    theorems: [
      { name: 'L² 收敛', statement: '平方可积函数的傅里叶级数在 L² 意义下收敛。',
        formula: '\\|S_Nf-f\\|_2\\to 0', },
      { name: '狄利克雷条件', statement: '分段光滑时逐点收敛到左右极限平均。', },
    ],
    steps: [
      { title: '先看光滑性', body: '分段光滑可谈逐点收敛。', },
      { title: '看连续与跳跃', body: '跳跃点收敛到两侧平均。', },
      { title: '用 L² 结论', body: '只要平方可积就有 L² 收敛。', },
      { title: '注意吉布斯', body: '跳跃附近有过冲，不会消失。', },
      { title: '用于分离变量', body: '级数解 PDE 依赖收敛性。', },
    ],
    pitfalls: ['连续就逐点收敛：反例存在。', '跳跃点收敛到函数值：应收敛到平均值。', '把 L² 收敛当逐点收敛：前者更弱。'],
    example: { problem: '方波在跳跃点处傅里叶级数收敛到多少？', walkthrough: ['跳跃两侧极限为一与负一。', '取平均。'], result: '0' },
    moreExamples: [{ problem: '吉布斯现象会随项数增加消失吗？', walkthrough: ['过冲幅度趋于常数。', '不会消失。'], result: '不会' },],
  },
  {
    id: 'curves-frenet',
    title: '曲线：曲率、挠率与 Frenet 标架',
    tag: '微分几何',
    level: '进阶',
    essence: '空间曲线由曲率与挠率完全决定。Frenet 标架给出沿曲线的活动坐标系，三大公式描述它如何转动。',
    definition: '曲率衡量曲线偏离直线的程度，挠率衡量偏离平面的程度。Frenet 标架由单位切向量、主法向量、副法向量组成，沿弧长参数满足结构方程。',
    whenToUse: ['计算曲线曲率与挠率', '写出 Frenet 标架', '判断曲线是否为平面曲线'],
    theorems: [
      { name: '曲率公式', statement: '曲率等于切向量对弧长的导数模长。',
        formula: '\\kappa=\\|T^{\\prime}(s)\\|', },
      { name: '挠率判平面', statement: '挠率处处为零当且仅当曲线在某个平面内。',
        formula: '\\tau=0', },
    ],
    steps: [
      { title: '先参数化', body: '用弧长参数化最方便。', },
      { title: '算切向量', body: '对弧长求导得到单位切向量。', },
      { title: '求曲率', body: '切向量导数取模。', },
      { title: '求挠率', body: '用副法向量导数与主法向量的内积。', },
      { title: '看是否平面', body: '挠率为零即平面曲线。', },
    ],
    pitfalls: ['用一般参数算曲率：公式要除以速度模长的三次方。', '混淆曲率与曲率半径：互为倒数。', '挠率符号忽略：符号反映扭转方向。'],
    example: { problem: '单位圆的曲率是多少？', walkthrough: ['半径为 1。', '曲率等于半径倒数。'], result: '1' },
    moreExamples: [{ problem: '直线的曲率与挠率？', walkthrough: ['方向不变。', '曲率为零，挠率为零。'], result: '都是 0' },],
  },
  {
    id: 'surfaces-forms',
    title: '曲面：第一与第二基本形式',
    tag: '微分几何',
    level: '进阶',
    essence: '第一基本形式度量曲面上的长度与面积，第二基本形式刻画曲面如何弯曲。两者共同决定高斯曲率。',
    definition: '曲面的第一基本形式是切向量内积的二次型，系数记为 E、F、G。第二基本形式描述法向弯曲，系数记为 L、M、N。高斯曲率等于两个基本形式行列式之比。',
    whenToUse: ['计算曲面面积', '求高斯曲率与平均曲率', '判断可展曲面'],
    theorems: [
      { name: '面积元', statement: '面积元等于第一基本形式行列式的平方根。',
        formula: 'dS=\\sqrt{EG-F^{2}}\\,du\\,dv', },
      { name: '高斯绝妙定理', statement: '高斯曲率只依赖第一基本形式（内蕴）。',
        formula: 'K=\\frac{LN-M^{2}}{EG-F^{2}}', },
    ],
    steps: [
      { title: '写出参数化', body: '先给定曲面的参数表示。', },
      { title: '算切向量', body: '两个偏导给出切平面基。', },
      { title: '求第一基本形式', body: '算三个内积系数。', },
      { title: '求第二基本形式', body: '算法向量与二阶偏导的内积。', },
      { title: '得曲率', body: '用两个行列式之比。', },
    ],
    pitfalls: ['法向量未单位化：第二基本形式要用单位法向量。', '参数化退化：切向量线性相关时公式失效。', '把高斯曲率当外蕴：它其实是内蕴量。'],
    example: { problem: '球面的高斯曲率与什么有关？', walkthrough: ['半径越小越弯。', '高斯曲率为半径平方的倒数。'], result: '1/R 平方' },
    moreExamples: [{ problem: '圆柱面的高斯曲率是多少？', walkthrough: ['圆柱可展成平面。', '可展曲面高斯曲率为零。'], result: '0' },],
  },
  {
    id: 'gauss-bonnet',
    title: '高斯－博内定理：曲率与拓扑',
    tag: '微分几何',
    level: '竞赛',
    essence: '闭曲面上的高斯曲率积分等于欧拉示性数乘二 π。这条定理把局部弯曲与整体拓扑连接起来。',
    definition: '对紧致无边的曲面，高斯曲率在整个曲面上的积分等于二 π 乘欧拉示性数。带边界时还要加上测地曲率积分。',
    whenToUse: ['由曲率算欧拉示性数', '判断曲面拓扑', '理解曲率的整体约束'],
    theorems: [
      { name: '高斯－博内', statement: '曲率积分是拓扑不变量。',
        formula: '\\int_S K\\,dA=2\\pi\\chi(S)', },
      { name: '带边界形式', statement: '边界测地曲率也要计入。', },
    ],
    steps: [
      { title: '先算高斯曲率', body: '按第一第二基本形式求。', },
      { title: '算面积元', body: '用第一基本形式求。', },
      { title: '积分', body: '在曲面上积分 K 乘面积元。', },
      { title: '对照欧拉示性数', body: '结果应为二 π 乘示性数。', },
      { title: '带边界加项', body: '边界测地曲率积分要补上。', },
    ],
    pitfalls: ['忽略边界项：带边界公式不同。', '把曲率积分当任意值：它被拓扑锁定。', '示性数算错：球面为 2，环面为 0。'],
    example: { problem: '单位球面的高斯曲率积分是多少？', walkthrough: ['曲率处处为 1。', '面积为四 π。'], result: '4π' },
    moreExamples: [{ problem: '环面的曲率积分是多少？', walkthrough: ['示性数为 0。', '积分也为 0。'], result: '0' },],
  },
  {
    id: 'geodesics',
    title: '测地线：曲面上的直线',
    tag: '微分几何',
    level: '进阶',
    essence: '测地线是曲面上局部最短的曲线。它等价于加速度只有法向分量，即测地曲率为零。',
    definition: '曲面上测地曲率为零的曲线叫测地线。给定点与方向，测地线局部唯一存在。球面上的测地线是大圆。',
    whenToUse: ['求曲面上的最短路径', '判断曲线是否为测地线', '研究曲面上的几何'],
    theorems: [
      { name: '测地线方程', statement: '测地线满足二阶常微分方程组。',
        formula: '\\ddot u^{k}+\\Gamma^{k}_{ij}\\dot u^{i}\\dot u^{j}=0', },
      { name: '短程性', statement: '测地线局部最短，但不一定全局最短。', },
    ],
    steps: [
      { title: '参数化曲面', body: '写出曲面的参数表示。', },
      { title: '算克里斯托费尔符号', body: '由第一基本形式求。', },
      { title: '解测地线方程', body: '得到曲线族。', },
      { title: '代初值', body: '给定点与方向定出唯一测地线。', },
      { title: '检查全局', body: '局部最短不等于全局最短。', },
    ],
    pitfalls: ['把测地线当全局最短：球面大圆两端有劣弧优弧。', '忘记克里斯托费尔符号：方程写不全。', '把直线当测地线：只有平面上的直线才是。'],
    example: { problem: '球面上的测地线是什么曲线？', walkthrough: ['球面有对称性。', '测地线是大圆。'], result: '大圆' },
    moreExamples: [{ problem: '圆柱面上的测地线有哪些？', walkthrough: ['展开成平面。', '平面上的直线对应螺旋线、母线、圆。'], result: '螺旋线、母线、截圆' },],
  },
  {
    id: 'affine-varieties',
    title: '仿射簇与理想：几何与代数的词典',
    tag: '代数几何',
    level: '竞赛',
    essence: '仿射代数簇是多项式方程组的公共零点集。希尔伯特零点定理说：簇与根理想一一对应，几何问题可以翻译成代数问题。',
    definition: 'n 维仿射空间中的代数簇是若干个多项式的公共零点集。给定簇可定义理想，给定理想可定义零点集，两者由零点定理连接。',
    whenToUse: ['判断集合是否为代数簇', '把几何条件翻译成理想运算', '计算簇的维数'],
    theorems: [
      { name: '希尔伯特零点定理', statement: '代数闭域上，理想与其零点集的根理想对应。',
        formula: 'I(V(J))=\\sqrt{J}', },
      { name: '不可约分解', statement: '代数簇可唯一分解为不可约簇之并。', },
    ],
    steps: [
      { title: '写出方程组', body: '把几何条件写成多项式。', },
      { title: '求公共零点', body: '解方程组或判断解集形状。', },
      { title: '算理想', body: '所有在该簇上为零的多项式构成理想。', },
      { title: '取根', body: '由零点定理理想等于其根。', },
      { title: '看不可约性', body: '不可约对应素理想。', },
    ],
    pitfalls: ['忘记代数闭域：实数域上零点定理不成立。', '把理想当根理想：两者可能不同。', '不可约当连通：连通不一定不可约。'],
    example: { problem: '平面上的抛物线是代数簇吗？', walkthrough: ['由一个多项式方程给出。', '是零点集。'], result: '是' },
    moreExamples: [{ problem: '两条相交直线是否不可约？', walkthrough: ['可分解为两条直线之并。', '因此可约。'], result: '可约' },],
  },
  {
    id: 'projective-varieties',
    title: '射影簇：把无穷远补齐',
    tag: '代数几何',
    level: '竞赛',
    essence: '射影空间在仿射空间上补了无穷远点，使平行线相交。射影簇由齐次多项式定义，几何性质更整齐。',
    definition: '射影空间是向量空间的一维子空间全体。齐次多项式的零点集在射影空间中良定义，称为射影簇。仿射簇可通过齐次化嵌入射影空间。',
    whenToUse: ['处理无穷远交点', '用贝祖定理计数交点', '研究紧化'],
    theorems: [
      { name: '齐次化', statement: '仿射方程乘上适当幂次可齐次化。', },
      { name: '射影闭包', statement: '仿射簇的射影闭包是紧的。', },
    ],
    steps: [
      { title: '用齐次坐标', body: '点写成比值形式，整体缩放不变。', },
      { title: '写齐次方程', body: '每项次数相同才能定义零点。', },
      { title: '去齐次化', body: '取某个坐标为一得到仿射图。', },
      { title: '看无穷远处', body: '令某坐标为零得到无穷远部分。', },
      { title: '用贝祖计数', body: '射影空间中交点个数由次数决定。', },
    ],
    pitfalls: ['齐次性不检查：非齐次方程在射影空间无意义。', '忽略无穷远点：仿射图之外还有部分。', '坐标选取纠结：不同仿射图应一致。'],
    example: { problem: '两条平行线在射影平面中相交吗？', walkthrough: ['平行线方向相同。', '在无穷远处交于一点。'], result: '相交于无穷远点' },
    moreExamples: [{ problem: '射影直线与射影平面分别是什么？', walkthrough: ['射影直线是球面粘对径点。', '射影平面同此构造高维版。'], result: '紧致流形' },],
  },
  {
    id: 'bezout-theorem',
    title: '贝祖定理：交点数由次数决定',
    tag: '代数几何',
    level: '竞赛',
    essence: '射影平面中两条代数曲线若无公共分支，交点个数（计重数）等于次数之积。这是代数几何最经典的技术定理。',
    definition: '两条次数分别为 m 与 n 的射影曲线，在代数闭域上若没有公共分支，则交点总数（按重数计）等于 mn。',
    whenToUse: ['快速判断交点个数', '验证几何构造', '联系相交理论'],
    theorems: [
      { name: '贝祖定理', statement: '交点数等于次数乘积。',
        formula: '\\#(C\\cap D)=mn', },
      { name: '重数解释', statement: '相切、奇点会贡献更高重数。', },
    ],
    steps: [
      { title: '确认无公共分支', body: '否则交点无穷多。', },
      { title: '读次数', body: '两个方程的最高次数。', },
      { title: '相乘', body: '得到交点总数。', },
      { title: '分配重数', body: '相切点算多重。', },
      { title: '用射影空间', body: '仿射中平行会导致虚交点。', },
    ],
    pitfalls: ['在仿射平面直接用：平行线会漏交点。', '忽略重数：相切点算多个。', '有公共分支仍套用：前提不满足。'],
    example: { problem: '两条二次曲线最多有几个交点？', walkthrough: ['次数都是二。', '二乘二得四。'], result: '4' },
    moreExamples: [{ problem: '直线与三次曲线交点几个？', walkthrough: ['次数一与三。', '乘积为三。'], result: '3' },],
  },
  {
    id: 'zariski-topology',
    title: '扎里斯基拓扑：用代数定义开集',
    tag: '代数几何',
    level: '竞赛',
    essence: '扎里斯基拓扑把代数簇当作闭集，开集是补集。它比欧氏拓扑粗得多，但让代数几何可以用拓扑语言说话。',
    definition: '在仿射空间中，所有代数簇作为闭集，生成的拓扑叫扎里斯基拓扑。其开集是代数簇的补集，基本开集由多项式非零定义。',
    whenToUse: ['定义簇的连通与不可约', '讨论有理函数定义域', '理解层与概形'],
    theorems: [
      { name: '不可约对应素理想', statement: '簇不可约当且仅当对应理想是素理想。', },
      { name: '基本开集基', statement: '多项式非零的集合构成拓扑基。',
        formula: 'D(f)=\\{x: f(x)\\ne 0\\}', },
    ],
    steps: [
      { title: '认出闭集', body: '闭集就是代数簇。', },
      { title: '取补得开集', body: '开集是簇的补集。', },
      { title: '用基本开集', body: '单个多项式非零是最基本的开集。', },
      { title: '判断不可约', body: '不可约性对应素理想。', },
      { title: '注意粗糙', body: '扎里斯基开集很大，欧氏开集很小。', },
    ],
    pitfalls: ['把扎里斯基当欧氏拓扑：性质差别大。', '混淆闭集与有限集：闭集可以是曲线。', '忘记基域：依赖代数闭域假设。'],
    example: { problem: '扎里斯基拓扑下的闭集有哪些？', walkthrough: ['定义上就是代数簇。', '包括点、曲线、曲面等。'], result: '全体代数簇' },
    moreExamples: [{ problem: '扎里斯基拓扑是豪斯多夫的吗？', walkthrough: ['开集太大。', '一般不是。'], result: '不是' },],
  },
  {
    id: 'smooth-manifolds',
    title: '光滑流形与切空间',
    tag: '微分拓扑',
    level: '竞赛',
    essence: '光滑流形局部像欧氏空间，且坐标变换光滑。切空间是流形上一点的线性近似，切向量可以定义为导子。',
    definition: '拓扑流形局部同胚于欧氏空间且坐标变换光滑，称为光滑流形。切空间是过该点曲线的速度等价类，也可定义为满足莱布尼茨律的导子全体。',
    whenToUse: ['判断流形', '计算切空间', '定义光滑映射'],
    theorems: [
      { name: '切空间维数', statement: 'n 维流形的切空间是 n 维向量空间。',
        formula: '\\dim T_pM=n', },
      { name: '光滑映射的微分', statement: '光滑映射在一点诱导切空间的线性映射。',
        formula: 'df_p:T_pM\\to T_{f(p)}N', },
    ],
    steps: [
      { title: '找图册', body: '覆盖空间并给出坐标卡。', },
      { title: '验光滑性', body: '坐标变换光滑。', },
      { title: '定切空间', body: '用导子或速度定义切向量。', },
      { title: '写微分', body: '用雅可比矩阵表示。', },
      { title: '看整体', body: '切空间拼成切丛。', },
    ],
    pitfalls: ['只验局部同胚：还要坐标变换光滑。', '把切空间当流形本身：它是附属向量空间。', '忽略定向：定向是可定向流形的额外结构。'],
    example: { problem: '球面的切空间维数是多少？', walkthrough: ['球面是二维流形。', '切空间也是二维。'], result: '2' },
    moreExamples: [{ problem: '光滑映射的微分是什么类型？', walkthrough: ['把切向量映成切向量。', '是线性映射。'], result: '线性映射' },],
  },
  {
    id: 'degree-theory',
    title: '映射度：数一数覆盖次数',
    tag: '微分拓扑',
    level: '竞赛',
    essence: '紧定向流形之间的光滑映射，其映射度统计正则值的原像个数（带符号）。它是拓扑不变量，连续形变下不变。',
    definition: '对紧定向 n 维流形间的光滑映射，取正则值 y，定义度为 y 的原像各点处微分行列式符号之和。该值不依赖 y 的选取。',
    whenToUse: ['判断映射是否满射', '计算环绕数', '证明拓扑不动点定理'],
    theorems: [
      { name: '度是拓扑不变量', statement: '同伦的映射度相同。', },
      { name: '非零度即满射', statement: '度为非零则映射是满射。', },
    ],
    steps: [
      { title: '取正则值', body: '萨德定理保证正则值存在。', },
      { title: '数原像', body: '每个原像加符号。', },
      { title: '算符号', body: '看微分行列式正负。', },
      { title: '得度', body: '求和。', },
      { title: '用不变性', body: '换正则值结果相同。', },
    ],
    pitfalls: ['用非正则值：临界值处原像个数不稳。', '忘记定向：无定向流形不能定义度。', '把度当原像个数：要带符号。'],
    example: { problem: '圆到圆映射 $z\\mapsto z^{n}$ 的度是多少？', walkthrough: ['绕 n 圈。', '每个正则点有 n 个原像。'], result: 'n' },
    moreExamples: [{ problem: '常值映射的度是多少？', walkthrough: ['像退化。', '正则为空，度为 0。'], result: '0' },],
  },
  {
    id: 'transversality',
    title: '横截性：交得足够好',
    tag: '微分拓扑',
    level: '竞赛',
    essence: '横截指两个子流形在交点处切空间张成整个空间。横截的交是流形，维数由公式给出。一般位置下横截自动成立。',
    definition: '映射 f 与子流形 Z 横截，指在交点处像的切空间与 Z 的切空间之和等于目标切空间。横截交的余维数等于两者余维数之和。',
    whenToUse: ['判断交是否为流形', '用一般位置简化', '证明横截性定理'],
    theorems: [
      { name: '横截交是流形', statement: '横截相交得到子流形。',
        formula: '\\operatorname{codim}(X\\cap Z)=\\operatorname{codim}X+\\operatorname{codim}Z', },
      { name: '横截性定理', statement: '横截是通有的性质。', },
    ],
    steps: [
      { title: '算切空间', body: '分别求两个子流形的切空间。', },
      { title: '看和是否为全空间', body: '张成整个切空间即横截。', },
      { title: '算维数', body: '用余维相加公式。', },
      { title: '扰动到一般位置', body: '不横截时可微扰。', },
      { title: '验证', body: '扰动后重新检查。', },
    ],
    pitfalls: ['切空间相交就判不横截：要看和是否为全空间。', '忽略余维：维数公式用余维相加。', '认为横截必然相交：可能根本不交。'],
    example: { problem: '三维空间中两条一般位置的曲线是否横截相交？', walkthrough: ['两条曲线切空间各一维。', '加起来只有二维。'], result: '一般不横截' },
    moreExamples: [{ problem: '球面与一般位置平面是否横截相交？', walkthrough: ['平面法向与球面法向一般不平行。', '交为圆。'], result: '横截' },],
  },
  {
    id: 'cobordism',
    title: '配边：流形的等价关系',
    tag: '微分拓扑',
    level: '竞赛',
    essence: '两个闭流形配边，指它们的无交并是某个带边流形的边界。配边是比同胚更粗的等价关系，由示性数等不变量分类。',
    definition: 'n 维闭流形 M 与 N 配边，若存在 n+1 维紧流形 W 使边界为 M 与 N 的无交并。配边类构成群，运算为无交并。',
    whenToUse: ['用不变量区分流形', '理解流形的分类层级', '联系示性类'],
    theorems: [
      { name: '配边是等价关系', statement: '反射、对称、传递都成立。', },
      { name: '配边不变量', statement: '示性数在配边下不变。', },
    ],
    steps: [
      { title: '找带边流形', body: '构造边界为两个流形的 W。', },
      { title: '验边界', body: '边界恰为无交并。', },
      { title: '看不变量', body: '示性数相同才可能配边。', },
      { title: '用群结构', body: '无交并给出群运算。', },
      { title: '分类', body: '低维配边群可完全算出。', },
    ],
    pitfalls: ['把配边当同胚：粗得多。', '忽略定向：定向配边要求定向相容。', '只看维数：同维不一定配边。'],
    example: { problem: '两个圆周是否配边？', walkthrough: ['圆是圆柱的边界。', '圆柱边界为两个圆。'], result: '配边' },
    moreExamples: [{ problem: '球面与环面是否配边？', walkthrough: ['三维中它们都是闭曲面。', '所有闭曲面都配边于球面（有向情形按亏格）。'], result: '不一定，需看定向与亏格' },],
  },
  {
    id: 'field-extensions',
    title: '域扩张与次数',
    tag: '域论',
    level: '竞赛',
    essence: '域扩张是把小域放大。扩张的次数是较大域作为较小域上向量空间的维数，这是所有计算的起点。',
    definition: '域 F 包含于 K 时称 K 是 F 的扩域。K 作为 F 上向量空间的维数称为扩张次数。有限次扩张叫有限扩张。',
    whenToUse: ['计算扩张次数', '判断元素是否属于扩域', '构造新域'],
    theorems: [
      { name: '次数乘法公式', statement: '塔式扩张的次数相乘。',
        formula: '[K:F]=[K:E][E:F]', },
      { name: '有限扩张即代数', statement: '有限次扩张中每个元素都是代数元。', },
    ],
    steps: [
      { title: '找基', body: '把扩域看成向量空间，找一组基。', },
      { title: '算维数', body: '基的元素个数就是次数。', },
      { title: '用塔式公式', body: '多层扩张次数相乘。', },
      { title: '判断代数性', body: '有限扩张元素都代数。', },
      { title: '注意超越', body: '超越扩张次数可能无限。', },
    ],
    pitfalls: ['把次数当元素个数：是同构类数目无关。', '混淆代数与有限：代数扩张可以无限次。', '忘记基域：次数总是相对某个基域。'],
    example: { problem: '有理数添上根号二得到的扩域次数是多少？', walkthrough: ['基可取一与根号二。', '二维向量空间。'], result: '2' },
    moreExamples: [{ problem: '超越扩张的次数有限吗？', walkthrough: ['例如有理数添上圆周率。', '不是有限维。'], result: '无限' },],
  },
  {
    id: 'algebraic-elements',
    title: '代数元与极小多项式',
    tag: '域论',
    level: '竞赛',
    essence: '代数元是某个非零多项式在基域上的根。极小多项式是次数最低的首一多项式，它整除所有以该元为根的多项式。',
    definition: '元素在基域上满足某个非零多项式方程，称为代数元。极小多项式是次数最低的首一多项式，且不可约。',
    whenToUse: ['判断代数性', '求极小多项式', '计算扩张次数'],
    theorems: [
      { name: '极小多项式不可约', statement: '极小多项式在基域上不可约。', },
      { name: '次数等于扩张次数', statement: '单元素扩张的次数等于极小多项式的次数。',
        formula: '[F(\\alpha):F]=\\deg m_\\alpha', },
    ],
    steps: [
      { title: '找关系式', body: '把元素代入多项式找零化多项式。', },
      { title: '取最低次', body: '所有零化多项式中次数最低者。', },
      { title: '验不可约', body: '若可分解则次数还能降。', },
      { title: '得次数', body: '极小多项式次数即扩张次数。', },
      { title: '检验共轭', body: '其他根给出共轭元素。', },
    ],
    pitfalls: ['零化多项式当极小：可能可约。', '忘记首一：极小多项式约定首一。', '混淆根与元素：极小多项式可能有多个根。'],
    example: { problem: '根号二在有理数上的极小多项式？', walkthrough: ['满足平方减二等于零。', '二次不可约。'], result: 'x 平方减 2' },
    moreExamples: [{ problem: '圆周率是代数元吗？', walkthrough: ['林德曼定理证明它是超越数。', '不满足任何多项式方程。'], result: '不是' },],
  },
  {
    id: 'splitting-field',
    title: '分裂域与正规扩张',
    tag: '域论',
    level: '竞赛',
    essence: '分裂域是把一个多项式所有根都加进来得到的域。正规扩张就是某个多项式族的分裂域。',
    definition: '多项式在扩域上完全分解成一次因式之积，且该扩域由根生成，称为分裂域。正规扩张指基域上每个不可约多项式要么无根要么完全分裂。',
    whenToUse: ['构造分裂域', '判断正规性', '为伽罗瓦理论做准备'],
    theorems: [
      { name: '分裂域存在唯一', statement: '每个多项式都有分裂域，且在基域同构意义下唯一。', },
      { name: '正规等价分裂', statement: '有限扩张正规当且仅当是某多项式的分裂域。', },
    ],
    steps: [
      { title: '分解多项式', body: '先看根的结构。', },
      { title: '逐个添根', body: '把根逐个加入基域。', },
      { title: '检查是否全分裂', body: '所有根都在域中。', },
      { title: '验极小性', body: '域由根生成。', },
      { title: '判断正规', body: '看不可约多项式是否完全分裂。', },
    ],
    pitfalls: ['只添一个根：可能还不够分裂。', '把正规当可分：特征零时两者一致，正特征不同。', '忽略唯一性：分裂域在同构意义下唯一。'],
    example: { problem: '多项式 x 平方减 2 在有理数上的分裂域次数？', walkthrough: ['根为正负根号二。', '只需添一个根。'], result: '2' },
    moreExamples: [{ problem: 'x 三次方减 2 的分裂域次数是多少？', walkthrough: ['需要添实根与复根。', '次数为六。'], result: '6' },],
  },
  {
    id: 'finite-fields',
    title: '有限域：q 个元素的域',
    tag: '域论',
    level: '竞赛',
    essence: '有限域的阶必是素数的幂，且对每个素数幂存在唯一（同构意义下）的有限域。它的乘法群是循环群。',
    definition: '含有限个元素的域叫有限域。q 个元素的有限域记作 F_q，其中 q 必为 p 的 n 次方，p 是特征。',
    whenToUse: ['构造有限域', '在编码与密码中计算', '理解 Frobenius 映射'],
    theorems: [
      { name: '阶为素数幂', statement: '有限域的阶是特征的幂。',
        formula: '|F|=p^{n}', },
      { name: '乘法群循环', statement: '有限域的乘法群是循环群。', },
    ],
    steps: [
      { title: '定特征', body: '先确定素数特征 p。', },
      { title: '看素域', body: '素域同构于模 p 的域。', },
      { title: '取不可约多项式', body: '用 n 次不可约多项式构造扩域。', },
      { title: '得 p 的 n 次方个元素', body: '商环就是有限域。', },
      { title: '用循环群', body: '乘法群循环，便于求阶与原根。', },
    ],
    pitfalls: ['认为任意阶都有有限域：必须是素数幂。', '混淆特征与阶：特征是素数 p，阶是 p 的幂。', '把两个同阶域当同一个：同构但构造不同。'],
    example: { problem: '四个元素的有限域存在吗？', walkthrough: ['四等于二的平方。', '存在唯一。'], result: '存在' },
    moreExamples: [{ problem: '六个元素的有限域存在吗？', walkthrough: ['六不是素数幂。', '不存在。'], result: '不存在' },],
  },
  {
    id: 'algebraic-integers',
    title: '代数整数与整数环',
    tag: '代数数论',
    level: '竞赛',
    essence: '代数整数是某个首一整系数多项式的根。一个数域中所有代数整数构成整数环，它是数论研究的基本对象。',
    definition: '复数是代数整数，若它是某个首一整系数多项式的根。数域 K 中全体代数整数构成环，记作整数环。',
    whenToUse: ['判断代数整数', '求数域的整数环', '研究单位群'],
    theorems: [
      { name: '整数环是环', statement: '代数整数对加法乘法封闭。', },
      { name: '代数整数判据', statement: '在数域中，元素代数整数当且仅当其极小多项式整系数。', },
    ],
    steps: [
      { title: '找极小多项式', body: '确定元素在有理数上的极小多项式。', },
      { title: '看是否首一整系数', body: '整系数才代数整数。', },
      { title: '求整数环', body: '数域中全体代数整数的集合。', },
      { title: '用整基', body: '整数环是自由阿贝尔群，取整基。', },
      { title: '看单位', body: '单位群结构由狄利克雷单位定理给出。', },
    ],
    pitfalls: ['把有理数当整数：分子分母都要整才是整数。', '误以为整数环就是多项式环：要取整系数。', '忽略整基：整数环的秩等于域次数。'],
    example: { problem: '根号二是代数整数吗？', walkthrough: ['满足 x 平方减二等于零。', '首一整系数。'], result: '是' },
    moreExamples: [{ problem: '二分之一是代数整数吗？', walkthrough: ['极小多项式是 2x 减一。', '非首一。'], result: '不是' },],
  },
  {
    id: 'ideal-factorization',
    title: '理想的唯一分解',
    tag: '代数数论',
    level: '竞赛',
    essence: '代数数论中整数环一般不是唯一分解整环，但理想可以唯一分解成素理想之积，这是戴德金整环的核心性质。',
    definition: '戴德金整环中每个非零理想可唯一分解为素理想的乘积。整数环中元素分解失效时，改用理想分解恢复唯一性。',
    whenToUse: ['分解理想', '研究素理想分解', '计算类群'],
    theorems: [
      { name: '理想唯一分解', statement: '戴德金整环的理想唯一分解为素理想之积。', },
      { name: '素理想分解', statement: '有理素数在扩域中的分解方式由分歧指数与剩余次数决定。',
        formula: 'pO_K=\\prod\\mathfrak{p}_i^{e_i}', },
    ],
    steps: [
      { title: '先看元素分解', body: '若整数环唯一分解则直接因子分解。', },
      { title: '转为理想', body: '把元素对应主理想。', },
      { title: '分解素理想', body: '用 Dedekind 定理或判别式。', },
      { title: '读指数', body: '分歧指数与剩余次数。', },
      { title: '算类群', body: '衡量唯一分解失败的程度。', },
    ],
    pitfalls: ['把理想当元素：理想因子分解与元素分解不同。', '忽略分歧：分歧素数出现重指数。', '在非戴德金环套用：前提要满足。'],
    example: { problem: '有理素数在二次域中可能如何分解？', walkthrough: ['可能分裂、惯性或分歧。', '三种情形。'], result: '分裂、惯性或分歧' },
    moreExamples: [{ problem: '理想分解能恢复唯一性吗？', walkthrough: ['戴德金整环中唯一。'], result: '能' },],
  },
  {
    id: 'dedekind-domains',
    title: '戴德金整环',
    tag: '代数数论',
    level: '竞赛',
    essence: '戴德金整环是诺特、整闭、维数为一的整环。它的分式理想构成群，理想唯一分解是这一定义的主要回报。',
    definition: '整环若满足诺特性、整闭、每个非零素理想极大，称为戴德金整环。数域的整数环都是戴德金整环。',
    whenToUse: ['判断戴德金整环', '使用理想群', '证明理想分解'],
    theorems: [
      { name: '分式理想群', statement: '戴德金整环的分式理想构成自由阿贝尔群。', },
      { name: '类群有限', statement: '数域的理想类群是有限群。', },
    ],
    steps: [
      { title: '验诺特', body: '理想升链稳定。', },
      { title: '验整闭', body: '整数环在分式域中整闭。', },
      { title: '看维数', body: '非零素理想极大即维数一。', },
      { title: '用理想群', body: '分式理想可逆，构成群。', },
      { title: '算类群阶', body: '类数衡量偏离主理想整环的程度。', },
    ],
    pitfalls: ['把戴德金当唯一分解整环：元素分解不一定唯一。', '忘记整闭：缺一不可。', '混淆类数与类群：类数是群阶。'],
    example: { problem: '数域的整数环是不是戴德金整环？', walkthrough: ['满足三条性质。', '因此是。'], result: '是' },
    moreExamples: [{ problem: '类数为一时整数环是什么？', walkthrough: ['所有理想都是主理想。', '即主理想整环。'], result: '主理想整环' },],
  },
  {
    id: 'ramification',
    title: '分歧：素理想的特殊情况',
    tag: '代数数论',
    level: '竞赛',
    essence: '有理素数在扩域中可能保持素、分裂成多个素理想，或者出现重指数。出现重指数时称该素数分歧。',
    definition: '素理想分解中指数大于一的情形叫分歧。二次域中，判别式整除的素数恰好分歧。',
    whenToUse: ['判断分歧', '计算判别式', '理解分歧理论'],
    theorems: [
      { name: '判别式判分歧', statement: '二次域中 p 分歧当且仅当 p 整除判别式。', },
      { name: '分歧指数乘积', statement: '各分歧指数与剩余次数之积等于扩张次数。',
        formula: '\\sum e_i f_i=n', },
    ],
    steps: [
      { title: '算判别式', body: '数域的判别式。', },
      { title: '看整除关系', body: '素因子是分歧素数。', },
      { title: '分解素理想', body: '看指数是否大于一。', },
      { title: '验乘积公式', body: '指数与剩余次数之积等于次数。', },
      { title: '联系伽罗瓦', body: '伽罗瓦扩张中分歧更整齐。', },
    ],
    pitfalls: ['把分歧当分裂：分裂指数为一。', '忽略判别式：二次域判据最简单。', '忘记乘积公式：可用来校验分解。'],
    example: { problem: '有理数域上二次域中哪些素数分歧？', walkthrough: ['看判别式的素因子。'], result: '整除判别式的素数' },
    moreExamples: [{ problem: '分歧指数一定大于一吗？', walkthrough: ['按定义就是。'], result: '是' },],
  },
  {
    id: 'counting-principles',
    title: '计数原理与容斥',
    tag: '组合数学',
    level: '基础',
    essence: '加法原理处理分类，乘法原理处理分步，容斥原理处理重叠。三者是计数的全部起点。',
    definition: '加法原理：互斥情形数相加。乘法原理：独立步骤数相乘。容斥原理：并集大小等于各集合大小之和减去两两交集、加上三三交集，依次交替。',
    whenToUse: ['数出方案总数', '处理「至少」「至多」', '修正重复计数'],
    theorems: [
      { name: '乘法原理', statement: '分步完成，方案数为各步之积。',
        formula: 'N=n_1n_2\\cdots n_k', },
      { name: '容斥原理', statement: '并集按交集交替加减。',
        formula: '|A\\cup B|=|A|+|B|-|A\\cap B|', },
    ],
    steps: [
      { title: '判断分类还是分步', body: '互斥用加法，独立用乘法。', },
      { title: '画树状图', body: '复杂计数先理清层级。', },
      { title: '处理重叠', body: '有重复时用容斥修正。', },
      { title: '验证小情形', body: '用小数字手算对照。', },
      { title: '检查是否漏算', body: '确认每个方案恰被数一次。', },
    ],
    pitfalls: ['分类不互斥却直接相加。', '分步不独立却直接相乘。', '容斥只减一次交集就停。'],
    example: { problem: '从 5 人中选 2 人有几种选法？', walkthrough: ['与顺序无关。', '组合数 C(5,2)。'], result: '10' },
    moreExamples: [{ problem: '三人中至少一人戴帽的方案数（每人可戴可不戴，共 8 种）?', walkthrough: ['总方案 8 种。', '全不戴 1 种。', '至少一顶为 7。'], result: '7' },],
  },
  {
    id: 'permutations-combinations',
    title: '排列与组合',
    tag: '组合数学',
    level: '基础',
    essence: '排列讲顺序，组合不讲顺序。两者的关系是排列等于组合乘上组内顺序数。',
    definition: '从 n 个不同元素中取 r 个按顺序排列，方案数为 n 的 r 次下降乘积。若不讲顺序，则再除以 r 的阶乘。',
    whenToUse: ['区分有序与无序', '计算抽取方案', '处理重复元素排列'],
    theorems: [
      { name: '排列数', statement: '从 n 取 r 的排列数。',
        formula: 'P(n,r)=\\frac{n!}{(n-r)!}', },
      { name: '组合数', statement: '从 n 取 r 的组合数。',
        formula: 'C(n,r)=\\frac{n!}{r!(n-r)!}', },
    ],
    steps: [
      { title: '先问是否讲顺序', body: '讲顺序用排列，不讲用组合。', },
      { title: '套公式', body: '写出 n 与 r。', },
      { title: '处理重复元素', body: '除以重复元素的阶乘。', },
      { title: '检查边界', body: 'r 不能超过 n。', },
      { title: '用对称性', body: 'C(n,r) 等于 C(n,n-r)，可化简。', },
    ],
    pitfalls: ['有序无序混用：结果差 r 的阶乘倍。', '重复元素不除：同字母排列会重复计。', '忘记边界：r 大于 n 时为零。'],
    example: { problem: '从 5 人中选 3 人排队，有几种排法？', walkthrough: ['讲顺序。', 'P(5,3)。'], result: '60' },
    moreExamples: [{ problem: '字母 AAB 有多少种不同排列？', walkthrough: ['三个位置。', '两个 A 重复，除以 2 的阶乘。'], result: '3' },],
  },
  {
    id: 'generating-functions',
    title: '生成函数：把数列变成函数',
    tag: '组合数学',
    level: '进阶',
    essence: '生成函数把数列的项当成系数，把计数问题变成多项式或幂级数的运算。加减对应并，乘对应卷积。',
    definition: '数列的普通生成函数是以该数列为系数的形式幂级数。组合问题常转化为求某个生成函数的系数。',
    whenToUse: ['解递推关系', '求组合数的封闭形式', '处理带限制的选取'],
    theorems: [
      { name: '几何级数', statement: '常数列的生成函数是几何级数。',
        formula: '\\frac{1}{1-x}=\\sum x^{n}', },
      { name: '卷积对应乘法', statement: '两个数列卷积的生成函数等于各自生成函数之积。', },
    ],
    steps: [
      { title: '设未知数列', body: '把要求的量记为数列。', },
      { title: '写生成函数', body: '用题目条件列出方程。', },
      { title: '解函数方程', body: '化成有理函数或已知展开。', },
      { title: '提取系数', body: '用部分分式或展开求系数。', },
      { title: '验证前几项', body: '手算对照。', },
    ],
    pitfalls: ['把形式幂级数当普通函数：收敛性不是重点。', '卷积方向搞反：系数相乘即相加下标。', '忽略初始条件：递推要配合初值。'],
    example: { problem: '求 1 的和数列（每项都是 1）的生成函数。', walkthrough: ['几何级数公比为 x。', '首项为 1。'], result: '1/(1-x)' },
    moreExamples: [{ problem: '斐波那契数列的生成函数分母是什么？', walkthrough: ['由递推得二次方程。', '分母为 1 减 x 减 x 平方。'], result: '1-x-x²' },],
  },
  {
    id: 'pigeonhole',
    title: '抽屉原理：必然的重复',
    tag: '组合数学',
    level: '进阶',
    essence: '把 n+1 个东西放进 n 个抽屉，必有一个抽屉至少两个。简单到不起眼，但能证明很多存在性结论。',
    definition: '若把多于 n 个物体放入 n 个盒子，则至少一个盒子含两个或以上物体。推广形式给出至少一个盒子的下界。',
    whenToUse: ['证明存在性', '估计重复次数', '竞赛组合题'],
    theorems: [
      { name: '基本形式', statement: 'n+1 个物体放入 n 个盒子必有重复。', },
      { name: '推广形式', statement: '物体数为 kn+1 时至少一个盒子有 k+1 个。', },
    ],
    steps: [
      { title: '构造盒子', body: '把要证明的对象按某种方式分类成盒子。', },
      { title: '数物体', body: '确认物体数多于盒子数。', },
      { title: '得结论', body: '存在两个物体同盒。', },
      { title: '翻译回原题', body: '同盒意味着某个性质成立。', },
      { title: '加强估计', body: '用推广形式得到更精确下界。', },
    ],
    pitfalls: ['盒子分类不当：结论翻译不回原题。', '物体数没数清：差一就失效。', '只证存在不构造：存在性证明不要求给出具体例子。'],
    example: { problem: '13 个人中至少两人同月出生吗？', walkthrough: ['12 个月是盒子。', '13 人放入。'], result: '必然同月' },
    moreExamples: [{ problem: '任取 5 个整数，必有两个之差是 4 的倍数吗？', walkthrough: ['按模 4 余数分 4 类。', '5 个整数放入。'], result: '必有' },],
  },
  {
    id: 'partial-orders-lattices',
    title: '偏序与格：任意两元有上下确界',
    tag: '格论',
    level: '进阶',
    essence: '格是每对元素都有最小上界与最大下界的偏序集。它把「交」与「并」抽象成运算。',
    definition: '偏序集若任意两元素都有上确界与下确界，称为格。上确界记作并，下确界记作交。',
    whenToUse: ['判断偏序集是否为格', '用哈斯图分析结构', '研究布尔代数'],
    theorems: [
      { name: '格运算律', statement: '并与交满足交换、结合、吸收律。',
        formula: 'a\\vee(b\\wedge a)=a', },
      { name: '有限格完备', statement: '有限格对任意有限子集有上下确界。', },
    ],
    steps: [
      { title: '画哈斯图', body: '把偏序画成图。', },
      { title: '逐对找上下确界', body: '每对都要存在。', },
      { title: '验运算律', body: '交换、结合、吸收。', },
      { title: '找特殊元', body: '最大元、最小元是否存 在。', },
      { title: '联系代数', body: '格也可用运算公理定义。', },
    ],
    pitfalls: ['把偏序当格：不可比的对可能没有确界。', '混淆上下确界：方向别搞反。', '忽略空子集：空集的确界对应最大最小元。'],
    example: { problem: '集合 {1,2,3} 的幂集在包含关系下是格吗？', walkthrough: ['任意两子集有并集与交集。', '分别是上下确界。'], result: '是格' },
    moreExamples: [{ problem: '自然数在整除关系下是格吗？', walkthrough: ['两数有最小公倍数与最大公约数。', '分别为上下确界。'], result: '是格' },],
  },
  {
    id: 'distributive-lattices',
    title: '分配格与布尔代数',
    tag: '格论',
    level: '进阶',
    essence: '分配格满足分配律。布尔代数是每个元素都有补元的分配格，是逻辑运算与集合运算的抽象。',
    definition: '格若交对并、并对交满足分配律，称为分配格。带补元的分配格叫布尔代数。',
    whenToUse: ['判断分配律', '理解命题逻辑的代数模型', '化简逻辑表达式'],
    theorems: [
      { name: '分配判据', statement: '格是分配格当且仅当不含两个特定子格。', },
      { name: '布尔代数表示', statement: '有限布尔代数同构于幂集代数。', },
    ],
    steps: [
      { title: '验一个分配律', body: '另一个可由对偶得到。', },
      { title: '找补元', body: '每个元素是否有补。', },
      { title: '用表示定理', body: '有限布尔代数同构于幂集。', },
      { title: '化简表达式', body: '用分配律与吸收律。', },
      { title: '联系逻辑', body: '并是析取，交是合取，补是否定。', },
    ],
    pitfalls: ['只验一个分配方向：对偶方向也要成立。', '把分配格当布尔代数：还缺补元。', '忽略同构：不同表示可能同一代数。'],
    example: { problem: '幂集代数满足分配律吗？', walkthrough: ['并与交满足分配。'], result: '满足' },
    moreExamples: [{ problem: '五边形格是分配格吗？', walkthrough: ['含禁止子格。', '不是。'], result: '不是' },],
  },
  {
    id: 'ideals-filters',
    title: '理想与滤子',
    tag: '格论',
    level: '竞赛',
    essence: '格中的理想是「向下封闭」的子集，滤子是「向上封闭」。它们在布尔代数中对应集合代数里的理想与滤子。',
    definition: '格的非空子集若对并与交封闭且向下封闭，称为理想。向上的对偶概念是滤子。极大理想与超滤子分别对应素性的两种刻画。',
    whenToUse: ['研究格的商结构', '布尔代数与超滤子', '证明紧致性定理'],
    theorems: [
      { name: '超滤子定理', statement: '每个滤子可延拓为超滤子（依赖选择公理）。', },
      { name: '素理想对应同态', statement: '格同态的核是理想。', },
    ],
    steps: [
      { title: '判断封闭性', body: '对并与交封闭。', },
      { title: '验向下封闭', body: '理想要求更小的元素也在其中。', },
      { title: '对偶得滤子', body: '把偏序反过来。', },
      { title: '取极大', body: '用佐恩引理延拓。', },
      { title: '用于逻辑', body: '超滤子给出一致性模型。', },
    ],
    pitfalls: ['理想与滤子方向搞反。', '漏验向下封闭：只验封闭不够。', '忽略选择公理：超滤子延拓依赖它。'],
    example: { problem: '布尔代数中的理想对什么封闭？', walkthrough: ['对并与交封闭。', '且向下。'], result: '并与交' },
    moreExamples: [{ problem: '极大理想与素理想在布尔代数中关系？', walkthrough: ['布尔代数中极大即素。'], result: '一致' },],
  },
  {
    id: 'fixed-point-lattices',
    title: '格上的不动点定理',
    tag: '格论',
    level: '竞赛',
    essence: '完备格上的单调映射必有最小与最大不动点。这条定理是程序语义与递归定义的数学基础。',
    definition: '完备格是任意子集都有上下确界的格。单调映射保持偏序。塔斯基不动点定理给出不动点存在与构造。',
    whenToUse: ['证明递归方程有解', '程序语义的最小不动点', '博弈论中的均衡存在'],
    theorems: [
      { name: '塔斯基不动点定理', statement: '完备格上单调映射有最小与最大不动点。', },
      { name: '迭代表达', statement: '从小元出发迭代上确界得到最小不动点。',
        formula: '\\bigvee f^{n}(\\bot)', },
    ],
    steps: [
      { title: '验完备性', body: '任意子集有确界。', },
      { title: '验单调', body: '映射保持偏序。', },
      { title: '迭代', body: '从最小元反复作用。', },
      { title: '取上确界', body: '迭代链的确界即最小不动点。', },
      { title: '用于定义', body: '递归定义取最小不动点。', },
    ],
    pitfalls: ['非完备格套用：需任意子集有确界。', '非单调映射：结论不成立。', '迭代有限次：无限格要取上确界。'],
    example: { problem: '实数区间 [0,1] 上的单调递增映射必有不动点吗？', walkthrough: ['区间是完备格。', '单调映射符合条件。'], result: '必有' },
    moreExamples: [{ problem: '程序递归语义取哪个不动点？', walkthrough: ['取最小不动点。', '对应有限逼近。'], result: '最小不动点' },],
  },
  {
    id: 'linear-codes',
    title: '线性码：用向量空间编码',
    tag: '编码理论',
    level: '进阶',
    essence: '线性码是有限域上的向量子空间。编码就是把消息向量乘生成矩阵，译码就是判断收到向量属于哪个陪集。',
    definition: '线性码是有限域上向量空间的子空间。码的维数是消息长度，长度是码字长度，最小距离决定纠错能力。',
    whenToUse: ['构造纠错码', '计算码的参数', '判断线性性'],
    theorems: [
      { name: '生成矩阵', statement: '码字由消息乘生成矩阵得到。',
        formula: 'c=mG', },
      { name: '校验矩阵', statement: '码字满足校验方程。',
        formula: 'Hc^{T}=0', },
    ],
    steps: [
      { title: '定有限域', body: '选素域或扩域作为字母表。', },
      { title: '给生成矩阵', body: '行向量张成码空间。', },
      { title: '算最小距离', body: '非零码字的最小重量。', },
      { title: '得纠错能力', body: '由最小距离决定。', },
      { title: '设计校验', body: '用校验矩阵快速判错。', },
    ],
    pitfalls: ['把码当任意子集：线性码必须是子空间。', '最小距离当最小重量只在非零码字。', '忘记有限域：实数上的子空间不是码。'],
    example: { problem: '汉明码 [7,4,3] 的纠错能力是多少位？', walkthrough: ['最小距离为 3。', '能纠一位错。'], result: '1 位' },
    moreExamples: [{ problem: '码的维数为 4 意味着什么？', walkthrough: ['消息有 4 位。', '共 16 个码字。'], result: '16 个码字' },],
  },
  {
    id: 'hamming-distance',
    title: '汉明距离与纠错能力',
    tag: '编码理论',
    level: '进阶',
    essence: '汉明距离是两码字不同位置的个数。最小距离 d 的码能纠 (d-1)/2 位错，能检 d-1 位错。',
    definition: '两个等长码字的汉明距离是它们不同坐标的个数。码的最小距离是所有不同码字对距离的最小值。',
    whenToUse: ['计算纠错能力', '判断能否检错', '设计码参数'],
    theorems: [
      { name: '纠错能力', statement: '最小距离 d 可纠 t 位错，t 为 (d-1)/2 取整。',
        formula: 't=\\lfloor(d-1)/2\\rfloor', },
      { name: '检错能力', statement: '最小距离 d 可检 d-1 位错。', },
    ],
    steps: [
      { title: '算距离', body: '逐位比较不同坐标数。', },
      { title: '找最小', body: '所有码字对中的最小值。', },
      { title: '取半', body: '纠错能力为 (d-1)/2 取整。', },
      { title: '区分纠错与检错', body: '检错能力更强。', },
      { title: '设计码', body: '按需求选 d。', },
    ],
    pitfalls: ['纠错与检错混淆：两者公式不同。', '忘记取整：能力是整数位。', '用平均距离：要看最小值。'],
    example: { problem: '最小距离为 3 的码能纠几位错？', walkthrough: ['(3-1)/2=1。', '纠一位。'], result: '1 位' },
    moreExamples: [{ problem: '最小距离为 4 的码能纠几位？', walkthrough: ['(4-1)/2 取整为 1。', '可检 3 位。'], result: '纠 1 位，检 3 位' },],
  },
  {
    id: 'hamming-code',
    title: '汉明码：完美的一比特纠错',
    tag: '编码理论',
    level: '进阶',
    essence: '汉明码用校验位覆盖消息位，使每个错误位置都有唯一的校验症状。它是完美码：所有症状都被用上。',
    definition: '汉明码的校验矩阵列取所有非零向量，长度 2 的 r 次方减一，消息长度 2 的 r 次方减一减 r。最小距离为 3。',
    whenToUse: ['构造纠错码', '计算校验位', '理解完美码'],
    theorems: [
      { name: '参数', statement: '汉明码参数由校验位数 r 决定。',
        formula: '[2^{r}-1,\\,2^{r}-1-r,\\,3]', },
      { name: '完美性', statement: '汉明码的球刚好填满空间。', },
    ],
    steps: [
      { title: '定 r', body: '选校验位数。', },
      { title: '列校验矩阵', body: '所有非零 r 维向量作列。', },
      { title: '算消息长度', body: '长度减校验位数。', },
      { title: '编码', body: '消息位与校验位组合。', },
      { title: '译码', body: '症状指向错误位置。', },
    ],
    pitfalls: ['列重复：会导致最小距离不足 3。', '校验位当消息位：位置要约定清楚。', '认为能纠多位：汉明码只纠一位。'],
    example: { problem: '校验位为 3 的汉明码长度与消息长度各是多少？', walkthrough: ['长度 7。', '消息 4 位。'], result: '[7,4,3]' },
    moreExamples: [{ problem: '汉明码为什么叫完美码？', walkthrough: ['单错误球互不重叠且铺满。', '所有症状都有对应。'], result: '球填满空间' },],
  },
  {
    id: 'reed-solomon',
    title: 'RS 码：用多项式纠突发错误',
    tag: '编码理论',
    level: '竞赛',
    essence: 'RS 码把消息看成多项式系数，码字是多项式在若干点的取值。它能高效纠正突发错误，广泛用于光盘与二维码。',
    definition: 'RS 码在有限域上取 n 个不同点，消息为次数小于 k 的多项式，码字为这些点的取值。最小距离为 n-k+1，达到辛格尔顿界。',
    whenToUse: ['纠正突发错误', '存储与传输编码', '理解 MDS 码'],
    theorems: [
      { name: '辛格尔顿界', statement: '任何码的最小距离不超过 n-k+1。',
        formula: 'd\\le n-k+1', },
      { name: 'RS 达到界', statement: 'RS 码取到等号，是 MDS 码。',
        formula: 'd=n-k+1', },
    ],
    steps: [
      { title: '选有限域', body: '字母表大小决定域。', },
      { title: '选求值点', body: '取 n 个不同点。', },
      { title: '消息当多项式', body: '系数是消息符号。', },
      { title: '求值得码字', body: '多项式在这些点的值。', },
      { title: '译码', body: '用插值或 Berlekamp 算法。', },
    ],
    pitfalls: ['求值点重复：码字距离会下降。', '忘记有限域：实数上多项式求值不构成码。', '把 RS 当二进制码：它作用在符号上。'],
    example: { problem: 'RS 码 [n,k] 的最小距离是多少？', walkthrough: ['达到辛格尔顿界。', '等于 n-k+1。'], result: 'n-k+1' },
    moreExamples: [{ problem: 'RS 码能纠多少符号错误？', walkthrough: ['t 为 (d-1)/2。', 'd=n-k+1。'], result: '(n-k)/2 向下取整' },],
  },
  {
    id: 'numerical-errors',
    title: '误差与条件数',
    tag: '数值分析',
    level: '基础',
    essence: '数值计算有两类误差：截断误差来自近似公式，舍入误差来自有限精度。条件数衡量问题本身对扰动的敏感程度。',
    definition: '绝对误差是近似值与真值之差，相对误差是绝对误差除以真值。条件数衡量输入的相对误差被放大的倍数。',
    whenToUse: ['估计计算误差', '判断算法稳定性', '选择精度'],
    theorems: [
      { name: '误差传播', statement: '相对误差在运算中的放大由条件数决定。', },
      { name: '机器精度', statement: '双精度约 16 位有效数字。',
        formula: '\\varepsilon\\approx 10^{-16}', },
    ],
    steps: [
      { title: '分清误差类型', body: '截断还是舍入。', },
      { title: '算相对误差', body: '用绝对误差除以量级。', },
      { title: '估条件数', body: '看扰动放大倍数。', },
      { title: '判断稳定性', body: '条件数大则问题病态。', },
      { title: '选方法', body: '病态问题需要更高精度或正则化。', },
    ],
    pitfalls: ['把截断当舍入：来源不同。', '忽略量级：相对误差才有比较意义。', '只看算法不看问题：病态问题换算法也没用。'],
    example: { problem: '双精度浮点数大约有多少位有效数字？', walkthrough: ['机器精度约 10 的负 16 次方。'], result: '约 16 位' },
    moreExamples: [{ problem: '病态问题换算法能解决吗？', walkthrough: ['问题本身敏感。', '算法无法根治。'], result: '不能' },],
  },
  {
    id: 'interpolation',
    title: '插值与拉格朗日多项式',
    tag: '数值分析',
    level: '进阶',
    essence: '插值用已知点构造多项式。n+1 个点唯一确定一个次数不超过 n 的多项式，拉格朗日形式最直观。',
    definition: '给定互不相同的节点与函数值，存在唯一次数不超过 n 的多项式经过所有点。拉格朗日插值把它写成基函数的线性组合。',
    whenToUse: ['由数据点构造函数', '数值积分与微分', '理解龙格现象'],
    theorems: [
      { name: '唯一性', statement: 'n+1 个点的插值多项式唯一。', },
      { name: '插值误差', statement: '误差与节点分布的乘积有关。',
        formula: 'f(x)-P(x)=\\frac{f^{(n+1)}(\\xi)}{(n+1)!}\\prod(x-x_i)', },
    ],
    steps: [
      { title: '检查节点', body: '互不相同才唯一。', },
      { title: '构造基函数', body: '每个基在自身节点为 1，其余为 0。', },
      { title: '线性组合', body: '乘函数值相加。', },
      { title: '估误差', body: '用导数界与节点乘积。', },
      { title: '注意龙格', body: '高次等距插值可能震荡。', },
    ],
    pitfalls: ['节点重复：不唯一。', '次数取错：n+1 点对应次数不超过 n。', '高次盲目加密：龙格现象。'],
    example: { problem: '两个点确定几次多项式？', walkthrough: ['n+1=2，次数不超过 1。', '即直线。'], result: '一次' },
    moreExamples: [{ problem: '节点加密一定更准吗？', walkthrough: ['等距高次会震荡。'], result: '不一定' },],
  },
  {
    id: 'numerical-integration',
    title: '数值积分：梯形与辛普森',
    tag: '数值分析',
    level: '进阶',
    essence: '数值积分用简单函数的积分逼近复杂函数。梯形用直线，辛普森用抛物线，代数精度依次提高。',
    definition: '梯形公式用两端点连线下的梯形面积近似积分。辛普森公式用抛物线近似，代数精度为三次。复合形式把区间细分后求和。',
    whenToUse: ['计算无初等原函数的积分', '数值求解微分方程', '误差估计'],
    theorems: [
      { name: '复合梯形', statement: '误差是步长平方阶。',
        formula: 'O(h^{2})', },
      { name: '辛普森', statement: '误差是步长四次阶，代数精度 3。',
        formula: 'O(h^{4})', },
    ],
    steps: [
      { title: '选公式', body: '看精度需求。', },
      { title: '取步长', body: '细分区间。', },
      { title: '加权求和', body: '按公式组合函数值。', },
      { title: '估误差', body: '用高阶导数界。', },
      { title: '加密验证', body: '步长减半比较。', },
    ],
    pitfalls: ['步长与节点数混淆：h 是间距。', '辛普森当万能：被积函数不光滑时退化。', '忽略端点权重：复合公式端点系数不同。'],
    example: { problem: '辛普森的代数精度是几次？', walkthrough: ['对三次多项式精确。', '精度为 3。'], result: '3 次' },
    moreExamples: [{ problem: '梯形公式对一次多项式精确吗？', walkthrough: ['梯形就是直线下的面积。'], result: '精确' },],
  },
  {
    id: 'iterative-methods',
    title: '迭代法与牛顿法',
    tag: '数值分析',
    level: '进阶',
    essence: '迭代法把方程改写成不动点形式反复代入。牛顿法用切线加速，具有平方收敛速度。',
    definition: '迭代法构造数列逼近解。牛顿法用函数值与导数构造迭代式，在单根附近平方收敛。',
    whenToUse: ['解非线性方程', '求数值解', '分析收敛速度'],
    theorems: [
      { name: '牛顿迭代', statement: '迭代式为当前值减函数值除以导数。',
        formula: 'x_{n+1}=x_n-\\frac{f(x_n)}{f^{\\prime}(x_n)}', },
      { name: '平方收敛', statement: '单根附近误差平方级下降。',
        formula: 'e_{n+1}\\approx Ce_n^{2}', },
    ],
    steps: [
      { title: '写方程', body: '化为求根形式。', },
      { title: '选初值', body: '靠近根且导数不为零。', },
      { title: '迭代', body: '套牛顿公式。', },
      { title: '判收敛', body: '看相邻差是否足够小。', },
      { title: '防发散', body: '导数接近零时改用割线法。', },
    ],
    pitfalls: ['初值太远：可能不收敛。', '导数接近零：迭代爆掉。', '重根仍用牛顿：收敛降为线性。'],
    example: { problem: '用牛顿法求根号二的迭代式？', walkthrough: ['方程为平方减二。', '迭代式含平均值。'], result: 'x 减 (x²-2)/(2x)' },
    moreExamples: [{ problem: '牛顿法在重根处收敛速度？', walkthrough: ['降为线性。'], result: '线性收敛' },],
  },
  {
    id: 'lu-decomposition',
    title: 'LU 分解与线性方程组',
    tag: '计算数学',
    level: '进阶',
    essence: '高斯消元写成矩阵形式就是 LU 分解。一次分解可以反复解多个右端项，是数值线性代数的基本工具。',
    definition: '把矩阵分解为下三角与上三角之积，称为 LU 分解。带主元交换时为 PA 等于 LU。解方程组化为前代与回代两步。',
    whenToUse: ['解线性方程组', '算行列式', '求逆矩阵'],
    theorems: [
      { name: 'LU 分解', statement: '可逆矩阵在选主元后总可分解。',
        formula: 'PA=LU', },
      { name: '行列式', statement: '行列式等于上三角对角元之积乘置换符号。', },
    ],
    steps: [
      { title: '选主元', body: '按列选绝对值最大者，保证稳定。', },
      { title: '消元', body: '逐列消成上三角，记录乘子。', },
      { title: '得 L 与 U', body: '乘子构成下三角。', },
      { title: '前代', body: '解下三角方程。', },
      { title: '回代', body: '解上三角方程。', },
    ],
    pitfalls: ['不选主元：小主元导致误差放大。', '把 L 的乘子顺序搞错：按消元顺序排列。', '忽略置换：带交换时要乘 P。'],
    example: { problem: 'LU 分解后解一个方程组需要几次三角求解？', walkthrough: ['前代一次。', '回代一次。'], result: '两次' },
    moreExamples: [{ problem: '为什么选主元能提高稳定性？', walkthrough: ['避免除以很小的数。', '减少误差放大。'], result: '控制误差放大' },],
  },
  {
    id: 'eigen-algorithms',
    title: '特征值的数值算法',
    tag: '计算数学',
    level: '进阶',
    essence: '幂法迭代求主特征值，QR 算法求全部特征值。前者简单，后者稳定且通用。',
    definition: '幂法反复用矩阵乘向量并归一化，收敛到主特征向量。QR 算法反复做 QR 分解，把矩阵逐步化为上三角。',
    whenToUse: ['求主特征值', '求全部特征值', '分析收敛速度'],
    theorems: [
      { name: '幂法收敛', statement: '主特征值严格占优时线性收敛，比率是次主与主特征值之比。', },
      { name: 'QR 迭代', statement: '相似变换保持特征值，收敛到上三角。', },
    ],
    steps: [
      { title: '选初始向量', body: '非零且在主特征方向有分量。', },
      { title: '迭代归一化', body: '每步除以范数防止溢出。', },
      { title: '读特征值', body: '用瑞利商估计。', },
      { title: 'QR 加速', body: '对全部特征值用 QR 迭代。', },
      { title: '处理复特征值', body: '用双步位移。', },
    ],
    pitfalls: ['初始向量与主特征向量正交：不收敛。', '主次特征值等模：幂法不收敛。', '忘记归一化：数值溢出。'],
    example: { problem: '主特征值为 3、次主为 1 时幂法的收敛比率？', walkthrough: ['比率是次主除主。', '为三分之一。'], result: '1/3' },
    moreExamples: [{ problem: '幂法能求最小特征值吗？', walkthrough: ['对逆矩阵用幂法。', '即反幂法。'], result: '可以，用反幂法' },],
  },
  {
    id: 'finite-difference',
    title: '有限差分：把微分方程变成方程组',
    tag: '计算数学',
    level: '进阶',
    essence: '有限差分用差商代替导数，把微分方程离散成线性方程组。网格越细精度越高，但稳定性有约束。',
    definition: '用网格点上的函数值近似导数，例如中心差商近似二阶导。热方程显式格式的稳定性要求时间步长与空间步长平方之比不超过二分之一。',
    whenToUse: ['数值解偏微分方程', '分析稳定性', '估计截断误差'],
    theorems: [
      { name: '二阶中心差', statement: '二阶导用三点差商近似，误差二阶。',
        formula: 'u_{xx}\\approx\\frac{u_{i+1}-2u_i+u_{i-1}}{h^{2}}', },
      { name: '稳定性条件', statement: '显式热格式要求时间步足够小。',
        formula: '\\Delta t\\le\\frac{h^{2}}{2}', },
    ],
    steps: [
      { title: '划网格', body: '选空间与时间步长。', },
      { title: '离散方程', body: '用差商替换导数。', },
      { title: '处理边界', body: '边界条件代入。', },
      { title: '检查稳定', body: '满足 CFL 类条件。', },
      { title: '求解与验证', body: '与解析解或加密网格对照。', },
    ],
    pitfalls: ['步长过大：显式格式发散。', '边界条件漏写：方程组不封闭。', '把截断误差当舍入误差：来源不同。'],
    example: { problem: '显式热格式的稳定性条件是什么？', walkthrough: ['时间步与空间步平方之比受限。', '不超过二分之一。'], result: 'Δt ≤ h²/2' },
    moreExamples: [{ problem: '隐式格式稳定吗？', walkthrough: ['无条件稳定，但每步要解方程组。'], result: '无条件稳定' },],
  },
  {
    id: 'monte-carlo',
    title: '蒙特卡洛方法',
    tag: '计算数学',
    level: '进阶',
    essence: '蒙特卡洛用随机抽样估计确定量。误差按根号 n 下降，与维数无关，适合高维问题。',
    definition: '用随机样本的平均值估计期望或积分。估计误差的标准差与样本量的平方根成反比。',
    whenToUse: ['高维积分', '随机模拟', '风险评估'],
    theorems: [
      { name: '误差阶', statement: '误差按样本量平方根倒数下降。',
        formula: 'O(1/\\sqrt{n})', },
      { name: '大数定律保证', statement: '样本均值依概率收敛到期望。', },
    ],
    steps: [
      { title: '定抽样分布', body: '按问题设计随机变量。', },
      { title: '生成样本', body: '用伪随机数或准随机数。', },
      { title: '求平均', body: '用样本均值估计。', },
      { title: '估误差', body: '用样本标准差除以根号 n。', },
      { title: '降方差', body: '重要性抽样、对偶变量等。', },
    ],
    pitfalls: ['样本不独立：误差估计失效。', '忽略方差：精度靠方差与样本量。', '把伪随机当真随机：周期性会影响结果。'],
    example: { problem: '样本量扩大 100 倍，误差下降多少？', walkthrough: ['误差按根号 n 下降。', '根号 100 为 10。'], result: '下降到十分之一' },
    moreExamples: [{ problem: '蒙特卡洛适合高维问题吗？', walkthrough: ['误差与维数无关。', '适合。'], result: '适合' },],
  },
  {
    id: 'navier-stokes',
    title: '纳维－斯托克斯方程',
    tag: '流体力学',
    level: '竞赛',
    essence: '纳维－斯托克斯方程是粘性流体的运动方程：惯性项加压力梯度等于粘性扩散。它是流体力学的核心方程。',
    definition: '不可压缩牛顿流体的运动方程由动量守恒与连续性方程组成，含非线性对流项与粘性项。',
    whenToUse: ['模拟粘性流动', '研究湍流', '分析压力分布'],
    theorems: [
      { name: '动量方程', statement: '对流项加压力项等于粘性项。',
        formula: '\\rho(\\partial_t u+u\\cdot\\nabla u)=-\\nabla p+\\mu\\Delta u', },
      { name: '不可压缩条件', statement: '速度散度为零。',
        formula: '\\nabla\\cdot u=0', },
    ],
    steps: [
      { title: '写连续性方程', body: '不可压缩即散度为零。', },
      { title: '写动量方程', body: '含对流、压力与粘性。', },
      { title: '给边界条件', body: '无滑移或自由滑移。', },
      { title: '无量纲化', body: '得到雷诺数。', },
      { title: '求解或近似', body: '解析解少，多靠数值。', },
    ],
    pitfalls: ['忽略非线性对流项：低速近似才可丢。', '边界条件写错：无滑移是粘性流的关键。', '雷诺数意义搞反：越大越易湍流。'],
    example: { problem: '雷诺数很大时流动倾向于什么状态？', walkthrough: ['惯性占优。', '容易失稳。'], result: '湍流' },
    moreExamples: [{ problem: '不可压缩流体的速度场满足什么？', walkthrough: ['散度为零。'], result: '无源无汇' },],
  },
  {
    id: 'euler-equations',
    title: '欧拉方程与无粘流动',
    tag: '流体力学',
    level: '进阶',
    essence: '忽略粘性得到欧拉方程。它描述理想流体，配合伯努利方程可解很多工程问题。',
    definition: '欧拉方程是无粘流体的动量方程，去掉粘性项。沿流线积分得到伯努利方程。',
    whenToUse: ['理想流体近似', '机翼升力估算', '喷管流动'],
    theorems: [
      { name: '欧拉方程', statement: '动量方程去掉粘性项。',
        formula: '\\rho(\\partial_t u+u\\cdot\\nabla u)=-\\nabla p', },
      { name: '伯努利方程', statement: '定常无粘不可压沿流线总压不变。',
        formula: 'p+\\frac{1}{2}\\rho v^{2}+\\rho gh=\\text{const}', },
    ],
    steps: [
      { title: '确认无粘', body: '雷诺数很大时近似成立。', },
      { title: '写欧拉方程', body: '去掉粘性项。', },
      { title: '沿流线积分', body: '得伯努利方程。', },
      { title: '代边界条件', body: '求压力与速度。', },
      { title: '检查适用性', body: '有分离时失效。', },
    ],
    pitfalls: ['伯努利跨流线用：只沿同一条流线成立。', '有粘时硬用：会得出错误升力。', '忽略可压缩性：高速时伯努利要修正。'],
    example: { problem: '伯努利方程适用于哪类流动？', walkthrough: ['定常、无粘、不可压。', '沿流线。'], result: '定常无粘不可压' },
    moreExamples: [{ problem: '理想流体绕机翼为什么会得出零阻力？', walkthrough: ['无粘假设。', '达朗贝尔佯谬。'], result: '无粘假设导致' },],
  },
  {
    id: 'bernoulli-principle',
    title: '伯努利原理与压力速度关系',
    tag: '流体力学',
    level: '基础',
    essence: '流速大的地方压力小。这条结论支撑机翼升力、喷雾器与文丘里管，但使用有严格前提。',
    definition: '定常、无粘、不可压缩流体沿流线，压力加动能密度加势能密度为常数。速度增大则压力减小。',
    whenToUse: ['解释升力', '设计文丘里管', '估算流量'],
    theorems: [
      { name: '伯努利方程', statement: '总压沿流线守恒。',
        formula: 'p+\\frac{1}{2}\\rho v^{2}=\\text{const}', },
      { name: '连续性方程', statement: '截面积小则速度大。',
        formula: 'A_1v_1=A_2v_2', },
    ],
    steps: [
      { title: '确认前提', body: '定常、无粘、不可压、沿流线。', },
      { title: '连连续性', body: '由面积比得速度比。', },
      { title: '代伯努利', body: '得压力差。', },
      { title: '算流量', body: '体积流量等于面积乘速度。', },
      { title: '检查适用', body: '有分离或粘性时慎用。', },
    ],
    pitfalls: ['把「流速大压力小」当万能：前提不满足会出错。', '跨流线比较：不同流线常数不同。', '忽略高度项：有显著高差时要加。'],
    example: { problem: '管道变细时流速与压力如何变化？', walkthrough: ['流速增大。', '压力减小。'], result: '流速增、压力减' },
    moreExamples: [{ problem: '伯努利能解释机翼升力吗？', walkthrough: ['常被简化误用。', '严格解释需要环量与库塔条件。'], result: '需配合环量理论' },],
  },
  {
    id: 'boundary-layer',
    title: '边界层理论',
    tag: '流体力学',
    level: '竞赛',
    essence: '高雷诺数流动中，粘性只在一层薄边界内显著。边界层外可当理想流体，内需考虑粘性与分离。',
    definition: '固体壁面附近粘性影响显著的薄层叫边界层。层内速度从零过渡到外流速度，厚度随流向增长。',
    whenToUse: ['估算摩擦阻力', '判断分离与失速', '简化高雷诺数流动'],
    theorems: [
      { name: '边界层方程', statement: '普朗特简化了纳维－斯托克斯方程。', },
      { name: '分离判据', statement: '逆压梯度导致边界层分离。', },
    ],
    steps: [
      { title: '算雷诺数', body: '判断是否高雷诺数。', },
      { title: '分内外区', body: '外区理想，内区粘性。', },
      { title: '解边界层方程', body: '用相似解或积分法。', },
      { title: '判断分离', body: '看压力梯度是否逆压。', },
      { title: '估阻力', body: '壁面剪切积分。', },
    ],
    pitfalls: ['低雷诺数套用：不成立。', '忽略分离：阻力估计会严重偏离。', '把边界层厚度当常数：沿流向增长。'],
    example: { problem: '边界层分离通常由什么引起？', walkthrough: ['逆压梯度。', '流体减速。'], result: '逆压梯度' },
    moreExamples: [{ problem: '高雷诺数下粘性可以完全忽略吗？', walkthrough: ['外区可以。', '边界层内不能。'], result: '壁面附近不能' },],
  },
  {
    id: 'wave-equation',
    title: '波动方程与达朗贝尔解',
    tag: '数学物理',
    level: '竞赛',
    essence: '波动方程描述振动传播。一维情形有达朗贝尔解：任意扰动分成左右两个行波，各自保持形状前进。',
    definition: '一维波动方程是二阶偏微分方程，系数为波速平方。达朗贝尔解把初值分解为左右行波之和，由初始位移与速度确定。',
    whenToUse: ['求解弦振动', '分析波传播', '理解特征线'],
    theorems: [
      { name: '达朗贝尔公式', statement: '解由左右行波叠加给出。',
        formula: 'u=\\frac{1}{2}(f(x-ct)+f(x+ct))+\\frac{1}{2c}\\int g', },
      { name: '特征线', statement: '扰动沿两条特征线传播。',
        formula: 'x\\pm ct=\\text{const}', },
    ],
    steps: [
      { title: '写出方程与初值', body: '位移与速度初值。', },
      { title: '特征分解', body: '化为两条特征线方向。', },
      { title: '套达朗贝尔公式', body: '代入初值。', },
      { title: '检查边界', body: '有限弦需边界条件。', },
      { title: '验证', body: '代回方程。', },
    ],
    pitfalls: ['忽略初速度项：解不完整。', '边界条件当无穷：有限弦不能用纯达朗贝尔。', '波速符号搞错：左右方向对应正负。'],
    example: { problem: '一维波动方程的通解形式？', walkthrough: ['两个行波叠加。', '左行加右行。'], result: '两个任意行波之和' },
    moreExamples: [{ problem: '初始速度为零时波形如何演化？', walkthrough: ['分成两个半幅行波。', '向两侧传播。'], result: '左右对称分开' },],
  },
  {
    id: 'heat-equation',
    title: '热传导方程与扩散',
    tag: '数学物理',
    level: '进阶',
    essence: '热方程描述扩散过程：温度趋于均匀，初始尖峰被抹平。它与波动方程的区别是时间一阶、空间二阶。',
    definition: '热方程是抛物型偏微分方程，温度对时间的导数正比于拉普拉斯算子。基本解是高斯核，随时间变宽变矮。',
    whenToUse: ['求解扩散问题', '理解平滑效应', '金融中的 Black－Scholes 变换'],
    theorems: [
      { name: '基本解', statement: '点源的热核是高斯函数。',
        formula: 'G(x,t)=\\frac{1}{\\sqrt{4\\pi t}}e^{-x^{2}/(4t)}', },
      { name: '最大值原理', statement: '内部温度不超过边界与初值的最大。', },
    ],
    steps: [
      { title: '定方程与初值', body: '初温分布。', },
      { title: '分离变量或卷积', body: '用热核卷积。', },
      { title: '处理边界', body: '狄利克雷或诺伊曼。', },
      { title: '看长期行为', body: '趋于平均温度。', },
      { title: '验证', body: '代回方程。', },
    ],
    pitfalls: ['把热方程当波动方程：时间阶数不同。', '忽略边界：边界决定稳态。', '认为信息有限速：热方程传播速度无穷。'],
    example: { problem: '热方程的基本解是什么函数？', walkthrough: ['点源扩散。', '高斯核。'], result: '高斯函数' },
    moreExamples: [{ problem: '热方程有平滑效应吗？', walkthrough: ['初值不光滑也会变光滑。', '是的。'], result: '有' },],
  },
  {
    id: 'schrodinger-equation',
    title: '薛定谔方程：量子力学的基本方程',
    tag: '数学物理',
    level: '竞赛',
    essence: '薛定谔方程描述量子态随时间的演化，波函数模方给出概率密度。它是数学物理中最重要的复值方程。',
    definition: '含时薛定谔方程把波函数对时间的导数与哈密顿算子作用联系起来。定态方程是特征值问题，能量为特征值。',
    whenToUse: ['求解量子系统', '理解能级', '分析隧穿效应'],
    theorems: [
      { name: '含时方程', statement: '时间导数正比于哈密顿作用。',
        formula: 'i\\hbar\\partial_t\\psi=H\\psi', },
      { name: '归一化', statement: '波函数模方全空间积分为一。',
        formula: '\\int|\\psi|^{2}=1', },
    ],
    steps: [
      { title: '写哈密顿量', body: '动能加势能。', },
      { title: '分离变量', body: '定态取能量本征态。', },
      { title: '解特征值问题', body: '得能级与波函数。', },
      { title: '归一化', body: '确定常数。', },
      { title: '看演化', body: '各本征态按相位旋转。', },
    ],
    pitfalls: ['忘记复数：方程本质是复的。', '把波函数当物理量：它是概率幅。', '忽略归一化：概率总和不为一。'],
    example: { problem: '定态薛定谔方程是什么类型的数学问题？', walkthrough: ['哈密顿算子的特征值问题。'], result: '特征值问题' },
    moreExamples: [{ problem: '波函数模方的意义？', walkthrough: ['概率密度。'], result: '概率密度' },],
  },
  {
    id: 'green-functions',
    title: '格林函数：点源响应',
    tag: '数学物理',
    level: '竞赛',
    essence: '格林函数是点源作用下的响应。知道它对任意源叠加就能解线性方程，这是偏微分方程的统一方法。',
    definition: '线性微分算子的格林函数满足算子作用于它等于狄拉克函数。解等于源与格林函数的卷积。',
    whenToUse: ['解非齐次方程', '构造积分表示', '处理边界条件'],
    theorems: [
      { name: '格林函数表示', statement: '解是源与格林函数的积分。',
        formula: 'u=\\int G(x,y)f(y)\\,dy', },
      { name: '对称性', statement: '自伴算子的格林函数对称。',
        formula: 'G(x,y)=G(y,x)', },
    ],
    steps: [
      { title: '定算子与边界', body: '明确方程与边界条件。', },
      { title: '解点源方程', body: '算子作用于格林函数等于脉冲。', },
      { title: '用叠加', body: '任意源积分叠加。', },
      { title: '验边界', body: '格林函数要满足齐次边界。', },
      { title: '检查对称', body: '自伴情形应对称。', },
    ],
    pitfalls: ['忽略边界条件：不同边界格林函数不同。', '把格林函数当特解：它是点源响应。', '忘记对称性检查：可用来验算。'],
    example: { problem: '格林函数满足什么方程？', walkthrough: ['算子作用于它等于狄拉克函数。'], result: '点源方程' },
    moreExamples: [{ problem: '解非齐次方程需要什么？', walkthrough: ['源与格林函数卷积。'], result: '积分叠加' },],
  },
  {
    id: 'language-structures',
    title: '语言与结构：模型论的基本对象',
    tag: '模型论',
    level: '竞赛',
    essence: '模型论研究形式语言与其解释之间的关系。结构给符号赋予含义，理论是句子集合，模型是满足理论的结 构。',
    definition: '一阶语言由常元、函数、关系符号组成。结构给出论域与符号解释。理论是句子集，模型是使理论中所有句子为真的结构。',
    whenToUse: ['形式化数学理论', '研究理论的模型类', '理解语义与语法'],
    theorems: [
      { name: '满足关系', statement: '结构满足句子记作语义后承。',
        formula: '\\mathcal{M}\\models\\varphi', },
      { name: '理论模型', statement: '模型满足理论中每个句子。', },
    ],
    steps: [
      { title: '定语言', body: '列出符号。', },
      { title: '给结构', body: '确定论域与解释。', },
      { title: '写理论', body: '把公理写成句子。', },
      { title: '检查满足', body: '逐个验证。', },
      { title: '研究模型类', body: '看所有模型的共同性质。', },
    ],
    pitfalls: ['语言与结构混淆：一个是符号，一个是解释。', '忽略论域：同一理论可有不同大小模型。', '把满足当可证：语义与语法不同。'],
    example: { problem: '群论的语言需要哪些符号？', walkthrough: ['乘法、单位元、逆元。'], result: '一个函数符号、一个常元、一个函数符号' },
    moreExamples: [{ problem: '同一理论能有不同大小的模型吗？', walkthrough: ['论域大小可变。', '是的。'], result: '可以' },],
  },
  {
    id: 'model-compactness',
    title: '紧致性定理：有限可满足即整体可满足',
    tag: '模型论',
    level: '竞赛',
    essence: '一阶理论的每个有限子集都有模型，则整个理论有模型。这条定理由哥德尔完备性定理推出，是模型论最常用的工具。',
    definition: '理论紧致，指若它的每个有限子集可满足，则它本身可满足。等价地，理论可满足当且仅当每个有限子集可满足。',
    whenToUse: ['构造非标准模型', '证明不可定义性', '研究模型大小'],
    theorems: [
      { name: '紧致性定理', statement: '有限可满足推出整体可满足。', },
      { name: '应用：非标准模型', statement: '算术理论有非标准模型。', },
    ],
    steps: [
      { title: '新增常元', body: '要构造大模型就加新常元。', },
      { title: '写有限约束', body: '让新常元大于所有标准数。', },
      { title: '验有限可满足', body: '每个有限子集用标准模型满足。', },
      { title: '用紧致性', body: '得整体模型。', },
      { title: '读结论', body: '模型含非标准元素。', },
    ],
    pitfalls: ['把紧致当完备：两者不同但相关。', '忽略一阶限制：二阶逻辑没有紧致性。', '有限可满足验证错：要逐个有限子集。'],
    example: { problem: '紧致性定理能推出算术有非标准模型吗？', walkthrough: ['加常元约束大于所有自然数。', '有限可满足。'], result: '能' },
    moreExamples: [{ problem: '二阶逻辑有紧致性吗？', walkthrough: ['没有。'], result: '没有' },],
  },
  {
    id: 'lowenheim-skolem',
    title: '勒文海姆－斯科伦定理',
    tag: '模型论',
    level: '竞赛',
    essence: '一阶理论若有无限模型，则对任意大基数都有模型；若有模型，则有可数模型。它说明一阶逻辑无法刻画「可数」。',
    definition: '向下定理：可满足的一阶理论有可数模型。向上定理：有无限模型的理论对任意大基数有模型。',
    whenToUse: ['研究模型大小', '理解一阶表达力局限', '构造可数模型'],
    theorems: [
      { name: '向下', statement: '可满足理论有可数模型。', },
      { name: '向上', statement: '无限模型可放大。', },
    ],
    steps: [
      { title: '先有模型', body: '理论可满足。', },
      { title: '向下取子结构', body: '用斯科伦函数封闭。', },
      { title: '得可数模型', body: '闭包大小可数。', },
      { title: '向上加常元', body: '用紧致性放大。', },
      { title: '读局限', body: '一阶不能区分可数与不可数。', },
    ],
    pitfalls: ['把定理当绝对：只对一阶逻辑。', '认为可数模型一定小：论域可数但结构复杂。', '混淆向上向下：方向不同。'],
    example: { problem: '实数理论有一阶可数模型吗？', walkthrough: ['一阶实闭域理论可满足。', '由向下定理有可数模型。'], result: '有' },
    moreExamples: [{ problem: '一阶逻辑能定义「可数」吗？', walkthrough: ['由上下定理不能。'], result: '不能' },],
  },
  {
    id: 'types-saturation',
    title: '类型与饱和模型',
    tag: '模型论',
    level: '竞赛',
    essence: '类型描述一个元素相对于已有参数能有的全部性质。饱和模型实现所有相容类型，是研究模型结构的理想对象。',
    definition: '相对于参数集的类型是含自由变量的公式集，且与理论相容。模型实现类型指存在元素满足其中每个公式。饱和模型实现所有较小参数集上的类型。',
    whenToUse: ['研究模型结构', '构造饱和模型', '理解量词消去'],
    theorems: [
      { name: '类型存在', statement: '相容类型总可被某模型实现。', },
      { name: '饱和唯一', statement: '同基数饱和模型同构。', },
    ],
    steps: [
      { title: '定参数集', body: '选一组已命名元素。', },
      { title: '写公式集', body: '描述目标元素的性质。', },
      { title: '验相容', body: '与理论不矛盾。', },
      { title: '找实现', body: '在饱和模型中找元素。', },
      { title: '用唯一性', body: '同基数饱和模型同构。', },
    ],
    pitfalls: ['类型不相容仍求实现：不存在的。', '参数集太大：饱和性只对较小集。'],
    example: { problem: '饱和模型实现所有相容类型吗？', walkthrough: ['定义如此（对较小参数集）。'], result: '实现' },
    moreExamples: [{ problem: '同基数饱和模型唯一吗？', walkthrough: ['在同构意义下唯一。'], result: '唯一' },],
  },
  {
    id: 'formal-proofs',
    title: '形式证明与自然演绎',
    tag: '证明论',
    level: '竞赛',
    essence: '形式证明是有限公式序列，每步由公理或推理规则得到。自然演绎把日常推理规则形式化，引入与消去成对出现。',
    definition: '证明系统由公理集与推理规则组成。自然演绎的规则分引入与消去两类：合取引入、蕴含消去（分离规则）等。',
    whenToUse: ['形式化数学证明', '验证推理规则', '理解证明的语法性'],
    theorems: [
      { name: '分离规则', statement: '由 P 与 P 蕴含 Q 得 Q。',
        formula: '\\frac{P\\quad P\\to Q}{Q}', },
      { name: '合取引入', statement: '两个命题都成立则可合取。',
        formula: '\\frac{P\\quad Q}{P\\wedge Q}', },
    ],
    steps: [
      { title: '列出前提', body: '把已知写成公式。', },
      { title: '选规则', body: '看目标形状匹配哪条引入规则。', },
      { title: '逐步推导', body: '每步注明依据。', },
      { title: '检查无跳步', body: '形式证明要求每步可查。', },
      { title: '得结论', body: '最后一行即定理。', },
    ],
    pitfalls: ['引入消去混用：方向不同。', '跳步：形式证明不允许显然。', '假设不释放：条件证明要正确收尾。'],
    example: { problem: '由 P 与 P→Q 能推出什么？', walkthrough: ['分离规则。', '得后件。'], result: 'Q' },
    moreExamples: [{ problem: '要证 P∧Q 需要什么？', walkthrough: ['分别证 P 与 Q。', '再用合取引入。'], result: '分别证明两个合取项' },],
  },
  {
    id: 'cut-elimination',
    title: '切割消除定理',
    tag: '证明论',
    level: '竞赛',
    essence: '切割消除说任何带切割的证明都能改写成无切割证明。无切割证明具有子公式性质，是自动证明与一致性证明的关键。',
    definition: '切割规则允许引入引理。切割消除定理断言带切割的证明可机械地转化为无切割证明，结论不变。',
    whenToUse: ['证明一致性', '构造无切割证明', '理解证明复杂度'],
    theorems: [
      { name: '切割消除', statement: '切割可被逐步消去。', },
      { name: '子公式性质', statement: '无切割证明只含结论的子公式。', },
    ],
    steps: [
      { title: '写带切割证明', body: '允许引理。', },
      { title: '找最上切割', body: '从顶向下消去。', },
      { title: '重写局部', body: '把切割换成组合。', },
      { title: '迭代', body: '直到无切割。', },
      { title: '用子公式性质', body: '分析证明结构。', },
    ],
    pitfalls: ['以为消除降低长度：可能指数增长。', '忽略结构规则：切割消除依赖系统设定。', '把切割消除当完备性：两者不同。'],
    example: { problem: '无切割证明有什么特殊性质？', walkthrough: ['只含子公式。'], result: '子公式性质' },
    moreExamples: [{ problem: '切割消除会让证明变短吗？', walkthrough: ['可能指数增长。', '不一定。'], result: '不一定' },],
  },
  {
    id: 'consistency-proofs',
    title: '一致性证明',
    tag: '证明论',
    level: '竞赛',
    essence: '证明系统一致，指不能同时证明命题与其否定。根岑用切割消除证明算术一致性，但哥德尔第二定理说明不能在系统内部证明。',
    definition: '理论一致，指不存在公式使其与否定都可证。一致性证明通常在更强系统中进行，或使用超限归纳。',
    whenToUse: ['判断理论安全性', '理解哥德尔限制', '研究证明强度'],
    theorems: [
      { name: '根岑一致性证明', statement: '用超限归纳证明算术一致。', },
      { name: '哥德尔第二定理', statement: '足够强的一致系统不能自证一致。', },
    ],
    steps: [
      { title: '明确系统', body: '公理与规则。', },
      { title: '找矛盾形式', body: '若可证矛盾则不一致。', },
      { title: '用更强工具', body: '超限归纳或更强系统。', },
      { title: '得结论', body: '系统一致。', },
      { title: '注意限制', body: '不能在系统内部完成。', },
    ],
    pitfalls: ['在系统内部自证：哥德尔禁止。', '把一致当完备：两者不同。', '忽略强度：证明需要更强原理。'],
    example: { problem: '哥德尔第二定理说明什么？', walkthrough: ['强系统不能自证一致。'], result: '不能内部证明自身一致性' },
    moreExamples: [{ problem: '根岑用什么工具证明算术一致？', walkthrough: ['切割消除与超限归纳。'], result: '超限归纳' },],
  },
  {
    id: 'proof-assistants',
    title: '证明助手与形式化数学',
    tag: '证明论',
    level: '进阶',
    essence: '证明助手把数学证明写成机器可检验的代码。它基于类型论或集合论，让证明的正确性由机器保证。',
    definition: '证明助手是交互式系统，用户给出证明脚本，系统检查每步是否合法。核心是柯里－霍华德对应：命题即类型，证明即程序。',
    whenToUse: ['形式化定理', '验证软件正确性', '教学与协作'],
    theorems: [
      { name: '柯里－霍华德对应', statement: '命题对应类型，证明对应程序。', },
      { name: '机器检验', statement: '类型检查保证证明正确。', },
    ],
    steps: [
      { title: '形式化陈述', body: '把定理写成类型。', },
      { title: '构造证明项', body: '写程序或策略脚本。', },
      { title: '类型检查', body: '机器验证。', },
      { title: '补引理', body: '复杂证明拆成小引理。', },
      { title: '维护', body: '库升级后重新检查。', },
    ],
    pitfalls: ['把形式化当自动证明：多数需人工引导。', '忽略库版本：证明可能失效。', '陈述写错：机器只保证与陈述一致，不保证陈述是想要的。'],
    example: { problem: '柯里－霍华德对应说的是什么？', walkthrough: ['命题与类型对应。', '证明与程序对应。'], result: '命题即类型，证明即程序' },
    moreExamples: [{ problem: '证明助手能保证定理有意义吗？', walkthrough: ['只保证与陈述一致。', '陈述本身要人来定。'], result: '不能，只保证形式正确' },],
  },
  {
    id: 'statistical-inference',
    title: '统计推断：从样本到总体',
    tag: '数据科学',
    level: '进阶',
    essence: '统计推断用样本估计总体：点估计给数，区间估计给范围，假设检验给判断。核心是抽样分布。',
    definition: '统计推断基于样本分布做关于总体的结论。置信区间由枢轴量构造，检验由统计量与显著性水平决定。',
    whenToUse: ['估计参数', '检验假设', '量化不确定性'],
    theorems: [
      { name: '中心极限定理', statement: '样本均值近似正态。', },
      { name: '置信区间', statement: '区间覆盖真值的概率由置信度控制。', },
    ],
    steps: [
      { title: '定模型', body: '确定总体分布族。', },
      { title: '选统计量', body: '构造枢轴量。', },
      { title: '求分布', body: '用抽样分布定分位数。', },
      { title: '算区间或 p 值', body: '代入样本。', },
      { title: '解释', body: '置信度是重复抽样覆盖比例。', },
    ],
    pitfalls: ['置信度当概率：是频率意义。', 'p 值当原假设概率：常见误读。', '忽略样本独立性：推断前提。'],
    example: { problem: '样本量增大时置信区间如何变化？', walkthrough: ['标准误按根号 n 缩小。', '区间变窄。'], result: '变窄' },
    moreExamples: [{ problem: 'p 值小于显著性水平的结论？', walkthrough: ['拒绝原假设。'], result: '拒绝原假设' },],
  },
  {
    id: 'linear-models',
    title: '线性回归：最小二乘的几何',
    tag: '数据科学',
    level: '进阶',
    essence: '线性回归把响应投影到特征张成的子空间。最小二乘解就是正交投影，残差与特征空间正交。',
    definition: '线性模型假设响应是特征的线性组合加噪声。最小二乘估计使残差平方和最小，等价于把响应投影到列空间。',
    whenToUse: ['拟合数据', '解释变量影响', '预测'],
    theorems: [
      { name: '正规方程', statement: '最小二乘解满足特征转置乘残差为零。',
        formula: 'X^{T}(y-X\\beta)=0', },
      { name: '投影解释', statement: '拟合值是响应的正交投影。', },
    ],
    steps: [
      { title: '定设计矩阵', body: '每行一个样本。', },
      { title: '解正规方程', body: '得到系数估计。', },
      { title: '看残差', body: '检查正交性与分布。', },
      { title: '评估拟合', body: '用决定系数与残差图。', },
      { title: '防过拟合', body: '加正则或降维。', },
    ],
    pitfalls: ['共线性：设计矩阵不满秩，解不唯一。', '把相关当因果：回归不证明因果。', '忽略残差诊断：模型假设可能不成立。'],
    example: { problem: '最小二乘解满足什么正交条件？', walkthrough: ['残差与特征空间正交。'], result: 'X 转置乘残差为零' },
    moreExamples: [{ problem: '特征完全共线时会怎样？', walkthrough: ['矩阵不满秩。', '系数不唯一。'], result: '解不唯一' },],
  },
  {
    id: 'optimization-methods',
    title: '优化方法：梯度下降与凸性',
    tag: '数据科学',
    level: '进阶',
    essence: '梯度下降沿负梯度迭代。凸问题保证局部最优即全局最优，学习率决定收敛与发散。',
    definition: '梯度下降迭代式是当前点减学习率乘梯度。凸函数满足割线在图像上方，保证一阶条件充分。',
    whenToUse: ['训练模型', '求解最优化', '理解收敛'],
    theorems: [
      { name: '梯度下降', statement: '沿负梯度更新。',
        formula: 'x_{k+1}=x_k-\\eta\\nabla f(x_k)', },
      { name: '凸性保证', statement: '凸问题局部最优即全局。', },
    ],
    steps: [
      { title: '写目标函数', body: '确认可微。', },
      { title: '算梯度', body: '解析或自动微分。', },
      { title: '选学习率', body: '太大会震荡，太小收敛慢。', },
      { title: '迭代', body: '直到梯度足够小。', },
      { title: '检查凸性', body: '凸则保证全局。', },
    ],
    pitfalls: ['学习率过大：发散。', '非凸问题期待全局：可能陷入局部。', '忽略尺度：特征未归一化导致病态。'],
    example: { problem: '梯度下降沿什么方向更新？', walkthrough: ['负梯度方向。'], result: '负梯度' },
    moreExamples: [{ problem: '凸问题的局部最优是什么？', walkthrough: ['全局最优。'], result: '即全局最优' },],
  },
  {
    id: 'graph-models',
    title: '图模型：把依赖画成图',
    tag: '数据科学',
    level: '进阶',
    essence: '图模型用图表示变量间的条件独立。贝叶斯网络给出有向分解，马尔可夫网络给出无向团分解。',
    definition: '贝叶斯网络用有向无环图表示联合分布按条件概率分解。马尔可夫网络用无向图表示团上的势函数分解。',
    whenToUse: ['建模变量依赖', '做概率推断', '理解因果结构'],
    theorems: [
      { name: '链式分解', statement: '联合分布按父节点条件概率相乘。',
        formula: 'P(X)=P\\prod P(X_i\\mid\\mathrm{pa}(X_i))', },
      { name: '条件独立', statement: '图分离对应条件独立。', },
    ],
    steps: [
      { title: '定变量', body: '列出随机变量。', },
      { title: '画依赖', body: '确定方向与边。', },
      { title: '写分解', body: '按图写条件概率或势函数。', },
      { title: '做推断', body: '消元或采样。', },
      { title: '验证独立', body: '用图分离判断。', },
    ],
    pitfalls: ['有环仍当贝叶斯网络：必须无环。', '方向随意：因果方向影响解释。', '忽略隐变量：可能造成虚假依赖。'],
    example: { problem: '贝叶斯网络的联合分布如何分解？', walkthrough: ['按父节点条件概率相乘。'], result: '条件概率连乘' },
    moreExamples: [{ problem: '马尔可夫网络用什么分解？', walkthrough: ['团上的势函数。'], result: '团势函数乘积' },],
  },
  {
    id: 'quantum-states',
    title: '量子态与希尔伯特空间',
    tag: '量子数学',
    level: '竞赛',
    essence: '量子态是希尔伯特空间中的单位向量，全局相位不影响物理。叠加原理让态可以是基态的线性组合。',
    definition: '量子系统的态由复希尔伯特空间中的单位向量表示。两个相差非零复数的向量描述同一态。可观测量是自伴算子。',
    whenToUse: ['描述量子系统', '计算概率幅', '理解叠加'],
    theorems: [
      { name: '归一化', statement: '态向量的内积为 1。',
        formula: '\\langle\\psi|\\psi\\rangle=1', },
      { name: '全局相位无关', statement: '相差模为 1 的复数的向量同一态。', },
    ],
    steps: [
      { title: '选基', body: '确定希尔伯特空间的基。', },
      { title: '写态向量', body: '用复系数线性组合。', },
      { title: '归一化', body: '除以范数。', },
      { title: '算内积', body: '求概率幅。', },
      { title: '忽略相位', body: '全局相位无物理意义。', },
    ],
    pitfalls: ['把全局相位当物理差异。', '忘记归一化：概率不守恒。', '把密度矩阵与态向量混用。'],
    example: { problem: '量子比特的两个基态如何表示？', walkthrough: ['标准基两个向量。', '任一态是它们的复线性组合。'], result: '二维复向量空间的标准基' },
    moreExamples: [{ problem: '全局相位有物理意义吗？', walkthrough: ['相差模 1 的复数是同一态。'], result: '没有' },],
  },
  {
    id: 'unitary-evolution',
    title: '酉演化：封闭系统的动力学',
    tag: '量子数学',
    level: '竞赛',
    essence: '封闭量子系统的演化由酉算子给出，保持内积与概率。薛定谔方程是它的连续形式。',
    definition: '酉算子满足共轭转置乘自身等于单位。量子门就是酉算子，演化可逆且保范数。',
    whenToUse: ['描述量子门', '验证保范性', '构造量子算法'],
    theorems: [
      { name: '酉性保内积', statement: '酉演化保持内积与范数。',
        formula: 'U^{\\dagger}U=I', },
      { name: '薛定谔演化', statement: '时间演化算子是酉的。',
        formula: 'U(t)=e^{-iHt/\\hbar}', },
    ],
    steps: [
      { title: '写演化算子', body: '由哈密顿量指数化。', },
      { title: '验酉性', body: '共轭转置乘自身为单位。', },
      { title: '作用到态', body: '得到新态。', },
      { title: '检查保范', body: '内积不变。', },
      { title: '组合门', body: '多个门按顺序相乘。', },
    ],
    pitfalls: ['把测量当酉演化：测量不可逆。', '忘记顺序：矩阵乘法不交换。', '忽略厄米性：哈密顿量必须自伴。'],
    example: { problem: '量子门必须满足什么条件？', walkthrough: ['保持概率。', '必须是酉算子。'], result: '酉性' },
    moreExamples: [{ problem: '测量是酉演化吗？', walkthrough: ['测量不可逆。', '不是。'], result: '不是' },],
  },
  {
    id: 'measurement',
    title: '测量与投影公设',
    tag: '量子数学',
    level: '竞赛',
    essence: '测量把态投影到某个本征子空间，概率由投影后的模方给出。测量后态坍缩，不可逆。',
    definition: '对可观测量测量，得到本征值的概率等于态在该本征子空间投影的模方。测量后态变为投影后的归一化态。',
    whenToUse: ['计算测量概率', '理解坍缩', '分析量子算法输出'],
    theorems: [
      { name: '玻恩规则', statement: '概率等于投影的模方。',
        formula: 'P(a)=|\\langle a|\\psi\\rangle|^{2}', },
      { name: '投影后归一化', statement: '测量后态是投影再归一化。', },
    ],
    steps: [
      { title: '找本征分解', body: '把可观测量对角化。', },
      { title: '投影', body: '把态投到本征子空间。', },
      { title: '算模方', body: '得概率。', },
      { title: '归一化', body: '得测量后态。', },
      { title: '验证概率和为一', body: '完备性保证。', },
    ],
    pitfalls: ['把概率当振幅：要取模方。', '忽略坍缩：测量后态改变。', '重复测量同一量：结果不变（已坍缩）。'],
    example: { problem: '测量概率由什么给出？', walkthrough: ['投影的模方。'], result: '玻恩规则' },
    moreExamples: [{ problem: '测量后立刻再测同一量？', walkthrough: ['态已坍缩到本征态。', '结果确定。'], result: '同一结果' },],
  },
  {
    id: 'entanglement',
    title: '纠缠与贝尔不等式',
    tag: '量子数学',
    level: '竞赛',
    essence: '纠缠态不能写成两个子系统态的乘积。贝尔不等式说明局域隐变量理论与量子力学矛盾。',
    definition: '两体纯态若不能写成张量积，称为纠缠态。贝尔不等式给出局域隐变量理论的上界，量子力学可违反。',
    whenToUse: ['理解非局域性', '量子通信', '量子计算优势'],
    theorems: [
      { name: '不可分解性', statement: '纠缠态不是乘积态。', },
      { name: 'CHSH 界', statement: '量子力学可达二倍根号二，经典界为二。',
        formula: '2\\sqrt{2}>2', },
    ],
    steps: [
      { title: '写两体态', body: '用张量积基展开。', },
      { title: '判分解', body: '能否写成乘积。', },
      { title: '算关联', body: '测四个方向的关联。', },
      { title: '代入 CHSH', body: '经典界为 2。', },
      { title: '对照量子值', body: '可达 2√2。', },
    ],
    pitfalls: ['把混态当纠缠：要区分关联类型。', '认为纠缠能超光速通信：不能传信息。', '忘记测量选择：贝尔测试需要不同方向。'],
    example: { problem: 'CHSH 不等式的经典上界是多少？', walkthrough: ['局域隐变量。', '上界为 2。'], result: '2' },
    moreExamples: [{ problem: '量子力学能达到多少？', walkthrough: ['最大违反为 2√2。'], result: '2√2' },],
  },
  {
    id: 'statistical-learning',
    title: '统计学习：经验风险与泛化',
    tag: '机器学习理论',
    level: '进阶',
    essence: '学习是从样本估计规律。经验风险最小化在训练集上拟合，泛化误差衡量在新数据上的表现。',
    definition: '假设类是可选函数的集合。经验风险是训练集上的平均损失，真实风险是分布上的期望损失。学习算法在两者间权衡。',
    whenToUse: ['理解过拟合', '分析泛化', '选择模型复杂度'],
    theorems: [
      { name: '误差分解', statement: '泛化误差等于经验风险加估计误差。', },
      { name: '一致收敛', statement: '假设类复杂度有限时经验风险逼近真实风险。', },
    ],
    steps: [
      { title: '定假设类', body: '选择模型家族。', },
      { title: '定损失', body: '衡量预测好坏。', },
      { title: '最小化经验风险', body: '训练。', },
      { title: '估泛化', body: '用验证集或理论界。', },
      { title: '调复杂度', body: '在欠拟合与过拟合间平衡。', },
    ],
    pitfalls: ['训练误差当泛化：会过拟合。', '假设类无限仍套界：需要复杂度度量。', '数据泄漏：验证集不能参与训练。'],
    example: { problem: '训练误差很低但测试误差高说明什么？', walkthrough: ['模型记住了训练数据。', '过拟合。'], result: '过拟合' },
    moreExamples: [{ problem: '泛化误差能小于经验风险吗？', walkthrough: ['一般情况下经验风险是乐观估计。', '但可能偶然更小。'], result: '可能，但通常经验风险更乐观' },],
  },
  {
    id: 'concentration-inequalities',
    title: '集中不等式与泛化界',
    tag: '机器学习理论',
    level: '竞赛',
    essence: '集中不等式说明独立随机变量之和偏离期望的概率很小。它是泛化界的技术基础。',
    definition: '霍夫丁不等式给出有界随机变量之和偏离期望的指数界。VC 维衡量假设类的复杂度，决定泛化界。',
    whenToUse: ['推导泛化界', '估计样本复杂度', '分析算法稳定性'],
    theorems: [
      { name: '霍夫丁不等式', statement: '有界变量之和偏离期望呈指数衰减。',
        formula: 'P(|\\bar X-\\mu|\\ge\\epsilon)\\le 2e^{-2n\\epsilon^{2}}', },
      { name: 'VC 泛化界', statement: '泛化误差与 VC 维除以样本量有关。', },
    ],
    steps: [
      { title: '确认独立性', body: '样本独立同分布。', },
      { title: '找界', body: '变量有界。', },
      { title: '套不等式', body: '得偏离概率。', },
      { title: '联合界', body: '对假设类做并集界。', },
      { title: '解出样本量', body: '得样本复杂度。', },
    ],
    pitfalls: ['忽略独立性：不独立时失效。', '忘记并集界：多个假设要乘个数。', '把 VC 维当实际泛化：只是上界。'],
    example: { problem: '霍夫丁不等式要求样本满足什么？', walkthrough: ['独立且有界。'], result: '独立有界' },
    moreExamples: [{ problem: 'VC 维大意味着什么？', walkthrough: ['假设类复杂。', '泛化界更松。'], result: '泛化更难' },],
  },
  {
    id: 'regularization',
    title: '正则化与偏差方差权衡',
    tag: '机器学习理论',
    level: '进阶',
    essence: '正则化在损失上加复杂度惩罚，抑制过拟合。偏差方差分解说明模型复杂度如何影响期望误差。',
    definition: '正则化在经验风险上加惩罚项。偏差方差分解把期望误差写成偏差平方、方差与噪声之和。',
    whenToUse: ['防止过拟合', '选择超参数', '理解模型复杂度'],
    theorems: [
      { name: '偏差方差分解', statement: '期望误差等于偏差平方加方差加噪声。',
        formula: 'E[(y-\\hat f)^{2}]=\\mathrm{Bias}^{2}+\\mathrm{Var}+\\sigma^{2}', },
      { name: '正则化', statement: '惩罚项限制参数大小。', },
    ],
    steps: [
      { title: '写目标', body: '损失加惩罚。', },
      { title: '选惩罚', body: 'L1 稀疏、L2 平滑。', },
      { title: '调强度', body: '交叉验证选超参数。', },
      { title: '分析权衡', body: '复杂度高方差大。', },
      { title: '看结果', body: '验证误差最小处。', },
    ],
    pitfalls: ['正则过强：欠拟合。', '用训练误差调参：会泄漏。', '混淆 L1 与 L2：稀疏性不同。'],
    example: { problem: '正则化太强会怎样？', walkthrough: ['模型受限。', '欠拟合。'], result: '欠拟合' },
    moreExamples: [{ problem: '偏差方差能同时最小吗？', walkthrough: ['通常此消彼长。'], result: '需要权衡' },],
  },
  {
    id: 'neural-approximation',
    title: '神经网络的逼近能力',
    tag: '机器学习理论',
    level: '竞赛',
    essence: '万能逼近定理说单隐层网络可逼近任意连续函数，但逼近所需宽度可能极大，且不保证可学习。',
    definition: '万能逼近定理：对紧集上的连续函数与任意精度，存在单隐层前馈网络以该精度逼近。定理只保证存在性。',
    whenToUse: ['理解网络表达力', '分析深度作用', '认识逼近与学习之别'],
    theorems: [
      { name: '万能逼近', statement: '单隐层网络可逼近连续函数。', },
      { name: '深度优势', statement: '某些函数深度网络所需参数远少于浅层。', },
    ],
    steps: [
      { title: '定目标函数', body: '连续且定义在紧集。', },
      { title: '选激活', body: '非多项式激活即可。', },
      { title: '构造网络', body: '用分段线性或阶梯逼近。', },
      { title: '估宽度', body: '可能指数级。', },
      { title: '区分学习', body: '逼近不等于可训练。', },
    ],
    pitfalls: ['把逼近当可学：优化可能失败。', '忽略宽度代价：可能极大。', '认为深度无用：深度有参数效率优势。'],
    example: { problem: '万能逼近定理保证网络可训练吗？', walkthrough: ['只保证存在。', '不保证优化成功。'], result: '不保证' },
    moreExamples: [{ problem: '深度网络相对浅层有什么优势？', walkthrough: ['某些函数参数效率更高。'], result: '参数效率' },],
  },
  {
    id: 'newtonian-mechanics',
    title: '牛顿力学：力与加速度',
    tag: '力学',
    level: '进阶',
    essence: '牛顿第二定律把力与加速度联系起来：合外力等于质量乘加速度。',
    definition: '质点受到的合外力等于其质量与加速度之积，在惯性系中成立。',
    whenToUse: ['求解质点运动', '分析受力', '理解惯性系'],
    theorems: [
      { name: '第二定律', statement: '合外力等于质量乘加速度。',
        formula: 'F=ma', },
      { name: '动量定理', statement: '冲量等于动量变化。',
        formula: '\\int F\\,dt=\\Delta p', },
    ],
    steps: [
      { title: '选参考系', body: '优先选惯性系。', },
      { title: '画受力图', body: '标出所有外力。', },
      { title: '写方程', body: '分解到坐标轴。', },
      { title: '解运动方程', body: '积分得速度与位置。', },
      { title: '检查极限', body: '用特殊情形自检。', },
    ],
    pitfalls: ['非惯性系不补惯性力。', '把合力当某个分力。', '约束力方向猜错。'],
    example: { problem: '恒定合力下质点如何运动？', walkthrough: ['加速度恒定。', '速度线性变化。'], result: '匀加速直线运动' },
    moreExamples: [{ problem: '合外力为零时？', walkthrough: ['加速度为零。', '速度保持不变。'], result: '匀速直线运动' }],
  },
  {
    id: 'energy-momentum',
    title: '能量与动量守恒',
    tag: '力学',
    level: '进阶',
    essence: '封闭系统能量与动量守恒，守恒律比解方程更省力。',
    definition: '动量守恒指无外力时总动量不变；机械能守恒指只有保守力做功时动能加势能不变。',
    whenToUse: ['碰撞问题', '快速求解', '判断运动范围'],
    theorems: [
      { name: '动量守恒', statement: '无外力时总动量不变。',
        formula: '\\sum p=\\text{const}', },
      { name: '机械能守恒', statement: '只有保守力做功时总机械能不变。',
        formula: 'T+V=\\text{const}', },
    ],
    steps: [
      { title: '判断守恒条件', body: '外力是否为零，是否保守。', },
      { title: '写守恒式', body: '初态等于末态。', },
      { title: '联立求解', body: '与几何约束结合。', },
      { title: '检查能量损失', body: '非弹性碰撞耗散。', },
      { title: '验证极限', body: '用特例核对。', },
    ],
    pitfalls: ['有摩擦仍用机械能守恒。', '把动量守恒用于有外力方向。', '忽略转动动能。'],
    example: { problem: '完全非弹性碰撞后速度如何？', walkthrough: ['动量守恒。', '两物同速。'], result: '总动量除以总质量' },
    moreExamples: [{ problem: '碰撞中动能一定守恒吗？', walkthrough: ['只有弹性碰撞守恒。'], result: '不一定' }],
  },
  {
    id: 'rigid-body-dynamics',
    title: '刚体转动：角动量与转动惯量',
    tag: '力学',
    level: '竞赛',
    essence: '刚体转动由转动惯量与角动量描述，力矩改变角动量。',
    definition: '刚体绕轴的转动惯量等于质量乘到轴距离平方的积分；角动量等于转动惯量乘角速度。',
    whenToUse: ['分析转动', '计算角加速度', '守恒律应用'],
    theorems: [
      { name: '转动定律', statement: '力矩等于角动量变化率。',
        formula: '\\tau=\\frac{dL}{dt}', },
      { name: '平行轴定理', statement: '绕任意轴转动惯量等于绕质心值加质量乘距离平方。',
        formula: 'I=I_{c}+md^{2}', },
    ],
    steps: [
      { title: '定转轴', body: '确定绕哪条轴转动。', },
      { title: '算转动惯量', body: '用积分或平行轴定理。', },
      { title: '算力矩', body: '力乘力臂。', },
      { title: '用转动定律', body: '求角加速度。', },
      { title: '检查能量', body: '转动动能等于二分之一转动惯量乘角速度平方。', },
    ],
    pitfalls: ['转动惯量不随轴变。', '力臂当距离。', '忽略角动量方向。'],
    example: { problem: '细杆绕端点与绕中心的转动惯量哪个大？', walkthrough: ['绕端点质量分布更远。', '转动惯量更大。'], result: '绕端点更大' },
    moreExamples: [{ problem: '角动量守恒条件？', walkthrough: ['合外力矩为零。'], result: '力矩为零' }],
  },
  {
    id: 'simplex-method',
    title: '单纯形法：沿顶点找最优',
    tag: '运筹学',
    level: '竞赛',
    essence: '单纯形法从一个顶点出发，沿使目标改善的边移动到相邻顶点直到最优。',
    definition: '单纯形法把线性规划化为标准形，用基变量表示目标，通过换基迭代在顶点间移动。',
    whenToUse: ['求解线性规划', '理解最优性条件', '分析灵敏度'],
    theorems: [
      { name: '最优性条件', statement: '检验数全部非负时当前顶点最优。', },
      { name: '有限终止', statement: '非退化问题有限步终止。', },
    ],
    steps: [
      { title: '化标准形', body: '引入松弛变量。', },
      { title: '找初始基', body: '构造初始可行基。', },
      { title: '算检验数', body: '判断是否最优。', },
      { title: '换基', body: '选入基与出基变量。', },
      { title: '迭代', body: '直到最优或无界。', },
    ],
    pitfalls: ['入基出基选错可能循环。', '忽略退化需 Bland 规则。', '忘记无界判定。'],
    example: { problem: '检验数全非负说明什么？', walkthrough: ['无法改进目标。'], result: '当前解最优' },
    moreExamples: [{ problem: '单纯形法何时无界？', walkthrough: ['入基变量可无限增大。', '无出基变量。'], result: '无出基变量' }],
  },
  {
    id: 'duality-theory',
    title: '对偶理论：两个问题一个答案',
    tag: '运筹学',
    level: '竞赛',
    essence: '每个线性规划都有对偶问题，强对偶说明最优值相等。',
    definition: '对偶问题把原问题的约束与目标互换；弱对偶给出界，强对偶说明最优值相等。',
    whenToUse: ['给最优值定界', '验证最优解', '灵敏度分析'],
    theorems: [
      { name: '弱对偶', statement: '对偶目标值不超过原目标值。', },
      { name: '强对偶', statement: '可行时两者最优值相等。', },
    ],
    steps: [
      { title: '写对偶', body: '按规则转置系数。', },
      { title: '求对偶解', body: '可从单纯形表读出。', },
      { title: '用弱对偶定界', body: '给任意可行解估界。', },
      { title: '验互补松弛', body: '检验最优性。', },
      { title: '灵敏度', body: '看影子价格。', },
    ],
    pitfalls: ['对偶方向写反。', '忽略可行性。', '把影子价格当实际价格。'],
    example: { problem: '强对偶说明什么？', walkthrough: ['原问题与对偶最优值相等。'], result: '最优值相等' },
    moreExamples: [{ problem: '影子价格的经济含义？', walkthrough: ['约束放宽一单位的收益。'], result: '边际收益' }],
  },
  {
    id: 'network-flow',
    title: '网络流：最大流与最小割',
    tag: '运筹学',
    level: '竞赛',
    essence: '网络流研究最大传输流量，最大流最小割定理说两者相等。',
    definition: '流满足容量限制与流量守恒；割是把源汇分开的边集。',
    whenToUse: ['运输与调度', '匹配问题', '网络设计'],
    theorems: [
      { name: '最大流最小割', statement: '最大流值等于最小割容量。',
        formula: '\\max f=\\min c(S,T)', },
      { name: '增广路定理', statement: '不存在增广路时流最大。', },
    ],
    steps: [
      { title: '建网络', body: '定节点、边与容量。', },
      { title: '找初始流', body: '零流或可行流。', },
      { title: '找增广路', body: '在残量网络中搜索。', },
      { title: '增广', body: '沿路增加流量。', },
      { title: '判最优', body: '无增广路即最大。', },
    ],
    pitfalls: ['忽略残量网络。', '容量当流量。', '忘记守恒。'],
    example: { problem: '最大流与最小割的关系？', walkthrough: ['两者相等。'], result: '值相等' },
    moreExamples: [{ problem: '增广路不存在意味着？', walkthrough: ['已是最大流。'], result: '流最大' }],
  },
  {
    id: 'population-growth',
    title: '种群增长：指数与逻辑斯蒂',
    tag: '生物数学',
    level: '进阶',
    essence: '无限制时种群指数增长，资源有限时趋于饱和。',
    definition: '指数增长方程增长率恒定；逻辑斯蒂增长含密度制约项，增长率随种群接近容量而下降。',
    whenToUse: ['拟合种群数据', '预测增长', '分析平衡点'],
    theorems: [
      { name: '指数增长', statement: '增长率为常数。',
        formula: 'N(t)=N_0e^{rt}', },
      { name: '逻辑斯蒂平衡', statement: '种群容量处增长率为零且稳定。',
        formula: 'N\\to K', },
    ],
    steps: [
      { title: '定模型', body: '是否受资源限制。', },
      { title: '写方程', body: '增长率形式。', },
      { title: '解方程', body: '分离变量或积分。', },
      { title: '找平衡点', body: '令导数为零。', },
      { title: '判稳定性', body: '看平衡点附近行为。', },
    ],
    pitfalls: ['资源有限仍用指数。', '把容量当初始值。', '忽略时滞。'],
    example: { problem: '逻辑斯蒂模型容量处增长率？', walkthrough: ['种群等于容量。', '增长为零。'], result: '0' },
    moreExamples: [{ problem: '指数增长适合短期还是长期？', walkthrough: ['短期近似。', '长期受资源限制。'], result: '短期' }],
  },
  {
    id: 'epidemic-models',
    title: '传染病模型：SIR 与基本传染数',
    tag: '生物数学',
    level: '进阶',
    essence: 'SIR 把人群分为易感、感染、康复三类，基本传染数决定是否扩散。',
    definition: 'SIR 模型用三个仓室描述传播；基本传染数是传染率乘感染期。',
    whenToUse: ['预测疫情', '评估干预', '理解群体免疫'],
    theorems: [
      { name: '传播阈值', statement: '基本传染数大于一时疫情扩散。',
        formula: 'R_0=\\frac{\\beta}{\\gamma}', },
      { name: '群体免疫阈值', statement: '免疫比例超过一减 R0 倒数可阻断。', },
    ],
    steps: [
      { title: '分仓室', body: '易感、感染、康复。', },
      { title: '写转移', body: '传染与恢复速率。', },
      { title: '算 R0', body: '传染率除以恢复率。', },
      { title: '模拟', body: '数值求解微分方程。', },
      { title: '评估干预', body: '降低 R0 的措施。', },
    ],
    pitfalls: ['把 R0 当固定值。', '忽略潜伏期需 SEIR。', '把群体免疫当绝对。'],
    example: { problem: 'R0 小于一时疫情如何发展？', walkthrough: ['每个感染者传染不足一人。', '疫情消退。'], result: '消退' },
    moreExamples: [{ problem: '疫苗如何降低 R0？', walkthrough: ['减少易感人群。'], result: '有效降低' }],
  },
  {
    id: 'enzyme-kinetics',
    title: '酶动力学：米氏方程',
    tag: '生物数学',
    level: '进阶',
    essence: '酶促反应速率随底物浓度饱和，米氏方程刻画这种关系。',
    definition: '米氏方程给出速率等于最大速率乘底物浓度除以米氏常数加底物浓度。',
    whenToUse: ['拟合酶数据', '求动力学参数', '分析抑制'],
    theorems: [
      { name: '米氏方程', statement: '速率对底物浓度双曲饱和。',
        formula: 'v=\\frac{V_{max}S}{K_m+S}', },
      { name: '双倒数线性化', statement: '倒数变换后成直线便于拟合。', },
    ],
    steps: [
      { title: '测初速率', body: '不同底物浓度下测速。', },
      { title: '拟合', body: '用米氏或双倒数。', },
      { title: '读参数', body: '最大速率与米氏常数。', },
      { title: '分析抑制', body: '竞争与非竞争改变不同参数。', },
      { title: '验证', body: '代回数据检查。', },
    ],
    pitfalls: ['用终点速率当初速率。', '忽略抑制类型差异。', '底物浓度范围不足。'],
    example: { problem: '米氏常数的含义？', walkthrough: ['速率为最大速率一半时的底物浓度。'], result: '半饱和浓度' },
    moreExamples: [{ problem: '竞争性抑制改变哪个参数？', walkthrough: ['表观米氏常数增大。', '最大速率不变。'], result: '米氏常数' }],
  },
  {
    id: 'feedback-systems',
    title: '反馈系统：用误差驱动控制',
    tag: '控制论',
    level: '进阶',
    essence: '反馈把输出与目标比较，用误差修正输入。负反馈稳定系统，正反馈放大偏差。',
    definition: '闭环系统把输出反馈到输入端与参考值比较，控制器按误差产生控制量。开环不测量输出。',
    whenToUse: ['设计控制器', '分析稳定性', '理解跟踪'],
    theorems: [
      { name: '误差定义', statement: '误差等于参考减输出。',
        formula: 'e=r-y', },
      { name: '闭环优点', statement: '负反馈降低扰动敏感度。', },
    ],
    steps: [
      { title: '画框图', body: '标出被控对象与控制器。', },
      { title: '写误差', body: '参考减测量值。', },
      { title: '设计控制律', body: '比例、积分、微分。', },
      { title: '分析闭环', body: '算传递函数或状态方程。', },
      { title: '验证稳定性', body: '看极点位置。', },
    ],
    pitfalls: ['把开环当闭环。', '正负反馈搞反。', '忽略测量噪声。'],
    example: { problem: '负反馈对扰动有什么作用？', walkthrough: ['降低敏感度。', '提高鲁棒性。'], result: '抑制扰动' },
    moreExamples: [{ problem: '比例控制能消除稳态误差吗？', walkthrough: ['一般不能。', '需积分项。'], result: '通常不能' }],
  },
  {
    id: 'state-space-model',
    title: '状态空间模型：用一阶方程组描述系统',
    tag: '控制论',
    level: '进阶',
    essence: '状态空间把高阶系统化为一阶向量方程，状态是描述系统所需的最小变量组。',
    definition: '状态方程给出状态导数与状态、输入的关系，输出方程给出输出与状态、输入的关系。',
    whenToUse: ['建模动态系统', '分析能控能观', '设计状态反馈'],
    theorems: [
      { name: '状态方程', statement: '状态导数由状态与输入决定。',
        formula: '\\dot x=Ax+Bu', },
      { name: '能控性', statement: '能控矩阵满秩则能控。', },
    ],
    steps: [
      { title: '选状态变量', body: '储能元件或高阶导数。', },
      { title: '写一阶方程', body: '消去高阶导。', },
      { title: '写输出方程', body: '输出组合。', },
      { title: '分析矩阵', body: '特征值定稳定。', },
      { title: '设计控制', body: '状态反馈配置极点。', },
    ],
    pitfalls: ['状态选多了不独立。', '忽略输出方程。', '把传递函数当状态模型。'],
    example: { problem: '二阶系统状态向量通常取几维？', walkthrough: ['两个状态变量。'], result: '二维' },
    moreExamples: [{ problem: '能控性矩阵满秩意味着？', walkthrough: ['状态可任意控制。'], result: '能控' }],
  },
  {
    id: 'lyapunov-stability',
    title: '李雅普诺夫稳定性',
    tag: '控制论',
    level: '竞赛',
    essence: '李雅普诺夫方法不求解方程就判断稳定性：找一个正定函数沿轨线递减即可。',
    definition: '若存在正定函数其沿系统轨线的时间导数负定，则平衡点渐近稳定。',
    whenToUse: ['判断非线性稳定性', '构造能量函数'],
    theorems: [
      { name: '李雅普诺夫定理', statement: '正定且导数负定则渐近稳定。',
        formula: '\\dot V<0', },
      { name: '线性化判据', statement: '平衡点处雅可比特征值实部为负则稳定。', },
    ],
    steps: [
      { title: '写系统', body: '确定平衡点。', },
      { title: '构造 V', body: '取能量型二次型。', },
      { title: '算导数', body: '沿轨线求导。', },
      { title: '判符号', body: '负定则稳定。', },
      { title: '检查全局', body: 'V 径向无界则全局。', },
    ],
    pitfalls: ['V 不径向无界仍称全局。', '导数恒零当渐近稳定。', '选错坐标原点。'],
    example: { problem: 'V 的导数负定说明什么？', walkthrough: ['渐近稳定。'], result: '渐近稳定' },
    moreExamples: [{ problem: '线性化判据失效时？', walkthrough: ['需用李雅普诺夫直接法。'], result: '用直接法' }],
  },
  {
    id: 'random-walk-brownian',
    title: '随机游走与布朗运动',
    tag: '金融数学',
    level: '竞赛',
    essence: '随机游走是离散随机运动，布朗运动是它的连续极限。金融资产价格常建模为几何布朗运动。',
    definition: '布朗运动是连续时间连续路径的随机过程，增量独立且服从正态分布，方差与时间成正比。',
    whenToUse: ['建模价格', '蒙特卡洛模拟', '推导期权定价'],
    theorems: [
      { name: '布朗运动性质', statement: '增量独立正态，方差正比时间。',
        formula: 'B_t-B_s\\sim N(0,t-s)', },
      { name: '二次变差', statement: '布朗运动的二次变差等于时间。', },
    ],
    steps: [
      { title: '离散化', body: '随机游走步长。', },
      { title: '取极限', body: '步长趋于零得布朗运动。', },
      { title: '写 SDE', body: '价格服从几何布朗运动。', },
      { title: '模拟', body: '欧拉离散或精确解。', },
      { title: '估计参数', body: '用历史数据估漂移与波动。', },
    ],
    pitfalls: ['把布朗运动当可微：路径处处不可微。', '忽略伊藤修正。', '方差与时间关系写反。'],
    example: { problem: '布朗运动的方差与时间关系？', walkthrough: ['正比于时间。'], result: '正比' },
    moreExamples: [{ problem: '布朗运动路径可微吗？', walkthrough: ['处处不可微。'], result: '不可微' }],
  },
  {
    id: 'risk-measures',
    title: '风险度量：VaR 与期望损失',
    tag: '金融数学',
    level: '进阶',
    essence: '风险度量把损失分布压缩成一个数。VaR 给分位数，期望损失给尾部平均。',
    definition: 'VaR 是给定置信水平下损失的分位数；期望损失是超过 VaR 部分的期望。后者满足次可加性。',
    whenToUse: ['度量组合风险', '监管资本', '比较策略'],
    theorems: [
      { name: 'VaR 定义', statement: '损失分布的分位数。', },
      { name: '次可加性', statement: '期望损失满足，VaR 一般不满足。', },
    ],
    steps: [
      { title: '定损失分布', body: '由模型或历史数据。', },
      { title: '算分位数', body: 'VaR。', },
      { title: '算尾部均值', body: '期望损失。', },
      { title: '检验一致性', body: '是否满足次可加。', },
      { title: '压力测试', body: '极端情形。', },
    ],
    pitfalls: ['把 VaR 当最大损失。', '忽略尾部风险。', 'VaR 不满足次可加仍当一致风险度量。'],
    example: { problem: '期望损失与 VaR 哪个更保守？', walkthrough: ['期望损失更大。', '覆盖尾部。'], result: '期望损失' },
    moreExamples: [{ problem: 'VaR 满足次可加性吗？', walkthrough: ['一般不满足。'], result: '不满足' }],
  },
  {
    id: 'interest-rate-models',
    title: '利率与折现：时间的价格',
    tag: '金融数学',
    level: '进阶',
    essence: '利率把未来现金流换算成现值。折现因子是时间的函数，利率期限结构反映市场预期。',
    definition: '连续复利下折现因子为指数衰减。零息利率给出不同期限的折现。',
    whenToUse: ['计算现值', '定价债券', '理解期限结构'],
    theorems: [
      { name: '折现因子', statement: '现值等于未来值乘折现因子。',
        formula: 'D(t)=e^{-rt}', },
      { name: '远期利率', statement: '由期限结构导出。', },
    ],
    steps: [
      { title: '定现金流', body: '列出未来时点金额。', },
      { title: '选折现曲线', body: '零息利率。', },
      { title: '逐笔折现', body: '乘折现因子。', },
      { title: '求和', body: '得现值。', },
      { title: '敏感性', body: '久期与凸性。', },
    ],
    pitfalls: ['把票面利率当折现率。', '忽略复利方式。', '混用连续与离散复利。'],
    example: { problem: '连续复利折现因子形式？', walkthrough: ['指数衰减。'], result: 'e^{-rt}' },
    moreExamples: [{ problem: '利率上升债券价格如何？', walkthrough: ['下降。'], result: '下降' }],
  },
  {
    id: 'dominant-strategy',
    title: '占优策略与可理性化',
    tag: '博弈论',
    level: '进阶',
    essence: '占优策略在对手任何选择下都最优。重复剔除劣策略可缩小可理性化集合。',
    definition: '若某策略对每个对手策略的收益都不低于其他策略，称弱占优；严格大于则严格占优。',
    whenToUse: ['分析简单博弈', '预测结果', '剔除劣策略'],
    theorems: [
      { name: '严格占优', statement: '无论对手如何都更优。', },
      { name: '重复剔除', statement: '逐步删除劣策略。', },
    ],
    steps: [
      { title: '列收益矩阵', body: '行列表头对应策略。', },
      { title: '逐列比较', body: '找每列最优。', },
      { title: '找占优', body: '全列最优即占优。', },
      { title: '剔除劣策略', body: '迭代。', },
      { title: '得均衡', body: '剩余策略组合。', },
    ],
    pitfalls: ['把纳什均衡当占优。', '忽略弱占优的平局。', '剔除顺序影响结果（弱占优时）。'],
    example: { problem: '严格占优策略一定出现在均衡中吗？', walkthrough: ['是。'], result: '一定' },
    moreExamples: [{ problem: '弱占优剔除顺序影响结果吗？', walkthrough: ['可能影响。'], result: '可能' }],
  },
  {
    id: 'mixed-strategy',
    title: '混合策略与纳什存在性',
    tag: '博弈论',
    level: '进阶',
    essence: '混合策略以概率随机选择纯策略。有限博弈在混合策略下总存在纳什均衡。',
    definition: '混合策略是纯策略上的概率分布，期望收益按概率加权。纳什均衡要求每个正概率策略都同样最优。',
    whenToUse: ['求无纯策略均衡的博弈', '验证均衡', '分析随机化'],
    theorems: [
      { name: '期望收益', statement: '按概率加权。', },
      { name: '纳什存在', statement: '有限博弈混合策略均衡存在。', },
    ],
    steps: [
      { title: '写收益矩阵', body: '确定纯策略收益。', },
      { title: '设概率', body: '为每个策略设变量。', },
      { title: '令无差异', body: '对手使各策略收益相等。', },
      { title: '解方程', body: '得混合概率。', },
      { title: '验证', body: '每个正概率策略最优。', },
    ],
    pitfalls: ['把混合策略当随机噪声。', '忽略无差异条件。', '概率不为正仍算入。'],
    example: { problem: '有限博弈一定有混合策略均衡吗？', walkthrough: ['一定有。'], result: '一定有' },
    moreExamples: [{ problem: '混合均衡中纯策略收益关系？', walkthrough: ['正概率策略收益相同。'], result: '无差异' }],
  },
  {
    id: 'cooperative-game',
    title: '合作博弈与夏普利值',
    tag: '博弈论',
    level: '竞赛',
    essence: '合作博弈研究联盟的价值分配。夏普利值按边际贡献分配，满足有效性、对称性、虚拟性与可加性。',
    definition: '特征函数给出每个联盟的价值。夏普利值是参与者对各个联盟边际贡献的加权平均。',
    whenToUse: ['分配合作收益', '评估谈判力', '公平分摊'],
    theorems: [
      { name: '夏普利公式', statement: '按加入顺序的边际贡献平均。', },
      { name: '公理刻画', statement: '四条公理唯一确定。', },
    ],
    steps: [
      { title: '写特征函数', body: '列出各联盟价值。', },
      { title: '算边际贡献', body: '对每个加入顺序。', },
      { title: '加权平均', body: '按排列数加权。', },
      { title: '验证有效性', body: '分配合计等于总价值。', },
      { title: '检查对称', body: '对称参与者分得相同。', },
    ],
    pitfalls: ['忽略联盟价值定义。', '把夏普利值当唯一公平。', '加权系数算错。'],
    example: { problem: '夏普利值满足什么？', walkthrough: ['有效性、对称性、虚拟性、可加性。'], result: '四条公理' },
    moreExamples: [{ problem: '两人对称时夏普利值如何？', walkthrough: ['平分价值。'], result: '平分' }],
  },
  {
    id: 'hyperbolic-geometry',
    title: '双曲几何：庞加莱圆盘模型',
    tag: '非欧几何',
    level: '竞赛',
    essence: '双曲几何中过直线外一点有多条平行线，三角形内角和小于 180 度。',
    definition: '双曲平面可用庞加莱圆盘表示：测地线是与边界正交的圆弧，角度与欧氏角相同。',
    whenToUse: ['理解非欧几何', '计算双曲距离', '画双曲三角形'],
    theorems: [
      { name: '内角和小于 180 度', statement: '双曲三角形内角和小于欧氏。', },
      { name: '平行线不唯一', statement: '过外点至少两条不相交直线。', },
    ],
    steps: [
      { title: '认识模型', body: '庞加莱圆盘。', },
      { title: '找测地线', body: '与边界正交的弧。', },
      { title: '算距离', body: '用双曲度量。', },
      { title: '画三角形', body: '测地线围成的区域。', },
      { title: '验证结论', body: '内角和与平行公理。', },
    ],
    pitfalls: ['把圆盘边界的欧氏距离当双曲距离。', '内角和套用 180 度。', '忘记曲面曲率为负。'],
    example: { problem: '双曲三角形的内角和？', walkthrough: ['小于 180 度。'], result: '小于 180 度' },
    moreExamples: [{ problem: '过直线外一点有几条平行线？', walkthrough: ['至少两条。'], result: '至少两条' }],
  },
  {
    id: 'spherical-geometry',
    title: '球面几何：大圆与球面三角',
    tag: '非欧几何',
    level: '进阶',
    essence: '球面几何研究球面上的大圆与距离，任意两条大圆都相交，三角形内角和大于 180 度。',
    definition: '球面上的测地线是大圆。球面距离是中心角乘半径，球面三角形由三段大圆弧围成。',
    whenToUse: ['航行与定位', '理解正曲率', '球面三角计算'],
    theorems: [
      { name: '内角和大于 180 度', statement: '球面三角形内角和大于欧氏。', },
      { name: '大圆必相交', statement: '任意两条大圆交于两点。', },
    ],
    steps: [
      { title: '选球面', body: '定半径。', },
      { title: '找大圆', body: '过球心的平面与球面交线。', },
      { title: '算距离', body: '中心角乘半径。', },
      { title: '画三角形', body: '三段大圆弧。', },
      { title: '验证', body: '内角和与面积关系。', },
    ],
    pitfalls: ['把纬线当测地线：只有赤道是大圆。', '距离用弦长。', '内角和套 180 度。'],
    example: { problem: '球面三角形的内角和？', walkthrough: ['大于 180 度。'], result: '大于 180 度' },
    moreExamples: [{ problem: '球面上两点最短路径？', walkthrough: ['大圆劣弧。'], result: '大圆劣弧' }],
  },
  {
    id: 'geometry-axioms',
    title: '几何公理与模型',
    tag: '非欧几何',
    level: '进阶',
    essence: '欧氏几何五条公设中平行公设可替换，不同替换得到不同几何，各自有模型保证相容。',
    definition: '公理系统需相容与独立。非欧几何的相容性通过模型（球面、圆盘）相对欧氏几何证明。',
    whenToUse: ['理解公理化', '比较几何体系', '判定相容性'],
    theorems: [
      { name: '平行公设独立性', statement: '平行公设不能由其他公设推出。', },
      { name: '模型法', statement: '找到模型即证明相对相容。', },
    ],
    steps: [
      { title: '列公理', body: '欧氏五公设。', },
      { title: '替换平行公设', body: '双曲或椭圆版本。', },
      { title: '构造模型', body: '圆盘或球面。', },
      { title: '验证公理', body: '模型满足新公理。', },
      { title: '得相对相容', body: '相对欧氏几何。', },
    ],
    pitfalls: ['把模型当证明绝对相容。', '忽略公理独立性。', '混淆椭圆与双曲。'],
    example: { problem: '如何证明非欧几何相对相容？', walkthrough: ['构造模型。'], result: '构造欧氏模型' },
    moreExamples: [{ problem: '平行公设能由其他公设推出吗？', walkthrough: ['不能，独立。'], result: '不能' }],
  },
  {
    id: 'cross-ratio',
    title: '交比：射影不变量',
    tag: '射影几何',
    level: '竞赛',
    essence: '交比是射影变换下唯一保持的基本不变量，四点共线的交比在变换后不变。',
    definition: '四点 A、B、C、D 的交比是两组有向比之比。它在射影变换下不变，可用来判定射影等价。',
    whenToUse: ['计算射影不变量', '判定等价', '构造射影坐标'],
    theorems: [
      { name: '交比定义', statement: '两组比的商。',
        formula: '(A,B;C,D)=\\frac{AC\\cdot BD}{AD\\cdot BC}', },
      { name: '不变量', statement: '射影变换保持交比。', },
    ],
    steps: [
      { title: '取四点', body: '共线四点。', },
      { title: '算有向比', body: '按定义。', },
      { title: '求交比', body: '相除。', },
      { title: '做变换', body: '任意射影变换。', },
      { title: '验证不变', body: '交比相同。', },
    ],
    pitfalls: ['有向距离符号忽略。', '四点顺序变化值改变。', '把交比当欧氏比。'],
    example: { problem: '交比在什么变换下不变？', walkthrough: ['射影变换。'], result: '射影变换' },
    moreExamples: [{ problem: '交换两点交比如何变？', walkthrough: ['取倒数或相关变换。'], result: '按置换改变' }],
  },
  {
    id: 'projective-transformations',
    title: '射影变换：保持直线的映射',
    tag: '射影几何',
    level: '竞赛',
    essence: '射影变换是射影空间到自身的可逆线性映射（在齐次坐标下为可逆矩阵），把直线映成直线并保持交比。',
    definition: '射影变换由可逆矩阵在齐次坐标上作用定义，矩阵相差非零常数给出同一变换。',
    whenToUse: ['化简图形', '证明射影等价', '构造标准形'],
    theorems: [
      { name: '矩阵表示', statement: '齐次坐标下线性作用。', },
      { name: '保持交比', statement: '射影变换四不变量之一。', },
    ],
    steps: [
      { title: '写齐次坐标', body: '点用向量表示。', },
      { title: '选矩阵', body: '可逆即可。', },
      { title: '作用', body: '矩阵乘向量。', },
      { title: '归一化', body: '去掉整体缩放。', },
      { title: '检查直线', body: '像仍是直线。', },
    ],
    pitfalls: ['把仿射变换当全部射影变换。', '矩阵奇异仍当变换。', '忽略整体缩放等价。'],
    example: { problem: '射影变换把直线映成什么？', walkthrough: ['直线。'], result: '直线' },
    moreExamples: [{ problem: '射影变换由什么决定？', walkthrough: ['可逆矩阵（差常数）。'], result: '可逆矩阵' }],
  },
  {
    id: 'projective-conics',
    title: '射影圆锥曲线',
    tag: '射影几何',
    level: '竞赛',
    essence: '射影平面上圆锥曲线统一定义为二次齐次方程的零点集，椭圆、抛物线、双曲线在射影意义下等价。',
    definition: '二次齐次方程定义射影圆锥曲线，非退化情形都射影等价，差别只在无穷远线与曲线的位置关系。',
    whenToUse: ['统一处理圆锥曲线', '判断退化', '用贝祖计数'],
    theorems: [
      { name: '二次齐次方程', statement: '非退化即非奇异。', },
      { name: '射影等价', statement: '非退化圆锥都等价。', },
    ],
    steps: [
      { title: '写方程', body: '二次齐次。', },
      { title: '判非退化', body: '矩阵行列式非零。', },
      { title: '分类', body: '按与无穷远线关系。', },
      { title: '变换标准形', body: '射影化简。', },
      { title: '读几何', body: '椭圆抛双曲。', },
    ],
    pitfalls: ['仿射分类当射影分类。', '退化曲线当非退化。', '忽略无穷远线。'],
    example: { problem: '椭圆与抛物线射影等价吗？', walkthrough: ['非退化时等价。'], result: '等价' },
    moreExamples: [{ problem: '退化圆锥曲线由什么刻画？', walkthrough: ['二次型奇异。'], result: '矩阵奇异' }],
  },
  {
    id: 'connectedness',
    title: '连通性与连通分支',
    tag: '拓扑',
    level: '进阶',
    essence: '拓扑空间不能分成两个不交非空开集之并时称连通。连通分支是极大的连通子集。',
    definition: '连通性由开集分离定义；道路连通要求任意两点有连续道路相连，后者强于前者。',
    whenToUse: ['判断连通', '分解空间', '区分连通与道路连通'],
    theorems: [
      { name: '连通定义', statement: '不能开集分离。', },
      { name: '道路连通更强', statement: '道路连通推出连通。', },
    ],
    steps: [
      { title: '找分离', body: '能否写成两个不交开集。', },
      { title: '或找道路', body: '任意两点连路。', },
      { title: '区分层次', body: '道路连通更强。', },
      { title: '取分支', body: '极大连通子集。', },
      { title: '验证', body: '分支互不相交。', },
    ],
    pitfalls: ['把连通当道路连通。', '忽略拓扑选择。', '分支当开集：不一定开。'],
    example: { problem: '道路连通是否一定连通？', walkthrough: ['是。'], result: '是' },
    moreExamples: [{ problem: '连通是否一定道路连通？', walkthrough: ['不一定。'], result: '不一定' }],
  },
  {
    id: 'quotient-topology',
    title: '商拓扑：粘合空间',
    tag: '拓扑',
    level: '进阶',
    essence: '商拓扑把等价类看成点，使商映射连续且开集最细。它用于构造圆、环面与射影空间。',
    definition: '商拓扑是使商映射连续的最细拓扑：商集子集开当且仅当其原像开。',
    whenToUse: ['构造新空间', '粘合边', '理解商空间'],
    theorems: [
      { name: '商映射连续', statement: '按定义自动连续。', },
      { name: '万有性质', statement: '从商空间出发的连续映射对应常值映射。', },
    ],
    steps: [
      { title: '定等价关系', body: '哪些点粘合。', },
      { title: '取商集', body: '等价类。', },
      { title: '装商拓扑', body: '原像开即开。', },
      { title: '验证连续性', body: '商映射连续。', },
      { title: '识别空间', body: '同胚于已知空间。', },
    ],
    pitfalls: ['把商拓扑当子空间拓扑。', '忽略饱和集。', '粘合后仍当原空间。'],
    example: { problem: '正方形粘合对边得到什么？', walkthrough: ['环面或克莱因瓶（取决于方向）。'], result: '环面' },
    moreExamples: [{ problem: '商映射何时连续？', walkthrough: ['按商拓扑定义必连续。'], result: '恒连续' }],
  },
  {
    id: 'covering-spaces',
    title: '覆叠空间：局部同胚',
    tag: '代数拓扑',
    level: '竞赛',
    essence: '覆叠空间局部同胚于底空间，且每点原像离散。它把基本群与空间结构联系起来。',
    definition: '覆叠映射是连续满射且局部同胚，纤维离散。万有覆叠的单连通性使它成为基本群的模型。',
    whenToUse: ['计算基本群', '研究提升', '分类覆叠'],
    theorems: [
      { name: '提升性质', statement: '道路与同伦可提升。', },
      { name: '万有覆叠', statement: '单连通覆叠。', },
    ],
    steps: [
      { title: '找覆叠', body: '如直线到圆。', },
      { title: '验局部同胚', body: '每个小邻域同胚。', },
      { title: '看纤维', body: '离散。', },
      { title: '用提升', body: '道路提升。', },
      { title: '关联基本群', body: '覆叠变换群。', },
    ],
    pitfalls: ['把覆叠当同胚。', '纤维要求连续。', '忽略局部条件。'],
    example: { problem: '直线到圆的映射是覆叠吗？', walkthrough: ['是，万有覆叠。'], result: '是' },
    moreExamples: [{ problem: '万有覆叠的基本群？', walkthrough: ['平凡。'], result: '平凡' }],
  },
  {
    id: 'cw-complex',
    title: 'CW 复形：拼装空间',
    tag: '代数拓扑',
    level: '进阶',
    essence: 'CW 复形通过逐维粘接细胞构造空间，便于计算同调与基本群。',
    definition: 'CW 复形由胞腔经粘合映射逐维添加：零维是点，n 维胞腔的边界粘到 n 减一维骨架上。',
    whenToUse: ['构造空间', '计算不变量', '做组合拓扑'],
    theorems: [
      { name: '胞腔分解', statement: '按维数分层。', },
      { name: '欧拉示性数', statement: '交替求和。',
        formula: '\\chi=\\sum(-1)^{n}c_n', },
    ],
    steps: [
      { title: '列零维点', body: '顶点。', },
      { title: '粘一维边', body: '按端点。', },
      { title: '粘二维面', body: '按边界。', },
      { title: '算示性数', body: '交替求和。', },
      { title: '算不变量', body: '同调或基本群。', },
    ],
    pitfalls: ['粘合映射不写清。', '示性数符号错。', '把 CW 当单纯复形。'],
    example: { problem: 'CW 复形的欧拉示性数如何算？', walkthrough: ['各维胞腔数交替求和。'], result: '交替求和' },
    moreExamples: [{ problem: '圆的最小 CW 结构？', walkthrough: ['一个点加一条边。'], result: '一点一边' }],
  },
  {
    id: 'homology-intro',
    title: '同调群：数洞的代数方法',
    tag: '代数拓扑',
    level: '竞赛',
    essence: '同调群把空间中的「洞」代数化：零维数连通分支，一维数环，二维数空腔。',
    definition: '链群、边界算子与闭链模边界给出同调群。边界算子平方为零是同调代数的基础。',
    whenToUse: ['计算同调', '区分空间', '理解不变量'],
    theorems: [
      { name: '边界平方为零', statement: '链复形的核心性质。',
        formula: '\\partial^{2}=0', },
      { name: '欧拉示性数', statement: '同调群秩的交替和。', },
    ],
    steps: [
      { title: '搭链群', body: '按维数取自由群。', },
      { title: '定边界', body: '胞腔边界。', },
      { title: '算闭链', body: '边界为零。', },
      { title: '模边界', body: '取商。', },
      { title: '读几何', body: '洞的个数。', },
    ],
    pitfalls: ['把同调当同伦：同调更弱。', '边界方向搞反。', '忽略系数域。'],
    example: { problem: '零维同调群的秩等于什么？', walkthrough: ['连通分支数。'], result: '连通分支数' },
    moreExamples: [{ problem: '边界算子满足什么？', walkthrough: ['平方为零。'], result: '平方为零' }],
  },
  {
    id: 'subgroups-cosets',
    title: '子群与陪集：拉格朗日定理',
    tag: '群论',
    level: '进阶',
    essence: '子群的陪集把群分成等大的块，块数是子群的指数，阶整除群阶。',
    definition: '子群是群中对运算封闭且含单位元与逆的子集。左陪集是子群左乘一个元素得到的集合。',
    whenToUse: ['计算子群', '用拉格朗日定理', '求指数'],
    theorems: [
      { name: '拉格朗日定理', statement: '子群阶整除群阶。',
        formula: '|H|\\mid|G|', },
      { name: '指数', statement: '陪集个数等于阶之比。',
        formula: '[G:H]=|G|/|H|', },
    ],
    steps: [
      { title: '验证子群', body: '封闭、单位、逆。', },
      { title: '取陪集', body: '左乘群元素。', },
      { title: '看划分', body: '陪集互不相交。', },
      { title: '算指数', body: '阶之比。', },
      { title: '用整除', body: '筛可能阶。', },
    ],
    pitfalls: ['只验封闭不验逆。', '把陪集当子群。', '非有限群直接套除法。'],
    example: { problem: '模六加法群中子群的阶可能值？', walkthrough: ['只可能是 1、2、3、6。'], result: '1、2、3、6' },
    moreExamples: [{ problem: '指数为二的子群有什么性质？', walkthrough: ['必是正规子群。'], result: '正规' }],
  },
  {
    id: 'group-actions',
    title: '群作用与轨道',
    tag: '群论',
    level: '进阶',
    essence: '群作用把抽象群变成集合上的变换。轨道-稳定子定理把轨道大小与稳定子阶联系起来。',
    definition: '群作用是从群到集合对称群的同态。轨道是同一元素能被作用到的点集，稳定子是固定某点的子群。',
    whenToUse: ['分析对称性', '数轨道', '用伯恩赛德引理'],
    theorems: [
      { name: '轨道-稳定子', statement: '轨道大小等于群阶除稳定子阶。',
        formula: '|Gx|=|G|/|G_x|', },
      { name: '伯恩赛德引理', statement: '轨道数等于不动点平均。', },
    ],
    steps: [
      { title: '定义作用', body: '群元素如何变换点。', },
      { title: '求轨道', body: '作用能到达的点。', },
      { title: '求稳定子', body: '固定该点的元素。', },
      { title: '用定理', body: '验证轨道大小。', },
      { title: '数轨道', body: '用平均或枚举。', },
    ],
    pitfalls: ['轨道与稳定子混淆。', '作用不满足同态。', '忽略作用不忠实。'],
    example: { problem: '轨道大小与稳定子关系？', walkthrough: ['轨道等于群阶除稳定子阶。'], result: '商关系' },
    moreExamples: [{ problem: '伯恩赛德引理用于？', walkthrough: ['数轨道个数。'], result: '数轨道' }],
  },
  {
    id: 'sylow-theorems',
    title: '西罗定理：子群的存在与计数',
    tag: '群论',
    level: '竞赛',
    essence: '西罗定理保证最大素数幂阶子群存在，并给出其个数约束，是有限群结构分析的核心工具。',
    definition: '西罗 p 子群是阶为 p 的最高幂且整除群阶的子群。三条定理分别给出存在、共轭与计数同余。',
    whenToUse: ['判断子群存在', '数共轭类', '证非单群'],
    theorems: [
      { name: '存在性', statement: '至少存在一个西罗 p 子群。', },
      { name: '计数同余', statement: '个数模 p 余一且整除指数。', },
    ],
    steps: [
      { title: '分解群阶', body: '写成素数幂乘积。', },
      { title: '取最高幂', body: '定西罗子群阶。', },
      { title: '数个数', body: '满足同余与整除。', },
      { title: '看共轭', body: '所有西罗子群共轭。', },
      { title: '判正规', body: '个数为一则正规。', },
    ],
    pitfalls: ['把西罗子群当唯一。', '忽略同余条件。', '混淆 p 子群与西罗子群。'],
    example: { problem: '西罗 p 子群个数模 p 余几？', walkthrough: ['余一。'], result: '1' },
    moreExamples: [{ problem: '个数为一时说明什么？', walkthrough: ['该子群正规。'], result: '正规' }],
  },
  {
    id: 'domains-ufd',
    title: '整环与唯一分解',
    tag: '环论',
    level: '进阶',
    essence: '整环是无零因子的交换环。唯一分解整环中每个非零非单位元素可唯一分解为不可约元之积。',
    definition: '整环要求交换、含一、无零因子。唯一分解整环（UFD）要求分解存在且在不计顺序与单位意义下唯一。',
    whenToUse: ['判断整环', '做因子分解', '比较环的性质'],
    theorems: [
      { name: '欧几里得整环是 UFD', statement: '有除法算法的整环唯一分解。',
        formula: 'ED\\Rightarrow UFD', },
      { name: '主理想整环是 UFD', statement: 'PID 也唯一分解。',
        formula: 'PID\\Rightarrow UFD', },
    ],
    steps: [
      { title: '验无零因子', body: 'ab=0 推出 a=0 或 b=0。', },
      { title: '找不可约元', body: '不能分解的元素。', },
      { title: '做分解', body: '写成不可约之积。', },
      { title: '验唯一性', body: '不计顺序与单位。', },
      { title: '比较层级', body: 'ED 推出 PID 推出 UFD。', },
    ],
    pitfalls: ['把整环当域。', '混淆不可约与素元。', '忽略单位。'],
    example: { problem: '整数环是唯一分解整环吗？', walkthrough: ['是。'], result: '是' },
    moreExamples: [{ problem: '欧几里得整环与 UFD 关系？', walkthrough: ['欧几里得整环必是 UFD。'], result: '推出关系' }],
  },
  {
    id: 'polynomial-rings',
    title: '多项式环',
    tag: '环论',
    level: '进阶',
    essence: '多项式环把系数环扩展为多项式全体。域上多项式环是欧几里得整环，可做带余除法。',
    definition: '多项式环由系数环与未定元生成。域上一元多项式环是欧几里得整环，其不可约多项式对应扩域。',
    whenToUse: ['构造扩域', '判不可约', '做多项式运算'],
    theorems: [
      { name: '带余除法', statement: '域上可除得余式次数更低。', },
      { name: '不可约对应扩域', statement: '不可约多项式生成域扩张。', },
    ],
    steps: [
      { title: '写多项式', body: '系数与未定元。', },
      { title: '验系数环', body: '是否域。', },
      { title: '做除法', body: '带余除。', },
      { title: '判不可约', body: '试根或 Eisenstein。', },
      { title: '构造扩域', body: '商去不可约多项式。', },
    ],
    pitfalls: ['系数环不是域仍套除法。', '把可约当不可约。', '忽略重根与可分性。'],
    example: { problem: '域上一元多项式环是哪类整环？', walkthrough: ['欧几里得整环。'], result: '欧几里得整环' },
    moreExamples: [{ problem: '不可约多项式生成什么？', walkthrough: ['域扩张。'], result: '扩域' }],
  },
  {
    id: 'modules',
    title: '模与自由模',
    tag: '环论',
    level: '竞赛',
    essence: '模是环上的「向量空间」，标量来自环而非域。自由模有基，但一般模可能没有基。',
    definition: '左模是阿贝尔群配环作用，满足分配与结合。自由模同构于环的直和，有基。',
    whenToUse: ['推广向量空间', '研究环上结构', '同调代数基础'],
    theorems: [
      { name: '自由模有基', statement: '同构于环的直和。',
        formula: 'M\\cong R^{n}', },
      { name: '主理想整环上有限生成模可分解。', statement: 'None', },
    ],
    steps: [
      { title: '定环与群', body: '标量环与加法群。', },
      { title: '验作用', body: '分配与结合。', },
      { title: '找基', body: '线性无关且生成。', },
      { title: '判自由', body: '有基即自由。', },
      { title: '用结构定理', body: 'PID 上分类。', },
    ],
    pitfalls: ['把模当向量空间：可能无基。', '左右模混淆。', '忽略挠元。'],
    example: { problem: '自由模的特征？', walkthrough: ['有基。'], result: '有基' },
    moreExamples: [{ problem: '整数环上的有限生成模结构？', walkthrough: ['自由部分加挠部分。'], result: '自由加挠' }],
  },
  {
    id: 'schur-lemma',
    title: '舒尔引理：不可约表示的刚性',
    tag: '表示论',
    level: '竞赛',
    essence: '舒尔引理说不可约表示之间的 intertwiner 要么零要么同构，自同态是数乘。这给出正交关系的基础。',
    definition: '若两个不可约表示间的线性映射与群作用交换，则它为零或同构；自同态必为标量乘恒等。',
    whenToUse: ['判断不可约', '证明正交关系', '构造同构'],
    theorems: [
      { name: '舒尔引理', statement: '交换映射零或同构。', },
      { name: '自同态是标量', statement: '不可约时 End 是一维。', },
    ],
    steps: [
      { title: '验交换性', body: '映射与群作用交换。', },
      { title: '看核', body: '核是子表示。', },
      { title: '用不可约', body: '核要么零要么全。', },
      { title: '得结论', body: '零或同构。', },
      { title: '自同态情形', body: '取特征值得标量。', },
    ],
    pitfalls: ['忽略不可约前提。', '把标量当矩阵。', '基域非代数闭时结论变弱。'],
    example: { problem: '不可约表示的自同态是什么？', walkthrough: ['标量乘恒等。'], result: '标量' },
    moreExamples: [{ problem: '舒尔引理要求什么前提？', walkthrough: ['表示不可约。'], result: '不可约' }],
  },
  {
    id: 'characters',
    title: '特征标与正交关系',
    tag: '表示论',
    level: '竞赛',
    essence: '特征标是表示的迹函数。不可约特征标满足正交关系，使表示分解可计算。',
    definition: '特征标是群元素映到其表示矩阵的迹。不可约特征标两两正交，构成类函数空间的正交基。',
    whenToUse: ['分解表示', '判断同构', '计算重数'],
    theorems: [
      { name: '第一正交关系', statement: '不可约特征标内积为一。', },
      { name: '重数公式', statement: '重数等于内积。', },
    ],
    steps: [
      { title: '算迹', body: '每个群元素取迹。', },
      { title: '求内积', body: '按共轭类加权平均。', },
      { title: '得重数', body: '与不可约特征标内积。', },
      { title: '验正交', body: '不同特征标内积为零。', },
      { title: '分解', body: '写成不可约之和。', },
    ],
    pitfalls: ['把特征标当表示。', '内积忘记除以群阶。', '混淆实复特征标。'],
    example: { problem: '不可约特征标的内积为？', walkthrough: ['一。'], result: '1' },
    moreExamples: [{ problem: '重数如何求？', walkthrough: ['与不可约特征标作内积。'], result: '内积' }],
  },
  {
    id: 'irreducibility',
    title: '不可约表示与完全可约性',
    tag: '表示论',
    level: '进阶',
    essence: '表示不可约指没有非平凡不变子空间。有限群在特征零域上的表示完全可约。',
    definition: '不可约表示是单模。马施克定理保证有限群在特征不整除群阶的域上完全可约。',
    whenToUse: ['判断不可约', '分解表示', '用马施克定理'],
    theorems: [
      { name: '马施克定理', statement: '有限群特征零表示完全可约。', },
      { name: '不可约判据', statement: '无不变子空间。', },
    ],
    steps: [
      { title: '找不变子空间', body: '是否存在真子空间被保持。', },
      { title: '若无非平凡则不可约。', body: 'None', },
      { title: '否则分解', body: '取补空间。', },
      { title: '用马施克', body: '确保补空间存在。', },
      { title: '重复', body: '得不可约分解。', },
    ],
    pitfalls: ['正特征且整除群阶仍用马施克。', '把不可约当一维。', '忽略基域。'],
    example: { problem: '有限群在复数域上的表示如何？', walkthrough: ['完全可约。'], result: '完全可约' },
    moreExamples: [{ problem: '马施克定理的条件？', walkthrough: ['特征不整除群阶。'], result: '特征条件' }],
  },
  {
    id: 'normal-separable',
    title: '正规与可分扩张',
    tag: '伽罗瓦',
    level: '竞赛',
    essence: '正规保证不可约多项式要么全分裂要么无根，可分保证没有重根。两者合起来才有伽罗瓦对应。',
    definition: '扩张正规指基域上每个不可约多项式若有根在扩域则完全分裂。可分指极小多项式无重根。',
    whenToUse: ['判断伽罗瓦扩张', '检查可分性'],
    theorems: [
      { name: '正规判据', statement: '是某多项式分裂域。', },
      { name: '可分判据', statement: '特征零时自动可分。', },
    ],
    steps: [
      { title: '验正规', body: '不可约多项式是否全分裂。', },
      { title: '验可分', body: '极小多项式是否有重根。', },
      { title: '两者都满足', body: '伽罗瓦扩张。', },
      { title: '否则补正规闭包。', body: 'None', },
      { title: '或分离不可分部分。', body: 'None', },
    ],
    pitfalls: ['把任意扩张当伽罗瓦。', '特征零特征 p 混用。', '忽略重根。'],
    example: { problem: '特征零的有限扩张一定可分吗？', walkthrough: ['一定。'], result: '可分' },
    moreExamples: [{ problem: '正规扩张等价于？', walkthrough: ['某多项式的分裂域。'], result: '分裂域' }],
  },
  {
    id: 'solvable-groups',
    title: '可解群与根式可解',
    tag: '伽罗瓦',
    level: '竞赛',
    essence: '可解群是能通过交换群逐步扩张得到的群。方程根式可解当且仅当伽罗瓦群可解。',
    definition: '群可解指存在正规列使每个商群交换。对称群在五次及以上不可解。',
    whenToUse: ['判断方程可解性', '分析群结构'],
    theorems: [
      { name: '可解定义', statement: '存在交换商群的正规列。', },
      { name: '五次以上不可解', statement: '对称群不可解。', },
    ],
    steps: [
      { title: '写正规列', body: '子群链。', },
      { title: '算商群', body: '是否交换。', },
      { title: '全交换则群可解。', body: 'None', },
      { title: '联系伽罗瓦', body: '群可解等价根式可解。', },
      { title: '判方程', body: '群不可解则无根式解。', },
    ],
    pitfalls: ['把交换群当唯一可解。', '忽略正规性。', '混淆可解与幂零。'],
    example: { problem: '一般五次方程的伽罗瓦群？', walkthrough: ['对称群，不可解。'], result: '不可解' },
    moreExamples: [{ problem: '交换群可解吗？', walkthrough: ['可解（一步）。'], result: '可解' }],
  },
  {
    id: 'zeta-function',
    title: '黎曼 ζ 函数与欧拉乘积',
    tag: '解析数论',
    level: '竞赛',
    essence: 'ζ 函数是整数幂倒数和，欧拉乘积把它与素数联系起来，是素数分布研究的核心。',
    definition: 'ζ(s) 在半平面收敛，欧拉乘积等于素数因子的无穷乘积，解析延拓到全平面（除 s=1 极点）。',
    whenToUse: ['研究素数分布', '理解 L 函数'],
    theorems: [
      { name: '欧拉乘积', statement: '级数等于素数乘积。',
        formula: '\\zeta(s)=\\prod_p(1-p^{-s})^{-1}', },
      { name: '解析延拓', statement: '除一外全纯。', },
    ],
    steps: [
      { title: '写级数', body: '实部大于一时收敛。', },
      { title: '转乘积', body: '按唯一分解。', },
      { title: '延拓', body: '用函数方程。', },
      { title: '看零点', body: '非平凡零点在临界线。', },
      { title: '用于素数定理', body: '与 π(x) 联系。', },
    ],
    pitfalls: ['把延拓当原始级数收敛。', '混淆平凡与非平凡零点。', '忘记极点。'],
    example: { problem: 'ζ 函数的欧拉乘积联系什么？', walkthrough: ['素数。'], result: '素数' },
    moreExamples: [{ problem: 'ζ 在 s=1 处有什么？', walkthrough: ['简单极点。'], result: '极点' }],
  },
  {
    id: 'dirichlet-series',
    title: '狄利克雷级数与 L 函数',
    tag: '解析数论',
    level: '竞赛',
    essence: '狄利克雷级数由系数与 n 的负 s 次方构成。L 函数是带特征的级数，用于等差数列中的素数分布。',
    definition: '狄利克雷级数在收敛半平面解析。狄利克雷 L 函数对应模 q 的特征，欧拉乘积只在特征素数处出现。',
    whenToUse: ['研究等差数列素数', '构造 L 函数'],
    theorems: [
      { name: '收敛半平面', statement: '实部足够大收敛。', },
      { name: '欧拉乘积', statement: '按素数分解。', },
    ],
    steps: [
      { title: '定系数', body: '给定 a_n。', },
      { title: '写级数', body: '按定义。', },
      { title: '验收敛', body: '看增长。', },
      { title: '转乘积', body: '若有乘性。', },
      { title: '用 L 函数', body: '特征情形。', },
    ],
    pitfalls: ['忽略收敛条件。', '把特征当任意函数。', '忘记主特征的特殊性。'],
    example: { problem: '狄利克雷 L 函数用于什么？', walkthrough: ['等差数列中的素数。'], result: '等差数列素数' },
    moreExamples: [{ problem: '欧拉乘积需要系数满足？', walkthrough: ['乘性。'], result: '乘性' }],
  },
  {
    id: 'arithmetic-functions',
    title: '算术函数与狄利克雷卷积',
    tag: '解析数论',
    level: '进阶',
    essence: '算术函数定义在正整数上。狄利克雷卷积把乘性函数联系起来，莫比乌斯反演是其核心应用。',
    definition: '两个算术函数的狄利克雷卷积是对所有因子对求和。莫比乌斯函数是常数函数一的卷积逆。',
    whenToUse: ['计算数论函数', '做反演'],
    theorems: [
      { name: '卷积定义', statement: '按因子对求和。',
        formula: '(f*g)(n)=\\sum_{d|n}f(d)g(n/d)', },
      { name: '莫比乌斯反演', statement: '卷积可逆。', },
    ],
    steps: [
      { title: '写函数', body: '定义在正整数。', },
      { title: '判乘性', body: '互素时可分。', },
      { title: '做卷积', body: '按因子。', },
      { title: '用 Möbius 反演', body: '还原。', },
      { title: '求和估计', body: '用平均阶。', },
    ],
    pitfalls: ['把普通乘积当卷积。', '忽略乘性前提。', '忘记单位函数。'],
    example: { problem: '莫比乌斯反演的卷积形式？', walkthrough: ['f = g * μ 之类逆关系。'], result: '卷积逆' },
    moreExamples: [{ problem: '欧拉 φ 函数是乘性函数吗？', walkthrough: ['是。'], result: '是' }],
  },
  {
    id: 'trees-connectivity',
    title: '树与连通性',
    tag: '图论',
    level: '进阶',
    essence: '树是连通无圈的图。n 个顶点的树恰有 n-1 条边，任意两点唯一路径。',
    definition: '树是连通且无环的图。森林是无环图。最小生成树是连通加权图中总权最小的生成树。',
    whenToUse: ['判断树', '求生成树', '分析网络'],
    theorems: [
      { name: '树边数', statement: 'n 个顶点恰 n-1 条边。',
        formula: '|E|=|V|-1', },
      { name: '唯一路径', statement: '树中任意两点路径唯一。', },
    ],
    steps: [
      { title: '验连通', body: '能否走到所有点。', },
      { title: '验无环', body: '删边不分裂。', },
      { title: '数边', body: 'n-1。', },
      { title: '找生成树', body: '用 Kruskal 或 DFS。', },
      { title: '验最小', body: '贪心选最小边。', },
    ],
    pitfalls: ['把连通图当树。', '边数条件当充分：不连通也可能 n-1 边。', '忽略环。'],
    example: { problem: '五顶点的树有几条边？', walkthrough: ['四条。'], result: '4' },
    moreExamples: [{ problem: '树中两点路径唯一吗？', walkthrough: ['唯一。'], result: '唯一' }],
  },
  {
    id: 'planar-graphs',
    title: '平面图与欧拉公式',
    tag: '图论',
    level: '竞赛',
    essence: '平面图可画在平面上使边不交叉。连通平面图满足欧拉公式，由此推出边数上界与五色定理。',
    definition: '平面图是能嵌入平面的图。欧拉公式关联顶点、边与面数，面数按连通分量计算。',
    whenToUse: ['判断平面性', '用欧拉公式估边数'],
    theorems: [
      { name: '欧拉公式', statement: '连通平面图 V-E+F=2。',
        formula: 'V-E+F=2', },
      { name: '边数上界', statement: '简单平面图 E 不超过 3V-6。',
        formula: 'E\\le 3V-6', },
    ],
    steps: [
      { title: '画嵌入', body: '尽量不交叉。', },
      { title: '数面', body: '连通分量与外部面。', },
      { title: '用公式', body: '检验。', },
      { title: '查上界', body: '边太多则不平面。', },
      { title: '用库拉托夫斯基', body: '判非平面。', },
    ],
    pitfalls: ['面数忘记外部面。', '把非连通图直接套公式。', '多重边当简单图。'],
    example: { problem: '立方体图满足欧拉公式吗？', walkthrough: ['8-12+6=2。'], result: '满足' },
    moreExamples: [{ problem: '简单平面图边数上界？', walkthrough: ['3V-6。'], result: '3V-6' }],
  },
  {
    id: 'graph-coloring',
    title: '图着色与四色定理',
    tag: '图论',
    level: '进阶',
    essence: '图着色给顶点分配颜色使相邻顶点不同。四色定理说平面图只需四色。',
    definition: '色数是使相邻顶点颜色不同的最少颜色数。平面图色数不超过四，二部图色数为二。',
    whenToUse: ['分析着色', '判断二部'],
    theorems: [
      { name: '四色定理', statement: '平面图四色足够。', },
      { name: '二部图判据', statement: '色数为二等价于无奇环。', },
    ],
    steps: [
      { title: '找最大团', body: '下界。', },
      { title: '贪心着色', body: '上界。', },
      { title: '判二部', body: '是否无奇环。', },
      { title: '用平面性', body: '四色。', },
      { title: '优化', body: '尝试减色。', },
    ],
    pitfalls: ['把色数当团数。', '忽略平面性。', '贪心结果当最优。'],
    example: { problem: '平面图最多需要几种颜色？', walkthrough: ['四种。'], result: '4' },
    moreExamples: [{ problem: '二部图的色数？', walkthrough: ['二。'], result: '2' }],
  },
  {
    id: 'markov-chains',
    title: '马尔可夫链：只看当前状态',
    tag: '随机过程',
    level: '进阶',
    essence: '马尔可夫链的下一步只依赖当前状态。转移矩阵与平稳分布刻画长期行为。',
    definition: '离散时间马尔可夫链由状态空间与转移概率组成，满足马尔可夫性。平稳分布满足乘以转移矩阵不变。',
    whenToUse: ['建模状态转移', '求长期分布', '分析吸收态'],
    theorems: [
      { name: '马尔可夫性', statement: '未来只依赖现在。',
        formula: 'P(X_{n+1}|X_n)=P(X_{n+1}|X_n,\\dots)', },
      { name: '平稳分布', statement: '不变分布。',
        formula: '\\pi P=\\pi', },
    ],
    steps: [
      { title: '写状态', body: '列出可能状态。', },
      { title: '写转移', body: '一步概率。', },
      { title: '算多步', body: '矩阵幂。', },
      { title: '求平稳', body: '解 πP=π。', },
      { title: '看收敛', body: '是否遍历。', },
    ],
    pitfalls: ['把马尔可夫性当独立。', '忽略周期性与不可约性。', '平稳分布当初始分布。'],
    example: { problem: '马尔可夫链的下一步依赖什么？', walkthrough: ['只依赖当前状态。'], result: '当前状态' },
    moreExamples: [{ problem: '平稳分布满足什么方程？', walkthrough: ['πP=π。'], result: '不动方程' }],
  },
  {
    id: 'poisson-process',
    title: '泊松过程：随机到达',
    tag: '随机过程',
    level: '进阶',
    essence: '泊松过程计数事件到达，增量独立平稳，到达间隔服从指数分布。',
    definition: '强度为 λ 的泊松过程满足增量独立、平稳且时间 t 内事件数服从参数 λt 的泊松分布。',
    whenToUse: ['建模到达', '排队论', '可靠性'],
    theorems: [
      { name: '计数分布', statement: '时间 t 内事件数服从泊松。',
        formula: 'N(t)\\sim\\mathrm{Pois}(\\lambda t)', },
      { name: '间隔指数', statement: '到达间隔服从指数分布。', },
    ],
    steps: [
      { title: '看强度', body: '单位时间平均次数。', },
      { title: '写计数', body: '泊松分布。', },
      { title: '看间隔', body: '指数分布。', },
      { title: '用无记忆性', body: '剩余等待时间。', },
      { title: '组合叠加', body: '独立过程相加。', },
    ],
    pitfalls: ['把强度当概率。', '忽略增量独立性。', '把离散计数当连续。'],
    example: { problem: '泊松过程时间 t 内期望事件数？', walkthrough: ['λt。'], result: 'λt' },
    moreExamples: [{ problem: '到达间隔服从什么分布？', walkthrough: ['指数分布。'], result: '指数' }],
  },
  {
    id: 'martingales',
    title: '鞅：公平游戏的数学',
    tag: '随机过程',
    level: '竞赛',
    essence: '鞅是条件期望等于当前值的过程，表示公平赌博。可选停时定理给出停止时的期望不变。',
    definition: '随机过程满足给定过去信息下下一时刻的条件期望等于当前值，称为鞅。',
    whenToUse: ['证明期望不变', '分析赌博策略', '随机分析'],
    theorems: [
      { name: '鞅定义', statement: '条件期望保持。',
        formula: 'E[M_{n+1}|F_n]=M_n', },
      { name: '可选停时', statement: '一定条件下停止期望不变。', },
    ],
    steps: [
      { title: '验条件期望', body: '用信息集计算。', },
      { title: '找上鞅下鞅', body: '方向不同。', },
      { title: '用停时定理', body: '注意有界或可积条件。', },
      { title: '算期望', body: '初始值等于停止期望。', },
      { title: '构造鞅', body: '用补偿和。', },
    ],
    pitfalls: ['忽略可积条件用停时定理。', '把鞅当独立。', '混淆上下鞅。'],
    example: { problem: '鞅的条件期望等于？', walkthrough: ['当前值。'], result: '当前值' },
    moreExamples: [{ problem: '可选停时定理何时可用？', walkthrough: ['有界或一致可积等条件。'], result: '需条件' }],
  },
  {
    id: 'symmetric-ciphers',
    title: '对称密码：一次一密与分组密码',
    tag: '密码学',
    level: '进阶',
    essence: '对称密码用同一密钥加解密。一次一密理论安全但密钥不可复用，分组密码用混淆与扩散构造。',
    definition: '对称加密的加密与解密使用同一密钥。一次一密要求密钥随机且与明文等长。',
    whenToUse: ['设计加密', '理解安全性', '分析攻击'],
    theorems: [
      { name: '一次一密安全', statement: '密钥随机等长则不可破。', },
      { name: '分组模式', statement: 'ECB 相同明文得相同密文。', },
    ],
    steps: [
      { title: '定密钥', body: '随机且保密。', },
      { title: '加密', body: '逐位异或或分组变换。', },
      { title: '传输', body: '密钥分离。', },
      { title: '解密', body: '同一密钥。', },
      { title: '验安全', body: '分析攻击面。', },
    ],
    pitfalls: ['复用一次性密钥。', 'ECB 模式泄露模式。', '密钥分发不安全。'],
    example: { problem: '一次一密的密钥要求？', walkthrough: ['随机且与明文等长、只用一次。'], result: '一次性随机密钥' },
    moreExamples: [{ problem: 'ECB 模式的问题？', walkthrough: ['相同明文块得相同密文。'], result: '模式泄露' }],
  },
  {
    id: 'hash-functions',
    title: '哈希函数与碰撞',
    tag: '密码学',
    level: '进阶',
    essence: '密码哈希把任意输入压缩成定长摘要，要求单向与抗碰撞，用于完整性校验与口令存储。',
    definition: '哈希函数是压缩映射。抗碰撞指难以找到两个不同输入同摘要；单向指难以由摘要反推输入。',
    whenToUse: ['校验完整性', '存储口令', '构造签名'],
    theorems: [
      { name: '抗碰撞', statement: '找碰撞困难。', },
      { name: '雪崩效应', statement: '输入微变输出大变。', },
    ],
    steps: [
      { title: '选算法', body: 'SHA 系列。', },
      { title: '加盐', body: '防彩虹表。', },
      { title: '迭代', body: '慢哈希防暴力。', },
      { title: '校验', body: '比对摘要。', },
      { title: '弃用弱算法', body: 'MD5/SHA1。', },
    ],
    pitfalls: ['把哈希当加密。', '不加盐存口令。', '用已破解算法。'],
    example: { problem: '哈希函数的抗碰撞指什么？', walkthrough: ['难以找到两输入同摘要。'], result: '难找碰撞' },
    moreExamples: [{ problem: '口令存储应如何做？', walkthrough: ['加盐并慢哈希。'], result: '加盐慢哈希' }],
  },
  {
    id: 'digital-signatures',
    title: '数字签名与公钥基础设施',
    tag: '密码学',
    level: '进阶',
    essence: '数字签名用私钥签名、公钥验证，保证完整性与不可否认。证书把公钥与身份绑定。',
    definition: '签名算法对消息摘要用私钥运算，验证用公钥。证书由可信机构签发。',
    whenToUse: ['保证不可否认', '分发公钥', '验证软件'],
    theorems: [
      { name: '签名验证', statement: '公钥验证私钥签名。', },
      { name: '证书链', statement: '信任锚逐级签发。', },
    ],
    steps: [
      { title: '摘要消息', body: '哈希。', },
      { title: '私钥签名', body: '对摘要运算。', },
      { title: '附签名', body: '与消息同发。', },
      { title: '公钥验证', body: '比对。', },
      { title: '查证书', body: '确认公钥归属。', },
    ],
    pitfalls: ['对原文直接签名：应先哈希。', '忽略证书链。', '私钥泄露仍用。'],
    example: { problem: '签名用哪个密钥？', walkthrough: ['私钥签名，公钥验证。'], result: '私钥签公钥验' },
    moreExamples: [{ problem: '证书的作用？', walkthrough: ['绑定公钥与身份。'], result: '绑定身份' }],
  },
  {
    id: 'automata-theory',
    title: '自动机与形式语言',
    tag: '理论计算机',
    level: '进阶',
    essence: '自动机是计算的理论模型：有限自动机识别正则语言，下推自动机识别上下文无关语言。',
    definition: '有限自动机由状态、字母表、转移与接受状态组成。正则语言可由正则表达式描述。',
    whenToUse: ['判断语言类型', '设计词法分析', '理解计算层级'],
    theorems: [
      { name: '正则与有限自动机等价', statement: '正则表达式对应有限自动机。', },
      { name: '泵引理', statement: '判定非正则。', },
    ],
    steps: [
      { title: '写字母表', body: '输入符号。', },
      { title: '画状态图', body: '转移。', },
      { title: '定接受态', body: '何时接受。', },
      { title: '化简', body: '合并等价状态。', },
      { title: '证明非正则', body: '用泵引理。', },
    ],
    pitfalls: ['把正则当上下文无关。', '忽略非确定性。', '状态漏转移。'],
    example: { problem: '有限自动机识别哪类语言？', walkthrough: ['正则语言。'], result: '正则' },
    moreExamples: [{ problem: '证明语言非正则用什么？', walkthrough: ['泵引理。'], result: '泵引理' }],
  },
  {
    id: 'channel-capacity',
    title: '信道容量与香农定理',
    tag: '信息论',
    level: '进阶',
    essence: '信道容量是可靠传输的最大速率。香农定理说低于容量的速率可任意小误差传输。',
    definition: '信道容量是输入分布上互信息的最大值。噪声信道容量由信噪比决定。',
    whenToUse: ['评估通信上限', '设计编码', '理解香农极限'],
    theorems: [
      { name: '容量定义', statement: '互信息最大。',
        formula: 'C=\\max I(X;Y)', },
      { name: '香农定理', statement: '低于容量可可靠传输。', },
    ],
    steps: [
      { title: '建信道模型', body: '转移概率。', },
      { title: '算互信息', body: '给定输入分布。', },
      { title: '取最大', body: '得容量。', },
      { title: '设计编码', body: '逼近容量。', },
      { title: '验证误码', body: '仿真。', },
    ],
    pitfalls: ['把容量当实际速率。', '忽略编码复杂度。', '把噪声当可完全消除。'],
    example: { problem: '信道容量的定义？', walkthrough: ['互信息最大值。'], result: '互信息最大' },
    moreExamples: [{ problem: '香农定理说明什么？', walkthrough: ['低于容量可可靠传输。'], result: '可达性' }],
  },
  {
    id: 'source-coding',
    title: '信源编码与压缩',
    tag: '信息论',
    level: '进阶',
    essence: '信源编码用尽量少的比特表示数据。熵给出无损压缩的下界，霍夫曼编码达到整数比特最优。',
    definition: '无损压缩的平均码长不小于信源熵。霍夫曼编码按频率构造最优前缀码。',
    whenToUse: ['设计压缩', '估计压缩极限', '实现编码'],
    theorems: [
      { name: '熵是下界', statement: '平均码长不小于熵。', },
      { name: '霍夫曼最优', statement: '前缀码中平均长度最小。', },
    ],
    steps: [
      { title: '统计频率', body: '符号分布。', },
      { title: '算熵', body: '理论下界。', },
      { title: '构造码', body: '霍夫曼树。', },
      { title: '编码', body: '替换符号。', },
      { title: '比较', body: '接近熵。', },
    ],
    pitfalls: ['压缩超过熵仍称无损。', '前缀码不唯一。', '忽略模型开销。'],
    example: { problem: '无损压缩的下界？', walkthrough: ['信源熵。'], result: '熵' },
    moreExamples: [{ problem: '霍夫曼编码的性质？', walkthrough: ['最优前缀码。'], result: '最优前缀码' }],
  },
  {
    id: 'error-correcting-codes-info',
    title: '纠错码与信道编码定理',
    tag: '信息论',
    level: '进阶',
    essence: '纠错码加冗余以对抗噪声。信道编码定理说存在码使误码率任意小，只要速率低于容量。',
    definition: '码的冗余用于检测与纠正错误。信道编码定理给出可达速率上界（容量）。',
    whenToUse: ['设计纠错', '分析可靠性', '理解定理'],
    theorems: [
      { name: '编码定理', statement: '低于容量存在好码。', },
      { name: '汉明界', statement: '纠错能力受球填充限制。', },
    ],
    steps: [
      { title: '定码率', body: '信息位与总长。', },
      { title: '加冗余', body: '校验位。', },
      { title: '纠错', body: '按症状译码。', },
      { title: '评估', body: '误码率。', },
      { title: '逼近容量', body: '用强码。', },
    ],
    pitfalls: ['把检错当纠错。', '忽略码率代价。', '假设无限码长。'],
    example: { problem: '信道编码定理的条件？', walkthrough: ['速率低于容量。'], result: '低于容量' },
    moreExamples: [{ problem: '冗余的代价？', walkthrough: ['降低有效码率。'], result: '码率下降' }],
  },
  {
    id: 'functors',
    title: '函子：范畴之间的映射',
    tag: '范畴论',
    level: '竞赛',
    essence: '函子把对象映成对象、态射映成态射，并保持复合与恒等。它让不同范畴可以比较。',
    definition: '协变函子保持态射方向，反变函子反转方向。函子必须保持恒等与复合。',
    whenToUse: ['比较范畴', '构造不变量', '理解自然变换'],
    theorems: [
      { name: '函子保复合', statement: 'F(g∘f)=F(g)∘F(f)。',
        formula: 'F(g\\circ f)=F(g)\\circ F(f)', },
      { name: '保恒等', statement: 'F(id)=id。', },
    ],
    steps: [
      { title: '定两个范畴', body: '源与目标。', },
      { title: '映对象', body: '逐个对应。', },
      { title: '映态射', body: '保持方向或反转。', },
      { title: '验复合', body: '保持复合。', },
      { title: '验恒等', body: '保持恒等。', },
    ],
    pitfalls: ['反变函子方向搞反。', '忘记保恒等。', '把函子当普通映射。'],
    example: { problem: '反变函子把态射方向如何？', walkthrough: ['反转。'], result: '反转' },
    moreExamples: [{ problem: '函子必须保持什么？', walkthrough: ['复合与恒等。'], result: '复合与恒等' }],
  },
  {
    id: 'natural-transformations',
    title: '自然变换：函子之间的映射',
    tag: '范畴论',
    level: '竞赛',
    essence: '自然变换在每对函子像之间给出一族态射，并使所有方形交换。它比较两个函子。',
    definition: '自然变换由每个对象的组件态射组成，满足自然性：对任意态射，方块交换。',
    whenToUse: ['比较函子', '定义等价', '构造范畴的范畴'],
    theorems: [
      { name: '自然性', statement: '方块交换。',
        formula: '\\eta_B\\circ F(f)=G(f)\\circ\\eta_A', },
      { name: '自然同构', statement: '每个组件可逆。', },
    ],
    steps: [
      { title: '两个函子', body: '同源同目标。', },
      { title: '给组件', body: '每个对象一个态射。', },
      { title: '验交换', body: '对所有态射验证。', },
      { title: '判同构', body: '组件是否可逆。', },
      { title: '用于等价', body: '范畴等价由自然同构刻画。', },
    ],
    pitfalls: ['只给组件不验自然性。', '把自然变换当函子。', '忽略方向。'],
    example: { problem: '自然变换的自然性要求什么？', walkthrough: ['所有方块交换。'], result: '方块交换' },
    moreExamples: [{ problem: '自然同构的条件？', walkthrough: ['每个组件可逆。'], result: '组件可逆' }],
  },
  {
    id: 'universal-property',
    title: '泛性质：用映射刻画对象',
    tag: '范畴论',
    level: '竞赛',
    essence: '泛性质不描述对象内部，而描述它与所有对象之间的映射关系。积、余积、自由对象都由泛性质定义。',
    definition: '对象满足泛性质，指对任意相关对象存在唯一态射使图表交换。泛性质在同构意义下唯一确定对象。',
    whenToUse: ['统一构造', '证明唯一性', '理解极限'],
    theorems: [
      { name: '唯一性', statement: '满足泛性质的对象在同构意义下唯一。', },
      { name: '积的泛性质', statement: '到积的映射由到各分量的映射唯一确定。', },
    ],
    steps: [
      { title: '写出图表', body: '对象与态射。', },
      { title: '声明存在性', body: '对任意对象存在态射。', },
      { title: '声明唯一性', body: '态射唯一。', },
      { title: '验证交换', body: '图表交换。', },
      { title: '得唯一', body: '同构意义唯一。', },
    ],
    pitfalls: ['只声明存在不声明唯一。', '忽略交换性。', '把泛性质当构造公式。'],
    example: { problem: '泛性质确定的对象唯一吗？', walkthrough: ['在同构意义下唯一。'], result: '同构唯一' },
    moreExamples: [{ problem: '积由什么刻画？', walkthrough: ['到各分量的映射唯一确定。'], result: '泛性质' }],
  },
  {
    id: 'bounded-variation',
    title: '有界变差函数：能写成两个单调函数之差',
    tag: '实分析',
    level: '竞赛',
    essence: '有界变差函数是「总振荡有限」的函数，它恰好是两个单调递增函数之差，因此几乎处处可导。',
    definition: '函数在区间上的变差是所有分割上相邻差绝对值之和的上确界。变差有限时称有界变差。',
    whenToUse: ['判断变差有限', '分析单调分解', '研究可导性'],
    theorems: [
      { name: '若尔当分解', statement: '有界变差函数等于两个增函数之差。', },
      { name: '几乎处处可导', statement: '有界变差函数几乎处处可导。', },
    ],
    steps: [
      { title: '取分割', body: '把区间细分。', },
      { title: '求和', body: '相邻差的绝对值。', },
      { title: '取上确界', body: '得总变差。', },
      { title: '做分解', body: '构造两个增函数。', },
      { title: '用可导性', body: '几乎处处可导。', },
    ],
    pitfalls: ['把连续当有界变差。', '忽略上确界要取所有分割。', '混淆变差与振幅。'],
    example: { problem: '单调函数的变差等于什么？', walkthrough: ['端点函数值之差。'], result: '端点差' },
    moreExamples: [{ problem: '有界变差函数几乎处处可导吗？', walkthrough: ['是。'], result: '是' }],
  },
  {
    id: 'maximum-modulus',
    title: '最大模原理与施瓦茨引理',
    tag: '复分析',
    level: '竞赛',
    essence: '解析函数的最大模只能在边界取到（非常数时），由此推出施瓦茨引理与许多估值。',
    definition: '非常数解析函数在区域内不取到最大模。施瓦茨引理给出单位圆盘到自身的解析映射在原点的导数界。',
    whenToUse: ['估计解析函数', '证明唯一性', '研究映射'],
    theorems: [
      { name: '最大模原理', statement: '非常数解析函数内部无最大模。', },
      { name: '施瓦茨引理', statement: '单位圆盘自映射满足导数界。', },
    ],
    steps: [
      { title: '验解析', body: '区域上解析。', },
      { title: '找边界', body: '闭区域边界取最大。', },
      { title: '比较', body: '内部值不超过边界。', },
      { title: '用施瓦茨', body: '原点导数不超过一。', },
      { title: '取等条件', body: '只有旋转映射取等。', },
    ],
    pitfalls: ['把最大模原理用于非常数函数内部取值。', '忽略区域有界。', '施瓦茨引理忘记归一化条件。'],
    example: { problem: '非常数解析函数的最大模在哪里取到？', walkthrough: ['边界。'], result: '边界' },
    moreExamples: [{ problem: '施瓦茨引理中导数绝对值不超过？', walkthrough: ['一。'], result: '1' }],
  },
  {
    id: 'signed-measures', title: '符号测度与 Hahn－Jordan 分解', tag: '测度论', level: '竞赛',
    essence: '符号测度允许取负值。Hahn 分解把空间分成正负两块，Jordan 分解再把符号测度写成两个正测度之差。', definition: '符号测度是可列可加但可取负值的集函数。Hahn 分解给出正集与负集的划分，Jordan 分解给出唯一的两正测度之差。',
    whenToUse: ['处理带符号的测度', '分解电荷分布', '研究绝对连续'],
    theorems: [
      { name: 'Hahn 分解', statement: '空间可分成正集与负集。', },
      { name: 'Jordan 分解', statement: '符号测度等于两个正测度之差。', },
    ],
    steps: [
      { title: '找正集', body: '测度非负的集合。', },
      { title: '找负集', body: '测度非正的集合。', },
      { title: '验证划分', body: '两者不交且并为全空间。', },
      { title: '构造正负部', body: '由划分定义。', },
      { title: '得分解', body: '符号测度等于正部减负部。', },
    ],
    pitfalls: ['把符号测度当正测度。', 'Hahn 分解不唯一但正负部唯一。', '忽略可列可加。'],
    example: { problem: '符号测度的 Jordan 分解唯一吗？', walkthrough: ['正负部唯一。'], result: '唯一' },
    moreExamples: [{ problem: 'Hahn 分解把空间分成什么？', walkthrough: ['正集与负集。'], result: '正负两块' }],
  },
  {
    id: 'uniform-boundedness', title: '一致有界原理：逐点有界推出等度有界', tag: '泛函分析', level: '竞赛',
    essence: '巴拿赫－施坦豪斯定理说：完备空间上一族有界算子若逐点有界，则它们的范数一致有界。', definition: '巴拿赫空间上的一族有界线性算子，若对每个点都有界，则算子范数集合有界。它是三大基本定理之一。',
    whenToUse: ['证明算子族一致有界', '推导发散性', '分析收敛'],
    theorems: [
      { name: '逐点有界推出范数有界', statement: '完备性保证。', },
      { name: '推论：收敛点集闭', statement: '逐点极限算子有界。', },
    ],
    steps: [
      { title: '验完备', body: '空间必须是巴拿赫空间。', },
      { title: '验逐点有界', body: '每点被控制。', },
      { title: '用定理', body: '得范数一致界。', },
      { title: '取推论', body: '极限算子有界。', },
      { title: '反例', body: '不完备空间失效。', },
    ],
    pitfalls: ['忽略完备性。', '把逐点有界当一致有界（结论才是）。', '混淆算子范数与逐点值。'],
    example: { problem: '一致有界原理要求空间？', walkthrough: ['完备（巴拿赫）。'], result: '完备' },
    moreExamples: [{ problem: '逐点有界能推出什么？', walkthrough: ['算子范数一致有界。'], result: '范数有界' }],
  },
  {
    id: 'set-operations', title: '集合的运算：并、交、差与笛卡尔积', tag: '集合论', level: '进阶',
    essence: '集合运算是数学中最基础的代数：并与交满足分配律与德摩根律，笛卡尔积把两个集合组合成有序对。', definition: '并集是至少属于一个集合的元素全体，交集是同时属于所有集合的元素，差集属于前者不属于后者。笛卡尔积是有序对的全体。',
    whenToUse: ['化简集合表达式', '证明恒等式', '构造有序对与关系'],
    theorems: [
      { name: '分配律', statement: '交对并、并对交都分配。',
        formula: 'A\\cap(B\\cup C)=(A\\cap B)\\cup(A\\cap C)', },
      { name: '德摩根律', statement: '补集把并与交互换。',
        formula: '\\overline{A\\cup B}=\\overline A\\cap\\overline B', },
    ],
    steps: [
      { title: '画韦恩图', body: '先直观判断等式是否成立。', },
      { title: '用元素法', body: '任取元素按定义翻译。', },
      { title: '用运算律', body: '分配、结合、德摩根化简。', },
      { title: '处理空集', body: '空集参与幺元运算。', },
      { title: '用笛卡尔积', body: '有序对顺序不能交换。', },
    ],
    pitfalls: ['把并交当可交换的算术运算（差集不交换）。', '忘记笛卡尔积有序。', '忽略全集：补集依赖全集。'],
    example: { problem: '两元素集合与三元素集合的笛卡尔积有多少元素？', walkthrough: ['六个。'], result: '6' },
    moreExamples: [{ problem: '交集对并集满足分配律吗？', walkthrough: ['满足。'], result: '满足' }],
  },
  {
    id: 'russell-paradox', title: '罗素悖论：为什么集合需要公理', tag: '集合论', level: '进阶',
    essence: '「所有不含自身的集合组成的集合」是否含自身？这是罗素悖论，它说明无限制的概括原则会自相矛盾。', definition: '朴素概括原则允许对任意性质构造集合。罗素构造出既不能含自身也不能不含自身的集合，导出矛盾。',
    whenToUse: ['理解公理化动机', '判断集合构造是否合法', '向初学者解释悖论'],
    theorems: [
      { name: '罗素悖论', statement: '设 R 为所有不含自身集合之集，则 R∈R 与 R∉R 互推。', },
      { name: '解决方式', statement: '限制概括为分离公理。', },
    ],
    steps: [
      { title: '写出定义', body: '用性质构造集合。', },
      { title: '提问自指', body: '该集合是否含自身。', },
      { title: '推出矛盾', body: '两种假设都矛盾。', },
      { title: '找病根', body: '无限制概括太强。', },
      { title: '改公理', body: '只允许从已知集合筛选。', },
    ],
    pitfalls: ['把悖论当文字游戏。', '认为集合论因此无用。', '忽略自指是核心。'],
    example: { problem: '罗素悖论说明什么？', walkthrough: ['无限制概括会导致矛盾。'], result: '概括需限制' },
    moreExamples: [{ problem: '现代集合论如何避开它？', walkthrough: ['用分离公理限制构造。'], result: '分离公理' }],
  },
  {
    id: 'countable-uncountable', title: '可数与不可数：两种无穷', tag: '集合论', level: '进阶',
    essence: '无穷集不都一样大：自然数可数，实数不可数。对角线法证明不可数，是集合论最经典的手法。', definition: '与自然数等势的集合叫可数集。不可数集不能与自然数建立双射。实数集是不可数的。',
    whenToUse: ['判断可数性', '证明不可数', '构造双射'],
    theorems: [
      { name: '可数并', statement: '可数集合的可列并仍可数。', },
      { name: '康托尔定理', statement: '幂集严格大于原集合。',
        formula: '|P(A)|>|A|', },
    ],
    steps: [
      { title: '先找双射', body: '可数就是与自然数一一对应。', },
      { title: '列成表格', body: '可数集能排成序列。', },
      { title: '用对角线', body: '假设可列，构造不在表中的元素。', },
      { title: '得矛盾', body: '推翻可列假设。', },
      { title: '推广', body: '幂集与实数不可数。', },
    ],
    pitfalls: ['把无限集都当等势。', '对角线法构造时漏掉符号变化。', '忽略选择公理。'],
    example: { problem: '有理数集可数吗？', walkthrough: ['可数。'], result: '可数' },
    moreExamples: [{ problem: '实数集可数吗？', walkthrough: ['不可数。'], result: '不可数' }],
  },
  {
    id: 'formal-semantics', title: '形式语义：结构、满足与真', tag: '数理逻辑', level: '竞赛',
    essence: '语法只管符号怎么排列，语义才谈真假。结构给符号赋予含义，满足关系定义公式在结构中是否为真。', definition: '一阶结构由论域与符号解释组成。公式在赋值下按递归定义判断真假，记作结构满足公式。',
    whenToUse: ['判断公式真假', '区分语法与语义', '研究模型类'],
    theorems: [
      { name: '满足递归定义', statement: '量词按论域中所有/存在元素解释。', },
      { name: '有效性', statement: '在所有结构中为真的公式叫有效式。', },
    ],
    steps: [
      { title: '定论域', body: '明确讨论对象。', },
      { title: '解释符号', body: '常元、函数、关系。', },
      { title: '赋自由变量', body: '给自由变量取值。', },
      { title: '递归求值', body: '按逻辑联结词与量词。', },
      { title: '判断满足', body: '得真值。', },
    ],
    pitfalls: ['把可证与真混为一谈。', '量词辖域看错。', '忽略自由变量。'],
    example: { problem: '公式在结构中为真与可证是什么关系？', walkthrough: ['可证蕴含为真（可靠性），反之需完备性。'], result: '不同概念' },
    moreExamples: [{ problem: '有效式的定义？', walkthrough: ['所有结构中为真。'], result: '处处为真' }],
  },
  {
    id: 'deduction-theorem', title: '演绎定理与自然演绎', tag: '数理逻辑', level: '竞赛',
    essence: '演绎定理把「假设 A 能推出 B」转化为「A 蕴含 B 可证」，是形式证明最常用的元定理。', definition: '若在增加前提 A 后能证明 B，则在原系统中能证明 A 蕴含 B。自然演绎用引入与消去规则实现同样的推理。',
    whenToUse: ['简化形式证明', '构造条件证明', '验证推理规则'],
    theorems: [
      { name: '演绎定理', statement: '加前提可证则蕴含可证。',
        formula: '\\vdash A\\to B', },
      { name: '条件证明', statement: '假设 A 推出 B 即证 A→B。', },
    ],
    steps: [
      { title: '列前提', body: '把假设写成公式。', },
      { title: '推导', body: '用规则逐步行。', },
      { title: '得结论', body: '在假设下证得 B。', },
      { title: '用演绎定理', body: '撤销假设得 A→B。', },
      { title: '检查释放', body: '假设要正确释放。', },
    ],
    pitfalls: ['假设不释放。', '把演绎定理当推理规则。', '混淆对象语言与元语言。'],
    example: { problem: '演绎定理的作用？', walkthrough: ['把条件证明合法化。'], result: '条件证明' },
    moreExamples: [{ problem: '自然演绎的规则分几类？', walkthrough: ['引入与消去。'], result: '引入/消去' }],
  },
  {
    id: 'decidability', title: '可判定性：有没有算法回答', tag: '数理逻辑', level: '竞赛',
    essence: '判定问题问：是否存在算法对任意输入在有限步内给出是/否。命题逻辑可判定，一阶逻辑不可判定。', definition: '理论可判定指存在算法判定任意句子是否属于该理论。不可判定指不存在这样的算法。',
    whenToUse: ['判断理论是否可判定', '理解不可判定性', '联系可计算性'],
    theorems: [
      { name: '命题逻辑可判定', statement: '真值表给出算法。', },
      { name: '一阶逻辑不可判定', statement: '丘奇－图灵定理。', },
    ],
    steps: [
      { title: '明确问题类', body: '输入是什么。', },
      { title: '找算法', body: '或证明不存在。', },
      { title: '用小规模验证', body: '检查算法正确性。', },
      { title: '用归约', body: '证明不可判定。', },
      { title: '注意限制', body: '可判定性依赖语言与理论。', },
    ],
    pitfalls: ['把可判定当可计算。', '忽略输入编码。', '混淆理论与单个公式。'],
    example: { problem: '命题逻辑可判定吗？', walkthrough: ['可判定（真值表）。'], result: '可判定' },
    moreExamples: [{ problem: '一阶逻辑可判定吗？', walkthrough: ['不可判定。'], result: '不可判定' }],
  },
  {
    id: 'cumulative-hierarchy', title: '累积层级与秩', tag: '公理化集合论', level: '竞赛',
    essence: '冯·诺依曼累积层级把集合按「构造阶段」分层：每个集合都出现在某个 V_α 中，秩衡量它的复杂程度。', definition: '累积层级由 V_0 为空、后继取幂集、极限取并定义。集合的秩是最小的 α 使集合属于 V 的 α 加一。',
    whenToUse: ['理解集合的层次', '计算秩', '证明正则公理'],
    theorems: [
      { name: '层级递增', statement: 'V 的 α 递增且包含前面的层。', },
      { name: '每个集合有秩', statement: '正则公理保证集合都在某层。', },
    ],
    steps: [
      { title: '从空集起', body: '构造 V_0。', },
      { title: '取幂集', body: '得后继层。', },
      { title: '极限取并', body: '得极限层。', },
      { title: '定位集合', body: '找到它首次出现的层。', },
      { title: '读秩', body: '秩为最小下标。', },
    ],
    pitfalls: ['把 V_α 当全体集合。', '忽略极限层。', '秩与基数混淆。'],
    example: { problem: '空集的秩是多少？', walkthrough: ['零。'], result: '0' },
    moreExamples: [{ problem: '全体集合能构成一个 V_α 吗？', walkthrough: ['不能，真类。'], result: '不成集' }],
  },
  {
    id: 'reflection-principle', title: '反射原理', tag: '公理化集合论', level: '竞赛',
    essence: '反射原理说：任何关于全宇宙成立的性质，都在某个足够大的集合层中已经成立。它解释了大基数的直觉。', definition: '对任意有限个公式，存在序数 α 使这些公式在 V_α 中的真假与在全集宇宙中相同。',
    whenToUse: ['理解大基数', '简化证明', '构造内模型'],
    theorems: [
      { name: '有限反射', statement: '有限公式集可被某层反射。', },
      { name: '与替换公理联系', statement: '反射由替换公理推出。', },
    ],
    steps: [
      { title: '选公式集', body: '有限条性质。', },
      { title: '找层', body: '足够大的 V_α。', },
      { title: '比较真假', body: '两者一致。', },
      { title: '推广', body: '可列公式需更强公理。', },
      { title: '用于大基数', body: '反射刻画不可达基数。', },
    ],
    pitfalls: ['把有限反射当无限反射。', '忽略公式集有限。', '把 V_α 当集合论模型。'],
    example: { problem: '反射原理对多少条公式成立？', walkthrough: ['任意有限条。'], result: '有限' },
    moreExamples: [{ problem: '反射原理与哪条公理相关？', walkthrough: ['替换公理。'], result: '替换' }],
  },
  {
    id: 'ordinal-arithmetic', title: '序数算术', tag: '公理化集合论', level: '竞赛',
    essence: '序数加法与乘法由超限递归定义：后继加一，极限取上确界。它们不交换，但保持序关系。', definition: '序数加法定义为对第二个变量的超限递归；乘法同理。加法结合但不交换，一加 ω 等于 ω，ω 加一大于 ω。',
    whenToUse: ['计算序数和', '理解非交换性', '用于基数比较'],
    theorems: [
      { name: '加法定义', statement: '后继与极限递归。',
        formula: '\\alpha+(\\beta+1)=(\\alpha+\\beta)+1', },
      { name: '非交换', statement: '1+ω=ω 但 ω+1>ω。', },
    ],
    steps: [
      { title: '从有限情形入手', body: '自然数加法的推广。', },
      { title: '处理后继', body: '加一。', },
      { title: '处理极限', body: '取上确界。', },
      { title: '验结合律', body: '加法结合。', },
      { title: '看非交换', body: '顺序不同结果不同。', },
    ],
    pitfalls: ['默认交换律。', '把极限步漏掉。', '混淆序数与基数运算。'],
    example: { problem: '1+ω 等于多少？', walkthrough: ['ω。'], result: 'ω' },
    moreExamples: [{ problem: 'ω+1 与 ω 的关系？', walkthrough: ['ω+1 大于 ω。'], result: '更大' }],
  },
  {
    id: 'structure-view', title: '结构的观点：用公理刻画对象', tag: '现代数学', level: '进阶',
    essence: '现代数学不关心对象「是什么」，只关心它满足什么公理与运算规律。群、环、拓扑空间都是这样定义的。', definition: '结构由载体与运算/关系组成，满足一组公理。同构保持结构，因此在结构意义下不可区分。',
    whenToUse: ['理解抽象定义', '比较不同结构', '识别同构'],
    theorems: [
      { name: '同构保结构', statement: '双射且保持运算。', },
      { name: '结构由公理决定', statement: '满足公理的对象都可用同一套定理。', },
    ],
    steps: [
      { title: '找载体', body: '对象是什么集合。', },
      { title: '列运算', body: '哪些操作被定义。', },
      { title: '写公理', body: '满足哪些规律。', },
      { title: '证定理', body: '只用公理推导。', },
      { title: '看同构', body: '结构相同的对象不加区分。', },
    ],
    pitfalls: ['把具体表示当结构本身。', '忽略公理中的封闭性。', '混同同构与相等。'],
    example: { problem: '群的定义由什么决定？', walkthrough: ['载体加满足四条的运算。'], result: '公理' },
    moreExamples: [{ problem: '同构保持什么？', walkthrough: ['运算与关系结构。'], result: '结构' }],
  },
  {
    id: 'invariant-view', title: '不变量：分类的钥匙', tag: '现代数学', level: '进阶',
    essence: '要区分两个对象，就找一个在允许变换下不变、但两者取值不同的量。维数、欧拉示性数、基本群都是不变量。', definition: '不变量是在某类变换下保持不变的量或结构。完全不变量能唯一确定对象（在同构意义下）。',
    whenToUse: ['区分对象', '证明不同构', '分类问题'],
    theorems: [
      { name: '同构不变', statement: '同构的对象不变量相同。', },
      { name: '不变量区分', statement: '不变量不同则不对象不同。', },
    ],
    steps: [
      { title: '定变换类', body: '允许哪些变换。', },
      { title: '找不变量', body: '在变换下保持。', },
      { title: '比较取值', body: '不同则不同构。', },
      { title: '求完备性', body: '是否唯一确定。', },
      { title: '分类', body: '按不变量分层。', },
    ],
    pitfalls: ['把不变量当充分条件：不变量相同未必同构。', '忽略变换类。', '只算一个不变量。'],
    example: { problem: '维数是什么的不变量？', walkthrough: ['同胚/同构。'], result: '拓扑/线性' },
    moreExamples: [{ problem: '不变量相同能推出同构吗？', walkthrough: ['不一定（除非完备）。'], result: '不一定' }],
  },
  {
    id: 'abstraction-levels', title: '抽象层级：从数到范畴', tag: '现代数学', level: '进阶',
    essence: '数学的抽象层层递进：数 → 集合 → 结构 → 结构之间的映射 → 映射之间的关系。范畴论处在最高层。', definition: '每一层抽象都放弃一部分信息，换取更大的适用范围。选择抽象层级取决于要证明的结论。',
    whenToUse: ['选择合适抽象', '理解范畴论位置', '组织知识'],
    theorems: [
      { name: '层层概括', statement: '高层结论可推广到更多对象。', },
      { name: '信息损失', statement: '抽象越高具体信息越少。', },
    ],
    steps: [
      { title: '看对象', body: '当前层研究什么。', },
      { title: '看映射', body: '层内如何比较。', },
      { title: '再看映射的映射', body: '是否自然。', },
      { title: '选层级', body: '够用即可。', },
      { title: '回落后层', body: '需要计算时回到具体。', },
    ],
    pitfalls: ['抽象越高越好：可能失去可计算性。', '层级混用。', '忘记底层例子。'],
    example: { problem: '范畴论研究哪一层？', walkthrough: ['对象、态射、函子与自然变换。'], result: '高层' },
    moreExamples: [{ problem: '抽象过高的代价？', walkthrough: ['丢失具体计算信息。'], result: '信息损失' }],
  },
  {
    id: 'functions-injective-surjective', title: '单射、满射与双射', tag: '集合论', level: '进阶',
    essence: '单射不撞车，满射覆盖全部，双射两者兼具。双射是集合等势的唯一标准。', definition: '单射指不同元素像不同；满射指陪域每个元素都有原像；双射指既是单射又是满射，因此可逆。',
    whenToUse: ['判断映射类型', '证明等势', '构造逆映射'],
    theorems: [
      { name: '单射判据', statement: '$f(a)=f(b)$ 推出 $a=b$。', },
      { name: '双射即可逆', statement: '双射的逆映射存在。', },
    ],
    steps: [
      { title: '定定义域与陪域', body: '先写清两侧集合。', },
      { title: '验单射', body: '假设像相等推出原像相等。', },
      { title: '验满射', body: '任取陪域元素构造原像。', },
      { title: '得双射', body: '两者都成立。', },
      { title: '看可逆', body: '双射给出逆映射。', },
    ],
    pitfalls: ['只验单射就当双射。', '陪域与值域混淆。', '有限集靠计数代替证明。'],
    example: { problem: '有限集之间单射能推出双射吗？', walkthrough: ['只有基数相同才可以。'], result: '不一定' },
    moreExamples: [{ problem: '双射的逆是什么？', walkthrough: ['仍是双射。'], result: '双射' }],
  },
  {
    id: 'composition-inverse', title: '映射的复合与逆', tag: '集合论', level: '进阶',
    essence: '复合是把两个映射接起来，顺序从右往左。双射的逆满足与自身复合为单位映射。', definition: '复合映射先作用内层再作用外层。逆映射只在双射时存在，且作用方向相反。',
    whenToUse: ['化简复合', '求逆映射', '证明恒等'],
    theorems: [
      { name: '复合结合律', statement: '$(h\\circ g)\\circ f=h\\circ(g\\circ f)$。', },
      { name: '逆的唯一性', statement: '双射的逆唯一。', },
    ],
    steps: [
      { title: '写清顺序', body: '从右往左作用。', },
      { title: '逐层代入', body: '先内层后外层。', },
      { title: '验可逆', body: '内层外层都得是双射。', },
      { title: '求逆', body: '反向写。', },
      { title: '验恒等', body: '复合得恒等映射。', },
    ],
    pitfalls: ['复合顺序写反。', '把逆映射当倒数。', '忽略可逆条件。'],
    example: { problem: '$f\\circ f^{-1}$ 等于什么？', walkthrough: ['恒等映射。'], result: '恒等' },
    moreExamples: [{ problem: '两个双射的复合是双射吗？', walkthrough: ['是。'], result: '是' }],
  },
  {
    id: 'relations-closure', title: '关系的闭包：补上缺的性质', tag: '集合论', level: '进阶',
    essence: '给定关系但缺自反、对称或传递性时，可以添加最少的有序对补成相应闭包。传递闭包最常用。', definition: '关系的自反/对称/传递闭包是包含原关系且具有相应性质的最小关系。',
    whenToUse: ['补全关系性质', '求可达性', '等价关系构造'],
    theorems: [
      { name: '传递闭包', statement: '最小的传递关系包含原关系。', },
      { name: '闭包存在唯一', statement: '三个闭包都存在且唯一。', },
    ],
    steps: [
      { title: '列原关系', body: '写出有序对集合。', },
      { title: '看缺哪条', body: '自反/对称/传递。', },
      { title: '补对角元', body: '自反闭包加 $(x,x)$。', },
      { title: '补反向对', body: '对称闭包加 $(y,x)$。', },
      { title: '连链条', body: '传递闭包反复连接。', },
    ],
    pitfalls: ['闭包加多了：必须是「最小」。', '传递闭包只连一步。', '忽略定义域。'],
    example: { problem: '自反闭包要补什么？', walkthrough: ['所有 $(x,x)$。'], result: '对角元' },
    moreExamples: [{ problem: '传递闭包怎么算？', walkthrough: ['反复连接可达路径。'], result: '可达闭包' }],
  },
  {
    id: 'well-orders', title: '良序集与序型', tag: '集合论', level: '竞赛',
    essence: '良序集是每个非空子集都有最小元的全序集。序型刻画良序集的「长度」，自然数对应序型 ω。', definition: '良序是每个非空子集都有最小元的线性序。两个良序集序型相同指存在保序双射。',
    whenToUse: ['判断良序', '比较良序长度', '用超限归纳'],
    theorems: [
      { name: '良序即归纳可用', statement: '良序集上可做超限归纳。', },
      { name: '序型唯一', statement: '保序双射存在时序型相同。', },
    ],
    steps: [
      { title: '验全序', body: '任意两元素可比。', },
      { title: '验最小元', body: '每个非空子集有最小元。', },
      { title: '找保序双射', body: '比较两个良序集。', },
      { title: '得序型', body: '相同则同序型。', },
      { title: '看反例', body: '整数集非良序。', },
    ],
    pitfalls: ['把全序当良序。', '只看整体最小元，忽略子集。', '混淆序型与基数。'],
    example: { problem: '整数集在通常序下良序吗？', walkthrough: ['不是，存在无最小元的子集。'], result: '不是' },
    moreExamples: [{ problem: '自然数的序型是什么？', walkthrough: ['ω。'], result: 'ω' }],
  },
  {
    id: 'transfinite-induction', title: '超限归纳与超限递归', tag: '集合论', level: '竞赛',
    essence: '良序集上可以做超限归纳：不需只依赖前一个，而是依赖所有更小的元素。由此定义函数叫超限递归。', definition: '超限归纳：若每个元素的性质可由所有更小元素的性质推出，则所有元素都有该性质。超限递归按同样模式定义函数。',
    whenToUse: ['证明良序集上的性质', '定义序数运算', '构造累积层级'],
    theorems: [
      { name: '超限归纳', statement: '性质对最小元成立且可由前段推出。', },
      { name: '超限递归', statement: '函数值由前段值决定。', },
    ],
    steps: [
      { title: '验良序', body: '必须是良序集。', },
      { title: '处理最小元', body: '归纳起点。', },
      { title: '处理后继', body: '由前一个推出。', },
      { title: '处理极限', body: '由所有更小元素推出。', },
      { title: '得结论', body: '全体成立。', },
    ],
    pitfalls: ['漏极限步。', '把超限归纳当普通归纳。', '忽略良序前提。'],
    example: { problem: '超限归纳比普通归纳多处理什么？', walkthrough: ['极限序数（无可数前驱）。'], result: '极限步' },
    moreExamples: [{ problem: '超限递归用来定义什么？', walkthrough: ['序数算术、累积层级等。'], result: '函数' }],
  },
  {
    id: 'order-types', title: '序型与序数和', tag: '集合论', level: '竞赛',
    essence: '序型是良序集的「形状」，序数就是序型的代表。序数和对应「先排完一个再排另一个」。', definition: '两个良序集序型相同指存在保序双射。序数和是把一个良序集接在另一个之后得到的序型。',
    whenToUse: ['比较良序集', '做序数运算', '理解非交换'],
    theorems: [
      { name: '序数和', statement: '先 A 后 B 的序型。', },
      { name: '非交换', statement: '$1+\\omega=\\omega$ 但 $\\omega+1>\\omega$。', },
    ],
    steps: [
      { title: '看形状', body: '忽略元素名称只看顺序。', },
      { title: '找保序双射', body: '比较两个良序集。', },
      { title: '做拼接', body: '序数和。', },
      { title: '验顺序', body: '先后的影响。', },
      { title: '看非交换', body: '顺序不能换。', },
    ],
    pitfalls: ['把序型当基数。', '默认交换律。', '拼接方向搞反。'],
    example: { problem: '$1+\\omega$ 等于多少？', walkthrough: ['ω。'], result: 'ω' },
    moreExamples: [{ problem: '$\\omega+1$ 与 ω 比较？', walkthrough: ['更大。'], result: '更大' }],
  },
  {
    id: 'cardinal-arithmetic', title: '基数算术', tag: '集合论', level: '竞赛',
    essence: '基数衡量大小，其运算由集合运算定义。无限基数有反直觉性质：无穷加无穷、无穷乘无穷仍等于原基数。', definition: '基数加法对应无交并，乘法对应笛卡尔积，幂对应函数集。无限基数满足吸收律。',
    whenToUse: ['计算基数', '比较大小', '理解反直觉结论'],
    theorems: [
      { name: '吸收律', statement: '$\\kappa+\\lambda=\\max(\\kappa,\\lambda)$（无限时）。', },
      { name: '幂集更大', statement: '$2^{\\kappa}>\\kappa$。', },
    ],
    steps: [
      { title: '定基数', body: '先给出代表集合。', },
      { title: '用集合运算', body: '并不、积、函数集。', },
      { title: '取基数', body: '结果集合的基数。', },
      { title: '用吸收律', body: '无限情形化简。', },
      { title: '看幂集', body: '严格变大。', },
    ],
    pitfalls: ['把有限算术规律套到无限。', '忽略选择公理（基数可比性）。', '把 $2^{\\aleph_0}$ 当 $\\aleph_0$。'],
    example: { problem: '$\\aleph_0+\\aleph_0$ 等于多少？', walkthrough: ['$\\aleph_0$。'], result: 'aleph0' },
    moreExamples: [{ problem: '$2^{\\aleph_0}$ 与 $\\aleph_0$ 比较？', walkthrough: ['严格更大。'], result: '更大' }],
  },
  {
    id: 'cantor-bernstein', title: '康托尔－伯恩斯坦定理', tag: '集合论', level: '竞赛',
    essence: '若 A 到 B 有单射、B 到 A 也有单射，则 A 与 B 等势。它让等势证明不必构造显式双射。', definition: '两集合互相单射嵌入，则存在双射。证明用「追踪链条」的构造。',
    whenToUse: ['证明等势', '避免显式双射', '比较基数'],
    theorems: [
      { name: '两单射即等势', statement: '$|A|\\le|B|$ 且 $|B|\\le|A|$ 推出 $|A|=|B|$。', },
      { name: '构造双射', statement: '用链条追踪。', },
    ],
    steps: [
      { title: '给两个单射', body: '各自嵌入。', },
      { title: '追踪链条', body: '从元素沿映射来回走。', },
      { title: '分三类', body: '无限回溯、终止于 A、终止于 B。', },
      { title: '定义双射', body: '按类别指派。', },
      { title: '验双射', body: '验证两侧。', },
    ],
    pitfalls: ['把两单射当显然双射。', '构造时漏掉某类元素。', '忽略选择公理（一般情形）。'],
    example: { problem: '康托尔－伯恩斯坦定理说的是？', walkthrough: ['两方向单射推出双射。'], result: '双射存在' },
    moreExamples: [{ problem: '它需要选择公理吗？', walkthrough: ['不需要（普通版本）。'], result: '不需要' }],
  },
  {
    id: 'continuum-hypothesis', title: '连续统假设', tag: '集合论', level: '竞赛',
    essence: '连续统假设说实数基数是最小的不可数基数。它与 ZFC 独立，既不能证也不能否证。', definition: '连续统假设 CH 断言 $2^{\\aleph_0}=\\aleph_1$。广义连续统假设对每个基数陈述类似等式。',
    whenToUse: ['理解独立性', '讨论基数谱', '阅读集合论前沿'],
    theorems: [
      { name: 'CH 陈述', statement: '实数基数等于第一不可数基数。', },
      { name: '独立性', statement: '与 ZFC 独立（哥德尔/科恩）。', },
    ],
    steps: [
      { title: '定基数', body: '$\\aleph_0$ 与 $2^{\\aleph_0}$。', },
      { title: '写 CH', body: '两者之间无其他基数。', },
      { title: '看模型', body: 'L 中成立，力迫扩张中不成立。', },
      { title: '得独立', body: '两方向都可一致。', },
      { title: '推广', body: '广义连续统假设。', },
    ],
    pitfalls: ['说 CH 是错的：它只是独立。', '忽略一致性前提。', '混淆 CH 与广义 CH。'],
    example: { problem: 'CH 断言什么？', walkthrough: ['$2^{\\aleph_0}=\\aleph_1$。'], result: '实数基数为 aleph1' },
    moreExamples: [{ problem: 'CH 与 ZFC 的关系？', walkthrough: ['独立。'], result: '独立' }],
  },
  {
    id: 'axiom-of-choice-zorn', title: '选择公理、佐恩引理与良序定理', tag: '集合论', level: '竞赛',
    essence: '三条命题等价：选择公理、佐恩引理、良序定理。它们是现代数学最常被默认使用的非构造性工具。', definition: '选择公理：任意非空集合族存在选择函数。佐恩引理：偏序集每条链有上界则有极大元。良序定理：每个集合可良序化。',
    whenToUse: ['良序化集合', '证明极大元存在', '构造基与超滤子'],
    theorems: [
      { name: '三者等价', statement: 'AC ⇔ Zorn ⇔ 良序定理。', },
      { name: '佐恩用法', statement: '链有上界推出极大元。', },
    ],
    steps: [
      { title: '选工具', body: '看问题形状。', },
      { title: '用佐恩', body: '先验证链有上界。', },
      { title: '得极大元', body: '完成存在性证明。', },
      { title: '或用良序', body: '把集合排成良序后超限构造。', },
      { title: '注意非构造', body: '不给出具体对象。', },
    ],
    pitfalls: ['忘记验证链条件。', '把极大元当最大元。', '在需要构造性的场合误用。'],
    example: { problem: '佐恩引理要求偏序集的每条链满足什么？', walkthrough: ['有上界。'], result: '有上界' },
    moreExamples: [{ problem: '良序定理说的是？', walkthrough: ['每个集合可良序化。'], result: '可良序' }],
  },
  {
    id: 'normal-forms', title: '范式：合取范式与析取范式', tag: '数理逻辑', level: '进阶',
    essence: '任何命题公式都能化成「与或」或「或与」的标准形状，化完就能机械判断重言式与可满足性。', definition: '析取范式是合取子句的析取，合取范式是析取子句的合取。每个公式都有等价的两种范式。',
    whenToUse: ['判断重言式', '化简公式', '机械判定'],
    theorems: [
      { name: '范式存在', statement: '每个公式都有等价的 DNF 与 CNF。', },
      { name: '重言判据', statement: 'CNF 每个子句含互补文字即为重言式。', },
    ],
    steps: [
      { title: '消去蕴含', body: '用 $A\\to B$ 换 $\\neg A\\vee B$。', },
      { title: '内推否定', body: '用德摩根律。', },
      { title: '分配展开', body: '化成 DNF 或 CNF。', },
      { title: '合并化简', body: '去重复子句。', },
      { title: '判断性质', body: '看重言或可满足。', },
    ],
    pitfalls: ['把范式当唯一：同一公式的 DNF 不唯一。', '分配律用错方向。', '忘记消去蕴含。'],
    example: { problem: '每个公式都有等价的 CNF 吗？', walkthrough: ['都有。'], result: '都有' },
    moreExamples: [{ problem: 'CNF 怎么判断重言式？', walkthrough: ['每个子句都含互补文字对。'], result: '子句含互补对' }],
  },
  {
    id: 'propositional-completeness', title: '命题逻辑的完备性', tag: '数理逻辑', level: '竞赛',
    essence: '命题演算的语法可证与语义有效完全一致：有效的公式都能被证明，这就是完备性定理。', definition: '命题逻辑完备性指：若公式在所有赋值下为真，则它在演算中可证。配合可靠性得到可证等价于有效。',
    whenToUse: ['把语义结论转成证明', '验证演算强度', '理解元定理'],
    theorems: [
      { name: '可靠性', statement: '可证则有效。', },
      { name: '完备性', statement: '有效则可证。', },
    ],
    steps: [
      { title: '给公式', body: '待判定。', },
      { title: '查有效性', body: '真值表全真。', },
      { title: '用完备性', body: '存在证明。', },
      { title: '构造证明', body: '按范式逐子句证。', },
      { title: '得结论', body: '可证与有效一致。', },
    ],
    pitfalls: ['把完备性与哥德尔不完备混淆。', '忽略可靠性。', '认为所有逻辑都完备。'],
    example: { problem: '命题逻辑完备性说什么？', walkthrough: ['有效公式都可证。'], result: '有效→可证' },
    moreExamples: [{ problem: '完备性与可靠性合起来？', walkthrough: ['可证 ⇔ 有效。'], result: '等价' }],
  },
  {
    id: 'completeness-theorem', title: '一阶逻辑的完备性定理', tag: '数理逻辑', level: '竞赛',
    essence: '哥德尔完备性定理：一阶逻辑中可证的公式恰是普遍有效的公式。它保证一阶推理的语法与语义吻合。', definition: '一阶演算的完备性：若句子在所有模型中为真，则它可证。证明用亨金常元构造项模型。',
    whenToUse: ['判断一阶可证性', '理解模型存在', '连接语法语义'],
    theorems: [
      { name: '完备性', statement: '普遍有效则可证。', },
      { name: '模型存在引理', statement: '一致的句子集有模型。', },
    ],
    steps: [
      { title: '取一致的句子集', body: '不导出矛盾。', },
      { title: '扩充极大一致集', body: '加入每个句子的判定。', },
      { title: '加亨金常元', body: '为存在句见证。', },
      { title: '构造项模型', body: '用项解释语言。', },
      { title: '验证满足', body: '模型满足原句子集。', },
    ],
    pitfalls: ['把完备性与不完备性混为一谈：完备性讲一阶逻辑，不完备性讲算术理论。', '忽略一致性前提。', '构造项模型时漏亨金条件。'],
    example: { problem: '一阶逻辑完备性说什么？', walkthrough: ['普遍有效则可证。'], result: '有效→可证' },
    moreExamples: [{ problem: '完备性定理与不完备性定理矛盾吗？', walkthrough: ['不矛盾，对象不同。'], result: '不矛盾' }],
  },
  {
    id: 'arithmetization', title: '哥德尔编码：把语法变成算术', tag: '数理逻辑', level: '竞赛',
    essence: '哥德尔编码给每个符号、公式、证明分配自然数，使「可证」变成算术命题，从而让算术谈论自身。', definition: '编码是单射且可计算的映射，解码也递归。由此证明可证性谓词可在算术中表示。',
    whenToUse: ['构造自指', '证明不完备', '研究可表示性'],
    theorems: [
      { name: '编码可计算', statement: '符号串到数的映射递归。', },
      { name: '可表示性', statement: '递归关系可在算术中表示。', },
    ],
    steps: [
      { title: '给符号编号', body: '基本符号到数。', },
      { title: '编码序列', body: '用素数幂拼接。', },
      { title: '编码公式', body: '序列的编码。', },
      { title: '编码证明', body: '公式序列的编码。', },
      { title: '构造自指', body: '对角引理得「本句不可证」。', },
    ],
    pitfalls: ['把编码当任意映射：必须可计算且单射。', '忽略解码的递归性。', '混淆语法与元语言。'],
    example: { problem: '哥德尔编码的作用？', walkthrough: ['让算术能谈论公式与证明。'], result: '语法算术化' },
    moreExamples: [{ problem: '编码必须满足什么？', walkthrough: ['单射且可计算。'], result: '单射可计算' }],
  },
  {
    id: 'compactness-logic', title: '紧致性定理', tag: '数理逻辑', level: '竞赛',
    essence: '一阶句子集若每个有限子集都有模型，则整体有模型。它把无限问题化归为有限。', definition: '紧致性是一阶逻辑完备性的推论：有限可满足推出整体可满足。常用于构造非标准模型。',
    whenToUse: ['构造非标准模型', '证明不可定义性', '处理无限公理集'],
    theorems: [
      { name: '紧致性', statement: '有限可满足则整体可满足。', },
      { name: '非标准模型', statement: '加入无穷多个新常元得到超出自然数的模型。', },
    ],
    steps: [
      { title: '取句子集', body: '可能无限。', },
      { title: '验证有限子集', body: '每个都有模型。', },
      { title: '用紧致性', body: '整体有模型。', },
      { title: '读结论', body: '得到非标准对象。', },
      { title: '用不可定义性', body: '某些概念无法一阶刻画。', },
    ],
    pitfalls: ['忽略有限子集条件。', '把紧致性用于二阶逻辑（失效）。', '混淆可满足与有效。'],
    example: { problem: '紧致性定理说什么？', walkthrough: ['有限可满足推出整体可满足。'], result: '有限→整体' },
    moreExamples: [{ problem: '如何用它造非标准自然数模型？', walkthrough: ['加入新常元与无穷公理。'], result: '非标准模型' }],
  },
  {
    id: 'intuitionistic-logic', title: '直觉主义逻辑：拒绝排中律', tag: '数理逻辑', level: '竞赛',
    essence: '直觉主义逻辑不承认「非真即假」，证明必须构造。排中律不再是定理，双重否定消去失效。', definition: '直觉主义逻辑的语义用海廷代数或克里普克模型，真值不是两值而是「已构造」。',
    whenToUse: ['理解构造性数学', '分析证明助手', '比较经典与直觉'],
    theorems: [
      { name: '排中律不成立', statement: '$A\\vee\\neg A$ 不可普遍证明。', },
      { name: '双重否定', statement: '$\\neg\\neg A\\to A$ 失效。', },
    ],
    steps: [
      { title: '去掉排中', body: '从经典规则中删去。', },
      { title: '保留构造规则', body: '引入与消去仍有效。', },
      { title: '用克里普克模型', body: '节点表示知识状态。', },
      { title: '验证反例', body: '找不成立的经典定理。', },
      { title: '转译', body: '用双重否定翻译回经典。', },
    ],
    pitfalls: ['把直觉主义当经典逻辑的子系统而忽略语义差异。', '在证明助手里误用排中。', '混淆否定与失败。'],
    example: { problem: '直觉主义逻辑承认排中律吗？', walkthrough: ['不承认。'], result: '不承认' },
    moreExamples: [{ problem: '双重否定消去在直觉主义中？', walkthrough: ['不成立。'], result: '不成立' }],
  },

  {
    id: 'separation-replacement',
    title: '分离公理与替换公理',
    tag: '公理化集合论',
    level: '竞赛',
    essence: '分离只允许从已有集合筛选，替换允许把集合的元素逐个换成别的对象，两者共同限制集合的大小。',
    definition: '分离模式对每个公式给出一个子集；替换模式说若定义域是集合且每点像唯一，则像集也是集合。',
    whenToUse: ['合法构造集合', '证明集合存在', '避免悖论'],
    theorems: [
      { name: '分离限制概括', statement: '只能在已知集合内筛选元素。', formula: '\\{x\\in A:\\varphi(x)\\}' },
      { name: '替换给出像集', statement: '定义域是集合时像集仍是集合。' },
    ],
    steps: [
      { title: '明确母集', body: '先有已知集合。' },
      { title: '写公式', body: '给出筛选条件。' },
      { title: '得子集', body: '用分离模式。' },
      { title: '需要像集时', body: '验证定义域是集合。' },
      { title: '用替换', body: '像集为集合。' },
    ],
    pitfalls: ['用无限制概括导致罗素悖论', '把替换用于真类定义域', '忽略像的唯一性'],
    example: { problem: '「所有集合的集合」能用分离得到吗？', walkthrough: ['分离需要一个母集。', '没有比全体集合更大的母集。'], result: '不能' },
    moreExamples: [{ problem: '替换公理得到什么？', walkthrough: ['定义域的像集是集合。'], result: '像集是集合' }],
  },
  {
    id: 'transitive-models',
    title: '传递模型与一致性证明',
    tag: '公理化集合论',
    level: '竞赛',
    essence: '传递模型的元素仍是子集，因此受限公式在其中的真假与原宇宙一致，可用来证明相对一致性。',
    definition: '传递集满足对元素封闭：元素的元素仍在其中。传递模型是带属于关系的传递集。',
    whenToUse: ['证明相对一致性', '构造内模型', '研究独立性'],
    theorems: [
      { name: '传递性', statement: '元素封闭。', formula: 'x\\in M\\land y\\in x\\Rightarrow y\\in M' },
      { name: '绝对性', statement: '受限公式在传递模型中绝对。' },
    ],
    steps: [
      { title: '取集合 M', body: '候选模型。' },
      { title: '验传递', body: '检查元素封闭。' },
      { title: '逐条验公理', body: '外延、配对、并、幂集等。' },
      { title: '用绝对性', body: '简化判定。' },
      { title: '得相对一致', body: '若模型存在则 ZFC 一致。' },
    ],
    pitfalls: ['把任意模型当传递模型', '忽略绝对性只对受限公式成立', '混淆模型与真类'],
    example: { problem: '传递模型能证明 ZFC 的绝对一致性吗？', walkthrough: ['模型存在本身是假设。', '得到的是条件性结论。'], result: '只能相对一致' },
    moreExamples: [{ problem: '传递集的定义？', walkthrough: ['元素仍是子集。'], result: '元素封闭' }],
  },
  {
    id: 'inner-model-L',
    title: '可构造宇宙 L',
    tag: '公理化集合论',
    level: '竞赛',
    essence: 'L 只保留可定义集合，是包含所有序数的内模型，在其中选择公理与连续统假设都成立。',
    definition: 'L 由逐层加入可定义子集构造：每一层取上一层在集合论语言中可定义的子集。',
    whenToUse: ['证明 CH 相容', '研究内模型', '分析选择公理'],
    theorems: [
      { name: 'L 是内模型', statement: 'L 包含所有序数且满足 ZFC。' },
      { name: 'L 中 CH 成立', statement: '广义连续统假设在 L 中成立。' },
    ],
    steps: [
      { title: '从空集起', body: '构造第零层。' },
      { title: '取可定义子集', body: '后继层用可定义幂集。' },
      { title: '极限取并', body: '极限层取前面各层之并。' },
      { title: '取全体 L', body: '所有层的并。' },
      { title: '验证 ZFC 与 CH', body: '在 L 中逐条成立。' },
    ],
    pitfalls: ['把 L 当全体集合', '混淆可定义与可构造', '忘记序数仍全在 L 中'],
    example: { problem: 'L 满足选择公理吗？', walkthrough: ['L 中可定义良序。'], result: '满足' },
    moreExamples: [{ problem: 'CH 在 L 中成立吗？', walkthrough: ['哥德尔的结论。'], result: '成立' }],
  },
  {
    id: 'forcing-intro',
    title: '力迫法初步',
    tag: '公理化集合论',
    level: '竞赛',
    essence: '力迫法通过偏序集与脱殊滤子给模型添加新集合，从而证明 CH 的否定与 ZFC 相容。',
    definition: '力迫用偏序集（力迫概念）与脱殊滤子构造扩张；在 ccc 条件下基数保持不变。',
    whenToUse: ['证明 CH 独立', '构造扩张模型', '分析基数保持'],
    theorems: [
      { name: '脱殊扩张', statement: '脱殊滤子给出包含原模型的新模型。' },
      { name: 'ccc 保基数', statement: '可数反链条件下基数不塌缩。' },
    ],
    steps: [
      { title: '选力迫概念', body: '取偏序集。' },
      { title: '取脱殊滤子', body: '避开所有稠密集。' },
      { title: '构造扩张', body: '加入滤子生成的新集合。' },
      { title: '验基数保持', body: '用 ccc 条件。' },
      { title: '得独立', body: 'CH 在扩张中不成立。' },
    ],
    pitfalls: ['把任意子集当脱殊滤子', '忽略 ccc 导致基数塌缩', '认为力迫直接构造真模型'],
    example: { problem: '力迫法证明了什么？', walkthrough: ['构造 CH 失败的模型。'], result: 'CH 的否定相容' },
    moreExamples: [{ problem: '脱殊滤子要避开什么？', walkthrough: ['模型中的稠密集。'], result: '所有稠密集' }],
  },
  {
    id: 'large-cardinals',
    title: '大基数：不可达与可测',
    tag: '公理化集合论',
    level: '竞赛',
    essence: '大基数是 ZFC 无法证明其存在的强基数，给出比 ZFC 更强的一致性强度。',
    definition: '不可达基数是正则且强极限的不可数基数；可测基数上存在非主完全超滤子。',
    whenToUse: ['衡量一致性强度', '研究反射', '集合论前沿'],
    theorems: [
      { name: '不可达条件', statement: '正则且强极限。' },
      { name: '可测更强', statement: '可测基数蕴涵不可达基数存在。' },
    ],
    steps: [
      { title: '看正则性', body: '共尾度等于自身。' },
      { title: '看强极限', body: '更小基数的幂仍更小。' },
      { title: '得不可达', body: '两者兼具。' },
      { title: '加强到可测', body: '要求完全超滤子。' },
      { title: '看层级', body: '大基数形成强度阶梯。' },
    ],
    pitfalls: ['把不可达当普通极限基数', '忽略不可数要求', '认为 ZFC 能证其存在'],
    example: { problem: 'ZFC 能证明不可达基数存在吗？', walkthrough: ['大基数给出一致性强于 ZFC。'], result: '不能' },
    moreExamples: [{ problem: '不可达基数的两个条件？', walkthrough: ['正则加强极限。'], result: '正则且强极限' }],
  },
  {
    id: 'absoluteness',
    title: '绝对性：模型内外的真值',
    tag: '公理化集合论',
    level: '竞赛',
    essence: '绝对性说受限公式在传递模型中的真假与原宇宙一致，让相对一致性可以在模型内局部检查。',
    definition: '公式在 M 中绝对指对所有 M 中元素，其真假与在 V 中一致；受限公式对传递模型绝对。',
    whenToUse: ['简化模型验证', '证明相对一致', '构造内模型'],
    theorems: [
      { name: '受限绝对', statement: '量词有界的公式对传递模型绝对。' },
      { name: '向上绝对', statement: '部分公式向大模型保持为真。' },
    ],
    steps: [
      { title: '化到受限公式', body: '把量词限制在集合内。' },
      { title: '用绝对性', body: '在 M 中判定等同 V。' },
      { title: '处理非受限', body: '需要额外假设。' },
      { title: '得结论', body: '相对一致性。' },
      { title: '检查反例', body: '非受限公式可能不绝对。' },
    ],
    pitfalls: ['把绝对性用于任意公式', '忽略传递性前提', '混淆向上与向下绝对'],
    example: { problem: '哪类公式对传递模型绝对？', walkthrough: ['量词有界的公式。'], result: '受限（Δ₀）公式' },
    moreExamples: [{ problem: '绝对性用于什么？', walkthrough: ['局部验证模型。'], result: '相对一致性证明' }],
  },

  {
    id: 'duality-principle',
    title: '对偶原理：换个角度看同一个对象',
    tag: '现代数学',
    level: '进阶',
    essence: '对偶把对象换成它的「函数空间」或「反向结构」，把难题变成另一侧的简单问题。',
    definition: '对偶是范畴或结构之间的反变对应，满足两次作用回到原对象（在自然同构意义下）。',
    whenToUse: ['化简证明', '统一不同分支', '理解伴随'],
    theorems: [
      { name: '对偶对偶', statement: '自然同构意义下对偶两次回到原对象。' },
      { name: '线性对偶', statement: '有限维空间与其对偶同维。', formula: '\\dim V^*=\\dim V' },
    ],
    steps: [
      { title: '找对象', body: '确定要研究的结构。' },
      { title: '找函数空间', body: '取线性泛函或态射集。' },
      { title: '翻译问题', body: '把原问题改写为对偶侧。' },
      { title: '在对偶侧求解', body: '通常更简单。' },
      { title: '翻译回来', body: '用对偶性还原结论。' },
    ],
    pitfalls: ['把对偶当同构（一般只是自然同构）', '无限维时维数结论失效', '忽略反变方向'],
    example: { problem: '三维空间的对偶空间维数是多少？', walkthrough: ['有限维对偶同维。'], result: '3' },
    moreExamples: [{ problem: '线性规划的对偶问题变量数等于什么？', walkthrough: ['等于原问题约束数。'], result: '原约束个数' }],
  },
  {
    id: 'approximation-view',
    title: '逼近：分析学的统一方法',
    tag: '现代数学',
    level: '进阶',
    essence: '分析学几乎所有结论都来自「用简单对象逼近复杂对象」：多项式逼近连续函数、阶梯函数逼近可测函数。',
    definition: '逼近是用一族简单对象在给定范数或收敛意义下任意接近目标对象，并证明误差可控。',
    whenToUse: ['证明存在性', '数值计算', '把结论从简单类推广到一般类'],
    theorems: [
      { name: '魏尔斯特拉斯逼近', statement: '闭区间上连续函数可被多项式一致逼近。' },
      { name: '简单函数逼近', statement: '非负可测函数可被简单函数单调逼近。' },
    ],
    steps: [
      { title: '选简单类', body: '多项式、阶梯函数或有限元。' },
      { title: '定误差', body: '选择范数度量差距。' },
      { title: '构造逼近', body: '给出显式逼近序列。' },
      { title: '证收敛', body: '证明误差趋于零。' },
      { title: '推广结论', body: '先在简单类证明再取极限。' },
    ],
    pitfalls: ['把逐点收敛当一致收敛', '忽略逼近的构造性', '范数选错导致结论不成立'],
    example: { problem: '连续函数能否被多项式一致逼近？', walkthrough: ['魏尔斯特拉斯定理。'], result: '可以' },
    moreExamples: [{ problem: '可测函数用什么逼近？', walkthrough: ['简单函数。'], result: '简单函数' }],
  },
  {
    id: 'dimension-view',
    title: '维数与自由度',
    tag: '现代数学',
    level: '进阶',
    essence: '维数刻画「有多少个独立方向」。线性空间用基，流形用局部坐标，分形用豪斯多夫维数。',
    definition: '线性空间的维数是基的基数；拓扑流形的维数是局部欧氏空间的维数；分形维数用覆盖尺度刻画。',
    whenToUse: ['判断同构', '计算自由度', '识别约束'],
    theorems: [
      { name: '基的基数唯一', statement: '同一空间任意两组基等势。' },
      { name: '秩－零化度', statement: '像的维数加核的维数等于定义域维数。', formula: '\\dim V=\\dim\\ker T+\\dim\\mathrm{im}\\,T' },
    ],
    steps: [
      { title: '定空间', body: '线性、拓扑还是度量。' },
      { title: '找基或坐标卡', body: '确定独立方向。' },
      { title: '数独立参数', body: '去掉约束。' },
      { title: '用秩公式', body: '核对核与像。' },
      { title: '得维数', body: '读出不变量。' },
    ],
    pitfalls: ['把维数当元素个数', '忽略无穷维', '混淆拓扑维与豪斯多夫维'],
    example: { problem: '平面上的直线是几维流形？', walkthrough: ['局部同胚于区间。'], result: '1 维' },
    moreExamples: [{ problem: '秩－零化度定理说什么？', walkthrough: ['像维加核维等于定义域维。'], result: '维数守恒' }],
  },
  {
    id: 'probability-view',
    title: '概率视角：用测度看随机',
    tag: '现代数学',
    level: '进阶',
    essence: '概率就是总测度为 1 的测度空间。随机变量是可测函数，期望是积分，条件期望是投影。',
    definition: '概率空间是测度为一的测度空间；随机变量是到实数的可测函数；期望是关于该测度的积分。',
    whenToUse: ['统一概率与测度', '理解条件期望', '连接统计'],
    theorems: [
      { name: '期望即积分', statement: '期望是随机变量关于概率测度的积分。', formula: 'E[X]=\\int X\\,dP' },
      { name: '条件期望是投影', statement: '条件期望是 L² 到子空间的直交投影。' },
    ],
    steps: [
      { title: '建概率空间', body: '样本空间与概率测度。' },
      { title: '定随机变量', body: '验证可测性。' },
      { title: '算分布', body: '推前测度。' },
      { title: '算期望', body: '做积分。' },
      { title: '看条件期望', body: '理解为投影。' },
    ],
    pitfalls: ['把概率当组合计数', '忽略可测性', '混淆独立与不相关'],
    example: { problem: '随机变量的期望在测度论里是什么？', walkthrough: ['关于概率测度的积分。'], result: '积分' },
    moreExamples: [{ problem: '条件期望的几何意义？', walkthrough: ['L² 子空间上的直交投影。'], result: '投影' }],
  },
  {
    id: 'optimization-view',
    title: '优化视角：从极值到变分',
    tag: '现代数学',
    level: '进阶',
    essence: '优化是把问题写成「最小化某个泛函」，从求导找驻点到拉格朗日乘子、凸性与变分法。',
    definition: '优化问题由目标泛函与约束集组成；解满足一阶必要条件，凸问题中必要条件也是充分条件。',
    whenToUse: ['建模决策', '推导物理定律', '设计算法'],
    theorems: [
      { name: '一阶条件', statement: '内点极值处梯度为零。', formula: '\\nabla f=0' },
      { name: '凸性充分', statement: '凸函数驻点即全局最小。' },
    ],
    steps: [
      { title: '写目标', body: '明确最小化什么。' },
      { title: '写约束', body: '等式与不等式。' },
      { title: '用乘子', body: '构造拉格朗日函数。' },
      { title: '解一阶条件', body: '求驻点。' },
      { title: '验证最优', body: '凸性或二阶条件。' },
    ],
    pitfalls: ['忽略约束的正则性', '把驻点当最优点', '非凸问题直接用一阶条件'],
    example: { problem: '凸函数的驻点是什么？', walkthrough: ['凸性保证全局最优。'], result: '全局最小点' },
    moreExamples: [{ problem: '拉格朗日乘子处理什么约束？', walkthrough: ['等式约束。'], result: '等式约束' }],
  },
  {
    id: 'discrete-continuous-view',
    title: '离散与连续：两种世界观',
    tag: '现代数学',
    level: '进阶',
    essence: '离散结构（计数、图、算法）与连续结构（极限、微分、测度）互相支撑：离散化求解连续问题，连续化理解离散极限。',
    definition: '离散数学研究可数或有限结构，连续数学研究拓扑与测度结构；两者通过极限、嵌入与离散化相互转化。',
    whenToUse: ['选择建模方式', '数值离散化', '理解组合极限'],
    theorems: [
      { name: '离散逼近连续', statement: '连续问题可用网格离散逼近。' },
      { name: '连续极限', statement: '适当缩放下离散模型收敛到连续模型。' },
    ],
    steps: [
      { title: '判断对象', body: '本质是计数还是连续量。' },
      { title: '选建模', body: '离散或连续。' },
      { title: '做转化', body: '离散化或取极限。' },
      { title: '验收敛', body: '误差随尺度趋于零。' },
      { title: '回到原问题', body: '翻译结论。' },
    ],
    pitfalls: ['离散化后忘记误差分析', '把极限存在当显然', '尺度选择不当'],
    example: { problem: '数值积分属于哪种思路？', walkthrough: ['用离散和逼近积分。'], result: '离散逼近连续' },
    moreExamples: [{ problem: '随机游走的连续极限是什么？', walkthrough: ['适当缩放下趋于布朗运动。'], result: '布朗运动' }],
  },

  {
    id: 'cantor-set',
    title: '康托尔集：测度为零却不可数',
    tag: '实分析',
    level: '竞赛',
    essence: '康托尔集通过不断挖去中间三分之一得到：总长度为零，但点数与实数一样多，是反直觉的经典例子。',
    definition: '康托尔集是 [0,1] 中三进制展开只含 0 和 2 的点集，等价于反复去掉各区间中间三分之一的极限。',
    whenToUse: ['构造反例', '理解零测集', '研究分形'],
    theorems: [
      { name: '测度为零', statement: '康托尔集的勒贝格测度为零。' },
      { name: '基数连续统', statement: '康托尔集与实数等势。' },
    ],
    steps: [
      { title: '从区间起', body: '取 [0,1]。' },
      { title: '挖中间段', body: '去掉中间三分之一。' },
      { title: '反复迭代', body: '每步长度乘 2/3。' },
      { title: '取极限', body: '剩余点集即康托尔集。' },
      { title: '看两个结论', body: '测度趋于零，点数仍不可数。' },
    ],
    pitfalls: ['以为零测集一定可数', '把每步剩余长度当最终测度', '混淆康托尔集与康托尔函数'],
    example: { problem: '康托尔集的测度是多少？', walkthrough: ['长度 $(2/3)^n\\to0$。'], result: '0' },
    moreExamples: [{ problem: '康托尔集可数吗？', walkthrough: ['三进制 0/2 序列对应实数。'], result: '不可数' }],
  },
  {
    id: 'borel-sets',
    title: '博雷尔集：从开集生成的 σ 代数',
    tag: '实分析',
    level: '进阶',
    essence: '博雷尔集是包含所有开集的最小 σ 代数，可测集比它多，但实际遇到的集合几乎都是博雷尔集。',
    definition: '博雷尔 σ 代数是包含全部开集的最小 σ 代数，由开集经可列并、交、补生成。',
    whenToUse: ['判断可测性', '构造反例', '研究描述集合论'],
    theorems: [
      { name: '层级结构', statement: '博雷尔集按生成复杂度分成 Σ、Π 层级。' },
      { name: '包含关系', statement: '博雷尔集都是勒贝格可测集。' },
    ],
    steps: [
      { title: '从开集起', body: '开集生成。' },
      { title: '取补与可列并', body: '闭包运算。' },
      { title: '得 σ 代数', body: '最小封闭族。' },
      { title: '看层级', body: '按运算次数分层。' },
      { title: '判可测', body: '博雷尔集必可测。' },
    ],
    pitfalls: ['以为可测集都是博雷尔集', '混淆 σ 代数与拓扑', '忽略可列性'],
    example: { problem: '闭区间是博雷尔集吗？', walkthrough: ['它是开区间的补。'], result: '是' },
    moreExamples: [{ problem: '博雷尔集一定可测吗？', walkthrough: ['勒贝格 σ 代数包含博雷尔 σ 代数。'], result: '一定' }],
  },
  {
    id: 'egorov-lusin',
    title: '叶果洛夫定理与鲁津定理',
    tag: '实分析',
    level: '竞赛',
    essence: '可测函数几乎就是连续函数：叶果洛夫说几乎处处一致收敛，鲁津说可去掉小测度集后连续。',
    definition: '叶果洛夫：有限测度集上几乎处处收敛的函数列，对任意 ε 去掉小测度集后一致收敛。鲁津：可测函数在去掉小测度集后连续。',
    whenToUse: ['把可测化为连续', '证明逼近定理', '理解三种收敛'],
    theorems: [
      { name: '叶果洛夫定理', statement: '几乎处处收敛几乎一致收敛（有限测度）。' },
      { name: '鲁津定理', statement: '可测函数几乎连续。' },
    ],
    steps: [
      { title: '验测度有限', body: '叶果洛夫需要有限测度。' },
      { title: '去掉异常集', body: '挖掉测度小于 ε 的集合。' },
      { title: '在剩余集上', body: '得到一致收敛或连续。' },
      { title: '取极限', body: 'ε 任意小。' },
      { title: '得结论', body: '几乎处处/几乎连续。' },
    ],
    pitfalls: ['忘记有限测度条件', '把几乎一致当处处一致', '混淆三种收敛'],
    example: { problem: '叶果洛夫定理要求测度有限吗？', walkthrough: ['需要，否则反例存在。'], result: '需要' },
    moreExamples: [{ problem: '鲁津定理说明可测函数怎样？', walkthrough: ['去掉小集后连续。'], result: '几乎连续' }],
  },
  {
    id: 'absolute-continuity',
    title: '绝对连续与牛顿－莱布尼茨公式',
    tag: '实分析',
    level: '竞赛',
    essence: '绝对连续函数恰是不定积分：它几乎处处可导，且导数可积并还原原函数，这是微积分基本定理的精确版本。',
    definition: '绝对连续指对任意 ε 存在 δ，使任意有限个互不重叠区间长度和小于 δ 时函数增量绝对值之和小于 ε。',
    whenToUse: ['判断不定积分', '使用牛顿-莱布尼茨', '研究测度'],
    theorems: [
      { name: '绝对连续即不定积分', statement: '绝对连续函数几乎处处可导且等于其导数的积分。' },
      { name: '绝对连续强于有界变差', statement: '绝对连续蕴含有界变差。' },
    ],
    steps: [
      { title: '验绝对连续', body: '用 ε-δ 定义。' },
      { title: '求导', body: '几乎处处可导。' },
      { title: '积分导数', body: '还原函数值。' },
      { title: '比较端点', body: '用牛顿-莱布尼茨。' },
      { title: '判反例', body: '康托尔函数连续但非绝对连续。' },
    ],
    pitfalls: ['把连续当绝对连续', '把有界变差当绝对连续', '忽略几乎处处的限定'],
    example: { problem: '康托尔函数绝对连续吗？', walkthrough: ['它导数为零几乎处处但非常值。'], result: '不绝对连续' },
    moreExamples: [{ problem: '绝对连续与有界变差的关系？', walkthrough: ['绝对连续推出有界变差。'], result: '更强' }],
  },
  {
    id: 'lp-spaces',
    title: 'L^p 空间：函数的大小',
    tag: '实分析',
    level: '竞赛',
    essence: 'L^p 空间用积分度量函数大小，是泛函分析的舞台：完备、有对偶、有不等式结构。',
    definition: 'L^p 是可测函数中 p 次幂可积的等价类空间，范数为积分 p 次幂的 p 次根。',
    whenToUse: ['研究函数空间', '用不等式估计', '进入泛函分析'],
    theorems: [
      { name: '赫尔德不等式', statement: '共轭指数的乘积可积。', formula: '\\|fg\\|_1\\le\\|f\\|_p\\|g\\|_q' },
      { name: 'L^p 完备', statement: 'L^p 是巴拿赫空间。' },
    ],
    steps: [
      { title: '定 p', body: '选择指数。' },
      { title: '验可积', body: '检查 p 次幂积分有限。' },
      { title: '算范数', body: '开 p 次根。' },
      { title: '用不等式', body: '赫尔德与闵可夫斯基。' },
      { title: '看完备性', body: '柯西列收敛。' },
    ],
    pitfalls: ['把 L^p 当函数而非等价类', '混淆 p<1 的情形', '忽略测度有限性对嵌入的影响'],
    example: { problem: 'L² 的范数由什么给出？', walkthrough: ['平方积分再开根。'], result: '平方可积' },
    moreExamples: [{ problem: '赫尔德不等式的条件？', walkthrough: ['共轭指数 1/p+1/q=1。'], result: '共轭指数' }],
  },
  {
    id: 'littlewood-principles',
    title: '利特尔伍德三大原理',
    tag: '实分析',
    level: '进阶',
    essence: '三大原理用一句话概括实变函数：可测集近似开集，可测函数近似连续，收敛近似一致。',
    definition: '三大原理是启发式总结：测度论中「几乎」处处可以用「差一个小集」来理解。',
    whenToUse: ['建立直觉', '选择逼近工具', '组织证明思路'],
    theorems: [
      { name: '第一原理', statement: '可测集几乎就是有限个区间的并。' },
      { name: '第二原理', statement: '可测函数几乎就是连续函数。' },
    ],
    steps: [
      { title: '看对象', body: '集、函数还是收敛。' },
      { title: '选逼近', body: '开集、连续函数或一致收敛。' },
      { title: '去小集', body: '误差控制在 ε 内。' },
      { title: '在剩余部分工作', body: '性质变好。' },
      { title: '取极限', body: '回到原对象。' },
    ],
    pitfalls: ['把启发式当定理直接引用', '忘记「几乎」的代价是小集', '忽略测度有限性'],
    example: { problem: '三大原理中「函数」对应哪条？', walkthrough: ['鲁津定理：几乎连续。'], result: '第二原理' },
    moreExamples: [{ problem: '「收敛」对应哪条？', walkthrough: ['叶果洛夫：几乎一致。'], result: '第三原理' }],
  },

  {
    id: 'elementary-functions',
    title: '初等复函数：指数、对数、幂与三角',
    tag: '复分析',
    level: '进阶',
    essence: '复指数以 2πi 为周期，导致复对数多值、幂函数多值，这是复分析与实分析最大的差别。',
    definition: '复指数由欧拉公式定义；复对数是指数的反函数，因周期性而多值；幂函数与三角函数由指数与对数表示。',
    whenToUse: ['计算复对数', '分析多值性', '研究初等映射'],
    theorems: [
      { name: '指数周期', statement: '复指数以 2πi 为周期。', formula: 'e^{z+2\\pi i}=e^z' },
      { name: '对数多值', statement: '复对数相差 2πi 的整数倍。' },
    ],
    steps: [
      { title: '写指数', body: '用欧拉公式展开。' },
      { title: '求对数', body: '取模与辐角。' },
      { title: '处理多值', body: '加 2kπi。' },
      { title: '定分支', body: '限制辐角范围。' },
      { title: '算幂与三角', body: '用指数表示。' },
    ],
    pitfalls: ['把复对数当单值', '忽略分支切割', '把 ln 的实数性质直接搬过来'],
    example: { problem: '复对数的主值辐角范围？', walkthrough: ['取 $(-\\pi,\\pi]$。'], result: '(-\\pi,\\pi]' },
    moreExamples: [{ problem: '复指数的周期？', walkthrough: ['$2\\pi i$。'], result: '2\\pi i' }],
  },
  {
    id: 'cauchy-riemann',
    title: '柯西－黎曼条件与解析性',
    tag: '复分析',
    level: '进阶',
    essence: '复可导比实可导强得多：它要求实部虚部满足 C-R 方程，从而推出解析函数的刚性。',
    definition: '函数在点解析指在该点某邻域内复可导。C-R 方程是复可导的必要条件，加上偏导连续则为充分条件。',
    whenToUse: ['判断解析性', '求导数', '判定调和'],
    theorems: [
      { name: 'C-R 方程', statement: '复可导处实虚部满足偏导关系。', formula: 'u_x=v_y,\\;u_y=-v_x' },
      { name: '充分条件', statement: '偏导连续且满足 C-R 则解析。' },
    ],
    steps: [
      { title: '写实虚部', body: '$f=u+iv$。' },
      { title: '算四个偏导', body: '$u_x,u_y,v_x,v_y$。' },
      { title: '验 C-R', body: '两式是否成立。' },
      { title: '看连续性', body: '偏导连续则充分。' },
      { title: '得导数', body: '导数等于 $u_x+iv_x$。' },
    ],
    pitfalls: ['把 C-R 当充分条件（需连续性）', '只验一点不验邻域', '混淆可导与解析'],
    example: { problem: '$f(z)=\\bar z$ 解析吗？', walkthrough: ['$u=x,v=-y$。', '$u_x=1\\ne v_y=-1$。'], result: '不解析' },
    moreExamples: [{ problem: '解析函数的导数公式？', walkthrough: ['$u_x+iv_x$。'], result: 'u_x+iv_x' }],
  },
  {
    id: 'contour-integral',
    title: '复积分与柯西定理',
    tag: '复分析',
    level: '进阶',
    essence: '解析函数沿闭路积分为零（柯西定理），这是复分析所有结论的源头。',
    definition: '复积分沿有向曲线对 $f\\,dz$ 求和。柯西定理说解析函数在单连通区域内沿闭路积分为零。',
    whenToUse: ['计算积分', '判断路径无关', '构造原函数'],
    theorems: [
      { name: '柯西定理', statement: '解析函数沿简单闭路积分为零。', formula: '\\oint f\\,dz=0' },
      { name: '路径无关', statement: '单连通区域内积分只依赖端点。' },
    ],
    steps: [
      { title: '看解析性', body: '区域内是否解析。' },
      { title: '看单连通', body: '有无洞。' },
      { title: '参数化', body: '或直接用定理。' },
      { title: '算积分', body: '化为实积分。' },
      { title: '验证', body: '闭路应为零。' },
    ],
    pitfalls: ['区域有洞仍用柯西定理', '忘记方向', '把路径无关用于多连通区域'],
    example: { problem: '$\\oint z^2\\,dz$ 沿单位圆等于多少？', walkthrough: ['$z^2$ 解析。'], result: '0' },
    moreExamples: [{ problem: '区域有洞时闭路积分一定为零吗？', walkthrough: ['不一定。'], result: '不一定' }],
  },
  {
    id: 'series-laurent',
    title: '幂级数与洛朗展开',
    tag: '复分析',
    level: '竞赛',
    essence: '解析函数可展成幂级数；在奇点附近可展成含负幂的洛朗级数，负幂系数决定留数。',
    definition: '泰勒级数在圆盘内展开；洛朗级数在圆环内展开，含负幂项，主部刻画奇点性质。',
    whenToUse: ['求展开', '判断奇点类型', '算留数'],
    theorems: [
      { name: '泰勒定理', statement: '圆盘内解析函数可展成幂级数。' },
      { name: '洛朗定理', statement: '圆环内解析函数可展成双边级数。' },
    ],
    steps: [
      { title: '定区域', body: '圆盘还是圆环。' },
      { title: '找奇点', body: '确定展开中心。' },
      { title: '写级数', body: '泰勒或洛朗。' },
      { title: '读主部', body: '负幂项。' },
      { title: '取系数', body: '留数为负一次项系数。' },
    ],
    pitfalls: ['在奇点处硬套泰勒', '洛朗展开区间搞错', '把主部当留数'],
    example: { problem: '$e^z/z$ 在 0 处的留数？', walkthrough: ['洛朗展开 $1/z+1+\\cdots$。'], result: '1' },
    moreExamples: [{ problem: '洛朗级数的负一次项系数是什么？', walkthrough: ['留数。'], result: '留数' }],
  },
  {
    id: 'singularity-classification',
    title: '孤立奇点的分类',
    tag: '复分析',
    level: '进阶',
    essence: '孤立奇点分可去、极点、本性三类，由洛朗主部决定，直接决定留数计算方式。',
    definition: '主部为零是可去奇点；主部有限项是极点；主部无限项是本性奇点。',
    whenToUse: ['判断奇点', '选留数公式', '分析函数行为'],
    theorems: [
      { name: '可去判据', statement: '有界且孤立则奇点可去。' },
      { name: '极点判据', statement: '极点阶数等于主部最高负幂。' },
    ],
    steps: [
      { title: '找孤立奇点', body: '分母零点或未定义点。' },
      { title: '展开洛朗', body: '看主部。' },
      { title: '判类型', body: '零项/有限项/无限项。' },
      { title: '定阶数', body: '极点阶数。' },
      { title: '算留数', body: '按类型选公式。' },
    ],
    pitfalls: ['把本性当极点', '非孤立奇点套用分类', '阶数数错'],
    example: { problem: '$1/z^2$ 在 0 处是什么奇点？', walkthrough: ['主部最高负幂为 2。'], result: '二阶极点' },
    moreExamples: [{ problem: '$e^{1/z}$ 在 0 处？', walkthrough: ['主部无限项。'], result: '本性奇点' }],
  },
  {
    id: 'argument-principle',
    title: '辐角原理与儒歇定理',
    tag: '复分析',
    level: '竞赛',
    essence: '辐角原理用积分数零极点；儒歇定理比较两个函数，把难算的零点个数转化为好算的。',
    definition: '辐角原理：闭路内零点数减极点数等于辐角变化除以 2π。儒歇：边界上 |g|<|f| 时 f 与 f+g 零点数相同。',
    whenToUse: ['数零点', '证明根全在区域内', '稳定性分析'],
    theorems: [
      { name: '辐角原理', statement: '零点数减极点数等于绕数。', formula: 'N-P=\\frac{1}{2\\pi i}\\oint\\frac{f\\prime}{f}dz' },
      { name: '儒歇定理', statement: '边界上 |g|<|f| 则零点数相同。' },
    ],
    steps: [
      { title: '选围道', body: '包围目标区域。' },
      { title: '找主导项', body: '边界上最大项。' },
      { title: '用儒歇', body: '比较大小。' },
      { title: '数主导项零点', body: '通常容易。' },
      { title: '得结论', body: '原函数零点数。' },
    ],
    pitfalls: ['边界不等式方向搞反', '忘记计重数', '围道穿过零点'],
    example: { problem: '$z^7+5z^3+1$ 在单位圆内有几个零点？', walkthrough: ['边界上 $|5z^3|=5>|z^7+1|\\le2$。', '$5z^3$ 有三个零点。'], result: '3 个' },
    moreExamples: [{ problem: '儒歇定理比较什么？', walkthrough: ['边界上两函数模长。'], result: '模长大小' }],
  },
  {
    id: 'conformal-mapping',
    title: '共形映射与分式线性变换',
    tag: '复分析',
    level: '竞赛',
    essence: '解析且导数非零的映射保角。分式线性变换把圆与直线映成圆与直线，是共形映射的基本砖块。',
    definition: '共形映射是保角的解析映射。分式线性变换由 $\\frac{az+b}{cz+d}$ 给出，$ad-bc\\ne0$。',
    whenToUse: ['化简区域', '解边值问题', '构造映射'],
    theorems: [
      { name: '保角性', statement: '导数非零处保角。' },
      { name: '分式线性保圆', statement: '把圆与直线映成圆或直线。' },
    ],
    steps: [
      { title: '看区域', body: '源与目标区域。' },
      { title: '选变换', body: '平移旋转缩放或反演。' },
      { title: '定参数', body: '边界对应三点。' },
      { title: '验保角', body: '导数非零。' },
      { title: '求解', body: '在简化区域上做。' },
    ],
    pitfalls: ['把导数零点当共形点', '忽略分式线性的奇点', '边界对应点顺序错'],
    example: { problem: '分式线性变换把直线映成什么？', walkthrough: ['圆或直线。'], result: '圆或直线' },
    moreExamples: [{ problem: '共形映射的条件？', walkthrough: ['解析且导数非零。'], result: '解析且导数非零' }],
  },
  {
    id: 'harmonic-functions',
    title: '调和函数与平均值性质',
    tag: '复分析',
    level: '竞赛',
    essence: '解析函数的实部虚部都是调和函数；调和函数满足平均值性质，由边界值唯一确定。',
    definition: '调和函数是拉普拉斯方程为零的二阶连续可微函数。解析函数的实部与虚部都调和。',
    whenToUse: ['解拉普拉斯方程', '用平均值性质', '研究边值问题'],
    theorems: [
      { name: '平均值性质', statement: '圆心的值等于圆周平均值。' },
      { name: '最大原理', statement: '非常数调和函数内部无最大最小值。' },
    ],
    steps: [
      { title: '验调和', body: '算拉普拉斯。' },
      { title: '找共轭调和', body: '用 C-R 积分。' },
      { title: '用平均值', body: '圆心等于圆周平均。' },
      { title: '用边界值', body: '狄利克雷问题唯一。' },
      { title: '得解', body: '泊松积分表示。' },
    ],
    pitfalls: ['把调和当解析（缺共轭）', '平均性质只在圆上', '忽略区域单连通'],
    example: { problem: '$u=x^2-y^2$ 是调和函数吗？', walkthrough: ['$u_{xx}+u_{yy}=2-2=0$。'], result: '是' },
    moreExamples: [{ problem: '解析函数与调和函数的关系？', walkthrough: ['实虚部都调和。'], result: '实虚部调和' }],
  },

  {
    id: 'outer-measure',
    title: '外测度：从覆盖到测度',
    tag: '测度论',
    level: '竞赛',
    essence: '外测度用「用可数开区间覆盖」定义大小，它对所有集合都有定义，但只有满足卡拉泰奥多里条件的集合才可测。',
    definition: '外测度是定义在幂集上、单调且可列次可加的集函数。集合可测指它把任意测试集「干净地切开」。',
    whenToUse: ['构造测度', '证明可测性', '处理不可测集'],
    theorems: [
      { name: '卡拉泰奥多里条件', statement: '对任意测试集 E，内外两部分测度相加等于原测度。', formula: 'm^*(E)=m^*(E\\cap A)+m^*(E\\setminus A)' },
      { name: '可测集成 σ 代数', statement: '满足该条件的集合构成 σ 代数且外测度在其上可列可加。' },
    ],
    steps: [
      { title: '定义外测度', body: '取覆盖的下确界。' },
      { title: '验证条件', body: '用测试集切开。' },
      { title: '得可测性', body: '满足条件即可测。' },
      { title: '验可列可加', body: '在不交集上求和。' },
      { title: '得测度', body: '限制到 σ 代数上。' },
    ],
    pitfalls: ['把外测度当测度（它只是次可加）', '忽略测试集的任意性', '以为所有集合都可测'],
    example: { problem: '外测度对任意集合都有定义吗？', walkthrough: ['定义在幂集上。'], result: '有定义' },
    moreExamples: [{ problem: '外测度是可列可加的吗？', walkthrough: ['一般只是次可加。'], result: '次可加' }],
  },
  {
    id: 'borel-regularity',
    title: '博雷尔测度的正则性',
    tag: '测度论',
    level: '竞赛',
    essence: '正则性说可测集可以被开集从外包、被闭集从内逼：$m(A)=\\inf m(U)=\\sup m(K)$，这是把测度问题拓扑化的关键。',
    definition: '外正则指测度等于包含它的开集测度下确界；内正则指等于内部紧集测度上确界。有限博雷尔测度在好空间上正则。',
    whenToUse: ['逼近可测集', '证明鲁津定理', '构造测度'],
    theorems: [
      { name: '外正则', statement: '可测集可由开集逼近。' },
      { name: '内正则', statement: '可由紧集逼近（σ 紧空间）。' },
    ],
    steps: [
      { title: '取可测集', body: '目标集合。' },
      { title: '外包开集', body: '构造测度接近的开集。' },
      { title: '内逼紧集', body: '在补集上做外包。' },
      { title: '取极限', body: '误差趋于零。' },
      { title: '得正则性', body: '两侧夹逼。' },
    ],
    pitfalls: ['对任意测度都用正则性', '忽略 σ 有限条件', '混淆内外正则'],
    example: { problem: '有限测度下可测集能被开集逼近吗？', walkthrough: ['外正则。'], result: '能' },
    moreExamples: [{ problem: '正则性依赖什么？', walkthrough: ['空间的拓扑性质与测度有限性。'], result: '拓扑与有限性' }],
  },
  {
    id: 'product-fubini',
    title: '乘积测度与 Fubini 定理',
    tag: '测度论',
    level: '竞赛',
    essence: '乘积测度由矩形生成，Fubini 与托内利给出交换积分次序的条件：非负总能换，一般需可积。',
    definition: '乘积 σ 代数由可测矩形生成，乘积测度在矩形上等于因子测度之积。',
    whenToUse: ['算重积分', '交换求和与积分', '概率中的独立性'],
    theorems: [
      { name: '托内利', statement: '非负可测函数可交换积分次序。' },
      { name: 'Fubini', statement: '可积函数可交换次序且几乎处处定义切片。' },
    ],
    steps: [
      { title: '验可测性', body: '函数关于乘积 σ 代数可测。' },
      { title: '定符号', body: '非负还是可积。' },
      { title: '选定理', body: '托内利或 Fubini。' },
      { title: '算内层', body: '先积一个变量。' },
      { title: '算外层', body: '得结果。' },
    ],
    pitfalls: ['对变号函数直接用托内利', '忘记几乎处处的限定', '把乘积测度当任意测度'],
    example: { problem: '非负可测函数能交换积分次序吗？', walkthrough: ['托内利定理。'], result: '能' },
    moreExamples: [{ problem: 'Fubini 对可积性有什么要求？', walkthrough: ['绝对可积。'], result: '绝对可积' }],
  },
  {
    id: 'lebesgue-decomposition',
    title: '勒贝格分解：把测度拆成两块',
    tag: '测度论',
    level: '竞赛',
    essence: '任何 σ 有限测度都能唯一拆成「关于参考测度绝对连续的部分」加「集中在零测集上的奇异部分」。',
    definition: '勒贝格分解：$\\nu=\\nu_{ac}+\\nu_s$，其中前者绝对连续于 $\\mu$，后者奇异。',
    whenToUse: ['分析测度结构', '用 Radon-Nikodym', '概率密度'],
    theorems: [
      { name: '分解存在唯一', statement: 'σ 有限时勒贝格分解存在且唯一。' },
      { name: '绝对连续部分有密度', statement: '由 Radon-Nikodym 给出。', formula: '\\nu_{ac}=f\\,\\mu' },
    ],
    steps: [
      { title: '查绝对连续', body: '零测集是否仍为零。' },
      { title: '找奇异部分', body: '集中在零测集上。' },
      { title: '分解', body: '拆成两块。' },
      { title: '求密度', body: '对绝对连续部分用 RN。' },
      { title: '验唯一', body: '用零测集论证。' },
    ],
    pitfalls: ['把奇异部分当绝对连续', '忽略唯一性条件', '忘记 σ 有限'],
    example: { problem: '离散分布相对勒贝格测度奇异吗？', walkthrough: ['集中在可数集（零测）。'], result: '奇异' },
    moreExamples: [{ problem: '绝对连续部分的密度由什么定理给出？', walkthrough: ['Radon-Nikodym。'], result: 'RN 定理' }],
  },
  {
    id: 'complex-measures',
    title: '复测度与全变差',
    tag: '测度论',
    level: '竞赛',
    essence: '复测度取复值，用全变差衡量大小；有界变差的复测度与有界线性泛函一一对应（Riesz 表示）。',
    definition: '复测度是可列可加的复值集函数。全变差是对任意分割求绝对值之和的上确界。',
    whenToUse: ['泛函分析', 'Riesz 表示', '分析测度空间'],
    theorems: [
      { name: '全变差是正测度', statement: '全变差本身是有限正测度。' },
      { name: 'Riesz 表示', statement: '连续函数空间的对偶是有界复测度。' },
    ],
    steps: [
      { title: '验可列可加', body: '复值集函数。' },
      { title: '算全变差', body: '取分割上确界。' },
      { title: '判有界', body: '全变差有限。' },
      { title: '用表示定理', body: '对应线性泛函。' },
      { title: '得结论', body: '对偶空间刻画。' },
    ],
    pitfalls: ['把复测度当正测度', '忽略全变差的有限性', '混淆复测度与符号测度'],
    example: { problem: '复测度的「大小」用什么衡量？', walkthrough: ['全变差。'], result: '全变差' },
    moreExamples: [{ problem: '连续函数空间的对偶是什么？', walkthrough: ['有界复测度。'], result: '复测度' }],
  },

  {
    id: 'hahn-banach',
    title: '哈恩－巴拿赫定理：延拓线性泛函',
    tag: '泛函分析',
    level: '竞赛',
    essence: '哈恩－巴拿赫把子空间上的有界泛函延拓到全空间且不增范数，是分离定理与对偶理论的基石。',
    definition: '设子空间上的泛函被次线性泛函控制，则它可延拓到全空间并保持该控制；赋范空间情形下保范延拓。',
    whenToUse: ['构造对偶元素', '证明分离定理', '研究弱拓扑'],
    theorems: [
      { name: '延拓定理', statement: '受控泛函可延拓到全空间。' },
      { name: '保范延拓', statement: '赋范空间上泛函可保范延拓。', formula: '\\|F\\|=\\|f\\|' },
    ],
    steps: [
      { title: '定子空间', body: '已知泛函的定义域。' },
      { title: '找控制泛函', body: '次线性或范数。' },
      { title: '逐点延拓', body: '用佐恩引理取极大元。' },
      { title: '验控制', body: '延拓后仍被控制。' },
      { title: '得保范', body: '两侧不等式相等。' },
    ],
    pitfalls: ['把延拓当唯一（一般不唯一）', '忽略控制条件', '在非完备空间误用某些推论'],
    example: { problem: '保范延拓存在吗？', walkthrough: ['赋范空间上总存在。'], result: '存在' },
    moreExamples: [{ problem: '哈恩－巴拿赫能证明对偶空间非平凡吗？', walkthrough: ['是的，至少存在非零泛函。'], result: '能' }],
  },
  {
    id: 'open-mapping',
    title: '开映射定理与闭图像定理',
    tag: '泛函分析',
    level: '竞赛',
    essence: '巴拿赫空间之间的满射有界线性算子必为开映射，由此推出逆算子有界与闭图像定理。',
    definition: '开映射把开集映成开集。闭图像定理说定义域完备时，闭图像的有界线性算子连续。',
    whenToUse: ['证明逆算子有界', '判断连续性', '分析算子方程'],
    theorems: [
      { name: '开映射定理', statement: '满射有界线性算子把开集映成开集。' },
      { name: '闭图像定理', statement: '闭图像推出算子连续（完备空间）。' },
    ],
    steps: [
      { title: '验完备性', body: '两个空间都需巴拿赫。' },
      { title: '验满射', body: '开映射定理需要。' },
      { title: '得开映射', body: '开集映开集。' },
      { title: '推逆有界', body: '逆算子连续。' },
      { title: '或验闭图像', body: '用序列判闭。' },
    ],
    pitfalls: ['忽略满射条件', '在非完备空间使用', '把闭图像当闭算子'],
    example: { problem: '双射有界线性算子的逆一定连续吗？', walkthrough: ['巴拿赫空间上由开映射定理保证。'], result: '连续' },
    moreExamples: [{ problem: '闭图像定理要求空间？', walkthrough: ['完备（巴拿赫）。'], result: '完备' }],
  },
  {
    id: 'riesz-representation',
    title: '希尔伯特空间的 Riesz 表示',
    tag: '泛函分析',
    level: '竞赛',
    essence: '希尔伯特空间上每个有界线性泛函都是内积，这使空间与对偶自然等距同构。',
    definition: '对任意有界线性泛函存在唯一向量，使泛函值等于与该向量的内积，且范数相等。',
    whenToUse: ['把泛函变成向量', '解变分问题', '研究对偶'],
    theorems: [
      { name: '表示定理', statement: '泛函等于与某唯一向量的内积。', formula: 'f(x)=\\langle x,y\\rangle' },
      { name: '等距', statement: '泛函范数等于表示向量的范数。' },
    ],
    steps: [
      { title: '取泛函', body: '有界线性泛函。' },
      { title: '看核', body: '核是闭子空间。' },
      { title: '取正交补', body: '找一维方向。' },
      { title: '构造向量', body: '归一化后得到表示向量。' },
      { title: '验等距', body: '范数相等。' },
    ],
    pitfalls: ['把表示向量当唯一但依赖于内积', '忽略完备性', '在非希尔伯特空间照搬'],
    example: { problem: '希尔伯特空间的对偶是什么？', walkthrough: ['与原空间等距同构。'], result: '自身（等距同构）' },
    moreExamples: [{ problem: '表示定理需要空间完备吗？', walkthrough: ['需要希尔伯特空间。'], result: '需要' }],
  },
  {
    id: 'orthonormal-basis',
    title: '标准正交基与傅里叶展开',
    tag: '泛函分析',
    level: '进阶',
    essence: '可分希尔伯特空间都有可数标准正交基，任何向量按基展开，这就是抽象的傅里叶级数。',
    definition: '标准正交系是两两正交且范数为一的向量族；完备正交系使每个向量等于其傅里叶级数。',
    whenToUse: ['展开函数', '计算投影', '理解傅里叶级数'],
    theorems: [
      { name: '帕塞瓦尔等式', statement: '范数平方等于系数平方和。', formula: '\\|x\\|^2=\\sum|\\langle x,e_n\\rangle|^2' },
      { name: '完备性等价', statement: '正交系完备当且仅当张成稠密。' },
    ],
    steps: [
      { title: '取正交系', body: '验证两两正交且单位。' },
      { title: '算系数', body: '内积投影。' },
      { title: '有限和', body: '部分和是最佳逼近。' },
      { title: '验完备', body: '是否张成稠密。' },
      { title: '用帕塞瓦尔', body: '范数等于系数平方和。' },
    ],
    pitfalls: ['把正交系当基（可能不完备）', '忽略可分的必要性', '混淆有限与无限展开'],
    example: { problem: '帕塞瓦尔等式说什么？', walkthrough: ['范数平方等于系数平方和。'], result: '能量守恒' },
    moreExamples: [{ problem: '三角函数的正交系完备吗？', walkthrough: ['在 L²[0,2π] 上完备。'], result: '完备' }],
  },
  {
    id: 'compact-operators',
    title: '紧算子与谱',
    tag: '泛函分析',
    level: '竞赛',
    essence: '紧算子把有界集映成相对紧集，它们的谱只有零与特征值，是有限维矩阵的自然推广。',
    definition: '线性算子紧指单位球的像相对紧。紧算子的非零谱点都是孤立特征值且有限重。',
    whenToUse: ['解积分方程', '研究谱', '数值逼近'],
    theorems: [
      { name: '紧算子谱', statement: '非零谱点都是特征值，至多可数且以零为聚点。' },
      { name: '弗雷德霍姆二择一', statement: '紧扰动下解的存在性二择一。' },
    ],
    steps: [
      { title: '验紧性', body: '单位球像是否相对紧。' },
      { title: '用序列判据', body: '有界列有收敛子列。' },
      { title: '看谱', body: '非零谱点为特征值。' },
      { title: '求特征值', body: '解特征方程。' },
      { title: '用二择一', body: '判断解的存在唯一。' },
    ],
    pitfalls: ['把有界当紧（无限维单位球不紧）', '忽略零可能是谱但不是特征值', '混淆紧与有限秩'],
    example: { problem: '无限维空间上恒等算子紧吗？', walkthrough: ['单位球不紧。'], result: '不紧' },
    moreExamples: [{ problem: '紧算子的非零谱点是什么？', walkthrough: ['特征值。'], result: '特征值' }],
  },
  {
    id: 'adjoint-operators',
    title: '伴随算子与自伴性',
    tag: '泛函分析',
    level: '竞赛',
    essence: '伴随算子是内积下的「转置」，自伴算子对应实对称矩阵，是谱定理的主角。',
    definition: '有界算子 T 的伴随 T* 由内积等式唯一确定；自伴指 T=T*。',
    whenToUse: ['研究对称算子', '谱定理', '量子力学'],
    theorems: [
      { name: '伴随存在唯一', statement: '有界算子的伴随存在且唯一。' },
      { name: '自伴谱为实', statement: '自伴算子的谱是实数。', formula: '\\sigma(T)\\subset\\mathbb{R}' },
    ],
    steps: [
      { title: '写内积等式', body: '定义伴随。' },
      { title: '验有界', body: '伴随有界且范数相同。' },
      { title: '判自伴', body: '比较 T 与 T*。' },
      { title: '算谱', body: '自伴谱为实。' },
      { title: '用谱定理', body: '正交对角化。' },
    ],
    pitfalls: ['把伴随当转置（无限维需内积）', '忽略有界性', '把对称当自伴（定义域问题）'],
    example: { problem: '自伴算子的谱一定在实轴吗？', walkthrough: ['自伴推出谱为实。'], result: '是' },
    moreExamples: [{ problem: '伴随算子的范数与算子范数关系？', walkthrough: ['相等。'], result: '相等' }],
  },

  {
    id: 'dirichlet-kernel',
    title: '狄利克雷核与傅里叶级数收敛',
    tag: '调和分析',
    level: '竞赛',
    essence: '部分和是函数与狄利克雷核的卷积。核的积分不绝对收敛，导致收敛性讨论必须用费耶核等「好核」过渡。',
    definition: '狄利克雷核是部分和对应的核函数；费耶核是它的算术平均，恒为非负且构成逼近恒等。',
    whenToUse: ['讨论收敛', '构造求和方法', '估计部分和'],
    theorems: [
      { name: '部分和即卷积', statement: '傅里叶部分和等于函数与狄利克雷核的卷积。' },
      { name: '费耶核非负', statement: '费耶核非负且构成逼近恒等。', formula: 'F_N\\ge0' },
    ],
    steps: [
      { title: '写部分和', body: '截断傅里叶级数。' },
      { title: '换核形式', body: '写成卷积。' },
      { title: '观察核性质', body: '狄利克雷核变号。' },
      { title: '取平均', body: '用费耶核改善。' },
      { title: '得收敛', body: '费耶平均一致收敛。' },
    ],
    pitfalls: ['把狄利克雷核当非负', '断言连续函数级数处处收敛', '忽略一致收敛需要额外条件'],
    example: { problem: '费耶核是否非负？', walkthrough: ['它是非负三角多项式的平均。'], result: '非负' },
    moreExamples: [{ problem: '狄利克雷核的积分性质？', walkthrough: ['积分有界但绝对积分发散。'], result: '非绝对可积' }],
  },
  {
    id: 'approximate-identity',
    title: '逼近恒等：用卷积逼近',
    tag: '调和分析',
    level: '进阶',
    essence: '一族好核与函数卷积趋于函数本身，这是把「局部平均」变成「逼近」的统一机制。',
    definition: '逼近恒等是好核族：积分为一、集中在原点、一致有界，卷积后收敛到原函数。',
    whenToUse: ['证明稠密性', '光滑化', '逼近定理'],
    theorems: [
      { name: 'L^p 收敛', statement: '好核卷积在 L^p 中收敛（p<∞）。' },
      { name: '一致收敛', statement: '连续紧支撑时一致收敛。' },
    ],
    steps: [
      { title: '选好核', body: '满足三条性质。' },
      { title: '做卷积', body: '与目标函数卷积。' },
      { title: '拆误差', body: '近处与远处分别估计。' },
      { title: '取极限', body: '核变窄后误差趋于零。' },
      { title: '得结论', body: '在相应范数下收敛。' },
    ],
    pitfalls: ['忽略核的集中性', '把逐点收敛当一致收敛', 'p=∞ 时结论不同'],
    example: { problem: '好核的积分是多少？', walkthrough: ['归一化为 1。'], result: '1' },
    moreExamples: [{ problem: '卷积光滑化的原理？', walkthrough: ['用光滑核作逼近恒等。'], result: '光滑化' }],
  },
  {
    id: 'maximal-function',
    title: '哈代－李特尔伍德极大函数',
    tag: '调和分析',
    level: '竞赛',
    essence: '极大函数控制函数的局部平均，它的弱 (1,1) 与强 (p,p) 有界是调和分析的基石估计。',
    definition: '极大函数是包含该点的所有区间上平均值的上确界；它控制函数的可积性与几乎处处收敛。',
    whenToUse: ['证明几乎处处收敛', '控制算子', '奇异积分'],
    theorems: [
      { name: '弱 (1,1)', statement: '极大函数的分布函数被 L¹ 范数控制。', formula: '|\\{Mf>\\lambda\\}|\\le\\frac{C}{\\lambda}\\|f\\|_1' },
      { name: '强 (p,p)', statement: 'p>1 时极大函数 L^p 有界。' },
    ],
    steps: [
      { title: '定义极大函数', body: '所有区间平均的上确界。' },
      { title: '用覆盖引理', body: '维塔利型覆盖选出不交区间。' },
      { title: '估分布函数', body: '得弱型估计。' },
      { title: '插值', body: 'Marcinkiewicz 插值得强型。' },
      { title: '应用', body: '收敛性与算子有界。' },
    ],
    pitfalls: ['把极大函数当上确界函数', '忽略弱型与强型的区别', '常数依赖维数'],
    example: { problem: '极大函数的弱型估计是什么？', walkthrough: ['分布函数被范数除以 λ 控制。'], result: '弱 (1,1)' },
    moreExamples: [{ problem: '极大函数能推出勒贝格微分定理吗？', walkthrough: ['几乎处处收敛到原函数。'], result: '能' }],
  },
  {
    id: 'plancherel',
    title: 'Plancherel 定理：L² 上的傅里叶变换',
    tag: '调和分析',
    level: '竞赛',
    essence: '傅里叶变换在 L² 上等距（差常数），因此可延拓为酉算子，这是量子力学与信号处理的基础。',
    definition: 'Plancherel 定理说傅里叶变换保持 L² 内积（差 2π 因子），并可延拓为 L² 到自身的酉算子。',
    whenToUse: ['L² 上的变换', '能量守恒', '反演公式'],
    theorems: [
      { name: '等距性', statement: '变换保持 L² 范数（差常数）。', formula: '\\|\\hat f\\|_2=\\|f\\|_2' },
      { name: '反演', statement: '变换可逆且逆变换同形。' },
    ],
    steps: [
      { title: '先在稠密集定义', body: '取 L¹∩L²。' },
      { title: '验等距', body: '内积保持。' },
      { title: '延拓', body: '用稠密性延拓到 L²。' },
      { title: '得酉性', body: '满射且保范。' },
      { title: '写反演', body: '逆变换公式。' },
    ],
    pitfalls: ['忽略常数因子', '把 L¹ 的结论直接搬到 L²', '忘记延拓步骤'],
    example: { problem: 'Plancherel 定理说变换保持什么？', walkthrough: ['L² 范数（差常数）。'], result: '范数' },
    moreExamples: [{ problem: '傅里叶变换在 L² 上可逆吗？', walkthrough: ['是酉算子。'], result: '可逆' }],
  },
  {
    id: 'hilbert-transform',
    title: '希尔伯特变换与奇异积分',
    tag: '调和分析',
    level: '竞赛',
    essence: '希尔伯特变换是带 1/x 核的奇异积分，它在 L^p（1<p<∞）上有界但不是弱 (1,1)，是奇异积分理论的模型。',
    definition: '希尔伯特变换是函数与 1/(πx) 的主值卷积；核在原点奇异，需用截断取极限定义。',
    whenToUse: ['研究共轭函数', '奇异积分', '信号相位'],
    theorems: [
      { name: 'L^p 有界', statement: '1<p<∞ 时希尔伯特变换 L^p 有界。', formula: '\\|Hf\\|_p\\le C_p\\|f\\|_p' },
      { name: '不是弱 (1,1) 好算子', statement: 'p=1 时端点失效。' },
    ],
    steps: [
      { title: '截断核', body: '去掉原点邻域。' },
      { title: '取主值', body: 'ε→0 的极限。' },
      { title: '用傅里叶乘子', body: '变换对应符号函数。' },
      { title: '插值', body: '得 L^p 有界。' },
      { title: '看端点', body: 'p=1 失效。' },
    ],
    pitfalls: ['把奇异积分当普通积分', '忽略主值', '把端点 p=1 当有界'],
    example: { problem: '希尔伯特变换的核是什么？', walkthrough: ['1/(πx)。'], result: '1/(πx)' },
    moreExamples: [{ problem: '希尔伯特变换在 L² 上的作用？', walkthrough: ['乘以符号函数，是等距。'], result: '等距' }],
  },
  {
    id: 'distributions',
    title: '分布与缓增分布',
    tag: '调和分析',
    level: '竞赛',
    essence: '分布是测试函数上的连续线性泛函，δ 函数与函数导数都在其中合法，傅里叶变换在缓增分布上工作。',
    definition: '分布是紧支撑光滑函数空间上的连续线性泛函；缓增分布是施瓦茨空间上的连续线性泛函。',
    whenToUse: ['定义 δ 函数', '弱导数', 'PDE 弱解'],
    theorems: [
      { name: 'δ 是分布', statement: 'δ 由取值映射定义。', formula: '\\langle\\delta,\\varphi\\rangle=\\varphi(0)' },
      { name: '分布可微', statement: '分布的导数总存在。' },
    ],
    steps: [
      { title: '选测试空间', body: '光滑紧支撑或施瓦茨。' },
      { title: '定义泛函', body: '连续线性。' },
      { title: '求导', body: '转嫁给测试函数。' },
      { title: '做傅里叶', body: '在缓增分布上定义。' },
      { title: '回代', body: '得到弱解。' },
    ],
    pitfalls: ['把分布当函数', '忽略连续性', '在普通函数空间里用 δ'],
    example: { problem: 'δ 函数是函数还是分布？', walkthrough: ['它是测试函数上的泛函。'], result: '分布' },
    moreExamples: [{ problem: '分布的导数总是存在吗？', walkthrough: ['通过转嫁定义。'], result: '总存在' }],
  },

  {
    id: 'exact-ode',
    title: '恰当方程与积分因子',
    tag: '常微分方程',
    level: '进阶',
    essence: '若方程左端恰是某个二元函数的全微分，则解就是该函数等于常数；不恰当时乘积分因子使其恰当。',
    definition: '方程 M dx + N dy = 0 恰当指存在势函数 F 使 F_x=M、F_y=N，等价于 M_y=N_x（单连通区域）。',
    whenToUse: ['求解一阶方程', '寻找守恒量', '化简方程'],
    theorems: [
      { name: '恰当判据', statement: '单连通区域上 M_y=N_x 等价于恰当。', formula: 'M_y=N_x' },
      { name: '积分因子', statement: '乘因子后可化为恰当方程。' },
    ],
    steps: [
      { title: '写成 M dx+N dy', body: '整理为标准形式。' },
      { title: '验恰当性', body: '比较 M_y 与 N_x。' },
      { title: '求势函数', body: '对 M 积 x 再定函数。' },
      { title: '写隐式解', body: 'F=C。' },
      { title: '否则找因子', body: '用只依赖 x 或 y 的因子。' },
    ],
    pitfalls: ['忘记单连通条件', '积分因子不唯一时乱选', '把隐式解硬解成显式'],
    example: { problem: '2x dx + 2y dy = 0 恰当吗？', walkthrough: ['且 M_y=0=N_x。'], result: '恰当，解 x²+y²=C' },
    moreExamples: [{ problem: '积分因子何时只依赖 x？', walkthrough: ['(M_y-N_x)/N 只含 x。'], result: '该比值只含 x' }],
  },
  {
    id: 'linear-systems-ode',
    title: '一阶线性方程组',
    tag: '常微分方程',
    level: '进阶',
    essence: '线性方程组写成 x′=Ax，解的结构由特征值与特征向量决定，与矩阵指数紧密相关。',
    definition: '一阶线性方程组是向量方程 x′=A(t)x+b(t)；常系数时 A 为常数矩阵。',
    whenToUse: ['耦合系统', '电路与振动', '稳定性分析'],
    theorems: [
      { name: '解空间维数', statement: 'n 维系统齐次解空间为 n 维。' },
      { name: '特征值解法', statement: '实特征值给指数解，复特征值给振动解。' },
    ],
    steps: [
      { title: '写成矩阵形式', body: '整理为 x′=Ax。' },
      { title: '求特征值', body: '解特征方程。' },
      { title: '求特征向量', body: '对应零空间。' },
      { title: '写通解', body: '线性组合 e^{λt}v。' },
      { title: '处理重根', body: '用广义特征向量。' },
    ],
    pitfalls: ['特征向量方向搞反', '重根只写一个解', '忽略非齐次特解'],
    example: { problem: 'x′=Ax 的解由什么构成？', walkthrough: ['特征值与特征向量。'], result: '指数解组合' },
    moreExamples: [{ problem: '复特征值对应什么运动？', walkthrough: ['旋转与振动。'], result: '振荡' }],
  },
  {
    id: 'matrix-exponential',
    title: '矩阵指数与基本解矩阵',
    tag: '常微分方程',
    level: '竞赛',
    essence: '矩阵指数 e^{At} 是线性系统的「基本解」，它把标量情形的 e^{at} 推广到矩阵。',
    definition: '矩阵指数由级数定义，满足 d/dt e^{At}=A e^{At}，因此 x(t)=e^{At}x₀ 是初值问题的解。',
    whenToUse: ['解线性系统', '计算转移矩阵', '控制理论'],
    theorems: [
      { name: '基本解', statement: 'e^{At} 是基本解矩阵。', formula: '\\frac{d}{dt}e^{At}=Ae^{At}' },
      { name: '可对角化情形', statement: 'A=PDP⁻¹ 时 e^{At}=Pe^{Dt}P⁻¹。' },
    ],
    steps: [
      { title: '判可对角化', body: '看特征值。' },
      { title: '分解 A=PDP⁻¹', body: '求特征向量矩阵。' },
      { title: '指数化 D', body: '对角元取指数。' },
      { title: '乘回', body: '得 e^{At}。' },
      { title: '写解', body: 'x=e^{At}x₀。' },
    ],
    pitfalls: ['把 e^{A+B}=e^A e^B 当总成立（需交换）', '只对对角化情形套公式', '忘记初值'],
    example: { problem: 'A=diag(1,2) 时 e^{At} 是什么？', walkthrough: ['对角元取指数。'], result: 'diag(e^t,e^{2t})' },
    moreExamples: [{ problem: 'e^{At} 满足什么微分方程？', walkthrough: ['导数等于 A 乘自身。'], result: 'd/dt e^{At}=Ae^{At}' }],
  },
  {
    id: 'power-series-solutions',
    title: '幂级数解法与奇点',
    tag: '常微分方程',
    level: '竞赛',
    essence: '变系数方程在常点附近可用幂级数求解；正则奇点附近用广义幂级数（弗罗贝尼乌斯方法）。',
    definition: '常点指系数解析的点；正则奇点指系数奇性受限，可用弗罗贝尼乌斯级数展开。',
    whenToUse: ['变系数方程', '特殊函数', '物理方程'],
    theorems: [
      { name: '常点解析解', statement: '常点附近解可展成幂级数。' },
      { name: '弗罗贝尼乌斯', statement: '正则奇点处存在广义幂级数解。' },
    ],
    steps: [
      { title: '判点类型', body: '常点或正则奇点。' },
      { title: '设级数', body: '幂级数或广义幂级数。' },
      { title: '代入方程', body: '比较同次幂系数。' },
      { title: '得递推', body: '求系数关系。' },
      { title: '定收敛域', body: '给出解的范围。' },
    ],
    pitfalls: ['在正则奇点直接设普通幂级数', '忽略指标方程的两个根', '收敛半径判断错'],
    example: { problem: '常点附近解可以展成什么？', walkthrough: ['幂级数。'], result: '幂级数' },
    moreExamples: [{ problem: '正则奇点处用什么方法？', walkthrough: ['弗罗贝尼乌斯级数。'], result: '广义幂级数' }],
  },
  {
    id: 'sturm-liouville',
    title: '施图姆－刘维尔理论',
    tag: '常微分方程',
    level: '竞赛',
    essence: '二阶自伴边值问题的特征函数正交且完备，这解释了傅里叶级数与特殊函数的正交性。',
    definition: '施图姆－刘维尔问题是 -(p y′)′+q y=λ w y 加边界条件，特征值实、可数、趋于无穷。',
    whenToUse: ['边值问题', '特征函数展开', '特殊函数'],
    theorems: [
      { name: '特征值实且离散', statement: '特征值可数、下方有界、趋于无穷。' },
      { name: '正交性', statement: '不同特征值的特征函数带权正交。' },
    ],
    steps: [
      { title: '写成 SL 形式', body: '整理为标准形式。' },
      { title: '定边界条件', body: '端点约束。' },
      { title: '解特征问题', body: '求特征值与函数。' },
      { title: '验正交', body: '带权内积为零。' },
      { title: '展开函数', body: '按特征函数展开。' },
    ],
    pitfalls: ['忘记权函数', '边界条件缺失', '把特征值当连续'],
    example: { problem: 'SL 问题的特征函数彼此？', walkthrough: ['带权正交。'], result: '正交' },
    moreExamples: [{ problem: '傅里叶级数与 SL 的关系？', walkthrough: ['正弦余弦是 SL 特征函数。'], result: '特例' }],
  },
  {
    id: 'laplace-transform',
    title: '拉普拉斯变换解方程',
    tag: '常微分方程',
    level: '进阶',
    essence: '拉普拉斯变换把微分方程变成代数方程，解出像函数后再反演，适合初值问题与阶跃输入。',
    definition: '拉普拉斯变换把函数映为复变量函数，导数对应乘 s 减初值，卷积对应乘积。',
    whenToUse: ['初值问题', '阶跃与冲激', '电路分析'],
    theorems: [
      { name: '导数法则', statement: '导数变换等于 s 倍变换减初值。', formula: '\\mathcal{L}\\{f\\prime\\}=sF(s)-f(0)' },
      { name: '卷积定理', statement: '卷积的变换等于变换之积。' },
    ],
    steps: [
      { title: '取变换', body: '对等式两边变换。' },
      { title: '用导数法则', body: '代入初值。' },
      { title: '解代数方程', body: '求像函数。' },
      { title: '部分分式', body: '化简便于反演。' },
      { title: '反演', body: '得原函数。' },
    ],
    pitfalls: ['忘记初值项', '反演表用错', '收敛域忽略'],
    example: { problem: 'f′=0、f(0)=1 的解？', walkthrough: ['sF-1=0 → F=1/s。'], result: 'f≡1' },
    moreExamples: [{ problem: '拉普拉斯变换把卷积变成什么？', walkthrough: ['乘积。'], result: '乘积' }],
  },
  {
    id: 'phase-plane',
    title: '相平面与轨线',
    tag: '常微分方程',
    level: '进阶',
    essence: '把二阶方程化为一阶系统后，解曲线成为相平面上的轨线；平衡点类型刻画长期行为。',
    definition: '相平面是 (x, x′) 平面；平衡点是向量场为零处，按线性化特征值分为结点、鞍点、焦点、中心。',
    whenToUse: ['定性分析', '判断长期行为', '绘制相图'],
    theorems: [
      { name: '线性化判据', statement: '双曲平衡点处非线性系统与线性化同类型。' },
      { name: '守恒系统', statement: '存在首次积分时轨线沿等值线。' },
    ],
    steps: [
      { title: '化为一阶系统', body: '令 v=x′。' },
      { title: '找平衡点', body: '解向量场为零。' },
      { title: '线性化', body: '求雅可比矩阵。' },
      { title: '看特征值', body: '判类型。' },
      { title: '画相图', body: '标出方向。' },
    ],
    pitfalls: ['非双曲点直接套线性化', '忽略轨线方向', '把相图当时间图像'],
    example: { problem: '雅可比特征值为正负实数时平衡点类型？', walkthrough: ['一进一出。'], result: '鞍点' },
    moreExamples: [{ problem: '纯虚特征值对应什么？', walkthrough: ['中心（周期轨）。'], result: '中心' }],
  },
  {
    id: 'stability',
    title: '稳定性与李雅普诺夫方法',
    tag: '常微分方程',
    level: '竞赛',
    essence: '稳定性研究初值扰动是否让解长期偏离；李雅普诺夫函数用能量递减证明稳定，不必求解方程。',
    definition: '平衡点稳定指初值接近则解始终接近；渐近稳定还要求收敛；李雅普诺夫函数是正定且沿轨线递减的函数。',
    whenToUse: ['不求解判稳定', '控制设计', '非线性系统'],
    theorems: [
      { name: '李雅普诺夫稳定性', statement: '存在正定且导数半负定的函数则稳定。' },
      { name: '渐近稳定', statement: '导数负定则渐近稳定。' },
    ],
    steps: [
      { title: '平移平衡点', body: '化为原点。' },
      { title: '构造 V', body: '能量或二次型。' },
      { title: '验正定', body: 'V>0（除原点）。' },
      { title: '算 V 导数', body: '沿向量场求导。' },
      { title: '判稳定', body: '半负定稳定，负定渐近稳定。' },
    ],
    pitfalls: ['V 不正定', '只看 V 不沿轨线求导', '把稳定当渐近稳定'],
    example: { problem: 'V 导数负定说明什么？', walkthrough: ['能量严格递减。'], result: '渐近稳定' },
    moreExamples: [{ problem: '李雅普诺夫方法需要解方程吗？', walkthrough: ['不需要。'], result: '不需要' }],
  },

  {
    id: 'frenet-serret',
    title: '弗雷内标架与曲线论基本定理',
    tag: '微分几何',
    level: '进阶',
    essence: '曲线的曲率与挠率决定它的形状：弗雷内公式给出标架的运动方程，曲率挠率确定曲线到刚体运动。',
    definition: '弗雷内标架由切向量、主法向量、副法向量组成；曲率度量弯曲，挠率度量偏离平面。',
    whenToUse: ['计算曲率挠率', '判断曲线形状', '研究空间曲线'],
    theorems: [
      { name: '弗雷内公式', statement: '标架导数由曲率与挠率表示。', formula: 'T\\prime=\\kappa N,\\;N\\prime=-\\kappa T+\\tau B' },
      { name: '基本定理', statement: '给定曲率挠率可唯一确定曲线（差刚体运动）。' },
    ],
    steps: [
      { title: '参数化', body: '取弧长参数。' },
      { title: '求切向量', body: '对弧长求导。' },
      { title: '算曲率', body: '切向量导数的模。' },
      { title: '算挠率', body: '副法向量的变化率。' },
      { title: '写标架', body: '用弗雷内公式。' },
    ],
    pitfalls: ['用一般参数直接算曲率（需先弧长化）', '挠率符号搞反', '平面曲线挠率为零被忽略'],
    example: { problem: '平面曲线的挠率是多少？', walkthrough: ['副法向量不变。'], result: '0' },
    moreExamples: [{ problem: '曲率与挠率能唯一确定曲线吗？', walkthrough: ['差一个刚体运动。'], result: '能（差刚体运动）' }],
  },
  {
    id: 'regular-surface',
    title: '正则曲面与切平面',
    tag: '微分几何',
    level: '进阶',
    essence: '正则曲面局部是坐标片的像，切平面由两个偏导向量张成，法向量给出定向。',
    definition: '正则曲面指参数化映射光滑且两个偏导向量处处线性无关；切平面是偏导张成的平面。',
    whenToUse: ['判断正则性', '求切平面与法向量', '研究曲面'],
    theorems: [
      { name: '隐函数定理', statement: '光滑函数的正则值原像是正则曲面。' },
      { name: '切平面', statement: '切平面由两个偏导向量张成。' },
    ],
    steps: [
      { title: '写参数化', body: '给出 $r(u,v)$。' },
      { title: '求偏导', body: '$r_u,r_v$。' },
      { title: '验线性无关', body: '叉积非零。' },
      { title: '得法向量', body: '归一化叉积。' },
      { title: '写切平面', body: '过点用法向量。' },
    ],
    pitfalls: ['把参数化奇点当正则点', '忽略定义域', '法向量方向不唯一'],
    example: { problem: '球面的法向量方向？', walkthrough: ['沿半径方向。'], result: '径向' },
    moreExamples: [{ problem: '正则值的原像是什么？', walkthrough: ['正则曲面。'], result: '曲面' }],
  },
  {
    id: 'first-fundamental-form',
    title: '第一基本形式：曲面的度量',
    tag: '微分几何',
    level: '进阶',
    essence: '第一基本形式是切平面上的内积，决定弧长、面积与角度，是曲面的「尺子」。',
    definition: '第一基本形式是切向量内积的二次型，系数为 E、F、G，对应 $r_u$、$r_v$ 的内积。',
    whenToUse: ['算弧长面积', '算角度', '研究等距'],
    theorems: [
      { name: '弧长公式', statement: '曲线长度由第一基本形式积分给出。', formula: 's=\\int\\sqrt{Eu^{\\prime2}+2Fu^{\\prime}v^{\\prime}+Gv^{\\prime2}}' },
      { name: '面积公式', statement: '面积元为 $\\sqrt{EG-F^2}$。' },
    ],
    steps: [
      { title: '求偏导', body: '$r_u,r_v$。' },
      { title: '算系数', body: '$E,F,G$。' },
      { title: '写二次型', body: '第一基本形式。' },
      { title: '算弧长', body: '沿曲线积分。' },
      { title: '算面积', body: '用面积元。' },
    ],
    pitfalls: ['把第一基本形式当第二', '忘记交叉项 $2F$', '等距与保角混淆'],
    example: { problem: '第一基本形式决定曲面的什么？', walkthrough: ['弧长、面积、角度。'], result: '内蕴度量' },
    moreExamples: [{ problem: '面积元是什么？', walkthrough: ['$\\sqrt{EG-F^2}\\,du\\,dv$。'], result: '\\sqrt{EG-F^2}' }],
  },
  {
    id: 'second-fundamental-form',
    title: '第二基本形式与形状算子',
    tag: '微分几何',
    level: '竞赛',
    essence: '第二基本形式度量曲面如何弯曲，形状算子的特征值是主曲率，其乘积为高斯曲率。',
    definition: '第二基本形式是曲率向量在法向的投影，系数 L、M、N；形状算子由第二与第一基本形式之比给出。',
    whenToUse: ['算主曲率', '算高斯曲率', '判极小曲面'],
    theorems: [
      { name: '主曲率', statement: '形状算子的特征值是主曲率。' },
      { name: '高斯曲率', statement: '高斯曲率等于主曲率之积。', formula: 'K=k_1k_2' },
    ],
    steps: [
      { title: '求法向量', body: '单位化。' },
      { title: '算二阶导', body: '$r_{uu},r_{uv},r_{vv}$。' },
      { title: '投影', body: '与法向量作内积得 L、M、N。' },
      { title: '算形状算子', body: '矩阵 $I^{-1}II$。' },
      { title: '得主曲率', body: '特征值。' },
    ],
    pitfalls: ['法向量方向影响符号', '把平均曲率当高斯曲率', '忘记归一化'],
    example: { problem: '球面的主曲率？', walkthrough: ['两方向曲率相同。'], result: '1/R,1/R' },
    moreExamples: [{ problem: '极小曲面的平均曲率？', walkthrough: ['平均曲率为零。'], result: '0' }],
  },
  {
    id: 'theorema-egregium',
    title: '高斯绝妙定理',
    tag: '微分几何',
    level: '竞赛',
    essence: '高斯曲率只依赖第一基本形式，与嵌入方式无关——曲面的弯曲是内蕴的。',
    definition: '高斯绝妙定理说高斯曲率可由第一基本形式及其导数算出，因此是内蕴量。',
    whenToUse: ['判断等距不变量', '内蕴几何', '证明不可展'],
    theorems: [
      { name: '绝妙定理', statement: '高斯曲率是内蕴量。' },
      { name: '推论', statement: '平面与球面不能局部等距。' },
    ],
    steps: [
      { title: '写出第一形式', body: 'E、F、G。' },
      { title: '用公式算 K', body: '仅含 E、F、G 及其导数。' },
      { title: '验证内蕴性', body: '与嵌入无关。' },
      { title: '比较曲面', body: 'K 不同则不等距。' },
      { title: '得结论', body: '弯曲是内蕴的。' },
    ],
    pitfalls: ['以为所有曲率都是外蕴的', '把 K 与嵌入的符号混淆', '忽略等距需同维'],
    example: { problem: '平面与球面能局部等距吗？', walkthrough: ['高斯曲率不同（0 vs 1/R²）。'], result: '不能' },
    moreExamples: [{ problem: '圆柱面与平面可以等距吗？', walkthrough: ['高斯曲率都为零。'], result: '可以' }],
  },
  {
    id: 'covariant-derivative',
    title: '协变导数与联络',
    tag: '微分几何',
    level: '竞赛',
    essence: '协变导数把向量场沿曲线求导，补偿了曲面的弯曲；联络系数刻画坐标如何变化。',
    definition: '协变导数是沿切方向的导数在切平面上的投影；克里斯托费尔符号给出联络的坐标表达。',
    whenToUse: ['求测地线', '平行移动', '曲率张量'],
    theorems: [
      { name: '测地线方程', statement: '协变导数为零即测地线。', formula: '\\nabla_{\\dot\\gamma}\\dot\\gamma=0' },
      { name: '克里斯托费尔符号', statement: '由第一基本形式导数给出。' },
    ],
    steps: [
      { title: '取向量场', body: '沿曲线定义。' },
      { title: '算普通导数', body: '对参数求导。' },
      { title: '投影到切平面', body: '减去法向分量。' },
      { title: '写坐标形式', body: '用克里斯托费尔符号。' },
      { title: '解测地线', body: '令协变导数为零。' },
    ],
    pitfalls: ['把普通导数当协变导数', '忘记投影', '符号约定混乱'],
    example: { problem: '测地线满足什么方程？', walkthrough: ['协变导数为零。'], result: '\\nabla_{\\dot\\gamma}\\dot\\gamma=0' },
    moreExamples: [{ problem: '平行移动依赖路径吗？', walkthrough: ['曲面上一般是，平坦时可交换。'], result: '一般依赖' }],
  },
  {
    id: 'minimal-surfaces',
    title: '极小曲面',
    tag: '微分几何',
    level: '竞赛',
    essence: '极小曲面是平均曲率为零的曲面，等价于面积的一阶变分为零，肥皂膜就是它的物理实现。',
    definition: '极小曲面指平均曲率处处为零的曲面；等价于任意紧区域面积在法向变分下取极值。',
    whenToUse: ['变分问题', '物理膜', '几何分析'],
    theorems: [
      { name: '变分刻画', statement: '面积一阶变分为零等价于平均曲率为零。' },
      { name: '极小图方程', statement: '图形式的极小曲面满足散度型方程。' },
    ],
    steps: [
      { title: '写面积泛函', body: '用第一基本形式。' },
      { title: '做变分', body: '法向扰动。' },
      { title: '令一阶变分为零', body: '得平均曲率零。' },
      { title: '解方程', body: '求具体曲面。' },
      { title: '验证', body: '检查平均曲率。' },
    ],
    pitfalls: ['把极小当面积全局最小', '忽略边界条件', '混淆极小与常平均曲率'],
    example: { problem: '悬链面是极小曲面吗？', walkthrough: ['平均曲率为零。'], result: '是' },
    moreExamples: [{ problem: '极小曲面面积一定最小吗？', walkthrough: ['只是临界点。'], result: '不一定' }],
  },

  {
    id: 'separation-axioms',
    title: '分离公理：从 T1 到正规',
    tag: '拓扑学',
    level: '进阶',
    essence: '分离公理用开集区分点与闭集：T1 分离点，豪斯多夫分离两点，正规分离闭集，越强越接近度量空间。',
    definition: 'T1 指单点是闭集；豪斯多夫（T2）指任意两点有不相交邻域；正规指任意两个不交闭集有不相交邻域。',
    whenToUse: ['判断空间好坏', '使用存在性定理', '构造反例'],
    theorems: [
      { name: '层级关系', statement: '正规推出豪斯多夫推出 T1。' },
      { name: '紧豪斯多夫正规', statement: '紧豪斯多夫空间是正规空间。' },
    ],
    steps: [
      { title: '看单点', body: '是否闭集（T1）。' },
      { title: '分离两点', body: '是否存在不交邻域（T2）。' },
      { title: '分离闭集', body: '正规性。' },
      { title: '查层级', body: '哪些推出哪些。' },
      { title: '用定理', body: '正规空间可用乌雷松引理。' },
    ],
    pitfalls: ['把豪斯多夫当正规', '忽略 T1 的必要性', '在非豪斯多夫空间谈极限唯一'],
    example: { problem: '紧豪斯多夫空间是正规的吗？', walkthrough: ['标准定理。'], result: '是' },
    moreExamples: [{ problem: '序列极限唯一需要什么公理？', walkthrough: ['豪斯多夫。'], result: 'T2' }],
  },
  {
    id: 'urysohn-lemma',
    title: '乌雷松引理与蒂策扩张定理',
    tag: '拓扑学',
    level: '竞赛',
    essence: '正规空间里两个不交闭集可被连续函数分离，闭集上的连续函数可延拓到全空间。',
    definition: '乌雷松引理：正规空间中不交闭集存在连续函数在其中取 0 与 1。蒂策定理把闭子集上的连续函数延拓到全空间。',
    whenToUse: ['构造连续函数', '证明嵌入定理', '度量化'],
    theorems: [
      { name: '乌雷松引理', statement: '不交闭集可被连续函数分离。' },
      { name: '蒂策扩张', statement: '闭集上的连续实函数可延拓。' },
    ],
    steps: [
      { title: '验正规性', body: '空间需正规。' },
      { title: '取不交闭集', body: 'A、B。' },
      { title: '构造阶梯函数', body: '用有理数层逼近。' },
      { title: '取极限', body: '得连续函数。' },
      { title: '延拓', body: '用蒂策定理。' },
    ],
    pitfalls: ['忽略正规性前提', '把乌雷松引理用于非闭集', '延拓不保界'],
    example: { problem: '乌雷松引理需要什么前提？', walkthrough: ['正规空间加两个不交闭集。'], result: '正规 + 不交闭集' },
    moreExamples: [{ problem: '闭集上的连续函数能延拓吗？', walkthrough: ['蒂策定理，正规空间。'], result: '能' }],
  },
  {
    id: 'metric-topology',
    title: '度量空间拓扑与完备化',
    tag: '拓扑学',
    level: '进阶',
    essence: '度量诱导拓扑，完备性不是拓扑性质而是度量性质；每个度量空间都可完备化。',
    definition: '度量诱导的拓扑以开球为基；完备指柯西列收敛；完备化是把空间嵌入完备空间的最小的方式。',
    whenToUse: ['判断拓扑性质', '构造完备空间', '分析收敛'],
    theorems: [
      { name: '度量空间正规', statement: '度量空间是正规且仿紧的。' },
      { name: '完备化唯一', statement: '每个度量空间有唯一的完备化（等距意义）。' },
    ],
    steps: [
      { title: '写度量', body: '定义距离。' },
      { title: '取开球', body: '生成拓扑基。' },
      { title: '验完备', body: '柯西列是否收敛。' },
      { title: '不完备则完备化', body: '用柯西列等价类。' },
      { title: '验嵌入', body: '原空间等距嵌入。' },
    ],
    pitfalls: ['把完备当拓扑性质（同胚不保持）', '混淆柯西列与收敛列', '忽略完备化的唯一性'],
    example: { problem: '有理数集完备吗？', walkthrough: ['柯西列可收敛到无理数。'], result: '不完备，完备化是实数' },
    moreExamples: [{ problem: '完备性是拓扑性质吗？', walkthrough: ['不是，依赖度量。'], result: '否' }],
  },
  {
    id: 'product-topology',
    title: '乘积拓扑与吉洪诺夫定理',
    tag: '拓扑学',
    level: '竞赛',
    essence: '乘积拓扑是最弱的使投影连续拓扑，任意多紧空间的乘积仍紧——这就是吉洪诺夫定理。',
    definition: '乘积拓扑以有限个开集的乘积为基；吉洪诺夫定理说任意族紧空间的乘积紧（依赖选择公理）。',
    whenToUse: ['构造高维空间', '紧性论证', '泛函分析'],
    theorems: [
      { name: '吉洪诺夫', statement: '任意族紧空间的乘积紧。' },
      { name: '投影连续', statement: '乘积拓扑使所有投影连续且最弱。' },
    ],
    steps: [
      { title: '定指标集', body: '任意多个因子。' },
      { title: '取基', body: '有限个开集乘积。' },
      { title: '验证投影', body: '连续且最弱。' },
      { title: '用吉洪诺夫', body: '得紧性。' },
      { title: '用选择公理', body: '无限情形必需。' },
    ],
    pitfalls: ['把箱拓扑当乘积拓扑', '忘记选择公理依赖', '有限与无限混淆'],
    example: { problem: '吉洪诺夫定理对无限乘积成立吗？', walkthrough: ['成立，需选择公理。'], result: '成立' },
    moreExamples: [{ problem: '乘积拓扑的基是什么？', walkthrough: ['有限个开集之积。'], result: '有限积' }],
  },
  {
    id: 'nets-filters',
    title: '网与滤子：一般空间的收敛',
    tag: '拓扑学',
    level: '竞赛',
    essence: '序列不足以刻画一般拓扑空间的收敛，网与滤子给出统一语言，紧性可用「每个滤子有聚点」刻画。',
    definition: '网是有向集上的族；滤子是满足有限交与上闭的集族。收敛用最终/频繁进入邻域定义。',
    whenToUse: ['一般空间收敛', '紧性刻画', '构造极限'],
    theorems: [
      { name: '网刻画连续', statement: '函数连续当且仅当保网收敛。' },
      { name: '紧性刻画', statement: '空间紧当且仅当每个滤子有聚点。' },
    ],
    steps: [
      { title: '选工具', body: '网或滤子。' },
      { title: '定义收敛', body: '最终或频繁。' },
      { title: '刻画连续', body: '保收敛。' },
      { title: '刻画紧', body: '滤子有聚点。' },
      { title: '与序列比较', body: '第一可数时等价。' },
    ],
    pitfalls: ['在非第一可数空间用序列', '混淆最终与频繁', '忽略有向集'],
    example: { problem: '一般空间用什么代替序列？', walkthrough: ['网或滤子。'], result: '网/滤子' },
    moreExamples: [{ problem: '紧性的滤子刻画？', walkthrough: ['每个滤子有聚点。'], result: '滤子有聚点' }],
  },
  {
    id: 'function-space',
    title: '函数空间与一致收敛',
    tag: '拓扑学',
    level: '竞赛',
    essence: '函数空间上的拓扑决定收敛方式：一致收敛比逐点收敛强，紧开拓扑在紧集上一致。',
    definition: '函数空间由映射全体构成；紧开拓扑以紧集上的一致收敛为基本收敛，一致度量给出更强拓扑。',
    whenToUse: ['分析收敛', '阿尔泽拉－阿斯科利', '泛函分析'],
    theorems: [
      { name: '一致收敛保连续', statement: '连续函数的一致极限连续。' },
      { name: '阿尔泽拉－阿斯科利', statement: '等度连续且有界族有紧闭包。' },
    ],
    steps: [
      { title: '选拓扑', body: '逐点、紧开或一致。' },
      { title: '判收敛', body: '按拓扑定义。' },
      { title: '比较强弱', body: '一致最强之一。' },
      { title: '用等度连续', body: '得紧性。' },
      { title: '取子列', body: '一致收敛子列。' },
    ],
    pitfalls: ['把逐点收敛当一致', '忽略等度连续', '紧开拓扑与一致拓扑混淆'],
    example: { problem: '连续函数的一致极限连续吗？', walkthrough: ['标准结论。'], result: '连续' },
    moreExamples: [{ problem: '阿尔泽拉－阿斯科利需要什么？', walkthrough: ['等度连续 + 逐点有界。'], result: '等度连续' }],
  },

  {
    id: 'singular-homology',
    title: '奇异同调：用单形探测洞',
    tag: '代数拓扑',
    level: '竞赛',
    essence: '奇异同调用所有连续单形作链，边界算子平方为零，同调群是闭链模边界，能数出各维的洞。',
    definition: '奇异 n 单形是标准 n 单形到空间的连续映射；链群是自由阿贝尔群，边界算子按面求和。',
    whenToUse: ['计算同调', '证明不变量', '构造同调理论'],
    theorems: [
      { name: '边界平方为零', statement: '两次边界为零。', formula: '\\partial^2=0' },
      { name: '同伦不变', statement: '同伦等价空间同调相同。' },
    ],
    steps: [
      { title: '取单形', body: '所有连续映射。' },
      { title: '建链群', body: '自由生成。' },
      { title: '定边界', body: '交替求和面。' },
      { title: '验平方零', body: '组合恒等式。' },
      { title: '取同调', body: '闭链模边界。' },
    ],
    pitfalls: ['把链群当同调群', '混淆闭链与边界', '忘记系数群'],
    example: { problem: '圆周的一维同调群是什么？', walkthrough: ['一个独立闭链。'], result: '\\mathbb{Z}' },
    moreExamples: [{ problem: '可缩空间的高维同调？', walkthrough: ['全为零。'], result: '0' }],
  },
  {
    id: 'mayer-vietoris',
    title: '迈耶－菲托里斯序列',
    tag: '代数拓扑',
    level: '竞赛',
    essence: '把空间拆成两块后，同调由两块及其交的同调通过长正合列拼出来，是计算同调的主力工具。',
    definition: '对开覆盖 X=U∪V，存在联系 U、V、交与 X 的同调长正合列。',
    whenToUse: ['计算复杂空间同调', '归纳维数', '证明分裂'],
    theorems: [
      { name: 'MV 序列', statement: '同调有长正合列。' },
      { name: '连通和', statement: '球面连通和的同调可归纳计算。' },
    ],
    steps: [
      { title: '取开覆盖', body: 'U 与 V。' },
      { title: '看交', body: '交的同调。' },
      { title: '写正合列', body: '按 MV。' },
      { title: '解出未知', body: '用相邻项。' },
      { title: '归纳', body: '对复杂空间递推。' },
    ],
    pitfalls: ['覆盖不满足开性', '正合列方向写反', '忘记交的连通性'],
    example: { problem: '球面 S² 拆成两个半球，交是什么？', walkthrough: ['交是赤道 S¹。'], result: 'S¹' },
    moreExamples: [{ problem: 'MV 序列是正合的吗？', walkthrough: ['是长正合列。'], result: '长正合' }],
  },
  {
    id: 'cohomology',
    title: '上同调与万有系数定理',
    tag: '代数拓扑',
    level: '竞赛',
    essence: '上同调是把 Hom 作用到链复形上得到，它与同调通过万有系数定理联系，还多出环结构。',
    definition: '上链是链群到系数的同态，上边界由对偶给出；上同调是闭上链模上边界。',
    whenToUse: ['构造不变量环', '杯积', '对偶定理'],
    theorems: [
      { name: '万有系数', statement: '上同调由同调与 Ext 项决定。', formula: 'H^n\\cong\\mathrm{Hom}(H_n,\\mathbb{Z})\\oplus\\mathrm{Ext}(H_{n-1},\\mathbb{Z})' },
      { name: '上同调环', statement: '杯积使上同调成为分次环。' },
    ],
    steps: [
      { title: '取链复形', body: '已有同调。' },
      { title: '取对偶', body: 'Hom 到系数。' },
      { title: '算上边界', body: '转嫁定义。' },
      { title: '求上同调', body: '闭上链模上边界。' },
      { title: '用万有系数', body: '与同调比较。' },
    ],
    pitfalls: ['把上同调等同于同调', '忽略 Ext 项', '忘记杯积的次数字'],
    example: { problem: '整数系数的上同调与同调何时相同？', walkthrough: ['无挠时相同。'], result: '自由部分相同' },
    moreExamples: [{ problem: '杯积的次数字是多少？', walkthrough: ['两个次数相加。'], result: '相加' }],
  },
  {
    id: 'cup-product',
    title: '杯积与上同调环',
    tag: '代数拓扑',
    level: '竞赛',
    essence: '杯积把两个上同调类乘成更高次类，使上同调成为环，能区分同调无法区分的空间。',
    definition: '杯积由上链的斜积构造，满足分次交换律；它给出 $H^*(X)$ 的分次环结构。',
    whenToUse: ['区分空间', '计算环结构', '证明不可缩'],
    theorems: [
      { name: '分次交换', statement: '不同次数的类交换差符号。', formula: '\\alpha\\smile\\beta=(-1)^{pq}\\beta\\smile\\alpha' },
      { name: '自然性', statement: '连续映射诱导保积同态。' },
    ],
    steps: [
      { title: '取上同调类', body: '两个类。' },
      { title: '写代表上链', body: '选代表。' },
      { title: '做斜积', body: '按定义。' },
      { title: '验良定义', body: '与代表无关。' },
      { title: '读环结构', body: '得乘法表。' },
    ],
    pitfalls: ['把杯积当普通乘法（有符号）', '忽略次数', '混淆上同调环与同调群'],
    example: { problem: '环面 T² 的上同调环是什么？', walkthrough: ['两个一次生成元的外代数。'], result: '外代数' },
    moreExamples: [{ problem: '分次交换律的符号？', walkthrough: ['$(-1)^{pq}$。'], result: '(-1)^{pq}' }],
  },
  {
    id: 'homotopy-groups',
    title: '高阶同伦群与纤维化',
    tag: '代数拓扑',
    level: '竞赛',
    essence: '高阶同伦群描述高维球面映射的同伦类；它们难算但更精细，同调是它的阿贝尔化。',
    definition: '第 n 同伦群是 n 维球面到空间的保基点映射的同伦类群；n≥2 时是阿贝尔群。',
    whenToUse: ['精细不变量', '纤维化长正合列', '同伦论'],
    theorems: [
      { name: '纤维化长正合列', statement: '纤维化给出同伦群长正合列。' },
      { name: 'Hurewicz', statement: '第一同伦群阿贝尔化等于第一同调。' },
    ],
    steps: [
      { title: '定基点', body: '固定基点。' },
      { title: '取球面映射', body: '保基点。' },
      { title: '模同伦', body: '得群元素。' },
      { title: '用纤维化', body: '算长正合列。' },
      { title: '与同调比较', body: '用 Hurewicz。' },
    ],
    pitfalls: ['把同伦群当同调群', '忽略基点', '以为高阶群好算'],
    example: { problem: '第一同伦群的阿贝尔化等于什么？', walkthrough: ['Hurewicz 定理。'], result: '第一同调群' },
    moreExamples: [{ problem: 'n≥2 的同伦群交换吗？', walkthrough: ['是阿贝尔群。'], result: '交换' }],
  },
  {
    id: 'degree-brouwer',
    title: '映射度与布劳威尔不动点',
    tag: '代数拓扑',
    level: '竞赛',
    essence: '球面自映射的度是整数，刻画环绕次数；由此推出布劳威尔不动点与毛球定理。',
    definition: '球面自映射的度由最高维同调的诱导映射决定；非零度映射满射且不可缩。',
    whenToUse: ['证明不动点', '判定满射', '向量场问题'],
    theorems: [
      { name: '不动点', statement: '闭球到自身的连续映射有不动点。' },
      { name: '毛球定理', statement: '偶数维球面上没有处处非零连续切向量场。' },
    ],
    steps: [
      { title: '取映射', body: '球面到自身。' },
      { title: '算同调诱导', body: '最高维。' },
      { title: '得度', body: '整数。' },
      { title: '用度论证', body: '反证不动点。' },
      { title: '得结论', body: '不动点或非零向量场。' },
    ],
    pitfalls: ['把度当绝对值', '忽略定向', '在一般空间套用'],
    example: { problem: '恒等映射的度是多少？', walkthrough: ['最高维同调是恒等。'], result: '1' },
    moreExamples: [{ problem: '对径映射 S^n 的度？', walkthrough: ['$(-1)^{n+1}$。'], result: '(-1)^{n+1}' }],
  },

  {
    id: 'tangent-space',
    title: '切空间与切映射',
    tag: '微分拓扑',
    level: '进阶',
    essence: '切空间是流形每点的线性化，切映射是光滑映射的导数；它们把非线性问题化为线性问题。',
    definition: '切空间是过点的曲线切向量等价类，也等价于导子空间；切映射把源切向量推到目标切向量。',
    whenToUse: ['线性化', '判断浸入与嵌入', '研究向量场'],
    theorems: [
      { name: '切映射链式法则', statement: '复合的切映射等于切映射复合。' },
      { name: '浸入判据', statement: '切映射处处单射即浸入。' },
    ],
    steps: [
      { title: '取局部坐标', body: '写成欧氏空间。' },
      { title: '写雅可比', body: '偏导矩阵。' },
      { title: '得切映射', body: '矩阵作用。' },
      { title: '判单射满射', body: '看秩。' },
      { title: '得浸入或淹没', body: '按秩分类。' },
    ],
    pitfalls: ['把切空间当流形本身', '忽略坐标依赖', '混淆浸入与嵌入'],
    example: { problem: '切映射处处单射的映射叫什么？', walkthrough: ['按定义。'], result: '浸入' },
    moreExamples: [{ problem: '切空间的维数？', walkthrough: ['等于流形维数。'], result: '同维' }],
  },
  {
    id: 'sard-theorem',
    title: '萨德定理：临界值测度为零',
    tag: '微分拓扑',
    level: '竞赛',
    essence: '光滑映射的临界值集测度为零，因此正则值几乎处处存在——这保证了度与横截性论证可行。',
    definition: '临界点是切映射降秩的点，临界值是临界点的像；萨德定理说临界值集测度为零。',
    whenToUse: ['取正则值', '横截性论证', '证明存在性'],
    theorems: [
      { name: '萨德定理', statement: '临界值集测度为零。' },
      { name: '推论', statement: '正则值在目标中稠密。' },
    ],
    steps: [
      { title: '求切映射', body: '算雅可比。' },
      { title: '找临界点', body: '秩下降处。' },
      { title: '取像', body: '临界值。' },
      { title: '用测度零', body: '几乎处处正则。' },
      { title: '取正则值', body: '任取补集。' },
    ],
    pitfalls: ['把临界点当临界值', '忽略光滑性', '在非光滑情形套用'],
    example: { problem: '正则值一定存在吗？', walkthrough: ['临界值测度零，补集非空。'], result: '存在' },
    moreExamples: [{ problem: '萨德定理对连续性有要求吗？', walkthrough: ['需要足够光滑。'], result: '需要光滑' }],
  },
  {
    id: 'intersection-number',
    title: '定向与相交数',
    tag: '微分拓扑',
    level: '竞赛',
    essence: '定向流形上两个横截子流形可定义相交数，它是同伦不变量，可用来证明不可嵌入。',
    definition: '横截相交的定向子流形，按交点处切空间定向是否一致赋 ±1，求和得相交数。',
    whenToUse: ['证明不可嵌入', '计算不变量', '研究纽结'],
    theorems: [
      { name: '同伦不变', statement: '相交数在同伦下不变。' },
      { name: '模 2 相交数', statement: '不可定向时用模 2 版本。' },
    ],
    steps: [
      { title: '定定向', body: '给流形定向。' },
      { title: '取横截子流形', body: '确保横截。' },
      { title: '看交点', body: '比较定向。' },
      { title: '赋符号', body: '±1。' },
      { title: '求和', body: '得相交数。' },
    ],
    pitfalls: ['相交不横截时硬算', '忘记定向', '把相交数当同调类'],
    example: { problem: '相交数在同伦下变吗？', walkthrough: ['不变。'], result: '不变' },
    moreExamples: [{ problem: '不可定向流形用什么？', walkthrough: ['模 2 相交数。'], result: '模 2' }],
  },
  {
    id: 'morse-theory',
    title: '莫尔斯理论与柄分解',
    tag: '微分拓扑',
    level: '竞赛',
    essence: '莫尔斯函数把流形的拓扑分解成临界点：指标 k 的临界点对应粘一个 k 柄，由此读出同调。',
    definition: '莫尔斯函数是临界点非退化（海森矩阵可逆）的光滑函数；指标是海森负特征值个数。',
    whenToUse: ['分析流形拓扑', '计算同调', '证明柄分解'],
    theorems: [
      { name: '柄分解', statement: '穿越指标 k 临界点时粘一个 k 柄。' },
      { name: '莫尔斯不等式', statement: '临界点数控制贝蒂数。', formula: 'b_k\\le c_k' },
    ],
    steps: [
      { title: '找莫尔斯函数', body: '高度函数等。' },
      { title: '求临界点', body: '梯度为零。' },
      { title: '算指标', body: '海森负特征值数。' },
      { title: '看水平集变化', body: '粘柄。' },
      { title: '读拓扑', body: '得同调或欧拉数。' },
    ],
    pitfalls: ['把临界点当指标', '忽略非退化条件', '混淆莫尔斯与梯度流'],
    example: { problem: '球面上高度函数的临界点有几个？', walkthrough: ['南极与北极。'], result: '2 个' },
    moreExamples: [{ problem: '指标 k 的临界点对应粘什么？', walkthrough: ['k 柄。'], result: 'k 柄' }],
  },
  {
    id: 'poincare-hopf',
    title: '庞加莱－霍普夫定理',
    tag: '微分拓扑',
    level: '竞赛',
    essence: '向量场零点指标之和等于欧拉示性数，这解释了毛球定理并联系起拓扑与向量场。',
    definition: '向量场孤立零点处的指标是零点附近映射到球面的度；庞加莱－霍普夫说指标和等于欧拉示性数。',
    whenToUse: ['判断向量场存在', '算欧拉示性数', '证明毛球定理'],
    theorems: [
      { name: '庞加莱－霍普夫', statement: '指标和等于欧拉示性数。', formula: '\\sum\\mathrm{ind}=\\chi(M)' },
      { name: '毛球定理', statement: '偶数维球面无处处非零向量场。' },
    ],
    steps: [
      { title: '取向量场', body: '一般位置。' },
      { title: '找零点', body: '孤立零点。' },
      { title: '算指标', body: '局部度。' },
      { title: '求和', body: '得欧拉示性数。' },
      { title: '得推论', body: '判断是否必然有零点。' },
    ],
    pitfalls: ['把指标当零点个数', '忽略孤立性', 'χ≠0 时仍以为可无零点'],
    example: { problem: 'S² 上向量场零点指标和是多少？', walkthrough: ['$\\chi(S^2)=2$。'], result: '2' },
    moreExamples: [{ problem: '环面上存在处处非零向量场吗？', walkthrough: ['$\\chi=0$，可以。'], result: '可以' }],
  },

  {
    id: 'triangle-congruence',
    title: '三角形全等与欧氏公理起步',
    tag: '非欧几何',
    level: '基础',
    essence: '全等判定（SSS、SAS、ASA）是欧氏几何推理的起点，它们建立在合同公理之上。',
    definition: '两个三角形全等指存在保持距离与角的对应；SSS、SAS、ASA 是判定全等的充分条件。',
    whenToUse: ['证明线段相等', '证明角相等', '构造全等'],
    theorems: [
      { name: 'SAS', statement: '两边及夹角对应相等则全等。' },
      { name: 'SSS', statement: '三边对应相等则全等。' },
    ],
    steps: [
      { title: '找对应', body: '明确顶点对应关系。' },
      { title: '列已知', body: '边或角的相等条件。' },
      { title: '选判定', body: 'SSS/SAS/ASA。' },
      { title: '得全等', body: '写出全等关系。' },
      { title: '推结论', body: '余下边角相等。' },
    ],
    pitfalls: ['用 SSA（不成立）', '对应顶点写错', '把相似当全等'],
    example: { problem: 'SSA 能判定全等吗？', walkthrough: ['存在两解的反例。'], result: '不能' },
    moreExamples: [{ problem: '全等与相似的区别？', walkthrough: ['全等还要求边长相等。'], result: '全等更强' }],
  },
  {
    id: 'hilbert-axioms',
    title: '希尔伯特公理系统',
    tag: '非欧几何',
    level: '进阶',
    essence: '希尔伯特用五组公理（关联、顺序、合同、平行、连续）严格化欧氏几何，补上了欧几里得省略的「之间」与「连续」。',
    definition: '五组公理分别刻画点线面的关联、点的顺序、图形合同、平行公设与连续性（阿基米德与完备性）。',
    whenToUse: ['严格化证明', '分析公理独立性', '比较几何体系'],
    theorems: [
      { name: '顺序公理的作用', statement: '保证「之间」概念有定义。' },
      { name: '连续公理', statement: '保证直线与圆相交等存在性。' },
    ],
    steps: [
      { title: '列对象', body: '点、线、面。' },
      { title: '写关联', body: '点在线上。' },
      { title: '写顺序', body: '之间关系。' },
      { title: '写合同', body: '线段与角相等。' },
      { title: '补平行与连续', body: '完成系统。' },
    ],
    pitfalls: ['以为欧几里得原本已完备', '忽略顺序公理', '平行公设混入其他组'],
    example: { problem: '希尔伯特公理有几组？', walkthrough: ['关联、顺序、合同、平行、连续。'], result: '5 组' },
    moreExamples: [{ problem: '欧几里得原本缺什么？', walkthrough: ['顺序与连续性。'], result: '顺序与连续' }],
  },
  {
    id: 'similar-triangles',
    title: '相似三角形与比例',
    tag: '非欧几何',
    level: '进阶',
    essence: '相似三角形对应边成比例，是测量与勾股定理证明的核心工具；它依赖平行公设。',
    definition: '两个三角形相似指对应角相等、对应边成比例；AA 是相似判定的核心条件。',
    whenToUse: ['算长度', '证明比例关系', '推导勾股定理'],
    theorems: [
      { name: 'AA 判定', statement: '两角对应相等则相似。' },
      { name: '勾股定理', statement: '直角三角形两直角边平方和等于斜边平方。', formula: 'a^2+b^2=c^2' },
    ],
    steps: [
      { title: '找等角', body: '用平行线或已知条件。' },
      { title: '得相似', body: 'AA 判定。' },
      { title: '写比例', body: '对应边成比例。' },
      { title: '解方程', body: '求未知长度。' },
      { title: '验算', body: '代回。' },
    ],
    pitfalls: ['把相似比与面积比混淆（面积比是平方）', '对应边找错', '在非欧几何套用'],
    example: { problem: '相似比为 2 时面积比是多少？', walkthrough: ['面积比是相似比平方。'], result: '4' },
    moreExamples: [{ problem: '相似判定最常用哪个？', walkthrough: ['AA。'], result: 'AA' }],
  },
  {
    id: 'area-scissors',
    title: '面积与剖分相等',
    tag: '非欧几何',
    level: '进阶',
    essence: '两个多边形剖分相等指可切成有限块互相拼合；在欧氏平面中剖分相等与面积相等等价（华莱士－博尔雅伊－格维恩定理）。',
    definition: '剖分相等（剪刀全等）指存在有限剖分使两块分别全等；面积相等是数值条件。',
    whenToUse: ['证明面积公式', '构造拼图', '理解面积公理'],
    theorems: [
      { name: '剖分等价面积', statement: '欧氏平面中多边形剖分相等当且仅当面积相等。' },
      { name: '希尔伯特第三问题', statement: '三维中并不总成立（迪恩定理）。' },
    ],
    steps: [
      { title: '画多边形', body: '明确边界。' },
      { title: '切三角形', body: '三角剖分。' },
      { title: '拼矩形', body: '转化为等面积矩形。' },
      { title: '比较面积', body: '数值相等。' },
      { title: '得剖分', body: '按构造拼合。' },
    ],
    pitfalls: ['把剖分相等当相似', '三维直接类推', '忽略有限块要求'],
    example: { problem: '二维中面积相等的多边形一定剖分相等吗？', walkthrough: ['Bolyai-Gerwien 定理。'], result: '一定' },
    moreExamples: [{ problem: '三维中面积相等能推出剖分相等吗？', walkthrough: ['不能（Dehn 不变量）。'], result: '不能' }],
  },
  {
    id: 'constructible-numbers',
    title: '尺规作图与可构造数',
    tag: '非欧几何',
    level: '竞赛',
    essence: '尺规能构造的长度恰是可由有理数经加减乘除与开平方得到的数，由此判定三等分角与倍立方不可能。',
    definition: '可构造数是能从单位长度出发用尺规作出的长度；它们构成对开平方封闭的域。',
    whenToUse: ['判定作图不可能', '正多边形作图', '域扩张'],
    theorems: [
      { name: '可构造判据', statement: '可构造数在有理数上的扩张次数为 2 的幂。' },
      { name: '不可能作图', statement: '三等分任意角、倍立方、化圆为方均不可能。' },
    ],
    steps: [
      { title: '建模为域', body: '从有理数出发。' },
      { title: '允许运算', body: '加减乘除与开方。' },
      { title: '算扩张次数', body: '看是否为 2 的幂。' },
      { title: '判可构造', body: '次数不符则不可。' },
      { title: '得结论', body: '作图不可能。' },
    ],
    pitfalls: ['把近似作图当精确', '忘记次数条件', '混淆代数次数与扩张次数'],
    example: { problem: '倍立方需要构造什么数？', walkthrough: ['2 的立方根。'], result: '\\sqrt[3]{2}' },
    moreExamples: [{ problem: '正十七边形可构造吗？', walkthrough: ['高斯定理，17 是费马素数。'], result: '可构造' }],
  },
  {
    id: 'hyperbolic-models',
    title: '双曲几何的模型',
    tag: '非欧几何',
    level: '竞赛',
    essence: '双曲几何有多种模型：庞加莱圆盘保角、上半平面便于计算、克莱因模型测地线是直线。',
    definition: '模型是欧氏空间中的实现，使双曲公理成立。不同模型之间通过等距变换互相转换。',
    whenToUse: ['计算双曲距离', '画双曲图形', '证明相容性'],
    theorems: [
      { name: '模型相容', statement: '模型存在即证明双曲几何相对相容。' },
      { name: '保角性', statement: '庞加莱模型保持角度。' },
    ],
    steps: [
      { title: '选模型', body: '圆盘、半平面或克莱因。' },
      { title: '写度量', body: '双曲距离公式。' },
      { title: '找测地线', body: '正交圆弧。' },
      { title: '算不变量', body: '面积或距离。' },
      { title: '转换模型', body: '用等距变换。' },
    ],
    pitfalls: ['把边界当双曲内部', '混淆各模型的测地线形状', '用欧氏距离代双曲距离'],
    example: { problem: '庞加莱圆盘的测地线是什么？', walkthrough: ['与边界正交的圆弧。'], result: '正交圆弧' },
    moreExamples: [{ problem: '克莱因模型的测地线？', walkthrough: ['直线段。'], result: '直线段' }],
  },
  {
    id: 'elliptic-geometry',
    title: '椭圆几何与球面几何的关系',
    tag: '非欧几何',
    level: '竞赛',
    essence: '椭圆几何把对径点认同，任意两条直线都相交；球面几何是它的二重覆叠。',
    definition: '椭圆几何是球面几何认同对径点得到的射影型几何，没有平行线，三角形内角和大于 π。',
    whenToUse: ['比较三种几何', '理解射影结构', '曲率正定'],
    theorems: [
      { name: '无平行线', statement: '任意两条直线相交。' },
      { name: '内角和', statement: '三角形内角和大于 π。' },
    ],
    steps: [
      { title: '从球面出发', body: '大圆作为直线。' },
      { title: '认同对径', body: '得到椭圆平面。' },
      { title: '看交点数', body: '两直线恰交一点。' },
      { title: '算内角和', body: '大于 π。' },
      { title: '比较曲率', body: '正曲率。' },
    ],
    pitfalls: ['把椭圆几何与球面几何等同', '以为存在平行线', '内角和套 180 度'],
    example: { problem: '椭圆几何中有平行线吗？', walkthrough: ['任意两直线相交。'], result: '没有' },
    moreExamples: [{ problem: '球面几何是椭圆几何的什么？', walkthrough: ['二重覆叠。'], result: '二重覆叠' }],
  },

  {
    id: 'homogeneous-coordinates',
    title: '齐次坐标与射影平面',
    tag: '射影几何',
    level: '进阶',
    essence: '齐次坐标用三维向量表示射影点，整体缩放视为同一点，从而让平行线在无穷远处相交。',
    definition: '射影点是三维非零向量的缩放等价类；坐标三元组整体乘非零常数表示同一点。',
    whenToUse: ['表示无穷远点', '做射影计算', '统一仿射与射影'],
    theorems: [
      { name: '缩放等价', statement: '三元组差非零常数倍表示同一点。', formula: '(x:y:z)=(\\lambda x:\\lambda y:\\lambda z)' },
      { name: '无穷远线', statement: '第三坐标为 0 的点构成无穷远线。' },
    ],
    steps: [
      { title: '取仿射点', body: '写成 (x,y,1)。' },
      { title: '加无穷远点', body: '方向向量 (u,v,0)。' },
      { title: '做运算', body: '用叉积求交点连线。' },
      { title: '归一化', body: '去掉缩放。' },
      { title: '读回仿射', body: '除第三坐标。' },
    ],
    pitfalls: ['把整体缩放当不同点', '混淆齐次与非齐次坐标', '忘记排除零向量'],
    example: { problem: '平行线在射影平面交于？', walkthrough: ['同方向对应同一个无穷远点。'], result: '无穷远点' },
    moreExamples: [{ problem: '无穷远线由哪些点组成？', walkthrough: ['第三坐标为 0。'], result: '第三坐标为 0' }],
  },
  {
    id: 'projective-duality',
    title: '射影对偶原理',
    tag: '射影几何',
    level: '进阶',
    essence: '射影平面中「点」与「线」互换后命题仍成立：对偶把每个定理变成另一条定理。',
    definition: '对偶把点换成线、线换成点，关联关系保持；对偶命题与原命题同时成立。',
    whenToUse: ['简化证明', '生成新定理', '构造配极'],
    theorems: [
      { name: '对偶原理', statement: '射影平面命题的对偶命题成立。' },
      { name: '笛沙格对偶', statement: '两三角形透视的对偶形式。' },
    ],
    steps: [
      { title: '写原命题', body: '只含点线与关联。' },
      { title: '逐词互换', body: '点↔线、共线↔共点。' },
      { title: '得对偶命题', body: '保持结构。' },
      { title: '验证', body: '由对偶原理自动成立。' },
      { title: '用结论', body: '得到新定理。' },
    ],
    pitfalls: ['把度量概念带入对偶', '忽略无穷远元素', '互换不彻底'],
    example: { problem: '「两点确定一条直线」的对偶是什么？', walkthrough: ['两线确定一个交点。'], result: '两线确定一点' },
    moreExamples: [{ problem: '对偶原理依赖什么？', walkthrough: ['射影平面的自对偶性。'], result: '自对偶' }],
  },
  {
    id: 'harmonic-conjugates',
    title: '调和分割与交比',
    tag: '射影几何',
    level: '竞赛',
    essence: '交比等于 −1 的四点称调和分割，它刻画完全四点形的对角线关系，是射影几何的基本构型。',
    definition: '调和分割指四点交比为 −1；完全四边形中每条对角线与另两顶点调和共轭。',
    whenToUse: ['构造射影坐标', '证明共线', '研究配极'],
    theorems: [
      { name: '调和共轭', statement: '对角线交点与两顶点调和。' },
      { name: '交比不变', statement: '调和性在射影变换下保持。' },
    ],
    steps: [
      { title: '取四点', body: '共线四点。' },
      { title: '算交比', body: '按定义。' },
      { title: '判 −1', body: '是否调和。' },
      { title: '用完全四边形', body: '找共轭关系。' },
      { title: '做变换', body: '验证保持。' },
    ],
    pitfalls: ['交比顺序搞错导致非 −1', '混淆调和与等分', '忽略有向比'],
    example: { problem: '调和分割的交比是多少？', walkthrough: ['按定义。'], result: '−1' },
    moreExamples: [{ problem: '调和性在射影变换下保持吗？', walkthrough: ['交比不变。'], result: '保持' }],
  },
  {
    id: 'pappus-pascal',
    title: '帕普斯定理与帕斯卡定理',
    tag: '射影几何',
    level: '竞赛',
    essence: '帕普斯定理是射影几何的起点：两条直线上各取三点，交错的连线交点共线。',
    definition: '帕普斯：两直线上各三点，三对交叉连线的交点共线。帕斯卡：圆锥曲线内接六边形对边交点共线。',
    whenToUse: ['证明共线', '构造射影结构', '研究圆锥曲线'],
    theorems: [
      { name: '帕普斯定理', statement: '交错连线的三个交点共线。' },
      { name: '帕斯卡定理', statement: '内接六边形三对对边交点共线。' },
    ],
    steps: [
      { title: '标点', body: '两直线各三点。' },
      { title: '连交错线', body: '按规则配对。' },
      { title: '求交点', body: '三对交点。' },
      { title: '验共线', body: '用交比或坐标。' },
      { title: '推广', body: '到圆锥曲线（帕斯卡）。' },
    ],
    pitfalls: ['点序配错', '把帕普斯与帕斯卡混淆', '在仿射情形丢无穷远点'],
    example: { problem: '帕斯卡定理的三点共线称什么线？', walkthrough: ['帕斯卡线。'], result: '帕斯卡线' },
    moreExamples: [{ problem: '帕普斯定理是帕斯卡的什么？', walkthrough: ['退化圆锥曲线情形。'], result: '退化情形' }],
  },
  {
    id: 'polar-reciprocation',
    title: '极点、极线与配极',
    tag: '射影几何',
    level: '竞赛',
    essence: '圆锥曲线诱导点与线的对偶（配极），极点在曲线内则极线不相交，反之相交。',
    definition: '配极把点映到极线、线映到极点，由二次型的对称双线性形式定义。',
    whenToUse: ['构造对偶', '研究切线与割线', '证明共点共线'],
    theorems: [
      { name: '配极对合', statement: '配极两次回到原点。' },
      { name: '极点极线关系', statement: '点在曲线上时极线是切线。' },
    ],
    steps: [
      { title: '写二次型', body: '圆锥曲线方程。' },
      { title: '取点', body: '求极线方程。' },
      { title: '取线', body: '求极点。' },
      { title: '判位置', body: '点在内外。' },
      { title: '用对合', body: '两次回原。' },
    ],
    pitfalls: ['把极线当切线（仅曲线上的点）', '忽略符号约定', '在退化曲线硬用'],
    example: { problem: '点在圆锥曲线上时极线是什么？', walkthrough: ['化为切线。'], result: '切线' },
    moreExamples: [{ problem: '配极是对合吗？', walkthrough: ['两次回到原点。'], result: '是' }],
  },
  {
    id: 'conic-classification',
    title: '圆锥曲线的射影分类',
    tag: '射影几何',
    level: '竞赛',
    essence: '射影意义下非退化圆锥曲线只有一类；椭圆、抛物线、双曲线的差别在于与无穷远线的位置关系。',
    definition: '射影分类由二次型的秩与惯性指数决定；非退化圆锥曲线在射影变换下互相等价。',
    whenToUse: ['统一处理圆锥曲线', '判断退化', '研究分类'],
    theorems: [
      { name: '非退化唯一', statement: '非退化圆锥曲线射影等价。' },
      { name: '与无穷远线关系', statement: '椭圆不相交、抛物相切、双曲相交。' },
    ],
    steps: [
      { title: '写二次型', body: '对称矩阵。' },
      { title: '判非退化', body: '行列式非零。' },
      { title: '看无穷远线', body: '相交情况。' },
      { title: '分类', body: '椭圆/抛物/双曲。' },
      { title: '射影化简', body: '得标准形。' },
    ],
    pitfalls: ['把仿射分类当射影分类', '忽略退化情形', '混淆切触与相交'],
    example: { problem: '椭圆与双曲线射影等价吗？', walkthrough: ['非退化时等价。'], result: '等价' },
    moreExamples: [{ problem: '抛物线与无穷远线的关系？', walkthrough: ['相切。'], result: '相切' }],
  },

  {
    id: 'nullstellensatz',
    title: '希尔伯特零点定理',
    tag: '代数几何',
    level: '竞赛',
    essence: '代数闭域上，理想与零点集互为反函数：极大理想对应点，理想的根对应零点集，这把代数与几何精确对应起来。',
    definition: '零点定理说代数闭域上多项式的零点集非空当且仅当理想真；且 I(V(J)) 等于 J 的根。',
    whenToUse: ['建立代数几何对应', '判断方程组有解', '研究坐标环'],
    theorems: [
      { name: '弱零点定理', statement: '真理想有公共零点（代数闭域）。' },
      { name: '强零点定理', statement: 'I(V(J)) = √J。', formula: 'I(V(J))=\\sqrt{J}' },
    ],
    steps: [
      { title: '取理想', body: '多项式组生成。' },
      { title: '求零点集', body: '共同零点。' },
      { title: '反向取理想', body: '消失理想。' },
      { title: '取根', body: '比较是否相等。' },
      { title: '读几何', body: '得簇与坐标环。' },
    ],
    pitfalls: ['在非代数闭域套用', '把理想当根理想', '忽略真理想条件'],
    example: { problem: '代数闭域上真理想一定有零点吗？', walkthrough: ['弱零点定理。'], result: '有' },
    moreExamples: [{ problem: 'I(V(J)) 等于什么？', walkthrough: ['J 的根。'], result: '√J' }],
  },
  {
    id: 'morphisms-varieties',
    title: '簇的态射与坐标环',
    tag: '代数几何',
    level: '竞赛',
    essence: '簇之间的态射由坐标环的反向同态给出，几何的映射变成代数的拉回。',
    definition: '簇态射是局部由多项式给出的连续映射；它诱导坐标环的反向同态。',
    whenToUse: ['构造映射', '判同构', '研究函子性'],
    theorems: [
      { name: '反变对应', statement: '态射对应坐标环反向同态。' },
      { name: '同构判据', statement: '坐标环同构则簇同构（仿射）。' },
    ],
    steps: [
      { title: '写坐标环', body: '两个簇的环。' },
      { title: '给环同态', body: '反向。' },
      { title: '写多项式映射', body: '分量多项式。' },
      { title: '验良定义', body: '像落在目标簇。' },
      { title: '得态射', body: '完成。' },
    ],
    pitfalls: ['方向搞反（反变）', '忽略像的落点', '把连续当态射'],
    example: { problem: '态射诱导坐标环的什么？', walkthrough: ['反向同态。'], result: '反变同态' },
    moreExamples: [{ problem: '仿射簇同构的判据？', walkthrough: ['坐标环同构。'], result: '环同构' }],
  },
  {
    id: 'sheaves',
    title: '层与茎',
    tag: '代数几何',
    level: '竞赛',
    essence: '层把局部数据粘成整体数据，茎刻画一点附近的极限行为；层是概形理论的语言。',
    definition: '层是开集到集合/环的函子，满足局部性与粘合性；茎是包含该点的开集上截面的正向极限。',
    whenToUse: ['局部到整体', '定义概形', '上同调'],
    theorems: [
      { name: '粘合公理', statement: '局部一致则可粘成整体截面。' },
      { name: '茎判据', statement: '态射在每根茎上同构则是层同构。' },
    ],
    steps: [
      { title: '定开集族', body: '拓扑空间。' },
      { title: '给截面', body: '每个开集上的数据。' },
      { title: '定限制映射', body: '相容性。' },
      { title: '验粘合', body: '局部一致可粘。' },
      { title: '取茎', body: '看一点附近。' },
    ],
    pitfalls: ['把预层当层', '忽略限制映射', '茎与纤维混淆'],
    example: { problem: '层与预层的区别？', walkthrough: ['层满足粘合公理。'], result: '粘合性' },
    moreExamples: [{ problem: '茎是什么的极限？', walkthrough: ['包含该点的开集截面。'], result: '正向极限' }],
  },
  {
    id: 'schemes',
    title: '概形：把点推广成素理想',
    tag: '代数几何',
    level: '竞赛',
    essence: '概形把簇的「点」换成素理想，从而统一处理整数环与多项式环，并容纳非闭点与幂零元。',
    definition: '仿射概形是素谱配上结构层；一般概形由仿射概形粘合而成。',
    whenToUse: ['统一数论与几何', '研究模空间', '现代代数几何'],
    theorems: [
      { name: '素谱对应', statement: '仿射概形的点即素理想。' },
      { name: '结构层', statement: '局部化为坐标环。' },
    ],
    steps: [
      { title: '取环', body: '坐标环。' },
      { title: '取素谱', body: '素理想全体。' },
      { title: '装扎里斯基拓扑', body: '闭集由理想定义。' },
      { title: '加结构层', body: '局部化。' },
      { title: '粘合', body: '得一般概形。' },
    ],
    pitfalls: ['把点当闭点（还有非闭点）', '忽略幂零元', '把概形当簇'],
    example: { problem: '仿射概形的点是？', walkthrough: ['素理想。'], result: '素理想' },
    moreExamples: [{ problem: '概形比簇多了什么？', walkthrough: ['非闭点与幂零结构。'], result: '更多点与幂零元' }],
  },
  {
    id: 'coherent-cohomology',
    title: '凝聚层上同调',
    tag: '代数几何',
    level: '竞赛',
    essence: '层上同调度量整体截面的障碍；凝聚层上同调有限维，Serre 对偶把它与互补维数联系起来。',
    definition: '层上同调是内射消解取截面后的导出函子；凝聚层是局部由有限生成模给出的层。',
    whenToUse: ['计算不变量', '黎曼－罗赫', '消灭定理'],
    theorems: [
      { name: '有限维性', statement: '射影簇上凝聚层上同调有限维。' },
      { name: 'Serre 对偶', statement: '上同调与互补维数对偶。' },
    ],
    steps: [
      { title: '取层', body: '凝聚层。' },
      { title: '取消解', body: '内射或弗拉施克。' },
      { title: '取截面', body: '得复形。' },
      { title: '算上同调', body: '取商群。' },
      { title: '用对偶', body: '联系互补维数。' },
    ],
    pitfalls: ['把上同调当同调', '忽略凝聚性', '在仿射情形期待非零高维上同调'],
    example: { problem: '仿射概形上凝聚层的高维上同调？', walkthrough: ['Serre 定理：为零。'], result: '0' },
    moreExamples: [{ problem: 'Serre 对偶联系什么？', walkthrough: ['互补维数的上同调。'], result: '互补维数' }],
  },
  {
    id: 'dimension-theory',
    title: '维数与贝祖定理',
    tag: '代数几何',
    level: '竞赛',
    essence: '簇的维数是坐标环的克鲁尔维数；两条平面曲线交点数（计重数）等于次数之积。',
    definition: '簇的维数是极大链长度；贝祖定理说两条无公共分量的平面曲线交于 d·e 个点（计重数）。',
    whenToUse: ['算交点数', '判维数', '计数几何'],
    theorems: [
      { name: '克鲁尔维数', statement: '维数等于坐标环的克鲁尔维数。' },
      { name: '贝祖定理', statement: '交点数等于次数之积。', formula: 'd\\cdot e' },
    ],
    steps: [
      { title: '写方程', body: '两条曲线。' },
      { title: '看次数', body: '最高次。' },
      { title: '求交点', body: '联立求解。' },
      { title: '计重数', body: '切触加倍。' },
      { title: '验贝祖', body: '点数和等于乘积。' },
    ],
    pitfalls: ['忽略重数与无穷远点', '有公共分量仍套公式', '混淆次数与维数'],
    example: { problem: '两条二次曲线一般交几点？', walkthrough: ['$2\\times2=4$。'], result: '4 点' },
    moreExamples: [{ problem: '维数的代数定义？', walkthrough: ['克鲁尔维数。'], result: '克鲁尔维数' }],
  },

  {
    id: 'inner-product',
    title: '内积空间与正交性',
    tag: '线性代数',
    level: '进阶',
    essence: '内积给向量空间加上长度与角度，正交是其中最核心的结构：勾股定理、投影与正交基都由此展开。',
    definition: '内积是满足正定、对称、线性的二元函数；两个向量正交指内积为零。',
    whenToUse: ['算长度角度', '构造正交基', '做投影'],
    theorems: [
      { name: '柯西－施瓦茨', statement: '内积绝对值不超过范数之积。', formula: '|\\langle u,v\\rangle|\\le\\|u\\|\\|v\\|' },
      { name: '勾股定理', statement: '正交向量范数平方相加。' },
    ],
    steps: [
      { title: '写内积', body: '定义或标准内积。' },
      { title: '算长度', body: '内积开根。' },
      { title: '判正交', body: '内积是否为零。' },
      { title: '做投影', body: '除以范数平方。' },
      { title: '正交化', body: '用 Gram-Schmidt。' },
    ],
    pitfalls: ['把内积当逐项乘积', '忽略正定性', '复空间忘记共轭'],
    example: { problem: '(1,0) 与 (0,1) 的内积？', walkthrough: ['标准内积。'], result: '0（正交）' },
    moreExamples: [{ problem: '柯西－施瓦茨给出什么界？', walkthrough: ['内积绝对值。'], result: '范数之积' }],
  },
  {
    id: 'orthogonal-projection',
    title: '正交投影与最小二乘',
    tag: '线性代数',
    level: '进阶',
    essence: '投影把向量分解为子空间内与正交补两部分，最小二乘就是投影的应用：残差与列空间正交。',
    definition: '正交投影是沿正交补到子空间的线性映射；它由内积唯一确定，满足幂等与自伴。',
    whenToUse: ['拟合数据', '解超定方程', '构造投影矩阵'],
    theorems: [
      { name: '最佳逼近', statement: '投影是最接近的子空间元素。' },
      { name: '正规方程', statement: '最小二乘解满足 $A^TAx=A^Tb$。', formula: 'A^TAx=A^Tb' },
    ],
    steps: [
      { title: '定子空间', body: '列空间或给定基。' },
      { title: '算投影', body: '$A(A^TA)^{-1}A^Tb$。' },
      { title: '验正交', body: '残差与列空间正交。' },
      { title: '解方程', body: '正规方程。' },
      { title: '看误差', body: '残差范数。' },
    ],
    pitfalls: ['把投影当普通投影（非正交）', '忘记转置', 'A 列不满秩时硬求逆'],
    example: { problem: '最小二乘解满足什么方程？', walkthrough: ['正规方程。'], result: 'A^TAx=A^Tb' },
    moreExamples: [{ problem: '残差与列空间的关系？', walkthrough: ['正交。'], result: '正交' }],
  },
  {
    id: 'svd',
    title: '奇异值分解',
    tag: '线性代数',
    level: '竞赛',
    essence: '任何矩阵都能分解为「旋转—拉伸—旋转」，奇异值刻画拉伸幅度，是数据科学的核心工具。',
    definition: 'SVD 把矩阵写成 $U\\Sigma V^T$，U、V 正交，Σ 对角元为非负奇异值。',
    whenToUse: ['降维', '求伪逆', '分析矩阵'],
    theorems: [
      { name: '存在性', statement: '任意实矩阵都有 SVD。', formula: 'A=U\\Sigma V^T' },
      { name: '奇异值', statement: '奇异值是 $A^TA$ 特征值的平方根。' },
    ],
    steps: [
      { title: '算 $A^TA$', body: '对称矩阵。' },
      { title: '求特征值', body: '得奇异值平方。' },
      { title: '求右奇异向量', body: '特征向量。' },
      { title: '求左奇异向量', body: '$Av/\\sigma$。' },
      { title: '组装', body: '写 $U\\Sigma V^T$。' },
    ],
    pitfalls: ['把奇异值当特征值', '忽略零奇异值与秩', '符号不唯一当不唯一解'],
    example: { problem: '秩等于多少非零奇异值？', walkthrough: ['SVD 与秩。'], result: '秩 = 非零奇异值个数' },
    moreExamples: [{ problem: '奇异值与 $A^TA$ 特征值的关系？', walkthrough: ['平方根。'], result: '平方根' }],
  },
  {
    id: 'dual-space',
    title: '对偶空间与对偶映射',
    tag: '线性代数',
    level: '竞赛',
    essence: '对偶空间是线性泛函全体，它把「向量」换成「测量」，让转置与拉回有统一解释。',
    definition: '对偶空间是线性泛函构成的空间；对偶映射把泛函拉回到原空间。',
    whenToUse: ['理解转置', '张量与微分形式', '泛函分析'],
    theorems: [
      { name: '维数相同', statement: '有限维空间与其对偶同维。' },
      { name: '对偶基', statement: '给定基有唯一对偶基。', formula: '\\langle e^i,e_j\\rangle=\\delta^i_j' },
    ],
    steps: [
      { title: '取基', body: '原空间基。' },
      { title: '构造对偶基', body: '按指示函数。' },
      { title: '写泛函', body: '坐标线性组合。' },
      { title: '取对偶映射', body: '拉回。' },
      { title: '联系转置', body: '矩阵即转置。' },
    ],
    pitfalls: ['把对偶空间等同原空间（需内积）', '无限维忽略代数对偶与分析对偶', '指标上下标混淆'],
    example: { problem: '对偶映射的矩阵是什么？', walkthrough: ['转置。'], result: '转置矩阵' },
    moreExamples: [{ problem: '对偶基满足什么？', walkthrough: ['克罗内克 δ。'], result: '\\delta^i_j' }],
  },
  {
    id: 'minimal-polynomial',
    title: '特征多项式与最小多项式',
    tag: '线性代数',
    level: '竞赛',
    essence: '特征多项式由行列式定义，最小多项式是使矩阵为零的最低次多项式；两者整除关系决定可对角化。',
    definition: '特征多项式是 $\\det(\\lambda I-A)$；最小多项式是使 $m(A)=0$ 的首一最低次多项式。',
    whenToUse: ['判可对角化', '算矩阵幂', '若尔当形'],
    theorems: [
      { name: '凯莱－哈密顿', statement: '特征多项式使矩阵为零。', formula: 'p(A)=0' },
      { name: '可对角化判据', statement: '最小多项式无重根即可对角化。' },
    ],
    steps: [
      { title: '算特征多项式', body: '行列式。' },
      { title: '求最小多项式', body: '试因子。' },
      { title: '看重根', body: '是否可对角化。' },
      { title: '用凯莱－哈密顿', body: '降幂计算。' },
      { title: '得结论', body: '对角化或若尔当形。' },
    ],
    pitfalls: ['把特征多项式当最小多项式', '忽略重数', '在不可对角化时硬套对角'],
    example: { problem: '最小多项式无重根说明什么？', walkthrough: ['可对角化。'], result: '可对角化' },
    moreExamples: [{ problem: '凯莱－哈密顿说什么？', walkthrough: ['$p(A)=0$。'], result: '特征多项式零化矩阵' }],
  },
  {
    id: 'matrix-norms',
    title: '矩阵范数与条件数',
    tag: '线性代数',
    level: '竞赛',
    essence: '矩阵范数度量线性映射的放大倍数，条件数度量方程组对扰动的敏感度，是数值稳定性的核心。',
    definition: '矩阵范数是满足次乘性的向量范数诱导范数；条件数是 $\\|A\\|\\|A^{-1}\\|$。',
    whenToUse: ['分析稳定性', '估计误差', '迭代法收敛'],
    theorems: [
      { name: '诱导范数', statement: '算子范数等于单位球上像的范数上确界。' },
      { name: '条件数下界', statement: '条件数不小于 1。', formula: '\\kappa(A)\\ge1' },
    ],
    steps: [
      { title: '选范数', body: '1、2 或无穷。' },
      { title: '算 $\\|A\\|$', body: '列和、谱范数或行和。' },
      { title: '求逆', body: '算 $A^{-1}$。' },
      { title: '算条件数', body: '乘积。' },
      { title: '判稳定', body: '条件数大小。' },
    ],
    pitfalls: ['把条件数当行列式', '混淆不同范数', '奇异矩阵条件数无穷'],
    example: { problem: '单位矩阵的条件数？', walkthrough: ['范数为 1。'], result: '1' },
    moreExamples: [{ problem: '奇异矩阵的条件数？', walkthrough: ['逆不存在。'], result: '无穷' }],
  },

  {
    id: 'normal-subgroup',
    title: '正规子群与商群',
    tag: '群论',
    level: '进阶',
    essence: '正规子群是左右陪集相等的子群，只有它能做商群；它恰好是同态的核。',
    definition: '子群 N 正规指对任意 g 有 $gNg^{-1}=N$；商群是陪集集合在代表元运算下构成的群。',
    whenToUse: ['构造商群', '判断同态核', '简化群'],
    theorems: [
      { name: '正规判据', statement: '左右陪集相等等价于共轭不变。' },
      { name: '核正规', statement: '同态的核是正规子群。' },
    ],
    steps: [
      { title: '取子群', body: '候选 N。' },
      { title: '验共轭不变', body: '$gNg^{-1}\\subseteq N$。' },
      { title: '写陪集', body: '左陪集即右陪集。' },
      { title: '定义运算', body: '代表元相乘。' },
      { title: '验良定义', body: '与代表选取无关。' },
    ],
    pitfalls: ['把任意子群当正规', '忘记良定义验证', '混淆商群元素与元素本身'],
    example: { problem: '指数为 2 的子群正规吗？', walkthrough: ['左右陪集都是两条。'], result: '正规' },
    moreExamples: [{ problem: '交换群的子群都正规吗？', walkthrough: ['共轭即自身。'], result: '都正规' }],
  },
  {
    id: 'isomorphism-theorems',
    title: '同态基本定理',
    tag: '群论',
    level: '竞赛',
    essence: '同态把群映成商群：$G/\\ker\\varphi\\cong\\mathrm{Im}\\varphi$，这是所有结构定理的模板。',
    definition: '同态基本定理说同态诱导定义域模核到像的同构；另有第二、第三同构定理。',
    whenToUse: ['识别商群', '证同构', '化简计算'],
    theorems: [
      { name: '第一同构定理', statement: '商掉核同构于像。', formula: 'G/\\ker\\varphi\\cong\\mathrm{Im}\\varphi' },
      { name: '对应定理', statement: '商群的子群对应原群含核的子群。' },
    ],
    steps: [
      { title: '找同态', body: '构造自然映射。' },
      { title: '求核', body: '解映到单位元。' },
      { title: '求像', body: '实际取值集。' },
      { title: '用定理', body: '商模核同构于像。' },
      { title: '得结论', body: '识别结构。' },
    ],
    pitfalls: ['把核当平凡而忽略', '像不是整个陪域', '混用三个同构定理'],
    example: { problem: 'Z 到 Z/n 的自然同态的商是什么？', walkthrough: ['核为 nZ。'], result: 'Z/nZ' },
    moreExamples: [{ problem: '同态基本定理的模板？', walkthrough: ['商掉核。'], result: '商模核 ≅ 像' }],
  },
  {
    id: 'p-groups',
    title: 'p 群与西罗子群',
    tag: '群论',
    level: '竞赛',
    essence: 'p 群是阶为素数幂的群，它们有非平凡中心，因此可解；西罗子群是最大的 p 子群。',
    definition: 'p 群指阶为 $p^n$ 的群；其中心非平凡，且存在中心列。',
    whenToUse: ['证明可解', '分析有限群结构', '用西罗定理'],
    theorems: [
      { name: '中心非平凡', statement: '非平凡 p 群中心非平凡。' },
      { name: 'p 群可解', statement: '所有 p 群可解。' },
    ],
    steps: [
      { title: '看阶', body: '是否为素数幂。' },
      { title: '用类方程', body: '中心非平凡。' },
      { title: '归纳', body: '商掉中心继续。' },
      { title: '得中心列', body: '构造上中心列。' },
      { title: '判可解', body: '交换商群。' },
    ],
    pitfalls: ['把 p 群当交换群', '忽略中心非平凡', '混淆 p 子群与西罗子群'],
    example: { problem: '阶为 p² 的群交换吗？', walkthrough: ['中心非平凡且指数 p。'], result: '交换' },
    moreExamples: [{ problem: 'p 群可解吗？', walkthrough: ['中心列给出交换商群。'], result: '可解' }],
  },
  {
    id: 'composition-series',
    title: '合成列与若尔当－赫尔德定理',
    tag: '群论',
    level: '竞赛',
    essence: '合成列把群分解成单群，若尔当－赫尔德定理说合成因子（不计顺序）唯一。',
    definition: '合成列是子群链使每个商群单群；合成因子是这些商群。',
    whenToUse: ['分析群结构', '判可解', '研究单群'],
    theorems: [
      { name: '若尔当－赫尔德', statement: '合成因子不计顺序唯一。' },
      { name: '可解判据', statement: '合成因子全为素数阶循环群则可解。' },
    ],
    steps: [
      { title: '找极大正规子群', body: '商单群。' },
      { title: '递推', body: '继续细分。' },
      { title: '得合成列', body: '直到平凡群。' },
      { title: '读因子', body: '每个商群。' },
      { title: '判可解', body: '因子是否都交换。' },
    ],
    pitfalls: ['把正规列当合成列', '因子顺序当固定', '忽略单群分类'],
    example: { problem: 'S₃ 的合成因子是什么？', walkthrough: ['C₂ 与 C₃。'], result: 'C₂、C₃' },
    moreExamples: [{ problem: '合成因子唯一到什么程度？', walkthrough: ['不计顺序。'], result: '不计顺序唯一' }],
  },
  {
    id: 'permutation-groups',
    title: '置换群与交错群',
    tag: '群论',
    level: '竞赛',
    essence: '置换群是有限群的具体模型：凯莱定理说每个有限群都嵌入对称群，交错群是其中最重要的单群。',
    definition: '对称群是全体置换，交错群是偶置换子群（指数 2，正规）。',
    whenToUse: ['具体计算', '证明不可解', '研究单群'],
    theorems: [
      { name: '凯莱定理', statement: '每个群嵌入其自身的对称群。' },
      { name: '交错群单性', statement: '$A_n$ 在 $n\\ge5$ 时单。' },
    ],
    steps: [
      { title: '写置换', body: '轮换分解。' },
      { title: '判奇偶', body: '对换个数。' },
      { title: '得交错群', body: '偶置换全体。' },
      { title: '用单性', body: '$A_n$ 单。' },
      { title: '推不可解', body: '$S_n$ 含单非交换。' },
    ],
    pitfalls: ['轮换分解顺序搞错', '奇偶性判错', '把单群当交换群'],
    example: { problem: '置换 (12)(34) 是偶还是奇？', walkthrough: ['两个对换。'], result: '偶' },
    moreExamples: [{ problem: '$A_5$ 是单群吗？', walkthrough: ['$n\\ge5$ 单。'], result: '是' }],
  },
  {
    id: 'free-groups',
    title: '自由群与生成元关系',
    tag: '群论',
    level: '竞赛',
    essence: '自由群是只满足群公理、没有额外关系的群；任何群都是自由群的商，关系给出表示。',
    definition: '自由群由字母表上的约化词构成；群表示 $\\langle S\\mid R\\rangle$ 是自由群模去关系。',
    whenToUse: ['群表示', '组合群论', '构造反例'],
    theorems: [
      { name: '泛性质', statement: '自由群到任意群的映射由生成元像唯一决定。' },
      { name: '表示定理', statement: '每个群都有表示。' },
    ],
    steps: [
      { title: '给字母表', body: '生成元。' },
      { title: '写词', body: '字母与逆。' },
      { title: '约化', body: '消去相邻逆对。' },
      { title: '加关系', body: '取商。' },
      { title: '得表示', body: '写 $\\langle S\\mid R\\rangle$。' },
    ],
    pitfalls: ['把自由群当交换群', '约化不彻底', '关系写反'],
    example: { problem: '两个生成元的自由群交换吗？', walkthrough: ['ab≠ba。'], result: '非交换' },
    moreExamples: [{ problem: '自由群的泛性质？', walkthrough: ['由生成元像决定映射。'], result: '泛性质' }],
  },

  {
    id: 'quotient-rings',
    title: '商环与同态基本定理',
    tag: '环论',
    level: '进阶',
    essence: '商环由理想定义，环同态把定义域模核同构到像，这是构造新环的标准方式。',
    definition: '商环 R/I 是陪集集合按代表元运算构成环，良定义依赖 I 是理想；同态基本定理给出 R/ker ≅ im。',
    whenToUse: ['构造环', '识别环结构', '化简计算'],
    theorems: [
      { name: '同态基本定理', statement: '商掉核同构于像。', formula: 'R/\\ker\\varphi\\cong\\mathrm{Im}\\varphi' },
      { name: '对应定理', statement: '商环理想对应原环含 I 的理想。' },
    ],
    steps: [
      { title: '取理想', body: '确定 I。' },
      { title: '写陪集', body: 'r+I。' },
      { title: '验证良定义', body: '用吸收性。' },
      { title: '用同态定理', body: '商模核。' },
      { title: '识别结构', body: '常见环。' },
    ],
    pitfalls: ['把子环当理想', '良定义验证跳过', '把商环元素当元素本身'],
    example: { problem: 'Z/(n) 同构于什么？', walkthrough: ['模 n 剩余类环。'], result: 'Z/nZ' },
    moreExamples: [{ problem: '同态核是什么？', walkthrough: ['理想。'], result: '理想' }],
  },
  {
    id: 'prime-maximal-ideals',
    title: '素理想与极大理想',
    tag: '环论',
    level: '进阶',
    essence: '极大理想的商是域，素理想的商是整环；两者把环论与域论、整环理论连接起来。',
    definition: '素理想满足 ab∈P 推出 a∈P 或 b∈P；极大理想是不被任何真理想包含的真理想。',
    whenToUse: ['构造域', '判断整环', '研究谱'],
    theorems: [
      { name: '极大即域', statement: 'R/M 是域当且仅当 M 极大。' },
      { name: '素即整环', statement: 'R/P 是整环当且仅当 P 素。' },
    ],
    steps: [
      { title: '取真理想', body: '候选。' },
      { title: '验素性', body: 'ab∈P 的推理。' },
      { title: '验极大性', body: '能否再放大。' },
      { title: '看商环', body: '域或整环。' },
      { title: '得结论', body: '分类理想。' },
    ],
    pitfalls: ['把素当极大（PID 中才等价）', '忽略真理想条件', '混淆商环与分式域'],
    example: { problem: 'Z 中的极大理想？', walkthrough: ['(p)，p 素数。'], result: '(p)' },
    moreExamples: [{ problem: '极大理想一定是素理想吗？', walkthrough: ['域是整环。'], result: '是' }],
  },
  {
    id: 'euclidean-domains',
    title: '欧几里得整环与主理想整环',
    tag: '环论',
    level: '竞赛',
    essence: '有除法算法的整环是欧几里得整环，它一定是主理想整环；两者都是唯一分解整环。',
    definition: '欧几里得整环带欧氏函数使带余除法成立；主理想整环每个理想都由一个元素生成。',
    whenToUse: ['判断 UFD', '算最大公因子', '构造理想'],
    theorems: [
      { name: '蕴含链', statement: '欧几里得 ⇒ 主理想 ⇒ 唯一分解。' },
      { name: '理想主生成', statement: 'PID 中每理想由单元素生成。' },
    ],
    steps: [
      { title: '找欧氏函数', body: '范数或次数。' },
      { title: '验除法', body: '带余形式。' },
      { title: '得 PID', body: '理想取最小元。' },
      { title: '得 UFD', body: 'PID 推出唯一分解。' },
      { title: '计算', body: '最大公因子等。' },
    ],
    pitfalls: ['把 PID 当欧几里得', '忘记整环前提', '除法余数条件写错'],
    example: { problem: 'Z[x] 是 PID 吗？', walkthrough: ['理想 (2,x) 非主。'], result: '不是' },
    moreExamples: [{ problem: '域上多项式环是欧几里得整环吗？', walkthrough: ['次数作欧氏函数。'], result: '是' }],
  },
  {
    id: 'field-of-fractions',
    title: '分式域与局部化',
    tag: '环论',
    level: '竞赛',
    essence: '分式域把整环嵌入域（如 Z 到 Q），局部化把环在乘法集处加逆元，是代数几何的基本操作。',
    definition: '分式域是整环的形式分式全体；局部化 R[S⁻¹] 在乘法闭集 S 处加逆。',
    whenToUse: ['构造域', '局部研究', '代数几何'],
    theorems: [
      { name: '分式域存在唯一', statement: '整环有最小嵌入域。' },
      { name: '局部化泛性质', statement: '把 S 映成可逆元的同态唯一分解。' },
    ],
    steps: [
      { title: '选乘法集', body: 'S 或全环非零元。' },
      { title: '写分式', body: 'a/s 等价类。' },
      { title: '定义运算', body: '交叉相乘。' },
      { title: '验环结构', body: '加法乘法。' },
      { title: '用泛性质', body: '得映射。' },
    ],
    pitfalls: ['S 含零元导致退化', '等价类判错', '把局部化当商环'],
    example: { problem: 'Z 的分式域是什么？', walkthrough: ['形式分式 a/b。'], result: 'Q' },
    moreExamples: [{ problem: '局部化与商环的区别？', walkthrough: ['加逆 vs 令其为零。'], result: '加逆元' }],
  },
  {
    id: 'noetherian-rings',
    title: '诺特环与希尔伯特基定理',
    tag: '环论',
    level: '竞赛',
    essence: '诺特环满足理想升链条件，希尔伯特基定理说诺特环上多项式环仍诺特，这是代数几何有限性的来源。',
    definition: '诺特环指理想升链稳定（等价于每理想有限生成）；诺特模类似。',
    whenToUse: ['保证有限性', '代数几何', '模理论'],
    theorems: [
      { name: '希尔伯特基定理', statement: '诺特环上多项式环诺特。' },
      { name: '升链等价', statement: '升链条件等价于有限生成。' },
    ],
    steps: [
      { title: '验升链', body: '理想链是否稳定。' },
      { title: '或验有限生成', body: '每理想有限生成。' },
      { title: '用基定理', body: '多项式环仍诺特。' },
      { title: '取商', body: '商环仍诺特。' },
      { title: '得有限性', body: '簇的有限描述。' },
    ],
    pitfalls: ['把诺特当阿廷', '忘记有限生成条件', '在非诺特环用基定理'],
    example: { problem: 'Z 是诺特环吗？', walkthrough: ['理想都由 gcd 生成。'], result: '是' },
    moreExamples: [{ problem: '希尔伯特基定理说什么？', walkthrough: ['多项式环保持诺特性。'], result: '保持诺特' }],
  },
  {
    id: 'chinese-remainder',
    title: '中国剩余定理',
    tag: '环论',
    level: '进阶',
    essence: '互素理想的商环同构于各商环之积，这是解同余方程组与分解环的统一工具。',
    definition: '两两互素（和为单位理想）的理想 I₁…Iₙ 满足 $R/\\bigcap I_k\\cong\\prod R/I_k$。',
    whenToUse: ['解同余', '分解环', '构造幂等元'],
    theorems: [
      { name: '中国剩余定理', statement: '互素理想的商同构于积。' },
      { name: '整数情形', statement: '互素模数的同余组有唯一解。' },
    ],
    steps: [
      { title: '验互素', body: 'I+J=R。' },
      { title: '构造映射', body: '商投影之积。' },
      { title: '验满射', body: '用互素性。' },
      { title: '求核', body: '交。' },
      { title: '得同构', body: '商掉交。' },
    ],
    pitfalls: ['忽略互素条件', '把交当并', '整数情形忘记模数互素'],
    example: { problem: '模 4 与模 3 的方程组有唯一解吗？', walkthrough: ['互素，模 12 唯一。'], result: '唯一（模 12）' },
    moreExamples: [{ problem: 'CRT 的环论形式？', walkthrough: ['商掉交同构于积。'], result: 'R/∩I ≅ ∏R/I' }],
  },

  {
    id: 'algebraic-closure',
    title: '代数闭包',
    tag: '域论',
    level: '竞赛',
    essence: '代数闭包是包含原域且代数闭的最小代数扩张，任何域都有代数闭包（在同构意义下唯一）。',
    definition: '代数闭指每个非常数多项式有根；代数闭包是代数扩张且代数闭的域。',
    whenToUse: ['构造根', '研究嵌入', '伽罗瓦理论'],
    theorems: [
      { name: '存在唯一', statement: '任何域有代数闭包，且在 F-同构意义下唯一。' },
      { name: '代数闭判据', statement: '不可约多项式都一次则可。' },
    ],
    steps: [
      { title: '从域出发', body: '给定 F。' },
      { title: '逐步添根', body: '对每个不可约多项式添根。' },
      { title: '取并', body: '得代数扩张。' },
      { title: '验代数闭', body: '每个多项式有根。' },
      { title: '得唯一性', body: '用同构延拓。' },
    ],
    pitfalls: ['把代数闭包当可分闭包', '忽略代数性', '在非同构意义下谈唯一'],
    example: { problem: 'Q 的代数闭包记作？', walkthrough: ['全体代数数。'], result: 'Q 的代数数域' },
    moreExamples: [{ problem: '代数闭包唯一到什么程度？', walkthrough: ['F-同构。'], result: 'F-同构唯一' }],
  },
  {
    id: 'transcendence-degree',
    title: '超越扩张与超越次数',
    tag: '域论',
    level: '竞赛',
    essence: '超越次数是极大代数无关集的基数，它度量扩张「有多大」，代数扩张的超越次数为零。',
    definition: '超越基是极大代数无关集，其基数为超越次数；代数扩张的超越次数为零。',
    whenToUse: ['分类扩张', '代数几何维数', '研究函数域'],
    theorems: [
      { name: '超越次数良定义', statement: '任意两组超越基等势。' },
      { name: '纯超越扩张', statement: '有理函数域的超越次数等于变量个数。' },
    ],
    steps: [
      { title: '找代数无关集', body: '元素间无多项式关系。' },
      { title: '极大化', body: '加入更多元素破坏无关性。' },
      { title: '取基数', body: '得超越次数。' },
      { title: '看代数性', body: '剩余部分代数。' },
      { title: '得结构', body: '纯超越加代数。' },
    ],
    pitfalls: ['把超越次数当扩张次数', '混淆代数无关与线性无关', '有限生成与有限维混淆'],
    example: { problem: '代数扩张的超越次数？', walkthrough: ['无超越元。'], result: '0' },
    moreExamples: [{ problem: 'k(x) 在 k 上的超越次数？', walkthrough: ['一个变量。'], result: '1' }],
  },
  {
    id: 'primitive-element',
    title: '本原元素定理',
    tag: '域论',
    level: '竞赛',
    essence: '有限可分扩张是单扩张：存在一个本原元素生成整个扩张，这简化了伽罗瓦理论的计算。',
    definition: '本原元素是使 E=F(α) 的元素；有限可分扩张总存在本原元素。',
    whenToUse: ['化简扩张', '计算伽罗瓦群', '构造单扩张'],
    theorems: [
      { name: '本原元定理', statement: '有限可分扩张是单扩张。' },
      { name: '不可分反例', statement: '不可分扩张可能不是单扩张。' },
    ],
    steps: [
      { title: '验可分', body: '扩张是否可分。' },
      { title: '找候选', body: '组合生成元。' },
      { title: '用定理', body: '存在本原元。' },
      { title: '求极小多项式', body: '定次数。' },
      { title: '写单扩张', body: 'E=F(α)。' },
    ],
    pitfalls: ['忽略可分条件', '把本原元当唯一', '混淆本原元与本原根'],
    example: { problem: '有限可分扩张一定是单扩张吗？', walkthrough: ['本原元定理。'], result: '是' },
    moreExamples: [{ problem: '本原元唯一吗？', walkthrough: ['一般不唯一。'], result: '不唯一' }],
  },
  {
    id: 'perfect-fields',
    title: '完全域',
    tag: '域论',
    level: '竞赛',
    essence: '完全域的每个代数扩张都可分；特征零域与有限域都是完全域，这保证伽罗瓦理论适用。',
    definition: '完全域指每个代数扩张可分；等价于弗罗贝尼乌斯映射满射（特征 p）或特征为零。',
    whenToUse: ['保证可分性', '伽罗瓦理论', '研究有限域'],
    theorems: [
      { name: '特征零完全', statement: '特征零域完全。' },
      { name: '有限域完全', statement: '有限域完全。' },
    ],
    steps: [
      { title: '看特征', body: '零则完全。' },
      { title: '特征 p 看弗罗贝尼乌斯', body: '是否满射。' },
      { title: '验可分', body: '极小多项式无重根。' },
      { title: '得完全性', body: '所有代数扩张可分。' },
      { title: '应用', body: '伽罗瓦对应。' },
    ],
    pitfalls: ['把完全域当代数闭域', '忽略特征 p 的反例', '混淆完全与可分'],
    example: { problem: '有限域是完全域吗？', walkthrough: ['弗罗贝尼乌斯是自同构。'], result: '是' },
    moreExamples: [{ problem: '特征零域完全吗？', walkthrough: ['不可分只可能在特征 p。'], result: '完全' }],
  },
  {
    id: 'stem-field',
    title: '分裂域与正规闭包',
    tag: '域论',
    level: '竞赛',
    essence: '分裂域是使多项式完全分解的最小扩张；正规闭包是把扩张补成正规扩张的最小方式。',
    definition: '多项式在 E 上分裂指它分解为一次因子之积；分裂域是包含所有根的最小扩张。',
    whenToUse: ['构造伽罗瓦扩张', '研究根的对称', '计算次数'],
    theorems: [
      { name: '分裂域存在唯一', statement: '分裂域存在且在同构意义下唯一。' },
      { name: '次数上界', statement: 'n 次多项式的分裂域次数不超过 n!。' },
    ],
    steps: [
      { title: '取多项式', body: '确定 f。' },
      { title: '添根', body: '逐步加入根。' },
      { title: '验分裂', body: '完全分解。' },
      { title: '取最小', body: '分裂域。' },
      { title: '算次数', body: '用 n! 上界。' },
    ],
    pitfalls: ['把分裂域当根域（单根扩张）', '忽略最小性', '次数上界当等式'],
    example: { problem: 'x³−2 在 Q 上的分裂域次数？', walkthrough: ['含 ω 与三次根。'], result: '6' },
    moreExamples: [{ problem: 'n 次多项式分裂域次数上界？', walkthrough: ['$n!$。'], result: 'n!' }],
  },
  {
    id: 'constructible-fields',
    title: '尺规作图的域论判据',
    tag: '域论',
    level: '竞赛',
    essence: '尺规可构造的点坐标构成对开平方封闭的域：可构造当且仅当坐标落在 2 的幂次扩张中。',
    definition: '可构造点由单位长度经尺规操作得到；其坐标属于有理数上的 2 次扩张塔。',
    whenToUse: ['判定作图不可能', '正多边形', '域扩张次数'],
    theorems: [
      { name: '可构造判据', statement: '坐标在 2 的幂次扩张中。', formula: '[K:\\mathbb{Q}]=2^n' },
      { name: '三大不可能', statement: '三等分角、倍立方、化圆为方不可能。' },
    ],
    steps: [
      { title: '建模为域', body: '从 Q 出发。' },
      { title: '允许操作', body: '加减乘除开方。' },
      { title: '算扩张次数', body: '是否为 2 的幂。' },
      { title: '判可构造', body: '次数不符则不可。' },
      { title: '得结论', body: '作图不可能。' },
    ],
    pitfalls: ['把近似作图当精确', '忘记 2 的幂条件', '忽略 π 的超越性（化圆为方）'],
    example: { problem: '正十七边形可尺规构造吗？', walkthrough: ['17 是费马素数。'], result: '可构造' },
    moreExamples: [{ problem: '化圆为方为何不可能？', walkthrough: ['π 超越。'], result: 'π 不是代数数' }],
  },

  {
    id: 'cubic-quartic',
    title: '三次与四次方程的解法',
    tag: '伽罗瓦理论',
    level: '进阶',
    essence: '三次方程用卡尔达诺公式、四次用费拉里方法可根式求解，但公式复杂；五次及以上不再有通用根式解。',
    definition: '卡尔达诺公式通过代换消去二次项，再用两个立方根表示根；费拉里把四次降为三次。',
    whenToUse: ['求根', '理解根式解', '历史脉络'],
    theorems: [
      { name: '卡尔达诺公式', statement: '三次方程可用平方根与立方根表示。' },
      { name: '费拉里降次', statement: '四次方程可化为三次。' },
    ],
    steps: [
      { title: '消二次项', body: '代换 $x=y-b/3a$。' },
      { title: '化简约化三次', body: '得 $y^3+py+q=0$。' },
      { title: '设两立方根', body: '令 $y=u+v$。' },
      { title: '解方程组', body: '求 $u^3,v^3$。' },
      { title: '回代', body: '得原方程的根。' },
    ],
    pitfalls: ['忘记三个根（含复根）', '判别式符号判错', '四次直接套三次公式'],
    example: { problem: '三次方程的公式涉及哪些根式？', walkthrough: ['平方根与立方根。'], result: '平方根 + 立方根' },
    moreExamples: [{ problem: '四次方程如何降次？', walkthrough: ['费拉里方法化为三次。'], result: '化为三次' }],
  },
  {
    id: 'symmetric-polynomials',
    title: '对称多项式与基本定理',
    tag: '伽罗瓦理论',
    level: '竞赛',
    essence: '对称多项式可唯一写成初等对称多项式的多项式，这是根的对称性与判别式理论的基础。',
    definition: '对称多项式指在变量置换下不变的多项式；初等对称多项式是各次基本对称和。',
    whenToUse: ['用韦达定理', '计算判别式', '伽罗瓦不变量'],
    theorems: [
      { name: '对称多项式基本定理', statement: '对称多项式可唯一表示为初等对称多项式的多项式。' },
      { name: '韦达定理', statement: '根与系数由初等对称多项式联系。' },
    ],
    steps: [
      { title: '写初等对称式', body: '$e_1,\\dots,e_n$。' },
      { title: '把目标对称化', body: '按字典序消去。' },
      { title: '表示为 $e_i$', body: '逐步替换。' },
      { title: '验唯一', body: '次数比较。' },
      { title: '用韦达', body: '代入根与系数。' },
    ],
    pitfalls: ['把对称多项式与轮换多项式混淆', '忘记唯一性', '次数算错'],
    example: { problem: '$x^2+y^2$ 用初等对称式表示？', walkthrough: ['$e_1^2-2e_2$。'], result: 'e_1^2-2e_2' },
    moreExamples: [{ problem: '韦达定理联系什么？', walkthrough: ['根与系数。'], result: '根与系数' }],
  },
  {
    id: 'discriminant',
    title: '判别式与根的对称性',
    tag: '伽罗瓦理论',
    level: '竞赛',
    essence: '判别式是根的差平方之积，它在偶置换下不变，从而判断伽罗瓦群是否含于交错群。',
    definition: '判别式 $\\Delta=\\prod_{i<j}(r_i-r_j)^2$ 是系数的对称多项式；平方根属于基域当且仅当伽罗瓦群含于 $A_n$。',
    whenToUse: ['判断伽罗瓦群', '判重根', '计算分裂域'],
    theorems: [
      { name: '判别式判重根', statement: '$\\Delta=0$ 当且仅当有重根。' },
      { name: '判别式与 $A_n$', statement: '平方根在基域当且仅当群含于交错群。' },
    ],
    steps: [
      { title: '写根', body: '设根 $r_i$。' },
      { title: '算差积', body: '$(r_i-r_j)$ 的乘积。' },
      { title: '平方', body: '得对称多项式。' },
      { title: '用系数表示', body: '消去根。' },
      { title: '判群', body: '平方根是否在基域。' },
    ],
    pitfalls: ['把判别式当差积（差积非对称）', '符号搞错', '忽略重根情形'],
    example: { problem: '判别式为零说明什么？', walkthrough: ['有重根。'], result: '重根' },
    moreExamples: [{ problem: '判别式平方根在基域推出？', walkthrough: ['群含于 $A_n$。'], result: '含于交错群' }],
  },
  {
    id: 'galois-correspondence',
    title: '伽罗瓦对应基本定理',
    tag: '伽罗瓦理论',
    level: '竞赛',
    essence: '伽罗瓦扩张的中间域与伽罗瓦群的子群一一反序对应，正规子群对应正规扩张，这是整个理论的中心。',
    definition: '有限伽罗瓦扩张 E/F 的中间域 K 与 $\\mathrm{Gal}(E/F)$ 的子群 H 通过 $K=E^H$ 反序对应。',
    whenToUse: ['构造中间域', '算群与域', '判断正规扩张'],
    theorems: [
      { name: '一一对应', statement: '中间域与子群反序一一对应。' },
      { name: '正规对应', statement: 'H 正规当且仅当 $E^H/F$ 伽罗瓦。', formula: '[E:F]=|G|' },
    ],
    steps: [
      { title: '验伽罗瓦', body: '扩张正规可分。' },
      { title: '算群', body: '$G=\\mathrm{Gal}(E/F)$。' },
      { title: '列子群', body: '全部子群。' },
      { title: '取不动域', body: '$E^H$。' },
      { title: '读对应', body: '次数与指数互换。' },
    ],
    pitfalls: ['忽略正规可分前提', '对应方向搞反', '把子群阶当扩张次数（应指数）'],
    example: { problem: '子群 H 对应域的次数等于什么？', walkthrough: ['等于 H 的指数。'], result: '[G:H]' },
    moreExamples: [{ problem: '正规子群对应什么？', walkthrough: ['正规中间扩张。'], result: '正规扩张' }],
  },
  {
    id: 'cyclotomic-polynomials',
    title: '分圆多项式与正多边形',
    tag: '伽罗瓦理论',
    level: '竞赛',
    essence: '分圆多项式的根是本原单位根，其伽罗瓦群是 $（Z/n）^\\times$，这给出正 n 边形可构造的判据。',
    definition: '第 n 分圆多项式以本原 n 次单位根为根，次数为欧拉函数 φ(n)，在 Q 上不可约。',
    whenToUse: ['正多边形作图', '计算伽罗瓦群', '研究单位根'],
    theorems: [
      { name: '不可约性', statement: '分圆多项式在 Q 上不可约。' },
      { name: '伽罗瓦群', statement: '$\\mathrm{Gal}\\cong(\\mathbb{Z}/n)^\\times$。' },
    ],
    steps: [
      { title: '取 n', body: '目标边数。' },
      { title: '写分圆多项式', body: '$\\Phi_n$。' },
      { title: '算次数', body: '$\\varphi(n)$。' },
      { title: '看群', body: '单位群。' },
      { title: '判可构造', body: '$\\varphi(n)$ 为 2 的幂。' },
    ],
    pitfalls: ['把 $x^n-1$ 当分圆多项式', 'φ(n) 算错', '忽略 n 为费马素数积'],
    example: { problem: '正五边形可构造吗？', walkthrough: ['$\\varphi(5)=4=2^2$。'], result: '可构造' },
    moreExamples: [{ problem: '正七边形可构造吗？', walkthrough: ['$\\varphi(7)=6$ 非 2 的幂。'], result: '不可构造' }],
  },
  {
    id: 'insolubility-quintic',
    title: '五次方程的不可解性',
    tag: '伽罗瓦理论',
    level: '竞赛',
    essence: '一般五次方程的伽罗瓦群是 $S_5$，它不可解，因此不存在通用的根式解公式。',
    definition: '方程根式可解当且仅当伽罗瓦群可解；$S_5$ 含单群 $A_5$，不可解。',
    whenToUse: ['判断方程可解', '构造反例', '理解阿贝尔-鲁菲尼'],
    theorems: [
      { name: '伽罗瓦判据', statement: '根式可解 ⇔ 伽罗瓦群可解。' },
      { name: '$S_5$ 不可解', statement: '$A_5$ 单非交换。' },
    ],
    steps: [
      { title: '求伽罗瓦群', body: '分裂域的自同构。' },
      { title: '判可解', body: '合成因子是否交换。' },
      { title: '找 $A_5$', body: '单非交换。' },
      { title: '得不可解', body: '无根式解。' },
      { title: '举例', body: '$x^5-6x+3$ 等。' },
    ],
    pitfalls: ['以为所有五次都不可解（个别可解）', '混淆一般方程与具体方程', '忘记可解群定义'],
    example: { problem: '一般五次方程的伽罗瓦群？', walkthrough: ['对称群 $S_5$。'], result: 'S_5' },
    moreExamples: [{ problem: '可解群的判据？', walkthrough: ['合成因子交换。'], result: '合成因子交换' }],
  },

  {
    id: 'trace-norm',
    title: '迹与范',
    tag: '代数数论',
    level: '进阶',
    essence: '迹与范把一个数域元素的共轭信息压缩成有理数，它们可积、可乘，是判别式与整性的基本工具。',
    definition: '元素 α 的迹是其全部共轭之和，范数是其全部共轭之积；两者都是有理数，代数整数时是整数。',
    whenToUse: ['判整性', '算判别式', '研究范数群'],
    theorems: [
      { name: '乘法性', statement: '范数对乘法保持：$N(\\alpha\\beta)=N(\\alpha)N(\\beta)$。' },
      { name: '整性判据', statement: '代数整数当且仅当极小多项式首一整系数。' },
    ],
    steps: [
      { title: '求共轭', body: '极小多项式的其余根。' },
      { title: '求迹', body: '共轭之和。' },
      { title: '求范', body: '共轭之积。' },
      { title: '验乘法性', body: '用定义。' },
      { title: '用范数', body: '判断单位或整性。' },
    ],
    pitfalls: ['把迹当元素本身', '范数忘记符号（次数奇偶）', '混淆域迹与矩阵迹'],
    example: { problem: '$\\alpha=1+\\sqrt2$ 的范数？', walkthrough: ['$(1+\\sqrt2)(1-\\sqrt2)=-1$。'], result: '−1' },
    moreExamples: [{ problem: '范数为 ±1 的元素称什么？', walkthrough: ['单位。'], result: '单位' }],
  },
  {
    id: 'integral-basis',
    title: '整基与判别式',
    tag: '代数数论',
    level: '竞赛',
    essence: '整基是整数环作为 Z 模的基；判别式度量格的「体积」，并判断分歧素数。',
    definition: '整基 $\\omega_1,\\dots,\\omega_n$ 使 $\\mathcal{O}_K$ 是它们的 Z 线性组合；判别式是迹矩阵的行列式。',
    whenToUse: ['计算整数环', '判分歧', '研究格'],
    theorems: [
      { name: '整基存在', statement: '数域整数环是秩 n 的自由 Z 模。' },
      { name: '判别式判分歧', statement: '分歧素数整除判别式。' },
    ],
    steps: [
      { title: '找候选', body: '幂基或组合。' },
      { title: '验整性', body: '极小多项式首一。' },
      { title: '验生成', body: '是否 Z 模基。' },
      { title: '算判别式', body: '迹矩阵行列式。' },
      { title: '判分歧', body: '素因子。' },
    ],
    pitfalls: ['把幂基当整基（可能不是）', '判别式符号搞错', '忘记指数修正'],
    example: { problem: '$\\mathbb{Q}(\\sqrt{-1})$ 的整基？', walkthrough: ['$\\{1,i\\}$。'], result: '\\{1,i\\}' },
    moreExamples: [{ problem: '判别式的素因子说明什么？', walkthrough: ['可能是分歧素数。'], result: '分歧线索' }],
  },
  {
    id: 'prime-splitting',
    title: '素理想的分解',
    tag: '代数数论',
    level: '竞赛',
    essence: '有理素数在扩域中分解为素理想之积，分解方式（分裂、惯性、分歧）由 Frobenius 与伽罗瓦群决定。',
    definition: '素数 p 的分解 $p\\mathcal{O}_K=\\prod \\mathfrak{p}_i^{e_i}$，e 为分歧指数，f 为剩余次数。',
    whenToUse: ['分解素理想', '研究分歧', '计算类群'],
    theorems: [
      { name: '基本恒等式', statement: '分歧指数乘剩余次数之和等于扩张次数。', formula: '\\sum e_if_i=n' },
      { name: '伽罗瓦情形', statement: '分解由 Frobenius 共轭类决定。' },
    ],
    steps: [
      { title: '取素数 p', body: '有理素数。' },
      { title: '分解多项式', body: '模 p 分解极小多项式。' },
      { title: '读因子', body: '每个因子给素理想。' },
      { title: '算 e 与 f', body: '次数与重数。' },
      { title: '验恒等式', body: '和等于 n。' },
    ],
    pitfalls: ['忘记得分指数与剩余次数定义', '多项式模 p 可约时误判', '忽略非伽罗瓦情形'],
    example: { problem: '分歧指数的定义？', walkthrough: ['素理想在分解中的重数。'], result: '重数 e' },
    moreExamples: [{ problem: '完全分裂指什么？', walkthrough: ['所有 e=f=1。'], result: 'e=f=1' }],
  },
  {
    id: 'class-number',
    title: '理想类群与类数',
    tag: '代数数论',
    level: '竞赛',
    essence: '理想类群度量整数环离唯一分解有多远；类数为 1 当且仅当唯一分解成立。',
    definition: '分式理想模主分式理想构成理想类群，其阶为类数 h。',
    whenToUse: ['判断 UFD', '研究类群', '计算不变量'],
    theorems: [
      { name: '类数有限', statement: '数域的理想类群有限。' },
      { name: 'h=1 判据', statement: '类数为 1 当且仅当整数环是 UFD。' },
    ],
    steps: [
      { title: '算整数环', body: '先有 O_K。' },
      { title: '找理想', body: '非主理想候选。' },
      { title: '算类', body: '模主理想。' },
      { title: '定群结构', body: '有限阿贝尔群。' },
      { title: '得类数', body: '群的阶。' },
    ],
    pitfalls: ['把类数当判别式', '以为 h=1 对所有数域成立', '混淆类群与单位群'],
    example: { problem: '$\\mathbb{Q}(\\sqrt{-5})$ 的类数？', walkthrough: ['$(2,1+\\sqrt{-5})$ 非主。'], result: '2' },
    moreExamples: [{ problem: '类数为 1 说明什么？', walkthrough: ['唯一分解。'], result: 'UFD' }],
  },
  {
    id: 'dirichlet-unit',
    title: '狄利克雷单位定理',
    tag: '代数数论',
    level: '竞赛',
    essence: '整数环的单位群是有限循环群乘以秩为 r₁+r₂−1 的自由阿贝尔群，这决定单位的结构。',
    definition: '单位群 $\\mathcal{O}_K^\\times$ 同构于 $\\mu_K\\times\\mathbb{Z}^{r_1+r_2-1}$，其中 r₁ 实嵌入数、r₂ 复嵌入对数。',
    whenToUse: ['研究单位', '解佩尔方程', '计算类群'],
    theorems: [
      { name: '单位定理', statement: '单位群秩为 $r_1+r_2-1$。' },
      { name: '佩尔方程', statement: '实二次域单位对应佩尔方程解。' },
    ],
    steps: [
      { title: '数嵌入', body: '$r_1,r_2$。' },
      { title: '算秩', body: '$r_1+r_2-1$。' },
      { title: '找基本单位', body: '最小单位。' },
      { title: '写结构', body: '挠部分乘自由部分。' },
      { title: '应用', body: '佩尔方程等。' },
    ],
    pitfalls: ['把秩当扩张次数', '忽略挠部分（单位根）', '混淆实虚嵌入'],
    example: { problem: '实二次域的单位群秩？', walkthrough: ['$r_1=2,r_2=0$。'], result: '1' },
    moreExamples: [{ problem: '虚二次域的单位群？', walkthrough: ['通常只有单位根。'], result: '有限' }],
  },
  {
    id: 'minkowski-bound',
    title: '闵可夫斯基界与类数有限性',
    tag: '代数数论',
    level: '竞赛',
    essence: '闵可夫斯基用格点论证给出类群代表元的范数上界，从而证明类数有限并可实际计算。',
    definition: '闵可夫斯基界是理想范数的上界，由判别式与嵌入数给出；每个理想类有范数不超过该界的代表。',
    whenToUse: ['证明类数有限', '计算类群', '估计不变量'],
    theorems: [
      { name: '闵可夫斯基定理', statement: '足够大的格必含非零短向量。' },
      { name: '类数有限', statement: '类群代表元范数有界。' },
    ],
    steps: [
      { title: '算判别式', body: '先有 D。' },
      { title: '算嵌入数', body: '$r_1,r_2$。' },
      { title: '算界', body: '闵可夫斯基界公式。' },
      { title: '枚举理想', body: '范数小于界。' },
      { title: '得类群', body: '有限生成。' },
    ],
    pitfalls: ['把界当精确值', '判别式符号影响', '忽略例外小域'],
    example: { problem: '闵可夫斯基界用来证明什么？', walkthrough: ['类数有限。'], result: '类数有限' },
    moreExamples: [{ problem: '界依赖什么？', walkthrough: ['判别式与嵌入数。'], result: 'D 与 r₁,r₂' }],
  },

  {
    id: 'von-mangoldt',
    title: '冯·曼戈尔特函数与素数计数',
    tag: '解析数论',
    level: '竞赛',
    essence: 'Λ(n) 在素数幂处取 log p，把素数分布编码进一个算术函数，使 ζ 的对数导数与素数直接相连。',
    definition: 'Λ(n) 在 n=p^k 时为 log p，其他为 0；满足 $\\sum_{d|n}\\Lambda(d)=\\log n$。',
    whenToUse: ['素数计数', '切比雪夫函数', '证明素数定理'],
    theorems: [
      { name: '与 log 的关系', statement: 'Λ 的狄利克雷卷积给出 log。' },
      { name: '切比雪夫函数', statement: 'ψ(x)=Σ_{n≤x}Λ(n) 与 θ(x) 等价。' },
    ],
    steps: [
      { title: '定义 Λ', body: '素数幂处取 log p。' },
      { title: '验证卷积恒等式', body: '对 n 分解。' },
      { title: '写 ψ', body: '部分和。' },
      { title: '比较 θ', body: '差分有界。' },
      { title: '用于 PNT', body: 'ψ(x)~x。' },
    ],
    pitfalls: ['把 Λ 当示性函数', '混淆 ψ 与 π', '忽略素数幂的贡献'],
    example: { problem: 'Λ(8) 等于多少？', walkthrough: ['$8=2^3$。'], result: 'log 2' },
    moreExamples: [{ problem: 'ψ(x) 与 π(x) 的关系？', walkthrough: ['相差 log 因子。'], result: '渐近等价（除 log）' }],
  },
  {
    id: 'euler-maclaurin',
    title: '欧拉－麦克劳林求和',
    tag: '解析数论',
    level: '竞赛',
    essence: '欧拉－麦克劳林公式把离散求和与积分用伯努利数联系，是估计算术函数平均阶的核心工具。',
    definition: '公式把 $\\sum_{a}^{b}f(k)$ 表示为积分加端点修正项与伯努利多项式余项。',
    whenToUse: ['估计求和', '渐近展开', '调和数'],
    theorems: [
      { name: '求和公式', statement: '和 = 积分 + 端点项 + 余项。' },
      { name: '调和数展开', statement: '$H_n=\\log n+\\gamma+O(1/n)$。' },
    ],
    steps: [
      { title: '选 f', body: '待和函数。' },
      { title: '写积分', body: '$\\int f$。' },
      { title: '加端点项', body: '伯努利修正。' },
      { title: '估余项', body: '有界。' },
      { title: '得渐近', body: '主项加误差。' },
    ],
    pitfalls: ['忘记端点 1/2 项', '余项阶估错', '把渐近当等式'],
    example: { problem: '$H_n$ 的主项？', walkthrough: ['欧拉－麦克劳林。'], result: 'log n' },
    moreExamples: [{ problem: '公式里的伯努利数作用？', walkthrough: ['修正项系数。'], result: '修正项' }],
  },
  {
    id: 'dirichlet-characters',
    title: '狄利克雷特征',
    tag: '解析数论',
    level: '竞赛',
    essence: '模 q 的狄利克雷特征是完全乘性函数，把同余类编码成复数，是 L 函数与等差数列素数分布的关键。',
    definition: '模 q 特征是从 $（Z/q）^\\times$ 到单位圆的同态（在非互素处取 0），满足完全乘性。',
    whenToUse: ['L 函数', '等差数列素数', '特征和'],
    theorems: [
      { name: '正交关系', statement: '特征的和给出同余类示性。', formula: '\\sum_\\chi\\chi(a)=q\\,[a=1]' },
      { name: '主特征', statement: '主特征在互素处为 1。' },
    ],
    steps: [
      { title: '定模 q', body: '模数。' },
      { title: '找群', body: '单位群。' },
      { title: '取同态', body: '到单位圆。' },
      { title: '延拓', body: '非互素取 0。' },
      { title: '验乘性', body: '完全乘性。' },
    ],
    pitfalls: ['把特征当普通函数', '忽略非互素处为 0', '混淆实特征与主特征'],
    example: { problem: '主特征在互素类上取值？', walkthrough: ['恒为 1。'], result: '1' },
    moreExamples: [{ problem: '特征正交关系的作用？', walkthrough: ['筛出同余类。'], result: '筛同余类' }],
  },
  {
    id: 'dirichlet-theorem',
    title: '狄利克雷定理',
    tag: '解析数论',
    level: '竞赛',
    essence: '等差数列 a, a+q, a+2q… 中若 gcd(a,q)=1 则有无穷多素数，这是 L 函数非零性的应用。',
    definition: '狄利克雷定理：互素等差数列含无穷多素数。证明用 L(1,χ)≠0（非主特征）。',
    whenToUse: ['等差数列素数', '证明无穷', 'L 函数应用'],
    theorems: [
      { name: '狄利克雷定理', statement: '互素等差数列有无穷多素数。' },
      { name: 'L(1,χ)≠0', statement: '非主特征在 1 处不为零。' },
    ],
    steps: [
      { title: '取特征', body: '模 q 特征。' },
      { title: '写 L 函数', body: '欧拉乘积。' },
      { title: '证非零', body: '$L(1,\\chi)\\ne0$。' },
      { title: '取对数', body: '素数幂和发散。' },
      { title: '得无穷', body: '该同余类素数无穷。' },
    ],
    pitfalls: ['忽略互素条件', '把 L(1,χ)=0 当可能（非主不可能）', '混淆模数与公差'],
    example: { problem: '形如 4k+1 的素数有无穷多吗？', walkthrough: ['gcd(1,4)=1。'], result: '无穷多' },
    moreExamples: [{ problem: '定理的关键非零性？', walkthrough: ['$L(1,\\chi)\\ne0$。'], result: '非主特征' }],
  },
  {
    id: 'riemann-hypothesis',
    title: '黎曼假设与零点分布',
    tag: '解析数论',
    level: '竞赛',
    essence: '黎曼假设说 ζ 的非平凡零点都在临界线 Re(s)=1/2 上，它等价于素数定理的最优误差。',
    definition: '黎曼假设：ζ 的所有非平凡零点满足 Re(s)=1/2；等价于 $\\pi(x)=\\mathrm{li}(x)+O(\\sqrt x\\log x)$。',
    whenToUse: ['理解 PNT 误差', '零点显式公式', '前沿研究'],
    theorems: [
      { name: 'RH 等价形式', statement: '素数计数误差最小。' },
      { name: '零点自由区', statement: '已知 Re(s)=1 附近无零点。' },
    ],
    steps: [
      { title: '定义 ζ', body: '延拓后的函数。' },
      { title: '找零点', body: '平凡与非凡。' },
      { title: '陈述 RH', body: '临界线。' },
      { title: '连到 π(x)', body: '显式公式。' },
      { title: '看误差', body: '最优阶。' },
    ],
    pitfalls: ['把平凡零点当非平凡', '以为 RH 已证', '混淆 RH 与 PNT（PNT 已证）'],
    example: { problem: '非平凡零点的实部 conjectured 为？', walkthrough: ['1/2。'], result: '1/2' },
    moreExamples: [{ problem: 'RH 推出什么误差？', walkthrough: ['$O(\\sqrt x\\log x)$。'], result: '平方根级误差' }],
  },
  {
    id: 'partial-summation',
    title: '阿贝尔求和与部分求和',
    tag: '解析数论',
    level: '竞赛',
    essence: '阿贝尔求和把系数和转化为积分，是估计狄利克雷级数与素数分布的标准技巧（分部积分离散版）。',
    definition: '阿贝尔求和：$\\sum a_n f(n)$ 用部分和 $A(x)=\\sum_{n\\le x}a_n$ 表示成 $\\int f\\,dA$。',
    whenToUse: ['估计级数', '解析延拓', '素数定理'],
    theorems: [
      { name: '阿贝尔恒等式', statement: '和等于边界项减积分。' },
      { name: '狄利克雷判别', statement: '部分和有界且 f 单调趋零则收敛。' },
    ],
    steps: [
      { title: '写部分和', body: '$A(x)$。' },
      { title: '分部求和', body: '离散分部积分。' },
      { title: '估 A', body: '界。' },
      { title: '估积分', body: '主项。' },
      { title: '得结论', body: '收敛或渐近。' },
    ],
    pitfalls: ['把部分和当通项', '忽略边界项', '条件收敛与绝对收敛混淆'],
    example: { problem: '阿贝尔求和把和变成什么？', walkthrough: ['积分。'], result: '积分表示' },
    moreExamples: [{ problem: '狄利克雷判别条件？', walkthrough: ['部分和有界 + f 趋零。'], result: '有界 + 趋零' }],
  },

  {
    id: 'regular-representation',
    title: '正则表示与表示分解',
    tag: '表示论',
    level: '进阶',
    essence: '正则表示让群作用在自己身上，它分解为所有不可约表示，重数等于各表示的维数——这是表示论的入口。',
    definition: '正则表示是群在群代数上的左乘作用，维数等于群阶；它分解为不可约表示的直和。',
    whenToUse: ['求不可约表示', '算重数', '理解群代数'],
    theorems: [
      { name: '正则分解', statement: '每个不可约表示在正则表示中出现维数次。', formula: '\\mathbb{C}[G]\\cong\\bigoplus V_i^{\\dim V_i}' },
      { name: '维数平方和', statement: '不可约表示维数平方和等于群阶。', formula: '\\sum(\\dim V_i)^2=|G|' },
    ],
    steps: [
      { title: '取群代数', body: '$\\mathbb{C}[G]$。' },
      { title: '左乘作用', body: '正则表示。' },
      { title: '分解', body: '成不可约直和。' },
      { title: '数重数', body: '等于维数。' },
      { title: '验平方和', body: '等于群阶。' },
    ],
    pitfalls: ['把正则表示当置换表示', '重数记成 1', '混淆维数与重数'],
    example: { problem: 'S₃ 的维数平方和？', walkthrough: ['$1+1+4=6$。'], result: '6' },
    moreExamples: [{ problem: '正则表示中不可约表示的重数？', walkthrough: ['等于其维数。'], result: '维数' }],
  },
  {
    id: 'orthogonality-relations',
    title: '特征标正交关系',
    tag: '表示论',
    level: '竞赛',
    essence: '不可约特征标在类函数空间里构成正交基，这让表示分解、重数计算与特征标表构造都变成线性代数。',
    definition: '第一正交关系：不可约特征标内积为 δ；第二正交关系按共轭类给出列正交。',
    whenToUse: ['分解表示', '填特征标表', '判同构'],
    theorems: [
      { name: '第一正交', statement: '不可约特征标两两正交且范数为 1。' },
      { name: '第二正交', statement: '按共轭类的列正交。', formula: '\\sum_g\\chi_i(g)\\overline{\\chi_j(g)}=|G|\\delta_{ij}' },
    ],
    steps: [
      { title: '列共轭类', body: '分类元素。' },
      { title: '算内积', body: '按类加权平均。' },
      { title: '验正交', body: '不同特征标为零。' },
      { title: '算重数', body: '与特征标内积。' },
      { title: '填表', body: '用正交补全。' },
    ],
    pitfalls: ['忘记除以群阶', '复共轭漏掉', '把类函数维数算错'],
    example: { problem: '不可约特征标个数等于什么？', walkthrough: ['共轭类个数。'], result: '共轭类数' },
    moreExamples: [{ problem: '内积公式的归一化？', walkthrough: ['除以 $|G|$。'], result: '1/|G|' }],
  },
  {
    id: 'character-table',
    title: '特征标表的构造',
    tag: '表示论',
    level: '竞赛',
    essence: '特征标表把群的不可约表示排成表，行是表示、列是共轭类，用维数平方和与正交关系可以唯一确定它。',
    definition: '特征标表是行不可约特征标、列共轭类的矩阵，满足正交关系与维数平方和。',
    whenToUse: ['分类表示', '查维数', '计算张量积'],
    theorems: [
      { name: '唯一性', statement: '正交关系与平方和唯一确定特征标表。' },
      { name: '列正交', statement: '列也满足加权正交。' },
    ],
    steps: [
      { title: '列共轭类', body: '元素与大小。' },
      { title: '定行数', body: '等于类数。' },
      { title: '填主行', body: '平凡表示全 1。' },
      { title: '用平方和', body: '定维数。' },
      { title: '用正交', body: '补剩余项。' },
    ],
    pitfalls: ['把行数当元素个数', '忘记类大小权重', '符号取错'],
    example: { problem: 'S₃ 的特征标表有几行？', walkthrough: ['3 个共轭类。'], result: '3 行' },
    moreExamples: [{ problem: '表的行对应什么？', walkthrough: ['不可约表示。'], result: '不可约表示' }],
  },
  {
    id: 'induced-representations',
    title: '诱导表示',
    tag: '表示论',
    level: '竞赛',
    essence: '诱导表示把子群的表示「乘上去」得到大群的表示，是构造不可约表示的主要机器。',
    definition: '诱导表示由子群表示张量群代数再取 H 不变子空间（或等价地用双陪集构造）。',
    whenToUse: ['构造表示', '算特征标', '麦克基公式'],
    theorems: [
      { name: '诱导特征标公式', statement: '诱导特征标按双陪集求和。' },
      { name: '维数公式', statement: '诱导表示维数等于指数倍。', formula: '\\dim\\mathrm{Ind}(V)=[G:H]\\dim V' },
    ],
    steps: [
      { title: '取子群 H', body: '与表示 V。' },
      { title: '取双陪集', body: '分解 G。' },
      { title: '写诱导', body: '张量取不变。' },
      { title: '算特征标', body: '按双陪集求和。' },
      { title: '验维数', body: '指数倍。' },
    ],
    pitfalls: ['把诱导当限制', '忘记指数因子', '双陪集代表选错'],
    example: { problem: '诱导表示的维数？', walkthrough: ['指数乘维数。'], result: '[G:H]\\dim V' },
    moreExamples: [{ problem: '诱导与限制的关系？', walkthrough: ['互为伴随。'], result: 'Frobenius 互反' }],
  },
  {
    id: 'frobenius-reciprocity',
    title: '弗罗贝尼乌斯互反',
    tag: '表示论',
    level: '竞赛',
    essence: '诱导与限制是伴随函子：从子群诱导的表示到大群映射，等于先限制再映射，这大幅简化重数计算。',
    definition: '互反：$\\mathrm{Hom}_G(\\mathrm{Ind}_H^G V, W)\\cong\\mathrm{Hom}_H(V,\\mathrm{Res}_H^G W)$。',
    whenToUse: ['算重数', '判断不可约', '构造分解'],
    theorems: [
      { name: '互反定理', statement: '诱导与限制互为伴随。' },
      { name: '特征标形式', statement: '内积相等。', formula: '\\langle\\mathrm{Ind}\\chi,\\psi\\rangle_G=\\langle\\chi,\\mathrm{Res}\\psi\\rangle_H' },
    ],
    steps: [
      { title: '取子群表示', body: 'V 与 W。' },
      { title: '一侧诱导', body: '$\\mathrm{Ind}V$。' },
      { title: '另一侧限制', body: '$\\mathrm{Res}W$。' },
      { title: '用互反', body: '内积相等。' },
      { title: '得重数', body: '简化计算。' },
    ],
    pitfalls: ['方向搞反', '忘记内积在不同群上', '把同构当相等'],
    example: { problem: '互反定理把什么变成什么？', walkthrough: ['大群映射变成小群映射。'], result: '诱导↔限制' },
    moreExamples: [{ problem: '互反的特征标形式？', walkthrough: ['两个内积相等。'], result: '内积相等' }],
  },
  {
    id: 'lie-algebra-basics',
    title: '李代数初步',
    tag: '表示论',
    level: '竞赛',
    essence: '李代数在单位元处线性化李群，其表示分类（最高权）是连续对称性的核心。',
    definition: '李代数带反对称双线性括号与雅可比恒等式；表示是保持括号的线性映射。',
    whenToUse: ['连续对称', '量子力学', '根系分类'],
    theorems: [
      { name: '雅可比恒等式', statement: '括号满足雅可比。', formula: '[x,[y,z]]+[y,[z,x]]+[z,[x,y]]=0' },
      { name: '最高权分类', statement: '半单李代数不可约表示由最高权分类。' },
    ],
    steps: [
      { title: '取李群', body: '矩阵群。' },
      { title: '单位元切空间', body: '得李代数。' },
      { title: '写括号', body: '交换子。' },
      { title: '验雅可比', body: '矩阵恒等式。' },
      { title: '找最高权', body: '分类表示。' },
    ],
    pitfalls: ['把李代数当结合代数', '忘记反对称性', '混淆实与复'],
    example: { problem: '矩阵李代数的括号是什么？', walkthrough: ['交换子 $[A,B]=AB-BA$。'], result: '交换子' },
    moreExamples: [{ problem: '李代数与李群的关系？', walkthrough: ['单位元处切空间。'], result: '线性化' }],
  },

  {
    id: 'binomial-identities',
    title: '二项式系数与组合恒等式',
    tag: '组合数学',
    level: '进阶',
    essence: '二项式系数满足帕斯卡递推与大量恒等式，组合证明（双计数、生成函数、归纳）是推导它们的三大方法。',
    definition: '二项式系数 $\\binom{n}{k}$ 计数 n 元集的 k 元子集；满足帕斯卡恒等式与对称性。',
    whenToUse: ['化简求和', '组合恒等式', '概率计算'],
    theorems: [
      { name: '帕斯卡恒等式', statement: '相邻两系数相加得下一行。', formula: '\\binom{n}{k}=\\binom{n-1}{k-1}+\\binom{n-1}{k}' },
      { name: '范德蒙德卷积', statement: '两个二项式系数的卷积。', formula: '\\sum_k\\binom{m}{k}\\binom{n}{r-k}=\\binom{m+n}{r}' },
    ],
    steps: [
      { title: '看求和', body: '识别组合意义。' },
      { title: '双计数', body: '两种方式数同一集合。' },
      { title: '或用生成函数', body: '写成系数。' },
      { title: '化简', body: '用帕斯卡或卷积。' },
      { title: '验小值', body: '代入检查。' },
    ],
    pitfalls: ['把组合数当排列数', '忽略边界 $k>n$', '归纳时漏基例'],
    example: { problem: '$\\binom{5}{2}$ 等于？', walkthrough: ['5·4/2。'], result: '10' },
    moreExamples: [{ problem: '范德蒙德卷积说什么？', walkthrough: ['卷积等于合并的二项式系数。'], result: '\\binom{m+n}{r}' }],
  },
  {
    id: 'inclusion-exclusion',
    title: '容斥原理',
    tag: '组合数学',
    level: '进阶',
    essence: '容斥原理用交集交替求和计算并集大小，是计数「至少一个」类问题的标准工具。',
    definition: '容斥公式：并集大小等于单集和减两两交加三三交，依次交替。',
    whenToUse: ['计数至少一个', '错排', '筛法'],
    theorems: [
      { name: '容斥公式', statement: '并集大小的交替和。', formula: '|\\cup A_i|=\\sum|A_i|-\\sum|A_i\\cap A_j|+\\cdots' },
      { name: '错排公式', statement: '错排数等于容斥的经典应用。' },
    ],
    steps: [
      { title: '定全集', body: '总计数。' },
      { title: '列坏事件', body: '要排除的性质。' },
      { title: '算交集', body: '各阶交集大小。' },
      { title: '交替求和', body: '代入公式。' },
      { title: '得结果', body: '满足条件的计数。' },
    ],
    pitfalls: ['符号交替出错', '交集大小算错', '把容斥当直接相减'],
    example: { problem: '1..100 中不是 2 也不是 3 的倍数有几个？', walkthrough: ['100−50−33+16。'], result: '33' },
    moreExamples: [{ problem: '错排用什么方法？', walkthrough: ['容斥。'], result: '容斥' }],
  },
  {
    id: 'recurrence-relations',
    title: '递推关系与特征方程',
    tag: '组合数学',
    level: '进阶',
    essence: '线性递推由特征方程求解，斐波那契与卡特兰数都是经典例子，生成函数给出统一框架。',
    definition: '递推关系用前面项定义后面项；常系数线性齐次递推可用特征根法求解。',
    whenToUse: ['数列求通项', '算法复杂度', '计数递推'],
    theorems: [
      { name: '特征根法', statement: '无重根时通项为特征根幂的线性组合。' },
      { name: '斐波那契', statement: '满足二阶递推，通项含黄金比。', formula: 'F_n=F_{n-1}+F_{n-2}' },
    ],
    steps: [
      { title: '写递推', body: '确定阶数。' },
      { title: '写特征方程', body: '把项换成幂。' },
      { title: '求根', body: '解方程。' },
      { title: '定系数', body: '用初值。' },
      { title: '得通项', body: '线性组合。' },
    ],
    pitfalls: ['重根情形漏乘 n', '初值代入错', '非齐次忘记特解'],
    example: { problem: '斐波那契的特征方程？', walkthrough: ['$r^2=r+1$。'], result: 'r^2-r-1=0' },
    moreExamples: [{ problem: '重根时通项形式？', walkthrough: ['乘 $n$ 的幂。'], result: '含 n r^n' }],
  },
  {
    id: 'catalan-numbers',
    title: '卡特兰数',
    tag: '组合数学',
    level: '竞赛',
    essence: '卡特兰数计数括号匹配、二叉树与不跨越对角线的路径，通项为二项式系数之差。',
    definition: '第 n 个卡特兰数 $C_n=\\frac{1}{n+1}\\binom{2n}{n}$，满足递推与生成函数方程。',
    whenToUse: ['括号匹配', '二叉树计数', '路径计数'],
    theorems: [
      { name: '通项公式', statement: '二项式系数除以 n+1。', formula: 'C_n=\\frac{1}{n+1}\\binom{2n}{n}' },
      { name: '反射原理', statement: '用反射计数得通项。' },
    ],
    steps: [
      { title: '识别结构', body: '是否为卡特兰型。' },
      { title: '写递推', body: '$C_{n+1}=\\sum C_iC_{n-i}$。' },
      { title: '用生成函数', body: '解二次方程。' },
      { title: '得通项', body: '二项式形式。' },
      { title: '验小值', body: '1,1,2,5,14。' },
    ],
    pitfalls: ['把卡特兰当普通组合数', '忘记 n+1 因子', '混淆不同组合模型'],
    example: { problem: '$C_3$ 等于多少？', walkthrough: ['1/4·C(6,3)=5。'], result: '5' },
    moreExamples: [{ problem: '卡特兰数计数什么？', walkthrough: ['括号匹配等。'], result: '合法括号序列' }],
  },
  {
    id: 'integer-partitions',
    title: '整数分拆',
    tag: '组合数学',
    level: '竞赛',
    essence: '整数分拆把 n 写成正整数之和，其生成函数与分拆恒等式（欧拉、罗杰斯－拉马努金）是组合数论的核心。',
    definition: 'p(n) 是 n 的分拆数；生成函数为 $\\prod_{k\\ge1}(1-x^k)^{-1}$。',
    whenToUse: ['分拆计数', '生成函数', '恒等式'],
    theorems: [
      { name: '欧拉分拆定理', statement: '互异部分分拆数等于奇数部分分拆数。' },
      { name: '生成函数', statement: '分拆数的生成函数为无穷乘积。', formula: '\\sum p(n)x^n=\\prod_{k\\ge1}\\frac{1}{1-x^k}' },
    ],
    steps: [
      { title: '小规模枚举', body: '算 p(1)..p(5)。' },
      { title: '写生成函数', body: '乘积形式。' },
      { title: '用恒等式', body: '欧拉等。' },
      { title: '估渐近', body: '哈代－拉马努金。' },
      { title: '验', body: '系数比较。' },
    ],
    pitfalls: ['把分拆当组合（顺序有关）', '忽略部分大小限制', '生成函数收敛域'],
    example: { problem: 'p(4) 等于多少？', walkthrough: ['4,3+1,2+2,2+1+1,1+1+1+1。'], result: '5' },
    moreExamples: [{ problem: '欧拉分拆定理说哪两类相等？', walkthrough: ['互异部分 vs 奇数部分。'], result: '互异=奇数' }],
  },
  {
    id: 'polya-counting',
    title: '波利亚计数与伯恩赛德引理',
    tag: '组合数学',
    level: '竞赛',
    essence: '伯恩赛德引理数轨道数，波利亚计数把群作用下的染色计数变成生成函数，是「本质不同」计数的标准工具。',
    definition: '伯恩赛德引理：轨道数等于群元素不动点数的平均；波利亚把不动点数写成循环指标。',
    whenToUse: ['项链计数', '本质不同染色', '对称性计数'],
    theorems: [
      { name: '伯恩赛德引理', statement: '轨道数等于不动点平均。', formula: '\\frac{1}{|G|}\\sum_{g}|X^g|' },
      { name: '波利亚计数', statement: '用循环指标生成函数计数。' },
    ],
    steps: [
      { title: '定群作用', body: '旋转或翻转。' },
      { title: '列群元素', body: '每个元素的不动点数。' },
      { title: '求平均', body: '伯恩赛德。' },
      { title: '写循环指标', body: '波利亚。' },
      { title: '得计数', body: '轨道数。' },
    ],
    pitfalls: ['把轨道当元素', '忘记除以群阶', '循环型算错'],
    example: { problem: '三个珠子的项链（旋转等价）有几种？', walkthrough: ['伯恩赛德：3 种染色。'], result: '3' },
    moreExamples: [{ problem: '伯恩赛德引理公式？', walkthrough: ['不动点平均。'], result: '\\frac1{|G|}\\sum|X^g|' }],
  },

  {
    id: 'matching-cover',
    title: '匹配与覆盖',
    tag: '图论',
    level: '竞赛',
    essence: '匹配是两两不邻接的边集，最大匹配与最小顶点覆盖由柯尼希定理对偶，是二部图优化的核心。',
    definition: '匹配是两两无公共端点的边集；顶点覆盖是覆盖所有边的顶点集。',
    whenToUse: ['任务分配', '最大匹配', '对偶问题'],
    theorems: [
      { name: '柯尼希定理', statement: '二部图中最大匹配等于最小顶点覆盖。', formula: '\\nu=\\tau' },
      { name: '博格公式', statement: '最大匹配与奇分支数联系。' },
    ],
    steps: [
      { title: '判二部', body: '能否二染色。' },
      { title: '找增广路', body: '交错路径。' },
      { title: '扩充匹配', body: '沿增广路翻转。' },
      { title: '得最大', body: '无增广路即最大。' },
      { title: '用对偶', body: '得最小覆盖。' },
    ],
    pitfalls: ['把极大当最大', '忽略二部前提', '增广路方向错'],
    example: { problem: '二部图最大匹配等于什么？', walkthrough: ['柯尼希定理。'], result: '最小顶点覆盖' },
    moreExamples: [{ problem: '增广路的作用？', walkthrough: ['扩充匹配。'], result: '加一条边' }],
  },
  {
    id: 'hall-theorem',
    title: '霍尔婚姻定理',
    tag: '图论',
    level: '竞赛',
    essence: '霍尔定理给出完美匹配存在的充要条件：任取 k 个左侧点，其邻居不少于 k 个。',
    definition: '二部图有饱和左部的匹配，当且仅当任意左部子集 S 满足 $|N(S)|\\ge|S|$。',
    whenToUse: ['判定完美匹配', '构造匹配', '组合存在性'],
    theorems: [
      { name: '霍尔定理', statement: '邻居条件 ⇔ 饱和匹配存在。', formula: '|N(S)|\\ge|S|' },
      { name: '正则二部图', statement: '正则二部图必有完美匹配。' },
    ],
    steps: [
      { title: '写二部图', body: '左右部。' },
      { title: '验条件', body: '任取子集看邻居数。' },
      { title: '找反例', body: '若某子集邻居不足则无解。' },
      { title: '构造匹配', body: '用增广路。' },
      { title: '得完美匹配', body: '覆盖左部。' },
    ],
    pitfalls: ['只验单点条件', '忽略「任意子集」', '把饱和左部当完美匹配'],
    example: { problem: '霍尔条件不满足说明什么？', walkthrough: ['存在饱和不了的左部。'], result: '无饱和匹配' },
    moreExamples: [{ problem: '正则二部图有完美匹配吗？', walkthrough: ['霍尔条件自动满足。'], result: '有' }],
  },
  {
    id: 'menger-theorem',
    title: '门格尔定理与连通度',
    tag: '图论',
    level: '竞赛',
    essence: '门格尔定理说两点间不相交路径数等于分离它们所需的最少顶点数，把连通度与路径计数对偶起来。',
    definition: '点连通度是分离图所需最少顶点数；门格尔定理给出局部连通度与内部不相交路径数相等。',
    whenToUse: ['判断连通强度', '网络可靠性', '构造路径'],
    theorems: [
      { name: '门格尔定理', statement: '局部连通度 = 最大不相交路径数。', formula: '\\kappa(x,y)=\\lambda(x,y)' },
      { name: '全局版本', statement: '连通度等于分离任意两点的最少点数。' },
    ],
    steps: [
      { title: '取两点', body: '源与汇。' },
      { title: '找分离集', body: '最少顶点割。' },
      { title: '找路径', body: '内部不相交。' },
      { title: '用定理', body: '数量相等。' },
      { title: '得连通度', body: '局部或全局。' },
    ],
    pitfalls: ['混淆点割与边割', '忽略内部不相交', '把门格尔用于有向图不检验'],
    example: { problem: '门格尔定理联系什么？', walkthrough: ['路径数与割集大小。'], result: '最小割 = 最大路径数' },
    moreExamples: [{ problem: '边形式门格尔说什么？', walkthrough: ['边不相交路径数等于最小边割。'], result: '边版本对偶' }],
  },
  {
    id: 'hamiltonian',
    title: '哈密顿圈与判定',
    tag: '图论',
    level: '竞赛',
    essence: '哈密顿圈经过每个顶点恰一次，判定它是 NP 完全问题；但狄拉克与奥尔条件给出充分条件。',
    definition: '哈密顿圈是经过所有顶点一次的圈；哈密顿图指含哈密顿圈的图。',
    whenToUse: ['路线规划', '判定充分条件', '构造反例'],
    theorems: [
      { name: '狄拉克定理', statement: '最小度 ≥ n/2 则哈密顿。', formula: '\\delta\\ge n/2' },
      { name: '奥尔定理', statement: '任意不邻接点度之和 ≥ n 则哈密顿。' },
    ],
    steps: [
      { title: '看顶点数', body: '$n$。' },
      { title: '算最小度', body: '$\\delta$。' },
      { title: '用狄拉克', body: '是否 $\\ge n/2$。' },
      { title: '或用奥尔', body: '不邻接点度和。' },
      { title: '构造圈', body: '闭合路径。' },
    ],
    pitfalls: ['把充分条件当必要', '忽略 n≥3', '混淆哈密顿与欧拉'],
    example: { problem: '完全图 Kₙ 有哈密顿圈吗？', walkthrough: ['度最大，满足狄拉克。'], result: '有' },
    moreExamples: [{ problem: '彼得森图有哈密顿圈吗？', walkthrough: ['经典反例：无。'], result: '没有' }],
  },
  {
    id: 'turan-theorem',
    title: '图兰定理与极值图论',
    tag: '图论',
    level: '竞赛',
    essence: '图兰定理给出不含 Kᵣ₊₁ 的图的最大边数，是极值图论的开端：完全多部图是最优结构。',
    definition: '图兰图 T(n,r) 是尽量均匀的 r 部完全图；图兰定理说它是不含 Kᵣ₊₁ 的 n 顶点图中边数最多的。',
    whenToUse: ['极值问题', '判断稠密度', '构造最优图'],
    theorems: [
      { name: '图兰定理', statement: '不含 Kᵣ₊₁ 的最大边数由 T(n,r) 达到。', formula: 'e\\le\\left(1-\\frac1r\\right)\\frac{n^2}{2}' },
      { name: '稳定性', statement: '接近极值时图接近图兰图。' },
    ],
    steps: [
      { title: '定禁止子图', body: '如 K₃。' },
      { title: '定 r', body: '禁止 Kᵣ₊₁。' },
      { title: '构造图兰图', body: '均匀分 r 部。' },
      { title: '算边数', body: '公式。' },
      { title: '用定理', body: '上界。' },
    ],
    pitfalls: ['把图兰图当唯一极值（同构意义）', 'r 与禁止图搞错', '忽略 n 的取整'],
    example: { problem: '不含三角形的 n 顶点图最多多少边？', walkthrough: ['$r=2$ 图兰图。'], result: '\\lfloor n^2/4\\rfloor' },
    moreExamples: [{ problem: '图兰图的结构？', walkthrough: ['均匀完全多部图。'], result: '完全 r 部' }],
  },
  {
    id: 'max-flow-cut',
    title: '最大流与最小割定理',
    tag: '图论',
    level: '竞赛',
    essence: '最大流等于最小割，福特－富尔克森算法用增广路找最大流，是组合优化的基石。',
    definition: '网络流满足容量约束与流量守恒；割是分离源汇的边集，容量为边容量之和。',
    whenToUse: ['运输问题', '匹配建模', '割集分析'],
    theorems: [
      { name: '最大流最小割', statement: '最大流值等于最小割容量。', formula: '\\max f=\\min c(S,T)' },
      { name: '整数流', statement: '整数容量存在整数最大流。' },
    ],
    steps: [
      { title: '建网络', body: '源汇与容量。' },
      { title: '找增广路', body: '残量网络。' },
      { title: '更新流量', body: '推流。' },
      { title: '重复', body: '直到无增广路。' },
      { title: '得最小割', body: '由残量网络划分。' },
    ],
    pitfalls: ['忘记反向边', '把割当边集大小', '忽略容量方向'],
    example: { problem: '最大流等于什么？', walkthrough: ['最小割。'], result: '最小割容量' },
    moreExamples: [{ problem: '残量网络的作用？', walkthrough: ['允许退流。'], result: '找增广路' }],
  },

  {
    id: 'boolean-algebra',
    title: '布尔代数',
    tag: '格论',
    level: '进阶',
    essence: '布尔代数是每个元素都有补的分配格，它同构于幂集代数，是逻辑电路与集合运算的共同抽象。',
    definition: '布尔代数是分配有补有界格；补元唯一，满足德摩根律与双重否定。',
    whenToUse: ['逻辑化简', '电路设计', '集合代数'],
    theorems: [
      { name: '斯通表示', statement: '每个有限布尔代数同构于幂集代数。' },
      { name: '补唯一', statement: '布尔代数中补元唯一。', formula: 'a\\wedge\\neg a=0,\\;a\\vee\\neg a=1' },
    ],
    steps: [
      { title: '验分配', body: '分配律是否成立。' },
      { title: '找补元', body: '每元素是否有补。' },
      { title: '验唯一', body: '补元唯一性。' },
      { title: '化逻辑式', body: '用德摩根。' },
      { title: '对应幂集', body: '斯通表示。' },
    ],
    pitfalls: ['把分配格当布尔代数（缺补元）', '补元不唯一的情形（非分配格）', '混淆逻辑与集合符号'],
    example: { problem: '幂集代数中的补是什么？', walkthrough: ['集合补。'], result: '补集' },
    moreExamples: [{ problem: '有限布尔代数都同构于什么？', walkthrough: ['幂集代数。'], result: '幂集' }],
  },
  {
    id: 'complete-lattice',
    title: '完备格与完备化',
    tag: '格论',
    level: '竞赛',
    essence: '完备格的任意子集都有上下确界，它不是有限格的自然推广；完备化把格嵌入完备格。',
    definition: '完备格是任意子集都有上确界与下确界的偏序集；有限格不必完备，完备格必为有界格。',
    whenToUse: ['构造极限', '不动点定理', '拓扑与序'],
    theorems: [
      { name: '塔斯基不动点', statement: '完备格上单调映射有最小不动点。' },
      { name: '完备化', statement: '每个偏序集有 Dedekind-MacNeille 完备化。' },
    ],
    steps: [
      { title: '取子集', body: '任意大小。' },
      { title: '求上确界', body: '是否存在。' },
      { title: '求下确界', body: '是否存在。' },
      { title: '验完备', body: '所有子集。' },
      { title: '用不动点', body: '单调映射。' },
    ],
    pitfalls: ['把有限格当完备', '忽略空集的确界', '混淆完备与有界'],
    example: { problem: '实数区间 [0,1] 是完备格吗？', walkthrough: ['任意子集有确界。'], result: '是' },
    moreExamples: [{ problem: '塔斯基不动点定理说什么？', walkthrough: ['单调映射有最小不动点。'], result: '最小不动点' }],
  },
  {
    id: 'galois-connection',
    title: '伽罗瓦连接',
    tag: '格论',
    level: '竞赛',
    essence: '伽罗瓦连接是一对互为伴随的单调映射，它诱导闭包算子，是形式概念分析与代数-几何对偶的统一框架。',
    definition: '单调映射 f: P→Q 与 g: Q→P 构成伽罗瓦连接指 $f(p)\\le q\\iff p\\le g(q)$。',
    whenToUse: ['形式概念分析', '对偶理论', '闭包'],
    theorems: [
      { name: '诱导闭包', statement: 'g∘f 是 P 上的闭包算子。' },
      { name: '伴随唯一', statement: '左伴随唯一确定右伴随。' },
    ],
    steps: [
      { title: '给两个偏序集', body: 'P 与 Q。' },
      { title: '写映射对', body: 'f 与 g。' },
      { title: '验伴随', body: '$f(p)\\le q\\iff p\\le g(q)$。' },
      { title: '得闭包', body: '$g\\circ f$。' },
      { title: '取不动点', body: '概念格。' },
    ],
    pitfalls: ['方向搞反', '把伽罗瓦连接当同构', '忽略单调性'],
    example: { problem: '伽罗瓦连接诱导什么算子？', walkthrough: ['闭包。'], result: '闭包算子' },
    moreExamples: [{ problem: '形式概念分析用什么？', walkthrough: ['伽罗瓦连接。'], result: '伽罗瓦连接' }],
  },
  {
    id: 'closure-operator',
    title: '闭包算子与内部算子',
    tag: '格论',
    level: '进阶',
    essence: '闭包算子满足扩张、单调、幂等，其不动点构成完备格；拓扑闭包与代数闭包都是例子。',
    definition: '闭包算子 c 满足 $x\\le c(x)$、单调、$c(c(x))=c(x)$；不动点称闭元。',
    whenToUse: ['拓扑闭包', '代数闭包', '形式概念'],
    theorems: [
      { name: '不动点成完备格', statement: '闭包算子的不动点集是完备格。' },
      { name: '与伽罗瓦连接对应', statement: '闭包算子来自伽罗瓦连接。' },
    ],
    steps: [
      { title: '定义映射', body: '从偏序集到自身。' },
      { title: '验扩张', body: '$x\\le c(x)$。' },
      { title: '验单调', body: '保序。' },
      { title: '验幂等', body: '$c^2=c$。' },
      { title: '取不动点', body: '得完备格。' },
    ],
    pitfalls: ['把内部算子当闭包（方向反）', '忘记幂等', '不动点集当子格'],
    example: { problem: '拓扑闭包满足哪三条？', walkthrough: ['扩张、单调、幂等。'], result: '三条' },
    moreExamples: [{ problem: '闭包算子的不动点构成？', walkthrough: ['完备格。'], result: '完备格' }],
  },
  {
    id: 'modular-lattice',
    title: '模格与半模格',
    tag: '格论',
    level: '竞赛',
    essence: '模格满足模律，子群格与子空间格都是模格；它介于一般格与分配格之间。',
    definition: '模格满足 $x\\le z\\Rightarrow x\\vee(y\\wedge z)=(x\\vee y)\\wedge z$；分配格一定是模格。',
    whenToUse: ['子群格', '子空间格', '若尔当-赫尔德'],
    theorems: [
      { name: '分配蕴含模', statement: '分配格都是模格。' },
      { name: '子群格模', statement: '正规子群格是模格。' },
    ],
    steps: [
      { title: '验模律', body: '对 $x\\le z$ 检查。' },
      { title: '找反例', body: '五边形格非模。' },
      { title: '联系分配', body: '分配推出模。' },
      { title: '用于子群', body: '正规子群格。' },
      { title: '得结构', body: '若尔当-赫尔德。' },
    ],
    pitfalls: ['把模格当分配格', '方向写反', '忽略 $x\\le z$ 前提'],
    example: { problem: '分配格一定是模格吗？', walkthrough: ['分配蕴含模。'], result: '是' },
    moreExamples: [{ problem: '经典的非模格？', walkthrough: ['五边形格 N₅。'], result: '五边形格' }],
  },
  {
    id: 'heyting-algebra',
    title: '海廷代数与直觉主义逻辑',
    tag: '格论',
    level: '竞赛',
    essence: '海廷代数是带蕴含的分配格，它是直觉主义命题逻辑的代数语义，布尔代数是其特例。',
    definition: '海廷代数是有伪补的分配格：$a\\wedge x\\le b$ 的最大 x 记作 $a\\to b$。',
    whenToUse: ['直觉主义语义', '拓扑开集格', '托波斯'],
    theorems: [
      { name: '开集格是海廷代数', statement: '拓扑的开集格带蕴含。' },
      { name: '布尔是特例', statement: '布尔代数中 $a\\to b=\\neg a\\vee b$。' },
    ],
    steps: [
      { title: '取分配格', body: '有界。' },
      { title: '定义伪补', body: '$a\\to b$。' },
      { title: '验伴随', body: '$a\\wedge x\\le b$。' },
      { title: '得海廷', body: '满足分配。' },
      { title: '看逻辑', body: '直觉主义语义。' },
    ],
    pitfalls: ['把海廷当布尔（排中律不成立）', '伪补方向错', '忘记有界性'],
    example: { problem: '海廷代数中排中律总成立吗？', walkthrough: ['不总成立。'], result: '不总成立' },
    moreExamples: [{ problem: '布尔代数与海廷代数关系？', walkthrough: ['布尔是特例。'], result: '特例' }],
  },

  {
    id: 'hamming-bound',
    title: '汉明界与完美码',
    tag: '编码理论',
    level: '进阶',
    essence: '汉明界限制码字个数：纠错球不能重叠。达到等号叫完美码，汉明码就是完美码。',
    definition: '汉明界：$|C|\\cdot\\sum_{i=0}^{t}\\binom{n}{i}(q-1)^i\\le q^n$，其中 t 为纠错能力。',
    whenToUse: ['判断码是否最优', '设计参数', '证明不存在'],
    theorems: [
      { name: '汉明界', statement: '纠错球体积乘码字数不超过全空间。', formula: '|C|\\sum_{i\\le t}\\binom ni(q-1)^i\\le q^n' },
      { name: '完美码', statement: '取等号时称完美码。' },
    ],
    steps: [
      { title: '定参数', body: 'n、k、d。' },
      { title: '算 t', body: '$t=\\lfloor(d-1)/2\\rfloor$。' },
      { title: '算球体积', body: '二项式求和。' },
      { title: '比较', body: '与 $q^n$ 比较。' },
      { title: '判完美', body: '是否取等。' },
    ],
    pitfalls: ['把 t 当 d', '忘记 $(q-1)^i$ 因子', '混淆界与构造'],
    example: { problem: '汉明码为什么叫完美码？', walkthrough: ['汉明界取等。'], result: '达到汉明界' },
    moreExamples: [{ problem: 't 与 d 的关系？', walkthrough: ['$t=\\lfloor(d-1)/2\\rfloor$。'], result: '\\lfloor(d-1)/2\\rfloor' }],
  },
  {
    id: 'singleton-bound',
    title: '辛格尔顿界与 MDS 码',
    tag: '编码理论',
    level: '竞赛',
    essence: '辛格尔顿界说 d ≤ n−k+1；达到等号的码叫 MDS 码，里德-所罗门码就是 MDS。',
    definition: '辛格尔顿界：最小距离不超过 n−k+1；取等称为最大距离可分码（MDS）。',
    whenToUse: ['判断最优性', '设计 RS 码', '参数权衡'],
    theorems: [
      { name: '辛格尔顿界', statement: 'd ≤ n−k+1。', formula: 'd\\le n-k+1' },
      { name: 'MDS 判据', statement: '取等即 MDS。' },
    ],
    steps: [
      { title: '看参数', body: 'n、k。' },
      { title: '算上界', body: 'n−k+1。' },
      { title: '比较 d', body: '是否取等。' },
      { title: '判 MDS', body: '取等。' },
      { title: '看性质', body: '任意 k 列可逆。' },
    ],
    pitfalls: ['把界当等式', '忽略有限域限制', 'MDS 与完美码混淆'],
    example: { problem: 'RS 码是 MDS 吗？', walkthrough: ['达到辛格尔顿界。'], result: '是' },
    moreExamples: [{ problem: 'MDS 的等价刻画？', walkthrough: ['生成矩阵任意 k 列可逆。'], result: '任意 k 列可逆' }],
  },
  {
    id: 'gilbert-varshamov',
    title: '吉尔伯特－瓦尔沙莫夫界',
    tag: '编码理论',
    level: '竞赛',
    essence: 'GV 界是存在性下界：球体积总和小于全空间就能再塞一个码字，因此好码一定存在。',
    definition: 'GV 界：若 $q^k\\sum_{i<t}\\binom{n}{i}(q-1)^i<q^n$，则存在最小距离至少 d 的 q 元码。',
    whenToUse: ['证明存在性', '估计码率', '随机编码'],
    theorems: [
      { name: 'GV 界', statement: '球体积不够覆盖则可加码字。' },
      { name: '渐进 GV', statement: '给出了正码率的渐近下界。' },
    ],
    steps: [
      { title: '定 d', body: '目标距离。' },
      { title: '算球体积', body: '半径 d−1。' },
      { title: '比较容量', body: '与 $q^n$ 比。' },
      { title: '贪心加码字', body: '每次挖掉一个球。' },
      { title: '得存在性', body: '码字个数下界。' },
    ],
    pitfalls: ['把 GV 当上界', '半径取 t 而非 d−1', '忽略贪心构造'],
    example: { problem: 'GV 界是上界还是下界？', walkthrough: ['存在性下界。'], result: '下界' },
    moreExamples: [{ problem: 'GV 界怎么构造码？', walkthrough: ['贪心加码字并挖球。'], result: '贪心构造' }],
  },
  {
    id: 'dual-code',
    title: '对偶码与自对偶码',
    tag: '编码理论',
    level: '竞赛',
    essence: '对偶码在正交补里，生成矩阵与校验矩阵互为对偶；自对偶码满足 C=C⊥，参数受强约束。',
    definition: '对偶码 $C^\\perp=\\{y:\\langle y,c\\rangle=0,\\forall c\\in C\\}$；自对偶指 C=C⊥。',
    whenToUse: ['构造码', '重量枚举', '判自对偶'],
    theorems: [
      { name: '维数关系', statement: '$\\dim C^\\perp=n-k$。' },
      { name: '自对偶约束', statement: '自对偶码维数 n/2，权重全偶。' },
    ],
    steps: [
      { title: '取生成矩阵', body: 'G。' },
      { title: '求正交补', body: '解 $G y^T=0$。' },
      { title: '得对偶码', body: '生成矩阵 H。' },
      { title: '判自对偶', body: 'G 与 H 行空间相同。' },
      { title: '看参数', body: 'n 偶、k=n/2。' },
    ],
    pitfalls: ['把对偶码当补集', '忘记内积域', '自对偶维数条件'],
    example: { problem: '自对偶码的维数？', walkthrough: ['$k=n/2$。'], result: 'n/2' },
    moreExamples: [{ problem: '对偶码的生成矩阵是什么？', walkthrough: ['原码的校验矩阵。'], result: '校验矩阵' }],
  },
  {
    id: 'weight-enumerator',
    title: '重量枚举与麦克威廉斯恒等式',
    tag: '编码理论',
    level: '竞赛',
    essence: '重量枚举多项式统计各重量的码字数，麦克威廉斯恒等式把码与其对偶的重量分布用变换联系起来。',
    definition: '重量枚举 $W_C(x,y)=\\sum_{c\\in C}x^{n-wt(c)}y^{wt(c)}$；麦克威廉斯恒等式给出对偶的重量枚举。',
    whenToUse: ['分析码结构', '证界', '判等价'],
    theorems: [
      { name: '麦克威廉斯恒等式', statement: '对偶重量枚举由原码变换得到。' },
      { name: '重量分布对称', statement: '对偶码重量分布受约束。' },
    ],
    steps: [
      { title: '列码字', body: '全部码字。' },
      { title: '算重量', body: '非零分量数。' },
      { title: '写多项式', body: '按重量计数。' },
      { title: '用恒等式', body: '变换得对偶。' },
      { title: '分析', body: '得界或等价判定。' },
    ],
    pitfalls: ['把重量当距离', '忘记归一化因子', '混淆多项式变量'],
    example: { problem: '重量枚举统计什么？', walkthrough: ['各重量码字数。'], result: '重量分布' },
    moreExamples: [{ problem: '麦克威廉斯恒等式联系什么？', walkthrough: ['码与对偶的重量枚举。'], result: '对偶' }],
  },
  {
    id: 'convolutional-code',
    title: '卷积码与维特比译码',
    tag: '编码理论',
    level: '竞赛',
    essence: '卷积码有记忆，用状态转移描述；维特比译码在网格图上做动态规划找最可能路径。',
    definition: '卷积码由生成多项式与移位寄存器定义，输出依赖当前与历史输入。',
    whenToUse: ['通信编码', '序列译码', '差错控制'],
    theorems: [
      { name: '网格表示', statement: '卷积码对应状态转移图。' },
      { name: '维特比最优', statement: '最大似然译码可由动态规划实现。' },
    ],
    steps: [
      { title: '写生成多项式', body: '约束长度。' },
      { title: '画状态图', body: '移位寄存器状态。' },
      { title: '展开网格', body: '时间展开。' },
      { title: '算路径度量', body: '汉明距离。' },
      { title: '回溯', body: '得译码序列。' },
    ],
    pitfalls: ['把卷积码当分组码', '忘记记忆长度', '度量方向错'],
    example: { problem: '维特比译码用什么算法思想？', walkthrough: ['动态规划。'], result: '动态规划' },
    moreExamples: [{ problem: '卷积码与分组码的区别？', walkthrough: ['有记忆。'], result: '输出依赖历史' }],
  },

  {
    id: 'proof-methods',
    title: '证明方法：直接、反证与分类',
    tag: '离散数学',
    level: '进阶',
    essence: '离散数学的结论几乎都靠五种证明法：直接、反证、归谬、分类讨论与构造；选对方法比算得快更重要。',
    definition: '直接证明从前提推到结论；反证假设结论为假导出矛盾；分类按情形穷尽讨论。',
    whenToUse: ['证明命题', '写形式论证', '判断真假'],
    theorems: [
      { name: '反证法', statement: '假设否定导出矛盾即可。' },
      { name: '分类讨论', statement: '情形穷尽且每类成立则整体成立。' },
    ],
    steps: [
      { title: '读命题', body: '明确前提与结论。' },
      { title: '选方法', body: '直接、反证或分类。' },
      { title: '写推理', body: '每步有据。' },
      { title: '验穷尽', body: '分类是否覆盖全部。' },
      { title: '收尾', body: '结论回到原命题。' },
    ],
    pitfalls: ['反证时否定写错', '分类有遗漏', '循环论证'],
    example: { problem: '$\\sqrt2$ 是无理数用什么方法？', walkthrough: ['反证。'], result: '反证法' },
    moreExamples: [{ problem: '分类讨论要求什么？', walkthrough: ['情形穷尽。'], result: '穷尽且不重' }],
  },
  {
    id: 'mathematical-induction',
    title: '数学归纳法与强归纳',
    tag: '离散数学',
    level: '进阶',
    essence: '归纳法用「基础情形 + 递推步」证明无限多个命题；强归纳允许假设所有更小情形。',
    definition: '普通归纳假设 n=k 成立推 n=k+1；强归纳假设所有 n<k 成立推 n=k。',
    whenToUse: ['证明恒等式', '算法正确性', '递归定义'],
    theorems: [
      { name: '归纳原理', statement: '基础 + 递推推出全体。' },
      { name: '强归纳等价', statement: '强归纳与普通归纳等价。' },
    ],
    steps: [
      { title: '写命题', body: '$P(n)$ 是什么。' },
      { title: '验基础', body: '$P(1)$ 成立。' },
      { title: '设归纳假设', body: '$P(k)$ 成立。' },
      { title: '推下一步', body: '证 $P(k+1)$。' },
      { title: '得结论', body: '全体成立。' },
    ],
    pitfalls: ['漏基础情形', '递推用错假设', '强归纳前提没写全'],
    example: { problem: '$1+2+\\cdots+n=n(n+1)/2$ 用什么证明？', walkthrough: ['归纳法。'], result: '归纳' },
    moreExamples: [{ problem: '强归纳与普通归纳关系？', walkthrough: ['等价。'], result: '等价' }],
  },
  {
    id: 'sequences-sums',
    title: '序列与求和',
    tag: '离散数学',
    level: '进阶',
    essence: '序列用递推或通项描述，求和公式（等差、等比、裂项）是计数与复杂度的基本工具。',
    definition: '序列是标号元素列；求和是把序列累加，常用公式包括等差、等比与裂项。',
    whenToUse: ['算复杂度', '化简求和', '递推求解'],
    theorems: [
      { name: '等比求和', statement: '$\\sum_{k=0}^{n}ar^k=a(r^{n+1}-1)/(r-1)$。', formula: '\\sum ar^k=\\frac{a(r^{n+1}-1)}{r-1}' },
      { name: '裂项', statement: '$1/(k(k+1))=1/k-1/(k+1)$。' },
    ],
    steps: [
      { title: '看类型', body: '等差、等比或可裂项。' },
      { title: '选公式', body: '对应求和公式。' },
      { title: '定上下限', body: '起止项。' },
      { title: '化简', body: '代数整理。' },
      { title: '验小值', body: '代入检查。' },
    ],
    pitfalls: ['等比公比 1 的特例', '下标起始搞错', '裂项抵消漏项'],
    example: { problem: '$1+2+\\cdots+100$ 等于？', walkthrough: ['$100\\times101/2$。'], result: '5050' },
    moreExamples: [{ problem: '裂项求和的关键？', walkthrough: ['中间项抵消。'], result: '抵消' }],
  },
  {
    id: 'algorithms-complexity',
    title: '算法与复杂度',
    tag: '离散数学',
    level: '进阶',
    essence: '复杂度用大 O 描述增长量级，它决定算法能否扩展；离散数学给出复杂度分析的基本工具。',
    definition: '$f=O(g)$ 指存在常数 C 使 $f(n)\\le Cg(n)$ 对大 n 成立；大 Θ 表示同阶。',
    whenToUse: ['分析算法', '比较方案', '估计算量'],
    theorems: [
      { name: '传递性', statement: '$O$ 关系可传递。' },
      { name: '主定理', statement: '分治递归的复杂度由递归式决定。' },
    ],
    steps: [
      { title: '写基本操作', body: '循环或递归。' },
      { title: '数次数', body: '关于 n 的函数。' },
      { title: '取主项', body: '忽略常数与低阶。' },
      { title: '得 O 或 Θ', body: '大 O 记号。' },
      { title: '比较', body: '与其他算法比。' },
    ],
    pitfalls: ['把常数当量级', '混淆 O 与 Θ', '忽略最坏与平均'],
    example: { problem: '二分查找的复杂度？', walkthrough: ['每次减半。'], result: 'O(log n)' },
    moreExamples: [{ problem: '大 O 的定义？', walkthrough: ['存在常数上界。'], result: '渐近上界' }],
  },
  {
    id: 'divmod-algorithms',
    title: '整除、模运算与欧几里得算法',
    tag: '离散数学',
    level: '进阶',
    essence: '带余除法给出商与余数，模运算在其上建立；欧几里得算法用辗转相除求最大公因子，是数论算法的基础。',
    definition: '带余除法：$a=bq+r$，$0\\le r<b$；模运算取余数；gcd 用辗转相除。',
    whenToUse: ['求 gcd', '解同余', '密码学'],
    theorems: [
      { name: '带余除法', statement: '商与余数唯一。' },
      { name: '欧几里得算法', statement: 'gcd(a,b)=gcd(b,a mod b)。' },
    ],
    steps: [
      { title: '做除法', body: '求商与余数。' },
      { title: '换元', body: '$a\\leftarrow b$，$b\\leftarrow r$。' },
      { title: '重复', body: '直到余数为零。' },
      { title: '得 gcd', body: '最后的非零除数。' },
      { title: '扩展', body: '贝祖系数。' },
    ],
    pitfalls: ['余数符号取错', '忽略 gcd(0,a)=a', '扩展算法回代出错'],
    example: { problem: 'gcd(48,18) 等于？', walkthrough: ['48=2·18+12, 18=1·12+6。'], result: '6' },
    moreExamples: [{ problem: '欧几里得算法的复杂度？', walkthrough: ['对数级。'], result: 'O(log n)' }],
  },
  {
    id: 'boolean-functions',
    title: '布尔函数与逻辑门',
    tag: '离散数学',
    level: '进阶',
    essence: '布尔函数把 0/1 向量映到 0/1，可用与或非表示，也可化为极小项之和，是数字电路的理论模型。',
    definition: 'n 元布尔函数是 $\\{0,1\\}^n\\to\\{0,1\\}$ 的映射；每个函数有唯一的析取范式。',
    whenToUse: ['电路设计', '逻辑化简', '可满足性'],
    theorems: [
      { name: '范式存在', statement: '每个布尔函数有析取范式。' },
      { name: '函数个数', statement: 'n 元布尔函数共 $2^{2^n}$ 个。' },
    ],
    steps: [
      { title: '写真值表', body: '所有输入组合。' },
      { title: '取真行', body: '输出为 1 的行。' },
      { title: '写极小项', body: '每行一个合取。' },
      { title: '取或', body: '析取范式。' },
      { title: '化简', body: '卡诺图或代数。' },
    ],
    pitfalls: ['极小项变量取反写错', '忘记 $2^{2^n}$ 计数', '化简破坏等价'],
    example: { problem: '二元布尔函数共有几个？', walkthrough: ['$2^{2^2}=16$。'], result: '16' },
    moreExamples: [{ problem: '析取范式怎么构造？', walkthrough: ['真行对应的极小项取或。'], result: '极小项之和' }],
  },

  {
    id: 'limits-colimits',
    title: '极限与余极限',
    tag: '范畴论',
    level: '竞赛',
    essence: '极限统一了积、拉回、等化子等构造：它是到图的锥的泛性质，余极限是反向版本。',
    definition: '图 D 的极限是锥（对象到图）中泛的；余极限是余锥中最泛的。',
    whenToUse: ['统一构造', '证明存在', '计算'],
    theorems: [
      { name: '极限由积与等化子构造', statement: '有积与等化子则有所有有限极限。' },
      { name: '右伴随保极限', statement: '右伴随函子保持极限。' },
    ],
    steps: [
      { title: '画图', body: '指标范畴 D。' },
      { title: '写锥', body: '对象与态射。' },
      { title: '找泛锥', body: '唯一分解。' },
      { title: '得极限', body: '具体对象。' },
      { title: '对偶得余极限', body: '箭头反向。' },
    ],
    pitfalls: ['把极限当图的像', '忽略泛性质', '方向搞反（极限 vs 余极限）'],
    example: { problem: '集合范畴的积是什么极限？', walkthrough: ['离散图的极限。'], result: '笛卡尔积' },
    moreExamples: [{ problem: '余积在集合范畴是什么？', walkthrough: ['不交并。'], result: '不交并' }],
  },
  {
    id: 'adjoint-functors',
    title: '伴随函子',
    tag: '范畴论',
    level: '竞赛',
    essence: '伴随是最重要的范畴论概念：左伴随自由、右伴随遗忘，它们由 Hom 集自然同构刻画。',
    definition: 'F ⊣ G 指存在自然同构 $\\mathrm{Hom}(F(A),B)\\cong\\mathrm{Hom}(A,G(B))$。',
    whenToUse: ['自由构造', '遗忘函子', '统一对偶'],
    theorems: [
      { name: '伴随的三角恒等式', statement: '单位与余单位满足三角等式。' },
      { name: '左伴随保余极限', statement: '左伴随保持余极限。' },
    ],
    steps: [
      { title: '写两个范畴', body: 'C 与 D。' },
      { title: '给函子对', body: 'F 与 G。' },
      { title: '写 Hom 同构', body: '自然同构。' },
      { title: '验自然性', body: '方形交换。' },
      { title: '用性质', body: '保极限或余极限。' },
    ],
    pitfalls: ['方向搞反（左/右）', '忽略自然性', '把伴随当同构'],
    example: { problem: '自由群函子是哪个方向的伴随？', walkthrough: ['左伴随于遗忘函子。'], result: '左伴随' },
    moreExamples: [{ problem: '右伴随保持什么？', walkthrough: ['极限。'], result: '极限' }],
  },
  {
    id: 'yoneda-lemma',
    title: '米田引理',
    tag: '范畴论',
    level: '竞赛',
    essence: '米田引理说对象由它在所有对象上的 Hom 函子完全决定：「你是由你与他人的关系定义的」。',
    definition: '自然变换 $\\mathrm{Hom}(A,-)\\Rightarrow F$ 与 $F(A)$ 的元素一一对应。',
    whenToUse: ['表示函子', '证明等价', '构造自然变换'],
    theorems: [
      { name: '米田引理', statement: 'Hom 函子的自然变换由像点决定。', formula: '\\mathrm{Nat}(\\mathrm{Hom}(A,-),F)\\cong F(A)' },
      { name: '米田嵌入', statement: '米田嵌入是全忠实函子。' },
    ],
    steps: [
      { title: '取对象 A', body: '与函子 F。' },
      { title: '看 Hom 函子', body: '$\\mathrm{Hom}(A,-)$。' },
      { title: '给自然变换', body: '由 $F(A)$ 元素决定。' },
      { title: '验唯一', body: '自然性强制。' },
      { title: '用嵌入', body: '得全忠实。' },
    ],
    pitfalls: ['把逆变性搞反', '忽略自然性', '混淆引理与嵌入'],
    example: { problem: '米田引理把自然变换对应到什么？', walkthrough: ['$F(A)$ 的元素。'], result: 'F(A) 的元素' },
    moreExamples: [{ problem: '米田嵌入的性质？', walkthrough: ['全忠实。'], result: '全忠实' }],
  },
  {
    id: 'monads',
    title: '单子与代数',
    tag: '范畴论',
    level: '竞赛',
    essence: '单子是自函子加单位与乘法，满足结合律；它刻画代数结构与程序中的副作用（如 Maybe、List）。',
    definition: '单子是自函子 T 配自然变换 η: Id→T 与 μ: T²→T，满足结合与单位律。',
    whenToUse: ['代数结构', '函数式编程', '对偶于伴随'],
    theorems: [
      { name: '伴随给出单子', statement: '每对伴随产生一个单子。' },
      { name: '单子代数', statement: '单子代数范畴与伴随的 Eilenberg-Moore 构造对应。' },
    ],
    steps: [
      { title: '取自函子', body: 'T: C→C。' },
      { title: '给单位', body: '$\\eta$。' },
      { title: '给乘法', body: '$\\mu$。' },
      { title: '验律', body: '结合与单位。' },
      { title: '用代数', body: 'Eilenberg-Moore。' },
    ],
    pitfalls: ['把单子当函子', '忽略三条律', '混淆单子与伴随'],
    example: { problem: 'List 单子的乘法是什么？', walkthrough: ['拼接（flatten）。'], result: '拼接' },
    moreExamples: [{ problem: '单子来自什么？', walkthrough: ['伴随。'], result: '伴随' }],
  },
  {
    id: 'cartesian-closed',
    title: '笛卡尔闭范畴与柯里化',
    tag: '范畴论',
    level: '竞赛',
    essence: '笛卡尔闭范畴有积与指数对象，把「多变量映射」与「返回函数的映射」等同，这正是柯里化与 λ 演算的语义。',
    definition: '笛卡尔闭范畴有有限积且每个函子 $(-)\\times A$ 有右伴随 $(-)^A$。',
    whenToUse: ['λ 演算语义', '函数式编程', '拓扑斯'],
    theorems: [
      { name: '指数伴随', statement: '$\\mathrm{Hom}(X\\times A,Y)\\cong\\mathrm{Hom}(X,Y^A)$。' },
      { name: '集合范畴是 CCC', statement: '集合与函数构成笛卡尔闭范畴。' },
    ],
    steps: [
      { title: '验有限积', body: '有终对象与积。' },
      { title: '找指数对象', body: '$Y^A$。' },
      { title: '写求值映射', body: '$\\mathrm{eval}$。' },
      { title: '验伴随', body: '柯里化同构。' },
      { title: '用语义', body: 'λ 演算。' },
    ],
    pitfalls: ['把指数当幂集', '忽略有限积前提', '柯里化方向反'],
    example: { problem: '集合范畴中 $Y^A$ 是什么？', walkthrough: ['函数集。'], result: '从 A 到 Y 的函数集' },
    moreExamples: [{ problem: '柯里化对应什么同构？', walkthrough: ['指数伴随。'], result: 'Hom 同构' }],
  },
  {
    id: 'equivalences',
    title: '范畴等价与伴随等价',
    tag: '范畴论',
    level: '竞赛',
    essence: '范畴等价比同构更实用：只需函子往返与恒等自然同构，不必严格相等。',
    definition: '等价指存在 F、G 使 GF ≅ Id 与 FG ≅ Id（自然同构）。',
    whenToUse: ['比较范畴', '避免严格同构', '构造对偶'],
    theorems: [
      { name: '等价判据', statement: '全忠实且本质满即等价。' },
      { name: '伴随等价', statement: '单位与余单位都是同构时伴随是等价。' },
    ],
    steps: [
      { title: '给函子对', body: 'F 与 G。' },
      { title: '验全忠实', body: 'Hom 双射。' },
      { title: '验本质满', body: '每个对象同构于像。' },
      { title: '得等价', body: '或给自然同构。' },
      { title: '用性质', body: '保持不变量。' },
    ],
    pitfalls: ['把等价当同构', '只验一个方向', '忽略本质满'],
    example: { problem: '等价需要严格相等吗？', walkthrough: ['只需自然同构。'], result: '不需要' },
    moreExamples: [{ problem: '等价判据？', walkthrough: ['全忠实 + 本质满。'], result: '全忠实本质满' }],
  },

  {
    id: 'sample-space-events',
    title: '样本空间与事件运算',
    tag: '概率论',
    level: '基础',
    essence: '样本空间是全部结果，事件是子集；事件的并与交对应「或」与「且」，概率是满足三条公理的集函数。',
    definition: '样本空间 Ω 是全部可能结果；事件是 Ω 的子集；概率 P 满足非负、归一、可列可加。',
    whenToUse: ['建模随机试验', '化简事件', '用加法公式'],
    theorems: [
      { name: '加法公式', statement: '并的概率等于和减交。', formula: 'P(A\\cup B)=P(A)+P(B)-P(AB)' },
      { name: '对立事件', statement: 'P(Aᶜ)=1−P(A)。' },
    ],
    steps: [
      { title: '定样本空间', body: '列出全部结果。' },
      { title: '写事件', body: '表示为子集。' },
      { title: '做运算', body: '并交补。' },
      { title: '用公式', body: '加法或对立。' },
      { title: '算概率', body: '计数或积分。' },
    ],
    pitfalls: ['把事件当结果', '加法公式忘记减交', '忽略可列可加前提'],
    example: { problem: 'P(A)=0.5、P(B)=0.4、P(AB)=0.2，求 P(A∪B)。', walkthrough: ['0.5+0.4−0.2。'], result: '0.7' },
    moreExamples: [{ problem: '对立事件公式？', walkthrough: ['和为 1。'], result: 'P(Aᶜ)=1−P(A)' }],
  },
  {
    id: 'independence-events',
    title: '事件的独立性',
    tag: '概率论',
    level: '进阶',
    essence: '独立指 P(AB)=P(A)P(B)，与互斥完全不同：互斥是不能同时发生，独立是互不影响。',
    definition: '两事件独立指乘积概率等于概率之积；多个事件独立要求所有子集的乘积关系都成立。',
    whenToUse: ['简化计算', '判断模型', '重复试验'],
    theorems: [
      { name: '独立判据', statement: '$P(AB)=P(A)P(B)$。' },
      { name: '多个独立', statement: '任意子集都满足乘积。' },
    ],
    steps: [
      { title: '算 P(A)、P(B)', body: '各自概率。' },
      { title: '算 P(AB)', body: '交的概率。' },
      { title: '比较', body: '是否等于乘积。' },
      { title: '判独立', body: '相等即独立。' },
      { title: '推广', body: '多个事件用子集验证。' },
    ],
    pitfalls: ['把独立当互斥', '只验两两不验全体', '零概率事件的特殊情形'],
    example: { problem: '互斥事件独立吗？', walkthrough: ['一般 P(AB)=0≠P(A)P(B)。'], result: '一般不独立' },
    moreExamples: [{ problem: '三事件独立要验几个等式？', walkthrough: ['两两三个加整体一个。'], result: '4 个' }],
  },
  {
    id: 'conditional-distribution',
    title: '条件分布与全概率',
    tag: '概率论',
    level: '进阶',
    essence: '条件分布在给定部分信息后重新归一，全概率公式按原因分解，贝叶斯公式反向更新。',
    definition: '条件密度 $f(x|y)=f(x,y)/f_Y(y)$；全概率把事件按划分求和。',
    whenToUse: ['分层计算', '贝叶斯更新', '混合模型'],
    theorems: [
      { name: '全概率公式', statement: '按划分求和。', formula: 'P(A)=\\sum P(A|B_i)P(B_i)' },
      { name: '条件期望', statement: 'E[X]=E[E[X|Y]]（重期望）。' },
    ],
    steps: [
      { title: '找划分', body: '按原因分组。' },
      { title: '算条件概率', body: '各情形。' },
      { title: '加权求和', body: '全概率。' },
      { title: '反向更新', body: '贝叶斯。' },
      { title: '得条件分布', body: '联合除边缘。' },
    ],
    pitfalls: ['划分不互斥', '忘记权重', '把条件密度当联合密度'],
    example: { problem: '重期望公式是什么？', walkthrough: ['外期望内条件。'], result: 'E[X]=E[E[X|Y]]' },
    moreExamples: [{ problem: '条件密度公式？', walkthrough: ['联合除边缘。'], result: 'f(x,y)/f_Y(y)' }],
  },
  {
    id: 'chebyshev-inequality',
    title: '切比雪夫不等式',
    tag: '概率论',
    level: '进阶',
    essence: '切比雪夫不等式用方差控制偏离均值的概率，不需要知道分布，是大数定律证明的关键。',
    definition: '$P(|X-\\mu|\\ge\\varepsilon)\\le\\sigma^2/\\varepsilon^2$。',
    whenToUse: ['估概率界', '证明大数定律', '未知分布'],
    theorems: [
      { name: '切比雪夫', statement: '偏离概率被方差控制。', formula: 'P(|X-\\mu|\\ge\\varepsilon)\\le\\frac{\\sigma^2}{\\varepsilon^2}' },
      { name: '推论', statement: '$k$ 倍标准差外概率不超过 $1/k^2$。' },
    ],
    steps: [
      { title: '算均值方差', body: '$\\mu,\\sigma^2$。' },
      { title: '定阈值', body: '$\\varepsilon$。' },
      { title: '代入', body: '得上界。' },
      { title: '比较', body: '与实际分布对比。' },
      { title: '用于大数', body: '取 $\\varepsilon$ 收敛。' },
    ],
    pitfalls: ['把界当精确值', '方向搞反', '方差未知仍硬套'],
    example: { problem: '$k=2$ 时界是多少？', walkthrough: ['$1/k^2$。'], result: '1/4' },
    moreExamples: [{ problem: '切比雪夫需要什么信息？', walkthrough: ['只需均值方差。'], result: '均值与方差' }],
  },
  {
    id: 'moment-generating',
    title: '矩母函数与特征函数',
    tag: '概率论',
    level: '竞赛',
    essence: '矩母函数把分布变成函数，求导得各阶矩；特征函数总存在，是证明中心极限定理的工具。',
    definition: '矩母 $M(t)=E[e^{tX}]$；特征函数 $\\varphi(t)=E[e^{itX}]$，总存在且唯一确定分布。',
    whenToUse: ['求矩', '判分布', '极限定理'],
    theorems: [
      { name: '矩生成', statement: '在 0 处的 k 阶导数给出 k 阶矩。', formula: 'M^{(k)}(0)=E[X^k]' },
      { name: '唯一性', statement: '特征函数唯一确定分布。' },
    ],
    steps: [
      { title: '写定义', body: '期望 $e^{tX}$。' },
      { title: '求积分', body: '得显式函数。' },
      { title: '求导', body: '得矩。' },
      { title: '用唯一性', body: '识别分布。' },
      { title: '取极限', body: 'CLT。' },
    ],
    pitfalls: ['矩母不存在（重尾）', '忘记在 0 处求导', '混淆矩母与特征函数'],
    example: { problem: '特征函数与矩母的区别？', walkthrough: ['$e^{itX}$ vs $e^{tX}$。'], result: '虚指数' },
    moreExamples: [{ problem: '特征函数何时总存在？', walkthrough: ['对所有分布。'], result: '总存在' }],
  },
  {
    id: 'order-statistics',
    title: '次序统计量',
    tag: '概率论',
    level: '竞赛',
    essence: '次序统计量把样本排序，最大值最小值的分布由分布函数直接给出，是极值统计的入口。',
    definition: '第 k 次序统计量 $X_{(k)}$ 是样本排序后的第 k 个；最大值与最小值的分布由 $F^n$ 给出。',
    whenToUse: ['极值分析', '可靠性', '分位数'],
    theorems: [
      { name: '最大值分布', statement: '$F_{max}(x)=F(x)^n$。', formula: 'F_{\\max}=F^n' },
      { name: '最小值分布', statement: '$1-(1-F)^n$。' },
    ],
    steps: [
      { title: '排序样本', body: '得次序统计量。' },
      { title: '写分布函数', body: '用 $F$。' },
      { title: '求密度', body: '求导。' },
      { title: '算期望', body: '积分。' },
      { title: '用极值', body: '可靠性等。' },
    ],
    pitfalls: ['把次序统计量当独立', '分布函数幂次搞反', '离散情形忽略跳变'],
    example: { problem: '最大值的分布函数？', walkthrough: ['全部 ≤ x。'], result: 'F(x)^n' },
    moreExamples: [{ problem: '最小值的分布函数？', walkthrough: ['对立事件。'], result: '1-(1-F)^n' }],
  },

  {
    id: 'sufficiency',
    title: '充分统计量',
    tag: '数理统计',
    level: '进阶',
    essence: '充分统计量包含样本中关于参数的全部信息，给定它之后样本分布与参数无关；因子分解定理给出判据。',
    definition: '统计量 T 充分指给定 T 后样本的条件分布不依赖参数；等价于密度可分解为 $g(T,\\theta)h(x)$。',
    whenToUse: ['压缩数据', '构造估计', '找最优估计'],
    theorems: [
      { name: '因子分解', statement: '密度分解则充分。', formula: 'f(x;\\theta)=g(T(x),\\theta)h(x)' },
      { name: 'Rao-Blackwell', statement: '对充分统计量取条件期望改进估计。' },
    ],
    steps: [
      { title: '写联合密度', body: '样本密度。' },
      { title: '尝试分解', body: '分离参数与数据。' },
      { title: '识别 T', body: '参数部分只依赖 T。' },
      { title: '验证', body: '因子分解定理。' },
      { title: '改进估计', body: 'Rao-Blackwell。' },
    ],
    pitfalls: ['把任意统计量当充分', '分解时 h 含参数', '忽略最小充分性'],
    example: { problem: '正态样本中哪个统计量充分？', walkthrough: ['样本均值与方差联合。'], result: '样本均值与样本方差' },
    moreExamples: [{ problem: 'Rao-Blackwell 做什么？', walkthrough: ['条件期望降方差。'], result: '改进估计' }],
  },
  {
    id: 'umvue',
    title: '无偏估计与一致最小方差',
    tag: '数理统计',
    level: '竞赛',
    essence: '无偏估计期望等于参数；在所有无偏估计中方差最小者称 UMVUE，通常由充分完备统计量构造。',
    definition: '无偏：$E[\\hat\\theta]=\\theta$；UMVUE 是方差一致最小的无偏估计。',
    whenToUse: ['评价估计', '构造最优', '比较方法'],
    theorems: [
      { name: 'Lehmann-Scheffé', statement: '完备充分统计量的函数是 UMVUE。' },
      { name: 'Cramér-Rao 下界', statement: '方差有下界。' },
    ],
    steps: [
      { title: '验无偏', body: '算期望。' },
      { title: '找充分完备', body: '统计量。' },
      { title: '构造函数', body: '得到无偏。' },
      { title: '用定理', body: 'Lehmann-Scheffé。' },
      { title: '比较方差', body: '确认最优。' },
    ],
    pitfalls: ['把有偏当无偏', '忽略完备性', '方差下界当可达'],
    example: { problem: '样本均值是总体均值的 UMVUE 吗？', walkthrough: ['正态情形是。'], result: '是（正态）' },
    moreExamples: [{ problem: 'Lehmann-Scheffé 的前提？', walkthrough: ['完备充分统计量。'], result: '完备充分' }],
  },
  {
    id: 'cramer-rao',
    title: '克拉美－拉奥下界',
    tag: '数理统计',
    level: '竞赛',
    essence: 'C-R 下界用 Fisher 信息给出无偏估计方差的下限，达到下界的估计称有效估计。',
    definition: '$\\mathrm{Var}(\\hat\\theta)\\ge 1/(nI(\\theta))$，其中 $I$ 为 Fisher 信息。',
    whenToUse: ['评价效率', '判断最优', '设计实验'],
    theorems: [
      { name: 'C-R 不等式', statement: '方差下界由 Fisher 信息给出。', formula: '\\mathrm{Var}\\ge\\frac{1}{nI(\\theta)}' },
      { name: '可达条件', statement: '指数族常见达到下界。' },
    ],
    steps: [
      { title: '写对数似然', body: '$\\ell(\\theta)$。' },
      { title: '算 Fisher 信息', body: '二阶导期望。' },
      { title: '取下界', body: '$1/(nI)$。' },
      { title: '比较估计', body: '方差是否达到。' },
      { title: '判有效', body: '达到即有效。' },
    ],
    pitfalls: ['忘记样本量 n', '把 Fisher 信息当方差', '有偏估计不适用'],
    example: { problem: 'C-R 下界由什么决定？', walkthrough: ['Fisher 信息。'], result: 'Fisher 信息' },
    moreExamples: [{ problem: '达到下界的估计叫什么？', walkthrough: ['有效估计。'], result: '有效' }],
  },
  {
    id: 'method-of-moments',
    title: '矩估计法',
    tag: '数理统计',
    level: '进阶',
    essence: '矩估计用样本矩替换总体矩解出参数，计算简单但可能无偏性差，是 MLE 之外最常用的方法。',
    definition: '令样本矩等于总体矩，解方程组得参数估计。',
    whenToUse: ['快速估计', '初值', '教学'],
    theorems: [
      { name: '相合性', statement: '矩估计通常相合。' },
      { name: '与 MLE 比较', statement: 'MLE 渐近有效但计算复杂。' },
    ],
    steps: [
      { title: '写总体矩', body: '关于参数的表达式。' },
      { title: '写样本矩', body: '从数据算。' },
      { title: '令相等', body: '得方程。' },
      { title: '解参数', body: '得估计量。' },
      { title: '看性质', body: '无偏或相合。' },
    ],
    pitfalls: ['矩不够用', '解不唯一', '把矩估计当 MLE'],
    example: { problem: '指数分布的矩估计？', walkthrough: ['均值等于 1/λ。'], result: '1/\\bar X' },
    moreExamples: [{ problem: '矩估计的优点？', walkthrough: ['计算简单。'], result: '简单' }],
  },
  {
    id: 'likelihood-ratio-test',
    title: '似然比检验',
    tag: '数理统计',
    level: '竞赛',
    essence: '似然比检验比较约束与无约束的最大似然，统计量渐近卡方，是最通用的检验构造法。',
    definition: '似然比 $\\Lambda=\\sup_{\\theta\\in\\Theta_0}L/\\sup_{\\theta\\in\\Theta}L$，$-2\\log\\Lambda$ 渐近卡方。',
    whenToUse: ['构造检验', '比较模型', '渐近推断'],
    theorems: [
      { name: '威尔克斯定理', statement: '$-2\\log\\Lambda$ 渐近 $\\chi^2$。' },
      { name: '与 UMP 关系', statement: '简单假设下与最优势检验一致。' },
    ],
    steps: [
      { title: '写假设', body: '约束与无约束。' },
      { title: '求两个 MLE', body: '约束下与一般。' },
      { title: '算比值', body: '$\\Lambda$。' },
      { title: '取对数', body: '得统计量。' },
      { title: '查卡方', body: '自由度差。' },
    ],
    pitfalls: ['自由度算错', '小样本用渐近', '忘记嵌套模型'],
    example: { problem: '威尔克斯定理说什么？', walkthrough: ['似然比渐近卡方。'], result: '渐近 χ²' },
    moreExamples: [{ problem: '自由度怎么定？', walkthrough: ['参数个数之差。'], result: '约束个数' }],
  },
  {
    id: 'power-function',
    title: '功效函数与两类错误',
    tag: '数理统计',
    level: '进阶',
    essence: '功效函数是拒绝原假设的概率随真参数变化，第一类错误由显著性水平控制，第二类由功效衡量。',
    definition: '功效函数 $\\beta(\\theta)=P_\\theta(\\text{拒绝}H_0)$；在 $H_0$ 上即第一类错误，在 $H_1$ 上是功效。',
    whenToUse: ['评价检验', '样本量设计', '选择临界值'],
    theorems: [
      { name: '功效与样本量', statement: '样本量增大功效提高。' },
      { name: 'Neyman-Pearson', statement: '简单假设下似然比检验最优势。' },
    ],
    steps: [
      { title: '定拒绝域', body: '临界值。' },
      { title: '算功效', body: '真参数下拒绝概率。' },
      { title: '画曲线', body: '随参数变化。' },
      { title: '看水平', body: '$H_0$ 上上界。' },
      { title: '调样本量', body: '达到目标功效。' },
    ],
    pitfalls: ['把功效当水平', '忽略样本量影响', '双侧检验方向搞错'],
    example: { problem: '功效函数在 $H_1$ 上表示什么？', walkthrough: ['正确拒绝概率。'], result: '功效' },
    moreExamples: [{ problem: '第一类错误由什么控制？', walkthrough: ['显著性水平。'], result: 'α' }],
  },

  {
    id: 'renewal-process',
    title: '更新过程',
    tag: '随机过程',
    level: '竞赛',
    essence: '更新过程把泊松过程的指数间隔换成任意分布，更新函数与更新定理给出长期平均率。',
    definition: '更新过程由独立同分布的非负间隔 $X_i$ 累加而成；更新函数 $m(t)=E[N(t)]$。',
    whenToUse: ['可靠性', '替换策略', '长期平均'],
    theorems: [
      { name: '更新方程', statement: '$m(t)=F(t)+\\int m(t-x)dF(x)$。' },
      { name: '更新定理', statement: '$m(t)/t\\to1/\\mu$。' },
    ],
    steps: [
      { title: '定间隔分布', body: '一般分布。' },
      { title: '写更新函数', body: '期望次数。' },
      { title: '用更新方程', body: '卷积形式。' },
      { title: '取长期极限', body: '$1/\\mu$。' },
      { title: '应用', body: '替换或可靠性。' },
    ],
    pitfalls: ['把更新过程当泊松（间隔非指数）', '忘记长期极限条件', '混淆更新函数与计数'],
    example: { problem: '更新过程的长期平均率？', walkthrough: ['更新定理。'], result: '1/\\mu' },
    moreExamples: [{ problem: '更新方程的形式？', walkthrough: ['卷积方程。'], result: '卷积' }],
  },
  {
    id: 'ctmc',
    title: '连续时间马尔可夫链',
    tag: '随机过程',
    level: '竞赛',
    essence: '连续时间马尔可夫链的逗留时间服从指数分布，转移由速率矩阵生成，长期行为由平稳分布刻画。',
    definition: '连续时间马尔可夫链由转移速率矩阵 Q 生成，满足 $P(t)=e^{Qt}$。',
    whenToUse: ['排队系统', '生灭过程', '可靠性'],
    theorems: [
      { name: '指数逗留', statement: '在每个状态的逗留时间指数分布。' },
      { name: '平稳分布', statement: '$\\pi Q=0$。' },
    ],
    steps: [
      { title: '写状态', body: '离散状态。' },
      { title: '写速率', body: 'Q 矩阵。' },
      { title: '求转移概率', body: '矩阵指数。' },
      { title: '求平稳', body: '解 $\\pi Q=0$。' },
      { title: '得长期', body: '平稳分布。' },
    ],
    pitfalls: ['把 Q 当转移概率矩阵（行和为 0）', '忘记指数逗留', '平稳分布归一化'],
    example: { problem: '连续时间链的平稳分布满足？', walkthrough: ['$\\pi Q=0$。'], result: '\\pi Q=0' },
    moreExamples: [{ problem: '转移概率矩阵的表达式？', walkthrough: ['矩阵指数。'], result: 'e^{Qt}' }],
  },
  {
    id: 'brownian-properties',
    title: '布朗运动的性质',
    tag: '随机过程',
    level: '竞赛',
    essence: '布朗运动连续但处处不可导、增量独立平稳且正态，是随机分析的基本对象。',
    definition: '标准布朗运动 $B(t)$ 满足 $B(0)=0$、独立平稳增量、$B(t)-B(s)\\sim N(0,t-s)$、连续路径。',
    whenToUse: ['随机微积分', '金融建模', '扩散极限'],
    theorems: [
      { name: '二次变差', statement: '布朗运动的二次变差等于时间。', formula: '[B]_t=t' },
      { name: '不可导', statement: '轨道几乎处处不可导。' },
    ],
    steps: [
      { title: '验增量', body: '独立平稳正态。' },
      { title: '看路径', body: '连续不可导。' },
      { title: '算变差', body: '二次变差为 t。' },
      { title: '构造积分', body: '伊藤积分。' },
      { title: '应用', body: '扩散与金融。' },
    ],
    pitfalls: ['把布朗运动当可导', '忽略二次变差', '混淆算术与几何布朗'],
    example: { problem: '布朗运动的二次变差？', walkthrough: ['等于时间。'], result: 't' },
    moreExamples: [{ problem: '布朗运动路径可导吗？', walkthrough: ['处处不可导。'], result: '不可导' }],
  },
  {
    id: 'queueing-m-m-1',
    title: '排队论与 M/M/1',
    tag: '随机过程',
    level: '竞赛',
    essence: 'M/M/1 排队由泊松到达与指数服务描述，利用率小于 1 时存在平稳分布，队长服从几何分布。',
    definition: 'M/M/1 指泊松到达率 λ、指数服务率 μ、单服务台；利用率 $\\rho=\\lambda/\\mu$。',
    whenToUse: ['系统容量', '等待时间', '服务设计'],
    theorems: [
      { name: '平稳队长', statement: '$P(N=n)=(1-\\rho)\\rho^n$。' },
      { name: '利特尔定律', statement: '$L=\\lambda W$。', formula: 'L=\\lambda W' },
    ],
    steps: [
      { title: '定参数', body: '$\\lambda,\\mu$。' },
      { title: '算利用率', body: '$\\rho$。' },
      { title: '验稳定', body: '$\\rho<1$。' },
      { title: '写分布', body: '几何分布。' },
      { title: '用利特尔', body: '求等待时间。' },
    ],
    pitfalls: ['忽略稳定条件 $\\rho<1$', '把队长当时间', '混淆 M/M/1 与 M/M/c'],
    example: { problem: 'M/M/1 稳定的条件？', walkthrough: ['到达小于服务。'], result: '\\rho<1' },
    moreExamples: [{ problem: '利特尔定律说什么？', walkthrough: ['队长=到达率×等待时间。'], result: 'L=\\lambda W' }],
  },
  {
    id: 'branching-process',
    title: '分支过程与灭绝概率',
    tag: '随机过程',
    level: '竞赛',
    essence: '分支过程描述个体繁殖，灭绝概率是生成函数的最小不动点；平均后代数小于等于 1 时必灭绝。',
    definition: '高尔顿－沃森过程每个个体独立产生随机数量后代；灭绝概率 q 是最小非负解 $q=f(q)$。',
    whenToUse: ['种群模型', '疫情传播', '姓氏消亡'],
    theorems: [
      { name: '灭绝判据', statement: '平均后代 $\\mu\\le1$ 时必然灭绝。' },
      { name: '灭绝概率', statement: '最小不动点。' },
    ],
    steps: [
      { title: '写后代分布', body: '生成函数 $f$。' },
      { title: '算平均', body: '$\\mu=f\\prime(1)$。' },
      { title: '解不动点', body: '$q=f(q)$。' },
      { title: '取最小解', body: '灭绝概率。' },
      { title: '判临界', body: '$\\mu$ 与 1。' },
    ],
    pitfalls: ['把最大不动点当灭绝概率', '忽略独立同分布', '临界情形误判'],
    example: { problem: '$\\mu<1$ 时灭绝概率？', walkthrough: ['必然灭绝。'], result: '1' },
    moreExamples: [{ problem: '灭绝概率满足什么方程？', walkthrough: ['$q=f(q)$ 的最小解。'], result: '最小不动点' }],
  },
  {
    id: 'gamblers-ruin',
    title: '赌徒破产与吸收概率',
    tag: '随机过程',
    level: '进阶',
    essence: '简单随机游走在有界区间内的吸收概率由调和函数给出：公平游走线性，有偏游走指数。',
    definition: '赌徒破产问题：从 i 出发，每次 ±1，到达 0 或 N 停止；求先到 N 的概率。',
    whenToUse: ['吸收概率', '期权边界', '公平性分析'],
    theorems: [
      { name: '公平情形', statement: '$P_i=i/N$。', formula: 'P_i=\\frac{i}{N}' },
      { name: '有偏情形', statement: '指数形式。' },
    ],
    steps: [
      { title: '写递推', body: '$P_i=pP_{i+1}+qP_{i-1}$。' },
      { title: '解特征方程', body: '根。' },
      { title: '代边界', body: '$P_0=0,P_N=1$。' },
      { title: '得通解', body: '线性或指数。' },
      { title: '读结论', body: '吸收概率。' },
    ],
    pitfalls: ['边界条件代错', '公平与有偏混用', '忽略有限状态'],
    example: { problem: '公平游走从 i 出发先到 N 的概率？', walkthrough: ['线性。'], result: 'i/N' },
    moreExamples: [{ problem: '有偏游走的吸收概率形式？', walkthrough: ['指数。'], result: '指数' }],
  },

  {
    id: 'relative-entropy',
    title: '相对熵与互信息',
    tag: '信息论',
    level: '进阶',
    essence: '相对熵度量两个分布的差异，互信息度量两个变量共享的信息量，两者都非负且与熵互相联系。',
    definition: '相对熵 $D(p||q)=E_p\\log(p/q)$；互信息 $I(X;Y)=H(X)-H(X|Y)$。',
    whenToUse: ['度量差异', '信道分析', '机器学习'],
    theorems: [
      { name: '非负性', statement: '相对熵非负，等号当且仅当分布相同。', formula: 'D(p||q)\\ge0' },
      { name: '互信息恒等', statement: '$I(X;Y)=H(X)+H(Y)-H(X,Y)$。' },
    ],
    steps: [
      { title: '写分布', body: '联合与边缘。' },
      { title: '算熵', body: '各边缘熵。' },
      { title: '算互信息', body: '用恒等式。' },
      { title: '或算相对熵', body: '按定义求和。' },
      { title: '判关系', body: '非负性与等号。' },
    ],
    pitfalls: ['把互信息当相关系数', '相对熵不对称', '忽略对数的底'],
    example: { problem: '互信息的恒等式？', walkthrough: ['边缘和减联合。'], result: 'H(X)+H(Y)−H(X,Y)' },
    moreExamples: [{ problem: '相对熵对称吗？', walkthrough: ['不对称。'], result: '不对称' }],
  },
  {
    id: 'aep',
    title: '渐近均分性与典型集',
    tag: '信息论',
    level: '竞赛',
    essence: 'AEP 说长序列的概率几乎集中在典型集上，典型集大小约为 $2^{nH}$，这是压缩极限的来源。',
    definition: '典型集是样本熵接近真实熵的序列集合；AEP 断言其概率趋于 1 且大小约 $2^{nH}$。',
    whenToUse: ['证明压缩极限', '信道编码', '大偏差'],
    theorems: [
      { name: 'AEP', statement: '典型集概率趋于 1。' },
      { name: '典型集大小', statement: '$|A_\\epsilon^{(n)}|\\approx2^{nH}$。' },
    ],
    steps: [
      { title: '取 iid 序列', body: '长度 n。' },
      { title: '算经验熵', body: '−1/n log p。' },
      { title: '定典型集', body: '接近 H。' },
      { title: '估大小', body: '$2^{nH}$。' },
      { title: '得压缩极限', body: '熵率。' },
    ],
    pitfalls: ['把典型集当全部序列', '忽略 ε 邻域', '混淆熵率与熵'],
    example: { problem: '典型集的大小约是多少？', walkthrough: ['指数增长。'], result: '2^{nH}' },
    moreExamples: [{ problem: 'AEP 的结论？', walkthrough: ['典型集概率趋于 1。'], result: '概率→1' }],
  },
  {
    id: 'huffman-coding',
    title: '霍夫曼编码与克拉夫特不等式',
    tag: '信息论',
    level: '进阶',
    essence: '克拉夫特不等式刻画前缀码长度可行性，霍夫曼算法构造平均码长最小的前缀码。',
    definition: '前缀码要求无码字是另一码字前缀；克拉夫特：$\\sum 2^{-l_i}\\le1$。',
    whenToUse: ['无损压缩', '编码设计', '最优性判定'],
    theorems: [
      { name: '克拉夫特', statement: '长度满足不等式则可构造前缀码。', formula: '\\sum2^{-l_i}\\le1' },
      { name: '霍夫曼最优', statement: '平均码长最小。' },
    ],
    steps: [
      { title: '统计频率', body: '符号概率。' },
      { title: '建树', body: '每次合并最小两个。' },
      { title: '分配码字', body: '左 0 右 1。' },
      { title: '算平均长', body: '概率加权。' },
      { title: '比较熵', body: '接近但高于熵。' },
    ],
    pitfalls: ['把前缀码当任意码', '忘记克拉夫特检验', '平均长低于熵（不可能）'],
    example: { problem: '克拉夫特不等式说什么？', walkthrough: ['长度可行性。'], result: '\\sum2^{-l_i}\\le1' },
    moreExamples: [{ problem: '霍夫曼编码的最优性？', walkthrough: ['平均码长最小。'], result: '最优前缀码' }],
  },
  {
    id: 'differential-entropy',
    title: '微分熵',
    tag: '信息论',
    level: '竞赛',
    essence: '连续分布的微分熵是离散熵的极限，它可为负、不具平移不变性，但仍是高斯信道分析的工具。',
    definition: '微分熵 $h(X)=-\\int f\\log f$；与离散熵不同，它依赖尺度。',
    whenToUse: ['连续信道', '高斯分析', '最大熵原理'],
    theorems: [
      { name: '高斯最大熵', statement: '给定方差时高斯分布微分熵最大。', formula: 'h=\\frac12\\log(2\\pi e\\sigma^2)' },
      { name: '变换公式', statement: '线性变换加 $\\log|a|$。' },
    ],
    steps: [
      { title: '写密度', body: '$f(x)$。' },
      { title: '积分', body: '$-\\int f\\log f$。' },
      { title: '算高斯', body: '代入公式。' },
      { title: '用最大熵', body: '对比。' },
      { title: '应用', body: '容量公式。' },
    ],
    pitfalls: ['把微分熵当非负', '忘记尺度依赖', '混淆离散与连续'],
    example: { problem: '方差 σ² 时高斯微分熵？', walkthrough: ['标准公式。'], result: '\\frac12\\log(2\\pi e\\sigma^2)' },
    moreExamples: [{ problem: '微分熵可以为负吗？', walkthrough: ['可以（窄分布）。'], result: '可以' }],
  },
  {
    id: 'gaussian-channel',
    title: '高斯信道容量',
    tag: '信息论',
    level: '竞赛',
    essence: '加性高斯白噪声信道的容量是 $\\frac12\\log(1+SNR)$，它给出通信系统的理论上限。',
    definition: 'AWGN 信道 $Y=X+Z$，$Z\\sim N(0,N)$，功率约束 $E[X^2]\\le P$，容量 $C=\\frac12\\log(1+P/N)$。',
    whenToUse: ['通信上限', '功率分配', 'MIMO'],
    theorems: [
      { name: '容量公式', statement: '香农公式。', formula: 'C=\\frac12\\log(1+SNR)' },
      { name: '高斯最优', statement: '高斯输入达到容量。' },
    ],
    steps: [
      { title: '写信道', body: '$Y=X+Z$。' },
      { title: '定约束', body: '功率 P。' },
      { title: '算互信息', body: '用微分熵。' },
      { title: '取最大', body: '高斯输入。' },
      { title: '得容量', body: '香农公式。' },
    ],
    pitfalls: ['忘记 1/2 因子', '忽略功率约束', '把 SNR 当 dB'],
    example: { problem: 'SNR=3 时容量（bit）？', walkthrough: ['$\\frac12\\log_2 4=1$。'], result: '1 bit' },
    moreExamples: [{ problem: '达到容量的输入分布？', walkthrough: ['高斯。'], result: '高斯' }],
  },
  {
    id: 'rate-distortion',
    title: '率失真理论',
    tag: '信息论',
    level: '竞赛',
    essence: '有损压缩用率失真函数刻画「码率与失真」的权衡，它是量化与压缩的理论下界。',
    definition: '率失真函数 $R(D)=\\min I(X;\\hat X)$，在所有满足失真 ≤ D 的条件分布上取最小。',
    whenToUse: ['有损压缩', '量化设计', '码率分配'],
    theorems: [
      { name: '率失真下界', statement: '码率不低于 R(D)。' },
      { name: '高斯率失真', statement: '$R(D)=\\frac12\\log(\\sigma^2/D)$（D<σ²）。' },
    ],
    steps: [
      { title: '定失真度量', body: '如平方误差。' },
      { title: '定目标 D', body: '可接受失真。' },
      { title: '求最小互信息', body: '条件分布优化。' },
      { title: '得 R(D)', body: '函数形式。' },
      { title: '判可行性', body: '码率是否够。' },
    ],
    pitfalls: ['把 R(D) 当无损压缩率', '忘记 D 的上界', '失真度量选错'],
    example: { problem: '高斯的率失真函数？', walkthrough: ['对数形式。'], result: '\\frac12\\log(\\sigma^2/D)' },
    moreExamples: [{ problem: 'D 增大时 R(D) 如何变？', walkthrough: ['减小。'], result: '减小' }],
  },

  {
    id: 'backward-induction',
    title: '逆向归纳与扩展式博弈',
    tag: '博弈论',
    level: '进阶',
    essence: '扩展式博弈用树描述行动顺序，逆向归纳从末端往回求解，得到子博弈精炼均衡。',
    definition: '扩展式博弈由博弈树、参与者、信息集与收益组成；逆向归纳从叶子回溯选最优行动。',
    whenToUse: ['序贯决策', '威胁可信性', '求解均衡'],
    theorems: [
      { name: '逆向归纳', statement: '有限完美信息博弈有纯策略均衡。' },
      { name: '精炼', statement: '逆向归纳排除不可信威胁。' },
    ],
    steps: [
      { title: '画博弈树', body: '节点与行动。' },
      { title: '标末端收益', body: '叶子节点。' },
      { title: '从末端选优', body: '最后决策者最优。' },
      { title: '回溯', body: '替换为收益。' },
      { title: '得均衡路径', body: '子博弈精炼。' },
    ],
    pitfalls: ['从根往下推（不是逆向）', '忽略信息集', '把纳什当精炼'],
    example: { problem: '逆向归纳解决什么问题？', walkthrough: ['不可信威胁。'], result: '剔除不可信威胁' },
    moreExamples: [{ problem: '有限完美信息博弈一定有纯策略均衡吗？', walkthrough: ['逆向归纳保证。'], result: '一定' }],
  },
  {
    id: 'subgame-perfect',
    title: '子博弈精炼纳什均衡',
    tag: '博弈论',
    level: '竞赛',
    essence: '子博弈精炼要求在每一个子博弈上都构成纳什均衡，排除「空口威胁」式的均衡。',
    definition: '策略组合是子博弈精炼的，若它在原博弈与每个真子博弈上都构成纳什均衡。',
    whenToUse: ['筛选均衡', '分析威胁', '序贯博弈'],
    theorems: [
      { name: '与逆向归纳一致', statement: '完美信息下子博弈精炼即逆向归纳结果。' },
      { name: '存在性', statement: '有限博弈存在混合子博弈精炼均衡。' },
    ],
    steps: [
      { title: '列子博弈', body: '每个真子博弈。' },
      { title: '逐个子博弈求纳什', body: '分别求解。' },
      { title: '拼接策略', body: '全体一致。' },
      { title: '验整体', body: '原博弈也纳什。' },
      { title: '得 SPNE', body: '子博弈精炼。' },
    ],
    pitfalls: ['只验原博弈', '漏掉真子博弈', '混淆完美与完全信息'],
    example: { problem: 'SPNE 比纳什强在哪里？', walkthrough: ['每个子博弈都要纳什。'], result: '子博弈上也要均衡' },
    moreExamples: [{ problem: '完美信息下 SPNE 怎么求？', walkthrough: ['逆向归纳。'], result: '逆向归纳' }],
  },
  {
    id: 'repeated-games',
    title: '重复博弈与无名氏定理',
    tag: '博弈论',
    level: '竞赛',
    essence: '重复博弈让合作成为可能：只要贴现因子足够大，触发策略可以支撑合作，这就是无名氏定理。',
    definition: '重复博弈把阶段博弈重复进行；无名氏定理说足够耐心的参与者可达成任何可行个体理性收益。',
    whenToUse: ['合作机制', '长期关系', '惩罚策略'],
    theorems: [
      { name: '无名氏定理', statement: '贴现因子足够大时可支撑合作。', formula: '\\delta\\ge\\frac{T-R}{T-P}' },
      { name: '触发策略', statement: '偏离即永久惩罚。' },
    ],
    steps: [
      { title: '写阶段博弈', body: '收益矩阵。' },
      { title: '算贴现因子', body: '$\\delta$。' },
      { title: '设计策略', body: '触发或针锋相对。' },
      { title: '验不偏离', body: '比较长期收益。' },
      { title: '得合作条件', body: '$\\delta$ 下界。' },
    ],
    pitfalls: ['忽略贴现因子', '忘记惩罚可信性', '把有限次重复当无限'],
    example: { problem: '囚徒困境重复能合作吗？', walkthrough: ['贴现因子足够大时。'], result: '能（需足够耐心）' },
    moreExamples: [{ problem: '无名氏定理的条件？', walkthrough: ['贴现因子足够大。'], result: '足够耐心' }],
  },
  {
    id: 'bayesian-games',
    title: '不完全信息与贝叶斯博弈',
    tag: '博弈论',
    level: '竞赛',
    essence: '贝叶斯博弈用类型与先验刻画不完全信息，均衡是「类型依策略」，拍卖是典型应用。',
    definition: '贝叶斯博弈由参与者、类型空间、先验、策略与收益组成；贝叶斯纳什均衡要求每类型最优。',
    whenToUse: ['拍卖设计', '机制设计', '信号博弈'],
    theorems: [
      { name: '存在性', statement: '有限贝叶斯博弈存在混合均衡。' },
      { name: '收益等价', statement: '标准拍卖形式期望收益相同。' },
    ],
    steps: [
      { title: '定类型', body: '私有信息。' },
      { title: '给先验', body: '类型分布。' },
      { title: '写策略', body: '类型到行动。' },
      { title: '求最优', body: '给定信念。' },
      { title: '得 BNE', body: '贝叶斯纳什。' },
    ],
    pitfalls: ['把类型当行动', '忽略先验', '混淆完全与完美信息'],
    example: { problem: '贝叶斯纳什均衡的策略是什么形式？', walkthrough: ['类型到行动。'], result: '类型依策略' },
    moreExamples: [{ problem: '拍卖属于哪类博弈？', walkthrough: ['贝叶斯博弈。'], result: '不完全信息' }],
  },
  {
    id: 'core-solution',
    title: '合作博弈的核',
    tag: '博弈论',
    level: '竞赛',
    essence: '核是所有不被任何联盟推翻的分配集合，它可能为空；夏普利值给出唯一的公平分配。',
    definition: '分配 x 在核中，若对任意联盟 S 有 $\\sum_{i\\in S}x_i\\ge v(S)$。',
    whenToUse: ['收益分配', '稳定性分析', '成本分摊'],
    theorems: [
      { name: '核的刻画', statement: '核是满足联盟理性分配的集合。' },
      { name: '夏普利值', statement: '满足四条公理的唯一分配。' },
    ],
    steps: [
      { title: '写特征函数', body: '$v(S)$。' },
      { title: '列联盟', body: '所有子集。' },
      { title: '写不等式', body: '联盟理性。' },
      { title: '求交', body: '可行分配。' },
      { title: '判非空', body: '核是否存在。' },
    ],
    pitfalls: ['把核当夏普利值', '忘记有效性', '核为空仍硬找'],
    example: { problem: '核中的分配满足什么？', walkthrough: ['不被任何联盟推翻。'], result: '联盟理性' },
    moreExamples: [{ problem: '核一定非空吗？', walkthrough: ['不一定。'], result: '不一定' }],
  },
  {
    id: 'minimax-theorem',
    title: '极小极大定理与零和博弈',
    tag: '博弈论',
    level: '竞赛',
    essence: '零和博弈中极大极小等于极小极大，值存在且混合策略达到，这是线性规划对偶的博弈版本。',
    definition: '零和博弈收益和为零；极小极大定理说 $\\max_x\\min_y x^TAy=\\min_y\\max_x x^TAy$。',
    whenToUse: ['对抗决策', '线性规划对偶', '稳健策略'],
    theorems: [
      { name: '极小极大定理', statement: '混合策略下值存在。' },
      { name: '与 LP 对偶', statement: '求解可化为线性规划。' },
    ],
    steps: [
      { title: '写收益矩阵', body: '$A$。' },
      { title: '求行最大最小', body: '稳健策略。' },
      { title: '求列最小最大', body: '对手侧。' },
      { title: '取混合', body: '线性规划。' },
      { title: '得值', body: '博弈值。' },
    ],
    pitfalls: ['纯策略不存在值', '混淆最大最小顺序', '忘记零和前提'],
    example: { problem: '零和博弈的值何时存在？', walkthrough: ['混合策略下总存在。'], result: '混合策略下存在' },
    moreExamples: [{ problem: '极小极大定理与什么等价？', walkthrough: ['线性规划对偶。'], result: 'LP 对偶' }],
  },

  {
    id: 'ito-lemma',
    title: '伊藤引理与随机微分方程',
    tag: '金融数学',
    level: '竞赛',
    essence: '伊藤引理是随机微积分的链式法则，比经典版本多出二阶项，正是它让期权价格方程成立。',
    definition: '若 $dX=\\mu dt+\\sigma dB$，则 $df=(f_t+\\mu f_x+\\frac12\\sigma^2f_{xx})dt+\\sigma f_x dB$。',
    whenToUse: ['推导 BS 方程', '变换随机过程', '求解 SDE'],
    theorems: [
      { name: '伊藤引理', statement: '二阶修正的链式法则。', formula: 'df=(f_t+\\mu f_x+\\tfrac12\\sigma^2f_{xx})dt+\\sigma f_xdB' },
      { name: '几何布朗运动解', statement: '$S_t=S_0e^{(\\mu-\\sigma^2/2)t+\\sigma B_t}$。' },
    ],
    steps: [
      { title: '写 SDE', body: '漂移与扩散。' },
      { title: '取函数 f', body: '待变换量。' },
      { title: '算偏导', body: '$f_t,f_x,f_{xx}$。' },
      { title: '套伊藤', body: '含二阶项。' },
      { title: '得新 SDE', body: '化简。' },
    ],
    pitfalls: ['漏掉 $\\frac12\\sigma^2f_{xx}$ 项', '把伊藤当普通链式法则', '忽略二次变差'],
    example: { problem: '$f=\\log S$ 时伊藤给出什么？', walkthrough: ['对数收益含 $-\\sigma^2/2$。'], result: '漂移修正' },
    moreExamples: [{ problem: '几何布朗运动的解？', walkthrough: ['指数形式。'], result: 'S_0e^{(\\mu-\\sigma^2/2)t+\\sigma B_t}' }],
  },
  {
    id: 'risk-neutral-measure',
    title: '风险中性测度与等价鞅测度',
    tag: '金融数学',
    level: '竞赛',
    essence: '风险中性测度让贴现资产成为鞅，期权价格等于该测度下的期望贴现收益。',
    definition: '等价鞅测度 Q 与 P 等价且使 $e^{-rt}S_t$ 为鞅；期权价格 $V_0=E_Q[e^{-rT}\\Phi(S_T)]$。',
    whenToUse: ['期权定价', '测度变换', '无套利'],
    theorems: [
      { name: '风险中性定价', statement: '价格等于 Q 下贴现期望。', formula: 'V_0=E_Q[e^{-rT}\\Phi(S_T)]' },
      { name: 'Girsanov', statement: '测度变换改变漂移。' },
    ],
    steps: [
      { title: '写真实测度', body: 'P 下漂移 μ。' },
      { title: '换测度', body: 'Girsanov 改漂移为 r。' },
      { title: '验证鞅性', body: '贴现价格鞅。' },
      { title: '算期望', body: '贴现收益。' },
      { title: '得价格', body: '无套利价格。' },
    ],
    pitfalls: ['把真实期望当定价', '忘记贴现', '忽略测度等价性'],
    example: { problem: '风险中性下标的漂移是什么？', walkthrough: ['等于无风险利率。'], result: 'r' },
    moreExamples: [{ problem: '期权价格的期望公式？', walkthrough: ['Q 下贴现期望。'], result: 'E_Q[e^{-rT}\\Phi]' }],
  },
  {
    id: 'black-scholes-pde',
    title: 'Black-Scholes 偏微分方程',
    tag: '金融数学',
    level: '竞赛',
    essence: '无套利复制推出 BS 方程：期权价格满足抛物型 PDE，其解给出闭式定价公式。',
    definition: 'BS 方程 $V_t+\\frac12\\sigma^2S^2V_{SS}+rSV_S-rV=0$，终端条件为收益函数。',
    whenToUse: ['期权定价', '希腊字母', '数值解'],
    theorems: [
      { name: 'BS 方程', statement: '由 Delta 对冲推出。', formula: 'V_t+\\tfrac12\\sigma^2S^2V_{SS}+rSV_S-rV=0' },
      { name: '闭式解', statement: '欧式看涨为 $SN(d_1)-Ke^{-rT}N(d_2)$。' },
    ],
    steps: [
      { title: '设价格函数', body: '$V(S,t)$。' },
      { title: '用伊藤展开', body: '$dV$。' },
      { title: '构造无风险组合', body: '$\\Pi=V-\\Delta S$。' },
      { title: '令漂移为 r', body: '消去风险。' },
      { title: '得方程', body: '加终端条件。' },
    ],
    pitfalls: ['忘记 $-rV$ 项', '终端条件写错', '把 PDE 当 ODE'],
    example: { problem: 'BS 方程中的二阶项系数？', walkthrough: ['$\\frac12\\sigma^2S^2$。'], result: '\\frac12\\sigma^2S^2' },
    moreExamples: [{ problem: '欧式看涨的闭式解？', walkthrough: ['$SN(d_1)-Ke^{-rT}N(d_2)$。'], result: 'BS 公式' }],
  },
  {
    id: 'greeks',
    title: '希腊字母与风险敏感度',
    tag: '金融数学',
    level: '进阶',
    essence: '希腊字母是期权价格对各参数的偏导，Delta 对冲、Gamma 凸性、Vega 波动率敏感度是风险管理核心。',
    definition: 'Delta=$\\partial V/\\partial S$，Gamma=$\\partial^2V/\\partial S^2$，Vega=$\\partial V/\\partial\\sigma$，Theta 时间衰减。',
    whenToUse: ['对冲', '风险监控', '组合管理'],
    theorems: [
      { name: 'Delta 对冲', statement: '持有 $\\Delta$ 份标的中和风险。' },
      { name: 'Gamma 与凸性', statement: 'Gamma 衡量 Delta 变化率。' },
    ],
    steps: [
      { title: '写定价公式', body: 'BS 闭式。' },
      { title: '求偏导', body: '对各参数。' },
      { title: '得希腊字母', body: 'Delta 等。' },
      { title: '做对冲', body: '按 Delta 配比。' },
      { title: '监控', body: 'Gamma/Vega 风险。' },
    ],
    pitfalls: ['把 Delta 当概率', '忽略 Gamma 的凸性', 'Vega 与波动率混淆'],
    example: { problem: 'Delta 的含义？', walkthrough: ['对标的的敏感度。'], result: '\\partial V/\\partial S' },
    moreExamples: [{ problem: 'Gamma 衡量什么？', walkthrough: ['Delta 的变化率。'], result: '凸性' }],
  },
  {
    id: 'binomial-tree',
    title: '二叉树模型',
    tag: '金融数学',
    level: '进阶',
    essence: '二叉树用离散上涨下跌逼近连续过程，风险中性概率使其无套利，是期权定价的入门模型。',
    definition: 'CRR 模型中每步上涨 u、下跌 d，风险中性概率 $p=(e^{r\\Delta t}-d)/(u-d)$。',
    whenToUse: ['美式期权', '教学', '数值定价'],
    theorems: [
      { name: '风险中性概率', statement: '使期望贴现价格等于现值。' },
      { name: '收敛', statement: '步数趋于无穷收敛到 BS。' },
    ],
    steps: [
      { title: '定参数', body: '$u,d,r,\\Delta t$。' },
      { title: '算概率', body: '风险中性 $p$。' },
      { title: '倒推', body: '从叶子回溯。' },
      { title: '取期望', body: '贴现。' },
      { title: '得价格', body: '根节点值。' },
    ],
    pitfalls: ['用真实概率', '忘记贴现', 'u,d 选择不当'],
    example: { problem: '风险中性概率公式？', walkthrough: ['$p=(e^{r\\Delta t}-d)/(u-d)$。'], result: '风险中性' },
    moreExamples: [{ problem: '二叉树能定价美式期权吗？', walkthrough: ['可提前行权比较。'], result: '能' }],
  },
  {
    id: 'credit-risk',
    title: '信用风险与违约模型',
    tag: '金融数学',
    level: '竞赛',
    essence: '信用风险用违约强度刻画，结构化模型看资产跌破债务，简约模型用强度过程，CDS 定价是核心应用。',
    definition: '强度模型用违约强度 λ 给出生存概率 $e^{-\\lambda t}$；结构化模型以资产过程触及违约边界定义违约。',
    whenToUse: ['CDS 定价', '信用评级', '风险管理'],
    theorems: [
      { name: '生存概率', statement: '$P(\\tau>t)=e^{-\\lambda t}$。' },
      { name: 'CDS 定价', statement: '保费与赔付现值相等。' },
    ],
    steps: [
      { title: '选模型', body: '结构或强度。' },
      { title: '定违约参数', body: '$\\lambda$ 或边界。' },
      { title: '算生存概率', body: '指数形式。' },
      { title: '算赔付现值', body: '贴现期望。' },
      { title: '定保费', body: '使两端相等。' },
    ],
    pitfalls: ['把违约强度当概率', '忽略回收率', '混淆结构与简约模型'],
    example: { problem: '强度模型下生存概率？', walkthrough: ['指数衰减。'], result: 'e^{-\\lambda t}' },
    moreExamples: [{ problem: 'CDS 定价的原则？', walkthrough: ['保费现值等于赔付现值。'], result: '两端相等' }],
  },

  {
    id: 'root-finding-iteration',
    title: '非线性方程求根：二分、牛顿与割线',
    tag: '数值分析',
    level: '进阶',
    essence: '二分法稳健但线性收敛，牛顿法二次收敛但需导数，割线法用差商替代导数。',
    definition: '牛顿法 $x_{k+1}=x_k-f(x_k)/f\\prime(x_k)$；割线法用差商代替导数。',
    whenToUse: ['解非线性方程', '加速收敛', '工程求根'],
    theorems: [
      { name: '牛顿二次收敛', statement: '单根附近误差平方级下降。', formula: 'e_{k+1}\\approx Ce_k^2' },
      { name: '二分收敛', statement: '每次区间减半。' },
    ],
    steps: [
      { title: '定区间', body: '变号区间。' },
      { title: '选方法', body: '稳健或快速。' },
      { title: '迭代', body: '更新近似。' },
      { title: '判收敛', body: '残差或步长。' },
      { title: '验精度', body: '误差界。' },
    ],
    pitfalls: ['牛顿法在重根退化', '初值选在导数近零处', '二分忘记验变号'],
    example: { problem: '牛顿法的迭代公式？', walkthrough: ['切线零点。'], result: 'x-f/f\\prime' },
    moreExamples: [{ problem: '割线法用什么代替导数？', walkthrough: ['差商。'], result: '差商' }],
  },
  {
    id: 'spline-interpolation',
    title: '样条插值',
    tag: '数值分析',
    level: '竞赛',
    essence: '高次多项式插值会龙格振荡，分段低次样条用光滑拼接避免振荡，三次样条最常用。',
    definition: '三次样条是分段三次多项式，在节点处一二阶导数连续，满足插值条件。',
    whenToUse: ['曲线拟合', '避免振荡', 'CAD'],
    theorems: [
      { name: '存在唯一', statement: '加两类边界条件后唯一。' },
      { name: '最小曲率', statement: '在所有插值函数中曲率积分最小。' },
    ],
    steps: [
      { title: '分节点', body: '区间划分。' },
      { title: '设分段三次', body: '每段四个系数。' },
      { title: '加连续条件', body: '一二阶导连续。' },
      { title: '加边界', body: '自然或固定。' },
      { title: '解方程组', body: '得系数。' },
    ],
    pitfalls: ['边界条件缺失导致不唯一', '混淆样条与高次插值', '节点太密导致病态'],
    example: { problem: '三次样条在节点处要求什么连续？', walkthrough: ['一阶与二阶导。'], result: '一阶、二阶导连续' },
    moreExamples: [{ problem: '高次插值的振荡叫什么？', walkthrough: ['龙格现象。'], result: '龙格现象' }],
  },
  {
    id: 'gaussian-quadrature',
    title: '高斯求积',
    tag: '数值分析',
    level: '竞赛',
    essence: '高斯求积选取最优节点与权重，n 个节点可精确积分 2n−1 次多项式，效率远高于等距公式。',
    definition: '高斯求积用正交多项式零点作节点，权重由积分条件确定，代数精度 2n−1。',
    whenToUse: ['高精度积分', '有限元', '谱方法'],
    theorems: [
      { name: '代数精度', statement: 'n 点高斯公式精确到 2n−1 次。', formula: '2n-1' },
      { name: '节点为正交零点', statement: '勒让德多项式零点。' },
    ],
    steps: [
      { title: '选权函数', body: '区间与权。' },
      { title: '取正交多项式', body: '如勒让德。' },
      { title: '用其零点', body: '节点。' },
      { title: '解权重', body: '积分条件。' },
      { title: '验精度', body: '代数精度。' },
    ],
    pitfalls: ['把节点当等距', '忘记权函数', '混淆代数精度与阶'],
    example: { problem: 'n 点高斯求积的代数精度？', walkthrough: ['$2n-1$。'], result: '2n−1' },
    moreExamples: [{ problem: '节点怎么选？', walkthrough: ['正交多项式零点。'], result: '正交零点' }],
  },
  {
    id: 'runge-kutta',
    title: '常微分方程数值解：欧拉与龙格－库塔',
    tag: '数值分析',
    level: '竞赛',
    essence: '欧拉法一阶、龙格－库塔四阶，用多步斜率加权达到高精度，是 ODE 数值解的标准方法。',
    definition: 'RK4 用四次斜率加权平均推进一步，局部截断误差五阶；欧拉法只取一次斜率。',
    whenToUse: ['解初值问题', '仿真', '动力学'],
    theorems: [
      { name: 'RK4 阶数', statement: '局部误差五阶、全局四阶。' },
      { name: '稳定性', statement: '步长受稳定性区域限制。' },
    ],
    steps: [
      { title: '写初值问题', body: '$y\\prime=f(t,y)$。' },
      { title: '选步长', body: '$h$。' },
      { title: '算斜率', body: 'RK4 的 $k_1..k_4$。' },
      { title: '加权更新', body: '$(k_1+2k_2+2k_3+k_4)/6$。' },
      { title: '迭代', body: '推进时间。' },
    ],
    pitfalls: ['把 RK4 当四阶局部误差', '步长过大失稳', '忘记初值'],
    example: { problem: 'RK4 的加权系数？', walkthrough: ['1,2,2,1 除以 6。'], result: '1/6,2/6,2/6,1/6' },
    moreExamples: [{ problem: '欧拉法的阶？', walkthrough: ['一阶。'], result: '一阶' }],
  },
  {
    id: 'power-method',
    title: '幂法与特征值计算',
    tag: '数值分析',
    level: '竞赛',
    essence: '幂法迭代求主特征值与特征向量，收敛速度由次主特征值比值决定，反幂法求最小特征值。',
    definition: '幂法反复用矩阵乘向量并归一化，收敛到主特征向量；反幂法用 $A^{-1}$。',
    whenToUse: ['主特征值', 'PageRank', '振动分析'],
    theorems: [
      { name: '收敛率', statement: '比值 $|\\lambda_2/\\lambda_1|$ 决定。' },
      { name: '反幂法', statement: '求最小特征值。' },
    ],
    steps: [
      { title: '取初向量', body: '非零。' },
      { title: '乘矩阵', body: '$Av$。' },
      { title: '归一化', body: '除以范数。' },
      { title: '读特征值', body: '瑞利商。' },
      { title: '判收敛', body: '向量稳定。' },
    ],
    pitfalls: ['主特征值不唯一时失效', '忘记归一化溢出', '混淆幂法与反幂法'],
    example: { problem: '幂法求什么？', walkthrough: ['主特征值。'], result: '主特征值' },
    moreExamples: [{ problem: '收敛速度由什么决定？', walkthrough: ['特征值比值。'], result: '|λ₂/λ₁|' }],
  },
  {
    id: 'error-analysis',
    title: '误差分析与数值稳定性',
    tag: '数值分析',
    level: '进阶',
    essence: '数值计算有截断误差与舍入误差，稳定性要求小扰动不放大，病态问题条件数大。',
    definition: '绝对误差、相对误差；算法稳定指误差不放大；条件数度量问题本身敏感度。',
    whenToUse: ['评估精度', '选算法', '避免数值失真'],
    theorems: [
      { name: '误差传播', statement: '相对误差可放大。' },
      { name: '稳定性判据', statement: '条件数小则稳定。' },
    ],
    steps: [
      { title: '定真值', body: '或高精度参考。' },
      { title: '算误差', body: '绝对与相对。' },
      { title: '分析来源', body: '截断或舍入。' },
      { title: '看条件数', body: '问题敏感度。' },
      { title: '改算法', body: '提升稳定性。' },
    ],
    pitfalls: ['把截断误差当舍入误差', '忽略灾难性抵消', '条件数大仍用直接法'],
    example: { problem: '条件数大说明什么？', walkthrough: ['问题病态。'], result: '病态（敏感）' },
    moreExamples: [{ problem: '舍入误差来自什么？', walkthrough: ['有限精度表示。'], result: '浮点表示' }],
  },

  {
    id: 'qr-decomposition',
    title: 'QR 分解与正交化',
    tag: '计算数学',
    level: '竞赛',
    essence: 'QR 分解把矩阵拆成列正交 Q 与上三角 R，比 LU 更稳定，是最小二乘与特征值算法的基石。',
    definition: 'A=QR，Q 列正交，R 上三角；可由 Gram-Schmidt、Householder 或 Givens 构造。',
    whenToUse: ['最小二乘', '解线性方程组', '特征值算法'],
    theorems: [
      { name: '存在性', statement: '满秩矩阵有 QR 分解。' },
      { name: '稳定性', statement: 'Householder QR 后向稳定。' },
    ],
    steps: [
      { title: '取列向量', body: '矩阵的列。' },
      { title: '正交化', body: 'Gram-Schmidt 或 Householder。' },
      { title: '单位化', body: '得 Q。' },
      { title: '算 R', body: '$Q^TA$。' },
      { title: '验分解', body: '$QR=A$。' },
    ],
    pitfalls: ['经典 Gram-Schmidt 不稳定', '忘记符号约定', '秩亏时 R 对角为零'],
    example: { problem: 'QR 中 Q 的性质？', walkthrough: ['列正交。'], result: '列正交' },
    moreExamples: [{ problem: 'QR 比 LU 的优势？', walkthrough: ['数值更稳定。'], result: '稳定性' }],
  },
  {
    id: 'least-squares-qr',
    title: '最小二乘与 QR',
    tag: '计算数学',
    level: '进阶',
    essence: '最小二乘解超定方程，用 QR 比正规方程更稳定：避免 $A^TA$ 的条件数平方。',
    definition: '最小二乘最小化 $\\|Ax-b\\|_2$；QR 给出 $R x=Q^Tb$。',
    whenToUse: ['数据拟合', '超定方程', '回归'],
    theorems: [
      { name: '正规方程', statement: '$A^TAx=A^Tb$。' },
      { name: 'QR 解法', statement: '解上三角方程，条件数不平方。' },
    ],
    steps: [
      { title: '写超定方程', body: '$A$ 高瘦。' },
      { title: '做 QR', body: '$A=QR$。' },
      { title: '算右端', body: '$Q^Tb$。' },
      { title: '解 R', body: '回代。' },
      { title: '验残差', body: '正交性。' },
    ],
    pitfalls: ['用正规方程导致条件数平方', '忽略秩亏', '把残差当误差'],
    example: { problem: 'QR 解最小二乘的方程？', walkthrough: ['上三角。'], result: 'Rx=Q^Tb' },
    moreExamples: [{ problem: '正规方程的条件数？', walkthrough: ['平方放大。'], result: '\\kappa(A)^2' }],
  },
  {
    id: 'conjugate-gradient',
    title: '共轭梯度法',
    tag: '计算数学',
    level: '竞赛',
    essence: '共轭梯度法解对称正定系统，用共轭方向在 n 步内收敛，是大规模稀疏问题的首选迭代法。',
    definition: 'CG 沿 A 共轭方向极小化二次型，残差正交；每步只需矩阵向量乘。',
    whenToUse: ['大规模稀疏', 'PDE 离散', '优化'],
    theorems: [
      { name: 'n 步收敛', statement: '精确算术下 n 步收敛。' },
      { name: '收敛率', statement: '由条件数决定。', formula: '\\frac{\\sqrt\\kappa-1}{\\sqrt\\kappa+1}' },
    ],
    steps: [
      { title: '写系统', body: '$Ax=b$ 对称正定。' },
      { title: '初始化', body: '残差。' },
      { title: '算步长', body: '沿共轭方向。' },
      { title: '更新', body: '解与残差。' },
      { title: '判收敛', body: '残差范数。' },
    ],
    pitfalls: ['用于非对称矩阵', '忘记预条件', '忽略舍入导致失共轭'],
    example: { problem: 'CG 要求矩阵满足什么？', walkthrough: ['对称正定。'], result: '对称正定' },
    moreExamples: [{ problem: 'CG 每步计算量？', walkthrough: ['一次矩阵向量乘。'], result: 'O(nnz)' }],
  },
  {
    id: 'sparse-matrix',
    title: '稀疏矩阵与存储格式',
    tag: '计算数学',
    level: '进阶',
    essence: '稀疏矩阵只存非零元，CSR/CSC 格式让存储与计算量正比于非零元数，是科学计算的基础。',
    definition: '稀疏矩阵非零元远少于总元素；CSR 按行存值、列索引与行指针。',
    whenToUse: ['大规模问题', '有限元', '图算法'],
    theorems: [
      { name: '复杂度', statement: '乘向量复杂度 O(nnz)。' },
      { name: '填充', statement: '分解会产生填充，需重排序。' },
    ],
    steps: [
      { title: '统计非零', body: 'nnz。' },
      { title: '选格式', body: 'CSR 或 CSC。' },
      { title: '存三元组', body: '值、行、列。' },
      { title: '重排序', body: '减少填充。' },
      { title: '做运算', body: '稀疏乘。' },
    ],
    pitfalls: ['用稠密存储稀疏矩阵', '忽略填充', '重排序破坏数值'],
    example: { problem: 'CSR 的复杂度优势？', walkthrough: ['按 nnz 计。'], result: 'O(nnz)' },
    moreExamples: [{ problem: '分解时新非零叫什么？', walkthrough: ['填充。'], result: 'fill-in' }],
  },
  {
    id: 'eigenvalue-algorithms',
    title: '特征值算法：QR 迭代',
    tag: '计算数学',
    level: '竞赛',
    essence: 'QR 迭代反复做 QR 分解并交换因子，矩阵收敛到三角，对角元即特征值，是实用特征值算法。',
    definition: 'QR 迭代 $A_k=Q_kR_k$，$A_{k+1}=R_kQ_k$，相似变换保持特征值。',
    whenToUse: ['全部特征值', '对称矩阵', '稳定性分析'],
    theorems: [
      { name: '相似性', statement: '$A_{k+1}=Q^TA_kQ$ 相似。' },
      { name: '收敛', statement: '收敛到 Schur 形。' },
    ],
    steps: [
      { title: '化 Hessenberg', body: '预处理。' },
      { title: 'QR 分解', body: '$A=QR$。' },
      { title: '交换因子', body: '$RQ$。' },
      { title: '迭代', body: '直到次对角小。' },
      { title: '读对角', body: '特征值。' },
    ],
    pitfalls: ['收敛慢不加速（位移）', '忽略复特征值块', '把 Hessenberg 当三角'],
    example: { problem: 'QR 迭代保持什么？', walkthrough: ['特征值不变。'], result: '特征值' },
    moreExamples: [{ problem: '加速手段？', walkthrough: ['位移 QR。'], result: '位移' }],
  },
  {
    id: 'floating-point',
    title: '浮点运算与舍入误差',
    tag: '计算数学',
    level: '进阶',
    essence: '浮点数按 $\\beta^e\\times m$ 表示，舍入产生相对误差上界为机器精度，累加会放大误差。',
    definition: 'IEEE 浮点由符号、指数、尾数组成；机器精度是相邻可表示数相对间隔。',
    whenToUse: ['误差估计', '算法设计', '复现性'],
    theorems: [
      { name: '舍入模型', statement: '$fl(x)=x(1+\\delta)$，$|\\delta|\\le u$。' },
      { name: '累加误差', statement: '求和误差随 n 增长。' },
    ],
    steps: [
      { title: '看表示', body: '指数与尾数。' },
      { title: '算精度', body: '$u=2^{-53}$。' },
      { title: '估误差', body: '相对误差。' },
      { title: '看累积', body: '求和误差。' },
      { title: '改算法', body: '补偿求和。' },
    ],
    pitfalls: ['把绝对误差当相对误差', '忽略灾难性抵消', '假设浮点满足结合律'],
    example: { problem: '双精度机器精度约？', walkthrough: ['$2^{-53}$。'], result: '约 1.1e−16' },
    moreExamples: [{ problem: '浮点加法满足结合律吗？', walkthrough: ['不满足。'], result: '不满足' }],
  },

  {
    id: 'perfect-secrecy',
    title: '完善保密与一次一密',
    tag: '密码学',
    level: '进阶',
    essence: '完善保密指密文不泄露明文任何信息，一次一密在密钥随机且只用一次时达到它，但密钥长度是硬约束。',
    definition: '完善保密：对任意明文分布与密文，后验等于先验，即密文与明文独立。',
    whenToUse: ['理论下界', '证明安全', '理解局限'],
    theorems: [
      { name: '香农定理', statement: '完善保密要求密钥空间不小于明文空间。', formula: '|K|\\ge|M|' },
      { name: '一次一密', statement: '随机密钥异或达到完善保密。' },
    ],
    steps: [
      { title: '定模型', body: '明文、密钥、密文空间。' },
      { title: '写条件', body: '后验等于先验。' },
      { title: '验密钥长度', body: '是否满足下界。' },
      { title: '构造方案', body: '异或或更复杂。' },
      { title: '证安全', body: '分布独立。' },
    ],
    pitfalls: ['复用密钥破坏安全', '把计算安全当信息论安全', '忽略密钥分发'],
    example: { problem: '一次一密的密钥要求？', walkthrough: ['随机、等长、一次。'], result: '随机一次性等长' },
    moreExamples: [{ problem: '完善保密的密钥下界？', walkthrough: ['不小于明文。'], result: '|K|≥|M|' }],
  },
  {
    id: 'pseudo-randomness',
    title: '伪随机性与计算安全',
    tag: '密码学',
    level: '竞赛',
    essence: '伪随机生成器把短种子拉成长串，任何多项式时间区分者都分不出它与真随机，这是现代密码的基石。',
    definition: 'PRG 是确定性扩张映射，其输出与同长均匀串在多项式时间内不可区分。',
    whenToUse: ['构造加密', '密钥流', '归约证明'],
    theorems: [
      { name: '存在性蕴含', statement: 'PRG 存在当且仅当单向函数存在。' },
      { name: '扩张', statement: '输出长度大于种子长度。' },
    ],
    steps: [
      { title: '定种子长度', body: '$n$。' },
      { title: '定输出长度', body: '$l(n)>n$。' },
      { title: '构造生成器', body: '迭代单向函数。' },
      { title: '定义区分游戏', body: '挑战者。' },
      { title: '归约证明', body: '区分者推出破解单向函数。' },
    ],
    pitfalls: ['把统计随机当伪随机', '忽略多项式时间限制', '认为 PRG 不可预测等于不可区分'],
    example: { problem: 'PRG 的安全性靠什么？', walkthrough: ['计算不可区分。'], result: '不可区分性' },
    moreExamples: [{ problem: 'PRG 与单向函数的关系？', walkthrough: ['等价存在。'], result: '存在性等价' }],
  },
  {
    id: 'cpa-security',
    title: '选择明文攻击安全',
    tag: '密码学',
    level: '竞赛',
    essence: 'CPA 安全要求即使攻击者能加密任意明文，也分不出挑战密文对应哪个明文；确定性加密不满足。',
    definition: 'CPA 游戏中攻击者查询加密预言机后给出两明文，需区分挑战密文。',
    whenToUse: ['加密方案设计', '模式选择', '安全证明'],
    theorems: [
      { name: '随机化必要', statement: '确定性加密不可能 CPA 安全。' },
      { name: 'PRF 构造', statement: '用 PRF 加随机数构造 CPA 安全方案。' },
    ],
    steps: [
      { title: '写游戏', body: '挑战者与攻击者。' },
      { title: '给加密预言机', body: '任意查询。' },
      { title: '挑战', body: '两明文选一加密。' },
      { title: '猜测', body: '优势可忽略。' },
      { title: '归约', body: '到 PRF 安全。' },
    ],
    pitfalls: ['用 ECB 模式（确定性）', '忽略随机数重用', '把 CPA 当 CCA'],
    example: { problem: '为什么 ECB 不安全？', walkthrough: ['相同明文得相同密文。'], result: '确定性泄露模式' },
    moreExamples: [{ problem: 'CPA 安全方案至少要什么？', walkthrough: ['随机化。'], result: '随机性' }],
  },
  {
    id: 'mac-prf',
    title: '消息认证码与伪随机函数',
    tag: '密码学',
    level: '竞赛',
    essence: 'MAC 保证消息完整性与来源认证，PRF 是构造 MAC 的标准工具，安全要求是存在不可伪造。',
    definition: 'MAC 由密钥生成、标签生成与验证组成；安全指攻击者不能对新消息伪造有效标签。',
    whenToUse: ['完整性保护', '通信协议', '组合加密'],
    theorems: [
      { name: 'PRF 构造 MAC', statement: '安全 PRF 给出安全 MAC。' },
      { name: '不可伪造', statement: '未查询消息难伪造。' },
    ],
    steps: [
      { title: '定密钥', body: '共享密钥。' },
      { title: '算标签', body: 'PRF 或哈希。' },
      { title: '验证', body: '重算比对。' },
      { title: '定义伪造', body: '新消息有效标签。' },
      { title: '归约', body: '到 PRF。' },
    ],
    pitfalls: ['把哈希当 MAC（无密钥）', '忘记常数时间比较', '加密与 MAC 顺序错误'],
    example: { problem: 'MAC 保证什么？', walkthrough: ['完整性与来源。'], result: '完整性+认证' },
    moreExamples: [{ problem: '为什么不能只用哈希？', walkthrough: ['无密钥，谁都能算。'], result: '缺少密钥' }],
  },
  {
    id: 'elgamal',
    title: 'ElGamal 加密与离散对数',
    tag: '密码学',
    level: '竞赛',
    essence: 'ElGamal 基于离散对数困难性，加密是随机的（两个群元素），因此满足 CPA 安全。',
    definition: '公钥 $(g,h=g^x)$，密文 $(g^r, m\\cdot h^r)$，解密用 $h^r$ 的逆。',
    whenToUse: ['公钥加密', '混合加密', '教学'],
    theorems: [
      { name: '正确性', statement: '解密还原明文。' },
      { name: 'CPA 安全', statement: 'DDH 假设下 CPA 安全。' },
    ],
    steps: [
      { title: '选群', body: '循环群与生成元。' },
      { title: '生成密钥', body: '$x$ 与 $h=g^x$。' },
      { title: '加密', body: '随机 $r$。' },
      { title: '解密', body: '消去 $h^r$。' },
      { title: '验正确性', body: '代数化简。' },
    ],
    pitfalls: ['复用随机数 r', '选小群受攻击', '混淆 ElGamal 与 RSA'],
    example: { problem: 'ElGamal 密文由几个元素组成？', walkthrough: ['两个群元素。'], result: '两个' },
    moreExamples: [{ problem: 'ElGamal 的安全性基于什么？', walkthrough: ['离散对数/DDH。'], result: '离散对数' }],
  },
  {
    id: 'diffie-hellman',
    title: 'Diffie-Hellman 密钥交换',
    tag: '密码学',
    level: '竞赛',
    essence: '双方公开交换 $g^a$、$g^b$，各自算出共享密钥 $g^{ab}$，窃听者面临计算 Diffie-Hellman 问题。',
    definition: 'DH 协议：公开 $g$ 与大素数，A 发 $g^a$，B 发 $g^b$，共享 $g^{ab}$。',
    whenToUse: ['密钥协商', 'TLS', '前向保密'],
    theorems: [
      { name: '正确性', statement: '双方得到同一密钥。' },
      { name: 'CDH 假设', statement: '由 $g^a,g^b$ 难算 $g^{ab}$。' },
    ],
    steps: [
      { title: '选参数', body: '群与生成元。' },
      { title: '各自取值', body: '$a,b$ 保密。' },
      { title: '交换', body: '$g^a,g^b$。' },
      { title: '算共享', body: '$g^{ab}$。' },
      { title: '验证', body: '双方一致。' },
    ],
    pitfalls: ['缺少认证（中间人攻击）', '用小群', '忽略前向保密'],
    example: { problem: 'DH 能防中间人吗？', walkthrough: ['不能，需认证。'], result: '不能（需认证）' },
    moreExamples: [{ problem: '共享密钥是什么？', walkthrough: ['$g^{ab}$。'], result: 'g^{ab}' }],
  },

  {
    id: 'pumping-lemma',
    title: '泵引理与正则语言判定',
    tag: '理论计算机',
    level: '进阶',
    essence: '泵引理是证明语言非正则的工具：足够长的串中必有一段可以重复任意次而仍在语言中。',
    definition: '正则语言 L 存在泵长度 p，使任意长度 ≥p 的串可拆为 xyz，且 $xy^kz\\in L$ 对所有 k。',
    whenToUse: ['证明非正则', '分析语言类', '理解有限性'],
    theorems: [
      { name: '泵引理', statement: '正则语言可泵。' },
      { name: '逆否用法', statement: '不可泵则非正则。' },
    ],
    steps: [
      { title: '假设正则', body: '取泵长度 p。' },
      { title: '选串', body: '依赖 p 构造。' },
      { title: '枚举拆分', body: '所有 xyz。' },
      { title: '找 k 使违反', body: '泵出语言。' },
      { title: '得矛盾', body: '故非正则。' },
    ],
    pitfalls: ['把泵引理当充分条件', '选串不依赖 p', '只验一个拆分'],
    example: { problem: '$a^nb^n$ 正则吗？', walkthrough: ['泵引理可证非正则。'], result: '非正则' },
    moreExamples: [{ problem: '泵引理是充要条件吗？', walkthrough: ['只是必要。'], result: '必要非充分' }],
  },
  {
    id: 'context-free-grammar',
    title: '上下文无关文法与下推自动机',
    tag: '理论计算机',
    level: '进阶',
    essence: '上下文无关文法用产生式描述嵌套结构，与下推自动机等价，是编译语法分析的基础。',
    definition: 'CFG 由变量、终结符、产生式与开始变量组成；PDA 是带栈的自动机。',
    whenToUse: ['语法分析', '语言识别', '编译原理'],
    theorems: [
      { name: '等价性', statement: 'CFG 与 PDA 等价。' },
      { name: '泵引理', statement: 'CFL 也有泵引理。' },
    ],
    steps: [
      { title: '写文法', body: '产生式。' },
      { title: '推导演算', body: '最左推导。' },
      { title: '构造 PDA', body: '栈模拟推导。' },
      { title: '验语言', body: '是否匹配。' },
      { title: '判歧义', body: '推导树是否唯一。' },
    ],
    pitfalls: ['把 CFG 当正则', '忽略歧义性', '混淆最左与最右推导'],
    example: { problem: 'CFG 对应什么自动机？', walkthrough: ['下推自动机。'], result: 'PDA' },
    moreExamples: [{ problem: 'CFL 对交封闭吗？', walkthrough: ['不对交封闭。'], result: '不封闭' }],
  },
  {
    id: 'turing-machine',
    title: '图灵机与丘奇－图灵论题',
    tag: '理论计算机',
    level: '竞赛',
    essence: '图灵机是带读写头与无限纸带的最简计算模型，丘奇－图灵论题断言它刻画了「可计算」的全部。',
    definition: '图灵机由状态、纸带字母表、转移函数组成；可计算函数是图灵机可计算的函数。',
    whenToUse: ['定义可计算', '分析复杂度', '不可判定性'],
    theorems: [
      { name: '丘奇－图灵论题', statement: '可计算即图灵可计算。' },
      { name: '通用图灵机', statement: '存在模拟任意图灵机的通用机。' },
    ],
    steps: [
      { title: '写转移表', body: '状态与符号。' },
      { title: '模拟运行', body: '读写移动。' },
      { title: '判停机', body: '终态。' },
      { title: '构造通用机', body: '编码输入。' },
      { title: '分析资源', body: '时间空间。' },
    ],
    pitfalls: ['把图灵机当现实计算机', '忽略无限纸带', '混淆可计算与高效'],
    example: { problem: '通用图灵机能做什么？', walkthrough: ['模拟任意图灵机。'], result: '模拟任意机器' },
    moreExamples: [{ problem: '丘奇－图灵论题的地位？', walkthrough: ['论题非定理。'], result: '论题' }],
  },
  {
    id: 'undecidability',
    title: '不可判定性与对角化',
    tag: '理论计算机',
    level: '竞赛',
    essence: '停机问题不可判定：用对角化构造自指矛盾，由此推出大量问题不可判定。',
    definition: '语言不可判定指没有图灵机在有限步内对每个输入给出是/否。',
    whenToUse: ['证明不可判定', '归约', '理论边界'],
    theorems: [
      { name: '停机问题不可判定', statement: '不存在判定停机的图灵机。' },
      { name: '赖斯定理', statement: '非平凡语义性质不可判定。' },
    ],
    steps: [
      { title: '假设判定器', body: '存在 H。' },
      { title: '构造自指', body: 'D 调用 H 于自身。' },
      { title: '翻转结果', body: '相反输出。' },
      { title: '得矛盾', body: 'D 的行为矛盾。' },
      { title: '推其他不可判定', body: '归约。' },
    ],
    pitfalls: ['混淆不可判定与未解决', '忘记对角化关键', '把归约方向搞反'],
    example: { problem: '停机问题可判定吗？', walkthrough: ['对角化。'], result: '不可判定' },
    moreExamples: [{ problem: '赖斯定理说什么？', walkthrough: ['非平凡语义性质不可判定。'], result: '语义性质不可判定' }],
  },
  {
    id: 'cook-levin',
    title: '库克－莱文定理与 NP 完全',
    tag: '理论计算机',
    level: '竞赛',
    essence: 'SAT 是第一个被证明 NP 完全的问题：所有 NP 问题都可多项式归约到它，由此建立 NP 完全类。',
    definition: 'NP 完全指属于 NP 且所有 NP 问题可多项式归约到它；SAT 是首个例子。',
    whenToUse: ['证明 NP 完全', '复杂度分类', '算法下界'],
    theorems: [
      { name: '库克－莱文', statement: 'SAT 是 NP 完全的。' },
      { name: '归约传递', statement: 'NP 完全问题归约到的新问题仍 NP 完全。' },
    ],
    steps: [
      { title: '证属于 NP', body: '给证书验证。' },
      { title: '选已知完全问题', body: '如 SAT。' },
      { title: '构造归约', body: '多项式变换。' },
      { title: '证等价', body: '双向。' },
      { title: '得完全性', body: 'NP 完全。' },
    ],
    pitfalls: ['归约方向反', '归约不多项式', '忘记证属于 NP'],
    example: { problem: '第一个 NP 完全问题？', walkthrough: ['SAT。'], result: 'SAT' },
    moreExamples: [{ problem: '证 NP 完全要做几步？', walkthrough: ['属于 NP + 归约。'], result: '两步' }],
  },
  {
    id: 'space-complexity',
    title: '空间复杂度与 PSPACE',
    tag: '理论计算机',
    level: '竞赛',
    essence: '空间复杂度刻画内存需求，PSPACE 包含 NP，萨维奇定理说明非确定空间可被平方确定空间模拟。',
    definition: 'PSPACE 是多项式空间可判定的语言类；NPSPACE=PSPACE（萨维奇）。',
    whenToUse: ['内存分析', '博弈求解', '复杂度层级'],
    theorems: [
      { name: '萨维奇定理', statement: 'NPSPACE=PSPACE。', formula: '\\mathrm{NPSPACE}=\\mathrm{PSPACE}' },
      { name: '包含关系', statement: 'NP ⊆ PSPACE。' },
    ],
    steps: [
      { title: '定空间界', body: '多项式。' },
      { title: '构造判定机', body: '递归模拟。' },
      { title: '用萨维奇', body: '平方空间。' },
      { title: '比较类', body: 'NP 与 PSPACE。' },
      { title: '得结论', body: '包含或相等。' },
    ],
    pitfalls: ['把空间当时间', '忽略萨维奇的平方', '混淆 PSPACE 与 EXPTIME'],
    example: { problem: 'NPSPACE 与 PSPACE 关系？', walkthrough: ['相等。'], result: '相等' },
    moreExamples: [{ problem: 'NP 与 PSPACE 的包含？', walkthrough: ['NP ⊆ PSPACE。'], result: 'NP ⊆ PSPACE' }],
  },

  {
    id: 'kinematics',
    title: '质点运动学',
    tag: '力学',
    level: '基础',
    essence: '运动学描述位置随时间变化，速度是导数、加速度是二阶导数，曲线运动分解为切向与法向。',
    definition: '位置矢量 r(t)，速度 v=dr/dt，加速度 a=dv/dt；自然坐标下分解为切向与法向分量。',
    whenToUse: ['描述运动', '求轨迹', '分解加速度'],
    theorems: [
      { name: '切向法向分解', statement: '$a=a_t\\hat t+a_n\\hat n$。', formula: 'a_n=v^2/\\rho' },
      { name: '匀加速公式', statement: '$v=v_0+at$，$s=v_0t+\\frac12at^2$。' },
    ],
    steps: [
      { title: '写位置', body: '参数化轨迹。' },
      { title: '求导', body: '得速度。' },
      { title: '再求导', body: '得加速度。' },
      { title: '分解', body: '切向法向。' },
      { title: '解运动', body: '积分或代公式。' },
    ],
    pitfalls: ['把速度大小当速率变化率', '忘记法向加速度', '混淆位移与路程'],
    example: { problem: '匀速圆周运动的加速度方向？', walkthrough: ['指向圆心。'], result: '法向（向心）' },
    moreExamples: [{ problem: '法向加速度公式？', walkthrough: ['$v^2/\\rho$。'], result: 'v^2/\\rho' }],
  },
  {
    id: 'newton-laws',
    title: '牛顿三定律与惯性系',
    tag: '力学',
    level: '基础',
    essence: '牛顿定律只在惯性系成立，非惯性系需引入惯性力；这是力学建模的第一道关口。',
    definition: '第一定律定义惯性系；第二定律 F=ma；第三定律作用反作用等大反向。',
    whenToUse: ['受力分析', '建立方程', '判断参考系'],
    theorems: [
      { name: '第二定律', statement: '合外力等于质量乘加速度。', formula: 'F=ma' },
      { name: '惯性力', statement: '非惯性系加 $-ma_0$。' },
    ],
    steps: [
      { title: '选参考系', body: '惯性或非惯性。' },
      { title: '受力分析', body: '画隔离体图。' },
      { title: '写方程', body: '分量形式。' },
      { title: '解方程', body: '求加速度。' },
      { title: '验合理性', body: '极限与量纲。' },
    ],
    pitfalls: ['在非惯性系忘加惯性力', '把作用反作用当平衡力', '受力分析漏力'],
    example: { problem: '第二定律的矢量形式？', walkthrough: ['合外力。'], result: '\\mathbf F=m\\mathbf a' },
    moreExamples: [{ problem: '非惯性系要加什么？', walkthrough: ['惯性力。'], result: '惯性力' }],
  },
  {
    id: 'momentum-conservation',
    title: '动量定理与动量守恒',
    tag: '力学',
    level: '进阶',
    essence: '冲量改变动量；合外力为零时总动量守恒，碰撞与爆炸是典型应用。',
    definition: '冲量 $I=\\int F\\,dt$ 等于动量变化；系统合外力为零则总动量守恒。',
    whenToUse: ['碰撞问题', '变质量', '爆炸'],
    theorems: [
      { name: '动量定理', statement: '冲量等于动量变化。', formula: 'I=\\Delta p' },
      { name: '动量守恒', statement: '合外力为零时总动量不变。' },
    ],
    steps: [
      { title: '选系统', body: '明确研究对象。' },
      { title: '看外力', body: '是否为零。' },
      { title: '写守恒式', body: '初末动量相等。' },
      { title: '解未知', body: '速度或质量。' },
      { title: '验能量', body: '弹性或非弹性。' },
    ],
    pitfalls: ['把动量当能量', '忽略外力的冲量', '方向正负搞错'],
    example: { problem: '完全非弹性碰撞后速度？', walkthrough: ['动量守恒。'], result: 'm_1v_1/(m_1+m_2)' },
    moreExamples: [{ problem: '动量守恒条件？', walkthrough: ['合外力为零。'], result: '合外力为零' }],
  },
  {
    id: 'angular-momentum',
    title: '角动量与力矩',
    tag: '力学',
    level: '进阶',
    essence: '角动量 $L=r×p$，力矩改变角动量；中心力场中角动量守恒，开普勒定律由此而来。',
    definition: '角动量 $\\mathbf L=\\mathbf r\\times\\mathbf p$；力矩 $\\boldsymbol\\tau=\\mathbf r\\times\\mathbf F$，$\\tau=dL/dt$。',
    whenToUse: ['转动问题', '中心力', '开普勒'],
    theorems: [
      { name: '角动量定理', statement: '力矩等于角动量变化率。' },
      { name: '中心力守恒', statement: '中心力下角动量守恒。' },
    ],
    steps: [
      { title: '选参考点', body: '定原点。' },
      { title: '算角动量', body: '叉积。' },
      { title: '算力矩', body: '叉积。' },
      { title: '写方程', body: '$\\tau=dL/dt$。' },
      { title: '用守恒', body: '中心力情形。' },
    ],
    pitfalls: ['把角动量当动量', '参考点选错', '忽略力矩方向'],
    example: { problem: '中心力场中什么守恒？', walkthrough: ['力矩为零。'], result: '角动量' },
    moreExamples: [{ problem: '角动量定理的形式？', walkthrough: ['力矩等于变化率。'], result: '\\tau=dL/dt' }],
  },
  {
    id: 'oscillations',
    title: '简谐振动',
    tag: '力学',
    level: '进阶',
    essence: '回复力与位移成正比时运动是简谐的，周期由系统参数决定；阻尼与受迫振动引入共振。',
    definition: '简谐振动 $x=A\\cos(\\omega t+\\varphi)$，$\\omega=\\sqrt{k/m}$。',
    whenToUse: ['振动分析', '共振', '波的基础'],
    theorems: [
      { name: '周期公式', statement: '$T=2\\pi\\sqrt{m/k}$。', formula: 'T=2\\pi\\sqrt{m/k}' },
      { name: '能量守恒', statement: '动能势能周期转换。' },
    ],
    steps: [
      { title: '找回复力', body: '是否正比位移。' },
      { title: '写方程', body: '$m x\\prime\\prime=-kx$。' },
      { title: '求频率', body: '$\\omega$。' },
      { title: '定振幅相位', body: '初条件。' },
      { title: '分析阻尼', body: '受迫或阻尼项。' },
    ],
    pitfalls: ['把频率当角频率', '忽略阻尼', '混淆周期与波长'],
    example: { problem: '弹簧振子周期？', walkthrough: ['标准公式。'], result: '2\\pi\\sqrt{m/k}' },
    moreExamples: [{ problem: '共振条件？', walkthrough: ['驱动频率等于固有频率。'], result: '频率相等' }],
  },
  {
    id: 'central-force',
    title: '中心力场与开普勒定律',
    tag: '力学',
    level: '竞赛',
    essence: '中心力场中角动量守恒给出面积定律，万有引力给出椭圆轨道，三定律可由牛顿力学推出。',
    definition: '中心力只依赖距离；有效势把径向运动化为一维问题。',
    whenToUse: ['行星运动', '轨道计算', '散射'],
    theorems: [
      { name: '开普勒第一定律', statement: '行星轨道是椭圆。' },
      { name: '开普勒第三定律', statement: '$T^2\\propto a^3$。' },
    ],
    steps: [
      { title: '写中心力', body: '$F(r)$。' },
      { title: '用角动量守恒', body: '面积速度恒定。' },
      { title: '写有效势', body: '加离心项。' },
      { title: '解轨道', body: '圆锥曲线。' },
      { title: '得周期', body: '第三定律。' },
    ],
    pitfalls: ['把椭圆当圆', '忽略离心项', '混淆近日点远日点'],
    example: { problem: '开普勒第三定律形式？', walkthrough: ['周期平方正比半长轴立方。'], result: 'T^2\\propto a^3' },
    moreExamples: [{ problem: '中心力下什么守恒？', walkthrough: ['角动量。'], result: '角动量' }],
  },

  {
    id: 'continuity-equation',
    title: '连续方程与物质导数',
    tag: '流体力学',
    level: '进阶',
    essence: '连续方程是质量守恒，物质导数把随体变化与局部变化分开，是流体力学的基本语言。',
    definition: '连续方程 $\\partial_t\\rho+\\nabla\\cdot(\\rho\\mathbf v)=0$；物质导数 $D/Dt=\\partial_t+\\mathbf v\\cdot\\nabla$。',
    whenToUse: ['质量守恒', '推导方程', '分析可压性'],
    theorems: [
      { name: '连续方程', statement: '密度变化等于通量散度。', formula: '\\partial_t\\rho+\\nabla\\cdot(\\rho\\mathbf v)=0' },
      { name: '不可压', statement: '$\\nabla\\cdot\\mathbf v=0$。' },
    ],
    steps: [
      { title: '取控制体', body: '质量守恒。' },
      { title: '写通量', body: '流入流出。' },
      { title: '取极限', body: '得微分形式。' },
      { title: '判可压', body: '密度是否常数。' },
      { title: '用物质导数', body: '改写方程。' },
    ],
    pitfalls: ['把不可压当密度处处相同（可分层）', '忘记对流项', '量纲不统一'],
    example: { problem: '不可压流体的连续方程？', walkthrough: ['密度常数。'], result: '\\nabla\\cdot\\mathbf v=0' },
    moreExamples: [{ problem: '物质导数的两项含义？', walkthrough: ['局部+对流。'], result: '局部+对流' }],
  },
  {
    id: 'euler-equation',
    title: '欧拉方程与理想流体',
    tag: '流体力学',
    level: '进阶',
    essence: '欧拉方程是理想流体的动量方程，忽略粘性；它与连续方程联立描述无粘流动。',
    definition: '欧拉方程 $\\rho(\\partial_t\\mathbf v+\\mathbf v\\cdot\\nabla\\mathbf v)=-\\nabla p+\\mathbf f$。',
    whenToUse: ['无粘流动', '势流', '快速估计'],
    theorems: [
      { name: '欧拉方程', statement: '动量守恒的无粘形式。' },
      { name: '势流', statement: '无旋则存在速度势。' },
    ],
    steps: [
      { title: '取微元', body: '受力分析。' },
      { title: '写动量方程', body: '加速度项。' },
      { title: '忽略粘性', body: '删去粘性项。' },
      { title: '联立连续', body: '闭合方程组。' },
      { title: '加边界条件', body: '求解。' },
    ],
    pitfalls: ['在粘性主导处用欧拉', '非线性对流项处理错', '边界条件不满足'],
    example: { problem: '欧拉方程与 NS 方程的区别？', walkthrough: ['无粘性项。'], result: '无粘' },
    moreExamples: [{ problem: '无旋流存在什么？', walkthrough: ['速度势。'], result: '速度势' }],
  },
  {
    id: 'vorticity',
    title: '涡量与环量',
    tag: '流体力学',
    level: '竞赛',
    essence: '涡量是速度旋度，刻画局部旋转；无粘无外力时涡量随流体输运（开尔文定理）。',
    definition: '涡量 $\\boldsymbol\\omega=\\nabla\\times\\mathbf v$；环量是速度沿闭曲线的积分。',
    whenToUse: ['旋转流动', '升力', '湍流'],
    theorems: [
      { name: '开尔文定理', statement: '无粘正压外力有势时环量守恒。' },
      { name: '亥姆霍兹定理', statement: '涡线随流体运动。' },
    ],
    steps: [
      { title: '算旋度', body: '速度场求旋。' },
      { title: '看环量', body: '斯托克斯。' },
      { title: '判无旋', body: '涡量为零。' },
      { title: '用守恒', body: '开尔文。' },
      { title: '分析结构', body: '涡线涡管。' },
    ],
    pitfalls: ['把涡量当角速度（差因子 2）', '混淆无旋与静止', '忽略粘性扩散'],
    example: { problem: '涡量与角速度的关系？', walkthrough: ['差因子 2。'], result: '\\omega=2\\Omega' },
    moreExamples: [{ problem: '开尔文定理条件？', walkthrough: ['无粘正压有势外力。'], result: '理想条件' }],
  },
  {
    id: 'reynolds-number',
    title: '雷诺数与相似性',
    tag: '流体力学',
    level: '进阶',
    essence: '雷诺数比较惯性力与粘性力，决定层流还是湍流；相似性让模型实验可以缩放。',
    definition: '$Re=UL/\\nu$，U 特征速度、L 特征长度、ν 运动粘度。',
    whenToUse: ['流态判断', '模型实验', '量纲分析'],
    theorems: [
      { name: '临界雷诺数', statement: '超过临界值流动转捩为湍流。' },
      { name: '相似性', statement: 'Re 相同则流动相似。' },
    ],
    steps: [
      { title: '定尺度', body: 'U 与 L。' },
      { title: '算 ν', body: '粘度除以密度。' },
      { title: '得 Re', body: '无量纲数。' },
      { title: '判流态', body: '与临界值比。' },
      { title: '做相似', body: '缩放实验。' },
    ],
    pitfalls: ['把 Re 当速度', '尺度选取随意', '忽略压缩性影响'],
    example: { problem: 'Re 的物理意义？', walkthrough: ['惯性/粘性。'], result: '惯性力与粘性力之比' },
    moreExamples: [{ problem: '相似性条件？', walkthrough: ['Re 相同。'], result: 'Re 相等' }],
  },
  {
    id: 'potential-flow',
    title: '势流与流函数',
    tag: '流体力学',
    level: '竞赛',
    essence: '无旋不可压流存在速度势，满足拉普拉斯方程；流函数与势函数构成共轭调和函数。',
    definition: '速度势 $\\mathbf v=\\nabla\\phi$，不可压给出 $\\nabla^2\\phi=0$；流函数 ψ 满足 $u=\\psi_y$、$v=-\\psi_x$。',
    whenToUse: ['绕流', '升力计算', '复变方法'],
    theorems: [
      { name: '拉普拉斯', statement: '势函数调和。' },
      { name: '共轭调和', statement: 'φ 与 ψ 满足柯西－黎曼。' },
    ],
    steps: [
      { title: '验无旋', body: '涡量为零。' },
      { title: '写势函数', body: '梯度为速度。' },
      { title: '解拉普拉斯', body: '加边界。' },
      { title: '求流函数', body: '共轭调和。' },
      { title: '算压力', body: '伯努利。' },
    ],
    pitfalls: ['把有旋流当势流', '边界条件写错', '混淆 φ 与 ψ 的梯度'],
    example: { problem: '势流满足什么方程？', walkthrough: ['拉普拉斯。'], result: '\\nabla^2\\phi=0' },
    moreExamples: [{ problem: 'φ 与 ψ 的关系？', walkthrough: ['共轭调和。'], result: '柯西－黎曼' }],
  },
  {
    id: 'turbulence',
    title: '湍流与雷诺平均',
    tag: '流体力学',
    level: '竞赛',
    essence: '湍流是多尺度随机流动，雷诺平均把速度分解为平均与脉动，产生雷诺应力封闭问题。',
    definition: '雷诺分解 $\\mathbf v=\\bar{\\mathbf v}+\\mathbf v\\prime$；平均方程出现雷诺应力项。',
    whenToUse: ['工程湍流', 'CFD', '混合长度'],
    theorems: [
      { name: '雷诺方程', statement: '平均后出现应力项。' },
      { name: '能量级联', statement: '能量从大尺度传到小尺度。' },
    ],
    steps: [
      { title: '做分解', body: '平均加脉动。' },
      { title: '取平均', body: '得雷诺方程。' },
      { title: '识别应力', body: '$\\overline{v_i\\prime v_j\\prime}$。' },
      { title: '建模封闭', body: '涡粘或 k-ε。' },
      { title: '求解验证', body: '与实验对比。' },
    ],
    pitfalls: ['把湍流当随机噪声', '忽略雷诺应力', '直接 DNS 全部尺度'],
    example: { problem: '雷诺平均产生什么新项？', walkthrough: ['脉动相关。'], result: '雷诺应力' },
    moreExamples: [{ problem: '能量级联方向？', walkthrough: ['大到小。'], result: '大→小' }],
  },
];


/** 标签 → 学科大类：讲解页按大类分组，避免 40 个标签把列表冲散 */
export const TAG_BUCKET: Record<string, string> = {
  极限: '高等数学',
  中值定理: '高等数学',
  导数应用: '高等数学',
  积分: '高等数学',
  级数: '高等数学',
  多元: '高等数学',
  重积分: '高等数学',
  曲线与曲面积分: '高等数学',
  微分方程: '高等数学',
  空间几何: '高等数学',
  数列: '高等数学',
  不等式: '高等数学',
  线代: '线性代数',
  概率: '概率统计',
  拓扑: '现代数学',
  集合论: '现代数学',
  图论: '现代数学',
  信息论: '现代数学',
  博弈论: '现代数学',
  密码学: '现代数学',
  测度论: '现代数学',
  伽罗瓦: '现代数学',
  运筹学: '现代数学',
  非欧几何: '现代数学',
  可计算性: '现代数学',
  环论: '现代数学',
  抽象代数: '现代数学',
  射影几何: '现代数学',
  代数拓扑: '现代数学',
  计算复杂性: '现代数学',
  控制论: '现代数学',
  范畴论: '现代数学',
  解析数论: '现代数学',
  表示论: '现代数学',
  金融数学: '现代数学',
  力学: '数学与物理',
  生物数学: '数学与物理',
  三角学: '竞赛与专项',
  欧氏几何: '竞赛与专项',
  代数: '竞赛与专项',
};

/** 讲解所属的学科大类 */
export function explainerBucket(tag: string): string {
  return TAG_BUCKET[tag] ?? '其他专题';
}

/** 按学科大类分组（讲解页用这个，比按 tag 分组稳定） */
export function groupExplainersByBucket(): ExplainerGroup[] {
  const order = ['高等数学', '线性代数', '概率统计', '竞赛与专项', '现代数学', '数学与物理', '其他专题'];
  const map = new Map<string, ExplainerTopic[]>();
  for (const topic of EXPLAINER_TOPICS) {
    const bucket = explainerBucket(topic.tag);
    if (!map.has(bucket)) map.set(bucket, []);
    map.get(bucket)!.push(topic);
  }
  return order
    .filter((b) => map.has(b))
    .map((b) => ({ tag: b, items: map.get(b)! }));
}

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
