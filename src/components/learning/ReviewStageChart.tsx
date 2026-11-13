// EXPORTS: ReviewStageChart
// 错题复习阶段分布：按艾宾浩斯 7 个阶段统计，直观看复习推进到哪一步。
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { WrongItem } from '@/hooks/use-learning';
import EChart from './EChart';

const STAGE_LABELS = ['新错题', '1 天后', '3 天后', '7 天后', '14 天后', '30 天后', '已掌握'];

interface ReviewStageChartProps {
  items: WrongItem[];
  height?: number;
}

export default function ReviewStageChart({ items, height = 190 }: ReviewStageChartProps) {
  const counts = useMemo(() => {
    const c = new Array(7).fill(0);
    for (const w of items) {
      const stage = w.mastered ? 6 : Math.min(5, Math.max(0, w.reviewStage ?? 0));
      c[stage]++;
    }
    return c;
  }, [items]);

  const total = items.length;

  const option = useMemo<EChartsOption>(
    () => ({
      animationDuration: 450,
      grid: { left: 28, right: 8, top: 24, bottom: 26 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'hsl(var(--popover))',
        borderColor: 'hsl(var(--border))',
        textStyle: { color: 'hsl(var(--popover-foreground))', fontSize: 12 },
        formatter: (params: unknown) => {
          const arr = params as { name: string; value: number }[];
          const p = arr[0];
          if (!p) return '';
          const pct = total > 0 ? Math.round((p.value / total) * 100) : 0;
          return `${p.name}：${p.value} 道（${pct}%）`;
        },
      },
      xAxis: {
        type: 'category',
        data: STAGE_LABELS,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: 'hsl(var(--border) / 0.6)' } },
        axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 10, interval: 0 },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 10 },
        splitLine: { lineStyle: { color: 'hsl(var(--border) / 0.6)' } },
      },
      series: [
        {
          type: 'bar',
          data: counts.map((value, i) => ({
            value,
            itemStyle: {
              color: i === 6 ? 'hsl(var(--success))' : 'hsl(var(--chart-2) / 0.7)',
              borderRadius: [3, 3, 0, 0],
            },
          })),
          barMaxWidth: 26,
          label: {
            show: true,
            position: 'top',
            color: 'hsl(var(--muted-foreground))',
            fontSize: 10,
            formatter: (params: unknown) => {
              const p = params as { value: number };
              return p.value > 0 ? String(p.value) : '';
            },
          },
        },
      ],
    }),
    [counts, total],
  );

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        错题本是空的，继续保持
      </div>
    );
  }

  return <EChart option={option} height={height} />;
}
