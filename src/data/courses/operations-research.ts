import type { Course } from './types';

export const OPERATIONS_RESEARCH_COURSE: Course = {
  id: 'operations-research',
  title: '运筹学',
  tagline: '线性规划、单纯形、对偶与网络流',
  textbook: {
    name: 'Introduction to Operations Research（Hillier & Lieberman） + 运筹学（教材编写组，清华大学出版社）',
    edition: '第 10 版 / 第 4 版',
  },
  prerequisites: ['线性代数'],
  hours: 32,
  intro: {
    what: '运筹学研究资源优化配置：线性规划给出模型，单纯形法求解，对偶与网络流刻画结构与灵敏度。',
    objects: ['线性规划', '单纯形法', '对偶理论', '网络流'],
    history: ['1947：丹齐格提出单纯形法', '1950 年代：运筹学成为学科', '20 世纪后半：组合优化发展'],
  },
  chapters: [
    {
      id: 'or-lp',
      title: '线性规划',
      textbookRef: 'Hillier-Lieberman 第 1 章 / Hillier 第 3 章',
      summary: '线性约束下优化',
      goals: ['建模型', '找顶点'],
      lessonIds: ['linear-programming', 'transportation-problem'],
      practiceTopics: ['inequality-solve'],
      exercises: [
        {
          id: 'or1-1',
          level: '基础',
          question: 'x≤2、y≤3 时 x+y 的最大值？',
          answer: '5',
          hint: '右上角。',
          steps: ['基', '础'],
        },
      ],
    },
    {
      id: 'or-simplex',
      title: '单纯形法',
      textbookRef: 'Hillier-Lieberman 第 2 章 / Hillier 第 4 章',
      summary: '沿顶点迭代',
      goals: ['化标准形', '会换基'],
      lessonIds: ['simplex-method', 'integer-programming', 'dynamic-programming'],
      practiceTopics: ['matrix-op'],
      exercises: [
        {
          id: 'or2-1',
          level: '进阶',
          question: '检验数全非负说明什么？',
          answer: '当前解最优',
          hint: '无法改进。',
          steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'or-duality',
      title: '对偶理论',
      textbookRef: 'Hillier-Lieberman 第 3 章 / Hillier 第 6 章',
      summary: '两个问题一个答案',
      goals: ['写对偶', '用强对偶'],
      lessonIds: ['duality-theory', 'sensitivity-analysis'],
      practiceTopics: ['inequality-solve'],
      exercises: [
        {
          id: 'or3-1',
          level: '进阶',
          question: '强对偶说明什么？',
          answer: '最优值相等',
          hint: '两者相等。',
          steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'or-network',
      title: '网络流',
      textbookRef: 'Hillier-Lieberman 第 4 章 / Hillier 第 7 章',
      summary: '最大流最小割',
      goals: ['找增广路', '判最优'],
      lessonIds: ['network-flow', 'network-optimization', 'queueing-or'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'or4-1',
          level: '进阶',
          question: '最大流与最小割的关系？',
          answer: '值相等',
          hint: '定理。',
          steps: ['进', '阶'],
        },
      ],
    },
  ],
  applications: [{ title: '物流', scene: '运输', example: '路径与流量优化。' }, { title: '排班', scene: '管理', example: '线性规划排班。' }],
  crossings: [{ subject: '线性代数', relation: '单纯形法用矩阵运算。', courseId: 'linear-algebra' }, { subject: '图论', relation: '网络流是图上的优化。', courseId: 'combinatorics-discrete' }],
  toolPath: '/tools',
};
