// ============ 数值分析高级方法 ============

import { parse } from 'mathjs';

/**
 * 牛顿插值多项式 — 差商表法
 * 输入点列 xs, ys，返回差商表 + 插值多项式表达式（牛顿形式）
 */
export function newtonInterpolation(xs: number[], ys: number[]): {
  dividedDifferences: number[][];
  polynomial: string;
  evaluate: (x: number) => number;
} {
  const n = xs.length;
  // 差商表：dd[i][j] = f[x_{i}, x_{i+1}, ..., x_{i+j}]
  const dd: number[][] = [];
  for (let i = 0; i < n; i++) {
    dd[i] = [ys[i]];
  }
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      dd[i][j] = (dd[i + 1][j - 1] - dd[i][j - 1]) / (xs[i + j] - xs[i]);
    }
  }

  // 生成牛顿插值多项式表达式
  let polyStr = `${dd[0][0].toFixed(6)}`;
  for (let j = 1; j < n; j++) {
    const coeff = dd[0][j];
    if (Math.abs(coeff) < 1e-12) continue;
    let term = coeff >= 0 ? ' + ' : ' - ';
    term += Math.abs(coeff).toFixed(6);
    for (let k = 0; k < j; k++) {
      const xk = xs[k];
      if (xk === 0) term += '·x';
      else if (xk > 0) term += `·(x-${xk.toFixed(2)})`;
      else term += `·(x+${Math.abs(xk).toFixed(2)})`;
    }
    polyStr += term;
  }

  // 求值函数
  function evalAt(x: number): number {
    let result = dd[0][0];
    let product = 1;
    for (let j = 1; j < n; j++) {
      product *= (x - xs[j - 1]);
      result += dd[0][j] * product;
    }
    return result;
  }

  return { dividedDifferences: dd, polynomial: polyStr, evaluate: evalAt };
}

/**
 * 埃尔米特插值 — 两点三次 Hermite 插值
 * 输入 (x0,y0,m0), (x1,y1,m1)，其中 m 为导数值
 */
export function hermiteInterpolation(
  x0: number, y0: number, m0: number,
  x1: number, y1: number, m1: number
): {
  polynomial: string;
  evaluate: (x: number) => number;
} {
  function evalAt(x: number): number {
    const h = x1 - x0;
    const t = (x - x0) / h;
    // 基函数 α0, α1, β0, β1
    const a0 = (1 + 2 * t) * (1 - t) ** 2;
    const a1 = (3 - 2 * t) * t ** 2;
    const b0 = t * (1 - t) ** 2 * h;
    const b1 = -((1 - t) * t ** 2) * h;
    return a0 * y0 + a1 * y1 + b0 * m0 + b1 * m1;
  }

  const polyStr = `H₃(x) = α₀(x)·y₀ + α₁(x)·y₁ + β₀(x)·m₀ + β₁(x)·m₁
其中 α₀ = (1+2t)(1-t)², α₁ = (3-2t)t², β₀ = t(1-t)²·h, β₁ = -(1-t)t²·h
t = (x-${x0})/(${x1 - x0})`;

  return { polynomial: polyStr, evaluate: evalAt };
}

/**
 * 三次样条插值（自然样条，边界条件 S''(x0)=0, S''(xn)=0）
 * 输入点列，返回分段三次多项式系数 + 求值函数
 */
export function cubicSplineNatural(xs: number[], ys: number[]): {
  segments: { a: number; b: number; c: number; d: number; x: number }[];
  evaluate: (x: number) => number;
} {
  const n = xs.length - 1;
  const h: number[] = [];
  for (let i = 0; i < n; i++) h[i] = xs[i + 1] - xs[i];

  // 三弯矩方程，M 为二阶导数值
  // 自然样条：M0 = Mn = 0
  const A: number[] = new Array(n + 1).fill(0); // 下对角
  const B: number[] = new Array(n + 1).fill(0); // 主对角
  const C: number[] = new Array(n + 1).fill(0); // 上对角
  const D: number[] = new Array(n + 1).fill(0); // 右端

  for (let i = 1; i < n; i++) {
    A[i] = h[i - 1];
    B[i] = 2 * (h[i - 1] + h[i]);
    C[i] = h[i];
    D[i] = 6 * ((ys[i + 1] - ys[i]) / h[i] - (ys[i] - ys[i - 1]) / h[i - 1]);
  }

  // 自然边界
  B[0] = 1; C[0] = 0; D[0] = 0;
  B[n] = 1; A[n] = 0; D[n] = 0;

  // 追赶法解三对角方程组
  const M: number[] = new Array(n + 1).fill(0);
  const alpha: number[] = new Array(n + 1).fill(0);
  const beta: number[] = new Array(n + 1).fill(0);
  alpha[0] = B[0]; beta[0] = D[0];
  for (let i = 1; i <= n; i++) {
    const m = A[i] / alpha[i - 1];
    alpha[i] = B[i] - m * C[i - 1];
    beta[i] = D[i] - m * beta[i - 1];
  }
  M[n] = beta[n] / alpha[n];
  for (let i = n - 1; i >= 0; i--) {
    M[i] = (beta[i] - C[i] * M[i + 1]) / alpha[i];
  }

  // 分段三次多项式系数
  const segments: { a: number; b: number; c: number; d: number; x: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = ys[i];
    const b = (ys[i + 1] - ys[i]) / h[i] - h[i] * (2 * M[i] + M[i + 1]) / 6;
    const c = M[i] / 2;
    const d = (M[i + 1] - M[i]) / (6 * h[i]);
    segments.push({ a, b, c, d, x: xs[i] });
  }

  function evalAt(x: number): number {
    if (x <= xs[0]) {
      const s = segments[0];
      const t = x - s.x;
      return s.a + s.b * t + s.c * t * t + s.d * t * t * t;
    }
    if (x >= xs[n]) {
      const s = segments[n - 1];
      const t = x - s.x;
      return s.a + s.b * t + s.c * t * t + s.d * t * t * t;
    }
    // 二分查找
    let lo = 0, hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] <= x) lo = mid + 1; else hi = mid;
    }
    const idx = lo - 1;
    const s = segments[idx];
    const t = x - s.x;
    return s.a + s.b * t + s.c * t * t + s.d * t * t * t;
  }

  return { segments, evaluate: evalAt };
}

/**
 * 最小二乘曲线拟合
 * type: 'linear' (一次), 'quadratic' (二次), 'exponential' (指数 y=ae^(bx))
 * 返回系数 + 误差平方和
 */
export function leastSquaresFit(xs: number[], ys: number[], type: 'linear' | 'quadratic' | 'exponential'): {
  coefficients: number[];
  formula: string;
  error: number;
  evaluate: (x: number) => number;
} {
  const n = xs.length;
  let coeffs: number[] = [];
  let formula = '';
  let evalFn: (x: number) => number = () => 0;

  if (type === 'linear') {
    // y = ax + b
    let sx = 0, sy = 0, sxy = 0, sx2 = 0;
    for (let i = 0; i < n; i++) {
      sx += xs[i];
      sy += ys[i];
      sxy += xs[i] * ys[i];
      sx2 += xs[i] * xs[i];
    }
    const a = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const b = (sy - a * sx) / n;
    coeffs = [a, b];
    formula = `y = ${a.toFixed(6)}x + ${b.toFixed(6)}`;
    evalFn = (x) => a * x + b;
  } else if (type === 'quadratic') {
    // y = ax² + bx + c，解正规方程组
    // [Σx⁴ Σx³ Σx²][a]   [Σx²y]
    // [Σx³ Σx² Σx ][b] = [Σxy ]
    // [Σx² Σx  n  ][c]   [Σy  ]
    let sx = 0, sx2 = 0, sx3 = 0, sx4 = 0;
    let sy = 0, sxy = 0, sx2y = 0;
    for (let i = 0; i < n; i++) {
      const x = xs[i], y = ys[i];
      const x2 = x * x, x3 = x2 * x, x4 = x2 * x2;
      sx += x; sx2 += x2; sx3 += x3; sx4 += x4;
      sy += y; sxy += x * y; sx2y += x2 * y;
    }
    // 3x3 线性方程组
    const A = [[sx4, sx3, sx2], [sx3, sx2, sx], [sx2, sx, n]];
    const B = [sx2y, sxy, sy];
    const x = solve3x3(A, B);
    coeffs = x;
    formula = `y = ${x[0].toFixed(6)}x² + ${x[1].toFixed(6)}x + ${x[2].toFixed(6)}`;
    evalFn = (xv) => x[0] * xv * xv + x[1] * xv + x[2];
  } else {
    // y = a·e^(bx)，取对数得 ln y = ln a + b·x
    const lnYs = ys.map((y) => {
      if (y <= 0) throw new Error('指数拟合要求所有 y > 0');
      return Math.log(y);
    });
    let sx = 0, sLny = 0, sxy = 0, sx2 = 0;
    for (let i = 0; i < n; i++) {
      sx += xs[i];
      sLny += lnYs[i];
      sxy += xs[i] * lnYs[i];
      sx2 += xs[i] * xs[i];
    }
    const b = (n * sxy - sx * sLny) / (n * sx2 - sx * sx);
    const lnA = (sLny - b * sx) / n;
    const a = Math.exp(lnA);
    coeffs = [a, b];
    formula = `y = ${a.toFixed(6)} · e^(${b.toFixed(6)}x)`;
    evalFn = (x) => a * Math.exp(b * x);
  }

  // 计算误差平方和
  let err = 0;
  for (let i = 0; i < n; i++) {
    const dy = ys[i] - evalFn(xs[i]);
    err += dy * dy;
  }

  return { coefficients: coeffs, formula, error: err, evaluate: evalFn };
}

// 辅助：解 3x3 线性方程组（高斯消元）
function solve3x3(A: number[][], B: number[]): number[] {
  const M = A.map((row, i) => [...row, B[i]]);
  for (let i = 0; i < 3; i++) {
    // 选主元
    let maxRow = i;
    for (let k = i + 1; k < 3; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    }
    [M[i], M[maxRow]] = [M[maxRow], M[i]];
    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-14) throw new Error('矩阵奇异');
    for (let j = i; j <= 3; j++) M[i][j] /= pivot;
    for (let k = 0; k < 3; k++) {
      if (k === i) continue;
      const factor = M[k][i];
      for (let j = i; j <= 3; j++) M[k][j] -= factor * M[i][j];
    }
  }
  return [M[0][3], M[1][3], M[2][3]];
}

/**
 * 勒让德多项式生成
 * P₀ = 1, P₁ = x, (n+1)P_{n+1} = (2n+1)x·P_n - n·P_{n-1}
 */
export function legendrePolynomial(n: number): {
  coefficients: number[];  // 从最高次到常数项
  formula: string;
  evaluate: (x: number) => number;
} {
  if (n === 0) return { coefficients: [1], formula: 'P₀(x) = 1', evaluate: () => 1 };
  if (n === 1) return { coefficients: [1, 0], formula: 'P₁(x) = x', evaluate: (x) => x };

  // 用递推关系计算系数
  let prev = [1];          // P0: [1]
  let curr = [1, 0];       // P1: [x]
  for (let k = 1; k < n; k++) {
    const next = new Array(k + 2).fill(0);
    // (2k+1)x·P_k
    for (let i = 0; i <= k; i++) {
      next[i] += (2 * k + 1) * curr[i];
    }
    // -k·P_{k-1}
    for (let i = 0; i <= k - 1; i++) {
      next[i + 2] -= k * prev[i];
    }
    // 除以 (k+1)
    for (let i = 0; i <= k + 1; i++) {
      next[i] /= (k + 1);
    }
    prev = curr;
    curr = next;
  }

  const formula = `P_${n}(x) = ${curr.map((c, i) => {
    const deg = curr.length - 1 - i;
    if (Math.abs(c) < 1e-12) return '';
    const sign = c >= 0 ? '+' : '-';
    const absC = Math.abs(c).toFixed(4);
    let term = `${sign} ${absC}`;
    if (deg > 0) term += deg === 1 ? '·x' : `·x^${deg}`;
    return term;
  }).filter(Boolean).join(' ').replace(/^\+ /, '')}`;

  function evalAt(x: number): number {
    let p0 = 1, p1 = x;
    for (let k = 1; k < n; k++) {
      const p2 = ((2 * k + 1) * x * p1 - k * p0) / (k + 1);
      p0 = p1; p1 = p2;
    }
    return p1;
  }

  return { coefficients: curr, formula, evaluate: evalAt };
}

/**
 * 切比雪夫多项式（第一类）
 * T₀ = 1, T₁ = x, T_{n+1} = 2x·T_n - T_{n-1}
 */
export function chebyshevPolynomial(n: number): {
  coefficients: number[];
  formula: string;
  evaluate: (x: number) => number;
  roots: number[];
} {
  if (n === 0) return { coefficients: [1], formula: 'T₀(x) = 1', evaluate: () => 1, roots: [] };
  if (n === 1) return { coefficients: [1, 0], formula: 'T₁(x) = x', evaluate: (x) => x, roots: [0] };

  let prev = [1];
  let curr = [1, 0];
  for (let k = 1; k < n; k++) {
    const next = new Array(k + 2).fill(0);
    // 2x·T_k
    for (let i = 0; i <= k; i++) next[i] += 2 * curr[i];
    // -T_{k-1}
    for (let i = 0; i <= k - 1; i++) next[i + 2] -= prev[i];
    prev = curr; curr = next;
  }

  const formula = `T_${n}(x) = ${curr.map((c, i) => {
    const deg = curr.length - 1 - i;
    if (Math.abs(c) < 1e-12) return '';
    const sign = c >= 0 ? '+' : '-';
    const absC = Math.abs(c).toFixed(0);
    let term = `${sign} ${absC === '1' && deg > 0 ? '' : absC}`;
    if (deg > 0) term += deg === 1 ? 'x' : `x^${deg}`;
    return term;
  }).filter(Boolean).join(' ').replace(/^\+ /, '')}`;

  function evalAt(x: number): number {
    return Math.cos(n * Math.acos(x));
  }

  // 零点：x_k = cos((2k-1)π/(2n)), k=1..n
  const roots: number[] = [];
  for (let k = 1; k <= n; k++) {
    roots.push(Math.cos((2 * k - 1) * Math.PI / (2 * n)));
  }

  return { coefficients: curr, formula, evaluate: evalAt, roots };
}

/**
 * 高斯-勒让德求积
 * n 点 Gauss-Legendre 公式（支持 2, 3, 5 点）
 * ∫_{-1}^{1} f(x)dx ≈ Σ w_i·f(x_i)
 * 任意区间 [a,b] 通过变量替换 x = (b-a)/2 · t + (a+b)/2
 */
export function gaussLegendreQuadrature(expr: string, a: number, b: number, nPoints: number): {
  nodes: number[];
  weights: number[];
  result: number;
} {
  // 标准 Gauss-Legendre 节点和权重（[-1, 1] 区间）
  const table: Record<number, { x: number[]; w: number[] }> = {
    2: { x: [-1 / Math.sqrt(3), 1 / Math.sqrt(3)], w: [1, 1] },
    3: { x: [-Math.sqrt(3 / 5), 0, Math.sqrt(3 / 5)], w: [5 / 9, 8 / 9, 5 / 9] },
    5: {
      x: [
        -Math.sqrt(5 + 2 * Math.sqrt(10 / 7)) / 3,
        -Math.sqrt(5 - 2 * Math.sqrt(10 / 7)) / 3,
        0,
        Math.sqrt(5 - 2 * Math.sqrt(10 / 7)) / 3,
        Math.sqrt(5 + 2 * Math.sqrt(10 / 7)) / 3,
      ],
      w: [
        (322 - 13 * Math.sqrt(70)) / 900,
        (322 + 13 * Math.sqrt(70)) / 900,
        128 / 225,
        (322 + 13 * Math.sqrt(70)) / 900,
        (322 - 13 * Math.sqrt(70)) / 900,
      ],
    },
  };

  const data = table[nPoints] || table[5];
  const node = parse(expr);
  const half = (b - a) / 2;
  const mid = (a + b) / 2;

  let result = 0;
  const nodes: number[] = [];
  for (let i = 0; i < data.x.length; i++) {
    const x = half * data.x[i] + mid;
    nodes.push(x);
    try {
      const y = node.evaluate({ x }) as number;
      if (isFinite(y)) result += data.w[i] * y;
    } catch { /* skip */ }
  }
  result *= half;

  return { nodes, weights: data.w.map((w) => w * half), result };
}

/**
 * 龙贝格（Romberg）积分
 * 基于梯形法递推 + 理查森外推
 * 返回 Romberg 表 + 最终结果
 */
export function rombergIntegration(expr: string, a: number, b: number, maxIter: number = 10, tol: number = 1e-10): {
  table: number[][];
  result: number;
  iterations: number;
} {
  const node = parse(expr);
  const f = (x: number) => {
    try { return node.evaluate({ x }) as number; } catch { return NaN; }
  };

  // R[i][j] = Romberg 表第 i 行第 j 列
  const R: number[][] = [];
  // 初始梯形法（n=1）
  const fa = f(a), fb = f(b);
  R[0] = [(b - a) / 2 * (fa + fb)];

  for (let i = 1; i < maxIter; i++) {
    const n = 1 << i; // 2^i 个子区间
    const h = (b - a) / n;
    // 新增点的函数值和
    let sum = 0;
    for (let k = 1; k < n; k += 2) {
      const y = f(a + k * h);
      if (isFinite(y)) sum += y;
    }
    // R[i][0] = R[i-1][0]/2 + h*sum （梯形法递推）
    R[i] = [R[i - 1][0] / 2 + h * sum];

    // 外推
    for (let j = 1; j <= i; j++) {
      const factor = Math.pow(4, j);
      R[i][j] = (factor * R[i][j - 1] - R[i - 1][j - 1]) / (factor - 1);
    }

    // 收敛判断
    if (Math.abs(R[i][i] - R[i - 1][i - 1]) < tol * Math.abs(R[i][i])) {
      return { table: R, result: R[i][i], iterations: i };
    }
  }

  return { table: R, result: R[maxIter - 1][maxIter - 1], iterations: maxIter };
}

/**
 * 雅可比迭代法解线性方程组 Ax=b
 */
export function jacobiIteration(
  A: number[][], b: number[], x0: number[], tol: number = 1e-8, maxIter: number = 1000
): { solution: number[]; iterations: number; converged: boolean; history: number[][] } {
  const n = A.length;
  let x = [...x0];
  const history: number[][] = [[...x]];

  for (let k = 0; k < maxIter; k++) {
    const xNew = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) sum += A[i][j] * x[j];
      }
      if (Math.abs(A[i][i]) < 1e-14) throw new Error('对角线元素为零，雅可比迭代不适用');
      xNew[i] = (b[i] - sum) / A[i][i];
    }

    history.push([...xNew]);

    // 收敛判断
    let err = 0;
    for (let i = 0; i < n; i++) err = Math.max(err, Math.abs(xNew[i] - x[i]));
    x = xNew;
    if (err < tol) return { solution: x, iterations: k + 1, converged: true, history };
  }

  return { solution: x, iterations: maxIter, converged: false, history };
}

/**
 * 高斯-赛德尔迭代法
 */
export function gaussSeidelIteration(
  A: number[][], b: number[], x0: number[], tol: number = 1e-8, maxIter: number = 1000
): { solution: number[]; iterations: number; converged: boolean; history: number[][] } {
  const n = A.length;
  let x = [...x0];
  const history: number[][] = [[...x]];

  for (let k = 0; k < maxIter; k++) {
    const xOld = [...x];
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) sum += A[i][j] * x[j];
      }
      if (Math.abs(A[i][i]) < 1e-14) throw new Error('对角线元素为零，高斯-赛德尔迭代不适用');
      x[i] = (b[i] - sum) / A[i][i];
    }

    history.push([...x]);

    let err = 0;
    for (let i = 0; i < n; i++) err = Math.max(err, Math.abs(x[i] - xOld[i]));
    if (err < tol) return { solution: x, iterations: k + 1, converged: true, history };
  }

  return { solution: x, iterations: maxIter, converged: false, history };
}

/**
 * 幂法求最大特征值（按模最大）
 */
export function powerMethod(
  A: number[][], x0: number[], tol: number = 1e-8, maxIter: number = 1000
): { eigenvalue: number; eigenvector: number[]; iterations: number; converged: boolean } {
  const n = A.length;
  let x = [...x0];
  // 归一化
  let norm = Math.sqrt(x.reduce((s, v) => s + v * v, 0));
  if (norm === 0) x = x.map(() => 1);
  norm = Math.sqrt(x.reduce((s, v) => s + v * v, 0));
  x = x.map((v) => v / norm);

  let lambda = 0;
  for (let k = 0; k < maxIter; k++) {
    // y = A·x
    const y: number[] = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        y[i] += A[i][j] * x[j];
      }
    }
    // 计算新特征值（Rayleigh 商）
    let newLambda = 0, normY = 0;
    for (let i = 0; i < n; i++) {
      newLambda += x[i] * y[i];
      normY += y[i] * y[i];
    }
    normY = Math.sqrt(normY);
    if (normY === 0) return { eigenvalue: 0, eigenvector: x, iterations: k, converged: true };

    // 归一化 y
    const xNew = y.map((v) => v / normY);

    if (Math.abs(newLambda - lambda) < tol * Math.abs(newLambda)) {
      return { eigenvalue: newLambda, eigenvector: xNew, iterations: k + 1, converged: true };
    }
    lambda = newLambda;
    x = xNew;
  }

  return { eigenvalue: lambda, eigenvector: x, iterations: maxIter, converged: false };
}

/**
 * 反幂法求最小特征值（按模最小）
 */
export function inversePowerMethod(
  A: number[][], x0: number[], tol: number = 1e-8, maxIter: number = 1000
): { eigenvalue: number; eigenvector: number[]; iterations: number; converged: boolean } {
  const n = A.length;
  // 对 A 做 LU 分解（高斯消元）
  // 简化实现：每次迭代解线性方程组 Ax = y
  function solveLinearSystem(B: number[][], rhs: number[]): number[] {
    // 深拷贝
    const M = B.map((row) => [...row]);
    const bb = [...rhs];
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
      }
      [M[i], M[maxRow]] = [M[maxRow], M[i]];
      [bb[i], bb[maxRow]] = [bb[maxRow], bb[i]];
      const pivot = M[i][i];
      if (Math.abs(pivot) < 1e-14) throw new Error('矩阵奇异');
      for (let j = i; j < n; j++) M[i][j] /= pivot;
      bb[i] /= pivot;
      for (let k = i + 1; k < n; k++) {
        const factor = M[k][i];
        for (let j = i; j < n; j++) M[k][j] -= factor * M[i][j];
        bb[k] -= factor * bb[i];
      }
    }
    // 回代
    const x = new Array(n).fill(0);
    x[n - 1] = bb[n - 1];
    for (let i = n - 2; i >= 0; i--) {
      let s = bb[i];
      for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = s;
    }
    return x;
  }

  let x = [...x0];
  let norm = Math.sqrt(x.reduce((s, v) => s + v * v, 0));
  if (norm === 0) x = x.map(() => 1);
  norm = Math.sqrt(x.reduce((s, v) => s + v * v, 0));
  x = x.map((v) => v / norm);

  let mu = 0;
  for (let k = 0; k < maxIter; k++) {
    const y = solveLinearSystem(A, x);
    // Rayleigh 商：mu = (x, y)/ (x, x) = (x, y) （因为 x 已归一化）
    let newMu = 0, normY = 0;
    for (let i = 0; i < n; i++) {
      newMu += x[i] * y[i];
      normY += y[i] * y[i];
    }
    normY = Math.sqrt(normY);
    if (normY === 0) return { eigenvalue: 0, eigenvector: x, iterations: k, converged: true };

    const xNew = y.map((v) => v / normY);

    if (Math.abs(1 / newMu - 1 / mu) < tol * Math.abs(1 / mu)) {
      return { eigenvalue: 1 / newMu, eigenvector: xNew, iterations: k + 1, converged: true };
    }
    mu = newMu;
    x = xNew;
  }

  return { eigenvalue: 1 / mu, eigenvector: x, iterations: maxIter, converged: false };
}

/**
 * QR 算法求全部特征值（实矩阵，简化版：仅上 Hessenberg 化 + QR 迭代）
 * 对小规模矩阵（n ≤ 10）有效
 */
export function qrEigenvalues(A: number[][], maxIter: number = 200, tol: number = 1e-10): number[] {
  const n = A.length;
  if (n === 1) return [A[0][0]];
  if (n === 2) {
    const tr = A[0][0] + A[1][1];
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    const disc = tr * tr - 4 * det;
    if (disc >= 0) return [(tr + Math.sqrt(disc)) / 2, (tr - Math.sqrt(disc)) / 2];
    return [tr / 2, tr / 2]; // 复数仅返回复部为零（简化）
  }

  // 复制矩阵
  let M = A.map((row) => [...row]);

  // QR 迭代
  for (let iter = 0; iter < maxIter; iter++) {
    // 检查是否已收敛为上三角（或近似）
    let converged = true;
    for (let i = 1; i < n; i++) {
      if (Math.abs(M[i][i - 1]) > tol) { converged = false; break; }
    }
    if (converged) break;

    // Gram-Schmidt QR 分解
    const Q: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    const R: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

    for (let j = 0; j < n; j++) {
      // v = 第 j 列
      const v: number[] = new Array(n).fill(0);
      for (let i = 0; i < n; i++) v[i] = M[i][j];
      for (let k = 0; k < j; k++) {
        let dot = 0;
        for (let i = 0; i < n; i++) dot += Q[i][k] * v[i];
        R[k][j] = dot;
        for (let i = 0; i < n; i++) v[i] -= dot * Q[i][k];
      }
      let norm = Math.sqrt(v.reduce((s, val) => s + val * val, 0));
      if (norm < 1e-14) norm = 1;
      R[j][j] = norm;
      for (let i = 0; i < n; i++) Q[i][j] = v[i] / norm;
    }

    // A_{k+1} = R·Q
    const Mnew: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let k = 0; k < n; k++) s += R[i][k] * Q[k][j];
        Mnew[i][j] = s;
      }
    }
    M = Mnew;
  }

  // 提取对角线为特征值（近似）
  return M.map((_, i) => M[i][i]);
}

/**
 * 弦截法（割线法）求根
 */
export function secantMethod(
  expr: string, x0: number, x1: number, tol: number = 1e-10, maxIter: number = 100
): { root: number | null; iterations: number; history: number[] } {
  const node = parse(expr);
  const f = (x: number) => {
    try { return node.evaluate({ x }) as number; } catch { return NaN; }
  };

  const history = [x0, x1];
  let a = x0, b = x1;
  let fa = f(a);

  for (let i = 0; i < maxIter; i++) {
    const fb = f(b);
    if (Math.abs(fb) < tol) return { root: b, iterations: i + 1, history };
    if (Math.abs(fb - fa) < 1e-14) return { root: null, iterations: i + 1, history };
    const c = b - fb * (b - a) / (fb - fa);
    history.push(c);
    a = b; fa = fb; b = c;
    if (Math.abs(b - a) < tol * Math.abs(b)) return { root: b, iterations: i + 1, history };
  }
  return { root: b, iterations: maxIter, history };
}

/**
 * 不动点迭代 x = g(x)
 */
export function fixedPointIteration(
  gExpr: string, x0: number, tol: number = 1e-10, maxIter: number = 100
): { root: number | null; iterations: number; converged: boolean; history: number[] } {
  const node = parse(gExpr);
  const g = (x: number) => {
    try { return node.evaluate({ x }) as number; } catch { return NaN; }
  };

  const history = [x0];
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const xNew = g(x);
    if (!isFinite(xNew)) return { root: null, iterations: i + 1, converged: false, history };
    history.push(xNew);
    if (Math.abs(xNew - x) < tol * (1 + Math.abs(xNew))) {
      return { root: xNew, iterations: i + 1, converged: true, history };
    }
    x = xNew;
  }
  return { root: x, iterations: maxIter, converged: false, history };
}

/**
 * 牛顿-科茨求积公式
 * n = 1: 梯形公式 (2点, 1次代数精度)
 * n = 2: 辛普森公式 (3点, 3次)
 * n = 3: 辛普森3/8公式 (4点, 3次)
 * n = 4: 柯茨公式 (5点, 5次)
 * 系数基于 ∫_0^1 Π... 计算的 Cotes 系数（整数形式）
 */
export function newtonCotesQuadrature(
  expr: string, a: number, b: number, n: number
): { value: number; formula: string; degree: number } {
  // 限制 n 范围
  if (n < 1) n = 1;
  if (n > 4) n = 4;

  const node = parse(expr);
  const f = (x: number) => {
    try { return node.evaluate({ x }) as number; } catch { return NaN; }
  };

  const h = (b - a) / n;
  let value = 0;
  let formula = '';
  let degree = 1;

  // Newton-Cotes 系数（Cotes 数 × n）
  const cotesCoeffs: Record<number, number[]> = {
    1: [1, 1],                                      // 梯形
    2: [1, 4, 1],                                   // 辛普森
    3: [1, 3, 3, 1],                                // Simpson 3/8
    4: [7, 32, 12, 32, 7],                          // Cotes
  };
  const cotesSum: Record<number, number> = { 1: 2, 2: 6, 3: 8, 4: 90 };
  const degrees: Record<number, number> = { 1: 1, 2: 3, 3: 3, 4: 5 };

  const coeffs = cotesCoeffs[n];
  const sum = cotesSum[n];
  degree = degrees[n];
  formula = n === 1 ? '梯形公式 (n=1)' : n === 2 ? '辛普森公式 (n=2)' : n === 3 ? '辛普森3/8公式 (n=3)' : '柯茨公式 (n=4)';

  for (let i = 0; i <= n; i++) {
    const xi = a + i * h;
    value += coeffs[i] * f(xi);
  }
  value = value * (b - a) / sum;

  return { value, formula, degree };
}

/**
 * 数值微分
 * type: forward (前向差商) / central (中心差商) / three-point (三点公式)
 */
export function numericalDerivative(
  expr: string, x0: number, h: number, type: 'forward' | 'central' | 'three-point'
): { value: number; formula: string; error: string } {
  const node = parse(expr);
  const f = (x: number) => {
    try { return node.evaluate({ x }) as number; } catch { return NaN; }
  };

  let value = 0;
  let formula = '';
  let error = '';

  if (type === 'forward') {
    value = (f(x0 + h) - f(x0)) / h;
    formula = `f'(x₀) ≈ [f(x₀+h) - f(x₀)] / h`;
    error = 'O(h)（截断误差一阶）';
  } else if (type === 'central') {
    value = (f(x0 + h) - f(x0 - h)) / (2 * h);
    formula = `f'(x₀) ≈ [f(x₀+h) - f(x₀-h)] / (2h)`;
    error = 'O(h²)（截断误差二阶，精度更高）';
  } else {
    // 三点公式（等距三点，端点公式）
    const f0 = f(x0 - h), f1 = f(x0), f2 = f(x0 + h);
    value = (-3 * f0 + 4 * f1 - f2) / (2 * h); // 端点三点公式
    formula = `f'(x₀) ≈ [-3f(x₀-h) + 4f(x₀) - f(x₀+h)] / (2h)`;
    error = 'O(h²)（三点端点公式，二阶精度）';
  }

  return { value, formula, error };
}

/**
 * SOR 超松弛迭代法解线性方程组 Ax = b
 * ω = 1 退化为高斯-赛德尔；ω < 1 低松弛；ω > 1 超松弛
 */
export function sorIteration(
  A: number[][], b: number[], omega: number,
  x0?: number[], tol: number = 1e-10, maxIter: number = 500
): { solution: number[] | null; iterations: number; converged: boolean; history: number[][] } {
  const n = A.length;
  const x = x0 ? [...x0] : new Array(n).fill(0);
  const history: number[][] = [[...x]];

  for (let k = 0; k < maxIter; k++) {
    let maxDiff = 0;
    for (let i = 0; i < n; i++) {
      let sum1 = 0, sum2 = 0;
      for (let j = 0; j < i; j++) sum1 += A[i][j] * x[j];
      for (let j = i + 1; j < n; j++) sum2 += A[i][j] * x[j];
      const xi = (1 - omega) * x[i] + omega * (b[i] - sum1 - sum2) / A[i][i];
      maxDiff = Math.max(maxDiff, Math.abs(xi - x[i]));
      x[i] = xi;
    }
    history.push([...x]);
    if (maxDiff < tol) {
      return { solution: x, iterations: k + 1, converged: true, history };
    }
  }
  return { solution: x, iterations: maxIter, converged: false, history };
}

/**
 * 误差分析
 * 计算绝对误差、相对误差、有效数字位数
 */
export function errorAnalysis(
  approximate: number, exact: number
): { absError: number; relError: number; significantDigits: number; hint: string } {
  const absError = Math.abs(approximate - exact);
  const relError = exact !== 0 ? absError / Math.abs(exact) : (absError === 0 ? 0 : Infinity);

  // 有效数字位数：若相对误差 ≤ 0.5×10^{-n}，则至少 n 位有效数字
  let significantDigits = 0;
  if (absError === 0) {
    significantDigits = 15; // 完全相等
  } else if (exact !== 0 && isFinite(relError)) {
    significantDigits = Math.floor(-Math.log10(2 * relError));
    significantDigits = Math.max(0, significantDigits);
  }

  const hint = `绝对误差 = |近似值 - 真值| = ${absError.toExponential(6)}\n相对误差 = 绝对误差 / |真值| = ${relError.toExponential(6)}\n有效数字 ≈ ${significantDigits} 位（当相对误差 ≤ 0.5×10^{-n} 时至少 n 位有效数字）`;

  return { absError, relError, significantDigits, hint };
}

/**
 * 秦九韶算法（霍纳法则）
 * 计算多项式 P(x) = a_n·x^n + ... + a_1·x + a_0
 * 形式：P(x) = (...((a_n·x) + a_{n-1})·x + ...)·x + a_0
 * 系数数组 coeffs 从高次到低次：[a_n, a_{n-1}, ..., a_1, a_0]
 */
export function hornerScheme(
  coeffs: number[], x: number
): { value: number; steps: { k: number; intermediate: number }[] } {
  const steps: { k: number; intermediate: number }[] = [];
  let v = coeffs[0];
  steps.push({ k: coeffs.length - 1, intermediate: v });

  for (let i = 1; i < coeffs.length; i++) {
    v = v * x + coeffs[i];
    steps.push({ k: coeffs.length - 1 - i, intermediate: v });
  }

  return { value: v, steps };
}
