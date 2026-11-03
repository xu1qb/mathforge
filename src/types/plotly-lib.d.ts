// plotly.js 按需子路径（lib/core、lib/contour、lib/index-gl3d）为 CommonJS 源码模块，
// 仓库未安装 @types/plotly.js，这里做宽松 any 声明，类型安全由 react-plotly factory 的组件参数承担。
declare module 'plotly.js/lib/core' {
  const Plotly: any;
  export default Plotly;
}

declare module 'plotly.js/lib/contour' {
  const trace: any;
  export default trace;
}

declare module 'plotly.js/lib/index-gl3d' {
  const Plotly: any;
  export default Plotly;
}
