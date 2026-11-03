// EXPORTS: expressionToLatex

/**
 * 把 math.js 风格的表达式字符串转成 LaTeX 排版字符串
 * 覆盖：分数 a/b → \frac{a}{b}、幂 x^2 → x^{2}、开根 sqrt → \sqrt、
 *       函数名正体（\sin \cos 等）、希腊字母、乘积、括号嵌套、负号、混合表达式
 * 实现：递归下降解析（手写，无额外依赖）
 */

// 希腊字母映射（小写 + 大写常用）
const GREEK: Record<string, string> = {
  alpha: 'alpha', beta: 'beta', gamma: 'gamma', delta: 'delta',
  epsilon: 'epsilon', zeta: 'zeta', eta: 'eta', theta: 'theta',
  iota: 'iota', kappa: 'kappa', lambda: 'lambda', mu: 'mu',
  nu: 'nu', xi: 'xi', pi: 'pi', rho: 'rho', sigma: 'sigma',
  tau: 'tau', upsilon: 'upsilon', phi: 'phi', chi: 'chi',
  psi: 'psi', omega: 'omega',
  // 大写
  Gamma: 'Gamma', Delta: 'Delta', Theta: 'Theta',
  Lambda: 'Lambda', Xi: 'Xi', Pi: 'Pi', Sigma: 'Sigma',
  Upsilon: 'Upsilon', Phi: 'Phi', Psi: 'Psi', Omega: 'Omega',
};

// 正体函数名（带反斜杠）
const OPERATORS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'asin', 'acos', 'atan', 'acot',
  'sinh', 'cosh', 'tanh', 'coth',
  'log', 'ln', 'lg', 'exp',
  'abs', 'sqrt', 'cbrt', 'nthRoot',
  'max', 'min', 'ceil', 'floor', 'round',
  'sign', 'mod',
  'arcsin', 'arccos', 'arctan',
  // 运算符/大运算符（在函数调用位置时也要正体）
  'sum', 'prod', 'int', 'lim', 'det',
]);

// 优先级（从低到高）
// 0: 关系运算 = < > <= >= !=
// 1: 加/减
// 2: 乘/除
// 3: 幂
// 4: 一元负号
// 5: 函数调用 / 括号 / 原子

/**
 * 把 token 流解析成 LaTeX 字符串
 */
class LatexParser {
  private pos = 0;
  private tokens: string[] = [];

  parse(expr: string): string {
    if (!expr || !expr.trim()) return '';
    this.tokens = this.tokenize(expr);
    this.pos = 0;
    const result = this.parseRelation();
    // 允许末尾有剩余 token（忽略多余闭合括号等）
    return result;
  }

  /**
   * 词法分析：把表达式切分成 token
   */
  private tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    const s = expr;
    while (i < s.length) {
      const c = s[i];

      // 空白
      if (/\s/.test(c)) { i++; continue; }

      // 数字（含小数点和科学计数法）
      if (/[0-9]/.test(c) || (c === '.' && i + 1 < s.length && /[0-9]/.test(s[i + 1]))) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        // 科学计数法
        if (j < s.length && (s[j] === 'e' || s[j] === 'E')) {
          const ej = j;
          j++;
          if (j < s.length && (s[j] === '+' || s[j] === '-')) j++;
          if (j < s.length && /[0-9]/.test(s[j])) {
            while (j < s.length && /[0-9]/.test(s[j])) j++;
          } else {
            j = ej; // 不是科学计数法，回退（e 是变量）
          }
        }
        tokens.push(s.slice(i, j));
        i = j;
        continue;
      }

      // 标识符（变量名、函数名、希腊字母）
      if (/[a-zA-Z_]/.test(c)) {
        let j = i;
        while (j < s.length && /[a-zA-Z0-9_]/.test(s[j])) j++;
        tokens.push(s.slice(i, j));
        i = j;
        continue;
      }

      // 特殊单字符运算
      if ('+-*/^()[]{}.,=<>!|·×÷−≤≥≠∞√∛∫∑∏'.includes(c)) {
        // 处理多字符运算符
        if (c === '<' && i + 1 < s.length && s[i + 1] === '=') {
          tokens.push('<='); i += 2; continue;
        }
        if (c === '>' && i + 1 < s.length && s[i + 1] === '=') {
          tokens.push('>='); i += 2; continue;
        }
        if (c === '!' && i + 1 < s.length && s[i + 1] === '=') {
          tokens.push('!='); i += 2; continue;
        }
        tokens.push(c);
        i++;
        continue;
      }

      // 其他字符直接作为 token（兜底）
      tokens.push(c);
      i++;
    }
    return tokens;
  }

  private peek(): string | undefined {
    return this.tokens[this.pos];
  }

  private consume(expected?: string): string {
    const t = this.tokens[this.pos];
    if (expected && t !== expected) {
      // 不抛错，降级处理
      return t || '';
    }
    this.pos++;
    return t || '';
  }

  // ========== 递归下降解析 ==========

  /** 关系表达式（最低优先级） */
  private parseRelation(): string {
    let left = this.parseAddSub();
    while (true) {
      const op = this.peek();
      if (op === '=' || op === '<' || op === '>' || op === '<=' || op === '>=' || op === '!=') {
        this.consume();
        const right = this.parseAddSub();
        const latexOp = op === '!=' ? '\\neq ' : op === '<=' ? '\\leq ' : op === '>=' ? '\\geq ' : op;
        left = `${left} ${latexOp} ${right}`;
      } else {
        break;
      }
    }
    return left;
  }

  /** 加减 */
  private parseAddSub(): string {
    let left = this.parseMulDiv();
    while (true) {
      const op = this.peek();
      if (op === '+' || op === '-') {
        this.consume();
        const right = this.parseMulDiv();
        left = `${left} ${op === '+' ? '+' : '-'} ${right}`;
      } else {
        break;
      }
    }
    return left;
  }

  /** 乘除 */
  private parseMulDiv(): string {
    let left = this.parseUnary();
    while (true) {
      const op = this.peek();
      if (op === '*' || op === '·' || op === '×') {
        this.consume();
        const right = this.parseUnary();
        // 数字与数字相乘用 \cdot，其他情况省略乘号
        left = this.renderMul(left, right);
      } else if (op === '/' || op === '÷') {
        this.consume();
        const right = this.parseUnary();
        left = `\\frac{${left}}{${right}}`;
      } else {
        // 隐式乘法：比如 2x、x y、(a)(b)、2(x+1)、f(x)g(x)
        const next = this.peek();
        if (next === undefined || next === ')' || next === ']' || next === '}' ||
            next === '+' || next === '-' || next === ',' ||
            next === '=' || next === '<' || next === '>' || next === '<=' || next === '>=' || next === '!=' ) {
          break;
        }
        // 判断下一个 token 是否构成隐式乘法的右操作数
        if (this.isImplicitMulRight()) {
          const right = this.parseUnary();
          left = this.renderImplicitMul(left, right);
        } else {
          break;
        }
      }
    }
    return left;
  }

  /** 是否构成隐式乘法的右操作数 */
  private isImplicitMulRight(): boolean {
    const next = this.peek();
    if (next === undefined) return false;
    // 数字开头？否（数字应该已经被 parseUnary 消费了，除非是括号后面跟数字 - 但这种很少见）
    // 标识符开头？是的，如 2x、(a)b
    if (/^[a-zA-Z_]/.test(next)) {
      // 如果是函数（后面紧跟括号），也算隐式乘吗？2 sin(x) 是的
      return true;
    }
    // 左括号/根号等
    if (next === '(' || next === '√' || next === '∛' || next === '|') return true;
    return false;
  }

  /** 一元运算（负号） */
  private parseUnary(): string {
    const op = this.peek();
    if (op === '-') {
      this.consume();
      const operand = this.parsePower();
      return `-${operand}`;
    }
    if (op === '+') {
      this.consume();
      return this.parsePower();
    }
    return this.parsePower();
  }

  /** 幂运算（右结合） */
  private parsePower(): string {
    const base = this.parsePostfix();
    const op = this.peek();
    if (op === '^') {
      this.consume();
      const exponent = this.parseUnary(); // 右结合：x^-2 有效
      return this.renderPower(base, exponent);
    }
    return base;
  }

  /** 后缀运算（如阶乘 !） */
  private parsePostfix(): string {
    let expr = this.parseAtom();
    while (this.peek() === '!') {
      this.consume();
      expr = `${expr}!`;
    }
    return expr;
  }

  /** 原子：数字、变量、函数调用、括号、根号、绝对值 */
  private parseAtom(): string {
    const t = this.peek();
    if (t === undefined) return '';

    // 矩阵：[a,b;c,d] 格式
    if (t === '[') {
      // 尝试按矩阵解析：包含分号或多个逗号
      const savedPos = this.pos;
      this.consume('[');
      let depth = 1;
      let hasSemicolon = false;
      let commaCount = 0;
      const tokens: string[] = [];
      while (this.pos < this.tokens.length && depth > 0) {
        const tk = this.tokens[this.pos];
        if (tk === '[') depth++;
        else if (tk === ']') {
          depth--;
          if (depth === 0) break;
        } else if (tk === ';') hasSemicolon = true;
        else if (tk === ',' && depth === 1) commaCount++;
        tokens.push(tk);
        this.pos++;
      }
      const endBracket = this.tokens[this.pos];
      if (endBracket === ']') this.pos++;

      // 判定是否为矩阵：有分号 或 逗号>2个(单行向量也走矩阵)
      if (hasSemicolon || commaCount >= 1) {
        // 解析矩阵
        return this.parseMatrixFromTokens(tokens);
      }
      // 普通括号
      this.pos = savedPos;
      this.consume('[');
      const inner = this.parseRelation();
      if (this.peek() === ']') this.consume(']');
      return `\\left[${inner}\\right]`;
    }

    // 括号
    if (t === '(') {
      this.consume('(');
      const inner = this.parseRelation();
      if (this.peek() === ')') this.consume(')');
      return `\\left(${inner}\\right)`;
    }
    if (t === '{') {
      // 尝试 piecewise：{ cond1: expr1; cond2: expr2 }
      const savedPos = this.pos;
      this.consume('{');
      let depth = 1;
      let colonCount = 0;
      let semicolonCount = 0;
      const tokens: string[] = [];
      while (this.pos < this.tokens.length && depth > 0) {
        const tk = this.tokens[this.pos];
        if (tk === '{') depth++;
        else if (tk === '}') {
          depth--;
          if (depth === 0) break;
        } else if (tk === ':' && depth === 1) colonCount++;
        else if (tk === ';' && depth === 1) semicolonCount++;
        tokens.push(tk);
        this.pos++;
      }
      const endBrace = this.tokens[this.pos];
      if (endBrace === '}') this.pos++;

      // piecewise 判断：顶层有冒号（条件:表达式）
      if (colonCount >= 1 && (semicolonCount >= 0)) {
        return this.parsePiecewiseFromTokens(tokens);
      }
      // 普通花括号
      this.pos = savedPos;
      this.consume('{');
      const inner = this.parseRelation();
      if (this.peek() === '}') this.consume('}');
      return `\\left\\{${inner}\\right\\}`;
    }

    // 绝对值
    if (t === '|') {
      this.consume('|');
      // 简单处理：匹配到下一个 |（嵌套的情况可能不对，这里做简化）
      const inner = this.parseRelation();
      if (this.peek() === '|') this.consume('|');
      return `\\left|${inner}\\right|`;
    }

    // 根号 √ ( sqrt )
    if (t === '√') {
      this.consume('√');
      // √x 或 √(x+1)
      const arg = this.parseRadicalArg();
      return `\\sqrt{${arg}}`;
    }

    // 三次根号 ∛
    if (t === '∛') {
      this.consume('∛');
      const arg = this.parseRadicalArg();
      return `\\sqrt[3]{${arg}}`;
    }

    // 无穷 ∞
    if (t === '∞') {
      this.consume('∞');
      return '\\infty';
    }

    // 积分 ∫
    if (t === '∫') {
      this.consume('∫');
      return '\\int';
    }

    // 求和 ∑
    if (t === '∑') {
      this.consume('∑');
      return '\\sum';
    }

    // 乘积 ∏
    if (t === '∏') {
      this.consume('∏');
      return '\\prod';
    }

    // 数字
    if (/^[0-9.]/.test(t)) {
      this.consume();
      return t;
    }

    // 标识符（变量 / 函数 / 希腊字母）
    if (/^[a-zA-Z_]/.test(t)) {
      this.consume();
      const name = t;

      // sum / prod / int / lim 大运算符（带上下限）
      if ((name === 'sum' || name === 'prod' || name === 'int' || name === 'lim') && this.peek() === '(') {
        return this.parseBigOperator(name);
      }

      // 函数调用（后面紧跟括号）
      const next = this.peek();
      if (next === '(') {
        return this.parseFunction(name);
      }

      // 希腊字母
      if (GREEK[name]) {
        return `\\${GREEK[name]} `;
      }

      // 特殊常量
      if (name === 'Infinity' || name === 'inf' || name === 'infty') {
        return '\\infty';
      }
      if (name === 'e' && !/[a-zA-Z0-9_]/.test(next || '')) {
        // 自然对数底 e，正体
        return '\\mathrm{e}';
      }
      if (name === 'i' && !/[a-zA-Z0-9_]/.test(next || '')) {
        return 'i';
      }

      // 普通变量
      return name;
    }

    // 未知 token，直接返回
    this.consume();
    return t;
  }

  /** 解析根号的参数（√x 或 √(...) 或 √[...]） */
  private parseRadicalArg(): string {
    const next = this.peek();
    if (next === '(') {
      this.consume('(');
      const inner = this.parseRelation();
      if (this.peek() === ')') this.consume(')');
      return inner;
    }
    if (next === '[') {
      this.consume('[');
      const inner = this.parseRelation();
      if (this.peek() === ']') this.consume(']');
      return inner;
    }
    // 单个因子
    return this.parseUnary();
  }

  /** 解析大运算符 sum/prod/int/lim（带上下限） */
  private parseBigOperator(name: string): string {
    // sum(expr, var, start, end)
    // int(expr, var, a, b)
    // lim(expr, var, a)
    // prod(expr, var, start, end)
    this.consume('(');

    // 收集参数
    const args: string[] = [];
    let parenDepth = 1;
    let argStart = this.pos;

    while (this.pos < this.tokens.length && parenDepth > 0) {
      const tk = this.tokens[this.pos];
      if (tk === '(') parenDepth++;
      else if (tk === ')') {
        parenDepth--;
        if (parenDepth === 0) break;
      } else if (tk === ',' && parenDepth === 1) {
        // 提取一个参数
        args.push(this.extractArg(argStart, this.pos));
        argStart = this.pos + 1;
      }
      this.pos++;
    }
    // 最后一个参数
    args.push(this.extractArg(argStart, this.pos));
    if (this.tokens[this.pos] === ')') this.pos++;

    const body = args[0] || '';
    const symbol = name === 'sum' ? '\\sum' : name === 'prod' ? '\\prod' : name === 'int' ? '\\int' : '\\lim';

    if (name === 'lim' && args.length >= 3) {
      // lim(f, x, a) → \lim_{x \to a} f
      const variable = args[1];
      const target = args[2];
      const subscript = `${variable} \\to ${target}`;
      return `${symbol}_{${subscript}} ${body}`;
    }
    if ((name === 'sum' || name === 'prod') && args.length >= 4) {
      // sum(f, k, a, b) → \sum_{k=a}^{b} f
      const variable = args[1];
      const lower = args[2];
      const upper = args[3];
      return `${symbol}_{${variable}=${lower}}^{${upper}} ${body}`;
    }
    if (name === 'int' && args.length >= 4) {
      // int(f, x, a, b) → \int_{a}^{b} f \, dx
      const variable = args[1];
      const lower = args[2];
      const upper = args[3];
      return `${symbol}_{${lower}}^{${upper}} ${body} \\, d${variable}`;
    }
    if (name === 'int' && args.length >= 2) {
      // 不定积分
      const variable = args[1];
      return `${symbol} ${body} \\, d${variable}`;
    }

    // 参数不够，降级为函数形式
    return `${symbol}\left(${args.join(', ')}\\right)`;
  }

  /** 从 token 区间提取参数并解析为 LaTeX */
  private extractArg(start: number, end: number): string {
    const savedTokens = this.tokens;
    // 临时截断 tokens
    const subTokens = savedTokens.slice(start, end);
    // 用子解析器
    const subParser = new LatexParser();
    const result = subParser.parseTokens(subTokens);
    return result || '';
  }

  /** 直接用 token 数组解析（供子解析器使用） */
  parseTokens(tokens: string[]): string {
    this.tokens = tokens;
    this.pos = 0;
    return this.parseRelation();
  }

  /** 从 tokens 解析矩阵 */
  private parseMatrixFromTokens(tokens: string[]): string {
    // tokens 是 [ 和 ] 之间的所有 token
    // 分号分隔行，逗号分列
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let depth = 0;
    let cellStart = 0;

    for (let i = 0; i <= tokens.length; i++) {
      const tk = tokens[i];
      if (tk === '(' || tk === '[' || tk === '{') depth++;
      else if (tk === ')' || tk === ']' || tk === '}') depth--;

      if (depth === 0 && (tk === ',' || tk === ';' || i === tokens.length)) {
        // 一个单元格
        const cellTokens = tokens.slice(cellStart, i);
        const subParser = new LatexParser();
        const cellLatex = subParser.parseTokens(cellTokens);
        currentRow.push(cellLatex || '');
        cellStart = i + 1;

        if (tk === ';' || i === tokens.length) {
          rows.push(currentRow);
          currentRow = [];
        }
      }
    }

    if (currentRow.length > 0) rows.push(currentRow);

    // 生成 bmatrix
    if (rows.length === 1 && rows[0].length === 1) {
      // 1x1 退化为普通括号
      return `\\left[${rows[0][0]}\\right]`;
    }
    const body = rows.map(row => row.join(' & ')).join(' \\\\ ');
    return `\\begin{bmatrix} ${body} \\end{bmatrix}`;
  }

  /** 从 tokens 解析分段函数 */
  private parsePiecewiseFromTokens(tokens: string[]): string {
    // 格式：{ expr1, cond1; expr2, cond2; ... }
    // 或     { cond1: expr1; cond2: expr2 }
    const cases: { expr: string; cond: string }[] = [];
    let depth = 0;

    // 先按分号切分每一段
    const pieces: string[][] = [];
    let currentPiece: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const tk = tokens[i];
      if (tk === '(' || tk === '[' || tk === '{') depth++;
      else if (tk === ')' || tk === ']' || tk === '}') depth--;

      if (depth === 0 && tk === ';') {
        pieces.push(currentPiece);
        currentPiece = [];
      } else {
        currentPiece.push(tk);
      }
    }
    if (currentPiece.length > 0) pieces.push(currentPiece);

    // 每一段内用逗号或冒号分表达式和条件
    for (const piece of pieces) {
      let splitIdx = -1;
      let splitChar = '';
      let d2 = 0;
      for (let i = 0; i < piece.length; i++) {
        const tk = piece[i];
        if (tk === '(' || tk === '[' || tk === '{') d2++;
        else if (tk === ')' || tk === ']' || tk === '}') d2--;
        if (d2 === 0 && (tk === ',' || tk === ':')) {
          splitIdx = i;
          splitChar = tk;
          break;
        }
      }

      if (splitIdx >= 0) {
        const leftTokens = piece.slice(0, splitIdx);
        const rightTokens = piece.slice(splitIdx + 1);
        const leftParser = new LatexParser();
        const rightParser = new LatexParser();
        const left = leftParser.parseTokens(leftTokens);
        const right = rightParser.parseTokens(rightTokens);
        // 冒号：左边条件，右边表达式；逗号：左边表达式，右边条件
        if (splitChar === ':') {
          cases.push({ expr: right, cond: left });
        } else {
          cases.push({ expr: left, cond: right });
        }
      } else {
        const parser = new LatexParser();
        const expr = parser.parseTokens(piece);
        cases.push({ expr, cond: '\\text{其他}' });
      }
    }

    if (cases.length === 0) return '';
    const body = cases.map(c => `${c.expr} &\\quad ${c.cond}`).join(' \\\\ ');
    return `\\begin{cases} ${body} \\end{cases}`;
  }

  /** 解析函数调用 */
  private parseFunction(name: string): string {
    // 支持 sqrt、abs 等特殊函数
    this.consume('(');

    // 收集参数（支持多参数函数，如 nthRoot(x, n)）

    // 简化：在当前位置收集到匹配的右括号
    // 我们用子解析器方式：收集 tokens 直到找到匹配的 )
    const startPos = this.pos;
    let parenDepth = 1;
    let commaSplits: number[] = []; // 逗号位置（顶层）

    while (this.pos < this.tokens.length && parenDepth > 0) {
      const tk = this.tokens[this.pos];
      if (tk === '(') parenDepth++;
      else if (tk === ')') {
        parenDepth--;
        if (parenDepth === 0) break;
      } else if (tk === ',' && parenDepth === 1) {
        commaSplits.push(this.pos);
      }
      this.pos++;
    }
    const endPos = this.pos; // 右括号位置
    if (this.tokens[this.pos] === ')') this.pos++; // 消费 )

    // 提取各参数并分别解析
    if (commaSplits.length === 0) {
      // 单参数
      const saved = this.pos;
      this.pos = startPos;
      const arg = this.parseRelation();
      this.pos = saved;
      return this.renderFunction(name, [arg]);
    } else {
      // 多参数
      const saved = this.pos;
      const argList: string[] = [];
      let segStart = startPos;
      for (const cp of commaSplits) {
        this.pos = segStart;
        // 我们直接从 segStart 解析到 cp
        const origTokens = this.tokens;
        this.tokens = origTokens.slice(0, cp);
        this.pos = segStart;
        const arg = this.parseRelation();
        argList.push(arg);
        this.tokens = origTokens;
        segStart = cp + 1;
      }
      // 最后一个参数
      this.pos = segStart;
      const origTokens = this.tokens;
      this.tokens = origTokens.slice(0, endPos);
      const lastArg = this.parseRelation();
      argList.push(lastArg);
      this.tokens = origTokens;
      this.pos = saved;
      return this.renderFunction(name, argList);
    }
  }

  /** 渲染函数调用为 LaTeX */
  private renderFunction(name: string, args: string[]): string {
    const arg = args[0] || '';

    // 特殊函数
    if (name === 'sqrt') {
      if (args.length === 2) {
        return `\\sqrt[${args[1]}]{${args[0]}}`;
      }
      return `\\sqrt{${arg}}`;
    }
    if (name === 'cbrt') {
      return `\\sqrt[3]{${arg}}`;
    }
    if (name === 'nthRoot' && args.length >= 2) {
      return `\\sqrt[${args[1]}]{${args[0]}}`;
    }
    if (name === 'abs') {
      return `\\left|${arg}\\right|`;
    }
    if (name === 'exp') {
      return `\\mathrm{e}^{${arg}}`;
    }
    if (name === 'ln') {
      return `\\ln\\left(${arg}\\right)`;
    }
    if (name === 'log') {
      if (args.length === 2) {
        return `\\log_{${args[1]}}\\left(${args[0]}\\right)`;
      }
      return `\\log\\left(${arg}\\right)`;
    }
    if (name === 'lg') {
      return `\\log_{10}\\left(${arg}\\right)`;
    }

    // 三角函数等标准运算符（正体）
    if (OPERATORS.has(name)) {
      return `\\${name}\\left(${arg}\\right)`;
    }

    // 其他：普通函数名（用罗马体）
    if (args.length === 1) {
      return `\\mathrm{${name}}\\left(${arg}\\right)`;
    }
    return `\\mathrm{${name}}\\left(${args.join(', ')}\\right)`;
  }

  /** 渲染显式乘法 */
  private renderMul(left: string, right: string): string {
    // 如果两边都是纯数字或数字+变量，用 \cdot
    return `${left} \\cdot ${right}`;
  }

  /** 渲染隐式乘法 */
  private renderImplicitMul(left: string, right: string): string {
    // 数字 * 变量/函数：省略乘号，直接拼接
    // 两个变量相乘：如 xy，保留写法
    return `${left}\\,${right}`; // 用小间距
  }

  /** 渲染幂运算 */
  private renderPower(base: string, exponent: string): string {
    // 1/2 次方 → 平方根（可选优化，这里先不做，保持幂形式更准确）
    return `{${base}}^{${exponent}}`;
  }
}

/**
 * 把 math.js 风格的表达式转成 LaTeX 字符串
 * @param expr math.js 表达式，如 "sin(x)/x", "x^2+1", "sqrt(x+1)"
 * @returns LaTeX 字符串，如 "\\frac{\\sin x}{x}"
 */
export function expressionToLatex(expr: string): string {
  if (!expr || !expr.trim()) return '';
  try {
    const parser = new LatexParser();
    const result = parser.parse(expr);
    // 后处理：± 符号（normalize 会把 ± 变成 +/-，解析后变成 + / -）
    let final = result.trim();
    final = final.replace(/\+\s*\/\s*-/g, '\\pm ');
    final = final.replace(/-\s*\/\s*\+/g, '\\mp ');
    return final;
  } catch {
    // 解析失败时返回原文
    return expr;
  }
}
