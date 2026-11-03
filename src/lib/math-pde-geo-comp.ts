// ============ 偏微分方程 / 微分几何 / 数学竞赛 计算库 ============

import { evaluate, type Complex } from 'mathjs';
import { normalizeMathInput } from './math-normalize';

// ============ 通用辅助函数 ============

/** 梯形法数值积分 */
function trapIntegrate(f: (x: number) => number, a: number, b: number, n = 200): number {
  const h = (b - a) / n;
  let sum = 0.5 * (f(a) + f(b));
  for (let i = 1; i < n; i++) sum += f(a + i * h);
  return sum * h;
}

/** Simpson 法数值积分（n 必须为偶数） */
function simpsonIntegrate(f: (x: number) => number, a: number, b: number, n = 200): number {
  if (n % 2 !== 0) n += 1;
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
  return (sum * h) / 3;
}

/** 数值一阶导数（对称差商） */
function numDiff(f: (x: number) => number, x: number, h = 1e-6): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** 数值二阶导数 */
function numDiff2(f: (x: number) => number, x: number, h = 1e-5): number {
  return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
}

/** 向量点乘 */
function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/** 向量模长 */
function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

/** 三维向量叉乘 */
function cross3(a: number[], b: number[]): number[] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/** 向量标量乘 */
function scale(v: number[], s: number): number[] {
  return v.map((x) => x * s);
}

/** 向量减 */
function vsub(a: number[], b: number[]): number[] {
  return a.map((x, i) => x - b[i]);
}

// ============ 一、偏微分方程（PDE）函数 ============

/** 1. 二阶线性PDE分类 */
export function classifyPDE(A: number, B: number, C: number): { type: string; discriminant: number; description: string } {
  try {
    const disc = B * B - 4 * A * C;
    let type = '';
    let desc = '';
    if (disc < 0) {
      type = '椭圆型';
      desc = 'B²-4AC < 0，方程为椭圆型，典型如拉普拉斯方程、泊松方程，解具有光滑性，边值问题适定。';
    } else if (disc === 0) {
      type = '抛物型';
      desc = 'B²-4AC = 0，方程为抛物型，典型如热传导方程，解具有耗散性，初值问题适定。';
    } else {
      type = '双曲型';
      desc = 'B²-4AC > 0，方程为双曲型，典型如波动方程，解具有波的传播特性，存在特征线。';
    }
    return { type, discriminant: disc, description: desc };
  } catch (e) {
    throw new Error(`classifyPDE失败：${(e as Error).message}`);
  }
}

/** 2. 达朗贝尔公式 */
export function dAlembertWave(phiStr: string, psiStr: string, c: number, x: number, t: number): number {
  try {
    const phiNorm = normalizeMathInput(phiStr);
    const psiNorm = normalizeMathInput(psiStr);
    const phi = (s: number) => evaluate(phiNorm, { x: s }) as number;
    const psi = (s: number) => evaluate(psiNorm, { x: s }) as number;
    const left = x - c * t;
    const right = x + c * t;
    const wavePart = (phi(left) + phi(right)) / 2;
    const integral = trapIntegrate(psi, left, right, 100);
    return wavePart + integral / (2 * c);
  } catch (e) {
    throw new Error(`dAlembertWave失败：${(e as Error).message}`);
  }
}

/** 3. 热方程分离变量级数解 */
export function heatEquationSeries(fStr: string, L: number, k: number, N: number, x: number, t: number): number {
  try {
    const fNorm = normalizeMathInput(fStr);
    const f = (s: number) => evaluate(fNorm, { x: s }) as number;
    let sum = 0;
    for (let n = 1; n <= N; n++) {
      const integrand = (s: number) => f(s) * Math.sin((n * Math.PI * s) / L);
      const bn = (2 / L) * trapIntegrate(integrand, 0, L, 200);
      const decay = Math.exp(-k * Math.pow((n * Math.PI) / L, 2) * t);
      sum += bn * Math.sin((n * Math.PI * x) / L) * decay;
    }
    return sum;
  } catch (e) {
    throw new Error(`heatEquationSeries失败：${(e as Error).message}`);
  }
}

/** 4. 弦振动级数解 */
export function vibrationStringSeries(
  phiStr: string,
  psiStr: string,
  L: number,
  c: number,
  N: number,
  x: number,
  t: number
): number {
  try {
    const phiNorm = normalizeMathInput(phiStr);
    const psiNorm = normalizeMathInput(psiStr);
    const phi = (s: number) => evaluate(phiNorm, { x: s }) as number;
    const psi = (s: number) => evaluate(psiNorm, { x: s }) as number;
    let sum = 0;
    for (let n = 1; n <= N; n++) {
      const sinBasis = Math.sin((n * Math.PI * x) / L);
      const integrandA = (s: number) => phi(s) * Math.sin((n * Math.PI * s) / L);
      const an = (2 / L) * trapIntegrate(integrandA, 0, L, 200);
      const integrandB = (s: number) => psi(s) * Math.sin((n * Math.PI * s) / L);
      const bn = (2 / (n * Math.PI * c)) * trapIntegrate(integrandB, 0, L, 200);
      sum += (an * Math.cos((n * Math.PI * c * t) / L) + bn * Math.sin((n * Math.PI * c * t) / L)) * sinBasis;
    }
    return sum;
  } catch (e) {
    throw new Error(`vibrationStringSeries失败：${(e as Error).message}`);
  }
}

/** 5. 矩形域拉普拉斯方程分离变量解（四边叠加） */
export function laplaceRectangular(
  boundary: { top: string; bottom: string; left: string; right: string },
  Lx: number,
  Ly: number,
  N: number,
  x: number,
  y: number
): number {
  try {
    // 顶边：u(x,Ly)=f_top(x)，正弦级数展开，y方向用双曲正弦
    const topNorm = normalizeMathInput(boundary.top);
    const botNorm = normalizeMathInput(boundary.bottom);
    const leftNorm = normalizeMathInput(boundary.left);
    const rightNorm = normalizeMathInput(boundary.right);
    const topF = (s: number) => evaluate(topNorm, { x: s }) as number;
    const botF = (s: number) => evaluate(botNorm, { x: s }) as number;
    const leftF = (s: number) => evaluate(leftNorm, { y: s }) as number;
    const rightF = (s: number) => evaluate(rightNorm, { y: s }) as number;

    let sum = 0;
    // 上下边贡献（x方向正弦，y方向双曲正弦）
    for (let n = 1; n <= N; n++) {
      const k = (n * Math.PI) / Lx;
      const sinTerm = Math.sin(k * x);
      const shLy = Math.sinh(k * Ly);
      const topCoeff = (2 / Lx) * trapIntegrate((s: number) => topF(s) * Math.sin(k * s), 0, Lx, 200);
      const botCoeff = (2 / Lx) * trapIntegrate((s: number) => botF(s) * Math.sin(k * s), 0, Lx, 200);
      if (Math.abs(shLy) > 1e-15) {
        sum += topCoeff * (Math.sinh(k * y) / shLy) * sinTerm;
        sum += botCoeff * (Math.sinh(k * (Ly - y)) / shLy) * sinTerm;
      }
    }
    // 左右边贡献（y方向正弦，x方向双曲正弦）
    for (let n = 1; n <= N; n++) {
      const k = (n * Math.PI) / Ly;
      const sinTerm = Math.sin(k * y);
      const shLx = Math.sinh(k * Lx);
      const rightCoeff = (2 / Ly) * trapIntegrate((s: number) => rightF(s) * Math.sin(k * s), 0, Ly, 200);
      const leftCoeff = (2 / Ly) * trapIntegrate((s: number) => leftF(s) * Math.sin(k * s), 0, Ly, 200);
      if (Math.abs(shLx) > 1e-15) {
        sum += rightCoeff * (Math.sinh(k * x) / shLx) * sinTerm;
        sum += leftCoeff * (Math.sinh(k * (Lx - x)) / shLx) * sinTerm;
      }
    }
    return sum;
  } catch (e) {
    throw new Error(`laplaceRectangular失败：${(e as Error).message}`);
  }
}

/** 6. 圆域拉普拉斯极坐标解 */
export function laplaceCircle(fStr: string, R: number, N: number, r: number, theta: number): number {
  try {
    const fNorm = normalizeMathInput(fStr);
    const f = (t: number) => evaluate(fNorm, { theta: t }) as number;
    // a0
    const a0 = (1 / Math.PI) * trapIntegrate(f, 0, 2 * Math.PI, 400);
    let sum = a0 / 2;
    for (let n = 1; n <= N; n++) {
      const an = (1 / Math.PI) * trapIntegrate((t: number) => f(t) * Math.cos(n * t), 0, 2 * Math.PI, 400);
      const bn = (1 / Math.PI) * trapIntegrate((t: number) => f(t) * Math.sin(n * t), 0, 2 * Math.PI, 400);
      const ratio = Math.pow(r / R, n);
      sum += ratio * (an * Math.cos(n * theta) + bn * Math.sin(n * theta));
    }
    return sum;
  } catch (e) {
    throw new Error(`laplaceCircle失败：${(e as Error).message}`);
  }
}

/** 7. 热方程基本解（热核） */
export function heatKernel(x: number, t: number, k: number): number {
  try {
    if (t <= 0) return 0;
    return (1 / Math.sqrt(4 * Math.PI * k * t)) * Math.exp(-(x * x) / (4 * k * t));
  } catch (e) {
    throw new Error(`heatKernel失败：${(e as Error).message}`);
  }
}

/** 8. 傅里叶变换解全空间热方程（卷积积分） */
export function fourierTransformHeat(fStr: string, k: number, N: number, x: number, t: number): number {
  try {
    const fNorm = normalizeMathInput(fStr);
    const f = (xi: number) => evaluate(fNorm, { x: xi }) as number;
    // 对称区间积分，默认 [-5, 5]，采样 500 点
    const A = 5;
    const steps = 500;
    const integrand = (xi: number) => heatKernel(x - xi, t, k) * f(xi);
    return trapIntegrate(integrand, -A, A, steps);
  } catch (e) {
    throw new Error(`fourierTransformHeat失败：${(e as Error).message}`);
  }
}

/** 9. 定解问题适定性检查 */
export function wellPosedCheck(
  eqType: string,
  conditions: string[]
): { problemType: string; wellPosed: boolean; reasons: string[] } {
  try {
    const eq = eqType.toLowerCase();
    const conds = conditions.map((c) => c.toLowerCase());
    const hasInitial = conds.some((c) => c.includes('initial') || c.includes('初值'));
    const hasBoundary = conds.some((c) => c.includes('boundary') || c.includes('边界'));
    const reasons: string[] = [];
    let wellPosed = false;
    let problemType = '';

    if (eq.includes('wave') || eq.includes('波动')) {
      problemType = '波动方程定解问题';
      if (hasInitial && hasBoundary) {
        wellPosed = true;
        reasons.push('波动方程混合问题（初值+边界）在有界区域上适定。');
      } else if (hasInitial && !hasBoundary) {
        wellPosed = true;
        reasons.push('波动方程初值问题（Cauchy问题）在全空间适定，依赖区域有限。');
      } else {
        wellPosed = false;
        reasons.push('波动方程只有边界条件没有初值条件一般不适定。');
      }
    } else if (eq.includes('heat') || eq.includes('热')) {
      problemType = '热传导方程定解问题';
      if (hasInitial && hasBoundary) {
        wellPosed = true;
        reasons.push('热方程混合问题（初值+边界）适定，解具有光滑化效应。');
      } else if (hasInitial && !hasBoundary) {
        wellPosed = true;
        reasons.push('热方程Cauchy问题适定，解无限次可微。');
      } else {
        wellPosed = false;
        reasons.push('热方程终值问题（反向时间）一般不适定。');
      }
    } else if (eq.includes('laplace') || eq.includes('拉普拉斯') || eq.includes('椭圆')) {
      problemType = '拉普拉斯方程边值问题';
      if (hasBoundary && !hasInitial) {
        wellPosed = true;
        reasons.push('拉普拉斯方程Dirichlet/Neumann边值问题在有界区域适定。');
      } else if (hasInitial) {
        wellPosed = false;
        reasons.push('椭圆型方程的初值问题（Hadamard例子）是不适定的。');
      } else {
        wellPosed = false;
        reasons.push('需要边界条件才能确定椭圆型方程的解。');
      }
    } else {
      problemType = '未知方程类型';
      reasons.push('无法识别方程类型，请使用 wave/heat/laplace 之一。');
    }
    return { problemType, wellPosed, reasons };
  } catch (e) {
    throw new Error(`wellPosedCheck失败：${(e as Error).message}`);
  }
}

/** 10. 贝塞尔函数 J_n(x)（级数展开 50 项） */
export function besselJ(n: number, x: number): number {
  try {
    const ni = Math.floor(n);
    let sum = 0;
    const halfX = x / 2;
    // 计算 (k+n)! 用递推
    let factKn = 1;
    for (let i = 1; i <= ni; i++) factKn *= i; // n!
    let factK = 1; // 0!
    let powTerm = Math.pow(halfX, ni); // (x/2)^n
    sum += ((-1) ** 0 / (factK * factKn)) * powTerm;
    for (let k = 1; k < 50; k++) {
      factK *= k;
      factKn *= (ni + k);
      powTerm *= halfX * halfX;
      const term = ((-1) ** k / (factK * factKn)) * powTerm;
      sum += term;
      if (Math.abs(term) < 1e-15 * Math.abs(sum)) break;
    }
    return sum;
  } catch (e) {
    throw new Error(`besselJ失败：${(e as Error).message}`);
  }
}

/** 11. 勒让德多项式 P_n(x)（递推） */
export function legendreP(n: number, x: number): number {
  try {
    const ni = Math.max(0, Math.floor(n));
    if (ni === 0) return 1;
    if (ni === 1) return x;
    let p0 = 1;
    let p1 = x;
    for (let i = 1; i < ni; i++) {
      const pNext = ((2 * i + 1) * x * p1 - i * p0) / (i + 1);
      p0 = p1;
      p1 = pNext;
    }
    return p1;
  } catch (e) {
    throw new Error(`legendreP失败：${(e as Error).message}`);
  }
}

/** 12. 连带勒让德函数 P_n^m(x)（递推） */
export function associatedLegendreP(n: number, m: number, x: number): number {
  try {
    const ni = Math.max(0, Math.floor(n));
    const mi = Math.floor(Math.abs(m));
    if (mi > ni) return 0;
    // 用递推关系：先从 P_m^m 起步，再递推到 P_n^m
    // P_m^m(x) = (-1)^m * (2m-1)!! * (1-x²)^(m/2)
    let pmm = 1;
    const sq = Math.sqrt(1 - x * x);
    for (let i = 1; i <= mi; i++) {
      pmm *= -(2 * i - 1) * sq;
    }
    if (ni === mi) return pmm;
    // P_{m+1}^m = x*(2m+1)*P_m^m
    let pm1m = x * (2 * mi + 1) * pmm;
    if (ni === mi + 1) return pm1m;
    // 递推 (n-m)P_n^m = (2n-1)x P_{n-1}^m - (n+m-1) P_{n-2}^m
    let prev = pmm;
    let curr = pm1m;
    for (let k = mi + 1; k < ni; k++) {
      const next = ((2 * k + 1) * x * curr - (k + mi) * prev) / (k - mi + 1);
      prev = curr;
      curr = next;
    }
    return curr;
  } catch (e) {
    throw new Error(`associatedLegendreP失败：${(e as Error).message}`);
  }
}

// ============ 二、微分几何函数 ============

/** 计算参数曲线在 t 处的 r'(t)（数值导数） */
function curveDeriv(rStrs: string[], t: number, h = 1e-6): number[] {
  const n = rStrs.length;
  const result: number[] = [];
  const normStrs = rStrs.map(s => normalizeMathInput(s));
  for (let i = 0; i < n; i++) {
    const f = (s: number) => evaluate(normStrs[i], { t: s }) as number;
    result.push(numDiff(f, t, h));
  }
  return result;
}

/** 计算参数曲线二阶导 */
function curveDeriv2(rStrs: string[], t: number, h = 1e-5): number[] {
  const n = rStrs.length;
  const result: number[] = [];
  const normStrs = rStrs.map(s => normalizeMathInput(s));
  for (let i = 0; i < n; i++) {
    const f = (s: number) => evaluate(normStrs[i], { t: s }) as number;
    result.push(numDiff2(f, t, h));
  }
  return result;
}

/** 计算参数曲线三阶导（用数值差分） */
function curveDeriv3(rStrs: string[], t: number, h = 1e-4): number[] {
  const n = rStrs.length;
  const result: number[] = [];
  const normStrs = rStrs.map(s => normalizeMathInput(s));
  for (let i = 0; i < n; i++) {
    const f = (s: number) => evaluate(normStrs[i], { t: s }) as number;
    // 三阶导的中心差分：(f(t+2h) - 2f(t+h) + 2f(t-h) - f(t-2h)) / (2h³)
    const val = (f(t + 2 * h) - 2 * f(t + h) + 2 * f(t - h) - f(t - 2 * h)) / (2 * h * h * h);
    result.push(val);
  }
  return result;
}

/** 13. 正则曲线判定 */
export function curveRegularity(rStrs: string[], t: number): { regular: boolean; tangent: number[]; rPrime: number[] } {
  try {
    const rPrime = curveDeriv(rStrs, t);
    const mag = norm(rPrime);
    const regular = mag > 1e-10;
    const tangent = regular ? scale(rPrime, 1 / mag) : rPrime.map(() => 0);
    return { regular, tangent, rPrime };
  } catch (e) {
    throw new Error(`curveRegularity失败：${(e as Error).message}`);
  }
}

/** 14. 弧长数值计算（Simpson 法） */
export function arcLength(rStrs: string[], t0: number, t1: number, steps = 200): number {
  try {
    const f = (t: number) => norm(curveDeriv(rStrs, t));
    return simpsonIntegrate(f, t0, t1, steps);
  } catch (e) {
    throw new Error(`arcLength失败：${(e as Error).message}`);
  }
}

/** 15. 平面曲线曲率 */
export function curvature2D(xStr: string, yStr: string, t: number): number {
  try {
    const xNorm = normalizeMathInput(xStr);
    const yNorm = normalizeMathInput(yStr);
    const xf = (s: number) => evaluate(xNorm, { t: s }) as number;
    const yf = (s: number) => evaluate(yNorm, { t: s }) as number;
    const xp = numDiff(xf, t);
    const yp = numDiff(yf, t);
    const xpp = numDiff2(xf, t);
    const ypp = numDiff2(yf, t);
    const numerator = Math.abs(xp * ypp - yp * xpp);
    const denominator = Math.pow(xp * xp + yp * yp, 1.5);
    if (denominator < 1e-15) throw new Error('切向量为零，曲率无定义');
    return numerator / denominator;
  } catch (e) {
    throw new Error(`curvature2D失败：${(e as Error).message}`);
  }
}

/** 16. 空间曲线曲率 κ = |r' × r''| / |r'|³ */
export function curvature3D(rStrs: string[], t: number): number {
  try {
    const r1 = curveDeriv(rStrs, t);
    const r2 = curveDeriv2(rStrs, t);
    const cross = cross3(r1, r2);
    const crossMag = norm(cross);
    const r1Mag = norm(r1);
    if (r1Mag < 1e-15) throw new Error('切向量为零，曲率无定义');
    return crossMag / Math.pow(r1Mag, 3);
  } catch (e) {
    throw new Error(`curvature3D失败：${(e as Error).message}`);
  }
}

/** 17. 空间曲线挠率 τ = (r' × r'')·r''' / |r' × r''|² */
export function torsion3D(rStrs: string[], t: number): number {
  try {
    const r1 = curveDeriv(rStrs, t);
    const r2 = curveDeriv2(rStrs, t);
    const r3 = curveDeriv3(rStrs, t);
    const cross = cross3(r1, r2);
    const crossMag2 = dot(cross, cross);
    if (crossMag2 < 1e-20) throw new Error('曲率为零，挠率无定义');
    return dot(cross, r3) / crossMag2;
  } catch (e) {
    throw new Error(`torsion3D失败：${(e as Error).message}`);
  }
}

/** 18. Frenet 标架 */
export function frenetFrame(rStrs: string[], t: number): { T: number[]; N: number[]; B: number[]; kappa: number; tau: number } {
  try {
    const r1 = curveDeriv(rStrs, t);
    const r2 = curveDeriv2(rStrs, t);
    const r1Mag = norm(r1);
    if (r1Mag < 1e-15) throw new Error('切向量为零，Frenet标架无定义');
    const T = scale(r1, 1 / r1Mag);
    // N = (r'' - (r''·T)T) / |...|
    const r2Proj = dot(r2, T);
    const nVec = vsub(r2, scale(T, r2Proj));
    const nMag = norm(nVec);
    if (nMag < 1e-15) throw new Error('加速度与速度共线，主法向量无定义');
    const N = scale(nVec, 1 / nMag);
    const B = cross3(T, N);
    const kappa = curvature3D(rStrs, t);
    const tau = torsion3D(rStrs, t);
    return { T, N, B, kappa, tau };
  } catch (e) {
    throw new Error(`frenetFrame失败：${(e as Error).message}`);
  }
}

/** 曲面偏导 r_u, r_v（数值） */
function surfacePartials(rStrs: string[], u: number, v: number, h = 1e-6): { rU: number[]; rV: number[] } {
  const n = rStrs.length;
  const rU: number[] = [];
  const rV: number[] = [];
  const normStrs = rStrs.map(s => normalizeMathInput(s));
  for (let i = 0; i < n; i++) {
    const fU = (s: number) => evaluate(normStrs[i], { u: s, v }) as number;
    const fV = (s: number) => evaluate(normStrs[i], { u, v: s }) as number;
    rU.push(numDiff(fU, u, h));
    rV.push(numDiff(fV, v, h));
  }
  return { rU, rV };
}

/** 曲面二阶偏导 r_uu, r_uv, r_vv（数值） */
function surfaceSecondPartials(rStrs: string[], u: number, v: number, h = 1e-5): { rUU: number[]; rUV: number[]; rVV: number[] } {
  const n = rStrs.length;
  const rUU: number[] = [];
  const rUV: number[] = [];
  const rVV: number[] = [];
  const normStrs = rStrs.map(s => normalizeMathInput(s));
  for (let i = 0; i < n; i++) {
    rUU.push(numDiff((s: number) => {
      const g = (t: number) => evaluate(normStrs[i], { u: t, v: s }) as number;
      return numDiff(g, u, h / 2);
    }, v, 0)); // 不对，需要重写
    // 正确的二阶偏导：
    // r_uu: 对 u 求二阶导
    const fuu = (s: number) => evaluate(normStrs[i], { u: s, v }) as number;
    rUU[i] = numDiff2(fuu, u, h);
    // r_vv: 对 v 求二阶导
    const fvv = (s: number) => evaluate(normStrs[i], { u, v: s }) as number;
    rVV[i] = numDiff2(fvv, v, h);
    // r_uv: 混合偏导，用中心差分
    const hh = h;
    const f11 = evaluate(normStrs[i], { u: u + hh, v: v + hh }) as number;
    const f12 = evaluate(normStrs[i], { u: u + hh, v: v - hh }) as number;
    const f21 = evaluate(normStrs[i], { u: u - hh, v: v + hh }) as number;
    const f22 = evaluate(normStrs[i], { u: u - hh, v: v - hh }) as number;
    rUV[i] = (f11 - f12 - f21 + f22) / (4 * hh * hh);
  }
  return { rUU, rUV, rVV };
}

/** 19. 曲面正则性 + 单位法向量 */
export function surfaceRegularity(
  rStrs: string[],
  u: number,
  v: number
): { regular: boolean; rU: number[]; rV: number[]; normal: number[] } {
  try {
    const { rU, rV } = surfacePartials(rStrs, u, v);
    const cross = cross3(rU, rV);
    const crossMag = norm(cross);
    const regular = crossMag > 1e-10;
    const normal = regular ? scale(cross, 1 / crossMag) : [0, 0, 0];
    return { regular, rU, rV, normal };
  } catch (e) {
    throw new Error(`surfaceRegularity失败：${(e as Error).message}`);
  }
}

/** 20. 第一基本形式 */
export function firstFundamentalForm(rStrs: string[], u: number, v: number): { E: number; F: number; G: number } {
  try {
    const { rU, rV } = surfacePartials(rStrs, u, v);
    return {
      E: dot(rU, rU),
      F: dot(rU, rV),
      G: dot(rV, rV),
    };
  } catch (e) {
    throw new Error(`firstFundamentalForm失败：${(e as Error).message}`);
  }
}

/** 21. 第二基本形式 */
export function secondFundamentalForm(rStrs: string[], u: number, v: number): { L: number; M: number; N: number } {
  try {
    const { rU, rV } = surfacePartials(rStrs, u, v);
    const cross = cross3(rU, rV);
    const crossMag = norm(cross);
    if (crossMag < 1e-12) throw new Error('曲面在该点不正则');
    const n = scale(cross, 1 / crossMag);
    const { rUU, rUV, rVV } = surfaceSecondPartials(rStrs, u, v);
    return {
      L: dot(rUU, n),
      M: dot(rUV, n),
      N: dot(rVV, n),
    };
  } catch (e) {
    throw new Error(`secondFundamentalForm失败：${(e as Error).message}`);
  }
}

/** 22. 高斯曲率 K = (LN - M²) / (EG - F²) */
export function gaussianCurvature(rStrs: string[], u: number, v: number): number {
  try {
    const { E, F, G } = firstFundamentalForm(rStrs, u, v);
    const { L, M, N } = secondFundamentalForm(rStrs, u, v);
    const denom = E * G - F * F;
    if (Math.abs(denom) < 1e-20) throw new Error('第一基本形式退化');
    return (L * N - M * M) / denom;
  } catch (e) {
    throw new Error(`gaussianCurvature失败：${(e as Error).message}`);
  }
}

/** 23. 平均曲率 H = (EN - 2FM + GL) / (2(EG - F²)) */
export function meanCurvature(rStrs: string[], u: number, v: number): number {
  try {
    const { E, F, G } = firstFundamentalForm(rStrs, u, v);
    const { L, M, N } = secondFundamentalForm(rStrs, u, v);
    const denom = E * G - F * F;
    if (Math.abs(denom) < 1e-20) throw new Error('第一基本形式退化');
    return (E * N - 2 * F * M + G * L) / (2 * denom);
  } catch (e) {
    throw new Error(`meanCurvature失败：${(e as Error).message}`);
  }
}

/** 24. 主曲率（解 k² - 2Hk + K = 0） */
export function principalCurvatures(rStrs: string[], u: number, v: number): number[] {
  try {
    const K = gaussianCurvature(rStrs, u, v);
    const H = meanCurvature(rStrs, u, v);
    const disc = H * H - K;
    if (disc < 0) throw new Error('主曲率不存在（复数）');
    const sqrtDisc = Math.sqrt(disc);
    return [H + sqrtDisc, H - sqrtDisc];
  } catch (e) {
    throw new Error(`principalCurvatures失败：${(e as Error).message}`);
  }
}

/** 25. 曲面类型判定 */
export function surfaceTypeAtPoint(K: number): string {
  try {
    const eps = 1e-10;
    if (K > eps) return '椭圆点（K > 0）';
    if (K < -eps) return '双曲点（K < 0）';
    return '抛物点（K = 0）';
  } catch (e) {
    throw new Error(`surfaceTypeAtPoint失败：${(e as Error).message}`);
  }
}

/** 26. 球面标准参数化几何量 */
export function sphereGeometry(R: number, u: number, v: number): { E: number; F: number; G: number; K: number; H: number } {
  try {
    const sinU = Math.sin(u);
    const E = R * R;
    const F = 0;
    const G = R * R * sinU * sinU;
    const K = 1 / (R * R);
    const H = 1 / R;
    return { E, F, G, K, H };
  } catch (e) {
    throw new Error(`sphereGeometry失败：${(e as Error).message}`);
  }
}

// ============ 三、数学竞赛函数 ============

// ---- 不等式 ----

/** 27. 均值不等式族 */
export function meanInequalities(nums: number[]): { AM: number; GM: number; HM: number; QM: number; valid: boolean; equalCondition: string } {
  try {
    if (nums.length === 0) throw new Error('数组不能为空');
    const allPositive = nums.every((x) => x > 0);
    if (!allPositive) throw new Error('所有数必须为正数');
    const n = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const AM = sum / n;
    const GM = Math.pow(nums.reduce((a, b) => a * b, 1), 1 / n);
    const HM = n / nums.reduce((a, b) => a + 1 / b, 0);
    const QM = Math.sqrt(nums.reduce((a, b) => a + b * b, 0) / n);
    const valid = AM >= GM - 1e-10 && GM >= HM - 1e-10;
    const equalCondition = '当且仅当所有数相等时取等号';
    return { AM, GM, HM, QM, valid, equalCondition };
  } catch (e) {
    throw new Error(`meanInequalities失败：${(e as Error).message}`);
  }
}

/** 28. 柯西不等式验证 */
export function cauchySchwarz(a: number[], b: number[]): { left: number; right: number; valid: boolean; ratio: number[] } {
  try {
    if (a.length !== b.length) throw new Error('两个数组长度必须相同');
    if (a.length === 0) throw new Error('数组不能为空');
    let dotProd = 0;
    let sumA2 = 0;
    let sumB2 = 0;
    for (let i = 0; i < a.length; i++) {
      dotProd += a[i] * b[i];
      sumA2 += a[i] * a[i];
      sumB2 += b[i] * b[i];
    }
    const left = dotProd * dotProd;
    const right = sumA2 * sumB2;
    const valid = left <= right + 1e-10;
    // 比例数组（b_i / a_i，检查是否成比例）
    const ratio: number[] = [];
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(a[i]) > 1e-12) ratio.push(b[i] / a[i]);
      else ratio.push(Infinity);
    }
    return { left, right, valid, ratio };
  } catch (e) {
    throw new Error(`cauchySchwarz失败：${(e as Error).message}`);
  }
}

/** 29. 排序不等式 */
export function rearrangementInequality(a: number[], b: number[]): { sameOrder: number; reverseOrder: number; valid: boolean } {
  try {
    if (a.length !== b.length) throw new Error('两个数组长度必须相同');
    const n = a.length;
    const aSorted = [...a].sort((x, y) => x - y);
    const bSorted = [...b].sort((x, y) => x - y);
    let sameOrder = 0;
    let reverseOrder = 0;
    for (let i = 0; i < n; i++) {
      sameOrder += aSorted[i] * bSorted[i];
      reverseOrder += aSorted[i] * bSorted[n - 1 - i];
    }
    const valid = sameOrder >= reverseOrder - 1e-10;
    return { sameOrder, reverseOrder, valid };
  } catch (e) {
    throw new Error(`rearrangementInequality失败：${(e as Error).message}`);
  }
}

/** 30. 琴生不等式验证 */
export function jensenInequality(
  fStr: string,
  points: number[],
  weights: number[]
): { left: number; right: number; valid: boolean; convex: boolean } {
  try {
    const n = points.length;
    if (n === 0) throw new Error('点列表不能为空');
    const fNorm = normalizeMathInput(fStr);
    // 空权重数组默认均匀权重
    const w = weights.length === 0 ? new Array(n).fill(1 / n) : weights;
    if (n !== w.length) throw new Error('点数和权重数必须相同');
    const f = (x: number) => evaluate(fNorm, { x }) as number;
    const wSum = w.reduce((a, b) => a + b, 0);
    if (Math.abs(wSum) < 1e-12) throw new Error('权重和不能为零');
    // 加权平均
    let weightedAvg = 0;
    let fWeightedSum = 0;
    for (let i = 0; i < n; i++) {
      weightedAvg += (w[i] / wSum) * points[i];
      fWeightedSum += (w[i] / wSum) * f(points[i]);
    }
    const left = f(weightedAvg); // f(加权平均)
    const right = fWeightedSum; // 加权f平均
    // 数值检查凸性：取第一个点附近二阶差商
    const x0 = points[0];
    const h = 1e-4;
    const secondDiff = (f(x0 + h) - 2 * f(x0) + f(x0 - h)) / (h * h);
    const convex = secondDiff >= -1e-6; // 凸函数二阶导非负
    const valid = convex ? left <= right + 1e-8 : left >= right - 1e-8;
    return { left, right, valid, convex };
  } catch (e) {
    throw new Error(`jensenInequality失败：${(e as Error).message}`);
  }
}

/** 31. 闵可夫斯基不等式 */
export function minkowskiInequality(a: number[], b: number[], p: number): { left: number; right: number; valid: boolean } {
  try {
    if (a.length !== b.length) throw new Error('两个数组长度必须相同');
    if (p < 1) throw new Error('p 必须 ≥ 1');
    const n = a.length;
    let sumABp = 0;
    let sumAp = 0;
    let sumBp = 0;
    for (let i = 0; i < n; i++) {
      sumABp += Math.pow(Math.abs(a[i] + b[i]), p);
      sumAp += Math.pow(Math.abs(a[i]), p);
      sumBp += Math.pow(Math.abs(b[i]), p);
    }
    const left = Math.pow(sumABp, 1 / p);
    const right = Math.pow(sumAp, 1 / p) + Math.pow(sumBp, 1 / p);
    const valid = left <= right + 1e-8;
    return { left, right, valid };
  } catch (e) {
    throw new Error(`minkowskiInequality失败：${(e as Error).message}`);
  }
}

// ---- 竞赛数论 ----

/** 32. 大数整除判定 */
export function divisibilityRules(
  n: string
): Record<string, { divisible: boolean; rule: string; process: string }> {
  try {
    if (!/^\d+$/.test(n)) throw new Error('输入必须为非负整数字符串');
    const result: Record<string, { divisible: boolean; rule: string; process: string }> = {};
    const len = n.length;
    const lastDigit = parseInt(n[len - 1]);
    const last2 = len >= 2 ? parseInt(n.slice(-2)) : parseInt(n);
    const last3 = len >= 3 ? parseInt(n.slice(-3)) : parseInt(n);
    const digitSum = n.split('').reduce((s, d) => s + parseInt(d), 0);
    // 2
    result['2'] = {
      divisible: lastDigit % 2 === 0,
      rule: '末位能被2整除',
      process: `末位 ${lastDigit}，${lastDigit % 2 === 0 ? '能' : '不能'}被2整除`,
    };
    // 3
    result['3'] = {
      divisible: digitSum % 3 === 0,
      rule: '各位数字之和能被3整除',
      process: `数字和 = ${digitSum}，${digitSum % 3 === 0 ? '能' : '不能'}被3整除`,
    };
    // 4
    result['4'] = {
      divisible: last2 % 4 === 0,
      rule: '末两位能被4整除',
      process: `末两位 ${last2}，${last2 % 4 === 0 ? '能' : '不能'}被4整除`,
    };
    // 5
    result['5'] = {
      divisible: lastDigit === 0 || lastDigit === 5,
      rule: '末位是0或5',
      process: `末位 ${lastDigit}，${lastDigit === 0 || lastDigit === 5 ? '是0或5' : '不是0或5'}`,
    };
    // 7（截尾法：末位×2，其余部分减去）
    let n7 = n;
    let steps7 = '';
    while (n7.length > 2) {
      const last = parseInt(n7[n7.length - 1]);
      const rest = parseInt(n7.slice(0, -1));
      const newVal = rest - 2 * last;
      steps7 += `${n7} → ${newVal}; `;
      n7 = Math.abs(newVal).toString();
    }
    const div7 = parseInt(n7) % 7 === 0;
    result['7'] = {
      divisible: div7,
      rule: '截尾法：末位×2，用剩余部分减去，重复至可判断',
      process: steps7 + `最终 ${n7}，${div7 ? '能' : '不能'}被7整除`,
    };
    // 8
    result['8'] = {
      divisible: last3 % 8 === 0,
      rule: '末三位能被8整除',
      process: `末三位 ${last3}，${last3 % 8 === 0 ? '能' : '不能'}被8整除`,
    };
    // 9
    result['9'] = {
      divisible: digitSum % 9 === 0,
      rule: '各位数字之和能被9整除',
      process: `数字和 = ${digitSum}，${digitSum % 9 === 0 ? '能' : '不能'}被9整除`,
    };
    // 11（奇数位和 - 偶数位和）
    let oddSum = 0;
    let evenSum = 0;
    for (let i = 0; i < len; i++) {
      const d = parseInt(n[len - 1 - i]);
      if (i % 2 === 0) oddSum += d;
      else evenSum += d;
    }
    const diff11 = Math.abs(oddSum - evenSum);
    result['11'] = {
      divisible: diff11 % 11 === 0,
      rule: '奇数位数字和与偶数位数字和的差能被11整除',
      process: `奇位和=${oddSum}，偶位和=${evenSum}，差=${diff11}，${diff11 % 11 === 0 ? '能' : '不能'}被11整除`,
    };
    // 13（截尾法：末位×4，加剩余部分）
    let n13 = n;
    let steps13 = '';
    while (n13.length > 2) {
      const last = parseInt(n13[n13.length - 1]);
      const rest = parseInt(n13.slice(0, -1));
      const newVal = rest + 4 * last;
      steps13 += `${n13} → ${newVal}; `;
      n13 = newVal.toString();
    }
    const div13 = parseInt(n13) % 13 === 0;
    result['13'] = {
      divisible: div13,
      rule: '截尾法：末位×4，加剩余部分，重复至可判断',
      process: steps13 + `最终 ${n13}，${div13 ? '能' : '不能'}被13整除`,
    };
    return result;
  } catch (e) {
    throw new Error(`divisibilityRules失败：${(e as Error).message}`);
  }
}

/** 33. 不定方程 ax + by = c（扩展欧几里得） */
export function linearDiophantine(
  a: number,
  b: number,
  c: number
): { solvable: boolean; particular?: { x: number; y: number }; homogeneous?: { x: number; y: number }; gcd: number } {
  try {
    const extendedGcd = (a: number, b: number): { g: number; x: number; y: number } => {
      if (b === 0) return { g: a, x: 1, y: 0 };
      const res = extendedGcd(b, a % b);
      return { g: res.g, x: res.y, y: res.x - Math.floor(a / b) * res.y };
    }
    const { g, x, y } = extendedGcd(Math.abs(a), Math.abs(b));
    if (c % g !== 0) {
      return { solvable: false, gcd: g };
    }
    const factor = c / g;
    const signA = a >= 0 ? 1 : -1;
    const signB = b >= 0 ? 1 : -1;
    const particular = { x: x * factor * signA, y: y * factor * signB };
    const homogeneous = { x: b / g, y: -a / g };
    return { solvable: true, particular, homogeneous, gcd: g };
  } catch (e) {
    throw new Error(`linearDiophantine失败：${(e as Error).message}`);
  }
}

/** 34. 数论函数：d(n), σ(n), φ(n), μ(n) */
export function numberTheoryFunctions(n: number): { d: number; sigma: number; phi: number; mu: number } {
  try {
    if (n < 1 || !Number.isInteger(n)) throw new Error('n 必须是正整数');
    // 质因数分解
    const factors: Record<number, number> = {};
    let temp = n;
    for (let p = 2; p * p <= temp; p++) {
      while (temp % p === 0) {
        factors[p] = (factors[p] || 0) + 1;
        temp /= p;
      }
    }
    if (temp > 1) factors[temp] = (factors[temp] || 0) + 1;
    // d(n) = Π (e_i + 1)
    let d = 1;
    // σ(n) = Π (p^(e+1) - 1) / (p - 1)
    let sigma = 1;
    // φ(n) = n * Π (1 - 1/p)
    let phi = n;
    // μ(n): 有平方因子则0，否则 (-1)^k
    let mu = 1;
    for (const [p, e] of Object.entries(factors)) {
      const pi = parseInt(p);
      d *= e + 1;
      sigma *= (Math.pow(pi, e + 1) - 1) / (pi - 1);
      phi *= (pi - 1) / pi;
      if (e >= 2) mu = 0;
      else mu *= -1;
    }
    return { d, sigma, phi: Math.round(phi), mu };
  } catch (e) {
    throw new Error(`numberTheoryFunctions失败：${(e as Error).message}`);
  }
}

/** 35. 勒让德公式 */
export function legendreFormula(n: number, p: number): number {
  try {
    if (n < 0 || p < 2) throw new Error('参数不合法');
    let count = 0;
    let pk = p;
    while (pk <= n) {
      count += Math.floor(n / pk);
      pk *= p;
    }
    return count;
  } catch (e) {
    throw new Error(`legendreFormula失败：${(e as Error).message}`);
  }
}

/** 36. 元素阶（乘法阶） */
export function multiplicativeOrder(a: number, m: number): number {
  try {
    if (m <= 1) throw new Error('m 必须 > 1');
    // gcd(a, m)
    const gcd = (x: number, y: number): number => {
      return y === 0 ? x : gcd(y, x % y);
    }
    if (gcd(a, m) !== 1) return -1;
    // 找最小 k 使 a^k ≡ 1 (mod m)
    let result = 1;
    let current = a % m;
    while (current !== 1 && result <= m) {
      current = (current * (a % m)) % m;
      result++;
    }
    return current === 1 ? result : -1;
  } catch (e) {
    throw new Error(`multiplicativeOrder失败：${(e as Error).message}`);
  }
}

// ---- 竞赛几何 ----

/** 37. 三角形五心及相关量 */
export function triangleCenters(vertices: number[][]): {
  centroid: number[];
  circumcenter: number[];
  incenter: number[];
  orthocenter: number[];
  sides: number[];
  area: number;
  R: number;
  r: number;
} {
  try {
    if (vertices.length !== 3) throw new Error('需要3个顶点');
    const [[x1, y1], [x2, y2], [x3, y3]] = vertices;
    // 边长
    const a = Math.hypot(x2 - x3, y2 - y3); // BC
    const b = Math.hypot(x1 - x3, y1 - y3); // AC
    const c = Math.hypot(x1 - x2, y1 - y2); // AB
    // 面积（行列式法）
    const area = Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
    if (area < 1e-12) throw new Error('三点共线，不能构成三角形');
    // 重心
    const centroid = [(x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3];
    // 外心：两条垂直平分线的交点
    // AB中点 ((x1+x2)/2, (y1+y2)/2)，法向量 (x2-x1, y2-y1)
    // AC中点 ((x1+x3)/2, (y1+y3)/2)，法向量 (x3-x1, y3-y1)
    const d1x = x2 - x1;
    const d1y = y2 - y1;
    const m1x = (x1 + x2) / 2;
    const m1y = (y1 + y2) / 2;
    const d2x = x3 - x1;
    const d2y = y3 - y1;
    const m2x = (x1 + x3) / 2;
    const m2y = (y1 + y3) / 2;
    // d1x*(ox - m1x) + d1y*(oy - m1y) = 0
    // d2x*(ox - m2x) + d2y*(oy - m2y) = 0
    const det = d1x * d2y - d1y * d2x;
    const c1 = d1x * m1x + d1y * m1y;
    const c2 = d2x * m2x + d2y * m2y;
    const ox = (c1 * d2y - d1y * c2) / det;
    const oy = (d1x * c2 - c1 * d2x) / det;
    const circumcenter = [ox, oy];
    // 内心：(a*x1+b*x2+c*x3)/(a+b+c) 等（按对边加权）
    const incenter = [(a * x1 + b * x2 + c * x3) / (a + b + c), (a * y1 + b * y2 + c * y3) / (a + b + c)];
    // 外接圆半径 R = a*b*c / (4*area)
    const R = (a * b * c) / (4 * area);
    // 内切圆半径 r = area / s
    const s = (a + b + c) / 2;
    const r = area / s;
    // 垂心：欧拉线 H = 3G - 2O
    const orthocenter = [3 * centroid[0] - 2 * ox, 3 * centroid[1] - 2 * oy];
    return {
      centroid,
      circumcenter,
      incenter,
      orthocenter,
      sides: [a, b, c],
      area,
      R,
      r,
    };
  } catch (e) {
    throw new Error(`triangleCenters失败：${(e as Error).message}`);
  }
}

/** 38. 塞瓦定理 */
export function cevaTheorem(sideRatios: number[][]): { concurrent: boolean; product: number } {
  try {
    // sideRatios 可以是 [[r1], [r2], [r3]] 形式，或 3 个独立比
    // 简化：取三个比值 r1=BD/DC, r2=CE/EA, r3=AF/FB，验证 r1*r2*r3 = 1
    const ratios: number[] = [];
    for (const item of sideRatios) {
      if (item.length === 1) ratios.push(item[0]);
      else if (item.length === 2) ratios.push(item[0] / item[1]);
      else throw new Error('比值格式错误');
    }
    if (ratios.length !== 3) throw new Error('需要三个比值');
    const product = ratios[0] * ratios[1] * ratios[2];
    const concurrent = Math.abs(product - 1) < 1e-8;
    return { concurrent, product };
  } catch (e) {
    throw new Error(`cevaTheorem失败：${(e as Error).message}`);
  }
}

/** 39. 海伦公式 */
export function heronFormula(a: number, b: number, c: number): number {
  try {
    if (a <= 0 || b <= 0 || c <= 0) throw new Error('边长必须为正');
    if (a + b <= c || a + c <= b || b + c <= a) throw new Error('不满足三角不等式');
    const s = (a + b + c) / 2;
    const areaSq = s * (s - a) * (s - b) * (s - c);
    if (areaSq < 0) throw new Error('无法构成有效三角形');
    return Math.sqrt(areaSq);
  } catch (e) {
    throw new Error(`heronFormula失败：${(e as Error).message}`);
  }
}

/** 40. 正弦定理解三角形 */
export function sineLawSolve(sides: number[], angles: number[]): { sides: number[]; angles: number[]; area: number } {
  try {
    // sides: [a, b, c]，缺失项填 NaN 或 0
    // angles: [A, B, C]（弧度），缺失项填 NaN 或 0
    const s = sides.map((x) => (x && x > 0 ? x : NaN));
    const ang = angles.map((x) => (x && x > 0 ? x : NaN));
    const knownAngles = ang.filter((x) => !isNaN(x)).length;
    // 已知两角，求第三角
    if (knownAngles === 2) {
      const idx = ang.findIndex((x) => isNaN(x));
      const sumKnown = ang.reduce((acc, x) => acc + (isNaN(x) ? 0 : x), 0);
      ang[idx] = Math.PI - sumKnown;
    }
    // 找一组已知边和对角
    let knownSide = NaN;
    let knownAngle = NaN;
    for (let i = 0; i < 3; i++) {
      if (!isNaN(s[i]) && !isNaN(ang[i])) {
        knownSide = s[i];
        knownAngle = ang[i];
        break;
      }
    }
    if (isNaN(knownSide) || isNaN(knownAngle)) {
      throw new Error('需要至少一组边和其对角才能用正弦定理解三角形');
    }
    const ratio = knownSide / Math.sin(knownAngle);
    // 求其余边
    for (let i = 0; i < 3; i++) {
      if (isNaN(s[i]) && !isNaN(ang[i])) {
        s[i] = ratio * Math.sin(ang[i]);
      }
    }
    // 求其余角
    for (let i = 0; i < 3; i++) {
      if (isNaN(ang[i]) && !isNaN(s[i])) {
        const sinVal = s[i] / ratio;
        if (Math.abs(sinVal) > 1.0000001) throw new Error('正弦值超出范围，无解');
        ang[i] = Math.asin(Math.max(-1, Math.min(1, sinVal)));
      }
    }
    const area = 0.5 * s[0] * s[1] * Math.sin(ang[2]);
    return { sides: s, angles: ang, area };
  } catch (e) {
    throw new Error(`sineLawSolve失败：${(e as Error).message}`);
  }
}

/** 41. 欧拉不等式 */
export function eulerInequality(R: number, r: number): boolean {
  try {
    if (R <= 0 || r <= 0) throw new Error('半径必须为正');
    return R >= 2 * r - 1e-12;
  } catch (e) {
    throw new Error(`eulerInequality失败：${(e as Error).message}`);
  }
}

/** 42. 佩尔方程最小正整数解 */
export function pellEquation(D: number, maxIter = 100000): { x: number; y: number } | null {
  try {
    if (D <= 0 || !Number.isInteger(D)) throw new Error('D 必须为正整数');
    // 检查 D 是否为完全平方
    const sqrtD = Math.floor(Math.sqrt(D));
    if (sqrtD * sqrtD === D) throw new Error('D 不能是完全平方数');
    // 连分数法求最小解
    let m = 0;
    let d = 1;
    let a = sqrtD;
    let numPrev = BigInt(1);
    let numCurr = BigInt(a);
    let denPrev = BigInt(0);
    let denCurr = BigInt(1);
    let period = 0;
    while (period < maxIter) {
      m = d * a - m;
      d = (D - m * m) / d;
      a = Math.floor((sqrtD + m) / d);
      const numNext = BigInt(a) * numCurr + numPrev;
      const denNext = BigInt(a) * denCurr + denPrev;
      numPrev = numCurr;
      numCurr = numNext;
      denPrev = denCurr;
      denCurr = denNext;
      period++;
      // 验证 x² - D·y² = 1
      const xNum = numCurr;
      const yNum = denCurr;
      const xSq = xNum * xNum;
      const ySq = yNum * yNum;
      if (xSq - BigInt(D) * ySq === BigInt(1)) {
        // 转回 number（如果太大可能溢出，但竞赛中一般较小）
        const x = Number(xNum);
        const y = Number(yNum);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          throw new Error('解过大，超出精确表示范围');
        }
        return { x, y };
      }
    }
    return null;
  } catch (e) {
    throw new Error(`pellEquation失败：${(e as Error).message}`);
  }
}

// ---- 竞赛代数 ----

/** 43. 韦达定理 */
export function vietaTheorem(coeffs: number[]): { roots: number[]; sum: number; sumOfPairs: number; product: number } {
  try {
    if (coeffs.length < 2) throw new Error('多项式次数至少为1');
    const n = coeffs.length - 1; // 次数
    const aN = coeffs[0];
    if (Math.abs(aN) < 1e-15) throw new Error('首项系数不能为零');
    // sum of roots = -a_{n-1} / a_n
    const sum = -coeffs[1] / aN;
    // sum of products two at a time = a_{n-2} / a_n
    const sumOfPairs = n >= 2 ? coeffs[2] / aN : 0;
    // product = (-1)^n * a_0 / a_n
    const product = ((-1) ** n) * coeffs[n] / aN;
    // 数值根（次数 ≤ 4 时尝试）
    let roots: number[] = [];
    if (n <= 4) {
      try {
        // 用 math.js 的多项式求根
        const revCoeffs = coeffs.slice().reverse();
        const mathRoots = evaluate(`polynomialRoot(${revCoeffs.join(', ')})`); // math.polynomialRoot 接受 [a0, a1, ..., an]
        if (Array.isArray(mathRoots)) {
          roots = mathRoots.map((r: number | Complex) => {
            if (typeof r === 'number') return r;
            return r.re; // 返回复数的实部
          });
        }
      } catch {
        // 求根失败，返回空
      }
    }
    return { roots, sum, sumOfPairs, product };
  } catch (e) {
    throw new Error(`vietaTheorem失败：${(e as Error).message}`);
  }
}

/** 44. 数列极限数值估计 */
export function sequenceLimit(seqStr: string, n: number): number {
  try {
    const seqNorm = normalizeMathInput(seqStr);
    const f = (k: number) => evaluate(seqNorm, { n: k }) as number;
    const a2 = f(n * 10);
    const a3 = f(n * 100);
    // 简单外推：如果 a2 和 a3 很接近，取 a3；否则用加权
    if (Math.abs(a3 - a2) < 1e-6) return a3;
    // 用理查森外推思想
    const limit = (4 * a3 - a2) / 3;
    return limit;
  } catch (e) {
    throw new Error(`sequenceLimit失败：${(e as Error).message}`);
  }
}

/** 45. 柯西函数方程检验 */
export function cauchyFunctional(fStr: string): { linear: boolean; slope?: number } {
  try {
    const fNorm = normalizeMathInput(fStr);
    const f = (x: number) => evaluate(fNorm, { x }) as number;
    // 取 3 组随机值验证
    const testPairs = [
      [1.5, 2.3],
      [-1, 0.7],
      [3.1, -2.5],
    ];
    let allPass = true;
    const slopes: number[] = [];
    for (const [x, y] of testPairs) {
      const lhs = f(x + y);
      const rhs = f(x) + f(y);
      if (Math.abs(lhs - rhs) > 1e-6) {
        allPass = false;
        break;
      }
      if (Math.abs(x) > 1e-10) slopes.push(f(x) / x);
    }
    if (!allPass) return { linear: false };
    // 计算平均斜率
    const slope = slopes.reduce((a, b) => a + b, 0) / slopes.length;
    return { linear: true, slope };
  } catch (e) {
    throw new Error(`cauchyFunctional失败：${(e as Error).message}`);
  }
}
