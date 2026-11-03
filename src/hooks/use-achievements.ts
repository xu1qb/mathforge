// EXPORTS: useAchievements, type AchievementBadge, type AchievementProgress, ACHIEVEMENTS_KEY
// 成就徽章系统 hook

import { useState, useEffect, useCallback, useMemo } from 'react';
import { scopedStorage } from '@/lib/lark-mock';

export const ACHIEVEMENTS_KEY = 'mathforge_achievements';

export interface AchievementProgress {
  totalPracticeSessions: number; // 累计练习次数
  streakDays: number; // 连续打卡天数
  bestStreak: number; // 最长连续天数
  totalCheckInDays: number; // 累计打卡天数
  masteredTopics: number; // 已掌握专题数
  totalTopics: number; // 总专题数
  mockExamsCompleted: number; // 完成模拟卷数
  mockExamsAbove80: number; // ≥80 分模拟卷数
  challengeCompleted: boolean; // 是否完成挑战卷
  sprintExamsCompleted: number; // 完成冲刺卷数
  wrongBookCleared: boolean; // 错题本是否清零
  unlockedAt: Record<string, number>; // 徽章 id → 解锁时间戳
}

function defaultProgress(totalTopics = 8): AchievementProgress {
  return {
    totalPracticeSessions: 0,
    streakDays: 0,
    bestStreak: 0,
    totalCheckInDays: 0,
    masteredTopics: 0,
    totalTopics,
    mockExamsCompleted: 0,
    mockExamsAbove80: 0,
    challengeCompleted: false,
    sprintExamsCompleted: 0,
    wrongBookCleared: false,
    unlockedAt: {},
  };
}

function readProgress(): AchievementProgress {
  try {
    const raw = scopedStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return defaultProgress();
    const data = JSON.parse(raw);
    return { ...defaultProgress(), ...data };
  } catch {
    return defaultProgress();
  }
}

function writeProgress(p: AchievementProgress) {
  try {
    scopedStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji 作为图标
  /** 当前进度值 */
  current: number;
  /** 达成阈值 */
  target: number;
  /** 进度单位 */
  unit: string;
  /** 是否已解锁 */
  unlocked: boolean;
  /** 解锁时间 */
  unlockedAt?: number;
  /** 稀有度 */
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGE_DEFS: Omit<AchievementBadge, 'current' | 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first-practice',
    name: '启程',
    description: '完成第一次练习',
    icon: '🚀',
    target: 1,
    unit: '次',
    rarity: 'common',
  },
  {
    id: 'streak-3',
    name: '三日不懈',
    description: '连续打卡 3 天',
    icon: '🔥',
    target: 3,
    unit: '天',
    rarity: 'common',
  },
  {
    id: 'streak-7',
    name: '一周坚持',
    description: '连续打卡 7 天',
    icon: '⚡',
    target: 7,
    unit: '天',
    rarity: 'rare',
  },
  {
    id: 'streak-14',
    name: '半月磨砺',
    description: '连续打卡 14 天',
    icon: '🗡️',
    target: 14,
    unit: '天',
    rarity: 'rare',
  },
  {
    id: 'streak-21',
    name: '三周冲刺',
    description: '连续打卡 21 天',
    icon: '🏹',
    target: 21,
    unit: '天',
    rarity: 'epic',
  },
  {
    id: 'topic-master',
    name: '专题大师',
    description: '任一专题知识点全部掌握',
    icon: '🎯',
    target: 1,
    unit: '个',
    rarity: 'rare',
  },
  {
    id: 'all-topics',
    name: '全专题精通',
    description: '8 大专题全部掌握',
    icon: '👑',
    target: 8,
    unit: '个',
    rarity: 'legendary',
  },
  {
    id: 'first-mock',
    name: '模拟首秀',
    description: '完成第一套模拟卷',
    icon: '📝',
    target: 1,
    unit: '套',
    rarity: 'common',
  },
  {
    id: 'high-score',
    name: '高分突破',
    description: '模拟卷得分 ≥ 80 分',
    icon: '🏆',
    target: 1,
    unit: '次',
    rarity: 'epic',
  },
  {
    id: 'challenge-passed',
    name: '挑战成功',
    description: '完成 C 套挑战卷',
    icon: '💪',
    target: 1,
    unit: '次',
    rarity: 'epic',
  },
  {
    id: 'wrong-book-clear',
    name: '错题清零',
    description: '错题本全部标记掌握',
    icon: '✅',
    target: 1,
    unit: '次',
    rarity: 'rare',
  },
  {
    id: 'checkin-30',
    name: '满月砺剑',
    description: '累计打卡 30 天',
    icon: '🌕',
    target: 30,
    unit: '天',
    rarity: 'epic',
  },
  {
    id: 'sprint-warrior',
    name: '冲刺勇士',
    description: '完成首份全真冲刺卷',
    icon: '🚀',
    target: 1,
    unit: '份',
    rarity: 'epic',
  },
];

/**
 * 从外部状态计算徽章进度
 * @param stats 学习统计
 * @param masteredTopics 已掌握专题数
 * @param totalTopics 总专题数
 * @param examHistory 模拟考历史
 * @param wrongCount 错题本未掌握数量
 */
export function computeBadgeProgress(
  stats: { totalAttempts: number; streakDays: number; bestStreak: number; totalCheckInDays?: number },
  masteredTopics: number,
  totalTopics: number,
  examHistory: { score: number; presetKey?: string; difficultyTier?: string; examKind?: string }[],
  wrongCount: number,
): AchievementProgress {
  const mockCompleted = examHistory.length;
  const mockAbove80 = examHistory.filter((e) => e.score >= 80).length;
  const challengeDone = examHistory.some((e) => e.presetKey === 'standard-c');
  const sprintDone = examHistory.filter((e) => e.difficultyTier === 'sprint').length;

  return {
    totalPracticeSessions: stats.totalAttempts,
    streakDays: stats.streakDays,
    bestStreak: stats.bestStreak,
    totalCheckInDays: stats.totalCheckInDays ?? 0,
    masteredTopics,
    totalTopics,
    mockExamsCompleted: mockCompleted,
    mockExamsAbove80: mockAbove80,
    challengeCompleted: challengeDone,
    sprintExamsCompleted: sprintDone,
    wrongBookCleared: wrongCount === 0 && mockCompleted > 0, // 有做过题且当前无错题
    unlockedAt: {}, // 由 hook 内部维护
  };
}

export function useAchievements() {
  const [progress, setProgress] = useState<AchievementProgress>(() => readProgress());

  // 读取持久化
  useEffect(() => {
    setProgress(readProgress());
  }, []);

  /**
   * 更新进度并返回新解锁的徽章 id 列表
   */
  const updateProgress = useCallback((next: AchievementProgress): string[] => {
    const prev = readProgress();
    // 继承已解锁记录
    next.unlockedAt = { ...prev.unlockedAt };
    const newlyUnlocked: string[] = [];

    for (const def of BADGE_DEFS) {
      if (next.unlockedAt[def.id]) continue;
      const current = getBadgeCurrent(def.id, next);
      if (current >= def.target) {
        next.unlockedAt[def.id] = Date.now();
        newlyUnlocked.push(def.id);
      }
    }

    writeProgress(next);
    setProgress(next);
    return newlyUnlocked;
  }, []);

  const badges = useMemo<AchievementBadge[]>(() => {
    return BADGE_DEFS.map((def) => {
      const current = getBadgeCurrent(def.id, progress);
      const unlocked = progress.unlockedAt[def.id] !== undefined;
      return {
        ...def,
        current: Math.min(current, def.target),
        unlocked,
        unlockedAt: progress.unlockedAt[def.id],
      };
    });
  }, [progress]);

  const unlockedCount = useMemo(() => badges.filter((b) => b.unlocked).length, [badges]);

  return { badges, progress, unlockedCount, updateProgress, totalBadges: BADGE_DEFS.length };
}

// ============================================================
// 内部：根据 badge id 取当前进度值
// ============================================================
function getBadgeCurrent(id: string, p: AchievementProgress): number {
  switch (id) {
    case 'first-practice':
      return p.totalPracticeSessions > 0 ? 1 : 0;
    case 'streak-3':
    case 'streak-7':
    case 'streak-14':
    case 'streak-21':
      return p.streakDays;
    case 'checkin-30':
      return p.totalCheckInDays;
    case 'topic-master':
      return p.masteredTopics >= 1 ? 1 : 0;
    case 'all-topics':
      return p.masteredTopics;
    case 'first-mock':
      return p.mockExamsCompleted >= 1 ? 1 : 0;
    case 'high-score':
      return p.mockExamsAbove80 >= 1 ? 1 : 0;
    case 'challenge-passed':
      return p.challengeCompleted ? 1 : 0;
    case 'sprint-warrior':
      return p.sprintExamsCompleted >= 1 ? 1 : 0;
    case 'wrong-book-clear':
      return p.wrongBookCleared ? 1 : 0;
    default:
      return 0;
  }
}
