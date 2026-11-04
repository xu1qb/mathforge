// EXPORTS: validateQuestion, parseModelJson
// 服务端校验：模型输出必须过三关——结构完整、LaTeX 能渲染、书写规范

import katex from 'katex';

export interface RawQuestion {
  question?: unknown;
  questionLatex?: unknown;
  answer?: unknown;
  answerType?: unknown;
  steps?: unknown;
  fusion?: unknown;
}

export interface ValidationResult {
  ok: boolean;
  issues: string[];
  latexOk: boolean;
  notationOk: boolean;
}

const NOTATION_CHECKS: Array<{ name: string; re: RegExp }> = [
  { name: '幂次未加花括号（x^2）', re: /\^[^{\s\\]/ },
  { name: '用了 sqrt() 而非 \sqrt{}', re: /sqrt\(/ },
  { name: '用 * 当乘号', re: /\*/ },
  { name: '用了 <= / >= / !=', re: /<=|>=|!=/ },
  { name: '用了 ->', re: /->/ },
  { name: '裸 pi', re: /(^|[^a-zA-Z\\])pi([^a-zA-Z]|$)/ },
  { name: '用了 $$ 包裹', re: /\$\$/ },
  { name: '出现了省略号 ...', re: /\.\.\./ },
];

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export function validateQuestion(q: RawQuestion): ValidationResult {
  const issues: string[] = [];
  const latex = asString(q.questionLatex);
  const question = asString(q.question);
  const answer = asString(q.answer);
  const steps = Array.isArray(q.steps) ? q.steps.map((s) => String(s ?? '')) : [];

  if (!question) issues.push('缺少题干 question');
  if (!latex) issues.push('缺少 questionLatex');
  if (!answer) issues.push('缺少 answer');
  if (steps.length < 2) issues.push('解答步骤少于 2 步');
  if (steps.some((s) => !s.trim())) issues.push('存在空白步骤');

  let latexOk = true;
  if (latex) {
    try {
      katex.renderToString(latex, { displayMode: true, throwOnError: true, strict: 'error' });
    } catch (err) {
      latexOk = false;
      issues.push('LaTeX 无法渲染：' + (err instanceof Error ? err.message.slice(0, 80) : '未知错误'));
    }
  }

  let notationOk = true;
  if (latex) {
    for (const c of NOTATION_CHECKS) {
      if (c.re.test(latex)) {
        notationOk = false;
        issues.push('书写不规范：' + c.name);
      }
    }
  }

  return { ok: issues.length === 0, issues, latexOk, notationOk };
}

/** 从模型回复里抠出 JSON（容忍代码块围栏与前后废话） */
export function parseModelJson(text: string): unknown {
  const raw = text.trim();
  const fence = String.fromCharCode(96).repeat(3);
  let candidate = raw;
  if (raw.includes(fence)) {
    const parts = raw.split(fence);
    if (parts.length >= 3) candidate = parts[1];
  }
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('模型回复里没有 JSON 对象');
  return JSON.parse(candidate.slice(start, end + 1));
}
