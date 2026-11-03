import { memo } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WrongReason } from '@/hooks/use-learning';
import { WRONG_REASON_LABELS, WRONG_REASON_COLORS } from '@/hooks/use-learning';

interface WrongReasonChartProps {
  /** 各错因数量 */
  counts: Record<WrongReason, number>;
  /** 带错因的总题数 */
  totalWithReason: number;
  /** 最多的错因 */
  topReason: WrongReason | null;
  /** 点击某类错因 → 筛选 */
  onSelectReason?: (reason: WrongReason | null) => void;
  /** 当前选中的筛选（null=全部） */
  selectedReason?: WrongReason | null;
  /** 紧凑模式（数据看板用） */
  compact?: boolean;
  className?: string;
}

const REASON_ORDER: WrongReason[] = ['calc-mistake', 'concept', 'method', 'misread'];

function WrongReasonChart({
  counts,
  totalWithReason,
  topReason,
  onSelectReason,
  selectedReason = null,
  compact = false,
  className,
}: WrongReasonChartProps) {
  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="py-3 px-4 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Brain className="size-3.5" />
            错因分布
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4 pt-0 space-y-1.5">
          {REASON_ORDER.map((key) => {
            const count = counts[key];
            const pct = totalWithReason > 0 ? (count / totalWithReason) * 100 : 0;
            const colors = WRONG_REASON_COLORS[key];
            return (
              <div key={key} className="flex items-center gap-2 text-xs">
                <div className="w-14 shrink-0 text-muted-foreground truncate">
                  {WRONG_REASON_LABELS[key]}
                </div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', colors.bar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-6 shrink-0 text-right tabular-nums text-muted-foreground">
                  {count}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Brain className="size-4 text-primary" />
          错因分布
          {selectedReason && onSelectReason && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectReason(null)}
              className="ml-auto h-7 text-xs"
            >
              查看全部
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 横向条形图 */}
        <div className="space-y-2.5">
          {REASON_ORDER.map((key, i) => {
            const count = counts[key];
            const pct = totalWithReason > 0 ? (count / totalWithReason) * 100 : 0;
            const colors = WRONG_REASON_COLORS[key];
            const isSelected = selectedReason === key;
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => onSelectReason?.(isSelected ? null : key)}
                className={cn(
                  'w-full text-left flex items-center gap-3 group',
                  onSelectReason && 'cursor-pointer hover:bg-muted/50 -mx-1 px-1 py-0.5 rounded-md'
                )}
              >
                <div className="w-20 shrink-0 text-sm text-foreground">
                  {WRONG_REASON_LABELS[key]}
                </div>
                <div className="flex-1 h-6 rounded-md bg-muted overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.08 + 0.1, duration: 0.6, ease: 'easeOut' }}
                    className={cn('h-full rounded-md', colors.bar)}
                  />
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-xs font-medium text-foreground/80 tabular-nums">
                      {count} 题
                      {totalWithReason > 0 && (
                        <span className="text-muted-foreground ml-1">
                          ({Math.round(pct)}%)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                {onSelectReason && (
                  <div className={cn(
                    'w-12 text-right text-xs transition-opacity',
                    isSelected ? 'opacity-100 text-primary font-medium' : 'opacity-0 group-hover:opacity-60'
                  )}>
                    {isSelected ? '已选中' : '筛选 →'}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 本周错因 TOP 提示 */}
        {topReason && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30 p-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-amber-800 dark:text-amber-300">
                  错因最多：{WRONG_REASON_LABELS[topReason]}
                  {totalWithReason > 0 && `（${Math.round((counts[topReason] / totalWithReason) * 100)}%）`}
                </div>
                <div className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5">
                  {topReason === 'calc-mistake' && '建议：做题慢一点，每步检查符号和计算'}
                  {topReason === 'concept' && '建议：回到知识点卡，重新理解概念定义'}
                  {topReason === 'method' && '建议：多练同类题目，总结解题套路'}
                  {topReason === 'misread' && '建议：读题时圈出已知条件和所求量'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(WrongReasonChart);
