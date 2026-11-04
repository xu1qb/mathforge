// EXPORTS: generateQuestions
// 生成流水线：提示词 → 模型（或带工具的 agent）→ 解析 → 形式校验 → 双解一致 → 定向修复重试 → 缓存

import { config } from './config.ts';
import { chat, llmMode, type ChatMessage } from './llm.ts';
import { runAgent } from './agent.ts';
import { cacheKey, readCache, writeCache } from './cache.ts';
import { buildQuestionPrompt } from './prompts.ts';
import { parseModelJson, validateQuestion, type RawQuestion } from './validate.ts';
import { answersEquivalent } from './verify.ts';
import { independentSolve } from './solve.ts';
import { classifyIssues } from './feedback.ts';
import type { AiQuestion, AiQuestionBatch, AiQuestionRequest } from './types.ts';

const PROMPT_VERSION = 4;

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
  const useAgent = config.agentMode && llmMode() === 'live';
  const key = cacheKey({ req, model: config.model, provider: config.provider, v: PROMPT_VERSION, agent: useAgent });

  const cached = readCache<AiQuestionBatch>(key);
  if (cached) {
    return { ...cached, cached: cached.questions.length, generatedAt: new Date().toISOString() };
  }

  const { system: baseSystem, user } = buildQuestionPrompt(req);
  const system = useAgent
    ? baseSystem +
      '\n\n你可以调用工具。提交前请务必：\n' +
      '1) 用 check_latex 检查最终 LaTeX 能否渲染；\n' +
      '2) 对自己的答案做一次独立验算，必要时用 check_equivalent 对比另一种解法得到的答案；\n' +
      '3) 只有工具确认无误后再输出最终 JSON。'
    : baseSystem;
  const accepted: AiQuestion[] = [];
  let repairNotes: string[] = [];
  let totalToolCalls = 0;
  let attempts = 0;
  let lastIssues: string[] = [];

  for (let i = 0; i <= config.maxRetries; i++) {
    attempts = i + 1;
    const prompt =
      repairNotes.length > 0
        ? user + '\n\n上一版存在这些问题，请逐条修正：\n- ' + repairNotes.join('\n- ')
        : user;

    let reply: string;
    if (useAgent) {
      const agentResult = await runAgent(system, prompt);
      reply = agentResult.content;
      totalToolCalls += agentResult.toolCalls.length;
    } else {
      const messages: ChatMessage[] = [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ];
      reply = await chat(messages);
    }

    let parsed: unknown;
    try {
      parsed = parseModelJson(reply);
    } catch (err) {
      lastIssues = ['JSON 解析失败：' + (err instanceof Error ? err.message : '未知')];
      repairNotes = classifyIssues(lastIssues).repairs;
      continue;
    }

    const list = (parsed as { questions?: RawQuestion[] }).questions;
    if (!Array.isArray(list) || list.length === 0) {
      lastIssues = ['返回里没有 questions 数组'];
      repairNotes = classifyIssues(lastIssues).repairs;
      continue;
    }

    lastIssues = [];
    for (const raw of list.slice(0, req.count)) {
      const v = validateQuestion(raw);
      if (!v.ok) {
        lastIssues.push(...v.issues);
        continue;
      }

      const duplicate = accepted.some((x) => x.questionLatex === String(raw.questionLatex));
      if (duplicate) continue;

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
            lastIssues.push(
              '答案与独立求解不一致（题面：' + String(raw.questionLatex).slice(0, 60) +
                '；你的答案 ' + String(raw.answer) + '，独立解 ' + second.answer + '）'
            );
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
        validation: {
          latexOk: v.latexOk,
          notationOk: v.notationOk,
          issues: [],
          attempts,
          dualSolve,
          secondAnswer,
          method,
        },
      });
    }

    if (accepted.length >= req.count) break;
    repairNotes = classifyIssues(lastIssues.length ? lastIssues : ['未产出合格题目']).repairs;
  }

  if (accepted.length === 0) {
    throw new Error(
      '模型连续 ' + attempts + ' 次没有产出合格题目：' + (lastIssues.slice(0, 5).join('；') || '未知原因')
    );
  }

  const batch: AiQuestionBatch = {
    questions: accepted.slice(0, req.count),
    model: config.model,
    mode: llmMode(),
    cached: 0,
    generatedAt: new Date().toISOString(),
    agent: useAgent,
    toolCalls: totalToolCalls,
  };
  writeCache(key, batch);
  return batch;
}
