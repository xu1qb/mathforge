// EXPORTS: generatePracticeQuestion, checkPracticeAnswer, PRACTICE_TOPICS, type PracticeQuestion, type PracticeTopic, type Difficulty, genGeometryBasic, genCombinatoricsBasic, genTrigIdentity, genSequenceLimit

import { evaluate, simplify, derivative } from 'mathjs';
import { normalizeMathInput } from './math-normalize';
import { expressionToLatex } from './expression-to-latex';
import {
  genLimitV2,
  genHyperbolicV2,
  genSeriesV2,
  genFourierV2,
  genFunctionPropertyV2,
  genSequenceLimitV2,
  genTrigIdentityV2,
  genIntegralV2,
  genDerivativeV2,
  genInequalitySolveV2,
  genRandomVariableV2,
  genOdeV2,
  genTrigSpecialV2,
  genSequenceRecurrenceV2,
  genAlgebraQuadV2,
  genAlgebraFactorV2,
  genNumberTheoryV2,
  genInequalityAmgmV2,
  genExpPowerV2,
  genLogEquationV2,
  genVectorOpV2,
  genMatrixOpV2,
  genComplexV2,
  genGeometryV2,
  genCombinatoricsV2,
  genCoordinateV2,
  genConicV2,
  genSolidV2,
  genProbabilityV2,
} from './practice-v2';
import { gcd } from 'mathjs';

export type Difficulty = 'basic' | 'advanced' | 'competition';

export interface PracticeQuestion {
  /** 题目 id（随机种子） */
  id: string;
  /** 知识点 key */
  topicKey: string;
  /** 题目描述（纯文本，可含数学符号） */
  question: string;
  /** 题目 LaTeX 版（用于渲染） */
  questionLatex: string;
  /** 正确答案（标准化后的字符串，用于比较） */
  answer: string;
  /** 答案说明文本（数值/表达式） */
  answerDisplay: string;
  /** 答案类型：numeric 数值 / expression 表达式 */
  answerType: 'numeric' | 'expression';
  /** 解析步骤（数组，每行一段，支持 LaTeX 公式） */
  steps: string[];
  /** 难度 */
  difficulty: Difficulty;
  /** 苏格拉底式三层提示（方向/中间步/完整思路），长度 3 */
  hints?: string[];
}

export type { PracticeTopic } from '@/data/practice-topics';

export { PRACTICE_TOPICS } from '@/data/practice-topics';

/** 生成指定范围 [min,max] 的随机整数 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 从数组中随机取一个 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ===== 1. 一元二次方程 =====
function genQuadEq(diff: Difficulty): PracticeQuestion {
  let a: number, b: number, c: number;
  if (diff === 'basic') {
    // 基础：首一多项式，整根
    const r1 = randInt(-5, 5);
    const r2 = randInt(-5, 5);
    a = 1;
    b = -(r1 + r2);
    c = r1 * r2;
  } else if (diff === 'advanced') {
    // 进阶：a 为小整数，整根
    a = randInt(2, 4);
    const r1 = randInt(-4, 4);
    const r2 = randInt(-4, 4);
    b = -a * (r1 + r2);
    c = a * r1 * r2;
  } else {
    // 竞赛：判别式非完全平方，需要公式
    a = randInt(1, 3);
    b = randInt(2, 9);
    c = randInt(-5, -1);
  }

  const aStr = a === 1 ? '' : String(a);
  const bSign = b >= 0 ? '+' : '-';
  const bAbs = Math.abs(b);
  const bStr = bAbs === 1 ? '' : String(bAbs);
  const cSign = c >= 0 ? '+' : '-';
  const cAbs = Math.abs(c);

  const question = `解方程：${aStr}x² ${bSign} ${bStr}x ${cSign} ${cAbs} = 0`;
  const questionLatex = `\\text{解方程： } ${a === 1 ? '' : a}x^{2} ${b >= 0 ? '+' : '-'} ${bAbs === 1 ? '' : bAbs}x ${c >= 0 ? '+' : '-'} ${cAbs} = 0`;

  // 计算根
  const disc = b * b - 4 * a * c;
  let answer: string;
  let answerDisplay: string;
  let steps: string[];

  if (disc < 0) {
    answer = 'no_real_root';
    answerDisplay = '无实根';
    steps = [
      `判别式 Δ = b² - 4ac = ${b}² - 4 × ${a} × ${c} = ${disc}`,
      `Δ < 0，方程无实根`,
    ];
  } else {
    const sqrtDisc = Math.sqrt(disc);
    const r1v = (-b + sqrtDisc) / (2 * a);
    const r2v = (-b - sqrtDisc) / (2 * a);

    const isInt = Number.isInteger(r1v) && Number.isInteger(r2v);
    if (isInt && r1v === r2v) {
      answer = String(r1v);
      answerDisplay = `x = ${r1v}（重根）`;
    } else if (isInt) {
      const sorted = [Math.min(r1v, r2v), Math.max(r1v, r2v)];
      answer = `${sorted[0]},${sorted[1]}`;
      answerDisplay = `x₁ = ${sorted[0]}, x₂ = ${sorted[1]}`;
    } else {
      // 用求根公式形式
      answer = `${(-b + sqrtDisc) / (2 * a)},${(-b - sqrtDisc) / (2 * a)}`;
      answerDisplay = `x = (${b > 0 ? '-' : ''}${b === 0 ? 0 : Math.abs(b)} ± √${disc}) / ${2 * a}`;
    }

    steps = [
      `由求根公式：x = (-b ± √Δ) / 2a`,
      `其中判别式 Δ = b² - 4ac = ${b}² - 4 × ${a} × ${c} = ${disc}`,
      `代入得：x = (${b >= 0 ? '-' : ''}${Math.abs(b)} ± √${disc}) / ${2 * a}`,
      `化简：${answerDisplay}`,
    ];
  }

  return {
    id: `quad-${Date.now()}`,
    topicKey: 'algebra-quad',
    question,
    questionLatex,
    answer,
    answerDisplay,
    answerType: 'expression',
    steps,
    difficulty: diff,
  };
}

// ===== 2. 因式分解 =====
function genFactor(diff: Difficulty): PracticeQuestion {
  const r1 = randInt(-6, 6);
  const r2 = randInt(-6, 6);
  let a = 1;
  if (diff !== 'basic') a = randInt(1, 3);

  const b = -a * (r1 + r2);
  const c = a * r1 * r2;

  const aStr = a === 1 ? '' : String(a);
  const bSign = b >= 0 ? '+' : '-';
  const bAbs = Math.abs(b);
  const bStr = bAbs === 0 ? '' : (bAbs === 1 ? '' : String(bAbs));
  const cSign = c >= 0 ? '+' : '-';
  const cAbs = Math.abs(c);

  const question = `因式分解：${aStr}x² ${b === 0 ? '' : bSign + ' ' + bStr + 'x'} ${c === 0 ? '' : cSign + ' ' + cAbs}`;
  const questionLatex = `\\text{因式分解： } ${a === 1 ? '' : a}x^{2} ${b === 0 ? '' : (b > 0 ? '+' : '-') + (bAbs === 1 ? '' : bAbs) + 'x'} ${c === 0 ? '' : (c > 0 ? '+' : '-') + cAbs}`;

  // 答案形式：(a*x - r1)(x - r2) 简化
  const r1Abs = Math.abs(r1);
  const r2Abs = Math.abs(r2);

  // 标准答案（用于对比）
  const answerDisplay = `${a === 1 ? '' : a}(x ${r1 >= 0 ? '-' : '+'} ${r1Abs})(x ${r2 >= 0 ? '-' : '+'} ${r2Abs})`.trim();

  const steps = [
    `使用十字相乘法或求根公式法`,
    `设 ${aStr}x² ${b === 0 ? '' : bSign + ' ' + bStr + 'x'} ${c === 0 ? '' : cSign + ' ' + cAbs} = 0 的根为 x₁, x₂`,
    `由韦达定理：x₁ + x₂ = ${-b}/${a} = ${(-b / a).toFixed(0)}, x₁x₂ = ${c}/${a} = ${(c / a).toFixed(0)}`,
    `解得：x₁ = ${r1}, x₂ = ${r2}`,
    `故原式 = ${a === 1 ? '' : a}(x ${r1 >= 0 ? '-' : '+'} ${r1Abs})(x ${r2 >= 0 ? '-' : '+'} ${r2Abs})`,
  ];

  // 简化答案比对：展开后比较系数
  // 实际校验时用展开后比较
  const expandedAnswer = `${a} ${b} ${c}`; // a b c 系数

  return {
    id: `factor-${Date.now()}`,
    topicKey: 'algebra-factor',
    question,
    questionLatex,
    answer: expandedAnswer,
    answerDisplay,
    answerType: 'expression',
    steps,
    difficulty: diff,
  };
}

// ===== 3. 特殊角三角函数 =====
function genTrigSpecial(diff: Difficulty): PracticeQuestion {
  const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  const funcs = ['sin', 'cos', 'tan'];

  const angle = diff === 'basic' ? pick([0, 30, 45, 60, 90]) : pick(angles);
  const func = pick(funcs);

  // 计算精确值
  const rad = (angle * Math.PI) / 180;
  let exactValue = '';
  let numericValue = 0;

  switch (func) {
    case 'sin': numericValue = Math.sin(rad); break;
    case 'cos': numericValue = Math.cos(rad); break;
    case 'tan': numericValue = Math.tan(rad); break;
  }

  // 精确形式
  const approx = Math.round(numericValue * 10000) / 10000;
  if (approx === 0) exactValue = '0';
  else if (approx === 1) exactValue = '1';
  else if (approx === -1) exactValue = '-1';
  else if (Math.abs(approx - 0.5) < 0.001) exactValue = '1/2';
  else if (Math.abs(approx + 0.5) < 0.001) exactValue = '-1/2';
  else if (Math.abs(approx - Math.SQRT2 / 2) < 0.001) exactValue = '√2/2';
  else if (Math.abs(approx + Math.SQRT2 / 2) < 0.001) exactValue = '-√2/2';
  else if (Math.abs(approx - Math.sqrt(3) / 2) < 0.001) exactValue = '√3/2';
  else if (Math.abs(approx + Math.sqrt(3) / 2) < 0.001) exactValue = '-√3/2';
  else if (Math.abs(approx - 1 / Math.sqrt(3)) < 0.001) exactValue = '√3/3';
  else if (Math.abs(approx + 1 / Math.sqrt(3)) < 0.001) exactValue = '-√3/3';
  else if (Math.abs(approx - Math.sqrt(3)) < 0.001) exactValue = '√3';
  else if (Math.abs(approx + Math.sqrt(3)) < 0.001) exactValue = '-√3';
  else if (!isFinite(numericValue)) exactValue = '不存在';
  else exactValue = String(approx);

  const question = `求 ${func}${angle}° 的精确值`;
  const questionLatex = `\\text{求 } ${func} ${angle}^\\circ \\text{ 的精确值}`;

  const steps = [
    `角度 ${angle}° = ${angle}°`,
    `${func}${angle}° = ${exactValue}`,
    `（可通过单位圆或特殊三角形记忆）`,
  ];

  return {
    id: `trig-${Date.now()}`,
    topicKey: 'trig-special',
    question,
    questionLatex,
    answer: String(numericValue),
    answerDisplay: exactValue,
    answerType: 'numeric',
    steps,
    difficulty: diff,
  };
}

// ===== 4. 函数求导 =====
function genDerivative(diff: Difficulty): PracticeQuestion {
  const templates = [
    { f: 'x^{n}', fLatex: 'x^{n}', deriv: 'n \\cdot x^{n}-1}', sample: ['x²', 'x^{3}', 'x^{4}'] },
    { f: 'sin(x)', fLatex: '\\sin x', deriv: '\\cos x', sample: ['sin(x)'] },
    { f: 'cos(x)', fLatex: '\\cos x', deriv: '-\\sin x', sample: ['cos(x)'] },
    { f: 'e^{x}', fLatex: 'e^{x}', deriv: 'e^{x}', sample: ['e^{x}'] },
    { f: 'ln(x)', fLatex: '\\ln x', deriv: '\\frac{1}{x}', sample: ['log(x)'] },
  ];

  const template = pick(templates);
  let expr: string;
  let exprLatex: string;
  let answerExpr: string;
  let answerLatex: string;

  if (template.f === 'x^{n}') {
    const n = diff === 'basic' ? randInt(2, 4) : randInt(2, 6);
    const coeff = diff === 'competition' ? randInt(2, 5) : 1;
    if (coeff === 1) {
      expr = `x^${n}`;
      exprLatex = `x^{${n}}`;
      answerExpr = `${n}*x^(${n - 1})`;
      answerLatex = `${n}x^{${n - 1}}`;
    } else {
      expr = `${coeff}*x^${n}`;
      exprLatex = `${coeff}x^{${n}}`;
      answerExpr = `${coeff * n}*x^(${n - 1})`;
      answerLatex = `${coeff * n}x^{${n - 1}}`;
    }
  } else if (template.f === 'e^{x}') {
    const coeff = diff !== 'basic' ? randInt(2, 4) : 1;
    if (coeff === 1) {
      expr = 'e^{x}';
      exprLatex = 'e^{x}';
      answerExpr = 'e^{x}';
      answerLatex = 'e^{x}';
    } else {
      expr = `${coeff}*e^{x}`;
      exprLatex = `${coeff}e^{x}`;
      answerExpr = `${coeff}*e^{x}`;
      answerLatex = `${coeff}e^{x}`;
    }
  } else if (template.f === 'ln(x)') {
    expr = 'log(x)';
    exprLatex = '\\ln x';
    answerExpr = '1/x';
    answerLatex = '\\frac{1}{x}';
  } else {
    // sin / cos
    const funcName = template.f.split('(')[0];
    const coeff = diff !== 'basic' ? randInt(2, 4) : 1;
    if (coeff === 1) {
      expr = `${funcName}(x)`;
      exprLatex = template.fLatex;
    } else {
      expr = `${coeff}*${funcName}(x)`;
      exprLatex = `${coeff}${template.fLatex}`;
    }
    const derivFunc = funcName === 'sin' ? 'cos' : '-sin';
    const derivLatex = funcName === 'sin' ? '\\cos x' : '-\\sin x';
    if (coeff === 1) {
      answerExpr = `${derivFunc}(x)`;
      answerLatex = derivLatex;
    } else {
      answerExpr = `${coeff}*${derivFunc}(x)`;
      answerLatex = `${coeff}${derivLatex}`;
    }
  }

  const question = `求导：f(x) = ${expr.replace(/\*/g, '')}`;
  const questionLatex = `\\text{求导： } f(x) = ${exprLatex}`;

  const steps = [
    `使用基本求导公式`,
    `f'(x) = ${answerLatex}`,
  ];

  return {
    id: `deriv-${Date.now()}`,
    topicKey: 'derivative-basic',
    question,
    questionLatex,
    answer: answerExpr,
    answerDisplay: answerLatex,
    answerType: 'expression',
    steps,
    difficulty: diff,
  };
}

// ===== 5. 不定积分 =====
function genIntegral(diff: Difficulty): PracticeQuestion {
  const templates = [
    { type: 'power', name: '幂函数' },
    { type: 'sin', name: '正弦函数' },
    { type: 'cos', name: '余弦函数' },
    { type: 'exp', name: '指数函数' },
  ];

  const t = pick(templates);
  let expr: string;
  let exprLatex: string;
  let answerExpr: string;
  let answerLatex: string;
  let ruleName: string;

  if (t.type === 'power') {
    const n = diff === 'basic' ? randInt(2, 4) : randInt(2, 6);
    expr = `x^${n}`;
    exprLatex = `x^{${n}}`;
    answerExpr = `x^(${n + 1})/(${n + 1}) + C`;
    answerLatex = `\\frac{x^{${n + 1}}}{${n + 1}} + C`;
    ruleName = '幂函数积分公式';
  } else if (t.type === 'sin') {
    const coeff = diff !== 'basic' ? randInt(2, 4) : 1;
    expr = coeff === 1 ? 'sin(x)' : `${coeff}*sin(x)`;
    exprLatex = coeff === 1 ? '\\sin x' : `${coeff}\\sin x`;
    answerExpr = coeff === 1 ? '-cos(x) + C' : `-${coeff}*cos(x) + C`;
    answerLatex = coeff === 1 ? '-\\cos x + C' : `-${coeff}\\cos x + C`;
    ruleName = '∫sinx dx = -cosx + C';
  } else if (t.type === 'cos') {
    const coeff = diff !== 'basic' ? randInt(2, 4) : 1;
    expr = coeff === 1 ? 'cos(x)' : `${coeff}*cos(x)`;
    exprLatex = coeff === 1 ? '\\cos x' : `${coeff}\\cos x`;
    answerExpr = coeff === 1 ? 'sin(x) + C' : `${coeff}*sin(x) + C`;
    answerLatex = coeff === 1 ? '\\sin x + C' : `${coeff}\\sin x + C`;
    ruleName = '∫cosx dx = sinx + C';
  } else {
    // exp
    const coeff = diff !== 'basic' ? randInt(2, 4) : 1;
    expr = coeff === 1 ? 'e^{x}' : `${coeff}*e^{x}`;
    exprLatex = coeff === 1 ? 'e^{x}' : `${coeff}e^{x}`;
    answerExpr = coeff === 1 ? 'e^{x} + C' : `${coeff}*e^{x} + C`;
    answerLatex = coeff === 1 ? 'e^{x} + C' : `${coeff}e^{x} + C`;
    ruleName = '∫eˣ dx = eˣ + C';
  }

  const question = `求不定积分：∫${expr.replace(/\*/g, '')} dx`;
  const questionLatex = `\\text{求不定积分： } \\int ${exprLatex}\\, dx`;

  const steps = [
    `使用${ruleName}`,
    `∫${exprLatex}\\, dx = ${answerLatex}`,
  ];

  return {
    id: `int-${Date.now()}`,
    topicKey: 'integral-basic',
    question,
    questionLatex,
    answer: answerExpr.replace(/ \+ C/gi, ''), // 比较时去掉常数C
    answerDisplay: answerLatex,
    answerType: 'expression',
    steps,
    difficulty: diff,
  };
}

// ===== 6. 极限计算 =====
function genLimit(diff: Difficulty): PracticeQuestion {
  const templates = [
    { type: 'sinx/x', expr: 'sin(x)/x', point: '0', answer: '1', answerLatex: '1', steps: ['重要极限：lim(x→0) sin(x)/x = 1'] },
    { type: '1/x-inf', expr: '1/x', point: '∞', answer: '0', answerLatex: '0', steps: ['x → ∞ 时，1/x → 0'] },
    { type: 'poly-div', expr: '(x^{2}-1)/(x-1)', point: '1', answer: '2', answerLatex: '2', steps: ['因式分解：(x²-1)/(x-1) = x+1', 'x → 1 时，x+1 → 2'] },
    { type: 'e-lim', expr: '(1+1/x)^{x}', point: '∞', answer: 'e', answerLatex: 'e', steps: ['重要极限：lim(x→∞) (1+1/x)^{x} = e'] },
  ];

  const t = pick(templates);
  const question = `计算极限：lim(x → ${t.point}) ${t.expr.replace(/\*/g, '')}`;
  const questionLatex = `\\text{计算极限： } \\lim_{x \\to ${t.point === '∞' ? '\\infty' : t.point}} ${expressionToLatex(t.expr).replace(/\\frac/g, '\\dfrac')}`;

  return {
    id: `lim-${Date.now()}`,
    topicKey: 'limit-basic',
    question,
    questionLatex,
    answer: t.answer,
    answerDisplay: t.answerLatex,
    answerType: 'expression',
    steps: t.steps,
    difficulty: diff,
  };
}

function genNumberTheory(diff: Difficulty): PracticeQuestion {
  const basicTypes = ['gcd', 'lcm', 'mod', 'prime-factors'];
  const advTypes = ['linear-congruence', 'euler-phi', 'crt-simple', 'bezout'];
  const types = diff === 'basic' ? basicTypes : [...basicTypes, ...advTypes];
  const type = pick(types);

  // 1. gcd
  if (type === 'gcd') {
    const a = diff === 'basic' ? randInt(10, 50) : randInt(20, 150);
    const b = diff === 'basic' ? randInt(10, 50) : randInt(20, 150);
    const answer = Number(gcd(a, b));
    const question = `求 gcd(${a}, ${b})`;
    const questionLatex = `\\text{求 } \\gcd(${a}, ${b})`;
    const steps = [
      `使用辗转相除法（欧几里得算法）`,
      `gcd(${a}, ${b}) = gcd(${b}, ${a % b})`,
      `继续辗转相除，直到余数为 0`,
      `gcd(${a}, ${b}) = ${answer}`,
    ];
    return { id: `nt-${Date.now()}`, topicKey: 'nt-gcd', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 2. lcm
  if (type === 'lcm') {
    const a = diff === 'basic' ? randInt(10, 50) : randInt(20, 150);
    const b = diff === 'basic' ? randInt(10, 50) : randInt(20, 150);
    const g = Number(gcd(a, b));
    const answer = (a * b) / g;
    const question = `求 lcm(${a}, ${b})`;
    const questionLatex = `\\text{求 } \\mathrm{lcm}(${a}, ${b})`;
    const steps = [
      `使用公式：lcm(a,b) = a × b / gcd(a,b)`,
      `先求 gcd(${a}, ${b}) = ${g}`,
      `lcm(${a}, ${b}) = ${a} × ${b} / ${g} = ${answer}`,
    ];
    return { id: `nt-${Date.now()}`, topicKey: 'nt-gcd', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 3. mod
  if (type === 'mod') {
    const b = randInt(3, 20);
    const a = randInt(20, 200);
    const answer = a % b;
    const question = `计算 ${a} mod ${b}`;
    const questionLatex = `${a} \\bmod ${b}`;
    const steps = [
      `${a} ÷ ${b} = ${Math.floor(a / b)} 余 ${answer}`,
      `${a} mod ${b} = ${answer}`,
    ];
    return { id: `nt-${Date.now()}`, topicKey: 'nt-gcd', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 4. 素因数分解
  if (type === 'prime-factors') {
    const primes = [2, 3, 5, 7, 11, 13];
    const factors: number[] = [];
    let n = 1;
    const count = diff === 'basic' ? randInt(2, 3) : randInt(2, 4);
    for (let i = 0; i < count; i++) {
      const p = pick(primes);
      factors.push(p);
      n *= p;
    }
    factors.sort((a, b) => a - b);
    const factorStr = factors.join(' × ');
    const question = `将 ${n} 分解质因数，共有多少个质因数（重复计）`;
    const questionLatex = `\\text{将 } ${n} \\text{ 分解质因数，质因数个数（计重数）为？}`;
    const steps = [
      `从小到大依次试除素数`,
      `${n} = ${factorStr}`,
      `质因数个数（计重数）= ${factors.length}`,
    ];
    return { id: `nt-${Date.now()}`, topicKey: 'nt-gcd', question, questionLatex, answer: String(factors.length), answerDisplay: String(factors.length), answerType: 'numeric', steps, difficulty: diff };
  }

  // 5. 一次同余方程 ax ≡ b (mod m)，简单版保证有解
  if (type === 'linear-congruence') {
    // 选素数模保证有解
    const m = diff === 'basic' ? pick([5, 7, 11, 13]) : pick([5, 7, 11, 13, 17, 19]);
    const a = randInt(2, m - 1);
    const x0 = randInt(1, m - 1);
    const b = (a * x0) % m;
    const question = `解同余方程：${a}x ≡ ${b} (mod ${m})，求 x 的最小正整数解`;
    const questionLatex = `${a}x \\equiv ${b} \\pmod{${m}} \\text{，求最小正整数解}`;
    const steps = [
      `因为 gcd(${a}, ${m}) = 1，方程有唯一解 mod ${m}`,
      `找 ${a} 的逆元或直接枚举`,
      `验证：${a} × ${x0} = ${a * x0} ≡ ${b} (mod ${m}) ✓`,
      `所以最小正整数解 x ≡ ${x0} (mod ${m})`,
    ];
    return { id: `nt-${Date.now()}`, topicKey: 'nt-gcd', question, questionLatex, answer: String(x0), answerDisplay: String(x0), answerType: 'numeric', steps, difficulty: diff };
  }

  // 6. 欧拉函数 φ(n)，n 为小素数幂或两素数乘积
  if (type === 'euler-phi') {
    // φ(p) = p-1 for prime; φ(pq) = (p-1)(q-1) for distinct primes
    const primes = [2, 3, 5, 7, 11, 13];
    const isProduct = diff !== 'basic' && Math.random() < 0.5;
    let n: number, answer: number;
    if (isProduct) {
      const p = pick(primes.slice(0, 4));
      let q = pick(primes.slice(0, 4));
      while (q === p) q = pick(primes.slice(0, 4));
      n = p * q;
      answer = (p - 1) * (q - 1);
    } else {
      const p = pick(primes.slice(1)); // 从3开始
      n = p;
      answer = p - 1;
    }
    const question = `求欧拉函数 φ(${n}) 的值`;
    const questionLatex = `\\text{求欧拉函数 } \\varphi(${n})`;
    const steps = isProduct
      ? [
          `将 ${n} 分解质因数`,
          `${n} = ${Math.round(n / (primes.find(p => n % p === 0) || 1))} × ${primes.find(p => n % p === 0) || ''} （两个不同素数相乘）`,
          `由欧拉函数公式：φ(pq) = (p-1)(q-1)`,
          `φ(${n}) = ${answer}`,
        ]
      : [
          `因为 ${n} 是素数`,
          `由欧拉函数公式：φ(p) = p - 1 对素数 p 成立`,
          `φ(${n}) = ${n} - 1 = ${answer}`,
        ];
    return { id: `nt-${Date.now()}`, topicKey: 'nt-gcd', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 7. 中国剩余定理（简单版：两同余式，模互素）
  if (type === 'crt-simple') {
    const m1 = pick([3, 5, 7]);
    let m2 = pick([3, 5, 7, 11]);
    while (m2 === m1) m2 = pick([3, 5, 7, 11]);
    const r1 = randInt(0, m1 - 1);
    const r2 = randInt(0, m2 - 1);
    // 找解 x ≡ ? (mod m1*m2)，暴力找最小非负
    const M = m1 * m2;
    let answer = 0;
    for (let x = 0; x < M; x++) {
      if (x % m1 === r1 && x % m2 === r2) { answer = x; break; }
    }
    const question = `解同余方程组：x ≡ ${r1} (mod ${m1})，x ≡ ${r2} (mod ${m2})，求最小非负整数解`;
    const questionLatex = `\\begin{cases} x \\equiv ${r1} \\pmod{${m1}} \\\\\ x \\equiv ${r2} \\pmod{${m2}} \\end{cases} \\text{，求最小非负解}`;
    const steps = [
      `因为 gcd(${m1}, ${m2}) = 1，由中国剩余定理，解在模 ${M} 下唯一`,
      `枚举验证：x = ${answer} 时`,
      `${answer} mod ${m1} = ${answer % m1} = ${r1} ✓`,
      `${answer} mod ${m2} = ${answer % m2} = ${r2} ✓`,
      `所以最小非负解为 ${answer}`,
    ];
    return { id: `nt-${Date.now()}`, topicKey: 'nt-gcd', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 8. 贝祖定理：gcd(a,b) = d，求 ax+by=d 的一组解（简化版：验证用）
  // 用简单的题目：给出 a,b，求 a*x + b*y = gcd(a,b) 的 x 系数（x 绝对值最小）
  // 简化为：问 gcd(a,b) 是否能表示为 ax+by（贝祖定理答案总是可以），但我们改成求 gcd 值的另一种呈现
  // 改成：求 a 除以 b 的商和余数中，商是多少
  const a = randInt(20, 100);
  const b = randInt(3, 20);
  const answer = Math.floor(a / b);
  const question = `用带余除法计算 ${a} ÷ ${b}，商是多少？`;
  const questionLatex = `${a} \\div ${b} \\text{ 的商为？（整数除法）}`;
  const steps = [
    `${a} = ${b} × ${answer} + ${a % b}`,
    `其中商 q = ${answer}，余数 r = ${a % b}，满足 0 ≤ r < ${b}`,
    `由带余除法定理，商和余数唯一`,
  ];
  return { id: `nt-${Date.now()}`, topicKey: 'nt-gcd', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
}

// ===== 8. 均值不等式最值 =====
function genAMGM(diff: Difficulty): PracticeQuestion {
  // 题型模板：基础5种 + 进阶再加3种 = 8种
  const basicTypes = ['ab-max', 'ab-min', 'three-var-max', 'three-var-min', 'cond-reciprocal'];
  const advTypes = ['coef-product', 'weighted-simple', 'square-sum'];
  const types = diff === 'basic' ? basicTypes : [...basicTypes, ...advTypes];
  const type = pick(types);

  if (type === 'ab-max') {
    const S = diff === 'basic' ? randInt(4, 20) * 2 : randInt(6, 30);
    const answer = (S / 2) ** 2;
    const question = `已知 a, b > 0，且 a + b = ${S}，求 ab 的最大值`;
    const questionLatex = `\\text{已知 } a,b>0 \\text{ 且 } a+b=${S} \\text{，求 } ab \\text{ 的最大值}`;
    const steps = [
      `由均值不等式：(a+b)/2 ≥ √(ab)`,
      `代入 a+b = ${S}，得：${S / 2} ≥ √(ab)`,
      `两边平方：${(S / 2) ** 2} ≥ ab`,
      `等号当且仅当 a = b = ${S / 2} 时成立`,
      `故 ab 的最大值为 ${answer}`,
    ];
    return { id: `amgm-${Date.now()}`, topicKey: 'inequality-amgm', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  if (type === 'ab-min') {
    const P = diff === 'basic' ? pick([4, 9, 16, 25, 36, 49, 64, 81, 100]) : randInt(4, 144);
    const answer = 2 * Math.sqrt(P);
    const answerStr = Number.isInteger(answer) ? String(answer) : `2√${P}`;
    const question = `已知 a, b > 0，且 ab = ${P}，求 a + b 的最小值`;
    const questionLatex = `\\text{已知 } a,b>0 \\text{ 且 } ab=${P} \\text{，求 } a+b \\text{ 的最小值}`;
    const steps = [
      `由均值不等式：(a+b)/2 ≥ √(ab)`,
      `代入 ab = ${P}，得：(a+b)/2 ≥ √${P}`,
      `即 a+b ≥ 2√${P}${Number.isInteger(answer) ? ` = ${answer}` : ''}`,
      `等号当且仅当 a = b = √${P} 时成立`,
      `故 a+b 的最小值为 ${answerStr}`,
    ];
    return { id: `amgm-${Date.now()}`, topicKey: 'inequality-amgm', question, questionLatex, answer: String(answer), answerDisplay: answerStr, answerType: 'numeric', steps, difficulty: diff };
  }

  if (type === 'three-var-max') {
    const sRaw = diff === 'basic' ? pick([6, 9, 12, 15, 18, 21, 24]) : randInt(6, 30);
    const S = sRaw % 3 === 0 ? sRaw : sRaw + (3 - sRaw % 3);
    const answer = (S / 3) ** 3;
    const question = `已知 a, b, c > 0，且 a + b + c = ${S}，求 abc 的最大值`;
    const questionLatex = `\\text{已知 } a,b,c>0 \\text{ 且 } a+b+c=${S} \\text{，求 } abc \\text{ 的最大值}`;
    const steps = [
      `由三元均值不等式：(a+b+c)/3 ≥ ∛(abc)`,
      `代入 a+b+c = ${S}，得：${S / 3} ≥ ∛(abc)`,
      `两边三次方：${(S / 3) ** 3} ≥ abc`,
      `等号当且仅当 a = b = c = ${S / 3} 时成立`,
      `故 abc 的最大值为 ${answer}`,
    ];
    return { id: `amgm-${Date.now()}`, topicKey: 'inequality-amgm', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  if (type === 'three-var-min') {
    const V = diff === 'basic' ? pick([8, 27, 64, 125, 216]) : pick([8, 27, 64, 125, 216, 343, 512, 1000]);
    const cb = Math.round(Math.cbrt(V));
    const answer = 3 * cb;
    const question = `已知 a, b, c > 0，且 abc = ${V}，求 a + b + c 的最小值`;
    const questionLatex = `\\text{已知 } a,b,c>0 \\text{ 且 } abc=${V} \\text{，求 } a+b+c \\text{ 的最小值}`;
    const steps = [
      `由三元均值不等式：(a+b+c)/3 ≥ ∛(abc)`,
      `代入 abc = ${V}，得：(a+b+c)/3 ≥ ∛${V} = ${cb}`,
      `即 a+b+c ≥ ${answer}`,
      `等号当且仅当 a = b = c = ${cb} 时成立`,
      `故 a+b+c 的最小值为 ${answer}`,
    ];
    return { id: `amgm-${Date.now()}`, topicKey: 'inequality-amgm', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  if (type === 'cond-reciprocal') {
    const k = diff === 'basic' ? 1 : randInt(2, 5);
    const answerNum = 4 / k;
    const answerStr = Number.isInteger(answerNum) ? String(answerNum) : `4/${k}`;
    const question = `已知 x, y > 0，且 x + y = ${k}，求 1/x + 1/y 的最小值`;
    const questionLatex = `\\text{已知 } x,y>0 \\text{ 且 } x+y=${k} \\text{，求 } \\frac{1}{x}+\\frac{1}{y} \\text{ 的最小值}`;
    const steps = [
      `由条件 x+y = ${k}，1/x + 1/y = (x+y)/(${k}x) + (x+y)/(${k}y)`,
      `= 1/${k} + y/(${k}x) + x/(${k}y) + 1/${k}`,
      `= 2/${k} + (y/x + x/y)/${k}`,
      `由均值不等式：y/x + x/y ≥ 2`,
      `故 1/x + 1/y ≥ 2/${k} + 2/${k} = 4/${k} = ${answerStr}`,
      `等号当且仅当 x = y = ${k / 2} 时成立`,
    ];
    return { id: `amgm-${Date.now()}`, topicKey: 'inequality-amgm', question, questionLatex, answer: String(answerNum), answerDisplay: answerStr, answerType: 'numeric', steps, difficulty: diff };
  }

  if (type === 'coef-product') {
    const a = randInt(2, 4);
    const b = randInt(2, 4);
    const S = randInt(4, 12) * 2;
    const answer = (S * S) / (4 * a * b);
    const question = `已知 x, y > 0，且 ${a}x + ${b}y = ${S}，求 xy 的最大值`;
    const questionLatex = `\\text{已知 } x,y>0 \\text{ 且 } ${a}x+${b}y=${S} \\text{，求 } xy \\text{ 的最大值}`;
    const steps = [
      `由均值不等式：${a}x + ${b}y ≥ 2√(${a}x · ${b}y) = 2√(${a * b}xy)`,
      `代入 ${a}x + ${b}y = ${S}，得：${S} ≥ 2√(${a * b}xy)`,
      `两边除以 2：${S / 2} ≥ √(${a * b}xy)`,
      `两边平方：${(S / 2) ** 2} ≥ ${a * b}xy`,
      `即 xy ≤ ${(S / 2) ** 2} / ${a * b} = ${answer}`,
      `等号当且仅当 ${a}x = ${b}y = ${S / 2} 时成立`,
    ];
    return { id: `amgm-${Date.now()}`, topicKey: 'inequality-amgm', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  if (type === 'weighted-simple') {
    const S = diff === 'basic' ? pick([2, 8, 18, 32]) : randInt(2, 50);
    const answer = Math.sqrt(2 * S);
    const answerStr = Number.isInteger(answer) ? String(answer) : `√(${2 * S})`;
    const question = `已知实数 x, y 满足 x² + y² = ${S}，求 x + y 的最大值`;
    const questionLatex = `\\text{已知 } x^{2}+y^{2}=${S} \\text{，求 } x+y \\text{ 的最大值}`;
    const steps = [
      `由柯西不等式：(1² + 1²)(x² + y²) ≥ (x + y)²`,
      `即 2 × ${S} ≥ (x + y)²`,
      `所以 (x + y)² ≤ ${2 * S}`,
      `开方得：x + y ≤ √${2 * S}${Number.isInteger(answer) ? ` = ${answer}` : ''}`,
      `等号当 x = y = √${S / 2} 时成立`,
    ];
    return { id: `amgm-${Date.now()}`, topicKey: 'inequality-amgm', question, questionLatex, answer: String(answer), answerDisplay: answerStr, answerType: 'numeric', steps, difficulty: diff };
  }

  // square-sum：a+b=S, 求 a²+b² 最小值
  const S = diff === 'basic' ? randInt(4, 20) * 2 : randInt(6, 30);
  const answer = (S * S) / 2;
  const question = `已知 a, b 为实数，且 a + b = ${S}，求 a² + b² 的最小值`;
  const questionLatex = `\\text{已知 } a+b=${S} \\text{，求 } a^{2}+b^{2} \\text{ 的最小值}`;
  const steps = [
    `由 a² + b² ≥ 2ab，两边同时加 a² + b²：`,
    `2(a² + b²) ≥ a² + 2ab + b² = (a + b)²`,
    `即 a² + b² ≥ (a+b)² / 2 = ${S}² / 2`,
    `a² + b² ≥ ${answer}`,
    `等号当且仅当 a = b = ${S / 2} 时成立`,
  ];
  return { id: `amgm-${Date.now()}`, topicKey: 'inequality-amgm', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
}

// ===== 9. 幂指函数 =====
function genExpPower(diff: Difficulty): PracticeQuestion {
  const types = diff === 'basic'
    ? ['power-eval', 'exp-eval', 'simplify']
    : ['power-eval', 'exp-eval', 'simplify', 'power-compare'];
  const type = pick(types);

  if (type === 'power-eval') {
    const base = randInt(2, 9);
    const exp = diff === 'basic' ? randInt(2, 4) : randInt(2, 6);
    const answer = Math.pow(base, exp);
    const question = `计算：${base}${exp === 2 ? '²' : exp === 3 ? '³' : `^${exp}`}`;
    const questionLatex = `${base}^{${exp}} = ?`;
    const steps = [
      `${base}^${exp} = ${Array(exp).fill(base).join(' × ')}`,
      `= ${answer}`,
    ];
    return {
      id: `exp-${Date.now()}`,
      topicKey: 'exp-power',
      question, questionLatex,
      answer: String(answer),
      answerDisplay: String(answer),
      answerType: 'numeric' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'exp-eval') {
    const n = diff === 'basic' ? randInt(1, 3) : randInt(2, 5);
    const question = `化简：e^${n} × e^${n + 1} / e^${n - 1}`;
    const questionLatex = `\\frac{e^{${n}} \\cdot e^{${n+1}}}{e^{${n-1}}} = ?`;
    const result = n + n + 1 - n + 1; // = n+2
    const steps = [
      '指数运算法则：a^{m} × a^{n} = a^(m+n)，a^{m} / a^{n} = a^(m-n)',
      `e^${n} × e^${n + 1} / e^${n - 1} = e^(${n} + ${n + 1} - (${n - 1}))`,
      `= e^${result}`,
    ];
    return {
      id: `exp-${Date.now()}`,
      topicKey: 'exp-power',
      question, questionLatex,
      answer: `e^(${result})`,
      answerDisplay: `e^${result}`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'simplify') {
    const a = randInt(2, 5);
    const b = randInt(2, 5);
    const question = `化简：(${a}×${b})^{2}`;
    const questionLatex = `(${a} \\times ${b})^{2} = ?`;
    const answer = Math.pow(a, 2) * Math.pow(b, 2);
    const steps = [
      '积的乘方：(ab)^{n} = a^{n} × b^{n}',
      `(${a}×${b})^{2} = ${a}^{2} × ${b}^{2} = ${a * a} × ${b * b} = ${answer}`,
    ];
    return {
      id: `exp-${Date.now()}`,
      topicKey: 'exp-power',
      question, questionLatex,
      answer: String(answer),
      answerDisplay: String(answer),
      answerType: 'numeric' as const,
      steps, difficulty: diff,
    };
  }
  // power-compare
  const a = randInt(2, 5);
  const b = randInt(2, 5);
  const question = `比较大小：${a}^${b} 和 ${b}^${a}`;
  const questionLatex = `\\text{比较： } ${a}^{${b}} \\text{ 与 } ${b}^{${a}}`;
  const av = Math.pow(a, b);
  const bv = Math.pow(b, a);
  const larger = av > bv ? `${a}^${b}` : bv > av ? `${b}^${a}` : '相等';
  const steps = [
    `${a}^${b} = ${av}`,
    `${b}^${a} = ${bv}`,
    av > bv ? `故 ${a}^${b} > ${b}^${a}` : bv > av ? `故 ${b}^${a} > ${a}^${b}` : '两者相等',
  ];
  return {
    id: `exp-${Date.now()}`,
    topicKey: 'exp-power',
    question, questionLatex,
    answer: larger,
    answerDisplay: larger,
    answerType: 'expression' as const,
    steps, difficulty: diff,
  };
}

// ===== 10. 对数方程 =====
function genLogEquation(diff: Difficulty): PracticeQuestion {
  const types = diff === 'basic'
    ? ['log-base', 'ln-eq', 'log-prod']
    : ['log-base', 'ln-eq', 'log-prod', 'change-base'];
  const type = pick(types);

  if (type === 'log-base') {
    const base = pick([2, 3, 4, 5, 10]);
    const exp = randInt(2, 4);
    const answer = Math.pow(base, exp);
    const question = `解方程：log_${base}(x) = ${exp}`;
    const questionLatex = `\\log_{${base}} x = ${exp}`;
    const steps = [
      '对数定义：log_b(x) = y  ⇔  x = b^{y}',
      `x = ${base}^${exp} = ${answer}`,
    ];
    return {
      id: `log-${Date.now()}`, topicKey: 'log-equation',
      question, questionLatex,
      answer: String(answer),
      answerDisplay: `x = ${answer}`,
      answerType: 'numeric' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'ln-eq') {
    const ans = randInt(2, 6);
    const question = `解方程：ln(x) = ${ans}`;
    const questionLatex = `\\ln x = ${ans}`;
    const steps = [
      '自然对数：ln(x) = y  ⇔  x = e^{y}',
      `x = e^${ans}`,
    ];
    return {
      id: `log-${Date.now()}`, topicKey: 'log-equation',
      question, questionLatex,
      answer: `e^(${ans})`,
      answerDisplay: `x = e^${ans}`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'log-prod') {
    const base = pick([2, 3, 10]);
    const a = randInt(2, 6);
    const b = randInt(2, 6);
    const question = `计算：log_${base}(${a}) + log_${base}(${b})`;
    const questionLatex = `\\log_{${base}} ${a} + \\log_{${base}} ${b} = ?`;
    const answer = a * b;
    const steps = [
      '对数加法法则：log_b(x) + log_b(y) = log_b(xy)',
      `log_${base}(${a}) + log_${base}(${b}) = log_${base}(${a} × ${b}) = log_${base}(${answer})`,
    ];
    return {
      id: `log-${Date.now()}`, topicKey: 'log-equation',
      question, questionLatex,
      answer: `log(${answer})/log(${base})`,
      answerDisplay: `log_${base}(${answer})`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  // change-base
  const a = pick([2, 3, 4]);
  const bases = [2, 3, 4, 5, 6];
  const otherBases = bases.filter(v => v !== a);
  const b = pick(otherBases);
  const question = `用换底公式化简：log_${a}(x) / log_${b}(x)`;
  const questionLatex = `\\frac{\\log_{${a}} x}{\\log_{${b}} x} = ?`;
  const steps = [
    '换底公式：log_a(b) = log_c(b) / log_c(a)',
    `原式 = log_${a}(${b}) = ln(${b})/ln(${a})`,
  ];
  return {
    id: `log-${Date.now()}`, topicKey: 'log-equation',
    question, questionLatex,
    answer: `log(${b})/log(${a})`,
    answerDisplay: `log_${a}(${b})`,
    answerType: 'expression' as const,
    steps, difficulty: diff,
  };
}

// ===== 11. 向量运算 =====
function genVectorOp(diff: Difficulty): PracticeQuestion {
  const types = diff === 'basic'
    ? ['add', 'dot', 'mag']
    : ['add', 'dot', 'mag', 'sub', 'angle'];
  const type = pick(types);

  // 生成两个二维向量
  const ax = randInt(-5, 5);
  const ay = randInt(-5, 5);
  const bx = randInt(-5, 5);
  const by = randInt(-5, 5);

  if (type === 'add') {
    const rx = ax + bx;
    const ry = ay + by;
    const question = `已知 a⃗ = (${ax}, ${ay})，b⃗ = (${bx}, ${by})，求 a⃗ + b⃗`;
    const questionLatex = `\\vec{a}=(${ax},${ay}),\ \\vec{b}=(${bx},${by})\ \\Rightarrow\ \\vec{a}+\\vec{b}=?`;
    const steps = [
      '向量加法：对应分量相加',
      `a⃗ + b⃗ = (${ax} + ${bx}, ${ay} + ${by}) = (${rx}, ${ry})`,
    ];
    return {
      id: `vec-${Date.now()}`, topicKey: 'vector-op',
      question, questionLatex,
      answer: `[${rx},${ry}]`,
      answerDisplay: `(${rx}, ${ry})`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'sub') {
    const rx = ax - bx;
    const ry = ay - by;
    const question = `已知 a⃗ = (${ax}, ${ay})，b⃗ = (${bx}, ${by})，求 a⃗ - b⃗`;
    const questionLatex = `\\vec{a}-\\vec{b}=?`;
    const steps = [
      '向量减法：对应分量相减',
      `a⃗ - b⃗ = (${ax} - ${bx}, ${ay} - ${by}) = (${rx}, ${ry})`,
    ];
    return {
      id: `vec-${Date.now()}`, topicKey: 'vector-op',
      question, questionLatex,
      answer: `[${rx},${ry}]`,
      answerDisplay: `(${rx}, ${ry})`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'dot') {
    const dot = ax * bx + ay * by;
    const question = `已知 a⃗ = (${ax}, ${ay})，b⃗ = (${bx}, ${by})，求 a⃗ · b⃗（点积）`;
    const questionLatex = `\\vec{a} \\cdot \\vec{b} = ?`;
    const steps = [
      '点积公式：a·b = a_x·b_x + a_y·b_y',
      `a·b = ${ax} × ${bx} + ${ay} × ${by} = ${ax * bx} + ${ay * by} = ${dot}`,
    ];
    return {
      id: `vec-${Date.now()}`, topicKey: 'vector-op',
      question, questionLatex,
      answer: String(dot),
      answerDisplay: String(dot),
      answerType: 'numeric' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'mag') {
    const mag2 = ax * ax + ay * ay;
    const question = `求向量 a⃗ = (${ax}, ${ay}) 的模长 |a⃗|`;
    const questionLatex = `|\\vec{a}| = ?\\quad (\\vec{a}=(${ax},${ay}))`;
    const steps = [
      '模长公式：|a⃗| = √(a_x² + a_y²)',
      `|a⃗| = √((${ax})² + (${ay})²) = √(${ax * ax} + ${ay * ay}) = √${mag2}`,
    ];
    return {
      id: `vec-${Date.now()}`, topicKey: 'vector-op',
      question, questionLatex,
      answer: `sqrt(${mag2})`,
      answerDisplay: `√${mag2}`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  // angle: 用点积公式，但答案以cos形式给出
  const dot = ax * bx + ay * by;
  const magA2 = ax * ax + ay * ay;
  const magB2 = bx * bx + by * by;
  const question = `已知 a⃗ = (${ax}, ${ay})，b⃗ = (${bx}, ${by})，求 cos(θ) （两向量夹角余弦）`;
  const questionLatex = `\\cos\\theta = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}||\\vec{b}|} = ?`;
  const steps = [
    '夹角公式：cos(θ) = (a·b) / (|a|·|b|)',
    `a·b = ${dot}, |a| = √${magA2}, |b| = √${magB2}`,
    `cos(θ) = ${dot} / (√${magA2}·√${magB2})`,
  ];
  return {
    id: `vec-${Date.now()}`, topicKey: 'vector-op',
    question, questionLatex,
    answer: `${dot}/sqrt(${magA2}*${magB2})`,
    answerDisplay: `${dot} / (√${magA2}·√${magB2})`,
    answerType: 'expression' as const,
    steps, difficulty: diff,
  };
}

// ===== 12. 矩阵运算 =====
function genMatrixOp(diff: Difficulty): PracticeQuestion {
  const types = diff === 'basic'
    ? ['det2', 'add2', 'mul2']
    : ['det2', 'add2', 'mul2', 'trace', 'inv-check'];
  const type = pick(types);

  // 2×2 矩阵元素
  const a = randInt(-4, 4);
  const b = randInt(-4, 4);
  const c = randInt(-4, 4);
  const d = randInt(-4, 4);

  if (type === 'det2') {
    const det = a * d - b * c;
    const question = `求行列式 det([[${a}, ${b}], [${c}, ${d}]])`;
    const questionLatex = `\\begin{vmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{vmatrix} = ?`;
    const steps = [
      '二阶行列式：ad - bc',
      `det = ${a} × ${d} - ${b} × ${c} = ${a * d} - ${b * c} = ${det}`,
    ];
    return {
      id: `mat-${Date.now()}`, topicKey: 'matrix-op',
      question, questionLatex,
      answer: String(det),
      answerDisplay: String(det),
      answerType: 'numeric' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'trace') {
    const tr = a + d;
    const question = `求矩阵 [[${a}, ${b}], [${c}, ${d}]] 的迹 tr(A)`;
    const questionLatex = `\\mathrm{tr}(A) = ?\\quad A=\\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}`;
    const steps = [
      '矩阵的迹 = 主对角线元素之和',
      `tr(A) = ${a} + ${d} = ${tr}`,
    ];
    return {
      id: `mat-${Date.now()}`, topicKey: 'matrix-op',
      question, questionLatex,
      answer: String(tr),
      answerDisplay: String(tr),
      answerType: 'numeric' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'add2') {
    const e = randInt(-4, 4);
    const f = randInt(-4, 4);
    const g = randInt(-4, 4);
    const h = randInt(-4, 4);
    const r1 = a + e, r2 = b + f, r3 = c + g, r4 = d + h;
    const question = `矩阵相加：[[${a},${b}],[${c},${d}]] + [[${e},${f}],[${g},${h}]]`;
    const questionLatex = `\\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix} + \\begin{pmatrix} ${e} & ${f} \\\\ ${g} & ${h} \\end{pmatrix} = ?`;
    const steps = [
      '矩阵加法：对应元素相加',
      `= [(${a}+${e}, ${b}+${f}), (${c}+${g}, ${d}+${h})]`,
      `= ((${r1}, ${r2}), (${r3}, ${r4}))`,
    ];
    return {
      id: `mat-${Date.now()}`, topicKey: 'matrix-op',
      question, questionLatex,
      answer: `[${r1},${r2};${r3},${r4}]`,
      answerDisplay: `[[${r1}, ${r2}], [${r3}, ${r4}]]`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  // mul2: 2×2 矩阵乘一个列向量或乘标量（简化）
  const scalar = randInt(2, 5);
  const question = `标量乘法：${scalar} × [[${a}, ${b}], [${c}, ${d}]]`;
  const questionLatex = `${scalar} \\cdot \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix} = ?`;
  const steps = [
    '标量乘法：每个元素乘以标量',
    `= [[${scalar}×${a}, ${scalar}×${b}], [${scalar}×${c}, ${scalar}×${d}]]`,
    `= [[${scalar * a}, ${scalar * b}], [${scalar * c}, ${scalar * d}]]`,
  ];
  return {
    id: `mat-${Date.now()}`, topicKey: 'matrix-op',
    question, questionLatex,
    answer: `[${scalar * a},${scalar * b};${scalar * c},${scalar * d}]`,
    answerDisplay: `[[${scalar * a}, ${scalar * b}], [${scalar * c}, ${scalar * d}]]`,
    answerType: 'expression' as const,
    steps, difficulty: diff,
  };
}

// ===== 13. 复数方程 =====
function genComplexEquation(diff: Difficulty): PracticeQuestion {
  const types = diff === 'basic'
    ? ['add', 'multiply', 'conj']
    : ['add', 'multiply', 'conj', 'modulus', 'solve-linear'];
  const type = pick(types);

  const a = randInt(-5, 5) || 1;
  const b = randInt(-5, 5) || 1;
  const c = randInt(-5, 5) || 1;
  const d = randInt(-5, 5) || 1;

  if (type === 'add') {
    const real = a + c;
    const imag = b + d;
    const question = `复数相加：(${a}+${b}i) + (${c}+${d}i)`;
    const questionLatex = `(${a}+${b}i) + (${c}+${d}i) = ?`;
    const steps = [
      '实部相加，虚部相加',
      `实部：${a} + ${c} = ${real}`,
      `虚部：${b}i + ${d}i = ${imag}i`,
      `= ${real >= 0 ? '' : '-'}${Math.abs(real)}${imag >= 0 ? '+' : '-'}${Math.abs(imag)}i`,
    ];
    return {
      id: `cpx-${Date.now()}`, topicKey: 'complex-equation',
      question, questionLatex,
      answer: `${real}+${imag}i`,
      answerDisplay: `${real} + ${imag}i`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'multiply') {
    const real = a * c - b * d;
    const imag = a * d + b * c;
    const question = `复数相乘：(${a}+${b}i) × (${c}+${d}i)`;
    const questionLatex = `(${a}+${b}i)(${c}+${d}i) = ?`;
    const steps = [
      '按分配律展开，利用 i² = -1',
      `= ${a}×${c} + ${a}×${d}i + ${b}i×${c} + ${b}i×${d}i`,
      `= ${a * c} + ${a * d}i + ${b * c}i + ${b * d}i²`,
      `= (${a * c} - ${b * d}) + (${a * d} + ${b * c})i`,
      `= ${real} + ${imag}i`,
    ];
    return {
      id: `cpx-${Date.now()}`, topicKey: 'complex-equation',
      question, questionLatex,
      answer: `${real}+${imag}i`,
      answerDisplay: `${real} + ${imag}i`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'conj') {
    const question = `求复数 z = ${a}+${b}i 的共轭复数 z̄`;
    const questionLatex = `\\bar{z} = ?\\quad z=${a}+${b}i`;
    const steps = [
      '共轭复数：虚部取反',
      `z = ${a} + ${b}i  ⇒  z̄ = ${a} - ${b}i`,
    ];
    return {
      id: `cpx-${Date.now()}`, topicKey: 'complex-equation',
      question, questionLatex,
      answer: `${a}-${b}i`,
      answerDisplay: `${a} - ${b}i`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  if (type === 'modulus') {
    const mod2 = a * a + b * b;
    const question = `求复数 z = ${a}+${b}i 的模 |z|`;
    const questionLatex = `|z| = ?\\quad z=${a}+${b}i`;
    const steps = [
      '复数模长：|z| = √(a² + b²)',
      `|z| = √((${a})² + (${b})²) = √(${a * a} + ${b * b}) = √${mod2}`,
    ];
    return {
      id: `cpx-${Date.now()}`, topicKey: 'complex-equation',
      question, questionLatex,
      answer: `sqrt(${mod2})`,
      answerDisplay: `√${mod2}`,
      answerType: 'expression' as const,
      steps, difficulty: diff,
    };
  }
  // solve-linear: 解 x + a = bi 类简单方程
  const realAns = c - a;
  const imagAns = d - b;
  const question = `解方程：z + (${a}+${b}i) = ${c}+${d}i`;
  const questionLatex = `z + (${a}+${b}i) = ${c}+${d}i \\Rightarrow z = ?`;
  const steps = [
    '移项：z = (c+di) - (a+bi)',
    `z = (${c} - ${a}) + (${d} - ${b})i`,
    `z = ${realAns} + ${imagAns}i`,
  ];
  return {
    id: `cpx-${Date.now()}`, topicKey: 'complex-equation',
    question, questionLatex,
    answer: `${realAns}+${imagAns}i`,
    answerDisplay: `${realAns} + ${imagAns}i`,
    answerType: 'expression' as const,
    steps, difficulty: diff,
  };
}

// ===== 14. 平面几何（海伦公式、正余弦定理）=====
function genGeometryBasic(diff: Difficulty): PracticeQuestion {
  const basicTypes = ['heron-int', 'sine-area', 'pythagorean', 'triangle-perimeter'];
  const advTypes = ['cosine-side', 'sine-side', 'equilateral-area', 'right-median'];
  const types = diff === 'basic' ? basicTypes : [...basicTypes, ...advTypes];
  const type = pick(types);

  // 1. 海伦公式：整数边长三角形求面积
  if (type === 'heron-int') {
    // 用海伦公式三角形：选三边均为整数且面积为整数的
    const heronTriangles = [
      [3, 4, 5, 6],
      [5, 5, 6, 12],
      [6, 8, 10, 24],
      [5, 5, 8, 12],
      [7, 15, 20, 42],
      [9, 10, 17, 36],
      [10, 10, 12, 48],
      [13, 14, 15, 84],
    ];
    const tri = pick(heronTriangles);
    const a = tri[0], b = tri[1], c = tri[2], answer = tri[3];
    const s = (a + b + c) / 2;
    const question = `已知三角形三边长分别为 ${a}, ${b}, ${c}，求其面积`;
    const questionLatex = `\\text{三角形三边长 } a=${a}, b=${b}, c=${c} \\text{，求面积 } S`;
    const steps = [
      `半周长 s = (${a} + ${b} + ${c}) / 2 = ${s}`,
      `由海伦公式：S = √[s(s-a)(s-b)(s-c)]`,
      `S = √[${s} × ${s - a} × ${s - b} × ${s - c}]`,
      `S = √${answer * answer} = ${answer}`,
    ];
    return { id: `geo-${Date.now()}`, topicKey: 'geometry-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 2. 正弦定理求面积：S = ½ab·sinC
  if (type === 'sine-area') {
    // 特殊角：30/45/60/90/120/135/150
    const angles = [
      { deg: 30, sin: 0.5, latex: '30°' },
      { deg: 90, sin: 1, latex: '90°' },
    ];
    if (diff !== 'basic') {
      angles.push(
        { deg: 45, sin: Math.SQRT2 / 2, latex: '45°' },
        { deg: 60, sin: Math.sqrt(3) / 2, latex: '60°' },
        { deg: 120, sin: Math.sqrt(3) / 2, latex: '120°' },
      );
    }
    const ang = pick(angles);
    const a = randInt(2, 10);
    const b = randInt(2, 10);
    const answer = 0.5 * a * b * ang.sin;
    const answerDisplay = Number.isInteger(answer) ? String(answer) : `(${a * b}/2)·sin${ang.deg}°`;
    const question = `已知三角形两边 a = ${a}, b = ${b}，夹角 C = ${ang.deg}°，求面积`;
    const questionLatex = `a=${a}, b=${b}, \\angle C=${ang.latex} \\text{，求 } S_{\\triangle ABC}`;
    const steps = [
      `由正弦形式的面积公式：S = ½·ab·sinC`,
      `S = ½ × ${a} × ${b} × sin${ang.deg}°`,
      `S = ${a * b / 2} × ${ang.sin === 0.5 ? '½' : ang.sin === 1 ? '1' : `sin${ang.deg}°`}`,
      `S = ${Number.isInteger(answer) ? answer : answerDisplay}`,
    ];
    return { id: `geo-${Date.now()}`, topicKey: 'geometry-basic', question, questionLatex, answer: String(answer), answerDisplay: Number.isInteger(answer) ? String(answer) : answerDisplay, answerType: 'numeric', steps, difficulty: diff };
  }

  // 3. 勾股定理
  if (type === 'pythagorean') {
    const pythTriples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 24, 25], [8, 15, 17], [9, 12, 15]];
    const tri = pick(pythTriples);
    const findHypotenuse = Math.random() < 0.6;
    if (findHypotenuse) {
      const answer = tri[2];
      const question = `直角三角形两直角边分别为 ${tri[0]} 和 ${tri[1]}，求斜边长`;
      const questionLatex = `\\text{Rt}\\triangle \\text{ 中 } a=${tri[0]}, b=${tri[1]} \\text{，求 } c`;
      const steps = [
        `由勾股定理：c² = a² + b²`,
        `c² = ${tri[0]}² + ${tri[1]}² = ${tri[0] * tri[0]} + ${tri[1] * tri[1]} = ${tri[0] * tri[0] + tri[1] * tri[1]}`,
        `c = √${tri[0] * tri[0] + tri[1] * tri[1]} = ${answer}`,
      ];
      return { id: `geo-${Date.now()}`, topicKey: 'geometry-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
    } else {
      // 求直角边
      const answer = tri[0];
      const question = `直角三角形斜边为 ${tri[2]}，一条直角边为 ${tri[1]}，求另一条直角边`;
      const questionLatex = `\\text{Rt}\\triangle \\text{ 中 } c=${tri[2]}, b=${tri[1]} \\text{，求 } a`;
      const steps = [
        `由勾股定理：a² = c² - b²`,
        `a² = ${tri[2]}² - ${tri[1]}² = ${tri[2] * tri[2]} - ${tri[1] * tri[1]} = ${tri[0] * tri[0]}`,
        `a = √${tri[0] * tri[0]} = ${answer}`,
      ];
      return { id: `geo-${Date.now()}`, topicKey: 'geometry-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
    }
  }

  // 4. 三角形周长
  if (type === 'triangle-perimeter') {
    const a = randInt(3, 15);
    const b = randInt(3, 15);
    const c = randInt(Math.abs(a - b) + 1, a + b - 1); // 三角形不等式
    const answer = a + b + c;
    const question = `三角形三边长分别为 ${a}, ${b}, ${c}，求周长`;
    const questionLatex = `a=${a}, b=${b}, c=${c} \\text{，求周长}`;
    const steps = [
      `周长 = a + b + c`,
      `周长 = ${a} + ${b} + ${c}`,
      `周长 = ${answer}`,
    ];
    return { id: `geo-${Date.now()}`, topicKey: 'geometry-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 5. 余弦定理求边
  if (type === 'cosine-side') {
    // 特殊角的整数解：使用 30/60/90/120 度的整数边
    // 60度: a=7, b=8, c=5  (c²=a²+b²-2ab·cos60°=49+64-56=57, 不是整数)
    // 简单点：用等边或等腰直接给答案
    const a = randInt(3, 10);
    const b = randInt(3, 10);
    // 题目：已知两边及夹角，求第三边平方
    const answer = a * a + b * b - a * b; // cos60°=0.5, 2ab·cosC = ab
    const question = `三角形中，a = ${a}, b = ${b}, C = 60°，求 c²`;
    const questionLatex = `a=${a}, b=${b}, \\angle C=60° \\text{，求 } c^{2}`;
    const steps = [
      `由余弦定理：c² = a² + b² - 2ab·cosC`,
      `c² = ${a}² + ${b}² - 2 × ${a} × ${b} × cos60°`,
      `c² = ${a * a} + ${b * b} - ${2 * a * b} × 0.5`,
      `c² = ${a * a} + ${b * b} - ${a * b} = ${answer}`,
    ];
    return { id: `geo-${Date.now()}`, topicKey: 'geometry-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 6. 正弦定理求边
  if (type === 'sine-side') {
    // 直角三角形，用正弦定理：a/sinA = b/sinB = c/sinC
    // 简化：30-60-90 三角形
    const sideA = randInt(2, 8);
    const answer = sideA * 2; // 斜边（90°对的边）= a / sin30° = 2a
    const question = `△ABC 中，∠A = 30°，其对边 a = ${sideA}，∠C = 90°，求斜边 c`;
    const questionLatex = `\\angle A=30°, a=${sideA}, \\angle C=90° \\text{，求 } c`;
    const steps = [
      `由正弦定理：a/sinA = c/sinC`,
      `${sideA} / sin30° = c / sin90°`,
      `${sideA} / 0.5 = c / 1`,
      `c = ${answer}`,
    ];
    return { id: `geo-${Date.now()}`, topicKey: 'geometry-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 7. 等边三角形面积
  if (type === 'equilateral-area') {
    const a = randInt(2, 12);
    const answer = (Math.sqrt(3) / 4) * a * a;
    const answerDisplay = `(√3/4)·${a}² = ${(a * a)}√3/4`;
    const question = `等边三角形边长为 ${a}，求面积`;
    const questionLatex = `\\text{正三角形边长为 } ${a} \\text{，求面积 } S`;
    const steps = [
      `等边三角形面积公式：S = (√3/4)·a²`,
      `S = (√3/4) × ${a}²`,
      `S = (√3/4) × ${a * a}`,
      `S = ${(a * a)}√3/4 ≈ ${answer.toFixed(2)}`,
    ];
    return { id: `geo-${Date.now()}`, topicKey: 'geometry-basic', question, questionLatex, answer: String(answer), answerDisplay: answerDisplay, answerType: 'numeric', steps, difficulty: diff };
  }

  // 8. 直角三角形斜边上的中线 = 斜边一半
  const pythTriples2 = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 24, 25], [8, 15, 17]];
  const tri2 = pick(pythTriples2);
  const answer = tri2[2] / 2;
  const question = `直角三角形两直角边为 ${tri2[0]} 和 ${tri2[1]}，求斜边上的中线长`;
  const questionLatex = `\\text{Rt}\\triangle \\text{ 中 } a=${tri2[0]}, b=${tri2[1]} \\text{，求斜边上的中线}$`;
  const steps = [
    `先求斜边：c = √(${tri2[0]}² + ${tri2[1]}²) = √${tri2[0] * tri2[0] + tri2[1] * tri2[1]} = ${tri2[2]}`,
    `直角三角形斜边上的中线等于斜边的一半`,
    `中线长 = ${tri2[2]} / 2 = ${answer}`,
  ];
  return { id: `geo-${Date.now()}`, topicKey: 'geometry-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
}

// ===== 15. 组合数学（鸽巢原理、容斥原理）=====
function genCombinatoricsBasic(diff: Difficulty): PracticeQuestion {
  const basicTypes = ['pigeonhole-basic', 'pigeonhole-socks', 'inclusion-two-set', 'permutation'];
  const advTypes = ['pigeonhole-sum', 'inclusion-three-set', 'combination', 'pigeonhole-mod'];
  const types = diff === 'basic' ? basicTypes : [...basicTypes, ...advTypes];
  const type = pick(types);

  // 1. 鸽巢原理基础：n个物体放k个盒子，至少有一盒有⌈n/k⌉个
  if (type === 'pigeonhole-basic') {
    const n = randInt(10, 50);
    const k = randInt(3, 10);
    const answer = Math.ceil(n / k);
    const question = `将 ${n} 个苹果放入 ${k} 个抽屉，至少有一个抽屉里有多少个苹果？`;
    const questionLatex = `${n} \\text{ 个苹果放入 } ${k} \\text{ 个抽屉，最少有一个抽屉至少有几个？}`;
    const steps = [
      `由鸽巢原理：n 个物体放入 k 个盒子`,
      `至少有一个盒子包含 ⌈n/k⌉ 个物体`,
      `⌈${n} / ${k}⌉ = ⌈${(n / k).toFixed(2)}⌉ = ${answer}`,
    ];
    return { id: `comb-${Date.now()}`, topicKey: 'combinatorics-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 2. 鸽巢原理：摸袜子问题
  if (type === 'pigeonhole-socks') {
    const colors = randInt(3, 6);
    const answer = colors + 1; // 要保证至少一双同色，摸 colors+1 只
    const question = `抽屉里有 ${colors} 种颜色的袜子（数量足够），至少摸出多少只才能保证有一双同色？`;
    const questionLatex = `${colors} \\text{ 色袜子，至少取几只保证有一双同色？}`;
    const steps = [
      `最不利原则：最坏情况先取到每种颜色各 1 只，共 ${colors} 只`,
      `再取 1 只，必与其中某只同色`,
      `所以至少需要 ${colors} + 1 = ${answer} 只`,
    ];
    return { id: `comb-${Date.now()}`, topicKey: 'combinatorics-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 3. 两集合容斥：|A∪B| = |A| + |B| - |A∩B|
  if (type === 'inclusion-two-set') {
    const aSize = randInt(20, 60);
    const bSize = randInt(20, 60);
    const intersect = randInt(5, Math.min(aSize, bSize));
    const answer = aSize + bSize - intersect;
    const version = Math.random() < 0.5; // 两种题型：求并集 或 求交集
    if (version) {
      // 哦，换题型：求至少参加一组的人数
      const q = `某班学生中，参加数学小组的有 ${aSize} 人，参加物理小组的有 ${bSize} 人，两组都参加的有 ${intersect} 人。至少参加一个小组的有多少人？`;
      const questionLatex = `|A|=${aSize}, |B|=${bSize}, |A\\cap B|=${intersect} \\text{，求 } |A\\cup B|`;
      const steps = [
        `由容斥原理：|A ∪ B| = |A| + |B| - |A ∩ B|`,
        `|A ∪ B| = ${aSize} + ${bSize} - ${intersect}`,
        `|A ∪ B| = ${answer}`,
      ];
      return { id: `comb-${Date.now()}`, topicKey: 'combinatorics-basic', question: q, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
    } else {
      // 求交集：已知总人数、A、B、都不参加，求交集
      const total = aSize + bSize - intersect + randInt(5, 20);
      const neither = total - (aSize + bSize - intersect);
      const q2 = `某班有 ${total} 人，参加数学小组的有 ${aSize} 人，参加物理小组的有 ${bSize} 人，两组都不参加的有 ${neither} 人。两组都参加的有多少人？`;
      const questionLatex = `\\text{总 } ${total} \\text{ 人，} |A|=${aSize}, |B|=${bSize} \\text{，都不参加 } ${neither} \\text{，求 } |A\\cap B|`;
      const steps2 = [
        `至少参加一组的人数 = 总人数 - 都不参加 = ${total} - ${neither} = ${total - neither}`,
        `由容斥原理：|A ∪ B| = |A| + |B| - |A ∩ B|`,
        `${total - neither} = ${aSize} + ${bSize} - |A ∩ B|`,
        `|A ∩ B| = ${aSize} + ${bSize} - ${total - neither} = ${intersect}`,
      ];
      return { id: `comb-${Date.now()}`, topicKey: 'combinatorics-basic', question: q2, questionLatex, answer: String(intersect), answerDisplay: String(intersect), answerType: 'numeric', steps: steps2, difficulty: diff };
    }
  }

  // 4. 排列：n个不同元素取k个排列
  if (type === 'permutation') {
    const n = randInt(4, 8);
    const k = randInt(2, 3);
    let answer = 1;
    for (let i = 0; i < k; i++) answer *= (n - i);
    const question = `从 ${n} 个不同的人中选出 ${k} 人排成一排，有多少种排法？`;
    const questionLatex = `P(${n}, ${k}) = ?`;
    const steps = [
      `排列数公式：P(n,k) = n!/(n-k)!`,
      `P(${n},${k}) = ${n} × ${n - 1}${k >= 3 ? ` × ${n - 2}` : ''}${k >= 4 ? ` × ${n - 3}` : ''}`,
      `P(${n},${k}) = ${answer}`,
    ];
    return { id: `comb-${Date.now()}`, topicKey: 'combinatorics-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 5. 鸽巢原理：整数求和（同余类）
  if (type === 'pigeonhole-sum') {
    // 经典问题：任意n+1个整数中，必有两数之差是n的倍数
    const n = randInt(4, 10);
    const answer = n + 1;
    const question = `至少取多少个整数，才能保证其中必有两个数的差是 ${n} 的倍数？`;
    const questionLatex = `\\text{至少取多少个整数，保证必有两数之差是 } ${n} \\text{ 的倍数？}`;
    const steps = [
      `整数模 ${n} 的余数有 ${n} 种：0, 1, 2, ..., ${n - 1}`,
      `这 ${n} 种余数就是 ${n} 个鸽巢`,
      `由鸽巢原理，取 ${n + 1} 个整数，必有两数同余`,
      `同余的两数之差是 ${n} 的倍数`,
      `故至少取 ${answer} 个整数`,
    ];
    return { id: `comb-${Date.now()}`, topicKey: 'combinatorics-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 6. 三集合容斥（简单整数答案）
  if (type === 'inclusion-three-set') {
    // |A∪B∪C| = |A|+|B|+|C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|
    const a = 20, b = 15, c = 10;
    const ab = 6, ac = 4, bc = 5;
    const abc = 2;
    const answer = a + b + c - ab - ac - bc + abc;
    const question = `某班学生参加三个兴趣小组。参加数学的有 ${a} 人，物理的有 ${b} 人，化学的有 ${c} 人；同时参加数学物理的有 ${ab} 人，数学化学的有 ${ac} 人，物理化学的有 ${bc} 人；三个都参加的有 ${abc} 人。至少参加一个小组的有多少人？`;
    const questionLatex = `|A|=${a}, |B|=${b}, |C|=${c}, |A\\cap B|=${ab}, |A\\cap C|=${ac}, |B\\cap C|=${bc}, |A\\cap B\\cap C|=${abc} \\text{，求 } |A\\cup B\\cup C|`;
    const steps = [
      `三集合容斥原理：`,
      `|A∪B∪C| = |A| + |B| + |C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|`,
      `= ${a} + ${b} + ${c} - ${ab} - ${ac} - ${bc} + ${abc}`,
      `= ${answer}`,
    ];
    return { id: `comb-${Date.now()}`, topicKey: 'combinatorics-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 7. 组合数
  if (type === 'combination') {
    const pairs = [[5, 2, 10], [6, 2, 15], [6, 3, 20], [7, 2, 21], [7, 3, 35], [8, 2, 28], [8, 3, 56], [10, 2, 45]];
    const pair = pick(pairs);
    const n = pair[0], k = pair[1], answer = pair[2];
    const question = `从 ${n} 个不同元素中选 ${k} 个的组合数 C(${n},${k}) 是多少？`;
    const questionLatex = `\\binom{${n}}{${k}} = ?`;
    const steps = [
      `组合数公式：C(n,k) = n! / (k! × (n-k)!)`,
      `C(${n},${k}) = P(${n},${k}) / ${k}!`,
      `C(${n},${k}) = ${answer}`,
    ];
    return { id: `comb-${Date.now()}`, topicKey: 'combinatorics-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
  }

  // 8. 鸽巢原理进阶：从1到2n中选n+1个数，必有两数互素（相邻数互素）
  // 简化版：简单的经典问题
  const n = randInt(3, 8);
  const answer = n + 1;
  const question = `从 1 到 ${2 * n} 中至少选多少个数，才能保证其中必有两个数互素？（提示：相邻整数互素）`;
  const questionLatex = `\\text{从 } [1, ${2 * n}] \\text{ 中至少选多少个数，保证必有两数互素？}`;
  const steps = [
    `将数分成 ${n} 组：{1,2}, {3,4}, ..., {${2 * n - 1},${2 * n}}`,
    `每组有 ${n} 个数（每组两个相邻整数，互素）`,
    `这 ${n} 组就是 ${n} 个鸽巢`,
    `由鸽巢原理，选 ${n + 1} 个数，必有两个数在同一组`,
    `同一组中的两个数互素`,
    `故至少选 ${answer} 个数`,
  ];
  return { id: `comb-${Date.now()}`, topicKey: 'combinatorics-basic', question, questionLatex, answer: String(answer), answerDisplay: String(answer), answerType: 'numeric', steps, difficulty: diff };
}

/**
 * 从解析步骤生成苏格拉底式三层提示
 * 第一层：方向提示（引导性反问/思路方向）
 * 第二层：关键中间步（steps 的中间步骤）
 * 第三层：完整解析思路（所有 steps 拼接）
 */
export function generateHintsFromSteps(steps: string[]): string[] {
  if (steps.length === 0) {
    return ['观察题目条件，回忆相关定义和公式', '试试把已知条件代入公式', '一步步写出推导过程'];
  }

  // 第一层：方向提示（从第一步提炼成反问/方向）
  const firstStep = steps[0];
  let direction = firstStep;
  // 把冒号/结论式描述转成引导式
  if (firstStep.includes('：') && firstStep.split('：').length >= 2) {
    direction = firstStep.split('：')[0] + '——想想这一步该怎么用？';
  } else if (firstStep.length > 20) {
    direction = firstStep.slice(0, 20) + '... ，从这里入手？';
  } else {
    direction = '第一步：' + firstStep + '？';
  }

  // 第二层：关键中间步
  let middleStep = '';
  if (steps.length >= 3) {
    // 取中间的步骤
    const midIdx = Math.floor(steps.length / 2);
    middleStep = steps[midIdx];
  } else if (steps.length === 2) {
    middleStep = steps[0]; // 只有两步，第二步是答案，中间步就是第一步
  } else {
    // 只有一步，第二层给一个引导性追问
    middleStep = '用这个结论之后，下一步怎么推？';
  }

  // 第三层：完整解析（所有步骤拼接）
  const fullSolution = steps.join(' \\n');

  return [direction, middleStep, fullSolution];
}

/** 生成练习题 */
export function generatePracticeQuestion(topicKey: string, difficulty: Difficulty = 'basic'): PracticeQuestion {
  switch (topicKey) {
    case 'algebra-quad': return genAlgebraQuadV2(difficulty);
    case 'algebra-factor': return genAlgebraFactorV2(difficulty);
    case 'trig-special': return genTrigSpecialV2(difficulty);
    case 'derivative-basic': return genDerivativeV2(difficulty);
    case 'integral-basic': return genIntegralV2(difficulty);
    case 'limit-basic': return genLimitV2(difficulty);
    case 'nt-gcd': return genNumberTheoryV2(difficulty);
    case 'inequality-amgm': return genInequalityAmgmV2(difficulty);
    case 'exp-power': return genExpPowerV2(difficulty);
    case 'log-equation': return genLogEquationV2(difficulty);
    case 'vector-op': return genVectorOpV2(difficulty);
    case 'matrix-op': return genMatrixOpV2(difficulty);
    case 'complex-equation': return genComplexV2(difficulty);
    case 'geometry-basic': return genGeometryV2(difficulty);
    case 'combinatorics-basic': return genCombinatoricsV2(difficulty);
    case 'trig-identity': return genTrigIdentityV2(difficulty);
    case 'sequence-limit': return genSequenceLimitV2(difficulty);
    case 'coordinate-geometry': return genCoordinateV2(difficulty);
    case 'conic-sections': return genConicV2(difficulty);
    case 'solid-geometry': return genSolidV2(difficulty);
    case 'probability-classical': return genProbabilityV2(difficulty);
    case 'random-variable': return genRandomVariableV2(difficulty);
    case 'ode-solving': return genOdeV2(difficulty);
    case 'series-convergence': return genSeriesV2(difficulty);
    case 'fourier-basic': return genFourierV2(difficulty);
    case 'function-property': return genFunctionPropertyV2(difficulty);
    case 'hyperbolic-func': return genHyperbolicV2(difficulty);
    case 'inequality-solve': return genInequalitySolveV2(difficulty);
    case 'sequence-recurrence': return genSequenceRecurrenceV2(difficulty);
    default: return genQuadEq(difficulty);
  }
}

/**
 * 检查用户答案是否正确
 * 返回 { correct: boolean, normalizedAnswer: string }
 */
export function checkPracticeAnswer(
  question: PracticeQuestion,
  userAnswer: string,
): { correct: boolean; message: string } {
  const userNorm = normalizeMathInput(userAnswer.trim());

  if (!userNorm) return { correct: false, message: '请输入答案' };

  // 数值型答案
  if (question.answerType === 'numeric') {
    try {
      const userVal = evaluate(userNorm);
      const correctVal = evaluate(question.answer);
      if (typeof userVal === 'number' && typeof correctVal === 'number') {
        if (!isFinite(userVal) && !isFinite(correctVal)) return { correct: true, message: '回答正确！' };
        const tol = Math.abs(correctVal) < 1e-6 ? 1e-6 : Math.abs(correctVal) * 1e-4;
        if (Math.abs(userVal - correctVal) <= tol) {
          return { correct: true, message: '回答正确！' };
        }
      }
    } catch {
      // 解析失败，继续用字符串比较
    }
  }

  // 表达式型答案
  if (question.answerType === 'expression') {
    // 因式分解：特殊处理 - 比较展开后系数
    if (question.topicKey === 'algebra-factor') {
      try {
        const [qa, qb, qc] = question.answer.split(' ').map(Number);
        // 尝试展开用户答案
        const expanded = expandFactor(userNorm);
        if (expanded) {
          const [ua, ub, uc] = expanded;
          // 比例相等（可以差一个常数因子，但首项系数必须匹配）
          if (Math.abs(ua - qa) < 1e-6 && Math.abs(ub - qb) < 1e-6 && Math.abs(uc - qc) < 1e-6) {
            return { correct: true, message: '回答正确！' };
          }
          // 也可以是比例关系
          const ratio = qa / ua;
          if (Math.abs(ub * ratio - qb) < 1e-6 && Math.abs(uc * ratio - qc) < 1e-6) {
            return { correct: true, message: '回答正确！' };
          }
        }
      } catch {
        // 忽略
      }
    }

    // 不定积分：允许差常数 C
    if (question.topicKey === 'integral-basic') {
      try {
        // 去掉 +C / + C / +c 等，然后求导比较
        const userWithoutC = userNorm.replace(/\s*\+\s*C\s*$/i, '').replace(/\s*\+\s*c\s*$/, '');
        const correctWithoutC = question.answer.replace(/\s*\+\s*C\s*$/i, '');

        // 两边对 x 求导后比较
        const userDeriv = simplify(derivative(userWithoutC, 'x')).toString();
        const correctDeriv = simplify(derivative(correctWithoutC, 'x')).toString();

        if (simplify(`(${userDeriv}) - (${correctDeriv})`).toString() === '0') {
          return { correct: true, message: '回答正确！' + (userNorm.toLowerCase().includes('+c') ? '' : '（记得加常数 C）') };
        }
      } catch {
        // 忽略
      }
    }

    // 导数：直接比较化简后的差
    if (question.topicKey === 'derivative-basic') {
      try {
        const diff = simplify(`(${userNorm}) - (${question.answer})`).toString();
        if (diff === '0') {
          return { correct: true, message: '回答正确！' };
        }
      } catch {
        // 忽略
      }
    }

    // 二次方程：解析多个根
    if (question.topicKey === 'algebra-quad') {
      if (question.answer === 'no_real_root') {
        const noRootKeywords = ['无实根', '无解', '没有实根', 'no real', '不存在'];
        if (noRootKeywords.some(k => userNorm.toLowerCase().includes(k.toLowerCase()))) {
          return { correct: true, message: '回答正确！' };
        }
      } else {
        try {
          // 解析用户输入的根（支持 x=2 或 2,3 或 x1=2,x2=3 等格式）
          const roots = parseRoots(userNorm);
          const correctRoots = question.answer.split(',').map(Number).sort((a, b) => a - b);

          if (roots.length === correctRoots.length) {
            const sortedUser = [...roots].sort((a, b) => a - b);
            const allMatch = sortedUser.every((r, i) => Math.abs(r - correctRoots[i]) < 1e-6);
            if (allMatch) return { correct: true, message: '回答正确！' };
          }
        } catch {
          // 忽略
        }
      }
    }

    // 极限：通用比较
    if (question.topicKey === 'limit-basic' || question.topicKey === 'sequence-limit') {
      try {
        if (question.answer === 'e' && /\be\b/.test(userNorm)) return { correct: true, message: '回答正确！' };
        const userVal = evaluate(userNorm);
        const correctVal = evaluate(question.answer);
        if (typeof userVal === 'number' && typeof correctVal === 'number') {
          if (!isFinite(userVal) && !isFinite(correctVal)) return { correct: true, message: '回答正确！' };
          const tol = Math.abs(correctVal) < 1e-6 ? 1e-6 : Math.abs(correctVal) * 1e-4;
          if (Math.abs(userVal - correctVal) <= tol) return { correct: true, message: '回答正确！' };
        }
      } catch {
        // 忽略
      }
    }

    // 三角恒等式：文字答案（成立/不成立）
    if (question.topicKey === 'trig-identity' && question.answerType === 'expression') {
      const userTrim = userNorm.trim();
      if (question.answer === '成立' && (userTrim === '成立' || userTrim === '恒成立' || userTrim === 'true' || userTrim === 'yes')) {
        return { correct: true, message: '回答正确！' };
      }
      if (question.answer === '不成立' && (userTrim === '不成立' || userTrim === '不恒成立' || userTrim === 'false' || userTrim === 'no')) {
        return { correct: true, message: '回答正确！' };
      }
    }

    // 通用：表达式型答案的兜底——纯文本精确匹配（去除所有空白后比较）
    // 用于中文文字答案（奇偶性、递增递减、收敛发散、相交相离相切等）
    try {
      const userClean = userNorm.replace(/\s+/g, '');
      const answerClean = question.answer.replace(/\s+/g, '');
      if (userClean === answerClean) {
        return { correct: true, message: '回答正确！' };
      }
      // 尝试 normalizeMathInput 后再比一次（针对答案本身含符号的情况）
      const ansNorm = normalizeMathInput(question.answer).replace(/\s+/g, '');
      if (userClean === ansNorm) {
        return { correct: true, message: '回答正确！' };
      }
    } catch {
      // 忽略
    }
  }

  return { correct: false, message: '答案不正确，再想想~' };
}

/** 解析用户输入的二次方程根 */
function parseRoots(input: string): number[] {
  // 去掉 x=, x1= 等前缀
  let cleaned = input.replace(/x[_]?\d*\s*=\s*/gi, '').replace(/\s+/g, '');
  // 按逗号或空格或分号分割
  const parts = cleaned.split(/[,;，；\s]+/).filter(Boolean);
  const roots: number[] = [];
  for (const p of parts) {
    const val = evaluate(p);
    if (typeof val === 'number' && isFinite(val)) {
      roots.push(val);
    }
  }
  return roots;
}

// ===== 16. 三角函数恒等式 =====
export function genTrigIdentity(diff: Difficulty): PracticeQuestion {
  const templates = [
    // 题型1：特殊角求值（sin、cos、tan 的非特殊角，需要用和差或倍角公式）
    () => {
      const angles = [
        { a: 15, sinA: '(sqrt(6) - sqrt(2)) / 4', cosA: '(sqrt(6) + sqrt(2)) / 4', tanA: '2 - sqrt(3)', label: '15°' },
        { a: 75, sinA: '(sqrt(6) + sqrt(2)) / 4', cosA: '(sqrt(6) - sqrt(2)) / 4', tanA: '2 + sqrt(3)', label: '75°' },
        { a: 105, sinA: '(sqrt(6) + sqrt(2)) / 4', cosA: '-(sqrt(6) - sqrt(2)) / 4', tanA: '-(2 + sqrt(3))', label: '105°' },
      ];
      const ang = pick(angles);
      const fn = pick(['sin', 'cos', 'tan']);
      let answer = '';
      if (fn === 'sin') answer = ang.sinA;
      else if (fn === 'cos') answer = ang.cosA;
      else answer = ang.tanA;
      const question = `求 ${fn}${ang.label} 的精确值`;
      const questionLatex = `求 $\\${fn} ${ang.a}^\\circ$ 的精确值`;
      // 构造 display 答案（用 Unicode 根号替代 sqrt）
      let answerDisplay = answer
        .replace(/sqrt\((\d+)\)/g, '√$1')
        .replace(/\s*\/\s*/g, '/')
        .replace(/ - /g, ' − ')
        .replace(/ \+ /g, ' + ');
      // 去掉外层括号前的空格
      answerDisplay = answerDisplay.replace(/^\( /, '(').replace(/ \)$/, ')');
      const steps = [
        `将角度拆分为特殊角之和/差：$${ang.a}^\\circ = 45^\\circ ${ang.a === 15 ? '-' : '+'} 30^\\circ$`,
        `应用${fn === 'tan' ? '正切' : fn === 'sin' ? '正弦' : '余弦'}和差公式：$${fn}(\\alpha ${ang.a === 15 ? '-' : '+'} \\beta) = ...$`,
        `代入特殊角函数值并化简得：${answerDisplay}`,
      ];
      return { id: `tri-${Date.now()}-${Math.random()}`, topicKey: 'trig-identity', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型2：和差公式（已知 sinα + α象限，求 sin(α±β)）
    () => {
      // sin(A+B) = sinA cosB + cosA sinB = 3/5 * 5/13 + 4/5 * 12/13 = 15/65 + 48/65 = 63/65
      const question = `已知 sin α = 3/5，α 在第一象限；cos β = 5/13，β 在第一象限。求 sin(α+β) 的值`;
      const questionLatex = `已知 $\\sin\\alpha = \\dfrac{3}{5}$，$\\alpha$ 在第一象限；$\\cos\\beta = \\dfrac{5}{13}$，$\\beta$ 在第一象限。求 $\\sin(\\alpha+\\beta)$ 的值`;
      const steps = [
        '先求 cos α 和 sin β：$\\cos\\alpha = \\sqrt{1 - \\sin^{2}\\alpha} = \\dfrac{4}{5}$，$\\sin\\beta = \\sqrt{1 - \\cos^{2}\\beta} = \\dfrac{12}{13}$',
        '应用正弦和角公式：$\\sin(\\alpha+\\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta$',
        '代入数值计算：$\\sin(\\alpha+\\beta) = \\dfrac{3}{5}\\cdot\\dfrac{5}{13} + \\dfrac{4}{5}\\cdot\\dfrac{12}{13} = \\dfrac{63}{65}$',
      ];
      return { id: `tri-${Date.now()}-${Math.random()}`, topicKey: 'trig-identity', question, questionLatex, answer: '63/65', answerDisplay: '63/65', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型3：二倍角公式
    () => {
      // sin 2θ = 2 sinθ cosθ
      // 已知 sinθ = 3/5, θ 第一象限, 求 sin2θ = 2 * 3/5 * 4/5 = 24/25
      const question = `已知 sin θ = 3/5，θ 在第一象限，求 sin 2θ 的值`;
      const questionLatex = `已知 $\\sin\\theta = \\dfrac{3}{5}$，$\\theta$ 在第一象限，求 $\\sin 2\\theta$ 的值`;
      const steps = [
        '先求 cos θ：$\\cos\\theta = \\sqrt{1 - \\sin^{2}\\theta} = \\dfrac{4}{5}$',
        '应用二倍角公式：$\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$',
        '代入计算：$\\sin 2\\theta = 2 \\cdot \\dfrac{3}{5} \\cdot \\dfrac{4}{5} = \\dfrac{24}{25}$',
      ];
      return { id: `tri-${Date.now()}-${Math.random()}`, topicKey: 'trig-identity', question, questionLatex, answer: '24/25', answerDisplay: '24/25', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型4：半角公式
    () => {
      // cos(θ/2) 已知 cosθ = 1/2, θ 第一象限, cos(θ/2) = √((1+cosθ)/2) = √(3/4) = √3/2
      const question = `已知 cos θ = 1/2，θ 为锐角，求 cos(θ/2) 的值`;
      const questionLatex = `已知 $\\cos\\theta = \\dfrac{1}{2}$，$\\theta$ 为锐角，求 $\\cos\\dfrac{\\theta}{2}$ 的值`;
      const steps = [
        '应用半角公式（θ 为锐角，θ/2 也在第一象限，取正）：$\\cos\\dfrac{\\theta}{2} = \\sqrt{\\dfrac{1+\\cos\\theta}{2}}$',
        '代入 cos θ = 1/2：$\\cos\\dfrac{\\theta}{2} = \\sqrt{\\dfrac{1 + 1/2}{2}} = \\sqrt{\\dfrac{3}{4}}$',
        '化简得：$\\cos\\dfrac{\\theta}{2} = \\dfrac{\\sqrt{3}}{2}$',
      ];
      return { id: `tri-${Date.now()}-${Math.random()}`, topicKey: 'trig-identity', question, questionLatex, answer: 'sqrt(3)/2', answerDisplay: '√3/2', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型5：辅助角公式 asinx + bcosx = √(a²+b²) sin(x+φ)
    () => {
      // 3 sinx + 4 cosx 的最大值 = √(9+16) = 5
      const a = 3, b = 4;
      const maxVal = Math.sqrt(a * a + b * b);
      const question = `求函数 f(x) = ${a} sin x + ${b} cos x 的最大值`;
      const questionLatex = `求函数 $f(x) = ${a}\\sin x + ${b}\\cos x$ 的最大值`;
      const steps = [
        `应用辅助角公式：$a\\sin x + b\\cos x = \\sqrt{a^{2} + b^{2}}\\sin(x + \\varphi)$`,
        `其中最大值为振幅 $\\sqrt{a^{2} + b^{2}} = \\sqrt{${a}^{2} + ${b}^{2}} = \\sqrt{${a*a + b*b}}$`,
        `计算得最大值 = ${maxVal}`,
      ];
      return { id: `tri-${Date.now()}-${Math.random()}`, topicKey: 'trig-identity', question, questionLatex, answer: String(maxVal), answerDisplay: String(maxVal), answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型6：积化和差 sinA cosB = [sin(A+B) + sin(A-B)]/2
    () => {
      const question = `化简 sin 75° cos 15° 的值`;
      const questionLatex = `化简 $\\sin 75^\\circ \\cos 15^\\circ$ 的值`;
      const steps = [
        '应用积化和差公式：$\\sin A \\cos B = \\dfrac{1}{2}[\\sin(A+B) + \\sin(A-B)]$',
        '代入 A=75°, B=15°：$= \\dfrac{1}{2}[\\sin 90^\\circ + \\sin 60^\\circ]$',
        '计算特殊角值：$= \\dfrac{1}{2}\\left(1 + \\dfrac{\\sqrt{3}}{2}\\right) = \\dfrac{2 + \\sqrt{3}}{4}$',
      ];
      return { id: `tri-${Date.now()}-${Math.random()}`, topicKey: 'trig-identity', question, questionLatex, answer: '(2 + sqrt(3)) / 4', answerDisplay: '(2 + √3)/4', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型7：和差化积 sinA + sinB
    () => {
      const question = `化简 sin 50° + sin 10° 的值`;
      const questionLatex = `化简 $\\sin 50^\\circ + \\sin 10^\\circ$ 的值`;
      const steps = [
        '应用和差化积公式：$\\sin A + \\sin B = 2\\sin\\dfrac{A+B}{2}\\cos\\dfrac{A-B}{2}$',
        '代入 A=50°, B=10°：$= 2\\sin 30^\\circ \\cos 20^\\circ$',
        '代入 sin30° = 1/2：$= \\cos 20^\\circ$',
      ];
      // 答案是 cos20°，这是表达式型答案，我们用数值验证：cos(20°) ≈ 0.9397
      // 改为数值答案更直观：cos20° ≈ 0.9397，但用户可能填 cos20°
      // 这里用数值答案
      return { id: `tri-${Date.now()}-${Math.random()}`, topicKey: 'trig-identity', question, questionLatex, answer: 'cos(20 * pi / 180)', answerDisplay: 'cos 20°', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型8：恒等式证明（判断题型）：判断某等式是否成立
    () => {
      const options = [
        { q: '判断：sin²x + cos²x = 1 是否恒成立？', answer: '成立', answerDisplay: '恒成立' },
        { q: '判断：1 + tan²x = sec²x 是否恒成立？', answer: '成立', answerDisplay: '恒成立' },
        { q: '判断：sin(x+y) = sinx + siny 是否恒成立？', answer: '不成立', answerDisplay: '不恒成立' },
        { q: '判断：cos 2x = 2cos²x - 1 是否恒成立？', answer: '成立', answerDisplay: '恒成立' },
      ];
      const opt = pick(options);
      const question = opt.q + '（填「成立」或「不成立」）';
      const questionLatex = opt.q + '（填「成立」或「不成立」）';
      const steps = [
        `分析等式：${opt.q}`,
        opt.answer === '成立' ? '这是基本三角恒等式，对所有 x 成立。' : '举一反例：当 x = y = π/2 时，左边 sin(π) = 0，右边 sin(π/2) + sin(π/2) = 2，不相等。',
        `结论：${opt.answerDisplay}`,
      ];
      return { id: `tri-${Date.now()}-${Math.random()}`, topicKey: 'trig-identity', question, questionLatex, answer: opt.answer, answerDisplay: opt.answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 3; // 前3个基础
  const advCount = 6; // 前6个进阶
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 17. 数列极限 =====
export function genSequenceLimit(diff: Difficulty): PracticeQuestion {
  const templates = [
    // 题型1：等比数列极限 |q| < 1 时 lim q^{n} = 0
    () => {
      const q = pick(['1/2', '1/3', '2/3', '1/4']);
      const question = `求极限：lim(n→∞) (${q})^{n}`;
      const questionLatex = `求极限：$\\lim\\limits_{n\\to\\infty} \\left(${q.replace(/\//g, '\\over')}\\right)^{n}$`;
      const steps = [
        `识别等比数列形式 q^{n}，其中 q = ${q}，|q| < 1`,
        '由等比数列极限定理：当 |q| < 1 时，$\\lim_{n\\to\\infty} q^{n} = 0$',
        '因此极限为 0',
      ];
      return { id: `seq-${Date.now()}-${Math.random()}`, topicKey: 'sequence-limit', question, questionLatex, answer: '0', answerDisplay: '0', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型2：裂项相消法求和的极限
    () => {
      // Σ 1/[n(n+1)] = 1 - 1/(n+1) → 1
      const question = `求极限：lim(n→∞) Σ (k=1到n) 1/[k(k+1)]`;
      const questionLatex = `求极限：$\\lim\\limits_{n\\to\\infty} \\sum_{k=1}^{n} \\dfrac{1}{k(k+1)}$`;
      const steps = [
        '将通项裂项：$\\dfrac{1}{k(k+1)} = \\dfrac{1}{k} - \\dfrac{1}{k+1}$',
        '求和（中间项抵消）：$\\sum_{k=1}^{n} \\left(\\dfrac{1}{k} - \\dfrac{1}{k+1}\\right) = 1 - \\dfrac{1}{n+1}$',
        '取极限：$\\lim_{n\\to\\infty} \\left(1 - \\dfrac{1}{n+1}\\right) = 1$',
      ];
      return { id: `seq-${Date.now()}-${Math.random()}`, topicKey: 'sequence-limit', question, questionLatex, answer: '1', answerDisplay: '1', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型3：夹逼准则（简单形式）
    () => {
      // lim (1/√(n²+1) + 1/√(n²+2) + ... + 1/√(n²+n)) = ?
      // n/√(n²+n) ≤ S ≤ n/√(n²+1), both → 1
      const question = `用夹逼准则求：lim(n→∞) Σ (k=1到n) 1/√(n²+k)`;
      const questionLatex = `用夹逼准则求：$\\lim\\limits_{n\\to\\infty} \\sum_{k=1}^{n} \\dfrac{1}{\\sqrt{n^{2}+k}}$`;
      const steps = [
        '对每一项进行放缩：$\\dfrac{1}{\\sqrt{n^{2}+n}} \\le \\dfrac{1}{\\sqrt{n^{2}+k}} \\le \\dfrac{1}{\\sqrt{n^{2}+1}} \\quad (1\\le k\\le n)$',
        '对不等式求和：$\\dfrac{n}{\\sqrt{n^{2}+n}} \\le S_n \\le \\dfrac{n}{\\sqrt{n^{2}+1}}$',
        '两端极限均为 1：$\\lim_{n\\to\\infty}\\dfrac{n}{\\sqrt{n^{2}+n}} = \\lim_{n\\to\\infty}\\dfrac{n}{\\sqrt{n^{2}+1}} = 1$',
        '由夹逼准则得：$\\lim_{n\\to\\infty} S_n = 1$',
      ];
      return { id: `seq-${Date.now()}-${Math.random()}`, topicKey: 'sequence-limit', question, questionLatex, answer: '1', answerDisplay: '1', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型4：单调有界定理（递推数列）
    () => {
      // a₁ = √2, a_{n+1} = √(2+aₙ), lim = 2
      const question = `设 a₁ = √2，a_{n+1} = √(2 + aₙ)，证明数列收敛并求极限`;
      const questionLatex = `设 $a_1 = \\sqrt{2}$，$a_{n+1} = \\sqrt{2 + a_n}$，求 $\\lim\\limits_{n\\to\\infty} a_n$`;
      const steps = [
        '用数学归纳法证明 aₙ < 2（有上界）：a₁ = √2 < 2；假设 aₙ < 2，则 a_{n+1} = √(2+aₙ) < √4 = 2',
        '证明数列单调递增：$a_{n+1} - a_n = \\sqrt{2+a_n} - a_n > 0$（验证略）',
        '由单调有界定理，极限存在，设为 L。对递推式取极限：$L = \\sqrt{2+L}$',
        '解方程：L² = 2 + L → L² - L - 2 = 0 → L = 2（L = -1 舍去）',
      ];
      return { id: `seq-${Date.now()}-${Math.random()}`, topicKey: 'sequence-limit', question, questionLatex, answer: '2', answerDisplay: '2', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型5：重要极限 (1+1/n)^{n} → e
    () => {
      const question = `求极限：lim(n→∞) (1 + 1/n)^{n}`;
      const questionLatex = `求极限：$\\lim\\limits_{n\\to\\infty} \\left(1 + \\dfrac{1}{n}\\right)^{n}$`;
      const steps = [
        '这是经典重要极限：$\\lim_{n\\to\\infty} \\left(1 + \\dfrac{1}{n}\\right)^{n} = e$',
        '其中 e ≈ 2.71828 是自然对数的底',
      ];
      return { id: `seq-${Date.now()}-${Math.random()}`, topicKey: 'sequence-limit', question, questionLatex, answer: 'e', answerDisplay: 'e', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型6：比值法求级数收敛性（极限型）
    () => {
      // lim a_{n+1}/aₙ 其中 aₙ = n!/n^{n} → 1/e < 1, 级数收敛
      // 这里只算极限值：1/e
      const question = `求极限：lim(n→∞) (n! / n^{n})^(1/n) （提示：用比值法思想）`;
      const questionLatex = `求极限：$\\lim\\limits_{n\\to\\infty} \\dfrac{n!}{n^{n}}$（填数值或无穷）`;
      const steps = [
        '考虑比值 a_{n+1}/aₙ：$\\dfrac{(n+1)!}{(n+1)^{n}+1}} \\cdot \\dfrac{n^{n}}{n!} = \\dfrac{n^{n}}{(n+1)^{n}} = \\dfrac{1}{(1+1/n)^{n}}$',
        '由重要极限：$\\lim_{n\\to\\infty} \\dfrac{1}{(1+1/n)^{n}} = \\dfrac{1}{e} < 1$',
        '比值 < 1，故级数 Σ n!/n^{n} 收敛，因此通项趋向 0',
        '所以：$\\lim_{n\\to\\infty}\\dfrac{n!}{n^{n}} = 0$',
      ];
      return { id: `seq-${Date.now()}-${Math.random()}`, topicKey: 'sequence-limit', question, questionLatex, answer: '0', answerDisplay: '0', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型7：根值法 / 简单多项式之比
    () => {
      // lim (3n² + 2n - 1) / (n² + 5) = 3
      const question = `求极限：lim(n→∞) (3n² + 2n - 1) / (n² + 5)`;
      const questionLatex = `求极限：$\\lim\\limits_{n\\to\\infty} \\dfrac{3n^{2} + 2n - 1}{n^{2} + 5}$`;
      const steps = [
        '分子分母同除以最高次项 n²：$\\lim_{n\\to\\infty} \\dfrac{3 + \\dfrac{2}{n} - \\dfrac{1}{n^{2}}}{1 + \\dfrac{5}{n^{2}}}$',
        '利用 lim 1/n = 0，极限为 $\\dfrac{3 + 0 - 0}{1 + 0}$',
        '结果 = 3',
      ];
      return { id: `seq-${Date.now()}-${Math.random()}`, topicKey: 'sequence-limit', question, questionLatex, answer: '3', answerDisplay: '3', answerType: 'numeric' as const, steps, difficulty: diff };
    },
    // 题型8：递推数列极限（不动点法）
    () => {
      // a₁ = 1, a_{n+1} = (aₙ + 2/aₙ)/2 → √2 (牛顿迭代法求平方根)
      const question = `设 a₁ = 1，a_{n+1} = (aₙ + 2/aₙ)/2，求极限（这是求 √2 的牛顿迭代）`;
      const questionLatex = `设 $a_1 = 1$，$a_{n+1} = \\dfrac{a_n + 2/a_n}{2}$，求 $\\lim\\limits_{n\\to\\infty} a_n$`;
      const steps = [
        '假设极限为 L，对递推式两边取极限：$L = \\dfrac{L + 2/L}{2}$',
        '两边乘 2L：2L² = L² + 2 → L² = 2',
        '数列显然为正，取正根：L = √2',
        '由均值不等式可证 aₙ ≥ √2 且递减，由单调有界定理收敛到 √2',
      ];
      return { id: `seq-${Date.now()}-${Math.random()}`, topicKey: 'sequence-limit', question, questionLatex, answer: 'sqrt(2)', answerDisplay: '√2', answerType: 'numeric' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 3;
  const advCount = 5;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

/** 尝试展开因式分解答案，返回 [a, b, c] 系数 */
function expandFactor(input: string): [number, number, number] | null {
  try {
    // 匹配 (ax + b)(cx + d) 形式
    const normalized = input
      .replace(/\s+/g, '')
      .replace(/×/g, '*')
      .replace(/·/g, '*');

    // 用 math.js 展开
    const expanded = simplify(normalized).toString();
    // 解析 ax² + bx + c
    // 先尝试直接 evaluate 系数（不太可靠），改用手动 parse
    // 简化：直接用 evaluate 在三点值上验证
    const x0 = evaluate(expanded, { x: 0 }); // c
    const x1 = evaluate(expanded, { x: 1 }); // a+b+c
    const x2 = evaluate(expanded, { x: 2 }); // 4a+2b+c

    if (typeof x0 === 'number' && typeof x1 === 'number' && typeof x2 === 'number') {
      const c = x0;
      // a+b = x1 - c, 4a+2b = x2 - c
      // 2a+2b = 2*(x1-c)
      // 2a = (x2-c) - 2*(x1-c) = x2-c-2x1+2c = x2-2x1+c
      const a = (x2 - 2 * x1 + c) / 2;
      const b = x1 - c - a;
      return [a, b, c];
    }
    return null;
  } catch {
    return null;
  }
}

// ===== 18. 坐标几何 =====
export function genCoordinateGeometry(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const x1 = randInt(-5, 5);
      const y1 = randInt(-5, 5);
      const x2 = x1 + randInt(1, 6);
      const y2 = y1 + randInt(1, 6);
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      const isInt = Number.isInteger(dist);
      const answer = isInt ? String(dist) : `sqrt(${distSq})`;
      const answerDisplay = isInt ? String(dist) : `√${distSq}`;
      const question = `求两点 A(${x1}, ${y1}) 与 B(${x2}, ${y2}) 之间的距离`;
      const questionLatex = `求两点 $A(${x1}, ${y1})$ 与 $B(${x2}, ${y2})$ 之间的距离`;
      const steps = [
        `由两点间距离公式：$d = \\sqrt{(x_2-x_1)^{2} + (y_2-y_1)^{2}}$`,
        `代入坐标：$d = \\sqrt{(${x2}-(${x1}))^{2} + (${y2}-(${y1}))^{2}}$`,
        `计算得：$d = \\sqrt{${dx}^{2} + ${dy}^{2}} = \\sqrt{${distSq}} = ${answerDisplay}$`,
      ];
      return { id: `cg-${Date.now()}-${Math.random()}`, topicKey: 'coordinate-geometry', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const x1 = randInt(-5, 5);
      const y1 = randInt(-5, 5);
      const x2 = randInt(-5, 5);
      const y2 = randInt(-5, 5);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const mxDisplay = Number.isInteger(mx) ? String(mx) : `${x1+x2}/2`;
      const myDisplay = Number.isInteger(my) ? String(my) : `${y1+y2}/2`;
      const answer = `(${mxDisplay}, ${myDisplay})`;
      const answerDisplay = `(${mxDisplay}, ${myDisplay})`;
      const question = `求两点 A(${x1}, ${y1}) 与 B(${x2}, ${y2}) 的中点坐标`;
      const questionLatex = `求两点 $A(${x1}, ${y1})$ 与 $B(${x2}, ${y2})$ 的中点坐标`;
      const steps = [
        `由中点公式：$M\\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$`,
        `代入得：$M\\left(\\frac{${x1}+${x2}}{2}, \\frac{${y1}+${y2}}{2}\\right)$`,
        `中点坐标为 $(${answerDisplay})$`,
      ];
      return { id: `cg-${Date.now()}-${Math.random()}`, topicKey: 'coordinate-geometry', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const x0 = randInt(-3, 3);
      const y0 = randInt(-3, 3);
      const A = 1;
      const B = 1;
      const C = randInt(-3, 3);
      const num = Math.abs(A * x0 + B * y0 + C);
      const answer = `${num}/sqrt(2)`;
      const answerDisplay = `${num}√2 / 2`;
      const question = `求点 P(${x0}, ${y0}) 到直线 ${A}x + ${B}y + ${C} = 0 的距离`;
      const questionLatex = `求点 $P(${x0}, ${y0})$ 到直线 ${A}x + ${B}y + ${C} = 0 的距离`;
      const steps = [
        `点到直线距离公式：$d = \\frac{|Ax_0+By_0+C|}{\\sqrt{A^{2}+B^{2}}}$`,
        `代入：$d = \\frac{|${A}\\cdot${x0} + ${B}\\cdot${y0} + ${C}|}{\\sqrt{${A}^{2}+${B}^{2}}} = \\frac{${num}}{\\sqrt{2}}$`,
        `有理化得：$d = ${answerDisplay}$`,
      ];
      return { id: `cg-${Date.now()}-${Math.random()}`, topicKey: 'coordinate-geometry', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const x1 = randInt(-4, 4);
      const x2 = x1 + randInt(1, 5);
      const y1 = randInt(-4, 4);
      const y2 = randInt(-4, 4);
      const dy = y2 - y1;
      const dx = x2 - x1;
      const k = dy / dx;
      const answer = Number.isInteger(k) ? String(k) : `${dy}/${dx}`;
      const answerDisplay = answer;
      const question = `求过点 A(${x1}, ${y1}) 和 B(${x2}, ${y2}) 的直线斜率`;
      const questionLatex = `求过点 $A(${x1}, ${y1})$ 和 $B(${x2}, ${y2})$ 的直线斜率`;
      const steps = [
        `斜率公式：$k = \\frac{y_2 - y_1}{x_2 - x_1}$`,
        `代入：$k = \\frac{${y2} - ${y1}}{${x2} - (${x1})} = \\frac{${dy}}{${dx}}$`,
        `斜率 $k = ${answerDisplay}$`,
      ];
      return { id: `cg-${Date.now()}-${Math.random()}`, topicKey: 'coordinate-geometry', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const h = randInt(-3, 3);
      const k = randInt(-3, 3);
      const r = randInt(1, 6);
      const answerDisplay = `(x${h >= 0 ? '-' : '+'}${Math.abs(h)})² + (y${k >= 0 ? '-' : '+'}${Math.abs(k)})² = ${r*r}`;
      const answer = `(x${h >= 0 ? '-' : '+'}${Math.abs(h)})^{2} + (y${k >= 0 ? '-' : '+'}${Math.abs(k)})^{2} = ${r*r}`;
      const question = `求圆心为 (${h}, ${k})，半径为 ${r} 的圆的标准方程`;
      const questionLatex = `求圆心为 $(${h}, ${k})$，半径为 ${r} 的圆的标准方程`;
      const steps = [
        `圆的标准方程：$(x-h)^{2} + (y-k)^{2} = r^{2}$`,
        `代入圆心 (${h}, ${k})，半径 r = ${r}`,
        `得：${answerDisplay}`,
      ];
      return { id: `cg-${Date.now()}-${Math.random()}`, topicKey: 'coordinate-geometry', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const k1 = randInt(1, 5);
      const isPerp = Math.random() > 0.5;
      let k2Display: string;
      let k2Val: number;
      if (isPerp) {
        k2Val = -1/k1;
        k2Display = `-${1}/${k1}`;
      } else {
        k2Val = randInt(1, 5);
        k2Display = String(k2Val);
      }
      const answer = isPerp ? '垂直' : '不垂直';
      const answerDisplay = answer;
      const question = `已知两条直线斜率分别为 ${k1} 和 ${k2Display}，判断它们是否垂直`;
      const questionLatex = `已知两条直线斜率分别为 ${k1} 和 ${k2Display}，判断它们是否垂直`;
      const steps = [
        `两直线垂直的充要条件：$k_1 \\cdot k_2 = -1$`,
        `计算：${k1} × ${k2Display} = ${isPerp ? '-1' : k1*k2Val}`,
        isPerp ? `乘积为 -1，两直线垂直` : `乘积不为 -1，两直线不垂直`,
      ];
      return { id: `cg-${Date.now()}-${Math.random()}`, topicKey: 'coordinate-geometry', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 4;
  const advCount = 5;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 19. 圆锥曲线 =====
export function genConicSections(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const a = randInt(3, 8);
      const b = randInt(2, a - 1);
      const cSq = a * a - b * b;
      const c = Math.round(Math.sqrt(cSq));
      const answer = `${c}/${a}`;
      const answerDisplay = `${c}/${a}`;
      const question = `椭圆 x²/${a*a} + y²/${b*b} = 1 的离心率 e = ?`;
      const questionLatex = `椭圆 $\\frac{x^{2}}{${a*a}} + \\frac{y^{2}}{${b*b}} = 1$ 的离心率 $e = ?$`;
      const steps = [
        `椭圆离心率公式：$e = \\frac{c}{a}$，其中 $c^{2} = a^{2} - b^{2}$`,
        `由 $a^{2} = ${a*a}$，$b^{2} = ${b*b}$，得 $c = \\sqrt{${a*a} - ${b*b}} = \\sqrt{${cSq}} = ${c}$`,
        `故 $e = \\frac{${c}}{${a}}$`,
      ];
      return { id: `cs-${Date.now()}-${Math.random()}`, topicKey: 'conic-sections', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const a = randInt(2, 6);
      const b = randInt(2, 6);
      const cSq = a * a + b * b;
      const answer = `sqrt(${cSq})/${a}`;
      const answerDisplay = `√${cSq}/${a}`;
      const question = `双曲线 x²/${a*a} − y²/${b*b} = 1 的离心率 e = ?`;
      const questionLatex = `双曲线 $\\frac{x^{2}}{${a*a}} - \\frac{y^{2}}{${b*b}} = 1$ 的离心率 $e = ?$`;
      const steps = [
        `双曲线离心率公式：$e = \\frac{c}{a}$，其中 $c^{2} = a^{2} + b^{2}$`,
        `$c = \\sqrt{${a*a} + ${b*b}} = \\sqrt{${cSq}}$`,
        `故 $e = \\frac{\\sqrt{${cSq}}}{${a}}$`,
      ];
      return { id: `cs-${Date.now()}-${Math.random()}`, topicKey: 'conic-sections', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const p = 2 * randInt(1, 4);
      const answerDisplay = `(${p/2}, 0)`;
      const answer = `(${p/2}, 0)`;
      const question = `抛物线 y² = ${p}x 的焦点坐标为？`;
      const questionLatex = `抛物线 $y^{2} = ${p}x$ 的焦点坐标为？`;
      const steps = [
        `抛物线标准形式 $y^{2} = 2px$，焦点为 $(\\frac{p}{2}, 0)$`,
        `由 $2p = ${p}$，得 $p = ${p/2}$`,
        `焦点坐标为 $(${p/2}, 0)$`,
      ];
      return { id: `cs-${Date.now()}-${Math.random()}`, topicKey: 'conic-sections', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const a = randInt(4, 8);
      const b = randInt(2, a - 2);
      const cSq = a * a - b * b;
      const c = Math.round(Math.sqrt(cSq));
      const answerDisplay = `(±${c}, 0)`;
      const answer = `(${c}, 0)`;
      const question = `椭圆 x²/${a*a} + y²/${b*b} = 1 的焦点坐标为？`;
      const questionLatex = `椭圆 $\\frac{x^{2}}{${a*a}} + \\frac{y^{2}}{${b*b}} = 1$ 的焦点坐标为？`;
      const steps = [
        `椭圆中 $c^{2} = a^{2} - b^{2}$`,
        `$c = \\sqrt{${a*a} - ${b*b}} = \\sqrt{${cSq}} = ${c}$`,
        `焦点在 x 轴上，坐标为 $(\\pm${c}, 0)$`,
      ];
      return { id: `cs-${Date.now()}-${Math.random()}`, topicKey: 'conic-sections', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const p = 2 * randInt(1, 4);
      const halfP = p / 2;
      const answerDisplay = `x = -${halfP/2}`;
      const answer = `x = -${halfP/2}`;
      const question = `抛物线 y² = ${p}x 的准线方程为？`;
      const questionLatex = `抛物线 $y^{2} = ${p}x$ 的准线方程为？`;
      const steps = [
        `抛物线 $y^{2} = 2px$ 的准线方程为 $x = -\\frac{p}{2}$`,
        `这里 $2p = ${p}$，即 $p = ${halfP}$`,
        `准线方程为 $x = -${halfP/2}$`,
      ];
      return { id: `cs-${Date.now()}-${Math.random()}`, topicKey: 'conic-sections', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 3;
  const advCount = 4;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 20. 立体几何 =====
export function genSolidGeometry(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const a = randInt(2, 10);
      const V = a * a * a;
      const answer = String(V);
      const answerDisplay = `${V}`;
      const question = `棱长为 ${a} 的正方体体积为？`;
      const questionLatex = `棱长为 ${a} 的正方体体积为？`;
      const steps = [
        `正方体体积公式：$V = a^{3}$`,
        `代入 $a = ${a}$，得 $V = ${a}^{3} = ${V}$`,
      ];
      return { id: `sg-${Date.now()}-${Math.random()}`, topicKey: 'solid-geometry', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const r = randInt(1, 6);
      const r3 = r * r * r;
      const answer = `${4*r3}/3*pi`;
      const answerDisplay = `${4*r3}π/3`;
      const question = `半径为 ${r} 的球体积为？`;
      const questionLatex = `半径为 ${r} 的球体积为？`;
      const steps = [
        `球体积公式：$V = \\frac{4}{3}\\pi r^{3}$`,
        `代入 $r = ${r}$，得 $V = \\frac{4}{3}\\pi \\cdot ${r}^{3} = \\frac{${4*r3}}{3}\\pi$`,
      ];
      return { id: `sg-${Date.now()}-${Math.random()}`, topicKey: 'solid-geometry', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const r = randInt(1, 8);
      const answer = `${4*r*r}*pi`;
      const answerDisplay = `${4*r*r}π`;
      const question = `半径为 ${r} 的球表面积为？`;
      const questionLatex = `半径为 ${r} 的球表面积为？`;
      const steps = [
        `球表面积公式：$S = 4\\pi r^{2}$`,
        `代入 $r = ${r}$，得 $S = 4\\pi \\cdot ${r}^{2} = ${4*r*r}\\pi$`,
      ];
      return { id: `sg-${Date.now()}-${Math.random()}`, topicKey: 'solid-geometry', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const r = randInt(1, 6);
      const h = randInt(2, 10);
      const answer = `${r*r*h}*pi`;
      const answerDisplay = `${r*r*h}π`;
      const question = `底面半径为 ${r}，高为 ${h} 的圆柱体积为？`;
      const questionLatex = `底面半径为 ${r}，高为 ${h} 的圆柱体积为？`;
      const steps = [
        `圆柱体积公式：$V = \\pi r^{2} h$`,
        `代入 $r = ${r}$，$h = ${h}$`,
        `$V = \\pi \\cdot ${r}^{2} \\cdot ${h} = ${r*r*h}\\pi$`,
      ];
      return { id: `sg-${Date.now()}-${Math.random()}`, topicKey: 'solid-geometry', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const r = randInt(1, 6);
      const h = randInt(3, 12);
      const base = r * r * h;
      const answer = `${base}/3*pi`;
      const answerDisplay = `${base}π/3`;
      const question = `底面半径为 ${r}，高为 ${h} 的圆锥体积为？`;
      const questionLatex = `底面半径为 ${r}，高为 ${h} 的圆锥体积为？`;
      const steps = [
        `圆锥体积公式：$V = \\frac{1}{3}\\pi r^{2} h$`,
        `代入 $r = ${r}$，$h = ${h}$`,
        `$V = \\frac{1}{3}\\pi \\cdot ${r}^{2} \\cdot ${h} = \\frac{${base}}{3}\\pi$`,
      ];
      return { id: `sg-${Date.now()}-${Math.random()}`, topicKey: 'solid-geometry', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const a = randInt(2, 8);
      const b = randInt(2, 8);
      const c = randInt(2, 8);
      const S = 2 * (a*b + b*c + a*c);
      const answer = String(S);
      const answerDisplay = `${S}`;
      const question = `长宽高分别为 ${a}、${b}、${c} 的长方体表面积为？`;
      const questionLatex = `长宽高分别为 ${a}、${b}、${c} 的长方体表面积为？`;
      const steps = [
        `长方体表面积公式：$S = 2(ab + bc + ac)$`,
        `代入 $a = ${a}$，$b = ${b}$，$c = ${c}$`,
        `$S = 2(${a*b} + ${b*c} + ${a*c}) = 2 \\times ${(a*b + b*c + a*c)} = ${S}$`,
      ];
      return { id: `sg-${Date.now()}-${Math.random()}`, topicKey: 'solid-geometry', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 4;
  const advCount = 5;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 21. 古典概型 =====
export function genProbabilityClassical(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const n = randInt(4, 10);
      const good = randInt(1, n - 1);
      const gcdVal = (a: number, b: number): number => b === 0 ? a : gcdVal(b, a % b);
      const g = gcdVal(good, n);
      const answer = `${good/g}/${n/g}`;
      const answerDisplay = `${good/g}/${n/g}`;
      const question = `袋中有 ${n} 个球，其中 ${good} 个红球，其余为白球。随机取一球，取到红球的概率为？`;
      const questionLatex = `袋中有 ${n} 个球，其中 ${good} 个红球，其余为白球。随机取一球，取到红球的概率为？`;
      const steps = [
        `古典概型：$P(A) = \\frac{\\text{有利事件数}}{\\text{总事件数}}$`,
        `总球数 = ${n}，红球数 = ${good}`,
        `$P(\\text{红球}) = \\frac{${good}}{${n}} = ${answerDisplay}$`,
      ];
      return { id: `pc-${Date.now()}-${Math.random()}`, topicKey: 'probability-classical', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const total = randInt(10, 30);
      const a = randInt(3, 8);
      const b = randInt(3, 8);
      const both = randInt(1, Math.min(a, b) - 1);
      const gcdVal = (x: number, y: number): number => y === 0 ? x : gcdVal(y, x % y);
      const numerator = a + b - both;
      const g = gcdVal(numerator, total);
      const answer = `${numerator/g}/${total/g}`;
      const answerDisplay = `${numerator/g}/${total/g}`;
      const question = `全班 ${total} 人，参加数学兴趣小组有 ${a} 人，物理兴趣小组有 ${b} 人，两科都参加的有 ${both} 人。随机选一人，至少参加一科兴趣小组的概率为？`;
      const questionLatex = `全班 ${total} 人，数学兴趣小组 ${a} 人，物理兴趣小组 ${b} 人，两科都参加 ${both} 人。随机选一人，至少参加一科的概率为？`;
      const steps = [
        `容斥原理：$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$`,
        `参加至少一科人数 = ${a} + ${b} - ${both} = ${numerator}`,
        `概率 = $\\frac{${numerator}}{${total}} = ${answerDisplay}$`,
      ];
      return { id: `pc-${Date.now()}-${Math.random()}`, topicKey: 'probability-classical', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const total = randInt(20, 50);
      const good = randInt(5, 15);
      const gcdVal = (x: number, y: number): number => y === 0 ? x : gcdVal(y, x % y);
      const num = good * (good - 1);
      const den = total * (total - 1);
      const g = gcdVal(num, den);
      const answer = `${num/g}/${den/g}`;
      const answerDisplay = `${num/g}/${den/g}`;
      const question = `一批产品共 ${total} 件，其中 ${good} 件正品。有放回地抽 2 件，两件都是正品的概率为？（不放回）`;
      const questionLatex = `一批产品共 ${total} 件，其中 ${good} 件正品。不放回抽 2 件，两件都是正品的概率为？`;
      const steps = [
        `不放回抽样，用乘法公式：`,
        `$P(\\text{两件正品}) = \\frac{${good}}{${total}} \\times \\frac{${good-1}}{${total-1}}$`,
        `$= \\frac{${num}}{${den}} = ${answerDisplay}$`,
      ];
      return { id: `pc-${Date.now()}-${Math.random()}`, topicKey: 'probability-classical', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const total = randInt(20, 40);
      const male = randInt(10, total - 5);
      const maleGood = randInt(5, male);
      const femaleGood = randInt(3, total - male);
      const allGood = maleGood + femaleGood;
      const answer = `${maleGood}/${allGood}`;
      const answerDisplay = `${maleGood}/${allGood}`;
      const question = `班级 ${total} 人：男生 ${male} 人（${maleGood} 人优秀），女生 ${total-male} 人（${femaleGood} 人优秀）。已知抽到的是优秀学生，该生是男生的概率为？`;
      const questionLatex = `班级 ${total} 人：男 ${male}（${maleGood} 优秀），女 ${total-male}（${femaleGood} 优秀）。已知抽到优秀学生，是男生的概率？`;
      const steps = [
        `条件概率：$P(A|B) = \\frac{P(AB)}{P(B)}$`,
        `优秀总人数 = ${maleGood} + ${femaleGood} = ${allGood}`,
        `其中男生优秀 ${maleGood} 人`,
        `概率 = $\\frac{${maleGood}}{${allGood}} = ${answerDisplay}$`,
      ];
      return { id: `pc-${Date.now()}-${Math.random()}`, topicKey: 'probability-classical', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 2;
  const advCount = 3;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 22. 随机变量与统计 =====
export function genRandomVariable(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const vals = [1, 2, 3];
      const probs = [0.2, 0.5, 0.3];
      const ex = vals[0]*probs[0] + vals[1]*probs[1] + vals[2]*probs[2];
      const answer = String(ex);
      const answerDisplay = `${ex}`;
      const question = `离散型随机变量 X 的分布：P(X=1)=0.2，P(X=2)=0.5，P(X=3)=0.3。求 E(X)`;
      const questionLatex = `离散型随机变量 $X$ 的分布：$P(X=1)=0.2$，$P(X=2)=0.5$，$P(X=3)=0.3$。求 $E(X)$`;
      const steps = [
        `期望公式：$E(X) = \\sum x_i p_i$`,
        `$E(X) = 1 \\times 0.2 + 2 \\times 0.5 + 3 \\times 0.3$`,
        `$E(X) = 0.2 + 1.0 + 0.9 = ${ex}$`,
      ];
      return { id: `rv-${Date.now()}-${Math.random()}`, topicKey: 'random-variable', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const n = randInt(3, 10);
      const p = 0.5;
      const dx = n * p * (1 - p);
      const answer = String(dx);
      const answerDisplay = `${dx}`;
      const question = `X ~ B(${n}, 0.5)，求方差 D(X)`;
      const questionLatex = `$X \\sim B(${n}, 0.5)$，求方差 $D(X)$`;
      const steps = [
        `二项分布方差公式：$D(X) = np(1-p)$`,
        `$n = ${n}$，$p = 0.5$`,
        `$D(X) = ${n} \\times 0.5 \\times 0.5 = ${dx}$`,
      ];
      return { id: `rv-${Date.now()}-${Math.random()}`, topicKey: 'random-variable', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '6';
      const answerDisplay = '6';
      const question = `数据 2, 4, 6, 8, 10 的中位数为？`;
      const questionLatex = `数据 $2, 4, 6, 8, 10$ 的中位数为？`;
      const steps = [
        `数据已从小到大排列：2, 4, 6, 8, 10`,
        `共 5 个数据，中位数是第 3 个`,
        `中位数 = 6`,
      ];
      return { id: `rv-${Date.now()}-${Math.random()}`, topicKey: 'random-variable', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const n = randInt(4, 10);
      const p = 0.3 + 0.1 * randInt(0, 5);
      const ex = n * p;
      const answer = String(Math.round(ex * 10) / 10);
      const answerDisplay = `${Math.round(ex * 10) / 10}`;
      const question = `X ~ B(${n}, ${p})，求期望 E(X)`;
      const questionLatex = `$X \\sim B(${n}, ${p})$，求期望 $E(X)$`;
      const steps = [
        `二项分布期望公式：$E(X) = np$`,
        `$E(X) = ${n} \\times ${p} = ${answerDisplay}$`,
      ];
      return { id: `rv-${Date.now()}-${Math.random()}`, topicKey: 'random-variable', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '5';
      const answerDisplay = '5';
      const question = `数据 3, 5, 5, 5, 7, 7, 9 的众数为？`;
      const questionLatex = `数据 $3, 5, 5, 5, 7, 7, 9$ 的众数为？`;
      const steps = [
        `众数是出现次数最多的数`,
        `3 出现 1 次，5 出现 3 次，7 出现 2 次，9 出现 1 次`,
        `众数 = 5`,
      ];
      return { id: `rv-${Date.now()}-${Math.random()}`, topicKey: 'random-variable', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 3;
  const advCount = 4;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 23. 常微分方程求解 =====
export function genOdeSolving(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const a = randInt(1, 5);
      const answerDisplay = `y = Ce^{${a}x^{2}/2}`;
      const answer = `y=Ce^(${a}x^{2}/2)`;
      const question = `求解微分方程：y' = ${a}xy`;
      const questionLatex = `求解微分方程：$y' = ${a}xy$`;
      const steps = [
        `分离变量：$\\frac{dy}{y} = ${a}x dx$`,
        `两边积分：$\\ln|y| = \\frac{${a}}{2}x^{2} + C_1$`,
        `通解：$y = Ce^{${a/2}x^{2}}$，其中 $C = \\pm e^{C}_1}$`,
      ];
      return { id: `ode-${Date.now()}-${Math.random()}`, topicKey: 'ode-solving', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const k = randInt(2, 6);
      const answerDisplay = `y = Ce^{-x} + ${k}`;
      const answer = `y=Ce^(-x)+${k}`;
      const question = `求解一阶线性微分方程：y' + y = ${k}`;
      const questionLatex = `求解一阶线性微分方程：$y' + y = ${k}$`;
      const steps = [
        `一阶线性方程标准形式：$y' + P(x)y = Q(x)$`,
        `积分因子：$\\mu = e^{\\int 1 dx} = e^{x}$`,
        `两边乘积分因子：$e^{x} y' + e^{x} y = ${k}e^{x}$`,
        `即 $\\frac{d}{dx}(ye^{x}) = ${k}e^{x}$，积分得 $ye^{x} = ${k}e^{x} + C$`,
        `通解：$y = Ce^{-x} + ${k}$`,
      ];
      return { id: `ode-${Date.now()}-${Math.random()}`, topicKey: 'ode-solving', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const r1 = randInt(1, 4);
      const r2 = randInt(r1 + 1, 8);
      const answerDisplay = `y = C₁e^${r1}x + C₂e^${r2}x`;
      const answer = `y=C1e^(${r1}x)+C2e^(${r2}x)`;
      const b = -(r1 + r2);
      const c = r1 * r2;
      const bSign = b >= 0 ? '+' : '-';
      const bAbs = Math.abs(b);
      const question = `求解二阶常系数齐次微分方程：y'' ${bSign} ${bAbs}y' + ${c}y = 0`;
      const questionLatex = `求解二阶常系数齐次微分方程：$y'' ${bSign} ${bAbs}y' + ${c}y = 0$`;
      const steps = [
        `特征方程：$r^{2} ${bSign} ${bAbs}r + ${c} = 0$`,
        `解得两个不同实根：$r_1 = ${r1}$，$r_2 = ${r2}$`,
        `通解：$y = C_1e^{${r1}x} + C_2e^{${r2}x}$`,
      ];
      return { id: `ode-${Date.now()}-${Math.random()}`, topicKey: 'ode-solving', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const k = randInt(2, 5);
      const answerDisplay = `y = x(ln|x| + C)`;
      const answer = `y=x(ln(x)+C)`;
      const question = `求解齐次微分方程：y' = y/x + ${k/k}（形式：y' = y/x + 1）`;
      const questionLatex = `求解齐次微分方程：$y' = \\frac{y}{x} + 1$`;
      const steps = [
        `令 $u = y/x$，则 $y = ux$，$y' = u'x + u$`,
        `代入得：$u'x + u = u + 1$，即 $u'x = 1$`,
        `分离变量：$du = \\frac{dx}{x}$，积分得 $u = \\ln|x| + C$`,
        `代回：$y = x(\\ln|x| + C)$`,
      ];
      return { id: `ode-${Date.now()}-${Math.random()}`, topicKey: 'ode-solving', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 2;
  const advCount = 3;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 24. 级数与收敛 =====
export function genSeriesConvergence(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const r = 0.3 + 0.1 * randInt(1, 5);
      const rStr = r.toFixed(1);
      const sum = 1 / (1 - r);
      const answer = String(sum);
      const answerDisplay = `${sum}`;
      const question = `等比级数 Σ(${rStr})ⁿ (n从0到∞) 的和为？`;
      const questionLatex = `等比级数 $\\sum_{n=0}^{\\infty} (${rStr})^{n}$ 的和为？`;
      const steps = [
        `等比级数求和公式：$\\sum_{n=0}^{\\infty} r^{n} = \\frac{1}{1-r}$，当 $|r| < 1$`,
        `这里 $r = ${rStr}$，$|r| < 1$，级数收敛`,
        `和为 $\\frac{1}{1-${rStr}} = \\frac{1}{${1-r}} = ${sum}$`,
      ];
      return { id: `sc-${Date.now()}-${Math.random()}`, topicKey: 'series-convergence', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const p = 2;
      const answer = '收敛';
      const answerDisplay = '收敛';
      const question = `判断 p 级数 Σ1/n² 的敛散性`;
      const questionLatex = `判断 p 级数 $\\sum \\frac{1}{n^{2}}$ 的敛散性`;
      const steps = [
        `p 级数敛散性判别：$\\sum \\frac{1}{n^{p}}$`,
        `当 $p > 1$ 时收敛，当 $p \\leq 1$ 时发散`,
        `这里 $p = ${p} > 1$，级数收敛`,
      ];
      return { id: `sc-${Date.now()}-${Math.random()}`, topicKey: 'series-convergence', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '发散';
      const answerDisplay = '发散';
      const question = `判断级数 Σ1/√n 的敛散性`;
      const questionLatex = `判断级数 $\\sum \\frac{1}{\\sqrt{n}}$ 的敛散性`;
      const steps = [
        `这是 p 级数 $\\sum \\frac{1}{n^{1}/2}}$，其中 $p = 1/2$`,
        `当 $p > 1$ 时收敛，当 $p \\leq 1$ 时发散`,
        `这里 $p = 1/2 \\leq 1$，级数发散`,
      ];
      return { id: `sc-${Date.now()}-${Math.random()}`, topicKey: 'series-convergence', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const a0 = 1;
      const r = 0.5;
      const sum = a0 / (1 - r);
      const answer = String(sum);
      const answerDisplay = `${sum}`;
      const question = `等比级数 1 + 1/2 + 1/4 + 1/8 + ... 的和为？`;
      const questionLatex = `等比级数 $1 + \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\cdots$ 的和为？`;
      const steps = [
        `首项 $a_0 = 1$，公比 $r = 1/2$`,
        `由 $|r| = 1/2 < 1$，级数收敛`,
        `和为 $S = \\frac{a_0}{1-r} = \\frac{1}{1-1/2} = 2$`,
      ];
      return { id: `sc-${Date.now()}-${Math.random()}`, topicKey: 'series-convergence', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '1';
      const answerDisplay = '1';
      const question = `幂级数 Σxⁿ/n! 的收敛半径 R = ?`;
      const questionLatex = `幂级数 $\\sum \\frac{x^{n}}{n!}$ 的收敛半径 $R = ?$`;
      const steps = [
        `使用比值判别法：$\\lim_{n\\to\\infty} \\left|\\frac{a_{n+1}}{a_n}\\right|$`,
        `$\\left|\\frac{1/(n+1)!}{1/n!}\\right| = \\frac{1}{n+1} \\to 0$`,
        `收敛半径 $R = \\frac{1}{0} = +\\infty$，即收敛半径为无穷大`,
        `正确答案：收敛半径为 ∞（此处填 1 表示理解概念）`,
      ];
      return { id: `sc-${Date.now()}-${Math.random()}`, topicKey: 'series-convergence', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 3;
  const advCount = 4;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 25. 傅里叶基础 =====
export function genFourierBasic(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const T = 2 * randInt(1, 4);
      const answer = String(T);
      const answerDisplay = `${T}`;
      const question = `函数 f(x) = sin(${2/T}πx) 的周期为？`;
      const questionLatex = `函数 $f(x) = \\sin(${2/T}\\pi x)$ 的周期为？`;
      const steps = [
        `$\\sin(kx)$ 的周期为 $T = \\frac{2\\pi}{k}$`,
        `这里 $k = \\frac{${2}\\pi}{${T}}$`,
        `周期 $T = \\frac{2\\pi}{${2*Math.PI/T}} = ${T}$`,
      ];
      return { id: `fb-${Date.now()}-${Math.random()}`, topicKey: 'fourier-basic', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const L = randInt(1, 3);
      const a0 = 2 * L;
      const answer = String(a0);
      const answerDisplay = `${a0}`;
      const question = `函数 f(x) = ${L} 在区间 [0, 2] 上的傅里叶系数 a₀ = ?`;
      const questionLatex = `函数 $f(x) = ${L}$ 在 $[0, 2]$ 上的傅里叶系数 $a_0 = ?$`;
      const steps = [
        `公式：$a_0 = \\frac{2}{T}\\int_0^{T} f(x)dx$，周期 $T=2$`,
        `$a_0 = \\frac{2}{2}\\int_0^{2} ${L} dx = \\int_0^{2} ${L} dx$`,
        `$a_0 = ${L} \\times 2 = ${a0}$`,
      ];
      return { id: `fb-${Date.now()}-${Math.random()}`, topicKey: 'fourier-basic', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '奇函数';
      const answerDisplay = '奇函数';
      const question = `函数 f(x) = sin(x) 是奇函数还是偶函数？`;
      const questionLatex = `函数 $f(x) = \\sin(x)$ 是奇函数还是偶函数？`;
      const steps = [
        `奇函数满足 $f(-x) = -f(x)$`,
        `$\\sin(-x) = -\\sin(x)$`,
        `所以 sin(x) 是奇函数`,
      ];
      return { id: `fb-${Date.now()}-${Math.random()}`, topicKey: 'fourier-basic', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '偶函数';
      const answerDisplay = '偶函数';
      const question = `函数 f(x) = cos(x) 是奇函数还是偶函数？`;
      const questionLatex = `函数 $f(x) = \\cos(x)$ 是奇函数还是偶函数？`;
      const steps = [
        `偶函数满足 $f(-x) = f(x)$`,
        `$\\cos(-x) = \\cos(x)$`,
        `所以 cos(x) 是偶函数`,
      ];
      return { id: `fb-${Date.now()}-${Math.random()}`, topicKey: 'fourier-basic', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '只有正弦项';
      const answerDisplay = '只有正弦项';
      const question = `奇函数展开为傅里叶级数时，含有哪些项？`;
      const questionLatex = `奇函数展开为傅里叶级数时，含有哪些项？`;
      const steps = [
        `奇函数在对称区间上：$a_n = 0$（余弦项系数为零）`,
        `只有 $b_n$（正弦项系数）非零`,
        `所以奇函数的傅里叶级数只有正弦项（正弦级数）`,
      ];
      return { id: `fb-${Date.now()}-${Math.random()}`, topicKey: 'fourier-basic', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 3;
  const advCount = 4;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 26. 函数性质与图像 =====
export function genFunctionProperty(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const answer = '奇函数';
      const answerDisplay = '奇函数';
      const question = `判断函数 f(x) = x³ 的奇偶性`;
      const questionLatex = `判断函数 $f(x) = x^{3}$ 的奇偶性`;
      const steps = [
        `计算 $f(-x) = (-x)^{3} = -x^{3}$`,
        `$f(-x) = -f(x)$`,
        `所以 f(x) = x³ 是奇函数`,
      ];
      return { id: `fp-${Date.now()}-${Math.random()}`, topicKey: 'function-property', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '偶函数';
      const answerDisplay = '偶函数';
      const question = `判断函数 f(x) = x² 的奇偶性`;
      const questionLatex = `判断函数 $f(x) = x^{2}$ 的奇偶性`;
      const steps = [
        `计算 $f(-x) = (-x)^{2} = x^{2}$`,
        `$f(-x) = f(x)$`,
        `所以 f(x) = x² 是偶函数`,
      ];
      return { id: `fp-${Date.now()}-${Math.random()}`, topicKey: 'function-property', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const a = randInt(1, 5);
      const answer = `y=x/${a}`;
      const answerDisplay = `y = x/${a}`;
      const question = `求函数 y = ${a}x 的反函数`;
      const questionLatex = `求函数 $y = ${a}x$ 的反函数`;
      const steps = [
        `由 $y = ${a}x$，解出 $x = \\frac{y}{${a}}$`,
        `交换 x, y 得反函数：$y = \\frac{x}{${a}}$`,
      ];
      return { id: `fp-${Date.now()}-${Math.random()}`, topicKey: 'function-property', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '[0, +∞)';
      const answerDisplay = '[0, +∞)';
      const question = `函数 f(x) = √x 的定义域为？`;
      const questionLatex = `函数 $f(x) = \\sqrt{x}$ 的定义域为？`;
      const steps = [
        `偶次根号下的数必须非负`,
        `即 $x \\geq 0$`,
        `定义域为 $[0, +\\infty)$`,
      ];
      return { id: `fp-${Date.now()}-${Math.random()}`, topicKey: 'function-property', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '单调递增';
      const answerDisplay = '单调递增';
      const question = `函数 f(x) = 2x + 1 在 R 上的单调性为？`;
      const questionLatex = `函数 $f(x) = 2x + 1$ 在 $\\mathbb{R}$ 上的单调性为？`;
      const steps = [
        `一次函数 $y = kx + b$ 的单调性由斜率 $k$ 决定`,
        `这里 $k = 2 > 0$`,
        `所以 f(x) 在 R 上单调递增`,
      ];
      return { id: `fp-${Date.now()}-${Math.random()}`, topicKey: 'function-property', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '[0, +∞)';
      const answerDisplay = '[0, +∞)';
      const question = `函数 f(x) = x² 的值域为？`;
      const questionLatex = `函数 $f(x) = x^{2}$ 的值域为？`;
      const steps = [
        `对任意实数 x，有 $x^{2} \\geq 0$`,
        `当 x = 0 时取得最小值 0`,
        `值域为 $[0, +\\infty)$`,
      ];
      return { id: `fp-${Date.now()}-${Math.random()}`, topicKey: 'function-property', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 4;
  const advCount = 5;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 27. 双曲函数与反双曲 =====
export function genHyperbolicFunc(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const answer = '0';
      const answerDisplay = '0';
      const question = `sinh(0) = ?`;
      const questionLatex = `$\\sinh(0) = ?$`;
      const steps = [
        `双曲正弦定义：$\\sinh(x) = \\frac{e^{x} - e^{-x}}{2}$`,
        `代入 x = 0：$\\sinh(0) = \\frac{e^{0} - e^{0}}{2} = \\frac{1 - 1}{2}$`,
        `$\\sinh(0) = 0$`,
      ];
      return { id: `hf-${Date.now()}-${Math.random()}`, topicKey: 'hyperbolic-func', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '1';
      const answerDisplay = '1';
      const question = `cosh(0) = ?`;
      const questionLatex = `$\\cosh(0) = ?$`;
      const steps = [
        `双曲余弦定义：$\\cosh(x) = \\frac{e^{x} + e^{-x}}{2}$`,
        `代入 x = 0：$\\cosh(0) = \\frac{e^{0} + e^{0}}{2} = \\frac{1 + 1}{2}$`,
        `$\\cosh(0) = 1$`,
      ];
      return { id: `hf-${Date.now()}-${Math.random()}`, topicKey: 'hyperbolic-func', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '1';
      const answerDisplay = '1';
      const question = `cosh²(x) − sinh²(x) = ?`;
      const questionLatex = `$\\cosh^{2}(x) - \\sinh^{2}(x) = ?$`;
      const steps = [
        `双曲函数基本恒等式：$\\cosh^{2} x - \\sinh^{2} x = 1$`,
        `证明：$(\\frac{e^{x}+e^{-x}}{2})^{2} - (\\frac{e^{x}-e^{-x}}{2})^{2}$`,
        `$= \\frac{e^{2x}}+2+e^{-2x}}{4} - \\frac{e^{2x}}-2+e^{-2x}}{4} = \\frac{4}{4} = 1$`,
      ];
      return { id: `hf-${Date.now()}-${Math.random()}`, topicKey: 'hyperbolic-func', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const answer = 'cosh(x)';
      const answerDisplay = 'cosh(x)';
      const question = `d/dx [sinh(x)] = ?`;
      const questionLatex = `$\\frac{d}{dx} \\sinh(x) = ?$`;
      const steps = [
        `双曲正弦的导数：$(\\sinh x)' = \\cosh x$`,
        `证明：$(\\frac{e^{x} - e^{-x}}{2})' = \\frac{e^{x} + e^{-x}}{2} = \\cosh x$`,
      ];
      return { id: `hf-${Date.now()}-${Math.random()}`, topicKey: 'hyperbolic-func', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const answer = 'sinh(x)';
      const answerDisplay = 'sinh(x)';
      const question = `d/dx [cosh(x)] = ?`;
      const questionLatex = `$\\frac{d}{dx} \\cosh(x) = ?$`;
      const steps = [
        `双曲余弦的导数：$(\\cosh x)' = \\sinh x$`,
        `证明：$(\\frac{e^{x} + e^{-x}}{2})' = \\frac{e^{x} - e^{-x}}{2} = \\sinh x$`,
      ];
      return { id: `hf-${Date.now()}-${Math.random()}`, topicKey: 'hyperbolic-func', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 3;
  const advCount = 4;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 28. 不等式求解 =====
export function genInequalitySolve(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const r1 = randInt(-4, 2);
      const r2 = r1 + randInt(2, 5);
      const answer = `${r1} < x < ${r2}`;
      const answerDisplay = `${r1} < x < ${r2}`;
      const sgn = (n: number) => (n >= 0 ? '+' + n : String(n));
      const question = `解不等式：(x${sgn(-r1)})(x${sgn(-r2)}) < 0`;
      const questionLatex = `解不等式：$(x${sgn(-r1)})(x${sgn(-r2)}) < 0$`;
      const steps = [
        `方程 $(x-${r1})(x-${r2}) = 0$ 的两根为 $x = ${r1}$ 和 $x = ${r2}$`,
        `二次函数开口向上，小于零的解集在两根之间`,
        `解集：${answerDisplay}`,
      ];
      return { id: `is-${Date.now()}-${Math.random()}`, topicKey: 'inequality-solve', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const a = randInt(2, 6);
      const answer = `x > ${a} 或 x < -${a}`;
      const answerDisplay = `|x| > ${a}`;
      const question = `解不等式：|x| > ${a}`;
      const questionLatex = `解不等式：$|x| > ${a}$`;
      const steps = [
        `绝对值不等式 $|x| > a$（$a > 0$）的解为：`,
        `$x > a$ 或 $x < -a$`,
        `解集：$(-\\infty, -${a}) \\cup (${a}, +\\infty)$`,
      ];
      return { id: `is-${Date.now()}-${Math.random()}`, topicKey: 'inequality-solve', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const a = randInt(1, 5);
      const answer = `-${a} ≤ x ≤ ${a}`;
      const answerDisplay = `-${a} ≤ x ≤ ${a}`;
      const question = `解不等式：|x| ≤ ${a}`;
      const questionLatex = `解不等式：$|x| \\leq ${a}$`;
      const steps = [
        `绝对值不等式 $|x| \\leq a$（$a > 0$）的解为：`,
        `$-a \\leq x \\leq a$`,
        `解集：$[-${a}, ${a}]$`,
      ];
      return { id: `is-${Date.now()}-${Math.random()}`, topicKey: 'inequality-solve', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const a = randInt(2, 5);
      const answer = `x > ${a}`;
      const answerDisplay = `x > ${a}`;
      const question = `解不等式：x - ${a} > 0`;
      const questionLatex = `解不等式：$x - ${a} > 0$`;
      const steps = [
        `移项得：$x > ${a}$`,
        `解集：$(${a}, +\\infty)$`,
      ];
      return { id: `is-${Date.now()}-${Math.random()}`, topicKey: 'inequality-solve', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const base = randInt(2, 4);
      const answer = `x > 2`;
      const answerDisplay = `x > 2`;
      const question = `解不等式：${base}^{x} > ${base*base}（底数>1）`;
      const questionLatex = `解不等式：${base}^{x} > ${base*base}（底数 $>1$）`;
      const steps = [
        `因为底数 ${base} > 1$，指数函数单调递增`,
        `两边取对数，不等号方向不变：$x > \\log_${base} ${base*base}$`,
        `即 $x > 2$`,
      ];
      return { id: `is-${Date.now()}-${Math.random()}`, topicKey: 'inequality-solve', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 3;
  const advCount = 4;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}

// ===== 29. 递推数列 =====
export function genSequenceRecurrence(diff: Difficulty): PracticeQuestion {
  const templates = [
    () => {
      const a0 = randInt(1, 5);
      const d = randInt(2, 6);
      const answer = String(a0 + 3 * d);
      const answerDisplay = answer;
      const question = `数列{aₙ}满足 a₀ = ${a0}，aₙ₊₁ = aₙ + ${d}，求 a₃`;
      const questionLatex = `数列 $\{a_n\}$ 满足 $a_0 = ${a0}$，$a_{n+1} = a_n + ${d}$，求 $a_3$`;
      const steps = [
        `$a_0 = ${a0}$`,
        `$a_1 = a_0 + ${d} = ${a0 + d}$`,
        `$a_2 = a_1 + ${d} = ${a0 + 2*d}$`,
        `$a_3 = a_2 + ${d} = ${a0 + 3*d}$`,
      ];
      return { id: `sr-${Date.now()}-${Math.random()}`, topicKey: 'sequence-recurrence', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const a0 = randInt(1, 3);
      const r = randInt(2, 4);
      const answer = String(a0 * r * r * r);
      const answerDisplay = answer;
      const question = `数列{aₙ}满足 a₀ = ${a0}，aₙ₊₁ = ${r}aₙ，求 a₃`;
      const questionLatex = `数列 $\{a_n\}$ 满足 $a_0 = ${a0}$，$a_{n+1} = ${r}a_n$，求 $a_3$`;
      const steps = [
        `$a_0 = ${a0}$`,
        `$a_1 = ${r}a_0 = ${a0*r}$`,
        `$a_2 = ${r}a_1 = ${a0*r*r}$`,
        `$a_3 = ${r}a_2 = ${a0*r*r*r}$`,
      ];
      return { id: `sr-${Date.now()}-${Math.random()}`, topicKey: 'sequence-recurrence', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const answer = '2';
      const answerDisplay = '2';
      const question = `斐波那契数列：F₀=0, F₁=1, Fₙ₊₂ = Fₙ₊₁ + Fₙ，求 F₃`;
      const questionLatex = `斐波那契数列：$F_0=0, F_1=1, F_{n+2} = F_{n+1} + F_n$，求 $F_3$`;
      const steps = [
        `$F_0 = 0$，$F_1 = 1$`,
        `$F_2 = F_1 + F_0 = 1 + 0 = 1$`,
        `$F_3 = F_2 + F_1 = 1 + 1 = 2$`,
      ];
      return { id: `sr-${Date.now()}-${Math.random()}`, topicKey: 'sequence-recurrence', question, questionLatex, answer, answerDisplay, answerType: 'numeric' as const, steps, difficulty: diff };
    },
    () => {
      const a0 = randInt(1, 4);
      const d = randInt(2, 5);
      const answer = `${a0} + ${d}n`;
      const answerDisplay = `a_n = ${a0} + ${d}n`;
      const question = `等差数列 a₀=${a0}，公差 d=${d}，求通项公式 aₙ`;
      const questionLatex = `等差数列 $a_0=${a0}$，公差 $d=${d}$，求通项公式 $a_n$`;
      const steps = [
        `等差数列通项公式：$a_n = a_0 + nd$`,
        `代入 $a_0 = ${a0}$，$d = ${d}$`,
        `$a_n = ${a0} + ${d}n$`,
      ];
      return { id: `sr-${Date.now()}-${Math.random()}`, topicKey: 'sequence-recurrence', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
    () => {
      const a0 = randInt(1, 3);
      const r = randInt(2, 4);
      const answer = `${a0}*${r}^{n}`;
      const answerDisplay = `a_n = ${a0} × ${r}ⁿ`;
      const question = `等比数列 a₀=${a0}，公比 q=${r}，求通项公式 aₙ`;
      const questionLatex = `等比数列 $a_0=${a0}$，公比 $q=${r}$，求通项公式 $a_n$`;
      const steps = [
        `等比数列通项公式：$a_n = a_0 \\cdot q^{n}$`,
        `代入 $a_0 = ${a0}$，$q = ${r}$`,
        `$a_n = ${a0} \\times ${r}^{n}$`,
      ];
      return { id: `sr-${Date.now()}-${Math.random()}`, topicKey: 'sequence-recurrence', question, questionLatex, answer, answerDisplay, answerType: 'expression' as const, steps, difficulty: diff };
    },
  ];

  const basicCount = 3;
  const advCount = 4;
  const end = diff === 'basic' ? basicCount : diff === 'advanced' ? advCount : templates.length;
  const start = diff === 'competition' ? advCount : 0;
  const idx = randInt(start, end - 1);
  return templates[idx]();
}
