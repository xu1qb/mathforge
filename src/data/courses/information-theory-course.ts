import type { Course } from './types';

export const INFORMATION_THEORY_COURSE: Course = {
  id: 'information-theory-course', title: '信息论', tagline: '熵、信道容量与编码',
  textbook: {
    name: 'Elements of Information Theory（Cover & Thomas） + 信息论——基础理论与应用（傅祖芸）',
    edition: '第 2 版 / 第 4 版',
  },
  prerequisites: ['概率统计'],
  hours: 32,
  intro: {
    what: '信息论量化不确定性：熵度量信息量，信道容量给出可靠传输上限，编码定理说明如何逼近极限。',
    objects: ['熵与互信息', '信道容量', '信源编码', '纠错码'],
    history: ['1948：香农论文', '1950 年代：编码理论', '20 世纪后半：网络信息论'],
  },
  chapters: [
    {
      id: 'it-entropy', title: '熵与互信息', textbookRef: 'Cover-Thomas 第 1 章 / Cover 第 2 章', summary: '不确定性的度量',
      goals: ['算熵', '算互信息'],
      lessonIds: ['information-entropy', 'relative-entropy', 'aep'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'it1-1', level: '基础', question: '均匀硬币的熵？', answer: '1 比特', hint: '两种等概率。', steps: ['基', '础'] }],
    },
    {
      id: 'it-capacity', title: '信道容量', textbookRef: 'Cover-Thomas 第 2 章 / Cover 第 7 章', summary: '可靠传输上限',
      goals: ['算容量', '理解香农定理'],
      lessonIds: ['channel-capacity', 'gaussian-channel'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'it2-1', level: '进阶', question: '信道容量定义？', answer: '互信息最大值', hint: '取最大。', steps: ['进', '阶'] }],
    },
    {
      id: 'it-source', title: '信源编码', textbookRef: 'Cover-Thomas 第 3 章 / Cover 第 5 章', summary: '压缩极限',
      goals: ['用熵定界', '设计编码'],
      lessonIds: ['source-coding', 'huffman-coding'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'it3-1', level: '进阶', question: '无损压缩下界？', answer: '熵', hint: '理论极限。', steps: ['进', '阶'] }],
    },
    {
      id: 'it-channel-code', title: '信道编码', textbookRef: 'Cover-Thomas 第 4 章 / Cover 第 7 章', summary: '纠错与定理',
      goals: ['设计纠错', '理解定理'],
      lessonIds: ['error-correcting-codes-info', 'differential-entropy', 'rate-distortion'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'it4-1', level: '进阶', question: '信道编码定理条件？', answer: '速率低于容量', hint: '可达性。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '通信', scene: '5G', example: '信道编码与调制。' }, { title: '存储', scene: '硬盘', example: '纠错码。' }], crossings: [{ subject: '概率统计', relation: '信息论基于概率。', courseId: 'probability-theory-course' }, { subject: '编码理论', relation: '信道编码与纠错码。', courseId: 'coding-theory' }], toolPath: '/data-chart',
};
