// EXPORTS: ProgressPage
// 学习报告：连续天数、正确率、热力图、按知识点掌握度与推荐练习

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import HeatmapSection from '@/components/HeatmapSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLearningStats, useWrongBook } from '@/hooks/use-learning';
import { topicLabelOf } from '@/lib/topic-label';
import { Flame, Target, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function ProgressPage() {
  const navigate = useNavigate();
  const { stats, totalAccuracy, topicMastery } = useLearningStats();
  const { dueToday, pending, trulyMastered } = useWrongBook();

  const rows = useMemo(() => {
    return Object.entries(topicMastery)
      .filter(([, v]) => v.attempts > 0)
      .map(([key, v]) => ({ key, label: topicLabelOf(key), ...v }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [topicMastery]);

  const weak = rows.filter((r) => r.attempts >= 2).slice(0, 3);
  const totalAttempts = stats.totalAttempts;

  return (
    <PageShell
      title="学习报告"
      description="按知识点的正确率来自动判断该练什么；数据只存在本机，可在设置里导出备份"
      width="wide"
      back
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Flame className="size-4 text-orange-500" />} label="连续学习" value={stats.streakDays + ' 天'} />
          <StatCard icon={<Target className="size-4 text-emerald-500" />} label="累计答题" value={String(totalAttempts)} />
          <StatCard
            icon={<TrendingUp className="size-4 text-sky-500" />}
            label="总正确率"
            value={totalAttempts > 0 ? Math.round(totalAccuracy * 100) + '%' : '—'}
          />
          <StatCard
            icon={<AlertTriangle className="size-4 text-amber-500" />}
            label="错题（待复习 / 已掌握）"
            value={pending.length + ' / ' + trulyMastered.length}
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">各知识点掌握度</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                还没有答题记录，先去练几道
              </p>
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
                        'w-24 shrink-0 text-right text-xs',
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="text-xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
