import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import MathInputField from '@/components/MathInputField';
import PageShell from '@/components/PageShell';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Plus, Trash2, Sparkles, Eye, EyeOff } from 'lucide-react';
import type { EChartsOption, SeriesOption } from 'echarts';
import EChart from '@/components/learning/EChart';
import { usePlotlyPalette } from '@/lib/plotly-theme';
import { contourSegments } from '@/lib/contour';
import { evaluate, parse, compile } from 'mathjs';
import {
  sampleFunction, sampleParametric, samplePolar,
  identifyConic, tangentLine, asymptotes,
  areaBetweenCurves, inverseFunction, samplePolarRose,
  formatResult, adaptiveSamplePoints2D,
  findFunctionZeros, findExtrema, findInflectionPoints,
  findYIntercept, computeDerivativeSamples,
  findIntersections, computeDefiniteIntegral,
} from '@/lib/math-utils';

interface PlotItem {
  id: number;
  expr: string;
  color: string;
  visible: boolean;
}

// 注意：实际曲线颜色来自 usePlotlyPalette().line_colors（按皮肤切换），
// 此处仅作为 fallback / 初始占位，运行时会被 palette 覆盖。
const FALLBACK_COLORS = ['#059669', '#0891b2', '#dc2626', '#d97706', '#7c3aed', '#db2777'];

const PRESETS = [
  { name: 'sin(x)', expr: 'sin(x)' },
  { name: 'x²', expr: 'x^2' },
  { name: 'e^-x²', expr: 'exp(-x^2)' },
  { name: 'sin(x)/x', expr: 'sin(x)/x' },
  { name: 'ln(x)', expr: 'log(x)' },
];

const PARAM_PRESETS = [
  { name: '圆', xExpr: 'cos(t)', yExpr: 'sin(t)', tMin: '0', tMax: '2*pi' },
  { name: '椭圆', xExpr: '3*cos(t)', yExpr: '2*sin(t)', tMin: '0', tMax: '2*pi' },
  { name: '摆线', xExpr: 't - sin(t)', yExpr: '1 - cos(t)', tMin: '0', tMax: '4*pi' },
  { name: '星形线', xExpr: 'cos(t)^3', yExpr: 'sin(t)^3', tMin: '0', tMax: '2*pi' },
];

const POLAR_PRESETS = [
  { name: '3瓣玫瑰', expr: 'cos(3*t)', tMin: '0', tMax: '2*pi' },
  { name: '4瓣玫瑰', expr: 'cos(2*t)', tMin: '0', tMax: '2*pi' },
  { name: '心形线', expr: '1 + cos(t)', tMin: '0', tMax: '2*pi' },
  { name: '阿基米德螺线', expr: 't', tMin: '0', tMax: '4*pi' },
  { name: '双纽线', expr: 'sqrt(cos(2*t))', tMin: '0', tMax: '2*pi' },
];

const IMPLICIT_PRESETS = [
  { name: '圆 x²+y²=4', expr: 'x^2 + y^2 - 4' },
  { name: '椭圆', expr: 'x^2/4 + y^2/9 - 1' },
  { name: '双曲线', expr: 'x^2 - y^2 - 1' },
  { name: '抛物线 y=x²', expr: 'y - x^2' },
];

const CONIC_PRESETS = [
  { name: '椭圆', A: 1, B: 0, C: 4, D: 0, E: 0, F: -4, desc: 'x²+4y²=4' },
  { name: '抛物线', A: 0, B: 0, C: 1, D: -4, E: 0, F: 0, desc: 'y²=4x' },
  { name: '双曲线', A: 1, B: 0, C: -1, D: 0, E: 0, F: -1, desc: 'x²-y²=1' },
  { name: '圆', A: 1, B: 0, C: 1, D: 0, E: 0, F: -9, desc: 'x²+y²=9' },
];

export default function Plot2DPage() {
  // 调色板必须在所有读取 palette 的 useMemo 之前声明，避免 const 暂时性死区报错
  const palette = usePlotlyPalette();
  const [activeTab, setActiveTab] = useState('cartesian');
  const [plots, setPlots] = useState<PlotItem[]>([
    { id: 1, expr: 'sin(x)', color: FALLBACK_COLORS[0], visible: true },
  ]);
  const [xMin, setXMin] = useState('-10');
  const [xMax, setXMax] = useState('10');

  // parametric
  const [paramX, setParamX] = useState('cos(t)');
  const [paramY, setParamY] = useState('sin(t)');
  const [tMin, setTMin] = useState('0');
  const [tMax, setTMax] = useState('2*pi');

  // polar
  const [polarExpr, setPolarExpr] = useState('sin(3*t)');
  const [polarTMin, setPolarTMin] = useState('0');
  const [polarTMax, setPolarTMax] = useState('2*pi');

  // implicit
  const [implicitExpr, setImplicitExpr] = useState('x^2 + y^2 - 4');
  const [impXMin, setImpXMin] = useState('-5');
  const [impXMax, setImpXMax] = useState('5');
  const [impYMin, setImpYMin] = useState('-5');
  const [impYMax, setImpYMax] = useState('5');

  // conic
  const [conicA, setConicA] = useState('1');
  const [conicB, setConicB] = useState('0');
  const [conicC, setConicC] = useState('4');
  const [conicD, setConicD] = useState('0');
  const [conicE, setConicE] = useState('0');
  const [conicF, setConicF] = useState('-4');

  // tangent
  const [tangentExpr, setTangentExpr] = useState('sin(x)');
  const [tangentX0, setTangentX0] = useState('1');

  // asymptotes
  const [asymExpr, setAsymExpr] = useState('1/(x^2-1)');

  // area between
  const [areaF, setAreaF] = useState('sin(x)');
  const [areaG, setAreaG] = useState('cos(x)');
  const [areaA, setAreaA] = useState('0');
  const [areaB, setAreaB] = useState('pi');

  // ===== 笛卡尔分析功能 =====
  const [showZeros, setShowZeros] = useState(true);       // 零点标注
  const [showExtrema, setShowExtrema] = useState(true);   // 极值点标注
  const [showInflection, setShowInflection] = useState(false); // 拐点标注
  const [showYIntercept, setShowYIntercept] = useState(true); // y轴截距
  const [showDerivative1, setShowDerivative1] = useState(false); // 一阶导数曲线
  const [showDerivative2, setShowDerivative2] = useState(false); // 二阶导数曲线
  const [showIntegral, setShowIntegral] = useState(false);     // 定积分面积
  const [integralA, setIntegralA] = useState('0');             // 积分左端点
  const [integralB, setIntegralB] = useState('2');             // 积分右端点
  const [showIntersections, setShowIntersections] = useState(false); // 函数交点

  // inverse
  const [invExpr, setInvExpr] = useState('x^2');

  // multi window (2x2)
  const [mw1, setMw1] = useState('sin(x)');
  const [mw2, setMw2] = useState('cos(x)');
  const [mw3, setMw3] = useState('x^2');
  const [mw4, setMw4] = useState('exp(x)');

  // param animation slider
  const [animX, setAnimX] = useState('cos(t)');
  const [animY, setAnimY] = useState('sin(t)');
  const [animTMax, setAnimTMax] = useState(3.14);

  // rose
  const [roseExpr, setRoseExpr] = useState('sin(4*t)');

  // 不等式区域
  const [ineqText, setIneqText] = useState('y > x^2\ny < 2 - x^2');
  const [ineqXMin, setIneqXMin] = useState('-3');
  const [ineqXMax, setIneqXMax] = useState('3');
  const [ineqYMin, setIneqYMin] = useState('-2');
  const [ineqYMax, setIneqYMax] = useState('4');

  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPlot = () => {
    const newId = plots.length > 0 ? Math.max(...plots.map((p) => p.id)) + 1 : 1;
    const colorIdx = plots.length % palette.line_colors.length;
    setPlots([...plots, { id: newId, expr: '', color: palette.line_colors[colorIdx], visible: true }]);
  };

  const removePlot = (id: number) => {
    setPlots(plots.filter((p) => p.id !== id));
  };

  const updatePlot = (id: number, expr: string) => {
    setPlots(plots.map((p) => (p.id === id ? { ...p, expr } : p)));
  };

  const togglePlot = (id: number) => {
    setPlots(plots.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
  };

  const getRange = (mn: string, mx: string) => {
    const a = parseFloat(evaluate(mn) as unknown as string);
    const b = parseFloat(evaluate(mx) as unknown as string);
    return [isNaN(a) ? -10 : a, isNaN(b) ? 10 : b];
  };

  const cartesianData = useMemo(() => {
    if (activeTab !== 'cartesian') return [];
    setError(null);
    const data: any[] = [];
    const [xmin, xmax] = getRange(xMin, xMax);
    const n = adaptiveSamplePoints2D(xmin, xmax, 800, 100);

    const visiblePlots = plots.filter((p) => p.visible && p.expr.trim());

    for (let idx = 0; idx < visiblePlots.length; idx++) {
      const p = visiblePlots[idx];
      const colorIdx = plots.findIndex((pp) => pp.id === p.id);
      try {
        const pts = sampleFunction(p.expr, xmin, xmax, n);
        data.push({
          x: pts.x, y: pts.y, name: `y = ${p.expr}`, type: 'scatter', mode: 'lines',
          line: { color: palette.line_colors[colorIdx % palette.line_colors.length], width: 2 },
          legendgroup: `plot-${p.id}`,
        });

        // ===== 关键点标注（只对第一个可见函数标注，避免混乱） =====
        if (idx === 0) {
          const color = palette.line_colors[colorIdx % palette.line_colors.length];

          // 零点
          if (showZeros) {
            try {
              const zeros = findFunctionZeros(p.expr, xmin, xmax, 1000, 10);
              if (zeros.length > 0) {
                data.push({
                  x: zeros.map((z) => z.x),
                  y: zeros.map(() => 0),
                  name: '零点',
                  type: 'scatter',
                  mode: 'markers',
                  marker: { color: '#dc2626', size: 8, symbol: 'circle' },
                  text: zeros.map((z) => `零点 (${formatResult(z.x)}, 0)`),
                  hoverinfo: 'text',
                  legendgroup: 'analysis-zeros',
                  showlegend: true,
                });
              }
            } catch { /* ignore */ }
          }

          // 极值点
          if (showExtrema) {
            try {
              const extrema = findExtrema(p.expr, xmin, xmax, 1000);
              if (extrema.length > 0) {
                data.push({
                  x: extrema.map((e) => e.x),
                  y: extrema.map((e) => e.y),
                  name: '极值点',
                  type: 'scatter',
                  mode: 'markers+text',
                  marker: {
                    color: extrema.map((e) => e.type === 'max' ? '#dc2626' : e.type === 'min' ? '#059669' : '#d97706'),
                    size: 9,
                    symbol: 'diamond',
                  },
                  text: extrema.map((e) => `${e.type === 'max' ? '极大' : e.type === 'min' ? '极小' : '驻点'}`),
                  textposition: 'top center',
                  textfont: { size: 10, color: color },
                  hovertext: extrema.map((e) => `${e.type === 'max' ? '极大值' : e.type === 'min' ? '极小值' : '驻点'}(${formatResult(e.x)}, ${formatResult(e.y)})`),
                  hoverinfo: 'text',
                  legendgroup: 'analysis-extrema',
                  showlegend: true,
                });
              }
            } catch { /* ignore */ }
          }

          // 拐点
          if (showInflection) {
            try {
              const infl = findInflectionPoints(p.expr, xmin, xmax, 1000);
              if (infl.length > 0) {
                data.push({
                  x: infl.map((i) => i.x),
                  y: infl.map((i) => i.y),
                  name: '拐点',
                  type: 'scatter',
                  mode: 'markers',
                  marker: { color: palette.line_colors[(colorIdx + 2) % palette.line_colors.length], size: 8, symbol: 'square' },
                  text: infl.map((i) => `拐点 (${formatResult(i.x)}, ${formatResult(i.y)})`),
                  hoverinfo: 'text',
                  legendgroup: 'analysis-inflection',
                  showlegend: true,
                });
              }
            } catch { /* ignore */ }
          }

          // y轴截距
          if (showYIntercept && xmin <= 0 && xmax >= 0) {
            try {
              const yint = findYIntercept(p.expr);
              if (yint) {
                data.push({
                  x: [0],
                  y: [yint.y],
                  name: 'y截距',
                  type: 'scatter',
                  mode: 'markers',
                  marker: { color: palette.line_colors[(colorIdx + 1) % palette.line_colors.length], size: 8, symbol: 'triangle-down' },
                  text: [`y截距 (0, ${formatResult(yint.y)})`],
                  hoverinfo: 'text',
                  legendgroup: 'analysis-yint',
                  showlegend: true,
                });
              }
            } catch { /* ignore */ }
          }

          // 一阶导数曲线（虚线）
          if (showDerivative1) {
            try {
              const deriv = computeDerivativeSamples(p.expr, xmin, xmax, n);
              data.push({
                x: deriv.x,
                y: deriv.y1,
                name: "f'(x)（一阶导）",
                type: 'scatter',
                mode: 'lines',
                line: { color: palette.line_colors[(colorIdx + 1) % palette.line_colors.length], width: 1.5, dash: 'dash' },
                legendgroup: 'deriv-1',
                showlegend: true,
              });
            } catch { /* ignore */ }
          }

          // 二阶导数曲线（点线）
          if (showDerivative2) {
            try {
              const deriv = computeDerivativeSamples(p.expr, xmin, xmax, n);
              data.push({
                x: deriv.x,
                y: deriv.y2,
                name: "f''(x)（二阶导）",
                type: 'scatter',
                mode: 'lines',
                line: { color: palette.line_colors[(colorIdx + 2) % palette.line_colors.length], width: 1.5, dash: 'dot' },
                legendgroup: 'deriv-2',
                showlegend: true,
              });
            } catch { /* ignore */ }
          }

          // 定积分面积
          if (showIntegral) {
            try {
              const a = evaluate(integralA) as number;
              const b = evaluate(integralB) as number;
              if (Number.isFinite(a) && Number.isFinite(b) && a < b) {
                const ptsInt = sampleFunction(p.expr, a, b, Math.max(200, Math.floor(n * (b - a) / (xmax - xmin))));
                // 填充面积：上边界曲线 + 下边界 y=0
                data.push({
                  x: ptsInt.x,
                  y: ptsInt.y,
                  name: '积分上边界',
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: 'transparent', width: 0 },
                  fill: 'tozeroy',
                  fillcolor: `${palette.line_colors[0]}33`, // ~20% opacity hex
                  legendgroup: 'integral',
                  showlegend: false,
                  hoverinfo: 'skip',
                });
              }
            } catch { /* ignore */ }
          }
        }

        // ===== 交点计算（两个及以上可见函数时）=====
        if (showIntersections && idx === 1 && visiblePlots.length >= 2) {
          try {
            const p0 = visiblePlots[0];
            const intersects = findIntersections(p0.expr, p.expr, xmin, xmax, 1000, 8);
            if (intersects.length > 0) {
              data.push({
                x: intersects.map((i) => i.x),
                y: intersects.map((i) => i.y),
                name: '交点',
                type: 'scatter',
                mode: 'markers',
                marker: { color: '#dc2626', size: 10, symbol: 'x' },
                text: intersects.map((i) => `交点 (${formatResult(i.x)}, ${formatResult(i.y)})`),
                hoverinfo: 'text',
                legendgroup: 'analysis-intersections',
                showlegend: true,
              });
            }
          } catch { /* ignore */ }
        }
      } catch (e) {
        setError(`函数 "${p.expr}" 错误: ${(e as Error).message}`);
      }
    }
    return data;
  }, [plots, xMin, xMax, activeTab, showZeros, showExtrema, showInflection, showYIntercept, showDerivative1, showDerivative2, showIntegral, integralA, integralB, showIntersections]);

  // 第一个可见函数的定积分值
  const cartesianIntegralValue = useMemo(() => {
    if (activeTab !== 'cartesian' || !showIntegral) return null;
    const firstVisible = plots.find((p) => p.visible && p.expr.trim());
    if (!firstVisible) return null;
    try {
      const a = evaluate(integralA) as number;
      const b = evaluate(integralB) as number;
      if (!Number.isFinite(a) || !Number.isFinite(b) || a >= b) return null;
      const val = computeDefiniteIntegral(firstVisible.expr, a, b, 2000);
      return Number.isFinite(val) ? formatResult(val) : null;
    } catch { return null; }
  }, [plots, showIntegral, integralA, integralB, activeTab]);

  // 关键点表格：便于抄写与核对，不依赖悬停
  const keyPoints = useMemo(() => {
    if (activeTab !== 'cartesian') return [];
    const first = plots.find((p) => p.visible && p.expr.trim());
    if (!first) return [];
    const [xmin, xmax] = getRange(xMin, xMax);
    const rows: { type: string; x: number; y: number }[] = [];
    try {
      if (showZeros) {
        findFunctionZeros(first.expr, xmin, xmax, 1000, 10).forEach((z) =>
          rows.push({ type: '零点', x: z.x, y: 0 }),
        );
      }
    } catch { /* ignore */ }
    try {
      if (showExtrema) {
        findExtrema(first.expr, xmin, xmax, 1000).forEach((e) =>
          rows.push({ type: e.type === 'max' ? '极大值' : e.type === 'min' ? '极小值' : '驻点', x: e.x, y: e.y }),
        );
      }
    } catch { /* ignore */ }
    try {
      if (showInflection) {
        findInflectionPoints(first.expr, xmin, xmax, 1000).forEach((p) =>
          rows.push({ type: '拐点', x: p.x, y: p.y }),
        );
      }
    } catch { /* ignore */ }
    try {
      if (showYIntercept && xmin <= 0 && xmax >= 0) {
        const yi = findYIntercept(first.expr);
        if (yi) rows.push({ type: 'y 截距', x: 0, y: yi.y });
      }
    } catch { /* ignore */ }
    try {
      if (showIntersections) {
        const visible = plots.filter((p) => p.visible && p.expr.trim());
        if (visible.length >= 2) {
          findIntersections(visible[0].expr, visible[1].expr, xmin, xmax, 1000, 8).forEach((p) =>
            rows.push({ type: '交点', x: p.x, y: p.y }),
          );
        }
      }
    } catch { /* ignore */ }
    return rows.slice(0, 40);
  }, [activeTab, plots, xMin, xMax, showZeros, showExtrema, showInflection, showYIntercept, showIntersections, getRange]);

  const parametricData = useMemo(() => {
    if (activeTab !== 'parametric') return [];
    setError(null);
    try {
      const tMinVal = evaluate(tMin) as number;
      const tMaxVal = evaluate(tMax) as number;
      const n = adaptiveSamplePoints2D(tMinVal, tMaxVal, 800, 100);
      const pts = sampleParametric(paramX, paramY, tMinVal, tMaxVal, n);
      return [{ x: pts.x, y: pts.y, name: '参数方程', type: 'scatter', mode: 'lines', line: { color: palette.line_colors[0], width: 2 } }];
    } catch (e) {
      setError(`参数方程错误: ${(e as Error).message}`);
      return [];
    }
  }, [paramX, paramY, tMin, tMax, activeTab]);

  const polarData = useMemo(() => {
    if (activeTab !== 'polar') return [];
    setError(null);
    try {
      const tMinVal = evaluate(polarTMin) as number;
      const tMaxVal = evaluate(polarTMax) as number;
      const n = adaptiveSamplePoints2D(tMinVal, tMaxVal, 800, 100);
      const pts = samplePolar(polarExpr, tMinVal, tMaxVal, n);
      return [{ x: pts.x, y: pts.y, name: `r = ${polarExpr}`, type: 'scatter', mode: 'lines', line: { color: palette.line_colors[0], width: 2 } }];
    } catch (e) {
      setError(`极坐标错误: ${(e as Error).message}`);
      return [];
    }
  }, [polarExpr, polarTMin, polarTMax, activeTab]);

  const implicitData = useMemo(() => {
    if (activeTab !== 'implicit') return [];
    setError(null);
    try {
      const [xmin, xmax] = getRange(impXMin, impXMax);
      const [ymin, ymax] = getRange(impYMin, impYMax);
      // 自适应网格：范围≤10时 220×220；范围越大网格越疏，最少 40×40
      const span = Math.max(Math.abs(xmax - xmin), Math.abs(ymax - ymin));
      const ratio = span / 10;
      let nx = 220, ny = 220;
      if (ratio > 1) {
        const scale = Math.max(1, Math.log10(ratio) * 1.5 + 1);
        nx = Math.max(40, Math.round(220 / scale));
        ny = Math.max(40, Math.round(220 / scale));
      }
      // 用 plotly 的 contour 画零值等高线 = 隐函数曲线
      // 先采样网格
      const node = parse(implicitExpr);
      const xs: number[] = [];
      const ys: number[] = [];
      const dx = (xmax - xmin) / (nx - 1);
      const dy = (ymax - ymin) / (ny - 1);
      for (let i = 0; i < nx; i++) xs.push(xmin + i * dx);
      for (let j = 0; j < ny; j++) ys.push(ymin + j * dy);
      const z: number[][] = [];
      for (let j = 0; j < ny; j++) {
        const row: number[] = [];
        for (let i = 0; i < nx; i++) {
          try {
            const v = node.evaluate({ x: xs[i], y: ys[j] }) as number;
            row.push(isFinite(v) ? v : NaN);
          } catch { row.push(NaN); }
        }
        z.push(row);
      }
      return [{
        x: xs, y: ys, z,
        type: 'contour',
        colorscale: [[0, palette.line_colors[0]], [1, palette.line_colors[0]]],
        showscale: false,
        contours: { start: 0, end: 0, size: 0.01, coloring: 'lines' as const },
        line: { width: 2 },
        name: `f(x,y)=0`,
        ncontours: 1,
      }];
    } catch (e) {
      setError(`隐函数错误: ${(e as Error).message}`);
      return [];
    }
  }, [implicitExpr, impXMin, impXMax, impYMin, impYMax, activeTab]);

  const conicResult = useMemo(() => {
    if (activeTab !== 'conic') return null;
    try {
      const A = evaluate(conicA) as number;
      const B = evaluate(conicB) as number;
      const C = evaluate(conicC) as number;
      const D = evaluate(conicD) as number;
      const E = evaluate(conicE) as number;
      const F = evaluate(conicF) as number;
      return identifyConic(A, B, C, D, E, F);
    } catch (e) {
      setError(`二次曲线识别错误: ${(e as Error).message}`);
      return null;
    }
  }, [conicA, conicB, conicC, conicD, conicE, conicF, activeTab]);

  const conicPlotData = useMemo(() => {
    if (activeTab !== 'conic') return [];
    try {
      const A = evaluate(conicA) as number;
      const B = evaluate(conicB) as number;
      const C = evaluate(conicC) as number;
      const D = evaluate(conicD) as number;
      const E = evaluate(conicE) as number;
      const F = evaluate(conicF) as number;
      const node = parse(`${A}*x^2 + ${B}*x*y + ${C}*y^2 + ${D}*x + ${E}*y + ${F}`);
      const nx = 220, ny = 220;
      const xmin = -10, xmax = 10, ymin = -10, ymax = 10;
      const xs: number[] = [];
      const ys: number[] = [];
      const dx = (xmax - xmin) / (nx - 1);
      const dy = (ymax - ymin) / (ny - 1);
      for (let i = 0; i < nx; i++) xs.push(xmin + i * dx);
      for (let j = 0; j < ny; j++) ys.push(ymin + j * dy);
      const z: number[][] = [];
      for (let j = 0; j < ny; j++) {
        const row: number[] = [];
        for (let i = 0; i < nx; i++) {
          try {
            const v = node.evaluate({ x: xs[i], y: ys[j] }) as number;
            row.push(isFinite(v) ? v : NaN);
          } catch { row.push(NaN); }
        }
        z.push(row);
      }
      return [{
        x: xs, y: ys, z,
        type: 'contour',
        colorscale: [[0, palette.line_colors[0]], [1, palette.line_colors[0]]],
        showscale: false,
        contours: { start: 0, end: 0, size: 0.01, coloring: 'lines' as const },
        line: { width: 2 },
        name: '二次曲线',
        ncontours: 1,
      }];
    } catch { return []; }
  }, [conicA, conicB, conicC, conicD, conicE, conicF, activeTab]);

  const tangentData = useMemo(() => {
    if (activeTab !== 'tangent') return [];
    setError(null);
    try {
      const [xmin, xmax] = getRange(xMin, xMax);
      const x0 = evaluate(tangentX0) as number;
      const n = adaptiveSamplePoints2D(xmin, xmax, 800, 100);
      const t = tangentLine(tangentExpr, x0, xmin, xmax, Math.round(n * 0.6));
      const func = sampleFunction(tangentExpr, xmin, xmax, n);
      return [
        { x: func.x, y: func.y, name: 'f(x)', type: 'scatter', mode: 'lines', line: { color: palette.line_colors[0], width: 2 } },
        { x: t.line.x, y: t.line.y, name: `切线 (x₀=${formatResult(x0)})`, type: 'scatter', mode: 'lines', line: { color: palette.line_colors[2], width: 2, dash: 'dash' as const } },
        { x: [x0], y: [t.y0], name: '切点', type: 'scatter', mode: 'markers', marker: { color: palette.line_colors[2], size: 10 } },
      ];
    } catch (e) {
      setError(`切线错误: ${(e as Error).message}`);
      return [];
    }
  }, [tangentExpr, tangentX0, xMin, xMax, activeTab]);

  const asymptoteData = useMemo(() => {
    if (activeTab !== 'asymptote') return [];
    setError(null);
    try {
      const [xmin, xmax] = getRange(xMin, xMax);
      const n = adaptiveSamplePoints2D(xmin, xmax, 800, 100);
      const func = sampleFunction(asymExpr, xmin, xmax, n);
      const asym = asymptotes(asymExpr, xmin, xmax);
      const traces: any[] = [
        { x: func.x, y: func.y, name: 'f(x)', type: 'scatter', mode: 'lines', line: { color: palette.line_colors[0], width: 2 } },
      ];
      asym.vertical.forEach((v, i) => {
        traces.push({
          x: [v, v], y: [-10, 10], name: i === 0 ? '垂直渐近线' : '',
          type: 'scatter', mode: 'lines', line: { color: palette.line_colors[2], width: 1.5, dash: 'dash' as const },
        });
      });
      asym.horizontal.forEach((h, i) => {
        traces.push({
          x: [xmin, xmax], y: [h, h], name: i === 0 ? '水平渐近线' : '',
          type: 'scatter', mode: 'lines', line: { color: palette.line_colors[3], width: 1.5, dash: 'dash' as const },
        });
      });
      asym.oblique.forEach((o, i) => {
        const y1 = o.a * xmin + o.b;
        const y2 = o.a * xmax + o.b;
        traces.push({
          x: [xmin, xmax], y: [y1, y2], name: i === 0 ? '斜渐近线' : '',
          type: 'scatter', mode: 'lines', line: { color: palette.line_colors[4], width: 1.5, dash: 'dot' as const },
        });
      });
      return traces;
    } catch (e) {
      setError(`渐近线错误: ${(e as Error).message}`);
      return [];
    }
  }, [asymExpr, xMin, xMax, activeTab]);

  const areaData = useMemo(() => {
    if (activeTab !== 'area') return [];
    setError(null);
    try {
      const a = evaluate(areaA) as number;
      const b = evaluate(areaB) as number;
      const nArea = adaptiveSamplePoints2D(a, b, 800, 100);
      const result = areaBetweenCurves(areaF, areaG, a, b, nArea);
      return [
        { x: result.upper.x, y: result.upper.y, name: '上边界', type: 'scatter', mode: 'lines', line: { color: palette.line_colors[0], width: 2 }, fill: 'tonexty' as const, fillcolor: `${palette.line_colors[0]}33` },
        { x: result.lower.x, y: result.lower.y, name: '下边界', type: 'scatter', mode: 'lines', line: { color: palette.line_colors[1], width: 2 }, fill: 'tozeroy' as const, fillcolor: 'rgba(0,0,0,0)' },
      ];
    } catch (e) {
      setError(`面积错误: ${(e as Error).message}`);
      return [];
    }
  }, [areaF, areaG, areaA, areaB, activeTab]);

  const areaValue = useMemo(() => {
    if (activeTab !== 'area') return '';
    try {
      const a = evaluate(areaA) as number;
      const b = evaluate(areaB) as number;
      const nArea = adaptiveSamplePoints2D(a, b, 800, 100);
      const r = areaBetweenCurves(areaF, areaG, a, b, nArea);
      return formatResult(r.area);
    } catch { return ''; }
  }, [areaF, areaG, areaA, areaB, activeTab]);

  const inverseData = useMemo(() => {
    if (activeTab !== 'inverse') return [];
    setError(null);
    try {
      const [xmin, xmax] = getRange(xMin, xMax);
      const nPts = adaptiveSamplePoints2D(xmin, xmax, 800, 100);
      const orig = sampleFunction(invExpr, xmin, xmax, nPts);
      const inv = inverseFunction(invExpr, xmin, xmax, nPts);
      const yx = [Math.min(xmin, ...inv.x.filter(isFinite)), Math.max(xmax, ...inv.x.filter(isFinite))];
      return [
        { x: orig.x, y: orig.y, name: 'f(x)', type: 'scatter', mode: 'lines', line: { color: palette.line_colors[0], width: 2 } },
        { x: inv.x, y: inv.y, name: 'f⁻¹(x)', type: 'scatter', mode: 'lines', line: { color: palette.line_colors[1], width: 2 } },
        { x: yx, y: yx, name: 'y = x', type: 'scatter', mode: 'lines', line: { color: palette.line_colors[3], width: 1.5, dash: 'dash' as const } },
      ];
    } catch (e) {
      setError(`反函数错误: ${(e as Error).message}`);
      return [];
    }
  }, [invExpr, xMin, xMax, activeTab]);

  const multiWindowData = useMemo(() => {
    if (activeTab !== 'multi') return [];
    setError(null);
    try {
      const [xmin, xmax] = getRange(xMin, xMax);
      const nPts = adaptiveSamplePoints2D(xmin, xmax, 600, 100);
      const f1 = sampleFunction(mw1, xmin, xmax, nPts);
      const f2 = sampleFunction(mw2, xmin, xmax, nPts);
      const f3 = sampleFunction(mw3, xmin, xmax, nPts);
      const f4 = sampleFunction(mw4, xmin, xmax, nPts);
      return [
        { x: f1.x, y: f1.y, name: mw1, type: 'scatter', mode: 'lines', xaxis: 'x', yaxis: 'y', line: { color: palette.line_colors[0] } },
        { x: f2.x, y: f2.y, name: mw2, type: 'scatter', mode: 'lines', xaxis: 'x2', yaxis: 'y2', line: { color: palette.line_colors[1] } },
        { x: f3.x, y: f3.y, name: mw3, type: 'scatter', mode: 'lines', xaxis: 'x3', yaxis: 'y3', line: { color: palette.line_colors[2] } },
        { x: f4.x, y: f4.y, name: mw4, type: 'scatter', mode: 'lines', xaxis: 'x4', yaxis: 'y4', line: { color: palette.line_colors[3] } },
      ];
    } catch (e) {
      setError(`多窗口错误: ${(e as Error).message}`);
      return [];
    }
  }, [mw1, mw2, mw3, mw4, xMin, xMax, activeTab]);

  const animData = useMemo(() => {
    if (activeTab !== 'animation') return [];
    setError(null);
    try {
      const tMaxVal = animTMax;
      const nAnim = adaptiveSamplePoints2D(0, tMaxVal, 800, 100);
      const pts = sampleParametric(animX, animY, 0, tMaxVal, nAnim);
      return [{ x: pts.x, y: pts.y, name: '参数曲线', type: 'scatter', mode: 'lines', line: { color: palette.line_colors[0], width: 2.5 } }];
    } catch (e) {
      setError(`参数动画错误: ${(e as Error).message}`);
      return [];
    }
  }, [animX, animY, animTMax, activeTab]);

  const roseData = useMemo(() => {
    if (activeTab !== 'rose') return [];
    setError(null);
    try {
      const pts = samplePolarRose(roseExpr, 0, 2 * Math.PI, 1000);
      return [{ x: pts.x, y: pts.y, name: `r = ${roseExpr}`, type: 'scatter', mode: 'lines', line: { color: palette.line_colors[0], width: 2 } }];
    } catch (e) {
      setError(`极坐标玫瑰线错误: ${(e as Error).message}`);
      return [];
    }
  }, [roseExpr, activeTab]);

  // ===== 不等式区域 =====
  type IneqRegion = { runs: number[][]; boundary: (number | null)[][]; color: string; label: string };
  const ineqChart = useMemo<{
    ok: boolean;
    error?: string;
    x0?: number; x1?: number; y0?: number; y1?: number;
    regions?: IneqRegion[];
  } | null>(() => {
    if (activeTab !== 'ineq') return null;
    const x0 = evaluate(ineqXMin) as number;
    const x1 = evaluate(ineqXMax) as number;
    const y0 = evaluate(ineqYMin) as number;
    const y1 = evaluate(ineqYMax) as number;
    if (![x0, x1, y0, y1].every(Number.isFinite) || x1 <= x0 || y1 <= y0) {
      return { ok: false, error: '绘图范围无效：请保证 x/y 最大值大于最小值' };
    }

    const lines = ineqText.split(/[\n;]/).map((s) => s.trim()).filter(Boolean).slice(0, 3);
    const parsed = lines
      .map((line) => {
        const m = line.match(/^(.+?)(<=|>=|<|>)(.+)$/);
        if (!m) return null;
        return { op: m[2], expr: `(${m[1]}) - (${m[3]})` };
      })
      .filter(Boolean) as { op: string; expr: string }[];
    if (parsed.length === 0) {
      return { ok: false, error: '请输入不等式，例如 y > x^2 或 x^2 + y^2 < 4' };
    }

    const N = 90;
    const xs = Array.from({ length: N }, (_, i) => x0 + ((x1 - x0) * i) / (N - 1));
    const ys = Array.from({ length: N }, (_, i) => y0 + ((y1 - y0) * i) / (N - 1));
    const dx = (x1 - x0) / (N - 1);
    const dy = (y1 - y0) / (N - 1);

    const regions: IneqRegion[] = [];
    parsed.forEach((p, idx) => {
      let test: (v: number) => boolean;
      try {
        const node = compile(p.expr);
        const z: number[][] = ys.map((yv) =>
          xs.map((xv) => {
            try {
              const v = node.evaluate({ x: xv, y: yv });
              return typeof v === 'number' ? v : NaN;
            } catch {
              return NaN;
            }
          }),
        );
        test = (v: number) =>
          Number.isFinite(v) &&
          (p.op === '>' ? v > 0 : p.op === '>=' ? v >= 0 : p.op === '<' ? v < 0 : v <= 0);

        // 行内连续区间合并，减少绘图元素
        const runs: number[][] = [];
        for (let j = 0; j < N; j++) {
          let start = -1;
          for (let i = 0; i <= N; i++) {
            const inside = i < N && test(z[j][i]);
            if (inside && start < 0) start = i;
            if (!inside && start >= 0) {
              runs.push([xs[start] - dx / 2, ys[j] - dy / 2, xs[i - 1] + dx / 2, ys[j] + dy / 2]);
              start = -1;
            }
          }
        }

        const seg = contourSegments(xs, ys, z, 0);
        const boundary: (number | null)[][] = [];
        for (let i = 0; i < seg.x.length; i++) boundary.push([seg.x[i], seg.y[i]]);
        regions.push({
          runs,
          boundary,
          color: palette.line_colors[idx % palette.line_colors.length],
          label: lines[idx],
        });
      } catch {
        // 单条不等式解析失败时跳过
      }
    });

    if (regions.length === 0) {
      return { ok: false, error: '不等式解析失败，请检查表达式（变量用 x 和 y）' };
    }
    return { ok: true, x0, x1, y0, y1, regions };
  }, [activeTab, ineqText, ineqXMin, ineqXMax, ineqYMin, ineqYMax, palette]);

  const ineqOption = useMemo<EChartsOption>(() => {
    if (!ineqChart?.ok || !ineqChart.regions) return {};
    const { x0 = -5, x1 = 5, y0 = -5, y1 = 5, regions } = ineqChart;

    const series: any[] = [];
    for (const region of regions) {
      series.push({
        type: 'custom',
        silent: true,
        name: region.label,
        data: region.runs,
        renderItem: (_params: unknown, api: any) => {
          const p1 = api.coord([api.value(0), api.value(1)]);
          const p2 = api.coord([api.value(2), api.value(3)]);
          const x = Math.min(p1[0], p2[0]);
          const y = Math.min(p1[1], p2[1]);
          return {
            type: 'rect',
            shape: {
              x,
              y,
              width: Math.max(0.5, Math.abs(p2[0] - p1[0])),
              height: Math.max(0.5, Math.abs(p2[1] - p1[1])),
            },
            style: { fill: region.color, opacity: 0.22 },
          };
        },
      });
      series.push({
        type: 'line',
        name: '边界',
        data: region.boundary,
        showSymbol: false,
        connectNulls: false,
        lineStyle: { width: 2, color: region.color },
        itemStyle: { color: region.color },
        emphasis: { disabled: true },
      });
    }

    return {
      color: palette.line_colors,
      grid: { left: 60, right: 20, top: 30, bottom: 50 },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: { backgroundColor: palette.tickfont_color, color: palette.plot_bgcolor, fontSize: 10 },
        },
        backgroundColor: palette.plot_bgcolor,
        borderWidth: 1,
        borderColor: palette.gridcolor,
        textStyle: { color: palette.font_color, fontSize: 12 },
        formatter: (params: unknown) => {
          const arr = (params as { seriesType: string; seriesName: string; value: [number, number] }[]).filter(
            (p) => p.seriesType !== 'custom' && Array.isArray(p.value) && Number.isFinite(p.value[1]),
          );
          if (arr.length === 0) return '';
          return arr.map((p) => `${p.seriesName}：(${Number(p.value[0].toPrecision(4))}, ${Number(p.value[1].toPrecision(4))})`).join('<br/>');
        },
      },
      toolbox: {
        right: 8,
        top: 0,
        iconStyle: { borderColor: palette.tickfont_color },
        feature: {
          restore: { title: '重置视图' },
          saveAsImage: { title: '保存图片', pixelRatio: 2, backgroundColor: palette.plot_bgcolor },
        },
      },
      xAxis: {
        type: 'value',
        min: x0,
        max: x1,
        name: 'x',
        axisLine: { lineStyle: { color: palette.gridcolor } },
        splitLine: { lineStyle: { color: palette.gridcolor, opacity: 0.5 } },
        axisLabel: { fontSize: 11, color: palette.tickfont_color },
      },
      yAxis: {
        type: 'value',
        min: y0,
        max: y1,
        name: 'y',
        axisLine: { lineStyle: { color: palette.gridcolor } },
        splitLine: { lineStyle: { color: palette.gridcolor, opacity: 0.5 } },
        axisLabel: { fontSize: 11, color: palette.tickfont_color },
      },
      series,
      animation: false,
    };
  }, [ineqChart, palette]);

  const layout = useMemo(() => {
    const base: any = {
      autosize: true,
      height: activeTab === 'multi' ? 550 : 450,
      margin: { l: 60, r: 20, t: 30, b: 50 },
      plot_bgcolor: palette.plot_bgcolor,
      paper_bgcolor: palette.paper_bgcolor,
      legend: { orientation: 'h' as const, y: -0.2, font: { family: 'inherit', size: 12, color: palette.font_color } },
      font: { family: 'inherit', color: palette.font_color },
    };
    // 统一刻度格式
    const tickStyle = {
      exponentformat: 'power',
      showexponent: 'all',
      nticks: 8,
      tickfont: { size: 11, color: palette.tickfont_color },
      titlefont: { size: 12, color: palette.font_color },
    };
    if (activeTab === 'multi') {
      base.grid = { rows: 2, columns: 2, pattern: 'independent' };
      base.xaxis = { domain: [0, 0.46], title: 'x', gridcolor: palette.gridcolor, zerolinecolor: palette.zerolinecolor, zerolinewidth: 1.2, ...tickStyle };
      base.yaxis = { domain: [0.54, 1], title: 'y', gridcolor: palette.gridcolor, zerolinecolor: palette.zerolinecolor, zerolinewidth: 1.2, ...tickStyle };
      base.xaxis2 = { domain: [0.54, 1], title: 'x', gridcolor: palette.gridcolor, zerolinecolor: palette.zerolinecolor, zerolinewidth: 1.2, ...tickStyle };
      base.yaxis2 = { domain: [0.54, 1], title: 'y', gridcolor: palette.gridcolor, zerolinecolor: palette.zerolinecolor, zerolinewidth: 1.2, ...tickStyle };
      base.xaxis3 = { domain: [0, 0.46], title: 'x', gridcolor: palette.gridcolor, zerolinecolor: palette.zerolinecolor, zerolinewidth: 1.2, ...tickStyle };
      base.yaxis3 = { domain: [0, 0.46], title: 'y', gridcolor: palette.gridcolor, zerolinecolor: palette.zerolinecolor, zerolinewidth: 1.2, ...tickStyle };
      base.xaxis4 = { domain: [0.54, 1], title: 'x', gridcolor: palette.gridcolor, zerolinecolor: palette.zerolinecolor, zerolinewidth: 1.2, ...tickStyle };
      base.yaxis4 = { domain: [0, 0.46], title: 'y', gridcolor: palette.gridcolor, zerolinecolor: palette.zerolinecolor, zerolinewidth: 1.2, ...tickStyle };
    } else {
      base.xaxis = { gridcolor: palette.gridcolor, zerolinecolor: palette.zerolinecolor, zerolinewidth: 1.2, title: { text: 'x' }, ...tickStyle };
      base.yaxis = { gridcolor: palette.gridcolor, zerolinecolor: palette.zerolinecolor, zerolinewidth: 1.2, title: { text: 'y' }, ...tickStyle };
      if (['parametric', 'polar', 'implicit', 'conic', 'rose', 'animation'].includes(activeTab)) {
        base.yaxis.scaleanchor = 'x';
        base.yaxis.scaleratio = 1;
      }
    }
    return base;
  }, [activeTab, palette]);

  const getData = () => {
    switch (activeTab) {
      case 'cartesian': return cartesianData;
      case 'parametric': return parametricData;
      case 'polar': return polarData;
      case 'implicit': return implicitData;
      case 'conic': return conicPlotData;
      case 'tangent': return tangentData;
      case 'asymptote': return asymptoteData;
      case 'area': return areaData;
      case 'inverse': return inverseData;
      case 'multi': return multiWindowData;
      case 'animation': return animData;
      case 'rose': return roseData;
      default: return [];
    }
  };

  // ===== Plotly traces → ECharts option 转换 =====
  const echartsOption = useMemo(() => {
    const traces = getData();
    if (!traces || traces.length === 0) return {};

    const series: SeriesOption[] = [];
    const xAxisList: any[] = [];
    const yAxisList: any[] = [];

    // 解析 dash 样式
    const parseDash = (dash?: string) => {
      if (!dash) return 'solid';
      if (dash === 'dash') return 'dashed';
      if (dash === 'dot') return 'dotted';
      return 'solid';
    };

    for (const trace of traces) {
      const t = trace as any;
      const name = t.name || '';

      // 处理等高线（隐函数/二次曲线）→ 用散点图画零值附近的点
      if (t.type === 'contour') {
        const xs: number[] = t.x || [];
        const ys: number[] = t.y || [];
        const z: number[][] = t.z || [];
        const lineColor = t.line?.color || palette.line_colors[0];

        // 找出 z 值接近 0 的点，用散点图画出来
        const zeroPts: [number, number][] = [];
        // 自适应阈值：取所有 z 值绝对值的最大值的 2%
        let maxAbsZ = 0;
        for (let j = 0; j < z.length; j++) {
          for (let i = 0; i < z[j].length; i++) {
            const v = Math.abs(z[j][i]);
            if (isFinite(v) && v > maxAbsZ) maxAbsZ = v;
          }
        }
        const threshold = maxAbsZ * 0.02 || 0.1;

        for (let j = 0; j < z.length; j++) {
          for (let i = 0; i < z[j].length; i++) {
            const v = z[j][i];
            if (isFinite(v) && Math.abs(v) < threshold) {
              zeroPts.push([xs[i], ys[j]]);
            }
          }
        }

        series.push({
          type: 'scatter',
          name: '',
          data: zeroPts,
          symbolSize: 5,
          itemStyle: { color: lineColor, opacity: 1 },
          legendHoverLink: false,
        });
        continue;
      }

      // 把 x/y 数组转成二维点数组
      const data: [number, number][] = [];
      if (Array.isArray(t.x) && Array.isArray(t.y)) {
        for (let i = 0; i < t.x.length; i++) {
          const x = t.x[i], y = t.y[i];
          if (isFinite(x) && isFinite(y)) data.push([x, y]);
        }
      }

      // 散点标注（markers / markers+text）
      if (t.mode === 'markers' || t.mode === 'markers+text') {
        const markerColor = Array.isArray(t.marker?.color) ? t.marker.color[0] : (t.marker?.color || '#dc2626');
        const markerSize = t.marker?.size || 8;
        const symbolMap: Record<string, string> = {
          'circle': 'circle', 'diamond': 'rect', 'square': 'rect',
          'triangle-down': 'triangle', 'x': 'triangle',
        };
        const symbol = symbolMap[t.marker?.symbol] || 'circle';

        series.push({
          type: 'scatter',
          name: '',
          data,
          symbolSize: markerSize,
          symbol: symbol as any,
          itemStyle: { color: markerColor },
          legendHoverLink: false,
          label: t.mode === 'markers+text' ? {
            show: true,
            position: 'top',
            fontSize: 10,
            color: t.line?.color || markerColor,
            formatter: (params: any) => {
              const idx = params.dataIndex;
              return t.text?.[idx] || '';
            },
          } : { show: false },
          tooltip: {
            formatter: (params: any) => {
              const idx = params.dataIndex;
              return t.text?.[idx] || t.hovertext?.[idx] || `(${params.value[0]}, ${params.value[1]})`;
            },
          },
        });
        continue;
      }

      // 线条
      const lineColor = t.line?.color || palette.line_colors[0];
      const lineWidth = t.line?.width || 2;
      const lineType = parseDash(t.line?.dash);
      const isTransparent = lineColor === 'transparent' || t.fill;

      const seriesItem: any = {
        type: 'line',
        name,
        data,
        showSymbol: false,
        lineStyle: {
          color: lineColor,
          width: lineWidth,
          type: lineType,
          opacity: isTransparent ? 0 : 1,
        },
        emphasis: { scale: false },
      };

      // 填充面积
      if (t.fill === 'tozeroy' || t.fill === 'tonexty') {
        const fillColor = t.fillcolor || `${lineColor}33`;
        seriesItem.areaStyle = {
          color: fillColor,
          opacity: 0.3,
        };
        seriesItem.lineStyle.opacity = 0;
      }

      // 多坐标系（2×2 子图）
      if (t.xaxis && t.xaxis !== 'x') {
        const axisIdx = parseInt(t.xaxis.replace('x', '')) - 1;
        seriesItem.xAxisIndex = axisIdx;
        seriesItem.yAxisIndex = axisIdx;
      }

      series.push(seriesItem);
    }

    // 构建坐标系
    const isMulti = activeTab === 'multi';
    // 2×2 子图位置（提前定义，grid 配置也要用）
    const positions = [
      { left: '5%', top: '55%', width: '40%', height: '35%' },  // 左下
      { left: '55%', top: '55%', width: '40%', height: '35%' }, // 右下
      { left: '5%', top: '5%', width: '40%', height: '35%' },   // 左上
      { left: '55%', top: '5%', width: '40%', height: '35%' },  // 右上
    ];
    if (isMulti) {
      positions.forEach((pos, i) => {
        xAxisList.push({
          gridIndex: i,
          type: 'value',
          name: 'x',
          grid: pos,
          axisLine: { lineStyle: { color: palette.gridcolor } },
          splitLine: { lineStyle: { color: palette.gridcolor, opacity: 0.5 } },
        });
        yAxisList.push({
          gridIndex: i,
          type: 'value',
          name: 'y',
          axisLine: { lineStyle: { color: palette.gridcolor } },
          splitLine: { lineStyle: { color: palette.gridcolor, opacity: 0.5 } },
        });
      });
    } else {
      // 单坐标系
      const equalScale = ['parametric', 'polar', 'implicit', 'conic', 'rose', 'animation'].includes(activeTab);
      xAxisList.push({
        type: 'value',
        name: 'x',
        scale: equalScale,
        axisLine: { lineStyle: { color: palette.gridcolor } },
        splitLine: { lineStyle: { color: palette.gridcolor, opacity: 0.5 } },
        axisLabel: { fontSize: 11, color: palette.tickfont_color },
      });
      yAxisList.push({
        type: 'value',
        name: 'y',
        scale: equalScale,
        axisLine: { lineStyle: { color: palette.gridcolor } },
        splitLine: { lineStyle: { color: palette.gridcolor, opacity: 0.5 } },
        axisLabel: { fontSize: 11, color: palette.tickfont_color },
      });
    }

    const option: EChartsOption = {
      color: palette.line_colors,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: { backgroundColor: palette.tickfont_color, color: palette.plot_bgcolor, fontSize: 10 },
        },
        backgroundColor: palette.plot_bgcolor,
        borderWidth: 1,
        borderColor: palette.gridcolor,
        textStyle: { color: palette.font_color, fontSize: 12 },
      },
      toolbox: {
        right: 8,
        top: 0,
        iconStyle: { borderColor: palette.tickfont_color },
        feature: {
          dataZoom: { title: { zoom: '框选缩放', back: '撤销缩放' }, brushStyle: { borderColor: palette.line_colors[0] } },
          restore: { title: '重置视图' },
          saveAsImage: { title: '保存图片', pixelRatio: 2, backgroundColor: palette.plot_bgcolor },
        },
      },
      dataZoom: isMulti
        ? undefined
        : [
            { type: 'inside', xAxisIndex: 0, filterMode: 'none', zoomOnMouseWheel: 'ctrl' },
            { type: 'inside', yAxisIndex: 0, filterMode: 'none', zoomOnMouseWheel: 'ctrl' },
          ],
      legend: {
        bottom: 0,
        textStyle: { fontSize: 11, color: palette.font_color },
      },
      grid: isMulti
        ? positions.map(p => ({ ...p }))
        : { left: 60, right: 20, top: 30, bottom: 50 },
      xAxis: xAxisList,
      yAxis: yAxisList,
      series,
      animationDuration: 300,
    };

    return option;
  }, [activeTab, palette, cartesianData, parametricData, polarData, implicitData, conicPlotData, tangentData, asymptoteData, areaData, inverseData, multiWindowData, animData, roseData]);

  const RangeInput = ({ minVal, setMinVal, maxVal, setMaxVal, xLabel, yLabel }: any) => (
    <div className="grid grid-cols-2 gap-3 max-w-xs">
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">{xLabel || 'x 最小值'}</label>
        <Input value={minVal} onChange={(e) => setMinVal(e.target.value)} className="font-mono" />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">{yLabel || 'x 最大值'}</label>
        <Input value={maxVal} onChange={(e) => setMaxVal(e.target.value)} className="font-mono" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="二维绘图"
        description="数学函数可视化：笛卡尔、参数方程、极坐标、隐函数、二次曲线、切线、渐近线、积分面积、反函数、多窗口对比、参数动画、玫瑰线、不等式区域填充。"
        eyebrow="工具 · 可视化"
        width="wide"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-6xl mx-auto space-y-8">
        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap h-auto">
                <TabsTrigger value="cartesian">笛卡尔</TabsTrigger>
                <TabsTrigger value="parametric">参数方程</TabsTrigger>
                <TabsTrigger value="polar">极坐标</TabsTrigger>
                <TabsTrigger value="implicit">隐函数</TabsTrigger>
                <TabsTrigger value="conic">二次曲线</TabsTrigger>
                <TabsTrigger value="tangent">切线</TabsTrigger>
                <TabsTrigger value="asymptote">渐近线</TabsTrigger>
                <TabsTrigger value="area">曲线面积</TabsTrigger>
                <TabsTrigger value="inverse">反函数</TabsTrigger>
                <TabsTrigger value="multi">2×2子图</TabsTrigger>
                <TabsTrigger value="animation">参数动画</TabsTrigger>
                <TabsTrigger value="rose">玫瑰线</TabsTrigger>
                <TabsTrigger value="ineq">不等式区域</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                <TabsContent value="cartesian" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">函数列表 y = f(x)</span>
                    <Button variant="outline" size="sm" onClick={addPlot}>
                      <Plus className="size-3.5 mr-1" />添加
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {plots.map((p, idx) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: palette.line_colors[idx % palette.line_colors.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          {idx === 0 ? (
                            <MathInputField
                              value={p.expr}
                              onChange={(v) => updatePlot(p.id, v)}
                              placeholder="输入表达式，如 sin(x) 或 sqrt(x^2+1)"
                              showPalette
                              defaultPreview
                              label={plots.length > 1 ? '函数 f(x)' : ''}
                            />
                          ) : (
                            <Input
                              value={p.expr}
                              onChange={(e) => updatePlot(p.id, e.target.value)}
                              placeholder="输入表达式，如 sin(x) 或 √(x²+1)"
                              className="font-mono flex-1"
                            />
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => togglePlot(p.id)} className="shrink-0">
                          {p.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removePlot(p.id)} className="shrink-0 text-red-500">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <RangeInput minVal={xMin} setMinVal={setXMin} maxVal={xMax} setMaxVal={setXMax} />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">快捷区间</span>
                    {[
                      ['-2π, 2π', '-2*pi', '2*pi'],
                      ['-5, 5', '-5', '5'],
                      ['-10, 10', '-10', '10'],
                      ['-1, 1', '-1', '1'],
                    ].map(([label, lo, hi]) => (
                      <Button
                        key={label}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => { setXMin(lo); setXMax(hi); }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>

                  {/* 分析功能区 */}
                  <div className="border border-border/60 rounded-xl p-4 space-y-3 bg-muted/30">
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />函数分析
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer transition-colors">
                        <Checkbox checked={showZeros} onCheckedChange={(v) => setShowZeros(v === true)} />
                        <span>零点标注</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer transition-colors">
                        <Checkbox checked={showExtrema} onCheckedChange={(v) => setShowExtrema(v === true)} />
                        <span>极值点</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer transition-colors">
                        <Checkbox checked={showInflection} onCheckedChange={(v) => setShowInflection(v === true)} />
                        <span>拐点</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer transition-colors">
                        <Checkbox checked={showYIntercept} onCheckedChange={(v) => setShowYIntercept(v === true)} />
                        <span>y轴截距</span>
                      </label>
                    </div>
                    <div className="border-t border-border/50 pt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer transition-colors">
                        <Checkbox checked={showDerivative1} onCheckedChange={(v) => setShowDerivative1(v === true)} />
                        <span>一阶导数（虚线）</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer transition-colors">
                        <Checkbox checked={showDerivative2} onCheckedChange={(v) => setShowDerivative2(v === true)} />
                        <span>二阶导数（点线）</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer transition-colors">
                        <Checkbox checked={showIntersections} onCheckedChange={(v) => setShowIntersections(v === true)} />
                        <span>两函数交点</span>
                      </label>
                    </div>

                    {/* 定积分 */}
                    <div className="border-t border-border/50 pt-3 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs transition-colors">
                        <Checkbox checked={showIntegral} onCheckedChange={(v) => setShowIntegral(v === true)} />
                        <span className="font-medium">定积分可视化（面积着色）</span>
                      </label>
                      {showIntegral && (
                        <div className="grid grid-cols-2 gap-3 max-w-xs pl-5">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">下限 a</label>
                            <Input value={integralA} onChange={(e) => setIntegralA(e.target.value)} className="font-mono h-8 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">上限 b</label>
                            <Input value={integralB} onChange={(e) => setIntegralB(e.target.value)} className="font-mono h-8 text-sm" />
                          </div>
                        </div>
                      )}
                      {cartesianIntegralValue && (
                        <div className="pl-5 text-sm bg-primary/10 p-2 rounded-lg font-mono text-primary">
                          ∫f(x)dx ≈ {cartesianIntegralValue}
                        </div>
                      )}
                    </div>

                    {keyPoints.length > 0 && (
                      <div className="border-t border-border/50 pt-3">
                        <div className="mb-2 text-xs font-medium text-muted-foreground">
                          关键点列表（{keyPoints.length}）
                        </div>
                        <div className="max-h-40 overflow-y-auto rounded-lg border border-border/60">
                          <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                              <tr className="text-left text-muted-foreground">
                                <th className="px-2.5 py-1.5 font-medium">类型</th>
                                <th className="px-2.5 py-1.5 font-medium">x</th>
                                <th className="px-2.5 py-1.5 font-medium">y</th>
                              </tr>
                            </thead>
                            <tbody>
                              {keyPoints.map((r, i) => (
                                <tr key={i} className="border-t border-border/40">
                                  <td className="px-2.5 py-1 text-foreground">{r.type}</td>
                                  <td className="px-2.5 py-1 font-mono text-foreground">{formatResult(r.x)}</td>
                                  <td className="px-2.5 py-1 font-mono text-foreground">{formatResult(r.y)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />快速预设
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {PRESETS.map((preset, i) => (
                        <Button key={i} variant="outline" size="sm" onClick={() => {
                          setPlots([{ id: Date.now(), expr: preset.expr, color: palette.line_colors[0], visible: true }]);
                        }}>{preset.name}</Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="parametric" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <MathInputField value={paramX} onChange={setParamX} label="x(t)" showPalette defaultPreview={false} />
                      <MathInputField value={paramY} onChange={setParamY} label="y(t)" showPalette defaultPreview={false} />
                    </div>
                  <RangeInput minVal={tMin} setMinVal={setTMin} maxVal={tMax} setMaxVal={setTMax} xLabel="t 最小值" yLabel="t 最大值" />
                  <div className="flex flex-wrap gap-2">
                    {PARAM_PRESETS.map((p, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => {
                        setParamX(p.xExpr); setParamY(p.yExpr); setTMin(p.tMin); setTMax(p.tMax);
                      }}>{p.name}</Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="polar" className="space-y-4">
                  <MathInputField value={polarExpr} onChange={setPolarExpr} label="r = f(θ) （变量用 t 表示 θ）" showPalette defaultPreview={false} />
                  <RangeInput minVal={polarTMin} setMinVal={setPolarTMin} maxVal={polarTMax} setMaxVal={setPolarTMax} xLabel="θ 最小值" yLabel="θ 最大值" />
                  <div className="flex flex-wrap gap-2">
                    {POLAR_PRESETS.map((p, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => {
                        setPolarExpr(p.expr); setPolarTMin(p.tMin); setPolarTMax(p.tMax);
                      }}>{p.name}</Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="implicit" className="space-y-4">
                  <MathInputField value={implicitExpr} onChange={setImplicitExpr} label="f(x, y) = 0 （输入左侧表达式）" showPalette defaultPreview={false} />
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <RangeInput minVal={impXMin} setMinVal={setImpXMin} maxVal={impXMax} setMaxVal={setImpXMax} />
                    <RangeInput minVal={impYMin} setMinVal={setImpYMin} maxVal={impYMax} setMaxVal={setImpYMax} xLabel="y 最小值" yLabel="y 最大值" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {IMPLICIT_PRESETS.map((p, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => setImplicitExpr(p.expr)}>{p.name}</Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="conic" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    一般二次方程：<span className="font-mono">Ax² + Bxy + Cy² + Dx + Ey + F = 0</span>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { label: 'A', val: conicA, set: setConicA },
                      { label: 'B', val: conicB, set: setConicB },
                      { label: 'C', val: conicC, set: setConicC },
                      { label: 'D', val: conicD, set: setConicD },
                      { label: 'E', val: conicE, set: setConicE },
                      { label: 'F', val: conicF, set: setConicF },
                    ].map((f) => (
                      <div key={f.label}>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">{f.label}</label>
                        <Input value={f.val} onChange={(e) => f.set(e.target.value)} className="font-mono text-center" />
                      </div>
                    ))}
                  </div>
                  {conicResult && (
                    <Card className="bg-muted/60">
                      <CardContent className="p-4 space-y-1 text-sm">
                        <div><span className="font-semibold text-foreground">曲线类型：</span><span className="text-primary font-semibold">{conicResult.type}</span></div>
                        {conicResult.center && <div className="text-foreground">中心：({formatResult(conicResult.center[0])}, {formatResult(conicResult.center[1])})</div>}
                        <div className="text-foreground whitespace-pre-line font-mono text-xs mt-1">{conicResult.standardForm}</div>
                        <div className="text-muted-foreground text-xs font-mono">{conicResult.details}</div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {CONIC_PRESETS.map((p, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => {
                        setConicA(String(p.A)); setConicB(String(p.B)); setConicC(String(p.C));
                        setConicD(String(p.D)); setConicE(String(p.E)); setConicF(String(p.F));
                      }}>{p.name} ({p.desc})</Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tangent" className="space-y-4">
                    <MathInputField value={tangentExpr} onChange={setTangentExpr} label="函数 f(x)" showPalette defaultPreview={false} />
                  <div className="max-w-xs">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">切点 x₀</label>
                    <Input value={tangentX0} onChange={(e) => setTangentX0(e.target.value)} className="font-mono" />
                  </div>
                  <RangeInput minVal={xMin} setMinVal={setXMin} maxVal={xMax} setMaxVal={setXMax} />
                </TabsContent>

                <TabsContent value="asymptote" className="space-y-4">
                    <MathInputField value={asymExpr} onChange={setAsymExpr} label="函数 f(x)" showPalette defaultPreview={false} />
                  <RangeInput minVal={xMin} setMinVal={setXMin} maxVal={xMax} setMaxVal={setXMax} />
                  <div className="text-xs text-muted-foreground">支持检测：垂直渐近线（分母零点）、水平渐近线（x→±∞）、斜渐近线</div>
                </TabsContent>

                <TabsContent value="area" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">上函数 f(x)</label>
                      <Input value={areaF} onChange={(e) => setAreaF(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">下函数 g(x)</label>
                      <Input value={areaG} onChange={(e) => setAreaG(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">左端点 a</label>
                      <Input value={areaA} onChange={(e) => setAreaA(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">右端点 b</label>
                      <Input value={areaB} onChange={(e) => setAreaB(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  {areaValue && (
                    <div className="text-sm bg-muted p-3 rounded-lg border border-border">
                      曲线间面积 S ≈ <span className="font-semibold text-primary">{areaValue}</span>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="inverse" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">函数 f(x) （需在区间内单调才有良好反函数）</label>
                    <Input value={invExpr} onChange={(e) => setInvExpr(e.target.value)} className="font-mono" />
                  </div>
                  <RangeInput minVal={xMin} setMinVal={setXMin} maxVal={xMax} setMaxVal={setXMax} />
                  <div className="text-xs text-muted-foreground">同时绘制 f(x)（绿）、f⁻¹(x)（青）和对称轴 y = x（橙虚线）</div>
                </TabsContent>

                <TabsContent value="multi" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">左上 f₁(x)</label>
                      <Input value={mw1} onChange={(e) => setMw1(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">右上 f₂(x)</label>
                      <Input value={mw2} onChange={(e) => setMw2(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">左下 f₃(x)</label>
                      <Input value={mw3} onChange={(e) => setMw3(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">右下 f₄(x)</label>
                      <Input value={mw4} onChange={(e) => setMw4(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <RangeInput minVal={xMin} setMinVal={setXMin} maxVal={xMax} setMaxVal={setXMax} />
                </TabsContent>

                <TabsContent value="animation" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">x(t)</label>
                      <Input value={animX} onChange={(e) => setAnimX(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">y(t)</label>
                      <Input value={animY} onChange={(e) => setAnimY(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">t 上限滑块 (0 ~ 6.28)</label>
                    <Slider
                      value={[animTMax]}
                      min={0.1}
                      max={6.28}
                      step={0.05}
                      onValueChange={(v) => setAnimTMax(v[0])}
                      className="max-w-md"
                    />
                    <div className="text-xs text-muted-foreground mt-1">t ∈ [0, {animTMax.toFixed(3)}]</div>
                  </div>
                </TabsContent>

                <TabsContent value="rose" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">r = f(θ) （玫瑰线/心形线/螺线等）</label>
                    <Input value={roseExpr} onChange={(e) => setRoseExpr(e.target.value)} className="font-mono" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POLAR_PRESETS.map((p, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => setRoseExpr(p.expr)}>{p.name}</Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ineq" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      不等式（每行一条，最多 3 条）
                    </label>
                    <Textarea
                      value={ineqText}
                      onChange={(e) => setIneqText(e.target.value)}
                      rows={3}
                      className="font-mono"
                      placeholder={'y > x^2\nx^2 + y^2 < 4'}
                      spellCheck={false}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      支持 &lt; &gt; &lt;= &gt;=，变量用 x 和 y；区域自动填充并描出边界
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className="text-sm font-medium text-muted-foreground mb-2 block">x 最小</label><Input value={ineqXMin} onChange={(e) => setIneqXMin(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-muted-foreground mb-2 block">x 最大</label><Input value={ineqXMax} onChange={(e) => setIneqXMax(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-muted-foreground mb-2 block">y 最小</label><Input value={ineqYMin} onChange={(e) => setIneqYMin(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-muted-foreground mb-2 block">y 最大</label><Input value={ineqYMax} onChange={(e) => setIneqYMax(e.target.value)} className="font-mono" /></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="self-center text-xs text-muted-foreground">示例</span>
                    {[
                      { label: '抛物线之间', text: 'y > x^2\ny < 2 - x^2', r: ['-3', '3', '-2', '4'] },
                      { label: '圆盘', text: 'x^2 + y^2 < 4', r: ['-3', '3', '-3', '3'] },
                      { label: '正弦带', text: 'y > sin(x)\ny < 1', r: ['-2*pi', '2*pi', '-2', '2'] },
                      { label: '椭圆', text: 'x^2/9 + y^2/4 <= 1', r: ['-4', '4', '-3', '3'] },
                    ].map((p) => (
                      <Button
                        key={p.label}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIneqText(p.text);
                          setIneqXMin(p.r[0]);
                          setIneqXMax(p.r[1]);
                          setIneqYMin(p.r[2]);
                          setIneqYMax(p.r[3]);
                        }}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        <Card className="shadow-sm overflow-hidden">
           <CardContent className="p-0">
             <div className="w-full">
               {activeTab === 'ineq' && ineqChart && !ineqChart.ok ? (
                 <div className="flex h-[500px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                   {ineqChart.error}
                 </div>
               ) : (
                 <EChart option={activeTab === 'ineq' ? ineqOption : echartsOption} height={500} />
               )}
             </div>
           </CardContent>
         </Card>
      </div>

      <CheatsheetDialog moduleKey="plot2d" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
