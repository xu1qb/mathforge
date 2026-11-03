// EXPORTS: TOPIC_DETAIL_DATA, getTopicDetail, type TopicDetailData, type TopicExample, type TopicQuestionType, type TopicKnowledgePoint
// 竞赛专题详细内容（知识点细项 + 题型 + 例题）
// 公式用 LaTeX 语法表示，用 MathRenderer 渲染

export interface TopicExample {
  id: string;
  /** 题目（LaTeX 字符串） */
  problem: string;
  /** 解析步骤，分步展示 */
  steps: string[];
  /** 关键技巧提示 */
  tip?: string;
  /** 答案（最终结果，LaTeX） */
  answer: string;
}

export interface TopicQuestionType {
  id: string;
  /** 题型名称 */
  title: string;
  /** 方法简述 */
  method: string;
  /** 经典例题 */
  examples: TopicExample[];
}

export interface TopicKnowledgePoint {
  id: string;
  /** 知识点名称 */
  name: string;
  /** 简要说明（一句话） */
  description?: string;
  /** 相关公式（LaTeX，用于快速查阅） */
  formulas?: string[];
}

export interface TopicDetailData {
  topicKey: string;
  /** 知识点细项（可单独勾选掌握） */
  knowledgePoints: TopicKnowledgePoint[];
  /** 常考题型与方法 */
  questionTypes: TopicQuestionType[];
  /** 易错点 */
  pitfalls: string[];
}

// ========== 专题一：函数、极限与连续 ==========
const LIMIT_CONTINUITY_DETAIL: TopicDetailData = {
  topicKey: 'limit-continuity',
  knowledgePoints: [
    {
      id: 'k1',
      name: '函数的基本性质',
      description: '基本初等函数、复合函数、反函数；奇偶性、周期性、有界性',
      formulas: ['f(-x)=f(x)\\text{ 偶函数}', 'f(-x)=-f(x)\\text{ 奇函数}'],
    },
    {
      id: 'k2',
      name: '极限的概念与 ε-δ 语言',
      description: '极限定义、左极限右极限、极限存在的充要条件',
      formulas: ['\\lim_{x\\to x_0}f(x)=A\\iff \\lim_{x\\to x_0^-}f(x)=\\lim_{x\\to x_0^+}f(x)=A'],
    },
    {
      id: 'k3',
      name: '极限四则运算法则',
      description: '和差积商的极限，前提是各极限存在',
    },
    {
      id: 'k4',
      name: '两个重要极限',
      description: 'sin(x)/x → 1 与 (1+x)^(1/x) → e 及其变形',
      formulas: ['\\lim_{x\\to 0}\\frac{\\sin x}{x}=1', '\\lim_{x\\to \\infty}\\left(1+\\frac{1}{x}\\right)^x=e'],
    },
    {
      id: 'k5',
      name: '等价无穷小代换',
      description: '乘除因子可代换，常见等价无穷小表',
      formulas: ['\\sin x\\sim x', '\\tan x\\sim x', '1-\\cos x\\sim \\frac{x^2}{2}', 'e^x-1\\sim x', '\\ln(1+x)\\sim x'],
    },
    {
      id: 'k6',
      name: '洛必达法则',
      description: '0/0 与 ∞/∞ 型的洛必达法则及条件',
    },
    {
      id: 'k7',
      name: '泰勒展开求极限',
      description: '麦克劳林展开，展开阶数选择（凑分母阶数）',
      formulas: ['e^x=1+x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\cdots', '\\sin x=x-\\frac{x^3}{3!}+\\frac{x^5}{5!}-\\cdots'],
    },
    {
      id: 'k8',
      name: '夹逼准则与单调有界准则',
      description: '数列极限的两大存在性准则，竞赛高频',
      formulas: ['y_n\\le x_n\\le z_n\\text{ 且 }\\lim y_n=\\lim z_n=A\\Rightarrow\\lim x_n=A'],
    },
    {
      id: 'k9',
      name: '无穷小的比较',
      description: '高阶、低阶、同阶、等价无穷小的定义',
    },
    {
      id: 'k10',
      name: '函数的连续性与间断点分类',
      description: '连续定义、第一类间断点（可去/跳跃）、第二类间断点（无穷/振荡）',
    },
    {
      id: 'k11',
      name: '闭区间连续函数性质',
      description: '最值定理、介值定理、零点定理',
      formulas: ['f(a)\\cdot f(b)<0\\Rightarrow\\exists\\xi\\in(a,b),f(\\xi)=0'],
    },
  ],
  questionTypes: [
    {
      id: 'qt1',
      title: '0/0 型极限（等价代换 + 泰勒组合）',
      method: '分子分母均趋于 0 时，优先考虑等价无穷小代换简化乘除因子；加减项用泰勒展开精确到所需阶数。竞赛题常需两者结合。',
      examples: [
        {
          id: 'ex1',
          problem: '\\lim_{x\\to 0}\\frac{\\tan x - \\sin x}{x^3}',
          steps: [
            '原式 = \\lim_{x\\to 0}\\frac{\\sin x(\\frac{1}{\\cos x}-1)}{x^3} = \\lim_{x\\to 0}\\frac{\\sin x(1-\\cos x)}{x^3\\cos x}',
            '利用等价无穷小：\\sin x\\sim x,\\; 1-\\cos x\\sim \\frac{x^2}{2},\\; \\cos x\\to 1',
            '代入得：\\lim_{x\\to 0}\\frac{x\\cdot \\frac{x^2}{2}}{x^3\\cdot 1} = \\frac{1}{2}',
          ],
          tip: '【陷阱】若直接对 tan x 和 sin x 都代换为 x，则分子为 x - x = 0，得到错误结果 0。加减项不能随意代换！',
          answer: '\\frac{1}{2}',
        },
        {
          id: 'ex2',
          problem: '\\lim_{x\\to 0}\\frac{e^x - 1 - x - \\frac{x^2}{2}}{x^3}',
          steps: [
            '分母是三阶，将 e^x 泰勒展开到 x³ 项：e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + o(x^3)',
            '代入分子：e^x - 1 - x - \\frac{x^2}{2} = \\frac{x^3}{6} + o(x^3)',
            '原式 = \\lim_{x\\to 0}\\frac{\\frac{x^3}{6} + o(x^3)}{x^3} = \\frac{1}{6}',
          ],
          tip: '泰勒展开的阶数选择口诀：展开到「分母的阶数 + 1 阶」，保证分子最低阶非零项不被抵消遗漏。',
          answer: '\\frac{1}{6}',
        },
      ],
    },
    {
      id: 'qt2',
      title: '1^∞ 型极限（凑重要极限 / 取对数）',
      method: '1^∞ 型极限有两种万能方法：① 凑第二个重要极限 (1+u)^(1/u) → e；② 取指数 e^lim(v·ln u)，将幂指函数化为 0·∞ 再转 0/0。',
      examples: [
        {
          id: 'ex1',
          problem: '\\lim_{x\\to 0}(1+\\sin x)^{\\frac{1}{x}}',
          steps: [
            '这是 1^∞ 型。变形为重要极限形式：(1+u)^{\\frac{1}{u}\\cdot\\frac{u}{x}}',
            '令 u = \\sin x，则 (1+\\sin x)^{\\frac{1}{x}} = \\left[(1+\\sin x)^{\\frac{1}{\\sin x}}\\right]^{\\frac{\\sin x}{x}}',
            '由重要极限：(1+\\sin x)^{\\frac{1}{\\sin x}} \\to e，且 \\frac{\\sin x}{x} \\to 1',
            '由指数函数连续性，极限为 e^1 = e',
          ],
          tip: '也可直接取对数：原式 = \\exp\\left(\\lim\\frac{\\ln(1+\\sin x)}{x}\\right)，再用等价 ln(1+sinx) ~ sinx ~ x 得极限为 e。',
          answer: 'e',
        },
      ],
    },
    {
      id: 'qt3',
      title: '∞ - ∞ 型极限（有理化 / 通分）',
      method: '两个无穷大相减，需通过有理化（带根号时）、通分（分式情形）、或提取公因子化为 0/0 或 0·∞ 型。',
      examples: [
        {
          id: 'ex1',
          problem: '\\lim_{x\\to +\\infty}\\left(\\sqrt{x^2+x} - x\\right)',
          steps: [
            '∞ - ∞ 型，分子有理化：乘以 \\frac{\\sqrt{x^2+x}+x}{\\sqrt{x^2+x}+x}',
            '原式 = \\lim_{x\\to +\\infty}\\frac{(x^2+x)-x^2}{\\sqrt{x^2+x}+x} = \\lim_{x\\to +\\infty}\\frac{x}{\\sqrt{x^2+x}+x}',
            '分子分母同除以 x：= \\lim_{x\\to +\\infty}\\frac{1}{\\sqrt{1+\\frac{1}{x}}+1}',
            '代入得 \\frac{1}{\\sqrt{1}+1} = \\frac{1}{2}',
          ],
          tip: '看到根号减根号或根号减多项式，第一反应就是有理化。竞赛中常出现在 x→∞ 的二次/高次根式差。',
          answer: '\\frac{1}{2}',
        },
      ],
    },
    {
      id: 'qt4',
      title: '0 · ∞ 型（倒数转换）',
      method: '将其中一个因子取倒数放到分母，转化为 0/0 或 ∞/∞ 型，再用洛必达或等价代换。选哪个做分母以简化计算为原则。',
      examples: [
        {
          id: 'ex1',
          problem: '\\lim_{x\\to 0^+}x\\ln x',
          steps: [
            '0 · ∞ 型，改写为 \\frac{\\ln x}{1/x}（∞/∞ 型），适用洛必达',
            '由洛必达法则：\\lim_{x\\to 0^+}\\frac{\\ln x}{1/x} = \\lim_{x\\to 0^+}\\frac{1/x}{-1/x^2}',
            '化简：= \\lim_{x\\to 0^+}(-x) = 0',
          ],
          tip: '注意：把 ln x 放分母会更难算（1/lnx 导数复杂）。经验：对数一般放分子，多项式放分母。',
          answer: '0',
        },
      ],
    },
    {
      id: 'qt5',
      title: '含变上限积分的极限（洛必达）',
      method: 'x→0 时变上限积分一般也是无穷小，分子分母均为无穷小，用洛必达法则。对积分上限函数求导用变上限积分求导公式：d/dx ∫_a^φ(x) f(t)dt = f(φ(x))·φ\'(x)。',
      examples: [
        {
          id: 'ex1',
          problem: '\\lim_{x\\to 0}\\frac{\\int_0^x \\sin(t^2)dt}{x^3}',
          steps: [
            'x→0 时，分子分母都→0，为 0/0 型，使用洛必达法则',
            '分子求导（变上限积分求导公式）：\\frac{d}{dx}\\int_0^x\\sin(t^2)dt = \\sin(x^2)',
            '分母求导：3x²',
            '原式 = \\lim_{x\\to 0}\\frac{\\sin(x^2)}{3x^2} = \\lim_{x\\to 0}\\frac{x^2}{3x^2} = \\frac{1}{3}（其中 sin(x²)~x²）',
          ],
          tip: '竞赛中变上限积分几乎必考，且常常和等价无穷小结合，求导后再用一次等价代换可以大幅简化。',
          answer: '\\frac{1}{3}',
        },
      ],
    },
    {
      id: 'qt6',
      title: '分段函数极限与连续性讨论（求参数）',
      method: '分段函数在分段点的极限：左右极限分别计算，极限存在 ⟺ 左右极限相等且有限。连续还需等于函数值。求参数 a,b 时建立方程组即可。',
      examples: [
        {
          id: 'ex1',
          problem: '设 f(x)=\\begin{cases}\\dfrac{\\sin 2x + e^{2ax}-1}{x}, & x<0 \\\\ b, & x=0 \\\\ \\dfrac{\\ln(1+x)}{x}, & x>0\\end{cases} 在 x=0 连续，求 a,b。',
          steps: [
            '右极限：f(0^+) = \\lim_{x\\to 0^+}\\frac{\\ln(1+x)}{x} = \\lim\\frac{x}{x} = 1（等价代换 ln(1+x)~x）',
            '左极限：f(0^-) = \\lim_{x\\to 0^-}\\frac{\\sin 2x + e^{2ax}-1}{x}',
            '分子拆为两项：\\frac{\\sin 2x}{x} + \\frac{e^{2ax}-1}{x} \\to 2 + 2a',
            '连续需要 f(0^-) = f(0^+) = f(0)，即 2+2a = 1 = b',
            '解得 a = -\\frac{1}{2},\\; b = 1',
          ],
          tip: '分段点一定用左右极限分别求！直接代入某一分支表达式会遗漏单侧情形。',
          answer: 'a=-\\frac{1}{2},\\; b=1',
        },
      ],
    },
    {
      id: 'qt7',
      title: '数列极限（递推 / 夹逼 / 单调有界 / 定积分定义）',
      method: '数列极限是竞赛的重头戏。常用方法：① 单调有界准则（先证收敛再求极限）② 夹逼准则（放缩找两端）③ 定积分定义化（求和型）④ Stolz 定理（离散洛必达）。',
      examples: [
        {
          id: 'ex1',
          problem: '设 a_1=\\sqrt{2},\\; a_{n+1}=\\sqrt{2+a_n}，证明 \\{a_n\\} 收敛并求其极限。',
          steps: [
            '【有界性】用数学归纳法：a₁ = √2 < 2。设 a_n < 2，则 a_{n+1} = √(2+a_n) < √(2+2) = 2。故 a_n < 2。',
            '【单调性】a_{n+1} - a_n = √(2+a_n) - a_n = \\frac{(2+a_n)-a_n^2}{√(2+a_n)+a_n} = \\frac{-(a_n-2)(a_n+1)}{√(2+a_n)+a_n} > 0（因 a_n<2）',
            '由单调有界准则，{a_n} 收敛。设 lim a_n = A，对递推式两边取极限：A = √(2+A)',
            '平方得 A² = 2 + A，即 A² - A - 2 = 0，解得 A=2 或 A=-1（舍去）',
          ],
          tip: '单调有界准则必须**先证明收敛**再求极限，否则可能得到错误结果（如发散数列也能解出不动点）。这是竞赛阅卷扣分重灾区。',
          answer: '\\lim_{n\\to\\infty}a_n = 2',
        },
      ],
    },
    {
      id: 'qt8',
      title: '零点定理与介值定理证明题',
      method: '证明函数有零点或取到某个值时，构造辅助函数 F(x) = f(x) - c，然后在合适区间上应用零点定理。竞赛中常结合极限的符号分析（端点趋向正负无穷）。',
      examples: [
        {
          id: 'ex1',
          problem: '证明方程 x - e^{-x} = 0 在 (0,1) 内至少有一个实根。',
          steps: [
            '令 f(x) = x - e^{-x}，f(x) 在 [0,1] 上连续',
            'f(0) = 0 - e^0 = -1 < 0',
            'f(1) = 1 - e^{-1} = 1 - \\frac{1}{e} > 0（因为 e>1）',
            '由零点定理，∃ ξ ∈ (0,1)，使得 f(ξ) = 0，即 ξ - e^{-ξ} = 0',
          ],
          tip: '零点定理的关键在于找函数值异号的两点。竞赛中常需要用极限、已知函数值、或者对称性来构造符号。',
          answer: '存在唯一实根 \\xi\\in(0,1)',
        },
      ],
    },
  ],
  pitfalls: [
    '等价无穷小在加减项中滥用（如 tanx - sinx 不能直接代换为 x - x = 0）',
    '重要极限 1^∞ 型漏掉指数上的极限计算',
    '洛必达法则使用前不检查类型（不是 0/0 或 ∞/∞ 直接用会出错）',
    '洛必达失效时强行使用（如含 sin/cos 的振荡型极限）',
    '数列极限先求极限再证收敛（逻辑顺序颠倒，应该单调有界准则先证收敛）',
    '间断点分类时忽略左右极限的存在性判断',
    '泰勒展开阶数不够导致低阶项抵消后只剩高阶误差',
  ],
};

// ========== 专题二：一元函数微分学 ==========
const SINGLE_VAR_DIFF_DETAIL: TopicDetailData = {
  topicKey: 'single-var-diff',
  knowledgePoints: [
    {
      id: 'k1',
      name: '导数的定义',
      description: 'f\'(x₀) = lim(Δx→0) [f(x₀+Δx)-f(x₀)]/Δx，可导与连续的关系',
      formulas: ['f\'(x_0)=\\lim_{\\Delta x\\to 0}\\frac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x}'],
    },
    {
      id: 'k2',
      name: '求导法则',
      description: '四则运算法则、复合函数链式法则、反函数求导',
      formulas: ['(uv)\'=u\'v+uv\'', '\\left(\\frac{u}{v}\\right)\'=\\frac{u\'v-uv\'}{v^2}', '\\frac{dy}{dx}=\\frac{dy}{du}\\cdot\\frac{du}{dx}'],
    },
    {
      id: 'k3',
      name: '隐函数与参数方程求导',
      description: '隐函数 F(x,y)=0 两边对 x 求导；参数方程 x=φ(t), y=ψ(t) 时 dy/dx = ψ\'(t)/φ\'(t)',
    },
    {
      id: 'k4',
      name: '高阶导数与莱布尼茨公式',
      description: 'n 阶导数、莱布尼茨公式 (uv)^(n) = Σ C(n,k) u^(k) v^(n-k)',
      formulas: ['(uv)^{(n)}=\\sum_{k=0}^n\\binom{n}{k}u^{(k)}v^{(n-k)}'],
    },
    {
      id: 'k5',
      name: '常见函数的 n 阶导数',
      description: 'e^x、sinx、cosx、x^n、ln(1+x)、1/(1+x) 等的 n 阶导数公式',
      formulas: ['(e^x)^{(n)}=e^x', '(\\sin x)^{(n)}=\\sin\\left(x+n\\cdot\\frac{\\pi}{2}\\right)', '(x^\\alpha)^{(n)}=\\alpha(\\alpha-1)\\cdots(\\alpha-n+1)x^{\\alpha-n}'],
    },
    {
      id: 'k6',
      name: '微分中值定理',
      description: 'Rolle 定理、Lagrange 中值定理、Cauchy 中值定理',
      formulas: ['\\exists\\xi\\in(a,b),\\; f\'(\\xi)=\\frac{f(b)-f(a)}{b-a}\\text{（Lagrange）}'],
    },
    {
      id: 'k7',
      name: '泰勒公式',
      description: '带 Peano 余项和 Lagrange 余项的泰勒展开，麦克劳林展开',
      formulas: ['f(x)=f(x_0)+f\'(x_0)(x-x_0)+\\cdots+\\frac{f^{(n)}(x_0)}{n!}(x-x_0)^n+R_n(x)'],
    },
    {
      id: 'k8',
      name: '洛必达法则',
      description: '0/0 型与 ∞/∞ 型的洛必达法则及条件',
    },
    {
      id: 'k9',
      name: '函数的单调性与极值',
      description: '一阶导数判定单调性，一阶/二阶导数判定极值，最值求法',
    },
    {
      id: 'k10',
      name: '凹凸性与拐点',
      description: '二阶导数判定凹凸性，拐点的定义与求法',
    },
    {
      id: 'k11',
      name: '渐近线与函数作图',
      description: '水平渐近线、垂直渐近线、斜渐近线；函数图像描绘步骤',
    },
  ],
  questionTypes: [
    {
      id: 'qt1',
      title: 'n 阶导数求法（归纳法 / 莱布尼茨 / 泰勒）',
      method: 'n 阶导数三大方法：① 数学归纳法（求前几阶找规律）② 莱布尼茨公式（乘积形式）③ 利用泰勒展开系数比较（复杂函数）。竞赛中常结合三角函数、指数函数的周期性。',
      examples: [
        {
          id: 'ex1',
          problem: '求 y = \\sin x 的 n 阶导数。',
          steps: [
            '一阶：y\' = \\cos x = \\sin(x + \\frac{\\pi}{2})',
            '二阶：y\'\' = -\\sin x = \\sin(x + 2\\cdot\\frac{\\pi}{2})',
            '三阶：y\'\'\' = -\\cos x = \\sin(x + 3\\cdot\\frac{\\pi}{2})',
            '由数学归纳法可证：y^{(n)} = \\sin\\left(x + n\\cdot\\frac{\\pi}{2}\\right)',
          ],
          tip: '类似地，cosx 的 n 阶导数为 cos(x + n·π/2)。记忆口诀：每次求导相位加 π/2。',
          answer: 'y^{(n)} = \\sin\\left(x + \\frac{n\\pi}{2}\\right)',
        },
        {
          id: 'ex2',
          problem: '设 y = x^2 e^x，求 y^{(n)}。',
          steps: [
            '使用莱布尼茨公式：(uv)^{(n)} = Σ_{k=0}^n C(n,k) u^{(k)} v^{(n-k)}',
            '令 u = x²，v = e^x。则 u\' = 2x，u\'\' = 2，u^{(k)} = 0（k≥3）；v^{(n-k)} = e^x',
            'y^{(n)} = C(n,0)x²·e^x + C(n,1)·2x·e^x + C(n,2)·2·e^x + 0 + ...',
            '= e^x\\left[x^2 + 2nx + n(n-1)\\right]',
          ],
          tip: '当 u 是低次多项式时，k 超过多项式次数的项都为 0，莱布尼茨公式只需求前几项。',
          answer: 'y^{(n)} = e^x[x^2 + 2nx + n(n-1)]',
        },
      ],
    },
    {
      id: 'qt2',
      title: '中值定理证明题：辅助函数构造法',
      method: '证明 ∃ξ 满足含 f\'(ξ) 的等式。常用套路：① 把等式移项为 F\'(ξ)=0 的形式 ② 积分/凑微分找原函数 F(x) ③ 乘积分因子 e^∫p(x)dx（遇到 f\' + p(x)f 形式） ④ 验证 F(x) 满足 Rolle 条件。',
      examples: [
        {
          id: 'ex1',
          problem: '设 f(x) 在 [a,b] 连续，在 (a,b) 可导，f(a)=f(b)=0。证明：∃ξ∈(a,b)，使得 f\'(ξ) + 2f(ξ) = 0。',
          steps: [
            '【分析】目标式形如 f\' + p(x)f = 0，乘积分因子 e^{∫2dx} = e^{2x}',
            '构造辅助函数 F(x) = e^{2x}·f(x)',
            'F(x) 在 [a,b] 连续，在 (a,b) 可导',
            'F(a) = e^{2a}·f(a) = 0，F(b) = e^{2b}·f(b) = 0',
            '由 Rolle 定理，∃ξ∈(a,b)，使得 F\'(ξ) = 0',
            'F\'(x) = 2e^{2x}f(x) + e^{2x}f\'(x) = e^{2x}[2f(x)+f\'(x)]',
            '因 e^{2ξ} ≠ 0，故 f\'(ξ) + 2f(ξ) = 0',
          ],
          tip: '遇到 f\'(ξ) + k·f(ξ) = 0 型，构造 F(x) = e^{kx}f(x) 是标准套路。遇到 f·g\' + f\'·g 型，构造 F = f·g。',
          answer: '由 Rolle 定理得证',
        },
      ],
    },
    {
      id: 'qt3',
      title: '双中值问题（两次中值定理）',
      method: '证明存在两个不同的中值 ξ, η 满足某等式。方法：① 在不同区间各用一次中值定理 ② 或者用 Lagrange 一次 + Cauchy 一次 ③ 竞赛题有时需要构造两个不同的辅助函数。',
      examples: [
        {
          id: 'ex1',
          problem: '设 f(x) 在 [0,1] 上连续，在 (0,1) 内可导，且 f(0)=0,\ f(1)=1。证明：存在两个不同的点 \\xi,\\eta\\in(0,1)，使得 f\'(\\xi)+f\'(\\eta)=2。',
          steps: [
            '由介值定理，因 f(0)=0 < \\frac{1}{2} < 1 = f(1) 且 f 连续，故存在 c\\in(0,1)，使得 f(c) = \\frac{1}{2}',
            '在 [0,c] 上应用 Lagrange 中值定理：存在 \\xi\\in(0,c)，使得',
            'f\'(\\xi) = \\frac{f(c)-f(0)}{c-0} = \\frac{f(c)}{c} = \\frac{1}{2c}',
            '在 [c,1] 上应用 Lagrange 中值定理：存在 \\eta\\in(c,1)，使得',
            'f\'(\\eta) = \\frac{f(1)-f(c)}{1-c} = \\frac{1-f(c)}{1-c} = \\frac{1}{2(1-c)}',
            '两式相加：f\'(\\xi) + f\'(\\eta) = \\frac{1}{2c} + \\frac{1}{2(1-c)} = \\frac{1}{2c(1-c)}',
            '注意：若直接取 c = \\frac{1}{2}，则 f\'(\\xi) = 1,\ f\'(\\eta) = 1，此时 f\'(\\xi)+f\'(\\eta)=2，但 \\xi 和 \\eta 可能相等。',
            '【更稳妥的构造】用两个不同的中值定理。对 f 和 g(x)=x 在 [0,1] 用 Lagrange 得 f\'(\\xi)=1。再对 f 和 h(x)=x^2 用 Cauchy：\\frac{f(1)-f(0)}{1-0}=\\frac{f\'(\\eta)}{2\\eta}，即 f\'(\\eta)=2\\eta。选取合适的 \\eta 即可得到不同的两点。',
            '【最简竞赛解】取 c=\\frac{1}{2}。若 f\'(\\frac{1}{2}) \\neq 1，则左右两区间的 \\xi, \\eta 分别在 (0,\\frac{1}{2}) 和 (\\frac{1}{2},1)，自然不同。若 f\'(\\frac{1}{2})=1，则可在 (\\frac{1}{2},1) 内另找一点使用中值定理。综合得证。',
          ],
          tip: '双中值问题核心技巧：① 介值定理找中间点将区间分段 ② 每段分别用中值定理 ③ 确保两个中值落在不同子区间从而保证不同。竞赛常考 f\'(\\xi)+f\'(\\eta)=常数 形式。',
          answer: '存在不同的 \\xi,\\eta\\in(0,1)，使得 f\'(\\xi) + f\'(\\eta) = 2',
        },
      ],
    },
    {
      id: 'qt4',
      title: '泰勒展开的应用（求极限 / 证明不等式）',
      method: '泰勒展开是竞赛神器，应用广泛：① 求极限（展开到足够阶数）② 证明不等式（展开到二阶，利用余项符号）③ 中值定理推广（带 Lagrange 余项的泰勒）。关键：选好展开点 x₀ 和展开阶数。',
      examples: [
        {
          id: 'ex1',
          problem: '证明：对一切实数 x，有 e^x \\geq 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}，当且仅当 x = 0 时等号成立。',
          steps: [
            '令 f(x) = e^x - 1 - x - \\frac{x^2}{2} - \\frac{x^3}{6}，只需证明 f(x) \\geq 0，且等号仅在 x=0 时成立。',
            '求一阶导数：f\'(x) = e^x - 1 - x - \\frac{x^2}{2}',
            '求二阶导数：f\'\'(x) = e^x - 1 - x',
            '求三阶导数：f\'\'\'(x) = e^x - 1',
            '分析 f\'\'\'(x)：当 x > 0 时，e^x > 1，故 f\'\'\'(x) > 0；当 x < 0 时，e^x < 1，故 f\'\'\'(x) < 0；f\'\'\'(0) = 0。',
            '因此 f\'\'(x) 在 (-\\infty,0) 递减，在 (0,+\\infty) 递增，最小值为 f\'\'(0) = 0。故 f\'\'(x) \\geq 0 对一切 x 成立，等号仅在 x=0 时成立。',
            '由 f\'\'(x) \\geq 0 知 f\'(x) 在 \\mathbb{R} 上单调递增。又 f\'(0) = 0，故：',
            'x < 0 时，f\'(x) < f\'(0) = 0；x > 0 时，f\'(x) > f\'(0) = 0。',
            '因此 f(x) 在 (-\\infty,0) 递减，在 (0,+\\infty) 递增，最小值为 f(0) = 0。',
            '故 f(x) \\geq f(0) = 0，即 e^x \\geq 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}，且仅当 x = 0 时等号成立。',
            '【泰勒观点】e^x = \\sum_{n=0}^\\infty \\frac{x^n}{n!}，展开到三阶带 Lagrange 余项：e^x = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + \\frac{e^\\xi}{24}x^4，其中 \\xi 在 0 与 x 之间。因 e^\\xi > 0 且 x^4 \\geq 0，余项非负，立即得证。',
          ],
          tip: '用泰勒证明不等式的关键是选对展开阶数，确保余项符号确定（如四阶余项 x^4 恒非负）。单调性法是更基础更稳妥的竞赛方法，建议掌握。',
          answer: 'e^x \\geq 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}（\\forall x\\in\\mathbb{R}），等号仅在 x=0 时成立',
        },
      ],
    },
    {
      id: 'qt5',
      title: '不等式证明（拉格朗日 / 柯西中值）',
      method: '不等式证明的微分方法：① 拉格朗日中值定理（f(b)-f(a) = f\'(ξ)(b-a)，估计 f\'(ξ) 的范围）② 柯西中值定理（两个函数的差商比）③ 单调性法（求导判增减）④ 最值法（找最小值大于某值）。',
      examples: [
        {
          id: 'ex1',
          problem: '证明：当 0 < a < b 时，\\frac{b-a}{b} < \\ln\\frac{b}{a} < \\frac{b-a}{a}。',
          steps: [
            '考虑 f(x) = ln x，在 [a,b] 上应用拉格朗日中值定理',
            '∃ξ∈(a,b)，使得 f(b) - f(a) = f\'(ξ)(b-a)',
            '即 ln b - ln a = \\frac{1}{ξ}(b - a)，即 \\ln\\frac{b}{a} = \\frac{b-a}{ξ}',
            '因 a < ξ < b，所以 \\frac{1}{b} < \\frac{1}{ξ} < \\frac{1}{a}',
            '两边乘以正数 (b-a)：\\frac{b-a}{b} < \\frac{b-a}{ξ} < \\frac{b-a}{a}',
            '代入即得：\\frac{b-a}{b} < \\ln\\frac{b}{a} < \\frac{b-a}{a}',
          ],
          tip: '看到形如 f(b)-f(a) 的差与 g(b)-g(a) 的比值，第一反应就是拉格朗日或柯西中值定理。这是竞赛证明题的经典模板。',
          answer: '由拉格朗日中值定理得证',
        },
      ],
    },
    {
      id: 'qt6',
      title: '极值最值应用题',
      method: '实际问题求最值步骤：① 建立目标函数 ② 确定定义域 ③ 求导找驻点 ④ 结合端点和驻点判断最值。竞赛题常设陷阱：定义域边界、不可导点、多个驻点的取舍。',
      examples: [
        {
          id: 'ex1',
          problem: '将一块边长为 a 的正方形铁皮，四角各剪去一个同样大小的正方形，折成无盖方盒。问剪去多大时方盒容积最大？',
          steps: [
            '设剪去的正方形边长为 x，则折成的盒子底面边长为 a-2x，高为 x',
            '容积 V(x) = x(a-2x)²，定义域为 0 < x < a/2',
            '求导：V\'(x) = (a-2x)² + x·2(a-2x)·(-2) = (a-2x)² - 4x(a-2x)',
            '= (a-2x)(a-2x-4x) = (a-2x)(a-6x)',
            '令 V\'(x)=0，解得 x = a/2（舍去，V=0）或 x = a/6',
            '二阶导数或单调性判断：当 0<x<a/6 时 V\'>0，a/6<x<a/2 时 V\'<0，故 x=a/6 是极大值点也是最大值点',
          ],
          tip: '一元函数极值问题看似简单，但竞赛中常出现在应用题中，关键在于正确建立目标函数和定义域。注意验证边界！',
          answer: '剪去边长为 \\frac{a}{6} 的正方形时容积最大',
        },
      ],
    },
    {
      id: 'qt7',
      title: '含参数函数性质讨论',
      method: '讨论 f(x, a) = 0 的根的个数或极值个数随参数 a 的变化。方法：① 求导找驻点 ② 计算各驻点函数值 ③ 分析极限趋势 ④ 画出示意图，根据参数变化确定根的个数。',
      examples: [
        {
          id: 'ex1',
          problem: '讨论方程 \\ln x = ax（a > 0）有几个实根。',
          steps: [
            '令 f(x) = ln x - ax，定义域 x > 0',
            'f\'(x) = \\frac{1}{x} - a，令 f\'(x) = 0 得唯一驻点 x = 1/a',
            'f\'\'(x) = -1/x² < 0，故 x = 1/a 是极大值点也是最大值点',
            '最大值 f(1/a) = ln(1/a) - a·(1/a) = -ln a - 1',
            '极限趋势：x→0+ 时 f(x)→-∞；x→+∞ 时 ln x 增长慢于 ax，f(x)→-∞',
            '分情况讨论：',
            '① 最大值 > 0，即 -ln a - 1 > 0 → a < 1/e → 两个实根',
            '② 最大值 = 0，即 a = 1/e → 一个实根（重根）',
            '③ 最大值 < 0，即 a > 1/e → 无实根',
          ],
          tip: '含参数讨论题的标准步骤：找驻点→算最值→看极限→画图像→分情况。画图辅助思考是关键，竞赛中切勿只算不画。',
          answer: 'a<1/e 时 2 个根；a=1/e 时 1 个根；a>1/e 时无实根',
        },
      ],
    },
    {
      id: 'qt8',
      title: '洛必达与中值定理综合',
      method: '洛必达本质上是柯西中值定理的推论。竞赛题常将两者结合：先用中值定理做变量替换，再用洛必达或其他方法。也常见于证明题（如 0/0 型时 f(0)=g(0)=0 的条件）。',
      examples: [
        {
          id: 'ex1',
          problem: '设 f(x) 在 x=0 处二阶可导，f(0)=0，f\'(0)=0，f\'\'(0)=2。求 \\lim_{x\\to 0}\\frac{f(x)}{x^2}。',
          steps: [
            '方法一（洛必达）：0/0 型，洛必达一次：\\lim_{x\\to 0}\\frac{f\'(x)}{2x}',
            '还是 0/0 型（因 f\'(0)=0），再洛必达一次：\\lim_{x\\to 0}\\frac{f\'\'(x)}{2}',
            '【注意】此处需要 f\'\' 在 0 处连续才能直接代入 f\'\'(0)。题目只说二阶可导（不一定连续）。',
            '方法二（泰勒展开）：f(x) = f(0) + f\'(0)x + \\frac{f\'\'(0)}{2!}x² + o(x²)',
            '= 0 + 0 + \\frac{2}{2}x² + o(x²) = x² + o(x²)',
            '所以 \\frac{f(x)}{x²} = 1 + o(1) → 1',
            '方法三更严谨：一次洛必达后用导数定义：\\lim_{x\\to 0}\\frac{f\'(x)}{2x} = \\frac{1}{2}\\lim_{x\\to 0}\\frac{f\'(x)-f\'(0)}{x-0} = \\frac{1}{2}f\'\'(0) = 1',
          ],
          tip: '洛必达法则要求导函数的极限存在。当只有"二阶可导"（不是二阶连续可导）时，只能用一次洛必达，再用导数定义。这是竞赛常考的细节陷阱！',
          answer: '1',
        },
      ],
    },
  ],
  pitfalls: [
    '中值定理使用前不验证条件（闭区间连续、开区间可导等）',
    '洛必达法则滥用：非 0/0 或 ∞/∞ 型也用，或者连续使用超过必要次数',
    '只有"二阶可导"条件时用两次洛必达（只能用一次，第二次要用导数定义或泰勒）',
    '辅助函数构造时积分因子选错（e^∫p(x)dx 不要漏负号）',
    '极值与最值混淆：极值是局部概念，最值是全局概念',
    '凹凸性判定搞反：f\'\'>0 是凹（下凸），f\'\'<0 是凸（上凸）',
    '拐点判断只看 f\'\'=0，不检查两侧凹凸性是否改变',
    'n 阶导数莱布尼茨公式记错组合数位置',
  ],
};

// ========== 专题三：一元函数积分学 ==========
const SINGLE_VAR_INT_DETAIL: TopicDetailData = {
  topicKey: 'single-var-int',
  knowledgePoints: [
    {
      id: 'k1',
      name: '原函数与不定积分概念',
      description: '原函数定义、不定积分定义、基本积分表',
      formulas: ['\\int kdx=kx+C', '\\int x^\\alpha dx=\\frac{x^{\\alpha+1}}{\\alpha+1}+C(\\alpha\\neq-1)', '\\int\\frac{1}{x}dx=\\ln|x|+C'],
    },
    {
      id: 'k2',
      name: '换元积分法',
      description: '第一类换元（凑微分）、第二类换元（变量替换）',
      formulas: ['\\int f[\\varphi(x)]\\varphi\'(x)dx=\\int f(u)du\;(u=\\varphi(x))'],
    },
    {
      id: 'k3',
      name: '分部积分法',
      description: '∫u dv = uv - ∫v du，适用于乘积形式积分',
      formulas: ['\\int u\,dv = uv - \\int v\,du'],
    },
    {
      id: 'k4',
      name: '有理函数与三角有理式积分',
      description: '部分分式分解、万能代换（tan(x/2)）',
    },
    {
      id: 'k5',
      name: '定积分概念与性质',
      description: '黎曼和定义、线性性、区间可加性、保号性、估值定理',
      formulas: ['\\int_a^b f(x)dx = \\lim_{\\lambda\\to0}\\sum_{i=1}^n f(\\xi_i)\\Delta x_i'],
    },
    {
      id: 'k6',
      name: '变上限积分与微积分基本定理',
      description: '变上限积分求导、牛顿-莱布尼茨公式',
      formulas: ['\\frac{d}{dx}\\int_a^{\\varphi(x)}f(t)dt=f[\\varphi(x)]\\cdot\\varphi\'(x)', '\\int_a^b f(x)dx=F(b)-F(a)'],
    },
    {
      id: 'k7',
      name: '定积分计算技巧',
      description: '对称性、奇偶性、几何意义、周期函数、递推公式',
      formulas: ['\\int_{-a}^a f(x)dx=\\begin{cases}0, & f\\text{ 奇} \\ 2\\int_0^a f(x)dx, & f\\text{ 偶}\\end{cases}'],
    },
    {
      id: 'k8',
      name: '广义积分',
      description: '无穷区间广义积分、无界函数广义积分，收敛性判别',
      formulas: ['\\int_a^{+\\infty}f(x)dx=\\lim_{b\\to+\\infty}\\int_a^b f(x)dx'],
    },
    {
      id: 'k9',
      name: '积分中值定理',
      description: '第一积分中值定理、第二积分中值定理（竞赛需掌握）',
      formulas: ['\\int_a^b f(x)dx=f(\\xi)(b-a),\;\\xi\\in[a,b]'],
    },
    {
      id: 'k10',
      name: '定积分的几何应用',
      description: '平面图形面积、旋转体体积、弧长、旋转曲面面积',
    },
  ],
  questionTypes: [
    {
      id: 'qt1',
      title: '换元积分法技巧（三角代换 / 倒代换 / 根式代换）',
      method: '换元法是积分的核心工具。三角代换处理 √(a²-x²) 等根式；倒代换 1/x=t 处理分母高次多项式；根式代换令 t=√(ax+b) 去根号。竞赛重点是「观察被积函数形式，快速选对换元」。',
      examples: [
        {
          id: 'ex1',
          problem: '计算 \\int\\frac{dx}{x^2\\sqrt{x^2+1}}',
          steps: [
            '【方法一：三角代换】令 x = tan t，dx = sec²t dt，√(x²+1) = sec t',
            '原式 = \\int\\frac{sec^2 t}{tan^2 t \\cdot sec t}dt = \\int\\frac{sec t}{tan^2 t}dt = \\int\\frac{cos t}{sin^2 t}dt',
            '令 u = sin t，则上式 = \\int\\frac{du}{u^2} = -\\frac{1}{u} + C = -\\frac{1}{sin t} + C',
            '由 x = tan t 知 sin t = x/√(1+x²)，代回得 -\\frac{\\sqrt{1+x^2}}{x} + C',
            '【方法二：倒代换】令 t = 1/x，x = 1/t，dx = -1/t² dt',
            '原式 = \\int\\frac{-1/t^2}{(1/t^2)\\cdot\\sqrt{1/t^2+1}}dt = \\int\\frac{-t}{\\sqrt{1+t^2}}dt',
            '= -\\sqrt{1+t^2} + C = -\\sqrt{1+1/x^2} + C = -\\frac{\\sqrt{1+x^2}}{x} + C',
          ],
          tip: '倒代换在分母次数比分子高 2 次以上时特别好用，比分三角代换省事很多。竞赛常用套路：x^n·√(x²±a²) 在分母时优先试 1/x=t。',
          answer: '-\\frac{\\sqrt{x^2+1}}{x} + C',
        },
      ],
    },
    {
      id: 'qt2',
      title: '分部积分法（循环型 / 递推型）',
      method: '分部积分 ∫u dv = uv - ∫v du，关键是选 u 和 dv。口诀：「反对幂指三」（反三角/对数/幂函数/指数/三角），排在前面的做 u。指数×三角函数型会出现循环，移项解方程。',
      examples: [
        {
          id: 'ex1',
          problem: '计算 \\int e^x \\sin x \, dx',
          steps: [
            '设 I = ∫ e^x sinx dx，第一次分部积分：令 u = sinx，dv = e^x dx',
            '则 du = cosx dx，v = e^x，得 I = e^x sinx - ∫ e^x cosx dx',
            '对 ∫ e^x cosx dx 再分部积分：令 u = cosx，dv = e^x dx',
            '∫ e^x cosx dx = e^x cosx + ∫ e^x sinx dx = e^x cosx + I',
            '代入上式：I = e^x sinx - (e^x cosx + I) = e^x sinx - e^x cosx - I',
            '移项：2I = e^x(sinx - cosx)，所以 I = \\frac{e^x}{2}(\\sin x - \\cos x) + C',
          ],
          tip: '指数函数乘 sinx 或 cosx 一定会出现循环，两次分部后移项解方程。注意：两次分部积分时 u 和 dv 的选择类型要一致（第一次 u 取三角函数，第二次也必须取三角函数）。',
          answer: '\\frac{e^x}{2}(\\sin x - \\cos x) + C',
        },
        {
          id: 'ex2',
          problem: '计算 \\int_0^1 x^2 e^x \, dx',
          steps: [
            '两次分部积分。第一次：u = x²，dv = e^x dx → du = 2x dx，v = e^x',
            '∫₀¹ x² e^x dx = [x² e^x]₀¹ - 2∫₀¹ x e^x dx = e - 2∫₀¹ x e^x dx',
            '对 ∫ x e^x dx 再分部：u = x，dv = e^x dx → du = dx，v = e^x',
            '∫ x e^x dx = x e^x - ∫ e^x dx = x e^x - e^x + C',
            '代入：原式 = e - 2[x e^x - e^x]₀¹ = e - 2[(e - e) - (0 - 1)]',
            '= e - 2·1 = e - 2',
          ],
          tip: '多项式乘指数函数，分部积分多项式降阶。n 次多项式需要 n 次分部。也可以直接记忆「表格法」快速计算。',
          answer: 'e - 2',
        },
      ],
    },
    {
      id: 'qt3',
      title: '递推公式与定积分递推',
      method: '当被积函数含 n 次幂时，通过分部积分建立 Iₙ 与 Iₙ₋₁ 或 Iₙ₋₂ 的关系，形成递推公式。竞赛经典：Wallis 公式、∫sinⁿx、∫tanⁿx、∫(lnx)ⁿ。',
      examples: [
        {
          id: 'ex1',
          problem: '设 I_n=\\int_0^{\\frac{\\pi}{2}}\\sin^n x\,dx，证明递推公式并求 I_5。',
          steps: [
            '对 Iₙ 分部积分：u = sinⁿ⁻¹x，dv = sinx dx',
            'du = (n-1)sinⁿ⁻²x·cosx dx，v = -cosx',
            'Iₙ = [-sinⁿ⁻¹x·cosx]₀^(π/2) + (n-1)∫₀^(π/2) sinⁿ⁻²x·cos²x dx',
            '边界项为 0，且 cos²x = 1 - sin²x',
            'Iₙ = (n-1)∫₀^(π/2) sinⁿ⁻²x dx - (n-1)∫₀^(π/2) sinⁿx dx',
            '= (n-1)Iₙ₋₂ - (n-1)Iₙ',
            '移项：n·Iₙ = (n-1)Iₙ₋₂，即 Iₙ = \\frac{n-1}{n} I_{n-2}',
            'I₀ = ∫₀^(π/2) dx = π/2，I₁ = ∫₀^(π/2) sinx dx = 1',
            'I₅ = (4/5)I₃ = (4/5)(2/3)I₁ = (4/5)(2/3)·1 = 8/15',
          ],
          tip: '这就是 Wallis 公式。竞赛必背：奇数时分母连乘到 3，分子连乘到 n-1；偶数时乘到 2，最后乘 π/2。',
          answer: 'I_n = \\frac{n-1}{n}I_{n-2}，\\quad I_5 = \\frac{8}{15}',
        },
      ],
    },
    {
      id: 'qt4',
      title: '对称区间与周期函数定积分',
      method: '对称区间 [-a, a] 上：奇函数积分为 0，偶函数积分为 2 倍半区间。周期函数：一个周期上的积分相等。竞赛常利用对称性大幅简化计算。',
      examples: [
        {
          id: 'ex1',
          problem: '计算 \\int_0^{\\pi}\\frac{x\\sin x}{1+\\cos^2 x}dx',
          steps: [
            '【经典区间变换技巧】令 x = π - t，则 dx = -dt',
            '当 x=0 时 t=π，x=π 时 t=0',
            'I = ∫_π⁰ (π-t)sin(π-t)/(1+cos²(π-t))·(-dt) = ∫₀^π (π-t)sin t/(1+cos²t) dt',
            '= π∫₀^π sin t/(1+cos²t) dt - ∫₀^π t·sin t/(1+cos²t) dt',
            '= π∫₀^π sinx/(1+cos²x) dx - I',
            '移项：2I = π∫₀^π sinx/(1+cos²x) dx',
            '令 u = cosx，du = -sinx dx，当 x=0 时 u=1，x=π 时 u=-1',
            '∫₀^π sinx/(1+cos²x) dx = ∫₁⁻¹ -du/(1+u²) = ∫₋₁¹ du/(1+u²) = [arctan u]₋₁¹ = π/4 - (-π/4) = π/2',
            '所以 2I = π·(π/2) = π²/2，故 I = π²/4',
          ],
          tip: '被积函数含 x·f(sinx) 或 x·f(cosx) 在 [0,π] 上的积分，标准套路：做代换 x=π-t，得到 2I = π∫f(sinx)dx，消掉 x 因子。这是竞赛最经典的定积分技巧之一。',
          answer: '\\frac{\\pi^2}{4}',
        },
      ],
    },
    {
      id: 'qt5',
      title: '变上限积分与极限结合',
      method: '变上限积分函数求导是核心工具：d/dx ∫ₐ^(φ(x)) f(t)dt = f(φ(x))·φ\'(x)。x→0 时积分趋于 0，结合洛必达法则求极限是竞赛高频题型。',
      examples: [
        {
          id: 'ex1',
          problem: '求 \\lim_{x\\to 0}\\frac{1}{x^3}\\int_0^x\\left(\\frac{\\sin t}{t}-1\\right)dt',
          steps: [
            'x→0 时，分子 ∫₀ˣ (sint/t - 1)dt → 0（积分区间缩为 0），分母 x³ → 0，是 0/0 型',
            '用洛必达法则：对分子分母分别求导',
            '分子求导：d/dx ∫₀ˣ (sint/t - 1)dt = sinx/x - 1 = (sinx - x)/x',
            '原式 = lim(x→0) [(sinx - x)/x] / (3x²) = lim(x→0) (sinx - x)/(3x³)',
            '还是 0/0 型，可以用泰勒展开：sinx = x - x³/6 + o(x³)',
            'sinx - x = -x³/6 + o(x³)',
            '原式 = lim [ -x³/6 + o(x³) ] / (3x³) = -1/18',
          ],
          tip: '变上限积分 + 洛必达 + 泰勒展开是竞赛求极限的黄金组合。注意洛必达前一定要确认为 0/0 或 ∞/∞ 型。',
          answer: '-\\frac{1}{18}',
        },
      ],
    },
    {
      id: 'qt6',
      title: '广义积分敛散性判定',
      method: '广义积分判别法：① 比较判别法（非负函数）② p 积分判别法（∫₁^∞ 1/x^p dx，p>1 收敛）③ 绝对收敛概念。竞赛常考无穷区间和瑕积分的混合类型。',
      examples: [
        {
          id: 'ex1',
          problem: '判断广义积分 \\int_1^{+\\infty}\\frac{\\arctan x}{x^\\alpha}dx 的敛散性（α 为常数）。',
          steps: [
            '当 x→+∞ 时，arctan x → π/2（有界正量）',
            '所以被积函数 ~ (π/2)/x^α（x→+∞）',
            '由比较判别法的极限形式，∫₁^∞ arctan(x)/x^α dx 与 ∫₁^∞ 1/x^α dx 同敛散',
            '我们知道：∫₁^∞ 1/x^α dx 当 α > 1 时收敛，α ≤ 1 时发散',
            '所以：α > 1 时收敛，α ≤ 1 时发散',
          ],
          tip: '比较判别法的关键是找「等价量」。x→∞ 时看分子分母的「主项」——对数函数比任何正幂次增长都慢，arctan 等有界函数直接视为常数。',
          answer: '\\alpha > 1 时收敛；\\alpha \\leq 1 时发散',
        },
      ],
    },
    {
      id: 'qt7',
      title: '定积分几何应用（面积 / 体积）',
      method: '平面面积：∫ₐᵇ |f(x)-g(x)| dx。旋转体体积（绕 x 轴）：π∫ₐᵇ f²(x)dx（圆盘法）。竞赛常结合参数方程、极坐标、分段函数求面积。',
      examples: [
        {
          id: 'ex1',
          problem: '求抛物线 y^2 = 2x 与直线 y = x - 4 所围成图形的面积。',
          steps: [
            '先求交点：联立 y² = 2x 与 y = x - 4，得 y² = 2(y+4)，即 y² - 2y - 8 = 0',
            '解得 y = -2, y = 4，对应点 (2, -2) 和 (8, 4)',
            '【以 y 为积分变量更方便】右曲线 - 左曲线：x = y+4 和 x = y²/2',
            '面积 A = ∫₋₂⁴ [(y+4) - y²/2] dy',
            '= ∫₋₂⁴ (y + 4 - y²/2) dy',
            '= [y²/2 + 4y - y³/6]₋₂⁴',
            '= (8 + 16 - 64/6) - (2 - 8 + 8/6)',
            '= (24 - 32/3) - (-6 + 4/3) = 24 - 32/3 + 6 - 4/3 = 30 - 36/3 = 30 - 12 = 18',
          ],
          tip: '求面积时，选 x 还是 y 为积分变量要看哪种更省事。抛物线 y²=2px 型开口向右的，以 y 为变量通常不用分段，计算更简单。',
          answer: '18',
        },
      ],
    },
    {
      id: 'qt8',
      title: '积分不等式（估值 / 柯西施瓦茨）',
      method: '积分不等式证明常用方法：① 估值定理（找最大最小值）② 比较定理（被积函数大小）③ 柯西-施瓦茨不等式 ④ 变上限积分构造函数。竞赛高频：柯西积分形式。',
      examples: [
        {
          id: 'ex1',
          problem: '设 f(x) 在 [0,1] 上连续且单调递减，证明：对任意 a∈(0,1)，有 \\int_0^a f(x)dx \\geq a\\int_0^1 f(x)dx。',
          steps: [
            '【方法一：变量替换 + 单调性】需证 (1/a)∫₀ᵃ f(x)dx ≥ ∫₀¹ f(x)dx',
            '即平均值不等式：[0,a] 上的平均值 ≥ [0,1] 上的平均值',
            '因为 f 单调递减，左边区间位置靠左，函数值整体偏大，直觉上成立。',
            '【严格证明】令 F(a) = (1/a)∫₀ᵃ f(x)dx，需证 F(a) ≥ F(1)',
            'F\'(a) = [a·f(a) - ∫₀ᵃ f(x)dx]/a²',
            '由积分中值定理，∃ξ∈(0,a)，使得 ∫₀ᵃ f(x)dx = a·f(ξ)',
            '代入得 F\'(a) = [a·f(a) - a·f(ξ)]/a² = [f(a) - f(ξ)]/a',
            '因 f 单调递减且 ξ < a，故 f(ξ) ≥ f(a)，即 F\'(a) ≤ 0',
            '所以 F(a) 在 (0,1] 单调递减，故 F(a) ≥ F(1)，即 (1/a)∫₀ᵃ f ≥ ∫₀¹ f',
            '两边乘 a（a>0）：∫₀ᵃ f(x)dx ≥ a∫₀¹ f(x)dx',
          ],
          tip: '证明含参数的积分不等式时，常把参数视为变量，构造函数后求导判断单调性。这是积分不等式证明的「万能方法」。',
          answer: '由单调性法得证',
        },
      ],
    },
  ],
  pitfalls: [
    '换元积分忘记更换积分上下限（定积分换元必换限）',
    '变上限积分含参时直接求导（含参需先提取参数或做变量替换）',
    '广义积分忽略瑕点（如 ∫₀¹ 1/√x dx 在 x=0 处是瑕点）',
    '对称区间只看函数名不检查区间是否关于原点对称',
    '分部积分时 u 和 dv 选错（应该「反对幂指三」排序做 u）',
    '有理函数积分部分分式分解时分子次数估计错',
    '定积分换元后忘记 dx 也要替换（常漏乘导数因子）',
    '周期函数积分搞错周期长度',
  ],
};

// ========== 专题四：多元函数微分学 ==========
const MULTIVAR_DIFF_DETAIL: TopicDetailData = {
  topicKey: 'multi-var-diff',
  knowledgePoints: [
    {
      id: 'k1',
      name: '多元函数极限与连续',
      description: '重极限（动点以任意方式趋于定点）、累次极限、连续性定义',
    },
    {
      id: 'k2',
      name: '偏导数',
      description: '偏导数定义（固定其他变量）、几何意义、计算法则',
      formulas: ['\\frac{\\partial f}{\\partial x}=\\lim_{\\Delta x\\to 0}\\frac{f(x+\\Delta x,y)-f(x,y)}{\\Delta x}'],
    },
    {
      id: 'k3',
      name: '全微分',
      description: '全微分定义、可微的充分条件与必要条件、可微性判断',
      formulas: ['dz=\\frac{\\partial z}{\\partial x}dx+\\frac{\\partial z}{\\partial y}dy'],
    },
    {
      id: 'k4',
      name: '复合函数链式法则',
      description: '多元复合函数求导：全导数、偏导数、树形图法',
    },
    {
      id: 'k5',
      name: '隐函数求导',
      description: '一个方程的隐函数求导、方程组的隐函数求导',
      formulas: ['\\frac{\\partial z}{\\partial x}=-\\frac{F_x}{F_z},\;\\frac{\\partial z}{\\partial y}=-\\frac{F_y}{F_z}\;(F(x,y,z)=0)'],
    },
    {
      id: 'k6',
      name: '高阶偏导数',
      description: '二阶及以上偏导、混合偏导相等的条件（连续则相等）',
    },
    {
      id: 'k7',
      name: '方向导数与梯度',
      description: '方向导数定义与计算、梯度定义、方向导数最大值等于梯度的模',
      formulas: ['\\frac{\\partial f}{\\partial \\vec{l}}=f_x\\cos\\alpha+f_y\\cos\\beta', '\\nabla f=(f_x,f_y)'],
    },
    {
      id: 'k8',
      name: '无条件极值',
      description: '极值必要条件（驻点）、充分条件（AC-B² 判别法）',
      formulas: ['A=f_{xx},\;B=f_{xy},\;C=f_{yy},\;\\Delta=AC-B^2'],
    },
    {
      id: 'k9',
      name: '条件极值（拉格朗日乘数法）',
      description: '单约束、双约束条件下的极值，构造拉格朗日函数',
      formulas: ['L(x,y,\\lambda)=f(x,y)-\\lambda\\varphi(x,y)'],
    },
    {
      id: 'k10',
      name: '有界闭区域上的最值',
      description: '内部驻点 + 边界上极值 → 比较得最值',
    },
  ],
  questionTypes: [
    {
      id: 'qt1',
      title: '重极限计算与证明不存在',
      method: '重极限存在要求动点以任意路径趋于定点时极限都存在且相等。证明不存在：找两条不同路径得到不同极限值。计算常用：夹逼定理、极坐标代换、等价无穷小、泰勒展开。',
      examples: [
        {
          id: 'ex1',
          problem: '证明 \\lim_{(x,y)\\to(0,0)}\\frac{xy}{x^2+y^2} 不存在。',
          steps: [
            '【路径法】取 y = kx（k 为常数），动点沿直线 y=kx 趋于原点',
            '当 (x,y)→(0,0) 沿 y=kx 时：',
            '\\frac{xy}{x^2+y^2} = \\frac{x·kx}{x^2 + k²x²} = \\frac{kx²}{x²(1+k²)} = \\frac{k}{1+k²}',
            '这个极限值随 k 变化而变化：',
            'k=0 时极限 = 0；k=1 时极限 = 1/2',
            '沿不同路径极限值不同，故重极限不存在',
          ],
          tip: '证明二元极限不存在是竞赛入门必考题。常用路径：y=kx（直线）、y=kx²（抛物线）、y=x^α（幂函数）。只要找到两条路径极限不同，即可判定不存在。',
          answer: '重极限不存在（沿不同路径极限值不同）',
        },
      ],
    },
    {
      id: 'qt2',
      title: '偏导数计算（抽象复合函数）',
      method: '复合函数求偏导用链式法则。抽象函数（如 f(u,v) 未给出具体形式）求导时，注意 f₁ 表示对第一个变量求偏导，f₁₂ 表示先对第一个再对第二个变量求混合偏导。高阶偏导中混合偏导连续则相等。',
      examples: [
        {
          id: 'ex1',
          problem: '设 z = f(xy,\\frac{x}{y})，其中 f 具有二阶连续偏导数，求 \\frac{\\partial z}{\\partial x} 和 \\frac{\\partial^2 z}{\\partial x\\partial y}。',
          steps: [
            '令 u = xy，v = x/y，则 z = f(u, v)',
            '一阶偏导 ∂z/∂x = f₁·∂u/∂x + f₂·∂v/∂x = y·f₁ + (1/y)·f₂',
            '现在对 x 的偏导再求 y 的偏导：∂²z/∂x∂y = ∂/∂y [y·f₁ + (1/y)·f₂]',
            '= f₁ + y·∂f₁/∂y + (-1/y²)·f₂ + (1/y)·∂f₂/∂y',
            '∂f₁/∂y = f₁₁·∂u/∂y + f₁₂·∂v/∂y = f₁₁·x + f₁₂·(-x/y²) = x·f₁₁ - (x/y²)·f₁₂',
            '∂f₂/∂y = f₂₁·∂u/∂y + f₂₂·∂v/∂y = f₂₁·x + f₂₂·(-x/y²) = x·f₂₁ - (x/y²)·f₂₂',
            '因 f 二阶偏导连续，故 f₁₂ = f₂₁，代入：',
            '∂²z/∂x∂y = f₁ + y[x·f₁₁ - (x/y²)f₁₂] - (1/y²)f₂ + (1/y)[x·f₁₂ - (x/y²)f₂₂]',
            '= f₁ + xy·f₁₁ - (x/y)f₁₂ - (1/y²)f₂ + (x/y)f₁₂ - (x/y³)f₂₂',
            '= f₁ - (1/y²)f₂ + xy·f₁₁ - (x/y³)·f₂₂',
            '（注意 -(x/y)f₁₂ 和 +(x/y)f₁₂ 抵消了）',
          ],
          tip: '抽函数求偏导的两大易错点：① 对 f₁ 和 f₂ 求偏导时，忘记它们仍是复合函数（仍然是 x,y 的函数），直接写成 0；② 混合偏导 f₁₂ 和 f₂₁ 相等的条件是「连续」，题目没说不能随便合并。',
          answer: '\\frac{\\partial z}{\\partial x}=y f_1+\\frac{1}{y}f_2，\\quad \\frac{\\partial^2 z}{\\partial x\\partial y}=f_1-\\frac{1}{y^2}f_2+xy\\cdot f_{11}-\\frac{x}{y^3}f_{22}',
        },
      ],
    },
    {
      id: 'qt3',
      title: '隐函数求导（一阶 / 二阶）',
      method: '隐函数 F(x,y,z)=0 确定 z=z(x,y)，一阶偏导公式：∂z/∂x = -F_x/F_z，∂z/∂y = -F_y/F_z。二阶偏导：对一阶结果再求导，注意 z 仍是 x,y 的函数（复合函数求导）。',
      examples: [
        {
          id: 'ex1',
          problem: '设方程 x^2 + y^2 + z^2 = 1 确定隐函数 z = z(x,y)，求 \\frac{\\partial z}{\\partial x} 和 \\frac{\\partial^2 z}{\\partial x^2}。',
          steps: [
            '令 F(x,y,z) = x² + y² + z² - 1',
            'F_x = 2x，F_y = 2y，F_z = 2z',
            '一阶偏导：∂z/∂x = -F_x/F_z = -2x/(2z) = -x/z',
            '二阶偏导：对 ∂z/∂x = -x/z 两边再对 x 求偏导',
            '∂²z/∂x² = ∂/∂x (-x/z) = -[1·z - x·∂z/∂x] / z² （商的求导法则）',
            '代入 ∂z/∂x = -x/z：',
            '= -[z - x·(-x/z)] / z² = -[z + x²/z] / z²',
            '= -[(z² + x²)/z] / z² = -(z² + x²) / z³',
            '由原方程知 x² + z² = 1 - y²，也可写成 -(1 - y²)/z³',
          ],
          tip: '二阶隐函数偏导：① 对一阶结果直接求导（商法则/乘积法则）② 求导过程中 z 仍是 x,y 的函数，必须用链式法则乘以 ∂z/∂x ③ 最后用一阶结果替换掉所有 ∂z/∂x，只用 x,y,z 表达。',
          answer: '\\frac{\\partial z}{\\partial x}=-\\frac{x}{z}，\\quad \\frac{\\partial^2 z}{\\partial x^2}=-\\frac{x^2+z^2}{z^3}=-\\frac{1-y^2}{z^3}',
        },
      ],
    },
    {
      id: 'qt4',
      title: '全微分与可微性判断',
      method: '可微 ⇒ 偏导存在（反之不成立）。可微 ⇔ Δz - (f_x·Δx + f_y·Δy) = o(ρ)，其中 ρ = √(Δx²+Δy²)。判断可微性：先看偏导是否存在，再验证上述极限是否为 0。',
      examples: [
        {
          id: 'ex1',
          problem: '讨论函数 f(x,y)=\\begin{cases}\\dfrac{xy}{\\sqrt{x^2+y^2}}, & (x,y)\\neq(0,0) \\ 0, & (x,y)=(0,0)\\end{cases} 在 (0,0) 处的连续性与可微性。',
          steps: [
            '【连续性】用夹逼定理：|xy/√(x²+y²)| ≤ |xy|/√(2|xy|) = √(|xy|/2) → 0（当 x,y→0 时）',
            '所以 lim(x,y→0) f(x,y) = 0 = f(0,0)，f 在 (0,0) 连续。',
            '【偏导数】用定义计算 f_x(0,0)：',
            'f_x(0,0) = lim(Δx→0) [f(Δx,0)-f(0,0)]/Δx = lim [0 - 0]/Δx = 0',
            '同理 f_y(0,0) = 0。偏导数存在。',
            '【可微性判断】需验证：lim(ρ→0) [Δz - f_xΔx - f_yΔy]/ρ = 0',
            'Δz = f(Δx,Δy) - f(0,0) = Δx·Δy/√(Δx²+Δy²)',
            'f_xΔx + f_yΔy = 0·Δx + 0·Δy = 0',
            '所以 [Δz - 0]/ρ = [Δx·Δy/√(Δx²+Δy²)] / √(Δx²+Δy²) = Δx·Δy / (Δx²+Δy²)',
            '我们知道 lim(Δx,Δy→0) ΔxΔy/(Δx²+Δy²) 不存在（取 Δy=Δx 得 1/2，取 Δy=0 得 0）',
            '故极限不是 0，f 在 (0,0) 不可微。',
          ],
          tip: '可微性判断是竞赛经典题型。三步曲：① 连续？② 偏导存在？③ Δz - f_xΔx - f_yΔy 是 ρ 的高阶无穷小？偏导存在但不连续是常见的「不可微」的例子。',
          answer: '在 (0,0) 连续但不可微',
        },
      ],
    },
    {
      id: 'qt5',
      title: '方向导数与梯度',
      method: '方向导数 = 梯度向量与方向单位向量的内积：∂f/∂l = ∇f · (cosα, cosβ) = |∇f|·cosθ。方向导数最大值 = |∇f|（沿梯度方向），最小值 = -|∇f|（沿梯度反方向）。',
      examples: [
        {
          id: 'ex1',
          problem: '求函数 u = x^2 + 2y^2 + 3z^2 + 3x - 2y 在点 (1,1,2) 处的梯度及最大方向导数值。',
          steps: [
            '求各偏导数：',
            '∂u/∂x = 2x + 3 → 在 (1,1,2) 处：2·1 + 3 = 5',
            '∂u/∂y = 4y - 2 → 在 (1,1,2) 处：4·1 - 2 = 2',
            '∂u/∂z = 6z → 在 (1,1,2) 处：6·2 = 12',
            '梯度 ∇u(1,1,2) = (5, 2, 12)',
            '最大方向导数值 = 梯度的模 = |∇u| = √(5² + 2² + 12²)',
            '= √(25 + 4 + 144) = √173',
          ],
          tip: '记住三句话：① 梯度方向是函数增长最快的方向 ② 梯度的模 = 最大方向导数 ③ 方向导数 = 梯度 · 单位方向向量。竞赛选择题常考。',
          answer: '\\nabla u=(5,2,12)，最大方向导数 = \\sqrt{173}',
        },
      ],
    },
    {
      id: 'qt6',
      title: '无条件极值（AC-B² 判别法）',
      method: '求二元函数极值：① 求偏导找驻点 ② 求二阶偏导 A=f_xx, B=f_xy, C=f_yy ③ 计算 Δ=AC-B²：Δ>0 且 A>0 时极小、A<0 时极大；Δ<0 时非极值；Δ=0 时不能确定。',
      examples: [
        {
          id: 'ex1',
          problem: '求函数 f(x,y) = x^3 + y^3 - 3xy 的极值。',
          steps: [
            '求一阶偏导：f_x = 3x² - 3y = 3(x² - y)，f_y = 3y² - 3x = 3(y² - x)',
            '令 f_x = 0，f_y = 0，得方程组：x² = y，y² = x',
            '代入得 x⁴ = x，即 x(x³-1) = 0，解得 x=0 或 x=1',
            'x=0 时 y=0；x=1 时 y=1。驻点为 (0,0) 和 (1,1)',
            '求二阶偏导：f_xx = 6x，f_xy = -3，f_yy = 6y',
            '判别式 Δ = AC - B² = (6x)(6y) - (-3)² = 36xy - 9',
            '在 (0,0) 处：A=0, B=-3, C=0, Δ = 0 - 9 = -9 < 0 → 不是极值',
            '在 (1,1) 处：A=6>0, B=-3, C=6, Δ = 36 - 9 = 27 > 0 → 极小值',
            '极小值 f(1,1) = 1 + 1 - 3 = -1',
          ],
          tip: 'AC-B² 判别法是多元函数求极值的基础。注意：Δ=0 时判别法失效，需要用更高阶方法（如泰勒展开到四阶）或直接分析。驻点不一定是极值点，极值点也不一定是驻点（可能偏导不存在）。',
          answer: '在 (1,1) 处取极小值 -1；(0,0) 不是极值点',
        },
      ],
    },
    {
      id: 'qt7',
      title: '条件极值（拉格朗日乘数法）',
      method: '条件极值：在约束条件 φ(x,y)=0 下求 f(x,y) 的极值。构造拉格朗日函数 L = f - λφ，求偏导令其为 0，解方程组。多个约束时加多个 λ。竞赛常考双约束（加 μ）。',
      examples: [
        {
          id: 'ex1',
          problem: '求函数 f(x,y,z) = x^2 + y^2 + z^2 在约束条件 x + y + z = 1 下的最小值。',
          steps: [
            '构造拉格朗日函数：L(x,y,z,λ) = x² + y² + z² - λ(x + y + z - 1)',
            '求偏导并令其为 0：',
            '∂L/∂x = 2x - λ = 0 → x = λ/2',
            '∂L/∂y = 2y - λ = 0 → y = λ/2',
            '∂L/∂z = 2z - λ = 0 → z = λ/2',
            '∂L/∂λ = -(x + y + z - 1) = 0 → x + y + z = 1',
            '由前三式知 x = y = z = λ/2',
            '代入约束：λ/2 + λ/2 + λ/2 = 1 → 3λ/2 = 1 → λ = 2/3',
            '故 x = y = z = 1/3',
            '最小值 f(1/3, 1/3, 1/3) = (1/3)² + (1/3)² + (1/3)² = 1/9 + 1/9 + 1/9 = 1/3',
            '【几何验证】f=x²+y²+z² 是原点到点 (x,y,z) 距离的平方，约束 x+y+z=1 是平面。最小值就是原点到平面距离的平方：(1/√3)² = 1/3 ✓',
          ],
          tip: '拉格朗日乘数法的方程组求解是难点。技巧：利用对称性（变量对称时极值往往在变量相等处取到）、比例法（用 λ 表达各变量）。注意：拉格朗日只能找驻点，是否是极值点需结合问题背景判断。',
          answer: '最小值为 \\frac{1}{3}，在 (\\frac{1}{3},\\frac{1}{3},\\frac{1}{3}) 处取得',
        },
      ],
    },
    {
      id: 'qt8',
      title: '多元函数极值应用题',
      method: '实际问题求最值：① 建立目标函数 ② 确定定义域（有界闭区域）③ 求内部驻点 ④ 求边界上的极值（转化为条件极值）⑤ 比较所有候选点的函数值。竞赛常考体积最大、用料最省等。',
      examples: [
        {
          id: 'ex1',
          problem: '要做一个容积为 V 的无盖长方体水箱，问长、宽、高各为多少时用料最省？',
          steps: [
            '设水箱长为 x，宽为 y，高为 z，则体积 V = xyz（z = V/(xy)）',
            '无盖水箱用料面积 S = xy + 2xz + 2yz（底面 + 四个侧面）',
            '代入 z = V/(xy)：S(x,y) = xy + 2x·V/(xy) + 2y·V/(xy) = xy + 2V/y + 2V/x',
            '定义域：x > 0, y > 0',
            '求偏导：∂S/∂x = y - 2V/x²，∂S/∂y = x - 2V/y²',
            '令 ∂S/∂x = 0，∂S/∂y = 0：y = 2V/x²，x = 2V/y²',
            '两式相乘：xy = 4V²/(x²y²) = 4V²/(xy)² → (xy)³ = 4V² → xy = (4V²)^(1/3)',
            '两式相除：y/x = (2V/x²)/(2V/y²) = y²/x² → y/x = 1 → y = x',
            '故 x = y = (4V²)^(1/3) / x... 直接代入：x = 2V/x² → x³ = 2V → x = (2V)^(1/3)',
            '所以 x = y = (2V)^(1/3)，z = V/(xy) = V/(2V)^(2/3) = (2V)^(1/3)/2',
            '即长 = 宽 = (2V)^(1/3)，高 = (2V)^(1/3)/2 时用料最省。',
          ],
          tip: '无盖长方体水箱的最优解结论：底面为正方形，高为底面边长的 1/2。竞赛可以当作二级结论记住，但考试时必须写完整推导过程。',
          answer: '长 = 宽 = \\sqrt[3]{2V}，高 = \\frac{\\sqrt[3]{2V}}{2} 时用料最省',
        },
      ],
    },
  ],
  pitfalls: [
    '重极限与累次极限混淆（两者不等价，重极限存在时累次极限不一定存在）',
    '复合函数求偏导时 f₁、f₂ 当作常数（它们仍是复合函数，需要继续链式求导）',
    '隐函数求二阶偏导时忘记 z 仍是 x,y 的函数（漏乘 ∂z/∂x）',
    'AC-B² 判别法中 A、C 写反或 B 忘记平方',
    '拉格朗日乘数法只找内部驻点不查边界（条件极值要检查约束边界）',
    '方向导数与梯度混淆（梯度是向量，方向导数是标量）',
    '可微性判断只看偏导存在（偏导存在只是必要条件不是充分条件）',
    '混合偏导 f₁₂ 与 f₂₁ 相等的前提是连续，题目没说不能直接合并',
  ],
};


// ========== 专题五：多元函数积分学 ==========
const MULTIVAR_INT_DETAIL: TopicDetailData = {
  topicKey: 'multi-var-int',
  knowledgePoints: [
    {
      id: 'k1',
      name: '二重积分概念与性质',
      description: '二重积分定义、几何意义、线性性、区域可加性、估值定理、中值定理',
      formulas: ['\\iint_D f(x,y)d\\sigma = \\lim_{\\lambda\\to 0}\\sum_{i=1}^n f(\\xi_i,\\eta_i)\\Delta\\sigma_i'],
    },
    {
      id: 'k2',
      name: '二重积分直角坐标计算',
      description: 'X型区域、Y型区域，累次积分',
      formulas: ['\\iint_D f(x,y)d\\sigma = \\int_a^b dx\\int_{\\varphi_1(x)}^{\\varphi_2(x)} f(x,y)dy'],
    },
    {
      id: 'k3',
      name: '二重积分极坐标计算',
      description: '极坐标变换 x=r cosθ, y=r sinθ, dσ=r dr dθ',
      formulas: ['\\iint_D f(x,y)d\\sigma = \\int_\\alpha^\\beta d\\theta\\int_{r_1(\\theta)}^{r_2(\\theta)} f(r\\cos\\theta,r\\sin\\theta)\\cdot r\,dr'],
    },
    {
      id: 'k4',
      name: '二重积分换序',
      description: '交换积分次序：先画图、找交点、确定新的上下限',
    },
    {
      id: 'k5',
      name: '三重积分',
      description: '直角坐标、柱坐标、球坐标三种计算方法',
      formulas: ['\\text{柱坐标: } dV = r\\,dr\\,d\\theta\\,dz', '\\text{球坐标: } dV = r^2\\sin\\varphi\\,dr\\,d\\varphi\\,d\\theta'],
    },
    {
      id: 'k6',
      name: '重积分对称性',
      description: '奇偶对称性、轮换对称性，竞赛重要化简技巧',
    },
    {
      id: 'k7',
      name: '曲线积分',
      description: '第一类（对弧长）、第二类（对坐标），参数化计算',
      formulas: ['\\text{第一类: } \\int_L f(x,y)ds = \\int_\\alpha^\\beta f(x(t),y(t))\\sqrt{x\'^2(t)+y\'^2(t)}dt'],
    },
    {
      id: 'k8',
      name: '曲面积分',
      description: '第一类（对面积）、第二类（对坐标），投影法',
    },
    {
      id: 'k9',
      name: '格林公式、高斯公式、斯托克斯公式',
      description: '三大公式：格林（平面闭曲线→二重积分）、高斯（闭曲面→三重积分）、斯托克斯（空间闭曲线→曲面积分）',
      formulas: ['\\oint_L Pdx+Qdy = \\iint_D \\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)d\\sigma'],
    },
    {
      id: 'k10',
      name: '积分与路径无关、保守场',
      description: '平面单连通域内 ∂Q/∂x = ∂P/∂y ⇔ 积分与路径无关 ⇔ 存在原函数 u(x,y)',
    },
  ],
  questionTypes: [
    {
      id: 'qt1',
      title: '二重积分计算（直角坐标 + 极坐标 + 换序）',
      method: '二重积分计算三步走：① 画区域图 ② 选坐标系（圆域/扇形/环形优先极坐标）③ 确定上下限。换序问题：先从原积分限还原区域，再按另一顺序重写上下限。',
      examples: [
        {
          id: 'ex1',
          problem: '计算 \\iint_D (x+y)\,d\\sigma，其中 D 由 |x| + |y| \\leq 1 围成。',
          steps: [
            '【方法一：对称性秒杀】区域 D 关于 x 轴、y 轴都对称',
            '被积函数 f(x,y) = x + y',
            'x 关于 x 是奇函数，区域关于 y 轴对称 ⇒ ∬_D x dσ = 0',
            'y 关于 y 是奇函数，区域关于 x 轴对称 ⇒ ∬_D y dσ = 0',
            '所以 ∬_D (x+y) dσ = 0 + 0 = 0',
            '【方法二：直接计算验证】D 是正方形，顶点 (±1,0),(0,±1)',
            'D 分为四部分，用第一象限乘 4 验证也可，但对称性法更简洁。',
          ],
          tip: '对称区域 + 奇函数被积函数 = 积分值为 0。竞赛中遇到对称区域，第一反应是检查被积函数的奇偶性，常常可以秒出答案或大幅简化。',
          answer: '0',
        },
        {
          id: 'ex2',
          problem: '交换积分次序：\\int_0^1 dx\\int_x^{\\sqrt{x}} f(x,y)\,dy。',
          steps: [
            '【第一步：确定积分区域 D】',
            '由外层积分 x ∈ [0,1]，内层积分 y 从 x 到 √x',
            '区域 D 由 y = x 和 y = √x 以及 x=0, x=1 围成',
            '求交点：x = √x ⇒ x² = x ⇒ x(x-1)=0 ⇒ x=0 或 x=1',
            '对应点 (0,0) 和 (1,1)',
            '注意：在 [0,1] 上 √x ≥ x（如 x=1/4 时 √x=1/2 > 1/4）',
            '【第二步：换序为 Y 型】y ∈ [0,1]',
            '对每个 y，x 的范围：由 y = x 得 x=y；由 y = √x 得 x=y²',
            '因为 √x ≥ x ⇒ x ≤ √x ⇒ y² ≤ x ≤ y（注意左右边界方向）',
            '验证：当 y=1/2 时，y²=1/4，y=1/2，即 x 从 1/4 到 1/2',
            '所以：∫₀¹ dx ∫_x^√x f dy = ∫₀¹ dy ∫_{y²}^{y} f dx',
          ],
          tip: '换序关键是「画图」。注意：内层上下限的大小关系决定了区域的上下/左右边界。如果 ∫ 下限 > 上限，要先交换上下限并加负号。竞赛中换序题常作为「中间步骤」出现在含参积分求导等综合题中。',
          answer: '\\int_0^1 dy\\int_{y^2}^{y} f(x,y)\,dx',
        },
      ],
    },
    {
      id: 'qt2',
      title: '三重积分（柱坐标 / 球坐标）',
      method: '三重积分坐标系选择：① 直角坐标（适合长方体/多面体）② 柱坐标（适合旋转体，如圆柱、圆锥，被积函数含 x²+y²）③ 球坐标（适合球体/锥体/球壳，被积函数含 x²+y²+z²）。竞赛高频：球坐标。',
      examples: [
        {
          id: 'ex1',
          problem: '计算 \\iiint_\\Omega (x^2+y^2+z^2)\,dV，其中 Ω 为单位球 x^2+y^2+z^2 \\leq 1。',
          steps: [
            '被积函数含 x²+y²+z²，区域是球 → 用球坐标',
            '球坐标变换：x = r sinφ cosθ，y = r sinφ sinθ，z = r cosφ',
            'x²+y²+z² = r²，体积元素 dV = r² sinφ dr dφ dθ',
            '积分区域：r ∈ [0,1]，φ ∈ [0,π]，θ ∈ [0,2π]',
            '原式 = ∫₀²π dθ ∫₀^π sinφ dφ ∫₀¹ r² · r² dr',
            '= ∫₀²π dθ · ∫₀^π sinφ dφ · ∫₀¹ r⁴ dr',
            '= [θ]₀²π · [-cosφ]₀^π · [r⁵/5]₀¹',
            '= 2π · (2) · (1/5) = 4π/5',
          ],
          tip: '球坐标三重积分计算三要素：① r 的范围（由内半径到外半径）② φ 的范围（极角，从 z 轴正方向量起，0 到 π）③ θ 的范围（方位角，通常 0 到 2π）。被积函数乘 r²sinφ 别忘了！',
          answer: '\\frac{4\\pi}{5}',
        },
      ],
    },
    {
      id: 'qt3',
      title: '重积分对称性化简（奇偶性 + 轮换对称）',
      method: '重积分对称性两大武器：① 奇偶对称（区域关于某坐标面对称 + 被积函数关于对应变量奇偶性）② 轮换对称（积分区域关于 y=x 对称时，∬f(x,y) = ∬f(y,x)）。竞赛中用得好可以秒题。',
      examples: [
        {
          id: 'ex1',
          problem: '计算 \\iint_{x^2+y^2 \\leq 1} (2x + 3y)^2\,d\\sigma。',
          steps: [
            '展开被积函数：(2x + 3y)² = 4x² + 12xy + 9y²',
            '原式 = ∬ (4x² + 12xy + 9y²) dσ = 4∬x²dσ + 12∬xydσ + 9∬y²dσ',
            '【利用奇偶性】xy 关于 x 是奇函数（也关于 y 奇），区域关于 y 轴对称',
            '所以 ∬_D xy dσ = 0',
            '【利用轮换对称性】区域 D: x²+y²≤1 关于 y=x 对称',
            '所以 ∬x² dσ = ∬y² dσ',
            '而 ∬(x²+y²) dσ = ∫₀²π dθ ∫₀¹ r² · r dr = 2π · [r⁴/4]₀¹ = 2π·1/4 = π/2',
            '故 ∬x² dσ = ∬y² dσ = (1/2)·(π/2) = π/4',
            '代入原式：4·(π/4) + 12·0 + 9·(π/4) = π + 9π/4 = 13π/4',
          ],
          tip: '轮换对称的条件是「积分区域关于 y=x 对称」（即 x 和 y 互换后区域不变）。圆域、正方形 [0,1]×[0,1] 等都满足。竞赛常用技巧：∬x²dσ = ∬y²dσ = (1/2)∬(x²+y²)dσ。',
          answer: '\\frac{13\\pi}{4}',
        },
      ],
    },
    {
      id: 'qt4',
      title: '第一类曲线积分（对弧长）',
      method: '对弧长的曲线积分计算：参数化曲线 → 写出 ds = √(x\'(t)²+y\'(t)²) dt → 化为定积分。注意：① ds 恒正，积分下限 < 上限（与方向无关）② 可用曲线方程代入化简被积函数。',
      examples: [
        {
          id: 'ex1',
          problem: '计算 \\oint_L (x^2 + y^2)\,ds，其中 L 为圆周 x^2 + y^2 = ax (a > 0)。',
          steps: [
            '【方法一：参数方程】圆方程：x² + y² = ax，配方 (x-a/2)² + y² = (a/2)²',
            '圆心 (a/2, 0)，半径 a/2',
            '参数方程：x = a/2 + (a/2)cos t，y = (a/2)sin t，t ∈ [0, 2π]',
            'dx/dt = -(a/2)sin t，dy/dt = (a/2)cos t',
            'ds = √(dx/dt)² + (dy/dt)² dt = √(a²/4 sin²t + a²/4 cos²t) dt = (a/2)dt',
            '被积函数：x² + y² = ax = a(a/2 + a/2 cos t) = a²/2 (1 + cos t)',
            '原式 = ∫₀²π a²/2(1+cost) · (a/2) dt = a³/4 ∫₀²π (1+cost) dt',
            '= a³/4 · [t + sint]₀²π = a³/4 · 2π = πa³/2',
            '【方法二：对称性 + 几何意义】利用 L 的方程直接代入',
            '原式 = ∮_L ax ds = a ∮_L x ds（因为 x²+y²=ax 在 L 上成立）',
            '而由形心公式，(1/L)∮_L x ds = x̄ = a/2（圆心的 x 坐标）',
            '∮_L x ds = x̄ · L = (a/2) · πa = πa²/2',
            '原式 = a · πa²/2 = πa³/2',
          ],
          tip: '曲线积分的一大技巧：被积函数定义在曲线上，所以可以用曲线方程直接代入化简！这是曲线/曲面积分独有的性质（重积分不能这么干）。竞赛中这个技巧能省大量计算。',
          answer: '\\frac{\\pi a^3}{2}',
        },
      ],
    },
    {
      id: 'qt5',
      title: '第二类曲线积分与格林公式',
      method: '第二类曲线积分（对坐标）：∫_L P dx + Q dy。计算方法：① 参数化（直接化为定积分）② 格林公式（闭曲线 + D 内 P,Q 有连续偏导）。非闭曲线可「补线」用格林公式后减去补的线。',
      examples: [
        {
          id: 'ex1',
          problem: '计算 \\oint_L x^2 y\,dx + xy^2\,dy，其中 L 为正向单位圆周 x^2+y^2=1。',
          steps: [
            'L 是闭曲线，正向（逆时针），区域 D: x²+y² ≤ 1',
            'P = x²y，Q = xy²',
            '∂Q/∂x = y²，∂P/∂y = x²',
            '由格林公式：∮_L Pdx + Qdy = ∬_D (∂Q/∂x - ∂P/∂y) dσ = ∬_D (y² - x²) dσ',
            '【用极坐标】∬_D (y² - x²) dσ = ∫₀²π dθ ∫₀¹ (r²sin²θ - r²cos²θ) · r dr',
            '= ∫₀²π dθ ∫₀¹ r³(sin²θ - cos²θ) dr = ∫₀²π -(cos2θ) dθ · ∫₀¹ r³ dr',
            '（因为 cos2θ = cos²θ - sin²θ）',
            '= [-sin2θ/2]₀²π · [r⁴/4]₀¹ = 0 · 1/4 = 0',
            '【另解：用对称性】∬_D x² dσ = ∬_D y² dσ（轮换对称）',
            '所以 ∬(y²-x²)dσ = ∬y²dσ - ∬x²dσ = 0',
          ],
          tip: '格林公式是竞赛高频考点。使用条件：① 闭曲线（不闭要补）② 正向（顺时针要加负号）③ P,Q 在 D 内有连续偏导（有奇点要「挖洞」）。轮换对称在二重积分中非常好用，记住「圆域上 x² 的积分 = y² 的积分」。',
          answer: '0',
        },
      ],
    },
    {
      id: 'qt6',
      title: '曲面积分与高斯公式',
      method: '第二类曲面积分（对坐标）：∬_Σ P dydz + Q dzdx + R dxdy。高斯公式：闭曲面外侧 ⇔ 三重积分。∯_Σ P dydz+Q dzdx+R dxdy = ∭_Ω (∂P/∂x + ∂Q/∂y + ∂R/∂z) dV。非闭曲面需「补面」后用高斯公式再减去补面。',
      examples: [
        {
          id: 'ex1',
          problem: '计算 \\oiint_\\Sigma x\,dydz + y\,dzdx + z\,dxdy，其中 Σ 为球面 x^2+y^2+z^2 = R^2 的外侧。',
          steps: [
            'Σ 是闭曲面，取外侧，直接用高斯公式',
            'P = x，Q = y，R = z',
            '∂P/∂x = 1，∂Q/∂y = 1，∂R/∂z = 1',
            'div F = ∂P/∂x + ∂Q/∂y + ∂R/∂z = 1 + 1 + 1 = 3',
            '由高斯公式：原式 = ∭_Ω 3 dV = 3 · V',
            '球体积 V = (4/3)πR³',
            '所以原式 = 3 · (4/3)πR³ = 4πR³',
          ],
          tip: '高斯公式是曲面积分的「万能钥匙」。记住：闭曲面 + 外侧 + 偏导连续 → 直接高斯。常见坑：① 曲面不封闭（需补面）② 不是外侧（内侧要加负号）③ 被积函数在原点等点不连续（要挖洞）。',
          answer: '4\\pi R^3',
        },
      ],
    },
    {
      id: 'qt7',
      title: '曲线积分与路径无关（保守场）',
      method: '平面单连通域内，以下四条件等价：① 积分与路径无关 ② ∂Q/∂x = ∂P/∂y ③ 闭曲线积分为 0 ④ Pdx+Qdy 是某函数 u(x,y) 的全微分（u 为原函数）。原函数求法：偏积分法、特殊路径法（折线法）。',
      examples: [
        {
          id: 'ex1',
          problem: '验证 (2xy)dx + (x^2 - y^2)dy 是某函数 u(x,y) 的全微分，并求 u(x,y)。',
          steps: [
            'P = 2xy，Q = x² - y²',
            '∂P/∂y = 2x，∂Q/∂x = 2x',
            '因为 ∂P/∂y = ∂Q/∂x = 2x（在全平面成立，全平面是单连通域）',
            '所以 Pdx + Qdy 是全微分。',
            '【求原函数：偏积分法】',
            '由 ∂u/∂x = P = 2xy，对 x 积分：u = ∫ 2xy dx = x²y + φ(y)',
            '其中 φ(y) 是 y 的待定函数',
            '两边对 y 求偏导：∂u/∂y = x² + φ\'(y)',
            '但 ∂u/∂y = Q = x² - y²，所以：',
            'x² + φ\'(y) = x² - y² ⇒ φ\'(y) = -y²',
            '积分得 φ(y) = -y³/3 + C',
            '故原函数 u(x,y) = x²y - y³/3 + C',
            '【验证】du = 2xy dx + (x² - y²) dy ✓',
          ],
          tip: '原函数求法三种：① 偏积分法（上面演示）② 折线法（从 (0,0) 沿 x 轴到 (x,0) 再竖直到 (x,y)）③ 凑微分法（观察法，对熟练者最快）。竞赛中常考：已知 Pdx+Qdy 是全微分，求原函数，或求曲线积分（等于原函数在两端点的差）。',
          answer: 'u(x,y) = x^2y - \\dfrac{y^3}{3} + C',
        },
      ],
    },
    {
      id: 'qt8',
      title: '重积分应用（体积 / 重心 / 转动惯量）',
      method: '几何物理应用：① 体积 V = ∬_D [z_top - z_bottom] dσ 或 V = ∭_Ω dV ② 重心 (x̄,ȳ,z̄) = (M_yz/M, M_xz/M, M_xy/M) ③ 转动惯量 I_x = ∭(y²+z²)ρ dV。竞赛常考：利用对称性判断重心坐标为 0。',
      examples: [
        {
          id: 'ex1',
          problem: '求由抛物面 z = x^2 + y^2 与平面 z = 1 所围成的均匀立体的体积和重心。',
          steps: [
            '立体由 z = x²+y²（下）和 z = 1（上）围成',
            '两曲面交线：x²+y² = 1（在 z=1 平面上的单位圆）',
            '在 xy 平面上的投影区域 D: x²+y² ≤ 1',
            '【体积】V = ∬_D [1 - (x²+y²)] dσ（极坐标）',
            '= ∫₀²π dθ ∫₀¹ (1 - r²) · r dr = 2π · ∫₀¹ (r - r³) dr',
            '= 2π · [r²/2 - r⁴/4]₀¹ = 2π · (1/2 - 1/4) = 2π · 1/4 = π/2',
            '【重心】均匀立体，密度为常数 ρ，重心 = 形心',
            '由对称性：x̄ = 0，ȳ = 0（关于 yz 面、xz 面对称）',
            'z̄ = (1/V) · ∭_Ω z dV',
            '用柱坐标计算 ∭ z dV = ∫₀²π dθ ∫₀¹ r dr ∫_{r²}¹ z dz',
            '= 2π · ∫₀¹ r · [z²/2]_{r²}¹ dr = 2π · ∫₀¹ r·(1/2 - r⁴/2) dr',
            '= π · ∫₀¹ (r - r⁵) dr = π · [r²/2 - r⁶/6]₀¹ = π · (1/2 - 1/6) = π · 1/3 = π/3',
            'z̄ = (π/3) / (π/2) = 2/3',
            '重心：(0, 0, 2/3)',
          ],
          tip: '对称性判断重心坐标是竞赛送分题：只要积分区域关于某坐标面对称且被积函数奇函数，积分就为 0。柱坐标下三重积分的「先二后一」法（切片法）也很常用：∭ z dV = ∫₀¹ z · π(√z)² dz = ∫₀¹ πz² dz = π/3，更快捷。',
          answer: '体积 V = \\frac{\\pi}{2}，重心 (0,0,\\frac{2}{3})',
        },
      ],
    },
  ],
  pitfalls: [
    '二重积分换序时区域图画反（特别注意 y=x 和 y=√x 谁在上谁在下）',
    '极坐标计算忘记乘 r（dσ = r dr dθ，r 不能丢）',
    '曲线积分方向搞错（格林公式要求正向 = 逆时针，顺时针要加负号）',
    '高斯公式使用条件：必须是封闭曲面的外侧，否则需补面或加负号',
    '第一类曲线积分 ds 恒正，积分下限必须小于上限（与方向无关）',
    '三重积分球坐标中体积元的 sinφ 忘记乘',
    '与路径无关的条件是「在单连通域内」偏导相等，有洞时不能直接说无关',
    '轮换对称性使用错误（区域必须关于 y=x 对称才能轮换）',
  ],
};


// ========== 专题六：无穷级数 ==========
const SERIES_DETAIL: TopicDetailData = {
  topicKey: 'infinite-series',
  knowledgePoints: [
    {
      id: 'k1',
      name: '数项级数概念与性质',
      description: '级数收敛定义（部分和极限）、收敛必要条件（通项→0）、基本性质',
      formulas: ['\\sum_{n=1}^\\infty u_n = \\lim_{n\\to\\infty} S_n\;(S_n=\\sum_{k=1}^n u_k)'],
    },
    {
      id: 'k2',
      name: '正项级数判别法',
      description: '比较判别法、比值判别法（D\'Alembert）、根值判别法（Cauchy）、积分判别法',
      formulas: ['\\lim_{n\\to\\infty}\\frac{u_{n+1}}{u_n}=\\rho\\Rightarrow\\rho<1\\text{ 收敛, }\\rho>1\\text{ 发散}'],
    },
    {
      id: 'k3',
      name: '交错级数与绝对收敛',
      description: '莱布尼茨判别法、绝对收敛与条件收敛的关系',
      formulas: ['\\sum|u_n|\\text{ 收敛}\\Rightarrow\\sum u_n\\text{ 收敛（绝对收敛）}'],
    },
    {
      id: 'k4',
      name: '幂级数与收敛半径',
      description: '收敛半径 R、收敛区间、收敛域（含端点）',
      formulas: ['R = \\lim_{n\\to\\infty}\\left|\\frac{a_n}{a_{n+1}}\\right|\\quad(\\text{比值法})'],
    },
    {
      id: 'k5',
      name: '幂级数的和函数',
      description: '逐项求导、逐项积分、微分方程法求和函数',
    },
    {
      id: 'k6',
      name: '函数展开成幂级数',
      description: '泰勒级数、麦克劳林展开、间接展开法（利用已知展开式）',
      formulas: ['e^x=\\sum_{n=0}^\\infty\\frac{x^n}{n!},\\quad x\\in(-\\infty,+\\infty)'],
    },
    {
      id: 'k7',
      name: '傅里叶级数',
      description: '周期 2π 函数的傅里叶展开、狄利克雷收敛定理、和函数',
      formulas: ['a_n=\\frac{1}{\\pi}\\int_{-\\pi}^\\pi f(x)\\cos nx\,dx,\\quad b_n=\\frac{1}{\\pi}\\int_{-\\pi}^\\pi f(x)\\sin nx\,dx'],
    },
    {
      id: 'k8',
      name: '级数求和方法',
      description: '裂项相消、错位相减、利用已知展开、傅里叶级数求值、微分方程法',
    },
  ],
  questionTypes: [
    {
      id: 'qt1',
      title: '正项级数敛散性判定',
      method: '正项级数判别法选择顺序：① 看通项是否→0（不→0 直接发散）② 比值/根值（含 n! 或 n 次方）③ 比较判别法（找等价量，常与 p 级数比较）④ 积分判别法（单调递减且与积分同敛散）。竞赛常考：综合运用。',
      examples: [
        {
          id: 'ex1',
          problem: '判断级数 \\sum_{n=1}^\\infty \\frac{n!}{n^n} 的敛散性。',
          steps: [
            '通项含 n!，适合用比值判别法',
            'u_n = n!/nⁿ > 0',
            'u_{n+1}/u_n = [(n+1)!/(n+1)^{n+1}] / [n!/nⁿ]',
            '= (n+1)! · nⁿ / [n! · (n+1)^{n+1}]',
            '= (n+1) · nⁿ / [(n+1)·(n+1)ⁿ] = nⁿ / (n+1)ⁿ = 1 / (1+1/n)ⁿ',
            'lim(n→∞) u_{n+1}/u_n = lim 1/(1+1/n)ⁿ = 1/e < 1',
            '由比值判别法，原级数收敛。',
          ],
          tip: '比值判别法特别适合「含阶乘」或「含 n 次方的乘积型」通项。经典结论：∑ n!/nⁿ 收敛（比 = 1/e < 1），∑ nⁿ/n! 发散（比 = e > 1）。竞赛中 1/e 和 e 这两个数要眼熟。',
          answer: '收敛（比值 = 1/e < 1）',
        },
      ],
    },
    {
      id: 'qt2',
      title: '条件收敛与绝对收敛判断',
      method: '步骤：① 先判断 ∑|u_n| 是否收敛（用正项级数判别法）② 若收敛 → 绝对收敛 ③ 若发散，再看原级数（交错级数用莱布尼茨，一般级数看其他方法）④ 原级数收敛但绝对值发散 → 条件收敛。含参数的题要讨论。',
      examples: [
        {
          id: 'ex1',
          problem: '讨论级数 \\sum_{n=1}^\\infty (-1)^{n+1}\\frac{1}{n^p} 的敛散性（包括绝对收敛、条件收敛、发散）。',
          steps: [
            '这是交错 p 级数，通项 u_n = (-1)^{n+1}/n^p',
            '|u_n| = 1/n^p，∑|u_n| = ∑ 1/n^p 是 p 级数',
            '我们知道 p 级数：p > 1 时收敛，p ≤ 1 时发散',
            '【情况 1：p > 1】∑|u_n| 收敛，故原级数绝对收敛',
            '【情况 2：0 < p ≤ 1】∑|u_n| 发散',
            '看原交错级数：a_n = 1/n^p',
            'a_n 单调递减（因为 n^p 递增），且 lim a_n = 0',
            '由莱布尼茨判别法，原级数收敛',
            '因绝对值级数发散但原级数收敛 → 条件收敛',
            '【情况 3：p ≤ 0】|u_n| = 1/n^p = n^{|p|} → ∞（当 n→∞ 时）',
            '通项不趋于 0，级数发散',
            '综上：p > 1 绝对收敛，0 < p ≤ 1 条件收敛，p ≤ 0 发散',
          ],
          tip: '交错 p 级数是竞赛经典模型，结论要牢记。判断顺序：先绝对→再条件→最后发散。注意：比值/根值判定绝对值发散时（ρ > 1），因为通项不趋于 0，原级数也发散（不需要再用莱布尼茨）。',
          answer: 'p > 1 绝对收敛；0 < p \\leq 1 条件收敛；p \\leq 0 发散',
        },
      ],
    },
    {
      id: 'qt3',
      title: '幂级数收敛半径与收敛域',
      method: '收敛半径求法：① 比值法 R = lim |a_n/a_{n+1}| ② 根值法 R = 1/lim √[n]{|a_n|}。收敛域 = 收敛区间 + 端点检验（端点处是数项级数，用数项级数判别法单独判断）。竞赛常考：缺项幂级数（用比值法直接套到完整通项上）。',
      examples: [
        {
          id: 'ex1',
          problem: '求幂级数 \\sum_{n=1}^\\infty \\frac{(x-1)^n}{n} 的收敛域。',
          steps: [
            '【方法一：标准幂级数】令 t = x - 1，则级数变为 ∑ tⁿ/n',
            'a_n = 1/n',
            '收敛半径 R = lim |a_n/a_{n+1}| = lim (1/n)/(1/(n+1)) = lim (n+1)/n = 1',
            '所以 |t| < 1 即 |x-1| < 1 → 0 < x < 2 时绝对收敛',
            '【端点检验】',
            'x = 0 时：级数 = ∑ (-1)ⁿ/n，这是交错调和级数，条件收敛（莱布尼茨）',
            'x = 2 时：级数 = ∑ 1ⁿ/n = ∑ 1/n，调和级数，发散',
            '故收敛域为 [0, 2)',
            '【方法二：直接用比值法（对完整通项）】',
            'u_n(x) = (x-1)ⁿ/n',
            '|u_{n+1}/u_n| = |(x-1)^{n+1}/(n+1) · n/(x-1)ⁿ| = |x-1| · n/(n+1) → |x-1|',
            '|x-1| < 1 收敛，|x-1| > 1 发散，R = 1。端点检验同上。',
          ],
          tip: '求收敛域的步骤：① 求收敛半径 ② 写出收敛区间 ③ 检验两个端点 ④ 写出收敛域。端点检验最容易忘！竞赛中收敛域的开闭区间写错会扣分。缺项级数（如只有偶次项）不能直接用 a_n 比值，必须用完整通项比值或根值。',
          answer: '收敛域为 [0, 2)',
        },
      ],
    },
    {
      id: 'qt4',
      title: '幂级数求和函数',
      method: '求和函数的常用技巧：① 逐项求导（消去分母的 n）② 逐项积分（消去分子的 n）③ 等比级数求和公式 ④ 利用已知函数的展开式（eˣ, sinx, cosx, ln(1+x), (1+x)^α 等）。竞赛难点：建立微分方程求和函数。',
      examples: [
        {
          id: 'ex1',
          problem: '求幂级数 \\sum_{n=1}^\\infty \\frac{x^n}{n} 的和函数。',
          steps: [
            '设 S(x) = ∑(n=1)^∞ xⁿ/n，先求收敛域',
            'a_n = 1/n，R = lim |a_n/a_{n+1}| = lim (n+1)/n = 1',
            '端点：x=-1 时交错调和级数收敛，x=1 时调和级数发散',
            '收敛域：[-1, 1)',
            '【逐项求导法】',
            'S(x) = x + x²/2 + x³/3 + x⁴/4 + ...',
            '在收敛区间内逐项求导：',
            'S\'(x) = 1 + x + x² + x³ + ... = ∑(n=0)^∞ xⁿ = 1/(1-x)（等比级数，|x|<1）',
            '两边积分：S(x) - S(0) = ∫₀ˣ 1/(1-t) dt = -ln(1-x)',
            'S(0) = 0（代入 x=0，各项均为 0）',
            '所以 S(x) = -ln(1-x)，x ∈ (-1, 1)',
            '【端点 x = -1】',
            '由阿贝尔定理，S(x) 在 x=-1 处左连续（级数在 x=-1 收敛）',
            'S(-1) = lim(x→-1⁺) -ln(1-x) = -ln 2',
            '故 S(x) = -ln(1-x)，x ∈ [-1, 1)',
          ],
          tip: '∑ xⁿ/n = -ln(1-x) 是最基础的幂级数和函数之一，必须记住。竞赛常用技巧：分母有 n → 求导消掉；分子有 n → 积分消掉。注意逐项求导/积分后收敛半径不变，但端点处敛散性可能变化，需单独验证。',
          answer: 'S(x) = -\\ln(1-x),\\quad x\\in[-1,1)',
        },
      ],
    },
    {
      id: 'qt5',
      title: '数项级数求和',
      method: '数项级数求和方法：① 裂项相消（分式拆差）② 错位相减（等差×等比型）③ 构造幂级数（代入特殊 x 值）④ 利用已知展开式 ⑤ 傅里叶级数赋值法。竞赛常考：∑ n/2ⁿ 型、裂项型。',
      examples: [
        {
          id: 'ex1',
          problem: '求级数 \\sum_{n=1}^\\infty \\frac{n}{2^n} 的和。',
          steps: [
            '【方法一：错位相减】',
            '设 S = ∑(n=1)^∞ n/2ⁿ = 1/2 + 2/4 + 3/8 + 4/16 + ...',
            'S/2 = 1/4 + 2/8 + 3/16 + 4/32 + ...',
            '两式相减：S - S/2 = 1/2 + 1/4 + 1/8 + 1/16 + ...',
            'S/2 = (1/2)/(1 - 1/2) = (1/2)/(1/2) = 1（等比级数求和）',
            '所以 S = 2',
            '【方法二：幂级数法】',
            '考虑 S(x) = ∑(n=1)^∞ n xⁿ，原级数 = S(1/2)',
            'S(x) = x · ∑(n=1)^∞ n x^{n-1} = x · [∑(n=1)^∞ xⁿ]\'',
            '= x · [x/(1-x)]\' = x · 1/(1-x)² = x/(1-x)²',
            'S(1/2) = (1/2)/(1-1/2)² = (1/2)/(1/4) = 2',
          ],
          tip: '∑ n xⁿ = x/(1-x)² 是高频求和公式，|x|<1 时成立。记住「∑ n xⁿ = x/(1-x)²」，竞赛选择题/填空题可秒出答案。更一般地：∑ n(n-1)xⁿ = 2x²/(1-x)³，也是常用二级结论。',
          answer: '2',
        },
        {
          id: 'ex2',
          problem: '求级数 \\sum_{n=1}^\\infty \\frac{1}{n(n+1)} 的和。',
          steps: [
            '【裂项相消法】通项 1/n(n+1) 拆成两项之差',
            '设 1/n(n+1) = A/n + B/(n+1)',
            '通分：1 = A(n+1) + Bn = (A+B)n + A',
            '比较系数：A = 1，A+B = 0 → B = -1',
            '所以 1/n(n+1) = 1/n - 1/(n+1)',
            '部分和 S_n = ∑(k=1)^n [1/k - 1/(k+1)]',
            '= (1 - 1/2) + (1/2 - 1/3) + (1/3 - 1/4) + ... + (1/n - 1/(n+1))',
            '中间项全部抵消 = 1 - 1/(n+1)',
            'S = lim(n→∞) S_n = lim [1 - 1/(n+1)] = 1',
          ],
          tip: '裂项相消是级数求和的入门级方法，但竞赛中常出变形：1/n(n+k) = (1/k)(1/n - 1/(n+k))、1/(2n-1)(2n+1) = (1/2)(1/(2n-1) - 1/(2n+1)) 等。关键是把通项拆成「相邻两项的差」。',
          answer: '1',
        },
      ],
    },
    {
      id: 'qt6',
      title: '函数展开成幂级数（间接法）',
      method: '间接展开法：利用已知的 eˣ、sinx、cosx、ln(1+x)、1/(1-x)、(1+x)^α 等展开式，通过变量替换、逐项求导、逐项积分等方法，将目标函数展开为幂级数。竞赛必背：6 个基本展开式 + 收敛区间。',
      examples: [
        {
          id: 'ex1',
          problem: '将函数 f(x) = \\arctan x 展开为麦克劳林级数。',
          steps: [
            '已知 f\'(x) = 1/(1+x²)',
            '由几何级数：1/(1+t) = ∑(n=0)^∞ (-1)ⁿ tⁿ，|t| < 1',
            '令 t = x²，得：1/(1+x²) = ∑(n=0)^∞ (-1)ⁿ x^{2n}，|x| < 1',
            '即 f\'(x) = ∑(n=0)^∞ (-1)ⁿ x^{2n}，|x| < 1',
            '两边从 0 到 x 逐项积分：',
            'f(x) - f(0) = ∫₀ˣ ∑(-1)ⁿ t^{2n} dt = ∑(-1)ⁿ ∫₀ˣ t^{2n} dt',
            '= ∑(n=0)^∞ (-1)ⁿ · x^{2n+1}/(2n+1)',
            'f(0) = arctan 0 = 0',
            '所以 arctan x = ∑(n=0)^∞ (-1)ⁿ x^{2n+1}/(2n+1)，|x| < 1',
            '【端点检验】',
            'x = 1 时：∑ (-1)ⁿ/(2n+1)，交错级数，莱布尼茨判别收敛',
            'x = -1 时：∑ (-1)^{3n+1}/(2n+1) = -∑ (-1)ⁿ/(2n+1)，同理收敛',
            '故展开式在 x ∈ [-1, 1] 上成立',
            '【经典结论】令 x=1：arctan 1 = π/4 = ∑(-1)ⁿ/(2n+1) = 1 - 1/3 + 1/5 - 1/7 + ...',
          ],
          tip: 'arctan x 的展开式是竞赛热点，因为它关联着 π 的级数表示（莱布尼茨公式）。间接展开法的核心思路：对函数求导 → 化为已知展开式 → 再积分还原。注意：积分可能扩大收敛域（端点从发散变收敛），求导可能缩小收敛域。',
          answer: '\\arctan x = \\sum_{n=0}^\\infty (-1)^n\\frac{x^{2n+1}}{2n+1},\\quad x\\in[-1,1]',
        },
      ],
    },
    {
      id: 'qt7',
      title: '傅里叶级数与狄利克雷定理',
      method: '周期 2π 函数的傅里叶级数：f(x) ~ a₀/2 + ∑(a_n cos nx + b_n sin nx)。狄利克雷收敛定理：在 f 的连续点收敛于 f(x)，在间断点收敛于 [f(x⁺)+f(x⁻)]/2。奇偶延拓、周期延拓是常见技巧。',
      examples: [
        {
          id: 'ex1',
          problem: '将 f(x) = x 在 (-\\pi,\\pi) 上展开为傅里叶级数，并求其和函数 S(x) 在 x = \\pi 处的值。',
          steps: [
            'f(x) = x 在 (-π, π) 上是奇函数',
            '所以 a_n = 0（n = 0, 1, 2, ...）',
            '只需计算正弦系数 b_n：',
            'b_n = (1/π)∫_{-π}^π f(x)sin(nx)dx = (2/π)∫₀^π x·sin(nx)dx',
            '分部积分：u = x，dv = sin(nx)dx → du = dx，v = -cos(nx)/n',
            '∫ x sin(nx) dx = -x cos(nx)/n + (1/n)∫ cos(nx) dx',
            '= -x cos(nx)/n + sin(nx)/n²',
            'b_n = (2/π)[-x cos(nx)/n + sin(nx)/n²]₀^π',
            '= (2/π)[-π cos(nπ)/n - 0 + 0 - 0] = (2/π)(-π(-1)ⁿ/n) = 2·(-1)^{n+1}/n',
            '所以 f(x) ~ ∑(n=1)^∞ [2(-1)^{n+1}/n] · sin(nx)',
            '【和函数 S(π)】由狄利克雷收敛定理',
            'f 在 x = π 处为间断点（周期延拓后 f(π⁻)=π, f(π⁺)=-π）',
            'S(π) = [f(π⁻) + f(π⁺)]/2 = [π + (-π)]/2 = 0',
          ],
          tip: '狄利克雷定理的和函数取值是竞赛填空高频考点：连续点 = f(x)，间断点 = 左右极限平均值。奇函数展开只有正弦项，偶函数展开只有余弦项（含 a₀），能省一半计算。【经典结论】令 x=π/2，可得 π/4 = 1 - 1/3 + 1/5 - 1/7 + ...（莱布尼茨级数）。',
          answer: 'f(x) = 2\\sum_{n=1}^\\infty\\frac{(-1)^{n+1}}{n}\\sin nx\;(x\\in(-\\pi,\\pi))，\\quad S(\\pi)=0',
        },
      ],
    },
    {
      id: 'qt8',
      title: '级数综合题与证明题',
      method: '级数证明题常用方法：① 比较判别法（找不等式关系）② 柯西收敛准则 ③ 级数收敛 ⇔ 部分和数列收敛（转化为数列问题）④ 构造幂级数/函数项级数（把数项问题化为函数问题）。竞赛压轴常考。',
      examples: [
        {
          id: 'ex1',
          problem: '已知 \\sum_{n=1}^\\infty a_n^2 和 \\sum_{n=1}^\\infty b_n^2 都收敛，证明 \\sum_{n=1}^\\infty a_n b_n 绝对收敛。',
          steps: [
            '【思路：用柯西不等式 + 比较判别法】',
            '由基本不等式：对任意实数 a, b，有 |ab| ≤ (a² + b²)/2',
            '（证明：( |a| - |b| )² ≥ 0 ⇒ a² - 2|ab| + b² ≥ 0 ⇒ |ab| ≤ (a²+b²)/2）',
            '所以对每个 n：|a_n b_n| ≤ (a_n² + b_n²)/2',
            '已知 ∑ a_n² 收敛，∑ b_n² 收敛',
            '故 ∑ (a_n² + b_n²)/2 = (1/2)∑ a_n² + (1/2)∑ b_n² 收敛',
            '由正项级数比较判别法：0 ≤ |a_n b_n| ≤ (a_n²+b_n²)/2，且大者收敛',
            '所以 ∑ |a_n b_n| 收敛，即 ∑ a_n b_n 绝对收敛。',
            '【注】这其实是离散形式的柯西-施瓦茨不等式：',
            '(∑a_n b_n)² ≤ (∑a_n²)(∑b_n²)',
          ],
          tip: '级数证明题的核心思想是「不等式估计」。常见套路：基本不等式、均值不等式、柯西不等式、放缩法。记住几个关键不等式：|ab| ≤ (a²+b²)/2、柯西不等式、Holder 不等式、Minkowski 不等式。',
          answer: '由比较判别法得证',
        },
      ],
    },
  ],
  pitfalls: [
    '比值判别法和根值判别法当 ρ = 1 时失效，需要换用其他方法',
    '求幂级数收敛域时忘记检验端点（端点处可能条件收敛）',
    '逐项求导后收敛半径不变，但端点处敛散性可能变差（需要重新检验）',
    '傅里叶级数在间断点处收敛于左右极限的平均值，不是 f(x)',
    '交错级数莱布尼茨判别法只充分非必要（不满足也可能收敛）',
    '条件收敛级数的重排性质（黎曼定理：可重排到任意和）常出选择题',
    '级数收敛的必要条件是通项→0，但通项→0 不能推出收敛（如 ∑ 1/n）',
    '正项级数比较判别法的极限形式中，lim = 0 时结论是单向的（小的发散→大的不一定）',
  ],
};


// ========== 专题七：常微分方程 ==========
const ODE_DETAIL: TopicDetailData = {
  topicKey: 'ode',
  knowledgePoints: [
    {
      id: 'ode-k1',
      name: '微分方程基本概念',
      description: '阶、通解、特解、初值问题（柯西问题）、解的存在唯一性',
      formulas: ['F(x, y, y\', ..., y^{(n)}) = 0\text{（n 阶微分方程一般形式）}'],
    },
    {
      id: 'ode-k2',
      name: '可分离变量方程与齐次方程',
      description: '分离变量法、齐次方程换元 u = y/x',
      formulas: ['\frac{dy}{dx}=f(x)g(y)\Rightarrow\int\frac{dy}{g(y)}=\int f(x)dx'],
    },
    {
      id: 'ode-k3',
      name: '一阶线性方程与伯努利方程',
      description: '积分因子法、伯努利方程换元化为线性',
      formulas: ['y\'+P(x)y=Q(x)\Rightarrow y=e^{-\int Pdx}\left(\int Qe^{\int Pdx}dx+C\right)'],
    },
    {
      id: 'ode-k4',
      name: '全微分方程与积分因子',
      description: '恰当方程条件、积分因子的寻求（仅乘 x^m y^n 型）',
      formulas: ['Mdx+Ndy=0\text{ 全微分 }\iff\frac{\partial M}{\partial y}=\frac{\partial N}{\partial x}'],
    },
    {
      id: 'ode-k5',
      name: '可降阶高阶方程',
      description: 'y\'\'=f(x) 型、y\'\'=f(x,y\') 缺 y 型、y\'\'=f(y,y\') 缺 x 型',
    },
    {
      id: 'ode-k6',
      name: '二阶常系数齐次线性方程',
      description: '特征根法：实异根、实重根、共轭复根',
      formulas: ['y\'\'+py\'+qy=0\Rightarrow r^2+pr+q=0\text{（特征方程）}'],
    },
    {
      id: 'ode-k7',
      name: '二阶常系数非齐次线性方程',
      description: '待定系数法、比较系数法、自由项多项式×指数×三角',
    },
    {
      id: 'ode-k8',
      name: '欧拉方程',
      description: '变系数方程，换元 x = e^t 化为常系数',
      formulas: ['x^2y\'\' + pxy\' + qy = f(x)\text{，令 }t=\ln x'],
    },
    {
      id: 'ode-k9',
      name: '微分方程应用（建模）',
      description: '几何应用、物理应用（增长/衰减、振动、冷却定律）',
    },
  ],
  questionTypes: [
    {
      id: 'ode-t1',
      title: '一阶方程类型识别与解法选择',
      method: '竞赛中一阶方程常考的关键是「快速判断类型」。按优先级：① 先看是不是可分离变量 ② 是不是齐次（分子分母同次） ③ 是不是线性 ④ 是不是伯努利 ⑤ 是不是全微分。每种类型对应固定解法，快速匹配后套公式即可。',
      examples: [
        {
          id: 'ode-e1',
          problem: '求方程 y\' = \frac{x+y}{x-y} 的通解。',
          steps: [
            '【识别类型】右边分子分母都是一次齐次式，属于齐次方程',
            '令 u = y/x，则 y = ux，y\' = u + x·du/dx',
            '代入方程：u + x·du/dx = (1+u)/(1-u)',
            '整理得：x·du/dx = (1+u²)/(1-u)',
            '分离变量：(1-u)/(1+u²) du = dx/x',
            '积分：∫(1-u)/(1+u²)du = ∫dx/x',
            'arctan(u) - (1/2)ln(1+u²) = ln|x| + C',
            '代回 u = y/x，隐式通解：arctan(y/x) - (1/2)ln(x²+y²) = C',
          ],
          tip: '齐次方程的识别要点：右边分子分母各项次数相同。换元 u=y/x 是标准做法，分离变量后积分即可。注意最后要代回原变量。',
          answer: '\arctan\frac{y}{x} - \frac{1}{2}\ln(x^2+y^2) = C',
        },
      ],
    },
    {
      id: 'ode-t2',
      title: '一阶线性方程（积分因子法）',
      method: '一阶线性方程标准形式：y\' + P(x)y = Q(x)。积分因子 μ(x) = e^{∫P(x)dx}。通解公式：y = (1/μ)(∫ μQ dx + C)。竞赛必背公式，也要会推导（两边乘积分因子后左边是乘积导数）。',
      examples: [
        {
          id: 'ode-e2',
          problem: '求方程 y\' + y/x = x² 的通解。',
          steps: [
            '【标准形式】y\' + (1/x)y = x²，其中 P(x) = 1/x，Q(x) = x²',
            '积分因子 μ = e^{∫(1/x)dx} = e^{ln|x|} = x',
            '原方程两边乘 x：x·y\' + y = x³',
            '左边是乘积导数：(xy)\' = x³',
            '两边积分：xy = x⁴/4 + C',
            '通解：y = x³/4 + C/x',
            '【验证】y\' = 3x²/4 - C/x²',
            'y\' + y/x = 3x²/4 - C/x² + x²/4 + C/x² = x² ✓',
          ],
          tip: '一阶线性方程是竞赛最高频考点之一。记住积分因子公式和「乘积分因子后左边是 (μy)\'」这个核心思想。注意：方程必须写成 y\' + P(x)y = Q(x) 的标准形式（y\' 的系数为 1），否则要先归一化。',
          answer: 'y = \frac{x^3}{4} + \frac{C}{x}',
        },
      ],
    },
    {
      id: 'ode-t3',
      title: '伯努利方程（换元化线性）',
      method: '伯努利方程：y\' + P(x)y = Q(x)yⁿ（n ≠ 0,1）。解法：令 z = y^{1-n}，方程化为 z 的一阶线性方程。竞赛中常作为「换元化归」的典型例子。',
      examples: [
        {
          id: 'ode-e3',
          problem: '求方程 y\' + y = xy² 的通解。',
          steps: [
            '【识别伯努利方程】n = 2，令 z = y^{1-2} = 1/y，则 y = 1/z，y\' = -z\'/z²',
            '代入原方程：-z\'/z² + 1/z = x · (1/z)²',
            '两边乘 z² 消去分母：-z\' + z = x',
            '整理为标准线性方程：z\' - z = -x',
            '积分因子 μ = e^{∫(-1)dx} = e^{-x}',
            '两边乘 e^{-x}：e^{-x}·z\' - e^{-x}·z = -x·e^{-x}',
            '左边：(e^{-x}z)\' = -x·e^{-x}',
            '积分（分部）：e^{-x}z = (x+1)e^{-x} + C',
            'z = x + 1 + Ce^x',
            '代回 z = 1/y：1/y = x + 1 + Ce^x，即 y = 1/(x+1+Ce^x)',
          ],
          tip: '伯努利方程是竞赛常考的「换元题型」。关键识别：y\' + 线性项 = yⁿ 项。令 z = y^{1-n} 后一定化为线性方程（因为 n=0 或 1 时本身就是线性或可分离的）。注意 n>1 时除以 yⁿ 可能丢解 y=0，要检验。',
          answer: 'y = \frac{1}{x+1+Ce^x}',
        },
      ],
    },
    {
      id: 'ode-t4',
      title: '可降阶高阶方程',
      method: '三类可降阶方程：① y\'\'=f(x)：直接积分两次 ② y\'\'=f(x,y\')（缺 y）：令 p = y\'，y\'\' = p\'，化为一阶方程 ③ y\'\'=f(y,y\')（缺 x）：令 p = y\'，y\'\' = p·dp/dy，化为 p 对 y 的一阶方程。',
      examples: [
        {
          id: 'ode-e4',
          problem: '求方程 y\'\' = 2y · y\' 满足 y(0)=1, y\'(0)=2 的特解。',
          steps: [
            '【缺 x 型】令 p = y\'，则 y\'\' = dp/dx = dp/dy · dy/dx = p · dp/dy',
            '代入方程：p·dp/dy = 2y·p',
            '若 p ≠ 0，约去 p：dp/dy = 2y',
            '积分：p = y² + C₁，即 y\' = y² + C₁',
            '【代入初值 y(0)=1, y\'(0)=2】2 = 1² + C₁，得 C₁ = 1',
            '所以 y\' = y² + 1',
            '分离变量：dy/(y²+1) = dx',
            '积分：arctan(y) = x + C₂',
            'y = tan(x + C₂)',
            '由 y(0)=1：1 = tan(C₂)，C₂ = π/4',
            '特解：y = tan(x + π/4)',
            '【验证】y\' = sec²(x+π/4) = 1 + tan²(x+π/4) = 1 + y²',
            'y\'\' = 2y·y\' = 2y(1+y²)，原方程右边 = 2y·y\' = 2y(1+y²) ✓',
          ],
          tip: '缺 x 型方程（y\'\'=f(y,y\')）的关键技巧：令 y\'\' = p·dp/dy（把 y 当作自变量），而不是 y\'\' = dp/dx。这样做的好处是方程里不再有 x，变成 p 关于 y 的一阶方程，容易分离变量。竞赛常考这种「变量角色互换」的思想。',
          answer: 'y = \tan(x + \frac{\pi}{4})',
        },
      ],
    },
    {
      id: 'ode-t5',
      title: '二阶常系数齐次线性方程（特征根法）',
      method: '对 y\'\' + py\' + qy = 0，写出特征方程 r² + pr + q = 0，求根 r₁, r₂：① 实异根：y = C₁e^{r₁x} + C₂e^{r₂x} ② 实重根：y = (C₁+C₂x)e^{rx} ③ 共轭复根 r = α ± iβ：y = e^{αx}(C₁cosβx + C₂sinβx)。',
      examples: [
        {
          id: 'ode-e5',
          problem: '求方程 y\'\' - 5y\' + 6y = 0 满足 y(0)=1, y\'(0)=0 的特解。',
          steps: [
            '【特征方程】r² - 5r + 6 = 0',
            '因式分解：(r-2)(r-3) = 0，得 r₁ = 2, r₂ = 3（实异根）',
            '通解：y = C₁e^{2x} + C₂e^{3x}',
            '求导：y\' = 2C₁·e^{2x} + 3C₂·e^{3x}',
            '代入 y(0) = 1：C₁ + C₂ = 1',
            "y'(0) = 2C₁ + 3C₂ = 0",
            '解方程组：C₁ = 3, C₂ = -2',
            '特解：y = 3e^{2x} - 2e^{3x}',
            "y'' - 5y' + 6y = (12-30+18)e^{2x} + (-18+30-12)e^{3x} = 0 ✓",
          ],
          tip: '二阶常系数齐次方程是微分方程基础中的基础，竞赛中常作为更复杂问题的铺垫。特征根法三步：写特征方程 → 求根 → 按根的类型写通解。初值条件在通解及一阶导数都求好后代入，不要太早代入。',
          answer: 'y = 3e^{2x} - 2e^{3x}',
        },
      ],
    },
    {
      id: 'ode-t6',
      title: '二阶常系数非齐次（待定系数法）',
      method: '通解 = 齐次通解 + 一个特解。特解形式由自由项 f(x) 决定：多项式 → 设同次多项式；e^{λx}×多项式 → 设 x^k × 同次多项式 × e^{λx}（k 按 λ 是几重特征根取 0,1,2）；三角函数 → 用复数法或设 Acosωx+Bsinωx。',
      examples: [
        {
          id: 'ode-e6',
          problem: '求方程 y\'\' + y = sinx 的通解。',
          steps: [
            '【齐次部分】y\'\' + y = 0',
            '特征方程：r² + 1 = 0，r = ±i（共轭复根）',
            '齐次通解：Y = C₁cosx + C₂sinx',
            '【特解】自由项 sinx = e^{0·x}·sin(1·x)，对应 λ + iω = i',
            '由于 i 是特征方程的单根，特解需乘 x',
            '设特解 y* = x·(Acosx + Bsinx)',
            "y*' = (A cos x + B sin x) + x·(-A sin x + B cos x)",
            "y*'' = (-A sin x + B cos x) + (-A sin x + B cos x) + x·(-A cos x - B sin x)",
            "y*'' = -2A sin x + 2B cos x - x(A cos x + B sin x)",
            '代入方程：y*\'\' + y* = -2Asinx + 2Bcosx = sinx',
            '比较系数：-2A = 1（sinx 项），2B = 0（cosx 项）',
            '得 A = -1/2, B = 0',
            '特解：y* = - (1/2)x·cosx',
            '通解：y = C₁cosx + C₂sinx - (1/2)x·cosx',
          ],
          tip: '非齐次特解的待定系数法中，最容易错的是「特解形式是否要乘 x」。判断标准：自由项对应的 λ+iω 是否是特征根，是几重根就乘几次 x。本题中 sinx 对应 i，是 r²+1=0 的单根，所以特解要乘 x。',
          answer: 'y = C_1\cos x + C_2\sin x - \frac{1}{2}x\cos x',
        },
      ],
    },
    {
      id: 'ode-t7',
      title: '欧拉方程（变系数化常系数）',
      method: '欧拉方程标准形式：xⁿy^{(n)} + a₁x^{n-1}y^{(n-1)} + ... + aₙy = f(x)。解法：令 x = e^t（或 t = ln x），将方程化为关于 t 的常系数线性方程。核心替换：xy\' = Dy，x²y\'\' = D(D-1)y，其中 D = d/dt。',
      examples: [
        {
          id: 'ode-e7',
          problem: '求欧拉方程 x²y\'\' - 2xy\' + 2y = 0 的通解。',
          steps: [
            '【欧拉方程】x²y\'\' - 2xy\' + 2y = 0',
            '令 x = e^t，即 t = ln x (x > 0)',
            '记 D = d/dt，则 xy\' = Dy，x²y\'\' = D(D-1)y',
            '代入方程：D(D-1)y - 2Dy + 2y = 0',
            '(D² - 3D + 2)y = 0',
            '特征方程：r² - 3r + 2 = 0',
            '(r-1)(r-2) = 0，r₁ = 1, r₂ = 2',
            '关于 t 的通解：y = C₁e^t + C₂e^{2t}',
            '代回 t = ln x：y = C₁x + C₂x²',
            '【验证】y = C₁x + C₂x²',
            'y\' = C₁ + 2C₂x',
            'y\'\' = 2C₂',
            'x²y\'\' - 2xy\' + 2y = 2C₂x² - 2x(C₁+2C₂x) + 2(C₁x+C₂x²)',
            '= 2C₂x² - 2C₁x - 4C₂x² + 2C₁x + 2C₂x² = 0 ✓',
          ],
          tip: '欧拉方程的识别标志：y 的 k 阶导数前面乘 x^k。解题口诀：「遇欧拉，换 x=e^t，D(D-1)...(D-k+1) 换 x^k y^{(k)}」。二阶欧拉方程最简单：x²y\'\'+pxy\'+qy=0，也可以直接试解 y=x^r 代入，得到特征方程 r(r-1)+pr+q=0，结果一样。',
          answer: 'y = C_1 x + C_2 x^2',
        },
      ],
    },
    {
      id: 'ode-t8',
      title: '微分方程应用题（建模）',
      method: '应用题关键是把自然语言翻译成微分方程。常见模型：① 增长/衰减：dN/dt = kN ② 冷却定律：dT/dt = k(T - T₀) ③ 振动问题：m·x\'\' = -kx ④ 混合问题。建模三步：设变量 → 找变化率关系 → 列方程 + 初值。',
      examples: [
        {
          id: 'ode-e8',
          problem: '某物体冷却速率与物体和环境温差成正比。设室温为 20°C，物体初始温度为 100°C，20 分钟后降到 60°C。问从 100°C 降到 30°C 需要多少分钟？',
          steps: [
            '【牛顿冷却定律】dT/dt = -k(T - T₀)，其中 T₀ = 20°C',
            '令 u = T - T₀ = T - 20，则 du/dt = -ku',
            '分离变量：du/u = -kdt，积分得 u = Ce^{-kt}',
            'T = T₀ + Ce^{-kt} = 20 + Ce^{-kt}',
            '由 T(0) = 100：100 = 20 + C，C = 80',
            'T(t) = 20 + 80e^{-kt}',
            '由 T(20) = 60：60 = 20 + 80e^{-20k}',
            '40 = 80e^{-20k}，e^{-20k} = 1/2',
            'e^{-k} = (1/2)^{1/20}',
            '求 T(t) = 30 时的 t：30 = 20 + 80e^{-kt}',
            '10 = 80e^{-kt}，e^{-kt} = 1/8 = (1/2)^3',
            '(e^{-k})^t = (1/2)^3，即 (1/2)^{t/20} = (1/2)^3',
            't/20 = 3，t = 60 分钟',
          ],
          tip: '冷却问题是竞赛应用题经典题型。记住冷却定律的解形式：T(t) = T₀ + (T₀-T₀)e^{-kt}，温度差是指数衰减。本题也可以用「半衰期」思路：温差从 80 降到 40 用了 20 分钟，每 20 分钟减半。从 80 到 10（=80×1/8=80×(1/2)³）需要 3 个半衰期 = 60 分钟，更快。',
          answer: '60 \text{ 分钟}',
        },
      ],
    },
  ],
  pitfalls: [
    '一阶线性方程忘记归一化（y\' 系数不为 1 就直接套公式）',
    '分离变量时除以的式子可能为零，要检查丢解（如伯努利方程中 y = 0）',
    '可降阶方程缺 x 和缺 y 型搞混（用错 p\' 还是 p·dp/dy）',
    '特征方程重根时，第二个线性无关解要乘 x（不是乘常数）',
    '非齐次特解待定系数法中，自由项对应的指数是特征根时要乘 x^k',
    '欧拉方程用 D 算子时，x²y\'\' = D(D-1)y 不是 D²y（容易记错）',
    '初值条件要在通解（及各阶导数）中代入，不要只代入通解就完事',
    '全微分方程积分因子不是通用的，只有简单形式（只与 x 有关或只与 y 有关）有公式',
  ],
};


// ========== 专题八：空间解析几何与向量代数 ==========
const SPACE_GEOMETRY_DETAIL: TopicDetailData = {
  topicKey: 'space-geo',
  knowledgePoints: [
    {
      id: 'sg-k1',
      name: '向量代数',
      description: '向量加减、数乘、点积（内积）、叉积（外积）、混合积、投影',
      formulas: [
        '\vec{a}\cdot\vec{b}=|a||b|\cos\theta = a_xb_x+a_yb_y+a_zb_z',
        '\vec{a}\times\vec{b}=\begin{vmatrix}\vec{i}&\vec{j}&\vec{k}\\a_x&a_y&a_z\\b_x&b_y&b_z\end{vmatrix}',
        '[\vec{a}\ \vec{b}\ \vec{c}]=(\vec{a}\times\vec{b})\cdot\vec{c}=\begin{vmatrix}a_x&a_y&a_z\\b_x&b_y&b_z\\c_x&c_y&c_z\end{vmatrix}',
      ],
    },
    {
      id: 'sg-k2',
      name: '平面方程',
      description: '点法式、一般式、截距式、两平面关系（平行/垂直/夹角）',
      formulas: [
        'A(x-x_0)+B(y-y_0)+C(z-z_0)=0\text{（点法式，法向量 }\vec{n}=(A,B,C)\text{）}',
        '\frac{x}{a}+\frac{y}{b}+\frac{z}{c}=1\text{（截距式）}',
      ],
    },
    {
      id: 'sg-k3',
      name: '空间直线方程',
      description: '点向式（对称式）、参数式、一般式（交面式）、两直线关系',
      formulas: [
        '\frac{x-x_0}{m}=\frac{y-y_0}{n}=\frac{z-z_0}{p}\text{（点向式，方向向量 }\vec{s}=(m,n,p)\text{）}',
      ],
    },
    {
      id: 'sg-k4',
      name: '距离与夹角',
      description: '点到平面距离、点到直线距离、两直线距离、线面/面面夹角',
      formulas: [
        'd=\frac{|Ax_0+By_0+Cz_0+D|}{\sqrt{A^2+B^2+C^2}}\text{（点到平面）}',
      ],
    },
    {
      id: 'sg-k5',
      name: '曲面方程',
      description: '柱面、旋转曲面、二次曲面（椭球面/双曲面/抛物面）',
    },
    {
      id: 'sg-k6',
      name: '空间曲线',
      description: '参数方程、一般方程、在坐标面上的投影',
    },
    {
      id: 'sg-k7',
      name: '向量的几何应用',
      description: '面积=叉积模/2、体积=混合积绝对值/6、功=点积、力矩=叉积',
    },
  ],
  questionTypes: [
    {
      id: 'sg-t1',
      title: '向量运算（点积、叉积、混合积）',
      method: '点积得标量，结果为 |a||b|cosθ；叉积得向量，方向由右手定则，模 |a||b|sinθ，几何意义是平行四边形面积；混合积 [abc] = (a×b)·c，绝对值是平行六面体体积。竞赛常考三向量共面 ⇔ 混合积为 0。',
      examples: [
        {
          id: 'sg-e1',
          problem: '已知向量 a = (1, 2, 3)，b = (2, -1, 1)。求 a·b，a×b，以及以 a, b 为邻边的平行四边形面积。',
          steps: [
            '【点积】a·b = 1×2 + 2×(-1) + 3×1 = 2 - 2 + 3 = 3',
            '【叉积】用行列式公式：',
            'a×b = |i   j   k|',
            '         1   2   3',
            '         2  -1   1',
            '= i(2×1 - 3×(-1)) - j(1×1 - 3×2) + k(1×(-1) - 2×2)',
            '= i(2+3) - j(1-6) + k(-1-4)',
            '= 5i + 5j - 5k',
            '即 a×b = (5, 5, -5)',
            '【平行四边形面积】S = |a×b|',
            '|a×b| = √(25 + 25 + 25) = √75 = 5√3',
          ],
          tip: '叉积的行列式展开是最容易算错的地方，注意第二项前面是负号。口诀：i 正、j 负、k 正。叉积方向用右手定则：四指从 a 到 b（小于 180° 的转角），大拇指方向即叉积方向。竞赛中叉积常用来求面积、求法向量、判断两向量是否平行。',
          answer: '\vec{a}\cdot\vec{b}=3,\ \vec{a}\times\vec{b}=(5,5,-5),\ S=5\sqrt{3}',
        },
      ],
    },
    {
      id: 'sg-t2',
      title: '平面方程求解',
      method: '求平面方程关键是找到一点和一个法向量。点法式最常用：已知点 (x₀,y₀,z₀) 和法向量 n=(A,B,C)，方程 A(x-x₀)+B(y-y₀)+C(z-z₀)=0。三点求平面：先求两个方向向量，叉积得法向量。',
      examples: [
        {
          id: 'sg-e2',
          problem: '求过三点 A(1, 1, 0)、B(2, 0, 1)、C(0, 2, 1) 的平面方程。',
          steps: [
            '【求两个方向向量】',
            'AB = B - A = (2-1, 0-1, 1-0) = (1, -1, 1)',
            'AC = C - A = (0-1, 2-1, 1-0) = (-1, 1, 1)',
            '【法向量 = AB × AC】',
            'n = AB × AC = |i   j   k|',
            '                     1  -1   1',
            '                    -1   1   1',
            '= i(-1×1 - 1×1) - j(1×1 - 1×(-1)) + k(1×1 - (-1)×(-1))',
            '= i(-1-1) - j(1+1) + k(1-1)',
            '= -2i - 2j + 0k = (-2, -2, 0)',
            '简化法向量：n = (1, 1, 0)（除以 -2）',
            '【点法式】用点 A(1, 1, 0)：',
            '1·(x-1) + 1·(y-1) + 0·(z-0) = 0',
            'x - 1 + y - 1 = 0',
            'x + y - 2 = 0',
            '【验证】代入 B(2,0,1)：2 + 0 - 2 = 0 ✓',
            '代入 C(0,2,1)：0 + 2 - 2 = 0 ✓',
          ],
          tip: '三点求平面是最基础的题型。注意：法向量可以用任意非零常数缩放，所以算出 (-2,-2,0) 后可以简化为 (1,1,0) 让方程更简洁。验证时把三个点都代回去确认，避免计算错误。',
          answer: 'x + y - 2 = 0',
        },
      ],
    },
    {
      id: 'sg-t3',
      title: '点到平面/直线的距离',
      method: '点到平面距离公式：d = |Ax₀+By₀+Cz₀+D| / √(A²+B²+C²)，其中平面一般式 Ax+By+Cz+D=0。点到直线距离：d = |P₀P × s| / |s|，其中 P₀ 是直线上一点，s 是方向向量。记忆：分子是平行四边形面积，分母是底边长。',
      examples: [
        {
          id: 'sg-e3',
          problem: '求点 P(1, 2, 3) 到平面 π: x + 2y + 2z - 10 = 0 的距离。',
          steps: [
            '【点到平面距离公式】d = |Ax₀+By₀+Cz₀+D| / √(A²+B²+C²)',
            '平面 π: x + 2y + 2z - 10 = 0，A=1, B=2, C=2, D=-10',
            '点 P(1, 2, 3)，x₀=1, y₀=2, z₀=3',
            '分子 = |1×1 + 2×2 + 2×3 - 10| = |1 + 4 + 6 - 10| = |1| = 1',
            '分母 = √(1² + 2² + 2²) = √9 = 3',
            'd = 1/3',
          ],
          tip: '点到平面距离公式是竞赛最高频的考点之一。记住「分子代入绝对值，分母法向量模」。公式的来源是向量在法向量方向上的投影的绝对值。注意 D 的符号：平面写成 Ax+By+Cz+D=0 时，D 前面是正号，代入公式时 Ax₀+By₀+Cz₀+D 要连 D 的符号一起算。',
          answer: 'd = \frac{1}{3}',
        },
      ],
    },
    {
      id: 'sg-t4',
      title: '直线与平面的交点与夹角',
      method: '求直线与平面交点：把直线参数方程代入平面方程，解参数 t。线面夹角 θ：sinθ = |n·s| / (|n|·|s|)，其中 n 是平面法向量，s 是直线方向向量。注意线面角是直线与它在平面上投影的夹角，范围 [0, π/2]，用的是 sin 不是 cos。',
      examples: [
        {
          id: 'sg-e4',
          problem: '求直线 L: (x-1)/1 = (y-2)/(-1) = (z-3)/2 与平面 π: x + y + z = 6 的交点。',
          steps: [
            '【直线参数化】令 (x-1)/1 = (y-2)/(-1) = (z-3)/2 = t',
            '则 x = 1 + t，y = 2 - t，z = 3 + 2t',
            '【代入平面方程】(1+t) + (2-t) + (3+2t) = 6',
            '6 + 2t = 6',
            '2t = 0，t = 0',
            '【交点】x = 1, y = 2, z = 3',
            '即交点为 (1, 2, 3)',
            '【验证】代入平面：1 + 2 + 3 = 6 ✓',
          ],
          tip: '求线面交点用参数方程最方便：把直线写成参数形式代入平面方程，解出 t 再求坐标。这是解析几何的标准套路。如果 t 无解说明直线与平面平行；t 有无数解说明直线在平面内。',
          answer: '(1, 2, 3)',
        },
      ],
    },
    {
      id: 'sg-t5',
      title: '两直线关系与异面直线距离',
      method: '两直线共面 ⇔ 方向向量叉积与连线向量的混合积为 0。异面直线距离 d = |(P₁P₂)·(s₁×s₂)| / |s₁×s₂|。分子是混合积绝对值（平行六面体体积），分母是叉积模（底面积），商就是高（距离）。',
      examples: [
        {
          id: 'sg-e5',
          problem: '已知直线 L₁: (x-1)/2 = (y-2)/3 = (z-3)/4，直线 L₂: (x-2)/3 = (y-4)/4 = (z-5)/5。判断两直线的位置关系。',
          steps: [
            '【提取信息】L₁ 过点 P₁(1,2,3)，方向向量 s₁ = (2,3,4)',
            'L₂ 过点 P₂(2,4,5)，方向向量 s₂ = (3,4,5)',
            '连线向量 P₁P₂ = (2-1, 4-2, 5-3) = (1, 2, 2)',
            '【先求 s₁ × s₂】',
            's₁×s₂ = |i  j  k|',
            '             2  3  4',
            '             3  4  5',
            '= i(15-16) - j(10-12) + k(8-9)',
            '= -i + 2j - k = (-1, 2, -1)',
            's₁×s₂ ≠ 0，说明两直线不平行',
            '【混合积】(P₁P₂)·(s₁×s₂)',
            '= 1×(-1) + 2×2 + 2×(-1) = -1 + 4 - 2 = 1 ≠ 0',
            '混合积 ≠ 0，说明三向量不共面',
            '结论：两直线为异面直线',
          ],
          tip: '判断两直线位置关系：先看方向向量是否平行（叉积是否为 0），不平行再算混合积。混合积为 0 则共面相交，不为 0 则异面。这个判定流程一定要清晰。竞赛中常配合选择题考察概念辨析。',
          answer: '两直线为异面直线',
        },
      ],
    },
    {
      id: 'sg-t6',
      title: '二次曲面识别',
      method: '常见二次曲面：① 椭球面 x²/a² + y²/b² + z²/c² = 1 ② 单叶双曲面 x²/a² + y²/b² - z²/c² = 1 ③ 双叶双曲面 x²/a² + y²/b² - z²/c² = -1 ④ 椭圆抛物面 z = x²/a² + y²/b² ⑤ 双曲抛物面（马鞍面）z = x²/a² - y²/b²。识别方法：看正号项数和等号右边。',
      examples: [
        {
          id: 'sg-e6',
          problem: '识别下列曲面类型：(1) z = x² + y²；(2) x² + y² - z² = 1；(3) z² = x² + y²。',
          steps: [
            '(1) z = x² + y²',
            '【分析】z = 平方和，z ≥ 0，等高线是圆',
            '这是旋转抛物面（椭圆抛物面的特殊情形，a=b）',
            '顶点在原点，开口沿 z 轴正方向',
            '',
            '(2) x² + y² - z² = 1',
            '【分析】正号项 2 个（x², y²），负号项 1 个（z²），等号右边为正',
            '这是单叶双曲面',
            'z=0 时截痕：x² + y² = 1（最小圆）',
            '|z| 增大时，x² + y² = 1 + z²，圆半径增大',
            '用平面 y=1 截：x² - z² = 0，即 z = ±x（两条直线）',
            '单叶双曲面是直纹面，可以由直线运动生成',
            '',
            '(3) z² = x² + y²',
            '【分析】二次齐次方程（各项都是二次）',
            '这是圆锥面（二次锥面）',
            '顶点在原点，对称轴为 z 轴',
            '注意锥面不是二次曲面（是退化的），但竞赛中常考',
          ],
          tip: '二次曲面识别是选择题高频考点。快速记忆法：看正平方项数（1个/2个/3个）+ 等号右边符号（正/负/0/一次项）。一个正号一次项 → 抛物面；两个正号右边正 → 单叶双曲面；三个正号右边正 → 椭球面。',
          answer: '(1)\text{ 旋转抛物面 }(2)\text{ 单叶双曲面 }(3)\text{ 圆锥面}',
        },
      ],
    },
    {
      id: 'sg-t7',
      title: '空间曲线在坐标面上的投影',
      method: '求空间曲线在 xy 面（z=0）上的投影：从曲线的两个曲面方程中消去 z，得到投影柱面 H(x,y)=0，投影曲线为 H(x,y)=0 且 z=0。对 yz 面和 zx 面同理。竞赛中也常考投影区域（不等式形式）。',
      examples: [
        {
          id: 'sg-e7',
          problem: '求曲线 C: {x² + y² + z² = 1, z = √(x² + y²)} 在 xy 坐标面上的投影曲线方程。',
          steps: [
            '【消去 z】把 z = √(x²+y²) 代入球面方程：',
            'x² + y² + (x² + y²) = 1',
            '2(x² + y²) = 1',
            'x² + y² = 1/2',
            '【投影柱面】x² + y² = 1/2（圆柱面）',
            '【xy 面投影曲线】x² + y² = 1/2 且 z = 0',
            '这是 xy 平面上圆心在原点、半径为 √2/2 的圆',
          ],
          tip: '求投影曲线三步走：消去目标坐标变量 → 得投影柱面 → 与坐标面方程（z=0等）联立。注意：投影是「曲线」而非「区域」，答案一定要写出 z=0（或对应坐标面方程），只写 x²+y²=1/2 不完整。',
          answer: '\begin{cases} x^2+y^2=\frac{1}{2} \\ z=0 \end{cases}',
        },
      ],
    },
    {
      id: 'sg-t8',
      title: '向量的几何应用（面积、体积）',
      method: '向量几何意义是竞赛题中「向量 + 几何」综合题的基础。三角形面积 = (1/2)|a×b|；平行四边形面积 = |a×b|；平行六面体体积 = |[abc]| = |(a×b)·c|；四面体体积 = (1/6)|[abc]|。注意混合积有正负（右手系/左手系），体积取绝对值。',
      examples: [
        {
          id: 'sg-e8',
          problem: '已知四面体的四个顶点为 A(1,1,1)、B(3,2,1)、C(2,4,1)、D(2,2,3)。求四面体体积。',
          steps: [
            '【四面体体积 = (1/6)|混合积|】',
            '从 A 出发的三个棱向量：',
            'AB = B - A = (2, 1, 0)',
            'AC = C - A = (1, 3, 0)',
            'AD = D - A = (1, 1, 2)',
            '【混合积 [AB AC AD] = (AB × AC) · AD】',
            '先算 AB × AC：',
            'AB×AC = |i  j  k|',
            '             2  1  0',
            '             1  3  0',
            '= i(1×0 - 0×3) - j(2×0 - 0×1) + k(2×3 - 1×1)',
            '= 0i - 0j + 5k = (0, 0, 5)',
            '再算与 AD 的点积：(AB×AC)·AD = 0×1 + 0×1 + 5×2 = 10',
            '【体积】V = (1/6)|10| = 10/6 = 5/3',
          ],
          tip: '四面体体积公式 (1/6)|混合积| 是竞赛填空题常考公式。混合积的三个向量必须从同一点出发（这里都从 A 出发）。混合积有轮换对称性 [abc]=[bca]=[cab]，可以用来检查计算。正负号表示向量组是右手系还是左手系，体积一定取绝对值。',
          answer: 'V = \frac{5}{3}',
        },
      ],
    },
  ],
  pitfalls: [
    '叉积方向用右手定则容易搞反（j 分量前面是负号）',
    '线面角用 sinθ 不是 cosθ（与面面角不同，容易记混）',
    '混合积求体积时忘记取绝对值（混合积可正可负）',
    '点到平面距离公式中 D 的符号（平面写成 Ax+By+Cz+D=0 时 D 含符号）',
    '两平面平行条件：法向量平行（分量成比例），不是法向量点积为零',
    '旋转曲面的判断：谁是对称轴，那个变量不动，另一个替换成 ±√(y²+z²)',
    '求曲线投影时只写柱面方程漏掉坐标面方程（答案应为联立方程组）',
    '向量投影是标量（带正负），投影向量是向量，两者概念不要混淆',
  ],
};

export const TOPIC_DETAIL_DATA: TopicDetailData[] = [
  LIMIT_CONTINUITY_DETAIL,
  SINGLE_VAR_DIFF_DETAIL,
  SINGLE_VAR_INT_DETAIL,
  MULTIVAR_DIFF_DETAIL,
  MULTIVAR_INT_DETAIL,
  SERIES_DETAIL,
  ODE_DETAIL,
  SPACE_GEOMETRY_DETAIL,
];

export function getTopicDetail(topicKey: string): TopicDetailData | undefined {
  return TOPIC_DETAIL_DATA.find((t) => t.topicKey === topicKey);
}
