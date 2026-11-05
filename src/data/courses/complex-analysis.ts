import type { Course } from './types';

export const COMPLEX_ANALYSIS_COURSE: Course = {
  id: 'complex-analysis',
  title: '复分析',
  tagline: '解析函数、柯西定理与留数：复数的力量',
  textbook: {
    name: '复变函数论（钟玉泉） + Complex Analysis（Ahlfors）',
    edition: '第 4 版（钟玉泉） / 第 3 版（Ahlfors）',
  },
  prerequisites: ['分析学导论'],
  hours: 40,
  intro: {
    what: '复分析研究复变量的解析函数。复可导的强条件带来惊人的结论：解析函数无穷次可导，积分由边界决定，留数可以算实积分。',
    objects: ['复数与复平面', '解析函数', '柯西积分定理', '留数定理'],
    history: [
      '18 世纪：欧拉与达朗贝尔研究复函数',
      '1825：柯西建立积分定理',
      '19 世纪：黎曼与魏尔斯特拉斯发展解析函数论',
      '20 世纪：复分析成为分析与几何的桥梁',
    ],
  },
  chapters: [
    {
      id: 'ca-complex',
      title: '复数与复平面',
      textbookRef: '钟玉泉 第 1 章 / Ahlfors 第 1 章',
      summary: '代数与几何两副面孔',
      goals: ['掌握复运算的几何意义', '会用欧拉公式', '会求模与辐角'],
      lessonIds: ['complex-arithmetic'],
      practiceTopics: ['complex-equation'],
      exercises: [
        {
          id: 'ca1-1',
          level: '基础',
          question: '计算 $(1+i)^{2}$。',
          answer: '2i',
          hint: '展开后 $i^{2}=-1$。',
          steps: ['展开得 $1+2i-1$。', '结果为 $2i$。'],
        },
      ],
    },
    {
      id: 'ca-analytic',
      title: '解析函数',
      textbookRef: '钟玉泉 第 2 章 / Ahlfors 第 2 章',
      summary: '柯西－黎曼方程与调和性',
      goals: ['判断解析性', '会用柯西－黎曼方程', '理解调和函数'],
      lessonIds: ['analytic-functions'],
      practiceTopics: ['complex-equation'],
      exercises: [
        {
          id: 'ca2-1',
          level: '进阶',
          question: '$z^{2}$ 的实虚部是否满足柯西－黎曼方程？',
          answer: '满足',
          hint: '实部 $x^{2}-y^{2}$，虚部 $2xy$。',
          steps: ['$u_x=2x=v_y$。', '$u_y=-2y=-v_x$。'],
        },
      ],
    },
    {
      id: 'ca-cauchy',
      title: '柯西积分定理与公式',
      textbookRef: '钟玉泉 第 3 章 / Ahlfors 第 3–4 章',
      summary: '闭曲线积分为零，内部值由边界决定',
      goals: ['会用柯西定理', '会用积分公式', '理解解析函数光滑性'],
      lessonIds: ['cauchy-integral'],
      practiceTopics: ['complex-equation'],
      exercises: [
        {
          id: 'ca3-1',
          level: '进阶',
          question: '沿单位圆逆时针的 $\\oint dz/z$ 等于多少？',
          answer: '2\\pi i',
          hint: '柯西积分公式。',
          steps: ['奇点在原点。', '公式给出 $2\\pi i$。'],
        },
      ],
    },
    {
      id: 'ca-residue',
      title: '留数定理',
      textbookRef: '钟玉泉 第 5 章 / Ahlfors 第 4 章',
      summary: '用奇点算积分，顺带算实积分',
      goals: ['会算留数', '会用留数定理', '会处理实积分'],
      lessonIds: ['residue-theorem'],
      practiceTopics: ['complex-equation'],
      exercises: [
        {
          id: 'ca4-1',
          level: '进阶',
          question: '沿单位圆的 $\\oint dz/z^{2}$ 等于多少？',
          answer: '0',
          hint: '二阶极点留数为零。',
          steps: ['奇点为二阶极点。', '留数为零。', '积分为零。'],
        },
      ],
    },
  ],
  applications: [
    { title: '信号处理', scene: '工程', example: '留数用于计算傅里叶逆变换。' },
    { title: '流体力学', scene: '物理', example: '解析函数刻画平面无旋流。' },
  ],
  crossings: [
    { subject: '分析学导论', relation: '复分析把实分析的结论推广到复平面。', courseId: 'analysis' },
    { subject: '实分析', relation: '柯西定理的严格证明依赖实分析工具。', courseId: 'real-analysis' },
  ],
  toolPath: '/complex',
};
