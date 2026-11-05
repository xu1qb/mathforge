import type { Course } from './types';

export const AXIOMATIC_SET_COURSE: Course = {
  id: 'axiomatic-set-theory',
  title: '公理化集合论',
  tagline: 'ZFC、序数、基数与独立性：集合论的公理地基',
  textbook: {
    name: 'Set Theory（Jech） + Set Theory: An Introduction to Independence Proofs（Kunen）',
    edition: '第 3 版（Jech） / 第 1 版（Kunen）',
  },
  prerequisites: ['集合论', '数理逻辑'],
  hours: 36,
  intro: {
    what: '公理化集合论用一组公理重建集合，避免朴素概括的悖论，并在此之上发展序数、基数、选择公理与独立性结果。',
    objects: ['ZFC 公理', '序数与超限归纳', '基数与选择公理', '连续统假设', '相对一致性'],
    history: [
      '1908：策梅洛提出首个公理化方案',
      '1922：弗兰克尔与斯科伦补充替换公理，形成 ZFC',
      '1938：哥德尔用内模型证明 CH 的相对一致',
      '1963：科恩用力迫证明 CH 的独立',
    ],
  },
  chapters: [
    {
      id: 'as-axioms',
      title: 'ZFC 公理系统',
      textbookRef: 'Jech 第 1 章 / Kunen 第 1 章',
      summary: '用公理规定哪些集合存在',
      goals: ['掌握分离与替换公理', '理解正则公理的作用', '判断构造是否合法'],
      lessonIds: ['zfc-axioms'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'as1-1',
          level: '竞赛',
          question: '「所有集合的集合」在 ZFC 中存在吗？',
          answer: '不存在',
          hint: '幂集会更大。',
          steps: ['假设存在。', '取幂集得到更大的集合。', '与「所有」矛盾。'],
        },
      ],
    },
    {
      id: 'as-ordinals',
      title: '序数与超限归纳',
      textbookRef: 'Jech 第 2 章 / Kunen 第 2 章',
      summary: '数到无穷的刻度',
      goals: ['理解冯·诺依曼序数', '掌握超限归纳', '区分后继与极限序数'],
      lessonIds: ['ordinals'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'as2-1',
          level: '竞赛',
          question: '最小的无限序数是哪个？',
          answer: '$\\omega$',
          hint: '包含全体自然数。',
          steps: ['序数是良序集。', '最小无限序数记作 $\\omega$。'],
        },
      ],
    },
    {
      id: 'as-cardinals',
      title: '基数与选择公理',
      textbookRef: 'Jech 第 3 章 / Kunen 第 3 章',
      summary: '集合大小与良序定理',
      goals: ['掌握等势与基数', '会用佐恩引理', '理解选择公理的地位'],
      lessonIds: ['cardinals-choice'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'as3-1',
          level: '进阶',
          question: '自然数集与实数集的基数哪个大？',
          answer: '实数更大',
          hint: '康托尔定理。',
          steps: ['自然数可数。', '实数不可数。'],
        },
      ],
    },
    {
      id: 'as-independence',
      title: '相对一致性与独立性',
      textbookRef: 'Kunen 第 4–7 章 / Jech 第 13–14 章',
      summary: '连续统假设为什么独立',
      goals: ['理解内模型与力迫', '知道 CH 的独立性', '读懂条件式结论'],
      lessonIds: ['consistency-independence'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'as4-1',
          level: '竞赛',
          question: '连续统假设与 ZFC 的关系？',
          answer: '独立',
          hint: '哥德尔与科恩两个方向。',
          steps: ['哥德尔证明它在 L 中成立。', '科恩证明否定也可一致。'],
        },
      ],
    },
  ],
  applications: [
    { title: '数学基础', scene: '研究', example: '几乎所有现代数学都在 ZFC 中形式化。' },
    { title: '形式化验证', scene: '计算机', example: 'Lean 与 Coq 的底层逻辑与集合论对应。' },
  ],
  crossings: [
    { subject: '集合论', relation: '本课程是集合论的严格化版本。', courseId: 'set-theory' },
    { subject: '数理逻辑', relation: '公理系统与独立性都建立在逻辑之上。', courseId: 'mathematical-logic' },
  ],
  toolPath: '/discrete',
};
