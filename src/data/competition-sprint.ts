// 竞赛每日一练 / 冲刺计划 / 打卡工具
// EXPORTS: DailyPracticeQuestion, DailyPracticeSource, SprintPhase, generateDailyQuestions, getTodayKey, DailyPracticeRecord, DAILY_PRACTICE_KEY, DAILY_STREAK_KEY, readDailyRecord, writeDailyRecord, readStreak, writeStreak, replaceDailyQuestion, markDailyDone, SprintDailyTask, SprintDailyPlan, DAILY_PLAN_KEY, EXAM_DATE, getDaysLeft, getCurrentPhaseIndex, generateDailyPlan, readDailyPlan, writeDailyPlan, toggleTaskDone, getDailyProgress, DailySourceMode, DAILY_SOURCE_KEY, readDailySource, writeDailySource, DAILY_HISTORY_KEY, readDailyHistory, getCheckInCalendar, getTotalCheckInDays, getDailyWarReport, SprintCalendarDay, SprintCalendarData, generate20DaySprintCalendar, toggleSprintCalendarDay, readSprintCalendarDone, SPRINT_CALENDAR_KEY

import { scopedStorage } from '@/lib/lark-mock';
import type { CompetitionQuestion, QuestionType } from './competition-mock';
import { COMPETITION_MOCK_EXAMS } from './competition-mock';
import { COMPETITION_TOPICS } from './competition';
import { REAL_EXAM_QUESTIONS, type RealExamQuestion } from './competition-real-exams';
import { generateProblem, type GeneratedProblem } from './problem-generators';

export type DailyPracticeSource = 'generated' | 'weak' | 'rotation' | 'real-exam';

export interface DailyPracticeQuestion {
  question: CompetitionQuestion;
  source: DailyPracticeSource;
  /** 真题来源附加信息 */
  realExamMeta?: {
    session: string;
    number: number;
    score: number;
    sourceLabel: string;
  };
}

export interface DailyPracticeRecord {
  date: string; // YYYY-MM-DD
  fillBlankId: string;
  bigProblemId: string;
  fillBlankDone: boolean;
  bigProblemDone: boolean;
  fillBlankCorrect?: boolean;
  bigProblemCorrect?: boolean;
  allDone: boolean;
  /** 用时（秒） */
  durationSec?: number;
  /** 完成时间戳 */
  completedAt?: number;
  /** 薄弱专题（明日预告用） */
  weakTopic?: string;
}

export const DAILY_PRACTICE_KEY = 'mathforge_competition_daily';
export const DAILY_STREAK_KEY = 'mathforge_competition_streak';

export function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function readDailyRecord(): DailyPracticeRecord | null {
  try {
    const raw = scopedStorage.getItem(DAILY_PRACTICE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DailyPracticeRecord;
  } catch {
    return null;
  }
}

export function writeDailyRecord(r: DailyPracticeRecord) {
  try {
    scopedStorage.setItem(DAILY_PRACTICE_KEY, JSON.stringify(r));
  } catch {
    // ignore
  }
}

export interface StreakRecord {
  current: number;
  longest: number;
  lastDate: string; // 最后一次打卡日期 YYYY-MM-DD
}

export function readStreak(): StreakRecord {
  try {
    const raw = scopedStorage.getItem(DAILY_STREAK_KEY);
    if (!raw) return { current: 0, longest: 0, lastDate: '' };
    return JSON.parse(raw) as StreakRecord;
  } catch {
    return { current: 0, longest: 0, lastDate: '' };
  }
}

export function writeStreak(s: StreakRecord) {
  try {
    scopedStorage.setItem(DAILY_STREAK_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

// 判断今日是否已打卡并更新连续天数
export function checkInToday(): { streak: number; longest: number; isNew: boolean } {
  const today = getTodayKey();
  const streak = readStreak();

  if (streak.lastDate === today) {
    return { streak: streak.current, longest: streak.longest, isNew: false };
  }

  // 计算昨天
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.getFullYear();
  const m = String(yesterday.getMonth() + 1).padStart(2, '0');
  const d = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayStr = `${y}-${m}-${d}`;

  let newCurrent: number;
  if (streak.lastDate === yesterdayStr) {
    newCurrent = streak.current + 1;
  } else {
    newCurrent = 1;
  }

  const newLongest = Math.max(streak.longest, newCurrent);
  const updated: StreakRecord = {
    current: newCurrent,
    longest: newLongest,
    lastDate: today,
  };
  writeStreak(updated);
  return { streak: newCurrent, longest: newLongest, isNew: true };
}

// 选题逻辑：优先薄弱专题，否则轮换
// weakTopicKeys: 薄弱专题 key 列表（按薄弱程度排序）
// excludedIds: 排除的题目 id（今日已选过的）
// GeneratedProblem → CompetitionQuestion (mock 版) 适配
function adaptGenToMock(gp: GeneratedProblem): CompetitionQuestion {
  return {
    id: gp.id,
    type: gp.type as QuestionType,
    topic: gp.topic,
    difficulty: gp.difficulty,
    score: gp.score,
    problem: gp.problem,
    answer: gp.answer,
    solution: gp.solution,
    hint: gp.hint,
  };
}

/** 把真题题目适配为竞赛题格式 */
function adaptRealToMock(q: RealExamQuestion): CompetitionQuestion {
  return {
    id: q.id,
    type: q.type,
    topic: q.topic,
    difficulty: q.difficulty,
    score: q.score,
    problem: q.problem,
    answer: q.answer,
    solution: q.solution,
    hint: q.hint,
  };
}

/** 从真题题库中选题（按题型筛选） */
function pickRealExamQuestions(
  type: QuestionType,
  excludedIds: string[] = [],
  dayIndex: number = 0,
): DailyPracticeQuestion | null {
  const pool = REAL_EXAM_QUESTIONS.filter(
    (q) => q.type === type && !excludedIds.includes(q.id),
  );
  if (pool.length === 0) return null;
  const pick = pool[dayIndex % pool.length];
  return {
    question: adaptRealToMock(pick),
    source: 'real-exam',
    realExamMeta: {
      session: pick.sourceLabel.split('·')[0]?.trim() ?? '真题',
      number: pick.number,
      score: pick.score,
      sourceLabel: pick.sourceLabel,
    },
  };
}

function pickTwoQuestions(
  weakTopicKeys: string[],
  excludedIds: string[] = [],
  dayIndex: number = 0,
  sourceMode: DailySourceMode = 'mixed',
): DailyPracticeQuestion[] {
  const allQuestions = COMPETITION_MOCK_EXAMS;
  const result: DailyPracticeQuestion[] = [];
  const usedIds = new Set(excludedIds);

  // 第 1 题：填空题
  // generated 模式 → 生成引擎出题
  // real 模式 → 真题填空
  // mixed 模式 → 隔天轮换（偶数天真题，奇数天生成）
  const useRealFill =
    sourceMode === 'real' || (sourceMode === 'mixed' && dayIndex % 2 === 0);

  if (useRealFill) {
    const realQ = pickRealExamQuestions('fill-blank', Array.from(usedIds), dayIndex);
    if (realQ) {
      result.push(realQ);
      usedIds.add(realQ.question.id);
    }
  }

  // 第 2 题：大题（计算或证明）
  // 优先真题大题
  const useRealBig =
    sourceMode === 'real' || (sourceMode === 'mixed' && dayIndex % 2 === 1);

  if (useRealBig) {
    // 先试证明题，不够再用计算题
    const proofQ = pickRealExamQuestions('proof', Array.from(usedIds), dayIndex);
    const calcQ = pickRealExamQuestions('calculation', Array.from(usedIds), dayIndex + 3);
    const realBig = proofQ ?? calcQ;
    if (realBig) {
      result.push(realBig);
      usedIds.add(realBig.question.id);
    }
  }

  // 不够时从生成引擎补充
  if (result.length < 2) {
    const genTopics = weakTopicKeys.length > 0 ? weakTopicKeys : COMPETITION_TOPICS.map((t) => t.key);
    const needCount = 2 - result.length;
    for (let i = 0; i < needCount; i++) {
      const genTopic = genTopics[(dayIndex + i * 13) % genTopics.length];
      const genDiff: 1 | 2 | 3 = ((dayIndex + i) % 3 === 0 ? 2 : (dayIndex + i) % 3 === 1 ? 1 : 3) as 1 | 2 | 3;
      const genProb = generateProblem(genTopic, genDiff, dayIndex * 101 + i * 37 + 13);
      if (genProb && !usedIds.has(genProb.id)) {
        // 确保题型互补（填空/大题）
        const adapted = adaptGenToMock(genProb);
        const hasFill = result.some((r) => r.question.type === 'fill-blank');
        if (i === 0 && hasFill && adapted.type !== 'fill-blank') {
          result.push({ question: adapted, source: 'generated' });
          usedIds.add(genProb.id);
        } else if (i === 0 && !hasFill) {
          result.unshift({ question: adapted, source: 'generated' });
          usedIds.add(genProb.id);
        } else if (!hasFill && adapted.type === 'fill-blank') {
          result.unshift({ question: adapted, source: 'generated' });
          usedIds.add(genProb.id);
        } else if (hasFill && adapted.type !== 'fill-blank') {
          result.push({ question: adapted, source: 'generated' });
          usedIds.add(genProb.id);
        }
      }
    }
  }

  // 仍不够时从固定题库补充（优先薄弱专题）
  if (result.length < 2) {
    for (const topicKey of weakTopicKeys) {
      const pool = allQuestions.filter(
        (q) => q.topic === topicKey && !usedIds.has(q.id),
      );
      if (pool.length > 0 && result.length < 2) {
        const pick = pool[dayIndex % pool.length];
        if (pick.type === 'fill-blank') {
          if (!result.some((r) => r.question.type === 'fill-blank')) {
            result.unshift({ question: pick, source: 'weak' });
            usedIds.add(pick.id);
          }
        } else {
          if (!result.some((r) => r.question.type !== 'fill-blank')) {
            result.push({ question: pick, source: 'weak' });
            usedIds.add(pick.id);
          }
        }
      }
    }
  }

  // 最后兜底：从所有题目轮转补充
  if (result.length < 2) {
    const remaining = allQuestions.filter((q) => !usedIds.has(q.id));
    while (result.length < 2 && remaining.length > 0) {
      const idx = (dayIndex + result.length * 7) % remaining.length;
      const pick = remaining[idx];
      const hasFill = result.some((r) => r.question.type === 'fill-blank');
      if ((pick.type === 'fill-blank' && !hasFill) || (pick.type !== 'fill-blank' && hasFill) || result.length === 0) {
        if (pick.type === 'fill-blank') {
          result.unshift({ question: pick, source: 'rotation' });
        } else {
          result.push({ question: pick, source: 'rotation' });
        }
        usedIds.add(pick.id);
      }
      remaining.splice(idx, 1);
    }
  }

  return result.slice(0, 2);
}

export type DailySourceMode = 'mixed' | 'real' | 'generated' | 'traps' | 'proof';
export const DAILY_SOURCE_KEY = 'mathforge_competition_daily_source';

const VALID_SOURCES: DailySourceMode[] = ['mixed', 'real', 'generated', 'traps', 'proof'];

export function readDailySource(): DailySourceMode {
  try {
    const v = scopedStorage.getItem(DAILY_SOURCE_KEY);
    return VALID_SOURCES.includes(v as DailySourceMode) ? (v as DailySourceMode) : 'mixed';
  } catch {
    return 'mixed';
  }
}

export function writeDailySource(mode: DailySourceMode): void {
  try {
    scopedStorage.setItem(DAILY_SOURCE_KEY, mode);
  } catch {
    // ignore
  }
}

// ============================================================
// 打卡日历（近 30 天历史记录）
// ============================================================

export const DAILY_HISTORY_KEY = 'mathforge_competition_daily_history';
const MAX_HISTORY_DAYS = 60;

/** 读取每日一练历史（所有完成过的日子） */
export function readDailyHistory(): DailyPracticeRecord[] {
  try {
    const raw = scopedStorage.getItem(DAILY_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DailyPracticeRecord[];
  } catch {
    return [];
  }
}

function writeDailyHistory(records: DailyPracticeRecord[]): void {
  try {
    const trimmed = records.slice(0, MAX_HISTORY_DAYS);
    scopedStorage.setItem(DAILY_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

/**
 * 获取近 N 天打卡日历数据
 * 返回按日期升序的 { date, checkedIn, record } 数组
 */
export function getCheckInCalendar(days = 30): {
  date: string;
  dayOfMonth: number;
  checkedIn: boolean;
  isToday: boolean;
  correctCount?: number;
}[] {
  const history = readDailyHistory();
  const today = getTodayKey();
  const result: {
    date: string;
    dayOfMonth: number;
    checkedIn: boolean;
    isToday: boolean;
    correctCount?: number;
  }[] = [];

  const historyMap = new Map(history.map((r) => [r.date, r]));

  const base = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;
    const rec = historyMap.get(dateKey);
    const correctCount = rec
      ? (rec.fillBlankCorrect ? 1 : 0) + (rec.bigProblemCorrect ? 1 : 0)
      : undefined;
    result.push({
      date: dateKey,
      dayOfMonth: d.getDate(),
      checkedIn: !!rec?.allDone,
      isToday: dateKey === today,
      correctCount: rec?.allDone ? correctCount : undefined,
    });
  }

  return result;
}

/** 累计打卡天数 */
export function getTotalCheckInDays(): number {
  return readDailyHistory().filter((r) => r.allDone).length;
}

/**
 * 今日战报（完成今日一练后生成）
 */
export interface DailyWarReport {
  date: string;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  durationSec: number;
  streakNow: number;
  streakLongest: number;
  totalDays: number;
  isNewBadge: boolean;
  newBadgeNames: string[];
  /** 明日预告：薄弱专题 */
  tomorrowTopic?: string;
  /** 今日错误专题（用于明日预告） */
  wrongTopics: string[];
}

/** 生成今日战报（完成全部题目后调用） */
export function getDailyWarReport(
  record: DailyPracticeRecord,
  wrongTopics: string[] = [],
  streakInfo: { streak: number; longest: number; isNew: boolean } = { streak: 0, longest: 0, isNew: false },
): DailyWarReport {
  const correctCount =
    (record.fillBlankCorrect ? 1 : 0) + (record.bigProblemCorrect ? 1 : 0);
  const totalCount = 2;
  const accuracy = totalCount > 0 ? correctCount / totalCount : 0;

  const totalDays = getTotalCheckInDays();

  // 判断是否触发新徽章（简化：仅根据连续天数判断关键节点）
  const badgeStreakMap: { days: number; name: string }[] = [
    { days: 3, name: '三日不懈' },
    { days: 7, name: '一周坚持' },
    { days: 14, name: '半月磨砺' },
    { days: 21, name: '三周冲刺' },
  ];
  const newBadgeNames = badgeStreakMap
    .filter((b) => streakInfo.streak === b.days && streakInfo.isNew)
    .map((b) => b.name);

  // 总打卡 30 天
  const totalBadgeThreshold = 30;
  if (totalDays >= totalBadgeThreshold && totalDays - 1 < totalBadgeThreshold) {
    newBadgeNames.push('满月砺剑');
  }

  return {
    date: record.date,
    correctCount,
    totalCount,
    accuracy,
    durationSec: record.durationSec ?? 0,
    streakNow: streakInfo.streak,
    streakLongest: streakInfo.longest,
    totalDays,
    isNewBadge: newBadgeNames.length > 0,
    newBadgeNames,
    wrongTopics,
    tomorrowTopic: wrongTopics[0],
  };
}

export function generateDailyQuestions(
  weakTopicKeys: string[] = [],
  sourceMode: DailySourceMode = 'mixed',
): { questions: DailyPracticeQuestion[]; date: string } {
  const today = getTodayKey();
  const record = readDailyRecord();

  // 如果今日已选过，用已存的 id
  if (record && record.date === today) {
    const allQuestions = COMPETITION_MOCK_EXAMS;
    const result: DailyPracticeQuestion[] = [];

    // 填空题
    const mockFill = allQuestions.find((q) => q.id === record.fillBlankId);
    const realFill = REAL_EXAM_QUESTIONS.find((q) => q.id === record.fillBlankId);
    if (mockFill) {
      result.push({ question: mockFill, source: 'rotation' });
    } else if (realFill) {
      result.push({
        question: adaptRealToMock(realFill),
        source: 'real-exam',
        realExamMeta: {
          session: realFill.sourceLabel.split('·')[0]?.trim() ?? '真题',
          number: realFill.number,
          score: realFill.score,
          sourceLabel: realFill.sourceLabel,
        },
      });
    }

    // 大题
    const mockBig = allQuestions.find((q) => q.id === record.bigProblemId);
    const realBig = REAL_EXAM_QUESTIONS.find((q) => q.id === record.bigProblemId);
    if (mockBig) {
      result.push({ question: mockBig, source: 'rotation' });
    } else if (realBig) {
      result.push({
        question: adaptRealToMock(realBig),
        source: 'real-exam',
        realExamMeta: {
          session: realBig.sourceLabel.split('·')[0]?.trim() ?? '真题',
          number: realBig.number,
          score: realBig.score,
          sourceLabel: realBig.sourceLabel,
        },
      });
    }

    if (result.length === 2) return { questions: result, date: today };
  }

  // 用日期数字作为确定性种子，保证同一天题目不变
  const dateNum = Number(today.replace(/-/g, ''));
  const dayIndex = dateNum % 97; // 质数取模

  const questions = pickTwoQuestions(weakTopicKeys, [], dayIndex, sourceMode);

  // 保存记录
  const newRecord: DailyPracticeRecord = {
    date: today,
    fillBlankId: questions[0]?.question.id ?? '',
    bigProblemId: questions[1]?.question.id ?? '',
    fillBlankDone: record?.fillBlankId === questions[0]?.question.id ? record.fillBlankDone : false,
    bigProblemDone: record?.bigProblemId === questions[1]?.question.id ? record.bigProblemDone : false,
    allDone: false,
  };
  writeDailyRecord(newRecord);

  return { questions, date: today };
}

// 换一题：手动更换指定位置的题目（优先从生成引擎换新，保证无限刷新）
export function replaceDailyQuestion(
  position: 'fillBlank' | 'bigProblem',
  weakTopicKeys: string[] = [],
): DailyPracticeQuestion | null {
  const today = getTodayKey();
  const record = readDailyRecord();
  if (!record || record.date !== today) return null;

  // 从生成引擎生成一道新题（薄弱专题优先）
  const topics = weakTopicKeys.length > 0 ? weakTopicKeys : COMPETITION_TOPICS.map((t) => t.key);
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const diff: 1 | 2 | 3 = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
  const genProb = generateProblem(randomTopic, diff);

  if (genProb) {
    const newQ = adaptGenToMock(genProb);
    const updated: DailyPracticeRecord = {
      ...record,
      [position === 'fillBlank' ? 'fillBlankId' : 'bigProblemId']: newQ.id,
      [position === 'fillBlank' ? 'fillBlankDone' : 'bigProblemDone']: false,
    };
    writeDailyRecord(updated);
    return { question: newQ, source: 'generated' };
  }

  // 生成失败兜底：从固定题库换
  const allQuestions = COMPETITION_MOCK_EXAMS;
  const keepId = position === 'fillBlank' ? record.bigProblemId : record.fillBlankId;
  const remaining = allQuestions.filter((q) => q.id !== keepId);
  if (remaining.length === 0) return null;

  const randomIdx = Math.floor(Math.random() * remaining.length);
  const newQ = remaining[randomIdx];

  const updated: DailyPracticeRecord = {
    ...record,
    [position === 'fillBlank' ? 'fillBlankId' : 'bigProblemId']: newQ.id,
    [position === 'fillBlank' ? 'fillBlankDone' : 'bigProblemDone']: false,
  };
  writeDailyRecord(updated);

  return { question: newQ, source: 'rotation' };
}

// 标记每日一练某题完成
export function markDailyDone(
  position: 'fillBlank' | 'bigProblem',
  correct: boolean,
  durationSec?: number,
): { record: DailyPracticeRecord; streakInfo?: { streak: number; longest: number; isNew: boolean } } | null {
  const record = readDailyRecord();
  if (!record) return null;

  const updated: DailyPracticeRecord = {
    ...record,
    [position === 'fillBlank' ? 'fillBlankDone' : 'bigProblemDone']: true,
    [position === 'fillBlank' ? 'fillBlankCorrect' : 'bigProblemCorrect']: correct,
  };
  if (durationSec !== undefined) {
    updated.durationSec = durationSec;
  }
  // allDone 字段由两道题都完成时标记
  const allDone = updated.fillBlankDone && updated.bigProblemDone;
  let streakInfo: { streak: number; longest: number; isNew: boolean } | undefined;
  if (allDone) {
    updated.allDone = true;
    updated.completedAt = Date.now();
    // 自动打卡
    streakInfo = checkInToday();
    // 写入历史记录
    const history = readDailyHistory();
    const existingIdx = history.findIndex((r) => r.date === updated.date);
    if (existingIdx >= 0) {
      history[existingIdx] = updated;
    } else {
      history.unshift(updated);
    }
    writeDailyHistory(history);
  }
  writeDailyRecord(updated);
  return { record: updated, streakInfo };
}

// ===== 冲刺计划 =====

export interface SprintPhase {
  name: string;
  description: string;
  duration: string;
  goals: string[];
  icon: string; // lucide icon name
  color: string;
}

// 基于剩余天数生成阶段计划
export function generateSprintPlan(daysLeft: number): SprintPhase[] {
  if (daysLeft <= 0) {
    return [
      {
        name: '考前最后一天',
        description: '放松心态，回顾错题本和技巧库',
        duration: '今天',
        goals: ['过一遍错题本', '浏览技巧库要点', '早睡，保证精力'],
        icon: 'Coffee',
        color: 'emerald',
      },
    ];
  }

  if (daysLeft <= 7) {
    // 冲刺周
    return [
      {
        name: '全真冲刺',
        description: '模拟考试 + 技巧回顾 + 错题扫盲',
        duration: `考前 ${daysLeft} 天`,
        goals: [
          '完成至少 2 套全真模拟卷',
          '过一遍全部 22 条竞赛技巧',
          '错题本复习，重点标注题再过一遍',
          '调整作息，保持竞技状态',
        ],
        icon: 'Zap',
        color: 'rose',
      },
    ];
  }

  if (daysLeft <= 14) {
    // 2 周：薄弱强化 + 冲刺
    return [
      {
        name: '阶段三：薄弱强化',
        description: '针对薄弱专题专项突破',
        duration: `第 1-${daysLeft - 7} 天`,
        goals: [
          '根据模拟考报告，主攻正确率最低的 2-3 个专题',
          '每日一练持续打卡',
          '整理错题本，反复训练',
        ],
        icon: 'Target',
        color: 'amber',
      },
      {
        name: '冲刺周：全真模拟',
        description: '考前 7 天集中冲刺',
        duration: '考前 7 天',
        goals: [
          '完成 2 套全真模拟卷（限时）',
          '过一遍全部竞赛技巧',
          '错题本最后扫盲',
          '调整作息和心态',
        ],
        icon: 'Zap',
        color: 'rose',
      },
    ];
  }

  if (daysLeft <= 21) {
    // 3 周：专项练习 + 薄弱强化 + 冲刺
    return [
      {
        name: '阶段二：专项练习',
        description: '题库刷题 + 模拟卷训练',
        duration: `第 1-${daysLeft - 14} 天`,
        goals: [
          '完成 44 道题库题目（按专题）',
          '每周 1 套模拟卷检验水平',
          '整理错题，建立错题本',
        ],
        icon: 'BookOpen',
        color: 'sky',
      },
      {
        name: '阶段三：薄弱强化',
        description: '针对薄弱专题专项突破',
        duration: `第 ${daysLeft - 13}-${daysLeft - 7} 天`,
        goals: [
          '主攻正确率最低的 2-3 个专题',
          '每日一练持续打卡',
          '错题本复习 2 遍以上',
        ],
        icon: 'Target',
        color: 'amber',
      },
      {
        name: '冲刺周：全真模拟',
        description: '考前 7 天集中冲刺',
        duration: '考前 7 天',
        goals: [
          '完成 2 套全真模拟卷',
          '过一遍全部竞赛技巧',
          '错题本最后扫盲',
          '调整作息',
        ],
        icon: 'Zap',
        color: 'rose',
      },
    ];
  }

  // 28 天以上：完整 4 阶段
  const phase1End = Math.ceil(daysLeft * 0.4);
  const phase2End = Math.ceil(daysLeft * 0.65);
  const phase3End = daysLeft - 7;

  return [
    {
      name: '阶段一：系统复习',
      description: '系统过 8 大专题知识点 + 经典例题',
      duration: `第 ${daysLeft - phase1End + 1}-${daysLeft} 天（约 ${phase1End} 天）`,
      goals: [
        '8 大专题知识点逐一过一遍',
        '每专题完成核心例题，掌握标准解法',
        '配套练习：每专题 3-5 道基础题',
        '建立知识框架，标记薄弱点',
      ],
      icon: 'BookMarked',
      color: 'emerald',
    },
    {
      name: '阶段二：专项练习',
      description: '题库集中刷题 + 模拟卷检验',
      duration: `第 ${daysLeft - phase2End + 1}-${daysLeft - phase1End} 天（约 ${phase2End - phase1End} 天）`,
      goals: [
        '完成 44 道竞赛题库（按专题）',
        '每 5 天做 1 套模拟卷',
        '整理错题本，按专题归类',
        '技巧库学习，掌握快速解题方法',
      ],
      icon: 'BookOpen',
      color: 'sky',
    },
    {
      name: '阶段三：薄弱强化',
      description: '针对薄弱专题集中突破',
      duration: `第 ${daysLeft - phase3End + 1}-${daysLeft - phase2End} 天（约 ${phase3End - phase2End} 天）`,
      goals: [
        '主攻正确率最低的 2-3 个专题',
        '每日一练打卡，保持手感',
        '错题本反复训练，直到掌握',
      ],
      icon: 'Target',
      color: 'amber',
    },
    {
      name: '冲刺周：全真模拟',
      description: '考前 7 天模拟冲刺',
      duration: '考前最后 7 天',
      goals: [
        '完成 2 套全真模拟卷（严格限时）',
        '过一遍全部 22 条竞赛技巧',
        '错题本最后扫盲',
        '调整作息，保持竞技状态',
      ],
      icon: 'Zap',
      color: 'rose',
    },
  ];
}

// 获取专题频率标签文案
export function getFrequencyLabel(freq: 'high' | 'medium' | 'low'): { label: string; icon: string; variant: string } {
  switch (freq) {
    case 'high':
      return { label: '高频必考', icon: 'Flame', variant: 'destructive' };
    case 'medium':
      return { label: '常考', icon: 'Star', variant: 'default' };
    case 'low':
      return { label: '低频', icon: 'Minus', variant: 'secondary' };
  }
}

export { COMPETITION_TOPICS };

// ============================================================
// 动态冲刺计划（28 天倒计时，每日任务自动生成）
// ============================================================

/** 考试日期：2026-11-14（全国大学生数学竞赛非数学类A类初赛） */
export const EXAM_DATE = '2026-11-14';

/** 每日任务类型 */
export type SprintTaskType =
  | 'topic-practice'
  | 'mock-exam'
  | 'real-exam'
  | 'wrong-book'
  | 'formula'
  | 'formula-memorize'
  | 'formula-quiz'
  | 'skill'
  | 'trap'
  | 'daily-checkin';

export interface SprintDailyTask {
  id: string;
  type: SprintTaskType;
  title: string;
  description: string;
  /** 跳转目标：tab key 或 详情 key */
  targetTab?: string;
  targetDetail?: string;
  /** 建议时长（分钟） */
  estimatedMinutes: number;
  /** 是否完成 */
  done: boolean;
  /** 完成时间戳 */
  doneTime?: number;
}

export interface SprintDailyPlan {
  date: string; // YYYY-MM-DD
  daysLeft: number;
  phaseIndex: number; // 0~3，对应 generateSprintPlan 返回的阶段索引
  phaseName: string;
  tasks: SprintDailyTask[];
}

export const DAILY_PLAN_KEY = 'mathforge_daily_sprint_plan';

/** 计算距离考试的剩余天数（含今天） */
export function getDaysLeft(): number {
  const now = new Date();
  const exam = new Date(EXAM_DATE + 'T09:00:00'); // 上午 9 点开考
  const diffMs = exam.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

/** 获取当前阶段索引（0~3），基于剩余天数 */
export function getCurrentPhaseIndex(daysLeft: number): number {
  if (daysLeft <= 0) return 3; // 考前当天算冲刺期
  if (daysLeft <= 7) return 3; // 临考冲刺期
  if (daysLeft <= 14) return 2; // 真题实战期
  if (daysLeft <= 21) return 1; // 专题强化期
  return 0; // 基础巩固期
}

// 8 大专题顺序（用于轮询分配每日任务）
const TOPIC_ROTATION = [
  { key: 'limit-continuity', name: '极限与连续' },
  { key: 'single-var-diff', name: '一元微分' },
  { key: 'single-var-int', name: '一元积分' },
  { key: 'multi-var-diff', name: '多元微分' },
  { key: 'multi-var-int', name: '多元积分' },
  { key: 'infinite-series', name: '无穷级数' },
  { key: 'ode', name: '常微分方程' },
  { key: 'space-geo', name: '空间解析几何' },
];

// 技巧库（按索引轮询）
const SKILL_ROTATION = [
  '中值定理构造辅助函数',
  '洛必达法则与等价无穷小',
  '分部积分的选 u 技巧',
  '换元积分常用代换',
  '级数敛散性判别路径',
  '微分方程求解套路',
  '二重积分换序与对称性',
  '格林公式与补线技巧',
];

// 公式速查分类（轮询）
const FORMULA_ROTATION = [
  '极限与连续',
  '一元微分',
  '一元积分',
  '多元微积分',
  '无穷级数',
  '常微分方程',
  '线性代数',
  '解析几何',
];

/**
 * 生成指定日期的每日冲刺计划
 * 按当前阶段 + 日期确定性种子，保证同日刷新不变
 */
export function generateDailyPlan(
  dateStr?: string,
  options?: { weakTopics?: string[] },
): SprintDailyPlan {
  const date = dateStr ?? getTodayKey();
  const daysLeft = getDaysLeftForDate(date);
  const phaseIdx = getCurrentPhaseIndex(daysLeft);
  const phases = generateSprintPlan(daysLeft);
  const phaseName = phases[Math.min(phaseIdx, phases.length - 1)]?.name ?? '冲刺阶段';

  // 用日期做种子，保证同日生成一致
  const daySeed = hashDate(date);
  const tasks: SprintDailyTask[] = [];

  // 阶段主任务（1-2 个）
  if (phaseIdx === 0) {
    // 基础巩固期：每天 1 个专题知识点 + 配套练习
    const topicIdx = daySeed % TOPIC_ROTATION.length;
    const topic = TOPIC_ROTATION[topicIdx];
    tasks.push({
      id: `topic-${topic.key}`,
      type: 'topic-practice',
      title: `【专题】${topic.name}`,
      description: '过知识点 + 随机练习 10 题',
      targetTab: 'topics',
      targetDetail: topic.key,
      estimatedMinutes: 60,
      done: false,
    });
    tasks.push({
      id: `formula-${FORMULA_ROTATION[topicIdx % FORMULA_ROTATION.length]}`,
      type: 'formula',
      title: `【速查】公式速查 · ${FORMULA_ROTATION[topicIdx % FORMULA_ROTATION.length]}`,
      description: '浏览该专题公式，掌握核心公式',
      targetTab: 'formulas',
      estimatedMinutes: 15,
      done: false,
    });
    tasks.push({
      id: `formula-memorize-${topicIdx}`,
      type: 'formula-memorize',
      title: '【记忆】公式记忆卡 · 10 张',
      description: '翻卡记忆今日专题公式，标记已掌握/待复习',
      targetTab: 'formulas',
      estimatedMinutes: 10,
      done: false,
    });
    tasks.push({
      id: `formula-quiz-${topicIdx}`,
      type: 'formula-quiz',
      title: '【测验】公式测验 · 1 轮',
      description: '10 道公式测验题，检验记忆效果',
      targetTab: 'formulas',
      estimatedMinutes: 8,
      done: false,
    });
  } else if (phaseIdx === 1) {
    // 专题强化期：薄弱专题+高频专题，每天 1 专题强化 + 1 套专项卷
    const weakTopics = options?.weakTopics ?? [];
    let focusKey: string;
    let focusName: string;
    if (weakTopics.length > 0) {
      const idx = daySeed % weakTopics.length;
      focusKey = weakTopics[idx];
      focusName = TOPIC_ROTATION.find((t) => t.key === focusKey)?.name ?? focusKey;
    } else {
      const idx = daySeed % TOPIC_ROTATION.length;
      focusKey = TOPIC_ROTATION[idx].key;
      focusName = TOPIC_ROTATION[idx].name;
    }
    tasks.push({
      id: `topic-deep-${focusKey}`,
      type: 'topic-practice',
      title: `【强化】${focusName} · 专项突破`,
      description: '专项卷练习 + 题型归纳',
      targetTab: 'practice',
      targetDetail: focusKey,
      estimatedMinutes: 75,
      done: false,
    });
    tasks.push({
      id: `trap-review`,
      type: 'trap',
      title: '【陷阱】易错陷阱题 · 每日 4 题',
      description: '从 6 大类陷阱题中抽取易错题训练',
      targetTab: 'traps',
      estimatedMinutes: 20,
      done: false,
    });
  } else if (phaseIdx === 2) {
    // 真题实战期：每天 1 套真题/模拟卷 + 错题复盘
    const isRealExam = daySeed % 2 === 0;
    tasks.push({
      id: isRealExam ? 'real-exam-daily' : 'mock-exam-daily',
      type: isRealExam ? 'real-exam' : 'mock-exam',
      title: isRealExam ? '【真题】第 16 届真题套卷实战' : '【模拟】随机模拟卷 · 限时 150 分钟',
      description: isRealExam ? '严格计时 150 分钟，模拟真实考场' : '随机组卷，检验综合水平',
      targetTab: isRealExam ? 'real-exams' : 'mock',
      estimatedMinutes: 150,
      done: false,
    });
    tasks.push({
      id: 'wrong-review',
      type: 'wrong-book',
      title: '【复盘】错题本重做 5 题',
      description: '从错题本中抽 5 道重练，直到完全掌握',
      targetTab: 'overview',
      estimatedMinutes: 30,
      done: false,
    });
    tasks.push({
      id: `formula-memorize-${daySeed % 8}`,
      type: 'formula-memorize',
      title: '【记忆】公式记忆卡 · 10 张',
      description: '翻卡复习薄弱专题公式',
      targetTab: 'formulas',
      estimatedMinutes: 10,
      done: false,
    });
    tasks.push({
      id: `formula-quiz-${daySeed % 8}`,
      type: 'formula-quiz',
      title: '【测验】公式测验 · 1 轮',
      description: '10 道公式测验题，检验记忆效果',
      targetTab: 'formulas',
      estimatedMinutes: 8,
      done: false,
    });
  } else {
    // 临考冲刺期：轻量练习 + 错题复盘 + 公式技巧回顾
    tasks.push({
      id: 'daily-checkin-light',
      type: 'daily-checkin',
      title: '【每日一练】轻量练习 2 题',
      description: '保持手感，不做高强度训练',
      targetTab: 'overview',
      estimatedMinutes: 20,
      done: false,
    });
    tasks.push({
      id: 'wrong-final-review',
      type: 'wrong-book',
      title: '【复盘】错题本最后扫盲',
      description: '重点攻克标注的高频错题',
      targetTab: 'overview',
      estimatedMinutes: 40,
      done: false,
    });
    tasks.push({
      id: `skill-${daySeed % SKILL_ROTATION.length}`,
      type: 'skill',
      title: `【技巧】技巧库 · ${SKILL_ROTATION[daySeed % SKILL_ROTATION.length]}`,
      description: '快速回顾解题技巧',
      targetTab: 'skills',
      estimatedMinutes: 10,
      done: false,
    });
    tasks.push({
      id: `formula-memorize-final-${daySeed % 8}`,
      type: 'formula-memorize',
      title: '【记忆】公式最后扫盲 · 10 张',
      description: '临考冲刺，重点公式翻卡速过',
      targetTab: 'formulas',
      estimatedMinutes: 8,
      done: false,
    });
  }

  // 每天穿插固定项（基础期+强化期额外加一个每日一练）
  if (phaseIdx <= 1) {
    tasks.push({
      id: 'daily-checkin',
      type: 'daily-checkin',
      title: '【打卡】每日一练',
      description: '填空 + 大题各一题，保持每日手感',
      targetTab: 'overview',
      estimatedMinutes: 15,
      done: false,
    });
  }

  // 每天加一个错题复盘（除冲刺期已有外，其余天少量）
  if (phaseIdx === 0) {
    tasks.push({
      id: 'wrong-daily',
      type: 'wrong-book',
      title: '【复习】错题本回顾 3 题',
      description: '巩固易错点',
      targetTab: 'overview',
      estimatedMinutes: 15,
      done: false,
    });
  }

  return {
    date,
    daysLeft,
    phaseIndex: phaseIdx,
    phaseName,
    tasks,
  };
}

/** 读取今日计划（没有则生成新的） */
export function readDailyPlan(options?: { weakTopics?: string[] }): SprintDailyPlan {
  const today = getTodayKey();
  try {
    const raw = scopedStorage.getItem(DAILY_PLAN_KEY);
    if (raw) {
      const plan = JSON.parse(raw) as SprintDailyPlan;
      if (plan.date === today) {
        return plan;
      }
    }
  } catch {
    // ignore
  }
  // 生成新的
  const plan = generateDailyPlan(today, options);
  writeDailyPlan(plan);
  return plan;
}

/** 写入每日计划 */
export function writeDailyPlan(plan: SprintDailyPlan) {
  try {
    scopedStorage.setItem(DAILY_PLAN_KEY, JSON.stringify(plan));
  } catch {
    // ignore
  }
}

/** 切换任务完成状态 */
export function toggleTaskDone(taskId: string): SprintDailyPlan | null {
  const plan = readDailyPlan();
  const task = plan.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  task.done = !task.done;
  task.doneTime = task.done ? Date.now() : undefined;
  writeDailyPlan(plan);
  return plan;
}

/** 获取当日任务完成率 0~1 */
export function getDailyProgress(plan: SprintDailyPlan): number {
  if (plan.tasks.length === 0) return 0;
  const done = plan.tasks.filter((t) => t.done).length;
  return done / plan.tasks.length;
}

// ---- 私有工具 ----

function getDaysLeftForDate(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  const exam = new Date(EXAM_DATE + 'T09:00:00');
  const diffMs = exam.getTime() - d.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

function hashDate(dateStr: string): number {
  // 简单日期哈希，返回 0~999 之间的数
  const parts = dateStr.split('-');
  const y = parseInt(parts[0] ?? '2026', 10);
  const m = parseInt(parts[1] ?? '1', 10);
  const d = parseInt(parts[2] ?? '1', 10);
  return ((y * 10000 + m * 100 + d) * 2654435761) % 1000;
}

// ============================================================
// 20 天冲刺日历
// ============================================================

export interface SprintCalendarDay {
  date: string; // YYYY-MM-DD
  daysLeft: number; // D-N
  stage: 'topic' | 'exam' | 'review'; // 三阶段
  stageName: string;
  dayIndex: number; // 阶段内第几天（0-based）
  title: string; // 当日核心任务标题
  tasks: string[]; // 详细任务列表
  targetRoute: string; // 点击"开始"跳转的路由/功能
  targetLabel: string; // 按钮文案
  isToday: boolean;
  done: boolean; // 是否已打卡完成
}

export interface SprintCalendarData {
  days: SprintCalendarDay[];
  completedCount: number;
  totalDays: number;
  todayIndex: number; // today 在 days 数组中的索引，-1 表示已过
}

// 8 个专题顺序
const SPRINT_TOPICS: { key: string; name: string; route: string }[] = [
  { key: 'limit-continuity', name: '极限与连续', route: 'topic' },
  { key: 'single-var-diff', name: '一元微分学', route: 'topic' },
  { key: 'single-var-int', name: '一元积分学', route: 'topic' },
  { key: 'multi-var-diff', name: '多元微分学', route: 'topic' },
  { key: 'multi-var-int', name: '多元积分学', route: 'topic' },
  { key: 'infinite-series', name: '无穷级数', route: 'topic' },
  { key: 'ode', name: '常微分方程', route: 'topic' },
  { key: 'space-geo', name: '空间解析几何', route: 'topic' },
];

// 历史打卡记录 key（存已完成的日期集合）
export const SPRINT_CALENDAR_KEY = 'mathforge_sprint_calendar_done';

export function readSprintCalendarDone(): Set<string> {
  try {
    const raw = scopedStorage.getItem(SPRINT_CALENDAR_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function writeSprintCalendarDone(set: Set<string>) {
  try {
    scopedStorage.setItem(SPRINT_CALENDAR_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

/** 切换某日的打卡状态，返回更新后的 set */
export function toggleSprintCalendarDay(date: string): Set<string> {
  const done = readSprintCalendarDone();
  if (done.has(date)) {
    done.delete(date);
  } else {
    done.add(date);
    // 同步联动：当日打卡也记一条 streak
    // 注意：实际 streak 体系由 daily practice 驱动，这里只做日历打卡
  }
  writeSprintCalendarDone(done);
  return done;
}

/**
 * 生成 20 天冲刺日历
 * - D-20 ~ D-13：专题强化（8 天，每天 1 个专题）
 * - D-12 ~ D-6：套卷实战（7 天，每天 1 套，每 3 天一次全真 150min）
 * - D-5 ~ D-1：考前回顾（5 天，错题+公式+模板+陷阱）
 *
 * 基于 EXAM_DATE 反推逐日日期，若距考试 > 20 天则从 D-20 开始展示。
 */
export function generate20DaySprintCalendar(): SprintCalendarData {
  const todayStr = getTodayKey();
  const exam = new Date(EXAM_DATE + 'T00:00:00');
  const days: SprintCalendarDay[] = [];

  // 生成 D-20 ~ D-1（共 20 天），考试当天不算冲刺任务
  const totalDays = 20;
  const doneSet = readSprintCalendarDone();
  let todayIndex = -1;

  for (let i = totalDays; i >= 1; i--) {
    const d = new Date(exam);
    d.setDate(exam.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const daysLeft = i;

    let stage: 'topic' | 'exam' | 'review';
    let stageName: string;
    let dayIndex: number;
    let title: string;
    let tasks: string[];
    let targetRoute: string;
    let targetLabel: string;

    if (i >= 13 && i <= 20) {
      // D-20 ~ D-13：专题强化（8 天）
      stage = 'topic';
      stageName = '专题强化';
      dayIndex = 20 - i; // 0~7
      const topic = SPRINT_TOPICS[dayIndex]!;
      title = `${topic.name}专项突破`;
      tasks = [
        `${topic.name} 10 题随机练习`,
        `${topic.name} 错题本复习`,
        `${topic.name} 相关公式速查`,
      ];
      targetRoute = 'topic';
      targetLabel = '开始练习';
    } else if (i >= 6 && i <= 12) {
      // D-12 ~ D-6：套卷实战（7 天）
      stage = 'exam';
      stageName = '套卷实战';
      dayIndex = 12 - i; // 0~6
      const isFullMock = dayIndex % 3 === 0; // 第 0/3/6 天全真模式
      const examType = isFullMock ? '全真模拟（150min计时）' : (dayIndex % 2 === 0 ? '真题精选卷' : '模拟卷');
      title = examType;
      tasks = [
        `${examType} 一套`,
        '对照答案批改、记录成绩',
        '错题整理到错题本',
      ];
      targetRoute = 'exam';
      targetLabel = isFullMock ? '全真模考' : '开始做题';
    } else {
      // D-5 ~ D-1：考前回顾（5 天）
      stage = 'review';
      stageName = '考前回顾';
      dayIndex = 5 - i; // 0~4
      const reviewTasks = [
        { title: '错题本全量过一遍', tasks: ['按专题复习全部错题', '重点重做标注星号题', '错误原因归类反思'], route: 'wrongbook', label: '复习错题' },
        { title: '公式速查默写', tasks: ['8 专题公式全面回顾', '重点公式闭眼默写', '易错公式特别标记'], route: 'formula', label: '默写公式' },
        { title: '解题模板 36 套路速览', tasks: ['浏览全部解题模板', '标记不熟练模板', '选 3 个模板实战演练'], route: 'templates', label: '速览模板' },
        { title: '陷阱题集回顾', tasks: ['高频陷阱题复习', '常见失分点梳理', '避坑技巧总结'], route: 'traps', label: '看陷阱题' },
        { title: '考前最终回顾', tasks: ['错题本快速浏览', '公式卡过一遍', '调整作息、放松心态'], route: 'wrongbook', label: '最终回顾' },
      ];
      const review = reviewTasks[dayIndex]!;
      title = review.title;
      tasks = review.tasks;
      targetRoute = review.route;
      targetLabel = review.label;
    }

    const isToday = dateStr === todayStr;
    if (isToday) todayIndex = days.length;

    days.push({
      date: dateStr,
      daysLeft,
      stage,
      stageName,
      dayIndex,
      title,
      tasks,
      targetRoute,
      targetLabel,
      isToday,
      done: doneSet.has(dateStr),
    });
  }

  const completedCount = days.filter((d) => d.done).length;

  return {
    days,
    completedCount,
    totalDays,
    todayIndex,
  };
}
