import type { Course } from './types';

export const MACHINE_LEARNING_THEORY_COURSE: Course = {
  id: 'ml-theory',
  title: '机器学习理论',
  tagline: '泛化、集中不等式、正则化与逼近',
  textbook: { name: 'Understanding Machine Learning（Shalev-Shwartz & Ben-David） + 统计学习基础（Hastie）', edition: '第 1 版 / 第 2 版' },
  prerequisites: ['概率统计', '线性代数'],
  hours: 36,
  intro: {
    what: '机器学习理论解释为什么学习可能：经验风险与泛化的差距由复杂度控制，正则化与架构选择影响这一差距。',
    objects: ['经验风险与泛化', '集中不等式', '偏差方差', '逼近能力'],
    history: ['1960 年代：感知机', '1990 年代：VC 理论与 SVM', '2010 年代：深度学习理论'],
  },
  chapters: [
    {
      id: 'ml-learn', title: '统计学习', textbookRef: 'Shalev-Shwartz 第 2–3 章', summary: '经验风险与泛化',
      goals: ['理解过拟合', '估泛化'],
      lessonIds: ['statistical-learning'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'ml1-1', level: '进阶', question: '训练误差低但测试误差高说明什么？', answer: '过拟合', hint: '记住了训练数据。', steps: ['泛化差。'] }],
    },
    {
      id: 'ml-conc', title: '集中不等式与泛化界', textbookRef: 'Shalev-Shwartz 第 4 章', summary: '偏离期望的指数界',
      goals: ['会霍夫丁', '理解 VC 维'],
      lessonIds: ['concentration-inequalities'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'ml2-1', level: '竞赛', question: '霍夫丁要求样本满足什么？', answer: '独立有界', hint: '两个条件。', steps: ['独立同分布且有界。'] }],
    },
    {
      id: 'ml-reg', title: '正则化与偏差方差', textbookRef: 'Hastie 第 3 章 / Shalev 第 13 章', summary: '复杂度惩罚',
      goals: ['用正则', '做分解'],
      lessonIds: ['regularization'],
      practiceTopics: ['function-property'],
      exercises: [{ id: 'ml3-1', level: '进阶', question: '正则化太强会怎样？', answer: '欠拟合', hint: '模型受限。', steps: ['偏差增大。'] }],
    },
    {
      id: 'ml-approx', title: '神经网络的逼近能力', textbookRef: 'Hastie 第 11 章 / 深度学习理论', summary: '万能逼近与深度优势',
      goals: ['理解逼近', '区分逼近与学习'],
      lessonIds: ['neural-approximation'],
      practiceTopics: ['function-property'],
      exercises: [{ id: 'ml4-1', level: '竞赛', question: '万能逼近保证可训练吗？', answer: '不保证', hint: '只保证存在。', steps: ['优化可能失败。'] }],
    },
  ],
  applications: [{ title: '模型选择', scene: '工程', example: '用泛化界与验证集选模型。' }, { title: 'AI 安全', scene: '前沿', example: '理解模型能力的理论边界。' }],
  crossings: [{ subject: '概率统计', relation: '泛化理论以概率不等式为基础。', courseId: 'probability' }, { subject: '数据科学中的数学', relation: '机器学习理论解释数据科学的经验方法。', courseId: 'data-science-math' }],
  toolPath: '/plot-2d',
};
