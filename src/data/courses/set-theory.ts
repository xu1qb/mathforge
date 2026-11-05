import type { Course } from './types';

export const SET_THEORY_COURSE: Course = {
  id: 'set-theory',
  title: '集合论',
  tagline: '从空集到基数：数学对象的统一语言',
  textbook: {
    name: '集合论（徐森林） + Naive Set Theory（Halmos）',
    edition: '对照两本通行教材',
  },
  prerequisites: ['初等数学'],
  hours: 32,
  intro: {
    what: '集合论给出数学的基本对象与语言：集合、关系、函数、序、基数。它既是入门课，也是公理化数学的地基。',
    objects: ['集合与子集', '关系与函数', '等价关系与商集', '序关系与良序', '基数与可数性'],
    history: [
      '1874：康托尔用双射比较无限集，建立朴素集合论',
      '1901：罗素悖论暴露朴素集合论的问题',
      '1908：策梅洛提出公理化方案，后发展为 ZFC',
      '1920 年代：冯·诺依曼给出序数的标准定义',
    ],
  },
  chapters: [
    {
      id: 'st-basics',
      title: '集合与子集',
      textbookRef: '徐森林 第 1 章 / Halmos 第 1–2 节',
      summary: '集合的运算与幂集，是全部内容的地基',
      goals: ['掌握包含与相等的证明', '会算并交差与幂集', '理解空集的特殊性'],
      lessonIds: ['set-basics'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'st1-1',
          level: '基础',
          question: '集合 $\\{1,2\\}$ 的幂集有多少个元素？',
          answer: '$4$',
          hint: '幂集元素是子集，个数为二的幂。',
          steps: ['子集有空集、两个单元素集、本身。', '共四个。'],
        },
      ],
    },
    {
      id: 'st-relations',
      title: '关系与函数',
      textbookRef: '徐森林 第 2 章 / Halmos 第 3–4 节',
      summary: '用有序对定义关系，用单值性定义函数',
      goals: ['理解笛卡尔积', '判断关系是否为函数', '会写复合函数'],
      lessonIds: ['relations-functions'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'st2-1',
          level: '基础',
          question: '两个元素的集合与三个元素的集合，笛卡尔积有多少元素？',
          answer: '$6$',
          hint: '元素个数相乘。',
          steps: ['二乘三。', '结果为六。'],
        },
      ],
    },
    {
      id: 'st-quotient',
      title: '等价关系与商集',
      textbookRef: '徐森林 第 3 章 / Halmos 第 5–6 节',
      summary: '把等价的东西粘起来，得到商集',
      goals: ['判断等价关系', '求等价类与商集', '理解商集与划分的对应'],
      lessonIds: ['equivalence-quotient'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'st3-1',
          level: '进阶',
          question: '整数模三同余的商集有几个元素？',
          answer: '$3$',
          hint: '按余数分类。',
          steps: ['余数有零、一、二。', '等价类共三个。'],
        },
      ],
    },
    {
      id: 'st-order',
      title: '序关系与良序',
      textbookRef: '徐森林 第 4 章 / Halmos 第 7–8 节',
      summary: '偏序、全序与良序，是超限归纳的前提',
      goals: ['区分偏序与全序', '理解良序定理', '知道佐恩引理的作用'],
      lessonIds: ['order-relations'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'st4-1',
          level: '进阶',
          question: '整数集在通常大小关系下是否良序？',
          answer: '不是（存在无最小元的非空子集）',
          hint: '找反例。',
          steps: ['整数集本身非空。', '没有最小元。', '因此不是良序。'],
        },
      ],
    },
    {
      id: 'st-cardinality',
      title: '基数与可数性',
      textbookRef: '徐森林 第 5 章 / Halmos 第 9–11 节',
      summary: '用双射比较无限集的大小',
      goals: ['理解等势与基数', '会证可数与不可数', '知道康托尔定理'],
      lessonIds: ['set-cardinality'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'st5-1',
          level: '进阶',
          question: '实数集与自然数集是否等势？',
          answer: '不等势（实数不可数）',
          hint: '康托尔对角线法。',
          steps: ['假设可列。', '对角线构造出不在列表中的实数。', '矛盾，因此不可数。'],
        },
      ],
    },
  ],
  applications: [
    { title: '数据库', scene: '计算机', example: '关系模型直接建立在关系与笛卡尔积之上。' },
    { title: '形式化验证', scene: '软件', example: '定理证明器用集合与类型表示数学对象。' },
  ],
  crossings: [
    { subject: '逻辑与基础', relation: '公理化集合论是逻辑与基础分支的第一门课。', courseId: 'logic-foundations' },
    { subject: '组合与离散', relation: '排列组合与图论都以集合论为语言。', courseId: 'combinatorics-discrete' },
  ],
  toolPath: '/discrete',
};
