// EXPORTS: DashboardData, WeeklyAccuracyPoint, TopicStat, ExamScorePoint, RadarIndicator, computeDashboardData, generateStudySuggestions
// 备考数据总览看板：从 localStorage 聚合所有学习数据

import { scopedStorage } from '@/lib/lark-mock';
import { COMPETITION_TOPICS } from './competition';
import { STATS_KEY, WRONG_BOOK_KEY, type StatsRecord, type WrongItem } from '@/hooks/use-learning';
import {
  DAILY_STREAK_KEY,
  type StreakRecord,
  getDaysLeft,
} from './competition-sprint';
import type { ExamHistoryRecord } from './competition-mock';

const EXAM_HISTORY_KEY = 'mathforge:competition:exam-history';
const REAL_EXAM_HISTORY_KEY = 'competition:real-exam-history';

export interface WeeklyAccuracyPoint {
  weekLabel: string;
  accuracy: number;
  total: number;
}

export interface TopicStat {
  topicKey: string;
  topicTitle: string;
  questions: number;
  correct: number;
  accuracy: number;
}

export interface ExamScorePoint {
  label: string;
  date: string;
  score: number;
  totalScore: number;
  accuracy: number;
}

export interface RadarIndicator {
  name: string;
  value: number; // 0-100
}

export interface DashboardData {
  hasData: boolean;
  // 累计指标
  totalQuestions: number;
  totalAccuracy: number;
  totalExams: number;
  streakDays: number;
  studyMinutes: number; // 估算学习时长（分钟）
  // 趋势
  weeklyAccuracy: WeeklyAccuracyPoint[];
  // 专题做题量分布
  topicDistribution: TopicStat[];
  // 套卷成绩曲线
  examScores: ExamScorePoint[];
  // 错题分布
  wrongDistribution: WrongDistributionItem[];
  weakTopics: string[]; // 正确率最低的 3 个专题
  // 雷达图（8 大专题掌握度）
  radarData: RadarIndicator[];
  // 建议
  suggestions: string[];
}

// ============================================================
// 读取数据
// ============================================================

function safeReadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = scopedStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ============================================================
// 主计算函数
// ============================================================

export function computeDashboardData(): DashboardData {
  const stats = safeReadJSON<StatsRecord>(STATS_KEY, {
    totalQuestions: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    topics: {},
    recentSessions: [],
    streakDays: 0,
    lastStudyDate: '',
    challengeBest: {},
    selfEval: { totalAttempts: 0, totalCorrect: 0, totalPartial: 0 },
    dailyRecords: {},
  });

  const wrongBook = safeReadJSON<WrongItem[]>(WRONG_BOOK_KEY, []);
  const streak = safeReadJSON<StreakRecord>(DAILY_STREAK_KEY, { current: 0, longest: 0, lastDate: '' });
  const examHistory = safeReadJSON<ExamHistoryRecord[]>(EXAM_HISTORY_KEY, []);
  const realExamHistory = safeReadJSON<ExamHistoryRecord[]>(REAL_EXAM_HISTORY_KEY, []);

  const allExams = [...examHistory, ...realExamHistory];

  // ---- 累计指标 ----
  const totalQuestions = stats.totalAttempts + stats.selfEval.totalAttempts + allExams.reduce((s, e) => s + (e.totalCount ?? 0), 0);
  const totalCorrect = stats.totalCorrect + stats.selfEval.totalCorrect + allExams.reduce((s, e) => s + (e.correctCount ?? 0), 0);
  const totalAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
  const totalExams = allExams.length;
  const streakDays = Math.max(stats.streakDays, streak.current);

  // 估算学习时长：每题 ~ 2 分钟 + 每套卷 ~ 120 分钟
  const studyMinutes = totalQuestions * 2 + totalExams * 120;

  // ---- 正确率趋势（最近 8 周）----
  const weeklyData = computeWeeklyAccuracy(stats, examHistory, realExamHistory);

  // ---- 专题做题量分布 ----
  const topicDistribution = computeTopicDistribution(stats);

  // ---- 套卷成绩曲线 ----
  const examScores = computeExamScores(allExams);

  // ---- 错题分布 ----
  const wrongDistribution = computeWrongDistribution(wrongBook);

  // ---- 薄弱专题 ----
  const weakTopics = topicDistribution
    .filter((t) => t.questions > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map((t) => t.topicKey);

  // ---- 雷达图 ----
  const radarData = computeRadarData(topicDistribution);

  // ---- 建议 ----
  const suggestions = generateStudySuggestions({
    totalQuestions,
    totalAccuracy,
    totalExams,
    weakTopics,
    topicDistribution,
    daysLeft: getDaysLeft(),
    streakDays,
  });

  const hasData =
    totalQuestions > 0 ||
    totalExams > 0 ||
    wrongBook.length > 0 ||
    streakDays > 0;

  return {
    hasData,
    totalQuestions,
    totalAccuracy,
    totalExams,
    streakDays,
    studyMinutes,
    weeklyAccuracy: weeklyData,
    topicDistribution,
    examScores,
    wrongDistribution,
    weakTopics,
    radarData,
    suggestions,
  };
}

// ============================================================
// 各子模块计算
// ============================================================

function computeWeeklyAccuracy(
  stats: StatsRecord,
  examHistory: ExamHistoryRecord[],
  realExamHistory: ExamHistoryRecord[],
): WeeklyAccuracyPoint[] {
  // 最近 8 周
  const weeks: { label: string; start: Date; correct: number; total: number }[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 找到最近 8 个周一
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const thisMonday = new Date(now);
  thisMonday.setDate(diff);

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(thisMonday.getDate() - i * 7);
    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    weeks.push({ label, start: weekStart, correct: 0, total: 0 });
  }

  // 从 stats.recentSessions 累加
  if (stats.recentSessions && stats.recentSessions.length > 0) {
    for (const sess of stats.recentSessions) {
      const d = new Date(sess.date);
      // 找所属周
      for (let i = weeks.length - 1; i >= 0; i--) {
        if (d >= weeks[i].start && (i === weeks.length - 1 || d < weeks[i + 1].start)) {
          weeks[i].correct += sess.correct;
          weeks[i].total += sess.total;
          break;
        }
      }
    }
  }

  // 从 exam history 累加
  const allExams = [...examHistory, ...realExamHistory];
  for (const exam of allExams) {
    const d = new Date(exam.date);
    for (let i = weeks.length - 1; i >= 0; i--) {
      if (d >= weeks[i].start && (i === weeks.length - 1 || d < weeks[i + 1].start)) {
        weeks[i].correct += exam.correctCount ?? 0;
          weeks[i].total += exam.totalCount ?? 0;
        break;
      }
    }
  }

  return weeks.map((w) => ({
    weekLabel: w.label,
    accuracy: w.total > 0 ? w.correct / w.total : 0,
    total: w.total,
  }));
}

function computeTopicDistribution(stats: StatsRecord): TopicStat[] {
  return COMPETITION_TOPICS.map((topic) => {
    const t = stats.topics[topic.key];
    const questions = t?.questions ?? 0;
    const correct = t?.correct ?? 0;
    return {
      topicKey: topic.key,
      topicTitle: topic.title,
      questions,
      correct,
      accuracy: questions > 0 ? correct / questions : 0,
    };
  });
}

function computeExamScores(exams: ExamHistoryRecord[]): ExamScorePoint[] {
  const sorted = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return sorted.map((e, i) => ({
    label: `第${i + 1}套`,
    date: typeof e.date === 'number' ? new Date(e.date).toLocaleDateString() : String(e.date),
    score: e.score ?? 0,
    totalScore: e.totalScore ?? 100,
    accuracy: e.totalScore ? e.score / e.totalScore : 0,
  }));
}

export interface WrongDistributionItem {
  topicKey: string;
  topicTitle: string;
  count: number;
  dueToday: number;
  mastered: number;
}

function computeWrongDistribution(wrongBook: WrongItem[]): WrongDistributionItem[] {
  const pendingMap = new Map<string, number>();
  const dueMap = new Map<string, number>();
  const masteredMap = new Map<string, number>();
  const now = Date.now();
  for (const item of wrongBook) {
    if (item.mastered) {
      masteredMap.set(item.topicKey, (masteredMap.get(item.topicKey) ?? 0) + 1);
      continue;
    }
    pendingMap.set(item.topicKey, (pendingMap.get(item.topicKey) ?? 0) + 1);
    if (item.nextReviewDate && item.nextReviewDate <= now) {
      dueMap.set(item.topicKey, (dueMap.get(item.topicKey) ?? 0) + 1);
    }
  }

  return COMPETITION_TOPICS.map((t) => ({
    topicKey: t.key,
    topicTitle: t.title,
    count: pendingMap.get(t.key) ?? 0,
    dueToday: dueMap.get(t.key) ?? 0,
    mastered: masteredMap.get(t.key) ?? 0,
  })).sort((a, b) => b.count - a.count);
}

function computeRadarData(topicDistribution: TopicStat[]): RadarIndicator[] {
  return topicDistribution.map((t) => {
    // 掌握度 = 正确率 × 0.6 + 做题量归一化 × 0.4
    // 做题量归一化：相对最大值的比例（至少有 5 题才算入门）
    const maxQ = Math.max(...topicDistribution.map((x) => x.questions), 5);
    const quantityScore = Math.min(t.questions / maxQ, 1);
    const mastery = Math.round((t.accuracy * 0.6 + quantityScore * 0.4) * 100);
    return {
      name: t.topicTitle,
      value: mastery,
    };
  });
}

// ============================================================
// 学习建议生成
// ============================================================

export function generateStudySuggestions(params: {
  totalQuestions: number;
  totalAccuracy: number;
  totalExams: number;
  weakTopics: string[];
  topicDistribution: TopicStat[];
  daysLeft: number;
  streakDays: number;
}): string[] {
  const { totalQuestions, totalAccuracy, totalExams, weakTopics, daysLeft, streakDays } = params;
  const suggestions: string[] = [];

  if (totalQuestions === 0) {
    suggestions.push('开始你的第一次练习，建立学习基线');
    suggestions.push('从每日一练入手，每天保持手感');
    return suggestions;
  }

  // 薄弱专题建议
  if (weakTopics.length > 0) {
    const topicNames = weakTopics
      .map((k) => COMPETITION_TOPICS.find((t) => t.key === k)?.title)
      .filter(Boolean) as string[];
    if (topicNames.length > 0) {
      suggestions.push(
        `重点突破「${topicNames[0]}」专题，正确率有待提升，建议加练 10 题`,
      );
    }
  }

  // 正确率整体建议
  if (totalQuestions >= 10 && totalAccuracy < 0.5) {
    suggestions.push('整体正确率偏低，建议回顾基础知识点再刷题');
  }

  // 套卷建议
  if (totalExams === 0 && totalQuestions >= 30) {
    suggestions.push('练习量足够了，试试完成一套模拟卷检验整体水平');
  }

  // 临近考试
  if (daysLeft <= 7 && totalExams < 3) {
    suggestions.push('临考 7 天，建议至少完成 2 套真题套卷保持节奏');
  }

  // 打卡
  if (streakDays < 3 && totalQuestions > 0) {
    suggestions.push('坚持每日一练打卡，保持做题手感很重要');
  }

  // 阶段建议
  if (daysLeft > 21) {
    suggestions.push('当前基础巩固阶段，全面覆盖 8 大专题知识点');
  } else if (daysLeft > 14) {
    suggestions.push('当前专题强化阶段，重点攻克薄弱专题');
  } else if (daysLeft > 7) {
    suggestions.push('当前真题实战阶段，刷真题熟悉命题规律');
  } else {
    suggestions.push('临考冲刺阶段，回顾错题本 + 公式速查');
  }

  // 保证至少 1-3 条
  if (suggestions.length === 0) {
    suggestions.push('保持当前节奏，稳步推进复习计划');
  }

  return suggestions.slice(0, 3);
}
