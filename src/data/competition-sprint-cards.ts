// 竞赛冲刺学习卡（10 张）
// EXPORTS: COMPETITION_SPRINT_CARDS, type SprintCard

export interface SprintCard {
  id: string;
  title: string;
  category: string;
  /** 核心公式/图表（LaTeX） */
  coreLatex: string;
  /** 关键点列表 */
  keyPoints: string[];
  /** 记忆口诀 / 联想 */
  mnemonic: string;
  /** 示例说明 */
  example: string;
}

export const COMPETITION_SPRINT_CARDS: SprintCard[] = [
  {
    id: 'sprint-mvt-triple',
    title: '中值定理三连关系图',
    category: '竞赛冲刺',
    coreLatex:
      `\\text{Rolle } \\xrightarrow[f(a)=f(b)\\text{ 特例}]{\\text{是 Lagrange 的}} \\text{ Lagrange }` +
      `\\xrightarrow[g(x)=x\\text{ 特例}]{\\text{是 Cauchy 的}} \\text{ Cauchy}`,
    keyPoints: [
      '罗尔是拉格朗日 f(a)=f(b) 的特例',
      '拉格朗日是柯西 g(x)=x 的特例',
      '证明题：先判断能否用罗尔，不行上拉格朗日，两函数增量比用柯西',
      '辅助函数构造法：积分因子 e^∫p(x)dx 万能',
    ],
    mnemonic: '三兄弟：罗（最基础）→ 拉（推广）→ 柯（再推广，两函数比）',
    example: '见到 f\'(ξ) + p(ξ)f(ξ) = 0 形式，直接构造 F(x) = e^∫p(x)dx · f(x)，验证 F(a)=F(b)=0，用罗尔。',
  },
  {
    id: 'sprint-taylor-remainder',
    title: '泰勒公式余项比较',
    category: '竞赛冲刺',
    coreLatex:
      `\\begin{aligned}` +
      `\\text{Peano: } & R_n(x) = o((x-x_0)^n) \\quad \\text{（局部，极限用）} \\\\ ` +
      `\\text{Lagrange: } & R_n(x) = \\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x-x_0)^{n+1} \\quad \\text{（整体，估计用）} \\\\ ` +
      `\\text{积分型: } & R_n(x) = \\frac{1}{n!}\\int_{x_0}^x f^{(n+1)}(t)(x-t)^n dt` +
      `\\end{aligned}`,
    keyPoints: [
      'Peano 余项：只在 x₀ 邻域成立，用于求极限、等价无穷小',
      'Lagrange 余项：区间内成立，用于不等式证明、误差估计',
      '极限题用 Peano 型就够，证明题才需要 Lagrange 型',
      '展开阶数 = 分母阶数 + 1（保证不被抵消）',
    ],
    mnemonic: '皮阿诺局部求极限，拉格朗日整体做估计',
    example: '求 lim(sinx - x)/x³ ：sinx 展开到三阶（分母是 3 阶），sinx = x - x³/6 + o(x³)，得 -1/6。',
  },
  {
    id: 'sprint-equivalent-table',
    title: '等价无穷小记忆表',
    category: '竞赛冲刺',
    coreLatex:
      `\\begin{aligned}` +
      `\\sin x &\\sim x, \\quad \\tan x \\sim x \\\\ ` +
      `\\arcsin x &\\sim x, \\quad \\arctan x \\sim x \\\\ ` +
      `\\ln(1+x) &\\sim x, \\quad e^x-1 \\sim x \\\\ ` +
      `1-\\cos x &\\sim \\frac{x^2}{2} \\\\ ` +
      `x-\\sin x &\\sim \\frac{x^3}{6} \\quad (\\text{三阶}) \\\\ ` +
      `\\tan x - x &\\sim \\frac{x^3}{3} \\quad (\\text{三阶})` +
      `\\end{aligned}`,
    keyPoints: [
      '乘除因子可直接代换（安全）',
      '加减项：必须整体是更高阶，或泰勒精确展开',
      '加减情况一律用泰勒展开到足够阶数，最保险',
      'x→0 时，sinx < x < tanx，三者差都是三阶',
    ],
    mnemonic: '乘除大胆代，加减用泰勒；sin/tan/arcsin/arctan 差都是三阶',
    example: 'lim(tanx - sinx)/x³ 不能直接代换成 (x-x)/x³ = 0！要提取公因子 sinx·(1-cosx)/cosx ~ x · x²/2 = x³/2，结果是 1/2。',
  },
  {
    id: 'sprint-integral-mvt',
    title: '积分中值定理与估值',
    category: '竞赛冲刺',
    coreLatex:
      `\\int_a^b f(x)g(x)dx = f(\\xi)\\int_a^b g(x)dx \\quad (g\\text{ 不变号, } \\xi\\in[a,b])`,
    keyPoints: [
      '积分第一中值定理：f 连续、g 不变号 → 存在 ξ 使等式成立',
      '积分第二中值定理（竞赛常考）：f 单调 → ∃ξ 使 f(a)∫_a^ξ g + f(b)∫_ξ^b g',
      '估值：找到 f 在区间上的最值 m、M，有 m·(b-a) ≤ ∫f ≤ M·(b-a)',
      '含参数的积分估计常用分部积分降阶',
    ],
    mnemonic: '中值 = 平均值 × 区间长；估值 = 上下界 × 区间长',
    example: '估计 ∫₀¹ e^(x²)dx：因 1 ≤ e^(x²) ≤ e（x∈[0,1]），所以 1 ≤ I ≤ e。更精确可展开级数逐项积分。',
  },
  {
    id: 'sprint-green-gauss-stokes',
    title: '格林-高斯-斯托克斯关系',
    category: '竞赛冲刺',
    coreLatex:
      `\\text{Green (二维)} \\quad \\xrightarrow[\\text{三维推广}]{\\text{散度定理}} \\quad \\text{Gauss (曲面积分)}` +
      `\\quad \\text{ Stokes (空间曲线)} \\xleftarrow[\\text{曲面}]{\\text{空间曲线→}} \\quad \\text{Green}`,
    keyPoints: [
      '格林公式：平面闭合曲线积分 ↔ 二重积分（旋度积分）',
      '高斯公式：闭合曲面积分 ↔ 三重积分（散度积分），又叫散度定理',
      '斯托克斯：空间闭合曲线积分 ↔ 曲面积分（空间版格林）',
      '格林是斯托克斯在平面上的特例；高斯与格林都是"边界=内部某种导数和"',
      '记忆核心：边界积分 = 区域内"导数形式"的积分',
    ],
    mnemonic: '边界包围区域 → 边界上的积分 = 区域内某种"扩散/旋转"的积分',
    example: '闭合曲面 Σ 上积分 ∬ P dydz+Q dzdx+R dxdy 不好算时，用高斯公式化为三重积分 ∭ (P_x+Q_y+R_z) dv，常被积函数为 0 或常数。',
  },
  {
    id: 'sprint-series-decision-tree',
    title: '级数判别法决策树',
    category: '竞赛冲刺',
    coreLatex:
      `\\sum u_n \\xrightarrow{\\text{看 }} u_n \\to 0?` +
      `\\begin{cases} \\text{否} \\to \\text{发散} \\\\ \\text{是} \\to \\text{正项?} ` +
      `\\begin{cases} \\text{是} \\to \\text{比较/比值/根值/积分} \\\\ \\text{否} \\to |u_n|\\text{收敛?} ` +
      `\\begin{cases} \\text{是} \\to \\text{绝对收敛} \\\\ \\text{否} \\to \\text{交错?莱布尼茨 → 条件收敛} \\end{cases} ` +
      `\\end{cases} ` +
      `\\end{cases}`,
    keyPoints: [
      '第一步：通项是否→0？不→0 直接发散',
      '正项级数：比值（含 n!）/ 根值（含 n 次方）/ 比较（已知级数）/ 积分（f(x) 可积）',
      '任意项：先看绝对值是否收敛（绝对收敛）',
      '交错级数不绝对收敛 → 莱布尼茨判别（条件收敛）',
      'p 级数和等比级数是比较判别法的两把尺子',
    ],
    mnemonic: '先看通项，再分正负；正项三法（比/根/比较），交错莱布尼茨',
    example: '∑ (-1)^n / n：通项→0，非正项，绝对值 ∑1/n 发散（调和级数），交错级数满足莱布尼茨条件 → 条件收敛。',
  },
  {
    id: 'sprint-power-series-sum',
    title: '幂级数求和策略',
    category: '竞赛冲刺',
    coreLatex:
      `S(x) = \\sum a_n x^n \\quad \\xrightarrow[\\text{逐项积分}]{\\text{逐项求导}} \\quad S'(x) = \\sum n a_n x^{n-1}`,
    keyPoints: [
      '求导法：系数含 n，逐项求导降次，化为已知展开式',
      '积分法：系数含 1/n，逐项积分消去分母',
      '微分方程法：求导后出现 S 和 S\' 的关系 → 解 ODE',
      '常见展开式必须熟背：e^x、sinx、cosx、ln(1+x)、1/(1-x)、(1+x)^α',
      '收敛域：先求收敛半径，再单独讨论端点',
    ],
    mnemonic: '有 n 求导消掉，有 1/n 积分消掉，复杂的建微分方程',
    example: '∑ n·x^(n-1)：逐项积分得 ∑ x^n = 1/(1-x)，求导得 S(x) = 1/(1-x)²，|x|<1。',
  },
  {
    id: 'sprint-fourier',
    title: '常见傅里叶展开',
    category: '竞赛冲刺',
    coreLatex:
      `\\begin{aligned}` +
      `\\text{方波: } f(x) &= \\frac{4}{\\pi}\\sum_{k=1}^\\infty \\frac{\\sin(2k-1)x}{2k-1} \\quad (-\\pi,\\pi) \\\\ ` +
      `\\text{锯齿波: } f(x) &= 2\\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n}\\sin nx \\quad (-\\pi,\\pi)` +
      `\\end{aligned}`,
    keyPoints: [
      '傅里叶系数：a₀/2 + Σ(aₙcosnx + bₙsinnx)',
      '奇函数 → 只有正弦项（正弦级数）',
      '偶函数 → 只有余弦项（余弦级数）',
      '周期 2l：变量代换 t = πx/l，化为 [-π,π] 标准型',
      '收敛定理（狄利克雷）：连续点收敛于 f(x)，间断点收敛于左右平均',
    ],
    mnemonic: '奇正弦，偶余弦，周期 2l 换元变；连续收敛函数值，间断取平均',
    example: '方波只有奇次谐波（sinx, sin3x, sin5x, ...），偶数项系数全为 0 —— 记住这个特点可以快速判断对称性。',
  },
  {
    id: 'sprint-ode-solver-tree',
    title: '一阶 ODE 解法选择树',
    category: '竞赛冲刺',
    coreLatex:
      `y' = f(x,y) \\quad \\xrightarrow{\\text{判断类型}}` +
      `\\begin{cases} \\text{可分离} \\to \\text{分离变量积分} \\\\ ` +
      `\\text{齐次 } y/x \\to u=y/x \\text{ 换元} \\\\ ` +
      `\\text{线性 } y'+Py=Q \\to \\text{积分因子法} \\\\ ` +
      `\\text{伯努利 } y'+Py=Qy^n \\to z=y^{1-n} \\text{ 化线性} \\\\ ` +
      `\\text{全微分} \\to \\text{直接积分求原函数} \\end{cases}`,
    keyPoints: [
      '先看能不能分离变量（最基础）',
      '右边是 y/x 的齐次函数 → 令 u = y/x',
      'y\' + P(x)y = Q(x) 形式 → 积分因子法，公式直接套',
      '有 y^n 项 → 伯努利，令 z = y^(1-n)',
      '判断 Mdx + Ndy = 0 是否全微分（M_y = N_x）',
    ],
    mnemonic: '先分离、再齐次、线性伯努利按顺序；M_y = N_x 全微分',
    example: 'y\' + y/x = y²：伯努利方程 n=2，令 z = y^(-1)，得 z\' - z/x = -1，线性方程求解再换回 y。',
  },
  {
    id: 'sprint-lagrange-multiplier',
    title: '拉格朗日乘数法步骤',
    category: '竞赛冲刺',
    coreLatex:
      `\\begin{cases} \\text{目标函数: } f(x,y,z) \\\\ ` +
      `\\text{约束: } \\varphi(x,y,z)=0 \\end{cases}` +
      `\\quad \\implies \\quad L = f + \\lambda\\varphi`,
    keyPoints: [
      '第一步：写拉格朗日函数 L = f + λφ（一个约束一个乘子）',
      '第二步：对所有变量求偏导并令为 0（含 λ）',
      '第三步：解方程组，找出可能的极值点',
      '第四步：比较各候选点的函数值，最大为最大值，最小为最小值',
      '多个约束：增加对应的拉格朗日乘子',
    ],
    mnemonic: '写函数 → 求偏导 → 解方程 → 比大小',
    example: '求 f(x,y)=xy 在 x²+y²/4=1 下的极值：L = xy + λ(1 - x² - y²/4)，偏导得 y=2λx, x=λy/2，消去 λ 得 y=±2x，代入约束得 x=±√2/2，最值±1。',
  },
];
