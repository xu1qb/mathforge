// EXPORTS: (server entry)
// HTTP 服务：只提供 /api/*，前端仍由 Vite 提供；生产可把 dist 交给静态服务器

import { createServer } from 'node:http';
import { config, applyRuntimeConfig, hasVerifyModel } from './config.ts';
import { generateQuestions } from './generate.ts';
import { llmMode } from './llm.ts';
import { validateQuestion } from './validate.ts';
import { saveGenerated, listQueue, reviewQuestion, stats, type ReviewStatus } from './store.ts';
import { poolStatus, listPool, startFill, getFillJob } from './pool.ts';
import type { AiQuestionRequest } from './types.ts';

const MAX_BODY = 1024 * 256;

function send(res: any, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(text);
}

async function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('请求体过大'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://' + (req.headers.host ?? 'localhost'));

  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  try {
    if (url.pathname === '/api/health') {
      send(res, 200, {
        ok: true,
        mode: llmMode(),
        model: config.model,
        provider: config.provider,
        /** 配置了第二模型时返回它的名字，用于前端提示「已启用异构校验」 */
        verifyModel: hasVerifyModel() ? config.verifyModel : null,
        time: new Date().toISOString(),
      });
      return;
    }

    if (url.pathname === '/api/ai/questions' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req)) as AiQuestionRequest;
      if (!body || typeof body.topic !== 'string') {
        send(res, 400, { error: '缺少 topic' });
        return;
      }
      const batch = await generateQuestions(body);
      // 严格档且验证通过的题直接可用；其余进待审核
      const allVerified =
        (body.verifyMode ?? 'balanced') === 'strict' &&
        batch.questions.every((q) => q.validation.dualSolve === 'match' || q.validation.dualSolve === 'judged');
      const stored = saveGenerated(batch.questions, 'ai:' + batch.model, allVerified);
      send(res, 200, { ...batch, questions: stored, saved: stored.length, autoApproved: allVerified });
      return;
    }

    if (url.pathname === '/api/config' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req)) as {
        apiKey?: string; model?: string; baseUrl?: string; agentMode?: boolean;
      };
      applyRuntimeConfig(body);
      send(res, 200, { ok: true, mode: llmMode(), model: config.model });
      return;
    }

    // ===== 预生成池 =====
    if (url.pathname === '/api/ai/pool/status' && req.method === 'GET') {
      const topic = url.searchParams.get('topic') ?? undefined;
      send(res, 200, poolStatus(topic));
      return;
    }

    if (url.pathname === '/api/ai/pool' && req.method === 'GET') {
      const topic = url.searchParams.get('topic');
      if (!topic) {
        send(res, 400, { error: '缺少 topic' });
        return;
      }
      const difficulty = url.searchParams.get('difficulty') ?? undefined;
      const limit = Number(url.searchParams.get('limit') ?? 20);
      const questions = listPool(topic, difficulty, Number.isFinite(limit) ? limit : 20);
      send(res, 200, { questions, count: questions.length, mode: llmMode() });
      return;
    }

    if (url.pathname === '/api/ai/pool/fill' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req)) as {
        topic?: string; difficulty?: 'basic' | 'advanced' | 'competition'; target?: number;
      };
      if (!body.topic) {
        send(res, 400, { error: '缺少 topic' });
        return;
      }
      const job = startFill({ topic: body.topic, difficulty: body.difficulty, target: body.target });
      send(res, 200, { job });
      return;
    }

    if (url.pathname === '/api/ai/pool/job' && req.method === 'GET') {
      const id = url.searchParams.get('id') ?? '';
      const job = getFillJob(id);
      if (!job) {
        send(res, 404, { error: '任务不存在' });
        return;
      }
      send(res, 200, { job });
      return;
    }

    if (url.pathname === '/api/ai/queue' && req.method === 'GET') {
      const status = (url.searchParams.get('status') ?? '') as ReviewStatus | '';
      const topic = url.searchParams.get('topic') ?? '';
      send(res, 200, { questions: listQueue(status || undefined, topic || undefined), stats: stats() });
      return;
    }

    if (url.pathname === '/api/ai/review' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req)) as { id?: string; action?: string; note?: string };
      if (!body.id || (body.action !== 'approve' && body.action !== 'reject')) {
        send(res, 400, { error: '需要 id 与 action（approve|reject）' });
        return;
      }
      const updated = reviewQuestion(body.id, body.action, body.note);
      if (!updated) {
        send(res, 404, { error: '题目不存在' });
        return;
      }
      send(res, 200, { question: updated, stats: stats() });
      return;
    }

    if (url.pathname === '/api/ai/validate' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req)) as Record<string, unknown>;
      send(res, 200, validateQuestion(body));
      return;
    }

    send(res, 404, { error: '未找到接口：' + url.pathname });
  } catch (err) {
    send(res, 500, { error: err instanceof Error ? err.message : '服务端错误' });
  }
});

server.listen(config.port, config.host, () => {
  console.log('[mathforge-api] http://' + config.host + ':' + config.port +
    ' | mode=' + llmMode() + ' | model=' + config.model);
});
