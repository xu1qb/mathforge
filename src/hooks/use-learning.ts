// EXPORTS: useWrongBook, useLearningStats, useFavorites, useQuestionFavorites, usePracticeSettings, WRONG_BOOK_KEY, STATS_KEY, FAVORITES_KEY, QUESTION_FAVORITES_KEY, FAVORITES_LIMIT, QUESTION_FAVORITES_LIMIT, PRACTICE_SETTINGS_KEY, formatDateKey, type WrongItem, type WrongReason, WRONG_REASON_LABELS, WRONG_REASON_COLORS, type WrongItemSource, type ReviewStage, REVIEW_STAGE_LABELS, REVIEW_INTERVALS_DAYS, computeNextReviewDate, isReviewDue, advanceReviewStage, resetReviewStage, type StatsRecord, type DailyRecord, type PracticeSettings, type AnswerMode, type FavoriteItem, type QuestionFavoriteItem, generateHeatmapData, computeStreakInfo, computeAnnualReport

import { useState, useEffect, useCallback, useMemo } from 'react';
import { scopedStorage } from '@/lib/lark-mock';
import type { PracticeQuestion } from '@/lib/math-practice';

export const WRONG_BOOK_KEY = 'mathforge_wrong_book';
export const STATS_KEY = 'mathforge_learning_stats';
export const FAVORITES_KEY = 'mathforge_favorites';
export const FAVORITES_LIMIT = 100;
export const PRACTICE_SETTINGS_KEY = 'mathforge_practice_settings';

export type AnswerMode = 'auto' | 'self-eval';

export interface PracticeSettings {
  answerMode: AnswerMode;
}

// ===== 错题本 =====
export type WrongItemSource = 'auto' | 'self-eval' | 'timeout' | 'guess';

/** 错因类型：计算失误 / 概念不清 / 方法不会 / 审题错 */
export type WrongReason = 'calc-mistake' | 'concept' | 'method' | 'misread';

export const WRONG_REASON_LABELS: Record<WrongReason, string> = {
  'calc-mistake': '计算失误',
  'concept': '概念不清',
  'method': '方法不会',
  'misread': '审题错',
};

export const WRONG_REASON_COLORS: Record<WrongReason, { bar: string; text: string; bg: string }> = {
  'calc-mistake': { bar: 'bg-rose-400', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  'concept': { bar: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  'method': { bar: 'bg-blue-400', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  'misread': { bar: 'bg-purple-400', text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
};

/** 艾宾浩斯复习阶段（0=新题待首次复习，1=1天后，2=3天后，3=7天后，4=14天后，5=30天后，6=已掌握） */
export type ReviewStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 艾宾浩斯间隔（单位：天），对应阶段 0→1, 1→2, ... 5→6 */
const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];

/** 阶段描述文案 */
export const REVIEW_STAGE_LABELS = [
  '新错题',
  '第 1 轮 · 1 天后',
  '第 2 轮 · 3 天后',
  '第 3 轮 · 7 天后',
  '第 4 轮 · 14 天后',
  '第 5 轮 · 30 天后',
  '已掌握',
];

export interface WrongItem {
  id: string;
  topicKey: string;
  question: PracticeQuestion;
  userAnswer: string;
  wrongTime: number;
  mastered: boolean;
  masteredTime?: number;
  retryCount: number;
  correctRetryCount: number;
  /** 错题来源：auto=自动判分判错，self-eval=用户自评判错 */
  source: WrongItemSource;
  /** 当前复习阶段（0=新题，6=已掌握） */
  reviewStage: ReviewStage;
  /** 下次复习日期（时间戳，毫秒） */
  nextReviewDate: number;
  /** 累计复习次数 */
  reviewCount: number;
  /** 本题答题用时（秒） */
  timeSpent?: number;
  /** 是否标记为"蒙的" */
  isGuessed?: boolean;
  /** 上次复习日期（时间戳） */
  lastReviewDate?: number;
  /** 苏格拉底式提示层级（0=未用提示 1=卡方向 2=卡中间步 3=需完整解析） */
  hintLevel?: number;
  /** 错因分类 */
  wrongReason?: WrongReason;
  /** 连续答对次数（复习答对 +1，答错归零；≥2 自动掌握） */
  consecutiveCorrect?: number;
  /** 是否为疑似蒙对的题（答对但用时过短或用户标记） */
  guessedCorrect?: boolean;
  /** 蒙对重考次数（最多 3 次，超过仍蒙则进入错题本） */
  guessedRetryCount?: number;
}

/** 计算指定阶段的下次复习日期（阶段 0→1 即 1 天后，依此类推） */
export function computeNextReviewDate(stageIndex: number, fromTime: number = Date.now()): number {
  if (stageIndex >= 5) return fromTime; // 阶段 5 之后直接掌握
  const days = REVIEW_INTERVALS_DAYS[stageIndex] ?? 1;
  return fromTime + days * 24 * 60 * 60 * 1000;
}

/** 判断是否今日到期 */
export function isReviewDue(item: WrongItem, now: number = Date.now()): boolean {
  if (item.mastered || item.reviewStage >= 6) return false;
  return now >= item.nextReviewDate;
}

/** 复习答对了 → 推进到下一阶段 */
export function advanceReviewStage(item: WrongItem): WrongItem {
  const nextStage = (item.reviewStage + 1) as ReviewStage;
  const now = Date.now();
  if (nextStage >= 6) {
    // 6 个阶段都过完，标记为掌握
    return {
      ...item,
      reviewStage: 6,
      mastered: true,
      masteredTime: now,
      lastReviewDate: now,
      reviewCount: item.reviewCount + 1,
      correctRetryCount: item.correctRetryCount + 1,
    };
  }
  return {
    ...item,
    reviewStage: nextStage,
    nextReviewDate: computeNextReviewDate(nextStage - 1, now),
    lastReviewDate: now,
    reviewCount: item.reviewCount + 1,
    correctRetryCount: item.correctRetryCount + 1,
  };
}

/** 复习答错了 → 重置回第 1 阶段（1 天后） */
export function resetReviewStage(item: WrongItem): WrongItem {
  const now = Date.now();
  return {
    ...item,
    reviewStage: 1,
    nextReviewDate: computeNextReviewDate(0, now), // 1 天后
    lastReviewDate: now,
    reviewCount: 1,
    mastered: false,
    masteredTime: undefined,
  };
}

function readWrongBook(): WrongItem[] {
  try {
    const raw = scopedStorage.getItem(WRONG_BOOK_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    // 历史数据兼容：没有 wrongReason 的默认 method（方法不会），没有 consecutiveCorrect 的默认 0
    return data.map((item) => ({
      ...item,
      wrongReason: item.wrongReason ?? ('method' as WrongReason),
      consecutiveCorrect: item.consecutiveCorrect ?? 0,
    }));
  } catch {
    return [];
  }
}

function writeWrongBook(items: WrongItem[]) {
  try {
    scopedStorage.setItem(WRONG_BOOK_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function useWrongBook() {
  const [items, setItems] = useState<WrongItem[]>([]);

  useEffect(() => {
    setItems(readWrongBook());
  }, []);

  const addWrong = useCallback((question: PracticeQuestion, userAnswer: string, source: WrongItemSource = 'auto', meta?: { timeSpent?: number; isGuessed?: boolean; hintLevel?: number; wrongReason?: WrongReason }) => {
    setItems((prev) => {
      // 同一题目（同topic+同question文字）不重复收录，更新错误次数
      const existingIdx = prev.findIndex(
        (w) => w.topicKey === question.topicKey && w.question.question === question.question && !w.mastered,
      );
      let next: WrongItem[];
      if (existingIdx >= 0) {
        next = [...prev];
        // 取最高的 hintLevel（用了更多提示说明更薄弱）
        const newHintLevel = Math.max(next[existingIdx].hintLevel ?? 0, meta?.hintLevel ?? 0);
        next[existingIdx] = {
          ...next[existingIdx],
          userAnswer,
          wrongTime: Date.now(),
          retryCount: next[existingIdx].retryCount + 1,
          source, // 更新最新来源
          mastered: false,
          reviewStage: 0, // 重置复习阶段
          nextReviewDate: Date.now(), // 今日起重新排期
          reviewCount: 0,
          consecutiveCorrect: 0, // 答错归零
          ...(newHintLevel > 0 ? { hintLevel: newHintLevel } : {}),
          ...(meta?.wrongReason ? { wrongReason: meta.wrongReason } : {}),
        };
      } else {
        const now = Date.now();
        const item: WrongItem = {
          id: `wrong-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          topicKey: question.topicKey,
          question,
          userAnswer,
          wrongTime: now,
          mastered: false,
          retryCount: 0,
          correctRetryCount: 0,
          source,
          reviewStage: 0,
          nextReviewDate: now, // 新错题立即可复习（今日待复习）
          reviewCount: 0,
          timeSpent: meta?.timeSpent,
          isGuessed: meta?.isGuessed,
          hintLevel: meta?.hintLevel,
          wrongReason: meta?.wrongReason,
          consecutiveCorrect: 0,
        };
        next = [item, ...prev];
      }
      writeWrongBook(next);
      return next;
    });
  }, []);

  const markMastered = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((w) =>
        w.id === id ? { ...w, mastered: true, masteredTime: Date.now() } : w,
      );
      writeWrongBook(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((w) => w.id !== id);
      writeWrongBook(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    writeWrongBook([]);
  }, []);

  const incrementRetry = useCallback((id: string, correct: boolean) => {
    setItems((prev) => {
      const next = prev.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          retryCount: w.retryCount + 1,
          correctRetryCount: correct ? w.correctRetryCount + 1 : w.correctRetryCount,
        };
      });
      writeWrongBook(next);
      return next;
    });
  }, []);

  const pending = useMemo(() => items.filter((w) => !w.mastered), [items]);
  const mastered = useMemo(() => items.filter((w) => w.mastered), [items]);

  /** 今日待复习的错题（到期且未掌握） */
   const dueToday = useMemo(() => {
     const now = Date.now();
     return items.filter((w) => isReviewDue(w, now));
   }, [items]);

  /** 疑似蒙对的题（未掌握 + guessedCorrect=true） */
  const guessedPending = useMemo(
    () => items.filter((w) => !w.mastered && w.guessedCorrect),
    [items],
  );

  /** 今日到期的蒙对重考题 */
  const guessedDueToday = useMemo(() => {
    const now = Date.now();
    return items.filter((w) => !w.mastered && w.guessedCorrect && now >= w.nextReviewDate);
  }, [items]);

  /** 真掌握（已掌握且非蒙对） */
  const trulyMastered = useMemo(
    () => items.filter((w) => w.mastered && !w.guessedCorrect),
    [items],
  );

  /** 添加一道疑似蒙对的题（答对但用时短/用户标记） */
  const addGuessedCorrect = useCallback(
    (question: PracticeQuestion, userAnswer: string, meta?: { timeSpent?: number }) => {
      setItems((prev) => {
        // 检查是否已存在（同题 + 未掌握）
        const existingIdx = prev.findIndex(
          (w) =>
            w.topicKey === question.topicKey &&
            w.question.question === question.question &&
            !w.mastered,
        );
        const now = Date.now();
        // 3 天后重考
        const reviewIn3Days = now + 3 * 24 * 60 * 60 * 1000;
        let next: WrongItem[];
        if (existingIdx >= 0) {
          // 已有同题，更新为蒙对状态，重置重考次数
          next = [...prev];
          const existingGuessedCount = next[existingIdx].guessedRetryCount ?? 0;
          // 如果已经重考 3 次还是蒙 → 不再加，保持错题状态
          if (existingGuessedCount >= 3) {
            // 第 3 次仍蒙 → 自动挪回错题本，错因默认概念不清
            next[existingIdx] = {
              ...next[existingIdx],
              guessedCorrect: false,
              guessedRetryCount: 3,
              mastered: false,
              reviewStage: 0,
              nextReviewDate: now,
              wrongReason: 'concept',
              userAnswer,
              wrongTime: now,
            };
          } else {
            next[existingIdx] = {
              ...next[existingIdx],
              guessedCorrect: true,
              guessedRetryCount: existingGuessedCount + 1,
              mastered: false,
              reviewStage: 0,
              nextReviewDate: reviewIn3Days,
              userAnswer,
              wrongTime: now,
              timeSpent: meta?.timeSpent,
            };
          }
        } else {
          // 新增一道蒙对题
          const item: WrongItem = {
            id: `guess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            topicKey: question.topicKey,
            question,
            userAnswer,
            wrongTime: now,
            mastered: false,
            retryCount: 0,
            correctRetryCount: 0,
            source: 'guess',
            reviewStage: 0,
            nextReviewDate: reviewIn3Days,
            reviewCount: 0,
            timeSpent: meta?.timeSpent,
            guessedCorrect: true,
            guessedRetryCount: 1,
            consecutiveCorrect: 0,
          };
          next = [item, ...prev];
        }
        writeWrongBook(next);
        return next;
      });
    },
    [],
  );

  /** 蒙对重考答对 → 验证通过，算真掌握 */
  const markGuessVerified = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          guessedCorrect: false,
          mastered: true,
          masteredTime: Date.now(),
          correctRetryCount: w.correctRetryCount + 1,
          reviewCount: w.reviewCount + 1,
          lastReviewDate: Date.now(),
        };
      });
      writeWrongBook(next);
      return next;
    });
  }, []);

  /** 蒙对重考答错 → 进错题本，错因默认概念不清 */
  const markGuessWrong = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          guessedCorrect: false,
           mastered: false,
           reviewStage: 0 as ReviewStage,
           nextReviewDate: Date.now(),
           wrongReason: 'concept' as WrongReason,
           source: 'auto' as const,
           wrongTime: Date.now(),
           reviewCount: 0,
           consecutiveCorrect: 0,
        };
      });
      writeWrongBook(next);
      return next;
    });
  }, []);

  /** 蒙对重考又蒙对了（用时短/用户标记）→ 再隔 3 天，最多 3 次 */
  const markGuessAgain = useCallback((id: string, userAnswer: string) => {
    setItems((prev) => {
      const next = prev.map((w) => {
        if (w.id !== id) return w;
        const count = (w.guessedRetryCount ?? 0) + 1;
        const now = Date.now();
        if (count >= 3) {
          // 第 3 次仍蒙 → 自动挪回错题本，错因概念不清
          return {
            ...w,
            guessedCorrect: false,
            guessedRetryCount: 3,
             mastered: false,
             reviewStage: 0 as ReviewStage,
             nextReviewDate: now,
             wrongReason: 'concept' as WrongReason,
              source: 'auto' as const,
             userAnswer,
             wrongTime: now,
           };
         }
         return {
          ...w,
          guessedRetryCount: count,
          nextReviewDate: now + 3 * 24 * 60 * 60 * 1000,
          userAnswer,
          wrongTime: now,
        };
      });
      writeWrongBook(next);
      return next;
    });
  }, []);


  /** 标记复习时记住了 → 推进到下一阶段 */
  /** 标记复习时记住了 → 连续答对 +1，连对 2 轮则掌握，否则推进复习阶段 */
  const markReviewRemembered = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((w) => {
        if (w.id !== id) return w;
        const newConsecutive = (w.consecutiveCorrect ?? 0) + 1;
        // 连续答对 2 轮 → 自动掌握
        if (newConsecutive >= 2) {
          const masteredStage = 6 as ReviewStage;
          return {
            ...w,
            consecutiveCorrect: newConsecutive,
            reviewStage: masteredStage,
            mastered: true,
            masteredTime: Date.now(),
            lastReviewDate: Date.now(),
            reviewCount: w.reviewCount + 1,
            correctRetryCount: w.correctRetryCount + 1,
          };
        }
        // 未满 2 轮，推进复习阶段
        const advanced = advanceReviewStage(w);
        return { ...advanced, consecutiveCorrect: newConsecutive };
      });
      writeWrongBook(next);
      return next;
    });
  }, []);

  /** 标记复习时没记住 → 重置回第 1 阶段 */
  /** 标记复习时没记住 → 连续答对归零，复习阶段重置回第 1 阶段 */
  const markReviewForgotten = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((w) => {
        if (w.id !== id) return w;
        const reset = resetReviewStage(w);
        return { ...reset, consecutiveCorrect: 0 };
      });
      writeWrongBook(next);
      return next;
    });
  }, []);

  /** 设置错因（答题后补充标记） */
  const setWrongReason = useCallback((id: string, reason: WrongReason) => {
    setItems((prev) => {
      const next = prev.map((w) =>
        w.id === id ? { ...w, wrongReason: reason } : w,
      );
      writeWrongBook(next);
      return next;
    });
  }, []);

  const stats = useMemo(() => {
    const topicMap = new Map<string, { total: number; pending: number; mastered: number; dueToday: number }>();
    const now = Date.now();
    for (const w of items) {
      if (!topicMap.has(w.topicKey)) {
        topicMap.set(w.topicKey, { total: 0, pending: 0, mastered: 0, dueToday: 0 });
      }
      const t = topicMap.get(w.topicKey)!;
      t.total++;
      if (w.mastered) {
        t.mastered++;
      } else {
        t.pending++;
        if (isReviewDue(w, now)) t.dueToday++;
      }
    }
    // 计算复习正确率
    let totalReviews = 0;
    let correctReviews = 0;
    for (const w of items) {
      totalReviews += w.reviewCount;
      correctReviews += w.correctRetryCount;
    }
    return {
      total: items.length,
      pendingCount: pending.length,
      masteredCount: mastered.length,
      dueTodayCount: dueToday.length,
      reviewAccuracy: totalReviews > 0 ? correctReviews / totalReviews : 0,
      totalReviews,
      byTopic: topicMap,
    };
  }, [items, pending, mastered, dueToday]);

  // 错因分布统计
  const wrongReasonStats = useMemo(() => {
    const counts: Record<WrongReason, number> = {
      'calc-mistake': 0,
      'concept': 0,
      'method': 0,
      'misread': 0,
    };
    let totalWithReason = 0;
    for (const w of items) {
      if (w.wrongReason) {
        counts[w.wrongReason]++;
        totalWithReason++;
      }
    }
    const entries = (Object.entries(counts) as [WrongReason, number][])
      .sort((a, b) => b[1] - a[1]);
    const topReason = entries[0]?.[1] > 0 ? entries[0][0] : null;
    return { counts, totalWithReason, topReason, sorted: entries };
  }, [items]);

  return {
     items,
     pending,
     mastered,
     dueToday,
     guessedPending,
     guessedDueToday,
     trulyMastered,
     stats,
     wrongReasonStats,
     addWrong,
     addGuessedCorrect,
     markGuessVerified,
     markGuessWrong,
     markGuessAgain,
     markMastered,
     removeItem,
     clearAll,
     incrementRetry,
     markReviewRemembered,
     markReviewForgotten,
     setWrongReason,
   };
}

// ===== 学习统计 =====
export interface DailyRecord {
  /** 当日总题数 */
  total: number;
  /** 当日正确数 */
  correct: number;
  /** 当日涉及的知识点题数分布 */
  topics?: Record<string, number>;
}

export interface StatsRecord {
  /** 累计练习次数（生成的题目数） */
  totalQuestions: number;
  /** 累计正确数 */
  totalCorrect: number;
  /** 累计提交次数 */
  totalAttempts: number;
  /** 各知识点统计 */
  topics: Record<
    string,
    { questions: number; correct: number; attempts: number; bestStreak: number; hintDependedCount?: number }
  >;
  /** 每次练习记录（最近 N 次的正确率快照），用于趋势图 */
  recentSessions: { date: number; correct: number; total: number }[];
  /** 当前连续学习天数 */
  streakDays: number;
  /** 上一次学习日期（YYYY-MM-DD） */
  lastStudyDate: string;
  /** 各知识点限时挑战最高分 */
  challengeBest: Record<string, { score: number; time: number }>;
  /** 自评模式统计（分开计数，用于对比分析） */
  selfEval: {
    totalAttempts: number;
    totalCorrect: number;
    /** 部分对的次数（仅大题/自评模式） */
    totalPartial: number;
    /** 提示依赖次数 */
    hintDependedCount?: number;
  };
  /** 每日刷题记录（key: YYYY-MM-DD） */
  dailyRecords: Record<string, DailyRecord>;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function readStats(): StatsRecord {
  try {
    const raw = scopedStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    const data = JSON.parse(raw);
    return { ...defaultStats(), ...data };
  } catch {
    return defaultStats();
  }
}

function defaultStats(): StatsRecord {
  return {
    totalQuestions: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    topics: {},
    recentSessions: [],
    streakDays: 0,
    lastStudyDate: '',
    challengeBest: {},
    selfEval: { totalAttempts: 0, totalCorrect: 0, totalPartial: 0, hintDependedCount: 0 },
    dailyRecords: {},
  };
}

function writeStats(s: StatsRecord) {
  try {
    scopedStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

function updateStreakDays(stats: StatsRecord): StatsRecord {
  const today = todayStr();
  if (stats.lastStudyDate === today) return stats;
  const lastDate = stats.lastStudyDate;
  if (!lastDate) {
    return { ...stats, lastStudyDate: today, streakDays: 1 };
  }
  const last = new Date(lastDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    return { ...stats, lastStudyDate: today, streakDays: stats.streakDays + 1 };
  }
  if (diffDays > 1) {
    return { ...stats, lastStudyDate: today, streakDays: 1 };
  }
  return stats;
}

export function useLearningStats() {
  const [stats, setStats] = useState<StatsRecord>(defaultStats());

  useEffect(() => {
    const initial = readStats();

    // 历史数据回填：如果 dailyRecords 为空但有错题本/统计数据
    // 用错题本的 wrongTime / lastReviewDate 估算每天题数
    if (Object.keys(initial.dailyRecords || {}).length === 0 && initial.totalAttempts > 0) {
      try {
        const wrongItemsRaw = scopedStorage.getItem(WRONG_BOOK_KEY);
        const daily: Record<string, DailyRecord> = {};
        let hasData = false;

        if (wrongItemsRaw) {
          const items: WrongItem[] = JSON.parse(wrongItemsRaw);
          for (const item of items) {
            // wrongTime：第一次错的时间
            if (item.wrongTime) {
              const d = new Date(item.wrongTime);
              const key = formatDateKey(d);
              if (!daily[key]) daily[key] = { total: 0, correct: 0, topics: {} };
              daily[key].total += 1;
              daily[key].topics![item.topicKey] = (daily[key].topics?.[item.topicKey] || 0) + 1;
              hasData = true;
            }
            // reviewCount：复习次数，分散到 wrongTime 之后的间隔天
            if (item.reviewCount && item.reviewCount > 0 && item.lastReviewDate) {
              // 估算每次复习的大致日期（平均分配到 lastReviewDate 之前）
              const lastDate = item.lastReviewDate;
              const firstDate = item.wrongTime || lastDate;
              const totalDays = Math.max(1, Math.ceil((lastDate - firstDate) / (24 * 60 * 60 * 1000)));
              for (let i = 0; i < item.reviewCount; i++) {
                const offset = Math.floor((totalDays * (i + 1)) / (item.reviewCount + 1));
                const d = new Date(firstDate + offset * 24 * 60 * 60 * 1000);
                const key = formatDateKey(d);
                if (!daily[key]) daily[key] = { total: 0, correct: 0, topics: {} };
                daily[key].total += 1;
                // 复习中大约一半算对（推进复习阶段的）
                if (i % 2 === 0) daily[key].correct += 1;
                daily[key].topics![item.topicKey] = (daily[key].topics?.[item.topicKey] || 0) + 1;
                hasData = true;
              }
            }
          }
        }

        // 加上 totalQuestions 减去错题相关后的余量，按均匀分布
        const wrongTotal = Object.values(daily).reduce((s, d) => s + d.total, 0);
        const remaining = Math.max(0, initial.totalAttempts - wrongTotal);
        if (remaining > 0 && hasData) {
          // 均匀分配到有数据的日子
          const daysWithData = Object.keys(daily);
          const perDay = Math.floor(remaining / daysWithData.length);
          const remainder = remaining - perDay * daysWithData.length;
          daysWithData.forEach((k, i) => {
            daily[k].total += perDay + (i < remainder ? 1 : 0);
            daily[k].correct += Math.round((perDay + (i < remainder ? 1 : 0)) * (initial.totalCorrect / Math.max(1, initial.totalAttempts)));
          });
        }

        if (hasData) {
          initial.dailyRecords = daily;
          writeStats(initial);
        }
      } catch {
        // 回填失败不影响正常使用
      }
    }

    setStats(initial);
  }, []);

  const recordAnswer = useCallback((topicKey: string, correct: boolean) => {
    setStats((prev) => {
      const topicData = prev.topics[topicKey] || { questions: 0, correct: 0, attempts: 0, bestStreak: 0 };
      const next = { ...prev };
      next.totalAttempts = prev.totalAttempts + 1;
      next.totalQuestions = prev.totalQuestions + (correct ? 0 : 0); // 题目计数按新题算
      if (correct) {
        next.totalCorrect = prev.totalCorrect + 1;
      }
      next.topics = {
        ...prev.topics,
        [topicKey]: {
          ...topicData,
          attempts: topicData.attempts + 1,
          correct: correct ? topicData.correct + 1 : topicData.correct,
          questions: topicData.questions + 1,
          bestStreak: topicData.bestStreak,
        },
      };
      // 更新每日记录
      const today = todayStr();
      const todayRecord = prev.dailyRecords[today] || { total: 0, correct: 0, topics: {} };
      next.dailyRecords = {
        ...prev.dailyRecords,
        [today]: {
          total: todayRecord.total + 1,
          correct: todayRecord.correct + (correct ? 1 : 0),
          topics: {
            ...(todayRecord.topics || {}),
            [topicKey]: (todayRecord.topics?.[topicKey] || 0) + 1,
          },
        },
      };
      // 更新连续学习天数
      const withStreak = updateStreakDays(next);
      writeStats(withStreak);
      return withStreak;
    });
  }, []);

  const recordQuestion = useCallback((topicKey: string) => {
    setStats((prev) => {
      const topicData = prev.topics[topicKey] || { questions: 0, correct: 0, attempts: 0, bestStreak: 0 };
      const next = {
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        topics: {
          ...prev.topics,
          [topicKey]: { ...topicData, questions: topicData.questions + 1 },
        },
      };
      const withStreak = updateStreakDays(next);
      writeStats(withStreak);
      return withStreak;
    });
  }, []);

  const recordChallengeBest = useCallback((topicKey: string, score: number) => {
    setStats((prev) => {
      const current = prev.challengeBest[topicKey];
      if (current && current.score >= score) return prev;
      const next = {
        ...prev,
        challengeBest: {
          ...prev.challengeBest,
          [topicKey]: { score, time: Date.now() },
        },
      };
      writeStats(next);
      return next;
    });
  }, []);

  /** 记录一次会话（用于趋势图），每次限时挑战结束或刷题完成时调用 */
  const recordSession = useCallback((correct: number, total: number) => {
    setStats((prev) => {
      const session = { date: Date.now(), correct, total };
      const recent = [...prev.recentSessions, session].slice(-10);
      const next = { ...prev, recentSessions: recent };
      writeStats(next);
      return next;
    });
  }, []);

  /** 记录自评结果（自评模式）—— isPartial 表示部分对 */
  const recordSelfEvalAnswer = useCallback((topicKey: string, result: 'correct' | 'wrong' | 'partial') => {
    setStats((prev) => {
      const topicData = prev.topics[topicKey] || { questions: 0, correct: 0, attempts: 0, bestStreak: 0 };
      const isCorrect = result === 'correct';
      const next = { ...prev };
      next.totalAttempts = prev.totalAttempts + 1;
      if (isCorrect) {
        next.totalCorrect = prev.totalCorrect + 1;
      }
      next.topics = {
        ...prev.topics,
        [topicKey]: {
          ...topicData,
          attempts: topicData.attempts + 1,
          correct: isCorrect ? topicData.correct + 1 : topicData.correct,
          questions: topicData.questions + 1,
          bestStreak: topicData.bestStreak,
        },
      };
      // 自评模式单独统计
      next.selfEval = {
        totalAttempts: prev.selfEval.totalAttempts + 1,
        totalCorrect: prev.selfEval.totalCorrect + (isCorrect ? 1 : 0),
        totalPartial: prev.selfEval.totalPartial + (result === 'partial' ? 1 : 0),
      };
      // 更新每日记录
      const today = todayStr();
      const todayRecord = prev.dailyRecords[today] || { total: 0, correct: 0, topics: {} };
      next.dailyRecords = {
        ...prev.dailyRecords,
        [today]: {
          total: todayRecord.total + 1,
          correct: todayRecord.correct + (isCorrect ? 1 : 0),
          topics: {
            ...(todayRecord.topics || {}),
            [topicKey]: (todayRecord.topics?.[topicKey] || 0) + 1,
          },
        },
      };
      const withStreak = updateStreakDays(next);
      writeStats(withStreak);
      return withStreak;
    });
  }, []);

  /** 记录提示使用情况：hintLevel 1/2/3，对应提示依赖程度 */
  const recordHintUsage = useCallback((topicKey: string, hintLevel: number) => {
    if (hintLevel < 1) return;
    setStats((prev) => {
      const topicData = prev.topics[topicKey] || { questions: 0, correct: 0, attempts: 0, bestStreak: 0 };
      const currentHintCount = topicData.hintDependedCount ?? 0;
      const globalHintCount = prev.selfEval.hintDependedCount ?? 0;
      const next = { ...prev };
      next.topics = {
        ...prev.topics,
        [topicKey]: {
          ...topicData,
          hintDependedCount: currentHintCount + hintLevel, // 层级越高，依赖越重
        },
      };
      next.selfEval = {
        ...prev.selfEval,
        hintDependedCount: globalHintCount + 1,
      };
      writeStats(next);
      return next;
    });
  }, []);

  const totalAccuracy = useMemo(() => {
    if (stats.totalAttempts === 0) return 0;
    return stats.totalCorrect / stats.totalAttempts;
  }, [stats]);

  const topicMastery = useMemo(() => {
    const result: Record<string, { attempts: number; correct: number; accuracy: number; hintDependedCount: number }> = {};
    for (const [key, data] of Object.entries(stats.topics)) {
      result[key] = {
        attempts: data.attempts,
        correct: data.correct,
        accuracy: data.attempts > 0 ? data.correct / data.attempts : 0,
        hintDependedCount: data.hintDependedCount ?? 0,
      };
    }
    return result;
  }, [stats]);

  const resetStats = useCallback(() => {
    const fresh = defaultStats();
    setStats(fresh);
    writeStats(fresh);
  }, []);

  return {
    stats,
    totalAccuracy,
    topicMastery,
    recordAnswer,
    recordSelfEvalAnswer,
    recordQuestion,
    recordChallengeBest,
    recordSession,
    recordHintUsage,
    resetStats,
  };
}

// ===== 收藏夹 =====
export interface FavoriteItem {
  id: string;
  moduleKey: string;
  moduleLabel: string;
  expression: string;
  result: string;
  /** 可选的 latex 表达式，用于渲染 */
  resultLatex?: string;
  savedAt: number;
}

function readFavorites(): FavoriteItem[] {
  try {
    const raw = scopedStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeFavorites(items: FavoriteItem[]) {
  try {
    scopedStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function useFavorites() {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setItems(readFavorites());
  }, []);

  const addFavorite = useCallback(
    (item: Omit<FavoriteItem, 'id' | 'savedAt'>): { ok: boolean; reason?: string } => {
      let ok = true;
      let reason: string | undefined;
      setItems((prev) => {
        if (prev.length >= FAVORITES_LIMIT) {
          ok = false;
          reason = `收藏夹已满（上限 ${FAVORITES_LIMIT} 条）`;
          return prev;
        }
        // 去重：同模块 + 同表达式 + 同结果
        const dup = prev.some(
          (f) => f.moduleKey === item.moduleKey && f.expression === item.expression && f.result === item.result,
        );
        if (dup) {
          ok = false;
          reason = '已收藏过该结果';
          return prev;
        }
        const fav: FavoriteItem = {
          ...item,
          id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          savedAt: Date.now(),
        };
        const next = [fav, ...prev];
        writeFavorites(next);
        return next;
      });
      return { ok, reason };
    },
    [],
  );

  const removeFavorite = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((f) => f.id !== id);
      writeFavorites(next);
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setItems([]);
    writeFavorites([]);
  }, []);

  const isFavorited = useCallback(
    (moduleKey: string, expression: string, result: string) => {
      return items.some(
        (f) => f.moduleKey === moduleKey && f.expression === expression && f.result === result,
      );
    },
    [items],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, FavoriteItem[]>();
    for (const f of items) {
      if (!map.has(f.moduleKey)) map.set(f.moduleKey, []);
      map.get(f.moduleKey)!.push(f);
    }
    return map;
  }, [items]);

  return { items, grouped, addFavorite, removeFavorite, clearFavorites, isFavorited, limit: FAVORITES_LIMIT };
}

// ===== 练习设置（答题模式）=====

export function usePracticeSettings() {
  const [settings, setSettings] = useState<PracticeSettings>(() => {
    try {
      const raw = scopedStorage.getItem(PRACTICE_SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    // 默认输入判分：能真正判对错，也让数学键盘有用武之地；
    // 已保存过偏好的用户不受影响（下面会读 localStorage）
    return { answerMode: 'auto' };
  });

  const setAnswerMode = useCallback((mode: AnswerMode) => {
    setSettings((prev) => {
      const next = { ...prev, answerMode: mode };
      try { scopedStorage.setItem(PRACTICE_SETTINGS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const toggleAnswerMode = useCallback(() => {
    setAnswerMode(settings.answerMode === 'auto' ? 'self-eval' : 'auto');
  }, [settings.answerMode, setAnswerMode]);

  return { settings, answerMode: settings.answerMode, setAnswerMode, toggleAnswerMode };
}

// ===== 题目收藏（刷题模块用） =====

export const QUESTION_FAVORITES_KEY = '__mathforge_question_favorites';
export const QUESTION_FAVORITES_LIMIT = 200;

export interface QuestionFavoriteItem {
  id: string; // 收藏项唯一 id
  questionId: string; // 题目模板 id / 种子 id
  topicKey: string;
  topicLabel: string;
  category: string;
  difficulty: 'basic' | 'advanced' | 'competition';
  question: string; // 题干纯文本
  questionLatex: string; // 题干 LaTeX
  answer: string; // 正确答案
  answerDisplay: string; // 答案展示文本
  steps: string[]; // 解析步骤
  savedAt: number;
}

function readQuestionFavorites(): QuestionFavoriteItem[] {
  try {
    const raw = scopedStorage.getItem(QUESTION_FAVORITES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeQuestionFavorites(items: QuestionFavoriteItem[]) {
  try {
    scopedStorage.setItem(QUESTION_FAVORITES_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function useQuestionFavorites() {
  const [items, setItems] = useState<QuestionFavoriteItem[]>([]);

  useEffect(() => {
    setItems(readQuestionFavorites());
  }, []);

  const toggleFavorite = useCallback(
    (question: {
      id: string;
      topicKey: string;
      topicLabel: string;
      category: string;
      difficulty: 'basic' | 'advanced' | 'competition';
      question: string;
      questionLatex: string;
      answer: string;
      answerDisplay: string;
      steps: string[];
    }): { added: boolean } => {
      let added = false;
      setItems((prev) => {
        const existing = prev.find((f) => f.questionId === question.id);
        if (existing) {
          // 取消收藏
          const next = prev.filter((f) => f.questionId !== question.id);
          writeQuestionFavorites(next);
          added = false;
          return next;
        }
        // 新增收藏
        if (prev.length >= QUESTION_FAVORITES_LIMIT) {
          added = false;
          return prev;
        }
        const fav: QuestionFavoriteItem = {
          id: `qf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          questionId: question.id,
          topicKey: question.topicKey,
          topicLabel: question.topicLabel,
          category: question.category,
          difficulty: question.difficulty,
          question: question.question,
          questionLatex: question.questionLatex,
          answer: question.answer,
          answerDisplay: question.answerDisplay,
          steps: question.steps,
          savedAt: Date.now(),
        };
        const next = [fav, ...prev];
        writeQuestionFavorites(next);
        added = true;
        return next;
      });
      return { added };
    },
    [],
  );

  const isFavorited = useCallback(
    (questionId: string) => items.some((f) => f.questionId === questionId),
    [items],
  );

  const removeFavorite = useCallback((questionId: string) => {
    setItems((prev) => {
      const next = prev.filter((f) => f.questionId !== questionId);
      writeQuestionFavorites(next);
      return next;
    });
  }, []);

  return { items, toggleFavorite, isFavorited, removeFavorite, limit: QUESTION_FAVORITES_LIMIT };
}

// ===== 热力图 & 年度报告 工具函数 =====

export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface HeatmapDay {
  date: string;
  total: number;
  correct: number;
  level: 0 | 1 | 2 | 3 | 4;
  weekDay: number; // 0-6, 0=Sunday
  weekIndex: number; // 第几周（从起始日算）
  topics?: Record<string, number>;
}

export interface HeatmapData {
  days: HeatmapDay[];
  totalDays: number;
  totalQuestions: number;
  totalCorrect: number;
  activeDays: number;
  /** 本月（自然月）总题数 */
  monthTotal: number;
  /** 当前 streak：截至昨日/今日的连续天数 */
  currentStreak: number;
  /** 最长连续天数 */
  longestStreak: number;
  /** 12 个月份标签及其起始列索引 */
  monthLabels: { label: string; weekIndex: number }[];
}

/**
 * 生成近 365 天热力图数据
 * level 分级: 0=0题, 1=1-5题, 2=6-15题, 3=16-30题, 4=30+题
 */
export function generateHeatmapData(dailyRecords: Record<string, DailyRecord>, endDate: Date = new Date()): HeatmapData {
  const days: HeatmapDay[] = [];
  let totalQuestions = 0;
  let totalCorrect = 0;
  let activeDays = 0;

  // 计算 365 天前的日期，对齐到所在周的周日（第一列）
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const startDay = new Date(end);
  startDay.setDate(startDay.getDate() - 364); // 365 天 = 52周 + 1天
  // 向前对齐到周日
  const startWeekDay = startDay.getDay();
  startDay.setDate(startDay.getDate() - startWeekDay);

  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  const d = new Date(startDay);
  while (d <= end) {
    const key = formatDateKey(d);
    const record = dailyRecords[key];
    const total = record?.total ?? 0;
    const correct = record?.correct ?? 0;
    const weekIndex = Math.floor((d.getTime() - startDay.getTime()) / (7 * 24 * 60 * 60 * 1000));

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (total >= 31) level = 4;
    else if (total >= 16) level = 3;
    else if (total >= 6) level = 2;
    else if (total >= 1) level = 1;

    if (total > 0) {
      activeDays++;
      totalQuestions += total;
      totalCorrect += correct;
    }

    // 月标签：遇到该月第一个周列时记录
    const month = d.getMonth();
    if (month !== lastMonth && d.getDate() <= 7) {
      monthLabels.push({ label: `${month + 1}月`, weekIndex });
      lastMonth = month;
    }

    days.push({
      date: key,
      total,
      correct,
      level,
      weekDay: d.getDay(),
      weekIndex,
      topics: record?.topics,
    });

    d.setDate(d.getDate() + 1);
  }

  // 计算 streak / longest streak（仅在有活动的日子里）
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  // 从今天往回数连续天数
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].total > 0) {
      runningStreak++;
    } else {
      // 今天没做的话，streak 从昨天开始算；但如果昨天也没做就是 0
      if (i === days.length - 1) {
        // 今天=最后一天，跳过，看昨天
        continue;
      }
      break;
    }
  }
  currentStreak = runningStreak;

  // 最长连续：正向遍历
  runningStreak = 0;
  for (const day of days) {
    if (day.total > 0) {
      runningStreak++;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  // 本月总题数
  const nowMonth = end.getMonth();
  const nowYear = end.getFullYear();
  let monthTotal = 0;
  for (const day of days) {
    const [y, m] = day.date.split('-').map(Number);
    if (y === nowYear && m - 1 === nowMonth) {
      monthTotal += day.total;
    }
  }

  return {
    days,
    totalDays: days.length,
    totalQuestions,
    totalCorrect,
    activeDays,
    monthTotal,
    currentStreak,
    longestStreak,
    monthLabels,
  };
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  studiedToday: boolean;
}

export function computeStreakInfo(dailyRecords: Record<string, DailyRecord>, now: Date = new Date()): StreakInfo {
  const today = formatDateKey(now);
  const studiedToday = (dailyRecords[today]?.total ?? 0) > 0;

  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;

  // 从今天/昨天往回数
  const keys = Object.keys(dailyRecords).sort();
  const dateSet = new Set(keys.filter((k) => (dailyRecords[k]?.total ?? 0) > 0));

  // 从今天往前数连续天数
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!studiedToday) {
    d.setDate(d.getDate() - 1); // 从昨天开始数
  }
  while (dateSet.has(formatDateKey(d))) {
    currentStreak++;
    d.setDate(d.getDate() - 1);
  }

  // 最长连续：需要按日期正向遍历
  if (keys.length > 0) {
    const sortedKeys = keys.filter((k) => (dailyRecords[k]?.total ?? 0) > 0).sort();
    if (sortedKeys.length > 0) {
      running = 1;
      longestStreak = 1;
      for (let i = 1; i < sortedKeys.length; i++) {
        const prev = new Date(sortedKeys[i - 1]);
        const curr = new Date(sortedKeys[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));
        if (diffDays === 1) {
          running++;
          longestStreak = Math.max(longestStreak, running);
        } else {
          running = 1;
        }
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastStudyDate: studiedToday ? today : '',
    studiedToday,
  };
}

export interface AnnualReport {
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  activeDays: number;
  longestStreak: number;
  currentStreak: number;
  hardestMonth: { month: string; count: number } | null;
  masteredTopics: number;
  totalTopics: number;
  favoriteTopic: { key: string; count: number } | null;
  dateRange: { start: string; end: string };
  /** 每个月的题数数组，12 个元素按 1-12 月排列（按年度报告自然年：若年内则到当前月为止） */
  monthlyBreakdown: { month: number; label: string; count: number; correct: number }[];
}

/** 生成近 365 天年度报告 */
export function computeAnnualReport(
  dailyRecords: Record<string, DailyRecord>,
  topics: StatsRecord['topics'],
  endDate: Date = new Date(),
): AnnualReport {
  const heatmap = generateHeatmapData(dailyRecords, endDate);

  // 月度分布
  const monthMap = new Map<number, { count: number; correct: number }>();
  for (let i = 0; i < 12; i++) monthMap.set(i, { count: 0, correct: 0 });

  for (const day of heatmap.days) {
    const m = new Date(day.date).getMonth();
    const cur = monthMap.get(m) || { count: 0, correct: 0 };
    cur.count += day.total;
    cur.correct += day.correct;
    monthMap.set(m, cur);
  }

  const monthlyBreakdown = Array.from(monthMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([m, v]) => ({
      month: m,
      label: `${m + 1}月`,
      count: v.count,
      correct: v.correct,
    }));

  // 最努力月份（题数最多的月）
  let hardestMonth: { month: string; count: number } | null = null;
  let maxCount = 0;
  for (const m of monthlyBreakdown) {
    if (m.count > maxCount) {
      maxCount = m.count;
      hardestMonth = { month: m.label, count: m.count };
    }
  }

  // 最爱的专题
  let favoriteTopic: { key: string; count: number } | null = null;
  let favCount = 0;
  for (const [key, t] of Object.entries(topics)) {
    if (t.questions > favCount) {
      favCount = t.questions;
      favoriteTopic = { key, count: t.questions };
    }
  }

  // 已掌握专题（正确率 >= 80% 且题目数 >= 5）
  let masteredTopics = 0;
  const totalTopics = Object.keys(topics).length;
  for (const t of Object.values(topics)) {
    if (t.questions >= 5 && t.attempts > 0 && t.correct / t.attempts >= 0.8) {
      masteredTopics++;
    }
  }

  // 日期范围
  const end = formatDateKey(endDate);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 364);
  const start = formatDateKey(startDate);

  return {
    totalQuestions: heatmap.totalQuestions,
    totalCorrect: heatmap.totalCorrect,
    accuracy: heatmap.totalQuestions > 0 ? heatmap.totalCorrect / heatmap.totalQuestions : 0,
    activeDays: heatmap.activeDays,
    longestStreak: heatmap.longestStreak,
    currentStreak: heatmap.currentStreak,
    hardestMonth,
    masteredTopics,
    totalTopics,
    favoriteTopic,
    dateRange: { start, end },
    monthlyBreakdown,
  };
}
