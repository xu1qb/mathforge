// EXPORTS: config
// 服务端配置：优先读 .env，其次环境变量；没有 API Key 时退化为 mock 模式

import { existsSync, readFileSync } from 'node:fs';

/** 读取项目根的 .env（不覆盖已存在的环境变量） */
function loadDotEnv(): void {
  try {
    const text = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // 没有 .env 就全靠环境变量（或退回 mock）
  }
}

loadDotEnv();

export interface ServerConfig {
  /** 是否从 .env 读到了配置（用于健康检查提示） */
  dotEnvLoaded: boolean;
  port: number;
  host: string;
  /** openai-compatible：任何兼容 /chat/completions 的服务（DeepSeek、火山方舟、OpenAI…） */
  provider: 'openai-compatible' | 'mock';
  baseUrl: string;
  apiKey: string;
  model: string;
  /** 单次请求超时（毫秒） */
  timeoutMs: number;
  /** 生成失败后的最大重试次数 */
  maxRetries: number;
  /** 缓存目录 */
  cacheDir: string;
  /** sympy 所在目录（PYTHONPATH），留空则用 ../.tooling/py */
  pythonPath: string;
  /** 是否启用「双解一致」校验 */
  dualSolve: boolean;
  /** 是否启用 C2：模型自主调用工具 */
  agentMode: boolean;
  /** 工具调用最大轮数 */
  agentMaxRounds: number;
  /** 是否做新颖度过滤 */
  noveltyFilter: boolean;
  /** 语义校验档位：strict 拒绝不可验证题 / balanced 放行但标记 / off 只做形式校验 */
  verifyMode: 'strict' | 'balanced' | 'off';
  /**
   * 第二模型（异构校验）：独立求解与裁决走这里，能打破「同模型自校验」的盲区。
   * 三个字段都为空时自动回退到主模型。
   */
  verifyBaseUrl: string;
  verifyApiKey: string;
  verifyModel: string;
}

/** 是否配置了可用的第二模型 */
export function hasVerifyModel(): boolean {
  return Boolean(config.verifyBaseUrl && config.verifyApiKey && config.verifyModel);
}

function env(key: string, fallback = ''): string {
  return (process.env[key] ?? fallback).trim();
}

/** 运行时热更新（桌面端保存密钥后立刻生效，不必重启进程） */
export function applyRuntimeConfig(next: {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  agentMode?: boolean;
}): void {
  if (typeof next.apiKey === 'string' && next.apiKey.trim()) config.apiKey = next.apiKey.trim();
  if (typeof next.model === 'string' && next.model.trim()) config.model = next.model.trim();
  if (typeof next.baseUrl === 'string' && next.baseUrl.trim()) {
    config.baseUrl = next.baseUrl.trim().replace(/\/$/, '');
  }
  if (typeof next.agentMode === 'boolean') config.agentMode = next.agentMode;
  config.provider = config.apiKey ? 'openai-compatible' : 'mock';
}

export const config: ServerConfig = {
  dotEnvLoaded: existsSync(new URL('../.env', import.meta.url)),
  port: Number(env('PORT', '8787')),
  host: env('HOST', '127.0.0.1'),
  provider: env('LLM_API_KEY') ? 'openai-compatible' : 'mock',
  baseUrl: env('LLM_BASE_URL', 'https://api.deepseek.com/v1').replace(/\/$/, ''),
  apiKey: env('LLM_API_KEY'),
  model: env('LLM_MODEL', 'deepseek-chat'),
  timeoutMs: Number(env('LLM_TIMEOUT_MS', '60000')),
  maxRetries: Number(env('LLM_MAX_RETRIES', '2')),
  cacheDir: env('CACHE_DIR', '.cache/ai'),
  pythonPath: env('MATH_PYTHON_PATH', ''),
  dualSolve: env('DUAL_SOLVE', '1') !== '0',
  agentMode: env('AGENT_MODE', '0') === '1',
  agentMaxRounds: Number(env('AGENT_MAX_ROUNDS', '6')),
  noveltyFilter: env('NOVELTY_FILTER', '1') !== '0',
  verifyMode: (env('VERIFY_MODE', 'balanced') as 'strict' | 'balanced' | 'off'),
  verifyBaseUrl: env('LLM_VERIFY_BASE_URL', '').replace(/\/$/, ''),
  verifyApiKey: env('LLM_VERIFY_API_KEY', ''),
  verifyModel: env('LLM_VERIFY_MODEL', ''),
};
