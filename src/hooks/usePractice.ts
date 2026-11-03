import { useState, useCallback } from 'react';

export interface PracticeQuestion {
  /** 题目（作为输入表达式） */
  question: string;
  /** 标准答案（用于对比） */
  answer: string;
  /** 题目描述 */
  description: string;
  /** 题目类型 */
  type: string;
}

interface UsePracticeOptions {
  /** 模块名，如 'calculus' */
  module: string;
}

// 随机整数 [min, max]
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 从数组里随机选一个
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 生成微积分题目
function generateCalculusQuestion(): PracticeQuestion {
  const types = ['derivative', 'integral', 'limit'];
  const type = pick(types);

  if (type === 'derivative') {
    // 随机生成多项式求导题
    const a = randInt(1, 5);
    const n = randInt(2, 5);
    const b = randInt(1, 4);
    const m = randInt(1, 3);
    const question = `diff(${a}x^${n} + ${b}x^${m}, x)`;
    const aStr = a * n;
    const nStr = n - 1;
    const bStr = b * m;
    const mStr = m - 1;
    let answer = '';
    if (nStr > 1 && mStr > 1) {
      answer = `${aStr}*x^${nStr} + ${bStr}*x^${mStr}`;
    } else if (nStr > 1 && mStr === 1) {
      answer = `${aStr}*x^${nStr} + ${bStr}`;
    } else if (nStr === 1 && mStr > 1) {
      answer = `${aStr}*x + ${bStr}*x^${mStr}`;
    } else {
      answer = `${aStr} + ${bStr}`;
    }
    return {
      question,
      answer,
      description: `求函数 f(x) = ${a}x^${n} + ${b}x^${m} 对 x 的导数`,
      type: '求导',
    };
  }

  if (type === 'integral') {
    // 简单幂函数积分
    const n = randInt(2, 4);
    const a = randInt(2, 6);
    const question = `int(${a}x^${n}, x)`;
    const denom = n + 1;
    const answer = `${a / denom}x^${n + 1} + C`;
    return {
      question,
      answer,
      description: `求不定积分 ∫${a}x^${n} dx`,
      type: '积分',
    };
  }

  // limit
  const a = randInt(2, 5);
  const question = `limit(${a}x^2 + x, x, 0)`;
  const answer = '0';
  return {
    question,
    answer,
    description: `求极限 lim(x→0) ${a}x² + x`,
    type: '极限',
  };
}

// 生成线性代数题目
function generateLinearAlgebraQuestion(): PracticeQuestion {
  const types = ['det2', 'det3', 'matmul'];
  const type = pick(types);

  if (type === 'det2') {
    const a = randInt(1, 9);
    const b = randInt(1, 9);
    const c = randInt(1, 9);
    const d = randInt(1, 9);
    const question = `det([[${a},${b}],[${c},${d}]])`;
    const answer = String(a * d - b * c);
    return {
      question,
      answer,
      description: `求 2×2 矩阵 [[${a},${b}],[${c},${d}]] 的行列式`,
      type: '2阶行列式',
    };
  }

  if (type === 'det3') {
    // 简单的三角矩阵，行列式是对角线乘积
    const a = randInt(1, 5);
    const b = randInt(1, 5);
    const c = randInt(1, 5);
    const question = `det([[${a},0,0],[0,${b},0],[0,0,${c}]])`;
    const answer = String(a * b * c);
    return {
      question,
      answer,
      description: `求对角矩阵的行列式`,
      type: '3阶行列式',
    };
  }

  // matmul 2x2
  const a1 = randInt(1, 4);
  const a2 = randInt(1, 4);
  const b1 = randInt(1, 4);
  const b2 = randInt(1, 4);
  const question = `[[${a1},${a2}],[${b1},${b2}]] * [[1,0],[0,1]]`;
  const answer = `[[${a1}, ${a2}], [${b1}, ${b2}]]`;
  return {
    question,
    answer,
    description: '矩阵乘以单位矩阵',
    type: '矩阵乘法',
  };
}

// 生成概率统计题目
function generateProbabilityQuestion(): PracticeQuestion {
  const types = ['mean', 'variance', 'binom'];
  const type = pick(types);

  if (type === 'mean') {
    const nums = Array.from({ length: 5 }, () => randInt(1, 20));
    const question = `mean([${nums.join(',')}])`;
    const answer = String(nums.reduce((s, n) => s + n, 0) / nums.length);
    return {
      question,
      answer,
      description: `求数据集 [${nums.join(', ')}] 的均值`,
      type: '期望/均值',
    };
  }

  if (type === 'variance') {
    const nums = [1, 2, 3, 4, 5];
    const question = `var([${nums.join(',')}])`;
    const mean = 3;
    const variance = nums.reduce((s, n) => s + (n - mean) ** 2, 0) / nums.length;
    const answer = String(variance);
    return {
      question,
      answer,
      description: '求数据集 [1,2,3,4,5] 的总体方差',
      type: '方差',
    };
  }

  // binomial - 用公式但简化
  const n = 3;
  const p = 0.5;
  const k = randInt(1, 2);
  // 二项分布 P(X=k) = C(n,k) * p^k * (1-p)^(n-k)
  function comb(nn: number, kk: number) {
    let res = 1;
    for (let i = 1; i <= kk; i++) {
      res *= (nn - kk + i) / i;
    }
    return res;
  }
  const prob = comb(n, k) * p ** k * (1 - p) ** (n - k);
  const question = `C(${n},${k}) * ${p}^${k} * ${1-p}^${n - k}`;
  const answer = String(prob);
  return {
    question,
    answer,
    description: `二项分布：抛 ${n} 次硬币恰好 ${k} 次正面的概率`,
    type: '二项分布',
  };
}

// 生成数论题目
function generateNumberTheoryQuestion(): PracticeQuestion {
  const types = ['gcd', 'lcm', 'prime', 'ncr'];
  const type = pick(types);

  if (type === 'gcd') {
    const a = randInt(10, 100);
    const b = randInt(10, 100);
    const question = `gcd(${a}, ${b})`;
    function gcd(x: number, y: number): number {
      return y === 0 ? x : gcd(y, x % y);
    }
    const answer = String(gcd(a, b));
    return {
      question,
      answer,
      description: `求 ${a} 和 ${b} 的最大公约数`,
      type: 'GCD',
    };
  }

  if (type === 'lcm') {
    const a = randInt(4, 20);
    const b = randInt(4, 20);
    const question = `lcm(${a}, ${b})`;
    function gcd(x: number, y: number): number {
      return y === 0 ? x : gcd(y, x % y);
    }
    const answer = String((a * b) / gcd(a, b));
    return {
      question,
      answer,
      description: `求 ${a} 和 ${b} 的最小公倍数`,
      type: 'LCM',
    };
  }

  if (type === 'prime') {
    const primeList = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    const nonPrimeList = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30];
    const isPrime = Math.random() > 0.5;
    const num = isPrime ? pick(primeList) : pick(nonPrimeList);
    const question = `isPrime(${num})`;
    const answer = isPrime ? 'true' : 'false';
    return {
      question,
      answer,
      description: `${num} 是素数吗？`,
      type: '素数判定',
    };
  }

  // nCr
  const n = randInt(3, 7);
  const k = randInt(1, n);
  const question = `nCr(${n}, ${k})`;
  function comb(nn: number, kk: number) {
    let res = 1;
    for (let i = 1; i <= kk; i++) {
      res *= (nn - kk + i) / i;
    }
    return Math.round(res);
  }
  const answer = String(comb(n, k));
  return {
    question,
    answer,
    description: `组合数 C(${n}, ${k})`,
    type: '组合数',
  };
}

const generators: Record<string, () => PracticeQuestion> = {
  calculus: generateCalculusQuestion,
  'linear-algebra': generateLinearAlgebraQuestion,
  probability: generateProbabilityQuestion,
  'number-theory': generateNumberTheoryQuestion,
};

export function usePractice({ module }: UsePracticeOptions) {
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const generateQuestion = useCallback(() => {
    const gen = generators[module];
    if (gen) {
      const q = gen();
      setCurrentQuestion(q);
      setUserAnswer('');
      setIsCorrect(null);
      setShowAnswer(false);
    }
  }, [module]);

  const checkAnswer = useCallback(
    (userResult: string) => {
      if (!currentQuestion) return null;
      setUserAnswer(userResult);
      // 比较：去除空格后数值/字符串比较
      const normalize = (s: string) =>
        s.replace(/\s+/g, '').replace(/\*+/g, '*').replace(/\+-/g, '-').toLowerCase();
      const correct =
        normalize(userResult) === normalize(currentQuestion.answer) ||
        // 数值近似比较
        !isNaN(Number(userResult)) &&
          !isNaN(Number(currentQuestion.answer)) &&
          Math.abs(Number(userResult) - Number(currentQuestion.answer)) < 0.001;
      setIsCorrect(correct);
      return correct;
    },
    [currentQuestion],
  );

  const revealAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  return {
    currentQuestion,
    isCorrect,
    showAnswer,
    userAnswer,
    generateQuestion,
    checkAnswer,
    revealAnswer,
    hasGenerator: !!generators[module],
  };
}
