// EXPORTS: DISCIPLINE, BRANCHES, getBranch, coursesOfBranch, branchOfCourse
// 三层目录：学科 → 分支 → 课程（分支与课程对齐参考视频的十分类）

export interface CatalogCourse {
  id: string;
  name: string;
  /** 已有课程包的 id；缺省表示待建 */
  courseId?: string;
  /** 一句话说明 */
  note?: string;
}

export interface Branch {
  id: string;
  name: string;
  en: string;
  summary: string;
  courses: CatalogCourse[];
}

export interface Discipline {
  id: string;
  name: string;
  en: string;
  branches: Branch[];
}

export const DISCIPLINE: Discipline = {
  id: 'math',
  name: '数学',
  en: 'Mathematics',
  branches: [
    {
      id: 'elementary',
      name: '初等数学',
      en: 'Elementary Mathematics',
      summary: '中学与竞赛的地基：三角与平面几何',
      courses: [
        { id: 'trigonometry', name: '三角学', courseId: 'trigonometry' },
        { id: 'euclidean-geometry', name: '欧氏几何', courseId: 'euclidean-geometry' },
      ],
    },
    {
      id: 'foundations',
      name: '基础',
      en: 'Foundations',
      summary: '数学的语言层：集合、逻辑与公理',
      courses: [
        { id: 'set-theory', name: '集合论', courseId: 'set-theory' },
        { id: 'mathematical-logic', name: '数理逻辑', courseId: 'mathematical-logic' },
        { id: 'axiomatic-set', name: '公理化集合论', courseId: 'axiomatic-set-theory' },
        { id: 'modern-survey', name: '现代数学导论', courseId: 'modern-math', note: '总览课' },
      ],
    },
    {
      id: 'analysis',
      name: '分析学',
      en: 'Analysis',
      summary: '连续、变化、极限——描述运动',
      courses: [
        { id: 'calculus', name: '微积分', courseId: 'calculus' },
        { id: 'real-analysis', name: '实分析', courseId: 'real-analysis' },
        { id: 'complex-analysis', name: '复分析', courseId: 'complex-analysis' },
        { id: 'functional-analysis', name: '泛函分析', courseId: 'functional-analysis' },
        { id: 'harmonic-analysis', name: '调和分析', courseId: 'harmonic-analysis' },
        { id: 'measure-theory', name: '测度论', courseId: 'measure-theory-course' },
        { id: 'ode', name: '常微分方程', courseId: 'analysis', note: '在分析学导论中' },
      ],
    },
    {
      id: 'geometry-topology',
      name: '几何与拓扑',
      en: 'Geometry & Topology',
      summary: '形状与空间的不变量',
      courses: [
        { id: 'non-euclidean', name: '非欧几何', courseId: 'non-euclidean' },
        { id: 'projective', name: '射影几何', courseId: 'projective-geometry' },
        { id: 'differential-geometry', name: '微分几何', courseId: 'differential-geometry' },
        { id: 'algebraic-geometry', name: '代数几何', courseId: 'algebraic-geometry' },
        { id: 'topology', name: '拓扑学', courseId: 'topology-course' },
        { id: 'algebraic-topology', name: '代数拓扑', courseId: 'algebraic-topology-course' },
        { id: 'differential-topology', name: '微分拓扑', courseId: 'differential-topology' },
      ],
    },
    {
      id: 'algebra-number',
      name: '代数与数论',
      en: 'Algebra & Number Theory',
      summary: '结构与整数的深层',
      courses: [
        { id: 'linear-algebra', name: '线性代数', courseId: 'linear-algebra' },
        { id: 'group-theory', name: '群论', courseId: 'group-theory-course' },
        { id: 'ring-theory', name: '环论', courseId: 'ring-theory-course' },
        { id: 'field-theory', name: '域论', courseId: 'field-theory' },
        { id: 'galois-theory', name: '伽罗瓦理论', courseId: 'galois-theory-course' },
        { id: 'algebraic-number', name: '代数数论', courseId: 'algebraic-number-theory' },
        { id: 'analytic-number', name: '解析数论', courseId: 'analytic-number-theory-course' },
        { id: 'representation', name: '表示论', courseId: 'representation-theory-course' },
      ],
    },
    {
      id: 'combinatorics-discrete',
      name: '组合与离散',
      en: 'Combinatorics & Discrete',
      summary: '有限、计数、离散结构',
      courses: [
        { id: 'combinatorics', name: '组合数学', courseId: 'combinatorics' },
        { id: 'graph-theory', name: '图论', courseId: 'graph-theory-course' },
        { id: 'logic', name: '数理逻辑', courseId: 'logic-and-reasoning-course' },
        { id: 'set-theory-2', name: '集合论', courseId: 'combinatorics-discrete' },
        { id: 'category-theory', name: '范畴论', courseId: 'category-theory' },
        { id: 'lattice', name: '格论', courseId: 'lattice-theory' },
        { id: 'coding', name: '编码理论', courseId: 'coding-theory' },
      ],
    },
    {
      id: 'probability',
      name: '概率与统计',
      en: 'Probability & Statistics',
      summary: '不确定性、随机与推断',
      courses: [
        { id: 'probability-theory', name: '概率论', courseId: 'probability-theory-course' },
        { id: 'mathematical-statistics', name: '数理统计', courseId: 'math-statistics-course' },
        { id: 'stochastic-process', name: '随机过程', courseId: 'stochastic-process-course' },
        { id: 'information-theory', name: '信息论', courseId: 'information-theory-course' },
        { id: 'game-theory', name: '博弈论', courseId: 'game-theory-course' },
        { id: 'financial-math', name: '金融数学', courseId: 'financial-math-course' },
      ],
    },
    {
      id: 'computation',
      name: '计算与算法',
      en: 'Computation & Algorithms',
      summary: '可计算的边界在哪里',
      courses: [
        { id: 'numerical-analysis', name: '数值分析', courseId: 'numerical-analysis' },
        { id: 'computational-math', name: '计算数学', courseId: 'computational-math' },
        { id: 'cryptography', name: '密码学', courseId: 'cryptography-course' },
        { id: 'theory-cs', name: '理论计算机科学', courseId: 'theory-of-computation-course' },
        { id: 'discrete-math', name: '离散数学', courseId: 'discrete-math-course' },
      ],
    },
    {
      id: 'applied',
      name: '应用数学',
      en: 'Applied Mathematics',
      summary: '力学、生态、优化与控制',
      courses: [
        { id: 'mechanics', name: '力学', courseId: 'mechanics' },
        { id: 'fluid-dynamics', name: '流体力学', courseId: 'fluid-dynamics' },
        { id: 'mathematical-physics', name: '数学物理', courseId: 'mathematical-physics' },
        { id: 'mathematical-biology', name: '生物数学', courseId: 'mathematical-biology' },
        { id: 'operations-research', name: '运筹学', courseId: 'operations-research' },
        { id: 'control-theory', name: '控制论', courseId: 'control-theory-course' },
      ],
    },
    {
      id: 'logic',
      name: '逻辑与基础',
      en: 'Logic & Foundations',
      summary: '公理、证明与不可判定',
      courses: [
        { id: 'axiomatic-set-theory', name: '公理化集合论', courseId: 'set-theory-logic-course' },
        { id: 'model-theory', name: '模型论', courseId: 'model-theory' },
        { id: 'recursion-theory', name: '递归论', courseId: 'logic-foundations' },
        { id: 'proof-theory', name: '证明论', courseId: 'proof-theory' },
      ],
    },
    {
      id: 'frontiers',
      name: '前沿与交叉',
      en: 'Frontiers & Interdisciplinary',
      summary: '与其他学科交汇的新方向',
      courses: [
        { id: 'data-science', name: '数据科学中的数学', courseId: 'data-science-math' },
        { id: 'quantum-math', name: '量子数学基础', courseId: 'quantum-math' },
        { id: 'ml-theory', name: '机器学习理论', courseId: 'ml-theory' },
      ],
    },
  ],
};

export const BRANCHES: Branch[] = DISCIPLINE.branches;

export function getBranch(id: string | undefined): Branch | undefined {
  return BRANCHES.find((b) => b.id === id);
}

export function coursesOfBranch(id: string): CatalogCourse[] {
  return getBranch(id)?.courses ?? [];
}

/** 某门课程包被哪些分支引用（用于课程页显示归属） */
export function branchOfCourse(courseId: string): Branch[] {
  return BRANCHES.filter((b) => b.courses.some((c) => c.courseId === courseId));
}
