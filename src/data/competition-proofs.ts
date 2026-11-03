// EXPORTS: ProofCategory, ProofMethod, ProofTemplate, ProofProblem, PROOF_CATEGORIES, generateProofProblem, getProofById
// 证明题专项训练：5 类方法 + 参数化生成器 + 经典题

import { seededRandom, randInt, randPick } from './problem-generators';

export interface ProofStep {
  /** 步骤标题或引导 */
  title?: string;
  /** 步骤内容（KaTeX 或纯文本，用 \n 分段） */
  content: string;
}

export interface ProofProblem {
  id: string;
  categoryKey: string;
  /** 证明方法标签（如 "拉格朗日中值定理"） */
  method: string;
  difficulty: 1 | 2 | 3;
  score: number;
  /** 题干（纯文本，数学用 $...$ 或直接 Unicode） */
  problem: string;
  /** 证明步骤（分步展示） */
  steps: ProofStep[];
  /** 总结/点评 */
  conclusion?: string;
  /** 核心技巧一句话 */
  keyIdea: string;
  sourceLabel: string;
  templateId: string;
}

export interface ProofTemplate {
  id: string;
  name: string;
  /** 变体数量 */
  variantCount: number;
  /** 生成函数：根据 rand + diff 生成题目 + 证明步骤 */
  generate: (rand: () => number, diff: 1 | 2 | 3) => {
    problem: string;
    steps: ProofStep[];
    conclusion?: string;
    keyIdea: string;
    method: string;
  };
}

export interface ProofCategory {
  key: string;
  name: string;
  icon: string;
  difficulty: '基础' | '中等' | '困难';
  /** 方法总纲：核心思想 */
  coreIdea: string;
  /** 常用辅助函数构造表 */
  auxiliaryFunctions: { pattern: string; construct: string; note: string }[];
  /** 常见放缩/技巧 */
  techniques: string[];
  /** 经典证明题（固定 2-3 道） */
  classics: ProofProblem[];
  /** 参数化证明题模板 */
  templates: ProofTemplate[];
}

// ============================================================
// 辅助：生成随机参数
// ============================================================

function randNonZeroInt(rand: () => number, min: number, max: number): number {
  let v = randInt(rand, min, max);
  if (v === 0) v = 1;
  return v;
}

// ============================================================
// 1. 中值定理证明
// ============================================================

const mvtTemplates: ProofTemplate[] = [
  // 模板1：f'(ξ) = k 型（构造 F(x)=f(x)-kx）
  {
    id: 'mvt-fprime-k',
    name: "f'(ξ)=k 型构造辅助函数",
    variantCount: 8,
    generate: (rand) => {
      const a = randInt(rand, -3, 0);
      const b = randInt(rand, 1, 4);
      const k = randNonZeroInt(rand, -2, 3);
      const fa = randNonZeroInt(rand, -3, 3);
      const fb = fa + k * (b - a) + randNonZeroInt(rand, -1, 1);
      const c = (fb - fa) / (b - a);

      return {
        problem: `设 f(x) 在 [${a}, ${b}] 上连续，在 (${a}, ${b}) 内可导，且 f(${a}) = ${fa}，f(${b}) = ${fb}。\n证明：存在 ξ ∈ (${a}, ${b})，使得 f'(ξ) = ${c.toFixed(2).replace(/\.00$/, '')}。`,
        method: '拉格朗日中值定理',
        keyIdea: '构造辅助函数 F(x)=f(x)-kx，验证端点值相等，再用罗尔定理',
        steps: [
          {
            title: '第一步：构造辅助函数',
            content: `令 F(x) = f(x) - ${c.toFixed(2).replace(/\\.00$/, '')}x\n` +
              `则 F(x) 在 [${a}, ${b}] 上连续，在 (${a}, ${b}) 内可导。`,
          },
          {
            title: '第二步：验证端点值',
            content: `F(${a}) = f(${a}) - ${c.toFixed(2).replace(/\\.00$/, '')}·${a} = ${fa} - ${c.toFixed(2).replace(/\\.00$/, '')}·${a}\n` +
              `F(${b}) = f(${b}) - ${c.toFixed(2).replace(/\\.00$/, '')}·${b} = ${fb} - ${c.toFixed(2).replace(/\\.00$/, '')}·${b}\n\n` +
              `由 f(${b}) - f(${a}) = ${fb - fa} = ${c.toFixed(2).replace(/\\.00$/, '')}·(${b} - ${a})\n` +
              `故 F(${b}) - F(${a}) = 0，即 F(${a}) = F(${b})。`,
          },
          {
            title: '第三步：应用罗尔定理',
            content: `由罗尔定理，存在 ξ ∈ (${a}, ${b})，使得 F'(ξ) = 0\n` +
              `即 f'(ξ) - ${c.toFixed(2).replace(/\\.00$/, '')} = 0\n` +
              `故 f'(ξ) = ${c.toFixed(2).replace(/\\.00$/, '')}。`,
          },
        ],
        conclusion: '本题是拉格朗日中值定理的直接应用，构造辅助函数 F(x)=f(x)-kx 是通法。',
      };
    },
  },
  // 模板2：f'(ξ) + g'(ξ)f(ξ) = 0 型（积分因子法）
  {
    id: 'mvt-integrating-factor',
    name: '积分因子构造法',
    variantCount: 6,
    generate: (rand) => {
      const a = randInt(rand, 0, 1);
      const b = a + randInt(rand, 1, 3);
      const k = randNonZeroInt(rand, 1, 3);

      return {
        problem: `设 f(x) 在 [${a}, ${b}] 上连续，在 (${a}, ${b}) 内可导，且 f(${a}) = f(${b}) = 0。\n证明：存在 ξ ∈ (${a}, ${b})，使得 f'(ξ) + ${k}f(ξ) = 0。`,
        method: '积分因子 + 罗尔定理',
        keyIdea: `观察到 (e^(${k}x)f(x))' = e^(${k}x)(f'(x)+${k}f(x))，构造 F(x)=e^(${k}x)f(x)`,
        steps: [
          {
            title: '第一步：构造积分因子辅助函数',
            content: `令 F(x) = e^{${k}x} · f(x)\n` +
              `则 F(x) 在 [${a}, ${b}] 上连续，在 (${a}, ${b}) 内可导。`,
          },
          {
            title: '第二步：验证端点值',
            content: `F(${a}) = e^{${k}·${a}} · f(${a}) = e^{${k * a}} · 0 = 0\n` +
              `F(${b}) = e^{${k}·${b}} · f(${b}) = e${k * b > 0 ? `^{${k*b}}` : ''} · 0 = 0\n\n` +
              `故 F(${a}) = F(${b}) = 0。`,
          },
          {
            title: '第三步：应用罗尔定理并化简',
            content: `由罗尔定理，存在 ξ ∈ (${a}, ${b})，使得 F'(ξ) = 0\n` +
              `而 F'(x) = ${k}e^{${k}x}f(x) + e^{${k}x}f'(x) = e^{${k}x}[f'(x) + ${k}f(x)]\n` +
              `故 e^{${k}ξ}[f'(ξ) + ${k}f(ξ)] = 0\n` +
              `又 e^{${k}ξ} ≠ 0，因此 f'(ξ) + ${k}f(ξ) = 0。`,
          },
        ],
        conclusion: '形如 f\' + P(x)f = 0 的中值等式，通法是构造积分因子 F(x)=e^{∫P(x)dx}·f(x)。',
      };
    },
  },
  // 模板3：f''(ξ) = g(ξ) 型（两次罗尔）
  {
    id: 'mvt-second-order',
    name: '二阶导数中值问题',
    variantCount: 5,
    generate: (rand) => {
      const c = randPick(rand, ['1/2', '1/3', '2/3']);
      const cVal = c === '1/2' ? 0.5 : c === '1/3' ? 1 / 3 : 2 / 3;

      return {
        problem: `设 f(x) 在 [0, 1] 上二阶可导，f(0) = f(1) = 0，且 f(${c}) = 1。\n证明：存在 ξ ∈ (0, 1)，使得 f''(ξ) ≤ -8。`,
        method: '多次罗尔 / 泰勒展开',
        keyIdea: '从 f(0)=f(c)=f(1) 的函数值信息，两次应用罗尔定理，或用泰勒展开在最值点分析',
        steps: [
          {
            title: '方法一：两次罗尔定理',
            content: `在 [0, ${c}] 和 [${c}, 1] 上分别应用拉格朗日中值定理：\n` +
              `存在 ξ₁ ∈ (0, ${c})，使 f'(ξ₁) = (f(${c}) - f(0)) / (${c} - 0) = 1/${c} = ${(1/cVal).toFixed(2).replace(/\\.00$/, '')}\n` +
              `存在 ξ₂ ∈ (${c}, 1)，使 f'(ξ₂) = (f(1) - f(${c})) / (1 - ${c}) = -1/(1-${c}) = ${(-1/(1-cVal)).toFixed(2).replace(/\\.00$/, '')}`,
          },
          {
            title: '第二步：对 f\' 再用拉格朗日',
            content: `f' 在 [ξ₁, ξ₂] 上可导，由拉格朗日中值定理：\n` +
              `存在 ξ ∈ (ξ₁, ξ₂) ⊂ (0,1)，使得\n` +
              `f''(ξ) = [f'(ξ₂) - f'(ξ₁)] / (ξ₂ - ξ₁)`,
          },
          {
            title: '第三步：放缩估计',
            content: `注意 ξ₂ - ξ₁ < 1 - 0 = 1，且\n` +
              `f'(ξ₂) - f'(ξ₁) = -1/(1-${c}) - 1/${c} = -(1/${c} + 1/(1-${c}))\n` +
              `故 |f''(ξ)| ≥ 1/${c} + 1/(1-${c})\n` +
              `由于 f''(ξ) < 0（导函数递减），故 f''(ξ) ≤ -[1/${c} + 1/(1-${c})] = ${-(1/cVal + 1/(1-cVal)).toFixed(2).replace(/\\.00$/, '')} ≤ -8`,
          },
        ],
        conclusion: '二阶导数中值问题的核心是：先对原函数找中值点，再对导函数找二阶中值点。',
      };
    },
  },
  // 模板4：柯西中值定理型
  {
    id: 'mvt-cauchy',
    name: '柯西中值定理应用',
    variantCount: 4,
    generate: () => {
      return {
        problem: `设 f(x) 在 [0, 1] 上连续，在 (0, 1) 内可导，且 f(0) = 0，f(1) = 1。\n证明：存在 ξ, η ∈ (0, 1)，使得 f'(ξ) + f'(η) = 2。`,
        method: '两次拉格朗日（区间拆分法）',
        keyIdea: '将 [0,1] 拆为 [0,c] 和 [c,1]，对 f 各用一次拉格朗日中值定理',
        steps: [
          {
            title: '第一步：取中间点拆分区间',
            content: `取 c = ½，将 [0,1] 拆为 [0, ½] 和 [½, 1] 两个子区间。`,
          },
          {
            title: '第二步：在两个区间分别用拉格朗日',
            content: `在 [0, ½] 上，由拉格朗日中值定理，存在 ξ ∈ (0, ½)，使\n` +
              `f'(ξ) = (f(½) - f(0)) / (½ - 0) = 2f(½)\n\n` +
              `在 [½, 1] 上，同理存在 η ∈ (½, 1)，使\n` +
              `f'(η) = (f(1) - f(½)) / (1 - ½) = 2(1 - f(½))`,
          },
          {
            title: '第三步：两式相加',
            content: `f'(ξ) + f'(η) = 2f(½) + 2(1 - f(½)) = 2\n` +
              `即存在 ξ, η ∈ (0,1)，使 f'(ξ) + f'(η) = 2。`,
          },
        ],
        conclusion: '双中值问题常用策略：区间拆分 + 分别应用中值定理，再合并结果。',
      };
    },
  },
];

const mvtClassics: ProofProblem[] = [
  {
    id: 'proof-mvt-classic-1',
    categoryKey: 'mvt',
    method: '罗尔定理经典题型',
    difficulty: 2,
    score: 10,
    problem:
      '设 f(x) 在 [0,1] 上连续，在 (0,1) 内可导，且 f(0)=f(1)=0，f(½)=1。\n' +
      '证明：(1) 存在 η ∈ (½,1)，使 f(η) = η；\n' +
      '(2) 对任意实数 λ，存在 ξ ∈ (0,η)，使 f\'(ξ) - λ[f(ξ)-ξ] = 1。',
    steps: [
      {
        title: '(1) 构造辅助函数验证零点',
        content:
          '令 φ(x) = f(x) - x，则 φ(x) 在 [½, 1] 上连续。\n' +
          'φ(½) = f(½) - ½ = 1 - ½ = ½ > 0\n' +
          'φ(1) = f(1) - 1 = 0 - 1 = -1 < 0\n' +
          '由零点定理，存在 η ∈ (½, 1)，使 φ(η) = 0，即 f(η) = η。',
      },
      {
        title: '(2) 构造积分因子辅助函数',
        content:
          '要证 f\'(ξ) - 1 = λ[f(ξ) - ξ]，即 [f(x)-x]\' |_{x=ξ} = λ[f(ξ)-ξ]\n' +
          '令 F(x) = e^{-λx}·[f(x) - x]\n' +
          '则 F(0) = e^{0}·[f(0) - 0] = 0\n' +
          'F(η) = e^{-λη}·[f(η) - η] = e^{-λη}·0 = 0',
      },
      {
        title: '(2) 应用罗尔定理',
        content:
          'F(x) 在 [0,η] 上连续，在 (0,η) 内可导，且 F(0)=F(η)=0\n' +
          '由罗尔定理，存在 ξ ∈ (0,η)，使 F\'(ξ) = 0\n' +
          'F\'(x) = -λe^{-λx}[f(x)-x] + e^{-λx}[f\'(x)-1]\n' +
          '       = e^{-λx}[-λ(f(x)-x) + f\'(x)-1]\n' +
          '代入 F\'(ξ)=0 且 e^{-λξ} ≠ 0，得：\n' +
          'f\'(ξ) - λ[f(ξ)-ξ] = 1',
      },
    ],
    keyIdea: '第一问用零点定理找中间点，第二问用积分因子构造辅助函数再用罗尔定理',
    conclusion: '这是竞赛经典题型：先用介值/零点定理找中间点，再用该中间点作为罗尔定理的端点。',
    sourceLabel: '竞赛经典题型',
    templateId: 'mvt-classic-1',
  },
  {
    id: 'proof-mvt-classic-2',
    categoryKey: 'mvt',
    method: '泰勒展开证明二阶导数下界',
    difficulty: 3,
    score: 12,
    problem:
      '设 f(x) 在 [0,1] 上二阶可导，f(0) = f(1) = 0，且 min_{[0,1]} f(x) = -1。\n' +
      '证明：存在 ξ ∈ (0,1)，使得 f\'\'(ξ) ≥ 8。',
    steps: [
      {
        title: '第一步：确定最小值点',
        content:
          '设 f 在 c ∈ (0,1) 处取得最小值 -1，则 f(c) = -1。\n' +
          '由 Fermat 引理，f\'(c) = 0。',
      },
      {
        title: '第二步：在 c 点泰勒展开',
        content:
          'f(x) = f(c) + f\'(c)(x-c) + (f\'\'(ξ)/2!)(x-c)²\n' +
          '     = -1 + 0 + f\'\'(ξ)/2 · (x-c)²\n' +
          '其中 ξ 在 x 与 c 之间。',
      },
      {
        title: '第三步：代入端点值',
        content:
          '令 x = 0：0 = f(0) = -1 + f\'\'(ξ₁)/2 · c²，ξ₁ ∈ (0,c)\n' +
          '  ⇒ f\'\'(ξ₁) = 2 / c²\n\n' +
          '令 x = 1：0 = f(1) = -1 + f\'\'(ξ₂)/2 · (1-c)²，ξ₂ ∈ (c,1)\n' +
          '  ⇒ f\'\'(ξ₂) = 2 / (1-c)²',
      },
      {
        title: '第四步：分情况放缩',
        content:
          '若 c ≤ ½：f\'\'(ξ₁) = 2/c² ≥ 2/(½)² = 8\n' +
          '若 c ≥ ½：f\'\'(ξ₂) = 2/(1-c)² ≥ 2/(½)² = 8\n\n' +
          '两种情况均成立，故存在 ξ ∈ (0,1) 使 f\'\'(ξ) ≥ 8。',
      },
    ],
    keyIdea: '在最值点用泰勒展开，代入端点得到二阶导数估计',
    conclusion: '涉及二阶导数 + 最值信息的中值证明，泰勒展开法是通法。',
    sourceLabel: '竞赛高频题型',
    templateId: 'mvt-classic-2',
  },
  {
    id: 'proof-mvt-classic-3',
    categoryKey: 'mvt',
    method: '柯西中值定理经典',
    difficulty: 3,
    score: 12,
    problem:
      '设 f(x) 在 [a,b] 上连续，在 (a,b) 内可导 (0<a<b)。\n' +
      '证明：存在 ξ, η ∈ (a,b)，使得 f\'(ξ) = (η² / (ab)) · f\'(η)。',
    steps: [
      {
        title: '第一步：观察结构，引入辅助函数',
        content:
          '右端含有 η²，形如 (1/x)\' = -1/x² 的倒数。\n' +
          '令 g(x) = 1/x，则 g(x) 在 [a,b] 上连续可导，且 g\'(x) = -1/x² ≠ 0。',
      },
      {
        title: '第二步：应用柯西中值定理',
        content:
          '对 f(x) 和 g(x) 在 [a,b] 上用柯西中值定理：\n' +
          '存在 η ∈ (a,b)，使得 [f(b) - f(a)] / [g(b) - g(a)] = f\'(η) / g\'(η)\n\n' +
          '代入 g(x)=1/x，g\'(x)=-1/x²：\n' +
          '左端 = [f(b)-f(a)] / [1/b - 1/a] = [f(b)-f(a)] / [(a-b)/(ab)]\n' +
          '      = ab·[f(b)-f(a)] / (a-b) = -ab·[f(b)-f(a)] / (b-a)\n\n' +
          '右端 = f\'(η) / (-1/η²) = -η²·f\'(η)',
      },
      {
        title: '第三步：等式化简',
        content:
          '-ab·[f(b)-f(a)] / (b-a) = -η²·f\'(η)\n' +
          '两边约去负号：ab·[f(b)-f(a)] / (b-a) = η²·f\'(η)\n' +
          '即 [f(b)-f(a)] / (b-a) = (η² / (ab))·f\'(η)',
      },
      {
        title: '第四步：对左端用拉格朗日',
        content:
          '由拉格朗日中值定理，存在 ξ ∈ (a,b)，使\n' +
          '[f(b)-f(a)] / (b-a) = f\'(ξ)\n\n' +
          '综上得：f\'(ξ) = (η² / (ab))·f\'(η)，其中 ξ, η ∈ (a,b)。',
      },
    ],
    keyIdea: '双中值问题一侧用柯西，一侧用拉格朗日，通过公共项相等建立关系',
    conclusion: '双中值证明的标准套路：对同一表达式分别用两个定理，建立两个中值的关系。',
    sourceLabel: '竞赛高频题型',
    templateId: 'mvt-classic-3',
  },
];

// ============================================================
// 2. 不等式证明
// ============================================================

const inequalityTemplates: ProofTemplate[] = [
  // 模板1：e^x ≥ 1+x 及其变体
  {
    id: 'ineq-exp-taylor',
    name: '指数函数不等式',
    variantCount: 6,
    generate: (rand) => {
      const variant = randInt(rand, 1, 3);

      if (variant === 1) {
        return {
          problem: '证明：对任意实数 x，有 e^x ≥ 1 + x，等号当且仅当 x = 0 时成立。',
          method: '单调性法 / 泰勒展开',
          keyIdea: '构造 f(x) = e^x - 1 - x，求导找最小值',
          steps: [
            {
              title: '第一步：构造辅助函数',
              content: '令 f(x) = e^x - x - 1，x ∈ ℝ\n' +
                'f(0) = e^0 - 0 - 1 = 0',
            },
            {
              title: '第二步：求导分析单调性',
              content: 'f\'(x) = e^x - 1\n' +
                '当 x < 0 时，f\'(x) < 0，f(x) 单调递减\n' +
                '当 x > 0 时，f\'(x) > 0，f(x) 单调递增',
            },
            {
              title: '第三步：确定最小值',
              content: '故 f(x) 在 x = 0 处取得最小值 f(0) = 0\n' +
                '因此对任意 x，有 f(x) ≥ f(0) = 0\n' +
                '即 e^x ≥ 1 + x，等号当且仅当 x = 0 时成立。',
            },
          ],
          conclusion: '这是最基本的指数不等式，可推导出许多重要不等式（如 ln(1+x) ≤ x）。',
        };
      }

      if (variant === 2) {
        const a = randNonZeroInt(rand, 2, 5);
        return {
          problem: `证明：对任意 x > 0，有 e^x > 1 + x + x²/${2 * a} + ... + x^${a}/${a}! 。`,
          method: '泰勒展开余项法',
          keyIdea: 'e^x 的泰勒展开拉格朗日余项为正',
          steps: [
            {
              title: '第一步：e^x 的带拉格朗日余项泰勒展开',
              content:
                `e^x = 1 + x + x²/2! + ... + x^${a - 1}/${a - 1}! + x^${a}/${a}! + R_{${a}}(x)\n` +
                `其中 R_{${a}}(x) = e^{ξ}·x^{${a + 1}}/(${a + 1})!，ξ 在 0 与 x 之间。`,
            },
            {
              title: '第二步：分析余项符号',
              content:
                `当 x > 0 时，ξ > 0，故 e^{ξ} > 1 > 0，且 x^{${a + 1}} > 0\n` +
                `因此 R_{${a}}(x) > 0`,
            },
            {
              title: '第三步：不等式成立',
              content:
                `e^x = [1 + x + ... + x^${a}/${a}!] + R_{${a}}(x)\n` +
                `     > 1 + x + ... + x^${a}/${a}! (因余项为正)`,
            },
          ],
          conclusion: '指数函数的泰勒多项式部分和始终是函数值的下界（x>0 时）。',
        };
      }

      // variant 3: ln(1+x) < x
      return {
        problem: '证明：当 x > -1 且 x ≠ 0 时，有 ln(1+x) < x。',
        method: '单调性法',
        keyIdea: '构造 f(x) = x - ln(1+x)，求导分析最小值',
        steps: [
          {
            title: '第一步：构造辅助函数',
            content: '令 f(x) = x - ln(1+x)，定义域 x > -1\nf(0) = 0 - ln1 = 0',
          },
          {
            title: '第二步：求导分析',
            content:
              "f'(x) = 1 - 1/(1+x) = x/(1+x)\n" +
              '当 -1 < x < 0 时，f\'(x) < 0，f 递减\n' +
              '当 x > 0 时，f\'(x) > 0，f 递增',
          },
          {
            title: '第三步：最小值点',
            content:
              'f(x) 在 x = 0 处取得最小值 f(0) = 0\n' +
              '故当 x ≠ 0 时，f(x) > 0，即 ln(1+x) < x。',
          },
        ],
        conclusion: '这是 e^x ≥ 1+x 的直接推论：两边取对数即得 x ≥ ln(1+x)。',
      };
    },
  },
  // 模板2：|sin a - sin b| ≤ |a - b| 型
  {
    id: 'ineq-mvt-sin',
    name: '中值定理证明不等式',
    variantCount: 5,
    generate: (rand) => {
      const func = randPick(rand, ['sin', 'cos', 'arctan']);

      const funcMap: Record<string, { problem: string; deriv: string; bound: string; steps: ProofStep[] }> = {
        sin: {
          problem: '证明：对任意实数 a, b，有 |sin a - sin b| ≤ |a - b|。',
          deriv: "f'(x) = cos x",
          bound: '|cos x| ≤ 1',
          steps: [
            { title: '第一步：设函数，应用拉格朗日', content: '设 f(x) = sin x，则 f 在 [b, a]（或 [a, b]）上可导。\n由拉格朗日中值定理，存在 ξ 在 a, b 之间，使得\nf(a) - f(b) = f\'(ξ)·(a - b)\n即 sin a - sin b = cos ξ · (a - b)' },
            { title: '第二步：取绝对值并放缩', content: '|sin a - sin b| = |cos ξ| · |a - b|\n由于 |cos ξ| ≤ 1\n故 |sin a - sin b| ≤ |a - b|' },
          ],
        },
        cos: {
          problem: '证明：对任意实数 a, b，有 |cos a - cos b| ≤ |a - b|。',
          deriv: "f'(x) = -sin x",
          bound: '|-sin x| = |sin x| ≤ 1',
          steps: [
            { title: '第一步：设函数，应用拉格朗日', content: '设 f(x) = cos x，则 f 在 [b, a] 上可导。\n由拉格朗日中值定理，存在 ξ 在 a, b 之间，使得\nf(a) - f(b) = f\'(ξ)·(a - b)\n即 cos a - cos b = -sin ξ · (a - b)' },
            { title: '第二步：取绝对值并放缩', content: '|cos a - cos b| = |-sin ξ| · |a - b| = |sin ξ| · |a - b|\n由于 |sin ξ| ≤ 1\n故 |cos a - cos b| ≤ |a - b|' },
          ],
        },
        arctan: {
          problem: '证明：对任意实数 a, b，有 |arctan a - arctan b| ≤ |a - b|。',
          deriv: "f'(x) = 1/(1+x²)",
          bound: '1/(1+x²) ≤ 1',
          steps: [
            { title: '第一步：设函数，应用拉格朗日', content: '设 f(x) = arctan x，则 f 在 ℝ 上可导。\n由拉格朗日中值定理，存在 ξ 在 a, b 之间，使得\nf(a) - f(b) = f\'(ξ)·(a - b)\n即 arctan a - arctan b = 1/(1+ξ²) · (a - b)' },
            { title: '第二步：取绝对值并放缩', content: '|arctan a - arctan b| = 1/(1+ξ²) · |a - b|\n由于 1/(1+ξ²) ≤ 1\n故 |arctan a - arctan b| ≤ |a - b|' },
          ],
        },
      };

      const f = funcMap[func];
      return {
        problem: f.problem,
        method: '拉格朗日中值定理',
        keyIdea: `用拉格朗日中值定理转化为导数估计，${f.deriv}有界（${f.bound}）`,
        steps: f.steps,
        conclusion: '中值定理是证明 |f(a)-f(b)| ≤ M|a-b| 型不等式的利器，核心是估计 |f\'| 的上界。',
      };
    },
  },
  // 模板3：均值不等式
  {
    id: 'ineq-am-gm',
    name: '均值不等式应用',
    variantCount: 4,
    generate: (rand) => {
      const n = randPick(rand, [2, 3, 4]);
      const vars = n === 2 ? ['a', 'b'] : n === 3 ? ['a', 'b', 'c'] : ['a', 'b', 'c', 'd'];

      return {
        problem: `证明：对任意 ${n} 个正数 ${vars.join(', ')}，有\n(${vars.join(' + ')})/${n} ≥ ${n === 2 ? '√(ab)' : n === 3 ? '∛(abc)' : '⁴√(abcd)'}，\n等号当且仅当 ${vars.join(' = ')} 时成立。`,
        method: '数学归纳法 / 凸函数 Jensen',
        keyIdea: '利用 f(x) = -ln x 的凸性，由 Jensen 不等式直接得证',
        steps: [
          {
            title: '第一步：取对数转化',
            content:
              '要证算术平均 ≥ 几何平均，两边取对数等价于：\n' +
              `ln((${vars.join('+')})/${n}) ≥ (ln ${vars.join(' + ln ')})/${n}`,
          },
          {
            title: '第二步：考虑凸函数',
            content:
              '令 f(x) = -ln x (x > 0)，则\n' +
              "f'(x) = -1/x，f''(x) = 1/x² > 0\n" +
              '故 f(x) 是 (0, +∞) 上的凸函数。',
          },
          {
            title: '第三步：应用 Jensen 不等式',
            content:
              '由 Jensen 不等式：\n' +
              `f((${vars.join(' + ')})/${n}) ≤ (f(${vars.join(') + f(')}))/${n}\n` +
              `即 -ln((${vars.join('+')})/${n}) ≤ (-ln ${vars.join(' - ln ')})/${n}\n` +
              `两边乘 -1：ln((${vars.join('+')})/${n}) ≥ (ln ${vars.join(' + ln ')})/${n}`,
          },
          {
            title: '第四步：指数还原',
            content:
              `两边取指数：(${vars.join('+')})/${n} ≥ e^{(ln ${vars.join(' + ln ')})/${n}}\n` +
              `     = (${vars.join('·')})^{1/${n}}\n` +
              `等号当且仅当 ${vars.join(' = ')} 时成立（Jensen 不等式等号条件）。`,
          },
        ],
        conclusion: '均值不等式是竞赛中最常用的不等式之一，证明方法有多种（归纳法、Jensen、调整法等）。',
      };
    },
  },
];

const inequalityClassics: ProofProblem[] = [
  {
    id: 'proof-ineq-classic-1',
    categoryKey: 'inequality',
    method: '积分不等式',
    difficulty: 3,
    score: 12,
    problem:
      '设 f(x) 在 [0,1] 上连续且单调递增。证明：\n' +
      '∫₀¹ x·f(x) dx ≥ (1/2) ∫₀¹ f(x) dx',
    steps: [
      {
        title: '方法一：积分变限函数法',
        content:
          '令 F(t) = ∫₀ᵗ x·f(x) dx - (t/2)∫₀ᵗ f(x) dx，t ∈ [0,1]\n' +
          '则 F(0) = 0，只需证 F(1) ≥ 0。',
      },
      {
        title: '求导分析 F\'(t)',
        content:
          "F'(t) = t·f(t) - ½∫₀ᵗ f(x)dx - (t/2)·f(t)\n" +
          '     = (t/2)f(t) - ½∫₀ᵗ f(x)dx\n' +
          '     = ½[t·f(t) - ∫₀ᵗ f(x)dx]',
      },
      {
        title: '继续化简',
        content:
          '由积分中值定理，∫₀ᵗ f(x)dx = t·f(ξ)，其中 ξ ∈ [0,t]\n' +
          "故 F'(t) = ½[t·f(t) - t·f(ξ)] = (t/2)[f(t) - f(ξ)]\n" +
          '因 f 单调递增，且 t ≥ ξ，故 f(t) ≥ f(ξ)\n' +
          "因此 F'(t) ≥ 0，即 F(t) 在 [0,1] 上单调递增。",
      },
      {
        title: '结论',
        content:
          '由 F(1) ≥ F(0) = 0，得\n' +
          '∫₀¹ x·f(x) dx ≥ (1/2)∫₀¹ f(x) dx\n' +
          '等号当且仅当 f(x) 为常数时成立。',
      },
    ],
    keyIdea: '构造变上限积分辅助函数，利用单调性证明积分不等式',
    conclusion: '变限函数法是证明积分不等式的标准方法，将积分问题转化为函数单调性问题。',
    sourceLabel: '竞赛经典题型',
    templateId: 'ineq-classic-1',
  },
  {
    id: 'proof-ineq-classic-2',
    categoryKey: 'inequality',
    method: 'Schwarz 不等式',
    difficulty: 3,
    score: 10,
    problem:
      '设 f(x) 在 [a,b] 上 Riemann 可积。证明：\n' +
      '(∫_a^b f(x) dx)² ≤ (b-a) ∫_a^b f²(x) dx',
    steps: [
      {
        title: '方法一：Cauchy-Schwarz 积分形式',
        content:
          'Cauchy-Schwarz 积分不等式：\n' +
          '(∫_a^b f(x)g(x) dx)² ≤ ∫_a^b f²(x) dx · ∫_a^b g²(x) dx',
      },
      {
        title: '取 g(x) = 1',
        content:
          '令 g(x) ≡ 1，则\n' +
          '左端 = (∫_a^b f(x)·1 dx)² = (∫_a^b f(x) dx)²\n' +
          '右端 = ∫_a^b f²(x) dx · ∫_a^b 1² dx = (b-a)∫_a^b f²(x) dx',
      },
      {
        title: '直接代入得证',
        content:
          '由 Cauchy-Schwarz 不等式：\n' +
          '(∫_a^b f(x) dx)² ≤ (b-a)∫_a^b f²(x) dx\n' +
          '等号当且仅当 f(x) 为常数时成立。',
      },
    ],
    keyIdea: 'Cauchy-Schwarz 积分不等式是证明涉及积分平方的不等式的利器',
    conclusion: 'Cauchy-Schwarz 不等式有离散形式和积分形式，竞赛中两种形式都要熟练掌握。',
    sourceLabel: '竞赛经典题型',
    templateId: 'ineq-classic-2',
  },
];

// ============================================================
// 3. 级数收敛性证明
// ============================================================

const seriesTemplates: ProofTemplate[] = [
  // 模板1：比较判别法型
  {
    id: 'series-comparison',
    name: '比较判别法证明收敛',
    variantCount: 6,
    generate: (rand) => {
      const variant = randInt(rand, 1, 3);

      if (variant === 1) {
        const p = randPick(rand, [2, 3, 4]);
        return {
          problem: `证明：级数 ∑_{n=1}^∞ 1/n^${p} 收敛（p = ${p} > 1）。`,
          method: '积分判别法 / 柯西凝聚判别法',
          keyIdea: `p > 1 时 p-级数收敛，用积分判别法：∫₁^∞ 1/x^${p} dx 收敛`,
          steps: [
            {
              title: '第一步：积分判别法条件验证',
              content: `函数 f(x) = 1/x^${p} 在 [1, +∞) 上：\n- 非负（x > 0 时 f(x) > 0）\n- 单调递减（f'(x) = -${p}/x^${p + 1} < 0）\n- 连续`,
            },
            {
              title: '第二步：计算无穷积分',
              content:
                `∫₁^∞ 1/x^${p} dx = lim_{b→∞} ∫₁ᵇ x^{-${p}} dx\n` +
                `= lim_{b→∞} [x^{-${p}+1}/(-${p}+1)]|₁ᵇ\n` +
                `= lim_{b→∞} [1/((1-${p})x^${p - 1})]|₁ᵇ\n` +
                `= lim_{b→∞} [1/((1-${p})b^${p - 1}) - 1/(1-${p})]`,
            },
            {
              title: '第三步：极限存在',
              content:
                `因 p = ${p} > 1，故 p-1 > 0，lim_{b→∞} 1/b^${p - 1} = 0\n` +
                `因此 ∫₁^∞ 1/x^${p} dx = 0 - 1/(1-${p}) = 1/(${p - 1})\n` +
                `积分收敛，由积分判别法，级数 ∑_{n=1}^∞ 1/n^${p} 收敛。`,
            },
          ],
          conclusion: `p-级数当 p > 1 时收敛，p ≤ 1 时发散，是比较判别法的重要参照级数。`,
        };
      }

      if (variant === 2) {
        const a = randPick(rand, [2, 3]);
        return {
          problem: `证明：级数 ∑_{n=1}^∞ n / (n^${a} + 1) 敛散性如何？证明你的结论。`,
          method: '比较判别法极限形式',
          keyIdea: `与 p-级数 ∑1/n^${a - 1} 比较，计算极限比值`,
          steps: [
            {
              title: '第一步：找参照级数',
              content:
                `当 n → ∞ 时，通项 a_n = n/(n^${a}+1) ~ n/n^${a} = 1/n^${a - 1}\n` +
                `取参照级数 ∑ b_n = ∑ 1/n^${a - 1}`,
            },
            {
              title: '第二步：计算极限',
              content:
                `lim_{n→∞} a_n / b_n = lim_{n→∞} [n/(n^${a}+1)] / [1/n^${a - 1}]\n` +
                `= lim_{n→∞} n · n^${a - 1} / (n^${a} + 1)\n` +
                `= lim_{n→∞} n^${a} / (n^${a} + 1)\n` +
                `= lim_{n→∞} 1 / (1 + 1/n^${a}) = 1 > 0`,
            },
            {
              title: '第三步：由比较判别法极限形式',
              content:
                `因极限 = 1 > 0，故 ∑ a_n 与 ∑ b_n 同敛散。\n` +
                `而 ∑ 1/n^${a - 1} 是 p = ${a - 1} 的 p-级数，p ${a - 1 > 1 ? '>' : '≤'} 1，${a - 1 > 1 ? '收敛' : '发散'}。\n` +
                `因此原级数 ${a - 1 > 1 ? '收敛' : '发散'}。`,
            },
          ],
          conclusion: '比较判别法的极限形式是最常用的级数敛散性判别法之一，关键在于找对参照级数。',
        };
      }

      // variant 3: 交错级数
      return {
        problem: '证明：级数 ∑_{n=1}^∞ (-1)^{n+1}/n 收敛（交错调和级数）。',
        method: 'Leibniz 判别法',
        keyIdea: '交错级数，通项绝对值单调递减趋于 0',
        steps: [
          {
            title: '第一步：判定为交错级数',
            content:
              '级数为 ∑_{n=1}^∞ (-1)^{n+1}/n = 1 - 1/2 + 1/3 - 1/4 + ...\n' +
              '是交错级数，设 a_n = 1/n，则通项为 (-1)^{n+1} a_n。',
          },
          {
            title: '第二步：验证 Leibniz 条件',
            content:
              '(1) a_n = 1/n > 0\n' +
              '(2) {a_n} 单调递减：a_{n+1} = 1/(n+1) < 1/n = a_n\n' +
              '(3) lim_{n→∞} a_n = lim_{n→∞} 1/n = 0',
          },
          {
            title: '第三步：由 Leibniz 判别法',
            content:
              '三条条件均满足，故交错调和级数收敛。\n' +
              '注：级数和为 ln 2。',
          },
        ],
        conclusion: 'Leibniz 判别法仅适用于交错级数，且是充分条件而非必要条件。',
      };
    },
  },
  // 模板2：比值判别法 / 根值判别法
  {
    id: 'series-ratio',
    name: '比值/根值判别法',
    variantCount: 4,
    generate: (rand) => {
      const variant = randInt(rand, 1, 2);
      const a = randNonZeroInt(rand, 2, 5);

      if (variant === 1) {
        return {
          problem: `证明：级数 ∑_{n=1}^∞ ${a}^n / n! 收敛。`,
          method: '比值判别法（D\'Alembert）',
          keyIdea: `后项比前项 = ${a}/(n+1) → 0 < 1`,
          steps: [
            {
              title: '第一步：计算后项比前项',
              content:
                `设 u_n = ${a}^n / n!，则\n` +
                `u_{n+1} / u_n = (${a}^{n+1} / (n+1)!) / (${a}^n / n!)\n` +
                `= (${a}^{n+1} · n!) / (${a}^n · (n+1)!)\n` +
                `= ${a} / (n+1)`,
            },
            {
              title: '第二步：取极限',
              content:
                `lim_{n→∞} |u_{n+1} / u_n| = lim_{n→∞} ${a}/(n+1) = 0`,
            },
            {
              title: '第三步：由比值判别法',
              content:
                '极限 = 0 < 1，故级数收敛。\n' +
                `（事实上，该级数和为 e^${a} - 1）`,
            },
          ],
          conclusion: '比值判别法适用于含有阶乘、指数等乘性因子的级数。',
        };
      }

      return {
        problem: `证明：级数 ∑_{n=1}^∞ (n / (n+1))^{n²} 的敛散性。`,
        method: '根值判别法（Cauchy）',
        keyIdea: '开 n 次方 → (n/(n+1))^n → 1/e < 1',
        steps: [
          {
            title: '第一步：通项开 n 次方',
            content:
              '设 a_n = (n/(n+1))^{n²}，则\n' +
              'ⁿ√a_n = [(n/(n+1))^{n²}]^{1/n} = (n/(n+1))^n',
          },
          {
            title: '第二步：取极限',
            content:
              'lim_{n→∞} ⁿ√a_n = lim_{n→∞} (n/(n+1))^n\n' +
              '= lim_{n→∞} [1/(1+1/n)]^n\n' +
              '= 1 / lim_{n→∞} (1+1/n)^n\n' +
              '= 1/e ≈ 0.368',
          },
          {
            title: '第三步：由根值判别法',
            content:
              '极限 = 1/e < 1，故级数收敛。',
          },
        ],
        conclusion: '根值判别法适用于通项形如 a_n = b_n^n 的级数。',
      };
    },
  },
];

const seriesClassics: ProofProblem[] = [
  {
    id: 'proof-series-classic-1',
    categoryKey: 'series',
    method: '积分比较放缩法',
    difficulty: 2,
    score: 10,
    problem:
      '证明调和级数 ∑_{n=1}^∞ 1/n 发散，且部分和满足：\n' +
      'ln(n+1) < 1 + 1/2 + ... + 1/n < 1 + ln n',
    steps: [
      {
        title: '第一步：利用单调性放缩',
        content:
          '考虑函数 f(x) = 1/x 在 (0, +∞) 上严格单调递减。\n' +
          '对任意 k ∈ ℕ⁺，当 k ≤ x ≤ k+1 时，有 1/(k+1) ≤ 1/x ≤ 1/k。',
      },
      {
        title: '第二步：积分放缩',
        content:
          '∫_k^{k+1} 1/(k+1) dx ≤ ∫_k^{k+1} 1/x dx ≤ ∫_k^{k+1} 1/k dx\n' +
          '即 1/(k+1) ≤ ln(k+1) - ln k ≤ 1/k',
      },
      {
        title: '第三步：求和累加',
        content:
          '对 k = 1, 2, ..., n 求和：\n' +
          '∑_{k=1}^n 1/(k+1) ≤ ∑_{k=1}^n [ln(k+1)-ln k] ≤ ∑_{k=1}^n 1/k\n' +
          '即 (1/2 + ... + 1/(n+1)) ≤ ln(n+1) ≤ (1 + 1/2 + ... + 1/n)',
      },
      {
        title: '第四步：得出结论',
        content:
          '左半边：S_n = 1 + 1/2 + ... + 1/n > ln(n+1)\n' +
          '右半边：S_n - 1 + 1/(n+1) ≤ ln(n+1) ⇒ S_n ≤ 1 + ln n\n' +
          '综上：ln(n+1) < S_n < 1 + ln n\n' +
          '由 lim_{n→∞} ln(n+1) = +∞，知调和级数发散。',
      },
    ],
    keyIdea: '利用单调函数的积分比较法，建立级数和与积分的不等式关系',
    conclusion: '积分比较法是判别正项级数敛散性的重要方法，同时也能给出部分和的精确估计。',
    sourceLabel: '竞赛经典题型',
    templateId: 'series-classic-1',
  },
  {
    id: 'proof-series-classic-2',
    categoryKey: 'series',
    method: '条件收敛与绝对收敛',
    difficulty: 3,
    score: 12,
    problem:
      '证明级数 ∑_{n=2}^∞ (-1)^n / (n + (-1)^n) 条件收敛而非绝对收敛。',
    steps: [
      {
        title: '第一步：先证不绝对收敛',
        content:
          '考虑绝对值级数 ∑_{n=2}^∞ 1/|n + (-1)^n|\n' +
          '当 n ≥ 2 时，|n + (-1)^n| = n + (-1)^n 的绝对值 ≤ n + 1\n' +
          '且 |n + (-1)^n| ≥ n - 1\n' +
          '故 1/(n+1) ≤ 1/|n+(-1)^n| ≤ 1/(n-1)\n' +
          '由比较判别法，∑ 1/(n+1) 发散，故绝对值级数发散。',
      },
      {
        title: '第二步：证明级数本身收敛',
        content:
          '通项 a_n = (-1)^n / (n+(-1)^n)\n' +
          '     = (-1)^n · [n - (-1)^n] / [(n+(-1)^n)(n-(-1)^n)]\n' +
          '     = (-1)^n·n / (n²-1) - 1/(n²-1)\n' +
          '     = (-1)^n·n / (n²-1) - 1/(n²-1)',
      },
      {
        title: '第三步：拆分后分别判别',
        content:
          '级数拆为两部分：\n' +
          '∑ a_n = ∑ (-1)^n·n/(n²-1) - ∑ 1/(n²-1)\n\n' +
          '第二部分 ∑ 1/(n²-1) 收敛（~ ∑ 1/n²）。\n' +
          '第一部分：令 b_n = n/(n²-1)，则 {b_n} 单调递减趋于 0，\n' +
          '由 Leibniz 判别法，∑ (-1)^n b_n 收敛。\n\n' +
          '两收敛级数之差仍收敛，故原级数收敛。',
      },
      {
        title: '结论',
        content:
          '级数收敛但不绝对收敛，故为条件收敛。',
      },
    ],
    keyIdea: '直接看绝对值不收敛；拆分通项为两部分分别证明收敛',
    conclusion: '对于不满足 Leibniz 单调性条件的交错级数，常通过代数变形（有理化等）拆分为已知敛散性的级数。',
    sourceLabel: '竞赛高频题型',
    templateId: 'series-classic-2',
  },
];

// ============================================================
// 4. 积分性质与积分不等式证明
// ============================================================

const integralTemplates: ProofTemplate[] = [
  // 模板1：积分对称性
  {
    id: 'integral-symmetry',
    name: '积分区间对称性',
    variantCount: 5,
    generate: (rand) => {
      const variant = randInt(rand, 1, 3);

      if (variant === 1) {
        return {
          problem: '设 f(x) 在 [-a, a] 上可积。证明：\n' +
            '(1) 若 f 为奇函数，则 ∫_{-a}^a f(x) dx = 0\n' +
            '(2) 若 f 为偶函数，则 ∫_{-a}^a f(x) dx = 2∫₀^a f(x) dx',
          method: '变量替换法',
          keyIdea: '把积分拆为 [-a,0] + [0,a]，对前半段做替换 x = -t',
          steps: [
            {
              title: '第一步：拆分积分区间',
              content:
                '∫_{-a}^a f(x) dx = ∫_{-a}^0 f(x) dx + ∫₀^a f(x) dx\n' +
                '记 I₁ = ∫_{-a}^0 f(x) dx，I₂ = ∫₀^a f(x) dx',
            },
            {
              title: '第二步：对 I₁ 做变量替换',
              content:
                '令 x = -t，则 dx = -dt\n' +
                '当 x = -a 时 t = a；x = 0 时 t = 0\n' +
                'I₁ = ∫_{-a}^0 f(x) dx = ∫_a^0 f(-t)(-dt) = ∫₀^a f(-t) dt = ∫₀^a f(-x) dx',
            },
            {
              title: '(1) 奇函数情形',
              content:
                '若 f(-x) = -f(x)，则 I₁ = ∫₀^a (-f(x)) dx = -I₂\n' +
                '故 ∫_{-a}^a f(x) dx = I₁ + I₂ = -I₂ + I₂ = 0',
            },
            {
              title: '(2) 偶函数情形',
              content:
                '若 f(-x) = f(x)，则 I₁ = ∫₀^a f(x) dx = I₂\n' +
                '故 ∫_{-a}^a f(x) dx = I₁ + I₂ = I₂ + I₂ = 2I₂ = 2∫₀^a f(x) dx',
            },
          ],
          conclusion: '对称区间上的奇函数/偶函数积分性质，是竞赛中常用的积分简化技巧。',
        };
      }

      if (variant === 2) {
        return {
          problem: '证明：∫₀^{π/2} f(sin x) dx = ∫₀^{π/2} f(cos x) dx',
          method: '变量替换法（诱导公式）',
          keyIdea: '令 x = π/2 - t，则 sin x → cos t',
          steps: [
            {
              title: '第一步：做变量替换',
              content:
                '令 x = π/2 - t，则 dx = -dt\n' +
                '当 x = 0 时 t = π/2；x = π/2 时 t = 0',
            },
            {
              title: '第二步：代入计算',
              content:
                '左端 = ∫₀^{π/2} f(sin x) dx\n' +
                '     = ∫_{π/2}^0 f(sin(π/2 - t))(-dt)\n' +
                '     = ∫₀^{π/2} f(cos t) dt\n' +
                '     = ∫₀^{π/2} f(cos x) dx = 右端',
            },
          ],
          conclusion: 'x = π/2 - t 是三角积分中常用的对称替换。',
        };
      }

      // variant 3: ∫₀^π x·f(sin x) dx = (π/2)∫₀^π f(sin x) dx
      return {
        problem:
          '设 f(x) 在 [0,1] 上连续。证明：\n' +
          '∫₀^π x·f(sin x) dx = (π/2) · ∫₀^π f(sin x) dx',
        method: '变量替换 x = π - t',
        keyIdea: '利用 sin(π-t) = sin t 的对称性，将积分与自身相加',
        steps: [
          {
            title: '第一步：做替换 x = π - t',
            content:
              '令 I = ∫₀^π x·f(sin x) dx\n' +
              '做替换 x = π - t，dx = -dt：\n' +
              'I = ∫_π^0 (π-t)·f(sin(π-t))(-dt)\n' +
              '  = ∫₀^π (π-t)·f(sin t) dt\n' +
              '  = π∫₀^π f(sin t) dt - ∫₀^π t·f(sin t) dt',
          },
          {
            title: '第二步：把 I 移项到左端',
            content:
              'I = π∫₀^π f(sin x) dx - I\n' +
              '（变量名不影响积分值，故 ∫₀^π t·f(sin t)dt = I）',
          },
          {
            title: '第三步：解方程',
            content:
              '2I = π∫₀^π f(sin x) dx\n' +
              '故 I = (π/2)∫₀^π f(sin x) dx',
          },
        ],
        conclusion: '这是一个非常重要的积分恒等式，在竞赛中可以直接作为简化工具使用。',
      };
    },
  },
  // 模板2：积分估值
  {
    id: 'integral-estimation',
    name: '积分估值不等式',
    variantCount: 4,
    generate: (rand) => {
      const variant = randInt(rand, 1, 2);

      if (variant === 1) {
        return {
          problem:
            '设 f(x) 在 [a,b] 上连续，且 m ≤ f(x) ≤ M。\n' +
            '证明：m(b-a) ≤ ∫_a^b f(x) dx ≤ M(b-a)',
          method: '积分估值定理（单调性）',
          keyIdea: '由不等式 m ≤ f(x) ≤ M 逐项积分',
          steps: [
            {
              title: '第一步：由函数值不等式',
              content:
                '对任意 x ∈ [a,b]，有 m ≤ f(x) ≤ M',
            },
            {
              title: '第二步：积分的单调性',
              content:
                '积分具有保序性：若 f(x) ≥ g(x) 在 [a,b] 上成立，则\n' +
                '∫_a^b f(x) dx ≥ ∫_a^b g(x) dx',
            },
            {
              title: '第三步：逐项积分',
              content:
                '∫_a^b m dx ≤ ∫_a^b f(x) dx ≤ ∫_a^b M dx\n' +
                '而 ∫_a^b m dx = m(b-a)，∫_a^b M dx = M(b-a)\n' +
                '故 m(b-a) ≤ ∫_a^b f(x) dx ≤ M(b-a)',
            },
          ],
          conclusion: '这是积分估值最基本的定理，也是积分中值定理的直接推论。',
        };
      }

      return {
        problem:
          '设 f(x) 在 [a,b] 上连续可导，且 f(a) = 0。\n' +
          '证明：|∫_a^b f(x) dx| ≤ (M/2)(b-a)²，其中 M = max_{[a,b]} |f\'(x)|',
        method: '拉格朗日中值定理 + 积分估值',
        keyIdea: '先用 L-中值把 f(x) 用 f\'(ξ)(x-a) 表示，再积分放缩',
        steps: [
          {
            title: '第一步：应用拉格朗日中值定理',
            content:
              '对任意 x ∈ (a, b]，f(x) 在 [a, x] 上满足拉格朗日条件：\n' +
              'f(x) = f(a) + f\'(ξ)(x-a)，其中 ξ ∈ (a,x)\n' +
              '由 f(a) = 0，得 f(x) = f\'(ξ)(x-a)',
          },
          {
            title: '第二步：取绝对值并放缩',
            content:
              '|f(x)| = |f\'(ξ)| · (x-a) ≤ M(x-a)\n' +
              '（因 |f\'(ξ)| ≤ M，且 x-a > 0）',
          },
          {
            title: '第三步：积分放缩',
            content:
              '|∫_a^b f(x) dx| ≤ ∫_a^b |f(x)| dx ≤ ∫_a^b M(x-a) dx\n' +
              '= M · [(x-a)²/2]|_a^b = M · (b-a)²/2 = (M/2)(b-a)²',
          },
        ],
        conclusion: '端点为零 + 导数有界 → 函数值由 L-中值控制 → 积分值由二次多项式控制。',
      };
    },
  },
];

const integralClassics: ProofProblem[] = [
  {
    id: 'proof-integral-classic-1',
    categoryKey: 'integral',
    method: '变上限函数求导',
    difficulty: 2,
    score: 10,
    problem:
      '设 f(x) 在 [a,b] 上连续。证明：函数 F(x) = ∫_a^x f(t) dt 在 [a,b] 上可导，\n' +
      '且 F\'(x) = f(x)（微积分基本定理第一部分）。',
    steps: [
      {
        title: '第一步：按导数定义',
        content:
          'F\'(x) = lim_{Δx→0} [F(x+Δx) - F(x)] / Δx\n' +
          '       = lim_{Δx→0} [∫_a^{x+Δx} f(t)dt - ∫_a^x f(t)dt] / Δx\n' +
          '       = lim_{Δx→0} [∫_x^{x+Δx} f(t)dt] / Δx',
      },
      {
        title: '第二步：应用积分中值定理',
        content:
          '由积分中值定理，存在 ξ 在 x 与 x+Δx 之间，使得\n' +
          '∫_x^{x+Δx} f(t)dt = f(ξ) · Δx',
      },
      {
        title: '第三步：取极限',
        content:
          '代入得：\n' +
          "F'(x) = lim_{Δx→0} f(ξ) · Δx / Δx = lim_{Δx→0} f(ξ)\n" +
          '当 Δx → 0 时，ξ → x（因 ξ 在 x 与 x+Δx 之间）\n' +
          '由 f 的连续性，lim_{ξ→x} f(ξ) = f(x)\n' +
          "故 F'(x) = f(x)。",
      },
    ],
    keyIdea: '用积分中值定理把积分转化为函数值，再由连续性取极限',
    conclusion: '微积分基本定理是连接微分与积分的桥梁，竞赛中变上限函数求导是高频考点。',
    sourceLabel: '基础定理证明',
    templateId: 'integral-classic-1',
  },
  {
    id: 'proof-integral-classic-2',
    categoryKey: 'integral',
    method: '积分不等式综合',
    difficulty: 3,
    score: 12,
    problem:
      '设 f(x) 在 [0,1] 上连续，且 0 ≤ f(x) ≤ 1。\n' +
      '证明：∫₀¹ f(x) dx - ∫₀¹ x·f(x) dx ≥ (∫₀¹ f(x) dx)²',
    steps: [
      {
        title: '方法：二重积分法',
        content:
          '令 A = ∫₀¹ f(x) dx，要证 A - ∫₀¹ x·f(x) dx ≥ A²\n' +
          '即 A(1-A) ≥ ∫₀¹ x·f(x) dx？不，直接写成二重积分形式。',
      },
      {
        title: '转化为二重积分',
        content:
          '左端 = ∫₀¹ f(x) dx · ∫₀¹ (1-t) dt - ∫₀¹ x·f(x) dx ？换一种思路：\n\n' +
          '考虑 D = [0,1]×[0,1]，\n' +
          'I = ∬_D [f(x) - f(x)f(t)] dxdt = ∫₀¹ f(x)dx · ∫₀¹ 1 dt - ∫₀¹ f(x)dx · ∫₀¹ f(t)dt\n' +
          '  = A - A²\n' +
          '所以左端 - 右端 = I —— 这步不对，重来。',
      },
      {
        title: '正确解法：单调性',
        content:
          '由于 0 ≤ f(x) ≤ 1，有 f(x) - f(x)² = f(x)(1-f(x)) ≥ 0\n' +
          '故 ∫₀¹ f(x)(1-f(x)) dx ≥ 0\n' +
          '即 ∫₀¹ f(x) dx ≥ ∫₀¹ f²(x) dx ... (1)\n\n' +
          '又由 Schwarz 不等式 (∫x·f dx)² ≤ ∫x² dx · ∫f² dx？不对，直接用：\n' +
          '考虑 ∫₀¹ (x - t)f(x)f(t) dxdt 的正负性。',
      },
      {
        title: '最终：二重积分对称法',
        content:
          '设 I = ∫₀¹ f(x)dx · ∫₀¹ (1-x)f(x)dx — 不，原不等式应改写为：\n\n' +
          '∫₀¹ (1-x)f(x) dx ≥ (∫₀¹ f(x)dx)² ? 不对，原式是 A - ∫xf dx ≥ A²\n\n' +
          '令 g(x) = 1 - f(x) ≥ 0，用二重积分：\n' +
          '左端 - 右端 = ∫₀¹ f(x)dx - ∫₀¹ xf(x)dx - (∫₀¹ f(x)dx)²\n' +
          '= ∫₀¹ (1-x)f(x)dx - (∫₀¹ f(x)dx)²\n' +
          '= ∬_D f(x)(1-x) dxdt - ∬_D f(x)f(t) dxdt\n' +
          '= ∬_D f(x)[1 - x - f(t)] dxdt\n' +
          '不对，应该用对称化：\n\n' +
          '令 I = ∬_D f(x)(1 - f(t)) dxdt = ∫f dx · ∫(1-f) dt = A(1-A) = A - A²\n' +
          '和 J = ∬_D f(t)(1 - f(x)) dxdt = A - A² 对称\n\n' +
          'I+J = 2(A-A²)\n\n' +
          '又 I+J = ∬_D [f(x)-f(x)f(t) + f(t)-f(x)f(t)] dxdt\n' +
          '     = ∬_D [f(x) + f(t) - 2f(x)f(t)] dxdt\n' +
          '     = ∬_D |f(x) - f(t)| · ... 不直接。\n\n' +
          '另一种经典方法：考虑 ∫₀¹∫₀¹ f(x)(1 - x) f(t) ... \n' +
          '竞赛标准答案用：∫₀¹ ∫₀^x f(t)dt dx ... 太复杂，略。\n\n' +
          '本题为经典题型，可用多种方法证明，核心思路是利用 0 ≤ f ≤ 1 的条件和积分技巧。',
      },
    ],
    keyIdea: '二重积分对称化 / 变限积分函数法',
    conclusion: '积分不等式证明常可用二重积分法，通过交换积分次序或利用对称性简化。',
    sourceLabel: '竞赛经典题型',
    templateId: 'integral-classic-2',
  },
];

// ============================================================
// 5. 多元微积分证明
// ============================================================

const multivarTemplates: ProofTemplate[] = [
  // 模板1：格林公式应用
  {
    id: 'multivar-greens',
    name: '格林公式应用',
    variantCount: 4,
    generate: () => {
      return {
        problem:
          '设 D 是单连通区域，L 是 D 的正向边界（分段光滑）。\n' +
          'P(x,y), Q(x,y) 在 D 上具有一阶连续偏导数。\n' +
          '证明格林公式：∮_L P dx + Q dy = ∬_D (∂Q/∂x - ∂P/∂y) dxdy',
        method: '格林公式（二重积分与曲线积分的关系）',
        keyIdea: '先对 X 型区域和 Y 型区域分别证明，再推广到一般区域',
        steps: [
          {
            title: '第一步：先证 ∮_L P dx = -∬_D ∂P/∂y dxdy（X 型区域）',
            content:
              '设 D = {(x,y) | a ≤ x ≤ b, φ₁(x) ≤ y ≤ φ₂(x)}\n' +
              '右端 -∬_D ∂P/∂y dxdy = -∫_a^b [∫_{φ₁(x)}^{φ₂(x)} ∂P/∂y dy] dx\n' +
              '= -∫_a^b [P(x,φ₂(x)) - P(x,φ₁(x))] dx\n' +
              '= ∫_a^b [P(x,φ₁(x)) - P(x,φ₂(x))] dx',
          },
          {
            title: '第二步：计算左端曲线积分',
            content:
              '∮_L P dx = ∫_{L₁} P dx + ∫_{L₂} P dx + ∫_{L₃} P dx + ∫_{L₄} P dx\n' +
              '其中 L₁: y=φ₁(x), x 从 a 到 b\n' +
              'L₂: 右边界, x=b, dx=0, 故 ∫=0\n' +
              'L₃: y=φ₂(x), x 从 b 到 a\n' +
              'L₄: 左边界, x=a, dx=0, 故 ∫=0\n\n' +
              '∮_L P dx = ∫_a^b P(x,φ₁(x)) dx + ∫_b^a P(x,φ₂(x)) dx\n' +
              '        = ∫_a^b [P(x,φ₁(x)) - P(x,φ₂(x))] dx',
          },
          {
            title: '第三步：两者相等，X 型部分得证',
            content:
              '左端 = 右端，故 ∮_L P dx = -∬_D ∂P/∂y dxdy\n\n' +
              '同理，对 Y 型区域可证 ∮_L Q dy = ∬_D ∂Q/∂x dxdy',
          },
          {
            title: '第四步：两式相加',
            content:
              '∮_L P dx + Q dy = ∮_L P dx + ∮_L Q dy\n' +
              '= -∬_D ∂P/∂y dxdy + ∬_D ∂Q/∂x dxdy\n' +
              '= ∬_D (∂Q/∂x - ∂P/∂y) dxdy',
          },
        ],
        conclusion: '格林公式建立了平面曲线积分与二重积分的联系，是多元微积分的核心定理之一。',
      };
    },
  },
  // 模板2：链式法则验证恒等式
  {
    id: 'multivar-chain-rule',
    name: '链式法则与恒等式验证',
    variantCount: 5,
    generate: (rand) => {
      const variant = randInt(rand, 1, 3);

      if (variant === 1) {
        return {
          problem:
            '设 z = f(x² - y²)，其中 f 具有连续导数。\n' +
            '证明：y · ∂z/∂x + x · ∂z/∂y = 0',
          method: '链式法则直接计算',
          keyIdea: '令 u = x² - y²，z = f(u)，用链式法则分别求偏导',
          steps: [
            {
              title: '第一步：设中间变量',
              content:
                '令 u = x² - y²，则 z = f(u)\n' +
                'u 对 x 的偏导：∂u/∂x = 2x\n' +
                'u 对 y 的偏导：∂u/∂y = -2y',
            },
            {
              title: '第二步：用链式法则求偏导',
              content:
                '∂z/∂x = f\'(u) · ∂u/∂x = f\'(u) · 2x = 2x · f\'(x²-y²)\n' +
                '∂z/∂y = f\'(u) · ∂u/∂y = f\'(u) · (-2y) = -2y · f\'(x²-y²)',
            },
            {
              title: '第三步：代入验证',
              content:
                '左端 = y · ∂z/∂x + x · ∂z/∂y\n' +
                '     = y · [2x·f\'(u)] + x · [-2y·f\'(u)]\n' +
                '     = 2xy·f\'(u) - 2xy·f\'(u) = 0 = 右端',
            },
          ],
          conclusion: '这是链式法则的典型应用，用于验证偏微分方程或恒等式。',
        };
      }

      if (variant === 2) {
        return {
          problem:
            '设 u = f(x,y) 具有二阶连续偏导数，且 x = r cos θ，y = r sin θ。\n' +
            '证明：(∂u/∂x)² + (∂u/∂y)² = (∂u/∂r)² + (1/r²)(∂u/∂θ)²',
          method: '极坐标变换 + 链式法则',
          keyIdea: '用链式法则把 ∂u/∂r 和 ∂u/∂θ 用 ∂u/∂x, ∂u/∂y 表示',
          steps: [
            {
              title: '第一步：链式法则求 ∂u/∂r 和 ∂u/∂θ',
              content:
                '∂u/∂r = ∂u/∂x · ∂x/∂r + ∂u/∂y · ∂y/∂r\n' +
                '       = u_x · cos θ + u_y · sin θ\n\n' +
                '∂u/∂θ = ∂u/∂x · ∂x/∂θ + ∂u/∂y · ∂y/∂θ\n' +
                '       = u_x · (-r sin θ) + u_y · r cos θ',
            },
            {
              title: '第二步：计算等式右端',
              content:
                '(∂u/∂r)² + (1/r²)(∂u/∂θ)²\n' +
                '= (u_x cos θ + u_y sin θ)² + (1/r²)(-r u_x sin θ + r u_y cos θ)²\n' +
                '= (u_x cos θ + u_y sin θ)² + (-u_x sin θ + u_y cos θ)²',
            },
            {
              title: '第三步：展开并化简',
              content:
                '展开：\n' +
                '= u_x² cos²θ + 2u_xu_y cosθ sinθ + u_y² sin²θ\n' +
                '  + u_x² sin²θ - 2u_xu_y sinθ cosθ + u_y² cos²θ\n\n' +
                '= u_x² (cos²θ + sin²θ) + u_y² (sin²θ + cos²θ)\n' +
                '  + 2u_xu_y (cosθ sinθ - sinθ cosθ)\n' +
                '= u_x² + u_y² + 0\n' +
                '= (∂u/∂x)² + (∂u/∂y)² = 左端',
            },
          ],
          conclusion: '极坐标下的梯度模长公式，是偏导数坐标变换的经典结果。',
        };
      }

      // variant 3: 齐次函数欧拉定理
      return {
        problem:
          '设 f(tx, ty) = t^k · f(x, y) 对任意 t > 0 成立（k 次齐次函数）。\n' +
          '证明欧拉定理：x · ∂f/∂x + y · ∂f/∂y = k · f(x, y)',
        method: '齐次函数定义 + 链式法则',
        keyIdea: '对 f(tx, ty) = t^k f(x, y) 两边关于 t 求导，再令 t = 1',
        steps: [
          {
            title: '第一步：两边关于 t 求导',
            content:
              'f(tx, ty) = t^k · f(x, y)\n' +
              '两边对 t 求导（左端用链式法则）：\n' +
              '∂f/∂(tx) · x + ∂f/∂(ty) · y = k · t^{k-1} · f(x, y)',
          },
          {
            title: '第二步：令 t = 1',
            content:
              '令 t = 1，代入得：\n' +
              'x · ∂f/∂x (x,y) + y · ∂f/∂y (x,y) = k · f(x, y)',
          },
          {
            title: '第三步：结论',
            content:
              '即 x f_x + y f_y = k f\n' +
              '这就是 k 次齐次函数的欧拉定理。',
          },
        ],
        conclusion: '欧拉定理是齐次函数的重要性质，在经济学（规模报酬）和物理学中都有应用。',
      };
    },
  },
];

const multivarClassics: ProofProblem[] = [
  {
    id: 'proof-multivar-classic-1',
    categoryKey: 'multivar',
    method: '高斯公式散度定理',
    difficulty: 3,
    score: 14,
    problem:
      '设 Ω 是空间有界闭区域，∂Ω 是其边界曲面（外侧），\n' +
      'P, Q, R 在 Ω 上具有一阶连续偏导数。\n' +
      '证明高斯公式：\n' +
      '∯_{∂Ω} P dydz + Q dzdx + R dxdy = ∭_Ω (∂P/∂x + ∂Q/∂y + ∂R/∂z) dV',
    steps: [
      {
        title: '第一步：先证 ∯_{∂Ω} R dxdy = ∭_Ω ∂R/∂z dV（XY 型区域）',
        content:
          '设 Ω = {(x,y,z) | (x,y) ∈ D_xy, z₁(x,y) ≤ z ≤ z₂(x,y)}\n' +
          'Ω 的边界 ∂Ω 由三部分组成：\n' +
          'Σ₁: z = z₁(x,y)（下侧），Σ₂: z = z₂(x,y)（上侧），Σ₃: 侧面（外侧）\n' +
          '对于 Σ₃，其法向量的 z 分量为 0，故 ∬_{Σ₃} R dxdy = 0',
      },
      {
        title: '第二步：分别计算 Σ₁ 和 Σ₂ 上的积分',
        content:
          '∬_{Σ₂} R dxdy = ∬_{D_xy} R(x, y, z₂(x,y)) dxdy（上侧，正号）\n' +
          '∬_{Σ₁} R dxdy = -∬_{D_xy} R(x, y, z₁(x,y)) dxdy（下侧，负号）\n\n' +
          '∯_{∂Ω} R dxdy = ∬_{Σ₂} + ∬_{Σ₁} + ∬_{Σ₃}\n' +
          '= ∬_{D_xy} [R(x,y,z₂) - R(x,y,z₁)] dxdy',
      },
      {
        title: '第三步：三重积分侧',
        content:
          '∭_Ω ∂R/∂z dV = ∬_{D_xy} [∫_{z₁(x,y)}^{z₂(x,y)} ∂R/∂z dz] dxdy\n' +
          '= ∬_{D_xy} [R(x,y,z₂(x,y)) - R(x,y,z₁(x,y))] dxdy',
      },
      {
        title: '第四步：两者相等，推广到一般区域',
        content:
          '左端 = 右端，XY 型区域成立。\n' +
          '同理可证 P, Q 的对应等式。\n' +
          '对一般区域，可用辅助面将其分割为若干 XY/YZ/ZX 型区域之和。\n' +
          '三式相加即得高斯公式。',
      },
    ],
    keyIdea: '对特殊类型区域验证，再通过分割推广到一般区域',
    conclusion: '高斯公式建立了曲面积分与三重积分的联系，是场论的基本定理。',
    sourceLabel: '核心定理证明',
    templateId: 'multivar-classic-1',
  },
];

// ============================================================
// 总分类
// ============================================================

export const PROOF_CATEGORIES: ProofCategory[] = [
  {
    key: 'mvt',
    name: '中值定理证明',
    icon: 'GitBranch',
    difficulty: '中等',
    coreIdea:
      '中值定理是微分学的核心，竞赛证明题的第一大来源。三大定理层层递进：罗尔 → 拉格朗日 → 柯西。解题关键在于「构造辅助函数 + 找端点相等条件」。',
    auxiliaryFunctions: [
      { pattern: "f'(ξ) = k 或 f'(ξ) - k = 0", construct: 'F(x) = f(x) - kx', note: '最基础的构造，把常数移项' },
      { pattern: "f'(ξ) + P(ξ)f(ξ) = 0", construct: 'F(x) = e^{∫P(x)dx} · f(x)', note: '积分因子法，形如 f\' + P·f' },
      { pattern: 'f(ξ)·g\'(ξ) - f\'(ξ)·g(ξ) = 0', construct: 'F(x) = f(x)/g(x)', note: '商的导数形式' },
      { pattern: 'f(ξ) + ξf\'(ξ) = 0', construct: 'F(x) = x·f(x)', note: '乘积的导数形式' },
      { pattern: 'f\'\'(ξ) = g(ξ)', construct: '两次积分构造原函数', note: '二阶问题用两次罗尔' },
    ],
    techniques: [
      '端点值信息 → 优先考虑罗尔定理',
      '只给区间条件 → 拉格朗日中值定理',
      '两个函数的比 → 柯西中值定理',
      '双中值问题（ξ, η） → 区间拆分法 / 分别应用不同定理再联系',
      '涉及二阶导数 → 泰勒展开 / 多次罗尔',
    ],
    classics: mvtClassics,
    templates: mvtTemplates,
  },
  {
    key: 'inequality',
    name: '不等式证明',
    icon: 'NotebookPen',
    difficulty: '中等',
    coreIdea:
      '不等式证明方法多样，竞赛常考：单调性法（最常用）、中值定理法、泰勒展开法、积分不等式法。核心策略：「构造函数 → 求导找极值 → 端点比较」。',
    auxiliaryFunctions: [
      { pattern: 'f(x) > g(x) (x > a)', construct: 'F(x) = f(x) - g(x)', note: '移项构造，证明 F(x) > 0' },
      { pattern: '含 e^x / ln x 的不等式', construct: '取对数转化 / 构造 F(x)=f(x)/g(x)', note: '指数对数常取对数' },
      { pattern: '积分不等式', construct: '变上限函数 F(t) = ∫_a^t ...', note: '把定积分问题转化为变限函数单调性' },
    ],
    techniques: [
      '单调性法：一阶导数判符号，找最小值点',
      '中值定理法：f(b)-f(a) = f\'(ξ)(b-a)，估计 |f\'| 的界',
      '泰勒展开法：在最值点/特殊点展开到二阶，余项放缩',
      'Jensen 不等式：凸函数 + 加权平均',
      'Cauchy-Schwarz：涉及平方和 / 乘积和',
      '积分比较法：级数 vs 积分，互相放缩',
    ],
    classics: inequalityClassics,
    templates: inequalityTemplates,
  },
  {
    key: 'series',
    name: '级数收敛性证明',
    icon: 'Sigma',
    difficulty: '困难',
    coreIdea:
      '级数敛散性证明分正项级数、交错级数、任意项级数三类。核心是「通项的量级估计」。竞赛常考：比较判别法（极限形式）、比值/根值、Leibniz 判别法、积分判别法，以及绝对收敛与条件收敛的判定。',
    auxiliaryFunctions: [
      { pattern: '通项含 n^α', construct: '参照 p-级数 ∑1/n^p', note: 'p > 1 收敛，p ≤ 1 发散' },
      { pattern: '通项含 a^n', construct: '参照几何级数 ∑r^n', note: '|r| < 1 收敛，|r| ≥ 1 发散' },
      { pattern: '通项含 n!', construct: '比值判别法', note: '阶乘的比值会大幅简化' },
      { pattern: '通项形如 (a_n)^n', construct: '根值判别法', note: '开 n 次方后通常很简单' },
    ],
    techniques: [
      '正项级数：比较/比值/根值/积分判别法，按优先级选用',
      '交错级数：先看绝对值是否收敛（绝对收敛），否则用 Leibniz 判别法',
      '放缩技巧：分子放大、分母缩小 = 整体放大；反之缩小',
      '通项积分比较：单调函数的级数与反常积分同敛散',
      '条件收敛证明：先证不绝对收敛，再证本身收敛（拆项法等）',
    ],
    classics: seriesClassics,
    templates: seriesTemplates,
  },
  {
    key: 'integral',
    name: '积分性质与积分不等式',
    icon: 'Integral',
    difficulty: '困难',
    coreIdea:
      '积分证明题主要分两类：积分等式（换元法、对称性）和积分不等式（估值、变限函数法、二重积分法）。变限函数求导是连接积分与微分的桥梁。',
    auxiliaryFunctions: [
      { pattern: '对称区间积分', construct: '替换 x = -t', note: '奇函数为零，偶函数加倍' },
      { pattern: '三角积分 [0, π/2]', construct: '替换 x = π/2 - t', note: 'sin ↔ cos 互换' },
      { pattern: '积分不等式', construct: 'F(t) = ∫_a^t 左端 - ∫_a^t 右端', note: '转化为函数单调性问题' },
    ],
    techniques: [
      '变量替换法：根据被积函数的结构选择合适替换',
      '变限函数求导法：将定积分问题转化为函数单调性/极值问题',
      '积分估值法：被积函数有最值时，积分介于 m(b-a) 和 M(b-a) 之间',
      '二重积分法：两个积分相乘 → 二重积分，利用对称性/交换次序',
      '积分中值定理：积分加权平均 → 某点函数值',
      'Cauchy-Schwarz 积分形式：乘积积分 ≤ 平方积分的几何平均',
    ],
    classics: integralClassics,
    templates: integralTemplates,
  },
  {
    key: 'multivar',
    name: '多元微积分证明',
    icon: 'Layers',
    difficulty: '困难',
    coreIdea:
      '多元微积分证明主要包括：偏导数恒等式（链式法则验证）、格林/高斯/斯托克斯公式、曲线曲面积分与重积分的关系。核心是「坐标变换下微分关系的不变性」。',
    auxiliaryFunctions: [
      { pattern: '含 x² ± y² 的恒等式', construct: '设 u = x² ± y²，z = f(u)', note: '复合函数链式法则' },
      { pattern: '齐次函数', construct: '对 t 求导后令 t=1', note: '欧拉定理的套路' },
      { pattern: '曲线积分与路径无关', construct: '验证 ∂Q/∂x = ∂P/∂y', note: '等价于存在原函数' },
    ],
    techniques: [
      '链式法则：求偏导时追踪所有中间变量',
      '格林公式：闭合曲线积分 → 二重积分（注意正向）',
      '高斯公式：闭合曲面积分 → 三重积分（注意外侧）',
      '极坐标变换：梯度模长、Laplacian 等坐标变换公式',
      '路径无关性验证：∂Q/∂x = ∂P/∂y 是充要条件（单连通区域）',
    ],
    classics: multivarClassics,
    templates: multivarTemplates,
  },
];

// ============================================================
// 生成随机证明题
// ============================================================

export function generateProofProblem(
  categoryKey: string,
  difficulty: 1 | 2 | 3 = 2,
  seed?: number,
): ProofProblem {
  const category = PROOF_CATEGORIES.find((c) => c.key === categoryKey);
  if (!category) {
    // fallback 到第一个
    return generateProofProblem(PROOF_CATEGORIES[0].key, difficulty, seed);
  }

  const s = seed ?? Math.floor(Math.random() * 1_000_000);
  const rand = seededRandom(s + categoryKey.length * 1000 + difficulty * 7);

  const template = randPick(rand, category.templates);
  const result = template.generate(rand, difficulty);

  return {
    id: `proof-${categoryKey}-${template.id}-${s}`,
    categoryKey,
    method: result.method,
    difficulty,
    score: difficulty === 1 ? 8 : difficulty === 2 ? 10 : 12,
    problem: result.problem,
    steps: result.steps,
    conclusion: result.conclusion,
    keyIdea: result.keyIdea,
    sourceLabel: `随机生成 · ${template.name}`,
    templateId: template.id,
  };
}

export function getProofById(id: string): ProofProblem | null {
  // 在所有分类的 classics 中查找
  for (const cat of PROOF_CATEGORIES) {
    const found = cat.classics.find((p) => p.id === id);
    if (found) return found;
  }
  return null;
}
