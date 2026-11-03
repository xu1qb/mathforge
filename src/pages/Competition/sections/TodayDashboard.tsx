import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Target,
  CheckCircle2,
  Play,
  BookX,
  Zap,
  FileText,
  Trophy,
  Flame,
  BookMarked,
  Clock3,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  getDaysLeft,
  getCurrentPhaseIndex,
  readDailyRecord,
  type DailyPracticeRecord,
} from '@/data/competition-sprint';
import { computeDashboardData, type DashboardData } from '@/data/competition-dashboard';
import { useWrongBook, STATS_KEY, type StatsRecord } from '@/hooks/use-learning';
import { COMPETITION_TOPICS } from '@/data/competition';
import { scopedStorage } from '@/lib/lark-mock';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================
// 今日任务类型
// ============================================================
interface TodayTask {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  icon: typeof CalendarDays;
  done: boolean;
  accent: 'primary' | 'amber' | 'rose' | 'violet' | 'emerald';
  action: () => void;
  actionLabel: string;
}

// ============================================================
// 倒计时阶段色
// ============================================================
function getCountdownTheme(daysLeft: number) {
  if (daysLeft > 21) {
    return {
      gradient: 'from-emerald-600 to-teal-700',
      badge: 'bg-white/20',
      label: '基础巩固期',
      tone: 'emerald',
    };
  }
  if (daysLeft >= 15) {
    return {
      gradient: 'from-teal-600 to-cyan-700',
      badge: 'bg-white/20',
      label: '专题强化期',
      tone: 'teal',
    };
  }
  if (daysLeft >= 8) {
    return {
      gradient: 'from-amber-500 to-orange-600',
      badge: 'bg-white/20',
      label: '真题实战期',
      tone: 'amber',
    };
  }
  return {
    gradient: 'from-rose-500 to-red-600',
    badge: 'bg-white/20',
    label: '临考冲刺期',
    tone: 'rose',
  };
}

function getTopicName(key: string): string {
  return COMPETITION_TOPICS.find((t) => t.key === key)?.title ?? key;
}

// ============================================================
// 主组件
// ============================================================
export default function TodayDashboard({
  isExamOver = false,
  onGoMock,
  onGoPractice,
  onGoWrongBook,
  onGoTemplates,
  onGoTopics,
}: {
  isExamOver?: boolean;
  onGoMock: () => void;
  onGoPractice: () => void;
  onGoWrongBook: () => void;
  onGoTemplates: () => void;
  onGoTopics: (topicKey: string) => void;
}) {
  const navigate = useNavigate();
  const daysLeft = useMemo(() => getDaysLeft(), []);
  const phaseIdx = useMemo(() => getCurrentPhaseIndex(daysLeft), [daysLeft]);
  const theme = getCountdownTheme(daysLeft);

  // 今日一练完成状态
  const [dailyRecord, setDailyRecord] = useState<DailyPracticeRecord | null>(() =>
    readDailyRecord(),
  );

  // 错题本（含今日到期数）
  const { dueToday } = useWrongBook();

  // 看板数据（薄弱专题、打卡天数、累计做题等）
  const [dashboard, setDashboard] = useState<DashboardData>(() => computeDashboardData());

  // 刷新
  const refresh = useCallback(() => {
    setDailyRecord(readDailyRecord());
    setDashboard(computeDashboardData());
  }, []);

  // 每次组件获得焦点时刷新（做完题回来状态更新）
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [refresh]);

  // 今日必做任务
  const tasks = useMemo<TodayTask[]>(() => {
    const dailyDone = !!dailyRecord?.allDone;
    const weakTopicKey = dashboard.weakTopics[0] ?? 'limit-continuity';
    const weakTopicName = getTopicName(weakTopicKey);

    // 真题模考：考试结束后改为普通"随机练一套"，不再按阶段推荐
    const examDoneToday = dashboard.examScores.some(
      (s) => new Date(s.date).toDateString() === new Date().toDateString(),
    );

    const list: TodayTask[] = [
      {
        id: 'daily',
        title: '每日一练',
        subtitle: dailyDone ? '已完成今日练习' : '今天的 2 道题还没做',
        minutes: 10,
        icon: Zap,
        done: dailyDone,
        accent: 'primary',
        action: () => {
          onGoPractice();
          toast.success('开始每日一练');
        },
        actionLabel: '开始',
      },
      {
        id: 'wrong-review',
        title: '错题复习',
        subtitle: `今日到期 ${dueToday.length} 道错题（艾宾浩斯）`,
        minutes: 15,
        icon: BookX,
        done: dueToday.length === 0,
        accent: 'rose',
        action: () => {
          onGoWrongBook();
        },
        actionLabel: dueToday.length === 0 ? '已清零' : '去复习',
      },
      {
        id: 'weak-topic',
        title: '薄弱专题练手',
        subtitle: `${weakTopicName} · 正确率最低，练 10 题`,
        minutes: 30,
        icon: Target,
        done: false,
        accent: 'amber',
        action: () => {
          onGoTopics(weakTopicKey);
        },
        actionLabel: '去练习',
      },
      {
        id: 'templates',
        title: '今日套路 3 张',
        subtitle: '解题模板库 · 每日推荐 3 张速记卡',
        minutes: 10,
        icon: BookMarked,
        done: false,
        accent: 'violet',
        action: () => {
          onGoTemplates();
        },
        actionLabel: '去速记',
      },
    ];

    // 考试结束后：增加"随机练一套"项（不再按阶段推荐频率）
    if (isExamOver) {
      list.push({
        id: 'mock-exam',
        title: '随机练一套',
        subtitle: '不限时间，随机抽取一套真题练练手',
        minutes: 120,
        icon: FileText,
        done: examDoneToday,
        accent: 'emerald',
        action: () => {
          onGoMock();
        },
        actionLabel: examDoneToday ? '已完成' : '开始练习',
      });
    } else {
      // 备考期：按阶段决定是否推荐真题/模考为"今日必做"
      const examToday = (() => {
        if (phaseIdx <= 0) return { should: false, label: '每周 1 套' };
        if (phaseIdx === 1) return { should: false, label: '每周 1 套' };
        if (phaseIdx === 2) return { should: daysLeft % 2 === 0, label: '每 2 天 1 套' };
        return { should: true, label: '每天 1 套' };
      })();

      if (examToday.should || phaseIdx >= 2) {
        list.push({
          id: 'mock-exam',
          title: '真题 / 模考',
          subtitle: `${examToday.label} · 全真模拟 150 分钟`,
          minutes: 150,
          icon: FileText,
          done: examDoneToday,
          accent: 'emerald',
          action: () => {
            onGoMock();
          },
          actionLabel: examDoneToday ? '已完成' : '开始模考',
        });
      }
    }

    return list;
  }, [isExamOver, dailyRecord, dueToday.length, dashboard.weakTopics, dashboard.examScores, phaseIdx, daysLeft, onGoPractice, onGoWrongBook, onGoTopics, onGoTemplates, onGoMock]);

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // 今日数据速览
  const quickStats = useMemo(() => {
    // 从原始 stats 读 recentSessions，算今日做题数
    let todayDone = 0;
    let weekAccuracy = 0;
    try {
      const raw = scopedStorage.getItem(STATS_KEY);
      if (raw) {
        const stats = JSON.parse(raw) as StatsRecord;
        const todayStr = new Date().toDateString();
        const todaySessions = stats.recentSessions.filter(
          (s) => new Date(s.date).toDateString() === todayStr,
        );
        todayDone = todaySessions.reduce((s, r) => s + r.total, 0);

        // 近 7 天正确率
        const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
        const weekSessions = stats.recentSessions.filter((s) => s.date >= sevenDaysAgo);
        const weekCorrect = weekSessions.reduce((s, r) => s + r.correct, 0);
        const weekTotal = weekSessions.reduce((s, r) => s + r.total, 0);
        weekAccuracy = weekTotal > 0 ? Math.round((weekCorrect / weekTotal) * 100) : 0;
      }
    } catch {
      // ignore
    }

    return {
      totalQuestions: dashboard.totalQuestions,
      todayDone,
      weekAccuracy: weekAccuracy || dashboard.totalAccuracy,
      streakDays: dashboard.streakDays,
      masteredTopics: dashboard.radarData.filter((r) => r.value >= 60).length,
    };
  }, [dashboard]);

  const accentBg: Record<TodayTask['accent'], string> = {
    primary: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300',
    emerald: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      {/* 1. 倒计时大字 + 今日进度（考试结束后仅显示今日进度） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!isExamOver && (
          <Card
            className={cn(
              'md:col-span-2 text-white border-0 overflow-hidden bg-gradient-to-br',
              theme.gradient,
            )}
          >
          <CardContent className="p-5 md:p-6 relative">
            <div className="absolute -right-8 -top-8 size-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -right-16 bottom-0 size-48 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="text-white/80 text-sm mb-2 flex items-center gap-2">
                <CalendarDays className="size-4" />
                2026年11月14日 · 初赛 · 非数学类A
                <Badge className={cn('ml-2 text-xs font-medium', theme.badge)}>
                  {theme.label}
                </Badge>
              </div>
              <div className="text-5xl md:text-6xl font-bold mb-1 tabular-nums tracking-tight">
                {daysLeft}
                <span className="text-xl font-normal ml-2 text-white/80">天</span>
              </div>
              <div className="text-white/80 text-sm mb-4">
                150 分钟 · 5 道填空 + 5 道大题 · 满分 100 分
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={onGoMock}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  <Play className="size-4 mr-1.5" />开始模拟
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/competition?tab=real-exams')}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <FileText className="size-4 mr-1.5" />
                  真题套卷
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        <Card className={cn('border-border/60', isExamOver && 'md:col-span-3')}>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="size-4 text-emerald-600" />今日完成度
              </div>
              <span className="text-xs text-muted-foreground">
                {completedCount} / {tasks.length}
              </span>
            </div>
            <Progress value={progressPct} className="h-2 bg-emerald-100 [&>div]:bg-emerald-600" />
            <div className="text-2xl font-bold text-emerald-700 tabular-nums">
              {progressPct}%
              <span className="text-sm font-normal text-muted-foreground ml-1">完成</span>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              {completedCount === 0
                ? '今天的任务还没开始，从每日一练出发吧～'
                : completedCount < tasks.length
                ? `已完成 ${completedCount} 项，继续加油！`
                : '今日任务全部完成，太棒了！'}
            </div>
            <div className="pt-1 flex flex-wrap gap-1.5">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  title={t.title}
                  className={cn(
                    'size-2.5 rounded-full',
                    t.done ? 'bg-emerald-500' : 'bg-border',
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. 今日必做清单 */}
      <Card className="border-border/60">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />今日必做
            </div>
            <span className="text-xs text-muted-foreground">
              预计总时长 {tasks.reduce((s, t) => s + t.minutes, 0)} 分钟
            </span>
          </div>

          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                  task.done
                    ? 'bg-muted/40 border-border/50'
                    : 'bg-card border-border/70 hover:border-primary/40',
                )}
              >
                <div
                  className={cn(
                    'size-9 rounded-lg flex items-center justify-center shrink-0',
                    accentBg[task.accent],
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      'text-sm font-medium flex items-center gap-2',
                      task.done && 'text-muted-foreground line-through',
                    )}
                  >
                    {task.title}
                    <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                      <Clock3 className="size-3" />
                      {task.minutes} 分钟
                    </span>
                  </div>
                  <div
                    className={cn(
                      'text-xs mt-0.5 truncate',
                      task.done ? 'text-muted-foreground/70' : 'text-muted-foreground',
                    )}
                  >
                    {task.subtitle}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={task.done ? 'ghost' : 'secondary'}
                  onClick={task.action}
                  className="shrink-0"
                >
                  {task.done ? (
                    <>
                      <CheckCircle2 className="size-3.5 mr-1" />
                      已完成
                    </>
                  ) : (
                    <>
                      {task.actionLabel}
                      <ChevronRight className="size-3.5 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 3. 今日数据速览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Trophy className="size-3 text-amber-500" />累计做题
            </div>
            <div className="text-2xl font-bold tabular-nums text-foreground">
              {quickStats.totalQuestions}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Target className="size-3 text-emerald-500" />7 日正确率
            </div>
            <div className="text-2xl font-bold tabular-nums text-foreground">
              {quickStats.weekAccuracy}%
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Flame className="size-3 text-rose-500" />连续打卡
            </div>
            <div className="text-2xl font-bold tabular-nums text-foreground">
              {quickStats.streakDays}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">天</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <BookMarked className="size-3 text-violet-500" />掌握专题
            </div>
            <div className="text-2xl font-bold tabular-nums text-foreground">
              {quickStats.masteredTopics}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">/ 8</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
