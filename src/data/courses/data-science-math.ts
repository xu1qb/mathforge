import type { Course } from './types';

export const DATA_SCIENCE_MATH_COURSE: Course = {
  id: 'data-science-math',
  title: '数据科学中的数学',
  tagline: '统计推断、回归、优化与图模型',
  textbook: { name: '统计学习基础（Hastie 等） + All of Statistics（Wasserman）', edition: '第 2 版 / 第 1 版' },
  prerequisites: ['概率统计', '线性代数'],
  hours: 36,
  intro: {
    what: '数据科学中的数学：统计推断量化不确定性，线性模型做拟合，优化训练模型，图模型描述依赖结构。',
    objects: ['统计推断', '线性回归', '优化方法', '图模型'],
    history: ['19 世纪：最小二乘', '20 世纪：统计推断理论', '21 世纪：大规模优化与图模型'],
  },
  chapters: [
    {
      id: 'ds-inference', title: '统计推断', textbookRef: 'Wasserman 第 6–10 章 / ESL 第 3 章', summary: '样本到总体',
      goals: ['构造区间', '解释 p 值'],
      lessonIds: ['statistical-inference', 'cross-validation', 'bias-variance'],
      practiceTopics: ['random-variable'],
      exercises: [{ id: 'ds1-1', level: '进阶', question: '样本量增大时置信区间如何变化？', answer: '变窄', hint: '标准误按根号缩小。', steps: ['√n 在分母。'] }],
    },
    {
      id: 'ds-linear', title: '线性回归', textbookRef: 'ESL 第 3 章 / Wasserman 第 13 章', summary: '最小二乘的几何',
      goals: ['解正规方程', '理解投影'],
      lessonIds: ['linear-models', 'linear-regression', 'logistic-regression'],
      practiceTopics: ['matrix-op'],
      exercises: [{ id: 'ds2-1', level: '进阶', question: '最小二乘解满足什么正交条件？', answer: '残差与特征正交', hint: '正规方程。', steps: ['Xᵀr=0。'] }],
    },
    {
      id: 'ds-opt', title: '优化方法', textbookRef: 'ESL 第 10 章 / 凸优化 第 1 章', summary: '梯度下降与凸性',
      goals: ['会梯度下降', '判断凸性'],
      lessonIds: ['optimization-methods', 'pca', 'clustering'],
      practiceTopics: ['limit-basic'],
      exercises: [{ id: 'ds3-1', level: '基础', question: '梯度下降沿什么方向更新？', answer: '负梯度', hint: '下降最快。', steps: ['沿负梯度。'] }],
    },
    {
      id: 'ds-graph', title: '图模型', textbookRef: 'ESL 第 17 章 / 概率图模型 第 1 章', summary: '依赖的结构',
      goals: ['写分解', '判断条件独立'],
      lessonIds: ['graph-models'],
      practiceTopics: ['probability-classical'],
      exercises: [{ id: 'ds4-1', level: '进阶', question: '贝叶斯网络的联合分布如何分解？', answer: '条件概率连乘', hint: '按父节点。', steps: ['链式分解。'] }],
    },
  ],
  applications: [{ title: '推荐系统', scene: '互联网', example: '矩阵分解与图模型。' }, { title: '风控', scene: '金融', example: '统计推断与回归。' }],
  crossings: [{ subject: '概率统计', relation: '数据科学以概率统计为理论基础。', courseId: 'probability' }, { subject: '机器学习理论', relation: '统计学习是数据科学的核心方法。', courseId: 'ml-theory' }],
  toolPath: '/data-chart',
};
