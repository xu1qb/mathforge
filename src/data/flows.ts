// 数竞解题流程图数据
// formula 字段是 LaTeX（不带 $），交给 MathRenderer 渲染；
// desc 一律用中文说人话，不放裸 LaTeX 源码（全站硬规范）。

export type FlowKind = 'start' | 'decision' | 'process' | 'warn' | 'end';

export interface FlowNode {
  id: string;
  title: string;
  desc: string;
  kind: FlowKind;
  /** 节点要展示的公式，LaTeX 写法，可选 */
  formula?: string;
  /** 节点右上角的小标签，如「关键一步」 */
  tag?: string;
}

export interface FlowChart {
  id: string;
  title: string;
  /** 一句话说明这张图解决什么问题 */
  subtitle: string;
  /** 这类题在数竞里的常见考法提醒 */
  examNote: string;
  nodes: FlowNode[];
}

export const FLOW_CHARTS: FlowChart[] = [
  {
    id: 'limit',
    title: '极限题怎么想',
    subtitle: '先定型，再选工具：等价无穷小 → 洛必达 → 泰勒 → 夹逼',
    examNote: '非数学 A 类几乎每年一道求极限，1 的无穷次型与含根式的 0/0 型出现频率最高。',
    nodes: [
      {
        id: 'start',
        title: '拿到极限题',
        desc: '先别急着变形，看清趋向（有限点还是无穷）和式子结构。',
        kind: 'start',
        formula: '\\lim_{x\\to a}\\frac{f(x)}{g(x)}',
      },
      {
        id: 'decide',
        title: '代入定型',
        desc: '直接把 x = a 代进去，看落进哪种未定式；不是未定式就直接出答案。',
        kind: 'decision',
        tag: '关键一步',
        formula: '\\frac{0}{0},\\quad \\frac{\\infty}{\\infty},\\quad 0\\cdot\\infty,\\quad \\infty-\\infty,\\quad 1^{\\infty}',
      },
      {
        id: 'equivalent',
        title: '先试等价无穷小',
        desc: '乘除因子直接替换，一步到位；加减里替换要谨慎，容易丢掉同阶项。',
        kind: 'process',
        formula: '\\sin x\\sim x,\\quad 1-\\cos x\\sim\\frac{x^{2}}{2},\\quad \\ln(1+x)\\sim x',
      },
      {
        id: 'lhopital',
        title: '洛必达',
        desc: '只对 0/0 和 ∞/∞ 用；求导后极限必须存在（或为 ∞），否则这条死了。',
        kind: 'process',
        formula: '\\lim\\frac{f(x)}{g(x)}=\\lim\\frac{f\'(x)}{g\'(x)}',
      },
      {
        id: 'taylor',
        title: '泰勒展开',
        desc: '几个小量相加减时，展到「抵消之后仍不为零」的那一阶，末尾写皮亚诺余项。',
        kind: 'process',
        formula: '\\sin x=x-\\frac{x^{3}}{6}+o(x^{3})',
      },
      {
        id: 'squeeze',
        title: '夹逼',
        desc: '有界振荡量（sin、cos、(−1)ⁿ）夹在上下界之间，两边极限相同就挤出来。',
        kind: 'process',
        formula: 'g(n)\\le a_{n}\\le h(n),\\ \\lim g=\\lim h=L\\ \\Rightarrow\\ \\lim a_{n}=L',
      },
      {
        id: 'warn',
        title: '三个高频坑',
        desc: '加减里直接换等价无穷小、洛必达后极限不存在还硬写、1 的无穷次型不取对数。',
        kind: 'warn',
      },
      {
        id: 'answer',
        title: '得值并回代',
        desc: '检查符号、端点、以及是否漏了左右单侧极限。',
        kind: 'end',
      },
    ],
  },
  {
    id: 'mvt',
    title: '中值定理证明',
    subtitle: '把结论移项成「某函数导数为零」，再验三条件',
    examNote: '证明题主力题型。结论里 f 与 f′ 混合出现时，几乎一定是构造辅助函数后套罗尔。',
    nodes: [
      {
        id: 'start',
        title: '要证存在某点成立',
        desc: '题目出现「存在 ξ ∈ (a,b) 使……」这类句式，先抄下结论等式。',
        kind: 'start',
        formula: '\\exists\\,\\xi\\in(a,b):\\ \\Phi(\\xi)=0',
      },
      {
        id: 'decide',
        title: '看结论长什么样',
        desc: '只含 f 的等式、含 f 与 f′ 的混合、还是不等式？这决定用罗尔、拉格朗日还是柯西。',
        kind: 'decision',
        tag: '选定理',
      },
      {
        id: 'build',
        title: '移项构造 F',
        desc: '把结论全部移到一边等于 0，把 ξ 换成 x，凑成某个 F 的导数 F′(x)。',
        kind: 'process',
        formula: '(e^{x}f(x))\'=e^{x}\\bigl(f+f\'\\bigr),\\quad (f(x)g(x))\'=f\'g+fg\'',
      },
      {
        id: 'verify',
        title: '验三条件',
        desc: '[a,b] 上连续、(a,b) 内可导、两端 F(a)=F(b)，一条都不能少。',
        kind: 'process',
      },
      {
        id: 'fallback',
        title: '两端不等就换定理',
        desc: 'F(a) ≠ F(b) 时不满足罗尔，改用拉格朗日中值或柯西中值，把式子写成比值形式。',
        kind: 'process',
      },
      {
        id: 'warn',
        title: '猜不出辅助函数',
        desc: '反解微分方程 F′ = 0；或按结论里 f 与 f′ 的系数配比去凑 e^{kx}、x^{n} 这类因子。',
        kind: 'warn',
      },
      {
        id: 'end',
        title: '罗尔回代',
        desc: '由定理得存在 ξ 使 F′(ξ)=0，把 F 展开就是题目要的等式。',
        kind: 'end',
      },
    ],
  },
  {
    id: 'integral',
    title: '定积分计算',
    subtitle: '找原函数 → 换元 / 分部 / 对称性，三条路选一条',
    examNote: '常与大题结合出现。换元忘改上下限、分段函数不拆区间，是最常见的失分点。',
    nodes: [
      {
        id: 'start',
        title: '看清被积函数',
        desc: '多项式？三角？根式？带绝对值？先把结构认出来再动手。',
        kind: 'start',
        formula: '\\int_{a}^{b} f(x)\\,dx',
      },
      {
        id: 'decide',
        title: '能不能直接找原函数',
        desc: '基本积分表里有的，直接牛顿-莱布尼茨，别绕远路。',
        kind: 'decision',
      },
      {
        id: 'substitution',
        title: '换元',
        desc: '换元必须同时换上下限，雅可比因子别丢；换完要能积出来才算选对。',
        kind: 'process',
        formula: '\\int_{a}^{b}f(\\varphi(t))\\,\\varphi\'(t)\\,dt',
      },
      {
        id: 'byparts',
        title: '分部积分',
        desc: '口诀「反对幂指三」：反三角、对数优先当 u，指数、三角函数当 dv。',
        kind: 'process',
        formula: '\\int u\\,dv=uv-\\int v\\,du',
      },
      {
        id: 'symmetry',
        title: '用对称性和周期性',
        desc: '奇函数在对称区间上积分为 0，偶函数翻倍；周期函数可以整周期平移。',
        kind: 'process',
        formula: 'f(-x)=-f(x)\\ \\Rightarrow\\ \\int_{-a}^{a}f(x)\\,dx=0',
      },
      {
        id: 'warn',
        title: '两个经典错',
        desc: '换元忘了改上下限；被积函数含绝对值或分段点时，忘记按零点拆区间。',
        kind: 'warn',
      },
      {
        id: 'end',
        title: '代上下限',
        desc: '定积分的结果是一个数，代完检查符号与量级是否合理。',
        kind: 'end',
      },
    ],
  },
  {
    id: 'series',
    title: '级数判敛',
    subtitle: '先看通项，再分正项 / 交错 / 任意项三路审敛',
    examNote: '选择题和证明题都会考。比值法极限等于 1 时失效，是最容易踩的坑。',
    nodes: [
      {
        id: 'start',
        title: '看清级数',
        desc: '写下通项，先判断它是正项、交错还是任意项级数。',
        kind: 'start',
        formula: '\\sum_{n=1}^{\\infty} a_{n}',
      },
      {
        id: 'decide',
        title: '通项趋于 0 吗',
        desc: '这是最快的排除：通项不趋于 0，级数直接发散，不用往下算。',
        kind: 'decision',
        tag: '先排除',
        formula: '\\lim_{n\\to\\infty} a_{n}\\neq 0',
      },
      {
        id: 'ratio',
        title: '正项级数：比值 / 根值',
        desc: '相邻项比值极限小于 1 收敛、大于 1 发散；等于 1 时判别法失效。',
        kind: 'process',
        formula: '\\lim_{n\\to\\infty}\\frac{a_{n+1}}{a_{n}}=q',
      },
      {
        id: 'compare',
        title: '正项级数：比较',
        desc: '拿 p 级数、几何级数当标尺，做极限比较或不等式放缩。',
        kind: 'process',
        formula: '\\sum_{n=1}^{\\infty}\\frac{1}{n^{p}}',
      },
      {
        id: 'leibniz',
        title: '交错级数：莱布尼茨',
        desc: '通项单调递减且趋于 0，则交错级数收敛，且误差不超过首个被舍项。',
        kind: 'process',
        formula: 'a_{n}\\downarrow 0\\ \\Rightarrow\\ \\sum_{n=1}^{\\infty}(-1)^{n-1}a_{n}',
      },
      {
        id: 'absolute',
        title: '任意项：先看绝对收敛',
        desc: '绝对收敛必然收敛；只有条件收敛时才需要单独说明敛散性。',
        kind: 'process',
        formula: '\\sum|a_{n}|<+\\infty\\ \\Rightarrow\\ \\sum a_{n}<+\\infty',
      },
      {
        id: 'warn',
        title: '比值法等于 1',
        desc: '此时判别法失效，不能下结论；换比较判别法或对通项做泰勒展开。',
        kind: 'warn',
      },
      {
        id: 'end',
        title: '写清判据',
        desc: '按步给分：写明「由比值法 q = 1/2 < 1，故收敛」，别只写结论。',
        kind: 'end',
      },
    ],
  },
  {
    id: 'matrix',
    title: '矩阵秩与二次型',
    subtitle: '先问清楚要算什么，再选行变换、主子式还是特征值',
    examNote: '线代大题固定搭配：求秩 → 讨论参数 → 判正定 / 求规范形。',
    nodes: [
      {
        id: 'start',
        title: '看清给的是什么',
        desc: '给矩阵 A 就按矩阵处理；给二次型就先写出它的对称矩阵。',
        kind: 'start',
      },
      {
        id: 'decide',
        title: '问秩、正定还是对角化',
        desc: '三种问题三套工具，先定位再动笔，别一上来就硬算特征值。',
        kind: 'decision',
        tag: '定位问题',
      },
      {
        id: 'rank',
        title: '求秩',
        desc: '初等行变换化阶梯形，非零行的个数就是秩；行秩等于列秩。',
        kind: 'process',
        formula: 'r(A)=r(A^{\\mathsf{T}})=r(A^{\\mathsf{T}}A)',
      },
      {
        id: 'principal',
        title: '判正定：顺序主子式',
        desc: '二次型先写成 xᵀAx，A 对称；从左上角起所有顺序主子式全大于 0 即正定。',
        kind: 'process',
        formula: '\\Delta_{1}>0,\\ \\Delta_{2}>0,\\ \\dots,\\ \\Delta_{n}>0',
      },
      {
        id: 'eigen',
        title: '判正定：特征值',
        desc: '实对称矩阵特征值全大于 0 也等价于正定，还能顺带得到标准形。',
        kind: 'process',
        formula: '\\lambda_{i}>0\\quad(i=1,2,\\dots,n)',
      },
      {
        id: 'warn',
        title: '两个前提',
        desc: '只有对称矩阵才谈正定；主子式必须从左上角按顺序取，不能随便挑。',
        kind: 'warn',
      },
      {
        id: 'end',
        title: '结论加依据',
        desc: '写明用的是哪个判别法、算出的秩或特征值是多少，过程分比答案分值高。',
        kind: 'end',
      },
    ],
  },
  {
    id: 'probability',
    title: '概率分布识别',
    subtitle: '数「成功次数」还是等「发生时间」？一句话定分布',
    examNote: '填空题常考分布识别加期望方差；不放回抽样误用二项分布是典型陷阱。',
    nodes: [
      {
        id: 'start',
        title: '读题：在数什么',
        desc: '先把随机变量 X 的定义写清楚，它决定了后面所有公式。',
        kind: 'start',
      },
      {
        id: 'decide',
        title: '计数还是等待',
        desc: '数「多少次成功」走离散计数分布；等「多久发生一次」走连续等待分布。',
        kind: 'decision',
        tag: '定类型',
      },
      {
        id: 'binomial',
        title: '二项分布',
        desc: 'n 次独立重复试验，每次成功概率 p，X 为成功次数。',
        kind: 'process',
        formula: 'P(X=k)=\\binom{n}{k}p^{k}(1-p)^{n-k}',
      },
      {
        id: 'poisson',
        title: '泊松分布',
        desc: '单位时间或单位面积内稀有事件计数，参数 λ = np。',
        kind: 'process',
        formula: 'P(X=k)=\\frac{\\lambda^{k}}{k!}e^{-\\lambda}',
      },
      {
        id: 'geometric',
        title: '几何 / 超几何',
        desc: '首次成功所需的次数用几何分布；不放回抽样数合格品个数用超几何。',
        kind: 'process',
      },
      {
        id: 'continuous',
        title: '指数 / 正态',
        desc: '等待时间且无记忆性用指数分布；对称钟形、可标准化用正态分布。',
        kind: 'process',
        formula: 'Z=\\frac{X-\\mu}{\\sigma}\\sim N(0,1)',
      },
      {
        id: 'warn',
        title: '三个易错',
        desc: '不放回不能用二项；λ 与 np 别混；连续型随机变量取单点概率为 0。',
        kind: 'warn',
      },
      {
        id: 'end',
        title: '写分布再算',
        desc: '先写清 X ~ B(n,p) 这样的形式，再代期望方差，步骤分才拿得全。',
        kind: 'end',
      },
    ],
  },
  {
    id: 'multivar-extreme',
    title: '多元函数极值',
    subtitle: '先分无条件 / 条件，再算驻点、验二阶、别漏边界',
    examNote: '数竞常与最值应用题结合。条件极值几乎必用拉格朗日乘数法，边界最容易漏。',
    nodes: [
      {
        id: 'start',
        title: '看清目标函数',
        desc: '写出 z = f(x,y) 和它的定义域，闭区域要留意边界。',
        kind: 'start',
        formula: 'z=f(x,y)',
      },
      {
        id: 'decide',
        title: '有没有约束',
        desc: '无约束走驻点加二阶判别；有等式约束走拉格朗日乘数法。',
        kind: 'decision',
        tag: '先分岔',
      },
      {
        id: 'stationary',
        title: '求无条件驻点',
        desc: '两个偏导同时为零，解出所有驻点。',
        kind: 'process',
        formula: 'f_{x}=0,\\quad f_{y}=0',
      },
      {
        id: 'second-order',
        title: '二阶判别',
        desc: '记 A 为对 x 的二阶偏导、B 为混合偏导、C 为对 y 的二阶偏导。判别式大于 0 时是极值，A 大于 0 极小、小于 0 极大；小于 0 是鞍点；等于 0 判别失效。',
        kind: 'process',
        formula: '\\Delta=AC-B^{2}',
      },
      {
        id: 'lagrange',
        title: '条件极值：拉格朗日',
        desc: '把约束乘 λ 加进目标函数，条件极值就变成新函数的无条件驻点。',
        kind: 'process',
        formula: 'L=f(x,y)+\\lambda\\,\\varphi(x,y)',
      },
      {
        id: 'solve',
        title: '解方程组',
        desc: '三个偏导同时为零，先消 λ 得到 x、y 的关系，再代回约束。',
        kind: 'process',
        formula: 'L_{x}=0,\\quad L_{y}=0,\\quad L_{\\lambda}=0',
      },
      {
        id: 'warn',
        title: '别漏边界',
        desc: '闭区域上求最值，边界上的候选点和内部驻点要一起比较，最值常出现在边界。',
        kind: 'warn',
      },
      {
        id: 'end',
        title: '比较候选点',
        desc: '把所有可疑点的函数值算出来，谁大谁小一目了然。',
        kind: 'end',
      },
    ],
  },
  {
    id: 'ode-first-order',
    title: '一阶微分方程',
    subtitle: '先认类型：可分离 → 齐次 → 一阶线性 → 伯努利',
    examNote: '数竞里一阶方程多考识别类型和初值问题，类型认错就全盘错。',
    nodes: [
      {
        id: 'start',
        title: '写成一阶标准形',
        desc: '把方程整理成导数在一边的形式，先看清它属于哪一类。',
        kind: 'start',
        formula: "y'=f(x,y)",
      },
      {
        id: 'decide',
        title: '能不能分离变量',
        desc: '能写成 g(y)dy 等于 h(x)dx 的，直接两边积分，这是最快的一条路。',
        kind: 'decision',
        tag: '第一条路',
      },
      {
        id: 'separable',
        title: '可分离变量',
        desc: '两边分别积分，别忘了写积分常数。',
        kind: 'process',
        formula: '\\int g(y)\\,dy=\\int h(x)\\,dx+C',
      },
      {
        id: 'homogeneous',
        title: '齐次方程',
        desc: '形如 y′ 等于 φ(y/x) 的，令 u = y/x 就化成可分离方程。',
        kind: 'process',
        formula: "u=\\frac{y}{x},\\quad y'=u+x\\,u'",
      },
      {
        id: 'linear',
        title: '一阶线性',
        desc: '标准形 y′ + P(x)y = Q(x)，用积分因子或常数变易法求通解。',
        kind: 'process',
        formula: "y'+P(x)\\,y=Q(x)",
      },
      {
        id: 'bernoulli',
        title: '伯努利方程',
        desc: 'y′ + Py = Q·y 的 n 次方，令 z = y 的 1−n 次方化为一阶线性。',
        kind: 'process',
        formula: 'z=y^{1-n}',
      },
      {
        id: 'warn',
        title: '两个隐形坑',
        desc: '两边除以含 y 的因子会丢解（比如漏掉 y=0）；积分常数写成 ln|C| 能让结果更干净。',
        kind: 'warn',
      },
      {
        id: 'end',
        title: '代初值定常数',
        desc: '先写通解，再把 y(x₀)=y₀ 代进去解出常数。',
        kind: 'end',
      },
    ],
  },
  {
    id: 'multiple-integral',
    title: '二重与三重积分',
    subtitle: '先画区域，再定坐标：直角 / 极坐标 / 投影 / 截面',
    examNote: '二重积分考「定限」和「换序」，圆域不换极坐标基本算不动；三重积分看投影还是截面方便。',
    nodes: [
      {
        id: 'start',
        title: '画出积分区域',
        desc: '把边界曲线画出来、标出交点，定限全靠这张图，别凭空写上下限。',
        kind: 'start',
      },
      {
        id: 'decide',
        title: '区域是什么形状',
        desc: '矩形、曲边梯形走直角坐标；圆、扇形、圆环直接考虑极坐标。',
        kind: 'decision',
        tag: '选坐标',
      },
      {
        id: 'cartesian',
        title: '直角坐标定限',
        desc: '先看是 x 型还是 y 型：x 型先对 y 积，上下限是 x 的函数。',
        kind: 'process',
        formula:
          '\\iint_{D}f\\,d\\sigma=\\int_{a}^{b}dx\\int_{y_{1}(x)}^{y_{2}(x)}f(x,y)\\,dy',
      },
      {
        id: 'swap',
        title: '积不出来就换序',
        desc: '内层原函数不存在时（比如 e 的 x 平方），重画区域改成先对 x 积。',
        kind: 'process',
      },
      {
        id: 'polar',
        title: '极坐标',
        desc: '圆域或被积函数含 x 平方加 y 平方时换极坐标，别忘了面积元多一个 r。',
        kind: 'process',
        formula:
          '\\iint_{D}f\\,dx\\,dy=\\int_{\\alpha}^{\\beta}d\\theta\\int_{r_{1}}^{r_{2}}f(r\\cos\\theta,r\\sin\\theta)\\,r\\,dr',
      },
      {
        id: 'triple',
        title: '三重积分：投影或截面',
        desc: '先对 z 积用投影法；被积函数只跟 z 有关时用截面法更省事。',
        kind: 'process',
        formula:
          '\\iiint_{\\Omega}f\\,dV=\\iint_{D_{xy}}dx\\,dy\\int_{z_{1}(x,y)}^{z_{2}(x,y)}f\\,dz',
      },
      {
        id: 'warn',
        title: '两个高频错',
        desc: '极坐标漏写雅可比 r；角度范围凭感觉写，没过原点做射线扫一遍验证。',
        kind: 'warn',
      },
      {
        id: 'end',
        title: '逐层积分',
        desc: '从内到外一层层算，每层算完先检查是否还能化简。',
        kind: 'end',
      },
    ],
  },
];

export function getFlowChart(id: string): FlowChart {
  return FLOW_CHARTS.find((c) => c.id === id) ?? FLOW_CHARTS[0];
}

/**
 * 流程图 → 配套练习知识点（practice-topics 的 key）。
 * 这张图讲思路，练习页给具体题目，二者用这个映射绑定。
 */
export const FLOW_PRACTICE: Record<string, string[]> = {
  limit: ['limit-basic', 'sequence-limit'],
  mvt: ['derivative-basic'],
  integral: ['integral-basic'],
  series: ['series-convergence', 'sequence-limit'],
  matrix: ['matrix-op', 'vector-op'],
  probability: ['probability-classical', 'random-variable'],
  'multivar-extreme': ['derivative-basic', 'inequality-amgm'],
  'ode-first-order': ['ode-solving'],
  'multiple-integral': ['integral-basic'],
};

/** 取某张流程图的配套练习 key（缺省回落到极限） */
export function flowPracticeTopics(chartId: string): string[] {
  return FLOW_PRACTICE[chartId] ?? [];
}
