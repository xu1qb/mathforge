// EXPORTS: CHEATSHEETS, ICheatsheetItem

export interface ICheatsheetItem {
  syntax: string;
  description: string;
  example?: string;
}

export const CHEATSHEETS: Record<string, { title: string; intro: string; categories: { name: string; items: ICheatsheetItem[] }[] }> = {
  scientific: {
    title: '科学计算器',
    intro: '通用表达式求值，所有表达式统一用 math.js 解析，支持隐式乘法（如 2x），幂用 ^，对数默认自然对数。',
    categories: [
      {
        name: '基础运算',
        items: [
          { syntax: '+ - * / ^', description: '四则与幂运算', example: '2*x^3-1' },
          { syntax: '2x、2(x+1)', description: '隐式乘法（自动识别）', example: '2sin(pi/6)' },
          { syntax: 'pi、e、i', description: '圆周率、自然常数、虚数单位', example: 'pi*r^2' },
        ],
      },
      {
        name: '对数与指数',
        items: [
          { syntax: 'ln(x) / lg(x) / log(x,base)', description: '自然对数/常用对数/以 base 为底', example: 'log(8, 2) = 3' },
          { syntax: 'exp(x) / e^x', description: 'e 的 x 次方', example: 'exp(1) = e' },
          { syntax: '10^x', description: '10 的 x 次方', example: '10^3 = 1000' },
        ],
      },
      {
        name: '三角函数（角度/弧度切换）',
        items: [
          { syntax: 'sin cos tan', description: '正弦、余弦、正切（按当前 DEG/RAD 模式计算）', example: 'sin(30°) = 0.5 (DEG 模式)' },
          { syntax: 'asin acos atan', description: '反正弦、反余弦、反正切', example: 'asin(0.5) = 30° (DEG 模式)' },
          { syntax: 'sinh cosh tanh', description: '双曲正弦、双曲余弦、双曲正切', example: 'sinh(0) = 0' },
          { syntax: 'asinh acosh atanh', description: '反双曲正弦、反双曲余弦、反双曲正切', example: 'asinh(0) = 0' },
          { syntax: 'DEG / RAD 模式', description: '点击 DEG/RAD 按钮切换角度模式，三角函数按模式计算' },
        ],
      },
      {
        name: '取整与随机数',
        items: [
          { syntax: 'floor(x)', description: '向下取整（不大于 x 的最大整数）', example: 'floor(3.7) = 3, floor(-3.7) = -4' },
          { syntax: 'ceil(x)', description: '向上取整（不小于 x 的最小整数）', example: 'ceil(3.2) = 4, ceil(-3.2) = -3' },
          { syntax: 'round(x)', description: '四舍五入取整', example: 'round(3.5) = 4' },
          { syntax: 'round(x, n)', description: '四舍五入到 n 位小数', example: 'round(3.14159, 2) = 3.14' },
          { syntax: 'rand()', description: '生成 0~1 之间的随机数', example: 'rand() → 0.734...' },
          { syntax: 'Fix 0~9', description: '切换显示小数位数（不影响计算精度，仅显示）' },
        ],
      },
      {
        name: '数值微积与级数',
        items: [
          { syntax: 'deriv(f, x, a)', description: '数值导数 f\'(a)（中点法）', example: 'deriv(x^2, x, 3) = 6' },
          { syntax: 'numInt(f, a, b)', description: '数值定积分 ∫_a^b f(x)dx（辛普森法）', example: 'numInt(x^2, 0, 1) = 0.3333' },
          { syntax: 'sum(f, n, start, end)', description: '级数求和 Σ f(n) 从 n=start 到 end', example: 'sum(1/n^2, n, 1, 100) ≈ 1.635' },
          { syntax: 'exp(x) / e^x', description: 'e 的 x 次方', example: 'exp(1) = e ≈ 2.718' },
          { syntax: '10^x', description: '10 的 x 次方', example: '10^3 = 1000' },
        ],
      },
      {
        name: '多项式与方程组求解器',
        items: [
          { syntax: '二次方程 ax²+bx+c=0', description: '输入 a, b, c 求全部根（实根/复根）', example: 'x²-5x+6=0 → x=2, x=3' },
          { syntax: '二元一次方程组', description: 'a₁x+b₁y=c₁; a₂x+b₂y=c₂，克莱姆法则求解', example: '2x+3y=7; x-y=1 → x=2, y=1' },
          { syntax: '判别式 Δ = b²-4ac', description: 'Δ>0 两不等实根, Δ=0 重根, Δ<0 共轭复根' },
        ],
      },
      {
        name: 'DMS 角度与百分数',
        items: [
          { syntax: '十进制度 → 度分秒', description: 'deg→DMS 转换，45.5° = 45°30\'0"' },
          { syntax: '度分秒 → 十进制度', description: 'DMS→deg 转换，30°15\' = 30.25°' },
          { syntax: '百分数计算', description: '50+10% 表示 50 增加 10% = 55；50*20% = 10' },
          { syntax: '科学计数法 EXP', description: '1.23E+4 = 1.23 × 10⁴ = 12300' },
        ],
      },
      {
        name: '复数完整运算',
        items: [
          { syntax: 'a + bi', description: '复数输入，如 3+4i', example: '(3+4i) + (1+2i) = 4+6i' },
          { syntax: 'abs(z)', description: '复数模 |z| = √(a²+b²)', example: 'abs(3+4i) = 5' },
          { syntax: 'arg(z)', description: '复数幅角（弧度）', example: 'arg(1+i) = π/4' },
          { syntax: 'conj(z)', description: '共轭复数', example: 'conj(3+4i) = 3-4i' },
          { syntax: 're(z) / im(z)', description: '实部 / 虚部', example: 're(3+4i) = 3, im(3+4i) = 4' },
          { syntax: 'i^n', description: '虚数单位的幂', example: 'i^2 = -1, i^4 = 1' },
        ],
      },
      {
        name: '其他函数',
        items: [
          { syntax: 'sqrt / cbrt', description: '平方根、立方根', example: 'sqrt(16) = 4' },
          { syntax: 'abs(x)', description: '绝对值 |x|', example: 'abs(-5) = 5' },
          { syntax: 'x!', description: '阶乘', example: '5! = 120' },
          { syntax: 'C(n,k) / nCr(n,k)', description: '组合数 n 选 k', example: 'C(5,2) = 10' },
          { syntax: 'P(n,k) / nPr(n,k)', description: '排列数 n 排 k', example: 'P(5,2) = 20' },
          { syntax: 'mod', description: '取模运算', example: '10 mod 3 = 1' },
          { syntax: '1/x', description: '倒数', example: '1/4 = 0.25' },
          { syntax: 'x^2 / x^3', description: '平方、立方', example: '3^2 = 9' },
        ],
      },
      {
        name: '运算优先级（从高到低）',
        items: [
          { syntax: '括号 ()', description: '最高优先级' },
          { syntax: '函数调用 sin()、ln()', description: '函数优先于运算' },
          { syntax: '^ 幂运算', description: '右结合' },
          { syntax: '* / mod', description: '乘除模' },
          { syntax: '+ -', description: '加减' },
        ],
      },
    ],
  },
  symbolic: {
    title: '符号代数',
    intro: '符号代数运算，支持多项式操作、方程求解、不等式、函数变换等。',
    categories: [
      {
        name: '基本符号运算',
        items: [
          { syntax: 'simplify(expr)', description: '化简表达式', example: 'simplify(x+x) → 2*x' },
          { syntax: 'expand(expr)', description: '展开多项式', example: 'expand((x+1)^2) → x^2+2*x+1' },
          { syntax: 'factor(expr)', description: '因式分解', example: 'factor(x^2-1) → (x-1)*(x+1)' },
          { syntax: 'solve(eqn, var)', description: '解方程，求 var 的值', example: 'solve(x^2-5*x+6=0, x) → [2, 3]' },
          { syntax: 'solve(|x-a|=b)', description: '绝对值方程求解', example: 'solve(|x-3|=5) → x=8 or x=-2' },
        ],
      },
      {
        name: '多项式运算',
        items: [
          { syntax: 'divide(A, B)', description: '多项式除法，返回商式和余式', example: 'divide(x^3-1, x-1) → x²+x+1, 余式 0' },
          { syntax: 'gcdPoly(A, B)', description: '多项式最大公因式（首一）', example: 'gcdPoly(x^2-1, x^3-1) → x-1' },
          { syntax: 'discriminant(ax²+bx+c)', description: '判别式 Δ = b² - 4ac', example: 'discriminant(x^2-5x+6) = 1' },
          { syntax: 'vieta(ax²+bx+c)', description: '韦达定理：根之和 = -b/a, 根之积 = c/a', example: 'vieta(x^2-5x+6) → sum=5, product=6' },
          { syntax: 'binomial(a+b, n)', description: '二项式展开 (a+b)^n', example: 'binomial(x+1, 3) → x³+3x²+3x+1' },
          { syntax: 'remainder(poly, a)', description: '余数定理：计算 P(a) 的值', example: 'remainder(x^2-3x+2, 2) = 0' },
        ],
      },
      {
        name: '分式与插值',
        items: [
          { syntax: 'apart(frac)', description: '部分分式分解（有理函数）', example: 'apart((x+1)/(x²-5x+6)) → -3/(x-2)+4/(x-3)' },
          { syntax: 'lagrange(xs, ys)', description: '拉格朗日插值多项式', example: 'lagrange([0,1,2],[1,2,5]) → x²+1' },
        ],
      },
      {
        name: '不等式与方程组',
        items: [
          { syntax: 'solveIneq(不等式)', description: '解一元多项式不等式，输出区间', example: 'solveIneq(x^2-4>0) → (-∞,-2)∪(2,+∞)' },
          { syntax: 'solveSys({eq1, eq2})', description: '二元一次方程组求解（克莱姆法则）', example: 'solveSys({x+y=3, x-y=1}) → x=2, y=1' },
        ],
      },
      {
        name: '函数变换',
        items: [
          { syntax: 'inverse(f(x))', description: '求反函数（一次函数有闭式）', example: 'inverse(2x+1) → (x-1)/2' },
          { syntax: 'compose(f, g, x)', description: '函数复合 f(g(x))', example: 'compose(x², sin(x), x) → sin²(x)' },
        ],
      },
      {
        name: '复数代数',
        items: [
          { syntax: 'i^n', description: '虚数单位 i 的幂运算', example: 'i^2 = -1, i^3 = -i, i^4 = 1' },
          { syntax: 'conj(z)', description: '复数共轭', example: 'conj(3+4i) = 3-4i' },
          { syntax: 'abs(z) / |z|', description: '复数模', example: 'abs(3+4i) = 5' },
          { syntax: 'arg(z)', description: '复数幅角', example: 'arg(1+i) = π/4' },
        ],
      },
      {
        name: '数论函数',
        items: [
          { syntax: 'gcd(a, b)', description: '最大公约数', example: 'gcd(12, 18) = 6' },
          { syntax: 'lcm(a, b)', description: '最小公倍数', example: 'lcm(4, 6) = 12' },
        ],
      },
      {
        name: '变量与方程表示',
        items: [
          { syntax: 'x, y, z...', description: '变量使用字母表示', example: 'x^2 + y^2' },
          { syntax: 'expr = value', description: '方程使用等号表示', example: 'x^2 - 4 = 0' },
          { syntax: '多变量', description: '支持任意字母作为变量', example: 'a*x^2 + b*x + c' },
        ],
      },
    ],
  },
  calculus: {
    title: '微积分',
    intro: '单变量微积分运算，覆盖华东师大《数学分析》核心章节：导数、积分、极限、级数、泰勒展开、极值、凹凸性、反常积分等。',
    categories: [
      {
        name: '导数（第三章·导数与微分）',
        items: [
          { syntax: 'diff(f, x)', description: '一阶导数 f\'(x)（《数学分析》§3.1）', example: 'diff(x^3, x) → 3*x^2' },
          { syntax: 'diff(f, x, n)', description: 'n 阶导数 f⁽ⁿ⁾(x)（§3.4 高阶导数）', example: 'diff(sin(x), x, 4) → sin(x)' },
          { syntax: 'implicitDiff(F(x,y)=0, y, x)', description: '隐函数求导 dy/dx = -Fx/Fy（§3.2 隐函数导数）', example: 'implicitDiff(x²+y²-1, y, x) → -x/y' },
          { syntax: 'paramDiff(x(t), y(t), t)', description: '参数方程求导 dy/dx = y\'(t)/x\'(t)（§3.2 参数方程导数）', example: 'paramDiff(t², t³, t) → 3t/2' },
          { syntax: 'logDiff(f, x)', description: '对数求导法（幂指函数等），结果为 f(x)·(ln f(x))\'（§3.3 例）', example: 'logDiff(x^x, x) → x^x·(ln x+1)' },
        ],
      },
      {
        name: '导数的应用（第六章·导数应用）',
        items: [
          { syntax: 'extrema(f, x, a, b)', description: '求区间 [a,b] 内的极大值/极小值点（§6.3 极值）', example: 'extrema(x³-3x, x, -3, 3) → 极大 -1, 极小 1' },
          { syntax: 'concavity(f, x, a, b)', description: '凹凸区间与拐点（§6.4 凹凸性与拐点）', example: 'concavity(x³, x, -3, 3) → 拐点 x=0' },
          { syntax: 'asymptotes(f, x)', description: '渐近线：水平、垂直、斜渐近线（§6.5 函数图像）', example: 'asymptotes(1/x, x) → 水平 y=0, 垂直 x=0' },
          { syntax: 'lhopital(f, g, x, a)', description: '洛必达法则，0/0 或 ∞/∞ 型（§6.2 洛必达法则）', example: 'lhopital(sin(x), x, x, 0) = 1' },
        ],
      },
      {
        name: '不定积分（第八章·不定积分）',
        items: [
          { syntax: 'integral(f, x)', description: '不定积分 ∫f(x)dx（符号积分，多项式与初等函数）', example: 'integral(x^2, x) → x^3/3' },
          { syntax: 'verifyAntiderivative(F, f, x)', description: '验证 F(x) 是否为 f(x) 的原函数（F\'(x)=f(x)?）', example: 'verifyAntiderivative(sin(x), cos(x), x) → true' },
        ],
      },
      {
        name: '定积分（第九章·定积分）',
        items: [
          { syntax: 'integral(f, x, a, b)', description: '定积分 ∫_a^b f(x)dx（数值/符号）（§9.1 定积分概念）', example: 'integral(x^2, x, 0, 1) = 1/3' },
          { syntax: 'numInt(f, a, b)', description: '数值积分（辛普森法）', example: 'numInt(x^2, 0, 1) ≈ 0.3333' },
          { syntax: 'area(f, g, x, a, b)', description: '两曲线围成的面积 = ∫|f-g|dx（§9.4 面积）', example: 'area(x, x², x, 0, 1) = 1/6' },
          { syntax: 'volume(f, x, a, b)', description: '绕 x 轴旋转体体积 V = π∫f²dx（§9.4 体积）', example: 'volume(x, x, 0, 1) = π/3' },
          { syntax: 'arcLength(f, x, a, b)', description: '弧长 = ∫√(1+f\'²)dx（§9.4 弧长）', example: 'arcLength(x, x, 0, 1) = √2' },
          { syntax: 'improperInt(f, x, a, inf)', description: '反常积分（无穷限）（§11.2 无穷限反常积分）', example: 'improperInt(1/x², x, 1, inf) = 1' },
        ],
      },
      {
        name: '极限与级数',
        items: [
          { syntax: 'limit(f, x, a)', description: 'x→a 时的极限（数值方法）', example: 'limit(sin(x)/x, x, 0) = 1' },
          { syntax: 'limit(f, x, inf)', description: 'x→∞ 时的极限', example: 'limit(1/x, x, inf) = 0' },
          { syntax: 'sum(expr, var, a, b)', description: '级数求和（数值）', example: 'sum(1/n², n, 1, 1000) ≈ π²/6' },
          { syntax: 'convergenceRadius(aₙ)', description: '幂级数收敛半径 R = 1/lim|aₙ₊₁/aₙ|（比值法）', example: 'convergenceRadius(1/n!) = ∞' },
        ],
      },
      {
        name: '泰勒展开（§6.3 / §10.3）',
        items: [
          { syntax: 'taylor(f, x, x0, n)', description: '在 x₀ 处的 n 阶泰勒多项式', example: 'taylor(exp(x), x, 0, 4) → 1+x+x²/2+x³/6+x⁴/24' },
        ],
      },
    ],
  },
  'linear-algebra': {
    title: '线性代数',
    intro: '矩阵运算与线性代数分析。矩阵输入格式：每行输入一行元素，空格分隔列（例如 \n1 2 3\n4 5 6 表示 2×3 矩阵）。兼容旧格式 [1,2;3,4]。',
    categories: [
      {
        name: '矩阵构造',
        items: [
          { syntax: '[a,b;c,d]', description: '2×2 矩阵', example: '[1,2;3,4]' },
          { syntax: 'zeros(n,m)', description: 'n×m 零矩阵', example: 'zeros(3,3)' },
          { syntax: 'identity(n)', description: 'n 阶单位矩阵', example: 'identity(3)' },
          { syntax: 'ones(n,m)', description: '全 1 矩阵', example: 'ones(2,3)' },
        ],
      },
      {
        name: '矩阵运算',
        items: [
          { syntax: 'A + B / A - B', description: '矩阵加法、减法（同型矩阵）', example: '对应元素相加减' },
          { syntax: 'A * B', description: '矩阵乘法（A 列数 = B 行数）', example: 'm×n 乘 n×p = m×p' },
          { syntax: 'k · A', description: '标量乘法（数乘）', example: '每个元素乘 k' },
          { syntax: 'A^n', description: '矩阵幂（方阵自乘 n 次）', example: 'A³ = A · A · A' },
        ],
      },
      {
        name: '矩阵分析函数',
        items: [
          { syntax: 'det(A)', description: '行列式', example: 'det([1,2;3,4]) = -2' },
          { syntax: 'inv(A)', description: '逆矩阵', example: 'inv([1,2;3,4])' },
          { syntax: 'transpose(A) / A\'', description: '转置', example: 'transpose([1,2;3,4])' },
          { syntax: 'rank(A)', description: '秩', example: 'rank([1,2;2,4]) = 1' },
          { syntax: 'trace(A)', description: '迹（对角线元素和）', example: 'trace([1,2;3,4]) = 5' },
          { syntax: 'eigs(A)', description: '特征值与特征向量', example: 'eigs([2,1;1,2])' },
        ],
      },
      {
        name: '线性方程组',
        items: [
          { syntax: '高斯消元 Ax=b', description: '解线性方程组，输出唯一解/无解/无穷解', example: 'A=[1,2;3,4], b=[5,11] → x=[1,2]' },
          { syntax: '秩判定', description: 'r(A)=r(A|b)<n → 无穷解；r(A)≠r(A|b) → 无解', example: '秩分析' },
        ],
      },
      {
        name: '向量运算',
        items: [
          { syntax: 'a·b (dot)', description: '内积（数量积）', example: '[1,2,3]·[4,5,6] = 32' },
          { syntax: 'a×b (cross)', description: '三维向量叉积（向量积）', example: '[1,0,0]×[0,1,0] = [0,0,1]' },
          { syntax: 'norm(v, p)', description: 'p-范数；p=2 为欧氏范数', example: 'norm([3,4], 2) = 5' },
        ],
      },
      {
        name: '矩阵初等变换',
        items: [
          { syntax: '行阶梯形 (REF)', description: '主元列下方全为 0，主元 = 1', example: '用于求秩、判定线性相关' },
          { syntax: '行最简形 (RREF)', description: '主元上下全为 0，主元 = 1', example: '高斯-约旦消元结果' },
          { syntax: '秩 rank(A)', description: '行阶梯形中非零行个数', example: '行秩 = 列秩 = 秩' },
        ],
      },
      {
        name: '向量组与相关性',
        items: [
          { syntax: '线性相关性', description: '秩 < 向量个数 → 线性相关', example: '[1,2],[2,4] → 线性相关' },
          { syntax: '极大线性无关组', description: '向量组秩 = 极大无关组向量数', example: '主元列对应原向量组中的向量' },
          { syntax: '向量夹角', description: 'cos θ = a·b / (‖a‖·‖b‖)', example: 'θ = arccos(a·b / ‖a‖‖b‖)' },
        ],
      },
      {
        name: '矩阵分解',
        items: [
          { syntax: 'LU 分解', description: 'A = L·U（Doolittle），L 单位下三角', example: '[2,1;4,3] → L=[1,0;2,1], U=[2,1;0,1]' },
          { syntax: 'QR 分解', description: 'A = Q·R，Q 正交矩阵，R 上三角', example: 'Gram-Schmidt 正交化得到 Q' },
          { syntax: '伴随矩阵 adj(A)', description: 'A·adj(A) = |A|·I', example: '伴随矩阵 = 代数余子式矩阵的转置' },
        ],
      },
      {
        name: '二次型与正定性',
        items: [
          { syntax: '顺序主子式', description: '全部 > 0 → 正定；奇数阶负/偶数阶正 → 负定', example: '正定矩阵所有特征值 > 0' },
          { syntax: '二次型标准形', description: '经正交变换化标准形，系数为特征值', example: 'f = λ₁y₁² + ... + λₙyₙ²' },
          { syntax: '惯性定律', description: '正/负惯性指数是矩阵的不变量', example: '正惯性指数 = 正特征值个数' },
        ],
      },
      {
        name: '相似对角化',
        items: [
          { syntax: '可对角化判定', description: 'n 个线性无关特征向量 / 对称矩阵必可对角化', example: '实对称矩阵正交相似于对角矩阵' },
          { syntax: '代数/几何重数', description: '几何重数 ≤ 代数重数；都相等则可对角化', example: '特征值 λ 的几何重数 = n - r(A-λI)' },
        ],
      },
      {
        name: '向量组',
        items: [
          { syntax: '施密特正交化', description: 'Gram-Schmidt 把向量组变成正交单位组', example: '向量组 → e₁, e₂, ..., e_k' },
          { syntax: '线性相关性', description: '秩 < 向量个数 → 线性相关', example: '[1,2],[2,4] → 线性相关' },
          { syntax: '极大无关组', description: '含向量个数 = 向量组的秩', example: '秩 r → 极大无关组含 r 个向量' },
        ],
      },
      {
        name: '最小二乘与正交变换',
        items: [
          { syntax: '最小二乘解', description: 'x = (AᵀA)⁻¹Aᵀb，残差平方和最小', example: '超定方程组近似解' },
          { syntax: '正交变换判定', description: 'Aᵀ·A = I ⇔ A 是正交矩阵', example: '旋转矩阵、反射矩阵' },
          { syntax: '基变换/过渡矩阵', description: 'B = A · P，P 为 A 到 B 的过渡矩阵', example: '坐标变换公式：[x]A = P·[x]B' },
        ],
      },
    ],
  },
  probability: {
    title: '概率统计',
    intro: '描述性统计计算与常用概率分布函数。数据列表用逗号或空格分隔。',
    categories: [
      {
        name: '描述性统计',
        items: [
          { syntax: 'mean(data)', description: '算术平均值', example: 'mean([1,2,3,4,5]) = 3' },
          { syntax: 'median(data)', description: '中位数', example: 'median([3,1,2]) = 2' },
          { syntax: 'mode(data)', description: '众数', example: 'mode([1,2,2,3]) = 2' },
          { syntax: 'variance(data)', description: '总体方差', example: 'variance([1,2,3,4,5]) = 2' },
          { syntax: 'std(data)', description: '总体标准差', example: 'std([1,2,3,4,5]) ≈ 1.414' },
        ],
      },
      {
        name: '排列组合',
        items: [
          { syntax: 'nPr(n, k)', description: '排列数 P(n,k) = n!/(n-k)!', example: 'nPr(5,2) = 20' },
          { syntax: 'nCr(n, k)', description: '组合数 C(n,k) = n!/(k!(n-k)!)', example: 'nCr(5,2) = 10' },
        ],
      },
      {
        name: '离散分布',
        items: [
          { syntax: 'binom(k, n, p)', description: '二项分布 P(X=k)', example: 'binom(2, 5, 0.5) = 5/16' },
          { syntax: 'poisson(k, λ)', description: '泊松分布 P(X=k)', example: 'poisson(2, 3) = 9e^(-3)/2' },
          { syntax: 'geometric(k, p)', description: '几何分布 P(X=k)，首次成功在第 k 次', example: 'geometric(3, 0.4) = 0.144' },
        ],
      },
      {
        name: '连续分布',
        items: [
          { syntax: 'normal(x, μ, σ)', description: '正态分布概率密度', example: 'normal(0, 0, 1) = 1/√(2π)' },
          { syntax: 'uniform(x, a, b)', description: '均匀分布 U[a,b]', example: 'uniform(1, 0, 4) = 0.25' },
          { syntax: 'exponential(x, λ)', description: '指数分布 Exp(λ)，无记忆性', example: 'exponential(1, 0.5) = 0.5·e^(-0.5)' },
        ],
      },
      {
        name: '三大抽样分布',
        items: [
          { syntax: 'χ²(n)', description: '卡方分布：n 个独立标准正态平方和', example: 'χ²(5) 自由度为 5' },
          { syntax: 't(n)', description: 't 分布（学生分布），类似正态但尾更厚', example: 't(10) 自由度为 10' },
          { syntax: 'F(n1, n2)', description: 'F 分布：两个独立卡方除以自由度之比', example: 'F(5, 10) 分子5分母10' },
        ],
      },
      {
        name: '条件概率与贝叶斯',
        items: [
          { syntax: 'P(A|B) = P(AB)/P(B)', description: '条件概率公式', example: 'P(AB)=0.2, P(B)=0.5 → P(A|B)=0.4' },
          { syntax: 'P(A|B) = P(B|A)P(A)/P(B)', description: '贝叶斯公式（后验概率）', example: '疾病检测：假阳性 5%, 真阳性 99%' },
          { syntax: 'P(B) = P(B|A)P(A) + P(B|¬A)P(¬A)', description: '全概率公式', example: '用于贝叶斯的分母展开' },
        ],
      },
      {
        name: '期望与方差',
        items: [
          { syntax: 'E(X) = Σxᵢpᵢ', description: '离散型期望', example: 'X: [1,2,3], P: [0.2,0.5,0.3] → E=2.1' },
          { syntax: 'Var(X) = E(X²) - [E(X)]²', description: '方差计算式', example: 'Var = Σxᵢ²pᵢ - (Σxᵢpᵢ)²' },
          { syntax: 'E(aX+bY) = aE(X)+bE(Y)', description: '期望的线性性', example: '不要求独立' },
        ],
      },
      {
        name: '协方差与相关',
        items: [
          { syntax: 'Cov(X,Y) = E(XY)-E(X)E(Y)', description: '协方差', example: '衡量两变量共同变化程度' },
          { syntax: 'ρ = Cov / (σ_X·σ_Y)', description: '皮尔逊相关系数 ∈ [-1, 1]', example: '|ρ| > 0.8 为强相关' },
          { syntax: 'ŷ = kx + b (线性回归)', description: '最小二乘法', example: 'k = Cov/Var(x), b = ȳ - kx̄' },
        ],
      },
      {
        name: '参数估计与假设检验',
        items: [
          { syntax: '置信区间', description: 'μ 的 95% CI：x̄ ± z·σ/√n', example: '大样本用 Z，小样本用 t 分布' },
          { syntax: 'Z 检验', description: 'σ 已知时检验 H₀: μ = μ₀', example: 'Z = (x̄ - μ₀)/(σ/√n)' },
          { syntax: 't 检验', description: 'σ 未知用样本 s 代替', example: 't = (x̄ - μ₀)/(s/√n), df = n-1' },
        ],
      },
      {
        name: '概率不等式与极限',
        items: [
          { syntax: '切比雪夫不等式', description: 'P(|X-μ|≥kσ) ≤ 1/k²', example: 'k=2 时，至少 75% 数据落在 ±2σ' },
          { syntax: '大数定律', description: '样本均值依概率收敛于期望', example: 'n→∞ 时，频率 → 概率' },
          { syntax: '中心极限定理', description: '独立同分布和 → 正态分布', example: '二项分布 n 大时近似正态' },
        ],
      },
      {
        name: '古典概型',
        items: [
          { syntax: 'P(A) = |A| / |Ω|', description: '等可能概型', example: '掷骰子得偶数：3/6 = 1/2' },
          { syntax: '加法原理 / 乘法原理', description: '分类用加，分步用乘', example: '组合计数的基础' },
        ],
      },
    ],
  },
  'number-theory': {
    title: '数论基础',
    intro: '数论相关计算：素数判断、最大公约数、质因数分解、模运算、欧拉函数等。',
    categories: [
      {
        name: '素数与因数',
        items: [
          { syntax: 'isPrime(n)', description: '判断正整数是否为素数', example: 'isPrime(17) = true' },
          { syntax: 'factorize(n)', description: '质因数分解', example: 'factorize(12) → 2² × 3' },
        ],
      },
      {
        name: '公约数与公倍数',
        items: [
          { syntax: 'gcd(a, b)', description: '最大公约数', example: 'gcd(24, 36) = 12' },
          { syntax: 'lcm(a, b)', description: '最小公倍数', example: 'lcm(4, 6) = 12' },
        ],
      },
      {
        name: '模运算',
        items: [
          { syntax: 'mod(a, m)', description: 'a mod m 取模', example: 'mod(17, 5) = 2' },
          { syntax: 'powMod(a, b, m)', description: 'a^b mod m 模幂', example: 'powMod(2, 10, 1000) = 24' },
        ],
      },
      {
        name: '欧拉函数',
        items: [
          { syntax: 'phi(n)', description: '欧拉函数 φ(n)，计算小于 n 且与 n 互素的正整数个数', example: 'phi(12) = 4' },
        ],
      },
      {
        name: '同余方程',
        items: [
          { syntax: 'ax ≡ b (mod m)', description: '一次同余方程，有解当且仅当 gcd(a,m)|b', example: '3x ≡ 2 (mod 7) → x ≡ 3 (mod 7)' },
          { syntax: '中国剩余定理 CRT', description: 'x ≡ aᵢ (mod mᵢ)，mᵢ 两两互素时有唯一解模 M=Πmᵢ', example: 'x≡2(3), x≡3(5), x≡2(7) → x=23 (mod 105)' },
          { syntax: '模逆元 a⁻¹', description: 'a·a⁻¹ ≡ 1 (mod m)，存在当且仅当 gcd(a,m)=1', example: '3⁻¹ mod 7 = 5' },
        ],
      },
      {
        name: '扩展欧几里得',
        items: [
          { syntax: 'extgcd(a,b)', description: '返回 (gcd, x, y) 满足 ax + by = gcd', example: 'extgcd(35,15) = (5, -1, 3)' },
          { syntax: '贝祖等式', description: 'ax + by = gcd(a,b) 必有整数解', example: 'gcd(a,b) 是形如 ax+by 的最小正整数' },
          { syntax: '不定方程 ax+by=c', description: '有解当且仅当 gcd(a,b)|c', example: '通解由特解 + 齐次解组成' },
        ],
      },
      {
        name: '经典定理',
        items: [
          { syntax: '费马小定理', description: 'p 素数，a^(p-1) ≡ 1 (mod p)，gcd(a,p)=1', example: '2^6 mod 7 = 1' },
          { syntax: '威尔逊定理', description: 'p 素数 ⟺ (p-1)! ≡ -1 (mod p)', example: '6! = 720 ≡ -1 (mod 7)' },
          { syntax: '欧拉定理', description: 'gcd(a,m)=1 → a^φ(m) ≡ 1 (mod m)', example: '费马小定理是欧拉定理的特例' },
        ],
      },
      {
        name: '二次剩余',
        items: [
          { syntax: '勒让德符号 (a/p)', description: '=1 二次剩余，=-1 非剩余，=0 若 p|a', example: '欧拉判别法：a^((p-1)/2) mod p' },
          { syntax: '二次互反律', description: '(p/q)(q/p)=(-1)^((p-1)(q-1)/4)', example: '用于快速计算勒让德符号' },
        ],
      },
      {
        name: '数论函数',
        items: [
          { syntax: '莫比乌斯函数 μ(n)', description: '有平方因子为0，k个不同素因子为 (-1)^k', example: 'μ(30) = μ(2·3·5) = (-1)^3 = -1' },
          { syntax: '除数函数 d(n)', description: '正约数个数', example: 'd(12) = 6 (1,2,3,4,6,12)' },
          { syntax: 'σ(n) 约数和', description: '所有正约数之和', example: 'σ(6) = 1+2+3+6 = 12' },
        ],
      },
      {
        name: '连分数与逼近',
        items: [
          { syntax: '连分数展开', description: 'p/q = [a₀; a₁, a₂, ..., aₙ]', example: '67/29 = [2; 4, 3, 2]' },
          { syntax: '渐近分数', description: '连分数截断得到最佳有理逼近', example: 'π 的渐近分数：3, 22/7, 333/106, 355/113...' },
        ],
      },
      {
        name: '素数筛法',
        items: [
          { syntax: '埃拉托斯特尼筛', description: 'O(n log log n) 求 [1,n] 所有素数', example: '素数定理：π(n) ~ n / ln n' },
          { syntax: '区间筛', description: '求 [a,b] 内的素数，b-a 可小但 b 很大', example: '用小素数筛区间合数' },
        ],
      },
      {
        name: '数位',
        items: [
          { syntax: '位数', description: '10 进制位数 = ⌊log₁₀ n⌋ + 1', example: 'digitCount(12345) = 5' },
          { syntax: '数位和', description: '各位数字相加', example: 'digitSum(12345) = 15' },
        ],
      },
    ],
  },
  'plot-2d': {
    title: '二维绘图',
    intro: '数学函数可视化，支持12种模式：显式函数、参数方程、极坐标、隐函数、二次曲线识别、切线、渐近线、曲线间面积、反函数、2×2子图对比、参数动画、玫瑰线。',
    categories: [
      {
        name: '显式函数 y=f(x)',
        items: [
          { syntax: 'sin(x)', description: '输入 y = f(x) 右侧表达式', example: 'x^2 - 2*x + 1' },
          { syntax: '多函数叠加', description: '点击添加函数，多条曲线同屏', example: 'sin(x) 与 cos(x) 同时绘制' },
          { syntax: 'x 范围', description: '设置自变量的显示区间', example: 'x ∈ [-10, 10]' },
        ],
      },
      {
        name: '参数方程',
        items: [
          { syntax: 'x = x(t), y = y(t)', description: '分别输入 x(t) 和 y(t)', example: '圆: x=cos(t), y=sin(t)' },
          { syntax: '摆线', description: 'x = t - sin(t), y = 1 - cos(t)', example: '摆线（旋轮线）' },
          { syntax: '星形线', description: 'x = cos³(t), y = sin³(t)', example: '内摆线四尖点' },
        ],
      },
      {
        name: '极坐标 r(θ)',
        items: [
          { syntax: 'r = f(t)', description: '变量用 t 代表 θ', example: 'r = cos(3*t) 三瓣玫瑰线' },
          { syntax: '玫瑰线 r = sin(nθ)', description: 'n 为整数时是玫瑰线；n 瓣数：奇同偶倍', example: 'r = sin(4*t) 八瓣玫瑰' },
          { syntax: '心形线', description: 'r = a(1 + cosθ)', example: 'r = 1 + cos(t)' },
          { syntax: '阿基米德螺线', description: 'r = aθ', example: 'r = t' },
          { syntax: '双纽线', description: 'r² = a²cos(2θ)', example: 'r = sqrt(cos(2*t))' },
        ],
      },
      {
        name: '隐函数曲线',
        items: [
          { syntax: 'f(x, y) = 0', description: '输入左侧表达式，绘制零等值线', example: 'x^2 + y^2 - 4（圆）' },
          { syntax: '椭圆', description: 'x²/a² + y²/b² - 1 = 0', example: 'x^2/4 + y^2/9 - 1' },
          { syntax: '双曲线', description: 'x²/a² - y²/b² - 1 = 0', example: 'x^2 - y^2 - 1' },
          { syntax: 'marching squares', description: '用网格扫描法找曲线点，精度取决于分辨率', example: '默认 250×250 网格' },
        ],
      },
      {
        name: '二次曲线识别',
        items: [
          { syntax: '一般方程 Ax²+Bxy+Cy²+Dx+Ey+F=0', description: '输入6个系数，自动识别类型', example: 'A=1,B=0,C=4,F=-4 → 椭圆' },
          { syntax: '判别式 I₂ = B²-4AC', description: 'I₂<0 椭圆型，I₂=0 抛物型，I₂>0 双曲型', example: '判断二次曲线类型的不变量' },
          { syntax: '不变量 I₁, I₂, I₃', description: 'I₁=A+C, I₂=B²-4AC, I₃=三阶行列式', example: '用于求标准形参数' },
          { syntax: '中心坐标', description: '解 2Ax+By+D=0, Bx+2Cy+E=0 得中心', example: '中心二次曲线才有对称中心' },
        ],
      },
      {
        name: '切线与渐近线',
        items: [
          { syntax: '切线方程', description: 'y = f(x₀) + f’(x₀)(x - x₀)', example: 'sin(x) 在 x=1 处切线' },
          { syntax: '垂直渐近线', description: '分母为零且分子不为零的点', example: 'f(x)=1/(x²-1), 渐近线 x=±1' },
          { syntax: '水平渐近线', description: 'lim_{x→±∞} f(x) = c（常数）', example: 'f(x)=e^-x², 渐近线 y=0' },
          { syntax: '斜渐近线', description: 'y = ax + b，a = lim f(x)/x, b = lim (f(x)-ax)', example: 'f(x) = x + 1/x, 渐近线 y=x' },
        ],
      },
      {
        name: '积分与反函数',
        items: [
          { syntax: '曲线间面积', description: 'S = ∫ₐᵇ |f(x) - g(x)| dx，数值梯形法', example: 'sin(x) 与 cos(x) 在 [0,π] 的面积' },
          { syntax: '反函数图像', description: '将 y=f(x) 关于 y=x 对称反射得到 f⁻¹(x)', example: 'x² 与 √x 互为反函数（x≥0）' },
          { syntax: 'y = x 对称', description: '原函数与反函数图像关于直线 y=x 对称', example: '橙色虚线为对称轴' },
        ],
      },
      {
        name: '多窗口与动画',
        items: [
          { syntax: '2×2 子图', description: '同时对比4个不同函数图像', example: '左上sin, 右上cos, 左下x², 右下eˣ' },
          { syntax: '参数曲线动画', description: '拖动滑块控制 t 上限，动态绘制曲线', example: '圆：t 从 0 到 2π 逐渐画出' },
          { syntax: '极坐标玫瑰线', description: '专门的玫瑰线/心形线/螺线绘制标签页', example: 'r = a sin(nθ) 玫瑰线族' },
        ],
      },
    ],
  },
  'plot-3d': {
    title: '三维曲面',
    intro: '二元函数与参数曲面的三维可视化，支持8种二次曲面、旋转曲面、参数曲面、截面切片、法向量场、曲面类型识别。',
    categories: [
      {
        name: '显式曲面 z = f(x,y)',
        items: [
          { syntax: 'sin(sqrt(x^2+y^2))', description: '输入二元函数表达式', example: 'sin(r)/r 墨西哥帽' },
          { syntax: 'x/y 范围', description: '设置定义域矩形', example: 'x ∈ [-10,10], y ∈ [-10,10]' },
          { syntax: '曲面/等高线切换', description: '三维曲面图或二维等高线图', example: '等高线模式：俯视投影' },
        ],
      },
      {
        name: '二次曲面库（8种）',
        items: [
          { syntax: '椭球面 x²/a²+y²/b²+z²/c²=1', description: '所有截线都是椭圆', example: 'x²/4+y²/9+z²=1' },
          { syntax: '单叶双曲面 x²+y²-z²=1', description: '直纹面，可由直线编织而成', example: '冷却塔外形' },
          { syntax: '双叶双曲面 x²+y²-z²=-1', description: '分离的两叶', example: '上下两个曲面' },
          { syntax: '椭圆抛物面 z = x²+y²', description: '碗状，各截面为抛物线', example: '卫星天线截面' },
          { syntax: '双曲抛物面（马鞍面）z = x²-y²', description: '在不同方向凹凸相反', example: '鞍点处为驻点' },
          { syntax: '二次锥面 z² = x²+y²', description: '顶点在原点的圆锥面', example: '线性齐次方程' },
          { syntax: '圆柱面 x²+z²=r²', description: '母线平行于 y 轴', example: '无限延伸的柱面' },
          { syntax: '球面 x²+y²+z²=R²', description: '到原点距离为 R 的点集', example: '单位球面 R=1' },
        ],
      },
      {
        name: '旋转曲面',
        items: [
          { syntax: '母线 y = f(x)', description: '给定一条平面曲线', example: 'y = x² 抛物线' },
          { syntax: '绕 x 轴旋转', description: 'x 不变，y→ycosθ, z→ysinθ', example: 'y=x² 绕x轴得旋转抛物面' },
          { syntax: '绕 y 轴旋转', description: 'y 不变，x→xcosθ, z→xsinθ', example: 'y=1/x 绕y轴得旋转双曲面' },
        ],
      },
      {
        name: '参数曲面 x(u,v), y(u,v), z(u,v)',
        items: [
          { syntax: '环面', description: '(R+rcosv)cosu, (R+rcosv)sinu, rsinv', example: '轮胎面' },
          { syntax: '螺旋面', description: 'u cosv, u sinv, v', example: '正螺面' },
          { syntax: '球面参数式', description: 'cosu·sinv, sinu·sinv, cosv', example: 'u∈[0,2π], v∈[0,π]' },
        ],
      },
      {
        name: '截面与法向量',
        items: [
          { syntax: '截面 z = k', description: '用水平面 z=k 切割曲面，截线为等高线', example: '滑块调 k 值，截线动态变化' },
          { syntax: '法向量场', description: '曲面各点处的单位法向量 n = (-f_x, -f_y, 1)/|∇f|', example: '红色箭头表示法向方向' },
        ],
      },
      {
        name: '二次曲面类型识别',
        items: [
          { syntax: '一般方程 Ax²+By²+Cz²+2Dxy+2Exz+2Fyz+2Gx+2Hy+2Iz+J=0', description: '输入10个系数判定类型', example: 'A=B=C=1, J=-1 → 球面' },
          { syntax: '不变量 I₁, I₂, I₃', description: 'I₁=A+B+C, I₂=AB+AC+BC-D²-E²-F², I₃=三阶行列式', example: '正交变换下不变' },
          { syntax: '中心二次曲面', description: 'I₃ ≠ 0，有唯一中心', example: '椭球面、双曲面、二次锥面' },
          { syntax: '抛物型', description: 'I₃ = 0，无对称中心', example: '抛物面、柱面、抛物柱面' },
        ],
      },
    ],
  },
  multivariable: {
    title: '多元微积分',
    intro: '多元函数微分学与积分学的完整计算工具：偏导、梯度、全微分、方向导数、多元泰勒、极值与拉格朗日乘子、二重/三重积分、曲线积分、格林/高斯/斯托克斯三大公式、梯度场可视化。',
    categories: [
      {
        name: '偏导数与梯度',
        items: [
          { syntax: '∂f/∂x', description: '对 x 的一阶偏导数，其余变量视为常数', example: '∂(x²y)/∂x = 2xy' },
          { syntax: '∂f/∂y', description: '对 y 的一阶偏导数', example: '∂(x²y)/∂y = x²' },
          { syntax: '∇f = (f_x, f_y)', description: '梯度向量：偏导数构成的向量', example: '∇(x²+y²) = (2x, 2y)' },
          { syntax: '混合偏导 ∂²f/∂x∂y', description: '连续时与求导顺序无关', example: '∂²(x²y)/∂x∂y = 2x' },
        ],
      },
      {
        name: '全微分',
        items: [
          { syntax: 'dz = f_x dx + f_y dy', description: '二元函数的全微分表达式', example: 'z=x²y 在 (1,2): dz=4dx+1dy' },
          { syntax: '可微条件', description: '偏导数连续 → 可微 → 偏导数存在且连续', example: 'f_x, f_y 连续是可微的充分条件' },
        ],
      },
      {
        name: '方向导数',
        items: [
          { syntax: 'D_u f = ∇f · u/|u|', description: '在单位方向 u 上的变化率', example: 'f=x²+y² 在 (1,1) 沿 (1,1) 方向 = 2√2' },
          { syntax: '梯度方向最大', description: '梯度方向是方向导数最大的方向，值为 |∇f|', example: '最速上升方向就是梯度方向' },
        ],
      },
      {
        name: '多元泰勒展开（二阶）',
        items: [
          { syntax: 'f(x,y) ≈ f₀ + f_x·h + f_y·k + (1/2)(f_xx h² + 2f_xy hk + f_yy k²)', description: '在 (a,b) 处二阶展开，h=x-a, k=y-b', example: 'e^(x+y) 在 (0,0): 1 + x+y + (1/2)(x+y)²' },
          { syntax: 'Hesse 矩阵', description: 'H = [[f_xx, f_xy],[f_yx, f_yy]]，二阶项的系数矩阵', example: '对称矩阵，决定曲面局部形状' },
        ],
      },
      {
        name: '多元函数极值',
        items: [
          { syntax: '驻点', description: '∇f = 0 即 f_x=0 且 f_y=0 的点', example: 'f=x²+y²-2x-4y+5 的驻点 (1,2)' },
          { syntax: 'Hesse 判别法', description: 'det(H)>0 且 f_xx>0 → 极小；det(H)>0 且 f_xx<0 → 极大；det(H)<0 → 鞍点', example: '马鞍面在原点是鞍点' },
          { syntax: '条件极值（拉格朗日乘子法）', description: 'min/max f(x,y) s.t. g(x,y)=0，令 ∇f = λ∇g 解方程', example: 'max x+y s.t. x²+y²=1 → (√2/2,√2/2), f=√2' },
        ],
      },
      {
        name: '二重积分',
        items: [
          { syntax: '∫∫_D f(x,y) dxdy', description: '直角坐标系下的二重积分（数值梯形法）', example: '∫₀¹∫₀¹ (x+y) dxdy = 1' },
          { syntax: '极坐标变换', description: 'x=rcosθ, y=rsinθ, dxdy=rdrdθ', example: '∫₀²π∫₀¹ r drdθ = π（单位圆面积）' },
        ],
      },
      {
        name: '三重积分',
        items: [
          { syntax: '∭_V f(x,y,z) dxdydz', description: '长方体区域上的数值积分（辛普森法嵌套）', example: '∭₁ 1 dxdydz 在 [0,1]³ = 1（单位立方体体积）' },
          { syntax: '球坐标变换', description: 'x=rsinφcosθ, y=rsinφsinθ, z=rcosφ, dV=r²sinφ drdφdθ', example: '球体积 = (4/3)πR³' },
        ],
      },
      {
        name: '曲线积分',
        items: [
          { syntax: '第一型 ∫_C f ds', description: '对弧长的曲线积分 = ∫ f(x(t),y(t))√(x′(t)²+y′(t)²) dt', example: '单位圆上 ∫(x²+y²)ds = 2π' },
          { syntax: '第二型 ∫_C Pdx+Qdy', description: '对坐标的曲线积分 = ∫ (P x′+Q y′) dt', example: '保守场 F=(y,x) 的积分与路径无关' },
          { syntax: '保守场', description: '∂P/∂y = ∂Q/∂x，积分仅与端点有关，闭路积分为零', example: 'F = (y, x) 是保守场，势函数 φ = xy' },
        ],
      },
      {
        name: '格林公式',
        items: [
          { syntax: '∮_C Pdx + Qdy = ∬_D (∂Q/∂x - ∂P/∂y) dxdy', description: '闭路积分 = 区域上旋度的二重积分', example: 'P=-y,Q=x → 左边=2π（单位圆）, 右边=∬2 dA=2π' },
          { syntax: '平面区域面积', description: 'A = (1/2)∮ xdy - ydx', example: '椭圆面积 = πab' },
        ],
      },
      {
        name: '散度与旋度',
        items: [
          { syntax: 'div F = ∂P/∂x + ∂Q/∂y + ∂R/∂z', description: '散度：标量，衡量向量场的"源汇"强度', example: 'F=(x,y,z), div F = 3' },
          { syntax: 'curl F = ∇×F = (R_y-Q_z, P_z-R_x, Q_x-P_y)', description: '旋度：向量，衡量旋转强度与方向', example: 'F=(x,y,z), curl F = (0,0,0) 无旋场' },
        ],
      },
      {
        name: '高斯公式（散度定理）',
        items: [
          { syntax: '∯_∂V F·dS = ∭_V div F dV', description: '闭曲面上的通量 = 区域内散度的体积分', example: 'F=(x,y,z), 单位球通量 = ∭3 dV = 4π' },
          { syntax: '物理意义', description: '流出闭曲面的总量 = 内部源的总和', example: '电场高斯定理：电通量正比于内部电荷' },
        ],
      },
      {
        name: '斯托克斯公式',
        items: [
          { syntax: '∮_C F·dr = ∬_S (curl F)·n dS', description: '边界闭路积分 = 曲面上旋度通量', example: 'F=(-y,x,0), 单位圆 → 左边=2π, 右边=∬2 dA=2π' },
          { syntax: '格林公式是特例', description: '平面向量场 + z=0 平面区域时，退化为格林公式', example: '格林 ⊂ 斯托克斯' },
        ],
      },
      {
        name: '梯度场可视化',
        items: [
          { syntax: '等高线 + 梯度箭头', description: '热力图显示函数值大小，红色箭头显示各点梯度方向', example: 'f=x²+y² → 同心圆等高线 + 径向梯度箭头' },
          { syntax: '梯度与等高线关系', description: '梯度方向与等高线正交，指向函数值增长最快的方向', example: '等高线越密梯度越大' },
        ],
      },
    ],
  },
  ode: {
    title: '常微分方程',
    intro: '求解常微分方程数值解并可视化。支持一阶和二阶 ODE，欧拉法与龙格-库塔法 (RK4)。',
    categories: [
      {
        name: '一阶 ODE',
        items: [
          { syntax: "y' = f(x, y)", description: '输入 dy/dx = f(x,y) 右侧表达式', example: 'dy/dx = y + x' },
          { syntax: 'y(x0) = y0', description: '初始条件', example: 'y(0) = 1' },
        ],
      },
      {
        name: '二阶 ODE',
        items: [
          { syntax: "y'' = f(x, y, y')", description: '输入 y\'\' 的表达式', example: "y'' = -y" },
          { syntax: 'y(x0) = y0, y\'(x0) = v0', description: '两个初始条件', example: 'y(0)=1, y\'(0)=0' },
        ],
      },
      {
        name: '数值方法',
        items: [
          { syntax: '欧拉法', description: 'y_{n+1} = y_n + h·f(x_n, y_n)，一阶精度' },
          { syntax: 'RK4', description: '四阶龙格-库塔法，精度更高', example: 'y_{n+1} = y_n + (k1+2k2+2k3+k4)/6' },
        ],
      },
      {
        name: '方向场',
        items: [
          { syntax: '斜率场', description: '在网格点上绘制小线段表示解曲线的斜率方向' },
          { syntax: '解曲线', description: '从初值出发的数值解曲线叠加在方向场上' },
        ],
      },
      {
        name: '可分离变量方程',
        items: [
          { syntax: 'dy/dx = f(x)·g(y)', description: '分离变量：dy/g(y) = f(x)dx，两边积分得通解' },
          { syntax: '∫dy/g(y) = ∫f(x)dx + C', description: '通解含任意常数 C' },
        ],
      },
      {
        name: '齐次方程',
        items: [
          { syntax: 'dy/dx = f(y/x)', description: '令 u = y/x，则 y = ux，y\' = u + x·du/dx' },
          { syntax: 'x·du/dx = f(u) - u', description: '化为可分离变量方程，分离变量积分后回代 u = y/x' },
        ],
      },
      {
        name: '恰当方程',
        items: [
          { syntax: 'P(x,y)dx + Q(x,y)dy = 0', description: '存在原函数 u(x,y) 使得 du = Pdx + Qdy 的充要条件' },
          { syntax: '∂P/∂y = ∂Q/∂x', description: '恰当性判定条件' },
          { syntax: 'u(x,y) = C', description: '恰当方程通解，u 由积分求出' },
        ],
      },
      {
        name: '可降阶高阶方程',
        items: [
          { syntax: "y'' = f(x) 型", description: '直接积分两次，含两个任意常数' },
          { syntax: "y'' = f(x, y') 型（不显含 y）", description: '令 p = y\'，方程化为一阶 dp/dx = f(x, p)' },
          { syntax: "y'' = f(y, y') 型（不显含 x）", description: '令 p = y\'，y\'\' = p·dp/dy，化为 p·dp/dy = f(y, p)' },
        ],
      },
      {
        name: '相图分析',
        items: [
          { syntax: 'dx/dt = f(x)', description: '一维自治方程，解曲线的定性行为由 f(x) 的零点决定' },
          { syntax: '平衡点 x*：满足 f(x*) = 0', description: '常数解，也称不动点或定常解' },
          { syntax: '稳定：f\'(x*) < 0', description: '附近解随时间趋近平衡点（汇点）' },
          { syntax: '不稳定：f\'(x*) > 0', description: '附近解随时间远离平衡点（源点）' },
          { syntax: '半稳定：f\'(x*) = 0', description: '两侧单调性相同，需进一步判断' },
        ],
      },
    ],
  },
  numerical: {
    title: '数值分析',
    intro: '经典数值分析方法：方程求根、数值积分、线性插值。',
    categories: [
      {
        name: '方程求根',
        items: [
          { syntax: 'bisect(f, a, b)', description: '二分法，在[a,b]内找根（需 f(a)·f(b)<0）', example: 'bisect(x^2-2, 0, 2) ≈ 1.414' },
          { syntax: 'newton(f, x0)', description: '牛顿迭代法，从 x0 开始迭代', example: 'newton(x^2-2, 1) ≈ 1.414' },
        ],
      },
      {
        name: '数值积分',
        items: [
          { syntax: 'trap(f, a, b, n)', description: '梯形法，n 等分区间', example: 'trap(x^2, 0, 1, 100) ≈ 0.333' },
          { syntax: 'simpson(f, a, b, n)', description: '辛普森法，n 为偶数', example: 'simpson(x^2, 0, 1, 100) ≈ 0.333' },
        ],
      },
      {
        name: '插值',
        items: [
          { syntax: 'interpolate(x1,y1,x2,y2,x)', description: '两点线性插值', example: 'interpolate(0,0,1,1,0.5) = 0.5' },
        ],
      },
      {
        name: '牛顿-科茨求积',
        items: [
          { syntax: 'n=1 梯形公式', description: '∫f(x)dx ≈ (b-a)/2·[f(a)+f(b)]，代数精度 1 次' },
          { syntax: 'n=2 辛普森公式', description: '∫f(x)dx ≈ (b-a)/6·[f(a)+4f((a+b)/2)+f(b)]，代数精度 3 次' },
          { syntax: 'n=3 辛普森3/8公式', description: '用三次多项式近似，代数精度 3 次' },
          { syntax: 'n=4 柯茨公式', description: '用四次多项式近似，代数精度 5 次' },
        ],
      },
      {
        name: '数值微分',
        items: [
          { syntax: '前向差商', description: "f'(x) ≈ [f(x+h) - f(x)] / h，O(h) 精度" },
          { syntax: '中心差商', description: "f'(x) ≈ [f(x+h) - f(x-h)] / (2h)，O(h²) 精度" },
          { syntax: '三点公式', description: '用 f(x-h), f(x), f(x+h) 三点拟合求导，O(h²) 精度' },
        ],
      },
      {
        name: 'SOR 超松弛迭代',
        items: [
          { syntax: 'x_i^(k+1) = x_i^k + ω·(b_i - Σa_ij·x_j^new)/a_ii', description: 'SOR 迭代公式，ω 为松弛因子' },
          { syntax: 'ω = 1', description: '退化为高斯-赛德尔迭代' },
          { syntax: 'ω > 1 超松弛', description: '加速收敛，需选择合适 ω 以获得最优收敛速度' },
          { syntax: '收敛条件', description: '系数矩阵对称正定或严格对角占优时，0 < ω < 2 收敛' },
        ],
      },
      {
        name: '误差分析',
        items: [
          { syntax: '绝对误差 e* = x* - x', description: '近似值与精确值之差' },
          { syntax: '相对误差 e_r* = e* / x', description: '绝对误差除以精确值，更具可比性' },
          { syntax: '有效数字', description: '若近似值的绝对误差不超过其某一位的半个单位，且该位到第一位非零数字共 n 位，则有 n 位有效数字' },
        ],
      },
      {
        name: '秦九韶算法',
        items: [
          { syntax: 'P(x) = a_n·x^n + ... + a_1·x + a_0', description: 'n 次多项式求值' },
          { syntax: 'b_n = a_n,  b_k = a_k + b_{k+1}·x', description: '递推公式，从高次到低次' },
          { syntax: 'P(x) = b_0', description: '只需 n 次乘法和 n 次加法，比直接计算高效' },
          { syntax: '又名 Horner 法则 / 霍纳方法', description: '中国南宋数学家秦九韶最早提出' },
        ],
      },
    ],
  },
  fourier: {
    title: '傅里叶分析',
    intro: '傅里叶级数展开、傅里叶变换与逆变换、FFT 快速傅里叶变换、频谱分析、帕塞瓦尔等式、吉布斯现象、傅里叶级数解微分方程。',
    categories: [
      {
        name: '傅里叶系数公式',
        items: [
          { syntax: 'a₀ = (2/T)∫_{-T/2}^{T/2} f(x)dx', description: '常数项系数（一个周期内积分）' },
          { syntax: 'aₙ = (2/T)∫_{-T/2}^{T/2} f(x)cos(nω₀x)dx', description: '余弦项系数，基频 ω₀ = 2π/T' },
          { syntax: 'bₙ = (2/T)∫_{-T/2}^{T/2} f(x)sin(nω₀x)dx', description: '正弦项系数' },
          { syntax: 'f(x) ≈ a₀/2 + Σ_{n=1}^{N} [aₙcos(nω₀x) + bₙsin(nω₀x)]', description: 'N 项三角形式部分和' },
        ],
      },
      {
        name: '复数形式',
        items: [
          { syntax: 'cₙ = (1/T)∫_{-T/2}^{T/2} f(x)e^{-inω₀x}dx', description: '复傅里叶系数' },
          { syntax: 'f(x) = Σ_{n=-∞}^{∞} cₙ·e^{inω₀x}', description: '复指数形式傅里叶级数' },
          { syntax: 'c₀ = a₀/2,  cₙ = (aₙ - ibₙ)/2,  c_{-n} = cₙ*', description: '三角形式与复形式关系' },
        ],
      },
      {
        name: '奇偶函数展开',
        items: [
          { syntax: '偶函数: bₙ = 0,  仅余 aₙ 项（余弦级数）', description: 'f(-x) = f(x) 时，正弦项全部为零' },
          { syntax: '奇函数: a₀ = 0, aₙ = 0,  仅余 bₙ 项（正弦级数）', description: 'f(-x) = -f(x) 时，余弦项全部为零' },
        ],
      },
      {
        name: '傅里叶变换',
        items: [
          { syntax: 'F(ω) = ∫_{-∞}^{∞} f(t)·e^{-iωt} dt', description: '傅里叶变换（正变换）' },
          { syntax: 'f(t) = (1/2π)∫_{-∞}^{∞} F(ω)·e^{iωt} dω', description: '傅里叶逆变换' },
          { syntax: '|F(ω)|: 幅度谱,  arg(F(ω)): 相位谱', description: '频谱由幅度谱和相位谱组成' },
        ],
      },
      {
        name: '傅里叶变换性质',
        items: [
          { syntax: '线性: a·f(t) + b·g(t) ↔ a·F(ω) + b·G(ω)', description: '线性性质' },
          { syntax: '时移: f(t-τ) ↔ F(ω)·e^{-iωτ}', description: '时域平移 → 频域相位线性变化' },
          { syntax: '频移: f(t)·e^{iω₀t} ↔ F(ω-ω₀)', description: '频域平移 = 调制定理' },
          { syntax: '尺度: f(at) ↔ (1/|a|)F(ω/a)', description: '时域压缩 → 频域展宽' },
          { syntax: '卷积定理: f*g ↔ F(ω)·G(ω)', description: '时域卷积 ↔ 频域乘积' },
          { syntax: 'Parseval: ∫|f(t)|²dt = (1/2π)∫|F(ω)|²dω', description: '帕塞瓦尔等式——能量守恒' },
        ],
      },
      {
        name: 'FFT 与频谱分析',
        items: [
          { syntax: 'X[k] = Σ_{n=0}^{N-1} x[n]·e^{-i2πkn/N}', description: '离散傅里叶变换 (DFT) 定义' },
          { syntax: 'FFT: 分治算法, 复杂度 O(N log N)', description: '快速傅里叶变换，N 通常为 2 的幂' },
          { syntax: '频率分辨率 Δf = Fs/N', description: '频率分辨率 = 采样率 / 点数' },
          { syntax: '奈奎斯特频率 f_Nyq = Fs/2', description: '采样率必须 ≥ 2 倍最高频率分量' },
          { syntax: '峰值检测', description: '在频谱中找局部最大值，识别信号的频率分量' },
        ],
      },
      {
        name: '吉布斯现象',
        items: [
          { syntax: '过冲幅度 ≈ 8.95%（Wilbraham-Gibbs 常数）', description: '间断点附近的过冲，即使 N→∞ 也不消失' },
          { syntax: '过冲宽度 ∝ 1/N', description: '过冲振荡宽度随 N 增大而变窄' },
          { syntax: 'Gibbs ≈ 0.0895 · 跳变高度', description: '方波在跳变处的最大过冲比例' },
        ],
      },
      {
        name: '傅里叶级数解 ODE',
        items: [
          { syntax: 'y″ + a·y′ + b·y = f(t), f 周期为 T', description: '周期激励下的二阶常系数线性 ODE' },
          { syntax: '将 f(t) 展开为傅里叶级数', description: 'f(t) = a₀/2 + Σ(aₙcos(nωt) + bₙsin(nωt))' },
          { syntax: '对每个分量求特解后叠加', description: 'y_p(t) = Σ [Aₙcos(nωt) + Bₙsin(nωt)]' },
          { syntax: 'Aₙ = (b-n²ω²)·aₙ + anω·bₙ 除以分母', description: '各次谐波特解系数，分母 = (b-n²ω²)² + (anω)²' },
          { syntax: 'Bₙ = (b-n²ω²)·bₙ - anω·aₙ 除以分母', description: '正弦分量系数' },
        ],
      },
      {
        name: '奇偶延拓',
        items: [
          { syntax: '半区间 [0, L] 上给定函数 f(x)', description: '将函数延拓到 [-L, L] 上再展开为傅里叶级数' },
          { syntax: '奇延拓（正弦级数）', description: '令 f(-x) = -f(x)，则 a₀ = aₙ = 0，仅含正弦项 bₙ' },
          { syntax: '偶延拓（余弦级数）', description: '令 f(-x) = f(x)，则 bₙ = 0，仅含余弦项 a₀, aₙ' },
          { syntax: 'bₙ = (2/L)∫₀ᴸ f(x)sin(nπx/L)dx', description: '奇延拓正弦系数公式' },
          { syntax: 'aₙ = (2/L)∫₀ᴸ f(x)cos(nπx/L)dx', description: '偶延拓余弦系数公式' },
        ],
      },
      {
        name: '狄利克雷收敛定理',
        items: [
          { syntax: '狄利克雷条件', description: 'f(x) 在一个周期内只有有限个第一类间断点和有限个极值点' },
          { syntax: '连续点处', description: '傅里叶级数收敛于 f(x)' },
          { syntax: '间断点处', description: '傅里叶级数收敛于 [f(x+) + f(x-)] / 2（左右极限的平均值）' },
          { syntax: '端点处', description: '收敛于 [f(-T/2+) + f(T/2-)] / 2' },
        ],
      },
      {
        name: '卷积定理',
        items: [
          { syntax: '卷积定义：(f*g)(t) = ∫_{-∞}^{∞} f(τ)g(t-τ)dτ', description: '两个函数的卷积积分' },
          { syntax: 'ℱ[f*g] = F(ω) · G(ω)', description: '时域卷积 ↔ 频域乘积（卷积定理核心）' },
          { syntax: 'ℱ[f·g] = (1/2π)·F(ω)*G(ω)', description: '频域卷积 ↔ 时域乘积的对偶形式' },
        ],
      },
      {
        name: '数字滤波器',
        items: [
          { syntax: '低通滤波器', description: '保留低频成分，衰减高于截止频率的成分' },
          { syntax: '高通滤波器', description: '保留高频成分，衰减低于截止频率的成分' },
          { syntax: '截止频率 f_c', description: '滤波器通带与阻带的分界点' },
          { syntax: '频谱对比', description: '通过 FFT 观察滤波前后信号频谱的变化' },
        ],
      },
      {
        name: '弦振动方程',
        items: [
          { syntax: '∂²u/∂t² = a²·∂²u/∂x²', description: '一维波动方程，a 为波速' },
          { syntax: 'u(0,t) = u(L,t) = 0', description: '两端固定边界条件' },
          { syntax: 'u(x,0) = φ(x), ∂u/∂t(x,0) = ψ(x)', description: '初始位移和初始速度' },
          { syntax: '分离变量法解：u = Σ(Aₙcos(nπat/L) + Bₙsin(nπat/L))·sin(nπx/L)', description: '各阶驻波模态叠加' },
          { syntax: 'Aₙ = (2/L)∫₀ᴸ φ(x)sin(nπx/L)dx', description: '由初始位移确定的系数' },
          { syntax: 'Bₙ = (2/(nπa))∫₀ᴸ ψ(x)sin(nπx/L)dx', description: '由初始速度确定的系数' },
        ],
      },
    ],
  },
  complex: {
    title: '复变函数',
    intro: '复数运算与复函数可视化。使用 i 作为虚数单位（如 3+4i）。',
    categories: [
      {
        name: '复数基础',
        items: [
          { syntax: 'a + bi', description: '复数代数形式', example: '3 + 4i' },
          { syntax: 're(z)', description: '实部', example: 're(3+4i) = 3' },
          { syntax: 'im(z)', description: '虚部', example: 'im(3+4i) = 4' },
          { syntax: 'abs(z)', description: '模 |z|', example: 'abs(3+4i) = 5' },
          { syntax: 'arg(z)', description: '幅角 arg(z)', example: 'arg(1+i) = π/4' },
          { syntax: 'conj(z)', description: '共轭复数', example: 'conj(3+4i) = 3-4i' },
        ],
      },
      {
        name: '复数运算',
        items: [
          { syntax: 'z1 + z2 / z1 - z2', description: '复数加减', example: '(1+2i)+(3+4i)=4+6i' },
          { syntax: 'z1 * z2', description: '复数乘法', example: '(1+i)^2 = 2i' },
          { syntax: 'z1 / z2', description: '复数除法', example: '(1+i)/(1-i) = i' },
          { syntax: 'z^n', description: '复数幂', example: '(1+i)^4 = -4' },
          { syntax: 'sqrt(z)', description: '复数开方', example: 'sqrt(i) = √2/2 + √2/2 i' },
        ],
      },
      {
        name: '欧拉公式',
        items: [
          { syntax: 'e^(ix) = cos(x) + i·sin(x)', description: '欧拉公式，将指数与三角函数联系起来' },
          { syntax: 'e^(iπ) + 1 = 0', description: '欧拉恒等式' },
        ],
      },
      {
        name: '复函数映射',
        items: [
          { syntax: 'w = f(z)', description: '输入复变函数表达式', example: 'z^2、exp(z)、1/z' },
          { syntax: '网格映射', description: 'z 平面网格经 f(z) 映射到 w 平面的变形图' },
        ],
      },
      {
        name: '柯西-黎曼方程',
        items: [
          { syntax: '∂u/∂x = ∂v/∂y', description: 'C-R 方程第一式（实部对x = 虚部对y）' },
          { syntax: '∂u/∂y = -∂v/∂x', description: 'C-R 方程第二式（实部对y = 负的虚部对x）' },
          { syntax: "f'(z) = ∂u/∂x + i·∂v/∂x", description: '解析函数的导数，满足 C-R 时可只用实部对x计算' },
          { syntax: 'f(z) = u(x,y) + iv(x,y) 在 D 内解析 ↔ u,v 可微且 C-R 成立', description: '解析函数充要条件' },
        ],
      },
      {
        name: '调和函数',
        items: [
          { syntax: '∇²u = ∂²u/∂x² + ∂²u/∂y² = 0', description: '拉普拉斯方程，满足则称 u 为调和函数' },
          { syntax: '已知 u 求 v', description: '由 C-R 方程线积分求共轭调和函数 v' },
          { syntax: 'f(z) = u + iv', description: '实部虚部均调和且满足 C-R → 解析函数' },
        ],
      },
      {
        name: '复积分',
        items: [
          { syntax: '∫_C f(z) dz', description: 'f(z) 沿曲线 C 的复积分' },
          { syntax: '柯西积分定理：∮_C f(z) dz = 0', description: 'f(z) 在单连通区域解析，C 为区域内闭曲线' },
          { syntax: '∮ z^n dz = 0 (n ≠ -1)', description: '绕原点闭曲线，整数幂除 n=-1 外积分皆0' },
          { syntax: '∮ 1/z dz = 2πi', description: '绕单位圆一周，留数定理的最简形式' },
        ],
      },
      {
        name: '柯西积分公式',
        items: [
          { syntax: 'f(z₀) = (1/2πi) ∮_C f(z)/(z-z₀) dz', description: '解析函数值由边界积分唯一确定' },
          { syntax: "f^(n)(z₀) = n!/(2πi) ∮ f(z)/(z-z₀)^(n+1) dz", description: '高阶导数公式，解析函数任意阶可导' },
        ],
      },
      {
        name: '泰勒与洛朗级数',
        items: [
          { syntax: 'f(z) = Σ aₙ(z-z₀)ⁿ', description: '泰勒级数，z₀ 为解析点，aₙ = f^(n)(z₀)/n!' },
          { syntax: 'f(z) = Σ aₙ(z-z₀)ⁿ (n=-∞..∞)', description: '洛朗级数，含负幂次（主部）' },
          { syntax: '正则部分：n ≥ 0', description: '洛朗级数的非负幂次项' },
          { syntax: '主部：n < 0', description: '洛朗级数的负幂次项，决定奇点类型' },
        ],
      },
      {
        name: '奇点与留数',
        items: [
          { syntax: '可去奇点', description: '洛朗级数无主部（f 在 z₀ 极限存在有限）' },
          { syntax: 'm 阶极点', description: '主部最高负幂为 -m（(z-z₀)^(-m)）' },
          { syntax: '本性奇点', description: '主部有无穷多项（如 e^(1/z) 在 z=0）' },
          { syntax: 'Res[f,z₀] = a_{-1}', description: '留数 = 洛朗展开 (z-z₀)^{-1} 的系数' },
          { syntax: '一阶极点: Res = lim(z→z₀)(z-z₀)f(z)', description: '一阶极点留数公式' },
          { syntax: 'm阶极点: Res = 1/(m-1)! lim d^{m-1}/dz^{m-1} [(z-z₀)^m f(z)]', description: '高阶极点留数公式' },
          { syntax: '留数定理：∮ f(z) dz = 2πi Σ Res[f, z_k]', description: '闭曲线积分 = 2πi × 内部奇点留数和' },
        ],
      },
      {
        name: '共形映射',
        items: [
          { syntax: 'w = z²', description: '将角域张角加倍，上半平面映为除去正实轴的全平面' },
          { syntax: 'w = e^z', description: '水平带域 0<Im(z)<π 映为上半平面' },
          { syntax: 'w = 1/z', description: '反演映射，单位圆内↔外，保圆性' },
          { syntax: 'w = (z-a)/(1-āz)', description: '分式线性映射，单位圆映到单位圆' },
        ],
      },
      {
        name: '拉普拉斯变换',
        items: [
          { syntax: 'F(s) = L{f(t)} = ∫₀^∞ f(t)e^{-st} dt', description: '拉普拉斯变换定义' },
          { syntax: 'L{1} = 1/s', description: '单位阶跃函数的变换' },
          { syntax: 'L{t} = 1/s²', description: '斜坡函数的变换' },
          { syntax: 'L{e^{at}} = 1/(s-a)', description: '指数函数的变换' },
          { syntax: 'L{sin ωt} = ω/(s²+ω²)', description: '正弦函数的变换' },
          { syntax: 'L{cos ωt} = s/(s²+ω²)', description: '余弦函数的变换' },
          { syntax: 'L{t^n} = n!/s^{n+1}', description: '幂函数的变换（n 为正整数）' },
          { syntax: 'L{δ(t)} = 1', description: '狄拉克 δ 函数的变换' },
          { syntax: "L{f'(t)} = sF(s) - f(0)", description: '微分性质' },
          { syntax: 'L{∫₀ᵗ f(τ)dτ} = F(s)/s', description: '积分性质' },
        ],
      },
      {
        name: '幅角原理',
        items: [
          { syntax: 'f(z)', description: '输入解析函数表达式（支持 z 作为变量）', example: 'z^2 - 1' },
          { syntax: '圆半径 R', description: '积分回路为 |z| = R 的正向圆周' },
          { syntax: '(1/2πi) ∮ f\'/f dz = N - P', description: '幅角原理：绕数 = 零点数 - 极点数' },
          { syntax: '儒歇定理', description: '在 C 上 |f| > |g|，则 f+g 与 f 在 C 内零点个数相同' },
        ],
      },
      {
        name: '多项式复根',
        items: [
          { syntax: '系数 a₀,a₁,...,aₙ', description: '按降幂排列，逗号分隔', example: '1,0,0,-1 = z³-1' },
          { syntax: 'Durand-Kerner 方法', description: '同步迭代求所有复根的数值方法' },
          { syntax: '代数基本定理', description: 'n 次多项式在复数域恰有 n 个根（计重数）' },
        ],
      },
      {
        name: '幂级数收敛半径',
        items: [
          { syntax: '系数 a₀,a₁,a₂,...', description: '幂级数 Σ aₙ zⁿ 的系数序列' },
          { syntax: '比值法: R = lim |aₙ/aₙ₊₁|', description: '比值法估算收敛半径' },
          { syntax: '根值法: R = 1/lim sup |aₙ|^{1/n}', description: '柯西-阿达马公式' },
          { syntax: '阿贝尔定理', description: '|z| < R 绝对收敛，|z| > R 发散' },
        ],
      },
      {
        name: '傅里叶变换',
        items: [
          { syntax: 'F(ω) = ∫_{-∞}^{∞} f(t) e^{-iωt} dt', description: '傅里叶变换定义' },
          { syntax: 'f(t) = (1/2π) ∫ F(ω) e^{iωt} dω', description: '逆傅里叶变换' },
          { syntax: '傅里叶-拉普拉斯关系', description: 'f(t) 因果 → F(ω) = L{f(t)}|_{s=iω}' },
        ],
      },
      {
        name: '拉普拉斯变换性质',
        items: [
          { syntax: 'L{f(t-t₀)} = e^{-st₀} F(s)', description: '时移性质（延迟定理）' },
          { syntax: 'L{e^{at} f(t)} = F(s-a)', description: '频移性质（s 域平移）' },
          { syntax: "L{f'(t)} = sF(s) - f(0)", description: '微分性质' },
          { syntax: "L{f''(t)} = s²F(s) - sf(0) - f'(0)", description: '二阶微分性质' },
          { syntax: 'L{∫₀ᵗ f(τ)dτ} = F(s)/s', description: '积分性质' },
          { syntax: '初值定理: f(0⁺) = lim s→∞ sF(s)', description: 's→∞ 对应 t→0⁺' },
          { syntax: '终值定理: f(∞) = lim s→0 sF(s)', description: 's→0 对应 t→∞' },
        ],
      },
    ],
  },
  discrete: {
    title: '离散数学',
    intro: '数理逻辑、集合论、关系、图论与代数结构。命题变量用英文字母，关系用矩阵表示。',
    categories: [
      {
        name: '命题逻辑',
        items: [
          { syntax: '¬p 或 not p', description: '否定（非）', example: '¬T = F' },
          { syntax: 'p ∧ q 或 p and q', description: '合取（与）', example: 'T ∧ F = F' },
          { syntax: 'p ∨ q 或 p or q', description: '析取（或）', example: 'T ∨ F = T' },
          { syntax: 'p → q 或 p implies q', description: '蕴涵（若p则q），仅T→F为假' },
          { syntax: 'p ↔ q', description: '等价（当且仅当），真值相同为真' },
          { syntax: 'p ⊕ q 或 xor', description: '异或', example: 'T ⊕ T = F' },
          { syntax: '永真式（重言式）', description: '所有真值指派下均为真' },
          { syntax: '永假式（矛盾式）', description: '所有真值指派下均为假' },
          { syntax: '可满足式', description: '至少存在一个真值指派使其为真' },
        ],
      },
      {
        name: '逻辑等价与范式',
        items: [
          { syntax: 'p → q ≡ ¬p ∨ q', description: '蕴涵等值式' },
          { syntax: '¬(p ∧ q) ≡ ¬p ∨ ¬q', description: '德摩根律（合取的否定）' },
          { syntax: '¬(p ∨ q) ≡ ¬p ∧ ¬q', description: '德摩根律（析取的否定）' },
          { syntax: '主析取范式 m₁∨m₃∨...', description: '所有成真赋值对应极小项的析取' },
          { syntax: '主合取范式 M₀∧M₂∧...', description: '所有成假赋值对应极大项的合取' },
        ],
      },
      {
        name: '推理理论',
        items: [
          { syntax: '假言推理: p→q, p ⊢ q', description: 'modus ponens，最基本推理规则' },
          { syntax: '拒取式: p→q, ¬q ⊢ ¬p', description: 'modus tollens' },
          { syntax: '假言三段论: p→q, q→r ⊢ p→r', description: '传递性推理' },
          { syntax: '析取三段论: p∨q, ¬p ⊢ q', description: '排除法' },
          { syntax: '有效推理', description: '前提真时结论必真（重言蕴涵）' },
        ],
      },
      {
        name: '集合运算',
        items: [
          { syntax: 'A ∪ B (并集)', description: '所有属于A或属于B的元素' },
          { syntax: 'A ∩ B (交集)', description: '同时属于A和B的元素' },
          { syntax: 'A - B (差集)', description: '属于A但不属于B的元素' },
          { syntax: 'A ⊕ B (对称差)', description: '属于A或B但不同时属于两者' },
          { syntax: 'A × B (笛卡尔积)', description: '所有有序对 (a,b), a∈A, b∈B' },
          { syntax: 'P(A) (幂集)', description: 'A 的所有子集构成的集合，|P(A)| = 2^|A|' },
          { syntax: '~A (补集)', description: '全集中不属于A的元素' },
        ],
      },
      {
        name: '二元关系',
        items: [
          { syntax: 'R ⊆ A×A', description: 'A 上的二元关系（用矩阵表示）' },
          { syntax: '自反性: ∀x, xRx', description: '主对角线全为1' },
          { syntax: '反自反: ∀x, ¬xRx', description: '主对角线全为0' },
          { syntax: '对称性: xRy → yRx', description: '矩阵对称' },
          { syntax: '反对称: xRy ∧ yRx → x=y', description: '对称位置不同时为1（除对角线）' },
          { syntax: '传递性: xRy ∧ yRz → xRz', description: 'R² ⊆ R' },
          { syntax: '等价关系', description: '自反 + 对称 + 传递' },
          { syntax: '偏序关系', description: '自反 + 反对称 + 传递' },
        ],
      },
      {
        name: '关系闭包',
        items: [
          { syntax: 'r(R) = R ∪ I_A', description: '自反闭包 = R ∪ 恒等关系' },
          { syntax: 's(R) = R ∪ R⁻¹', description: '对称闭包 = R ∪ 逆关系' },
          { syntax: 't(R) = R ∪ R² ∪ R³ ∪ ...', description: '传递闭包 = R 的各次幂的并' },
          { syntax: 'Warshall 算法', description: 'O(n³) 高效求传递闭包' },
        ],
      },
      {
        name: '哈斯图与偏序',
        items: [
          { syntax: '极大元', description: '没有比它更大的元素（可能多个）' },
          { syntax: '极小元', description: '没有比它更小的元素（可能多个）' },
          { syntax: '最大元', description: '大于等于所有元素（唯一或不存在）' },
          { syntax: '最小元', description: '小于等于所有元素（唯一或不存在）' },
          { syntax: '上界 / 下界', description: '大于等于/小于等于集合中所有元素' },
          { syntax: '上确界 sup / 下确界 inf', description: '最小上界 / 最大下界' },
        ],
      },
      {
        name: '图论基础',
        items: [
          { syntax: 'G = (V, E)', description: '图由顶点集 V 和边集 E 组成' },
          { syntax: 'deg(v)', description: '顶点 v 的度数（关联边的条数）' },
          { syntax: '握手定理: Σdeg(v) = 2|E|', description: '所有顶点度数和等于边数的2倍' },
          { syntax: '邻接矩阵 A', description: 'A[i][j] = 1 表示顶点 i,j 之间有边' },
          { syntax: 'A^k[i][j]', description: '从 i 到 j 长度为 k 的通路数目' },
          { syntax: '连通分量', description: '极大连通子图的个数' },
        ],
      },
      {
        name: '欧拉图与哈密顿图',
        items: [
          { syntax: '欧拉通路', description: '经过每条边恰好一次的通路' },
          { syntax: '欧拉回路', description: '经过每条边恰好一次的回路' },
          { syntax: '无向图有欧拉回路 ↔ 连通且所有顶点度数为偶数', description: '欧拉回路判定定理' },
          { syntax: '哈密顿通路', description: '经过每个顶点恰好一次的通路' },
          { syntax: '哈密顿回路', description: '经过每个顶点恰好一次的回路' },
          { syntax: '狄拉克定理: n≥3, 每个顶点度≥n/2 → 哈密顿图', description: '充分非必要条件' },
        ],
      },
      {
        name: '最短路径与最小生成树',
        items: [
          { syntax: 'Dijkstra 算法', description: '单源最短路径，O(n²)，要求非负权' },
          { syntax: 'Prim 算法', description: '最小生成树，从一个顶点逐步扩展' },
          { syntax: 'Kruskal 算法', description: '最小生成树，按权排序加边避圈' },
          { syntax: 'MST 总权重', description: '所有树边权重之和的最小值' },
        ],
      },
      {
        name: '特殊图类',
        items: [
          { syntax: '二部图', description: '顶点可划分为两部分，边只在两部分之间' },
          { syntax: '二部图判定：染色法', description: '能用2种颜色正常着色即为二部图' },
          { syntax: '平面图', description: '可画在平面上边不交叉（除顶点外）' },
          { syntax: '欧拉公式: V - E + F = 2', description: '连通平面图，F 包括外部面' },
          { syntax: 'K₅, K_{3,3}', description: 'Kuratowski 定理：含这两类子图的非平面图' },
          { syntax: '树：连通且无回路', description: '等价条件：V = E + 1，任意两顶点唯一路径' },
        ],
      },
      {
        name: '代数结构',
        items: [
          { syntax: '半群：封闭 + 结合律', description: '<S, *> 满足运算封闭且结合律成立' },
          { syntax: '独异点：含单位元的半群', description: '存在 e 使得 e*x = x*e = x' },
          { syntax: '群：每个元素有逆元的独异点', description: '封闭+结合+单位元+逆元' },
          { syntax: '交换群（Abel群）', description: '群运算还满足交换律' },
          { syntax: '子群判定', description: '非空子集对运算封闭、对逆元封闭' },
          { syntax: '格：偏序集任意两元素有上确界和下确界', description: '<L, ≤> 诱导的代数结构' },
          { syntax: '布尔代数：有补分配格', description: '满足交换律、结合律、吸收律、补元存在' },
        ],
      },
      {
        name: '前束范式',
        items: [
          { syntax: '∀x ∃y (P(x) → Q(x,y))', description: '前束范式：所有量词在最前面，母式无量词' },
          { syntax: '¬∀x P(x) ≡ ∃x ¬P(x)', description: '量词否定等价（量词对偶律）' },
          { syntax: '¬∃x P(x) ≡ ∀x ¬P(x)', description: '存在量词的否定' },
          { syntax: 'Q ∀x A(x) ≡ ∀x (Q ∨ A(x))', description: '量词辖域扩张（x 不在 Q 中自由出现）' },
        ],
      },
      {
        name: '关系复合',
        items: [
          { syntax: 'M_R（R的关系矩阵）', description: '行=前件，列=后件，有边为1' },
          { syntax: 'M_{R∘S} = M_R ⊙ M_S', description: '复合关系矩阵 = 布尔矩阵乘法（∨代替+, ∧代替×）' },
          { syntax: '(R∘S)[i][j] = ∨_k (R[i][k] ∧ S[k][j])', description: '存在 k 使 iRk ∧ kSj' },
        ],
      },
      {
        name: '环与域',
        items: [
          { syntax: '环 <R,+,·>', description: '<R,+>是Abel群，乘法结合，左右分配律成立' },
          { syntax: '交换环', description: '环 + 乘法交换律' },
          { syntax: '含幺环', description: '环 + 乘法单位元' },
          { syntax: '域', description: '交换含幺环 + 每个非零元有乘法逆元' },
          { syntax: '有限域 GF(p)', description: 'p 为素数时，模 p 整数构成有限域' },
        ],
      },
      {
        name: '邻接矩阵与可达性',
        items: [
          { syntax: 'A 为邻接矩阵', description: 'A[i][j] = 1 表示有边 v_i→v_j' },
          { syntax: 'A^k[i][j]', description: '从 v_i 出发走 k 步到 v_j 的路径数目' },
          { syntax: '可达矩阵: P = A + A² + ... + A^{n-1} 的 0/1 形式', description: '存在路径（任意长度）即记为 1' },
          { syntax: 'Warshall 算法', description: 'O(n³) 计算可达矩阵' },
        ],
      },
      {
        name: '关键路径 (AOE)',
        items: [
          { syntax: 'AOE 网', description: '顶点=事件，有向边=活动，权重=活动持续时间' },
          { syntax: 've(j) = max{ve(i) + dut(<v_i,v_j>)}', description: '事件最早开始时间（正向拓扑）' },
          { syntax: 'vl(i) = min{vl(j) - dut(<v_i,v_j>)}', description: '事件最迟开始时间（逆向拓扑）' },
          { syntax: '关键活动：ve(i) = vl(i)', description: '最早=最迟，没有机动时间' },
          { syntax: '关键路径', description: '从源点到汇点的最长路径，决定工程最短时间' },
        ],
      },
      {
        name: '母函数（生成函数）',
        items: [
          { syntax: 'G(x) = Σ aₙ xⁿ', description: '普通生成函数（序列 aₙ 的母函数）' },
          { syntax: 'G(x) = P(x)/Q(x)', description: '有理生成函数 = 多项式之比' },
          { syntax: '分母 1 - a₁x - ... - a_kx^k', description: '对应 aₙ = a₁aₙ₋₁ + ... + a_k aₙ₋_k 线性递推' },
          { syntax: '长除法/多项式除法展开', description: '求前若干项系数' },
        ],
      },
    ],
  },
  modern: {
    title: '现代数学',
    intro: '组合数学、图论算法、数论高级、博弈论、置换群——前沿数学工具集。',
    categories: [
      {
        name: '组合计数',
        items: [
          { syntax: 'P(n,k) = n!/(n-k)!', description: '排列数：从n个中选k个有序排列' },
          { syntax: 'C(n,k) = n!/(k!(n-k)!)', description: '组合数：从n个中选k个不考虑顺序' },
          { syntax: 'C(n,k) = C(n-1,k) + C(n-1,k-1)', description: '杨辉三角恒等式（递推关系）' },
          { syntax: '(a+b)^n = Σ C(n,k)·a^{n-k}·b^k', description: '二项式定理' },
          { syntax: '范德蒙德恒等式', description: 'Σ C(m,k)C(r,n-k) = C(m+r,n)' },
        ],
      },
      {
        name: '容斥原理',
        items: [
          { syntax: '|A ∪ B| = |A| + |B| - |A ∩ B|', description: '两集合容斥' },
          { syntax: '|A ∪ B ∪ C| = |A|+|B|+|C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|', description: '三集合容斥' },
          { syntax: 'n集合容斥：奇加偶减', description: '|∪A_i| = Σ|A_i| - Σ|A_i∩A_j| + Σ|A_i∩A_j∩A_k| - ...' },
        ],
      },
      {
        name: '递推关系',
        items: [
          { syntax: '斐波那契: F_n = F_{n-1} + F_{n-2}', description: 'F₁=1, F₂=1, F₃=2, F₄=3, F₅=5...' },
          { syntax: '汉诺塔: H_n = 2H_{n-1} + 1', description: 'H_n = 2^n - 1' },
          { syntax: '特征方程法', description: '解线性常系数递推：r² - c₁r - c₂ = 0' },
          { syntax: '两相异实根', description: 'a_n = A·r₁ⁿ + B·r₂ⁿ，A,B 由初值确定' },
          { syntax: '重根', description: 'a_n = (A + Bn)·rⁿ' },
        ],
      },
      {
        name: '卡特兰数',
        items: [
          { syntax: 'C_n = (2n)!/(n!(n+1)!)', description: '第 n 个卡特兰数' },
          { syntax: 'C₀=1, C_{n+1}=ΣC_iC_{n-i}', description: '卡特兰数递推公式' },
          { syntax: '应用：括号匹配、二叉树计数、多边形三角剖分、出栈序列', description: '前缀性质计数问题' },
          { syntax: '前几项: 1, 1, 2, 5, 14, 42, 132, 429...', description: 'C₀到C₇' },
        ],
      },
      {
        name: '错排与斯特林数',
        items: [
          { syntax: 'D_n = n!(1-1/1!+1/2!-1/3!+...+(-1)^n/n!)', description: '错排数（没有元素在原位置）' },
          { syntax: 'D_n ≈ n!/e', description: '错排数近似公式，误差 < 1/(n+1)' },
          { syntax: '第二类斯特林数 S(n,k)', description: 'n个元素分成k个非空子集的方案数' },
          { syntax: '第一类斯特林数 s(n,k)', description: 'n个元素排成k个环的方案数（无符号）' },
          { syntax: '贝尔数 B_n = Σ S(n,k)', description: 'n个元素的划分总数' },
        ],
      },
      {
        name: '图论算法',
        items: [
          { syntax: 'BFS（广度优先）', description: '队列实现，按层遍历，求无权最短路径' },
          { syntax: 'DFS（深度优先）', description: '栈/递归实现，深入到底再回溯' },
          { syntax: '拓扑排序', description: 'DAG 的线性排序，所有边从前指向后' },
          { syntax: 'Kahn算法', description: '入度为0顶点入队，逐个删去更新入度' },
          { syntax: '强连通分量 SCC', description: '极大子图，其中任意两顶点互相可达' },
          { syntax: 'Kosaraju算法', description: '两次DFS：原图标顺序，逆图按倒序搜' },
        ],
      },
      {
        name: '网络流',
        items: [
          { syntax: '最大流问题', description: '从源点到汇点最多能输送多少流量' },
          { syntax: 'Ford-Fulkerson 方法', description: '不断找增广路，直到没有为止' },
          { syntax: '残量网络', description: '剩余容量构成的图，含反向边（可退流）' },
          { syntax: '最大流最小割定理', description: '最大流值 = 最小割容量' },
        ],
      },
      {
        name: '数论高级',
        items: [
          { syntax: '欧拉函数 φ(n)', description: '1..n中与n互素的整数个数' },
          { syntax: 'φ(n) = n·Π(1-1/p)', description: '由素因子分解计算欧拉函数' },
          { syntax: '莫比乌斯函数 μ(n)', description: '平方因子返回0，否则(-1)^k, k为不同素因子数' },
          { syntax: '中国剩余定理 CRT', description: '模数互素时同余方程组有唯一解 mod M' },
          { syntax: '扩展CRT', description: '模数不互素时也能解（或报告无解）' },
          { syntax: '勒让德符号 (a/p)', description: 'a是模p二次剩余为1，非剩余为-1，p整除a为0' },
          { syntax: '雅可比符号 (a/n)', description: '勒让德符号推广到合数n，仍满足二次互反律' },
        ],
      },
      {
        name: '素性检测与大数分解',
        items: [
          { syntax: 'Miller-Rabin 素性检测', description: '概率性算法，多轮基测试后误判率极低' },
          { syntax: '费马小定理: a^{p-1} ≡ 1 mod p', description: 'p是素数，a不是p的倍数' },
          { syntax: '卡迈克尔数', description: '伪素数：对所有与n互素的a，a^{n-1}≡1 mod n，但n是合数' },
          { syntax: 'Pollard-rho 算法', description: '概率性找合数因子，适合大数分解' },
        ],
      },
      {
        name: '博弈论',
        items: [
          { syntax: 'Nim游戏', description: 'n堆石子，可从任一堆取任意个，取最后者胜' },
          { syntax: 'Nim和（异或和）', description: 'Nim和=0必败态，≠0必胜态' },
          { syntax: '威佐夫博弈', description: '两堆石子，可取一堆任意个或两堆取相同个' },
          { syntax: '奇异局势 (⌊kφ⌋, ⌊kφ²⌋)', description: '威佐夫必败态，φ=(1+√5)/2黄金分割' },
          { syntax: 'SG函数（Grundy数）', description: '公平组合游戏状态的 mex{后继状态SG值}' },
          { syntax: 'Sprague-Grundy定理', description: '多个独立游戏的SG值的异或决定胜负' },
        ],
      },
      {
        name: '置换群',
        items: [
          { syntax: '轮换分解', description: '任何置换可分解为不相交轮换的乘积' },
          { syntax: '置换的阶', description: '各轮换长度的最小公倍数' },
          { syntax: '奇置换 / 偶置换', description: '分解为对换乘积的个数奇偶性' },
          { syntax: '逆置换', description: '置换的逆运算，σ·σ⁻¹ = 恒等置换' },
          { syntax: '对换', description: '只交换两个元素的置换（2-轮换）' },
        ],
      },
      {
        name: '勾股数',
        items: [
          { syntax: 'a² + b² = c²', description: '勾股定理，三元组 (a,b,c)' },
          { syntax: '本原勾股数', description: 'a,b,c 两两互素（gcd=1）' },
          { syntax: '欧几里得公式: a=m²-n², b=2mn, c=m²+n²', description: 'm>n>0, 互素, 一奇一偶 → 全部本原勾股数' },
        ],
      },
    ],
  },
  pde: {
    title: '偏微分方程',
    intro: '从二阶线性PDE分类到分离变量法、傅里叶变换法，涵盖波动、热传导、拉普拉斯三大经典方程。',
    categories: [
      {
        name: 'PDE基础概念',
        items: [
          { syntax: 'Au_xx + Bu_xy + Cu_yy + ... = 0', description: '二阶线性PDE一般形式，A,B,C为x,y的函数' },
          { syntax: '判别式 Δ = B² - 4AC', description: '按判别式符号分类：Δ<0椭圆型，Δ=0抛物型，Δ>0双曲型' },
          { syntax: '椭圆型：u_xx + u_yy = 0', description: '拉普拉斯方程/位势方程，描述稳态现象' },
          { syntax: '抛物型：u_t = k·u_xx', description: '热传导方程，描述扩散现象' },
          { syntax: '双曲型：u_tt = c²·u_xx', description: '波动方程，描述振动与波传播' },
          { syntax: '定解问题类型', description: '初值问题（仅初始条件）、边值问题（仅边界条件）、混合问题（两者都有）' },
          { syntax: '适定性三要素', description: '解的存在性、唯一性、稳定性（哈达玛适定性）' },
        ],
      },
      {
        name: '一阶线性PDE',
        items: [
          { syntax: 'a(x,y)u_x + b(x,y)u_y = c(x,y)', description: '一阶线性偏微分方程标准形式' },
          { syntax: '特征方程：dx/a = dy/b = du/c', description: '特征线法的核心方程' },
          { syntax: '首次积分 φ(x,y,u)=C', description: '沿特征线保持常数的量称为首次积分' },
          { syntax: '通解：Φ(φ₁, φ₂)=0', description: '两个独立首次积分的任意函数组合为通解' },
          { syntax: '柯西问题', description: '给定初始曲线上的u值，求PDE的解' },
          { syntax: '特征线与初始曲线不相切', description: '柯西问题有唯一解的条件' },
        ],
      },
      {
        name: '一维波动方程',
        items: [
          { syntax: 'u_tt = c²·u_xx', description: '一维波动方程，c为波速' },
          { syntax: '达朗贝尔公式', description: 'u(x,t) = [φ(x-ct) + φ(x+ct)] / 2 + 1/(2c) · ∫_{x-ct}^{x+ct} ψ(s)ds' },
          { syntax: '左行波与右行波', description: '解表示为左行波f(x+ct)与右行波g(x-ct)的叠加' },
          { syntax: '依赖区域', description: '点(x,t)处的u值仅依赖于x轴上区间[x-ct, x+ct]上的初值' },
          { syntax: '影响区域', description: '点(x₀,0)处初扰动的影响范围为|x-x₀| ≤ ct' },
          { syntax: '决定区域', description: '区间[a,b]上初值完全决定的区域为a+ct ≤ x ≤ b-ct' },
          { syntax: '两端固定弦振动', description: '分离变量法得u(x,t)=Σ[A_n cos(nπct/L) + B_n sin(nπct/L)] sin(nπx/L)' },
        ],
      },
      {
        name: '热传导方程',
        items: [
          { syntax: 'u_t = k·u_xx', description: '一维热传导方程，k为热扩散系数' },
          { syntax: 'Dirichlet边界', description: 'u(0,t)=u(L,t)=0，两端温度固定为0' },
          { syntax: '分离变量解', description: 'u(x,t) = Σ_{n=1}^{∞} b_n · sin(nπx/L) · e^{-k(nπ/L)²t}' },
          { syntax: '傅里叶正弦系数', description: 'b_n = (2/L) ∫₀ᴸ f(x) sin(nπx/L) dx' },
          { syntax: '热核（基本解）', description: 'G(x,t) = 1/√(4πkt) · e^{-x²/(4kt)}，t>0' },
          { syntax: '卷积形式解（全空间）', description: 'u(x,t) = G(x,t) * f(x) = ∫_{-∞}^{∞} G(x-ξ,t) f(ξ) dξ' },
          { syntax: '最大值原理', description: '热方程在有限时间内最大值出现在初始时刻或边界' },
        ],
      },
      {
        name: '拉普拉斯方程',
        items: [
          { syntax: 'Δu = u_xx + u_yy = 0', description: '二维拉普拉斯方程，调和函数' },
          { syntax: '最大值原理', description: '调和函数在区域内部不能取到最大值（除非恒为常数）' },
          { syntax: '平均值性质', description: '调和函数在任一点的值等于其在以该点为心的圆上的平均值' },
          { syntax: '矩形域分离变量', description: 'u(x,y) = Σ [A_n e^{nπy/L} + B_n e^{-nπy/L}] sin(nπx/L)' },
          { syntax: '极坐标下拉普拉斯', description: 'u_rr + u_r/r + u_θθ/r² = 0' },
          { syntax: '圆域解（泊松公式）', description: 'u(r,θ) = (R²-r²)/(2π) ∫₀^{2π} f(φ) / (R²-2Rr cos(θ-φ)+r²) dφ' },
          { syntax: '圆域级数形式', description: 'u(r,θ) = a₀/2 + Σ (r/R)^n [a_n cos(nθ) + b_n sin(nθ)]' },
        ],
      },
      {
        name: '特殊函数',
        items: [
          { syntax: '贝塞尔函数 J_n(x)', description: '贝塞尔方程 x²y″ + xy′ + (x²-n²)y = 0 的第一类解' },
          { syntax: 'J_n(x) 级数展开', description: 'J_n(x) = Σ_{k=0}^{∞} (-1)^k / (k!Γ(k+n+1)) · (x/2)^{2k+n}' },
          { syntax: '勒让德多项式 P_n(x)', description: '勒让德方程 (1-x²)y″ - 2xy′ + n(n+1)y = 0 的多项式解' },
          { syntax: '罗德里格斯公式', description: 'P_n(x) = 1/(2ⁿ n!) · dⁿ/dxⁿ [(x²-1)ⁿ]' },
          { syntax: '递推关系', description: '(n+1)P_{n+1} = (2n+1)xP_n - nP_{n-1}' },
          { syntax: '连带勒让德 P_n^m(x)', description: 'P_n^m(x) = (1-x²)^{m/2} · d^m/dx^m P_n(x)' },
          { syntax: '正交性', description: '∫_{-1}^{1} P_n(x)P_m(x) dx = 2/(2n+1) · δ_{nm}' },
        ],
      },
      {
        name: '傅里叶变换法',
        items: [
          { syntax: '傅里叶变换 F[f](ξ) = ∫_{-∞}^{∞} f(x)e^{-iξx} dx', description: '空间变量的傅里叶变换' },
          { syntax: '微分性质', description: 'F[f^(n)](ξ) = (iξ)^n · F[f](ξ) —— 微分变乘法' },
          { syntax: '热方程傅里叶解法', description: '对方程两边关于x做傅里叶变换，得常微分方程求解' },
          { syntax: 'û_t = -kξ²û', description: '热方程在傅里叶空间中变为关于t的一阶常微分方程' },
          { syntax: '卷积定理', description: 'F[f*g] = F[f]·F[g]，乘积→卷积的逆变换' },
          { syntax: '傅里叶逆变换', description: 'f(x) = 1/(2π) ∫_{-∞}^{∞} F(ξ)e^{iξx} dξ' },
        ],
      },
    ],
  },
  diffgeo: {
    title: '微分几何',
    intro: '曲线论与曲面论的核心计算工具——Frenet标架、曲率挠率、第一/第二基本形式、高斯曲率等。',
    categories: [
      {
        name: '曲线论基础',
        items: [
          { syntax: 'r(t) = (x(t), y(t), z(t))', description: '参数曲线的向量表示，t为参数' },
          { syntax: '正则性：r\'(t) ≠ 0', description: '曲线在t处正则当且仅当切向量非零' },
          { syntax: '切向量 T = r\'(t) / |r\'(t)|', description: '单位切向量，指向参数增加方向' },
          { syntax: '弧长 s(t) = ∫_{t₀}^{t} |r\'(τ)| dτ', description: '从t₀到t的曲线弧长' },
          { syntax: '弧长参数化', description: '以弧长s为参数时，|r\'(s)| ≡ 1，计算最简洁' },
          { syntax: '速度 v = |r\'(t)|', description: '参数t处的速率（标量）' },
        ],
      },
      {
        name: '曲率与挠率',
        items: [
          { syntax: '平面曲率 κ = |x\'y\'\' - y\'x\'\'| / (x\'² + y\'²)^{3/2}', description: '平面曲线曲率公式' },
          { syntax: '空间曲率 κ = |r\' × r\'\'| / |r\'|³', description: '空间曲线曲率，反映曲线弯曲程度' },
          { syntax: '曲率半径 ρ = 1/κ', description: '曲率的倒数，密切圆的半径' },
          { syntax: '挠率 τ = (r\' × r\'\') · r\'\'\' / |r\' × r\'\'|²', description: '挠率反映曲线偏离平面的程度' },
          { syntax: 'τ > 0 右螺旋 / τ < 0 左螺旋', description: '挠率符号决定螺旋手性' },
          { syntax: '平面曲线挠率恒为0', description: '平面曲线的挠率处处为零' },
        ],
      },
      {
        name: 'Frenet标架',
        items: [
          { syntax: 'T = r\' / |r\'|', description: '单位切向量（Tangent）' },
          { syntax: 'N = T\' / |T\'|', description: '主法向量（Normal），指向曲线弯曲方向' },
          { syntax: 'B = T × N', description: '副法向量（Binormal），与T,N都垂直' },
          { syntax: '{T, N, B} 右手单位正交标架', description: 'Frenet标架，沿曲线移动的局部坐标系' },
          { syntax: 'T\' = κN', description: 'Frenet公式1：切向量的变化率=曲率×主法向量' },
          { syntax: 'N\' = -κT + τB', description: 'Frenet公式2：主法向量的变化率' },
          { syntax: 'B\' = -τN', description: 'Frenet公式3：副法向量的变化率=-挠率×主法向量' },
        ],
      },
      {
        name: '曲线特殊平面',
        items: [
          { syntax: '密切平面（Osculating）', description: '由T和N张成的平面，曲线在该平面内的二阶近似最密切' },
          { syntax: '密切圆', description: '在密切平面内，半径为1/κ，圆心在主法方向上的圆' },
          { syntax: '法平面（Normal）', description: '由N和B张成的平面，与切向量垂直' },
          { syntax: '从切平面（Rectifying）', description: '由T和B张成的平面，与主法向量垂直' },
          { syntax: '三平面两两垂直', description: '密切、法、从切三个平面两两正交，交于Frenet标架原点' },
        ],
      },
      {
        name: '曲面论基础',
        items: [
          { syntax: 'r(u,v) = (x(u,v), y(u,v), z(u,v))', description: '参数曲面，u,v为曲面参数' },
          { syntax: 'r_u = ∂r/∂u, r_v = ∂r/∂v', description: '参数曲线的切向量，张成切平面' },
          { syntax: '正则性：r_u × r_v ≠ 0', description: '曲面在该点正则当且仅当切向量不共线' },
          { syntax: '单位法向量 n = r_u × r_v / |r_u × r_v|', description: '曲面的单位法向量，指向曲面外侧' },
          { syntax: '切平面方程', description: '(R - r(u₀,v₀)) · n(u₀,v₀) = 0' },
          { syntax: 'u-曲线 / v-曲线', description: '固定一个参数变化另一个参数得到的坐标曲线' },
        ],
      },
      {
        name: '第一基本形式',
        items: [
          { syntax: 'E = r_u · r_u', description: '第一基本形式系数E = u方向切向量长度平方' },
          { syntax: 'F = r_u · r_v', description: '第一基本形式系数F = 两切向量内积，坐标网正交时F=0' },
          { syntax: 'G = r_v · r_v', description: '第一基本形式系数G = v方向切向量长度平方' },
          { syntax: 'I = ds² = E du² + 2F du dv + G dv²', description: '曲面的弧长元素（第一基本形式）' },
          { syntax: '曲线弧长', description: 's = ∫ √(E (du/dt)² + 2F du/dt dv/dt + G (dv/dt)²) dt' },
          { syntax: '面积元 dA = √(EG - F²) du dv', description: '曲面面积元素的计算公式' },
          { syntax: '两切向量夹角', description: 'cos θ = (E du₁ du₂ + F(du₁ dv₂ + du₂ dv₁) + G dv₁ dv₂) / √(...) / √(...)' },
        ],
      },
      {
        name: '第二基本形式',
        items: [
          { syntax: 'L = r_uu · n', description: '第二基本形式系数L' },
          { syntax: 'M = r_uv · n', description: '第二基本形式系数M' },
          { syntax: 'N = r_vv · n', description: '第二基本形式系数N（注意与法向量n区分）' },
          { syntax: 'II = L du² + 2M du dv + N dv²', description: '第二基本形式，描述曲面的弯曲程度' },
          { syntax: '法曲率 κ_n = II / I', description: '曲面沿方向(du,dv)的法曲率' },
          { syntax: '主曲率 k₁, k₂', description: '法曲率的最大值和最小值，满足特征方程 det(II - kI)=0' },
        ],
      },
      {
        name: '高斯曲率与曲面类型',
        items: [
          { syntax: 'K = k₁ · k₂ = (LN - M²) / (EG - F²)', description: '高斯曲率 = 两主曲率之积' },
          { syntax: 'H = (k₁ + k₂) / 2 = (EN - 2FM + GL) / (2(EG - F²))', description: '平均曲率 = 两主曲率的平均值' },
          { syntax: '椭圆点 K > 0', description: 'k₁,k₂同号，曲面在该点附近呈碗形' },
          { syntax: '抛物点 K = 0', description: '至少一个主曲率为0，曲面在该点呈柱面形' },
          { syntax: '双曲点 K < 0', description: 'k₁,k₂异号，曲面在该点呈马鞍形' },
          { syntax: '极小曲面 H ≡ 0', description: '平均曲率恒为零的曲面，面积泛函的临界点' },
          { syntax: '高斯绝妙定理', description: '高斯曲率K仅由第一基本形式决定，是内蕴量' },
        ],
      },
    ],
  },
  competition: {
    title: '数学竞赛',
    intro: '不等式、数论、组合、几何、代数——竞赛数学全板块速查与计算工具。',
    categories: [
      {
        name: '经典不等式',
        items: [
          { syntax: 'AM ≥ GM ≥ HM', description: '算术平均 ≥ 几何平均 ≥ 调和平均，等号当且仅当各数相等' },
          { syntax: 'QM ≥ AM', description: '平方平均 ≥ 算术平均，等号当且仅当各数相等' },
          { syntax: '柯西不等式', description: '(Σ a_i b_i)² ≤ (Σ a_i²)(Σ b_i²)，等号当且仅当 a_i / b_i = 常数' },
          { syntax: '排序不等式', description: '同序和 ≥ 乱序和 ≥ 反序和，等号当且仅当至少一个序列各数相等' },
          { syntax: '琴生不等式', description: 'f凸 ⇒ f(Σ λ_i x_i) ≤ Σ λ_i f(x_i)；f凹则不等号反向' },
          { syntax: '赫尔德不等式', description: 'Σ a_i b_i ≤ (Σ a_i^p)^{1/p} · (Σ b_i^q)^{1/q}，1/p + 1/q = 1' },
          { syntax: '闵可夫斯基不等式', description: '(Σ(a_i+b_i)^p)^{1/p} ≤ (Σ a_i^p)^{1/p} + (Σ b_i^p)^{1/p}，p ≥ 1' },
        ],
      },
      {
        name: '竞赛数论',
        items: [
          { syntax: '整除判定规则', description: '2末位偶/3各位和/5末位0或5/9各位和/11奇偶位差...' },
          { syntax: '贝祖定理', description: 'ax+by=c有解 ⇔ gcd(a,b) | c' },
          { syntax: '扩展欧几里得算法', description: '求整数x,y使得 ax + by = gcd(a,b)' },
          { syntax: '欧拉函数 φ(n)', description: '不超过n且与n互素的正整数个数，φ(n)=n·Π(1-1/p)' },
          { syntax: '莫比乌斯函数 μ(n)', description: 'n含平方因子时μ=0，k个不同素因子时μ=(-1)^k' },
          { syntax: '勒让德公式', description: 'n!中素数p的指数 = Σ_{k≥1} ⌊n/p^k⌋' },
          { syntax: '佩尔方程 x² - Dy² = 1', description: '有无穷多解，最小解可由连分数展开得到' },
        ],
      },
      {
        name: '竞赛组合',
        items: [
          { syntax: '鸽巢原理', description: 'n个物品放入m个抽屉，若n>m则至少有一个抽屉含≥⌈n/m⌉个物品' },
          { syntax: '容斥原理', description: '|∪A_i| = Σ|A_i| - Σ|A_i∩A_j| + Σ|A_i∩A_j∩A_k| - ...' },
          { syntax: '错排数 D(n)', description: 'D(n) = n! · Σ_{k=0}^n (-1)^k/k!，递推D(n)=(n-1)(D(n-1)+D(n-2))' },
          { syntax: '卡特兰数 C_n', description: 'C_n = (2n)!/(n!(n+1)!)，C₀=1, C_{n+1}=Σ C_iC_{n-i}' },
          { syntax: '斯特林数 S(n,k)', description: '将n个元素分成k个非空子集的方法数，递推S(n,k)=kS(n-1,k)+S(n-1,k-1)' },
          { syntax: '生成函数', description: '序列{a_n}的生成函数为 Σ a_n x^n，用于计数与递推求解' },
        ],
      },
      {
        name: '竞赛几何',
        items: [
          { syntax: '重心 G = (A+B+C)/3', description: '三条中线交点，坐标=三顶点坐标平均' },
          { syntax: '外心 O', description: '三边垂直平分线交点，外接圆圆心，到三顶点距离相等' },
          { syntax: '内心 I', description: '三内角平分线交点，内切圆圆心，坐标 = (aA+bB+cC)/(a+b+c)' },
          { syntax: '垂心 H', description: '三条高的交点' },
          { syntax: '欧拉定理', description: 'O, G, H 共线（欧拉线），且 OG:GH = 1:2' },
          { syntax: '海伦公式', description: 'S = √[s(s-a)(s-b)(s-c)]，s = (a+b+c)/2' },
          { syntax: '正弦定理', description: 'a/sin A = b/sin B = c/sin C = 2R' },
          { syntax: '余弦定理', description: 'c² = a² + b² - 2ab cos C' },
          { syntax: '塞瓦定理', description: '三线共点 ⇔ (BD/DC)(CE/EA)(AF/FB) = 1' },
          { syntax: '梅涅劳斯定理', description: '三点共线 ⇔ (BD/DC)(CE/EA)(AF/FB) = 1（有向线段）' },
          { syntax: '欧拉不等式 R ≥ 2r', description: '外接圆半径 ≥ 2 × 内切圆半径，等号当且仅当正三角形' },
        ],
      },
      {
        name: '竞赛代数',
        items: [
          { syntax: '韦达定理', description: 'n次方程 a_nx^n+...+a₁x+a₀=0，根之和=-a_{n-1}/a_n，根之积=(-1)^n a₀/a_n' },
          { syntax: '对称多项式', description: '可用初等对称多项式表示的多项式，基本定理：任何对称多项式都是初等对称多项式的多项式' },
          { syntax: '因式分解技巧', description: '分组分解、换元法、十字相乘、待定系数、拆项添项' },
          { syntax: '柯西方程 f(x+y)=f(x)+f(y)', description: '连续解为 f(x)=kx；不连续解需选择公理构造' },
          { syntax: '函数方程常见类型', description: '柯西型、递推型、迭代型、多项式函数方程' },
          { syntax: '数列极限方法', description: '夹逼准则、单调有界定理、 Stolz定理、定积分定义' },
        ],
      },
      {
        name: '杨辉三角',
        items: [
          { syntax: 'C(n,k) = n!/(k!(n-k)!)', description: '第 n 行第 k 个数是组合数（0 起）' },
          { syntax: 'C(n,k) = C(n-1,k-1) + C(n-1,k)', description: '递推关系，核心性质' },
          { syntax: 'C(n,k) = C(n,n−k)', description: '对称性' },
          { syntax: 'Σ_{k=0}^n C(n,k) = 2^n', description: '第 n 行所有数之和 = 2^n' },
          { syntax: 'Σ C(n,k)^2 = C(2n,n)', description: '范德蒙德恒等式（自乘和）' },
        ],
      },
      {
        name: '整数分拆',
        items: [
          { syntax: 'p(n)', description: '将 n 拆为正整数之和的方式数（不计顺序）' },
          { syntax: 'p(0)=1, p(1)=1, p(2)=2, p(3)=3, p(4)=5, p(5)=7', description: '前几项分拆数' },
          { syntax: '∏_{k≥1} 1/(1-x^k) = Σ p(n) x^n', description: '欧拉生成函数' },
          { syntax: '五边形数定理', description: '∏(1-x^k) = Σ (-1)^m x^{m(3m-1)/2}，m 正负遍历' },
        ],
      },
      {
        name: '贝尔数',
        items: [
          { syntax: 'B(n)', description: 'n 个元素集合的划分方式数' },
          { syntax: 'B(0)=1, B(1)=1, B(2)=2, B(3)=5, B(4)=15, B(5)=52', description: '前几项贝尔数' },
          { syntax: 'B(n+1) = Σ C(n,k) B(k)', description: '递推公式（按含 n+1 的块大小分类）' },
          { syntax: '贝尔三角形', description: '首项=上行末项，每项=左+左上' },
        ],
      },
      {
        name: 'RSA 公钥密码',
        items: [
          { syntax: '密钥生成：选大素数 p,q，n=pq', description: 'n 为模数，公开' },
          { syntax: 'φ(n) = (p-1)(q-1)', description: '欧拉函数值，私钥推导核心' },
          { syntax: '选 e 与 φ(n) 互素，求 d=e^{-1} mod φ(n)', description: '公钥 (e,n)，私钥 (d,n)' },
          { syntax: '加密: c = m^e mod n', description: '用公钥加密明文 m' },
          { syntax: '解密: m = c^d mod n', description: '用私钥解密密文 c' },
          { syntax: '安全性：大数分解困难性', description: '已知 n 难以反推 p,q' },
        ],
      },
      {
        name: '汉明码 (7,4)',
        items: [
          { syntax: '7 位码 = 3 位校验 + 4 位数据', description: '汉明码 (n=7, k=4)' },
          { syntax: '位置 1,2,4 为校验位 p1,p2,p3', description: '2 的幂位是校验位' },
          { syntax: '位置 3,5,6,7 为数据位 d1-d4', description: '其余位置为数据位' },
          { syntax: 'p1 = d1 ⊕ d2 ⊕ d4 (检查含位1的位置)', description: '校验方程1' },
          { syntax: 'syndrome = s3s2s1 → 二进制错误位置', description: 'syndrome=0 无错，否则表示第几位错' },
          { syntax: '可纠 1 位错，检 2 位错', description: 'SECDED 需扩展校验位' },
        ],
      },
      {
        name: '有限域 GF(p)',
        items: [
          { syntax: 'p 为素数时，Z/pZ 是有限域', description: '最简单的有限域，含 p 个元素' },
          { syntax: '加法：模 p', description: '构成 p 阶循环群' },
          { syntax: '乘法：模 p，排除 0', description: '非零元构成 p-1 阶循环群' },
          { syntax: '费马小定理: a^{p-1} ≡ 1 mod p', description: '乘法群中元素的阶整除群阶' },
          { syntax: '乘法逆元用扩展欧几里得求', description: 'a·a^{-1} ≡ 1 mod p' },
          { syntax: '有限域阶必为素数幂 p^n', description: 'GF(2^n) 为二进制扩展域' },
        ],
      },
      {
        name: '线性规划（单纯形法）',
        items: [
          { syntax: 'max z = c^T x', description: '目标函数（最大化）' },
          { syntax: 's.t. Ax ≤ b, x ≥ 0', description: '约束条件（标准形）' },
          { syntax: '引入松弛变量 → 标准形', description: '不等式约束 → 等式约束' },
          { syntax: '基本可行解 = 可行域顶点', description: '最优解必在顶点取到' },
          { syntax: '单纯形法：沿可行域边界迭代改善', description: '每次选入基/出基变量，向更优顶点移动' },
          { syntax: '两变量可用图解法', description: '可行域为凸多边形，顶点即基本解' },
        ],
      },
    ],
  },
};
