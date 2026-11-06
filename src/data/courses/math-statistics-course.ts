import type { Course } from './types';

export const MATH_STATISTICS_COURSE: Course = {
  id: 'math-statistics-course', title: '数理统计', tagline: '抽样分布、估计与假设检验',
  textbook: {
    name: 'Statistical Inference（Casella & Berger） + 概率论与数理统计教程（茆诗松）',
    edition: '第 2 版 / 第 3 版',
  },
  prerequisites: ['概率论'],
  hours: 32,
  intro: {
    what: '数理统计从样本推断总体：抽样分布给出统计量分布，估计给出参数值，检验给出判断。',
    objects: ['样本与统计量', '抽样分布', '参数估计', '假设检验'],
    history: ['19 世纪：高斯与最小二乘', '20 世纪初：费希尔推断', '20 世纪中叶：决策理论'],
  },
  chapters: [
    {
      id: 'ms-sample', title: '样本与统计量', textbookRef: 'Casella-Berger 第 1 章 / Casella 第 7 章', summary: '统计量与自由度',
      goals: ['算统计量', '理解无偏'],
      lessonIds: ['statistics-basics', 'sufficiency'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'ms1-1', level: '进阶', question: '样本方差除以 n-1 的原因？', answer: '无偏', hint: '自由度。', steps: ['进', '阶'] }],
    },
    {
      id: 'ms-dist', title: '抽样分布', textbookRef: 'Casella-Berger 第 2 章 / Casella 第 5 章', summary: '卡方 t F',
      goals: ['识别三大分布', '查分位数'],
      lessonIds: ['sampling-distribution', 'cramer-rao'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'ms2-1', level: '进阶', question: '方差未知时均值标准化服从？', answer: 't 分布', hint: '自由度 n-1。', steps: ['进', '阶'] }],
    },
    {
      id: 'ms-est', title: '参数估计', textbookRef: 'Casella-Berger 第 3 章 / Casella 第 7 章', summary: '点估计与区间',
      goals: ['矩估计', '置信区间'],
      lessonIds: ['parameter-estimation', 'method-of-moments', 'umvue'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'ms3-1', level: '进阶', question: '置信区间半长公式？', answer: 'z 乘标准误', hint: '分位数。', steps: ['进', '阶'] }],
    },
    {
      id: 'ms-mle', title: '最大似然', textbookRef: 'Casella-Berger 第 4 章 / Casella 第 7 章', summary: '让数据最可能',
      goals: ['写似然', '解 MLE'],
      lessonIds: ['maximum-likelihood'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'ms4-1', level: '进阶', question: '指数分布 MLE？', answer: '样本均值倒数', hint: '对数似然求导。', steps: ['进', '阶'] }],
    },
    {
      id: 'ms-test', title: '假设检验', textbookRef: 'Casella-Berger 第 5 章 / Casella 第 8 章', summary: 'p 值与两类错误',
      goals: ['写假设', '解读 p 值'],
      lessonIds: ['hypothesis-testing', 'likelihood-ratio-test', 'power-function'],
      practiceTopics: ['probability-classical'],
      exercises: [{ id: 'ms5-1', level: '基础', question: 'p 值小于显著性水平时？', answer: '拒绝原假设', hint: '判据。', steps: ['基', '础'] }],
    },
  ],
  applications: [{ title: '医学试验', scene: '统计', example: '假设检验判疗效。' }, { title: '市场调研', scene: '商业', example: '区间估计。' }], crossings: [{ subject: '概率论', relation: '统计以概率为基础。', courseId: 'probability-theory-course' }, { subject: '数据科学', relation: '统计推断是数据科学核心。', courseId: 'data-science-math' }], toolPath: '/probability',
};
