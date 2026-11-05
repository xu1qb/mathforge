import type { Course } from './types';

export const APPLIED_MATH_COURSE: Course = {
  id: 'applied-math',
  title: '应用数学',
  tagline: '力学、生态、优化与控制：数学落到现实',
  textbook: { name: '应用数学导论（自编）', edition: '第一版（自编）' },
  prerequisites: ['高等数学', '线性代数'],
  hours: 40,
  intro: {
    what: '应用数学把结构与方法用于建模：力学给出运动方程，优化寻找最优解，控制保证稳定，金融与博弈刻画决策。',
    objects: ['拉格朗日力学', '种群模型', '线性规划', '稳定性', '期权定价', '博弈'],
    history: ['18 世纪：拉格朗日建立分析力学', '20 世纪：线性规划与最优控制成型', '1973：Black–Scholes 公式发表'],
  },
  chapters: [
    {
      id: 'ap-mechanics',
      title: '力学与生态',
      textbookRef: '第 1 章',
      summary: '用能量与微分方程描述运动与种群',
      goals: ['理解拉格朗日量', '会分析捕食者模型'],
      lessonIds: ['lagrangian-mechanics', 'lotka-volterra'],
      practiceTopics: ['ode-solving'],
      exercises: [
        {
          id: 'ap1-1',
          level: '进阶',
          question: '拉格朗日量等于什么减什么？',
          answer: '动能减势能',
          hint: 'L=T−V。',
          steps: ['动能为 T。', '势能为 V。', 'L=T−V。'],
        },
      ],
    },
    {
      id: 'ap-opt',
      title: '优化与控制',
      textbookRef: '第 2 章',
      summary: '最优解在顶点，稳定性看极点',
      goals: ['会解线性规划', '理解极点与稳定性的关系'],
      lessonIds: ['linear-programming', 'control-theory'],
      practiceTopics: ['inequality-solve'],
      exercises: [
        {
          id: 'ap2-1',
          level: '基础',
          question: '在 $x\\le 2$、$y\\le 3$ 下 $x+y$ 的最大值？',
          answer: '$5$',
          hint: '最优解在顶点。',
          steps: ['可行域为矩形。', '右上角取到 5。'],
        },
      ],
    },
    {
      id: 'ap-finance',
      title: '金融与博弈',
      textbookRef: '第 3 章',
      summary: '定价与决策的数学',
      goals: ['了解期权定价思想', '理解纳什均衡'],
      lessonIds: ['option-pricing', 'game-nash'],
      practiceTopics: ['random-variable'],
      exercises: [
        {
          id: 'ap3-1',
          level: '进阶',
          question: '纳什均衡指什么状态？',
          answer: '任何一方单独改变策略都不会更好',
          hint: '互相最优反应。',
          steps: ['给定对方策略。', '无人有动机单独偏离。'],
        },
      ],
    },
  ],
  applications: [
    { title: '工程仿真', scene: '制造', example: '有限元与最优控制用于结构设计。' },
    { title: '生态管理', scene: '环境', example: '种群模型用于渔业配额。' },
    { title: '金融风控', scene: '银行', example: '随机过程用于风险度量。' },
  ],
  crossings: [
    { subject: '高等数学', relation: '微分方程是力学与生态模型的语言。', courseId: 'calculus' },
    { subject: '概率统计', relation: '期权定价依赖随机过程。', courseId: 'probability' },
    { subject: '分析学导论', relation: '控制稳定性用特征值与极点分析。', courseId: 'analysis' },
  ],
  toolPath: '/multivariable',
};
