import type { Course } from './types';

export const LOGIC_FOUNDATIONS_COURSE: Course = {
  id: 'logic-foundations',
  title: '逻辑与基础',
  tagline: '公理、证明与不可判定：数学的地基',
  textbook: { name: '逻辑与基础导论（自编）', edition: '第一版（自编）' },
  prerequisites: ['离散数学'],
  hours: 24,
  intro: {
    what: '数理逻辑研究形式系统：公理集合论给出对象，模型论研究语义，递归论研究可计算，证明论研究证明本身。',
    objects: ['公理化集合论', '模型论', '递归论', '证明论'],
    history: ['19 世纪末：弗雷格与皮亚诺建立形式逻辑', '1931：哥德尔不完备定理', '20 世纪中叶：四大分支成型'],
  },
  chapters: [
    {
      id: 'lg-recursion',
      title: '递归论与可判定性',
      textbookRef: '第 1 章',
      summary: '哪些问题能被算法解决',
      goals: ['理解可判定与不可判定', '知道停机问题'],
      lessonIds: ['computability'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'lg1-1',
          level: '竞赛',
          question: '是否存在算法能判断任意程序是否停机？',
          answer: '不存在',
          hint: '停机问题不可判定。',
          steps: ['假设存在。', '构造自指程序矛盾。', '因此不存在。'],
        },
      ],
    },
    {
      id: 'lg-set',
      title: '公理化集合论',
      textbookRef: '第 2 章',
      summary: '用公理避免悖论，ZFC 是标准系统',
      goals: ['理解公理化的动机', '知道罗素悖论'],
      lessonIds: ['set-cardinality'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'lg2-1',
          level: '进阶',
          question: '罗素悖论说明朴素集合论有什么问题？',
          answer: '允许无限制概括会导致矛盾',
          hint: '自指集合。',
          steps: ['考虑所有不含自身的集合。', '它含自身则不含，不含则含。', '矛盾。'],
        },
      ],
    },
  ],
  applications: [
    { title: '程序验证', scene: '软件工程', example: '类型系统建立在逻辑之上。' },
    { title: '数学基础', scene: '研究', example: '证明助手用形式化逻辑检查证明。' },
  ],
  crossings: [
    { subject: '计算与算法', relation: '递归论与可计算性共享图灵机模型。', courseId: 'computation' },
    { subject: '组合与离散', relation: '集合论与逻辑是离散数学的语言。', courseId: 'combinatorics-discrete' },
  ],
  toolPath: '/modern',
};
