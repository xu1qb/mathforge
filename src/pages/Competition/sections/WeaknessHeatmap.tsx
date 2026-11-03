import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { COMPETITION_TOPICS } from '@/data/competition';
import type { TopicStat } from '@/data/competition-dashboard';
import {
  KNOWLEDGE_CARDS,
  type MasteryMap,
} from '@/data/competition-knowledge';
import { cn } from '@/lib/utils';

interface HeatmapItem {
  topicKey: string;
  topicTitle: string;
  riskScore: number; // 0-100，越高越危险
  accuracy: number | null; // 正确率 0-1，null 表示无做题数据
  accuracyPct: string;
  notLearnedCount: number; // 不会的卡片数
  totalCards: number; // 该专题总卡片数
  hasPracticeData: boolean;
}

interface WeaknessHeatmapProps {
  topicDistribution: TopicStat[];
  masteryMap: MasteryMap;
  onGoTopic: (topicKey: string) => void;
}

function getRiskColor(score: number): string {
  // 绿色（安全）→ 黄色 → 红色（危险）
  if (score >= 75) return 'bg-rose-500/90'; // 危险
  if (score >= 55) return 'bg-amber-500/90'; // 中等
  if (score >= 35) return 'bg-lime-500/80'; // 一般
  return 'bg-emerald-500/80'; // 安全
}

function getRiskTextColor(score: number): string {
  if (score >= 75) return 'text-rose-700 dark:text-rose-400';
  if (score >= 55) return 'text-amber-700 dark:text-amber-400';
  if (score >= 35) return 'text-lime-700 dark:text-lime-400';
  return 'text-emerald-700 dark:text-emerald-400';
}

function getRiskLabel(score: number): string {
  if (score >= 75) return '高危';
  if (score >= 55) return '预警';
  if (score >= 35) return '一般';
  return '安全';
}

export default function WeaknessHeatmap({
  topicDistribution,
  masteryMap,
  onGoTopic,
}: WeaknessHeatmapProps) {
  const heatmapData = useMemo<HeatmapItem[]>(() => {
    const statMap = new Map(topicDistribution.map((t) => [t.topicKey, t]));
    const categoryToTopicKey = new Map<string, string>([
      ['极限', 'limit'],
      ['一元微分', 'differential'],
      ['一元积分', 'integral'],
      ['多元微分', 'multivariable'],
      ['多元积分', 'multiple-integral'],
      ['级数', 'series'],
      ['常微分方程', 'ode'],
      ['解析几何', 'analytic-geometry'],
    ]);

    const cardByTopic = new Map<string, { notLearned: number; total: number }>();
    for (const card of KNOWLEDGE_CARDS) {
      const topicKey = categoryToTopicKey.get(card.category) ?? 'limit';
      if (!cardByTopic.has(topicKey)) {
        cardByTopic.set(topicKey, { notLearned: 0, total: 0 });
      }
      const entry = cardByTopic.get(topicKey)!;
      entry.total++;
      const level = (masteryMap[card.id] ?? 'not-learned') as unknown as string;
      if (level === 'not-learned') entry.notLearned++;
    }

    const items: HeatmapItem[] = COMPETITION_TOPICS.map((topic) => {
      const stat = statMap.get(topic.key);
      const cardInfo = cardByTopic.get(topic.key) ?? { notLearned: 0, total: 0 };
      const hasPracticeData = !!stat && stat.questions >= 3;
      const accuracy = hasPracticeData ? stat!.accuracy : null;
      const accuracyRisk = hasPracticeData ? (1 - (accuracy ?? 0)) * 100 : 50;
      const masteryRisk = cardInfo.total > 0 ? (cardInfo.notLearned / cardInfo.total) * 100 : 50;
      let riskScore = Math.round(accuracyRisk * 0.6 + masteryRisk * 0.4);
      if (stat && stat.questions > 0 && stat.questions < 3) {
        riskScore = Math.min(100, Math.round(riskScore * 1.1));
      }
      return {
        topicKey: topic.key,
        topicTitle: topic.title,
        riskScore,
        accuracy,
        accuracyPct: accuracy !== null ? `${(accuracy * 100).toFixed(0)}%` : '—',
        notLearnedCount: cardInfo.notLearned,
        totalCards: cardInfo.total,
        hasPracticeData,
      };
    });

    return items.sort((a, b) => b.riskScore - a.riskScore);
  }, [topicDistribution, masteryMap]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              薄弱模块热力图
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              综合正确率（60%）+ 知识卡片掌握度（40%），风险越高越靠前
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-rose-500/90" />
              <span className="text-muted-foreground">高危</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500/90" />
              <span className="text-muted-foreground">预警</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-lime-500/80" />
              <span className="text-muted-foreground">一般</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500/80" />
              <span className="text-muted-foreground">安全</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 色块网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {heatmapData.map((item) => (
            <button
              key={item.topicKey}
              onClick={() => onGoTopic(item.topicKey)}
              className="group text-left rounded-xl p-4 border border-border/60 hover:border-primary/50 transition-all hover:shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {item.topicTitle}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'ml-2 shrink-0 text-xs',
                    item.riskScore >= 75
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/40'
                      : item.riskScore >= 55
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40'
                        : item.riskScore >= 35
                          ? 'bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-900/20 dark:text-lime-400 dark:border-lime-800/40'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40',
                  )}
                >
                  {getRiskLabel(item.riskScore)}
                </Badge>
              </div>

              {/* 风险条 */}
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-3">
                <div
                  className={cn('h-full rounded-full transition-all', getRiskColor(item.riskScore))}
                  style={{ width: `${item.riskScore}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">正确率</div>
                  <div className={cn('font-mono font-medium', item.hasPracticeData ? 'text-foreground' : 'text-muted-foreground')}>
                    {item.accuracyPct}
                    {!item.hasPracticeData && (
                      <span className="block text-xs text-muted-foreground">缺做题数据</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">不会卡片</div>
                  <div className="font-mono font-medium text-foreground">
                    {item.notLearnedCount}
                    <span className="text-muted-foreground text-xs">/{item.totalCards}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={cn('font-semibold', getRiskTextColor(item.riskScore))}>
                  风险分 {item.riskScore}
                </span>
                <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  去练 <ArrowRight className="size-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 首页用的精简版：Top3
export function WeaknessTop3({
  topicDistribution,
  masteryMap,
  onGoTopic,
}: WeaknessHeatmapProps) {
  const heatmapData = useMemo<HeatmapItem[]>(() => {
    const statMap = new Map(topicDistribution.map((t) => [t.topicKey, t]));
    const categoryToTopicKey = new Map<string, string>([
      ['极限', 'limit'],
      ['一元微分', 'differential'],
      ['一元积分', 'integral'],
      ['多元微分', 'multivariable'],
      ['多元积分', 'multiple-integral'],
      ['级数', 'series'],
      ['常微分方程', 'ode'],
      ['解析几何', 'analytic-geometry'],
    ]);

    const cardByTopic = new Map<string, { notLearned: number; total: number }>();
    for (const card of KNOWLEDGE_CARDS) {
      const topicKey = categoryToTopicKey.get(card.category) ?? 'limit';
      if (!cardByTopic.has(topicKey)) {
        cardByTopic.set(topicKey, { notLearned: 0, total: 0 });
      }
      const entry = cardByTopic.get(topicKey)!;
      entry.total++;
      const level = (masteryMap[card.id] ?? 'not-learned') as unknown as string;
      if (level === 'not-learned') entry.notLearned++;
    }

    const items: HeatmapItem[] = COMPETITION_TOPICS.map((topic) => {
      const stat = statMap.get(topic.key);
      const cardInfo = cardByTopic.get(topic.key) ?? { notLearned: 0, total: 0 };
      const hasPracticeData = !!stat && stat.questions >= 3;
      const accuracy = hasPracticeData ? stat!.accuracy : null;
      const accuracyRisk = hasPracticeData ? (1 - (accuracy ?? 0)) * 100 : 50;
      const masteryRisk = cardInfo.total > 0 ? (cardInfo.notLearned / cardInfo.total) * 100 : 50;
      const riskScore = Math.round(accuracyRisk * 0.6 + masteryRisk * 0.4);
      return {
        topicKey: topic.key,
        topicTitle: topic.title,
        riskScore,
        accuracy,
        accuracyPct: accuracy !== null ? `${(accuracy * 100).toFixed(0)}%` : '—',
        notLearnedCount: cardInfo.notLearned,
        totalCards: cardInfo.total,
        hasPracticeData,
      };
    });

    return items.sort((a, b) => b.riskScore - a.riskScore);
  }, [topicDistribution, masteryMap]);

  const top3 = heatmapData.slice(0, 3);

  return (
    <div className="space-y-2">
      {top3.map((item, i) => (
        <div
          key={item.topicKey}
          className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50"
        >
          <div className={cn(
            'size-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0',
            i === 0 ? 'bg-rose-500' : i === 1 ? 'bg-amber-500' : 'bg-lime-500',
          )}>
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {item.topicTitle}
            </div>
            <div className="text-xs text-muted-foreground">
              正确率 {item.accuracyPct} · 不会 {item.notLearnedCount} 卡
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onGoTopic(item.topicKey)}>
            去练 <ArrowRight className="size-3 ml-1" />
          </Button>
        </div>
      ))}
    </div>
  );
}
