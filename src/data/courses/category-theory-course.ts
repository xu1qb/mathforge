import type { Course } from './types';

export const CATEGORY_THEORY_COURSE: Course = {
  id: 'category-theory', title: '范畴论', tagline: '对象、态射、函子与泛性质',
  textbook: { name: 'Category Theory（Awodey） + Categories for the Working Mathematician（Mac Lane）', edition: '第 2 版 / 第 2 版' },
  prerequisites: ['集合论', '代数与数论'],
  hours: 28,
  intro: {
    what: '范畴论用对象与态射统一数学结构：函子比较范畴，自然变换比较函子，泛性质刻画构造。',
    objects: ['范畴与态射', '函子', '自然变换', '泛性质'],
    history: ['1945：艾伦伯格与麦克兰', '1950 年代：函子与自然变换', '20 世纪后半：范畴论普及'],
  },
  chapters: [
    {
      id: 'ct-basic', title: '范畴与态射', textbookRef: 'Awodey 第 1 章 / Mac Lane 第 1 章', summary: '对象与复合',
      goals: ['识别范畴', '画交换图'],
      lessonIds: ['category-theory'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'ct1-1', level: '进阶', question: '集合范畴的积是什么？', answer: '笛卡尔积', hint: '泛性质。', steps: ['进', '阶'] }],
    },
    {
      id: 'ct-functor', title: '函子', textbookRef: 'Awodey 第 1 章 / Mac Lane 第 2 章', summary: '范畴之间的映射',
      goals: ['定义函子', '区分协变反变'],
      lessonIds: ['functors'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'ct2-1', level: '进阶', question: '反变函子对态射方向？', answer: '反转', hint: '方向。', steps: ['进', '阶'] }],
    },
    {
      id: 'ct-natural', title: '自然变换', textbookRef: 'Awodey 第 1 章 / Mac Lane 第 2 章', summary: '函子之间的映射',
      goals: ['给组件', '验自然性'],
      lessonIds: ['natural-transformations'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'ct3-1', level: '竞赛', question: '自然变换的自然性要求？', answer: '方块交换', hint: '所有态射。', steps: ['竞', '赛'] }],
    },
    {
      id: 'ct-universal', title: '泛性质', textbookRef: 'Awodey 第 1 章 / Mac Lane 第 3 章', summary: '用映射刻画对象',
      goals: ['写泛性质', '证唯一性'],
      lessonIds: ['universal-property'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'ct4-1', level: '竞赛', question: '泛性质确定的对象唯一吗？', answer: '同构意义唯一', hint: '唯一态射。', steps: ['竞', '赛'] }],
    },
  ],
  applications: [{ title: '编程语言', scene: '计算机', example: '函子与单子。' }, { title: '代数拓扑', scene: '几何', example: '函子性不变量。' }], crossings: [{ subject: '代数与数论', relation: '群环模范畴。', courseId: 'algebra-number' }, { subject: '代数拓扑', relation: '同调函子。', courseId: 'algebraic-topology-course' }], toolPath: '/modern',
};
