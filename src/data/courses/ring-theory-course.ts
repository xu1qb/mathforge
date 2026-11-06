import type { Course } from './types';

export const RING_THEORY_COURSE: Course = {
  id: 'ring-theory-course', title: '环论', tagline: '理想、整环与多项式环',
  textbook: { name: '近世代数（冯克勤） + Abstract Algebra（Dummit & Foote）', edition: '第 1 版 / 第 3 版' },
  prerequisites: ['群论'],
  hours: 32,
  intro: {
    what: '环论研究带加法与乘法的结构：理想、商环、整环的因子分解与多项式环。',
    objects: ['环与理想', '商环', '整环与 UFD', '多项式环', '模'],
    history: ['19 世纪：戴德金与理想', '20 世纪：诺特环论', '20 世纪中叶：同调代数'],
  },
  chapters: [
    {
      id: 'rg-ideal', title: '环与理想', textbookRef: '冯克勤 第 1 章 / Dummit 第 7 章', summary: '商环与同态核',
      goals: ['判断理想', '构造商环'],
      lessonIds: ['ring-ideal', 'quotient-rings', 'prime-maximal-ideals', 'chinese-remainder'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'rg1-1', level: '进阶', question: '偶数集是整数环的理想吗？', answer: '是', hint: '吸收性。', steps: ['进', '阶'] }],
    },
    {
      id: 'rg-ufd', title: '整环与唯一分解', textbookRef: '冯克勤 第 2 章 / Dummit 第 8 章', summary: '因子分解',
      goals: ['判 UFD', '做分解'],
      lessonIds: ['domains-ufd', 'euclidean-domains', 'field-of-fractions'],
      practiceTopics: ['algebra-factor'],
      exercises: [{ id: 'rg2-1', level: '进阶', question: '整数环是 UFD 吗？', answer: '是', hint: '唯一分解。', steps: ['进', '阶'] }],
    },
    {
      id: 'rg-poly', title: '多项式环', textbookRef: '冯克勤 第 3 章 / Dummit 第 9 章', summary: '域上带余除法',
      goals: ['判不可约', '构造扩域'],
      lessonIds: ['polynomial-rings', 'noetherian-rings'],
      practiceTopics: ['algebra-factor'],
      exercises: [{ id: 'rg3-1', level: '进阶', question: '域上一元多项式环是哪类整环？', answer: '欧几里得整环', hint: '有除法。', steps: ['进', '阶'] }],
    },
    {
      id: 'rg-module', title: '模', textbookRef: '冯克勤 第 4 章 / Dummit 第 10 章', summary: '环上的向量空间',
      goals: ['判自由', '用结构定理'],
      lessonIds: ['modules'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'rg4-1', level: '竞赛', question: '自由模的特征？', answer: '有基', hint: '自由定义。', steps: ['竞', '赛'] }],
    },
  ],
  applications: [{ title: '编码理论', scene: '通信', example: '有限域上的码。' }, { title: '代数几何', scene: '几何', example: '坐标环。' }], crossings: [{ subject: '群论', relation: '环的加法群是阿贝尔群。', courseId: 'group-theory-course' }, { subject: '代数数论', relation: '整数环是戴德金整环。', courseId: 'algebraic-number-theory' }], toolPath: '/number-theory',
};
