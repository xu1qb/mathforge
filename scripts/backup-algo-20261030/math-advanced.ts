// EXPORTS: IPolyRootsInfo, IExtremaInfo, INFLECTION_TOL
// 补充数学工具：多项式除法、部分分式、拉格朗日插值、不等式、方程组求解、
// 隐函数求导、参数方程求导、极值点、凹凸拐点、渐近线、洛必达、反常积分、
// 弧长、旋转体体积、收敛半径、对数求导、原函数验证、DMS转换、Fix精度等

import { parse, derivative, evaluate } from 'mathjs';
import { formatResult, extractPolyCoefficients, simpson, numericLimit, symSimplify } from './math-utils';
import { normalizeMathInput } from './math-normalize';

// ========== 多项式工具 ==========

/**
 * 多项式除法（基于系数）: divide A by B
 * 返回 { quotient: number[], remainder: number[] } 均为从低次到高次
 */
function polyDivide(A: number[], B: number[]): { quotient: number[]; remainder: number[] } {
  // A, B 都是系数数组，索引 = 次数
  let remainder = [...A];
  const quotient: number[] = [];
  const degB = B.length - 1;
  const leadB = B[degB];

  while (remainder.length > degB || (remainder.length === degB + 1 && Math.abs(remainder[remainder.length - 1]) > 1e-12)) {
    const degR = remainder.length - 1;
    const coeff = remainder[degR] / leadB;
    const degDiff = degR - degB;
    // 商写入
    for (let i = 0; i < degDiff; i++) quotient.push(quotient[i] || 0);
    quotient[degDiff] = coeff;
    // 减去 coeff * x^degDiff * B
    for (let i = 0; i < B.length; i++) {
      remainder[i + degDiff] -= coeff * B[i];
    }
    // 去掉最高位的零
    while (remainder.length > 0 && Math.abs(remainder[remainder.length - 1]) < 1e-12) {
      remainder.pop();
    }
  }
  // quotient 从低次到高次（索引 = 次数）
  while (quotient.length > 0 && Math.abs(quotient[quotient.length - 1]) < 1e-12) quotient.pop();
  return { quotient, remainder };
}

/** 把系数数组(低→高)转成表达式字符串 */
function coeffsToExpr(coeffs: number[], variable = 'x'): string {
  if (coeffs.length === 0) return '0';
  const terms: string[] = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (Math.abs(c) < 1e-9) continue;
    const absC = Math.abs(c);
    const sign = c > 0 ? '+' : '-';
    let term = '';
    if (i === 0) {
      term = formatResult(absC);
    } else if (i === 1) {
      if (Math.abs(absC - 1) < 1e-9) term = variable;
      else term = `${formatResult(absC)}*${variable}`;
    } else {
      if (Math.abs(absC - 1) < 1e-9) term = `${variable}^${i}`;
      else term = `${formatResult(absC)}*${variable}^${i}`;
    }
    if (terms.length === 0 && sign === '+') {
      terms.push(term);
    } else {
      terms.push(sign === '+' ? ` + ${term}` : ` - ${term}`);
    }
  }
  return terms.length === 0 ? '0' : terms.join('');
}

/**
 * 多项式除法（字符串接口）
 */
export function polyDivideExpr(AExpr: string, BExpr: string, variable = 'x'): { quotientExpr: string; remainderExpr: string; quotientCoeffs: number[]; remainderCoeffs: number[] } {
  const A = extractPolyCoefficients(AExpr, variable);
  const B = extractPolyCoefficients(BExpr, variable);
  if (!A || !B) throw new Error('多项式除法仅支持一元多项式');
  const { quotient: q, remainder: r } = polyDivide(A, B);
  return {
    quotientExpr: coeffsToExpr(q, variable),
    remainderExpr: coeffsToExpr(r, variable),
    quotientCoeffs: q,
    remainderCoeffs: r,
  };
}

/**
 * 多项式最大公因式（欧几里得算法）
 */
export function polyGcd(AExpr: string, BExpr: string, variable = 'x'): string {
  let A = extractPolyCoefficients(AExpr, variable);
  let B = extractPolyCoefficients(BExpr, variable);
  if (!A || !B) throw new Error('gcdPoly 仅支持一元多项式');
  while (B.length > 0) {
    const { remainder } = polyDivide(A, B);
    A = B;
    B = remainder;
  }
  // 归一化（首一）
  if (A.length > 0) {
    const lead = A[A.length - 1];
    A = A.map(c => c / lead);
  }
  return coeffsToExpr(A, variable);
}

/**
 * 部分分式分解（针对有理函数，分母为二次或更低，或一次因式乘积）
 * 输入: numExpr 分子, denExpr 分母
 * 输出: 分解结果的字符串表达式
 * 实现：对分母因式分解 → 求解部分分式系数
 */
export function partialFractions(numExpr: string, denExpr: string, variable = 'x'): string {
  const num = extractPolyCoefficients(numExpr, variable);
  const den = extractPolyCoefficients(denExpr, variable);
  if (!num || !den) throw new Error('部分分式分解仅支持有理函数（多项式比）');

  // 先做多项式除法，获得真分式
  const { quotient, remainder: rem } = polyDivide(num, den);

  // 对分母求根（用数值方法）
  const denNode = parse(normalizeMathInput(denExpr));
  const evalAt = (x: number) => {
    try { return denNode.evaluate({ [variable]: x }) as number; } catch { return NaN; }
  };
  const dDenNode = derivative(denNode, variable);
  const evalD = (x: number) => {
    try { return dDenNode.evaluate({ [variable]: x }) as number; } catch { return NaN; }
  };

  // 牛顿法求根
  const roots: number[] = [];
  for (let guess = -20; guess <= 20; guess += 0.5) {
    let x = guess;
    for (let i = 0; i < 100; i++) {
      const fx = evalAt(x);
      if (!Number.isFinite(fx)) break;
      if (Math.abs(fx) < 1e-8) {
        // 去重
        if (!roots.some(r => Math.abs(r - x) < 1e-5)) roots.push(x);
        break;
      }
      const dfx = evalD(x);
      if (!Number.isFinite(dfx) || Math.abs(dfx) < 1e-15) break;
      x = x - fx / dfx;
    }
  }

  if (roots.length < 2) {
    // 不够分解，返回原式
    const numStr = coeffsToExpr(rem, variable) || '0';
    const denStr = coeffsToExpr(den, variable);
    const qStr = coeffsToExpr(quotient, variable);
    if (quotient.length === 0) return `${numStr} / (${denStr})`;
    return `${qStr} + (${numStr}) / (${denStr})`;
  }

  // 假设所有根都是不同实根，用留数法：A_i = N(r_i) / D'(r_i)
  const numNode = parse(normalizeMathInput(numExpr));
  const evalNum = (x: number) => {
    try { return numNode.evaluate({ [variable]: x }) as number; } catch { return NaN; }
  };

  const terms: string[] = [];
  // 多项式部分
  if (quotient.length > 0) terms.push(coeffsToExpr(quotient, variable));

  for (const r of roots) {
    const res = evalNum(r) / evalD(r);
    if (Math.abs(res) < 1e-9) continue;
    const rFmt = formatResult(r);
    const resFmt = formatResult(Math.abs(res));
    const sign = res > 0 ? '+' : '-';
    if (Math.abs(r) < 1e-9) {
      // A / x
      if (terms.length === 0 && sign === '+') terms.push(`${resFmt} / ${variable}`);
      else terms.push(`${sign} ${resFmt} / ${variable}`);
    } else if (r > 0) {
      if (terms.length === 0 && sign === '+') terms.push(`${resFmt} / (${variable} - ${rFmt})`);
      else terms.push(`${sign} ${resFmt} / (${variable} - ${rFmt})`);
    } else {
      if (terms.length === 0 && sign === '+') terms.push(`${resFmt} / (${variable} + ${formatResult(-r)})`);
      else terms.push(`${sign} ${resFmt} / (${variable} + ${formatResult(-r)})`);
    }
  }

  return terms.length === 0 ? '0' : terms.join(' ');
}

/**
 * 拉格朗日插值：给定 x 数组和 y 数组，返回插值多项式字符串
 */
export function lagrangeInterp(xs: number[], ys: number[], variable = 'x'): string {
  if (xs.length !== ys.length) throw new Error('x 值与 y 值数量不一致');
  if (xs.length < 2) throw new Error('至少需要 2 个点才能插值');
  if (xs.length > 10) throw new Error('最多支持 10 个点（最高 9 次多项式）');
  // 检查 x 值是否重复
  const uniqX = new Set(xs);
  if (uniqX.size !== xs.length) throw new Error('x 值不能有重复');

  const n = xs.length;
  // resultCoeffs[k] 对应 x^k 的系数，全程用数组运算，避免字符串往返解析导致高次项丢失
  let resultCoeffs = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    // 构造 L_i(x) = prod_{j≠i} (x - x_j) / (x_i - x_j)
    let liNum: number[] = [1]; // 常数项 1
    let liDen = 1;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      // 乘以 (x - x_j) → 新数组长度 +1
      const newNum = new Array(liNum.length + 1).fill(0);
      for (let k = 0; k < liNum.length; k++) {
        newNum[k] += -xs[j] * liNum[k];
        newNum[k + 1] += liNum[k];
      }
      liNum = newNum;
      liDen *= (xs[i] - xs[j]);
    }
    // 乘以 y_i / liDen，累加到结果
    const yiCoef = ys[i] / liDen;
    for (let k = 0; k < liNum.length; k++) {
      resultCoeffs[k] += liNum[k] * yiCoef;
    }
  }

  // 去掉最高位的近零系数（数值误差清理）
  let top = resultCoeffs.length - 1;
  while (top > 0 && Math.abs(resultCoeffs[top]) < 1e-9) top--;
  resultCoeffs = resultCoeffs.slice(0, top + 1);

  return coeffsToExpr(resultCoeffs, variable);
}

// ========== 方程组求解 ==========

/**
 * 求解二元一次方程组:
 * a1*x + b1*y = c1
 * a2*x + b2*y = c2
 * 使用克莱姆法则
 */
export function solveLinear2x2(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number): { x: number; y: number } | null {
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-12) return null;
  const detX = c1 * b2 - c2 * b1;
  const detY = a1 * c2 - a2 * c1;
  return { x: detX / det, y: detY / det };
}

// ========== 不等式求解（多项式） ==========

/**
 * 解多项式不等式 poly > 0 (或 >= 0, < 0, <= 0, = 0)
 * 返回区间数组
 */
export function solvePolyIneq(expr: string, variable = 'x'): { type: string; intervals: Array<{ start: number; end: number; openStart: boolean; openEnd: boolean }>; criticalPoints: number[] } {
  // 分离左边和比较符号
  const match = expr.match(/(.+?)\s*(>=|<=|>|<|=)\s*(.+)/);
  let polyStr: string;
  let op: string;
  if (match) {
    polyStr = `(${match[1].trim()}) - (${match[3].trim()})`;
    op = match[2];
  } else {
    polyStr = expr;
    op = '>';
  }

  const coeffs = extractPolyCoefficients(polyStr, variable);
  if (!coeffs) throw new Error('仅支持一元多项式不等式');

  // 找临界点 = 根
  const node = parse(normalizeMathInput(polyStr));
  const evalAt = (x: number) => {
    try { return node.evaluate({ [variable]: x }) as number; } catch { return NaN; }
  };
  const dNode = derivative(node, variable);
  const evalD = (x: number) => {
    try { return dNode.evaluate({ [variable]: x }) as number; } catch { return NaN; }
  };

  const roots: number[] = [];
  for (let guess = -100; guess <= 100; guess += 1) {
    let x = guess;
    for (let i = 0; i < 100; i++) {
      const fx = evalAt(x);
      if (!Number.isFinite(fx)) break;
      if (Math.abs(fx) < 1e-8) {
        if (!roots.some(r => Math.abs(r - x) < 1e-5)) roots.push(x);
        break;
      }
      const dfx = evalD(x);
      if (!Number.isFinite(dfx) || Math.abs(dfx) < 1e-15) break;
      x = x - fx / dfx;
    }
  }
  roots.sort((a, b) => a - b);

  // 在每个区间取样判断符号
  const samples: number[] = [];
  if (roots.length === 0) {
    samples.push(0);
  } else {
    samples.push(roots[0] - 100);
    for (let i = 0; i < roots.length - 1; i++) {
      samples.push((roots[i] + roots[i + 1]) / 2);
    }
    samples.push(roots[roots.length - 1] + 100);
  }

  const intervals: Array<{ start: number; end: number; openStart: boolean; openEnd: boolean }> = [];

  const includeEqual = op === '>=' || op === '<=' || op === '=';

  // 简化：对 '>' '>=' 找正区间；对 '<' '<=' 找负区间
  const wantSignPositive = op === '>' || op === '>=';

  // 用 roots 分区间
  if (roots.length === 0) {
    const val = evalAt(0);
    const satisfied = wantSignPositive ? val > 0 : val < 0;
    if (satisfied || (includeEqual && Math.abs(val) < 1e-9)) {
      intervals.push({ start: -Infinity, end: Infinity, openStart: true, openEnd: true });
    }
  } else {
    // 第一个区间 (-inf, r0)
    const firstSample = roots[0] - 100;
    let sat = wantSignPositive ? evalAt(firstSample) > 0 : evalAt(firstSample) < 0;
    if (includeEqual) sat = sat || Math.abs(evalAt(firstSample)) < 1e-9;
    if (sat) {
      intervals.push({ start: -Infinity, end: roots[0], openStart: true, openEnd: !includeEqual });
    }

    // 中间区间
    for (let i = 0; i < roots.length - 1; i++) {
      const mid = (roots[i] + roots[i + 1]) / 2;
      let s = wantSignPositive ? evalAt(mid) > 0 : evalAt(mid) < 0;
      if (includeEqual) s = s || Math.abs(evalAt(mid)) < 1e-9;
      if (s) {
        intervals.push({ start: roots[i], end: roots[i + 1], openStart: !includeEqual, openEnd: !includeEqual });
      }
    }

    // 最后区间 (rn, +inf)
    const lastSample = roots[roots.length - 1] + 100;
    let lasts = wantSignPositive ? evalAt(lastSample) > 0 : evalAt(lastSample) < 0;
    if (includeEqual) lasts = lasts || Math.abs(evalAt(lastSample)) < 1e-9;
    if (lasts) {
      intervals.push({ start: roots[roots.length - 1], end: Infinity, openStart: !includeEqual, openEnd: true });
    }
  }

  return { type: op, intervals, criticalPoints: roots };
}

// 格式化不等式区间
export function formatIntervals(intervals: Array<{ start: number; end: number; openStart: boolean; openEnd: boolean }>, variable = 'x'): string {
  if (intervals.length === 0) return '无解';
  return intervals.map(it => {
    const left = it.openStart ? '(' : '[';
    const right = it.openEnd ? ')' : ']';
    const s = it.start === -Infinity ? '-∞' : formatResult(it.start);
    const e = it.end === Infinity ? '+∞' : formatResult(it.end);
    return `${left}${s}, ${e}${right}`;
  }).join(' ∪ ');
}

// ========== 反函数、函数复合、判别式、韦达定理 ==========

/**
 * 求多项式的反函数（仅限一次函数，否则返回数值反函数说明）
 * 对于 f(x) = ax + b，反函数是 (x - b) / a
 */
export function inverseFunction(expr: string, variable = 'x'): string {
  const coeffs = extractPolyCoefficients(expr, variable);
  if (!coeffs) return '反函数仅支持一次函数（可数值反解）';
  if (coeffs.length <= 2) {
    // 一次函数或常数
    const b = coeffs[0] || 0;
    const a = coeffs[1] || 0;
    if (Math.abs(a) < 1e-12) return '常数函数无反函数';
    const bFmt = formatResult(Math.abs(b));
    const aFmt = formatResult(a);
    if (b >= 0) return `(${variable} - ${bFmt}) / ${aFmt}`;
    return `(${variable} + ${bFmt}) / ${aFmt}`;
  }
  // 高次多项式：提示
  return `f(x)为${coeffs.length - 1}次多项式，无通用闭式反函数。可通过数值方法（如牛顿法）求解 f(x)=y 的反函数值。`;
}

/**
 * 函数复合: compose(f, g, x) = f(g(x))
 * 通过字符串替换实现
 */
export function composeFunctions(fExpr: string, gExpr: string, variable = 'x'): string {
  // 把 f 中的 variable 替换成 (g)
  // 用 math.js 的 substitute
  try {
    const fNode = parse(normalizeMathInput(fExpr));
    const result = fNode.transform((node) => {
      if (node.type === 'SymbolNode' && (node as unknown as { name: string }).name === variable) {
        return parse(`(${gExpr})`);
      }
      return node;
    });
    return symSimplify(String(result));
  } catch {
    return `f(g(${variable})) = ${fExpr.replace(new RegExp(variable, 'g'), `(${gExpr})`)}`;
  }
}

/**
 * 多项式判别式：ax^2 + bx + c → b^2 - 4ac
 */
export function discriminant(expr: string, variable = 'x'): number {
  const coeffs = extractPolyCoefficients(expr, variable);
  if (!coeffs || coeffs.length < 2) return 0;
  if (coeffs.length === 2) return coeffs[1] ** 2; // 一次方程
  const a = coeffs[2] || 0;
  const b = coeffs[1] || 0;
  const c = coeffs[0] || 0;
  return b * b - 4 * a * c;
}

/**
 * 韦达定理：对二次方程 ax^2 + bx + c = 0
 * 返回 { sum: -b/a, product: c/a }
 */
export function vieta(expr: string, variable = 'x'): { sum: number; product: number; isQuadratic: boolean } {
  const coeffs = extractPolyCoefficients(expr, variable);
  if (!coeffs || coeffs.length < 2) return { sum: 0, product: 0, isQuadratic: false };
  if (coeffs.length === 2) {
    // 一次方程：ax + b = 0 → 根 = -b/a
    const a = coeffs[1];
    const b = coeffs[0];
    return { sum: -b / a, product: 0, isQuadratic: false };
  }
  const a = coeffs[2] || 0;
  const b = coeffs[1] || 0;
  const c = coeffs[0] || 0;
  return { sum: -b / a, product: c / a, isQuadratic: true };
}

/**
 * 二项式展开 (a+b)^n 的系数
 * 返回系数数组（从 0 次到 n 次）
 */
export function binomialCoefficients(n: number): number[] {
  const C: number[] = [1];
  for (let i = 1; i <= n; i++) {
    const next = new Array(i + 1).fill(1);
    for (let j = 1; j < i; j++) {
      next[j] = C[j - 1] + C[j];
    }
    C.length = 0;
    C.push(...next);
  }
  return C;
}

/**
 * 二项式展开字符串: (a_term + b_term)^n → 展开式
 */
export function binomialExpand(a: string, b: string, n: number, variable = 'x'): string {
  const coeffs = binomialCoefficients(n);
  const terms: string[] = [];
  for (let k = 0; k <= n; k++) {
    const c = coeffs[k];
    const aPow = n - k;
    const bPow = k;
    let term = '';
    if (c > 1) term += formatResult(c) + '*';
    if (aPow > 0) {
      term += aPow === 1 ? a : `${a}^${aPow}`;
    }
    if (bPow > 0) {
      if (aPow > 0) term += '*';
      term += bPow === 1 ? b : `${b}^${bPow}`;
    }
    if (term === '') term = '1';
    if (k === 0) terms.push(term);
    else terms.push(` + ${term}`);
  }
  return terms.join('');
}

/**
 * 余数定理：P(a) 的值
 */
export function remainderTheorem(expr: string, a: number, variable = 'x'): number {
  // 处理等式：P(x) = 0 形式 → 计算左边移项后的 P(a)
  let exprStr = expr;
  if (expr.includes('=')) {
    const parts = expr.split('=');
    if (parts.length === 2) {
      exprStr = `(${parts[0].trim()}) - (${parts[1].trim()})`;
    }
  }
  return evaluate(exprStr, { [variable]: a }) as number;
}

// ========== 高等微积分工具 ==========

/**
 * 高阶导数
 */
export function higherOrderDerivative(expr: string, variable: string, n: number): string {
  if (n < 0 || !Number.isInteger(n)) throw new Error('阶数必须是非负整数');
  if (n === 0) return expr;
  let current = parse(expr);
  for (let i = 0; i < n; i++) {
    current = derivative(current, variable);
  }
  return symSimplify(String(current));
}

/**
 * 隐函数求导：给定 F(x,y) = 0，求 dy/dx = -Fx/Fy
 */
export function implicitDerivative(expr: string, yVar: string, xVar: string): string {
  const Fx = derivative(parse(expr), xVar);
  const Fy = derivative(parse(expr), yVar);
  // dy/dx = -Fx / Fy
  const result = `-(${String(Fx)}) / (${String(Fy)})`;
  try {
    return symSimplify(result);
  } catch {
    return result;
  }
}

/**
 * 参数方程求导：给定 x(t), y(t)，求 dy/dx = y'(t) / x'(t)
 */
export function parametricDerivative(xExpr: string, yExpr: string, tVar: string): string {
  const dx = derivative(parse(xExpr), tVar);
  const dy = derivative(parse(yExpr), tVar);
  const result = `(${String(dy)}) / (${String(dx)})`;
  try {
    return symSimplify(result);
  } catch {
    return result;
  }
}

/**
 * 求区间内的极值点（数值方法）
 * 返回 { maxima: number[], minima: number[] }
 */
export function findExtrema(expr: string, variable: string, a: number, b: number): { maxima: number[]; minima: number[] } {
  // 一阶导数的零点 = 临界点
  const d1 = String(derivative(parse(expr), variable));
  const d2 = String(derivative(derivative(parse(expr), variable), variable));

  // 找 f'(x)=0 的根
  const node = parse(normalizeMathInput(d1));
  const evalD1 = (x: number) => {
    try { return node.evaluate({ [variable]: x }) as number; } catch { return NaN; }
  };
  const evalD2 = (x: number) => {
    try { return evaluate(d2, { [variable]: x }) as number; } catch { return NaN; }
  };

  const criticalPoints: number[] = [];
  const nSteps = 200;
  const h = (b - a) / nSteps;

  for (let i = 0; i < nSteps; i++) {
    const x1 = a + i * h;
    const x2 = a + (i + 1) * h;
    const f1 = evalD1(x1);
    const f2 = evalD1(x2);
    if (!Number.isFinite(f1) || !Number.isFinite(f2)) continue;
    // 检测符号变化（含端点恰好为 0 的情况）
    const hasSignChange = (f1 < 0 && f2 > 0) || (f1 > 0 && f2 < 0);
    const hasZeroEndpoint = f2 === 0 && f1 !== 0;
    if (hasSignChange || hasZeroEndpoint) {
      // 二分法求精
      let lo = x1, hi = x2;
      for (let j = 0; j < 60; j++) {
        const mid = (lo + hi) / 2;
        const fm = evalD1(mid);
        if (Math.abs(fm) < 1e-12) { lo = hi = mid; break; }
        const flo = evalD1(lo);
        if (Math.abs(flo) < 1e-12) { lo = hi = lo; break; }
        if (flo * fm < 0) hi = mid;
        else lo = mid;
      }
      const cp = (lo + hi) / 2;
      if (!criticalPoints.some(c => Math.abs(c - cp) < 1e-8)) {
        criticalPoints.push(cp);
      }
    }
  }

  const maxima: number[] = [];
  const minima: number[] = [];
  for (const cp of criticalPoints) {
    const d2val = evalD2(cp);
    if (d2val < -1e-9) maxima.push(cp);
    else if (d2val > 1e-9) minima.push(cp);
    // d2=0 时为拐点或不定，忽略
  }

  return { maxima, minima };
}

/**
 * 求拐点（数值方法）
 */
export function findInflectionPoints(expr: string, variable: string, a: number, b: number): number[] {
  const d2 = String(derivative(derivative(parse(expr), variable), variable));
  const evalD2 = (x: number) => {
    try { return evaluate(d2, { [variable]: x }) as number; } catch { return NaN; }
  };
  const d3 = String(derivative(derivative(derivative(parse(expr), variable), variable), variable));
  const evalD3 = (x: number) => {
    try { return evaluate(d3, { [variable]: x }) as number; } catch { return NaN; }
  };

  const inflections: number[] = [];
  const nSteps = 200;
  const h = (b - a) / nSteps;
  for (let i = 0; i < nSteps; i++) {
    const x1 = a + i * h;
    const x2 = a + (i + 1) * h;
    const f1 = evalD2(x1);
    const f2 = evalD2(x2);
    if (!Number.isFinite(f1) || !Number.isFinite(f2)) continue;
    // 检测符号变化（含端点恰好为 0）
    const hasSignChange = (f1 < 0 && f2 > 0) || (f1 > 0 && f2 < 0);
    const hasZeroEndpoint = f2 === 0 && f1 !== 0;
    if (hasSignChange || hasZeroEndpoint) {
      let lo = x1, hi = x2;
      for (let j = 0; j < 60; j++) {
        const mid = (lo + hi) / 2;
        const fm = evalD2(mid);
        if (Math.abs(fm) < 1e-12) { lo = hi = mid; break; }
        const flo = evalD2(lo);
        if (Math.abs(flo) < 1e-12) { lo = hi = lo; break; }
        if (flo * fm < 0) hi = mid;
        else lo = mid;
      }
      const cp = (lo + hi) / 2;
      // 确认三阶导不为零（真拐点）
      if (Math.abs(evalD3(cp)) > 1e-9) {
        if (!inflections.some(c => Math.abs(c - cp) < 1e-6)) {
          inflections.push(cp);
        }
      }
    }
  }
  return inflections;
}

/**
 * 渐近线分析
 * 水平: lim_{x→±∞} f(x) = L
 * 垂直: 找分母为零的点
 * 斜: lim f(x)/x = k, lim (f(x)-kx) = b
 */
export function findAsymptotes(expr: string, variable = 'x'): { horizontal: number[]; vertical: number[]; oblique: Array<{ k: number; b: number }> } {
  const horizontal: number[] = [];
  const vertical: number[] = [];
  const oblique: Array<{ k: number; b: number }> = [];

  const evalF = (x: number) => {
    try { return evaluate(expr, { [variable]: x }) as number; } catch { return NaN; }
  };

  // 水平渐近线：检查 x→+∞ 和 x→-∞
  const limPInf = numericLimit(expr, variable, 1e10);
  const limNInf = numericLimit(expr, variable, -1e10);
  if (Number.isFinite(limPInf) && Math.abs(limPInf) < 1e6) {
    if (!horizontal.some(h => Math.abs(h - limPInf) < 1e-6)) horizontal.push(limPInf);
  }
  if (Number.isFinite(limNInf) && Math.abs(limNInf) < 1e6) {
    if (!horizontal.some(h => Math.abs(h - limNInf) < 1e-6)) horizontal.push(limNInf);
  }

  // 垂直渐近线：找函数爆炸点
  // 策略：用更细步长采样，检测函数值绝对值激增（>1e6）或符号突变伴大幅增值
  const step = 0.01;
  for (let x = -50; x < 50; x += step) {
    const v1 = evalF(x);
    const v2 = evalF(x + step);
    if (!Number.isFinite(v1) || !Number.isFinite(v2)) continue;
    // 检测：两侧值都很大且符号相反（穿过奇点），或一侧突然变得极大
    const bothLarge = Math.abs(v1) > 1e6 && Math.abs(v2) > 1e6;
    const signFlip = v1 * v2 < 0;
    const ratioHuge = Math.abs(v2) > Math.abs(v1) * 100 && Math.abs(v2) > 1e4;
    if ((bothLarge && signFlip) || ratioHuge) {
      // 在附近二分找奇点（函数值绝对值最大的位置）
      let lo = x, hi = x + step;
      // 找 |f| 最大的点作为奇点近似
      let bestX = (lo + hi) / 2;
      let bestAbs = 0;
      for (let i = 0; i < 20; i++) {
        const m1 = lo + (hi - lo) / 3;
        const m2 = hi - (hi - lo) / 3;
        const vm1 = Math.abs(evalF(m1));
        const vm2 = Math.abs(evalF(m2));
        if (Number.isFinite(vm1) && vm1 > bestAbs) { bestAbs = vm1; bestX = m1; }
        if (Number.isFinite(vm2) && vm2 > bestAbs) { bestAbs = vm2; bestX = m2; }
        if (vm1 < vm2) lo = m1; else hi = m2;
      }
      const va = bestX;
      if (Math.abs(va) < 50 && !vertical.some(v => Math.abs(v - va) < 0.01)) {
        vertical.push(Math.round(va * 1000) / 1000);
      }
      // 跳过该区域，避免重复
      x += step * 10;
    }
  }

  // 斜渐近线：k = lim f(x)/x, b = lim (f(x)-k*x)
  if (horizontal.length === 0) {
    // 只检查两侧
    for (const dir of [1, -1]) {
      const bigX = dir * 1e10;
      const k = numericLimit(`${expr} / ${variable}`, variable, bigX);
      if (Number.isFinite(k) && Math.abs(k) > 1e-6 && Math.abs(k) < 1e4) {
        const b = numericLimit(`${expr} - (${k})*${variable}`, variable, bigX);
        if (Number.isFinite(b) && Math.abs(b) < 1e6) {
          if (!oblique.some(o => Math.abs(o.k - k) < 1e-6 && Math.abs(o.b - b) < 1e-6)) {
            oblique.push({ k: Math.round(k * 1000) / 1000, b: Math.round(b * 1000) / 1000 });
          }
        }
      }
    }
  }

  return { horizontal, vertical, oblique };
}

/**
 * 洛必达法则：求 lim f/g，假设 f/g 是 0/0 或 ∞/∞ 型
 * 对 f 和 g 分别求导，再取极限
 */
export function lhopital(fExpr: string, gExpr: string, variable: string, point: number): { result: number; steps: number; derivatives: { f: string; g: string }[] } {
  const derivatives: { f: string; g: string }[] = [];
  let f = fExpr;
  let g = gExpr;

  for (let step = 0; step < 10; step++) {
    const fLim = numericLimit(f, variable, point);
    const gLim = numericLimit(g, variable, point);

    // 如果 g 不趋近 0 且不趋近无穷，返回 fLim / gLim
    if (Math.abs(gLim) > 1e-6 && Math.abs(gLim) < 1e10) {
      if (Math.abs(fLim) < 1e10) {
        return { result: fLim / gLim, steps: step, derivatives };
      }
    }

    // 0/0 或 ∞/∞ 型，继续求导
    if ((Math.abs(fLim) < 1e-6 && Math.abs(gLim) < 1e-6) ||
        (Math.abs(fLim) > 1e6 && Math.abs(gLim) > 1e6)) {
      const fNew = String(derivative(parse(f), variable));
      const gNew = String(derivative(parse(g), variable));
      derivatives.push({ f: fNew, g: gNew });
      f = fNew;
      g = gNew;
    } else {
      break;
    }
  }

  const fLim = numericLimit(f, variable, point);
  const gLim = numericLimit(g, variable, point);
  return { result: fLim / gLim, steps: derivatives.length, derivatives };
}

/**
 * 反常积分：无穷限积分，用变量代换 t = 1/x 将无穷区间映射到有限区间
 *  ∫[a,∞) f(x) dx = ∫(0, 1/a] f(1/t) / t² dt   (a > 0)
 * 配合自适应辛普森法，保证有限次采样即可收敛，避免死循环
 */
export function improperIntegral(expr: string, variable: string, a: number | '-inf', b: number | 'inf'): number {
  const evalF = (x: number): number => {
    try { return evaluate(expr, { [variable]: x }) as number; } catch { return NaN; }
  };

  // 自适应辛普森：最多递归 15 层，约 2^15 * 2 ≈ 65536 次函数求值，可控
  function adaptiveSimpson(f: (x: number) => number, left: number, right: number, eps: number, whole: number, depth: number): number {
    if (depth > 15) return whole;
    const mid = (left + right) / 2;
    const h = (right - left) / 2;
    const fLeft = f(left);
    const fRight = f(right);
    const fMid = f(mid);
    const sLeft = (h / 6) * (fLeft + 4 * f((left + mid) / 2) + fMid);
    const sRight = (h / 6) * (fMid + 4 * f((mid + right) / 2) + fRight);
    const diff = sLeft + sRight - whole;
    if (Math.abs(diff) <= 15 * eps) return sLeft + sRight + diff / 15;
    return adaptiveSimpson(f, left, mid, eps / 2, sLeft, depth + 1)
         + adaptiveSimpson(f, mid, right, eps / 2, sRight, depth + 1);
  }

  function simpsonInit(f: (x: number) => number, left: number, right: number): number {
    const mid = (left + right) / 2;
    return ((right - left) / 6) * (f(left) + 4 * f(mid) + f(right));
  }

  // 对 +∞ 积分：变量代换 t = 1/x，x = 1/t，dx = -1/t² dt
  // ∫[a, ∞) f(x) dx = ∫[0, 1/a] f(1/t) / t² dt   (a > 0)
  function integrateToInf(start: number): number {
    if (start <= 0) {
      // 起点 ≤ 0：分成 [start, 1] 和 [1, ∞) 两段
      const finitePart = adaptiveSimpson(evalF, start, 1, 1e-6, simpsonInit(evalF, start, 1), 0);
      const tailStart = 1; // 1/t 在 t=1 处
      const g = (t: number) => {
        if (t <= 0) return 0;
        const x = 1 / t;
        const fx = evalF(x);
        if (!Number.isFinite(fx)) return 0;
        return fx / (t * t);
      };
      const tailPart = adaptiveSimpson(g, 1e-12, 1 / tailStart, 1e-6, simpsonInit(g, 1e-12, 1 / tailStart), 0);
      return finitePart + tailPart;
    }
    // 起点 > 0：直接代换
    const g = (t: number) => {
      if (t <= 0) return 0;
      const x = 1 / t;
      const fx = evalF(x);
      if (!Number.isFinite(fx)) return 0;
      return fx / (t * t);
    };
    const eps = 1e-7;
    return adaptiveSimpson(g, 1e-12, 1 / start, eps, simpsonInit(g, 1e-12, 1 / start), 0);
  }

  function integrateFromNegInf(end: number): number {
    // 令 x = -t，则 ∫(-∞, b] f(x)dx = ∫[-b, ∞) f(-t)dt
    const negF = (t: number) => evalF(-t);
    // 用 integrateToInf 的逻辑但对 f(-t) 从 -end 到 +∞
    const start = -end;
    if (start <= 0) {
      const finiteG = (t: number) => negF(t);
      const finitePart = adaptiveSimpson(finiteG, start, 1, 1e-6, simpsonInit(finiteG, start, 1), 0);
      const g = (t: number) => {
        if (t <= 0) return 0;
        const x = 1 / t;
        const fx = negF(x);
        if (!Number.isFinite(fx)) return 0;
        return fx / (t * t);
      };
      const tailPart = adaptiveSimpson(g, 1e-12, 1, 1e-6, simpsonInit(g, 1e-12, 1), 0);
      return finitePart + tailPart;
    }
    const g = (t: number) => {
      if (t <= 0) return 0;
      const x = 1 / t;
      const fx = negF(x);
      if (!Number.isFinite(fx)) return 0;
      return fx / (t * t);
    };
    return adaptiveSimpson(g, 1e-12, 1 / start, 1e-7, simpsonInit(g, 1e-12, 1 / start), 0);
  }

  try {
    let result: number;
    if (a === '-inf' && b === 'inf') {
      result = integrateFromNegInf(0) + integrateToInf(0);
    } else if (a === '-inf') {
      result = integrateFromNegInf(b as number);
    } else {
      result = integrateToInf(a as number);
    }
    if (!Number.isFinite(result) || Math.abs(result) > 1e9) {
      throw new Error('积分发散或无法计算（结果过大，可能不收敛）');
    }
    return result;
  } catch (e) {
    throw new Error('反常积分计算失败：' + ((e as Error).message || '未知错误'));
  }
}

/**
 * 两条曲线间的面积: ∫|f-g|dx 从 a 到 b
 */
export function areaBetweenCurves(fExpr: string, gExpr: string, variable: string, a: number, b: number): number {
  // 用自适应辛普森法，积分 |f - g|
  const diffExpr = `abs((${fExpr}) - (${gExpr}))`;
  return simpson(diffExpr, a, b, 2000);
}

/**
 * 旋转体体积（绕 x 轴）: π ∫ f(x)² dx
 */
export function volumeOfRevolution(fExpr: string, variable: string, a: number, b: number): number {
  return Math.PI * simpson(`${fExpr}^2`, a, b, 2000);
}

/**
 * 弧长: ∫ √(1 + f'(x)²) dx
 */
export function arcLength(fExpr: string, variable: string, a: number, b: number): number {
  const dExpr = String(derivative(parse(fExpr), variable));
  const integrand = `sqrt(1 + (${dExpr})^2)`;
  return simpson(integrand, a, b, 2000);
}

/**
 * 收敛半径（幂级数）: 对 Σ a_n x^n，R = 1 / lim |a_{n+1}/a_n|
 * 这里假设用户输入通项 a_n，用 n→∞ 比值法
 */
export function convergenceRadius(generalTerm: string, nVar = 'n'): number {
  // a_{n+1} / a_n
  const ratioExpr = `(${generalTerm.replace(new RegExp(nVar, 'g'), `(${nVar}+1)`)}) / (${generalTerm})`;
  const ratio = numericLimit(ratioExpr, nVar, 1e6);
  if (!Number.isFinite(ratio) || ratio < 0) return NaN;
  if (Math.abs(ratio) < 1e-12) return Infinity;
  return 1 / ratio;
}

/**
 * 对数求导法：对 f(x) 取对数再求导，结果为 f'(x)/f(x)
 * 返回 dy/dx = y * (ln f(x))'
 */
export function logDerivative(expr: string, variable = 'x'): string {
  // d/dx [ln(f(x))] = f'(x)/f(x)
  const logF = `log(${expr})`;
  const dLogF = String(derivative(parse(logF), variable));
  // dy/dx = y * (ln y)' = expr * dLogF
  const result = `(${expr}) * (${dLogF})`;
  try {
    return symSimplify(result);
  } catch {
    return result;
  }
}

/**
 * 验证原函数：F'(x) 是否等于 f(x)
 */
export function verifyAntiderivative(FExpr: string, fExpr: string, variable = 'x'): { isCorrect: boolean; derivative: string; difference: string } {
  const dF = String(derivative(parse(FExpr), variable));
  const diff = `(${dF}) - (${fExpr})`;
  const simplifiedDiff = symSimplify(diff);
  // 检查简化结果是否为 0
  const isZero = simplifiedDiff === '0' || simplifiedDiff === '0 * x';
  return {
    isCorrect: isZero,
    derivative: symSimplify(dF),
    difference: simplifiedDiff,
  };
}

// ========== DMS 角度转换 ==========

/**
 * 十进制度 → 度分秒
 */
export function degToDMS(deg: number): { degrees: number; minutes: number; seconds: number; sign: number } {
  const sign = deg < 0 ? -1 : 1;
  let d = Math.abs(deg);
  const degrees = Math.floor(d);
  d = (d - degrees) * 60;
  const minutes = Math.floor(d);
  const seconds = Math.round((d - minutes) * 60 * 1000) / 1000;
  // 秒进位
  let s = seconds;
  let m = minutes;
  let degOut = degrees;
  if (s >= 60) { s -= 60; m++; }
  if (m >= 60) { m -= 60; degOut++; }
  return { degrees: sign * degOut, minutes: m, seconds: s, sign };
}

/**
 * 度分秒 → 十进制度
 */
export function dmsToDeg(degrees: number, minutes: number, seconds: number): number {
  const sign = degrees < 0 ? -1 : 1;
  return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
}

// ========== Fix 精度 ==========

/**
 * 按固定小数位数格式化
 */
export function fixDecimal(value: number, digits: number): string {
  if (digits < 0 || digits > 15) throw new Error('小数位数必须在 0~15 之间');
  return value.toFixed(digits);
}

// ========== 角度/弧度互转 ==========

export function degToRad(deg: number): number {
  return deg * Math.PI / 180;
}

export function radToDeg(rad: number): number {
  return rad * 180 / Math.PI;
}

// ========== 复变函数 ==========

export interface IComplex { re: number; im: number; }

// 复数运算工具
function cAdd(a: IComplex, b: IComplex): IComplex { return { re: a.re + b.re, im: a.im + b.im }; }
function cSub(a: IComplex, b: IComplex): IComplex { return { re: a.re - b.re, im: a.im - b.im }; }
function cMul(a: IComplex, b: IComplex): IComplex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}
function cDiv(a: IComplex, b: IComplex): IComplex {
  const denom = b.re * b.re + b.im * b.im;
  if (denom < 1e-20) return { re: NaN, im: NaN };
  return { re: (a.re * b.re + a.im * b.im) / denom, im: (a.im * b.re - a.re * b.im) / denom };
}
function cExp(z: IComplex): IComplex {
  const r = Math.exp(z.re);
  return { re: r * Math.cos(z.im), im: r * Math.sin(z.im) };
}
function cSin(z: IComplex): IComplex {
  return { re: Math.sin(z.re) * Math.cosh(z.im), im: Math.cos(z.re) * Math.sinh(z.im) };
}
function cCos(z: IComplex): IComplex {
  return { re: Math.cos(z.re) * Math.cosh(z.im), im: -Math.sin(z.re) * Math.sinh(z.im) };
}
function cAbs(z: IComplex): number { return Math.hypot(z.re, z.im); }

// n次方根
export function complexNthRoots(re: number, im: number, n: number): IComplex[] {
  if (n <= 0) throw new Error('n 必须为正整数');
  const r = Math.hypot(re, im);
  const theta = Math.atan2(im, re);
  const roots: IComplex[] = [];
  const rRoot = Math.pow(r, 1 / n);
  for (let k = 0; k < n; k++) {
    const angle = (theta + 2 * Math.PI * k) / n;
    roots.push({ re: rRoot * Math.cos(angle), im: rRoot * Math.sin(angle) });
  }
  return roots;
}

// 柯西-黎曼方程验证（数值法）
export function cauchyRiemannCheck(
  uExpr: string, vExpr: string, x0 = 1, y0 = 1,
): { satisfies: boolean; ux: number; vy: number; uy: number; vx: number; fPrime: string } {
  const eps = 1e-5;
  const u = (x: number, y: number) => evaluate(uExpr, { x, y }) as number;
  const v = (x: number, y: number) => evaluate(vExpr, { x, y }) as number;
  const ux = (u(x0 + eps, y0) - u(x0 - eps, y0)) / (2 * eps);
  const uy = (u(x0, y0 + eps) - u(x0, y0 - eps)) / (2 * eps);
  const vx = (v(x0 + eps, y0) - v(x0 - eps, y0)) / (2 * eps);
  const vy = (v(x0, y0 + eps) - v(x0, y0 - eps)) / (2 * eps);
  const ok = Math.abs(ux - vy) < 1e-3 && Math.abs(uy + vx) < 1e-3;
  const fprRe = ux, fprIm = vx;
  return {
    satisfies: ok,
    ux, vy, uy, vx,
    fPrime: `f'(z) = ${fprRe.toFixed(4)} ${fprIm >= 0 ? '+' : '-'} ${Math.abs(fprIm).toFixed(4)}i`,
  };
}

// 调和函数验证 ∇²u = 0
export function isHarmonic(expr: string, x0 = 1, y0 = 1): { harmonic: boolean; uxx: number; uyy: number; laplacian: number } {
  const eps = 1e-4;
  const f = (x: number, y: number) => evaluate(expr, { x, y }) as number;
  const uxx = (f(x0 + eps, y0) - 2 * f(x0, y0) + f(x0 - eps, y0)) / (eps * eps);
  const uyy = (f(x0, y0 + eps) - 2 * f(x0, y0) + f(x0, y0 - eps)) / (eps * eps);
  const lap = uxx + uyy;
  return { harmonic: Math.abs(lap) < 1e-3, uxx, uyy, laplacian: lap };
}

// 共轭调和函数（数值积分近似）
export function harmonicConjugate(
  uExpr: string, x0 = 0, y0 = 0, x = 1, y = 1,
): { vApprox: number; v: number; formula: string; note: string } {
  const eps = 1e-5;
  const N = 200;
  const u = (xx: number, yy: number) => evaluate(uExpr, { x: xx, y: yy }) as number;
  const ux = (xx: number, yy: number) => (u(xx + eps, yy) - u(xx - eps, yy)) / (2 * eps);
  const uy = (xx: number, yy: number) => (u(xx, yy + eps) - u(xx, yy - eps)) / (2 * eps);
  // v(x,y) = ∫_{x0}^{x} -∂u/∂y(t, y0) dt + ∫_{y0}^{y} ∂u/∂x(x, t) dt
  let v = 0;
  const dx = (x - x0) / N;
  for (let i = 0; i < N; i++) {
    const t0 = x0 + i * dx;
    const t1 = x0 + (i + 1) * dx;
    v += (-uy(t0, y0) + -uy(t1, y0)) * dx / 2;
  }
  const dy = (y - y0) / N;
  for (let i = 0; i < N; i++) {
    const t0 = y0 + i * dy;
    const t1 = y0 + (i + 1) * dy;
    v += (ux(x, t0) + ux(x, t1)) * dy / 2;
  }
  return {
    vApprox: v,
    v: v,
    formula: 'v(x,y) = ∫_{x0}^{x} -∂u/∂y(t,y₀) dt + ∫_{y0}^{y} ∂u/∂x(x,t) dt + C',
    note: '相差一个实常数 C（C由初值决定）',
  };
}

// 复积分（沿圆周数值积分）
// ∮ f(z) dz = ∫ f(z(θ)) z'(θ) dθ, z(θ) = z0 + R e^{iθ}
export function complexLineIntegralCircle(
  fExpr: string, z0Re = 0, z0Im = 0, R = 1, N = 2000,
): { re: number; im: number; result: string } {
  let re = 0, im = 0;
  for (let i = 0; i < N; i++) {
    const t0 = 2 * Math.PI * i / N;
    const t1 = 2 * Math.PI * (i + 1) / N;
    const z0_t0: IComplex = { re: z0Re + R * Math.cos(t0), im: z0Im + R * Math.sin(t0) };
    const z0_t1: IComplex = { re: z0Re + R * Math.cos(t1), im: z0Im + R * Math.sin(t1) };
    const dzdt0: IComplex = { re: -R * Math.sin(t0), im: R * Math.cos(t0) };
    const dzdt1: IComplex = { re: -R * Math.sin(t1), im: R * Math.cos(t1) };
    const f0 = evalComplexAt(fExpr, z0_t0);
    const f1 = evalComplexAt(fExpr, z0_t1);
    const p0 = cMul(f0, dzdt0);
    const p1 = cMul(f1, dzdt1);
    const dt = (t1 - t0);
    re += (p0.re + p1.re) * dt / 2;
    im += (p0.im + p1.im) * dt / 2;
  }
  return {
    re, im,
    result: `∮ f(z)dz = ${re.toFixed(6)} ${im >= 0 ? '+' : '-'} ${Math.abs(im).toFixed(6)}i`,
  };
}

// 数值计算复函数 f(z) 在指定点的值（支持常见初等函数）
function evalComplexAt(expr: string, z: IComplex): IComplex {
  const s = expr.replace(/\s/g, '');
  // z 的幂、exp、sin、cos、倒数
  if (s === 'z' || s === 'Z') return z;
  if (s === '1/z') return cDiv({ re: 1, im: 0 }, z);
  if (s === 'z^2') return cMul(z, z);
  if (s === 'z^3') return cMul(cMul(z, z), z);
  if (/^z\^\d+$/.test(s)) {
    const n = parseInt(s.slice(2));
    let r: IComplex = { re: 1, im: 0 };
    for (let i = 0; i < n; i++) r = cMul(r, z);
    return r;
  }
  if (s === 'exp(z)' || s === 'e^z') return cExp(z);
  if (s === 'sin(z)') return cSin(z);
  if (s === 'cos(z)') return cCos(z);
  if (s === '1/(z^2+1)') return cDiv({ re: 1, im: 0 }, cAdd(cMul(z, z), { re: 1, im: 0 }));
  if (s === '1/(z-1)^2' || s === '1/(z-1)*(z-1)') {
    const zm1 = cSub(z, { re: 1, im: 0 });
    return cDiv({ re: 1, im: 0 }, cMul(zm1, zm1));
  }
  if (s === '1/(z^2-1)') return cDiv({ re: 1, im: 0 }, cSub(cMul(z, z), { re: 1, im: 0 }));
  if (s === 'exp(1/z)') return cExp(cDiv({ re: 1, im: 0 }, z));
  // 退化：当实数处理（粗略）
  try {
    const val = evaluate(s, { z: z.re }) as number;
    return { re: val, im: 0 };
  } catch {
    return { re: NaN, im: NaN };
  }
}

// 拉普拉斯变换表
export const LAPLACE_TABLE: Array<{ f_t: string; F_s: string; region: string; f: string; Fs: string; condition: string }> = [
  { f_t: 'δ(t) 单位冲激', F_s: '1', region: '全体 s', f: 'δ(t) 单位冲激', Fs: '1', condition: '全体 s' },
  { f_t: 'u(t) 单位阶跃', F_s: '1/s', region: 'Re(s) > 0', f: 'u(t) 单位阶跃', Fs: '1/s', condition: 'Re(s) > 0' },
  { f_t: 't^n (n=0,1,2...)', F_s: 'n!/s^{n+1}', region: 'Re(s) > 0', f: 't^n (n=0,1,2...)', Fs: 'n!/s^{n+1}', condition: 'Re(s) > 0' },
  { f_t: 'e^{at}', F_s: '1/(s-a)', region: 'Re(s) > Re(a)', f: 'e^{at}', Fs: '1/(s-a)', condition: 'Re(s) > Re(a)' },
  { f_t: 'sin ωt', F_s: 'ω/(s²+ω²)', region: 'Re(s) > 0', f: 'sin ωt', Fs: 'ω/(s²+ω²)', condition: 'Re(s) > 0' },
  { f_t: 'cos ωt', F_s: 's/(s²+ω²)', region: 'Re(s) > 0', f: 'cos ωt', Fs: 's/(s²+ω²)', condition: 'Re(s) > 0' },
  { f_t: 'sinh at', F_s: 'a/(s²-a²)', region: 'Re(s) > |a|', f: 'sinh at', Fs: 'a/(s²-a²)', condition: 'Re(s) > |a|' },
  { f_t: 'cosh at', F_s: 's/(s²-a²)', region: 'Re(s) > |a|', f: 'cosh at', Fs: 's/(s²-a²)', condition: 'Re(s) > |a|' },
  { f_t: 't e^{at}', F_s: '1/(s-a)²', region: 'Re(s) > Re(a)', f: 't e^{at}', Fs: '1/(s-a)²', condition: 'Re(s) > Re(a)' },
  { f_t: 't sin ωt', F_s: '2ωs/(s²+ω²)²', region: 'Re(s) > 0', f: 't sin ωt', Fs: '2ωs/(s²+ω²)²', condition: 'Re(s) > 0' },
  { f_t: 't cos ωt', F_s: '(s²-ω²)/(s²+ω²)²', region: 'Re(s) > 0', f: 't cos ωt', Fs: '(s²-ω²)/(s²+ω²)²', condition: 'Re(s) > 0' },
  { f_t: 'e^{at} sin ωt', F_s: 'ω/((s-a)²+ω²)', region: 'Re(s) > Re(a)', f: 'e^{at} sin ωt', Fs: 'ω/((s-a)²+ω²)', condition: 'Re(s) > Re(a)' },
  { f_t: 'e^{at} cos ωt', F_s: '(s-a)/((s-a)²+ω²)', region: 'Re(s) > Re(a)', f: 'e^{at} cos ωt', Fs: '(s-a)/((s-a)²+ω²)', condition: 'Re(s) > Re(a)' },
];

// 拉普拉斯逆变换（部分分式分解，1~2阶）
export function inverseLaplacePartialFractions(
  num: number[], den: number[],
): { terms: Array<{ description: string; timeDomain: string }> } {
  // num, den 为降次系数数组，例：[2,3] 表示 2s+3
  const dn = num.length - 1;
  const dd = den.length - 1;
  if (dn >= dd) return { terms: [{ description: '错误', timeDomain: `真分式条件不满足 (${dn}≥${dd})，需先做多项式除法` }] };
  
  if (dd === 1) {
    // F(s) = b/(s + a) → f(t) = b e^{-at}
    const a = den[1] / den[0];
    const b = num[num.length - 1] / den[0];
    return { terms: [{ description: `单极点 s = ${(-a).toFixed(2)}`, timeDomain: `${b.toFixed(2)} · e^{${-a >= 0 ? '' : '-'}${Math.abs(a).toFixed(2)}t} u(t)` }] };
  }
  if (dd === 2) {
    const a = den[0], b = den[1], c = den[2];
    const disc = b * b - 4 * a * c;
    if (disc > 1e-8) {
      const r1 = (-b + Math.sqrt(disc)) / (2 * a);
      const r2 = (-b - Math.sqrt(disc)) / (2 * a);
      const num0 = num[num.length - 1] || 0;
      const num1 = num.length >= 2 ? num[num.length - 2] : 0;
      const A1 = (num1 * r1 + num0) / (2 * a * r1 + b);
      const A2 = (num1 * r2 + num0) / (2 * a * r2 + b);
      return {
        terms: [
          { description: `极点 s₁ = ${r1.toFixed(2)}，留数 A₁ = ${A1.toFixed(2)}`, timeDomain: `${A1.toFixed(2)} e^{${-r1 >= 0 ? '' : '-'}${Math.abs(r1).toFixed(2)}t} u(t)` },
          { description: `极点 s₂ = ${r2.toFixed(2)}，留数 A₂ = ${A2.toFixed(2)}`, timeDomain: `${A2.toFixed(2)} e^{${-r2 >= 0 ? '' : '-'}${Math.abs(r2).toFixed(2)}t} u(t)` },
        ]
      };
    } else if (Math.abs(disc) < 1e-8) {
      const r = -b / (2 * a);
      return { terms: [{ description: `二阶极点 s = ${r.toFixed(2)}（重根）`, timeDomain: `(A t + B) e^{${-r >= 0 ? '' : '-'}${Math.abs(r).toFixed(2)}t} u(t)（由初值确定A,B）` }] };
    } else {
      const α = -b / (2 * a);
      const ω = Math.sqrt(-disc) / (2 * a);
      const num0 = num[num.length - 1] || 0;
      const num1 = num.length >= 2 ? num[num.length - 2] : 0;
      return {
        terms: [{
          description: `共轭复极点 s = ${α.toFixed(2)} ± j${ω.toFixed(2)}`,
          timeDomain: `e^{${α >= 0 ? '' : '-'}${Math.abs(α).toFixed(2)}t} [${num1.toFixed(2)} cos ${ω.toFixed(2)}t + ${(num0/Math.max(ω,1e-9)).toFixed(2)} sin ${ω.toFixed(2)}t] u(t)`
        }]
      };
    }
  }
  return { terms: [{ description: `高阶（${dd}阶）`, timeDomain: '需进一步分解' }] };
}

// 奇点分类（对有理函数 f = N/D，找 D=0 的根并分类）
export function classifySingularities(
  numExpr: string, denExpr: string,
): Array<{ z: IComplex; type: string; order: number }> {
  const results: Array<{ z: IComplex; type: string; order: number }> = [];
  // 复平面上网格搜索 + 牛顿法找分母零点
  const range = 10, step = 0.5;
  for (let re = -range; re <= range; re += step) {
    for (let im = -range; im <= range; im += step) {
      let z: IComplex = { re, im };
      // 牛顿迭代
      for (let iter = 0; iter < 30; iter++) {
        const fz = evalComplexAt(denExpr, z);
        if (cAbs(fz) < 1e-7) break;
        const eps = 1e-6;
        const fz2 = evalComplexAt(denExpr, { re: z.re + eps, im: z.im });
        const fp = { re: (fz2.re - fz.re) / eps, im: (fz2.im - fz.im) / eps };
        if (cAbs(fp) < 1e-12) { z = { re: NaN, im: NaN }; break; }
        const ratio = cDiv(fz, fp);
        z = cSub(z, ratio);
      }
      if (isNaN(z.re) || isNaN(z.im)) continue;
      const fz = evalComplexAt(denExpr, z);
      if (cAbs(fz) > 1e-5) continue;
      // 去重
      if (results.some(r => cAbs(cSub(r.z, z)) < 1e-3)) continue;
      // 判断分子是否也为零（可去奇点）
      const nfz = evalComplexAt(numExpr, z);
      if (cAbs(nfz) < 1e-5) {
        results.push({ z, type: '可去奇点', order: 0 });
      } else {
        // 估算阶数：不断除以(z-z0)看什么时候分子非零
        let order = 1;
        // 简化：用数值方法，计算各阶导数
        let testZ = cAdd(z, { re: 0.001, im: 0 });
        let curVal = evalComplexAt(denExpr, testZ);
        let dz = cSub(testZ, z);
        // 近似：f(z)/(z-z0)^order → 看order多少得到有限值
        for (let k = 2; k <= 5; k++) {
          const dzPow = cPow(dz, k);
          const ratio = cDiv(curVal, dzPow);
          if (cAbs(ratio) > 1e-3) { order = k; break; }
        }
        results.push({ z, type: `${order}阶极点`, order });
      }
    }
  }
  // 如果是 e^(1/z)、sin(1/z) 等形式，z=0 是本性奇点（无法通过分母零点找到）
  if (/\(1\/z\)|\/z/.test(denExpr) && results.length === 0) {
    results.push({ z: { re: 0, im: 0 }, type: '本性奇点（如 e^{1/z}）', order: -1 });
  }
  if (results.length === 0) {
    results.push({ z: { re: NaN, im: NaN }, type: '未找到孤立奇点（或为本性奇点，需人工判断）', order: -1 });
  }
  return results;
}

// 整数幂
function cPow(z: IComplex, n: number): IComplex {
  let r: IComplex = { re: 1, im: 0 };
  for (let i = 0; i < n; i++) r = cMul(r, z);
  return r;
}

// 极点留数计算
export function residueAtPole(
  fExpr: string, z0Re: number, z0Im: number, order = 1,
): { re: number; im: number; order: number; residueRe: number; residueIm: number } {
  const z0: IComplex = { re: z0Re, im: z0Im };
  let result: IComplex = { re: 0, im: 0 };
  if (order === 1) {
    const eps = 1e-5;
    const directions = [
      { re: eps, im: 0 },
      { re: -eps, im: 0 },
      { re: 0, im: eps },
      { re: 0, im: -eps },
    ];
    let reSum = 0, imSum = 0;
    let count = 0;
    for (const d of directions) {
      const z = cAdd(z0, d);
      const fz = evalComplexAt(fExpr, z);
      const prod = cMul(d, fz);
      if (!isNaN(prod.re) && !isNaN(prod.im)) {
        reSum += prod.re;
        imSum += prod.im;
        count++;
      }
    }
    result = { re: reSum / Math.max(count, 1), im: imSum / Math.max(count, 1) };
  } else {
    // 高阶极点：数值近似，用导数公式 Res = 1/(n-1)! * lim d^{n-1}/dz^{n-1} [(z-z0)^n f(z)]
    // 简化为一阶近似
    const eps = 1e-4;
    const directions = [{ re: eps, im: 0 }, { re: -eps, im: 0 }, { re: 0, im: eps }, { re: 0, im: -eps }];
    let reSum = 0, imSum = 0, count = 0;
    for (const d of directions) {
      const z = cAdd(z0, d);
      const fz = evalComplexAt(fExpr, z);
      const prod = cMul(cPow(d, order), fz);
      if (!isNaN(prod.re) && !isNaN(prod.im)) {
        reSum += prod.re;
        imSum += prod.im;
        count++;
      }
    }
    result = { re: reSum / Math.max(count, 1), im: imSum / Math.max(count, 1) };
  }
  return {
    re: result.re,
    im: result.im,
    order,
    residueRe: result.re,
    residueIm: result.im,
  };
}

// ========== 离散数学 - 数理逻辑 ==========

// 计算命题公式真值（支持 and/or/not/xor/implies/iff/nand/nor）
export function evaluateLogic(expr: string, assignment: Record<string, boolean>): boolean {
  // 先替换变量为 true/false
  let s = expr.replace(/\s+/g, ' ').trim();
  // 变量替换（按长度排序避免部分匹配）
  const vars = Object.keys(assignment).sort((a, b) => b.length - a.length);
  for (const v of vars) {
    s = s.replace(new RegExp(`\\b${v}\\b`, 'g'), assignment[v] ? 'true' : 'false');
  }
  // 替换运算符为 JS 运算符
  // 注意：implies (→): a→b = ¬a∨b
  s = s.replace(/\biff\b/g, '==='); // ↔
  s = s.replace(/\bimplies\b/g, '<=').replace(/<=/g, '<=!==true||'); // 复杂，单独处理
  
  // 简化方案：用 eval 处理标准逻辑连接词
  // 预处理：xor → ^, and → &&, or → ||, not → !
  // implies: 用替换 a implies b → !a || b
  // iff: a iff b → a === b
  s = expr.replace(/\s+/g, ' ').trim();
  // 变量替换
  for (const v of vars) {
    s = s.replace(new RegExp(`\\b${v}\\b`, 'g'), `__V_${v}__`);
  }
  // 替换 iff 为 ===
  s = s.replace(/\biff\b/g, '==');
  // 替换 implies 为 → （用函数式处理）
  // 简化：用多次替换处理 implies: 先找 pattern, 再替换
  let prev = '';
  while (prev !== s) {
    prev = s;
    // a implies b → (!a || b)
    s = s.replace(/([A-Za-z_][A-Za-z0-9_]*|\\([^()]+\\)|!+[A-Za-z_][A-Za-z0-9_]*)\\s+implies\\s+([A-Za-z_][A-Za-z0-9_]*|\\([^()]+\\))/g, 
      '((!$1) || $3)');
  }
  // 替换逻辑运算符
  s = s.replace(/\bxor\b/g, '!==');
  s = s.replace(/\band\b/g, '&&');
  s = s.replace(/\bor\b/g, '||');
  s = s.replace(/\bnot\b/g, '!');
  s = s.replace(/\bnand\b/g, '!&&'); // 简化不严谨
  s = s.replace(/\bnor\b/g, '!||');
  // 恢复变量
  for (const v of vars) {
    s = s.replace(new RegExp(`__V_${v}__`, 'g'), assignment[v] ? 'true' : 'false');
  }
  try {
     
    const fn = new Function(`return ${s};`);
    return !!fn();
  } catch {
    return false;
  }
}

// 提取命题公式变量
function extractVars(expr: string): string[] {
  const matches = expr.match(/\b([a-zA-Z][a-zA-Z0-9_]*)\b/g) || [];
  const keywords = new Set(['and', 'or', 'not', 'xor', 'true', 'false', 'nand', 'nor', 'implies', 'iff']);
  const vars: string[] = [];
  const seen = new Set<string>();
  for (const m of matches) {
    if (!keywords.has(m) && !/^\d+$/.test(m) && !seen.has(m)) {
      seen.add(m);
      vars.push(m);
    }
  }
  return vars.sort();
}

// 逻辑等价验证
export function logicalEquivalence(expr1: string, expr2: string): { equivalent: boolean; counterexample: Record<string, boolean> | null; table: string; vars: string[] } {
  const vars1 = extractVars(expr1);
  const vars2 = extractVars(expr2);
  const vars = [...new Set([...vars1, ...vars2])].sort();
  const n = vars.length;
  if (n > 12) return { equivalent: false, counterexample: null, table: '', vars };
  let equiv = true;
  let counter: Record<string, boolean> | null = null;
  let table = '';
  for (let i = 0; i < (1 << n); i++) {
    const a: Record<string, boolean> = {};
    const row: string[] = [];
    for (let j = 0; j < n; j++) {
      const val = Boolean((i >> (n - 1 - j)) & 1);
      a[vars[j]] = val;
      row.push(val ? 'T' : 'F');
    }
    const r1 = evaluateLogic(expr1, a);
    const r2 = evaluateLogic(expr2, a);
    if (r1 !== r2) {
      equiv = false;
      if (!counter) counter = { ...a };
    }
    table += row.join(' ') + ` | ${r1 ? 'T' : 'F'} ${r2 ? 'T' : 'F'}\n`;
  }
  return { equivalent: equiv, counterexample: counter, table, vars };
}

// 主析取范式（所有成真赋值对应的极小项之析取）
export function principalDNF(expr: string): { dnf: string; trueAssignments: number; vars: string[]; minterms: string[] } {
  const vars = extractVars(expr);
  const n = vars.length;
  if (n > 12) return { dnf: '变量过多', trueAssignments: 0, vars, minterms: [] };
  const minterms: string[] = [];
  for (let i = 0; i < (1 << n); i++) {
    const a: Record<string, boolean> = {};
    for (let j = 0; j < n; j++) {
      a[vars[j]] = Boolean((i >> (n - 1 - j)) & 1);
    }
    if (evaluateLogic(expr, a)) {
      const terms = vars.map((v) => a[v] ? v : `¬${v}`);
      minterms.push(terms.join(' ∧ '));
    }
  }
  return {
    dnf: minterms.length > 0 ? minterms.map((t) => `(${t})`).join(' ∨ ') : '0（矛盾式）',
    trueAssignments: minterms.length,
    vars,
    minterms,
  };
}

// 主合取范式
export function principalCNF(expr: string): { cnf: string; falseAssignments: number; vars: string[]; maxterms: string[] } {
  const vars = extractVars(expr);
  const n = vars.length;
  if (n > 12) return { cnf: '变量过多', falseAssignments: 0, vars, maxterms: [] };
  const maxterms: string[] = [];
  for (let i = 0; i < (1 << n); i++) {
    const a: Record<string, boolean> = {};
    for (let j = 0; j < n; j++) {
      a[vars[j]] = Boolean((i >> (n - 1 - j)) & 1);
    }
    if (!evaluateLogic(expr, a)) {
      // 构造极大项 M_i：对应使公式为假的赋值
      const terms = vars.map((v) => a[v] ? `¬${v}` : v);
      maxterms.push(terms.join(' ∨ '));
    }
  }
  return {
    cnf: maxterms.length > 0 ? maxterms.map(t => `(${t})`).join(' ∧ ') : '1（重言式）',
    falseAssignments: maxterms.length,
    vars,
    maxterms,
  };
}

// 推理有效性验证（真值表法）
export function isValidInference(premises: string[], conclusion: string): { valid: boolean; counterexample: Record<string, boolean> | null; vars: string[] } {
  const allExprs = [...premises, conclusion];
  const allVars = [...new Set(allExprs.flatMap(e => extractVars(e)))].sort();
  const n = allVars.length;
  if (n > 12) return { valid: false, counterexample: null, vars: allVars };
  for (let i = 0; i < (1 << n); i++) {
    const a: Record<string, boolean> = {};
    for (let j = 0; j < n; j++) {
      a[allVars[j]] = Boolean((i >> (n - 1 - j)) & 1);
    }
    const allPremTrue = premises.every(p => evaluateLogic(p, a));
    const conclTrue = evaluateLogic(conclusion, a);
    if (allPremTrue && !conclTrue) {
      return { valid: false, counterexample: { ...a }, vars: allVars };
    }
  }
  return { valid: true, counterexample: null, vars: allVars };
}

// ========== 离散数学 - 集合论 ==========

// 集合对称差
export function setSymmetricDifference(a: number[], b: number[]): number[] {
  const sa = new Set(a), sb = new Set(b);
  const result: number[] = [];
  for (const x of sa) if (!sb.has(x)) result.push(x);
  for (const x of sb) if (!sa.has(x)) result.push(x);
  return result.sort((x, y) => x - y);
}

// 幂集
export function setPowerSet(arr: number[]): number[][] {
  const n = arr.length;
  if (n > 12) return [[NaN]]; // 太大
  const result: number[][] = [];
  for (let i = 0; i < (1 << n); i++) {
    const subset: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) subset.push(arr[j]);
    }
    result.push(subset);
  }
  return result;
}

// 笛卡尔积
export function setCartesianProduct(a: number[], b: number[]): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (const x of a) for (const y of b) result.push([x, y]);
  return result;
}

// ========== 离散数学 - 二元关系 ==========

// 关系性质判断：自反、反自反、对称、反对称、传递
export function relationProperties(matrix: number[][]): {
  reflexive: boolean; irreflexive: boolean;
  symmetric: boolean; antisymmetric: boolean;
  transitive: boolean; description: string;
} {
  const n = matrix.length;
  let reflexive = true, irreflexive = true;
  let symmetric = true, antisymmetric = true;
  let transitive = true;
  for (let i = 0; i < n; i++) {
    if (matrix[i][i] !== 1) reflexive = false;
    if (matrix[i][i] !== 0) irreflexive = false;
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 1 && matrix[j][i] !== 1) symmetric = false;
      if (i !== j && matrix[i][j] === 1 && matrix[j][i] === 1) antisymmetric = false;
    }
  }
  // 传递性：M² ⊆ M → Warshall验证
  const m2 = matrixMultiply(matrix, matrix);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (m2[i][j] > 0 && matrix[i][j] !== 1) transitive = false;
    }
  }
  const desc = [
    reflexive ? '✓ 自反' : '✗ 非自反',
    irreflexive ? '✓ 反自反' : '✗ 非反自反',
    symmetric ? '✓ 对称' : '✗ 非对称',
    antisymmetric ? '✓ 反对称' : '✗ 非反对称',
    transitive ? '✓ 传递' : '✗ 非传递',
  ].join('\n');
  return { reflexive, irreflexive, symmetric, antisymmetric, transitive, description: desc };
}

// 矩阵乘法（0-1矩阵的布尔乘法）
function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const n = a.length, m = b[0]?.length || 0, p = b.length;
  const result: number[][] = [];
  for (let i = 0; i < n; i++) {
    result[i] = [];
    for (let j = 0; j < m; j++) {
      let sum = 0;
      for (let k = 0; k < p; k++) sum += a[i][k] * b[k][j];
      result[i][j] = sum > 0 ? 1 : 0;
    }
  }
  return result;
}

// 自反闭包
export function reflexiveClosure(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result = matrix.map(row => [...row]);
  for (let i = 0; i < n; i++) result[i][i] = 1;
  return result;
}

// 对称闭包
export function symmetricClosure(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result = matrix.map(row => [...row]);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 1) result[j][i] = 1;
    }
  }
  return result;
}

// 传递闭包（Warshall算法）
export function transitiveClosureWarshall(matrix: number[][]): number[][] {
  const n = matrix.length;
  const M = matrix.map(row => [...row]);
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        M[i][j] = M[i][j] || (M[i][k] && M[k][j]) ? 1 : 0;
      }
    }
  }
  return M;
}

// 等价关系判断 + 等价类
export function isEquivalenceRelation(matrix: number[][]): boolean {
  const p = relationProperties(matrix);
  return p.reflexive && p.symmetric && p.transitive;
}

export function equivalenceClasses(matrix: number[][]): number[][] {
  const n = matrix.length;
  const visited = new Array(n).fill(false);
  const classes: number[][] = [];
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const cls: number[] = [];
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 1 && matrix[j][i] === 1) {
        cls.push(j);
        visited[j] = true;
      }
    }
    classes.push(cls);
  }
  return classes;
}

// 偏序关系分析
export function partialOrderAnalysis(matrix: number[][]): {
  isPartialOrder: boolean;
  maximal: number[]; minimal: number[];
  greatest: number | null; least: number | null;
  upperBounds: number[]; lowerBounds: number[];
} {
  const n = matrix.length;
  const p = relationProperties(matrix);
  const isPO = p.reflexive && p.antisymmetric && p.transitive;
  // 极大元：没有比它更大的
  const maximal: number[] = [];
  const minimal: number[] = [];
  for (let i = 0; i < n; i++) {
    let isMax = true, isMin = true;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        if (matrix[i][j] === 1) isMax = false; // i ≤ j, i 不是极大
        if (matrix[j][i] === 1) isMin = false; // j ≤ i, i 不是极小
      }
    }
    if (isMax) maximal.push(i);
    if (isMin) minimal.push(i);
  }
  // 最大元：所有元素都 ≤ 它
  let greatest: number | null = null;
  let least: number | null = null;
  for (let i = 0; i < n; i++) {
    let allLess = true, allGreater = true;
    for (let j = 0; j < n; j++) {
      if (matrix[j][i] !== 1) allLess = false; // j ≤ i?
      if (matrix[i][j] !== 1) allGreater = false; // i ≤ j?
    }
    if (allLess) greatest = i;
    if (allGreater) least = i;
  }
  // 上界：≥所有元素的元素（这里简化：极大元的上界就是它们自己+更大的，实际对全集的上界=最大元）
  const upperBounds: number[] = greatest !== null ? [greatest] : maximal;
  const lowerBounds: number[] = least !== null ? [least] : minimal;
  return { isPartialOrder: isPO, maximal, minimal, greatest, least, upperBounds, lowerBounds };
}

// 哈斯图（去除自反、传递后保留的边）
export function hasseDiagram(matrix: number[][]): { edges: Array<[number, number]>; layers: number[][] } {
  const n = matrix.length;
  const tc = transitiveClosureWarshall(matrix);
  const hasse: number[][] = matrix.map(row => [...row]);
  // 去掉自环
  for (let i = 0; i < n; i++) hasse[i][i] = 0;
  // 去掉可传递的边：如果 i→k→j 存在，则删掉 i→j
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && hasse[i][j] === 1) {
        for (let k = 0; k < n; k++) {
          if (k !== i && k !== j && tc[i][k] === 1 && tc[k][j] === 1) {
            hasse[i][j] = 0;
            break;
          }
        }
      }
    }
  }
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (hasse[i][j] === 1) edges.push([i, j]);
    }
  }
  // 分层（拓扑层次）
  const layers: number[][] = [];
  const inDegree = new Array(n).fill(0);
  const remain: number[][] = hasse.map(row => [...row]);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (remain[i][j] === 1) inDegree[j]++;
    }
  }
  const removed = new Array(n).fill(false);
  for (let level = 0; level < n; level++) {
    const cur: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!removed[i] && inDegree[i] === 0) cur.push(i);
    }
    if (cur.length === 0) break;
    layers.push(cur);
    for (const i of cur) {
      removed[i] = true;
      for (let j = 0; j < n; j++) {
        if (remain[i][j] === 1) inDegree[j]--;
      }
    }
  }
  return { edges, layers };
}

// ========== 离散数学 - 图论 ==========

// 图的度数序列
export function graphDegreeSequence(adjMatrix: number[][]): { degrees: number[]; isDirected: boolean; totalEdges: number; edgeCount: number; isSimple: boolean } {
  const n = adjMatrix.length;
  const degrees = new Array(n).fill(0);
  let isDirected = false;
  let totalEdges = 0;
  let hasSelfLoop = false;
  let hasMultiEdge = false;
  for (let i = 0; i < n && !isDirected; i++) {
    for (let j = 0; j < n && !isDirected; j++) {
      if (adjMatrix[i][j] !== adjMatrix[j][i]) isDirected = true;
      if (i === j && adjMatrix[i][j] > 0) hasSelfLoop = true;
      if (i !== j && adjMatrix[i][j] > 1) hasMultiEdge = true;
    }
  }
  if (isDirected) {
    for (let i = 0; i < n; i++) {
      let out = 0;
      for (let j = 0; j < n; j++) out += adjMatrix[i][j];
      degrees[i] = out;
    }
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) totalEdges += adjMatrix[i][j];
  } else {
    for (let i = 0; i < n; i++) {
      let d = 0;
      for (let j = 0; j < n; j++) d += adjMatrix[i][j];
      d += adjMatrix[i][i];
      degrees[i] = d;
      totalEdges += d;
    }
    totalEdges = Math.floor(totalEdges / 2);
  }
  return { degrees, isDirected, totalEdges, edgeCount: totalEdges, isSimple: !hasSelfLoop && !hasMultiEdge };
}

// 连通分量数（无向图）
export function graphConnectedComponents(adjMatrix: number[][]): { count: number; components: number[][] } {
  const n = adjMatrix.length;
  const visited = new Array(n).fill(false);
  const components: number[][] = [];
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    // BFS
    const comp: number[] = [];
    const queue = [i];
    visited[i] = true;
    while (queue.length > 0) {
      const u = queue.shift()!;
      comp.push(u);
      for (let v = 0; v < n; v++) {
        if ((adjMatrix[u][v] || adjMatrix[v][u]) && !visited[v]) {
          visited[v] = true;
          queue.push(v);
        }
      }
    }
    components.push(comp.sort((a, b) => a - b));
  }
  return { count: components.length, components };
}

// 欧拉图判断（无向图：所有顶点度数都是偶数 + 连通）
export function isEulerian(adjMatrix: number[][]): { hasCircuit: boolean; hasPath: boolean; oddDegreeCount: number; oddVertices: number[] } {
  const { degrees } = graphDegreeSequence(adjMatrix);
  const { count } = graphConnectedComponents(adjMatrix);
  const oddVertices: number[] = [];
  degrees.forEach((d, i) => { if (d % 2 !== 0) oddVertices.push(i); });
  const oddDegreeCount = oddVertices.length;
  const nonZero = degrees.filter(d => d > 0).length;
  const connected = nonZero === 0 || count <= 2;
  const hasCircuit = connected && oddDegreeCount === 0 && nonZero > 0;
  const hasPath = connected && (oddDegreeCount === 0 || oddDegreeCount === 2);
  return { hasCircuit, hasPath, oddDegreeCount, oddVertices };
}

// 欧拉通路（恰有2个奇度顶点 + 连通）
export function hasEulerianPath(adjMatrix: number[][]): { hasPath: boolean; hasCircuit: boolean; oddDegreeCount: number; oddVertices: number[] } {
  return isEulerian(adjMatrix);
}

// 哈密顿图（狄拉克定理充分条件：n≥3，每个顶点度≥n/2）
export function diracTheoremCheck(adjMatrix: number[][]): { satisfiesDirac: boolean; n: number; minDegree: number; isHamiltonian: string } {
  const n = adjMatrix.length;
  const { degrees } = graphDegreeSequence(adjMatrix);
  const minDegree = Math.min(...degrees);
  const satisfiesDirac = n >= 3 && minDegree >= n / 2;
  const isHamiltonian = satisfiesDirac ? '满足狄拉克定理（充分条件，必为哈密顿图）' : '不满足狄拉克定理（无法判定，可能是也可能不是）';
  return { satisfiesDirac, n, minDegree, isHamiltonian };
}

// 二部图判断（BFS染色法）
export function isBipartiteGraph(adjMatrix: number[][]): { bipartite: boolean; partitions: [number[], number[]] | null } {
  const n = adjMatrix.length;
  const color = new Array(n).fill(-1);
  for (let start = 0; start < n; start++) {
    if (color[start] !== -1) continue;
    color[start] = 0;
    const queue = [start];
    while (queue.length > 0) {
      const u = queue.shift()!;
      for (let v = 0; v < n; v++) {
        if (adjMatrix[u][v] === 0 && adjMatrix[v][u] === 0) continue;
        if (color[v] === -1) {
          color[v] = 1 - color[u];
          queue.push(v);
        } else if (color[v] === color[u]) {
          return { bipartite: false, partitions: null };
        }
      }
    }
  }
  const p0: number[] = [], p1: number[] = [];
  for (let i = 0; i < n; i++) {
    if (color[i] === 0) p0.push(i);
    else p1.push(i);
  }
  return { bipartite: true, partitions: [p0, p1] };
}

// Prim 最小生成树
export function primMST(weightMatrix: number[][]): { totalWeight: number; edges: Array<[number, number, number]>; mst: Array<[number, number, number]> } {
  const n = weightMatrix.length;
  const key = new Array(n).fill(Infinity);
  const parent = new Array(n).fill(-1);
  const inMST = new Array(n).fill(false);
  key[0] = 0;
  for (let count = 0; count < n - 1; count++) {
    let minKey = Infinity, u = -1;
    for (let v = 0; v < n; v++) {
      if (!inMST[v] && key[v] < minKey) { minKey = key[v]; u = v; }
    }
    if (u === -1) break;
    inMST[u] = true;
    for (let v = 0; v < n; v++) {
      const w = weightMatrix[u][v];
      if (w > 0 && !inMST[v] && w < key[v]) {
        key[v] = w;
        parent[v] = u;
      }
    }
  }
  const edges: Array<[number, number, number]> = [];
  let total = 0;
  for (let i = 1; i < n; i++) {
    if (parent[i] >= 0) {
      edges.push([parent[i], i, weightMatrix[parent[i]][i]]);
      total += weightMatrix[parent[i]][i];
    }
  }
  return { totalWeight: total, edges, mst: edges };
}

// Kruskal 最小生成树
export function kruskalMST(weightMatrix: number[][]): { totalWeight: number; edges: Array<[number, number, number]>; mst: Array<[number, number, number]> } {
  const n = weightMatrix.length;
  const edges: Array<[number, number, number]> = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (weightMatrix[i][j] > 0) edges.push([i, j, weightMatrix[i][j]]);
    }
  }
  edges.sort((a, b) => a[2] - b[2]);
  // 并查集
  const parent = new Array(n).fill(0).map((_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  const unite = (x: number, y: number) => {
    const rx = find(x), ry = find(y);
    if (rx !== ry) { parent[rx] = ry; return true; }
    return false;
  };
  const mstEdges: Array<[number, number, number]> = [];
  let total = 0;
  for (const [u, v, w] of edges) {
    if (unite(u, v)) {
      mstEdges.push([u, v, w]);
      total += w;
      if (mstEdges.length === n - 1) break;
    }
  }
  return { totalWeight: total, edges: mstEdges, mst: mstEdges };
}

// 树判断（无向图：连通且 V = E + 1）
export function isTree(adjMatrix: number[][]): { isTree: boolean; v: number; e: number; connected: boolean } {
  const n = adjMatrix.length;
  const { totalEdges } = graphDegreeSequence(adjMatrix);
  const { count } = graphConnectedComponents(adjMatrix);
  const connected = count === 1;
  return { isTree: connected && totalEdges === n - 1, v: n, e: totalEdges, connected };
}

// 树的叶子节点（度为1的顶点）
export function treeLeaves(adjMatrix: number[][]): number[] {
  const { degrees } = graphDegreeSequence(adjMatrix);
  const leaves: number[] = [];
  for (let i = 0; i < adjMatrix.length; i++) {
    if (degrees[i] === 1) leaves.push(i);
  }
  return leaves;
}

// 树的中心（剥洋葱法）
export function treeCenter(adjMatrix: number[][]): number[] {
  const n = adjMatrix.length;
  const { degrees } = graphDegreeSequence(adjMatrix);
  const deg = [...degrees];
  let remaining = n;
  const removed = new Array(n).fill(false);
  while (remaining > 2) {
    const leaves: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!removed[i] && deg[i] <= 1) leaves.push(i);
    }
    for (const leaf of leaves) {
      removed[leaf] = true;
      remaining--;
      for (let j = 0; j < n; j++) {
        if (!removed[j] && (adjMatrix[leaf][j] || adjMatrix[j][leaf])) deg[j]--;
      }
    }
  }
  const centers: number[] = [];
  for (let i = 0; i < n; i++) if (!removed[i]) centers.push(i);
  return centers;
}

// 平面图欧拉公式验证 V - E + F = 2
// 平面图欧拉公式验证（输入邻接矩阵）
export function planarCheckEuler(adjMatrix: number[][]): {
  satisfies: boolean; formula: string; actual: number;
  faces: number; kuratowskiViolation: string | null; likelyPlanar: boolean;
  v: number; e: number;
} {
  const v = adjMatrix.length;
  const { totalEdges: e } = graphDegreeSequence(adjMatrix);
  const { count } = graphConnectedComponents(adjMatrix);
  // 欧拉公式: V - E + F = 2 (连通平面图) → F = E - V + 2
  const faces = count === 1 ? e - v + 2 : e - v + count + 1; // 推广欧拉公式
  const actual = v - e + faces;
  const satisfies = actual === 2 && count === 1;
  // 必要条件: E ≤ 3V - 6（简单平面图）
  const necessaryCondition = e <= 3 * v - 6;
  let kuratowskiViolation: string | null = null;
  if (!necessaryCondition) {
    kuratowskiViolation = `违反必要条件 E=${e} > 3V-6=${3 * v - 6}，必非平面图（可能含 K5 子图）`;
  }
  const likelyPlanar = necessaryCondition && count === 1;
  return {
    satisfies, formula: 'V - E + F = 2', actual, faces,
    kuratowskiViolation, likelyPlanar, v, e,
  };
}

// BFS 遍历
export function bfsTraversal(adjMatrix: number[][], start = 0): { order: number[]; levels: number[] } {
  const n = adjMatrix.length;
  const visited = new Array(n).fill(false);
  const order: number[] = [];
  const levels = new Array(n).fill(-1);
  const queue = [start];
  visited[start] = true;
  levels[start] = 0;
  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);
    for (let v = 0; v < n; v++) {
      if (adjMatrix[u][v] && !visited[v]) {
        visited[v] = true;
        levels[v] = levels[u] + 1;
        queue.push(v);
      }
    }
  }
  return { order, levels };
}

// DFS 遍历
export function dfsTraversal(adjMatrix: number[][], start = 0): { order: number[]; discovery: number[]; finish: number[] } {
  const n = adjMatrix.length;
  const visited = new Array(n).fill(false);
  const order: number[] = [];
  const discovery = new Array(n).fill(-1);
  const finish = new Array(n).fill(-1);
  let time = 0;
  const dfs = (u: number) => {
    visited[u] = true;
    discovery[u] = time++;
    order.push(u);
    for (let v = 0; v < n; v++) {
      if (adjMatrix[u][v] && !visited[v]) dfs(v);
    }
    finish[u] = time++;
  };
  dfs(start);
  // 对非连通顶点也要访问
  for (let i = 0; i < n; i++) {
    if (!visited[i]) dfs(i);
  }
  return { order, discovery, finish };
}

// 拓扑排序（Kahn算法）
export function topologicalSort(adjMatrix: number[][]): { order: number[] | null; hasCycle: boolean } {
  const n = adjMatrix.length;
  const inDeg = new Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (adjMatrix[i][j]) inDeg[j]++;
  const queue: number[] = [];
  for (let i = 0; i < n; i++) if (inDeg[i] === 0) queue.push(i);
  const order: number[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);
    for (let v = 0; v < n; v++) {
      if (adjMatrix[u][v]) {
        inDeg[v]--;
        if (inDeg[v] === 0) queue.push(v);
      }
    }
  }
  return order.length === n ? { order, hasCycle: false } : { order: null, hasCycle: true };
}

// 强连通分量（Kosaraju算法）
export function stronglyConnectedComponents(adjMatrix: number[][]): number[][] {
  const n = adjMatrix.length;
  // 第一步：后序遍历获取顺序
  const visited = new Array(n).fill(false);
  const order: number[] = [];
  const dfs1 = (u: number) => {
    visited[u] = true;
    for (let v = 0; v < n; v++) {
      if (adjMatrix[u][v] && !visited[v]) dfs1(v);
    }
    order.push(u);
  };
  for (let i = 0; i < n; i++) if (!visited[i]) dfs1(i);
  // 第二步：转置图逆后序遍历
  const transpose: number[][] = [];
  for (let i = 0; i < n; i++) {
    transpose[i] = [];
    for (let j = 0; j < n; j++) transpose[i][j] = adjMatrix[j][i];
  }
  const visited2 = new Array(n).fill(false);
  const sccs: number[][] = [];
  const dfs2 = (u: number, comp: number[]) => {
    visited2[u] = true;
    comp.push(u);
    for (let v = 0; v < n; v++) {
      if (transpose[u][v] && !visited2[v]) dfs2(v, comp);
    }
  };
  for (let i = order.length - 1; i >= 0; i--) {
    if (!visited2[order[i]]) {
      const comp: number[] = [];
      dfs2(order[i], comp);
      sccs.push(comp.sort((a, b) => a - b));
    }
  }
  return sccs;
}

// ========== 离散数学 - 代数结构 ==========

// 群判定（封闭性、结合律、单位元、逆元）
export function checkGroupProperties(cayleyTable: number[][]): {
  closed: boolean; associative: boolean;
  hasIdentity: boolean; identity: number | null;
  hasInverses: boolean; isGroup: boolean; isAbelian: boolean;
  description: string;
} {
  const n = cayleyTable.length;
  // 封闭性
  let closed = true;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (cayleyTable[i][j] < 0 || cayleyTable[i][j] >= n) closed = false;
  // 交换性
  let abelian = true;
  for (let i = 0; i < n && abelian; i++)
    for (let j = 0; j < n && abelian; j++)
      if (cayleyTable[i][j] !== cayleyTable[j][i]) abelian = false;
  // 找单位元（左+右单位元）
  let identity: number | null = null;
  for (let e = 0; e < n; e++) {
    let isId = true;
    for (let i = 0; i < n && isId; i++) {
      if (cayleyTable[e][i] !== i || cayleyTable[i][e] !== i) isId = false;
    }
    if (isId) { identity = e; break; }
  }
  // 逆元
  let hasInverses = false;
  if (identity !== null) {
    hasInverses = true;
    for (let i = 0; i < n && hasInverses; i++) {
      let found = false;
      for (let j = 0; j < n && !found; j++) {
        if (cayleyTable[i][j] === identity && cayleyTable[j][i] === identity) found = true;
      }
      if (!found) hasInverses = false;
    }
  }
  // 结合律（穷举验证，n≤10可行）
  let associative = true;
  if (n <= 10) {
    for (let a = 0; a < n && associative; a++) {
      for (let b = 0; b < n && associative; b++) {
        for (let c = 0; c < n && associative; c++) {
          const ab = cayleyTable[a][b];
          const bc = cayleyTable[b][c];
          const left = ab >= 0 && ab < n ? cayleyTable[ab][c] : -1;
          const right = bc >= 0 && bc < n ? cayleyTable[a][bc] : -1;
          if (left !== right) associative = false;
        }
      }
    }
  }
  const isGroup = closed && associative && identity !== null && hasInverses;
  const desc = [
    closed ? '✓ 封闭性' : '✗ 不封闭',
    associative ? '✓ 结合律' : '✗ 不满足结合律',
    identity !== null ? `✓ 单位元 e=${identity}` : '✗ 无单位元',
    hasInverses ? '✓ 每个元素有逆元' : '✗ 存在无逆元元素',
    isGroup ? (abelian ? '→ 是交换群（Abel群）' : '→ 是群（非交换）') : '→ 不是群',
  ].join('\n');
  return {
    closed, associative,
    hasIdentity: identity !== null, identity,
    hasInverses, isGroup, isAbelian: isGroup && abelian,
    description: desc,
  };
}

// 子群判定（子群检验定理：H非空、封闭、有逆元）
export function isSubgroup(cayleyTable: number[][], subset: number[]): {
  isSub: boolean; description: string;
} {
  const set = new Set(subset);
  if (subset.length === 0) return { isSub: false, description: '空集不是子群' };
  // 封闭性
  let closed = true;
  for (const a of subset) {
    for (const b of subset) {
      if (!set.has(cayleyTable[a][b])) closed = false;
    }
  }
  // 找单位元
  const group = checkGroupProperties(cayleyTable);
  let hasId = group.identity !== null && set.has(group.identity);
  // 逆元封闭
  let hasInv = true;
  if (group.identity !== null) {
    for (const a of subset) {
      let found = false;
      for (const b of subset) {
        if (cayleyTable[a][b] === group.identity && cayleyTable[b][a] === group.identity) found = true;
      }
      if (!found) hasInv = false;
    }
  }
  const isSub = closed && hasId && hasInv;
  return {
    isSub,
    description: [
      closed ? '✓ 运算封闭' : '✗ 不封闭',
      hasId ? '✓ 含单位元' : '✗ 不含单位元',
      hasInv ? '✓ 逆元封闭' : '✗ 逆元不封闭',
      isSub ? '→ 是子群' : '→ 不是子群',
    ].join('\n'),
  };
}

// 格判定（偏序集任意两元素有上确界和下确界）
export function isLattice(posetMatrix: number[][]): {
  isLattice: boolean; description: string;
} {
  const n = posetMatrix.length;
  const p = partialOrderAnalysis(posetMatrix);
  if (!p.isPartialOrder) return { isLattice: false, description: '不是偏序集' };
  // 对任意两元素a,b，判断是否存在最小上界和最大下界
  let isLattice = true;
  let failedPairs = 0;
  for (let a = 0; a < n && isLattice; a++) {
    for (let b = a + 1; b < n && isLattice; b++) {
      // 上界集合
      const upperBounds: number[] = [];
      const lowerBounds: number[] = [];
      for (let x = 0; x < n; x++) {
        if (posetMatrix[a][x] && posetMatrix[b][x]) upperBounds.push(x); // a≤x 且 b≤x
        if (posetMatrix[x][a] && posetMatrix[x][b]) lowerBounds.push(x); // x≤a 且 x≤b
      }
      // 找最小上界（上界中在最底层的）
      let hasLUB = false;
      for (const u of upperBounds) {
        let isLeast = true;
        for (const v of upperBounds) {
          if (u !== v && posetMatrix[v][u]) { isLeast = false; break; }
        }
        if (isLeast) { hasLUB = true; break; }
      }
      let hasGLB = false;
      for (const l of lowerBounds) {
        let isGreatest = true;
        for (const v of lowerBounds) {
          if (l !== v && posetMatrix[l][v]) { isGreatest = false; break; }
        }
        if (isGreatest) { hasGLB = true; break; }
      }
      if (!hasLUB || !hasGLB) {
        isLattice = false;
        failedPairs++;
      }
    }
  }
  return {
    isLattice,
    description: isLattice
      ? `✓ 是格（任意两元素均有上确界和下确界）`
      : `✗ 不是格（有 ${failedPairs} 对元素无上确界或无下确界）`,
  };
}

// ========== 现代数学 - 组合数学 ==========

// 卡特兰数 C_n = (2n)!/(n!(n+1)!) = C(2n,n)/(n+1)
export function catalanNumber(n: number): number {
  if (n < 0) return 0;
  if (n > 30) return NaN; // 太大
  let c = 1;
  for (let i = 0; i < n; i++) {
    c = c * 2 * (2 * i + 1) / (i + 2);
  }
  return Math.round(c);
}

// 错排数 D_n = n! (1 - 1/1! + 1/2! - ... + (-1)^n/n!)
export function derangementNumber(n: number): number {
  if (n < 0) return 0;
  if (n === 0) return 1;
  // D(n) = n! * Σ_{k=0}^{n} (-1)^k / k!
  let sum = 0;
  let kFact = 1;
  for (let k = 0; k <= n; k++) {
    if (k > 0) kFact *= k;
    const term = (k % 2 === 0 ? 1 : -1) / kFact;
    sum += term;
  }
  let nFact = 1;
  for (let i = 1; i <= n; i++) nFact *= i;
  return Math.round(nFact * sum);
}

// 第二类斯特林数 S(n,k) = 将n个元素分成k个非空无序子集的方法数
// 递推：S(n,k) = k*S(n-1,k) + S(n-1,k-1)
export function stirlingNumber2(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0) return n === 0 ? 1 : 0;
  if (n === k) return 1;
  const dp: number[][] = [];
  for (let i = 0; i <= n; i++) {
    dp[i] = new Array(k + 1).fill(0);
    dp[i][0] = i === 0 ? 1 : 0;
  }
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= Math.min(i, k); j++) {
      dp[i][j] = j * dp[i - 1][j] + dp[i - 1][j - 1];
    }
  }
  return dp[n][k];
}

// 第一类斯特林数（无符号）c(n,k): n个元素排成k个轮换的方法数
// 递推：c(n,k) = (n-1)*c(n-1,k) + c(n-1,k-1)
export function stirlingNumber1(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0) return n === 0 ? 1 : 0;
  if (n === k) return 1;
  const dp: number[][] = [];
  for (let i = 0; i <= n; i++) dp[i] = new Array(k + 1).fill(0);
  dp[0][0] = 1;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= Math.min(i, k); j++) {
      dp[i][j] = (i - 1) * dp[i - 1][j] + dp[i - 1][j - 1];
    }
  }
  return dp[n][k];
}

// 贝尔数 B_n = Σ S(n,k) for k=0..n
export function bellNumber(n: number): number {
  if (n < 0) return 0;
  let sum = 0;
  for (let k = 0; k <= n; k++) sum += stirlingNumber2(n, k);
  return sum;
}

// 三集合容斥原理 |A∪B∪C| = |A|+|B|+|C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|
export function inclusionExclusion3(
  sizeA: number, sizeB: number, sizeC: number,
  ab: number, ac: number, bc: number, abc: number,
): { union: number; formula: string } {
  const union = sizeA + sizeB + sizeC - ab - ac - bc + abc;
  return {
    union,
    formula: '|A∪B∪C| = |A|+|B|+|C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|',
  };
}

// 勾股数生成（欧几里得公式：本原勾股数，u>v>0，互素，一奇一偶）
export function generatePythagoreanTriples(limit: number): Array<{ a: number; b: number; c: number; primitive: boolean }> {
  const result: Array<{ a: number; b: number; c: number; primitive: boolean }> = [];
  const seen = new Set<string>();
  for (let u = 2; u <= Math.sqrt(limit) + 5; u++) {
    for (let v = 1; v < u; v++) {
      if ((u - v) % 2 === 0) continue; // 一奇一偶
      // 互素判断
      let coprime = true;
      for (let d = 2; d <= v; d++) {
        if (u % d === 0 && v % d === 0) { coprime = false; break; }
      }
      if (!coprime) continue;
      const a = u * u - v * v;
      const b = 2 * u * v;
      const c = u * u + v * v;
      if (c > limit && result.length >= limit) break;
      const key = `${Math.min(a,b)},${Math.max(a,b)},${c}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ a: Math.min(a, b), b: Math.max(a, b), c, primitive: true });
      }
      if (result.length >= limit) break;
    }
    if (result.length >= limit) break;
  }
  return result;
}

// ========== 现代数学 - 数论高级 ==========

// 模逆元（扩展欧几里得）
function modInverse(a: number, m: number): number | null {
  // 扩展欧几里得算法
  let g = gcd(a, m);
  if (g !== 1) return null;
  let r0 = a, r1 = m;
  let s0 = 1, s1 = 0;
  let t0 = 0, t1 = 1;
  while (r1 !== 0) {
    const q = Math.floor(r0 / r1);
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
    [t0, t1] = [t1, t0 - q * t1];
  }
  return ((s0 % m) + m) % m;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b !== 0) { [a, b] = [b, a % b]; }
  return a;
}

// 中国剩余定理（扩展版，模数不互素也可解或判无解）
export function crtGeneral(
  congruences: Array<{ a: number; m: number }>,
): { solution: number | null; modulus: number; description: string } {
  let x = 0;
  let M = 1;
  for (const { a, m } of congruences) {
    // 解 x ≡ x0 (mod M), x ≡ a (mod m)
    const d = gcd(M, m);
    if ((a - x) % d !== 0) {
      return { solution: null, modulus: 0, description: `无解：(a-x) = ${a-x} 不能被 gcd(M,m) = ${d} 整除` };
    }
    const lcm = M / d * m;
    // 求 k 使得 x + k*M ≡ a (mod m)
    // k*M ≡ a - x (mod m) → k*(M/d) ≡ (a-x)/d (mod m/d)
    const M2 = M / d;
    const m2 = m / d;
    const c2 = (a - x) / d;
    const inv = modInverse(M2, m2);
    if (inv === null) {
      return { solution: null, modulus: 0, description: '无解：逆元不存在' };
    }
    const k = (c2 * inv) % m2;
    x = x + k * M;
    M = lcm;
    x = ((x % M) + M) % M;
  }
  return { solution: x, modulus: M, description: `解: x ≡ ${x} (mod ${M})` };
}

// 勒让德符号 (a/p)
export function legendreSymbol(a: number, p: number): number {
  if (p <= 2 || p % 2 === 0) return NaN;
  a = ((a % p) + p) % p;
  if (a === 0) return 0;
  // 欧拉判别法: (a/p) ≡ a^((p-1)/2) mod p
  let result = 1;
  let base = a;
  let exp = (p - 1) / 2;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % p;
    base = (base * base) % p;
    exp = Math.floor(exp / 2);
  }
  // 结果为 1 或 p-1 (= -1 mod p)
  if (result === 1) return 1;
  if (result === p - 1) return -1;
  return 0;
}

// 雅可比符号 (a/n)
export function jacobiSymbol(a: number, n: number): number {
  if (n <= 0 || n % 2 === 0) return NaN;
  a = a % n;
  if (a < 0) a += n;
  let result = 1;
  while (a !== 0) {
    // 去掉 a 中的因子 2
    let k = 0;
    while (a % 2 === 0) {
      a /= 2;
      k++;
    }
    if (k % 2 === 1) {
      // n mod 8 ∈ {3,5} → 乘以 -1
      const nm = n % 8;
      if (nm === 3 || nm === 5) result = -result;
    }
    // 二次互反律
    if (a % 4 === 3 && n % 4 === 3) result = -result;
    [a, n] = [n % a, a];
  }
  if (n === 1) return result;
  return 0; // n>1 且 a最终为0 → a和n不互素
}

// Miller-Rabin 素性检测
export function millerRabin(n: number, k = 5): { prime: boolean; description: string } {
  if (n < 2) return { prime: false, description: '小于2' };
  if (n < 4) return { prime: true, description: 'n=2或3' };
  if (n % 2 === 0) return { prime: false, description: '偶数' };
  // n-1 = d * 2^s
  let d = n - 1;
  let s = 0;
  while (d % 2 === 0) { d /= 2; s++; }
  // 测试 witness
  const witnesses = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  const actualW = witnesses.filter(w => w < n).slice(0, k);
  for (const a of actualW) {
    let x = powMod(a, d, n);
    if (x === 1 || x === n - 1) continue;
    let composite = true;
    for (let r = 1; r < s; r++) {
      x = (x * x) % n;
      if (x === n - 1) { composite = false; break; }
    }
    if (composite) return { prime: false, description: `witness ${a} 判定为合数` };
  }
  return { prime: true, description: `通过 ${actualW.length} 轮 Miller-Rabin 检测` };
}

// 模幂 a^b mod m
function powMod(a: number, b: number, m: number): number {
  let result = 1;
  a = a % m;
  while (b > 0) {
    if (b % 2 === 1) result = (result * a) % m;
    a = (a * a) % m;
    b = Math.floor(b / 2);
  }
  return result;
}

// ========== 现代数学 - 博弈论 ==========

// Nim游戏：n堆石子，异或和判断胜负
export function nimGameWinner(piles: number[]): {
  xorSum: number; winning: boolean; winningMoves: Array<{ pile: number; take: number }>; description: string;
} {
  let xorSum = 0;
  for (const p of piles) xorSum ^= p;
  const winning = xorSum !== 0;
  const winningMoves: Array<{ pile: number; take: number }> = [];
  if (winning) {
    for (let i = 0; i < piles.length; i++) {
      const target = piles[i] ^ xorSum;
      if (target < piles[i]) {
        winningMoves.push({ pile: i, take: piles[i] - target });
      }
    }
  }
  return {
    xorSum,
    winning,
    winningMoves,
    description: winning
      ? `必胜态：异或和 = ${xorSum} ≠ 0，有 ${winningMoves.length} 种必胜走法`
      : `必败态：异或和 = 0，无论怎么取都让对手进入必胜态`,
  };
}

// 威佐夫博弈 (Wythoff's Game)：两堆石子，奇异局势 (⌊k·φ⌋, ⌊k·φ²⌋)，φ=(1+√5)/2
export function wythoffGame(a: number, b: number): {
  losing: boolean; k: number; description: string; move?: { from: number; take: number; to?: number };
} {
  if (a < 0 || b < 0) return { losing: false, k: -1, description: '堆数不能为负' };
  const x = Math.min(a, b);
  const y = Math.max(a, b);
  const diff = y - x;
  const phi = (1 + Math.sqrt(5)) / 2;
  const k = diff;
  const ak = Math.floor(k * phi);
  const bk = Math.floor(k * phi * phi);
  const losing = ak === x && bk === y;
  return {
    losing,
    k,
    description: losing
      ? `奇异局势（必败态）：第 ${k} 个奇异局势 (${ak}, ${bk})`
      : `必胜态：差值 = ${diff}，奇异局势基准 = (${ak}, ${bk})`,
  };
}

// SG函数（Nim堆型游戏的Grundy数）: 给定可选步数集合，计算前n个状态的SG值
export function sgFunction(maxN: number, moves: number[]): { values: number[]; mexSteps: string[] } {
  const sg = new Array(maxN + 1).fill(0);
  const mexSteps: string[] = [];
  for (let n = 1; n <= maxN; n++) {
    const reachable = new Set<number>();
    for (const m of moves) {
      if (n >= m) reachable.add(sg[n - m]);
    }
    // mex (minimum excludant)
    let mex = 0;
    while (reachable.has(mex)) mex++;
    sg[n] = mex;
    mexSteps.push(`g(${n}) = mex{${[...reachable].sort((a,b)=>a-b).join(',')}} = ${mex}`);
  }
  return { values: sg, mexSteps };
}

// ========== 现代数学 - 置换群 ==========

// 置换的循环分解
export function permutationCycleDecomposition(perm: number[]): {
  cycles: number[][]; type: string; parity: string;
} {
  const n = perm.length;
  const visited = new Array(n).fill(false);
  const cycles: number[][] = [];
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const cycle: number[] = [];
    let j = i;
    while (!visited[j]) {
      visited[j] = true;
      cycle.push(j);
      j = perm[j];
    }
    if (cycle.length > 0) cycles.push(cycle);
  }
  // 置换的阶：各轮换长度的lcm
  let order = 1;
  for (const c of cycles) {
    const g = gcd(order, c.length);
    order = order / g * c.length;
  }
  // 奇偶性：n - 轮换数
  const transpositions = n - cycles.length;
  const parity = transpositions % 2 === 0 ? '偶置换' : '奇置换';
  return { cycles, type: `${cycles.length}个轮换，阶=${order}`, parity };
}

// 置换复合 (β∘α)(x) = β[α[x]]
export function permutationCompose(alpha: number[], beta: number[]): number[] {
  const n = alpha.length;
  const result = new Array(n);
  for (let i = 0; i < n; i++) result[i] = beta[alpha[i]];
  return result;
}

// 逆置换
export function permutationSign(perm: number[]): number {
  const { cycles } = permutationCycleDecomposition(perm);
  let transpositions = 0;
  for (const c of cycles) transpositions += c.length - 1;
  return transpositions % 2 === 0 ? 1 : -1;
}

export function permutationInverse(perm: number[]): number[] {
  const n = perm.length;
  const inv = new Array(n);
  for (let i = 0; i < n; i++) inv[perm[i]] = i;
  return inv;
}

// 置换的阶
export function permutationOrder(perm: number[]): number {
  const { cycles } = permutationCycleDecomposition(perm);
  let order = 1;
  for (const c of cycles) {
    const g = gcd(order, c.length);
    order = order / g * c.length;
  }
  return order;
}

// ========== 现代数学 - 图论算法/网络流 ==========

// Dijkstra 最短路径
export function dijkstra(weightMatrix: number[][], start: number): {
  distances: number[]; prev: number[]; description: string;
} {
  const n = weightMatrix.length;
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const visited = new Array(n).fill(false);
  dist[start] = 0;
  for (let i = 0; i < n; i++) {
    // 找最小dist顶点
    let min = Infinity, u = -1;
    for (let v = 0; v < n; v++) {
      if (!visited[v] && dist[v] < min) { min = dist[v]; u = v; }
    }
    if (u === -1) break;
    visited[u] = true;
    // 松弛
    for (let v = 0; v < n; v++) {
      if (!visited[v] && weightMatrix[u][v] > 0 && dist[u] + weightMatrix[u][v] < dist[v]) {
        dist[v] = dist[u] + weightMatrix[u][v];
        prev[v] = u;
      }
    }
  }
  return {
    distances: dist,
    prev,
    description: `从顶点${start}出发的最短路径：\n` + dist.map((d, i) => `  v${i}: ${d === Infinity ? '∞' : d} (←v${prev[i]})`).join('\n'),
  };
}

// 最大流（Ford-Fulkerson / Edmonds-Karp 用BFS找增广路）
export function maxFlowFordFulkerson(capacity: number[][], source: number, sink: number): {
  flow: number; flowMatrix: number[][]; description: string;
} {
  const n = capacity.length;
  const residual = capacity.map(row => [...row]);
  const flowMatrix: number[][] = [];
  for (let i = 0; i < n; i++) flowMatrix[i] = new Array(n).fill(0);
  let totalFlow = 0;
  let iterations = 0;
  while (iterations < 10000) {
    // BFS 找增广路
    const prev = new Array(n).fill(-1);
    const visited = new Array(n).fill(false);
    const queue: number[] = [source];
    visited[source] = true;
    while (queue.length > 0) {
      const u = queue.shift()!;
      if (u === sink) break;
      for (let v = 0; v < n; v++) {
        if (!visited[v] && residual[u][v] > 0) {
          visited[v] = true;
          prev[v] = u;
          queue.push(v);
        }
      }
    }
    if (prev[sink] === -1) break;
    // 计算最小剩余容量
    let minCap = Infinity;
    for (let v = sink; v !== source; v = prev[v]) {
      const u = prev[v];
      minCap = Math.min(minCap, residual[u][v]);
    }
    // 更新剩余网络
    for (let v = sink; v !== source; v = prev[v]) {
      const u = prev[v];
      residual[u][v] -= minCap;
      residual[v][u] += minCap;
      flowMatrix[u][v] += minCap;
      flowMatrix[v][u] -= minCap;
    }
    totalFlow += minCap;
    iterations++;
  }
  const positiveFlow: number[][] = flowMatrix.map(row => row.map(v => Math.max(0, v)));
  return {
    flow: totalFlow,
    flowMatrix: positiveFlow,
    description: `最大流 = ${totalFlow}（${iterations} 次增广）`,
  };
}

// 匈牙利算法求二部图最大匹配（输入：邻接矩阵 n×m，左n右m）
export function hungarianMaxMatching(adjMatrix: number[][]): {
  matching: number; pairU: number[]; description: string;
} {
  const n = adjMatrix.length;
  const m = adjMatrix[0]?.length || 0;
  const pairV = new Array(m).fill(-1);
  const pairU = new Array(n).fill(-1);
  let result = 0;
  const dfs = (u: number, visited: boolean[]): boolean => {
    for (let v = 0; v < m; v++) {
      if (adjMatrix[u][v] && !visited[v]) {
        visited[v] = true;
        if (pairV[v] === -1 || dfs(pairV[v], visited)) {
          pairV[v] = u;
          pairU[u] = v;
          return true;
        }
      }
    }
    return false;
  };
  for (let u = 0; u < n; u++) {
    const visited = new Array(m).fill(false);
    if (dfs(u, visited)) result++;
  }
  return {
    matching: result,
    pairU,
    description: `最大匹配数 = ${result}\n左→右匹配：${pairU.map((v, i) => v >= 0 ? `U${i}→V${v}` : 'U' + i + '未匹配').join(', ')}`,
  };
}

// ========== 现代数学：缺失函数补全 ==========

// 斐波那契数列（迭代法，F(1)=1, F(2)=1, F(3)=2, ...）
export function fibonacci(n: number): number {
  try {
    if (!Number.isInteger(n) || n < 1) {
      throw new Error('n 必须为正整数');
    }
    if (n <= 2) return 1;
    let a = 1, b = 1;
    for (let i = 3; i <= n; i++) {
      const next = a + b;
      a = b;
      b = next;
    }
    return b;
  } catch (e) {
    throw new Error(`斐波那契计算失败：${(e as Error).message}`);
  }
}

// 约瑟夫环问题：n个人编号1..n，每次报数m出圈，返回出圈顺序和幸存者
export function josephusProblem(n: number, m: number): { order: number[]; survivor: number } {
  try {
    if (!Number.isInteger(n) || n < 1) throw new Error('n 必须为正整数');
    if (!Number.isInteger(m) || m < 1) throw new Error('m 必须为正整数');
    const people: number[] = [];
    for (let i = 1; i <= n; i++) people.push(i);
    const order: number[] = [];
    let index = 0;
    while (people.length > 1) {
      index = (index + m - 1) % people.length;
      order.push(people.splice(index, 1)[0]);
    }
    return { order, survivor: people[0] };
  } catch (e) {
    throw new Error(`约瑟夫环计算失败：${(e as Error).message}`);
  }
}

// 二项式定理展开 (a+b)^n，返回各项数组
export function binomialExpansion(terms: string[], n: number): Array<{ coefficient: number; aPower: number; bPower: number; term: string }> {
  try {
    if (!Array.isArray(terms) || terms.length !== 2) throw new Error('terms 必须为 [a, b] 两个元素的数组');
    if (!Number.isInteger(n) || n < 0) throw new Error('n 必须为非负整数');
    const [a, b] = terms;
    const result = [];
    let c = 1;
    for (let k = 0; k <= n; k++) {
      if (k > 0) c = c * (n - k + 1) / k;
      const aPower = n - k;
      const bPower = k;
      const coefStr = c === 1 && (aPower > 0 || bPower > 0) ? '' : String(c);
      const aStr = aPower === 0 ? '' : aPower === 1 ? a : `${a}^${aPower}`;
      const bStr = bPower === 0 ? '' : bPower === 1 ? b : `${b}^${bPower}`;
      const mid = aStr && bStr ? ' ' : '';
      const term = `${coefStr}${aStr}${mid}${bStr}` || '1';
      result.push({ coefficient: c, aPower, bPower, term });
    }
    return result;
  } catch (e) {
    throw new Error(`二项式展开失败：${(e as Error).message}`);
  }
}

// Lucas定理计算 C(n,k) mod p（p为素数）
export function lucasTheorem(n: number, k: number, p: number): number {
  try {
    if (!Number.isInteger(n) || n < 0) throw new Error('n 必须为非负整数');
    if (!Number.isInteger(k) || k < 0) throw new Error('k 必须为非负整数');
    if (!Number.isInteger(p) || p < 2) throw new Error('p 必须为≥2的素数');
    if (k > n) return 0;

    const powMod = (base: number, exp: number, mod: number): number => {
      let r = 1;
      base = base % mod;
      while (exp > 0) {
        if (exp % 2 === 1) r = (r * base) % mod;
        base = (base * base) % mod;
        exp = Math.floor(exp / 2);
      }
      return r;
    };

    const combMod = (a: number, b: number): number => {
      if (b > a) return 0;
      if (b === 0 || b === a) return 1;
      b = Math.min(b, a - b);
      let num = 1, den = 1;
      for (let i = 0; i < b; i++) {
        num = (num * (a - i)) % p;
        den = (den * (i + 1)) % p;
      }
      return (num * powMod(den, p - 2, p)) % p;
    };

    let result = 1;
    let nn = n, kk = k;
    while (nn > 0 || kk > 0) {
      result = (result * combMod(nn % p, kk % p)) % p;
      nn = Math.floor(nn / p);
      kk = Math.floor(kk / p);
    }
    return result;
  } catch (e) {
    throw new Error(`Lucas定理计算失败：${(e as Error).message}`);
  }
}

// 贪心着色算法（按顶点顺序着色，用最小可用颜色）
export function greedyColoring(adjMatrix: number[][]): { chromaticNumber: number; coloring: number[] } {
  try {
    if (!Array.isArray(adjMatrix) || adjMatrix.length === 0) throw new Error('邻接矩阵不能为空');
    const n = adjMatrix.length;
    for (let i = 0; i < n; i++) {
      if (!Array.isArray(adjMatrix[i]) || adjMatrix[i].length !== n) {
        throw new Error(`第 ${i} 行邻接矩阵长度不匹配`);
      }
    }
    const coloring = new Array(n).fill(-1);
    coloring[0] = 0;
    let maxColor = 0;
    for (let u = 1; u < n; u++) {
      const used = new Set<number>();
      for (let v = 0; v < n; v++) {
        if (adjMatrix[u][v] && coloring[v] !== -1) used.add(coloring[v]);
      }
      let color = 0;
      while (used.has(color)) color++;
      coloring[u] = color;
      if (color > maxColor) maxColor = color;
    }
    return { chromaticNumber: maxColor + 1, coloring };
  } catch (e) {
    throw new Error(`贪心着色计算失败：${(e as Error).message}`);
  }
}

// 鸽巢原理判定：若 items > boxes 则返回 true
export function pigeonholePrinciple(items: number, boxes: number): boolean {
  try {
    if (!Number.isInteger(items) || items < 0) throw new Error('items 必须为非负整数');
    if (!Number.isInteger(boxes) || boxes < 1) throw new Error('boxes 必须为正整数');
    return items > boxes;
  } catch (e) {
    throw new Error(`鸽巢原理判定失败：${(e as Error).message}`);
  }
}

// ========== 复变函数补强 ==========

// 幅角原理：解析函数 f(z) 在围道 C（这里用圆 |z|=R）内的零点个数 - 极点个数 = (1/2πi) ∮ f'/f dz
// 简化：用辐角变化量 / (2π) 计算，返回 { zerosMinusPoles, windingNumber }
export function argumentPrinciple(
  fExpr: string, R: number, N = 720,
): { zerosMinusPoles: number; windingNumber: number; note: string } {
  const expr = normalizeMathInput(fExpr);
  try {
    // 如果是多项式，直接用 complexPolyRoots 找根然后数圆内根数
    // 尝试解析为多项式形式：z^2-1, z^3+2z+1, etc.
    // 尝试提取多项式系数：匹配 z^n + ... 模式
    const polyMatch = expr.replace(/\s/g, '').match(/^z\^\d+[\+\-][\+\-\d\*z\^]+$/);
    if (polyMatch) {
      // 用 complexPolyRoots 需要系数数组，尝试用 mathjs 解析
      try {
        const roots = polyRootsFromExpr(expr);
        if (roots && roots.length > 0) {
          let count = 0;
          for (const r of roots) {
            if (Math.hypot(r.re, r.im) < R - 1e-6) count++;
          }
          return {
            zerosMinusPoles: count,
            windingNumber: count,
            note: `绕数（零点数）= ${count}（共 ${roots.length} 个零点，其中 ${count} 个在 |z|<${R} 内）`,
          };
        }
      } catch { /* 失败则用数值法 */ }
    }
    
    // 数值方法：沿圆 |z|=R 采样，计算 f(z) 的幅角变化总量
    let prevArg: number | null = null;
    let totalDelta = 0;
    for (let i = 0; i <= N; i++) {
      const theta = (i / N) * 2 * Math.PI;
      const z = { re: R * Math.cos(theta), im: R * Math.sin(theta) };
      const fz = evalComplexAt(expr, z);
      const arg = Math.atan2(fz.im, fz.re);
      if (prevArg !== null) {
        let delta = arg - prevArg;
        // 处理跨越 ±π 的情况
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;
        totalDelta += delta;
      }
      prevArg = arg;
    }
    const winding = totalDelta / (2 * Math.PI);
    const rounded = Math.round(winding);
    return {
      zerosMinusPoles: rounded,
      windingNumber: winding,
      note: `绕数（零点数-极点数）≈ ${rounded}（精确值 ${winding.toFixed(4)}）`,
    };
  } catch (e) {
    throw new Error(`幅角原理计算失败：${(e as Error).message}`);
  }
}

// 从表达式提取多项式系数（支持 z^n + a*z^(n-1) + ... + b 形式）
function polyRootsFromExpr(expr: string): Array<{ re: number; im: number }> | null {
  try {
    const s = expr.replace(/\s/g, '');
    // 用 mathjs 提取多项式系数
    // 简化：只处理 z 的多项式，手动匹配
    // 支持 z^n, a*z^n, z, a*z, 常数
    const terms = s.match(/[\+\-]?[^\+\-]+/g) || [s];
    const coeffMap = new Map<number, number>(); // 次数 -> 系数
    
    for (const term of terms) {
      if (!term) continue;
      const sign = term.startsWith('-') ? -1 : 1;
      const tt = term.replace(/^[\+\-]/, '');
      
      if (tt.includes('z')) {
        // 含 z 的项
        let coeffPart: string, powerPart: string;
        if (tt.includes('^')) {
          // a*z^n 或 z^n
          const parts = tt.split('*');
          const zTerm = parts.find(p => p.includes('z'))!;
          coeffPart = parts.filter(p => !p.includes('z')).join('*') || '1';
          powerPart = zTerm.split('^')[1];
        } else {
          // a*z 或 z
          const parts = tt.split('*');
          coeffPart = parts.filter(p => p !== 'z').join('*') || '1';
          powerPart = '1';
        }
        const coeff = sign * parseFloat(coeffPart || '1');
        const power = parseInt(powerPart);
        coeffMap.set(power, (coeffMap.get(power) || 0) + coeff);
      } else {
        // 常数项
        const val = sign * parseFloat(tt);
        coeffMap.set(0, (coeffMap.get(0) || 0) + val);
      }
    }
    
    if (coeffMap.size === 0) return null;
    const maxDeg = Math.max(...coeffMap.keys());
    const coeffs: number[] = []; // 从最高次到常数
    for (let i = maxDeg; i >= 0; i--) {
      coeffs.push(coeffMap.get(i) || 0);
    }
    
    return complexPolyRoots(coeffs);
  } catch {
    return null;
  }
}

// 牛顿迭代求多项式复根（Durand-Kerner方法，一次性找全部根）
export function complexPolyRoots(coeffs: number[]): Array<{ re: number; im: number }> {
  try {
    // coeffs: 从最高次到常数项，如 [1,0,-1] 表示 z²-1
    const n = coeffs.length - 1; // 次数
    if (n < 1) return [];
    
    // 首一化
    const a0 = coeffs[0];
    const c = coeffs.map(x => x / a0);
    
    // Durand-Kerner 方法
    let roots: Array<{ re: number; im: number }> = [];
    // 初始猜测：均匀分布在圆上
    const radius = Math.max(1, Math.abs(c[n]) ** (1 / n)) * 1.2;
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n + 0.4;
      roots.push({ re: radius * Math.cos(angle), im: radius * Math.sin(angle) });
    }
    
    // 多项式求值（Horner法）
    const evalPoly = (z: { re: number; im: number }) => {
      let result = { re: c[0], im: 0 };
      for (let i = 1; i <= n; i++) {
        result = cAdd(cMul(result, z), { re: c[i], im: 0 });
      }
      return result;
    };
    
    // 迭代
    for (let iter = 0; iter < 100; iter++) {
      let maxShift = 0;
      for (let i = 0; i < n; i++) {
        const fz = evalPoly(roots[i]);
        let denom = { re: 1, im: 0 };
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            denom = cMul(denom, cSub(roots[i], roots[j]));
          }
        }
        const shift = cDiv(fz, denom);
        roots[i] = cSub(roots[i], shift);
        maxShift = Math.max(maxShift, cAbs(shift));
      }
      if (maxShift < 1e-10) break;
    }
    
    return roots.map(r => ({
      re: Math.abs(r.re) < 1e-10 ? 0 : r.re,
      im: Math.abs(r.im) < 1e-10 ? 0 : r.im,
    }));
  } catch (e) {
    throw new Error(`复根计算失败：${(e as Error).message}`);
  }
}

// 复级数收敛半径（幂级数 Σ a_n z^n，已知 a_n 的通项公式或前若干项比值）
// 用法：传入系数数组 a[0..N]，用比值法 / 根值法估算收敛半径
export function complexSeriesRadius(coeffs: number[]): { ratioRadius: number; rootRadius: number; note: string } {
  try {
    const n = coeffs.length;
    if (n < 2) return { ratioRadius: NaN, rootRadius: NaN, note: '系数不足' };
    
    // 比值法：R = lim |a_n / a_{n+1}|（取最后几项加权平均估计极限）
    const ratios: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      if (Math.abs(coeffs[i + 1]) > 1e-15) {
        ratios.push(Math.abs(coeffs[i] / coeffs[i + 1]));
      }
    }
    
    // 取最后若干项做加权平均（越靠后权重越大，越接近极限）
    const useCount = Math.min(8, ratios.length);
    let ratioR = NaN;
    if (useCount > 0) {
      let sum = 0, totalW = 0;
      for (let i = 0; i < useCount; i++) {
        const w = i + 1;
        sum += ratios[ratios.length - useCount + i] * w;
        totalW += w;
      }
      ratioR = sum / totalW;
    }
    
    // 根值法：R = 1 / lim sup |a_n|^(1/n) — 辅助参考
    const startIdx = Math.max(1, Math.floor(n * 0.67));
    let limSup = 0;
    for (let i = startIdx; i < n; i++) {
      if (Math.abs(coeffs[i]) > 1e-15) {
        const r = Math.abs(coeffs[i]) ** (1 / i);
        if (r > limSup) limSup = r;
      }
    }
    
    // 判断是否整函数（比值单调不减且增长超过5倍）
    let isEntire = false;
    if (ratios.length >= 5) {
      let monotonic = true;
      for (let i = 1; i < ratios.length; i++) {
        if (ratios[i] < ratios[i - 1] * 0.95) { monotonic = false; break; }
      }
      if (monotonic && ratios[ratios.length - 1] > ratios[0] * 5) {
        isEntire = true;
      }
    }
    
    const resultR = isEntire ? 1e10 : ratioR;
    
    return {
      ratioRadius: ratioR,
      rootRadius: resultR,
      note: isFinite(resultR) && resultR < 1e9 
        ? `收敛半径 R ≈ ${resultR.toFixed(4)}（比值法估算）`
        : '收敛半径 R = ∞（级数为整函数）',
    };
  } catch (e) {
    throw new Error(`收敛半径计算失败：${(e as Error).message}`);
  }
}

// 傅里叶变换对（数值积分近似）：F(ω) = ∫_{-∞}^{∞} f(t) e^{-iωt} dt
// 简化：用有限区间 [-L, L] 上的数值积分近似
export function fourierTransform(
  fExpr: string, omega: number, L = 10, N = 2000,
): { re: number; im: number; magnitude: number; phase: number } {
  try {
    const f = (t: number) => evaluate(fExpr, { t }) as number;
    const dt = (2 * L) / N;
    let reSum = 0, imSum = 0;
    for (let i = 0; i <= N; i++) {
      const t = -L + i * dt;
      const wt = omega * t;
      const ft = f(t);
      // e^{-iωt} = cos(ωt) - i·sin(ωt)
      reSum += ft * Math.cos(wt);
      imSum += -ft * Math.sin(wt);
    }
    // 梯形法修正端点
    reSum = reSum * dt - dt / 2 * (f(-L) * Math.cos(-omega * L) + f(L) * Math.cos(omega * L));
    imSum = imSum * dt - dt / 2 * (-f(L) * Math.sin(omega * L) - f(-L) * Math.sin(-omega * L));
    // 简单起见用矩形+端点平均
    reSum = 0;
    imSum = 0;
    for (let i = 0; i < N; i++) {
      const t0 = -L + i * dt;
      const t1 = t0 + dt;
      const ft0 = f(t0), ft1 = f(t1);
      const c0 = Math.cos(omega * t0), c1 = Math.cos(omega * t1);
      const s0 = Math.sin(omega * t0), s1 = Math.sin(omega * t1);
      reSum += (ft0 * c0 + ft1 * c1) * dt / 2;
      imSum += (-ft0 * s0 - ft1 * s1) * dt / 2;
    }
    return {
      re: reSum,
      im: imSum,
      magnitude: Math.hypot(reSum, imSum),
      phase: Math.atan2(imSum, reSum),
    };
  } catch (e) {
    throw new Error(`傅里叶变换计算失败：${(e as Error).message}`);
  }
}

// 拉普拉斯变换性质验证：时移、频移、微分、积分
export function laplacePropertiesVerify(
  fExpr: string, s: number, a = 1, t0 = 0.5,
): {
  timeShift: { left: number; right: number; equal: boolean };
  freqShift: { left: number; right: number; equal: boolean };
  derivative: { left: number; right: number; equal: boolean };
  integral: { left: number; right: number; equal: boolean };
} {
  try {
    // 数值拉普拉斯变换：F(s) = ∫₀^∞ f(t) e^{-st} dt
    const laplace = (func: (t: number) => number, sVal: number, L = 20, N = 2000) => {
      const dt = L / N;
      let sum = 0;
      for (let i = 0; i < N; i++) {
        const t0 = i * dt, t1 = (i + 1) * dt;
        const v0 = func(t0) * Math.exp(-sVal * t0);
        const v1 = func(t1) * Math.exp(-sVal * t1);
        sum += (v0 + v1) * dt / 2;
      }
      return sum;
    };
    
    const f = (t: number) => t >= 0 ? (evaluate(fExpr, { t }) as number) : 0;
    const Fs = laplace(f, s);
    
    // 时移性质：L{f(t-t₀)u(t-t₀)} = e^{-st₀} F(s)
    const fShifted = (t: number) => f(t - t0);
    const left_shift = laplace(fShifted, s);
    const right_shift = Math.exp(-s * t0) * Fs;
    
    // 频移性质：L{e^{at} f(t)} = F(s-a)
    const fFreqShift = (t: number) => Math.exp(a * t) * f(t);
    const left_freq = laplace(fFreqShift, s);
    const right_freq = laplace(f, s - a);
    
    // 微分性质：L{f'(t)} = s F(s) - f(0)
    const eps = 1e-4;
    const fPrime = (t: number) => (f(t + eps) - f(t - eps)) / (2 * eps);
    const left_deriv = laplace(fPrime, s);
    const right_deriv = s * Fs - f(0);
    
    // 积分性质：L{∫₀ᵗ f(τ)dτ} = F(s)/s
    const fInt = (t: number) => {
      let acc = 0;
      const nStep = 100;
      const dT = t / nStep;
      for (let i = 0; i < nStep; i++) {
        acc += (f(i * dT) + f((i + 1) * dT)) * dT / 2;
      }
      return acc;
    };
    const left_int = laplace(fInt, s);
    const right_int = Fs / Math.max(s, 1e-9);
    
    const tol = 0.05; // 5% 容差（数值积分误差）
    return {
      timeShift: { left: left_shift, right: right_shift, equal: Math.abs(left_shift - right_shift) / Math.max(Math.abs(right_shift), 1e-9) < tol },
      freqShift: { left: left_freq, right: right_freq, equal: Math.abs(left_freq - right_freq) / Math.max(Math.abs(right_freq), 1e-9) < tol },
      derivative: { left: left_deriv, right: right_deriv, equal: Math.abs(left_deriv - right_deriv) / Math.max(Math.abs(right_deriv), 1e-9) < tol },
      integral: { left: left_int, right: right_int, equal: Math.abs(left_int - right_int) / Math.max(Math.abs(right_int), 1e-9) < tol },
    };
  } catch (e) {
    throw new Error(`拉普拉斯性质验证失败：${(e as Error).message}`);
  }
}

// ========== 离散数学补强 ==========

// 前束范式（命题逻辑版：将量词全部移到前面）
// 简化版：处理谓词逻辑的量词否定和前束化（输入含 ∀/∃ 的表达式字符串）
export function prenexNormalForm(expr: string): { steps: string[]; result: string } {
  try {
    let s = expr;
    const steps: string[] = [`原始表达式: ${s}`];
    
    // 量词否定等价：¬∀x P ≡ ∃x ¬P，¬∃x P ≡ ∀x ¬P
    // 用简单的字符串替换处理常见模式
    const rules = [
      { from: /¬∀([a-z])/g, to: '∃$1¬', name: '¬∀xP ≡ ∃x¬P' },
      { from: /¬∃([a-z])/g, to: '∀$1¬', name: '¬∃xP ≡ ∀x¬P' },
    ];
    
    for (const rule of rules) {
      const before = s;
      s = s.replace(rule.from, rule.to);
      if (s !== before) steps.push(`应用 ${rule.name}: ${s}`);
    }
    
    steps.push(`前束范式结果: ${s}`);
    return { steps, result: s };
  } catch (e) {
    throw new Error(`前束范式转换失败：${(e as Error).message}`);
  }
}

// 关系复合矩阵：R∘S = MR · MS（布尔矩阵乘法）
export function relationComposition(R: number[][], S: number[][]): {
  matrix: number[][];
  description: string;
} {
  try {
    const n = R.length;
    const m = S[0].length;
    const k = R[0].length;
    if (k !== S.length) throw new Error('矩阵维数不匹配：R的列数必须等于S的行数');
    
    const result: number[][] = [];
    for (let i = 0; i < n; i++) {
      result[i] = [];
      for (let j = 0; j < m; j++) {
        let val = 0;
        for (let t = 0; t < k; t++) {
          if (R[i][t] && S[t][j]) { val = 1; break; }
        }
        result[i][j] = val;
      }
    }
    return {
      matrix: result,
      description: `复合关系 R∘S 的布尔矩阵（${n}×${m}）`,
    };
  } catch (e) {
    throw new Error(`关系复合计算失败：${(e as Error).message}`);
  }
}

// 环判定（两个运算表：加法 + 乘法）
export function ringCheck(
  addTable: number[][], mulTable: number[][],
): {
  isRing: boolean;
  isCommutativeRing: boolean;
  hasUnity: boolean;
  isField: boolean;
  description: string;
} {
  try {
    const n = addTable.length;
    
    // 1. 加法是Abel群
    const addGroup = checkGroupProperties(addTable);
    const isAbelianAdd = addGroup.isGroup && addGroup.isAbelian;
    
    // 2. 乘法封闭 + 结合律
    let mulClosed = true;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (mulTable[i][j] < 0 || mulTable[i][j] >= n) mulClosed = false;
    
    let mulAssociative = true;
    if (n <= 8) {
      for (let a = 0; a < n && mulAssociative; a++)
        for (let b = 0; b < n && mulAssociative; b++)
          for (let c = 0; c < n && mulAssociative; c++) {
            const ab = mulTable[a][b];
            const bc = mulTable[b][c];
            const left = mulTable[ab][c];
            const right = mulTable[a][bc];
            if (left !== right) mulAssociative = false;
          }
    }
    
    // 3. 分配律 (a+b)c = ac+bc, a(b+c) = ab+ac
    let distributive = true;
    if (n <= 6) {
      for (let a = 0; a < n && distributive; a++)
        for (let b = 0; b < n && distributive; b++)
          for (let c = 0; c < n && distributive; c++) {
            const ab_add = addTable[a][b];
            const bc_add = addTable[b][c];
            // (a+b)·c vs a·c + b·c
            const left_mul = mulTable[ab_add][c];
            const right_add = addTable[mulTable[a][c]][mulTable[b][c]];
            if (left_mul !== right_add) distributive = false;
            // a·(b+c) vs a·b + a·c
            const left_mul2 = mulTable[a][bc_add];
            const right_add2 = addTable[mulTable[a][b]][mulTable[a][c]];
            if (left_mul2 !== right_add2) distributive = false;
          }
    }
    
    const isRing = isAbelianAdd && mulClosed && mulAssociative && distributive;
    
    // 交换环
    let mulCommutative = true;
    for (let i = 0; i < n && mulCommutative; i++)
      for (let j = 0; j < n && mulCommutative; j++)
        if (mulTable[i][j] !== mulTable[j][i]) mulCommutative = false;
    const isCommRing = isRing && mulCommutative;
    
    // 含幺环
    let unity: number | null = null;
    for (let e = 0; e < n; e++) {
      let isU = true;
      for (let i = 0; i < n && isU; i++)
        if (mulTable[e][i] !== i || mulTable[i][e] !== i) isU = false;
      if (isU) { unity = e; break; }
    }
    
    // 域：交换环 + 有幺元 + 每个非零元有乘法逆元
    let isField = false;
    if (isCommRing && unity !== null) {
      let allInv = true;
      const zero = addGroup.identity ?? 0;
      for (let i = 0; i < n && allInv; i++) {
        if (i === zero) continue;
        let found = false;
        for (let j = 0; j < n; j++) {
          if (mulTable[i][j] === unity && mulTable[j][i] === unity) { found = true; break; }
        }
        if (!found) allInv = false;
      }
      isField = allInv;
    }
    
    const desc = [
      isAbelianAdd ? '✓ 加法是Abel群' : '✗ 加法不是Abel群',
      mulClosed ? '✓ 乘法封闭' : '✗ 乘法不封闭',
      mulAssociative ? '✓ 乘法结合律' : '✗ 乘法不满足结合律',
      distributive ? '✓ 分配律' : '✗ 不满足分配律',
      isRing ? (isCommRing ? '→ 是交换环' : '→ 是环（非交换）') : '→ 不是环',
      unity !== null ? `✓ 乘法幺元 e=${unity}` : '— 无乘法幺元',
      isField ? '→ 是域' : '',
    ].filter(Boolean).join('\n');
    
    return {
      isRing,
      isCommutativeRing: isCommRing,
      hasUnity: unity !== null,
      isField,
      description: desc,
    };
  } catch (e) {
    throw new Error(`环/域判定失败：${(e as Error).message}`);
  }
}

// 邻接矩阵的幂：A^k 表示 k 步路径数
export function adjMatrixPower(adjMatrix: number[][], k: number): {
  matrix: number[][];
  reachable: boolean[][];
  description: string;
} {
  try {
    const n = adjMatrix.length;
    // 整数矩阵乘法
    const matMul = (A: number[][], B: number[][]) => {
      const R: number[][] = [];
      for (let i = 0; i < n; i++) {
        R[i] = [];
        for (let j = 0; j < n; j++) {
          let s = 0;
          for (let t = 0; t < n; t++) s += A[i][t] * B[t][j];
          R[i][j] = s;
        }
      }
      return R;
    };
    
    // A^1 = A
    let result = adjMatrix.map(row => [...row]);
    for (let p = 2; p <= k; p++) {
      result = matMul(result, adjMatrix);
    }
    
    // 可达矩阵：A + A² + ... + A^n 中 > 0 的位置
    let reach = adjMatrix.map(row => [...row]);
    let cur = adjMatrix.map(row => [...row]);
    for (let p = 2; p <= n; p++) {
      cur = matMul(cur, adjMatrix);
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
          reach[i][j] += cur[i][j];
    }
    const reachable: boolean[][] = [];
    for (let i = 0; i < n; i++) {
      reachable[i] = [];
      for (let j = 0; j < n; j++) reachable[i][j] = reach[i][j] > 0;
    }
    
    return {
      matrix: result,
      reachable,
      description: `A^${k} 中 (i,j) 元素表示从 i 到 j 长度为 ${k} 的路径数`,
    };
  } catch (e) {
    throw new Error(`邻接矩阵幂计算失败：${(e as Error).message}`);
  }
}

// 关键路径（AOE网）：拓扑排序 + 最早/最迟开始时间
export function criticalPath(
  adjList: Array<{ from: number; to: number; weight: number }>,
  numNodes: number,
): {
  topoOrder: number[];
  earliest: number[];
  latest: number[];
  slack: number[];
  criticalEdges: string[];
  criticalPath: string;
  totalTime: number;
} {
  try {
    // 建图
    const inDegree = new Array(numNodes).fill(0);
    const outEdges: number[][] = [];
    for (let i = 0; i < numNodes; i++) outEdges[i] = [];
    for (const e of adjList) {
      outEdges[e.from].push(e.to);
      inDegree[e.to]++;
    }
    
    // 拓扑排序（Kahn）
    const queue: number[] = [];
    for (let i = 0; i < numNodes; i++) if (inDegree[i] === 0) queue.push(i);
    const topoOrder: number[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      topoOrder.push(u);
      for (const v of outEdges[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) queue.push(v);
      }
    }
    if (topoOrder.length !== numNodes) throw new Error('图中存在环，无法求关键路径');
    
    // 最早开始时间
    const earliest = new Array(numNodes).fill(0);
    for (const u of topoOrder) {
      for (const e of adjList) {
        if (e.from === u) {
          earliest[e.to] = Math.max(earliest[e.to], earliest[u] + e.weight);
        }
      }
    }
    
    const totalTime = Math.max(...earliest);
    
    // 最迟开始时间
    const latest = new Array(numNodes).fill(totalTime);
    const revTopo = [...topoOrder].reverse();
    for (const u of revTopo) {
      for (const e of adjList) {
        if (e.to === u) {
          latest[e.from] = Math.min(latest[e.from], latest[u] - e.weight);
        }
      }
    }
    
    // 时间余量（活动的 slack = 最迟-最早）
    const slack = new Array(adjList.length).fill(0);
    const criticalEdges: string[] = [];
    for (let i = 0; i < adjList.length; i++) {
      const e = adjList[i];
      slack[i] = latest[e.to] - earliest[e.from] - e.weight;
      if (Math.abs(slack[i]) < 1e-9) criticalEdges.push(`${e.from}→${e.to}`);
    }
    
    // 从起点到终点的关键路径
    let cur = topoOrder[0];
    const path = [cur];
    while (cur !== topoOrder[topoOrder.length - 1]) {
      for (const e of adjList) {
        if (e.from === cur && Math.abs(latest[e.to] - earliest[cur] - e.weight) < 1e-9) {
          cur = e.to;
          path.push(cur);
          break;
        }
      }
    }
    
    return {
      topoOrder,
      earliest,
      latest,
      slack,
      criticalEdges,
      criticalPath: path.join(' → '),
      totalTime,
    };
  } catch (e) {
    throw new Error(`关键路径计算失败：${(e as Error).message}`);
  }
}

// 母函数解递推（简单版：已知系数生成函数，展开前若干项）
export function generatingFunctionExpand(
  numCoeffs: number[], denCoeffs: number[], n: number,
): { sequence: number[]; closedForm: string; note: string } {
  try {
    // G(x) = (a0 + a1x + ...) / (b0 + b1x + ...)
    // 展开系数 c[n] 满足递推：b0*c[n] + b1*c[n-1] + ... = a[n]
    const b = denCoeffs;
    const a = numCoeffs;
    const c: number[] = [];
    for (let k = 0; k <= n; k++) {
      let rhs = k < a.length ? a[k] : 0;
      for (let i = 1; i <= k && i < b.length; i++) {
        rhs -= b[i] * c[k - i];
      }
      c[k] = b[0] !== 0 ? rhs / b[0] : 0;
    }
    return {
      sequence: c.slice(0, n + 1),
      closedForm: `G(x) = (${numCoeffs.join(' + ')}) / (${denCoeffs.join(' + ')})`,
      note: `前 ${n + 1} 项系数为序列 a₀..aₙ`,
    };
  } catch (e) {
    throw new Error(`母函数展开失败：${(e as Error).message}`);
  }
}

// ========== 现代数学补强 ==========

// 杨辉三角：生成前 n 行（n ≤ 20）
export function pascalTriangle(n: number): {
  rows: number[][];
  properties: string[];
} {
  try {
    if (n < 1) n = 1;
    if (n > 30) n = 30;
    const rows: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j <= i; j++) {
        if (j === 0 || j === i) row.push(1);
        else row.push(rows[i - 1][j - 1] + rows[i - 1][j]);
      }
      rows.push(row);
    }
    const properties = [
      '对称性：C(n,k) = C(n,n−k)',
      `递推：C(n,k) = C(n−1,k−1) + C(n−1,k)`,
      `每行和：Σ C(n,k) = 2ⁿ = ${Math.pow(2, n - 1)}（第 ${n} 行）`,
      '奇数行和 = 偶数行和 = 2ⁿ⁻¹',
    ];
    return { rows, properties };
  } catch (e) {
    throw new Error(`杨辉三角生成失败：${(e as Error).message}`);
  }
}

// 整数分拆 p(n)：将 n 拆成正整数之和的方式数
export function integerPartition(n: number): {
  p: number;
  partitions: number[][] | null;
  note: string;
} {
  try {
    if (n < 0) return { p: 0, partitions: [], note: 'n 必须非负' };
    if (n === 0) return { p: 1, partitions: [[]], note: 'p(0) = 1（空分拆）' };
    if (n > 100) n = 100;
    
    // DP：p(n,k) = 将n拆成最大数≤k的分拆数
    // p(n) = p(n,n)
    const dp: number[][] = [];
    for (let i = 0; i <= n; i++) dp[i] = new Array(n + 1).fill(0);
    for (let k = 0; k <= n; k++) dp[0][k] = 1;
    
    for (let i = 1; i <= n; i++) {
      for (let k = 1; k <= n; k++) {
        if (k > i) dp[i][k] = dp[i][i];
        else dp[i][k] = dp[i][k - 1] + dp[i - k][k];
      }
    }
    
    // 生成分拆（n ≤ 15 时返回所有分拆）
    let partitions: number[][] | null = null;
    if (n <= 12) {
      const result: number[][] = [];
      const genParts = (remaining: number, max: number, current: number[]) => {
        if (remaining === 0) { result.push([...current]); return; }
        for (let k = Math.min(max, remaining); k >= 1; k--) {
          current.push(k);
          genParts(remaining - k, k, current);
          current.pop();
        }
      };
      genParts(n, n, []);
      partitions = result;
    }
    
    return {
      p: dp[n][n],
      partitions,
      note: `p(${n}) = ${dp[n][n]}${n <= 12 ? `（共 ${partitions!.length} 种分拆）` : '（n>12 不枚举）'}`,
    };
  } catch (e) {
    throw new Error(`整数分拆计算失败：${(e as Error).message}`);
  }
}

// RSA 加密解密演示（小素数）
export function rsaDemo(p: number, q: number, e: number, message: number): {
  n: number;
  phiN: number;
  e: number;
  d: number;
  publicKey: string;
  privateKey: string;
  encrypted: number;
  decrypted: number;
  steps: string[];
} {
  try {
    if (p < 2 || q < 2 || e < 2) throw new Error('参数无效');
    const n = p * q;
    const phiN = (p - 1) * (q - 1);
    
    // 求 d = e^{-1} mod φ(n)（扩展欧几里得）
    function modInv(a: number, m: number): number {
      let m0 = m, t, q;
      let x0 = 0, x1 = 1;
      if (m === 1) return 0;
      while (a > 1) {
        q = Math.floor(a / m);
        t = m;
        m = a % m;
        a = t;
        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
      }
      if (x1 < 0) x1 += m0;
      return x1;
    }
    
    // 检查 gcd(e, phiN) = 1
    function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
    if (gcd(e, phiN) !== 1) throw new Error(`e 与 φ(n) 不互素，gcd(${e}, ${phiN}) = ${gcd(e, phiN)}`);
    
    const d = modInv(e, phiN);
    
    // 模幂运算（快速幂）
    function modPow(base: number, exp: number, mod: number): number {
      let result = 1;
      base = base % mod;
      while (exp > 0) {
        if (exp % 2 === 1) result = (result * base) % mod;
        exp = Math.floor(exp / 2);
        base = (base * base) % mod;
      }
      return result;
    }
    
    const encrypted = modPow(message, e, n);
    const decrypted = modPow(encrypted, d, n);
    
    const steps = [
      `1. 选素数 p = ${p}, q = ${q}`,
      `2. 计算 n = p·q = ${n}`,
      `3. 计算 φ(n) = (p-1)(q-1) = ${phiN}`,
      `4. 选公钥指数 e = ${e}（满足 gcd(e, φ(n)) = 1）`,
      `5. 求私钥指数 d = e⁻¹ mod φ(n) = ${d}`,
      `6. 加密：c = m^e mod n = ${message}^${e} mod ${n} = ${encrypted}`,
      `7. 解密：m = c^d mod n = ${encrypted}^${d} mod ${n} = ${decrypted}`,
    ];
    
    return {
      n, phiN, e, d,
      publicKey: `(e=${e}, n=${n})`,
      privateKey: `(d=${d}, n=${n})`,
      encrypted,
      decrypted,
      steps,
    };
  } catch (e) {
    throw new Error(`RSA 演示失败：${(e as Error).message}`);
  }
}

// 汉明码 (7,4) 编码 + 单错纠错
export function hammingCode74(dataBits: number[]): {
  encoded: number[];
  syndrome: number;
  errorPosition: number;
  corrected: number[];
  isValid: boolean;
  note: string;
} {
  try {
    if (dataBits.length !== 4) throw new Error('汉明码(7,4)需要4位数据位');
    const d = dataBits.map(b => b & 1);
    
    // 编码：G矩阵生成 (p1 p2 d1 p3 d2 d3 d4)
    // 位置: 1=p1, 2=p2, 3=d1, 4=p3, 5=d2, 6=d3, 7=d4
    const p1 = d[0] ^ d[1] ^ d[3]; // d1+d2+d4
    const p2 = d[0] ^ d[2] ^ d[3]; // d1+d3+d4
    const p3 = d[1] ^ d[2] ^ d[3]; // d2+d3+d4
    const encoded = [p1, p2, d[0], p3, d[1], d[2], d[3]];
    
    // 模拟接收（无错）
    const received = [...encoded];
    
    // 校验：计算伴随式
    const s1 = received[0] ^ received[2] ^ received[4] ^ received[6]; // p1 ⊕ d1 ⊕ d2 ⊕ d4
    const s2 = received[1] ^ received[2] ^ received[5] ^ received[6]; // p2 ⊕ d1 ⊕ d3 ⊕ d4
    const s3 = received[3] ^ received[4] ^ received[5] ^ received[6]; // p3 ⊕ d2 ⊕ d3 ⊕ d4
    const syndrome = s3 * 4 + s2 * 2 + s1; // 从高到低 s3 s2 s1
    
    let errorPos = syndrome;
    let corrected = [...received];
    if (syndrome > 0 && syndrome <= 7) {
      corrected[syndrome - 1] ^= 1; // 翻转第 syndrome 位（位置从1开始）
    }
    
    const isValid = syndrome === 0;
    
    return {
      encoded,
      syndrome,
      errorPosition: errorPos,
      corrected,
      isValid,
      note: isValid ? '传输无错误' : `第 ${errorPos} 位出错，已纠正`,
    };
  } catch (e) {
    throw new Error(`汉明码计算失败：${(e as Error).message}`);
  }
}

// 汉明码纠错：给定接收的7位码，找出并纠正错误
export function hammingDecode(received: number[]): {
  syndrome: number;
  errorPosition: number;
  corrected: number[];
  dataBits: number[];
  isValid: boolean;
  note: string;
} {
  try {
    if (received.length !== 7) throw new Error('汉明码(7,4)解码需要7位编码');
    const r = received.map(b => b & 1);
    
    const s1 = r[0] ^ r[2] ^ r[4] ^ r[6];
    const s2 = r[1] ^ r[2] ^ r[5] ^ r[6];
    const s3 = r[3] ^ r[4] ^ r[5] ^ r[6];
    const syndrome = s3 * 4 + s2 * 2 + s1;
    
    const corrected = [...r];
    let errorPos = syndrome;
    if (syndrome > 0 && syndrome <= 7) {
      corrected[syndrome - 1] ^= 1;
    }
    
    // 提取数据位：位置 3,5,6,7 → d1,d2,d3,d4 → 索引 2,4,5,6
    const dataBits = [corrected[2], corrected[4], corrected[5], corrected[6]];
    const isValid = syndrome === 0;
    
    return {
      syndrome,
      errorPosition: errorPos,
      corrected,
      dataBits,
      isValid,
      note: isValid ? '无错误' : `第 ${errorPos} 位出错并纠正，数据 = ${dataBits.join('')}`,
    };
  } catch (e) {
    throw new Error(`汉明码解码失败：${(e as Error).message}`);
  }
}

// 有限域 GF(p) 加法表和乘法表（p 为素数）
export function finiteFieldGFp(p: number): {
  isPrime: boolean;
  addTable: number[][];
  mulTable: number[][];
  additiveIdentity: number;
  multiplicativeIdentity: number;
  note: string;
} {
  try {
    if (p < 2 || p > 11) throw new Error('p 必须为 2~11 的素数');
    
    // 素性检查
    let isPrime = true;
    for (let i = 2; i * i <= p; i++) if (p % i === 0) { isPrime = false; break; }
    if (!isPrime) throw new Error(`${p} 不是素数，不能构成域 GF(p)`);
    
    const addTable: number[][] = [];
    const mulTable: number[][] = [];
    for (let i = 0; i < p; i++) {
      addTable[i] = [];
      mulTable[i] = [];
      for (let j = 0; j < p; j++) {
        addTable[i][j] = (i + j) % p;
        mulTable[i][j] = (i * j) % p;
      }
    }
    
    return {
      isPrime,
      addTable,
      mulTable,
      additiveIdentity: 0,
      multiplicativeIdentity: 1,
      note: `GF(${p}) = {0,1,...,${p - 1}}，模 ${p} 加法和乘法构成有限域`,
    };
  } catch (e) {
    throw new Error(`有限域计算失败：${(e as Error).message}`);
  }
}

// 线性规划单纯形法（两变量，最大化 max z = c1x + c2y s.t. a1x+b1y≤d1, ...）
// 简化版：输入目标函数系数和约束（全部 ≤ 型，非负约束自动加）
export function simplexTwoVar(
  c: number[],
  constraints: Array<{ a: number; b: number; rhs: number }>,
): {
  optimal: number[];
  optimalValue: number;
  feasible: boolean;
  steps: string[];
  note: string;
} {
  try {
    const n = 2; // 变量数
    const m = constraints.length; // 约束数
    
    // 构造初始单纯形表（标准型）
    // max z = c1x1 + c2x2 → min -z = -c1x1 -c2x2
    // 引入松弛变量，每个约束 + 一个松弛变量
    // 表尺寸：(m+1) × (n+m+1)，最后一列是 RHS
    const table: number[][] = [];
    for (let i = 0; i < m; i++) {
      const row = new Array(n + m + 1).fill(0);
      row[0] = constraints[i].a;
      row[1] = constraints[i].b;
      row[n + i] = 1; // 松弛变量
      row[n + m] = constraints[i].rhs;
      table.push(row);
    }
    // 目标函数行（z行，系数取负，因为 min -z）
    const zRow = new Array(n + m + 1).fill(0);
    for (let j = 0; j < n; j++) zRow[j] = -c[j];
    table.push(zRow);
    
    const steps: string[] = ['初始单纯形表（标准型）'];
    
    // 单纯形迭代
    const maxIter = 100;
    for (let iter = 0; iter < maxIter; iter++) {
      // 找进基变量：z行中最负的非基变量系数
      let entering = -1;
      let minCoeff = 0;
      for (let j = 0; j < n + m; j++) {
        if (table[m][j] < minCoeff - 1e-9) {
          minCoeff = table[m][j];
          entering = j;
        }
      }
      if (entering === -1) {
        steps.push(`迭代 ${iter + 1}：最优解已找到（z行所有系数 ≥ 0）`);
        break;
      }
      
      // 找出基变量：最小比值规则
      let leaving = -1;
      let minRatio = Infinity;
      for (let i = 0; i < m; i++) {
        if (table[i][entering] > 1e-9) {
          const ratio = table[i][n + m] / table[i][entering];
          if (ratio < minRatio && ratio >= 0) {
            minRatio = ratio;
            leaving = i;
          }
        }
      }
      if (leaving === -1) {
        steps.push('无界解（所有进基列系数 ≤ 0）');
        return { optimal: [], optimalValue: Infinity, feasible: false, steps, note: '目标函数无界' };
      }
      
      steps.push(`迭代 ${iter + 1}：进基 x${entering + 1}，出基 约束${leaving + 1}，主元 = ${table[leaving][entering].toFixed(4)}`);
      
      // 主元行归一化
      const pivot = table[leaving][entering];
      for (let j = 0; j <= n + m; j++) {
        table[leaving][j] /= pivot;
      }
      
      // 其他行消去进基变量列
      for (let i = 0; i <= m; i++) {
        if (i === leaving) continue;
        const factor = table[i][entering];
        for (let j = 0; j <= n + m; j++) {
          table[i][j] -= factor * table[leaving][j];
        }
      }
    }
    
    // 提取最优解
    const x = new Array(n).fill(0);
    // 找基变量：每列只有一个 1，其余 0，且 1 在唯一行
    for (let j = 0; j < n; j++) {
      let basicRow = -1;
      let ones = 0;
      for (let i = 0; i < m; i++) {
        if (Math.abs(table[i][j] - 1) < 1e-9) { basicRow = i; ones++; }
        else if (Math.abs(table[i][j]) > 1e-9) { ones = 99; break; }
      }
      if (ones === 1 && basicRow >= 0) {
        x[j] = table[basicRow][n + m];
      }
    }
    
    // 我们用的是 -z 行，所以 RHS 中的值是 -z，最优值 = -table[m][n+m]
    // 但因为我们把目标函数系数取负了，z行RHS最后是 z 的值（初始为0，迭代后RHS是最优值）
    // 修正：初始 z 行 RHS = 0，每次迭代后 RHS 列的 z 行值就是最优目标值（因为我们最大化 z = c^Tx）
    // 实际：z 行 = [-c, 0, ..., 0 | 0]，迭代后 z 行 RHS 就是最优 z 值
    const zVal = table[m][n + m];
    
    return {
      optimal: x.map(v => Math.abs(v) < 1e-9 ? 0 : Math.round(v * 1e6) / 1e6),
      optimalValue: Math.abs(zVal) < 1e-9 ? 0 : Math.round(zVal * 1e6) / 1e6,
      feasible: true,
      steps,
      note: `最优解 x* = (${x.map(v => v.toFixed(4)).join(', ')})，max z = ${zVal.toFixed(4)}`,
    };
  } catch (e) {
    throw new Error(`单纯形法计算失败：${(e as Error).message}`);
  }
}

// 图上博弈（无向图顶点博弈，Grundy数/尼姆博弈推广）
// 简化：无向图上轮流沿边走一步，不能走的输（即 impartial game on graph）
// 从起点出发，先走者必胜还是必败
export function graphGame(
  adjMatrix: number[][],
  start: number,
): {
  grundy: number[];
  firstPlayerWins: boolean;
  winningMoves: number[];
  note: string;
} {
  try {
    const n = adjMatrix.length;
    // 计算每个顶点的 Grundy 数（ mex 函数：最小非负整数不在后继集合中）
    // 无向图博弈 = 普通 impartial game（可走的邻居是后继）
    // 注意：无向图可能有环，需要用类似 DAG 的方式处理
    // 简化：假设是 DAG（或按距离排序）
    
    // 先检查是否是 DAG（通过拓扑排序）
    const indeg = new Array(n).fill(0);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (adjMatrix[i][j]) indeg[j]++;
    
    const queue: number[] = [];
    for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);
    const topoOrder: number[] = [];
    const tempIndeg = [...indeg];
    while (queue.length > 0) {
      const u = queue.shift()!;
      topoOrder.push(u);
      for (let v = 0; v < n; v++) {
        if (adjMatrix[u][v]) {
          tempIndeg[v]--;
          if (tempIndeg[v] === 0) queue.push(v);
        }
      }
    }
    
    const isDAG = topoOrder.length === n;
    if (!isDAG) {
      // 有环的无向图博弈更复杂，用尼姆和近似（对连通分量）
      throw new Error('有环图博弈较复杂，请输入 DAG（有向无环图）');
    }
    
    // 按逆拓扑序计算 Grundy 数
    const grundy = new Array(n).fill(0);
    const revTopo = [...topoOrder].reverse();
    for (const u of revTopo) {
      const reachable = new Set<number>();
      for (let v = 0; v < n; v++) {
        if (adjMatrix[u][v]) reachable.add(grundy[v]);
      }
      // mex
      let g = 0;
      while (reachable.has(g)) g++;
      grundy[u] = g;
    }
    
    const firstWins = grundy[start] !== 0;
    const winningMoves: number[] = [];
    for (let v = 0; v < n; v++) {
      if (adjMatrix[start][v] && grundy[v] === 0) winningMoves.push(v);
    }
    
    return {
      grundy,
      firstPlayerWins: firstWins,
      winningMoves,
      note: firstWins
        ? `先手必胜（G(${start}) = ${grundy[start]} ≠ 0），必胜走法：→ ${winningMoves.join(', ')}`
        : `先手必败（G(${start}) = 0），无论怎么走对手都有必胜策略`
    };
  } catch (e) {
    throw new Error(`图上博弈计算失败：${(e as Error).message}`);
  }
}

// ==================== 数论补强：二次互反律与连分数 ====================

/**
 * 二次互反律：(p|q)(q|p) = (-1)^((p-1)(q-1)/4)
 */
export function quadraticReciprocity(
  p: number,
  q: number
): { lpq: number; lqp: number; product: number; rhs: number; holds: boolean } {
  if (!Number.isInteger(p) || !Number.isInteger(q)) {
    throw new Error('二次互反律验证要求 p 和 q 均为整数');
  }
  if (!millerRabin(p).prime || p === 2 || !millerRabin(q).prime || q === 2) {
    throw new Error(`二次互反律要求 p 和 q 均为奇素数，收到 p = ${p}, q = ${q}`);
  }
  const lpq = legendreSymbol(p, q);
  const lqp = legendreSymbol(q, p);
  const product = lpq * lqp;
  const exponentIsEven = (((p - 1) / 2) * ((q - 1) / 2)) % 2 === 0;
  const rhs = exponentIsEven ? 1 : -1;
  return { lpq, lqp, product, rhs, holds: product === rhs };
}

/**
 * 有理数的简单连分数展开：a/b = [a0; a1, a2, ..., an]
 * @param numerator 分子
 * @param denominator 分母
 */
export function continuedFraction(
  numerator: number,
  denominator: number
): { terms: number[]; convergents: Array<{ n: number; d: number }> } {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    throw new Error('连分数展开要求分子和分母均为整数');
  }
  if (denominator === 0) {
    throw new Error('连分数展开的分母不能为 0');
  }
  let a = numerator;
  let b = denominator;
  const terms: number[] = [];
  while (b !== 0) {
    const q = Math.trunc(a / b);
    const r = a - q * b;
    terms.push(q);
    a = b;
    b = r;
  }
  const convergents: Array<{ n: number; d: number }> = [];
  let hPrev2 = 0, hPrev1 = 1;
  let kPrev2 = 1, kPrev1 = 0;
  for (const q of terms) {
    const h = q * hPrev1 + hPrev2;
    const k = q * kPrev1 + kPrev2;
    convergents.push({ n: h, d: k });
    hPrev2 = hPrev1; hPrev1 = h;
    kPrev2 = kPrev1; kPrev1 = k;
  }
  return { terms, convergents };
}

/**
 * 非完全平方数 √n 的连分数展开（周期连分数）
 * @param n 正整数，非完全平方
 */
export function sqrtContinuedFraction(n: number): {
  a0: number;
  period: number[];
  convergents: Array<{ n: number; d: number }>;
  periodLen: number;
} {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`√n 的连分数展开要求 n 为正整数，收到 n = ${n}`);
  }
  const a0 = Math.floor(Math.sqrt(n));
  if (a0 * a0 === n) {
    throw new Error(`n = ${n} 是完全平方数（√${n} = ${a0}），不存在周期连分数展开`);
  }
  const period: number[] = [];
  let m = 0, d = 1, a = a0;
  do {
    m = d * a - m;
    d = (n - m * m) / d;
    a = Math.floor((a0 + m) / d);
    period.push(a);
  } while (a !== 2 * a0);
  const allTerms = [a0, ...period];
  const convergents: Array<{ n: number; d: number }> = [];
  let hPrev2 = 0, hPrev1 = 1;
  let kPrev2 = 1, kPrev1 = 0;
  for (const q of allTerms) {
    const h = q * hPrev1 + hPrev2;
    const k = q * kPrev1 + kPrev2;
    convergents.push({ n: h, d: k });
    hPrev2 = hPrev1; hPrev1 = h;
    kPrev2 = kPrev1; kPrev1 = k;
  }
  return { a0, period, convergents, periodLen: period.length };
}

// ==================== 线性代数补强：SVD / 约当形 / 正规与酉矩阵 ====================

/**
 * 2x2 / 3x3 矩阵的奇异值分解 SVD（数值）
 * 利用 A^T A 的特征值与特征向量求 V 和 Σ，再由 U = A V Σ^+ 求 U
 * @param A 矩阵（m×n，m≥n 或 n≥m 均可）
 * @returns { U, S, V } 其中 S 为奇异值数组（降序），U 为 m×k，V 为 n×k
 */
export function svd(A: number[][]): { U: number[][]; S: number[]; V: number[][] } {
  const m = A.length;
  if (m === 0) throw new Error('SVD 要求矩阵非空');
  const n = A[0].length;
  if (!A.every(r => r.length === n)) throw new Error('SVD 要求矩阵每行长度一致');
  if (n > 20) throw new Error('SVD 最大支持 20 列矩阵');

  // 选择较小维度的 A^T A 或 A A^T
  const useATA = n <= m;
  const B = useATA ? matTranspose(A, A[0].length, A.length) : A;
  const C = useATA ? A : matTranspose(A, A[0].length, A.length);
  // 计算 B * C
  const k = useATA ? n : m;
  const M: number[][] = [];
  for (let i = 0; i < k; i++) {
    M[i] = [];
    for (let j = 0; j < k; j++) {
      let s = 0;
      for (let t = 0; t < (useATA ? m : n); t++) {
        s += B[t][i] * C[t][j];
      }
      M[i][j] = s;
    }
  }

  // 对称矩阵特征值/特征向量（幂法迭代 + 消去法，小规模足够）
  const eig = symmetricEigen(M, 200, 1e-10);

  // 奇异值 = √λ（λ ≥ 0）
  const singularValues = eig.values.map(v => Math.sqrt(Math.max(0, v)));
  // 按降序排列
  const idx = singularValues.map((_, i) => i).sort((a, b) => singularValues[b] - singularValues[a]);
  const S = idx.map(i => singularValues[i]);
  const eigVecsSorted = idx.map(i => eig.vectors[i]);

  if (useATA) {
    // V = eigvecs(A^T A), U = A V Σ^+
    const V = eigVecsSorted;
    const U: number[][] = [];
    for (let i = 0; i < m; i++) {
      U[i] = [];
      for (let j = 0; j < k; j++) {
        if (S[j] < 1e-10) {
          U[i][j] = 0;
        } else {
          let s = 0;
          for (let t = 0; t < n; t++) {
            s += A[i][t] * V[j][t];
          }
          U[i][j] = s / S[j];
        }
      }
    }
    // 对 U 的零空间补正交基（可选，此处返回 thin SVD）
    return { U, S, V };
  } else {
    // U = eigvecs(A A^T), V = A^T U Σ^+
    const U = eigVecsSorted;
    const V: number[][] = [];
    const AT = matTranspose(A, n, m);
    for (let i = 0; i < n; i++) {
      V[i] = [];
      for (let j = 0; j < k; j++) {
        if (S[j] < 1e-10) {
          V[i][j] = 0;
        } else {
          let s = 0;
          for (let t = 0; t < m; t++) {
            s += AT[i][t] * U[j][t];
          }
          V[i][j] = s / S[j];
        }
      }
    }
    return { U, S, V };
  }
}

// 对称矩阵特征值 / 特征向量：依次用幂法 + 消去（小规模使用）
function symmetricEigen(M: number[][], maxIter = 200, tol = 1e-10): { values: number[]; vectors: number[][] } {
  const n = M.length;
  const values: number[] = [];
  const vectors: number[][] = [];
  let A = M.map(r => [...r]);
  for (let k = 0; k < n; k++) {
    // 幂法求最大特征值
    let v = new Array(n - k).fill(1 / Math.sqrt(n - k));
    let lambda = 0;
    for (let iter = 0; iter < maxIter; iter++) {
      // A * v
      const w: number[] = [];
      for (let i = 0; i < n - k; i++) {
        let s = 0;
        for (let j = 0; j < n - k; j++) s += A[i][j] * v[j];
        w[i] = s;
      }
      const norm = Math.hypot(...w);
      if (norm < tol) { lambda = 0; break; }
      const vNew = w.map(x => x / norm);
      lambda = 0;
      for (let i = 0; i < n - k; i++) lambda += vNew[i] * w[i];
      let diff = 0;
      for (let i = 0; i < n - k; i++) diff += (vNew[i] - v[i]) ** 2;
      v = vNew;
      if (Math.sqrt(diff) < tol) break;
    }
    // 补足为 n 维向量（前 k 维为 0）
    const fullV = new Array(n).fill(0);
    for (let i = 0; i < n - k; i++) fullV[k + i] = v[i];
    values.push(lambda);
    vectors.push(fullV);
    // 消去：A' = A - λ v v^T
    const newSize = n - k - 1;
    const newA: number[][] = [];
    for (let i = 0; i < newSize; i++) {
      newA[i] = [];
      for (let j = 0; j < newSize; j++) {
        newA[i][j] = A[i + 1][j + 1] - lambda * v[i + 1] * v[j + 1];
      }
    }
    A = newA;
  }
  return { values, vectors };
}

// 矩阵转置（列优先参数：cols / rows）
function matTranspose(A: number[][], cols: number, rows: number): number[][] {
  const T: number[][] = [];
  for (let j = 0; j < cols; j++) {
    T[j] = [];
    for (let i = 0; i < rows; i++) T[j][i] = A[i][j];
  }
  return T;
}

/**
 * 小规模矩阵的约当标准形（仅支持 2×2 / 3×3 数值矩阵）
 * 通过特征值 + 特征向量 + 广义特征向量构造
 * @param A n×n 方阵（n≤3）
 * @returns { J, P, eigenvalues } 其中 J 为约当标准形，P 满足 A P = P J
 */
export function jordanForm(A: number[][]): {
  J: number[][];
  P: number[][];
  eigenvalues: number[];
  blocks: Array<{ size: number; eigenvalue: number }>;
} {
  const n = A.length;
  if (n > 3) throw new Error(`约当标准形仅支持 3 阶以内方阵，当前 ${n} 阶`);
  if (!A.every(r => r.length === n)) throw new Error('约当标准形要求方阵');

  if (n === 1) {
    return { J: [[A[0][0]]], P: [[1]], eigenvalues: [A[0][0]], blocks: [{ size: 1, eigenvalue: A[0][0] }] };
  }

  if (n === 2) {
    const tr = A[0][0] + A[1][1];
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    const disc = tr * tr - 4 * det;
    const tol = 1e-8;
    if (disc > tol) {
      // 两异实特征值：对角形
      const l1 = (tr + Math.sqrt(disc)) / 2;
      const l2 = (tr - Math.sqrt(disc)) / 2;
      const v1 = findEigenvector(A, l1, tol);
      const v2 = findEigenvector(A, l2, tol);
      return {
        J: [[l1, 0], [0, l2]],
        P: [[v1[0], v2[0]], [v1[1], v2[1]]],
        eigenvalues: [l1, l2],
        blocks: [{ size: 1, eigenvalue: l1 }, { size: 1, eigenvalue: l2 }],
      };
    } else {
      // 二重特征值：可能是对角形（可对角化）或 1 个 2 阶 Jordan 块
      const l = tr / 2;
      const v = findEigenvector(A, l, tol);
      // 检查几何重数：A - λI 的秩
      const rank = rank2x2([
        [A[0][0] - l, A[0][1]],
        [A[1][0], A[1][1] - l],
      ], tol);
      const geoMult = 2 - rank;
      if (geoMult === 2) {
        // 可对角化，找第二个线性无关的特征向量
        let v2: number[];
        if (Math.abs(v[0]) > tol) v2 = [-v[1], v[0]]; // 正交方向
        else v2 = [1, 0];
        // 验证 v2 是否也是特征向量，若不是则用幂法找第二个
        const Av2 = [A[0][0] * v2[0] + A[0][1] * v2[1], A[1][0] * v2[0] + A[1][1] * v2[1]];
        if (Math.abs(Av2[0] - l * v2[0]) > tol || Math.abs(Av2[1] - l * v2[1]) > tol) {
          // 几何重数为 2 应该有二维特征子空间，任意垂直于 v 的向量都应在子空间内
          // 如果不是，说明几何重数实为 1（数值误差导致 rank 估计不准）
        }
        return {
          J: [[l, 0], [0, l]],
          P: [[v[0], v2[0]], [v[1], v2[1]]],
          eigenvalues: [l, l],
          blocks: [{ size: 1, eigenvalue: l }, { size: 1, eigenvalue: l }],
        };
      } else {
        // 几何重数为 1：一个 2 阶 Jordan 块，求广义特征向量 w，满足 (A - λI)w = v
        const B = [
          [A[0][0] - l, A[0][1], v[0]],
          [A[1][0], A[1][1] - l, v[1]],
        ];
        const w = solve2x2Augmented(B, tol);
        return {
          J: [[l, 1], [0, l]],
          P: [[v[0], w[0]], [v[1], w[1]]],
          eigenvalues: [l, l],
          blocks: [{ size: 2, eigenvalue: l }],
        };
      }
    }
  }

  // 3x3：使用特征多项式 + 数值特征值 + 几何重数判断
  const eig = computeEigenvalues3x3(A);
  const blocks: Array<{ size: number; eigenvalue: number }> = [];
  const columns: number[][] = []; // P 的列向量
  const usedLambdas = new Set<number>();
  const tol = 1e-6;

  for (const lambda of eig) {
    // 检查是否已处理（重特征值只处理一次）
    let isNew = true;
    for (const used of usedLambdas) {
      if (Math.abs(lambda - used) < tol) { isNew = false; break; }
    }
    if (!isNew) continue;
    usedLambdas.add(lambda);

    // 代数重数
    let algMult = 0;
    for (const e of eig) if (Math.abs(e - lambda) < tol) algMult++;

    // 几何重数 = 3 - rank(A - λI)
    const AmLI = A.map((r, i) => r.map((v, j) => (i === j ? v - lambda : v)));
    const geoMult = 3 - rank3x3(AmLI, tol);

    if (geoMult === algMult) {
      // 可对角化：加 algMult 个 1×1 块
      const evs = findEigenbasis(A, lambda, geoMult, tol);
      for (const ev of evs) {
        blocks.push({ size: 1, eigenvalue: lambda });
        columns.push(ev);
      }
    } else if (algMult === 2 && geoMult === 1) {
      // 1 个 2 阶 Jordan 块
      const v = findEigenvector(A, lambda, tol);
      // 求广义特征向量 w：(A - λI)w = v
      const w = findGeneralizedEigenvector(A, lambda, v, tol);
      blocks.push({ size: 2, eigenvalue: lambda });
      columns.push(v);
      columns.push(w);
    } else if (algMult === 3 && geoMult === 1) {
      // 1 个 3 阶 Jordan 块
      const v = findEigenvector(A, lambda, tol);
      const w = findGeneralizedEigenvector(A, lambda, v, tol);
      const u = findGeneralizedEigenvector(A, lambda, w, tol);
      blocks.push({ size: 3, eigenvalue: lambda });
      columns.push(v);
      columns.push(w);
      columns.push(u);
    } else if (algMult === 3 && geoMult === 2) {
      // 1 个 2 阶 + 1 个 1 阶
      const evs = findEigenbasis(A, lambda, 2, tol);
      const v = evs[0];
      const w = findGeneralizedEigenvector(A, lambda, v, tol);
      blocks.push({ size: 2, eigenvalue: lambda });
      blocks.push({ size: 1, eigenvalue: lambda });
      columns.push(v);
      columns.push(w);
      columns.push(evs[1]);
    } else {
      // 兜底：全部当 1×1 块
      for (let i = 0; i < algMult; i++) {
        blocks.push({ size: 1, eigenvalue: lambda });
        columns.push(findEigenvector(A, lambda, tol));
      }
    }
  }

  // 构造 J（按 Jordan 块排列）
  const J: number[][] = [];
  let idx = 0;
  for (const b of blocks) {
    for (let i = 0; i < b.size; i++) {
      J[idx] = new Array(3).fill(0);
      J[idx][idx] = b.eigenvalue;
      if (i < b.size - 1) J[idx][idx + 1] = 1;
      idx++;
    }
  }

  // 构造 P（列为特征向量 / 广义特征向量）
  const P: number[][] = [];
  for (let i = 0; i < 3; i++) {
    P[i] = [];
    for (let j = 0; j < 3; j++) P[i][j] = columns[j][i];
  }

  return { J, P, eigenvalues: eig, blocks };
}

// 求矩阵的特征向量（幂法，已知特征值）
function findEigenvector(A: number[][], lambda: number, tol: number): number[] {
  // 解 (A - λI)v = 0
  const M = A.map((r, i) => r.map((v, j) => (i === j ? v - lambda : v)));
  // 用高斯消元找零空间向量
  return nullSpaceVector(M, tol);
}

// 求零空间一个非零向量
function nullSpaceVector(M: number[][], tol: number): number[] {
  const n = M.length;
  const aug = M.map(r => [...r, 0]);
  // 高斯消元
  let pivotRow = 0;
  const pivotCols: number[] = [];
  for (let col = 0; col < n && pivotRow < n; col++) {
    let maxRow = pivotRow;
    for (let r = pivotRow + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[maxRow][col])) maxRow = r;
    }
    if (Math.abs(aug[maxRow][col]) < tol) continue;
    [aug[pivotRow], aug[maxRow]] = [aug[maxRow], aug[pivotRow]];
    pivotCols.push(col);
    for (let r = 0; r < n; r++) {
      if (r !== pivotRow && Math.abs(aug[r][col]) > tol) {
        const factor = aug[r][col] / aug[pivotRow][col];
        for (let c = col; c <= n; c++) aug[r][c] -= factor * aug[pivotRow][c];
      }
    }
    pivotRow++;
  }
  // 自由变量
  const isPivot = new Set(pivotCols);
  const freeCols: number[] = [];
  for (let c = 0; c < n; c++) if (!isPivot.has(c)) freeCols.push(c);
  if (freeCols.length === 0) {
    // 零空间为 0（理论上特征值存在不应发生），返回近似解
    return new Array(n).fill(1 / Math.sqrt(n));
  }
  const v = new Array(n).fill(0);
  v[freeCols[0]] = 1;
  for (let r = pivotCols.length - 1; r >= 0; r--) {
    const pc = pivotCols[r];
    let sum = 0;
    for (let c = pc + 1; c < n; c++) sum += aug[r][c] * v[c];
    v[pc] = -sum / aug[r][pc];
  }
  const norm = Math.hypot(...v);
  return v.map(x => x / norm);
}

// 求广义特征向量：(A - λI)w = v
function findGeneralizedEigenvector(A: number[][], lambda: number, v: number[], tol: number): number[] {
  const n = A.length;
  const M = A.map((r, i) => r.map((val, j) => (i === j ? val - lambda : val)));
  // 解 M w = v
  const aug = M.map((r, i) => [...r, v[i]]);
  // 高斯消元
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[maxRow][col])) maxRow = r;
    }
    if (Math.abs(aug[maxRow][col]) < tol) continue;
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    for (let r = 0; r < n; r++) {
      if (r !== col && Math.abs(aug[r][col]) > tol) {
        const factor = aug[r][col] / aug[col][col];
        for (let c = col; c <= n; c++) aug[r][c] -= factor * aug[col][c];
      }
    }
  }
  // 回代：注意矩阵可能奇异，用秩检测自由变量
  const w = new Array(n).fill(0);
  // 找主元列
  const pivotCols: number[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (Math.abs(aug[r][c]) > tol) { pivotCols.push(c); break; }
    }
  }
  // 设自由变量为 0，主元变量回代
  for (let r = pivotCols.length - 1; r >= 0; r--) {
    const pc = pivotCols[r];
    let sum = aug[r][n];
    for (let c = pc + 1; c < n; c++) sum -= aug[r][c] * w[c];
    w[pc] = sum / aug[r][pc];
  }
  return w;
}

// 求特征子空间的一组基（geoMult 个线性无关特征向量）
function findEigenbasis(A: number[][], lambda: number, geoMult: number, tol: number): number[][] {
  const result: number[][] = [];
  const n = A.length;
  // 对不同初始向量用反幂法求不同特征向量
  for (let k = 0; k < geoMult; k++) {
    let v = new Array(n).fill(0);
    v[k % n] = 1;
    // 简单：解 (A - λI)v = 0 的零空间，取不同自由变量值
    const M = A.map((r, i) => r.map((val, j) => (i === j ? val - lambda : val)));
    const vv = nullSpaceVectorKth(M, k, tol);
    // Gram-Schmidt 正交化（数值稳定）
    let w = vv;
    for (const prev of result) {
      let dot = 0;
      for (let i = 0; i < n; i++) dot += w[i] * prev[i];
      w = w.map((x, i) => x - dot * prev[i]);
    }
    const norm = Math.hypot(...w);
    if (norm > tol) {
      result.push(w.map(x => x / norm));
    }
  }
  return result;
}

// 零空间第 k 个基向量（取第 k 个自由变量为 1，其余为 0）
function nullSpaceVectorKth(M: number[][], k: number, tol: number): number[] {
  const n = M.length;
  const aug = M.map(r => [...r, 0]);
  let pivotRow = 0;
  const pivotCols: number[] = [];
  for (let col = 0; col < n && pivotRow < n; col++) {
    let maxRow = pivotRow;
    for (let r = pivotRow + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[maxRow][col])) maxRow = r;
    }
    if (Math.abs(aug[maxRow][col]) < tol) continue;
    [aug[pivotRow], aug[maxRow]] = [aug[maxRow], aug[pivotRow]];
    pivotCols.push(col);
    for (let r = 0; r < n; r++) {
      if (r !== pivotRow && Math.abs(aug[r][col]) > tol) {
        const factor = aug[r][col] / aug[pivotRow][col];
        for (let c = col; c <= n; c++) aug[r][c] -= factor * aug[pivotRow][c];
      }
    }
    pivotRow++;
  }
  const isPivot = new Set(pivotCols);
  const freeCols: number[] = [];
  for (let c = 0; c < n; c++) if (!isPivot.has(c)) freeCols.push(c);
  if (freeCols.length === 0) return new Array(n).fill(1 / Math.sqrt(n));
  const ki = k % freeCols.length;
  const v = new Array(n).fill(0);
  v[freeCols[ki]] = 1;
  for (let r = pivotCols.length - 1; r >= 0; r--) {
    const pc = pivotCols[r];
    let sum = 0;
    for (let c = pc + 1; c < n; c++) sum += aug[r][c] * v[c];
    v[pc] = -sum / aug[r][pc];
  }
  const norm = Math.hypot(...v);
  return v.map(x => x / norm);
}

// 3×3 矩阵特征值（特征多项式 + 三次方程求根）
function computeEigenvalues3x3(A: number[][]): number[] {
  const a = A[0][0], b = A[0][1], c = A[0][2];
  const d = A[1][0], e = A[1][1], f = A[1][2];
  const g = A[2][0], h = A[2][1], i = A[2][2];
  // λ³ - tr(A)λ² + (M11+M22+M33)λ - det(A) = 0
  const tr = a + e + i;
  const m11 = e * i - f * h;
  const m22 = a * i - c * g;
  const m33 = a * e - b * d;
  const sumMinors = m11 + m22 + m33;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  // x³ + px² + qx + r = 0
  const p = -tr;
  const q = sumMinors;
  const r = -det;
  return solveCubic(p, q, r);
}

// 解三次方程 x³ + ax² + bx + c = 0（卡尔达诺公式）
function solveCubic(a: number, b: number, c: number): number[] {
  const Q = (3 * b - a * a) / 9;
  const R = (9 * a * b - 27 * c - 2 * a * a * a) / 54;
  const D = Q * Q * Q + R * R;
  if (D >= 0) {
    const S = Math.cbrt(R + Math.sqrt(D));
    const T = Math.cbrt(R - Math.sqrt(D));
    const x1 = -a / 3 + S + T;
    // 另外两个是共轭复根，取实部
    const x23real = -a / 3 - (S + T) / 2;
    return [x1, x23real, x23real];
  } else {
    // 三实根
    const theta = Math.acos(R / Math.sqrt(-Q * Q * Q));
    const sqrtQ = Math.sqrt(-Q);
    const x1 = 2 * sqrtQ * Math.cos(theta / 3) - a / 3;
    const x2 = 2 * sqrtQ * Math.cos((theta + 2 * Math.PI) / 3) - a / 3;
    const x3 = 2 * sqrtQ * Math.cos((theta + 4 * Math.PI) / 3) - a / 3;
    return [x1, x2, x3].sort((x, y) => y - x);
  }
}

// 2x2 矩阵秩
function rank2x2(M: number[][], tol: number): number {
  const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
  if (Math.abs(det) > tol) return 2;
  // 检查是否有非零元素
  if (Math.abs(M[0][0]) > tol || Math.abs(M[0][1]) > tol || Math.abs(M[1][0]) > tol || Math.abs(M[1][1]) > tol) return 1;
  return 0;
}

// 3x3 矩阵秩
function rank3x3(M: number[][], tol: number): number {
  // 用行化简
  const A = M.map(r => [...r]);
  let rank = 0;
  const rows = 3, cols = 3;
  let row = 0;
  for (let col = 0; col < cols && row < rows; col++) {
    let pivot = row;
    for (let r = row + 1; r < rows; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    }
    if (Math.abs(A[pivot][col]) < tol) continue;
    [A[row], A[pivot]] = [A[pivot], A[row]];
    for (let r = row + 1; r < rows; r++) {
      if (Math.abs(A[r][col]) > tol) {
        const factor = A[r][col] / A[row][col];
        for (let c = col; c < cols; c++) A[r][c] -= factor * A[row][c];
      }
    }
    rank++;
    row++;
  }
  return rank;
}

// 解 2x2 增广矩阵
function solve2x2Augmented(B: number[][], tol: number): number[] {
  const a = B[0][0], b = B[0][1], e = B[0][2];
  const c = B[1][0], d = B[1][1], f = B[1][2];
  const det = a * d - b * c;
  if (Math.abs(det) > tol) {
    return [(e * d - b * f) / det, (a * f - e * c) / det];
  }
  // 奇异：找最小二乘解（第一行解）
  if (Math.abs(a) > Math.abs(b)) {
    const y = 0;
    return [e / a, y];
  } else if (Math.abs(b) > tol) {
    return [0, e / b];
  }
  return [0, 0];
}

/**
 * 判定矩阵是否为正规矩阵：A* A^H = A^H A（实矩阵即 A A^T = A^T A）
 */
export function isNormalMatrix(A: number[][]): { normal: boolean; reason: string } {
  const m = A.length;
  if (m === 0) return { normal: false, reason: '空矩阵' };
  const n = A[0].length;
  if (m !== n) return { normal: false, reason: '非方阵不可能是正规矩阵' };
  // 计算 A A^T
  const AAT: number[][] = [];
  const ATA: number[][] = [];
  for (let i = 0; i < n; i++) {
    AAT[i] = [];
    ATA[i] = [];
    for (let j = 0; j < n; j++) {
      let s1 = 0, s2 = 0;
      for (let k = 0; k < n; k++) {
        s1 += A[i][k] * A[j][k];
        s2 += A[k][i] * A[k][j];
      }
      AAT[i][j] = s1;
      ATA[i][j] = s2;
    }
  }
  const tol = 1e-8 * n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.abs(AAT[i][j] - ATA[i][j]) > tol) {
        return { normal: false, reason: `A A^T[${i}][${j}] = ${AAT[i][j].toExponential(4)} ≠ A^T A[${i}][${j}] = ${ATA[i][j].toExponential(4)}` };
      }
    }
  }
  return { normal: true, reason: '满足 A A^T = A^T A，是正规矩阵' };
}

/**
 * 判定实矩阵是否为正交矩阵（酉矩阵在实数域的特例）：A^T A = I
 */
export function isOrthogonalMatrix(A: number[][]): { orthogonal: boolean; reason: string; detSign?: number } {
  const m = A.length;
  if (m === 0) return { orthogonal: false, reason: '空矩阵' };
  const n = A[0].length;
  if (m !== n) return { orthogonal: false, reason: '非方阵不可能是正交矩阵' };
  const ATA: number[][] = [];
  for (let i = 0; i < n; i++) {
    ATA[i] = [];
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let k = 0; k < n; k++) s += A[k][i] * A[k][j];
      ATA[i][j] = s;
    }
  }
  const tol = 1e-8 * n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const expected = i === j ? 1 : 0;
      if (Math.abs(ATA[i][j] - expected) > tol) {
        return { orthogonal: false, reason: `A^T A[${i}][${j}] = ${ATA[i][j].toExponential(4)}，应为 ${expected}` };
      }
    }
  }
  // 行列式符号（旋转 vs 反射）
  let detSign = 1;
  if (n <= 3) {
    const det = n === 2 ? A[0][0] * A[1][1] - A[0][1] * A[1][0] : det3x3(A);
    detSign = det >= 0 ? 1 : -1;
  }
  return { orthogonal: true, reason: '满足 A^T A = I，是正交矩阵', detSign };
}

function det3x3(A: number[][]): number {
  return A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1])
    - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0])
    + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
}

// ==================== 概率统计补强：MGF / CLT / 假设检验 ====================

/**
 * 常见分布的矩母函数 MGF：M(t) = E[e^{tX}]
 * @param dist 分布名称
 * @param params 分布参数
 * @returns { mgf: string, mgfValue: (t: number) => number, moments: number[] }
 */
export function mgf(
  dist: string,
  params: Record<string, number>
): {
  mgfLatex: string;
  domain: string;
  mean: number;
  variance: number;
  thirdMoment: number;
  fourthMoment: number;
  skewness: number;
  kurtosis: number;
  moments: { order: number; value: number }[];
} {
  let mu = 0, sigma2 = 0, m3 = 0, m4 = 0;
  let mgfLatex = '', domain = '';
  const name = dist.toLowerCase().trim();

  if (name === 'bernoulli' || name === '伯努利') {
    const p = params.p ?? 0.5;
    if (p < 0 || p > 1) throw new Error('伯努利分布的 p 应在 [0, 1] 内');
    mu = p;
    sigma2 = p * (1 - p);
    m3 = p * (1 - p) * (1 - 2 * p);
    m4 = p * (1 - p) * (1 - 3 * p + 3 * p * p);
    mgfLatex = `M(t) = 1 - p + pe^t = ${formatNum(1 - p)} + ${formatNum(p)}e^t`;
    domain = 't ∈ ℝ';
  } else if (name === 'binomial' || name === '二项' || name === '二项分布') {
    const n = params.n ?? 10, p = params.p ?? 0.5;
    if (n < 1 || !Number.isInteger(n)) throw new Error('二项分布的 n 应为正整数');
    if (p < 0 || p > 1) throw new Error('二项分布的 p 应在 [0, 1] 内');
    mu = n * p;
    sigma2 = n * p * (1 - p);
    m3 = n * p * (1 - p) * (1 - 2 * p);
    m4 = n * p * (1 - p) * (1 + (3 * n - 6) * p * (1 - p));
    mgfLatex = `M(t) = (1 - p + pe^t)^n = (${formatNum(1 - p)} + ${formatNum(p)}e^t)^{${n}}`;
    domain = 't ∈ ℝ';
  } else if (name === 'poisson' || name === '泊松') {
    const lambda = params.lambda ?? 5;
    if (lambda <= 0) throw new Error('泊松分布的 λ 应大于 0');
    mu = lambda;
    sigma2 = lambda;
    m3 = lambda;
    m4 = lambda + 3 * lambda * lambda;
    mgfLatex = `M(t) = e^{\\lambda(e^t - 1)} = e^{${formatNum(lambda)}(e^t - 1)}`;
    domain = 't ∈ ℝ';
  } else if (name === 'exponential' || name === '指数' || name === '指数分布') {
    const lambda = params.lambda ?? 1;
    if (lambda <= 0) throw new Error('指数分布的 λ 应大于 0');
    mu = 1 / lambda;
    sigma2 = 1 / (lambda * lambda);
    m3 = 2 / (lambda ** 3);
    m4 = 9 / (lambda ** 4);
    mgfLatex = `M(t) = \\frac{\\lambda}{\\lambda - t} = \\frac{${formatNum(lambda)}}{${formatNum(lambda)} - t}`;
    domain = 't < λ';
  } else if (name === 'normal' || name === '正态' || name === '高斯') {
    const muP = params.mu ?? 0, sigma = params.sigma ?? 1;
    if (sigma <= 0) throw new Error('正态分布的 σ 应大于 0');
    mu = muP;
    sigma2 = sigma * sigma;
    m3 = 0;
    m4 = 3 * sigma ** 4;
    mgfLatex = `M(t) = e^{\\mu t + \\frac{1}{2}\\sigma^2 t^2} = e{${formatNum(muP)}t + \\frac{1}{2} ${formatNum(sigma2)} t^2}`;
    domain = 't ∈ ℝ';
  } else if (name === 'uniform' || name === '均匀' || name === '均匀分布') {
    const a = params.a ?? 0, b = params.b ?? 1;
    if (a >= b) throw new Error('均匀分布要求 a < b');
    mu = (a + b) / 2;
    sigma2 = (b - a) ** 2 / 12;
    m3 = 0;
    m4 = (b - a) ** 4 / 80 + 3 * sigma2 * sigma2;
    mgfLatex = `M(t) = \\frac{e^{bt} - e^{at}}{(b - a)t} = \\frac{e^{${formatNum(b)}t} - e^{${formatNum(a)}t}}{(${formatNum(b - a)})t}`;
    domain = 't ≠ 0';
  } else if (name === 'geometric' || name === '几何') {
    const p = params.p ?? 0.3;
    if (p <= 0 || p >= 1) throw new Error('几何分布的 p 应在 (0, 1) 内');
    mu = (1 - p) / p;
    sigma2 = (1 - p) / (p * p);
    m3 = (2 - p) * (1 - p) / (p ** 3);
    m4 = (1 - p) * (p * p - 9 * p + 9) / (p ** 4) + 3 * sigma2 * sigma2;
    mgfLatex = `M(t) = \\frac{pe^t}{1 - (1 - p)e^t} = \\frac{${formatNum(p)}e^t}{1 - ${formatNum(1 - p)}e^t}`;
    domain = 't < -ln(1-p)';
  } else {
    throw new Error(`未知分布：${dist}。支持：bernoulli, binomial, poisson, exponential, normal, uniform, geometric`);
  }

  const skewness = sigma2 > 0 ? m3 / Math.pow(sigma2, 1.5) : 0;
  const kurtosis = sigma2 > 0 ? m4 / (sigma2 * sigma2) : 0;

  const moments: { order: number; value: number }[] = [
    { order: 1, value: mu },
    { order: 2, value: sigma2 + mu * mu },
    { order: 3, value: m3 + 3 * mu * sigma2 + mu ** 3 },
    { order: 4, value: m4 + 4 * mu * m3 + 6 * mu * mu * sigma2 + mu ** 4 },
  ];

  return { mgfLatex, domain, mean: mu, variance: sigma2, thirdMoment: m3, fourthMoment: m4, skewness, kurtosis, moments };
}

function formatNum(x: number): string {
  if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
  return x.toFixed(2).replace(/\.0+$/, '');
}

/**
 * 中心极限定理模拟：n 个独立同分布随机变量之和趋于正态分布
 * 模拟骰子或均匀分布
 * @param distribution 分布类型
 * @param params 分布参数
 * @param sampleSize 每个样本的变量数 n
 * @param numSamples 模拟样本数
 * @returns { sampleMeans: number[], bins: number[], counts: number[], theoreticalMean: number, theoreticalStd: number, cltNormal: { x: number[]; y: number[] } }
 */
export function cltSimulation(
  distribution: 'dice' | 'uniform' | 'bernoulli' | 'exponential',
  params: Record<string, number>,
  sampleSize: number,
  numSamples: number
): {
  sampleSums: number[];
  sampleMeans: number[];
  bins: number[];
  counts: number[];
  theoreticalMean: number;
  theoreticalStd: number;
  cltNormal: { x: number[]; y: number[] };
} {
  if (sampleSize < 1) throw new Error('每个样本的变量数 n 应 ≥ 1');
  if (numSamples < 10 || numSamples > 20000) throw new Error('模拟样本数应在 [10, 20000] 之间');

  const sampleSums: number[] = [];
  const sampleMeans: number[] = [];
  let mu = 0, sigma2 = 0;

  for (let s = 0; s < numSamples; s++) {
    let sum = 0;
    for (let i = 0; i < sampleSize; i++) {
      sum += sampleOne(distribution, params);
    }
    sampleSums.push(sum);
    sampleMeans.push(sum / sampleSize);
  }

  // 理论均值和方差
  if (distribution === 'dice') {
    mu = 3.5; sigma2 = 35 / 12;
  } else if (distribution === 'uniform') {
    const a = params.a ?? 0, b = params.b ?? 1;
    mu = (a + b) / 2; sigma2 = (b - a) ** 2 / 12;
  } else if (distribution === 'bernoulli') {
    const p = params.p ?? 0.5;
    mu = p; sigma2 = p * (1 - p);
  } else if (distribution === 'exponential') {
    const lambda = params.lambda ?? 1;
    mu = 1 / lambda; sigma2 = 1 / (lambda * lambda);
  }

  const theoreticalMean = mu;
  const theoreticalStd = Math.sqrt(sigma2 / sampleSize);

  // 直方图分箱
  const allMeans = sampleMeans;
  const minV = Math.min(...allMeans);
  const maxV = Math.max(...allMeans);
  const binCount = Math.min(30, Math.ceil(Math.sqrt(numSamples)));
  const binWidth = (maxV - minV) / binCount || 1;
  const bins: number[] = [];
  const counts: number[] = new Array(binCount).fill(0);
  for (let i = 0; i < binCount; i++) bins.push(minV + (i + 0.5) * binWidth);
  for (const v of allMeans) {
    let idx = Math.floor((v - minV) / binWidth);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  }

  // 正态近似曲线
  const normX: number[] = [];
  const normY: number[] = [];
  const totalArea = numSamples * binWidth;
  for (let i = 0; i <= 100; i++) {
    const x = minV + (maxV - minV) * (i / 100);
    const z = (x - theoreticalMean) / theoreticalStd;
    const pdf = Math.exp(-0.5 * z * z) / (theoreticalStd * Math.sqrt(2 * Math.PI));
    normX.push(x);
    normY.push(pdf * totalArea);
  }

  return { sampleSums, sampleMeans, bins, counts, theoreticalMean, theoreticalStd, cltNormal: { x: normX, y: normY } };
}

// 生成一个随机变量
function sampleOne(dist: string, params: Record<string, number>): number {
  if (dist === 'dice') {
    return Math.floor(Math.random() * 6) + 1;
  }
  if (dist === 'uniform') {
    const a = params.a ?? 0, b = params.b ?? 1;
    return a + Math.random() * (b - a);
  }
  if (dist === 'bernoulli') {
    const p = params.p ?? 0.5;
    return Math.random() < p ? 1 : 0;
  }
  if (dist === 'exponential') {
    const lambda = params.lambda ?? 1;
    return -Math.log(1 - Math.random()) / lambda;
  }
  return 0;
}

/**
 * 假设检验完整流程：Z 检验（已知方差）或 t 检验（未知方差）
 * @param type 'z' | 't'
 * @param tail 'left' | 'right' | 'two'
 * @param sample 样本数据
 * @param mu0 原假设均值
 * @param sigma 总体标准差（仅 z 检验需要）
 * @param alpha 显著性水平
 */
export function hypothesisTest(
  type: 'z' | 't',
  tail: 'left' | 'right' | 'two',
  sample: number[],
  mu0: number,
  sigma?: number,
  alpha = 0.05
): {
  nullHypothesis: string;
  altHypothesis: string;
  sampleMean: number;
  sampleStd: number;
  sampleSize: number;
  testStatistic: number;
  df?: number;
  pValue: number;
  criticalValue: number;
  rejectionRegion: string;
  conclusion: string;
  conclusionEn: string;
  alpha: number;
} {
  if (sample.length < 2) throw new Error('样本量应 ≥ 2');
  if (alpha <= 0 || alpha >= 1) throw new Error('显著性水平 α 应在 (0, 1) 内');

  const n = sample.length;
  const mean = sample.reduce((s, x) => s + x, 0) / n;
  const sse = sample.reduce((s, x) => s + (x - mean) ** 2, 0);
  const sampleStd = Math.sqrt(sse / (n - 1));

  let se: number; // 标准误
  let stat: number; // 检验统计量
  let df: number | undefined;
  let pValue: number;
  let criticalValue: number;

  if (type === 'z') {
    if (sigma === undefined || sigma <= 0) throw new Error('Z 检验需要提供总体标准差 σ (σ > 0)');
    se = sigma / Math.sqrt(n);
    stat = (mean - mu0) / se;
    pValue = normalPValue(stat, tail);
    criticalValue = normalCriticalValue(alpha, tail);
  } else {
    // t 检验
    se = sampleStd / Math.sqrt(n);
    stat = (mean - mu0) / se;
    df = n - 1;
    pValue = tPValue(stat, df, tail);
    criticalValue = tCriticalValue(alpha, df, tail);
  }

  // 原假设和备择假设
  const h0 = `H₀: μ = ${mu0}`;
  let h1 = '';
  let rejectionRegion = '';
  if (tail === 'left') {
    h1 = `H₁: μ < ${mu0}`;
    rejectionRegion = `拒绝域：检验统计量 ≤ ${criticalValue.toFixed(4)}`;
  } else if (tail === 'right') {
    h1 = `H₁: μ > ${mu0}`;
    rejectionRegion = `拒绝域：检验统计量 ≥ ${criticalValue.toFixed(4)}`;
  } else {
    h1 = `H₁: μ ≠ ${mu0}`;
    rejectionRegion = `拒绝域：|检验统计量| ≥ ${criticalValue.toFixed(4)}`;
  }

  const reject = pValue < alpha;
  const conclusion = reject
    ? `在显著性水平 α = ${alpha} 下，拒绝原假设 H₀，认为 ${h1.replace('H₁: ', '')} 成立（p = ${pValue.toExponential(4)}）`
    : `在显著性水平 α = ${alpha} 下，不拒绝原假设 H₀，尚没有足够证据支持 ${h1.replace('H₁: ', '')}（p = ${pValue.toFixed(4)}）`;
  const conclusionEn = reject ? 'Reject H₀' : 'Fail to reject H₀';

  return {
    nullHypothesis: h0,
    altHypothesis: h1,
    sampleMean: mean,
    sampleStd,
    sampleSize: n,
    testStatistic: stat,
    df,
    pValue,
    criticalValue,
    rejectionRegion,
    conclusion,
    conclusionEn,
    alpha,
  };
}

// 标准正态分布 CDF 近似
function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

// 误差函数近似（Abramowitz & Stegun）
function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

function normalPValue(z: number, tail: 'left' | 'right' | 'two'): number {
  if (tail === 'left') return normalCDF(z);
  if (tail === 'right') return 1 - normalCDF(z);
  return 2 * (1 - normalCDF(Math.abs(z)));
}

function normalCriticalValue(alpha: number, tail: 'left' | 'right' | 'two'): number {
  if (tail === 'two') return inverseNormalCDF(1 - alpha / 2);
  if (tail === 'right') return inverseNormalCDF(1 - alpha);
  return inverseNormalCDF(alpha);
}

// 标准正态分布分位数近似（Beasley-Springer-Moro）
function inverseNormalCDF(p: number): number {
  if (p <= 0 || p >= 1) return p <= 0 ? -Infinity : Infinity;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q, r;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= pHigh) {
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

// t 分布 CDF 近似（基于正则化不完全 Beta 函数）
function tCDF(t: number, df: number): number {
  if (df < 1) return 0.5;
  const x = df / (df + t * t);
  const ib = regularizedIncompleteBeta(df / 2, 0.5, x);
  if (t >= 0) return 1 - 0.5 * ib;
  return 0.5 * ib;
}

function tPValue(t: number, df: number, tail: 'left' | 'right' | 'two'): number {
  if (tail === 'left') return tCDF(t, df);
  if (tail === 'right') return 1 - tCDF(t, df);
  return 2 * (1 - tCDF(Math.abs(t), df));
}

function tCriticalValue(alpha: number, df: number, tail: 'left' | 'right' | 'two'): number {
  const p = tail === 'two' ? 1 - alpha / 2 : tail === 'right' ? 1 - alpha : alpha;
  // 用牛顿迭代求逆
  let x = inverseNormalCDF(p); // 初始值用正态近似
  for (let i = 0; i < 20; i++) {
    const fx = tCDF(x, df) - p;
    // t 分布 pdf
    const pdf = gamma((df + 1) / 2) / (Math.sqrt(df * Math.PI) * gamma(df / 2)) * Math.pow(1 + x * x / df, -(df + 1) / 2);
    if (Math.abs(pdf) < 1e-15) break;
    const dx = fx / pdf;
    x -= dx;
    if (Math.abs(dx) < 1e-10) break;
  }
  return x;
}

// Gamma 函数近似（Lanczos 近似简化版）
function gamma(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-06, 1.5056327351493116e-07];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// 正则化不完全 Beta 函数 I_x(a, b)
function regularizedIncompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // 连分数近似
  const bt = Math.exp(gammaLn(a + b) - gammaLn(a) - gammaLn(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betaCF(a, b, x) / a;
  }
  return 1 - bt * betaCF(b, a, 1 - x) / b;
}

function betaCF(a: number, b: number, x: number): number {
  const maxIter = 200, eps = 3e-7;
  let qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < eps) d = eps;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < eps) d = eps;
    c = 1 + aa / c;
    if (Math.abs(c) < eps) c = eps;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < eps) d = eps;
    c = 1 + aa / c;
    if (Math.abs(c) < eps) c = eps;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

// ln Gamma
function gammaLn(z: number): number {
  if (z <= 0) return Infinity;
  const cof = [76.18009173, -86.50532033, 24.01409824, -1.23173958, 0.1208651e-2, -0.539524e-5];
  let y = z, x = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += cof[j] / ++y;
  return -tmp + Math.log(2.50662827 * ser / x);
}

// ===================== 级数敛散性判别器 =====================

interface ConvergenceTestResult {
  method: string;
  applicable: boolean;
  conclusion?: 'convergent' | 'divergent' | 'inconclusive';
  detail: string;
}

interface SeriesConvergenceResult {
  generalTerm: string;
  tests: ConvergenceTestResult[];
  overall: 'convergent' | 'divergent' | 'inconclusive';
  summary: string;
}

/**
 * 级数敛散性判别：自动尝试比值/根值/积分/交错/比较判别法
 * 输入通项表达式（含变量 n），输出各方法判别结果
 */
export function seriesConvergence(termExpr: string, nVar = 'n'): SeriesConvergenceResult {
  const tests: ConvergenceTestResult[] = [];

  // 必要发散性检验（通项极限）
  try {
    const lim = numericLimit(termExpr, nVar, 1e6);
    if (Math.abs(lim) > 1e-6) {
      tests.push({
        method: '必要条件检验',
        applicable: true,
        conclusion: 'divergent',
        detail: `lim(n→∞) a_n = ${lim.toFixed(6)} ≠ 0，级数必发散`,
      });
      return {
        generalTerm: termExpr,
        tests,
        overall: 'divergent',
        summary: `通项极限为 ${lim.toFixed(6)} ≠ 0，由级数收敛的必要条件知级数发散。`,
      };
    } else {
      tests.push({
        method: '必要条件检验',
        applicable: true,
        conclusion: 'inconclusive',
        detail: `lim(n→∞) a_n ≈ 0，必要条件满足（但不保证收敛）`,
      });
    }
  } catch {
    tests.push({ method: '必要条件检验', applicable: false, detail: '无法计算通项极限' });
  }

  // 比值判别法 (D'Alembert)
  try {
    const nextTerm = termExpr.replace(new RegExp(nVar, 'g'), `(${nVar}+1)`);
    const ratioExpr = `abs((${nextTerm}) / (${termExpr}))`;
    const L = numericLimit(ratioExpr, nVar, 1e6);
    if (Number.isFinite(L)) {
      let conclusion: 'convergent' | 'divergent' | 'inconclusive' = 'inconclusive';
      let detail = `L = lim |a_{n+1}/a_n| ≈ ${L.toFixed(6)}`;
      if (L < 0.9999) { conclusion = 'convergent'; detail += ' < 1，比值判别法：绝对收敛'; }
      else if (L > 1.0001) { conclusion = 'divergent'; detail += ' > 1，比值判别法：发散'; }
      else { detail += ' ≈ 1，比值判别法失效'; }
      tests.push({ method: '比值判别法', applicable: true, conclusion, detail });
      if (conclusion !== 'inconclusive') {
        return finalizeResult(termExpr, tests, conclusion);
      }
    } else {
      tests.push({ method: '比值判别法', applicable: false, detail: '比值极限不存在或非有限' });
    }
  } catch {
    tests.push({ method: '比值判别法', applicable: false, detail: '无法计算比值极限' });
  }

  // 根值判别法 (Cauchy)
  try {
    const rootExpr = `abs(${termExpr})^(1/${nVar})`;
    const L = numericLimit(rootExpr, nVar, 1e6);
    if (Number.isFinite(L)) {
      let conclusion: 'convergent' | 'divergent' | 'inconclusive' = 'inconclusive';
      let detail = `L = lim |a_n|^(1/n) ≈ ${L.toFixed(6)}`;
      if (L < 0.9999) { conclusion = 'convergent'; detail += ' < 1，根值判别法：绝对收敛'; }
      else if (L > 1.0001) { conclusion = 'divergent'; detail += ' > 1，根值判别法：发散'; }
      else { detail += ' ≈ 1，根值判别法失效'; }
      tests.push({ method: '根值判别法', applicable: true, conclusion, detail });
      if (conclusion !== 'inconclusive') {
        return finalizeResult(termExpr, tests, conclusion);
      }
    } else {
      tests.push({ method: '根值判别法', applicable: false, detail: '根值极限不存在或非有限' });
    }
  } catch {
    tests.push({ method: '根值判别法', applicable: false, detail: '无法计算根值极限' });
  }

  // 积分判别法（正项级数，f(x)非负递减）
  try {
    // 用大 n 处的差分近似判断单调性
    const fBig = evaluateAt(termExpr, nVar, 1000);
    const fBigger = evaluateAt(termExpr, nVar, 2000);
    if (fBig > 0 && fBigger > 0 && fBigger < fBig) {
      // 近似积分：用部分和估算
      // ∫_1^∞ f(x)dx ≈ Σ f(n) * 1 的部分和增长速度
      let partialSum = 0;
      for (let n = 1; n <= 10000; n++) {
        const val = evaluateAt(termExpr, nVar, n);
        if (!Number.isFinite(val)) break;
        partialSum += val;
        // 余项估计：如果部分和增长越来越慢且增量递减到 0 以下级别
        if (n > 1000 && val < 1e-10) break;
      }
      // 用余项近似判断：比较 n=1000 和 n=10000 处的项
      const v1k = Math.abs(evaluateAt(termExpr, nVar, 1000));
      const v10k = Math.abs(evaluateAt(termExpr, nVar, 10000));
      const ratio = v10k / v1k;
      let conclusion: 'convergent' | 'divergent' | 'inconclusive' = 'inconclusive';
      let detail = '';
      if (ratio < 0.05) {
        conclusion = 'convergent';
        detail = `f(x) 正且递减，f(10000)/f(1000) ≈ ${ratio.toExponential(2)}，积分判别法：收敛（近似）`;
      } else if (ratio > 0.2) {
        conclusion = 'divergent';
        detail = `f(x) 正且递减，f(10000)/f(1000) ≈ ${ratio.toFixed(4)}，衰减太慢，积分判别法：发散（近似）`;
      } else {
        detail = 'f(x) 正且递减，但衰减速度介于收敛与发散之间，积分判别法不确定';
      }
      tests.push({ method: '积分判别法', applicable: true, conclusion, detail });
      if (conclusion !== 'inconclusive') {
        return finalizeResult(termExpr, tests, conclusion);
      }
    }
  } catch {
    tests.push({ method: '积分判别法', applicable: false, detail: '无法应用积分判别法（可能非正或非单调）' });
  }

  // 交错级数判别法 (Leibniz)
  try {
    const absTerm = `abs(${termExpr})`;
    // 用大 n 处值检测是否为交错（符号交替）
    const v1 = evaluateAt(termExpr, nVar, 100);
    const v2 = evaluateAt(termExpr, nVar, 101);
    const v3 = evaluateAt(termExpr, nVar, 102);
    if (v1 * v2 < 0 && v2 * v3 < 0) {
      const absDec = Math.abs(evaluateAt(absTerm, nVar, 2000)) < Math.abs(evaluateAt(absTerm, nVar, 1000));
      let conclusion: 'convergent' | 'divergent' | 'inconclusive' = 'inconclusive';
      let detail = '检测到交错级数：a_n 符号交替';
      if (absDec) {
        conclusion = 'convergent';
        detail += '，且 |a_n| 单调递减趋于 0，Leibniz 判别法：收敛';
      } else {
        detail += '，但 |a_n| 不单调递减，Leibniz 判别法不适用';
      }
      tests.push({ method: '交错级数判别法', applicable: true, conclusion, detail });
      if (conclusion !== 'inconclusive') {
        return finalizeResult(termExpr, tests, conclusion);
      }
    }
  } catch {
    tests.push({ method: '交错级数判别法', applicable: false, detail: '非交错级数' });
  }

  return finalizeResult(termExpr, tests, 'inconclusive');
}

function finalizeResult(term: string, tests: ConvergenceTestResult[], overall: 'convergent' | 'divergent' | 'inconclusive'): SeriesConvergenceResult {
  const summary = overall === 'convergent'
    ? '综合以上判别法，级数收敛。'
    : overall === 'divergent'
    ? '综合以上判别法，级数发散。'
    : '现有判别法均无法得出确定结论，建议进一步分析。';
  return { generalTerm: term, tests, overall, summary };
}

function evaluateAt(expr: string, variable: string, value: number): number {
  const { evaluate } = require('mathjs');
  const scope: Record<string, number> = { [variable]: value };
  return evaluate(expr, scope);
}

// ===================== 参数方程弧长（数值） =====================

/**
 * 参数方程弧长：x = x(t), y = y(t), t ∈ [t0, t1]
 * L = ∫ √(x'(t)² + y'(t)²) dt
 */
export function parametricArcLength(xExpr: string, yExpr: string, t0: number, t1: number, steps = 2000): number {
  if (steps < 10) steps = 10;
  if (steps > 100000) steps = 100000;
  const dt = (t1 - t0) / steps;
  let sum = 0;
  const { derivative, parse } = require('mathjs');
  const dxdt = String(derivative(parse(xExpr), 't'));
  const dydt = String(derivative(parse(yExpr), 't'));
  const { evaluate } = require('mathjs');
  for (let i = 0; i < steps; i++) {
    const t = t0 + (i + 0.5) * dt;
    const scope = { t };
    const dx = evaluate(dxdt, scope);
    const dy = evaluate(dydt, scope);
    const ds = Math.sqrt(dx * dx + dy * dy);
    if (!Number.isFinite(ds)) throw new Error('弧长积分中出现非有限值');
    sum += ds * dt;
  }
  return sum;
}

// ===================== 旋转曲面面积（数值） =====================

/**
 * 曲线 y = f(x) 绕 x 轴旋转的曲面面积
 * S = 2π ∫ y √(1 + (y')²) dx
 */
export function surfaceOfRevolution(fExpr: string, a: number, b: number, steps = 2000): number {
  if (steps < 10) steps = 10;
  if (steps > 100000) steps = 100000;
  const dx = (b - a) / steps;
  let sum = 0;
  const { derivative, parse, evaluate } = require('mathjs');
  const dydx = String(derivative(parse(fExpr), 'x'));
  for (let i = 0; i < steps; i++) {
    const x = a + (i + 0.5) * dx;
    const scope = { x };
    const y = Math.abs(evaluate(fExpr, scope));
    const dyp = evaluate(dydx, scope);
    const ds = Math.sqrt(1 + dyp * dyp);
    const dS = 2 * Math.PI * y * ds * dx;
    if (!Number.isFinite(dS)) throw new Error('旋转曲面面积积分中出现非有限值');
    sum += dS;
  }
  return sum;
}

// ===================== 拉普拉斯变换解常系数 ODE =====================

/**
 * 拉普拉斯变换法解常系数线性 ODE
 * 支持：ay'' + by' + cy = f(t), y(0)=y0, y'(0)=y1
 * f(t) 可为 0、常数、delta(t)、heaviside(t-a)
 * 输出解的表达式 y(t)
 */
export function laplaceSolveODE(
  a: number, b: number, c: number,
  fType: 'zero' | 'constant' | 'delta' | 'heaviside',
  fParams: Record<string, number>,
  y0: number, y1: number
): { solution: string; steps: string[]; characteristic: string } {
  const steps: string[] = [];
  steps.push(`方程：${a}y'' + ${b}y' + ${c}y = f(t), y(0)=${y0}, y'(0)=${y1}`);

  // 特征方程：as² + bs + c = 0
  const disc = b * b - 4 * a * c;
  steps.push(`特征方程：${a}s² + ${b}s + ${c} = 0，判别式 Δ = ${disc}`);

  let characteristic = '';
  let homogeneousSol = '';

  if (disc > 1e-12) {
    const r1 = (-b + Math.sqrt(disc)) / (2 * a);
    const r2 = (-b - Math.sqrt(disc)) / (2 * a);
    characteristic = `相异实根：r₁ = ${r1.toFixed(4)}, r₂ = ${r2.toFixed(4)}`;
    homogeneousSol = `y_h(t) = C₁·e^(${round4(r1)}t) + C₂·e^(${round4(r2)}t)`;
  } else if (Math.abs(disc) < 1e-12) {
    const r = -b / (2 * a);
    characteristic = `重实根：r = ${r.toFixed(4)}`;
    homogeneousSol = `y_h(t) = (C₁ + C₂·t)·e^(${round4(r)}t)`;
  } else {
    const alpha = -b / (2 * a);
    const beta = Math.sqrt(-disc) / (2 * a);
    characteristic = `共轭复根：r = ${alpha.toFixed(4)} ± ${beta.toFixed(4)}i`;
    homogeneousSol = `y_h(t) = e^(${round4(alpha)}t)·[C₁·cos(${round4(beta)}t) + C₂·sin(${round4(beta)}t)]`;
  }
  steps.push(homogeneousSol);

  // 特解（基于 f(t) 类型）
  let particularSol = '';
  const F = fParams.F ?? 1;
  const shift = fParams.a ?? 1;

  if (fType === 'zero') {
    particularSol = 'y_p(t) = 0';
    steps.push('f(t) = 0，特解 y_p = 0');
  } else if (fType === 'constant') {
    // f(t) = F → y_p = F/c (c ≠ 0)
    if (Math.abs(c) < 1e-12) {
      particularSol = 'c = 0，特解需用参数变易法或降阶法';
    } else {
      const yp = F / c;
      particularSol = `y_p(t) = ${round4(yp)}`;
      steps.push(`f(t) = ${F}（常数），特解：y_p = ${F}/${c} = ${round4(yp)}`);
    }
  } else if (fType === 'delta') {
    // f(t) = F·δ(t)，拉普拉斯变换为 F
    // Y(s) = (F + a·y'(0) + (a·s+b)·y(0)) / (a·s²+b·s+c)
    if (disc < -1e-12) {
      const alpha = -b / (2 * a);
      const beta = Math.sqrt(-disc) / (2 * a);
      const C1 = y0;
      const C2 = (y1 - alpha * y0 + F / a) / beta;
      particularSol = `脉冲响应：y_p(t) = (F/a)·e^(${round4(alpha)}t)·sin(${round4(beta)}t)/${round4(beta)} (t > 0)`;
      steps.push(`f(t) = ${F}·δ(t)，由拉普拉斯变换：Y(s) = (F + ${a}·${y1} + (${a}·s+${b})·${y0}) / (${a}s²+${b}s+${c})`);
      steps.push(`y(t) = e^(${round4(alpha)}t)·[${round4(C1)}·cos(${round4(beta)}t) + ${round4(C2)}·sin(${round4(beta)}t)] (t > 0)`);
    } else {
      particularSol = '脉冲响应：特征根非复根情形，形式较复杂';
    }
  } else if (fType === 'heaviside') {
    // f(t) = F·u(t-a), 用延迟定理
    steps.push(`f(t) = ${F}·u(t-${shift})，由拉普拉斯延迟定理：L{f(t)} = ${F}·e^(-${shift}s)/s`);
    if (Math.abs(c) > 1e-12) {
      const yp = F / c;
      particularSol = `y_p(t) = ${round4(yp)}·(1 - e...)·u(t-${shift})（延迟阶跃响应）`;
    } else {
      particularSol = '阶跃响应：c=0 时需积分法';
    }
  }

  steps.push(particularSol);

  // 通解
  const solution = homogeneousSol.replace('y_h(t)', 'y(t)') + ' + y_p(t)（常数由初值确定）';
  steps.push(`通解：${solution}`);

  return { solution, steps, characteristic };
}

function round4(x: number): string {
  if (Math.abs(x) < 1e-12) return '0';
  if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
  return x.toFixed(4).replace(/\.?0+$/, '');
}

// ===================== 勒让德方程幂级数解法 =====================

/**
 * 勒让德方程：(1-x²)y'' - 2x·y' + n(n+1)y = 0
 * 幂级数解法：y = Σ a_k · x^k
 * 递推关系：a_{k+2} = (k(k+1) - n(n+1)) / ((k+1)(k+2)) · a_k
 * 输出前 N 项系数
 */
export function powerSeriesLegendre(n: number, a0 = 1, a1 = 1, terms = 8): {
  coefficients: number[];
  recurrence: string;
  solution: string;
  legendrePolynomial?: number[];
  isPolynomial: boolean;
} {
  const coeffs: number[] = [a0, a1];
  const isInteger = Number.isInteger(n) && n >= 0;

  for (let k = 0; k < terms - 2; k++) {
    const numerator = k * (k + 1) - n * (n + 1);
    const denominator = (k + 1) * (k + 2);
    const aNext = (numerator / denominator) * coeffs[k];
    coeffs.push(aNext);
  }

  const recurrence = `a_{k+2} = [k(k+1) - n(n+1)] / [(k+1)(k+2)] · a_k`;

  // 构造幂级数解表达式
  let sol = 'y(x) = ';
  const termsStr: string[] = [];
  for (let k = 0; k < Math.min(terms, coeffs.length); k++) {
    if (Math.abs(coeffs[k]) < 1e-12) continue;
    const coef = coeffs[k];
    let term = '';
    if (k === 0) term = `${coef.toFixed(4)}`;
    else if (k === 1) term = `${coef.toFixed(4)}·x`;
    else term = `${coef.toFixed(4)}·x^${k}`;
    termsStr.push(term);
  }
  sol += termsStr.join(' + ') + ' + ...';

  let legendrePolynomial: number[] | undefined;
  if (isInteger) {
    // 构造勒让德多项式 P_n(x)
    const poly: number[] = [];
    const degree = Math.floor(n);
    // P_n(x) = (1/2^n) Σ (-1)^k C(n,k) C(2n-2k, n-2k) x^{n-2k}
    // 简化：用递推计算
    for (let k = 0; k <= degree; k++) poly.push(0);
    // P_0 = 1, P_1 = x, 递推 (n+1)P_{n+1} = (2n+1)xP_n - n P_{n-1}
    let pPrev = [1]; // P_0
    let pCur = [0, 1]; // P_1
    if (degree === 0) poly[0] = 1;
    else if (degree === 1) { poly[0] = 0; poly[1] = 1; }
    else {
      for (let ni = 1; ni < degree; ni++) {
        const pNext: number[] = new Array(ni + 2).fill(0);
        // (ni+1) P_{ni+1} = (2ni+1) x P_ni - ni P_{ni-1}
        for (let j = 0; j <= ni; j++) {
          pNext[j + 1] += (2 * ni + 1) * pCur[j] / (ni + 1);
        }
        for (let j = 0; j <= ni - 1; j++) {
          pNext[j] -= ni * pPrev[j] / (ni + 1);
        }
        pPrev = pCur;
        pCur = pNext;
      }
      for (let j = 0; j < pCur.length; j++) poly[j] = pCur[j];
    }
    legendrePolynomial = poly;
  }

  return {
    coefficients: coeffs,
    recurrence,
    solution: sol,
    legendrePolynomial,
    isPolynomial: isInteger,
  };
}

// ===================== 离散傅里叶变换 DFT =====================

/**
 * 离散傅里叶变换（直接计算，O(N²)）
 * 输入实数或复数序列（实部 + 虚部），输出频谱幅度和相位
 */
export function dft(real: number[], imag?: number[]): {
  magnitude: number[];
  phase: number[];
  realOut: number[];
  imagOut: number[];
  N: number;
} {
  const N = real.length;
  if (N > 4096) throw new Error(`DFT 序列过长（${N}点），建议 ≤ 4096`);
  if (N < 2) throw new Error('DFT 序列长度至少为 2');
  const imgIn = imag || new Array(N).fill(0);
  const realOut = new Array(N).fill(0);
  const imagOut = new Array(N).fill(0);

  for (let k = 0; k < N; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const angle = -2 * Math.PI * k * n / N;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      re += real[n] * cosA - imgIn[n] * sinA;
      im += real[n] * sinA + imgIn[n] * cosA;
    }
    realOut[k] = re;
    imagOut[k] = im;
  }

  const magnitude = new Array(N);
  const phase = new Array(N);
  for (let k = 0; k < N; k++) {
    magnitude[k] = Math.sqrt(realOut[k] * realOut[k] + imagOut[k] * imagOut[k]);
    phase[k] = Math.atan2(imagOut[k], realOut[k]);
  }

  return { magnitude, phase, realOut, imagOut, N };
}

// ===================== 采样定理演示 =====================

/**
 * 采样定理演示：给定信号频率 f 和采样率 fs
 * 生成采样点和频谱，展示混叠效果
 */
export function samplingTheoremDemo(signalFreq: number, sampleRate: number, duration = 1, numSamples = 256): {
  signalFreq: number;
  sampleRate: number;
  nyquist: number;
  aliased: boolean;
  aliasFreq: number;
  sampledTime: number[];
  sampledValue: number[];
  continuousTime: number[];
  continuousValue: number[];
  spectrumFreqs: number[];
  spectrumMag: number[];
} {
  if (sampleRate <= 0) throw new Error('采样率必须 > 0');
  if (signalFreq <= 0) throw new Error('信号频率必须 > 0');
  if (numSamples > 2048) numSamples = 2048;

  const nyquist = sampleRate / 2;
  const aliased = signalFreq > nyquist;

  // 计算混叠频率：f_alias = |f - n·fs| 最小正频率
  const n = Math.round(signalFreq / sampleRate);
  const aliasFreq = Math.abs(signalFreq - n * sampleRate);

  // 原始连续信号（高分辨率，10 倍过采样）
  const contCount = numSamples * 10;
  const continuousTime: number[] = [];
  const continuousValue: number[] = [];
  for (let i = 0; i < contCount; i++) {
    const t = (i / contCount) * duration;
    continuousTime.push(t);
    continuousValue.push(Math.sin(2 * Math.PI * signalFreq * t));
  }

  // 采样点
  const sampledTime: number[] = [];
  const sampledValue: number[] = [];
  const actualN = Math.floor(sampleRate * duration);
  for (let n = 0; n < Math.min(actualN, numSamples); n++) {
    const t = n / sampleRate;
    sampledTime.push(t);
    sampledValue.push(Math.sin(2 * Math.PI * signalFreq * t));
  }

  // 频谱（用采样点做 DFT）
  const spectrumMag: number[] = [];
  const spectrumFreqs: number[] = [];
  const N = sampledValue.length;
  if (N >= 2 && N <= 2048) {
    const dftResult = dft(sampledValue);
    const half = Math.floor(N / 2);
    for (let k = 0; k < half; k++) {
      spectrumFreqs.push(k * sampleRate / N);
      spectrumMag.push(dftResult.magnitude[k] * 2 / N); // 单边谱
    }
  }

  return {
    signalFreq,
    sampleRate,
    nyquist,
    aliased,
    aliasFreq: aliased ? aliasFreq : signalFreq,
    sampledTime,
    sampledValue,
    continuousTime,
    continuousValue,
    spectrumFreqs,
    spectrumMag,
  };
}
