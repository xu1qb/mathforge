import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import MathInputField from '@/components/MathInputField';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Sparkles } from 'lucide-react';
import Plot from 'react-plotly.js';
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
      return [{ z: data.z, x: data.x, y: data.y, type: 'surface', colorscale: 'Viridis' as const, name: `z = ${expr}`, showscale: false }];
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [expr, xMin, xMax, yMin, yMax, activeTab]);

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
      // 截面 z=k：在等高线上标 z=k 的线
      return [
        { z: data.z, x: data.x, y: data.y, type: 'surface', colorscale: 'Viridis' as const, name: '曲面', opacity: 0.7, showscale: false },
        { z: data.z, x: data.x, y: data.y, type: 'contour', contours: { start: sectionK, end: sectionK, size: 0.01 }, showscale: false, line: { color: '#dc2626', width: 4 }, name: `z = ${sectionK.toFixed(2)}`, ncontours: 1 },
      ];
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
      <PageHeader
        title="三维曲面"
        description="二元函数 3D 可视化：显式曲面、二次曲面库、旋转曲面、参数曲面、截面切片、法向量场、二次曲面类型识别。"
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
                  <div className="flex items-center gap-4">
                    <Button onClick={() => setContours(!contours)} variant={contours ? 'default' : 'outline'} className={contours ? 'bg-primary hover:bg-primary/90' : ''}>
                      {contours ? '✓ ' : ''}等高线模式
                    </Button>
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
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        <Card className="shadow-sm overflow-hidden">
           <CardContent className="p-0">
             <div className="w-full min-h-[500px] md:min-h-[550px]">
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
