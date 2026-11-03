import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Target,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WeeklyReportData } from '@/data/competition-weekly';

interface WeeklyReportCardProps {
  report: WeeklyReportData;
  onStartPractice?: () => void;
}

export default function WeeklyReportCard({ report, onStartPractice }: WeeklyReportCardProps) {
  const accuracyPct = useMemo(() => Math.round(report.thisWeekAccuracy * 100), [report.thisWeekAccuracy]);
  const deltaPct = useMemo(() => Math.round(report.accuracyDelta * 100), [report.accuracyDelta]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="border-border/60 bg-gradient-to-br from-primary/5 via-background to-teal-50/30 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-5 text-primary" />
            学习周报
            <Badge variant="outline" className="ml-auto text-xs bg-muted/60">
              近 7 天
            </Badge>
          </CardTitle>
          <CardDescription>自动统计你的学习数据，给出针对性建议</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!report.hasData ? (
            <div className="py-6 text-center space-y-3">
              <div className="size-14 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Calendar className="size-7 text-muted-foreground" />
              </div>
              <div className="text-sm text-foreground font-medium">暂无学习数据</div>
              <div className="text-xs text-muted-foreground max-w-xs mx-auto">
                开始练习后，这里会自动生成本周学习报告，帮你了解自己的进步和薄弱点
              </div>
              {onStartPractice && (
                <Button
                  className="mt-2 bg-primary hover:bg-primary/90"
                  onClick={onStartPractice}
                >
                  <BookOpen className="size-4 mr-1.5" />
                  开始第一次练习
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* 练习量三指标 */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon={<BookOpen className="size-4" />}
                  label="练习题数"
                  value={report.practiceCount}
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                />
                <StatCard
                  icon={<Calendar className="size-4" />}
                  label="每日一练"
                  value={`${report.dailyCompletedDays} 天`}
                  color="text-sky-600"
                  bg="bg-sky-50"
                />
                <StatCard
                  icon={<FileText className="size-4" />}
                  label="模拟卷"
                  value={`${report.mockExamCount} 套`}
                  color="text-amber-600"
                  bg="bg-amber-50"
                />
              </div>

              {/* 正确率变化 */}
              <div className="p-3 rounded-lg bg-card/60 border border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">本周正确率</span>
                  <span className="text-xs text-muted-foreground">
                    {report.lastWeekAccuracy > 0 ? `上周 ${Math.round(report.lastWeekAccuracy * 100)}%` : '无上周数据'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums text-foreground">
                    {accuracyPct}%
                  </span>
                  {report.lastWeekAccuracy > 0 && (
                    <span
                      className={`text-xs flex items-center gap-0.5 font-medium ${
                        deltaPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {deltaPct >= 0 ? (
                        <TrendingUp className="size-3" />
                      ) : (
                        <TrendingDown className="size-3" />
                      )}
                      {deltaPct >= 0 ? '+' : ''}
                      {deltaPct}%
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-teal-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, accuracyPct)}%` }}
                  />
                </div>
              </div>

               {/* 真题正确率（如有） */}
               {report.realExamTotal > 0 && (
                 <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-xs font-medium text-foreground flex items-center gap-1">
                       <Trophy className="size-3.5 text-amber-600" />
                       真题正确率
                     </span>
                     <span className="text-xs text-muted-foreground">
                       已做 {report.realExamTotal} 套
                     </span>
                   </div>
                   <div className="flex items-baseline gap-2">
                     <span className="text-2xl font-bold tabular-nums text-amber-700">
                       {Math.round(report.realExamAccuracy * 100)}%
                     </span>
                     <span className="text-xs text-muted-foreground">
                       最高分 {Math.round(report.realExamBestScore)} 分
                     </span>
                   </div>
                   <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                     <div
                       className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                       style={{ width: `${Math.min(100, Math.round(report.realExamAccuracy * 100))}%` }}
                     />
                   </div>
                 </div>
               )}

               {/* 薄弱专题 */}
              {report.weakTopics.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Target className="size-3.5 text-rose-500" />
                    薄弱专题（需加强）
                  </div>
                  <div className="space-y-2">
                    {report.weakTopics.map((t, i) => (
                      <div
                        key={t.topicKey}
                        className="flex items-center gap-2 text-sm p-2 rounded-md bg-rose-50/50 border border-rose-100/60"
                      >
                        <span className="text-xs text-rose-600 font-mono w-4">#{i + 1}</span>
                        <span className="flex-1 min-w-0 truncate">{t.topicTitle}</span>
                        <span className="text-xs font-mono tabular-nums text-rose-700">
                          {Math.round(t.correctRate * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 下周建议 */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-amber-500" />
                  下周建议
                </div>
                <ul className="space-y-1.5">
                  {report.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary shrink-0">•</span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`p-3 rounded-lg ${bg} border border-border/60`}>
      <div className={`${color} mb-1`}>{icon}</div>
      <div className="text-lg font-bold text-foreground tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
