import type { Course } from './types';

export const HARMONIC_ANALYSIS_COURSE: Course = {
  id: 'harmonic-analysis',
  title: '调和分析',
  tagline: '傅里叶变换、卷积与 L² 理论',
  textbook: {
    name: 'Fourier Analysis: An Introduction（Stein & Shakarchi） + 傅里叶分析（潘文杰）',
    edition: '第 1 版（Stein） / 第 1 版（潘文杰）',
  },
  prerequisites: ['实分析'],
  hours: 40,
  intro: {
    what: '调和分析研究函数与频率的关系：傅里叶变换把函数拆成频率成分，卷积把叠加变成乘积，L² 理论保证能量守恒。',
    objects: ['傅里叶变换', '卷积', 'L² 理论', '傅里叶级数收敛性'],
    history: [
      '1807：傅里叶提出热传导级数解法',
      '19 世纪：狄利克雷与黎曼研究收敛性',
      '1900 年代：普朗歇尔与 Plancherel 建立 L² 理论',
      '20 世纪：调和分析成为分析的核心分支',
    ],
  },
  chapters: [
    {
      id: 'ha-transform',
      title: '傅里叶变换',
      textbookRef: 'Stein 第 1–2 章 / 潘文杰 第 2 章',
      summary: '时域到频域的积分变换',
      goals: ['会算常见变换', '掌握微分变乘法', '理解逆变换'],
      lessonIds: ['fourier-transform'],
      practiceTopics: ['fourier-basic'],
      exercises: [
        {
          id: 'ha1-1',
          level: '进阶',
          question: '高斯函数的傅里叶变换是什么函数？',
          answer: '仍是高斯函数',
          hint: '高斯在变换下保持形式。',
          steps: ['积分计算得高斯。', '宽度取倒数。'],
        },
      ],
    },
    {
      id: 'ha-convolution',
      title: '卷积',
      textbookRef: 'Stein 第 3 章 / 潘文杰 第 3 章',
      summary: '叠加与加权平均',
      goals: ['掌握卷积定义', '会用卷积定理', '理解滤波'],
      lessonIds: ['convolution'],
      practiceTopics: ['fourier-basic'],
      exercises: [
        {
          id: 'ha2-1',
          level: '进阶',
          question: '卷积的傅里叶变换等于什么？',
          answer: '变换的乘积',
          hint: '卷积定理。',
          steps: ['卷积定理给出结论。', '频域逐点相乘。'],
        },
      ],
    },
    {
      id: 'ha-l2',
      title: 'L² 理论与普朗歇尔',
      textbookRef: 'Stein 第 5 章 / 潘文杰 第 4 章',
      summary: '变换是保范酉算子',
      goals: ['理解延拓', '掌握普朗歇尔定理', '知道能量守恒'],
      lessonIds: ['l2-fourier'],
      practiceTopics: ['fourier-basic'],
      exercises: [
        {
          id: 'ha3-1',
          level: '进阶',
          question: '普朗歇尔定理说明傅里叶变换保持什么？',
          answer: 'L² 范数（能量）',
          hint: '保范性。',
          steps: ['范数保持不变。', '内积也保持。'],
        },
      ],
    },
    {
      id: 'ha-series',
      title: '傅里叶级数的收敛性',
      textbookRef: 'Stein 第 2 章 / 潘文杰 第 5 章',
      summary: '逐点、一致与 L² 收敛',
      goals: ['区分三种收敛', '理解吉布斯现象', '知道狄利克雷条件'],
      lessonIds: ['fourier-series-convergence'],
      practiceTopics: ['series-convergence'],
      exercises: [
        {
          id: 'ha4-1',
          level: '进阶',
          question: '方波在跳跃点处傅里叶级数收敛到多少？',
          answer: '$0$',
          hint: '两侧极限平均。',
          steps: ['两侧极限为 $1$ 与 $-1$。', '平均为 $0$。'],
        },
      ],
    },
  ],
  applications: [
    { title: '信号处理', scene: '工程', example: '滤波就是与核函数卷积。' },
    { title: '偏微分方程', scene: '物理', example: '分离变量解热方程。' },
  ],
  crossings: [
    { subject: '实分析', relation: 'L² 理论建立在勒贝格积分上。', courseId: 'real-analysis' },
    { subject: '泛函分析', relation: '傅里叶变换是希尔伯特空间上的酉算子。', courseId: 'functional-analysis' },
  ],
  toolPath: '/fourier',
};
