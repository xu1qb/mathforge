import type { Course } from './types';

export const PROOF_THEORY_COURSE: Course = {
  id: 'proof-theory',
  title: '证明论',
  tagline: '形式证明、切割消除与一致性',
  textbook: { name: '证明论（根岑系统） + Proof Theory（Takeuti / 讲义）', edition: '第 1 版 / 第 2 版' },
  prerequisites: ['数理逻辑'],
  hours: 32,
  intro: {
    what: '证明论把证明本身当作数学对象：形式系统、切割消除、一致性证明与机器检验。',
    objects: ['形式证明', '自然演绎', '切割消除', '一致性', '证明助手'],
    history: ['1934：根岑提出自然演绎与序列演算', '1936：切割消除定理', '1960 年代：证明助手思想萌芽', '21 世纪：Lean/Coq 形式化数学'],
  },
  chapters: [
    {
      id: 'pt-formal', title: '形式证明与自然演绎', textbookRef: '讲义 第 1 章', summary: '引入与消去规则',
      goals: ['写形式证明', '匹配规则'],
      lessonIds: ['formal-proofs', 'sequent-calculus', 'natural-deduction'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'pt1-1', level: '进阶', question: '由 P 与 P→Q 能推出什么？', answer: 'Q', hint: '分离规则。', steps: ['消去蕴含。'] }],
    },
    {
      id: 'pt-cut', title: '切割消除', textbookRef: '讲义 第 2 章', summary: '引理可被消去',
      goals: ['理解切割消除', '知道子公式性质'],
      lessonIds: ['cut-elimination', 'proof-normalization'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'pt2-1', level: '竞赛', question: '无切割证明有什么性质？', answer: '子公式性质', hint: '只含结论子公式。', steps: ['结构受限。'] }],
    },
    {
      id: 'pt-consistency', title: '一致性证明', textbookRef: '讲义 第 3 章', summary: '不能自证一致',
      goals: ['理解一致性', '知道哥德尔限制'],
      lessonIds: ['consistency-proofs', 'ordinal-analysis', 'consistency-proof'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'pt3-1', level: '竞赛', question: '哥德尔第二定理禁止什么？', answer: '系统自证一致', hint: '需更强系统。', steps: ['内部不可完成。'] }],
    },
    {
      id: 'pt-assistants', title: '证明助手', textbookRef: '讲义 第 4 章', summary: '机器检验证明',
      goals: ['理解柯里-霍华德', '知道机器检验边界'],
      lessonIds: ['proof-assistants', 'intuitionistic-proof-theory'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'pt4-1', level: '进阶', question: '柯里-霍华德对应说的是什么？', answer: '命题即类型，证明即程序', hint: '对应关系。', steps: ['类型检查即证明检验。'] }],
    },
  ],
  applications: [{ title: '软件验证', scene: '工程', example: '形式化验证编译器与协议。' }, { title: '数学形式化', scene: '研究', example: 'Lean 形式化重大定理。' }],
  crossings: [{ subject: '数理逻辑', relation: '证明论是逻辑的语法分支。', courseId: 'mathematical-logic' }, { subject: '模型论', relation: '语义与语法互补。', courseId: 'model-theory' }],
  toolPath: '/modern',
};
