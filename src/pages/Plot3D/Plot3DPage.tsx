import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import MathInputField from '@/components/MathInputField';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import PageShell from '@/components/PageShell';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Sparkles } from 'lucide-react';
import Plot, { Plotly } from '@/lib/plotly-instance';
import { usePlotlyPalette } from '@/lib/plotly-theme';
import { evaluate } from 'mathjs';
import {
  sampleSurface, QUADRIC_SURFACES, sampleSurfaceOfRevolution,
  sampleParametricSurface, normalVectors, identifyQuadric,
  sampleImplicitSurfaceMarching,
  adaptiveSamplePoints3D,
} from '@/lib/math-utils';

const SURFACE_PRESETS = [
  { name: '马鞍面 z = x² - y²', expr: 'x^2 - y^2', xMin: '-5', xMax: '5', yMin: '-5', yMax: '5' },
  { name: '钟形面 z = e^-(x²+y²)', expr: 'exp(-(x^2 + y^2))', xMin: '-3', xMax: '3', yMin: '-3', yMax: '3' },
  { name: 'sin(r)/r', expr: 'sin(sqrt(x^2+y^2)) / (sqrt(x^2+y^2) + 0.001)', xMin: '-10', xMax: '10', yMin: '-10', yMax: '10' },
  { name: 'z = sin(x)cos(y)', expr: 'sin(x) * cos(y)', xMin: '-2*pi', xMax: '2*pi', yMin: '-2*pi', yMax: '2*pi' },
];

const ROTATION_PRESETS = [
  { name: 'y=x² 绕x轴', expr: 'x^2', xMin: '-2', xMax: '2', axis: 'x' as const },
  { name: 'y=sin(x) 绕x轴', expr: 'sin(x)', xMin: '0', xMax: '2*pi', axis: 'x' as const },
  { name: 'y=1/x 绕y轴', expr: '1/x', xMin: '0.5', xMax: '3', axis: 'y' as const },
];

const PARAM_PRESETS = [
  { name: '环面', x: '(2 + cos(v)) * cos(u)', y: '(2 + cos(v)) * sin(u)', z: 'sin(v)', uMin: '0', uMax: '2*pi', vMin: '0', vMax: '2*pi' },
  { name: '螺旋面', x: 'u * cos(v)', y: 'u * sin(v)', z: 'v', uMin: '0', uMax: '3', vMin: '0', vMax: '4*pi' },
  { name: '球面(参数)', x: 'cos(u)*sin(v)', y: 'sin(u)*sin(v)', z: 'cos(v)', uMin: '0', uMax: '2*pi', vMin: '0', vMax: 'pi' },
];

const QUADRIC_PRESETS = [
  { name: '球 (x²+y²+z²=1)', A: 1, B: 1, C: 1, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0, J: -1 },
  { name: '单叶双曲面', A: 1, B: 1, C: -1, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0, J: -1 },
  { name: '椭圆抛物面', A: 1, B: 1, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: -0.5, J: 0 },
  { name: '马鞍面', A: 1, B: -1, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: -1, J: 0 },
];

/**
 * Marching Squares：在网格 z[j][i] 上提取 z=level 的等值线，返回可直接喂给
 * scatter3d 的带 null 分隔的折线坐标。
 */
function contourAtLevel(x: number[], y: number[], z: number[][], level: number) {
  const px: (number | null)[] = [];
  const py: (number | null)[] = [];
  const pz: (number | null)[] = [];
  const push = (x1: number, y1: number, x2: number, y2: number) => {
    px.push(x1, x2, null);
    py.push(y1, y2, null);
    pz.push(level, level, null);
  };
  const interp = (
    x1: number, y1: number, v1: number,
    x2: number, y2: number, v2: number,
  ): [number, number] => {
    const t = (level - v1) / (v2 - v1 || 1e-12);
    return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
  };
  for (let j = 0; j < y.length - 1; j++) {
    for (let i = 0; i < x.length - 1; i++) {
      const v00 = z[j]?.[i];
      const v10 = z[j]?.[i + 1];
      const v11 = z[j + 1]?.[i + 1];
      const v01 = z[j + 1]?.[i];
      if (![v00, v10, v11, v01].every((v) => Number.isFinite(v))) continue;
      const pts: [number, number][] = [];
      if ((v00 >= level) !== (v10 >= level)) pts.push(interp(x[i], y[j], v00, x[i + 1], y[j], v10));
      if ((v10 >= level) !== (v11 >= level)) pts.push(interp(x[i + 1], y[j], v10, x[i + 1], y[j + 1], v11));
      if ((v11 >= level) !== (v01 >= level)) pts.push(interp(x[i + 1], y[j + 1], v11, x[i], y[j + 1], v01));
      if ((v01 >= level) !== (v00 >= level)) pts.push(interp(x[i], y[j + 1], v01, x[i], y[j], v00));
      if (pts.length === 2) push(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
      else if (pts.length === 4) {
        push(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
        push(pts[2][0], pts[2][1], pts[3][0], pts[3][1]);
      }
    }
  }
  return { x: px, y: py, z: pz };
}

export default function Plot3DPage() {
  const [activeTab, setActiveTab] = useState('explicit');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // explicit
  const [expr, setExpr] = useState('exp(-(x^2 + y^2))');
  const [xMin, setXMin] = useState('-3');
  const [xMax, setXMax] = useState('3');
  const [yMin, setYMin] = useState('-3');
  const [yMax, setYMax] = useState('3');
  const [contours, setContours] = useState(false);

  // quadric library
  const [quadricKey, setQuadricKey] = useState('ellipsoid');

  // implicit surface
  const [impExpr, setImpExpr] = useState('x^2 + y^2 + z^2 - 1');
  const [impMin, setImpMin] = useState('-2');
  const [impMax, setImpMax] = useState('2');

  // surface of revolution
  const [revExpr, setRevExpr] = useState('x^2');
  const [revXMin, setRevXMin] = useState('-2');
  const [revXMax, setRevXMax] = useState('2');
  const [revAxis, setRevAxis] = useState<'x' | 'y'>('x');

  // parametric surface
  const [paramX, setParamX] = useState('(2 + cos(v)) * cos(u)');
  const [paramY, setParamY] = useState('(2 + cos(v)) * sin(u)');
  const [paramZ, setParamZ] = useState('sin(v)');
  const [puMin, setPuMin] = useState('0');
  const [puMax, setPuMax] = useState('2*pi');
  const [pvMin, setPvMin] = useState('0');
  const [pvMax, setPvMax] = useState('2*pi');

  // section plane
  const [sectionK, setSectionK] = useState(0.5);

  // 切平面与法向量
  const [showTangent, setShowTangent] = useState(false);
  const [tanX0, setTanX0] = useState('1');
  const [tanY0, setTanY0] = useState('1');

  // 自动旋转
  const [autoRotate, setAutoRotate] = useState(false);
  const plotBoxRef = useRef<HTMLDivElement>(null);

  // normal vectors
  const [normExpr, setNormExpr] = useState('x^2 + y^2');
  const [normXMin, setNormXMin] = useState('-3');
  const [normXMax, setNormXMax] = useState('3');
  const [normYMin, setNormYMin] = useState('-3');
  const [normYMax, setNormYMax] = useState('3');

  // quadric identify
  const [qA, setQA] = useState('1');
  const [qB, setQB] = useState('1');
  const [qC, setQC] = useState('1');
  const [qD, setQD] = useState('0');
  const [qE, setQE] = useState('0');
  const [qF, setQF] = useState('0');
  const [qG, setQG] = useState('0');
  const [qH, setQH] = useState('0');
  const [qI, setQI] = useState('0');
  const [qJ, setQJ] = useState('-1');

  const palette = usePlotlyPalette();

  // 自动旋转：定时 relayout 相机位置
  useEffect(() => {
    if (!autoRotate) return;
    const el = plotBoxRef.current?.querySelector('.js-plotly-plot') as HTMLElement | null;
    if (!el) return;
    let angle = 1.2;
    const id = window.setInterval(() => {
      angle += 0.035;
      try {
        (Plotly as unknown as { relayout: (el: HTMLElement, update: unknown) => void }).relayout(el, {
          'scene.camera.eye': { x: 1.7 * Math.cos(angle), y: 1.7 * Math.sin(angle), z: 1.0 },
        });
      } catch {
        // ignore
      }
    }, 70);
    return () => window.clearInterval(id);
  }, [autoRotate]);

  const surface3DLayout = useMemo(() => ({
    autosize: true,
    height: 550,
    margin: { l: 0, r: 0, t: 30, b: 0 },
    scene: {
      xaxis: { title: { text: 'x' }, exponentformat: 'power', showexponent: 'all', nticks: 6, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
      yaxis: { title: { text: 'y' }, exponentformat: 'power', showexponent: 'all', nticks: 6, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
      zaxis: { title: { text: 'z' }, exponentformat: 'power', showexponent: 'all', nticks: 6, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
      camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
      bgcolor: palette.plot_bgcolor,
    },
    plot_bgcolor: palette.plot_bgcolor,
    paper_bgcolor: palette.paper_bgcolor,
    font: { color: palette.font_color },
  }), [palette]);

  const contourLayout = useMemo(() => ({
    autosize: true,
    height: 550,
    margin: { l: 50, r: 20, t: 30, b: 50 },
    plot_bgcolor: palette.plot_bgcolor,
    paper_bgcolor: palette.paper_bgcolor,
    font: { color: palette.font_color },
    xaxis: { title: { text: 'x' }, exponentformat: 'power', showexponent: 'all', nticks: 8, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
    yaxis: { title: { text: 'y' }, exponentformat: 'power', showexponent: 'all', nticks: 8, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
  }), [palette]);

  const explicitData = useMemo(() => {
    if (activeTab !== 'explicit') return [];
    setError(null);
    try {
      const xMinV = evaluate(xMin) as number;
      const xMaxV = evaluate(xMax) as number;
      const yMinV = evaluate(yMin) as number;
      const yMaxV = evaluate(yMax) as number;
      const n = adaptiveSamplePoints3D(xMinV, xMaxV, yMinV, yMaxV, 60, 20);
      const data = sampleSurface(expr, xMinV, xMaxV, yMinV, yMaxV, n);
      const traces: any[] = [
        { z: data.z, x: data.x, y: data.y, type: 'surface', colorscale: 'Viridis' as const, name: `z = ${expr}`, showscale: false },
      ];

      // 切平面 + 法向量（在 (x0, y0) 处）
      if (showTangent) {
        const x0 = evaluate(tanX0) as number;
        const y0 = evaluate(tanY0) as number;
        if (Number.isFinite(x0) && Number.isFinite(y0)) {
          const f = (xv: number, yv: number) => {
            const v = evaluate(expr, { x: xv, y: yv });
            return typeof v === 'number' ? v : NaN;
          };
          const h = 1e-5;
          const z0 = f(x0, y0);
          const fx = (f(x0 + h, y0) - f(x0 - h, y0)) / (2 * h);
          const fy = (f(x0, y0 + h) - f(x0, y0 - h)) / (2 * h);
          if ([z0, fx, fy].every((v) => Number.isFinite(v))) {
            const d = Math.min(2, Math.abs(xMaxV - xMinV) / 5, Math.abs(yMaxV - yMinV) / 5) || 1;
            const xg = [x0 - d, x0 + d];
            const yg = [y0 - d, y0 + d];
            const zg = yg.map((yy) => xg.map((xx) => z0 + fx * (xx - x0) + fy * (yy - y0)));
            traces.push({
              type: 'surface',
              x: xg,
              y: yg,
              z: zg,
              colorscale: [[0, '#f59e0b'], [1, '#f59e0b']],
              opacity: 0.55,
              showscale: false,
              name: '切平面',
              hoverinfo: 'skip',
            });
            const norm = Math.sqrt(fx * fx + fy * fy + 1);
            const L = Math.min(2.2, Math.max(1, (Math.abs(xMaxV - xMinV) + Math.abs(yMaxV - yMinV)) / 8));
            traces.push({
              type: 'scatter3d',
              mode: 'lines+markers',
              x: [x0, x0 + (fx / norm) * L],
              y: [y0, y0 + (fy / norm) * L],
              z: [z0, z0 - (1 / norm) * L],
              line: { color: '#dc2626', width: 7 },
              marker: { color: '#dc2626', size: [2, 6] },
              name: '法向量',
            });
            traces.push({
              type: 'scatter3d',
              mode: 'markers',
              x: [x0],
              y: [y0],
              z: [z0],
              marker: { color: '#f59e0b', size: 5 },
              name: '切点',
              hovertext: [`切点 (${Number(x0.toPrecision(4))}, ${Number(y0.toPrecision(4))}, ${Number(z0.toPrecision(4))})`],
              hoverinfo: 'text',
            });
          }
        }
      }
      return traces;
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [expr, xMin, xMax, yMin, yMax, activeTab, showTangent, tanX0, tanY0]);

  const contourData = useMemo(() => {
    if (activeTab !== 'explicit' || !contours || explicitData.length === 0) return [];
    const s = explicitData[0];
    return [{ z: s.z, x: s.x, y: s.y, type: 'contour', colorscale: 'Viridis' as const, name: `z = ${expr}` }];
  }, [contours, explicitData, expr, activeTab]);

  const quadricLibData = useMemo(() => {
    if (activeTab !== 'quadric') return [];
    setError(null);
    try {
      const q = QUADRIC_SURFACES[quadricKey];
      if (!q) return [];
      const n = adaptiveSamplePoints3D(q.xMin, q.xMax, q.yMin, q.yMax, 60, 20);
      const data = sampleSurface(q.expr, q.xMin, q.xMax, q.yMin, q.yMax, n);
      return [{ z: data.z, x: data.x, y: data.y, type: 'surface', colorscale: 'Viridis' as const, name: q.name, showscale: false }];
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [quadricKey, activeTab]);

  const revolutionData = useMemo(() => {
    if (activeTab !== 'revolution') return [];
    setError(null);
    try {
      const a = evaluate(revXMin) as number;
      const b = evaluate(revXMax) as number;
      // 旋转曲面：轴向范围越大，采样点数越少（圆周方向同步减少保持平滑）
      const nRev = adaptiveSamplePoints3D(a, b, 0, Math.abs(b - a), 60, 20);
      const data = sampleSurfaceOfRevolution(revExpr, a, b, revAxis, nRev);
      return [{ z: data.z, x: data.x, y: data.y, type: 'surface', colorscale: 'Viridis' as const, name: `旋转曲面 (绕${revAxis}轴)`, showscale: false }];
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [revExpr, revXMin, revXMax, revAxis, activeTab]);

  const parametricSurfData = useMemo(() => {
    if (activeTab !== 'parametric') return [];
    setError(null);
    try {
      const umin = evaluate(puMin) as number;
      const umax = evaluate(puMax) as number;
      const vmin = evaluate(pvMin) as number;
      const vmax = evaluate(pvMax) as number;
      const nParam = adaptiveSamplePoints3D(umin, umax, vmin, vmax, 60, 20);
      const data = sampleParametricSurface(paramX, paramY, paramZ, umin, umax, vmin, vmax, nParam);
      return [{ z: data.z, x: data.x, y: data.y, type: 'surface', colorscale: 'Viridis' as const, name: '参数曲面', showscale: false }];
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [paramX, paramY, paramZ, puMin, puMax, pvMin, pvMax, activeTab]);

  const normalData = useMemo(() => {
    if (activeTab !== 'normal') return [];
    setError(null);
    try {
      const xMinV = evaluate(normXMin) as number;
      const xMaxV = evaluate(normXMax) as number;
      const yMinV = evaluate(normYMin) as number;
      const yMaxV = evaluate(normYMax) as number;
      const nSurfNorm = adaptiveSamplePoints3D(xMinV, xMaxV, yMinV, yMaxV, 40, 15);
      // 法向量点阵数：大范围时自动降为 3×3 或 4×4，保持视觉清晰
      const nNorm = Math.max(3, Math.round(6 / Math.max(1, Math.log10(Math.max(Math.abs(xMaxV - xMinV), Math.abs(yMaxV - yMinV)) / 10) + 1)));
      const surf = sampleSurface(normExpr, xMinV, xMaxV, yMinV, yMaxV, nSurfNorm);
      const norms = normalVectors(normExpr, xMinV, xMaxV, yMinV, yMaxV, nNorm);
      return [
        { z: surf.z, x: surf.x, y: surf.y, type: 'surface', colorscale: 'Viridis' as const, name: '曲面', opacity: 0.6, showscale: false },
        {
          type: 'cone' as const,
          x: norms.x, y: norms.y, z: norms.z,
          u: norms.u, v: norms.v, w: norms.w,
          colorscale: [[0, '#dc2626'], [1, '#dc2626']],
          sizemode: 'absolute',
          sizeref: 0.3,
          name: '法向量',
          showscale: false,
        },
      ];
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [normExpr, normXMin, normXMax, normYMin, normYMax, activeTab]);

  const sectionData = useMemo(() => {
    if (activeTab !== 'section') return [];
    setError(null);
    try {
      const xMinV = evaluate(xMin) as number;
      const xMaxV = evaluate(xMax) as number;
      const yMinV = evaluate(yMin) as number;
      const yMaxV = evaluate(yMax) as number;
      const nSect = adaptiveSamplePoints3D(xMinV, xMaxV, yMinV, yMaxV, 60, 20);
      const data = sampleSurface(expr, xMinV, xMaxV, yMinV, yMaxV, nSect);
      const traces: any[] = [
        { z: data.z, x: data.x, y: data.y, type: 'surface', colorscale: 'Viridis' as const, name: '曲面', opacity: 0.55, showscale: false },
      ];
      // 切割平面 z = k（半透明灰色）
      traces.push({
        type: 'mesh3d',
        x: [xMinV, xMaxV, xMaxV, xMinV],
        y: [yMinV, yMinV, yMaxV, yMaxV],
        z: [sectionK, sectionK, sectionK, sectionK],
        i: [0, 0],
        j: [1, 2],
        k: [2, 3],
        color: '#64748b',
        opacity: 0.16,
        hoverinfo: 'skip',
        name: '截面平面',
        showlegend: true,
      });
      // 曲面与平面 z=k 的交线（Marching Squares 提取真实三维曲线）
      const curve = contourAtLevel(data.x, data.y, data.z, sectionK);
      if (curve.x.length > 0) {
        traces.push({
          type: 'scatter3d',
          mode: 'lines',
          x: curve.x,
          y: curve.y,
          z: curve.z,
          line: { color: '#dc2626', width: 6 },
          name: `交线 z = ${sectionK.toFixed(2)}`,
        });
      }
      return traces;
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [expr, xMin, xMax, yMin, yMax, sectionK, activeTab]);

  const implicitData = useMemo(() => {
    if (activeTab !== 'implicit') return [];
    setError(null);
    try {
      const minV = evaluate(impMin) as number;
      const maxV = evaluate(impMax) as number;
      // 隐式 3D 体积采样：范围越大网格越稀疏，最少 12×12×12 = 1728 体素
      const spanImp = Math.abs(maxV - minV);
      let N = 30;
      if (spanImp > 10) {
        N = Math.max(12, Math.round(30 / Math.pow(spanImp / 10, 1 / 3)));
      }
      const vol = sampleImplicitSurfaceMarching(impExpr, minV, maxV, minV, maxV, minV, maxV, N);
      // 将 3D 体积数据展平为 1D 数组（isosurface trace 需要）
      // 注意：plotly isosurface 要求 flat 数组，顺序: x 变化最快 -> y -> z
      const nx = vol.x.length, ny = vol.y.length, nz = vol.z.length;
      const flatX: number[] = [];
      const flatY: number[] = [];
      const flatZ: number[] = [];
      const flatV: number[] = [];
      for (let k = 0; k < nz; k++) {
        for (let j = 0; j < ny; j++) {
          for (let i = 0; i < nx; i++) {
            flatX.push(vol.x[i]);
            flatY.push(vol.y[j]);
            flatZ.push(vol.z[k]);
            const v = vol.values[k][j][i];
            flatV.push(isFinite(v) ? v : NaN);
          }
        }
      }
      return [
        {
          type: 'isosurface',
          x: flatX, y: flatY, z: flatZ,
          value: flatV,
          isomin: -0.05,
          isomax: 0.05,
          surface_count: 1,
          colorscale: 'Viridis',
          opacity: 0.85,
          name: 'F(x,y,z)=0',
          showscale: false,
          caps: { x: { show: false }, y: { show: false }, z: { show: false } },
        },
      ];
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [impExpr, impMin, impMax, activeTab]);

  const quadricIdentResult = useMemo(() => {
    if (activeTab !== 'identify') return null;
    try {
      const A = evaluate(qA) as number;
      const B = evaluate(qB) as number;
      const C = evaluate(qC) as number;
      const D = evaluate(qD) as number;
      const E = evaluate(qE) as number;
      const F = evaluate(qF) as number;
      const G = evaluate(qG) as number;
      const H = evaluate(qH) as number;
      const I = evaluate(qI) as number;
      const J = evaluate(qJ) as number;
      return identifyQuadric(A, B, C, D, E, F, G, H, I, J);
    } catch (e) {
      setError(`识别错误: ${(e as Error).message}`);
      return null;
    }
  }, [qA, qB, qC, qD, qE, qF, qG, qH, qI, qJ, activeTab]);

  const getData = () => {
    switch (activeTab) {
      case 'explicit': return contours ? contourData : explicitData;
      case 'quadric': return quadricLibData;
      case 'implicit': return implicitData;
      case 'revolution': return revolutionData;
      case 'parametric': return parametricSurfData;
      case 'normal': return normalData;
      case 'section': return sectionData;
      default: return [];
    }
  };

  const getLayout = () => {
    if (activeTab === 'explicit' && contours) return contourLayout as any;
    return surface3DLayout as any;
  };

  const Range2x2 = ({ xMinV, setXMinV, xMaxV, setXMaxV, yMinV, setYMinV, yMaxV, setYMaxV }: any) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">x 最小</label>
        <Input value={xMinV} onChange={(e) => setXMinV(e.target.value)} className="font-mono" />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">x 最大</label>
        <Input value={xMaxV} onChange={(e) => setXMaxV(e.target.value)} className="font-mono" />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">y 最小</label>
        <Input value={yMinV} onChange={(e) => setYMinV(e.target.value)} className="font-mono" />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">y 最大</label>
        <Input value={yMaxV} onChange={(e) => setYMaxV(e.target.value)} className="font-mono" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="三维曲面"
        description="二元函数 3D 可视化：显式曲面、二次曲面库、旋转曲面、参数曲面、截面切片、法向量场、二次曲面类型识别。"
        eyebrow="工具 · 可视化"
        width="wide"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-6xl mx-auto space-y-8">
        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap h-auto">
                <TabsTrigger value="explicit">显式曲面</TabsTrigger>
                <TabsTrigger value="quadric">二次曲面库</TabsTrigger>
                <TabsTrigger value="implicit">隐式曲面</TabsTrigger>
                <TabsTrigger value="revolution">旋转曲面</TabsTrigger>
                <TabsTrigger value="parametric">参数曲面</TabsTrigger>
                <TabsTrigger value="section">截面显示</TabsTrigger>
                <TabsTrigger value="normal">法向量</TabsTrigger>
                <TabsTrigger value="identify">类型识别</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                  <TabsContent value="explicit" className="space-y-4">
                  <MathInputField
                    value={expr}
                    onChange={setExpr}
                    label="函数 z = f(x, y)"
                    placeholder="如 sin(sqrt(x^2+y^2)) 或 x^2+y^2"
                    showPalette
                    defaultPreview
                  />
                  <Range2x2 xMinV={xMin} setXMinV={setXMin} xMaxV={xMax} setXMaxV={setXMax} yMinV={yMin} setYMinV={setYMin} yMaxV={yMax} setYMaxV={setYMax} />
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button onClick={() => setContours(!contours)} variant={contours ? 'default' : 'outline'} className={contours ? 'bg-primary hover:bg-primary/90' : ''}>
                      {contours ? '✓ ' : ''}等高线模式
                    </Button>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={showTangent} onCheckedChange={(v) => setShowTangent(v === true)} />
                      切平面与法向量
                    </label>
                    {showTangent && (
                      <div className="flex items-end gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">x₀</label>
                          <Input value={tanX0} onChange={(e) => setTanX0(e.target.value)} className="font-mono h-8 w-20 text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">y₀</label>
                          <Input value={tanY0} onChange={(e) => setTanY0(e.target.value)} className="font-mono h-8 w-20 text-sm" />
                        </div>
                        <span className="pb-1.5 text-xs text-muted-foreground">橙色面为切平面，红线为法向量</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />快速预设
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {SURFACE_PRESETS.map((p, i) => (
                        <Button key={i} variant="outline" size="sm" onClick={() => {
                          setExpr(p.expr); setXMin(p.xMin); setXMax(p.xMax); setYMin(p.yMin); setYMax(p.yMax);
                        }}>{p.name}</Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quadric" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">选择二次曲面类型</label>
                    <Select value={quadricKey} onValueChange={setQuadricKey}>
                      <SelectTrigger className="font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(QUADRIC_SURFACES).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.name} — {v.description}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {QUADRIC_SURFACES[quadricKey]?.description}
                  </div>
                </TabsContent>

                <TabsContent value="implicit" className="space-y-4">
                  <MathInputField
                    value={impExpr}
                    onChange={setImpExpr}
                    label="F(x, y, z) = 0 （体积切片法可视化）"
                    showPalette
                    defaultPreview={false}
                  />
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">范围最小</label>
                      <Input value={impMin} onChange={(e) => setImpMin(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">范围最大</label>
                      <Input value={impMax} onChange={(e) => setImpMax(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    使用三个正交平面切片可视化隐式曲面。可尝试：x²+y²+z²-1（球）、x²+y²-z²-1（单叶双曲面）
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUADRIC_PRESETS.map((p, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => {
                        const eq = `${p.A}*x^2 + ${p.B}*y^2 + ${p.C}*z^2 + ${p.J}`;
                        setImpExpr(eq);
                        setImpMin('-2'); setImpMax('2');
                      }}>{p.name}</Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="revolution" className="space-y-4">
                  <MathInputField
                    value={revExpr}
                    onChange={setRevExpr}
                    label="母线 y = f(x)"
                    showPalette
                    defaultPreview={false}
                  />
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">x 最小</label>
                      <Input value={revXMin} onChange={(e) => setRevXMin(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">x 最大</label>
                      <Input value={revXMax} onChange={(e) => setRevXMax(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">旋转轴：</span>
                    <Button
                      variant={revAxis === 'x' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRevAxis('x')}
                      className={revAxis === 'x' ? 'bg-primary hover:bg-primary/90' : ''}
                    >绕 x 轴</Button>
                    <Button
                      variant={revAxis === 'y' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRevAxis('y')}
                      className={revAxis === 'y' ? 'bg-primary hover:bg-primary/90' : ''}
                    >绕 y 轴</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ROTATION_PRESETS.map((p, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => {
                        setRevExpr(p.expr); setRevXMin(p.xMin); setRevXMax(p.xMax); setRevAxis(p.axis);
                      }}>{p.name}</Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="parametric" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <MathInputField value={paramX} onChange={setParamX} label="x(u, v)" showPalette defaultPreview={false} />
                    <MathInputField value={paramY} onChange={setParamY} label="y(u, v)" showPalette defaultPreview={false} />
                    <MathInputField value={paramZ} onChange={setParamZ} label="z(u, v)" showPalette defaultPreview={false} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">u 最小</label>
                      <Input value={puMin} onChange={(e) => setPuMin(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">u 最大</label>
                      <Input value={puMax} onChange={(e) => setPuMax(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">v 最小</label>
                      <Input value={pvMin} onChange={(e) => setPvMin(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">v 最大</label>
                      <Input value={pvMax} onChange={(e) => setPvMax(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PARAM_PRESETS.map((p, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => {
                        setParamX(p.x); setParamY(p.y); setParamZ(p.z);
                        setPuMin(p.uMin); setPuMax(p.uMax); setPvMin(p.vMin); setPvMax(p.vMax);
                      }}>{p.name}</Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="section" className="space-y-4">
                  <MathInputField
                    value={expr}
                    onChange={setExpr}
                    label="函数 z = f(x, y)"
                    showPalette
                    defaultPreview={false}
                  />
                  <Range2x2 xMinV={xMin} setXMinV={setXMin} xMaxV={xMax} setXMaxV={setXMax} yMinV={yMin} setYMinV={setYMin} yMaxV={yMax} setYMaxV={setYMax} />
                  <div className="max-w-md">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">截面 z = k</label>
                    <Slider
                      value={[sectionK]}
                      min={-5}
                      max={5}
                      step={0.1}
                      onValueChange={(v) => setSectionK(v[0])}
                    />
                    <div className="text-xs text-muted-foreground mt-1">z = {sectionK.toFixed(2)}</div>
                  </div>
                </TabsContent>

                <TabsContent value="normal" className="space-y-4">
                  <MathInputField
                    value={normExpr}
                    onChange={setNormExpr}
                    label="曲面 z = f(x, y)"
                    showPalette
                    defaultPreview={false}
                  />
                  <Range2x2 xMinV={normXMin} setXMinV={setNormXMin} xMaxV={normXMax} setXMaxV={setNormXMax} yMinV={normYMin} setYMinV={setNormYMin} yMaxV={normYMax} setYMaxV={setNormYMax} />
                  <div className="text-xs text-muted-foreground">红色箭头表示曲面各点处的单位法向量</div>
                </TabsContent>

                <TabsContent value="identify" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    一般二次曲面方程：<span className="font-mono">Ax²+By²+Cz²+2Dxy+2Exz+2Fyz+2Gx+2Hy+2Iz+J = 0</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { l: 'A', v: qA, s: setQA }, { l: 'B', v: qB, s: setQB },
                      { l: 'C', v: qC, s: setQC }, { l: 'D', v: qD, s: setQD },
                      { l: 'E', v: qE, s: setQE }, { l: 'F', v: qF, s: setQF },
                      { l: 'G', v: qG, s: setQG }, { l: 'H', v: qH, s: setQH },
                      { l: 'I', v: qI, s: setQI }, { l: 'J', v: qJ, s: setQJ },
                    ].map((f) => (
                      <div key={f.l}>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">{f.l}</label>
                        <Input value={f.v} onChange={(e) => f.s(e.target.value)} className="font-mono text-center" />
                      </div>
                    ))}
                  </div>
                  {quadricIdentResult && (
                    <Card className="bg-muted/60">
                      <CardContent className="p-4 space-y-1 text-sm">
                        <div><span className="font-semibold text-foreground">曲面类型：</span><span className="text-primary font-semibold">{quadricIdentResult.type}</span></div>
                        <div className="text-muted-foreground text-xs font-mono whitespace-pre-line">{quadricIdentResult.details}</div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {QUADRIC_PRESETS.map((p, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => {
                        setQA(String(p.A)); setQB(String(p.B)); setQC(String(p.C));
                        setQD(String(p.D)); setQE(String(p.E)); setQF(String(p.F));
                        setQG(String(p.G)); setQH(String(p.H)); setQI(String(p.I)); setQJ(String(p.J));
                      }}>{p.name}</Button>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40">
            <CardContent className="p-4 text-red-700 dark:text-red-400 text-sm">{error}</CardContent>
          </Card>
        )}

        <Card className="shadow-sm overflow-hidden">
           <CardContent className="p-0">
             <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
               <span className="text-xs text-muted-foreground">拖动旋转 · 滚轮缩放 · 双击复位</span>
               <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                 <Checkbox checked={autoRotate} onCheckedChange={(v) => setAutoRotate(v === true)} />
                 自动旋转
               </label>
             </div>
             <div ref={plotBoxRef} className="w-full min-h-[500px] md:min-h-[550px]">
               <Plot
                 data={getData() as any[]}
                 layout={getLayout()}
                 config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                 style={{ width: '100%', height: '100%' }}
                 useResizeHandler
                 className="w-full h-full"
               />
             </div>
           </CardContent>
         </Card>
      </div>

      <CheatsheetDialog moduleKey="plot3d" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
