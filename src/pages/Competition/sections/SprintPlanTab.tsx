// 冲刺计划 tab：倒计时 + 四阶段 + 每日任务清单 + 日历视图

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Flame,
  ChevronRight,
  BookMarked,
  FileText,
  Play,
  CalendarDays,
  Sparkles,
  Brain,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useWrongBook } from '@/hooks/use-learning';
import {
  generateSprintPlan,
  getDaysLeft,
  getCurrentPhaseIndex,
  readDailyPlan,
  toggleTaskDone,
  getDailyProgress,
  EXAM_DATE,
  generate20DaySprintCalendar,
  toggleSprintCalendarDay,
  type SprintDailyPlan,
  type SprintDailyTask,
  type SprintCalendarData,
  type SprintCalendarDay,
} from '@/data/competition-sprint';

interface SprintPlanTabProps {
  onNavigateTab: (tabKey: string, detailKey?: string) => void;
}

export default function SprintPlanTab({ onNavigateTab }: SprintPlanTabProps) {
  const [view, setView] = useState<'today' | 'calendar'>('today');
  const [dailyPlan, setDailyPlan] = useState<SprintDailyPlan | null>(null);
  const { dueToday } = useWrongBook();

  const daysLeft = useMemo(() => getDaysLeft(), []);
  const phaseIdx = getCurrentPhaseIndex(daysLeft);
  const phases = generateSprintPlan(daysLeft);

  useEffect(() => {
    const plan = readDailyPlan();
    setDailyPlan(plan);
  }, []);

  const progress = dailyPlan ? getDailyProgress(dailyPlan) : 0;
  const doneCount = dailyPlan?.tasks.filter((t) => t.done).length ?? 0;
  const totalCount = dailyPlan?.tasks.length ?? 0;

  function handleToggle(taskId: string) {
    const updated = toggleTaskDone(taskId);
    if (updated) setDailyPlan({ ...updated });
  }

  function handleTaskAction(task: SprintDailyTask) {
    if (task.targetTab) {
      onNavigateTab(task.targetTab, task.targetDetail);
    }
  }

  const phaseColors = [
    'from-emerald-500 to-teal-500',
    'from-sky-500 to-blue-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-red-500',
  ];

  return (
    <div className="space-y-6">
      {/* 倒计时卡片 */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className={`bg-gradient-to-r ${phaseColors[phaseIdx]} text-white p-6 md:p-8`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-sm text-white/80 mb-1">
                距 2026 全国大学生数学竞赛（初赛）
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-bold tracking-tight tabular-nums">
                  {daysLeft}
                </span>
                <span className="text-2xl font-medium">天</span>
              </div>
              <div className="mt-2 text-white/90 flex items-center gap-2">
                <Calendar className="size-4" />
                考试日期：{EXAM_DATE} · 上午 9:00
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[120px]">
                <div className="text-xs text-white/80 mb-1">当前阶段</div>
                <div className="font-semibold text-sm">
                  {phases[Math.min(phaseIdx, phases.length - 1)]?.name.split('：')[1] ??
                    phases[Math.min(phaseIdx, phases.length - 1)]?.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 四阶段时间轴 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="size-5 text-primary" />
            四阶段冲刺路线
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {phases.map((p, i) => {
              const isActive = i === phaseIdx;
              const isPast = i < phaseIdx;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative rounded-xl border p-4 transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-md'
                      : isPast
                        ? 'border-border/60 bg-muted/30 opacity-70'
                        : 'border-border/60 bg-card'
                  }`}
                >
                  {isPast && (
                    <CheckCircle2 className="size-5 text-success absolute top-3 right-3" />
                  )}
                  {isActive && (
                    <Badge variant="default" className="absolute -top-2 -right-2 text-xs">
                      进行中
                    </Badge>
                  )}
                  <div
                    className={`text-xs font-medium mb-2 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {p.duration}
                  </div>
                  <div className="font-semibold text-sm mb-2">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.description}</div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab 切换：今日任务 / 计划日历 */}
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList className="mb-4">
          <TabsTrigger value="today" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Flame className="size-4 mr-1.5" />
            今日任务
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="size-4 mr-1.5" />
            全程日历
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-0 space-y-4">
          {dailyPlan && (
            <>
              {/* 进度概览 */}
              <Card className="border-primary/20">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookMarked className="size-4 text-primary" />
                      <span className="font-medium">今日完成度</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {dailyPlan.phaseName}
                      </Badge>
                    </div>
                    <span className="font-semibold text-primary tabular-nums">
                      {Math.round(progress * 100)}%
                    </span>
                  </div>
                  <Progress value={progress * 100} className="h-2" />
                  <div className="mt-2 text-sm text-muted-foreground">
                    已完成 {doneCount} / {totalCount} 项 · 预计总用时{' '}
                    {dailyPlan.tasks.reduce((s, t) => s + t.estimatedMinutes, 0)} 分钟
                  </div>
                </CardContent>
              </Card>

              {/* 任务列表 */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {dailyPlan.tasks.map((task, i) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      index={i}
                      onToggle={() => handleToggle(task.id)}
                      onAction={() => handleTaskAction(task)}
                      dueTodayCount={dueToday.length}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <CalendarView onNavigateTab={onNavigateTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---- 任务项 ----

function TaskItem({
  task,
  index,
  onToggle,
  onAction,
  dueTodayCount = 0,
}: {
  task: SprintDailyTask;
  index: number;
  onToggle: () => void;
  onAction: () => void;
  dueTodayCount?: number;
}) {

  const badgeMap: Record<string, string> = {
    'topic-practice': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    'mock-exam': 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/90',
    'real-exam': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'wrong-book': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    formula: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    skill: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    trap: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'daily-checkin': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  };

  const labelMap: Record<string, string> = {
    'topic-practice': '专题',
    'mock-exam': '模拟卷',
    'real-exam': '真题',
    'wrong-book': '错题',
    formula: '公式',
    skill: '技巧',
    trap: '陷阱',
    'daily-checkin': '打卡',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
        task.done
          ? 'bg-muted/40 border-border/50'
          : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
      }`}
    >
      <button
        onClick={onToggle}
        className="mt-0.5 shrink-0 transition-transform hover:scale-110 active:scale-95"
        aria-label={task.done ? '取消完成' : '标记完成'}
      >
        {task.done ? (
          <CheckCircle2 className="size-5 text-success" />
        ) : (
          <Circle className="size-5 text-muted-foreground/60" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              badgeMap[task.type] ?? 'bg-muted text-muted-foreground'
            }`}
          >
            {labelMap[task.type] ?? '任务'}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" />
            {task.estimatedMinutes} 分钟
          </span>
        </div>
        <h4
          className={`font-medium text-sm ${
            task.done ? 'text-muted-foreground line-through' : 'text-foreground'
          }`}
        >
          {task.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {task.type === 'wrong-book' && dueTodayCount > 0
            ? `${task.description}（今日待复习 ${dueTodayCount} 题）`
            : task.description}
        </p>
      </div>

      {task.targetTab && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAction}
          className="shrink-0 h-8 -mr-2"
        >
          前往
          <ChevronRight className="size-3.5 ml-0.5" />
        </Button>
      )}
    </motion.div>
  );
}

// ---- 日历视图 ----

function CalendarView({
  onNavigateTab,
}: {
  onNavigateTab: (tabKey: string, detailKey?: string) => void;
}) {
  const [calendar, setCalendar] = useState<SprintCalendarData>(() => generate20DaySprintCalendar());

  function handleToggleDay(date: string) {
    toggleSprintCalendarDay(date);
    setCalendar(generate20DaySprintCalendar());
  }

  function handleStart(day: SprintCalendarDay) {
    // 跳转到对应功能页
    const routeMap: Record<string, string> = {
      topic: 'topic',
      exam: 'exam',
      wrongbook: 'wrongbook',
      formula: 'formula',
      templates: 'templates',
      traps: 'traps',
    };
    const tab = routeMap[day.targetRoute] ?? day.targetRoute;
    onNavigateTab(tab);
  }

  const stageColors = {
    topic: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', badge: 'bg-sky-500 text-white', text: 'text-sky-600 dark:text-sky-400' },
    exam: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500 text-white', text: 'text-amber-600 dark:text-amber-400' },
    review: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'bg-emerald-500 text-white', text: 'text-emerald-600 dark:text-emerald-400' },
  };

  const progress = Math.round((calendar.completedCount / calendar.totalDays) * 100);

  return (
    <div className="space-y-5">
      {/* 进度概览 */}
      <Card className="border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CalendarDays className="size-4.5" />
              </div>
              <div>
                <div className="text-sm text-foreground">20 天冲刺进度</div>
                <div className="text-xs text-muted-foreground">距考试 {calendar.days[0]?.daysLeft ?? 0} 天 · 考试日期 {EXAM_DATE}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums text-foreground">
                {calendar.completedCount}<span className="text-sm font-normal text-muted-foreground"> / {calendar.totalDays}</span>
              </div>
              <div className="text-xs text-muted-foreground">已完成天数</div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* 三阶段图例 */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${stageColors.topic.bg} ${stageColors.topic.border} border`}>
          <Brain className="size-3.5" />
          <span className={stageColors.topic.text}>D-20~D-13 专题强化</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${stageColors.exam.bg} ${stageColors.exam.border} border`}>
          <FileText className="size-3.5" />
          <span className={stageColors.exam.text}>D-12~D-6 套卷实战</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${stageColors.review.bg} ${stageColors.review.border} border`}>
          <Sparkles className="size-3.5" />
          <span className={stageColors.review.text}>D-5~D-1 考前回顾</span>
        </div>
      </div>

      {/* 每日卡片列表 */}
      <div className="space-y-3">
        {calendar.days.map((day, idx) => {
          const colors = stageColors[day.stage];
          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.4) }}
            >
              <Card
                className={`overflow-hidden transition-colors ${
                  day.isToday
                    ? 'border-primary shadow-md ring-2 ring-primary/20'
                    : day.done
                    ? 'opacity-70 border-border/60'
                    : 'border-border/60 hover:border-border'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* 左侧：D-N 标签 */}
                    <div className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <span className={`text-lg font-bold tabular-nums ${colors.text}`}>D-{day.daysLeft}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{day.date.slice(5)}</span>
                    </div>

                    {/* 中间：任务内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`h-5 text-xs px-1.5 ${colors.border} ${colors.text}`}>
                          {day.stageName}
                        </Badge>
                        {day.isToday && (
                          <Badge className="h-5 text-xs px-1.5 bg-primary text-primary-foreground">今天</Badge>
                        )}
                        {day.done && !day.isToday && (
                          <Badge variant="secondary" className="h-5 text-xs px-1.5">
                            <CheckCircle2 className="size-2.5 mr-0.5" />已完成
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-foreground mb-1.5">{day.title}</div>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {day.tasks.map((t, ti) => (
                          <li key={ti} className="flex items-start gap-1.5">
                            <Circle className="size-2.5 mt-0.5 shrink-0 text-muted-foreground/60" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 右侧：操作按钮 */}
                    <div className="shrink-0 flex flex-col gap-2 items-end">
                      <Button
                        size="sm"
                        variant={day.done ? 'outline' : 'default'}
                        onClick={() => handleStart(day)}
                        className="h-8 text-xs"
                      >
                        <Play className="size-3 mr-1" />
                        {day.targetLabel}
                      </Button>
                      <Button
                        size="sm"
                        variant={day.done ? 'default' : 'ghost'}
                        onClick={() => handleToggleDay(day.date)}
                        className={`h-7 text-xs ${day.done ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
                      >
                        {day.done ? (
                          <><CheckCircle2 className="size-3 mr-1" />已打卡</>
                        ) : (
                          <><Circle className="size-3 mr-1" />打卡</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
