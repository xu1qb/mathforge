import type { Course } from './types';

export const THEORY_OF_COMPUTATION_COURSE: Course = {
  id: 'theory-of-computation-course', title: '理论计算机科学', tagline: '自动机、可计算性与复杂度',
  textbook: { name: '计算理论导引（Sipser） + Introduction to the Theory of Computation（Sipser）', edition: '第 3 版 / 第 3 版' },
  prerequisites: ['离散数学'],
  hours: 36,
  intro: {
    what: '理论计算机研究计算的边界：自动机刻画可识别语言，可计算性划出能算的界限，复杂度刻画算得多快。',
    objects: ['自动机与形式语言', '可计算性', 'P 与 NP', '归约'],
    history: ['1936：图灵机', '1956：自动机理论', '1971：NP 完全性'],
  },
  chapters: [
    {
      id: 'tc-automata', title: '自动机与形式语言', textbookRef: 'Sipser 第 1 章', summary: '正则与上下文无关',
      goals: ['画自动机', '判语言类型'],
      lessonIds: ['automata-theory'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'tc1-1', level: '进阶', question: '有限自动机识别哪类语言？', answer: '正则语言', hint: '等价性。', steps: ['进', '阶'] }],
    },
    {
      id: 'tc-compute', title: '可计算性', textbookRef: 'Sipser 第 4 章', summary: '停机问题',
      goals: ['理解不可判定', '用对角线'],
      lessonIds: ['computability'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'tc2-1', level: '竞赛', question: '停机问题是否可判定？', answer: '不可判定', hint: '对角线。', steps: ['竞', '赛'] }],
    },
    {
      id: 'tc-complexity', title: 'P 与 NP', textbookRef: 'Sipser 第 7 章', summary: '可解与可验证',
      goals: ['区分 P/NP', '理解 NP 完全'],
      lessonIds: ['p-vs-np'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'tc3-1', level: '进阶', question: 'NP 的含义？', answer: '可多项式验证', hint: '证书。', steps: ['进', '阶'] }],
    },
    {
      id: 'tc-reduction', title: '归约', textbookRef: 'Sipser 第 5 章', summary: '传递难度',
      goals: ['做归约', '证 NP 完全'],
      lessonIds: ['np-reduction'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'tc4-1', level: '竞赛', question: '归约方向？', answer: '已知难→新问题', hint: '传递。', steps: ['竞', '赛'] }],
    },
  ],
  applications: [{ title: '编译器', scene: '工程', example: '词法与语法分析。' }, { title: '算法设计', scene: '研究', example: '复杂度下界。' }], crossings: [{ subject: '数理逻辑', relation: '可计算性与逻辑相关。', courseId: 'mathematical-logic' }, { subject: '计算数学', relation: '复杂度影响算法选择。', courseId: 'computational-math' }], toolPath: '/modern',
};
