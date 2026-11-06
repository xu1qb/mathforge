import type { Course } from './types';

export const REPRESENTATION_THEORY_COURSE: Course = {
  id: 'representation-theory-course', title: '表示论', tagline: '特征标、舒尔引理与完全可约',
  textbook: { name: '表示论（教材） + Representation Theory（Fulton & Harris）', edition: '第 1 版 / 第 1 版' },
  prerequisites: ['群论', '线性代数'],
  hours: 32,
  intro: {
    what: '表示论把抽象群变成矩阵：不可约表示是基本构件，特征标给出可计算的不变量。',
    objects: ['表示与不可约', '舒尔引理', '特征标', '完全可约'],
    history: ['19 世纪末：弗罗贝尼乌斯特征标', '20 世纪：外尔与嘉当', '20 世纪中叶：模表示'],
  },
  chapters: [
    {
      id: 'rp-basic', title: '表示与不可约', textbookRef: '教材 第 1 章 / Fulton 第 1 章', summary: '群作用在向量空间',
      goals: ['判不可约', '分解表示'],
      lessonIds: ['irreducibility', 'regular-representation'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'rp1-1', level: '进阶', question: '有限群在复数域上的表示？', answer: '完全可约', hint: '马施克。', steps: ['进', '阶'] }],
    },
    {
      id: 'rp-schur', title: '舒尔引理', textbookRef: '教材 第 2 章 / Fulton 第 2 章', summary: '交换映射的刚性',
      goals: ['用舒尔引理', '证正交性'],
      lessonIds: ['schur-lemma', 'lie-algebra-basics'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'rp2-1', level: '竞赛', question: '不可约表示自同态是？', answer: '标量', hint: '舒尔引理。', steps: ['竞', '赛'] }],
    },
    {
      id: 'rp-char', title: '特征标', textbookRef: '教材 第 3 章 / Fulton 第 3 章', summary: '迹与正交关系',
      goals: ['算特征标', '求重数'],
      lessonIds: ['characters', 'orthogonality-relations', 'character-table'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'rp3-1', level: '进阶', question: '不可约特征标内积为？', answer: '1', hint: '正交。', steps: ['进', '阶'] }],
    },
    {
      id: 'rp-classic', title: '表示论总览', textbookRef: '教材 第 4 章 / Fulton 第 4 章', summary: '把群变成矩阵',
      goals: ['理解表示', '看特征标'],
      lessonIds: ['representation-theory', 'induced-representations', 'frobenius-reciprocity'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'rp4-1', level: '进阶', question: '一维表示对应什么矩阵？', answer: '标量', hint: '1×1。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '量子力学', scene: '物理', example: '对称群表示。' }, { title: '化学', scene: '分子', example: '点群表示。' }], crossings: [{ subject: '群论', relation: '表示是群同态。', courseId: 'group-theory-course' }, { subject: '线性代数', relation: '表示用矩阵。', courseId: 'linear-algebra' }], toolPath: '/number-theory',
};
