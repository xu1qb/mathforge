import type { Course } from './types';

export const COMPUTATION_COURSE: Course = {
  id: 'computation',
  title: '计算与算法',
  tagline: '可计算的边界在哪里：从图灵机到 P 与 NP',
  textbook: {
    name: 'Introduction to the Theory of Computation（Sipser） + Algorithm Design（Kleinberg & Tardos）',
    edition: '第 3 版 / 第 1 版',
  },
  prerequisites: ['离散数学'],
  hours: 36,
  intro: {
    what: '计算理论划出能算与不能算的边界，复杂度刻画算得多快，密码学则依赖计算的困难性。',
    objects: ['可计算性', 'P 与 NP', '归约', '密码学', '信息论'],
    history: ['1936：图灵给出图灵机模型', '1971：库克提出 NP 完全性', '1977：RSA 公钥密码问世'],
  },
  chapters: [
    {
      id: 'cp-compute',
      title: '可计算性与复杂度',
      textbookRef: '第 1 章',
      summary: '停机问题不可判定，P 与 NP 是未解难题',
      goals: ['理解停机问题', '知道 P 与 NP 的含义'],
      lessonIds: ['computability', 'p-vs-np', 'np-reduction'],
      practiceTopics: ['combinatorics-basic'],
      exercises: [
        {
          id: 'cp1-1',
          level: '进阶',
          question: '停机问题是否可判定？',
          answer: '不可判定',
          hint: '图灵用对角线法证明。',
          steps: ['假设存在判定程序。', '构造自指程序导出矛盾。', '因此不可判定。'],
        },
      ],
    },
    {
      id: 'cp-crypto',
      title: '密码学',
      textbookRef: '第 2 章',
      summary: '用数学困难性构建安全通信',
      goals: ['理解 RSA 三步', '知道公钥与私钥的分工'],
      lessonIds: ['crypto-rsa'],
      practiceTopics: ['nt-gcd'],
      exercises: [
        {
          id: 'cp2-1',
          level: '进阶',
          question: 'RSA 取 $p=3$、$q=11$、$e=3$，私钥 $d$ 是多少？',
          answer: '$7$',
          hint: '满足 $ed\\equiv 1\\pmod{(p-1)(q-1)}$。',
          steps: ['模数为 20。', '$3d\\equiv 1\\pmod{20}$。', '$d=7$。'],
        },
      ],
    },
    {
      id: 'cp-info',
      title: '信息论',
      textbookRef: '第 3 章',
      summary: '用熵度量不确定性',
      goals: ['会算信息熵', '理解编码长度与熵的关系'],
      lessonIds: ['information-entropy'],
      practiceTopics: ['random-variable'],
      exercises: [
        {
          id: 'cp3-1',
          level: '基础',
          question: '均匀抛硬币的香农熵是多少比特？',
          answer: '$1$',
          hint: '熵为负的概率对数之和。',
          steps: ['两种结果各 $1/2$。', '熵为 1 比特。'],
        },
      ],
    },
  ],
  applications: [
    { title: '通信安全', scene: '互联网', example: 'TLS 握手依赖公钥密码。' },
    { title: '算法设计', scene: '工程', example: '复杂度决定方案能否落地。' },
  ],
  crossings: [
    { subject: '现代数学导论', relation: '可计算性与复杂度是现代数学的计算分支。', courseId: 'modern-math' },
    { subject: '组合与离散', relation: '图论与计数是算法分析的基础。', courseId: 'combinatorics-discrete' },
  ],
  toolPath: '/modern',
};
