import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import MathInputField from '@/components/MathInputField';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import ComputationResult from '@/components/ComputationResult';
import LearningSection from '@/components/LearningSection';
import { Play, Sparkles } from 'lucide-react';
import Plot from 'react-plotly.js';
import { usePlotlyPalette } from '@/lib/plotly-theme';
import { parse } from 'mathjs';
import { odeRK4, odeEuler } from '@/lib/math-utils';
import { laplaceSolveODE, powerSeriesLegendre } from '@/lib/math-advanced';
import { useHistory } from '@/hooks/useHistory';
import HistoryPanel from '@/components/HistoryPanel';
import { stepByStepLinearODE } from '@/lib/step-by-step';
import type { StepItem } from '@/lib/step-by-step';
import { linearODEAnalytical, bernoulliODE, checkSeparable, checkHomogeneous, checkExact, reducibleODE, secondOrderHomogeneous, secondOrderNonhomogeneous, eulerEquation, linearSystemODE, stabilityAnalysis, phaseLineAnalysis } from '@/lib/ode-advanced';
import { toast } from 'sonner';

const EXAMPLES = [
  { name: '指数增长', expr: 'y', y0: '1', x0: '0', xEnd: '3', method: 'rk4' },
  { name: '逻辑斯蒂', expr: 'y*(1-y)', y0: '0.1', x0: '0', xEnd: '10', method: 'rk4' },
  { name: '简谐振动', expr: '-y', y0: '1', yp0: '0', x0: '0', xEnd: '10', method: 'second' },
];

// 解析矩阵字符串：行用分号分隔，列用逗号分隔
function parseMatrix(s: string): number[][] {
  return s.split(';').map((row) =>
    row.split(',').map((x) => parseFloat(x.trim())).filter((x) => !isNaN(x))
  ).filter((row) => row.length > 0);
}

export default function ODEPage() {
  const [activeTab, setActiveTab] = useState('rk4');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultText, setResultText] = useState('');
  const [steps, setSteps] = useState<StepItem[] | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_ode_history' });
  const lastResultRef = useRef('');

  // 监听结果变化，自动记录历史
  useEffect(() => {
    if (resultText && resultText !== lastResultRef.current && !error) {
      addItem(activeTab, resultText);
      lastResultRef.current = resultText;
    }
  }, [resultText, error, activeTab, addItem]);

  // ---- 数值解法（RK4/Euler/二阶）----
  const [expr, setExpr] = useState('y*(1-y)');
  const [y0, setY0] = useState('0.1');
  const [x0, setX0] = useState('0');
  const [xEnd, setXEnd] = useState('10');
  const [nSteps, setNSteps] = useState('200');
  const [showField, setShowField] = useState(false);
  const [, setShowPlot] = useState(false);

  const [expr2, setExpr2] = useState('-y');
  const [y02, setY02] = useState('1');
  const [yp0, setYp0] = useState('0');
  const [x02, setX02] = useState('0');
  const [xEnd2, setXEnd2] = useState('10');

  // ---- 解析解法 ----
  const [separableExpr, setSeparableExpr] = useState('2*x/y');
  const [separableY0, setSeparableY0] = useState('1');
  const [separableX0, setSeparableX0] = useState('0');

  const [linearP, setLinearP] = useState('1');
  const [linearQ, setLinearQ] = useState('exp(-x)');
  const [linearY0, setLinearY0] = useState('1');
  const [linearX0, setLinearX0] = useState('0');

  const [bernoulliP, setBernoulliP] = useState('1');
  const [bernoulliQ, setBernoulliQ] = useState('x');
  const [bernoulliN, setBernoulliN] = useState('2');
  const [bernoulliX0, setBernoulliX0] = useState('0');
  const [bernoulliY0, setBernoulliY0] = useState('1');

  const [ccA, setCcA] = useState('-5');
  const [ccB, setCcB] = useState('6');

  const [nhA, setNhA] = useState('0');
  const [nhB, setNhB] = useState('1');
  const [nhF, setNhF] = useState('sin(x)');

  const [eulerA, setEulerA] = useState('-3');
  const [eulerB, setEulerB] = useState('3');

  const [systemMatrix, setSystemMatrix] = useState('[2,1;1,2]');

  const [stabFx, setStabFx] = useState('-x');
  const [stabGx, setStabGx] = useState('-2*y');

  // 齐次方程
  const [homogeneousExpr, setHomogeneousExpr] = useState('(x+y)/x');

  // 恰当方程
  const [exactP, setExactP] = useState('2*x+y');
  const [exactQ, setExactQ] = useState('x+2*y');

  // 可降阶
  const [reducibleType, setReducibleType] = useState('type1');
  const [reducibleF, setReducibleF] = useState('6*x');

  // 相图
  const [phaseExpr, setPhaseExpr] = useState('x-x^3');
  const [phaseXMin, setPhaseXMin] = useState('-2');
  const [phaseXMax, setPhaseXMax] = useState('2');

  // 拉普拉斯变换
  const [lapA, setLapA] = useState('1');
  const [lapB, setLapB] = useState('0');
  const [lapC, setLapC] = useState('1');
  const [lapFType, setLapFType] = useState<'zero' | 'constant' | 'delta' | 'heaviside'>('zero');
  const [lapFVal, setLapFVal] = useState('1');
  const [lapShift, setLapShift] = useState('1');
  const [lapY0, setLapY0] = useState('1');
  const [lapYp0, setLapYp0] = useState('0');

  // 勒让德幂级数
  const [legN, setLegN] = useState('2');
  const [legA0, setLegA0] = useState('1');
  const [legA1, setLegA1] = useState('0');
  const [legTerms, setLegTerms] = useState('8');

  // 计算解析解并返回文本
  const computeAnalytic = useCallback(() => {
    setError(null);
    setResultText('');
    try {
      let res = '';
      switch (activeTab) {
        case 'separable': {
          const result = checkSeparable(separableExpr);
          if (result.separable) {
            res = `✓ 可分离变量方程\n\n提示：${result.hint}\n\n请使用积分法求解，两边分别积分后代入初值确定常数。`;
          } else {
            res = `✗ 该方程不（明显）是可分离变量形式\n\n${result.hint}`;
          }
          break;
        }
        case 'linear': {
          const result = linearODEAnalytical(linearP, linearQ, parseFloat(linearX0), parseFloat(linearY0));
          const parts = [`【积分因子】\nμ(x) = ${result.integratingFactor}`, `【通解】\n${result.generalSolution}`];
          if (result.particularSolution) parts.push(`【特解】\n${result.particularSolution}`);
          res = parts.join('\n\n');
          try {
            const sr = stepByStepLinearODE(linearP, linearQ);
            setSteps(sr.steps);
            setShowSteps(false);
          } catch { setSteps(null); }
          break;
        }
        case 'bernoulli': {
          const nv = parseFloat(bernoulliN);
          if (isNaN(nv)) throw new Error('请输入有效数字 n');
          const result = bernoulliODE(bernoulliP, bernoulliQ, nv, parseFloat(bernoulliX0 || '0'), parseFloat(bernoulliY0 || '1'));
          const parts = [`【变量代换】\n${result.substitution}`, `【线性化形式】\n${result.linearForm}`, `【通解】\n${result.generalSolution}`];
          if (result.particularSolution) parts.push(`【特解】\n${result.particularSolution}`);
          res = parts.join('\n\n');
          break;
        }
        case 'homogeneous': {
          const result = checkHomogeneous(homogeneousExpr);
          if (result.homogeneous) {
            res = `✓ 齐次方程 dy/dx = f(y/x)\n\n${result.hint}`;
          } else {
            res = `✗ 该方程不（明显）是齐次方程\n\n${result.hint}`;
          }
          break;
        }
        case 'exact': {
          const result = checkExact(exactP, exactQ);
          res = result.exact
            ? `✓ 恰当方程\n\n∂P/∂y ≈ ${result.py.toFixed(4)}\n∂Q/∂x ≈ ${result.qx.toFixed(4)}\n\n${result.hint}`
            : `✗ 非恰当方程\n\n∂P/∂y ≈ ${result.py.toFixed(4)}\n∂Q/∂x ≈ ${result.qx.toFixed(4)}\n\n${result.hint}`;
          break;
        }
        case 'reducible': {
          const t = reducibleType as 'type1' | 'type2' | 'type3';
          const r = reducibleODE(t, reducibleF);
          res = `【类型】${r.typeName}\n\n【降阶方法】${r.reduction}\n\n【求解步骤】\n${r.hint}`;
          break;
        }
        case 'cc-homogeneous': {
          const a = parseFloat(ccA), b = parseFloat(ccB);
          if (isNaN(a) || isNaN(b)) throw new Error('请输入有效数字');
          const result = secondOrderHomogeneous(a, b);
          const caseName = result.case === 'distinct-real' ? '两个不相等实根'
            : result.case === 'repeated' ? '重根'
            : '一对共轭复根';
          res = `【特征方程】\nr² + (${a})r + (${b}) = 0\n\n【根的情况】${caseName}\nr₁ = ${result.r1.toFixed(4)},  r₂ = ${result.r2.toFixed(4)}\n\n【通解】\n${result.generalSolution}`;
          break;
        }
        case 'cc-nonhomogeneous': {
          const a = parseFloat(nhA), b = parseFloat(nhB);
          if (isNaN(a) || isNaN(b)) throw new Error('请输入有效数字');
          const result = secondOrderNonhomogeneous(a, b, nhF);
          res = `【齐次通解】\n${result.homogeneousSolution}\n\n【特解形式】\n${result.particularForm}\n\n【通解】\n${result.generalSolution}`;
          break;
        }
        case 'euler-eq': {
          const a = parseFloat(eulerA), b = parseFloat(eulerB);
          if (isNaN(a) || isNaN(b)) throw new Error('请输入有效数字');
          const result = eulerEquation(a, b);
          res = `【变换】令 x = e^t,  t = ln|x|\n\n【特征方程】\nr² + (${a - 1})r + ${b} = 0\n\n【通解】\n${result.generalSolution}`;
          break;
        }
        case 'linear-system': {
          const matStr = systemMatrix.replace(/[\[\]]/g, '');
          const A = parseMatrix(matStr);
          if (A.length === 0 || A.some((r) => r.length !== A.length)) throw new Error('请输入有效的方阵（行用分号，列用逗号）');
          const result = linearSystemODE(A);
          const eigStr = Array.isArray(result.eigenvalues)
            ? result.eigenvalues.map((v: any) =>
                typeof v === 'number' ? v.toFixed(4)
                  : `${v.real.toFixed(4)}${v.imag >= 0 ? '+' : ''}${v.imag.toFixed(4)}i`
              ).join(', ')
            : '';
          res = `【系数矩阵特征值】\n${eigStr}\n\n【通解形式】\n${result.generalSolution}`;
          break;
        }
        case 'stability': {
          const result = stabilityAnalysis(stabFx, stabGx);
          if (result.equilibriumPoints.length === 0) {
            res = '在搜索范围内未找到平衡点（尝试调整表达式或扩大搜索范围）';
          } else {
            res = result.equilibriumPoints.map((eq, i) => {
              const eigStr = Array.isArray(eq.eigenvalues)
                ? eq.eigenvalues.map((v: any) =>
                    typeof v === 'number' ? v.toFixed(4)
                      : `${v.real.toFixed(4)}${v.imag >= 0 ? '+' : ''}${v.imag.toFixed(4)}i`
                  ).join(', ')
                : '';
              return `平衡点 ${i + 1}: (${eq.x.toFixed(3)}, ${eq.y.toFixed(3)})\n  类型: ${eq.type}\n  Jacobian 特征值: ${eigStr}`;
            }).join('\n\n');
          }
          break;
        }
        case 'phase-line': {
          const xMin = parseFloat(phaseXMin), xMax = parseFloat(phaseXMax);
          if (isNaN(xMin) || isNaN(xMax)) throw new Error('请输入有效 x 范围');
          const result = phaseLineAnalysis(phaseExpr, xMin, xMax);
          if (result.equilibria.length === 0) {
            res = '在指定范围内未找到平衡点（f(x) 可能恒正/恒负，或无零点）';
          } else {
            res = result.equilibria.map((eq, i) => {
              return `平衡点 ${i + 1}: x* = ${eq.x.toFixed(4)}\n  f'(x*) ≈ ${eq.slope.toFixed(4)}\n  稳定性: ${eq.stability}`;
            }).join('\n\n');
          }
          setShowPlot(true);
          break;
        }
        case 'laplace': {
          const a = parseFloat(lapA), b = parseFloat(lapB), c = parseFloat(lapC);
          const y0 = parseFloat(lapY0), y1 = parseFloat(lapYp0);
          const fVal = parseFloat(lapFVal);
          const shift = parseFloat(lapShift);
          if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(y0) || isNaN(y1)) throw new Error('请输入有效数字');
          const fParams: Record<string, number> = { F: fVal, a: shift };
          const r = laplaceSolveODE(a, b, c, lapFType, fParams, y0, y1);
          res = `拉普拉斯变换法解 ODE\n\n方程：${a}y'' + ${b}y' + ${c}y = f(t)\n初值：y(0) = ${y0}, y'(0) = ${y1}\nf(t) 类型：${lapFType === 'zero' ? '0' : lapFType === 'constant' ? `${fVal}（常数）` : lapFType === 'delta' ? `${fVal}·δ(t)` : `${fVal}·u(t-${shift})`}\n\n${r.steps.join('\n')}\n\n${r.characteristic}`;
          break;
        }
        case 'legendre-ps': {
          const n = parseFloat(legN);
          const a0 = parseFloat(legA0), a1 = parseFloat(legA1);
          const terms = parseInt(legTerms, 10);
          if (isNaN(n) || isNaN(a0) || isNaN(a1)) throw new Error('请输入有效数字');
          if (terms < 2 || terms > 20) throw new Error('项数应在 2~20 之间');
          const r = powerSeriesLegendre(n, a0, a1, terms);
          let s = `勒让德方程：(1-x²)y'' - 2x·y' + n(n+1)y = 0\n\n阶数 n = ${n}\n初值 a₀ = ${a0}, a₁ = ${a1}\n\n递推关系：\n  ${r.recurrence}\n\n幂级数解（前 ${r.coefficients.length} 项系数）：\n`;
          r.coefficients.forEach((coef, i) => {
            s += `  a_${i} = ${coef.toFixed(6)}\n`;
          });
          s += `\n解：\n  ${r.solution}`;
          if (r.isPolynomial && r.legendrePolynomial) {
            s += `\n\n勒让德多项式 P_${Math.floor(n)}(x)：\n  `;
            const polyStr = r.legendrePolynomial
              .map((coef, i) => {
                if (Math.abs(coef) < 1e-12) return '';
                const sign = coef > 0 ? '+' : '-';
                const abs = Math.abs(coef).toFixed(4).replace(/\.?0+$/, '');
                const term = i === 0 ? abs : i === 1 ? `${abs}·x` : `${abs}·x^${i}`;
                return ` ${sign} ${term}`;
              })
              .filter(Boolean)
              .join('');
            s += polyStr.startsWith(' + ') ? polyStr.slice(3) : polyStr;
            s += '\n\nn 为非负整数时，级数退化为 n 次多项式（勒让德多项式）';
          }
          res = s;
          break;
        }
      }
      setResultText(res);
    } catch (e) {
      const msg = (e as Error).message || '计算错误';
      setError(msg);
      toast.error(msg);
    }
  }, [activeTab, separableExpr, separableY0, separableX0, linearP, linearQ, linearY0, linearX0,
      bernoulliP, bernoulliQ, bernoulliN, bernoulliX0, bernoulliY0, ccA, ccB, nhA, nhB, nhF, eulerA, eulerB,
      systemMatrix, stabFx, stabGx, homogeneousExpr, exactP, exactQ, reducibleType, reducibleF,
      phaseExpr, phaseXMin, phaseXMax]);

  // 数值解法 + 绘图数据
  const solutionData = useMemo(() => {
    if (!['rk4', 'euler', 'second', 'linear', 'bernoulli'].includes(activeTab)) return [];
    setError(null);
    try {
      if (activeTab === 'linear') {
        const x0v = parseFloat(linearX0);
        const y0v = parseFloat(linearY0);
        const result = linearODEAnalytical(linearP, linearQ, x0v, y0v);
        if (result.sample) {
          return [{ x: result.sample.x, y: result.sample.y, name: 'y(x)', type: 'scatter' as const, line: { color: '#059669', width: 2 } }];
        }
        return [];
      }
      if (activeTab === 'bernoulli') {
        const nv = parseFloat(bernoulliN);
        const x0v = parseFloat(bernoulliX0);
        const y0v = parseFloat(bernoulliY0);
        if (isNaN(nv)) return [];
        const result = bernoulliODE(bernoulliP, bernoulliQ, nv, x0v, y0v);
        if (result.sample) {
          return [{ x: result.sample.x, y: result.sample.y, name: 'y(x)', type: 'scatter' as const, line: { color: '#059669', width: 2 } }];
        }
        return [];
      }
      if (activeTab === 'second') {
        const y0v = parseFloat(y02);
        const yp0v = parseFloat(yp0);
        const x0v = parseFloat(x02);
        const xEndv = parseFloat(xEnd2);
        const nv = parseInt(nSteps, 10);
        if ([y0v, yp0v, x0v, xEndv].some((v) => isNaN(v))) return [];
        if (isNaN(nv) || nv < 10) return [];

        const node = parse(expr2);
        const f = (x: number, y1: number, y2: number) =>
          node.evaluate({ x, y: y1, "y'": y2 }) as number;

        const h = (xEndv - x0v) / nv;
        const xs: number[] = [x0v];
        const ys: number[] = [y0v];
        const yps: number[] = [yp0v];
        let y1 = y0v, y2 = yp0v;

        for (let i = 0; i < nv; i++) {
          const x = x0v + i * h;
          const k1y1 = y2;
          const k1y2 = f(x, y1, y2);
          const k2y1 = y2 + h / 2 * k1y2;
          const k2y2 = f(x + h / 2, y1 + h / 2 * k1y1, y2 + h / 2 * k1y2);
          const k3y1 = y2 + h / 2 * k2y2;
          const k3y2 = f(x + h / 2, y1 + h / 2 * k2y1, y2 + h / 2 * k2y2);
          const k4y1 = y2 + h * k3y2;
          const k4y2 = f(x + h, y1 + h * k3y1, y2 + h * k3y2);
          y1 += h / 6 * (k1y1 + 2 * k2y1 + 2 * k3y1 + k4y1);
          y2 += h / 6 * (k1y2 + 2 * k2y2 + 2 * k3y2 + k4y2);
          xs.push(x + h);
          ys.push(y1);
          yps.push(y2);
        }
        return [
          { x: xs, y: ys, name: 'y(x)', type: 'scatter' as const, line: { color: '#059669', width: 2 } },
          { x: xs, y: yps, name: "y'(x)", type: 'scatter' as const, line: { color: '#0891b2', width: 1.5, dash: 'dash' as const } },
        ];
      } else {
        const y0v = parseFloat(y0);
        const x0v = parseFloat(x0);
        const xEndv = parseFloat(xEnd);
        const nv = parseInt(nSteps, 10);
        if (isNaN(y0v) || isNaN(x0v) || isNaN(xEndv) || isNaN(nv)) return [];
        if (nv < 10) return [];

        const result = activeTab === 'rk4'
          ? odeRK4(expr, x0v, xEndv, y0v, nv)
          : odeEuler(expr, x0v, xEndv, y0v, nv);
        return [{ x: result.x, y: result.y, name: 'y(x)', type: 'scatter' as const, line: { color: '#059669', width: 2 } }];
      }
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [activeTab, expr, expr2, y0, x0, xEnd, nSteps, y02, yp0, x02, xEnd2,
       linearP, linearQ, linearX0, linearY0, bernoulliP, bernoulliQ, bernoulliN, bernoulliX0, bernoulliY0]);

  const fieldData = useMemo(() => {
    if (!showField || activeTab !== 'rk4' && activeTab !== 'euler') return [];
    try {
      const x0v = parseFloat(x0);
      const xEndv = parseFloat(xEnd);
      if (isNaN(x0v) || isNaN(xEndv)) return [];

      const yMinVal = solutionData.length > 0
        ? Math.min(...solutionData[0].y.filter(isFinite)) - 1
        : -5;
      const yMaxVal = solutionData.length > 0
        ? Math.max(...solutionData[0].y.filter(isFinite)) + 1
        : 5;

      const nx = 20, ny = 15;
      const dx = (xEndv - x0v) / nx;
      const dy = (yMaxVal - yMinVal) / ny;
      const node = parse(expr);
      const data: Array<{ x: number[]; y: number[]; name: string; type: string; line: { color: string; width: number } }> = [];

      for (let i = 0; i <= nx; i++) {
        for (let j = 0; j <= ny; j++) {
          const xv = x0v + i * dx;
          const yv = yMinVal + j * dy;
          try {
            const slope = node.evaluate({ x: xv, y: yv }) as number;
            if (typeof slope !== 'number' || !isFinite(slope)) continue;
            const len = Math.min(Math.abs(dx), Math.abs(dy)) * 0.35;
            const angle = Math.atan(slope);
            const dx0 = Math.cos(angle) * len;
            const dy0 = Math.sin(angle) * len;
            data.push({
              x: [xv - dx0, xv + dx0],
              y: [yv - dy0, yv + dy0],
              name: '',
              type: 'scatter',
              line: { color: '#a8a29e', width: 1 },
            });
          } catch { /* skip */ }
        }
      }
      return data;
    } catch { return []; }
  }, [showField, expr, x0, xEnd, solutionData, activeTab]);

  // 相图数据
  const phaseData = useMemo(() => {
    if (activeTab !== 'phase-line') return [];
    try {
      const xMin = parseFloat(phaseXMin), xMax = parseFloat(phaseXMax);
      if (isNaN(xMin) || isNaN(xMax)) return [];
      const result = phaseLineAnalysis(phaseExpr, xMin, xMax);
      const xs = result.samplePoints.map((p) => p.x);
      const ys = result.samplePoints.map((p) => p.f);
      const eqXs = result.equilibria.map((e) => e.x);
      const eqYs = result.equilibria.map(() => 0);
      return [
        { x: xs, y: ys, name: 'f(x)', type: 'scatter' as const, line: { color: '#059669', width: 2 } },
        { x: eqXs, y: eqYs, name: '平衡点', type: 'scatter' as const, mode: 'markers' as const,
          marker: { color: eqXs.map((_, i) => result.equilibria[i].stability === '稳定' ? '#059669' : result.equilibria[i].stability === '不稳定' ? '#dc2626' : '#d97706'), size: 10, symbol: 'circle' as const },
          text: result.equilibria.map((e) => `${e.stability} (slope=${e.slope.toFixed(3)})`),
        },
        { x: [xMin, xMax], y: [0, 0], name: 'y=0', type: 'scatter' as const, line: { color: '#78716c', width: 1, dash: 'dot' as const }, showlegend: false },
      ];
    } catch { return []; }
  }, [phaseExpr, phaseXMin, phaseXMax, activeTab]);

  const phaseEquilibria = useMemo(() => {
    if (activeTab !== 'phase-line') return [];
    try {
      const xMin = parseFloat(phaseXMin), xMax = parseFloat(phaseXMax);
      if (isNaN(xMin) || isNaN(xMax)) return [];
      return phaseLineAnalysis(phaseExpr, xMin, xMax).equilibria;
    } catch { return []; }
  }, [phaseExpr, phaseXMin, phaseXMax, activeTab]);

  const allData = activeTab === 'phase-line'
    ? phaseData
    : (activeTab === 'rk4' || activeTab === 'euler') && showField
    ? [...fieldData, ...solutionData]
    : solutionData;

  const palette = usePlotlyPalette();

  const layout = useMemo(() => {
    if (activeTab === 'phase-line') {
      return {
        autosize: true, height: 450,
        margin: { l: 50, r: 20, t: 30, b: 50 },
        plot_bgcolor: palette.plot_bgcolor, paper_bgcolor: palette.paper_bgcolor,
        font: { color: palette.font_color },
        xaxis: { title: { text: 'x' }, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
        yaxis: { title: { text: 'f(x)' }, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
        showlegend: true, legend: { orientation: 'h' as const, y: -0.2, font: { color: palette.font_color } },
        shapes: phaseEquilibria.map((eq) => ({
          type: 'line', x0: eq.x, x1: eq.x, y0: 0, y1: 1,
          yref: 'paper',
          line: { color: eq.stability === '稳定' ? palette.line_colors[0] : eq.stability === '不稳定' ? palette.line_colors[2] : palette.line_colors[3], width: 2, dash: 'dash' as const },
        })),
      };
    }
    return {
      autosize: true,
      height: 450,
      margin: { l: 50, r: 20, t: 30, b: 50 },
      plot_bgcolor: palette.plot_bgcolor,
      paper_bgcolor: palette.paper_bgcolor,
      font: { color: palette.font_color },
      xaxis: { title: { text: 'x' }, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
      yaxis: { title: { text: 'y' }, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
      showlegend: true,
      legend: { orientation: 'h' as const, y: -0.2, font: { color: palette.font_color } },
    };
  }, [activeTab, palette, phaseEquilibria]);

  const loadExample = (ex: typeof EXAMPLES[0]) => {
    if (ex.method === 'second') {
      setExpr2(ex.expr);
      setY02(ex.y0);
      setYp0(ex.yp0 || '0');
      setX02(ex.x0);
      setXEnd2(ex.xEnd);
      setActiveTab('second');
    } else {
      setExpr(ex.expr);
      setY0(ex.y0);
      setX0(ex.x0);
      setXEnd(ex.xEnd);
      setActiveTab(ex.method);
    }
    setError(null);
  };

  const hasPlot = ['rk4', 'euler', 'second', 'linear-system', 'phase-line', 'linear', 'bernoulli'].includes(activeTab);

  return (
    <div className="min-h-screen page-fade-in">
      <PageHeader
        title="常微分方程"
        description="常微分方程求解：数值解法（欧拉法/RK4）、解析解法（可分离变量、一阶线性、伯努利、二阶常系数等）、线性方程组与稳定性分析。"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-6xl mx-auto space-y-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <LearningSection moduleKey="ode" />
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap h-auto">
                <div className="text-xs font-medium text-muted-foreground w-full mb-1 px-2">数值解法</div>
                <TabsTrigger value="rk4">RK4 四阶</TabsTrigger>
                <TabsTrigger value="euler">欧拉法</TabsTrigger>
                <TabsTrigger value="second">二阶 ODE</TabsTrigger>

                <div className="text-xs font-medium text-muted-foreground w-full mb-1 px-2 mt-2">一阶解析解</div>
                <TabsTrigger value="separable">可分离变量</TabsTrigger>
                <TabsTrigger value="homogeneous">齐次方程</TabsTrigger>
                <TabsTrigger value="linear">一阶线性</TabsTrigger>
                <TabsTrigger value="bernoulli">伯努利</TabsTrigger>
                <TabsTrigger value="exact">恰当方程</TabsTrigger>

                <div className="text-xs font-medium text-muted-foreground w-full mb-1 px-2 mt-2">高阶解析解</div>
                <TabsTrigger value="reducible">可降阶高阶</TabsTrigger>
                <TabsTrigger value="cc-homogeneous">二阶常系数齐次</TabsTrigger>
                <TabsTrigger value="cc-nonhomogeneous">二阶常系数非齐次</TabsTrigger>
                <TabsTrigger value="euler-eq">欧拉方程</TabsTrigger>

                <div className="text-xs font-medium text-muted-foreground w-full mb-1 px-2 mt-2">方程组与定性</div>
                <TabsTrigger value="linear-system">线性方程组</TabsTrigger>
                <TabsTrigger value="stability">稳定性分析</TabsTrigger>
                <TabsTrigger value="phase-line">相图分析</TabsTrigger>
                <TabsTrigger value="laplace">拉普拉斯法</TabsTrigger>
                <TabsTrigger value="legendre-ps">勒让德级数</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                {/* ========== RK4 / 欧拉法 ========== */}
                {(activeTab === 'rk4' || activeTab === 'euler') && (
                  <>
                    <MathInputField
                      value={expr}
                      onChange={setExpr}
                      label="y' = f(x, y) — 方程右侧表达式"
                      showPalette
                      defaultPreview
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">y(x₀)</label>
                        <Input value={y0} onChange={(e) => setY0(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">x₀</label>
                        <Input value={x0} onChange={(e) => setX0(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">x 终点</label>
                        <Input value={xEnd} onChange={(e) => setXEnd(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">步数</label>
                        <Input value={nSteps} onChange={(e) => setNSteps(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowField(!showField)}
                      variant={showField ? 'default' : 'outline'}
                      className={showField ? 'bg-emerald-700 hover:bg-emerald-800' : ''}
                    >
                      {showField ? '✓ ' : ''}显示方向场
                    </Button>
                  </>
                )}

                {/* ========== 二阶 ODE ========== */}
                {activeTab === 'second' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        y'' = f(x, y, y') — 用 y 和 y' 表示 y''
                      </label>
                      <Input value={expr2} onChange={(e) => setExpr2(e.target.value)} className="font-mono" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">y(x₀)</label>
                        <Input value={y02} onChange={(e) => setY02(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">y'(x₀)</label>
                        <Input value={yp0} onChange={(e) => setYp0(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">x₀</label>
                        <Input value={x02} onChange={(e) => setX02(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">x 终点</label>
                        <Input value={xEnd2} onChange={(e) => setXEnd2(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                  </>
                )}

                {/* ========== 可分离变量 ========== */}
                {activeTab === 'separable' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        dy/dx = f(x, y) — 方程右侧（自动识别可分离变量形式）
                      </label>
                      <Input value={separableExpr} onChange={(e) => setSeparableExpr(e.target.value)} className="font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">初值 x₀</label>
                        <Input value={separableX0} onChange={(e) => setSeparableX0(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">初值 y(x₀)</label>
                        <Input value={separableY0} onChange={(e) => setSeparableY0(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />求解析解
                    </Button>
                  </>
                )}

                {/* ========== 一阶线性 ========== */}
                {activeTab === 'linear' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">方程形式：y' + P(x)y = Q(x)</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">P(x)</label>
                        <Input value={linearP} onChange={(e) => setLinearP(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Q(x)</label>
                        <Input value={linearQ} onChange={(e) => setLinearQ(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">初值 x₀</label>
                        <Input value={linearX0} onChange={(e) => setLinearX0(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">初值 y(x₀)</label>
                        <Input value={linearY0} onChange={(e) => setLinearY0(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />求通解 + 特解
                    </Button>
                  </>
                )}

                {/* ========== 伯努利 ========== */}
                {activeTab === 'bernoulli' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">方程形式：y' + P(x)y = Q(x)yⁿ</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">P(x)</label>
                        <Input value={bernoulliP} onChange={(e) => setBernoulliP(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Q(x)</label>
                        <Input value={bernoulliQ} onChange={(e) => setBernoulliQ(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">n</label>
                        <Input value={bernoulliN} onChange={(e) => setBernoulliN(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">初值 x₀</label>
                        <Input value={bernoulliX0} onChange={(e) => setBernoulliX0(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">初值 y(x₀)</label>
                        <Input value={bernoulliY0} onChange={(e) => setBernoulliY0(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />求解（z = y^(1-n) 变换）
                    </Button>
                  </>
                )}

                {/* ========== 齐次方程 ========== */}
                {activeTab === 'homogeneous' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">方程形式：dy/dx = f(y/x)，令 u = y/x 代换</div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">f(x,y) — dy/dx = f(x,y)</label>
                      <Input value={homogeneousExpr} onChange={(e) => setHomogeneousExpr(e.target.value)} className="font-mono" />
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />判断并求解
                    </Button>
                  </>
                )}

                {/* ========== 恰当方程 ========== */}
                {activeTab === 'exact' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">方程形式：P(x,y)dx + Q(x,y)dy = 0，判断 ∂P/∂y = ∂Q/∂x</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">P(x,y)</label>
                        <Input value={exactP} onChange={(e) => setExactP(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Q(x,y)</label>
                        <Input value={exactQ} onChange={(e) => setExactQ(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />判断恰当性
                    </Button>
                  </>
                )}

                {/* ========== 可降阶高阶方程 ========== */}
                {activeTab === 'reducible' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">可降阶高阶微分方程的三种类型</div>
                    <div className="max-w-xs">
                      <label className="text-sm font-medium text-foreground mb-2 block">方程类型</label>
                      <Select value={reducibleType} onValueChange={setReducibleType}>
                        <SelectTrigger className="font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="type1">y'' = f(x) 型（直接积分）</SelectItem>
                          <SelectItem value="type2">y'' = f(x, y') 型（不显含 y）</SelectItem>
                          <SelectItem value="type3">y'' = f(y, y') 型（不显含 x）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">f 表达式</label>
                      <Input value={reducibleF} onChange={(e) => setReducibleF(e.target.value)} className="font-mono" />
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />降阶求解说明
                    </Button>
                  </>
                )}

                {/* ========== 二阶常系数齐次 ========== */}
                {activeTab === 'cc-homogeneous' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">方程形式：y'' + a·y' + b·y = 0</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">系数 a</label>
                        <Input value={ccA} onChange={(e) => setCcA(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">系数 b</label>
                        <Input value={ccB} onChange={(e) => setCcB(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />特征方程法求通解
                    </Button>
                  </>
                )}

                {/* ========== 二阶常系数非齐次 ========== */}
                {activeTab === 'cc-nonhomogeneous' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">方程形式：y'' + a·y' + b·y = f(x)</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">系数 a</label>
                        <Input value={nhA} onChange={(e) => setNhA(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">系数 b</label>
                        <Input value={nhB} onChange={(e) => setNhB(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">f(x)（非齐次项）</label>
                      <Input value={nhF} onChange={(e) => setNhF(e.target.value)} className="font-mono" />
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />待定系数法求特解
                    </Button>
                  </>
                )}

                {/* ========== 欧拉方程 ========== */}
                {activeTab === 'euler-eq' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">方程形式：x²y'' + a·x·y' + b·y = 0</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">系数 a</label>
                        <Input value={eulerA} onChange={(e) => setEulerA(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">系数 b</label>
                        <Input value={eulerB} onChange={(e) => setEulerB(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />令 x = e^t 求解
                    </Button>
                  </>
                )}

                {/* ========== 线性方程组 ========== */}
                {activeTab === 'linear-system' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">方程组：y' = A·y，输入系数矩阵 A（行用分号，列用逗号）</div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">矩阵 A</label>
                      <Input value={systemMatrix} onChange={(e) => setSystemMatrix(e.target.value)} className="font-mono" placeholder="如 [2,1;1,2]" />
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />矩阵指数法求解
                    </Button>
                  </>
                )}

                {/* ========== 稳定性分析 ========== */}
                {activeTab === 'stability' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">自治系统：dx/dt = f(x,y), dy/dt = g(x,y)，分析平衡点稳定性</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">dx/dt = f(x,y)</label>
                        <Input value={stabFx} onChange={(e) => setStabFx(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">dy/dt = g(x,y)</label>
                        <Input value={stabGx} onChange={(e) => setStabGx(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />找平衡点并分析
                    </Button>
                  </>
                )}

                {/* ========== 相图分析 ========== */}
                {activeTab === 'phase-line' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">一维自治方程 dx/dt = f(x)，分析平衡点与稳定性，绘制相线图</div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">f(x)</label>
                      <Input value={phaseExpr} onChange={(e) => setPhaseExpr(e.target.value)} className="font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-w-xs">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">x 最小值</label>
                        <Input value={phaseXMin} onChange={(e) => setPhaseXMin(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">x 最大值</label>
                        <Input value={phaseXMax} onChange={(e) => setPhaseXMax(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />找平衡点并绘图
                    </Button>
                  </>
                )}

                {/* ========== 拉普拉斯变换解 ODE ========== */}
                {activeTab === 'laplace' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">方程形式：a·y'' + b·y' + c·y = f(t)</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">系数 a</label>
                        <Input value={lapA} onChange={(e) => setLapA(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">系数 b</label>
                        <Input value={lapB} onChange={(e) => setLapB(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">系数 c</label>
                        <Input value={lapC} onChange={(e) => setLapC(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">f(t) 类型</label>
                        <select value={lapFType} onChange={(e) => setLapFType(e.target.value as any)} className="w-full h-9 px-3 rounded-md border border-border bg-card text-sm">
                          <option value="zero">0（齐次）</option>
                          <option value="constant">常数 F</option>
                          <option value="delta">脉冲 F·δ(t)</option>
                          <option value="heaviside">阶跃 F·u(t-a)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">F 值</label>
                        <Input value={lapFVal} onChange={(e) => setLapFVal(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    {lapFType === 'heaviside' && (
                      <div className="max-w-xs">
                        <label className="text-sm font-medium text-foreground mb-2 block">延迟 a</label>
                        <Input value={lapShift} onChange={(e) => setLapShift(e.target.value)} className="font-mono" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">y(0)</label>
                        <Input value={lapY0} onChange={(e) => setLapY0(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">y'(0)</label>
                        <Input value={lapYp0} onChange={(e) => setLapYp0(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />拉普拉斯变换求解
                    </Button>
                  </>
                )}

                {/* ========== 勒让德方程幂级数解法 ========== */}
                {activeTab === 'legendre-ps' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">勒让德方程：(1-x²)y'' - 2x·y' + n(n+1)y = 0</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">阶数 n</label>
                        <Input value={legN} onChange={(e) => setLegN(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">项数</label>
                        <Input value={legTerms} onChange={(e) => setLegTerms(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">a₀（偶次项初值）</label>
                        <Input value={legA0} onChange={(e) => setLegA0(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">a₁（奇次项初值）</label>
                        <Input value={legA1} onChange={(e) => setLegA1(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      当 n 为非负整数时，解退化为 n 次多项式（勒让德多项式 P<sub>n</sub>(x)）。
                    </div>
                    <Button onClick={computeAnalytic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />幂级数展开
                    </Button>
                  </>
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
          onSelect={(item) => setResultText(item.result)}
          theme="rose"
          className="mb-4"
        />

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {!hasPlot && (
          <ComputationResult
            result={resultText}
            error={null}
            emptyTitle="等待求解"
            emptyDescription="输入方程后点击「求解」查看结果"
            showHistory={false}
            steps={activeTab === 'linear' ? steps : null}
            showSteps={showSteps}
            onToggleSteps={() => setShowSteps((s) => !s)}
            showFavorite
            moduleKey="ode"
            moduleLabel="常微分方程"
            favoriteExpression={expr}
            favoriteResultLatex={resultText}
          />
        )}

        {hasPlot && (
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="w-full min-h-[450px] md:min-h-[500px]">
                <Plot
                  data={allData as any}
                  layout={layout as any}
                  config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                  style={{ width: '100%', height: '100%' }}
                  useResizeHandler
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600" />
              快速示例
            </h3>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => loadExample(ex)}>
                  {ex.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CheatsheetDialog moduleKey="ode" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
