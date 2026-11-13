// EXPORTS: LearningTrendChart, buildDailyTrend
// 近 N 天学习趋势：柱状答题量 + 折线正确率（双 Y 轴），颜色全部走主题 token。
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { DailyRecord } from '@/hooks/use-learning';
import EChart from './EChart';

export interface TrendPoint {
  key: string;
  label: string;
  total: number;
  correct: number;
  /** 当日正确率（0-100），当天没做题时为 null，折线断开 */
  accuracy: number | null;
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 以今天为终点，逐日生成近 days 天的趋势点（缺失日期补 0） */
export function buildDailyTrend(dailyRecords: Record<string, DailyRecord>, days: number): TrendPoint[] {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const rec = dailyRecords[key];
    const total = rec?.total ?? 0;
    const correct = rec?.correct ?? 0;
    points.push({
      key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
    });
  }
  return points;
}

interface LearningTrendChartProps {
  dailyRecords: Record<string, DailyRecord>;
  days: number;
  height?: number;
  /** 迷你模式：隐藏坐标轴，用在卡片角落 */
  compact?: boolean;
}

export default function LearningTrendChart({
  dailyRecords,
  days,
  height = 240,
  compact = false,
}: LearningTrendChartProps) {
  const points = useMemo(() => buildDailyTrend(dailyRecords, days), [dailyRecords, days]);
  const hasData = points.some((p) => p.total > 0);

  const option = useMemo<EChartsOption>(() => {
    const axisText = 'hsl(var(--muted-foreground))';
    const gridLine = 'hsl(var(--border) / 0.6)';
    return {
      animationDuration: 450,
      grid: compact
        ? { left: 0, right: 0, top: 6, bottom: 0 }
        : { left: 34, right: 40, top: 18, bottom: 26 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'hsl(var(--popover))',
        borderColor: 'hsl(var(--border))',
        textStyle: { color: 'hsl(var(--popover-foreground))', fontSize: 12 },
        axisPointer: { type: 'line', lineStyle: { color: 'hsl(var(--border))' } },
        formatter: (params: unknown) => {
          const arr = params as { dataIndex: number }[];
          const p = points[arr[0]?.dataIndex ?? 0];
          if (!p) return '';
          const acc = p.accuracy === null ? '—' : `${p.accuracy}%`;
          return `${p.key}<br/>答题 ${p.total} 道 · 正确 ${p.correct} 道<br/>正确率 ${acc}`;
        },
      },
      xAxis: {
        type: 'category',
        data: points.map((p) => p.label),
        show: !compact,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: gridLine } },
        axisLabel: {
          color: axisText,
          fontSize: 10,
          interval: days > 60 ? 13 : days > 14 ? 2 : 0,
        },
      },
      yAxis: compact
        ? [
            { type: 'value', show: false },
            { type: 'value', show: false, min: 0, max: 100 },
          ]
        : [
            {
              type: 'value',
              minInterval: 1,
              axisLabel: { color: axisText, fontSize: 10 },
              splitLine: { lineStyle: { color: gridLine } },
            },
            {
              type: 'value',
              min: 0,
              max: 100,
              axisLabel: { color: axisText, fontSize: 10, formatter: '{value}%' },
              splitLine: { show: false },
            },
          ],
      series: [
        {
          name: '答题量',
          type: 'bar',
          data: points.map((p) => p.total),
          barMaxWidth: compact ? 6 : 14,
          itemStyle: {
            color: 'hsl(var(--chart-2) / 0.55)',
            borderRadius: [3, 3, 0, 0],
          },
        },
        {
          name: '正确率',
          type: 'line',
          yAxisIndex: 1,
          data: points.map((p) => p.accuracy),
          connectNulls: false,
          smooth: true,
          symbol: compact ? 'none' : 'circle',
          symbolSize: 5,
          lineStyle: { width: 2, color: 'hsl(var(--primary))' },
          itemStyle: { color: 'hsl(var(--primary))' },
          areaStyle: compact ? { color: 'hsl(var(--primary) / 0.12)' } : undefined,
        },
      ],
    };
  }, [points, days, compact]);

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        这段时间还没有答题记录
      </div>
    );
  }

  return <EChart option={option} height={height} />;
}
