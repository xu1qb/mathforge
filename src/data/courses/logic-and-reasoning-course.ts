import type { Course } from './types';

export const LOGIC_AND_REASONING_COURSE: Course = {
  id: 'logic-and-reasoning-course', title: '逻辑与推理', tagline: '命题逻辑、形式证明与自动机',
  textbook: { name: '逻辑与推理（教材） + Discrete Mathematics and Its Applications（Rosen）', edition: '第 1 版 / 第 8 版' },
  prerequisites: ['集合论'],
  hours: 24,
  intro: {
    what: '逻辑与推理面向计算机：命题逻辑给推理基础，形式证明给验证方法，可计算性与自动机划出边界。',
    objects: ['命题逻辑', '形式证明', '可计算性', '自动机'],
    history: ['19 世纪：布尔代数', '1930 年代：形式证明与可计算性', '20 世纪：自动机理论'],
  },
  chapters: [
    {
      id: 'lr-prop', title: '命题逻辑', textbookRef: '教材 第 1 章 / Rosen 第 1 章', summary: '真值表与重言式',
      goals: ['写真值表', '识别重言式'],
      lessonIds: ['propositional-logic'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'lr1-1', level: '基础', question: '蕴含何时为假？', answer: '真蕴含假', hint: '真值表。', steps: ['基', '础'] }],
    },
    {
      id: 'lr-proof', title: '形式证明', textbookRef: '教材 第 2 章 / Rosen 第 1 章', summary: '自然演绎',
      goals: ['写形式证明', '用分离规则'],
      lessonIds: ['formal-proofs'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'lr2-1', level: '进阶', question: '由 P 与 P→Q 得什么？', answer: 'Q', hint: '分离规则。', steps: ['进', '阶'] }],
    },
    {
      id: 'lr-compute', title: '可计算性', textbookRef: '教材 第 3 章', summary: '停机问题',
      goals: ['理解不可判定', '用对角线'],
      lessonIds: ['computability'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'lr3-1', level: '竞赛', question: '停机问题可判定吗？', answer: '不可判定', hint: '对角线法。', steps: ['竞', '赛'] }],
    },
    {
      id: 'lr-automata', title: '自动机', textbookRef: '教材 第 4 章', summary: '正则语言',
      goals: ['画自动机', '判语言类型'],
      lessonIds: ['automata-theory'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'lr4-1', level: '进阶', question: '有限自动机识别哪类语言？', answer: '正则语言', hint: '等价性。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '编译器', scene: '工程', example: '词法分析。' }, { title: '程序验证', scene: '软件', example: '形式化推理。' }], crossings: [{ subject: '数理逻辑', relation: '逻辑与推理是数理逻辑的计算机版本。', courseId: 'mathematical-logic' }, { subject: '理论计算机科学', relation: '自动机是计算理论的基础。', courseId: 'theory-of-computation-course' }], toolPath: '/modern',
};
