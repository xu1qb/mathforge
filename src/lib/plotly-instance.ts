// 按需裁剪的 Plotly 实例与绑定组件。
// 全站实际使用的 trace 仅：2D scatter（core 内置）、contour（2D 等高线）、
// surface / cone / isosurface（3D，由 index-gl3d 在同一 core 单例上注册）。
// 不再静态引入 plotly.js/dist/plotly 全量包，避免打包未使用的 polar / geo / ternary /
// bar / pie / heatmap / histogram / scattergl 等 trace 与坐标系。
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js/lib/core';
import contour from 'plotly.js/lib/contour';
// index-gl3d 内部在同一 core 单例上 register surface / cone / isosurface /
// scatter3d / volume / mesh3d / streamtube，这里仅作副作用引入。
import 'plotly.js/lib/index-gl3d';

Plotly.register([contour]);

const Plot = createPlotlyComponent(Plotly);

export { Plotly };
export default Plot;
