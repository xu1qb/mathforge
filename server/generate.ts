// EXPORTS: generateQuestions
// 生成流水线：提示词 → 模型（或 agent）→ 解析 → 形式校验 → 语义校验（按档位）→ 新颖度 → 入库
//
// 校验档位 verifyMode：
//   strict   语义校验失败就拒绝（最严，出题率最低）
//   balanced 失败也放行，但标记「未验证」，交给人工审核（默认）
//   off      只做形式校验（LaTeX / 书写规范）

import { config } from './config.ts';
import { chat, llmMode, type ChatMessage } from './llm.ts';
import { runAgent } from './agent.ts';
import { cacheKey, readCache, writeCache } from './cache.ts';
import { buildQuestionPrompt } from './prompts.ts';
import { parseModelJson, validateQuestion, type RawQuestion } from './validate.ts';
import { answersEquivalent } from './verify.ts';
import { independentSolve, judgeAnswer } from './solve.ts';
import { classifyIssues } from './feedback.ts';
import { checkNovelty } from './novelty.ts';
import { saveRejected } from './store.ts';
import type { AiQuestion, AiQuestionBatch, AiQuestionRequest } from './types.ts';

const PROMPT_VERSION = 8;

type VerifyMode = 'strict' | 'balanced' | 'off';

function normalize(req: AiQuestionRequest): Required<AiQuestionRequest> {
  return {
    topic: (req.topic ?? '').trim() || '综合',
    difficulty: req.difficulty ?? 'basic',
    count: Math.min(Math.max(req.count ?? 3, 1), 10),
    fusion: Array.isArray(req.fusion) ? req.fusion.filter(Boolean).slice(0, 3) : [],
    style: (req.style ?? '').trim(),
    verifyMode: req.verifyMode,
  };
}

export interface GenerateOptions {
  /** 进度回调：预生成池与 SSE 流式接口用它把阶段推给前端 */
  onProgress?: (stage: string, detail?: string) => void;
}

export async function generateQuestions(
  input: AiQuestionRequest,
  options: GenerateOptions = {}
): Promise<AiQuestionBatch> {
  const notify = options.onProgress ?? (() => {});
  const req = normalize(input);
  notify('参数', req.topic + ' · ' + req.difficulty + ' · ' + req.count + ' 道');
  const verifyMode: VerifyMode = (input.verifyMode ?? config.verifyMode) as VerifyMode;
  const useAgent = config.agentMode && llmMode() === 'live';
  const key = cacheKey({
    req,
    seed: input.seed ?? '',
    model: config.model,
    provider: config.provider,
    v: PROMPT_VERSION,
    agent: useAgent,
    verifyMode,
  });

  const cached = readCache<AiQuestionBatch>(key);
  if (cached) {
    notify('缓存', '命中缓存，直接返回 ' + cached.questions.length + ' 道');
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
  const rejected: AiQuestion[] = [];
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

    notify('模型', '第 ' + attempts + ' 次调用模型');
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
      notify('解析', 'JSON 解析失败，准备重试');
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
        notify('校验', '有 ' + v.issues.length + ' 处不合格');
        lastIssues.push(...v.issues);
        continue;
      }

      const latex = String(raw.questionLatex);
      const answer = String(raw.answer);
      const duplicate = accepted.some((x) => x.questionLatex === latex);
      if (duplicate) continue;

      let dualSolve: 'match' | 'judged' | 'mismatch' | 'skipped' = 'skipped';
      let secondAnswer: string | undefined;
      let method: string | undefined;
      let unverified = false;
      let unverifiedReason: string | undefined;

      // ---------- 语义校验 ----------
      if (verifyMode !== 'off' && config.dualSolve && llmMode() === 'live') {
        let second = await independentSolve(latex).catch(() => null);
        if (!second) second = await independentSolve(latex).catch(() => null);

        if (!second) {
          const reason = '独立求解未返回可比较的答案';
          if (verifyMode === 'strict') {
            lastIssues.push('无法独立验证（' + reason + '）：' + latex.slice(0, 60));
            continue;
          }
          unverified = true;
          unverifiedReason = reason;
        } else {
          secondAnswer = second.answer;
          const eq = await answersEquivalent(answer, second.answer);
          method = eq.method;
          dualSolve = eq.equal ? 'match' : 'mismatch';

          if (!eq.equal) {
            const judged = await judgeAnswer(latex, answer).catch(() => null);
            if (judged?.correct && judged.computed) {
              const recheck = await answersEquivalent(answer, judged.computed);
              if (recheck.equal) dualSolve = 'judged';
            }

            if (dualSolve !== 'judged') {
              const reason = '答案未通过核验（你的答案 ' + answer + '，独立解 ' + second.answer + '）';
              if (verifyMode === 'strict') {
                lastIssues.push('答案无法通过核验：' + latex.slice(0, 60) + '；' + reason);
                rejected.push({
                  id: 'ai-rej-' + Date.now().toString(36),
                  topic: req.topic,
                  difficulty: req.difficulty,
                  question: String(raw.question),
                  questionLatex: latex,
                  answer,
                  answerType: 'numeric',
                  steps: (raw.steps as string[]).map(String),
                  validation: {
                    latexOk: true,
                    notationOk: true,
                    issues: [reason],
                    attempts,
                    dualSolve,
                    secondAnswer: second.answer,
                    verifyMode,
                  },
                });
                continue;
              }
              unverified = true;
              unverifiedReason = reason;
            }
          }
        }
      }

      // ---------- 新颖度 ----------
      let novelty: 'novel' | 'similar' = 'novel';
      let noveltyScore = 0;
      if (config.noveltyFilter && llmMode() === 'live') {
        const nov = checkNovelty(latex, answer);
        noveltyScore = Number(nov.similarity.toFixed(3));
        if (!nov.novel) {
          novelty = 'similar';
          if (verifyMode === 'strict') {
            lastIssues.push(
              '与已有题目高度相似（' + Math.round(nov.similarity * 100) + '%）：' +
                (nov.closest ?? '').slice(0, 60) + '。请换一种考法或结构。'
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
        questionLatex: latex,
        answer,
        answerDisplay: answer,
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
          novelty,
          noveltyScore,
          verifyMode,
          unverified,
          unverifiedReason,
        },
      });
    }

    if (accepted.length >= req.count) break;
    repairNotes = classifyIssues(lastIssues.length ? lastIssues : ['未产出合格题目']).repairs;
  }

  if (accepted.length === 0) {
    if (rejected.length > 0) {
      saveRejected(rejected, 'ai:unverified', '自动核验未通过：' + (lastIssues.slice(0, 3).join('；') || '未知'));
    }
    throw new Error(
      '模型连续 ' + attempts + ' 次没有产出合格题目：' + (lastIssues.slice(0, 5).join('；') || '未知原因')
    );
  }

  notify('完成', accepted.length + ' 道通过校验');
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
