// EXPORTS: saveGenerated, savePending, saveRejected, listQueue, reviewQuestion, stats
// 题目库：SQLite 持久化（见 server/db.ts），按 (topic, question_latex, answer) 去重。
// 旧版本用 JSON 文件，首次启动会自动迁移，数据不丢。
import {
  countRows,
  insertQuestions,
  listRows,
  updateRow,
  type ReviewStatus,
  type StoredQuestion,
} from './db.ts';
import type { AiQuestion } from './types.ts';

export type { ReviewStatus, StoredQuestion };

const AUTO_NOTE = '机器验证通过（双解一致 / 复算确认）';

/** 机器验证通过的题可直接标 approved；未验证的进 pending 等人工 */
export function saveGenerated(
  questions: AiQuestion[],
  source: string,
  autoApprove: boolean
): StoredQuestion[] {
  const now = new Date().toISOString();
  const status: ReviewStatus = autoApprove ? 'approved' : 'pending';
  insertQuestions(questions, source, status, autoApprove ? AUTO_NOTE : undefined, now, autoApprove ? now : undefined);
  return questions.map((q) => ({
    ...q,
    status,
    createdAt: now,
    reviewedAt: autoApprove ? now : undefined,
    note: autoApprove ? AUTO_NOTE : undefined,
    source,
  }));
}

/** 新生成的题一律进 pending，等人工审核 */
export function savePending(questions: AiQuestion[], source: string): StoredQuestion[] {
  const now = new Date().toISOString();
  insertQuestions(questions, source, 'pending', undefined, now);
  return questions.map((q) => ({ ...q, status: 'pending' as ReviewStatus, createdAt: now, source }));
}

/** 自动核验失败的题：以 rejected 入库，留下证据供人工查看 */
export function saveRejected(questions: AiQuestion[], source: string, note: string): StoredQuestion[] {
  const now = new Date().toISOString();
  insertQuestions(questions, source, 'rejected', note, now, now);
  return questions.map((q) => ({
    ...q,
    status: 'rejected' as ReviewStatus,
    createdAt: now,
    reviewedAt: now,
    note,
    source,
  }));
}

export function listQueue(status?: ReviewStatus, topic?: string): StoredQuestion[] {
  return listRows(status, topic);
}

export function reviewQuestion(
  id: string,
  action: 'approve' | 'reject',
  note?: string
): StoredQuestion | null {
  return updateRow(id, action === 'approve' ? 'approved' : 'rejected', note);
}

export function stats(): Record<ReviewStatus | 'total', number> {
  return countRows();
}
