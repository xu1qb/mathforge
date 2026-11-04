// EXPORTS: FORMULA_CATEGORIES, IFormulaItem, IFormulaCategory

export interface IFormulaItem {
  id: string;
  name: string;
  latex: string;           // LaTeX 公式字符串
  description: string;     // 简要说明
  scenario?: string;       // 常用场景
  tags?: string[];         // 搜索标签
  modulePath?: string;     // 跳转到对应模块的路径
  moduleTab?: string;      // 对应模块内的 tab 锚点
}

export interface IFormulaCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  items: IFormulaItem[];
}

export const FORMULA_CATEGORIES: IFormulaCategory[] = [
  // ===== 1. 代数 =====
  {
    id: 'algebra',
    name: '代数',
    icon: 'Sigma',
    description: '代数恒等式、因式分解、二项式定理、韦达定理',
    items: [
      { id: 'alg-1', name: '平方差公式', latex: `a^2 - b^2 = (a+b)(a-b)`, description: '两个数的平方差等于两数和与差的积', scenario: '因式分解、化简', tags: ['因式分解', '平方', '差'], modulePath: '/symbolic' },
      { id: 'alg-2', name: '完全平方和', latex: `(a+b)^2 = a^2 + 2ab + b^2`, description: '两数和的平方展开', scenario: '展开、配方法', tags: ['展开', '平方', '和'], modulePath: '/symbolic' },
      { id: 'alg-3', name: '完全平方差', latex: `(a-b)^2 = a^2 - 2ab + b^2`, description: '两数差的平方展开', scenario: '展开、配方法', tags: ['展开', '平方', '差'], modulePath: '/symbolic' },
      { id: 'alg-4', name: '立方和公式', latex: `a^3 + b^3 = (a+b)(a^2 - ab + b^2)`, description: '两数立方和分解', scenario: '因式分解', tags: ['因式分解', '立方'], modulePath: '/symbolic' },
      { id: 'alg-5', name: '立方差公式', latex: `a^3 - b^3 = (a-b)(a^2 + ab + b^2)`, description: '两数立方差分解', scenario: '因式分解', tags: ['因式分解', '立方'], modulePath: '/symbolic' },
      { id: 'alg-6', name: '二项式定理', latex: `(a+b)^n = \\sum_{k=0}^{n} C(n,k) \\cdot a^{n-k} \\cdot b^k`, description: '二项式的 n 次幂展开式，C(n,k) 为组合数', scenario: '展开、组合数学', tags: ['二项式', '展开', '组合'], modulePath: '/symbolic' },
      { id: 'alg-7', name: '韦达定理', latex: `ax^2+bx+c=0 \\implies x_1+x_2 = -\\frac{b}{a},\\ x_1x_2 = \\frac{c}{a}`, description: '一元二次方程根与系数的关系', scenario: '已知方程求根的和与积', tags: ['二次方程', '根', '系数'], modulePath: '/symbolic', moduleTab: '多项式' },
      { id: 'alg-8', name: '求根公式', latex: `x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}`, description: '一元二次方程的通解公式', scenario: '解一元二次方程', tags: ['二次方程', '求根', '判别式'], modulePath: '/symbolic', moduleTab: '方程求解' },
      { id: 'alg-9', name: '判别式', latex: `\\Delta = b^2 - 4ac`, description: 'Δ>0 两不同实根，Δ=0 重根，Δ<0 无实根', scenario: '判断二次方程根的个数', tags: ['二次方程', '判别式', '根'], modulePath: '/symbolic', moduleTab: '多项式' },
      { id: 'alg-10', name: '三元和平方', latex: `(a+b+c)^2 = a^2+b^2+c^2+2ab+2bc+2ca`, description: '三数和的平方展开', scenario: '展开、对称式', tags: ['展开', '平方', '对称'], modulePath: '/symbolic' },
      { id: 'alg-11', name: 'a³+b³+c³-3abc', latex: `a^3+b^3+c^3-3abc = (a+b+c)(a^2+b^2+c^2-ab-bc-ca)`, description: '三元对称式因式分解', scenario: '因式分解、对称多项式', tags: ['因式分解', '对称式'], modulePath: '/symbolic' },
      { id: 'alg-12', name: '均值不等式', latex: `\\frac{a+b}{2} \\geq \\sqrt{ab}\\quad (a,b>0)`, description: '算术平均 ≥ 几何平均，等号当且仅当 a=b', scenario: '求最值、不等式证明', tags: ['不等式', '均值', '最值'], modulePath: '/competition' },
    ],
  },

  // ===== 2. 三角 =====
  {
    id: 'trigonometry',
    name: '三角',
    icon: 'Activity',
    description: '基本恒等式、和差角、倍角半角、积化和差',
    items: [
      { id: 'tri-1', name: '基本恒等式', latex: `\\sin^2 x + \\cos^2 x = 1`, description: '同角三角函数的平方关系', scenario: '化简、证明', tags: ['恒等式', 'sin', 'cos'], modulePath: '/calculator' },
      { id: 'tri-2', name: '商的关系', latex: `\\tan x = \\frac{\\sin x}{\\cos x}`, description: '正切等于正弦除以余弦', scenario: '化简', tags: ['tan', 'sin', 'cos'], modulePath: '/calculator' },
      { id: 'tri-3', name: '正弦和角', latex: `\\sin(\\alpha+\\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta`, description: '两角和的正弦公式', scenario: '展开、化简', tags: ['和角', 'sin'], modulePath: '/calculator' },
      { id: 'tri-4', name: '余弦和角', latex: `\\cos(\\alpha+\\beta) = \\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta`, description: '两角和的余弦公式', scenario: '展开、化简', tags: ['和角', 'cos'], modulePath: '/calculator' },
      { id: 'tri-5', name: '二倍角正弦', latex: `\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha`, description: '二倍角的正弦公式', scenario: '展开、化简', tags: ['倍角', 'sin'], modulePath: '/calculator' },
      { id: 'tri-6', name: '二倍角余弦', latex: `\\cos 2\\alpha = \\cos^2\\alpha - \\sin^2\\alpha = 2\\cos^2\\alpha - 1 = 1 - 2\\sin^2\\alpha`, description: '二倍角的余弦公式三种形式', scenario: '展开、降幂', tags: ['倍角', 'cos'], modulePath: '/calculator' },
      { id: 'tri-7', name: '正弦定理', latex: `\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R`, description: '三角形边角关系，R 为外接圆半径', scenario: '解三角形', tags: ['三角形', 'sin', '外接圆'], modulePath: '/calculator' },
      { id: 'tri-8', name: '余弦定理', latex: `c^2 = a^2 + b^2 - 2ab\\cos C`, description: '三角形中一边的平方等于另两边平方和减去两倍乘积乘夹角余弦', scenario: '解三角形、已知两边夹一角', tags: ['三角形', 'cos'], modulePath: '/calculator' },
      { id: 'tri-9', name: '正切和角', latex: `\\tan(\\alpha+\\beta) = \\frac{\\tan\\alpha+\\tan\\beta}{1-\\tan\\alpha\\tan\\beta}`, description: '两角和的正切公式', scenario: '展开、化简', tags: ['和角', 'tan'], modulePath: '/calculator' },
      { id: 'tri-10', name: '半角公式', latex: `\\sin\\frac{\\alpha}{2} = \\pm\\sqrt{\\frac{1-\\cos\\alpha}{2}}`, description: '正弦半角公式，符号由角所在象限决定', scenario: '降幂、半角计算', tags: ['半角', 'sin'], modulePath: '/calculator' },
      { id: 'tri-11', name: '积化和差', latex: `\\sin\\alpha\\cos\\beta = \\frac{1}{2}[\\sin(\\alpha+\\beta)+\\sin(\\alpha-\\beta)]`, description: '正弦乘余弦的积化和差', scenario: '化简、积分', tags: ['积化和差', 'sin', 'cos'], modulePath: '/calculator' },
      { id: 'tri-12', name: '和差化积', latex: `\\sin\\alpha+\\sin\\beta = 2\\sin\\frac{\\alpha+\\beta}{2}\\cos\\frac{\\alpha-\\beta}{2}`, description: '正弦加正弦的和差化积', scenario: '化简、证明', tags: ['和差化积', 'sin', 'cos'], modulePath: '/calculator' },
    ],
  },

  // ===== 3. 极限 =====
  {
    id: 'limits',
    name: '极限',
    icon: 'FunctionSquare',
    description: '重要极限、洛必达法则、连续性',
    items: [
      { id: 'lim-1', name: '重要极限 sinx/x', latex: `\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1`, description: '第一个重要极限，0/0 型', scenario: '求三角函数极限', tags: ['极限', 'sin', '重要极限'], modulePath: '/calculus', moduleTab: '极限' },
      { id: 'lim-2', name: '重要极限 e', latex: `\\lim_{x\\to\\infty}\\left(1+\\frac{1}{x}\\right)^x = e`, description: '第二个重要极限，1^∞ 型', scenario: '求指数型极限', tags: ['极限', 'e', '重要极限'], modulePath: '/calculus', moduleTab: '极限' },
      { id: 'lim-3', name: '洛必达法则', latex: `\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\lim_{x\\to a}\\frac{f'(x)}{g'(x)}`, description: '0/0 或 ∞/∞ 型极限，分子分母分别求导', scenario: '求不定式极限', tags: ['极限', '洛必达', '导数'], modulePath: '/calculus', moduleTab: '极限' },
      { id: 'lim-4', name: '夹逼准则', latex: `g(x)\\leq f(x)\\leq h(x)\\ \\text{且}\\ \\lim g=\\lim h=A \\implies \\lim f=A`, description: '夹逼定理/三明治定理', scenario: '证明极限存在', tags: ['极限', '夹逼', '准则'], modulePath: '/calculus', moduleTab: '极限' },
      { id: 'lim-5', name: '单调有界定理', latex: `\\text{单调有界数列必有极限}`, description: '单调递增有上界或单调递减有下界的数列收敛', scenario: '证明数列收敛', tags: ['极限', '数列', '收敛'], modulePath: '/calculus', moduleTab: '级数' },
      { id: 'lim-6', name: '等价无穷小替换', latex: `x\\to0:\\ \\sin x \\sim x,\\ \\tan x \\sim x,\\ e^x-1 \\sim x,\\ \\ln(1+x) \\sim x`, description: '常见等价无穷小，乘除可替换', scenario: '快速求极限', tags: ['极限', '无穷小', '等价'], modulePath: '/calculus', moduleTab: '极限' },
      { id: 'lim-7', name: '海涅定理', latex: `\\lim_{x\\to a}f(x)=A \\iff \\forall x_n\\to a:\\lim_{n\\to\\infty}f(x_n)=A`, description: '函数极限与数列极限的关系', scenario: '证明函数极限不存在', tags: ['极限', '数列', '海涅'], modulePath: '/calculus' },
      { id: 'lim-8', name: '连续的定义', latex: `\\lim_{x\\to x_0}f(x) = f(x_0)`, description: '函数在 x0 处连续的定义', scenario: '判断连续性', tags: ['连续', '极限'], modulePath: '/calculus' },
    ],
  },

  // ===== 4. 导数 =====
  {
    id: 'derivatives',
    name: '导数',
    icon: 'FunctionSquare',
    description: '基本求导公式、求导法则、高阶导数',
    items: [
      { id: 'der-1', name: '幂函数求导', latex: `(x^n)' = n \\cdot x^{n-1}`, description: '幂函数的导数公式', scenario: '基本求导', tags: ['导数', '幂函数'], modulePath: '/calculus', moduleTab: '导数' },
      { id: 'der-2', name: '指数函数求导', latex: `(e^x)' = e^x,\\quad (a^x)' = a^x\\ln a`, description: '指数函数的导数', scenario: '基本求导', tags: ['导数', '指数', 'e'], modulePath: '/calculus', moduleTab: '导数' },
      { id: 'der-3', name: '对数求导', latex: `(\\ln x)' = \\frac{1}{x},\\quad (\\log_a x)' = \\frac{1}{x\\ln a}`, description: '对数函数的导数', scenario: '基本求导', tags: ['导数', '对数'], modulePath: '/calculus', moduleTab: '导数' },
      { id: 'der-4', name: '正弦求导', latex: `(\\sin x)' = \\cos x`, description: '正弦函数的导数是余弦', scenario: '基本求导', tags: ['导数', 'sin', 'cos'], modulePath: '/calculus', moduleTab: '导数' },
      { id: 'der-5', name: '余弦求导', latex: `(\\cos x)' = -\\sin x`, description: '余弦函数的导数是负的正弦', scenario: '基本求导', tags: ['导数', 'cos', 'sin'], modulePath: '/calculus', moduleTab: '导数' },
      { id: 'der-6', name: '乘积求导法则', latex: `(uv)' = u'v + uv'`, description: '两个函数乘积的导数', scenario: '复合求导', tags: ['导数', '乘积法则'], modulePath: '/calculus', moduleTab: '导数' },
      { id: 'der-7', name: '商的求导法则', latex: `\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}`, description: '两个函数商的导数', scenario: '复合求导', tags: ['导数', '商法则'], modulePath: '/calculus', moduleTab: '导数' },
      { id: 'der-8', name: '链式法则', latex: `\\frac{d}{dx}f(g(x)) = f'(g(x)) \\cdot g'(x)`, description: '复合函数的求导法则', scenario: '复合求导', tags: ['导数', '链式法则', '复合'], modulePath: '/calculus', moduleTab: '导数' },
      { id: 'der-9', name: '莱布尼茨公式', latex: `(uv)^{(n)} = \\sum_{k=0}^n C_n^k u^{(k)}v^{(n-k)}`, description: '乘积的 n 阶导数', scenario: '高阶导数', tags: ['高阶导数', '乘积'], modulePath: '/calculus' },
      { id: 'der-10', name: '隐函数求导', latex: `F(x,y)=0 \\implies \\frac{dy}{dx} = -\\frac{F_x}{F_y}`, description: '隐函数求导公式', scenario: '隐函数求导', tags: ['隐函数', '偏导'], modulePath: '/multivariable' },
      { id: 'der-11', name: '参数方程求导', latex: `\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}`, description: '参数方程 x=x(t), y=y(t) 的一阶导数', scenario: '参数方程求导', tags: ['参数方程', '导数'], modulePath: '/calculus' },
      { id: 'der-12', name: '费马引理', latex: `f'(x_0)=0 \\impliedby \\text{在 }x_0\\text{ 取极值且可导}`, description: '可导极值点处导数为 0', scenario: '求极值、驻点', tags: ['极值', '驻点'], modulePath: '/calculus', moduleTab: '导数' },
    ],
  },

  // ===== 5. 积分 =====
  {
    id: 'integrals',
    name: '积分',
    icon: 'FunctionSquare',
    description: '基本积分公式、积分方法、定积分',
    items: [
      { id: 'int-1', name: '幂函数积分', latex: `\\int x^n dx = \\frac{x^{n+1}}{n+1} + C\\quad (n\\neq -1)`, description: '幂函数的不定积分', scenario: '基本积分', tags: ['积分', '幂函数'], modulePath: '/calculus', moduleTab: '积分' },
      { id: 'int-2', name: '指数积分', latex: `\\int e^x dx = e^x + C,\\quad \\int a^x dx = \\frac{a^x}{\\ln a} + C`, description: '指数函数的不定积分', scenario: '基本积分', tags: ['积分', '指数'], modulePath: '/calculus', moduleTab: '积分' },
      { id: 'int-3', name: '分部积分法', latex: `\\int u\\, dv = uv - \\int v\\, du`, description: '分部积分公式', scenario: '乘积的积分', tags: ['积分', '分部积分'], modulePath: '/calculus', moduleTab: '积分' },
      { id: 'int-4', name: '换元积分法', latex: `\\int f(g(x))g'(x)dx = \\int f(u)du\\quad (u=g(x))`, description: '第一类换元法', scenario: '复合函数积分', tags: ['积分', '换元'], modulePath: '/calculus', moduleTab: '积分' },
      { id: 'int-5', name: '牛顿-莱布尼茨公式', latex: `\\int_a^b f(x)dx = F(b) - F(a)`, description: '定积分等于原函数在上下限处的差值', scenario: '计算定积分', tags: ['积分', '定积分', '原函数'], modulePath: '/calculus', moduleTab: '积分' },
      { id: 'int-6', name: '积分中值定理', latex: `\\int_a^b f(x)dx = f(\\xi)(b-a)\\quad (\\xi\\in[a,b])`, description: '连续函数积分中值定理', scenario: '估计积分值', tags: ['积分', '中值定理'], modulePath: '/calculus' },
      { id: 'int-7', name: 'sin积分', latex: `\\int \\sin x dx = -\\cos x + C`, description: '正弦函数的积分', scenario: '基本积分', tags: ['积分', 'sin', 'cos'], modulePath: '/calculus', moduleTab: '积分' },
      { id: 'int-8', name: 'cos积分', latex: `\\int \\cos x dx = \\sin x + C`, description: '余弦函数的积分', scenario: '基本积分', tags: ['积分', 'cos', 'sin'], modulePath: '/calculus', moduleTab: '积分' },
      { id: 'int-9', name: '1/x积分', latex: `\\int \\frac{1}{x} dx = \\ln|x| + C`, description: '倒数函数的积分', scenario: '基本积分', tags: ['积分', '对数', '倒数'], modulePath: '/calculus', moduleTab: '积分' },
      { id: 'int-10', name: '华里士公式', latex: `\\int_0^{\\pi/2}\\sin^n xdx = \\int_0^{\\pi/2}\\cos^n xdx = \\begin{cases} \\frac{n-1}{n}\\cdot\\frac{n-3}{n-2}\\cdots\\frac{\\pi}{2}, & n\\text{ 为偶} \\\\ \\frac{n-1}{n}\\cdot\\frac{n-3}{n-2}\\cdots 1, & n\\text{ 为奇} \\end{cases}`, description: 'Wallis 公式，三角函数的 n 次幂积分', scenario: '定积分、三角函数', tags: ['积分', '三角函数', 'Wallis'], modulePath: '/calculus' },
      { id: 'int-11', name: '反常积分（无穷）', latex: `\\int_a^{+\\infty}f(x)dx = \\lim_{b\\to+\\infty}\\int_a^b f(x)dx`, description: '无穷限反常积分', scenario: '无穷区间积分', tags: ['反常积分', '极限'], modulePath: '/calculus', moduleTab: '反常积分' },
      { id: 'int-12', name: '伽马函数积分', latex: `\\Gamma(s) = \\int_0^{+\\infty} x^{s-1}e^{-x}dx`, description: 'Gamma 函数的积分定义', scenario: '广义阶乘、概率分布', tags: ['Gamma', '反常积分'], modulePath: '/special' },
    ],
  },

  // ===== 6. 级数 =====
  {
    id: 'series',
    name: '级数',
    icon: 'Sigma',
    description: '级数收敛判别、幂级数、泰勒展开',
    items: [
      { id: 'ser-1', name: '等比级数', latex: `\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r}\\quad (|r|<1)`, description: '几何级数的和，|r|<1 收敛', scenario: '级数求和', tags: ['等比级数', '收敛', '和'], modulePath: '/calculus', moduleTab: '级数' },
      { id: 'ser-2', name: '调和级数', latex: `\\sum_{n=1}^{\\infty}\\frac{1}{n}\\ \\text{发散}`, description: '调和级数发散到无穷大', scenario: '发散级数', tags: ['调和级数', '发散'], modulePath: '/calculus', moduleTab: '级数' },
      { id: 'ser-3', name: 'p级数判别', latex: `\\sum_{n=1}^{\\infty}\\frac{1}{n^p}:\\ p>1\\text{ 收敛, }p\\leq1\\text{ 发散}`, description: 'p-级数的敛散性', scenario: '判别敛散性', tags: ['p级数', '收敛', '发散'], modulePath: '/calculus', moduleTab: '级数' },
      { id: 'ser-4', name: '比值判别法', latex: `\\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right| = \\rho:\\ \\rho<1\\text{ 收敛, }\\rho>1\\text{ 发散}`, description: "达朗贝尔判别法", scenario: '判别级数敛散性', tags: ['比值', '达朗贝尔', '收敛'], modulePath: '/calculus', moduleTab: '级数' },
      { id: 'ser-5', name: '根值判别法', latex: `\\lim_{n\\to\\infty}\\sqrt[n]{|a_n|} = \\rho:\\ \\rho<1\\text{ 收敛, }\\rho>1\\text{ 发散}`, description: '柯西根值判别法', scenario: '判别级数敛散性', tags: ['根值', '柯西', '收敛'], modulePath: '/calculus', moduleTab: '级数' },
      { id: 'ser-6', name: '积分判别法', latex: `\\sum_{n=1}^{\\infty}f(n) \\text{ 与 } \\int_1^{\\infty}f(x)dx \\text{ 同敛散}`, description: 'f 非负递减时，级数与反常积分同敛散', scenario: '判别正项级数', tags: ['积分判别', '正项级数'], modulePath: '/calculus', moduleTab: '级数' },
      { id: 'ser-7', name: '莱布尼茨判别法', latex: `\\sum(-1)^{n-1}u_n:\\ u_n\\downarrow0 \\implies \\text{收敛}`, description: '交错级数收敛判别法', scenario: '判别交错级数', tags: ['交错级数', '莱布尼茨'], modulePath: '/calculus', moduleTab: '级数' },
      { id: 'ser-8', name: '泰勒公式', latex: `f(x) = \\sum_{n=0}^{\\infty}\\frac{f^{(n)}(x_0)}{n!}(x-x_0)^n`, description: '函数的泰勒级数展开', scenario: '函数展开、近似计算', tags: ['泰勒', '展开', '幂级数'], modulePath: '/calculus', moduleTab: '泰勒展开' },
      { id: 'ser-9', name: 'e^x 展开', latex: `e^x = \\sum_{n=0}^{\\infty}\\frac{x^n}{n!}\\quad (x\\in\\mathbb{R})`, description: '指数函数的麦克劳林展开', scenario: '级数展开', tags: ['泰勒', 'e', '麦克劳林'], modulePath: '/calculus', moduleTab: '泰勒展开' },
      { id: 'ser-10', name: 'sinx 展开', latex: `\\sin x = \\sum_{n=0}^{\\infty}(-1)^n\\frac{x^{2n+1}}{(2n+1)!}`, description: '正弦函数的幂级数展开', scenario: '级数展开', tags: ['泰勒', 'sin'], modulePath: '/calculus', moduleTab: '泰勒展开' },
      { id: 'ser-11', name: '收敛半径', latex: `R = \\lim_{n\\to\\infty}\\left|\\frac{a_n}{a_{n+1}}\\right|`, description: '幂级数的收敛半径公式', scenario: '求幂级数收敛域', tags: ['幂级数', '收敛半径'], modulePath: '/calculus', moduleTab: '级数' },
      { id: 'ser-12', name: '傅里叶级数', latex: `f(x) \\sim \\frac{a_0}{2}+\\sum_{n=1}^{\\infty}(a_n\\cos nx + b_n\\sin nx)`, description: '周期函数的傅里叶级数展开', scenario: '周期函数展开', tags: ['傅里叶', '三角级数'], modulePath: '/fourier' },
    ],
  },

  // ===== 7. 线性代数 =====
  {
    id: 'linear-algebra',
    name: '线性代数',
    icon: 'Grid3x3',
    description: '行列式、矩阵、特征值、向量空间',
    items: [
      { id: 'la-1', name: '2阶行列式', latex: `\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc`, description: '二阶行列式的计算公式', scenario: '求2×2矩阵行列式', tags: ['行列式', '2阶'], modulePath: '/linear-algebra' },
      { id: 'la-2', name: '3阶行列式', latex: `\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix} = a(ei-fh) - b(di-fg) + c(dh-eg)`, description: '三阶行列式按第一行展开', scenario: '求3×3矩阵行列式', tags: ['行列式', '3阶'], modulePath: '/linear-algebra' },
      { id: 'la-3', name: '克莱姆法则', latex: `x_i = \\frac{D_i}{D}\\quad (D\\neq 0)`, description: '用行列式解线性方程组，D为系数行列式，D_i为替换列', scenario: '解n元线性方程组', tags: ['方程组', '行列式'], modulePath: '/linear-algebra', moduleTab: '方程组' },
      { id: 'la-4', name: '逆矩阵公式', latex: `A^{-1} = \\frac{1}{|A|}A^*\\quad (|A|\\neq 0)`, description: '伴随矩阵法求逆，A* 为伴随矩阵', scenario: '求方阵的逆', tags: ['逆矩阵', '伴随矩阵', '行列式'], modulePath: '/linear-algebra', moduleTab: '矩阵运算' },
      { id: 'la-5', name: '特征方程', latex: `|A - \\lambda I| = 0`, description: '特征值 λ 满足的方程，I 为单位矩阵', scenario: '求特征值', tags: ['特征值', '特征方程'], modulePath: '/linear-algebra', moduleTab: '特征值' },
      { id: 'la-6', name: '施密特正交化', latex: `b_1=a_1,\\ b_2=a_2-\\frac{<a_2,b_1>}{<b_1,b_1>}b_1,\\ \\cdots`, description: '将一组线性无关向量正交化', scenario: '正交化、QR分解', tags: ['正交化', '向量'], modulePath: '/linear-algebra', moduleTab: '向量空间' },
      { id: 'la-7', name: '迹的定义', latex: `\\text{tr}(A) = \\sum_{i=1}^n a_{ii}`, description: '方阵的迹等于主对角线元素之和', scenario: '矩阵分析', tags: ['迹', '矩阵'], modulePath: '/linear-algebra', moduleTab: '矩阵运算' },
      { id: 'la-8', name: '秩-零度定理', latex: `\\text{rank}(A) + \\text{nullity}(A) = n`, description: 'm×n 矩阵的秩加零空间维数等于 n', scenario: '线性变换维数关系', tags: ['秩', '零空间'], modulePath: '/linear-algebra', moduleTab: '向量空间' },
      { id: 'la-9', name: '凯莱-哈密顿定理', latex: `p_A(A) = 0`, description: '方阵满足其自身的特征方程', scenario: '矩阵幂、逆矩阵计算', tags: ['特征多项式', '定理'], modulePath: '/linear-algebra' },
      { id: 'la-10', name: 'SVD分解', latex: `A = U\\Sigma V^T`, description: '矩阵的奇异值分解，U,V正交，Σ对角', scenario: '降维、伪逆、推荐系统', tags: ['奇异值', 'SVD', '分解'], modulePath: '/linear-algebra', moduleTab: 'SVD' },
      { id: 'la-11', name: '约当标准形', latex: `A = PJP^{-1}`, description: '复矩阵相似于约当标准形 J', scenario: '矩阵幂、线性递推', tags: ['约当', '相似', '特征值'], modulePath: '/linear-algebra', moduleTab: '约当标准形' },
      { id: 'la-12', name: '格拉姆-施密特行列式', latex: `G(v_1,\\cdots,v_n) = \\det(\\langle v_i, v_j \\rangle)`, description: 'Gram 行列式等于平行多面体体积的平方', scenario: '体积、线性无关性', tags: ['Gram', '行列式', '体积'], modulePath: '/linear-algebra' },
    ],
  },

  // ===== 8. 概率统计 =====
  {
    id: 'probability',
    name: '概率统计',
    icon: 'BarChart3',
    description: '期望、方差、常见分布公式',
    items: [
      { id: 'prob-1', name: '期望定义 (离散)', latex: `E(X) = \\sum_{i} x_i \\cdot p_i`, description: '离散型随机变量的数学期望', scenario: '计算期望', tags: ['期望', '离散'], modulePath: '/probability', moduleTab: '概率分布' },
      { id: 'prob-2', name: '方差定义', latex: `Var(X) = E[(X-E(X))^2] = E(X^2) - [E(X)]^2`, description: '方差等于平方的期望减期望的平方', scenario: '计算方差', tags: ['方差', '期望'], modulePath: '/probability', moduleTab: '概率分布' },
      { id: 'prob-3', name: '二项分布', latex: `P(X=k) = C(n,k) \\cdot p^k \\cdot (1-p)^{n-k}`, description: 'n 次独立试验成功 k 次的概率', scenario: '伯努利试验', tags: ['二项分布', '分布'], modulePath: '/probability', moduleTab: '概率分布' },
      { id: 'prob-4', name: '泊松分布', latex: `P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}`, description: '单位时间内随机事件发生 k 次的概率', scenario: '稀有事件、排队论', tags: ['泊松分布', '分布'], modulePath: '/probability', moduleTab: '概率分布' },
      { id: 'prob-5', name: '正态分布', latex: `f(x) = \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}`, description: '均值μ 方差σ² 的正态分布概率密度', scenario: '连续分布、中心极限定理', tags: ['正态分布', '连续分布'], modulePath: '/probability', moduleTab: '概率分布' },
      { id: 'prob-6', name: '贝叶斯公式', latex: `P(A|B) = \\frac{P(B|A)P(A)}{P(B)}`, description: '条件概率的贝叶斯定理', scenario: '后验概率、统计推断', tags: ['条件概率', '贝叶斯'], modulePath: '/probability' },
      { id: 'prob-7', name: '全概率公式', latex: `P(B) = \\sum_i P(A_i)P(B|A_i)`, description: '互斥完备事件组下的全概率', scenario: '复杂事件概率分解', tags: ['全概率', '条件概率'], modulePath: '/probability' },
      { id: 'prob-8', name: '中心极限定理', latex: `\\frac{\\sum X_i - n\\mu}{\\sqrt{n}\\sigma} \\to N(0,1)`, description: '独立同分布随机变量和趋于正态分布', scenario: '大样本统计推断', tags: ['中心极限', '正态分布'], modulePath: '/probability', moduleTab: '中心极限定理' },
      { id: 'prob-9', name: '切比雪夫不等式', latex: `P(|X-\\mu|\\geq\\varepsilon) \\leq \\frac{\\sigma^2}{\\varepsilon^2}`, description: '随机变量偏离期望的概率上界', scenario: '估计概率、证明大数定律', tags: ['不等式', '方差'], modulePath: '/probability' },
      { id: 'prob-10', name: '协方差定义', latex: `Cov(X,Y) = E(XY) - E(X)E(Y)`, description: '两个随机变量的协方差', scenario: '相关性度量', tags: ['协方差', '期望'], modulePath: '/probability' },
      { id: 'prob-11', name: '相关系数', latex: `\\rho_{XY} = \\frac{Cov(X,Y)}{\\sqrt{Var(X)}\\sqrt{Var(Y)}}`, description: 'Pearson 相关系数，|ρ|≤1', scenario: '线性相关性', tags: ['相关系数', '协方差'], modulePath: '/probability' },
      { id: 'prob-12', name: '矩母函数', latex: `M_X(t) = E(e^{tX})`, description: '矩母函数，n 阶矩等于 M^(n)(0)', scenario: '求矩、分布识别', tags: ['矩母函数', '期望'], modulePath: '/probability', moduleTab: '矩母函数' },
      { id: 'prob-13', name: '古典概型', latex: `P(A) = \\frac{m}{n} = \\frac{\\text{事件A包含的基本事件数}}{\\text{基本事件总数}}`, description: '每个基本事件等可能发生的概率模型', scenario: '掷骰子、摸球、排列组合题', tags: ['古典概型', '基本事件'], modulePath: '/practice', moduleTab: '古典概型' },
      { id: 'prob-14', name: '条件概率', latex: `P(A|B) = \\frac{P(AB)}{P(B)}\\quad(P(B)>0)`, description: '已知 B 发生时 A 发生的概率', scenario: '条件概率计算', tags: ['条件概率'], modulePath: '/practice', moduleTab: '古典概型' },
      { id: 'prob-15', name: '互斥事件加法', latex: `P(A \\cup B) = P(A) + P(B)\\quad(A,B\\text{ 互斥})`, description: '互斥事件和的概率等于概率和', scenario: '互斥事件概率', tags: ['互斥', '加法公式'], modulePath: '/practice', moduleTab: '古典概型' },
      { id: 'prob-16', name: '对立事件', latex: `P(\overline{A}) = 1 - P(A)`, description: 'A 的对立事件概率等于 1 减 A 的概率', scenario: '正难则反、补集思想', tags: ['对立事件', '补集'], modulePath: '/practice', moduleTab: '古典概型' },
      { id: 'prob-17', name: '二项分布期望方差', latex: `X \sim B(n,p) \implies E(X)=np,\ D(X)=np(1-p)`, description: '二项分布的期望与方差公式', scenario: '二项分布数字特征', tags: ['二项分布', '期望', '方差'], modulePath: '/practice', moduleTab: '随机变量与统计' },
      { id: 'prob-18', name: '标准差', latex: `\\sigma = \\sqrt{D(X)} = \\sqrt{\\frac{1}{n}\\sum_{i=1}^n (x_i - \\bar{x})^2}`, description: '方差的算术平方根，与原数据单位一致', scenario: '数据离散程度度量', tags: ['标准差', '统计'], modulePath: '/practice', moduleTab: '随机变量与统计' },
    ],
  },

  // ===== 9. 数论 =====
  {
    id: 'number-theory',
    name: '数论',
    icon: 'Hash',
    description: '素数、同余、数论函数、不定方程',
    items: [
      { id: 'nt-1', name: '欧几里得算法', latex: `\\gcd(a,b) = \\gcd(b, a \\bmod b)`, description: '辗转相除法求最大公约数', scenario: '求 gcd', tags: ['gcd', '欧几里得'], modulePath: '/number-theory', moduleTab: 'gcd/lcm' },
      { id: 'nt-2', name: '贝祖定理', latex: `\\exists x,y:\\ ax+by = \\gcd(a,b)`, description: 'gcd 是 a,b 的最小正整数线性组合', scenario: '线性丢番图方程', tags: ['贝祖', '线性组合'], modulePath: '/number-theory' },
      { id: 'nt-3', name: '欧拉函数', latex: `\\phi(n) = n\\prod_{p|n}\\left(1-\\frac{1}{p}\\right)`, description: '1~n 中与 n 互素的数的个数', scenario: '互素计数', tags: ['欧拉函数', '互素'], modulePath: '/number-theory', moduleTab: '欧拉函数' },
      { id: 'nt-4', name: '费马小定理', latex: `a^{p-1} \\equiv 1 \\pmod p\\quad (p\\nmid a)`, description: 'p 为素数时的同余性质', scenario: '模幂、素性检测', tags: ['费马', '同余', '素数'], modulePath: '/number-theory' },
      { id: 'nt-5', name: '欧拉定理', latex: `a^{\\phi(m)} \\equiv 1 \\pmod m\\quad (\\gcd(a,m)=1)`, description: '费马小定理的推广', scenario: '模幂化简', tags: ['欧拉', '同余'], modulePath: '/number-theory' },
      { id: 'nt-6', name: '中国剩余定理', latex: `x \\equiv a_i \\pmod{m_i} \\implies x \\text{ 唯一模 } M=\\prod m_i`, description: '互素模数下同余方程组有唯一解', scenario: '解同余方程组', tags: ['中国剩余', '同余方程组'], modulePath: '/number-theory', moduleTab: '模运算' },
      { id: 'nt-7', name: '威尔逊定理', latex: `(p-1)! \\equiv -1 \\pmod p \\iff p\\text{ 是素数}`, description: '阶乘与素数的关系', scenario: '素性判定', tags: ['威尔逊', '阶乘', '素数'], modulePath: '/number-theory' },
      { id: 'nt-8', name: '素数定理', latex: `\\pi(x) \\sim \\frac{x}{\\ln x}`, description: '不超过 x 的素数个数渐近公式', scenario: '估计素数密度', tags: ['素数', '渐近'], modulePath: '/number-theory' },
      { id: 'nt-9', name: '勒让德符号', latex: `\\left(\\frac{a}{p}\\right) = a^{\\frac{p-1}{2}} \\pmod p`, description: 'a 是否为模 p 二次剩余的符号', scenario: '二次剩余', tags: ['二次剩余', '勒让德'], modulePath: '/number-theory', moduleTab: '二次互反律' },
      { id: 'nt-10', name: '二次互反律', latex: `\\left(\\frac{p}{q}\\right)\\left(\\frac{q}{p}\\right) = (-1)^{\\frac{p-1}{2}\\cdot\\frac{q-1}{2}}`, description: '奇素数勒让德符号的互反关系', scenario: '计算二次剩余', tags: ['二次互反', '勒让德'], modulePath: '/number-theory', moduleTab: '二次互反律' },
      { id: 'nt-11', name: '连分数展开', latex: `x = a_0 + \\frac{1}{a_1 + \\frac{1}{a_2 + \\frac{1}{\\ddots}}}`, description: '实数的简单连分数表示', scenario: '有理数逼近、丢番图逼近', tags: ['连分数', '逼近'], modulePath: '/number-theory', moduleTab: '连分数' },
      { id: 'nt-12', name: '莫比乌斯函数', latex: `\\mu(n) = \\begin{cases} 1, & n=1 \\\\ 0, & n\\text{ 有平方因子} \\\\ (-1)^r, & n\\text{ 有 }r\\text{ 个不同素因子} \\end{cases}`, description: '莫比乌斯反演的核心函数', scenario: '数论变换、反演', tags: ['莫比乌斯', '反演'], modulePath: '/number-theory' },
    ],
  },

  // ===== 10. 微分方程 =====
  {
    id: 'ode',
    name: '微分方程',
    icon: 'GitBranch',
    description: '一阶ODE、二阶ODE、拉普拉斯变换',
    items: [
      { id: 'ode-1', name: '可分离变量', latex: `\\frac{dy}{dx}=f(x)g(y) \\implies \\int\\frac{dy}{g(y)}=\\int f(x)dx`, description: '可分离变量方程的求解', scenario: '一阶ODE', tags: ['分离变量', '一阶'], modulePath: '/ode', moduleTab: '一阶方程' },
      { id: 'ode-2', name: '一阶线性方程', latex: `y'+P(x)y=Q(x) \\implies y = e^{-\\int Pdx}\\left(\\int Q e^{\\int Pdx}dx+C\\right)`, description: '常数变易法/积分因子法', scenario: '一阶线性ODE', tags: ['线性', '积分因子'], modulePath: '/ode', moduleTab: '一阶方程' },
      { id: 'ode-3', name: '二阶常系数齐次', latex: `y''+py'+qy=0:\\ \\text{特征方程 } r^2+pr+q=0`, description: '通过特征方程求通解', scenario: '二阶ODE', tags: ['二阶', '特征方程'], modulePath: '/ode', moduleTab: '二阶方程' },
      { id: 'ode-4', name: '欧拉公式(ODE)', latex: `e^{ix} = \\cos x + i\\sin x`, description: '复特征根对应的实值解', scenario: '复特征根', tags: ['欧拉', '复数'], modulePath: '/ode' },
      { id: 'ode-5', name: '拉普拉斯变换定义', latex: `L[f(t)] = F(s) = \\int_0^{+\\infty} e^{-st}f(t)dt`, description: '拉普拉斯变换的定义', scenario: '解微分方程', tags: ['拉普拉斯', '积分变换'], modulePath: '/ode', moduleTab: '拉普拉斯变换' },
      { id: 'ode-6', name: '拉普拉斯微分性质', latex: `L[f'(t)] = sF(s) - f(0)`, description: '导数的拉普拉斯变换', scenario: '化ODE为代数方程', tags: ['拉普拉斯', '导数'], modulePath: '/ode', moduleTab: '拉普拉斯变换' },
      { id: 'ode-7', name: '龙格-库塔法', latex: `y_{n+1}=y_n+\\frac{1}{6}(k_1+2k_2+2k_3+k_4)`, description: '四阶 RK 方法，高精度数值求解', scenario: 'ODE数值解', tags: ['RK4', '数值方法'], modulePath: '/ode', moduleTab: '数值方法' },
      { id: 'ode-8', name: '皮卡存在唯一性', latex: `\\text{Lipschitz条件} \\implies \\text{解存在且唯一}`, description: '一阶ODE初值问题解的存在唯一性', scenario: '理论分析', tags: ['存在性', '唯一性'], modulePath: '/ode' },
      { id: 'ode-9', name: '伯努利方程', latex: `y'+P(x)y=Q(x)y^n \\xrightarrow{z=y^{1-n}} \\text{ 线性方程}`, description: '可转化为线性方程的非线性方程', scenario: '非线性ODE', tags: ['伯努利', '变量替换'], modulePath: '/ode', moduleTab: '一阶方程' },
      { id: 'ode-10', name: 'Wronskian 行列式', latex: `W(y_1,y_2) = y_1y_2' - y_1'y_2`, description: '判断两个解是否线性无关', scenario: '解的结构', tags: ['Wronskian', '线性无关'], modulePath: '/ode' },
      { id: 'ode-11', name: '常数变易法', latex: `y_p = u_1(x)y_1(x) + u_2(x)y_2(x)`, description: '非齐次方程求特解的一般方法', scenario: '非齐次ODE', tags: ['常数变易', '特解'], modulePath: '/ode', moduleTab: '二阶方程' },
      { id: 'ode-12', name: '勒让德方程', latex: `(1-x^2)y''-2xy'+n(n+1)y=0`, description: '勒让德微分方程，多项式解', scenario: '球坐标分离变量', tags: ['勒让德', '特殊函数'], modulePath: '/ode', moduleTab: '幂级数解法' },
    ],
  },

  // ===== 11. 傅里叶分析 =====
  {
    id: 'fourier',
    name: '傅里叶分析',
    icon: 'Activity',
    description: '傅里叶级数、傅里叶变换、采样定理',
    items: [
      { id: 'fou-1', name: '傅里叶级数', latex: `f(x) \\sim \\frac{a_0}{2}+\\sum_{n=1}^{\\infty}(a_n\\cos nx + b_n\\sin nx)`, description: '周期 2π 函数的三角级数展开', scenario: '周期函数分解', tags: ['傅里叶级数', '三角级数'], modulePath: '/fourier', moduleTab: '傅里叶级数' },
      { id: 'fou-2', name: '傅里叶系数 an', latex: `a_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\cos nx\\,dx`, description: '余弦系数', scenario: '计算系数', tags: ['系数', 'cos'], modulePath: '/fourier', moduleTab: '傅里叶级数' },
      { id: 'fou-3', name: '傅里叶系数 bn', latex: `b_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\sin nx\\,dx`, description: '正弦系数', scenario: '计算系数', tags: ['系数', 'sin'], modulePath: '/fourier', moduleTab: '傅里叶级数' },
      { id: 'fou-4', name: '傅里叶变换', latex: `F(\\omega) = \\int_{-\\infty}^{\\infty} f(t)e^{-i\\omega t}dt`, description: '连续傅里叶变换定义', scenario: '频谱分析', tags: ['傅里叶变换', '频谱'], modulePath: '/fourier', moduleTab: '傅里叶变换' },
      { id: 'fou-5', name: '帕塞瓦尔恒等式', latex: `\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}|f(x)|^2dx = \\frac{a_0^2}{4}+\\sum_{n=1}^{\\infty}(a_n^2+b_n^2)`, description: '能量守恒：时域能量=频域能量', scenario: '能量计算', tags: ['帕塞瓦尔', '能量'], modulePath: '/fourier' },
      { id: 'fou-6', name: '狄利克雷条件', latex: `f\\text{ 分段单调+有限间断点} \\implies \\text{傅里叶级数收敛}`, description: '傅里叶级数收敛的充分条件', scenario: '收敛性', tags: ['收敛', '狄利克雷'], modulePath: '/fourier' },
      { id: 'fou-7', name: '采样定理', latex: `f_s > 2f_{\\max} \\implies \\text{ 可完全重建}`, description: '奈奎斯特采样定理', scenario: '数字信号处理', tags: ['采样', '奈奎斯特'], modulePath: '/fourier', moduleTab: '采样定理' },
      { id: 'fou-8', name: '离散傅里叶变换', latex: `X_k = \\sum_{n=0}^{N-1} x_n \\cdot e^{-i2\\pi kn/N}`, description: 'DFT 的定义', scenario: '数字信号处理', tags: ['DFT', '离散'], modulePath: '/fourier', moduleTab: 'DFT' },
    ],
  },

  // ===== 12. 复变函数 =====
  {
    id: 'complex',
    name: '复变函数',
    icon: 'PlusSquare',
    description: '复数运算、欧拉公式、留数',
    items: [
      { id: 'cmp-1', name: '欧拉公式', latex: `e^{i\\theta} = \\cos\\theta + i\\sin\\theta`, description: '复指数函数与三角函数的关系', scenario: '复数表示、傅里叶分析', tags: ['欧拉', '指数', '三角函数'], modulePath: '/complex' },
      { id: 'cmp-2', name: '复数模', latex: `|z| = \\sqrt{a^2 + b^2}\\quad (z=a+bi)`, description: '复数的模（绝对值）', scenario: '复数大小', tags: ['模', '绝对值'], modulePath: '/complex' },
      { id: 'cmp-3', name: '棣莫弗公式', latex: `(\\cos\\theta + i\\sin\\theta)^n = \\cos n\\theta + i\\sin n\\theta`, description: '复数的 n 次幂公式', scenario: '复数乘方、三角恒等式推导', tags: ['乘方', '三角'], modulePath: '/complex' },
      { id: 'cmp-4', name: '柯西积分公式', latex: `f(z_0) = \\frac{1}{2\\pi i}\\oint_C \\frac{f(z)}{z-z_0} dz`, description: '解析函数在围道内的值由边界值决定', scenario: '围道积分', tags: ['积分', '解析函数', '围道'], modulePath: '/complex' },
      { id: 'cmp-5', name: '留数定理', latex: `\\oint_C f(z)dz = 2\\pi i \\sum_{k} \\text{Res}(f, z_k)`, description: '围道积分等于内部各奇点留数之和', scenario: '计算实积分、围道积分', tags: ['留数', '积分', '奇点'], modulePath: '/complex' },
      { id: 'cmp-6', name: '柯西-黎曼方程', latex: `u_x = v_y,\\quad u_y = -v_x`, description: '函数解析的必要条件', scenario: '判断解析性', tags: ['解析', 'CR方程'], modulePath: '/complex' },
      { id: 'cmp-7', name: '黎曼映射定理', latex: `\\text{任何单连通真子集共形映射到单位圆盘}`, description: '单连通区域的共形等价性', scenario: '共形映射', tags: ['共形映射', '黎曼'], modulePath: '/complex' },
      { id: 'cmp-8', name: 'n次根公式', latex: `\\sqrt[n]{z} = \\sqrt[n]{r}\\left(\\cos\\frac{\\theta+2k\\pi}{n}+i\\sin\\frac{\\theta+2k\\pi}{n}\\right)`, description: '复数开 n 次方有 n 个根', scenario: '复数开方', tags: ['根', '开方'], modulePath: '/complex', moduleTab: 'n次根' },
    ],
  },

  // ===== 13. 离散数学 =====
  {
    id: 'discrete',
    name: '离散数学',
    icon: 'ToggleLeft',
    description: '逻辑、集合、组合、图论',
    items: [
      { id: 'dis-1', name: '德摩根定律', latex: `\\neg(A\\land B) \\leftrightarrow \\neg A \\lor \\neg B`, description: '合取的否定等价于否定的析取', scenario: '逻辑化简', tags: ['德摩根', '逻辑'], modulePath: '/discrete', moduleTab: '逻辑运算' },
      { id: 'dis-2', name: '容斥原理', latex: `|A\\cup B| = |A|+|B|-|A\\cap B|`, description: '两个集合的容斥公式', scenario: '计数', tags: ['集合', '计数'], modulePath: '/discrete', moduleTab: '集合运算' },
      { id: 'dis-3', name: '鸽巢原理', latex: `n+1\\text{ 个物品放入 }n\\text{ 个盒子} \\implies \\text{至少一个盒子有} \\geq2\\text{个}`, description: '鸽巢原理的基本形式', scenario: '存在性证明', tags: ['鸽巢', '组合'], modulePath: '/discrete' },
      { id: 'dis-4', name: '排列数', latex: `P(n,k) = \\frac{n!}{(n-k)!}`, description: '从 n 个中取 k 个的排列数', scenario: '有序选取', tags: ['排列', '阶乘'], modulePath: '/probability', moduleTab: '描述统计' },
      { id: 'dis-5', name: '组合数', latex: `C(n,k) = \\frac{n!}{k!(n-k)!}`, description: '从 n 个中取 k 个的组合数', scenario: '无序选取', tags: ['组合', '二项式'], modulePath: '/probability', moduleTab: '描述统计' },
      { id: 'dis-6', name: '欧拉握手定理', latex: `\\sum_{v}\\deg(v) = 2|E|`, description: '图中所有顶点度数和等于边数的两倍', scenario: '图论基本定理', tags: ['图论', '度数'], modulePath: '/discrete', moduleTab: '图论' },
      { id: 'dis-7', name: '树的边数', latex: `\\text{树 } T=(V,E):\\ |E| = |V| - 1`, description: '树的边数比顶点数少 1', scenario: '图论', tags: ['树', '图论'], modulePath: '/discrete', moduleTab: '图论' },
      { id: 'dis-8', name: '布尔吸收律', latex: `A \\lor (A \\land B) = A,\\quad A \\land (A \\lor B) = A`, description: '布尔代数的吸收律', scenario: '布尔化简', tags: ['布尔', '化简'], modulePath: '/discrete', moduleTab: '逻辑运算' },
      { id: 'dis-9', name: '卡特兰数', latex: `C_n = \\frac{1}{n+1}C(2n,n)`, description: '第 n 个卡特兰数', scenario: '括号匹配、二叉树、出栈序列', tags: ['卡特兰', '组合'], modulePath: '/discrete' },
      { id: 'dis-10', name: '递推关系特征根法', latex: `a_n = c_1r_1^n + c_2r_2^n\\quad (r_1\\neq r_2)`, description: '线性齐次递推的通解', scenario: '递推求解', tags: ['递推', '特征方程'], modulePath: '/discrete' },
    ],
  },

  // ===== 14. 微分几何 =====
  {
    id: 'diff-geo',
    name: '微分几何',
    icon: 'Globe',
    description: '曲率、弧长、曲面基本公式',
    items: [
      { id: 'dg-1', name: '平面曲线弧长', latex: `s = \\int_a^b \\sqrt{1 + [f'(x)]^2}\\, dx`, description: 'y = f(x) 的弧长公式', scenario: '计算曲线长度', tags: ['弧长', '曲线'], modulePath: '/calculus', moduleTab: '弧长与曲面' },
      { id: 'dg-2', name: '曲率公式', latex: `\\kappa = \\frac{|y''|}{(1+y'^2)^{3/2}}`, description: '平面曲线 y=f(x) 的曲率', scenario: '曲线弯曲程度', tags: ['曲率', '平面曲线'], modulePath: '/diff-geo' },
      { id: 'dg-3', name: '高斯绝妙定理', latex: `K = \\frac{LN - M^2}{EG - F^2}`, description: '曲面高斯曲率 K 由第一、第二基本形式系数决定，与嵌入方式无关', scenario: '曲面内蕴几何', tags: ['高斯曲率', '曲面'], modulePath: '/diff-geo' },
      { id: 'dg-4', name: '测地线方程', latex: `\\frac{d^2u^k}{dt^2} + \\Gamma^k_{ij}\\frac{du^i}{dt}\\frac{du^j}{dt} = 0`, description: '曲面上最短路径满足的微分方程，Γ 为克里斯托费尔符号', scenario: '最短路径、内蕴几何', tags: ['测地线', '克里斯托费尔'], modulePath: '/diff-geo' },
      { id: 'dg-5', name: '第一基本形式', latex: `I = Edu^2 + 2Fdudv + Gdv^2`, description: '曲面的第一基本形式（度量）', scenario: '曲面度量', tags: ['第一基本形式', '度量'], modulePath: '/diff-geo' },
      { id: 'dg-6', name: '第二基本形式', latex: `II = Ldu^2 + 2Mdudv +Ndv^2`, description: '曲面的第二基本形式（弯曲程度）', scenario: '曲面法向弯曲', tags: ['第二基本形式', '法曲率'], modulePath: '/diff-geo' },
      { id: 'dg-7', name: '高斯-博内定理', latex: `\\int_M K dA + \\int_{\\partial M}k_g ds = 2\\pi\\chi(M)`, description: '紧致曲面的总曲率与欧拉示性数的关系', scenario: '整体微分几何', tags: ['高斯-博内', '欧拉示性数'], modulePath: '/diff-geo' },
      { id: 'dg-8', name: '旋转曲面面积', latex: `S = 2\\pi\\int_a^b f(x)\\sqrt{1+[f'(x)]^2}dx`, description: '曲线绕 x 轴旋转的曲面面积', scenario: '曲面面积', tags: ['旋转', '面积'], modulePath: '/calculus', moduleTab: '弧长与曲面' },
    ],
  },

  // ===== 15. 竞赛不等式 =====
  {
    id: 'competition',
    name: '竞赛不等式',
    icon: 'Trophy',
    description: '均值不等式、柯西、排序、琴生等经典不等式',
    items: [
      { id: 'cmp-ineq-1', name: 'AM≥GM≥HM', latex: `\\frac{a_1+\\cdots+a_n}{n} \\geq \\sqrt[n]{a_1\\cdots a_n} \\geq \\frac{n}{\\frac{1}{a_1}+\\cdots+\\frac{1}{a_n}}`, description: '算术平均 ≥ 几何平均 ≥ 调和平均', scenario: '求最值、不等式证明', tags: ['均值', 'AM-GM'], modulePath: '/competition' },
      { id: 'cmp-ineq-2', name: '柯西不等式', latex: `(\\sum a_i^2)(\\sum b_i^2) \\geq (\\sum a_i b_i)^2`, description: '柯西-施瓦茨不等式', scenario: '不等式证明、最值', tags: ['柯西', '内积'], modulePath: '/competition' },
      { id: 'cmp-ineq-3', name: '排序不等式', latex: `\\text{逆序和} \\leq \\text{乱序和} \\leq \\text{顺序和}`, description: '排序原理', scenario: '不等式证明', tags: ['排序'], modulePath: '/competition' },
      { id: 'cmp-ineq-4', name: '琴生不等式', latex: `f(\\frac{\\sum x_i}{n}) \\leq \\frac{\\sum f(x_i)}{n}`, description: '凸函数的 Jensen 不等式', scenario: '均值不等式、概率期望', tags: ['琴生', '凸函数'], modulePath: '/competition' },
      { id: 'cmp-ineq-5', name: '赫尔德不等式', latex: `\\sum a_i b_i \\leq (\\sum a_i^p)^{1/p}(\\sum b_i^q)^{1/q}`, description: '柯西的推广，1/p+1/q=1', scenario: '积分不等式', tags: ['赫尔德', '推广'], modulePath: '/competition' },
      { id: 'cmp-ineq-6', name: '闵可夫斯基不等式', latex: `(\\sum(a_i+b_i)^p)^{1/p} \\leq (\\sum a_i^p)^{1/p}+(\\sum b_i^p)^{1/p}`, description: '三角不等式的推广', scenario: '距离空间', tags: ['闵可夫斯基', '三角不等式'], modulePath: '/competition' },
      { id: 'cmp-ineq-7', name: '伯努利不等式', latex: `(1+x)^n \\geq 1+nx\\quad (x>-1, n\\in\\mathbb{N})`, description: '简单而有用的不等式', scenario: '不等式证明、极限', tags: ['伯努利'], modulePath: '/competition' },
      { id: 'cmp-ineq-8', name: '切比雪夫不等式（排序）', latex: `a_i,b_i\\text{ 同序}:\\ \\frac{1}{n}\\sum a_i b_i \\geq \\frac{1}{n}\\sum a_i \\cdot \\frac{1}{n}\\sum b_i`, description: '同序乘积平均 ≥ 平均乘积', scenario: '不等式证明', tags: ['切比雪夫', '排序'], modulePath: '/competition' },
    ],
  },

  // ===== 16. 特殊函数 =====
  {
    id: 'special-functions',
    name: '特殊函数',
    icon: 'Sparkles',
    description: 'Gamma、Beta、Bessel 等特殊函数',
    items: [
      { id: 'sf-1', name: 'Gamma 函数', latex: `\\Gamma(z) = \\int_0^\\infty t^{z-1} e^{-t} dt`, description: '阶乘函数的解析延拓，Γ(n+1)=n! 对正整数成立', scenario: '广义阶乘、概率分布', tags: ['Gamma', '阶乘', '积分'], modulePath: '/special' },
      { id: 'sf-2', name: 'Beta 函数', latex: `B(p,q) = \\int_0^1 t^{p-1}(1-t)^{q-1}dt = \\frac{\\Gamma(p)\\Gamma(q)}{\\Gamma(p+q)}`, description: 'Beta 函数与 Gamma 函数的关系', scenario: '概率统计、积分变换', tags: ['Beta', 'Gamma'], modulePath: '/special' },
      { id: 'sf-3', name: '第一类贝塞尔函数', latex: `J_n(x) = \\sum_{k=0}^\\infty \\frac{(-1)^k}{k!(n+k)!}\\left(\\frac{x}{2}\\right)^{n+2k}`, description: 'n 阶第一类贝塞尔函数的级数展开', scenario: '圆柱坐标系波动方程解', tags: ['Bessel', '级数', '微分方程'], modulePath: '/special' },
      { id: 'sf-4', name: '勒让德多项式', latex: `P_n(x) = \\frac{1}{2^n n!}\\frac{d^n}{dx^n}(x^2-1)^n`, description: '勒让德多项式的罗德里格斯公式', scenario: '球坐标系、Legendre方程', tags: ['Legendre', '多项式', '正交'], modulePath: '/ode', moduleTab: '幂级数解法' },
      { id: 'sf-5', name: '误差函数', latex: `\\text{erf}(x) = \\frac{2}{\\sqrt{\\pi}}\\int_0^x e^{-t^2}dt`, description: '误差函数，正态分布 CDF 相关', scenario: '概率统计、热传导', tags: ['误差函数', '正态分布'], modulePath: '/probability' },
      { id: 'sf-6', name: '黎曼Zeta函数', latex: `\\zeta(s) = \\sum_{n=1}^{\\infty}\\frac{1}{n^s}`, description: '黎曼 Zeta 函数（Re(s)>1）', scenario: '数论、素数分布', tags: ['Zeta', '黎曼'], modulePath: '/number-theory' },
      { id: 'sf-7', name: '伽马函数倍乘公式', latex: `\\Gamma(2z) = \\frac{2^{2z-1}}{\\sqrt{\\pi}}\\Gamma(z)\\Gamma(z+\\frac{1}{2})`, description: '勒让德倍乘公式', scenario: 'Gamma 函数恒等式', tags: ['Gamma', '倍乘'], modulePath: '/special' },
      { id: 'sf-8', name: '艾里函数', latex: `\\text{Ai}(x) = \\frac{1}{\\pi}\\int_0^{\\infty}\\cos(\\frac{t^3}{3}+xt)dt`, description: '艾里函数，斯托克斯现象', scenario: '渐近分析、量子力学', tags: ['Airy', '渐近'], modulePath: '/special' },
    ],
  },

  // ===== 17. 解析几何 =====
  {
    id: 'analytic-geometry',
    name: '解析几何',
    icon: 'Grid3X3',
    description: '坐标几何、直线、圆与圆锥曲线公式',
    items: [
      { id: 'ag-1', name: '两点距离公式', latex: `|AB| = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}`, description: '平面直角坐标系中两点的距离', scenario: '求两点距离、线段长度', tags: ['距离', '坐标'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-2', name: '中点坐标公式', latex: `M\\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)`, description: '两点连线中点的坐标', scenario: '求中点、中线', tags: ['中点', '坐标'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-3', name: '直线点斜式', latex: `y - y_0 = k(x - x_0)`, description: '已知斜率 k 和一点 (x₀,y₀) 的直线方程', scenario: '已知一点和斜率求直线', tags: ['直线', '斜率'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-4', name: '直线斜截式', latex: `y = kx + b`, description: '斜率为 k，y 轴截距为 b 的直线方程', scenario: '已知斜率和截距', tags: ['直线', '截距'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-5', name: '直线一般式', latex: `Ax + By + C = 0`, description: '直线的一般形式，法向量为 (A,B)', scenario: '一般形式、法向量', tags: ['直线', '一般式'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-6', name: '点到直线距离', latex: `d = \\frac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}`, description: '点 (x₀,y₀) 到直线 Ax+By+C=0 的距离', scenario: '求点到直线距离', tags: ['距离', '直线'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-7', name: '两直线平行条件', latex: `l_1 \\parallel l_2 \\iff k_1 = k_2 \\text{ 且 } b_1 \\neq b_2`, description: '斜率相等且截距不等则平行', scenario: '判断两直线平行', tags: ['平行', '斜率'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-8', name: '两直线垂直条件', latex: `l_1 \perp l_2 \iff k_1 \cdot k_2 = -1`, description: '斜率乘积为 -1 则垂直', scenario: '判断两直线垂直', tags: ['垂直', '斜率'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-9', name: '圆的标准方程', latex: `(x-a)^2 + (y-b)^2 = r^2`, description: '圆心 (a,b)，半径 r 的圆', scenario: '已知圆心和半径', tags: ['圆', '标准方程'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-10', name: '圆的一般方程', latex: `x^2+y^2+Dx+Ey+F=0`, description: '圆的一般形式，D²+E²-4F>0', scenario: '一般式、配方求圆心', tags: ['圆', '一般式'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-11', name: '椭圆标准方程', latex: `\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1\\quad(a>b>0)`, description: '焦点在 x 轴上的椭圆，长轴 2a，短轴 2b', scenario: '椭圆方程与性质', tags: ['椭圆', '圆锥曲线'], modulePath: '/practice', moduleTab: '圆锥曲线' },
      { id: 'ag-12', name: '椭圆离心率', latex: `e = \\frac{c}{a},\\quad c^2 = a^2 - b^2`, description: '椭圆离心率 0<e<1，c 为焦距一半', scenario: '求椭圆离心率、焦点', tags: ['椭圆', '离心率'], modulePath: '/practice', moduleTab: '圆锥曲线' },
      { id: 'ag-13', name: '双曲线标准方程', latex: `\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1`, description: '焦点在 x 轴上的双曲线，实轴 2a', scenario: '双曲线方程与渐近线', tags: ['双曲线', '圆锥曲线'], modulePath: '/practice', moduleTab: '圆锥曲线' },
      { id: 'ag-14', name: '双曲线离心率', latex: `e = \\frac{c}{a},\\quad c^2 = a^2 + b^2`, description: '双曲线离心率 e>1', scenario: '求双曲线离心率', tags: ['双曲线', '离心率'], modulePath: '/practice', moduleTab: '圆锥曲线' },
      { id: 'ag-15', name: '抛物线标准方程', latex: `y^2 = 2px\quad(p>0)`, description: '开口向右的抛物线，焦点 (p/2, 0)，准线 x=-p/2', scenario: '抛物线焦点与准线', tags: ['抛物线', '圆锥曲线'], modulePath: '/practice', moduleTab: '圆锥曲线' },
      { id: 'ag-16', name: '直线与圆位置关系', latex: `d < r \\text{ 相交},\\ d = r \\text{ 相切},\\ d > r \\text{ 相离}`, description: '圆心到直线距离 d 与半径 r 的大小关系判定', scenario: '判断直线与圆相交/相切/相离', tags: ['圆', '直线', '位置关系'], modulePath: '/practice', moduleTab: '坐标几何' },
      { id: 'ag-17', name: '弦长公式', latex: `|AB| = \sqrt{1+k^2} \cdot |x_1-x_2|`, description: '直线与曲线相交的弦长，k 为斜率', scenario: '求弦长、圆锥曲线截线长', tags: ['弦长', '斜率'], modulePath: '/practice', moduleTab: '圆锥曲线' },
      { id: 'ag-18', name: '双曲线渐近线', latex: `y = \\pm\\frac{b}{a}x`, description: 'x²/a² - y²/b² = 1 的渐近线方程', scenario: '双曲线渐近线求法', tags: ['双曲线', '渐近线'], modulePath: '/practice', moduleTab: '圆锥曲线' },
    ],
  },
  {
    id: 'solid-geometry',
    name: '立体几何',
    icon: 'Box',
    description: '常见几何体的体积与表面积公式',
    items: [
      { id: 'sg-1', name: '长方体体积', latex: `V = abc`, description: '长 a 宽 b 高 c 的长方体体积', scenario: '求长方体体积', tags: ['长方体', '体积'], modulePath: '/practice', moduleTab: '立体几何' },
      { id: 'sg-2', name: '长方体表面积', latex: `S = 2(ab + bc + ca)`, description: '长方体六个面的总面积', scenario: '求长方体表面积', tags: ['长方体', '表面积'], modulePath: '/practice', moduleTab: '立体几何' },
      { id: 'sg-3', name: '正方体体积', latex: `V = a^3`, description: '棱长为 a 的正方体体积', scenario: '求正方体体积', tags: ['正方体', '体积'], modulePath: '/practice', moduleTab: '立体几何' },
      { id: 'sg-4', name: '正方体表面积', latex: `S = 6a^2`, description: '正方体六个面的总面积', scenario: '求正方体表面积', tags: ['正方体', '表面积'], modulePath: '/practice', moduleTab: '立体几何' },
      { id: 'sg-5', name: '球体积', latex: `V = \\frac{4}{3}\\pi r^3`, description: '半径为 r 的球的体积', scenario: '求球体积', tags: ['球', '体积'], modulePath: '/practice', moduleTab: '立体几何' },
      { id: 'sg-6', name: '球表面积', latex: `S = 4\pi r^2`, description: '半径为 r 的球的表面积', scenario: '求球表面积', tags: ['球', '表面积'], modulePath: '/practice', moduleTab: '立体几何' },
      { id: 'sg-7', name: '圆柱体积', latex: `V = \pi r^2 h`, description: '底面半径 r，高 h 的圆柱体积', scenario: '求圆柱体积', tags: ['圆柱', '体积'], modulePath: '/practice', moduleTab: '立体几何' },
      { id: 'sg-8', name: '圆柱表面积', latex: `S = 2\pi r^2 + 2\pi r h`, description: '两个底面 + 侧面的总面积', scenario: '求圆柱表面积', tags: ['圆柱', '表面积'], modulePath: '/practice', moduleTab: '立体几何' },
      { id: 'sg-9', name: '圆锥体积', latex: `V = \\frac{1}{3}\\pi r^2 h`, description: '底面半径 r，高 h 的圆锥体积', scenario: '求圆锥体积', tags: ['圆锥', '体积'], modulePath: '/practice', moduleTab: '立体几何' },
      { id: 'sg-10', name: '棱锥体积', latex: `V = \\frac{1}{3} S_{\\text{底}} \\cdot h`, description: '底面积 S，高 h 的棱锥体积', scenario: '求棱锥体积', tags: ['棱锥', '体积'], modulePath: '/practice', moduleTab: '立体几何' },
    ],
  },
  {
    id: 'competition-cheat',
    name: '竞赛速记',
    icon: 'Trophy',
    description: '竞赛高频公式、结论与技巧速查',
    items: [
      { id: 'cc-1', name: '加权AM-GM', latex: `\\frac{\\sum w_i a_i}{\\sum w_i} \\geq \\left(\\prod a_i^{w_i}\\right)^{1/\\sum w_i}`, description: '加权算术-几何均值不等式，w_i > 0', scenario: '带权最值问题', tags: ['均值不等式', '加权'], modulePath: '/competition' },
      { id: 'cc-2', name: '柯西不等式（内积形式）', latex: `(\\sum a_i b_i)^2 \\leq (\\sum a_i^2)(\\sum b_i^2)`, description: '等号当且仅当 a_i 与 b_i 成比例', scenario: '不等式证明、最值', tags: ['柯西', '内积'], modulePath: '/competition' },
      { id: 'cc-3', name: '柯西分式型(Titu引理)', latex: `\\sum \\frac{a_i^2}{b_i} \\geq \\frac{(\\sum a_i)^2}{\\sum b_i}`, description: '柯西的分式形式，也叫 Titu 引理 / 柯西求反', scenario: '分式不等式、分式最值', tags: ['柯西', 'Titu', '分式'], modulePath: '/competition' },
      { id: 'cc-4', name: '排序不等式', latex: `\\sum_{i=1}^n a_i b_{n+1-i} \\leq \\sum_{i=1}^n a_i c_i \\leq \\sum_{i=1}^n a_i b_i`, description: '逆序和 ≤ 乱序和 ≤ 顺序和（同序为大）', scenario: '对称不等式证明', tags: ['排序', '同序'], modulePath: '/competition' },
      { id: 'cc-5', name: '琴生不等式', latex: 'f\\left(\\frac{\\sum x_i}{n}\\right) \\leq \\frac{\\sum f(x_i)}{n}', description: '凸函数的 Jensen 不等式；凹函数不等号反向', scenario: '均值问题、三角不等式', tags: ['琴生', '凸函数'], modulePath: '/competition' },
      { id: 'cc-6', name: '赫尔德不等式', latex: `\\sum a_i b_i \\leq (\\sum a_i^p)^{1/p}(\\sum b_i^q)^{1/q}`, description: '柯西的推广，1/p + 1/q = 1，p,q > 1', scenario: '高次不等式', tags: ['赫尔德', '推广'], modulePath: '/competition' },
      { id: 'cc-7', name: '闵可夫斯基不等式', latex: `(\\sum(a_i+b_i)^p)^{1/p} \\leq (\\sum a_i^p)^{1/p}+(\\sum b_i^p)^{1/p}`, description: '三角不等式的推广，p ≥ 1', scenario: '距离空间、向量模', tags: ['闵可夫斯基', '三角'], modulePath: '/competition' },
      { id: 'cc-8', name: '伯努利不等式', latex: `(1+x)^n \\geq 1+nx\\quad (x>-1, n\\geq 1)`, description: '简单而有用的不等式；0<n<1 时反向', scenario: '放缩法、数列不等式', tags: ['伯努利', '放缩'], modulePath: '/competition' },
      { id: 'cc-9', name: '均值链 QM≥AM≥GM≥HM', latex: `\\sqrt{\\frac{\\sum a_i^2}{n}} \\geq \\frac{\\sum a_i}{n} \\geq \\sqrt[n]{\\prod a_i} \\geq \\frac{n}{\\sum 1/a_i}`, description: '平方平均 ≥ 算术平均 ≥ 几何平均 ≥ 调和平均', scenario: '不等式链、比较大小', tags: ['均值', '不等式链'], modulePath: '/competition' },
      { id: 'cc-10', name: '欧拉定理（数论）', latex: `a^{\\phi(m)} \\equiv 1 \\pmod{m}\\quad (\\gcd(a,m)=1)`, description: '费马小定理的推广，φ 为欧拉函数', scenario: '模幂化简、同余', tags: ['欧拉', '同余'], modulePath: '/number-theory' },
      { id: 'cc-11', name: '费马小定理', latex: `a^{p-1} \\equiv 1 \\pmod{p}\\quad(p\\text{素}, p\\nmid a)`, description: 'p 为素数时的同余性质；a^p ≡ a (mod p)', scenario: '模运算、素性检测', tags: ['费马', '同余', '素数'], modulePath: '/number-theory' },
      { id: 'cc-12', name: '中国剩余定理', latex: `x \\equiv a_i \\pmod{m_i}\\implies x \\text{ 唯一模 } M=\\prod m_i`, description: '两两互素模数下，同余方程组有唯一解', scenario: '解同余方程组', tags: ['中国剩余', '同余'], modulePath: '/number-theory' },
      { id: 'cc-13', name: '常见裂项公式1', latex: `\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}`, description: '最基本的裂项，相邻自然数乘积的倒数', scenario: '数列求和、分式裂项', tags: ['裂项', '数列求和'], modulePath: '/competition' },
      { id: 'cc-14', name: '常见裂项公式2', latex: `\\frac{1}{n(n+k)} = \\frac{1}{k}\\left(\\frac{1}{n}-\\frac{1}{n+k}\\right)`, description: '差为 k 的裂项公式', scenario: '数列求和', tags: ['裂项', '差为k'], modulePath: '/competition' },
      { id: 'cc-15', name: '根式裂项', latex: `\\frac{1}{\\sqrt{n+1}+\\sqrt{n}} = \\sqrt{n+1}-\\sqrt{n}`, description: '分母有理化后的裂项', scenario: '根式数列求和', tags: ['裂项', '根式'], modulePath: '/competition' },
      { id: 'cc-16', name: '圆幂定理', latex: `PA\\cdot PB = PC\\cdot PD = |PO^2 - r^2|`, description: '过点 P 的直线交圆于 A,B 和 C,D，乘积相等', scenario: '圆的几何、相交弦/切割线', tags: ['圆', '幂', '几何'], modulePath: '/competition' },
      { id: 'cc-17', name: '斯特林公式', latex: `n! \\sim \\sqrt{2\\pi n}\\left(\\frac{n}{e}\\right)^n`, description: 'n! 的渐近估计，竞赛中常用估算阶乘量级', scenario: '阶乘估算、渐近分析', tags: ['斯特林', '阶乘', '渐近'], modulePath: '/number-theory' },
      { id: 'cc-18', name: '托勒密定理', latex: 'AB\\cdot CD + AD\\cdot BC = AC\\cdot BD', description: '圆内接四边形对边乘积之和等于对角线乘积', scenario: '圆内接四边形、几何不等式', tags: ['托勒密', '圆', '几何'], modulePath: '/competition' },
      { id: 'cc-19', name: '三角形面积海伦公式', latex: `S = \\sqrt{s(s-a)(s-b)(s-c)}\\quad s=\\frac{a+b+c}{2}`, description: '由三边长求三角形面积，s 为半周长', scenario: '三角形面积计算', tags: ['海伦', '面积', '三角形'], modulePath: '/competition' },
      { id: 'cc-20', name: '卡特兰数', latex: `C_n = \\frac{1}{n+1}C(2n,n) = C(2n,n)-C(2n,n+1)`, description: '第 n 个卡特兰数，出栈序列/括号匹配/二叉树数', scenario: '组合计数、递推', tags: ['卡特兰', '组合'], modulePath: '/discrete' },
    ],
  },
];
