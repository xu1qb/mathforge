// PRACTICE_TOPICS 与 PracticeTopic 独立成数据模块：
// 它们被首页的知识大陆、年报卡片直接引用，而 math-practice 会静态引入 mathjs，
// 混在一起会让首屏多下载 1.5MB。数据模块保持零依赖。

export interface PracticeTopic {
  key: string;
  label: string;
  icon: string;
  description: string;
  /** 答案输入提示 placeholder */
  answerPlaceholder: string;
  /** 分类：algebra/geometry/analysis/probability/number-theory/equations/application */
  category: string;
  /** 难度：基础 / 进阶 / 竞赛 */
  level: '基础' | '进阶' | '竞赛';
}

export const PRACTICE_TOPICS: PracticeTopic[] = [
  { key: 'algebra-quad', label: '一元二次方程', icon: 'Sigma', description: '随机系数一元二次方程求根', answerPlaceholder: '如：x=2 或 x=2, x=-3', category: 'algebra', level: '基础', },
  { key: 'algebra-factor', label: '因式分解', icon: 'Puzzle', description: '二次三项式因式分解', answerPlaceholder: '如：(x+2)(x-3)', category: 'algebra', level: '基础', },
  { key: 'exp-power', label: '幂指函数', icon: 'TrendingUp', description: '指数/幂函数求值与化简', answerPlaceholder: '如：8 或 e^2', category: 'algebra', level: '基础', },
  { key: 'log-equation', label: '对数方程', icon: 'LogIn', description: '对数方程求解', answerPlaceholder: '如：x=3 或 10', category: 'algebra', level: '基础', },
  { key: 'inequality-solve', label: '不等式求解', icon: 'NotEqual', description: '一元二次、分式、绝对值、指对不等式', answerPlaceholder: '如：x>2 或 -1<x<3', category: 'algebra', level: '基础', },
  { key: 'function-property', label: '函数性质与图像', icon: 'Spline', description: '定义域、值域、奇偶性、单调性、反函数', answerPlaceholder: '如：奇函数 或 y=ln(x)', category: 'algebra', level: '基础', },
  { key: 'sequence-recurrence', label: '递推数列', icon: 'Repeat', description: '一阶/二阶线性递推、分式递推、累加累乘', answerPlaceholder: '如：a_n=2^n 或 5', category: 'algebra', level: '竞赛', },
  { key: 'trig-special', label: '特殊角三角函数', icon: 'Activity', description: 'sin/cos/tan 特殊角精确值', answerPlaceholder: '如：√2/2 或 1/2', category: 'trigonometry', level: '基础', },
  { key: 'trig-identity', label: '三角函数恒等式', icon: 'Activity', description: '特殊角、和差倍半、辅助角、积化和差、和差化积', answerPlaceholder: '如：1/2 或 √3/2', category: 'trigonometry', level: '进阶', },
  { key: 'geometry-basic', label: '平面几何', icon: 'Shapes', description: '海伦公式、正余弦定理、面积计算', answerPlaceholder: '如：6 或 12', category: 'geometry', level: '基础', },
  { key: 'coordinate-geometry', label: '坐标几何', icon: 'MoveHorizontal', description: '距离、中点、直线方程、点线距离、圆方程', answerPlaceholder: '如：5 或 y=2x+1', category: 'geometry', level: '基础', },
  { key: 'conic-sections', label: '圆锥曲线', icon: 'Circle', description: '椭圆、双曲线、抛物线、焦点离心率', answerPlaceholder: '如：2 或 x²/4+y²/3=1', category: 'geometry', level: '进阶', },
  { key: 'solid-geometry', label: '立体几何', icon: 'Box', description: '体积、表面积、球、柱锥台', answerPlaceholder: '如：36π 或 64', category: 'geometry', level: '基础', },
  { key: 'vector-op', label: '向量运算', icon: 'MoveUpRight', description: '向量加减、点积、模长', answerPlaceholder: '如：(1,2) 或 5', category: 'geometry', level: '基础', },
  { key: 'derivative-basic', label: '函数求导', icon: 'FunctionSquare', description: '常见函数（幂/三角/指数/复合）求导', answerPlaceholder: '如：2x 或 cos(x)', category: 'analysis', level: '基础', },
  { key: 'integral-basic', label: '不定积分', icon: 'Integral', description: '幂/三角/指数函数不定积分', answerPlaceholder: '如：x^2 + C 或 sin(x) + C', category: 'analysis', level: '基础', },
  { key: 'limit-basic', label: '极限计算', icon: 'Target', description: '常见极限（0/0 型、∞/∞ 型、重要极限）', answerPlaceholder: '如：1 或 0 或 ∞', category: 'analysis', level: '基础', },
  { key: 'sequence-limit', label: '数列极限', icon: 'TrendingUp', description: '等比极限、裂项、夹逼、重要极限、递推数列', answerPlaceholder: '如：1 或 e 或 ∞', category: 'analysis', level: '进阶', },
  { key: 'series-convergence', label: '级数与收敛', icon: 'ListOrdered', description: '等比级数、p级数、比值判别、幂级数收敛半径', answerPlaceholder: '如：2 或 收敛', category: 'analysis', level: '进阶', },
  { key: 'hyperbolic-func', label: '双曲函数', icon: 'Waves', description: '双曲正弦/余弦、恒等式、反双曲函数', answerPlaceholder: '如：1 或 (e+1/e)/2', category: 'analysis', level: '进阶', },
  { key: 'ode-solving', label: '常微分方程求解', icon: 'GitBranch', description: '可分离变量、一阶线性、齐次、二阶常系数', answerPlaceholder: '如：y=Ce^(x²) 或 y=C1e^x+C2e^(2x)', category: 'equations', level: '进阶', },
  { key: 'fourier-basic', label: '傅里叶基础', icon: 'Activity', description: '周期判断、傅里叶系数、奇偶函数展开', answerPlaceholder: '如：π 或 a0=2', category: 'analysis', level: '进阶', },
  { key: 'probability-classical', label: '古典概型', icon: 'Dices', description: '基本事件计数、互斥对立、条件概率、全概率贝叶斯', answerPlaceholder: '如：1/6 或 0.5', category: 'probability', level: '基础', },
  { key: 'random-variable', label: '随机变量与统计', icon: 'BarChart3', description: '分布列、期望、方差、二项分布、均值标准差', answerPlaceholder: '如：2 或 1.5', category: 'probability', level: '基础', },
  { key: 'nt-gcd', label: '数论基础', icon: 'Hash', description: 'gcd / lcm / 模运算', answerPlaceholder: '如：6 或 24', category: 'number-theory', level: '基础', },
  { key: 'matrix-op', label: '矩阵运算', icon: 'Grid3x3', description: '2×2 矩阵加减、乘法、行列式', answerPlaceholder: '如：5 或 [[1,2],[3,4]]', category: 'algebra', level: '基础', },
  { key: 'complex-equation', label: '复数方程', icon: 'PlusSquare', description: '复数运算与方程求解', answerPlaceholder: '如：1+2i 或 3-i', category: 'algebra', level: '进阶', },
  { key: 'combinatorics-basic', label: '组合数学', icon: 'Puzzle', description: '鸽巢原理、容斥原理、计数基础', answerPlaceholder: '如：10 或 24', category: 'probability', level: '竞赛', },
  { key: 'fusion', label: '综合创新', icon: 'Sparkles', description: '多知识点融合题（两科或三科）：数列×数论×组合、矩阵×递推×极限、三角×复数×数列…', answerPlaceholder: '如：5 或 1/2', category: 'application', level: '竞赛', },
  { key: 'inequality-amgm', label: '均值不等式', icon: 'Trophy', description: 'AM-GM 最值应用题', answerPlaceholder: '如：25 或 10', category: 'algebra', level: '竞赛', },
];
