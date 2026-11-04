// EXPORTS: generateQuestions
// 生成流水线：提示词 → 模型 → 解析 → 校验 → 不合格就带反馈重试 → 缓存

import { config } from './config.ts';
import { chat, llmMode, type ChatMessage } from './llm.ts';
import { cacheKey, readCache, writeCache } from './cache.ts';
import { buildQuestionPrompt } from './prompts.ts';
import { parseModelJson, validateQuestion, type RawQuestion } from './validate.ts';
import { answersEquivalent } from './verify.ts';
import { independentSolve } from './solve.ts';
import type { AiQuestion, AiQuestionBatch, AiQuestionRequest } from './types.ts';

const PROMPT_VERSION = 3;

function normalize(req: AiQuestionRequest): Required<AiQuestionRequest> {
  return {
    topic: (req.topic ?? '').trim() || '综合',
    difficulty: req.difficulty ?? 'basic',
    count: Math.min(Math.max(req.count ?? 3, 1), 10),
    fusion: Array.isArray(req.fusion) ? req.fusion.filter(Boolean).slice(0, 3) : [],
    style: (req.style ?? '').trim(),
  };
}

export async function generateQuestions(input: AiQuestionRequest): Promise<AiQuestionBatch> {
  const req = normalize(input);
  const key = cacheKey({ req, model: config.model, provider: config.provider, v: PROMPT_VERSION });

  const cached = readCache<AiQuestionBatch>(key);
  if (cached) {
    return { ...cached, cached: cached.questions.length, generatedAt: new Date().toISOString() };
  }

  const { system, user } = buildQuestionPrompt(req);
  const messages: ChatMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  const accepted: AiQuestion[] = [];
  let lastIssues: string[] = [];
  let attempts = 0;

  for (let i = 0; i <= config.maxRetries; i++) {
    attempts = i + 1;
    const reply = await chat(messages);
    let parsed: unknown;
    try {
      parsed = parseModelJson(reply);
    } catch (err) {
      lastIssues = ['JSON 解析失败：' + (err instanceof Error ? err.message : '未知')];
      messages.push({ role: 'assistant', content: reply.slice(0, 500) });
      messages.push({ role: 'user', content: '上面不是合法 JSON。请只输出 JSON 对象，不要解释。' });
      continue;
    }

    const list = (parsed as { questions?: RawQuestion[] }).questions;
    if (!Array.isArray(list) || list.length === 0) {
      lastIssues = ['返回里没有 questions 数组'];
      continue;
    }

    for (const raw of list.slice(0, req.count)) {
      const v = validateQuestion(raw);
      if (!v.ok) {
        lastIssues.push(...v.issues);
        continue;
      }
      // 重试时模型可能重复给出同一道题，按题干去重
      const duplicate = accepted.some((x) => x.questionLatex === String(raw.questionLatex));
      if (duplicate) continue;

      // 双解一致：模型独立再解一遍，答案必须与原答案等价（mock 模式跳过）
      let dualSolve: 'match' | 'mismatch' | 'skipped' = 'skipped';
      let secondAnswer: string | undefined;
      let method: string | undefined;
      if (config.dualSolve && llmMode() === 'live') {
        const second = await independentSolve(String(raw.questionLatex)).catch(() => null);
        if (second) {
          const eq = await answersEquivalent(String(raw.answer), second.answer);
          secondAnswer = second.answer;
          method = eq.method;
          dualSolve = eq.equal ? 'match' : 'mismatch';
          if (!eq.equal) {
            lastIssues.push('答案与独立求解不一致（独立解为 ' + second.answer + '）');
            continue;
          }
        }
      }
      accepted.push({
        id: 'ai-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
        topic: req.topic,
        difficulty: req.difficulty,
        question: String(raw.question),
        questionLatex: String(raw.questionLatex),
        answer: String(raw.answer),
        answerDisplay: typeof raw.answer === 'string' ? raw.answer : undefined,
        answerType: raw.answerType === 'expression' ? 'expression' : 'numeric',
        steps: (raw.steps as string[]).map(String),
        fusion: Array.isArray(raw.fusion) ? raw.fusion.map(String) : undefined,
        validation: { latexOk: v.latexOk, notationOk: v.notationOk, issues: [], attempts, dualSolve, secondAnswer, method },
      });
    }

    if (accepted.length >= req.count) break;

    // 把失败原因反馈给模型，让它修正后重出
    messages.push({ role: 'assistant', content: JSON.stringify({ questions: list }) });
    messages.push({
      role: 'user',
      content:
        '以上题目有这些问题：' + lastIssues.slice(0, 8).join('；') +
        '。请修正后重新输出完整的 JSON，仍然只要 JSON。',
    });
    lastIssues = [];
  }

  if (accepted.length === 0) {
    throw new Error('模型连续 ' + attempts + ' 次没有产出合格题目：' + (lastIssues.slice(0, 5).join('；') || '未知原因'));
  }

  const batch: AiQuestionBatch = {
    questions: accepted.slice(0, req.count),
    model: config.model,
    mode: llmMode(),
    cached: 0,
    generatedAt: new Date().toISOString(),
  };
  writeCache(key, batch);
  return batch;
}
