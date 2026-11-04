// EXPORTS: independentSolve
// 独立求解：只给题干，不给答案，让模型再解一遍，用于「双解一致」校验

import { chat, type ChatMessage } from './llm.ts';

export interface IndependentResult {
  answer: string;
  steps: string[];
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
