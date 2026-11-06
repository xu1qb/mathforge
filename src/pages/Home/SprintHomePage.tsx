import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Target,
  FileText,
  Brain,
  BookOpen,
  ListTodo,
  TrendingUp,
  Zap,
  Clock,
  ArrowRight,
  Flame,
  BookMarked,
  GraduationCap,
  NotebookPen,
  Sparkles,
} from 'lucide-react';
import { COMPETITION_TOPICS } from '@/data/competition';
import { BRANCH_CATEGORIES } from '@/data/branches';
import { useRecentModules } from '@/hooks/use-recent-modules';
import { MUST_MEMO_ITEMS, KNOWLEDGE_CARDS } from '@/data/competition-knowledge';
import { computeDashboardData } from '@/data/competition-dashboard';
import { useWrongBook } from '@/hooks/use-learning';
import { WeaknessTop3 } from '@/pages/Competition/sections/WeaknessHeatmap';
import WrongReasonChart from '@/components/WrongReasonChart';
import KnowledgeContinentMap from '@/components/KnowledgeContinentMap';
import { daysUntilRetake, loadHistory } from '@/pages/MathematicianQuiz/quiz-history';
import { differenceInDays, startOfDay } from 'date-fns';
import { scopedStorage } from '@/lib/lark-mock';
import type { MasteryMap } from '@/data/competition-knowledge';

const EXAM_DATE = '2026-11-14';

// 阶段激励文案
const PHASE_MESSAGES = {
  强化: [
    '基础不牢，地动山摇。每天一个专题，稳扎稳打。',
    '强化阶段重质量不重量，一道题吃透胜过十道题掠过。',
    '错题是最好的老师，今天的错误是明天的分数。',
  ],
  实战: [
    '真题是最好的模拟卷，掐时间做，找考场感觉。',
    '套卷练习后务必复盘，错题要知其所以然。',
    '实战阶段拼的是节奏和心态，稳住就是胜利。',
  ],
  冲刺: [
    '最后冲刺！错题本再过一遍，薄弱点精准打击。',
    '每天一套全真模拟，保持手感到考场。',
    '冲刺阶段看的是坚持，不到最后一刻绝不放松。',
  ],
  回顾: [
    '考前回顾：公式结论再过一遍，心中有数就不慌。',
    '调整作息，保持最佳状态迎接考试。',
    '你已经准备得很充分了，相信自己，正常发挥！',
  ],
};

function getPhase(daysLeft: number): { label: string; color: string; messages: string[] } {
  if (daysLeft <= 3) return { label: '回顾', color: 'text-rose-500', messages: PHASE_MESSAGES.回顾 };
  if (daysLeft <= 7) return { label: '冲刺', color: 'text-amber-500', messages: PHASE_MESSAGES.冲刺 };
  if (daysLeft <= 14) return { label: '实战', color: 'text-blue-500', messages: PHASE_MESSAGES.实战 };
  return { label: '强化', color: 'text-emerald-500', messages: PHASE_MESSAGES.强化 };
}

export default function SprintHomePage() {
  const navigate = useNavigate();
  const { dueToday, wrongReasonStats } = useWrongBook();
  const recentModules = useRecentModules(6);
  const examDate = startOfDay(new Date(EXAM_DATE));
  const today = startOfDay(new Date());
  const daysLeft = Math.max(0, differenceInDays(examDate, today));
  const phase = getPhase(daysLeft);

  // 每日一句（按日期轮换）
  const dailyMessage = useMemo(() => {
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const idx = dayOfYear % phase.messages.length;
    return phase.messages[idx];
  }, [today, phase]);

  // 今日任务（复用倒排计划逻辑）
  const todayTasks = useMemo(() => {
    const dayIndex = 0; // 今天是第 0 天
    const topics = COMPETITION_TOPICS;
    const memoTotal = MUST_MEMO_ITEMS.length;

    const topicIndex = dayIndex % topics.length;
    const topic = topics[topicIndex];
    const isMockDay = daysLeft <= 7 ? true : daysLeft <= 14 ? true : dayIndex % 3 === 2;
    const topicCount = isMockDay ? 5 : 10;

    const tasks = [
      {
        icon: Target,
        label: `${topic.title}专题训练`,
        detail: `${topicCount} 题随机练习`,
        duration: isMockDay ? 20 : 40,
        action: () => navigate('/competition?tab=practice'),
      },
      {
        icon: FileText,
        label: isMockDay ? (daysLeft <= 7 ? '全真模拟' : '真题演练') : '套卷练习',
        detail: isMockDay ? (daysLeft <= 7 ? '限时 150 分钟' : '真题一套') : '本周第 2 套',
        duration: isMockDay ? (daysLeft <= 7 ? 150 : 90) : 0,
        action: () => navigate('/competition?tab=mock'),
      },
      {
        icon: Brain,
        label: '错题复习',
        detail: dueToday.length > 0 ? `今日到期 ${dueToday.length} 道 · 艾宾浩斯` : '暂无到期错题 🎉',
        duration: dueToday.length > 0 ? Math.max(10, dueToday.length * 3) : 0,
        action: () => navigate('/practice#review-queue'),
      },
      {
        icon: BookOpen,
        label: '必背结论',
        detail: `第 1 轮 · 第 1-10 条 / 共 ${memoTotal} 条`,
        duration: 15,
        action: () => navigate('/competition?tab=must-memo'),
      },
    ].filter((t) => t.duration > 0);

    return tasks;
  }, [daysLeft, navigate, dueToday]);

  // 数据看板数据
  const dashboardData = useMemo(() => {
    try {
      return computeDashboardData();
    } catch {
      return null;
    }
  }, []);

  // 知识卡片掌握度
  const [masteryMap, setMasteryMap] = useState<MasteryMap>({});
  useEffect(() => {
    try {
      const raw = scopedStorage.getItem('mathforge:competition:cards-mastery:v1');
      if (raw) setMasteryMap(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // 打卡进度
  const completedDays = useMemo(() => {
    try {
      const raw = scopedStorage.getItem('mathforge_countdown_plan');
      if (raw) return new Set<string>(JSON.parse(raw));
    } catch { /* ignore */ }
    return new Set<string>();
  }, []);

  const totalMinutes = todayTasks.reduce((sum, t) => sum + t.duration, 0);
  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }
    return `${mins}min`;
  };

  const isExamOver = daysLeft <= 0;

  if (isExamOver) return null;

  return (
    <div className="min-h-full page-fade-in">
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-7xl mx-auto space-y-6">
        {/* 页头：定位语 + 分支入口 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground">数学计算工作台</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              11 个大类 · 66 个分支 · 70 个考点，从基础计算到竞赛冲刺
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate('/calculator')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              切换到普通首页
            </button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/branches')}>
              <BookOpen className="size-4" /> 分支总览
            </Button>
          </div>
        </div>

        {/* 顶部：倒计时 + 今日一句 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-primary/5 border-primary/20 overflow-hidden">
            <CardContent className="p-4 md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex shrink-0 items-baseline gap-1.5">
                    <span className="text-3xl font-black tabular-nums tracking-tight text-primary md:text-4xl">
                      {daysLeft}
                    </span>
                    <span className="text-xs text-muted-foreground">天</span>
                  </div>
                  <div className="h-9 w-px shrink-0 bg-border/60" />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className={phase.color}>
                        <Zap className="size-3 mr-1" />
                        {phase.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="size-3 mr-1" />
                        11 月 14 日
                      </Badge>
                    </div>
                    <div className="truncate text-sm text-foreground">「{dailyMessage}」</div>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigate('/competition?tab=countdown')}
                  className="shrink-0 bg-primary hover:bg-primary/90"
                >
                  完整计划
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 学科分支入口条 */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {BRANCH_CATEGORIES.filter((c) => c.id !== 'competition').map((cat) => {
            const covered = cat.branches.filter((b) => b.pagePath || (b.tags && b.tags.length > 0) || b.courseId).length;
            return (
              <button
                key={cat.id}
                onClick={() => navigate('/branches')}
                className="rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <div className="truncate text-sm font-medium text-foreground">{cat.zh}</div>
                <div className="text-xs text-muted-foreground">
                  {covered}/{cat.branches.length} 分支覆盖
                </div>
              </button>
            );
          })}
        </div>

        {/* 课程入口 */}
        <button
          onClick={() => navigate('/course/linear-algebra')}
          className="flex w-full items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/10"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <GraduationCap className="size-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">
              线性代数课程 · 对齐同济第七版
            </span>
            <span className="block text-xs text-muted-foreground">
              6 章 · 29 个知识点 · 46 道带解答的练习
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        </button>

        {/* 最近访问：只在有记录时出现 */}
        {recentModules.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">最近</span>
            {recentModules.map((m) => (
              <button
                key={m.path}
                onClick={() => navigate(m.path)}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左列：知识大陆 + 今日任务 + 薄弱模块 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 知识大陆 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <KnowledgeContinentMap compact />
            </motion.div>

            {/* 今日任务 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <ListTodo className="size-4 text-primary" />
                      今日任务
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="size-3 mr-1" />
                      预计 {formatDuration(totalMinutes)}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    今日共 {todayTasks.length} 项，逐项完成即可
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {todayTasks.map((task, i) => {
                    const Icon = task.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                      >
                        <button
                          onClick={task.action}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-primary/40 hover:bg-accent/30 transition-all text-left group"
                        >
                          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Icon className="size-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground">
                              {task.label}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {task.detail}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-xs text-muted-foreground font-mono">
                              {task.duration}min
                            </div>
                            <div className="text-xs text-primary flex items-center justify-end gap-0.5 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              开始 <ArrowRight className="size-3" />
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* 右列：数学家人格 + 速查入口 + 数据速览 */}
          <div className="space-y-6">
            {/* 速查入口 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BookMarked className="size-4 text-primary" />
                    速查入口
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {[
                    { icon: BookOpen, label: '公式速查', desc: '190+ 公式', action: () => navigate('/formulas') },
                    { icon: NotebookPen, label: '必背结论', desc: `${MUST_MEMO_ITEMS.length} 条`, action: () => navigate('/competition?tab=must-memo') },
                    { icon: Brain, label: '知识卡片', desc: `${KNOWLEDGE_CARDS.length} 张`, action: () => navigate('/competition?tab=skills') },
                    { icon: Zap, label: '解题模板', desc: '36 套路', action: () => navigate('/competition?tab=templates') },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={i}
                        onClick={item.action}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-accent/30 transition-all"
                      >
                        <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="size-4" />
                        </div>
                        <div className="text-xs font-medium text-foreground">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* 数据速览 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    学习数据
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboardData?.hasData ? (
                    <>
                      <StatRow
                        icon={Target}
                        label="累计做题"
                        value={`${dashboardData.totalQuestions} 道`}
                      />
                      <StatRow
                        icon={TrendingUp}
                        label="综合正确率"
                        value={`${(dashboardData.totalAccuracy * 100).toFixed(1)}%`}
                      />
                      <StatRow
                        icon={Flame}
                        label="连续打卡"
                        value={`${dashboardData.streakDays} 天`}
                      />
                      <StatRow
                        icon={Brain}
                        label="今日待重做"
                        value={`${dueToday.length} 道`}
                      />
                      {wrongReasonStats.totalWithReason > 0 && (
                        <div className="pt-1 -mx-1">
                          <WrongReasonChart
                            counts={wrongReasonStats.counts}
                            totalWithReason={wrongReasonStats.totalWithReason}
                            topReason={wrongReasonStats.topReason}
                            compact
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      还没有学习数据，开始做题吧
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* 薄弱模块速览 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Flame className="size-4 text-rose-500" />
                      薄弱模块 Top3
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/competition?tab=dashboard')}
                    >
                      查看全部 <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    综合正确率与卡片掌握度，优先攻克
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData ? (
                    <WeaknessTop3
                      topicDistribution={dashboardData.topicDistribution}
                      masteryMap={masteryMap}
                      onGoTopic={() => navigate('/competition?tab=practice')}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-6">
                      暂无学习数据
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            {/* 数学家人格测试 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                className="bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-700/40 cursor-pointer hover:shadow-md transition-all group overflow-hidden"
                onClick={() => navigate('/mathematician-quiz')}
              >
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <Sparkles className="size-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-rose-800 dark:text-rose-300">
                        你是哪种数学家？
                      </div>
                      <div className="text-xs text-rose-600/70 dark:text-rose-400/70">
                        10 题测出数学人格
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const history = loadHistory();
                    const lastRecord = history[0];
                    const retakeDays = daysUntilRetake();
                    if (lastRecord && retakeDays > 0) {
                      const typeNames: Record<string, string> = {
                        gauss: '高斯', euler: '欧拉', ramanujan: '拉马努金', archimedes: '阿基米德',
                      };
                      return (
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-sm">
                            <span className="font-bold text-rose-700 dark:text-rose-400">
                              {typeNames[lastRecord.result.primary]}型
                            </span>
                            <span className="text-xs text-rose-500/60 dark:text-rose-400/60 ml-2">
                              {retakeDays} 天后可重测
                            </span>
                          </div>
                          <ArrowRight className="size-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                          立即测试
                        </span>
                        <ArrowRight className="size-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground tabular-nums">{value}</div>
    </div>
  );
}
