// EXPORTS: fetchAiQuestions, fetchAiHealth, type AiQuestion
// 前端调用后端的薄封装：统一超时、错误信息与类型

export interface AiQuestion {
  id: string;
  topic: string;
  difficulty: 'basic' | 'advanced' | 'competition';
  question: string;
  questionLatex: string;
  answer: string;
  answerDisplay?: string;
  answerType: 'numeric' | 'expression';
  steps: string[];
  fusion?: string[];
  validation: { latexOk: boolean; notationOk: boolean; issues: string[]; attempts: number };
}

export interface AiQuestionBatch {
  questions: AiQuestion[];
  model: string;
  mode: 'live' | 'mock';
  cached: number;
  generatedAt: string;
}

export interface AiHealth {
  ok: boolean;
  mode: 'live' | 'mock';
  model: string;
  provider: string;
}

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit, timeoutMs = 120000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(BASE + path, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) throw new Error(data.error ?? '请求失败（' + res.status + '）');
    return data;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw new Error('请求超时，模型响应太慢');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function fetchAiHealth(): Promise<AiHealth> {
  return request<AiHealth>('/health', { method: 'GET' }, 5000);
}

export function fetchAiQuestions(req: {
  topic: string;
  difficulty: 'basic' | 'advanced' | 'competition';
  count: number;
  fusion?: string[];
  style?: string;
}): Promise<AiQuestionBatch> {
  return request<AiQuestionBatch>('/ai/questions', { method: 'POST', body: JSON.stringify(req) });
}
