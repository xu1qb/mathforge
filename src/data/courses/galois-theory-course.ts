import type { Course } from './types';

export const GALOIS_COURSE: Course = {
  id: 'galois-theory-course', title: '伽罗瓦理论', tagline: '域扩张、群与方程可解性',
  textbook: { name: '伽罗瓦理论（教材） + Galois Theory（Edwards）', edition: '第 1 版 / 第 3 版' },
  prerequisites: ['域论', '群论'],
  hours: 32,
  intro: {
    what: '伽罗瓦理论用域扩张的自同构群研究方程可解性：正规可分扩张的中间域与子群对应，群可解等价根式可解。',
    objects: ['正规与可分', '伽罗瓦群', '伽罗瓦对应', '可解群'],
    history: ['1832：伽罗瓦手稿', '19 世纪：戴德金与阿廷整理', '20 世纪：无限伽罗瓦理论'],
  },
  chapters: [
    {
      id: 'ga-normal', title: '正规与可分扩张', textbookRef: '教材 第 1 章 / Edwards 第 2 章', summary: '伽罗瓦扩张的前提',
      goals: ['判正规', '判可分'],
      lessonIds: ['normal-separable'],
      practiceTopics: ['algebra-factor'],
      exercises: [{ id: 'ga1-1', level: '进阶', question: '特征零的有限扩张一定可分吗？', answer: '可分', hint: '特征零。', steps: ['进', '阶'] }],
    },
    {
      id: 'ga-group', title: '伽罗瓦群', textbookRef: '教材 第 2 章 / Edwards 第 3 章', summary: '自同构群',
      goals: ['算伽罗瓦群', '用对应定理'],
      lessonIds: ['galois-theory'],
      practiceTopics: ['algebra-factor'],
      exercises: [{ id: 'ga2-1', level: '竞赛', question: '一般五次方程伽罗瓦群？', answer: '对称群', hint: '不可解。', steps: ['竞', '赛'] }],
    },
    {
      id: 'ga-solvable', title: '可解群与根式可解', textbookRef: '教材 第 3 章 / Edwards 第 4 章', summary: '群论判据',
      goals: ['判可解', '联系方程'],
      lessonIds: ['solvable-groups'],
      practiceTopics: ['algebra-factor'],
      exercises: [{ id: 'ga3-1', level: '竞赛', question: '交换群可解吗？', answer: '可解', hint: '一步。', steps: ['竞', '赛'] }],
    },
    {
      id: 'ga-field', title: '域扩张基础', textbookRef: '教材 第 4 章 / Edwards 第 1 章', summary: '次数与代数元',
      goals: ['算次数', '求极小多项式'],
      lessonIds: ['field-extensions', 'algebraic-elements'],
      practiceTopics: ['algebra-factor'],
      exercises: [{ id: 'ga4-1', level: '进阶', question: '有理数添根号二的次数？', answer: '2', hint: '基。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '方程求解', scene: '数学', example: '判定根式可解性。' }, { title: '密码学', scene: '安全', example: '有限域结构。' }], crossings: [{ subject: '域论', relation: '伽罗瓦理论建立在域扩张上。', courseId: 'field-theory' }, { subject: '群论', relation: '伽罗瓦群是群。', courseId: 'group-theory-course' }], toolPath: '/number-theory',
};
