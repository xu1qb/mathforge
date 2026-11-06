import type { Course } from './types';

export const DIFFERENTIAL_GEOMETRY_COURSE: Course = {
  id: 'differential-geometry',
  title: '微分几何',
  tagline: '曲线、曲面与高斯－博内：形状的微积分',
  textbook: {
    name: '微分几何（陈维桓） + Differential Geometry of Curves and Surfaces（do Carmo）',
    edition: '第 2 版（陈维桓） / 第 1 版（do Carmo）',
  },
  prerequisites: ['分析学导论', '线性代数'],
  hours: 40,
  intro: {
    what: '微分几何用微积分研究曲线与曲面：曲率刻画弯曲，基本形式刻画度量，高斯－博内定理把曲率与拓扑连接。',
    objects: ['曲线的曲率与挠率', '曲面的基本形式', '高斯曲率', '测地线', '高斯－博内定理'],
    history: [
      '18 世纪：欧拉与蒙日研究曲线曲面',
      '1827：高斯提出曲面内蕴几何',
      '19 世纪：黎曼推广到高维流形',
      '20 世纪：微分几何成为几何与物理的桥梁',
    ],
  },
  chapters: [
    {
      id: 'dg-curves',
      title: '曲线的曲率与挠率',
      textbookRef: '陈维桓 第 1 章 / do Carmo 第 1 章',
      summary: 'Frenet 标架与两条曲线不变量',
      goals: ['会算曲率挠率', '理解 Frenet 标架', '判断平面曲线'],
      lessonIds: ['curves-frenet'],
      practiceTopics: ['vector-op'],
      exercises: [
        {
          id: 'dg1-1',
          level: '基础',
          question: '单位圆的曲率是多少？',
          answer: '$1$',
          hint: '曲率等于半径倒数。',
          steps: ['半径为一。', '曲率为 1。'],
        },
      ],
    },
    {
      id: 'dg-surfaces',
      title: '曲面的基本形式',
      textbookRef: '陈维桓 第 2 章 / do Carmo 第 2 章',
      summary: '度量与弯曲的两套二次型',
      goals: ['会算第一第二基本形式', '求高斯曲率', '理解高斯绝妙定理'],
      lessonIds: ['surfaces-forms'],
      practiceTopics: ['integral-basic'],
      exercises: [
        {
          id: 'dg2-1',
          level: '进阶',
          question: '半径为 $R$ 的球面高斯曲率是多少？',
          answer: '$1/R^{2}$',
          hint: '半径越小越弯。',
          steps: ['曲率为半径平方的倒数。'],
        },
      ],
    },
    {
      id: 'dg-gauss-bonnet',
      title: '高斯－博内定理',
      textbookRef: '陈维桓 第 3 章 / do Carmo 第 4 章',
      summary: '曲率积分是拓扑不变量',
      goals: ['理解定理内容', '会算曲率积分', '知道欧拉示性数'],
      lessonIds: ['gauss-bonnet'],
      practiceTopics: ['integral-basic'],
      exercises: [
        {
          id: 'dg3-1',
          level: '进阶',
          question: '单位球面的高斯曲率积分是多少？',
          answer: '$4\\pi$',
          hint: '曲率处处为 1，面积 $4\\pi$。',
          steps: ['曲率为 1。', '面积为 $4\\pi$。', '积分为 $4\\pi$。'],
        },
      ],
    },
    {
      id: 'dg-geodesics',
      title: '测地线',
      textbookRef: '陈维桓 第 4 章 / do Carmo 第 3 章',
      summary: '曲面上的最短路径',
      goals: ['理解测地线定义', '会解测地线方程', '知道局部与全局差别'],
      lessonIds: ['geodesics'],
      practiceTopics: ['ode-solving'],
      exercises: [
        {
          id: 'dg4-1',
          level: '进阶',
          question: '球面上的测地线是什么曲线？',
          answer: '大圆',
          hint: '球面有对称性。',
          steps: ['对称性给出大圆。', '大圆是平面与球面交线。'],
        },
      ],
    },
  ],
  applications: [
    { title: '计算机图形学', scene: '动画', example: '曲面细分与法线计算依赖基本形式。' },
    { title: '广义相对论', scene: '物理', example: '时空是弯曲流形，测地线描述自由落体。' },
  ],
  crossings: [
    { subject: '常微分方程', relation: '测地线方程是二阶微分方程组。', courseId: 'analysis' },
    { subject: '线性代数', relation: '基本形式是二次型，主曲率是特征值。', courseId: 'linear-algebra' },
    { subject: '几何与拓扑', relation: '高斯－博内连接曲率与拓扑。', courseId: 'geometry-topology' },
  ],
  toolPath: '/diff-geo',
};
