import { useState, useEffect, useCallback, useMemo } from 'react';
import { scopedStorage } from '@/lib/lark-mock';
import type { PracticeQuestion } from '@/lib/math-practice';

const MASTERY_KEY = 'mathforge_mastery_record';

/** 变式类型 */
export type VariantType = 'number' | 'condition' | 'approach';

export const VARIANT_TYPE_LABELS: Record<VariantType, string> = {
  number: '换数练习',
  condition: '条件变化',
  approach: '角度变化',
};

/** 单道变式题的掌握状态 */
interface VariantProgress {
  variantId: string;
  variantType: VariantType;
  completed: boolean;
  completedAt?: number;
}

/** 母题掌握记录 */
export interface MasteryRecord {
  /** 母题标识（topicKey + 题目结构指纹） */
  motherId: string;
  topicKey: string;
  /** 母题是否做对过 */
  motherCorrect: boolean;
  motherCorrectAt?: number;
  /** 3 道变式完成情况 */
  variants: VariantProgress[];
  /** 是否已掌握（母题对 + 至少 2 变式对） */
  mastered: boolean;
  masteredAt?: number;
  /** 是否为蒙对的掌握（用户标记为疑似蒙对） */
  guessedCorrect?: boolean;
  /** 首次学习时间 */
  firstSeenAt: number;
}

function hashQuestion(q: PracticeQuestion): string {
  // 用 topicKey + 题目前 40 字符作为母题指纹
  const base = `${q.topicKey}:${q.question.slice(0, 40)}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = ((hash << 5) - hash + base.charCodeAt(i)) | 0;
  }
  return `m_${q.topicKey}_${Math.abs(hash)}`;
}

function readMastery(): Record<string, MasteryRecord> {
  try {
    const raw = scopedStorage.getItem(MASTERY_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return {};
    return data;
  } catch {
    return {};
  }
}

function writeMastery(data: Record<string, MasteryRecord>) {
  try {
    scopedStorage.setItem(MASTERY_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/** 计算是否达到掌握条件：母题对 + 至少 2 道变式对 */
function checkMastered(record: MasteryRecord): boolean {
  if (!record.motherCorrect) return false;
  const completedCount = record.variants.filter((v) => v.completed).length;
  return completedCount >= 2;
}

export function useMastery() {
  const [records, setRecords] = useState<Record<string, MasteryRecord>>({});

  // 初始加载
  useEffect(() => {
    setRecords(readMastery());
  }, []);

  // 持久化
  const persist = useCallback((data: Record<string, MasteryRecord>) => {
    setRecords(data);
    writeMastery(data);
    // 通知统计更新
    try {
      window.dispatchEvent(new CustomEvent('mathforge:mastery-update'));
    } catch {
      // ignore
    }
  }, []);

  /** 获取某道母题的掌握记录 */
  const getRecord = useCallback(
    (question: PracticeQuestion): MasteryRecord | null => {
      const id = hashQuestion(question);
      return records[id] ?? null;
    },
    [records],
  );

  /** 母题做对了 */
  const markMotherCorrect = useCallback(
    (question: PracticeQuestion) => {
      const id = hashQuestion(question);
      const existing = records[id];
      const now = Date.now();
      const record: MasteryRecord = existing
        ? {
            ...existing,
            motherCorrect: true,
            motherCorrectAt: existing.motherCorrectAt ?? now,
          }
        : {
            motherId: id,
            topicKey: question.topicKey,
            motherCorrect: true,
            motherCorrectAt: now,
            variants: [],
            mastered: false,
            firstSeenAt: now,
          };
      record.mastered = checkMastered(record);
      if (record.mastered && !existing?.mastered) {
        record.masteredAt = now;
      }
      const next = { ...records, [id]: record };
      persist(next);
      return record;
    },
    [records, persist],
  );

  /** 某道变式做对了 */
  const markVariantCorrect = useCallback(
    (question: PracticeQuestion, variantId: string, variantType: VariantType) => {
      const id = hashQuestion(question);
      const existing = records[id];
      const now = Date.now();
      const base: MasteryRecord = existing ?? {
        motherId: id,
        topicKey: question.topicKey,
        motherCorrect: false,
        variants: [],
        mastered: false,
        firstSeenAt: now,
      };

      const variantExists = base.variants.find((v) => v.variantId === variantId);
      const variants = variantExists
        ? base.variants.map((v) =>
            v.variantId === variantId ? { ...v, completed: true, completedAt: v.completedAt ?? now } : v,
          )
        : [...base.variants, { variantId, variantType, completed: true, completedAt: now }];

      const record: MasteryRecord = { ...base, variants };
      record.mastered = checkMastered(record);
      if (record.mastered && !existing?.mastered) {
        record.masteredAt = now;
      }
      const next = { ...records, [id]: record };
      persist(next);
      return record;
    },
    [records, persist],
  );

  /** 检查母题是否已掌握 */
  const isMastered = useCallback(
    (question: PracticeQuestion): boolean => {
      const id = hashQuestion(question);
      return records[id]?.mastered ?? false;
    },
    [records],
  );

  /** 标记某母题为疑似蒙对（用户点了"没想到这步"） */
  const markGuessed = useCallback(
    (question: PracticeQuestion) => {
      const id = hashQuestion(question);
      const existing = records[id];
      if (!existing) return null;
      const record: MasteryRecord = { ...existing, guessedCorrect: true, mastered: false };
      const next = { ...records, [id]: record };
      persist(next);
      return record;
    },
    [records, persist],
  );

  /** 蒙对重考验证通过 → 恢复真掌握 */
  const markGuessVerified = useCallback(
    (question: PracticeQuestion) => {
      const id = hashQuestion(question);
      const existing = records[id];
      if (!existing) return null;
      const now = Date.now();
      const record: MasteryRecord = {
        ...existing,
        guessedCorrect: false,
        mastered: checkMastered(existing),
        masteredAt: checkMastered(existing) ? now : existing.masteredAt,
      };
      const next = { ...records, [id]: record };
      persist(next);
      return record;
    },
    [records, persist],
  );

  /** 统计：真掌握母题数（已掌握且非蒙对） */
  const trulyMasteredCount = useMemo(() => {
    return Object.values(records).filter((r) => r.mastered && !r.guessedCorrect).length;
  }, [records]);

  /** 统计：蒙对待验证母题数（掌握过但被标记为蒙对） */
  const guessedCount = useMemo(() => {
    return Object.values(records).filter((r) => r.guessedCorrect).length;
  }, [records]);

  /** 统计：已掌握母题数 */
  const masteredCount = useMemo(() => {
    return Object.values(records).filter((r) => r.mastered).length;
  }, [records]);

  /** 统计：总学习母题数 */
  const totalCount = useMemo(() => {
    return Object.keys(records).length;
  }, [records]);

  /** 按 topic 统计掌握数 */
  const masteryByTopic = useMemo(() => {
    const result: Record<string, { total: number; mastered: number }> = {};
    Object.values(records).forEach((r) => {
      if (!result[r.topicKey]) result[r.topicKey] = { total: 0, mastered: 0 };
      result[r.topicKey].total += 1;
      if (r.mastered) result[r.topicKey].mastered += 1;
    });
    return result;
  }, [records]);

  return {
     records,
     getRecord,
     markMotherCorrect,
     markVariantCorrect,
     isMastered,
     markGuessed,
     markGuessVerified,
     masteredCount,
     trulyMasteredCount,
     guessedCount,
     totalCount,
     masteryByTopic,
   };
}
