import type { Course } from './types';

export const MATHEMATICAL_PHYSICS_COURSE: Course = {
  id: 'mathematical-physics',
  title: '数学物理',
  tagline: '波动、热传导、薛定谔与格林函数',
  textbook: { name: '数学物理方法（梁昆淼） + Partial Differential Equations（Strauss）', edition: '第 5 版 / 第 2 版' },
  prerequisites: ['分析学导论', '常微分方程'],
  hours: 40,
  intro: {
    what: '数学物理研究物理中的偏微分方程：波动、热传导与量子力学，核心方法是分离变量、积分变换与格林函数。',
    objects: ['波动方程', '热传导方程', '薛定谔方程', '格林函数'],
    history: ['18 世纪：达朗贝尔与伯努利研究弦振动', '19 世纪：傅里叶热传导理论', '20 世纪：量子力学方程'],
  },
  chapters: [
    {
      id: 'mp-wave', title: '波动方程', textbookRef: '梁昆淼 第 2 章 / Strauss 第 2 章', summary: '行波与达朗贝尔解',
      goals: ['写达朗贝尔解', '理解特征线'],
      lessonIds: ['wave-equation', 'separation-of-variables'],
      practiceTopics: ['ode-solving'],
      exercises: [{ id: 'mp1-1', level: '进阶', question: '一维波动方程通解的形式？', answer: '两个行波之和', hint: '左右行波叠加。', steps: ['左行加右行。'] }],
    },
    {
      id: 'mp-heat', title: '热传导方程', textbookRef: '梁昆淼 第 3 章 / Strauss 第 3 章', summary: '扩散与平滑',
      goals: ['理解热核', '会分离变量'],
      lessonIds: ['heat-equation', 'fourier-transform-pde'],
      practiceTopics: ['ode-solving'],
      exercises: [{ id: 'mp2-1', level: '进阶', question: '热方程基本解是什么函数？', answer: '高斯函数', hint: '点源扩散。', steps: ['高斯核。'] }],
    },
    {
      id: 'mp-schrodinger', title: '薛定谔方程', textbookRef: '梁昆淼 第 6 章 / Strauss 第 8 章', summary: '量子态演化',
      goals: ['写方程', '理解本征值问题'],
      lessonIds: ['schrodinger-equation', 'max-principle'],
      practiceTopics: ['complex-equation'],
      exercises: [{ id: 'mp3-1', level: '竞赛', question: '定态薛定谔方程是何种数学问题？', answer: '特征值问题', hint: '哈密顿算子。', steps: ['求能量本征值。'] }],
    },
    {
      id: 'mp-green', title: '格林函数', textbookRef: '梁昆淼 第 5 章 / Strauss 第 5 章', summary: '点源响应',
      goals: ['构造格林函数', '用叠加求解'],
      lessonIds: ['green-functions', 'green-function', 'laplace-equation', 'special-functions'],
      practiceTopics: ['integral-basic'],
      exercises: [{ id: 'mp4-1', level: '竞赛', question: '格林函数满足什么方程？', answer: '算子作用于它等于狄拉克函数', hint: '点源。', steps: ['点源方程。'] }],
    },
  ],
  applications: [{ title: '量子计算', scene: '前沿', example: '薛定谔方程是量子门的基础。' }, { title: '热工程', scene: '工业', example: '热传导方程用于散热设计。' }],
  crossings: [{ subject: '偏微分方程', relation: '数学物理是 PDE 的应用场景。', courseId: 'pde-calculus' }, { subject: '泛函分析', relation: '量子力学用希尔伯特空间。', courseId: 'functional-analysis' }],
  toolPath: '/pde',
};
