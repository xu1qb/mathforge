// EXPORTS: HotPointsPanel
// 真题考点热力榜（基于已入库真题统计）

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Flame, BookOpen, ChevronRight, Target, Star, Lightbulb, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  REAL_EXAM_HOT_POINTS,
  type RealExamHotPoint,
} from '@/data/competition-real-exams';
import {
  KNOWLEDGE_CARDS,
  type MasteryMap,
} from '@/data/competition-knowledge';

interface HotPointsPanelProps {
  masteryMap: MasteryMap;
  onGoPractice?: (topicKey: string) => void;
  onGoKnowledge?: (cardId: string) => void;
}

// 颜色分级（低→高：绿→黄→红）
const getHeatColor = (count: number, max: number) => {
  const ratio = count / max;
  if (ratio >= 0.8) return 'bg-rose-500';
  if (ratio >= 0.6) return 'bg-orange-500';
  if (ratio >= 0.4) return 'bg-amber-500';
  if (ratio >= 0.2) return 'bg-lime-500';
  return 'bg-emerald-500';
};

const getHeatTextColor = (count: number, max: number) => {
  const ratio = count / max;
  if (ratio >= 0.8) return 'text-rose-600 dark:text-rose-400';
  if (ratio >= 0.6) return 'text-orange-600 dark:text-orange-400';
  if (ratio >= 0.4) return 'text-amber-600 dark:text-amber-400';
  if (ratio >= 0.2) return 'text-lime-600 dark:text-lime-400';
  return 'text-emerald-600 dark:text-emerald-400';
};

const TOPIC_LABELS: Record<string, string> = {
  'limit-continuity': '极限',
  'single-var-diff': '一元微分',
  'single-var-int': '一元积分',
  'multi-var-diff': '多元微分',
  'multi-var-int': '多元积分',
  'infinite-series': '级数',
  'ode': 'ODE',
  'space-geo': '解析几何',
};

export default function HotPointsPanel({ masteryMap, onGoPractice, onGoKnowledge }: HotPointsPanelProps) {
  const [selectedHot, setSelectedHot] = useState<RealExamHotPoint | null>(null);

  // 按出现次数排序（appearedSessions.length + importance 加权）
  const sortedHotPoints = useMemo(() => {
    return [...REAL_EXAM_HOT_POINTS]
      .map((hp) => ({
        ...hp,
        frequency: hp.appearedSessions.length + hp.importance * 0.3,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 15);
  }, []);

  const maxFreq = useMemo(() => {
    return Math.max(...sortedHotPoints.map((h) => h.frequency));
  }, [sortedHotPoints]);

  // 检查某个考点对应的知识卡片是否有"不会"的
  const hasNotYet = useMemo(() => {
    return (hp: RealExamHotPoint) => {
      if (!hp.relatedKnowledgeCardIds?.length) return false;
      return hp.relatedKnowledgeCardIds.some((id) => masteryMap[id]?.level === 'not-yet');
    };
  }, [masteryMap]);

  // 检查是否是"重点突破"（高频 + 你不会）
  const isKeyBreakthrough = useMemo(() => {
    return (hp: RealExamHotPoint, idx: number) => {
      // 前 8 个 = 高频 + 对应卡片有不会的
      return idx < 8 && hasNotYet(hp);
    };
  }, [hasNotYet]);

  // 获取考点对应的知识卡片
  const relatedCards = useMemo(() => {
    return (hp: RealExamHotPoint) => {
      if (!hp.relatedKnowledgeCardIds?.length) return [];
      return KNOWLEDGE_CARDS.filter((c) => hp.relatedKnowledgeCardIds?.includes(c.id));
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* 标题 */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Flame className="size-5 text-orange-500" />
            真题考点热力榜
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            基于已入库 3 套真题统计，Top 15 高频考点
          </p>
        </div>
        <Badge variant="outline" className="text-xs w-fit">
          3 套真题 · {REAL_EXAM_HOT_POINTS.length} 个考点
        </Badge>
      </div>

      {/* 热力榜列表 */}
      <Card className="border-border/60">
        <CardContent className="p-4 space-y-2.5">
          {sortedHotPoints.map((hp, i) => {
            const freqPct = (hp.frequency / maxFreq) * 100;
            const breakthrough = isKeyBreakthrough(hp, i);
            const notYet = hasNotYet(hp);
            return (
              <motion.div
                key={hp.title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <div
                  className={cn(
                    'group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all',
                    'hover:bg-accent/50',
                    breakthrough && 'bg-orange-50/60 dark:bg-orange-900/10 border border-orange-200/50 dark:border-orange-800/30'
                  )}
                  onClick={() => setSelectedHot(hp)}
                >
                  {/* 排名 */}
                  <div className={cn(
                    'size-6 shrink-0 rounded-md flex items-center justify-center text-xs font-bold tabular-nums',
                    i < 3 ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    {i + 1}
                  </div>

                  {/* 考点信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {hp.title}
                      </span>
                      {breakthrough && (
                        <Badge variant="outline" className="h-5 text-xs px-1.5 text-orange-600 border-orange-300 bg-orange-100/50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50 shrink-0">
                          <Star className="size-3 mr-0.5 fill-current" />
                          重点突破
                        </Badge>
                      )}
                      {notYet && !breakthrough && (
                        <span className="size-2 rounded-full bg-rose-500 shrink-0" title="你还不会的高频考点" />
                      )}
                    </div>
                    {/* 热力条 */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', getHeatColor(hp.frequency, maxFreq))}
                          style={{ width: `${freqPct}%` }}
                        />
                      </div>
                      <span className={cn('text-xs tabular-nums w-12 text-right', getHeatTextColor(hp.frequency, maxFreq))}>
                        {hp.appearedSessions.length} 次 · {hp.importance === 3 ? '★★★' : hp.importance === 2 ? '★★☆' : '★☆☆'}
                      </span>
                    </div>
                  </div>

                  {/* 专题标签 */}
                  <Badge variant="outline" className="shrink-0 text-xs h-5 px-1.5 text-muted-foreground hidden sm:inline-flex">
                    {TOPIC_LABELS[hp.topic] || hp.topic}
                  </Badge>

                  <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground/60 shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* 底部提示 */}
      <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/40 text-xs text-amber-700 dark:text-amber-400 leading-relaxed flex items-start gap-2">
        <Lightbulb className="size-4 shrink-0 mt-0.5" />
        <span>
          真题高频考点优先掌握。红色圆点表示你标记为"不会"的考点，标有「重点突破」的是高频且你不会的核心考点，建议优先突破。结合掌握度仪表盘的薄弱类一起复习效果更佳。
        </span>
      </div>

      {/* 考点详情弹窗 */}
      <Dialog open={!!selectedHot} onOpenChange={(o) => !o && setSelectedHot(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedHot && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 pr-6">
                  <Flame className="size-5 text-orange-500" />
                  {selectedHot.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {TOPIC_LABELS[selectedHot.topic] || selectedHot.topic}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    出现 {selectedHot.appearedSessions.length} 次
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    重要度 {selectedHot.importance === 3 ? '★★★' : selectedHot.importance === 2 ? '★★☆' : '★☆☆'}
                  </Badge>
                  {isKeyBreakthrough(selectedHot, sortedHotPoints.findIndex((h) => h.title === selectedHot.title)) && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                      <Star className="size-3 mr-0.5 fill-current" />
                      重点突破
                    </Badge>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* 方法提示 */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="text-xs text-primary font-semibold mb-1.5 flex items-center gap-1.5">
                    <Target className="size-3.5" />
                    方法提示
                  </div>
                  <div className="text-sm text-foreground">{selectedHot.tip}</div>
                </div>

                {/* 出现届数 */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2">出现届数</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedHot.appearedSessions.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 关联知识卡片 */}
                {relatedCards(selectedHot).length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                      <BookOpen className="size-3.5" />
                      关联知识卡片（{relatedCards(selectedHot).length} 张）
                    </div>
                    <div className="space-y-1.5">
                      {relatedCards(selectedHot).map((card) => {
                        const m = masteryMap[card.id]?.level;
                        const meta = m ? {
                          proficient: { label: '熟练', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
                          half: { label: '半生', color: 'text-amber-500 bg-amber-50 border-amber-200' },
                          'not-yet': { label: '不会', color: 'text-rose-500 bg-rose-50 border-rose-200' },
                        }[m] : null;
                        return (
                          <div
                            key={card.id}
                            className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 hover:border-primary/30 transition-colors cursor-pointer"
                            onClick={() => {
                              onGoKnowledge?.(card.id);
                              setSelectedHot(null);
                            }}
                          >
                            <BookOpen className="size-4 text-primary/70 shrink-0" />
                            <span className="text-sm flex-1 truncate">{card.title}</span>
                            {meta && (
                              <Badge variant="outline" className={cn('text-xs h-5 px-1.5', meta.color)}>
                                {meta.label}
                              </Badge>
                            )}
                            <ChevronRight className="size-3.5 text-muted-foreground/50" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {onGoKnowledge && relatedCards(selectedHot).length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onGoKnowledge(selectedHot.relatedKnowledgeCardIds?.[0] ?? '');
                      setSelectedHot(null);
                    }}
                  >
                    <BookOpen className="size-4 mr-1.5" />
                    去学相关知识点
                  </Button>
                )}
                {onGoPractice && (
                  <Button
                    onClick={() => {
                      onGoPractice(selectedHot.topic);
                      setSelectedHot(null);
                    }}
                  >
                    <ArrowRight className="size-4 mr-1.5" />
                    去练该考点题
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
