// EXPORTS: poolStatus, startFill, getFillJob, listPool
// AI 预生成池：后台按知识点批量出题并入库，练习时秒开

import { config } from './config.ts';
import { generateQuestions } from './generate.ts';
import { listQueue, saveGenerated, type StoredQuestion } from './store.ts';
import { llmMode } from './llm.ts';

const TARGET_DEFAULT = 10;
const MAX_TARGET = 50;

interface FillJob {
  id: string;
  topic: string;
  difficulty: 'basic' | 'advanced' | 'competition';
  target: number;
  filled: number;
  attempts: number;
  failures: number;
  startedAt: string;
  finishedAt?: string;
  running: boolean;
  error?: string;
}

const jobs = new Map<string, FillJob>();
let current: FillJob | null = null;

/** 已入库的 AI 题，按知识点/难度统计 */
export function poolStatus(topic?: string) {
  const approved = listQueue('approved', topic);
  const byTopic: Record<string, number> = {};
  for (const q of approved) byTopic[q.topic] = (byTopic[q.topic] ?? 0) + 1;
  return {
    total: approved.length,
    byTopic,
    job: current ? snapshot(current) : null,
    mode: llmMode(),
  };
}

/** 按知识点+难度取出可秒开的题 */
export function listPool(topic: string, difficulty?: string, limit = 20): StoredQuestion[] {
  const approved = listQueue('approved', topic);
  const filtered = difficulty ? approved.filter((q) => q.difficulty === difficulty) : approved;
  return filtered.slice(0, limit);
}

function snapshot(job: FillJob): Omit<FillJob, 'running'> & { running: boolean } {
  return { ...job };
}

export function getFillJob(id: string): FillJob | undefined {
  return jobs.get(id);
}

/**
 * 后台补题：一次只生成 1 道，串行跑到目标数量或失败上限。
 * 不阻塞请求，立即返回 job。
 */
export function startFill(input: {
  topic: string;
  difficulty?: 'basic' | 'advanced' | 'competition';
  target?: number;
}): FillJob {
  if (current?.running) return current;

  const target = Math.min(Math.max(Number(input.target) || TARGET_DEFAULT, 1), MAX_TARGET);
  const job: FillJob = {
    id: 'fill-' + Date.now().toString(36),
    topic: input.topic,
    difficulty: input.difficulty ?? 'basic',
    target,
    filled: 0,
    attempts: 0,
    failures: 0,
    startedAt: new Date().toISOString(),
    running: true,
  };
  jobs.set(job.id, job);
  current = job;

  void (async () => {
    if (llmMode() !== 'live') {
      job.running = false;
      job.error = '当前是 mock 模式，无法预生成（需要配置 LLM_API_KEY）';
      job.finishedAt = new Date().toISOString();
      return;
    }
    const before = listPool(job.topic, job.difficulty, 999).length;
    const need = Math.max(0, target - before);
    const maxAttempts = need * 4 + 4; // 每道题平均给 4 次机会，硬上限防跑飞
    while (job.filled < need && job.failures < 3 && job.attempts < maxAttempts) {
      job.attempts++;
      try {
        const batch = await generateQuestions({
          topic: job.topic,
          difficulty: job.difficulty,
          count: 1,
          verifyMode: 'strict',
          // 每次换 seed，避免命中同一份缓存导致「生成同一道题」
          seed: job.id + '-' + job.attempts,
        } as never);
        const ok = batch.questions.filter(
          (q) => q.validation.dualSolve === 'match' || q.validation.dualSolve === 'judged',
        );
        if (ok.length) {
          saveGenerated(ok, 'pool:' + batch.model, true);
          // 去重后实际入库数才作数：用池子真实数量回算
          const now = listPool(job.topic, job.difficulty, 999).length - before;
          if (now === job.filled) job.failures++; // 生成的是重复题，算一次失败
          job.filled = now;
        } else {
          job.failures++;
        }
      } catch (e) {
        job.failures++;
        job.error = String(e).slice(0, 200);
      }
      // 控制节奏，避免把额度一把打光
      await new Promise((r) => setTimeout(r, 600));
    }
    if (job.filled < need && !job.error) {
      job.error = '到达尝试上限（' + job.attempts + ' 次），可能模型重复出同一道题';
    }
    job.running = false;
    job.finishedAt = new Date().toISOString();
  })();

  return job;
}
