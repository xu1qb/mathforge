// EXPORTS: generateQuestions
// 生成流水线：提示词 → 模型（或带工具的 agent）→ 解析 → 形式校验 → 双解一致 → 定向修复重试 → 缓存

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

const PROMPT_VERSION = 7;

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

      let dualSolve: 'match' | 'judged' | 'mismatch' | 'skipped' = 'skipped';
      let secondAnswer: string | undefined;
      let method: string | undefined;
      if (config.dualSolve && llmMode() === 'live') {
        let second = await independentSolve(String(raw.questionLatex)).catch(() => null);
        // 独立求解没给出可比答案时再试一次；仍失败则视为不可验证
        if (!second) second = await independentSolve(String(raw.questionLatex)).catch(() => null);
        if (!second) {
          lastIssues.push('无法独立验证（独立求解未返回可比较的答案）：' + String(raw.questionLatex).slice(0, 60));
          continue;
        }
        if (second) {
          const eq = await answersEquivalent(String(raw.answer), second.answer);
          secondAnswer = second.answer;
          method = eq.method;
          dualSolve = eq.equal ? 'match' : 'mismatch';
          if (!eq.equal) {
            // 独立解也可能是错的（实测遇到过），所以再让模型复算一次做裁决
            const judged = await judgeAnswer(String(raw.questionLatex), String(raw.answer)).catch(() => null);
            if (judged && judged.correct && judged.computed) {
              const recheck = await answersEquivalent(String(raw.answer), judged.computed);
              if (recheck.equal) {
                dualSolve = 'judged';
              }
            }
            if (dualSolve !== 'judged') {
              lastIssues.push(
                '答案无法通过核验（题面：' + String(raw.questionLatex).slice(0, 60) +
                  '；你的答案 ' + String(raw.answer) + '，独立解 ' + second.answer + '）'
              );
              rejected.push({
                id: 'ai-rej-' + Date.now().toString(36),
                topic: req.topic,
                difficulty: req.difficulty,
                question: String(raw.question),
                questionLatex: String(raw.questionLatex),
                answer: String(raw.answer),
                answerType: 'numeric',
                steps: (raw.steps as string[]).map(String),
                validation: { latexOk: true, notationOk: true, issues: [lastIssues[lastIssues.length - 1]], attempts, dualSolve, secondAnswer: second.answer },
              });
              continue;
            }
          }
        }
      }

      // 新颖度：与已有题库/本地题型比对，挡住旧题换皮
      let novelty: 'novel' | 'similar' = 'novel';
      let noveltyScore = 0;
      // mock 模式不启用：固定样例必然与基线重复，否则永远出不了题
      if (config.noveltyFilter && llmMode() === 'live') {
        const nov = checkNovelty(String(raw.questionLatex), String(raw.answer));
        noveltyScore = Number(nov.similarity.toFixed(3));
        if (!nov.novel) {
          novelty = 'similar';
          lastIssues.push(
            '与已有题目高度相似（' + Math.round(nov.similarity * 100) + '%）：' +
              (nov.closest ?? '').slice(0, 60) + '。请换一种考法或结构。'
          );
          continue;
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
          novelty,
          noveltyScore,
        },
      });
    }

    if (accepted.length >= req.count) break;
    repairNotes = classifyIssues(lastIssues.length ? lastIssues : ['未产出合格题目']).repairs;
  }

  if (accepted.length === 0) {
    // 核验失败的候选也入库（rejected），让审核的人看到模型出了什么、为什么没过
    if (rejected.length > 0) {
      saveRejected(rejected, 'ai:unverified', '自动核验未通过：' + (lastIssues.slice(0, 3).join('；') || '未知'));
    }
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
