import type { Course } from './types';

export const MATHEMATICAL_BIOLOGY_COURSE: Course = {
  id: 'mathematical-biology',
  title: '生物数学',
  tagline: '种群、传染病与酶动力学',
  textbook: {
    name: 'Mathematical Biology（Murray） + Mathematical Models in Biology（Edelstein-Keshet）',
    edition: '第 3 版 / 第 1 版',
  },
  prerequisites: ['常微分方程'],
  hours: 28,
  intro: {
    what: '生物数学用微分方程建模生物过程：种群增长、传染病传播、酶促反应与捕食者-猎物系统。',
    objects: ['种群增长', '传染病模型', '酶动力学', '捕食者-猎物'],
    history: ['18 世纪：马尔萨斯人口模型', '1920 年代：Lotka-Volterra', '20 世纪：SIR 与数学生物学'],
  },
  chapters: [
    {
      id: 'bio-growth',
      title: '种群增长',
      textbookRef: 'Murray 第 1 章 / Murray 第 1 章',
      summary: '指数与逻辑斯蒂',
      goals: ['写增长方程', '找平衡点'],
      lessonIds: ['population-growth', 'logistic-growth', 'competition-model'],
      practiceTopics: ['ode-solving'],
      exercises: [
        {
          id: 'bio1-1',
          level: '进阶',
          question: '逻辑斯蒂模型容量处增长率？',
          answer: '0',
          hint: '容量处不增长。',
          steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'bioepidemic',
      title: '传染病模型',
      textbookRef: 'Murray 第 2 章 / Murray 第 2 章',
      summary: 'SIR 与 R0',
      goals: ['分仓室', '算 R0'],
      lessonIds: ['epidemic-models', 'sir-model'],
      practiceTopics: ['ode-solving'],
      exercises: [
        {
          id: 'bio2-1',
          level: '进阶',
          question: 'R0 小于一时疫情如何发展？',
          answer: '消退',
          hint: '传染不足。',
          steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'bio-enzyme',
      title: '酶动力学',
      textbookRef: 'Murray 第 3 章 / Murray 第 3 章',
      summary: '米氏方程',
      goals: ['拟合参数', '分析抑制'],
      lessonIds: ['enzyme-kinetics', 'oscillators'],
      practiceTopics: ['function-property'],
      exercises: [
        {
          id: 'bio3-1',
          level: '进阶',
          question: '米氏常数的含义？',
          answer: '半饱和浓度',
          hint: '速率一半时。',
          steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'bio-predator',
      title: '捕食者-猎物',
      textbookRef: 'Murray 第 4 章 / Murray 第 4 章',
      summary: 'Lotka-Volterra',
      goals: ['找平衡点', '看周期'],
      lessonIds: ['lotka-volterra', 'reaction-diffusion', 'turing-pattern'],
      practiceTopics: ['ode-solving'],
      exercises: [
        {
          id: 'bio4-1',
          level: '进阶',
          question: '捕食者为零时猎物如何变化？',
          answer: '增长或饱和',
          hint: '无捕食。',
          steps: ['进', '阶'],
        },
      ],
    },
  ],
  applications: [{ title: '公共卫生', scene: '防疫', example: 'SIR 预测疫情。' }, { title: '生态', scene: '环境', example: '种群管理。' }],
  crossings: [{ subject: '常微分方程', relation: '生物模型是 ODE 系统。', courseId: 'ode-solving' }, { subject: '概率统计', relation: '参数估计用于模型拟合。', courseId: 'probability' }],
  toolPath: '/ode',
};
