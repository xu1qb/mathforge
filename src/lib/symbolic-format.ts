// EXPORTS: toExactForm, formatNumberExact, formatScientificExact, formatFraction, isProbablyRational, isInteger
/**
 * 符号化结果格式化工具
 * 将数值结果尽可能表示为精确的数学符号形式（分数、根号、π、e 等）
 */

const TOL = 1e-9; // 判定容差

function isInteger(x: number): boolean {
  return Number.isInteger(x) || Math.abs(x - Math.round(x)) < TOL;
}

/**
 * 连分数展开找有理近似
 * 返回 [分子, 分母]，若分母 > maxDenom 则返回 null
 */
function rationalApprox(x: number, maxDenom = 10000): [number, number] | null {
  if (isInteger(x)) return [Math.round(x), 1];
  const sign = x < 0 ? -1 : 1;
  let n = Math.abs(x);
  let h0 = 0, h1 = 1;
  let k0 = 1, k1 = 0;
  for (let i = 0; i < 20; i++) {
    const a = Math.floor(n);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (k2 > maxDenom) break;
    if (Math.abs(Math.abs(x) - h2 / k2) < TOL * Math.max(1, Math.abs(x))) {
      return [sign * h2, k2];
    }
    h0 = h1; h1 = h2;
    k0 = k1; k1 = k2;
    n = 1 / (n - a);
    if (!isFinite(n)) break;
  }
  return null;
}

export interface ExactResult {
  /** 符号形式的字符串表示，如 "2√3/3"、"π/2"、"1/3" */
  exact: string;
  /** 小数值 */
  numeric: number;
  /** 是否成功找到精确形式（false 表示只能用小数） */
  isExact: boolean;
  /** 形式分类：'integer' | 'fraction' | 'radical' | 'pi' | 'e' | 'decimal' */
  kind: 'integer' | 'fraction' | 'radical' | 'pi' | 'e' | 'decimal' | 'special';
}

/**
 * 尝试将一个数字表示为精确数学形式
 * 优先级：整数 > 分数 > π 的有理倍数 > e 的有理倍数 > 根号形式 > 小数
 */
export function toExactForm(value: number): ExactResult {
  if (!isFinite(value)) {
    return { exact: value > 0 ? '∞' : '-∞', numeric: value, isExact: true, kind: 'special' };
  }
  if (isNaN(value)) {
    return { exact: 'NaN', numeric: value, isExact: true, kind: 'special' };
  }
  if (value === 0) {
    return { exact: '0', numeric: 0, isExact: true, kind: 'integer' };
  }

  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  // 1. 整数
  if (isInteger(abs)) {
    return { exact: sign + Math.round(abs), numeric: value, isExact: true, kind: 'integer' };
  }

  // 2. 简单分数 (分母 ≤ 10000)
  const frac = rationalApprox(abs, 10000);
  if (frac && frac[1] > 1 && frac[1] <= 999) {
    const approxVal = frac[0] / frac[1];
    if (Math.abs(approxVal - abs) < TOL * Math.max(1, abs)) {
      return {
        exact: sign + frac[0] + '/' + frac[1],
        numeric: value,
        isExact: true,
        kind: 'fraction',
      };
    }
  }

  // 3. π 的有理倍数：value = p/q * π
  const piRatio = abs / Math.PI;
  const piFrac = rationalApprox(piRatio, 200);
  if (piFrac && Math.abs(piFrac[0] / piFrac[1] - piRatio) < TOL * piRatio) {
    const [p, q] = piFrac;
    if (p > 0 && p <= 100 && q <= 100) {
      let expr = 'π';
      if (p !== 1) expr = p + 'π';
      if (q !== 1) expr = expr + '/' + q;
      return { exact: sign + expr, numeric: value, isExact: true, kind: 'pi' };
    }
  }

  // 4. e 的有理倍数
  const eRatio = abs / Math.E;
  const eFrac = rationalApprox(eRatio, 200);
  if (eFrac && Math.abs(eFrac[0] / eFrac[1] - eRatio) < TOL * eRatio) {
    const [p, q] = eFrac;
    if (p > 0 && p <= 100 && q <= 100) {
      let expr = 'e';
      if (p !== 1) expr = p + 'e';
      if (q !== 1) expr = expr + '/' + q;
      return { exact: sign + expr, numeric: value, isExact: true, kind: 'e' };
    }
  }

  // 5. 完全平方数开根：value = √n（检查 value² 是否为整数）
  const square = abs * abs;
  if (isInteger(square) && square > 1 && square <= 10000) {
    const n = Math.round(square);
    // 化简 √n：提取平方因子
    const simplified = simplifySqrt(n);
    if (simplified.coeff === 1) {
      return { exact: sign + '√' + simplified.radicand, numeric: value, isExact: true, kind: 'radical' };
    } else {
      return { exact: sign + simplified.coeff + '√' + simplified.radicand, numeric: value, isExact: true, kind: 'radical' };
    }
  }

  // 5b. value = p/q * √n，如 √2/2 = 0.707..., 2√3 = 3.464...
  // 尝试 value² = p²/q² * n → value² * q² / p² = n
  // 简化：尝试找分数 a/b 使得 (value*b/a)² 为整数
  for (let denom = 1; denom <= 50; denom++) {
    for (let num = 1; num <= 50; num++) {
      const candidate = abs * denom / num;
      const sq = candidate * candidate;
      if (isInteger(sq) && sq > 1 && sq <= 10000) {
        const n = Math.round(sq);
        const simplified = simplifySqrt(n);
        if (simplified.radicand === 1) continue; // 退化为有理数
        // value = num/denom * √n = num*coeff/denom * √radicand
        const coeffNum = num * simplified.coeff;
        // 化简 coeffNum / denom
        const g = gcd(coeffNum, denom);
        const cn = coeffNum / g;
        const cd = denom / g;
        let expr: string;
        if (cn === 1) {
          expr = '√' + simplified.radicand;
        } else {
          expr = cn + '√' + simplified.radicand;
        }
        if (cd !== 1) {
          expr = expr + '/' + cd;
        }
        // 验证
        const approx = (cn / cd) * Math.sqrt(simplified.radicand);
        if (Math.abs(approx - abs) < TOL * abs) {
          return { exact: sign + expr, numeric: value, isExact: true, kind: 'radical' };
        }
      }
    }
  }

  // 6. 三角函数特殊值反推：sin/cos/tan 的特殊角
  const trig = detectTrigSpecial(abs);
  if (trig) {
    return { exact: sign + trig, numeric: value, isExact: true, kind: 'radical' };
  }

  // 7. 小数形式（标注 ≈）
  const rounded = Math.round(value * 1e12) / 1e12;
  return { exact: rounded.toString(), numeric: value, isExact: false, kind: 'decimal' };
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/**
 * 化简 √n：提取平方因子，返回 { coeff, radicand }
 * 例：√12 = 2√3 → { coeff: 2, radicand: 3 }
 */
function simplifySqrt(n: number): { coeff: number; radicand: number } {
  let coeff = 1;
  let remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    while (remaining % (p * p) === 0) {
      coeff *= p;
      remaining /= (p * p);
    }
  }
  return { coeff, radicand: remaining };
}

/**
 * 检测是否为常见三角函数特殊值
 */
function detectTrigSpecial(v: number): string | null {
  const specials: { val: number; expr: string }[] = [
    { val: 0.5, expr: '1/2' },
    { val: Math.sqrt(3) / 2, expr: '√3/2' },
    { val: Math.sqrt(2) / 2, expr: '√2/2' },
    { val: Math.sqrt(3) / 3, expr: '√3/3' },
    { val: Math.sqrt(3), expr: '√3' },
    { val: 1 / Math.sqrt(3), expr: '√3/3' },
    { val: Math.sqrt(6) / 4, expr: '√6/4' },
    { val: Math.sqrt(2) / 4, expr: '√2/4' },
    { val: (Math.sqrt(6) + Math.sqrt(2)) / 4, expr: '(√6+√2)/4' },
    { val: (Math.sqrt(6) - Math.sqrt(2)) / 4, expr: '(√6-√2)/4' },
    { val: 2 + Math.sqrt(3), expr: '2+√3' },
    { val: 2 - Math.sqrt(3), expr: '2-√3' },
  ];
  for (const s of specials) {
    if (Math.abs(v - s.val) < TOL * Math.max(1, v)) {
      return s.expr;
    }
  }
  return null;
}

/**
 * 将数字格式化为精确形式字符串
 * 若能精确表示则直接返回，否则返回 "≈ 小数"
 */
export function formatNumberExact(value: number): string {
  const result = toExactForm(value);
  if (result.isExact) return result.exact;
  return '≈ ' + result.exact;
}

/**
 * 科学计算器结果格式化：尝试符号化
 * - 整数直接返回
 * - 分数、π、e、根号等用符号表示
 * - 无法符号化时保留小数并加 ≈
 */
export function formatScientificExact(value: number, precision = 10): string {
  if (!isFinite(value)) return value > 0 ? '∞' : '-∞';
  if (isNaN(value)) return 'NaN';

  const exact = toExactForm(value);

  // 如果是整数，直接返回
  if (exact.kind === 'integer') return exact.exact;

  // 如果能精确表示，返回符号形式
  if (exact.isExact) return exact.exact;

  // 小数：使用指定精度
  const abs = Math.abs(value);
  if (abs === 0) return '0';
  if (abs >= 1e15 || abs < 1e-10) {
    return '≈ ' + value.toExponential(precision - 1);
  }
  // 修复浮点误差
  const rounded = Math.round(value * 1e12) / 1e12;
  return '≈ ' + rounded.toString();
}

/**
 * 格式化为分数形式（若可以），否则返回小数
 */
export function formatFraction(value: number): string {
  if (isInteger(value)) return Math.round(value).toString();
  const frac = rationalApprox(value, 10000);
  if (frac) return frac[0] + '/' + frac[1];
  return value.toString();
}

/**
 * 判断一个数是否"可能是有理数"（分母不太大）
 */
export function isProbablyRational(value: number): boolean {
  if (isInteger(value)) return true;
  const frac = rationalApprox(value, 10000);
  if (!frac) return false;
  return Math.abs(frac[0] / frac[1] - value) < TOL * Math.max(1, Math.abs(value));
}

export { isInteger };
