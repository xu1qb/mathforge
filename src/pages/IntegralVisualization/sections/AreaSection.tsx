import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  Info,
  Calculator,
  AreaChart,
} from 'lucide-react';
import Plot from '@/lib/plotly-instance';
import { usePlotlyPalette } from '@/lib/plotly-theme';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { evaluate } from 'mathjs';
import { cn } from '@/lib/utils';
import MathRenderer from '@/components/MathRenderer';

// 预置函数：表达式 + 显示名 + 精确积分结果（不定积分 F(x) + 定积分数值）
interface PresetFunction {
  key: string;
  label: string;
  expression: string; // math.js 表达式，变量 x
  displayLatex: string; // 展示用 LaTeX
  antiderivative: string; // 原函数（不定积分，不含常数 C）
  // 计算定积分精确值的函数（返回字符串精确形式 + 数值）
  definiteValue: (a: number, b: number) => { exact: string; numeric: number } | null;
  defaultA: number;
  defaultB: number;
  color: string;
}

const PRESET_FUNCTIONS: PresetFunction[] = [
  {
    key: 'x2',
    label: 'f(x) = x²',
    expression: 'x^2',
    displayLatex: 'f(x) = x^2',
    antiderivative: 'x^3 / 3',
    definiteValue: (a, b) => {
      const val = (b ** 3 - a ** 3) / 3;
      // 尝试精确分数表达
      const num = b ** 3 - a ** 3;
      const den = 3;
      return { exact: `\\dfrac{${num}}{${den}}`, numeric: val };
    },
    defaultA: 0,
    defaultB: 2,
    color: '#047857',
  },
  {
    key: 'sin',
    label: 'f(x) = sin(x)',
    expression: 'sin(x)',
    displayLatex: 'f(x) = \\sin(x)',
    antiderivative: '-cos(x)',
    definiteValue: (a, b) => {
      const val = Math.cos(a) - Math.cos(b);
      return { exact: `\\cos(${a}) - \\cos(${b})`, numeric: val };
    },
    defaultA: 0,
    defaultB: Math.PI,
    color: '#dc2626',
  },
  {
    key: 'sqrt',
    label: 'f(x) = √x',
    expression: 'sqrt(x)',
    displayLatex: 'f(x) = \\sqrt{x}',
    antiderivative: '\\frac{2}{3} x^{3/2}',
    definiteValue: (a, b) => {
      const val = (2 / 3) * (b ** (3 / 2) - a ** (3 / 2));
      return {
        exact: `\\dfrac{2}{3} \\left( ${b}^{3/2} - ${a}^{3/2} \\right)`,
        numeric: val,
      };
    },
    defaultA: 0,
    defaultB: 4,
    color: '#2563eb',
  },
  {
    key: '1x2',
    label: 'f(x) = 1/x²',
    expression: '1/x^2',
    displayLatex: 'f(x) = \\dfrac{1}{x^2}',
    antiderivative: '-\\dfrac{1}{x}',
    definiteValue: (a, b) => {
      if (a === 0 || b === 0) return null;
      const val = -1 / b + 1 / a;
      return {
        exact: `\\dfrac{1}{${a}} - \\dfrac{1}{${b}}`,
        numeric: val,
      };
    },
    defaultA: 1,
    defaultB: 3,
    color: '#d97706',
  },
  {
    key: 'x3-3x',
    label: 'f(x) = x³ - 3x',
    expression: 'x^3 - 3*x',
    displayLatex: 'f(x) = x^3 - 3x',
    antiderivative: '\\dfrac{x^4}{4} - \\dfrac{3x^2}{2}',
    definiteValue: (a, b) => {
      const val = b ** 4 / 4 - (3 * b ** 2) / 2 - (a ** 4 / 4 - (3 * a ** 2) / 2);
      return {
        exact: `\\left[\\dfrac{x^4}{4} - \\dfrac{3x^2}{2}\\right]_{${a}}^{${b}}`,
        numeric: val,
      };
    },
    defaultA: -2,
    defaultB: 2,
    color: '#7c3aed',
  },
  {
    key: 'gauss',
    label: 'f(x) = e^{-x²}',
    expression: 'exp(-x^2)',
    displayLatex: 'f(x) = e^{-x^2}',
    antiderivative: '\\text{无初等原函数（误差函数）}',
    definiteValue: () => null, // 无精确初等表达式
    defaultA: -1,
    defaultB: 1,
    color: '#db2777',
  },
];

// 用数值方法（辛普森法）计算定积分数值
function simpsonIntegrate(f: (x: number) => number, a: number, b: number, n = 1000): number {
  // n 必须为偶数
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }
  return (h / 3) * sum;
}

// 安全计算函数值
function safeEval(expr: string, x: number): number | null {
  try {
    const val = evaluate(expr, { x });
    if (typeof val === 'number' && isFinite(val)) return val;
    return null;
  } catch {
    return null;
  }
}

// 生成采样点
function generateSamples(expr: string, a: number, b: number, count = 300): { x: number[]; y: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  const step = (b - a) / count;
  for (let i = 0; i <= count; i++) {
    const x = a + i * step;
    const y = safeEval(expr, x);
    xs.push(x);
    ys.push(y ?? null as unknown as number);
  }
  return { x: xs, y: ys };
}

// 生成 Riemann 和矩形数据
function generateRiemannRects(
  expr: string,
  a: number,
  b: number,
  n: number,
  method: 'left' | 'right' | 'midpoint',
): { x: number[]; y: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  const dx = (b - a) / n;
  for (let i = 0; i < n; i++) {
    const xLeft = a + i * dx;
    const xRight = a + (i + 1) * dx;
    let xEval: number;
    if (method === 'left') xEval = xLeft;
    else if (method === 'right') xEval = xRight;
    else xEval = (xLeft + xRight) / 2;
    const y = safeEval(expr, xEval) ?? 0;
    // 画矩形：左底 → 左顶 → 右顶 → 右底 → null（断开）
    xs.push(xLeft, xLeft, xRight, xRight, null as unknown as number);
    ys.push(0, y, y, 0, null as unknown as number);
  }
  return { x: xs, y: ys };
}

export default function AreaSection() {
  const palette = usePlotlyPalette();
  const { theme } = useTheme();

  const [selectedPreset, setSelectedPreset] = useState(PRESET_FUNCTIONS[0].key);
  const [customExpr, setCustomExpr] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [a, setA] = useState(PRESET_FUNCTIONS[0].defaultA);
  const [b, setB] = useState(PRESET_FUNCTIONS[0].defaultB);

  // Riemann 设置
  const [showRiemann, setShowRiemann] = useState(false);
  const [riemannN, setRiemannN] = useState(10);
  const [riemannMethod, setRiemannMethod] = useState<'left' | 'right' | 'midpoint'>('midpoint');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const currentFn = useMemo(() => {
    if (useCustom && customExpr.trim()) {
      return {
        key: 'custom',
        label: `f(x) = ${customExpr}`,
        expression: customExpr,
        displayLatex: `f(x) = ${customExpr}`,
        antiderivative: '自定义函数（无预存原函数）',
        definiteValue: null,
        defaultA: a,
        defaultB: b,
        color: palette.surface_color,
      };
    }
    return PRESET_FUNCTIONS.find((p) => p.key === selectedPreset) ?? PRESET_FUNCTIONS[0];
  }, [selectedPreset, customExpr, useCustom, a, b, palette.surface_color]);

  // 切换预置函数时重置 a/b
  const selectPreset = useCallback((key: string) => {
    setSelectedPreset(key);
    setUseCustom(false);
    const p = PRESET_FUNCTIONS.find((pf) => pf.key === key);
    if (p) {
      setA(p.defaultA);
      setB(p.defaultB);
    }
  }, []);

  // 积分结果
  const integralResult = useMemo(() => {
    const expr = currentFn.expression;
    // 数值积分（辛普森法）
    let numeric: number | null = null;
    try {
      numeric = simpsonIntegrate((x) => safeEval(expr, x) ?? 0, a, b, 2000);
      if (!isFinite(numeric)) numeric = null;
    } catch {
      numeric = null;
    }

    // 精确形式
    let exact: string | null = null;
    if (!useCustom && currentFn.definiteValue) {
      const res = currentFn.definiteValue(a, b);
      if (res) exact = res.exact;
    }

    return { numeric, exact };
  }, [currentFn, a, b, useCustom]);

  // Riemann 和值
  const riemannSum = useMemo(() => {
    const expr = currentFn.expression;
    const dx = (b - a) / riemannN;
    let sum = 0;
    for (let i = 0; i < riemannN; i++) {
      let xEval: number;
      if (riemannMethod === 'left') xEval = a + i * dx;
      else if (riemannMethod === 'right') xEval = a + (i + 1) * dx;
      else xEval = a + (i + 0.5) * dx;
      const y = safeEval(expr, xEval);
      if (y === null) continue;
      sum += y * dx;
    }
    return sum;
  }, [currentFn, a, b, riemannN, riemannMethod]);

  // Riemann 动画：从当前 n 递增到 100
  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    const start = riemannN;
    const end = 100;
    let current = start;
    const step = 1;
    const animate = () => {
      current += step;
      if (current >= end) {
        setRiemannN(end);
        setIsAnimating(false);
        return;
      }
      setRiemannN(current);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [isAnimating, riemannN]);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const resetAnimation = useCallback(() => {
    stopAnimation();
    setRiemannN(10);
  }, [stopAnimation]);

  useEffect(() => () => stopAnimation(), [stopAnimation]);

  // 图表数据
  const plotData = useMemo(() => {
    // 绘图范围：稍微超出 a,b 显示完整曲线
    const range = b - a;
    const xMin = a - range * 0.15;
    const xMax = b + range * 0.15;
    const curve = generateSamples(currentFn.expression, xMin, xMax, 500);

    // 面积填充（只在 [a,b] 区间）
    const area = generateSamples(currentFn.expression, a, b, 200);

    const data: any[] = [
      // 函数曲线
      {
        x: curve.x,
        y: curve.y,
        type: 'scatter',
        mode: 'lines',
        name: currentFn.label,
        line: { color: currentFn.color, width: 2.5 },
        hovertemplate: 'x=%{x:.3f}<br>y=%{y:.4f}<extra></extra>',
      },
      // 面积填充
      {
        x: area.x,
        y: area.y,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        name: '面积',
        line: { color: currentFn.color, width: 0 },
        fillcolor: `${currentFn.color}33`,
        hoverinfo: 'skip',
        showlegend: false,
      },
    ];

    // Riemann 矩形
    if (showRiemann) {
      const rects = generateRiemannRects(currentFn.expression, a, b, riemannN, riemannMethod);
      data.push({
        x: rects.x,
        y: rects.y,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        name: `Riemann ${riemannMethod}`,
        line: { color: theme === 'dark' ? '#fbbf24' : '#d97706', width: 1.5 },
        fillcolor: theme === 'dark' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(217, 119, 6, 0.15)',
        hoverinfo: 'skip',
        showlegend: false,
      });
    }

    return data;
  }, [currentFn, a, b, showRiemann, riemannN, riemannMethod, theme]);

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
      showlegend: false,
      hovermode: 'closest',
    }),
    [palette],
  );

  // 处理自定义函数输入
  const [customError, setCustomError] = useState('');
  const applyCustom = () => {
    const expr = customExpr.trim();
    if (!expr) {
      toast.info('请输入函数表达式');
      return;
    }
    // 验证
    try {
      const v = evaluate(expr, { x: 1 });
      if (typeof v !== 'number' || !isFinite(v)) {
        setCustomError('x=1 时结果不是有限数，请检查表达式');
        return;
      }
      setCustomError('');
      setUseCustom(true);
      toast.success('已应用自定义函数');
    } catch (e) {
      setCustomError(String((e as Error).message));
    }
  };

  // 定积分表达式（LaTeX）
  const integralLatex = useMemo(() => {
    const aStr = Number.isInteger(a) ? String(a) : a.toFixed(1);
    const bStr = Number.isInteger(b) ? String(b) : b.toFixed(1);
    const body = currentFn.displayLatex.replace('f(x) = ', '');
    return `\int_{${aStr}}^{${bStr}} ${body} \, dx`;
  }, [currentFn, a, b]);

  return (
    <div className="space-y-6">
      {/* 顶部栏 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">定积分面积可视化</h1>
          <p className="text-sm text-muted-foreground mt-1">
            直观理解定积分的几何意义：曲线下面积、黎曼和逼近
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：函数选择 */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="size-4 text-primary" />
                选择函数
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_FUNCTIONS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => selectPreset(p.key)}
                    className={cn(
                      'px-3 py-2 text-left rounded-lg border transition-all text-sm',
                      !useCustom && selectedPreset === p.key
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border hover:border-primary/40 hover:bg-accent/50',
                    )}
                  >
                    <span className="block text-xs font-mono opacity-80">{p.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-border">
                <div className="text-sm font-medium text-foreground mb-2">自定义函数</div>
                <div className="flex gap-2">
                  <Input
                    value={customExpr}
                    onChange={(e) => setCustomExpr(e.target.value)}
                    placeholder="如：x^2 + sin(x)"
                    className="font-mono text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
                  />
                  <Button onClick={applyCustom} size="sm" variant="secondary">
                    应用
                  </Button>
                </div>
                {customError && (
                  <p className="text-xs text-destructive mt-1.5">{customError}</p>
                )}
                {useCustom && (
                  <Badge variant="outline" className="mt-2 text-xs border-primary/40 text-primary">
                    自定义模式
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 积分区间 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AreaChart className="size-4 text-primary" />
                积分区间
              </CardTitle>
              <CardDescription className="text-xs">
                拖动滑块调整上下限，面积实时更新
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">下限 a</span>
                  <span className="font-mono tabular-nums font-medium">{a.toFixed(2)}</span>
                </div>
                <Slider
                  value={[a]}
                  onValueChange={(v) => {
                    const newA = v[0];
                    if (newA < b) setA(newA);
                  }}
                  min={-10}
                  max={10}
                  step={0.1}
                  className="[&_[role=slider]]:bg-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">上限 b</span>
                  <span className="font-mono tabular-nums font-medium">{b.toFixed(2)}</span>
                </div>
                <Slider
                  value={[b]}
                  onValueChange={(v) => {
                    const newB = v[0];
                    if (newB > a) setB(newB);
                  }}
                  min={-10}
                  max={10}
                  step={0.1}
                  className="[&_[role=slider]]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Riemann 设置 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Info className="size-4 text-primary" />
                黎曼和
              </CardTitle>
              <CardDescription className="text-xs">
                用矩形逼近曲线下面积，观察 n 增大时的收敛过程
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">显示黎曼和</span>
                <Button
                  variant={showRiemann ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setShowRiemann((s) => !s)}
                >
                  {showRiemann ? '隐藏' : '显示'}
                </Button>
              </div>

              {showRiemann && (
                <>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">取法</div>
                    <div className="grid grid-cols-3 gap-1">
                      {(['left', 'right', 'midpoint'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setRiemannMethod(m)}
                          className={cn(
                            'px-2 py-1.5 text-xs rounded-md border transition-all',
                            riemannMethod === m
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-border hover:border-primary/40',
                          )}
                        >
                          {m === 'left' ? '左和' : m === 'right' ? '右和' : '中点'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">分割数 n</span>
                      <span className="font-mono tabular-nums font-medium">{riemannN}</span>
                    </div>
                    <Slider
                      value={[riemannN]}
                      onValueChange={(v) => {
                        stopAnimation();
                        setRiemannN(v[0]);
                      }}
                      min={1}
                      max={100}
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
                    <Button size="sm" variant="ghost" onClick={resetAnimation}>
                      <RotateCcw className="size-3.5 mr-1.5" />重置
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：图表 + 结果 */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                曲线下面积
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
                  style={{ width: '100%', height: 420 }}
                  config={{ responsive: true, displayModeBar: false }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 积分结果 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="size-4 text-primary" />
                积分结果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 定积分表达式 */}
              <div className="bg-accent/50 rounded-xl p-5">
                <div className="text-xs text-muted-foreground mb-3">定积分</div>
                <div className="text-center">
                  <MathRenderer expression={integralLatex} displayMode />
                </div>
              </div>

              {/* 精确值 */}
              {integralResult.exact && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="text-xs text-primary mb-2">精确值</div>
                  <div className="text-center">
                    <MathRenderer expression={integralResult.exact} displayMode />
                  </div>
                </div>
              )}

              {/* 数值 */}
              {integralResult.numeric !== null && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">
                      数值近似（辛普森法）
                    </div>
                    <div className="text-2xl font-bold text-foreground tabular-nums font-mono">
                      {integralResult.numeric.toFixed(6)}
                    </div>
                  </div>

                  {showRiemann && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200/60 dark:border-amber-800/40">
                      <div className="text-xs text-amber-700 dark:text-amber-400 mb-1">
                        黎曼和（n={riemannN}）
                      </div>
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums font-mono">
                        {riemannSum.toFixed(6)}
                      </div>
                      <div className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                        误差：{integralResult.numeric ? Math.abs(riemannSum - integralResult.numeric).toFixed(6) : '—'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!integralResult.exact && useCustom && (
                <div className="text-xs text-muted-foreground flex items-start gap-2">
                  <Info className="size-3.5 shrink-0 mt-0.5" />
                  <span>自定义函数使用数值积分（辛普森法，2000 等分），误差一般 ≤ 1e-8</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
