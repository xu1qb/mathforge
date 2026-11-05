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
      id: 'foundations',
      name: '基础',
      en: 'Foundations',
      summary: '数学的语言层：集合、逻辑与公理',
      courses: [
        { id: 'set-theory', name: '集合论', courseId: 'set-theory' },
        { id: 'mathematical-logic', name: '数理逻辑', note: '待建' },
        { id: 'axiomatic-set', name: '公理化集合论', courseId: 'logic-foundations' },
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
        { id: 'real-analysis', name: '实分析', note: '待建' },
        { id: 'complex-analysis', name: '复分析', note: '待建' },
        { id: 'functional-analysis', name: '泛函分析', note: '待建' },
        { id: 'harmonic-analysis', name: '调和分析', note: '待建' },
        { id: 'measure-theory', name: '测度论', note: '待建' },
        { id: 'ode', name: '常微分方程', courseId: 'analysis', note: '在分析学导论中' },
      ],
    },
    {
      id: 'geometry-topology',
      name: '几何与拓扑',
      en: 'Geometry & Topology',
      summary: '形状与空间的不变量',
      courses: [
        { id: 'non-euclidean', name: '非欧几何', courseId: 'geometry-topology' },
        { id: 'projective', name: '射影几何', courseId: 'geometry-topology' },
        { id: 'differential-geometry', name: '微分几何', note: '待建' },
        { id: 'algebraic-geometry', name: '代数几何', note: '待建' },
        { id: 'topology', name: '拓扑学', courseId: 'geometry-topology' },
        { id: 'algebraic-topology', name: '代数拓扑', courseId: 'geometry-topology' },
        { id: 'differential-topology', name: '微分拓扑', note: '待建' },
      ],
    },
    {
      id: 'algebra-number',
      name: '代数与数论',
      en: 'Algebra & Number Theory',
      summary: '结构与整数的深层',
      courses: [
        { id: 'linear-algebra', name: '线性代数', courseId: 'linear-algebra' },
        { id: 'group-theory', name: '群论', courseId: 'algebra-number' },
        { id: 'ring-theory', name: '环论', courseId: 'algebra-number' },
        { id: 'field-theory', name: '域论', note: '待建' },
        { id: 'galois-theory', name: '伽罗瓦理论', courseId: 'algebra-number' },
        { id: 'algebraic-number', name: '代数数论', note: '待建' },
        { id: 'analytic-number', name: '解析数论', courseId: 'algebra-number' },
        { id: 'representation', name: '表示论', courseId: 'algebra-number' },
      ],
    },
    {
      id: 'combinatorics-discrete',
      name: '组合与离散',
      en: 'Combinatorics & Discrete',
      summary: '有限、计数、离散结构',
      courses: [
        { id: 'combinatorics', name: '组合数学', note: '待建' },
        { id: 'graph-theory', name: '图论', courseId: 'combinatorics-discrete' },
        { id: 'logic', name: '数理逻辑', note: '待建' },
        { id: 'set-theory-2', name: '集合论', courseId: 'combinatorics-discrete' },
        { id: 'category-theory', name: '范畴论', courseId: 'modern-math', note: '在现代数学导论中' },
        { id: 'lattice', name: '格论', note: '待建' },
        { id: 'coding', name: '编码理论', note: '待建' },
      ],
    },
    {
      id: 'probability',
      name: '概率与统计',
      en: 'Probability & Statistics',
      summary: '不确定性、随机与推断',
      courses: [
        { id: 'probability-theory', name: '概率论', courseId: 'probability' },
        { id: 'mathematical-statistics', name: '数理统计', courseId: 'probability' },
        { id: 'stochastic-process', name: '随机过程', courseId: 'probability' },
        { id: 'information-theory', name: '信息论', courseId: 'computation', note: '在计算与算法中' },
        { id: 'game-theory', name: '博弈论', courseId: 'applied-math' },
        { id: 'financial-math', name: '金融数学', courseId: 'applied-math' },
      ],
    },
    {
      id: 'computation',
      name: '计算与算法',
      en: 'Computation & Algorithms',
      summary: '可计算的边界在哪里',
      courses: [
        { id: 'numerical-analysis', name: '数值分析', note: '待建' },
        { id: 'computational-math', name: '计算数学', note: '待建' },
        { id: 'cryptography', name: '密码学', courseId: 'computation' },
        { id: 'theory-cs', name: '理论计算机科学', courseId: 'computation' },
        { id: 'discrete-math', name: '离散数学', courseId: 'combinatorics-discrete' },
      ],
    },
    {
      id: 'applied',
      name: '应用数学',
      en: 'Applied Mathematics',
      summary: '力学、生态、优化与控制',
      courses: [
        { id: 'mechanics', name: '力学', courseId: 'applied-math' },
        { id: 'fluid-dynamics', name: '流体力学', note: '待建' },
        { id: 'mathematical-physics', name: '数学物理', note: '待建' },
        { id: 'mathematical-biology', name: '生物数学', courseId: 'applied-math' },
        { id: 'operations-research', name: '运筹学', courseId: 'applied-math' },
        { id: 'control-theory', name: '控制论', courseId: 'applied-math' },
      ],
    },
    {
      id: 'logic',
      name: '逻辑与基础',
      en: 'Logic & Foundations',
      summary: '公理、证明与不可判定',
      courses: [
        { id: 'axiomatic-set-theory', name: '公理化集合论', courseId: 'logic-foundations' },
        { id: 'model-theory', name: '模型论', note: '待建' },
        { id: 'recursion-theory', name: '递归论', courseId: 'logic-foundations' },
        { id: 'proof-theory', name: '证明论', note: '待建' },
      ],
    },
    {
      id: 'frontiers',
      name: '前沿与交叉',
      en: 'Frontiers & Interdisciplinary',
      summary: '与其他学科交汇的新方向',
      courses: [
        { id: 'data-science', name: '数据科学中的数学', note: '待建' },
        { id: 'quantum-math', name: '量子数学基础', note: '待建' },
        { id: 'ml-theory', name: '机器学习理论', note: '待建' },
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
