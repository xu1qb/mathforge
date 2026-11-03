import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import PageShell from '@/components/PageShell';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Sparkles, Dices, Calculator, Type, ListOrdered } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import LearningSection from '@/components/LearningSection';
import { isPrime, factorize, eulerPhi, powMod, extendedGcd, modInverse, chineseRemainderTheorem, wilsonTheorem, fermatLittleTheorem, isQuadraticResidue, modularSqrt, mobius, divisorCount, divisorSum, solveLinearCongruence, solveDiophantine, continuedFraction, sievePrimes, digitCount, digitSum } from '@/lib/math-utils';
import { quadraticReciprocity, sqrtContinuedFraction, legendreSymbol } from '@/lib/math-advanced';
import { evaluate } from 'mathjs';
import { toast } from 'sonner';
import HistoryPanel from '@/components/HistoryPanel';
import { usePractice } from '@/hooks/usePractice';
import { useHistory } from '@/hooks/useHistory';
import { stepByStepGcd, stepByStepModInverse } from '@/lib/step-by-step';
import type { StepItem } from '@/lib/step-by-step';

export default function NumberTheoryPage() {
  const [primeN, setPrimeN] = useState('17');
  const [gcdA, setGcdA] = useState('24');
  const [gcdB, setGcdB] = useState('36');
  const [factorN, setFactorN] = useState('360');
  const [modA, setModA] = useState('17');
  const [modM, setModM] = useState('5');
  const [powBase, setPowBase] = useState('2');
  const [powExp, setPowExp] = useState('10');
  const [powModM, setPowModM] = useState('1000');
  const [phiN, setPhiN] = useState('12');

  // 扩展欧几里得 / 贝祖等式
  const [extA, setExtA] = useState('35');
  const [extB, setExtB] = useState('15');

  // 模逆元
  const [invA, setInvA] = useState('3');
  const [invM, setInvM] = useState('7');

  // 中国剩余定理
  const [crtAs, setCrtAs] = useState('2,3,2');
  const [crtMs, setCrtMs] = useState('3,5,7');

  // 费马小定理
  const [ferA, setFerA] = useState('5');
  const [ferP, setFerP] = useState('7');

  // 威尔逊定理
  const [wilP, setWilP] = useState('7');

  // 二次剩余
  const [qrA, setQrA] = useState('4');
  const [qrP, setQrP] = useState('13');

  // 莫比乌斯 / 除数函数 / 约数和
  const [muN, setMuN] = useState('30');
  const [divN, setDivN] = useState('12');

  // 一次同余方程
  const [congA, setCongA] = useState('3');
  const [congB, setCongB] = useState('2');
  const [congM, setCongM] = useState('7');

  // 二元一次不定方程
  const [dioA, setDioA] = useState('35');
  const [dioB, setDioB] = useState('15');
  const [dioC, setDioC] = useState('5');

  // 连分数
  const [cfNum, setCfNum] = useState('67');
  const [cfDen, setCfDen] = useState('29');

  // 素数表
  const [sieveA, setSieveA] = useState('1');
  const [sieveB, setSieveB] = useState('100');

  // 数位
  const [digitN, setDigitN] = useState('12345');

  // 二次互反律
  const [recipP, setRecipP] = useState('5');
  const [recipQ, setRecipQ] = useState('7');

  // √n 周期连分数
  const [sqrtCfN, setSqrtCfN] = useState('7');

  const [result, setResult] = useState('');
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted');
  const [steps, setSteps] = useState<StepItem[] | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('isPrime');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

  // 历史记录（持久化）
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addItem, clearHistory } = useHistory({
    storageKey: 'mathforge_nt_history',
    maxItems: 50,
  });

  // 随机练习
  const { currentQuestion, isCorrect, generateQuestion, checkAnswer, hasGenerator } = usePractice({ module: 'number-theory' });
  const [practiceMode, setPracticeMode] = useState(false);

  // 当生成新题目时，自动切换到对应 tab 并填入输入值
  useEffect(() => {
    if (!currentQuestion || !practiceMode) return;
    const q = currentQuestion.question;
    // gcd(a, b)
    const gcdMatch = q.match(/^gcd\((\d+),\s*(\d+)\)$/);
    if (gcdMatch) {
      setActiveTab('gcd');
      setGcdA(gcdMatch[1]);
      setGcdB(gcdMatch[2]);
      return;
    }
    // lcm(a, b)  -> 用 gcd tab 也能算
    const lcmMatch = q.match(/^lcm\((\d+),\s*(\d+)\)$/);
    if (lcmMatch) {
      setActiveTab('gcd');
      setGcdA(lcmMatch[1]);
      setGcdB(lcmMatch[2]);
      return;
    }
    // isPrime(n)
    const primeMatch = q.match(/^isPrime\((\d+)\)$/);
    if (primeMatch) {
      setActiveTab('isPrime');
      setPrimeN(primeMatch[1]);
      return;
    }
    // nCr(n, k)
    const ncrMatch = q.match(/^nCr\((\d+),\s*(\d+)\)$/);
    if (ncrMatch) {
      // 数论模块没有 nCr tab，跳到 gcd 提示用户去概率模块
      setActiveTab('factorize');
      setFactorN(String(parseInt(ncrMatch[1], 10) * parseInt(ncrMatch[2], 10) || 360));
      return;
    }
  }, [currentQuestion, practiceMode]);

  const parseArr = (s: string): number[] => s.split(/[,\s;]+/).map(x => {
    const v = parseInt(x.trim(), 10);
    if (isNaN(v)) throw new Error(`无效整数: ${x}`);
    return v;
  });

  const compute = (op: string) => {
    setError(null);
    try {
      let res = '';
      switch (op) {
        case 'isPrime': {
          const n = parseInt(primeN, 10);
          if (isNaN(n) || n < 2) throw new Error('请输入大于等于 2 的正整数');
          res = isPrime(n) ? `${n} 是素数 ✓` : `${n} 不是素数 ✗`;
          break;
        }
        case 'gcd': {
          const a = parseInt(gcdA, 10), b = parseInt(gcdB, 10);
          if (isNaN(a) || isNaN(b)) throw new Error('请输入有效整数');
          const g = evaluate(`gcd(${a}, ${b})`);
          const l = evaluate(`lcm(${a}, ${b})`);
          res = `gcd(${a}, ${b}) = ${g}\nlcm(${a}, ${b}) = ${l}`;
          try { setSteps(stepByStepGcd(a, b).steps); setShowSteps(false); } catch { setSteps(null); }
          break;
        }
        case 'factorize': {
          const n = parseInt(factorN, 10);
          if (isNaN(n) || n < 2) throw new Error('请输入大于等于 2 的正整数');
          const factors = factorize(n);
          const str = factors.map(f => f.exp === 1 ? `${f.prime}` : `${f.prime}^${f.exp}`).join(' × ');
          res = `${n} = ${str}`;
          break;
        }
        case 'mod': {
          const a = parseInt(modA, 10), m = parseInt(modM, 10);
          if (isNaN(a) || isNaN(m)) throw new Error('请输入有效整数');
          if (m <= 0) throw new Error('模数必须为正整数');
          res = `${a} mod ${m} = ${((a % m) + m) % m}`;
          break;
        }
        case 'powMod': {
          const a = parseInt(powBase, 10), b = parseInt(powExp, 10), m = parseInt(powModM, 10);
          if (isNaN(a) || isNaN(b) || isNaN(m)) throw new Error('请输入有效整数');
          if (m <= 0) throw new Error('模数必须为正整数');
          if (b < 0) throw new Error('指数必须非负');
          res = `${a}^${b} mod ${m} = ${powMod(a, b, m)}`;
          break;
        }
        case 'phi': {
          const n = parseInt(phiN, 10);
          if (isNaN(n) || n < 1) throw new Error('请输入正整数');
          res = `φ(${n}) = ${eulerPhi(n)}`;
          break;
        }
        case 'extGcd': {
          const a = parseInt(extA, 10), b = parseInt(extB, 10);
          if (isNaN(a) || isNaN(b)) throw new Error('请输入有效整数');
          const { gcd, x, y } = extendedGcd(a, b);
          res = `gcd(${a}, ${b}) = ${gcd}\n贝祖等式：\n${a} × (${x}) + ${b} × (${y}) = ${gcd}\n\n即 ${a}·x + ${b}·y = gcd(${a},${b})\n的一组特解为 x = ${x}, y = ${y}`;
          break;
        }
        case 'modInv': {
          const a = parseInt(invA, 10), m = parseInt(invM, 10);
          if (isNaN(a) || isNaN(m)) throw new Error('请输入有效整数');
          const inv = modInverse(a, m);
          res = `${a}⁻¹ mod ${m} = ${inv}\n\n验证：${a} × ${inv} ≡ ${(a * inv) % m} ≡ 1 (mod ${m})`;
          try { setSteps(stepByStepModInverse(a, m).steps); setShowSteps(false); } catch { setSteps(null); }
          break;
        }
        case 'crt': {
          const as = parseArr(crtAs), ms = parseArr(crtMs);
          if (as.length !== ms.length) throw new Error('余数与模数个数不一致');
          const { solution, modulus } = chineseRemainderTheorem(as, ms);
          const eqs = as.map((a, i) => `x ≡ ${a} (mod ${ms[i]})`).join('\n');
          res = `同余方程组：\n${eqs}\n\n最小正整数解：x = ${solution}\n通解：x = ${solution} + k·${modulus} (k ∈ ℤ)`;
          break;
        }
        case 'fermat': {
          const a = parseInt(ferA, 10), p = parseInt(ferP, 10);
          if (isNaN(a) || isNaN(p)) throw new Error('请输入有效整数');
          const { holds, value } = fermatLittleTheorem(a, p);
          res = `费马小定理：\na^(p-1) ≡ 1 (mod p)，当 p 为素数且 gcd(a,p)=1 时成立\n\n${a}^${p - 1} mod ${p} = ${value}\n${holds ? '✓ 满足 a^(p-1) ≡ 1 (mod p)' : '✗ 不满足（p 可能非素或 gcd(a,p)≠1）'}`;
          break;
        }
        case 'wilson': {
          const p = parseInt(wilP, 10);
          if (isNaN(p) || p < 2) throw new Error('请输入 ≥ 2 的整数');
          const { holds, value } = wilsonTheorem(p);
          res = `威尔逊定理：\n(p-1)! ≡ -1 (mod p) 当且仅当 p 为素数\n\n(${p} - 1)! mod ${p} = ${value}\n-1 mod ${p} = ${p - 1}\n\n${holds ? `✓ (p-1)! ≡ -1 (mod ${p})，p 是素数` : `✗ 不成立，p 不是素数`}`;
          break;
        }
        case 'quadRes': {
          const a = parseInt(qrA, 10), p = parseInt(qrP, 10);
          if (isNaN(a) || isNaN(p)) throw new Error('请输入有效整数');
          if (!isPrime(p)) throw new Error('p 必须是素数');
          const isQR = isQuadraticResidue(a, p);
          if (isQR) {
            const roots = modularSqrt(a, p);
            res = `${a} 是模 ${p} 的二次剩余 ✓\n平方根：x ≡ ${roots.join(' 和 ')} (mod ${p})`;
          } else {
            res = `${a} 是模 ${p} 的二次非剩余 ✗\n（欧拉判别法：a^((p-1)/2) ≡ -1 mod p）`;
          }
          break;
        }
        case 'mobius': {
          const n = parseInt(muN, 10);
          if (isNaN(n) || n < 1) throw new Error('请输入正整数');
          const m = mobius(n);
          const factors = factorize(n).map(f => `${f.prime}^${f.exp}`).join(' × ');
          res = `μ(${n}) = ${m}\n\n${n} = ${factors}\n莫比乌斯函数：\n- 有平方因子 → 0\n- k 个不同素因子 → (-1)^k`;
          break;
        }
        case 'divisor': {
          const n = parseInt(divN, 10);
          if (isNaN(n) || n < 1) throw new Error('请输入正整数');
          const d = divisorCount(n);
          const sigma = divisorSum(n);
          res = `d(${n}) = ${d} （正约数个数）\nσ(${n}) = ${sigma} （正约数和）\n\n${n} 的正约数`;
          break;
        }
        case 'congruence': {
          const a = parseInt(congA, 10), b = parseInt(congB, 10), m = parseInt(congM, 10);
          if (isNaN(a) || isNaN(b) || isNaN(m)) throw new Error('请输入有效整数');
          const { solution, modulus } = solveLinearCongruence(a, b, m);
          res = `方程 ${a}x ≡ ${b} (mod ${m})\n\n解：x ≡ ${solution} (mod ${modulus})\n通解：x = ${solution} + k·${modulus}, k ∈ ℤ`;
          break;
        }
        case 'diophantine': {
          const a = parseInt(dioA, 10), b = parseInt(dioB, 10), c = parseInt(dioC, 10);
          if (isNaN(a) || isNaN(b) || isNaN(c)) throw new Error('请输入有效整数');
          const sol = solveDiophantine(a, b, c);
          if (!sol) {
            res = `方程 ${a}x + ${b}y = ${c} 无整数解\n（因为 gcd(${a},${b}) 不整除 ${c}）`;
          } else {
            res = `方程 ${a}x + ${b}y = ${c}\n\ngcd(${a},${b}) = ${sol.gcd}\n特解：x₀ = ${sol.x}, y₀ = ${sol.y}\n验证：${a} × ${sol.x} + ${b} × ${sol.y} = ${a * sol.x + b * sol.y}\n\n通解：\nx = x₀ + (${b}/${sol.gcd})·t\ny = y₀ − (${a}/${sol.gcd})·t，t ∈ ℤ`;
          }
          break;
        }
        case 'continued': {
          const num = parseInt(cfNum, 10), den = parseInt(cfDen, 10);
          if (isNaN(num) || isNaN(den) || den === 0) throw new Error('请输入有效整数');
          const cf = continuedFraction(num, den);
          res = `${num}/${den} = [${cf.join('; ')}]  （连分数展开）\n项数：${cf.length}`;
          break;
        }
        case 'sieve': {
          const a = parseInt(sieveA, 10), b = parseInt(sieveB, 10);
          if (isNaN(a) || isNaN(b)) throw new Error('请输入有效整数');
          const primes = sievePrimes(a, b);
          const preview = primes.slice(0, 30);
          res = `区间 [${a}, ${b}] 内的素数（共 ${primes.length} 个）：\n${primes.length > 30 ? preview.join(', ') + '...' : primes.join(', ')}`;
          break;
        }
        case 'digit': {
          const n = parseInt(digitN, 10);
          if (isNaN(n)) throw new Error('请输入整数');
          res = `位数：${digitCount(n)} 位\n数位和：${digitSum(n)}`;
          break;
        }
        case 'quadRecip': {
          const p = parseInt(recipP, 10), q = parseInt(recipQ, 10);
          if (isNaN(p) || isNaN(q)) throw new Error('请输入有效整数');
          const lpq = legendreSymbol(p, q);
          const lqp = legendreSymbol(q, p);
          const result = quadraticReciprocity(p, q);
          res = `二次互反律：(p|q)·(q|p) = (-1)^((p-1)(q-1)/4)\n\n(p|q) = (${p}|${q}) = ${lpq}\n(q|p) = (${q}|${p}) = ${lqp}\n(p|q)·(q|p) = ${lpq * lqp}\n\n右侧：(-1)^(((${p}-1)/2)·((${q}-1)/2)) = ${result.rhs}\n\n${result.holds ? '✓ 满足二次互反律' : '✗ 不满足（p 或 q 不是奇素数）'}`;
          break;
        }
        case 'sqrtCf': {
          const n = parseInt(sqrtCfN, 10);
          if (isNaN(n) || n <= 0) throw new Error('请输入正整数');
          const sf = sqrtContinuedFraction(n);
          const convStr = sf.convergents.slice(0, 6).map(c => `${c.n}/${c.d}`).join(', ');
          res = `√${n} 的连分数展开：\n\n  [${sf.a0}; (${sf.period.join(', ')})]\n\n周期长度：${sf.periodLen}\n前 6 个渐近分数：\n  ${convStr}${sf.convergents.length > 6 ? ' ...' : ''}`;
          break;
        }
      }
      setResult(res);
      // 添加到历史
      const exprMap: Record<string, string> = {
        isPrime: `isPrime(${primeN})`,
        gcd: `gcd(${gcdA}, ${gcdB})`,
        factorize: `factorize(${factorN})`,
        mod: `${modA} mod ${modM}`,
        powMod: `powMod(${powBase}, ${powExp}, ${powModM})`,
        phi: `φ(${phiN})`,
        extGcd: `extGcd(${extA}, ${extB})`,
        modInv: `modInv(${invA}, ${invM})`,
        crt: `CRT([${crtAs}], [${crtMs}])`,
        fermat: `fermat(${ferA}, ${ferP})`,
        wilson: `wilson(${wilP})`,
        quadRes: `quadRes(${qrA}, ${qrP})`,
        mobius: `μ(${muN})`,
        divisor: `divisors(${divN})`,
        congruence: `${congA}x ≡ ${congB} (mod ${congM})`,
        diophantine: `${dioA}x + ${dioB}y = ${dioC}`,
        continued: `[${cfNum}; ${cfDen}]`,
        sieve: `primes in [${sieveA}, ${sieveB}]`,
        digit: `digitStats(${digitN})`,
      };
      addItem(exprMap[op] || op, res);
      // 如果是练习模式，自动检查答案
      if (practiceMode && currentQuestion) {
        checkAnswer(res);
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="数论基础"
        description="数论计算：素数、最大公约数、质因数分解、模运算、同余方程、数论函数等。"
        eyebrow="学科 · 基础数学"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-4xl mx-auto space-y-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <LearningSection moduleKey="number-theory" />
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap">
                <TabsTrigger value="isPrime">素数</TabsTrigger>
                <TabsTrigger value="gcd">gcd/lcm</TabsTrigger>
                <TabsTrigger value="factorize">质因数</TabsTrigger>
                <TabsTrigger value="mod">模运算</TabsTrigger>
                <TabsTrigger value="powMod">模幂</TabsTrigger>
                <TabsTrigger value="phi">欧拉函数</TabsTrigger>
                <TabsTrigger value="extGcd">扩展gcd</TabsTrigger>
                <TabsTrigger value="modInv">模逆元</TabsTrigger>
                <TabsTrigger value="crt">中国剩余</TabsTrigger>
                <TabsTrigger value="fermat">费马</TabsTrigger>
                <TabsTrigger value="wilson">威尔逊</TabsTrigger>
                <TabsTrigger value="quadRes">二次剩余</TabsTrigger>
                <TabsTrigger value="congruence">同余方程</TabsTrigger>
                <TabsTrigger value="diophantine">不定方程</TabsTrigger>
                <TabsTrigger value="continued">连分数</TabsTrigger>
                <TabsTrigger value="mobius">莫比乌斯</TabsTrigger>
                <TabsTrigger value="divisor">除数函数</TabsTrigger>
                <TabsTrigger value="sieve">素数表</TabsTrigger>
                <TabsTrigger value="digit">位数/数位和</TabsTrigger>
                <TabsTrigger value="quadRecip">二次互反律</TabsTrigger>
                <TabsTrigger value="sqrtCf">√n连分数</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                {/* 练习模式提示 */}
                {practiceMode && currentQuestion && (
                  <div className={cn(
                    'border rounded-lg p-3 mb-2',
                    isCorrect === null
                      ? 'border-amber-300 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/20'
                      : isCorrect
                      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700/40 dark:bg-emerald-900/20'
                      : 'border-red-300 bg-red-50 dark:border-red-700/40 dark:bg-red-900/20'
                  )}>
                    <div className="flex items-start gap-2">
                      <Sparkles className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                          随机练习 · {currentQuestion.type}
                          {isCorrect === true && <span className="text-emerald-600 dark:text-emerald-400 ml-2">✓ 回答正确！</span>}
                          {isCorrect === false && <span className="text-red-600 dark:text-red-400 ml-2">✗ 再想想</span>}
                        </div>
                        <div className="text-sm text-foreground dark:text-foreground">{currentQuestion.description}</div>
                        <div className="text-xs font-mono text-muted-foreground dark:text-muted-foreground mt-1">输入: {currentQuestion.question}</div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => { setPracticeMode(false); }} className="shrink-0 h-7 text-xs text-muted-foreground">
                        退出
                      </Button>
                    </div>
                  </div>
                )}

                <TabsContent value="isPrime" className="space-y-4">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">n</label><Input value={primeN} onChange={e => setPrimeN(e.target.value)} className="font-mono" /></div>
                  <Button onClick={() => compute('isPrime')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />判断</Button>
                </TabsContent>
                <TabsContent value="gcd" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={gcdA} onChange={e => setGcdA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">b</label><Input value={gcdB} onChange={e => setGcdB(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => compute('gcd')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算</Button>
                </TabsContent>
                <TabsContent value="factorize" className="space-y-4">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">n</label><Input value={factorN} onChange={e => setFactorN(e.target.value)} className="font-mono" /></div>
                  <Button onClick={() => compute('factorize')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />分解</Button>
                </TabsContent>
                <TabsContent value="mod" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={modA} onChange={e => setModA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">m</label><Input value={modM} onChange={e => setModM(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => compute('mod')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />取模</Button>
                </TabsContent>
                <TabsContent value="powMod" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">底数 a</label><Input value={powBase} onChange={e => setPowBase(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">指数 b</label><Input value={powExp} onChange={e => setPowExp(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">模数 m</label><Input value={powModM} onChange={e => setPowModM(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => compute('powMod')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算 a^b mod m</Button>
                </TabsContent>
                <TabsContent value="phi" className="space-y-4">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">n</label><Input value={phiN} onChange={e => setPhiN(e.target.value)} className="font-mono" /></div>
                  <Button onClick={() => compute('phi')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算 φ(n)</Button>
                </TabsContent>
                <TabsContent value="extGcd" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={extA} onChange={e => setExtA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">b</label><Input value={extB} onChange={e => setExtB(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => compute('extGcd')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />扩展欧几里得</Button>
                </TabsContent>
                <TabsContent value="modInv" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={invA} onChange={e => setInvA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">m</label><Input value={invM} onChange={e => setInvM(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => compute('modInv')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />求逆元</Button>
                </TabsContent>
                <TabsContent value="crt" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">余数 a_i（逗号分隔）</label><Input value={crtAs} onChange={e => setCrtAs(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">模数 m_i（逗号分隔）</label><Input value={crtMs} onChange={e => setCrtMs(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => compute('crt')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />中国剩余定理</Button>
                </TabsContent>
                <TabsContent value="fermat" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={ferA} onChange={e => setFerA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">p (素数)</label><Input value={ferP} onChange={e => setFerP(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => compute('fermat')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />费马小定理验证</Button>
                </TabsContent>
                <TabsContent value="wilson" className="space-y-4">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">p</label><Input value={wilP} onChange={e => setWilP(e.target.value)} className="font-mono" /></div>
                  <Button onClick={() => compute('wilson')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />威尔逊定理验证</Button>
                </TabsContent>
                <TabsContent value="quadRes" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={qrA} onChange={e => setQrA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">p (素数)</label><Input value={qrP} onChange={e => setQrP(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => compute('quadRes')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />二次剩余判定</Button>
                </TabsContent>
                <TabsContent value="congruence" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={congA} onChange={e => setCongA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">b</label><Input value={congB} onChange={e => setCongB(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">m</label><Input value={congM} onChange={e => setCongM(e.target.value)} className="font-mono" /></div>
                  </div>
                  <div className="text-sm text-muted-foreground">方程：ax ≡ b (mod m)</div>
                  <Button onClick={() => compute('congruence')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />求解</Button>
                </TabsContent>
                <TabsContent value="diophantine" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={dioA} onChange={e => setDioA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">b</label><Input value={dioB} onChange={e => setDioB(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">c</label><Input value={dioC} onChange={e => setDioC(e.target.value)} className="font-mono" /></div>
                  </div>
                  <div className="text-sm text-muted-foreground">方程：ax + by = c</div>
                  <Button onClick={() => compute('diophantine')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />求整数解</Button>
                </TabsContent>
                <TabsContent value="continued" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">分子</label><Input value={cfNum} onChange={e => setCfNum(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">分母</label><Input value={cfDen} onChange={e => setCfDen(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => compute('continued')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />连分数展开</Button>
                </TabsContent>
                <TabsContent value="mobius" className="space-y-4">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">n</label><Input value={muN} onChange={e => setMuN(e.target.value)} className="font-mono" /></div>
                  <Button onClick={() => compute('mobius')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />计算 μ(n)</Button>
                </TabsContent>
                <TabsContent value="divisor" className="space-y-4">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">n</label><Input value={divN} onChange={e => setDivN(e.target.value)} className="font-mono" /></div>
                  <Button onClick={() => compute('divisor')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />除数函数 / 约数和</Button>
                </TabsContent>
                <TabsContent value="sieve" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">左端点 a</label><Input value={sieveA} onChange={e => setSieveA(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">右端点 b</label><Input value={sieveB} onChange={e => setSieveB(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={() => compute('sieve')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />生成素数表</Button>
                </TabsContent>
                <TabsContent value="digit" className="space-y-4">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">n</label><Input value={digitN} onChange={e => setDigitN(e.target.value)} className="font-mono" /></div>
                  <Button onClick={() => compute('digit')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />位数与数位和</Button>
                </TabsContent>
                <TabsContent value="quadRecip" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">p（奇素数）</label><Input value={recipP} onChange={e => setRecipP(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">q（奇素数）</label><Input value={recipQ} onChange={e => setRecipQ(e.target.value)} className="font-mono" /></div>
                  </div>
                  <div className="text-sm text-muted-foreground">验证：(p|q)·(q|p) = (-1)^((p-1)(q-1)/4)</div>
                  <Button onClick={() => compute('quadRecip')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />验证二次互反律</Button>
                </TabsContent>
                <TabsContent value="sqrtCf" className="space-y-4">
                  <div><label className="text-sm font-medium text-foreground mb-2 block">n（非完全平方正整数）</label><Input value={sqrtCfN} onChange={e => setSqrtCfN(e.target.value)} className="font-mono" /></div>
                  <Button onClick={() => compute('sqrtCf')} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Play className="size-4 mr-2" />周期连分数展开</Button>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* 操作栏：历史 + 随机练习 */}
        <div className="flex items-center gap-2 flex-wrap">
          <HistoryPanel
            open={historyOpen}
            history={history}
            onToggle={() => setHistoryOpen((o) => !o)}
            onClear={clearHistory}
            onSelect={(item) => {
              // 回填结果
              setResult(item.result);
              setError(null);
            }}
            theme="orange"
          />
          {hasGenerator && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPracticeMode(true);
                generateQuestion();
                toast.info('随机题目已生成，试着算算看！');
              }}
              className="border-primary/30 text-primary dark:text-primary/90 hover:bg-primary/5 dark:hover:bg-primary/10"
            >
              <Dices className="size-4 mr-1.5" />
              随机练习
            </Button>
          )}
        </div>

        {result || error ? (
          <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-emerald-400/70 font-medium tracking-wider">计算结果</div>
                {result && !error && (
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
                    {steps && steps.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowSteps((s) => !s)}
                        className="h-6 px-2 text-xs text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 rounded-md transition-colors flex items-center gap-1"
                      >
                        <ListOrdered className="size-3.5" />
                        {showSteps ? '隐藏步骤' : '显示步骤'}
                        <span className="text-amber-500/60">({steps.length})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              {error ? (
                <div className="text-red-400 font-mono">{error}</div>
              ) : viewMode === 'formatted' ? (
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
            </CardContent>
          </Card>
        ) : null}
      </div>

      <CheatsheetDialog moduleKey="numberTheory" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
