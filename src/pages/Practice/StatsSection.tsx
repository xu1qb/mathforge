import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Target,
  Calendar,
  TrendingUp,
  Trophy,
  BookOpen,
  Award,
  Eye,
  AlertTriangle,
  GitBranch,
} from 'lucide-react';
import { useLearningStats } from '@/hooks/use-learning';
import { useMastery } from '@/hooks/use-mastery';
import { PRACTICE_TOPICS } from '@/lib/math-practice';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import HeatmapSection from '@/components/HeatmapSection';
import AnnualReportCard from '@/components/AnnualReportCard';
import MonsterCollection from '@/components/MonsterCollection';

// 掌握母题数统计卡
function MasteryStatsCard() {
  const { trulyMasteredCount, guessedCount, totalCount } = useMastery();
  return (
    <Card>
      <CardContent className="py-4 px-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <GitBranch className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs text-muted-foreground">掌握母题</span>
        </div>
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {trulyMasteredCount}
          <span className="text-sm font-normal text-muted-foreground ml-1">/ {totalCount}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          母题+2变式=掌握
        </div>
        {guessedCount > 0 && (
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-2 pt-2 border-t border-border flex items-center gap-1">
            <span className="inline-block size-1.5 rounded-full bg-orange-500" />
            蒙对待验证 {guessedCount} 道
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 专题分类（与 PracticePage 保持一致）
const TOPIC_CATEGORIES = [
  { key: 'algebra', label: '代数' },
  { key: 'geometry', label: '几何' },
  { key: 'trigonometry', label: '三角函数' },
  { key: 'analysis', label: '数学分析' },
  { key: 'equations', label: '微分方程' },
  { key: 'probability', label: '概率统计' },
  { key: 'number-theory', label: '数论' },
];

export default function StatsSection() {
  const { stats, totalAccuracy, topicMastery } = useLearningStats();

  // 知识点掌握度排序（按答题数降序）
  const sortedTopics = useMemo(() => {
    return PRACTICE_TOPICS
      .map((topic) => ({
        ...topic,
        data: topicMastery[topic.key] || { attempts: 0, correct: 0, accuracy: 0 },
      }))
      .sort((a, b) => b.data.attempts - a.data.attempts);
  }, [topicMastery]);

  const masteredTopics = sortedTopics.filter((t) => t.data.attempts >= 3 && t.data.accuracy >= 0.8).length;
  const practicedTopics = sortedTopics.filter((t) => t.data.attempts > 0).length;

  // 趋势图数据（简单 SVG 折线）
  const trendData = stats.recentSessions;
  const maxTrendPoints = 10;
  const chartWidth = 600;
  const chartHeight = 140;
  const padding = { top: 20, right: 10, bottom: 24, left: 30 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const trendPoints = trendData.slice(-maxTrendPoints);
  const hasTrend = trendPoints.length >= 2;

  const pathD = useMemo(() => {
    if (!hasTrend) return '';
    const n = trendPoints.length;
    const stepX = n > 1 ? innerW / (n - 1) : 0;
    return trendPoints
      .map((s, i) => {
        const x = padding.left + i * stepX;
        const acc = s.total > 0 ? s.correct / s.total : 0;
        const y = padding.top + innerH * (1 - acc);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [trendPoints, hasTrend, innerW, innerH, padding.left, padding.top]);

  const areaD = useMemo(() => {
    if (!hasTrend) return '';
    const n = trendPoints.length;
    const stepX = n > 1 ? innerW / (n - 1) : 0;
    const firstX = padding.left;
    const lastX = padding.left + (n - 1) * stepX;
    const bottomY = padding.top + innerH;
    return `${pathD} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  }, [trendPoints, hasTrend, pathD, innerW, innerH, padding.left, padding.top]);

  // 限时挑战最高分
  const challengeRecords = useMemo(() => {
    return Object.entries(stats.challengeBest)
      .map(([key, val]) => {
        const topic = PRACTICE_TOPICS.find((t) => t.key === key);
        return { key, label: topic?.label || key, score: val.score, time: val.time };
      })
      .sort((a, b) => b.score - a.score);
  }, [stats.challengeBest]);

  return (
    <div className="space-y-4">
      {/* 总览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Target className="size-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-muted-foreground">累计答题</span>
            </div>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {stats.totalAttempts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-muted-foreground">总正确率</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {Math.round(totalAccuracy * 100)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Calendar className="size-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs text-muted-foreground">连续学习</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {stats.streakDays}
              <span className="text-sm font-normal text-muted-foreground ml-1">天</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                <Eye className="size-4 text-sky-600 dark:text-sky-400" />
              </div>
              <span className="text-xs text-muted-foreground">自评答题</span>
            </div>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">
              {stats.selfEval.totalAttempts}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              正确率 {stats.selfEval.totalAttempts > 0 ? Math.round((stats.selfEval.totalCorrect / stats.selfEval.totalAttempts) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <Award className="size-4 text-primary dark:text-primary/90" />
              </div>
              <span className="text-xs text-muted-foreground">掌握知识点</span>
            </div>
            <div className="text-2xl font-bold text-primary dark:text-primary/90 tabular-nums">
              {masteredTopics}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ {practicedTopics}</span>
            </div>
          </CardContent>
        </Card>

        <MasteryStatsCard />
      </div>

      {/* 趋势图 + 挑战最高分 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="size-4 text-blue-500" />
              最近趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasTrend ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                暂无练习记录，完成刷题后查看趋势图
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[400px] h-auto">
                  {/* 网格线 */}
                  {[0, 0.25, 0.5, 0.75, 1].map((val) => {
                    const y = padding.top + innerH * (1 - val);
                    return (
                      <g key={val}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={chartWidth - padding.right}
                          y2={y}
                          stroke="hsl(var(--border))"
                          strokeWidth={1}
                          strokeDasharray="3 3"
                        />
                        <text
                          x={padding.left - 6}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-muted-foreground text-xs"
                        >
                          {Math.round(val * 100)}%
                        </text>
                      </g>
                    );
                  })}

                  {/* 面积 */}
                  {areaD && (
                    <path d={areaD} fill="url(#trendGradient)" opacity={0.3} />
                  )}
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  {/* 折线 */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* 数据点 */}
                  {trendPoints.map((s, i) => {
                    const n = trendPoints.length;
                    const stepX = n > 1 ? innerW / (n - 1) : 0;
                    const x = padding.left + i * stepX;
                    const acc = s.total > 0 ? s.correct / s.total : 0;
                    const y = padding.top + innerH * (1 - acc);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r={4} fill="hsl(var(--primary))" />
                        <text
                          x={x}
                          y={chartHeight - 6}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[9px]"
                        >
                          {format(s.date, 'MM/dd')}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Trophy className="size-4 text-amber-500" />
              挑战最高分
            </CardTitle>
          </CardHeader>
          <CardContent>
            {challengeRecords.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                暂无挑战记录
              </div>
            ) : (
              <div className="space-y-2">
                {challengeRecords.slice(0, 8).map((r, i) => (
                  <div
                    key={r.key}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-md',
                      i === 0
                        ? 'bg-amber-50 dark:bg-amber-900/20'
                        : 'bg-muted/30',
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        'size-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                        i === 0
                          ? 'bg-amber-400 text-amber-900'
                          : i === 1
                          ? 'bg-muted text-foreground'
                          : i === 2
                          ? 'bg-orange-300 text-orange-800'
                          : 'bg-muted text-muted-foreground',
                      )}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium truncate">{r.label}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {r.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 薄弱模块热力图 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="size-4 text-rose-500" />
            薄弱模块热力图
            <span className="text-xs font-normal text-muted-foreground ml-2">
              正确率越低，颜色越红
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            基于各专题答题数据，快速定位薄弱环节
          </CardDescription>
        </CardHeader>
        <CardContent>
          {practicedTopics === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              开始练习后即可查看薄弱模块分布
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {TOPIC_CATEGORIES.map((cat) => {
                const catTopics = PRACTICE_TOPICS.filter((t) => t.category === cat.key);
                let totalAttempts = 0;
                let totalCorrect = 0;
                let totalHintDep = 0;
                for (const t of catTopics) {
                  const d = topicMastery[t.key];
                  if (d) {
                    totalAttempts += d.attempts;
                    totalCorrect += d.correct;
                    totalHintDep += d.hintDependedCount ?? 0;
                  }
                }
                const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : null;
                const accuracyPct = accuracy !== null ? Math.round(accuracy * 100) : null;
                
                // 颜色分级：未练习→灰；≥70%→绿；40-70%→黄；<40%→红
                let colorClass = 'bg-muted text-muted-foreground';
                if (accuracy !== null) {
                  if (accuracy >= 0.7) {
                    colorClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
                  } else if (accuracy >= 0.4) {
                    colorClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
                  } else {
                    colorClass = 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
                  }
                }

                return (
                  <div
                    key={cat.key}
                    className={cn(
                      'rounded-xl p-3 text-center transition-all',
                      'hover:scale-105 cursor-default',
                      colorClass,
                    )}
                    title={accuracy !== null ? `正确率 ${accuracyPct}%（${totalCorrect}/${totalAttempts}题）${totalHintDep > 0 ? `，提示依赖 ${totalHintDep} 次` : ''}` : '暂无练习'}
                  >
                    <div className="text-xs font-medium mb-1.5 truncate">{cat.label}</div>
                    <div className="text-2xl font-bold tabular-nums">
                      {accuracy !== null ? `${accuracyPct}%` : '—'}
                    </div>
                    {accuracy !== null && (
                      <div className="text-xs opacity-70 mt-0.5">
                        {totalAttempts} 题
                        {totalHintDep > 0 && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                            💡 {totalHintDep}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 热力图 */}
      <HeatmapSection stats={stats} />

      {/* 年度报告 */}
      <AnnualReportCard stats={stats} variant="full" />

      {/* 知识点掌握度 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="size-4 text-emerald-500" />
            知识点掌握度
          </CardTitle>
        </CardHeader>
        <CardContent>
          {practicedTopics === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              开始练习后即可查看各知识点掌握情况
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {sortedTopics.filter((t) => t.data.attempts > 0).map((topic) => {
                const { attempts, correct, accuracy } = topic.data;
                const accuracyPct = Math.round(accuracy * 100);
                const mastered = attempts >= 3 && accuracy >= 0.8;
                return (
                  <div key={topic.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground truncate">{topic.label}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {correct}/{attempts} · {accuracyPct}%
                        {mastered && (
                          <span className="ml-2 text-emerald-500">
                            <Award className="size-3 inline -mt-0.5" /> 已掌握
                          </span>
                        )}
                      </span>
                    </div>
                    <Progress
                      value={accuracyPct}
                      className={cn(
                        'h-2',
                        mastered
                          ? '[&>div]:bg-emerald-500'
                          : accuracy >= 0.6
                          ? '[&>div]:bg-blue-500'
                          : '[&>div]:bg-rose-400',
                      )}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 怪物图鉴 */}
      <MonsterCollection />
    </div>
  );
}
