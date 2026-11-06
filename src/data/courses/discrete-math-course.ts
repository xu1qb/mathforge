import type { Course } from './types';

export const DISCRETE_MATH_COURSE: Course = {
  id: 'discrete-math-course', title: '离散数学', tagline: '集合、逻辑、计数与图',
  textbook: { name: '离散数学（教材） + Discrete Mathematics and Its Applications（Rosen）', edition: '第 1 版 / 第 8 版' },
  prerequisites: ['集合论'],
  hours: 32,
  intro: {
    what: '离散数学研究离散结构：集合与关系、命题逻辑、计数方法与图论，是计算机科学的基础。',
    objects: ['集合与关系', '命题逻辑', '计数', '图论基础'],
    history: ['19 世纪：布尔逻辑', '20 世纪：离散数学课程化', '20 世纪后半：计算机推动'],
  },
  chapters: [
    {
      id: 'dm-set', title: '集合与关系', textbookRef: '教材 第 1 章 / Rosen 第 2 章', summary: '笛卡尔积与函数',
      goals: ['写关系', '判函数'],
      lessonIds: ['relations-functions', 'divmod-algorithms'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'dm1-1', level: '基础', question: '两元素与三元素集合的笛卡尔积大小？', answer: '6', hint: '相乘。', steps: ['基', '础'] }],
    },
    {
      id: 'dm-logic', title: '命题逻辑', textbookRef: '教材 第 2 章 / Rosen 第 1 章', summary: '真值表与推理',
      goals: ['写真值表', '判重言式'],
      lessonIds: ['propositional-logic', 'proof-methods', 'mathematical-induction'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'dm2-1', level: '基础', question: '蕴含何时为假？', answer: '真蕴含假', hint: '真值表。', steps: ['基', '础'] }],
    },
    {
      id: 'dm-count', title: '计数方法', textbookRef: '教材 第 3 章 / Rosen 第 6 章', summary: '排列组合',
      goals: ['用乘法原理', '用容斥'],
      lessonIds: ['counting-principles', 'permutations-combinations', 'sequences-sums'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'dm3-1', level: '基础', question: 'C(5,2) 等于？', answer: '10', hint: '组合数。', steps: ['基', '础'] }],
    },
    {
      id: 'dm-graph', title: '图论基础', textbookRef: '教材 第 4 章 / Rosen 第 10 章', summary: '欧拉与树',
      goals: ['判欧拉', '用树'],
      lessonIds: ['graph-euler', 'trees-connectivity', 'algorithms-complexity', 'boolean-functions'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'dm4-1', level: '基础', question: '立方体欧拉公式？', answer: 'V−E+F=2', hint: '8-12+6。', steps: ['基', '础'] }],
    },
  ],
  applications: [{ title: '算法', scene: '计算机', example: '图与计数。' }, { title: '数据库', scene: '工程', example: '关系模型。' }], crossings: [{ subject: '集合论', relation: '离散数学以集合为语言。', courseId: 'set-theory' }, { subject: '组合数学', relation: '计数是离散核心。', courseId: 'combinatorics' }], toolPath: '/discrete',
};
