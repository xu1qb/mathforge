// EXPORTS: PreExamChecklistItem, getPreExamChecklist, PRE_EXAM_CHECKLIST_KEY, readChecklistProgress, writeChecklistProgress
// EXPORTS: WeeklyReportData, computeWeeklyReport, getSprintStatusText

import { scopedStorage } from '@/lib/lark-mock';
import { COMPETITION_TOPICS } from './competition';
import type { ExamHistoryRecord } from './competition-mock';
import { type StatsRecord } from '@/hooks/use-learning';
import { type DailyPracticeRecord } from './competition-sprint';

// ============================================================
// 考前 7 天清单
// ============================================================

export interface PreExamChecklistItem {
  id: string;
  phase: string;
  daysLabel: string; // 如 "D-7" / "考试当日"
  description: string;
  tasks: string[];
  isCurrentPhase: boolean;
  category?: 'items' | 'time' | 'strategy' | 'mindset'; // 考试当日 checklist 分类
}

const PRE_EXAM_PHASES: Omit<PreExamChecklistItem, 'isCurrentPhase'>[] = [
  {
    id: 'd-7',
    phase: '错题复盘日',
    daysLabel: 'D−7',
    description: '集中复盘错题本，消灭知识盲区',
    tasks: [
      '错题本全部完整过一遍（至少标记的高错题）',
      '重点关注反复错的题型，归纳错因',
      '把仍不会的题标记为「最后攻坚」',
      '浏览 8 大专题核心公式',
    ],
  },
  {
    id: 'd-6',
    phase: '薄弱攻坚日',
    daysLabel: 'D−6',
    description: '针对薄弱专题集中加练',
    tasks: [
      '找出正确率最低的 1−2 个专题',
      '专项练习 20−30 道薄弱题',
      '总结该专题的常见套路和陷阱',
      '整理一份薄弱专题「避坑清单」',
    ],
  },
  {
    id: 'd-5',
    phase: '全真模考日',
    daysLabel: 'D−5',
    description: '严格限时完成一套全真模拟卷',
    tasks: [
      '选一套 C 套挑战卷或真题卷',
      '严格限时 150 分钟，不中途暂停',
      '模拟考试环境：手机静音、桌面整洁',
      '做完立刻批改，统计各题型得分',
    ],
  },
  {
    id: 'd-4',
    phase: '公式速览日',
    daysLabel: 'D−4',
    description: '全面过一遍公式和解题套路',
    tasks: [
      '公式手册/公式速查从头到尾过一遍',
      '22 条竞赛技巧库快速浏览',
      '默写高频公式（泰勒展开、积分公式等）',
      '回顾错题本中的「最后攻坚」题',
    ],
  },
  {
    id: 'd-3',
    phase: '真题实战日',
    daysLabel: 'D−3',
    description: '再做一套真题 + 错题回炉',
    tasks: [
      '限时完成一套真题卷',
      '对照解析逐题订正',
      '把新错题加入错题本并复习',
      '错题本第二轮：只看还没完全掌握的',
    ],
  },
  {
    id: 'd-2',
    phase: '套路速刷日',
    daysLabel: 'D−2',
    description: '轻量复习 + 套路卡 + 陷阱题速刷',
    tasks: [
      '速刷套路卡（证明题套路 / 计算套路）',
      '陷阱题集锦过一遍，建立警觉',
      '回顾「避坑清单」和易错点',
      '保持手感：做 5−10 道中等难度题',
    ],
  },
  {
    id: 'd-1',
    phase: '考前调整日',
    daysLabel: 'D−1',
    description: '轻量复习 + 准备文具 + 早睡',
    tasks: [
      '只做轻量回顾（公式 + 技巧卡），不刷新题',
      '准备考试物品（见考试当日 checklist）',
      '确认考点地址、路线和出发时间',
      '晚上 11 点前睡觉，保证 7−8 小时睡眠',
    ],
  },
  // ---------- 考试当日 checklist（四大分类） ----------
  {
    id: 'examday-items',
    phase: '物品清单',
    daysLabel: '考试当日',
    description: '出门前逐一核对，确保带齐',
    category: 'items',
    tasks: [
      '准考证（打印版，建议多带一张备用）',
      '身份证 / 有效身份证件',
      '2B 铅笔 × 2（提前削好或用自动铅笔）',
      '橡皮（干净，擦得干净的）',
      '黑色签字笔 × 3（0.5mm，同品牌）',
      '尺子（直尺 + 圆规 + 量角器按需）',
      '手表（无存储/计算功能的机械表或石英表）',
      '水杯（透明，不带标签）',
      '纸巾 / 湿巾',
    ],
  },
  {
    id: 'examday-time',
    phase: '时间分配',
    daysLabel: '考试当日',
    description: '150 分钟分配策略，提前规划',
    category: 'time',
    tasks: [
      '提前 30 分钟到达考场',
      '填空/选择：40 分钟内完成',
      '大题：100 分钟（按分值分配时间）',
      '最后 10 分钟：检查答题卡 + 核对姓名考号',
      '不会的题先跳过，不钻牛角尖',
    ],
  },
  {
    id: 'examday-strategy',
    phase: '答题策略',
    daysLabel: '考试当日',
    description: '考场答题技巧，踩点拿分',
    category: 'strategy',
    tasks: [
      '先易后难：先拿稳所有有把握的分',
      '大题写清楚步骤，按步骤踩点得分',
      '证明题写清已知条件和每一步推导依据',
      '不会的题也写相关公式，不留空白',
      '选择题不确定时用排除法缩小范围',
    ],
  },
  {
    id: 'examday-mindset',
    phase: '心态调整',
    daysLabel: '考试当日',
    description: '保持平常心，正常发挥就是赢',
    category: 'mindset',
    tasks: [
      '进考场前做 3 次深呼吸：吸气 4 秒 → 屏息 4 秒 → 呼气 6 秒',
      '拿到试卷先通读，了解整体难度',
      '遇到难题不慌：你不会别人也未必会',
      '考完不跟人对答案，专注下一科',
      '相信自己的复习，正常发挥就好',
    ],
  },
];

export function getPreExamChecklist(daysLeft: number): PreExamChecklistItem[] {
  let currentPhaseId = 'd-7';
  if (daysLeft <= 0) currentPhaseId = 'examday-items'; // 考试日，第一项高亮
  else if (daysLeft <= 1) currentPhaseId = 'd-1';
  else if (daysLeft <= 2) currentPhaseId = 'd-2';
  else if (daysLeft <= 3) currentPhaseId = 'd-3';
  else if (daysLeft <= 4) currentPhaseId = 'd-4';
  else if (daysLeft <= 5) currentPhaseId = 'd-5';
  else if (daysLeft <= 6) currentPhaseId = 'd-6';
  else if (daysLeft <= 7) currentPhaseId = 'd-7';

  return PRE_EXAM_PHASES.map((p) => ({
    ...p,
    isCurrentPhase: p.id === currentPhaseId || (daysLeft <= 0 && p.category !== undefined),
  }));
}

export function getSprintStatusText(daysLeft: number): string {
  if (daysLeft <= 0) return '考试日：沉着应战';
  if (daysLeft <= 7) return `临考冲刺 D−${Math.ceil(daysLeft)}`;
  if (daysLeft <= 14) return '强化期：薄弱攻坚';
  if (daysLeft <= 28) return '提高期：专项练习';
  return '基础期：系统复习';
}

// ============================================================
// 考前清单进度持久化
// ============================================================

export const PRE_EXAM_CHECKLIST_KEY = 'mathforge_competition_prechecklist';

export type ChecklistProgress = Record<string, boolean[]>; // phaseId -> task[] checked

export function readChecklistProgress(): ChecklistProgress {
  try {
    const raw = scopedStorage.getItem(PRE_EXAM_CHECKLIST_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ChecklistProgress;
  } catch {
    return {};
  }
}

export function writeChecklistProgress(p: ChecklistProgress) {
  try {
    scopedStorage.setItem(PRE_EXAM_CHECKLIST_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

// ============================================================
// 学习周报
// ============================================================

export interface WeeklyTopicStat {
  topicKey: string;
  topicTitle: string;
  correctRate: number; // 0-1
  delta: number; // 本周 - 上周 正确率变化
  questions: number;
}

export interface WeeklyReportData {
  hasData: boolean;
  // 本周练习量
  practiceCount: number; // 总练习题数
  dailyCompletedDays: number; // 每日一练完成天数
  mockExamCount: number; // 模拟卷次数
  // 正确率
  thisWeekAccuracy: number; // 本周正确率 0-1
  lastWeekAccuracy: number; // 上周正确率
  accuracyDelta: number; // 差值
  // 真题正确率
  realExamAccuracy: number; // 真题整体正确率 0-1
  realExamTotal: number; // 真题已做套数
  realExamBestScore: number; // 真题最高分（百分制）
  // 薄弱专题
  weakTopics: WeeklyTopicStat[]; // 正确率最低前 3
  // 掌握进度
  masteredTopicsDelta: number; // 本周新增掌握专题数（用错题 mastered 变化近似）
  // 下周建议
  suggestions: string[];
}

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function computeWeeklyReport(
  stats: StatsRecord | null,
  examHistory: ExamHistoryRecord[],
  dailyRecords: DailyPracticeRecord[],
  wrongBookCount: number,
  masteredTopicsCount: number,
  realExamHistory: { examId: string; score: number; totalScore: number; date: number }[] = [],
): WeeklyReportData {
  const now = new Date();
  const thisWeekStart = startOfDay(new Date(now.getTime() - 6 * 86400000)); // 近 7 天
  const lastWeekStart = startOfDay(new Date(now.getTime() - 13 * 86400000)); // 近 14 天中的前 7 天

  // 练习量：从 stats.recentSessions 统计
  let thisWeekTotal = 0;
  let thisWeekCorrect = 0;
  let lastWeekTotal = 0;
  let lastWeekCorrect = 0;
  let practiceCount = 0;

  if (stats?.recentSessions) {
    for (const s of stats.recentSessions) {
      if (s.date >= thisWeekStart) {
        thisWeekTotal += s.total;
        thisWeekCorrect += s.correct;
        practiceCount += s.total;
      } else if (s.date >= lastWeekStart) {
        lastWeekTotal += s.total;
        lastWeekCorrect += s.correct;
      }
    }
  }

  // 模拟卷次数
  const mockExamCount = examHistory.filter((e) => e.date >= thisWeekStart).length;

  // 每日一练完成天数
  const dailyCompletedDays = dailyRecords.filter(
    (d) => d.allDone && new Date(d.date).getTime() >= thisWeekStart,
  ).length;

  // 正确率
  const thisWeekAccuracy = thisWeekTotal > 0 ? thisWeekCorrect / thisWeekTotal : 0;
  const lastWeekAccuracy = lastWeekTotal > 0 ? lastWeekCorrect / lastWeekTotal : 0;
  const accuracyDelta = thisWeekAccuracy - lastWeekAccuracy;

  // 薄弱专题（按 stats.topics 正确率排序取最低 3）
  const weakTopics: WeeklyTopicStat[] = [];
  if (stats?.topics) {
    const entries = Object.entries(stats.topics);
    const topicStats = entries
      .map(([key, t]) => {
        const rate = t.questions > 0 ? t.correct / t.questions : 1;
        return {
          topicKey: key,
          topicTitle: COMPETITION_TOPICS.find((c) => c.key === key)?.title ?? key,
          correctRate: rate,
          delta: 0, // 简化：不追踪上周各专题
          questions: t.questions,
        };
      })
      .filter((t) => t.questions > 0)
      .sort((a, b) => a.correctRate - b.correctRate);
    weakTopics.push(...topicStats.slice(0, 3));
  }

  // 真题正确率统计
  const realExamTotal = realExamHistory.length;
  let realExamAccuracy = 0;
  let realExamBestScore = 0;
  if (realExamTotal > 0) {
    const totalScoreSum = realExamHistory.reduce((s, r) => s + r.totalScore, 0);
    const scoreSum = realExamHistory.reduce((s, r) => s + r.score, 0);
    realExamAccuracy = totalScoreSum > 0 ? scoreSum / totalScoreSum : 0;
    realExamBestScore = Math.max(
      ...realExamHistory.map((r) => (r.totalScore > 0 ? (r.score / r.totalScore) * 100 : 0)),
      0,
    );
  }

  const hasData =
    practiceCount > 0 || mockExamCount > 0 || dailyCompletedDays > 0 || wrongBookCount > 0 || realExamTotal > 0;

  // 下周建议
  const suggestions: string[] = [];
  if (!hasData) {
    suggestions.push('开始你的第一次练习，建立学习基线');
    suggestions.push('从每日一练入手，每天 2 题保持手感');
  } else {
    if (weakTopics.length > 0) {
      suggestions.push(`重点突破「${weakTopics[0].topicTitle}」专题，正确率有待提升`);
    }
    if (thisWeekAccuracy < 0.6 && thisWeekTotal > 5) {
      suggestions.push('正确率偏低，建议回顾基础知识点再刷题');
    }
    if (mockExamCount === 0 && practiceCount > 10) {
      suggestions.push('练习量足够了，试试做一套模拟卷检验整体水平');
    }
    if (dailyCompletedDays < 3) {
      suggestions.push('坚持每日一练打卡，保持做题手感很重要');
    }
    if (suggestions.length === 0) {
      suggestions.push('保持当前节奏，稳步推进复习计划');
    }
  }

  return {
    hasData,
    practiceCount,
    dailyCompletedDays,
    mockExamCount,
    thisWeekAccuracy,
    lastWeekAccuracy,
    accuracyDelta,
    realExamAccuracy,
    realExamTotal,
    realExamBestScore,
    weakTopics,
    masteredTopicsDelta: masteredTopicsCount,
    suggestions,
  };
}
