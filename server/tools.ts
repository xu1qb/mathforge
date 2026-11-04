// EXPORTS: TOOL_DEFS, executeTool
// 给模型用的验证工具：只做「确定性计算」，不含生成逻辑，避免模型自证

import katex from 'katex';
import { answersEquivalent } from './verify.ts';

export interface ToolDef {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export const TOOL_DEFS: ToolDef[] = [
  {
    type: 'function',
    function: {
      name: 'check_equivalent',
      description: '判断两个数学答案是否等价（支持分数、根式、代数式）。用于核对自己的答案与另一种解法是否一致。',
      parameters: {
        type: 'object',
        properties: {
          a: { type: 'string', description: '第一个答案，可用 LaTeX 或普通写法' },
          b: { type: 'string', description: '第二个答案' },
        },
        required: ['a', 'b'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_latex',
      description: '检查一段 LaTeX 能否被 KaTeX 渲染，并报告书写规范问题（x^2、sqrt()、* 等）。',
      parameters: {
        type: 'object',
        properties: { latex: { type: 'string', description: '要检查的 LaTeX' } },
        required: ['latex'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'evaluate_number',
      description: '把数学表达式求值成小数，用于数值核对（例如 sqrt(2)≈1.414）。',
      parameters: {
        type: 'object',
        properties: { expr: { type: 'string', description: '要求值的表达式' } },
        required: ['expr'],
      },
    },
  },
];

const NOTATION: Array<{ name: string; re: RegExp }> = [
  { name: '幂次未加花括号', re: /\^[^{\s\\]/ },
  { name: 'sqrt() 写法', re: /sqrt\(/ },
  { name: '用 * 当乘号', re: /\*/ },
  { name: '用了 <=/>=/!=', re: /<=|>=|!=/ },
];

export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  if (name === 'check_equivalent') {
    const r = await answersEquivalent(String(args.a ?? ''), String(args.b ?? ''));
    return JSON.stringify({ equal: r.equal, method: r.method });
  }
  if (name === 'check_latex') {
    const latex = String(args.latex ?? '');
    try {
      katex.renderToString(latex, { displayMode: true, throwOnError: true, strict: 'error' });
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message.slice(0, 120) : '渲染失败' });
    }
    const issues = NOTATION.filter((n) => n.re.test(latex)).map((n) => n.name);
    return JSON.stringify({ ok: issues.length === 0, issues });
  }
  if (name === 'evaluate_number') {
    const expr = String(args.expr ?? '');
    const num = Number(expr);
    if (Number.isFinite(num)) return JSON.stringify({ value: num });
    return JSON.stringify({ error: '只能直接数值化简单表达式；复杂式请用 check_equivalent' });
  }
  return JSON.stringify({ error: '未知工具：' + name });
}
