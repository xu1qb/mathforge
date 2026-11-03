// EXPORTS: MATHEMATICIAN_QUIZ, MATHEMATICIAN_TYPES, QuizQuestion, MathematicianType, typeQuizResult

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
    type: 'gauss' | 'euler' | 'ramanujan' | 'archimedes';
  }[];
}

export interface MathematicianType {
  key: 'gauss' | 'euler' | 'ramanujan' | 'archimedes';
  name: string;
  nickname: string;
  tagline: string;
  color: string;
  icon: string;
  birth: string;
  death: string;
  field: string;
  contributions: string[];
  bio: string;
  recommendedTopics: { label: string; path: string }[];
}

export const MATHEMATICIAN_TYPES: Record<string, MathematicianType> = {
  gauss: {
    key: 'gauss',
    name: '高斯型',
    nickname: '计算巨兽',
    tagline: '算到底的人，精确到每一步',
    color: 'emerald',
    icon: 'Sigma',
    birth: '1777',
    death: '1855',
    field: '数论 · 代数 · 分析 · 几何 · 天文学',
    contributions: [
      '《算术研究》奠定近代数论基础',
      '最小二乘法、正态分布（高斯分布）',
      '代数基本定理的第一个严格证明',
      '非欧几何的先驱思想',
    ],
    bio: '约翰·卡尔·弗里德里希·高斯，德国数学家，被誉为"数学王子"。三岁便能纠正父亲的账目错误，十九岁发现正十七边形的尺规作图法。他追求完美与严谨，发表的每一项成果都经过反复打磨，留下了"少而精"的格言。',
    recommendedTopics: [
      { label: '积分计算', path: '/calculus' },
      { label: '级数求和', path: '/calculus' },
      { label: '行列式与矩阵', path: '/linear-algebra' },
    ],
  },
  euler: {
    key: 'euler',
    name: '欧拉型',
    nickname: '直觉先知',
    tagline: '先猜出结论，再回头补证明',
    color: 'sky',
    icon: 'Lightbulb',
    birth: '1707',
    death: '1783',
    field: '分析 · 数论 · 拓扑 · 力学',
    contributions: [
      '欧拉公式 e^(iπ) + 1 = 0',
      '开创图论（七桥问题）',
      '变分法的奠基者',
      '大量数学符号的标准化（f(x)、Σ、i、e 等）',
    ],
    bio: '莱昂哈德·欧拉，瑞士数学家，史上最多产的数学家之一。即使晚年双目失明，仍凭借惊人的心算能力产出了大量成果。他善于从特例中发现普遍规律，以非凡的直觉提出了许多深刻的猜想，其中不少后来被严格证明。',
    recommendedTopics: [
      { label: '级数', path: '/calculus' },
      { label: '中值定理', path: '/calculus' },
      { label: '复变函数', path: '/complex' },
    ],
  },
  ramanujan: {
    key: 'ramanujan',
    name: '拉马努金型',
    nickname: '例举家',
    tagline: '从特殊里看出一般的人',
    color: 'violet',
    icon: 'Sparkles',
    birth: '1887',
    death: '1920',
    field: '数论 · 分析 · 无穷级数 · 连分数',
    contributions: [
      '拉马努金素数、拉马努金θ函数',
      'π 的无穷级数快速收敛公式',
      '分拆函数的渐近公式（与哈代合作）',
      '模形式与 mock theta 函数的先驱',
    ],
    bio: '斯里尼瓦萨·拉马努金，印度数学家，自学成才的天才。他几乎没有接受过正规数学训练，却凭借惊人的直觉写下了数千条数学公式和恒等式。哈代评价他："他的直觉之深，在数学史上找不到第二人。"',
    recommendedTopics: [
      { label: '数列极限', path: '/calculus' },
      { label: '递推与级数', path: '/calculus' },
      { label: '数论基础', path: '/number-theory' },
    ],
  },
  archimedes: {
    key: 'archimedes',
    name: '阿基米德型',
    nickname: '图形脑',
    tagline: '看见几何就赢了',
    color: 'amber',
    icon: 'Shapes',
    birth: '公元前287',
    death: '公元前212',
    field: '几何学 · 力学 · 流体静力学',
    contributions: [
      '穷竭法计算面积与体积（积分的雏形）',
      '球与圆柱的表面积与体积公式',
      '浮力原理（阿基米德原理）',
      '杠杆原理与机械设计',
    ],
    bio: '阿基米德，古希腊伟大的数学家、物理学家、工程师。他用几何直觉把握数学真理，发明的"穷竭法"被视为微积分的古代先驱。"给我一个支点，我能撬动整个地球"是他力学洞见的最好注脚。',
    recommendedTopics: [
      { label: '多元积分', path: '/multivariable' },
      { label: '曲线曲面积分', path: '/multivariable' },
      { label: '解析几何', path: '/plot-2d' },
    ],
  },
};

export const MATHEMATICIAN_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: '拿到一道难题，你的第一步通常是？',
    options: [
      { key: 'A', text: '先动手算几个特殊值，找找感觉', type: 'ramanujan' },
      { key: 'B', text: '先写公式框架，明确目标与已知条件', type: 'euler' },
      { key: 'C', text: '先画个图，用几何或图像直觉', type: 'archimedes' },
      { key: 'D', text: '回忆类似的题型，直接套方法开始算', type: 'gauss' },
    ],
  },
  {
    id: 2,
    question: '考试最后 5 分钟，你会？',
    options: [
      { key: 'A', text: '把算出的结果再代回去验一遍', type: 'gauss' },
      { key: 'B', text: '检查逻辑链条有没有遗漏的步骤', type: 'euler' },
      { key: 'C', text: '猜一个可能对的答案先填上再说', type: 'ramanujan' },
      { key: 'D', text: '放弃这题，回头检查前面的题', type: 'archimedes' },
    ],
  },
  {
    id: 3,
    question: '你更享受哪种时刻？',
    options: [
      { key: 'A', text: '复杂算式终于算到底，出了结果', type: 'gauss' },
      { key: 'B', text: '猜到结论，回头一步步补出证明', type: 'euler' },
      { key: 'C', text: '从一堆例子里发现了某种规律', type: 'ramanujan' },
      { key: 'D', text: '用一个漂亮的几何定理直接秒杀', type: 'archimedes' },
    ],
  },
  {
    id: 4,
    question: '你错题最多的原因是？',
    options: [
      { key: 'A', text: '计算失误，数字总是算错', type: 'gauss' },
      { key: 'B', text: '概念不清，定理条件没搞懂', type: 'euler' },
      { key: 'C', text: '方法不会，根本不知道从哪下手', type: 'ramanujan' },
      { key: 'D', text: '审题错了，题目意思理解偏了', type: 'archimedes' },
    ],
  },
  {
    id: 5,
    question: '翻开新章节，你的习惯是？',
    options: [
      { key: 'A', text: '先看例题，跟着一步步算', type: 'gauss' },
      { key: 'B', text: '先读定理和证明，再做习题', type: 'euler' },
      { key: 'C', text: '先翻课后习题，从题反推知识点', type: 'ramanujan' },
      { key: 'D', text: '先找找这章和之前章节有什么联系', type: 'archimedes' },
    ],
  },
  {
    id: 6,
    question: '看到 e 你先想到的是？',
    options: [
      { key: 'A', text: '自然对数底，e ≈ 2.71828', type: 'gauss' },
      { key: 'B', text: '复利的极限：(1+1/n)^n → e', type: 'euler' },
      { key: 'C', text: 'e^(iπ) + 1 = 0，欧拉公式太神奇了', type: 'ramanujan' },
      { key: 'D', text: '指数函数的增长曲线', type: 'archimedes' },
    ],
  },
  {
    id: 7,
    question: '考场遇到一道完全没见过的题，你会？',
    options: [
      { key: 'A', text: '硬算，能算多少算多少', type: 'gauss' },
      { key: 'B', text: '猜一下可能用到哪个定理，试试', type: 'euler' },
      { key: 'C', text: '从最简单的情形开始试，慢慢推广', type: 'ramanujan' },
      { key: 'D', text: '跳过去，先做有把握的题', type: 'archimedes' },
    ],
  },
  {
    id: 8,
    question: '你更喜欢数学的哪种美？',
    options: [
      { key: 'A', text: '精确到小数点后 N 位的答案', type: 'gauss' },
      { key: 'B', text: '严格无懈可击的证明', type: 'euler' },
      { key: 'C', text: '灵光一闪的直观洞见', type: 'ramanujan' },
      { key: 'D', text: '图形化的简洁与优雅', type: 'archimedes' },
    ],
  },
  {
    id: 9,
    question: '你觉得学数学最像？',
    options: [
      { key: 'A', text: '爬山，一步一步往上登', type: 'gauss' },
      { key: 'B', text: '下棋，推演每一种可能', type: 'euler' },
      { key: 'C', text: '寻宝，在杂乱中找规律', type: 'ramanujan' },
      { key: 'D', text: '看风景，享受图形的美感', type: 'archimedes' },
    ],
  },
  {
    id: 10,
    question: '你给自己的标签是？',
    options: [
      { key: 'A', text: '细心、稳扎稳打', type: 'gauss' },
      { key: 'B', text: '严谨、逻辑控', type: 'euler' },
      { key: 'C', text: '灵感型、跳跃式思考', type: 'ramanujan' },
      { key: 'D', text: '灵活、善于转化', type: 'archimedes' },
    ],
  },
];

export interface typeQuizResult {
  primary: string;
  secondary: string | null;
  scores: Record<string, number>;
  isMixed: boolean;
}

export function computeQuizResult(answers: Record<number, string>): typeQuizResult {
  const scores: Record<string, number> = {
    gauss: 0,
    euler: 0,
    ramanujan: 0,
    archimedes: 0,
  };

  MATHEMATICIAN_QUIZ.forEach((q) => {
    const ansKey = answers[q.id];
    if (!ansKey) return;
    const opt = q.options.find((o) => o.key === ansKey);
    if (opt) {
      scores[opt.type] = (scores[opt.type] || 0) + 1;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][0];

  const isMixed = sorted[0][1] === sorted[1][1] || sorted[0][1] - sorted[1][1] <= 1;

  return {
    primary,
    secondary: isMixed ? secondary : null,
    scores,
    isMixed,
  };
}
