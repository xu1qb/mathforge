import type { Course } from './types';

export const LINEAR_ALGEBRA_COURSE: Course = {
  id: 'linear-algebra',
  title: '线性代数',
  tagline: '从解方程组到矩阵对角化，一门把「线性结构」抽出来的课',
  textbook: { name: '线性代数', edition: '同济大学第七版' },
  prerequisites: ['初等代数', '平面向量'],
  hours: 48,
  intro: {
    what: '线性代数研究向量、线性变换和它们构成的代数结构。它把「加法」和「数乘」这两个操作抽象出来，凡是满足这两条规则的对象，都能用同一套工具处理。',
    objects: ['向量与向量空间', '矩阵与线性变换', '行列式', '特征值与特征向量', '二次型'],
    history: [
      '17 世纪：行列式最早出现在解线性方程组的消元法里',
      '19 世纪：凯莱与西尔维斯特建立矩阵代数',
      '20 世纪：向量空间公理化，线性代数成为现代数学的基础语言',
      '今天：机器学习、图形学、量子力学的底层工具',
    ],
  },
  chapters: [
    {
      id: 'det-matrix',
      title: '行列式与矩阵',
      textbookRef: '第 1–2 章',
      summary: '先学会算行列式和矩阵，这是后面一切操作的语法',
      goals: [
        '会用性质化简行列式，不再硬展开',
        '掌握矩阵乘法与逆矩阵的判定',
        '理解秩是「有效信息量」',
      ],
      lessonIds: ['det-basics', 'matrix-algebra', 'rank'],
      practiceTopics: ['matrix-op'],
    },
    {
      id: 'linear-systems',
      title: '线性方程组',
      textbookRef: '第 3 章',
      summary: '高斯消元 + 秩判据，一次性看清唯一解、无穷多解、无解',
      goals: [
        '用初等行变换化阶梯形',
        '用秩判断解的情况',
        '会写基础解系与通解',
      ],
      lessonIds: ['gauss-elimination', 'linear-system'],
      practiceTopics: ['matrix-op'],
    },
    {
      id: 'vector-space',
      title: '向量空间',
      textbookRef: '第 4 章',
      summary: '基与维数，是「用几个数描述一个对象」的严格版本',
      goals: [
        '判断线性相关与无关',
        '求极大无关组与秩',
        '理解基、维数、坐标',
      ],
      lessonIds: ['linear-dependence', 'vector-space-basis'],
      practiceTopics: ['vector-op'],
    },
    {
      id: 'eigen',
      title: '特征值与对角化',
      textbookRef: '第 5 章',
      summary: '找到「不被变换改变方向」的那些向量，矩阵就变简单了',
      goals: [
        '求特征值与特征向量',
        '判断能否对角化',
        '理解相似与迹、行列式的关系',
      ],
      lessonIds: ['eigen-basics', 'eigen-diagonalization'],
      practiceTopics: ['matrix-op'],
    },
    {
      id: 'quadratic',
      title: '二次型',
      textbookRef: '第 6 章',
      summary: '把二次多项式写成矩阵形式，正定与否一眼看出',
      goals: [
        '写出二次型的矩阵',
        '用配方法或正交变换化标准形',
        '判定正定性',
      ],
      lessonIds: ['quadratic-form', 'positive-definite'],
      practiceTopics: ['matrix-op'],
    },
  ],
  applications: [
    {
      title: '计算机图形学',
      scene: '三维模型的旋转、缩放、平移',
      example: '每个变换都是一个 4×4 矩阵，连续变换就是矩阵连乘',
    },
    {
      title: '机器学习',
      scene: '特征降维、最小二乘拟合',
      example: '主成分分析就是求协方差矩阵的特征向量',
    },
    {
      title: '结构力学',
      scene: '桁架受力分析',
      example: '节点平衡方程组成线性方程组，解出各杆内力',
    },
    {
      title: '电路网络',
      scene: '基尔霍夫定律求解电流',
      example: '节点电流方程是线性方程组，矩阵形式统一处理',
    },
  ],
  crossings: [
    {
      subject: '概率统计',
      relation: '协方差矩阵、主成分分析、马尔可夫链的转移矩阵都在用线性代数',
    },
    {
      subject: '常微分方程',
      relation: '线性方程组的解由特征值决定稳定性，A 的特征值实部为负则渐近稳定',
    },
    {
      subject: '最优化',
      relation: '最小二乘、约束优化的拉格朗日条件都写成矩阵方程',
    },
    {
      subject: '图论',
      relation: '邻接矩阵、拉普拉斯矩阵把图的结构变成可算的代数对象',
    },
  ],
  toolPath: '/linear-algebra',
};
