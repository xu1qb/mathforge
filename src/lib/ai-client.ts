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
  /** 入库状态：approved 可直接练习，pending 待人工审核 */
  status?: 'pending' | 'approved' | 'rejected';
  note?: string;
  validation: {
    latexOk: boolean;
    notationOk: boolean;
    issues: string[];
    attempts: number;
    dualSolve?: 'match' | 'judged' | 'mismatch' | 'skipped';
    secondAnswer?: string;
    method?: string;
    novelty?: 'novel' | 'similar';
    noveltyScore?: number;
    verifyMode?: 'strict' | 'balanced' | 'off';
    unverified?: boolean;
    unverifiedReason?: string;
  };
}

export interface AiQuestionBatch {
  questions: AiQuestion[];
  model: string;
  mode: 'live' | 'mock';
  cached: number;
  generatedAt: string;
  agent?: boolean;
  toolCalls?: number;
  /** 本批是否因机器验证通过而自动入库 */
  autoApproved?: boolean;
}

export interface AiHealth {
  ok: boolean;
  mode: 'live' | 'mock';
  model: string;
  provider: string;
}

import { Capacitor, CapacitorHttp } from '@capacitor/core';

export const API_BASE_KEY = 'mf_api_base';

export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

/** 桌面端由 Electron 注入；安卓端由用户填局域网地址；网页端走 Vite 代理 */
function resolveBase(): string {
  if (typeof window === 'undefined') return '/api';
  const saved = localStorage.getItem(API_BASE_KEY);
  if (saved) return saved.replace(/\/$/, '');
  const fromQuery = new URLSearchParams(window.location.search).get('api');
  if (fromQuery) return fromQuery.replace(/\/$/, '');
  const desktop = (window as unknown as { mfDesktop?: { apiBase?: string } }).mfDesktop;
  if (desktop?.apiBase) return desktop.apiBase.replace(/\/$/, '');
  if (isNativeApp()) return 'http://10.0.2.2:8787/api';
  return '/api';
}

export function setApiBase(url: string): void {
  localStorage.setItem(API_BASE_KEY, url.replace(/\/$/, ''));
}

export function getApiBase(): string {
  return resolveBase();
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 120000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = resolveBase() + path;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((init?.headers as Record<string, string> | undefined) ?? {}),
    };

    // 安卓 WebView 里 fetch 会被 CORS 拦，改用原生 HTTP
    if (isNativeApp()) {
      const res = await CapacitorHttp.request({
        url,
        method: (init?.method ?? 'GET') as string,
        headers,
        data: init?.body ? JSON.parse(String(init.body)) : undefined,
      });
      const data = (res.data ?? {}) as T & { error?: string };
      if (res.status >= 400) throw new Error(data.error ?? '请求失败（' + res.status + '）');
      return data;
    }

    const res = await fetch(url, { ...init, signal: controller.signal, headers });
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

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface StoredQuestion extends AiQuestion {
  status: ReviewStatus;
  createdAt: string;
  reviewedAt?: string;
  note?: string;
  source: string;
}

export interface QueueResponse {
  questions: StoredQuestion[];
  stats: Record<ReviewStatus | 'total', number>;
}

export function fetchQueue(status: ReviewStatus | 'all' = 'pending'): Promise<QueueResponse> {
  const qs = status === 'all' ? '' : '?status=' + status;
  return request<QueueResponse>('/ai/queue' + qs, { method: 'GET' }, 15000);
}

export function reviewQuestion(id: string, action: 'approve' | 'reject', note?: string): Promise<{ question: StoredQuestion; stats: QueueResponse['stats'] }> {
  return request('/ai/review', { method: 'POST', body: JSON.stringify({ id, action, note }) });
}

export function fetchAiQuestions(req: {
  topic: string;
  difficulty: 'basic' | 'advanced' | 'competition';
  count: number;
  fusion?: string[];
  style?: string;
  verifyMode?: 'strict' | 'balanced' | 'off';
}): Promise<AiQuestionBatch> {
  return request<AiQuestionBatch>('/ai/questions', { method: 'POST', body: JSON.stringify(req) });
}
