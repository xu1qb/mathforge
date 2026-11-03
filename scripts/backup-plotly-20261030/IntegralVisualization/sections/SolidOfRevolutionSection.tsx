import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Calculator } from 'lucide-react';
import Plot from 'react-plotly.js';
import { usePlotlyPalette } from '@/lib/plotly-theme';
import { evaluate } from 'mathjs';
import MathRenderer from '@/components/MathRenderer';

interface PresetSolid {
  key: string;
  label: string;
  expression: string;
  displayLatex: string;
  defaultA: number;
  defaultB: number;
  color: string;
  // 精确体积（绕 x 轴）：V = π∫ₐᵇ f²(x)dx 的精确表达式 + 数值
  volumeXExact?: (a: number, b: number) => { exact: string; numeric: number } | null;
  // 精确体积（绕 y 轴柱壳法）：V = 2π∫ₐᵇ x·f(x)dx
  volumeYExact?: (a: number, b: number) => { exact: string; numeric: number } | null;
}

const PRESET_SOLIDS: PresetSolid[] = [
  {
    key: 'x2',
    label: 'y = x²',
    expression: 'x^2',
    displayLatex: 'y = x^2',
    defaultA: 0,
    defaultB: 1,
    color: '#047857',
    volumeXExact: (a, b) => {
      // V = π ∫ x^4 dx = π x^5/5
      const val = Math.PI * (b ** 5 - a ** 5) / 5;
      return { exact: `\\dfrac{\\pi}{5}\\left(${b}^5 - ${a}^5\\right)`, numeric: val };
    },
    volumeYExact: (a, b) => {
      // V = 2π ∫ x·x² dx = 2π ∫ x^3 dx = 2π x^4/4 = π x^4/2
      const val = Math.PI * (b ** 4 - a ** 4) / 2;
      return { exact: `\\dfrac{\\pi}{2}\\left(${b}^4 - ${a}^4\\right)`, numeric: val };
    },
  },
  {
    key: 'sqrt',
    label: 'y = √x',
    expression: 'sqrt(x)',
    displayLatex: 'y = \\sqrt{x}',
    defaultA: 0,
    defaultB: 4,
    color: '#2563eb',
    volumeXExact: (a, b) => {
      // V = π ∫ x dx = π x²/2
      const val = Math.PI * (b * b - a * a) / 2;
      return { exact: `\\dfrac{\\pi}{2}\\left(${b}^2 - ${a}^2\\right)`, numeric: val };
    },
    volumeYExact: (a, b) => {
      // V = 2π ∫ x·√x dx = 2π ∫ x^(3/2) dx = 2π · (2/5)x^(5/2) = 4π/5 · x^(5/2)
      const val = (4 * Math.PI / 5) * (b ** 2.5 - a ** 2.5);
      return { exact: `\\dfrac{4\\pi}{5}\\left(${b}^{5/2} - ${a}^{5/2}\\right)`, numeric: val };
    },
  },
  {
    key: 'sin',
    label: 'y = sin(x)',
    expression: 'sin(x)',
    displayLatex: 'y = \\sin(x)',
    defaultA: 0,
    defaultB: Math.PI,
    color: '#dc2626',
    volumeXExact: (a, b) => {
      // V = π ∫ sin²(x)dx = π · [x/2 - sin(2x)/4]
      const val = Math.PI * ((b / 2 - Math.sin(2 * b) / 4) - (a / 2 - Math.sin(2 * a) / 4));
      return { exact: `\\pi\\left[\\dfrac{x}{2} - \\dfrac{\\sin(2x)}{4}\\right]_{${a}}^{${b}}`, numeric: val };
    },
  },
  {
    key: '1-x2',
    label: 'y = 1-x²',
    expression: '1 - x^2',
    displayLatex: 'y = 1 - x^2',
    defaultA: 0,
    defaultB: 1,
    color: '#d97706',
    volumeXExact: (a, b) => {
      // V = π ∫ (1-x²)² dx = π ∫ (1-2x²+x⁴) dx = π [x - 2x³/3 + x⁵/5]
      const Fa = a - (2 * a ** 3) / 3 + a ** 5 / 5;
      const Fb = b - (2 * b ** 3) / 3 + b ** 5 / 5;
      const val = Math.PI * (Fb - Fa);
      return { exact: `\\pi\\left[x - \\dfrac{2x^3}{3} + \\dfrac{x^5}{5}\\right]_{${a}}^{${b}}`, numeric: val };
    },
    volumeYExact: (a, b) => {
      // V = 2π ∫ x(1-x²) dx = 2π ∫ (x-x³) dx = 2π [x²/2 - x⁴/4]
      const Fa = a * a / 2 - a ** 4 / 4;
      const Fb = b * b / 2 - b ** 4 / 4;
      const val = 2 * Math.PI * (Fb - Fa);
      return { exact: `2\\pi\\left[\\dfrac{x^2}{2} - \\dfrac{x^4}{4}\\right]_{${a}}^{${b}}`, numeric: val };
    },
  },
];

function safeEval(expr: string, x: number): number | null {
  try {
    const val = evaluate(expr, { x });
    if (typeof val === 'number' && isFinite(val)) return val;
    return null;
  } catch {
    return null;
  }
}

function simpson(f: (x: number) => number, a: number, b: number, n = 1000): number {
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }
  return (h / 3) * sum;
}

export default function SolidOfRevolutionSection() {
  const palette = usePlotlyPalette();

  const [selectedPreset, setSelectedPreset] = useState(PRESET_SOLIDS[0].key);
  const [a, setA] = useState(PRESET_SOLIDS[0].defaultA);
  const [b, setB] = useState(PRESET_SOLIDS[0].defaultB);
  const [axis, setAxis] = useState<'x' | 'y'>('x'); // 旋转轴
  const [slices, setSlices] = useState(20); // 切片层数
  const [showFull, setShowFull] = useState(true); // 是否显示完整旋转体

  const currentFn = useMemo(
    () => PRESET_SOLIDS.find((p) => p.key === selectedPreset) ?? PRESET_SOLIDS[0],
    [selectedPreset],
  );

  const selectPreset = useCallback((key: string) => {
    setSelectedPreset(key);
    const p = PRESET_SOLIDS.find((pf) => pf.key === key);
    if (p) {
      setA(p.defaultA);
      setB(p.defaultB);
    }
  }, []);

  // 体积计算
  const volume = useMemo(() => {
    const expr = currentFn.expression;
    let numeric: number | null = null;
    let exact: string | null = null;

    try {
      if (axis === 'x') {
        // V = π ∫ₐᵇ f²(x)dx
        const integrand = (x: number) => {
          const y = safeEval(expr, x);
          return y === null ? 0 : y * y;
        };
        numeric = Math.PI * simpson(integrand, a, b, 2000);
      } else {
        // 柱壳法 V = 2π ∫ₐᵇ x·f(x)dx
        const integrand = (x: number) => {
          const y = safeEval(expr, x);
          return y === null ? 0 : x * y;
        };
        numeric = 2 * Math.PI * simpson(integrand, a, b, 2000);
      }
      if (!isFinite(numeric)) numeric = null;
    } catch {
      numeric = null;
    }

    // 精确值
    if (axis === 'x' && currentFn.volumeXExact) {
      const res = currentFn.volumeXExact(a, b);
      if (res) exact = res.exact;
    } else if (axis === 'y' && currentFn.volumeYExact) {
      const res = currentFn.volumeYExact(a, b);
      if (res) exact = res.exact;
    }

    return { numeric, exact };
  }, [currentFn, a, b, axis]);

  // 生成 3D 旋转体数据（用 plotly 3D surface）
  const plotData3D = useMemo(() => {
    const expr = currentFn.expression;
    const nTheta = showFull ? (slices < 10 ? slices + 1 : slices) : 2; // 切片数 = 层数 + 1
    const nX = 50;

    const xs: number[] = [];
    const thetas: number[] = [];
    for (let i = 0; i <= nX; i++) {
      xs.push(a + (i / nX) * (b - a));
    }
    for (let j = 0; j <= nTheta; j++) {
      thetas.push((j / nTheta) * Math.PI * 2);
    }

    // z = f(x) * cos(theta), y = f(x) * sin(theta), x = x
    const x: number[][] = [];
    const y: number[][] = [];
    const z: number[][] = [];

    for (let j = 0; j <= nTheta; j++) {
      const theta = thetas[j];
      const xRow: number[] = [];
      const yRow: number[] = [];
      const zRow: number[] = [];
      for (let i = 0; i <= nX; i++) {
        const xi = xs[i];
        const fval = Math.abs(safeEval(expr, xi) ?? 0);
        xRow.push(xi);
        if (axis === 'x') {
          yRow.push(fval * Math.cos(theta));
          zRow.push(fval * Math.sin(theta));
        } else {
          // 绕 y 轴：半径 = x，高度 = f(x)
          const radius = xi;
          yRow.push(fval);
          zRow.push(radius * Math.sin(theta));
        }
      }
      x.push(xRow);
      y.push(yRow);
      z.push(zRow);
    }

    const color = currentFn.color;
    const colorscale = [
      [0, color + '66'],
      [0.5, color + 'aa'],
      [1, color + 'dd'],
    ];

    return [
      {
        type: 'surface',
        x,
        y,
        z,
        colorscale,
        showscale: false,
        opacity: showFull ? 0.75 : 0.9,
        lighting: { ambient: 0.6, diffuse: 0.8, specular: 0.2 },
        contours: {
          x: { highlight: false },
          y: { highlight: false },
          z: { highlight: false },
        },
      },
    ];
  }, [currentFn, a, b, axis, slices, showFull]);

  // 2D 截面图（参考曲线）
  const plotData2D = useMemo(() => {
    const expr = currentFn.expression;
    const range = b - a;
    const xMin = a - range * 0.15;
    const xMax = b + range * 0.15;
    const count = 300;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i <= count; i++) {
      const x = xMin + (i / count) * (xMax - xMin);
      const y = safeEval(expr, x);
      xs.push(x);
      ys.push(y ?? null as unknown as number);
    }

    // 面积填充（只在 [a,b]）
    const areaX: number[] = [];
    const areaY: number[] = [];
    const areaCount = 100;
    for (let i = 0; i <= areaCount; i++) {
      const x = a + (i / areaCount) * (b - a);
      const y = safeEval(expr, x);
      areaX.push(x);
      areaY.push(y ?? null as unknown as number);
    }

    return [
      {
        x: xs,
        y: ys,
        type: 'scatter',
        mode: 'lines',
        name: currentFn.label,
        line: { color: currentFn.color, width: 2.5 },
        hovertemplate: 'x=%{x:.3f}<br>y=%{y:.4f}<extra></extra>',
      },
      {
        x: areaX,
        y: areaY,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        line: { color: currentFn.color, width: 0 },
        fillcolor: `${currentFn.color}33`,
        showlegend: false,
        hoverinfo: 'skip',
      },
    ];
  }, [currentFn, a, b]);

  const layout3D = useMemo(
    () => ({
      plot_bgcolor: palette.plot_bgcolor,
      paper_bgcolor: palette.paper_bgcolor,
      font: { color: palette.font_color, family: 'sans-serif', size: 11 },
      scene: {
        xaxis: {
          title: { text: 'x', font: { size: 10 } },
          gridcolor: palette.gridcolor,
          zerolinecolor: palette.zerolinecolor,
          tickfont: { color: palette.tickfont_color, size: 9 },
        },
        yaxis: {
          title: { text: axis === 'x' ? 'y' : '旋转方向', font: { size: 10 } },
          gridcolor: palette.gridcolor,
          zerolinecolor: palette.zerolinecolor,
          tickfont: { color: palette.tickfont_color, size: 9 },
        },
        zaxis: {
          title: { text: axis === 'x' ? 'z' : 'f(x)', font: { size: 10 } },
          gridcolor: palette.gridcolor,
          zerolinecolor: palette.zerolinecolor,
          tickfont: { color: palette.tickfont_color, size: 9 },
        },
        bgcolor: palette.plot_bgcolor,
        camera: {
          eye: { x: 1.6, y: 1.6, z: 1.2 },
        },
      },
      margin: { t: 10, r: 10, b: 10, l: 10 },
      showlegend: false,
    }),
    [palette, axis],
  );

  const layout2D = useMemo(
    () => ({
      plot_bgcolor: palette.plot_bgcolor,
      paper_bgcolor: palette.paper_bgcolor,
      font: { color: palette.font_color, family: 'sans-serif', size: 11 },
      xaxis: {
        gridcolor: palette.gridcolor,
        zerolinecolor: palette.zerolinecolor,
        tickfont: { color: palette.tickfont_color },
      },
      yaxis: {
        gridcolor: palette.gridcolor,
        zerolinecolor: palette.zerolinecolor,
        tickfont: { color: palette.tickfont_color },
        scaleanchor: 'x',
        scaleratio: 1,
      },
      margin: { t: 10, r: 10, b: 30, l: 40 },
      showlegend: false,
    }),
    [palette],
  );

  // 体积公式 LaTeX
  const formulaLatex = axis === 'x'
    ? `V = \\pi \\int_{${a.toFixed(1)}}^{${b.toFixed(1)}} [${currentFn.displayLatex.replace('y = ', '')}]^2 \\, dx`
    : `V = 2\\pi \\int_{${a.toFixed(1)}}^{${b.toFixed(1)}} x \\cdot (${currentFn.displayLatex.replace('y = ', '')}) \\, dx`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                选择函数
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SOLIDS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => selectPreset(p.key)}
                    className={`px-3 py-2 text-left rounded-lg border transition-all text-sm ${
                      selectedPreset === p.key
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border hover:border-primary/40 hover:bg-accent/50'
                    }`}
                  >
                    <span className="block text-xs font-mono opacity-80">{p.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="size-4 text-primary" />
                旋转轴
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs value={axis} onValueChange={(v) => setAxis(v as 'x' | 'y')}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="x" className="text-sm">绕 x 轴</TabsTrigger>
                  <TabsTrigger value="y" className="text-sm">绕 y 轴</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                {axis === 'x' ? '圆盘法：垂直切片绕 x 轴旋转' : '柱壳法：竖直薄壳绕 y 轴旋转'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">区间 [a, b]</CardTitle>
              <CardDescription className="text-xs">拖拽滑块调整上下限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">a</span>
                  <span className="font-mono tabular-nums font-medium">{a.toFixed(2)}</span>
                </div>
                <Slider
                  value={[a]}
                  onValueChange={(v) => { if (v[0] < b) setA(v[0]); }}
                  min={-5}
                  max={5}
                  step={0.1}
                  className="[&_[role=slider]]:bg-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">b</span>
                  <span className="font-mono tabular-nums font-medium">{b.toFixed(2)}</span>
                </div>
                <Slider
                  value={[b]}
                  onValueChange={(v) => { if (v[0] > a) setB(v[0]); }}
                  min={-5}
                  max={5}
                  step={0.1}
                  className="[&_[role=slider]]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">切片演示</CardTitle>
              <CardDescription className="text-xs">观察层数增加时旋转体的形成过程</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">显示完整旋转体</span>
                <Button
                  variant={showFull ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setShowFull((s) => !s)}
                >
                  {showFull ? '完整' : '切片'}
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">切片层数</span>
                  <span className="font-mono tabular-nums font-medium">{slices}</span>
                </div>
                <Slider
                  value={[slices]}
                  onValueChange={(v) => setSlices(v[0])}
                  min={2}
                  max={50}
                  step={1}
                  className="[&_[role=slider]]:bg-amber-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：3D + 2D + 结果 */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                旋转体 3D 视图
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {currentFn.label} 绕 {axis} 轴
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Plot
                  data={plotData3D}
                  layout={layout3D}
                  useResizeHandler
                  style={{ width: '100%', height: 380 }}
                  config={{ responsive: true, displayModeBar: false }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 截面曲线 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">截面曲线</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Plot
                  data={plotData2D}
                  layout={layout2D}
                  useResizeHandler
                  style={{ width: '100%', height: 200 }}
                  config={{ responsive: true, displayModeBar: false }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 体积结果 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="size-4 text-primary" />
                体积结果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent/50 rounded-xl p-5">
                <div className="text-xs text-muted-foreground mb-3">旋转体体积公式</div>
                <div className="text-center">
                  <MathRenderer expression={formulaLatex} displayMode />
                </div>
              </div>

              {volume.exact && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="text-xs text-primary mb-2">精确值</div>
                  <div className="text-center">
                    <MathRenderer expression={volume.exact} displayMode />
                  </div>
                </div>
              )}

              {volume.numeric !== null && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-1">数值结果（辛普森法）</div>
                  <div className="text-2xl font-bold text-foreground tabular-nums font-mono">
                    {volume.numeric.toFixed(6)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ≈ {volume.numeric.toFixed(4)} 立方单位
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
