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

  {
    id: 'det-basics',
    title: '行列式：三种算法',
    tag: '线代',
    level: '基础',
    essence:
      '行列式是一个「把方阵映成数」的函数；考试里九成靠三条性质化简，剩下才是硬展开。',
    whenToUse: [
      '判断矩阵是否可逆（det ≠ 0）',
      '求特征多项式',
      '计算面积、体积的伸缩因子',
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
    },
  },
  {
    id: 'matrix-algebra',
    title: '矩阵运算：为什么乘法不交换',
    tag: '线代',
    level: '基础',
    essence:
      '矩阵乘法对应「先做一个线性变换再做另一个」，顺序不同结果就不同；求逆的本质是解线性方程组。',
    whenToUse: [
      '做矩阵乘法与转置',
      '判断矩阵是否可逆并求逆',
      '解矩阵方程 AX = B',
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
    },
  },
  {
    id: 'gauss-elimination',
    title: '高斯消元：解的结构',
    tag: '线代',
    level: '基础',
    essence:
      '初等行变换把方程组化成阶梯形，比较系数矩阵与增广矩阵的秩，就能判断是有唯一解、无穷多解还是无解。',
    whenToUse: [
      '解线性方程组',
      '判断方程组解的情况',
      '求基础解系',
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
    },
  },
  {
    id: 'vector-space-basis',
    title: '基与维数：向量空间的坐标系',
    tag: '线代',
    level: '进阶',
    essence:
      '基是「数量最少、能张成整个空间」的一组向量；维数是基的个数，与选哪组基无关。',
    whenToUse: [
      '判断一组向量能否构成基',
      '求向量空间的维数',
      '求向量在给定基下的坐标',
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
    },
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
    whenToUse: [
      '化二次型为标准形',
      '判断二次型是否正定',
      '求曲面类型（椭圆、双曲）',
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
    },
  },

  {
    id: 'special-matrices',
    title: '特殊矩阵：对角、三角、对称、正交',
    tag: '线代',
    level: '基础',
    essence:
      '矩阵的特殊结构能省掉大半计算：对角阵幂次只看对角元，三角阵行列式只乘对角元，对称阵一定能正交对角化。',
    whenToUse: [
      '快速算特殊矩阵的幂与行列式',
      '判断矩阵是否正交、是否可正交对角化',
      '用分块结构简化大矩阵运算',
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
    example: {
      problem: '验证旋转矩阵 $Q=\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{pmatrix}$ 是正交矩阵。',
      walkthrough: [
        '计算 $Q^{T}Q$：两个因子相乘后，非对角元是 $-\\cos\\theta\\sin\\theta+\\sin\\theta\\cos\\theta=0$。',
        '对角元是 $\\cos^{2}\\theta+\\sin^{2}\\theta=1$。',
        '所以 $Q^{T}Q=I$，$Q$ 是正交矩阵。',
        '行列式 $=\\cos^{2}\\theta+\\sin^{2}\\theta=1$，符合正交阵行列式为 $\\pm1$ 的结论。',
      ],
      result: 'Q^{T}Q=I',
    },
  },
  {
    id: 'cramers-rule',
    title: '克拉默法则：用行列式解方程组',
    tag: '线代',
    level: '基础',
    essence:
      '当系数行列式不为零时，每个未知数都等于「用常数列替换该列后的行列式」除以系数行列式。',
    whenToUse: [
      '未知数少、系数简单的方程组',
      '需要写出解的显式表达式',
      '判断齐次方程组是否只有零解',
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
    },
  },
  {
    id: 'gram-schmidt',
    title: '施密特正交化：把基变正交',
    tag: '线代',
    level: '进阶',
    essence:
      '用逐次减去投影的办法，把一组线性无关向量变成正交组，张成的空间不变，再单位化就得到标准正交基。',
    whenToUse: [
      '求标准正交基',
      '构造正交矩阵',
      '推导 QR 分解',
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
    },
  },
  {
    id: 'jordan-form',
    title: '若尔当标准形：不能对角化怎么办',
    tag: '线代',
    level: '进阶',
    essence:
      '不能对角化的矩阵仍能化成「对角块 + 上三角 $1$」的若尔当标准形；差别就在于这些 $1$ 记录了广义特征向量的层次。',
    whenToUse: [
      '处理不可对角化的矩阵',
      '计算矩阵的幂与指数函数',
      '理解重特征值对应的几何重数不足',
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
    },
  },
  {
    id: 'inertia-theorem',
    title: '惯性定理：标准形不唯一但规范',
    tag: '线代',
    level: '进阶',
    essence:
      '二次型用不同的可逆替换化标准形，系数会变，但正平方项和负平方项的个数——正负惯性指数——永远不变。',
    whenToUse: [
      '判断二次型的类型（正定、负定、不定）',
      '比较两个二次型是否合同',
      '求二次型的秩与符号差',
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
    },
  },

  {
    id: 'inverse-adjugate',
    title: '伴随矩阵：行列式与逆的桥梁',
    tag: '线代',
    level: '基础',
    essence:
      '伴随矩阵由各元素的代数余子式拼成，核心恒等式 $AA^{*}=|A|I$ 把行列式和逆矩阵直接连起来。',
    whenToUse: [
      '用公式法求逆矩阵',
      '求 $|A^{*}|$ 或 $A^{-1}$ 的行列式',
      '证明与伴随矩阵有关的恒等式',
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
    ],
    example: {
      problem: '已知 $A$ 是三阶矩阵且 $|A|=2$，求 $|A^{*}|$。',
      walkthrough: [
        '由 $AA^{*}=|A|I$ 两边取行列式：$|A||A^{*}|=|A|^{3}$。',
        '代入 $|A|=2$：$2|A^{*}|=8$。',
        '所以 $|A^{*}|=4$，正好等于 $|A|^{n-1}$。',
      ],
      result: '|A^{*}|=|A|^{n-1}=4',
    },
  },
  {
    id: 'rank-nullity',
    title: '秩-零化度定理',
    tag: '线代',
    level: '进阶',
    essence:
      '矩阵的秩加上零空间的维数，等于未知数的个数：能确定的信息和自由变量的自由度刚好互补。',
    whenToUse: [
      '求齐次方程组基础解系的个数',
      '判断解空间的维数',
      '分析线性映射的「损失」',
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
    },
  },
  {
    id: 'homogeneous-basis',
    title: '齐次方程组：基础解系怎么取',
    tag: '线代',
    level: '基础',
    essence:
      '化行最简形后，自由变量逐个取 $1$、其余取 $0$，就得到基础解系；通解是所有解的线性组合。',
    whenToUse: [
      '求齐次方程组的通解',
      '判断解空间维数',
      '求特征向量（本质就是齐次方程组）',
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
    },
  },
  {
    id: 'subspace-test',
    title: '子空间：三条判定',
    tag: '线代',
    level: '基础',
    essence:
      '子空间要满足：含零向量、对加法封闭、对数乘封闭；三条都过才是子空间。',
    whenToUse: [
      '判断一个集合是不是子空间',
      '验证解空间、列空间的性质',
      '找出不满足封闭性的反例',
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
    },
  },
  {
    id: 'transition-matrix',
    title: '过渡矩阵：换基之后坐标怎么变',
    tag: '线代',
    level: '进阶',
    essence:
      '同一向量在不同基下的坐标不同；过渡矩阵 $P$ 把新坐标换成旧坐标，求逆就能反着换。',
    whenToUse: [
      '两组基之间转换坐标',
      '求基变换矩阵',
      '理解相似矩阵的来源',
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
    },
  },
  {
    id: 'eigen-properties',
    title: '特征值的性质：迹、行列式与无关性',
    tag: '线代',
    level: '基础',
    essence:
      '特征值之和等于迹，之积等于行列式；不同特征值对应的特征向量一定线性无关，这两条能省掉大量计算。',
    whenToUse: [
      '已知部分特征值反求另一个',
      '快速检查算出的特征值对不对',
      '判断特征向量组是否线性无关',
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
    ],
    example: {
      problem: '$A$ 是三阶矩阵，特征值为 $1,2,x$，且 $|A|=24$，求 $x$。',
      walkthrough: [
        '特征值之积等于行列式：$1\\times2\\times x=24$。',
        '所以 $x=12$。',
        '顺便可得迹 $=1+2+12=15$，等于对角元之和。',
      ],
      result: 'x=12',
    },
  },
  {
    id: 'matrix-power',
    title: '用对角化算矩阵的高次幂',
    tag: '线代',
    level: '进阶',
    essence:
      '把矩阵对角化成 $A=P\\Lambda P^{-1}$ 后，$A^{k}=P\\Lambda^{k}P^{-1}$，而对角阵的幂只是对角元取幂。',
    whenToUse: [
      '求矩阵的高次幂',
      '分析马尔可夫链的长期行为',
      '求递推数列的通项',
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
    },
  },
  {
    id: 'orthogonal-diagonalization',
    title: '正交变换化二次型为标准形',
    tag: '线代',
    level: '进阶',
    essence:
      '二次型矩阵是对称阵，一定能被正交矩阵对角化；标准形的系数就是特征值，且变换保持长度。',
    whenToUse: [
      '化二次型为标准形且要求变换是正交的',
      '判断二次型类型（看特征值符号）',
      '求曲面主轴方向',
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
    },
  },
  {
    id: 'rayleigh-quotient',
    title: '瑞利商：二次型在单位球上的极值',
    tag: '线代',
    level: '竞赛',
    essence:
      '二次型除以长度平方就是瑞利商，它的最大值是最小特征值对应的极值——最大特征值对应最大值，最小特征值对应最小值。',
    whenToUse: [
      '求二次型在单位球上的最值',
      '估计矩阵特征值的范围',
      '证明与特征值有关的不等式',
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
    ],
    example: {
      problem: '求 $f=x_{1}^{2}+2x_{2}^{2}$ 在 $x_{1}^{2}+x_{2}^{2}=1$ 上的最大值与最小值。',
      walkthrough: [
        '矩阵为 $\\mathrm{diag}(1,2)$，特征值 $1$ 与 $2$。',
        '瑞利商的取值范围是 $[1,2]$。',
        '最大值 $2$ 在 $x=(0,1)$ 处取到，最小值 $1$ 在 $x=(1,0)$ 处取到。',
      ],
      result: '\\max=2,\\ \\min=1',
    },
  },

  {
    id: 'determinant-expansion',
    title: '行列式按行展开与范德蒙德',
    tag: '线代',
    level: '基础',
    essence:
      '行列式可以按任一行（列）展开成代数余子式的加权和；零多的行展开最省力，范德蒙德行列式则有现成公式。',
    whenToUse: [
      '行列式中某行零特别多时',
      '证明行列式恒等式',
      '识别范德蒙德结构并直接写结果',
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
    ],
    example: {
      problem: '计算 $\\begin{vmatrix}1&1&1\\\\x_{1}&x_{2}&x_{3}\\\\x_{1}^{2}&x_{2}^{2}&x_{3}^{2}\\end{vmatrix}$ 当 $x_{1}=1,x_{2}=2,x_{3}=3$。',
      walkthrough: [
        '这是三阶范德蒙德行列式。',
        '按公式等于 $(x_{2}-x_{1})(x_{3}-x_{1})(x_{3}-x_{2})$。',
        '代入得 $(2-1)(3-1)(3-2)=1\\times2\\times1=2$。',
      ],
      result: 'V_{3}=2',
    },
  },
  {
    id: 'elementary-matrix',
    title: '初等矩阵：行变换的矩阵形式',
    tag: '线代',
    level: '进阶',
    essence:
      '对单位矩阵做一次初等变换就得到初等矩阵；左乘它等于对目标矩阵做同样的行变换，这就是高斯消元的代数本质。',
    whenToUse: [
      '把行变换写成矩阵乘法',
      '求逆矩阵（初等变换法）',
      '理解初等矩阵都可逆且逆同类',
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
    },
  },
  {
    id: 'linear-space',
    title: '线性空间：把 $\\mathbb{R}^{n}$ 抽象掉',
    tag: '线代',
    level: '进阶',
    essence:
      '线性空间是满足八条运算法则的集合，元素可以是多项式、矩阵、函数；$\\mathbb{R}^{n}$ 只是其中一个例子。',
    whenToUse: [
      '判断多项式空间、矩阵空间的维数',
      '理解「向量」不必是数组',
      '证明抽象空间中的线性性质',
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
    },
  },
  {
    id: 'linear-transformation',
    title: '线性变换与它的矩阵',
    tag: '线代',
    level: '进阶',
    essence:
      '线性变换是保持加法与数乘的映射；选定一组基后，它被唯一地表示成一个矩阵，换基则矩阵相似。',
    whenToUse: [
      '把几何变换写成矩阵',
      '求线性变换在给定基下的矩阵',
      '理解相似矩阵的几何含义',
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
    },
  },

  {
    id: 'kernel-image',
    title: '核与像：线性变换的两把尺子',
    tag: '线代',
    level: '进阶',
    essence:
      '核是「被映成零」的向量集合，像是「能映出来的」向量集合；两者维数之和等于定义域维数，这是秩-零化度定理的几何版本。',
    whenToUse: [
      '判断线性变换是否单射或满射',
      '求变换的核空间与像空间',
      '验证维数公式',
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
    },
  },
  {
    id: 'isomorphism',
    title: '同构：维数相同就本质相同',
    tag: '线代',
    level: '进阶',
    essence:
      '两个线性空间之间存在可逆的线性映射，就叫同构；有限维下只需维数相等，因此所有 $n$ 维空间都同构于 $\\\\mathbb{R}^{n}$。',
    whenToUse: [
      '判断两个空间是否「本质上一样」',
      '把抽象空间的问题搬到 $\\\\mathbb{R}^{n}$ 计算',
      '理解坐标映射的意义',
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
    },
  },
  {
    id: 'derivative-sign',
    title: '导数符号：单调区间与极值怎么定',
    tag: '导数应用',
    level: '基础',
    essence:
      '单调性只看导数的正负，极值只看导数变号。做题顺序永远是：定义域 → 求导 → 分解 → 找临界点 → 列表判号。',
    whenToUse: [
      '求函数的单调区间、极值、闭区间最值',
      '证明不等式（把不等式变成函数的最值问题）',
      '判断方程有几个根（靠单调性和端点值）',
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
    },
  },
  {
    id: 'recurrence-general-term',
    title: '递推数列：三步求出通项',
    tag: '数列',
    level: '进阶',
    essence:
      '递推题的难点不在算，而在第一步认结构。先看相邻项之间是差、是比、还是系数关系，再决定用累加、累乘还是待定系数。',
    whenToUse: [
      '给出首项与相邻项关系，要求通项',
      '判断数列是等差还是等比',
      '先求通项再求前 n 项和',
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
    },
  },
  {
    id: 'line-integral',
    title: '曲线积分：第一类与第二类怎么分',
    tag: '曲线与曲面积分',
    level: '进阶',
    essence:
      '两类曲线积分的区别只在微小元：乘弧长 ds 的第一类与方向无关，乘坐标 dx、dy 的第二类换个方向就变号。做法都是先把曲线参数化。',
    whenToUse: [
      '积分号后面跟 ds，是求质量、质心一类的第一类',
      '积分号后面跟 dx 与 dy 的组合，是求做功、环流一类的第二类',
      '能用格林公式把闭曲线积分换成二重积分时',
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
    },
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
    whenToUse: [
      '要证明某个函数在区域上取到最大值或最小值',
      '判断一个空间是否紧致（有界闭区间是最典型的例子）',
      '想把有限情形的结论推广到无限集合',
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
    ],
    example: {
      problem: '说明闭区间上的连续函数一定有最大值。',
      walkthrough: [
        '闭区间是有界闭集，因此紧致。',
        '函数连续，于是区间在函数下的像也紧致。',
        '实数中的紧致集有界且闭，所以像集有上确界并且取得到。',
        '这个取到的上确界就是最大值。',
      ],
      result: '连续函数在闭区间上必取到最大值与最小值。',
    },
  },
  {
    id: 'group-homomorphism',
    title: '群同态：核与商群在做什么',
    tag: '抽象代数',
    level: '进阶',
    essence:
      '同态是保持运算的映射，核衡量它丢掉了多少信息。把核压成一个点得到商群，同态就变成单射，这就是第一同构定理。',
    whenToUse: [
      '两个群结构相似，想说明它们差在哪',
      '构造商群、判断子群是否正规',
      '把复杂的群化归成简单的已知群',
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
    ],
    example: {
      problem: '整数群通过取模映射映到六阶循环群，求核与商群。',
      walkthrough: [
        '取模映射保持加法，因此是同态。',
        '被映到零的元素正是 6 的倍数，所以核是 6 的整数倍集合。',
        '由第一同构定理，整数群除以 6 的倍数，与六阶循环群同构。',
      ],
      result: '核是 6 的倍数全体，商群同构于六阶循环群。',
    },
  },
  {
    id: 'lebesgue-integral',
    title: '勒贝格积分：先切值域再测面积',
    tag: '测度论',
    level: '竞赛',
    essence:
      '黎曼积分切定义域，勒贝格积分切值域：先看函数取到哪些值，再测这些值的原像有多大。这样极限与积分可以交换次序。',
    whenToUse: [
      '函数太病态，黎曼不可积但仍想定义积分',
      '需要把极限搬到积分号内（单调收敛、控制收敛）',
      '概率论里把期望写成积分',
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
    ],
    example: {
      problem: '说明有理数集上取 1、无理数上取 0 的函数在闭区间上的积分。',
      walkthrough: [
        '这个函数在闭区间上黎曼不可积：任何分割上下和的差都很大。',
        '但从测度看，有理数集可数、测度为零，无理数测度就是整个区间长度。',
        '按勒贝格积分，非零的那部分只在零测集上，所以积分等于零。',
      ],
      result: '勒贝格积分等于 0，与黎曼积分形成对比。',
    },
  },
  {
    id: 'np-reduction',
    title: '归约：怎么证明一个问题很难',
    tag: '计算复杂性',
    level: '竞赛',
    essence:
      '证明一个新问题难，不需要从头论证，只要把已知的难问题在多项式时间内变成它。这种“搬运难度”的手法就是归约。',
    whenToUse: [
      '想说明某问题是 NP 困难的',
      '设计算法前判断问题有没有希望多项式求解',
      '做算法题时把陌生问题化归成熟悉的模型',
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
    ],
    example: {
      problem: '说明“找最大团”至少和三元可满足性一样难。',
      walkthrough: [
        '把每个三元子句看成一组可以同时为真的文字。',
        '为每个文字建一个顶点，同一子句内的顶点相连，不同子句之间只连不冲突的文字。',
        '这个构造是多项式时间的，且子句可满足等价于图中有对应大小的团。',
        '于是三元可满足性归约到团问题，团问题是 NP 困难的。',
      ],
      result: '团问题是 NP 完全的。',
    },
  },
  {
    id: 'law-of-large-numbers',
    title: '大数定律与中心极限：平均值为什么稳定',
    tag: '概率',
    level: '进阶',
    essence:
      '大数定律说平均值会稳定到期望；中心极限定理更进一步，说明偏离期望的波动近似正态，且幅度是根号 n 分之一。',
    whenToUse: [
      '用频率估计概率，想知道要多少次才够准',
      '把二项分布近似成正态分布做计算',
      '估计样本均值的误差范围',
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
    },
  },
  {
    id: 'parameter-estimation',
    title: '参数估计：点估计与区间估计',
    tag: '概率',
    level: '进阶',
    essence:
      '点估计给一个数，区间估计给一个范围和一个置信度。评价点估计看有没有系统性偏差（无偏）与波动大小（有效性）。',
    whenToUse: [
      '从样本推断总体均值、比例、方差',
      '报告结果时要说清误差范围',
      '比较两种估计方法哪个更好',
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
    },
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
    whenToUse: [
      '求曲线弧长、旋转体体积与侧面积',
      '求变力做功、液体压力、质心',
      '题目给出「已知截面面积」求体积',
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
    },
  },
  {
    id: 'surface-integral-gauss',
    title: '曲面积分与高斯公式',
    tag: '曲线与曲面积分',
    level: '竞赛',
    essence:
      '第一类曲面积分乘面积元，与方向无关；第二类乘有向投影，换侧就变号。闭曲面上的第二类积分可以用高斯公式换成三重积分。',
    whenToUse: [
      '求曲面质量、流量或通量',
      '闭曲面通量，直接算很麻烦',
      '想用散度统一处理三个坐标方向的积分',
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
    },
  },
  {
    id: 'higher-derivative',
    title: '高阶导数与微分：求到第 n 阶',
    tag: '极限',
    level: '进阶',
    essence:
      '高阶导数就是反复求导。真正要学的是三件事：常见函数的 n 阶导公式、莱布尼茨公式、以及用微分做线性近似。',
    whenToUse: [
      '题目要求第 n 阶导数的一般表达式',
      '两个函数乘积的高阶导数（莱布尼茨公式）',
      '用微分估计误差或用切线近似函数值',
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
    ],
    example: {
      problem: '求三次多项式的二阶导数。',
      walkthrough: [
        '先求一阶导，指数降一次并乘系数。',
        '再求一次，得到二阶导。',
        '三次多项式的二阶导是一次函数。',
      ],
      result: '二阶导为一次函数，系数由原式决定。',
    },
  },
  {
    id: 'integration-substitution',
    title: '换元积分法：把复合结构换掉',
    tag: '积分',
    level: '基础',
    essence:
      '换元就是把复合函数的内层整体换成一个新变量，让积分变成基本公式的样子。关键在内层导数是否已经出现在被积式里。',
    whenToUse: [
      '被积式里有复合函数，且内层导数（差一个常数倍）也在',
      '根号内是一次式或二次式，想用三角换元',
      '定积分换元后要同步换积分限',
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
    },
  },
  {
    id: 'separable-ode',
    title: '可分离变量与齐次方程',
    tag: '微分方程',
    level: '基础',
    essence:
      '一阶方程的两条基本路线：能分离的把两个变量分到两边再积分；齐次的用比值换元变成可分离。',
    whenToUse: [
      '方程能写成导数等于两个单变量函数之积',
      '右端只依赖 y 与 x 的比值（齐次方程）',
      '带初值条件求特解',
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
    },
  },
  {
    id: 'rational-integral',
    title: '有理函数积分：先拆成部分分式',
    tag: '积分',
    level: '进阶',
    essence:
      '有理函数积分只有一条路：假分式先做除法化成多项式加真分式，真分式再按分母因式拆成部分分式，最后逐项积分。',
    whenToUse: [
      '被积式是多项式之比',
      '分母能因式分解成一次与二次因子',
      '三角有理式用万能代换后也归到这里',
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
    },
  },
  {
    id: 'multivar-chain',
    title: '多元复合求导：链式法则的树状图',
    tag: '多元',
    level: '进阶',
    essence:
      '多元链式法则就是把依赖关系画成一棵树：对每条从目标到变量的路径，把偏导相乘，再把所有路径相加。',
    whenToUse: [
      '中间变量由多个自变量决定',
      '求隐函数的偏导（把方程看成恒等式两边求导）',
      '求全导数（中间变量又依赖同一个自变量）',
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
    },
  },
  {
    id: 'multivar-extrema',
    title: '无条件极值：先用驻点，再看二阶判别式',
    tag: '多元',
    level: '进阶',
    essence:
      '多元极值分两步：先解一阶偏导为零找驻点，再用二阶偏导构成的判别式判断是极大、极小还是鞍点。',
    whenToUse: [
      '求二元函数的极大值、极小值',
      '应用题里求成本最小、利润最大',
      '判断一个驻点到底是极值还是鞍点',
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
    },
  },
  {
    id: 'implicit-parametric-diff',
    title: '隐函数与参数方程求导',
    tag: '极限',
    level: '进阶',
    essence:
      '隐函数求导把方程两边同时求导，把未知导数当整体解出来；参数方程求导就是两个导数相除。两者都不需要先解出显式函数。',
    whenToUse: [
      '曲线由方程给出，解不出显式函数',
      '曲线用参数方程表示，要求切线斜率',
      '求二阶导（参数方程要再除一次参数导数）',
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
    ],
    example: {
      problem: '单位圆方程给出曲线，求其导数表达式。',
      walkthrough: [
        '两边对 x 求导，注意 y 是 x 的函数。',
        '得到含导数的线性方程。',
        '解出导数等于负 x 比 y。',
      ],
      result: '导数为负 x 比 y。',
    },
  },
  {
    id: 'concavity-curvature',
    title: '凹凸性与曲率：曲线有多「弯」',
    tag: '导数应用',
    level: '进阶',
    essence:
      '一阶导看升降，二阶导看弯曲方向：二阶导为正曲线凹向上，为负凹向下，变号处是拐点。曲率则把「弯的程度」量化成数。',
    whenToUse: [
      '求曲线的凹凸区间与拐点',
      '求曲率与曲率半径',
      '证明不等式时用凸性（琴生不等式的来源）',
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
    ],
    example: {
      problem: '求单位圆的曲率。',
      walkthrough: [
        '圆的曲率处处相同。',
        '半径为一时，曲率等于一分之一。',
        '也就是恒等于 1。',
      ],
      result: '单位圆曲率为 1，曲率半径为 1。',
    },
  },
  {
    id: 'improper-integral',
    title: '反常积分：无穷区间与无界函数',
    tag: '积分',
    level: '进阶',
    essence:
      '反常积分就是把边界换成参数再取极限。极限存在叫收敛，不存在叫发散。判别敛散常用比较法与 p 积分基准。',
    whenToUse: [
      '积分区间一端或两端无穷',
      '被积函数在端点无界（如根号在分母）',
      '判断级数敛散时用积分判别法',
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
    },
  },
  {
    id: 'power-series-expansion',
    title: '函数展开成幂级数：间接展开法',
    tag: '级数',
    level: '进阶',
    essence:
      '求展开式不必每次算泰勒系数。记住几个基本展开，再用代换、求导、积分、乘除把新函数化归到已知展开，这叫间接展开。',
    whenToUse: [
      '题目要求把函数展开成幂级数',
      '求幂级数的和函数（反方向用）',
      '近似计算或求高阶导数在零点的值',
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
    },
  },
  {
    id: 'tangent-plane',
    title: '多元函数的几何应用：切平面与法线',
    tag: '多元',
    level: '进阶',
    essence:
      '曲面在一点的切平面由梯度张成：把函数写成隐式方程，梯度就是法向量，切平面与法线都能直接写出来。',
    whenToUse: [
      '求曲面在某点的切平面或法线',
      '求曲线在空间中的切线',
      '用切平面做近似计算',
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
    },
  },
  {
    id: 'multi-integral-applications',
    title: '重积分的应用：质心、转动惯量与引力',
    tag: '重积分',
    level: '竞赛',
    essence:
      '重积分应用统一成「密度乘微元再累加」：质量是密度积分，质心是一阶矩除以质量，转动惯量是距离平方乘密度。',
    whenToUse: [
      '求平面薄片或空间立体的质量、质心',
      '求转动惯量',
      '求引力分量',
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
    },
  },
  {
    id: 'stokes-formula',
    title: '斯托克斯公式：旋度与环量',
    tag: '曲线与曲面积分',
    level: '竞赛',
    essence:
      '沿空间闭曲线的环流，等于曲面上旋度的通量。它把「沿边界走一圈」换成「在曲面上积分」，是高维版的格林公式。',
    whenToUse: [
      '空间闭曲线上的第二类曲线积分',
      '想用旋度判断场是否有势',
      '与高斯公式、格林公式一起构成三大公式',
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
    },
  },
  {
    id: 'joint-distribution',
    title: '多维随机变量：联合、边缘与独立',
    tag: '概率',
    level: '进阶',
    essence:
      '联合分布描述两个变量一起取值；把它们分别求和或积分就得到边缘分布。联合密度能写成两个单变量密度之积，才是独立。',
    whenToUse: [
      '题目给出联合分布律或联合密度',
      '求边缘分布、条件分布',
      '判断两个随机变量是否独立、求协方差',
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
    },
  },
  {
    id: 'sampling-distribution',
    title: '抽样分布：卡方、t 与 F 三个分布',
    tag: '概率',
    level: '进阶',
    essence:
      '统计推断靠三个由正态样本造出来的分布：方差比对应卡方，均值除以样本标准差对应 t，两个方差之比对应 F。',
    whenToUse: [
      '求样本均值的分布',
      '区间估计与假设检验要查分位数',
      '比较两组数据的方差',
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
    },
  },
  {
    id: 'hypothesis-testing',
    title: '假设检验：p 值与两类错误',
    tag: '概率',
    level: '进阶',
    essence:
      '假设检验先假定原假设成立，再看样本结果有多不可能。p 值就是这个不可能程度的量化；小于显著性水平就拒绝原假设。',
    whenToUse: [
      '判断均值、比例、方差是否等于某值',
      '比较两组数据是否有显著差异',
      '读懂论文或报告里的 p 值',
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
    ],
    example: {
      problem: '显著性水平取百分之五，计算得到 p 值 0.03，如何判断？',
      walkthrough: [
        '把 p 值与显著性水平比较。',
        '零点零三小于零点零五。',
        '因此拒绝原假设。',
      ],
      result: '拒绝原假设，认为差异显著。',
    },
  },
  {
    id: 'classical-probability',
    title: '古典概型：数得清才能算得准',
    tag: '概率',
    level: '进阶',
    essence:
      '古典概型要求样本点有限且等可能，概率就是有利结果数除以总结果数。难的不是公式，是把「结果」数对。',
    whenToUse: ['有限个等可能结果', '组合计数是主要工具', '几何概型则把计数换成面积比'],
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
    ],
    example: {
      problem: '袋中有 3 红 2 白，任取 2 个，求恰好 1 红 1 白的概率。',
      walkthrough: [
        '总取法是从 5 个里取 2 个，共 10 种。',
        '有利情形是 3 红取 1 乘 2 白取 1，共 6 种。',
        '概率为 6/10，即 3/5。',
      ],
      result: '概率为 3/5。',
    },
  },
  {
    id: 'normal-distribution',
    title: '正态分布：标准化与查表',
    tag: '概率',
    level: '进阶',
    essence:
      '正态分布由均值与标准差完全确定。任何正态都可以通过标准化变成标准正态，于是查一张表就能算所有概率。',
    whenToUse: ['题目给出正态分布求概率', '反过来由概率求分位数', '近似计算二项分布'],
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
    ],
    example: {
      problem: '已知成绩服从均值 70、标准差 10 的正态分布，求 80 分以上的比例。',
      walkthrough: [
        '标准化得 (80-70)/10 = 1。',
        '查表得小于 1 的概率约 0.841。',
        '因此大于 1 的概率约 0.159。',
      ],
      result: '约 15.9%。',
    },
  },
  {
    id: 'covariance-correlation',
    title: '协方差与相关系数',
    tag: '概率',
    level: '进阶',
    essence:
      '协方差衡量两个变量同向变动的程度，但带量纲；除以两个标准差得到相关系数，范围限定在负一到一。',
    whenToUse: ['判断两个变量是否线性相关', '计算组合方差', '回归分析的基础'],
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
    ],
    example: {
      problem: '两个变量独立且方差都为 1，求它们和的方差。',
      walkthrough: [
        '独立意味着协方差为零。',
        '和的方差等于两方差之和。',
        '结果为 2。',
      ],
      result: '方差为 2。',
    },
  },
  {
    id: 'statistics-basics',
    title: '样本与统计量：自由度从哪来',
    tag: '概率',
    level: '进阶',
    essence:
      '统计量是样本的函数。样本方差除以 n-1 而不是 n，是为了让它无偏——这背后是「用样本均值代替总体均值」损失了一个自由度。',
    whenToUse: ['理解样本均值与样本方差', '判断统计量是否无偏', '计算标准误'],
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
    ],
    example: {
      problem: '样本量 10，总体方差 4，求样本均值的方差。',
      walkthrough: [
        '均值方差是总体方差除以样本量。',
        '4 除以 10。',
        '结果为 0.4。',
      ],
      result: '方差为 0.4。',
    },
  },
  {
    id: 'maximum-likelihood',
    title: '最大似然估计：让数据最可能出现',
    tag: '概率',
    level: '进阶',
    essence:
      '最大似然的思想是：既然观测到了这组数据，就选让这组数据出现概率最大的参数。做法是写似然函数、取对数、求导置零。',
    whenToUse: ['求未知参数的估计量', '题目出现「样本来自某分布」', '与矩估计对比'],
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
    ],
    example: {
      problem: '样本来自指数分布，参数为 λ，求 λ 的最大似然估计。',
      walkthrough: [
        '似然函数是 λ 的 n 次方乘指数项。',
        '取对数后求导。',
        '解出估计量等于样本均值的倒数。',
      ],
      result: '估计量为样本均值的倒数。',
    },
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
