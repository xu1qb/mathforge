// EXPORTS: ProgressPage
// 学习报告：连续天数、正确率趋势、错因分布、复习推进、热力图与按知识点掌握度

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import HeatmapSection from '@/components/HeatmapSection';
import LearningTrendChart, { buildDailyTrend } from '@/components/learning/LearningTrendChart';
import WrongReasonDonut from '@/components/learning/WrongReasonDonut';
import ReviewStageChart from '@/components/learning/ReviewStageChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { computeStreakInfo, useLearningStats, useWrongBook } from '@/hooks/use-learning';
import { topicLabelOf } from '@/lib/topic-label';
import { Flame, Target, TrendingUp, AlertTriangle, ArrowRight, Activity, Brain, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const RANGE_OPTIONS = [
  { value: 7, label: '7 天' },
  { value: 30, label: '30 天' },
  { value: 90, label: '90 天' },
] as const;

type RangeDays = (typeof RANGE_OPTIONS)[number]['value'];

export default function ProgressPage() {
  const navigate = useNavigate();
  const { stats, totalAccuracy, topicMastery } = useLearningStats();
  const {
    dueToday,
    pending,
    trulyMastered,
    items,
    wrongReasonStats,
    stats: wrongStats,
  } = useWrongBook();
  const [range, setRange] = useState<RangeDays>(30);

  const rows = useMemo(() => {
    return Object.entries(topicMastery)
      .filter(([, v]) => v.attempts > 0)
      .map(([key, v]) => ({ key, label: topicLabelOf(key), ...v }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [topicMastery]);

  const weak = rows.filter((r) => r.attempts >= 2).slice(0, 3);
  const totalAttempts = stats.totalAttempts;

  const streak = useMemo(() => computeStreakInfo(stats.dailyRecords), [stats.dailyRecords]);

  // 近 14 天对比：本周 vs 上周
  const week = useMemo(() => {
    const points = buildDailyTrend(stats.dailyRecords, 14);
    const sum = (arr: typeof points) => ({
      total: arr.reduce((s, p) => s + p.total, 0),
      correct: arr.reduce((s, p) => s + p.correct, 0),
      active: arr.filter((p) => p.total > 0).length,
    });
    return { thisWeek: sum(points.slice(-7)), lastWeek: sum(points.slice(0, 7)) };
  }, [stats.dailyRecords]);

  // 当前所选区间的汇总
  const rangeSummary = useMemo(() => {
    const points = buildDailyTrend(stats.dailyRecords, range);
    const total = points.reduce((s, p) => s + p.total, 0);
    const correct = points.reduce((s, p) => s + p.correct, 0);
    const active = points.filter((p) => p.total > 0).length;
    return {
      total,
      correct,
      active,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
    };
  }, [stats.dailyRecords, range]);

  const weekAccuracy = week.thisWeek.total > 0 ? week.thisWeek.correct / week.thisWeek.total : null;
  const lastWeekAccuracy = week.lastWeek.total > 0 ? week.lastWeek.correct / week.lastWeek.total : null;
  const accuracyDelta =
    weekAccuracy !== null && lastWeekAccuracy !== null
      ? Math.round((weekAccuracy - lastWeekAccuracy) * 100)
      : null;

  const masteredTopics = rows.filter((r) => r.attempts >= 3 && r.accuracy >= 0.8).length;
  const reviewAccuracy = Math.round(wrongStats.reviewAccuracy * 100);

  return (
    <PageShell
      title="学习报告"
      description="按知识点的正确率来自动判断该练什么；数据只存在本机，可在设置里导出备份"
      width="wide"
      back
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Flame className="size-4 text-orange-500" />}
            label="连续学习"
            value={streak.currentStreak + ' 天'}
            sub={`最长连续 ${streak.longestStreak} 天`}
          />
          <StatCard
            icon={<Target className="size-4 text-emerald-500" />}
            label="累计答题"
            value={String(totalAttempts)}
            sub={week.thisWeek.total > 0 ? `本周 +${week.thisWeek.total} 题` : '本周还没开始'}
          />
          <StatCard
            icon={<TrendingUp className="size-4 text-sky-500" />}
            label="总正确率"
            value={totalAttempts > 0 ? Math.round(totalAccuracy * 100) + '%' : '—'}
            sub={
              accuracyDelta === null ? (
                weekAccuracy !== null ? `本周 ${Math.round(weekAccuracy * 100)}%` : '暂无本周数据'
              ) : (
                <span className={accuracyDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                  较上周 {accuracyDelta >= 0 ? '+' : ''}
                  {accuracyDelta} 个百分点
                </span>
              )
            }
          />
          <StatCard
            icon={<AlertTriangle className="size-4 text-amber-500" />}
            label="错题（待复习 / 已掌握）"
            value={pending.length + ' / ' + trulyMastered.length}
            sub={dueToday.length > 0 ? `今日到期 ${dueToday.length} 道` : '今天没有到期错题'}
          />
        </div>

        {dueToday.length > 0 && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <span className="text-sm">
                今天有 <strong>{dueToday.length}</strong> 道错题到期，先复习再练新题效果更好
              </span>
              <Button size="sm" className="gap-1.5" onClick={() => navigate('/wrong-book')}>
                去复习 <ArrowRight className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 学习趋势 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="size-4 text-primary" />
                  学习趋势
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  柱状为每日答题量，折线为当日正确率
                </CardDescription>
              </div>
              <div className="flex rounded-lg border border-border/60 p-0.5" role="tablist" aria-label="趋势时间范围">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    role="tab"
                    aria-selected={range === opt.value}
                    onClick={() => setRange(opt.value)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs transition-colors',
                      range === opt.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {rangeSummary.total > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  答题 <strong className="text-foreground">{rangeSummary.total}</strong> 道
                </span>
                <span>
                  正确率{' '}
                  <strong className="text-foreground">{rangeSummary.accuracy ?? 0}%</strong>
                </span>
                <span>
                  活跃 <strong className="text-foreground">{rangeSummary.active}</strong> 天
                </span>
                <span>
                  日均{' '}
                  <strong className="text-foreground">{Math.round(rangeSummary.total / range)}</strong> 题
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-1">
            <LearningTrendChart dailyRecords={stats.dailyRecords} days={range} height={240} />
          </CardContent>
        </Card>

        {/* 错因分布 + 复习推进 */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="size-4 text-primary" />
                错因分布
              </CardTitle>
              <CardDescription className="text-xs">
                点图例可跳到错题本，只看该错因的题
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WrongReasonDonut
                counts={wrongReasonStats.counts}
                totalWithReason={wrongReasonStats.totalWithReason}
                onSelectReason={(reason) => navigate(`/wrong-book?reason=${reason}`)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <RefreshCw className="size-4 text-primary" />
                错题复习推进
              </CardTitle>
              <CardDescription className="text-xs">
                {wrongStats.totalReviews > 0
                  ? `已复习 ${wrongStats.totalReviews} 次，复习正确率 ${reviewAccuracy}%`
                  : '按艾宾浩斯 7 个阶段推进，答对两次才算掌握'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewStageChart items={items} />
            </CardContent>
          </Card>
        </div>

        {/* 知识点掌握度 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">各知识点掌握度</CardTitle>
            <CardDescription className="text-xs">
              {rows.length > 0
                ? `已练 ${rows.length} 个知识点，其中 ${masteredTopics} 个达到 80% 以上；按正确率升序，优先补弱项`
                : '还没有答题记录，先去练几道'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-sm text-muted-foreground">还没有答题记录，先去练几道</p>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate('/practice')}>
                  去练习 <ArrowRight className="size-3.5" />
                </Button>
              </div>
            ) : (
              rows.map((r) => {
                const pct = Math.round(r.accuracy * 100);
                return (
                  <div key={r.key} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 truncate text-sm text-foreground">{r.label}</span>
                    <div className="min-w-0 flex-1">
                      <Progress value={pct} className="h-2" />
                    </div>
                    <span
                      className={cn(
                        'w-24 shrink-0 text-right text-xs tabular-nums',
                        pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-rose-500',
                      )}
                    >
                      {pct}%（{r.correct}/{r.attempts}）
                    </span>
                    <Button size="sm" variant="ghost" className="shrink-0" onClick={() => navigate('/practice?topic=' + r.key)}>
                      练
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {weak.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">建议优先练</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weak.map((r) => (
                <div key={r.key} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground">
                      正确率 {Math.round(r.accuracy * 100)}%，做了 {r.attempts} 题
                    </p>
                  </div>
                  <Button size="sm" className="shrink-0 gap-1" onClick={() => navigate('/practice?topic=' + r.key)}>
                    去练 <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <HeatmapSection stats={stats} />
      </div>
    </PageShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="text-xl font-semibold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
