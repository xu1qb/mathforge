// EXPORTS: FunctionPlotCard
// 微积分结果配图：函数曲线 + 可选阴影区间 + 关键点标记，颜色走皮肤 token。
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { parse } from 'mathjs';
import EChart from '@/components/learning/EChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from 'lucide-react';

export interface PlotCurve {
  label: string;
  /** mathjs 语法表达式 */
  expr: string;
  /** CSS 颜色；缺省按序号取 chart token */
  color?: string;
  /** 虚线（如导函数） */
  dashed?: boolean;
}

interface FunctionPlotCardProps {
  title?: string;
  description?: string;
  curves: PlotCurve[];
  xMin: number;
  xMax: number;
  /** 对指定曲线（默认第一条）在 [from,to] 区间填充面积 */
  shade?: { curveIndex?: number; from: number; to: number; label?: string };
  /** 竖向虚线标记（如极值点） */
  markers?: { x: number; label?: string }[];
  height?: number;
}

const CURVE_COLORS = [
  'hsl(var(--chart-2))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

const SAMPLES = 420;

function sampleExpr(expr: string, xMin: number, xMax: number, xVar: string) {
  let node;
  try {
    node = parse(expr);
  } catch {
    return [];
  }
  const out: [number, number][] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const x = xMin + ((xMax - xMin) * i) / (SAMPLES - 1);
    let y: number;
    try {
      y = node.evaluate({ [xVar]: x }) as number;
    } catch {
      continue;
    }
    if (typeof y === 'number' && Number.isFinite(y) && Math.abs(y) < 1e6) out.push([x, y]);
  }
  return out;
}

export default function FunctionPlotCard({
  title = '函数图像',
  description,
  curves,
  xMin,
  xMax,
  shade,
  markers = [],
  height = 300,
}: FunctionPlotCardProps) {
  const valid =
    Number.isFinite(xMin) && Number.isFinite(xMax) && xMax > xMin && curves.length > 0;

  const sampled = useMemo(
    () =>
      valid
        ? curves.map((c, i) => ({
            ...c,
            color: c.color ?? CURVE_COLORS[i % CURVE_COLORS.length],
            points: sampleExpr(c.expr, xMin, xMax, 'x'),
          }))
        : [],
    [valid, curves, xMin, xMax],
  );

  const option = useMemo<EChartsOption>(() => {
    const axisText = 'hsl(var(--muted-foreground))';
    const gridLine = 'hsl(var(--border) / 0.6)';
    const series: EChartsOption['series'] = sampled.map((c) => ({
      name: c.label,
      type: 'line',
      data: c.points,
      showSymbol: false,
      smooth: true,
      lineStyle: { width: 2, color: c.color, type: c.dashed ? 'dashed' : 'solid' },
      itemStyle: { color: c.color },
    }));

    if (shade && sampled.length > 0) {
      const target = sampled[Math.min(shade.curveIndex ?? 0, sampled.length - 1)];
      const shaded = target.points.map(([x, y]) => [
        x,
        x >= shade.from - 1e-9 && x <= shade.to + 1e-9 ? y : null,
      ]);
      series.push({
        name: shade.label ?? '积分区域',
        type: 'line',
        data: shaded,
        showSymbol: false,
        smooth: true,
        connectNulls: false,
        lineStyle: { width: 1, color: 'hsl(var(--primary))' },
        itemStyle: { color: 'hsl(var(--primary))' },
        areaStyle: { color: 'hsl(var(--primary) / 0.22)' },
      });
    }

    if (markers.length > 0 && series.length > 0) {
      (series as { markLine?: unknown }[])[0].markLine = {
        symbol: 'none',
        silent: true,
        data: markers.map((m) => ({
          xAxis: m.x,
          label: { formatter: m.label ?? `x=${Number(m.x.toPrecision(3))}`, color: axisText, fontSize: 10 },
          lineStyle: { color: 'hsl(var(--foreground) / 0.45)', type: 'dashed', width: 1 },
        })),
      };
    }

    return {
      animationDuration: 350,
      grid: { left: 44, right: 16, top: 16, bottom: 30 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'hsl(var(--popover))',
        borderColor: 'hsl(var(--border))',
        textStyle: { color: 'hsl(var(--popover-foreground))', fontSize: 12 },
        formatter: (params: unknown) => {
          const arr = params as { seriesName: string; value: [number, number]; color: string }[];
          if (!arr?.length) return '';
          const head = `x = ${Number(arr[0].value[0].toPrecision(4))}`;
          const rows = arr
            .filter((p) => p.value[1] !== null && Number.isFinite(p.value[1]))
            .map((p) => `<br/>${p.seriesName}：${Number(p.value[1].toPrecision(5))}`);
          return head + rows.join('');
        },
      },
      legend: {
        top: 0,
        right: 0,
        itemWidth: 14,
        itemHeight: 8,
        textStyle: { color: axisText, fontSize: 11 },
      },
      xAxis: {
        type: 'value',
        min: xMin,
        max: xMax,
        axisLabel: { color: axisText, fontSize: 10, formatter: (v: number) => String(Number(v.toPrecision(3))) },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: gridLine } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: { color: axisText, fontSize: 10, formatter: (v: number) => String(Number(v.toPrecision(2))) },
        splitLine: { lineStyle: { color: gridLine } },
      },
      series,
    };
  }, [sampled, shade, markers, xMin, xMax]);

  if (!valid || !sampled.some((c) => c.points.length >= 2)) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <LineChart className="size-4 text-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <EChart option={option} height={height} />
      </CardContent>
    </Card>
  );
}
