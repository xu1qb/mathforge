// EXPORTS: DistributionChart, type DistPoint
// 概率分布可视化：支持离散 PMF 柱状、连续 PDF 曲线、直方图 + 理论曲线叠加。
// 可高亮区间（如 P(a<X<b)）与标记点（如 x=k），颜色全部走皮肤 token。
import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import EChart from '@/components/learning/EChart';

export interface DistPoint {
  x: number;
  y: number;
}

interface DistributionChartProps {
  /** pmf=离散柱状，pdf=连续曲线（带面积），histogram=频数柱状 */
  kind: 'pmf' | 'pdf' | 'histogram';
  points: DistPoint[];
  /** 高亮区间（闭区间），例如 P(a<X<b) 的 [a,b] */
  shade?: [number, number];
  /** 竖向标记线，例如当前 x=k */
  markers?: number[];
  /** 叠加理论曲线（如 CLT 直方图叠加正态曲线） */
  overlay?: DistPoint[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  /** 提示小数位，默认 4 位有效数字 */
  precision?: number;
}

const fmt = (v: number, precision = 4) => {
  if (!Number.isFinite(v)) return '—';
  if (v !== 0 && (Math.abs(v) < 1e-4 || Math.abs(v) >= 1e6)) return v.toExponential(2);
  return Number(v.toPrecision(precision)).toString();
};

export default function DistributionChart({
  kind,
  points,
  shade,
  markers = [],
  overlay,
  height = 220,
  xLabel,
  yLabel,
  precision = 4,
}: DistributionChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const axisText = 'hsl(var(--muted-foreground))';
    const gridLine = 'hsl(var(--border) / 0.6)';
    const inShade = (x: number) => (shade ? x >= shade[0] - 1e-12 && x <= shade[1] + 1e-12 : false);

    const markerLines = markers.map((x) => ({
      xAxis: x,
      label: { formatter: `x=${fmt(x, 3)}`, color: axisText, fontSize: 10 },
      lineStyle: { color: 'hsl(var(--foreground) / 0.55)', type: 'dashed' as const, width: 1 },
    }));

    const series: EChartsOption['series'] = [];

    if (kind === 'pmf' || kind === 'histogram') {
      series.push({
        name: kind === 'pmf' ? 'P(X=x)' : '频数',
        type: 'bar',
        data: points.map((p) => ({
          value: [p.x, p.y],
          itemStyle: {
            color: inShade(p.x) ? 'hsl(var(--primary))' : 'hsl(var(--chart-2) / 0.6)',
            borderRadius: [3, 3, 0, 0],
          },
        })),
        barMaxWidth: 28,
        markLine: markerLines.length
          ? {
              symbol: 'none',
              silent: true,
              data: markerLines,
            }
          : undefined,
      });
    } else {
      // 连续曲线：底层淡色面积 + 高亮区间重绘
      const lineColor = 'hsl(var(--chart-2))';
      series.push({
        name: 'f(x)',
        type: 'line',
        data: points.map((p) => [p.x, p.y]),
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 2, color: lineColor },
        itemStyle: { color: lineColor },
        areaStyle: { color: 'hsl(var(--chart-2) / 0.12)' },
        markLine: markerLines.length
          ? {
              symbol: 'none',
              silent: true,
              data: markerLines,
            }
          : undefined,
      });
      if (shade) {
        series.push({
          name: '区间概率',
          type: 'line',
          data: points.map((p) => [p.x, inShade(p.x) ? p.y : null]),
          showSymbol: false,
          smooth: true,
          connectNulls: false,
          lineStyle: { width: 2, color: 'hsl(var(--primary))' },
          itemStyle: { color: 'hsl(var(--primary))' },
          areaStyle: { color: 'hsl(var(--primary) / 0.28)' },
        });
      }
    }

    if (overlay && overlay.length > 0) {
      series.push({
        name: '理论曲线',
        type: 'line',
        data: overlay.map((p) => [p.x, p.y]),
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 2, color: 'hsl(var(--chart-3))' },
        itemStyle: { color: 'hsl(var(--chart-3))' },
      });
    }

    const xValues = points.map((p) => p.x);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    return {
      animationDuration: 350,
      grid: { left: 44, right: 16, top: 16, bottom: 30 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'hsl(var(--popover))',
        borderColor: 'hsl(var(--border))',
        textStyle: { color: 'hsl(var(--popover-foreground))', fontSize: 12 },
        axisPointer: { type: kind === 'pmf' || kind === 'histogram' ? 'shadow' : 'line' },
        formatter: (params: unknown) => {
          const arr = params as { seriesName: string; value: [number, number]; color: string }[];
          if (!arr?.length) return '';
          const p = arr[0];
          const head = `x = ${fmt(p.value[0], 4)}`;
          const rows = arr.map(
            (s) =>
              `<br/>${s.seriesName}：${fmt(s.value[1], precision)}`,
          );
          return head + rows.join('');
        },
      },
      xAxis: {
        type: 'value',
        min: xMin,
        max: xMax,
        name: xLabel,
        nameTextStyle: { color: axisText, fontSize: 10 },
        nameGap: 8,
        axisLabel: { color: axisText, fontSize: 10, formatter: (v: number) => fmt(v, 3) },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: gridLine } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: yLabel,
        nameTextStyle: { color: axisText, fontSize: 10 },
        axisLabel: { color: axisText, fontSize: 10, formatter: (v: number) => fmt(v, 2) },
        splitLine: { lineStyle: { color: gridLine } },
      },
      series,
    };
  }, [kind, points, shade, markers, overlay, xLabel, yLabel, precision]);

  if (!points.length) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height }}>
        参数无效，无法绘制分布
      </div>
    );
  }

  return <EChart option={option} height={height} />;
}
