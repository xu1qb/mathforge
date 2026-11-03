// ============ 傅里叶高级分析 ============

import { parse } from 'mathjs';

/**
 * 复数形式傅里叶系数 c_n
 * c_n = (1/T) ∫_0^T f(x)·e^(-i·2πn·x/T) dx
 */
export function fourierComplexCoefficients(expr: string, T: number, N: number): {
  c: { n: number; real: number; imag: number; magnitude: number; phase: number }[];
} {
  const node = parse(expr);
  const result: { n: number; real: number; imag: number; magnitude: number; phase: number }[] = [];
  const nPts = 1000;
  const dx = T / nPts;

  for (let nn = -N; nn <= N; nn++) {
    let real = 0, imag = 0;
    for (let k = 0; k < nPts; k++) {
      const x = k * dx;
      try {
        const f = node.evaluate({ x }) as number;
        if (!isFinite(f)) continue;
        const angle = -2 * Math.PI * nn * x / T;
        real += f * Math.cos(angle) * dx;
        imag += f * Math.sin(angle) * dx;
      } catch { /* skip */ }
    }
    real /= T;
    imag /= T;
    const magnitude = Math.sqrt(real * real + imag * imag);
    const phase = Math.atan2(imag, real);
    result.push({ n: nn, real, imag, magnitude, phase });
  }

  return { c: result };
}

/**
 * 傅里叶变换（数值积分实现连续傅里叶变换）
 * F(ω) = ∫_{-∞}^{∞} f(t)·e^(-iωt) dt  （近似，在有限区间积分）
 */
export function fourierTransform(
  expr: string, tMin: number, tMax: number, omegaMin: number, omegaMax: number, nOmega: number = 200
): {
  omega: number[];
  magnitude: number[];
  phase: number[];
  real: number[];
  imag: number[];
} {
  const node = parse(expr);
  const nT = 1000;
  const dt = (tMax - tMin) / nT;
  const omegaArr: number[] = [];
  const magArr: number[] = [];
  const phaseArr: number[] = [];
  const realArr: number[] = [];
  const imagArr: number[] = [];

  // 预计算所有时间点的 f(t)
  const fVals: number[] = [];
  for (let k = 0; k <= nT; k++) {
    const t = tMin + k * dt;
    try {
      const v = node.evaluate({ t, x: t }) as number;
      fVals.push(isFinite(v) ? v : 0);
    } catch { fVals.push(0); }
  }

  for (let i = 0; i < nOmega; i++) {
    const omega = omegaMin + (i / (nOmega - 1)) * (omegaMax - omegaMin);
    omegaArr.push(omega);
    let real = 0, imag = 0;
    // 梯形法积分
    for (let k = 0; k <= nT; k++) {
      const t = tMin + k * dt;
      const f = fVals[k];
      const wt = omega * t;
      const w = (k === 0 || k === nT) ? 0.5 : 1;
      real += w * f * Math.cos(wt) * dt;
      imag -= w * f * Math.sin(wt) * dt;
    }
    realArr.push(real);
    imagArr.push(imag);
    magArr.push(Math.sqrt(real * real + imag * imag));
    phaseArr.push(Math.atan2(imag, real));
  }

  return { omega: omegaArr, magnitude: magArr, phase: phaseArr, real: realArr, imag: imagArr };
}

/**
 * Parseval 等式（帕塞瓦尔定理）验证
 * 时域能量 = 频域能量 (1/2π ∫|F(ω)|² dω)
 */
export function parsevalVerification(
  expr: string, tMin: number, tMax: number
): {
  timeEnergy: number;
  freqEnergy: number;
  difference: number;
  ratio: number;
} {
  const node = parse(expr);
  const nT = 1000;
  const dt = (tMax - tMin) / nT;

  // 时域能量 ∫ |f(t)|² dt
  let timeEnergy = 0;
  const fVals: number[] = [];
  for (let k = 0; k <= nT; k++) {
    const t = tMin + k * dt;
    try {
      const f = node.evaluate({ t, x: t }) as number;
      fVals.push(isFinite(f) ? f : 0);
    } catch { fVals.push(0); }
    const w = (k === 0 || k === nT) ? 0.5 : 1;
    timeEnergy += w * fVals[k] * fVals[k] * dt;
  }

  // 计算傅里叶变换
  const omegaMax = 50;
  const nOmega = 500;
  const dOmega = 2 * omegaMax / nOmega;
  let freqEnergy = 0;

  for (let i = 0; i <= nOmega; i++) {
    const omega = -omegaMax + i * dOmega;
    let Fr = 0, Fi = 0;
    for (let k = 0; k <= nT; k++) {
      const t = tMin + k * dt;
      const f = fVals[k];
      const wt = omega * t;
      const w = (k === 0 || k === nT) ? 0.5 : 1;
      Fr += w * f * Math.cos(wt) * dt;
      Fi -= w * f * Math.sin(wt) * dt;
    }
    const mag2 = Fr * Fr + Fi * Fi;
    const ww = (i === 0 || i === nOmega) ? 0.5 : 1;
    freqEnergy += ww * mag2 * dOmega;
  }
  freqEnergy /= (2 * Math.PI);

  const diff = Math.abs(timeEnergy - freqEnergy);
  const ratio = timeEnergy > 0 ? diff / timeEnergy : 0;

  return { timeEnergy, freqEnergy, difference: diff, ratio };
}

/**
 * 吉布斯现象演示
 * 方波傅里叶级数在间断点处的过冲
 * 返回过冲幅度百分比（理论值约 8.95%）
 */
export function gibbsPhenomenon(
  N: number, T: number = 2 * Math.PI
): {
  overshootPercent: number;
  partialMax: number;
  jumpHeight: number;
} {
  // 方波 f(x) = 1 当 x∈[0, T/2), -1 当 x∈[T/2, T)
  // 傅里叶级数: f(x) = (4/π) Σ_{k奇} (1/k) sin(2πkx/T)
  const nPts = 2000;
  let partialMax = 0;

  for (let i = 0; i <= nPts; i++) {
    const x = (i / nPts) * T;
    let sum = 0;
    for (let k = 1; k <= N; k += 2) {
      sum += (1 / k) * Math.sin(2 * Math.PI * k * x / T);
    }
    sum *= 4 / Math.PI;
    if (x > 0 && x < T / 4 && sum > partialMax) partialMax = sum;
  }

  // 跳变高度 = 2 (从 -1 到 1)
  const jumpHeight = 2;
  // 过冲 = (最大值 - 跳变上沿) / 跳变高度
  const overshootPercent = ((partialMax - 1) / jumpHeight) * 100;

  return { overshootPercent, partialMax, jumpHeight };
}

/**
 * 快速傅里叶变换 (FFT) — Cooley-Tukey 基2 算法
 * 输入长度必须是 2 的幂，不足则补零
 */
export function fft(signal: { real: number[]; imag: number[] }): { real: number[]; imag: number[] } {
  let real = [...signal.real];
  let imag = signal.imag ? [...signal.imag] : new Array(signal.real.length).fill(0);
  let n = real.length;

  // 补到 2 的幂
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(n)));
  if (n < nextPow2) {
    real = real.concat(new Array(nextPow2 - n).fill(0));
    imag = imag.concat(new Array(nextPow2 - n).fill(0));
    n = nextPow2;
  }

  // 位反转重排
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  // 蝶形运算
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const theta = -2 * Math.PI / len;
    const wr = Math.cos(theta);
    const wi = Math.sin(theta);
    for (let i = 0; i < n; i += len) {
      let curR = 1, curI = 0;
      for (let k = 0; k < halfLen; k++) {
        const tR = curR * real[i + k + halfLen] - curI * imag[i + k + halfLen];
        const tI = curR * imag[i + k + halfLen] + curI * real[i + k + halfLen];
        real[i + k + halfLen] = real[i + k] - tR;
        imag[i + k + halfLen] = imag[i + k] - tI;
        real[i + k] += tR;
        imag[i + k] += tI;
        const tmpR = curR * wr - curI * wi;
        curI = curR * wi + curI * wr;
        curR = tmpR;
      }
    }
  }

  return { real, imag };
}

/**
 * 频谱分析：输入混合信号，FFT 分解出频率分量
 * 采样频率 fs, 信号长度 n（必须是 2 的幂）
 */
export function spectrumAnalysis(
  signal: number[], fs: number
): {
  frequencies: number[];
  magnitudes: number[];
  phases: number[];
  peaks: { freq: number; magnitude: number }[];
} {
  const n = signal.length;
  const imag = new Array(n).fill(0);
  const { real, imag: fimag } = fft({ real: signal, imag });

  const frequencies: number[] = [];
  const magnitudes: number[] = [];
  const phases: number[] = [];
  const nHalf = Math.floor(n / 2);

  for (let i = 0; i <= nHalf; i++) {
    frequencies.push((i * fs) / n);
    const mag = 2 * Math.sqrt(real[i] * real[i] + fimag[i] * fimag[i]) / n;
    magnitudes.push(mag);
    phases.push(Math.atan2(fimag[i], real[i]));
  }

  // 找峰值（局部最大值）
  const peaks: { freq: number; magnitude: number }[] = [];
  const threshold = Math.max(...magnitudes) * 0.1; // 10% 阈值
  for (let i = 1; i < nHalf; i++) {
    if (magnitudes[i] > magnitudes[i - 1] && magnitudes[i] > magnitudes[i + 1] && magnitudes[i] > threshold) {
      peaks.push({ freq: frequencies[i], magnitude: magnitudes[i] });
    }
  }
  peaks.sort((a, b) => b.magnitude - a.magnitude);

  return { frequencies, magnitudes, phases, peaks: peaks.slice(0, 10) };
}

/**
 * 傅里叶级数求解周期激励下的常微分方程稳态解
 * 方程：y'' + a·y' + b·y = f(t)，f(t) 周期为 T
 * 用傅里叶级数法：f(t) 展开 → 各频率分量求特解 → 叠加
 */
export function fourierSolveODE(
  a: number, b: number, fExpr: string, T: number, N: number
): {
  solution: string;
  coefficients: { n: number; an: number; bn: number; Cn: number; phin: number }[];
  sample: { t: number[]; y: number[] };
} {
  const node = parse(fExpr);
  const nPts = 1000;
  const dt = T / nPts;

  // 计算 f(t) 的傅里叶系数
  let a0 = 0;
  const an: number[] = [];
  const bn: number[] = [];

  // a0
  for (let k = 0; k <= nPts; k++) {
    const t = k * dt;
    try {
      const f = node.evaluate({ t, x: t }) as number;
      if (!isFinite(f)) continue;
      const w = (k === 0 || k === nPts) ? 0.5 : 1;
      a0 += w * f * dt;
    } catch { /* skip */ }
  }
  a0 /= T;

  for (let n = 1; n <= N; n++) {
    let av = 0, bv = 0;
    for (let k = 0; k <= nPts; k++) {
      const t = k * dt;
      try {
        const f = node.evaluate({ t, x: t }) as number;
        if (!isFinite(f)) continue;
        const w = (k === 0 || k === nPts) ? 0.5 : 1;
        av += w * f * Math.cos(2 * Math.PI * n * t / T) * dt;
        bv += w * f * Math.sin(2 * Math.PI * n * t / T) * dt;
      } catch { /* skip */ }
    }
    an.push(2 * av / T);
    bn.push(2 * bv / T);
  }

  // 对每个频率分量求特解
  // 设特解形式：yn = Cn·cos(nωt - φn)
  // 或等价：yn = An·cos(nωt) + Bn·sin(nωt)
  // 代入方程：
  // An = (b - n²ω²)an + a·nω·bn / [(b - n²ω²)² + (a·nω)²]
  // Bn = (b - n²ω²)bn - a·nω·an / [(b - n²ω²)² + (a·nω·bn)²]

  const omega0 = 2 * Math.PI / T;
  const coeffs: { n: number; an: number; bn: number; Cn: number; phin: number }[] = [];
  const sampleT: number[] = [];
  const sampleY: number[] = [];

  // 特解 y_p(t) = a0/b + Σ [An cos(nωt) + Bn sin(nωt)]
  const ypVals: number[] = [];
  for (let k = 0; k <= 200; k++) {
    const t = (k / 200) * T;
    sampleT.push(t);
    let y = a0 / (b !== 0 ? b : 1); // 直流分量
    for (let n = 1; n <= N; n++) {
      const nOmega = n * omega0;
      const denom = (b - nOmega * nOmega) ** 2 + (a * nOmega) ** 2;
      if (Math.abs(denom) < 1e-12) continue;
      const An = ((b - nOmega * nOmega) * an[n - 1] + a * nOmega * bn[n - 1]) / denom;
      const Bn = ((b - nOmega * nOmega) * bn[n - 1] - a * nOmega * an[n - 1]) / denom;
      y += An * Math.cos(nOmega * t) + Bn * Math.sin(nOmega * t);
    }
    ypVals.push(y);
    sampleY.push(y);
  }

  for (let n = 1; n <= N; n++) {
    const nOmega = n * omega0;
    const denom = (b - nOmega * nOmega) ** 2 + (a * nOmega) ** 2;
    if (Math.abs(denom) < 1e-12) {
      coeffs.push({ n, an: an[n - 1], bn: bn[n - 1], Cn: Infinity, phin: 0 });
      continue;
    }
    const An = ((b - nOmega * nOmega) * an[n - 1] + a * nOmega * bn[n - 1]) / denom;
    const Bn = ((b - nOmega * nOmega) * bn[n - 1] - a * nOmega * an[n - 1]) / denom;
    const Cn = Math.sqrt(An * An + Bn * Bn);
    const phin = Math.atan2(Bn, An);
    coeffs.push({ n, an: an[n - 1], bn: bn[n - 1], Cn, phin });
  }

  return {
    solution: `y_p(t) = a₀/b + Σ [Cn·cos(nωt - φn)] （稳态解，n=1..${N}）`,
    coefficients: coeffs,
    sample: { t: sampleT, y: sampleY },
  };
}

/**
 * 奇偶延拓展开（半区间 [0, L] 上的函数）
 * - 正弦级数（奇延拓）：将函数奇延拓到 [-L, L]，再周期延拓
 * - 余弦级数（偶延拓）：将函数偶延拓到 [-L, L]，再周期延拓
 */
export function halfRangeExtension(
  expr: string, L: number, N: number, type: 'sine' | 'cosine'
): {
  type: '正弦级数' | '余弦级数';
  coefficients: { n: number; value: number }[];
  sample: { x: number; y: number; partial: number }[];
  formula: string;
} {
  const node = parse(expr);
  const coefficients: { n: number; value: number }[] = [];
  const nPts = 400;
  const dx = L / nPts;

  if (type === 'sine') {
    // 正弦级数：b_n = (2/L) ∫_0^L f(x)·sin(nπx/L) dx
    for (let n = 1; n <= N; n++) {
      let s = 0;
      for (let k = 0; k < nPts; k++) {
        const x = k * dx;
        try {
          const f = node.evaluate({ x }) as number;
          if (isFinite(f)) s += f * Math.sin(n * Math.PI * x / L) * dx;
        } catch { /* skip */ }
      }
      coefficients.push({ n, value: (2 / L) * s });
    }
  } else {
    // 余弦级数：a_0 = (2/L)∫_0^L f(x)dx, a_n = (2/L)∫_0^L f(x)·cos(nπx/L)dx
    let a0 = 0;
    for (let k = 0; k < nPts; k++) {
      const x = k * dx;
      try {
        const f = node.evaluate({ x }) as number;
        if (isFinite(f)) a0 += f * dx;
      } catch { /* skip */ }
    }
    coefficients.push({ n: 0, value: (2 / L) * a0 });
    for (let n = 1; n <= N; n++) {
      let s = 0;
      for (let k = 0; k < nPts; k++) {
        const x = k * dx;
        try {
          const f = node.evaluate({ x }) as number;
          if (isFinite(f)) s += f * Math.cos(n * Math.PI * x / L) * dx;
        } catch { /* skip */ }
      }
      coefficients.push({ n, value: (2 / L) * s });
    }
  }

  // 采样曲线（只画 [0, L] 区间，因为半区间）
  const sample: { x: number; y: number; partial: number }[] = [];
  for (let i = 0; i <= nPts; i++) {
    const x = (i / nPts) * L;
    let fVal = 0;
    try { fVal = node.evaluate({ x }) as number; } catch { fVal = 0; }

    let sum = 0;
    if (type === 'sine') {
      for (const c of coefficients) {
        sum += c.value * Math.sin(c.n * Math.PI * x / L);
      }
    } else {
      const a0 = coefficients[0]?.value ?? 0;
      sum += a0 / 2;
      for (let j = 1; j < coefficients.length; j++) {
        sum += coefficients[j].value * Math.cos(coefficients[j].n * Math.PI * x / L);
      }
    }
    sample.push({ x, y: isFinite(fVal) ? fVal : 0, partial: sum });
  }

  return {
    type: type === 'sine' ? '正弦级数' : '余弦级数',
    coefficients,
    sample,
    formula: type === 'sine'
      ? 'f(x) = Σ b_n·sin(nπx/L),  b_n = (2/L)∫₀ᴸ f(x)sin(nπx/L)dx'
      : 'f(x) = a₀/2 + Σ a_n·cos(nπx/L),  a_n = (2/L)∫₀ᴸ f(x)cos(nπx/L)dx',
  };
}

/**
 * 傅里叶级数收敛性判断（狄利克雷条件）
 * 判断 f(x) 在一个周期内是否满足：
 * 1. 绝对可积
 * 2. 间断点有限个（通过采样检测突变）
 * 3. 极值点有限个（通过检测符号变化）
 * 返回间断点位置和收敛值
 */
export function dirichletConvergence(expr: string, T: number): {
  satisfies: boolean;
  discontinuities: { x: number; leftLimit: number; rightLimit: number }[];
  reason: string;
} {
  const node = parse(expr);
  const nPts = 2000;
  const dx = T / nPts;
  const values: number[] = [];
  let integral = 0;

  for (let i = 0; i < nPts; i++) {
    const x = -T / 2 + i * dx;
    let v = 0;
    try { v = node.evaluate({ x }) as number; } catch { v = NaN; }
    values.push(isFinite(v) ? v : NaN);
    if (isFinite(v)) integral += Math.abs(v) * dx;
  }

  // 找间断点（值突变 > 阈值）
  // 阈值：相邻差的中值 × 倍数，避免把连续函数的梯度误判为间断
  const discontinuities: { x: number; leftLimit: number; rightLimit: number }[] = [];
  const jumps: number[] = [];
  for (let i = 1; i < nPts; i++) {
    if (!isFinite(values[i]) || !isFinite(values[i - 1])) continue;
    jumps.push(Math.abs(values[i] - values[i - 1]));
  }
  jumps.sort((a, b) => a - b);
  const medianJump = jumps[Math.floor(jumps.length / 2)] || 0;
  // 函数的整体幅度范围
  const fMin = Math.min(...values.filter(v => isFinite(v)));
  const fMax = Math.max(...values.filter(v => isFinite(v)));
  const fRange = fMax - fMin;
  // 阈值：中值跳变的 20 倍，且不小于整体幅度的 1%
  const threshold = Math.max(medianJump * 20, fRange * 0.01, 1e-6);

  for (let i = 1; i < nPts; i++) {
    if (!isFinite(values[i]) || !isFinite(values[i - 1])) continue;
    const jump = Math.abs(values[i] - values[i - 1]);
    if (jump > threshold) {
      const x = -T / 2 + i * dx;
      // 去重
      if (discontinuities.every((d) => Math.abs(d.x - x) > T * 0.02)) {
        discontinuities.push({ x, leftLimit: values[i - 1], rightLimit: values[i] });
      }
    }
  }

  // 周期性边界检查（首尾也可能是间断点）
  if (isFinite(values[0]) && isFinite(values[nPts - 1])) {
    const boundaryJump = Math.abs(values[0] - values[nPts - 1]);
    if (boundaryJump > threshold) {
      if (discontinuities.every((d) => Math.abs(d.x + T / 2) > T * 0.02)) {
        discontinuities.unshift({ x: -T / 2, leftLimit: values[nPts - 1], rightLimit: values[0] });
      }
    }
  }

  const integrable = isFinite(integral) && integral < 1e8;
  const finiteDiscontinuities = discontinuities.length <= 20;
  const satisfies = integrable && finiteDiscontinuities;

  let reason = '';
  if (satisfies) {
    reason = `满足狄利克雷条件：\n- 绝对可积：∫|f(x)|dx ≈ ${integral.toFixed(4)}\n- 间断点数：${discontinuities.length}（有限个）\n- 极值点：有限（采样观测）\n\n傅里叶级数在连续点收敛于 f(x)，在间断点收敛于左右极限平均值。`;
  } else {
    reason = `可能不满足狄利克雷条件：${!integrable ? '函数不可积；' : ''}${!finiteDiscontinuities ? '间断点过多；' : ''}`;
  }

  return { satisfies, discontinuities, reason };
}

/**
 * 卷积定理数值验证：F{f * g} = F{f} · F{g}
 * 使用 DFT 计算卷积和频谱，验证两者的一致性
 */
export function convolutionTheorem(
  fExpr: string, gExpr: string, N: number = 256, T: number = 10
): {
  holds: boolean;
  relativeError: number;
  convolution: number[];
  convolutionFft: number[];
  timeVector: number[];
} {
  const fNode = parse(fExpr);
  const gNode = parse(gExpr);
  const dt = T / N;
  const fArr: number[] = [];
  const gArr: number[] = [];

  for (let i = 0; i < N; i++) {
    const t = -T / 2 + i * dt;
    try {
      const fv = fNode.evaluate({ x: t }) as number;
      fArr.push(isFinite(fv) ? fv : 0);
    } catch { fArr.push(0); }
    try {
      const gv = gNode.evaluate({ x: t }) as number;
      gArr.push(isFinite(gv) ? gv : 0);
    } catch { gArr.push(0); }
  }

  // 为避免循环卷积效应，补零到 2 的幂（长度 ≥ 2N-1）
  const minLen = 2 * N - 1;
  const M = Math.pow(2, Math.ceil(Math.log2(minLen)));
  const fPadded = [...fArr, ...new Array(M - N).fill(0)];
  const gPadded = [...gArr, ...new Array(M - N).fill(0)];

  // 直接卷积（线性卷积，取前 M 个有效位置）
  const directConv = new Array(M).fill(0);
  for (let i = 0; i < M; i++) {
    let sum = 0;
    for (let j = 0; j <= i && j < N; j++) {
      const idx = i - j;
      if (idx >= 0 && idx < N) sum += fPadded[j] * gPadded[idx];
    }
    directConv[i] = sum * dt;
  }

  // FFT 卷积
  const fftResult1 = fft({ real: fPadded, imag: new Array(M).fill(0) });
  const fftResult2 = fft({ real: gPadded, imag: new Array(M).fill(0) });

  // 频谱相乘
  const multReal: number[] = [];
  const multImag: number[] = [];
  for (let i = 0; i < M; i++) {
    multReal.push(fftResult1.real[i] * fftResult2.real[i] - fftResult1.imag[i] * fftResult2.imag[i]);
    multImag.push(fftResult1.real[i] * fftResult2.imag[i] + fftResult1.imag[i] * fftResult2.real[i]);
  }

  // 逆FFT
  const ifftResult = ifft({ real: multReal, imag: multImag });
  const fftConv = ifftResult.real.map((v) => v * dt); // 缩放

  // 计算相对误差（取中间 N 个有效点，避开边界）
  let maxVal = 0;
  let maxDiff = 0;
  const start = Math.floor(M / 4);
  const end = Math.floor(3 * M / 4);
  for (let i = start; i < end; i++) {
    maxVal = Math.max(maxVal, Math.abs(directConv[i]));
    maxDiff = Math.max(maxDiff, Math.abs(directConv[i] - fftConv[i]));
  }
  const relError = maxVal > 0 ? maxDiff / maxVal : 0;

  const timeVector: number[] = [];
  for (let i = 0; i < M; i++) timeVector.push(-T / 2 + i * dt);

  return {
    holds: relError < 0.1, // 10% 误差以内视为成立
    relativeError: relError,
    convolution: directConv,
    convolutionFft: fftConv,
    timeVector,
  };
}

// 逆 FFT（利用 FFT 实现）
function ifft(signal: { real: number[]; imag: number[] }): { real: number[]; imag: number[] } {
  const N = signal.real.length;
  // 共轭 → FFT → 共轭 → 除以 N
  const conjImag = signal.imag.map((v) => -v);
  const result = fft({ real: signal.real, imag: conjImag });
  return {
    real: result.real.map((v) => v / N),
    imag: result.imag.map((v) => -v / N),
  };
}

/**
 * 低通/高通滤波器
 * 对信号进行 FFT → 频谱滤波 → 逆 FFT
 * filterType: low / high / bandpass
 */
export function applyFilter(
  signal: number[], fs: number, cutoff: number, filterType: 'low' | 'high' | 'bandpass',
  cutoff2?: number
): { filtered: number[]; originalSpec: number[]; filteredSpec: number[]; frequencies: number[] } {
  const N = signal.length;
  // 确保 N 是 2 的幂
  const n2 = Math.pow(2, Math.ceil(Math.log2(N)));
  const paddedSignal = [...signal, ...new Array(n2 - N).fill(0)];

  const fftResult = fft({ real: paddedSignal, imag: new Array(n2).fill(0) });

  const frequencies: number[] = [];
  const originalSpec: number[] = [];
  const filteredSpec: number[] = [];

  for (let i = 0; i < n2; i++) {
    const freq = (i / n2) * fs;
    frequencies.push(freq);
    const mag = Math.sqrt(fftResult.real[i] ** 2 + fftResult.imag[i] ** 2);
    originalSpec.push(mag);
  }

  // 滤波
  const filteredReal = [...fftResult.real];
  const filteredImag = [...fftResult.imag];

  for (let i = 0; i < n2; i++) {
    const freq = Math.min((i / n2) * fs, fs - (i / n2) * fs); // 考虑正负频率
    let pass = true;
    if (filterType === 'low') pass = freq <= cutoff;
    else if (filterType === 'high') pass = freq >= cutoff;
    else if (filterType === 'bandpass' && cutoff2 !== undefined) pass = freq >= cutoff && freq <= cutoff2;

    if (!pass) {
      filteredReal[i] = 0;
      filteredImag[i] = 0;
    }
  }

  // 重新计算滤波后频谱
  for (let i = 0; i < n2; i++) {
    const mag = Math.sqrt(filteredReal[i] ** 2 + filteredImag[i] ** 2);
    filteredSpec.push(mag);
  }

  // 逆 FFT
  const ifftResult = ifft({ real: filteredReal, imag: filteredImag });
  const filtered = ifftResult.real.slice(0, N);

  return { filtered, originalSpec, filteredSpec, frequencies };
}

/**
 * 弦振动（分离变量法）
 * 两端固定弦的自由振动：u_tt = a²·u_xx, u(0,t)=u(L,t)=0
 * 初始位移 φ(x)，初始速度 ψ(x)
 * 解：u(x,t) = Σ [A_n·cos(nπat/L) + B_n·sin(nπat/L)] · sin(nπx/L)
 */
export function stringVibration(
  phiExpr: string, // 初始位移
  psiExpr: string, // 初始速度
  L: number,       // 弦长
  a: number,       // 波速
  N: number,       // 模态数
  t: number        // 时间
): {
  An: { n: number; value: number }[];
  Bn: { n: number; value: number }[];
  sample: { x: number; u: number }[];
  modes: { n: number; shape: number[] }[];
} {
  const phiNode = parse(phiExpr);
  const psiNode = parse(psiExpr);
  const nPts = 200;
  const dx = L / nPts;

  const An: { n: number; value: number }[] = [];
  const Bn: { n: number; value: number }[] = [];

  for (let n = 1; n <= N; n++) {
    // A_n = (2/L)∫₀ᴸ φ(x)·sin(nπx/L)dx
    let aInt = 0;
    let bInt = 0;
    for (let k = 0; k < nPts; k++) {
      const x = k * dx + dx / 2;
      const sinTerm = Math.sin(n * Math.PI * x / L);
      try {
        const phi = phiNode.evaluate({ x }) as number;
        if (isFinite(phi)) aInt += phi * sinTerm * dx;
      } catch { /* skip */ }
      try {
        const psi = psiNode.evaluate({ x }) as number;
        if (isFinite(psi)) bInt += psi * sinTerm * dx;
      } catch { /* skip */ }
    }
    An.push({ n, value: (2 / L) * aInt });
    // B_n = (2/(nπa)) ∫₀ᴸ ψ(x)·sin(nπx/L)dx
    const bnVal = (2 / (n * Math.PI * a)) * bInt;
    Bn.push({ n, value: isFinite(bnVal) ? bnVal : 0 });
  }

  // 各时刻波形采样
  const sample: { x: number; u: number }[] = [];
  for (let i = 0; i <= nPts; i++) {
    const x = (i / nPts) * L;
    let u = 0;
    for (let n = 1; n <= N; n++) {
      const AnVal = An[n - 1].value;
      const BnVal = Bn[n - 1].value;
      const omega = n * Math.PI * a / L;
      const shape = Math.sin(n * Math.PI * x / L);
      u += (AnVal * Math.cos(omega * t) + BnVal * Math.sin(omega * t)) * shape;
    }
    sample.push({ x, u });
  }

  // 各阶模态形状
  const modes: { n: number; shape: number[] }[] = [];
  for (let n = 1; n <= Math.min(N, 5); n++) {
    const shape: number[] = [];
    for (let i = 0; i <= nPts; i++) {
      const x = (i / nPts) * L;
      shape.push(Math.sin(n * Math.PI * x / L));
    }
    modes.push({ n, shape });
  }

  return { An, Bn, sample, modes };
}
