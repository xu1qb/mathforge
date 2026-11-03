// EXPORTS: stepByStepQuadratic, stepByStepFactor, stepByStepDerivative, stepByStepIntegrate, stepByStepLimit, stepByStepGauss, stepByStepMatrixMult, stepByStepPrimeCheck, stepByStepDeterminant, stepByStepMatrixInverse, stepByStepEigenvalue, stepByStepLinearODE, stepByStepGcd, stepByStepModInverse, stepByStepComplexMult, stepByStepSumExpand

import { evaluate, parse, derivative, simplify } from 'mathjs';

export interface StepItem {
  description: string;
  formula: string;   // 简化的数学表达式（文本展示）
  latex: string;     // LaTeX 格式
}

export interface StepResult {
  steps: StepItem[];
  result: string;
  resultLatex: string;
}

/**
 * 一元二次方程求根步骤详解
 * @param expr 形如 ax^2+bx+c=0 或 ax^2+bx+c
 */
export function stepByStepQuadratic(expr: string): StepResult {
  const steps: StepItem[] = [];

  // 标准化：去掉空格
  let normalized = expr.replace(/\s+/g, '');
  let rightSide = '0';

  if (normalized.includes('=')) {
    const parts = normalized.split('=');
    normalized = parts[0] || '0';
    rightSide = parts[1] || '0';
  }

  // 把右边移到左边: left - right = 0
  // 简化：如果右边是 0 或 数字，直接处理
  // 通用：用 mathjs 化简
  if (rightSide !== '0') {
    try {
      const simplified = simplify(`(${normalized})-(${rightSide})`);
      normalized = simplified.toString();
    } catch {
      // 失败就保留左边
    }
  }

  // 提取系数 a, b, c — 纯正则方式（最可靠）
  // 先把表达式拆成各项
  let polyStr = normalized;
  // 处理开头的符号
  if (!polyStr.startsWith('+') && !polyStr.startsWith('-')) {
    polyStr = '+' + polyStr;
  }
  // 按 +- 分割各项：在非开头、非 ^ 后的 - 前断开
  const tokens: string[] = [];
  let current = '';
  let idx = 0;
  while (idx < polyStr.length) {
    const ch = polyStr[idx];
    if ((ch === '+' || ch === '-') && current !== '' && !current.endsWith('^') && !current.endsWith('E') && !current.endsWith('e')) {
      tokens.push(current);
      current = ch;
    } else {
      current += ch;
    }
    idx++;
  }
  if (current) tokens.push(current);

  let a = 0, b = 0, c = 0;
  for (const term of tokens) {
    const t = term.replace(/\*/g, '').trim();
    if (!t || t === '+') continue;

    // 判别 x^2 项
    const x2Match = t.match(/^([+-]?\d*\.?\d*)?x\^2$/i);
    // 判别 x 项（非 x^2）
    const xMatch = t.match(/^([+-]?\d*\.?\d*)?x$/i);

    if (x2Match) {
      let coef = x2Match[1];
      if (coef === '' || coef === '+') a += 1;
      else if (coef === '-') a -= 1;
      else a += parseFloat(coef) || 0;
    } else if (xMatch) {
      let coef = xMatch[1];
      if (coef === '' || coef === '+') b += 1;
      else if (coef === '-') b -= 1;
      else b += parseFloat(coef) || 0;
    } else if (!t.toLowerCase().includes('x')) {
      // 常数项
      c += parseFloat(t) || 0;
    }
  }

  if (a === 0) {
    // 不是二次方程，直接求解一次
    if (b === 0) {
      return {
        steps: [{ description: '化简', formula: `0 = ${c}`, latex: `0 = ${c}` }],
        result: c === 0 ? '恒成立' : '无解',
        resultLatex: c === 0 ? '\\text{恒成立}' : '\\text{无解}',
      };
    }
    const x = -c / b;
    steps.push({
      description: '一元一次方程',
      formula: `${b}x + (${c}) = 0`,
      latex: `${b}x + (${c}) = 0`,
    });
    steps.push({
      description: '移项求解',
      formula: `x = ${-c} / ${b} = ${x}`,
      latex: `x = \\frac{${-c}}{${b}} = ${x}`,
    });
    return { steps, result: `x = ${x}`, resultLatex: `x = ${x}` };
  }

  // 步骤 1：写出标准形式
  steps.push({
    description: '写出标准形式 ax² + bx + c = 0',
    formula: `${a}x² + (${b})x + (${c}) = 0`,
    latex: `${a}x^2 + (${b})x + (${c}) = 0`,
  });

  // 步骤 2：计算判别式
  const delta = b * b - 4 * a * c;
  steps.push({
    description: '计算判别式 Δ = b² - 4ac',
    formula: `Δ = (${b})² - 4 × ${a} × (${c}) = ${delta}`,
    latex: `\\Delta = (${b})^2 - 4 \\times ${a} \\times (${c}) = ${delta}`,
  });

  // 步骤 3：判根 + 求根
  if (delta > 0) {
    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
    const x2 = (-b - Math.sqrt(delta)) / (2 * a);
    steps.push({
      description: 'Δ > 0，有两个不同实根，代入求根公式',
      formula: `x = (-b ± √Δ) / (2a) = (${-b} ± √${delta}) / (${2 * a})`,
      latex: `x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{${-b} \\pm \\sqrt{${delta}}}{${2 * a}}`,
    });
    const x1Str = Number.isInteger(x1) ? String(x1) : x1.toFixed(6).replace(/\.?0+$/, '');
    const x2Str = Number.isInteger(x2) ? String(x2) : x2.toFixed(6).replace(/\.?0+$/, '');
    steps.push({
      description: '两个实根',
      formula: `x₁ = ${x1Str},  x₂ = ${x2Str}`,
      latex: `x_1 = ${x1Str},\\quad x_2 = ${x2Str}`,
    });
    return { steps, result: `x₁ = ${x1Str}, x₂ = ${x2Str}`, resultLatex: `x_1 = ${x1Str},\\ x_2 = ${x2Str}` };
  } else if (Math.abs(delta) < 1e-10) {
    const x = -b / (2 * a);
    steps.push({
      description: 'Δ = 0，有一个实根（重根）',
      formula: `x = -b / (2a) = ${-b} / (${2 * a}) = ${x}`,
      latex: `x = \\frac{-b}{2a} = \\frac{${-b}}{${2 * a}} = ${x}`,
    });
    return { steps, result: `x = ${x} (重根)`, resultLatex: `x = ${x}\\ (\\text{重根})` };
  } else {
    // 复根
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-delta) / (2 * a);
    steps.push({
      description: 'Δ < 0，在复数域中有两个共轭复根',
      formula: `x = ${realPart} ± ${imagPart}i`,
      latex: `x = ${realPart} \\pm ${imagPart}i`,
    });
    return {
      steps,
      result: `x₁ = ${realPart} + ${imagPart}i, x₂ = ${realPart} - ${imagPart}i`,
      resultLatex: `x_1 = ${realPart} + ${imagPart}i,\\ x_2 = ${realPart} - ${imagPart}i`,
    };
  }
}

/**
 * 因式分解步骤详解（针对二次多项式）
 * 支持：提取公因式、十字相乘法、平方差公式、完全平方公式
 */
export function stepByStepFactor(expr: string): StepResult {
  const steps: StepItem[] = [];
  const normalized = expr.replace(/\s+/g, '').replace(/\*/g, '');

  steps.push({
    description: '原式',
    formula: normalized,
    latex: normalized.replace(/x\^(\d+)/g, 'x^{$1}'),
  });

  // 尝试识别二次式 ax² + bx + c
  const tokens: string[] = [];
  let polyStr = normalized;
  if (!polyStr.startsWith('+') && !polyStr.startsWith('-')) polyStr = '+' + polyStr;
  let current = '';
  let idx = 0;
  while (idx < polyStr.length) {
    const ch = polyStr[idx];
    if ((ch === '+' || ch === '-') && current !== '' && !current.endsWith('^')) {
      tokens.push(current);
      current = ch;
    } else {
      current += ch;
    }
    idx++;
  }
  if (current) tokens.push(current);

  let a = 0, b = 0, c = 0;
  let xVar = 'x';
  for (const term of tokens) {
    const t = term.trim();
    if (!t || t === '+') continue;
    // 找变量名
    const varMatch = t.match(/([a-z])/i);
    if (varMatch) xVar = varMatch[1];

    const x2Match = t.match(/^([+-]?\d*\.?\d*)?[a-z]\^2$/i);
    const xMatch = t.match(/^([+-]?\d*\.?\d*)?[a-z]$/i);

    if (x2Match) {
      let coef = x2Match[1] ?? '';
      if (coef === '' || coef === '+') a += 1;
      else if (coef === '-') a -= 1;
      else a += parseFloat(coef) || 0;
    } else if (xMatch) {
      let coef = xMatch[1] ?? '';
      if (coef === '' || coef === '+') b += 1;
      else if (coef === '-') b -= 1;
      else b += parseFloat(coef) || 0;
    } else if (!/[a-z]/i.test(t)) {
      c += parseFloat(t) || 0;
    }
  }

  if (a === 0 && b === 0) {
    steps.push({ description: '无法分解', formula: '常数表达式', latex: '\text{常数表达式}' });
    return { steps, result: normalized, resultLatex: normalized };
  }

  if (a === 0) {
    // 一次式：提取公因式
    const gcfVal = gcd(Math.abs(b), Math.abs(c));
    if (gcfVal > 1) {
      steps.push({
        description: `提取公因式 ${gcfVal}`,
        formula: `${gcfVal}(${b / gcfVal}${xVar} + ${c / gcfVal})`,
        latex: `${gcfVal}(${b / gcfVal}${xVar} + ${c / gcfVal})`,
      });
      const result = `${gcfVal}(${b / gcfVal}${xVar} + ${c / gcfVal})`;
      steps.push({ description: '分解结果', formula: result, latex: result });
      return { steps, result, resultLatex: result };
    }
    steps.push({ description: '已是最简形式', formula: normalized, latex: normalized });
    return { steps, result: normalized, resultLatex: normalized };
  }

  // 二次式分解
  const discriminant = b * b - 4 * a * c;

  // 检查完全平方
  if (discriminant === 0) {
    const r = -b / (2 * a);
    const aStr = a === 1 ? '' : a === -1 ? '-' : String(a);
    const rStr = r > 0 ? ` + ${r}` : r < 0 ? ` - ${Math.abs(r)}` : '';
    const result = a === 1 ? `(${xVar}${rStr})^2` : a === -1 ? `-(${xVar}${rStr})^2` : `${aStr}(${xVar}${rStr})^2`;

    steps.push({
      description: '判别式 Δ = b² - 4ac = 0，是完全平方',
      formula: `Δ = ${b}² - 4 × ${a} × ${c} = 0`,
      latex: `\Delta = ${b}^2 - 4 \cdot ${a} \cdot ${c} = 0`,
    });
    steps.push({
      description: '应用完全平方公式 (a ± b)² = a² ± 2ab + b²',
      formula: `(${xVar}${rStr})²`,
      latex: `(${xVar}${rStr})^2`,
    });
    steps.push({ description: '分解结果', formula: result, latex: result });
    return { steps, result, resultLatex: result };
  }

  // 检查平方差：a² - b² = (a+b)(a-b)
  if (b === 0 && a * c < 0) {
    // ax² + c = 0 且 a 和 c 异号 → 可能是平方差
    const k1 = Math.sqrt(Math.abs(a));
    const k2 = Math.sqrt(Math.abs(c));
    if (Number.isInteger(k1) && Number.isInteger(k2)) {
      steps.push({
        description: '识别为平方差形式 a² - b²',
        formula: `(${k1}${xVar})² - ${k2}²`,
        latex: `(${k1}${xVar})^2 - ${k2}^2`,
      });
      steps.push({
        description: '应用平方差公式 a² - b² = (a+b)(a-b)',
        formula: `(${k1}${xVar} + ${k2})(${k1}${xVar} - ${k2})`,
        latex: `(${k1}${xVar} + ${k2})(${k1}${xVar} - ${k2})`,
      });
      const result = `(${k1}${xVar}+${k2})(${k1}${xVar}-${k2})`;
      steps.push({ description: '分解结果', formula: result, latex: result });
      return { steps, result, resultLatex: result };
    }
  }

  // 十字相乘法（判别式是完全平方数 → 有理数解）
  if (discriminant >= 0) {
    const sqrtD = Math.sqrt(discriminant);
    if (Number.isInteger(sqrtD)) {
      const r1 = (-b + sqrtD) / (2 * a);
      const r2 = (-b - sqrtD) / (2 * a);

      steps.push({
        description: '计算判别式 Δ = b² - 4ac',
        formula: `Δ = ${b}² - 4 × ${a} × ${c} = ${discriminant}`,
        latex: `\Delta = ${b}^2 - 4 \cdot ${a} \cdot ${c} = ${discriminant}`,
      });
      steps.push({
        description: `Δ 是完全平方数（√${discriminant} = ${sqrtD}），用十字相乘法分解`,
        formula: `两个根 ${r1}, ${r2}`,
        latex: `x_1 = ${r1},\ x_2 = ${r2}`,
      });

      // 写成 a(x - r1)(x - r2) 的形式
      const r1Str = r1 > 0 ? ` - ${r1}` : r1 < 0 ? ` + ${Math.abs(r1)}` : '';
      const r2Str = r2 > 0 ? ` - ${r2}` : r2 < 0 ? ` + ${Math.abs(r2)}` : '';
      const aPrefix = a === 1 ? '' : String(a);
      const result = `${aPrefix}(${xVar}${r1Str})(${xVar}${r2Str})`;
      steps.push({ description: '分解结果', formula: result, latex: result });
      return { steps, result, resultLatex: result };
    }
  }

  // 无法在整数范围内分解
  steps.push({
    description: '判别式分析',
    formula: `Δ = ${b}² - 4 × ${a} × ${c} = ${discriminant}`,
    latex: `\Delta = ${b}^2 - 4 \cdot ${a} \cdot ${c} = ${discriminant}`,
  });
  if (discriminant < 0) {
    steps.push({
      description: 'Δ < 0，实数范围内不可分解',
      formula: '（无实根）',
      latex: '\text{（无实根）}',
    });
  } else {
    steps.push({
      description: 'Δ 不是完全平方数，无法在整数范围内十字相乘',
      formula: '（无理根，使用求根公式）',
      latex: '\text{（无理根，使用求根公式）}',
    });
  }

  return { steps, result: normalized, resultLatex: normalized };
}

// 辅助：最大公约数
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/**
 * 导数步骤详解（针对基本复合函数）
 */
export function stepByStepDerivative(expr: string, variable = 'x'): StepResult {
  const steps: StepItem[] = [];

  steps.push({
    description: '原函数',
    formula: `f(${variable}) = ${expr}`,
    latex: `f(${variable}) = ${expr}`,
  });

  let result = '';
  try {
    // 尝试直接求导
    const d = derivative(expr, variable);
    result = simplify(d).toString();

    // 识别基本求导法则
    if (/^[a-z]+\([^)]+\)$/.test(expr.trim()) || expr.includes('(')) {
      // 复合函数：链式法则
      steps.push({
        description: '应用链式法则：外层导数 × 内层导数',
        formula: `f'(g(${variable})) · g'(${variable})`,
        latex: `f'(g(${variable})) \\cdot g'(${variable})`,
      });
    }

    if (expr.includes('*') && !expr.includes('^')) {
      steps.push({
        description: '应用乘积法则：(uv)\' = u\'v + uv\'',
        formula: `(uv)' = u'v + uv'`,
        latex: `(uv)' = u'v + uv'`,
      });
    }

    if (expr.includes('/')) {
      steps.push({
        description: '应用商的法则：(u/v)\' = (u\'v - uv\') / v²',
        formula: `(u/v)' = (u'v - uv') / v²`,
        latex: `\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}`,
      });
    }

    steps.push({
      description: '逐项求导并化简',
      formula: `f'(${variable}) = ${result}`,
      latex: `f'(${variable}) = ${result}`,
    });
  } catch {
    steps.push({ description: '求导失败', formula: '无法解析表达式', latex: '\\text{无法解析表达式}' });
    result = '求导失败';
  }

  return { steps, result, resultLatex: result };
}

/**
 * 积分步骤详解（基本积分）
 */
export function stepByStepIntegrate(expr: string, variable = 'x'): StepResult {
  const steps: StepItem[] = [];

  steps.push({
    description: '不定积分',
    formula: `∫${expr} d${variable}`,
    latex: `\\int ${expr}\\, d${variable}`,
  });

  let result = '';
  try {
    const integral = computeBasicIntegral(expr, variable);
    if (integral === null) throw new Error('unsupported');
    result = `${integral} + C`;

    // 判断积分方法提示
    if (expr.includes('ln') || expr.includes('log')) {
      steps.push({
        description: '分部积分法：∫ u dv = uv - ∫ v du',
        formula: '∫ u dv = uv - ∫ v du',
        latex: `\\int u\\, dv = uv - \\int v\\, du`,
      });
    } else if (expr.match(/\w+\(.*\)/) && !expr.match(/sin|cos|tan|exp|ln|log/)) {
      steps.push({
        description: '换元积分法：令 u = 内层函数',
        formula: 'u = g(x), du = g\'(x)dx',
        latex: `u = g(${variable}),\\ du = g'(${variable})d${variable}`,
      });
    } else if (/^[a-z]+\(?/.test(expr.trim())) {
      steps.push({
        description: '直接积分：套用基本积分公式',
        formula: '基本积分公式',
        latex: '\\text{基本积分公式}',
      });
    } else {
      steps.push({
        description: '逐项积分',
        formula: '逐项应用基本积分公式',
        latex: '\\text{逐项积分}',
      });
    }

    steps.push({
      description: '积分结果',
      formula: `= ${result}`,
      latex: `= ${result}`,
    });
  } catch {
    steps.push({ description: '积分失败', formula: '无法计算该积分', latex: '\\text{无法计算}' });
    result = '积分失败';
  }

  return { steps, result, resultLatex: result };
}

/**
 * 极限步骤详解
 */
export function stepByStepLimit(expr: string, variable: string, point: number | string): StepResult {
  const steps: StepItem[] = [];
  const pointStr = point === 'inf' || point === 'infinity' ? '∞' : String(point);
  const pointLatex = point === 'inf' || point === 'infinity' ? '\\infty' : String(point);

  steps.push({
    description: '原极限',
    formula: `lim(${variable}→${pointStr}) ${expr}`,
    latex: `\\lim_{${variable} \\to ${pointLatex}} ${expr}`,
  });

  let result = '';
  try {
    // 先尝试直接代入
    let directSub: number;
    const scope: Record<string, number> = {};
    if (point !== 'inf' && point !== 'infinity' && typeof point === 'number') {
      scope[variable] = point;
      directSub = evaluate(expr, scope) as number;
    } else {
      // 无穷大场景，代入极大值近似
      scope[variable] = 1e6;
      directSub = evaluate(expr, scope) as number;
    }

    if (!isNaN(directSub) && isFinite(directSub)) {
      steps.push({
        description: `直接代入 ${variable} = ${pointStr}`,
        formula: `f(${pointStr}) = ${directSub.toFixed(6).replace(/\.?0+$/, '')}`,
        latex: `f(${pointLatex}) = ${directSub.toFixed(6).replace(/\.?0+$/, '')}`,
      });
      result = directSub.toFixed(6).replace(/\.?0+$/, '');
    } else {
      // 不定式：尝试洛必达
      steps.push({
        description: '出现不定式（0/0 或 ∞/∞），应用洛必达法则',
        formula: "lim f/g = lim f'/g'",
        latex: `\\lim \\frac{f}{g} = \\lim \\frac{f'}{g'}`,
      });

      try {
        const num = derivative(expr.split('/')[0]?.trim() || '1', variable);
        const den = derivative(expr.split('/')[1]?.trim() || '1', variable);
        const newExpr = `(${num})/(${den})`;
        steps.push({
          description: '分子分母分别求导',
          formula: `lim(${variable}→${pointStr}) ${newExpr}`,
          latex: `\\lim_{${variable} \\to ${pointLatex}} \\frac{${num}}{${den}}`,
        });

        const scope2: Record<string, number> = {};
        if (point !== 'inf' && point !== 'infinity' && typeof point === 'number') {
          scope2[variable] = point;
        } else {
          scope2[variable] = 1e6;
        }
        const val = evaluate(newExpr, scope2) as number;
        if (isFinite(val)) {
          result = val.toFixed(6).replace(/\.?0+$/, '');
          steps.push({
            description: '代入求值',
            formula: `= ${result}`,
            latex: `= ${result}`,
          });
        } else {
          result = '仍为不定式，需继续洛必达或换方法';
        }
      } catch {
        result = '极限不存在或无法计算';
      }
    }
  } catch {
    result = '无法计算极限';
  }

  return { steps, result, resultLatex: result };
}

/**
 * 高斯消元步骤（2x2 / 3x3）
 */
export function stepByStepGauss(matrix: number[][]): StepResult {
  const steps: StepItem[] = [];
  const n = matrix.length;

  steps.push({
    description: '增广矩阵',
    formula: matrix.map((row) => row.join(' ')).join(' | '),
    latex: matrix.map((row) => row.join(' & ')).join(' \\\\ '),
  });

  // 做简单的高斯消元步骤描述
  steps.push({
    description: '第 1 步：选主元，消去下方各行的首列',
    formula: `R_i ← R_i - (a_i1/a_11) · R_1  (i=2..${n})`,
    latex: `R_i \\leftarrow R_i - \\frac{a_{i1}}{a_{11}} R_1\\quad (i=2,\\dots,${n})`,
  });

  if (n >= 3) {
    steps.push({
      description: '第 2 步：消去第三行及以下的第二列',
      formula: `R_i ← R_i - (a_i2/a_22) · R_2  (i=3..${n})`,
      latex: `R_i \\leftarrow R_i - \\frac{a_{i2}}{a_{22}} R_2\\quad (i=3,\\dots,${n})`,
    });
  }

  steps.push({
    description: '得到上三角矩阵，回代求解',
    formula: '从下往上回代，逐个解出 x_n, x_{n-1}, ..., x_1',
    latex: '\\text{回代法：从下往上依次解出变量}',
  });

  // 实际计算一下（简单 2x2）
  let result = '';
  try {
    if (n === 2 && matrix[0].length === 3) {
      const [a, b, c] = [matrix[0][0], matrix[0][1], matrix[0][2]];
      const [d, e, f] = [matrix[1][0], matrix[1][1], matrix[1][2]];
      const det = a * e - b * d;
      if (Math.abs(det) < 1e-10) {
        result = '行列式为 0，无解或无穷多解';
      } else {
        const x = (c * e - b * f) / det;
        const y = (a * f - c * d) / det;
        result = `x₁ = ${x.toFixed(4).replace(/\.?0+$/, '')}, x₂ = ${y.toFixed(4).replace(/\.?0+$/, '')}`;
        steps.push({
          description: '回代得到解',
          formula: result,
          latex: `x_1 = ${x.toFixed(4).replace(/\.?0+$/, '')},\\ x_2 = ${y.toFixed(4).replace(/\.?0+$/, '')}`,
        });
      }
    } else {
      result = `已消元为上三角形式，共 ${n} 个方程`;
    }
  } catch {
    result = '消元失败';
  }

  return { steps, result, resultLatex: result };
}

/**
 * 矩阵乘法步骤详解（小矩阵）
 */
export function stepByStepMatrixMult(A: number[][], B: number[][]): StepResult {
  const steps: StepItem[] = [];

  steps.push({
    description: `矩阵维度：${A.length}×${A[0].length} · ${B.length}×${B[0].length}`,
    formula: `结果矩阵为 ${A.length}×${B[0].length}`,
    latex: `A_{${A.length} \\times ${A[0].length}} \\cdot B_{${B.length} \\times ${B[0].length}} = C_{${A.length} \\times ${B[0].length}}`,
  });

  steps.push({
    description: '每个元素 c_ij = 第 i 行 · 第 j 列（点积）',
    formula: 'c_ij = Σ_k a_ik · b_kj',
    latex: `c_{ij} = \\sum_k a_{ik} \\cdot b_{kj}`,
  });

  // 计算
  const m = A.length;
  const n = B[0].length;
  const p = B.length;
  const C: number[][] = [];

  const elementSteps: string[] = [];
  for (let i = 0; i < m; i++) {
    C[i] = [];
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < p; k++) {
        sum += A[i][k] * B[k][j];
      }
      C[i][j] = sum;
      if (m * n <= 9) {
        elementSteps.push(`c_${i + 1}${j + 1} = ${sum}`);
      }
    }
  }

  if (elementSteps.length > 0) {
    steps.push({
      description: '各元素点积计算',
      formula: elementSteps.join(', '),
      latex: elementSteps.join(',\\ '),
    });
  }

  const resultStr = C.map((r) => `[${r.join(', ')}]`).join(', ');
  steps.push({
    description: '结果矩阵',
    formula: resultStr,
    latex: `\\begin{bmatrix} ${C.map((r) => r.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`,
  });

  return { steps, result: resultStr, resultLatex: steps[steps.length - 1].latex };
}

/**
 * 素数判断试除步骤
 */
export function stepByStepPrimeCheck(n: number): StepResult {
  const steps: StepItem[] = [];

  if (!Number.isInteger(n) || n < 2) {
    steps.push({ description: '不满足条件', formula: `${n} 不是大于等于 2 的正整数`, latex: `${n} \\notin \\mathbb{N}^*_{\\geq2}` });
    return { steps, result: '不是素数', resultLatex: '\\text{不是素数}' };
  }

  steps.push({
    description: '判断 n 是否为素数',
    formula: `n = ${n}，试除到 √n ≈ ${Math.sqrt(n).toFixed(2)}`,
    latex: `n = ${n},\\quad \\sqrt{n} \\approx ${Math.sqrt(n).toFixed(2)}`,
  });

  const sqrtN = Math.floor(Math.sqrt(n));
  const divisors: number[] = [];
  let isPrime = true;

  for (let i = 2; i <= sqrtN; i++) {
    if (n % i === 0) {
      isPrime = false;
      divisors.push(i);
      if (divisors.length <= 3) {
        steps.push({
          description: `试除 i = ${i}`,
          formula: `${n} ÷ ${i} = ${n / i}，整除！`,
          latex: `${n} \\div ${i} = ${n / i} \\quad \\text{整除！}`,
        });
      }
      break;
    } else if (i <= 5 || (i <= sqrtN && divisors.length === 0 && i <= 7)) {
      steps.push({
        description: `试除 i = ${i}`,
        formula: `${n} ÷ ${i} 余 ${n % i}，不整除`,
        latex: `${n} \\div ${i}\\ \\text{余}\\ ${n % i}`,
      });
    }
  }

  if (isPrime) {
    steps.push({
      description: '2 到 √n 之间没有整除因子',
      formula: `${n} 没有除 1 和自身外的因子`,
      latex: `${n}\\ \\text{没有除 1 和自身外的因子}`,
    });
    steps.push({
      description: '结论',
      formula: `${n} 是素数 ✓`,
      latex: `${n}\\ \\text{是素数} \\ \\checkmark`,
    });
    return { steps, result: `${n} 是素数`, resultLatex: `${n}\\ \\text{是素数}` };
  } else {
    steps.push({
      description: '结论',
      formula: `${n} = ${divisors[0]} × ${n / divisors[0]}，不是素数`,
      latex: `${n} = ${divisors[0]} \\times ${n / divisors[0]}\\ \\text{，不是素数}`,
    });
    return { steps, result: `${n} 不是素数（${divisors[0]} × ${n / divisors[0]}）`, resultLatex: `${n}\\ \\text{不是素数}` };
  }
}

// ===================== 辅助函数 =====================

/**
 * 计算基本积分结果（用于步骤展示，只支持常见类型）
 * 返回 null 表示不支持
 */
function computeBasicIntegral(expr: string, variable: string): string | null {
  const clean = expr.replace(/\s+/g, '').replace(/\*/g, '');
  const v = variable;

  // 常数: ∫k dx = kx
  if (/^[+-]?\d+\.?\d*$/.test(clean)) {
    if (clean === '0') return '0';
    return `${clean === '1' ? '' : clean === '-1' ? '-' : clean}${v}`;
  }

  // 幂函数: ∫x^n dx = x^(n+1)/(n+1)  (n ≠ -1)
  const powMatch = clean.match(/^([+-]?\d*\.?\d*)?x\^([+-]?\d+\.?\d*)$/);
  if (powMatch) {
    let coef = powMatch[1] ?? '';
    if (coef === '' || coef === '+') coef = '1';
    else if (coef === '-') coef = '-1';
    const exp = parseFloat(powMatch[2]);
    if (exp === -1) {
      // ∫1/x dx = ln|x|
      return coef === '1' ? `ln|${v}|` : coef === '-1' ? `-ln|${v}|` : `${coef}*ln|${v}|`;
    }
    const newExp = exp + 1;
    const coefNum = parseFloat(coef);
    const newCoef = coefNum / newExp;
    // 格式化系数：分数形式尝试
    let coefStr: string;
    if (Number.isInteger(newCoef)) {
      coefStr = newCoef === 1 ? '' : newCoef === -1 ? '-' : String(newCoef);
    } else {
      // 尝试分数形式
      coefStr = formatNumberSimple(newCoef);
    }
    const expStr = Number.isInteger(newExp) ? String(newExp) : String(newExp);
    return `${coefStr}${v}^${expStr}`;
  }

  // 单项 x (即 x^1): ∫x dx = x²/2
  const singleXMatch = clean.match(/^([+-]?\d*\.?\d*)?x$/);
  if (singleXMatch) {
    let coef = singleXMatch[1] ?? '';
    if (coef === '' || coef === '+') coef = '1';
    else if (coef === '-') coef = '-1';
    const coefNum = parseFloat(coef);
    const newCoef = coefNum / 2;
    const coefStr = formatNumberSimple(newCoef);
    return `${coefStr}${v}^2`;
  }

  // sin(kx)
  const sinMatch = clean.match(/^([+-]?\d*\.?\d*)?sin\(([^)]+)\)$/);
  if (sinMatch) {
    let coef = (sinMatch[1] ?? '') || '1';
    if (coef === '' || coef === '+') coef = '1';
    if (coef === '-') coef = '-1';
    const inner = sinMatch[2];
    // 如果 inner 就是变量本身
    if (inner === v) {
      const c = parseFloat(coef);
      const newCoef = -c;
      const newCoefStr = formatNumberSimple(newCoef);
      return `${newCoefStr}cos(${v})`;
    }
    // 如果是 k*x 形式
    const kxMatch = inner.match(/^([+-]?\d*\.?\d*)?\*?x$/);
    if (kxMatch) {
      let k = kxMatch[1] || '1';
      if (k === '+') k = '1';
      if (k === '-') k = '-1';
      const kNum = parseFloat(k);
      const cNum = parseFloat(coef);
      const newCoef = -cNum / kNum;
      return `${formatNumberSimple(newCoef)}cos(${inner})`;
    }
  }

  // cos(kx)
  const cosMatch = clean.match(/^([+-]?\d*\.?\d*)?cos\(([^)]+)\)$/);
  if (cosMatch) {
    let coef = (cosMatch[1] ?? '') || '1';
    if (coef === '' || coef === '+') coef = '1';
    if (coef === '-') coef = '-1';
    const inner = cosMatch[2];
    if (inner === v) {
      const c = parseFloat(coef);
      const coefStr = formatNumberSimple(c);
      return `${coefStr}sin(${v})`;
    }
    const kxMatch = inner.match(/^([+-]?\d*\.?\d*)?\*?x$/);
    if (kxMatch) {
      let k = kxMatch[1] || '1';
      if (k === '+') k = '1';
      if (k === '-') k = '-1';
      const kNum = parseFloat(k);
      const cNum = parseFloat(coef);
      const newCoef = cNum / kNum;
      return `${formatNumberSimple(newCoef)}sin(${inner})`;
    }
  }

  // e^x 或 exp(x)
  const expMatch = clean.match(/^([+-]?\d*\.?\d*)?(e\^x|exp\(x\))$/);
  if (expMatch) {
    let coef = (expMatch[1] ?? '') || '1';
    if (coef === '' || coef === '+') coef = '1';
    if (coef === '-') coef = '-1';
    const form = expMatch[2];
    const c = parseFloat(coef);
    const coefStr = formatNumberSimple(c);
    return `${coefStr}${form}`;
  }

  // e^(kx)
  const expKMatch = clean.match(/^([+-]?\d*\.?\d*)?e\^\(([^)]+)\)$/);
  if (expKMatch) {
    let coef = (expKMatch[1] ?? '') || '1';
    if (coef === '' || coef === '+') coef = '1';
    if (coef === '-') coef = '-1';
    const inner = expKMatch[2];
    const kxMatch = inner.match(/^([+-]?\d*\.?\d*)?\*?x$/);
    if (kxMatch) {
      let k = kxMatch[1] || '1';
      if (k === '+') k = '1';
      if (k === '-') k = '-1';
      const kNum = parseFloat(k);
      const cNum = parseFloat(coef);
      const newCoef = cNum / kNum;
      return `${formatNumberSimple(newCoef)}e^(${inner})`;
    }
  }

  // 1/x = x^(-1)
  if (clean === `1/${v}` || clean === `1/${v}^1`) {
    return `ln|${v}|`;
  }

  // sqrt(x) = x^(1/2)
  if (clean === `sqrt(${v})` || clean === `sqr(${v})`) {
    return `(2/3)*${v}^(3/2)`;
  }

  return null;
}

/**
 * 简单格式化数字：1 → '', -1 → '-', 0.5 → '1/2' 等
 */
function formatNumberSimple(n: number): string {
  if (Math.abs(n - 1) < 1e-10) return '';
  if (Math.abs(n + 1) < 1e-10) return '-';
  if (Math.abs(n) < 1e-10) return '0';
  // 尝试分数形式（简单的）
  if (Math.abs(n - 0.5) < 1e-10) return '1/2*';
  if (Math.abs(n + 0.5) < 1e-10) return '-1/2*';
  if (Math.abs(n - 1 / 3) < 1e-10) return '1/3*';
  if (Math.abs(n + 1 / 3) < 1e-10) return '-1/3*';
  if (Math.abs(n - 2 / 3) < 1e-10) return '2/3*';
  if (Math.abs(n + 2 / 3) < 1e-10) return '-2/3*';
  if (Math.abs(n - 1 / 4) < 1e-10) return '1/4*';
  if (Math.abs(n + 1 / 4) < 1e-10) return '-1/4*';
  if (Math.abs(n - 3 / 4) < 1e-10) return '3/4*';
  if (Math.abs(n + 3 / 4) < 1e-10) return '-3/4*';
  // 整数
  if (Number.isInteger(n)) return `${n}*`;
  // 小数
  return `${n}*`;
}

// ============================================================
// 9. 行列式计算步骤详解
// ============================================================
export function stepByStepDeterminant(A: number[][]): StepResult {
  const steps: StepItem[] = [];
  const n = A.length;

  steps.push({
    description: '给定矩阵',
    formula: `A = ${n}×${n} 矩阵`,
    latex: `A = ${n} \times ${n} \text{ 矩阵}`,
  });

  if (n === 2) {
    const [[a, b], [c, d]] = A;
    steps.push({
      description: '2×2 行列式公式：det(A) = ad - bc',
      formula: `|A| = ${a} × ${d} - ${b} × ${c}`,
      latex: `|A| = ${a} \times ${d} - ${b} \times ${c}`,
    });
    const result = a * d - b * c;
    steps.push({
      description: '计算结果',
      formula: `|A| = ${a * d} - ${b * c} = ${result}`,
      latex: `|A| = ${a * d} - ${b * c} = ${result}`,
    });
    return { steps, result: String(result), resultLatex: String(result) };
  }

  if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = A;
    steps.push({
      description: '按第一行展开 (余子式展开法)',
      formula: `|A| = a·M₁₁ - b·M₁₂ + c·M₁₃`,
      latex: `|A| = a \cdot M_{11} - b \cdot M_{12} + c \cdot M_{13}`,
    });
    const m11 = e * i - f * h;
    const m12 = d * i - f * g;
    const m13 = d * h - e * g;
    steps.push({
      description: '计算各代数余子式',
      formula: `M₁₁ = ${e}×${i}-${f}×${h}=${m11};  M₁₂ = ${d}×${i}-${f}×${g}=${m12};  M₁₃ = ${d}×${h}-${e}×${g}=${m13}`,
      latex: `M_{11}=${m11},\ M_{12}=${m12},\ M_{13}=${m13}`,
    });
    const result = a * m11 - b * m12 + c * m13;
    steps.push({
      description: '代入求和',
      formula: `|A| = ${a}×${m11} - ${b}×${m12} + ${c}×${m13} = ${result}`,
      latex: `|A| = ${a} \cdot ${m11} - ${b} \cdot ${m12} + ${c} \cdot ${m13} = ${result}`,
    });
    return { steps, result: String(result), resultLatex: String(result) };
  }

  // 高阶：用高斯消元法思路简述
  steps.push({ description: '高阶行列式使用行变换化简计算', formula: `n=${n}`, latex: `n=${n}` });
  // 直接计算
  const matStr = A.map(r => r.join(',')).join('; ');
  let result = 0;
  try {
    const r = evaluate(`det([${A.map(r => `[${r.join(',')}]`).join(',')}])`);
    result = Number(r) || 0;
  } catch { /* ignore */ }
  steps.push({ description: '行列式值', formula: String(result), latex: String(result) });
  return { steps, result: String(result), resultLatex: String(result) };
}

// ============================================================
// 10. 矩阵求逆步骤详解（伴随矩阵法，2×2 / 3×3）
// ============================================================
export function stepByStepMatrixInverse(A: number[][]): StepResult {
  const steps: StepItem[] = [];
  const n = A.length;

  steps.push({
    description: '求 A⁻¹，使用伴随矩阵法',
    formula: 'A⁻¹ = adj(A) / det(A)',
    latex: `A^{-1} = \frac{1}{\det(A)} \cdot \text{adj}(A)`,
  });

  // 计算行列式
  let det = 0;
  if (n === 2) {
    const [[a, b], [c, d]] = A;
    det = a * d - b * c;
    steps.push({
      description: '步骤 1：计算行列式 det(A)',
      formula: `det(A) = ${a}×${d} - ${b}×${c} = ${det}`,
      latex: `\det(A) = ${a} \times ${d} - ${b} \times ${c} = ${det}`,
    });
  } else if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = A;
    det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    steps.push({
      description: '步骤 1：计算行列式 det(A)',
      formula: `det(A) = ${det.toFixed(6).replace(/\.?0+$/, '')}`,
      latex: `\det(A) = ${det.toFixed(6).replace(/\.?0+$/, '')}`,
    });
  }

  if (Math.abs(det) < 1e-10) {
    steps.push({ description: 'det(A) = 0，矩阵不可逆（奇异矩阵）', formula: '', latex: '\det(A) = 0,\ A\text{ 不可逆}' });
    return { steps, result: '不可逆', resultLatex: '\text{不可逆}' };
  }

  if (n === 2) {
    const [[a, b], [c, d]] = A;
    steps.push({
      description: '步骤 2：2×2 伴随矩阵 = 主对角线交换、副对角线取负',
      formula: `adj(A) = [[${d}, ${-b}], [${-c}, ${a}]]`,
      latex: `\text{adj}(A) = \begin{bmatrix} ${d} & ${-b} \\ ${-c} & ${a} \end{bmatrix}`,
    });
    const invA = [[d / det, -b / det], [-c / det, a / det]];
    const fmt = (v: number) => Number.isInteger(v) ? String(v) : v.toFixed(4).replace(/\.?0+$/, '');
    steps.push({
      description: '步骤 3：除以行列式得逆矩阵',
      formula: `A⁻¹ = (1/${det}) × adj(A)`,
      latex: `A^{-1} = \frac{1}{${det}} \cdot \text{adj}(A)`,
    });
    const result = `[[${fmt(invA[0][0])}, ${fmt(invA[0][1])}], [${fmt(invA[1][0])}, ${fmt(invA[1][1])}]]`;
    steps.push({
      description: '逆矩阵结果',
      formula: result,
      latex: `A^{-1} = \begin{bmatrix} ${fmt(invA[0][0])} & ${fmt(invA[0][1])} \\ ${fmt(invA[1][0])} & ${fmt(invA[1][1])} \end{bmatrix}`,
    });
    return { steps, result, resultLatex: result };
  }

  // 3x3 简版步骤
  steps.push({ description: '步骤 2：计算各元素的代数余子式', formula: 'Cᵢⱼ = (-1)^(i+j) · Mᵢⱼ', latex: 'C_{ij} = (-1)^{i+j} \cdot M_{ij}' });
  steps.push({ description: '步骤 3：转置得到伴随矩阵 adj(A)', formula: 'adj(A) = Cᵀ', latex: '\text{adj}(A) = C^T' });
  steps.push({ description: '步骤 4：A⁻¹ = adj(A) / det(A)', formula: '', latex: '' });
  return { steps, result: `det(A) = ${det}`, resultLatex: `\det(A) = ${det}` };
}

// ============================================================
// 11. 特征值与特征向量步骤详解（2×2）
// ============================================================
export function stepByStepEigenvalue(A: number[][]): StepResult {
  const steps: StepItem[] = [];
  const n = A.length;

  if (n !== 2) {
    steps.push({ description: `当前仅支持 2×2 矩阵特征值分析，n=${n}`, formula: '', latex: '' });
    return { steps, result: '不支持', resultLatex: '\text{不支持}' };
  }

  const [[a, b], [c, d]] = A;

  steps.push({
    description: '步骤 1：写出特征方程 det(A - λI) = 0',
    formula: `|(${a}-λ) ${b}; ${c} (${d}-λ)| = 0`,
    latex: `\begin{vmatrix} ${a} - \lambda & ${b} \\ ${c} & ${d} - \lambda \end{vmatrix} = 0`,
  });

  // 特征方程: (a-λ)(d-λ) - bc = 0 → λ² - (a+d)λ + (ad-bc) = 0
  const trace = a + d;
  const det = a * d - b * c;
  steps.push({
    description: '步骤 2：展开得到特征多项式',
    formula: `λ² - ${trace}λ + ${det} = 0  (迹 tr = ${trace}, 行列式 det = ${det})`,
    latex: `\lambda^2 - ${trace}\lambda + ${det} = 0 \quad (tr=${trace},\ \det=${det})`,
  });

  // 求根
  const delta = trace * trace - 4 * det;
  steps.push({
    description: '步骤 3：解一元二次方程求特征值',
    formula: `λ = (${trace} ± √Δ) / 2,  Δ = ${trace}² - 4×${det} = ${delta}`,
    latex: `\lambda = \frac{${trace} \pm \sqrt{\Delta}}{2},\quad \Delta = ${trace}^2 - 4 \cdot ${det} = ${delta}`,
  });

  if (delta >= 0) {
    const λ1 = (trace + Math.sqrt(delta)) / 2;
    const λ2 = (trace - Math.sqrt(delta)) / 2;
    const fmt = (v: number) => Math.abs(v) < 1e-10 ? '0' : Number.isInteger(v) ? String(v) : v.toFixed(4).replace(/\.?0+$/, '');
    steps.push({
      description: '特征值结果',
      formula: `λ₁ = ${fmt(λ1)},  λ₂ = ${fmt(λ2)}`,
      latex: `\lambda_1 = ${fmt(λ1)},\quad \lambda_2 = ${fmt(λ2)}`,
    });

    // 特征向量方向 (简化)
    steps.push({
      description: '步骤 4：代入 λ 解 (A-λI)v=0 得特征向量',
      formula: '对每个 λ，解齐次线性方程组',
      latex: '\text{对每个 } \lambda \text{，解 } (A-\lambda I)v = 0',
    });

    return {
      steps,
      result: `λ₁=${fmt(λ1)}, λ₂=${fmt(λ2)}`,
      resultLatex: `\lambda_1 = ${fmt(λ1)},\ \lambda_2 = ${fmt(λ2)}`,
    };
  } else {
    const real = trace / 2;
    const imag = Math.sqrt(-delta) / 2;
    steps.push({
      description: 'Δ < 0，特征值为共轭复数',
      formula: `λ = ${real} ± ${imag.toFixed(4).replace(/\.?0+$/, '')}i`,
      latex: `\lambda = ${real} \pm ${imag.toFixed(4).replace(/\.?0+$/, '')}i`,
    });
    return { steps, result: `复特征值 ${real}±${imag.toFixed(2)}i`, resultLatex: `${real} \pm ${imag.toFixed(2)}i` };
  }
}

// ============================================================
// 12. 一阶线性 ODE 步骤详解
// 形式：y' + P(x)y = Q(x)
// ============================================================
export function stepByStepLinearODE(P: string, Q: string, variable = 'x'): StepResult {
  const steps: StepItem[] = [];

  steps.push({
    description: '一阶线性微分方程标准形式',
    formula: `y' + (${P})y = ${Q}`,
    latex: `y' + (${P})y = ${Q}`,
  });

  steps.push({
    description: '步骤 1：计算积分因子 μ(x) = e^∫P(x)dx',
    formula: `μ = e^∫(${P}) d${variable}`,
    latex: `\mu(x) = e^{\int (${P})\, d${variable}}`,
  });

  // 尝试计算积分（用 mathjs）
  let muExpr = '';
  try {
    const intP = evaluate(`integrate(${P}, ${variable})`);
    muExpr = String(intP);
  } catch {
    muExpr = `∫(${P})d${variable}`;
  }

  steps.push({
    description: '步骤 2：方程两边同乘积分因子 μ(x)',
    formula: `μ·y' + μ·P·y = μ·Q  →  d/dx(μ·y) = μ·Q`,
    latex: `\frac{d}{dx}(\mu \cdot y) = \mu \cdot Q`,
  });

  steps.push({
    description: '步骤 3：两边积分',
    formula: `μ·y = ∫μ·Q d${variable} + C`,
    latex: `\mu \cdot y = \int \mu \cdot Q \, d${variable} + C`,
  });

  steps.push({
    description: '步骤 4：解出 y（通解）',
    formula: `y = (1/μ)·[∫μ·Q d${variable} + C]`,
    latex: `y = \frac{1}{\mu} \left( \int \mu \cdot Q \, d${variable} + C \right)`,
  });

  return {
    steps,
    result: `通解：y = (1/μ)(∫μQ dx + C), μ=e^∫Pdx`,
    resultLatex: `y = \frac{1}{\mu} \left( \int \mu Q\, dx + C \right),\quad \mu = e^{\int P\, dx}`,
  };
}

// ============================================================
// 13. GCD 辗转相除法步骤详解
// ============================================================
export function stepByStepGcd(aIn: number, bIn: number): StepResult {
  const steps: StepItem[] = [];
  let a = Math.abs(Math.floor(aIn));
  let b = Math.abs(Math.floor(bIn));

  if (a < b) [a, b] = [b, a];

  steps.push({
    description: '欧几里得算法（辗转相除法）',
    formula: `gcd(${a}, ${b})`,
    latex: `\gcd(${a}, ${b})`,
  });

  let stepNum = 1;
  while (b !== 0) {
    const q = Math.floor(a / b);
    const r = a % b;
    steps.push({
      description: `第 ${stepNum} 步：${a} ÷ ${b} = 商 ${q} 余 ${r}`,
      formula: `${a} = ${q} × ${b} + ${r}`,
      latex: `${a} = ${q} \times ${b} + ${r}`,
    });
    a = b;
    b = r;
    stepNum++;
  }

  steps.push({
    description: `余数为 0，停止。gcd = ${a}`,
    formula: `gcd = ${a}`,
    latex: `\gcd = ${a}`,
  });

  return { steps, result: String(a), resultLatex: String(a) };
}

// ============================================================
// 14. 模逆元步骤详解（扩展欧几里得）
// ============================================================
export function stepByStepModInverse(a: number, m: number): StepResult {
  const steps: StepItem[] = [];

  steps.push({
    description: `求 ${a} 在模 ${m} 下的逆元，即 a·x ≡ 1 (mod ${m})`,
    formula: `${a}x ≡ 1 (mod ${m})`,
    latex: `${a}x \equiv 1 \pmod{${m}}`,
  });

  // 扩展欧几里得
  let oldR = a, r = m;
  let oldS = 1, s = 0;
  let oldT = 0, t = 1;
  let stepN = 1;

  while (r !== 0) {
    const q = Math.floor(oldR / r);
    const newR = oldR - q * r;
    const newS = oldS - q * s;
    const newT = oldT - q * t;
    steps.push({
      description: `第 ${stepN} 步：${oldR} = ${q}·${r} + ${newR}`,
      formula: `${oldR} = ${q}×${r} + ${newR}`,
      latex: `${oldR} = ${q} \cdot ${r} + ${newR}`,
    });
    oldR = r; r = newR;
    oldS = s; s = newS;
    oldT = t; t = newT;
    stepN++;
  }

  if (oldR !== 1) {
    steps.push({
      description: `gcd(${a}, ${m}) = ${oldR} ≠ 1，逆元不存在`,
      formula: '逆元不存在',
      latex: '\text{逆元不存在}',
    });
    return { steps, result: '不存在', resultLatex: '\text{不存在}' };
  }

  const x = ((oldS % m) + m) % m;
  steps.push({
    description: `贝祖等式：${a}·${oldS} + ${m}·${oldT} = 1 → x = ${oldS} mod ${m} = ${x}`,
    formula: `${a} × ${x} ≡ 1 (mod ${m})`,
    latex: `${a} \times ${x} \equiv 1 \pmod{${m}}`,
  });

  return { steps, result: `x ≡ ${x} (mod ${m})`, resultLatex: `x \equiv ${x} \pmod{${m}}` };
}

// ============================================================
// 15. 复数乘法步骤详解
// ============================================================
export function stepByStepComplexMult(aRe: number, aIm: number, bRe: number, bIm: number): StepResult {
  const steps: StepItem[] = [];

  steps.push({
    description: '复数乘法 (a + bi)(c + di)',
    formula: `(${aRe} + ${aIm}i) × (${bRe} + ${bIm}i)`,
    latex: `(${aRe} + ${aIm}i)(${bRe} + ${bIm}i)`,
  });

  steps.push({
    description: '步骤 1：用分配律（FOIL 法）展开',
    formula: `= ${aRe}×${bRe} + ${aRe}×${bIm}i + ${aIm}i×${bRe} + ${aIm}i×${bIm}i`,
    latex: `= ${aRe} \cdot ${bRe} + ${aRe} \cdot ${bIm}i + ${aIm}i \cdot ${bRe} + ${aIm}i \cdot ${bIm}i`,
  });

  const ac = aRe * bRe;
  const ad = aRe * bIm;
  const bc = aIm * bRe;
  const bd = aIm * bIm;
  steps.push({
    description: '步骤 2：利用 i² = -1 化简虚部',
    formula: `= ${ac} + ${ad}i + ${bc}i + ${bd}i² = ${ac} + ${ad}i + ${bc}i - ${bd}`,
    latex: `= ${ac} + ${ad}i + ${bc}i + ${bd}i^2 = ${ac} + ${ad}i + ${bc}i - ${bd}`,
  });

  const re = ac - bd;
  const im = ad + bc;
  steps.push({
    description: '步骤 3：实部合并、虚部合并',
    formula: `= (${ac} - ${bd}) + (${ad} + ${bc})i = ${re} + ${im}i`,
    latex: `= (${ac} - ${bd}) + (${ad} + ${bc})i = ${re} + ${im}i`,
  });

  return { steps, result: `${re} + ${im}i`, resultLatex: `${re} + ${im}i` };
}

// ============================================================
// 16. 求和符号展开步骤详解
// ============================================================
export function stepByStepSumExpand(expr: string, variable: string, start: number, end: number): StepResult {
  const steps: StepItem[] = [];

  if (end - start > 20) {
    steps.push({ description: '项数过多，仅展示部分展开', formula: '', latex: '' });
  }

  steps.push({
    description: `求和式 Σ ${expr} （${variable} 从 ${start} 到 ${end}）`,
    formula: `Σ(${expr}), ${variable}=${start}..${end}`,
    latex: `\sum_{${variable}=${start}}^{${end}} ${expr}`,
  });

  const terms: string[] = [];
  const values: number[] = [];
  const maxTerms = Math.min(end - start + 1, 10);
  for (let i = 0; i < maxTerms; i++) {
    const k = start + i;
    try {
      const v = evaluate(expr, { [variable]: k });
      terms.push(`${String(v)}`);
      values.push(Number(v));
    } catch {
      terms.push(`(${expr.replaceAll(variable, String(k))})`);
    }
  }

  if (end - start + 1 > maxTerms) terms.push('...');

  steps.push({
    description: '逐项展开',
    formula: terms.join(' + '),
    latex: terms.join(' + '),
  });

  if (values.length === end - start + 1) {
    const sum = values.reduce((s, v) => s + v, 0);
    steps.push({
      description: '求和结果',
      formula: `= ${sum}`,
      latex: `= ${sum}`,
    });
    return { steps, result: String(sum), resultLatex: String(sum) };
  }

  return { steps, result: `${terms.join(' + ')}`, resultLatex: terms.join(' + ') };
}
