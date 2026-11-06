import type { Course } from './types';

export const GRAPH_THEORY_COURSE: Course = {
  id: 'graph-theory-course', title: '图论', tagline: '树、平面图、着色与欧拉',
  textbook: { name: '图论（教材） + Introduction to Graph Theory（West）', edition: '第 1 版 / 第 2 版' },
  prerequisites: ['组合数学'],
  hours: 32,
  intro: {
    what: '图论研究顶点与边构成的离散结构：树与连通、平面嵌入、着色与极值问题。',
    objects: ['树与连通', '平面图', '图着色', '欧拉问题'],
    history: ['1736：欧拉七桥', '1936：柯尼希首部图论', '1976：四色定理机证'],
  },
  chapters: [
    {
      id: 'gt-basics', title: '图的基本概念与欧拉', textbookRef: '教材 第 1 章 / West 第 1 章', summary: '欧拉迹与公式',
      goals: ['判欧拉', '用欧拉公式'],
      lessonIds: ['graph-euler', 'hamiltonian'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'gtb1-1', level: '基础', question: '立方体满足欧拉公式吗？', answer: '满足', hint: '8-12+6=2。', steps: ['基', '础'] }],
    },
    {
      id: 'gt-trees', title: '树与连通性', textbookRef: '教材 第 2 章 / West 第 2 章', summary: 'n-1 条边',
      goals: ['判树', '求生成树'],
      lessonIds: ['trees-connectivity', 'matching-cover', 'hall-theorem'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'gtt2-1', level: '基础', question: '五顶点的树有几条边？', answer: '4', hint: 'n-1。', steps: ['基', '础'] }],
    },
    {
      id: 'gt-planar', title: '平面图', textbookRef: '教材 第 3 章 / West 第 6 章', summary: '无交叉嵌入',
      goals: ['判平面', '用边数界'],
      lessonIds: ['planar-graphs', 'turan-theorem'],
      practiceTopics: ['geometry-basic'],
      exercises: [{ id: 'gtp3-1', level: '进阶', question: '简单平面图边数上界？', answer: '3V-6', hint: '欧拉公式。', steps: ['进', '阶'] }],
    },
    {
      id: 'gt-color', title: '图着色', textbookRef: '教材 第 4 章 / West 第 5 章', summary: '色数与四色',
      goals: ['求色数', '判二部'],
      lessonIds: ['graph-coloring', 'menger-theorem', 'network-flow'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'gtc4-1', level: '基础', question: '平面图最多几色？', answer: '4', hint: '四色定理。', steps: ['基', '础'] }],
    },
  ],
  applications: [{ title: '网络设计', scene: '工程', example: '连通与路由。' }, { title: '排课', scene: '管理', example: '着色建模。' }], crossings: [{ subject: '组合数学', relation: '图论是组合的分支。', courseId: 'combinatorics' }, { subject: '运筹学', relation: '网络流是图优化。', courseId: 'operations-research' }], toolPath: '/discrete',
};
