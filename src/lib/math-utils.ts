// EXPORTS: safeEvaluate, formatResult, adaptiveSamplePoints2D, adaptiveSamplePoints3D, createNumberTheory, createNumericalMethods, matrixAdd, matrixSub, matrixScalarMul, matrixPower, rowEchelonForm, reducedRowEchelonForm, maxLinearlyIndependent, qrDecomposition, leastSquares, isOrthogonalTransformation, vectorAngleCos, vectorAngleDeg, basisTransitionMatrix, detMatrix, sampleImplicit, identifyConic, tangentLine, asymptotes, areaBetweenCurves, inverseFunction, sampleParametricAnim, samplePolarRose, sampleQuadraticSurface, sampleImplicitSurfaceMarching, sampleSurfaceOfRevolution, sampleParametricSurface, normalVectors, identifyQuadric, totalDifferential, directionalDerivative, multiVarTaylor2nd, findCriticalPoints, lagrangeMultiplier2D, tripleIntegral, doubleIntegralPolar, lineIntegralFirstType, lineIntegralSecondType, greensFormula, gradientFieldData, divergenceAndCurl, gaussFormulaVerify, stokesFormulaVerify, findFunctionZeros, findExtrema, findInflectionPoints, findYIntercept, computeDerivativeSamples, findIntersections, computeDefiniteIntegral

import { evaluate, parse, derivative, simplify, format, type MathNode } from 'mathjs';
import { formatScientificExact } from './symbolic-format';
import { normalizeMathInput } from './math-normalize';

/**
 * 自适应二维采样点数：根据范围大小决定采样点数
 * 范围 ≤ 100 时用默认 800 点；范围每增大 10 倍点数减一半；最少 80 点
 */
export function adaptiveSamplePoints2D(xMin: number, xMax: number, defaultN = 800, minN = 80): number {
  const span = Math.abs(xMax - xMin);
  if (span <= 0) return minN;
  // 以 100 为基准，每 10 倍范围减少 50% 点数（对数线性插值）
  const ratio = span / 100;
  if (ratio <= 1) return defaultN;
  const reductions = Math.log10(ratio);
  const n = Math.round(defaultN / Math.pow(2, reductions));
  return Math.max(minN, Math.min(defaultN, n));
}

/**
 * 自适应三维曲面采样点数：根据范围大小决定 n×n 网格的 n
 * 范围 ≤ 10 时用默认 60×60；范围每增大 10 倍 n 除以 √10 ≈ 3.16；最少 20×20
 */
export function adaptiveSamplePoints3D(xMin: number, xMax: number, yMin: number, yMax: number, defaultN = 60, minN = 20): number {
  const spanX = Math.abs(xMax - xMin);
  const spanY = Math.abs(yMax - yMin);
  const span = Math.max(spanX, spanY);
  if (span <= 0) return minN;
  const ratio = span / 10;
  if (ratio <= 1) return defaultN;
  // 面积增 100 倍时 n 降为 1/10，保持每单位长度点数相对一致
  const reductions = Math.log10(ratio);
  const n = Math.round(defaultN / Math.pow(10, reductions / 2));
  return Math.max(minN, Math.min(defaultN, n));
}

/**
 * 安全计算表达式
 */
export function safeEvaluate(expr: string, scope?: Record<string, unknown>): string {
  if (!expr.trim()) return '';
  const norm = normalizeMathInput(expr);
  const result = scope ? evaluate(norm, scope) : evaluate(norm);
  return formatResult(result);
}

/**
 * 格式化计算结果
 */
export function formatResult(result: unknown): string {
  if (result === undefined || result === null) return '';
  if (typeof result === 'number') {
    if (Number.isNaN(result)) return 'NaN';
    if (!Number.isFinite(result)) return result > 0 ? '∞' : '-∞';
    // 整数直接显示
    if (Number.isInteger(result)) return result.toString();
    // 尝试符号化表示
    const exact = formatScientificExact(result);
    if (exact && !exact.startsWith('≈ ')) return exact;
    // 无法精确表示时，修复浮点误差后显示
    const rounded = Math.round(result * 1e12) / 1e12;
    return rounded.toString();
  }
  if (typeof result === 'boolean') return result ? 'true' : 'false';
  if (typeof result === 'string') return result;
  // math.js 复杂对象：用 format 输出
  if (typeof result === 'object' && result !== null) {
    try {
      return format(result, { precision: 10 });
    } catch {
      return String(result);
    }
  }
  return String(result);
}

// ============ 数论 ============

/**
 * 素数判断
 */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * 质因数分解
 */
export function factorize(n: number): { prime: number; exp: number }[] {
  if (!Number.isInteger(n) || n < 2) return [];
  const factors: { prime: number; exp: number }[] = [];
  let x = n;
  if (x % 2 === 0) {
    let exp = 0;
    while (x % 2 === 0) { x /= 2; exp++; }
    factors.push({ prime: 2, exp });
  }
  for (let p = 3; p * p <= x; p += 2) {
    if (x % p === 0) {
      let exp = 0;
      while (x % p === 0) { x /= p; exp++; }
      factors.push({ prime: p, exp });
    }
  }
  if (x > 1) factors.push({ prime: x, exp: 1 });
  return factors;
}

/**
 * 欧拉函数
 */
export function eulerPhi(n: number): number {
  if (!Number.isInteger(n) || n < 1) return 0;
  if (n === 1) return 1;
  let result = n;
  let x = n;
  if (x % 2 === 0) {
    result = result / 2 * 1;
    while (x % 2 === 0) x /= 2;
  }
  for (let p = 3; p * p <= x; p += 2) {
    if (x % p === 0) {
      result = result / p * (p - 1);
      while (x % p === 0) x /= p;
    }
  }
  if (x > 1) result = result / x * (x - 1);
  return result;
}

/**
 * 模幂
 */
export function powMod(a: number, b: number, m: number): number {
  if (m <= 0) throw new Error('模数必须为正整数');
  let base = a % m;
  if (base < 0) base += m;
  let result = 1;
  let exp = b;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % m;
    base = (base * base) % m;
    exp = Math.floor(exp / 2);
  }
  return result;
}

// ============ 数值分析 ============

function evalFunctionAt(expr: string, varName: string, value: number): number {
  const node = parse(expr);
  const scope: Record<string, number> = { [varName]: value };
  return node.evaluate(scope) as number;
}

/**
 * 二分法求根
 */
export function bisect(expr: string, a: number, b: number, tol = 1e-10, maxIter = 100): { root: number; iterations: number; fa: number; fb: number } {
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const evalF = (x: number) => node.evaluate({ x }) as number;
  let left = a, right = b;
  let fLeft = evalF(left);
  let fRight = evalF(right);
  if (fLeft * fRight > 0) {
    throw new Error('区间两端函数值同号，无法使用二分法');
  }
  let iter = 0;
  while (iter < maxIter && Math.abs(right - left) > tol) {
    const mid = (left + right) / 2;
    const fMid = evalF(mid);
    if (fMid === 0) return { root: mid, iterations: iter + 1, fa: fLeft, fb: fRight };
    if (fLeft * fMid < 0) {
      right = mid;
      fRight = fMid;
    } else {
      left = mid;
      fLeft = fMid;
    }
    iter++;
  }
  return { root: (left + right) / 2, iterations: iter, fa: fLeft, fb: fRight };
}

/**
 * 牛顿迭代法
 */
export function newtonMethod(expr: string, x0: number, tol = 1e-10, maxIter = 100): { root: number; iterations: number } {
  const norm = normalizeMathInput(expr);
  const fNode = parse(norm);
  const dfNode = derivative(fNode, 'x');
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const fx = fNode.evaluate({ x }) as number;
    const dfx = dfNode.evaluate({ x }) as number;
    if (Math.abs(dfx) < 1e-15) {
      throw new Error('导数接近零，迭代无法继续');
    }
    const xNext = x - fx / dfx;
    if (Math.abs(xNext - x) < tol) {
      return { root: xNext, iterations: i + 1 };
    }
    x = xNext;
  }
  return { root: x, iterations: maxIter };
}

/**
 * 梯形法数值积分
 */
export function trapezoidal(expr: string, a: number, b: number, n: number): number {
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const evalF = (x: number) => node.evaluate({ x }) as number;
  const h = (b - a) / n;
  let sum = 0.5 * (evalF(a) + evalF(b));
  for (let i = 1; i < n; i++) {
    sum += evalF(a + i * h);
  }
  return h * sum;
}

/**
 * 辛普森法数值积分 (n 必须为偶数)
 */
export function simpson(expr: string, a: number, b: number, nIn: number): number {
  const n = nIn % 2 === 0 ? nIn : nIn + 1;
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const evalF = (x: number) => node.evaluate({ x }) as number;
  const h = (b - a) / n;
  let sum = evalF(a) + evalF(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * evalF(x);
  }
  return (h / 3) * sum;
}

/**
 * 线性插值
 */
export function linearInterpolation(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x2 === x1) throw new Error('x1 和 x2 不能相等');
  return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
}

// ============ 概率分布 ============

/**
 * 二项分布 P(X=k)
 */
export function binomPMF(k: number, n: number, p: number): number {
  if (k < 0 || k > n || n < 0 || p < 0 || p > 1) return 0;
  // 计算组合数 C(n,k) * p^k * (1-p)^(n-k)
  let logC = 0;
  for (let i = 1; i <= k; i++) {
    logC += Math.log((n - k + i) / i);
  }
  return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

/**
 * 正态分布概率密度
 */
export function normalPDF(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) throw new Error('标准差必须为正');
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/**
 * 泊松分布 P(X=k)
 */
export function poissonPMF(k: number, lambda: number): number {
  if (k < 0 || !Number.isInteger(k) || lambda <= 0) return 0;
  let logP = -lambda;
  for (let i = 1; i <= k; i++) {
    logP += Math.log(lambda / i);
  }
  return Math.exp(logP);
}

// ============ 统计量 ============

export function calcStatistics(data: number[]): {
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  std: number;
  min: number;
  max: number;
  count: number;
  sum: number;
} {
  if (data.length === 0) {
    throw new Error('数据列表不能为空');
  }
  const n = data.length;
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  const sorted = [...data].sort((a, b) => a - b);
  let median: number;
  if (n % 2 === 0) {
    median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  } else {
    median = sorted[Math.floor(n / 2)];
  }

  // 众数（可能多个）
  const freq = new Map<number, number>();
  let maxFreq = 0;
  for (const v of data) {
    const f = (freq.get(v) ?? 0) + 1;
    freq.set(v, f);
    if (f > maxFreq) maxFreq = f;
  }
  const mode: number[] = [];
  if (maxFreq > 1) {
    for (const [v, f] of freq) {
      if (f === maxFreq) mode.push(v);
    }
  }

  const variance = data.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);

  return {
    mean, median, mode, variance, std,
    min: sorted[0], max: sorted[n - 1], count: n, sum,
  };
}

// ============ 绘图采样 ============

/**
 * 采样函数 y = f(x)
 */
export function sampleFunction(expr: string, xMin: number, xMax: number, n = 500): { x: number[]; y: number[] } {
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const xs: number[] = [];
  const ys: number[] = [];
  const step = (xMax - xMin) / (n - 1);
  let prevY: number | null = null;
  let prevFinite = false;
  for (let i = 0; i < n; i++) {
    const x = xMin + i * step;
    let y = NaN;
    let finite = false;
    try {
      const raw = node.evaluate({ x }) as number;
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        y = raw;
        finite = true;
      }
    } catch {
      y = NaN;
    }
    // 间断点检测：相邻点之间发生大跳变且符号相反 → 中间插 NaN 切断连线
    // 判定阈值用相对比例，避免大范围下正常大值函数（如 x²）被误判为间断
    if (finite && prevFinite && prevY !== null) {
      const yAbs = Math.abs(y);
      const prevYAbs = Math.abs(prevY);
      const maxAbs = Math.max(yAbs, prevYAbs);
      const minAbs = Math.min(yAbs, prevYAbs);
      const signChange = y * prevY < 0;
      // 相对跳变 > 100 倍 且两侧都显著非零 → 认为穿过奇点（渐近线）
      // 或：从接近 0 跳到极大值（>1e6 倍），典型如 1/x 穿过 0 附近
      const hugeRatio = minAbs > 1e-10 && maxAbs / minAbs > 1000;
      const zeroToHuge = minAbs < 1e-6 && maxAbs > 1e6;
      if ((signChange && hugeRatio) || zeroToHuge) {
        xs.push(x - step / 2);
        ys.push(NaN);
      }
    }
    // 上一个点非有限 / 当前点非有限 → 自然断点
    if (!prevFinite && finite) {
      // 刚从非有限回到有限，前面已压 NaN 了（上一轮），不用再加
    }
    xs.push(x);
    ys.push(y);
    prevY = finite ? y : null;
    prevFinite = finite;
  }
  return { x: xs, y: ys };
}

/**
 * 采样参数方程
 */
export function sampleParametric(xExpr: string, yExpr: string, tMin: number, tMax: number, n = 500): { x: number[]; y: number[] } {
  const xNode = parse(xExpr);
  const yNode = parse(yExpr);
  const xs: number[] = [];
  const ys: number[] = [];
  const step = (tMax - tMin) / (n - 1);
  for (let i = 0; i < n; i++) {
    const t = tMin + i * step;
    try {
      const scope: Record<string, number> = { t, theta: t };
      const x = xNode.evaluate(scope) as number;
      const y = yNode.evaluate(scope) as number;
      xs.push(x);
      ys.push(y);
    } catch {
      xs.push(NaN);
      ys.push(NaN);
    }
  }
  return { x: xs, y: ys };
}

/**
 * 采样极坐标 r(θ)
 */
export function samplePolar(rExpr: string, thetaMin: number, thetaMax: number, n = 500): { x: number[]; y: number[] } {
  const rNode = parse(rExpr);
  const xs: number[] = [];
  const ys: number[] = [];
  const step = (thetaMax - thetaMin) / (n - 1);
  for (let i = 0; i < n; i++) {
    const theta = thetaMin + i * step;
    try {
      // 同时支持 t 和 theta 作为变量名
      const scope: Record<string, number> = { theta, t: theta };
      const r = rNode.evaluate(scope) as number;
      xs.push(r * Math.cos(theta));
      ys.push(r * Math.sin(theta));
    } catch {
      xs.push(NaN);
      ys.push(NaN);
    }
  }
  return { x: xs, y: ys };
}

/**
 * 采样二元函数 z = f(x,y)
 */
export function sampleSurface(expr: string, xMin: number, xMax: number, yMin: number, yMax: number, n = 80): { x: number[]; y: number[]; z: number[][] } {
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const xs: number[] = [];
  const ys: number[] = [];
  const zs: number[][] = [];
  const xStep = (xMax - xMin) / (n - 1);
  const yStep = (yMax - yMin) / (n - 1);
  for (let i = 0; i < n; i++) {
    ys.push(yMin + i * yStep);
  }
  for (let j = 0; j < n; j++) {
    xs.push(xMin + j * xStep);
  }
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      try {
        const z = node.evaluate({ x: xs[j], y: ys[i] }) as number;
        row.push(typeof z === 'number' && Number.isFinite(z) ? z : NaN);
      } catch {
        row.push(NaN);
      }
    }
    zs.push(row);
  }
  return { x: xs, y: ys, z: zs };
}

// ============ ODE ============

/**
 * 欧拉法求一阶 ODE
 */
export function odeEuler(fExpr: string, x0: number, y0: number, xEnd: number, n: number): { x: number[]; y: number[] } {
  const node = parse(fExpr);
  const evalF = (x: number, y: number) => node.evaluate({ x, y }) as number;
  const h = (xEnd - x0) / n;
  const xs = [x0];
  const ys = [y0];
  let x = x0, y = y0;
  for (let i = 0; i < n; i++) {
    const dydx = evalF(x, y);
    y = y + h * dydx;
    x = x + h;
    xs.push(x);
    ys.push(y);
  }
  return { x: xs, y: ys };
}

/**
 * RK4 求一阶 ODE
 */
export function odeRK4(fExpr: string, x0: number, y0: number, xEnd: number, n: number): { x: number[]; y: number[] } {
  const node = parse(fExpr);
  const evalF = (x: number, y: number) => node.evaluate({ x, y }) as number;
  const h = (xEnd - x0) / n;
  const xs = [x0];
  const ys = [y0];
  let x = x0, y = y0;
  for (let i = 0; i < n; i++) {
    const k1 = evalF(x, y);
    const k2 = evalF(x + h / 2, y + h * k1 / 2);
    const k3 = evalF(x + h / 2, y + h * k2 / 2);
    const k4 = evalF(x + h, y + h * k3);
    y = y + h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
    x = x + h;
    xs.push(x);
    ys.push(y);
  }
  return { x: xs, y: ys };
}

// ============ 傅里叶级数 ============

export function fourierCoefficients(fExpr: string, T: number, N: number): { a0: number; an: number[]; bn: number[] } {
  const node = parse(fExpr);
  const evalF = (x: number) => node.evaluate({ x }) as number;
  const omega = 2 * Math.PI / T;
  const nSamp = 2000; // 用数值积分计算系数

  const integrate = (g: (x: number) => number): number => {
    // 梯形法，区间 [-T/2, T/2]
    const h = T / nSamp;
    const halfT = T / 2;
    let sum = 0.5 * (g(-halfT) + g(halfT));
    for (let i = 1; i < nSamp; i++) {
      sum += g(-halfT + i * h);
    }
    return h * sum;
  };

  const a0 = (2 / T) * integrate(evalF);
  const an: number[] = [];
  const bn: number[] = [];
  for (let n = 1; n <= N; n++) {
    const coeffA = (2 / T) * integrate((x) => evalF(x) * Math.cos(n * omega * x));
    const coeffB = (2 / T) * integrate((x) => evalF(x) * Math.sin(n * omega * x));
    an.push(coeffA);
    bn.push(coeffB);
  }
  return { a0, an, bn };
}

export function fourierPartialSum(a0: number, an: number[], bn: number[], T: number, x: number, N: number): number {
  const omega = 2 * Math.PI / T;
  let sum = a0 / 2;
  const terms = Math.min(N, an.length);
  for (let n = 1; n <= terms; n++) {
    sum += an[n - 1] * Math.cos(n * omega * x) + bn[n - 1] * Math.sin(n * omega * x);
  }
  return sum;
}

// ============ 导数 / 简化 / 展开 / 分解 ============

export function symDerivative(expr: string, variable: string): string {
  const norm = normalizeMathInput(expr);
  const node = derivative(norm, variable);
  return String(node);
}

export function symSimplify(expr: string): string {
  const norm = normalizeMathInput(expr);
  return String(simplify(norm));
}

/**
 * 数值极限：从两侧趋近取平均
 */
export function numericLimit(expr: string, variable: string, point: number): number {
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const evalAt = (x: number) => {
    try {
      const v = node.evaluate({ [variable]: x }) as number;
      return Number.isFinite(v) ? v : NaN;
    } catch {
      return NaN;
    }
  };

  // 如果点本身有定义且有限，直接返回
  const atPoint = evalAt(point);
  if (Number.isFinite(atPoint)) return atPoint;

  // 从左右两侧逐渐逼近
  let result = NaN;
  let step = 1;
  for (let i = 0; i < 15; i++) {
    const left = evalAt(point - step);
    const right = evalAt(point + step);
    if (Number.isFinite(left) && Number.isFinite(right)) {
      const avg = (left + right) / 2;
      if (Number.isFinite(result) && Math.abs(avg - result) < 1e-10) {
        return avg;
      }
      result = avg;
    } else if (Number.isFinite(left)) {
      result = left;
    } else if (Number.isFinite(right)) {
      result = right;
    }
    step *= 0.1;
  }
  return result;
}

/**
 * 泰勒展开：通过反复求导计算各阶系数，返回多项式字符串
 */
export function taylorSeries(expr: string, variable: string, x0: number, order: number): string {
  const norm = normalizeMathInput(expr);
  const coeffs: number[] = [];
  let current: MathNode = parse(norm);

  const evalAt = (node: MathNode, x: number) => {
    try {
      return node.evaluate({ [variable]: x }) as number;
    } catch {
      return 0;
    }
  };

  // f(x0)
  coeffs.push(evalAt(current, x0));

  // f'(x0), f''(x0), ... / n!
  let factorial = 1;
  for (let n = 1; n <= order; n++) {
    current = derivative(current, variable);
    factorial *= n;
    const derivAtX0 = evalAt(current, x0);
    coeffs.push(derivAtX0 / factorial);
  }

  // 构造多项式: c0 + c1*(x-x0) + c2*(x-x0)^2 + ...
  const x0Str = x0 === 0 ? variable : `(${variable} - ${formatResult(x0)})`;
  const terms: string[] = [];

  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i];
    if (Math.abs(c) < 1e-12) continue;
    const absC = Math.abs(c);
    const sign = c > 0 ? '' : '-';
    const base = sign ? '-' : '';
    let term = '';

    if (i === 0) {
      terms.push(formatResult(c));
      continue;
    }

    if (x0 === 0) {
      // Maclaurin: x^i
      if (Math.abs(absC - 1) < 1e-12) {
        term = i === 1 ? 'x' : `x^${i}`;
      } else {
        term = i === 1 ? `${formatResult(absC)}*x` : `${formatResult(absC)}*x^${i}`;
      }
    } else {
      const pow = i === 1 ? x0Str : `${x0Str}^${i}`;
      if (Math.abs(absC - 1) < 1e-12) {
        term = pow;
      } else {
        term = `${formatResult(absC)}*${pow}`;
      }
    }
    terms.push(base + term);
  }

  if (terms.length === 0) return '0';
  // 用 + 连接，-号已经内嵌在项里
  return terms.reduce((acc, t, i) => {
    if (i === 0) return t;
    if (t.startsWith('-')) return acc + ' - ' + t.slice(1);
    return acc + ' + ' + t;
  }, '');
}

/**
 * 符号不定积分（多项式 + 基本初等函数规则匹配）
 */
export function symIntegrate(expr: string, variable: string): string {
  try {
    const norm = normalizeMathInput(expr);
    const simplified = simplify(norm, {}, { exactFractions: false });
    const exprStr = String(simplified);

    // 尝试多项式积分
    const coeffs = extractPolyCoefficients(exprStr, variable);
    if (coeffs && coeffs.length > 0) {
      const intCoeffs = [0, ...coeffs.map((c, i) => c / (i + 1))];
      const terms: string[] = [];
      for (let i = intCoeffs.length - 1; i >= 1; i--) {
        const c = intCoeffs[i];
        if (Math.abs(c) < 1e-12) continue;
        const absC = Math.abs(c);
        const sign = c < 0 ? '-' : '';
        let term = '';
        if (i === 1) {
          if (Math.abs(absC - 1) < 1e-12) term = variable;
          else term = `${formatResult(absC)}*${variable}`;
        } else {
          if (Math.abs(absC - 1) < 1e-12) term = `${variable}^${i}`;
          else term = `${formatResult(absC)}*${variable}^${i}`;
        }
        terms.push(sign + term);
      }
      if (terms.length === 0) terms.push('0');
      const joined = terms.reduce((acc, t, i) => {
        if (i === 0) return t;
        if (t.startsWith('-')) return acc + ' - ' + t.slice(1);
        return acc + ' + ' + t;
      }, '');
      return joined + ' + C';
    }

    // 基本函数模式匹配
    if (exprStr === 'sin(x)') return '-cos(x) + C';
    if (exprStr === 'cos(x)') return 'sin(x) + C';
    if (exprStr === 'exp(x)' || exprStr === 'e^x') return 'exp(x) + C';
    if (exprStr === '1/x' || exprStr === 'x^-1') return 'ln(abs(x)) + C';
    if (exprStr === 'tan(x)') return '-ln(abs(cos(x))) + C';
    if (exprStr === 'cot(x)') return 'ln(abs(sin(x))) + C';
    if (exprStr === 'sec(x)^2' || exprStr === '(sec(x))^2') return 'tan(x) + C';
    if (exprStr === 'csc(x)^2' || exprStr === '(csc(x))^2') return '-cot(x) + C';

    // sin(kx), cos(kx), exp(kx)
    const sinMatch = exprStr.match(/^sin\(([\d.]+)\*x\)$/);
    if (sinMatch) {
      const a = parseFloat(sinMatch[1]);
      return `-cos(${a}*x)/${formatResult(a)} + C`;
    }
    const cosMatch = exprStr.match(/^cos\(([\d.]+)\*x\)$/);
    if (cosMatch) {
      const a = parseFloat(cosMatch[1]);
      return `sin(${a}*x)/${formatResult(a)} + C`;
    }
    const expMatch = exprStr.match(/^exp\(([\d.]+)\*x\)$/);
    if (expMatch) {
      const a = parseFloat(expMatch[1]);
      return `exp(${a}*x)/${formatResult(a)} + C`;
    }

    // 回退：返回积分形式 + 提示
    return `∫(${exprStr}) d${variable}（提示：非初等函数请使用"定积分"标签计算数值结果）`;
  } catch {
    return `∫(${expr}) d${variable}（表达式解析失败）`;
  }
}

export function symExpand(expr: string): string {
  try {
    const norm = normalizeMathInput(expr);
    // 策略1：如果是单变量多项式，用系数数组法精确展开（推荐）
    const polyResult = tryPolyExpand(norm);
    if (polyResult) return polyResult;

    // 策略2：通用迭代展开
    const result = expandExpression(norm);
    return result;
  } catch {
    return expr;
  }
}

/** 尝试用多项式系数法展开（单变量多项式） */
function tryPolyExpand(expr: string): string | null {
  const node = parse(expr);
  const symbols = new Set<string>();
  node.traverse((n: unknown) => {
    const nd = n as { type?: string; name?: string };
    if (nd.type === 'SymbolNode' && nd.name) {
      if (!['pi', 'e', 'i', 'true', 'false'].includes(nd.name)) {
        symbols.add(nd.name);
      }
    }
  });
  if (symbols.size !== 1) return null;
  const variable = [...symbols][0];
  const coeffs = expandToCoeffs(expr, variable);
  if (!coeffs) return null;
  return polyCoeffsToStr(coeffs, variable);
}

/** 将表达式展开为多项式系数数组（自底向上递归） */
function expandToCoeffs(expr: string, variable: string): number[] | null {
  try {
    const node = parse(expr);
    return nodeToPolyCoeffs(node, variable);
  } catch {
    return null;
  }
}

/** 递归将节点转为系数数组 [c0, c1, c2, ...] 对应 c0 + c1*x + c2*x^2 + ... */
function nodeToPolyCoeffs(node: MathNode, variable: string): number[] | null {
  if (node.type === 'ConstantNode') {
    const val = (node as unknown as { value: number }).value;
    return typeof val === 'number' ? [val] : null;
  }

  if (node.type === 'SymbolNode') {
    const name = (node as unknown as { name: string }).name;
    if (name === variable) return [0, 1]; // x → [0, 1]
    if (name === 'pi') return [Math.PI];
    if (name === 'e') return [Math.E];
    return null; // 其他符号变量，不支持
  }

  if (node.type === 'ParenthesisNode') {
    return nodeToPolyCoeffs((node as unknown as { content: MathNode }).content, variable);
  }

  if (node.type === 'OperatorNode') {
    const opN = node as unknown as { op: string; args: MathNode[] };
    const { op, args } = opN;

    if (op === '+') {
      const result: number[] = [0];
      for (const a of args) {
        const c = nodeToPolyCoeffs(a, variable);
        if (!c) return null;
        polyAddTo(result, c);
      }
      return result;
    }

    if (op === '-' && args.length === 2) {
      const a = nodeToPolyCoeffs(args[0], variable);
      const b = nodeToPolyCoeffs(args[1], variable);
      if (!a || !b) return null;
      polyAddTo(a, b.map(x => -x));
      return a;
    }

    if (op === '-' && args.length === 1) {
      const a = nodeToPolyCoeffs(args[0], variable);
      return a ? a.map(x => -x) : null;
    }

    if (op === '*') {
      let result: number[] | null = null;
      for (const a of args) {
        const c = nodeToPolyCoeffs(a, variable);
        if (!c) return null;
        result = result === null ? c : polyMultiply(result, c);
      }
      return result;
    }

    if (op === '/' && args.length === 2) {
      const a = nodeToPolyCoeffs(args[0], variable);
      const b = nodeToPolyCoeffs(args[1], variable);
      if (!a || !b || b.length !== 1) return null; // 只有常数分母
      return a.map(x => x / b[0]);
    }

    if (op === '^' && args.length === 2) {
      const base = nodeToPolyCoeffs(args[0], variable);
      const expNode = args[1];
      if (!base) return null;
      if (expNode.type === 'ConstantNode') {
        const n = (expNode as unknown as { value: number }).value;
        if (Number.isInteger(n) && n >= 0 && n <= 12) {
          return polyPower(base, n);
        }
      }
      return null;
    }
  }

  return null;
}

/** 多项式加法：a += b */
function polyAddTo(a: number[], b: number[]): void {
  for (let i = 0; i < b.length; i++) {
    if (i < a.length) a[i] += b[i];
    else a.push(b[i]);
  }
}

/** 多项式乘法 */
function polyMultiply(a: number[], b: number[]): number[] {
  const result = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j];
    }
  }
  return result;
}

/** 多项式幂 */
function polyPower(base: number[], n: number): number[] {
  let result = [1];
  for (let i = 0; i < n; i++) {
    result = polyMultiply(result, base);
  }
  return result;
}

/** 多项式系数数组 → 人类可读的表达式字符串（精确分数） */
function polyCoeffsToStr(coeffs: number[], variable: string): string {
  // 去除末尾零系数
  while (coeffs.length > 1 && Math.abs(coeffs[coeffs.length - 1]) < 1e-12) {
    coeffs.pop();
  }
  if (coeffs.length === 0) return '0';

  const terms: string[] = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (Math.abs(c) < 1e-12) continue;
    const isFirst = terms.length === 0;
    const absC = Math.abs(c);
    const sign = c > 0 ? (isFirst ? '' : ' + ') : (isFirst ? '-' : ' - ');

    if (i === 0) {
      terms.push(`${sign}${floatToFraction(absC)}`);
    } else if (i === 1) {
      if (Math.abs(absC - 1) < 1e-12) {
        terms.push(`${sign}${variable}`);
      } else {
        terms.push(`${sign}${floatToFraction(absC)} * ${variable}`);
      }
    } else {
      if (Math.abs(absC - 1) < 1e-12) {
        terms.push(`${sign}${variable}^${i}`);
      } else {
        terms.push(`${sign}${floatToFraction(absC)} * ${variable}^${i}`);
      }
    }
  }
  return terms.length > 0 ? terms.join('') : '0';
}

/** 浮点数转分数（简单连分数近似，分母 ≤ 1000） */
function floatToFraction(n: number): string {
  if (Math.abs(n - Math.round(n)) < 1e-10) return Math.round(n).toString();
  // 连分数近似
  let x = n;
  let a = Math.floor(x);
  let num = a, den = 1;
  let prevNum = 1, prevDen = 0;
  for (let i = 0; i < 20; i++) {
    x = 1 / (x - a);
    if (!Number.isFinite(x)) break;
    a = Math.floor(x);
    const newNum = a * num + prevNum;
    const newDen = a * den + prevDen;
    if (newDen > 1000) break;
    prevNum = num; prevDen = den;
    num = newNum; den = newDen;
    if (Math.abs(num / den - n) < 1e-10) break;
  }
  if (Math.abs(num / den - n) < 1e-6) {
    return `${num}/${den}`;
  }
  return n.toFixed(6).replace(/\.?0+$/, '');
}

/**
 * 展开表达式：迭代展开 (a+b)^n 和 (a+b)(c+d)
 * 每一步展开后用 distribute 手动分配，再用 simplify 合并
 */
function expandExpression(expr: string): string {
  let prev = '';
  let current = expr;
  for (let iter = 0; iter < 15 && prev !== current; iter++) {
    prev = current;
    const expanded = expandOnce(current);
    const distributed = distributeAll(expanded);
    try {
      current = String(simplify(distributed, {}, { exactFractions: true }));
    } catch {
      current = distributed;
    }
  }
  return current;
}

/** 对所有乘法项应用分配律：k*(a+b) → k*a + k*b */
function distributeAll(expr: string): string {
  let prev = '';
  let current = expr;
  for (let iter = 0; iter < 10 && prev !== current; iter++) {
    prev = current;
    current = distributeOnePass(current);
    if (current === prev) break;
  }
  return current;
}

/** 做一轮分配律展开（从最外层到最内层），返回展开后的字符串 */
function distributeOnePass(expr: string): string {
  const node = parse(expr);
  const result = distNode(node);
  return result;
}

/**
 * 递归展开节点中的乘法分配律。
 * 完全基于字符串拼接+parse 返回新表达式字符串，避免手动构造节点的类型问题。
 */
function distNode(node: MathNode): string {
  if (node.type === 'ConstantNode' || node.type === 'SymbolNode') {
    return String(node);
  }

  if (node.type === 'ParenthesisNode') {
    const inner = (node as unknown as { content: MathNode }).content;
    const innerStr = distNode(inner);
    // 如果内层已经展开，检查是否还需要括号
    const innerNode = parse(innerStr);
    if (innerNode.type === 'ConstantNode' || innerNode.type === 'SymbolNode') return innerStr;
    // OperatorNode 是 + 或 - 的话保留括号
    return `(${innerStr})`;
  }

  if (node.type === 'OperatorNode') {
    const opN = node as unknown as { op: string; args: MathNode[] };
    const args = opN.args.map(a => distNode(a));

    if (opN.op === '*' && args.length >= 2) {
      // 找第一个和式因子
      let sumIdx = -1;
      for (let i = 0; i < args.length; i++) {
        const aNode = parse(args[i]);
        if (extractSumTerms(aNode).length >= 2) { sumIdx = i; break; }
      }
      if (sumIdx !== -1) {
        const sumNode = parse(args[sumIdx]);
        const sumTerms = extractSumTerms(sumNode);
        const rest = args.filter((_, i) => i !== sumIdx);
        const restStr = rest.join(' * ');
        const newTerms: string[] = sumTerms.map(st => {
          const stStr = String(st);
          return `${restStr} * ${needsParen(stStr) ? '(' + stStr + ')' : stStr}`;
        });
        return newTerms.join(' + ');
      }
    }

    // 其他运算符：重新拼接
    if (args.length === 1) {
      return `${opN.op}${args[0]}`;
    }
    return args.join(` ${opN.op} `);
  }

  if (node.type === 'FunctionNode') {
    const fNode = node as unknown as { fn: { name: string }; args: MathNode[] };
    const argStrs = fNode.args.map(a => distNode(a));
    return `${fNode.fn.name}(${argStrs.join(', ')})`;
  }

  return String(node);
}

/** 判断字符串表达式是否需要括号（是 + 或 - 顶层运算） */
function needsParen(s: string): boolean {
  // 简单判断：如果顶层有 + 或不在括号里的 - 则需要括号
  // 更准确的方法是 parse 后判断
  try {
    const n = parse(s);
    if (n.type === 'OperatorNode') {
      const op = (n as unknown as { op: string }).op;
      return op === '+' || op === '-';
    }
  } catch { /* ignore */ }
  return false;
}

/** 做一次展开 */
function expandOnce(expr: string): string {
  const node = parse(expr);
  const result = node.transform((n) => {
    if (n.type !== 'OperatorNode') return n;
    const opN = n as unknown as { op: string; args: MathNode[] };
    const args = opN.args;

    // 展开 (sum)^n
    if (opN.op === '^' && args.length === 2 && args[1].type === 'ConstantNode') {
      const base = args[0];
      const exp = (args[1] as unknown as { value: number }).value;
      if (!Number.isInteger(exp) || exp < 2 || exp > 12) return n;
      const terms = extractSumTerms(base);
      if (terms.length >= 2) {
        return parse(expandPower(terms, exp));
      }
    }

    // 展开 (sum_a) * (sum_b)
    if (opN.op === '*' && args.length >= 2) {
      const sumIdx: number[] = [];
      args.forEach((a, i) => {
        if (extractSumTerms(a).length >= 2) sumIdx.push(i);
      });
      // 只要有一个因子是和式，就展开（先展开第一个 pair）
      if (sumIdx.length >= 1 && args.length >= 2) {
        // 找到第一个和式因子和另一个因子相乘展开
        const sumI = sumIdx[0];
        const otherI = sumI === 0 ? 1 : 0;
        const sumTerms = extractSumTerms(args[sumI]);
        const other = args[otherI];
        const otherTerms = extractSumTerms(other);
        if (sumTerms.length >= 2 && otherTerms.length >= 1) {
          // 展开后替换这两个因子
          const newProducts: string[] = [];
          for (const st of sumTerms) {
            for (const ot of otherTerms) {
              newProducts.push(`${factorStr(st)} * ${factorStr(ot)}`);
            }
          }
          const newSum = newProducts.join(' + ');
          // 构建新的乘法参数列表
          const remaining = args.filter((_, i) => i !== sumI && i !== otherI);
          if (remaining.length > 0) {
            const remStr = remaining.map(r => factorStr(r)).join(' * ');
            return parse(`(${newSum}) * ${remStr}`);
          }
          return parse(newSum);
        }
      }
    }
    return n;
  });
  return String(result);
}

/** 提取加法项数组（包括 a-b → a + (-b)） */
function extractSumTerms(node: MathNode): MathNode[] {
  // 去掉括号
  let n: MathNode = node;
  if (n.type === 'ParenthesisNode') {
    n = (n as unknown as { content: MathNode }).content;
  }
  if (n.type === 'OperatorNode') {
    const op = (n as unknown as { op: string }).op;
    const args = (n as unknown as { args: MathNode[] }).args;
    if (op === '+') {
      return args.flatMap(extractSumTerms);
    }
    if (op === '-' && args.length === 2) {
      // a - b → a + (-b)，返回 [a, -b]
      const leftTerms = extractSumTerms(args[0]);
      const negated = parse(`-1 * ${factorStr(args[1])}`);
      return [...leftTerms, negated];
    }
  }
  return [node];
}

/** 节点转为因子字符串（加减加括号） */
function factorStr(node: MathNode): string {
  const s = String(node);
  if (node.type === 'ParenthesisNode') return s;
  if (node.type === 'OperatorNode') {
    const op = (node as unknown as { op: string }).op;
    if (op === '+' || op === '-') return `(${s})`;
  }
  return s;
}

/** 展开 (t1 + t2 + ... + tk)^n → 展开式字符串（不含化简） */
function expandPower(terms: MathNode[], n: number): string {
  const k = terms.length;
  const termStrs = terms.map(t => factorStr(t));

  // dp: 指数元组 → 系数
  let dp = new Map<string, number>();
  dp.set(new Array(k).fill(0).join(','), 1);

  for (let step = 0; step < n; step++) {
    const next = new Map<string, number>();
    for (const [key, val] of dp) {
      const exps = key.split(',').map(Number);
      for (let i = 0; i < k; i++) {
        const newExps = [...exps];
        newExps[i]++;
        const newKey = newExps.join(',');
        next.set(newKey, (next.get(newKey) || 0) + val);
      }
    }
    dp = next;
  }

  const resultTerms: string[] = [];
  for (const [key, val] of dp) {
    const exps = key.split(',').map(Number);
    const factors: string[] = [];
    if (Math.abs(val - 1) > 1e-12) {
      factors.push(val.toString());
    } else if (val === 1 && exps.every(e => e === 0)) {
      factors.push('1');
    }
    for (let i = 0; i < k; i++) {
      if (exps[i] === 0) continue;
      if (exps[i] === 1) factors.push(termStrs[i]);
      else factors.push(`${termStrs[i]}^${exps[i]}`);
    }
    if (factors.length === 0) resultTerms.push('1');
    else resultTerms.push(factors.join(' * '));
  }
  return resultTerms.join(' + ');
}

/**
 * 提取多项式系数（仅限 x 的整次幂多项式）
 */
export function extractPolyCoefficients(expr: string, variable: string): number[] | null {
  try {
    const norm = normalizeMathInput(expr);
    // 处理等式：将 left = right 移项为 left - right
    let exprStr = norm;
    if (norm.includes('=')) {
      const parts = norm.split('=');
      if (parts.length === 2) {
        exprStr = `(${parts[0].trim()}) - (${parts[1].trim()})`;
      }
    }
    // 使用 math.js 化简后，通过代入不同 x 值求解系数
    const node = parse(exprStr);
    const evalAt = (x: number) => node.evaluate({ [variable]: x }) as number;
    
    // 尝试低次多项式（最多 6 次）
    for (let degree = 1; degree <= 6; degree++) {
      // 用 degree+1 个点建立方程组
      const n = degree + 1;
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < n; i++) {
        const x = i - degree / 2;
        const y = evalAt(x);
        if (!Number.isFinite(y)) break;
        points.push({ x, y });
      }
      if (points.length < n) continue;

      // 用范德蒙德矩阵求解系数 a[0] + a[1]*x + ... + a[n-1]*x^(n-1)
      const A: number[][] = [];
      const b: number[] = [];
      for (const p of points) {
        const row: number[] = [];
        for (let j = 0; j < n; j++) {
          row.push(Math.pow(p.x, j));
        }
        A.push(row);
        b.push(p.y);
      }
      // 高斯消元
      const coeffs = gaussSolve(A, b);
      if (!coeffs) continue;

      // 验证：检查这些系数是否在更多点上成立
      let valid = true;
      for (let i = 0; i < 20; i++) {
        const x = -5 + i * 0.5;
        let y = 0;
        for (let j = 0; j < coeffs.length; j++) {
          y += coeffs[j] * Math.pow(x, j);
        }
        const trueY = evalAt(x);
        if (Number.isFinite(trueY) && Math.abs(y - trueY) > 1e-6) {
          valid = false;
          break;
        }
      }
      if (valid) return coeffs; // a0 + a1*x + a2*x^2 + ...
    }
    return null;
  } catch {
    return null;
  }
}

function gaussSolve(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  const aug = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    // 选主元
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) maxRow = k;
    }
    [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
    if (Math.abs(aug[i][i]) < 1e-12) return null;
    
    for (let k = i + 1; k < n; k++) {
      const factor = aug[k][i] / aug[i][i];
      for (let j = i; j <= n; j++) {
        aug[k][j] -= factor * aug[i][j];
      }
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = aug[i][n];
    for (let j = i + 1; j < n; j++) sum -= aug[i][j] * x[j];
    x[i] = sum / aug[i][i];
  }
  return x;
}

export function symFactor(expr: string): string {
  const norm = normalizeMathInput(expr);
  // 尝试用多项式求根来因式分解
  const coeffs = extractPolyCoefficients(norm, 'x');
  if (!coeffs || coeffs.length < 2) {
    return String(parse(expr));
  }
  // polynomialRoot 接受系数从常数项开始: polynomialRoot(a0, a1, a2, ...)
  try {
    const roots = evaluate(`polynomialRoot(${coeffs.join(', ')})`) as number[];
    if (!Array.isArray(roots) || roots.length === 0) {
      return String(parse(expr));
    }
    let result = '';
    const lead = coeffs[coeffs.length - 1]; // 最高次系数
    if (Math.abs(lead - 1) > 1e-9 && Math.abs(lead + 1) > 1e-9) {
      result = formatResult(lead);
    } else if (Math.abs(lead + 1) < 1e-9) {
      result = '-';
    }
    for (const r of roots) {
      if (typeof r === 'number' && Number.isFinite(r)) {
        if (Math.abs(r) < 1e-9) {
          result += 'x';
        } else if (r > 0) {
          result += `(x - ${formatResult(r)})`;
        } else {
          result += `(x + ${formatResult(-r)})`;
        }
      } else {
        result += `(x - ${r})`;
      }
    }
    return result || '1';
  } catch {
    return String(parse(expr));
  }
}

export function symSolve(equation: string, variable: string): string {
  const norm = normalizeMathInput(equation);
  // 先化简表达式，再用多项式求根
  let exprStr = norm;
  if (norm.includes('=')) {
    const parts = norm.split('=');
    if (parts.length !== 2) throw new Error('方程格式不正确');
    exprStr = `(${parts[0].trim()}) - (${parts[1].trim()})`;
  }
  
  // 尝试多项式求根
  const coeffs = extractPolyCoefficients(exprStr, variable);
  if (coeffs && coeffs.length >= 2) {
    try {
      const roots = evaluate(`polynomialRoot(${coeffs.join(', ')})`) as number[];
      if (Array.isArray(roots) && roots.length > 0) {
        return roots.map((r, i) => {
          const val = typeof r === 'number' ? formatResult(r) : String(r);
          return `${variable}${roots.length > 1 ? `_${i + 1}` : ''} = ${val}`;
        }).join(',  ');
      }
    } catch {
      // 数值方法兜底
    }
  }

  // 数值方法兜底：用牛顿法从多个初始点找根
  try {
    const node = parse(exprStr);
    const dfNode = derivative(node, variable);
    const found: number[] = [];
    const evalF = (v: number) => node.evaluate({ [variable]: v }) as number;
    const evalDf = (v: number) => dfNode.evaluate({ [variable]: v }) as number;
    
    for (let guess = -100; guess <= 100; guess += 5) {
      let x = guess;
      for (let i = 0; i < 100; i++) {
        const fx = evalF(x);
        if (!Number.isFinite(fx)) break;
        if (Math.abs(fx) < 1e-9) {
          // 找到根，去重
          if (!found.some(r => Math.abs(r - x) < 1e-6)) {
            found.push(x);
          }
          break;
        }
        const dfx = evalDf(x);
        if (!Number.isFinite(dfx) || Math.abs(dfx) < 1e-15) break;
        x = x - fx / dfx;
      }
    }
    found.sort((a, b) => a - b);
    if (found.length > 0) {
      return found.map((r, i) => 
        `${variable}${found.length > 1 ? `_${i + 1}` : ''} = ${formatResult(r)}`
      ).join(',  ');
    }
    return '未找到实数根（尝试使用图像法观察根的位置）';
  } catch (e) {
    throw new Error('解方程失败：' + (e as Error).message);
  }
}

// ============ 概率统计新增：离散分布期望与方差 ============

export function discreteExpectation(values: number[], probs: number[]): number {
  if (values.length !== probs.length || values.length === 0) throw new Error('X 和 P 长度不一致或为空');
  const sumP = probs.reduce((a, b) => a + b, 0);
  if (Math.abs(sumP - 1) > 1e-6) throw new Error(`概率之和应为 1，当前为 ${formatResult(sumP)}`);
  if (probs.some(p => p < 0)) throw new Error('概率不能为负');
  return values.reduce((acc, v, i) => acc + v * probs[i], 0);
}

export function discreteVariance(values: number[], probs: number[]): number {
  const e = discreteExpectation(values, probs);
  const e2 = values.reduce((acc, v, i) => acc + v * v * probs[i], 0);
  return e2 - e * e;
}

// ============ 连续分布：均匀分布、指数分布 ============

export function uniformPDF(x: number, a: number, b: number): number {
  if (a >= b) throw new Error('均匀分布要求 a < b');
  return (x >= a && x <= b) ? 1 / (b - a) : 0;
}

export function uniformCDF(x: number, a: number, b: number): number {
  if (a >= b) throw new Error('均匀分布要求 a < b');
  if (x < a) return 0;
  if (x > b) return 1;
  return (x - a) / (b - a);
}

export function exponentialPDF(x: number, lambda: number): number {
  if (lambda <= 0) throw new Error('指数分布 λ 必须为正');
  return x >= 0 ? lambda * Math.exp(-lambda * x) : 0;
}

export function exponentialCDF(x: number, lambda: number): number {
  if (lambda <= 0) throw new Error('指数分布 λ 必须为正');
  return x >= 0 ? 1 - Math.exp(-lambda * x) : 0;
}

// ============ 三大抽样分布：卡方、t、F ============

function gammaLn(z: number): number {
  // Lanczos 近似 ln Γ(z)
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - gammaLn(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

export function chiSquarePDF(x: number, n: number): number {
  if (n <= 0) throw new Error('自由度 n 必须为正');
  if (x <= 0) return 0;
  return Math.exp((n / 2 - 1) * Math.log(x / 2) - x / 2 - gammaLn(n / 2)) / 2;
}

export function tDistPDF(x: number, n: number): number {
  if (n <= 0) throw new Error('自由度 n 必须为正');
  const coef = gammaLn((n + 1) / 2) - gammaLn(n / 2) - 0.5 * Math.log(n * Math.PI);
  return Math.exp(coef) * Math.pow(1 + x * x / n, -(n + 1) / 2);
}

export function fDistPDF(x: number, n1: number, n2: number): number {
  if (n1 <= 0 || n2 <= 0) throw new Error('自由度 n1, n2 必须为正');
  if (x <= 0) return 0;
  const lnCoef = (n1 / 2) * Math.log(n1) + (n2 / 2) * Math.log(n2)
    + gammaLn((n1 + n2) / 2) - gammaLn(n1 / 2) - gammaLn(n2 / 2);
  const num = (n1 / 2 - 1) * Math.log(x) - ((n1 + n2) / 2) * Math.log(n2 + n1 * x);
  return Math.exp(lnCoef + num);
}

// ============ 贝叶斯公式 ============

export function bayesTheorem(pA: number, pBgA: number, pBgNotA: number): number {
  if (pA < 0 || pA > 1) throw new Error('P(A) 必须在 0~1 之间');
  if (pBgA < 0 || pBgA > 1) throw new Error('P(B|A) 必须在 0~1 之间');
  if (pBgNotA < 0 || pBgNotA > 1) throw new Error('P(B|¬A) 必须在 0~1 之间');
  const pB = pBgA * pA + pBgNotA * (1 - pA);
  if (pB === 0) throw new Error('P(B) = 0，无法计算后验概率');
  return pBgA * pA / pB;
}

// ============ 协方差与相关系数 ============

export function covariance(xs: number[], ys: number[]): number {
  if (xs.length !== ys.length || xs.length < 2) throw new Error('两组数据长度必须一致且不少于 2 个');
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let sum = 0;
  for (let i = 0; i < xs.length; i++) sum += (xs[i] - mx) * (ys[i] - my);
  return sum / xs.length; // 总体协方差
}

export function pearsonCorrelation(xs: number[], ys: number[]): number {
  const cov = covariance(xs, ys);
  const sx = Math.sqrt(xs.reduce((acc, x) => acc + (x - xs.reduce((a, b) => a + b, 0) / xs.length) ** 2, 0) / xs.length);
  const sy = Math.sqrt(ys.reduce((acc, y) => acc + (y - ys.reduce((a, b) => a + b, 0) / ys.length) ** 2, 0) / ys.length);
  if (sx === 0 || sy === 0) throw new Error('数据无波动，相关系数无定义');
  return cov / (sx * sy);
}

// ============ 线性回归 ============

export function linearRegression(xs: number[], ys: number[]): { k: number; b: number; r2: number; ssRes: number; ssTot: number } {
  if (xs.length !== ys.length || xs.length < 2) throw new Error('数据点至少 2 个且长度一致');
  const n = xs.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i]; sumY += ys[i];
    sumXY += xs[i] * ys[i]; sumX2 += xs[i] * xs[i];
  }
  const meanX = sumX / n, meanY = sumY / n;
  const k = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = meanY - k * meanX;
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const yPred = k * xs[i] + b;
    ssRes += (ys[i] - yPred) ** 2;
    ssTot += (ys[i] - meanY) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { k, b, r2, ssRes, ssTot };
}

// ============ 置信区间 ============

// 标准正态分布 CDF 近似（Abramowitz & Stegun）
export function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * absX);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return 0.5 * (1 + sign * y);
}

// 标准正态分位数近似（Beasley-Springer-Moro）
export function normalQuantile(p: number): number {
  if (p <= 0 || p >= 1) throw new Error('分位概率必须在 (0, 1) 之间');
  const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637];
  const b = [-8.47351093090, 23.08336743743, -21.06224101826, 3.13082909833];
  const c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209,
    0.0276438810333863, 0.0038405729373609, 0.0003951896511919,
    0.0000321767881768, 0.0000002888167364, 0.0000003960315187];
  const y = p - 0.5;
  let r: number;
  if (Math.abs(y) < 0.42) {
    r = y * y;
    r = y * (((a[3] * r + a[2]) * r + a[1]) * r + a[0]) / ((((b[3] * r + b[2]) * r + b[1]) * r + b[0]) * r + 1);
  } else {
    r = y > 0 ? 1 - p : p;
    r = Math.log(-Math.log(r));
    r = c[0] + r * (c[1] + r * (c[2] + r * (c[3] + r * (c[4] + r * (c[5] + r * (c[6] + r * (c[7] + r * c[8])))))));
    if (y < 0) r = -r;
  }
  return r;
}

export function confidenceIntervalMean(mean: number, std: number, n: number, confidence = 0.95): { lower: number; upper: number; margin: number } {
  if (n <= 0) throw new Error('样本量 n 必须为正');
  if (std < 0) throw new Error('标准差不能为负');
  if (confidence <= 0 || confidence >= 1) throw new Error('置信水平必须在 (0,1) 之间');
  const alpha = 1 - confidence;
  const z = normalQuantile(1 - alpha / 2);
  const se = std / Math.sqrt(n);
  const margin = z * se;
  return { lower: mean - margin, upper: mean + margin, margin };
}

// ============ 假设检验：Z 检验、t 检验（近似） ============

export function zTest(sampleMean: number, mu0: number, sigma: number, n: number): { z: number; pValue: number } {
  if (n <= 0) throw new Error('样本量 n 必须为正');
  if (sigma <= 0) throw new Error('总体标准差必须为正');
  const se = sigma / Math.sqrt(n);
  const z = (sampleMean - mu0) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));
  return { z, pValue };
}

// t 分布 CDF 近似（用正态近似 + 小样本修正）
export function tDistCDF(t: number, df: number): number {
  if (df <= 0) throw new Error('自由度必须为正');
  if (df >= 1000) return normalCDF(t);
  // 用正则化不完全 Beta 函数近似
  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;
  const ib = regularizedIncompleteBeta(x, a, b);
  if (t >= 0) return 1 - 0.5 * ib;
  return 0.5 * ib;
}

function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x < 0 || x > 1) return NaN;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const bt = Math.exp(gammaLn(a + b) - gammaLn(a) - gammaLn(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betaCF(x, a, b) / a;
  }
  return 1 - bt * betaCF(1 - x, b, a) / b;
}

function betaCF(x: number, a: number, b: number): number {
  // Lentz 方法的连分数展开
  const maxIter = 200;
  const eps = 1e-10;
  let qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= maxIter; m++) {
    let m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

export function tTestOneSample(sampleMean: number, mu0: number, s: number, n: number): { t: number; df: number; pValue: number } {
  if (n <= 1) throw new Error('单样本 t 检验要求样本量 n ≥ 2');
  if (s < 0) throw new Error('样本标准差不能为负');
  const se = s / Math.sqrt(n);
  const t = (sampleMean - mu0) / se;
  const df = n - 1;
  const pValue = 2 * (1 - tDistCDF(Math.abs(t), df));
  return { t, df, pValue };
}

// ============ 条件概率 ============

export function conditionalProbability(pAB: number, pB: number): number {
  if (pB <= 0 || pB > 1) throw new Error('P(B) 必须在 (0, 1] 之间');
  if (pAB < 0 || pAB > 1) throw new Error('P(AB) 必须在 [0, 1] 之间');
  if (pAB > pB + 1e-12) throw new Error('P(AB) 不能大于 P(B)');
  return pAB / pB;
}

// ============ 数论新增：扩展欧几里得、模逆元、中国剩余定理、威尔逊、费马小、二次剩余 ============

export function extendedGcd(a: number, b: number): { gcd: number; x: number; y: number } {
  a = Math.trunc(a); b = Math.trunc(b);
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('参数必须是有限整数');
  if (b === 0) return { gcd: Math.abs(a), x: a >= 0 ? 1 : -1, y: 0 };
  const result = extendedGcd(b, a % b);
  const x = result.y;
  const y = result.x - Math.floor(a / b) * result.y;
  return { gcd: result.gcd, x, y };
}

export function modInverse(a: number, m: number): number {
  a = Math.trunc(a); m = Math.trunc(m);
  if (m <= 0) throw new Error('模数必须为正整数');
  if (m === 1) return 0;
  const { gcd, x } = extendedGcd(a, m);
  if (gcd !== 1) throw new Error(`${a} 和 ${m} 不互素，模逆元不存在 (gcd=${gcd})`);
  return ((x % m) + m) % m;
}

export function chineseRemainderTheorem(remainders: number[], moduli: number[]): { solution: number; modulus: number } {
  if (remainders.length !== moduli.length || remainders.length === 0) throw new Error('同余式组参数不匹配');
  let x = 0, M = 1;
  for (const m of moduli) {
    if (m <= 0) throw new Error('模数必须为正整数');
    M *= m;
  }
  for (let i = 0; i < remainders.length; i++) {
    const mi = moduli[i];
    const Mi = M / mi;
    const inv = modInverse(Mi, mi);
    x = (x + remainders[i] * Mi * inv) % M;
  }
  return { solution: ((x % M) + M) % M, modulus: M };
}

export function wilsonTheorem(p: number): { holds: boolean; value: number } {
  if (!Number.isInteger(p) || p < 2) throw new Error('p 必须是 ≥ 2 的整数');
  // 直接计算 (p-1)! mod p
  let fact = 1;
  for (let i = 2; i <= p - 1; i++) fact = (fact * i) % p;
  return { holds: fact === p - 1, value: fact };
}

export function fermatLittleTheorem(a: number, p: number): { holds: boolean; value: number } {
  if (!Number.isInteger(a) || !Number.isInteger(p) || p < 2) throw new Error('参数必须是整数且 p ≥ 2');
  const ap1 = powMod(a, p - 1, p);
  const holds = ap1 === 1 % p; // 对任意 a, a^(p-1) ≡ 1 mod p 当 gcd(a,p)=1 时成立
  return { holds, value: ap1 };
}

// 欧拉判别法 + Tonelli-Shanks 求模 p 平方根
export function isQuadraticResidue(a: number, p: number): boolean {
  if (!Number.isInteger(a) || !Number.isInteger(p) || p < 2) throw new Error('参数必须是整数且 p ≥ 2');
  const ap = ((a % p) + p) % p;
  if (ap === 0) return true;
  const legendre = powMod(ap, (p - 1) / 2, p);
  return legendre === 1;
}

export function modularSqrt(a: number, p: number): number[] {
  if (!Number.isInteger(a) || !Number.isInteger(p) || p < 2) throw new Error('参数必须是整数且 p ≥ 2');
  const ap = ((a % p) + p) % p;
  if (ap === 0) return [0];
  if (!isQuadraticResidue(a, p)) throw new Error(`${a} 不是模 ${p} 的二次剩余`);
  if (p === 2) return [1];

  // 简单情形：p ≡ 3 mod 4
  if (p % 4 === 3) {
    const r = powMod(ap, (p + 1) / 4, p);
    return [r, p - r].sort((x, y) => x - y);
  }

  // Tonelli-Shanks 算法
  let Q = p - 1, S = 0;
  while (Q % 2 === 0) { Q /= 2; S++; }
  if (S === 1) {
    const r = powMod(ap, (p + 1) / 4, p);
    return [r, p - r].sort((x, y) => x - y);
  }
  // 找一个二次非剩余 z
  let z = 2;
  while (isQuadraticResidue(z, p)) z++;
  let M = S;
  let c = powMod(z, Q, p);
  let t = powMod(ap, Q, p);
  let R = powMod(ap, (Q + 1) / 2, p);
  while (true) {
    if (t === 1) { const r = Math.min(R, p - R); return [r, p - r].sort((x, y) => x - y); }
    let i = 0, temp = t;
    while (temp !== 1 && i < M) { temp = (temp * temp) % p; i++; }
    if (i === M) return [];
    const b = powMod(c, 1 << (M - i - 1), p);
    M = i;
    c = (b * b) % p;
    t = (t * c) % p;
    R = (R * b) % p;
  }
}

// ============ 莫比乌斯函数、除数函数、约数和 ============

export function mobius(n: number): number {
  if (!Number.isInteger(n) || n < 1) throw new Error('n 必须是正整数');
  if (n === 1) return 1;
  const factors = factorize(n);
  for (const f of factors) if (f.exp > 1) return 0;
  return factors.length % 2 === 0 ? 1 : -1;
}

export function divisorCount(n: number): number {
  if (!Number.isInteger(n) || n < 1) throw new Error('n 必须是正整数');
  if (n === 1) return 1;
  const factors = factorize(n);
  let d = 1;
  for (const f of factors) d *= (f.exp + 1);
  return d;
}

export function divisorSum(n: number): number {
  if (!Number.isInteger(n) || n < 1) throw new Error('n 必须是正整数');
  if (n === 1) return 1;
  const factors = factorize(n);
  let sigma = 1;
  for (const f of factors) {
    let sum = 0, term = 1;
    for (let i = 0; i <= f.exp; i++) { sum += term; term *= f.prime; }
    sigma *= sum;
  }
  return sigma;
}

// ============ 线性同余方程 ax ≡ b mod m ============

export function solveLinearCongruence(a: number, b: number, m: number): { solution: number; modulus: number } {
  a = Math.trunc(a); b = Math.trunc(b); m = Math.trunc(m);
  if (m <= 0) throw new Error('模数必须为正整数');
  const { gcd, x } = extendedGcd(a, m);
  if (b % gcd !== 0) throw new Error(`方程无解：gcd(${a},${m})=${gcd} 不整除 ${b}`);
  const x0 = (x * (b / gcd)) % (m / gcd);
  return { solution: ((x0 % (m / gcd)) + (m / gcd)) % (m / gcd), modulus: m / gcd };
}

// ============ 本原勾股数生成 ============

export function generatePythagoreanTriples(n: number): Array<{ a: number; b: number; c: number }> {
  if (!Number.isInteger(n) || n < 1) throw new Error('n 必须是正整数');
  const triples: Array<{ a: number; b: number; c: number }> = [];
  let m = 2;
  while (triples.length < n) {
    for (let k = 1; triples.length < n && k < m; k++) {
      if (gcdFn(m, k) !== 1) continue;
      if (m % 2 === 1 && k % 2 === 1) continue; // m,k 不能同奇
      const a = m * m - k * k;
      const b = 2 * m * k;
      const c = m * m + k * k;
      triples.push({ a: Math.min(a, b), b: Math.max(a, b), c });
      if (triples.length >= n) break;
    }
    m++;
    if (m > 1000) break; // 安全上限
  }
  return triples.slice(0, n);
}

function gcdFn(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b !== 0) { const t = b; b = a % b; a = t; }
  return a;
}

// ============ 现代数学：图论 Dijkstra + 连通性 ============

export function dijkstra(adjMatrix: number[][], start: number): { dist: number[]; prev: number[] } {
  const n = adjMatrix.length;
  if (n === 0 || start < 0 || start >= n) throw new Error('参数无效');
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const visited = new Array(n).fill(false);
  dist[start] = 0;
  for (let i = 0; i < n; i++) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!visited[v] && (u === -1 || dist[v] < dist[u])) u = v;
    if (u === -1 || dist[u] === Infinity) break;
    visited[u] = true;
    for (let v = 0; v < n; v++) {
      if (visited[v]) continue;
      const w = adjMatrix[u][v];
      if (w <= 0 || !isFinite(w)) continue;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
      }
    }
  }
  return { dist, prev };
}

// ============ 置换群 ============

export function inversePermutation(perm: number[]): number[] {
  const n = perm.length;
  const inv = new Array(n);
  for (let i = 0; i < n; i++) {
    if (perm[i] < 0 || perm[i] >= n || !Number.isInteger(perm[i])) throw new Error('置换元素必须是 0 到 n-1 的整数');
    inv[perm[i]] = i;
  }
  return inv;
}

export function permutationOrder(perm: number[]): number {
  const n = perm.length;
  const visited = new Array(n).fill(false);
  let order = 1;
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    let len = 0, cur = i;
    while (!visited[cur]) { visited[cur] = true; cur = perm[cur]; len++; }
    order = order / gcdFn(order, len) * len; // lcm
  }
  return order;
}

export function cycleDecomposition(perm: number[]): number[][] {
  const n = perm.length;
  const visited = new Array(n).fill(false);
  const cycles: number[][] = [];
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const cycle: number[] = [];
    let cur = i;
    while (!visited[cur]) { visited[cur] = true; cycle.push(cur); cur = perm[cur]; }
    if (cycle.length >= 1) cycles.push(cycle);
  }
  return cycles;
}

// ============ 组合数学：卡特兰数、斯特林数、贝尔数 ============

export function catalanNumber(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error('n 必须是非负整数');
  if (n <= 1) return 1;
  let c = 1;
  for (let i = 0; i < n; i++) {
    c = c * 2 * (2 * i + 1) / (i + 2);
    if (!Number.isFinite(c)) throw new Error('结果过大，超出数值范围');
  }
  return Math.round(c);
}

export function stirlingNumber2(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k)) throw new Error('n, k 必须是整数');
  if (n < 0 || k < 0) throw new Error('n, k 必须非负');
  if (k === 0) return n === 0 ? 1 : 0;
  if (k > n) return 0;
  // 动态规划 S(n,k) = S(n-1,k-1) + k*S(n-1,k)
  const dp: number[] = new Array(k + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    const next: number[] = new Array(k + 1).fill(0);
    for (let j = 1; j <= Math.min(i, k); j++) {
      next[j] = dp[j - 1] + j * dp[j];
      if (!Number.isFinite(next[j])) throw new Error('结果过大，超出数值范围');
    }
    for (let j = 0; j <= k; j++) dp[j] = next[j];
    dp[0] = 0;
  }
  return dp[k];
}

export function bellNumber(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error('n 必须是非负整数');
  if (n <= 1) return 1;
  // 贝尔数 B_n = Σ_{k=0}^n S(n,k)
  let sum = 0;
  for (let k = 0; k <= n; k++) sum += stirlingNumber2(n, k);
  return sum;
}

// ============ 线性代数新增算法 ============

// 解析 mathjs 矩阵为二维数组
export function parseMatrix(expr: string): number[][] {
  const raw = evaluate(expr);
  const data: number[][] = [];
  const size = raw.size();
  const rows = size[0], cols = size.length > 1 ? size[1] : 1;
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(raw.get([i, j]));
    }
    data.push(row);
  }
  return data;
}

// 矩阵转字符串显示
export function matrixToString(mat: number[][]): string {
  if (mat.length === 0) return '[]';
  const cols = mat[0].length;
  // 计算每列最大宽度
  const widths: number[] = new Array(cols).fill(0);
  const strMat = mat.map(row => row.map(v => {
    const s = formatResult(v);
    return s;
  }));
  for (let i = 0; i < mat.length; i++) {
    for (let j = 0; j < cols; j++) {
      widths[j] = Math.max(widths[j], strMat[i][j].length);
    }
  }
  return strMat.map(row => '[' + row.map((v, j) => v.padStart(widths[j])).join(', ') + ']').join('\n');
}

// 高斯消元解 Ax = b，A 是二维数组，b 是一维向量
export function gaussElimination(A: number[][], b: number[]): { solution: number[] | null; rank: number; rankAug: number; type: 'unique' | 'none' | 'infinite' } {
  const n = A.length;
  const m = A[0]?.length ?? 0;
  if (b.length !== n) throw new Error('A 的行数与 b 长度不一致');
  if (n === 0 || m === 0) throw new Error('矩阵不能为空');

  // 构造增广矩阵
  const aug: number[][] = A.map((row, i) => [...row, b[i]]);
  let row = 0;
  for (let col = 0; col < m && row < n; col++) {
    // 选主元
    let pivot = row;
    for (let i = row + 1; i < n; i++) {
      if (Math.abs(aug[i][col]) > Math.abs(aug[pivot][col])) pivot = i;
    }
    if (Math.abs(aug[pivot][col]) < 1e-10) continue;
    // 交换行
    [aug[row], aug[pivot]] = [aug[pivot], aug[row]];
    // 消元
    const div = aug[row][col];
    for (let j = col; j <= m; j++) aug[row][j] /= div;
    for (let i = 0; i < n; i++) {
      if (i === row || Math.abs(aug[i][col]) < 1e-10) continue;
      const factor = aug[i][col];
      for (let j = col; j <= m; j++) aug[i][j] -= factor * aug[row][j];
    }
    row++;
  }

  // 计算秩
  let rankA = 0, rankAug = 0;
  for (let i = 0; i < n; i++) {
    let hasA = false, hasAug = false;
    for (let j = 0; j < m; j++) if (Math.abs(aug[i][j]) > 1e-10) hasA = true;
    if (Math.abs(aug[i][m]) > 1e-10) hasAug = true;
    if (hasA) rankA++;
    if (hasA || hasAug) rankAug++;
  }

  if (rankA < rankAug) {
    return { solution: null, rank: rankA, rankAug: rankAug, type: 'none' };
  } else if (rankA < m) {
    return { solution: null, rank: rankA, rankAug: rankAug, type: 'infinite' };
  } else {
    const x = new Array(m).fill(0);
    for (let i = 0; i < m; i++) {
      x[i] = aug[i][m];
    }
    return { solution: x, rank: rankA, rankAug: rankAug, type: 'unique' };
  }
}

// 向量内积
export function vectorDot(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('向量长度不一致');
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// 三维向量叉积
export function vectorCross(a: number[], b: number[]): number[] {
  if (a.length !== 3 || b.length !== 3) throw new Error('叉积仅支持 3 维向量');
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

// 向量范数（默认 2 范数）
export function vectorNorm(v: number[], p = 2): number {
  if (p === Infinity) return Math.max(...v.map(x => Math.abs(x)));
  if (p === 1) return v.reduce((s, x) => s + Math.abs(x), 0);
  return Math.pow(v.reduce((s, x) => s + Math.pow(Math.abs(x), p), 0), 1 / p);
}

// 施密特正交化
export function gramSchmidt(vectors: number[][]): number[][] {
  if (vectors.length === 0) return [];
  const n = vectors[0].length;
  const result: number[][] = [];
  for (let i = 0; i < vectors.length; i++) {
    let v = [...vectors[i]];
    for (let j = 0; j < result.length; j++) {
      const dot1 = vectorDot(vectors[i], result[j]);
      const dot2 = vectorDot(result[j], result[j]);
      if (Math.abs(dot2) < 1e-12) throw new Error('向量组线性相关，无法正交化');
      const coef = dot1 / dot2;
      for (let k = 0; k < n; k++) v[k] -= coef * result[j][k];
    }
    const norm = vectorNorm(v);
    if (norm < 1e-12) throw new Error('向量组线性相关，无法正交化');
    // 单位化
    const unit = v.map(x => x / norm);
    result.push(unit);
  }
  return result;
}

// 判断是否正交矩阵 A^T · A = I
export function isOrthogonalMatrix(A: number[][]): boolean {
  const n = A.length;
  if (n === 0 || A[0].length !== n) throw new Error('必须是方阵');
  // A^T * A
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let dot = 0;
      for (let k = 0; k < n; k++) dot += A[k][i] * A[k][j];
      const expected = i === j ? 1 : 0;
      if (Math.abs(dot - expected) > 1e-6) return false;
    }
  }
  return true;
}

// 顺序主子式判定正定性
export function positiveDefiniteTest(A: number[][]): { definite: 'positive' | 'negative' | 'indefinite' | 'semidefinite'; leadingMinors: number[] } {
  const n = A.length;
  if (n === 0 || A[0].length !== n) throw new Error('必须是方阵');
  // 先判断对称性
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (Math.abs(A[i][j] - A[j][i]) > 1e-8) throw new Error('矩阵不对称，无法判定正定性');
  }
  const leadingMinors: number[] = [];
  for (let k = 1; k <= n; k++) {
    const sub: number[][] = [];
    for (let i = 0; i < k; i++) {
      const row: number[] = [];
      for (let j = 0; j < k; j++) row.push(A[i][j]);
      sub.push(row);
    }
    leadingMinors.push(detMatrix(sub));
  }
  // 全部 > 0 → 正定；奇数阶 < 0, 偶数阶 > 0 → 负定；否则不定
  let allPos = true, allNeg = true;
  for (let i = 0; i < n; i++) {
    if (leadingMinors[i] <= 1e-10) allPos = false;
    const sign = i % 2 === 0 ? -1 : 1; // 1阶负, 2阶正, 3阶负...
    if (sign * leadingMinors[i] <= 1e-10) allNeg = false;
  }
  if (allPos) return { definite: 'positive', leadingMinors };
  if (allNeg) return { definite: 'negative', leadingMinors };
  return { definite: 'indefinite', leadingMinors };
}

export function detMatrix(A: number[][]): number {
  const n = A.length;
  const mat = A.map(r => [...r]);
  let det = 1;
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(mat[k][i]) > Math.abs(mat[pivot][i])) pivot = k;
    if (Math.abs(mat[pivot][i]) < 1e-12) return 0;
    if (pivot !== i) { [mat[i], mat[pivot]] = [mat[pivot], mat[i]]; det = -det; }
    det *= mat[i][i];
    for (let k = i + 1; k < n; k++) {
      const f = mat[k][i] / mat[i][i];
      for (let j = i; j < n; j++) mat[k][j] -= f * mat[i][j];
    }
  }
  return det;
}

// 二次型标准形（用特征值对角化）
export function quadraticFormCanonical(A: number[][]): { eigenvalues: number[]; definite: string; canonical: string } {
  const n = A.length;
  if (n === 0 || A[0].length !== n) throw new Error('必须是方阵');
  const evals = eigenvaluesApprox(A);
  evals.sort((a, b) => b - a);
  let pos = 0, neg = 0, zero = 0;
  for (const e of evals) {
    if (e > 1e-8) pos++;
    else if (e < -1e-8) neg++;
    else zero++;
  }
  let definite = '不定';
  if (neg === 0 && zero === 0) definite = '正定';
  else if (pos === 0 && zero === 0) definite = '负定';
  else if (neg === 0 && zero > 0) definite = '半正定';
  else if (pos === 0 && zero > 0) definite = '半负定';
  const terms = evals.map((e, i) => `${formatResult(e)}·y${i + 1}²`).join(' + ');
  return { eigenvalues: evals, definite, canonical: terms };
}

// Jacobi 法近似特征值（对称矩阵）
function eigenvaluesApprox(A: number[][]): number[] {
  const n = A.length;
  const M = A.map(r => [...r]);
  const maxIter = 100 * n * n;
  for (let iter = 0; iter < maxIter; iter++) {
    // 找非对角最大元
    let p = 0, q = 1, maxVal = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (Math.abs(M[i][j]) > maxVal) { maxVal = Math.abs(M[i][j]); p = i; q = j; }
    }
    if (maxVal < 1e-10) break;
    const theta = (M[q][q] - M[p][p]) / (2 * M[p][q]);
    const t = Math.abs(theta) < 1e-10 ? 1 : Math.sign(theta) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
    const c = 1 / Math.sqrt(1 + t * t);
    const s = t * c;
    const mpp = M[p][p], mqq = M[q][q], mpq = M[p][q];
    M[p][p] = mpp - t * mpq;
    M[q][q] = mqq + t * mpq;
    M[p][q] = M[q][p] = 0;
    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const mip = M[i][p], miq = M[i][q];
        M[i][p] = M[p][i] = c * mip - s * miq;
        M[i][q] = M[q][i] = s * mip + c * miq;
      }
    }
  }
  return M.map((row, i) => row[i]);
}

// LU 分解（Doolittle 形式）
export function luDecomposition(A: number[][]): { L: number[][]; U: number[][] } {
  const n = A.length;
  if (n === 0 || A[0].length !== n) throw new Error('必须是方阵');
  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const U: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) L[i][i] = 1;
  for (let k = 0; k < n; k++) {
    U[k][k] = A[k][k];
    for (let j = k; j < n; j++) {
      let s = 0;
      for (let r = 0; r < k; r++) s += L[k][r] * U[r][j];
      U[k][j] = A[k][j] - s;
    }
    if (Math.abs(U[k][k]) < 1e-12) throw new Error('矩阵奇异，无法进行 LU 分解');
    for (let i = k + 1; i < n; i++) {
      let s = 0;
      for (let r = 0; r < k; r++) s += L[i][r] * U[r][k];
      L[i][k] = (A[i][k] - s) / U[k][k];
    }
  }
  return { L, U };
}

// 伴随矩阵 adj(A) = C^T，A·adj(A) = |A|·I
export function adjugateMatrix(A: number[][]): number[][] {
  const n = A.length;
  if (n === 0 || A[0].length !== n) throw new Error('必须是方阵');
  if (n === 1) return [[1]];
  const adj: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // 代数余子式 A[j,i] = (-1)^(i+j) * M_{i,j}（伴随矩阵是转置）
      const minor: number[][] = [];
      for (let r = 0; r < n; r++) {
        if (r === i) continue;
        const row: number[] = [];
        for (let c = 0; c < n; c++) {
          if (c === j) continue;
          row.push(A[r][c]);
        }
        minor.push(row);
      }
      const d = detMatrix(minor);
      adj[j][i] = ((i + j) % 2 === 0 ? 1 : -1) * d;
    }
  }
  return adj;
}

// 向量组线性相关性判定（求秩）
export function vectorDependence(vectors: number[][]): { rank: number; dependent: boolean; count: number } {
  if (vectors.length === 0) throw new Error('向量组不能为空');
  const dim = vectors[0].length;
  // 把向量作为行做行变换求秩
  const mat = vectors.map(v => [...v]);
  const rows = mat.length, cols = dim;
  let rank = 0;
  for (let col = 0; col < cols && rank < rows; col++) {
    let pivot = -1;
    for (let i = rank; i < rows; i++) {
      if (Math.abs(mat[i][col]) > 1e-10) { pivot = i; break; }
    }
    if (pivot === -1) continue;
    [mat[rank], mat[pivot]] = [mat[pivot], mat[rank]];
    const div = mat[rank][col];
    for (let j = col; j < cols; j++) mat[rank][j] /= div;
    for (let i = 0; i < rows; i++) {
      if (i === rank || Math.abs(mat[i][col]) < 1e-10) continue;
      const factor = mat[i][col];
      for (let j = col; j < cols; j++) mat[i][j] -= factor * mat[rank][j];
    }
    rank++;
  }
  return { rank, dependent: rank < vectors.length, count: vectors.length };
}

// 相似对角化判定 + 对角矩阵（用近似特征值）
export function diagonalizableTest(A: number[][]): { diagonalizable: boolean; diag: number[]; eigenValues: number[]; algebraicMult: Record<string, number>; geometricMult: Record<string, number> } {
  const n = A.length;
  if (n === 0 || A[0].length !== n) throw new Error('必须是方阵');
  const evals = eigenvaluesApprox(A).sort((a, b) => a - b);
  // 归并相近特征值（容差）
  const groups: number[][] = [];
  for (const e of evals) {
    let placed = false;
    for (const g of groups) {
      if (Math.abs(g[0] - e) < 1e-4) { g.push(e); placed = true; break; }
    }
    if (!placed) groups.push([e]);
  }
  // 简化：对对称矩阵一定可对角化
  let symmetric = true;
  for (let i = 0; i < n && symmetric; i++) for (let j = 0; j < n && symmetric; j++) {
    if (Math.abs(A[i][j] - A[j][i]) > 1e-8) symmetric = false;
  }
  const diag = evals.map(e => Math.round(e * 1e8) / 1e8);
  return {
    diagonalizable: symmetric || groups.length === n,
    diag,
    eigenValues: diag,
    algebraicMult: Object.fromEntries(groups.map((g, i) => [`λ${i + 1} ≈ ${formatResult(g[0])}`, g.length])),
    geometricMult: Object.fromEntries(groups.map((g, i) => [`λ${i + 1} ≈ ${formatResult(g[0])}`, g.length])), // 对称阵几何重数=代数重数
  };
}

// 概率统计补充：几何分布、古典概型、切比雪夫、大数定律模拟
export function geometricPMF(k: number, p: number): number {
  if (k < 1 || !Number.isInteger(k)) throw new Error('k 必须是正整数（首次成功次数）');
  if (p <= 0 || p > 1) throw new Error('概率 p 必须在 (0, 1] 之间');
  return Math.pow(1 - p, k - 1) * p;
}

export function classicalProbability(n: number, k: number): number {
  if (n <= 0 || k < 0) throw new Error('参数无效：n>0, k≥0');
  if (k > n) return 0;
  return k / n;
}

export function chebyshevBound(mu: number, sigma: number, k: number): number {
  if (k <= 0) throw new Error('k 必须为正');
  if (sigma < 0) throw new Error('标准差 σ 不能为负');
  return 1 / (k * k);
}

// 大数定律模拟：抛硬币 n 次，返回频率序列
export function coinFlipSimulation(n: number): { sequence: number[]; frequencies: number[]; finalFrequency: number } {
  if (!Number.isInteger(n) || n <= 0) throw new Error('试验次数必须是正整数');
  if (n > 100000) n = 100000; // 安全上限
  let heads = 0;
  const sequence: number[] = [];
  const frequencies: number[] = [];
  const sampleStep = Math.max(1, Math.floor(n / 200)); // 采样 200 个点展示
  for (let i = 0; i < n; i++) {
    const r = Math.random() < 0.5 ? 1 : 0;
    heads += r;
    sequence.push(r);
    if ((i + 1) % sampleStep === 0 || i === n - 1) {
      frequencies.push(heads / (i + 1));
    }
  }
  return { sequence, frequencies, finalFrequency: heads / n };
}

// 数论补充：连分数展开、二元一次不定方程、素数表、位数/数位和
export function continuedFraction(num: number, den: number): number[] {
  if (!Number.isInteger(num) || !Number.isInteger(den) || den === 0) throw new Error('参数必须是整数，分母非零');
  let a = num, b = den;
  if (b < 0) { a = -a; b = -b; }
  const result: number[] = [];
  const maxIter = 1000;
  for (let i = 0; i < maxIter; i++) {
    const q = Math.floor(a / b);
    result.push(q);
    const r = a % b;
    if (r === 0) break;
    a = b; b = r;
  }
  return result;
}

export function solveDiophantine(a: number, b: number, c: number): { x: number; y: number; gcd: number } | null {
  a = Math.trunc(a); b = Math.trunc(b); c = Math.trunc(c);
  const { gcd, x, y } = extendedGcd(a, b);
  if (c % gcd !== 0) return null;
  const k = c / gcd;
  return { x: x * k, y: y * k, gcd };
}

export function sievePrimes(a: number, b: number): number[] {
  if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error('边界必须是整数');
  if (b < 2 || a > b) return [];
  const lo = Math.max(2, a);
  const hi = b;
  const n = hi + 1;
  if (n > 10_000_000) throw new Error('范围过大，请缩小到 1000 万以内');
  const isP = new Uint8Array(n);
  for (let i = 2; i < n; i++) isP[i] = 1;
  for (let i = 2; i * i < n; i++) {
    if (isP[i]) {
      for (let j = i * i; j < n; j += i) isP[j] = 0;
    }
  }
  const primes: number[] = [];
  for (let i = lo; i <= hi; i++) if (isP[i]) primes.push(i);
  return primes;
}

export function digitCount(n: number): number {
  if (!Number.isInteger(n)) throw new Error('n 必须是整数');
  if (n === 0) return 1;
  return Math.floor(Math.log10(Math.abs(n))) + 1;
}

export function digitSum(n: number): number {
  if (!Number.isInteger(n)) throw new Error('n 必须是整数');
  let s = 0, a = Math.abs(n);
  while (a > 0) { s += a % 10; a = Math.floor(a / 10); }
  return s;
}

// ========== 线性代数新增算法 ==========

// 矩阵加法 A + B
export function matrixAdd(A: number[][], B: number[][]): number[][] {
  if (A.length !== B.length || A[0].length !== B[0].length) throw new Error('矩阵维度不一致，无法相加');
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

// 矩阵减法 A - B
export function matrixSub(A: number[][], B: number[][]): number[][] {
  if (A.length !== B.length || A[0].length !== B[0].length) throw new Error('矩阵维度不一致，无法相减');
  return A.map((row, i) => row.map((v, j) => v - B[i][j]));
}

// 矩阵数乘 k·A
export function matrixScalarMul(k: number, A: number[][]): number[][] {
  return A.map(row => row.map(v => k * v));
}

// 矩阵幂 A^n（n 为非负整数）
export function matrixPower(A: number[][], n: number): number[][] {
  const rows = A.length, cols = A[0].length;
  if (rows !== cols) throw new Error('只有方阵才能求幂');
  if (!Number.isInteger(n) || n < 0) throw new Error('幂次必须是非负整数');
  // 单位矩阵
  let result: number[][] = Array.from({ length: rows }, () => Array(rows).fill(0));
  for (let i = 0; i < rows; i++) result[i][i] = 1;
  let base = A.map(r => [...r]);
  let exp = n;
  while (exp > 0) {
    if (exp % 2 === 1) result = matMul(result, base);
    base = matMul(base, base);
    exp = Math.floor(exp / 2);
  }
  return result;
}

function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length, n = A[0].length, p = B[0].length;
  if (n !== B.length) throw new Error('矩阵维度不匹配');
  const C: number[][] = Array.from({ length: m }, () => Array(p).fill(0));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < p; j++)
      for (let k = 0; k < n; k++)
        C[i][j] += A[i][k] * B[k][j];
  return C;
}

// 行阶梯形（row echelon form），返回变换后的矩阵
export function rowEchelonForm(A: number[][]): { matrix: number[][]; rank: number } {
  const mat = A.map(r => [...r]);
  const rows = mat.length, cols = mat[0].length;
  let rank = 0;
  for (let col = 0; col < cols && rank < rows; col++) {
    let pivot = -1;
    for (let i = rank; i < rows; i++) {
      if (Math.abs(mat[i][col]) > 1e-10) { pivot = i; break; }
    }
    if (pivot === -1) continue;
    [mat[rank], mat[pivot]] = [mat[pivot], mat[rank]];
    const div = mat[rank][col];
    for (let j = col; j < cols; j++) mat[rank][j] /= div;
    for (let i = rank + 1; i < rows; i++) {
      if (Math.abs(mat[i][col]) < 1e-12) continue;
      const factor = mat[i][col];
      for (let j = col; j < cols; j++) mat[i][j] -= factor * mat[rank][j];
    }
    rank++;
  }
  // 清洗极小值
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      if (Math.abs(mat[i][j]) < 1e-10) mat[i][j] = 0;
  return { matrix: mat, rank };
}

// 行最简形（reduced row echelon form）
export function reducedRowEchelonForm(A: number[][]): { matrix: number[][]; rank: number } {
  const mat = A.map(r => [...r]);
  const rows = mat.length, cols = mat[0].length;
  let rank = 0;
  for (let col = 0; col < cols && rank < rows; col++) {
    let pivot = -1;
    for (let i = rank; i < rows; i++) {
      if (Math.abs(mat[i][col]) > 1e-10) { pivot = i; break; }
    }
    if (pivot === -1) continue;
    [mat[rank], mat[pivot]] = [mat[pivot], mat[rank]];
    const div = mat[rank][col];
    for (let j = col; j < cols; j++) mat[rank][j] /= div;
    for (let i = 0; i < rows; i++) {
      if (i === rank || Math.abs(mat[i][col]) < 1e-12) continue;
      const factor = mat[i][col];
      for (let j = col; j < cols; j++) mat[i][j] -= factor * mat[rank][j];
    }
    rank++;
  }
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      if (Math.abs(mat[i][j]) < 1e-10) mat[i][j] = 0;
  return { matrix: mat, rank };
}

// 极大线性无关组：输入向量组（每行一个向量），返回极大无关组的索引数组和秩
export function maxLinearlyIndependent(vectors: number[][]): { indices: number[]; rank: number } {
  if (vectors.length === 0) return { indices: [], rank: 0 };
  const dim = vectors[0].length;
  // 把向量作为列向量拼矩阵
  const rows = dim, cols = vectors.length;
  const mat: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let j = 0; j < cols; j++)
    for (let i = 0; i < rows; i++)
      mat[i][j] = vectors[j][i];
  // 行最简形
  const { matrix: rref, rank } = reducedRowEchelonForm(mat);
  // 找主元列
  const indices: number[] = [];
  let row = 0;
  for (let col = 0; col < cols && row < rows; col++) {
    if (Math.abs(rref[row][col] - 1) < 1e-8 && col >= row) {
      // 检查是不是主元（该列其他行都是 0）
      let isPivot = true;
      for (let i = 0; i < rows; i++) {
        if (i !== row && Math.abs(rref[i][col]) > 1e-8) { isPivot = false; break; }
      }
      if (isPivot) { indices.push(col); row++; }
    }
  }
  return { indices, rank };
}

// QR 分解（Gram-Schmidt 法）：A = Q·R，Q 正交矩阵，R 上三角
export function qrDecomposition(A: number[][]): { Q: number[][]; R: number[][] } {
  const m = A.length, n = A[0].length;
  if (m < n) throw new Error('QR 分解要求行数 ≥ 列数');
  const Q: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
  const R: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    // 取第 j 列
    const v: number[] = new Array(m).fill(0);
    for (let i = 0; i < m; i++) v[i] = A[i][j];
    // 减去前面 Q 列的投影
    for (let k = 0; k < j; k++) {
      let rjk = 0;
      for (let i = 0; i < m; i++) rjk += Q[i][k] * v[i];
      R[k][j] = rjk;
      for (let i = 0; i < m; i++) v[i] -= rjk * Q[i][k];
    }
    // 范数
    let norm = 0;
    for (let i = 0; i < m; i++) norm += v[i] * v[i];
    norm = Math.sqrt(norm);
    if (norm < 1e-12) throw new Error('矩阵列线性相关，无法进行 QR 分解');
    R[j][j] = norm;
    for (let i = 0; i < m; i++) Q[i][j] = v[i] / norm;
  }
  return { Q, R };
}

// 最小二乘法：求 Ax = b 的最小二乘解 x = (A^T A)^(-1) A^T b
export function leastSquares(A: number[][], b: number[]): number[] {
  const m = A.length, n = A[0].length;
  if (b.length !== m) throw new Error('A 的行数与 b 长度不一致');
  // A^T A
  const AtA: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < m; k++)
        AtA[i][j] += A[k][i] * A[k][j];
  // A^T b
  const Atb: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let k = 0; k < m; k++)
      Atb[i] += A[k][i] * b[k];
  // 解 AtA · x = Atb
  const sol = gaussSolve(AtA, Atb);
  if (!sol) throw new Error('A^T A 奇异，最小二乘解不唯一');
  return sol;
}

// 正交变换判定：方阵 A 是否为正交矩阵（A^T · A = I 且 A · A^T = I）
export function isOrthogonalTransformation(A: number[][]): boolean {
  const n = A.length;
  if (A[0].length !== n) throw new Error('必须是方阵');
  // 检查 A^T · A = I
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let dot = 0;
      for (let k = 0; k < n; k++) dot += A[k][i] * A[k][j];
      const expected = i === j ? 1 : 0;
      if (Math.abs(dot - expected) > 1e-8) return false;
    }
  }
  return true;
}

// 向量夹角余弦和角度（弧度/度）
export function vectorAngleCos(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('向量长度不一致');
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  na = Math.sqrt(na); nb = Math.sqrt(nb);
  if (na < 1e-12 || nb < 1e-12) throw new Error('零向量无法计算夹角');
  const cos = dot / (na * nb);
  // 数值容错
  return Math.max(-1, Math.min(1, cos));
}

export function vectorAngleDeg(a: number[], b: number[]): number {
  return (Math.acos(vectorAngleCos(a, b)) * 180) / Math.PI;
}

// 基变换（过渡矩阵）：从基 A 到基 B 的过渡矩阵 P 满足 B = A · P
// 输入两组基（每个基向量一行），输出过渡矩阵 P
export function basisTransitionMatrix(basisA: number[][], basisB: number[][]): number[][] {
  const n = basisA.length;
  if (basisB.length !== n || basisA[0].length !== n || basisB[0].length !== n)
    throw new Error('两组基必须是同维方阵（行数=列数=维数）');
  // 基按列存放：A 矩阵第 j 列 = basisA[j] 向量
  // 解 A · P = B  →  P = A^(-1) · B
  // 构造增广矩阵 [A | B] 做行变换
  const aug: number[][] = Array.from({ length: n }, (_, i) => {
    const row = new Array(2 * n).fill(0);
    for (let j = 0; j < n; j++) row[j] = basisA[j][i]; // A 列是 basisA 向量
    for (let j = 0; j < n; j++) row[n + j] = basisB[j][i]; // B 列是 basisB 向量
    return row;
  });
  // 高斯-约旦消元
  for (let col = 0; col < n; col++) {
    // 选主元
    let pivot = col;
    for (let i = col + 1; i < n; i++)
      if (Math.abs(aug[i][col]) > Math.abs(aug[pivot][col])) pivot = i;
    if (Math.abs(aug[pivot][col]) < 1e-12) throw new Error('基 A 线性相关，不是合法基');
    [aug[col], aug[pivot]] = [aug[pivot], aug[col]];
    const div = aug[col][col];
    for (let j = col; j < 2 * n; j++) aug[col][j] /= div;
    for (let i = 0; i < n; i++) {
      if (i === col || Math.abs(aug[i][col]) < 1e-12) continue;
      const factor = aug[i][col];
      for (let j = col; j < 2 * n; j++) aug[i][j] -= factor * aug[col][j];
    }
  }
  // 右半部分就是 P = A^(-1) B
  const P: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      P[i][j] = aug[i][n + j];
  return P;
}

// ============ 二维绘图新增函数 ============

// 隐函数曲线采样：用等高线方法找 f(x,y)=0 的曲线点
// 返回分段采样后的散点数组（按 x 排序），或多段
interface CurveSegment { x: number[]; y: number[]; }

export function sampleImplicit(
  expr: string,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  nx = 200, ny = 200
): CurveSegment[] {
  const node = parse(expr);
  // 计算网格上的值
  const grid: number[][] = [];
  const dx = (xMax - xMin) / nx;
  const dy = (yMax - yMin) / ny;
  for (let j = 0; j <= ny; j++) {
    const row: number[] = [];
    const y = yMin + j * dy;
    for (let i = 0; i <= nx; i++) {
      const x = xMin + i * dx;
      try {
        row.push(node.evaluate({ x, y }) as number);
      } catch {
        row.push(NaN);
      }
    }
    grid.push(row);
  }
  // Marching squares 找零等值线
  const segments: { x: number[]; y: number[] }[] = [];
  const pts: Array<[number, number]> = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const v00 = grid[j][i];
      const v10 = grid[j][i + 1];
      const v01 = grid[j + 1][i];
      const v11 = grid[j + 1][i + 1];
      if ([v00, v10, v01, v11].some(v => !isFinite(v))) continue;
      const x0 = xMin + i * dx, x1 = xMin + (i + 1) * dx;
      const y0 = yMin + j * dy, y1 = yMin + (j + 1) * dy;
      // 简单的边交点收集（marching squares 简化版）
      const signs = [v00 >= 0 ? 1 : 0, v10 >= 0 ? 1 : 0, v11 >= 0 ? 1 : 0, v01 >= 0 ? 1 : 0];
      const code = signs[0] + signs[1] * 2 + signs[2] * 4 + signs[3] * 8;
      if (code === 0 || code === 15) continue;
      const interps: Array<[number, number]> = [];
      // 底边 v00-v10
      if (signs[0] !== signs[1]) {
        const t = Math.abs(v00) / (Math.abs(v00) + Math.abs(v10) + 1e-15);
        interps.push([x0 + t * dx, y0]);
      }
      // 右边 v10-v11
      if (signs[1] !== signs[2]) {
        const t = Math.abs(v10) / (Math.abs(v10) + Math.abs(v11) + 1e-15);
        interps.push([x1, y0 + t * dy]);
      }
      // 顶边 v01-v11
      if (signs[2] !== signs[3]) {
        const t = Math.abs(v01) / (Math.abs(v01) + Math.abs(v11) + 1e-15);
        interps.push([x0 + t * dx, y1]);
      }
      // 左边 v00-v01
      if (signs[3] !== signs[0]) {
        const t = Math.abs(v00) / (Math.abs(v00) + Math.abs(v01) + 1e-15);
        interps.push([x0, y0 + t * dy]);
      }
      if (interps.length >= 2) {
        pts.push(interps[0], interps[1]);
      }
    }
  }
  // 把散点组织成 x 升序的一条曲线（简单排序，适合函数型隐函数）
  if (pts.length > 0) {
    pts.sort((a, b) => a[0] - b[0]);
    const xs = pts.map(p => p[0]);
    const ys = pts.map(p => p[1]);
    segments.push({ x: xs, y: ys });
  }
  return segments;
}

// 二次曲线识别 Ax² + Bxy + Cy² + Dx + Ey + F = 0
export function identifyConic(A: number, B: number, C: number, D: number, E: number, F: number): {
  type: string;
  center: [number, number] | null;
  standardForm: string;
  details: string;
} {
  // 判别式 I2 = B² - 4AC
  const I2 = B * B - 4 * A * C;
  // I1 = A + C
  const I1 = A + C;
  // 更精确的 I3 计算
  const det3 = (
    A * C * F + B * E * D / 4 - A * E * E / 4 - C * D * D / 4 - F * B * B / 4
  );
  const absI2 = Math.abs(I2);
  let type = '';
  let center: [number, number] | null = null;
  let standardForm = '';
  let details = '';

  if (absI2 < 1e-10) {
    // 抛物型
    if (Math.abs(det3) < 1e-10) {
      type = '退化（两平行直线或重合直线或虚）';
      standardForm = '退化二次曲线';
    } else {
      type = '抛物线';
      // 化为标准形需要坐标变换，这里用简单说明
      standardForm = 'y² = 2px 或 x² = 2py（经坐标变换）';
    }
  } else if (I2 < 0) {
    // 椭圆型
    if (Math.abs(det3) < 1e-10) {
      type = '退化（点椭圆或虚）';
      standardForm = '退化';
    } else if (Math.abs(A - C) < 1e-10 && Math.abs(B) < 1e-10) {
      type = '圆';
      // 圆心
      const cx = -D / (2 * A);
      const cy = -E / (2 * C);
      const r2 = (D * D + E * E) / (4 * A * A) - F / A;
      center = [cx, cy];
      if (r2 > 0) {
        standardForm = `(x - ${formatResult(cx)})² + (y - ${formatResult(cy)})² = ${formatResult(r2)}`;
        details = `半径 r = ${formatResult(Math.sqrt(r2))}`;
      } else {
        type = '虚圆（退化）';
        standardForm = '半径² < 0，无实轨迹';
      }
    } else {
      type = '椭圆';
      // 中心坐标解方程组：2Ax + By + D = 0, Bx + 2Cy + E = 0
      const denom = 4 * A * C - B * B;
      if (Math.abs(denom) > 1e-12) {
        const cx = (B * E - 2 * C * D) / denom;
        const cy = (B * D - 2 * A * E) / denom;
        center = [cx, cy];
        // 特征值（半轴相关）
        const disc = Math.sqrt((A - C) ** 2 + B * B);
        const lambda1 = (A + C + disc) / 2;
        const lambda2 = (A + C - disc) / 2;
        const Fprime = F + (D * cx + E * cy) / 2;
        standardForm = `经平移和旋转后：λ₁·X² + λ₂·Y² + F' = 0
λ₁ = ${formatResult(lambda1)}, λ₂ = ${formatResult(lambda2)}
F' = ${formatResult(Fprime)}`;
      }
    }
  } else {
    // 双曲型 (I2 > 0)
    if (Math.abs(det3) < 1e-10) {
      type = '退化（两相交直线）';
      standardForm = '退化';
    } else {
      type = '双曲线';
      const denom = 4 * A * C - B * B;
      if (Math.abs(denom) > 1e-12) {
        const cx = (B * E - 2 * C * D) / denom;
        const cy = (B * D - 2 * A * E) / denom;
        center = [cx, cy];
        const disc = Math.sqrt((A - C) ** 2 + B * B);
        const lambda1 = (A + C + disc) / 2;
        const lambda2 = (A + C - disc) / 2;
        const Fprime = F + (D * cx + E * cy) / 2;
        standardForm = `经平移和旋转后：λ₁·X² + λ₂·Y² + F' = 0
λ₁ = ${formatResult(lambda1)}, λ₂ = ${formatResult(lambda2)}
F' = ${formatResult(Fprime)}`;
      }
    }
  }
  details = details || `I₁ = ${formatResult(I1)}, I₂ = ${formatResult(I2)}, I₃ = ${formatResult(det3)}`;
  return { type, center, standardForm, details };
}

// 函数在某点的切线 y = f(x0) + f'(x0)(x-x0)，返回切点和斜率及切线采样点
export function tangentLine(
  expr: string, x0: number, xMin: number, xMax: number, n = 300
): { x0: number; y0: number; slope: number; line: { x: number[]; y: number[] } } {
  const node = parse(expr);
  const y0 = node.evaluate({ x: x0 }) as number;
  const dNode = derivative(node, 'x');
  const slope = dNode.evaluate({ x: x0 }) as number;
  const xs: number[] = [];
  const ys: number[] = [];
  const dx = (xMax - xMin) / n;
  for (let i = 0; i <= n; i++) {
    const x = xMin + i * dx;
    xs.push(x);
    ys.push(y0 + slope * (x - x0));
  }
  return { x0, y0, slope, line: { x: xs, y: ys } };
}

// 渐近线检测：垂直（分母零）、水平（x→±∞极限）、斜渐近线
export function asymptotes(expr: string, xMin: number, xMax: number): {
  vertical: number[];
  horizontal: number[];
  oblique: { a: number; b: number }[];
} {
  const vertical: number[] = [];
  const horizontal: number[] = [];
  const oblique: { a: number; b: number }[] = [];
  // 尝试用符号方式分析：对有理函数找分母零点
  try {
    const node = parse(expr);
    const simplified = simplify(node);
    // 检查在 xMin~xMax 区间内的符号突变点（粗略扫描）
    // 自适应采样点数：范围越大点数越少（保持性能）
    const span = Math.abs(xMax - xMin);
    const n = Math.max(200, Math.min(1000, Math.round(500 / Math.max(1, Math.log10(Math.max(span, 1)) / 2))));
    const dx = (xMax - xMin) / n;
    // y 值有效上限：跟 x 范围的平方量级挂钩（适应 x² 等函数）
    const yMaxAbs = Math.max(1e8, span * span * 10);
    // 渐近线去重最小间距：相对于 x 范围的 0.5%
    const minGap = Math.max(0.05, span * 0.005);
    let prevVal = NaN;
    let prevX = xMin;
    let prevIsFinite = false;
    for (let i = 0; i <= n; i++) {
      const x = xMin + i * dx;
      let y = NaN;
      let isFin = false;
      try {
        y = simplified.evaluate({ x }) as number;
        isFin = isFinite(y) && Math.abs(y) < yMaxAbs;
      } catch {
        y = NaN;
      }
      // 检测垂直渐近线：
      // 1. 有限值 → 非有限值 边界（奇点）
      // 2. 两侧都是有限但相对跳变极大（数值上接近奇点）
      // 3. 两侧符号相反且相对比例悬殊（穿过奇点）
      if (i > 0) {
        let isAsymptote = false;
        let vertX = x;
        if (prevIsFinite !== isFin) {
          // 有限/无限边界 = 奇点位置
          isAsymptote = true;
          vertX = (x + prevX) / 2;
        } else if (prevIsFinite && isFin) {
          const yAbs = Math.abs(y);
          const prevAbs = Math.abs(prevVal);
          const maxAbs = Math.max(yAbs, prevAbs);
          const minAbs = Math.min(yAbs, prevAbs);
          // 相对比例悬殊（>1000 倍）且符号相反 → 穿过奇点
          const hugeRatio = minAbs > 1e-10 && maxAbs / minAbs > 1000 && y * prevVal < 0;
          // 从接近 0 直接跳到极大值（>1e6 量级）
          const zeroToHuge = minAbs < 1e-6 && maxAbs > yMaxAbs / 100;
          if (hugeRatio || zeroToHuge) {
            isAsymptote = true;
            vertX = (x + prevX) / 2;
          }
        }
        if (isAsymptote) {
          if (vertical.every(v => Math.abs(v - vertX) > minGap)) {
            // 保留适度精度（避免大范围小数没意义）
            const digits = span > 1000 ? 0 : span > 10 ? 2 : 4;
            vertical.push(parseFloat(vertX.toFixed(digits)));
          }
        }
      }
      prevVal = y;
      prevX = x;
      prevIsFinite = isFin;
    }
    // 水平渐近线：x→+∞ 和 x→-∞ 的极限（用大值近似）
    try {
      const big = 1e8;
      const yBig = simplified.evaluate({ x: big }) as number;
      const yNegBig = simplified.evaluate({ x: -big }) as number;
      if (isFinite(yBig)) horizontal.push(parseFloat(yBig.toFixed(6)));
      if (isFinite(yNegBig) && (horizontal.length === 0 || Math.abs(yNegBig - horizontal[0]) > 1e-6)) {
        horizontal.push(parseFloat(yNegBig.toFixed(6)));
      }
      // 斜渐近线：a = lim f(x)/x, b = lim f(x)-ax
      const aPos = simplified.evaluate({ x: big }) as number / big;
      const bPos = (simplified.evaluate({ x: big }) as number) - aPos * big;
      if (isFinite(aPos) && Math.abs(aPos) > 1e-6 && isFinite(bPos)) {
        oblique.push({ a: parseFloat(aPos.toFixed(6)), b: parseFloat(bPos.toFixed(6)) });
      }
    } catch {
      // 忽略
    }
  } catch {
    // 忽略
  }
  return { vertical, horizontal, oblique };
}

// 两曲线间面积：数值积分 ∫|f(x) - g(x)| dx 从 a 到 b，并返回上下曲线的 fill 数据
export function areaBetweenCurves(
  fExpr: string, gExpr: string, a: number, b: number, n = 500
): { area: number; upper: { x: number[]; y: number[] }; lower: { x: number[]; y: number[] } } {
  const fNode = parse(fExpr);
  const gNode = parse(gExpr);
  const dx = (b - a) / n;
  const xs: number[] = [];
  const fVals: number[] = [];
  const gVals: number[] = [];
  const upperY: number[] = [];
  const lowerY: number[] = [];
  let area = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * dx;
    xs.push(x);
    let fy = 0, gy = 0;
    try { fy = fNode.evaluate({ x }) as number; } catch { fy = NaN; }
    try { gy = gNode.evaluate({ x }) as number; } catch { gy = NaN; }
    fVals.push(fy);
    gVals.push(gy);
    const u = Math.max(fy, gy);
    const l = Math.min(fy, gy);
    upperY.push(u);
    lowerY.push(l);
    if (i > 0 && isFinite(u) && isFinite(l)) {
      const prevU = upperY[i - 1];
      const prevL = lowerY[i - 1];
      area += ((u - l) + (prevU - prevL)) * dx / 2;
    }
  }
  return {
    area,
    upper: { x: xs, y: upperY },
    lower: { x: xs, y: lowerY },
  };
}

// 反函数：通过反射数值采样（交换 x, y 后排序）
export function inverseFunction(
  expr: string, xMin: number, xMax: number, n = 500
): { x: number[]; y: number[] } {
  const pts = sampleFunction(expr, xMin, xMax, n);
  // 反射 y=x → 交换 x 和 y
  const swapped = pts.x.map((x, i) => ({ x: pts.y[i], y: x }));
  // 按新 x 排序（单调函数才有反函数）
  swapped.sort((a, b) => a.x - b.x);
  return { x: swapped.map(p => p.x), y: swapped.map(p => p.y) };
}

// 参数曲线动画采样：根据 t 范围返回从 tMin 到 tMax 的点
export function sampleParametricAnim(
  xExpr: string, yExpr: string, tMin: number, tMax: number, n = 800
): { x: number[]; y: number[] } {
  return sampleParametric(xExpr, yExpr, tMin, tMax, n);
}

// 极坐标玫瑰线/心形线/螺线（直接封装 samplePolar）
export function samplePolarRose(
  expr: string, thetaMin: number, thetaMax: number, n = 800
): { x: number[]; y: number[] } {
  return samplePolar(expr, thetaMin, thetaMax, n);
}

// ============ 三维曲面新增函数 ============

// 常见二次曲面库
export const QUADRIC_SURFACES: Record<string, { expr: string; xMin: number; xMax: number; yMin: number; yMax: number; name: string; description: string }> = {
  ellipsoid: { name: '椭球面', expr: 'sqrt(max(0, 1 - x^2/4 - y^2/9))', xMin: -2, xMax: 2, yMin: -3, yMax: 3, description: 'x²/a² + y²/b² + z²/c² = 1' },
  hyperboloid1: { name: '单叶双曲面', expr: 'sqrt(max(0, x^2 + y^2 - 1))', xMin: -3, xMax: 3, yMin: -3, yMax: 3, description: 'x² + y² - z² = 1' },
  hyperboloid2: { name: '双叶双曲面', expr: 'sqrt(max(0, x^2 + y^2 + 1))', xMin: -3, xMax: 3, yMin: -3, yMax: 3, description: 'x² + y² - z² = -1（上叶）' },
  ellipticParaboloid: { name: '椭圆抛物面', expr: 'x^2 + y^2', xMin: -3, xMax: 3, yMin: -3, yMax: 3, description: 'z = x² + y²' },
  hyperbolicParaboloid: { name: '双曲抛物面（马鞍面）', expr: 'x^2 - y^2', xMin: -3, xMax: 3, yMin: -3, yMax: 3, description: 'z = x² - y²' },
  cone: { name: '二次锥面', expr: 'sqrt(x^2 + y^2)', xMin: -3, xMax: 3, yMin: -3, yMax: 3, description: 'z² = x² + y²（上半锥）' },
  cylinder: { name: '圆柱面', expr: 'sqrt(max(0, 4 - x^2))', xMin: -2, xMax: 2, yMin: -3, yMax: 3, description: 'x² + z² = 4（母线平行 y 轴）' },
  sphere: { name: '球面', expr: 'sqrt(max(0, 1 - x^2 - y^2))', xMin: -1, xMax: 1, yMin: -1, yMax: 1, description: 'x² + y² + z² = 1（上半球）' },
};

// 隐式曲面：用 marching cubes 抽取 F(x,y,z)=0 的等值面，返回 vertices 和 faces（简化：用 plotly 不支持直接 mesh，改用等值体切片方式）
// 这里我们用三个正交截面 + 体积数据的方式返回给 plotly volume
interface ImplicitVolume { x: number[]; y: number[]; z: number[]; values: number[][][]; }

export function sampleImplicitSurfaceMarching(
  expr: string,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  zMin: number, zMax: number,
  n = 40
): ImplicitVolume {
  const node = parse(expr);
  const dx = (xMax - xMin) / (n - 1);
  const dy = (yMax - yMin) / (n - 1);
  const dz = (zMax - zMin) / (n - 1);
  const xs: number[] = [], ys: number[] = [], zs: number[] = [];
  for (let i = 0; i < n; i++) xs.push(xMin + i * dx);
  for (let j = 0; j < n; j++) ys.push(yMin + j * dy);
  for (let k = 0; k < n; k++) zs.push(zMin + k * dz);
  const values: number[][][] = [];
  for (let k = 0; k < n; k++) {
    const slice: number[][] = [];
    for (let j = 0; j < n; j++) {
      const row: number[] = [];
      for (let i = 0; i < n; i++) {
        try {
          row.push(node.evaluate({ x: xs[i], y: ys[j], z: zs[k] }) as number);
        } catch {
          row.push(NaN);
        }
      }
      slice.push(row);
    }
    values.push(slice);
  }
  return { x: xs, y: ys, z: zs, values };
}

// 旋转曲面：曲线 y = f(x) 绕 x 轴或 y 轴旋转
// axis: 'x' 或 'y'
export function sampleSurfaceOfRevolution(
  expr: string, xMin: number, xMax: number, axis: 'x' | 'y', n = 60
): { x: number[][]; y: number[][]; z: number[][] } {
  const node = parse(expr);
  // 母线上的点
  const xs: number[] = [];
  const ys: number[] = [];
  const dx = (xMax - xMin) / (n - 1);
  for (let i = 0; i < n; i++) {
    const x = xMin + i * dx;
    xs.push(x);
    ys.push(node.evaluate({ x }) as number);
  }
  // 旋转角度
  const thetas: number[] = [];
  for (let j = 0; j < n; j++) thetas.push((j / (n - 1)) * 2 * Math.PI);
  const X: number[][] = [];
  const Y: number[][] = [];
  const Z: number[][] = [];
  for (let j = 0; j < n; j++) {
    const rowX: number[] = [];
    const rowY: number[] = [];
    const rowZ: number[] = [];
    const cosT = Math.cos(thetas[j]);
    const sinT = Math.sin(thetas[j]);
    for (let i = 0; i < n; i++) {
      if (axis === 'x') {
        // 绕 x 轴：x 不变，y→y·cosθ，z→y·sinθ
        rowX.push(xs[i]);
        rowY.push(ys[i] * cosT);
        rowZ.push(ys[i] * sinT);
      } else {
        // 绕 y 轴：y 不变，x→x·cosθ，z→x·sinθ
        rowX.push(xs[i] * cosT);
        rowY.push(ys[i]);
        rowZ.push(xs[i] * sinT);
      }
    }
    X.push(rowX);
    Y.push(rowY);
    Z.push(rowZ);
  }
  return { x: X, y: Y, z: Z };
}

// 参数曲面：x(u,v), y(u,v), z(u,v)
export function sampleParametricSurface(
  xExpr: string, yExpr: string, zExpr: string,
  uMin: number, uMax: number,
  vMin: number, vMax: number,
  n = 60
): { x: number[][]; y: number[][]; z: number[][] } {
  const xNode = parse(xExpr);
  const yNode = parse(yExpr);
  const zNode = parse(zExpr);
  const du = (uMax - uMin) / (n - 1);
  const dv = (vMax - vMin) / (n - 1);
  const X: number[][] = [];
  const Y: number[][] = [];
  const Z: number[][] = [];
  for (let j = 0; j < n; j++) {
    const v = vMin + j * dv;
    const rowX: number[] = [];
    const rowY: number[] = [];
    const rowZ: number[] = [];
    for (let i = 0; i < n; i++) {
      const u = uMin + i * du;
      try {
        rowX.push(xNode.evaluate({ u, v }) as number);
        rowY.push(yNode.evaluate({ u, v }) as number);
        rowZ.push(zNode.evaluate({ u, v }) as number);
      } catch {
        rowX.push(NaN); rowY.push(NaN); rowZ.push(NaN);
      }
    }
    X.push(rowX);
    Y.push(rowY);
    Z.push(rowZ);
  }
  return { x: X, y: Y, z: Z };
}

// 曲面法向量场（在网格点上计算法向量，返回稀疏箭头数据）
export function normalVectors(
  expr: string, xMin: number, xMax: number, yMin: number, yMax: number, stride = 10
): { x: number[]; y: number[]; z: number[]; u: number[]; v: number[]; w: number[] } {
  const n = 30;
  const data = sampleSurface(expr, xMin, xMax, yMin, yMax, n);
  const xs: number[] = [], ys: number[] = [], zs: number[] = [];
  const us: number[] = [], vs: number[] = [], ws: number[] = [];
  for (let j = stride; j < n; j += stride) {
    for (let i = stride; i < n; i += stride) {
      const x = data.x[i];
      const y = data.y[j];
      const z = data.z[j][i];
      // 数值梯度近似
      const dzx = (data.z[j][i + 1] - data.z[j][i - 1]) / (2 * (data.x[1] - data.x[0]));
      const dzy = (data.z[j + 1][i] - data.z[j - 1][i]) / (2 * (data.y[1] - data.y[0]));
      // 法向量 (-dz/dx, -dz/dy, 1) 归一化
      const nx = -dzx, ny = -dzy, nz = 1;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      xs.push(x); ys.push(y); zs.push(z);
      const scale = 0.5 / len;
      us.push(nx * scale); vs.push(ny * scale); ws.push(nz * scale);
    }
  }
  return { x: xs, y: ys, z: zs, u: us, v: vs, w: ws };
}

// 一般二次曲面识别：Ax² + By² + Cz² + 2Dxy + 2Exz + 2Fyz + 2Gx + 2Hy + 2Iz + J = 0
export function identifyQuadric(A: number, B: number, C: number, D: number, E: number, F: number, G: number, H: number, I: number, J: number): {
  type: string;
  details: string;
} {
  // 二次曲面一般方程: Ax² + By² + Cz² + 2Dxy + 2Exz + 2Fyz + 2Gx + 2Hy + 2Iz + J = 0
  // 注意：这里 D,E,F 是交叉项系数的一半，G,H,I 是一次项系数的一半（与输入参数一致）
  // 不变量 I1, I2, I3, I4
  const I1 = A + B + C;
  const I2 = A * B + A * C + B * C - D * D - E * E - F * F;
  // I3 = 三阶主子式 |A D E; D B F; E F C|
  const I3 = (
    A * (B * C - F * F) - D * (D * C - E * F) + E * (D * F - B * E)
  );

  // 用矩阵乘法计算 I4 （更可靠）
  // 4x4 矩阵 M = [[A,D,E,G],[D,B,F,H],[E,F,C,I],[G,H,I,J]]
  // 按第一行展开
  function det3(m: number[][]): number {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
      - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
      + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  }
  const M11 = det3([[B, F, H], [F, C, I], [H, I, J]]);
  const M12 = -det3([[D, F, H], [E, C, I], [G, I, J]]);
  const M13 = det3([[D, B, H], [E, F, I], [G, H, J]]);
  const M14 = -det3([[D, B, F], [E, F, C], [G, H, I]]);
  const I4val = A * M11 + D * M12 + E * M13 + G * M14;

  const absI3 = Math.abs(I3);
  const absI4val = Math.abs(I4val);
  let type = '';
  let details = '';

  if (absI3 > 1e-10) {
    // 中心二次曲面 (I3 ≠ 0)
    if (I2 > 0 && I1 * I3 > 0) {
      // 椭球型
      if (I1 * I2 > 0 && I1 * I3 > 0 && I4val < 0) {
        // 检查是否为球面：A==B==C 且 D==E==F==0
        if (Math.abs(A - B) < 1e-6 && Math.abs(B - C) < 1e-6 &&
            Math.abs(D) < 1e-8 && Math.abs(E) < 1e-8 && Math.abs(F) < 1e-8) {
          type = '球面';
        } else {
          type = '椭球面';
        }
      } else if (I4val > 0) {
        type = '虚椭球面（无实轨迹）';
      } else {
        type = '点椭球面（退化）';
      }
    } else if (I2 < 0) {
      // 双曲型
      if (I4val > 0) {
        type = '单叶双曲面';
      } else if (I4val < 0) {
        type = '双叶双曲面';
      } else {
        type = '二次锥面（实）';
      }
    } else {
      type = '二次锥面（实或虚）';
    }
  } else {
    // 非中心（抛物型/柱面） I3 = 0
    // 计算 K 不变量或用 I4 的符号
    // K2 = A*J-G² + B*J-H² + C*J-I² （简化）
    // 更准确：用 I4 与 I2 的关系
    if (absI4val > 1e-8) {
      // 抛物面 (I3=0, I4≠0)
      if (I2 > 1e-8) {
        // 椭圆抛物面：I2*I4 < 0
        if (I2 * I4val < 0) {
          type = '椭圆抛物面';
        } else {
          type = '虚椭圆抛物面（无实轨迹）';
        }
      } else if (I2 < -1e-8) {
        type = '双曲抛物面（马鞍面）';
      } else {
        type = '抛物柱面';
      }
    } else {
      // 柱面或退化 (I3=0, I4=0)
      type = '柱面/锥面（退化）';
    }
  }

  details = `I₁ = ${formatResult(I1)}
I₂ = ${formatResult(I2)}
I₃ = ${formatResult(I3)}
I₄ = ${formatResult(I4val)}`;
  return { type, details };
}

// ============ 多元微积分新增函数 ============

// 全微分：dz = f_x * dx + f_y * dy，在 (a, b) 处
export function totalDifferential(
  expr: string, a: number, b: number
): { dfx: number; dfy: number; formula: string } {
  const dxF = derivative(parse(expr), 'x');
  const dyF = derivative(parse(expr), 'y');
  const dfx = dxF.evaluate({ x: a, y: b }) as number;
  const dfy = dyF.evaluate({ x: a, y: b }) as number;
  const formula = `dz = (${formatResult(dfx)}) dx + (${formatResult(dfy)}) dy`;
  return { dfx, dfy, formula };
}

// 方向导数：D_u f = ∇f · u/|u|
export function directionalDerivative(
  expr: string, a: number, b: number, u: number, v: number
): { gradient: [number, number]; direction: [number, number]; value: number } {
  const dxF = derivative(parse(expr), 'x');
  const dyF = derivative(parse(expr), 'y');
  const gx = dxF.evaluate({ x: a, y: b }) as number;
  const gy = dyF.evaluate({ x: a, y: b }) as number;
  const len = Math.sqrt(u * u + v * v);
  if (len < 1e-12) throw new Error('方向向量不能为零向量');
  const ux = u / len, uy = v / len;
  const val = gx * ux + gy * uy;
  return { gradient: [gx, gy], direction: [ux, uy], value: val };
}

// 二元泰勒展开（到二阶）：在 (a, b) 处展开
export function multiVarTaylor2nd(
  expr: string, a: number, b: number
): { f0: number; fx: number; fy: number; fxx: number; fxy: number; fyy: number; formula: string } {
  const node = parse(expr);
  const f0 = node.evaluate({ x: a, y: b }) as number;
  const dxF = derivative(node, 'x');
  const dyF = derivative(node, 'y');
  const fx = dxF.evaluate({ x: a, y: b }) as number;
  const fy = dyF.evaluate({ x: a, y: b }) as number;
  const fxxF = derivative(dxF, 'x');
  const fxyF = derivative(dxF, 'y');
  const fyyF = derivative(dyF, 'y');
  const fxx = fxxF.evaluate({ x: a, y: b }) as number;
  const fxy = fxyF.evaluate({ x: a, y: b }) as number;
  const fyy = fyyF.evaluate({ x: a, y: b }) as number;
  const formula = `f(x,y) ≈ ${formatResult(f0)}
  + (${formatResult(fx)})(x-${formatResult(a)}) + (${formatResult(fy)})(y-${formatResult(b)})
  + (1/2)[${formatResult(fxx)}(x-${formatResult(a)})² + 2·${formatResult(fxy)}(x-${formatResult(a)})(y-${formatResult(b)}) + ${formatResult(fyy)}(y-${formatResult(b)})²]`;
  return { f0, fx, fy, fxx, fxy, fyy, formula };
}

// 二元函数极值：求驻点 + Hesse 矩阵判定
// 用网格扫描找疑似驻点，再用 Hesse 判别类型
export function findCriticalPoints(
  expr: string, xMin: number, xMax: number, yMin: number, yMax: number, n = 50
): { points: Array<{ x: number; y: number; type: '极小' | '极大' | '鞍点' | '不确定'; value: number }> } {
  const dxF = derivative(parse(expr), 'x');
  const dyF = derivative(parse(expr), 'y');
  const fxxF = derivative(dxF, 'x');
  const fxyF = derivative(dxF, 'y');
  const fyyF = derivative(dyF, 'y');
  const points: Array<{ x: number; y: number; type: '极小' | '极大' | '鞍点' | '不确定'; value: number }> = [];
  const dx = (xMax - xMin) / n;
  const dy = (yMax - yMin) / n;
  // 扫描网格，找梯度变号的点（近似驻点）
  for (let i = 1; i < n; i++) {
    for (let j = 1; j < n; j++) {
      const x = xMin + i * dx;
      const y = yMin + j * dy;
      try {
        const gx = dxF.evaluate({ x, y }) as number;
        const gy = dyF.evaluate({ x, y }) as number;
        const gMag = Math.sqrt(gx * gx + gy * gy);
        if (gMag < 0.05) {
          // 疑似驻点，精细化一下
          const fxx = fxxF.evaluate({ x, y }) as number;
          const fxy = fxyF.evaluate({ x, y }) as number;
          const fyy = fyyF.evaluate({ x, y }) as number;
          const detH = fxx * fyy - fxy * fxy;
          const fVal = parse(expr).evaluate({ x, y }) as number;
          let type: '极小' | '极大' | '鞍点' | '不确定' = '不确定';
          if (detH > 1e-10) {
            if (fxx > 0) type = '极小';
            else type = '极大';
          } else if (detH < -1e-10) {
            type = '鞍点';
          }
          // 去重
          const exists = points.some(p => Math.abs(p.x - x) < 0.3 && Math.abs(p.y - y) < 0.3);
          if (!exists) {
            points.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)), type, value: parseFloat(fVal.toFixed(4)) });
          }
        }
      } catch {
        // 忽略
      }
    }
  }
  return { points };
}

// 拉格朗日乘子法（二元函数 + 一元约束，数值求解）
// 解方程：∇f = λ∇g, g(x,y)=0。用牛顿迭代数值求解。
export function lagrangeMultiplier2D(
  fExpr: string, gExpr: string, x0: number, y0: number, lambda0: number
): { x: number; y: number; lambda: number; fValue: number; converged: boolean } {
  const fNode = parse(fExpr);
  const gNode = parse(gExpr);
  const fxNode = derivative(fNode, 'x');
  const fyNode = derivative(fNode, 'y');
  const gxNode = derivative(gNode, 'x');
  const gyNode = derivative(gNode, 'y');
  let x = x0, y = y0, L = lambda0;
  let converged = false;
  for (let iter = 0; iter < 100; iter++) {
    const fx = fxNode.evaluate({ x, y }) as number;
    const fy = fyNode.evaluate({ x, y }) as number;
    const gx = gxNode.evaluate({ x, y }) as number;
    const gy = gyNode.evaluate({ x, y }) as number;
    const g = gNode.evaluate({ x, y }) as number;
    // 残量方程：fx - λ gx = 0, fy - λ gy = 0, g = 0
    const r1 = fx - L * gx;
    const r2 = fy - L * gy;
    const r3 = g;
    if (Math.sqrt(r1 * r1 + r2 * r2 + r3 * r3) < 1e-8) {
      converged = true;
      break;
    }
    // Jacobian（近似）
    const fxxNode = derivative(fxNode, 'x');
    const fxyNode = derivative(fxNode, 'y');
    const fyyNode = derivative(fyNode, 'y');
    const gxxNode = derivative(gxNode, 'x');
    const gxyNode = derivative(gxNode, 'y');
    const gyyNode = derivative(gyNode, 'y');
    const fxx = fxxNode.evaluate({ x, y }) as number;
    const fxy = fxyNode.evaluate({ x, y }) as number;
    const fyy = fyyNode.evaluate({ x, y }) as number;
    const gxx = gxxNode.evaluate({ x, y }) as number;
    const gxy = gxyNode.evaluate({ x, y }) as number;
    const gyy = gyyNode.evaluate({ x, y }) as number;
    // 牛顿法解 3×3 系统
    const a11 = fxx - L * gxx, a12 = fxy - L * gxy, a13 = -gx;
    const a21 = fxy - L * gxy, a22 = fyy - L * gyy, a23 = -gy;
    const a31 = gx, a32 = gy, a33 = 0;
    const det = a11 * (a22 * a33 - a23 * a32) - a12 * (a21 * a33 - a23 * a31) + a13 * (a21 * a32 - a22 * a31);
    if (Math.abs(det) < 1e-15) break;
    const dx = ((a22 * a33 - a23 * a32) * (-r1) - (a12 * a33 - a13 * a32) * (-r2) + (a12 * a23 - a13 * a22) * (-r3)) / det;
    const dy = (-(a21 * a33 - a23 * a31) * (-r1) + (a11 * a33 - a13 * a31) * (-r2) - (a11 * a23 - a13 * a21) * (-r3)) / det;
    const dL = ((a21 * a32 - a22 * a31) * (-r1) - (a11 * a32 - a12 * a31) * (-r2) + (a11 * a22 - a12 * a21) * (-r3)) / det;
    x += dx * 0.5; y += dy * 0.5; L += dL * 0.5;
  }
  const fValue = fNode.evaluate({ x, y }) as number;
  return { x: parseFloat(x.toFixed(6)), y: parseFloat(y.toFixed(6)), lambda: parseFloat(L.toFixed(6)), fValue: parseFloat(fValue.toFixed(6)), converged };
}

// 三重积分（长方体区域，数值辛普森法嵌套）
export function tripleIntegral(
  expr: string,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  zMin: number, zMax: number,
  n = 30
): number {
  const node = parse(expr);
  const nx = n, ny = n, nz = n;
  const dx = (xMax - xMin) / nx;
  const dy = (yMax - yMin) / ny;
  const dz = (zMax - zMin) / nz;
  let sum = 0;
  for (let i = 0; i <= nx; i++) {
    const x = xMin + i * dx;
    const wx = (i === 0 || i === nx) ? 1 : (i % 2 === 1 ? 4 : 2);
    for (let j = 0; j <= ny; j++) {
      const y = yMin + j * dy;
      const wy = (j === 0 || j === ny) ? 1 : (j % 2 === 1 ? 4 : 2);
      for (let k = 0; k <= nz; k++) {
        const z = zMin + k * dz;
        const wz = (k === 0 || k === nz) ? 1 : (k % 2 === 1 ? 4 : 2);
        try {
          const v = node.evaluate({ x, y, z }) as number;
          if (isFinite(v)) sum += wx * wy * wz * v;
        } catch {
          // 忽略
        }
      }
    }
  }
  return sum * (dx * dy * dz) / 27;
}

// 二重积分极坐标：∫∫ f(x,y) dxdy = ∫∫ f(r cosθ, r sinθ) r dr dθ
export function doubleIntegralPolar(
  expr: string,
  rMin: number, rMax: number,
  thetaMin: number, thetaMax: number,
  n = 100
): number {
  const node = parse(expr);
  const nr = n, nt = n;
  const dr = (rMax - rMin) / nr;
  const dt = (thetaMax - thetaMin) / nt;
  let sum = 0;
  for (let i = 0; i <= nr; i++) {
    const r = rMin + i * dr;
    const wr = (i === 0 || i === nr) ? 0.5 : 1;
    for (let j = 0; j <= nt; j++) {
      const t = thetaMin + j * dt;
      const wt = (j === 0 || j === nt) ? 0.5 : 1;
      try {
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);
        const v = node.evaluate({ x, y }) as number;
        if (isFinite(v)) sum += wr * wt * v * r;
      } catch {
        // 忽略
      }
    }
  }
  return sum * dr * dt;
}

// 第一型曲线积分 ∫_C f(x,y) ds，曲线由参数方程给出
export function lineIntegralFirstType(
  fExpr: string,
  xExpr: string, yExpr: string,
  tMin: number, tMax: number,
  n = 500
): number {
  const fNode = parse(fExpr);
  const xNode = parse(xExpr);
  const yNode = parse(yExpr);
  const dxdt = derivative(xNode, 't');
  const dydt = derivative(yNode, 't');
  const dt = (tMax - tMin) / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const t = tMin + i * dt;
    const w = (i === 0 || i === n) ? 0.5 : 1;
    try {
      const x = xNode.evaluate({ t }) as number;
      const y = yNode.evaluate({ t }) as number;
      const v = fNode.evaluate({ x, y }) as number;
      const dxv = dxdt.evaluate({ t }) as number;
      const dyv = dydt.evaluate({ t }) as number;
      const ds = Math.sqrt(dxv * dxv + dyv * dyv);
      if (isFinite(v) && isFinite(ds)) sum += w * v * ds;
    } catch {
      // 忽略
    }
  }
  return sum * dt;
}

// 第二型曲线积分 ∫_C P dx + Q dy，参数曲线 r(t) = (x(t), y(t)), t ∈ [a,b]
export function lineIntegralSecondType(
  PExpr: string, QExpr: string,
  xExpr: string, yExpr: string,
  tMin: number, tMax: number,
  n = 500
): number {
  const PNode = parse(PExpr);
  const QNode = parse(QExpr);
  const xNode = parse(xExpr);
  const yNode = parse(yExpr);
  const dxdt = derivative(xNode, 't');
  const dydt = derivative(yNode, 't');
  const dt = (tMax - tMin) / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const t = tMin + i * dt;
    const w = (i === 0 || i === n) ? 0.5 : 1;
    try {
      const x = xNode.evaluate({ t }) as number;
      const y = yNode.evaluate({ t }) as number;
      const P = PNode.evaluate({ x, y }) as number;
      const Q = QNode.evaluate({ x, y }) as number;
      const dxv = dxdt.evaluate({ t }) as number;
      const dyv = dydt.evaluate({ t }) as number;
      const val = P * dxv + Q * dyv;
      if (isFinite(val)) sum += w * val;
    } catch {
      // 忽略
    }
  }
  return sum * dt;
}

// 格林公式验证：∮(Pdx+Qdy) = ∬(∂Q/∂x - ∂P/∂y) dxdy
// 取单位圆为闭合路径（参数方程 x=cos(t), y=sin(t)），和单位圆区域上的二重积分对比
export function greensFormula(
  PExpr: string, QExpr: string
): { lineIntegral: number; doubleIntegral: number; difference: number } {
  // 线积分：沿单位圆逆时针（t 从 0 到 2π）
  const lineVal = lineIntegralSecondType(PExpr, QExpr, 'cos(t)', 'sin(t)', 0, 2 * Math.PI, 1000);
  // 二重积分：用极坐标 ∫₀²π ∫₀¹ (∂Q/∂x - ∂P/∂y) r dr dθ
  const dQdx = derivative(parse(QExpr), 'x');
  const dPdy = derivative(parse(PExpr), 'y');
  const integrand = (r: number, t: number) => {
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);
    try {
      const a = dQdx.evaluate({ x, y }) as number;
      const b = dPdy.evaluate({ x, y }) as number;
      return (a - b) * r;
    } catch { return 0; }
  };
  let doubleVal = 0;
  const nr = 100, nt = 200;
  const dr = 1 / nr, dt = (2 * Math.PI) / nt;
  for (let i = 0; i <= nr; i++) {
    const r = i * dr;
    const wr = (i === 0 || i === nr) ? 0.5 : 1;
    for (let j = 0; j <= nt; j++) {
      const t = j * dt;
      const wt = (j === 0 || j === nt) ? 0.5 : 1;
      doubleVal += wr * wt * integrand(r, t);
    }
  }
  doubleVal *= dr * dt;
  return {
    lineIntegral: lineVal,
    doubleIntegral: doubleVal,
    difference: Math.abs(lineVal - doubleVal),
  };
}

// 梯度场可视化数据：等高线 + 箭头梯度
export function gradientFieldData(
  expr: string,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  n = 20, arrowScale = 0.3
): {
  x: number[];
  y: number[];
  u: number[];
  v: number[];
  contourX: number[];
  contourY: number[];
  contourZ: number[][];
} {
  const node = parse(expr);
  const dxF = derivative(node, 'x');
  const dyF = derivative(node, 'y');
  const xs: number[] = [];
  const ys: number[] = [];
  const us: number[] = [];
  const vs: number[] = [];
  const dx = (xMax - xMin) / (n - 1);
  const dy = (yMax - yMin) / (n - 1);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = xMin + i * dx;
      const y = yMin + j * dy;
      try {
        const gx = dxF.evaluate({ x, y }) as number;
        const gy = dyF.evaluate({ x, y }) as number;
        xs.push(x);
        ys.push(y);
        const len = Math.sqrt(gx * gx + gy * gy);
        if (len > 1e-10) {
          us.push((gx / len) * arrowScale);
          vs.push((gy / len) * arrowScale);
        } else {
          us.push(0); vs.push(0);
        }
      } catch {
        xs.push(x); ys.push(y); us.push(0); vs.push(0);
      }
    }
  }
  // 等高线网格（更密一点）
  const cn = 60;
  const cdx = (xMax - xMin) / (cn - 1);
  const cdy = (yMax - yMin) / (cn - 1);
  const cx: number[] = [];
  const cy: number[] = [];
  const cz: number[][] = [];
  for (let j = 0; j < cn; j++) {
    cy.push(yMin + j * cdy);
    const row: number[] = [];
    for (let i = 0; i < cn; i++) {
      cx.push(xMin + i * cdx);
      try {
        row.push(node.evaluate({ x: xMin + i * cdx, y: yMin + j * cdy }) as number);
      } catch {
        row.push(NaN);
      }
    }
    cz.push(row);
  }
  return { x: xs, y: ys, u: us, v: vs, contourX: Array.from(new Set(cx)), contourY: cy, contourZ: cz };
}

// 三维向量场的散度和旋度：F = (P, Q, R)
export function divergenceAndCurl(
  PExpr: string, QExpr: string, RExpr: string,
  x: number, y: number, z: number
): { divergence: number; curl: [number, number, number] } {
  const P = parse(PExpr);
  const Q = parse(QExpr);
  const R = parse(RExpr);
  const dPx = derivative(P, 'x').evaluate({ x, y, z }) as number;
  const dQy = derivative(Q, 'y').evaluate({ x, y, z }) as number;
  const dRz = derivative(R, 'z').evaluate({ x, y, z }) as number;
  const divergence = dPx + dQy + dRz;
  const dRy = derivative(R, 'y').evaluate({ x, y, z }) as number;
  const dQz = derivative(Q, 'z').evaluate({ x, y, z }) as number;
  const dPz = derivative(P, 'z').evaluate({ x, y, z }) as number;
  const dRx = derivative(R, 'x').evaluate({ x, y, z }) as number;
  const dPy = derivative(P, 'y').evaluate({ x, y, z }) as number;
  const dQx = derivative(Q, 'x').evaluate({ x, y, z }) as number;
  // curl F = (∂R/∂y - ∂Q/∂z, ∂P/∂z - ∂R/∂x, ∂Q/∂x - ∂P/∂y)
  const curl: [number, number, number] = [
    dRy - dQz,
    dPz - dRx,
    dQx - dPy,
  ];
  return { divergence, curl };
}

// 高斯公式验证（用单位球近似）：∯F·dS = ∭ div F dV
// 简化：用散度在球体上的三重积分数值近似，和球面积分近似对比
export function gaussFormulaVerify(
  PExpr: string, QExpr: string, RExpr: string
): { flux: number; tripleDiv: number; difference: number } {
  // 三重积分（单位球体内）：用球坐标近似
  const P = parse(PExpr);
  const Q = parse(QExpr);
  const R = parse(RExpr);
  const dPx = derivative(P, 'x');
  const dQy = derivative(Q, 'y');
  const dRz = derivative(R, 'z');
  const nr = 20, nt = 30, np = 60;
  const dr = 1 / nr;
  const dt = Math.PI / nt;
  const dp = (2 * Math.PI) / np;
  let tripleDiv = 0;
  for (let i = 0; i <= nr; i++) {
    const r = i * dr;
    const wr = (i === 0 || i === nr) ? 0.5 : 1;
    for (let j = 0; j <= nt; j++) {
      const theta = j * dt;
      const wt = (j === 0 || j === nt) ? 0.5 : 1;
      const sinT = Math.sin(theta);
      for (let k = 0; k <= np; k++) {
        const phi = k * dp;
        const wp = (k === 0 || k === np) ? 0.5 : 1;
        try {
          const x = r * sinT * Math.cos(phi);
          const y = r * sinT * Math.sin(phi);
          const z = r * Math.cos(theta);
          const divV = (
            (dPx.evaluate({ x, y, z }) as number) +
            (dQy.evaluate({ x, y, z }) as number) +
            (dRz.evaluate({ x, y, z }) as number)
          );
          if (isFinite(divV)) tripleDiv += wr * wt * wp * divV * r * r * sinT;
        } catch {
          // 忽略
        }
      }
    }
  }
  tripleDiv *= dr * dt * dp;

  // 通量积分：单位球面 F·n dS，n = (x,y,z)/1，dS = sinθ dθ dφ
  let flux = 0;
  for (let j = 0; j <= nt * 2; j++) {
    const theta = j * (Math.PI / (nt * 2));
    const wt = (j === 0 || j === nt * 2) ? 0.5 : 1;
    const sinT = Math.sin(theta);
    for (let k = 0; k <= np * 2; k++) {
      const phi = k * ((2 * Math.PI) / (np * 2));
      const wp = (k === 0 || k === np * 2) ? 0.5 : 1;
      try {
        const x = sinT * Math.cos(phi);
        const y = sinT * Math.sin(phi);
        const z = Math.cos(theta);
        const Pv = P.evaluate({ x, y, z }) as number;
        const Qv = Q.evaluate({ x, y, z }) as number;
        const Rv = R.evaluate({ x, y, z }) as number;
        const fDotN = Pv * x + Qv * y + Rv * z; // n = (x,y,z) 因为 r=1
        if (isFinite(fDotN)) flux += wt * wp * fDotN * sinT;
      } catch {
        // 忽略
      }
    }
  }
  flux *= (Math.PI / (nt * 2)) * ((2 * Math.PI) / (np * 2));
  return { flux, tripleDiv, difference: Math.abs(flux - tripleDiv) };
}

// 斯托克斯公式验证：∮_C F·dr = ∬_S (curl F)·n dS
// 取 z = 1 - x² - y² 抛物面，边界 C 为 x²+y²=1, z=0 圆
// 简化：用 xy 平面上单位圆区域 + 垂直法向 (0,0,1) 验证
// 这样 Stokes 简化为格林公式
export function stokesFormulaVerify(
  PExpr: string, QExpr: string, RExpr: string
): { lineIntegral: number; surfaceIntegral: number; difference: number } {
  // 线积分：沿单位圆（逆时针，z=0）
  const lineVal = lineIntegralSecondType(PExpr, QExpr, 'cos(t)', 'sin(t)', 0, 2 * Math.PI, 1000);
  // 面积分：(curl F)_z 在单位圆上的积分
  const P = parse(PExpr);
  const Q = parse(QExpr);
  const dQx = derivative(Q, 'x');
  const dPy = derivative(P, 'y');
  // 极坐标下二重积分 ∫(curl F)_z dxdy
  let surfVal = 0;
  const nr = 80, nt = 200;
  const dr = 1 / nr;
  const dt = (2 * Math.PI) / nt;
  for (let i = 0; i <= nr; i++) {
    const r = i * dr;
    const wr = (i === 0 || i === nr) ? 0.5 : 1;
    for (let j = 0; j <= nt; j++) {
      const t = j * dt;
      const wt = (j === 0 || j === nt) ? 0.5 : 1;
      try {
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);
        const z = 0;
        const curlZ = (dQx.evaluate({ x, y, z }) as number) - (dPy.evaluate({ x, y, z }) as number);
        if (isFinite(curlZ)) surfVal += wr * wt * curlZ * r;
      } catch {
        // 忽略
      }
    }
  }
  surfVal *= dr * dt;
  return { lineIntegral: lineVal, surfaceIntegral: surfVal, difference: Math.abs(lineVal - surfVal) };
}

export { evalFunctionAt };

// ============ 函数关键点分析（绘图联动） ============

/**
 * 数值求函数零点（二分法 + 符号变化扫描），最多返回 maxRoots 个
 */
export function findFunctionZeros(expr: string, xMin: number, xMax: number, n = 1000, maxRoots = 10): { x: number; y: number }[] {
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const evalAt = (x: number) => {
    try { return node.evaluate({ x }) as number; } catch { return NaN; }
  };
  const zeros: { x: number; y: number }[] = [];
  const step = (xMax - xMin) / n;
  let prevY = evalAt(xMin);

  for (let i = 1; i <= n && zeros.length < maxRoots; i++) {
    const x = xMin + i * step;
    const y = evalAt(x);
    if (!Number.isFinite(y) || !Number.isFinite(prevY)) { prevY = y; continue; }
    // 符号变化 → 区间内有根
    const hasCrossing = prevY * y < 0;
    const isZero = Math.abs(y) < 1e-12 && prevY !== 0; // 当前点恰好为零点且上一个不是（避免连续重复）
    if (hasCrossing || isZero) {
      // 二分法求精
      let a = x - step, b = x, fa = prevY;
      for (let k = 0; k < 50; k++) {
        const m = (a + b) / 2;
        const fm = evalAt(m);
        if (!Number.isFinite(fm)) break;
        if (Math.abs(fm) < 1e-12 || (b - a) < 1e-10) { a = m; break; }
        if (fa * fm < 0) { b = m; } else { a = m; fa = fm; }
      }
      const rootX = (a + b) / 2;
      // 避免重复根（距离太近）
      if (zeros.length === 0 || Math.abs(rootX - zeros[zeros.length - 1].x) > 1e-4) {
        zeros.push({ x: rootX, y: 0 });
      }
    }
    prevY = y;
  }
  return zeros;
}

/**
 * 计算函数在采样点上的一阶/二阶导数值（数值微分，中心差分）
 */
export function computeDerivativeSamples(expr: string, xMin: number, xMax: number, n = 800): {
  x: number[]; y1: number[]; y2: number[];
} {
  const xs: number[] = [];
  const y1: number[] = []; // 一阶导
  const y2: number[] = []; // 二阶导
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const evalAt = (x: number) => {
    try { return node.evaluate({ x }) as number; } catch { return NaN; }
  };
  const h = Math.max(1e-6, (xMax - xMin) / n * 0.01);
  const step = (xMax - xMin) / (n - 1);
  for (let i = 0; i < n; i++) {
    const x = xMin + i * step;
    xs.push(x);
    const f1 = evalAt(x + h);
    const f_1 = evalAt(x - h);
    const f0 = evalAt(x);
    if (Number.isFinite(f1) && Number.isFinite(f_1)) {
      y1.push((f1 - f_1) / (2 * h));
    } else { y1.push(NaN); }
    if (Number.isFinite(f1) && Number.isFinite(f_1) && Number.isFinite(f0)) {
      y2.push((f1 - 2 * f0 + f_1) / (h * h));
    } else { y2.push(NaN); }
  }
  return { x: xs, y1, y2 };
}

/**
 * 找函数极值点（一阶导过零点 + 二阶导符号判定）
 */
export function findExtrema(expr: string, xMin: number, xMax: number, n = 1000): {
  x: number; y: number; type: 'max' | 'min' | 'saddle';
}[] {
  const { x, y1 } = computeDerivativeSamples(expr, xMin, xMax, n);
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const evalAt = (xv: number) => {
    try { return node.evaluate({ x: xv }) as number; } catch { return NaN; }
  };
  const result: { x: number; y: number; type: 'max' | 'min' | 'saddle' }[] = [];
  for (let i = 1; i < n; i++) {
    if (!Number.isFinite(y1[i]) || !Number.isFinite(y1[i - 1])) continue;
    if (y1[i - 1] * y1[i] < 0) {
      // 一阶导过零，二分求精
      let a = x[i - 1], b = x[i];
      let fa = y1[i - 1];
      for (let k = 0; k < 40; k++) {
        const m = (a + b) / 2;
        // 重算一阶导在 m 处的值
        const h = Math.max(1e-8, (b - a) * 0.01);
        const fm = (evalAt(m + h) - evalAt(m - h)) / (2 * h);
        if (!Number.isFinite(fm)) break;
        if (Math.abs(fm) < 1e-10 || (b - a) < 1e-10) break;
        if (fa * fm < 0) { b = m; } else { a = m; fa = fm; }
      }
      const ex = (a + b) / 2;
      const ey = evalAt(ex);
      if (!Number.isFinite(ey)) continue;
      // 二阶导判定类型
      const h2 = Math.max(1e-6, (xMax - xMin) * 1e-5);
      const fpp = (evalAt(ex + h2) - 2 * ey + evalAt(ex - h2)) / (h2 * h2);
      let type: 'max' | 'min' | 'saddle' = 'saddle';
      if (fpp > 1e-6) type = 'min';
      else if (fpp < -1e-6) type = 'max';
      // 去重
      if (result.length === 0 || Math.abs(ex - result[result.length - 1].x) > 1e-3) {
        result.push({ x: ex, y: ey, type });
      }
    }
  }
  return result;
}

/**
 * 找拐点（二阶导过零点）
 */
export function findInflectionPoints(expr: string, xMin: number, xMax: number, n = 1000): { x: number; y: number }[] {
  const { x, y2 } = computeDerivativeSamples(expr, xMin, xMax, n);
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const evalAt = (xv: number) => {
    try { return node.evaluate({ x: xv }) as number; } catch { return NaN; }
  };
  const result: { x: number; y: number }[] = [];
  for (let i = 1; i < n; i++) {
    if (!Number.isFinite(y2[i]) || !Number.isFinite(y2[i - 1])) continue;
    if (y2[i - 1] * y2[i] < 0) {
      // 二分法求精拐点位置
      let a = x[i - 1], b = x[i];
      let fa = y2[i - 1];
      for (let k = 0; k < 40; k++) {
        const m = (a + b) / 2;
        const h = Math.max(1e-8, (b - a) * 0.01);
        const fm = (evalAt(m + h) - 2 * evalAt(m) + evalAt(m - h)) / (h * h);
        if (!Number.isFinite(fm)) break;
        if (Math.abs(fm) < 1e-10 || (b - a) < 1e-10) break;
        if (fa * fm < 0) { b = m; } else { a = m; fa = fm; }
      }
      const ix = (a + b) / 2;
      const iy = evalAt(ix);
      if (!Number.isFinite(iy)) continue;
      if (result.length === 0 || Math.abs(ix - result[result.length - 1].x) > 1e-3) {
        result.push({ x: ix, y: iy });
      }
    }
  }
  return result;
}

/**
 * Y 轴截距：f(0)
 */
export function findYIntercept(expr: string): { x: number; y: number } | null {
  try {
    const norm = normalizeMathInput(expr);
    const y = evaluate(norm, { x: 0 }) as number;
    if (typeof y === 'number' && Number.isFinite(y)) return { x: 0, y };
    return null;
  } catch {
    return null;
  }
}

/**
 * 求两函数交点（f(x) - g(x) = 0 的根）
 */
export function findIntersections(exprF: string, exprG: string, xMin: number, xMax: number, n = 1000, maxPoints = 8): { x: number; y: number }[] {
  const diffExpr = `(${exprF}) - (${exprG})`;
  const zeros = findFunctionZeros(diffExpr, xMin, xMax, n, maxPoints);
  const norm = normalizeMathInput(exprF);
  const node = parse(norm);
  return zeros.map((z) => {
    try {
      const y = node.evaluate({ x: z.x }) as number;
      return { x: z.x, y: Number.isFinite(y) ? y : 0 };
    } catch {
      return { x: z.x, y: 0 };
    }
  });
}

/**
 * 数值定积分（辛普森法），返回积分值
 */
export function computeDefiniteIntegral(expr: string, a: number, b: number, n = 2000): number {
  const norm = normalizeMathInput(expr);
  const node = parse(norm);
  const evalAt = (x: number) => {
    try { return node.evaluate({ x }) as number; } catch { return NaN; }
  };
  // 保证 n 为偶数
  const steps = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / steps;
  let sum = evalAt(a) + evalAt(b);
  if (!Number.isFinite(sum)) return NaN;
  for (let i = 1; i < steps; i++) {
    const x = a + i * h;
    const y = evalAt(x);
    if (!Number.isFinite(y)) continue;
    sum += (i % 2 === 1 ? 4 : 2) * y;
  }
  return (h / 3) * sum;
}
