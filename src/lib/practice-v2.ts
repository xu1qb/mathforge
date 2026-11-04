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
  s = s.replace(/[\u3010\u3011\uff08\uff09]+/g, (m) => '@text{' + m + '}');
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

const mk = (q: Q): PracticeQuestion => {
  const steps = q.steps.map(L);
  // 难度梯度：竞赛档要求先判断方法、最后回代检验，这是竞赛解答的实际结构
  if (q.diff === 'competition') {
    steps.unshift(L('思路：先判断题型，再选择对应的公式或定理'));
    steps.push(L('检验：把结果代回题设条件，确认满足'));
  } else if (q.diff === 'advanced') {
    steps.unshift(L('方法：先确定可直接套用的公式'));
  }
  return {
    id: uid(q.topic),
    topicKey: q.topic,
    question: q.question,
    questionLatex: L(wrapCJK(q.latex)),
    answer: q.answer,
    answerDisplay: q.display ?? q.answer,
    answerType: q.type ?? 'numeric',
    steps,
    difficulty: q.diff,
  };
};

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
    const k = rnd(2, 30);
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
    const a = rnd(1, 25);
    const b = rnd(1, 25);
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
    let q = rnd(3, 60);
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
    const p = rnd(1, 9);
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
    const p = rnd(1, 9);
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
    const a = rnd(2, 80);
    const b = rnd(2, 80);
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
    const k = rnd(1, 40);
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
      question: '求极限：lim(n→∞) (' + a + 'n²)/(3^n)',
      latex: '@lim_{n @to @infty} @dfrac{' + a + 'n^{2}}{3^{n}}',
      answer: '0',
      steps: ['指数增长远快于多项式增长', '所以极限为 0'],
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
      latex: '@' + fn + '@alpha，@alpha @in ' + ['I', 'II', 'III', 'IV'][q - 1] + '@text{ 象限，参考角 }' + base + '^{@circ}',
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



// ===== 一元二次方程 =====
export function genAlgebraQuadV2(diff: Difficulty): PracticeQuestion {
  const r1 = rnd(-9, 9);
  const r2 = rnd(-9, 9);
  const a = rnd(1, 4);
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  const kind = diff === 'basic' ? pickOne(['sum', 'product']) : diff === 'advanced' ? pickOne(['sum', 'product', 'larger']) : pickOne(['larger', 'sum', 'product']);
  const sb = b >= 0 ? '+ ' + b : '− ' + Math.abs(b);
  const sc = c >= 0 ? '+ ' + c : '− ' + Math.abs(c);
  const ans = kind === 'sum' ? r1 + r2 : kind === 'product' ? r1 * r2 : Math.max(r1, r2);
  return mk({
    topic: 'algebra-quad', diff,
    question: '已知方程 ' + a + 'x² ' + sb + 'x ' + sc + ' = 0 的两根为整数，求' + (kind === 'sum' ? '两根之和' : kind === 'product' ? '两根之积' : '较大的根'),
    latex: a + 'x^{2} ' + sb + 'x ' + sc + ' = 0，求' + (kind === 'sum' ? 'x_1 + x_2' : kind === 'product' ? 'x_1 x_2' : '@max(x_1, x_2)'),
    answer: String(ans),
    steps: [
      '因式分解：' + a + '(x − ' + r1 + ')(x − ' + r2 + ') = 0',
      '两根为 ' + r1 + ' 与 ' + r2,
      '所求为 ' + ans,
    ],
  });
}

// ===== 因式分解 =====
export function genAlgebraFactorV2(diff: Difficulty): PracticeQuestion {
  const r1 = rnd(-12, 12);
  const r2 = rnd(-12, 12);
  const a = diff === 'basic' ? 1 : rnd(1, 5);
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  const sb = b >= 0 ? '+ ' + b : '− ' + Math.abs(b);
  const sc = c >= 0 ? '+ ' + c : '− ' + Math.abs(c);
  const askRoot = pickOne([true, false]);
  return mk({
    topic: 'algebra-factor', diff,
    question: '分解因式：' + a + 'x² ' + sb + 'x ' + sc + '，求' + (askRoot ? '较大根' : '常数项与首项系数之积'),
    latex: a + 'x^{2} ' + sb + 'x ' + sc,
    answer: String(askRoot ? Math.max(r1, r2) : a * c),
    steps: [
      '找两个数，积为 a·c = ' + a * c + '，和为 −b = ' + -b,
      '这两个数是 ' + a * r1 + ' 与 ' + a * r2 + '（按分解式）',
      '分解为 ' + a + '(x − ' + r1 + ')(x − ' + r2 + ')',
    ],
  });
}

// ===== 数论基础 =====
export function genNumberTheoryV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['gcd', 'mod']) : diff === 'advanced' ? pickOne(['gcd', 'lcm', 'mod']) : pickOne(['lcm', 'mod', 'prime']);
  if (kind === 'prime') {
    const n = rnd(10, 97);
    const isPrime = (x: number) => { if (x < 2) return false; for (let i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; };
    const p = isPrime(n);
    return mk({
      topic: 'nt-gcd', diff,
      question: '判断 ' + n + ' 是否为质数（填「是」或「不是」）',
      latex: 'n = ' + n + '，' + n + ' @text{ 是质数吗？}',
      answer: p ? '是' : '不是',
      steps: ['只需检验不超过 √' + n + ' ≈ ' + Math.sqrt(n).toFixed(1) + ' 的质因子', p ? '没有质因子，所以是质数' : '存在质因子，所以不是质数'],
      type: 'expression',
    });
  }
  const a = rnd(12, 480);
  const b = rnd(12, 480);
  const gcdAB = gcd(a, b);
  if (kind === 'gcd') {
    return mk({
      topic: 'nt-gcd', diff,
      question: '求 gcd(' + a + ', ' + b + ')',
      latex: '@gcd(' + a + ', ' + b + ')',
      answer: String(gcdAB),
      steps: ['辗转相除：' + a + ' = q·' + b + ' + r 逐步化简', '最大公因数为 ' + gcdAB],
    });
  }
  if (kind === 'lcm') {
    return mk({
      topic: 'nt-gcd', diff,
      question: '求 lcm(' + a + ', ' + b + ')',
      latex: '@mathrm{lcm}(' + a + ', ' + b + ')',
      answer: String((a * b) / gcdAB),
      steps: ['lcm(a,b) = ab / gcd(a,b)', 'gcd = ' + gcdAB, 'lcm = ' + (a * b) / gcdAB],
    });
  }
  const m = rnd(3, 13);
  return mk({
    topic: 'nt-gcd', diff,
    question: '求 ' + a + ' 除以 ' + m + ' 的余数',
    latex: a + ' @bmod ' + m,
    answer: String(a % m),
    steps: [a + ' = ' + Math.floor(a / m) + ' × ' + m + ' + ' + (a % m), '余数为 ' + (a % m)],
  });
}

// ===== 均值不等式 =====
export function genInequalityAmgmV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['xPlusK', 'sumProduct']) : diff === 'advanced' ? pickOne(['xPlusK', 'sumProduct', 'reciprocal']) : pickOne(['reciprocal', 'sumProduct', 'xPlusK']);
  if (kind === 'xPlusK') {
    const t = rnd(1, 30);
    const k = t * t;
    return mk({
      topic: 'inequality-amgm', diff,
      question: 'x > 0，求 x + ' + k + '/x 的最小值',
      latex: 'x > 0，求 x + @dfrac{' + k + '}{x} 的最小值',
      answer: String(2 * t),
      steps: ['均值不等式：x + k/x ≥ 2√k', 'k = ' + k + '，2√' + k + ' = ' + 2 * t, '当 x = ' + t + ' 时取到最小值 ' + 2 * t],
    });
  }
  if (kind === 'sumProduct') {
    const s = 2 * rnd(2, 60);
    return mk({
      topic: 'inequality-amgm', diff,
      question: 'a, b > 0 且 a + b = ' + s + '，求 ab 的最大值',
      latex: 'a + b = ' + s + '，求 ab 的最大值',
      answer: String((s * s) / 4),
      steps: ['ab ≤ ((a+b)/2)²', '= (' + s + '/2)² = ' + (s * s) / 4, 'a = b = ' + s / 2 + ' 时取到'],
    });
  }
  const s = 4 * rnd(1, 25);
  return mk({
    topic: 'inequality-amgm', diff,
    question: 'x, y > 0 且 x + y = ' + s + '，求 1/x + 1/y 的最小值',
    latex: 'x + y = ' + s + '，求 @dfrac{1}{x} + @dfrac{1}{y} 的最小值',
    answer: String(4 / s),
    steps: ['1/x + 1/y = (x+y)/(xy) = ' + s + '/(xy)', 'xy ≤ ' + (s * s) / 4, '所以最小值为 4/' + s + ' = ' + 4 / s],
  });
}

// ===== 指数与幂 =====
export function genExpPowerV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['solve', 'multiply']) : diff === 'advanced' ? pickOne(['solve', 'multiply', 'power']) : pickOne(['power', 'solve', 'multiply']);
  const a = pickOne([2, 3, 4, 5]);
  if (kind === 'solve') {
    const x = rnd(1, 8);
    const val = Math.pow(a, x);
    return mk({
      topic: 'exp-power', diff,
      question: '解方程 ' + a + '^x = ' + val + '，求 x',
      latex: a + '^{x} = ' + val,
      answer: String(x),
      steps: [val + ' = ' + a + '^' + x, '所以 x = ' + x],
    });
  }
  if (kind === 'multiply') {
    const m = rnd(1, 9);
    const n = rnd(1, 9);
    return mk({
      topic: 'exp-power', diff,
      question: '化简 ' + a + '^' + m + ' × ' + a + '^' + n + ' = ' + a + '^k，求 k',
      latex: a + '^{' + m + '} @cdot ' + a + '^{' + n + '} = ' + a + '^{k}',
      answer: String(m + n),
      steps: ['同底数相乘，指数相加', 'k = ' + m + ' + ' + n + ' = ' + (m + n)],
    });
  }
  const m = rnd(1, 6);
  const n = rnd(1, 6);
  return mk({
    topic: 'exp-power', diff,
    question: '化简 (' + a + '^' + m + ')^' + n + ' = ' + a + '^k，求 k',
    latex: '@left(' + a + '^{' + m + '}@right)^{' + n + '} = ' + a + '^{k}',
    answer: String(m * n),
    steps: ['幂的乘方，指数相乘', 'k = ' + m + ' × ' + n + ' = ' + m * n],
  });
}

// ===== 对数方程 =====
export function genLogEquationV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['solve', 'evaluate']) : diff === 'advanced' ? pickOne(['solve', 'evaluate', 'product']) : pickOne(['product', 'solve', 'evaluate']);
  const a = pickOne([2, 3, 4, 5]);
  if (kind === 'solve') {
    const b = rnd(1, 7);
    const x = Math.pow(a, b);
    return mk({
      topic: 'log-equation', diff,
      question: '解方程 log_' + a + ' x = ' + b,
      latex: '@log_{' + a + '} x = ' + b,
      answer: String(x),
      steps: ['对数定义：x = ' + a + '^' + b, 'x = ' + x],
    });
  }
  if (kind === 'evaluate') {
    const b = rnd(1, 8);
    return mk({
      topic: 'log-equation', diff,
      question: '求 log_' + a + '(' + Math.pow(a, b) + ')',
      latex: '@log_{' + a + '} ' + Math.pow(a, b),
      answer: String(b),
      steps: [Math.pow(a, b) + ' = ' + a + '^' + b, '所以对数值为 ' + b],
    });
  }
  const px = rnd(1, 5);
  const py = rnd(1, 5);
  const x = Math.pow(a, px);
  const y = Math.pow(a, py);
  return mk({
    topic: 'log-equation', diff,
    question: '已知 log_' + a + ' x = ' + px + '，log_' + a + ' y = ' + py + '，求 xy',
    latex: '@log_{' + a + '} x = ' + px + '，@log_{' + a + '} y = ' + py,
    answer: String(x * y),
    steps: ['x = ' + a + '^' + px + ' = ' + x + '，y = ' + a + '^' + py + ' = ' + y, 'xy = ' + x * y],
  });
}



// ===== 向量运算 =====
export function genVectorOpV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['dot', 'magnitude']) : diff === 'advanced' ? pickOne(['dot', 'magnitude', 'cross', 'perp']) : pickOne(['cross', 'perp', 'dot']);
  if (kind === 'dot') {
    const a = rnd(-9, 9), b = rnd(-9, 9), c = rnd(-9, 9), d = rnd(-9, 9);
    return mk({
      topic: 'vector-op', diff,
      question: '求向量 (' + a + ', ' + b + ') 与 (' + c + ', ' + d + ') 的数量积',
      latex: '@vec{u} = (' + a + ', ' + b + ')，@vec{v} = (' + c + ', ' + d + ')，求 @vec{u} @cdot @vec{v}',
      answer: String(a * c + b * d),
      steps: ['数量积：对应分量相乘再相加', a + '×' + c + ' + ' + b + '×' + d + ' = ' + (a * c + b * d)],
    });
  }
  if (kind === 'magnitude') {
    const m = rnd(2, 9), n = rnd(1, m - 1);
    const p = m * m - n * n, q = 2 * m * n;
    return mk({
      topic: 'vector-op', diff,
      question: '求向量 (' + p + ', ' + q + ') 的模',
      latex: '@left@|(' + p + ', ' + q + ')@right@|',
      answer: String(m * m + n * n),
      steps: ['模 = √(p² + q²)', p + '² + ' + q + '² = ' + (p * p + q * q), '= (' + (m * m + n * n) + ')²，模为 ' + (m * m + n * n)],
    });
  }
  if (kind === 'cross') {
    const a = rnd(1, 9), b = rnd(1, 9), c = rnd(1, 9), d = rnd(1, 9);
    return mk({
      topic: 'vector-op', diff,
      question: '求向量 (' + a + ', ' + b + ') 与 (' + c + ', ' + d + ') 的叉积的模',
      latex: '@left@|(' + a + ', ' + b + ') @times (' + c + ', ' + d + ')@right@|',
      answer: String(Math.abs(a * d - b * c)),
      steps: ['二维叉积的模 = |ad − bc|', '= |' + a + '×' + d + ' − ' + b + '×' + c + '| = ' + Math.abs(a * d - b * c)],
    });
  }
  const a = rnd(-6, 6) || 1, b = rnd(-6, 6) || 1;
  return mk({
    topic: 'vector-op', diff,
    question: '判断向量 (' + a + ', ' + b + ') 与 (' + b + ', ' + -a + ') 是否垂直（填「是」或「否」）',
    latex: '@vec{u} = (' + a + ', ' + b + ')，@vec{v} = (' + b + ', ' + -a + ')',
    answer: '是',
    steps: ['数量积 = ' + a + '×' + b + ' + ' + b + '×(' + -a + ') = 0', '数量积为零，所以垂直'],
    type: 'expression',
  });
}

// ===== 矩阵运算 =====
export function genMatrixOpV2(diff: Difficulty): PracticeQuestion {
  const a = rnd(-9, 9), b = rnd(-9, 9), c = rnd(-9, 9), d = rnd(-9, 9);
  const kind = diff === 'basic' ? pickOne(['det', 'trace']) : diff === 'advanced' ? pickOne(['det', 'trace', 'add', 'scalar']) : pickOne(['mul', 'scalar', 'det']);
  const mat = '@begin{pmatrix} ' + a + ' & ' + b + ' @@ ' + c + ' & ' + d + ' @end{pmatrix}';
  if (kind === 'det') {
    return mk({
      topic: 'matrix-op', diff,
      question: '求行列式 |A|，A = [[' + a + ', ' + b + '], [' + c + ', ' + d + ']]',
      latex: 'A = ' + mat + '，求 @det A',
      answer: String(a * d - b * c),
      steps: ['二阶行列式：ad − bc', '= ' + a + '×' + d + ' − ' + b + '×' + c + ' = ' + (a * d - b * c)],
    });
  }
  if (kind === 'trace') {
    return mk({
      topic: 'matrix-op', diff,
      question: '求矩阵 A 的迹，A = [[' + a + ', ' + b + '], [' + c + ', ' + d + ']]',
      latex: 'A = ' + mat + '，求 @mathrm{tr}(A)',
      answer: String(a + d),
      steps: ['迹 = 主对角线元素之和', a + ' + ' + d + ' = ' + (a + d)],
    });
  }
  if (kind === 'add') {
    const e = rnd(-9, 9), f = rnd(-9, 9);
    return mk({
      topic: 'matrix-op', diff,
      question: '求 A + B 的第 1 行第 2 列元素，A = [[' + a + ', ' + b + '], [' + c + ', ' + d + ']]，B 的第 1 行第 2 列为 ' + f,
      latex: 'A = ' + mat + '，B_{12} = ' + f + '，求 (A+B)_{12}',
      answer: String(b + f),
      steps: ['矩阵加法逐元素相加', b + ' + ' + f + ' = ' + (b + f)],
    });
  }
  if (kind === 'scalar') {
    const k = rnd(2, 9);
    return mk({
      topic: 'matrix-op', diff,
      question: '求 ' + k + 'A 的第 2 行第 1 列元素，A = [[' + a + ', ' + b + '], [' + c + ', ' + d + ']]',
      latex: k + 'A，A = ' + mat + '，求第 2 行第 1 列',
      answer: String(k * c),
      steps: ['数乘矩阵：每个元素乘 ' + k, k + ' × ' + c + ' = ' + k * c],
    });
  }
  const e = rnd(-5, 5), f = rnd(-5, 5);
  return mk({
    topic: 'matrix-op', diff,
    question: '求 AB 的第 1 行第 1 列元素，A 第 1 行 = (' + a + ', ' + b + ')，B 第 1 列 = (' + e + ', ' + f + ')',
    latex: '(AB)_{11} = (' + a + ', ' + b + ') @cdot (' + e + ', ' + f + ')^{T}',
    answer: String(a * e + b * f),
    steps: ['矩阵乘法的元素 = 左行 · 右列', a + '×' + e + ' + ' + b + '×' + f + ' = ' + (a * e + b * f)],
  });
}

// ===== 复数 =====
export function genComplexV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['modulus', 'conj']) : diff === 'advanced' ? pickOne(['modulus', 'conj', 'add']) : pickOne(['multiply', 'add', 'modulus']);
  const m = rnd(2, 9), n = rnd(1, m - 1);
  const a = m * m - n * n, b = 2 * m * n;
  if (kind === 'modulus') {
    return mk({
      topic: 'complex-equation', diff,
      question: '求 |' + a + ' + ' + b + 'i|',
      latex: '@left@| ' + a + ' + ' + b + 'i @right@|',
      answer: String(m * m + n * n),
      steps: ['|a + bi| = √(a² + b²)', a + '² + ' + b + '² = ' + (a * a + b * b) + ' = ' + (m * m + n * n) + '²'],
    });
  }
  if (kind === 'conj') {
    return mk({
      topic: 'complex-equation', diff,
      question: '求 z · z̄，其中 z = ' + a + ' + ' + b + 'i',
      latex: 'z = ' + a + ' + ' + b + 'i，求 z @overline{z}',
      answer: String(a * a + b * b),
      steps: ['z·z̄ = |z|² = a² + b²', '= ' + (a * a + b * b)],
    });
  }
  if (kind === 'add') {
    const c = rnd(-9, 9), d = rnd(-9, 9);
    return mk({
      topic: 'complex-equation', diff,
      question: '求 z + w 的实部，z = ' + a + ' + ' + b + 'i，w = ' + c + ' + ' + d + 'i',
      latex: 'z = ' + a + ' + ' + b + 'i，w = ' + c + ' + ' + d + 'i，求 @Re(z + w)',
      answer: String(a + c),
      steps: ['复数相加：实部加实部', a + ' + ' + c + ' = ' + (a + c)],
    });
  }
  const c = rnd(-9, 9), d = rnd(-9, 9);
  return mk({
    topic: 'complex-equation', diff,
    question: '求 z·w 的虚部，z = ' + a + ' + ' + b + 'i，w = ' + c + ' + ' + d + 'i',
    latex: 'z = ' + a + ' + ' + b + 'i，w = ' + c + ' + ' + d + 'i，求 @Im(zw)',
    answer: String(a * d + b * c),
    steps: ['(a+bi)(c+di) = (ac − bd) + (ad + bc)i', '虚部 = ad + bc = ' + a + '×' + d + ' + ' + b + '×' + c + ' = ' + (a * d + b * c)],
  });
}



// ===== 平面几何 =====
export function genGeometryV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['area', 'hypotenuse']) : diff === 'advanced' ? pickOne(['area', 'hypotenuse', 'diagonal']) : pickOne(['diagonal', 'hypotenuse', 'area']);
  if (kind === 'area') {
    const b = rnd(2, 30);
    const h = rnd(2, 30);
    return mk({
      topic: 'geometry-basic', diff,
      question: '三角形底边 ' + b + '，高 ' + h + '，求面积',
      latex: 'S = @dfrac{1}{2} @cdot ' + b + ' @cdot ' + h,
      answer: String((b * h) / 2),
      steps: ['三角形面积 = 底 × 高 ÷ 2', '= ' + b + ' × ' + h + ' ÷ 2 = ' + (b * h) / 2],
    });
  }
  if (kind === 'hypotenuse') {
    const m = rnd(2, 12), n = rnd(1, m - 1);
    const p = m * m - n * n, q = 2 * m * n, r = m * m + n * n;
    return mk({
      topic: 'geometry-basic', diff,
      question: '直角三角形两直角边为 ' + p + ' 与 ' + q + '，求斜边',
      latex: 'a = ' + p + '，b = ' + q + '，c = ?',
      answer: String(r),
      steps: ['勾股定理：c² = a² + b²', p + '² + ' + q + '² = ' + (p * p + q * q) + ' = ' + r + '²', 'c = ' + r],
    });
  }
  const w = rnd(3, 25);
  const h = rnd(3, 25);
  return mk({
    topic: 'geometry-basic', diff,
    question: '矩形长 ' + w + '、宽 ' + h + '，求对角线长度（结果保留 2 位小数）',
    latex: '@sqrt{' + w + '^{2} + ' + h + '^{2}}',
    answer: String(Number(Math.hypot(w, h).toFixed(2))),
    steps: ['对角线 = √(w² + h²)', '= √' + (w * w + h * h), '≈ ' + Math.hypot(w, h).toFixed(2)],
  });
}

// ===== 组合计数 =====
export function genCombinatoricsV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['comb', 'perm']) : diff === 'advanced' ? pickOne(['comb', 'perm', 'factorial']) : pickOne(['perm', 'factorial', 'comb']);
  const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
  if (kind === 'comb') {
    const n = rnd(4, 18);
    const k = rnd(1, n - 1);
    return mk({
      topic: 'combinatorics-basic', diff,
      question: '求 C(' + n + ', ' + k + ')',
      latex: 'C_{' + n + '}^{' + k + '}',
      answer: String(fact(n) / (fact(k) * fact(n - k))),
      steps: ['C(n,k) = n!/(k!(n−k)!)', '= ' + fact(n) + '/(' + fact(k) + '×' + fact(n - k) + ')', '= ' + fact(n) / (fact(k) * fact(n - k))],
    });
  }
  if (kind === 'perm') {
    const n = rnd(4, 10);
    const k = rnd(1, n);
    return mk({
      topic: 'combinatorics-basic', diff,
      question: '求 P(' + n + ', ' + k + ')',
      latex: 'P_{' + n + '}^{' + k + '}',
      answer: String(fact(n) / fact(n - k)),
      steps: ['P(n,k) = n!/(n−k)!', '= ' + fact(n) + '/' + fact(n - k) + ' = ' + fact(n) / fact(n - k)],
    });
  }
  const n = rnd(3, 10);
  return mk({
    topic: 'combinatorics-basic', diff,
    question: '求 ' + n + '!',
    latex: n + '!',
    answer: String(fact(n)),
    steps: [n + '! = ' + Array.from({ length: n }, (_, i) => n - i).join(' × '), '= ' + fact(n)],
  });
}

// ===== 坐标几何 =====
export function genCoordinateV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['distance', 'midpoint']) : diff === 'advanced' ? pickOne(['distance', 'midpoint', 'slope']) : pickOne(['slope', 'line', 'distance']);
  const m = rnd(2, 10), n = rnd(1, m - 1);
  const dx = m * m - n * n, dy = 2 * m * n;
  if (kind === 'distance') {
    return mk({
      topic: 'coordinate-geometry', diff,
      question: '求点 (' + dx + ', ' + dy + ') 到原点的距离',
      latex: '@sqrt{(' + dx + ')^{2} + (' + dy + ')^{2}}',
      answer: String(m * m + n * n),
      steps: ['距离 = √(x² + y²)', dx + '² + ' + dy + '² = ' + (m * m + n * n) + '²', '距离为 ' + (m * m + n * n)],
    });
  }
  if (kind === 'midpoint') {
    const x1 = rnd(-20, 20), x2 = rnd(-20, 20);
    const y1 = rnd(-20, 20), y2 = rnd(-20, 20);
    const evenX = (x1 + x2) % 2 === 0;
    return mk({
      topic: 'coordinate-geometry', diff,
      question: '求 (' + x1 + ', ' + y1 + ') 与 (' + x2 + ', ' + y2 + ') 中点' + (evenX ? '的横坐标' : '横坐标的两倍'),
      latex: '@left(' + x1 + ', ' + y1 + '@right)，@left(' + x2 + ', ' + y2 + '@right)',
      answer: String(evenX ? (x1 + x2) / 2 : x1 + x2),
      steps: ['中点横坐标 = (x₁ + x₂)/2', '= (' + x1 + ' + ' + x2 + ')/2', evenX ? '= ' + (x1 + x2) / 2 : '两倍为 ' + (x1 + x2)],
    });
  }
  if (kind === 'slope') {
    const k = rnd(-5, 5) || 1;
    const x1 = rnd(-6, 6);
    const y1 = rnd(-12, 12);
    const x2 = x1 + rnd(1, 6);
    const y2 = y1 + k * (x2 - x1);
    return mk({
      topic: 'coordinate-geometry', diff,
      question: '求过 (' + x1 + ', ' + y1 + ') 与 (' + x2 + ', ' + y2 + ') 的直线斜率',
      latex: 'k = @dfrac{' + y2 + ' - ' + y1 + '}{' + x2 + ' - ' + x1 + '}',
      answer: String(k),
      steps: ['斜率 k = (y₂ − y₁)/(x₂ − x₁)', '= ' + (y2 - y1) + '/' + (x2 - x1), '= ' + k],
    });
  }
  const k = rnd(-4, 4) || 1;
  const b = rnd(-10, 10);
  const x = rnd(1, 6);
  return mk({
    topic: 'coordinate-geometry', diff,
    question: '直线 y = ' + k + 'x + ' + b + ' 在 x = ' + x + ' 处的函数值',
    latex: 'y = ' + k + 'x + ' + b + '，x = ' + x,
    answer: String(k * x + b),
    steps: ['代入 x = ' + x, k + '×' + x + ' + ' + b + ' = ' + (k * x + b)],
  });
}



// ===== 圆锥曲线 =====
export function genConicV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['ellipseC', 'parabola']) : diff === 'advanced' ? pickOne(['ellipseC', 'parabola', 'eccentricity']) : pickOne(['eccentricity', 'hyperbolaC', 'parabola']);
  if (kind === 'ellipseC' || kind === 'eccentricity') {
    const m = rnd(2, 11);
    const n = rnd(1, m - 1);
    const a = m * m + n * n;
    const b = m * m - n * n;
    const c = 2 * m * n;
    if (kind === 'eccentricity') {
      return mk({
        topic: 'conic-sections', diff,
        question: '椭圆 x²/' + (a * a) + ' + y²/' + (b * b) + ' = 1 的离心率',
        latex: '@dfrac{x^{2}}{' + a * a + '} + @dfrac{y^{2}}{' + b * b + '} = 1，求 e',
        answer: frac(c, a),
        steps: ['c² = a² − b²', 'c = ' + c, 'e = c/a = ' + frac(c, a)],
      });
    }
    return mk({
      topic: 'conic-sections', diff,
      question: '椭圆 x²/' + (a * a) + ' + y²/' + (b * b) + ' = 1 的半焦距 c',
      latex: '@dfrac{x^{2}}{' + a * a + '} + @dfrac{y^{2}}{' + b * b + '} = 1，求 c',
      answer: String(c),
      steps: ['c² = a² − b² = ' + (a * a - b * b), 'c = ' + c],
    });
  }
  if (kind === 'hyperbolaC') {
    const m = rnd(2, 11);
    const n = rnd(1, m - 1);
    const a = m * m - n * n;
    const b = 2 * m * n;
    return mk({
      topic: 'conic-sections', diff,
      question: '双曲线 x²/' + (a * a) + ' − y²/' + (b * b) + ' = 1 的半焦距 c',
      latex: '@dfrac{x^{2}}{' + a * a + '} - @dfrac{y^{2}}{' + b * b + '} = 1，求 c',
      answer: String(m * m + n * n),
      steps: ['c² = a² + b² = ' + (a * a + b * b), 'c = ' + (m * m + n * n)],
    });
  }
  const p = 2 * rnd(1, 12);
  return mk({
    topic: 'conic-sections', diff,
    question: '抛物线 y² = ' + p + 'x 的焦点到准线的距离',
    latex: 'y^{2} = ' + p + 'x',
    answer: String(p),
    steps: ['标准形式 y² = 2px，焦点 (p/2, 0)，准线 x = −p/2', '距离 = p = ' + p],
  });
}

// ===== 立体几何 =====
export function genSolidV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['cube', 'cuboid']) : diff === 'advanced' ? pickOne(['cube', 'cuboid', 'cylinder', 'cone']) : pickOne(['cone', 'cylinder', 'sphere', 'cuboid']);
  if (kind === 'cube') {
    const a = rnd(2, 30);
    return mk({
      topic: 'solid-geometry', diff,
      question: '正方体棱长 ' + a + '，求体积',
      latex: 'V = a^{3}，a = ' + a,
      answer: String(a * a * a),
      steps: ['正方体体积 = a³', '= ' + a + '³ = ' + a * a * a],
    });
  }
  if (kind === 'cuboid') {
    const a = rnd(2, 20), b = rnd(2, 20), c = rnd(2, 20);
    return mk({
      topic: 'solid-geometry', diff,
      question: '长方体长宽高为 ' + a + '、' + b + '、' + c + '，求体积',
      latex: 'a = ' + a + '，b = ' + b + '，c = ' + c + '，求 V',
      answer: String(a * b * c),
      steps: ['体积 = 长 × 宽 × 高', '= ' + a + '×' + b + '×' + c + ' = ' + a * b * c],
    });
  }
  if (kind === 'cylinder') {
    const r = rnd(1, 15), h = rnd(1, 20);
    return mk({
      topic: 'solid-geometry', diff,
      question: '圆柱底面半径 ' + r + '、高 ' + h + '，体积写成 kπ，求 k',
      latex: 'V = @pi r^{2} h，r = ' + r + '，h = ' + h,
      answer: String(r * r * h),
      steps: ['圆柱体积 = πr²h', 'k = r²h = ' + r * r * h],
    });
  }
  if (kind === 'cone') {
    const r = rnd(3, 15);
    const h = rnd(3, 20);
    return mk({
      topic: 'solid-geometry', diff,
      question: '圆锥底面半径 ' + r + '、高 ' + h + '，体积写成 kπ，求 k（结果保留 2 位小数）',
      latex: 'V = @dfrac{1}{3}@pi r^{2} h，r = ' + r + '，h = ' + h,
      answer: String(Number(((r * r * h) / 3).toFixed(2))),
      steps: ['圆锥体积 = (1/3)πr²h', 'k = ' + r + '²×' + h + '/3 = ' + ((r * r * h) / 3).toFixed(2)],
    });
  }
  const r = rnd(3, 15);
  return mk({
    topic: 'solid-geometry', diff,
    question: '球半径 ' + r + '，体积写成 kπ，求 k（结果保留 2 位小数）',
    latex: 'V = @dfrac{4}{3}@pi r^{3}，r = ' + r,
    answer: String(Number(((4 * r * r * r) / 3).toFixed(2))),
    steps: ['球体积 = (4/3)πr³', 'k = 4×' + r + '³/3 = ' + ((4 * r * r * r) / 3).toFixed(2)],
  });
}

// ===== 古典概率 =====
export function genProbabilityV2(diff: Difficulty): PracticeQuestion {
  const kind = diff === 'basic' ? pickOne(['dice', 'balls']) : diff === 'advanced' ? pickOne(['dice', 'balls', 'coin']) : pickOne(['coin', 'dice', 'balls']);
  if (kind === 'dice') {
    const s = rnd(2, 12);
    const count = s <= 7 ? s - 1 : 13 - s;
    return mk({
      topic: 'probability-classical', diff,
      question: '掷两枚均匀骰子，点数和为 ' + s + ' 的概率（用分数表示）',
      latex: 'P(X + Y = ' + s + ')',
      answer: frac(count, 36),
      steps: ['总情况 36 种', '和为 ' + s + ' 的情况有 ' + count + ' 种', '概率 = ' + frac(count, 36)],
      type: 'expression',
    });
  }
  if (kind === 'coin') {
    const n = rnd(2, 10);
    const k = rnd(1, n - 1);
    const c = (() => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; })();
    return mk({
      topic: 'probability-classical', diff,
      question: '抛 ' + n + ' 枚均匀硬币，恰有 ' + k + ' 枚正面的概率（用分数表示）',
      latex: 'P = @dfrac{C_{' + n + '}^{' + k + '}}{2^{' + n + '}}',
      answer: frac(c, Math.pow(2, n)),
      steps: ['总情况 2^' + n + ' = ' + Math.pow(2, n), '有利情况 C(' + n + ',' + k + ') = ' + c, '概率 = ' + frac(c, Math.pow(2, n))],
      type: 'expression',
    });
  }
  const r = rnd(1, 30), w = rnd(1, 30);
  return mk({
    topic: 'probability-classical', diff,
    question: '袋中有 ' + r + ' 个红球、' + w + ' 个白球，任取一个为红球的概率（用分数表示）',
    latex: 'P = @dfrac{' + r + '}{' + r + ' + ' + w + '}',
    answer: frac(r, r + w),
    steps: ['总球数 ' + (r + w), '红球 ' + r + ' 个', '概率 = ' + frac(r, r + w)],
    type: 'expression',
  });
}



// ===== 综合创新：跨知识点融合题 =====
// 结构与参数分离：结构来自「两个知识点如何组合」，参数只负责随机化。
const BS2 = String.fromCharCode(92);
const L2 = (s: string) => s.split('@').join(BS2);
const gcd2 = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd2(b, a % b));
const frac2 = (p: number, q: number) => { const g = gcd2(p, q) || 1; const np = p / g; const nq = q / g; return nq === 1 ? String(np) : np + '/' + nq; };

function mkFusion(p: {
  tag: string; question: string; latex: string; answer: string; steps: string[]; type?: 'numeric' | 'expression'; diff: Difficulty;
}): PracticeQuestion {
  const steps = p.steps.map(L2);
  if (p.diff === 'competition') {
    steps.unshift(L2('思路：先判断题型，再选择对应的公式或定理'));
    steps.push(L2('检验：把结果代回题设条件，确认满足'));
  } else if (p.diff === 'advanced') {
    steps.unshift(L2('方法：先确定可直接套用的公式'));
  }
  return {
    id: 'fusion-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    topicKey: 'fusion',
    question: '【' + p.tag + '】' + p.question,
    questionLatex: L(wrapCJK(p.tag + ' ' + p.latex)),
    answer: p.answer,
    answerDisplay: p.answer,
    answerType: p.type ?? 'numeric',
    steps,
    difficulty: p.diff,
  };
}

export function genFusion(diff: Difficulty): PracticeQuestion {
  // 两科融合（进阶）/ 两科或三科融合（竞赛）
  const twoTopic = ['seqMod', 'seqDigit', 'seqMax', 'probCombo', 'complexDemoivre', 'derivMin', 'limitExp'];
  const threeTopic = ['countPowMod', 'fibRatio', 'cosSum', 'oddMultiple', 'matrixIterate', 'sinCount', 'oddTripleProb', 'coprimeCount', 'fibMatrix', 'geoExpect', 'seqDivisible'];
  const fourTopic = ['coprimeProb', 'fibParity', 'rotationNorm', 'sinLimit'];
  const kinds = diff === 'competition' ? twoTopic.concat(threeTopic, fourTopic) : twoTopic;
  const kind = kinds[Math.floor(Math.random() * kinds.length)];

  if (kind === 'seqMod') {
    const a = pickOneFusion([2, 3, 4, 5]);
    const m = pickOneFusion([5, 7, 9, 11, 13]);
    const n0 = rndFusion(3, 12);
    let period = 1;
    let cur = a % m;
    while (cur !== 1 && period < 60) { cur = (cur * a) % m; period++; }
    const rem = (a ** (n0 % period === 0 ? period : n0 % period)) % m;
    return mkFusion({
      diff,
      tag: '数列 × 数论',
      question: '数列 aₙ = ' + a + '^n，求 a_' + n0 + ' 除以 ' + m + ' 的余数',
      latex: 'a_n = ' + a + '^{n}，求 a_{' + n0 + '} @bmod ' + m,
      answer: String(rem),
      steps: [
        '先找 ' + a + '^n mod ' + m + ' 的周期：a^' + period + ' ≡ 1 (mod ' + m + ')',
        '指数按周期缩减：' + n0 + ' ≡ ' + (n0 % period) + ' (mod ' + period + ')',
        '所以 a_' + n0 + ' ≡ ' + a + '^' + (n0 % period || period) + ' ≡ ' + rem + ' (mod ' + m + ')',
      ],
    });
  }

  if (kind === 'seqDigit') {
    const a = pickOneFusion([2, 3, 7, 8]);
    const n0 = rndFusion(4, 20);
    const digits: Record<number, number[]> = {
      2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6],
    };
    const cyc = digits[a];
    const d = cyc[(n0 - 1) % 4];
    return mkFusion({
      diff,
      tag: '数列 × 数论',
      question: '数列 aₙ = ' + a + '^n，求 a_' + n0 + ' 的个位数字',
      latex: 'a_n = ' + a + '^{n}，求 a_{' + n0 + '} 的个位数字',
      answer: String(d),
      steps: [
        '个位数字以 4 为周期循环：' + cyc.join(', ') + '…',
        n0 + ' mod 4 = ' + ((n0 - 1) % 4 + 1) + '，对应第 ' + ((n0 - 1) % 4 + 1) + ' 个数字',
        '所以个位是 ' + d,
      ],
    });
  }

  if (kind === 'coprimeCount') {
    const N = rndFusion(20, 200);
    const count = N - Math.floor(N / 2) - Math.floor(N / 3) + Math.floor(N / 6);
    return mkFusion({
      diff,
      tag: '数论 × 组合（容斥）',
      question: '1 到 ' + N + ' 中与 6 互素的整数有多少个？',
      latex: '@left@{1, 2, @dots, ' + N + '@right@}@text{ 中与 } 6 @text{ 互素的个数}',
      answer: String(count),
      steps: [
        '6 = 2 × 3，互素即不被 2 也不被 3 整除',
        '容斥：N − ⌊N/2⌋ − ⌊N/3⌋ + ⌊N/6⌋',
        '= ' + N + ' − ' + Math.floor(N / 2) + ' − ' + Math.floor(N / 3) + ' + ' + Math.floor(N / 6) + ' = ' + count,
      ],
    });
  }

  if (kind === 'seqMax') {
    const a = pickOneFusion([1, 2, 3, 4]);
    const n = a;
    return mkFusion({
      diff,
      tag: '数列 × 不等式',
      question: '数列 aₙ = n/(n² + ' + a * a + ')（n ≥ 1）的最大值出现在 n = ' + a + ' 处，求该最大值',
      latex: 'a_n = @dfrac{n}{n^{2} + ' + a * a + '}',
      answer: frac2(1, 2 * a),
      steps: [
        '由均值不等式：n + ' + a * a + '/n ≥ 2a',
        '所以 aₙ = 1/(n + ' + a * a + '/n) ≤ 1/(2a)',
        'n = ' + a + ' 时取等号，最大值为 ' + frac2(1, 2 * a),
      ],
    });
  }

  if (kind === 'fibMatrix') {
    const n = rndFusion(5, 18);
    const fib = (k: number): number => (k <= 2 ? 1 : fib(k - 1) + fib(k - 2));
    return mkFusion({
      diff,
      tag: '矩阵 × 递推',
      question: 'Fibonacci 数列 F₁ = F₂ = 1，Fₙ = Fₙ₋₁ + Fₙ₋₂。用矩阵 [[' + 1 + ',1],[1,0]] 的幂求 F_' + n,
      latex: 'F_{' + n + '} = ?@quad @begin{pmatrix} 1 & 1 @ 1 & 0 @end{pmatrix}^{n-1} = @begin{pmatrix} F_n & F_{n-1} @ F_{n-1} & F_{n-2} @end{pmatrix}',
      answer: String(fib(n)),
      steps: [
        '转移到矩阵的特征值为 (1±√5)/2（黄金分割）',
        '矩阵幂的左上角元素就是 F_' + n,
        '直接递推：F_' + n + ' = ' + fib(n),
      ],
    });
  }

  if (kind === 'probCombo') {
    const r = rndFusion(2, 10);
    const w = rndFusion(2, 10);
    const total = (r + w) * (r + w - 1) / 2;
    const fav = r * (r - 1) / 2;
    return mkFusion({
      diff,
      tag: '概率 × 组合',
      question: '袋中 ' + r + ' 红 ' + w + ' 白，任取 2 个，求两个都是红球的概率',
      latex: 'P = @dfrac{C_{' + r + '}^{2}}{C_{' + r + w + '}^{2}}',
      answer: frac2(fav, total),
      steps: [
        '总取法 C(' + (r + w) + ', 2) = ' + total,
        '有利取法 C(' + r + ', 2) = ' + fav,
        '概率 = ' + frac2(fav, total),
      ],
      type: 'expression',
    });
  }

  if (kind === 'limitExp') {
    const k = rndFusion(1, 5);
    const m = rndFusion(1, 5);
    return mkFusion({
      diff,
      tag: '极限 × 指数',
      question: '求 lim(n→∞) (1 + ' + k + '/n)^(' + m + 'n)',
      latex: '@lim_{n @to @infty} @left(1 + @dfrac{' + k + '}{n}@right)^{' + m + 'n}',
      answer: 'e^' + (k * m),
      steps: [
        '把指数拆成 (1 + k/n)^n 的 ' + m + ' 次方',
        '(1 + k/n)^n → e^' + k,
        '所以极限为 e^' + (k * m),
      ],
      type: 'expression',
    });
  }

  if (kind === 'complexDemoivre') {
    const n = pickOneFusion([2, 3, 4, 6]);
    const theta = pickOneFusion([30, 45, 60, 90]);
    const mapping: Record<number, Record<number, string>> = {
      2: { 30: '1/2', 45: '0', 60: '-1/2', 90: '-1' },
      3: { 30: '0', 45: '-sqrt(2)/2', 60: '-1', 90: '0' },
      4: { 30: '-1/2', 45: '-1', 60: '-1/2', 90: '1' },
      6: { 30: '-1', 45: '0', 60: '1', 90: '1' },
    };
    const val = mapping[n][theta];
    return mkFusion({
      diff,
      tag: '复数 × 三角',
      question: 'z = cos' + theta + '° + i·sin' + theta + '°，求 z^' + n + ' 的实部',
      latex: 'z = @cos ' + theta + '^{@circ} + i@sin ' + theta + '^{@circ}，求 @Re(z^{' + n + '})',
      answer: val,
      steps: [
        '棣莫弗定理：zⁿ = cos(nθ) + i·sin(nθ)',
        'nθ = ' + n * theta + '°',
        '实部为 cos(' + n * theta + '°) = ' + val,
      ],
      type: 'expression',
    });
  }

  if (kind === 'derivMin') {
    const t = rndFusion(1, 6);
    const a = t * t;
    return mkFusion({
      diff,
      tag: '导数 × 不等式',
      question: '求 f(x) = x³ − ' + 3 * a + 'x 的极小值',
      latex: 'f(x) = x^{3} - ' + 3 * a + 'x',
      answer: String(-2 * a * t),
      steps: [
        "f'(x) = 3x² − " + 3 * a + ' = 0，得 x = ±' + t,
        "f''(x) = 6x，x = " + t + ' 处为正，是极小值点',
        '极小值 f(' + t + ') = ' + (-2 * a * t),
      ],
    });
  }

  if (kind === 'geoExpect') {
    const p = pickOneFusion([2, 3, 4, 5, 6]);
    return mkFusion({
      diff,
      tag: '级数 × 概率',
      question: '每次试验成功概率 1/' + p + '，求首次成功所需次数的期望',
      latex: 'P(X = k) = @left(1 - @dfrac{1}{' + p + '}@right)^{k-1}@dfrac{1}{' + p + '}，求 E(X)',
      answer: String(p),
      steps: [
        '这是几何分布，E(X) = 1/p',
        '也可由级数求和：Σ k·(1−p)^(k−1)·p = 1/p',
        'p = 1/' + p + '，所以 E(X) = ' + p,
      ],
    });
  }

  if (kind === 'countPowMod') {
    const N = rndFusion(10, 120);
    const cnt = Math.floor(N / 3);
    return mkFusion({
      diff,
      tag: '数列 × 数论 × 组合',
      question: '1 到 ' + N + ' 中有多少个 n 使 2ⁿ 除以 7 余 1？',
      latex: '@left@{n @le ' + N + ' : 2^{n} @equiv 1 @pmod{7}@right@}@text{ 的个数}',
      answer: String(cnt),
      steps: [
        '先找周期：2¹=2，2²=4，2³≡1 (mod 7)，周期为 3',
        '所以 n 必须是 3 的倍数',
        '1 到 ' + N + ' 中 3 的倍数有 ⌊' + N + '/3⌋ = ' + cnt + ' 个',
      ],
    });
  }

  if (kind === 'fibRatio') {
    const n = rndFusion(8, 20);
    return mkFusion({
      diff,
      tag: '矩阵 × 递推 × 极限',
      question: 'Fibonacci 数列相邻两项之比 Fₙ₊₁/Fₙ 当 n→∞ 时的极限',
      latex: '@lim_{n @to @infty} @dfrac{F_{n+1}}{F_{n}}',
      answer: '(1+sqrt(5))/2',
      steps: [
        '设极限为 L，由 Fₙ₊₁ = Fₙ + Fₙ₋₁ 得 L = 1 + 1/L',
        '解得 L² − L − 1 = 0，L = (1 ± √5)/2',
        '取正根 L = (1+√5)/2（黄金分割比）',
      ],
      type: 'expression',
    });
  }

  if (kind === 'cosSum') {
    const m = rndFusion(1, 6);
    const n = 6 * m;
    return mkFusion({
      diff,
      tag: '三角 × 复数 × 数列',
      question: '求 cos(π/3) + cos(2π/3) + … + cos(' + n + 'π/3)',
      latex: '@sum_{k=1}^{' + n + '} @cos@left(@dfrac{k@pi}{3}@right)',
      answer: '0',
      steps: [
        'cos(kπ/3) 以 6 为周期，一个周期内六项之和为 0',
        'n = ' + n + ' 恰好是 ' + m + ' 个完整周期',
        '所以总和为 0',
      ],
    });
  }

  if (kind === 'oddMultiple') {
    const N = rndFusion(20, 200);
    const cnt = Math.floor((N + 3) / 6);
    return mkFusion({
      diff,
      tag: '数论 × 组合 × 数列',
      question: '1 到 ' + N + ' 中，既是 3 的倍数又是奇数的整数有多少个？',
      latex: '@left@{n @le ' + N + ' : 3 @mid n,@@ 2 @nmid n@right@}@text{ 的个数}',
      answer: String(cnt),
      steps: [
        '3 的倍数为 3, 6, 9, 12, …，其中奇数的是 3, 9, 15, …（每隔 6 一个）',
        '个数 = ⌊(' + N + ' + 3)/6⌋',
        '= ' + cnt,
      ],
    });
  }

  if (kind === 'matrixIterate') {
    const x = rndFusion(-5, 5);
    const yv = rndFusion(1, 5);
    const n = rndFusion(2, 12);
    return mkFusion({
      diff,
      tag: '向量 × 矩阵 × 数列',
      question: '向量 v₁ = (' + x + ', ' + yv + ')，每次左乘 M = [[1,1],[0,1]]，求 v_' + n + ' 的第一个分量',
      latex: '@vec{v}_{k+1} = @begin{pmatrix} 1 & 1 @@ 0 & 1 @end{pmatrix}@vec{v}_k，@vec{v}_1 = (' + x + ', ' + yv + ')，求 v_{' + n + ',1}',
      answer: String(x + (n - 1) * yv),
      steps: [
        '每次乘 M 相当于 (a, b) ↦ (a + b, b)',
        '第二个分量不变，第一个分量每次加 ' + yv,
        '经过 ' + (n - 1) + ' 次：' + x + ' + ' + (n - 1) + '×' + yv + ' = ' + (x + (n - 1) * yv),
      ],
    });
  }



  if (kind === 'sinCount') {
    const N = rndFusion(12, 120);
    const cnt = Math.floor((N + 3) / 6);
    return mkFusion({
      diff,
      tag: '三角 × 数论 × 组合',
      question: '1 到 ' + N + ' 中有多少个 n 使 sin(nπ/6) = 1/2？',
      latex: '@left@{n @le ' + N + ' : @sin@dfrac{n@pi}{6} = @dfrac{1}{2}@right@}',
      answer: String(cnt),
      steps: [
        'sin(θ) = 1/2 在 [0,2π) 内 θ = π/6 或 5π/6',
        '因此 n ≡ 1 或 5 (mod 12)，合并后每 6 个有一个 n 满足',
        '个数为 ⌊(' + N + ' + 3)/6⌋ = ' + cnt,
      ],
    });
  }

  if (kind === 'oddTripleProb') {
    const N = rndFusion(30, 240);
    const cnt = Math.floor((N + 3) / 6);
    return mkFusion({
      diff,
      tag: '概率 × 数论 × 组合',
      question: '从 1 到 ' + N + ' 中等概率取一个整数，求它是 3 的倍数且为奇数的概率',
      latex: 'P = @dfrac{@left@{n @le ' + N + ' : 3 @mid n,@@ 2 @nmid n@right@}}{' + N + '}',
      answer: frac2(cnt, N),
      steps: [
        '既是 3 的倍数又是奇数：3, 9, 15, …（每 6 个一个）',
        '个数 = ⌊(' + N + ' + 3)/6⌋ = ' + cnt,
        '概率 = ' + frac2(cnt, N),
      ],
      type: 'expression',
    });
  }

  if (kind === 'coprimeProb') {
    const N = rndFusion(24, 240);
    const cnt = N - Math.floor(N / 2) - Math.floor(N / 3) + Math.floor(N / 6);
    return mkFusion({
      diff,
      tag: '数论 × 组合 × 概率 × 数列',
      question: '从 1 到 ' + N + ' 中等概率取一个整数，求它与 6 互素的概率',
      latex: 'P = @dfrac{@varphi_6(' + N + ')}{' + N + '}',
      answer: frac2(cnt, N),
      steps: [
        '容斥计数：与 6 互素 ⟺ 既不被 2 也不被 3 整除',
        '个数 = ' + N + ' − ⌊N/2⌋ − ⌊N/3⌋ + ⌊N/6⌋ = ' + cnt,
        '概率 = ' + frac2(cnt, N),
      ],
      type: 'expression',
    });
  }

  if (kind === 'fibParity') {
    const n = rndFusion(4, 24);
    const fib = (k: number): number => (k <= 2 ? 1 : fib(k - 1) + fib(k - 2));
    const v = fib(n);
    return mkFusion({
      diff,
      tag: '矩阵 × 递推 × 数论 × 数列',
      question: '用转移矩阵 [[1,1],[1,0]] 求 F_' + n + '（F₁=F₂=1），判断它的奇偶性（填「奇」或「偶」）',
      latex: 'F_{' + n + '} = ?@quad @begin{pmatrix} 1 & 1 @@ 1 & 0 @end{pmatrix}^{n-1}',
      answer: v % 2 === 1 ? '奇' : '偶',
      steps: [
        'Fₙ 的奇偶以 3 为周期：奇、奇、偶循环',
        n + ' mod 3 = ' + (n % 3) + (n % 3 === 0 ? '，所以是偶数' : '，所以是奇数'),
        '验证：F_' + n + ' = ' + v,
      ],
      type: 'expression',
    });
  }

  if (kind === 'rotationNorm') {
    const m = rndFusion(2, 9);
    const n0 = rndFusion(1, m - 1);
    const a = m * m - n0 * n0;
    const b = 2 * m * n0;
    const r = m * m + n0 * n0;
    return mkFusion({
      diff,
      tag: '向量 × 矩阵 × 三角 × 复数',
      question: '向量 (' + a + ', ' + b + ') 绕原点旋转 90°，求旋转后向量的模',
      latex: '@vec{v} = (' + a + ', ' + b + ')，R_{90}@vec{v}@text{ 的模}',
      answer: String(r),
      steps: [
        '旋转矩阵 R = [[cos90°, −sin90°],[sin90°, cos90°]] = [[0,−1],[1,0]]',
        '旋转后为 (−b, a)，模不变',
        '|v| = √(' + a + '² + ' + b + '²) = ' + r,
      ],
    });
  }

  if (kind === 'sinLimit') {
    const k = rndFusion(1, 9);
    return mkFusion({
      diff,
      tag: '极限 × 三角 × 数列',
      question: '求 lim(n→∞) n·sin(' + k + '/n)',
      latex: '@lim_{n @to @infty} n@sin@dfrac{' + k + '}{n}',
      answer: String(k),
    steps: [
        '令 t = ' + k + '/n，则 t → 0，n = ' + k + '/t',
        'n·sin(' + k + '/n) = ' + k + '·sin(t)/t → ' + k,
        '用到重要极限 sin(t)/t → 1',
      ],
    });
  }

  const n = rndFusion(3, 40);
  return mkFusion({
      diff,
    tag: '数论 × 数列',
    question: '数列 aₙ = n² + n，求 a_' + n + ' 除以 2 的余数',
    latex: 'a_n = n^{2} + n，求 a_{' + n + '} @bmod 2',
    answer: '0',
    steps: [
      'aₙ = n(n+1)，是两个连续整数之积',
      '连续整数必有一个偶数，所以积一定是偶数',
      '对任意 n 都余 0（这里 n = ' + n + '）',
    ],
  });
}

function rndFusion(a: number, b: number) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pickOneFusion<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

