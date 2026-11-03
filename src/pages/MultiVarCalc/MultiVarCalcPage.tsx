import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import MathInputField from '@/components/MathInputField';
import Plot from '@/lib/plotly-instance';
import { usePlotlyPalette } from '@/lib/plotly-theme';
import PageHeader from '@/components/PageHeader';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import ComputationResult from '@/components/ComputationResult';
import { Play, Sparkles } from 'lucide-react';
import { evaluate, parse } from 'mathjs';
import { toast } from 'sonner';
import { useHistory } from '@/hooks/useHistory';
import HistoryPanel from '@/components/HistoryPanel';
import {
  totalDifferential, directionalDerivative, multiVarTaylor2nd,
  findCriticalPoints, lagrangeMultiplier2D, tripleIntegral,
  doubleIntegralPolar, lineIntegralFirstType, lineIntegralSecondType,
  greensFormula, gradientFieldData, divergenceAndCurl,
  gaussFormulaVerify, stokesFormulaVerify, formatResult, symDerivative, symSimplify,
} from '@/lib/math-utils';

const EXAMPLES = [
  { label: '∂f/∂x', expr: 'x^2 + y^2 + x*y', op: 'partial-x', desc: '对 x 偏导' },
  { label: '∂f/∂y', expr: 'x^2 + y^2 + x*y', op: 'partial-y', desc: '对 y 偏导' },
  { label: '梯度 ∇f', expr: 'x^2 + y^2', op: 'gradient', desc: '梯度向量' },
  { label: '二重积分', expr: 'x + y', op: 'double-integral', desc: '∫∫(x+y)dxdy' },
  { label: '全微分', expr: 'x^2 * y', op: 'total-diff', desc: '在(1,2)处' },
  { label: '方向导数', expr: 'x^2 + y^2', op: 'dir-deriv', desc: '在(1,1)沿(1,1)' },
  { label: '多元泰勒', expr: 'exp(x+y)', op: 'taylor', desc: '在(0,0)二阶展开' },
  { label: '极值判定', expr: 'x^2 + y^2 - 2*x - 4*y + 5', op: 'extrema', desc: '求驻点并判定' },
  { label: '拉格朗日', expr: 'x + y', op: 'lagrange', desc: '约束 x²+y²=1' },
];

export default function MultiVarCalcPage() {
  const [activeTab, setActiveTab] = useState('partial-x');
  const [expr, setExpr] = useState('x^2 + y^2 + x*y');
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_multi_history' });
  const lastResultRef = useRef('');

  // 监听结果变化，自动记录历史
  useEffect(() => {
    if (result && result !== lastResultRef.current && !error) {
      addItem(activeTab, result);
      lastResultRef.current = result;
    }
  }, [result, error, activeTab, addItem]);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const palette = usePlotlyPalette();

  // 输入点
  const [ptA, setPtA] = useState('1');
  const [ptB, setPtB] = useState('2');
  // 方向向量
  const [dirU, setDirU] = useState('1');
  const [dirV, setDirV] = useState('1');

  // 积分范围
  const [xMin, setXMin] = useState('0');
  const [xMax, setXMax] = useState('1');
  const [yMin, setYMin] = useState('0');
  const [yMax, setYMax] = useState('1');
  const [zMin, setZMin] = useState('0');
  const [zMax, setZMax] = useState('1');

  // 极坐标积分
  const [rMin, setRMin] = useState('0');
  const [rMax, setRMax] = useState('1');
  const [thMin, setThMin] = useState('0');
  const [thMax, setThMax] = useState('2*pi');

  // 拉格朗日
  const [constraintG, setConstraintG] = useState('x^2 + y^2 - 1');
  const [lgX0, setLgX0] = useState('0.7');
  const [lgY0, setLgY0] = useState('0.7');
  const [lgL0, setLgL0] = useState('0.5');

  // 曲线积分
  const [curveX, setCurveX] = useState('cos(t)');
  const [curveY, setCurveY] = useState('sin(t)');
  const [ctMin, setCtMin] = useState('0');
  const [ctMax, setCtMax] = useState('2*pi');
  const [firstTypeF, setFirstTypeF] = useState('x^2 + y^2');
  const [secondP, setSecondP] = useState('-y');
  const [secondQ, setSecondQ] = useState('x');

  // 格林公式
  const [greenP, setGreenP] = useState('-y');
  const [greenQ, setGreenQ] = useState('x');

  // 散度旋度
  const [divP, setDivP] = useState('x');
  const [divQ, setDivQ] = useState('y');
  const [divR, setDivR] = useState('z');
  const [divX, setDivX] = useState('1');
  const [divY, setDivY] = useState('1');
  const [divZ, setDivZ] = useState('1');

  // 梯度场可视化范围
  const [gfXMin, setGfXMin] = useState('-3');
  const [gfXMax, setGfXMax] = useState('3');
  const [gfYMin, setGfYMin] = useState('-3');
  const [gfYMax, setGfYMax] = useState('3');

  // 高斯/斯托克斯
  const [gaussP, setGaussP] = useState('x');
  const [gaussQ, setGaussQ] = useState('y');
  const [gaussR, setGaussR] = useState('z');

  const compute = () => {
    setError(null);
    try {
      let res = '';
      switch (activeTab) {
        case 'partial-x': {
          let df = symDerivative(expr, 'x');
          try { df = symSimplify(df); } catch { /* ignore */ }
          res = `∂f/∂x = ${df}`;
          break;
        }
        case 'partial-y': {
          let df = symDerivative(expr, 'y');
          try { df = symSimplify(df); } catch { /* ignore */ }
          res = `∂f/∂y = ${df}`;
          break;
        }
        case 'gradient': {
          let dx = symDerivative(expr, 'x');
          let dy = symDerivative(expr, 'y');
          try { dx = symSimplify(dx); } catch { /* ignore */ }
          try { dy = symSimplify(dy); } catch { /* ignore */ }
          res = `∇f = ( ∂f/∂x , ∂f/∂y )\n   = ( ${dx} , ${dy} )`;
          break;
        }
        case 'total-diff': {
          const a = evaluate(ptA) as number;
          const b = evaluate(ptB) as number;
          const td = totalDifferential(expr, a, b);
          res = `在点 (${formatResult(a)}, ${formatResult(b)}) 处：\n${td.formula}`;
          break;
        }
        case 'dir-deriv': {
          const a = evaluate(ptA) as number;
          const b = evaluate(ptB) as number;
          const u = evaluate(dirU) as number;
          const v = evaluate(dirV) as number;
          const dd = directionalDerivative(expr, a, b, u, v);
          res = `点 (${formatResult(a)}, ${formatResult(b)})\n`
            + `梯度 ∇f = (${formatResult(dd.gradient[0])}, ${formatResult(dd.gradient[1])})\n`
            + `单位方向 u = (${formatResult(dd.direction[0])}, ${formatResult(dd.direction[1])})\n`
            + `方向导数 D_u f = ${formatResult(dd.value)}`;
          break;
        }
        case 'taylor': {
          const a = evaluate(ptA) as number;
          const b = evaluate(ptB) as number;
          const t = multiVarTaylor2nd(expr, a, b);
          res = t.formula;
          break;
        }
        case 'extrema': {
          const xmin = evaluate(xMin) as number;
          const xmax = evaluate(xMax) as number;
          const ymin = evaluate(yMin) as number;
          const ymax = evaluate(yMax) as number;
          const cps = findCriticalPoints(expr, xmin, xmax, ymin, ymax, 80);
          if (cps.points.length === 0) {
            res = '在给定区域内未找到驻点（尝试扩大搜索范围）';
          } else {
            res = `找到 ${cps.points.length} 个驻点：\n` + cps.points.map((p, i) =>
              `  ${i + 1}. (${formatResult(p.x)}, ${formatResult(p.y)})  f = ${formatResult(p.value)}  →  ${p.type}`
            ).join('\n');
            res += '\n\n判定依据：Hesse 行列式 det(H) = f_xx·f_yy - f_xy²\n'
              + '  det(H) > 0 且 f_xx > 0 → 极小值\n'
              + '  det(H) > 0 且 f_xx < 0 → 极大值\n'
              + '  det(H) < 0 → 鞍点';
          }
          break;
        }
        case 'lagrange': {
          const x0 = evaluate(lgX0) as number;
          const y0 = evaluate(lgY0) as number;
          const l0 = evaluate(lgL0) as number;
          const r = lagrangeMultiplier2D(expr, constraintG, x0, y0, l0);
          if (!r.converged) {
            res = `迭代未收敛（尝试调整初始值）\n当前结果：x=${formatResult(r.x)}, y=${formatResult(r.y)}, λ=${formatResult(r.lambda)}, f=${formatResult(r.fValue)}`;
          } else {
            res = `拉格朗日乘子法求解结果（目标函数 f=${expr}, 约束 ${constraintG}=0）：\n`
              + `  极值点：( ${formatResult(r.x)} , ${formatResult(r.y)} )\n`
              + `  乘子 λ = ${formatResult(r.lambda)}\n`
              + `  f 的极值 = ${formatResult(r.fValue)}`;
          }
          break;
        }
        case 'double-integral': {
          const x0 = evaluate(xMin) as number;
          const x1 = evaluate(xMax) as number;
          const y0 = evaluate(yMin) as number;
          const y1 = evaluate(yMax) as number;
          // 数值二重积分（梯形法）
          const nx = 100, ny = 100;
          const dxVal = (x1 - x0) / nx;
          const dyVal = (y1 - y0) / ny;
          let sum = 0;
          const node = parse(expr);
          for (let i = 0; i <= nx; i++) {
            const x = x0 + i * dxVal;
            const wx = (i === 0 || i === nx) ? 0.5 : 1;
            for (let j = 0; j <= ny; j++) {
              const y = y0 + j * dyVal;
              const wy = (j === 0 || j === ny) ? 0.5 : 1;
              const val = node.evaluate({ x, y }) as number;
              if (typeof val === 'number' && isFinite(val)) {
                sum += wx * wy * val;
              }
            }
          }
          const integral = sum * dxVal * dyVal;
          res = `∫(y=${yMin} to ${yMax}) ∫(x=${xMin} to ${xMax}) (${expr}) dx dy\n  ≈ ${formatResult(integral)}`;
          break;
        }
        case 'triple-integral': {
          const x0 = evaluate(xMin) as number;
          const x1 = evaluate(xMax) as number;
          const y0 = evaluate(yMin) as number;
          const y1 = evaluate(yMax) as number;
          const z0 = evaluate(zMin) as number;
          const z1 = evaluate(zMax) as number;
          const val = tripleIntegral(expr, x0, x1, y0, y1, z0, z1, 30);
          res = `∭_V (${expr}) dxdydz\n  V: x∈[${xMin},${xMax}], y∈[${yMin},${yMax}], z∈[${zMin},${zMax}]\n  ≈ ${formatResult(val)}`;
          break;
        }
        case 'polar-integral': {
          const r0 = evaluate(rMin) as number;
          const r1 = evaluate(rMax) as number;
          const t0 = evaluate(thMin) as number;
          const t1 = evaluate(thMax) as number;
          const val = doubleIntegralPolar(expr, r0, r1, t0, t1, 100);
          res = `极坐标下二重积分 ∫∫_D (${expr}) dxdy\n  D: r∈[${rMin},${rMax}], θ∈[${thMin},${thMax}]\n  ∫∫ f(r cosθ, r sinθ) · r dr dθ ≈ ${formatResult(val)}`;
          break;
        }
        case 'line-integral-1st': {
          const t0 = evaluate(ctMin) as number;
          const t1 = evaluate(ctMax) as number;
          const val = lineIntegralFirstType(firstTypeF, curveX, curveY, t0, t1, 500);
          res = `第一型曲线积分 ∫_C f(x,y) ds\n  f = ${firstTypeF}\n  C: (x=${curveX}, y=${curveY}), t∈[${ctMin},${ctMax}]\n  ≈ ${formatResult(val)}`;
          break;
        }
        case 'line-integral-2nd': {
          const t0 = evaluate(ctMin) as number;
          const t1 = evaluate(ctMax) as number;
          const val = lineIntegralSecondType(secondP, secondQ, curveX, curveY, t0, t1, 500);
          res = `第二型曲线积分 ∫_C P dx + Q dy\n  P = ${secondP}\n  Q = ${secondQ}\n  C: (x=${curveX}, y=${curveY}), t∈[${ctMin},${ctMax}]\n  ≈ ${formatResult(val)}`;
          break;
        }
        case 'greens': {
          const g = greensFormula(greenP, greenQ);
          res = `格林公式验证（单位圆区域 D，边界 C 逆时针）\n`
            + `  P = ${greenP}, Q = ${greenQ}\n`
            + `  线积分 ∮_C Pdx + Qdy = ${formatResult(g.lineIntegral)}\n`
            + `  面积分 ∬_D (∂Q/∂x - ∂P/∂y) dA = ${formatResult(g.doubleIntegral)}\n`
            + `  误差 = ${formatResult(g.difference)}\n`
            + `  ${g.difference < 0.01 ? '✓ 格林公式成立' : '⚠ 误差较大，可能数值精度不足'}`;
          break;
        }
        case 'divergence-curl': {
          const x = evaluate(divX) as number;
          const y = evaluate(divY) as number;
          const z = evaluate(divZ) as number;
          const dc = divergenceAndCurl(divP, divQ, divR, x, y, z);
          res = `向量场 F = ( ${divP} , ${divQ} , ${divR} )\n`
            + `在点 (${formatResult(x)}, ${formatResult(y)}, ${formatResult(z)}) 处：\n\n`
            + `  散度 div F = ∇·F = ${formatResult(dc.divergence)}\n\n`
            + `  旋度 curl F = ∇×F = \n`
            + `    ( ${formatResult(dc.curl[0])}, ${formatResult(dc.curl[1])}, ${formatResult(dc.curl[2])} )`;
          break;
        }
        case 'gauss': {
          const g = gaussFormulaVerify(gaussP, gaussQ, gaussR);
          res = `高斯公式验证（单位球 V，边界曲面 ∂V 外侧）\n`
            + `  F = ( ${gaussP} , ${gaussQ} , ${gaussR} )\n`
            + `  通量 ∯_{∂V} F·dS = ${formatResult(g.flux)}\n`
            + `  三重积分 ∭_V div F dV = ${formatResult(g.tripleDiv)}\n`
            + `  误差 = ${formatResult(g.difference)}\n`
            + `  ${g.difference < 0.5 ? '✓ 高斯公式成立（数值近似）' : '⚠ 误差较大，可能数值精度不足'}`;
          break;
        }
        case 'stokes': {
          const s = stokesFormulaVerify(gaussP, gaussQ, gaussR);
          res = `斯托克斯公式验证（z=0平面单位圆区域，逆时针边界）\n`
            + `  F = ( ${gaussP} , ${gaussQ} , ${gaussR} )\n`
            + `  线积分 ∮_C F·dr = ${formatResult(s.lineIntegral)}\n`
            + `  面积分 ∬_S (curl F)·n dS = ${formatResult(s.surfaceIntegral)}\n`
            + `  误差 = ${formatResult(s.difference)}\n`
            + `  ${s.difference < 0.01 ? '✓ 斯托克斯公式成立' : '⚠ 误差较大，可能数值精度不足'}`;
          break;
        }
      }
      setResult(res);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const gradientPlotData = useMemo(() => {
    if (activeTab !== 'gradient-plot') return [];
    setError(null);
    try {
      const xmin = evaluate(gfXMin) as number;
      const xmax = evaluate(gfXMax) as number;
      const ymin = evaluate(gfYMin) as number;
      const ymax = evaluate(gfYMax) as number;
      const data = gradientFieldData(expr, xmin, xmax, ymin, ymax, 15, 0.4);
      return [
        { z: data.contourZ, x: data.contourX, y: data.contourY, type: 'contour', colorscale: 'Viridis', name: 'f(x,y)', showscale: true, contours: { coloring: 'heatmap' as const } },
        {
          type: 'cone' as const,
          x: data.x, y: data.y,
          u: data.u, v: data.v,
          z: Array(data.x.length).fill(0),
          w: Array(data.x.length).fill(0),
          colorscale: [[0, '#dc2626'], [1, '#dc2626']],
          sizemode: 'absolute',
          sizeref: 0.3,
          name: '梯度 ∇f',
          showscale: false,
        },
      ];
    } catch (e) {
      setError(`梯度场错误: ${(e as Error).message}`);
      return [];
    }
  }, [expr, gfXMin, gfXMax, gfYMin, gfYMax, activeTab]);

  const loadExample = (ex: { expr: string; op: string }) => {
    setExpr(ex.expr);
    setActiveTab(ex.op);
    setError(null);
    setResult('');
  };

  const needsExprInput = !['line-integral-1st', 'line-integral-2nd', 'greens', 'divergence-curl', 'gauss', 'stokes', 'gradient-plot'].includes(activeTab);

  return (
    <div className="min-h-screen page-fade-in">
      <PageHeader
        title="多元微积分"
        description="偏导数、梯度、全微分、方向导数、多元泰勒、极值与拉格朗日、二重/三重积分、曲线积分、格林/高斯/斯托克斯公式、梯度场可视化。"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-5xl mx-auto space-y-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap h-auto">
                <TabsTrigger value="partial-x">∂/∂x</TabsTrigger>
                <TabsTrigger value="partial-y">∂/∂y</TabsTrigger>
                <TabsTrigger value="gradient">梯度</TabsTrigger>
                <TabsTrigger value="total-diff">全微分</TabsTrigger>
                <TabsTrigger value="dir-deriv">方向导数</TabsTrigger>
                <TabsTrigger value="taylor">多元泰勒</TabsTrigger>
                <TabsTrigger value="extrema">多元极值</TabsTrigger>
                <TabsTrigger value="lagrange">拉格朗日</TabsTrigger>
                <TabsTrigger value="double-integral">二重积分</TabsTrigger>
                <TabsTrigger value="polar-integral">极坐标二重</TabsTrigger>
                <TabsTrigger value="triple-integral">三重积分</TabsTrigger>
                <TabsTrigger value="line-integral-1st">第一型曲线</TabsTrigger>
                <TabsTrigger value="line-integral-2nd">第二型曲线</TabsTrigger>
                <TabsTrigger value="greens">格林公式</TabsTrigger>
                <TabsTrigger value="gradient-plot">梯度场可视化</TabsTrigger>
                <TabsTrigger value="divergence-curl">散度旋度</TabsTrigger>
                <TabsTrigger value="gauss">高斯公式</TabsTrigger>
                <TabsTrigger value="stokes">斯托克斯</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                {needsExprInput && (
                  <MathInputField
                    value={expr}
                    onChange={setExpr}
                    label="表达式 f(x, y)"
                    multiline
                    rows={3}
                    showPalette
                    defaultPreview
                  />
                )}

                {['total-diff', 'dir-deriv', 'taylor'].includes(activeTab) && (
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">点 x₀ / a</label>
                      <Input value={ptA} onChange={(e) => setPtA(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">点 y₀ / b</label>
                      <Input value={ptB} onChange={(e) => setPtB(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                )}

                {activeTab === 'dir-deriv' && (
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">方向向量 u</label>
                      <Input value={dirU} onChange={(e) => setDirU(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">方向向量 v</label>
                      <Input value={dirV} onChange={(e) => setDirV(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                )}

                {activeTab === 'extrema' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">x 最小</label><Input value={xMin} onChange={(e) => setXMin(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">x 最大</label><Input value={xMax} onChange={(e) => setXMax(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">y 最小</label><Input value={yMin} onChange={(e) => setYMin(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">y 最大</label><Input value={yMax} onChange={(e) => setYMax(e.target.value)} className="font-mono" /></div>
                  </div>
                )}

                {activeTab === 'lagrange' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">约束条件 g(x,y) = 0 （输入左侧）</label>
                      <Input value={constraintG} onChange={(e) => setConstraintG(e.target.value)} className="font-mono" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-w-md">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">初始 x₀</label><Input value={lgX0} onChange={(e) => setLgX0(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">初始 y₀</label><Input value={lgY0} onClick={() => {}} onChange={(e) => setLgY0(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">初始 λ₀</label><Input value={lgL0} onChange={(e) => setLgL0(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {['double-integral', 'triple-integral'].includes(activeTab) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">x 最小</label><Input value={xMin} onChange={(e) => setXMin(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">x 最大</label><Input value={xMax} onChange={(e) => setXMax(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">y 最小</label><Input value={yMin} onChange={(e) => setYMin(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">y 最大</label><Input value={yMax} onChange={(e) => setYMax(e.target.value)} className="font-mono" /></div>
                    {activeTab === 'triple-integral' && (
                      <>
                        <div><label className="text-sm font-medium text-foreground mb-2 block">z 最小</label><Input value={zMin} onChange={(e) => setZMin(e.target.value)} className="font-mono" /></div>
                        <div><label className="text-sm font-medium text-foreground mb-2 block">z 最大</label><Input value={zMax} onChange={(e) => setZMax(e.target.value)} className="font-mono" /></div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'polar-integral' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">r 最小</label><Input value={rMin} onChange={(e) => setRMin(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">r 最大</label><Input value={rMax} onChange={(e) => setRMax(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">θ 最小</label><Input value={thMin} onChange={(e) => setThMin(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">θ 最大</label><Input value={thMax} onChange={(e) => setThMax(e.target.value)} className="font-mono" /></div>
                  </div>
                )}

                {['line-integral-1st', 'line-integral-2nd'].includes(activeTab) && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">x(t)</label><Input value={curveX} onChange={(e) => setCurveX(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">y(t)</label><Input value={curveY} onChange={(e) => setCurveY(e.target.value)} className="font-mono" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-w-xs">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">t 最小</label><Input value={ctMin} onChange={(e) => setCtMin(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">t 最大</label><Input value={ctMax} onChange={(e) => setCtMax(e.target.value)} className="font-mono" /></div>
                    </div>
                    {activeTab === 'line-integral-1st' && (
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">被积函数 f(x,y)</label>
                        <Input value={firstTypeF} onChange={(e) => setFirstTypeF(e.target.value)} className="font-mono" />
                      </div>
                    )}
                    {activeTab === 'line-integral-2nd' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-sm font-medium text-foreground mb-2 block">P(x,y)</label><Input value={secondP} onChange={(e) => setSecondP(e.target.value)} className="font-mono" /></div>
                        <div><label className="text-sm font-medium text-foreground mb-2 block">Q(x,y)</label><Input value={secondQ} onChange={(e) => setSecondQ(e.target.value)} className="font-mono" /></div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'greens' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">P(x,y)</label><Input value={greenP} onChange={(e) => setGreenP(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">Q(x,y)</label><Input value={greenQ} onChange={(e) => setGreenQ(e.target.value)} className="font-mono" /></div>
                  </div>
                )}

                {activeTab === 'gradient-plot' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">标量场 f(x, y)</label>
                      <Input value={expr} onChange={(e) => setExpr(e.target.value)} className="font-mono" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">x 最小</label><Input value={gfXMin} onChange={(e) => setGfXMin(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">x 最大</label><Input value={gfXMax} onChange={(e) => setGfXMax(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">y 最小</label><Input value={gfYMin} onChange={(e) => setGfYMin(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">y 最大</label><Input value={gfYMax} onChange={(e) => setGfYMax(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {activeTab === 'divergence-curl' && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">P(x,y,z)</label><Input value={divP} onChange={(e) => setDivP(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">Q(x,y,z)</label><Input value={divQ} onChange={(e) => setDivQ(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">R(x,y,z)</label><Input value={divR} onChange={(e) => setDivR(e.target.value)} className="font-mono" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-w-md">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">点 x</label><Input value={divX} onChange={(e) => setDivX(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">点 y</label><Input value={divY} onChange={(e) => setDivY(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">点 z</label><Input value={divZ} onChange={(e) => setDivZ(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {['gauss', 'stokes'].includes(activeTab) && (
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">P</label><Input value={gaussP} onChange={(e) => setGaussP(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">Q</label><Input value={gaussQ} onChange={(e) => setGaussQ(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">R</label><Input value={gaussR} onChange={(e) => setGaussR(e.target.value)} className="font-mono" /></div>
                  </div>
                )}

                {activeTab !== 'gradient-plot' && (
                  <Button onClick={compute} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算
                  </Button>
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
          onSelect={(item) => setResult(item.result)}
          theme="purple"
          className="mb-4"
        />

        {activeTab !== 'gradient-plot' && (
          <ComputationResult
            result={result}
            error={error}
            emptyTitle="等待计算"
            emptyDescription="输入表达式后点击「计算」查看结果"
            showHistory={false}
            align="left"
            showFavorite
            moduleKey="multivar-calc"
            moduleLabel="多元微积分"
            favoriteExpression={expr}
            favoriteResultLatex={result || ''}
          />
        )}

        {activeTab === 'gradient-plot' && (
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Plot
                data={gradientPlotData as any[]}
                  layout={{
                    autosize: true, height: 500,
                    margin: { l: 50, r: 20, t: 30, b: 50 },
                    plot_bgcolor: palette.plot_bgcolor,
                    paper_bgcolor: palette.paper_bgcolor,
                    font: { color: palette.font_color },
                    xaxis: { title: { text: 'x' }, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
                    yaxis: { title: { text: 'y' }, scaleanchor: 'x', scaleratio: 1, gridcolor: palette.gridcolor, tickfont: { color: palette.tickfont_color } },
                  }}
                config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                style={{ width: '100%' }}
                useResizeHandler
              />
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600" />
              快速示例
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {EXAMPLES.map((ex, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="justify-start h-auto py-2.5 px-3 text-left"
                  onClick={() => loadExample(ex)}
                >
                  <span className="text-xs text-muted-foreground mr-2 shrink-0">{ex.desc}</span>
                  <code className="text-xs font-mono text-foreground truncate">{ex.expr}</code>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CheatsheetDialog moduleKey="multivariable" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
