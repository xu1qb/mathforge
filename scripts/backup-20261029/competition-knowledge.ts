// EXPORTS: KnowledgeCard, KNOWLEDGE_CARDS, MustMemoItem, MUST_MEMO_ITEMS, SKILL_MASTERED_KEY, readMasteredSkills, writeMasteredSkills, toggleSkillMastered, CardMasteryLevel, MASTERY_V1_KEY, readMasteryMap, writeMasteryMap, setCardMastery, clearCardMastery, migrateMasteredToMastery

import { scopedStorage } from '@/lib/lark-mock';

// ============================================================
// 知识卡片类型
// ============================================================
export interface KnowledgeCard {
  id: string;
  title: string;
  category: string;
  scenario: string;
  core: string;
  examples: { problem: string; solution: string }[];
  pitfalls: string;
}

// 旧版：二进制已掌握状态存储（兼容用）
export const SKILL_MASTERED_KEY = 'mathforge_skill_mastered';

export function readMasteredSkills(): Set<string> {
  try {
    const raw = scopedStorage.getItem(SKILL_MASTERED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function writeMasteredSkills(set: Set<string>) {
  try {
    scopedStorage.setItem(SKILL_MASTERED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export function toggleSkillMastered(id: string): Set<string> {
  const set = readMasteredSkills();
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  writeMasteredSkills(set);
  return set;
}

// ============================================================
// 三态掌握自评系统（v1）
// ============================================================

export type CardMasteryLevel = 'proficient' | 'half' | 'not-yet';

/** v1 存储 key */
export const MASTERY_V1_KEY = 'mathforge:competition:cards-mastery:v1';

export interface MasteryRecord {
  level: CardMasteryLevel;
  updatedAt: number;
}

export type MasteryMap = Record<string, MasteryRecord>;

export function readMasteryMap(): MasteryMap {
  try {
    const raw = scopedStorage.getItem(MASTERY_V1_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MasteryMap;
  } catch {
    return {};
  }
}

export function writeMasteryMap(map: MasteryMap) {
  try {
    scopedStorage.setItem(MASTERY_V1_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function setCardMastery(id: string, level: CardMasteryLevel | null): MasteryMap {
  const map = readMasteryMap();
  if (level === null) {
    delete map[id];
  } else {
    map[id] = { level, updatedAt: Date.now() };
  }
  writeMasteryMap(map);
  // 同步旧二进制：熟练 → 已掌握，半生/不会 → 未掌握
  const oldSet = readMasteredSkills();
  if (level === 'proficient') {
    oldSet.add(id);
  } else if (level === 'half' || level === 'not-yet') {
    oldSet.delete(id);
  }
  writeMasteredSkills(oldSet);
  return map;
}

export function clearCardMastery(id: string): MasteryMap {
  return setCardMastery(id, null);
}

/**
 * 从旧版二进制已掌握迁移到三态：已掌握 → 熟练
 * 幂等：只迁移 v1 中不存在、但旧版中已掌握的条目
 */
export function migrateMasteredToMastery(): MasteryMap {
  const v1 = readMasteryMap();
  const oldSet = readMasteredSkills();
  let changed = false;
  for (const id of oldSet) {
    if (!v1[id]) {
      v1[id] = { level: 'proficient', updatedAt: Date.now() };
      changed = true;
    }
  }
  if (changed) writeMasteryMap(v1);
  return v1;
}

// ============================================================
// 知识卡片库（150+ 张）
// 用反引号字符串避免单引号冲突
// ============================================================
export const KNOWLEDGE_CARDS: KnowledgeCard[] = [
  // ========== 极限专题（20 张） ==========
  {
    id: "k-limit-sandwich",
    title: "夹逼准则适用信号",
    category: "极限",
    scenario: "数列极限含 n 项和、连乘、取整函数、最大/最小值",
    core: `若 $y_n \\le x_n \\le z_n$ 且 $\\lim y_n = \\lim z_n = a$，则 $\\lim x_n = a$。关键：放大缩小后两端极限相同。`,
    examples: [
      { problem: `求 $\\lim\\limits_{n\\to\\infty}\\dfrac{n!}{n^n}$`, solution: `由 $0 < \\dfrac{n!}{n^n} = \\dfrac{1}{n}\\cdot\\dfrac{2}{n}\\cdots\\dfrac{n}{n} \\le \\dfrac{1}{n}$，而 $\\lim 0 = \\lim\\dfrac{1}{n}=0$，由夹逼准则得 $\\lim\\dfrac{n!}{n^n}=0$。` },
    ],
    pitfalls: "放缩不能过度，必须两端极限相等。常见放缩方法：分子分母同乘除、舍掉较小项、用最大项代替所有项。",
  },
  {
    id: "k-limit-integral-def",
    title: "定积分定义求 n 项和极限",
    category: "极限",
    scenario: "极限为 n 项求和，提取 1/n 后其余项能写成 f(k/n) 的形式",
    core: `$\\lim\\limits_{n\\to\\infty}\\dfrac{1}{n}\\sum_{k=1}^{n}f\\left(\\dfrac{k}{n}\\right) = \\int_0^1 f(x)\\,dx$。记忆口诀：1/n → dx，k/n → x，求和 → 积分。`,
    examples: [
      { problem: `求 $\\lim\\limits_{n\\to\\infty}\\sum_{k=1}^{n}\\dfrac{n}{n^2+k^2}$`, solution: `原式 = $\\lim\\dfrac{1}{n}\\sum_{k=1}^{n}\\dfrac{1}{1+(k/n)^2} = \\int_0^1\\dfrac{dx}{1+x^2} = \\arctan x\\big|_0^1 = \\dfrac{\\pi}{4}$。` },
    ],
    pitfalls: "必须是 n 项 × 1/n 形式。如果是 n² 项求和则是二重积分。提取系数后要检查变量是否是 k/n 的函数。",
  },
  {
    id: "k-limit-taylor-timing",
    title: "泰勒展开求极限的时机与阶数",
    category: "极限",
    scenario: "0/0 型、x→0、指数/对数/三角函数混合，等价无穷小不够用",
    core: "展开到分母阶数 + 1 阶，确保分子最低阶非零项不被抵消遗漏。若分母是 x^n，则分子各函数展开到 x^n 项（含 o(x^n)）。",
    examples: [
      { problem: `求 $\\lim\\limits_{x\\to 0}\\dfrac{e^x - 1 - x - \\frac{x^2}{2}}{x^3}$`, solution: `分母是三阶，展开 eˣ 到三阶：$e^x = 1 + x + \\dfrac{x^2}{2} + \\dfrac{x^3}{6} + o(x^3)$。代入得 $\\dfrac{x^3/6 + o(x^3)}{x^3} \\to \\dfrac{1}{6}$。` },
    ],
    pitfalls: "展开阶数不足会导致低阶项抵消后只剩 o(xⁿ)，得到错误极限 0。展开过多则计算量大浪费时间。",
  },
  {
    id: "k-limit-equiv-precision",
    title: "等价无穷小精度法则",
    category: "极限",
    scenario: "判断乘除/加减情形能否使用等价无穷小代换",
    core: "乘除因子可直接代换。加减情形：若 α ~ α', β ~ β'，且 lim α/β ≠ -1（或 ≠ 1，视加减方向），则 α±β ~ α'±β'。口诀：乘除大胆代，加减用泰勒。",
    examples: [
      { problem: "求 lim(tan x - sin x)/x³ 时能否分别代换 tan x~x, sin x~x？", solution: "不能。tan x - sin x 中两者都是一阶，相减后最低阶升高到三阶，分别代换 x - x = 0 丢失了三阶项。正确做法：tan x - sin x = sin x(1-cos x)/cos x ~ x·x²/2 = x³/2。" },
    ],
    pitfalls: "加减项等价代换是竞赛最高频错误。口诀：乘除大胆代，加减用泰勒。",
  },
  {
    id: "k-limit-1-to-inf",
    title: "1^∞ 型极限快速处理",
    category: "极限",
    scenario: "底数极限为 1、指数趋向无穷的幂指函数极限",
    core: `$\\lim u^v$ 满足 $u\\to 1, v\\to\\infty$ 时，$u^v = e^{v(u-1)\\cdot\\frac{\\ln(1+u-1)}{u-1}} \\to e^{\\lim v(u-1)}$。即 1^∞ 型 = e^{指数 × (底数-1)}。`,
    examples: [
      { problem: `求 $\\lim\\limits_{x\\to 0}(1+\\sin x)^{\\frac{1}{x}}$`, solution: `1^∞ 型。u = 1+sin x → 1, v = 1/x → ∞。$\\lim v(u-1) = \\lim\\dfrac{\\sin x}{x} = 1$。故极限 = $e^1 = e$。` },
    ],
    pitfalls: "必须是真正的 1^∞ 型（底数极限严格=1，指数真正→∞）。底数只是接近 1 但指数不够大时不适用。",
  },
  {
    id: "k-limit-param-classify",
    title: "含参极限讨论分类标准",
    category: "极限",
    scenario: "极限表达式中含参数 a，需讨论参数不同范围时极限的存在性与取值",
    core: "分类依据：① 分子分母的阶数关系 ② 底数与 1 的大小关系（指数型） ③ 趋近方向（±∞）。按使得表达式中最高阶项系数变号或消失的临界值分类讨论。",
    examples: [
      { problem: `求 $\\lim\\limits_{n\\to\\infty}\\dfrac{a^n}{1+a^n}$（a≥0）`, solution: "分三类：① 0≤a<1 时，aⁿ→0，极限 = 0；② a=1 时，1ⁿ=1，极限 = 1/2；③ a>1 时，分子分母同除以 aⁿ 得 1/(a⁻ⁿ+1) → 1。" },
    ],
    pitfalls: "分类讨论常见错误：漏掉 a=1（或其他临界值）的单独讨论；分类区间写错开闭。",
  },
  {
    id: "k-limit-stolz",
    title: "Stolz 定理与数列极限",
    category: "极限",
    scenario: "∞/∞ 型或 0/0 型数列极限，分子分母都是 n 的函数时",
    core: `∞/∞ 型 Stolz：设 {yₙ} 严格递增且 yₙ→+∞，若 $\\lim\\dfrac{x_n-x_{n-1}}{y_n-y_{n-1}} = a$，则 $\\lim\\dfrac{x_n}{y_n} = a$。是数列版的洛必达法则。`,
    examples: [
      { problem: `求 $\\lim\\limits_{n\\to\\infty}\\dfrac{1^k+2^k+\\cdots+n^k}{n^{k+1}}$`, solution: `用 Stolz：分子增量 = (n+1)^k，分母增量 = (n+1)^{k+1} - n^{k+1} ~ (k+1)n^k（二项式展开首项）。极限 = $\\lim\\dfrac{(n+1)^k}{(k+1)n^k} = \\dfrac{1}{k+1}$。` },
    ],
    pitfalls: "Stolz 定理有严格条件：分母必须严格单调且趋向无穷。0/0 型 Stolz 还需分子分母都趋向 0。逆命题不成立。",
  },
  {
    id: "k-limit-recurrence",
    title: "递推数列极限存在性三件套",
    category: "极限",
    scenario: "由递推公式 x_{n+1}=f(x_n) 给出的数列，需证明极限存在并求之",
    core: "方法一：单调有界定理（证明单调 + 有界，则极限存在；再设极限为 a 代入递推式解方程）。方法二：压缩映射（|f(x)-f(y)|≤L|x-y|, L<1）。方法三：不动点迭代 + 上下极限。",
    examples: [
      { problem: "x₁>0, x_{n+1}=½(xₙ + a/xₙ)，证明极限存在并求值", solution: "① 由均值不等式：x_{n+1} = ½(xₙ + a/xₙ) ≥ √(xₙ·a/xₙ) = √a，有下界。② x_{n+1} - xₙ = ½(a/xₙ - xₙ) = (a - xₙ²)/(2xₙ) ≤ 0（因 xₙ ≥ √a），递减。由单调递减有下界，极限存在。设极限为 a，代入得 a = ½(a + a/a) → a = √a。" },
    ],
    pitfalls: "必须先证存在性再求极限，不能直接对递推式两边取极限。单调性证明常用方法：作差、作比、求导看 f' 符号。",
  },
  {
    id: "k-limit-equiv-list",
    title: "常用等价无穷小公式组",
    category: "极限",
    scenario: "乘除因子型 0/0 极限快速化简",
    core: "当 x→0 时：sin x ~ x，tan x ~ x，arcsin x ~ x，arctan x ~ x，eˣ-1 ~ x，ln(1+x) ~ x，1-cos x ~ x²/2，(1+x)^α-1 ~ αx，aˣ-1 ~ x ln a。",
    examples: [
      { problem: `求 $\\lim\\limits_{x\\to 0}\\dfrac{e^{x^2} - 1}{\\ln(1+2x)\\sin 3x}$`, solution: "e^{x²}-1 ~ x²，ln(1+2x) ~ 2x，sin 3x ~ 3x。代入得 x²/(2x·3x) = x²/6x² = 1/6。" },
    ],
    pitfalls: "只适用于乘除因子。加减项必须谨慎，通常改用泰勒展开。使用前确认 x→0 且函数整体确实是无穷小。",
  },
  {
    id: "k-limit-lhospital",
    title: "洛必达法则使用条件与陷阱",
    category: "极限",
    scenario: "0/0 型或 ∞/∞ 型极限求导后更简单",
    core: "条件：① 0/0 或 ∞/∞ 型 ② f 和 g 在 a 的去心邻域可导且 g'≠0 ③ lim f'/g' 存在（或为 ∞）。满足则 lim f/g = lim f'/g'。可连续使用多次，但每次必须验型。",
    examples: [
      { problem: `求 $\\lim\\limits_{x\\to 0}\\dfrac{x - \\sin x}{x^3}$`, solution: "0/0 型。用洛必达：lim(1-cos x)/(3x²) = lim(sin x)/(6x) = lim(cos x)/6 = 1/6。（每次使用前验型：0/0 → 0/0 → 0/0）" },
    ],
    pitfalls: "不是 0/0 或 ∞/∞ 型时不能用。求导后极限不存在 ≠ 原极限不存在（洛必达只是充分条件）。数列极限不能直接洛，先化连续。",
  },
  {
    id: "k-limit-power-exponential",
    title: "幂指函数极限处理套路",
    category: "极限",
    scenario: "形如 f(x)^{g(x)} 的极限计算",
    core: "统一用 e 抬起：f(x)^{g(x)} = e^{g(x)·ln f(x)}，转化为求指数部分 g(x)·ln f(x) 的极限。根据指数极限的类型再选方法（等价无穷小、洛必达、泰勒等）。",
    examples: [
      { problem: `求 $\\lim\\limits_{x\\to 0^+} x^x$`, solution: "x^x = e^{x ln x}。x ln x = ln x / (1/x) 是 ∞/∞ 型，洛必达：(1/x) / (-1/x²) = -x → 0。所以原式 = e⁰ = 1。" },
    ],
    pitfalls: "务必写成 e^{...} 形式再处理，不能对底数和指数分别求极限。注意 0⁰ 型和 ∞⁰ 型的区别。",
  },
  {
    id: "k-limit-two-sided",
    title: "左右极限判定极限存在",
    category: "极限",
    scenario: "分段函数分界点、含绝对值、取整函数、arctan(∞)、e^{1/x} 等左右极限可能不等的情形",
    core: `$\\lim\\limits_{x\\to a} f(x) = A \\iff \\lim\\limits_{x\\to a^+} f(x) = \\lim\\limits_{x\\to a^-} f(x) = A$。必须分别求左右极限并验证相等才能断定极限存在。`,
    examples: [
      { problem: `判断 $\\lim\\limits_{x\\to 0} e^{1/x}$ 是否存在`, solution: "x→0⁺ 时 1/x→+∞，e^{1/x}→+∞；x→0⁻ 时 1/x→-∞，e^{1/x}→0。左右极限不相等（一个不存在），故极限不存在。" },
    ],
    pitfalls: "见到分段函数、|x|、[x]（取整）、arctan(1/x)、e^{1/x} 时第一反应就是要分左右极限讨论。",
  },
  {
    id: "k-limit-infinite-order",
    title: "无穷大阶数比较表",
    category: "极限",
    scenario: "∞/∞ 型极限快速判断分子分母哪个趋于无穷更快",
    core: "当 x→+∞ 时，增长速度由慢到快：ln^α x << x^β << a^x << x^x（其中 α, β>0, a>1）。求分式极限时看最高阶项系数比即可。",
    examples: [
      { problem: `求 $\\lim\\limits_{x\\to +\\infty}\\dfrac{x^{100}}{e^x}$`, solution: "指数函数增长快于任何多项式。用洛必达 100 次后分子变常数 100!，分母仍为 eˣ → +∞。极限 = 0。" },
    ],
    pitfalls: "必须是同一趋向的比较。不同趋向（如 x→0 vs x→∞）结论完全不同。",
  },
  {
    id: "k-limit-continuity-piecewise",
    title: "分段函数连续性与可导性判定",
    category: "极限",
    scenario: "已知分段函数在分段点连续或可导，求参数值",
    core: "分段点 x=a 连续 ⇔ f(a⁺) = f(a⁻) = f(a)。可导 ⇔ f'₋(a) = f'₊(a)（左右导数相等）。可导必连续，连续不一定可导。",
    examples: [
      { problem: "f(x) = { x²+1, x≤0; ax+b, x>0 } 在 x=0 可导，求 a,b", solution: "先连续：f(0⁻)=1, f(0⁺)=b，故 b=1。再可导：f'₋(0) = (x²+1)'|_{x=0}=0，f'₊(0) = (ax+1)'|_{x=0}=a。故 a=0。" },
    ],
    pitfalls: "先验证连续再求可导。如果连连续都不满足，根本谈不上可导。常见错误是跳过连续性直接求导。",
  },
  {
    id: "k-limit-asymptote",
    title: "渐近线的三种类型与求法",
    category: "极限",
    scenario: "求函数图像的渐近线方程",
    core: "① 水平渐近线：lim_{x→±∞} f(x) = A，则 y = A；② 垂直渐近线：lim_{x→a±} f(x) = ∞，则 x = a（找无定义点）；③ 斜渐近线：k = lim f(x)/x，b = lim(f(x)-kx)，则 y = kx+b。",
    examples: [
      { problem: "求 f(x) = x + arctan x 的渐近线", solution: "x→+∞ 时 f(x)/x → 1，f(x) - x = arctan x → π/2，故 y = x + π/2；x→-∞ 时 f(x)/x → 1，f(x) - x → -π/2，故 y = x - π/2。无垂直和水平渐近线。" },
    ],
    pitfalls: "求斜渐近线必须分别算 x→+∞ 和 x→-∞ 两种情况，可能各有一条。三条渐近线都要检查不要漏。",
  },
  {
    id: "k-limit-variable-sub",
    title: "变量替换求极限技巧",
    category: "极限",
    scenario: "表达式含 1/x、复合函数、根号差等，做变量替换后形式更简单",
    core: "常用替换：t = 1/x（∞ → 0）、t = x - a（平移到 0）、t = √(x+a)（去根号）、t = e^x - 1（指数换元）。替换后极限趋向也要跟着变。",
    examples: [
      { problem: `求 $\\lim\\limits_{x\\to +\\infty} x(\\sqrt{x^2+1} - x)$`, solution: "有理化：原式 = x / (√(x²+1) + x) = 1 / (√(1+1/x²) + 1)。令 t = 1/x → 0⁺，= 1/(√(1+t²)+1) → 1/2。" },
    ],
    pitfalls: "替换后别忘了更新极限趋向。等价替换：t→a 时要保证替换函数在 a 附近单调且可逆。",
  },
  {
    id: "k-limit-floor-ceiling",
    title: "含取整函数的极限",
    category: "极限",
    scenario: "极限表达式中出现 [x]（高斯取整函数）",
    core: "利用不等式 x-1 < [x] ≤ x，再用夹逼准则。注意 [x] 在整数点跳跃间断，整数点处须分左右极限讨论。",
    examples: [
      { problem: `求 $\\lim\\limits_{x\\to 0} x \\cdot \\left[\\dfrac{1}{x}\\right]$`, solution: "对任意 x > 0，有 1/x - 1 < [1/x] ≤ 1/x。乘以 x（正数方向）：1 - x < x[1/x] ≤ 1。x→0⁺ 时由夹逼准则极限 = 1。x→0⁻ 类似：1 ≤ x[1/x] < 1 - x → 1。左右极限都是 1，故极限 = 1。" },
    ],
    pitfalls: "夹逼时注意乘负数时不等号方向改变。在整数点附近需验证左右极限相等。",
  },
  {
    id: "k-limit-inequality-e",
    title: "e 的定义与相关不等式",
    category: "极限",
    scenario: "涉及 (1+1/n)^n、(1+1/n)^{n+1} 等数列",
    core: `$\\lim\\limits_{n\\to\\infty}\\left(1+\\dfrac{1}{n}\\right)^n = e$。数列 (1+1/n)^n 递增趋向 e，(1+1/n)^{n+1} 递减趋向 e。不等式：$\\dfrac{1}{n+1} < \\ln\\left(1+\\dfrac{1}{n}\\right) < \\dfrac{1}{n}$。`,
    examples: [
      { problem: `证明 $\\lim\\left(\\dfrac{1}{n+1}+\\dfrac{1}{n+2}+\\cdots+\\dfrac{1}{2n}\\right) = \\ln 2$`, solution: "由 1/(k+1) < ln(1+1/k) < 1/k，求和得 sum_{k=n}^{2n-1} 1/(k+1) < ln(2n)-ln n = ln 2 < sum_{k=n}^{2n-1} 1/k。即 H_{2n}-H_n → ln 2（其中 Hₙ 为调和级数）。" },
    ],
    pitfalls: "注意 (1+1/n)^n 是单增而 (1+1/n)^{n+1} 是单减，二者都以 e 为极限。别记反单调性。",
  },
  {
    id: "k-limit-darboux",
    title: "极限定义的 ε-N 与 ε-δ 语言",
    category: "极限",
    scenario: "用定义证明极限（证明题）",
    core: "数列极限：∀ε>0, ∃N, 当 n>N 时 |xₙ - a| < ε。函数极限：∀ε>0, ∃δ>0, 当 0<|x-a|<δ 时 |f(x)-A| < ε。关键：找 N 或 δ 的表达式，使得不等式成立。",
    examples: [
      { problem: "用定义证明 lim_{n→∞} qⁿ = 0（|q|<1）", solution: "设 |q| = 1/(1+a)（a>0），则 |qⁿ| = 1/(1+a)ⁿ < 1/(1+na)（伯努利不等式）。对任意 ε>0，取 N = [1/(aε)]+1，当 n>N 时 |qⁿ| < 1/(na) < ε。得证。" },
    ],
    pitfalls: "N 可以放大估计，只要存在就行，不必求最小 N。函数极限的 δ 可以适当缩小，只要满足条件即可。",
  },
  {
    id: "k-limit-sum-product",
    title: "n 项连乘极限处理",
    category: "极限",
    scenario: "形如 Π_{k=1}^n a_k 的连乘极限",
    core: "方法：① 取对数化为求和（连乘 → 求和，再用定积分定义或 Stolz）② 化简消去（望远镜乘积）③ 夹逼准则放缩。",
    examples: [
      { problem: `求 $\\lim\\limits_{n\\to\\infty}\\prod_{k=1}^{n}\\left(1+\\dfrac{1}{k^2}\\right)$`, solution: "1+1/k² = (k²+1)/k²。用双曲函数或无穷乘积公式。更简单的例子：Π_{k=2}^{n}(1-1/k²) = Π(k-1)(k+1)/k² = (n+1)/(2n) → 1/2（望远镜）。" },
    ],
    pitfalls: "连乘问题优先考虑能否望远镜化简（分子分母大部分项约掉）。不能望远镜时取对数转求和。",
  },
  {
    id: "k-limit-comparison",
    title: "无穷小阶的比较与确定",
    category: "极限",
    scenario: "判断两个无穷小的阶数关系（高阶、低阶、同阶、等价），或确定某无穷小的阶",
    core: "设 α 和 β 都是无穷小。若 lim α/β = 0 → α 是 β 的高阶无穷小；∞ → 低阶；C ≠ 0 → 同阶；1 → 等价。确定 α 的阶：找 k 使 lim α/x^k = C ≠ 0，则 α 是 k 阶无穷小。求 k 的方法：泰勒展开、洛必达、等价代换。",
    examples: [
      { problem: "x→0 时，e^x - 1 - x 是 x 的几阶无穷小？", solution: "eˣ = 1 + x + x²/2 + o(x²)，所以 eˣ - 1 - x = x²/2 + o(x²)，是二阶无穷小。或用洛必达两次：lim(eˣ-1-x)/x² = lim(eˣ-1)/(2x) = 1/2。二阶。" },
    ],
    pitfalls: "阶数必须是相对于某个标准无穷小而言的（通常是 x 或 x-a）。说 f 是 n 阶无穷小时要指明趋向过程。",
  },

  // ========== 一元微分专题（20 张） ==========
  {
    id: "k-mvt-selector",
    title: "中值定理选用对照表",
    category: "一元微分",
    scenario: "证明题含 f(b)-f(a)、f'(ξ) 等中值型结论，选择合适的中值定理",
    core: "① 费马引理：极值点处可导则导数为 0。② 罗尔定理：F(a)=F(b) → F'(ξ)=0。③ 拉格朗日：f(b)-f(a) = f'(ξ)(b-a)。④ 柯西：[f(b)-f(a)]/[g(b)-g(a)] = f'(ξ)/g'(ξ)。先猜用哪个，再构造辅助函数。",
    examples: [
      { problem: "f 在 [a,b] 连续 (a,b) 可导，证明存在 ξ 使 f(b)-f(a) = ξ f'(ξ) ln(b/a)", solution: "右边含 ξ f'(ξ) 和 ln(b/a) = ln b - ln a，是柯西形式。取 g(x) = ln x。由柯西中值定理：[f(b)-f(a)]/[ln b - ln a] = f'(ξ)/(1/ξ) = ξ f'(ξ)。整理即得。" },
    ],
    pitfalls: "选罗尔还是拉格朗日，主要看结论形式。若有明确的 f(b)-f(a) 项，优先拉格朗日；若只有 f'(ξ)=0 型且能找到两点等值，选罗尔。",
  },
  {
    id: "k-auxiliary-7-methods",
    title: "辅助函数 7 大构造法",
    category: "一元微分",
    scenario: "中值定理证明题需要构造辅助函数 F(x) 满足罗尔条件",
    core: "① 积分法：把 ξ 换 x，积分（或解微分方程）得 F(x)。② 乘 e^{kx} 型：f' + kf = 0 → F = e^{kx}f(x)。③ 乘 x^n 型：xf' + nf = 0 → F = xⁿ f(x)。④ 除 g² 型：(f'g-fg')/g² = (f/g)'。⑤ 常数 k 值法：对称式设常数 = k，重新整理为 F(a)=F(b)。⑥ 构造两函数乘积/商。⑦ 变限积分作辅助函数。",
    examples: [
      { problem: "f 在 [0,1] 连续可导，f(0)=f(1)=0，证 ∃ξ 使 f'(ξ)+f(ξ)=0", solution: "观察 f' + f = 0 是 e^{kx} 型（k=1）。构造 F(x) = e^x f(x)。F(0)=F(1)=0，由罗尔定理 ∃ξ：F'(ξ) = e^ξ[f(ξ)+f'(ξ)] = 0 → f'(ξ)+f(ξ)=0。" },
    ],
    pitfalls: "构造完辅助函数必须验证其满足罗尔条件（区间两端值相等）。辅助函数构造是中值定理证明的核心，需多练习。",
  },
  {
    id: "k-rolle-chain",
    title: "证明 f^{(n)}(ξ)=0 的罗尔链法",
    category: "一元微分",
    scenario: "证明题要求证存在 ξ 使得 f 的 n 阶导数在该点为 0",
    core: "若能找到 n+1 个点使得函数值相等，则反复应用罗尔定理：f(x₁)=f(x₂)=...=f(x_{n+1}) → n 个一阶导数零点 → n-1 个二阶导数零点 → ... → 1 个 n 阶导数零点。",
    examples: [
      { problem: "f 在 [0,2] 有三阶导数，f(0)=f(1)=f(2)=0，证明 ∃ξ: f'''(ξ)=0", solution: "f(0)=f(1)=0 → ∃ξ₁∈(0,1): f'(ξ₁)=0。f(1)=f(2)=0 → ∃ξ₂∈(1,2): f'(ξ₂)=0。f'(ξ₁)=f'(ξ₂)=0 → ∃η∈(ξ₁,ξ₂): f''(η)=0。反复应用得 ∃ξ: f'''(ξ)=0。" },
    ],
    pitfalls: "罗尔链的关键是找到足够多的等值点。可以通过函数值、导数值、积分值等多途径找等值点。",
  },
  {
    id: "k-taylor-inequality",
    title: "泰勒展开证不等式（二阶导定号）",
    category: "一元微分",
    scenario: "含 f''(x) 符号条件的不等式证明题",
    core: "若 f''(x) ≥ 0（凸函数），则 f(x) ≥ f(x₀) + f'(x₀)(x-x₀)（图像在切线上方）。若 f''(x) ≤ 0（凹函数），则 f(x) ≤ 切线。关键：选好展开点 x₀（通常是区间端点、中点、或极值点）。",
    examples: [
      { problem: "f''(x) > 0，证明 f((x₁+x₂)/2) ≤ (f(x₁)+f(x₂))/2（Jensen 不等式）", solution: "设 x₀ = (x₁+x₂)/2。f(x₁) = f(x₀) + f'(x₀)(x₁-x₀) + ½f''(ξ₁)(x₁-x₀)² ≥ f(x₀) + f'(x₀)(x₁-x₀)。同理 f(x₂) ≥ f(x₀) + f'(x₀)(x₂-x₀)。相加得 f(x₁)+f(x₂) ≥ 2f(x₀)。" },
    ],
    pitfalls: "泰勒展开的余项形式（拉格朗日型、佩亚诺型）要选对。证明不等式用拉格朗日型（余项含中值），求极限用佩亚诺型（只需阶数）。",
  },
  {
    id: "k-extremum-inflection",
    title: "极值点与拐点的充分条件辨析",
    category: "一元微分",
    scenario: "求函数极值点、拐点，或判断某点的性质",
    core: "极值点：① 一阶必要条件：f'(x₀)=0（驻点）或 f' 不存在。② 一阶充分条件：x₀ 左右 f' 变号。③ 二阶充分条件：f'(x₀)=0 且 f''(x₀)≠0，f''>0 极小，<0 极大。拐点：f'' 变号的点（f''(x₀)=0 且左右符号改变，或 f'' 不存在但两侧二阶导数变号）。",
    examples: [
      { problem: "求 f(x) = x³ - 3x + 1 的极值点", solution: "f'(x) = 3x²-3 = 3(x-1)(x+1)。驻点 x=±1。f''(x)=6x。f''(1)=6>0 → x=1 极小；f''(-1)=-6<0 → x=-1 极大。f(1)=-1（极小值），f(-1)=3（极大值）。" },
    ],
    pitfalls: "f'(x₀)=0 只是必要条件，不是充分条件（如 f(x)=x³ 在 x=0）。拐点必须是二阶导数变号，f''(x₀)=0 不一定是拐点。",
  },
  {
    id: "k-implicit-derivative",
    title: "隐函数求导的链式整体法",
    category: "一元微分",
    scenario: "F(x,y)=0 确定的隐函数 y=y(x)，求 y' 或 y''",
    core: "一阶：方程两边对 x 求导，y 看作 x 的函数（链式法则），解出 y' = -F_x/F_y。二阶：对 y' 再求导，或将一阶导的表达式再次对 x 求导，结果仍用 x,y 表示。",
    examples: [
      { problem: "e^y + xy - e = 0，求 y'' 在 (0,1) 的值", solution: "一阶：e^y·y' + y + x·y' = 0 → y' = -y/(e^y+x)。在 (0,1)：y' = -1/e。二阶：y'' = -[y'(e^y+x) - y(e^y·y'+1)] / (e^y+x)²。代入 x=0, y=1, y'=-1/e 得 y'' = 1/e²。" },
    ],
    pitfalls: "求二阶导时 y' 本身还是 x 的函数，别忘了再乘 y'。结果化简后尽量用原方程消元。",
  },
  {
    id: "k-parametric-derivative",
    title: "参数方程求导公式",
    category: "一元微分",
    scenario: "参数方程 x=φ(t), y=ψ(t) 确定的函数 y=y(x)，求 dy/dx 和 d²y/dx²",
    core: `一阶：dy/dx = (dy/dt)/(dx/dt) = ψ'(t)/φ'(t)。二阶：d²y/dx² = d/dx(dy/dx) = d/dt(dy/dx) · dt/dx = [ψ''φ' - ψ'φ'' ] / φ'³。`,
    examples: [
      { problem: "x = a cos t, y = b sin t，求 d²y/dx²", solution: "dy/dx = (b cos t)/(-a sin t) = -(b/a)cot t。d²y/dx² = d/dt(-b/a · cot t) / (dx/dt) = (-b/a)(-csc² t) / (-a sin t) = -b/(a² sin³t)。" },
    ],
    pitfalls: "二阶导数不是一阶导数再对 t 求导，必须再除以 dx/dt（乘以 dt/dx）。这是参数方程求二阶导最常见的错误。",
  },
  {
    id: "k-logarithmic-diff",
    title: "对数求导法适用场景",
    category: "一元微分",
    scenario: "幂指函数 y = u(x)^{v(x)}、多个因子乘除开方的复杂函数求导",
    core: "两边取对数（隐函数），然后对 x 求导：y'/y = ...，最后解出 y'。幂指函数的导数不要记公式，用对数求导法推导即可。",
    examples: [
      { problem: "求 y = x^{sin x} 的导数", solution: "取对数：ln y = sin x · ln x。求导：y'/y = cos x · ln x + sin x · (1/x)。故 y' = x^{sin x}(cos x · ln x + sin x / x)。" },
    ],
    pitfalls: "对数求导只在函数值为正的区间直接成立。对于含绝对值或分段的情形需注意定义域。实际计算中默认取正值区间。",
  },
  {
    id: "k-darboux-theorem",
    title: "达布定理（导函数介值性）",
    category: "一元微分",
    scenario: "证明题涉及 f' 取某值、或导函数的零点/介值问题",
    core: "若 f 在 [a,b] 上可导，则 f'(x) 可取到 f'(a) 与 f'(b) 之间的一切值（导函数具有介值性，不必连续）。推论：若 f'(a)·f'(b) < 0，则存在 ξ∈(a,b) 使 f'(ξ)=0（导函数零点定理）。",
    examples: [
      { problem: "f 在 [a,b] 可导，f'(a)<0, f'(b)>0，证明存在 ξ 使 f'(ξ)=0", solution: "由达布定理，f' 在 [a,b] 上取遍 f'(a) 到 f'(b) 之间的所有值。因 0 在 [f'(a), f'(b)]（假设 f'(a)<0<f'(b)），故 ∃ξ 使 f'(ξ)=0。" },
    ],
    pitfalls: "达布定理告诉我们导函数不会有第一类间断点。但导函数可以有第二类间断点。不要误以为导函数一定连续。",
  },
  {
    id: "k-lhospital-trap",
    title: "洛必达法则使用误区清单",
    category: "一元微分",
    scenario: "使用洛必达法则时容易踩的坑",
    core: "陷阱一：不是 0/0 或 ∞/∞ 型就用 → 错误。陷阱二：求导后极限不存在（振荡除外）就认为原极限不存在 → 错误，洛必达是充分条件。陷阱三：数列极限直接洛 → 错误，要先化连续函数。陷阱四：循环（越洛越复杂）→ 换方法，如泰勒、等价无穷小。",
    examples: [
      { problem: "lim_{x→∞} (x+sin x)/x 能洛必达吗？", solution: "不能。虽然是 ∞/∞ 型，但求导后得 (1+cos x)/1 = 1+cos x，极限不存在（振荡）。洛必达条件不满足。直接算：(x+sin x)/x = 1 + (sin x)/x → 1。" },
    ],
    pitfalls: "洛必达法则不是万能的。每次用之前都要验型（0/0 或 ∞/∞），用了之后结果不存在也不代表原极限不存在。",
  },
  {
    id: "k-monotonicity-proof",
    title: "利用单调性证明不等式",
    category: "一元微分",
    scenario: "证明某个不等式 f(x) > g(x) 在区间上成立",
    core: "构造 F(x) = f(x) - g(x)，求 F'(x) 判断符号。若 F'(x) ≥ 0 且 F(a) ≥ 0，则 x>a 时 F(x) ≥ 0。若一阶导数符号不确定，继续求二阶导判断一阶导的单调性。",
    examples: [
      { problem: "证明 x > 0 时 e^x > 1 + x", solution: "设 F(x) = e^x - 1 - x。F(0) = 0。F'(x) = e^x - 1。当 x > 0 时 F'(x) > 0，故 F(x) 在 [0,+∞) 递增。因此 x > 0 时 F(x) > F(0) = 0，即 e^x > 1 + x。" },
    ],
    pitfalls: "必须确认区间左端点的函数值 ≥ 0。若端点值恰好为 0 且导数在区间内恒正，则区间内函数恒正。",
  },
  {
    id: "k-convex-function",
    title: "凸函数的几种等价定义",
    category: "一元微分",
    scenario: "判断函数凸凹性、用凸函数性质证明不等式",
    core: "f 是凸函数等价于：① f((1-t)x₁+tx₂) ≤ (1-t)f(x₁)+tf(x₂)（弦在曲线上方）② f''(x) ≥ 0（二阶导数非负）③ 图像在切线上方 ④ 差商 f(x)-f(y)/(x-y) 单调增。",
    examples: [
      { problem: "用凸函数证明：x>0, y>0 时 (x+y)/2 ≥ √(xy)（均值不等式）", solution: "f(t) = -ln t（t>0）。f''(t) = 1/t² > 0，故 f 是凸函数。由 Jensen：f((x+y)/2) ≤ (f(x)+f(y))/2，即 -ln((x+y)/2) ≤ -(ln x + ln y)/2 = -ln√(xy)。两边乘 -1 得 ln((x+y)/2) ≥ ln√(xy)，即 (x+y)/2 ≥ √(xy)。" },
    ],
    pitfalls: "注意凸函数的定义方向：国内教材 f''>0 叫凸（下凸），但有些国外教材叫 concave。需看语境。一致用 f''≥0 ⇔ 凸（下凸）。",
  },
  {
    id: "k-frema-point",
    title: "费马引理与极值必要条件",
    category: "一元微分",
    scenario: "证明题中用到某点处导数为 0 的结论",
    core: "费马引理：若 f(x) 在 x₀ 可导且 x₀ 是极值点，则 f'(x₀)=0。逆命题不成立（如 f(x)=x³ 在 x=0）。常用于：① 求极值的第一步找驻点 ② 罗尔定理证明的基础 ③ 反证法构造极值点。",
    examples: [
      { problem: "f 在 [a,b] 可导，f(a)=f(b)=0，证明 ∃ξ 使 f(ξ)+f'(ξ)=0", solution: "构造 F(x)=e^x f(x)。F(a)=F(b)=0。F 在 [a,b] 满足罗尔定理条件 → ∃ξ: F'(ξ)=0 → e^ξ[f(ξ)+f'(ξ)]=0 → f(ξ)+f'(ξ)=0。核心是费马引理保证了极值点处导数为 0。" },
    ],
    pitfalls: "费马引理只给出必要条件。找极值点还要用充分条件（一阶导变号或二阶导符号）。",
  },
  {
    id: "k-hospital-order",
    title: "高阶导数与莱布尼茨公式",
    category: "一元微分",
    scenario: "求两个函数乘积的 n 阶导数",
    core: `莱布尼茨公式：$(uv)^{(n)} = \\sum_{k=0}^{n} C_n^k u^{(k)} v^{(n-k)}$。特别有用的情形：其中一个是多项式（高阶导数为 0），如 (x^k f(x))^{(n)} 只有前 k+1 项非零。`,
    examples: [
      { problem: "求 y = x² e^x 的 n 阶导数", solution: "u = x²（u'=2x, u''=2, u^{(k)}=0 for k≥3），v = e^x（v^{(n)} = e^x）。y^{(n)} = C_n⁰x²e^x + C_n¹·2x·e^x + C_n²·2·e^x = e^x[x² + 2nx + n(n-1)]。" },
    ],
    pitfalls: "注意二项式系数 C(n,k) 不要记错。对于复杂的乘积（含三角函数、指数函数），莱布尼茨公式比逐次求导高效得多。",
  },
  {
    id: "k-chain-rule",
    title: "复合函数求导与链式法则",
    category: "一元微分",
    scenario: "多层复合函数求导",
    core: "若 y = f(g(x))，则 y' = f'(g(x)) · g'(x)。多层复合：一层层往里剥，每一层的导数相乘。关键是不要漏任何一层。常见层数：幂指函数（对数求导）、三角复合、根号复合、指数复合。",
    examples: [
      { problem: "求 y = ln(tan(x/2)) 的导数", solution: "三层复合：ln u, u = tan v, v = x/2。y' = (1/tan(x/2)) · sec²(x/2) · 1/2 = [cos(x/2)/sin(x/2)] · [1/cos²(x/2)] · 1/2 = 1/[2 sin(x/2) cos(x/2)] = 1/sin x = csc x。" },
    ],
    pitfalls: "最常见错误是漏乘内层导数。特别是外层简单内层复杂时，容易只算外导忘了内导。做完后检查：有几层复合，就有几个因子相乘。",
  },
  {
    id: "k-mean-value-multi",
    title: "双中值问题处理策略",
    category: "一元微分",
    scenario: "证明题要求证存在两个中值 ξ, η 满足某关系式",
    core: "策略一：两次应用拉格朗日（不同区间或不同函数）。策略二：一次拉格朗日 + 一次柯西。策略三：将两个中值分离到等式两边，分别对两边用中值定理。",
    examples: [
      { problem: "f 在 [a,b] 可导，证明 ∃ξ, η ∈ (a,b) 使 f'(ξ) = (a+b)/2η · f'(η)", solution: "分离：2η f'(η) = (a+b)f'(ξ)。左边对 g(x)=x² 和 f(x) 用柯西：[f(b)-f(a)]/[b²-a²] = f'(η)/(2η) → 2η f'(η) = [f(b)-f(a)]/[b-a] · (a+b)。右边 f'(ξ) = [f(b)-f(a)]/[b-a]（拉格朗日）。代入即得。" },
    ],
    pitfalls: "双中值问题要注意两个中值是否需要不同（ξ≠η）。如果需要不同，应在两个不同子区间分别应用中值定理。",
  },
  {
    id: "k-differential-form",
    title: "一阶微分形式不变性",
    category: "一元微分",
    scenario: "利用微分形式不变性求隐函数或复合函数的微分",
    core: "不论 u 是自变量还是中间变量，dy = f'(u) du 形式不变。利用这点可以对等式两边同时求微分，不用区分谁是自变量谁是因变量，特别适合隐函数和参数方程。",
    examples: [
      { problem: "用微分形式不变性求 e^y + xy = e 的 dy", solution: "两边求微分：d(e^y) + d(xy) = 0 → e^y dy + (y dx + x dy) = 0 → (e^y + x)dy = -y dx → dy = -y/(e^y+x) dx。结果和隐函数求导一致。" },
    ],
    pitfalls: "微分形式不变性只对一阶微分成立。二阶及以上不具有形式不变性。",
  },
  {
    id: "k-related-rates",
    title: "相关变化率问题",
    category: "一元微分",
    scenario: "应用题：两个变量都随时间变化，已知一个变化率求另一个",
    core: "步骤：① 建立变量之间的关系式（几何关系、物理公式等）② 两边对时间 t 求导（链式法则）③ 代入已知瞬间的值和变化率，解出未知变化率。",
    examples: [
      { problem: "气球半径以 2cm/s 速率增大，求半径 10cm 时体积的变化率", solution: "V = (4/3)πr³。两边对 t 求导：dV/dt = 4πr² · dr/dt。代入 r=10, dr/dt=2：dV/dt = 4π·100·2 = 800π cm³/s。" },
    ],
    pitfalls: "求导必须在代入数值之前完成（先求导后代值）。先代入再求导会得到 0（常数导数为 0）。",
  },
  {
    id: "k-mvt-cauchy-mix",
    title: "柯西中值定理与拉格朗日的区别",
    category: "一元微分",
    scenario: "判断何时用柯西中值定理而非常规拉格朗日",
    core: "拉格朗日是单函数 f，柯西是双函数 f 和 g。当结论中出现两个函数的导数比，或出现 [f(b)-f(a)]/[g(b)-g(a)] 形式时，用柯西。拉格朗日是柯西当 g(x)=x 时的特例。",
    examples: [
      { problem: "f,g 在 [a,b] 连续可导，g'(x)≠0，证 ∃ξ：[f(b)-f(a)]/[g(b)-g(a)] = f'(ξ)/g'(ξ)", solution: "这就是柯西中值定理本身。构造辅助函数 F(x) = f(x) - f(a) - [f(b)-f(a)]/[g(b)-g(a)] · [g(x)-g(a)]。验证 F(a)=F(b)=0，用罗尔定理。" },
    ],
    pitfalls: "柯西定理不能分别对 f 和 g 用拉格朗日然后相除——因为两个中值 ξ 可能不同！柯西定理的精髓是同一个 ξ。",
  },
  {
    id: "k-cauchy-mean-value-form",
    title: "柯西中值定理的几何意义",
    category: "一元微分",
    scenario: "理解柯西中值定理的几何直观",
    core: "参数方程 x=g(t), y=f(t)（t∈[a,b]）表示的曲线，两端点连线斜率为 [f(b)-f(a)]/[g(b)-g(a)]，曲线上存在一点 t=ξ 处的切线斜率 f'(ξ)/g'(ξ) 与之相等。就是参数方程形式的拉格朗日中值定理。",
    examples: [
      { problem: "用几何直观解释为什么柯西定理中 g'(x) 不能为 0", solution: "若 g'(x)=0，则切线是垂直的（竖直切线），dx/dt=0，dy/dx 不存在（无穷大）。斜率不存在时无法等于有限值的弦斜率。几何上 g'(x)≠0 保证了曲线上每点都有非竖直切线。" },
    ],
    pitfalls: "柯西定理条件 g'(x)≠0 是重要的，违反时定理可能不成立。不要忽略这个条件。",
  },

  // ========== 一元积分专题（20 张） ==========
  {
    id: "k-int-interval-reproduce",
    title: "区间再现公式与应用",
    category: "一元积分",
    scenario: "积分区间 [0,a]，被积函数含 x 和 f(x)、f(a-x) 的对称形式",
    core: `$\\int_0^a f(x)\\,dx = \\int_0^a f(a-x)\\,dx$。令 x = a-t 即证。常用推广：$\\int_0^{\\pi/2} f(\\sin x)dx = \\int_0^{\\pi/2} f(\\cos x)dx$；$\\int_0^\\pi x f(\\sin x)dx = \\frac{\\pi}{2}\\int_0^\\pi f(\\sin x)dx$。`,
    examples: [
      { problem: `求 $\\int_0^{\\frac{\\pi}{2}} \\dfrac{\\sin x}{\\sin x + \\cos x} dx$`, solution: "令 I = ∫ sin x / (sin x + cos x) dx。由区间再现，I = ∫ cos x / (sin x + cos x) dx。两式相加：2I = ∫ 1 dx = π/2。故 I = π/4。" },
    ],
    pitfalls: "适用条件：被积函数分子分母是同类型函数对（sin/cos, tan/cot 等），区间对称。做完替换后要检查积分上下限是否变号。",
  },
  {
    id: "k-int-by-parts-table",
    title: "分部积分表格法（快速计算）",
    category: "一元积分",
    scenario: "需要多次分部积分的情形：多项式 × 指数/三角/对数等",
    core: "把被积函数拆成 u 和 dv。左边列不断求导，右边列不断积分，对角线相乘，符号交替。直到左边变 0（多项式）或出现循环。公式：∫u dv = uv - u'v₁ + u''v₂ - ... + (-1)^{n}∫u^{(n)}v_n dx。",
    examples: [
      { problem: "求 ∫ x² e^x dx", solution: "左列：x² → 2x → 2 → 0。右列：eˣ → eˣ → eˣ → eˣ。结果 = x²eˣ - 2x·eˣ + 2·eˣ + C = eˣ(x²-2x+2) + C。" },
    ],
    pitfalls: "注意符号（交替正负）。如果左边是多项式（有限步变 0）效果最好。遇到循环（如 eˣ sin x）时设为 I 解方程。",
  },
  {
    id: "k-int-wallis",
    title: "Wallis 公式与 n 重阶乘积分",
    category: "一元积分",
    scenario: "计算含 sinⁿx 或 cosⁿx 在 [0, π/2] 上的积分",
    core: "∫₀^{π/2} sinⁿx dx = ∫₀^{π/2} cosⁿx dx。n 偶时：(n-1)/n · (n-3)/(n-2) · ... · 1/2 · π/2。n 奇时：(n-1)/n · (n-3)/(n-2) · ... · 2/3 · 1。记忆：偶乘 π/2，奇乘 1（偶π奇1）。",
    examples: [
      { problem: "求 ∫₀^{π/2} sin⁵x dx", solution: "n=5 为奇数。= (4/5)(2/3)(1) = 8/15。验证：用换元 u = cos x，∫(1-cos²x)² sin x dx = -∫(1-u²)² du = -[u - 2u³/3 + u⁵/5] + C，代入上下限得 1 - 2/3 + 1/5 = (15-10+3)/15 = 8/15 ✓" },
    ],
    pitfalls: "区间必须是 [0, π/2]。如果是 [0, π] 且是 sinⁿx：n 偶时 2 倍 [0, π/2]，n 奇时也是 2 倍（因为 sin 在 [0,π] 非负且对称）。",
  },
  {
    id: "k-int-trig-universal",
    title: "三角有理式万能代换",
    category: "一元积分",
    scenario: "含 sin x 和 cos x 的有理式积分，无特殊技巧时用",
    core: "令 t = tan(x/2)，则 sin x = 2t/(1+t²)，cos x = (1-t²)/(1+t²)，dx = 2dt/(1+t²)。化为关于 t 的有理函数积分。",
    examples: [
      { problem: "求 ∫ dx/(1+sin x)", solution: "令 t = tan(x/2)，sin x = 2t/(1+t²)，dx = 2dt/(1+t²)。原式 = ∫ [2dt/(1+t²)] / [1 + 2t/(1+t²)] = ∫ 2dt/(1+t)² = -2/(1+t) + C = -2/(1+tan(x/2)) + C。" },
    ],
    pitfalls: "万能代换计算量大，是最后手段。优先考虑：① 分子分母同乘 ② 三角恒等变形 ③ 凑微分。只有实在没招了才用万能代换。",
  },
  {
    id: "k-int-radical-trig-sub",
    title: "含根号积分：三角代换对照",
    category: "一元积分",
    scenario: "被积函数含 √(a²-x²)、√(a²+x²)、√(x²-a²)",
    core: "① √(a²-x²)：令 x = a sin t，dx = a cos t dt，根式 = a cos t；② √(a²+x²)：令 x = a tan t，dx = a sec² t dt，根式 = a sec t；③ √(x²-a²)：令 x = a sec t，dx = a sec t tan t dt，根式 = a tan t。代换后一定要回代成 x 的函数（画辅助三角形）。",
    examples: [
      { problem: "求 ∫ √(a² - x²) dx", solution: "令 x = a sin t，dx = a cos t dt。原式 = ∫ a cos t · a cos t dt = a²∫ cos²t dt = a²∫(1+cos 2t)/2 dt = a²(t/2 + sin 2t/4) + C。回代：t = arcsin(x/a)，sin 2t = 2 sin t cos t = 2(x/a)(√(a²-x²)/a)。结果 = (a²/2)arcsin(x/a) + (x/2)√(a²-x²) + C。" },
    ],
    pitfalls: "代换后别忘了乘 dx 的因子。回代时画直角三角形，把 t 的三角函数都用 x 和 a 表示。",
  },
  {
    id: "k-int-improper-p",
    title: "反常积分收敛判别法",
    category: "一元积分",
    scenario: "判断反常积分（无穷限或瑕积分）的敛散性",
    core: "无穷限：① p-判别：∫₁^∞ 1/x^p dx，p>1 收敛，p≤1 发散。② 比较判别：若 0≤f≤g 且 ∫g 收敛则 ∫f 收敛。③ 比较极限形式：lim_{x→∞} x^p f(x) = L（有限正数），则 p>1 收敛。瑕积分类似，看 x→a⁺ 时 f(x) 趋于无穷的速度。",
    examples: [
      { problem: "判断 ∫₁^∞ dx/(x√(1+x²)) 的敛散性", solution: "x→+∞ 时，1/(x√(1+x²)) ~ 1/x²，p=2>1。由比较极限形式，∫₁^∞ 1/x² dx 收敛，故原积分收敛。" },
    ],
    pitfalls: "比较极限形式要求极限是有限正数（不能是 0 或 ∞，否则需要再讨论）。无穷限和瑕积分的 p-判别临界值方向相反，不要搞混。",
  },
  {
    id: "k-int-periodic",
    title: "周期函数积分平移性质",
    category: "一元积分",
    scenario: "被积函数是周期函数，积分区间长度为周期整数倍",
    core: "若 f 以 T 为周期，则 ∫_a^{a+T} f(x)dx = ∫₀^T f(x)dx（与 a 无关）。n 个周期：∫_a^{a+nT} f(x)dx = n∫₀^T f(x)dx。",
    examples: [
      { problem: "求 ∫₀^{nπ} √(1+sin 2x) dx", solution: "√(1+sin 2x) = |sin x + cos x| = √2|sin(x+π/4)|，周期为 π。一个周期 [0,π] 上积分 = √2 ∫₀^π |sin(x+π/4)| dx = √2 ∫₀^π sin t dt = 2√2。n 个周期：2n√2。" },
    ],
    pitfalls: "含绝对值或平方的三角函数，周期可能变小（如 sin²x 周期是 π 不是 2π）。先确定正确的周期长度。",
  },
  {
    id: "k-int-symmetry",
    title: "积分对称性：奇偶 + 轮换对称",
    category: "一元积分",
    scenario: "对称区间上的定积分，或轮换对称型的积分",
    core: "① 对称区间：∫_{-a}^a f(x)dx，f 奇 = 0，f 偶 = 2∫₀^a f(x)dx。② 轮换对称：若积分变量 x 和 a-x 互换后积分不变，则可以做 x → a-x 的替换（区间再现就是一种）。",
    examples: [
      { problem: "求 ∫_{-1}^1 (x² + x sin⁴x)/(1+√(1-x²)) dx", solution: "拆成两部分：x²/(1+√(1-x²)) 是偶函数，x sin⁴x/(1+√(1-x²)) 是奇函数（奇函数 = 0）。原式 = 2∫₀¹ x²/(1+√(1-x²)) dx。有理化分母：乘以 (1-√(1-x²))/(1-√(1-x²)) 得 1-√(1-x²)。= 2∫₀¹ [1 - √(1-x²)] dx = 2[1 - π/4] = 2 - π/2。" },
    ],
    pitfalls: "先看积分区间是否对称，再看被积函数是否有奇偶分量。有时需要拆分被积函数为奇+偶两部分。",
  },
  {
    id: "k-int-variable-limit",
    title: "变限积分求导公式",
    category: "一元积分",
    scenario: "变上限（下限）积分函数求导，或含参变限积分",
    core: "d/dx ∫_a^x f(t)dt = f(x)。推广：d/dx ∫_{u(x)}^{v(x)} f(t)dt = f(v(x))v'(x) - f(u(x))u'(x)。若被积函数也含 x，需先把 x 提到积分号外或做变量替换。",
    examples: [
      { problem: "求 d/dx ∫_x^{x²} sin t² dt", solution: "= sin((x²)²) · (x²)' - sin(x²) · x' = 2x sin(x⁴) - sin(x²)。" },
    ],
    pitfalls: "被积函数含 x 时不能直接代！如 d/dx ∫₀ˣ f(x-t)dt 要先做替换 u = x-t，化为 ∫₀ˣ f(u)du 再求导。",
  },
  {
    id: "k-int-substitution",
    title: "换元积分法技巧大全",
    category: "一元积分",
    scenario: "各类不定积分换元技巧总结",
    core: "第一类换元（凑微分）：熟悉 d(x^α)、d(ln x)、d(eˣ)、d(sin x)等，把常数和因子凑进微分里。第二类换元：三角代换（去根号）、倒代换 t=1/x（分母次数比分子高 2 以上）、指数代换 t=eˣ 等。",
    examples: [
      { problem: "求 ∫ dx/[x(x⁶+4)]", solution: "用倒代换 t = 1/x，dx = -1/t² dt。原式 = ∫ [ -1/t² dt ] / [ (1/t)(1/t⁶ + 4) ] = ∫ -t⁵/(1+4t⁶) dt。令 u = 1+4t⁶, du=24t⁵dt。= -1/24 ln|1+4t⁶| + C = (1/4)ln|x| - (1/24)ln|x⁶+4| + C。" },
    ],
    pitfalls: "换元必换限（定积分），不定积分换元后必须回代。多种方法可选时选计算量最小的。",
  },
  {
    id: "k-int-mean-value",
    title: "积分中值定理",
    category: "一元积分",
    scenario: "证明题中出现积分值与某点函数值的关系",
    core: "积分第一中值定理：若 f 在 [a,b] 连续，则存在 ξ∈[a,b] 使 ∫_a^b f(x)dx = f(ξ)(b-a)。加强版（证明题常用）：ξ ∈ (a,b)（开区间），用原函数的拉格朗日中值定理证。",
    examples: [
      { problem: "f 在 [0,1] 连续递减，证明 ∫₀¹ x f(x)dx ≤ ½ ∫₀¹ f(x)dx", solution: "考虑 F(x) = ∫₀ˣ f(t)dt - xf(x)。F'(x) = f(x) - f(x) - xf'(x) = -xf'(x)。因为 f 递减，f'≤0，所以 F'≥0，F 递增。F(0)=0，故 F(x)≥0。或用积分中值定理结合单调性。" },
    ],
    pitfalls: "积分中值定理的 ξ 在闭区间 [a,b] 上。但很多证明题需要 ξ 在开区间 (a,b) 内，此时要用变上限积分 + 拉格朗日中值定理。",
  },
  {
    id: "k-int-improper-calc",
    title: "反常积分计算步骤",
    category: "一元积分",
    scenario: "计算反常积分（无穷限或瑕积分）",
    core: "步骤：① 找出所有瑕点（被积函数无界的点 + 无穷端点）② 分段（每段只含一个瑕点）③ 对每段取极限（瑕点处取单侧极限）④ 计算定积分后求极限。只要有一段发散，整体就发散。",
    examples: [
      { problem: "判断并计算 ∫₀¹ dx/√(x(1-x))", solution: "瑕点 x=0 和 x=1。拆为 ∫₀^{1/2} + ∫_{1/2}^1。∫ 1/√(x(1-x)) dx = 2 arcsin √x + C。x→0⁺ 时 2 arcsin √x → 0。x→1⁻ 时 2 arcsin √x → 2·π/2 = π。两段都收敛。结果 = π。" },
    ],
    pitfalls: "不要忽略内部瑕点！被积函数在积分区间内某点趋向无穷时，必须从该点拆开。直接用牛顿-莱布尼茨公式会得到错误结果。",
  },
  {
    id: "k-int-substitution-formula",
    title: "第一类换元常用凑微分表",
    category: "一元积分",
    scenario: "不定积分凑微分技巧速查",
    core: "① eˣ dx = d(eˣ) ② (1/x)dx = d(ln x) ③ dx/x² = -d(1/x) ④ cos x dx = d(sin x) ⑤ sin x dx = -d(cos x) ⑥ sec²x dx = d(tan x) ⑦ (1/√x)dx = 2d(√x) ⑧ dx/(1+x²) = d(arctan x)。",
    examples: [
      { problem: "求 ∫ eˣ/(1+e^{2x}) dx", solution: "凑微分：∫ 1/(1+(eˣ)²) d(eˣ) = arctan(eˣ) + C。" },
    ],
    pitfalls: "凑微分是第一类换元的核心，熟练度直接影响积分速度。熟记常见微分形式，多练习。",
  },
  {
    id: "k-int-rational-function",
    title: "有理函数积分部分分式法",
    category: "一元积分",
    scenario: "真分式 P(x)/Q(x) 的积分",
    core: "步骤：① 假分式 → 多项式除法化为整式 + 真分式 ② 真分式分解为部分分式（单因式一次项、重因式一次项、不可约二次因式）③ 分别积分。一次因式对应对数，二次因式配方法后可能出现反正切。",
    examples: [
      { problem: "求 ∫ dx/[x(x²+1)]", solution: "设 1/[x(x²+1)] = A/x + (Bx+C)/(x²+1)。通分：A(x²+1) + (Bx+C)x = 1。令 x=0：A=1。比较系数：A+B=0 → B=-1；C=0。原式 = ∫ [1/x - x/(x²+1)] dx = ln|x| - ½ ln(x²+1) + C = ln|x/√(x²+1)| + C。" },
    ],
    pitfalls: "部分分式分解要完整——重根对应多个分式（各幂次都要有），不可约二次因式分子是一次式。",
  },
  {
    id: "k-int-by-parts-select",
    title: "分部积分 u 选择优先级",
    category: "一元积分",
    scenario: "∫u dv 型积分，选谁作为 u 谁作为 dv",
    core: "口诀：反对幂三指（反三角函数、对数、幂函数、三角函数、指数函数）。排在前面的选作 u，后面的进入 dv。原因：反对求导变简单（变代数），三指积分后仍是同类。",
    examples: [
      { problem: "求 ∫ x cos x dx", solution: "幂函数 vs 三角函数。幂在前，选 u=x，dv=cos x dx。则 du=dx，v=sin x。∫x cos x dx = x sin x - ∫sin x dx = x sin x + cos x + C。" },
    ],
    pitfalls: "选反 u 会越积越复杂（如把三角函数设为 u，幂函数放 dv，下次积分幂函数幂次升高）。",
  },
  {
    id: "k-int-area-volume",
    title: "定积分几何应用：面积与体积",
    category: "一元积分",
    scenario: "求平面图形面积、旋转体体积",
    core: "面积：直角坐标 ∫_a^b |f(x)-g(x)| dx；极坐标 (1/2)∫α^β r²(θ) dθ。体积：圆盘法 V = π∫_a^b [f(x)]² dx；壳层法 V = 2π∫_a^b x |f(x)| dx。弧长：∫_a^b √(1+(f'(x))²) dx。",
    examples: [
      { problem: "求 y = sin x (0≤x≤π) 与 x 轴围成的图形绕 x 轴旋转一周的体积", solution: "圆盘法：V = π ∫₀^π sin²x dx = π ∫₀^π (1-cos 2x)/2 dx = π [x/2 - (sin 2x)/4]₀^π = π · π/2 = π²/2。" },
    ],
    pitfalls: "旋转体体积要看清旋转轴（x 轴、y 轴、某直线）。轴不同方法不同（绕 y 轴常用壳层法更方便）。",
  },
  {
    id: "k-int-fubini-swap",
    title: "交换积分次序（二重积分→累次积分）",
    category: "一元积分",
    scenario: "计算累次积分时，按原次序算不出来，需要交换积分次序",
    core: "步骤：① 根据积分限画出积分区域 D ② 确定 D 在另一种坐标下的不等式表示 ③ 写出交换后的累次积分。关键：画图正确，注意边界曲线方程。",
    examples: [
      { problem: "计算 ∫₀¹ dx ∫_x¹ e^{-y²} dy", solution: "e^{-y²} 的原函数不是初等函数，必须交换次序。D: 0≤x≤1, x≤y≤1 → 改写为 0≤y≤1, 0≤x≤y。原式 = ∫₀¹ dy ∫₀ʸ e^{-y²} dx = ∫₀¹ y e^{-y²} dy = [-½ e^{-y²}]₀¹ = ½(1 - e⁻¹)。" },
    ],
    pitfalls: "交换积分次序一定要画图！不画图很容易把积分限搞反。特别注意上下限的大小关系。",
  },
  {
    id: "k-int-euler-sub",
    title: "欧拉代换（二次根式积分）",
    category: "一元积分",
    scenario: "含 √(ax²+bx+c) 的积分，a≠0",
    core: "第一欧拉代换（a>0）：√(ax²+bx+c) = t ± x√a。第二欧拉代换（c>0）：√(ax²+bx+c) = tx ± √c。第三欧拉代换（ax²+bx+c 有实根 α,β）：√(ax²+bx+c) = t(x-α)。代换后化为有理函数积分。",
    examples: [
      { problem: "求 ∫ dx/[x+√(x²+x+1)]", solution: "用第一欧拉代换（a=1>0）：√(x²+x+1) = t - x。平方得 x²+x+1 = t² - 2tx + x² → x+1 = t² - 2tx → x(1+2t) = t²-1 → x = (t²-1)/(1+2t)。dx = ... 计算后代入化简，最终化为有理函数积分。" },
    ],
    pitfalls: "欧拉代换计算较繁琐。能配方用三角代换的优先用三角代换。只在无法用其他方法时才用欧拉代换。",
  },
  {
    id: "k-int-parametric-diff",
    title: "含参积分求导（莱布尼茨公式）",
    category: "一元积分",
    scenario: "积分内含有参数，需要对参数求导",
    core: "若 F(t) = ∫_{a(t)}^{b(t)} f(x,t) dx，且 f 和 ∂f/∂t 连续，则 F'(t) = f(b(t),t)·b'(t) - f(a(t),t)·a'(t) + ∫_{a(t)}^{b(t)} ∂f/∂t dx。三项：上下限变动项 + 被积函数求导项。",
    examples: [
      { problem: "设 F(t) = ∫₀ᵗ ln(1+tx)/x dx，求 F'(1)", solution: "莱布尼茨公式：F'(t) = ln(1+t²)/t · 1 + ∫₀ᵗ [1/(1+tx)] dx = ln(1+t²)/t + [ln(1+tx)/t]₀ᵗ = ln(1+t²)/t + ln(1+t²)/t = 2 ln(1+t²)/t。F'(1) = 2 ln 2。" },
    ],
    pitfalls: "使用条件：被积函数及其偏导数要连续（在适当区域内）。反常含参积分要验证一致收敛才能换序。",
  },
  {
    id: "k-int-improper-comparison",
    title: "反常积分比较判别法",
    category: "一元积分",
    scenario: "判断反常积分敛散性（非负函数），不需要精确计算",
    core: "设 0 ≤ f(x) ≤ g(x)：① ∫g 收敛 → ∫f 收敛 ② ∫f 发散 → ∫g 发散。极限形式：若 lim_{x→∞} f(x)/g(x) = L，0 < L < ∞ 则同敛散；L=0 且 ∫g 收敛则 ∫f 收敛；L=∞ 且 ∫g 发散则 ∫f 发散。",
    examples: [
      { problem: "判断 ∫₁^∞ sin²x / x dx 的敛散性", solution: "sin²x/x ≥ 0。sin²x/x = (1-cos 2x)/(2x) = 1/(2x) - cos 2x/(2x)。∫₁^∞ 1/x dx 发散（p=1），∫₁^∞ cos 2x/x dx 条件收敛（狄利克雷判别）。整体发散。" },
    ],
    pitfalls: "比较判别只适用于非负函数。条件收敛的积分不能用普通比较判别。振荡型积分常用狄利克雷或阿贝尔判别。",
  },

  // ========== 多元微分/积分专题（20 张） ==========
  {
    id: "k-multi-total-differential",
    title: "全微分形式不变性",
    category: "多元微分",
    scenario: "复合函数求全微分、隐函数微分",
    core: `无论 u, v 是自变量还是中间变量，dz = \frac{\partial z}{\partial u} du + \frac{\partial z}{\partial v} dv 形式不变。利用这点可以不分层次直接对等式两边求微分，最后整理出 dx, dy 前的系数即对应偏导。`,
    examples: [
      { problem: "z = f(x²+y², xy)，用全微分形式不变性求 ∂z/∂x 和 ∂z/∂y", solution: "令 u = x²+y², v = xy。dz = f₁ du + f₂ dv = f₁(2x dx + 2y dy) + f₂(y dx + x dy) = (2x f₁ + y f₂)dx + (2y f₁ + x f₂)dy。故 ∂z/∂x = 2x f₁ + y f₂，∂z/∂y = 2y f₁ + x f₂。" },
    ],
    pitfalls: "全微分形式不变性只对一阶微形成立。二阶及以上没有形式不变性。",
  },
  {
    id: "k-multi-implicit-system",
    title: "隐函数组求导（雅可比行列式视角）",
    category: "多元微分",
    scenario: "两个方程 F(x,y,u,v)=0, G(x,y,u,v)=0 确定 u=u(x,y), v=v(x,y)，求偏导",
    core: `令 J = \frac{\partial(F,G)}{\partial(u,v)} = \begin{vmatrix} F_u & F_v \\ G_u & G_v \end{vmatrix}$。若 J ≠ 0，则 $\frac{\partial u}{\partial x} = -\frac{1}{J}\frac{\partial(F,G)}{\partial(x,v)}$，$\frac{\partial v}{\partial x} = -\frac{1}{J}\frac{\partial(F,G)}{\partial(u,x)}$。记忆：把 u 换成 x 或 v 换成 x，加负号除以 J。`,
    examples: [
      { problem: "{ x+y+u+v=1; x²+y²+u²+v²=2 }，求 ∂u/∂x", solution: "令 F=x+y+u+v-1, G=x²+y²+u²+v²-2。J = |F_u F_v; G_u G_v| = |1 1; 2u 2v| = 2(v-u)。∂(F,G)/∂(x,v) = |1 1; 2x 2v| = 2(v-x)。故 ∂u/∂x = -(v-x)/(v-u) = (x-v)/(v-u)。" },
    ],
    pitfalls: "雅可比行列式的展开顺序不能错（斜乘相减）。分子行列式中，把对哪个变量求偏导，就替换哪个列。",
  },
  {
    id: "k-multi-directional-gradient",
    title: "方向导数与梯度的关系",
    category: "多元微分",
    scenario: "求方向导数最大值、沿哪个方向增长最快",
    core: "方向导数 ∂f/∂l = ∇f · e_l = |∇f| cos θ（θ 为梯度方向与方向 l 的夹角）。当 cos θ = 1 即沿梯度方向时，方向导数最大，最大值 = |∇f|（梯度的模）。梯度方向 = 函数值增长最快的方向。负梯度 = 下降最快方向。",
    examples: [
      { problem: "f(x,y)=x²+y²-1，求在点(1,1)处沿哪个方向增长最快？最大值是多少？", solution: "∇f = (2x, 2y)，在(1,1)处 ∇f = (2, 2)。沿梯度方向(2,2) 即方向(1,1)/√2 增长最快。最大值 = |∇f| = √(4+4) = 2√2。" },
    ],
    pitfalls: "方向导数是标量（一个数），梯度是向量。不要混淆。梯度方向指向函数值增大的方向（不是减小方向）。",
  },
  {
    id: "k-multi-lagrange-multiplier",
    title: "条件极值拉格朗日乘数法",
    category: "多元微分",
    scenario: "在约束条件 φ(x,y,z)=0 下求 f(x,y,z) 的极值",
    core: "构造拉格朗日函数 L = f + λφ。求偏导并令为 0：L_x=0, L_y=0, L_z=0, L_λ=0（即 φ=0）。解方程组得可能的极值点。多个约束时用多个乘数：L = f + λ₁φ₁ + λ₂φ₂。",
    examples: [
      { problem: "求 f(x,y)=xy 在约束 x+y=1 下的极值", solution: "L = xy + λ(x+y-1)。L_x = y+λ=0, L_y = x+λ=0, L_λ = x+y-1=0。由前两式 x=y，代入得 x=y=1/2，λ=-1/2。点(1/2, 1/2)，f=1/4。判定：由 x+y=1 知 y=1-x，f=x(1-x)=x-x² 开口向下，顶点为最大值。最大值 1/4。" },
    ],
    pitfalls: "拉格朗日乘数法只给出必要条件。是否为极值、是极大还是极小需要结合几何意义或二阶微分（海塞矩阵）进一步判定。",
  },
  {
    id: "k-multi-double-coord-choice",
    title: "二重积分坐标系选择策略",
    category: "多元积分",
    scenario: "选择直角坐标还是极坐标计算二重积分",
    core: "选极坐标的信号：① 积分区域是圆、扇形、环形（边界含 x²+y²）② 被积函数含 x²+y² 或 y/x。被积函数和积分区域都出现圆/极坐标特征时，必选极坐标。否则用直角坐标。极坐标：dσ = r dr dθ。",
    examples: [
      { problem: "计算 ∬_D e^{-(x²+y²)} dσ，D: x²+y² ≤ a²", solution: "区域是圆，被积函数含 x²+y² → 极坐标。= ∫₀^{2π} dθ ∫₀ᵃ e^{-r²} r dr = 2π · [-½ e^{-r²}]₀ᵃ = π(1-e^{-a²})。（直角坐标下 e^{-x²} 积不出来！）" },
    ],
    pitfalls: "极坐标下面积元素是 r dr dθ，不是 dr dθ！那个 r 是雅可比行列式，千万不能忘。",
  },
  {
    id: "k-multi-triple-coord",
    title: "三重积分坐标系对照表",
    category: "多元积分",
    scenario: "选择直角坐标、柱坐标还是球坐标计算三重积分",
    core: "① 直角坐标：先一后二（投影法）或先二后一（截面法）。② 柱坐标（投影域是圆/被积函数含 x²+y²，且沿 z 轴变化简单）：dV = r dr dθ dz。③ 球坐标（中心对称、原点为球心）：x = r sinφ cosθ, y = r sinφ sinθ, z = r cosφ，dV = r² sinφ dr dφ dθ。",
    examples: [
      { problem: "计算 ∭_Ω (x²+y²) dV，Ω: x²+y² ≤ a², 0≤z≤h", solution: "柱坐标（旋转体，被积含 x²+y²）。= ∫₀^{2π} dθ ∫₀ᵃ r dr ∫₀^h r² dz = 2π · ∫₀ᵃ r³ dr · h = 2πh · a⁴/4 = πa⁴h/2。" },
    ],
    pitfalls: "球坐标的雅可比是 r² sinφ（不是 r sinφ）。φ 是与 z 轴正方向的夹角（极角，0 到 π），θ 是绕 z 轴的方位角。别搞混两个角的定义。",
  },
  {
    id: "k-multi-greens-theorem",
    title: "格林公式与奇点处理（挖洞法）",
    category: "多元积分",
    scenario: "第二类曲线积分，闭合曲线但内部有奇点（∂P/∂y ≠ ∂Q/x 在某点不成立）",
    core: "格林公式：∮_L Pdx+Qdy = ∬_D (∂Q/∂x - ∂P/∂y) dσ，要求 D 是光滑闭合曲线 L 围成的单连通区域，P, Q 在 D 内有连续一阶偏导。若 D 内有奇点 M₀：做小闭合曲线 L₁ 包围 M₀（与 L 同方向），则 ∮_L - ∮_{L₁} = ∬_{D\{M₀}} (∂Q/∂x - ∂P/∂y) dσ。若在 D\{M₀} 上 ∂Q/∂x = ∂P/∂y，则 ∮_L = ∮_{L₁}。",
    examples: [
      { problem: "计算 ∮_L (x dy - y dx)/(x²+y²)，L 为不经过原点的正向简单闭合曲线", solution: "P = -y/(x²+y²), Q = x/(x²+y²)。∂Q/∂x = (y²-x²)/(x²+y²)² = ∂P/∂y（除原点外）。若 L 不包围原点：由格林公式 = 0。若 L 包围原点：取小圆周 L₁: x²+y²=ε² 正向，∮_{L₁} = ∫₀^{2π} [ε cos t·ε cos t - ε sin t·(-ε sin t)]/ε² dt = ∫₀^{2π} 1 dt = 2π。由挖洞法，∮_L = 2π。" },
    ],
    pitfalls: "挖洞时内圈曲线方向要与外圈同向（同正或同负）。注意格林公式的正向是逆时针（左手定则：区域在左侧）。",
  },
  {
    id: "k-multi-gauss-divergence",
    title: "高斯公式（散度定理）与补面法",
    category: "多元积分",
    scenario: "第二类曲面积分，曲面非闭合或计算复杂",
    core: "高斯公式：∯_Σ Pdydz + Qdzdx + Rdxdy = ∭_Ω (∂P/∂x + ∂Q/∂y + ∂R/∂z) dV。Σ 取外侧。若 Σ 不闭合，补面 Σ₁ 使 Σ+Σ₁ 闭合：∫∫_Σ = ∭_Ω div F dV - ∫∫_{Σ₁}（注意符号，补面方向要与原曲面构成整体外侧）。",
    examples: [
      { problem: "计算 ∬_Σ x³ dydz + y³ dzdx + z³ dxdy，Σ 为 z = √(1-x²-y²) 的上侧", solution: "补面 Σ₁: z=0, x²+y²≤1，取下侧。Σ+Σ₁ 构成闭合曲面（上半球面+底面），但外侧是上侧+下侧吗？上半球外侧是上侧，底面外侧应该是下侧 ✓。高斯公式：∭_Ω 3(x²+y²+z²) dV。球坐标：= 3∫₀^{2π}dθ∫₀^{π/2}sinφ dφ∫₀¹ r²·r² dr = 3·2π·1·1/5 = 6π/5。补面上 z=0 → 积分 = -∬ x²+y²≤1 0 dxdy = 0（取向下，z=0 时 z 项为 0，x,y 项的投影为 0 或可直接验证为 0）。结果 = 6π/5 - 0 = 6π/5。" },
    ],
    pitfalls: "补面的方向要小心——必须让补完的闭合曲面取外侧（或内侧，保持一致）。高斯公式默认外侧。散度 = ∂P/∂x + ∂Q/∂y + ∂R/∂z，三个偏导相加。",
  },
  {
    id: "k-multi-surface-integral-convert",
    title: "第一类与第二类曲面积分的转化",
    category: "多元积分",
    scenario: "两类曲面积分之间的转换",
    core: `∬_Σ P dydz + Q dzdx + R dxdy = ∬_Σ (P cos α + Q cos β + R cos γ) dS。其中 (cos α, cos β, cos γ) 是曲面法向量的方向余弦。若曲面由 z=z(x,y) 给出：法向量 = (-z_x, -z_y, 1) 或 (z_x, z_y, -1)，dS = √(1+z_x²+z_y²) dxdy。`,
    examples: [
      { problem: "将 ∬_Σ x dydz + y dzdx + z dxdy 化为第一类曲面积分，Σ: z=√(R²-x²-y²) 上侧", solution: "法向量：(-z_x, -z_y, 1) = (x/z, y/z, 1)（上侧）。单位法向量 = (x/R, y/R, z/R)。故积分 = ∬_Σ (x·x/R + y·y/R + z·z/R) dS = ∬_Σ (x²+y²+z²)/R dS = ∬_Σ R dS = R · 2πR² = 2πR³。（上半球面面积 = 2πR²）" },
    ],
    pitfalls: "法向量方向（上下侧）决定符号。z=z(x,y) 上侧：法向量 z 分量为正；下侧：z 分量为负。",
  },
  {
    id: "k-multi-stokes",
    title: "斯托克斯公式",
    category: "多元积分",
    scenario: "空间闭合曲线的第二类曲线积分，或旋度相关计算",
    core: `∮_Γ Pdx+Qdy+Rdz = ∬_Σ \begin{vmatrix} dydz & dzdx & dxdy \\ ∂/∂x & ∂/∂y & ∂/∂z \\ P & Q & R \end{vmatrix} = ∬_Σ (rot F)·dS。Γ 的方向与 Σ 的侧服从右手定则。旋度 rot F = ∇ × F = (R_y - Q_z, P_z - R_x, Q_x - P_y)。`,
    examples: [
      { problem: "计算 ∮_Γ y dx + z dy + x dz，Γ 为圆周 x²+y²+z²=a², x+y+z=0，从 x 轴正向看逆时针", solution: "用斯托克斯公式。取 Σ 为平面 x+y+z=0 上 Γ 围成的圆面（法向量与 Γ 满足右手定则：(1,1,1) 方向，因为 Γ 逆时针从 x 轴正方向看）。rot F = (0-1, 0-1, 0-1) = (-1,-1,-1)。积分 = ∬_Σ (-1)dydz + (-1)dzdx + (-1)dxdy = -∬_Σ (cos α + cos β + cos γ)dS。平面法向量 n = (1,1,1)，方向余弦 = (1/√3, 1/√3, 1/√3)。= -∬_Σ √3 dS = -√3 · πa²。（注：方向可能要再确认右手定则，但思路正确）" },
    ],
    pitfalls: "斯托克斯公式中曲面方向和曲线方向满足右手定则。计算时方向错了会差一个负号。行列式展开时注意项的正负号。",
  },
  {
    id: "k-multi-second-partial",
    title: "混合偏导相等的条件",
    category: "多元微分",
    scenario: "判断 ∂²z/∂x∂y 和 ∂²z/∂y∂x 是否相等",
    core: "若两个混合偏导数 f_{xy} 和 f_{yx} 在区域 D 内连续，则它们必相等（即求导次序可交换）。不连续时可能不等。竞赛中一般默认混合偏导连续可以交换次序，但遇到有间断点的函数要小心。",
    examples: [
      { problem: "f(x,y) = xy(x²-y²)/(x²+y²) ((x,y)≠(0,0)), f(0,0)=0，求 f_{xy}(0,0) 和 f_{yx}(0,0)", solution: "在原点 f_{xy}(0,0) = lim_{y→0}[f_x(0,y)-f_x(0,0)]/y。f_x(0,y) = -y。f_{xy}(0,0) = -1。同理 f_{yx}(0,0) = 1。不相等！因为混合偏导在原点不连续。" },
    ],
    pitfalls: "遇到分段函数在分段点（特别是原点）求混合偏导，必须用定义求，不能直接交换求导次序。",
  },
  {
    id: "k-multi-extreme-value-classify",
    title: "二元函数极值判定（海塞矩阵法）",
    category: "多元微分",
    scenario: "求二元函数的极值点并判定极大/极小",
    core: "步骤：① 求一阶偏导找驻点（f_x=0, f_y=0）② 求二阶偏导 A=f_{xx}, B=f_{xy}, C=f_{yy} ③ 判别式 Δ = AC-B²。Δ>0 且 A>0 → 极小；Δ>0 且 A<0 → 极大；Δ<0 → 鞍点（不是极值）；Δ=0 → 不能确定（需用更高阶或定义）。",
    examples: [
      { problem: "求 f(x,y)=x³+y³-3xy 的极值", solution: "f_x=3x²-3y=0 → y=x²。f_y=3y²-3x=0 → x=y²。联立：x=x⁴ → x(x³-1)=0 → x=0 或 x=1。驻点(0,0)和(1,1)。A=f_{xx}=6x, B=f_{xy}=-3, C=f_{yy}=6y。(0,0): A=0, B=-3, C=0, Δ=-9<0 → 鞍点。(1,1): A=6, B=-3, C=6, Δ=27>0, A>0 → 极小值 f(1,1)=-1。" },
    ],
    pitfalls: "Δ=0 时无法用二阶偏导判定，需用定义或更高阶导数。闭区域上求最值还要考虑边界上的情形（条件极值）。",
  },
  {
    id: "k-multi-line-integral-path-indep",
    title: "曲线积分与路径无关的条件",
    category: "多元积分",
    scenario: "判断 Pdx+Qdy 是否与路径无关，或求原函数",
    core: "单连通区域 D 内 P, Q 有连续一阶偏导，则以下等价：① ∫_L Pdx+Qdy 与路径无关 ② 沿任意闭合曲线的积分 = 0 ③ ∂Q/∂x = ∂P/∂y（处处成立）④ Pdx+Qdy 是某函数 u(x,y) 的全微分（存在原函数）。求原函数：u = ∫_{x₀}^x P(x,y₀)dx + ∫_{y₀}^y Q(x,y) dy（折线路径）。",
    examples: [
      { problem: "验证 (e^y + x)dx + (xe^y - 2y)dy 是全微分，并求原函数", solution: "P = e^y + x, Q = xe^y - 2y。∂Q/∂x = e^y = ∂P/∂y。故与路径无关。求原函数：取 (0,0) 为起点，u = ∫₀ˣ (1+t)dt + ∫₀ʸ (xe^t - 2t)dt = x+x²/2 + xe^y - x - y² = xe^y + x²/2 - y² + C。" },
    ],
    pitfalls: "路径无关的前提是单连通区域（无洞）。如果区域内有奇点（如原点是 1/(x²+y²) 的奇点），则 ∂Q/∂x = ∂P/∂y 不能推出路径无关（绕奇点的闭合曲线积分可能不为 0）。",
  },
  {
    id: "k-multi-coordinate-transformation",
    title: "二重积分换元法（一般变换）",
    category: "多元积分",
    scenario: "一般坐标变换下的二重积分计算",
    core: `设变换 x=x(u,v), y=y(u,v) 有连续偏导，雅可比行列式 J = \frac{\partial(x,y)}{\partial(u,v)} ≠ 0，则 ∬_{D_{xy}} f(x,y) dxdy = ∬_{D_{uv}} f(x(u,v), y(u,v)) |J| dudv。关键：|J| 是雅可比的绝对值。`,
    examples: [
      { problem: "用换元法验证极坐标变换的雅可比行列式", solution: "x = r cos θ, y = r sin θ。J = |cos θ  -r sin θ; sin θ   r cos θ| = r cos²θ + r sin²θ = r。|J| = r。故极坐标下 dσ = r dr dθ，与已知一致。" },
    ],
    pitfalls: "别忘了取绝对值！面积元素恒正，但雅可比行列式可能为负。三重积分换元也是取雅可比行列式的绝对值。",
  },
  {
    id: "k-multi-center-of-mass",
    title: "质心与形心公式",
    category: "多元积分",
    scenario: "求平面图形或空间立体的质心、形心",
    core: `平面薄板：形心（均匀质量）x̄ = (1/S)∬_D x dσ, ȳ = (1/S)∬_D y dσ。质心（面密度 ρ）：x̄ = (1/M)∬_D xρ dσ, ȳ = (1/M)∬_D yρ dσ，M = ∬_D ρ dσ。空间同理。对称性妙用：若 D 关于 x 轴对称且被积函数是 y 的奇函数，则积分为 0。`,
    examples: [
      { problem: "求半圆 x²+y²≤R², y≥0 的形心", solution: "面积 S = ½πR²。由对称性 x̄ = 0。ȳ = (1/S)∬_D y dσ = (2/πR²)∫₀^π sinθ dθ ∫₀ᴿ r·r dr = (2/πR²)·2·R³/3 = 4R/(3π)。形心 (0, 4R/(3π))。" },
    ],
    pitfalls: "形心是均匀物体的质心（密度为常数时两者等价）。注意先看对称性，能减少一半计算量。",
  },
  {
    id: "k-multi-moment-inertia",
    title: "转动惯量公式",
    category: "多元积分",
    scenario: "求物体对某轴的转动惯量",
    core: `平面薄板：对 x 轴 I_x = ∬_D y² ρ dσ，对 y 轴 I_y = ∬_D x² ρ dσ，对原点 I₀ = ∬_D (x²+y²) ρ dσ = I_x + I_y。空间立体：对 z 轴 I_z = ∭_Ω (x²+y²) ρ dV。细杆：I = (1/12)mL²（中心轴）或 (1/3)mL²（端点轴）。圆盘：I = (1/2)mR²（中心垂直轴）。`,
    examples: [
      { problem: "求均匀圆盘对中心垂直轴的转动惯量", solution: "设面密度为 σ，质量 m = σπR²。I = ∬_D (x²+y²)σ dσ = σ ∫₀^{2π} dθ ∫₀ᴿ r²·r dr = σ·2π·R⁴/4 = (σπR²)·R²/2 = mR²/2。" },
    ],
    pitfalls: "转动惯量的公式不要和静矩混淆。对 x 轴的转动惯量是 y² 的积分（距离 x 轴的距离是 y），不是 x²。",
  },
  {
    id: "k-multi-symmetry-double",
    title: "二重积分对称性解题技巧",
    category: "多元积分",
    scenario: "利用对称性简化二重积分计算",
    core: "① 区域 D 关于 x 轴对称：f 是 y 的奇函数 → 积分 = 0；f 是 y 的偶函数 → 2×上半区域积分。② D 关于 y 轴对称：对应 x 的奇偶函数。③ 轮换对称：D 关于 y=x 对称（交换 x,y 区域不变），则 ∬_D f(x,y) dσ = ∬_D f(y,x) dσ = ½∬_D [f(x,y)+f(y,x)] dσ。",
    examples: [
      { problem: "计算 ∬_D (x+y) dσ，D 由 y=x, y=-x, x=1 围成", solution: "D 关于 x 轴对称吗？不（上下不对称）。但区域由 y=±x 和 x=1 围成，关于 x 轴（y=0）对称。被积函数 = x + y。y 是 y 的奇函数 → ∬ y dσ = 0。x 是 y 的偶函数 → ∬ x dσ = 2∫₀¹ x·x dx = 2·1/3 = 2/3。（积分区域 x 从 0 到 1，每条竖线 y 从 -x 到 x，长度 2x）结果 = 2/3 + 0 = 2/3。" },
    ],
    pitfalls: "对称性要看两方面：① 区域对称 ② 被积函数奇偶性。两者都满足才能用。轮换对称只要区域关于 y=x 对称就行，不要求奇偶性。",
  },
  {
    id: "k-multi-section-method",
    title: "三重积分先二后一（截面法）",
    category: "多元积分",
    scenario: "被积函数只含一个变量，且截面面积好算",
    core: "先二后一：∭_Ω f(z) dV = ∫_c^d f(z) · S(z) dz，其中 S(z) 是用平面 z=常数截 Ω 所得截面的面积。当 f 只依赖 z 且截面面积 S(z) 容易求时，此法比分片积分快得多。",
    examples: [
      { problem: "计算 ∭_Ω z² dV，Ω: x²/a² + y²/b² + z²/c² ≤ 1", solution: "用截面法（先二后一）。z 从 -c 到 c。对固定 z，截面是椭圆 x²/a² + y²/b² ≤ 1 - z²/c²，其面积 = πab(1 - z²/c²)。积分 = ∫_{-c}^c z² · πab(1-z²/c²) dz = 2πab ∫₀ᶜ (z² - z⁴/c²) dz = 2πab[c³/3 - c⁵/(5c²)] = 2πab(2c³/15) = 4πabc³/15。" },
    ],
    pitfalls: "先二后一只适用于被积函数只含一个变量且截面面积好算的情况。如果被积函数含多个变量，还是要投影法（先一后二）或柱/球坐标。",
  },
  {
    id: "k-multi-gradient-divergence-curl",
    title: "梯度、散度、旋度速记",
    category: "多元积分",
    scenario: "场论基本运算：梯度、散度、旋度",
    core: `梯度（标量→向量）：∇φ = (φ_x, φ_y, φ_z)。散度（向量→标量）：div F = ∂P/∂x + ∂Q/∂y + ∂R/∂z。旋度（向量→向量）：rot F = ∇×F = (R_y-Q_z, P_z-R_x, Q_x-P_y)。两个重要恒等式：rot(grad φ) = 0（梯度场无旋），div(rot F) = 0（旋度场无源）。`,
    examples: [
      { problem: "F = (x²y, yz, z²)，求 div F 和 rot F", solution: "div F = 2xy + z + 2z = 2xy + 3z。rot F = (∂(z²)/∂y - ∂(yz)/∂z, ∂(x²y)/∂z - ∂(z²)/∂x, ∂(yz)/∂x - ∂(x²y)/∂y) = (0-y, 0-0, 0-x²) = (-y, 0, -x²)。" },
    ],
    pitfalls: "三个运算不要搞混输入输出类型：梯度输入标量输出向量，散度输入向量输出标量，旋度输入向量输出向量。div(grad φ) = Δφ（拉普拉斯算子）。",
  },
  {
    id: "k-multi-arc-length-parametric",
    title: "第一类曲线积分（弧长积分）计算",
    category: "多元积分",
    scenario: "对弧长的曲线积分 ∫_L f(x,y) ds",
    core: `参数方程 x=x(t), y=y(t)（α≤t≤β）：ds = √(x'(t)² + y'(t)²) dt，积分 = ∫_α^β f(x(t), y(t)) √(x'²+y'²) dt。直角坐标 y=y(x)：ds = √(1+y'²) dx。极坐标 r=r(θ)：ds = √(r² + r'²) dθ。重要性质：第一类曲线积分与方向无关（ds>0），积分下限 < 上限。`,
    examples: [
      { problem: "计算 ∫_L y ds，L 为抛物线 y²=2x 从 (0,0) 到 (2,2) 的一段", solution: "x = y²/2，dx/dy = y。ds = √(1 + (dx/dy)²) dy = √(1+y²) dy。积分 = ∫₀² y √(1+y²) dy = ½·⅔(1+y²)^{3/2}|₀² = ⅓(5√5 - 1)。" },
    ],
    pitfalls: "第一类曲线积分的结果是标量，与方向无关（上下限必须从小到大）。第二类曲线积分（对坐标）与方向有关，反向变号。",
  },

  // ========== 级数专题（20 张） ==========
  {
    id: "k-series-positive-tests",
    title: "正项级数判别链选择顺序",
    category: "级数",
    scenario: "判断正项级数敛散性，选择合适的判别法",
    core: "选择顺序：① 通项是否趋向 0（不趋向 0 直接发散）② 比值法（达朗贝尔）——含阶乘、n!、aⁿ 等 ③ 根值法（柯西）——含 n 次方 ④ 比较法/比较极限形式——跟 p-级数或等比级数比 ⑤ 积分判别法——通项单调递减且能对应可积函数 ⑥ 拉贝判别法——比值/根值为 1 时的进阶判别。",
    examples: [
      { problem: "判断 Σ n! / nⁿ 的敛散性", solution: "含阶乘，用比值法。a_{n+1}/a_n = (n+1)! / (n+1)^{n+1} · nⁿ/n! = (n+1)nⁿ / (n+1)^{n+1} = nⁿ/(n+1)ⁿ = (n/(n+1))ⁿ = 1/(1+1/n)ⁿ → 1/e < 1。收敛。" },
    ],
    pitfalls: "比值法和根值法都是充分条件，极限为 1 时失效，需要换更精细的判别法。不要在极限=1 时就得出结论。",
  },
  {
    id: "k-series-alternating-leibniz",
    title: "交错级数莱布尼茨判别法",
    category: "级数",
    scenario: "交错级数 Σ(-1)^{n-1} u_n (u_n > 0) 的敛散性判定",
    core: "莱布尼茨三条件：① u_n > 0（正项）② u_n 单调递减（u_{n+1} ≤ u_n）③ lim u_n = 0。三条件都满足则收敛，且余项 |R_n| ≤ u_{n+1}（误差不超过第一项的绝对值）。注意：这是充分条件，不满足不一定发散。",
    examples: [
      { problem: "判断 Σ(-1)^{n-1}/n 的敛散性", solution: "u_n = 1/n。① u_n > 0 ✓ ② 1/n 单调递减 ✓ ③ lim 1/n = 0 ✓。由莱布尼茨判别法，交错调和级数收敛。进一步：条件收敛（取绝对值后调和级数发散）。" },
    ],
    pitfalls: "单调性验证不能省。u_n 必须单调递减（从某一项开始也行），不是仅仅 u_n → 0。误差估计 R_n ≤ u_{n+1} 是交错级数特有的好用性质。",
  },
  {
    id: "k-series-convergence-radius",
    title: "幂级数收敛半径公式",
    category: "级数",
    scenario: "求幂级数 Σ a_n xⁿ 的收敛半径",
    core: "R = 1/ρ，其中 ρ = lim |a_{n+1}/a_n|（比值法）或 ρ = lim^{n}√|a_n|（根值法），极限存在（或为 +∞）时适用。缺项幂级数（只有奇次或偶次项）不能直接套公式，要用比值/根值法对整体 Σ u_n(x) 求 lim |u_{n+1}/u_n|。",
    examples: [
      { problem: "求 Σ xⁿ/n 的收敛半径和收敛域", solution: "a_n = 1/n。ρ = lim |a_{n+1}/a_n| = lim n/(n+1) = 1。R = 1/1 = 1。端点：x=1 时 Σ 1/n 发散（调和级数）；x=-1 时 Σ (-1)ⁿ/n 收敛（莱布尼茨）。收敛域 = [-1, 1)。" },
    ],
    pitfalls: "缺项幂级数（如 Σ x^{2n}/n）不能用 a_n 的比值求 R，因为每两项系数才变一次。要对通项整体用比值法：|u_{n+1}/u_n| = x²·n/(n+1) → x²，令 x² < 1 得 |x|<1。",
  },
  {
    id: "k-series-sum-function",
    title: "幂级数和函数求法：逐项积分与逐项求导",
    category: "级数",
    scenario: "求幂级数的和函数 S(x)",
    core: "基本策略：在收敛域内，幂级数可以逐项求导、逐项积分（收敛半径不变）。常用套路：① 先导后积：对 Σ n x^{n-1} 型，先积分得等比级数，求和再求导。② 先积后导：对 Σ x^{n}/n 型，先求导得等比级数，求和再积分。目标都是把系数 n 的幂次消掉，变成标准等比级数。",
    examples: [
      { problem: "求 Σ n xⁿ 的和函数（|x|<1）", solution: "Σ n xⁿ = x Σ n x^{n-1}。令 S(x) = Σ_{n=1}^∞ n x^{n-1}。积分：∫₀ˣ S(t)dt = Σ_{n=1}^∞ xⁿ = x/(1-x)。求导：S(x) = [x/(1-x)]' = 1/(1-x)²。故原式 = x/(1-x)²。" },
    ],
    pitfalls: "逐项求导后收敛半径不变，但端点处的收敛性可能变差（可能从收敛变发散）。求完和函数后要注明收敛域。",
  },
  {
    id: "k-series-taylor-maclaurin",
    title: "常用麦克劳林展开公式表",
    category: "级数",
    scenario: "泰勒展开求极限、和函数等需要熟记的基本展开式",
    core: `① $e^x = \sum_{n=0}^∞ x^n/n!$，x∈R  ② $\sin x = \sum_{n=0}^∞ (-1)^n x^{2n+1}/(2n+1)!$，x∈R  ③ $\cos x = \sum_{n=0}^∞ (-1)^n x^{2n}/(2n)!$，x∈R  ④ $1/(1-x) = \sum_{n=0}^∞ x^n$，|x|<1  ⑤ $\ln(1+x) = \sum_{n=1}^∞ (-1)^{n-1}x^n/n$，(-1,1]  ⑥ $\arctan x = \sum_{n=0}^∞ (-1)^n x^{2n+1}/(2n+1)$，[-1,1]  ⑦ $(1+x)^α = \sum_{n=0}^∞ C(α,n) x^n$，|x|<1`,
    examples: [
      { problem: "求 f(x) = 1/(1+x²) 的麦克劳林展开", solution: "利用 1/(1-t) = Σ tⁿ，令 t = -x²。1/(1+x²) = 1/(1-(-x²)) = Σ_{n=0}^∞ (-x²)ⁿ = Σ_{n=0}^∞ (-1)ⁿ x^{2n}，|x|<1。" },
    ],
    pitfalls: "每个展开式都有收敛域，使用时必须注意 x 在收敛域内。特别是 1/(1-x) 类和 ln(1+x) 类，收敛半径是 1，端点需单独检验。",
  },
  {
    id: "k-series-fourier-coeff",
    title: "傅里叶级数系数公式与狄利克雷定理",
    category: "级数",
    scenario: "将周期函数展开为傅里叶级数",
    core: `周期 2l：f(x) ~ a₀/2 + Σ_{n=1}^∞ [a_n cos(nπx/l) + b_n sin(nπx/l)]。a₀ = 1/l ∫_{-l}^l f(x)dx，a_n = 1/l ∫_{-l}^l f(x)cos(nπx/l)dx，b_n = 1/l ∫_{-l}^l f(x)sin(nπx/l)dx。狄利克雷收敛定理：若 f 在 [-l,l] 上分段单调且只有有限个第一类间断点，则傅里叶级数收敛，在连续点收敛到 f(x)，在间断点收敛到 [f(x⁺)+f(x⁻)]/2。`,
    examples: [
      { problem: "f(x)=x（-π≤x<π）展开为傅里叶级数，求在 x=π 处收敛到多少？", solution: "f 是奇函数，a_n=0，只有正弦项。b_n = (2/π)∫₀^π x sin(nx) dx = (-1)^{n+1}·2/n。f(x) = 2 Σ (-1)^{n+1} sin(nx)/n。在 x=π 处，f(π⁺)=-π, f(π⁻)=π，按狄利克雷定理收敛到 (π+(-π))/2 = 0。验证：sin(nπ)=0，级数和=0 ✓" },
    ],
    pitfalls: "间断点处级数收敛到左右极限的平均值，不等于函数值！这是竞赛选择题高频考点。奇偶延拓（正弦/余弦级数）也要注意端点收敛值。",
  },
  {
    id: "k-series-partial-sum",
    title: "级数与数列极限的互化",
    category: "级数",
    scenario: "级数敛散性与部分和数列极限的关系",
    core: "级数 Σ a_n 收敛 ⇔ 其部分和数列 {S_n} 收敛，其中 S_n = a₁+a₂+...+a_n。lim a_n = 0 是收敛的必要条件（不是充分条件）。应用：证明数列极限可以转化为证明对应级数收敛（部分和 S_n 有极限 ⇒ a_n → 0，但反过来不对）。",
    examples: [
      { problem: "已知数列 {a_n} 单调递减且非负，Σ a_n 收敛，证明 lim n a_n = 0", solution: "由柯西收敛准则，∀ε>0, ∃N, 当 n>N 时 a_{n+1}+...+a_{2n} < ε。因为递减，所以 a_{2n} ≤ a_{n+1},...,a_{2n}，故 n a_{2n} ≤ a_{n+1}+...+a_{2n} < ε，即 2n a_{2n} < 2ε。类似处理奇数项。得证 lim n a_n = 0。" },
    ],
    pitfalls: "Σ a_n 收敛推不出 lim n a_n = 0（除非 a_n 单调）。反例：a_n = 1/n 当 n 是平方数，否则 a_n = 1/n²，级数收敛但 lim n a_n 不存在。",
  },
  {
    id: "k-series-absolute-conditional",
    title: "绝对收敛与条件收敛的判定",
    category: "级数",
    scenario: "判断变号级数是绝对收敛、条件收敛还是发散",
    core: "步骤：① 先看通项是否趋向 0，不趋向→发散 ② 取绝对值 Σ|a_n|，用正项级数判别法判断 ③ 若 Σ|a_n| 收敛 → 绝对收敛（必收敛）④ 若 Σ|a_n| 发散，再看原级数 Σ a_n：用莱布尼茨/狄利克雷/阿贝尔判别 → 收敛则条件收敛，发散则发散。p-判别在交错级数中的应用：Σ (-1)^n / n^p，p>1 绝对收敛，0<p≤1 条件收敛，p≤0 发散。",
    examples: [
      { problem: "判断 Σ (-1)^n / (n^{2/3}) 的敛散性类型", solution: "取绝对值得 Σ 1/n^{2/3}，p = 2/3 < 1，p-级数发散。原交错级数：u_n = 1/n^{2/3} 单调递减 → 0，莱布尼茨条件满足 → 收敛。综上：条件收敛。" },
    ],
    pitfalls: "绝对收敛 ⇒ 收敛，逆命题不成立。条件收敛意味着收敛但不绝对收敛。绝对收敛级数有许多好性质（可重排、柯西乘积等），条件收敛没有。",
  },
  {
    id: "k-series-dirichlet-abel",
    title: "狄利克雷与阿贝尔判别法",
    category: "级数",
    scenario: "一般变号级数（不只是交错）的条件收敛判定",
    core: "狄利克雷判别法：若 {a_n} 单调趋向 0，且 Σ b_n 的部分和有界，则 Σ a_n b_n 收敛。阿贝尔判别法：若 {a_n} 单调有界，且 Σ b_n 收敛，则 Σ a_n b_n 收敛。（阿贝尔是狄利克雷的推论：a_n → a（极限存在），可拆成 a·b_n + (a_n-a)·b_n，后者用狄利克雷）",
    examples: [
      { problem: "判断 Σ sin(nx)/n 的敛散性（x≠kπ）", solution: "a_n = 1/n 单调→0。Σ_{k=1}^n sin(kx) = [cos(x/2)-cos((n+½)x)]/[2 sin(x/2)]，当 x≠kπ 时，分母 2 sin(x/2) ≠ 0，分子绝对值 ≤ 2，故部分和有界。由狄利克雷判别法，级数收敛。" },
    ],
    pitfalls: "部分和有界不代表收敛（只要不趋向无穷就行）。狄利克雷判别法比莱布尼茨适用范围更广（不限于交错级数）。",
  },
  {
    id: "k-series-taylor-remainder",
    title: "泰勒公式余项形式比较",
    category: "级数",
    scenario: "泰勒展开不同余项形式的适用场景",
    core: "① 佩亚诺余项：R_n(x) = o((x-x₀)^n)。只知道阶数，不含具体表达式。用于求极限、判断阶数等局部性质。② 拉格朗日余项：R_n(x) = f^{(n+1)}(ξ)(x-x₀)^{n+1}/(n+1)!。含中值 ξ，可以估计误差大小。用于不等式证明、误差估计。③ 积分余项：R_n(x) = 1/n! ∫_{x₀}^x f^{(n+1)}(t)(x-t)^n dt。",
    examples: [
      { problem: "为什么求极限用佩亚诺余项，证明不等式用拉格朗日余项？", solution: "求极限只需要知道余项是高阶无穷小就行（佩亚诺足够），不需要知道具体大小。证明不等式需要余项的具体表达式（含中值的拉格朗日形式），这样才能用 f^{(n+1)}(ξ) 的符号或范围来放缩。" },
    ],
    pitfalls: "不要混用。佩亚诺余项不能用来估计误差大小（只知道是高阶无穷小，但高阶到什么程度没给）。拉格朗日余项给了明确的误差表达式。",
  },
  {
    id: "k-series-cauchy-criterion",
    title: "柯西收敛准则（级数）",
    category: "级数",
    scenario: "理论性证明题，需要用级数收敛的充要条件",
    core: "级数 Σ a_n 收敛 ⇔ ∀ε>0, ∃N, 当 n>N 时，对任意正整数 p，有 |a_{n+1} + a_{n+2} + ... + a_{n+p}| < ε。即：充分远的任意片段和可以任意小。这是级数收敛的充要条件（既充分又必要），在理论证明中极为重要。",
    examples: [
      { problem: "用柯西准则证明调和级数 Σ 1/n 发散", solution: "取 ε = 1/2，对任意 N，取 n=N+1, p=n=N+1。|a_{n+1}+...+a_{2n}| = 1/(N+2)+...+1/(2N+2) ≥ (N+1)·1/(2N+2) = (N+1)/(2(N+1)) = 1/2 = ε。不满足柯西准则，故发散。" },
    ],
    pitfalls: "柯西准则是充要条件，常用于理论证明和反证法（证明发散时找固定的 ε 使得存在片段和超过 ε）。",
  },
  {
    id: "k-series-function-series",
    title: "函数项级数一致收敛判别",
    category: "级数",
    scenario: "判断函数项级数的一致收敛性",
    core: "① M-判别法（魏尔斯特拉斯）：若 |u_n(x)| ≤ M_n 对所有 x∈I，且 Σ M_n 收敛，则 Σ u_n(x) 在 I 上一致收敛（最强最常用）。② 狄利克雷判别法：a_n(x) 对每个 x 单调且一致→0，部分和 Σ b_n(x) 一致有界。③ 阿贝尔判别法：a_n(x) 单调且一致有界，Σ b_n(x) 一致收敛。",
    examples: [
      { problem: "证明 Σ sin(nx)/n² 在 R 上一致收敛", solution: "|sin(nx)/n²| ≤ 1/n² 对所有 x∈R 成立。而 Σ 1/n² 收敛（p=2>1）。由 M-判别法，原级数在 R 上一致收敛。" },
    ],
    pitfalls: "M-判别法只能判定绝对且一致收敛的情况。对于条件一致收敛的级数，需要用狄利克雷或阿贝尔判别。一致收敛保证了和函数的连续性、逐项积分、逐项求导（需额外条件）等好性质。",
  },
  {
    id: "k-series-binomial-series",
    title: "二项式级数与牛顿二项式展开",
    category: "级数",
    scenario: "(1+x)^α 的展开，α 不是正整数时",
    core: `$(1+x)^α = \sum_{n=0}^∞ C(α,n) x^n$，其中 $C(α,n) = α(α-1)...(α-n+1)/n!$。收敛半径 R = 1。端点收敛性：α > 0 时 [-1,1] 绝对收敛；-1 < α < 0 时在 x=1 条件收敛，x=-1 发散；α ≤ -1 时两端点都发散。`,
    examples: [
      { problem: "展开 1/√(1-x) 为幂级数", solution: "(1-x)^{-1/2} = (1+(-x))^{-1/2}。α = -1/2。C(-1/2, n) = (-1/2)(-3/2)...(-(2n-1)/2)/n! = (-1)^n (1·3·5·...·(2n-1))/2ⁿn! = (-1)^n (2n)! / (4ⁿ (n!)²)。代入：(1-x)^{-1/2} = Σ (2n)! xⁿ / (4ⁿ (n!)²) = Σ C(2n,n) xⁿ / 4ⁿ。|x|<1。" },
    ],
    pitfalls: "α 不是正整数时，级数有无穷多项（不会截断）。α 是正整数时，二项式定理给出有限项和。",
  },
  {
    id: "k-series-p-series",
    title: "p-级数敛散性与广义调和级数",
    category: "级数",
    scenario: "比较判别法的参考级数，判断敛散性的基准",
    core: "p-级数 Σ 1/n^p：p>1 时收敛，p≤1 时发散。p=1 时即调和级数，发散。重要推广：Σ 1/[n^p (ln n)^q]（积分判别法）：p>1 时收敛（任意 q）；p=1 时 q>1 收敛，q≤1 发散；p<1 时发散。记忆：p=1 时是临界，需要 ln 来加速/减慢。",
    examples: [
      { problem: "判断 Σ 1/(n ln n) 的敛散性", solution: "用积分判别法（f(n) = 1/(n ln n) 单调递减）。∫₂^∞ dx/(x ln x) = ln ln x |₂^∞ → ∞。积分发散，故级数发散。（这对应 p=1, q=1 的情况，q=1 时发散）" },
    ],
    pitfalls: "p-级数是最常用的比较基准。遇到正项级数，先看通项大致是 1/n 的几次方级别的，快速判定敛散性范围。",
  },
  {
    id: "k-series-geometric-sum",
    title: "等比级数（几何级数）求和公式",
    category: "级数",
    scenario: "等比级数求和、以及其他级数化归为等比级数",
    core: `Σ_{n=0}^∞ arⁿ = a/(1-r)，当 |r| < 1 时收敛，和为 a/(1-r)；|r| ≥ 1 时发散。有限和：Σ_{k=0}^{n-1} ar^k = a(1-rⁿ)/(1-r)。这是最基本的级数，许多其他级数（如通过逐项求导/积分）都要化归到它来求和。`,
    examples: [
      { problem: "求 Σ_{n=1}^∞ n/2^n 的和", solution: "利用 Σ xⁿ = x/(1-x)（|x|<1）。逐项求导：Σ n x^{n-1} = 1/(1-x)²。乘以 x：Σ n xⁿ = x/(1-x)²。令 x = 1/2：= (1/2)/(1-1/2)² = (1/2)/(1/4) = 2。" },
    ],
    pitfalls: "等比级数的首项和公比要看清。Σ_{n=1}^∞ rⁿ = r/(1-r)（首项是 r），不是 1/(1-r)（首项是 1）。从 n=0 还是 n=1 开始，和差了首项。",
  },
  {
    id: "k-series-raabe",
    title: "拉贝判别法（进阶）",
    category: "级数",
    scenario: "比值判别法极限为 1 时，用更精细的拉贝判别法",
    core: "正项级数 Σ a_n，计算 R_n = n(1 - a_{n+1}/a_n)。若 lim R_n = R，则：R > 1 时收敛，R < 1 时发散，R = 1 时失效（需更精细判别法）。拉贝判别法比比 值法更精细——它衡量的是 a_n ~ C/n^R 的衰减速度（R = p 对应 p-级数）。",
    examples: [
      { problem: "用拉贝判别法判断 Σ (2n-1)!/(2n)! 的敛散性", solution: "a_{n+1}/a_n = (2n+1)!/(2n+2)! · (2n)!/(2n-1)! = (2n+1)/(2n+2)。R_n = n[1 - (2n+1)/(2n+2)] = n[1/(2n+2)] = n/(2n+2) → 1/2 < 1。由拉贝判别法，级数发散。（对应 p = 1/2 < 1 的 p-级数级别）" },
    ],
    pitfalls: "拉贝判别法在 R=1 时仍然失效，此时需要高斯判别法或其他更精细的判别法。竞赛中比值法失效时，首先想到拉贝。",
  },
  {
    id: "k-series-telescoping",
    title: "望远镜级数（裂项求和）",
    category: "级数",
    scenario: "通项可以拆成两项差，求和后大部分项抵消",
    core: "若 a_n = b_n - b_{n+1}，则 S_n = a₁+...+a_n = b₁ - b_{n+1}。若 b_n → b（极限存在），则级数收敛到 b₁ - b。常见类型：① 1/[n(n+1)] = 1/n - 1/(n+1) ② 1/[(an+b)(an+c)] 裂项 ③ arctan(n+1) - arctan n 型 ④ ln(1+1/n) 型（调和级数，发散）。",
    examples: [
      { problem: "求 Σ_{n=1}^∞ 1/[n(n+2)] 的和", solution: "裂项：1/[n(n+2)] = ½(1/n - 1/(n+2))。S_n = ½[(1 - 1/3) + (1/2 - 1/4) + (1/3 - 1/5) + ... + (1/n - 1/(n+2))] = ½[1 + 1/2 - 1/(n+1) - 1/(n+2)]。n→∞ 时 S_n → ½(1+1/2) = 3/4。" },
    ],
    pitfalls: `望远镜级数求和要小心剩余项——不是只剩首末两项，要看裂项后的"跨度"。跨度为 k 的，前后各剩 k 项。`,
  },
  {
    id: "k-series-uniform-continuity",
    title: "一致收敛与连续性交换（和函数连续性）",
    category: "级数",
    scenario: "判断函数项级数的和函数是否连续",
    core: "若每一项 u_n(x) 在区间 I 上连续，且 Σ u_n(x) 在 I 上一致收敛，则和函数 S(x) = Σ u_n(x) 在 I 上也连续。注意：这是充分条件，不是必要条件。但每项都连续而和函数不连续时，级数一定不一致收敛（逆否命题）。",
    examples: [
      { problem: "f_n(x) = xⁿ 在 [0,1] 上的级数 Σ xⁿ 和函数是否连续？", solution: "和函数 S(x) = 1/(1-x) 在 [0,1) 上连续，但在 x=1 处级数发散（公比=1）。考虑 [0,1) 上：每项 xⁿ 连续，但级数在 [0,1) 上不一致收敛（因为 sup_{x∈[0,1)} |R_n(x)| = sup x^{n+1}/(1-x) = +∞），所以和函数在 [0,1) 上的连续性不能由一致收敛直接保证（但实际上 1/(1-x) 在 [0,1) 上连续，因为一致收敛是充分非必要条件）。" },
    ],
    pitfalls: "一致收敛只是充分条件。和函数可能连续但级数不一致收敛。但如果每项连续且和函数不连续，级数一定不一致收敛——这个逆否命题更有用（用来证明不一致收敛）。",
  },
  {
    id: "k-series-root-test",
    title: "根值判别法（柯西）与比值法的比较",
    category: "级数",
    scenario: "什么时候用根值法，什么时候用比值法",
    core: "根值法：若 lim^{n}√|a_n| = ρ，则 ρ<1 收敛，ρ>1 发散，ρ=1 失效。适用：通项含 n 次方（如 (x_n)^n）。比值法适用：通项含阶乘、连乘、递推式。关系：若比值极限存在，则根值极限也存在且相等。但反过来不对（根值存在比值不一定存在）。所以根值法适用范围比比值法略广。",
    examples: [
      { problem: "判断 Σ (n/(n+1))^{n²} 的敛散性", solution: "用根值法。^{n}√|a_n| = [n/(n+1)]^n = 1/(1+1/n)ⁿ → 1/e < 1。收敛。（比值法也能算，但根值更直接——一眼看到 n² 次方就想根值）" },
    ],
    pitfalls: "根值法的极限为 1 时同样失效。对于有阶乘的项，比值法更方便（阶乘比完就消掉了），根值法需要算^{n}√(n!)，可以用斯特林公式。",
  },
  {
    id: "k-series-cauchy-product",
    title: "柯西乘积（级数乘法）",
    category: "级数",
    scenario: "两个级数相乘，乘积级数的通项与收敛性",
    core: `若 Σ a_n 绝对收敛于 A，Σ b_n 绝对收敛于 B，则它们的柯西乘积 Σ c_n（其中 c_n = Σ_{k=0}^n a_k b_{n-k}）也绝对收敛，且和为 A·B。若只是条件收敛，柯西乘积不一定收敛（但可用阿贝尔求和法处理）。`,
    examples: [
      { problem: "用柯西乘积验证 (Σ xⁿ/n!) · (Σ yⁿ/n!) = Σ (x+y)ⁿ/n!（指数函数加法定理）", solution: "设 Σ a_n = Σ xⁿ/n!（= eˣ），Σ b_n = Σ yⁿ/n!（= eʸ），都绝对收敛。c_n = Σ_{k=0}^n xᵏ/k! · y^{n-k}/(n-k)! = (1/n!) Σ_{k=0}^n C(n,k) xᵏ y^{n-k} = (x+y)ⁿ/n!。故 Σ c_n = Σ (x+y)ⁿ/n! = e^{x+y}，即 eˣ·eʸ = e^{x+y}。" },
    ],
    pitfalls: "柯西乘积要求至少一个级数绝对收敛（默滕斯定理），或者两个都绝对收敛。如果两个都只是条件收敛，柯西乘积可能发散。",
  },

  // ========== ODE 专题（20 张） ==========
  {
    id: "k-ode-first-order-recognition",
    title: "一阶方程类型识别顺序",
    category: "ODE",
    scenario: "拿到一阶微分方程，先判断类型再选解法",
    core: "识别顺序（从易到难）：① 可分离变量（能写成 f(x)dx = g(y)dy）② 齐次方程（dy/dx = f(y/x)，令 u=y/x）③ 一阶线性（y'+P(x)y = Q(x)，用公式）④ 伯努利方程（y'+P(x)y = Q(x)y^n，令 z = y^{1-n} 化为线性）⑤ 全微分方程（∂M/∂y = ∂N/∂x，用原函数法）⑥ 以上都不是 → 变量替换或视为 x = x(y) 反函数。",
    examples: [
      { problem: "dy/dx = 1/(x+y) 是什么类型？怎么解？", solution: "不能直接分离，不是齐次，不是线性（y 在分母）。两种思路：① 令 u = x+y，则 du/dx = 1+dy/dx = 1+1/u = (u+1)/u，分离变量得 dx = u/(u+1) du = [1-1/(u+1)]du，积分得 x = u - ln|u+1| + C，回代 y。② 把方程看成 dx/dy = x+y 即 dx/dy - x = y，这是关于 x(y) 的一阶线性方程！用线性方程公式解更简单。" },
    ],
    pitfalls: "不是所有方程都恰好是一种标准类型。有些方程可以通过适当的变量替换化为标准类型。当 y 做因变量不好解时，试试把 x 看作 y 的函数（反函数）。",
  },
  {
    id: "k-ode-linear-formula-mnemonic",
    title: "一阶线性方程通解公式记忆法",
    category: "ODE",
    scenario: "一阶线性非齐次方程 y' + P(x)y = Q(x) 求通解",
    core: `通解公式：$y = e^{-\int P(x)dx} \left[ \int Q(x) e^{\int P(x)dx} dx + C \right]$。记忆口诀：积分因子 μ(x) = e^{∫Pdx}，通解 = (1/μ)[∫μQ dx + C]。即：乘积分因子后左边是 (μ y)'，所以 μ y = ∫μQ dx + C，解出 y。`,
    examples: [
      { problem: "求解 y' + y/x = sin x / x", solution: "P(x) = 1/x, Q(x) = sin x / x。积分因子 μ = e^{∫1/x dx} = e^{ln x} = x。两边乘 x：xy' + y = sin x → (xy)' = sin x。积分：xy = -cos x + C。通解 y = (C - cos x)/x。" },
    ],
    pitfalls: "使用公式前必须先把方程化为标准形式 y' + P(x)y = Q(x)（y' 的系数必须是 1）。如果 y' 前有系数，先除掉。",
  },
  {
    id: "k-ode-second-order-const-coeff",
    title: "二阶常系数齐次线性方程解法表",
    category: "ODE",
    scenario: "y'' + py' + qy = 0 型方程，已知 p, q 求实值通解",
    core: "特征方程 r² + pr + q = 0。① 两个不等实根 r₁ ≠ r₂：通解 y = C₁e^{r₁x} + C₂e^{r₂x} ② 重根 r₁ = r₂ = r：通解 y = (C₁ + C₂x)e^{rx} ③ 共轭复根 r = α ± iβ：通解 y = e^{αx}(C₁ cos βx + C₂ sin βx)。",
    examples: [
      { problem: "求解 y'' + 2y' + 5y = 0", solution: "特征方程 r²+2r+5=0，r = [-2 ± √(4-20)]/2 = -1 ± 2i。α=-1, β=2。通解 y = e^{-x}(C₁ cos 2x + C₂ sin 2x)。" },
    ],
    pitfalls: "复根时 e^{αx} 乘的是 cos βx 和 sin βx，不是 cos βx 和 sin βx 的系数有 i。共轭复根对应的解是实值解（用欧拉公式展开后取实部虚部）。",
  },
  {
    id: "k-ode-nonhomogeneous-special-solution",
    title: "二阶常系数非齐次特解设形式对照表",
    category: "ODE",
    scenario: "y''+py'+qy = f(x)，根据 f(x) 的形式设特解 y*",
    core: "f(x) = P_m(x)e^{λx} 型：设 y* = x^k · Q_m(x)e^{λx}，其中 k = 0, 1, 2 分别对应 λ 不是特征根、是单根、是重根。f(x) = e^{λx}[P_l(x)cos ωx + P_n(x)sin ωx] 型：设 y* = x^k e^{λx}[R_m^{(1)}(x)cos ωx + R_m^{(2)}(x)sin ωx]，m = max(l,n)，k = 0 或 1（λ+iω 是否为特征根）。",
    examples: [
      { problem: "求 y'' - 2y' - 3y = 3x+1 的一个特解", solution: "f(x) = (3x+1)e^{0·x}，λ=0。特征方程 r²-2r-3=0, 根 r=3,-1。λ=0 不是特征根，k=0。设 y* = ax+b。代入：-2a - 3(ax+b) = 3x+1 → -3a x + (-2a-3b) = 3x+1。-3a=3 → a=-1；-2(-1)-3b=1 → 2-3b=1 → b=1/3。特解 y* = -x + 1/3。" },
    ],
    pitfalls: "最容易错的是 k 的取值。必须先求特征根，再看 λ 是否为特征根、是几重根。k 取错了设出来的特解代入后会恒等（全是 0=0），解不出系数。",
  },
  {
    id: "k-ode-euler-equation",
    title: "欧拉方程解法",
    category: "ODE",
    scenario: "形如 x²y'' + pxy' + qy = f(x) 的变系数方程",
    core: "解法：令 x = e^t（t = ln x），将方程化为以 t 为自变量的常系数线性方程。变换公式：xy' = Dy，x²y'' = D(D-1)y，其中 D = d/dt。代入后得到常系数方程，解出 y(t) 再回代 t = ln x 得 y(x)。",
    examples: [
      { problem: "求解 x²y'' + xy' + y = x", solution: "令 x = e^t，t = ln x。x y' = Dy, x² y'' = D(D-1)y。方程化为 D(D-1)y + Dy + y = e^t → D²y + y = e^t，即 y''_t + y = e^t。特征方程 r²+1=0, r=±i。齐次通解 = C₁ cos t + C₂ sin t。设特解 y* = A e^t。代入：Ae^t + Ae^t = e^t → 2A = 1 → A = 1/2。通解 y = C₁ cos t + C₂ sin t + e^t/2。回代 t = ln x：y = C₁ cos(ln x) + C₂ sin(ln x) + x/2。" },
    ],
    pitfalls: "欧拉方程的特征是：k 阶导数前乘以 x^k。标准形式是 x^n y^{(n)} + ... + p₀ y = f(x)。注意首项是 x²y'' 不是 y''。",
  },
  {
    id: "k-ode-reducible-types",
    title: "可降阶的高阶微分方程两类",
    category: "ODE",
    scenario: "二阶方程缺 y 或缺 x 时的降阶法",
    core: "① 缺 y 型：y'' = f(x, y')。令 p = y'，则 y'' = p'，方程化为 p' = f(x, p)（一阶），解出 p = φ(x, C₁)，再积分得 y = ∫ φ(x, C₁)dx + C₂。② 缺 x 型：y'' = f(y, y')。令 p = y'，y'' = p dp/dy（链式：d²y/dx² = dp/dx = dp/dy · dy/dx = p dp/dy），方程化为 p dp/dy = f(y, p)，解出 p = φ(y, C₁)，再分离变量 dy/φ(y,C₁) = dx 积分得通解。",
    examples: [
      { problem: "求解 yy'' + (y')² = 0", solution: "缺 x 型。令 p = y', y'' = p dp/dy。代入：y · p dp/dy + p² = 0。若 p ≠ 0：除以 p 得 y dp/dy + p = 0 → dp/p = -dy/y → ln p = -ln y + C₁ → p = C₁/y。即 dy/dx = C₁/y → y dy = C₁ dx → ½y² = C₁x + C₂。若 p = 0 则 y = 常数，已包含在上面通解中（C₁=0 时 y² = C₂）。" },
    ],
    pitfalls: "缺 y 型和缺 x 型不能搞混！缺 y 时 y'' = dp/dx，缺 x 时 y'' = p dp/dy。搞混了会出现三个变量（x,y,p）无法解。",
  },
  {
    id: "k-ode-bernoulli",
    title: "伯努利方程解法",
    category: "ODE",
    scenario: "形如 y' + P(x)y = Q(x)y^n 的方程（n ≠ 0, 1）",
    core: "伯努利方程：y' + P(x)y = Q(x)y^n。令 z = y^{1-n}，则 z' = (1-n)y^{-n} y'。方程两边乘以 (1-n)y^{-n}：(1-n)y^{-n}y' + (1-n)P(x)y^{1-n} = (1-n)Q(x) → z' + (1-n)P(x)z = (1-n)Q(x)，这是关于 z(x) 的一阶线性方程，解出 z 后回代 y = z^{1/(1-n)}。",
    examples: [
      { problem: "求解 y' + y = xy²", solution: "n = 2，伯努利方程。令 z = y^{1-2} = y^{-1} = 1/y。z' = -y^{-2}y'。原方程两边乘 -y^{-2}：-y^{-2}y' - y^{-1} = -x → z' - z = -x。这是一阶线性方程。P = -1, Q = -x。积分因子 e^{∫-dx} = e^{-x}。z = e^x[∫(-x)e^{-x}dx + C] = e^x[xe^{-x}+e^{-x}+C] = x+1+Ce^x。回代 y = 1/z = 1/(x+1+Ce^x)。" },
    ],
    pitfalls: "n = 0 时就是普通线性方程，n = 1 时可分离变量（y'/y = Q - P）。伯努利方程针对 n ≠ 0, 1 的情形。",
  },
  {
    id: "k-ode-exact-differential",
    title: "全微分方程与积分因子",
    category: "ODE",
    scenario: "M(x,y)dx + N(x,y)dy = 0，判断是否为全微分并求解",
    core: "全微分方程：∂M/∂y = ∂N/∂x。解法：求原函数 u(x,y) 使 du = Mdx + Ndy = 0，通解 u(x,y) = C。求 u 的方法：① 曲线积分：u = ∫_{x₀}^x M(x,y₀)dx + ∫_{y₀}^y N(x,y)dy ② 偏积分：对 x 积分 M 得 u = ∫Mdx + φ(y)，再对 y 求导定 φ(y)。若 ∂M/∂y ≠ ∂N/∂x，找积分因子 μ(x,y) 使 μMdx + μNdy = 0 为全微分。",
    examples: [
      { problem: "验证 (x³+3xy²)dx + (3x²y+y³)dy = 0 是全微分方程并求解", solution: "M = x³+3xy², N = 3x²y+y³。∂M/∂y = 6xy = ∂N/∂x ✓。求 u：对 x 积分 M：u = x⁴/4 + (3/2)x²y² + φ(y)。对 y 求导：∂u/∂y = 3x²y + φ'(y) = N = 3x²y+y³ → φ'(y) = y³ → φ(y) = y⁴/4。故 u = x⁴/4 + (3/2)x²y² + y⁴/4。通解：x⁴/4 + (3/2)x²y² + y⁴/4 = C，或 x⁴ + 6x²y² + y⁴ = C。" },
    ],
    pitfalls: "找积分因子一般很难，但有特殊情况：① 只依赖 x：(M_y - N_x)/N = f(x)，则 μ = e^{∫f(x)dx} ② 只依赖 y：(N_x - M_y)/M = g(y)，则 μ = e^{∫g(y)dy}。",
  },
  {
    id: "k-ode-superposition-principle",
    title: "线性微分方程解的叠加原理",
    category: "ODE",
    scenario: "线性方程解的结构理论，证明题或解的组合",
    core: "齐次线性方程：若 y₁, y₂ 是解，则 C₁y₁ + C₂y₂ 也是解（线性组合仍是解）。非齐次线性方程：非齐次特解 + 齐次通解 = 非齐次通解。叠加原理（非齐次项可拆）：若 y₁* 是 f₁ 的特解，y₂* 是 f₂ 的特解，则 y₁*+y₂* 是 f₁+f₂ 的特解。",
    examples: [
      { problem: "y''+y = sin x + e^x，已知 y₁* = -½ x cos x 是 y''+y = sin x 的特解，y₂* = ½ e^x 是 y''+y = e^x 的特解，求原方程通解", solution: "齐次方程 y''+y = 0 的通解：Y = C₁ cos x + C₂ sin x。由叠加原理，非齐次特解 y* = y₁* + y₂* = -½ x cos x + ½ e^x。通解 y = Y + y* = C₁ cos x + C₂ sin x - ½ x cos x + ½ e^x。" },
    ],
    pitfalls: "叠加原理只适用于线性方程！非线性方程不成立。常用来把复杂非齐次项拆成几个简单的，分别求特解后相加。",
  },
  {
    id: "k-ode-wronskian",
    title: "朗斯基行列式与解的线性无关性",
    category: "ODE",
    scenario: "判断两个解是否线性无关（是否构成基本解组）",
    core: `两个解 y₁, y₂ 的朗斯基行列式 W(x) = \begin{vmatrix} y₁ & y₂ \\ y₁' & y₂' \end{vmatrix} = y₁y₂' - y₂y₁'。若在区间 I 上 W(x) ≠ 0，则 y₁, y₂ 线性无关（构成基本解组）。刘维尔公式：W(x) = W(x₀) e^{-∫_{x₀}^x p(t)dt}（对于 y''+p(x)y'+q(x)y=0）。由此可知：线性齐次方程的解要么恒为 0（W≡0），要么处处不为 0。`,
    examples: [
      { problem: "验证 y₁ = e^x, y₂ = e^{2x} 是 y''-3y'+2y=0 的基本解组", solution: "代入验证：y₁''-3y₁'+2y₁ = e^x-3e^x+2e^x = 0 ✓，y₂''-3y₂'+2y₂ = 4e^{2x}-6e^{2x}+2e^{2x}=0 ✓。W = |e^x e^{2x}; e^x 2e^{2x}| = e^x·2e^{2x} - e^x·e^{2x} = 2e^{3x} - e^{3x} = e^{3x} ≠ 0。线性无关，构成基本解组。" },
    ],
    pitfalls: "W(x) ≠ 0 是两个解线性无关的充要条件（对线性齐次方程而言）。一般函数的线性无关性不能用朗斯基判定（只有方程的解才行）。",
  },
  {
    id: "k-ode-variation-of-parameters",
    title: "常数变易法（参数变易法）",
    category: "ODE",
    scenario: "已知齐次方程的两个线性无关解，求非齐次的一个特解",
    core: `已知齐次通解 Y = C₁y₁ + C₂y₂。设非齐次特解 y* = C₁(x)y₁ + C₂(x)y₂。解方程组：C₁'y₁ + C₂'y₂ = 0, C₁'y₁' + C₂'y₂' = f(x)（标准形式下右端为 f(x)）。由克莱姆法则：C₁' = -y₂f(x)/W, C₂' = y₁f(x)/W。积分得 C₁(x), C₂(x)。`,
    examples: [
      { problem: "用常数变易法求 y'' + y = tan x 的通解", solution: "齐次通解 Y = C₁ cos x + C₂ sin x。W = |cos x sin x; -sin x cos x| = 1。C₁' = -y₂ f / W = -sin x tan x = -sin²x/cos x = (cos²x-1)/cos x = cos x - sec x。C₂' = y₁ f / W = cos x tan x = sin x。积分：C₁ = sin x - ln|sec x + tan x|, C₂ = -cos x。特解 y* = (sin x - ln|sec x+tan x|)cos x + (-cos x)sin x = -cos x·ln|sec x+tan x|。通解 y = C₁ cos x + C₂ sin x - cos x·ln|sec x+tan x|。" },
    ],
    pitfalls: "常数变易法对任何 f(x) 都适用（只要能积分），是更一般的方法。待定系数法只对特殊形式的 f(x) 有效（多项式×指数×三角）。",
  },
  {
    id: "k-ode-separable-variable",
    title: "可分离变量方程求解步骤",
    category: "ODE",
    scenario: "能写成 dy/dx = f(x)g(y) 或 M(x)dx + N(y)dy = 0 的方程",
    core: "步骤：① 分离变量：把含 x 的和含 y 的分开到等式两边 ② 两边积分：∫ dy/g(y) = ∫ f(x)dx（注意 g(y)=0 可能是丢解） ③ 化简得通解，若有初值代入求常数。常考：齐次方程（先令 u=y/x 化成可分离）、指数增长/衰减模型等。",
    examples: [
      { problem: "求解 dy/dx = 2xy，y(0)=1", solution: "分离变量：dy/y = 2x dx。积分：ln|y| = x² + C。y = Ce^{x²}。代入 y(0)=1 得 C=1。特解 y = e^{x²}。验证：y' = 2xe^{x²} = 2x·y ✓" },
    ],
    pitfalls: "分离变量时除以 g(y) 可能丢失 g(y)=0 的解（常数解）。这些解可能不包含在通解中，需要最后单独检验补上。",
  },
  {
    id: "k-ode-homogeneous",
    title: "齐次方程与齐次函数",
    category: "ODE",
    scenario: "dy/dx = f(y/x) 型方程",
    core: "齐次方程：dy/dx = f(y/x)。令 u = y/x（即 y = ux），则 dy/dx = u + x du/dx。代入方程：u + x du/dx = f(u) → x du/dx = f(u) - u，这是可分离变量方程。解出 u(x) 后回代 y = ux。可化为齐次的：dy/dx = (a₁x+b₁y+c₁)/(a₂x+b₂y+c₂)，当 c₁=c₂=0 时已是齐次；否则平移坐标消去常数项。",
    examples: [
      { problem: "求解 dy/dx = (x+y)/(x-y)", solution: "右边分子分母同除以 x：= (1+y/x)/(1-y/x)。齐次方程。令 u=y/x。u + x du/dx = (1+u)/(1-u)。x du/dx = (1+u)/(1-u) - u = (1+u-u+u²)/(1-u) = (1+u²)/(1-u)。分离变量：(1-u)/(1+u²) du = dx/x。积分：arctan u - ½ ln(1+u²) = ln|x| + C。回代 u=y/x：arctan(y/x) - ½ ln(1+y²/x²) = ln|x| + C。" },
    ],
    pitfalls: "齐次方程的判定：右边是零次齐次函数（f(tx,ty)=f(x,y)）。令 u=y/x 是标准做法。回代时别忘了 y = ux。",
  },
  {
    id: "k-ode-initial-value-unique",
    title: "解的存在唯一性定理（皮卡定理）",
    category: "ODE",
    scenario: "理论性问题：初值问题解是否存在、是否唯一",
    core: "皮卡（Picard）存在唯一性定理：若 f(x,y) 在矩形区域 R 上连续且关于 y 满足利普希茨条件，则初值问题 y' = f(x,y), y(x₀)=y₀ 在 x₀ 的某邻域内存在唯一解。简版：f 连续且对 y 的偏导有界 ⇒ 存在唯一。意义：保证了在好的条件下，初值唯一确定解。",
    examples: [
      { problem: "y' = √y, y(0)=0 有几个解？", solution: "f(x,y) = √y 在 y≥0 上连续，但 ∂f/∂y = 1/(2√y) 在 y=0 附近无界（不满足利普希茨条件）。解：分离变量得 2√y = x + C，代入 y(0)=0 得 C=0，即 y = x²/4。但还有解 y = 0（常数解）。事实上有无穷多解：y = 0（对所有 x），或对任意 a≥0，y = 0（x≤a）且 y = (x-a)²/4（x>a）。" },
    ],
    pitfalls: "不满足利普希茨条件时解可能不唯一。利普希茨条件是充分条件不是必要条件（满足一定有唯一解，不满足不一定没有唯一解）。",
  },
  {
    id: "k-ode-riccati",
    title: "里卡蒂方程与已知特解降阶",
    category: "ODE",
    scenario: "y' = P(x)y² + Q(x)y + R(x) 型方程，已知一个特解",
    core: "里卡蒂方程：y' = P(x)y² + Q(x)y + R(x)。一般不能用初等函数积分求解。但若已知一个特解 y₁，令 y = y₁ + 1/z（或 z = 1/(y-y₁)），可化为关于 z 的一阶线性方程：z' + (2P(x)y₁ + Q(x))z + P(x) = 0。",
    examples: [
      { problem: "已知 y₁ = 1 是 y' = y² - 2x²y + x⁴ + 2x - 1 的特解，求通解", solution: "令 y = 1 + 1/z。y' = -1/z² · z'。代入方程：-z'/z² = (1+1/z)² - 2x²(1+1/z) + x⁴ + 2x - 1。展开右边并化简。利用 y₁=1 满足方程消去常数项（即不含 1/z 的项抵消），剩下的整理为关于 z 的线性方程：z' + ... = ...。（具体计算略）。标准做法：y = y₁ + 1/z 代入后，y₁² 项和 y₁ 的一次项由 y₁ 是特解而抵消，剩下的除以 z² 得到线性方程。" },
    ],
    pitfalls: "里卡蒂方程没有通用初等解法，必须给出一个特解才能降阶。竞赛中如果出现里卡蒂方程，通常特解很简单（如常数解、x 的简单函数），可以靠观察猜出来。",
  },
  {
    id: "k-ode-phase-line",
    title: "一阶自治方程的相图与平衡点",
    category: "ODE",
    scenario: "y' = f(y) 型自治方程，分析解的定性行为",
    core: "自治方程 y' = f(y)。平衡点：f(y) = 0 的根 y = y*（常数解）。稳定性：f'(y*) < 0 → 稳定（附近解趋向平衡），f'(y*) > 0 → 不稳定（附近解远离平衡）。相图：在 y 轴上标出平衡点，用箭头表示 y 增减方向（f(y)>0 时向右，f(y)<0 时向左）。",
    examples: [
      { problem: "分析逻辑斯谛方程 y' = ky(1-y/N) 的平衡点与稳定性", solution: "平衡点：y=0 和 y=N。f'(y) = k(1-y/N) + ky(-1/N) = k - 2ky/N。f'(0) = k > 0 → y=0 不稳定。f'(N) = k - 2k = -k < 0 → y=N 稳定（即 N 是环境容纳量，解趋向 N）。相图：y<0 时 f<0 → 向左；0<y<N 时 f>0 → 向右；y>N 时 f<0 → 向左。0 是源（不稳定），N 是汇（稳定）。" },
    ],
    pitfalls: "稳定性是局部概念（只在平衡点附近）。对于全局行为还需看所有解是否都趋向平衡点。一阶自治方程不会出现振荡解。",
  },
  {
    id: "k-ode-system-linear",
    title: "一阶线性方程组与矩阵方法",
    category: "ODE",
    scenario: "常系数线性方程组的求解",
    core: `齐次线性方程组 dx/dt = Ax（A 为 n×n 常矩阵）。解法：求 A 的特征值 λ 和特征向量 v。① n 个不同实特征值：通解 x = Σ C_i v_i e^{λ_i t} ② 复特征值 λ = α±iβ，对应解 e^{αt}(v_R cos βt - v_I sin βt) 和 e^{αt}(v_R sin βt + v_I cos βt)，其中 v = v_R + iv_I ③ 重特征根：用广义特征向量。`,
    examples: [
      { problem: "求解系统 x' = -y, y' = x", solution: "写成 [x'; y'] = [0 -1; 1 0][x; y]。特征方程 |-λ -1; 1 -λ| = λ²+1=0 → λ=±i。λ=i 的特征向量：[-i -1; 1 -i][v1; v2]=0 → -iv1 - v2 = 0 → v2 = -iv1。取 v1=1, v2=-i → v = (1, -i)。实部 v_R=(1,0), 虚部 v_I=(0,-1)。两实解：cos t·(1,0) - sin t·(0,-1) = (cos t, sin t)；sin t·(1,0) + cos t·(0,-1) = (sin t, -cos t)。通解：x = C₁ cos t + C₂ sin t, y = C₁ sin t - C₂ cos t。" },
    ],
    pitfalls: "复特征值对应实值解的构造方法要熟练。把复向量分解为实部和虚部，分别乘 cos 和 sin 组合成两个线性无关的实解。",
  },
  {
    id: "k-ode-laplace-transform",
    title: "拉普拉斯变换解常系数线性方程",
    category: "ODE",
    scenario: "有初值条件的常系数线性方程，或非齐次项含阶跃、脉冲等",
    core: `拉普拉斯变换 L[y'] = sY(s) - y(0), L[y''] = s²Y(s) - sy(0) - y'(0)。对微分方程两边取拉普拉斯变换，化为关于 Y(s) 的代数方程。解出 Y(s) 后，用部分分式分解，再查拉普拉斯反变换表得到 y(t)。常用变换：L[1]=1/s, L[e^{at}]=1/(s-a), L[sin ωt]=ω/(s²+ω²), L[cos ωt]=s/(s²+ω²), L[t^n]=n!/s^{n+1}。`,
    examples: [
      { problem: "用拉普拉斯变换解 y'' + y = 0, y(0)=0, y'(0)=1", solution: "两边变换：s²Y - s·0 - 1 + Y = 0 → (s²+1)Y = 1 → Y = 1/(s²+1)。反变换：y(t) = sin t。验证：y'' = -sin t, y''+y = 0 ✓, y(0)=0 ✓, y'(0)=1 ✓" },
    ],
    pitfalls: "拉普拉斯变换特别适合有初值的问题（自动代入初值）。对于非齐次项是分段函数（阶跃、脉冲）时尤其有用。但计算反变换可能较繁琐（需要部分分式）。",
  },
  {
    id: "k-ode-singular-solution",
    title: "奇解与包络",
    category: "ODE",
    scenario: "一阶隐式方程 F(x,y,y')=0 的奇解（不包含在通解中但处处相切）",
    core: "奇解：同时满足 F(x,y,p)=0 和 F_p(x,y,p)=0（p=y'）的解曲线。几何上是通解曲线族的包络线。奇解在每一点都与通解中的某条解相切，因此不满足解的唯一性（不满足利普希茨条件的地方）。常见出现奇解的方程：克莱罗方程 y = xp + f(p)。",
    examples: [
      { problem: "求克莱罗方程 y = xp + 1/p 的奇解", solution: "令 p = y'。通解：y = Cx + 1/C（把 p 换成任意常数 C 即得，这是克莱罗方程的特性）。找奇解：F(x,y,p) = y - xp - 1/p = 0。对 p 求偏导：F_p = -x + 1/p² = 0 → p² = 1/x → p = ±1/√x。代入原方程消去 p：y = x(±1/√x) ± √x = ±√x ± √x = ±2√x。即 y² = 4x。验证：这是抛物线，且与直线族 y = Cx + 1/C 相切（联立方程判别式=0）。" },
    ],
    pitfalls: "奇解的存在意味着解的唯一性被破坏（在奇解上每一点都至少有两条解曲线通过——奇解本身和某条通解）。奇解不包含在通解中，是额外的解。",
  },
  {
    id: "k-ode-higher-order-linear",
    title: "高阶线性微分方程解的结构",
    category: "ODE",
    scenario: "n 阶线性齐次/非齐次方程解的一般理论",
    core: "n 阶齐次线性方程有 n 个线性无关的解（基本解组），通解是它们的线性组合。非齐次通解 = 齐次通解 + 一个非齐次特解。叠加原理对多个非齐次项适用。常数变易法可推广到 n 阶（需要解 n 元一次方程组求 C_i'(x)）。降阶法：已知一个解 y₁，令 y = y₁ ∫ z(x)dx 可降一阶。",
    examples: [
      { problem: "已知 y₁ = sin x / √x 是 x²y'' + xy' + (x²-¼)y = 0 的一个解，用刘维尔公式找第二个线性无关解", solution: "写成标准形式 y'' + (1/x)y' + (1 - 1/(4x²))y = 0，p(x)=1/x。由刘维尔公式：W = W₀ e^{-∫p dx} = W₀ e^{-ln x} = W₀/x。又 W = y₁y₂' - y₁'y₂。设 y₂ = y₁ · v(x)，则 W = y₁² v' → v' = W/y₁² = (W₀/x) / (sin²x / x) = W₀ / sin²x → v = -W₀ cot x。取 W₀ = -1，v = cot x。y₂ = (sin x / √x) · cot x = cos x / √x。第二个解 y₂ = cos x / √x。" },
    ],
    pitfalls: "高阶线性方程的理论是二阶的直接推广。基本思想一样：找 n 个线性无关的齐次解 + 一个特解 = 通解。",
  },

  // ========== 解析几何专题（20 张） ==========
  {
    id: "k-geo-distance-formulas",
    title: "点线距、点面距、线面距公式速查",
    category: "解析几何",
    scenario: "计算各类距离（点到直线、点到平面、直线到平面等）",
    core: `① 点 P(x₀,y₀) 到直线 Ax+By+C=0 的距离：d = |Ax₀+By₀+C|/√(A²+B²)。② 点 P(x₀,y₀,z₀) 到平面 Ax+By+Cz+D=0 的距离：d = |Ax₀+By₀+Cz₀+D|/√(A²+B²+C²)。③ 异面直线距离：设两直线方向向量为 v₁, v₂，各取一点 P₁,P₂，则 d = |(P₁P₂) · (v₁×v₂)| / |v₁×v₂|。`,
    examples: [
      { problem: "求点 (1,2,3) 到平面 2x - y + 2z + 4 = 0 的距离", solution: "d = |2·1 - 1·2 + 2·3 + 4| / √(4+1+4) = |2-2+6+4| / 3 = 10/3。" },
    ],
    pitfalls: "距离公式分子都带绝对值（保证非负）。异面直线距离公式中 v₁×v₂ 是两方向向量叉乘（公垂线方向），(P₁P₂) 是两直线上点连线在公垂线方向的投影。",
  },
  {
    id: "k-geo-cross-product",
    title: "叉积的几何意义与应用",
    category: "解析几何",
    scenario: "向量叉积的几何意义、性质与典型应用",
    core: `叉积 a × b 结果是一个向量：① 大小 |a||b|sin θ = 平行四边形面积 ② 方向垂直于 a 和 b，服从右手定则。应用：求法向量、求三角形/平行四边形面积、判断共面（混合积=0）、异面直线距离、求平面方程。性质：a×b = -b×a（反交换），a×a = 0，a×(b+c) = a×b + a×c（分配律）。`,
    examples: [
      { problem: "已知三角形三个顶点 A(1,0,0), B(0,1,0), C(0,0,1)，求其面积", solution: "向量 AB = (-1,1,0), AC = (-1,0,1)。叉积 AB×AC = |i j k; -1 1 0; -1 0 1| = (1·1-0·0, 0·(-1)-(-1)·1, (-1)·0-1·(-1)) = (1, 1, 1)。|AB×AC| = √3。三角形面积 = ½√3。" },
    ],
    pitfalls: "叉积不满足交换律（反交换）。叉积为零向量 ⇔ 两向量平行（共线）。行列式展开时注意 j 分量的符号是负的（i j k 行展开，j 的代数余子式带负号）。",
  },
  {
    id: "k-geo-line-equations",
    title: "空间直线三种方程形式互化",
    category: "解析几何",
    scenario: "参数式、对称式（点向式）、一般式（两平面交线）之间的转换",
    core: `① 参数式：x = x₀+lt, y = y₀+mt, z = z₀+nt。② 对称式：(x-x₀)/l = (y-y₀)/m = (z-z₀)/n = t。③ 一般式：两平面交线 {A₁x+B₁y+C₁z+D₁=0; A₂x+B₂y+C₂z+D₂=0}。方向向量 v = n₁ × n₂（两平面法向量的叉积）。对称式转一般式：每两个等式联立得一个平面。`,
    examples: [
      { problem: "将直线 (x-1)/2 = (y+1)/3 = z/1 转化为一般式", solution: "由 (x-1)/2 = z 得 x - 2z - 1 = 0；由 (y+1)/3 = z 得 y - 3z + 1 = 0。一般式：{ x - 2z - 1 = 0; y - 3z + 1 = 0 }。验证：平面法向量 n₁=(1,0,-2), n₂=(0,1,-3)。方向向量 v = n₁×n₂ = (2, 3, 1)，与原方向向量 (2,3,1) 一致 ✓" },
    ],
    pitfalls: "一般式转对称式时需要找到直线上一点（令某个变量为 0，解方程组得另两个）。方向向量是两个平面法向量的叉积。",
  },
  {
    id: "k-geo-plane-pencil",
    title: "平面束方程（过直线的平面族）",
    category: "解析几何",
    scenario: "求过给定直线且满足另一条件的平面方程",
    core: `设直线 L 是两平面交线：{π₁: A₁x+B₁y+C₁z+D₁=0; π₂: A₂x+B₂y+C₂z+D₂=0}。则过 L 的所有平面（除 π₂ 外）可表示为：A₁x+B₁y+C₁z+D₁ + λ(A₂x+B₂y+C₂z+D₂) = 0（λ 为参数）。给定一个额外条件（过某点、与某平面垂直等）即可确定 λ。`,
    examples: [
      { problem: "求过直线 { x+y-z-1=0; x-y+z+1=0 } 且过点 (1,2,-1) 的平面方程", solution: "设平面束：x+y-z-1 + λ(x-y+z+1) = 0。代入点 (1,2,-1)：1+2-(-1)-1 + λ(1-2+(-1)+1) = 3 + λ(-1) = 0 → λ = 3。平面：x+y-z-1 + 3(x-y+z+1) = 0 → x+y-z-1+3x-3y+3z+3 = 0 → 4x-2y+2z+2=0 → 2x-y+z+1=0。" },
    ],
    pitfalls: "平面束不包含 π₂ 本身。如果解出来 λ 不存在（分母为 0 等异常），要检验 π₂ 是否满足条件。",
  },
  {
    id: "k-geo-surface-of-revolution",
    title: "旋转曲面方程生成规律",
    category: "解析几何",
    scenario: "坐标面上的曲线绕某坐标轴旋转生成的曲面方程",
    core: "口诀：绕哪个轴旋转，哪个变量不变，另一个变量替换为 ±√(另一个² + 第三个²)。具体：① yOz 面上的曲线 f(y,z)=0 绕 z 轴旋转：f(±√(x²+y²), z)=0（z 不变，y → ±√(x²+y²)）② 绕 y 轴旋转：f(y, ±√(x²+z²))=0。③ xOy 面上曲线绕 x 轴：f(x, ±√(y²+z²))=0。",
    examples: [
      { problem: "yOz 面上抛物线 z = y² 绕 z 轴旋转，求曲面方程", solution: "绕 z 轴转，z 不变，y → ±√(x²+y²)。z = (±√(x²+y²))² = x² + y²。曲面方程：z = x² + y²（旋转抛物面）。" },
    ],
    pitfalls: "替换的是另一个变量（不是旋转轴对应的那个）。平方后正负号自动消掉，所以一般不用写 ±，直接平方即可。",
  },
  {
    id: "k-geo-projection-cylinder",
    title: "投影柱面与投影曲线求法",
    category: "解析几何",
    scenario: "求空间曲线在坐标面上的投影曲线方程",
    core: "空间曲线 C: {F(x,y,z)=0; G(x,y,z)=0}。求 C 在 xOy 面上的投影：① 从方程组中消去 z，得到 H(x,y)=0（母线平行于 z 轴的投影柱面）② 投影曲线：{ H(x,y)=0; z=0 }。同理，消去 x 得 yOz 面投影柱面；消去 y 得 xOz 面投影柱面。",
    examples: [
      { problem: "求曲线 { x²+y²+z²=1; x+y+z=0 } 在 xOy 面上的投影曲线", solution: "从两式消去 z：z = -x-y，代入球面：x²+y²+(x+y)² = 1 → x²+y²+x²+2xy+y² = 1 → 2x²+2y²+2xy = 1 → x²+y²+xy = 1/2。投影曲线：{ x²+y²+xy = 1/2; z = 0 }。" },
    ],
    pitfalls: "注意投影是曲线 + 坐标面（z=0），不是只有 H(x,y)=0。H(x,y)=0 只是投影柱面（三维曲面）。",
  },
  {
    id: "k-geo-quadric-surfaces",
    title: "二次曲面识别：方程特征对照表",
    category: "解析几何",
    scenario: "给定二次曲面方程，判断曲面类型",
    core: "① 椭球面：x²/a² + y²/b² + z²/c² = 1（三个平方项，都是 +，右边 1）② 单叶双曲面：x²/a² + y²/b² - z²/c² = 1（两+一-，右边 1）③ 双叶双曲面：x²/a² - y²/b² - z²/c² = 1（一+两-，右边 1）④ 椭圆抛物面：z = x²/a² + y²/b²（一次项 = 两平方项同号）⑤ 双曲抛物面（马鞍面）：z = x²/a² - y²/b²（一次项 = 两平方项异号）⑥ 锥面：x²/a² + y²/b² - z²/c² = 0（齐次方程，右边 0）。",
    examples: [
      { problem: "判断 z² = x² + y² 是什么曲面", solution: "改写为 x² + y² - z² = 0。二次齐次方程（每一项都是二次的），右边为 0 → 这是圆锥面（顶点在原点，开口沿 z 轴）。验证：用平面 z=k 截得 x²+y²=k²，是半径 |k| 的圆，符合圆锥特征。" },
    ],
    pitfalls: "锥面是齐次方程（每一项次数相同），右边为 0。抛物面有一个一次项。双曲面右边是 1（或其他正数），单叶有两个正平方项，双叶只有一个。",
  },
  {
    id: "k-geo-plane-equation-forms",
    title: "平面方程的五种形式",
    category: "解析几何",
    scenario: "根据已知条件选择合适的平面方程形式",
    core: "① 点法式：A(x-x₀)+B(y-y₀)+C(z-z₀)=0，已知点(x₀,y₀,z₀)和法向量(A,B,C)。② 一般式：Ax+By+Cz+D=0。③ 截距式：x/a + y/b + z/c = 1，a,b,c 为截距。④ 三点式：已知三点求平面（用行列式或向量叉乘求法向量）。⑤ 法线式：x cos α + y cos β + z cos γ - p = 0，p 为原点到平面距离。",
    examples: [
      { problem: "求过三点 A(1,1,1), B(1,2,3), C(2,3,4) 的平面方程", solution: "向量 AB=(0,1,2), AC=(1,2,3)。法向量 n = AB×AC = |i j k; 0 1 2; 1 2 3| = (3-4, 2-0, 0-1) = (-1, 2, -1)。用点 A(1,1,1) 点法式：-1(x-1) + 2(y-1) - 1(z-1) = 0 → -x+1+2y-2-z+1=0 → -x+2y-z=0 → x - 2y + z = 0。验证：A(1,1,1): 1-2+1=0 ✓, B(1,2,3): 1-4+3=0 ✓, C(2,3,4): 2-6+4=0 ✓" },
    ],
    pitfalls: "三点式的关键是求法向量（两点连线叉乘）。注意三点不能共线（共线的话叉乘为零向量，无法求法向量）。",
  },
  {
    id: "k-geo-scalar-triple-product",
    title: "混合积（标量三重积）与共面条件",
    category: "解析几何",
    scenario: "判断三个向量共面、求平行六面体体积",
    core: `混合积 (a b c) = a · (b × c) = |a_x a_y a_z; b_x b_y b_z; c_x c_y c_z|（行列式）。几何意义：绝对值等于以 a,b,c 为邻边的平行六面体的体积。三向量共面 ⇔ 混合积 = 0。四点共面 ⇔ 从同一点出发的三向量混合积为 0。`,
    examples: [
      { problem: "判断四点 A(1,0,0), B(0,1,0), C(0,0,1), D(1,1,1) 是否共面", solution: "向量 AB=(-1,1,0), AC=(-1,0,1), AD=(0,1,1)。混合积 = |-1 1 0; -1 0 1; 0 1 1| = -1(0·1-1·1) - 1((-1)·1-1·0) + 0((-1)·1-0·0) = -1(-1) - 1(-1) + 0 = 1+1 = 2 ≠ 0。不共面。体积 = |混合积| = 2。" },
    ],
    pitfalls: "混合积的绝对值是体积。混合积为零是三向量共面的充要条件。行列式交换两行变号，所以混合积对轮换是不变的（(a b c)=(b c a)=(c a b)），对换变号。",
  },
  {
    id: "k-geo-cylinder-equation",
    title: "柱面方程识别",
    category: "解析几何",
    scenario: "识别柱面方程（母线平行于坐标轴的）",
    core: "母线平行于 z 轴的柱面方程不含 z（即只有 x,y 的方程 F(x,y)=0）。同理，不含 y 的是母线平行于 y 轴的柱面，不含 x 的是母线平行于 x 轴的柱面。方程中缺哪个变量，母线就平行于哪个轴。",
    examples: [
      { problem: "方程 x² + y² = R² 表示什么曲面？", solution: "方程不含 z，所以是母线平行于 z 轴的圆柱面。准线是 xOy 面上的圆 x²+y²=R²。（注意：在二维平面几何中 x²+y²=R² 是圆，但在空间解析几何中是圆柱面！）" },
    ],
    pitfalls: "柱面方程是空间中的概念（缺一个变量 = 母线平行于该变量对应的轴）。不要把空间中的柱面和平面中的曲线混淆。",
  },
  {
    id: "k-geo-angle-between-planes",
    title: "两平面夹角与两直线夹角",
    category: "解析几何",
    scenario: "求平面间、直线间、直线与平面的夹角",
    core: `① 两平面夹角 θ：cos θ = |n₁·n₂| / (|n₁||n₂|)（取锐角）。② 两直线夹角 φ：cos φ = |v₁·v₂| / (|v₁||v₂|)（取锐角）。③ 直线与平面夹角 ψ：sin ψ = |v·n| / (|v||n|)（直线与平面夹角 = 90° - 直线与法线的夹角，所以用 sin）。`,
    examples: [
      { problem: "求平面 x+y+z=1 与 x-y+2z=3 的夹角", solution: "n₁=(1,1,1), n₂=(1,-1,2)。n₁·n₂ = 1-1+2 = 2。|n₁| = √3, |n₂| = √(1+1+4) = √6。cos θ = |2| / (√3·√6) = 2/√18 = 2/(3√2) = √2/3。θ = arccos(√2/3)。" },
    ],
    pitfalls: "平面夹角和直线夹角都取锐角或直角（取绝对值）。直线与平面的夹角是直线与其在平面上投影的夹角，范围 [0, π/2]，用 sin 计算。",
  },
  {
    id: "k-geo-normal-vector-from-plane",
    title: "从平面方程读法向量的技巧",
    category: "解析几何",
    scenario: "快速读取平面方程的法向量",
    core: "平面一般式 Ax+By+Cz+D=0 中，x,y,z 的系数就是法向量 n = (A,B,C)。这是解析几何中最重要的结论之一，几乎所有平面问题都从这里入手。平面平行：法向量成比例。平面垂直：法向量点积为 0。",
    examples: [
      { problem: "求过点 (1,2,3) 且与平面 2x - y + 3z = 5 平行的平面方程", solution: "平行平面法向量相同：n = (2, -1, 3)。点法式：2(x-1) - 1(y-2) + 3(z-3) = 0 → 2x-2-y+2+3z-9 = 0 → 2x - y + 3z - 9 = 0。验证：法向量 (2,-1,3) 与原平面相同 ✓，点 (1,2,3) 代入：2-2+9-9=0 ✓" },
    ],
    pitfalls: "不要记错法向量和方程系数的关系——就是一次项的系数。平行平面只差常数项不同。",
  },
  {
    id: "k-geo-parametric-curve",
    title: "空间曲线的切线与法平面",
    category: "解析几何",
    scenario: "求空间曲线在某点处的切线方程和法平面方程",
    core: "曲线 r(t) = (x(t), y(t), z(t))。在 t=t₀ 处的切向量：r'(t₀) = (x'(t₀), y'(t₀), z'(t₀))。切线方程：(x-x₀)/x'(t₀) = (y-y₀)/y'(t₀) = (z-z₀)/z'(t₀)。法平面方程（垂直于切向量且过该点）：x'(t₀)(x-x₀) + y'(t₀)(y-y₀) + z'(t₀)(z-z₀) = 0。",
    examples: [
      { problem: "求曲线 x=t, y=t², z=t³ 在 t=1 处的切线和法平面", solution: "t=1 时，点 (1,1,1)。切向量：r'(t) = (1, 2t, 3t²)，r'(1) = (1, 2, 3)。切线：(x-1)/1 = (y-1)/2 = (z-1)/3。法平面：1·(x-1) + 2·(y-1) + 3·(z-1) = 0 → x+2y+3z - 6 = 0。" },
    ],
    pitfalls: "切向量是 r'(t)（对参数求导）。切线方向 = 切向量方向。法平面的法向量 = 切向量（因为法平面垂直于切线）。不要搞混。",
  },
  {
    id: "k-geo-tangent-plane",
    title: "曲面的切平面与法线",
    category: "解析几何",
    scenario: "求曲面在某点处的切平面方程和法线方程",
    core: `曲面 F(x,y,z)=0，点 M₀(x₀,y₀,z₀) 在曲面上。切平面的法向量（即梯度）：∇F(M₀) = (F_x(M₀), F_y(M₀), F_z(M₀))。切平面：F_x(x₀)(x-x₀) + F_y(y₀)(y-y₀) + F_z(z₀)(z-z₀) = 0。法线方程：(x-x₀)/F_x(x₀) = (y-y₀)/F_y(y₀) = (z-z₀)/F_z(z₀)。`,
    examples: [
      { problem: "求球面 x²+y²+z²=14 在点 (1,2,3) 处的切平面和法线", solution: "F = x²+y²+z²-14。∇F = (2x, 2y, 2z)，在 (1,2,3) 处为 (2, 4, 6)（即 (1,2,3)）。切平面：1·(x-1) + 2·(y-2) + 3·(z-3) = 0 → x+2y+3z - (1+4+9) = 0 → x+2y+3z = 14。法线：(x-1)/1 = (y-2)/2 = (z-3)/3。" },
    ],
    pitfalls: "切平面的法向量就是梯度。法线方向也是梯度方向。验证：点代入切平面方程左边应等于右边。",
  },
  {
    id: "k-geo-sphere-equation",
    title: "球面方程与球心半径",
    category: "解析几何",
    scenario: "球面方程的标准式和一般式，求球心和半径",
    core: `标准式：(x-a)² + (y-b)² + (z-c)² = R²，球心 (a,b,c)，半径 R。一般式：x²+y²+z²+Dx+Ey+Fz+G = 0（x²,y²,z² 系数相等且无 xy,yz,zx 交叉项）。配方化为标准式：球心 (-D/2, -E/2, -F/2)，半径 R = ½√(D²+E²+F²-4G)。只有 D²+E²+F²-4G > 0 时才是实球面。`,
    examples: [
      { problem: "求球面 x²+y²+z²-2x+4y-6z+5=0 的球心和半径", solution: "配方：(x²-2x+1) + (y²+4y+4) + (z²-6z+9) + 5 - 1 - 4 - 9 = 0 → (x-1)² + (y+2)² + (z-3)² - 9 = 0 → (x-1)² + (y+2)² + (z-3)² = 9。球心 (1, -2, 3)，半径 3。" },
    ],
    pitfalls: "二次项系数必须都是 1（或相等），否则先除以系数再配方。一般式方程中如果有 xy, yz, zx 等交叉项，就不是球面（可能是一般二次曲面，需要转轴消去交叉项）。",
  },
  {
    id: "k-geo-line-plane-intersection",
    title: "直线与平面的交点求法",
    category: "解析几何",
    scenario: "求直线与平面的交点坐标",
    core: "方法：将直线的参数方程代入平面方程，解出参数 t，再回代得交点坐标。特殊情形：若 v·n = 0（方向向量与法向量垂直）且点在平面外 → 平行无交点；若 v·n = 0 且点在平面内 → 直线在平面内。",
    examples: [
      { problem: "求直线 (x-1)/2 = (y+2)/3 = (z-1)/-1 与平面 2x + y - z + 3 = 0 的交点", solution: "令参数 t：x = 1+2t, y = -2+3t, z = 1-t。代入平面方程：2(1+2t) + (-2+3t) - (1-t) + 3 = 0 → 2+4t-2+3t-1+t+3 = 0 → 8t + 2 = 0 → t = -1/4。回代：x = 1+2(-1/4)=1-1/2=1/2, y = -2+3(-1/4)=-2-3/4=-11/4, z = 1-(-1/4)=5/4。交点 (1/2, -11/4, 5/4)。" },
    ],
    pitfalls: "代入后若 t 的系数为 0，则直线与平面平行。此时要看常数项是否也为 0（判断直线在平面内还是平行无交点）。",
  },
  {
    id: "k-geo-dot-product-geo",
    title: "点积的几何意义与应用",
    category: "解析几何",
    scenario: "向量点积（数量积）的几何意义和典型用途",
    core: `点积 a·b = |a||b|cos θ = a_xb_x + a_yb_y + a_zb_z。几何意义：① 求夹角：cos θ = a·b/(|a||b|) ② 求投影：Prj_a b = a·b/|a|（b 在 a 上的投影）③ 判断垂直：a·b = 0 ⇔ a ⊥ b ④ 求模长：|a| = √(a·a)。`,
    examples: [
      { problem: "已知 |a|=2, |b|=3, a·b=3，求 a 在 b 上的投影", solution: "Prj_b a = a·b / |b| = 3/3 = 1。验证：cos θ = a·b/(|a||b|) = 3/(2·3) = 1/2，θ=60°。Prj_b a = |a|cos θ = 2 · 1/2 = 1 ✓" },
    ],
    pitfalls: "点积结果是标量（数），不是向量。投影也是标量（可正可负）。向量 a 在 b 上的投影向量 = (a·b/|b|²) · b（标量投影乘上 b 方向的单位向量）。",
  },
  {
    id: "k-geo-coordinate-systems",
    title: "三种坐标系的转换关系",
    category: "解析几何",
    scenario: "直角坐标、柱坐标、球坐标之间的转换",
    core: `直角 ↔ 柱坐标 (ρ, φ, z)：x = ρ cos φ, y = ρ sin φ, z = z；ρ = √(x²+y²), φ = arctan(y/x)。直角 ↔ 球坐标 (r, θ, φ)：x = r sin θ cos φ, y = r sin θ sin φ, z = r cos θ；r = √(x²+y²+z²), θ = arccos(z/r), φ = arctan(y/x)。注意：θ 是极角（与 z 轴夹角，0≤θ≤π），φ 是方位角（绕 z 轴，0≤φ≤2π）。`,
    examples: [
      { problem: "将直角坐标 (1, 1, √2) 转化为球坐标", solution: "r = √(1+1+2) = √4 = 2。θ = arccos(z/r) = arccos(√2/2) = π/4。φ = arctan(y/x) = arctan(1) = π/4（第一象限）。球坐标 (2, π/4, π/4)。" },
    ],
    pitfalls: "注意 θ 和 φ 的定义不要搞混（哪个是极角哪个是方位角）。不同教材符号可能不同（有的用 θ 表示方位角、φ 表示极角）。我们的约定：θ = 极角（与 z 轴夹角），φ = 方位角。",
  },
  {
    id: "k-geo-quadratic-curve-general",
    title: "平面二次曲线一般式化简",
    category: "解析几何",
    scenario: "Ax² + Bxy + Cy² + Dx + Ey + F = 0 判定曲线类型",
    core: `二次曲线一般式：Ax² + Bxy + Cy² + Dx + Ey + F = 0。判别式 Δ = B² - 4AC。① Δ < 0 → 椭圆型（椭圆、圆、点、虚椭圆）② Δ = 0 → 抛物型（抛物线、两平行直线、两重合直线、两虚平行直线）③ Δ > 0 → 双曲型（双曲线、两相交直线）。利用转轴（消去交叉项 Bxy）+ 平移（消去一次项）化为标准形式。`,
    examples: [
      { problem: "判断 2x² + xy + 3y² + 4x + 5y - 6 = 0 的类型", solution: "A=2, B=1, C=3。Δ = 1² - 4·2·3 = 1 - 24 = -23 < 0。椭圆型。（进一步可通过转轴消去 xy 项，化为标准椭圆方程）" },
    ],
    pitfalls: "判别式只是判别类型（椭圆/抛物/双曲），具体是曲线还是退化情形（点、直线对）还要看不变量。竞赛中重点掌握识别类型和基本消元思路。",
  },
  {
    id: "k-geo-vector-projection",
    title: "向量的投影与投影向量",
    category: "解析几何",
    scenario: "求向量在另一向量上的投影（标量）和投影向量",
    core: `向量 b 在向量 a 上的**标量投影**：Prj_a b = |b|cos θ = a·b / |a|（标量，可正可负）。**投影向量**：(Prj_a b) · (a/|a|) = (a·b/|a|²)a（向量，方向沿 a 或反 a）。向量 b 可以分解为平行于 a 的分量 + 垂直于 a 的分量。`,
    examples: [
      { problem: "求向量 b = (1,2,3) 在 a = (1,1,0) 上的投影向量", solution: "a·b = 1·1 + 1·2 + 0·3 = 3。|a|² = 1+1+0 = 2。投影向量 = (3/2) · (1,1,0) = (3/2, 3/2, 0)。验证：垂直分量 = b - 投影 = (1-1.5, 2-1.5, 3-0) = (-0.5, 0.5, 3)。点积：a · 垂直分量 = 1·(-0.5) + 1·0.5 + 0·3 = -0.5+0.5 = 0 ✓" },
    ],
    pitfalls: "标量投影是一个数（有正负），投影向量是一个向量（方向沿 a）。不要混淆两者。投影的绝对值 = |b|sin θ 对应的是垂直距离的相关量。",
  },

  // ========== 跨专题方法卡（20 张） ==========
  {
    id: "k-cross-cauchy-inequality",
    title: "柯西不等式（积分形式）",
    category: "跨专题方法",
    scenario: "积分不等式证明，含平方和乘积的积分",
    core: `(∫_a^b f(x)g(x)dx)² ≤ (∫_a^b f²(x)dx)(∫_a^b g²(x)dx)。等号成立当且仅当 f 与 g 线性相关（存在常数 λ 使 f=λg 或 g=λf）。离散形式：(Σa_i b_i)² ≤ (Σa_i²)(Σb_i²)。`,
    examples: [
      { problem: "证明 (∫_a^b f(x)dx)² ≤ (b-a)∫_a^b f²(x)dx", solution: "在柯西不等式中取 g(x) ≡ 1，则左边 (∫f·1 dx)² ≤ (∫f² dx)(∫1² dx) = (b-a)∫f² dx。即得证。" },
    ],
    pitfalls: "柯西不等式的各种形式（离散、积分、向量内积）本质都是内积空间的柯西-施瓦茨不等式。竞赛中积分形式考得更多。",
  },
  {
    id: "k-cross-variable-limit-construction",
    title: "积分不等式：变限积分构造法",
    category: "跨专题方法",
    scenario: "含定积分的不等式证明，特别是上下限含字母的",
    core: "将不等式一端的上限（或下限）换成变量 t，构造关于 t 的函数 F(t)，然后求导判断单调性，最后代回 t = b 得到原不等式。关键：F(a) = 0 且 F'(t) ≥ 0 ⇒ F(b) ≥ 0。",
    examples: [
      { problem: "f 在 [0,1] 单调递增，证明 ∫₀¹ xf(x)dx ≥ ½∫₀¹ f(x)dx", solution: "令 F(t) = ∫₀ᵗ x f(x)dx - ½t∫₀ᵗ f(x)dx。F(0) = 0。F'(t) = t f(t) - ½∫₀ᵗ f(x)dx - ½t f(t) = ½t f(t) - ½∫₀ᵗ f(x)dx = ½[t f(t) - ∫₀ᵗ f(x)dx]。由积分中值定理，∫₀ᵗ f(x)dx = t f(ξ), ξ ∈ [0,t]。因 f 递增，f(t) ≥ f(ξ)，故 t f(t) ≥ t f(ξ) = ∫₀ᵗ f(x)dx。F'(t) ≥ 0，F 递增，F(1) ≥ F(0) = 0。得证。" },
    ],
    pitfalls: "变限构造法的核心是把不等式问题转化为函数单调性问题。构造时注意选择把哪个变量替换为 t（通常是积分上限）。",
  },
  {
    id: "k-cross-scaling-method",
    title: "积分不等式：放缩法（比较法）",
    category: "跨专题方法",
    scenario: "积分不等式证明，被积函数可放大或缩小",
    core: "若 f(x) ≤ g(x) 对所有 x ∈ [a,b] 成立，则 ∫_a^b f(x)dx ≤ ∫_a^b g(x)dx。放缩技巧：① 用最值代替（f(x) ≤ max f）② 用已知不等式（均值、柯西、Jensen）③ 去掉/增加某些项使表达式更简单 ④ 三角不等式 |∫f| ≤ ∫|f|。",
    examples: [
      { problem: "证明 ∫₀¹ e^{-x²} dx > 1 - 1/e", solution: "在 [0,1] 上，e^{-x²} ≥ e^{-x}（因为 x² ≤ x → -x² ≥ -x，e^u 递增）。∫₀¹ e^{-x²} dx ≥ ∫₀¹ e^{-x} dx = [-e^{-x}]₀¹ = 1 - e^{-1} = 1 - 1/e。等号不恒成立（只在 x=0 和 x=1 处相等），故严格 >。" },
    ],
    pitfalls: "放缩要适度——放得太大或缩得太小都会导致不等式方向反了（得不到想要的结果）。放缩后积分要能算出来才有意义。",
  },
  {
    id: "k-cross-ibp-inequality",
    title: "积分不等式：分部积分法",
    category: "跨专题方法",
    scenario: "含 f'(x) 和 f(x) 的积分不等式，或高阶导数与原函数的关系",
    core: "分部积分可以将 f 的积分与 f' 的积分联系起来：∫_a^b f(x)g'(x)dx = f(x)g(x)|_a^b - ∫_a^b f'(x)g(x)dx。对于不等式，可以通过适当选择 g(x) 来建立 f 与其导数之间的积分不等式（如 Poincaré 不等式等）。",
    examples: [
      { problem: "f 在 [0,1] 有连续导数，f(0)=0，证明 ∫₀¹ f²(x)dx ≤ ½∫₀¹ (f'(x))² dx", solution: "f(x) = ∫₀ˣ f'(t)dt。由柯西：f²(x) = (∫₀ˣ f'dt)² ≤ ∫₀ˣ 1² dt · ∫₀ˣ (f')² dt = x ∫₀ˣ (f')² dt。两边积分：∫₀¹ f² dx ≤ ∫₀¹ [x ∫₀ˣ (f')² dt] dx。交换积分（内层积分从 t 到 1 积分 x dx）... （这其实是 Poincaré 不等式，更简单的做法也可用分部积分）" },
    ],
    pitfalls: "分部积分的关键是选对 u 和 dv。在不等式证明中，分部积分常常和其他技巧（放缩、柯西、交换积分次序）结合使用。",
  },
  {
    id: "k-cross-taylor-inequality",
    title: "积分不等式：泰勒展开法",
    category: "跨专题方法",
    scenario: "已知高阶导数符号或界，证明含积分的不等式",
    core: "将 f 在适当点展开为泰勒公式（带积分余项或拉格朗日余项），然后积分。利用高阶导数的符号（如 f'' ≥ 0）得到不等式。展开点常选中点、端点、或使得 f' 为 0 的点。",
    examples: [
      { problem: "f''(x) ≥ 0，证明 f((a+b)/2) ≤ 1/(b-a) ∫_a^b f(x)dx ≤ (f(a)+f(b))/2（哈达玛不等式）", solution: "左半：f(x) ≥ f(c) + f'(c)(x-c)（凸函数，c=(a+b)/2）。积分得 ∫_a^b f ≥ (b-a)f(c) → f(c) ≤ 1/(b-a)∫f。右半：弦在曲线上方，f(x) ≤ f(a) + (f(b)-f(a))(x-a)/(b-a)。积分：∫f ≤ (b-a)f(a) + (f(b)-f(a))(b-a)²/[2(b-a)] = (b-a)(f(a)+f(b))/2。" },
    ],
    pitfalls: "泰勒展开点的选择很关键。展开在中点、左端点、右端点会得到不同的不等式。哈达玛不等式是凸函数积分的经典结论。",
  },
  {
    id: "k-cross-mvt-7-auxiliary",
    title: "中值定理辅助函数 7 法总结",
    category: "跨专题方法",
    scenario: "中值定理证明题中构造辅助函数的常用方法汇总",
    core: "① 原函数法（积分法）：把结论中的 ξ 换 x，积分得 F(x)，验证 F 满足罗尔条件 ② 指数因子法：f' + kf = 0 → F = e^{kx}f ③ 幂函数因子：xf' + nf = 0 → F = xⁿ f ④ 商的导数法：(f'g - fg')/g² = (f/g)' → F = f/g ⑤ 常数 k 值法：对称式令常数 = k，重排使两边同形 ⑥ 变上限积分作辅助函数 ⑦ 两个函数线性组合 F = λf + μg。",
    examples: [
      { problem: "f,g 在 [a,b] 可导，g'(x)≠0，证 ∃ξ: [f(ξ)-f(a)]/[g(b)-g(ξ)] = f'(ξ)/g'(ξ)", solution: "交叉相乘整理：f(ξ)g'(ξ) - f(a)g'(ξ) = f'(ξ)g(b) - f'(ξ)g(ξ) → f(ξ)g'(ξ) + f'(ξ)g(ξ) - f'(ξ)g(b) - f(a)g'(ξ) = 0 → [f(x)g(x)]' - g(b)f'(x) - f(a)g'(x) = 0。积分得 F(x) = f(x)g(x) - g(b)f(x) - f(a)g(x)。验证 F(a) = f(a)g(a) - g(b)f(a) - f(a)g(a) = -f(a)g(b)。F(b) = f(b)g(b) - g(b)f(b) - f(a)g(b) = -f(a)g(b)。F(a)=F(b)，由罗尔定理得证。" },
    ],
    pitfalls: "辅助函数构造是中值定理证明的核心能力。多练习，总结规律。做完后一定要验证 F(a) 是否等于 F(b)（罗尔条件）。",
  },
  {
    id: "k-cross-series-proof-4-methods",
    title: "级数证明题 4 大方法",
    category: "跨专题方法",
    scenario: "级数相关的证明题（敛散性、估计、不等式）",
    core: "① 比较判别法（放缩通项，与已知级数比较）② 部分和法（讨论 S_n 的极限存在性，如单调有界）③ 柯西准则（片段和估计，证明发散常用）④ 积分判别法（通项单调递减，转化为积分讨论）。根据题目条件选择合适的方法。",
    examples: [
      { problem: "a_n > 0 单调递减，Σ a_n 发散，证明 Σ a_n / S_n 发散（其中 S_n = Σ_{k=1}^n a_k）", solution: "用柯西准则。考察片段和 Σ_{k=n+1}^{n+p} a_k/S_k ≥ Σ_{k=n+1}^{n+p} a_k/S_{n+p}（因 S_k ≤ S_{n+p}）= (S_{n+p} - S_n)/S_{n+p} = 1 - S_n/S_{n+p}。因为 S_n → ∞（发散），对任意 n，取 p 足够大可使 S_n/S_{n+p} < 1/2。故片段和 ≥ 1/2，不满足柯西准则条件，级数发散。" },
    ],
    pitfalls: "级数证明题常常需要一些巧妙的放缩。柯西准则特别适合证明发散（找到一个固定的 ε 使片段和超过它）。",
  },
  {
    id: "k-cross-mcq-special-value",
    title: "填空题秒杀：特值代入法",
    category: "跨专题方法",
    scenario: "选择题/填空题，答案是确定的常数或函数形式，可用特例快速求",
    core: "原理：如果对所有满足条件的 f 结论都成立，那么对特殊的 f 也成立。选最简单的特例（常函数、线性函数、具体数字等）代入，直接算出答案。适用：含任意函数的等式/不等式验证、参数类题答案唯一时。",
    examples: [
      { problem: "f''(x) 连续，求 lim_{h→0} [f(x+h) - 2f(x) + f(x-h)] / h²", solution: "取 f(t) = t²（二阶导=2，常数，满足连续条件）。分子 = (x+h)² - 2x² + (x-h)² = x²+2xh+h² - 2x² + x²-2xh+h² = 2h²。除以 h² 得 2。答案就是 2（其实是 f''(x)，此例 f''=2 ✓）。" },
    ],
    pitfalls: "特值法只能用来验证或猜测答案，不能作为证明题的完整解答。但在选择填空时极其高效，为大题争取时间。",
  },
  {
    id: "k-cross-symmetry-trick",
    title: "对称性秒杀技巧",
    category: "跨专题方法",
    scenario: "积分（定积分、重积分、线面积分）利用对称性快速化简",
    core: "对称区间上奇函数积分 = 0，偶函数积分 = 2 倍半区间。轮换对称：交换变量后积分区域不变，则 ∫∫ f(x,y) = ∫∫ f(y,x) = ½ ∫∫ [f(x,y)+f(y,x)]。几何对称：利用图形的对称性质减少计算量。竞赛中高频率使用，可以节省大量计算时间。",
    examples: [
      { problem: "计算 ∬_{x²+y²≤1} (2x + 3y² + 4) dσ", solution: "x 是奇函数，区域关于 y 轴对称 → ∬ 2x dσ = 0。y²：由轮换对称 ∬ y² = ∬ x² = ½∬(x²+y²)。∬ y² dσ = ½ ∫₀^{2π} dθ ∫₀¹ r²·r dr = ½·2π·1/4 = π/4。∬ 4 dσ = 4·π·1² = 4π。结果 = 0 + 3·(π/4) + 4π = 3π/4 + 4π = 19π/4。" },
    ],
    pitfalls: "对称性要看两方面：① 积分区域对称 ② 被积函数有奇偶性（或轮换对称）。两者缺一不可。轮换对称不要求奇偶性，只要变量交换后区域不变就行。",
  },
  {
    id: "k-cross-dimensional-analysis",
    title: "量纲/阶数分析（快速检验）",
    category: "跨专题方法",
    scenario: "检验计算结果是否正确，或快速排除错误选项",
    core: "量纲分析：如果 x 有长度量纲 L，则 dx 也是 L，∫f(x)dx 的量纲是 L × [f]。导数 d/dx 的量纲是 1/L。通过检查两边量纲是否一致，可以发现很多计算错误。阶数分析：估计结果的阶数（数量级），排除明显偏差太大的选项。",
    examples: [
      { problem: "检验 ∫_0^R √(R²-x²) dx = πR²/4 的量纲是否正确", solution: "左边：x 和 R 都是长度量纲 L，√(R²-x²) 也是 L，dx 是 L，积分结果量纲 L×L = L²（面积）。右边：π 无量纲，R² 量纲 L²，/4 无量纲。量纲 L²。左边 = 右边量纲一致。实际上这个积分是 1/4 圆面积 ✓" },
    ],
    pitfalls: "量纲一致不保证正确，但量纲不一致一定错误。所以量纲分析是检验错误的必要条件（不是充分条件）。做完题用 3 秒量纲检查，能发现许多低级错误。",
  },
  {
    id: "k-cross-endpoint-substitution",
    title: "端点代入法（检验参数题答案）",
    category: "跨专题方法",
    scenario: "含参数的问题答案形式不确定时，代入参数的极端值/特殊值检验",
    core: "把参数取特殊值（0, 1, ∞ 等），看答案是否退化为已知的简单情形。如果某选项在特殊值下明显不对，就可以排除。常见特殊值：参数为 0、参数为 1、参数趋向无穷、参数取使表达式简化的值。",
    examples: [
      { problem: "四个选项哪个可能是 ∫_0^a f(x)dx + ∫_0^{f(a)} f^{-1}(y)dy 的结果（假设 f 单调递增）", solution: "代入 a=0（此时左端点积分 = 0 + ∫_{f(0)}^{f(0)}... = 0），结果应为 0。如果有选项结果不是 0，直接排除。再代入 f(x)=x（线性，f^{-1}(y)=y）：∫₀ᵃ x dx + ∫₀ᵃ y dy = a²/2 + a²/2 = a²。而 a f(a) = a·a = a²。所以正确答案是 a f(a) 形式。" },
    ],
    pitfalls: "端点代入法不能保证唯一正确答案（可能有多个选项都通过检验），但能排除明显错误的选项。配合其他方法使用效果更佳。",
  },
  {
    id: "k-cross-formula-memorization",
    title: "公式化记忆提速法",
    category: "跨专题方法",
    scenario: "考前快速复习，提高计算速度",
    core: "核心公式必须烂熟于心，看到就能写出来：① 求导基本公式（指数、对数、三角、反三角）② 积分基本公式（对应求导反过来）③ 常用展开（泰勒/麦克劳林）④ 常用极限 ⑤ 常见积分特殊值（如 ∫₀^{π/2}sinⁿx 的 Wallis 公式）。公式熟 = 算得快 = 有更多时间想难题。",
    examples: [
      { problem: "求 d/dx [arctan((1+x)/(1-x))]", solution: "记住 arctan 的导数 = 1/(1+t²)，再用链式法则。或者直接记住结论：(1+x)/(1-x) 的 arctan 导数 = 1/(1+x²)（其实是 arctan x + π/4 的导数... 不对，应该直接算：令 t=(1+x)/(1-x), dt/dx = [(1-x)+(1+x)]/(1-x)² = 2/(1-x)²。导数 = [1/(1+t²)] · dt/dx = {1/[1+(1+x)²/(1-x)²]} · 2/(1-x)² = [(1-x)²/((1-x)²+(1+x)²)] · 2/(1-x)² = 2/[2(1+x²)] = 1/(1+x²)。记住这个结论有帮助。" },
    ],
    pitfalls: "公式记忆要准确（包括系数、符号）。记错公式比不会更糟（还以为自己算对了）。常用公式反复推导几次比死记更牢靠。",
  },
  {
    id: "k-cross-verification-tricks",
    title: "检验技巧（算完后必做）",
    category: "跨专题方法",
    scenario: "做完题目后快速检验，发现计算错误",
    core: "检验方法：① 量纲检查 ② 特殊值代入（如 x=0, x→∞ 等极端情形）③ 对称检验（结果应具有的对称性是否满足）④ 反向验证（把答案代入原题，看是否满足条件）⑤ 数量级估算（大概多大，差 10 倍以上肯定错）⑥ 符号检查（正负号是否合理）。",
    examples: [
      { problem: "求出的积分结果是 -∫_0^1 x² e^{-x} dx = e^{-1} - 2，如何快速检验？", solution: "① 符号：被积函数正，积分区间从 0 到 1，积分结果应该 > 0。e^{-1} - 2 ≈ 0.368 - 2 = -1.632 < 0 → 符号错了！应该是 2 - 3/e ≈ 2-1.104 = 0.896 > 0 ✓（正确答案）。② 数量级：∫₀¹ x² e^{-x} dx ≈ ∫₀¹ x² dx = 1/3 ≈ 0.333，但 e^{-x} < 1 所以积分应该略小于 1/3。0.896 显然太大…… 等等，原题是负号在外，所以 -积分应该是负数？不对，让我重新想：算出来的结果值大约是多少？x² e^{-x} 在 [0,1] 上从 0 到 e^{-1}，积分应该 < 1·e^{-1} ≈ 0.368。所以正确值应该在 0~0.368 之间。让我精确算：∫x²e^{-x}dx = -e^{-x}(x²+2x+2)。从 0 到 1：-e^{-1}(1+2+2) + e^{0}(0+0+2) = -5/e + 2 ≈ -1.839 + 2 = 0.161。在 [0, 0.368] 范围内 ✓。所以负这个值 ≈ -0.161。" },
    ],
    pitfalls: "做完题一定要检验！竞赛中计算错误比不会做更可惜（花了时间还没分）。检验不需要全重算，用量纲、特殊值、符号、数量级等快速手段筛一遍，正确率能提高 20%+。",
  },
  {
    id: "k-cross-easy-first",
    title: "应试策略：先易后难原则",
    category: "跨专题方法",
    scenario: "整体时间分配策略",
    core: "原则：先把所有会做的题做完，把能拿的分都拿到，再啃难题。不要在一道题上死磕太久。具体：① 浏览全卷，30 秒判断难度 ② 先做简单题（送分题先吃）③ 中等题稳扎稳打 ④ 难题最后啃，能写多少写多少（踩点得分）⑤ 留时间检查。时间比：简单题 30% 时间拿 60% 分，中等题 40% 时间拿 30% 分，难题 30% 时间争取 10% 分。",
    examples: [
      { problem: "一张 6 道大题的竞赛卷，前面简单题每题 15 分，最后一道压轴题 25 分，你会怎么分配 3 小时？", solution: "建议：① 前 4-5 道简单/中等题花 1.5-2 小时，确保正确率，拿到 60-75 分 ② 最后 1-1.5 小时攻压轴题，第一问必做（通常 8-10 分），第二问能写多少写多少 ③ 留 10-15 分钟检查前面的选择填空 ④ 绝对不要选择填空和前几道大题粗心丢分——会做的做错比不会做更亏" },
    ],
    pitfalls: "最大的策略错误就是：前面简单题匆匆做完（粗心错一堆），把大量时间花在自己可能做不出来的压轴题上。得分 = 会做的题 × 正确率。提高正确率 > 死磕难题。",
  },
  {
    id: "k-cross-filling-time-limit",
    title: "填空限时：3 分钟/题原则",
    category: "跨专题方法",
    scenario: "填空题时间管理",
    core: "填空题每题分值不高但数量多。原则：每题不超过 3 分钟。3 分钟没思路 → 先跳过，做完会的再回头。快速解题技巧：特值法、对称法、量纲分析、数形结合、排除法（如果有选项的话）。填空题不需要过程，只要答案对就行，怎么快怎么来。",
    examples: [
      { problem: "一道填空题：lim_{n→∞} (1ⁿ + 2ⁿ + ... + nⁿ)^{1/n} = ?，你 1 分钟内能出答案吗？", solution: "思路：nⁿ 是主导项，其他都小得多。(nⁿ)^{1/n} = n。(nⁿ + (n-1)ⁿ + ... + 1ⁿ)^{1/n} 介于 n 和 (n·nⁿ)^{1/n} = n·n^{1/n} 之间。n^{1/n} → 1。由夹逼准则，极限 = n。用特值验证：n=1 时 1，n=2 时 (1+4)^{1/2}=√5≈2.236=2×1.118，n=3 时 (1+8+27)^{1/3}=36^{1/3}≈3.3=3×1.1，确实趋近 n。答案：n。（不对，是 n→∞ 时极限是多少？nⁿ 主导，其他项可以忽略，结果应该是 n → ∞？等等，(1ⁿ+...+nⁿ)^{1/n} = n·((1/n)ⁿ+(2/n)ⁿ+...+1)^{1/n} = n·[Σ_{k=1}^n (k/n)ⁿ]^{1/n}。(k/n)ⁿ → 0 对固定 k。但最后一项 = 1，倒数第二项 = ((n-1)/n)ⁿ = (1-1/n)ⁿ → e^{-1}。再前面更小。所以和 ≈ 1 + e^{-1} + e^{-2} + ... = 1/(1-e^{-1}) = e/(e-1)。开 n 次方 → 1（因为任何常数开 n 次方 → 1）。所以极限 = n · 1 → ∞？不对，题目可能我理解错了。重新想：应该是 (1ⁿ+2ⁿ+...+nⁿ)^{1/n} / n 之类？不，就按原题理解，是 ∞？但填空题不会填 ∞。等等，可能原题是 (1ⁿ + 2ⁿ + ... + mⁿ)^{1/n} 当 n→∞？不对，这里上限就是 n 也随 n 变。让我用 max 估计：nⁿ < 1ⁿ+...+nⁿ < n·nⁿ。开 n 次方：n < (和)^{1/n} < n·n^{1/n}。两边都趋向 +∞。所以极限 = +∞。答案填 ∞ 或不存在（趋向无穷）。" },
    ],
    pitfalls: "填空题不要死磕，3 分钟不出答案就标记跳过。先把能拿的分全拿了，再回来啃。回来的时候可能因为后面题目的启发突然有思路了。",
  },
  {
    id: "k-cross-proof-writing",
    title: "大题书写规范（踩点得分）",
    category: "跨专题方法",
    scenario: "证明题/计算题大题的书写策略，确保踩中得分点",
    core: "得分点书写原则：① 先写结论（要证什么/求什么）② 分步写，每步设一行标题 ③ 关键步骤（定理应用、重要变换、核心等式）用明显的方式呈现 ④ 不会完整证明时，把会的部分写清楚（必要条件、特殊情形、部分结论）⑤ 即使不会，也写一两句相关的已知结论（不要空着）。",
    examples: [
      { problem: "中值定理证明题的规范书写模板", solution: "【要证】... 【分析】观察结论形式，拟用 XX 定理 【构造辅助函数】令 F(x) = ... 【验证条件】(1) F 在 [a,b] 上连续（因为...）(2) F 在 (a,b) 内可导（因为...）(3) F(a) = ..., F(b) = ...，故 F(a) = F(b) 【应用定理】由罗尔定理，存在 ξ ∈ (a,b) 使 F'(ξ) = 0 【计算得】F'(ξ) = ... = 0，即 ... 【得证】这样写即使某步计算错了，前面的步骤分也能拿到。" },
    ],
    pitfalls: "大题是按步骤给分的。即使最后答案错了，只要前面步骤对，也能拿大半分。相反，跳步太大或者书写混乱，即使结果对了也可能被扣过程分。条理清晰 = 得分保障。",
  },
  {
    id: "k-cross-jensen-inequality",
    title: "Jensen 不等式（积分形式）",
    category: "跨专题方法",
    scenario: "凸函数 + 积分/期望的不等式证明",
    core: `若 φ 是凸函数（φ'' ≥ 0），则 φ(∫_a^b f(x)·w(x)dx) ≤ ∫_a^b φ(f(x))·w(x)dx，其中 w(x) ≥ 0 且 ∫_a^b w(x)dx = 1（权重函数）。离散形式：φ(Σ λ_i x_i) ≤ Σ λ_i φ(x_i)，其中 λ_i ≥ 0, Σ λ_i = 1。凹函数不等号反向。`,
    examples: [
      { problem: "f(x) > 0 在 [a,b] 连续，证明 exp(1/(b-a)∫_a^b ln f(x) dx) ≤ 1/(b-a)∫_a^b f(x) dx", solution: "取 φ(t) = e^t（凸函数），w(x) = 1/(b-a)（均匀权重）。令 g(x) = ln f(x)（f = e^g）。由 Jensen：e^{∫_a^b g(x)·1/(b-a) dx} ≤ ∫_a^b e^{g(x)}·1/(b-a) dx = 1/(b-a)∫f dx。即 exp(平均值 ln f) ≤ f 的平均值。这是几何平均 ≤ 算术平均的积分版本。" },
    ],
    pitfalls: "Jensen 不等式方向容易搞反。记住：凸函数 φ，φ(平均) ≤ 平均 φ（图像在切线上方，所以加权平均的函数值 ≤ 函数值的加权平均）。凹函数反过来。",
  },
  {
    id: "k-cross-young-inequality",
    title: "Young 不等式与 Hölder 不等式",
    category: "跨专题方法",
    scenario: "乘积形式的积分不等式，推广柯西",
    core: `Young 不等式：ab ≤ a^p/p + b^q/q（a,b ≥ 0, p>1, 1/p+1/q=1）。等号当 a^p = b^q 时成立。Hölder 不等式（积分形式）：∫|fg| ≤ (∫|f|^p)^{1/p} · (∫|g|^q)^{1/q}。p=q=2 时就是柯西-施瓦茨不等式。离散形式类似。`,
    examples: [
      { problem: "用 Young 不等式证明 AM ≥ GM（a+b ≥ 2√ab）", solution: "Young 不等式中取 p=q=2：ab ≤ a²/2 + b²/2。令 a → √a, b → √b：√a·√b ≤ (√a)²/2 + (√b)²/2 = a/2 + b/2 → √(ab) ≤ (a+b)/2 → a+b ≥ 2√(ab)。得证。（p=q=2 时 Young 就是均值不等式）" },
    ],
    pitfalls: "Hölder 是柯西的推广（p=q=2 退化为柯西）。Young 是 Hölder 的基础。记忆时从简单到复杂：均值 → 柯西 → Hölder → Young，一脉相承。",
  },
  {
    id: "k-cross-inequality-chain",
    title: "常用不等式链（从小到大）",
    category: "跨专题方法",
    scenario: "不等式证明中选择合适的不等式",
    core: `均值不等式链：调和平均 ≤ 几何平均 ≤ 算术平均 ≤ 平方平均。即 n/(1/a₁+...+1/aₙ) ≤ (a₁...aₙ)^{1/n} ≤ (a₁+...+aₙ)/n ≤ √((a₁²+...+aₙ²)/n)。等号成立当且仅当所有 a_i 相等。其他常用：|sin x| ≤ |x| ≤ |tan x|（0<x<π/2），e^x ≥ 1+x，x/(1+x) ≤ ln(1+x) ≤ x（x>-1）。`,
    examples: [
      { problem: "证明 e^π > π^e（竞赛经典题）", solution: "两边取对数：π > e ln π → π/e > ln π → 1/e > ln π / π。考虑函数 f(x) = ln x / x。f'(x) = (1-ln x)/x²。x > e 时 f'(x) < 0，f 递减。因为 π > e，所以 f(π) < f(e) → ln π/π < ln e/e = 1/e。即 ln π/π < 1/e → π > e ln π → e^π > π^e。✓" },
    ],
    pitfalls: "不等式链是基础工具。证明题时先想清楚：需要放缩到什么程度？用哪个不等式最恰当？放缩过头就得不到目标不等式了。",
  },
  {
    id: "k-cross-common-mistakes",
    title: "竞赛高频易错点清单",
    category: "跨专题方法",
    scenario: "考前自查，避免常见低级错误",
    core: "高频错误：① 极限：等价无穷小在加减项中乱用 ② 积分：分部积分符号错、换元忘换限、定积分结果忘常数 C（不定积分才要）③ 级数：比值法极限为 1 就下结论 ④ 中值定理：构造完辅助函数不验证罗尔条件 ⑤ 多元积分：极坐标 dσ 少个 r，球坐标 dV 少个 r² sin φ ⑥ 微分方程：一阶线性方程公式记错（积分因子是 e^{∫Pdx} 不是 e^{-∫Pdx}）⑦ 符号错误（最常见也最可惜）。",
    examples: [
      { problem: "做完一套卷，最后 5 分钟检查什么？", solution: "① 检查符号（负号有没有丢）② 检查积分常数 C（不定积分必写）③ 检查特殊情形（代入 x=0 或 x→∞ 看答案是否合理）④ 检查量纲 ⑤ 检查题目有没有看错（是选正确的还是错误的？）⑥ 检查答题卡有没有填错位。这 6 项检查只需要 5 分钟，但能挽回很多粗心分。" },
    ],
    pitfalls: "会做但做错 = 不会做。竞赛分数差距往往不是在难题上，而是在简单题的正确率上。养成自检习惯，粗心错误减少一半，名次就能上升一大截。",
  },

];

// ============================================================
// 必背结论（60+ 条）
// ============================================================
export interface MustMemoItem {
  id: string;
  group: string;
  content: string;
  formula: string;
  hint: string;
}

export const MUST_MEMO_ITEMS: MustMemoItem[] = [
  // ---------- 常用不等式组 ----------
  { id: "m-ineq-1", group: "常用不等式", content: "sin x 与 x 的大小关系", formula: "|\\sin x| \\le |x|", hint: "等号仅当 x=0 时成立。最基本的三角不等式，直接由单位圆面积比较得证" },
  { id: "m-ineq-2", group: "常用不等式", content: "sin x < x < tan x（0<x<π/2）", formula: "\\sin x < x < \\tan x \\quad (0 < x < \\dfrac{\\pi}{2})", hint: "单位圆中比较三角形和扇形面积：S_△OAP < S_扇形OAP < S_△OAT" },
  { id: "m-ineq-3", group: "常用不等式", content: "ln(1+x) 不等式组", formula: "\\dfrac{x}{1+x} \\le \\ln(1+x) \\le x \\quad (x > -1)", hint: "左边等号仅 x=0；右边等号仅 x=0。由拉格朗日中值定理或单调性易证" },
  { id: "m-ineq-4", group: "常用不等式", content: "指数函数下界", formula: "e^x \\ge 1 + x \\quad (\\forall x \\in \\mathbb{R})", hint: "等号仅当 x=0。凸函数切线不等式。竞赛中使用频率最高的不等式之一" },
  { id: "m-ineq-5", group: "常用不等式", content: "算术-几何均值不等式（AM≥GM）", formula: "\\dfrac{a_1+a_2+\\cdots+a_n}{n} \\ge \\sqrt[n]{a_1a_2\\cdots a_n}", hint: "等号当且仅当 a₁=a₂=...=aₙ。竞赛中 n=2 最常用" },
  { id: "m-ineq-6", group: "常用不等式", content: "柯西不等式", formula: "(\\sum_{i=1}^n a_i b_i)^2 \\le (\\sum_{i=1}^n a_i^2)(\\sum_{i=1}^n b_i^2)", hint: "等号当且仅当 a_i/b_i = 常数（成比例）。向量形式：|a·b| ≤ |a||b|" },
  { id: "m-ineq-7", group: "常用不等式", content: "Young 不等式", formula: "ab \\le \\dfrac{a^p}{p} + \\dfrac{b^q}{q} \\quad (\\frac{1}{p}+\\frac{1}{q}=1, a,b,p,q>0)", hint: "p=q=2 时就是均值不等式。是 Hölder 不等式的基础" },
  { id: "m-ineq-8", group: "常用不等式", content: "Jensen 不等式（凸函数）", formula: "\\varphi\\left(\\dfrac{\\sum \\lambda_i x_i}{\\sum \\lambda_i}\\right) \\le \\dfrac{\\sum \\lambda_i \\varphi(x_i)}{\\sum \\lambda_i}", hint: "φ''>0 凸函数，加权平均的函数值 ≤ 函数值的加权平均。凹函数反向" },
  { id: "m-ineq-9", group: "常用不等式", content: "伯努利不等式", formula: "(1+x)^n \\ge 1 + nx \\quad (x > -1, n \\text{为正整数})", hint: "推广：(1+x)^α ≥ 1+αx（x>-1, α≥1 或 α≤0）；0<α<1 时反向" },
  { id: "m-ineq-10", group: "常用不等式", content: "调和平均 ≤ 几何平均 ≤ 算术平均 ≤ 平方平均", formula: "\\dfrac{n}{\\sum 1/a_i} \\le \\sqrt[n]{\\prod a_i} \\le \\dfrac{\\sum a_i}{n} \\le \\sqrt{\\dfrac{\\sum a_i^2}{n}}", hint: "全相等时等号成立。完整的均值不等式链，从左到右依次增大" },

  // ---------- 常用极限 ----------
  { id: "m-limit-1", group: "常用极限", content: "n 的 n 次方根", formula: "\\lim_{n\\to\\infty} n^{\\frac{1}{n}} = 1", hint: "用对数+洛必达：e^{ln n / n} → e⁰ = 1。n 增长慢于任何指数" },
  { id: "m-limit-2", group: "常用极限", content: "e 的定义", formula: "\\lim_{n\\to\\infty}\\left(1+\\dfrac{1}{n}\\right)^n = e", hint: "重要极限之一。(1+1/n)^n 递增趋向 e，(1+1/n)^{n+1} 递减趋向 e" },
  { id: "m-limit-3", group: "常用极限", content: "a 的 n 次方根", formula: "\\lim_{n\\to\\infty} a^{\\frac{1}{n}} = 1 \\quad (a > 0)", hint: "对任何正的常数 a，开 n 次方都趋向 1。a>1 递减趋向 1，0<a<1 递增趋向 1" },
  { id: "m-limit-4", group: "常用极限", content: "sin x / x 极限", formula: "\\lim_{x\\to 0}\\dfrac{\\sin x}{x} = 1", hint: "第一个重要极限。几何意义：小角度下弧长 ≈ 弦长" },
  { id: "m-limit-5", group: "常用极限", content: "x^x 在 0+ 的极限", formula: "\\lim_{x\\to 0^+} x^x = 1", hint: "取对数：x ln x → 0（∞·0 型，化 ∞/∞ 用洛必达）。e⁰ = 1" },
  { id: "m-limit-6", group: "常用极限", content: "阶乘与指数的增长比较", formula: "\\lim_{n\\to\\infty}\\dfrac{n!}{n^n} = 0", hint: "nⁿ 增长远快于 n!。用夹逼准则或斯特林公式可证。增长速度：n! << nⁿ" },
  { id: "m-limit-7", group: "常用极限", content: "对数函数与任何正幂次比较", formula: "\\lim_{x\\to +\\infty}\\dfrac{\\ln x}{x^\\alpha} = 0 \\quad (\\alpha > 0)", hint: "对数增长比任何正幂次都慢。洛必达一次即得：(1/x)/(αx^{α-1}) = 1/(αx^α) → 0" },
  { id: "m-limit-8", group: "常用极限", content: "指数函数增长快于任何多项式", formula: "\\lim_{x\\to +\\infty}\\dfrac{x^n}{e^{\\alpha x}} = 0 \\quad (\\alpha > 0, n > 0)", hint: "指数爆炸增长。用洛必达 n 次后分子变常数，分母还是 e^{αx}" },
  { id: "m-limit-9", group: "常用极限", content: "调和级数增长阶", formula: "H_n = 1 + \\dfrac{1}{2} + \\cdots + \\dfrac{1}{n} \\sim \\ln n + \\gamma \\quad (n\\to\\infty)", hint: "γ ≈ 0.5772 是欧拉常数。调和级数发散，但发散得很慢（对数级）" },
  { id: "m-limit-10", group: "常用极限", content: "(1+α/x)^x 极限", formula: "\\lim_{x\\to +\\infty}\\left(1+\\dfrac{\\alpha}{x}\\right)^x = e^\\alpha", hint: "1^∞ 型。令 x = α/t，变成 (1+t)^{α/t} = [(1+t)^{1/t}]^α → e^α" },

  // ---------- 常用展开 ----------
  { id: "m-series-1", group: "常用展开", content: "eˣ 的麦克劳林展开", formula: "e^x = \\sum_{n=0}^\\infty \\dfrac{x^n}{n!} = 1 + x + \\dfrac{x^2}{2!} + \\dfrac{x^3}{3!} + \\cdots", hint: "收敛域 (-∞, +∞)。最重要的展开式，其他很多都从它派生" },
  { id: "m-series-2", group: "常用展开", content: "sin x 的麦克劳林展开", formula: "\\sin x = \\sum_{n=0}^\\infty (-1)^n \\dfrac{x^{2n+1}}{(2n+1)!} = x - \\dfrac{x^3}{3!} + \\dfrac{x^5}{5!} - \\cdots", hint: "收敛域 R。奇函数，只有奇次项。记忆：正弦 = 奇次项交错" },
  { id: "m-series-3", group: "常用展开", content: "cos x 的麦克劳林展开", formula: "\\cos x = \\sum_{n=0}^\\infty (-1)^n \\dfrac{x^{2n}}{(2n)!} = 1 - \\dfrac{x^2}{2!} + \\dfrac{x^4}{4!} - \\cdots", hint: "收敛域 R。偶函数，只有偶次项。是 sin x 的导数" },
  { id: "m-series-4", group: "常用展开", content: "ln(1+x) 的麦克劳林展开", formula: "\\ln(1+x) = \\sum_{n=1}^\\infty (-1)^{n-1}\\dfrac{x^n}{n} = x - \\dfrac{x^2}{2} + \\dfrac{x^3}{3} - \\cdots", hint: "收敛域 (-1, 1]。x=1 时条件收敛，和 = ln 2。x=-1 时发散（调和级数）" },
  { id: "m-series-5", group: "常用展开", content: "arctan x 的麦克劳林展开", formula: "\\arctan x = \\sum_{n=0}^\\infty (-1)^n \\dfrac{x^{2n+1}}{2n+1} = x - \\dfrac{x^3}{3} + \\dfrac{x^5}{5} - \\cdots", hint: "收敛域 [-1, 1]。x=1 时条件收敛，和 = π/4（莱布尼茨级数）" },
  { id: "m-series-6", group: "常用展开", content: "等比级数（1/(1-x) 展开）", formula: "\\dfrac{1}{1-x} = \\sum_{n=0}^\\infty x^n = 1 + x + x^2 + x^3 + \\cdots", hint: "收敛域 |x| < 1。最基本的幂级数，许多级数通过求导/积分从它得到" },
  { id: "m-series-7", group: "常用展开", content: "二项式级数", formula: "(1+x)^\\alpha = \\sum_{n=0}^\\infty \\dbinom{\\alpha}{n}x^n \\quad (\\binom{\\alpha}{n} = \\dfrac{\\alpha(\\alpha-1)\\cdots(\\alpha-n+1)}{n!})", hint: "收敛半径 R=1。α 为正整数时退化为有限项的二项式定理" },
  { id: "m-series-8", group: "常用展开", content: "tan x 的前几项展开", formula: "\\tan x = x + \\dfrac{x^3}{3} + \\dfrac{2x^5}{15} + \\dfrac{17x^7}{315} + \\cdots", hint: "系数无简单规律（涉及伯努利数）。记住前三项够用。收敛半径 π/2" },
  { id: "m-series-9", group: "常用展开", content: "sec x 的前几项展开", formula: "\\sec x = 1 + \\dfrac{x^2}{2} + \\dfrac{5x^4}{24} + \\dfrac{61x^6}{720} + \\cdots", hint: "偶函数，只有偶次项。系数与欧拉数有关。记住前两三项" },
  { id: "m-series-10", group: "常用展开", content: "arcsin x 的展开", formula: "\\arcsin x = \\sum_{n=0}^\\infty \\dfrac{(2n)!}{4^n (n!)^2 (2n+1)} x^{2n+1}", hint: "即 Σ C(2n,n) x^{2n+1}/(4ⁿ(2n+1))。收敛域 [-1, 1]。由 1/√(1-x²) 积分得到" },

  // ---------- 积分结论 ----------
  { id: "m-int-1", group: "积分结论", content: "高斯积分（概率积分）", formula: "\\int_0^{\\infty} e^{-x^2} dx = \\dfrac{\\sqrt{\\pi}}{2}", hint: "证明：考虑二重积分转极坐标。∫_{-∞}^∞ e^{-x²} dx = √π。正态分布归一化的基础" },
  { id: "m-int-2", group: "积分结论", content: "Wallis 公式（华里士）-- 偶数", formula: "\\int_0^{\\frac{\\pi}{2}} \\sin^{2n} x dx = \\dfrac{(2n-1)!}{(2n)!} \\cdot \\dfrac{\\pi}{2}", hint: "偶数次：双阶乘比值 × π/2。记忆：偶乘 π/2" },
  { id: "m-int-3", group: "积分结论", content: "Wallis 公式（华里士）-- 奇数", formula: "\\int_0^{\\frac{\\pi}{2}} \\sin^{2n+1} x dx = \\dfrac{(2n)!}{(2n+1)!}", hint: "奇数次：双阶乘比值。没有 π/2。记忆：奇乘 1（或 奇无π）" },
  { id: "m-int-4", group: "积分结论", content: "Gamma 函数与阶乘关系", formula: "\\Gamma(n+1) = n! \\quad (n \\text{ 为正整数})", hint: "Γ(s) = ∫₀^∞ x^{s-1}e^{-x}dx。递推 Γ(s+1)=sΓ(s)。Γ(1)=1, Γ(½)=√π" },
  { id: "m-int-5", group: "积分结论", content: "Gamma(1/2) 的值", formula: "\\Gamma\\left(\\dfrac{1}{2}\\right) = \\sqrt{\\pi}", hint: "由 Γ(½) = 2∫₀^∞ e^{-t²}dt = √π。这是高斯积分与Gamma函数的桥梁" },
  { id: "m-int-6", group: "积分结论", content: "含 sin x/x 的狄利克雷积分", formula: "\\int_0^{\\infty} \\dfrac{\\sin x}{x} dx = \\dfrac{\\pi}{2}", hint: "条件收敛（绝对值积分发散）。经典结果。可用含参积分或留数计算" },
  { id: "m-int-7", group: "积分结论", content: "Beta 函数（第一类欧拉积分）", formula: "B(p,q) = \\int_0^1 x^{p-1}(1-x)^{q-1}dx = \\dfrac{\\Gamma(p)\\Gamma(q)}{\\Gamma(p+q)}", hint: "对称的 B(p,q)=B(q,p)。与 Gamma 函数的关系很有用。p,q>0 时收敛" },
  { id: "m-int-8", group: "积分结论", content: "1/(1+x²) 在全实轴的积分", formula: "\\int_{-\\infty}^{+\\infty} \\dfrac{dx}{1+x^2} = \\pi", hint: "原函数 arctan x。arctan(+∞)=π/2, arctan(-∞)=-π/2，差 = π。柯西分布的归一化" },
  { id: "m-int-9", group: "积分结论", content: "Frullani 积分公式", formula: "\\int_0^{\\infty} \\dfrac{f(ax)-f(bx)}{x} dx = [f(0)-f(\\infty)]\\ln\\dfrac{b}{a}", hint: "条件：f 连续，f(+∞) 存在。含 1/x 的差分式积分常用。证明：含参积分求导/交换积分次序" },
  { id: "m-int-10", group: "积分结论", content: "周期函数积分公式", formula: "\\int_0^{nT} f(x) dx = n \\int_0^T f(x) dx \\quad (f \\text{ 以 } T \\text{ 为周期})", hint: "一个周期上的积分值相同，n 个周期就是 n 倍。与起点无关（积分平移不变）" },

  // ---------- 特殊常数 ----------
  { id: "m-const-1", group: "特殊常数", content: "自然对数底 e", formula: "e = \\lim_{n\\to\\infty}\\left(1+\\dfrac{1}{n}\\right)^n \\approx 2.718281828459", hint: "指数函数 eˣ 的底数。唯一满足 f'(x)=f(x) 且 f(0)=1 的函数" },
  { id: "m-const-2", group: "特殊常数", content: "圆周率 π", formula: "\\pi \\approx 3.14159265359", hint: "圆周长与直径之比。莱布尼茨级数：π/4 = 1 - 1/3 + 1/5 - 1/7 + ...（收敛很慢）" },
  { id: "m-const-3", group: "特殊常数", content: "欧拉常数 γ", formula: "\\gamma = \\lim_{n\\to\\infty}\\left(H_n - \\ln n\\right) \\approx 0.5772156649", hint: "调和级数与对数函数之差的极限。是否为无理数至今未证明。竞赛中常用近似值" },
  { id: "m-const-4", group: "特殊常数", content: "ln 2 的级数表示", formula: "\\ln 2 = \\sum_{n=1}^\\infty \\dfrac{(-1)^{n-1}}{n} = 1 - \\dfrac{1}{2} + \\dfrac{1}{3} - \\dfrac{1}{4} + \\cdots", hint: "ln(1+x) 在 x=1 处的值。条件收敛。用阿贝尔求和定理验证端点收敛" },
  { id: "m-const-5", group: "特殊常数", content: "黄金分割比 φ", formula: "\\varphi = \\dfrac{1+\\sqrt{5}}{2} \\approx 1.6180339887", hint: "满足 φ = 1 + 1/φ，φ² = φ + 1。斐波那契数列相邻两项比值的极限" },
  { id: "m-const-6", group: "特殊常数", content: "巴塞尔问题（倒数平方和）", formula: "\\sum_{n=1}^\\infty \\dfrac{1}{n^2} = \\dfrac{\\pi^2}{6}", hint: "欧拉成名之作。p=2 的 p-级数和。类似地，Σ1/n⁴ = π⁴/90, Σ1/n⁶ = π⁶/945" },
  { id: "m-const-7", group: "特殊常数", content: "交错 p=2 级数", formula: "\\sum_{n=1}^\\infty \\dfrac{(-1)^{n-1}}{n^2} = \\dfrac{\\pi^2}{12}", hint: "Σ(-1)^{n-1}/n² = Σ1/n² - 2·Σ1/(2n)² = π²/6 - 2·π²/24 = π²/6 - π²/12 = π²/12" },
  { id: "m-const-8", group: "特殊常数", content: "卡塔兰常数 G", formula: "G = \\sum_{n=0}^\\infty \\dfrac{(-1)^n}{(2n+1)^2} \\approx 0.915965594", hint: "与 β 函数相关。出现于某些含 arctan 或 1/(1+x²) 的积分。了解即可" },
  { id: "m-const-9", group: "特殊常数", content: "e^π 与 π^e 的大小", formula: "e^\\pi > \\pi^e \\quad (e^\\pi \\approx 23.14, \\pi^e \\approx 22.46)", hint: "证明：考虑 f(x)=ln x/x 在 x=e 处取最大值。f(e) > f(π) → 1/e > ln π/π → π > e ln π → e^π > π^e" },
  { id: "m-const-10", group: "特殊常数", content: "Γ(n+1/2) 的值（半整数阶 Gamma）", formula: "\\Gamma\\left(n + \\dfrac{1}{2}\\right) = \\dfrac{(2n)!}{4^n n!}\\sqrt{\\pi}", hint: "推导：Γ(n+½) = (n-½)(n-³/₂)...½ Γ(½) = (2n-1)!/2ⁿ · √π = (2n)!/(4ⁿn!) · √π。高斯积分与整数阶Gamma的中介" },

  // ---------- 导数/积分速记 ----------
  { id: "m-calc-1", group: "导数积分速记", content: "tan x 的导数", formula: "\\dfrac{d}{dx}\\tan x = \\sec^2 x = 1 + \\tan^2 x", hint: "由 tan = sin/cos 用商的导数法则推导。sec² = 1+tan² 是常用恒等式" },
  { id: "m-calc-2", group: "导数积分速记", content: "sec x 的导数", formula: "\\dfrac{d}{dx}\\sec x = \\sec x \\tan x", hint: "记忆：正割导 = 正割×正切。同理 csc x 导数 = -csc x cot x" },
  { id: "m-calc-3", group: "导数积分速记", content: "arcsin x 的导数", formula: "\\dfrac{d}{dx}\\arcsin x = \\dfrac{1}{\\sqrt{1-x^2}}", hint: "反三角导数中最常用。arccos x 导数 = -1/√(1-x²)（仅差负号）" },
  { id: "m-calc-4", group: "导数积分速记", content: "arctan x 的导数", formula: "\\dfrac{d}{dx}\\arctan x = \\dfrac{1}{1+x^2}", hint: "配合 ∫1/(1+x²)dx = arctan x + C 记忆。常用的积分结果" },
  { id: "m-calc-5", group: "导数积分速记", content: "∫ tan x dx", formula: "\\int \\tan x \, dx = -\\ln|\\cos x| + C", hint: "令 u = cos x，du = -sin x dx，则 -∫ du/u = -ln|cos x|。同理 ∫cot x dx = ln|sin x| + C" },
  { id: "m-calc-6", group: "导数积分速记", content: "∫ sec x dx", formula: "\\int \\sec x \, dx = \\ln|\\sec x + \\tan x| + C", hint: "经典技巧：分子分母同乘 (sec x + tan x)，凑 d(sec x + tan x) = sec x (sec x + tan x)" },
  { id: "m-calc-7", group: "导数积分速记", content: "∫ 1/(a²+x²) dx", formula: "\\int \\dfrac{dx}{a^2+x^2} = \\dfrac{1}{a}\\arctan\\dfrac{x}{a} + C", hint: "arctan 积分的一般形式。a=1 时退化为 ∫1/(1+x²)dx = arctan x" },
  { id: "m-calc-8", group: "导数积分速记", content: "∫ 1/√(a²-x²) dx", formula: "\\int \\dfrac{dx}{\\sqrt{a^2-x^2}} = \\arcsin\\dfrac{x}{a} + C", hint: "arcsin 积分的一般形式。结果没有 1/a 系数（注意与上式对比）" },
  { id: "m-calc-9", group: "导数积分速记", content: "∫ 1/√(x²±a²) dx", formula: "\\int \\dfrac{dx}{\\sqrt{x^2\\pm a^2}} = \\ln\\left|x + \\sqrt{x^2\\pm a^2}\\right| + C", hint: "经典结果。令 x = a tan t（+号）或 x = a sec t（-号）可证。结果为 ln 形式" },
  { id: "m-calc-10", group: "导数积分速记", content: "莱布尼茨公式（乘积的 n 阶导）", formula: "(uv)^{(n)} = \\sum_{k=0}^n \\dbinom{n}{k} u^{(k)} v^{(n-k)}", hint: "与二项式定理形式一致。高阶导数的乘积法则。竞赛中求 n 阶导数常用" },

  // ---------- 级数快速结论 ----------
  { id: "m-series-extra-1", group: "级数结论", content: "p-级数敛散性", formula: "\\sum_{n=1}^\\infty \\dfrac{1}{n^p} \\begin{cases} \\text{收敛}, & p > 1 \\\\ \\text{发散}, & p \\le 1 \\end{cases}", hint: "最基本的比较标准。p=1 是调和级数，发散。p=2 收敛到 π²/6" },
  { id: "m-series-extra-2", group: "级数结论", content: "交错 p-级数", formula: "\\sum_{n=1}^\\infty \\dfrac{(-1)^{n-1}}{n^p} \\begin{cases} \\text{绝对收敛}, & p > 1 \\\\ \\text{条件收敛}, & 0 < p \\le 1 \\\\ \\text{发散}, & p \\le 0 \\end{cases}", hint: "p=1 时条件收敛（莱布尼茨级数）。p≤0 通项不趋向 0，直接发散" },
  { id: "m-series-extra-3", group: "级数结论", content: "几何级数和", formula: "\\sum_{n=0}^\\infty ar^n = \\dfrac{a}{1-r} \\quad (|r| < 1)", hint: "等比级数。|r| ≥ 1 发散（r=1 且 a≠0 时显然发散）。基础中的基础" },
];
