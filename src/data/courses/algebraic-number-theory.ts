import type { Course } from './types';

export const ALGEBRAIC_NUMBER_COURSE: Course = {
  id: 'algebraic-number-theory',
  title: '代数数论',
  tagline: '代数整数、理想分解与分歧',
  textbook: { name: 'Algebraic Number Theory（Neukirch） + 代数数论（冯克勤）', edition: '第 1 版（Neukirch） / 第 1 版' },
  prerequisites: ['代数与数论', '域论'],
  hours: 44,
  intro: {
    what: '代数数论把整数推广到数域：整数环、理想唯一分解、类群与分歧，是研究丢番图方程的工具。',
    objects: ['代数整数', '整数环', '理想分解', '戴德金整环', '分歧'],
    history: ['19 世纪：库默尔引入理想解决费马问题', '19 世纪末：戴德金建立理想理论', '20 世纪：类域论与朗兰兹纲领'],
  },
  chapters: [
    {
      id: 'ant-integers',
      title: '代数整数与整数环',
      textbookRef: 'Neukirch 第 1 章 / 冯克勤 第 1 章',
      summary: '首一整系数多项式的根',
      goals: ['判断代数整数', '求整数环'],
      lessonIds: ['algebraic-integers', 'trace-norm', 'integral-basis'],
      practiceTopics: ['nt-gcd'],
      exercises: [
        {
          id: 'ant1-1', level: '进阶', question: '根号二是代数整数吗？',
          answer: '是', hint: 'x²-2 首一整系数。', steps: ['满足首一整系数方程。'],
        },
      ],
    },
    {
      id: 'ant-ideals',
      title: '理想唯一分解',
      textbookRef: 'Neukirch 第 2 章 / 冯克勤 第 2 章',
      summary: '用理想恢复唯一性',
      goals: ['分解理想', '理解分歧指数'],
      lessonIds: ['ideal-factorization', 'prime-splitting'],
      practiceTopics: ['nt-gcd'],
      exercises: [
        {
          id: 'ant2-1', level: '竞赛', question: '素数在二次域中可能如何分解？',
          answer: '分裂、惯性或分歧', hint: '三种情形。', steps: ['由判别式决定。'],
        },
      ],
    },
    {
      id: 'ant-dedekind',
      title: '戴德金整环',
      textbookRef: 'Neukirch 第 3 章 / 冯克勤 第 3 章',
      summary: '诺特整闭维数一',
      goals: ['判断戴德金', '理解类群'],
      lessonIds: ['dedekind-domains', 'class-number', 'minkowski-bound'],
      practiceTopics: ['nt-gcd'],
      exercises: [
        {
          id: 'ant3-1', level: '竞赛', question: '类数为一时整数环是什么？',
          answer: '主理想整环', hint: '所有理想都是主理想。', steps: ['类群平凡。'],
        },
      ],
    },
    {
      id: 'ant-ramification',
      title: '分歧',
      textbookRef: 'Neukirch 第 4 章 / 冯克勤 第 4 章',
      summary: '重指数与判别式',
      goals: ['判断分歧', '用判别式'],
      lessonIds: ['ramification', 'dirichlet-unit'],
      practiceTopics: ['nt-gcd'],
      exercises: [
        {
          id: 'ant4-1', level: '竞赛', question: '二次域中哪些素数分歧？',
          answer: '整除判别式的素数', hint: '判别式判据。', steps: ['p 分歧当且仅当 p 整除判别式。'],
        },
      ],
    },
  ],
  applications: [{ title: '密码学', scene: '安全', example: '椭圆曲线密码基于数域理论。' }, { title: '丢番图方程', scene: '数论', example: '理想分解用于解方程。' }],
  crossings: [{ subject: '代数与数论', relation: '代数数论是数论的现代形态。', courseId: 'algebra-number' }, { subject: '域论', relation: '数域是域扩张的具体例子。', courseId: 'field-theory' }],
  toolPath: '/number-theory',
};
