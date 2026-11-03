import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MathInputField from '@/components/MathInputField';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import LearningSection from '@/components/LearningSection';
import { Play, Sparkles, Plus, Minus } from 'lucide-react';
import Plot from '@/lib/plotly-instance';
import { usePlotlyPalette } from '@/lib/plotly-theme';
import { evaluate } from 'mathjs';
import { fourierCoefficients, fourierPartialSum, formatResult } from '@/lib/math-utils';
import { useHistory } from '@/hooks/useHistory';
import HistoryPanel from '@/components/HistoryPanel';
import {
  fourierComplexCoefficients,
  fourierTransform,
  parsevalVerification,
  gibbsPhenomenon,
  spectrumAnalysis,
  fourierSolveODE,
  halfRangeExtension,
  dirichletConvergence,
  convolutionTheorem,
  applyFilter,
  stringVibration,
} from '@/lib/fourier-advanced';
import { dft, samplingTheoremDemo } from '@/lib/math-advanced';

const PRESETS = [
  { name: '方波', expr: '1', period: '2*pi' },
  { name: '锯齿波', expr: 'x', period: '2*pi' },
  { name: '三角波', expr: 'abs(x) - pi/2', period: '2*pi' },
];

export default function FourierSeriesPage() {
  const [activeTab, setActiveTab] = useState('series');
  const palette = usePlotlyPalette();

  // 快速生成带主题的 Plotly 2D layout
  const mkLayout = useCallback((xTitle: string, yTitle: string, height = 400) => ({
    autosize: true,
    height,
    margin: { l: 50, r: 20, t: 30, b: 50 },
    plot_bgcolor: palette.plot_bgcolor,
    paper_bgcolor: palette.paper_bgcolor,
    font: { color: palette.font_color },
    xaxis: { title: { text: xTitle }, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
    yaxis: { title: { text: yTitle }, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
    legend: { orientation: 'h' as const, y: -0.2, font: { color: palette.font_color } },
  }), [palette]);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_fourier_history' });
  const lastHistoryRef = useRef('');

  // ---- 傅里叶级数 ----
  const [expr, setExpr] = useState('1');
  const [period, setPeriod] = useState('2*pi');
  const [nTerms, setNTerms] = useState('5');
  const [numTerms, setNumTerms] = useState(5);

  // ---- FFT / 频谱分析 ----
  const [signalExpr, setSignalExpr] = useState('sin(2*pi*5*t) + 0.5*sin(2*pi*12*t)');
  const [fftFs, setFftFs] = useState('100');
  const [fftN, setFftN] = useState('256');

  // ---- 傅里叶变换 ----
  const [ftExpr, setFtExpr] = useState('exp(-x^2)');
  const [ftTMin, setFtTMin] = useState('-5');
  const [ftTMax, setFtTMax] = useState('5');
  const [ftWMax, setFtWMax] = useState('20');

  // ---- Parseval ----
  const [parsevalExpr, setParsevalExpr] = useState('exp(-x^2)');
  const [parsevalTMin, setParsevalTMin] = useState('-5');
  const [parsevalTMax, setParsevalTMax] = useState('5');

  // ---- 吉布斯 ----
  const [gibbsN, setGibbsN] = useState('20');

  // ---- 傅里叶解 ODE ----
  const [odeA, setOdeA] = useState('0');
  const [odeB, setOdeB] = useState('1');
  const [odeF, setOdeF] = useState('sin(t)');
  const [odeT, setOdeT] = useState('2*pi');
  const [odeN, setOdeN] = useState('10');

  // ---- 奇偶延拓 ----
  const [extExpr, setExtExpr] = useState('x');
  const [extL, setExtL] = useState('pi');
  const [extN, setExtN] = useState('10');
  const [extType, setExtType] = useState<'odd' | 'even'>('odd');

  // ---- 狄利克雷收敛 ----
  const [dirExpr, setDirExpr] = useState('sign(x)');
  const [dirPeriod, setDirPeriod] = useState('2*pi');

  // ---- 卷积定理 ----
  const [convF, setConvF] = useState('exp(-x^2)');
  const [convG, setConvG] = useState('exp(-x^2)');
  const [convRange, setConvRange] = useState('5');

  // ---- 滤波器 ----
  const [filterExpr, setFilterExpr] = useState('sin(2*pi*5*t) + 0.3*sin(2*pi*50*t)');
  const [filterFs, setFilterFs] = useState('200');
  const [filterCutoff, setFilterCutoff] = useState('20');
  const [filterType, setFilterType] = useState<'lowpass' | 'highpass'>('lowpass');

  // ---- 弦振动 ----
  const [stringL, setStringL] = useState('pi');
  const [stringInit, setStringInit] = useState('sin(x)');
  const [stringVel, setStringVel] = useState('0');
  const [stringA, setStringA] = useState('1');
  const [stringT, setStringT] = useState('0');
  const [stringModes, setStringModes] = useState('5');

  // ---- DFT 离散傅里叶变换 ----
  const [dftInput, setDftInput] = useState('1, 2, 3, 4');
  const [dftMode, setDftMode] = useState<'real' | 'complex'>('real');
  const [dftImagInput, setDftImagInput] = useState('0, 0, 0, 0');

  // ---- 采样定理演示 ----
  const [sampleSigFreq, setSampleSigFreq] = useState('5');
  const [sampleRate, setSampleRate] = useState('12');
  const [sampleDuration, setSampleDuration] = useState('1');

  // 傅里叶级数展开
  const { coefs, data: seriesData, layout: seriesLayout } = useMemo(() => {
    if (activeTab !== 'series') return { coefs: null, data: [], layout: {} as any };
    setError(null);
    try {
      const T = evaluate(period) as number;
      const N = Math.min(parseInt(nTerms, 10), 50);
      if (isNaN(N) || N < 1) throw new Error('项数必须是正整数');
      if (typeof T !== 'number' || !isFinite(T) || T <= 0) throw new Error('周期必须是正数');

      const coef = fourierCoefficients(expr, T, N);
      const nPts = 600;
      const xArr: number[] = [];
      const originalArr: number[] = [];
      const partialArr: number[] = [];
      for (let i = 0; i <= nPts; i++) {
        const x = -T / 2 + (i / nPts) * T;
        xArr.push(x);
        try {
          const orig = evaluate(expr, { x }) as number;
          originalArr.push(typeof orig === 'number' && isFinite(orig) ? orig : 0);
        } catch { originalArr.push(0); }
        partialArr.push(fourierPartialSum(coef.a0, coef.an, coef.bn, T, x, numTerms));
      }

      const chartData = [
        { x: xArr, y: originalArr, name: '原函数 f(x)', type: 'scatter' as const, line: { color: '#78716c', width: 1.5, dash: 'dot' as const } },
        { x: xArr, y: partialArr, name: `傅里叶级数 (N=${numTerms})`, type: 'scatter' as const, line: { color: '#059669', width: 2 } },
      ];
      const lay = mkLayout('x', 'y', 450);
      return { coefs: coef, data: chartData, layout: lay };
    } catch (e) {
      setError((e as Error).message);
      return { coefs: null, data: [], layout: {} as any };
    }
  }, [activeTab, expr, period, nTerms, numTerms]);

  // 自动记录历史（级数展开成功时）
  useEffect(() => {
    if (coefs && activeTab === 'series' && !error) {
      const key = `series|${expr}|${period}|${nTerms}`;
      if (key !== lastHistoryRef.current) {
        const summary = `a₀=${formatResult(coefs.a0)} (T=${period}, N=${numTerms})`;
        addItem(expr, summary);
        lastHistoryRef.current = key;
      }
    }
  }, [coefs, activeTab, error, expr, period, nTerms, numTerms, addItem]);

  // FFT / 频谱分析
  const fftResult = useMemo(() => {
    if (activeTab !== 'fft') return null;
    setError(null);
    try {
      const fs = parseFloat(fftFs);
      const n = parseInt(fftN, 10);
      if (isNaN(fs) || isNaN(n) || fs <= 0 || n < 2) throw new Error('请输入有效采样率和点数');
      // 确保 n 是 2 的幂
      const n2 = Math.pow(2, Math.ceil(Math.log2(n)));

      // 生成信号
      const signal: number[] = [];
      for (let i = 0; i < n2; i++) {
        const t = i / fs;
        try {
          const v = evaluate(signalExpr, { t }) as number;
          signal.push(isFinite(v) ? v : 0);
        } catch { signal.push(0); }
      }

      const result = spectrumAnalysis(signal, fs);
      return { signal, ...result, n: n2, fs };
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [activeTab, signalExpr, fftFs, fftN]);

  const fftLayout = mkLayout('频率 (Hz)', '幅值', 400);

  // 傅里叶变换
  const ftResult = useMemo(() => {
    if (activeTab !== 'transform') return null;
    setError(null);
    try {
      const tMin = parseFloat(ftTMin), tMax = parseFloat(ftTMax);
      const wMax = parseFloat(ftWMax);
      if ([tMin, tMax, wMax].some((v) => isNaN(v))) throw new Error('请输入有效数字');

      const result = fourierTransform(ftExpr, tMin, tMax, -wMax, wMax, 300);
      return result;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [activeTab, ftExpr, ftTMin, ftTMax, ftWMax]);

  const ftLayout = mkLayout('ω (角频率)', '|F(ω)|', 400);

  // Parseval 验证
  const parsevalResult = useMemo(() => {
    if (activeTab !== 'parseval') return null;
    setError(null);
    try {
      const tMin = parseFloat(parsevalTMin);
      const tMax = parseFloat(parsevalTMax);
      if (isNaN(tMin) || isNaN(tMax)) throw new Error('请输入有效区间');
      return parsevalVerification(parsevalExpr, tMin, tMax);
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [activeTab, parsevalExpr, parsevalTMin, parsevalTMax]);

  // 吉布斯现象
  const gibbsResult = useMemo(() => {
    if (activeTab !== 'gibbs') return null;
    const N = parseInt(gibbsN, 10);
    if (isNaN(N) || N < 1) return null;
    return gibbsPhenomenon(N, 2 * Math.PI);
  }, [activeTab, gibbsN]);

  // ODE 傅里叶级数解
  const fourierODEResult = useMemo(() => {
    if (activeTab !== 'ode') return null;
    setError(null);
    try {
      const a = parseFloat(odeA), b = parseFloat(odeB);
      const T = evaluate(odeT) as number;
      const N = parseInt(odeN, 10);
      if ([a, b, T, N].some((v) => isNaN(v))) throw new Error('请输入有效数字');
      return fourierSolveODE(a, b, odeF, T, N);
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [activeTab, odeA, odeB, odeF, odeT, odeN]);

  // 奇偶延拓
  const extResult = useMemo(() => {
    if (activeTab !== 'half-range') return null;
    setError(null);
    try {
      const L = evaluate(extL) as number;
      const N = parseInt(extN, 10);
      if (isNaN(L) || isNaN(N)) throw new Error('请输入有效数字');
      return halfRangeExtension(extExpr, L, N, extType === 'odd' ? 'sine' : 'cosine');
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [activeTab, extExpr, extL, extN, extType]);

  // 狄利克雷收敛
  const dirResult = useMemo(() => {
    if (activeTab !== 'dirichlet') return null;
    setError(null);
    try {
      const T = evaluate(dirPeriod) as number;
      if (isNaN(T)) throw new Error('请输入有效周期');
      return dirichletConvergence(dirExpr, T);
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [activeTab, dirExpr, dirPeriod]);

  // 卷积定理
  const convResult = useMemo(() => {
    if (activeTab !== 'convolution') return null;
    setError(null);
    try {
      const R = parseFloat(convRange);
      if (isNaN(R)) throw new Error('请输入有效范围');
      return convolutionTheorem(convF, convG, 256, R);
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [activeTab, convF, convG, convRange]);

  // 滤波器
  const filterResult = useMemo(() => {
    if (activeTab !== 'filter') return null;
    setError(null);
    try {
      const fs = parseFloat(filterFs);
      const fc = parseFloat(filterCutoff);
      if (isNaN(fs) || isNaN(fc)) throw new Error('请输入有效数字');
      // 生成信号样本
      const N = 512;
      const signal: number[] = [];
      for (let i = 0; i < N; i++) {
        const t = i / fs;
        signal.push(evaluate(filterExpr, { t }) as number);
      }
      return applyFilter(signal, fs, fc, filterType === 'lowpass' ? 'low' : 'high');
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [activeTab, filterExpr, filterFs, filterCutoff, filterType]);

  // 弦振动
  const stringResult = useMemo(() => {
    if (activeTab !== 'string') return null;
    setError(null);
    try {
      const L = evaluate(stringL) as number;
      const N = parseInt(stringModes, 10);
      const a = evaluate(stringA) as number;
      const t = evaluate(stringT) as number;
      if (isNaN(L) || isNaN(N) || isNaN(a) || isNaN(t)) throw new Error('请输入有效数字');
      return stringVibration(stringInit, stringVel, L, a, N, t);
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [activeTab, stringInit, stringVel, stringL, stringA, stringT, stringModes]);

  const handleCompute = () => {
    const N = parseInt(nTerms, 10);
    if (!isNaN(N) && N >= 1) {
      setNumTerms(Math.min(N, 50));
    }
  };

  const loadPreset = (p: { name: string; expr: string; period: string }) => {
    setExpr(p.expr);
    setPeriod(p.period);
    setError(null);
  };

  return (
    <div className="min-h-screen page-fade-in">
      <PageHeader
        title="傅里叶分析"
        description="傅里叶级数展开、傅里叶变换与逆变换、FFT 频谱分析、Parseval 等式、吉布斯现象、傅里叶级数解微分方程。"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-6xl mx-auto space-y-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <LearningSection moduleKey="fourier" />
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap h-auto">
                <TabsTrigger value="series">傅里叶级数</TabsTrigger>
                <TabsTrigger value="complex">复数形式</TabsTrigger>
                <TabsTrigger value="transform">傅里叶变换</TabsTrigger>
                <TabsTrigger value="fft">FFT / 频谱</TabsTrigger>
                <TabsTrigger value="parseval">Parseval 等式</TabsTrigger>
                <TabsTrigger value="gibbs">吉布斯现象</TabsTrigger>
                <TabsTrigger value="ode">ODE 傅里叶解</TabsTrigger>
                <TabsTrigger value="half-range">奇偶延拓</TabsTrigger>
                <TabsTrigger value="dirichlet">狄利克雷收敛</TabsTrigger>
                <TabsTrigger value="convolution">卷积定理</TabsTrigger>
                <TabsTrigger value="filter">滤波器</TabsTrigger>
                <TabsTrigger value="string">弦振动</TabsTrigger>
                <TabsTrigger value="dft">DFT</TabsTrigger>
                <TabsTrigger value="sampling">采样定理</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                {/* ===== 傅里叶级数 ===== */}
                {activeTab === 'series' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <MathInputField
                          value={expr}
                          onChange={setExpr}
                          label="函数 f(x) (一个周期内 [-T/2, T/2])"
                          showPalette
                          defaultPreview
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">周期 T</label>
                        <Input value={period} onChange={(e) => setPeriod(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1 max-w-xs">
                        <label className="text-sm font-medium text-foreground mb-2 block">最大项数 N</label>
                        <Input value={nTerms} onChange={(e) => setNTerms(e.target.value)} className="font-mono" />
                      </div>
                      <Button onClick={handleCompute} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                        <Play className="size-4 mr-2" />计算
                      </Button>
                    </div>
                    {coefs && (
                      <div className="flex items-center gap-3 pt-2 border-t border-border">
                        <span className="text-sm text-foreground shrink-0">显示项数 N = {numTerms}</span>
                        <Button variant="outline" size="icon" onClick={() => setNumTerms((n) => Math.max(1, n - 1))}><Minus className="size-4" /></Button>
                        <input
                          type="range"
                          min={1} max={Math.min(parseInt(nTerms, 10) || 5, 50)} value={numTerms}
                          onChange={(e) => setNumTerms(parseInt(e.target.value, 10))}
                          className="flex-1 accent-emerald-700"
                        />
                        <Button variant="outline" size="icon" onClick={() => setNumTerms((n) => Math.min(Math.min(parseInt(nTerms, 10) || 5, 50), n + 1))}><Plus className="size-4" /></Button>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Sparkles className="size-4 text-emerald-600" />快速预设</h4>
                      <div className="flex flex-wrap gap-2">
                        {PRESETS.map((p, i) => (
                          <Button key={i} variant="outline" size="sm" onClick={() => loadPreset(p)}>{p.name}</Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ===== 复数形式 ===== */}
                {activeTab === 'complex' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">复数形式傅里叶级数：f(x) = Σ c_n · e^(i·2πn·x/T)</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-foreground mb-2 block">函数 f(x)</label>
                        <Input value={expr} onChange={(e) => setExpr(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">周期 T</label>
                        <Input value={period} onChange={(e) => setPeriod(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">项数 N（计算 -N..N）</label>
                      <Input value={nTerms} onChange={(e) => setNTerms(e.target.value)} className="font-mono w-40" />
                    </div>
                    <Button onClick={handleCompute} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />应用项数设置
                    </Button>
                  </>
                )}

                {/* ===== 傅里叶变换 ===== */}
                {activeTab === 'transform' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">函数 f(t)</label>
                      <Input value={ftExpr} onChange={(e) => setFtExpr(e.target.value)} className="font-mono" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">t 最小值</label><Input value={ftTMin} onChange={(e) => setFtTMin(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">t 最大值</label><Input value={ftTMax} onChange={(e) => setFtTMax(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">ω 范围</label><Input value={ftWMax} onChange={(e) => setFtWMax(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {/* ===== FFT / 频谱分析 ===== */}
                {activeTab === 'fft' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">信号 x(t)</label>
                      <Input value={signalExpr} onChange={(e) => setSignalExpr(e.target.value)} className="font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">采样频率 Fs (Hz)</label><Input value={fftFs} onChange={(e) => setFftFs(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">采样点数 N</label><Input value={fftN} onChange={(e) => setFftN(e.target.value)} className="font-mono" /></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      自动补零到 2 的幂次。奈奎斯特频率 = Fs/2。示例：sin(2π·5t) + 0.5·sin(2π·12t) 的频谱应在 5Hz 和 12Hz 处出现峰值。
                    </p>
                  </>
                )}

                {/* ===== Parseval ===== */}
                {activeTab === 'parseval' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">函数 f(t)</label>
                      <Input value={parsevalExpr} onChange={(e) => setParsevalExpr(e.target.value)} className="font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">t 最小值</label>
                        <Input value={parsevalTMin} onChange={(e) => setParsevalTMin(e.target.value)} className="font-mono" />
                      </div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">t 最大值</label>
                        <Input value={parsevalTMax} onChange={(e) => setParsevalTMax(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      帕塞瓦尔定理：∫ |f(t)|² dt = (1/2π) ∫ |F(ω)|² dω，即时域能量等于频域能量。
                    </p>
                  </>
                )}

                {/* ===== 吉布斯现象 ===== */}
                {activeTab === 'gibbs' && (
                  <>
                    <div className="max-w-xs">
                      <label className="text-sm font-medium text-foreground mb-2 block">展开项数 N</label>
                      <Input value={gibbsN} onChange={(e) => setGibbsN(e.target.value)} className="font-mono" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      方波的傅里叶级数在间断点处存在约 8.95% 的过冲（吉布斯现象），即使 N→∞ 过冲幅度也不会消失。
                    </p>
                  </>
                )}

                {/* ===== ODE 傅里叶解 ===== */}
                {activeTab === 'ode' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">方程：y'' + a·y' + b·y = f(t)，f(t) 是周期函数</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">系数 a</label><Input value={odeA} onChange={(e) => setOdeA(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">系数 b</label><Input value={odeB} onChange={(e) => setOdeB(e.target.value)} className="font-mono" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">f(t)</label><Input value={odeF} onChange={(e) => setOdeF(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">周期 T</label><Input value={odeT} onChange={(e) => setOdeT(e.target.value)} className="font-mono" /></div>
                    </div>
                    <div className="max-w-xs">
                      <label className="text-sm font-medium text-foreground mb-2 block">展开项数 N</label>
                      <Input value={odeN} onChange={(e) => setOdeN(e.target.value)} className="font-mono" />
                    </div>
                  </>
                )}

                {/* 奇偶延拓 */}
                {activeTab === 'half-range' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">半区间 [0, L] 上函数展开为正弦/余弦级数（奇/偶延拓）</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">f(x), x∈[0, L]</label><Input value={extExpr} onChange={(e) => setExtExpr(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">区间长 L</label><Input value={extL} onChange={(e) => setExtL(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">项数 N</label><Input value={extN} onChange={(e) => setExtN(e.target.value)} className="font-mono" /></div>
                    </div>
                    <div className="max-w-xs">
                      <label className="text-sm font-medium text-foreground mb-2 block">延拓方式</label>
                      <Select value={extType} onValueChange={(v) => setExtType(v as 'odd' | 'even')}>
                        <SelectTrigger className="font-mono"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="odd">奇延拓（正弦级数）</SelectItem>
                          <SelectItem value="even">偶延拓（余弦级数）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* 狄利克雷收敛 */}
                {activeTab === 'dirichlet' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">函数表达式</label><Input value={dirExpr} onChange={(e) => setDirExpr(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">周期 T</label><Input value={dirPeriod} onChange={(e) => setDirPeriod(e.target.value)} className="font-mono" /></div>
                  </div>
                )}

                {/* 卷积定理 */}
                {activeTab === 'convolution' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">f(x)</label><Input value={convF} onChange={(e) => setConvF(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">g(x)</label><Input value={convG} onChange={(e) => setConvG(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">区间 [-R, R]</label><Input value={convRange} onChange={(e) => setConvRange(e.target.value)} className="font-mono" /></div>
                  </div>
                )}

                {/* 滤波器 */}
                {activeTab === 'filter' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">信号 s(t)</label><Input value={filterExpr} onChange={(e) => setFilterExpr(e.target.value)} className="font-mono" /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">采样率 fs</label><Input value={filterFs} onChange={(e) => setFilterFs(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">截止频率</label><Input value={filterCutoff} onChange={(e) => setFilterCutoff(e.target.value)} className="font-mono" /></div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">类型</label>
                        <Select value={filterType} onValueChange={(v) => setFilterType(v as 'lowpass' | 'highpass')}>
                          <SelectTrigger className="font-mono"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lowpass">低通</SelectItem>
                            <SelectItem value="highpass">高通</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {/* 弦振动 */}
                {activeTab === 'string' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">初始位移 φ(x)</label><Input value={stringInit} onChange={(e) => setStringInit(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">初始速度 ψ(x)</label><Input value={stringVel} onChange={(e) => setStringVel(e.target.value)} className="font-mono" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">弦长 L</label><Input value={stringL} onChange={(e) => setStringL(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">波速 a</label><Input value={stringA} onChange={(e) => setStringA(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">时刻 t</label><Input value={stringT} onChange={(e) => setStringT(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">模态数</label><Input value={stringModes} onChange={(e) => setStringModes(e.target.value)} className="font-mono" /></div>
                    </div>
                  </div>
                )}

                {/* DFT 离散傅里叶变换 */}
                {activeTab === 'dft' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">实部序列（逗号/空格分隔）</label>
                      <Input value={dftInput} onChange={(e) => setDftInput(e.target.value)} className="font-mono" />
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={dftMode} onChange={(e) => setDftMode(e.target.value as any)} className="h-9 px-3 rounded-md border border-border bg-card text-sm">
                        <option value="real">纯实数</option>
                        <option value="complex">复数（含虚部）</option>
                      </select>
                      <span className="text-xs text-muted-foreground">选择输入类型</span>
                    </div>
                    {dftMode === 'complex' && (
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">虚部序列（逗号/空格分隔）</label>
                        <Input value={dftImagInput} onChange={(e) => setDftImagInput(e.target.value)} className="font-mono" />
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      示例：输入 1,2,3,4 → 输出 4 点 DFT 的幅度谱和相位谱
                    </div>
                  </div>
                )}

                {/* 采样定理演示 */}
                {activeTab === 'sampling' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">信号频率 (Hz)</label>
                        <Input value={sampleSigFreq} onChange={(e) => setSampleSigFreq(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">采样率 (Hz)</label>
                        <Input value={sampleRate} onChange={(e) => setSampleRate(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">时长 (秒)</label>
                        <Input value={sampleDuration} onChange={(e) => setSampleDuration(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      奈奎斯特频率 = 采样率 / 2。当信号频率 &gt; 奈奎斯特频率时出现混叠。
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <HistoryPanel
          open={historyOpen}
          history={history}
          onToggle={() => setHistoryOpen((o) => !o)}
          onClear={clearHistory}
          onSelect={(item) => {
            // 回填表达式
            if (item.expression) setExpr(item.expression);
          }}
          theme="indigo"
          className="mb-4"
        />

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {/* 级数结果 */}
        {activeTab === 'series' && coefs && (
          <>
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">傅里叶系数</h3>
                <div className="font-mono text-sm text-foreground space-y-1">
                  <div>a₀ = {formatResult(coefs.a0)}</div>
                  <div className="grid grid-cols-2 gap-x-4">
                    {coefs.an.slice(0, Math.min(numTerms, coefs.an.length)).map((a, i) => (
                      <div key={`a${i}`}>a<sub>{i + 1}</sub> = {formatResult(a)}</div>
                    ))}
                    {coefs.bn.slice(0, Math.min(numTerms, coefs.bn.length)).map((b, i) => (
                      <div key={`b${i}`}>b<sub>{i + 1}</sub> = {formatResult(b)}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[450px] md:min-h-[500px]">
                  <Plot
                    data={seriesData as any} layout={seriesLayout}
                    config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 复数形式结果 */}
        {activeTab === 'complex' && (
          <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-xs text-emerald-400/70 mb-3 font-medium tracking-wider">复数傅里叶系数 c_n</div>
              {(() => {
                try {
                  const T = evaluate(period) as number;
                  const N = Math.min(parseInt(nTerms, 10), 30);
                  const { c } = fourierComplexCoefficients(expr, T, N);
                  return (
                    <div className="text-emerald-300 font-mono text-sm space-y-1 max-h-[400px] overflow-y-auto">
                      {c.map((ci) => (
                        <div key={ci.n}>
                          c<sub>{ci.n}</sub> = {ci.real.toFixed(6)} {ci.imag >= 0 ? '+' : ''}{ci.imag.toFixed(6)}i
                          &nbsp;&nbsp; |c| = {ci.magnitude.toFixed(6)}
                          &nbsp;&nbsp; arg = {(ci.phase / Math.PI).toFixed(3)}π
                        </div>
                      ))}
                    </div>
                  );
                } catch { return <div className="text-red-400">计算失败</div>; }
              })()}
            </CardContent>
          </Card>
        )}

        {/* FFT 频谱 */}
        {activeTab === 'fft' && fftResult && (
          <>
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">频谱峰值</h3>
                <div className="font-mono text-sm text-foreground space-y-1">
                  {fftResult.peaks.length === 0 ? <div>未检测到显著峰值</div> :
                    fftResult.peaks.map((p, i) => (
                      <div key={i}>峰 {i + 1}: f = {p.freq.toFixed(3)} Hz,  幅值 = {p.magnitude.toFixed(6)}</div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">采样率 {fftResult.fs} Hz，点数 {fftResult.n}，频率分辨率 {(fftResult.fs / fftResult.n).toFixed(3)} Hz</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[400px]">
                  <Plot
                    data={[{ x: fftResult.frequencies, y: fftResult.magnitudes, name: '幅值谱', type: 'scatter' as const, line: { color: '#059669', width: 2 } }] as any}
                    layout={fftLayout}
                    config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 傅里叶变换 */}
        {activeTab === 'transform' && ftResult && (
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="w-full min-h-[400px]">
                <Plot
                  data={[{ x: ftResult.omega, y: ftResult.magnitude, name: '|F(ω)|', type: 'scatter' as const, line: { color: '#059669', width: 2 } }] as any}
                  layout={ftLayout}
                  config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                  style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parseval 结果 */}
        {activeTab === 'parseval' && parsevalResult && (
          <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-xs text-emerald-400/70 mb-3 font-medium tracking-wider">帕塞瓦尔等式验证</div>
              <div className="text-emerald-300 font-mono text-sm space-y-2 whitespace-pre-wrap">
                {`时域能量 ∫|f(t)|² dt  = ${parsevalResult.timeEnergy.toFixed(8)}
频域能量 (1/2π)∫|F(ω)|² dω = ${parsevalResult.freqEnergy.toFixed(8)}
差值 = ${parsevalResult.difference.toExponential(4)}
相对误差 = ${(parsevalResult.ratio * 100).toFixed(4)}%
${parsevalResult.ratio < 0.05 ? '✓ 帕塞瓦尔等式成立（误差 < 5%）' : '⚠ 误差较大，可能因有限区间截断或采样不足'}`}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 吉布斯现象结果 */}
        {activeTab === 'gibbs' && gibbsResult && (
          <>
            <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-xs text-emerald-400/70 mb-3 font-medium tracking-wider">吉布斯现象</div>
                <div className="text-emerald-300 font-mono text-sm space-y-2">
                  {`N = ${parseInt(gibbsN, 10) || 0} 项部分和
方波跳变高度 = ${gibbsResult.jumpHeight}
部分和最大值 ≈ ${gibbsResult.partialMax.toFixed(6)}
过冲幅度 = ${gibbsResult.overshootPercent.toFixed(3)}%
理论值 ≈ 8.95%（Wilbraham-Gibbs 常数）
${Math.abs(gibbsResult.overshootPercent - 8.95) < 2 ? '✓ 符合吉布斯现象特征' : ''}`}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[350px]">
                  <GibbsPlot N={parseInt(gibbsN, 10) || 5} />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ODE 傅里叶解 */}
        {activeTab === 'ode' && fourierODEResult && (
          <>
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">稳态解系数</h3>
                <div className="font-mono text-sm text-foreground space-y-1 max-h-60 overflow-y-auto">
                  {fourierODEResult.coefficients.slice(0, 10).map((c) => (
                    <div key={c.n}>
                      n = {c.n}:  a_n = {c.an.toFixed(4)},  b_n = {c.bn.toFixed(4)},  C_n = {c.Cn.toFixed(4)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[400px]">
                  <Plot
                    data={[{ x: fourierODEResult.sample.t, y: fourierODEResult.sample.y, name: '稳态解 y_p(t)', type: 'scatter' as const, line: { color: '#059669', width: 2 } }] as any}
                    layout={mkLayout('t', 'y(t)', 400)}
                    config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 奇偶延拓结果 */}
        {activeTab === 'half-range' && extResult && (
          <>
            <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-xs text-emerald-400/70 mb-2 font-medium tracking-wider">{extResult.type}</div>
                <pre className="text-emerald-100 font-mono text-sm whitespace-pre-wrap leading-relaxed">{extResult.formula}</pre>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[400px]">
                  <Plot
                    data={[
                      { x: extResult.sample.map(s => s.x), y: extResult.sample.map(s => s.y), name: '原函数', type: 'scatter' as const, line: { color: '#78716c', width: 1.5, dash: 'dash' as const } },
                      { x: extResult.sample.map(s => s.x), y: extResult.sample.map(s => s.partial), name: `${extResult.type}(N项)`, type: 'scatter' as const, line: { color: '#059669', width: 2 } },
                    ] as any}
                    layout={mkLayout('x', 'f(x)', 400)}
                    config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 狄利克雷收敛结果 */}
        {activeTab === 'dirichlet' && dirResult && (
          <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-xs text-emerald-400/70 mb-3 font-medium tracking-wider">狄利克雷收敛性</div>
              <div className="space-y-3 text-emerald-100 text-sm">
                <div>满足狄利克雷条件: {dirResult.satisfies ? '✓' : '✗'}</div>
                <div>间断点数：{dirResult.discontinuities.length}</div>
                {dirResult.discontinuities.length > 0 && (
                  <div className="font-mono text-xs bg-emerald-950/30 p-3 rounded-md max-h-40 overflow-y-auto">
                    {dirResult.discontinuities.map((d, i) => (
                      <div key={i}>x ≈ {d.x.toFixed(4)}: 左极限={d.leftLimit.toFixed(4)}, 右极限={d.rightLimit.toFixed(4)}</div>
                    ))}
                  </div>
                )}
                <div className="text-emerald-300/80 text-xs pt-2">{dirResult.reason}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 卷积定理结果 */}
        {activeTab === 'convolution' && convResult && (
          <>
            <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-xs text-emerald-400/70 mb-2 font-medium tracking-wider">卷积定理验证</div>
                <div className="text-emerald-100 text-sm space-y-2">
                  <div>ℱ[f*g] 与 F(ω)·G(ω) 相对误差: <span className="font-mono">{convResult.relativeError.toExponential(4)}</span></div>
                  <div>结论: {convResult.holds ? '✓ 卷积定理成立' : '✗ 存在较大偏差'}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[380px]">
                  <Plot
                    data={[
                      { x: convResult.timeVector, y: convResult.convolution, name: 'f*g 卷积', type: 'scatter' as const, line: { color: '#059669', width: 2 } },
                    ] as any}
                    layout={mkLayout('t', '卷积值', 380)}
                    config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 滤波器结果 */}
        {activeTab === 'filter' && filterResult && (
          <>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[350px]">
                  <Plot
                    data={[
                      { x: Array.from({ length: filterResult.filtered.length }, (_, i) => i), y: Array(512).fill(0).map((_, i) => i), name: '原始信号', type: 'scatter' as const, line: { color: '#78716c', width: 1 } },
                      { x: Array.from({ length: filterResult.filtered.length }, (_, i) => i), y: filterResult.filtered, name: '滤波后', type: 'scatter' as const, line: { color: '#059669', width: 2 } },
                    ] as any}
                    layout={mkLayout('t', 's(t)', 350)}
                    config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[300px]">
                  <Plot
                    data={[
                      { x: filterResult.frequencies, y: filterResult.originalSpec, name: '原始频谱', type: 'scatter' as const, line: { color: '#78716c', width: 1.5 } },
                      { x: filterResult.frequencies, y: filterResult.filteredSpec, name: '滤波后频谱', type: 'scatter' as const, line: { color: '#059669', width: 2 } },
                    ] as any}
                    layout={mkLayout('f (Hz)', '幅度', 300)}
                    config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 弦振动结果 */}
        {activeTab === 'string' && stringResult && (
          <>
            <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-xs text-emerald-400/70 mb-2 font-medium tracking-wider">弦振动傅里叶系数</div>
                <div className="text-emerald-100 text-sm space-y-1 max-h-40 overflow-y-auto font-mono text-xs">
                  {stringResult.An.slice(0, 10).map((c) => (
                    <div key={c.n}>n={c.n}: A_n = {c.value.toFixed(6)}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[400px]">
                  <Plot
                    data={[
                      { x: stringResult.sample.map(s => s.x), y: stringResult.sample.map(s => s.u), name: 'u(x,t)', type: 'scatter' as const, line: { color: '#059669', width: 2 } },
                      ...stringResult.modes.slice(0, 3).map((m, i) => ({
                        x: stringResult.sample.map(s => s.x),
                        y: m.shape,
                        name: `模态 n=${m.n}`,
                        type: 'scatter' as const,
                        line: { color: ['#d97706', '#2563eb', '#7c3aed'][i % 3], width: 1, dash: 'dot' as const },
                      })),
                    ] as any}
                    layout={mkLayout('x', 'u(x,t)', 400)}
                    config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                    style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* DFT 结果 */}
        {activeTab === 'dft' && (
          <>
            <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-xs text-emerald-400/70 mb-3 font-medium tracking-wider">DFT 频谱</div>
                {(() => {
                  try {
                    const realArr = dftInput.split(/[,\s]+/).filter(Boolean).map(s => parseFloat(s));
                    if (realArr.length < 2) throw new Error('请至少输入 2 个数字');
                    if (realArr.some(isNaN)) throw new Error('输入包含非数字字符');
                    let imagArr: number[] | undefined = undefined;
                    if (dftMode === 'complex') {
                      imagArr = dftImagInput.split(/[,\s]+/).filter(Boolean).map(s => parseFloat(s));
                      if (imagArr.length !== realArr.length) throw new Error('实部和虚部序列长度不一致');
                      if (imagArr.some(isNaN)) throw new Error('虚部包含非数字字符');
                    }
                    const result = dft(realArr, imagArr);
                    const N = result.magnitude.length;
                    return (
                      <div className="text-emerald-100 text-sm space-y-2">
                        <div className="font-medium text-emerald-200">N 点 DFT（N = {N}）</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-emerald-400/60 mb-1">幅度谱 |X[k]|</div>
                            <div className="font-mono text-xs space-y-0.5 max-h-48 overflow-y-auto">
                              {result.magnitude.slice(0, N).map((m, i) => (
                                <div key={`mag${i}`}>k={i}: {m.toFixed(4)}</div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-emerald-400/60 mb-1">相位谱 ∠X[k] (rad)</div>
                            <div className="font-mono text-xs space-y-0.5 max-h-48 overflow-y-auto">
                              {result.phase.slice(0, N).map((p, i) => (
                                <div key={`ph${i}`}>k={i}: {p.toFixed(4)}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } catch (e) {
                    return <div className="text-red-400 text-sm">{(e as Error).message}</div>;
                  }
                })()}
              </CardContent>
            </Card>
          </>
        )}

        {/* 采样定理结果 */}
        {activeTab === 'sampling' && (
          <>
            <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-xs text-emerald-400/70 mb-3 font-medium tracking-wider">采样定理演示</div>
                {(() => {
                  try {
                    const sigFreq = parseFloat(sampleSigFreq);
                    const sr = parseFloat(sampleRate);
                    const dur = parseFloat(sampleDuration);
                    if (isNaN(sigFreq) || isNaN(sr) || isNaN(dur)) throw new Error('请输入有效数字');
                    if (sigFreq <= 0 || sr <= 0 || dur <= 0) throw new Error('数值必须为正');
                    const result = samplingTheoremDemo(sigFreq, sr, dur, 256);
                    const nyquist = sr / 2;
                    const aliased = sigFreq > nyquist;
                    return (
                      <div className="text-emerald-100 text-sm space-y-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="text-xs text-emerald-400/60">信号频率</div>
                            <div className="text-lg font-semibold">{sigFreq} Hz</div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="text-xs text-emerald-400/60">采样率</div>
                            <div className="text-lg font-semibold">{sr} Hz</div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="text-xs text-emerald-400/60">奈奎斯特频率</div>
                            <div className="text-lg font-semibold">{nyquist} Hz</div>
                          </div>
                          <div className={aliased ? 'bg-red-900/40 rounded-lg p-3' : 'bg-emerald-900/40 rounded-lg p-3'}>
                            <div className="text-xs text-emerald-400/60">混叠状态</div>
                            <div className="text-lg font-semibold">{aliased ? '混叠 ⚠' : '无混叠 ✓'}</div>
                          </div>
                        </div>
                        {aliased && (
                          <div className="text-amber-300 text-xs mt-2">
                            折叠/混叠频率 = {result.aliasFreq.toFixed(2)} Hz （{sigFreq} Hz &gt; {nyquist} Hz 奈奎斯特极限）
                          </div>
                        )}
                      </div>
                    );
                  } catch (e) {
                    return <div className="text-red-400 text-sm">{(e as Error).message}</div>;
                  }
                })()}
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[380px]">
                  {(() => {
                    try {
                      const sigFreq = parseFloat(sampleSigFreq);
                      const sr = parseFloat(sampleRate);
                      const dur = parseFloat(sampleDuration);
                      if (isNaN(sigFreq) || isNaN(sr) || isNaN(dur)) return null;
                      const result = samplingTheoremDemo(sigFreq, sr, dur, 256);
                      return (
                        <Plot
                          data={[
                            { x: result.continuousTime, y: result.continuousValue, name: '原信号', type: 'scatter' as const, line: { color: '#059669', width: 2 } },
                            { x: result.sampledTime, y: result.sampledValue, name: '采样点', type: 'scatter' as const, mode: 'markers' as const, marker: { color: '#d97706', size: 6 } },
                          ] as any}
                          layout={mkLayout('时间 t (s)', '幅度', 380)}
                          config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                          style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
                        />
                      );
                    } catch { return null; }
                  })()}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <CheatsheetDialog moduleKey="fourier" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}

// 吉布斯现象曲线绘制
function GibbsPlot({ N }: { N: number }) {
  const palette = usePlotlyPalette();
  const T = 2 * Math.PI;
  const nPts = 1000;
  const xs: number[] = [];
  const partial: number[] = [];
  const square: number[] = [];

  for (let i = 0; i <= nPts; i++) {
    const x = -T / 2 + (i / nPts) * T;
    xs.push(x);
    // 方波
    const s = x < 0 ? -1 : 1;
    square.push(s);
    // 傅里叶部分和
    let sum = 0;
    for (let k = 1; k <= N; k += 2) {
      sum += (1 / k) * Math.sin(2 * Math.PI * k * (x + T / 2) / T);
    }
    partial.push(4 / Math.PI * sum);
  }

  const layout = {
    autosize: true, height: 350,
    margin: { l: 50, r: 20, t: 30, b: 50 },
    plot_bgcolor: palette.plot_bgcolor,
    paper_bgcolor: palette.paper_bgcolor,
    font: { color: palette.font_color },
    xaxis: { title: { text: 'x' }, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
    yaxis: { title: { text: 'y' }, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
    legend: { orientation: 'h' as const, y: -0.2, font: { color: palette.font_color } },
  };

  return (
    <Plot
      data={[
        { x: xs, y: square, name: '方波', type: 'scatter' as const, line: { color: '#78716c', width: 1.5, dash: 'dash' as const } },
        { x: xs, y: partial, name: `N=${N} 部分和`, type: 'scatter' as const, line: { color: '#059669', width: 2 } },
      ] as any}
      layout={layout}
      config={{ responsive: true, displayModeBar: true, displaylogo: false }}
      style={{ width: '100%', height: '100%' }} useResizeHandler className="w-full h-full"
    />
  );
}
