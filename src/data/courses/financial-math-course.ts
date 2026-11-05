import type { Course } from './types';

export const FINANCIAL_MATH_COURSE: Course = {
  id: 'financial-math-course',
  title: '金融数学',
  tagline: '随机游走、期权定价与风险度量',
  textbook: { name: '金融数学（教材） + Options, Futures and Other Derivatives（Hull）', edition: '第 1 版 / 第 10 版' },
  prerequisites: ['概率统计', '随机过程'],
  hours: 32,
  intro: {
    what: '金融数学用随机过程给资产定价、用无套利给期权定价、用风险度量管理组合。',
    objects: ['随机游走与布朗运动', '期权定价', '风险度量', '利率与折现'],
    history: ['1900：巴舍利耶的随机游走', '1973：Black－Scholes', '1990 年代：风险度量规范化'],
  },
  chapters: [
    {
      id: 'fin-walk',
      title: '随机游走与布朗运动',
      textbookRef: '教材 第 1 章 / Hull 第 12 章',
      summary: '价格的随机模型',
      goals: ['理解布朗运动', '模拟价格'],
      lessonIds: ['random-walk-brownian'],
      practiceTopics: ['random-variable'],
      exercises: [
        {
          id: 'fin1-1', level: '进阶', question: '布朗运动的方差与时间关系？',
          answer: '正比于时间', hint: '标准性质。', steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'fin-option',
      title: '期权定价',
      textbookRef: '教材 第 2 章 / Hull 第 15 章',
      summary: '无套利定价',
      goals: ['理解 BS', '用风险中性'],
      lessonIds: ['option-pricing'],
      practiceTopics: ['random-variable'],
      exercises: [
        {
          id: 'fin2-1', level: '进阶', question: 'BS 模型中期权价格依赖哪些参数？',
          answer: '五个参数', hint: '标的、执行价、期限、波动率、利率。', steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'fin-risk',
      title: '风险度量',
      textbookRef: '教材 第 3 章 / Hull 第 22 章',
      summary: 'VaR 与期望损失',
      goals: ['算 VaR', '理解一致性'],
      lessonIds: ['risk-measures'],
      practiceTopics: ['random-variable'],
      exercises: [
        {
          id: 'fin3-1', level: '进阶', question: 'VaR 满足次可加性吗？',
          answer: '一般不满足', hint: 'VaR 非一致。', steps: ['进', '阶'],
        },
      ],
    },
    {
      id: 'fin-rate',
      title: '利率与折现',
      textbookRef: '教材 第 4 章 / Hull 第 4 章',
      summary: '时间的价格',
      goals: ['算现值', '理解期限结构'],
      lessonIds: ['interest-rate-models'],
      practiceTopics: ['integral-basic'],
      exercises: [
        {
          id: 'fin4-1', level: '进阶', question: '连续复利折现因子形式？',
          answer: '指数衰减', hint: 'e^{-rt}。', steps: ['进', '阶'],
        },
      ],
    },
  ],
  applications: [{ title: '衍生品', scene: '金融', example: '期权与期货定价。' }, { title: '风控', scene: '银行', example: 'VaR 与压力测试。' }],
  crossings: [{ subject: '概率统计', relation: '金融模型基于随机过程。', courseId: 'probability' }, { subject: '随机过程', relation: '布朗运动是核心过程。', courseId: 'probability' }],
  toolPath: '/data-chart',
};
