import type { Course } from './types';

export const ANALYTIC_NUMBER_THEORY_COURSE: Course = {
  id: 'analytic-number-theory-course', title: '解析数论', tagline: 'ζ 函数、L 函数与素数分布',
  textbook: { name: '解析数论（教材） + Introduction to Analytic Number Theory（Apostol）', edition: '第 1 版 / 第 1 版' },
  prerequisites: ['复分析', '数论'],
  hours: 32,
  intro: {
    what: '解析数论用复分析研究整数：ζ 与 L 函数编码素数信息，欧拉乘积与零点分布给出素数定理。',
    objects: ['黎曼 ζ 函数', '狄利克雷 L 函数', '算术函数', '素数定理'],
    history: ['1737：欧拉乘积', '1859：黎曼论文', '1896：素数定理证明'],
  },
  chapters: [
    {
      id: 'an-zeta', title: '黎曼 ζ 函数', textbookRef: '教材 第 1 章 / Apostol 第 11 章', summary: '欧拉乘积',
      goals: ['写乘积', '理解延拓'],
      lessonIds: ['zeta-function'],
      practiceTopics: ['series-convergence'],
      exercises: [{ id: 'an1-1', level: '竞赛', question: 'ζ 的欧拉乘积联系什么？', answer: '素数', hint: '乘积。', steps: ['竞', '赛'] }],
    },
    {
      id: 'an-l', title: '狄利克雷 L 函数', textbookRef: '教材 第 2 章 / Apostol 第 7 章', summary: '特征与等差数列',
      goals: ['构造 L', '用主特征'],
      lessonIds: ['dirichlet-series'],
      practiceTopics: ['series-convergence'],
      exercises: [{ id: 'an2-1', level: '竞赛', question: 'L 函数用于什么？', answer: '等差数列素数', hint: '特征。', steps: ['竞', '赛'] }],
    },
    {
      id: 'an-arith', title: '算术函数与卷积', textbookRef: '教材 第 3 章 / Apostol 第 2 章', summary: '卷积与反演',
      goals: ['算卷积', '用反演'],
      lessonIds: ['arithmetic-functions'],
      practiceTopics: ['nt-gcd'],
      exercises: [{ id: 'an3-1', level: '进阶', question: '欧拉函数是乘性函数吗？', answer: '是', hint: '互素可分。', steps: ['进', '阶'] }],
    },
    {
      id: 'an-prime', title: '素数定理', textbookRef: '教材 第 4 章 / Apostol 第 13 章', summary: '分布渐近',
      goals: ['理解渐近', '估个数'],
      lessonIds: ['prime-theorem'],
      practiceTopics: ['nt-gcd'],
      exercises: [{ id: 'an4-1', level: '进阶', question: '一百以内素数个数？', answer: '25', hint: '筛法。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '密码学', scene: '安全', example: '素数生成。' }, { title: '计算数论', scene: '算法', example: '素性检测。' }], crossings: [{ subject: '复分析', relation: 'ζ 的延拓用复分析。', courseId: 'complex-analysis' }, { subject: '解析数论', relation: '与代数数论互补。', courseId: 'algebraic-number-theory' }], toolPath: '/number-theory',
};
