// EXPORTS: (server entry)
// HTTP 服务：只提供 /api/*，前端仍由 Vite 提供；生产可把 dist 交给静态服务器

import { createServer } from 'node:http';
import { config } from './config.ts';
import { generateQuestions } from './generate.ts';
import { llmMode } from './llm.ts';
import { validateQuestion } from './validate.ts';
import { savePending, listQueue, reviewQuestion, stats, type ReviewStatus } from './store.ts';
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
      // 生成结果直接入库，状态 pending，等人工审核
      const stored = savePending(batch.questions, 'ai:' + batch.model);
      send(res, 200, { ...batch, questions: stored, saved: stored.length });
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
