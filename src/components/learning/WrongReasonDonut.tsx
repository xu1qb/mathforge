// EXPORTS: WrongReasonDonut
// 错因分布环形图：中心显示已标注总数，图例可点击下钻到错题本筛选。
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import {
  WRONG_REASON_LABELS,
  type WrongReason,
} from '@/hooks/use-learning';
import { cn } from '@/lib/utils';
import EChart from './EChart';

const REASON_ORDER: WrongReason[] = ['calc-mistake', 'concept', 'method', 'misread'];

/** 错因配色：全部走皮肤 token，深浅色自动适配 */
const REASON_COLOR: Record<WrongReason, string> = {
  'calc-mistake': 'hsl(var(--chart-3))',
  concept: 'hsl(var(--warning))',
  method: 'hsl(var(--chart-4))',
  misread: 'hsl(var(--chart-5))',
};

interface WrongReasonDonutProps {
  counts: Record<WrongReason, number>;
  totalWithReason: number;
  /** 点击图例 → 下钻筛选（传 null 表示清除） */
  onSelectReason?: (reason: WrongReason) => void;
  selectedReason?: WrongReason | null;
  height?: number;
}

export default function WrongReasonDonut({
  counts,
  totalWithReason,
  onSelectReason,
  selectedReason = null,
  height = 190,
}: WrongReasonDonutProps) {
  const slices = useMemo(
    () =>
      REASON_ORDER.filter((k) => counts[k] > 0).map((k) => ({
        key: k,
        name: WRONG_REASON_LABELS[k],
        value: counts[k],
        color: REASON_COLOR[k],
      })),
    [counts],
  );

  const option = useMemo<EChartsOption>(
    () => ({
      animationDuration: 450,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'hsl(var(--popover))',
        borderColor: 'hsl(var(--border))',
        textStyle: { color: 'hsl(var(--popover-foreground))', fontSize: 12 },
        formatter: '{b}：{c} 道（{d}%）',
      },
      series: [
        {
          type: 'pie',
          radius: ['62%', '85%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderColor: 'hsl(var(--card))',
            borderWidth: 2,
          },
          emphasis: {
            scale: true,
            scaleSize: 4,
          },
          data: slices.map((s) => ({
            name: s.name,
            value: s.value,
            itemStyle: { color: s.color },
          })),
        },
      ],
    }),
    [slices],
  );

  if (totalWithReason === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-10 text-center text-sm text-muted-foreground">
        <span>还没有标注错因</span>
        <span className="text-xs">答错后选择错因，这里会生成分布图</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative" style={{ height }}>
        <EChart option={option} height={height} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-foreground">{totalWithReason}</span>
          <span className="text-[11px] text-muted-foreground">已标注错因</span>
        </div>
      </div>

      <div className="space-y-1" role="group" aria-label="错因分布明细">
        {REASON_ORDER.map((key) => {
          const count = counts[key];
          const pct = totalWithReason > 0 ? Math.round((count / totalWithReason) * 100) : 0;
          const active = selectedReason === key;
          const clickable = Boolean(onSelectReason);
          return (
            <button
              key={key}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelectReason?.(key)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs transition-colors',
                clickable && 'hover:bg-accent/60',
                active && 'bg-accent',
                !clickable && 'cursor-default',
              )}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: REASON_COLOR[key] }}
              />
              <span className="min-w-0 flex-1 truncate text-foreground">
                {WRONG_REASON_LABELS[key]}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {count} 道 · {pct}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
