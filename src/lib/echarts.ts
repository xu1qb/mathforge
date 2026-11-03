// 按需注册的 ECharts 实例：只引入实际用到的图表、坐标系组件与 Canvas 渲染器，
// 避免把 echarts 全量包打入主 chunk。新增图表类型时在此同步注册。
import * as echarts from 'echarts/core';
import {
  LineChart,
  PieChart,
  BarChart,
  RadarChart,
  ScatterChart,
  HeatmapChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  VisualMapComponent,
  TitleComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  PieChart,
  BarChart,
  RadarChart,
  ScatterChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  VisualMapComponent,
  TitleComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

export { echarts };
