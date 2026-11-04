// EXPORTS: runAgent
// C2：带工具的自主循环。模型可以主动核对答案、检查 LaTeX，再决定是否提交。

import { chatWithTools, type ChatMessage, type ToolCall } from './llm.ts';
import { TOOL_DEFS, executeTool } from './tools.ts';
import { config } from './config.ts';

export interface AgentResult {
  content: string;
  rounds: number;
  toolCalls: Array<{ name: string; args: string; result: string }>;
}

/** 把工具调用结果回填成 OpenAI 兼容的 messages 结构 */
function toolMessage(call: ToolCall, result: string): ChatMessage & { tool_call_id: string } {
  return { role: 'tool' as unknown as ChatMessage['role'], content: result, tool_call_id: call.id } as never;
}

export async function runAgent(system: string, user: string): Promise<AgentResult> {
  const messages: Array<ChatMessage & { tool_call_id?: string }> = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  const trace: AgentResult['toolCalls'] = [];

  for (let round = 1; round <= config.agentMaxRounds; round++) {
    const reply = await chatWithTools(messages as ChatMessage[], TOOL_DEFS);

    if (!reply.toolCalls.length) {
      return { content: reply.content, rounds: round, toolCalls: trace };
    }

    // assistant 发起工具调用
    messages.push({
      role: 'assistant',
      content: reply.content,
      tool_calls: reply.toolCalls.map((t) => ({ id: t.id, type: 'function', function: { name: t.name, arguments: t.arguments } })),
    } as never);

    for (const call of reply.toolCalls) {
      let result: string;
      try {
        const args = JSON.parse(call.arguments || '{}') as Record<string, unknown>;
        result = await executeTool(call.name, args);
      } catch (err) {
        result = JSON.stringify({ error: err instanceof Error ? err.message : '工具执行失败' });
      }
      trace.push({ name: call.name, args: call.arguments, result });
      messages.push(toolMessage(call, result));
    }
  }

  // 超过轮数上限：要求模型停止调工具，直接给结果
  messages.push({ role: 'user', content: '已达到工具调用上限。请不要再调用工具，直接输出最终 JSON。' });
  const finalReply = await chatWithTools(messages as ChatMessage[], []);
  return { content: finalReply.content, rounds: config.agentMaxRounds + 1, toolCalls: trace };
}
