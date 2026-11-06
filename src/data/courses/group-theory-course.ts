import type { Course } from './types';

export const GROUP_THEORY_COURSE: Course = {
  id: 'group-theory-course', title: '群论', tagline: '子群、群作用与西罗定理',
  textbook: { name: '近世代数（冯克勤） + Abstract Algebra（Dummit & Foote）', edition: '第 1 版 / 第 3 版' },
  prerequisites: ['线性代数'],
  hours: 32,
  intro: {
    what: '群论研究对称性的代数结构：子群、陪集、群作用与西罗定理刻画有限群。',
    objects: ['群与子群', '陪集与拉格朗日', '群作用', '西罗定理'],
    history: ['19 世纪：伽罗瓦与凯莱', '1872：克莱因埃尔朗根纲领', '20 世纪：有限群分类'],
  },
  chapters: [
    {
      id: 'gp-basic', title: '群与子群', textbookRef: '冯克勤 第 1 章 / Dummit 第 1 章', summary: '封闭、结合、单位、逆',
      goals: ['验证群', '找子群'],
      lessonIds: ['group-theory', 'permutation-groups'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'gp1-1', level: '进阶', question: '模六加法群的子群阶可能是？', answer: '1、2、3、6', hint: '拉格朗日。', steps: ['进', '阶'] }],
    },
    {
      id: 'gp-cosets', title: '陪集与拉格朗日定理', textbookRef: '冯克勤 第 2 章 / Dummit 第 3 章', summary: '陪集划分群',
      goals: ['算指数', '用整除'],
      lessonIds: ['subgroups-cosets', 'normal-subgroup', 'isomorphism-theorems'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'gp2-1', level: '基础', question: '指数为二的子群性质？', answer: '正规', hint: '指数 2。', steps: ['基', '础'] }],
    },
    {
      id: 'gp-actions', title: '群作用', textbookRef: '冯克勤 第 3 章 / Dummit 第 4 章', summary: '轨道与稳定子',
      goals: ['求轨道', '用伯恩赛德'],
      lessonIds: ['group-actions'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [{ id: 'gp3-1', level: '进阶', question: '轨道大小等于？', answer: '群阶除稳定子阶', hint: '轨道-稳定子。', steps: ['进', '阶'] }],
    },
    {
      id: 'gp-sylow', title: '西罗定理', textbookRef: '冯克勤 第 4 章 / Dummit 第 4 章', summary: '存在与计数',
      goals: ['找西罗子群', '判正规'],
      lessonIds: ['sylow-theorems', 'p-groups', 'composition-series', 'solvable-groups'],
      practiceTopics: ['nt-gcd'],
      exercises: [{ id: 'gp4-1', level: '竞赛', question: '西罗子群个数模 p 余几？', answer: '1', hint: '同余。', steps: ['竞', '赛'] }],
    },
    {
      id: 'gp-free',
      title: '自由群与群表示',
      textbookRef: '冯克勤 第 5 章 / Dummit 第 6 章',
      summary: '生成元与关系',
      goals: ['写约化词', '用泛性质', '读群表示'],
      lessonIds: ['free-groups'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'gp5-1',
          level: '竞赛',
          question: '两个生成元的自由群是交换群吗？',
          answer: '不是（ab≠ba）',
          hint: '自由群只有平凡关系。',
          steps: ['自由群没有交换关系。', '故 ab≠ba。'],
        },
      ],
    },
  ],
  applications: [{ title: '晶体学', scene: '材料', example: '空间群分类。' }, { title: '密码学', scene: '安全', example: '群上的离散对数。' }], crossings: [{ subject: '线性代数', relation: '矩阵群是典型例子。', courseId: 'linear-algebra' }, { subject: '环论', relation: '群加乘法成环。', courseId: 'ring-theory-course' }], toolPath: '/number-theory',
};
