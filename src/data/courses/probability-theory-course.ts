import type { Course } from './types';

export const PROBABILITY_THEORY_COURSE: Course = {
  id: 'probability-theory-course', title: '概率论', tagline: '概率空间、随机变量与极限定理',
  textbook: { name: '概率论（教材） + Probability and Measure（Billingsley）', edition: '第 1 版 / 第 3 版' },
  prerequisites: ['高等数学'],
  hours: 36,
  intro: {
    what: '概率论研究随机现象的规律：从概率空间出发，用随机变量刻画取值，用数字特征压缩分布，用极限定理描述大样本行为。',
    objects: ['概率空间', '随机变量与分布', '数字特征', '多维随机变量', '极限定理'],
    history: ['17 世纪：帕斯卡与费马', '1933：柯尔莫哥洛夫公理化', '20 世纪：极限理论完善'],
  },
  chapters: [
    {
      id: 'pr-space', title: '概率空间与古典概型', textbookRef: '教材 第 1 章 / Billingsley 第 1 章', summary: '样本空间与概率',
      goals: ['算古典概率', '用加法公式'],
      lessonIds: ['classical-probability'],
      practiceTopics: ['probability-classical'],
      exercises: [{ id: 'pr1-1', level: '基础', question: '袋中三红两白取两球，一红一白概率？', answer: '3/5', hint: '组合计数。', steps: ['基', '础'] }],
    },
    {
      id: 'pr-bayes', title: '条件概率与贝叶斯', textbookRef: '教材 第 2 章 / Billingsley 第 2 章', summary: '由结果推原因',
      goals: ['用全概率', '用贝叶斯'],
      lessonIds: ['bayes'],
      practiceTopics: ['probability-classical'],
      exercises: [{ id: 'pr2-1', level: '进阶', question: '贝叶斯公式分母是什么？', answer: '全概率', hint: '归一化。', steps: ['进', '阶'] }],
    },
    {
      id: 'pr-random', title: '随机变量与分布', textbookRef: '教材 第 3 章 / Billingsley 第 3 章', summary: '分布函数与常见分布',
      goals: ['识别分布', '求函数分布'],
      lessonIds: ['distribution', 'normal-distribution', 'function-of-rv'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'pr3-1', level: '进阶', question: '正态标准化后服从？', answer: '标准正态', hint: '减均值除标准差。', steps: ['进', '阶'] }],
    },
    {
      id: 'pr-multi', title: '多维随机变量', textbookRef: '教材 第 4 章 / Billingsley 第 4 章', summary: '联合、边缘与协方差',
      goals: ['求边缘', '判独立'],
      lessonIds: ['joint-distribution', 'covariance-correlation'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'pr4-1', level: '进阶', question: '独立变量协方差？', answer: '零', hint: '独立。', steps: ['进', '阶'] }],
    },
    {
      id: 'pr-numeric', title: '数字特征', textbookRef: '教材 第 5 章 / Billingsley 第 5 章', summary: '期望与方差',
      goals: ['算期望方差', '用线性性'],
      lessonIds: ['numeric-characteristics'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'pr5-1', level: '基础', question: 'E(2X+1) 与 E(X) 关系？', answer: '2E(X)+1', hint: '线性。', steps: ['基', '础'] }],
    },
    {
      id: 'pr-limit', title: '极限定理', textbookRef: '教材 第 6 章 / Billingsley 第 6 章', summary: '大数定律与中心极限',
      goals: ['用 CLT', '估样本误差'],
      lessonIds: ['law-of-large-numbers'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'pr6-1', level: '进阶', question: '二项 B(100,1/2) 标准差？', answer: '5', hint: '√(np(1-p))。', steps: ['进', '阶'] }],
    },
  ],
  applications: [{ title: '风险评估', scene: '金融', example: '概率模型。' }, { title: '质量控制', scene: '工业', example: '抽样与极限定理。' }], crossings: [{ subject: '实分析', relation: '概率的公理化用测度论。', courseId: 'real-analysis' }, { subject: '数理统计', relation: '统计以概率论为基础。', courseId: 'math-statistics-course' }], toolPath: '/probability',
};
