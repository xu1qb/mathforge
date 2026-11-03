import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import MathInputField from '@/components/MathInputField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/PageHeader';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Info, Calculator, Type } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import { toast } from 'sonner';
import { useHistory } from '@/hooks/useHistory';
import HistoryPanel from '@/components/HistoryPanel';
import {
  classifyPDE,
  dAlembertWave,
  heatEquationSeries,
  vibrationStringSeries,
  laplaceCircle,
  laplaceRectangular,
  heatKernel,
  fourierTransformHeat,
  wellPosedCheck,
  besselJ,
  legendreP,
  associatedLegendreP,
} from '@/lib/math-pde-geo-comp';
import { formatResult } from '@/lib/math-utils';

const TABS = [
  { value: 'classify', label: 'PDE分类' },
  { value: 'dalembert', label: '达朗贝尔行波' },
  { value: 'heateq', label: '热传导方程' },
  { value: 'vibration', label: '弦振动方程' },
  { value: 'laplace-rect', label: '拉普拉斯矩形域' },
  { value: 'laplace-circle', label: '拉普拉斯圆域' },
  { value: 'heat-kernel', label: '热核基本解' },
  { value: 'fourier-pde', label: '傅里叶变换法' },
  { value: 'wellposed', label: '定解问题判定' },
  { value: 'bessel', label: '贝塞尔函数' },
  { value: 'legendre', label: '勒让德多项式' },
  { value: 'assoc-legendre', label: '连带勒让德' },
];

function ResultBox({ text, error }: { text: string; error: string | null }) {
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted');
  return (
    <>
      {text && (
        <div className="bg-[var(--board-bg)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-emerald-400/70 font-medium tracking-wider">结果</div>
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
            <div className="text-emerald-300 text-sm leading-relaxed space-y-1 overflow-x-auto">
              {text.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (trimmed === '') return <div key={i} className="h-1.5" />;
                if (/^[\u4e00-\u9fa5]/.test(trimmed) || /^[a-zA-Z\s]*[：:]/.test(trimmed)) {
                  return <div key={i} className="text-xs text-emerald-400/70">{line}</div>;
                }
                return <div key={i}><MathRenderer expression={line} isInput /></div>;
              })}
            </div>
          ) : (
            <div className="text-emerald-300 font-mono text-sm whitespace-pre-wrap break-all">{text}</div>
          )}
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm">{error}</div>
      )}
    </>
  );
}

export default function PDEPage() {
  const [activeTab, setActiveTab] = useState('classify');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_pde_history' });
  const lastResultRef = useRef('');

  // 1. PDE分类
  const [pdeA, setPdeA] = useState('1');
  const [pdeB, setPdeB] = useState('0');
  const [pdeC, setPdeC] = useState('1');
  const [classifyResult, setClassifyResult] = useState('');

  // 监听分类结果变化，自动记录历史
  useEffect(() => {
    if (classifyResult && classifyResult !== lastResultRef.current) {
      addItem(activeTab, classifyResult);
      lastResultRef.current = classifyResult;
    }
  }, [classifyResult, activeTab, addItem]);
  const [classifyError, setClassifyError] = useState<string | null>(null);

  const computeClassify = () => {
    setClassifyError(null);
    try {
      const A = parseFloat(pdeA), B = parseFloat(pdeB), C = parseFloat(pdeC);
      if (isNaN(A) || isNaN(B) || isNaN(C)) throw new Error('请输入有效的A、B、C值');
      const r = classifyPDE(A, B, C);
      setClassifyResult(`类型: ${r.type}\n判别式 B²-4AC = ${r.discriminant}\n${r.description}`);
    } catch (e) {
      const msg = (e as Error).message;
      setClassifyError(msg);
      toast.error(msg);
    }
  };

  // 2. 达朗贝尔行波
  const [dalPhi, setDalPhi] = useState('sin(x)');
  const [dalPsi, setDalPsi] = useState('0');
  const [dalC, setDalC] = useState('1');
  const [dalX, setDalX] = useState('0.5');
  const [dalT, setDalT] = useState('0.3');
  const [dalResult, setDalResult] = useState('');
  const [dalError, setDalError] = useState<string | null>(null);

  const computeDalembert = () => {
    setDalError(null);
    try {
      const c = parseFloat(dalC), x = parseFloat(dalX), t = parseFloat(dalT);
      if (isNaN(c) || isNaN(x) || isNaN(t)) throw new Error('请输入有效的数值');
      const u = dAlembertWave(dalPhi, dalPsi, c, x, t);
      setDalResult(`u(${x}, ${t}) = ${formatResult(u)}\n\n达朗贝尔公式:\nu(x,t) = [φ(x-ct)+φ(x+ct)]/2 + 1/(2c)·∫_{x-ct}^{x+ct} ψ(s)ds`);
    } catch (e) {
      const msg = (e as Error).message;
      setDalError(msg);
      toast.error(msg);
    }
  };

  // 3. 热传导方程
  const [heatF, setHeatF] = useState('sin(pi*x)');
  const [heatL, setHeatL] = useState('1');
  const [heatK, setHeatK] = useState('1');
  const [heatN, setHeatN] = useState('30');
  const [heatX, setHeatX] = useState('0.5');
  const [heatT, setHeatT] = useState('0.1');
  const [heatResult, setHeatResult] = useState('');
  const [heatError, setHeatError] = useState<string | null>(null);

  const computeHeat = () => {
    setHeatError(null);
    try {
      const L = parseFloat(heatL), k = parseFloat(heatK), N = parseInt(heatN);
      const x = parseFloat(heatX), t = parseFloat(heatT);
      if (isNaN(L) || isNaN(k) || isNaN(N) || isNaN(x) || isNaN(t)) throw new Error('请输入有效的数值');
      if (N < 1) throw new Error('级数项数N必须≥1');
      const u = heatEquationSeries(heatF, L, k, N, x, t);
      setHeatResult(`u(${x}, ${t}) = ${formatResult(u)}\n\n分离变量解:\nu(x,t) = Σ b_n sin(nπx/L) e^{-k(nπ/L)²t}\nb_n = (2/L)∫₀ᴸ f(x) sin(nπx/L) dx\n级数项数: N=${N}`);
    } catch (e) {
      const msg = (e as Error).message;
      setHeatError(msg);
      toast.error(msg);
    }
  };

  // 4. 弦振动方程
  const [vibPhi, setVibPhi] = useState('sin(pi*x)');
  const [vibPsi, setVibPsi] = useState('0');
  const [vibL, setVibL] = useState('1');
  const [vibC, setVibC] = useState('1');
  const [vibN, setVibN] = useState('20');
  const [vibX, setVibX] = useState('0.5');
  const [vibT, setVibT] = useState('0.25');
  const [vibResult, setVibResult] = useState('');
  const [vibError, setVibError] = useState<string | null>(null);

  const computeVibration = () => {
    setVibError(null);
    try {
      const L = parseFloat(vibL), c = parseFloat(vibC), N = parseInt(vibN);
      const x = parseFloat(vibX), t = parseFloat(vibT);
      if (isNaN(L) || isNaN(c) || isNaN(N) || isNaN(x) || isNaN(t)) throw new Error('请输入有效的数值');
      if (N < 1) throw new Error('级数项数N必须≥1');
      const u = vibrationStringSeries(vibPhi, vibPsi, L, c, N, x, t);
      setVibResult(`u(${x}, ${t}) = ${formatResult(u)}\n\n弦振动分离变量解:\nu(x,t) = Σ [a_n cos(nπct/L) + b_n sin(nπct/L)] sin(nπx/L)\n级数项数: N=${N}`);
    } catch (e) {
      const msg = (e as Error).message;
      setVibError(msg);
      toast.error(msg);
    }
  };

  // 5. 拉普拉斯矩形域
  const [rectTop, setRectTop] = useState('sin(pi*x)');
  const [rectBottom, setRectBottom] = useState('0');
  const [rectLeft, setRectLeft] = useState('0');
  const [rectRight, setRectRight] = useState('0');
  const [rectLx, setRectLx] = useState('1');
  const [rectLy, setRectLy] = useState('1');
  const [rectN, setRectN] = useState('20');
  const [rectX, setRectX] = useState('0.5');
  const [rectY, setRectY] = useState('0.5');
  const [rectResult, setRectResult] = useState('');
  const [rectError, setRectError] = useState<string | null>(null);

  const computeLaplaceRect = () => {
    setRectError(null);
    try {
      const Lx = parseFloat(rectLx), Ly = parseFloat(rectLy), N = parseInt(rectN);
      const x = parseFloat(rectX), y = parseFloat(rectY);
      if (isNaN(Lx) || isNaN(Ly) || isNaN(N) || isNaN(x) || isNaN(y)) throw new Error('请输入有效的数值');
      const u = laplaceRectangular({ top: rectTop, bottom: rectBottom, left: rectLeft, right: rectRight }, Lx, Ly, N, x, y);
      setRectResult(`u(${x}, ${y}) = ${formatResult(u)}\n\n矩形域拉普拉斯方程，分离变量求解\n四边分别展开为傅里叶级数后叠加\n级数项数: N=${N}`);
    } catch (e) {
      const msg = (e as Error).message;
      setRectError(msg);
      toast.error(msg);
    }
  };

  // 6. 拉普拉斯圆域
  const [circF, setCircF] = useState('cos(theta)');
  const [circR, setCircR] = useState('1');
  const [circN, setCircN] = useState('10');
  const [circRr, setCircRr] = useState('0.5');
  const [circTheta, setCircTheta] = useState('0');
  const [circResult, setCircResult] = useState('');
  const [circError, setCircError] = useState<string | null>(null);

  const computeLaplaceCircle = () => {
    setCircError(null);
    try {
      const R = parseFloat(circR), N = parseInt(circN);
      const r = parseFloat(circRr), theta = parseFloat(circTheta);
      if (isNaN(R) || isNaN(N) || isNaN(r) || isNaN(theta)) throw new Error('请输入有效的数值');
      if (r > R) throw new Error('r 必须 ≤ R');
      const u = laplaceCircle(circF, R, N, r, theta);
      setCircResult(`u(r=${r}, θ=${theta}) = ${formatResult(u)}\n\n圆域拉普拉斯方程（泊松公式）:\nu(r,θ) = a₀/2 + Σ (r/R)^n [a_n cos(nθ) + b_n sin(nθ)]\n级数项数: N=${N}`);
    } catch (e) {
      const msg = (e as Error).message;
      setCircError(msg);
      toast.error(msg);
    }
  };

  // 7. 热核基本解
  const [kernelX, setKernelX] = useState('0');
  const [kernelT, setKernelT] = useState('0.1');
  const [kernelK, setKernelK] = useState('1');
  const [kernelResult, setKernelResult] = useState('');
  const [kernelError, setKernelError] = useState<string | null>(null);

  const computeHeatKernel = () => {
    setKernelError(null);
    try {
      const x = parseFloat(kernelX), t = parseFloat(kernelT), k = parseFloat(kernelK);
      if (isNaN(x) || isNaN(t) || isNaN(k)) throw new Error('请输入有效的数值');
      if (t <= 0) throw new Error('t 必须 > 0');
      const g = heatKernel(x, t, k);
      // 数值验证积分: ∫_{-∞}^{∞} G(x,t) dx = 1
      let integral = 0;
      const steps = 500;
      const a = -5 * Math.sqrt(2 * k * t);
      const b = 5 * Math.sqrt(2 * k * t);
      const h = (b - a) / steps;
      for (let i = 0; i <= steps; i++) {
        const xi = a + i * h;
        const gi = heatKernel(xi, t, k);
        integral += (i === 0 || i === steps ? 0.5 : 1) * gi * h;
      }
      setKernelResult(`G(${x}, ${t}) = ${formatResult(g)}\n\n热核: G(x,t) = 1/√(4πkt) · e^{-x²/(4kt)}\n∫_{-∞}^{∞} G(x,t) dx ≈ ${formatResult(integral)} (应≈1)`);
    } catch (e) {
      const msg = (e as Error).message;
      setKernelError(msg);
      toast.error(msg);
    }
  };

  // 8. 傅里叶变换法
  const [ftF, setFtF] = useState('exp(-x^2)');
  const [ftK, setFtK] = useState('1');
  const [ftN, setFtN] = useState('100');
  const [ftX, setFtX] = useState('0');
  const [ftT, setFtT] = useState('0.1');
  const [ftResult, setFtResult] = useState('');
  const [ftError, setFtError] = useState<string | null>(null);

  const computeFtHeat = () => {
    setFtError(null);
    try {
      const k = parseFloat(ftK), N = parseInt(ftN);
      const x = parseFloat(ftX), t = parseFloat(ftT);
      if (isNaN(k) || isNaN(N) || isNaN(x) || isNaN(t)) throw new Error('请输入有效的数值');
      const u = fourierTransformHeat(ftF, k, N, x, t);
      setFtResult(`u(${x}, ${t}) = ${formatResult(u)}\n\n傅里叶变换法解全空间热方程:\nû_t = -kξ²û → û(ξ,t) = f̂(ξ) e^{-kξ²t}\nu(x,t) = G(x,t) * f(x) = ∫ G(x-ξ,t)f(ξ)dξ`);
    } catch (e) {
      const msg = (e as Error).message;
      setFtError(msg);
      toast.error(msg);
    }
  };

  // 9. 定解问题判定
  const [wpEqType, setWpEqType] = useState('wave');
  const [wpHasInit, setWpHasInit] = useState(true);
  const [wpHasBoundary, setWpHasBoundary] = useState(false);
  const [wpResult, setWpResult] = useState('');
  const [wpError, setWpError] = useState<string | null>(null);

  const computeWellPosed = () => {
    setWpError(null);
    try {
      const conditions: string[] = [];
      if (wpHasInit) conditions.push('initial');
      if (wpHasBoundary) conditions.push('boundary');
      if (conditions.length === 0) throw new Error('请至少选择一种定解条件');
      const r = wellPosedCheck(wpEqType, conditions);
      setWpResult(`问题类型: ${r.problemType}\n适定性: ${r.wellPosed ? '适定' : '可能不适定'}\n\n判定说明:\n${r.reasons.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
    } catch (e) {
      const msg = (e as Error).message;
      setWpError(msg);
      toast.error(msg);
    }
  };

  // 10. 贝塞尔函数
  const [besN, setBesN] = useState('0');
  const [besX, setBesX] = useState('1');
  const [besResult, setBesResult] = useState('');
  const [besError, setBesError] = useState<string | null>(null);

  const computeBessel = () => {
    setBesError(null);
    try {
      const n = parseInt(besN), x = parseFloat(besX);
      if (isNaN(n) || isNaN(x)) throw new Error('请输入有效的数值');
      const j = besselJ(n, x);
      setBesResult(`J_${n}(${x}) = ${formatResult(j)}\n\n贝塞尔方程: x²y″ + xy′ + (x²-n²)y = 0\n第一类解: J_n(x) = Σ_{k=0}^{∞} (-1)^k/(k!Γ(k+n+1)) · (x/2)^{2k+n}`);
    } catch (e) {
      const msg = (e as Error).message;
      setBesError(msg);
      toast.error(msg);
    }
  };

  // 11. 勒让德多项式
  const [legN, setLegN] = useState('2');
  const [legX, setLegX] = useState('0.5');
  const [legResult, setLegResult] = useState('');
  const [legError, setLegError] = useState<string | null>(null);

  const computeLegendre = () => {
    setLegError(null);
    try {
      const n = parseInt(legN), x = parseFloat(legX);
      if (isNaN(n) || isNaN(x)) throw new Error('请输入有效的数值');
      if (n < 0) throw new Error('阶数 n 必须≥0');
      const p = legendreP(n, x);
      setLegResult(`P_${n}(${x}) = ${formatResult(p)}\n\n勒让德方程: (1-x²)y″ - 2xy′ + n(n+1)y = 0\n递推: (n+1)P_{n+1} = (2n+1)xP_n - nP_{n-1}`);
    } catch (e) {
      const msg = (e as Error).message;
      setLegError(msg);
      toast.error(msg);
    }
  };

  // 12. 连带勒让德
  const [assocN, setAssocN] = useState('2');
  const [assocM, setAssocM] = useState('1');
  const [assocX, setAssocX] = useState('0.5');
  const [assocResult, setAssocResult] = useState('');
  const [assocError, setAssocError] = useState<string | null>(null);

  const computeAssocLegendre = () => {
    setAssocError(null);
    try {
      const n = parseInt(assocN), m = parseInt(assocM), x = parseFloat(assocX);
      if (isNaN(n) || isNaN(m) || isNaN(x)) throw new Error('请输入有效的数值');
      if (n < 0 || m < 0) throw new Error('n, m 必须≥0');
      if (m > n) throw new Error('m 必须 ≤ n');
      const p = associatedLegendreP(n, m, x);
      setAssocResult(`P_${n}^${m}(${x}) = ${formatResult(p)}\n\n连带勒让德函数:\nP_n^m(x) = (1-x²)^{m/2} · d^m/dx^m P_n(x)`);
    } catch (e) {
      const msg = (e as Error).message;
      setAssocError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background page-fade-in">
      <PageHeader title="偏微分方程" description="二阶线性PDE分类、达朗贝尔行波法、分离变量法、傅里叶变换法——从波动方程到拉普拉斯方程的完整计算工具集" onCheatsheet={() => setCheatsheetOpen(true)} />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto pb-2 -mx-2 px-2">
                <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-muted/50 p-1">
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value} className="px-3 py-1.5 text-xs whitespace-nowrap">{tab.label}</TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* 1. PDE分类 */}
              <TabsContent value="classify" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">二阶线性PDE: Au<sub>xx</sub> + Bu<sub>xy</sub> + Cu<sub>yy</sub> + ... = 0</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">A</label>
                      <Input value={pdeA} onChange={(e) => setPdeA(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">B</label>
                      <Input value={pdeB} onChange={(e) => setPdeB(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">C</label>
                      <Input value={pdeC} onChange={(e) => setPdeC(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                </div>
                <Button onClick={computeClassify} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />分类判定</Button>
                <ResultBox text={classifyResult} error={classifyError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>按判别式 Δ=B²-4AC 分类：Δ&lt;0 椭圆型，Δ=0 抛物型，Δ&gt;0 双曲型。示例: u<sub>xx</sub>+u<sub>yy</sub>=0 (A=1,B=0,C=1,椭圆)</span></div>
              </TabsContent>

              {/* 2. 达朗贝尔行波 */}
              <TabsContent value="dalembert" className="space-y-4">
                <div className="space-y-3">
                  <MathInputField value={dalPhi} onChange={setDalPhi} label="初位移 φ(x)" showPalette defaultPreview />
                  <MathInputField value={dalPsi} onChange={setDalPsi} label="初速度 ψ(x)" showPalette defaultPreview={false} />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">波速 c</label>
                      <Input value={dalC} onChange={(e) => setDalC(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">x</label>
                      <Input value={dalX} onChange={(e) => setDalX(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">t</label>
                      <Input value={dalT} onChange={(e) => setDalT(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                </div>
                <Button onClick={computeDalembert} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />达朗贝尔公式</Button>
                <ResultBox text={dalResult} error={dalError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>一维无界波动方程 u<sub>tt</sub>=c²u<sub>xx</sub> 的达朗贝尔解。示例: φ=sin(x), ψ=0, c=1 → u=sin(x)cos(t)</span></div>
              </TabsContent>

              {/* 3. 热传导方程 */}
              <TabsContent value="heateq" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">初始温度 f(x)（0 ≤ x ≤ L）</label>
                    <Input value={heatF} onChange={(e) => setHeatF(e.target.value)} className="font-mono" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">杆长 L</label><Input value={heatL} onChange={(e) => setHeatL(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">扩散系数 k</label><Input value={heatK} onChange={(e) => setHeatK(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">x</label><Input value={heatX} onChange={(e) => setHeatX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">t</label><Input value={heatT} onChange={(e) => setHeatT(e.target.value)} className="font-mono" /></div>
                  </div>
                  <div className="max-w-[120px]">
                    <label className="text-xs text-muted-foreground mb-1 block">级数项数 N</label>
                    <Input value={heatN} onChange={(e) => setHeatN(e.target.value)} className="font-mono" />
                  </div>
                </div>
                <Button onClick={computeHeat} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />热方程分离变量</Button>
                <ResultBox text={heatResult} error={heatError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>Dirichlet 边界 u(0,t)=u(L,t)=0 下的分离变量解。示例: f(x)=sin(πx/L), L=1, k=1 → u=sin(πx)·e<sup>-π²t</sup></span></div>
              </TabsContent>

              {/* 4. 弦振动方程 */}
              <TabsContent value="vibration" className="space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">初位移 φ(x)</label><Input value={vibPhi} onChange={(e) => setVibPhi(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">初速度 ψ(x)</label><Input value={vibPsi} onChange={(e) => setVibPsi(e.target.value)} className="font-mono" /></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">弦长 L</label><Input value={vibL} onChange={(e) => setVibL(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">波速 c</label><Input value={vibC} onChange={(e) => setVibC(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">x</label><Input value={vibX} onChange={(e) => setVibX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">t</label><Input value={vibT} onChange={(e) => setVibT(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">项数 N</label><Input value={vibN} onChange={(e) => setVibN(e.target.value)} className="font-mono" /></div>
                  </div>
                </div>
                <Button onClick={computeVibration} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />弦振动级数解</Button>
                <ResultBox text={vibResult} error={vibError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>两端固定弦自由振动的分离变量解，各阶模态叠加。示例: φ=sin(πx), ψ=0 → u=sin(πx)cos(πct)</span></div>
              </TabsContent>

              {/* 5. 拉普拉斯矩形域 */}
              <TabsContent value="laplace-rect" className="space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">上边界 u(x,Ly)</label><Input value={rectTop} onChange={(e) => setRectTop(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">下边界 u(x,0)</label><Input value={rectBottom} onChange={(e) => setRectBottom(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">左边界 u(0,y)</label><Input value={rectLeft} onChange={(e) => setRectLeft(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">右边界 u(Lx,y)</label><Input value={rectRight} onChange={(e) => setRectRight(e.target.value)} className="font-mono" /></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">长 Lx</label><Input value={rectLx} onChange={(e) => setRectLx(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">宽 Ly</label><Input value={rectLy} onChange={(e) => setRectLy(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">x</label><Input value={rectX} onChange={(e) => setRectX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">y</label><Input value={rectY} onChange={(e) => setRectY(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">项数 N</label><Input value={rectN} onChange={(e) => setRectN(e.target.value)} className="font-mono" /></div>
                  </div>
                </div>
                <Button onClick={computeLaplaceRect} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />分离变量求解</Button>
                <ResultBox text={rectResult} error={rectError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>矩形域拉普拉斯方程边值问题，四边傅里叶级数展开后叠加求解。</span></div>
              </TabsContent>

              {/* 6. 拉普拉斯圆域 */}
              <TabsContent value="laplace-circle" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">边界条件 u(R,θ) = f(θ)</label>
                    <Input value={circF} onChange={(e) => setCircF(e.target.value)} className="font-mono" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">半径 R</label><Input value={circR} onChange={(e) => setCircR(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">r</label><Input value={circRr} onChange={(e) => setCircRr(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">θ(弧度)</label><Input value={circTheta} onChange={(e) => setCircTheta(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">项数 N</label><Input value={circN} onChange={(e) => setCircN(e.target.value)} className="font-mono" /></div>
                  </div>
                </div>
                <Button onClick={computeLaplaceCircle} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />泊松公式求解</Button>
                <ResultBox text={circResult} error={circError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>圆域拉普拉斯方程极坐标分离变量解（泊松积分公式）。示例: f(θ)=cosθ, R=1, r=0.5 → u=0.5 cosθ</span></div>
              </TabsContent>

              {/* 7. 热核基本解 */}
              <TabsContent value="heat-kernel" className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">x</label><Input value={kernelX} onChange={(e) => setKernelX(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-2 block">t</label><Input value={kernelT} onChange={(e) => setKernelT(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-2 block">k</label><Input value={kernelK} onChange={(e) => setKernelK(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeHeatKernel} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算热核</Button>
                <ResultBox text={kernelResult} error={kernelError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>热方程基本解（热核）: G(x,t)=1/√(4πkt)·e<sup>-x²/(4kt)</sup>，满足 ∫<sub>-∞</sub><sup>∞</sup> Gdx = 1</span></div>
              </TabsContent>

              {/* 8. 傅里叶变换法 */}
              <TabsContent value="fourier-pde" className="space-y-4">
                <div className="space-y-3">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">初始温度 f(x)（全空间）</label><Input value={ftF} onChange={(e) => setFtF(e.target.value)} className="font-mono" /></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">扩散系数 k</label><Input value={ftK} onChange={(e) => setFtK(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">x</label><Input value={ftX} onChange={(e) => setFtX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">t</label><Input value={ftT} onChange={(e) => setFtT(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">采样数 N</label><Input value={ftN} onChange={(e) => setFtN(e.target.value)} className="font-mono" /></div>
                  </div>
                </div>
                <Button onClick={computeFtHeat} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />傅里叶变换求解</Button>
                <ResultBox text={ftResult} error={ftError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>用傅里叶变换法解全空间热方程，解为初始函数与热核的卷积。</span></div>
              </TabsContent>

              {/* 9. 定解问题判定 */}
              <TabsContent value="wellposed" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">方程类型</label>
                    <Select value={wpEqType} onValueChange={setWpEqType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wave">波动方程（双曲型）</SelectItem>
                        <SelectItem value="heat">热传导方程（抛物型）</SelectItem>
                        <SelectItem value="laplace">拉普拉斯方程（椭圆型）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">定解条件</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="wp-init" checked={wpHasInit} onCheckedChange={(v) => setWpHasInit(!!v)} />
                        <label htmlFor="wp-init" className="text-sm text-foreground cursor-pointer">初始条件（初值）</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="wp-bd" checked={wpHasBoundary} onCheckedChange={(v) => setWpHasBoundary(!!v)} />
                        <label htmlFor="wp-bd" className="text-sm text-foreground cursor-pointer">边界条件（边值）</label>
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={computeWellPosed} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />适定性判定</Button>
                <ResultBox text={wpResult} error={wpError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>哈达玛适定性：解的存在性、唯一性、对初始/边界条件的连续依赖性。</span></div>
              </TabsContent>

              {/* 10. 贝塞尔函数 */}
              <TabsContent value="bessel" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">阶数 n</label><Input value={besN} onChange={(e) => setBesN(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-2 block">x</label><Input value={besX} onChange={(e) => setBesX(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeBessel} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算 J_n(x)</Button>
                <ResultBox text={besResult} error={besError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>第一类贝塞尔函数。常见值: J₀(0)=1, J₁(0)=0, J₀(1)≈0.7652</span></div>
              </TabsContent>

              {/* 11. 勒让德多项式 */}
              <TabsContent value="legendre" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">阶数 n</label><Input value={legN} onChange={(e) => setLegN(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-2 block">x (-1 ≤ x ≤ 1)</label><Input value={legX} onChange={(e) => setLegX(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeLegendre} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算 P_n(x)</Button>
                <ResultBox text={legResult} error={legError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>勒让德多项式递推: (n+1)P<sub>n+1</sub> = (2n+1)xP<sub>n</sub> - nP<sub>n-1</sub>。P₀=1, P₁=x, P₂=(3x²-1)/2</span></div>
              </TabsContent>

              {/* 12. 连带勒让德 */}
              <TabsContent value="assoc-legendre" className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">n</label><Input value={assocN} onChange={(e) => setAssocN(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-2 block">m (≤n)</label><Input value={assocM} onChange={(e) => setAssocM(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-2 block">x</label><Input value={assocX} onChange={(e) => setAssocX(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeAssocLegendre} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算 P_n^m(x)</Button>
                <ResultBox text={assocResult} error={assocError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>连带勒让德函数是球谐函数的角向部分，m=0时退化为勒让德多项式。</span></div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <HistoryPanel
          open={historyOpen}
          history={history}
          onToggle={() => setHistoryOpen((o) => !o)}
          onClear={clearHistory}
          onSelect={() => {}}
          theme="rose"
          className="mb-4"
        />

      </div>
      <CheatsheetDialog moduleKey="pde" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
