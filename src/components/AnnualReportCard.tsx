import { useState, useMemo } from 'react';
import {
  Award,
  Flame,
  Trophy,
  BookOpen,
  TrendingUp,
  CalendarRange,
  Sparkles,
  Download,
  Copy,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { computeAnnualReport, type StatsRecord } from '@/hooks/use-learning';
import { PRACTICE_TOPICS } from '@/lib/math-practice';
import { toast } from 'sonner';

interface AnnualReportCardProps {
  stats: StatsRecord;
  variant?: 'compact' | 'full';
}

export default function AnnualReportCard({ stats, variant = 'compact' }: AnnualReportCardProps) {
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => computeAnnualReport(stats.dailyRecords || {}, stats.topics || {}),
    [stats.dailyRecords, stats.topics],
  );

  const topicLabel = (key: string) => {
    const topic = PRACTICE_TOPICS.find((t) => t.key === key);
    return topic?.label || key;
  };

  const shareText = useMemo(() => {
    const range = report.dateRange;
    const lines = [
      `📊 我的数学年度报告（${range.start} ~ ${range.end}）`,
      ``,
      `📝 累计做题 ${report.totalQuestions} 道`,
      `✅ 总正确率 ${Math.round(report.accuracy * 100)}%`,
      `🔥 最长连续 ${report.longestStreak} 天`,
      `📅 坚持学习 ${report.activeDays} 天`,
      `🏆 已攻克 ${report.masteredTopics}/${report.totalTopics} 个专题`,
      report.hardestMonth ? `💪 最努力的月份：${report.hardestMonth.month}（${report.hardestMonth.count}题）` : '',
      report.favoriteTopic ? `❤️ 最爱专题：${topicLabel(report.favoriteTopic.key)}` : '',
      ``,
      `—— 来自 MathForge 数学工作台`,
    ].filter(Boolean);
    return lines.join('\n');
  }, [report]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success('分享文案已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败，请手动复制');
    }
  };

  const handleSaveImage = () => {
    // 简化版：复制文案为主要分享方式，图片保存用 print 提示
    toast.info('截图保存即可分享你的年度报告 📸');
  };

  if (variant === 'compact') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="bg-primary/5 border-primary/20 cursor-pointer hover:shadow-md transition-all overflow-hidden group">
            <CardContent className="py-4 px-5 flex items-center gap-4">
              <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  我的数学年度报告
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {report.totalQuestions > 0
                    ? `已坚持 ${report.activeDays} 天，做了 ${report.totalQuestions} 道题`
                    : '生成你的专属年度数学报告'}
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
          <ReportContent
            report={report}
            topicLabel={topicLabel}
            shareText={shareText}
            copied={copied}
            onCopy={handleCopy}
            onSave={handleSaveImage}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5 text-primary" />
              年度学习报告
            </CardTitle>
            <CardDescription className="mt-1">
              {report.dateRange.start} ~ {report.dateRange.end}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? '已复制' : '复制文案'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ReportStats report={report} topicLabel={topicLabel} />
      </CardContent>
    </Card>
  );
}

function ReportStats({
  report,
  topicLabel,
}: {
  report: ReturnType<typeof computeAnnualReport>;
  topicLabel: (key: string) => string;
}) {
  // 月度柱状图（用纯 CSS 实现）
  const maxMonthCount = Math.max(...report.monthlyBreakdown.map((m) => m.count), 1);

  return (
    <div className="space-y-5">
      {/* 顶部大数字 */}
      <div className="relative rounded-xl p-6 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-4 bottom-0 size-24 rounded-full bg-amber-300/20 blur-xl" />
        <div className="relative">
          <div className="text-xs opacity-80 flex items-center gap-1.5">
            <CalendarRange className="size-3.5" />
            近 365 天
          </div>
          <div className="text-4xl font-black mt-2 tabular-nums">
            {report.totalQuestions}
            <span className="text-base font-medium opacity-80 ml-2">道题</span>
          </div>
          <div className="text-sm opacity-90 mt-1">
            这是你过去一年里在数学上的全部付出 ✨
          </div>
        </div>
      </div>

      {/* 四宫格 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 bg-card border border-border/50">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-emerald-500" />
            总正确率
          </div>
          <div className="text-2xl font-black mt-1 tabular-nums">
            {Math.round(report.accuracy * 100)}
            <span className="text-xs font-medium text-muted-foreground ml-0.5">%</span>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border/50">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CalendarRange className="size-3.5 text-primary" />
            活跃天数
          </div>
          <div className="text-2xl font-black mt-1 tabular-nums">
            {report.activeDays}
            <span className="text-xs font-medium text-muted-foreground ml-0.5">天</span>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border/50">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Flame className="size-3.5 text-orange-500" />
            最长连续
          </div>
          <div className="text-2xl font-black mt-1 tabular-nums">
            {report.longestStreak}
            <span className="text-xs font-medium text-muted-foreground ml-0.5">天</span>
          </div>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border/50">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Trophy className="size-3.5 text-amber-500" />
            攻克专题
          </div>
          <div className="text-2xl font-black mt-1 tabular-nums">
            {report.masteredTopics}
            <span className="text-xs font-medium text-muted-foreground ml-0.5">
              / {report.totalTopics}
            </span>
          </div>
        </div>
      </div>

      {/* 月度分布柱状图 */}
      <div className="rounded-xl p-4 bg-card border border-border/50">
        <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          月度刷题节奏
        </div>
        <div className="flex items-end gap-1 h-24">
          {report.monthlyBreakdown.map((m) => {
            const h = m.count > 0 ? Math.max(4, (m.count / maxMonthCount) * 100) : 0;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary transition-all"
                  style={{ height: `${h}%` }}
                  title={`${m.label}: ${m.count} 题`}
                />
                <div className="text-xs text-muted-foreground -translate-y-0.5">
                  {m.month + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 亮点卡片 */}
      <div className="space-y-2">
        {report.hardestMonth && report.hardestMonth.count > 0 && (
          <div className="rounded-xl p-4 bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-700/40">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
              🔥 最努力的月份
            </div>
            <div className="text-lg font-bold text-amber-800 dark:text-amber-300">
              {report.hardestMonth.month}
              <span className="text-sm font-medium opacity-80 ml-2">
                共 {report.hardestMonth.count} 题
              </span>
            </div>
          </div>
        )}

        {report.favoriteTopic && (
          <div className="rounded-xl p-4 bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-200/50 dark:border-emerald-700/40">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
              ❤️ 最爱的专题
            </div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
              {topicLabel(report.favoriteTopic.key)}
              <span className="text-sm font-medium opacity-80 ml-2">
                练习 {report.favoriteTopic.count} 次
              </span>
            </div>
          </div>
        )}

        {report.totalQuestions === 0 && (
          <div className="rounded-xl p-6 bg-muted/30 border border-border/40 text-center">
            <Sparkles className="size-8 mx-auto text-muted-foreground/60 mb-2" />
            <div className="text-sm font-medium text-foreground">
              还没有足够数据生成报告
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              开始你的第一题，年度报告会越来越精彩
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 弹窗内完整报告（含分享按钮）
const ReportContent = (() => {
  interface ReportContentProps {
    report: ReturnType<typeof computeAnnualReport>;
    topicLabel: (key: string) => string;
    shareText: string;
    copied: boolean;
    onCopy: () => void;
    onSave: () => void;
  }

  const Component = ({ report, topicLabel, copied, onCopy, onSave }: ReportContentProps) => {
    return (
      <div className="p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Award className="size-5 text-primary" />
            我的数学年度报告
          </DialogTitle>
        </DialogHeader>
        <ReportStats report={report} topicLabel={topicLabel} />
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1 gap-1.5" onClick={onCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? '已复制' : '复制分享文案'}
          </Button>
          <Button variant="outline" className="flex-1 gap-1.5" onClick={onSave}>
            <Download className="size-4" />
            保存图片
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" size="icon" aria-label="关闭">
              <X className="size-4" />
            </Button>
          </DialogClose>
        </div>
      </div>
    );
  };
  return Component;
})();
