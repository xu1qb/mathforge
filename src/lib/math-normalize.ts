// EXPORTS: normalizeMathInput

/**
 * 全局数学符号输入预处理器
 * 将用户输入的 Unicode 数学符号转换为 math.js 可识别的代码形式
 *
 * 支持：
 * - 根号：√2 → sqrt(2)，∛8 → cbrt(8)，√(x+1) → sqrt(x+1)
 * - 圆周率：π → pi
 * - 上标：x² → x^2，x³ → x^3，xⁿ → x^n
 * - 乘除：× → *，÷ → /，· → *
 * - 减号：− → -
 * - 无穷：∞ → Infinity
 * - 不等号：≤ → <=，≥ → >=，≠ → !=
 * - 希腊字母：α → alpha，β → beta，...
 * - 分数：½ → 0.5，⅓ → 1/3，...
 * - 正负号：± → +/-
 * - 箭头 / 逻辑：→ ->，↔ <->，∧ and，∨ or，¬ not
 */
export function normalizeMathInput(input: string): string {
  if (!input || typeof input !== 'string') return input;

  let str = input;

  // 1. 先处理分数 Unicode（½ ⅓ ¼ 等，先替换避免被其他规则干扰）
  str = replaceUnicodeFractions(str);

  // 2. 三次方根 ∛ → cbrt(...)  （必须在 √ 前处理，因为 ∛ 包含类似根号的视觉）
  str = replaceCubeRoot(str);

  // 3. 平方根 √ → sqrt(...)
  str = replaceSquareRoot(str);

  // 4. 上标数字：x² → x^2, x³ → x^3, x⁴ → x^4, ...
  str = replaceSuperscripts(str);

  // 5. 下标数字：x₁ → x_1, ...
  str = replaceSubscripts(str);

  // 6. 希腊字母（先长后短，避免匹配问题）
  str = replaceGreekLetters(str);

  // 7. 圆周率 Π（大写，乘积） → 先不动，作为乘积符号提示
  //    π（小写） → pi
  str = str.replace(/π/g, 'pi');

  // 8. 乘除符号
  str = str.replace(/×/g, '*');
  str = str.replace(/÷/g, '/');
  str = str.replace(/·/g, '*'); // 中点乘号

  // 9. Unicode 减号
  str = str.replace(/−/g, '-');

  // 10. 正负号
  str = str.replace(/±/g, '+/-');

  // 11. 无穷
  str = str.replace(/∞/g, 'Infinity');

  // 12. 不等号
  str = str.replace(/≤/g, '<=');
  str = str.replace(/≥/g, '>=');
  str = str.replace(/≠/g, '!=');
  str = str.replace(/≡/g, '==');

  // 13. 逻辑符号
  str = str.replace(/∧/g, ' and ');
  str = str.replace(/∨/g, ' or ');
  str = str.replace(/¬/g, ' not ');
  str = str.replace(/→/g, ' -> ');
  str = str.replace(/↔/g, ' <-> ');
  str = str.replace(/⇒/g, ' => ');
  str = str.replace(/⇔/g, ' <=> ');

  // 14. 集合符号
  str = str.replace(/∈/g, ' in ');
  str = str.replace(/∉/g, ' not in ');
  str = str.replace(/∪/g, ' union ');
  str = str.replace(/∩/g, ' intersect ');
  str = str.replace(/∅/g, 'emptySet');
  str = str.replace(/⊂/g, ' subset ');
  str = str.replace(/⊆/g, ' subset ');

  // 15. 求和 / 乘积（文字替换提示，实际计算由对应模块处理）
  str = str.replace(/∑/g, 'sum');
  str = str.replace(/∏/g, 'prod');

  // 16. 积分（提示用，实际积分由模块处理）
  str = str.replace(/∫/g, 'integrate');
  str = str.replace(/∂/g, 'd'); // 偏导符号

  // 17. 角度符号
  str = str.replace(/°/g, ' deg ');

  // 18. 比例 / 百分比
  str = str.replace(/‰/g, '/1000');

  // 19. 约等于 / 不等于（辅助）
  str = str.replace(/≈/g, '~=');

  // 清理多余空格（避免连续空格）
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

// ===================== 辅助函数 =====================

/**
 * 替换 Unicode 分数字符
 */
function replaceUnicodeFractions(str: string): string {
  const fractionMap: Record<string, string> = {
    '½': '1/2',
    '⅓': '1/3',
    '⅔': '2/3',
    '¼': '1/4',
    '¾': '3/4',
    '⅕': '1/5',
    '⅖': '2/5',
    '⅗': '3/5',
    '⅘': '4/5',
    '⅙': '1/6',
    '⅚': '5/6',
    '⅐': '1/7',
    '⅛': '1/8',
    '⅜': '3/8',
    '⅝': '5/8',
    '⅞': '7/8',
    '⅑': '1/9',
    '⅒': '1/10',
  };

  let result = str;
  for (const [uni, frac] of Object.entries(fractionMap)) {
    // 分数字符前后如果是字母/数字，补 * 号表示乘
    result = result.replace(new RegExp(`([a-zA-Z0-9)])${escapeReg(uni)}`, 'g'), `$1*${frac}`);
    result = result.replace(new RegExp(`${escapeReg(uni)}([a-zA-Z0-9(])`, 'g'), `${frac}*$1`);
    result = result.replace(new RegExp(escapeReg(uni), 'g'), frac);
  }
  return result;
}

/**
 * 替换平方根符号 √(...) / √x / √数字
 * 规则：√ 后面紧跟括号表达式或单个数/变量
 */
function replaceSquareRoot(str: string): string {
  let result = str;
  // 多轮替换，处理嵌套和并列

  // 模式1：√(...)  —— 带括号的情况
  // 使用迭代替换避免正则递归问题
  const parenPattern = /√\(/;
  while (parenPattern.test(result)) {
    const match = result.match(/√\(/);
    if (!match) break;
    const startIdx = match.index ?? 0;
    const contentStart = startIdx + 2; // 跳过 √(
    const contentEnd = findMatchingParen(result, contentStart - 1);
    if (contentEnd === -1) break;
    const inner = result.substring(contentStart, contentEnd);
    const before = result.substring(0, startIdx);
    const after = result.substring(contentEnd + 1);
    result = `${before}sqrt(${inner})${after}`;
  }

  // 模式2：√ 后紧跟一个 token（数字、变量、函数调用）
  // 如 √2 → sqrt(2)，√x → sqrt(x)，√sin → 不替换（太复杂）
  // 匹配：√ 后接数字序列（含小数点），或单个字母变量
  result = result.replace(/√(\d+\.?\d*)/g, 'sqrt($1)');
  result = result.replace(/√([a-zA-Z])(?![a-zA-Z(])/g, 'sqrt($1)');

  return result;
}

/**
 * 替换三次方根 ∛
 */
function replaceCubeRoot(str: string): string {
  let result = str;

  // 模式1：∛(...)
  const parenPattern = /∛\(/;
  while (parenPattern.test(result)) {
    const match = result.match(/∛\(/);
    if (!match) break;
    const startIdx = match.index ?? 0;
    const contentStart = startIdx + 2;
    const contentEnd = findMatchingParen(result, contentStart - 1);
    if (contentEnd === -1) break;
    const inner = result.substring(contentStart, contentEnd);
    const before = result.substring(0, startIdx);
    const after = result.substring(contentEnd + 1);
    result = `${before}cbrt(${inner})${after}`;
  }

  // 模式2：∛ 后紧跟数字或单字母
  result = result.replace(/∛(\d+\.?\d*)/g, 'cbrt($1)');
  result = result.replace(/∛([a-zA-Z])(?![a-zA-Z(])/g, 'cbrt($1)');

  return result;
}

/**
 * 替换上标数字和字母
 * ⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ → ^0 ^1 ^2 ...
 */
function replaceSuperscripts(str: string): string {
  const superMap: Record<string, string> = {
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
    'ⁿ': 'n',
    '⁺': '+',
    '⁻': '-',
    '⁼': '=',
    '⁽': '(',
    '⁾': ')',
  };

  // 找到上标连续序列，整体替换为 ^(...)
  // 单字符上标（如 x²）直接替换为 x^2
  let result = str;

  // 先找连续上标序列
  const superChars = Object.keys(superMap).join('');

  // 策略：先处理 xⁿ 形式（无括号），转为 x^n
  // 单字符上标直接 x^2，多字符上标转 x^(23)

  // 多轮替换，每次替换一组连续上标
  let prev = '';
  while (prev !== result) {
    prev = result;
    // 找连续上标序列
    const seqPattern = new RegExp(`([a-zA-Z0-9)])(([${superChars}]+))`, 'g');
    result = result.replace(seqPattern, (_, base, supSeq) => {
      let normal = '';
      for (const ch of supSeq) {
        normal += superMap[ch] ?? ch;
      }
      if (normal.length === 1) {
        return `${base}^${normal}`;
      }
      return `${base}^(${normal})`;
    });
  }

  return result;
}

/**
 * 替换下标数字
 * ₀₁₂₃... → _0 _1 _2 ...
 */
function replaceSubscripts(str: string): string {
  const subMap: Record<string, string> = {
    '₀': '0',
    '₁': '1',
    '₂': '2',
    '₃': '3',
    '₄': '4',
    '₅': '5',
    '₆': '6',
    '₇': '7',
    '₈': '8',
    '₉': '9',
    'ₙ': 'n',
    'ₖ': 'k',
    'ₘ': 'm',
  };

  const subChars = Object.keys(subMap).join('');
  let result = str;

  let prev = '';
  while (prev !== result) {
    prev = result;
    const seqPattern = new RegExp(`([a-zA-Z])([${subChars}]+)`, 'g');
    result = result.replace(seqPattern, (_, base, subSeq) => {
      let normal = '';
      for (const ch of subSeq) {
        normal += subMap[ch] ?? ch;
      }
      return `${base}_${normal}`;
    });
  }

  return result;
}

/**
 * 替换希腊字母
 */
function replaceGreekLetters(str: string): string {
  // 按长度从长到短（都是单字符，按常见程度排序，注意大小写）
  // 先替换大写（避免小写优先匹配）
  const upperGreek: Record<string, string> = {
    'Α': 'Alpha',
    'Β': 'Beta',
    'Γ': 'Gamma',
    'Δ': 'Delta',
    'Ε': 'Epsilon',
    'Ζ': 'Zeta',
    'Η': 'Eta',
    'Θ': 'Theta',
    'Ι': 'Iota',
    'Κ': 'Kappa',
    'Λ': 'Lambda',
    'Μ': 'Mu',
    'Ν': 'Nu',
    'Ξ': 'Xi',
    'Ο': 'Omicron',
    'Π': 'Pi',
    'Ρ': 'Rho',
    'Σ': 'Sigma',
    'Τ': 'Tau',
    'Υ': 'Upsilon',
    'Φ': 'Phi',
    'Χ': 'Chi',
    'Ψ': 'Psi',
    'Ω': 'Omega',
  };

  const lowerGreek: Record<string, string> = {
    'α': 'alpha',
    'β': 'beta',
    'γ': 'gamma',
    'δ': 'delta',
    'ε': 'epsilon',
    'ζ': 'zeta',
    'η': 'eta',
    'θ': 'theta',
    'ι': 'iota',
    'κ': 'kappa',
    'λ': 'lambda',
    'μ': 'mu',
    'ν': 'nu',
    'ξ': 'xi',
    'ο': 'omicron',
    // 'π': 'pi',  // π 单独处理
    'ρ': 'rho',
    'σ': 'sigma',
    'τ': 'tau',
    'υ': 'upsilon',
    'φ': 'phi',
    'χ': 'chi',
    'ψ': 'psi',
    'ω': 'omega',
  };

  let result = str;

  // 先替换大写希腊字母（前后是字母/数字边界时替换，避免误匹配）
  for (const [uni, name] of Object.entries(upperGreek)) {
    const re = new RegExp(escapeReg(uni), 'g');
    result = result.replace(re, name);
  }

  // 再替换小写（π 单独处理，不在此循环）
  for (const [uni, name] of Object.entries(lowerGreek)) {
    const re = new RegExp(escapeReg(uni), 'g');
    result = result.replace(re, name);
  }

  return result;
}

/**
 * 找到匹配的右括号位置
 */
function findMatchingParen(str: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * 转义正则特殊字符
 */
function escapeReg(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
