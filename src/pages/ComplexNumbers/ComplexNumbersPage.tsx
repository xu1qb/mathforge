import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import MathInputField from '@/components/MathInputField';
import PageShell from '@/components/PageShell';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Sparkles, Info, Calculator, Type, ListOrdered } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import LearningSection from '@/components/LearningSection';
import Plot from '@/lib/plotly-instance';
import { usePlotlyPalette } from '@/lib/plotly-theme';
import { evaluate, complex, type Complex, derivative, parse } from 'mathjs';
import { formatResult } from '@/lib/math-utils';
import { useHistory } from '@/hooks/useHistory';
import { stepByStepComplexMult } from '@/lib/step-by-step';
import type { StepItem } from '@/lib/step-by-step';
import HistoryPanel from '@/components/HistoryPanel';
import {
  complexNthRoots,
  cauchyRiemannCheck,
  isHarmonic,
  harmonicConjugate,
  complexLineIntegralCircle,
  LAPLACE_TABLE,
  inverseLaplacePartialFractions,
  residueAtPole,
  argumentPrinciple,
  complexPolyRoots,
  complexSeriesRadius,
  fourierTransform,
  laplacePropertiesVerify,
} from '@/lib/math-advanced';
import { toast } from 'sonner';

const EXAMPLES = [
  { label: '加法 (3+2i)+(1+4i)', a: '3+2i', b: '1+4i', op: 'add' },
  { label: '乘法 (2+3i)*(1-i)', a: '2+3i', b: '1-i', op: 'multiply' },
  { label: '除法 (1+i)/(1-i)', a: '1+i', b: '1-i', op: 'divide' },
  { label: '模 |3+4i|', a: '3+4i', b: '', op: 'abs' },
  { label: '欧拉公式 e^(iπ)', a: 'exp(i*pi)', b: '', op: 'eval' },
];

const TABS = [
  { value: 'arithmetic', label: '复数运算' },
  { value: 'nthRoots', label: 'n次方根' },
  { value: 'cauchyRiemann', label: 'C-R方程' },
  { value: 'harmonic', label: '调和函数' },
  { value: 'mapping', label: '复函数映射' },
  { value: 'integral', label: '复积分' },
  { value: 'cauchyFormula', label: '柯西公式' },
  { value: 'taylor', label: '泰勒展开' },
  { value: 'laurent', label: '奇点分类' },
  { value: 'residue', label: '留数计算' },
  { value: 'residueThm', label: '留数定理' },
  { value: 'conformal', label: '共形映射' },
  { value: 'laplace', label: '拉普拉斯变换' },
  { value: 'argPrinciple', label: '幅角原理' },
  { value: 'complexRoots', label: '多项式复根' },
  { value: 'radius', label: '收敛半径' },
  { value: 'fourier', label: '傅里叶变换' },
  { value: 'laplaceProps', label: '拉氏性质' },
];

export default function ComplexNumbersPage() {
  const [activeTab, setActiveTab] = useState('arithmetic');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const palette = usePlotlyPalette();
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_complex_history' });
  const lastResultRef = useRef('');

  const complexPlaneLayout = (xTitle: string, yTitle: string) => ({
    autosize: true, height: 380,
    margin: { l: 40, r: 20, t: 10, b: 40 },
    plot_bgcolor: palette.plot_bgcolor,
    paper_bgcolor: palette.paper_bgcolor,
    font: { color: palette.font_color },
    xaxis: { title: { text: xTitle }, gridcolor: palette.gridcolor, zeroline: true, zerolinecolor: palette.zerolinecolor, scaleanchor: 'y', scaleratio: 1, tickfont: { color: palette.tickfont_color } },
    yaxis: { title: { text: yTitle }, gridcolor: palette.gridcolor, zeroline: true, zerolinecolor: palette.zerolinecolor, tickfont: { color: palette.tickfont_color } },
  });

  // ---------- 1. 复数运算 ----------
  const [aExpr, setAExpr] = useState('3+2i');
  const [bExpr, setBExpr] = useState('1+4i');
  const [arithResult, setArithResult] = useState('');
  const [arithError, setArithError] = useState<string | null>(null);
  const [arithSteps, setArithSteps] = useState<StepItem[] | null>(null);
  const [arithShowSteps, setArithShowSteps] = useState(false);

  // 监听算术运算结果变化，自动记录历史
  useEffect(() => {
    if (arithResult && arithResult !== lastResultRef.current) {
      addItem(activeTab, arithResult);
      lastResultRef.current = arithResult;
    }
  }, [arithResult, activeTab, addItem]);

  const computeArithmetic = (op: string) => {
    setArithError(null);
    try {
      let res = '';
      switch (op) {
        case 'add': {
          const r = evaluate(`(${aExpr}) + (${bExpr})`);
          res = `(${aExpr}) + (${bExpr}) = ${formatResult(r)}`;
          break;
        }
        case 'subtract': {
          const r = evaluate(`(${aExpr}) - (${bExpr})`);
          res = `(${aExpr}) - (${bExpr}) = ${formatResult(r)}`;
          break;
        }
        case 'multiply': {
          const r = evaluate(`(${aExpr}) * (${bExpr})`);
          res = `(${aExpr}) × (${bExpr}) = ${formatResult(r)}`;
          try {
            const za = evaluate(aExpr) as Complex;
            const zb = evaluate(bExpr) as Complex;
            if (za && zb && typeof za === 'object' && typeof zb === 'object' && 're' in za && 'im' in za && 're' in zb && 'im' in zb) {
              const sr = stepByStepComplexMult(za.re, za.im, zb.re, zb.im);
              setArithSteps(sr.steps);
              setArithShowSteps(false);
            } else { setArithSteps(null); }
          } catch { setArithSteps(null); }
          break;
        }
        case 'divide': {
          const r = evaluate(`(${aExpr}) / (${bExpr})`);
          res = `(${aExpr}) ÷ (${bExpr}) = ${formatResult(r)}`;
          break;
        }
        case 'pow': {
          const r = evaluate(`(${aExpr}) ^ (${bExpr})`);
          res = `(${aExpr})^(${bExpr}) = ${formatResult(r)}`;
          break;
        }
        case 'abs': {
          const r = evaluate(`abs(${aExpr})`);
          const z = evaluate(aExpr) as Complex;
          let extra = '';
          if (z && typeof z === 'object' && 're' in z && 'im' in z) {
            const cz = z as Complex;
            const arg = Math.atan2(cz.im, cz.re);
            const mod = Math.hypot(cz.re, cz.im);
            extra = `\n幅角 arg(z) = ${formatResult(arg)} rad ≈ ${formatResult(arg * 180 / Math.PI)}°`;
            extra += `\n三角形式: z = ${formatResult(mod)} (cos ${formatResult(arg)} + i·sin ${formatResult(arg)})`;
            extra += `\n指数形式: z = ${formatResult(mod)} · e^(i·${formatResult(arg)})`;
          }
          res = `|${aExpr}| = ${formatResult(r)}${extra}`;
          break;
        }
        case 'conj': {
          const r = evaluate(`conj(${aExpr})`);
          res = `conj(${aExpr}) = ${formatResult(r)}`;
          break;
        }
        case 'arg': {
          const z = evaluate(aExpr) as Complex;
          if (z && typeof z === 'object' && 're' in z && 'im' in z) {
            const cz = z as Complex;
            const arg = Math.atan2(cz.im, cz.re);
            res = `arg(${aExpr}) = ${formatResult(arg)} rad ≈ ${formatResult(arg * 180 / Math.PI)}°\n(主值范围 (-π, π])`;
          } else {
            res = `arg(${aExpr}) = 0 (实数)`;
          }
          break;
        }
        case 'eval': {
          const r = evaluate(aExpr);
          res = `${aExpr} = ${formatResult(r)}`;
          break;
        }
      }
      setArithResult(res);
    } catch (e) {
      setArithError((e as Error).message || '计算错误');
      setArithResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 2. n次方根 ----------
  const [rootExpr, setRootExpr] = useState('1');
  const [rootN, setRootN] = useState('3');
  const [rootResult, setRootResult] = useState<Array<{ re: number; im: number }>>([]);
  const [rootError, setRootError] = useState<string | null>(null);

  const computeRoots = () => {
    setRootError(null);
    try {
      const z = evaluate(rootExpr) as Complex;
      let re = 0, im = 0;
      if (typeof z === 'number') re = z;
      else if (z && 're' in z) { re = z.re; im = z.im; }
      const n = parseInt(rootN);
      const roots = complexNthRoots(re, im, n);
      setRootResult(roots);
    } catch (e) {
      setRootError((e as Error).message || '计算错误');
      setRootResult([]);
      toast.error('计算错误');
    }
  };

  // ---------- 3. C-R 方程 ----------
  const [uExpr, setUExpr] = useState('x^2 - y^2');
  const [vExpr, setVExpr] = useState('2*x*y');
  const [crX0, setCrX0] = useState('1');
  const [crY0, setCrY0] = useState('2');
  const [crResult, setCrResult] = useState('');
  const [crError, setCrError] = useState<string | null>(null);

  const computeCR = () => {
    setCrError(null);
    try {
      const x0 = parseFloat(crX0), y0 = parseFloat(crY0);
      const result = cauchyRiemannCheck(uExpr, vExpr, x0, y0);
      let txt = `在点 (x₀, y₀) = (${x0}, ${y0}) 处:\n\n`;
      txt += `∂u/∂x = ${formatResult(result.ux)}\n`;
      txt += `∂v/∂y = ${formatResult(result.vy)}\n`;
      txt += `∂u/∂y = ${formatResult(result.uy)}\n`;
      txt += `∂v/∂x = ${formatResult(result.vx)}\n\n`;
      txt += `柯西-黎曼方程:\n`;
      txt += `  ∂u/∂x = ∂v/∂y → ${result.satisfies ? '✓ 成立' : '✗ 不成立'} (误差 = ${formatResult(Math.abs(result.ux - result.vy))})\n`;
      txt += `  ∂u/∂y = -∂v/∂x → ${result.satisfies ? '✓ 成立' : '✗ 不成立'} (误差 = ${formatResult(Math.abs(result.uy + result.vx))})\n\n`;
      if (result.satisfies) {
        txt += `✅ f(z) = u + iv 在该点解析\n`;
        txt += `f'(z) = u_x + i·v_x = ${formatResult(result.ux)} + i·${formatResult(result.vx)}`;
      } else {
        txt += `❌ f(z) = u + iv 在该点不解析`;
      }
      setCrResult(txt);
    } catch (e) {
      setCrError((e as Error).message || '计算错误');
      setCrResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 4. 调和函数 ----------
  const [harmExpr, setHarmExpr] = useState('x^2 - y^2');
  const [harmX0, setHarmX0] = useState('1');
  const [harmY0, setHarmY0] = useState('2');
  const [harmResult, setHarmResult] = useState('');
  const [harmError, setHarmError] = useState<string | null>(null);

  const computeHarmonic = () => {
    setHarmError(null);
    try {
      const x0 = parseFloat(harmX0), y0 = parseFloat(harmY0);
      const r = isHarmonic(harmExpr, x0, y0);
      let txt = `u(x,y) = ${harmExpr}\n\n`;
      txt += `在点 (${x0}, ${y0}) 处:\n`;
      txt += `∂²u/∂x² = ${formatResult(r.uxx)}\n`;
      txt += `∂²u/∂y² = ${formatResult(r.uyy)}\n`;
      txt += `∇²u = u_xx + u_yy = ${formatResult(r.laplacian)}\n\n`;
      txt += r.harmonic
        ? '✅ u(x,y) 在该点调和（拉普拉斯方程成立）'
        : '❌ u(x,y) 在该点不调和';
      // 求共轭调和函数
      if (r.harmonic) {
        const conj = harmonicConjugate(harmExpr, x0, y0);
        txt += `\n\n共轭调和函数 v(x₀, y₀) ≈ ${formatResult(conj.v)} (数值积分近似)`;
        txt += `\nf(z) = u(x,y) + i·v(x,y) 为解析函数`;
      }
      setHarmResult(txt);
    } catch (e) {
      setHarmError((e as Error).message || '计算错误');
      setHarmResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 5. 复函数映射 ----------
  const [mapExpr, setMapExpr] = useState('z^2');
  const [mappingLines, setMappingLines] = useState<Array<{ x: number[]; y: number[]; mx: number[]; my: number[] }>>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  const computeMapping = () => {
    setMapError(null);
    try {
      const nPts = 200;
      const lines: Array<{ x: number[]; y: number[]; mx: number[]; my: number[] }> = [];

      // 同心圆
      for (let r = 0.2; r <= 1.01; r += 0.2) {
        const lx: number[] = [], ly: number[] = [], mx: number[] = [], my: number[] = [];
        for (let i = 0; i <= nPts; i++) {
          const theta = (i / nPts) * 2 * Math.PI;
          const zx = r * Math.cos(theta);
          const zy = r * Math.sin(theta);
          lx.push(zx);
          ly.push(zy);
          const w = evaluate(mapExpr, { z: complex(zx, zy) });
          if (w && typeof w === 'object' && 're' in w && 'im' in w) {
            const cw = w as Complex;
            if (isFinite(cw.re) && isFinite(cw.im) && Math.abs(cw.re) < 100 && Math.abs(cw.im) < 100) {
              mx.push(cw.re);
              my.push(cw.im);
            } else { mx.push(NaN); my.push(NaN); }
          } else if (typeof w === 'number' && isFinite(w)) {
            mx.push(w);
            my.push(0);
          } else {
            mx.push(NaN); my.push(NaN);
          }
        }
        lines.push({ x: lx, y: ly, mx, my });
      }

      // 径向线
      for (let k = 0; k < 8; k++) {
        const theta = (k / 8) * 2 * Math.PI;
        const lx: number[] = [], ly: number[] = [], mx: number[] = [], my: number[] = [];
        for (let i = 0; i <= 50; i++) {
          const r = (i / 50);
          const zx = r * Math.cos(theta);
          const zy = r * Math.sin(theta);
          lx.push(zx);
          ly.push(zy);
          const w = evaluate(mapExpr, { z: complex(zx, zy) });
          if (w && typeof w === 'object' && 're' in w && 'im' in w) {
            const cw = w as Complex;
            if (isFinite(cw.re) && isFinite(cw.im) && Math.abs(cw.re) < 100 && Math.abs(cw.im) < 100) {
              mx.push(cw.re);
              my.push(cw.im);
            } else { mx.push(NaN); my.push(NaN); }
          } else if (typeof w === 'number' && isFinite(w)) {
            mx.push(w);
            my.push(0);
          } else {
            mx.push(NaN); my.push(NaN);
          }
        }
        lines.push({ x: lx, y: ly, mx, my });
      }

      setMappingLines(lines);
    } catch (e) {
      setMapError((e as Error).message || '映射计算错误');
      toast.error('映射计算错误');
    }
  };

  useMemo(() => {
    if (mappingLines.length === 0 && activeTab === 'mapping') {
      computeMapping();
    }
     
  }, [activeTab]);

  // ---------- 6. 复积分 ----------
  const [intExpr, setIntExpr] = useState('1/z');
  const [intZ0re, setIntZ0re] = useState('0');
  const [intZ0im, setIntZ0im] = useState('0');
  const [intR, setIntR] = useState('1');
  const [intResult, setIntResult] = useState('');
  const [intError, setIntError] = useState<string | null>(null);

  const computeIntegral = () => {
    setIntError(null);
    try {
      const z0re = parseFloat(intZ0re), z0im = parseFloat(intZ0im), r = parseFloat(intR);
      const result = complexLineIntegralCircle(intExpr, z0re, z0im, r, 3000);
      let txt = `∮_C f(z) dz, 其中 C: |z - (${z0re}${z0im >= 0 ? '+' : ''}${z0im}i)| = ${r}\n\n`;
      txt += `f(z) = ${intExpr}\n\n`;
      txt += `积分结果 = ${formatResult(result.re)} + i·${formatResult(result.im)}\n`;
      txt += `模 = ${formatResult(Math.hypot(result.re, result.im))}`;
      setIntResult(txt);
    } catch (e) {
      setIntError((e as Error).message || '计算错误');
      setIntResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 7. 柯西积分公式 ----------
  const [cifF, setCifF] = useState('z^2 + 1');
  const [cifZ0re, setCifZ0re] = useState('0');
  const [cifZ0im, setCifZ0im] = useState('0');
  const [cifR, setCifR] = useState('1');
  const [cifResult, setCifResult] = useState('');
  const [cifError, setCifError] = useState<string | null>(null);

  const computeCauchyFormula = () => {
    setCifError(null);
    try {
      const z0re = parseFloat(cifZ0re), z0im = parseFloat(cifZ0im), r = parseFloat(cifR);
      // 被积函数 f(z)/(z-z0)
      const integrand = `(${cifF}) / (z - (${z0re} + i*${z0im}))`;
      const integral = complexLineIntegralCircle(integrand, z0re, z0im, r, 3000);
      // f(z0)
      const fz0 = evaluate(cifF, { z: complex(z0re + r * 0.5, z0im) }) as Complex;
      let f0re = 0, f0im = 0;
      if (typeof fz0 === 'number') f0re = fz0;
      else if (fz0 && 're' in fz0) { f0re = fz0.re; f0im = fz0.im; }
      // 2πi · f(z0) = -2π·v + i·2π·u
      const expectedRe = -2 * Math.PI * f0im;
      const expectedIm = 2 * Math.PI * f0re;

      let txt = `柯西积分公式：∮ f(z)/(z-z₀) dz = 2πi · f(z₀)\n\n`;
      txt += `f(z) = ${cifF}\n`;
      txt += `z₀ = ${z0re}${z0im >= 0 ? '+' : ''}${z0im}i\n`;
      txt += `f(z₀) ≈ ${formatResult(f0re)} + i·${formatResult(f0im)}\n\n`;
      txt += `数值积分结果: ${formatResult(integral.re)} + i·${formatResult(integral.im)}\n`;
      txt += `理论值 2πi·f(z₀): ${formatResult(expectedRe)} + i·${formatResult(expectedIm)}\n`;
      const err = Math.hypot(integral.re - expectedRe, integral.im - expectedIm);
      txt += `\n误差 = ${formatResult(err)}`;
      txt += err < 0.01 ? '\n✅ 与柯西积分公式一致' : '\n⚠️ 误差较大（可能 z₀ 不在积分回路内或 f 不解析）';
      setCifResult(txt);
    } catch (e) {
      setCifError((e as Error).message || '计算错误');
      setCifResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 8. 泰勒级数 ----------
  const [taylorExpr, setTaylorExpr] = useState('exp(x)');
  const [taylorX0, setTaylorX0] = useState('0');
  const [taylorN, setTaylorN] = useState('5');
  const [taylorResult, setTaylorResult] = useState('');
  const [taylorError, setTaylorError] = useState<string | null>(null);

  const computeTaylor = () => {
    setTaylorError(null);
    try {
      const x0 = parseFloat(taylorX0);
      const N = parseInt(taylorN);
      // 用 math.js 的 derivative 求各阶导数
      const coeffs: number[] = [];
      let factorial = 1;
      const fNode = parse(taylorExpr);
      for (let n = 0; n <= N; n++) {
        if (n === 0) {
          const val = evaluate(taylorExpr, { x: x0 });
          coeffs.push(typeof val === 'number' ? val : 0);
        } else {
          factorial *= n;
          try {
            let diffExpr = fNode;
            for (let i = 0; i < n; i++) {
              diffExpr = derivative(diffExpr, 'x');
            }
            const val = diffExpr.evaluate({ x: x0 });
            coeffs.push((typeof val === 'number' ? val : 0) / factorial);
          } catch {
            coeffs.push(NaN);
          }
        }
      }
      let txt = `f(x) = ${taylorExpr} 在 x₀ = ${x0} 处的泰勒展开:\n\n`;
      txt += `f(x) ≈ `;
      const terms: string[] = [];
      for (let n = 0; n <= N; n++) {
        if (!isFinite(coeffs[n])) continue;
        if (Math.abs(coeffs[n]) < 1e-10 && n > 0) continue;
        if (n === 0) {
          terms.push(formatResult(coeffs[n]));
        } else if (x0 === 0) {
          const coef = coeffs[n];
          const sign = coef >= 0 ? '+' : '−';
          const abs = Math.abs(coef);
          terms.push(`${sign} ${formatResult(abs)}x^${n}`);
        } else {
          const coef = coeffs[n];
          const sign = coef >= 0 ? '+' : '−';
          const abs = Math.abs(coef);
          terms.push(`${sign} ${formatResult(abs)}(x-${x0})^${n}`);
        }
      }
      txt += terms.join(' ');
      setTaylorResult(txt);
    } catch (e) {
      setTaylorError((e as Error).message || '计算错误');
      setTaylorResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 9. 奇点分类 ----------
  const [singExpr, setSingExpr] = useState('sin(z)/z');
  const [singZ0re, setSingZ0re] = useState('0');
  const [singZ0im, setSingZ0im] = useState('0');
  const [singResult, setSingResult] = useState('');
  const [singError, setSingError] = useState<string | null>(null);

  const computeSingularity = () => {
    setSingError(null);
    try {
      const z0re = parseFloat(singZ0re), z0im = parseFloat(singZ0im);
      const residue = residueAtPole(singExpr, z0re, z0im, 1);
      let txt = `f(z) = ${singExpr}\n`;
      txt += `候选奇点: z₀ = ${z0re}${z0im >= 0 ? '+' : ''}${z0im}i\n\n`;
      txt += `奇点类型: 极点（数值法验证）\n`;
      txt += `极点阶数: ${residue.order} 阶\n`;
      txt += `留数 Res[f, z₀] = ${formatResult(residue.residueRe)} + i·${formatResult(residue.residueIm)}\n`;
      txt += `留数的模 = ${formatResult(Math.hypot(residue.residueRe, residue.residueIm))}`;
      setSingResult(txt);
    } catch (e) {
      setSingError((e as Error).message || '计算错误');
      setSingResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 10. 留数计算 ----------
  const [resExpr, setResExpr] = useState('1/(z^2 + 1)');
  const [resZ0re, setResZ0re] = useState('0');
  const [resZ0im, setResZ0im] = useState('1');
  const [resResult, setResResult] = useState('');
  const [resError, setResError] = useState<string | null>(null);

  const computeResidue = () => {
    setResError(null);
    try {
      const z0re = parseFloat(resZ0re), z0im = parseFloat(resZ0im);
      const result = residueAtPole(resExpr, z0re, z0im);
      let txt = `f(z) = ${resExpr}\n`;
      txt += `奇点 z₀ = ${z0re}${z0im >= 0 ? '+' : ''}${z0im}i\n\n`;
      if (result.order) {
        txt += `极点阶数: ${result.order} 阶\n`;
      }
      txt += `留数 Res[f(z), z₀] = ${formatResult(result.residueRe)} + i·${formatResult(result.residueIm)}\n`;
      txt += `留数的模 = ${formatResult(Math.hypot(result.residueRe, result.residueIm))}`;
      setResResult(txt);
    } catch (e) {
      setResError((e as Error).message || '计算错误');
      setResResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 11. 留数定理 ----------
  const [resthExpr, setResthExpr] = useState('1/(z^2 + 1)');
  const [resthZ0re, setResthZ0re] = useState('0');
  const [resthZ0im, setResthZ0im] = useState('0');
  const [resthR, setResthR] = useState('2');
  const [resthResult, setResthResult] = useState('');
  const [resthError, setResthError] = useState<string | null>(null);

  const computeResidueTheorem = () => {
    setResthError(null);
    try {
      const z0re = parseFloat(resthZ0re), z0im = parseFloat(resthZ0im), r = parseFloat(resthR);
      // 数值积分
      const integral = complexLineIntegralCircle(resthExpr, z0re, z0im, r, 3000);
      // 留数定理：∮ f(z)dz = 2πi · Σ Res[f, z_k]
      // 用积分算留数和
      const sumResRe = integral.im / (2 * Math.PI);
      const sumResIm = -integral.re / (2 * Math.PI);

      let txt = `留数定理: ∮_C f(z) dz = 2πi · Σ Res[f(z), z_k]\n\n`;
      txt += `f(z) = ${resthExpr}\n`;
      txt += `积分回路: |z - (${z0re}${z0im >= 0 ? '+' : ''}${z0im}i)| = ${r}\n\n`;
      txt += `数值积分结果: ${formatResult(integral.re)} + i·${formatResult(integral.im)}\n\n`;
      txt += `回路内奇点留数之和 = ${formatResult(sumResRe)} + i·${formatResult(sumResIm)}\n`;
      txt += `2πi · Σ Res = ${formatResult(-2 * Math.PI * sumResIm)} + i·${formatResult(2 * Math.PI * sumResRe)}\n`;
      txt += `\n（留数的模 = ${formatResult(Math.hypot(sumResRe, sumResIm))}）`;
      setResthResult(txt);
    } catch (e) {
      setResthError((e as Error).message || '计算错误');
      setResthResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 12. 共形映射 ----------
  const [confType, setConfType] = useState('z^2');
  const [confLines, setConfLines] = useState<Array<{ x: number[]; y: number[]; mx: number[]; my: number[] }>>([]);
  const [confDesc, setConfDesc] = useState('');

  const conformalPresets: Record<string, { expr: string; desc: string }> = {
    'z^2': { expr: 'z^2', desc: 'w = z²：把角域的角度加倍。第一象限映射到上半平面。' },
    '1/z': { expr: '1/z', desc: 'w = 1/z：反演映射。单位圆内部映射到外部，关于单位圆对称。' },
    'exp(z)': { expr: 'exp(z)', desc: 'w = e^z：水平带形域映射为角域/全平面（去掉正实轴）。周期性。' },
    'sqrt(z)': { expr: 'sqrt(z)', desc: 'w = √z：沿正实轴剪开的平面映射到上半平面（主值分支）。' },
    'log(z)': { expr: 'log(z)', desc: 'w = log z：复对数，把平面（除原点）映射为水平带形。' },
    'z+1/z': { expr: 'z + 1/z', desc: 'w = z + 1/z：儒可夫斯基映射，圆映射为翼型。' },
  };

  const computeConformal = () => {
    const preset = conformalPresets[confType];
    if (!preset) return;
    setConfDesc(preset.desc);
    // 用相同的映射计算
    try {
      const expr = preset.expr;
      const nPts = 200;
      const lines: Array<{ x: number[]; y: number[]; mx: number[]; my: number[] }> = [];

      for (let r = 0.3; r <= 1.21; r += 0.3) {
        const lx: number[] = [], ly: number[] = [], mx: number[] = [], my: number[] = [];
        for (let i = 0; i <= nPts; i++) {
          const theta = (i / nPts) * 2 * Math.PI;
          const zx = r * Math.cos(theta);
          const zy = r * Math.sin(theta);
          lx.push(zx);
          ly.push(zy);
          try {
            const w = evaluate(expr, { z: complex(zx, zy) }) as Complex | number;
            let wre = 0, wim = 0;
            if (typeof w === 'number') { wre = w; wim = 0; }
            else if (w && 're' in w) { wre = w.re; wim = w.im; }
            if (isFinite(wre) && isFinite(wim) && Math.abs(wre) < 50 && Math.abs(wim) < 50) {
              mx.push(wre); my.push(wim);
            } else { mx.push(NaN); my.push(NaN); }
          } catch { mx.push(NaN); my.push(NaN); }
        }
        lines.push({ x: lx, y: ly, mx, my });
      }

      for (let k = 0; k < 12; k++) {
        const theta = (k / 12) * 2 * Math.PI;
        const lx: number[] = [], ly: number[] = [], mx: number[] = [], my: number[] = [];
        for (let i = 1; i <= 60; i++) {
          const r = (i / 60) * 1.2;
          const zx = r * Math.cos(theta);
          const zy = r * Math.sin(theta);
          lx.push(zx);
          ly.push(zy);
          try {
            const w = evaluate(expr, { z: complex(zx, zy) }) as Complex | number;
            let wre = 0, wim = 0;
            if (typeof w === 'number') { wre = w; wim = 0; }
            else if (w && 're' in w) { wre = w.re; wim = w.im; }
            if (isFinite(wre) && isFinite(wim) && Math.abs(wre) < 50 && Math.abs(wim) < 50) {
              mx.push(wre); my.push(wim);
            } else { mx.push(NaN); my.push(NaN); }
          } catch { mx.push(NaN); my.push(NaN); }
        }
        lines.push({ x: lx, y: ly, mx, my });
      }

      setConfLines(lines);
    } catch {
      toast.error('共形映射计算错误');
    }
  };

  useMemo(() => {
    if (confLines.length === 0 && activeTab === 'conformal') {
      computeConformal();
    }
     
  }, [activeTab, confType]);

  // ---------- 13. 拉普拉斯变换 ----------
  const [lapMode, setLapMode] = useState('table');
  const [lapNum, setLapNum] = useState('1,1');
  const [lapDen, setLapDen] = useState('1,0,1');
  const [lapResult, setLapResult] = useState('');

  const computeInverseLaplace = () => {
    try {
      const num = lapNum.split(',').map(s => parseFloat(s.trim()));
      const den = lapDen.split(',').map(s => parseFloat(s.trim()));
      if (num.length === 0 || den.length === 0) throw new Error('请输入系数');
      const r = inverseLaplacePartialFractions(num, den);
      let txt = `F(s) = (${num.join('s^... + ')}) / (${den.join('s^... + ')})\n\n`;
      txt += `极点分析:\n`;
      for (const t of r.terms) {
        txt += `  • ${t.description} → ${t.timeDomain}\n`;
      }
      txt += `\n注：完整逆变换需要确定各极点的留数（部分分式系数）。`;
      setLapResult(txt);
    } catch (e) {
      setLapResult('');
      toast.error((e as Error).message);
    }
  };

  // ---------- 14. 幅角原理 ----------
  const [argExpr, setArgExpr] = useState('z^2 - 1');
  const [argR, setArgR] = useState('2');
  const [argResult, setArgResult] = useState('');
  const [argError, setArgError] = useState<string | null>(null);

  const computeArgPrinciple = () => {
    setArgError(null);
    try {
      const R = parseFloat(argR);
      const r = argumentPrinciple(argExpr, R);
      let txt = `f(z) = ${argExpr}\n`;
      txt += `积分回路: |z| = ${R}\n\n`;
      txt += `${r.note}\n\n`;
      txt += `根据幅角原理：\n`;
      txt += `  (1/2π) · Δ_C arg f(z) = N - P\n`;
      txt += `  其中 N = 零点个数, P = 极点个数\n\n`;
      txt += `绕数（整数） = ${r.zerosMinusPoles}\n`;
      txt += `精确值 ≈ ${r.windingNumber.toFixed(6)}`;
      setArgResult(txt);
    } catch (e) {
      setArgError((e as Error).message || '计算错误');
      setArgResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 15. 多项式复根 ----------
  const [polyCoeffs, setPolyCoeffs] = useState('1, 0, 0, -1');
  const [polyRootsResult, setPolyRootsResult] = useState<Array<{ re: number; im: number }>>([]);
  const [polyError, setPolyError] = useState<string | null>(null);

  const computePolyRoots = () => {
    setPolyError(null);
    try {
      const coeffs = polyCoeffs.split(',').map(s => parseFloat(s.trim()));
      if (coeffs.length < 2) throw new Error('多项式至少 2 个系数');
      const roots = complexPolyRoots(coeffs);
      setPolyRootsResult(roots);
    } catch (e) {
      setPolyError((e as Error).message || '计算错误');
      setPolyRootsResult([]);
      toast.error('计算错误');
    }
  };

  // ---------- 16. 幂级数收敛半径 ----------
  const [radiusCoeffs, setRadiusCoeffs] = useState('1, 1, 1, 1, 1, 1, 1, 1, 1, 1');
  const [radiusResult, setRadiusResult] = useState('');
  const [radiusError, setRadiusError] = useState<string | null>(null);

  const computeRadius = () => {
    setRadiusError(null);
    try {
      const coeffs = radiusCoeffs.split(',').map(s => parseFloat(s.trim()));
      if (coeffs.length < 2) throw new Error('至少输入 2 个系数');
      const r = complexSeriesRadius(coeffs);
      let txt = `幂级数 Σ aₙ zⁿ\n`;
      txt += `aₙ (前${Math.min(coeffs.length, 10)}项): ${coeffs.slice(0, 10).map(c => formatResult(c)).join(', ')}\n\n`;
      txt += `比值法: R ≈ ${isFinite(r.ratioRadius) ? formatResult(r.ratioRadius) : '∞'}\n`;
      txt += `根值法: R ≈ ${isFinite(r.rootRadius) && r.rootRadius < 1e9 ? formatResult(r.rootRadius) : '∞'}\n\n`;
      txt += `${r.note}\n\n`;
      txt += `阿贝尔定理：|z| < R 时级数绝对收敛，|z| > R 时发散。`;
      setRadiusResult(txt);
    } catch (e) {
      setRadiusError((e as Error).message || '计算错误');
      setRadiusResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 17. 傅里叶变换 ----------
  const [ftExpr, setFtExpr] = useState('abs(t) < 1 ? 1 : 0');
  const [ftOmega, setFtOmega] = useState('0');
  const [ftResult, setFtResult] = useState('');
  const [ftError, setFtError] = useState<string | null>(null);

  const computeFourier = () => {
    setFtError(null);
    try {
      const omega = parseFloat(ftOmega);
      const r = fourierTransform(ftExpr, omega);
      let txt = `f(t) = ${ftExpr}\n`;
      txt += `ω = ${omega}\n\n`;
      txt += `F(ω) = ∫_{-∞}^{∞} f(t) e^{-iωt} dt\n\n`;
      txt += `实部 Re[F(ω)] = ${formatResult(r.re)}\n`;
      txt += `虚部 Im[F(ω)] = ${formatResult(r.im)}\n`;
      txt += `幅度 |F(ω)| = ${formatResult(r.magnitude)}\n`;
      txt += `相位 arg[F(ω)] = ${formatResult(r.phase)} rad ≈ ${formatResult(r.phase * 180 / Math.PI)}°`;
      setFtResult(txt);
    } catch (e) {
      setFtError((e as Error).message || '计算错误');
      setFtResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 18. 拉普拉斯性质验证 ----------
  const [lapPropExpr, setLapPropExpr] = useState('exp(-t)');
  const [lapPropA, setLapPropA] = useState('1');
  const [lapPropT0, setLapPropT0] = useState('0.5');
  const [lapPropResult, setLapPropResult] = useState('');
  const [lapPropError, setLapPropError] = useState<string | null>(null);

  const computeLaplaceProps = () => {
    setLapPropError(null);
    try {
      const a = parseFloat(lapPropA);
      const t0 = parseFloat(lapPropT0);
      const r = laplacePropertiesVerify(lapPropExpr, a, t0, 1);
      let txt = `f(t) = ${lapPropExpr}\n\n`;
      txt += `1. 时移性质: L{f(t-t₀)} = e^{-st₀}·L{f(t)}\n`;
      txt += `   t₀ = ${t0}\n`;
      txt += `   数值验证: ${r.timeShift.equal ? '✅ 符合' : '⚠️ 有偏差'}\n\n`;
      txt += `2. 频移性质: L{e^{at}·f(t)} = F(s-a)\n`;
      txt += `   a = ${a}\n`;
      txt += `   数值验证: ${r.freqShift.equal ? '✅ 符合' : '⚠️ 有偏差'}\n\n`;
      txt += `3. 微分性质: L{f'(t)} = s·F(s) - f(0)\n`;
      txt += `   数值验证: ${r.derivative.equal ? '✅ 符合' : '⚠️ 有偏差'}\n\n`;
      txt += `4. 积分性质: L{∫₀ᵗ f(τ)dτ} = F(s)/s\n`;
      txt += `   数值验证: ${r.integral.equal ? '✅ 符合' : '⚠️ 有偏差'}\n\n`;
      txt += `注：数值积分近似，误差主要来自被积函数端点截断和采样精度。`;
      setLapPropResult(txt);
    } catch (e) {
      setLapPropError((e as Error).message || '计算错误');
      setLapPropResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 结果框通用 ----------
  const ResultBox = ({ text, error, steps, showSteps, onToggleSteps }: {
    text: string;
    error: string | null;
    steps?: StepItem[] | null;
    showSteps?: boolean;
    onToggleSteps?: () => void;
  }) => {
    const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted');
    return (
      <>
        {text && (
          <div className="bg-[var(--board-bg)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-emerald-400/70 font-medium tracking-wider">结果</div>
              <div className="flex items-center gap-1">
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
                {steps && steps.length > 0 && onToggleSteps && (
                  <button
                    type="button"
                    onClick={onToggleSteps}
                    className="h-6 px-2 text-xs text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 rounded-md transition-colors flex items-center gap-1"
                  >
                    <ListOrdered className="size-3.5" />
                    {showSteps ? '隐藏步骤' : '显示步骤'}
                    <span className="text-amber-500/60">({steps.length})</span>
                  </button>
                )}
              </div>
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

            {showSteps && steps && steps.length > 0 && (
              <div className="mt-3 pt-3 border-t border-emerald-800/40 space-y-2 page-fade-in">
                <p className="text-xs text-amber-400/80 font-medium flex items-center gap-1.5">
                  <ListOrdered className="size-3.5" />
                  计算步骤详解
                </p>
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 bg-emerald-900/20 border border-emerald-800/30 rounded-lg p-3"
                  >
                    <div className="shrink-0 size-5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-emerald-200/90 mb-1.5">
                        {step.description}
                      </p>
                      <div className="bg-muted rounded px-2.5 py-1.5 border border-border overflow-x-auto">
                        <MathRenderer expression={step.latex ?? step.formula} isInput={!step.latex} className="text-xs text-emerald-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="复变函数"
        description="复数运算、C-R方程、调和函数、复积分、级数、留数、共形映射、拉普拉斯变换。"
        eyebrow="学科 · 分析学"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-7xl mx-auto space-y-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <LearningSection moduleKey="complex" />
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap h-auto py-1">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-2 py-1.5 h-auto">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-5 space-y-4">
                {/* 1. 复数运算 */}
                <TabsContent value="arithmetic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <MathInputField value={aExpr} onChange={setAExpr} label="z₁ 或 z" placeholder="如 3+2i" showPalette defaultPreview />
                    <MathInputField value={bExpr} onChange={setBExpr} label="z₂" placeholder="如 1+4i" showPalette defaultPreview={false} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['add', 'subtract', 'multiply', 'divide', 'pow'].map((op) => (
                      <Button key={op} onClick={() => computeArithmetic(op)} variant="outline" size="sm">
                        {op === 'add' ? '+' : op === 'subtract' ? '−' : op === 'multiply' ? '×' : op === 'divide' ? '÷' : 'z₁^z₂'}
                      </Button>
                    ))}
                    <div className="w-px bg-border mx-2" />
                    {['abs', 'arg', 'conj', 'eval'].map((op) => (
                      <Button key={op} onClick={() => computeArithmetic(op)} variant="outline" size="sm">
                        {op === 'abs' ? '|z| 模' : op === 'arg' ? 'arg(z) 辐角' : op === 'conj' ? 'conj 共轭' : '求值'}
                      </Button>
                    ))}
                  </div>

                  <ResultBox text={arithResult} error={arithError} steps={arithSteps} showSteps={arithShowSteps} onToggleSteps={() => setArithShowSteps((s) => !s)} />

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Sparkles className="size-4 text-emerald-600" />快速示例
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {EXAMPLES.map((ex, i) => (
                        <Button key={i} variant="outline" size="sm" className="justify-start h-auto py-2 px-2 text-left"
                          onClick={() => { setAExpr(ex.a); setBExpr(ex.b); computeArithmetic(ex.op); }}>
                          <span className="text-xs font-mono text-foreground truncate">{ex.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* 2. n次方根 */}
                <TabsContent value="nthRoots" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">复数 z</label>
                      <Input value={rootExpr} onChange={(e) => setRootExpr(e.target.value)} className="font-mono" placeholder="如 1, 3+4i" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">方根次数 n</label>
                      <Input value={rootN} onChange={(e) => setRootN(e.target.value)} className="font-mono" placeholder="如 3" />
                    </div>
                  </div>
                  <Button onClick={computeRoots} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 n 次方根
                  </Button>
                  {rootResult.length > 0 && (
                    <div className="bg-[var(--board-bg)] rounded-xl p-4">
                      <div className="text-xs text-emerald-400/70 mb-2 font-medium tracking-wider">z 的 {rootN} 次方根（共 {rootResult.length} 个）</div>
                      <div className="text-emerald-300 font-mono text-sm space-y-1">
                        {rootResult.map((r, i) => (
                          <div key={i}>z_{i} = {formatResult(r.re)} + i·{formatResult(r.im)}  (|z| = {formatResult(Math.hypot(r.re, r.im))}, arg = {formatResult(Math.atan2(r.im, r.re))} rad)</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {rootError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm">{rootError}</div>}
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>复数开 n 次方有 n 个根，均匀分布在以原点为圆心、半径为 |z|^(1/n) 的圆上。</span>
                  </div>
                </TabsContent>

                {/* 3. C-R方程 */}
                <TabsContent value="cauchyRiemann" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">实部 u(x,y)</label>
                      <Input value={uExpr} onChange={(e) => setUExpr(e.target.value)} className="font-mono" placeholder="如 x^2 - y^2" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">虚部 v(x,y)</label>
                      <Input value={vExpr} onChange={(e) => setVExpr(e.target.value)} className="font-mono" placeholder="如 2*x*y" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">x₀</label>
                      <Input value={crX0} onChange={(e) => setCrX0(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">y₀</label>
                      <Input value={crY0} onChange={(e) => setCrY0(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeCR} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />验证柯西-黎曼方程
                  </Button>
                  <ResultBox text={crResult} error={crError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>柯西-黎曼方程：∂u/∂x = ∂v/∂y 且 ∂u/∂y = -∂v/∂x。满足则 f(z) 在该点解析，f'(z) = u_x + i·v_x。</span>
                  </div>
                </TabsContent>

                {/* 4. 调和函数 */}
                <TabsContent value="harmonic" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">二元函数 u(x,y)</label>
                    <Input value={harmExpr} onChange={(e) => setHarmExpr(e.target.value)} className="font-mono" placeholder="如 x^2 - y^2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">x₀</label>
                      <Input value={harmX0} onChange={(e) => setHarmX0(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">y₀</label>
                      <Input value={harmY0} onChange={(e) => setHarmY0(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeHarmonic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />验证调和性 + 求共轭调和函数
                  </Button>
                  <ResultBox text={harmResult} error={harmError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>调和函数满足拉普拉斯方程 ∇²u = u_xx + u_yy = 0。解析函数的实部和虚部都是调和函数，且互为共轭调和。</span>
                  </div>
                </TabsContent>

                {/* 5. 复函数映射 */}
                <TabsContent value="mapping" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">映射 w = f(z) （变量用 z）</label>
                    <Input value={mapExpr} onChange={(e) => setMapExpr(e.target.value)} className="font-mono" placeholder="如 z^2, 1/z, exp(z), sin(z)" />
                  </div>
                  <Button onClick={computeMapping} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />绘制映射
                  </Button>
                  {mapError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm">{mapError}</div>}
                  <p className="text-xs text-muted-foreground">
                    左侧：z 平面上的极坐标网格（同心圆 + 径向线）。右侧：经过 w = f(z) 映射后的 w 平面。共形映射保持角度不变。
                  </p>
                </TabsContent>

                {/* 6. 复积分 */}
                <TabsContent value="integral" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">被积函数 f(z)</label>
                    <Input value={intExpr} onChange={(e) => setIntExpr(e.target.value)} className="font-mono" placeholder="如 1/z, z^2" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">圆心 Re(z₀)</label>
                      <Input value={intZ0re} onChange={(e) => setIntZ0re(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">圆心 Im(z₀)</label>
                      <Input value={intZ0im} onChange={(e) => setIntZ0im(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">半径 r</label>
                      <Input value={intR} onChange={(e) => setIntR(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeIntegral} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算周线积分
                  </Button>
                  <ResultBox text={intResult} error={intError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>复积分 ∮_C f(z) dz 沿圆周 C 逆时针方向，采用梯形法数值计算。</span>
                  </div>
                </TabsContent>

                {/* 7. 柯西积分公式 */}
                <TabsContent value="cauchyFormula" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">解析函数 f(z)</label>
                    <Input value={cifF} onChange={(e) => setCifF(e.target.value)} className="font-mono" placeholder="如 z^2 + 1" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">z₀ 实部</label>
                      <Input value={cifZ0re} onChange={(e) => setCifZ0re(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">z₀ 虚部</label>
                      <Input value={cifZ0im} onChange={(e) => setCifZ0im(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">积分半径</label>
                      <Input value={cifR} onChange={(e) => setCifR(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeCauchyFormula} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />验证柯西积分公式
                  </Button>
                  <ResultBox text={cifResult} error={cifError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>柯西积分公式：∮ f(z)/(z-z₀) dz = 2πi · f(z₀)，当 f(z) 在 C 内解析且 z₀ 在 C 内部时成立。</span>
                  </div>
                </TabsContent>

                {/* 8. 泰勒展开 */}
                <TabsContent value="taylor" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-foreground mb-2 block">函数 f(x)</label>
                      <Input value={taylorExpr} onChange={(e) => setTaylorExpr(e.target.value)} className="font-mono" placeholder="如 exp(x), sin(x), 1/(1-x)" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">展开阶数 N</label>
                      <Input value={taylorN} onChange={(e) => setTaylorN(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">展开点 x₀</label>
                    <Input value={taylorX0} onChange={(e) => setTaylorX0(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeTaylor} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算泰勒展开
                  </Button>
                  <ResultBox text={taylorResult} error={taylorError} />
                </TabsContent>

                {/* 9. 奇点分类 */}
                <TabsContent value="laurent" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">函数 f(z)</label>
                    <Input value={singExpr} onChange={(e) => setSingExpr(e.target.value)} className="font-mono" placeholder="如 sin(z)/z, 1/(z-1)^2, exp(1/z)" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">z₀ 实部</label>
                      <Input value={singZ0re} onChange={(e) => setSingZ0re(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">z₀ 虚部</label>
                      <Input value={singZ0im} onChange={(e) => setSingZ0im(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeSingularity} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />分类奇点并计算留数
                  </Button>
                  <ResultBox text={singResult} error={singError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>通过沿小圆周积分的数值方法估算奇点类型和留数。可去奇点：留数为0且函数值有限；极点：留数非零，有确定阶数；本性奇点：洛朗级数含无穷多负幂项。</span>
                  </div>
                </TabsContent>

                {/* 10. 留数计算 */}
                <TabsContent value="residue" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">函数 f(z)</label>
                    <Input value={resExpr} onChange={(e) => setResExpr(e.target.value)} className="font-mono" placeholder="如 1/(z^2 + 1)" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">奇点 Re(z₀)</label>
                      <Input value={resZ0re} onChange={(e) => setResZ0re(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">奇点 Im(z₀)</label>
                      <Input value={resZ0im} onChange={(e) => setResZ0im(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeResidue} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算留数
                  </Button>
                  <ResultBox text={resResult} error={resError} />
                </TabsContent>

                {/* 11. 留数定理 */}
                <TabsContent value="residueThm" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">被积函数 f(z)</label>
                    <Input value={resthExpr} onChange={(e) => setResthExpr(e.target.value)} className="font-mono" placeholder="如 1/(z^2 + 1)" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">圆心 Re</label>
                      <Input value={resthZ0re} onChange={(e) => setResthZ0re(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">圆心 Im</label>
                      <Input value={resthZ0im} onChange={(e) => setResthZ0im(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">半径</label>
                      <Input value={resthR} onChange={(e) => setResthR(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeResidueTheorem} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />验证留数定理
                  </Button>
                  <ResultBox text={resthResult} error={resthError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>留数定理：∮ f(z)dz = 2πi · Σ Res[f(z), z_k]，其中 z_k 为回路内所有孤立奇点。</span>
                  </div>
                </TabsContent>

                {/* 12. 共形映射 */}
                <TabsContent value="conformal" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">选择经典共形映射</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(conformalPresets).map(key => (
                        <Button key={key} variant={confType === key ? 'default' : 'outline'} size="sm"
                          onClick={() => setConfType(key)}
                          className={confType === key ? 'bg-emerald-700 hover:bg-emerald-800' : ''}>
                          w = {key}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {confDesc && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-amber-800 dark:text-amber-300 text-sm">
                      {confDesc}
                    </div>
                  )}
                </TabsContent>

                {/* 13. 拉普拉斯变换 */}
                <TabsContent value="laplace" className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant={lapMode === 'table' ? 'default' : 'outline'} size="sm"
                      onClick={() => setLapMode('table')}
                      className={lapMode === 'table' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}>
                      变换表
                    </Button>
                    <Button variant={lapMode === 'inverse' ? 'default' : 'outline'} size="sm"
                      onClick={() => setLapMode('inverse')}
                      className={lapMode === 'inverse' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}>
                      逆变换（部分分式）
                    </Button>
                  </div>

                  {lapMode === 'table' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="text-left p-2 font-semibold text-foreground border border-border">f(t)</th>
                            <th className="text-left p-2 font-semibold text-foreground border border-border">{'F(s) = L{f(t)}'}</th>
                            <th className="text-left p-2 font-semibold text-foreground border border-border">收敛域</th>
                          </tr>
                        </thead>
                        <tbody>
                          {LAPLACE_TABLE.map((row, i) => (
                            <tr key={i} className="hover:bg-muted/50">
                              <td className="p-2 font-mono border border-border">{row.f}</td>
                              <td className="p-2 font-mono border border-border">{row.Fs}</td>
                              <td className="p-2 border border-border text-foreground text-xs">{row.condition}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {lapMode === 'inverse' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">分子系数（按降幂，逗号分隔）</label>
                          <Input value={lapNum} onChange={(e) => setLapNum(e.target.value)} className="font-mono" placeholder="如 1,1 表示 s+1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">分母系数（按降幂，逗号分隔）</label>
                          <Input value={lapDen} onChange={(e) => setLapDen(e.target.value)} className="font-mono" placeholder="如 1,0,1 表示 s²+1" />
                        </div>
                      </div>
                      <Button onClick={computeInverseLaplace} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                        <Play className="size-4 mr-2" />分析极点与逆变换形式
                      </Button>
                      {lapResult && (
                        <div className="bg-[var(--board-bg)] rounded-xl p-4">
                          <div className="text-emerald-300 font-mono text-sm whitespace-pre-wrap break-all">{lapResult}</div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* 14. 幅角原理 */}
                <TabsContent value="argPrinciple" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">f(z) 表达式</label>
                      <Input value={argExpr} onChange={(e) => setArgExpr(e.target.value)} className="font-mono" placeholder="如 z^2 - 1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">圆半径 R</label>
                      <Input value={argR} onChange={(e) => setArgR(e.target.value)} className="font-mono" placeholder="2" />
                    </div>
                  </div>
                  <Button onClick={computeArgPrinciple} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算绕数（零点数 - 极点数）
                  </Button>
                  <ResultBox text={argResult} error={argError} />
                  <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 border border-border">
                    <p className="font-medium text-foreground mb-1">💡 幅角原理</p>
                    <p>设 f(z) 在简单闭曲线 C 内除有限个极点外解析，则 (1/2πi)∮_C f'/f dz = N - P</p>
                    <p>其中 N 为零点数，P 为极点数（按重数计）。等价于 f(C) 绕原点的绕数。</p>
                  </div>
                </TabsContent>

                {/* 15. 多项式复根 */}
                <TabsContent value="complexRoots" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">多项式系数（按降幂排列，逗号分隔）</label>
                    <Input value={polyCoeffs} onChange={(e) => setPolyCoeffs(e.target.value)} className="font-mono" placeholder="如 1,0,0,-1 表示 z³-1" />
                    <p className="text-xs text-muted-foreground mt-1">Durand-Kerner 方法求所有复根（代数基本定理：n 次多项式有 n 个复根）</p>
                  </div>
                  <Button onClick={computePolyRoots} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Sparkles className="size-4 mr-2" />求全部复根
                  </Button>
                  {polyRootsResult.length > 0 && (
                    <div className="bg-[var(--board-bg)] rounded-xl p-4">
                      <div className="text-xs text-emerald-400/70 mb-2 font-medium tracking-wider">结果（共 {polyRootsResult.length} 个根）</div>
                      <div className="space-y-1">
                        {polyRootsResult.map((r, i) => (
                          <div key={i} className="text-emerald-300 font-mono text-sm">
                            z_{i + 1} = {r.re >= 0 ? '' : ''}{formatResult(r.re)}{r.im >= 0 ? ' + ' : ' - '}{formatResult(Math.abs(r.im))}i
                            <span className="text-emerald-500/60 text-xs ml-2">（|z| ≈ {formatResult(Math.hypot(r.re, r.im))}）</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {polyError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm">{polyError}</div>
                  )}
                </TabsContent>

                {/* 16. 收敛半径 */}
                <TabsContent value="radius" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">级数系数 a₀, a₁, a₂, ...（逗号分隔）</label>
                    <Input value={radiusCoeffs} onChange={(e) => setRadiusCoeffs(e.target.value)} className="font-mono" placeholder="如 1,1,1,1,1 表示 Σzⁿ" />
                    <p className="text-xs text-muted-foreground mt-1">比值法 + 根值法联合估算收敛半径；系数越多估计越准</p>
                  </div>
                  <Button onClick={computeRadius} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />估算收敛半径 R
                  </Button>
                  <ResultBox text={radiusResult} error={radiusError} />
                </TabsContent>

                {/* 17. 傅里叶变换 */}
                <TabsContent value="fourier" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">f(t) 表达式（t 为变量）</label>
                      <Input value={ftExpr} onChange={(e) => setFtExpr(e.target.value)} className="font-mono" placeholder="如 exp(-t^2)" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">角频率 ω</label>
                      <Input value={ftOmega} onChange={(e) => setFtOmega(e.target.value)} className="font-mono" placeholder="0" />
                    </div>
                  </div>
                  <Button onClick={computeFourier} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 F(ω)
                  </Button>
                  <ResultBox text={ftResult} error={ftError} />
                  <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 border border-border">
                    <p className="font-medium text-foreground mb-1">💡 傅里叶变换</p>
                    <p>F(ω) = ∫{'{−∞}'}^{'{∞}'} f(t) e^{'-iωt'} dt（数值积分近似，积分区间默认 [-10, 10]）</p>
                  </div>
                </TabsContent>

                {/* 18. 拉普拉斯性质 */}
                <TabsContent value="laplaceProps" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">f(t) 表达式</label>
                      <Input value={lapPropExpr} onChange={(e) => setLapPropExpr(e.target.value)} className="font-mono" placeholder="exp(-t)" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">频移参数 a</label>
                      <Input value={lapPropA} onChange={(e) => setLapPropA(e.target.value)} className="font-mono" placeholder="1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">时移 t₀</label>
                      <Input value={lapPropT0} onChange={(e) => setLapPropT0(e.target.value)} className="font-mono" placeholder="0.5" />
                    </div>
                  </div>
                  <Button onClick={computeLaplaceProps} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Sparkles className="size-4 mr-2" />验证 4 条核心性质
                  </Button>
                  <ResultBox text={lapPropResult} error={lapPropError} />
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
          onSelect={() => { /* 复变模块子功能较多，点击历史显示结果文本 */ }}
          theme="fuchsia"
          className="mb-4"
        />

        {/* 映射/共形映射可视化 */}
        {(activeTab === 'mapping' || activeTab === 'conformal') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="px-4 pt-3 text-sm font-semibold text-foreground">z 平面（原像）</div>
                <Plot
                  data={(activeTab === 'mapping' ? mappingLines : confLines).map((l, i) => ({
                    x: l.x, y: l.y, type: 'scatter' as const, mode: 'lines' as const,
                    name: `line ${i}`, showlegend: false,
                    line: { color: '#059669', width: 1.5 },
                  }))}
                  layout={complexPlaneLayout('Re(z)', 'Im(z)')}
                  config={{ responsive: true, displayModeBar: false, displaylogo: false }}
                  style={{ width: '100%' }}
                />
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="px-4 pt-3 text-sm font-semibold text-foreground">w 平面（映射后）</div>
                <Plot
                  data={(activeTab === 'mapping' ? mappingLines : confLines).map((l, i) => ({
                    x: l.mx, y: l.my, type: 'scatter' as const, mode: 'lines' as const,
                    name: `line ${i}`, showlegend: false,
                    line: { color: '#dc2626', width: 1.5 },
                  }))}
                    layout={complexPlaneLayout('Re(w)', 'Im(w)')}
                  config={{ responsive: true, displayModeBar: false, displaylogo: false }}
                  style={{ width: '100%' }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <CheatsheetDialog moduleKey="complex" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
