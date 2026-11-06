import type { Course } from './types';

export const MODEL_THEORY_COURSE: Course = {
  id: 'model-theory',
  title: '模型论',
  tagline: '语言、结构、紧致性与饱和模型',
  textbook: { name: 'Model Theory: An Introduction（Marker） + 模型论基础', edition: '第 1 版 / 第 1 版' },
  prerequisites: ['数理逻辑', '公理化集合论'],
  hours: 36,
  intro: {
    what: '模型论研究形式语言与结构的关系：理论有哪些模型、模型有多大、元素能有什么性质。',
    objects: ['语言与结构', '紧致性定理', '勒文海姆－斯科伦定理', '类型与饱和'],
    history: ['1930：哥德尔完备性定理', '1950 年代：模型论成为独立分支', '20 世纪后半：稳定性理论'],
  },
  chapters: [
    {
      id: 'mt-language', title: '语言与结构', textbookRef: 'Marker 第 1 章 / 模型论基础 第 1 章', summary: '符号与解释',
      goals: ['写语言', '给结构'],
      lessonIds: ['language-structures', 'elementary-equivalence'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'mt1-1', level: '竞赛', question: '群论语言需要哪些符号？', answer: '乘法、单位元、逆元', hint: '一个函数、一个常元、一个函数。', steps: ['群运算与单位元。'] }],
    },
    {
      id: 'mt-compact', title: '紧致性定理', textbookRef: 'Marker 第 2 章 / 模型论基础 第 2 章', summary: '有限可满足即整体可满足',
      goals: ['用紧致性造模型', '理解非标准模型'],
      lessonIds: ['model-compactness', 'model-completeness'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'mt2-1', level: '竞赛', question: '紧致性能推出算术有非标准模型吗？', answer: '能', hint: '加常元约束。', steps: ['有限可满足，整体有模型。'] }],
    },
    {
      id: 'mt-ls', title: '勒文海姆－斯科伦定理', textbookRef: 'Marker 第 2 章 / 模型论基础 第 3 章', summary: '模型大小',
      goals: ['理解向下向上', '知道可数模型'],
      lessonIds: ['lowenheim-skolem', 'quantifier-elimination', 'stability-theory'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'mt3-1', level: '竞赛', question: '一阶逻辑能定义「可数」吗？', answer: '不能', hint: '上下定理。', steps: ['模型大小可缩放。'] }],
    },
    {
      id: 'mt-types', title: '类型与饱和模型', textbookRef: 'Marker 第 4 章 / 模型论基础 第 4 章', summary: '元素的完整性质',
      goals: ['理解类型', '知道饱和模型'],
      lessonIds: ['types-saturation', 'algebraically-closed-fields', 'real-closed-fields'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'mt4-1', level: '竞赛', question: '饱和模型实现所有相容类型吗？', answer: '实现', hint: '对较小参数集。', steps: ['定义如此。'] }],
    },
  ],
  applications: [{ title: '代数几何', scene: '几何', example: '模型论方法用于簇的几何稳定性。' }, { title: '程序验证', scene: '计算机', example: '理论的可判定性分析。' }],
  crossings: [{ subject: '数理逻辑', relation: '模型论是数理逻辑的语义分支。', courseId: 'mathematical-logic' }, { subject: '公理化集合论', relation: '模型论需要集合论基础。', courseId: 'axiomatic-set-theory' }],
  toolPath: '/modern',
};
