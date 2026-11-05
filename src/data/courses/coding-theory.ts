import type { Course } from './types';

export const CODING_THEORY_COURSE: Course = {
  id: 'coding-theory',
  title: '编码理论',
  tagline: '线性码、汉明码与 RS 码',
  textbook: { name: '纠错码（王新梅） + The Theory of Error-Correcting Codes（MacWilliams & Sloane）', edition: '第 1 版 / 第 1 版' },
  prerequisites: ['代数与数论', '组合数学'],
  hours: 32,
  intro: {
    what: '编码理论研究如何在传输中检测与纠正错误：线性码给出代数结构，汉明码达到完美，RS 码处理突发错误。',
    objects: ['线性码', '汉明距离', '汉明码', 'RS 码'],
    history: ['1948：香农证明信道容量可达', '1950：汉明发明汉明码', '1960：里德与所罗门提出 RS 码'],
  },
  chapters: [
    {
      id: 'ct-linear', title: '线性码', textbookRef: '王新梅 第 2 章 / MacWilliams 第 1 章', summary: '码是有限域上的子空间',
      goals: ['写生成矩阵', '算码参数'],
      lessonIds: ['linear-codes'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'ct1-1', level: '进阶', question: '汉明码 [7,4,3] 能纠几位错？', answer: '1 位', hint: 'd=3。', steps: ['t=(3-1)/2=1。'] }],
    },
    {
      id: 'ct-distance', title: '汉明距离与纠错能力', textbookRef: '王新梅 第 2 章 / MacWilliams 第 1 章', summary: '不同位数的度量',
      goals: ['算距离', '得纠错能力'],
      lessonIds: ['hamming-distance'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'ct2-1', level: '基础', question: '最小距离 4 的码能纠几位？', answer: '1 位', hint: '(4-1)/2 取整。', steps: ['取整得 1。'] }],
    },
    {
      id: 'ct-hamming', title: '汉明码', textbookRef: '王新梅 第 3 章 / MacWilliams 第 1 章', summary: '完美的一比特纠错',
      goals: ['构造汉明码', '理解完美性'],
      lessonIds: ['hamming-code'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'ct3-1', level: '进阶', question: '校验位 3 的汉明码参数？', answer: '[7,4,3]', hint: '2^3-1=7。', steps: ['长度为 7，消息 4 位。'] }],
    },
    {
      id: 'ct-rs', title: 'RS 码', textbookRef: '王新梅 第 5 章 / MacWilliams 第 6 章', summary: '多项式求值编码',
      goals: ['理解构造', '知道 MDS 性质'],
      lessonIds: ['reed-solomon'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'ct4-1', level: '竞赛', question: 'RS 码 [n,k] 的最小距离？', answer: 'n-k+1', hint: '达到辛格尔顿界。', steps: ['MDS 码取等号。'] }],
    },
  ],
  applications: [{ title: '存储', scene: '硬盘与光盘', example: 'RS 码用于纠突发错误。' }, { title: '通信', scene: '5G 与卫星', example: 'LDPC 与极化码用于信道编码。' }],
  crossings: [{ subject: '代数与数论', relation: '有限域是编码的字母表。', courseId: 'algebra-number' }, { subject: '组合与离散', relation: '编码理论是组合设计的分支。', courseId: 'combinatorics-discrete' }],
  toolPath: '/discrete',
};
