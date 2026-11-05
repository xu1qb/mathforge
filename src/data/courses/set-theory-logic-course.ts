import type { Course } from './types';

export const SET_THEORY_LOGIC_COURSE: Course = {
  id: 'set-theory-logic-course', title: '公理化集合论（逻辑视角）', tagline: 'ZFC、序数与独立性',
  textbook: { name: 'Set Theory（Jech） + 公理化集合论讲义', edition: '第 3 版 / 第 1 版' },
  prerequisites: ['数理逻辑'],
  hours: 28,
  intro: {
    what: '从逻辑视角看 ZFC：公理系统如何避免悖论，序数基数如何编码，连续统假设为何独立。',
    objects: ['ZFC 公理', '序数与超限归纳', '基数与选择', '相对一致性'],
    history: ['1908：策梅洛公理', '1922：ZFC 成型', '1938/1963：CH 独立'],
  },
  chapters: [
    {
      id: 'sl-axioms', title: 'ZFC 公理', textbookRef: 'Jech 第 1 章', summary: '分离与正则',
      goals: ['判断构造合法', '理解防悖论'],
      lessonIds: ['zfc-axioms'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'sl1-1', level: '竞赛', question: '「所有集合的集合」存在吗？', answer: '不存在', hint: '幂集更大。', steps: ['竞', '赛'] }],
    },
    {
      id: 'sl-ordinal', title: '序数', textbookRef: 'Jech 第 2 章', summary: '超限归纳',
      goals: ['理解序数', '用超限归纳'],
      lessonIds: ['ordinals'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'sl2-1', level: '竞赛', question: '最小无限序数？', answer: 'ω', hint: '自然数全体。', steps: ['竞', '赛'] }],
    },
    {
      id: 'sl-cardinal', title: '基数与选择', textbookRef: 'Jech 第 3 章', summary: '大小与良序',
      goals: ['比基数', '用选择公理'],
      lessonIds: ['cardinals-choice'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'sl3-1', level: '进阶', question: '自然数与实数哪个基数大？', answer: '实数', hint: '不可数。', steps: ['进', '阶'] }],
    },
    {
      id: 'sl-indep', title: '独立性与一致性', textbookRef: 'Jech 第 13 章', summary: 'CH 独立',
      goals: ['理解独立性', '知道内模型与力迫'],
      lessonIds: ['consistency-independence'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'sl4-1', level: '竞赛', question: 'CH 与 ZFC 关系？', answer: '独立', hint: '两方向。', steps: ['竞', '赛'] }],
    },
  ],
  applications: [{ title: '数学基础', scene: '研究', example: 'ZFC 形式化。' }, { title: '形式化验证', scene: '计算机', example: '集合论模型。' }], crossings: [{ subject: '公理化集合论', relation: '同一主题的另一种组织。', courseId: 'axiomatic-set-theory' }, { subject: '数理逻辑', relation: '逻辑是集合论的语言。', courseId: 'mathematical-logic' }], toolPath: '/discrete',
};
