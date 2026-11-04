// EXPORTS: config
// 服务端配置：全部来自环境变量，缺省时退化为 mock 模式（无需联网也能端到端跑通）

export interface ServerConfig {
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
}

function env(key: string, fallback = ''): string {
  return (process.env[key] ?? fallback).trim();
}

export const config: ServerConfig = {
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
};
