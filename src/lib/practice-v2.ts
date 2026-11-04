// EXPORTS: genLimitV2, genHyperbolicV2, genSeriesV2, genFourierV2, genFunctionPropertyV2, genSequenceLimitV2, genTrigIdentityV2, genIntegralV2
// 参数化出题：题型 × 随机参数，单知识点可产出数百至数千道不同的题
// 约定：源码里用 @ 代表反斜杠，由 mk() 统一还原，避免转义地狱
import type { Difficulty, PracticeQuestion } from './math-practice';

const BS = String.fromCharCode(92);
const L = (s: string) => s.split('@').join(BS);
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pickOne = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const frac = (p: number, q: number) => {
  const g = gcd(p, q) || 1;
  const np = p / g;
  const nq = q / g;
  return nq === 1 ? String(np) : np + '/' + nq;
};
const uid = (p: string) => p + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);

/** 把 LaTeX 里裸露的中文片段自动包进 \text{...}，避免数学模式吞中文 */
function wrapCJK(latex: string): string {
  const guarded: string[] = [];
  let s = latex.replace(/@text\{[^}]*\}/g, (m) => {
    guarded.push(m);
    return "\u0001" + (guarded.length - 1) + "\u0001";
  });
  s = s.replace(/[\u4e00-\u9fa5]+[，。：、；？！]*/g, (m) => '@text{' + m + '}');
  s = s.replace(/[，。：、；？！]+/g, (m) => '@text{' + m + '}');
  const guardRe = new RegExp('' + '(' + BS + 'd+)' + '', 'g');
  s = s.replace(guardRe, (_m, i) => guarded[Number(i)]);
  return s;
}

interface Q {
  topic: string; diff: Difficulty; question: string; latex: string; answer: string;
  display?: string; steps: string[]; type?: 'numeric' | 'expression';
}

const mk = (q: Q): PracticeQuestion => ({
  id: uid(q.topic),
  topicKey: q.topic,
  question: q.question,
  questionLatex: L(wrapCJK(q.latex)),
  answer: q.answer,
  answerDisplay: q.display ?? q.answer,
  answerType: q.type ?? 'numeric',
  steps: q.steps.map(L),
  difficulty: q.diff,
});

// ===== 极限计算 =====
export function genLimitV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['polyCancel', 'sinOverX', 'degRatio']
    : diff === 'advanced'
      ? ['polyCancel', 'sinOverX', 'degRatio', 'eLimit', 'oneMinusCos']
      : ['eLimit', 'lnLimit', 'oneMinusCos', 'degRatio', 'sqrtRational'];
  const kind = pickOne(kinds);

  if (kind === 'polyCancel') {
    const a = rnd(-12, 12) || 1;
    return mk({
      topic: 'limit-basic', diff,
      question: '求极限：lim(x→' + a + ') (x² − ' + (a * a) + ')/(x − ' + a + ')',
      latex: '@lim_{x @to ' + a + '} @dfrac{x^{2} - ' + (a * a) + '}{x - ' + a + '}',
      answer: String(2 * a),
      steps: [
        '分子因式分解：x² − ' + (a * a) + ' = (x − ' + a + ')(x + ' + a + ')',
        '约去 (x − ' + a + ') 后得到 x + ' + a,
        '代入 x = ' + a + '，极限为 ' + (2 * a),
      ],
    });
  }

  if (kind === 'sinOverX') {
    const k = rnd(2, 19);
    return mk({
      topic: 'limit-basic', diff,
      question: '求极限：lim(x→0) sin(' + k + 'x)/x',
      latex: '@lim_{x @to 0} @dfrac{@sin ' + k + 'x}{x}',
      answer: String(k),
      steps: [
        '重要极限：lim(x→0) sin(ax)/x = a',
        '这里 a = ' + k,
        '所以极限为 ' + k,
      ],
    });
  }

  if (kind === 'degRatio') {
    const n = rnd(1, 4);
    const m = rnd(1, 4);
    const a = rnd(2, 30);
    const b = rnd(2, 30);
    const ans = n === m ? frac(a, b) : n < m ? '0' : '无穷大';
    return mk({
      topic: 'limit-basic', diff,
      question: '求极限：lim(x→∞) (' + a + 'x^' + n + ' + 1)/(' + b + 'x^' + m + ' + 1)',
      latex: '@lim_{x @to @infty} @dfrac{' + a + 'x^{' + n + '} + 1}{' + b + 'x^{' + m + '} + 1}',
      answer: ans,
      steps: [
        '比较分子分母最高次：' + n + ' 与 ' + m,
        n === m ? '次数相同，极限为系数比 ' + a + '/' + b + ' = ' + frac(a, b)
          : n < m ? '分母次数更高，极限为 0' : '分子次数更高，趋于无穷',
      ],
      type: 'expression',
    });
  }

  if (kind === 'eLimit') {
    const a = rnd(1, 9);
    const b = rnd(2, 12);
    return mk({
      topic: 'limit-basic', diff,
      question: '已知 lim(x→∞) (1 + ' + a + '/x)^(' + b + 'x) = e^k，求 k',
      latex: '@lim_{x @to @infty} @left(1 + @dfrac{' + a + '}{x}@right)^{' + b + 'x} = e^{k}',
      answer: String(a * b),
      steps: [
        '重要极限：lim(1 + a/x)^(bx) = e^(ab)',
        '这里 a = ' + a + '，b = ' + b,
        '所以 k = ' + (a * b),
      ],
    });
  }

  if (kind === 'oneMinusCos') {
    const k = rnd(1, 6);
    const ans = frac(k * k, 2);
    return mk({
      topic: 'limit-basic', diff,
      question: '求极限：lim(x→0) (1 − cos(' + k + 'x))/x²',
      latex: '@lim_{x @to 0} @dfrac{1 - @cos ' + k + 'x}{x^{2}}',
      answer: ans,
      steps: [
        '等价无穷小：1 − cos t ~ t²/2',
        '令 t = ' + k + 'x，则 1 − cos(' + k + 'x) ~ ' + (k * k) + 'x²/2',
        '极限为 ' + ans,
      ],
    });
  }

  if (kind === 'lnLimit') {
    const a = rnd(1, 9);
    return mk({
      topic: 'limit-basic', diff,
      question: '求极限：lim(x→0) ln(1 + ' + a + 'x)/x',
      latex: '@lim_{x @to 0} @dfrac{@ln(1 + ' + a + 'x)}{x}',
      answer: String(a),
      steps: [
        '等价无穷小：ln(1 + t) ~ t',
        '所以 ln(1 + ' + a + 'x) ~ ' + a + 'x',
        '极限为 ' + a,
      ],
    });
  }

  const a = rnd(1, 30);
  return mk({
    topic: 'limit-basic', diff,
    question: '求极限：lim(x→∞) (√(x² + ' + a + ') − x)',
    latex: '@lim_{x @to @infty} @left(@sqrt{x^{2} + ' + a + '} - x@right)',
    answer: '0',
    steps: [
      '分子有理化：乘以 (√(x²+' + a + ') + x)/(√(x²+' + a + ') + x)',
      '分子化为 ' + a + '，分母趋于无穷',
      '极限为 0',
    ],
  });
}

// ===== 双曲函数 =====
export function genHyperbolicV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['sinhLn', 'coshLn']
    : diff === 'advanced'
      ? ['tanhLn', 'deriv', 'identity']
      : ['deriv', 'identity', 'tanhLn', 'inverse'];
  const kind = pickOne(kinds);

  if (kind === 'sinhLn' || kind === 'coshLn') {
    const k = rnd(2, 12);
    const p = kind === 'sinhLn' ? k * k - 1 : k * k + 1;
    const q = 2 * k;
    const fn = kind === 'sinhLn' ? 'sinh' : 'cosh';
    return mk({
      topic: 'hyperbolic-func', diff,
      question: '求 ' + fn + '(ln ' + k + ') 的值',
      latex: '@' + fn + '(@ln ' + k + ') = ?',
      answer: frac(p, q),
      steps: [
        fn + '(t) = (e^t ' + (kind === 'sinhLn' ? '−' : '+') + ' e^(−t))/2',
        'e^(ln ' + k + ') = ' + k + '，e^(−ln ' + k + ') = 1/' + k,
        '结果为 ' + frac(p, q),
      ],
    });
  }

  if (kind === 'tanhLn') {
    const k = rnd(2, 9);
    return mk({
      topic: 'hyperbolic-func', diff,
      question: '求 tanh(ln ' + k + ') 的值',
      latex: '@tanh(@ln ' + k + ') = ?',
      answer: frac(k * k - 1, k * k + 1),
      steps: [
        'tanh t = (e^t − e^(−t))/(e^t + e^(−t))',
        '代入 e^(ln ' + k + ') = ' + k,
        '化简为 ' + frac(k * k - 1, k * k + 1),
      ],
    });
  }

  if (kind === 'deriv') {
    const a = rnd(1, 12);
    const b = rnd(1, 12);
    return mk({
      topic: 'hyperbolic-func', diff,
      question: '求导：d/dx [' + a + 'sinh(' + a + 'x) + ' + b + 'cosh(' + b + 'x)]',
      latex: '@dfrac{d}{dx}@left(' + a + '@sinh ' + a + 'x + ' + b + '@cosh ' + b + 'x@right)',
      answer: (a * a) + 'cosh(' + a + 'x)+' + (b * b) + 'sinh(' + b + 'x)',
      steps: [
        '(sinh u)′ = cosh u · u′，(cosh u)′ = sinh u · u′',
        '第一项：' + a + '·' + a + 'cosh(' + a + 'x) = ' + (a * a) + 'cosh(' + a + 'x)',
        '第二项：' + b + '·' + b + 'sinh(' + b + 'x) = ' + (b * b) + 'sinh(' + b + 'x)',
      ],
      type: 'expression',
    });
  }

  if (kind === 'identity') {
    const k = rnd(1, 4);
    return mk({
      topic: 'hyperbolic-func', diff,
      question: '化简：cosh²(' + k + 'x) − sinh²(' + k + 'x)',
      latex: '@cosh^{2}(' + k + 'x) - @sinh^{2}(' + k + 'x) = ?',
      answer: '1',
      steps: ['基本恒等式 cosh²u − sinh²u = 1', '取 u = ' + k + 'x'],
    });
  }

  const k = pickOne([2, 3]);
  return mk({
    topic: 'hyperbolic-func', diff,
    question: '求 arsinh(' + k + ') 的精确值',
    latex: '@operatorname{arsinh} ' + k + ' = ?',
    answer: 'ln(' + k + '+sqrt(' + (k * k + 1) + '))',
    steps: [
      '反双曲正弦：arsinh y = ln(y + √(y² + 1))',
      '代入 y = ' + k + ' 得 ln(' + k + ' + √' + (k * k + 1) + ')',
    ],
    type: 'expression',
  });
}


// ===== 级数敛散性 =====
export function genSeriesV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['geoSum', 'pSeries']
    : diff === 'advanced'
      ? ['geoSum', 'pSeries', 'geoDiverge', 'alternating']
      : ['ratioTest', 'pSeries', 'alternating', 'geoSum'];
  const kind = pickOne(kinds);

  if (kind === 'geoSum') {
    let q = rnd(3, 30);
    let p = rnd(1, q - 1);
    while (gcd(p, q) !== 1) { q = rnd(3, 30); p = rnd(1, q - 1); }
    const sum = frac(q, q - p);
    return mk({
      topic: 'series-convergence', diff,
      question: '求等比级数 Σ(' + p + '/' + q + ')^n（n 从 0 到 ∞）的和',
      latex: '@sum_{n=0}^{@infty} @left(@dfrac{' + p + '}{' + q + '}@right)^{n} = ?',
      answer: sum,
      steps: [
        '等比级数求和：Σr^n = 1/(1−r)，要求 |r|<1',
        '这里 r = ' + p + '/' + q + '，满足收敛条件',
        '和为 1/(1 − ' + p + '/' + q + ') = ' + sum,
      ],
    });
  }

  if (kind === 'pSeries') {
    const p = pickOne([1, 2, 3, 4, 5, 6]);
    const converge = p > 1;
    return mk({
      topic: 'series-convergence', diff,
      question: '判断 p 级数 Σ1/n^' + p + ' 的敛散性（填「收敛」或「发散」）',
      latex: '@sum_{n=1}^{@infty} @dfrac{1}{n^{' + p + '}}',
      answer: converge ? '收敛' : '发散',
      steps: [
        'p 级数 Σ1/n^p：p>1 收敛，p≤1 发散',
        '这里 p = ' + p,
        converge ? 'p>1，所以收敛' : 'p≤1，所以发散',
      ],
      type: 'expression',
    });
  }

  if (kind === 'geoDiverge') {
    const q = rnd(2, 9);
    const p = q + rnd(1, 20);
    return mk({
      topic: 'series-convergence', diff,
      question: '判断级数 Σ(' + p + '/' + q + ')^n 的敛散性（填「收敛」或「发散」）',
      latex: '@sum_{n=0}^{@infty} @left(@dfrac{' + p + '}{' + q + '}@right)^{n}',
      answer: '发散',
      steps: [
        '公比 r = ' + p + '/' + q,
        '|r| = ' + p + '/' + q + ' > 1',
        '公比绝对值大于 1，级数发散',
      ],
      type: 'expression',
    });
  }

  if (kind === 'alternating') {
    const p = pickOne([1, 2, 3, 4, 5]);
    return mk({
      topic: 'series-convergence', diff,
      question: '判断交错级数 Σ(−1)^n/n^' + p + ' 的敛散性（填「收敛」或「发散」）',
      latex: '@sum_{n=1}^{@infty} @dfrac{(-1)^{n}}{n^{' + p + '}}',
      answer: '收敛',
      steps: [
        '去掉符号后是 p 级数，p = ' + p + (p > 1 ? ' > 1，绝对收敛' : ' = 1，条件收敛'),
        '交错级数判别法：通项单调递减趋于 0',
        '所以级数收敛',
      ],
      type: 'expression',
    });
  }

  const forms = [
    { tex: '@sum_{n=1}^{@infty} @dfrac{n!}{n^{n}}', name: 'n!/n^n', conv: true, why: '比值 |a_{n+1}/a_n| → 1/e < 1' },
    { tex: '@sum_{n=0}^{@infty} @dfrac{2^{n}}{n!}', name: '2^n/n!', conv: true, why: '比值 → 0 < 1' },
    { tex: '@sum_{n=1}^{@infty} @dfrac{n!}{3^{n}}', name: 'n!/3^n', conv: false, why: '比值 → ∞ > 1' },
    { tex: '@sum_{n=1}^{@infty} @dfrac{2^{n}}{n^{2}}', name: '2^n/n²', conv: false, why: '通项不趋于 0' },
  ];
  const f = pickOne(forms);
  return mk({
    topic: 'series-convergence', diff,
    question: '判断级数 Σ' + f.name + ' 的敛散性（填「收敛」或「发散」）',
    latex: f.tex,
    answer: f.conv ? '收敛' : '发散',
    steps: ['用比值判别法：' + f.why, f.conv ? '极限小于 1，收敛' : '极限不小于 1，发散'],
    type: 'expression',
  });
}

// ===== 傅里叶基础 =====
export function genFourierV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['period', 'a0Const']
    : diff === 'advanced'
      ? ['period', 'a0Const', 'parity', 'a0Pow']
      : ['parity', 'a0Pow', 'period', 'a0Const'];
  const kind = pickOne(kinds);

  if (kind === 'period') {
    const k = rnd(1, 12);
    const fn = pickOne(['sin', 'cos']);
    return mk({
      topic: 'fourier-basic', diff,
      question: '求函数 f(x) = ' + fn + '(' + k + 'x) 的周期（用 π 的倍数表示，答案填系数）',
      latex: 'f(x) = @' + fn + '(' + k + 'x)，周期 T = ? ' + '@cdot @pi',
      answer: frac(2, k),
      steps: [
        fn + '(kx) 的周期为 T = 2π/k',
        '这里 k = ' + k,
        '所以 T = 2π/' + k + '，系数为 ' + frac(2, k),
      ],
    });
  }

  if (kind === 'a0Const') {
    const c = rnd(1, 20);
    const T = rnd(2, 8);
    return mk({
      topic: 'fourier-basic', diff,
      question: '函数 f(x) = ' + c + ' 在 [0, ' + T + '] 上的傅里叶系数 a₀ = ?',
      latex: 'f(x) = ' + c + '，x @in [0, ' + T + ']，a_0 = ?',
      answer: String(2 * c),
      steps: [
        'a₀ = (2/T)∫₀ᵀ f(x)dx',
        '常函数积分 = ' + c + ' × ' + T + ' = ' + (c * T),
        'a₀ = (2/' + T + ') × ' + (c * T) + ' = ' + (2 * c),
      ],
    });
  }

  if (kind === 'parity') {
    const items = [
      { expr: '@sin(x^{3})', fn: 'sin(x³)', odd: true },
      { expr: '@cos(x^{2})', fn: 'cos(x²)', odd: false },
      { expr: 'x^{3}', fn: 'x³', odd: true },
      { expr: '@tanh(x)', fn: 'tanh(x)', odd: true },
      { expr: 'x^{2}@cos(x)', fn: 'x²cos(x)', odd: false },
      { expr: '@sin(x)@cos(x)', fn: 'sin(x)cos(x)', odd: true },
    ];
    const it = pickOne(items);
    return mk({
      topic: 'fourier-basic', diff,
      question: '判断 f(x) = ' + it.fn + ' 的奇偶性（填「奇函数」或「偶函数」）',
      latex: 'f(x) = ' + it.expr,
      answer: it.odd ? '奇函数' : '偶函数',
      steps: [
        '代入 −x 看与 f(x) 的关系',
        it.odd ? 'f(−x) = −f(x)，所以是奇函数' : 'f(−x) = f(x)，所以是偶函数',
      ],
      type: 'expression',
    });
  }

  const n = rnd(1, 4);
  const T = rnd(2, 8);
  const val = frac(Math.round(Math.pow(T, n + 1)), n + 1);
  return mk({
    topic: 'fourier-basic', diff,
    question: '函数 f(x) = x^' + n + ' 在 [0, ' + T + '] 上的 a₀ = ?',
    latex: 'f(x) = x^{' + n + '}，x @in [0, ' + T + ']，a_0 = ?',
    answer: val,
    steps: [
      'a₀ = (2/T)∫₀ᵀ x^n dx',
      '∫₀ᵀ x^n dx = T^(n+1)/(n+1) = ' + frac(Math.round(Math.pow(T, n + 1)), n + 1),
      '乘以 2/T 得 a₀ = ' + val,
    ],
  });
}

// ===== 函数性质 =====
export function genFunctionPropertyV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['domainSqrt', 'domainFrac']
    : diff === 'advanced'
      ? ['domainSqrt', 'domainFrac', 'inverse', 'monotone']
      : ['monotone', 'inverse', 'range', 'parity'];
  const kind = pickOne(kinds);

  if (kind === 'domainSqrt') {
    const a = rnd(-20, 20);
    const op = a >= 0 ? '−' : '+';
    return mk({
      topic: 'function-property', diff,
      question: '求函数 f(x) = √(x ' + op + ' ' + Math.abs(a) + ') 的定义域（填 x>=k 或 x<=k）',
      latex: 'f(x) = @sqrt{x ' + op + ' ' + Math.abs(a) + '}',
      answer: 'x>=' + a,
      steps: ['根号内必须非负：x ' + op + ' ' + Math.abs(a) + ' ≥ 0', '解得 x ≥ ' + a],
      type: 'expression',
    });
  }

  if (kind === 'domainFrac') {
    const a = rnd(-20, 20);
    return mk({
      topic: 'function-property', diff,
      question: '求函数 f(x) = 1/(x − ' + a + ') 的定义域（填 x!=k）',
      latex: 'f(x) = @dfrac{1}{x - ' + a + '}',
      answer: 'x!=' + a,
      steps: ['分母不能为零：x − ' + a + ' ≠ 0', '所以 x ≠ ' + a],
      type: 'expression',
    });
  }

  if (kind === 'inverse') {
    const a = rnd(2, 12);
    const b = rnd(-15, 15);
    const s = b >= 0 ? '+ ' + b : '− ' + Math.abs(b);
    return mk({
      topic: 'function-property', diff,
      question: '求 f(x) = ' + a + 'x ' + s + ' 的反函数 f⁻¹(x)',
      latex: 'f(x) = ' + a + 'x ' + s + '，求 f^{-1}(x)',
      answer: '(x-' + b + ')/' + a,
      steps: [
        '令 y = ' + a + 'x ' + s,
        '解出 x = (y − ' + b + ')/' + a,
        '交换字母得 f⁻¹(x) = (x − ' + b + ')/' + a,
      ],
      type: 'expression',
    });
  }

  if (kind === 'monotone') {
    const a = rnd(-15, 15);
    return mk({
      topic: 'function-property', diff,
      question: '函数 f(x) = x² − ' + 2 * a + 'x 的单调递增区间是？',
      latex: 'f(x) = x^{2} - ' + 2 * a + 'x',
      answer: 'x>=' + a,
      steps: [
        '配方：f(x) = (x − ' + a + ')² − ' + a * a + '，对称轴 x = ' + a,
        '开口向上，对称轴右侧单调递增',
        '递增区间为 x ≥ ' + a,
      ],
      type: 'expression',
    });
  }

  if (kind === 'range') {
    const c = rnd(-20, 20);
    const s = c >= 0 ? '+ ' + c : '− ' + Math.abs(c);
    return mk({
      topic: 'function-property', diff,
      question: '求函数 f(x) = x² ' + s + ' 的值域（填 y>=k）',
      latex: 'f(x) = x^{2} ' + s,
      answer: 'y>=' + c,
      steps: ['x² ≥ 0', '所以 f(x) ≥ ' + c, '当 x = 0 时取到最小值 ' + c],
      type: 'expression',
    });
  }

  const n = pickOne([2, 3, 4]);
  const fn = pickOne(['sin', 'cos']);
  const odd = fn === 'sin' || n % 2 === 1;
  return mk({
    topic: 'function-property', diff,
    question: '判断 f(x) = x^' + n + (fn === 'sin' ? '·sin(x)' : '·cos(x)') + ' 的奇偶性（填「奇函数」或「偶函数」）',
    latex: 'f(x) = x^{' + n + '}@' + fn + '(x)',
    answer: odd ? '奇函数' : '偶函数',
    steps: [
      'x^' + n + ' 是' + (n % 2 === 1 ? '奇' : '偶') + '函数，' + fn + '(x) 是' + (fn === 'sin' ? '奇' : '偶') + '函数',
      odd ? '奇 × 奇 = 奇，奇 × 偶 = 奇' : '偶 × 偶 = 偶',
      '所以 f(x) 是' + (odd ? '奇' : '偶') + '函数',
    ],
    type: 'expression',
  });
}

// ===== 数列极限 =====
export function genSequenceLimitV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['degRatio', 'simple']
    : diff === 'advanced'
      ? ['degRatio', 'simple', 'expRatio', 'eSeq']
      : ['eSeq', 'nthRoot', 'sqrtDiff', 'expRatio'];
  const kind = pickOne(kinds);

  if (kind === 'degRatio') {
    const a = rnd(2, 40);
    const b = rnd(2, 40);
    return mk({
      topic: 'sequence-limit', diff,
      question: '求极限：lim(n→∞) (' + a + 'n² + ' + rnd(1, 9) + 'n)/(' + b + 'n² + ' + rnd(1, 9) + ')',
      latex: '@lim_{n @to @infty} @dfrac{' + a + 'n^{2} + 1}{' + b + 'n^{2} + 2}',
      answer: frac(a, b),
      steps: [
        '同除以 n²：分子趋于 ' + a + '，分母趋于 ' + b,
        '极限为 ' + a + '/' + b + ' = ' + frac(a, b),
      ],
    });
  }

  if (kind === 'simple') {
    const k = rnd(1, 15);
    return mk({
      topic: 'sequence-limit', diff,
      question: '求极限：lim(n→∞) (n + ' + k + ')/(n² + 1)',
      latex: '@lim_{n @to @infty} @dfrac{n + ' + k + '}{n^{2} + 1}',
      answer: '0',
      steps: ['分母次数高于分子', '同除以 n² 后分子趋于 0', '极限为 0'],
    });
  }

  if (kind === 'expRatio') {
    const a = pickOne([2, 3]);
    const b = a + pickOne([1, 2]);
    return mk({
      topic: 'sequence-limit', diff,
      question: '求极限：lim(n→∞) ' + a + '^n/' + b + '^n',
      latex: '@lim_{n @to @infty} @dfrac{' + a + '^{n}}{' + b + '^{n}}',
      answer: '0',
      steps: [
        '化为 (' + a + '/' + b + ')^n',
        '底数 ' + a + '/' + b + ' < 1',
        '所以极限为 0',
      ],
    });
  }

  if (kind === 'eSeq') {
    const k = rnd(1, 3);
    return mk({
      topic: 'sequence-limit', diff,
      question: '求极限：lim(n→∞) (1 + ' + k + '/n)^n = e^k，求 k',
      latex: '@lim_{n @to @infty} @left(1 + @dfrac{' + k + '}{n}@right)^{n} = e^{k}',
      answer: String(k),
      steps: ['重要极限：(1 + a/n)^n → e^a', '这里 a = ' + k, '所以 k = ' + k],
    });
  }

  if (kind === 'nthRoot') {
    const a = rnd(2, 9);
    return mk({
      topic: 'sequence-limit', diff,
      question: '求极限：lim(n→∞) n^(1/n)',
      latex: '@lim_{n @to @infty} @sqrt[n]{n}',
      answer: '1',
      steps: ['取对数：ln(n)/n → 0', '所以 n^(1/n) → e⁰ = 1'],
    });
  }

  const a = rnd(1, 4);
  return mk({
    topic: 'sequence-limit', diff,
    question: '求极限：lim(n→∞) (√(n + ' + a + ') − √n)',
    latex: '@lim_{n @to @infty} @left(@sqrt{n + ' + a + '} - @sqrt{n}@right)',
    answer: '0',
    steps: ['分子有理化：' + a + '/(√(n+' + a + ') + √n)', '分母趋于无穷', '极限为 0'],
  });
}



// ===== 三角恒等变换 =====
export function genTrigIdentityV2(diff: Difficulty): PracticeQuestion {
  // 随机勾股数组：m > n，得到 (m²−n², 2mn, m²+n²)
  const m = rnd(2, 12);
  const n0 = rnd(1, m - 1);
  const trip = {
    s: 2 * m * n0,
    c: m * m - n0 * n0,
    h: m * m + n0 * n0,
  };
  const TRIPLES = [trip];
  const kinds = diff === 'basic'
    ? ['doubleAngle', 'special']
    : diff === 'advanced'
      ? ['sumAngle', 'doubleAngle', 'tanSum']
      : ['sumAngle', 'tanSum', 'special', 'cosDouble'];
  const kind = pickOne(kinds);

  if (kind === 'sumAngle') {
    const a = pickOne(TRIPLES);
    const b = pickOne(TRIPLES);
    const sa = a.s / a.h, ca = a.c / a.h, sb = b.s / b.h, cb = b.c / b.h;
    const num = a.s * b.c + a.c * b.s;
    const den = a.h * b.h;
    return mk({
      topic: 'trig-identity', diff,
      question: '已知 sin α = ' + a.s + '/' + a.h + '，cos β = ' + b.c + '/' + b.h + '，α、β 均为锐角，求 sin(α+β)',
      latex: '@sin@alpha = @dfrac{' + a.s + '}{' + a.h + '}，@cos@beta = @dfrac{' + b.c + '}{' + b.h + '}，求 @sin(@alpha + @beta)',
      answer: frac(num, den),
      steps: [
        '由勾股关系：cos α = ' + a.c + '/' + a.h + '，sin β = ' + b.s + '/' + b.h,
        '和角公式：sin(α+β) = sinαcosβ + cosαsinβ',
        '= (' + a.s + '·' + b.c + ' + ' + a.c + '·' + b.s + ')/(' + a.h + '·' + b.h + ') = ' + frac(num, den),
      ],
    });
  }

  if (kind === 'doubleAngle') {
    const a = pickOne(TRIPLES);
    const num = 2 * a.s * a.c;
    const den = a.h * a.h;
    return mk({
      topic: 'trig-identity', diff,
      question: '已知 sin α = ' + a.s + '/' + a.h + '（α 为锐角），求 sin 2α',
      latex: '@sin@alpha = @dfrac{' + a.s + '}{' + a.h + '}，求 @sin 2@alpha',
      answer: frac(num, den),
      steps: [
        'cos α = ' + a.c + '/' + a.h,
        'sin2α = 2 sinα cosα',
        '= 2 · ' + a.s + '/' + a.h + ' · ' + a.c + '/' + a.h + ' = ' + frac(num, den),
      ],
    });
  }

  if (kind === 'cosDouble') {
    const a = pickOne(TRIPLES);
    const num = a.c * a.c - a.s * a.s;
    const den = a.h * a.h;
    return mk({
      topic: 'trig-identity', diff,
      question: '已知 cos α = ' + a.c + '/' + a.h + '（α 为锐角），求 cos 2α',
      latex: '@cos@alpha = @dfrac{' + a.c + '}{' + a.h + '}，求 @cos 2@alpha',
      answer: frac(Math.abs(num), den),
      steps: [
        'sin α = ' + a.s + '/' + a.h,
        'cos2α = cos²α − sin²α = (' + a.c + '² − ' + a.s + '²)/' + den,
        '= ' + frac(Math.abs(num), den),
      ],
    });
  }

  if (kind === 'tanSum') {
    const t1 = pickOne([[1, 2], [1, 3], [2, 3], [1, 4]]);
    const t2 = pickOne([[1, 2], [1, 3], [3, 4]]);
    const num = t1[0] * t2[1] + t1[1] * t2[0];
    const den = t1[1] * t2[1] - t1[0] * t2[0];
    return mk({
      topic: 'trig-identity', diff,
      question: '已知 tan α = ' + t1[0] + '/' + t1[1] + '，tan β = ' + t2[0] + '/' + t2[1] + '，求 tan(α+β)',
      latex: '@tan@alpha = @dfrac{' + t1[0] + '}{' + t1[1] + '}，@tan@beta = @dfrac{' + t2[0] + '}{' + t2[1] + '}，求 @tan(@alpha + @beta)',
      answer: frac(num, den),
      steps: [
        '和角公式：tan(α+β) = (tanα + tanβ)/(1 − tanα tanβ)',
        '分子 = ' + t1[0] + '/' + t1[1] + ' + ' + t2[0] + '/' + t2[1] + ' = ' + frac(num, t1[1] * t2[1]),
        '分母 = 1 − ' + t1[0] * t2[0] + '/' + (t1[1] * t2[1]) + ' = ' + frac(den, t1[1] * t2[1]),
        '结果 = ' + frac(num, den),
      ],
    });
  }

  const specials = [
    { deg: 15, fn: 'sin', val: '(sqrt(6)-sqrt(2))/4', split: '45° − 30°' },
    { deg: 15, fn: 'cos', val: '(sqrt(6)+sqrt(2))/4', split: '45° − 30°' },
    { deg: 75, fn: 'sin', val: '(sqrt(6)+sqrt(2))/4', split: '45° + 30°' },
    { deg: 75, fn: 'cos', val: '(sqrt(6)-sqrt(2))/4', split: '45° + 30°' },
    { deg: 75, fn: 'tan', val: '2+sqrt(3)', split: '45° + 30°' },
  ];
  const sp = pickOne(specials);
  return mk({
    topic: 'trig-identity', diff,
    question: '求 ' + sp.fn + sp.deg + '° 的精确值',
    latex: '@' + sp.fn + ' ' + sp.deg + '^{@circ} = ?',
    answer: sp.val,
    steps: [
      '拆角：' + sp.deg + '° = ' + sp.split,
      '用和差角公式展开',
      '代入特殊角函数值化简得 ' + sp.val,
    ],
    type: 'expression',
  });
}

// ===== 积分基础 =====
export function genIntegralV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['powerDef', 'polyIndef']
    : diff === 'advanced'
      ? ['powerDef', 'polyIndef', 'sinDef', 'recipDef']
      : ['sinDef', 'expIndef', 'recipDef', 'powerDef'];
  const kind = pickOne(kinds);

  if (kind === 'powerDef') {
    const n = rnd(1, 5);
    const a = rnd(0, 8);
    const b = a + rnd(1, 6);
    const total = (Math.pow(b, n + 1) - Math.pow(a, n + 1)) / (n + 1);
    return mk({
      topic: 'integral-basic', diff,
      question: '计算 ∫ 从 ' + a + ' 到 ' + b + ' 的 x^' + n + ' dx',
      latex: '@int_{' + a + '}^{' + b + '} x^{' + n + '} @, dx',
      answer: String(total),
      steps: [
        '原函数：x^(n+1)/(n+1) = x^' + (n + 1) + '/' + (n + 1),
        '代入上下限：(' + Math.pow(b, n + 1) + ' − ' + Math.pow(a, n + 1) + ')/' + (n + 1),
        '结果为 ' + total,
      ],
    });
  }

  if (kind === 'polyIndef') {
    const a = rnd(1, 15);
    const b = rnd(-20, 20);
    const s = b >= 0 ? '+ ' + b : '− ' + Math.abs(b);
    return mk({
      topic: 'integral-basic', diff,
      question: '求不定积分 ∫(' + a + 'x ' + s + ')dx',
      latex: '@int (' + a + 'x ' + s + ') @, dx',
      answer: frac(a, 2) + 'x^2' + (b >= 0 ? '+' : '-') + Math.abs(b) + 'x',
      steps: [
        '逐项积分：∫x dx = x²/2，∫1 dx = x',
        '得 ' + frac(a, 2) + 'x² ' + s + 'x + C',
        '答案（省略常数 C）：' + frac(a, 2) + 'x^2' + (b >= 0 ? '+' : '-') + Math.abs(b) + 'x',
      ],
      type: 'expression',
    });
  }

  if (kind === 'sinDef') {
    const k = rnd(1, 12);
    const val = k % 2 === 1 ? frac(2, k) : '0';
    return mk({
      topic: 'integral-basic', diff,
      question: '计算 ∫ 从 0 到 π 的 sin(' + k + 'x) dx',
      latex: '@int_{0}^{@pi} @sin(' + k + 'x) @, dx',
      answer: val,
      steps: [
        '原函数：−cos(kx)/k',
        '代入上下限：(1 − cos(kπ))/k',
        k % 2 === 1 ? 'cos(kπ) = −1，结果为 2/' + k : 'cos(kπ) = 1，结果为 0',
      ],
    });
  }

  if (kind === 'expIndef') {
    const k = rnd(2, 15);
    return mk({
      topic: 'integral-basic', diff,
      question: '求不定积分 ∫e^(' + k + 'x)dx',
      latex: '@int e^{' + k + 'x} @, dx',
      answer: 'e^(' + k + 'x)/' + k,
      steps: ['∫e^(kx)dx = e^(kx)/k + C', '这里 k = ' + k, '结果为 e^(' + k + 'x)/' + k],
      type: 'expression',
    });
  }

  const a = pickOne([2, 3]);
  return mk({
    topic: 'integral-basic', diff,
    question: '计算 ∫ 从 ' + a + ' 到 e 的 1/x dx（提示：ln e = 1）',
    latex: '@int_{' + a + '}^{e} @dfrac{1}{x} @, dx',
    answer: String(1 - Math.log(a)),
    steps: [
      '原函数 ln|x|',
      '代入上下限：ln e − ln ' + a + ' = 1 − ln ' + a,
      '数值约为 ' + (1 - Math.log(a)).toFixed(3),
    ],
  });
}



// ===== 求导 =====
export function genDerivativeV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['power', 'sin', 'cos']
    : diff === 'advanced'
      ? ['power', 'sin', 'cos', 'exp', 'ln']
      : ['sum', 'exp', 'ln', 'sin', 'power'];
  const kind = pickOne(kinds);

  if (kind === 'power') {
    const a = rnd(1, 15);
    const n = rnd(2, 9);
    return mk({
      topic: 'derivative-basic', diff,
      question: '求导：d/dx (' + a + 'x^' + n + ')',
      latex: '@dfrac{d}{dx}(' + a + 'x^{' + n + '})',
      answer: (a * n) + '*x^' + (n - 1),
      steps: [
        '(x^n)′ = n x^(n−1)',
        '系数保持不变：' + a + '·' + n + 'x^' + (n - 1),
        '结果为 ' + (a * n) + 'x^' + (n - 1),
      ],
      type: 'expression',
    });
  }

  if (kind === 'sin' || kind === 'cos') {
    const a = rnd(1, 12);
    const b = rnd(2, 9);
    const fn = kind;
    const other = kind === 'sin' ? 'cos' : 'sin';
    const sign = kind === 'sin' ? '' : '-';
    return mk({
      topic: 'derivative-basic', diff,
      question: '求导：d/dx (' + a + fn + '(' + b + 'x))',
      latex: '@dfrac{d}{dx}(' + a + '@' + fn + '(' + b + 'x))',
      answer: sign + (a * b) + '*' + other + '(' + b + 'x)',
      steps: [
        '(' + fn + ' u)′ = ' + (kind === 'sin' ? 'cos' : '−sin') + ' u · u′',
        'u = ' + b + 'x，u′ = ' + b,
        '结果 = ' + (sign ? '−' : '') + (a * b) + other + '(' + b + 'x)',
      ],
      type: 'expression',
    });
  }

  if (kind === 'exp') {
    const a = rnd(1, 12);
    const b = rnd(2, 9);
    return mk({
      topic: 'derivative-basic', diff,
      question: '求导：d/dx (' + a + 'e^(' + b + 'x))',
      latex: '@dfrac{d}{dx}(' + a + 'e^{' + b + 'x})',
      answer: (a * b) + '*e^(' + b + 'x)',
      steps: ['(e^u)′ = e^u · u′', 'u = ' + b + 'x，u′ = ' + b, '结果 = ' + (a * b) + 'e^(' + b + 'x)'],
      type: 'expression',
    });
  }

  if (kind === 'ln') {
    const a = rnd(1, 15);
    const b = rnd(2, 9);
    return mk({
      topic: 'derivative-basic', diff,
      question: '求导：d/dx (' + a + 'ln(' + b + 'x))',
      latex: '@dfrac{d}{dx}(' + a + '@ln(' + b + 'x))',
      answer: (a / b) + '*(1/x)',
      steps: ['(ln u)′ = u′/u', 'u = ' + b + 'x，u′ = ' + b, '结果 = ' + a + '·' + b + '/(' + b + 'x) = ' + (a / b) + '/x'],
      type: 'expression',
    });
  }

  const a = rnd(1, 9);
  const b = rnd(1, 9);
  const n = rnd(2, 6);
  const m = rnd(2, 6);
  return mk({
    topic: 'derivative-basic', diff,
    question: '求导：d/dx (' + a + 'x^' + n + ' + ' + b + 'x^' + m + ')',
    latex: '@dfrac{d}{dx}(' + a + 'x^{' + n + '} + ' + b + 'x^{' + m + '})',
    answer: (a * n) + '*x^' + (n - 1) + '+' + (b * m) + '*x^' + (m - 1),
    steps: [
      '逐项求导',
      '第一项：' + a + '·' + n + 'x^' + (n - 1) + ' = ' + (a * n) + 'x^' + (n - 1),
      '第二项：' + b + '·' + m + 'x^' + (m - 1) + ' = ' + (b * m) + 'x^' + (m - 1),
    ],
    type: 'expression',
  });
}

// ===== 不等式求解 =====
export function genInequalitySolveV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['quad', 'abs']
    : diff === 'advanced'
      ? ['quad', 'abs', 'linear', 'absGe']
      : ['quad', 'absGe', 'linear', 'abs'];
  const kind = pickOne(kinds);

  if (kind === 'quad') {
    const r1 = rnd(-15, 10);
    const r2 = r1 + rnd(1, 12);
    const lt = pickOne([true, false]);
    const sgn = (n: number) => (n > 0 ? '+' + n : n === 0 ? '' : String(n));
    return mk({
      topic: 'inequality-solve', diff,
      question: '解不等式：(x' + sgn(-r1) + ')(x' + sgn(-r2) + ') ' + (lt ? '<' : '>') + ' 0',
      latex: '@text{解不等式：}(x' + sgn(-r1) + ')(x' + sgn(-r2) + ') ' + (lt ? '<' : '>') + ' 0',
      answer: lt ? r1 + '<x<' + r2 : 'x<' + r1 + ' 或 x>' + r2,
      steps: [
        '两根为 x = ' + r1 + ' 与 x = ' + r2,
        '开口向上的二次函数，' + (lt ? '小于零取两根之间' : '大于零取两根之外'),
        '解集：' + (lt ? r1 + ' < x < ' + r2 : 'x < ' + r1 + ' 或 x > ' + r2),
      ],
      type: 'expression',
    });
  }

  if (kind === 'abs') {
    const a = rnd(1, 25);
    const le = pickOne([true, false]);
    return mk({
      topic: 'inequality-solve', diff,
      question: '解不等式：|x| ' + (le ? '≤' : '<') + ' ' + a,
      latex: '|x| ' + (le ? '@leq' : '<') + ' ' + a,
      answer: (le ? '-' + a + '<=x<=' + a : '-' + a + '<x<' + a),
      steps: [
        '|x| ≤ a 等价于 −a ≤ x ≤ a',
        '代入 a = ' + a,
        '解集：' + (le ? '[' + -a + ', ' + a + ']' : '(' + -a + ', ' + a + ')'),
      ],
      type: 'expression',
    });
  }

  if (kind === 'absGe') {
    const a = rnd(1, 25);
    return mk({
      topic: 'inequality-solve', diff,
      question: '解不等式：|x| ≥ ' + a,
      latex: '|x| @geq ' + a,
      answer: 'x<=' + -a + ' 或 x>=' + a,
      steps: ['|x| ≥ a 等价于 x ≥ a 或 x ≤ −a', '解集：(−∞, −' + a + '] ∪ [' + a + ', +∞)'],
      type: 'expression',
    });
  }

  const a = rnd(2, 15);
  const b = rnd(-20, 20);
  const c = rnd(-30, 30);
  const s = b >= 0 ? '+ ' + b : '− ' + Math.abs(b);
  return mk({
    topic: 'inequality-solve', diff,
    question: '解不等式：' + a + 'x ' + s + ' > ' + c,
    latex: a + 'x ' + s + ' > ' + c,
    answer: 'x>' + ((c - b) / a),
    steps: [
      '移项：' + a + 'x > ' + (c - b),
      '两边除以 ' + a + '（正数，不等号不变）',
      'x > ' + ((c - b) / a),
    ],
    type: 'expression',
  });
}



// ===== 随机变量 =====
export function genRandomVariableV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['bernoulli', 'uniform']
    : diff === 'advanced'
      ? ['bernoulli', 'uniform', 'binomial', 'poisson']
      : ['binomial', 'poisson', 'uniform', 'bernoulli'];
  const kind = pickOne(kinds);

  if (kind === 'bernoulli') {
    const k = rnd(1, 9);
    const p = k / 10;
    const wantE = pickOne([true, false]);
    const val = wantE ? p : p * (1 - p);
    return mk({
      topic: 'random-variable', diff,
      question: 'X ~ B(1, ' + p + ')，求 ' + (wantE ? 'E(X)' : 'Var(X)'),
      latex: 'X @sim B(1, ' + p + ')，求 ' + (wantE ? 'E(X)' : 'D(X)'),
      answer: String(Number(val.toFixed(4))),
      steps: [
        '两点分布：E(X) = p，D(X) = p(1−p)',
        'p = ' + p,
        wantE ? 'E(X) = ' + p : 'D(X) = ' + p + ' × ' + (1 - p) + ' = ' + val.toFixed(2),
      ],
    });
  }

  if (kind === 'binomial') {
    const n = rnd(2, 12);
    const k = rnd(1, 9);
    const p = k / 10;
    const wantE = pickOne([true, false]);
    const val = wantE ? n * p : n * p * (1 - p);
    return mk({
      topic: 'random-variable', diff,
      question: 'X ~ B(' + n + ', ' + p + ')，求 ' + (wantE ? 'E(X)' : 'Var(X)'),
      latex: 'X @sim B(' + n + ', ' + p + ')，求 ' + (wantE ? 'E(X)' : 'D(X)'),
      answer: String(Number(val.toFixed(4))),
      steps: [
        '二项分布：E(X) = np，D(X) = np(1−p)',
        'n = ' + n + '，p = ' + p,
        wantE ? 'E(X) = ' + n + ' × ' + p + ' = ' + val : 'D(X) = ' + n + ' × ' + p + ' × ' + (1 - p) + ' = ' + val.toFixed(2),
      ],
    });
  }

  if (kind === 'uniform') {
    const n = rnd(2, 20);
    const wantE = pickOne([true, false]);
    const val = wantE ? (n + 1) / 2 : (n * n - 1) / 12;
    return mk({
      topic: 'random-variable', diff,
      question: 'X 在 1, 2, …, ' + n + ' 上等可能取值，求 ' + (wantE ? 'E(X)' : 'Var(X)'),
      latex: 'X @sim U@{1,2,@dots,' + n + '@}，求 ' + (wantE ? 'E(X)' : 'D(X)'),
      answer: String(Number(val.toFixed(4))),
      steps: [
        wantE ? '离散均匀分布：E(X) = (n+1)/2' : '离散均匀分布：D(X) = (n²−1)/12',
        'n = ' + n,
        '结果 = ' + Number(val.toFixed(4)),
      ],
    });
  }

  const lam = rnd(1, 12);
  const wantE = pickOne([true, false]);
  return mk({
    topic: 'random-variable', diff,
    question: 'X ~ P(' + lam + ')（泊松分布），求 ' + (wantE ? 'E(X)' : 'Var(X)'),
    latex: 'X @sim P(' + lam + ')，求 ' + (wantE ? 'E(X)' : 'D(X)'),
    answer: String(lam),
    steps: ['泊松分布：E(X) = D(X) = λ', '这里 λ = ' + lam, '所以结果为 ' + lam],
  });
}

// ===== 微分方程 =====
export function genOdeV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic'
    ? ['expDecay', 'expGrowth']
    : diff === 'advanced'
      ? ['expDecay', 'expGrowth', 'linearNonhom', 'harmonic']
      : ['linearNonhom', 'harmonic', 'separable', 'expGrowth'];
  const kind = pickOne(kinds);

  if (kind === 'expDecay') {
    const a = rnd(1, 12);
    return mk({
      topic: 'ode-solving', diff,
      question: '求通解：y′ + ' + a + 'y = 0',
      latex: "y' + " + a + 'y = 0',
      answer: 'C*e^(' + -a + 'x)',
      steps: ['特征方程 r + ' + a + ' = 0，r = ' + -a, '通解 y = Ce^(' + -a + 'x)'],
      type: 'expression',
    });
  }

  if (kind === 'expGrowth') {
    const a = rnd(1, 12);
    return mk({
      topic: 'ode-solving', diff,
      question: '求通解：y′ = ' + a + 'y',
      latex: "y' = " + a + 'y',
      answer: 'C*e^(' + a + 'x)',
      steps: ['分离变量 dy/y = ' + a + ' dx', '两边积分 ln|y| = ' + a + 'x + C', '通解 y = Ce^(' + a + 'x)'],
      type: 'expression',
    });
  }

  if (kind === 'linearNonhom') {
    const a = rnd(1, 9);
    const b = rnd(1, 20);
    return mk({
      topic: 'ode-solving', diff,
      question: '求通解：y′ + ' + a + 'y = ' + b,
      latex: "y' + " + a + 'y = ' + b,
      answer: 'C*e^(' + -a + 'x)+' + (b / a),
      steps: [
        '先求齐次解 y_h = Ce^(' + -a + 'x)',
        '特解取常数 y_p = ' + b + '/' + a + ' = ' + (b / a),
        '通解 y = Ce^(' + -a + 'x) + ' + (b / a),
      ],
      type: 'expression',
    });
  }

  if (kind === 'harmonic') {
    const w = rnd(1, 9);
    return mk({
      topic: 'ode-solving', diff,
      question: '求通解：y″ + ' + (w * w) + 'y = 0',
      latex: "y'' + " + (w * w) + 'y = 0',
      answer: 'C1*cos(' + w + 'x)+C2*sin(' + w + 'x)',
      steps: [
        '特征方程 r² + ' + (w * w) + ' = 0，r = ±' + w + 'i',
        '共轭复根对应振荡解',
        '通解 y = C₁cos(' + w + 'x) + C₂sin(' + w + 'x)',
      ],
      type: 'expression',
    });
  }

  const k = rnd(1, 9);
  const n = rnd(1, 4);
  return mk({
    topic: 'ode-solving', diff,
    question: '求通解：y′ = ' + k + 'x^' + n,
    latex: "y' = " + k + 'x^{' + n + '}',
    answer: k + '/' + (n + 1) + '*x^' + (n + 1) + '+C',
    steps: [
      '直接积分：y = ∫' + k + 'x^' + n + ' dx',
      '= ' + k + 'x^' + (n + 1) + '/' + (n + 1) + ' + C',
    ],
    type: 'expression',
  });
}



// ===== 特殊角求值 =====
export function genTrigSpecialV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic' ? ['known', 'quadrant'] : diff === 'advanced' ? ['known', 'quadrant', 'reduce'] : ['reduce', 'quadrant', 'known'];
  const kind = pickOne(kinds);

  if (kind === 'known') {
    const base = pickOne([30, 45, 60]);
    const k = rnd(1, 11);
    const deg = k * 15 + (deg0(base));
    const fn = pickOne(['sin', 'cos', 'tan']);
    const val = specialValue(fn, deg % 360);
    if (!val) return genTrigSpecialV2(diff);
    return mk({
      topic: 'trig-special', diff,
      question: '求 ' + fn + deg + '° 的值',
      latex: '@' + fn + ' ' + deg + '^{@circ} = ?',
      answer: val,
      steps: [
        '把 ' + deg + '° 化为锐角或特殊角的组合',
        '利用' + (fn === 'sin' ? '正弦' : fn === 'cos' ? '余弦' : '正切') + '的符号规律与诱导公式',
        '结果为 ' + val,
      ],
      type: 'expression',
    });
  }

  if (kind === 'quadrant') {
    const fn = pickOne(['sin', 'cos', 'tan']);
    const q = rnd(1, 4);
    const base = pickOne([30, 45, 60]);
    const sign = quadrantSign(fn, q);
    const val = sign + specialAbs(fn, base);
    return mk({
      topic: 'trig-special', diff,
      question: '已知 α 在第 ' + q + ' 象限，且 α 的参考角为 ' + base + '°，求 ' + fn + 'α',
      latex: '@' + fn + '@alpha，@alpha @@in ' + ['I', 'II', 'III', 'IV'][q - 1] + '@text{ 象限，参考角 }' + base + '^{@circ}',
      answer: val,
      steps: [
        '先求参考角的函数值：' + fn + base + '° = ' + specialAbs(fn, base),
        '第 ' + q + ' 象限中 ' + fn + ' 的符号为 ' + (sign === '-' ? '负' : '正'),
        '结果为 ' + val,
      ],
      type: 'expression',
    });
  }

  const k = rnd(1, 8);
  const fn = pickOne(['sin', 'cos']);
  const deg = 180 + k * 10;
  const val = specialValue(fn, deg % 360) ?? '0';
  return mk({
    topic: 'trig-special', diff,
    question: '化简 ' + fn + '(' + deg + '°)',
    latex: '@' + fn + '(' + deg + '^{@circ})',
    answer: val,
    steps: ['用诱导公式把角化到 [0°, 360°)', '再化为锐角求值', '结果为 ' + val],
    type: 'expression',
  });
}

function deg0(n: number): number {
  return n === 30 ? 0 : n === 45 ? 0 : 0;
}

function specialAbs(fn: string, deg: number): string {
  const table: Record<string, Record<number, string>> = {
    sin: { 30: '1/2', 45: 'sqrt(2)/2', 60: 'sqrt(3)/2' },
    cos: { 30: 'sqrt(3)/2', 45: 'sqrt(2)/2', 60: '1/2' },
    tan: { 30: 'sqrt(3)/3', 45: '1', 60: 'sqrt(3)' },
  };
  return table[fn][deg] ?? '0';
}

function quadrantSign(fn: string, q: number): string {
  const pos: Record<string, number[]> = { sin: [1, 2], cos: [1, 4], tan: [1, 3] };
  return pos[fn].includes(q) ? '' : '-';
}

function specialValue(fn: string, deg: number): string {
  const d = ((deg % 360) + 360) % 360;
  if (d === 0) return fn === 'sin' ? '0' : fn === 'cos' ? '1' : '0';
  if (d === 90) return fn === 'sin' ? '1' : fn === 'cos' ? '0' : '不存在';
  if (d === 180) return fn === 'sin' ? '0' : fn === 'cos' ? '-1' : '0';
  if (d === 270) return fn === 'sin' ? '-1' : fn === 'cos' ? '0' : '不存在';
  if (d < 90) return specialAbs(fn, d) || '';
  // 其余角用参考角 + 符号
  const ref = d < 180 ? 180 - d : d < 270 ? d - 180 : 360 - d;
  const q = d < 90 ? 1 : d < 180 ? 2 : d < 270 ? 3 : 4;
  const absVal = specialAbs(fn, ref);
  if (!absVal) return '';
  return quadrantSign(fn, q) + absVal;
}

// ===== 数列递推 =====
export function genSequenceRecurrenceV2(diff: Difficulty): PracticeQuestion {
  const kinds = diff === 'basic' ? ['arith', 'geo'] : diff === 'advanced' ? ['arith', 'geo', 'arithSum', 'geoSum'] : ['arithSum', 'geoSum', 'mixed'];
  const kind = pickOne(kinds);

  if (kind === 'arith' || kind === 'arithSum') {
    const a1 = rnd(-10, 20);
    const d = rnd(-8, 12) || 1;
    const n = rnd(5, 40);
    const an = a1 + (n - 1) * d;
    const sum = (n * (a1 + an)) / 2;
    const askSum = kind === 'arithSum';
    return mk({
      topic: 'sequence-recurrence', diff,
      question: '等差数列首项 ' + a1 + '，公差 ' + d + '，求 ' + (askSum ? '前 ' + n + ' 项和 S_' + n : '第 ' + n + ' 项 a_' + n),
      latex: 'a_1 = ' + a1 + '，d = ' + d + '，求 ' + (askSum ? 'S_{' + n + '}' : 'a_{' + n + '}'),
      answer: String(askSum ? sum : an),
      steps: [
        '通项公式：a_n = a₁ + (n−1)d',
        'a_' + n + ' = ' + a1 + ' + ' + (n - 1) + ' × ' + d + ' = ' + an,
        askSum ? '求和：S_n = n(a₁ + a_n)/2 = ' + n + ' × (' + a1 + ' + ' + an + ')/2 = ' + sum : '结果 ' + an,
      ],
    });
  }

  if (kind === 'geo' || kind === 'geoSum') {
    const a1 = pickOne([1, 2, 3, 4]);
    const q = pickOne([2, 3, -2]);
    const n = rnd(3, 9);
    const an = a1 * Math.pow(q, n - 1);
    const sum = (a1 * (Math.pow(q, n) - 1)) / (q - 1);
    const askSum = kind === 'geoSum';
    return mk({
      topic: 'sequence-recurrence', diff,
      question: '等比数列首项 ' + a1 + '，公比 ' + q + '，求 ' + (askSum ? '前 ' + n + ' 项和 S_' + n : '第 ' + n + ' 项 a_' + n),
      latex: 'a_1 = ' + a1 + '，q = ' + q + '，求 ' + (askSum ? 'S_{' + n + '}' : 'a_{' + n + '}'),
      answer: String(askSum ? sum : an),
      steps: [
        '通项：a_n = a₁q^(n−1)',
        'a_' + n + ' = ' + a1 + ' × ' + q + '^' + (n - 1) + ' = ' + an,
        askSum ? '求和：S_n = a₁(q^n − 1)/(q − 1) = ' + sum : '结果 ' + an,
      ],
    });
  }

  const a1 = rnd(1, 6);
  const n = rnd(3, 8);
  const an = a1 + (n * (n - 1)) / 2;
  return mk({
    topic: 'sequence-recurrence', diff,
    question: '数列满足 a₁ = ' + a1 + '，a_(n+1) = a_n + n，求 a_' + n,
    latex: 'a_1 = ' + a1 + '，a_{n+1} = a_n + n，求 a_{' + n + '}',
    answer: String(an),
    steps: [
      '累加法：a_n = a₁ + (1 + 2 + … + ' + (n - 1) + ')',
      '括号内 = ' + ((n * (n - 1)) / 2),
      'a_' + n + ' = ' + a1 + ' + ' + ((n * (n - 1)) / 2) + ' = ' + an,
    ],
  });
}

