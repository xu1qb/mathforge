// EXPORTS: EChart
// ECharts 轻量封装：统一 interop、皮肤切换重绘与容器高度。
// echarts-for-react/lib/core 为 CJS：Vite dev 预打包下默认导出经 interop 挂在 .default，
// 生产打包后即组件本身；解包兜底以兼容两种环境（与 DashboardTab 保持一致）。
import { useEffect, useState } from 'react';
import ReactEChartsImport from 'echarts-for-react/lib/core';
const ReactECharts =
  (ReactEChartsImport as unknown as { default: typeof ReactEChartsImport }).default ?? ReactEChartsImport;
import { echarts } from '@/lib/echarts';
import type { EChartsOption } from 'echarts';

interface EChartProps {
  option: EChartsOption;
  /** 画布高度（px） */
  height?: number;
  className?: string;
}

export default function EChart({ option, height = 220, className }: EChartProps) {
  // 皮肤切换后选项里的 hsl(var(--chart-*)) 需要重新取色，重挂载一次让 ECharts 重新解析
  const [skinVersion, setSkinVersion] = useState(0);
  useEffect(() => {
    const onSkinChange = () => setSkinVersion((v) => v + 1);
    window.addEventListener('skinchange', onSkinChange);
    return () => window.removeEventListener('skinchange', onSkinChange);
  }, []);

  return (
    <ReactECharts
      key={skinVersion}
      option={option}
      echarts={echarts}
      theme="ud"
      style={{ height, width: '100%' }}
      className={className}
      opts={{ renderer: 'canvas' }}
      notMerge
      lazyUpdate
    />
  );
}
