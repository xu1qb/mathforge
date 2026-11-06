import type { Course } from './types';

export const NUMERICAL_ANALYSIS_COURSE: Course = {
  id: 'numerical-analysis',
  title: '数值分析',
  tagline: '误差、插值、数值积分与迭代',
  textbook: { name: '数值分析（李庆扬） + Numerical Analysis（Burden & Faires）', edition: '第 5 版 / 第 10 版' },
  prerequisites: ['分析学导论', '线性代数'],
  hours: 40,
  intro: {
    what: '数值分析研究用有限精度近似计算：误差分析、插值、数值积分与非线性方程求解。',
    objects: ['误差与条件数', '插值', '数值积分', '迭代与牛顿法'],
    history: ['17 世纪：牛顿与插值法', '18 世纪：欧拉与数值积分', '20 世纪：计算机推动数值分析发展'],
  },
  chapters: [
    {
      id: 'na-errors', title: '误差与条件数', textbookRef: '李庆扬 第 1 章 / Burden 第 1 章', summary: '截断与舍入',
      goals: ['分误差类型', '估条件数'],
      lessonIds: ['numerical-errors'],
      practiceTopics: ['limit-basic'],
      exercises: [{ id: 'na1-1', level: '基础', question: '双精度约有多少位有效数字？', answer: '约 16 位', hint: '机器精度 1e-16。', steps: ['约 16 位。'] }],
    },
    {
      id: 'na-interp', title: '插值', textbookRef: '李庆扬 第 2 章 / Burden 第 3 章', summary: '拉格朗日与龙格现象',
      goals: ['构造插值多项式', '估误差'],
      lessonIds: ['interpolation'],
      practiceTopics: ['function-property'],
      exercises: [{ id: 'na2-1', level: '基础', question: '两个点确定几次插值多项式？', answer: '一次', hint: 'n+1 点次数不超过 n。', steps: ['n=1。'] }],
    },
    {
      id: 'na-integration', title: '数值积分', textbookRef: '李庆扬 第 4 章 / Burden 第 4 章', summary: '梯形与辛普森',
      goals: ['会复合公式', '估误差阶'],
      lessonIds: ['numerical-integration'],
      practiceTopics: ['integral-basic'],
      exercises: [{ id: 'na3-1', level: '进阶', question: '辛普森的代数精度是几次？', answer: '3 次', hint: '多项式精确性。', steps: ['对三次多项式精确。'] }],
    },
    {
      id: 'na-iter', title: '迭代与牛顿法', textbookRef: '李庆扬 第 7 章 / Burden 第 2 章', summary: '不动点与平方收敛',
      goals: ['写迭代式', '判断收敛'],
      lessonIds: ['iterative-methods'],
      practiceTopics: ['limit-basic'],
      exercises: [{ id: 'na4-1', level: '进阶', question: '牛顿法在重根处收敛速度？', answer: '线性收敛', hint: '平方性丢失。', steps: ['重根降为线性。'] }],
    },
  ],
  applications: [{ title: '工程设计', scene: '工业', example: '数值求解微分方程。' }, { title: '数据分析', scene: '统计', example: '插值与拟合。' }],
  crossings: [{ subject: '常微分方程', relation: '数值解 ODE 是数值分析的核心内容之一。', courseId: 'analysis' }, { subject: '计算与算法', relation: '数值分析是计算数学的核心。', courseId: 'computation' }],
  toolPath: '/numerical',
};
