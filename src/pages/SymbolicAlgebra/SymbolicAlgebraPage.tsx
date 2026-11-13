import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import MathInputField from '@/components/MathInputField';
import PageShell from '@/components/PageShell';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Sparkles, History, Trash2, Clock, Calculator, Type, Lightbulb, ChevronDown, ChevronUp, ListOrdered } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import { useHistory } from '@/hooks/useHistory';
import FunctionPlotCard from '@/components/calculus/FunctionPlotCard';
import { symSimplify, symExpand, symDerivative, symSolve, safeEvaluate, formatResult, symFactor } from '@/lib/math-utils';
import { stepByStepQuadratic, stepByStepGauss, type StepItem } from '@/lib/step-by-step';
import { copyAsText } from '@/lib/export-utils';
import {
  polyDivideExpr,
  polyGcd,
  partialFractions,
  lagrangeInterp,
  solveLinear2x2,
  solvePolyIneq,
  formatIntervals,
  inverseFunction,
  composeFunctions,
  discriminant,
  vieta,
  binomialExpand,
  remainderTheorem,
} from '@/lib/math-advanced';
import { simplify } from 'mathjs';
import { toast } from 'sonner';
import { normalizeMathInput } from '@/lib/math-normalize';

const EXAMPLES = [
  { label: '展开 (x+1)³', expr: '(x+1)³', op: 'expand' },
  { label: '因式分解 x²-1', expr: 'x² - 1', op: 'factor' },
  { label: '化简 2x+3x', expr: '2*x + 3*x', op: 'simplify' },
  { label: '解方程 x²-5x+6=0', expr: 'x² - 5x + 6 = 0', op: 'solve' },
  { label: '多项式除法 x³-1 / x-1', expr: 'x³ - 1; x - 1', op: 'divide' },
  { label: '不等式 x²-4>0', expr: 'x² - 4 > 0', op: 'ineq' },
  { label: '拉格朗日插值 (0,1),(1,2),(2,5)', expr: '0,1,2; 1,2,5', op: 'lagrange' },
];

export default function SymbolicAlgebraPage() {
  const [expr, setExpr] = useState('x^2 - 5*x + 6 = 0');
  const [variable, setVariable] = useState('x');
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!confirmClear) return;
    const t = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(t);
  }, [confirmClear]);
  const [activeTab, setActiveTab] = useState('simplify');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted');
  const [steps, setSteps] = useState<StepItem[] | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_symbolic_history', maxItems: 30 });

  // 多项式除法 / gcdPoly 的第二个表达式
  const [exprB, setExprB] = useState('x - 1');
  // 拉格朗日的 y 列表
  const [xs, setXs] = useState('0, 1, 2');
  const [ys, setYs] = useState('1, 2, 5');
  // 方程组
  const [eqSys, setEqSys] = useState('x + y = 3; x - y = 1');
  // 函数复合
  const [fExpr, setFExpr] = useState('x^2');
  const [gExpr, setGExpr] = useState('sin(x)');
  // 二项式
  const [binomA, setBinomA] = useState('x');
  const [binomB, setBinomB] = useState('1');
  const [binomN, setBinomN] = useState('3');
  // 余数定理
  const [remainderA, setRemainderA] = useState('2');

  // 求导 tab 的函数配图
  const plot = useMemo(() => {
    if (activeTab !== 'derivative' || variable !== 'x' || expr.includes('=')) return null;
    const base = normalizeMathInput(expr);
    if (!base.trim()) return null;
    try {
      return {
        curves: [
          { label: 'f(x)', expr: base },
          { label: 'f′(x)', expr: symDerivative(base, 'x'), dashed: true },
        ] as { label: string; expr: string; dashed?: boolean }[],
      };
    } catch {
      return null;
    }
  }, [activeTab, expr, variable]);

  const compute = (op: string) => {
    setError(null);
    try {
      let res = '';
      // 全局数学符号预处理
      const e = normalizeMathInput(expr);
      const eB = normalizeMathInput(exprB);
      const fE = normalizeMathInput(fExpr);
      const gE = normalizeMathInput(gExpr);
      const bA = normalizeMathInput(binomA);
      const bB = normalizeMathInput(binomB);
      const bN = normalizeMathInput(binomN);
      const rA = normalizeMathInput(remainderA);

      switch (op) {
        case 'simplify':
          res = symSimplify(e);
          break;
        case 'expand':
          try {
            res = String(simplify(e, { rules: ['expand'] }));
          } catch {
            res = symExpand(e);
          }
          break;
        case 'factor':
          res = symFactor(e);
          break;
         case 'solve': {
           res = symSolve(e, variable);
           // 尝试生成步骤详解（仅限一元二次方程场景）
           try {
             const stepResult = stepByStepQuadratic(e);
             if (stepResult.steps.length > 0) {
               setSteps(stepResult.steps);
             } else {
               setSteps(null);
             }
           } catch {
             setSteps(null);
           }
           break;
         }
        case 'derivative':
          res = symDerivative(e, variable);
          break;
        case 'gcd-lcm':
          const parts = e.split(/[,;]/).map((s) => s.trim());
          if (parts.length >= 2) {
            const g = safeEvaluate(`gcd(${parts[0]}, ${parts[1]})`);
            const l = safeEvaluate(`lcm(${parts[0]}, ${parts[1]})`);
            res = `gcd = ${g}\nlcm = ${l}`;
          } else {
            throw new Error('请输入两个数，用逗号分隔，如 12, 18');
          }
          break;
        case 'divide': {
          const r = polyDivideExpr(e, eB, variable);
          res = `商式 = ${r.quotientExpr}\n余式 = ${r.remainderExpr}\n\n验证：(商式) × (除式) + (余式) = 被除式`;
          break;
        }
        case 'gcdpoly': {
          const r = polyGcd(e, eB, variable);
          res = `gcdPoly(A, B) = ${r}\n（首一最大公因式）`;
          break;
        }
        case 'apart': {
          // 解析 A/B：假设 expr 是分子，exprB 是分母
          const r = partialFractions(e, eB, variable);
          res = `部分分式分解结果：\n${r}`;
          break;
        }
        case 'lagrange': {
          const xArr = xs.split(/[,;]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
          const yArr = ys.split(/[,;]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
          if (xArr.length !== yArr.length) throw new Error('x 和 y 数组长度不一致');
          const r = lagrangeInterp(xArr, yArr, variable);
          res = `拉格朗日插值多项式：\nP(${variable}) = ${r}`;
          break;
        }
        case 'ineq': {
          const r = solvePolyIneq(e, variable);
          res = `不等式类型：${r.type}\n临界点：${r.criticalPoints.map(p => formatResult(p)).join(', ')}\n解集：${formatIntervals(r.intervals, variable)}`;
          break;
        }
         case 'solveSys': {
           // 解析方程组 a1x+b1y=c1; a2x+b2y=c2
           const lines = eqSys.split(';').map(s => s.trim());
           if (lines.length !== 2) throw new Error('请输入两个方程，用分号分隔');
           // 简单解析：提取系数
           const parseEq = (line: string) => {
             const [left, right] = line.split('=').map(s => s.trim());
             // 提取 x 和 y 的系数
             let a = 0, b = 0;
             // 处理左边：形如 "2*x + 3*y" 或 "x + y"
             const terms = left.replace(/\s+/g, '').replace(/-/g, '+-').split('+').filter(Boolean);
             for (const t of terms) {
               if (t.includes('x')) {
                 const coef = t.replace('x', '').replace('*', '');
                 a += coef === '' ? 1 : coef === '-' ? -1 : parseFloat(coef);
               } else if (t.includes('y')) {
                 const coef = t.replace('y', '').replace('*', '');
                 b += coef === '' ? 1 : coef === '-' ? -1 : parseFloat(coef);
               }
             }
             return { a, b, c: parseFloat(right) };
           };
           const eq1 = parseEq(lines[0]);
           const eq2 = parseEq(lines[1]);
           const r = solveLinear2x2(eq1.a, eq1.b, eq1.c, eq2.a, eq2.b, eq2.c);
           if (!r) res = '方程组无解或有无穷多解';
           else res = `方程组解：\nx = ${formatResult(r.x)}\ny = ${formatResult(r.y)}`;
           // 生成高斯消元步骤
           try {
             const matrix = [
               [eq1.a, eq1.b, eq1.c],
               [eq2.a, eq2.b, eq2.c],
             ];
             const stepResult = stepByStepGauss(matrix);
             if (stepResult.steps.length > 0) {
               setSteps(stepResult.steps);
             } else {
               setSteps(null);
             }
           } catch {
             setSteps(null);
           }
           break;
         }
         case 'inverse': {
           const r = inverseFunction(e, variable);
          res = `反函数：\nf⁻¹(${variable}) = ${r}`;
          break;
        }
         case 'compose': {
           const r = composeFunctions(fE, gE, variable);
          res = `函数复合 f(g(${variable}))：\n= ${r}`;
          break;
        }
         case 'discriminant': {
           const d = discriminant(e, variable);
           const v = vieta(e, variable);
          res = `判别式 Δ = ${formatResult(d)}\n\n韦达定理：\n根之和 = ${formatResult(v.sum)}\n根之积 = ${formatResult(v.product)}`;
          break;
        }
         case 'binomial': {
           const n = parseInt(bN);
           if (isNaN(n) || n < 0 || n > 20) throw new Error('n 必须是 0~20 的整数');
           const r = binomialExpand(bA, bB, n, variable);
           res = `(${bA} + ${bB})^${n} =\n${r}`;
           break;
         }
         case 'remainder': {
           const a = parseFloat(rA);
           const val = remainderTheorem(e, a, variable);
          res = `P(${formatResult(a)}) = ${formatResult(val)}\n（余数定理：多项式 P(x) 除以 (x-a) 的余数等于 P(a)）`;
          break;
        }
         default:
           res = safeEvaluate(e);
      }
       setResult(res);
       // 非支持步骤的 tab 清空 steps
       if (activeTab !== 'solve' && activeTab !== 'solveSys') {
         setSteps(null);
         setShowSteps(false);
       }
       // 保存到历史记录
      const exprForHistory = activeTab === 'lagrange'
        ? `lagrange(${variable}): x=[${xs}], y=[${ys}]`
        : activeTab === 'solveSys'
        ? `solveSys: ${eqSys}`
        : activeTab === 'compose'
        ? `compose: f=${fExpr}, g=${gExpr}`
        : `${activeTab}(${variable}): ${expr}${exprB ? ', ' + exprB : ''}`;
      addItem(exprForHistory, res);
    } catch (e) {
       const msg = (e as Error).message || '计算错误';
       setError(msg);
       setResult('');
       setSteps(null);
       setShowSteps(false);
       toast.error(msg, { duration: 3000 });
    }
  };

  const loadExample = (ex: { expr: string; op: string }) => {
    setExpr(ex.expr);
    setActiveTab(ex.op);
    setError(null);
    setResult('');
  };

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="符号代数"
        description="符号代数运算：展开、因式分解、化简、解方程、多项式除法、部分分式、拉格朗日插值、不等式、方程组、反函数、复合函数、判别式、韦达定理、二项式、余数定理。"
        eyebrow="计算工具"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-4xl mx-auto space-y-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="simplify">化简</TabsTrigger>
                <TabsTrigger value="expand">展开</TabsTrigger>
                <TabsTrigger value="factor">因式</TabsTrigger>
                <TabsTrigger value="solve">解方程</TabsTrigger>
                <TabsTrigger value="derivative">求导</TabsTrigger>
                <TabsTrigger value="divide">多项式除</TabsTrigger>
                <TabsTrigger value="gcd-lcm">gcd/lcm</TabsTrigger>
              </TabsList>
              <TabsList className="w-full mt-2">
                <TabsTrigger value="apart">部分分式</TabsTrigger>
                <TabsTrigger value="lagrange">拉格朗日</TabsTrigger>
                <TabsTrigger value="ineq">不等式</TabsTrigger>
                <TabsTrigger value="solveSys">方程组</TabsTrigger>
                <TabsTrigger value="inverse">反函数</TabsTrigger>
                <TabsTrigger value="compose">复合函数</TabsTrigger>
                <TabsTrigger value="discriminant">判别式</TabsTrigger>
              </TabsList>
              <TabsList className="w-full mt-2">
                <TabsTrigger value="binomial">二项式</TabsTrigger>
                <TabsTrigger value="gcdpoly">gcdPoly</TabsTrigger>
                <TabsTrigger value="remainder">余数定理</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                {activeTab === 'lagrange' ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">x 值（逗号分隔，最多 10 个点）</label>
                      <Input value={xs} onChange={(e) => setXs(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">y 值（逗号分隔，最多 10 个点）</label>
                      <Input value={ys} onChange={(e) => setYs(e.target.value)} className="font-mono" />
                    </div>
                  </>
                ) : activeTab === 'solveSys' ? (
                  <div>
                    <MathInputField
                      value={eqSys}
                      onChange={setEqSys}
                      label="方程组（分号分隔两个方程）"
                      placeholder="x + y = 3; x − y = 1（支持 × ÷ √ π x² 等符号）"
                      multiline
                      rows={3}
                      showPalette
                      defaultPreview
                    />
                  </div>
                ) : activeTab === 'compose' ? (
                  <>
                    <MathInputField value={fExpr} onChange={setFExpr} label="f(x) =" showPalette defaultPreview />
                    <MathInputField value={gExpr} onChange={setGExpr} label="g(x) =" showPalette defaultPreview />
                  </>
                ) : activeTab === 'binomial' ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">a</label><Input value={binomA} onChange={(e) => setBinomA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">b</label><Input value={binomB} onChange={(e) => setBinomB(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">n</label><Input value={binomN} onChange={(e) => setBinomN(e.target.value)} className="font-mono" /></div>
                  </div>
                ) : activeTab === 'remainder' ? (
                  <>
                    <div>
                      <MathInputField value={expr} onChange={setExpr} label="多项式 P(x)" multiline rows={3} showPalette defaultPreview />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">a 的值（计算 P(a)）</label>
                      <Input value={remainderA} onChange={(e) => setRemainderA(e.target.value)} className="font-mono w-32" />
                    </div>
                  </>
                ) : (
                  <div>
                    <MathInputField
                      value={expr}
                      onChange={setExpr}
                      label={activeTab === 'divide' || activeTab === 'gcdpoly' || activeTab === 'apart' ? '表达式 A（分子/被除式）' : '表达式'}
                      placeholder="输入表达式，如 x² + 2x + 1 或 sqrt(x)"
                      multiline
                      rows={4}
                      showPalette
                      defaultPreview
                    />
                  </div>
                )}

                {(activeTab === 'divide' || activeTab === 'gcdpoly' || activeTab === 'apart') && (
                  <div>
                    <MathInputField
                      value={exprB}
                      onChange={setExprB}
                      label={activeTab === 'apart' ? '表达式 B（分母/除式）' : '表达式 B'}
                      showPalette
                      defaultPreview
                    />
                  </div>
                )}

                {(activeTab === 'solve' || activeTab === 'derivative' || activeTab === 'divide' ||
                  activeTab === 'gcdpoly' || activeTab === 'apart' || activeTab === 'lagrange' ||
                  activeTab === 'ineq' || activeTab === 'inverse' || activeTab === 'compose' ||
                  activeTab === 'discriminant' || activeTab === 'remainder') && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">变量</label>
                    <input
                      type="text"
                      value={variable}
                      onChange={(e) => setVariable(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card font-mono text-sm w-24"
                      maxLength={5}
                    />
                  </div>
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
        <Card className="board-surface board-surface bg-[var(--board-bg)] border-0 shadow-lg">
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

            {/* 历史记录展开面板 */}
            {historyOpen && (
              <div className="mb-4 border border-emerald-900/40 rounded-lg bg-emerald-950/30 p-3 max-h-52 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-emerald-400/60 font-medium">历史记录</span>
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirmClear) {
                          clearHistory();
                          setConfirmClear(false);
                        } else {
                          setConfirmClear(true);
                        }
                      }}
                      className={confirmClear
                        ? '!h-6 px-2 text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        : '!h-6 px-2 text-xs text-red-400/70 hover:text-red-300 hover:bg-red-500/10'}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {confirmClear ? '确认清空？' : '清空'}
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
                         {/^[\u4e00-\u9fa5]/.test(line.trim()) || line.includes('：') ? (
                           <span className="text-xs text-emerald-400/70 block mb-0.5">{line}</span>
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

                 {/* 步骤详解展开区 */}
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

        {plot && (
          <FunctionPlotCard
            title="函数图像"
            description="实线为 f(x)，虚线为导函数 f′(x)"
            curves={plot.curves}
            xMin={-10}
            xMax={10}
          />
        )}

        {/* 示例 */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600" />
              快速示例
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXAMPLES.map((ex, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="justify-start h-auto py-2.5 px-3 text-left"
                  onClick={() => loadExample(ex)}
                >
                  <span className="text-xs text-muted-foreground mr-2 shrink-0">{ex.label}</span>
                  <code className="text-xs font-mono text-foreground truncate">{ex.expr}</code>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CheatsheetDialog moduleKey="symbolic" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
