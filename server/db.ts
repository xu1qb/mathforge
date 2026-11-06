// EXPORTS: getDb, toStored, insertQuestions, listRows, updateRow, countRows
// 题目库持久层：SQLite（node-sqlite3-wasm，纯 WASM，免编译）
// 文件位置：<cacheDir>/library.db；旧的 library.json 会在首次启动时自动迁移。
// CJS 包：具名导入在 Node ESM 下解析不到，用默认导入再取类
import sqlite3Wasm from 'node-sqlite3-wasm';
const Database = sqlite3Wasm.Database;
import { existsSync, mkdirSync, readFileSync, renameSync } from 'node:fs';
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

const DB_FILE = join(config.cacheDir, 'library.db');
const LEGACY_JSON = join(config.cacheDir, 'library.json');

mkdirSync(dirname(DB_FILE), { recursive: true });

const db = new Database(DB_FILE);

db.exec(String.raw`
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_latex TEXT NOT NULL,
  answer TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  reviewed_at TEXT,
  note TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_dedupe ON questions(topic, question_latex, answer);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status, topic, created_at DESC);
`);

/** 旧 JSON 库一次性迁入：表为空且存在 library.json 时执行 */
function migrateLegacy(): void {
  if (!existsSync(LEGACY_JSON)) return;
  const { total } = db.get('SELECT COUNT(*) AS total FROM questions') as { total: number };
  if (total > 0) return;
  try {
    const parsed = JSON.parse(readFileSync(LEGACY_JSON, 'utf8')) as { questions?: StoredQuestion[] };
    const rows = Array.isArray(parsed.questions) ? parsed.questions : [];
    // insertQuestions 内部自带事务，这里逐条调用，避免嵌套事务
    for (const q of rows) {
      insertQuestions(
        [q],
        q.source ?? 'legacy',
        (q.status ?? 'pending') as ReviewStatus,
        q.note,
        q.createdAt ?? new Date().toISOString(),
        q.reviewedAt
      );
    }
    try {
      renameSync(LEGACY_JSON, LEGACY_JSON + '.migrated');
    } catch {
      // 沙箱可能禁 rename；迁移已成功，遗留文件不影响
    }
    console.log('题目库已迁移到 SQLite：' + rows.length + ' 条');
  } catch (err) {
    console.warn('旧 JSON 库迁移失败：' + (err instanceof Error ? err.message : String(err)));
  }
}

export function getDb(): Database {
  return db;
}

export function toStored(row: Record<string, unknown>): StoredQuestion {
  const payload = JSON.parse(String(row.payload)) as AiQuestion;
  return {
    ...payload,
    status: row.status as ReviewStatus,
    createdAt: String(row.created_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    note: row.note ? String(row.note) : undefined,
    source: String(row.source),
  };
}

/** 批量入库；按 (topic, question_latex, answer) 去重，重复的静默跳过 */
export function insertQuestions(
  questions: AiQuestion[],
  source: string,
  status: ReviewStatus,
  note?: string,
  createdAt = new Date().toISOString(),
  reviewedAt?: string
): number {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO questions (id, topic, difficulty, question_latex, answer, payload, status, source, created_at, reviewed_at, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  let changed = 0;
  try {
    db.exec('BEGIN');
    for (const q of questions) {
      const res = insert.run([
        q.id,
        q.topic,
        q.difficulty,
        q.questionLatex,
        q.answer,
        JSON.stringify(q),
        status,
        source,
        createdAt,
        reviewedAt ?? null,
        note ?? null,
      ]);
      changed += res.changes;
    }
    db.exec('COMMIT');
  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // ignore
    }
    throw err;
  } finally {
    insert.finalize();
  }
  return changed;
}

export function listRows(status?: ReviewStatus, topic?: string): StoredQuestion[] {
  const where: string[] = [];
  const args: unknown[] = [];
  if (status) {
    where.push('status = ?');
    args.push(status);
  }
  if (topic) {
    where.push('topic = ?');
    args.push(topic);
  }
  const sql =
    'SELECT * FROM questions' +
    (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ' ORDER BY created_at DESC, rowid DESC';
  const rows = db.all(sql, args as never) as Record<string, unknown>[];
  return rows.map(toStored);
}

export function updateRow(id: string, status: ReviewStatus, note?: string): StoredQuestion | null {
  const row = db.get('SELECT * FROM questions WHERE id = ?', [id]) as Record<string, unknown> | null;
  if (!row) return null;
  db.run('UPDATE questions SET status = ?, reviewed_at = ?, note = COALESCE(?, note) WHERE id = ?', [
    status,
    new Date().toISOString(),
    note ?? null,
    id,
  ]);
  const next = db.get('SELECT * FROM questions WHERE id = ?', [id]) as Record<string, unknown>;
  return toStored(next);
}

export function countRows(): Record<ReviewStatus | 'total', number> {
  const out = { pending: 0, approved: 0, rejected: 0, total: 0 };
  const rows = db.all('SELECT status, COUNT(*) AS n FROM questions GROUP BY status') as {
    status: ReviewStatus;
    n: number;
  }[];
  for (const row of rows) {
    out[row.status] = Number(row.n);
    out.total += Number(row.n);
  }
  return out;
}

migrateLegacy();
