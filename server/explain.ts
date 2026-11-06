// EXPORTS: generateExplainer, validateExplainerDraft
// 讲解草稿生成：提示词 → 模型（或 mock）→ JSON 解析 → 结构校验
// 只产出草稿，不直接写进 src/data/explainers.ts——落盘前必须人工过一遍。
import { config } from './config.ts';
import { chat, llmMode } from './llm.ts';
import { buildExplainerPrompt } from './prompts.ts';
import { parseModelJson } from './validate.ts';

export type ExplainLevel = '基础' | '进阶' | '竞赛';

export interface ExplainerStep {
  title: string;
  body: string;
  formula?: string;
}

export interface ExplainerDraft {
  title: string;
  essence: string;
  steps: ExplainerStep[];
  example: { problem: string; walkthrough: string[]; result: string };
  pitfalls: string[];
}

export interface ExplainerResult {
  draft: ExplainerDraft;
  mode: 'live' | 'mock';
  model: string;
  /** 结构校验的软提示（如公式里带中文） */
  issues: string[];
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** KaTeX 数学模式里直接写中文会渲染成豆腐块，这里只做提示不拦截 */
function mathHasCjk(latex: string): boolean {
  return /[一-龥]/.test(latex.replace(/\\text\{[^}]*\}/g, ''));
}

/**
 * 校验模型返回的讲解草稿：字段齐全、步骤 ≥3、例子完整、易错点 ≥2。
 * 不合格时 draft 为 null，并给出具体问题，调用方据此决定重试或报错。
 */
export function validateExplainerDraft(raw: unknown): { draft: ExplainerDraft | null; issues: string[] } {
  const issues: string[] = [];
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const title = asString(obj.title);
  const essence = asString(obj.essence);
  if (!title) issues.push('缺少 title');
  if (!essence) issues.push('缺少 essence');

  const stepsRaw = Array.isArray(obj.steps) ? obj.steps : [];
  const steps: ExplainerStep[] = [];
  for (const item of stepsRaw) {
    const s = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const stepTitle = asString(s.title);
    const body = asString(s.body);
    if (!stepTitle || !body) continue;
    const formula = asString(s.formula);
    steps.push(formula ? { title: stepTitle, body, formula } : { title: stepTitle, body });
  }
  if (steps.length < 3) issues.push('steps 少于 3 步');

  const exRaw = (obj.example && typeof obj.example === 'object' ? obj.example : {}) as Record<string, unknown>;
  const problem = asString(exRaw.problem);
  const walkthrough = (Array.isArray(exRaw.walkthrough) ? exRaw.walkthrough : []).map(asString).filter(Boolean);
  const result = asString(exRaw.result);
  if (!problem) issues.push('example 缺少 problem');
  if (walkthrough.length === 0) issues.push('example 缺少 walkthrough');
  if (!result) issues.push('example 缺少 result');

  const pitfalls = (Array.isArray(obj.pitfalls) ? obj.pitfalls : []).map(asString).filter(Boolean);
  if (pitfalls.length < 2) issues.push('pitfalls 少于 2 条');

  for (const step of steps) {
    if (step.formula && mathHasCjk(step.formula)) {
      issues.push('公式的数学模式里出现了中文，请移到 body 或用 \\text{}');
      break;
    }
  }

  const blocking = issues.filter((i) => !i.includes('公式的数学模式'));
  if (blocking.length > 0) return { draft: null, issues };
  return {
    draft: { title, essence, steps, example: { problem, walkthrough, result }, pitfalls },
    issues,
  };
}

/** 生成一篇讲解草稿（不落盘） */
export async function generateExplainer(topic: string, level: ExplainLevel = '基础'): Promise<ExplainerResult> {
  const clean = topic.trim();
  if (!clean) throw new Error('缺少 topic');

  const { system, user } = buildExplainerPrompt(clean, level);
  let reply: string;
  try {
    reply = await chat([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]);
  } catch (err) {
    throw new Error('模型调用失败：' + (err instanceof Error ? err.message : String(err)));
  }

  let parsed: unknown;
  try {
    parsed = parseModelJson(reply);
  } catch (err) {
    throw new Error('模型回复不是合法 JSON：' + (err instanceof Error ? err.message : String(err)));
  }

  const { draft, issues } = validateExplainerDraft(parsed);
  if (!draft) throw new Error('讲解草稿结构不合格：' + issues.join('；'));

  return { draft, mode: llmMode(), model: config.model, issues };
}
