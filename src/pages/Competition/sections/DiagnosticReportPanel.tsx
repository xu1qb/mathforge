// 备考诊断报告面板
import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  CalendarDays,
  BookOpen,
  XCircle,
  Sparkles,
  BarChart3,
  Clock,
} from 'lucide-react';
import {
  generateDiagnosticReport,
  exportDiagnosticToMarkdown,
  type DiagnosticReport as DiagnosticReportType,
  type DiagnosticInputData,
} from '@/data/competition-mock';
import { toast } from 'sonner';

interface DiagnosticReportPanelProps {
  inputData: DiagnosticInputData;
  daysLeft: number;
}

// 八维雷达图（纯 SVG）
function RadarChart({ data }: { data: { topicName: string; score: number }[] }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 100;
  const levels = 5;
  const n = data.length;

  const pointAt = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 100) * maxR;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const labelAt = (index: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = maxR + 18;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const polygonPoints = data.map((d, i) => pointAt(i, d.score).join(',')).join(' ');

  return (
    <div className="relative flex justify-center items-center py-2">
      <svg width={size} height={size} className="overflow-visible">
        {/* 背景网格 */}
        {Array.from({ length: levels }).map((_, li) => {
          const r = ((li + 1) / levels) * maxR;
          const pts = data
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            })
            .join(' ');
          return (
            <polygon
              key={li}
              points={pts}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={1}
              opacity={0.6}
            />
          );
        })}
        {/* 轴线 */}
        {data.map((_, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + maxR * Math.cos(angle)}
              y2={cy + maxR * Math.sin(angle)}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              opacity={0.6}
            />
          );
        })}
        {/* 数据区域 */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          points={polygonPoints}
          fill="hsl(var(--primary) / 0.25)"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />
        {/* 数据点 */}
        {data.map((d, i) => {
          const [x, y] = pointAt(i, d.score);
          return (
            <motion.circle
              key={d.topicName}
              initial={{ opacity: 0, r: 0 }}
              animate={{ opacity: 1, r: 3.5 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
              cx={x}
              cy={y}
              fill="hsl(var(--primary))"
            />
          );
        })}
        {/* 标签 */}
        {data.map((d, i) => {
          const [x, y] = labelAt(i);
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const isLeft = Math.cos(angle) < -0.1;
          const isRight = Math.cos(angle) > 0.1;
          return (
            <text
              key={d.topicName}
              x={x}
              y={y}
              textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
              dominantBaseline="middle"
              className="fill-muted-foreground text-xs font-medium"
            >
              {d.topicName}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function DiagnosticReportPanel({ inputData, daysLeft }: DiagnosticReportPanelProps) {
  const [report, setReport] = useState<DiagnosticReportType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    // 模拟生成过程
    setTimeout(() => {
      const r = generateDiagnosticReport(inputData);
      setReport(r);
      setIsGenerating(false);
      toast.success('诊断报告已生成');
    }, 600);
  }, [inputData]);

  const handleExport = useCallback(() => {
    if (!report) return;
    const md = exportDiagnosticToMarkdown(report);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `备考诊断报告_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('报告已导出');
  }, [report]);

  const hasData =
    inputData.practiceStats.totalAnswered > 0 || inputData.mockExamHistory.length > 0;

  return (
    <Card className="border-border/60 bg-gradient-to-br from-teal-50/40 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          备考诊断报告
          <Badge variant="outline" className="ml-auto text-xs bg-background">
            一键生成
          </Badge>
        </CardTitle>
        <CardDescription>综合学习数据，生成个性化备考分析与建议</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!report && !isGenerating && (
          <div className="text-center py-6">
            <div className="size-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="size-8 text-primary" />
            </div>
            <div className="text-sm font-medium text-foreground mb-1">
              {hasData ? '基于你的学习数据生成诊断报告' : '先练习一些题目吧'}
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              {hasData
                ? '包含八维能力雷达、强弱项分析、剩余天数建议'
                : '完成练习或模拟考后可生成个性化诊断'}
            </div>
            <Button
              onClick={handleGenerate}
              className="bg-primary hover:bg-primary/90"
              disabled={!hasData}
            >
              <Sparkles className="size-4 mr-1.5" />
              生成诊断报告
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-10">
            <div className="size-12 mx-auto mb-3 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <div className="text-sm text-muted-foreground">正在分析学习数据...</div>
          </div>
        )}

        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              {/* 数据汇总 */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> 数据汇总
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard icon={<BookOpen className="size-4" />} label="练习总数" value={report.totalQuestions} />
                  <StatCard icon={<Target className="size-4" />} label="正确率" value={`${report.totalCorrectRate}%`} />
                  <StatCard icon={<FileText className="size-4" />} label="模拟卷" value={report.mockExamCount} />
                  <StatCard icon={<TrendingUp className="size-4" />} label="平均分" value={report.mockExamAvgScore} />
                  <StatCard icon={<CalendarDays className="size-4" />} label="打卡天数" value={report.dailyStreak} />
                  <StatCard icon={<XCircle className="size-4" />} label="错题数" value={report.wrongBookCount} />
                </div>
              </div>

              {/* 八维雷达图 */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" /> 八维能力雷达
                </h4>
                <RadarChart data={report.topicMastery} />
              </div>

              {/* 强弱项 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-900/15">
                  <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mb-2">
                    <TrendingUp className="size-3.5" /> 最强项
                  </div>
                  {report.strongest.map((s) => (
                    <div key={s.topicKey} className="flex items-center justify-between py-0.5">
                      <span className="text-sm text-foreground">{s.topicName}</span>
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">{s.score}分</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg border border-rose-200/60 dark:border-rose-800/40 bg-rose-50/40 dark:bg-rose-900/15">
                  <div className="text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-1 mb-2">
                    <TrendingDown className="size-3.5" /> 待加强
                  </div>
                  {report.weakest.map((w) => (
                    <div key={w.topicKey} className="flex items-center justify-between py-0.5">
                      <span className="text-sm text-foreground">{w.topicName}</span>
                      <span className="text-sm font-semibold text-rose-700 dark:text-rose-300 tabular-nums">{w.score}分</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 剩余天数建议（考试结束后改为长期学习建议） */}
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <div className="text-xs font-medium text-primary flex items-center gap-1 mb-1.5">
                  <Clock className="size-3.5" />
                  {daysLeft > 0 ? `剩余 ${daysLeft} 天备考建议` : '长期学习建议'}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {report.remainingDaysAdvice}
                </p>
              </div>

              {/* 风险预警 */}
              {report.warnings.length > 0 && (
                <div className="p-3 rounded-lg border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-900/15">
                  <div className="text-xs font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1 mb-2">
                    <AlertTriangle className="size-3.5" /> 风险预警
                  </div>
                  <ul className="space-y-1">
                    {report.warnings.map((w, i) => (
                      <li key={i} className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                        <span className="mt-1 size-1.5 rounded-full bg-amber-500 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      {report && (
        <CardFooter className="pt-0 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleGenerate}>
            重新生成
          </Button>
          <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={handleExport}>
            <Download className="size-4 mr-1.5" />
            导出 Markdown
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="p-2.5 rounded-lg border border-border/50 bg-card/60">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-bold text-foreground tabular-nums">{value}</div>
    </div>
  );
}

export default memo(DiagnosticReportPanel);
