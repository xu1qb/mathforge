// 学科分支数据模型：11 个大类 × 若干分支
// 设计原则：分支是「唯一真相」，侧栏分组、学科总览页、覆盖统计都从这里派生。
// 覆盖状态由 pagePath / tags 推导，不手工维护：
//   pagePath 有值 → 有专门页面
//   tags 非空    → 只有原理讲解考点
//   两者皆无     → 待补

export interface Branch {
  id: string;
  zh: string;
  en: string;
  /** 对应的独立页面路径 */
  pagePath?: string;
  /** 关联的原理讲解标签（一个标签可能被多个分支共用） */
  tags?: string[];
  /** 待补分支的补充说明 */
  note?: string;
}

export interface BranchCategory {
  id: string;
  zh: string;
  en: string;
  /** 卡片主色，用于总览页和导航标识 */
  accent: string;
  branches: Branch[];
}

export type BranchStatus = 'page' | 'topic' | 'empty';

export const BRANCH_CATEGORIES: BranchCategory[] = [
  {
    id: 'foundations',
    zh: '基础数学',
    en: 'Foundations',
    accent: 'amber',
    branches: [
      { id: 'arithmetic', zh: '算术', en: 'Arithmetic', pagePath: '/calculator' },
      { id: 'elementary-algebra', zh: '初等代数', en: 'Elementary Algebra', pagePath: '/symbolic' },
      { id: 'euclidean-geometry', zh: '欧氏几何', en: 'Euclidean Geometry', tags: ['欧氏几何'] },
      { id: 'elementary-number-theory', zh: '初等数论', en: 'Elementary Number Theory', pagePath: '/number-theory' },
      { id: 'trigonometry', zh: '三角学', en: 'Trigonometry', tags: ['三角学'] },
      { id: 'analytic-geometry', zh: '解析几何', en: 'Analytic Geometry', pagePath: '/plot-2d', tags: ['空间几何'] },
      { id: 'linear-algebra', zh: '线性代数', en: 'Linear Algebra', pagePath: '/linear-algebra', tags: ['线代'] },
      { id: 'abstract-algebra', zh: '抽象代数', en: 'Abstract Algebra', pagePath: '/modern' },
    ],
  },
  {
    id: 'analysis',
    zh: '分析学',
    en: 'Analysis',
    accent: 'sky',
    branches: [
      {
        id: 'calculus',
        zh: '微积分',
        en: 'Calculus',
        pagePath: '/calculus',
        tags: ['极限', '中值定理', '积分', '级数', '多元', '不等式'],
      },
      { id: 'real-analysis', zh: '实分析', en: 'Real Analysis', pagePath: '/multivariable', note: '目前以多元微积分页承载' },
      { id: 'complex-analysis', zh: '复分析', en: 'Complex Analysis', pagePath: '/complex' },
      { id: 'functional-analysis', zh: '泛函分析', en: 'Functional Analysis', pagePath: '/modern' },
      { id: 'harmonic-analysis', zh: '调和分析', en: 'Harmonic Analysis', pagePath: '/fourier' },
      { id: 'measure-theory', zh: '测度论', en: 'Measure Theory', tags: ['测度论'] },
      { id: 'ode', zh: '常微分方程', en: 'ODE', pagePath: '/ode', tags: ['微分方程'] },
      { id: 'pde', zh: '偏微分方程', en: 'PDE', pagePath: '/pde' },
    ],
  },
  {
    id: 'geometry',
    zh: '几何与拓扑',
    en: 'Geometry & Topology',
    accent: 'rose',
    branches: [
      { id: 'non-euclidean', zh: '非欧几何', en: 'Non-Euclidean Geometry', tags: ['非欧几何'] },
      { id: 'projective-geometry', zh: '射影几何', en: 'Projective Geometry', tags: ['射影几何'] },
      { id: 'differential-geometry', zh: '微分几何', en: 'Differential Geometry', pagePath: '/diff-geo' },
      { id: 'algebraic-geometry', zh: '代数几何', en: 'Algebraic Geometry', note: '超纲 · 暂缓' },
      { id: 'topology', zh: '拓扑学', en: 'Topology', tags: ['拓扑'] },
      { id: 'algebraic-topology', zh: '代数拓扑', en: 'Algebraic Topology', tags: ['代数拓扑'] },
      { id: 'differential-topology', zh: '微分拓扑', en: 'Differential Topology', note: '超纲 · 暂缓' },
    ],
  },
  {
    id: 'algebra-number-theory',
    zh: '代数与数论',
    en: 'Algebra & Number Theory',
    accent: 'violet',
    branches: [
      { id: 'group-theory', zh: '群论', en: 'Group Theory', tags: ['代数'] },
      { id: 'ring-theory', zh: '环论', en: 'Ring Theory', tags: ['环论'] },
      { id: 'field-theory', zh: '域论', en: 'Field Theory', tags: ['伽罗瓦'] },
      { id: 'galois-theory', zh: '伽罗瓦理论', en: 'Galois Theory', tags: ['伽罗瓦'] },
      { id: 'algebraic-number-theory', zh: '代数数论', en: 'Algebraic Number Theory', note: '超纲 · 暂缓' },
      { id: 'analytic-number-theory', zh: '解析数论', en: 'Analytic Number Theory', tags: ['解析数论'] },
      { id: 'representation-theory', zh: '表示论', en: 'Representation Theory', tags: ['表示论'] },
    ],
  },
  {
    id: 'discrete',
    zh: '组合与离散',
    en: 'Combinatorics & Discrete',
    accent: 'emerald',
    branches: [
      { id: 'combinatorics', zh: '组合数学', en: 'Combinatorics', pagePath: '/discrete' },
      { id: 'graph-theory', zh: '图论', en: 'Graph Theory', pagePath: '/discrete' },
      { id: 'mathematical-logic', zh: '数理逻辑', en: 'Mathematical Logic', pagePath: '/discrete' },
      { id: 'set-theory', zh: '集合论', en: 'Set Theory', tags: ['集合论'] },
      { id: 'category-theory', zh: '范畴论', en: 'Category Theory', tags: ['范畴论'] },
      { id: 'lattice-theory', zh: '格论', en: 'Lattice Theory', note: '超纲 · 暂缓' },
      { id: 'information-theory', zh: '信息论', en: 'Information Theory', tags: ['信息论'] },
      { id: 'computability', zh: '可计算性', en: 'Computability', tags: ['可计算性'] },
    ],
  },
  {
    id: 'probability',
    zh: '概率与统计',
    en: 'Probability & Statistics',
    accent: 'teal',
    branches: [
      { id: 'probability-theory', zh: '概率论', en: 'Probability Theory', pagePath: '/probability', tags: ['概率'] },
      { id: 'mathematical-statistics', zh: '数理统计', en: 'Mathematical Statistics', pagePath: '/probability' },
      { id: 'stochastic-process', zh: '随机过程', en: 'Stochastic Processes', tags: ['概率'] },
      { id: 'game-theory', zh: '博弈论', en: 'Game Theory', tags: ['博弈论'] },
      { id: 'mathematical-finance', zh: '金融数学', en: 'Mathematical Finance', tags: ['金融数学'] },
    ],
  },
  {
    id: 'computation',
    zh: '计算与算法',
    en: 'Computation & Algorithms',
    accent: 'cyan',
    branches: [
      { id: 'numerical-analysis', zh: '数值分析', en: 'Numerical Analysis', pagePath: '/numerical' },
      { id: 'computational-mathematics', zh: '计算数学', en: 'Computational Mathematics', pagePath: '/numerical' },
      { id: 'cryptography', zh: '密码学', en: 'Cryptography', tags: ['密码学'] },
      { id: 'tcs', zh: '理论计算机科学', en: 'Theoretical CS', tags: ['计算复杂性'] },
    ],
  },
  {
    id: 'applied',
    zh: '应用数学',
    en: 'Applied Mathematics',
    accent: 'orange',
    branches: [
      { id: 'mathematical-physics', zh: '数学物理', en: 'Mathematical Physics', pagePath: '/pde' },
      { id: 'mechanics', zh: '力学', en: 'Mechanics', tags: ['力学'] },
      { id: 'fluid-dynamics', zh: '流体力学', en: 'Fluid Dynamics', note: '超纲 · 暂缓' },
      { id: 'mathematical-biology', zh: '生物数学', en: 'Mathematical Biology', tags: ['生物数学'] },
      { id: 'operations-research', zh: '运筹学', en: 'Operations Research', tags: ['运筹学'] },
      { id: 'control-theory', zh: '控制论', en: 'Control Theory', tags: ['控制论'] },
    ],
  },
  {
    id: 'logic',
    zh: '逻辑与基础',
    en: 'Logic & Foundations',
    accent: 'slate',
    branches: [
      { id: 'axiomatic-set-theory', zh: '公理化集合论', en: 'Axiomatic Set Theory', note: '超纲 · 暂缓' },
      { id: 'model-theory', zh: '模型论', en: 'Model Theory', note: '超纲 · 暂缓' },
      { id: 'recursion-theory', zh: '递归论', en: 'Recursion Theory', note: '超纲 · 暂缓' },
      { id: 'proof-theory', zh: '证明论', en: 'Proof Theory', note: '超纲 · 暂缓' },
    ],
  },
  {
    id: 'frontiers',
    zh: '前沿与交叉',
    en: 'Frontiers & Interdiscipline',
    accent: 'pink',
    branches: [
      { id: 'higher-category-theory', zh: '高阶范畴论', en: 'Higher Category Theory', note: '超纲 · 暂缓' },
      { id: 'geometric-group-theory', zh: '几何群论', en: 'Geometric Group Theory', note: '超纲 · 暂缓' },
      { id: 'random-matrix', zh: '随机矩阵', en: 'Random Matrix Theory', note: '超纲 · 暂缓' },
      { id: 'tda', zh: '拓扑数据分析', en: 'Topological Data Analysis', note: '超纲 · 暂缓' },
      { id: 'quantum-computing', zh: '量子计算', en: 'Quantum Computation', note: '超纲 · 暂缓' },
    ],
  },
  {
    id: 'competition',
    zh: '竞赛数学',
    en: 'Competition Mathematics',
    accent: 'yellow',
    branches: [
      { id: 'competition-prep', zh: '竞赛备战', en: 'Competition Prep', pagePath: '/competition' },
      { id: 'exam-methods', zh: '解题方法', en: 'Problem Solving', pagePath: '/flow' },
      { id: 'concept-explainer', zh: '原理讲解', en: 'Concepts', pagePath: '/explainer' },
      { id: 'practice-drill', zh: '刷题训练', en: 'Practice', pagePath: '/practice' },
    ],
  },
];

/** 全部 11 个大类的扁平分支列表 */
export const ALL_BRANCHES: Branch[] = BRANCH_CATEGORIES.flatMap((c) => c.branches);

export function branchStatus(b: Branch, topicTags: Set<string>): BranchStatus {
  if (b.pagePath) return 'page';
  if (b.tags && b.tags.some((t) => topicTags.has(t))) return 'topic';
  return 'empty';
}
