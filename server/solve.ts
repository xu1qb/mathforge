// EXPORTS: independentSolve
// 独立求解：只给题干，不给答案，让模型再解一遍，用于「双解一致」校验

import { chat, type ChatMessage } from './llm.ts';



export interface IndependentResult {
  answer: string;
  steps: string[];
}

export interface JudgeResult {
  correct: boolean;
  computed: string;
}

/** 裁决：给定题面与一个待检验答案，模型必须重新计算后判断对错（不锚定原答案的推导过程） */
export async function judgeAnswer(questionLatex: string, claimed: string): Promise<JudgeResult | null> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        '你是核验员。必须自己从头计算，不要默认给定答案正确。' +
        '只输出 JSON：{"computed":"你算出的答案","correct":true|false}，不要解释。',
    },
    {
      role: 'user',
      content: '题目：' + questionLatex + '\n待检验答案：' + claimed + '\n请独立计算后判断该答案是否正确。',
    },
  ];
  const reply = await chat(messages);
  const start = reply.indexOf('{');
  const end = reply.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(reply.slice(start, end + 1)) as { correct?: unknown; computed?: unknown };
    return {
      correct: parsed.correct === true,
      computed: typeof parsed.computed === 'string' ? parsed.computed.trim() : '',
    };
  } catch {
    return null;
  }
}

export async function independentSolve(questionLatex: string): Promise<IndependentResult | null> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        '你是解题者。只能看到题目，不要臆测出题人的答案。' +
        '只输出 JSON：{"answer":"数值或最简表达式","steps":["步骤1","步骤2"]}，不要任何解释。',
    },
    { role: 'user', content: '题目：' + questionLatex },
  ];
  const reply = await chat(messages);
  const start = reply.indexOf('{');
  const end = reply.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(reply.slice(start, end + 1)) as { answer?: unknown; steps?: unknown };
    if (typeof parsed.answer !== 'string' || !parsed.answer.trim()) return null;
    return {
      answer: parsed.answer.trim(),
      steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : [],
    };
  } catch {
    return null;
  }
}
