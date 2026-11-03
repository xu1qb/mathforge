import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  CheckCircle2,
  Circle,
  BookOpen,
  Brain,
  FileText,
  ListTodo,
  Zap,
  Target,
  Clock,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { COMPETITION_TOPICS } from '@/data/competition';
import { MUST_MEMO_ITEMS, KNOWLEDGE_CARDS } from '@/data/competition-knowledge';
import { scopedStorage } from '@/lib/lark-mock';
import { cn } from '@/lib/utils';
import { format, addDays, differenceInDays, isToday, startOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const STORAGE_KEY = 'mathforge_countdown_plan';
const EXAM_DATE_KEY = 'mathforge_exam_date';

interface DayPlan {
  date: string; // YYYY-MM-DD
  dateObj: Date;
  daysLeft: number; // D-N，距考天数
  phase: '强化' | '实战' | '冲刺' | '回顾';
  phaseColor: string;
  tasks: {
    icon: any;
    label: string;
    detail: string;
    duration: number; // 分钟
  }[];
  totalMinutes: number;
}

function getPhase(daysLeft: number): { label: DayPlan['phase']; color: string } {
  if (daysLeft <= 3) return { label: '回顾', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/40' };
  if (daysLeft <= 7) return { label: '冲刺', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/40' };
  if (daysLeft <= 14) return { label: '实战', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/40' };
  return { label: '强化', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40' };
}

export default function CountdownPlanTab() {
  // 默认考试日期 2026-11-14
  const [examDateStr, setExamDateStr] = useState(() => {
    const saved = scopedStorage.getItem(EXAM_DATE_KEY);
    return saved || '2026-11-14';
  });
  const [completedDays, setCompletedDays] = useState<Set<string>>(() => {
    try {
      const saved = scopedStorage.getItem(STORAGE_KEY);
      if (saved) return new Set(JSON.parse(saved));
    } catch { /* noop */ }
    return new Set();
  });

  useEffect(() => {
    scopedStorage.setItem(EXAM_DATE_KEY, examDateStr);
  }, [examDateStr]);

  useEffect(() => {
    scopedStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completedDays)));
  }, [completedDays]);

  const examDate = useMemo(() => startOfDay(new Date(examDateStr)), [examDateStr]);
  const today = startOfDay(new Date());
  const totalDays = Math.max(1, differenceInDays(examDate, today));

  // 生成计划
  const plans = useMemo<DayPlan[]>(() => {
    const result: DayPlan[] = [];
    const topics = COMPETITION_TOPICS;
    const memoTotal = MUST_MEMO_ITEMS.length;
    const cardsTotal = KNOWLEDGE_CARDS.length;

    for (let i = 0; i < totalDays; i++) {
      const dateObj = addDays(today, i);
      const dateStr = format(dateObj, 'yyyy-MM-dd');
      const daysLeft = totalDays - i; // D-N
      const phase = getPhase(daysLeft);

      const tasks: DayPlan['tasks'] = [];

      // 1. 专题轮换
      const topicIndex = i % topics.length;
      const topic = topics[topicIndex];
      const isMockDay = daysLeft <= 7
        ? true
        : daysLeft <= 14
          ? true
          : i % 3 === 2; // >14天每3天1套

      // 专题任务：如果是套卷日则减半
      const topicCount = isMockDay ? 5 : 10;
      tasks.push({
        icon: Target,
        label: `${topic.title}专题训练`,
        detail: `${topicCount} 题随机练习`,
        duration: isMockDay ? 20 : 40,
      });

      // 2. 套卷/真题
      if (isMockDay) {
        tasks.push({
          icon: FileText,
          label: daysLeft <= 7 ? '全真模拟' : '真题演练',
          detail: daysLeft <= 7 ? '限时 150 分钟全真模拟' : '真题一套 · 重点突破',
          duration: daysLeft <= 7 ? 150 : 90,
        });
      }

      // 3. 错题复习
      tasks.push({
        icon: Brain,
        label: '错题复习',
        detail: '艾宾浩斯当日到期错题',
        duration: 20,
      });

      // 4. 必背结论（每日 10 条循环）
      const memoStart = (i * 10) % memoTotal;
      const memoEnd = Math.min(memoStart + 10, memoTotal);
      tasks.push({
        icon: BookOpen,
        label: '必背结论',
        detail: `第 ${Math.floor(i * 10 / memoTotal) + 1} 轮 · 第 ${memoStart + 1}-${memoEnd} 条`,
        duration: 15,
      });

      // 5. 知识卡片（按不会的优先，简化为轮换）
      const cardStart = (i * 8) % cardsTotal;
      tasks.push({
        icon: ListTodo,
        label: '知识卡片扫盲',
        detail: `第 ${cardStart + 1}-${Math.min(cardStart + 8, cardsTotal)} 张`,
        duration: 15,
      });

      const totalMinutes = tasks.reduce((sum, t) => sum + t.duration, 0);

      result.push({
        date: dateStr,
        dateObj,
        daysLeft,
        phase: phase.label,
        phaseColor: phase.color,
        tasks,
        totalMinutes,
      });
    }

    // 加考前一天（最后一天是回顾）
    return result;
  }, [totalDays, today]);

  const toggleComplete = useCallback((date: string) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }, []);

  const completedCount = completedDays.size;
  const progressPct = totalDays > 0 ? (completedCount / totalDays) * 100 : 0;

  const todayPlan = plans.find((p) => isToday(p.dateObj));

  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }
    return `${mins}min`;
  };

  const resetProgress = () => {
    if (confirm('确定要清空所有打卡记录吗？')) {
      setCompletedDays(new Set());
    }
  };

  const isExamPassed = differenceInDays(examDate, today) < 0;

  return (
    <div className="space-y-6">
      {/* 顶部统计 + 日期设置 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="size-4" />
              考试日期
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                type="date"
                value={examDateStr}
                onChange={(e) => setExamDateStr(e.target.value)}
                className="text-lg font-semibold"
              />
              <div className="text-sm text-muted-foreground">
                {isExamPassed ? (
                  <span className="text-rose-500">考试已结束</span>
                ) : (
                  <>距考试还有 <span className="font-bold text-primary">{totalDays}</span> 天</>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-4" />
              打卡进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground tabular-nums">{completedCount}</span>
                <span className="text-muted-foreground">/ {totalDays} 天</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                完成率 {progressPct.toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="size-4" />
              今日任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayPlan ? (
              <div className="space-y-1">
                <div className="text-sm">
                  共 <span className="font-semibold text-primary">{todayPlan.tasks.length}</span> 项任务
                </div>
                <div className="text-sm">
                  预计用时 <span className="font-semibold">{formatDuration(todayPlan.totalMinutes)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {todayPlan.phase}阶段 · D-{todayPlan.daysLeft}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 阶段图例 */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200">
          强化（{' > '}14天）
        </Badge>
        <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200">
          实战（8-14天）
        </Badge>
        <Badge variant="outline" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200">
          冲刺（4-7天）
        </Badge>
        <Badge variant="outline" className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200">
          回顾（1-3天）
        </Badge>
      </div>

      {/* 每日计划列表 */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              每日学习计划
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              共 {totalDays} 天，从今天到考前一天
            </CardDescription>
          </div>
          <Button size="sm" variant="ghost" onClick={resetProgress}>
            <RotateCcw className="size-3.5 mr-1.5" />
            重置打卡
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-border/50">
              {plans.map((plan) => {
                const isDone = completedDays.has(plan.date);
                const isTodayPlan = isToday(plan.date);
                return (
                  <div
                    key={plan.date}
                    className={cn(
                      'p-4 transition-colors',
                      isTodayPlan && 'bg-primary/5',
                      isDone && 'bg-muted/30',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* 左侧日期 */}
                      <div className="shrink-0 w-24 text-center">
                <div className={cn(
                  'text-2xl font-bold tabular-nums',
                  isDone ? 'text-muted-foreground line-through' : 'text-foreground',
                )}>
                  {'D-'}{plan.daysLeft}
                </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {format(plan.dateObj, 'M月d日', { locale: zhCN })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(plan.dateObj, 'EEE', { locale: zhCN })}
                        </div>
                        {isTodayPlan && (
                          <Badge variant="secondary" className="mt-1 text-xs bg-primary text-primary-foreground">
                            今天
                          </Badge>
                        )}
                      </div>

                      {/* 中间内容 */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <Badge variant="outline" className={plan.phaseColor}>
                          {plan.phase}阶段
                        </Badge>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {plan.tasks.map((task, tIdx) => {
                            const Icon = task.icon;
                            return (
                              <div
                                key={tIdx}
                                className={cn(
                                  'flex items-start gap-2 p-2 rounded-lg bg-card border border-border/50',
                                  isDone && 'opacity-60',
                                )}
                              >
                                <Icon className="size-4 shrink-0 text-primary mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-foreground">
                                    {task.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {task.detail}
                                  </div>
                                </div>
                                <div className="shrink-0 text-xs text-muted-foreground font-mono">
                                  {task.duration}min
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            <Clock className="size-3 inline mr-1 -mt-0.5" />
                            预计总时长：{formatDuration(plan.totalMinutes)}
                          </div>
                        </div>
                      </div>

                      {/* 右侧打卡按钮 */}
                      <div className="shrink-0">
                        <Button
                          size="sm"
                          variant={isDone ? 'secondary' : 'outline'}
                          onClick={() => toggleComplete(plan.date)}
                          className={cn(
                            'w-20',
                            isDone && 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40',
                          )}
                        >
                          {isDone ? (
                            <><CheckCircle2 className="size-3.5 mr-1" />已完成</>
                          ) : (
                            <><Circle className="size-3.5 mr-1" />打卡</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
