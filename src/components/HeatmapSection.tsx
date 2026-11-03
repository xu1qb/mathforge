import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateHeatmapData, type HeatmapDay } from '@/hooks/use-learning';
import type { StatsRecord } from '@/hooks/use-learning';
import { cn } from '@/lib/utils';

interface HeatmapSectionProps {
  stats: StatsRecord;
  className?: string;
}

const LEVEL_LABELS = ['0题', '1-5题', '6-15题', '16-30题', '30+题'];

export default function HeatmapSection({ stats, className }: HeatmapSectionProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);

  const heatmap = useMemo(() => generateHeatmapData(stats.dailyRecords || {}), [stats.dailyRecords]);

  // 按周组织：weeks[weekIndex][weekDay] = day
  const weeks = useMemo(() => {
    const w: (HeatmapDay | undefined)[][] = [];
    for (const day of heatmap.days) {
      if (!w[day.weekIndex]) w[day.weekIndex] = new Array(7).fill(undefined);
      w[day.weekIndex][day.weekDay] = day;
    }
    return w;
  }, [heatmap.days]);

  const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <>
      <style>{`
        .heatmap-cell.heatmap-level-0 {
          background-color: var(--muted);
          opacity: 0.5;
        }
        .heatmap-cell.heatmap-level-1 {
          background-color: hsl(from var(--primary) h calc(s * 0.8) calc(l * 1.5 / 1));
          background-color: color-mix(in hsl, var(--primary) 25%, var(--muted));
        }
        .heatmap-cell.heatmap-level-2 {
          background-color: color-mix(in hsl, var(--primary) 50%, var(--muted));
        }
        .heatmap-cell.heatmap-level-3 {
          background-color: color-mix(in hsl, var(--primary) 75%, var(--background));
        }
        .heatmap-cell.heatmap-level-4 {
          background-color: var(--primary);
        }
        [data-skin="night"] .heatmap-cell.heatmap-level-0 {
          background-color: var(--muted);
          opacity: 0.35;
        }
        [data-skin="pixel"] .heatmap-cell {
          border-radius: 0 !important;
        }
        [data-skin="journal"] .heatmap-cell {
          border-radius: 2px !important;
        }
      `}</style>
      <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="size-5 text-primary" />
              刷题热力图
            </CardTitle>
            <CardDescription className="mt-1">
              近 365 天 · 已坚持 {heatmap.activeDays} 天
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="mr-1">少</span>
            {[0, 1, 2, 3, 4].map((lv) => (
              <div
                key={lv}
                className={cn(
                  'size-3 rounded-[3px] heatmap-cell',
                  `heatmap-level-${lv}`,
                )}
                title={LEVEL_LABELS[lv]}
              />
            ))}
            <span className="ml-1">多</span>
          </div>
        </div>

        {/* 统计卡 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="bg-muted/40 rounded-xl p-3 border border-border/40">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              本月刷题
            </div>
            <div className="text-2xl font-black text-foreground mt-1 tabular-nums">
              {heatmap.monthTotal}
            </div>
          </div>
          <div className="bg-muted/40 rounded-xl p-3 border border-border/40">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Flame className="size-3.5 text-orange-500" />
              当前连续
            </div>
            <div className="text-2xl font-black text-foreground mt-1 tabular-nums">
              {heatmap.currentStreak}
              <span className="text-xs text-muted-foreground font-medium ml-1">天</span>
            </div>
          </div>
          <div className="bg-muted/40 rounded-xl p-3 border border-border/40">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Trophy className="size-3.5 text-amber-500" />
              最长连续
            </div>
            <div className="text-2xl font-black text-foreground mt-1 tabular-nums">
              {heatmap.longestStreak}
              <span className="text-xs text-muted-foreground font-medium ml-1">天</span>
            </div>
          </div>
          <div className="bg-muted/40 rounded-xl p-3 border border-border/40">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Target className="size-3.5 text-primary" />
              总正确率
            </div>
            <div className="text-2xl font-black text-foreground mt-1 tabular-nums">
              {heatmap.totalQuestions > 0
                ? Math.round((heatmap.totalCorrect / heatmap.totalQuestions) * 100)
                : 0}
              <span className="text-xs text-muted-foreground font-medium ml-1">%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 热力图容器（手机端横滑） */}
        <div className="relative">
          <div className="overflow-x-auto hide-scrollbar -mx-2 px-2 pb-2 heatmap-scroll">
            <div className="min-w-[750px]">
              {/* 月份标签 */}
              <div className="relative h-5 ml-8 mb-1">
                {heatmap.monthLabels.map((m) => (
                  <span
                    key={`${m.label}-${m.weekIndex}`}
                    className="absolute text-xs text-muted-foreground -translate-x-1"
                    style={{ left: `${m.weekIndex * 14 + 2}px` }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              <div className="flex gap-[2px]">
                {/* 周标签列 */}
                <div className="flex flex-col gap-[2px] w-7 shrink-0">
                  {weekdayLabels.map((label, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-3 flex items-center justify-center text-xs text-muted-foreground',
                        i % 2 === 1 ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* 格子列 */}
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[2px]">
                    {week.map((day, di) => {
                      if (!day)
                        return <div key={di} className="size-3 rounded-[3px] opacity-0" />;
                      const level = day.total === 0 ? 0 : day.level;
                      return (
                        <button
                          key={day.date}
                          className={cn(
                            'size-3 rounded-[3px] transition-all heatmap-cell',
                            `heatmap-level-${level}`,
                            day.total > 0 && 'hover:ring-2 hover:ring-primary/50 cursor-pointer',
                            selectedDay?.date === day.date && 'ring-2 ring-primary',
                          )}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          onClick={() => setSelectedDay(selectedDay?.date === day.date ? null : day)}
                          title={day.date}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* hover tooltip */}
          <AnimatePresence>
            {hoveredDay && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="pointer-events-none absolute top-0 right-0 bg-card border border-border/60 rounded-lg px-3 py-2 shadow-md text-xs z-10"
              >
                <div className="font-semibold text-foreground">{hoveredDay.date}</div>
                <div className="text-muted-foreground mt-0.5">
                  做了 <span className="font-bold text-foreground">{hoveredDay.total}</span> 题，
                  对了 <span className="font-bold text-emerald-600 dark:text-emerald-400">{hoveredDay.correct}</span> 题
                </div>
                {hoveredDay.total > 0 && (
                  <div className="text-muted-foreground mt-0.5">
                    正确率 {Math.round((hoveredDay.correct / hoveredDay.total) * 100)}%
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 选中日详情 */}
        <AnimatePresence>
          {selectedDay && selectedDay.total > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-foreground">{selectedDay.date} 做题明细</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      共 {selectedDay.total} 题，正确 {selectedDay.correct} 题
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    正确率 {Math.round((selectedDay.correct / selectedDay.total) * 100)}%
                  </Badge>
                </div>
                {selectedDay.topics && Object.keys(selectedDay.topics).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">专题分布</div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(selectedDay.topics)
                        .sort((a, b) => b[1] - a[1])
                        .map(([topic, count]) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}: {count}题
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
    </>
  );
}
