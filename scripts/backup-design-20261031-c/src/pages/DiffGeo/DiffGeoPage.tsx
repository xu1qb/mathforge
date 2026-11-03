import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Info, Calculator, Type } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import { toast } from 'sonner';
import { useHistory } from '@/hooks/useHistory';
import HistoryPanel from '@/components/HistoryPanel';
import {
  curveRegularity,
  arcLength,
  curvature2D,
  curvature3D,
  torsion3D,
  frenetFrame,
  surfaceRegularity,
  firstFundamentalForm,
  secondFundamentalForm,
  gaussianCurvature,
  meanCurvature,
  principalCurvatures,
  surfaceTypeAtPoint,
} from '@/lib/math-pde-geo-comp';
import { formatResult } from '@/lib/math-utils';

const TABS = [
  { value: 'regularity', label: '正则曲线' },
  { value: 'arclength', label: '弧长计算' },
  { value: 'curvature', label: '曲率' },
  { value: 'torsion', label: '挠率' },
  { value: 'frenet', label: 'Frenet标架' },
  { value: 'helix', label: '圆柱螺线' },
  { value: 'surface-reg', label: '曲面正则性' },
  { value: 'first-form', label: '第一基本形式' },
  { value: 'second-form', label: '第二基本形式' },
  { value: 'gauss-curv', label: '高斯曲率' },
  { value: 'mean-curv', label: '平均曲率' },
  { value: 'principal', label: '主曲率' },
  { value: 'classify', label: '曲面点分类' },
  { value: 'common-surf', label: '常见曲面' },
];

const SURFACE_PRESETS: Record<string, { label: string; rStrs: string[]; params: { R?: number; a?: number; b?: number; c?: number } }> = {
  sphere: { label: '球面', rStrs: ['sin(u)*cos(v)', 'sin(u)*sin(v)', 'cos(u)'], params: { R: 1 } },
  sphere2: { label: '球面(R=2)', rStrs: ['2*sin(u)*cos(v)', '2*sin(u)*sin(v)', '2*cos(u)'], params: { R: 2 } },
  torus: { label: '环面', rStrs: ['(2+cos(u))*cos(v)', '(2+cos(u))*sin(v)', 'sin(u)'], params: {} },
  saddle: { label: '马鞍面', rStrs: ['u', 'v', 'u^2-v^2'], params: {} },
  cylinder: { label: '圆柱面', rStrs: ['cos(u)', 'sin(u)', 'v'], params: {} },
};

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
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
      )}
    </>
  );
}

export default function DiffGeoPage() {
  const [activeTab, setActiveTab] = useState('regularity');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_diffgeo_history' });
  const lastResultRef = useRef('');

  // 1. 正则曲线
  const [regX, setRegX] = useState('cos(t)');
  const [regY, setRegY] = useState('sin(t)');
  const [regZ, setRegZ] = useState('t');
  const [regT0, setRegT0] = useState('0.5');
  const [regResult, setRegResult] = useState('');

  // 监听曲线正则性结果变化，自动记录历史
  useEffect(() => {
    if (regResult && regResult !== lastResultRef.current) {
      addItem(activeTab, regResult);
      lastResultRef.current = regResult;
    }
  }, [regResult, activeTab, addItem]);
  const [regError, setRegError] = useState<string | null>(null);

  const computeRegularity = () => {
    setRegError(null);
    try {
      const t0 = parseFloat(regT0);
      if (isNaN(t0)) throw new Error('请输入有效的t值');
      const r = curveRegularity([regX, regY, regZ], t0);
      const speed = Math.hypot(r.rPrime[0], r.rPrime[1], r.rPrime[2]);
      setRegResult(
        `r(t) = (${regX}, ${regY}, ${regZ})\n` +
        `在 t = ${t0} 处:\n\n` +
        `正则性: ${r.regular ? '✅ 正则' : '❌ 非正则（r′=0）'}\n` +
        `r′ = (${formatResult(r.rPrime[0])}, ${formatResult(r.rPrime[1])}, ${formatResult(r.rPrime[2])})\n` +
        `|r′| = ${formatResult(speed)}`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setRegError(msg);
      toast.error(msg);
    }
  };

  // 2. 弧长
  const [alX, setAlX] = useState('cos(t)');
  const [alY, setAlY] = useState('sin(t)');
  const [alZ, setAlZ] = useState('t');
  const [alA, setAlA] = useState('0');
  const [alB, setAlB] = useState('2*pi');
  const [alResult, setAlResult] = useState('');
  const [alError, setAlError] = useState<string | null>(null);

  const computeArcLength = () => {
    setAlError(null);
    try {
      const a = parseFloat(alA), b = parseFloat(alB);
      if (isNaN(a) || isNaN(b)) throw new Error('请输入有效的区间端点');
      const s = arcLength([alX, alY, alZ], a, b);
      setAlResult(
        `弧长 s = ∫[${formatResult(a)}, ${formatResult(b)}] |r′(t)| dt\n` +
        `s = ${formatResult(s)}\n\n` +
        `弧长元素: ds = |r′(t)|dt\n` +
        `验证: 单位圆 [0,2π] 弧长应为 2π ≈ 6.283`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setAlError(msg);
      toast.error(msg);
    }
  };

  // 3. 曲率
  const [curMode, setCurMode] = useState('3d');
  const [curX, setCurX] = useState('cos(t)');
  const [curY, setCurY] = useState('sin(t)');
  const [curZ, setCurZ] = useState('t');
  const [curT0, setCurT0] = useState('0.5');
  const [curResult, setCurResult] = useState('');
  const [curError, setCurError] = useState<string | null>(null);

  const computeCurvature = () => {
    setCurError(null);
    try {
      const t0 = parseFloat(curT0);
      if (isNaN(t0)) throw new Error('请输入有效的t值');
      let k: number;
      let formula: string;
      if (curMode === '2d') {
        k = curvature2D(curX, curY, t0);
        formula = 'κ = |x′y″ - x″y′| / (x′²+y′²)^{3/2}';
      } else {
        k = curvature3D([curX, curY, curZ], t0);
        formula = 'κ = |r′ × r″| / |r′|³';
      }
      setCurResult(
        `曲率 ${formula}\n\n` +
        `在 t = ${t0} 处: κ = ${formatResult(k)}\n` +
        `曲率半径 ρ = 1/κ = ${formatResult(1/k)}\n\n` +
        `单位圆: κ = 1\n` +
        `圆柱螺线: κ = a/(a²+b²) = 常数`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setCurError(msg);
      toast.error(msg);
    }
  };

  // 4. 挠率
  const [torX, setTorX] = useState('cos(t)');
  const [torY, setTorY] = useState('sin(t)');
  const [torZ, setTorZ] = useState('t');
  const [torT0, setTorT0] = useState('0.5');
  const [torResult, setTorResult] = useState('');
  const [torError, setTorError] = useState<string | null>(null);

  const computeTorsion = () => {
    setTorError(null);
    try {
      const t0 = parseFloat(torT0);
      if (isNaN(t0)) throw new Error('请输入有效的t值');
      const t = torsion3D([torX, torY, torZ], t0);
      setTorResult(
        `挠率 τ = (r′ × r″) · r‴ / |r′ × r″|²\n\n` +
        `在 t = ${t0} 处: τ = ${formatResult(t)}\n\n` +
        `几何意义: 挠率反映曲线偏离平面的速率\n` +
        `平面曲线 τ ≡ 0\n` +
        `圆柱螺线: τ = b/(a²+b²) = 常数`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setTorError(msg);
      toast.error(msg);
    }
  };

  // 5. Frenet标架
  const [frenetX, setFrenetX] = useState('cos(t)');
  const [frenetY, setFrenetY] = useState('sin(t)');
  const [frenetZ, setFrenetZ] = useState('t');
  const [frenetT0, setFrenetT0] = useState('0.5');
  const [frenetResult, setFrenetResult] = useState('');
  const [frenetError, setFrenetError] = useState<string | null>(null);

  const computeFrenet = () => {
    setFrenetError(null);
    try {
      const t0 = parseFloat(frenetT0);
      if (isNaN(t0)) throw new Error('请输入有效的t值');
      const f = frenetFrame([frenetX, frenetY, frenetZ], t0);
      setFrenetResult(
        `在 t = ${t0} 处的 Frenet 标架:\n\n` +
        `T = (${formatResult(f.T[0])}, ${formatResult(f.T[1])}, ${formatResult(f.T[2])})\n` +
        `N = (${formatResult(f.N[0])}, ${formatResult(f.N[1])}, ${formatResult(f.N[2])})\n` +
        `B = (${formatResult(f.B[0])}, ${formatResult(f.B[1])}, ${formatResult(f.B[2])})\n\n` +
        `曲率 κ = ${formatResult(f.kappa)}\n` +
        `挠率 τ = ${formatResult(f.tau)}\n\n` +
        `Frenet-Serret 公式:\n` +
        `T′ = κN\n` +
        `N′ = -κT + τB\n` +
        `B′ = -τN`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setFrenetError(msg);
      toast.error(msg);
    }
  };

  // 6. 圆柱螺线
  const [helixA, setHelixA] = useState('1');
  const [helixB, setHelixB] = useState('1');
  const [helixResult, setHelixResult] = useState('');
  const [helixError, setHelixError] = useState<string | null>(null);

  const computeHelix = () => {
    setHelixError(null);
    try {
      const a = parseFloat(helixA), b = parseFloat(helixB);
      if (isNaN(a) || isNaN(b)) throw new Error('请输入有效的a、b值');
      const kappa = a / (a * a + b * b);
      const tau = b / (a * a + b * b);
      const pitch = 2 * Math.PI * b;
      setHelixResult(
        `圆柱螺线: r(t) = (${a} cos t, ${a} sin t, ${b} t)\n\n` +
        `曲率 κ = a/(a²+b²) = ${formatResult(kappa)}\n` +
        `挠率 τ = b/(a²+b²) = ${formatResult(tau)}\n` +
        `螺距 p = 2πb = ${formatResult(pitch)}\n` +
        `κ/τ = a/b = ${formatResult(a / b)}\n\n` +
        `圆柱螺线是定倾曲线: 切向量与z轴夹角恒定\n` +
        `tan α = a/b = ${formatResult(a / b)}`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setHelixError(msg);
      toast.error(msg);
    }
  };

  // 7. 曲面正则性
  const [surfPreset, setSurfPreset] = useState('sphere');
  const [surfU, setSurfU] = useState('1');
  const [surfV, setSurfV] = useState('0.5');
  const [surfResult, setSurfResult] = useState('');
  const [surfError, setSurfError] = useState<string | null>(null);

  const computeSurfRegularity = () => {
    setSurfError(null);
    try {
      const u = parseFloat(surfU), v = parseFloat(surfV);
      if (isNaN(u) || isNaN(v)) throw new Error('请输入有效的u、v值');
      const preset = SURFACE_PRESETS[surfPreset];
      const r = surfaceRegularity(preset.rStrs, u, v);
      const crossLen = Math.hypot(
        r.rU[1] * r.rV[2] - r.rU[2] * r.rV[1],
        r.rU[2] * r.rV[0] - r.rU[0] * r.rV[2],
        r.rU[0] * r.rV[1] - r.rU[1] * r.rV[0]
      );
      setSurfResult(
        `曲面类型: ${preset.label}\n` +
        `参数方程: r(u,v) = (${preset.rStrs[0]}, ${preset.rStrs[1]}, ${preset.rStrs[2]})\n` +
        `在 (u=${formatResult(u)}, v=${formatResult(v)}) 处:\n\n` +
        `正则性: ${r.regular ? '✅ 正则' : '❌ 非正则（r_u × r_v = 0）'}\n` +
        `r_u = (${formatResult(r.rU[0])}, ${formatResult(r.rU[1])}, ${formatResult(r.rU[2])})\n` +
        `r_v = (${formatResult(r.rV[0])}, ${formatResult(r.rV[1])}, ${formatResult(r.rV[2])})\n` +
        `单位法向量 n = (${formatResult(r.normal[0])}, ${formatResult(r.normal[1])}, ${formatResult(r.normal[2])})\n` +
        `|r_u × r_v| = ${formatResult(crossLen)}`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setSurfError(msg);
      toast.error(msg);
    }
  };

  // 8. 第一基本形式
  const [form1Preset, setForm1Preset] = useState('sphere');
  const [form1U, setForm1U] = useState('1');
  const [form1V, setForm1V] = useState('0.5');
  const [form1Result, setForm1Result] = useState('');
  const [form1Error, setForm1Error] = useState<string | null>(null);

  const computeForm1 = () => {
    setForm1Error(null);
    try {
      const u = parseFloat(form1U), v = parseFloat(form1V);
      if (isNaN(u) || isNaN(v)) throw new Error('请输入有效的u、v值');
      const preset = SURFACE_PRESETS[form1Preset];
      const r = firstFundamentalForm(preset.rStrs, u, v);
      const areaElem = Math.sqrt(r.E * r.G - r.F * r.F);
      setForm1Result(
        `第一基本形式 I = Edu² + 2Fdudv + Gdv²\n\n` +
        `曲面: ${preset.label}\n` +
        `在 (u=${formatResult(u)}, v=${formatResult(v)}) 处:\n\n` +
        `E = r_u·r_u = ${formatResult(r.E)}\n` +
        `F = r_u·r_v = ${formatResult(r.F)}\n` +
        `G = r_v·r_v = ${formatResult(r.G)}\n\n` +
        `面积元素 dA = √(EG-F²) dudv = ${formatResult(areaElem)} dudv\n\n` +
        `几何意义: 第一基本形式完全决定曲面的内蕴几何`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setForm1Error(msg);
      toast.error(msg);
    }
  };

  // 9. 第二基本形式
  const [form2Preset, setForm2Preset] = useState('sphere');
  const [form2U, setForm2U] = useState('1');
  const [form2V, setForm2V] = useState('0.5');
  const [form2Result, setForm2Result] = useState('');
  const [form2Error, setForm2Error] = useState<string | null>(null);

  const computeForm2 = () => {
    setForm2Error(null);
    try {
      const u = parseFloat(form2U), v = parseFloat(form2V);
      if (isNaN(u) || isNaN(v)) throw new Error('请输入有效的u、v值');
      const preset = SURFACE_PRESETS[form2Preset];
      const r = secondFundamentalForm(preset.rStrs, u, v);
      setForm2Result(
        `第二基本形式 II = Ldu² + 2Mdudv + Ndv²\n\n` +
        `曲面: ${preset.label}\n` +
        `在 (u=${formatResult(u)}, v=${formatResult(v)}) 处:\n\n` +
        `L = r_uu·n = ${formatResult(r.L)}\n` +
        `M = r_uv·n = ${formatResult(r.M)}\n` +
        `N = r_vv·n = ${formatResult(r.N)}\n\n` +
        `几何意义: II = -dn·dr，反映曲面在空间中的弯曲程度`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setForm2Error(msg);
      toast.error(msg);
    }
  };

  // 10. 高斯曲率
  const [gcPreset, setGcPreset] = useState('sphere');
  const [gcU, setGcU] = useState('1');
  const [gcV, setGcV] = useState('0.5');
  const [gcResult, setGcResult] = useState('');
  const [gcError, setGcError] = useState<string | null>(null);

  const computeGC = () => {
    setGcError(null);
    try {
      const u = parseFloat(gcU), v = parseFloat(gcV);
      if (isNaN(u) || isNaN(v)) throw new Error('请输入有效的u、v值');
      const preset = SURFACE_PRESETS[gcPreset];
      const K = gaussianCurvature(preset.rStrs, u, v);
      setGcResult(
        `高斯曲率 K = (LN - M²) / (EG - F²) = k₁ · k₂\n\n` +
        `曲面: ${preset.label}\n` +
        `在 (u=${formatResult(u)}, v=${formatResult(v)}) 处:\n` +
        `K = ${formatResult(K)}\n\n` +
        `高斯绝妙定理: K 只依赖于第一基本形式，是内蕴几何量\n` +
        `球面: K = 1/R² = 常数 > 0\n` +
        `马鞍面: K < 0\n` +
        `柱面: K = 0`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setGcError(msg);
      toast.error(msg);
    }
  };

  // 11. 平均曲率
  const [mcPreset, setMcPreset] = useState('sphere');
  const [mcU, setMcU] = useState('1');
  const [mcV, setMcV] = useState('0.5');
  const [mcResult, setMcResult] = useState('');
  const [mcError, setMcError] = useState<string | null>(null);

  const computeMC = () => {
    setMcError(null);
    try {
      const u = parseFloat(mcU), v = parseFloat(mcV);
      if (isNaN(u) || isNaN(v)) throw new Error('请输入有效的u、v值');
      const preset = SURFACE_PRESETS[mcPreset];
      const H = meanCurvature(preset.rStrs, u, v);
      setMcResult(
        `平均曲率 H = (EN - 2FM + GL) / [2(EG - F²)] = (k₁+k₂)/2\n\n` +
        `曲面: ${preset.label}\n` +
        `在 (u=${formatResult(u)}, v=${formatResult(v)}) 处:\n` +
        `H = ${formatResult(H)}\n\n` +
        `极小曲面: H ≡ 0（如悬链面、正螺面）`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setMcError(msg);
      toast.error(msg);
    }
  };

  // 12. 主曲率
  const [pcPreset, setPcPreset] = useState('sphere');
  const [pcU, setPcU] = useState('1');
  const [pcV, setPcV] = useState('0.5');
  const [pcResult, setPcResult] = useState('');
  const [pcError, setPcError] = useState<string | null>(null);

  const computePC = () => {
    setPcError(null);
    try {
      const u = parseFloat(pcU), v = parseFloat(pcV);
      if (isNaN(u) || isNaN(v)) throw new Error('请输入有效的u、v值');
      const preset = SURFACE_PRESETS[pcPreset];
      const pc = principalCurvatures(preset.rStrs, u, v);
      setPcResult(
        `主曲率 k₁, k₂ 满足: det(II - kI) = 0\n\n` +
        `曲面: ${preset.label}\n` +
        `在 (u=${formatResult(u)}, v=${formatResult(v)}) 处:\n\n` +
        `k₁ = ${formatResult(pc[0])}\n` +
        `k₂ = ${formatResult(pc[1])}\n\n` +
        `高斯曲率 K = k₁·k₂ = ${formatResult(pc[0] * pc[1])}\n` +
        `平均曲率 H = (k₁+k₂)/2 = ${formatResult((pc[0] + pc[1]) / 2)}\n\n` +
        `主方向互相垂直`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setPcError(msg);
      toast.error(msg);
    }
  };

  // 13. 曲面点分类
  const [clPreset, setClPreset] = useState('sphere');
  const [clU, setClU] = useState('1');
  const [clV, setClV] = useState('0.5');
  const [clResult, setClResult] = useState('');
  const [clError, setClError] = useState<string | null>(null);

  const computeClassify = () => {
    setClError(null);
    try {
      const u = parseFloat(clU), v = parseFloat(clV);
      if (isNaN(u) || isNaN(v)) throw new Error('请输入有效的u、v值');
      const preset = SURFACE_PRESETS[clPreset];
      const K = gaussianCurvature(preset.rStrs, u, v);
      const type = surfaceTypeAtPoint(K);
      setClResult(
        `曲面: ${preset.label}\n` +
        `在 (u=${formatResult(u)}, v=${formatResult(v)}) 处:\n\n` +
        `高斯曲率 K = ${formatResult(K)}\n` +
        `点类型: ${type}\n\n` +
        `分类规则:\n` +
        `• 椭圆点: K > 0 (k₁, k₂ 同号)\n` +
        `• 抛物点: K = 0 (k₁, k₂ 至少一个为0)\n` +
        `• 双曲点: K < 0 (k₁, k₂ 异号)`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setClError(msg);
      toast.error(msg);
    }
  };

  // 14. 常见曲面
  const [csPreset, setCsPreset] = useState('sphere');
  const [csU, setCsU] = useState('1');
  const [csV, setCsV] = useState('0.5');
  const [csResult, setCsResult] = useState('');
  const [csError, setCsError] = useState<string | null>(null);

  const computeCommon = () => {
    setCsError(null);
    try {
      const u = parseFloat(csU), v = parseFloat(csV);
      if (isNaN(u) || isNaN(v)) throw new Error('请输入有效的u、v值');
      const preset = SURFACE_PRESETS[csPreset];
      const I = firstFundamentalForm(preset.rStrs, u, v);
      const II = secondFundamentalForm(preset.rStrs, u, v);
      const K = gaussianCurvature(preset.rStrs, u, v);
      const H = meanCurvature(preset.rStrs, u, v);
      const pc = principalCurvatures(preset.rStrs, u, v);
      const type = surfaceTypeAtPoint(K);
      setCsResult(
        `曲面: ${preset.label}\n` +
        `参数方程: r(u,v) = (${preset.rStrs[0]}, ${preset.rStrs[1]}, ${preset.rStrs[2]})\n` +
        `参数: u=${formatResult(u)}, v=${formatResult(v)}\n\n` +
        `第一基本形式:\n` +
        `  E = ${formatResult(I.E)},  F = ${formatResult(I.F)},  G = ${formatResult(I.G)}\n\n` +
        `第二基本形式:\n` +
        `  L = ${formatResult(II.L)},  M = ${formatResult(II.M)},  N = ${formatResult(II.N)}\n\n` +
        `主曲率: k₁ = ${formatResult(pc[0])}, k₂ = ${formatResult(pc[1])}\n` +
        `高斯曲率 K = ${formatResult(K)}\n` +
        `平均曲率 H = ${formatResult(H)}\n` +
        `点类型: ${type}`
      );
    } catch (e) {
      const msg = (e as Error).message;
      setCsError(msg);
      toast.error(msg);
    }
  };

  const surfaceOptions = Object.entries(SURFACE_PRESETS).map(([key, val]) => ({ value: key, label: val.label }));

  const renderSurfaceSelect = (value: string, onChange: (v: string) => void) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {surfaceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <div className="min-h-screen bg-background page-fade-in">
      <PageHeader title="微分几何" description="曲线论与曲面论的完整计算工具——正则性、曲率挠率、Frenet标架、第一/第二基本形式、高斯曲率与平均曲率" onCheatsheet={() => setCheatsheetOpen(true)} />
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

              {/* 1. 正则曲线 */}
              <TabsContent value="regularity" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">参数曲线 r(t) = (x(t), y(t), z(t))</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">x(t)</label><Input value={regX} onChange={(e) => setRegX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">y(t)</label><Input value={regY} onChange={(e) => setRegY(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">z(t)</label><Input value={regZ} onChange={(e) => setRegZ(e.target.value)} className="font-mono" /></div>
                  </div>
                </div>
                <div className="max-w-[160px]">
                  <label className="text-xs text-muted-foreground mb-1 block">参数 t₀</label>
                  <Input value={regT0} onChange={(e) => setRegT0(e.target.value)} className="font-mono" />
                </div>
                <Button onClick={computeRegularity} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />验证正则性</Button>
                <ResultBox text={regResult} error={regError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>正则曲线: r′(t) ≠ 0。示例: 单位圆 r=(cos t, sin t, 0)，t=0 处正则</span></div>
              </TabsContent>

              {/* 2. 弧长 */}
              <TabsContent value="arclength" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">参数曲线 r(t)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">x(t)</label><Input value={alX} onChange={(e) => setAlX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">y(t)</label><Input value={alY} onChange={(e) => setAlY(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">z(t)</label><Input value={alZ} onChange={(e) => setAlZ(e.target.value)} className="font-mono" /></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-[300px]">
                  <div><label className="text-xs text-muted-foreground mb-1 block">下限 a</label><Input value={alA} onChange={(e) => setAlA(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">上限 b</label><Input value={alB} onChange={(e) => setAlB(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeArcLength} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算弧长</Button>
                <ResultBox text={alResult} error={alError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>弧长 s = ∫ |r′(t)|dt。单位圆一整圈: a=0, b=2π → s=2π</span></div>
              </TabsContent>

              {/* 3. 曲率 */}
              <TabsContent value="curvature" className="space-y-4">
                <div className="max-w-[200px]">
                  <label className="text-sm font-medium text-foreground mb-2 block">模式</label>
                  <Select value={curMode} onValueChange={setCurMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2d">平面曲线</SelectItem>
                      <SelectItem value="3d">空间曲线</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">参数曲线 r(t)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">x(t)</label><Input value={curX} onChange={(e) => setCurX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">y(t)</label><Input value={curY} onChange={(e) => setCurY(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">z(t)</label><Input value={curZ} onChange={(e) => setCurZ(e.target.value)} disabled={curMode === '2d'} className="font-mono opacity-50" /></div>
                  </div>
                </div>
                <div className="max-w-[160px]">
                  <label className="text-xs text-muted-foreground mb-1 block">参数 t₀</label>
                  <Input value={curT0} onChange={(e) => setCurT0(e.target.value)} className="font-mono" />
                </div>
                <Button onClick={computeCurvature} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算曲率</Button>
                <ResultBox text={curResult} error={curError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>曲率衡量曲线弯曲程度。单位圆 κ=1，直线 κ=0</span></div>
              </TabsContent>

              {/* 4. 挠率 */}
              <TabsContent value="torsion" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">空间曲线 r(t)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">x(t)</label><Input value={torX} onChange={(e) => setTorX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">y(t)</label><Input value={torY} onChange={(e) => setTorY(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">z(t)</label><Input value={torZ} onChange={(e) => setTorZ(e.target.value)} className="font-mono" /></div>
                  </div>
                </div>
                <div className="max-w-[160px]">
                  <label className="text-xs text-muted-foreground mb-1 block">参数 t₀</label>
                  <Input value={torT0} onChange={(e) => setTorT0(e.target.value)} className="font-mono" />
                </div>
                <Button onClick={computeTorsion} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算挠率</Button>
                <ResultBox text={torResult} error={torError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>挠率衡量曲线扭转程度。平面曲线挠率恒为0</span></div>
              </TabsContent>

              {/* 5. Frenet标架 */}
              <TabsContent value="frenet" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">空间曲线 r(t)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">x(t)</label><Input value={frenetX} onChange={(e) => setFrenetX(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">y(t)</label><Input value={frenetY} onChange={(e) => setFrenetY(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">z(t)</label><Input value={frenetZ} onChange={(e) => setFrenetZ(e.target.value)} className="font-mono" /></div>
                  </div>
                </div>
                <div className="max-w-[160px]">
                  <label className="text-xs text-muted-foreground mb-1 block">参数 t₀</label>
                  <Input value={frenetT0} onChange={(e) => setFrenetT0(e.target.value)} className="font-mono" />
                </div>
                <Button onClick={computeFrenet} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算Frenet标架</Button>
                <ResultBox text={frenetResult} error={frenetError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>Frenet标架构成右手正交单位标架，满足Frenet-Serret公式</span></div>
              </TabsContent>

              {/* 6. 圆柱螺线 */}
              <TabsContent value="helix" className="space-y-4">
                <div className="grid grid-cols-2 gap-3 max-w-[300px]">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">半径 a</label><Input value={helixA} onChange={(e) => setHelixA(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-sm font-medium text-foreground mb-2 block">螺距参数 b</label><Input value={helixB} onChange={(e) => setHelixB(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeHelix} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />圆柱螺线分析</Button>
                <ResultBox text={helixResult} error={helixError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>圆柱螺线 r(t)=(a cos t, a sin t, bt)，曲率和挠率均为常数，κ/τ=a/b=常数</span></div>
              </TabsContent>

              {/* 7. 曲面正则性 */}
              <TabsContent value="surface-reg" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">曲面类型</label>
                  {renderSurfaceSelect(surfPreset, setSurfPreset)}
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-[300px]">
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 u</label><Input value={surfU} onChange={(e) => setSurfU(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 v</label><Input value={surfV} onChange={(e) => setSurfV(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeSurfRegularity} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />验证曲面正则性</Button>
                <ResultBox text={surfResult} error={surfError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>正则曲面: r<sub>u</sub> × r<sub>v</sub> ≠ 0。球面在南北极处为奇点</span></div>
              </TabsContent>

              {/* 8. 第一基本形式 */}
              <TabsContent value="first-form" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">曲面类型</label>
                  {renderSurfaceSelect(form1Preset, setForm1Preset)}
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-[300px]">
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 u</label><Input value={form1U} onChange={(e) => setForm1U(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 v</label><Input value={form1V} onChange={(e) => setForm1V(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeForm1} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算第一基本形式</Button>
                <ResultBox text={form1Result} error={form1Error} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>第一基本形式 I = Edu² + 2Fdudv + Gdv²，完全决定曲面的内蕴几何</span></div>
              </TabsContent>

              {/* 9. 第二基本形式 */}
              <TabsContent value="second-form" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">曲面类型</label>
                  {renderSurfaceSelect(form2Preset, setForm2Preset)}
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-[300px]">
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 u</label><Input value={form2U} onChange={(e) => setForm2U(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 v</label><Input value={form2V} onChange={(e) => setForm2V(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeForm2} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算第二基本形式</Button>
                <ResultBox text={form2Result} error={form2Error} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>第二基本形式 II = Ldu² + 2Mdudv + Ndv²，反映曲面在空间中的弯曲程度</span></div>
              </TabsContent>

              {/* 10. 高斯曲率 */}
              <TabsContent value="gauss-curv" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">曲面类型</label>
                  {renderSurfaceSelect(gcPreset, setGcPreset)}
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-[300px]">
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 u</label><Input value={gcU} onChange={(e) => setGcU(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 v</label><Input value={gcV} onChange={(e) => setGcV(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeGC} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算高斯曲率</Button>
                <ResultBox text={gcResult} error={gcError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>高斯曲率 K = k₁k₂。高斯绝妙定理：K只依赖于第一基本形式，是内蕴量</span></div>
              </TabsContent>

              {/* 11. 平均曲率 */}
              <TabsContent value="mean-curv" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">曲面类型</label>
                  {renderSurfaceSelect(mcPreset, setMcPreset)}
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-[300px]">
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 u</label><Input value={mcU} onChange={(e) => setMcU(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 v</label><Input value={mcV} onChange={(e) => setMcV(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeMC} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算平均曲率</Button>
                <ResultBox text={mcResult} error={mcError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>平均曲率 H = (k₁+k₂)/2。极小曲面 H≡0，面积泛函的临界点</span></div>
              </TabsContent>

              {/* 12. 主曲率 */}
              <TabsContent value="principal" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">曲面类型</label>
                  {renderSurfaceSelect(pcPreset, setPcPreset)}
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-[300px]">
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 u</label><Input value={pcU} onChange={(e) => setPcU(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 v</label><Input value={pcV} onChange={(e) => setPcV(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computePC} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算主曲率</Button>
                <ResultBox text={pcResult} error={pcError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>主曲率 k₁, k₂ 是法曲率的极值，对应主方向互相垂直</span></div>
              </TabsContent>

              {/* 13. 曲面点分类 */}
              <TabsContent value="classify" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">曲面类型</label>
                  {renderSurfaceSelect(clPreset, setClPreset)}
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-[300px]">
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 u</label><Input value={clU} onChange={(e) => setClU(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 v</label><Input value={clV} onChange={(e) => setClV(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeClassify} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />判定点类型</Button>
                <ResultBox text={clResult} error={clError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>按高斯曲率K符号分类: K&gt;0椭圆点，K=0抛物点，K&lt;0双曲点</span></div>
              </TabsContent>

              {/* 14. 常见曲面 */}
              <TabsContent value="common-surf" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">曲面类型</label>
                  {renderSurfaceSelect(csPreset, setCsPreset)}
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-[300px]">
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 u</label><Input value={csU} onChange={(e) => setCsU(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">参数 v</label><Input value={csV} onChange={(e) => setCsV(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={computeCommon} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />完整几何分析</Button>
                <ResultBox text={csResult} error={csError} />
                <div className="text-xs text-muted-foreground flex items-start gap-2"><Info className="size-4 shrink-0 mt-0.5" /><span>5种经典曲面几何量汇总: 球面、球面R=2、环面、马鞍面、圆柱面</span></div>
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
          theme="sand"
          className="mb-4"
        />

      </div>
      <CheatsheetDialog moduleKey="diffgeo" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
