import type { Course } from './types';

export const COMPUTATIONAL_MATH_COURSE: Course = {
  id: 'computational-math',
  title: '计算数学',
  tagline: '矩阵分解、特征值、差分与蒙特卡洛',
  textbook: { name: 'Matrix Computations（Golub & Van Loan） + 数值线性代数', edition: '第 4 版 / 第 1 版' },
  prerequisites: ['数值分析', '线性代数'],
  hours: 36,
  intro: {
    what: '计算数学研究实际可算的算法：矩阵分解、特征值迭代、微分方程差分与随机模拟。',
    objects: ['LU 分解', '特征值算法', '有限差分', '蒙特卡洛'],
    history: ['19 世纪：高斯消元', '1961：QR 算法提出', '20 世纪中叶：蒙特卡洛方法'],
  },
  chapters: [
    {
      id: 'cm-lu', title: 'LU 分解与线性方程组', textbookRef: 'Golub 第 3 章 / 数值线性代数 第 1 章', summary: '消元的矩阵形式',
      goals: ['会做 LU', '理解主元选择'],
      lessonIds: ['lu-decomposition'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'cm1-1', level: '进阶', question: 'LU 分解后解方程组需要几次三角求解？', answer: '2 次', hint: '前代与回代。', steps: ['前代一次，回代一次。'] }],
    },
    {
      id: 'cm-eigen', title: '特征值算法', textbookRef: 'Golub 第 7 章 / 数值线性代数 第 2 章', summary: '幂法与 QR',
      goals: ['会幂法', '理解收敛率'],
      lessonIds: ['eigen-algorithms'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'cm2-1', level: '进阶', question: '主特征值 3、次主 1 时幂法收敛比率？', answer: '1/3', hint: '次主除主。', steps: ['比率 = 1/3。'] }],
    },
    {
      id: 'cm-fd', title: '有限差分', textbookRef: 'Golub 第 11 章 / 数值解 第 3 章', summary: '微分方程离散化',
      goals: ['写差分格式', '判断稳定性'],
      lessonIds: ['finite-difference'],
      practiceTopics: ['ode-solving'],
      exercises: [{ id: 'cm3-1', level: '进阶', question: '显式热格式的稳定性条件？', answer: 'Δt ≤ h²/2', hint: '时间步与空间步平方。', steps: ['受限条件。'] }],
    },
    {
      id: 'cm-mc', title: '蒙特卡洛方法', textbookRef: 'Golub 第 12 章 / 蒙特卡洛 第 1 章', summary: '随机抽样估计',
      goals: ['理解误差阶', '会降方差'],
      lessonIds: ['monte-carlo'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'cm4-1', level: '基础', question: '样本量扩大 100 倍，误差下降多少？', answer: '降至 1/10', hint: '根号 n。', steps: ['√100=10。'] }],
    },
  ],
  applications: [{ title: '科学计算', scene: '工程', example: '大规模仿真依赖矩阵算法。' }, { title: '金融工程', scene: '银行', example: '蒙特卡洛用于定价。' }],
  crossings: [{ subject: '数值分析', relation: '计算数学是数值分析的算法核心。', courseId: 'numerical-analysis' }, { subject: '线性代数', relation: '矩阵分解是线性代数的计算版本。', courseId: 'linear-algebra' }],
  toolPath: '/numerical',
};
