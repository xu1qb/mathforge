import type { Course } from './types';

export const COMBINATORICS_COURSE: Course = {
  id: 'combinatorics',
  title: '组合数学',
  tagline: '计数、排列与生成函数',
  textbook: { name: '组合数学（史济怀） + Enumerative Combinatorics（Stanley）', edition: '第 1 版 / 第 2 版' },
  prerequisites: ['集合论'],
  hours: 32,
  intro: {
    what: '组合数学研究有限结构的计数：加法与乘法原理、排列组合、容斥、生成函数与抽屉原理。',
    objects: ['计数原理', '排列与组合', '容斥原理', '生成函数', '抽屉原理'],
    history: ['17 世纪：帕斯卡与费马研究组合数', '18 世纪：欧拉研究分拆与生成函数', '20 世纪：组合数学成为独立分支'],
  },
  chapters: [
    {
      id: 'cb-principles', title: '计数原理与容斥', textbookRef: '史济怀 第 1 章 / Stanley 第 1 章', summary: '加法与乘法的分工',
      goals: ['区分分类与分步', '会用容斥'],
      lessonIds: ['counting-principles'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'cb1-1', level: '基础', question: '从 5 人中选 2 人有几种选法？', answer: '10', hint: '组合数。', steps: ['C(5,2)=10。'] }],
    },
    {
      id: 'cb-perm', title: '排列与组合', textbookRef: '史济怀 第 2 章 / Stanley 第 1 章', summary: '顺序与无序',
      goals: ['区分有无顺序', '处理重复元素'],
      lessonIds: ['permutations-combinations'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'cb2-1', level: '基础', question: '从 5 人中选 3 人排队有几种排法？', answer: '60', hint: '排列数。', steps: ['P(5,3)=60。'] }],
    },
    {
      id: 'cb-gen', title: '生成函数', textbookRef: '史济怀 第 4 章 / Stanley 第 1 章', summary: '数列变成函数',
      goals: ['写生成函数', '提取系数'],
      lessonIds: ['generating-functions'],
      practiceTopics: ['series-convergence'],
      exercises: [{ id: 'cb3-1', level: '进阶', question: '全 1 数列的生成函数？', answer: '1/(1-x)', hint: '几何级数。', steps: ['公比为 x。'] }],
    },
    {
      id: 'cb-pigeon', title: '抽屉原理', textbookRef: '史济怀 第 3 章 / Stanley 第 1 章', summary: '必然的重复',
      goals: ['构造盒子', '用推广形式'],
      lessonIds: ['pigeonhole'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'cb4-1', level: '基础', question: '13 人中至少两人同月出生吗？', answer: '必然', hint: '12 个月是盒子。', steps: ['13 个物体放入 12 个盒子。'] }],
    },
  ],
  applications: [{ title: '算法分析', scene: '计算机', example: '计数用于复杂度估计。' }, { title: '密码学', scene: '安全', example: '计数用于安全性分析。' }],
  crossings: [{ subject: '集合论', relation: '组合以集合为对象。', courseId: 'set-theory' }, { subject: '组合与离散', relation: '组合是离散数学的核心。', courseId: 'combinatorics-discrete' }],
  toolPath: '/discrete',
};
