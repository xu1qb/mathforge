import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import PageShell from '@/components/PageShell';
import MathInputField from '@/components/MathInputField';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Sparkles, History, Trash2, Clock, Calculator, Type, Lightbulb, ChevronDown, ChevronUp, ListOrdered } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import LearningSection from '@/components/LearningSection';
import { useHistory } from '@/hooks/useHistory';
import { stepByStepDerivative, stepByStepIntegrate, stepByStepLimit, stepByStepSumExpand, type StepItem } from '@/lib/step-by-step';
import { copyAsText } from '@/lib/export-utils';
import {
  symDerivative,
  symSimplify,
  symIntegrate,
  numericLimit,
  taylorSeries,
  simpson,
  safeEvaluate,
  formatResult,
} from '@/lib/math-utils';
import {
  higherOrderDerivative,
  implicitDerivative,
  parametricDerivative,
  findExtrema,
  findInflectionPoints,
  findAsymptotes,
  lhopital,
  improperIntegral,
  areaBetweenCurves,
  volumeOfRevolution,
  arcLength,
  convergenceRadius,
  logDerivative,
  verifyAntiderivative,
  seriesConvergence,
  parametricArcLength,
  surfaceOfRevolution,
} from '@/lib/math-advanced';
import { evaluate } from 'mathjs';
import { toast } from 'sonner';
import { formatScientificExact } from '@/lib/symbolic-format';
import { normalizeMathInput } from '@/lib/math-normalize';

const EXAMPLES = [
  { label: '导数 d/dx(x³)', expr: 'x³', op: 'derivative', extra: { var: 'x' } },
  { label: '积分 ∫x²dx', expr: 'x²', op: 'integral', extra: { var: 'x' } },
  { label: '定积分 ∫₀¹x²dx', expr: 'x²', op: 'definite', extra: { var: 'x', a: '0', b: '1' } },
  { label: '极限 sin(x)/x', expr: 'sin(x)/x', op: 'limit', extra: { var: 'x', x0: '0' } },
  { label: '高阶导数 d⁴/dx⁴(sin x)', expr: 'sin(x)', op: 'higherOrder', extra: { var: 'x', order: '4' } },
  { label: '隐函数求导 x²+y²=1', expr: 'x² + y² - 1', op: 'implicit', extra: { var: 'y', yvar: 'x' } },
  { label: '参数方程求导 x=t², y=t³', expr: 't²', op: 'parametric', extra: { yExpr: 't³', var: 't' } },
  { label: '极值点 x³-3x', expr: 'x³ - 3*x', op: 'extrema', extra: { a: '-3', b: '3' } },
  { label: '洛必达 sin(x)/x', expr: 'sin(x)', op: 'lhopital', extra: { gExpr: 'x', x0: '0' } },
  { label: '反常积分 ∫₁^∞ 1/x²dx', expr: '1/x²', op: 'improper', extra: { a: '1', inf: 'inf' } },
];

export default function CalculusPage() {
  const [expr, setExpr] = useState('sin(x)/x');
  const [variable, setVariable] = useState('x');
  const [x0, setX0] = useState('0');
  const [order, setOrder] = useState('5');
  const [a, setA] = useState('0');
  const [b, setB] = useState('1');
  const [sumVar, setSumVar] = useState('n');
  const [sumStart, setSumStart] = useState('1');
  const [sumEnd, setSumEnd] = useState('100');
  const [sumExpr, setSumExpr] = useState('1/n^2');

  // 级数敛散性判别
  const [convExpr, setConvExpr] = useState('1/n^2');
  const [convVar, setConvVar] = useState('n');

  // 参数方程弧长
  const [paramArcX, setParamArcX] = useState('cos(t)');
  const [paramArcY, setParamArcY] = useState('sin(t)');
  const [paramArcT0, setParamArcT0] = useState('0');
  const [paramArcT1, setParamArcT1] = useState('2*pi');
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('limit');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted');
  const [steps, setSteps] = useState<StepItem[] | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_calculus_history', maxItems: 30 });

  // 新增状态
  const [gExpr, setGExpr] = useState('x'); // 洛必达分母
  const [yVar, setYVar] = useState('y');   // 隐函数 y
  const [paramY, setParamY] = useState('t^3'); // 参数方程 y(t)
  const [FExpr, setFExpr] = useState('x^3/3'); // 原函数验证

  const compute = (op: string) => {
    setError(null);
    try {
      let res = '';
      // 全局数学符号预处理
      const e = normalizeMathInput(expr);
      const gE = normalizeMathInput(gExpr);
      const pY = normalizeMathInput(paramY);
      const fE = normalizeMathInput(FExpr);
      const pAX = normalizeMathInput(paramArcX);
      const pAY = normalizeMathInput(paramArcY);
      const sE = normalizeMathInput(sumExpr);
      const cE = normalizeMathInput(convExpr);
      const aN = normalizeMathInput(a);
      const bN = normalizeMathInput(b);
      const x0N = normalizeMathInput(x0);
      const pAT0 = normalizeMathInput(paramArcT0);
      const pAT1 = normalizeMathInput(paramArcT1);
      const sS = normalizeMathInput(sumStart);
      const sE2 = normalizeMathInput(sumEnd);

      switch (op) {
        case 'derivative': {
          res = symDerivative(e, variable);
          try { res = symSimplify(res); } catch { /* ignore */ }
          try {
            const sr = stepByStepDerivative(e, variable);
            setSteps(sr.steps);
          } catch { setSteps(null); }
          break;
        }
        case 'higherOrder': {
          const n = parseInt(order);
          if (isNaN(n) || n < 1 || n > 10) throw new Error('阶数必须是 1~10 的整数');
          res = higherOrderDerivative(e, variable, n);
          break;
        }
        case 'implicit': {
          res = implicitDerivative(e, yVar, variable);
          break;
        }
        case 'parametric': {
          res = parametricDerivative(e, pY, variable);
          break;
        }
        case 'extrema': {
          const aVal = parseFloat(aN);
          const bVal = parseFloat(bN);
          if (isNaN(aVal) || isNaN(bVal)) throw new Error('区间端点必须是数字');
          const r = findExtrema(e, variable, aVal, bVal);
          if (r.maxima.length === 0 && r.minima.length === 0) {
            res = '区间内未找到极值点';
            break;
          }
          let s = '极大值点 x：' + (r.maxima.length ? r.maxima.map(v => formatResult(v)).join(', ') : '无') + '\n';
          s += '极小值点 x：' + (r.minima.length ? r.minima.map(v => formatResult(v)).join(', ') : '无') + '\n\n';
          s += '（数值搜索结果，基于 f\'(x) 符号变化）';
          res = s;
          break;
        }
        case 'concavity': {
          const aVal = parseFloat(aN);
          const bVal = parseFloat(bN);
          if (isNaN(aVal) || isNaN(bVal)) throw new Error('区间端点必须是数字');
          const pts = findInflectionPoints(e, variable, aVal, bVal);
          // 用抽样判断左右凹凸性
          const sampleLeft = (aVal + (pts[0] ?? bVal)) / 2;
          let s = '拐点 x 坐标：' + (pts.length ? pts.map(v => formatResult(v)).join(', ') : '无（区间内无拐点）') + '\n\n';
          s += `提示：在 x = ${formatResult(sampleLeft)} 处，f''(${formatResult(sampleLeft)}) 的符号决定左半区间凹凸性。\n`;
          s += '（拐点即二阶导数变号的点，拐点左侧与右侧凹凸性相反）';
          res = s;
          break;
        }
        case 'asymptotes': {
          const r = findAsymptotes(e, variable);
          let s = '渐近线分析：\n';
          s += '- 水平渐近线：' + (r.horizontal.length ? r.horizontal.map(v => `y = ${formatResult(v)}`).join(', ') : '无') + '\n';
          s += '- 垂直渐近线：' + (r.vertical.length ? r.vertical.map(v => `x = ${formatResult(v)}`).join(', ') : '无') + '\n';
          s += '- 斜渐近线：' + (r.oblique.length ? r.oblique.map(o => `y = ${formatResult(o.k)}x + ${formatResult(o.b)}`).join(', ') : '无（仅检测简单有理函数）');
          res = s;
          break;
        }
        case 'integral': {
          res = symIntegrate(e, variable);
          try {
            const sr = stepByStepIntegrate(e, variable);
            setSteps(sr.steps);
          } catch { setSteps(null); }
          break;
        }
        case 'definite': {
          const aVal = parseFloat(aN);
          const bVal = parseFloat(bN);
          if (isNaN(aVal) || isNaN(bVal)) throw new Error('积分上下限必须是数字');
          const val = simpson(e, aVal, bVal, 1000);
          res = formatScientificExact(val);
          break;
        }
        case 'improper': {
          const aVal = parseFloat(aN);
          if (isNaN(aVal)) throw new Error('积分下限必须是数字');
          const val = improperIntegral(e, variable, aVal, 'inf');
          res = `∫[${aVal}, +∞] f(${variable}) d${variable}\n= ${formatScientificExact(val)}\n（自适应变量代换法）`;
          break;
        }
        case 'area': {
          const aVal = parseFloat(aN);
          const bVal = parseFloat(bN);
          if (isNaN(aVal) || isNaN(bVal)) throw new Error('积分上下限必须是数字');
          const val = areaBetweenCurves(e, gE, variable, aVal, bVal);
          res = `两曲线围成的面积 = ${formatScientificExact(val)}\n（∫|f(x) - g(x)|dx, 数值积分）`;
          break;
        }
        case 'volume': {
          const aVal = parseFloat(aN);
          const bVal = parseFloat(bN);
          if (isNaN(aVal) || isNaN(bVal)) throw new Error('积分上下限必须是数字');
          const val = volumeOfRevolution(e, variable, aVal, bVal);
          res = `绕 x 轴旋转体体积 = ${formatScientificExact(val)}\n（V = π · ∫[a,b] f(x)² dx）`;
          break;
        }
        case 'arcLength': {
          const aVal = parseFloat(aN);
          const bVal = parseFloat(bN);
          if (isNaN(aVal) || isNaN(bVal)) throw new Error('积分上下限必须是数字');
          const val = arcLength(e, variable, aVal, bVal);
          res = `曲线弧长 = ${formatScientificExact(val)}\n（L = ∫[a,b] √(1 + f'(x)²) dx）`;
          break;
        }
        case 'paramArcLength': {
          const t0 = parseFloat(pAT0);
          const t1 = evaluate(pAT1) as number;
          if (isNaN(t0) || isNaN(t1)) throw new Error('参数上下限必须是数字');
          const val = parametricArcLength(pAX, pAY, t0, t1);
          res = `参数方程弧长 = ${formatScientificExact(val)}\n（L = ∫[t₀,t₁] √(x'(t)² + y'(t)²) dt）`;
          break;
        }
        case 'surfaceRev': {
          const aVal = parseFloat(aN);
          const bVal = parseFloat(bN);
          if (isNaN(aVal) || isNaN(bVal)) throw new Error('积分上下限必须是数字');
          const val = surfaceOfRevolution(e, aVal, bVal);
          res = `绕 x 轴旋转曲面面积 = ${formatScientificExact(val)}\n（S = 2π · ∫[a,b] f(x)·√(1 + f'(x)²) dx）`;
          break;
        }
        case 'seriesConv': {
          const r = seriesConvergence(cE, convVar);
          const statusLabel = r.overall === 'convergent' ? '收敛 ✓' : r.overall === 'divergent' ? '发散 ✗' : '不确定 ⚠';
          let s = `级数敛散性判别\n通项：a_n = ${r.generalTerm}\n结论：${statusLabel}\n\n${r.summary}\n\n判别过程：\n`;
          r.tests.forEach(t => {
            const mark = t.conclusion === 'convergent' ? '→ 收敛 ✓' : t.conclusion === 'divergent' ? '→ 发散 ✗' : t.applicable ? '→ 不确定' : '→ 不适用';
            s += `\n【${t.method}】${mark}\n  ${t.detail}\n`;
          });
          res = s;
          break;
        }
        case 'limit': {
          const x0Num = parseFloat(x0N);
          if (isNaN(x0Num)) throw new Error('趋近值必须是数字');
          const val = numericLimit(e, variable, x0Num);
          if (!Number.isFinite(val)) throw new Error('极限不存在或无法计算');
          res = formatScientificExact(val);
          try {
            const sr = stepByStepLimit(e, variable, x0Num);
            setSteps(sr.steps);
          } catch { setSteps(null); }
          break;
        }
        case 'lhopital': {
          const x0Num = parseFloat(x0N);
          if (isNaN(x0Num)) throw new Error('趋近值必须是数字');
          const r = lhopital(e, gE, variable, x0Num);
          res = `洛必达法则：\nlim [${e}] / [${gE}]  (${variable} → ${formatResult(x0Num)})\n= ${formatScientificExact(r.result)}\n求导次数：${r.steps} 次`;
          break;
        }
        case 'taylor': {
          const x0Num = parseFloat(x0N);
          const nVal = parseInt(order, 10);
          if (isNaN(x0Num)) throw new Error('展开点必须是数字');
          if (isNaN(nVal) || nVal < 1) throw new Error('阶数必须是正整数');
          if (nVal > 20) throw new Error('阶数过大（最多 20 阶）');
          res = taylorSeries(e, variable, x0Num, nVal);
          break;
        }
        case 'convergenceRadius': {
          const r = convergenceRadius(e, variable);
          if (r < 0) res = '无法计算收敛半径（请输入幂级数通项 a_n·x^n 的系数 a_n 表达式，变量使用 n）';
          else res = `收敛半径 R = ${formatScientificExact(r)}\n收敛区间：(-${formatScientificExact(r)}, ${formatScientificExact(r)})\n（端点敛散性需另行判断）`;
          break;
        }
        case 'sum': {
          const start = parseFloat(sS);
          const end = parseFloat(sE2);
          if (isNaN(start) || isNaN(end)) throw new Error('级数上下限必须是数字');
          if (!Number.isFinite(end) && Math.abs(end) > 1e6) {
            throw new Error('无穷级数请使用有限上限估算（建议 ≤ 10000）');
          }
          const nodeExpr = sE;
          const scope: Record<string, number> = {};
          let sum = 0;
          for (let n = start; n <= end; n++) {
            scope[sumVar] = n;
            try {
              const val = evaluate(nodeExpr, scope) as number;
              if (typeof val === 'number' && Number.isFinite(val)) {
                sum += val;
              }
            } catch { /* skip */ }
            if (n - start > 100000) {
              throw new Error('级数项数过多，请缩小范围');
            }
          }
          res = formatScientificExact(sum);
          try {
            const sr = stepByStepSumExpand(sumExpr, sumVar, start, end);
            setSteps(sr.steps);
            setShowSteps(false);
          } catch { setSteps(null); }
          break;
        }
        case 'logDiff': {
          res = logDerivative(e, variable);
          break;
        }
        case 'verifyAnti': {
          const r = verifyAntiderivative(fE, e, variable);
          res = `F(x) = ${fE}\nf(x) = ${e}\n\n验证 F'(x) = f(x) ？\nF'(x) = ${r.derivative}\n差值 F'(x) - f(x) = ${r.difference}\n\n结论：${r.isCorrect ? '✓ 相等，F(x) 是 f(x) 的一个原函数' : '✗ 不相等（或化简后仍有差异）'}`;
          break;
        }
        default:
          res = safeEvaluate(e);
      }
      setResult(res);
      // 非支持步骤的 tab 清空 steps
      if (activeTab !== 'derivative' && activeTab !== 'integral' && activeTab !== 'limit') {
        setSteps(null);
        setShowSteps(false);
      }
      // 保存到历史记录
      let exprLabel = '';
      if (activeTab === 'sum') {
        exprLabel = `sum(${sumExpr}, ${sumVar}=${sumStart}..${sumEnd})`;
      } else {
        exprLabel = `${activeTab}: ${expr}`;
        if (activeTab === 'limit' || activeTab === 'taylor' || activeTab === 'lhopital') {
          exprLabel += `, x→${x0}`;
        }
      }
      addItem(exprLabel, res);
    } catch (e) {
      const msg = (e as Error).message || '计算错误';
      setError(msg);
      setResult('');
      setSteps(null);
      setShowSteps(false);
      toast.error(msg, { duration: 3000 });
    }
  };

  const loadExample = (ex: { label?: string; expr: string; op: string; extra?: Record<string, string | undefined> }) => {
    setExpr(ex.expr);
    setActiveTab(ex.op);
    if (ex.extra) {
      if (ex.extra.var) setVariable(ex.extra.var);
      if (ex.extra.yvar) setYVar(ex.extra.yvar);
      if (ex.extra.x0 !== undefined) setX0(ex.extra.x0);
      if (ex.extra.order) setOrder(ex.extra.order);
      if (ex.extra.a !== undefined) setA(ex.extra.a);
      if (ex.extra.b !== undefined) setB(ex.extra.b);
      if (ex.extra.gExpr) setGExpr(ex.extra.gExpr);
      if (ex.extra.yExpr) setParamY(ex.extra.yExpr);
    }
    setError(null);
    setResult('');
  };

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="微积分"
        description="单变量与多元微积分：导数、高阶导数、隐函数求导、参数方程求导、极值、凹凸性、渐近线、不定积分、定积分、反常积分、面积/体积/弧长、极限、洛必达、泰勒展开、级数、收敛半径、对数求导、原函数验证。"
        eyebrow="学科 · 分析学"
        width="tool"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-4xl mx-auto space-y-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <LearningSection moduleKey="calculus" />
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="derivative">导数</TabsTrigger>
                <TabsTrigger value="higherOrder">高阶导数</TabsTrigger>
                <TabsTrigger value="implicit">隐函数</TabsTrigger>
                <TabsTrigger value="parametric">参数方程</TabsTrigger>
                <TabsTrigger value="extrema">极值点</TabsTrigger>
                <TabsTrigger value="concavity">凹凸性</TabsTrigger>
                <TabsTrigger value="asymptotes">渐近线</TabsTrigger>
              </TabsList>
              <TabsList className="w-full mt-2">
                <TabsTrigger value="integral">不定积分</TabsTrigger>
                <TabsTrigger value="definite">定积分</TabsTrigger>
                <TabsTrigger value="improper">反常积分</TabsTrigger>
                <TabsTrigger value="area">面积</TabsTrigger>
                <TabsTrigger value="volume">旋转体</TabsTrigger>
                <TabsTrigger value="arcLength">弧长</TabsTrigger>
                <TabsTrigger value="limit">极限</TabsTrigger>
              </TabsList>
              <TabsList className="w-full mt-2">
                <TabsTrigger value="lhopital">洛必达</TabsTrigger>
                <TabsTrigger value="taylor">泰勒</TabsTrigger>
                <TabsTrigger value="sum">级数</TabsTrigger>
                <TabsTrigger value="convergenceRadius">收敛半径</TabsTrigger>
                <TabsTrigger value="logDiff">对数求导</TabsTrigger>
                <TabsTrigger value="verifyAnti">原函数验证</TabsTrigger>
                <TabsTrigger value="seriesConv">敛散性判别</TabsTrigger>
                <TabsTrigger value="paramArcLength">参数弧长</TabsTrigger>
                <TabsTrigger value="surfaceRev">旋转曲面</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                {activeTab === 'sum' ? (
                  <>
                    <MathInputField
                      value={sumExpr}
                      onChange={setSumExpr}
                      label="通项表达式"
                      showPalette
                      defaultPreview
                    />
                    <div className="max-w-[120px]">
                      <label className="text-sm font-medium text-foreground mb-2 block">求和变量</label>
                      <Input value={sumVar} onChange={(e) => setSumVar(e.target.value)} className="font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">下限</label>
                        <Input value={sumStart} onChange={(e) => setSumStart(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">上限</label>
                        <Input value={sumEnd} onChange={(e) => setSumEnd(e.target.value)} className="font-mono" />
                      </div>
                    </div>
                  </>
                ) : activeTab === 'seriesConv' ? (
                  <>
                    <MathInputField
                      value={convExpr}
                      onChange={setConvExpr}
                      label="级数通项 a_n（变量用 n）"
                      showPalette
                      defaultPreview
                    />
                    <div className="max-w-xs">
                      <label className="text-sm font-medium text-foreground mb-2 block">求和变量</label>
                      <Input value={convVar} onChange={(e) => setConvVar(e.target.value)} className="font-mono bg-card" />
                    </div>
                    <div className="text-xs text-muted-foreground">自动尝试：比值判别法、根值判别法、积分判别法、交错级数判别法</div>
                  </>
                ) : activeTab === 'paramArcLength' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <MathInputField
                        value={paramArcX}
                        onChange={setParamArcX}
                        label="x(t)"
                        showPalette
                        defaultPreview={false}
                      />
                      <MathInputField
                        value={paramArcY}
                        onChange={setParamArcY}
                        label="y(t)"
                        showPalette
                        defaultPreview={false}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">t₀</label>
                        <Input value={paramArcT0} onChange={(e) => setParamArcT0(e.target.value)} className="font-mono bg-card" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">t₁</label>
                        <Input value={paramArcT1} onChange={(e) => setParamArcT1(e.target.value)} className="font-mono bg-card" />
                      </div>
                    </div>
                  </>
                ) : activeTab === 'surfaceRev' ? (
                  <>
                    <MathInputField
                      value={expr}
                      onChange={setExpr}
                      label="曲线 y = f(x)"
                      multiline
                      rows={2}
                      showPalette
                      defaultPreview
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">下限 a</label>
                        <Input value={a} onChange={(e) => setA(e.target.value)} className="font-mono bg-card" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">上限 b</label>
                        <Input value={b} onChange={(e) => setB(e.target.value)} className="font-mono bg-card" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">绕 x 轴旋转：S = 2π∫ y·√(1+y'²) dx</div>
                  </>
                ) : (
                  <>
                    <MathInputField
                      value={expr}
                      onChange={setExpr}
                      multiline
                      rows={3}
                      showPalette
                      defaultPreview
                      label={
                        activeTab === 'implicit' ? 'F(x,y) 表达式（隐函数，求 dy/dx）' :
                        activeTab === 'parametric' ? 'x(t) 参数表达式' :
                        activeTab === 'lhopital' ? '分子 f(x)' :
                        activeTab === 'area' ? '上曲线 f(x)' :
                        activeTab === 'volume' || activeTab === 'arcLength' ? 'f(x)' :
                        activeTab === 'verifyAnti' ? 'f(x)（被积函数）' :
                        activeTab === 'convergenceRadius' ? 'a_n（级数系数，变量用 n）' :
                        '表达式 f(x)'
                      }
                    />

                    {(activeTab === 'lhopital' || activeTab === 'area' || activeTab === 'verifyAnti' || activeTab === 'parametric') && (
                      <MathInputField
                        value={activeTab === 'verifyAnti' ? FExpr : activeTab === 'parametric' ? paramY : gExpr}
                        onChange={(v) => {
                          if (activeTab === 'verifyAnti') setFExpr(v);
                          else if (activeTab === 'parametric') setParamY(v);
                          else setGExpr(v);
                        }}
                        showPalette
                        defaultPreview={false}
                        label={
                          activeTab === 'lhopital' ? '分母 g(x)' :
                          activeTab === 'area' ? '下曲线 g(x)' :
                          activeTab === 'verifyAnti' ? 'F(x)（待验证原函数）' :
                          'y(t) 参数表达式'
                        }
                      />
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">变量</label>
                        <Input value={variable} onChange={(e) => setVariable(e.target.value)} className="font-mono" />
                      </div>
                      {activeTab === 'implicit' && (
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">因变量</label>
                          <Input value={yVar} onChange={(e) => setYVar(e.target.value)} className="font-mono" />
                        </div>
                      )}
                      {(activeTab === 'limit' || activeTab === 'taylor' || activeTab === 'lhopital') && (
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            {activeTab === 'taylor' ? '展开点' : '趋近值'}
                          </label>
                          <Input value={x0} onChange={(e) => setX0(e.target.value)} className="font-mono" />
                        </div>
                      )}
                      {(activeTab === 'taylor' || activeTab === 'higherOrder') && (
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">阶数</label>
                          <Input value={order} onChange={(e) => setOrder(e.target.value)} className="font-mono" />
                        </div>
                      )}
                      {(activeTab === 'definite' || activeTab === 'improper' || activeTab === 'extrema' ||
                        activeTab === 'concavity' || activeTab === 'area' || activeTab === 'volume' ||
                        activeTab === 'arcLength') && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">下限 a</label>
                            <Input value={a} onChange={(e) => setA(e.target.value)} className="font-mono" />
                          </div>
                          {activeTab !== 'improper' && (
                            <div>
                              <label className="text-sm font-medium text-foreground mb-2 block">上限 b</label>
                              <Input value={b} onChange={(e) => setB(e.target.value)} className="font-mono" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}

                <Button
                  onClick={() => compute(activeTab)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  <Play className="size-4 mr-2" />
                  计算
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* 结果显示 */}
        <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-emerald-400/70 font-medium tracking-wider flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                计算结果
              </div>
              <div className="flex items-center gap-1">
                {result && !error && (
                  <button
                    onClick={() => setViewMode((m) => (m === 'formatted' ? 'text' : 'formatted'))}
                    className="h-7 px-2 text-xs text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-md transition-colors flex items-center gap-1"
                    title={viewMode === 'formatted' ? '切换到文本模式' : '切换到公式排版'}
                  >
                    {viewMode === 'formatted' ? (
                      <><Calculator className="size-3" /> 排版</>  
                    ) : (
                      <><Type className="size-3" /> 文本</>
                    )}
                  </button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="!h-7 px-2.5 text-xs text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-500/10"
                >
                  <History className="w-3.5 h-3.5 mr-1.5" />
                  历史 ({history.length})
                </Button>
              </div>
            </div>

            {historyOpen && (
              <div className="mb-4 border border-emerald-900/40 rounded-lg bg-emerald-950/30 p-3 max-h-52 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-emerald-400/60 font-medium">历史记录</span>
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="!h-6 px-2 text-xs text-red-400/70 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      清空
                    </Button>
                  )}
                </div>
                {history.length === 0 ? (
                  <div className="text-xs text-emerald-500/50 text-center py-4 italic">
                    暂无历史记录
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setResult(item.result);
                          setError(null);
                        }}
                        className="w-full text-left p-2 rounded-md hover:bg-emerald-900/30 transition-colors group"
                      >
                        <div className="text-xs text-emerald-400/60 truncate font-mono flex items-center gap-1.5">
                          <Clock className="size-3 shrink-0" />
                          {item.expression}
                        </div>
                        <div className="text-sm text-emerald-200/90 font-mono truncate mt-0.5 group-hover:text-emerald-100">
                          {item.result.split('\n')[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

             {error ? (
               <div className="text-red-400 font-mono leading-relaxed">{error}</div>
             ) : result ? (
               <div className="space-y-3">
                 <div className="flex items-center justify-between flex-wrap gap-2">
                   <button
                     onClick={() => copyAsText(result)}
                     className="text-xs text-emerald-400/70 hover:text-emerald-300 transition-colors flex items-center gap-1"
                   >
                     <Sparkles className="size-3.5" />
                     点击复制结果
                   </button>
                   {steps && steps.length > 0 && (
                     <button
                       type="button"
                       onClick={() => setShowSteps((s) => !s)}
                       className="flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-300 transition-colors"
                     >
                       <ListOrdered className="size-3.5" />
                       {showSteps ? '隐藏步骤' : '显示步骤'}
                       <span className="text-amber-500/60">({steps.length})</span>
                       {showSteps ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                     </button>
                   )}
                 </div>
                 {viewMode === 'formatted' ? (
                   <div className="text-emerald-300 text-base leading-relaxed space-y-1.5 overflow-x-auto">
                     {result.split('\n').map((line, i) => (
                       <div key={i} className="text-right">
                         {/^[\u4e00-\u9fa5]/.test(line.trim()) || line.includes('：') || line.includes('=') && /[\u4e00-\u9fa5]/.test(line.split('=')[0]) ? (
                           <span className="text-xs text-emerald-400/70 block mb-0.5 text-right">{line}</span>
                         ) : line.trim() === '' ? (
                           <div className="h-2" />
                         ) : (
                           <MathRenderer expression={line} isInput />
                         )}
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-emerald-300 font-mono text-lg whitespace-pre-wrap break-all leading-relaxed">
                     {result}
                   </div>
                 )}

                 {showSteps && steps && steps.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-emerald-800/40 space-y-2 page-fade-in">
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
             ) : (
              <div className="text-emerald-500/40 italic text-center py-6 flex flex-col items-center gap-1">
                <Lightbulb className="size-5 text-emerald-500/30" />
                <p>输入表达式后点击「计算」查看结果</p>
                <p className="text-xs text-emerald-500/50">试试下方「快速示例」一键填充</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600" />
              快速示例
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {EXAMPLES.map((ex, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="justify-start h-auto py-2.5 px-3 text-left"
                  onClick={() => loadExample(ex)}
                >
                  <span className="text-xs text-muted-foreground mr-2 shrink-0">{ex.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CheatsheetDialog moduleKey="calculus" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
