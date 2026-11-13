import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageShell from '@/components/PageShell';
import RelatedExplainers from '@/components/RelatedExplainers';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Sparkles, Calculator, Type } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import LearningSection from '@/components/LearningSection';
import DistributionChart from '@/components/stats/DistributionChart';
import { useHistory } from '@/hooks/useHistory';
import HistoryPanel from '@/components/HistoryPanel';
import { calcStatistics, binomPMF, normalPDF, poissonPMF, formatResult, geometricPMF, uniformPDF, uniformCDF, exponentialPDF, exponentialCDF, chiSquarePDF, tDistPDF, fDistPDF, bayesTheorem, covariance, pearsonCorrelation, linearRegression, confidenceIntervalMean, zTest, tTestOneSample, conditionalProbability, discreteExpectation, discreteVariance, classicalProbability, chebyshevBound, coinFlipSimulation } from '@/lib/math-utils';
import { evaluate } from 'mathjs';
import { toast } from 'sonner';
import { mgf, cltSimulation, hypothesisTest } from '@/lib/math-advanced';

const STATS_EXAMPLES = ['1, 2, 3, 4, 5, 6, 7, 8, 9, 10', '3, 7, 5, 13, 20, 23, 39, 23, 40, 23, 14, 12, 56, 23'];

function parseArr(s: string): number[] {
  return s.split(/[,\s;]+/).map(x => x.trim()).filter(Boolean).map(x => {
    const v = parseFloat(x);
    if (isNaN(v)) throw new Error(`无效数字: ${x}`);
    return v;
  });
}

export default function ProbabilityStatsPage() {
  const [dataInput, setDataInput] = useState(STATS_EXAMPLES[0]);
  const [binomN, setBinomN] = useState('10');
  const [binomK, setBinomK] = useState('3');
  const [binomP, setBinomP] = useState('0.5');
  const [normX, setNormX] = useState('0');
  const [normMu, setNormMu] = useState('0');
  const [normSigma, setNormSigma] = useState('1');
  const [poissK, setPoissK] = useState('3');
  const [poissLambda, setPoissLambda] = useState('5');
  const [ncrN, setNcrN] = useState('10');
  const [ncrK, setNcrK] = useState('3');

  // 新功能 state
  const [distX, setDistX] = useState('2');
  const [distA, setDistA] = useState('0');
  const [distB, setDistB] = useState('4');
  const [expX, setExpX] = useState('1');
  const [expLambda, setExpLambda] = useState('0.5');
  const [geomK, setGeomK] = useState('3');
  const [geomP, setGeomP] = useState('0.4');

  const [bayesPA, setBayesPA] = useState('0.01');
  const [bayesBgA, setBayesBgA] = useState('0.99');
  const [bayesBgNotA, setBayesBgNotA] = useState('0.05');

  const [condPAB, setCondPAB] = useState('0.2');
  const [condPB, setCondPB] = useState('0.5');

  const [discX, setDiscX] = useState('1,2,3');
  const [discP, setDiscP] = useState('0.2,0.5,0.3');

  const [covX, setCovX] = useState('1,2,3,4,5');
  const [covY, setCovY] = useState('2,4,5,4,5');

  const [regX, setRegX] = useState('1,2,3,4,5');
  const [regY, setRegY] = useState('2.1,3.9,6.1,7.8,10.2');

  const [confMean, setConfMean] = useState('5.2');
  const [confStd, setConfStd] = useState('1.5');
  const [confN, setConfN] = useState('30');
  const [confLevel, setConfLevel] = useState('0.95');

  const [ztestMu0, setZtestMu0] = useState('5');
  const [ztestXbar, setZtestXbar] = useState('5.4');
  const [ztestSigma, setZtestSigma] = useState('1');
  const [ztestN, setZtestN] = useState('30');

  const [ttestMu0, setTtestMu0] = useState('50');
  const [ttestXbar, setTtestXbar] = useState('52');
  const [ttestS, setTtestS] = useState('5');
  const [ttestN, setTtestN] = useState('16');

  const [chiX, setChiX] = useState('3');
  const [chiN, setChiN] = useState('5');
  const [tVal, setTVal] = useState('1.5');
  const [tDf, setTDf] = useState('10');
  const [fX, setFX] = useState('2');
  const [fDf1, setFDf1] = useState('5');
  const [fDf2, setFDf2] = useState('10');

  const [classicalN, setClassicalN] = useState('100');
  const [classicalK, setClassicalK] = useState('25');

  const [chebMu, setChebMu] = useState('0');
  const [chebSigma, setChebSigma] = useState('1');
  const [chebK, setChebK] = useState('2');

  const [simN, setSimN] = useState('10000');

  const [statsResult, setStatsResult] = useState<Record<string, string>>({});
  const [distResult, setDistResult] = useState<{ tab: string; text: string } | null>(null);
  const [ncrResult, setNcrResult] = useState('');
  const [result, setResult] = useState('');
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('descriptive');
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_prob_history' });
  const lastResultRef = useRef('');

  // 监听结果变化，自动记录历史
  useEffect(() => {
    if (result && result !== lastResultRef.current && !error) {
      addItem(activeTab, result);
      lastResultRef.current = result;
    }
  }, [result, error, activeTab, addItem]);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [simResult, setSimResult] = useState<{ freq: number; n: number } | null>(null);

  // MGF
  const [mgfDist, setMgfDist] = useState('normal');
  const [mgfMu, setMgfMu] = useState('0');
  const [mgfSigma, setMgfSigma] = useState('1');
  const [mgfLambda, setMgfLambda] = useState('2');
  const [mgfP, setMgfP] = useState('0.5');
  const [mgfN, setMgfN] = useState('10');

  // CLT simulation
  const [cltDist, setCltDist] = useState<'dice' | 'uniform' | 'bernoulli' | 'exponential'>('dice');
  const [cltSampleSize, setCltSampleSize] = useState('30');
  const [cltNumSamples, setCltNumSamples] = useState('2000');
  const [cltLambda, setCltLambda] = useState('1');
  const [cltP, setCltP] = useState('0.5');
  const [cltA, setCltA] = useState('0');
  const [cltB, setCltB] = useState('1');
  const [cltResult, setCltResult] = useState<any>(null);

  // Full hypothesis test
  const [htType, setHtType] = useState<'z' | 't'>('z');
  const [htTail, setHtTail] = useState<'left' | 'right' | 'two'>('two');
  const [htSample, setHtSample] = useState('10.2 9.8 10.5 10.1 9.9 10.3 10.0 9.7 10.4 10.1');
  const [htMu0, setHtMu0] = useState('10');
  const [htSigma, setHtSigma] = useState('0.3');
  const [htAlpha, setHtAlpha] = useState('0.05');

  const computeStats = () => {
    setError(null);
    try {
      const nums = parseArr(dataInput);
      const stats = calcStatistics(nums);
      setStatsResult({
        '个数 (N)': String(stats.count),
        '求和 (Σx)': formatResult(stats.sum),
        '最小值': formatResult(stats.min),
        '最大值': formatResult(stats.max),
        '均值 (mean)': formatResult(stats.mean),
        '中位数 (median)': formatResult(stats.median),
        '众数 (mode)': stats.mode.length > 0 ? stats.mode.map(m => formatResult(m)).join(', ') : '无',
        '方差 (σ²)': formatResult(stats.variance),
        '标准差 (σ)': formatResult(stats.std),
      });
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setStatsResult({});
      toast.error('计算错误');
    }
  };

  // ===== 分布实时预览（输入即更新，不必点计算）=====
  const descriptiveChart = useMemo(() => {
    try {
      const data = parseArr(dataInput).filter((v) => Number.isFinite(v));
      if (data.length < 2) return null;
      const min = Math.min(...data);
      const max = Math.max(...data);
      const binCount = Math.min(12, Math.max(5, Math.ceil(Math.sqrt(data.length))));
      const width = (max - min) / binCount || 1;
      const counts = new Array(binCount).fill(0);
      for (const v of data) {
        let idx = Math.floor((v - min) / width);
        if (idx >= binCount) idx = binCount - 1;
        if (idx < 0) idx = 0;
        counts[idx]++;
      }
      const points = counts.map((c, i) => ({ x: min + (i + 0.5) * width, y: c }));
      const sorted = [...data].sort((a, b) => a - b);
      const median =
        sorted.length % 2 === 1
          ? sorted[(sorted.length - 1) / 2]
          : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
      const mean = data.reduce((s, v) => s + v, 0) / data.length;
      return { points, markers: [mean, median] };
    } catch {
      return null;
    }
  }, [dataInput]);

  const discreteChart = useMemo(() => {
    try {
      const xs = parseArr(discX).filter((v) => Number.isFinite(v));
      const ps = parseArr(discP).filter((v) => Number.isFinite(v));
      if (xs.length === 0 || xs.length !== ps.length) return null;
      return { points: xs.map((x, i) => ({ x, y: ps[i] })) };
    } catch {
      return null;
    }
  }, [discX, discP]);

  const binomialChart = useMemo(() => {
    const n = parseInt(binomN, 10);
    const k = parseInt(binomK, 10);
    const p = parseFloat(binomP);
    if (!Number.isFinite(n) || n < 1 || n > 60 || !Number.isFinite(p) || p <= 0 || p >= 1) return null;
    const points = Array.from({ length: n + 1 }, (_, i) => ({ x: i, y: binomPMF(i, n, p) }));
    const markers = Number.isFinite(k) && k >= 0 && k <= n ? [k] : [];
    return { points, markers };
  }, [binomN, binomK, binomP]);

  const normalChart = useMemo(() => {
    const x = parseFloat(normX);
    const mu = parseFloat(normMu);
    const sigma = parseFloat(normSigma);
    if (![x, mu, sigma].every(Number.isFinite) || sigma <= 0) return null;
    const lo = mu - 4 * sigma;
    const hi = mu + 4 * sigma;
    const points = Array.from({ length: 121 }, (_, i) => {
      const t = lo + ((hi - lo) * i) / 120;
      return { x: t, y: normalPDF(t, mu, sigma) };
    });
    const xc = Math.min(Math.max(x, lo), hi);
    return { points, shade: [lo, xc] as [number, number], markers: [x] };
  }, [normX, normMu, normSigma]);

  const poissonChart = useMemo(() => {
    const k = parseInt(poissK, 10);
    const lambda = parseFloat(poissLambda);
    if (!Number.isFinite(lambda) || lambda <= 0) return null;
    const maxK = Math.min(60, Math.max(8, Math.ceil(lambda + 4 * Math.sqrt(lambda))));
    const points = Array.from({ length: maxK + 1 }, (_, i) => ({ x: i, y: poissonPMF(i, lambda) }));
    const markers = Number.isFinite(k) && k >= 0 && k <= maxK ? [k] : [];
    return { points, markers };
  }, [poissK, poissLambda]);

  const geometricChart = useMemo(() => {
    const k = parseInt(geomK, 10);
    const p = parseFloat(geomP);
    if (!Number.isFinite(p) || p <= 0 || p > 1) return null;
    const maxK = Math.min(50, Math.max(10, Math.ceil(6 / p)));
    const points = Array.from({ length: maxK }, (_, i) => ({ x: i + 1, y: geometricPMF(i + 1, p) }));
    const markers = Number.isFinite(k) && k >= 1 && k <= maxK ? [k] : [];
    return { points, markers };
  }, [geomK, geomP]);

  const uniformChart = useMemo(() => {
    const x = parseFloat(distX);
    const a = parseFloat(distA);
    const b = parseFloat(distB);
    if (![x, a, b].every(Number.isFinite) || b <= a) return null;
    const pad = (b - a) * 0.25;
    const lo = a - pad;
    const hi = b + pad;
    const points = Array.from({ length: 161 }, (_, i) => {
      const t = lo + ((hi - lo) * i) / 160;
      const inRange = t >= a && t <= b;
      return { x: t, y: inRange ? 1 / (b - a) : 0 };
    });
    return { points, shade: [a, b] as [number, number], markers: [x] };
  }, [distX, distA, distB]);

  const exponentialChart = useMemo(() => {
    const x = parseFloat(expX);
    const lambda = parseFloat(expLambda);
    if (![x, lambda].every(Number.isFinite) || lambda <= 0) return null;
    const hi = Math.max(5 / lambda, x * 1.3, 1 / lambda);
    const points = Array.from({ length: 121 }, (_, i) => {
      const t = (hi * i) / 120;
      return { x: t, y: exponentialPDF(t, lambda) };
    });
    const xc = Math.min(Math.max(x, 0), hi);
    return { points, shade: [0, xc] as [number, number], markers: [x] };
  }, [expX, expLambda]);

  const cltChart = useMemo(() => {
    if (!cltResult?.counts?.length || !Array.isArray(cltResult.bins)) return null;
    const points = cltResult.bins.map((b: number, i: number) => ({ x: b, y: cltResult.counts[i] ?? 0 }));
    const overlay = Array.isArray(cltResult.cltNormal?.x)
      ? cltResult.cltNormal.x.map((x: number, i: number) => ({ x, y: cltResult.cltNormal.y[i] ?? 0 }))
      : [];
    return { points, overlay, markers: [cltResult.theoreticalMean] };
  }, [cltResult]);

  const chiChart = useMemo(() => {
    const n = parseInt(chiN, 10);
    const x = parseFloat(chiX);
    if (!Number.isFinite(n) || n < 1 || n > 100) return null;
    const hi = Math.max(n * 3, x * 1.3, 1);
    const points = Array.from({ length: 121 }, (_, i) => {
      const t = (hi * i) / 120;
      return { x: t, y: chiSquarePDF(t, n) };
    });
    const xc = Math.min(Math.max(x, 0), hi);
    return { points, shade: [0, xc] as [number, number], markers: [x] };
  }, [chiX, chiN]);

  const tChart = useMemo(() => {
    const df = parseInt(tDf, 10);
    const t = parseFloat(tVal);
    if (!Number.isFinite(df) || df < 1 || df > 200) return null;
    const hi = Math.max(4, Math.abs(t) * 1.5);
    const lo = -hi;
    const points = Array.from({ length: 121 }, (_, i) => {
      const v = lo + ((hi - lo) * i) / 120;
      return { x: v, y: tDistPDF(v, df) };
    });
    const tc = Math.min(Math.max(t, lo), hi);
    return { points, shade: [lo, tc] as [number, number], markers: [t] };
  }, [tVal, tDf]);

  const fChart = useMemo(() => {
    const df1 = parseInt(fDf1, 10);
    const df2 = parseInt(fDf2, 10);
    const x = parseFloat(fX);
    if (!Number.isFinite(df1) || !Number.isFinite(df2) || df1 < 1 || df2 < 1) return null;
    const hi = Math.max(4, x * 1.5);
    const points = Array.from({ length: 121 }, (_, i) => {
      const t = 0.001 + (hi * i) / 120;
      return { x: t, y: fDistPDF(t, df1, df2) };
    });
    const xc = Math.min(Math.max(x, 0.001), hi);
    return { points, shade: [0.001, xc] as [number, number], markers: [x] };
  }, [fX, fDf1, fDf2]);

  const computeDist = () => {
    setError(null);
    try {
      if (activeTab === 'binomial') {
        const n = parseInt(binomN, 10), k = parseInt(binomK, 10), p = parseFloat(binomP);
        if (isNaN(n) || isNaN(k) || isNaN(p)) throw new Error('请输入有效数字');
        const res = binomPMF(k, n, p);
        setDistResult({ tab: activeTab, text: `P(X = ${k}) = ${formatResult(res)}\nE(X) = np = ${formatResult(n * p)}\nVar(X) = np(1-p) = ${formatResult(n * p * (1 - p))}` });
      } else if (activeTab === 'normal') {
        const x = parseFloat(normX), mu = parseFloat(normMu), sigma = parseFloat(normSigma);
        if (isNaN(x) || isNaN(mu) || isNaN(sigma)) throw new Error('请输入有效数字');
        const res = normalPDF(x, mu, sigma);
        setDistResult({ tab: activeTab, text: `f(${x}) = ${formatResult(res)}` });
      } else if (activeTab === 'poisson') {
        const k = parseInt(poissK, 10), lambda = parseFloat(poissLambda);
        if (isNaN(k) || isNaN(lambda)) throw new Error('请输入有效数字');
        const res = poissonPMF(k, lambda);
        setDistResult({ tab: activeTab, text: `P(X = ${k}) = ${formatResult(res)}` });
      } else if (activeTab === 'uniform') {
        const x = parseFloat(distX), a = parseFloat(distA), b = parseFloat(distB);
        if (isNaN(x) || isNaN(a) || isNaN(b)) throw new Error('请输入有效数字');
        const pdf = uniformPDF(x, a, b), cdf = uniformCDF(x, a, b);
        setDistResult({ tab: activeTab, text: `f(x) = ${formatResult(pdf)}\nF(x) = P(X ≤ x) = ${formatResult(cdf)}\nE(X) = (a+b)/2 = ${formatResult((a + b) / 2)}\nVar(X) = (b-a)²/12 = ${formatResult((b - a) ** 2 / 12)}` });
      } else if (activeTab === 'exponential') {
        const x = parseFloat(expX), lambda = parseFloat(expLambda);
        if (isNaN(x) || isNaN(lambda)) throw new Error('请输入有效数字');
        const pdf = exponentialPDF(x, lambda), cdf = exponentialCDF(x, lambda);
        setDistResult({ tab: activeTab, text: `f(x) = ${formatResult(pdf)}\nF(x) = P(X ≤ x) = ${formatResult(cdf)}\nE(X) = 1/λ = ${formatResult(1 / lambda)}\nVar(X) = 1/λ² = ${formatResult(1 / (lambda * lambda))}` });
      } else if (activeTab === 'geometric') {
        const k = parseInt(geomK, 10), p = parseFloat(geomP);
        if (isNaN(k) || isNaN(p)) throw new Error('请输入有效数字');
        const res = geometricPMF(k, p);
        setDistResult({ tab: activeTab, text: `P(X = ${k}) = ${formatResult(res)}\n首次成功在第 ${k} 次\nE(X) = 1/p = ${formatResult(1 / p)}\nVar(X) = (1-p)/p² = ${formatResult((1 - p) / (p * p))}` });
      } else if (activeTab === 'sampling') {
        const x = parseFloat(chiX), n = parseInt(chiN, 10);
        const t = parseFloat(tVal), tdf = parseInt(tDf, 10);
        const fx = parseFloat(fX), df1 = parseInt(fDf1, 10), df2 = parseInt(fDf2, 10);
        if (isNaN(x) || isNaN(n) || isNaN(t) || isNaN(tdf) || isNaN(fx) || isNaN(df1) || isNaN(df2)) throw new Error('请输入有效数字');
        const chiPdf = chiSquarePDF(x, n);
        const tPdf = tDistPDF(t, tdf);
        const fPdf = fDistPDF(fx, df1, df2);
        setDistResult({ tab: activeTab, text: `χ²(${n}) 在 x=${x} 处 PDF = ${formatResult(chiPdf)}\n\nt(${tdf}) 在 t=${t} 处 PDF = ${formatResult(tPdf)}\n\nF(${df1},${df2}) 在 x=${fx} 处 PDF = ${formatResult(fPdf)}` });
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setDistResult(null);
      toast.error('计算错误');
    }
  };

  const computeNcr = () => {
    setError(null);
    try {
      const n = parseInt(ncrN, 10), k = parseInt(ncrK, 10);
      if (isNaN(n) || isNaN(k)) throw new Error('请输入有效整数');
      const nCr = evaluate(`combinations(${n}, ${k})`) as number;
      const nPr = evaluate(`permutations(${n}, ${k})`) as number;
      setNcrResult(`C(${n}, ${k}) = ${formatResult(nCr)}\nP(${n}, ${k}) = ${formatResult(nPr)}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setNcrResult('');
      toast.error('计算错误');
    }
  };

  const calcBayes = () => {
    setError(null);
    try {
      const pA = parseFloat(bayesPA), pBgA = parseFloat(bayesBgA), pBgNotA = parseFloat(bayesBgNotA);
      const pAB = bayesTheorem(pA, pBgA, pBgNotA);
      setResult(`P(A|B) = P(B|A)·P(A) / P(B)\n       = ${formatResult(pBgA)} × ${formatResult(pA)} / (${formatResult(pBgA)}×${formatResult(pA)} + ${formatResult(pBgNotA)}×${formatResult(1 - pA)})\n       = ${formatResult(pAB)}\n\n后验概率 P(A|B) ≈ ${formatResult(pAB * 100)}%`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const calcConditional = () => {
    setError(null);
    try {
      const pAB = parseFloat(condPAB), pB = parseFloat(condPB);
      const p = conditionalProbability(pAB, pB);
      setResult(`P(A|B) = P(AB) / P(B) = ${formatResult(pAB)} / ${formatResult(pB)} = ${formatResult(p)}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const calcDiscrete = () => {
    setError(null);
    try {
      const xs = parseArr(discX), ps = parseArr(discP);
      const e = discreteExpectation(xs, ps);
      const v = discreteVariance(xs, ps);
      const e2 = e * e + v;
      setResult(`E(X) = Σ xᵢ·pᵢ = ${formatResult(e)}\nE(X²) = Σ xᵢ²·pᵢ = ${formatResult(e2)}\nVar(X) = E(X²) - [E(X)]² = ${formatResult(v)}\nσ = ${formatResult(Math.sqrt(v))}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const calcCov = () => {
    setError(null);
    try {
      const xs = parseArr(covX), ys = parseArr(covY);
      const cov = covariance(xs, ys);
      const rho = pearsonCorrelation(xs, ys);
      setResult(`Cov(X,Y) = ${formatResult(cov)}\nρ(X,Y) = ${formatResult(rho)}\n相关强度：${Math.abs(rho) > 0.8 ? '强相关' : Math.abs(rho) > 0.5 ? '中等相关' : Math.abs(rho) > 0.3 ? '弱相关' : '几乎不相关'}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const calcRegression = () => {
    setError(null);
    try {
      const xs = parseArr(regX), ys = parseArr(regY);
      const r = linearRegression(xs, ys);
      const sign = r.b >= 0 ? '+' : '-';
      setResult(`回归方程：ŷ = ${formatResult(r.k)}x ${sign} ${formatResult(Math.abs(r.b))}\n\nR² = ${formatResult(r.r2)}\n残差平方和 SSE = ${formatResult(r.ssRes)}\n总平方和 SST = ${formatResult(r.ssTot)}\n\n数据点：${xs.length} 个`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const calcConfidence = () => {
    setError(null);
    try {
      const mean = parseFloat(confMean), std = parseFloat(confStd), n = parseInt(confN, 10);
      const level = parseFloat(confLevel);
      const ci = confidenceIntervalMean(mean, std, n, level);
      setResult(`μ 的 ${(level * 100).toFixed(1)}% 置信区间：\n(${formatResult(ci.lower)}, ${formatResult(ci.upper)})\n\n边际误差 = ${formatResult(ci.margin)}\n标准误 = ${formatResult(std / Math.sqrt(n))}\n样本量 n = ${n}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const calcHypothesis = (type: 'z' | 't') => {
    setError(null);
    try {
      if (type === 'z') {
        const mu0 = parseFloat(ztestMu0), xbar = parseFloat(ztestXbar);
        const sigma = parseFloat(ztestSigma), n = parseInt(ztestN, 10);
        const r = zTest(xbar, mu0, sigma, n);
        setResult(`Z 检验（已知 σ）\nH₀: μ = ${mu0}\nH₁: μ ≠ ${mu0}\n\n统计量 Z = ${formatResult(r.z)}\np 值 ≈ ${formatResult(r.pValue)}\n\n${r.pValue < 0.05 ? 'p < 0.05，拒绝 H₀' : 'p ≥ 0.05，不拒绝 H₀'}`);
      } else {
        const mu0 = parseFloat(ttestMu0), xbar = parseFloat(ttestXbar);
        const s = parseFloat(ttestS), n = parseInt(ttestN, 10);
        const r = tTestOneSample(xbar, mu0, s, n);
        setResult(`t 检验（σ 未知，用样本 s）\nH₀: μ = ${mu0}\nH₁: μ ≠ ${mu0}\n自由度 df = ${r.df}\n\n统计量 t = ${formatResult(r.t)}\np 值 ≈ ${formatResult(r.pValue)}\n\n${r.pValue < 0.05 ? 'p < 0.05，拒绝 H₀' : 'p ≥ 0.05，不拒绝 H₀'}`);
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const calcClassical = () => {
    setError(null);
    try {
      const n = parseInt(classicalN, 10), k = parseInt(classicalK, 10);
      const p = classicalProbability(n, k);
      setResult(`P = k/n = ${k}/${n} = ${formatResult(p)} ≈ ${formatResult(p * 100)}%`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const calcChebyshev = () => {
    setError(null);
    try {
      const mu = parseFloat(chebMu), sigma = parseFloat(chebSigma), k = parseFloat(chebK);
      const bound = chebyshevBound(mu, sigma, k);
      setResult(`切比雪夫不等式：\nP(|X - μ| ≥ kσ) ≤ 1/k²\n\n当 k = ${k} 时：\nP(|X - ${formatResult(mu)}| ≥ ${k}·${formatResult(sigma)}) ≤ ${formatResult(bound)} ≈ ${formatResult(bound * 100)}%\n\n即至少 ${formatResult((1 - bound) * 100)}% 的数据落在 μ ± kσ 范围内`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const runSimulation = () => {
    setError(null);
    try {
      const n = parseInt(simN, 10);
      const sim = coinFlipSimulation(n);
      setSimResult({ freq: sim.finalFrequency, n });
      setResult(`大数定律模拟（硬币抛掷）\n\n总次数：${n}\n正面朝上：${Math.round(sim.finalFrequency * n)} 次\n频率：${formatResult(sim.finalFrequency)}\n\n随着 n → ∞，频率 → 0.5（概率）\n与 0.5 的偏差：${formatResult(Math.abs(sim.finalFrequency - 0.5))}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      setSimResult(null);
      toast.error('计算错误');
    }
  };

  const computeMGF = () => {
    setError(null);
    try {
      const params: Record<string, number> = {};
      const name = mgfDist.toLowerCase();
      if (name === 'normal') { params.mu = parseFloat(mgfMu); params.sigma = parseFloat(mgfSigma); }
      else if (name === 'exponential') { params.lambda = parseFloat(mgfLambda); }
      else if (name === 'bernoulli') { params.p = parseFloat(mgfP); }
      else if (name === 'binomial') { params.n = parseInt(mgfN, 10); params.p = parseFloat(mgfP); }
      else if (name === 'poisson') { params.lambda = parseFloat(mgfLambda); }
      else if (name === 'geometric') { params.p = parseFloat(mgfP); }
      else if (name === 'uniform') { params.a = parseFloat(cltA); params.b = parseFloat(cltB); }
      const r = mgf(name, params);
      setResult(`矩母函数 M(t)\n\n分布：${mgfDist}\nM(t) = ${r.mgfLatex}\n定义域：${r.domain}\n\n均值 E[X] = ${formatResult(r.mean)}\n方差 Var(X) = ${formatResult(r.variance)}\n偏度 = ${formatResult(r.skewness)}\n峰度 = ${formatResult(r.kurtosis)}（超额峰度 = ${formatResult(r.kurtosis - 3)}）\n\n各阶矩：\n${r.moments.map(m => `  E[X^${m.order}] = ${formatResult(m.value)}`).join('\n')}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const runCLTSimulation = () => {
    setError(null);
    setCltResult(null);
    try {
      const sampleSize = parseInt(cltSampleSize, 10);
      const numSamples = parseInt(cltNumSamples, 10);
      const params: Record<string, number> = {};
      if (cltDist === 'dice') { }
      else if (cltDist === 'uniform') { params.a = parseFloat(cltA); params.b = parseFloat(cltB); }
      else if (cltDist === 'bernoulli') { params.p = parseFloat(cltP); }
      else if (cltDist === 'exponential') { params.lambda = parseFloat(cltLambda); }
      const r = cltSimulation(cltDist, params, sampleSize, numSamples);
      setCltResult(r);
      setResult(`中心极限定理模拟\n\n分布：${cltDist}\n每个样本大小 n = ${sampleSize}\n模拟样本数 = ${numSamples}\n\n理论均值 μ = ${formatResult(r.theoreticalMean)}\n理论标准差 σ = ${formatResult(r.theoreticalStd)}\n样本均值的均值 = ${formatResult(r.sampleMeans.reduce((a: number, b: number) => a + b, 0) / r.sampleMeans.length)}\n\n当 n → ∞ 时，样本均值 X̄ ~ N(μ, σ²/n) 近似正态分布`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const runHypothesisFull = () => {
    setError(null);
    try {
      const sample = parseArr(htSample);
      const mu0 = parseFloat(htMu0);
      const alpha = parseFloat(htAlpha);
      const sigma = htType === 'z' ? parseFloat(htSigma) : undefined;
      const r = hypothesisTest(htType, htTail, sample, mu0, sigma, alpha);
      const tailLabel = htTail === 'left' ? '左侧' : htTail === 'right' ? '右侧' : '双侧';
      setResult(`假设检验完整流程（${htType.toUpperCase()} 检验 · ${tailLabel}）\n\n原假设 H₀：${r.nullHypothesis}\n备择假设 H₁：${r.altHypothesis}\n\n样本量 n = ${r.sampleSize}\n样本均值 x̄ = ${formatResult(r.sampleMean)}\n样本标准差 s = ${formatResult(r.sampleStd)}${r.df !== undefined ? `\n自由度 df = ${r.df}` : ''}\n\n检验统计量 ${htType.toUpperCase()} = ${formatResult(r.testStatistic)}\n临界值 = ${formatResult(r.criticalValue)}\n拒绝域：${r.rejectionRegion}\np 值 = ${formatResult(r.pValue)}\n显著性水平 α = ${r.alpha}\n\n结论：${r.conclusion}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="概率统计"
        description="描述性统计、概率分布、参数估计、假设检验与回归分析。"
        eyebrow="学科 · 概率与统计"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-4xl mx-auto space-y-8">
        <RelatedExplainers ids={['bayes', 'distribution']} />
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <LearningSection moduleKey="probability" />
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="descriptive">描述统计</TabsTrigger>
                <TabsTrigger value="discrete">期望方差</TabsTrigger>
                <TabsTrigger value="binomial">二项分布</TabsTrigger>
                <TabsTrigger value="normal">正态分布</TabsTrigger>
                <TabsTrigger value="poisson">泊松分布</TabsTrigger>
                <TabsTrigger value="geometric">几何分布</TabsTrigger>
                <TabsTrigger value="uniform">均匀分布</TabsTrigger>
                <TabsTrigger value="exponential">指数分布</TabsTrigger>
                <TabsTrigger value="sampling">三大分布</TabsTrigger>
                <TabsTrigger value="bayes">贝叶斯</TabsTrigger>
                <TabsTrigger value="conditional">条件概率</TabsTrigger>
                <TabsTrigger value="covariance">协方差</TabsTrigger>
                <TabsTrigger value="regression">线性回归</TabsTrigger>
                <TabsTrigger value="confidence">置信区间</TabsTrigger>
                <TabsTrigger value="hypothesis">假设检验</TabsTrigger>
                <TabsTrigger value="classical">古典概型</TabsTrigger>
                <TabsTrigger value="chebyshev">切比雪夫</TabsTrigger>
                <TabsTrigger value="simulation">大数定律</TabsTrigger>
                <TabsTrigger value="combinatorics">排列组合</TabsTrigger>
                <TabsTrigger value="mgf">矩母函数</TabsTrigger>
                <TabsTrigger value="clt">中心极限</TabsTrigger>
                <TabsTrigger value="hyptest">完整检验</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                <TabsContent value="descriptive" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">数据列表（逗号或空格分隔）</label>
                    <Textarea value={dataInput} onChange={(e) => setDataInput(e.target.value)} className="font-mono min-h-[80px] bg-card" spellCheck={false} />
                  </div>
                  <Button onClick={computeStats} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算统计量
                  </Button>
                  {Object.keys(statsResult).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                      {Object.entries(statsResult).map(([k, v]) => (
                        <div key={k} className="bg-muted/50 rounded-lg p-3 border border-border/60">
                          <div className="text-xs text-muted-foreground mb-1">{k}</div>
                          <div className="font-mono text-emerald-800 font-semibold break-all">{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {descriptiveChart && (
                    <div className="rounded-xl border border-border/60 bg-card p-3">
                      <div className="mb-1 text-xs text-muted-foreground">数据直方图 · 虚线为均值与中位数</div>
                      <DistributionChart kind="histogram" points={descriptiveChart.points} markers={descriptiveChart.markers} height={200} yLabel="频数" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="discrete" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">X 取值</label>
                      <Input value={discX} onChange={e => setDiscX(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">对应概率 P</label>
                      <Input value={discP} onChange={e => setDiscP(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={calcDiscrete} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 E(X), Var(X)
                  </Button>
                  {discreteChart && (
                    <div className="rounded-xl border border-border/60 bg-card p-3">
                      <div className="mb-1 text-xs text-muted-foreground">分布律 P(X=x)</div>
                      <DistributionChart kind="pmf" points={discreteChart.points} height={200} xLabel="x" yLabel="P" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="binomial" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">n</label><Input value={binomN} onChange={e => setBinomN(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">k</label><Input value={binomK} onChange={e => setBinomK(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">p</label><Input value={binomP} onChange={e => setBinomP(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={computeDist} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 P(X=k)
                  </Button>
                  {distResult?.tab === 'binomial' && <ResultBox text={distResult.text} />}
                  {binomialChart && (
                    <div className="rounded-xl border border-border/60 bg-card p-3">
                      <div className="mb-1 text-xs text-muted-foreground">B(n, p) 分布律 · 虚线为当前 k</div>
                      <DistributionChart kind="pmf" points={binomialChart.points} markers={binomialChart.markers} height={220} xLabel="k" yLabel="P(X=k)" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="normal" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">x</label><Input value={normX} onChange={e => setNormX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">μ</label><Input value={normMu} onChange={e => setNormMu(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">σ</label><Input value={normSigma} onChange={e => setNormSigma(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={computeDist} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算概率密度
                  </Button>
                  {distResult?.tab === 'normal' && <ResultBox text={distResult.text} />}
                  {normalChart && (
                    <div className="rounded-xl border border-border/60 bg-card p-3">
                      <div className="mb-1 text-xs text-muted-foreground">N(μ, σ²) 密度曲线 · 阴影为 P(X ≤ x)</div>
                      <DistributionChart kind="pdf" points={normalChart.points} shade={normalChart.shade} markers={normalChart.markers} height={220} xLabel="x" yLabel="f(x)" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="poisson" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">k</label><Input value={poissK} onChange={e => setPoissK(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">λ</label><Input value={poissLambda} onChange={e => setPoissLambda(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={computeDist} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 P(X=k)
                  </Button>
                  {distResult?.tab === 'poisson' && <ResultBox text={distResult.text} />}
                  {poissonChart && (
                    <div className="rounded-xl border border-border/60 bg-card p-3">
                      <div className="mb-1 text-xs text-muted-foreground">Poisson(λ) 分布律 · 虚线为当前 k</div>
                      <DistributionChart kind="pmf" points={poissonChart.points} markers={poissonChart.markers} height={220} xLabel="k" yLabel="P(X=k)" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="geometric" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">k（首次成功次数）</label><Input value={geomK} onChange={e => setGeomK(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">p（单次成功概率）</label><Input value={geomP} onChange={e => setGeomP(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={computeDist} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 P(X=k)
                  </Button>
                  {distResult?.tab === 'geometric' && <ResultBox text={distResult.text} />}
                  {geometricChart && (
                    <div className="rounded-xl border border-border/60 bg-card p-3">
                      <div className="mb-1 text-xs text-muted-foreground">Geometric(p) 分布律 · 虚线为当前 k</div>
                      <DistributionChart kind="pmf" points={geometricChart.points} markers={geometricChart.markers} height={220} xLabel="k" yLabel="P(X=k)" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="uniform" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">x</label><Input value={distX} onChange={e => setDistX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">a (下界)</label><Input value={distA} onChange={e => setDistA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">b (上界)</label><Input value={distB} onChange={e => setDistB(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={computeDist} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 PDF/CDF
                  </Button>
                  {distResult?.tab === 'uniform' && <ResultBox text={distResult.text} />}
                  {uniformChart && (
                    <div className="rounded-xl border border-border/60 bg-card p-3">
                      <div className="mb-1 text-xs text-muted-foreground">U(a, b) 密度函数 · 阴影为 [a, b]</div>
                      <DistributionChart kind="pdf" points={uniformChart.points} shade={uniformChart.shade} markers={uniformChart.markers} height={200} xLabel="x" yLabel="f(x)" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="exponential" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">x</label><Input value={expX} onChange={e => setExpX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">λ</label><Input value={expLambda} onChange={e => setExpLambda(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={computeDist} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 PDF/CDF
                  </Button>
                  {distResult?.tab === 'exponential' && <ResultBox text={distResult.text} />}
                  {exponentialChart && (
                    <div className="rounded-xl border border-border/60 bg-card p-3">
                      <div className="mb-1 text-xs text-muted-foreground">Exp(λ) 密度曲线 · 阴影为 P(X ≤ x)</div>
                      <DistributionChart kind="pdf" points={exponentialChart.points} shade={exponentialChart.shade} markers={exponentialChart.markers} height={200} xLabel="x" yLabel="f(x)" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sampling" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">χ² x</label><Input value={chiX} onChange={e => setChiX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">χ² n</label><Input value={chiN} onChange={e => setChiN(e.target.value)} className="font-mono" /></div>
                    <div className="text-xs text-muted-foreground self-end">卡方分布</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">t 值</label><Input value={tVal} onChange={e => setTVal(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">t df</label><Input value={tDf} onChange={e => setTDf(e.target.value)} className="font-mono" /></div>
                    <div className="text-xs text-muted-foreground self-end">t 分布</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">F x</label><Input value={fX} onChange={e => setFX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">df1</label><Input value={fDf1} onChange={e => setFDf1(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">df2</label><Input value={fDf2} onChange={e => setFDf2(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={computeDist} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算概率密度
                  </Button>
                  {distResult?.tab === 'sampling' && <ResultBox text={distResult.text} />}
                  <div className="grid gap-3 md:grid-cols-3">
                    {chiChart && (
                      <div className="rounded-xl border border-border/60 bg-card p-3">
                        <div className="mb-1 text-xs text-muted-foreground">χ²({chiN}) 密度</div>
                        <DistributionChart kind="pdf" points={chiChart.points} shade={chiChart.shade} markers={chiChart.markers} height={150} />
                      </div>
                    )}
                    {tChart && (
                      <div className="rounded-xl border border-border/60 bg-card p-3">
                        <div className="mb-1 text-xs text-muted-foreground">t({tDf}) 密度</div>
                        <DistributionChart kind="pdf" points={tChart.points} shade={tChart.shade} markers={tChart.markers} height={150} />
                      </div>
                    )}
                    {fChart && (
                      <div className="rounded-xl border border-border/60 bg-card p-3">
                        <div className="mb-1 text-xs text-muted-foreground">F({fDf1},{fDf2}) 密度</div>
                        <DistributionChart kind="pdf" points={fChart.points} shade={fChart.shade} markers={fChart.markers} height={150} />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="bayes" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">P(A)</label><Input value={bayesPA} onChange={e => setBayesPA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">P(B|A)</label><Input value={bayesBgA} onChange={e => setBayesBgA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">P(B|¬A)</label><Input value={bayesBgNotA} onChange={e => setBayesBgNotA(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={calcBayes} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 P(A|B)
                  </Button>
                </TabsContent>

                <TabsContent value="conditional" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">P(AB)</label><Input value={condPAB} onChange={e => setCondPAB(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">P(B)</label><Input value={condPB} onChange={e => setCondPB(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={calcConditional} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 P(A|B)
                  </Button>
                </TabsContent>

                <TabsContent value="covariance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">X 数据</label><Input value={covX} onChange={e => setCovX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">Y 数据</label><Input value={covY} onChange={e => setCovY(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={calcCov} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 Cov 和 ρ
                  </Button>
                </TabsContent>

                <TabsContent value="regression" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">X</label><Input value={regX} onChange={e => setRegX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">Y</label><Input value={regY} onChange={e => setRegY(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={calcRegression} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算回归方程
                  </Button>
                </TabsContent>

                <TabsContent value="confidence" className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">样本均值</label><Input value={confMean} onChange={e => setConfMean(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">样本标准差</label><Input value={confStd} onChange={e => setConfStd(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">样本量 n</label><Input value={confN} onChange={e => setConfN(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">置信水平</label><Input value={confLevel} onChange={e => setConfLevel(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={calcConfidence} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算置信区间
                  </Button>
                </TabsContent>

                <TabsContent value="hypothesis" className="space-y-4">
                  <div className="text-sm font-medium text-foreground mb-1">Z 检验（σ 已知）</div>
                  <div className="grid grid-cols-4 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">μ₀</label><Input value={ztestMu0} onChange={e => setZtestMu0(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">x̄</label><Input value={ztestXbar} onChange={e => setZtestXbar(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">σ</label><Input value={ztestSigma} onChange={e => setZtestSigma(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">n</label><Input value={ztestN} onChange={e => setZtestN(e.target.value)} className="font-mono" /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => calcHypothesis('z')} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />Z 检验
                    </Button>
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1 mt-4">t 检验（σ 未知）</div>
                  <div className="grid grid-cols-4 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">μ₀</label><Input value={ttestMu0} onChange={e => setTtestMu0(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">x̄</label><Input value={ttestXbar} onChange={e => setTtestXbar(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">s</label><Input value={ttestS} onChange={e => setTtestS(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">n</label><Input value={ttestN} onChange={e => setTtestN(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => calcHypothesis('t')} variant="secondary">
                    <Play className="size-4 mr-2" />t 检验
                  </Button>
                </TabsContent>

                <TabsContent value="classical" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">总情况数 n</label><Input value={classicalN} onChange={e => setClassicalN(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">有利情况数 k</label><Input value={classicalK} onChange={e => setClassicalK(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={calcClassical} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算概率
                  </Button>
                </TabsContent>

                <TabsContent value="chebyshev" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">μ</label><Input value={chebMu} onChange={e => setChebMu(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">σ</label><Input value={chebSigma} onChange={e => setChebSigma(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">k</label><Input value={chebK} onChange={e => setChebK(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={calcChebyshev} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算上界
                  </Button>
                </TabsContent>

                <TabsContent value="simulation" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">抛掷次数</label><Input value={simN} onChange={e => setSimN(e.target.value)} className="font-mono" /></div>
                    {simResult && (
                      <div className="flex items-end">
                        <div className="text-sm text-muted-foreground">正面频率：<span className="font-mono text-emerald-700 font-semibold">{formatResult(simResult.freq)}</span></div>
                      </div>
                    )}
                  </div>
                  <Button onClick={runSimulation} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />开始模拟
                  </Button>
                </TabsContent>

                <TabsContent value="combinatorics" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">n</label><Input value={ncrN} onChange={e => setNcrN(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">k</label><Input value={ncrK} onChange={e => setNcrK(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={computeNcr} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算
                  </Button>
                  {ncrResult && <ResultBox text={ncrResult} />}
                </TabsContent>

                {/* 矩母函数 MGF */}
                <TabsContent value="mgf" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">分布类型</label>
                    <select value={mgfDist} onChange={e => setMgfDist(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-card text-sm">
                      <option value="normal">正态分布 N(μ,σ²)</option>
                      <option value="exponential">指数分布 Exp(λ)</option>
                      <option value="bernoulli">伯努利分布 Ber(p)</option>
                      <option value="binomial">二项分布 B(n,p)</option>
                      <option value="poisson">泊松分布 Poisson(λ)</option>
                      <option value="geometric">几何分布 Geo(p)</option>
                      <option value="uniform">均匀分布 U(a,b)</option>
                    </select>
                  </div>
                  {mgfDist === 'normal' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-muted-foreground mb-1 block">μ</label><Input value={mgfMu} onChange={e => setMgfMu(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1 block">σ</label><Input value={mgfSigma} onChange={e => setMgfSigma(e.target.value)} className="font-mono" /></div>
                    </div>
                  )}
                  {(mgfDist === 'exponential' || mgfDist === 'poisson') && (
                    <div className="max-w-xs"><label className="text-xs text-muted-foreground mb-1 block">λ</label><Input value={mgfLambda} onChange={e => setMgfLambda(e.target.value)} className="font-mono" /></div>
                  )}
                  {(mgfDist === 'bernoulli' || mgfDist === 'binomial' || mgfDist === 'geometric') && (
                    <div className="grid grid-cols-2 gap-3">
                      {mgfDist === 'binomial' && <div><label className="text-xs text-muted-foreground mb-1 block">n</label><Input value={mgfN} onChange={e => setMgfN(e.target.value)} className="font-mono" /></div>}
                      <div><label className="text-xs text-muted-foreground mb-1 block">p</label><Input value={mgfP} onChange={e => setMgfP(e.target.value)} className="font-mono" /></div>
                    </div>
                  )}
                  {mgfDist === 'uniform' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-muted-foreground mb-1 block">a</label><Input value={cltA} onChange={e => setCltA(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1 block">b</label><Input value={cltB} onChange={e => setCltB(e.target.value)} className="font-mono" /></div>
                    </div>
                  )}
                  <Button onClick={computeMGF} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 MGF 与各阶矩
                  </Button>
                </TabsContent>

                {/* 中心极限定理模拟 */}
                <TabsContent value="clt" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">分布类型</label>
                      <select value={cltDist} onChange={e => setCltDist(e.target.value as any)} className="w-full h-9 px-3 rounded-md border border-border bg-card text-sm">
                        <option value="dice">骰子 (均匀离散)</option>
                        <option value="uniform">均匀分布 U(a,b)</option>
                        <option value="bernoulli">伯努利 Ber(p)</option>
                        <option value="exponential">指数 Exp(λ)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">每个样本大小 n</label>
                      <Input value={cltSampleSize} onChange={e => setCltSampleSize(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">模拟样本数（10~20000）</label>
                    <Input value={cltNumSamples} onChange={e => setCltNumSamples(e.target.value)} className="font-mono" />
                  </div>
                  {cltDist === 'uniform' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-muted-foreground mb-1 block">a</label><Input value={cltA} onChange={e => setCltA(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1 block">b</label><Input value={cltB} onChange={e => setCltB(e.target.value)} className="font-mono" /></div>
                    </div>
                  )}
                  {cltDist === 'bernoulli' && (
                    <div className="max-w-xs"><label className="text-xs text-muted-foreground mb-1 block">p</label><Input value={cltP} onChange={e => setCltP(e.target.value)} className="font-mono" /></div>
                  )}
                  {cltDist === 'exponential' && (
                    <div className="max-w-xs"><label className="text-xs text-muted-foreground mb-1 block">λ</label><Input value={cltLambda} onChange={e => setCltLambda(e.target.value)} className="font-mono" /></div>
                  )}
                  <Button onClick={runCLTSimulation} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />运行 CLT 模拟
                  </Button>
                  {cltResult && (
                    <div className="text-xs text-muted-foreground">
                      直方图分箱数：{cltResult.counts?.length || 0}，理论均值 μ = {formatResult(cltResult.theoreticalMean)}，理论 σ = {formatResult(cltResult.theoreticalStd)}
                    </div>
                  )}
                  {cltChart && (
                    <div className="rounded-xl border border-border/60 bg-card p-3">
                      <div className="mb-1 text-xs text-muted-foreground">
                        样本均值分布直方图 · 第三条曲线为正态近似，虚线为理论均值 μ
                      </div>
                      <DistributionChart
                        kind="histogram"
                        points={cltChart.points}
                        overlay={cltChart.overlay}
                        markers={cltChart.markers}
                        height={280}
                        xLabel="样本均值"
                        yLabel="频数"
                      />
                    </div>
                  )}
                </TabsContent>

                {/* 完整假设检验 */}
                <TabsContent value="hyptest" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">检验类型</label>
                      <select value={htType} onChange={e => setHtType(e.target.value as any)} className="w-full h-9 px-3 rounded-md border border-border bg-card text-sm">
                        <option value="z">Z 检验（σ 已知）</option>
                        <option value="t">t 检验（σ 未知）</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">检验方向</label>
                      <select value={htTail} onChange={e => setHtTail(e.target.value as any)} className="w-full h-9 px-3 rounded-md border border-border bg-card text-sm">
                        <option value="two">双侧检验</option>
                        <option value="right">右侧检验</option>
                        <option value="left">左侧检验</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">样本数据（空格/逗号分隔）</label>
                    <Input value={htSample} onChange={e => setHtSample(e.target.value)} className="font-mono" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">μ₀（假设均值）</label><Input value={htMu0} onChange={e => setHtMu0(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">α（显著性水平）</label><Input value={htAlpha} onChange={e => setHtAlpha(e.target.value)} className="font-mono" /></div>
                    {htType === 'z' && <div><label className="text-xs text-muted-foreground mb-1 block">σ（总体标准差）</label><Input value={htSigma} onChange={e => setHtSigma(e.target.value)} className="font-mono" /></div>}
                  </div>
                  <Button onClick={runHypothesisFull} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />执行假设检验
                  </Button>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <HistoryPanel
          open={historyOpen}
          history={history}
          onToggle={() => setHistoryOpen((o) => !o)}
          onClear={clearHistory}
          onSelect={(item) => setResult(item.result)}
          theme="blue"
          className="mb-4"
        />

        {result && !error ? (
          <Card className="board-surface board-surface bg-[var(--board-bg)] border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-emerald-400/70 font-medium tracking-wider">计算结果</div>
                <button
                  onClick={() => setViewMode((m) => (m === 'formatted' ? 'text' : 'formatted'))}
                  className="h-6 px-2 text-xs text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-md transition-colors flex items-center gap-1"
                >
                  {viewMode === 'formatted' ? (
                    <><Calculator className="size-3" /> 排版</>  
                  ) : (
                    <><Type className="size-3" /> 文本</>
                  )}
                </button>
              </div>
              {viewMode === 'formatted' ? (
                <div className="text-emerald-300 text-base leading-relaxed space-y-1.5 overflow-x-auto">
                  {result.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (trimmed === '') return <div key={i} className="h-2" />;
                    if (/^[\u4e00-\u9fa5]/.test(trimmed) || /^[a-zA-Z\s]*[：:]/.test(trimmed)) {
                      return <div key={i} className="text-xs text-emerald-400/70">{line}</div>;
                    }
                    return <div key={i}><MathRenderer expression={line} isInput /></div>;
                  })}
                </div>
              ) : (
                <div className="text-emerald-300 font-mono text-lg whitespace-pre-wrap break-all leading-relaxed">{result}</div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {error && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40">
            <CardContent className="p-4 text-red-700 dark:text-red-400 text-sm">{error}</CardContent>
          </Card>
        )}

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600" />快速示例
            </h3>
            <div className="flex flex-wrap gap-2">
              {STATS_EXAMPLES.map((ex, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => { setDataInput(ex); setActiveTab('descriptive'); }}>
                  数据集 {i + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CheatsheetDialog moduleKey="probability" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}

function ResultBox({ text }: { text: string }) {
  return (
    <div className="board-surface board-surface bg-[var(--board-bg)] rounded-xl p-4 overflow-x-auto">
      <div className="text-xs text-emerald-400/70 mb-2 font-medium tracking-wider">结果</div>
      <div className="text-emerald-300 text-base leading-relaxed">
        <MathRenderer expression={text} isInput />
      </div>
    </div>
  );
}
