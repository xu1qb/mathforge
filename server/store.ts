// EXPORTS: savePending, listQueue, reviewQuestion, stats
// 题目库：JSON 文件持久化（单进程写入，足够当前规模；量大再换 SQLite）

import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { config } from './config.ts';
import type { AiQuestion } from './types.ts';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface StoredQuestion extends AiQuestion {
  status: ReviewStatus;
  createdAt: string;
  reviewedAt?: string;
  note?: string;
  source: string;
}

interface StoreFile {
  version: 1;
  questions: StoredQuestion[];
}

const FILE = join(config.cacheDir, 'library.json');

function read(): StoreFile {
  if (!existsSync(FILE)) return { version: 1, questions: [] };
  try {
    const parsed = JSON.parse(readFileSync(FILE, 'utf8')) as StoreFile;
    if (!Array.isArray(parsed.questions)) return { version: 1, questions: [] };
    return parsed;
  } catch {
    return { version: 1, questions: [] };
  }
}

function write(data: StoreFile): void {
  mkdirSync(dirname(FILE), { recursive: true });
  const json = JSON.stringify(data, null, 2);
  const tmp = FILE + '.tmp';
  try {
    writeFileSync(tmp, json, 'utf8');
    renameSync(tmp, FILE);
  } catch {
    // 某些沙箱环境禁止 rename，退化为直接写（单进程下足够安全）
    writeFileSync(FILE, json, 'utf8');
  }
}

/** 新生成的题一律进 pending，等人工审核 */
export function savePending(questions: AiQuestion[], source: string): StoredQuestion[] {
  const data = read();
  const now = new Date().toISOString();
  const stored = questions.map((q) => ({ ...q, status: 'pending' as ReviewStatus, createdAt: now, source }));
  // 按题干去重：同一道题不重复入库
  // 去重键包含 topic：不同知识点下的同一道题视为两条记录，由审核决定去留
  const keyOf = (q: StoredQuestion) => q.topic + '||' + q.questionLatex + '||' + q.answer;
  const existing = new Set(data.questions.map(keyOf));
  for (const q of stored) {
    if (!existing.has(keyOf(q))) {
      data.questions.unshift(q);
      existing.add(keyOf(q));
    }
  }
  write(data);
  return stored;
}

export function listQueue(status?: ReviewStatus, topic?: string): StoredQuestion[] {
  const data = read();
  return data.questions.filter(
    (q) => (!status || q.status === status) && (!topic || q.topic === topic)
  );
}

export function reviewQuestion(id: string, action: 'approve' | 'reject', note?: string): StoredQuestion | null {
  const data = read();
  const q = data.questions.find((x) => x.id === id);
  if (!q) return null;
  q.status = action === 'approve' ? 'approved' : 'rejected';
  q.reviewedAt = new Date().toISOString();
  if (note) q.note = note;
  write(data);
  return q;
}

export function stats(): Record<ReviewStatus | 'total', number> {
  const data = read();
  const out = { pending: 0, approved: 0, rejected: 0, total: data.questions.length };
  for (const q of data.questions) out[q.status] += 1;
  return out;
}
