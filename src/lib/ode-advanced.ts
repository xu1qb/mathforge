// ============ ODE 解析解与高级数值方法 ============

import { parse } from 'mathjs';

/**
 * 可分离变量方程 dy/dx = f(x)·g(y)
 * 识别模式：右侧表达式能否分解为仅x函数 × 仅y函数
 * 这里用数值验证法：随机取几个点，验证 f(x1,y1)*f(x2,y2) === f(x1,y2)*f(x2,y1)
 * 返回 { separable, hint }，hint 为求解说明
 */
export function checkSeparable(expr: string): { separable: boolean; hint: string } {
  try {
    const node = parse(expr);
    const testPoints = [
      [1, 2], [3, 4], [0.5, 1.5], [2, 0.5],
    ];
    let separable = true;
    for (const [x1, y1] of testPoints) {
      for (const [x2, y2] of testPoints) {
        try {
          const f11 = node.evaluate({ x: x1, y: y1 }) as number;
          const f22 = node.evaluate({ x: x2, y: y2 }) as number;
          const f12 = node.evaluate({ x: x1, y: y2 }) as number;
          const f21 = node.evaluate({ x: x2, y: y1 }) as number;
          if (!isFinite(f11) || !isFinite(f22) || !isFinite(f12) || !isFinite(f21)) continue;
          if (Math.abs(f11 * f22 - f12 * f21) > 1e-6 * (Math.abs(f11 * f22) + 1)) {
            separable = false;
            break;
          }
        } catch { continue; }
      }
      if (!separable) break;
    }
    if (separable) {
      return {
        separable: true,
        hint: '该方程为可分离变量方程。\n解法：将变量分离为 dy/g(y) = f(x)dx，两边积分得通解。\n∫ dy/g(y) = ∫ f(x)dx + C',
      };
    }
    return { separable: false, hint: '该方程不是可分离变量形式。' };
  } catch {
    return { separable: false, hint: '表达式解析失败。' };
  }
}

/**
 * 一阶线性方程 y' + P(x)y = Q(x) — 积分因子法
 * 输入 P(x) 和 Q(x) 表达式，返回通解说明 + 数值采样验证
 * μ(x) = exp(∫ P(x)dx)
 * y = (1/μ(x)) · (∫ μ(x)·Q(x)dx + C)
 */
export function linearODEAnalytical(Pexpr: string, Qexpr: string, x0?: number, y0?: number): {
  integratingFactor: string;
  generalSolution: string;
  particularSolution?: string;
  C?: number;
  sample?: { x: number[]; y: number[] };
} {
  // 用数值积分近似积分因子和解
  const Pnode = parse(Pexpr);
  const Qnode = parse(Qexpr);
  const xMin = -5, xMax = 5, n = 200;
  const dx = (xMax - xMin) / n;
  const xs: number[] = [];
  const ys: number[] = [];
  const mus: number[] = [];

  // 计算 P(x) 的不定积分（数值），从 0 开始
  const intP: number[] = [];
  let integral = 0;
  for (let i = 0; i <= n; i++) {
    const x = xMin + i * dx;
    try {
      const p = Pnode.evaluate({ x }) as number;
      if (i > 0) integral += p * dx;
      intP.push(integral);
      mus.push(Math.exp(integral));
      xs.push(x);
    } catch {
      intP.push(NaN);
      mus.push(NaN);
      xs.push(x);
    }
  }

  // 计算 ∫ μ(x)·Q(x)dx，C=0 时的特解
  let intMuQ = 0;
  const muQInt: number[] = [0];
  for (let i = 1; i <= n; i++) {
    const x = xs[i];
    try {
      const q = Qnode.evaluate({ x }) as number;
      const mu = mus[i];
      const muQPrev = mus[i - 1] * (Qnode.evaluate({ x: xs[i - 1] }) as number);
      const muQCur = mu * q;
      intMuQ += (muQPrev + muQCur) * dx / 2;
      muQInt.push(intMuQ);
    } catch {
      muQInt.push(NaN);
    }
  }

  // 计算常数 C：若给初值则反解；否则取 C=1 做演示
  let C = 1;
  let particularSolution: string | undefined;
  if (x0 !== undefined && y0 !== undefined && isFinite(x0) && isFinite(y0)) {
    // 在 x0 处计算 μ(x0) 和 ∫μQdx(x0)
    let muX0 = NaN, muQX0 = NaN;
    for (let i = 0; i <= n; i++) {
      if (Math.abs(xs[i] - x0) <= Math.abs(dx) / 2 || i === (x0 - xMin) / dx) {
        muX0 = mus[i];
        muQX0 = muQInt[i];
        break;
      }
    }
    // 如果没找到精确落点，用插值
    if (!isFinite(muX0) || !isFinite(muQX0)) {
      const idx = Math.max(0, Math.min(n, Math.round((x0 - xMin) / dx)));
      muX0 = mus[idx];
      muQX0 = muQInt[idx];
    }
    if (isFinite(muX0) && muX0 !== 0 && isFinite(muQX0)) {
      C = y0 * muX0 - muQX0;
      particularSolution = `满足 y(${x0}) = ${y0} 的特解：C ≈ ${C.toFixed(4)}`;
    }
  }

  for (let i = 0; i <= n; i++) {
    if (isFinite(mus[i]) && mus[i] !== 0 && isFinite(muQInt[i])) {
      ys.push((muQInt[i] + C) / mus[i]);
    } else {
      ys.push(NaN);
    }
  }

  return {
    integratingFactor: 'μ(x) = exp(∫ P(x) dx)',
    generalSolution: 'y = (1/μ(x)) · (∫ μ(x)·Q(x) dx + C)',
    particularSolution,
    C,
    sample: { x: xs, y: ys },
  };
}

/**
 * 伯努利方程 y' + P(x)y = Q(x)y^n
 * 变换 z = y^(1-n)，化为线性方程 z' + (1-n)P(x)z = (1-n)Q(x)
 */
export function bernoulliODE(Pexpr: string, Qexpr: string, n: number, x0?: number, y0?: number): {
  substitution: string;
  linearForm: string;
  generalSolution: string;
  particularSolution?: string;
  sample?: { x: number[]; y: number[] };
} {
  // 用线性方程的结果做变换；若给初值则变换 z0 = y0^(1-n)
  const pLinear = `(${1 - n}) * (${Pexpr})`;
  const qLinear = `(${1 - n}) * (${Qexpr})`;
  let z0: number | undefined;
  if (x0 !== undefined && y0 !== undefined && isFinite(x0) && isFinite(y0)) {
    try { z0 = Math.pow(y0, 1 - n); } catch { z0 = undefined; }
  }
  const linResult = linearODEAnalytical(pLinear, qLinear, x0, z0);
  // z(x) 是线性方程的解，y = z^(1/(1-n))
  const ys = linResult.sample?.y.map((z) => {
    if (!isFinite(z) || z === 0 && 1 / (1 - n) < 0) return NaN;
    try {
      return Math.pow(z, 1 / (1 - n));
    } catch { return NaN; }
  }) || [];

  const particularSolution = linResult.particularSolution
    ? `由 z(${x0}) = y(${x0})^(1-n) ≈ ${z0?.toFixed(4)} 反解 C，再回代得特解`
    : undefined;

  return {
    substitution: `令 z = y^${1 === 1 - n ? '' : (1 - n).toString()}（即 z = y^(1-n)）`,
    linearForm: `z' + ${1 - n}·P(x)·z = ${1 - n}·Q(x)`,
    generalSolution: '先解线性方程得 z(x)，再回代 y = z^(1/(1-n))',
    particularSolution,
    sample: { x: linResult.sample?.x || [], y: ys },
  };
}

/**
 * 二阶常系数齐次线性方程 y'' + a·y' + b·y = 0
 * 特征方程 r² + a·r + b = 0
 * 分三种情况：实根、重根、共轭复根
 */
export function secondOrderHomogeneous(a: number, b: number): {
  case: 'distinct-real' | 'repeated' | 'complex';
  r1: number;
  r2: number;
  generalSolution: string;
  sample?: { x: number[]; y: number[] };
} {
  const disc = a * a - 4 * b;
  let r1 = 0, r2 = 0;
  let caseType: 'distinct-real' | 'repeated' | 'complex';
  let generalSolution = '';

  if (disc > 1e-10) {
    caseType = 'distinct-real';
    r1 = (-a + Math.sqrt(disc)) / 2;
    r2 = (-a - Math.sqrt(disc)) / 2;
    generalSolution = `y = C₁·e^(${r1.toFixed(4)}x) + C₂·e^(${r2.toFixed(4)}x)`;
  } else if (Math.abs(disc) <= 1e-10) {
    caseType = 'repeated';
    r1 = r2 = -a / 2;
    generalSolution = `y = (C₁ + C₂·x)·e^(${r1.toFixed(4)}x)`;
  } else {
    caseType = 'complex';
    const alpha = -a / 2;
    const beta = Math.sqrt(-disc) / 2;
    r1 = alpha;
    r2 = beta;
    generalSolution = `y = e^(${alpha.toFixed(4)}x) · [C₁·cos(${beta.toFixed(4)}x) + C₂·sin(${beta.toFixed(4)}x)]`;
  }

  // 生成示例解（取 C1=1, C2=1）
  const xs: number[] = [];
  const ys: number[] = [];
  const C1 = 1, C2 = 1;
  for (let i = 0; i <= 200; i++) {
    const x = -5 + (i / 200) * 10;
    let y = 0;
    if (caseType === 'distinct-real') {
      y = C1 * Math.exp(r1 * x) + C2 * Math.exp(r2 * x);
    } else if (caseType === 'repeated') {
      y = (C1 + C2 * x) * Math.exp(r1 * x);
    } else {
      const alpha = r1, beta = r2;
      y = Math.exp(alpha * x) * (C1 * Math.cos(beta * x) + C2 * Math.sin(beta * x));
    }
    if (Math.abs(y) > 1e6) { ys.push(NaN); } else { ys.push(y); }
    xs.push(x);
  }

  return { case: caseType, r1, r2, generalSolution, sample: { x: xs, y: ys } };
}

/**
 * 二阶常系数非齐次方程 y'' + a·y' + b·y = f(x)
 * 仅给出方法说明（特解形式）+ 数值解（RK4）
 * f(x) 为常数或指数函数时给出特解形式提示
 */
export function secondOrderNonhomogeneous(a: number, b: number, fType: string): {
  homogeneousSolution: string;
  particularForm: string;
  generalSolution: string;
} {
  const homo = secondOrderHomogeneous(a, b);
  let particularForm = '';

  switch (fType) {
    case 'constant':
      particularForm = '特解形式：y* = A（常数待定系数法）';
      break;
    case 'polynomial':
      particularForm = '特解形式：y* = An·x^n + ... + A₁·x + A₀';
      break;
    case 'exp':
      particularForm = '特解形式：y* = A·e^(kx)；若 k 是特征根，乘以 x 或 x²';
      break;
    case 'sin':
    case 'cos':
      particularForm = '特解形式：y* = A·cos(kx) + B·sin(kx)';
      break;
    default:
      particularForm = '根据 f(x) 形式选择待定系数法或常数变易法';
  }

  return {
    homogeneousSolution: homo.generalSolution,
    particularForm,
    generalSolution: '通解 = 齐次通解 + 非齐次特解',
  };
}

/**
 * 欧拉方程 x²y'' + axy' + by = f(x)
 * 令 x = e^t，化为常系数方程
 */
export function eulerEquation(a: number, b: number): {
  characteristic: string;
  generalSolution: string;
  sample?: { x: number[]; y: number[] };
} {
  // 特征方程 r² + (a-1)r + b = 0
  const result = secondOrderHomogeneous(a - 1, b);
  let generalSolution = '';
  if (result.case === 'distinct-real') {
    generalSolution = `y = C₁·x^(${result.r1.toFixed(4)}) + C₂·x^(${result.r2.toFixed(4)})`;
  } else if (result.case === 'repeated') {
    generalSolution = `y = (C₁ + C₂·ln x)·x^(${result.r1.toFixed(4)})`;
  } else {
    const alpha = result.r1, beta = result.r2;
    generalSolution = `y = x^(${alpha.toFixed(4)}) · [C₁·cos(${beta.toFixed(4)}·ln x) + C₂·sin(${beta.toFixed(4)}·ln x)]`;
  }

  // x>0 区域采样
  const xs: number[] = [];
  const ys: number[] = [];
  const C1 = 1, C2 = 0.5;
  for (let i = 1; i <= 200; i++) {
    const x = 0.1 + (i / 200) * 5;
    let y = 0;
    if (result.case === 'distinct-real') {
      y = C1 * Math.pow(x, result.r1) + C2 * Math.pow(x, result.r2);
    } else if (result.case === 'repeated') {
      y = (C1 + C2 * Math.log(x)) * Math.pow(x, result.r1);
    } else {
      const alphaR = result.r1, betaR = result.r2;
      y = Math.pow(x, alphaR) * (C1 * Math.cos(betaR * Math.log(x)) + C2 * Math.sin(betaR * Math.log(x)));
    }
    if (!isFinite(y) || Math.abs(y) > 1e6) ys.push(NaN);
    else ys.push(y);
    xs.push(x);
  }

  return {
    characteristic: `特征方程：r² + ${a - 1}r + ${b} = 0`,
    generalSolution,
    sample: { x: xs, y: ys },
  };
}

/**
 * 线性方程组 y' = Ay 的矩阵指数法
 * 输入 A 的二维数组，返回通解形式 + 数值解
 * 简化版：对 2×2 矩阵，用特征值法给出解析说明
 */
export function linearSystemODE(A: number[][]): {
  eigenvalues: number[] | { real: number; imag: number }[];
  generalSolution: string;
  phasePortrait?: { x: number[]; y: number[]; name: string }[];
} {
  if (A.length !== 2 || A[0].length !== 2) {
    return { eigenvalues: [], generalSolution: '仅支持 2×2 线性系统' };
  }
  const [[a, b], [c, d]] = A;
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;

  let eigenvalues: number[] | { real: number; imag: number }[];
  let generalSolution = '';

  if (disc > 1e-10) {
    const l1 = (tr + Math.sqrt(disc)) / 2;
    const l2 = (tr - Math.sqrt(disc)) / 2;
    eigenvalues = [l1, l2];
    generalSolution = `y(t) = C₁·v₁·e^(${l1.toFixed(4)}t) + C₂·v₂·e^(${l2.toFixed(4)}t)`;
  } else if (Math.abs(disc) <= 1e-10) {
    const l = tr / 2;
    eigenvalues = [l, l];
    generalSolution = `y(t) = (C₁·v + C₂·(v·t + w))·e^(${l.toFixed(4)}t)`;
  } else {
    const alpha = tr / 2;
    const beta = Math.sqrt(-disc) / 2;
    eigenvalues = [{ real: alpha, imag: beta }, { real: alpha, imag: -beta }];
    generalSolution = `y(t) = e^(${alpha.toFixed(4)}t) · [C₁·(v·cos(${beta.toFixed(4)}t) - w·sin(${beta.toFixed(4)}t)) + C₂·(v·sin(${beta.toFixed(4)}t) + w·cos(${beta.toFixed(4)}t))]`;
  }

  // 生成相图轨迹（多个初始条件）
  const trajectories: { x: number[]; y: number[]; name: string }[] = [];
  const inits = [[1, 0], [0, 1], [-1, 0.5], [0.5, -1], [-0.5, -0.5]];
  const dt = 0.02;
  const steps = 150;

  for (let k = 0; k < inits.length; k++) {
    const xs: number[] = [];
    const ys: number[] = [];
    let x = inits[k][0];
    let y = inits[k][1];
    for (let i = 0; i < steps; i++) {
      xs.push(x);
      ys.push(y);
      const dx = a * x + b * y;
      const dy = c * x + d * y;
      x += dx * dt;
      y += dy * dt;
      if (Math.abs(x) > 10 || Math.abs(y) > 10) break;
    }
    trajectories.push({ x: xs, y: ys, name: `轨迹${k + 1}` });
  }

  return { eigenvalues, generalSolution, phasePortrait: trajectories };
}

/**
 * 稳定性分析：自治系统 dx/dt=f(x,y), dy/dt=g(x,y)
 * 找平衡点并通过线性化 Jacobian 判断稳定性
 * 返回平衡点列表及类型（渐近稳定/不稳定/中心/鞍点）
 */
export function stabilityAnalysis(fExpr: string, gExpr: string): {
  equilibriumPoints: { x: number; y: number; type: string; eigenvalues: number[] | { real: number; imag: number }[] }[];
} {
  const fNode = parse(fExpr);
  const gNode = parse(gExpr);

  // 在网格上搜索接近零的点作为平衡点候选
  const candidates: { x: number; y: number }[] = [];
  const nGrid = 30;
  const range = 5;
  for (let i = 0; i <= nGrid; i++) {
    for (let j = 0; j <= nGrid; j++) {
      const x = -range + (i / nGrid) * 2 * range;
      const y = -range + (j / nGrid) * 2 * range;
      try {
        const fx = fNode.evaluate({ x, y }) as number;
        const gy = gNode.evaluate({ x, y }) as number;
        if (Math.abs(fx) < 0.1 && Math.abs(gy) < 0.1) {
          candidates.push({ x, y });
        }
      } catch { /* skip */ }
    }
  }

  // 合并相近的候选点
  const points: { x: number; y: number }[] = [];
  for (const c of candidates) {
    let found = false;
    for (const p of points) {
      if (Math.abs(c.x - p.x) < 0.5 && Math.abs(c.y - p.y) < 0.5) { found = true; break; }
    }
    if (!found) points.push(c);
  }

  // 对每个平衡点，用 Newton 法精化并计算 Jacobian
  const results: { x: number; y: number; type: string; eigenvalues: number[] | { real: number; imag: number }[] }[] = [];

  // 数值求偏导
  function partialDeriv(expr: string, varName: 'x' | 'y', x0: number, y0: number): number {
    const node = parse(expr);
    const eps = 1e-5;
    const scope1: Record<string, number> = { x: x0, y: y0 };
    const scope2: Record<string, number> = { x: x0, y: y0 };
    scope1[varName] = varName === 'x' ? x0 + eps : y0 + eps;
    scope2[varName] = varName === 'x' ? x0 - eps : y0 - eps;
    const v1 = node.evaluate(scope1) as number;
    const v2 = node.evaluate(scope2) as number;
    return (v1 - v2) / (2 * eps);
  }

  for (const p of points) {
    try {
      const fx = partialDeriv(fExpr, 'x', p.x, p.y);
      const fy = partialDeriv(fExpr, 'y', p.x, p.y);
      const gx = partialDeriv(gExpr, 'x', p.x, p.y);
      const gy = partialDeriv(gExpr, 'y', p.x, p.y);

      const tr = fx + gy;
      const det = fx * gy - fy * gx;
      const disc = tr * tr - 4 * det;

      let type = '';
      let eigenvalues: number[] | { real: number; imag: number }[];

      if (disc > 1e-10) {
        const l1 = (tr + Math.sqrt(disc)) / 2;
        const l2 = (tr - Math.sqrt(disc)) / 2;
        eigenvalues = [l1, l2];
        if (l1 < 0 && l2 < 0) type = '结点（渐近稳定）';
        else if (l1 > 0 && l2 > 0) type = '结点（不稳定）';
        else type = '鞍点（不稳定）';
      } else if (Math.abs(disc) <= 1e-10) {
        const l = tr / 2;
        eigenvalues = [l, l];
        type = l < 0 ? '退化结点（渐近稳定）' : '退化结点（不稳定）';
      } else {
        const alpha = tr / 2;
        const beta = Math.sqrt(-disc) / 2;
        eigenvalues = [{ real: alpha, imag: beta }, { real: alpha, imag: -beta }];
        if (Math.abs(alpha) < 1e-6) type = '中心（稳定但非渐近）';
        else if (alpha < 0) type = '焦点（渐近稳定）';
        else type = '焦点（不稳定）';
      }

      results.push({ x: p.x, y: p.y, type, eigenvalues });
    } catch { /* skip */ }
  }

  return { equilibriumPoints: results };
}

/**
 * 齐次方程 dy/dx = f(y/x)
 * 通过变量替换 u = y/x → y = ux → y' = u'x + u = f(u)
 * 化为可分离变量：dx/x = du/(f(u)-u)
 * 这里通过数值测试判断是否齐次：f(tx,ty) = f(x,y)（0次齐次）
 */
export function checkHomogeneous(expr: string): { homogeneous: boolean; hint: string } {
  try {
    const node = parse(expr);
    const testCases = [
      [1, 2, 3],
      [2, 1, 0.5],
      [3, 4, 2],
    ];
    let homogeneous = true;
    for (const [x, y, t] of testCases) {
      try {
        const f1 = node.evaluate({ x, y }) as number;
        const f2 = node.evaluate({ x: x * t, y: y * t }) as number;
        if (!isFinite(f1) || !isFinite(f2)) continue;
        if (Math.abs(f1 - f2) > 1e-6 * (Math.abs(f1) + 1)) {
          homogeneous = false;
          break;
        }
      } catch { /* skip */ }
    }

    if (homogeneous) {
      return {
        homogeneous: true,
        hint: '该方程为齐次方程 dy/dx = f(y/x)。\n解法：令 u = y/x，则 y = u·x，dy/dx = u + x·du/dx。\n代入得 x·du/dx = f(u) - u，分离变量积分后回代 u = y/x。\n通解形式：ln|x| = ∫ du/(f(u)-u) + C',
      };
    }
    return { homogeneous: false, hint: '该方程不是齐次方程（不满足 f(tx,ty)=f(x,y)）' };
  } catch {
    return { homogeneous: false, hint: '表达式解析失败' };
  }
}

/**
 * 恰当方程 P(x,y)dx + Q(x,y)dy = 0
 * 判断 ∂P/∂y = ∂Q/∂x（用数值偏导数近似）
 */
export function checkExact(Pexpr: string, Qexpr: string): {
  exact: boolean;
  py: number;
  qx: number;
  hint: string;
} {
  try {
    const P = parse(Pexpr);
    const Q = parse(Qexpr);
    const h = 1e-5;
    const x0 = 1, y0 = 1;

    // ∂P/∂y 中心差商
    const Py = (P.evaluate({ x: x0, y: y0 + h }) as number - P.evaluate({ x: x0, y: y0 - h }) as number) / (2 * h);
    // ∂Q/∂x 中心差商
    const Qx = (Q.evaluate({ x: x0 + h, y: y0 }) as number - Q.evaluate({ x: x0 - h, y: y0 }) as number) / (2 * h);

    const exact = Math.abs(Py - Qx) < 1e-4 * (Math.abs(Py) + Math.abs(Qx) + 1);

    let hint = '';
    if (exact) {
      hint = '该方程是恰当方程（满足 ∂P/∂y = ∂Q/∂x）。\n解法：存在原函数 u(x,y) = C，满足 ∂u/∂x = P, ∂u/∂y = Q。\n通解：u(x,y) = C';
    } else {
      hint = `该方程不是恰当方程（∂P/∂y ≈ ${Py.toFixed(4)}, ∂Q/∂x ≈ ${Qx.toFixed(4)}）。\n可尝试寻找积分因子 μ，使 μ·P dx + μ·Q dy = 0 成为恰当方程。`;
    }

    return { exact, py: Py, qx: Qx, hint };
  } catch {
    return { exact: false, py: 0, qx: 0, hint: '表达式解析失败' };
  }
}

/**
 * 可降阶高阶方程
 * - type1: y'' = f(x) 型，直接两次积分
 * - type2: y'' = f(x, y') 型（不显含 y），令 p = y'
 * - type3: y'' = f(y, y') 型（不显含 x），令 p = y', y'' = p·dp/dy
 */
export function reducibleODE(type: 'type1' | 'type2' | 'type3', fExpr: string): {
  typeName: string;
  reduction: string;
  hint: string;
} {
  let typeName = '';
  let reduction = '';
  let hint = '';

  if (type === 'type1') {
    typeName = 'y" = f(x) 型（直接降阶）';
    reduction = '令 p = y\'，则 p\' = f(x)';
    hint = '直接两次积分即可：\ny\' = ∫f(x)dx + C1\ny = ∫[∫f(x)dx]dx + C1·x + C2';
  } else if (type === 'type2') {
    typeName = 'y" = f(x, y\') 型（不显含 y）';
    reduction = '令 p = y\'，则 y" = dp/dx = p\'，方程化为 p\' = f(x, p)';
    hint = '化为一阶方程 p\' = f(x, p)，解出 p = φ(x, C1)。\n再对 y\' = φ(x, C1) 积分得 y = ∫φ(x, C1)dx + C2';
  } else {
    typeName = 'y" = f(y, y\') 型（不显含 x）';
    reduction = '令 p = y\'，则 y" = dp/dx = dp/dy · dy/dx = p·dp/dy';
    hint = '方程化为 p·dp/dy = f(y, p)，解出 p 作为 y 的函数。\n再由 dy/dx = p(y) 分离变量积分得通解。';
  }

  return { typeName, reduction, hint };
}

/**
 * 一维自治方程 dx/dt = f(x) 的相图分析
 * 找出平衡点（f(x)=0 的根）并判断稳定性
 * 稳定：f'(x*) < 0；不稳定：f'(x*) > 0；半稳定：f'(x*) = 0
 */
export function phaseLineAnalysis(fExpr: string, xMin: number, xMax: number): {
  equilibria: { x: number; stability: '稳定' | '不稳定' | '半稳定' | '不确定'; slope: number }[];
  samplePoints: { x: number; f: number }[];
} {
  const node = parse(fExpr);
  const equilibria: { x: number; stability: '稳定' | '不稳定' | '半稳定' | '不确定'; slope: number }[] = [];

  // 在区间内找根（用密采样 + 二分法）
  const nSearch = 500;
  const dx = (xMax - xMin) / nSearch;
  const h = 1e-5;

  for (let i = 0; i < nSearch; i++) {
    const x1 = xMin + i * dx;
    const x2 = x1 + dx;
    let f1: number, f2: number;
    try {
      f1 = node.evaluate({ x: x1 }) as number;
      f2 = node.evaluate({ x: x2 }) as number;
    } catch { continue; }

    const signCross = (f1 < 0 && f2 > 0) || (f1 > 0 && f2 < 0);
    const touchesZero = f1 === 0 || f2 === 0;

    if (signCross || touchesZero) {
      // 二分法找根
      let a = x1, b = x2;
      for (let j = 0; j < 50; j++) {
        const mid = (a + b) / 2;
        const fm = node.evaluate({ x: mid }) as number;
        if (!isFinite(fm)) break;
        const fa = node.evaluate({ x: a }) as number;
        if (fa * fm < 0) { b = mid; }
        else if (fm === 0) { a = mid; b = mid; break; }
        else { a = mid; }
      }
      const xEq = (a + b) / 2;
      // 导数 f'(x*)
      const slope = ((node.evaluate({ x: xEq + h }) as number) - (node.evaluate({ x: xEq - h }) as number)) / (2 * h);

      let stability: '稳定' | '不稳定' | '半稳定' | '不确定' = '不确定';
      if (slope < -1e-6) stability = '稳定';
      else if (slope > 1e-6) stability = '不稳定';
      else {
        // 判断半稳定：两侧符号是否相同
        const left = node.evaluate({ x: xEq - dx / 4 }) as number;
        const right = node.evaluate({ x: xEq + dx / 4 }) as number;
        if (left * right > 0) stability = '半稳定';
      }

      // 去重（距离小于 2 个搜索步长视为同一个根）
      const minDist = 2 * dx;
      const isDup = equilibria.some((e) => Math.abs(e.x - xEq) < minDist);
      if (!isDup) {
        equilibria.push({ x: xEq, stability, slope });
      }
    }
  }

  // 采样点（降采样用于绘图）
  const samplePoints: { x: number; f: number }[] = [];
  const nPts = 200;
  for (let i = 0; i <= nPts; i++) {
    const x = xMin + (i / nPts) * (xMax - xMin);
    try {
      const f = node.evaluate({ x }) as number;
      if (isFinite(f)) samplePoints.push({ x, f });
    } catch { /* skip */ }
  }

  return { equilibria, samplePoints };
}
