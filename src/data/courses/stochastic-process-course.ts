import type { Course } from './types';

export const STOCHASTIC_PROCESS_COURSE: Course = {
  id: 'stochastic-process-course', title: '随机过程', tagline: '马尔可夫链、泊松过程与鞅',
  textbook: {
    name: 'Introduction to Probability Models（Ross） + 随机过程（刘次华）',
    edition: '第 11 版 / 第 5 版',
  },
  prerequisites: ['概率论'],
  hours: 32,
  intro: {
    what: '随机过程研究随时间演化的随机系统：马尔可夫性给出状态转移，泊松过程刻画到达，鞅刻画公平性。',
    objects: ['马尔可夫链', '泊松过程', '布朗运动', '鞅'],
    history: ['1907：马尔可夫链', '20 世纪：布朗运动与鞅论', '20 世纪中叶：随机分析'],
  },
  chapters: [
    {
      id: 'sp-markov', title: '马尔可夫链', textbookRef: 'Ross 第 1 章 / Ross 第 4 章', summary: '只看当前状态',
      goals: ['写转移矩阵', '求平稳分布'],
      lessonIds: ['markov-chains', 'renewal-process', 'ctmc'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'sp1-1', level: '进阶', question: '平稳分布满足？', answer: 'πP=π', hint: '不动方程。', steps: ['进', '阶'] }],
    },
    {
      id: 'sp-poisson', title: '泊松过程', textbookRef: 'Ross 第 2 章 / Ross 第 5 章', summary: '随机到达',
      goals: ['算计数分布', '用无记忆性'],
      lessonIds: ['poisson-process', 'queueing-m-m-1'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'sp2-1', level: '进阶', question: '时间 t 内期望事件数？', answer: 'λt', hint: '强度。', steps: ['进', '阶'] }],
    },
    {
      id: 'sp-brownian', title: '布朗运动', textbookRef: 'Ross 第 3 章 / Ross 第 10 章', summary: '连续随机游走',
      goals: ['理解性质', '模拟路径'],
      lessonIds: ['random-walk-brownian', 'brownian-properties', 'gamblers-ruin'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'sp3-1', level: '进阶', question: '布朗运动方差与时间关系？', answer: '正比', hint: '标准性质。', steps: ['进', '阶'] }],
    },
    {
      id: 'sp-martingale', title: '鞅', textbookRef: 'Ross 第 4 章 / Ross 第 3 章', summary: '公平游戏',
      goals: ['判鞅', '用停时定理'],
      lessonIds: ['martingales', 'branching-process'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'sp4-1', level: '进阶', question: '鞅的条件期望等于？', answer: '当前值', hint: '定义。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '排队系统', scene: '运营', example: '泊松到达与马尔可夫链。' }, { title: '金融', scene: '定价', example: '布朗运动与鞅。' }], crossings: [{ subject: '概率论', relation: '随机过程以概率论为基础。', courseId: 'probability-theory-course' }, { subject: '金融数学', relation: '布朗运动用于定价。', courseId: 'financial-math-course' }], toolPath: '/probability',
};
