import type { Course } from './types';

export const MEASURE_THEORY_COURSE: Course = {
  id: 'measure-theory-course',
  title: '测度论',
  tagline: '外测度、扩张、乘积与 Radon－Nikodym',
  textbook: {
    name: 'Real Analysis（Folland） + 实变函数论（周民强）',
    edition: '第 2 版（Folland） / 第 3 版（周民强）',
  },
  prerequisites: ['实分析'],
  hours: 40,
  intro: {
    what: '测度论系统研究「大小」：从外测度出发，经卡拉泰奥多里扩张得到测度，再讨论乘积测度与测度导数。',
    objects: ['外测度', '可测集', '卡拉泰奥多里扩张', '乘积测度', 'Radon－Nikodym 导数'],
    history: [
      '1902：勒贝格定义测度与积分',
      '1914：卡拉泰奥多里给出可测性判据',
      '1930：Radon－Nikodym 定理建立',
      '20 世纪中叶：测度论成为概率与分析的基础',
    ],
  },
  chapters: [
    {
      id: 'mt-lebesgue',
      title: '外测度与可测集',
      textbookRef: 'Folland 第 1 章 / 周民强 第 2 章',
      summary: '覆盖定义大小，可加性定义可测',
      goals: ['会算外测度', '掌握卡拉泰奥多里条件', '知道不可测集存在'],
      lessonIds: ['lebesgue-measure'],
      practiceTopics: ['limit-basic'],
      exercises: [
        {
          id: 'mt1-1',
          level: '进阶',
          question: '闭区间 $[0,1]$ 的勒贝格测度是多少？',
          answer: '$1$',
          hint: '区间长度。',
          steps: ['区间可测。', '长度为一。'],
        },
        {
          id: 'mt1-2', level: '基础', question: '闭区间 $[0,1]$ 的勒贝格测度是多少？', answer: '$1$', hint: '区间长度。', steps: ['区间可测。', '长度为一。'],
        },
        {
          id: 'mt1-3', level: '进阶', question: '外测度满足次可加性吗？', answer: '满足', hint: '$m^*(A\\cup B)\\le m^*(A)+m^*(B)$。', steps: ['覆盖并集可用两者覆盖之并。', '因此次可加。'],
        },
      ],
    },
    {
      id: 'mt-extension',
      title: '卡拉泰奥多里扩张',
      textbookRef: 'Folland 第 1 章 / 周民强 第 3 章',
      summary: '从区间长度唯一扩张成测度',
      goals: ['理解预测度', '掌握扩张定理', '知道唯一性条件'],
      lessonIds: ['caratheodory-extension'],
      practiceTopics: ['limit-basic'],
      exercises: [
        {
          id: 'mt2-1',
          level: '竞赛',
          question: '区间长度能否唯一扩张为博雷尔 σ 代数上的测度？',
          answer: '能，且唯一',
          hint: '扩张定理。',
          steps: ['区间构成半环。', '长度是预测度。', '扩张唯一。'],
        },
        {
          id: 'mt2-2', level: '进阶', question: '区间长度作为预测度，其扩张得到的测度唯一吗？', answer: '唯一', hint: '满足有限性条件。', steps: ['区间族生成博雷尔 σ 代数。', '扩张唯一。'],
        },
        {
          id: 'mt2-3', level: '基础', question: '计数测度在单点集上的值是多少？', answer: '$1$', hint: '按定义。', steps: ['单点计数为一。'],
        },
      ],
    },
    {
      id: 'mt-product',
      title: '乘积测度与富比尼',
      textbookRef: 'Folland 第 2 章 / 周民强 第 5 章',
      summary: '重积分化为累次积分',
      goals: ['理解乘积 σ 代数', '会用富比尼换序', '知道可积前提'],
      lessonIds: ['product-measure-fubini'],
      practiceTopics: ['integral-basic'],
      exercises: [
        {
          id: 'mt3-1',
          level: '进阶',
          question: '单位正方形上常数 $1$ 的重积分等于多少？',
          answer: '$1$',
          hint: '面积。',
          steps: ['面积为 1。', '累次积分也是 1。'],
        },
        {
          id: 'mt3-2', level: '基础', question: '单位正方形在乘积测度下的测度是多少？', answer: '$1$', hint: '边长之积。', steps: ['$1\\times1=1$。'],
        },
        {
          id: 'mt3-3', level: '进阶', question: '富比尼定理换序需要什么条件？', answer: '函数可积（或非负）', hint: '绝对可积。', steps: ['非负时用托内利。', '一般情形要求可积。'],
        },
      ],
    },
    {
      id: 'mt-rn',
      title: 'Radon－Nikodym 定理',
      textbookRef: 'Folland 第 3 章 / 周民强 第 6 章',
      summary: '测度的导数与密度',
      goals: ['理解绝对连续', '会求密度', '掌握勒贝格分解'],
      lessonIds: ['radon-nikodym'],
      practiceTopics: ['integral-basic'],
      exercises: [
        {
          id: 'mt4-1',
          level: '竞赛',
          question: '二倍勒贝格测度关于勒贝格测度的密度是多少？',
          answer: '$2$',
          hint: '写成积分形式。',
          steps: ['$\\mu=2\\lambda$。', '密度为常数 2。'],
        },
        {
          id: 'mt4-2', level: '基础', question: '测度 $\\mu=3\\lambda$ 关于 $\\lambda$ 的密度是多少？', answer: '$3$', hint: '常值密度。', steps: ['写成积分形式。', '被积函数为 3。'],
        },
        {
          id: 'mt4-3', level: '进阶', question: '绝对连续的定义是什么？', answer: '$\\nu$ 的零测集也是 $\\mu$ 的零测集', hint: '零测集传递。', steps: ['$\\nu(A)=0\\Rightarrow\\mu(A)=0$。'],
        },
      ],
    },
  ],
  applications: [
    { title: '概率论', scene: '统计', example: '概率密度就是 Radon－Nikodym 导数。' },
    { title: '信号处理', scene: '工程', example: '乘积测度用于多维信号。' },
  ],
  crossings: [
    { subject: '实分析', relation: '测度论是实分析的严格化与推广。', courseId: 'real-analysis' },
    { subject: '概率统计', relation: '概率空间是测度空间，密度就是测度导数。', courseId: 'probability' },
  ],
  toolPath: '/calculus',
};
