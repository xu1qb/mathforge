// EXPORTS: chat, llmMode
// 模型调用层：只依赖 fetch，兼容任何 OpenAI 风格的 /chat/completions
// 没有配置 API Key 时自动进入 mock 模式，保证本地端到端可测

import { config } from './config.ts';

export type Role = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: Role;
  content: string;
}

export function llmMode(): 'live' | 'mock' {
  return config.provider === 'mock' ? 'mock' : 'live';
}

/** mock 模式返回可被校验器接受的固定题，用于离线联调 */
function mockReply(messages: ChatMessage[]): string {
  const user = messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n');
  const topic = (user.match(/知识点：(.+)/) ?? [])[1]?.trim() ?? '综合';
  const count = Math.min(Math.max(Number((user.match(/请出 (\\d+) 道题/) ?? [])[1] ?? 3), 1), 10);
  const k = 2 + Math.floor(Math.random() * 7);
  const questions = Array.from({ length: count }, (_, i) => {
    const a = k + i;
    return {
      question: '求极限 lim(x→0) sin(' + a + 'x)/x',
      questionLatex: '\\lim_{x \\to 0} \\dfrac{\\sin ' + a + 'x}{x}',
      answer: String(a),
      answerType: 'numeric',
      steps: ['重要极限 sin(ax)/x → a', '这里 a = ' + a + '，所以极限为 ' + a],
      fusion: [topic],
    };
  });
  return JSON.stringify({ questions });
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface ToolReply {
  content: string;
  toolCalls: ToolCall[];
}

/** 带工具调用的一轮对话：返回文本或工具调用请求 */
export async function chatWithTools(messages: ChatMessage[], tools: unknown[]): Promise<ToolReply> {
  if (config.provider === 'mock') return { content: mockReply(messages), toolCalls: [] };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const res = await fetch(config.baseUrl + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + config.apiKey },
      body: JSON.stringify({ model: config.model, messages, tools, tool_choice: 'auto', temperature: 0.7, max_tokens: 4000 }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error('模型接口返回 ' + res.status + '：' + text.slice(0, 200));
    }
    const data = (await res.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
          tool_calls?: Array<{ id?: string; function?: { name?: string; arguments?: string } }>;
        };
      }>;
    };
    const msg = data.choices?.[0]?.message;
    const toolCalls = (msg?.tool_calls ?? []).map((t, i) => ({
      id: t.id ?? 'call_' + i,
      name: t.function?.name ?? '',
      arguments: t.function?.arguments ?? '{}',
    }));
    return { content: msg?.content ?? '', toolCalls };
  } finally {
    clearTimeout(timer);
  }
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  if (config.provider === 'mock') return mockReply(messages);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const res = await fetch(config.baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + config.apiKey,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.8,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error('模型接口返回 ' + res.status + '：' + text.slice(0, 200));
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('模型返回为空');
    return content;
  } finally {
    clearTimeout(timer);
  }
}
