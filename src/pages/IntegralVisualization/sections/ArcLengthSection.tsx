import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Ruler, Calculator } from 'lucide-react';
import Plot from '@/lib/plotly-instance';
import { usePlotlyPalette } from '@/lib/plotly-theme';
import { useTheme } from '@/hooks/useTheme';
import { evaluate } from 'mathjs';
import MathRenderer from '@/components/MathRenderer';

interface PresetArc {
  key: string;
  label: string;
  expression: string;
  displayLatex: string;
  defaultA: number;
  defaultB: number;
  color: string;
  // 精确弧长
  arcLengthExact?: (a: number, b: number) => { exact: string; numeric: number } | null;
}

const PRESET_ARCS: PresetArc[] = [
  {
    key: 'x32',
    label: 'y = x^(3/2)',
    expression: 'x^(3/2)',
    displayLatex: 'y = x^{3/2}',
    defaultA: 0,
    defaultB: 4,
    color: '#047857',
    arcLengthExact: (a, b) => {
      // L = ∫√(1+(f')²)dx, f' = (3/2)x^(1/2), f'² = 9x/4
      // L = ∫₀⁴ √(1+9x/4) dx = (8/27)(1+9x/4)^(3/2)
      const F = (x: number) => (8 / 27) * (1 + (9 * x) / 4) ** 1.5;
      const val = F(b) - F(a);
      const exact = `\\dfrac{8}{27}\\left(\\left(1+\\dfrac{9b}{4}\\right)^{3/2} - \\left(1+\\dfrac{9a}{4}\\right)^{3/2}\\right)`;
      return { exact, numeric: val };
    },
  },
  {
    key: 'lnx',
    label: 'y = ln x',
    expression: 'log(x)',
    displayLatex: 'y = \\ln x',
    defaultA: 1,
    defaultB: 2.718,
    color: '#2563eb',
    // f' = 1/x, L = ∫√(1+1/x²)dx = ∫√((x²+1)/x²)dx = ∫√(x²+1)/x dx
    // 结果：√(x²+1) - ln((1+√(x²+1))/x)
    arcLengthExact: (a, b) => {
      const F = (x: number) => {
        const s = Math.sqrt(x * x + 1);
        return s - Math.log((1 + s) / x);
      };
      return {
        exact: `\\left[\\sqrt{x^2+1} - \\ln\\left(\\dfrac{1+\\sqrt{x^2+1}}{x}\\right)\\right]_{${a.toFixed(2)}}^{${b.toFixed(2)}}`,
        numeric: F(b) - F(a),
      };
    },
  },
  {
    key: 'parabola',
    label: 'y = x²/2',
    expression: 'x^2 / 2',
    displayLatex: 'y = \\dfrac{x^2}{2}',
    defaultA: 0,
    defaultB: 2,
    color: '#dc2626',
    // f' = x, L = ∫√(1+x²)dx = (x/2)√(1+x²) + (1/2)sinh⁻¹(x)
    arcLengthExact: (a, b) => {
      const F = (x: number) => {
        const s = Math.sqrt(1 + x * x);
        return (x / 2) * s + 0.5 * Math.log(x + s);
      };
      return {
        exact: `\\left[\\dfrac{x}{2}\\sqrt{1+x^2} + \\dfrac{1}{2}\\ln(x+\\sqrt{1+x^2})\\right]_{${a}}^{${b}}`,
        numeric: F(b) - F(a),
      };
    },
  },
  {
    key: 'quarterCircle',
    label: '1/4 圆弧',
    expression: 'sqrt(1 - x^2)',
    displayLatex: 'y = \\sqrt{1-x^2}',
    defaultA: 0,
    defaultB: 1,
    color: '#d97706',
    arcLengthExact: (a, b) => {
      // 1/4 圆弧：L = (b-a)·r（弧度 = 角度×半径）
      // 角度从 arccos(a/r) 到 arccos(b/r)，r=1
      const val = Math.acos(b) - Math.acos(a); // arccos 递减，所以 b-a 对应的角度差
      return {
        exact: `\\dfrac{\\theta}{2\\pi} \\cdot 2\\pi r = r \\cdot \\Delta\\theta \\quad (r=1)`,
        numeric: Math.abs(val),
      };
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

// 数值导数（中心差分）
function numericDerivative(expr: string, x: number, h = 0.0001): number | null {
  const y1 = safeEval(expr, x - h);
  const y2 = safeEval(expr, x + h);
  if (y1 === null || y2 === null) return null;
  return (y2 - y1) / (2 * h);
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

export default function ArcLengthSection() {
  const palette = usePlotlyPalette();
  const { theme } = useTheme();

  const [selectedPreset, setSelectedPreset] = useState(PRESET_ARCS[0].key);
  const [a, setA] = useState(PRESET_ARCS[0].defaultA);
  const [b, setB] = useState(PRESET_ARCS[0].defaultB);
  const [n, setN] = useState(5); // 折线段数
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const currentFn = useMemo(
    () => PRESET_ARCS.find((p) => p.key === selectedPreset) ?? PRESET_ARCS[0],
    [selectedPreset],
  );

  const selectPreset = useCallback((key: string) => {
    setSelectedPreset(key);
    const p = PRESET_ARCS.find((pf) => pf.key === key);
    if (p) {
      setA(p.defaultA);
      setB(p.defaultB);
    }
  }, []);

  // 精确弧长
  const arcLength = useMemo(() => {
    const expr = currentFn.expression;
    let numeric: number | null = null;
    let exact: string | null = null;

    try {
      // L = ∫ₐᵇ √(1+(f')²) dx
      const integrand = (x: number) => {
        const df = numericDerivative(expr, x);
        if (df === null) return 0;
        return Math.sqrt(1 + df * df);
      };
      numeric = simpson(integrand, a, b, 2000);
      if (!isFinite(numeric)) numeric = null;
    } catch {
      numeric = null;
    }

    if (currentFn.arcLengthExact) {
      const res = currentFn.arcLengthExact(a, b);
      if (res) exact = res.exact;
    }

    return { numeric, exact };
  }, [currentFn, a, b]);

  // 折线逼近长度
  const polygonLength = useMemo(() => {
    const expr = currentFn.expression;
    const dx = (b - a) / n;
    let total = 0;
    for (let i = 0; i < n; i++) {
      const x1 = a + i * dx;
      const x2 = a + (i + 1) * dx;
      const y1 = safeEval(expr, x1);
      const y2 = safeEval(expr, x2);
      if (y1 === null || y2 === null) continue;
      total += Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    return total;
  }, [currentFn, a, b, n]);

  // 折线数据
  const polygonData = useMemo(() => {
    const expr = currentFn.expression;
    const xs: number[] = [];
    const ys: number[] = [];
    const dx = (b - a) / n;
    for (let i = 0; i <= n; i++) {
      const x = a + i * dx;
      const y = safeEval(expr, x);
      xs.push(x);
      ys.push(y ?? 0);
    }
    return { x: xs, y: ys };
  }, [currentFn, a, b, n]);

  // 曲线数据
  const curveData = useMemo(() => {
    const expr = currentFn.expression;
    const range = b - a;
    const xMin = a - range * 0.15;
    const xMax = b + range * 0.15;
    const count = 400;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i <= count; i++) {
      const x = xMin + (i / count) * (xMax - xMin);
      const y = safeEval(expr, x);
      xs.push(x);
      ys.push(y ?? null as unknown as number);
    }
    return { x: xs, y: ys };
  }, [currentFn, a, b]);

  const plotData = useMemo(() => {
    const data: any[] = [
      // 完整曲线
      {
        x: curveData.x,
        y: curveData.y,
        type: 'scatter',
        mode: 'lines',
        name: currentFn.label,
        line: { color: currentFn.color, width: 2.5 },
        hovertemplate: 'x=%{x:.3f}<br>y=%{y:.4f}<extra></extra>',
      },
      // [a,b] 区间高亮
      {
        x: curveData.x.filter((_, i) => {
          const range = b - a;
          const xMin = a - range * 0.15;
          const xMax = b + range * 0.15;
          const x = xMin + (i / (curveData.x.length - 1)) * (xMax - xMin);
          return x >= a && x <= b;
        }),
        y: curveData.y.filter((_, i) => {
          const range = b - a;
          const xMin = a - range * 0.15;
          const xMax = b + range * 0.15;
          const x = xMin + (i / (curveData.x.length - 1)) * (xMax - xMin);
          return x >= a && x <= b;
        }),
        type: 'scatter',
        mode: 'lines',
        line: { color: currentFn.color, width: 4 },
        showlegend: false,
        hoverinfo: 'skip',
      },
      // 折线逼近
      {
        x: polygonData.x,
        y: polygonData.y,
        type: 'scatter',
        mode: 'lines+markers',
        name: `折线 (n=${n})`,
        line: {
          color: theme === 'dark' ? '#fbbf24' : '#d97706',
          width: 2,
          dash: 'dash',
        },
        marker: { color: theme === 'dark' ? '#fbbf24' : '#d97706', size: 5 },
        hovertemplate: '折线段<br>x=%{x:.3f}<br>y=%{y:.4f}<extra></extra>',
      },
    ];
    return data;
  }, [currentFn, curveData, polygonData, n, theme]);

  const layout = useMemo(
    () => ({
      plot_bgcolor: palette.plot_bgcolor,
      paper_bgcolor: palette.paper_bgcolor,
      font: { color: palette.font_color, family: 'sans-serif', size: 12 },
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
      margin: { t: 20, r: 20, b: 40, l: 50 },
      showlegend: true,
      legend: {
        orientation: 'h',
        y: -0.15,
        font: { size: 11 },
      },
      hovermode: 'closest',
    }),
    [palette],
  );

  // 动画
  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    let current = n;
    const end = 200;
    const step = 1;
    const animate = () => {
      current += step;
      if (current >= end) {
        setN(end);
        setIsAnimating(false);
        return;
      }
      setN(current);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [isAnimating, n]);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopAnimation();
    setN(5);
  }, [stopAnimation]);

  useEffect(() => () => stopAnimation(), [stopAnimation]);

  const error = arcLength.numeric ? Math.abs(polygonLength - arcLength.numeric) : 0;
  const errorPct = arcLength.numeric && arcLength.numeric > 0 ? (error / arcLength.numeric) * 100 : 0;

  // 弧长公式
  const formulaLatex = `L = \\int_{${a.toFixed(1)}}^{${b.toFixed(1)}} \\sqrt{1 + [f'(x)]^2} \\, dx`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Ruler className="size-4 text-primary" />
                选择曲线
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_ARCS.map((p) => (
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
              <CardTitle className="text-base font-semibold">区间 [a, b]</CardTitle>
              <CardDescription className="text-xs">调整弧长计算范围</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">a</span>
                  <span className="font-mono tabular-nums font-medium">{a.toFixed(2)}</span>
                </div>
                <Slider
                  value={[a]}
                  onValueChange={(v) => { if (v[0] < b - 0.1) setA(v[0]); }}
                  min={-3}
                  max={3}
                  step={0.05}
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
                  onValueChange={(v) => { if (v[0] > a + 0.1) setB(v[0]); }}
                  min={-3}
                  max={5}
                  step={0.05}
                  className="[&_[role=slider]]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">折线逼近</CardTitle>
              <CardDescription className="text-xs">增加段数，观察折线趋近曲线</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">段数 n</span>
                  <span className="font-mono tabular-nums font-medium">{n}</span>
                </div>
                <Slider
                  value={[n]}
                  onValueChange={(v) => {
                    stopAnimation();
                    setN(v[0]);
                  }}
                  min={1}
                  max={200}
                  step={1}
                  className="[&_[role=slider]]:bg-amber-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={isAnimating ? stopAnimation : startAnimation}
                  className="flex-1"
                >
                  {isAnimating ? (
                    <><Pause className="size-3.5 mr-1.5" />暂停</>
                  ) : (
                    <><Play className="size-3.5 mr-1.5" />播放收敛</>
                  )}
                </Button>
                <Button size="sm" variant="ghost" onClick={reset}>
                  <RotateCcw className="size-3.5 mr-1.5" />重置
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧 */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                曲线弧长演示
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {currentFn.label}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Plot
                  data={plotData}
                  layout={layout}
                  useResizeHandler
                  style={{ width: '100%', height: 400 }}
                  config={{ responsive: true, displayModeBar: false }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 弧长结果 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="size-4 text-primary" />
                弧长结果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent/50 rounded-xl p-5">
                <div className="text-xs text-muted-foreground mb-3">弧长公式</div>
                <div className="text-center">
                  <MathRenderer expression={formulaLatex} displayMode />
                </div>
              </div>

              {arcLength.exact && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="text-xs text-primary mb-2">精确值</div>
                  <div className="text-center">
                    <MathRenderer expression={arcLength.exact} displayMode />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-1">精确弧长（辛普森法）</div>
                  <div className="text-2xl font-bold text-foreground tabular-nums font-mono">
                    {arcLength.numeric?.toFixed(6) ?? '—'}
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200/60 dark:border-amber-800/40">
                  <div className="text-xs text-amber-700 dark:text-amber-400 mb-1">
                    折线逼近（n={n}）
                  </div>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums font-mono">
                    {polygonLength.toFixed(6)}
                  </div>
                  <div className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                    误差：{error.toFixed(6)} ({errorPct.toFixed(4)}%)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
