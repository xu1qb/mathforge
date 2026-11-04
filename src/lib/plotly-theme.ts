import { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';

/**
 * Plotly 图表主题配色工具
 * 根据当前皮肤（paper / night / pixel / journal）返回适配的 layout 配色
 */

interface PlotlyPalette {
  plot_bgcolor: string;
  paper_bgcolor: string;
  gridcolor: string;
  zerolinecolor: string;
  font_color: string;
  tickfont_color: string;
  line_colors: string[];
  surface_color: string;
}

// 草稿纸皮肤（米黄浅底）
const paperPalette: PlotlyPalette = {
  plot_bgcolor: '#faf8f0',
  paper_bgcolor: 'rgba(0,0,0,0)',
  gridcolor: '#e8e0cc',
  zerolinecolor: '#b8ad92',
  font_color: '#4a3f35',
  tickfont_color: '#7a6b5d',
  line_colors: ['#c0392b', '#2980b9', '#27ae60', '#d68910', '#8e44ad', '#c0392b'],
  surface_color: '#c0392b',
};

// 夜航皮肤（墨蓝黑 + 琥珀）
const nightPalette: PlotlyPalette = {
  plot_bgcolor: '#1a1f2e',
  paper_bgcolor: 'rgba(0,0,0,0)',
  gridcolor: '#2a3045',
  zerolinecolor: '#3d4560',
  font_color: '#e8dcc4',
  tickfont_color: '#a09070',
  line_colors: ['#f5a623', '#4fc3f7', '#81c784', '#ff8a65', '#ba68c8', '#f06292'],
  surface_color: '#f5a623',
};

// 像素皮肤（深绿 + 荧光绿 + 像素黄）
const pixelPalette: PlotlyPalette = {
  plot_bgcolor: '#141a16',
  paper_bgcolor: 'rgba(0,0,0,0)',
  gridcolor: '#1f3a2b',
  zerolinecolor: '#2a4a36',
  font_color: '#7dff9a',
  tickfont_color: '#5db877',
  line_colors: ['#7dff9a', '#ffd93d', '#ff4d4d', '#4dc9ff', '#c97dff', '#ff9f43'],
  surface_color: '#7dff9a',
};

// 手账皮肤（奶油纸 + 朱红）
const journalPalette: PlotlyPalette = {
  plot_bgcolor: '#fffdf5',
  paper_bgcolor: 'rgba(0,0,0,0)',
  gridcolor: '#e8dcc4',
  zerolinecolor: '#d9cbaf',
  font_color: '#4a3f35',
  tickfont_color: '#7a6b5d',
  line_colors: ['#c0392b', '#2980b9', '#27ae60', '#d68910', '#8e44ad', '#e67e22'],
  surface_color: '#c0392b',
};

/**
 * 获取当前皮肤的 Plotly 调色板
 * 完全按 4 套皮肤区分，不再依赖 light/dark 模式
 */
export function usePlotlyPalette() {
  const { skin } = useTheme();
  return useMemo(() => {
    switch (skin as string) {
      case 'night':
        return nightPalette;
      case 'pixel':
        return pixelPalette;
      case 'journal':
        return journalPalette;
      case 'paper':
      default:
        return paperPalette;
    }
  }, [skin]);
}
