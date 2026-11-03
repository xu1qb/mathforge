// EXPORTS: KNOWLEDGE_MAP, type KnowledgeCourse, type KnowledgeLevel

export type KnowledgeLevel = 'foundation' | 'intermediate' | 'advanced';

export interface KnowledgeCourse {
  /** 课程唯一 key */
  key: string;
  /** 课程中文名 */
  name: string;
  /** 英文名（副标题） */
  englishName: string;
  /** 难度层级 */
  level: KnowledgeLevel;
  /** 课程简介 */
  description: string;
  /** 核心知识点 */
  topics: string[];
  /** 对应 MathForge 模块路径（可多个） */
  modulePaths: string[];
  /** 对应模块标签名 */
  moduleLabels: string[];
  /** 学习顺序建议（数字越小越早学） */
  order: number;
  /** 先修课程 key */
  prerequisites: string[];
  /** 图标（lucide icon 名） */
  icon: string;
}

export const KNOWLEDGE_MAP: KnowledgeCourse[] = [
  // ===== 基础课 =====
  {
    key: 'math-analysis',
    name: '数学分析',
    englishName: 'Mathematical Analysis',
    level: 'foundation',
    description: '微积分的严格理论基础，从实数系、极限、连续、微分、积分到级数，建立严谨的分析思维。',
    topics: ['实数系与完备性', '数列极限与函数极限', '连续性与一致连续', '导数与微分', '中值定理与泰勒展开', '不定积分与定积分', '数项级数与函数项级数', '傅里叶级数'],
    modulePaths: ['/calculus', '/fourier'],
    moduleLabels: ['微积分', '傅里叶级数'],
    order: 1,
    prerequisites: [],
    icon: 'FunctionSquare',
  },
  {
    key: 'higher-algebra',
    name: '高等代数',
    englishName: 'Higher Algebra',
    level: 'foundation',
    description: '多项式理论与线性代数的入门，是代数方向的基石课程。',
    topics: ['多项式与因式分解', '行列式', '矩阵运算', '线性方程组', '向量空间', '线性变换', '特征值与特征向量', '二次型'],
    modulePaths: ['/symbolic', '/linear-algebra'],
    moduleLabels: ['符号代数', '线性代数'],
    order: 2,
    prerequisites: [],
    icon: 'Matrix',
  },
  {
    key: 'analytic-geometry',
    name: '解析几何',
    englishName: 'Analytic Geometry',
    level: 'foundation',
    description: '用代数方法研究几何图形，建立数与形的桥梁。',
    topics: ['平面直角坐标系', '直线与二次曲线', '空间直角坐标系', '平面与直线', '二次曲面', '坐标变换'],
    modulePaths: ['/plot-2d', '/plot-3d'],
    moduleLabels: ['二维绘图', '三维曲面'],
    order: 3,
    prerequisites: [],
    icon: 'LineChart',
  },
  {
    key: 'probability-intro',
    name: '概率论与数理统计',
    englishName: 'Probability & Statistics',
    level: 'foundation',
    description: '研究随机现象的数学分支，包含概率基础、随机变量、分布理论与统计推断。',
    topics: ['古典概型与条件概率', '随机变量与分布函数', '数字特征（期望、方差）', '大数定律与中心极限定理', '参数估计', '假设检验', '回归分析'],
    modulePaths: ['/probability'],
    moduleLabels: ['概率统计'],
    order: 4,
    prerequisites: ['math-analysis'],
    icon: 'BarChart3',
  },
  {
    key: 'number-theory-basic',
    name: '初等数论',
    englishName: 'Elementary Number Theory',
    level: 'foundation',
    description: '研究整数性质的数学分支，是密码学和竞赛数学的基础。',
    topics: ['整除与同余', '素数与素因数分解', '最大公约数与最小公倍数', '欧拉函数与欧拉定理', '中国剩余定理', '不定方程', '二次剩余'],
    modulePaths: ['/number-theory'],
    moduleLabels: ['数论基础'],
    order: 5,
    prerequisites: [],
    icon: 'Hash',
  },
  {
    key: 'discrete-math',
    name: '离散数学',
    englishName: 'Discrete Mathematics',
    level: 'foundation',
    description: '计算机科学的数学基础，包含逻辑、集合、图论、组合数学等。',
    topics: ['命题逻辑与谓词逻辑', '集合与关系', '函数与计数', '图论基础', '树与生成树', '组合数学', '布尔代数'],
    modulePaths: ['/discrete'],
    moduleLabels: ['离散数学'],
    order: 6,
    prerequisites: [],
    icon: 'ToggleLeft',
  },

  // ===== 进阶课 =====
  {
    key: 'multivariable-calc',
    name: '多元微积分',
    englishName: 'Multivariable Calculus',
    level: 'intermediate',
    description: '从一元到多元，研究多元函数的极限、偏导、重积分与场论。',
    topics: ['多元函数极限与连续', '偏导数与全微分', '隐函数定理', '重积分', '曲线积分与曲面积分', '梯度、散度、旋度', '格林公式、高斯公式、斯托克斯公式'],
    modulePaths: ['/multivariable'],
    moduleLabels: ['多元微积分'],
    order: 10,
    prerequisites: ['math-analysis', 'analytic-geometry'],
    icon: 'Layers',
  },
  {
    key: 'ordinary-diff-eq',
    name: '常微分方程',
    englishName: 'Ordinary Differential Equations',
    level: 'intermediate',
    description: '研究含有未知函数及其导数的方程，是描述自然规律最重要的数学工具之一。',
    topics: ['一阶微分方程', '可降阶的高阶方程', '线性微分方程', '常系数线性方程组', '定性理论与稳定性', '级数解法'],
    modulePaths: ['/ode'],
    moduleLabels: ['常微分方程'],
    order: 11,
    prerequisites: ['math-analysis'],
    icon: 'GitBranch',
  },
  {
    key: 'complex-analysis',
    name: '复变函数',
    englishName: 'Complex Analysis',
    level: 'intermediate',
    description: '研究复变量函数的分析学，以其优美的理论和广泛的应用著称。',
    topics: ['复数与复平面', '解析函数', '复积分与柯西定理', '级数展开', '留数理论', '保形映射', '欧拉公式与复指数'],
    modulePaths: ['/complex'],
    moduleLabels: ['复变函数'],
    order: 12,
    prerequisites: ['math-analysis'],
    icon: 'PlusSquare',
  },
  {
    key: 'numerical-analysis',
    name: '数值分析',
    englishName: 'Numerical Analysis',
    level: 'intermediate',
    description: '用计算机求解数学问题的近似方法，是科学计算的核心。',
    topics: ['插值与逼近', '数值微分与数值积分', '线性方程组数值解', '非线性方程求根', '常微分方程数值解', '误差分析'],
    modulePaths: ['/numerical'],
    moduleLabels: ['数值分析'],
    order: 13,
    prerequisites: ['math-analysis', 'higher-algebra'],
    icon: 'Target',
  },
  {
    key: 'modern-algebra',
    name: '近世代数（抽象代数）',
    englishName: 'Modern Algebra',
    level: 'intermediate',
    description: '研究代数结构的一般理论，包括群、环、域及其同态。',
    topics: ['群论基础', '环与理想', '域扩张', '模论初步', '伽罗瓦理论简介', '有限群'],
    modulePaths: ['/modern'],
    moduleLabels: ['现代数学'],
    order: 14,
    prerequisites: ['higher-algebra', 'number-theory-basic'],
    icon: 'Sparkles',
  },
  {
    key: 'diff-geometry',
    name: '微分几何',
    englishName: 'Differential Geometry',
    level: 'intermediate',
    description: '用微积分方法研究几何图形的局部与整体性质。',
    topics: ['曲线论', '曲面的第一基本形式', '曲面的第二基本形式', '测地线', '高斯绝妙定理', '曲面的整体性质'],
    modulePaths: ['/diff-geo'],
    moduleLabels: ['微分几何'],
    order: 15,
    prerequisites: ['multivariable-calc', 'analytic-geometry'],
    icon: 'Globe',
  },

  // ===== 高阶课 =====
  {
    key: 'partial-diff-eq',
    name: '偏微分方程',
    englishName: 'Partial Differential Equations',
    level: 'advanced',
    description: '研究含有多元未知函数偏导数的方程，是物理、工程、金融建模的核心工具。',
    topics: ['一阶偏微分方程', '波动方程', '热传导方程', '拉普拉斯方程', '分离变量法', '格林函数方法', 'Sobolev空间与弱解'],
    modulePaths: ['/pde'],
    moduleLabels: ['偏微分方程'],
    order: 20,
    prerequisites: ['multivariable-calc', 'ordinary-diff-eq'],
    icon: 'Waves',
  },
  {
    key: 'real-analysis',
    name: '实变函数',
    englishName: 'Real Analysis',
    level: 'advanced',
    description: '勒贝格积分与测度论，是现代分析学的基础。',
    topics: ['测度论', '可测函数', '勒贝格积分', 'Lp空间', '微分与积分', '乘积测度与富比尼定理'],
    modulePaths: ['/modern'],
    moduleLabels: ['现代数学'],
    order: 21,
    prerequisites: ['math-analysis'],
    icon: 'GraduationCap',
  },
  {
    key: 'functional-analysis',
    name: '泛函分析',
    englishName: 'Functional Analysis',
    level: 'advanced',
    description: '研究无穷维拓扑向量空间及其上的线性算子，是现代数学的综合学科。',
    topics: ['赋范空间与巴拿赫空间', '希尔伯特空间', '有界线性算子', '紧算子', '谱理论', '泛函与对偶空间'],
    modulePaths: ['/modern'],
    moduleLabels: ['现代数学'],
    order: 22,
    prerequisites: ['real-analysis', 'higher-algebra'],
    icon: 'Network',
  },
  {
    key: 'topology',
    name: '点集拓扑',
    englishName: 'General Topology',
    level: 'advanced',
    description: '研究空间在连续变换下保持不变的性质，是现代数学的通用语言。',
    topics: ['拓扑空间', '连续映射', '连通性与紧致性', '可数性与分离性', '度量化定理', '商空间与积空间'],
    modulePaths: ['/modern'],
    moduleLabels: ['现代数学'],
    order: 23,
    prerequisites: ['real-analysis'],
    icon: 'Orbit',
  },
  {
    key: 'practice-training',
    name: '练习训练',
    englishName: 'Practice & Training',
    level: 'intermediate',
    description: '29 大知识点的随机题库练习，即时判分 + 步骤详解，含错题本与学习统计。学完一课后用它巩固。',
    topics: ['初等代数', '三角恒等式', '函数求导', '不定积分', '数列极限', '排列组合', '数论基础', '矩阵运算', '微分方程', '坐标几何', '圆锥曲线', '立体几何', '古典概型', '随机变量', '级数收敛', '函数性质', '不等式', '递推数列'],
    modulePaths: ['/practice'],
    moduleLabels: ['练习训练'],
    order: 23.5,
    prerequisites: ['math-analysis', 'higher-algebra'],
    icon: 'GraduationCap',
  },
  {
    key: 'competition-math',
    name: '数学竞赛',
    englishName: 'Mathematical Olympiad',
    level: 'advanced',
    description: '汇集竞赛数学的经典方法与技巧，适合备考竞赛或深度思维训练。',
    topics: ['不等式方法', '数论进阶', '组合数学', '平面几何', '函数与方程', '数列与递推', '图论方法', '构造与染色'],
    modulePaths: ['/competition', '/practice'],
    moduleLabels: ['数学竞赛', '练习训练'],
    order: 24,
    prerequisites: ['math-analysis', 'higher-algebra', 'number-theory-basic'],
    icon: 'Trophy',
  },
];

/** 按层级分组 */
export const KNOWLEDGE_LEVELS: { level: KnowledgeLevel; label: string; description: string }[] = [
  { level: 'foundation', label: '基础课程', description: '本科低年级必修，数学核心素养奠基' },
  { level: 'intermediate', label: '进阶课程', description: '本科高年级核心，各方向分流起点' },
  { level: 'advanced', label: '高阶课程', description: '研究生与专题，现代数学前沿入口' },
];
