import type { Course } from './types';

export const FUNCTIONAL_ANALYSIS_COURSE: Course = {
  id: 'functional-analysis',
  title: '泛函分析',
  tagline: '范数、内积与算子：无限维的线性代数',
  textbook: {
    name: '泛函分析讲义（张恭庆） + Functional Analysis（Rudin）',
    edition: '第 2 版（张恭庆） / 第 2 版（Rudin）',
  },
  prerequisites: ['实分析', '线性代数'],
  hours: 48,
  intro: {
    what: '泛函分析把线性代数推广到无限维：赋范空间、希尔伯特空间、有界算子与对偶，核心是谱与投影。',
    objects: ['赋范空间', '巴拿赫空间', '希尔伯特空间', '有界算子', '谱定理'],
    history: [
      '1900 年代：希尔伯特研究积分方程',
      '1920 年代：巴拿赫建立赋范空间理论',
      '1930 年代：冯·诺依曼奠定算子理论',
      '20 世纪中叶：泛函分析成为分析的核心工具',
    ],
  },
  chapters: [
    {
      id: 'fa-normed',
      title: '赋范空间与巴拿赫空间',
      textbookRef: '张恭庆 第 1 章 / Rudin 第 1 章',
      summary: '把长度抽象成范数',
      goals: ['掌握范数三公理', '理解完备性', '会比较不同范数'],
      lessonIds: ['normed-spaces'],
      practiceTopics: ['vector-op'],
      exercises: [
        {
          id: 'fa1-1',
          level: '进阶',
          question: '二维向量 $(1,-1)$ 的最大范数是多少？',
          answer: '$1$',
          hint: '取分量绝对值最大者。',
          steps: ['两个分量绝对值都是 1。', '最大范数为 1。'],
        },
      ],
    },
    {
      id: 'fa-hilbert',
      title: '希尔伯特空间与投影',
      textbookRef: '张恭庆 第 2 章 / Rudin 第 4 章',
      summary: '无限维的欧氏几何',
      goals: ['理解内积诱导范数', '掌握正交投影', '会用正交基展开'],
      lessonIds: ['hilbert-spaces'],
      practiceTopics: ['vector-op'],
      exercises: [
        {
          id: 'fa2-1',
          level: '进阶',
          question: '把向量 $(1,1)$ 投影到 $x$ 轴，结果是多少？',
          answer: '$(1,0)$',
          hint: '保留 $x$ 分量。',
          steps: ['$x$ 轴是闭子空间。', '投影为 $(1,0)$。'],
        },
      ],
    },
    {
      id: 'fa-operators',
      title: '有界线性算子与对偶',
      textbookRef: '张恭庆 第 3 章 / Rudin 第 2 章',
      summary: '连续等价于有界',
      goals: ['判断算子有界', '会算算子范数', '理解对偶空间'],
      lessonIds: ['bounded-operators'],
      practiceTopics: ['matrix-op'],
      exercises: [
        {
          id: 'fa3-1',
          level: '进阶',
          question: '二倍恒等算子的算子范数是多少？',
          answer: '$2$',
          hint: '取单位球上像的范数上确界。',
          steps: ['像的范数是原像两倍。', '上确界为 2。'],
        },
      ],
    },
    {
      id: 'fa-spectral',
      title: '谱定理',
      textbookRef: '张恭庆 第 4 章 / Rudin 第 13 章',
      summary: '紧自伴算子的正交对角化',
      goals: ['理解谱的概念', '掌握紧自伴谱定理', '知道谱可能不含特征值'],
      lessonIds: ['spectral-theorem'],
      practiceTopics: ['matrix-op'],
      exercises: [
        {
          id: 'fa4-1',
          level: '竞赛',
          question: '对角元为 2、3 的对角矩阵的谱是什么？',
          answer: '\\{2,3\\}',
          hint: '特征值即对角元。',
          steps: ['对角矩阵特征值为对角元。', '谱是两点集合。'],
        },
      ],
    },
  ],
  applications: [
    { title: '量子力学', scene: '物理', example: '可观测量是自伴算子，谱是测量值。' },
    { title: '数值分析', scene: '计算', example: '投影与算子范数用于误差估计。' },
  ],
  crossings: [
    { subject: '线性代数', relation: '泛函分析是线性代数的无限维推广。', courseId: 'linear-algebra' },
    { subject: '实分析', relation: '完备性与积分理论是泛函的基础。', courseId: 'real-analysis' },
  ],
  toolPath: '/multivariable',
};
