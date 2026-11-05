import type { Course } from './types';

export const COMBINATORICS_DISCRETE_COURSE: Course = {
  id: 'combinatorics-discrete',
  title: '组合与离散',
  tagline: '有限、计数、离散结构',
  textbook: { name: '组合与离散数学导论（自编）', edition: '第一版' },
  prerequisites: ['高等数学'],
  hours: 40,
  intro: {
    what: '组合研究计数与排列，离散数学研究有限结构：图、逻辑、集合与范畴。',
    objects: ['计数方法', '图论', '集合论', '数理逻辑', '范畴论'],
    history: ['18 世纪：欧拉解决柯尼斯堡七桥问题', '19 世纪：康托尔建立集合论', '20 世纪：范畴论提供统一语言'],
  },
  chapters: [
    {
      id: 'cd-set',
      title: '集合论',
      textbookRef: '第 1 章',
      summary: '用双射比较大小，从有限走向无限',
      goals: ['理解可数与不可数', '会用双射证明等势'],
      lessonIds: ['set-cardinality'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'cd1-1',
          level: '进阶',
          question: '实数集与自然数集是否等势？',
          answer: '不等势（实数不可数）',
          hint: '康托尔对角线法。',
          steps: ['假设可列。', '对角线构造出不在列表中的数。', '矛盾，因此不可数。'],
        },
      ],
    },
    {
      id: 'cd-graph',
      title: '图论',
      textbookRef: '第 2 章',
      summary: '顶点与边构成的离散结构',
      goals: ['会用欧拉公式', '知道最短路与连通性'],
      lessonIds: ['graph-euler'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'cd2-1',
          level: '基础',
          question: '四个顶点的完全图有多少条边？',
          answer: '$6$',
          hint: '两两相连，组合数。',
          steps: ['从 4 个顶点取 2 个。', 'C(4,2)=6。'],
        },
      ],
    },
    {
      id: 'cd-category',
      title: '范畴论',
      textbookRef: '第 3 章',
      summary: '对象与态射的统一语言',
      goals: ['理解函子与自然变换', '知道范畴论的作用'],
      lessonIds: ['category-theory'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'cd3-1',
          level: '竞赛',
          question: '范畴由哪两部分组成？',
          answer: '对象与态射',
          hint: '最基础的定义。',
          steps: ['一组对象。', '对象之间的态射。'],
        },
      ],
    },
  ],
  applications: [
    { title: '算法分析', scene: '计算机', example: '图算法与计数方法用于复杂度分析。' },
    { title: '编码与密码', scene: '通信', example: '有限域与组合设计支撑纠错码。' },
  ],
  crossings: [
    { subject: '现代数学导论', relation: '范畴论与集合论是现代数学的语言层。', courseId: 'modern-math' },
  ],
  toolPath: '/discrete',
};
