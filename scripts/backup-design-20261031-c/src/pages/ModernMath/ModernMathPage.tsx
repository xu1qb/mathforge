import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/PageHeader';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Info, Lock, Calculator, Type } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import { toast } from 'sonner';
import { useHistory } from '@/hooks/useHistory';
import HistoryPanel from '@/components/HistoryPanel';
import {
  generatePythagoreanTriples,
  catalanNumber,
  stirlingNumber2,
  bellNumber,
  cycleDecomposition,
  permutationOrder,
  inversePermutation,
} from '@/lib/math-utils';
import {
  derangementNumber,
  stirlingNumber1,
  inclusionExclusion3,
  millerRabin,
  crtGeneral,
  nimGameWinner,
  wythoffGame,
  permutationSign,
  maxFlowFordFulkerson,
  legendreSymbol,
  jacobiSymbol,
  bfsTraversal,
  dfsTraversal,
  topologicalSort,
  stronglyConnectedComponents,
  pascalTriangle,
  integerPartition,
  rsaDemo,
  hammingCode74,
  hammingDecode,
  finiteFieldGFp,
  simplexTwoVar,
} from '@/lib/math-advanced';
import { formatResult } from '@/lib/math-utils';

const TABS = [
  { value: 'combinatorics', label: '组合基础' },
  { value: 'derangement', label: '错排问题' },
  { value: 'stirling', label: '斯特林数' },
  { value: 'inclusion', label: '容斥原理' },
  { value: 'recurrence', label: '递推关系' },
  { value: 'catalan', label: '卡特兰数' },
  { value: 'pythagorean', label: '勾股数' },
  { value: 'graphAlgo', label: '图论算法' },
  { value: 'networkFlow', label: '网络流' },
  { value: 'numberTheory', label: '数论高级' },
  { value: 'crt', label: '中国剩余' },
  { value: 'quadratic', label: '二次剩余' },
  { value: 'primality', label: '素性检测' },
  { value: 'nim', label: 'Nim博弈' },
  { value: 'wythoff', label: '威佐夫博弈' },
  { value: 'permutation', label: '置换群' },
  { value: 'pascal', label: '杨辉三角' },
  { value: 'integerPartition', label: '整数分拆' },
  { value: 'bell', label: '贝尔数' },
  { value: 'rsa', label: 'RSA密码' },
  { value: 'hamming', label: '汉明码' },
  { value: 'finiteField', label: '有限域GF(p)' },
  { value: 'linearProgram', label: '线性规划' },
];

function parseMatrix(str: string): number[][] {
  const rows = str.trim().split(/[\n;]/).map(r => r.trim()).filter(r => r.length > 0);
  return rows.map(row =>
    row.split(/[, \t]+/).map(c => parseFloat(c.trim())).filter(c => !isNaN(c))
  );
}

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

export default function ModernMathPage() {
  const [activeTab, setActiveTab] = useState('combinatorics');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_modern_history' });
  const lastResultRef = useRef('');

  // 1. 组合基础
  const [combN, setCombN] = useState('10');
  const [combK, setCombK] = useState('3');
  const [combResult, setCombResult] = useState('');

  // 监听组合数结果变化，自动记录历史
  useEffect(() => {
    if (combResult && combResult !== lastResultRef.current) {
      addItem(activeTab, combResult);
      lastResultRef.current = combResult;
    }
  }, [combResult, activeTab, addItem]);
  const [combError, setCombError] = useState<string | null>(null);

  const computeCombinatorics = () => {
    setCombError(null);
    try {
      const n = parseInt(combN), k = parseInt(combK);
      if (n < 0 || k < 0) throw new Error('n, k 必须非负');
      // C(n,k)
      let c = 1;
      const kk = Math.min(k, n - k);
      for (let i = 1; i <= kk; i++) {
        c = c * (n - i + 1) / i;
      }
      const C = Math.round(c);
      // P(n,k)
      let P = 1;
      for (let i = 0; i < k; i++) P *= (n - i);
      // n!
      let fact = 1;
      for (let i = 2; i <= n; i++) fact *= i;

      let txt = `n = ${n}, k = ${k}\n\n`;
      txt += `排列 P(n,k) = n!/(n-k)! = ${P}\n`;
      txt += `组合 C(n,k) = n!/(k!(n-k)!) = ${C}\n`;
      txt += `n! = ${fact}\n\n`;
      txt += `杨辉三角恒等式验证:\n`;
      txt += `  C(n,k) = C(n-1,k) + C(n-1,k-1)\n`;
      let c1 = 1, c2 = 1;
      const k1 = Math.min(k, n - 1 - k);
      for (let i = 1; i <= k1; i++) c1 = c1 * (n - 1 - i + 1) / i;
      const k2 = Math.min(k - 1, n - 1 - (k - 1));
      for (let i = 1; i <= k2; i++) c2 = c2 * (n - 1 - i + 1) / i;
      txt += `  C(${n - 1},${k}) + C(${n - 1},${k - 1}) = ${Math.round(c1)} + ${Math.round(c2)} = ${Math.round(c1) + Math.round(c2)} = C(${n},${k}) ✓`;
      setCombResult(txt);
    } catch (e) {
      setCombError((e as Error).message || '计算错误');
      setCombResult('');
      toast.error('计算错误');
    }
  };

  // 2. 错排问题
  const [derN, setDerN] = useState('5');
  const [derResult, setDerResult] = useState('');
  const [derError, setDerError] = useState<string | null>(null);

  const computeDerangement = () => {
    setDerError(null);
    try {
      const n = parseInt(derN);
      const Dn = derangementNumber(n);
      let txt = `错排数 D(${n}) = ${Dn}\n\n`;
      txt += `公式: D_n = n! (1 - 1/1! + 1/2! - 1/3! + ... + (-1)^n/n!)\n\n`;
      txt += `前 ${Math.min(n, 10)} 项错排数:\n`;
      for (let i = 0; i <= Math.min(n, 10); i++) {
        txt += `  D(${i}) = ${derangementNumber(i)}\n`;
      }
      txt += `\n近似: D_n ≈ n!/e = ${(factorial(n) / Math.E).toFixed(2)}`;
      setDerResult(txt);
    } catch (e) {
      setDerError((e as Error).message || '计算错误');
      setDerResult('');
      toast.error('计算错误');
    }
  };

  function factorial(n: number): number {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  // 3. 斯特林数
  const [stirN, setStirN] = useState('5');
  const [stirK, setStirK] = useState('3');
  const [stirResult, setStirResult] = useState('');
  const [stirError, setStirError] = useState<string | null>(null);

  const computeStirling = () => {
    setStirError(null);
    try {
      const n = parseInt(stirN), k = parseInt(stirK);
      const s1 = stirlingNumber1(n, k);
      const s2 = stirlingNumber2(n, k);
      const bell = bellNumber(n);
      let txt = `n = ${n}, k = ${k}\n\n`;
      txt += `第一类斯特林数（无符号）s(${n}, ${k}) = ${s1}\n`;
      txt += `  — 将 n 个元素排成 k 个环的方案数\n\n`;
      txt += `第二类斯特林数 S(${n}, ${k}) = ${s2}\n`;
      txt += `  — 将 n 个元素分成 k 个非空子集的方案数\n\n`;
      txt += `贝尔数 B(${n}) = ${bell}\n`;
      txt += `  — 将 n 个元素划分成任意非空子集的方案数\n\n`;
      txt += `第二类斯特林数三角形 (n=0..${n}, k=0..n):\n`;
      for (let i = 0; i <= n; i++) {
        const row: string[] = [];
        for (let j = 0; j <= i; j++) row.push(String(stirlingNumber2(i, j)));
        txt += `  n=${i}: [${row.join(', ')}]\n`;
      }
      setStirResult(txt);
    } catch (e) {
      setStirError((e as Error).message || '计算错误');
      setStirResult('');
      toast.error('计算错误');
    }
  };

  // 4. 容斥原理
  const [incA, setIncA] = useState('10');
  const [incB, setIncB] = useState('15');
  const [incC, setIncC] = useState('8');
  const [incAB, setIncAB] = useState('5');
  const [incAC, setIncAC] = useState('3');
  const [incBC, setIncBC] = useState('4');
  const [incABC, setIncABC] = useState('2');
  const [incResult, setIncResult] = useState('');
  const [incError, setIncError] = useState<string | null>(null);

  const computeInclusion = () => {
    setIncError(null);
    try {
      const a = parseInt(incA), b = parseInt(incB), c = parseInt(incC);
      const ab = parseInt(incAB), ac = parseInt(incAC), bc = parseInt(incBC);
      const abc = parseInt(incABC);
      const result = inclusionExclusion3(a, b, c, ab, ac, bc, abc);
      let txt = '三集合容斥原理:\n\n';
      txt += `|A| = ${a}, |B| = ${b}, |C| = ${c}\n`;
      txt += `|A∩B| = ${ab}, |A∩C| = ${ac}, |B∩C| = ${bc}\n`;
      txt += `|A∩B∩C| = ${abc}\n\n`;
      txt += `|A ∪ B ∪ C| = |A| + |B| + |C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|\n`;
      txt += `           = ${a} + ${b} + ${c} - ${ab} - ${ac} - ${bc} + ${abc}\n`;
      txt += `           = ${result}`;
      setIncResult(txt);
    } catch (e) {
      setIncError((e as Error).message || '计算错误');
      setIncResult('');
      toast.error('计算错误');
    }
  };

  // 5. 递推关系
  const [recA1, setRecA1] = useState('1');
  const [recA2, setRecA2] = useState('1');
  const [recC1, setRecC1] = useState('1');
  const [recC2, setRecC2] = useState('1');
  const [recN, setRecN] = useState('10');
  const [recResult, setRecResult] = useState('');
  const [recError, setRecError] = useState<string | null>(null);

  const computeRecurrence = () => {
    setRecError(null);
    try {
      const a1 = parseInt(recA1), a2 = parseInt(recA2);
      const c1 = parseInt(recC1), c2 = parseInt(recC2);
      const n = parseInt(recN);
      // a_n = c1 * a_{n-1} + c2 * a_{n-2}
      const terms: number[] = [a1, a2];
      for (let i = 2; i < n; i++) {
        terms.push(c1 * terms[i - 1] + c2 * terms[i - 2]);
      }
      let txt = `线性递推: a_n = ${c1}·a_{n-1} + ${c2}·a_{n-2}\n`;
      txt += `初值: a₁ = ${a1}, a₂ = ${a2}\n\n`;
      txt += `前 ${n} 项:\n`;
      for (let i = 0; i < n; i++) {
        txt += `  a_${i + 1} = ${terms[i]}\n`;
      }
      // 特征方程：r² - c1·r - c2 = 0
      const disc = c1 * c1 + 4 * c2;
      txt += `\n特征方程: r² - ${c1}r - ${c2} = 0\n`;
      txt += `判别式 Δ = ${disc}\n`;
      if (disc > 0) {
        const r1 = (c1 + Math.sqrt(disc)) / 2;
        const r2 = (c1 - Math.sqrt(disc)) / 2;
        txt += `实根: r₁ = ${formatResult(r1)}, r₂ = ${formatResult(r2)}\n`;
        txt += `通解: a_n = A·r₁ⁿ + B·r₂ⁿ`;
      } else if (disc === 0) {
        const r = c1 / 2;
        txt += `重根: r = ${r}\n`;
        txt += `通解: a_n = (A + B·n)·rⁿ`;
      } else {
        const real = c1 / 2;
        const imag = Math.sqrt(-disc) / 2;
        txt += `复根: r = ${formatResult(real)} ± ${formatResult(imag)}i\n`;
        txt += `通解: a_n = αⁿ·(A cos nθ + B sin nθ), α = ${formatResult(Math.hypot(real, imag))}`;
      }
      setRecResult(txt);
    } catch (e) {
      setRecError((e as Error).message || '计算错误');
      setRecResult('');
      toast.error('计算错误');
    }
  };

  // 6. 卡特兰数
  const [catN, setCatN] = useState('5');
  const [catResult, setCatResult] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  const computeCatalan = () => {
    setCatError(null);
    try {
      const n = parseInt(catN);
      const Cn = catalanNumber(n);
      let txt = `卡特兰数 C_${n} = ${Cn}\n\n`;
      txt += `公式: C_n = (2n)!/(n!(n+1)!) = (1/(n+1))·C(2n,n)\n\n`;
      txt += `前 ${Math.min(n + 1, 12)} 个卡特兰数:\n`;
      for (let i = 0; i <= Math.min(n, 11); i++) {
        txt += `  C_${i} = ${catalanNumber(i)}\n`;
      }
      txt += `\n经典应用场景:\n`;
      txt += `  • ${n} 对括号的合法匹配方式: ${Cn} 种\n`;
      txt += `  • ${n + 1} 个叶子的满二叉树个数: ${Cn}\n`;
      txt += `  • 凸 ${n + 2} 边形三角剖分: ${Cn}\n`;
      txt += `  • 2n 个人排队进出栈: ${Cn}`;
      setCatResult(txt);
    } catch (e) {
      setCatError((e as Error).message || '计算错误');
      setCatResult('');
      toast.error('计算错误');
    }
  };

  // 7. 勾股数
  const [pythN, setPythN] = useState('10');
  const [pythCheckA, setPythCheckA] = useState('3');
  const [pythCheckB, setPythCheckB] = useState('4');
  const [pythCheckC, setPythCheckC] = useState('5');
  const [pythResult, setPythResult] = useState('');
  const [pythError, setPythError] = useState<string | null>(null);

  const computePythagorean = () => {
    setPythError(null);
    try {
      const n = parseInt(pythN);
      const triples = generatePythagoreanTriples(n);
      const a = parseInt(pythCheckA), b = parseInt(pythCheckB), c = parseInt(pythCheckC);
      const isPyth = a * a + b * b === c * c;
      const isPrimitive = gcd2(gcd2(a, b), c) === 1;

      let txt = `【勾股数判定】\n`;
      txt += `${a}² + ${b}² = ${a * a + b * b} ${isPyth ? '=' : '≠'} ${c}² = ${c * c}\n`;
      txt += `${isPyth ? '✅ 是勾股数' : '❌ 不是勾股数'}\n`;
      if (isPyth) {
        txt += `${isPrimitive ? '✅ 本原勾股数（三数互素）' : '非本原勾股数'}\n`;
      }
      txt += `\n【前 ${triples.length} 组本原勾股数】\n`;
      txt += `(欧几里得公式: a = m²-n², b = 2mn, c = m²+n², m>n, 互素, 一奇一偶)\n\n`;
      triples.forEach((t, i) => {
        txt += `  ${i + 1}. (${t.a}, ${t.b}, ${t.c})  ${t.a * t.a + t.b * t.b === t.c * t.c ? '✓' : '✗'}\n`;
      });
      setPythResult(txt);
    } catch (e) {
      setPythError((e as Error).message || '计算错误');
      setPythResult('');
      toast.error('计算错误');
    }
  };

  function gcd2(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = b; b = a % b; a = t; }
    return a;
  }

  // 8. 图论算法
  const [gaMatrix, setGaMatrix] = useState('0,1,1,0,0,0,0\n1,0,0,1,1,0,0\n1,0,0,0,0,1,1\n0,1,0,0,0,0,0\n0,1,0,0,0,0,0\n0,0,1,0,0,0,0\n0,0,1,0,0,0,0');
  const [gaStart, setGaStart] = useState('0');
  const [gaResult, setGaResult] = useState('');
  const [gaError, setGaError] = useState<string | null>(null);

  const computeGraphAlgo = () => {
    setGaError(null);
    try {
      const m = parseMatrix(gaMatrix).map(r => r.map(v => v === 0 ? 0 : 1));
      const start = parseInt(gaStart);
      const bfs = bfsTraversal(m, start);
      const dfs = dfsTraversal(m, start);
      const topo = topologicalSort(m);
      const scc = stronglyConnectedComponents(m);

      let txt = `邻接矩阵 (${m.length}×${m.length}), 起点: v${start}\n\n`;
      txt += `BFS 序列: v${bfs.order.join(' → v')}\n`;
      txt += `DFS 序列: v${dfs.order.join(' → v')}\n\n`;
      txt += `拓扑排序 (Kahn): ${topo.hasCycle ? '存在环，无法排序' : topo.order ? 'v' + topo.order.join(' → v') : '无结果'}\n\n`;
      txt += `强连通分量数: ${scc.length}\n`;
      scc.forEach((comp, i) => {
        txt += `  SCC-${i + 1}: {${comp.map(v => 'v' + v).join(', ')}}\n`;
      });
      setGaResult(txt);
    } catch (e) {
      setGaError((e as Error).message || '计算错误');
      setGaResult('');
      toast.error('计算错误');
    }
  };

  // 9. 网络流
  const [nfMatrix, setNfMatrix] = useState('0,16,13,0,0,0\n0,0,10,12,0,0\n0,4,0,0,14,0\n0,0,9,0,0,20\n0,0,0,7,0,4\n0,0,0,0,0,0');
  const [nfSource, setNfSource] = useState('0');
  const [nfSink, setNfSink] = useState('5');
  const [nfResult, setNfResult] = useState('');
  const [nfError, setNfError] = useState<string | null>(null);

  const computeMaxFlow = () => {
    setNfError(null);
    try {
      const m = parseMatrix(nfMatrix);
      const s = parseInt(nfSource), t = parseInt(nfSink);
      const r = maxFlowFordFulkerson(m, s, t);
      let txt = `容量矩阵: ${m.length}×${m.length}\n`;
      txt += `源点 s = v${s}, 汇点 t = v${t}\n\n`;
      txt += `最大流值 = ${r.flow}\n\n`;
      txt += `流量分配矩阵 F:\n`;
      for (let i = 0; i < m.length; i++) {
        const row = r.flowMatrix[i].map((v: number) => (v > 0 ? v.toString() : '.')).join('  ');
        txt += `  v${i}: [${row}]\n`;
      }
      txt += `\n(正数为正向流，负数为反向边，仅正向弧有实际流量)`;
      setNfResult(txt);
    } catch (e) {
      setNfError((e as Error).message || '计算错误');
      setNfResult('');
      toast.error('计算错误');
    }
  };

  // 10. 数论高级（汇总：欧拉函数、莫比乌斯等）
  const [ntN, setNtN] = useState('36');
  const [ntResult, setNtResult] = useState('');
  const [ntError, setNtError] = useState<string | null>(null);

  const eulerPhi = (n: number): number => {
    let result = n;
    for (let p = 2; p * p <= n; p++) {
      if (n % p === 0) {
        while (n % p === 0) n = Math.floor(n / p);
        result -= Math.floor(result / p);
      }
    }
    if (n > 1) result -= Math.floor(result / n);
    return result;
  };

  const mobius = (n: number): number => {
    let count = 0;
    for (let p = 2; p * p <= n; p++) {
      if (n % p === 0) {
        n = Math.floor(n / p);
        count++;
        if (n % p === 0) return 0; // 平方因子
      }
    }
    if (n > 1) count++;
    return count % 2 === 0 ? 1 : -1;
  };

  const factorize = (n: number): Array<[number, number]> => {
    const factors: Array<[number, number]> = [];
    for (let p = 2; p * p <= n; p++) {
      if (n % p === 0) {
        let e = 0;
        while (n % p === 0) { n = Math.floor(n / p); e++; }
        factors.push([p, e]);
      }
    }
    if (n > 1) factors.push([n, 1]);
    return factors;
  };

  const computeNumberTheory = () => {
    setNtError(null);
    try {
      const n = parseInt(ntN);
      const phi = eulerPhi(n);
      const mu = mobius(n);
      const factors = factorize(n);
      // 约数和 等
      let divisorSum = 1;
      let tau = 1;
      for (const [p, e] of factors) {
        let s = 1, pe = 1;
        for (let i = 1; i <= e; i++) { pe *= p; s += pe; }
        divisorSum *= s;
        tau *= (e + 1);
      }
      let txt = `n = ${n}\n\n`;
      txt += `素因子分解: ${factors.map(([p, e]) => e === 1 ? p : `${p}^${e}`).join(' · ')}\n`;
      txt += `欧拉函数 φ(n) = ${phi}  (1..n中与n互素的数的个数)\n`;
      txt += `莫比乌斯函数 μ(n) = ${mu}\n`;
      txt += `约数个数 τ(n) = ${tau}\n`;
      txt += `约数和 σ(n) = ${divisorSum}\n\n`;
      txt += `小于等于 ${Math.min(n, 20)} 的 φ 值:\n`;
      for (let i = 1; i <= Math.min(n, 20); i++) {
        txt += `  φ(${i}) = ${eulerPhi(i)}\n`;
      }
      setNtResult(txt);
    } catch (e) {
      setNtError((e as Error).message || '计算错误');
      setNtResult('');
      toast.error('计算错误');
    }
  };

  // 11. 中国剩余定理
  const [crtInput, setCrtInput] = useState('2,3\n3,5\n2,7');
  const [crtResult, setCrtResult] = useState('');
  const [crtError, setCrtError] = useState<string | null>(null);

  const computeCRT = () => {
    setCrtError(null);
    try {
      const lines = crtInput.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const remainders: number[] = [];
      const moduli: number[] = [];
      for (const line of lines) {
        const parts = line.split(',').map(x => parseInt(x.trim()));
        remainders.push(parts[0]);
        moduli.push(parts[1]);
      }
      const congruences = remainders.map((a, i) => ({ a, m: moduli[i] }));
      const r = crtGeneral(congruences);
      let txt = '同余方程组:\n';
      for (let i = 0; i < lines.length; i++) {
        txt += `  x ≡ ${remainders[i]} (mod ${moduli[i]})\n`;
      }
      txt += '\n';
      if (r.solution === null) {
        txt += '❌ 方程组无解（模数不互素且矛盾）';
      } else {
        txt += `✅ 解: x ≡ ${r.solution} (mod ${r.modulus})\n`;
        txt += `最小非负解: ${r.solution}`;
      }
      setCrtResult(txt);
    } catch (e) {
      setCrtError((e as Error).message || '计算错误');
      setCrtResult('');
      toast.error('计算错误');
    }
  };

  // 12. 二次剩余
  const [qrA, setQrA] = useState('2');
  const [qrP, setQrP] = useState('7');
  const [qrResult, setQrResult] = useState('');
  const [qrError, setQrError] = useState<string | null>(null);

  const computeQuadratic = () => {
    setQrError(null);
    try {
      const a = parseInt(qrA), p = parseInt(qrP);
      const ls = legendreSymbol(a, p);
      const js = jacobiSymbol(a, p);
      let txt = `a = ${a}, p = ${p}\n\n`;
      txt += `勒让德符号 (a/p) = ${ls}\n`;
      if (ls === 1) txt += '  → a 是模 p 的二次剩余\n';
      else if (ls === -1) txt += '  → a 是模 p 的二次非剩余\n';
      else txt += '  → a 是 p 的倍数 (a ≡ 0 mod p)\n';

      txt += `\n雅可比符号 (a/n) = ${js} (当 n 是合数时的推广)\n\n`;

      if (ls === 1) {
        // 找出解
        const solutions: number[] = [];
        for (let x = 1; x < p; x++) {
          if ((x * x) % p === ((a % p) + p) % p) {
            solutions.push(x);
            if (solutions.length >= 2) break;
          }
        }
        if (solutions.length > 0) {
          txt += `方程 x² ≡ ${a} (mod ${p}) 的解:\n`;
          for (const x of solutions) txt += `  x ≡ ${x} (mod ${p})\n`;
        }
      }
      setQrResult(txt);
    } catch (e) {
      setQrError((e as Error).message || '计算错误');
      setQrResult('');
      toast.error('计算错误');
    }
  };

  // 13. 素性检测
  const [primeN, setPrimeN] = useState('561');
  const [primeResult, setPrimeResult] = useState('');
  const [primeError, setPrimeError] = useState<string | null>(null);

  const computePrimality = () => {
    setPrimeError(null);
    try {
      const n = parseInt(primeN);
      const isPrime = millerRabin(n, 7);
      // 试除法验证
      let isPrimeTrial = true;
      if (n < 2) isPrimeTrial = false;
      else {
        for (let i = 2; i * i <= n && i <= 100000; i++) {
          if (n % i === 0) { isPrimeTrial = false; break; }
        }
      }

      let txt = `n = ${n}\n\n`;
      txt += `Miller-Rabin 素性检测 (k=7轮):\n`;
      txt += `  结论: ${isPrime ? '✅ 可能是素数（通过所有基测试）' : '❌ 是合数'}\n\n`;
      txt += `试除法验证 (≤√n):\n`;
      txt += `  结论: ${isPrimeTrial ? '✅ 是素数' : '❌ 是合数'}\n\n`;

      if (!isPrime && n > 1) {
        // Pollard-rho 简化版：找一个因子
        const factor = findFactor(n);
        if (factor > 1) {
          txt += `找到因子: ${factor}\n`;
          txt += `n = ${factor} × ${Math.floor(n / factor)}`;
        }
      }

      if (n === 561) txt += `\n💡 561 = 3×11×17 是卡迈克尔数（最小的伪素数）`;
      if (n === 341) txt += `\n💡 341 = 11×31 是以 2 为底的伪素数`;
      setPrimeResult(txt);
    } catch (e) {
      setPrimeError((e as Error).message || '计算错误');
      setPrimeResult('');
      toast.error('计算错误');
    }
  };

  function findFactor(n: number): number {
    // 试除法找小因子
    for (let p = 2; p * p <= n && p <= 100000; p++) {
      if (n % p === 0) return p;
    }
    return n;
  }

  // 14. Nim博弈
  const [nimPiles, setNimPiles] = useState('3,4,5');
  const [nimResult, setNimResult] = useState('');
  const [nimError, setNimError] = useState<string | null>(null);

  const computeNim = () => {
    setNimError(null);
    try {
      const piles = nimPiles.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0);
      const r = nimGameWinner(piles);
      let txt = `堆大小: [${piles.join(', ')}]\n\n`;
      txt += `各堆二进制表示:\n`;
      for (let i = 0; i < piles.length; i++) {
        txt += `  堆${i}: ${piles[i]} = ${piles[i].toString(2).padStart(4, '0')}_2\n`;
      }
      txt += `\nNim和（异或）: ${r.xorSum} = ${r.xorSum.toString(2).padStart(4, '0')}_2\n\n`;
      txt += `先手方: ${r.winning ? '✅ 必胜' : '❌ 必败'}\n`;
      if (r.winning && r.winningMoves.length > 0) {
        txt += `\n必胜策略:\n`;
        for (const m of r.winningMoves) {
          txt += `  从堆${m.pile}取 ${m.take} 个，使 Nim和 = 0\n`;
        }
      }
      txt += `\n规则：每轮从任意一堆中取任意个，取到最后一个者胜。Nim和为0时先手必败。`;
      setNimResult(txt);
    } catch (e) {
      setNimError((e as Error).message || '计算错误');
      setNimResult('');
      toast.error('计算错误');
    }
  };

  // 15. 威佐夫博弈
  const [wythA, setWythA] = useState('3');
  const [wythB, setWythB] = useState('5');
  const [wythResult, setWythResult] = useState('');
  const [wythError, setWythError] = useState<string | null>(null);

  const computeWythoff = () => {
    setWythError(null);
    try {
      const a = parseInt(wythA), b = parseInt(wythB);
      const r = wythoffGame(a, b);
      const phi = (1 + Math.sqrt(5)) / 2;
      const k = Math.abs(a - b);
      const ak = Math.floor(k * phi);
      let txt = `两堆大小: (${a}, ${b})\n`;
      txt += `差值 k = ${k}\n\n`;
      txt += `黄金分割比 φ = (1+√5)/2 ≈ ${phi.toFixed(6)}\n`;
      txt += `第 k 个必败态: (⌊kφ⌋, ⌊kφ²⌋) = (${ak}, ${Math.floor(k * phi * phi)})\n\n`;
      txt += `当前状态: ${!r.losing ? '✅ 先手必胜' : '❌ 先手必败（奇异局势）'}\n`;
      if (!r.losing && r.move) {
        txt += `\n获胜走法:\n`;
        txt += `  从 ${r.move.from >= 0 ? '第' + r.move.from + '堆' : '两堆'} 取 ${r.move.take} 个${r.move.to !== undefined ? `，变为 (${Math.min(a - r.move.take, b)}, ${Math.max(a - r.move.take, b)})` : ''}\n`;
      }
      txt += `\n规则：两堆石子，可从一堆取任意个或从两堆取相同个，取最后者胜。`;
      setWythResult(txt);
    } catch (e) {
      setWythError((e as Error).message || '计算错误');
      setWythResult('');
      toast.error('计算错误');
    }
  };

  // 16. 置换群
  const [permInput, setPermInput] = useState('2,0,1,4,3');
  const [permResult, setPermResult] = useState('');
  const [permError, setPermError] = useState<string | null>(null);

  const computePermutation = () => {
    setPermError(null);
    try {
      const perm = permInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const n = perm.length;
      // 验证是否有效置换
      const sorted = [...perm].sort((a, b) => a - b);
      const valid = sorted.every((v, i) => v === i);
      if (!valid) throw new Error('无效置换：元素应为 0..n-1 的排列');

      const cycles = cycleDecomposition(perm);
      const order = permutationOrder(perm);
      const inv = inversePermutation(perm);
      const sign = permutationSign(perm);

      let txt = `置换 σ = (${perm.join(', ')})\n长度 n = ${n}\n\n`;
      txt += `轮换分解:\n`;
      cycles.forEach((c) => {
        txt += `  (${c.join(' ')})`;
      });
      txt += `\n\n轮换类型: ${cycles.map(c => c.length + '-循环').join(' + ')}\n`;
      txt += `置换的阶: ${order}  (各轮换长度的最小公倍数)\n`;
      txt += `置换的符号（奇偶性）: ${sign === 1 ? '偶置换 (1)' : '奇置换 (-1)'}\n`;
      txt += `逆置换 σ⁻¹ = (${inv.join(', ')})\n`;
      txt += `逆置换验证: σ(σ⁻¹(i)) = i ${verifyPerm(perm, inv) ? '✓' : '✗'}\n`;
      setPermResult(txt);
    } catch (e) {
      setPermError((e as Error).message || '计算错误');
      setPermResult('');
      toast.error('计算错误');
    }
  };

  function verifyPerm(sigma: number[], inv: number[]): boolean {
    for (let i = 0; i < sigma.length; i++) {
      if (sigma[inv[i]] !== i) return false;
    }
    return true;
  }

  // ---------- 17. 杨辉三角 ----------
  const [pascalN, setPascalN] = useState('10');
  const [pascalResult, setPascalResult] = useState('');
  const [pascalError, setPascalError] = useState<string | null>(null);

  const computePascal = () => {
    setPascalError(null);
    try {
      const n = parseInt(pascalN);
      if (n < 0 || n > 30) throw new Error('行数应在 0~30 之间');
      const r = pascalTriangle(n);
      const rows = r.rows;
      let txt = `杨辉三角（帕斯卡三角）前 ${rows.length} 行:\n\n`;
      const nRows = rows.length;
      const maxRow = rows[nRows - 1];
      const maxWid = maxRow.map(v => String(v).length).reduce((a, b) => Math.max(a, b), 1);
      for (let i = 0; i < nRows; i++) {
        const row = rows[i];
        const leftPad = ' '.repeat((nRows - 1 - i) * Math.ceil((maxWid + 1) / 2));
        txt += leftPad + row.map(v => String(v).padStart(maxWid + 1, ' ')).join('') + '\n';
      }
      txt += `\n性质:\n`;
      r.properties.forEach(p => { txt += `  • ${p}\n`; });
      setPascalResult(txt);
    } catch (e) {
      setPascalError((e as Error).message || '计算错误');
      setPascalResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 18. 整数分拆 ----------
  const [partN, setPartN] = useState('10');
  const [partResult, setPartResult] = useState('');
  const [partError, setPartError] = useState<string | null>(null);

  const computePartition = () => {
    setPartError(null);
    try {
      const n = parseInt(partN);
      if (n < 0 || n > 100) throw new Error('n 应在 0~100 之间');
      const r = integerPartition(n);
      let txt = `整数分拆 p(${n}) = ${r.p}\n\n`;
      txt += `（即将 ${n} 写成正整数之和的方式数，不计顺序）\n\n`;
      txt += `${r.note}\n\n`;
      if (r.partitions && r.partitions.length > 0 && r.partitions.length <= 50) {
        txt += `全部 ${r.partitions.length} 种分拆:\n`;
        r.partitions.forEach((p, i) => {
          txt += `  ${i + 1}. ${p.join(' + ')}\n`;
        });
      } else if (r.partitions && r.partitions.length > 50) {
        txt += `分拆数太多，仅展示前 10 种:\n`;
        r.partitions.slice(0, 10).forEach((p, i) => {
          txt += `  ${i + 1}. ${p.join(' + ')}\n`;
        });
        txt += `  ... 共 ${r.partitions.length} 种\n`;
      }
      setPartResult(txt);
    } catch (e) {
      setPartError((e as Error).message || '计算错误');
      setPartResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 19. 贝尔数 ----------
  const [bellN, setBellN] = useState('5');
  const [bellResult, setBellResult] = useState('');
  const [bellError, setBellError] = useState<string | null>(null);

  const computeBell = () => {
    setBellError(null);
    try {
      const n = parseInt(bellN);
      if (n < 0 || n > 20) throw new Error('n 应在 0~20 之间');
      const b = bellNumber(n);
      let txt = `B(${n}) = ${b}\n\n`;
      txt += `贝尔数：将 n 个元素的集合划分成若干非空子集的方式数。\n\n`;
      txt += `前 ${Math.min(n + 1, 10)} 项贝尔数:\n`;
      for (let i = 0; i <= Math.min(n, 9); i++) {
        txt += `  B(${i}) = ${bellNumber(i)}\n`;
      }
      txt += `\n贝尔三角形构造:\n`;
      txt += `  • 第一行首项 B₀ = 1\n`;
      txt += `  • 第 n+1 行首项 = 第 n 行末项\n`;
      txt += `  • 每行其他项 = 左上方 + 正上方\n`;
      txt += `Touchard 同余: B_{n+p} ≡ B_n + B_{n+1} (mod p)，p 为素数`;
      setBellResult(txt);
    } catch (e) {
      setBellError((e as Error).message || '计算错误');
      setBellResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 20. RSA 密码 ----------
  const [rsaP, setRsaP] = useState('61');
  const [rsaQ, setRsaQ] = useState('53');
  const [rsaE, setRsaE] = useState('17');
  const [rsaMsg, setRsaMsg] = useState('42');
  const [rsaResult, setRsaResult] = useState('');
  const [rsaError, setRsaError] = useState<string | null>(null);

  const computeRsa = () => {
    setRsaError(null);
    try {
      const p = parseInt(rsaP);
      const q = parseInt(rsaQ);
      const e = parseInt(rsaE);
      const m = parseInt(rsaMsg);
      const r = rsaDemo(p, q, e, m);
      let txt = `素数 p = ${p}, q = ${q}\n`;
      txt += `n = p·q = ${r.n}\n`;
      txt += `φ(n) = (p-1)(q-1) = ${r.phiN}\n`;
      txt += `公钥 e = ${r.e}\n`;
      txt += `私钥 d = ${r.d}\n\n`;
      txt += `明文 m = ${m}\n`;
      txt += `加密: c = m^e mod n = ${r.encrypted}\n`;
      txt += `解密: m = c^d mod n = ${r.decrypted}\n\n`;
      txt += `验证: ${r.decrypted === m ? '✅ 解密成功，明文还原' : '❌ 解密失败'}\n\n`;
      txt += `安全性基于大数分解困难性。RSA 是第一个公钥密码体制（1977）。\n\n`;
      txt += `步骤细节:\n`;
      r.steps.forEach((s, i) => { txt += `  ${i + 1}. ${s}\n`; });
      setRsaResult(txt);
    } catch (e) {
      setRsaError((e as Error).message || '计算错误');
      setRsaResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 21. 汉明码 ----------
  const [hamData, setHamData] = useState('1,0,1,1');
  const [hamReceived, setHamReceived] = useState('');
  const [hamResult, setHamResult] = useState('');
  const [hamError, setHamError] = useState<string | null>(null);
  const [hamMode, setHamMode] = useState<'encode' | 'decode'>('encode');

  const computeHamming = () => {
    setHamError(null);
    try {
      if (hamMode === 'encode') {
        const bits = hamData.split(',').map(s => parseInt(s.trim()));
        if (bits.length !== 4) throw new Error('请输入 4 位数据位');
        if (bits.some(b => b !== 0 && b !== 1)) throw new Error('数据位只能是 0 或 1');
        const r = hammingCode74(bits);
        let txt = `数据位: [${bits.join(', ')}]\n\n`;
        txt += `汉明 (7,4) 编码结果: [${r.encoded.join(', ')}]\n\n`;
        txt += `位置:        1  2  3  4  5  6  7\n`;
        txt += `内容:       ${r.encoded.join('  ')}\n`;
        txt += `校验位: p1(位1), p2(位2), p4(位4)\n`;
        txt += `数据位: d1(位3), d2(位5), d3(位6), d4(位7)\n\n`;
        txt += `${r.note}`;
        setHamResult(txt);
      } else {
        const bits = hamReceived.split(',').map(s => parseInt(s.trim()));
        if (bits.length !== 7) throw new Error('请输入 7 位码字');
        if (bits.some(b => b !== 0 && b !== 1)) throw new Error('码字只能是 0 或 1');
        const r = hammingDecode(bits);
        const sBin = r.syndrome.toString(2).padStart(3, '0');
        let txt = `接收码字: [${bits.join(', ')}]\n\n`;
        txt += `校验子 (syndrome) s = ${sBin}_2 = ${r.errorPosition}\n`;
        txt += `错误位置: ${r.errorPosition === 0 ? '无（无错）' : '第 ' + r.errorPosition + ' 位'}\n\n`;
        if (r.errorPosition > 0) {
          txt += `纠正后码字: [${r.corrected.join(', ')}]\n`;
        }
        txt += `\n译码后数据位: [${r.dataBits.join(', ')}]\n`;
        txt += `是否有效（无错或已纠正）: ${r.isValid ? '✅ 是' : '❌ 否（有错被纠正）'}\n\n`;
        txt += `${r.note}`;
        setHamResult(txt);
      }
    } catch (e) {
      setHamError((e as Error).message || '计算错误');
      setHamResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 22. 有限域 GF(p) ----------
  const [gfP, setGfP] = useState('5');
  const [gfA, setGfA] = useState('3');
  const [gfB, setGfB] = useState('4');
  const [gfResult, setGfResult] = useState('');
  const [gfError, setGfError] = useState<string | null>(null);

  const computeGF = () => {
    setGfError(null);
    try {
      const p = parseInt(gfP);
      const a = parseInt(gfA);
      const b = parseInt(gfB);
      const F = finiteFieldGFp(p);
      const ap = ((a % p) + p) % p;
      const bp = ((b % p) + p) % p;
      // 手工计算四则运算
      const add = (ap + bp) % p;
      const sub = ((ap - bp) % p + p) % p;
      const mul = (ap * bp) % p;
      let div = NaN, inv = NaN;
      if (bp !== 0) {
        // 求逆（扩展欧几里得）
        for (let i = 1; i < p; i++) if ((bp * i) % p === 1) { inv = i; break; }
        div = (ap * inv) % p;
      }
      // 幂
      function modPow(base: number, exp: number, mod: number): number {
        let result = 1;
        base = base % mod;
        while (exp > 0) {
          if (exp % 2 === 1) result = (result * base) % mod;
          exp = Math.floor(exp / 2);
          base = (base * base) % mod;
        }
        return result;
      }
      const pow3 = modPow(ap, 3, p);

      let txt = `有限域 GF(${p})\n`;
      txt += `特征 = ${p}，元素个数 = ${p}\n\n`;
      txt += `a = ${a} (mod ${p} 后 = ${ap}), b = ${b} (mod ${p} 后 = ${bp})\n\n`;
      txt += `加法: ${ap} + ${bp} ≡ ${add} (mod ${p})\n`;
      txt += `减法: ${ap} − ${bp} ≡ ${sub} (mod ${p})\n`;
      txt += `乘法: ${ap} × ${bp} ≡ ${mul} (mod ${p})\n`;
      if (bp !== 0) {
        txt += `除法: ${ap} ÷ ${bp} ≡ ${div} (mod ${p})\n`;
        txt += `       （${bp} 的乘法逆元 = ${inv}）\n`;
      } else {
        txt += `除法: 除以 0 无意义\n`;
      }
      txt += `幂: ${ap}^3 ≡ ${pow3} (mod ${p})\n\n`;
      txt += `${F.note}\n\n`;
      txt += `加法表 (${p}×${p}):\n`;
      F.addTable.forEach(row => { txt += `  ${row.join(' ')}\n`; });
      txt += `\n乘法表 (${p}×${p}):\n`;
      F.mulTable.forEach(row => { txt += `  ${row.join(' ')}\n`; });
      setGfResult(txt);
    } catch (e) {
      setGfError((e as Error).message || '计算错误');
      setGfResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 23. 线性规划 ----------
  const [lpObj, setLpObj] = useState('3, 2');
  const [lpA, setLpA] = useState('1, 1\n1, 2');
  const [lpB, setLpB] = useState('4, 5');
  const [lpResult, setLpResult] = useState('');
  const [lpError, setLpError] = useState<string | null>(null);

  const computeLP = () => {
    setLpError(null);
    try {
      const c = lpObj.split(',').map(s => parseFloat(s.trim()));
      const A = parseMatrix(lpA);
      const b = lpB.split(',').map(s => parseFloat(s.trim()));
      const constraints = A.map((row, i) => ({ a: row[0], b: row[1], rhs: b[i] }));
      const r = simplexTwoVar(c, constraints);
      let txt = `max z = ${c.map((v, i) => `${v}·x${i + 1}`).join(' + ')}\n\n`;
      txt += `约束:\n`;
      A.forEach((row, i) => {
        const terms = row.map((v, j) => `${v}·x${j + 1}`).join(' + ');
        txt += `  ${terms} ≤ ${b[i]}\n`;
      });
      txt += `  x₁, x₂ ≥ 0\n\n`;
      txt += `可行: ${r.feasible ? '✅ 是' : '❌ 否'}\n\n`;
      if (r.feasible) {
        txt += `最优解:\n`;
        r.optimal.forEach((v, i) => {
          txt += `  x*_${i + 1} = ${formatResult(v)}\n`;
        });
        txt += `  z* = ${formatResult(r.optimalValue)}\n\n`;
      }
      txt += `方法说明: ${r.note}\n\n`;
      txt += `迭代步骤:\n`;
      r.steps.forEach((s, i) => {
        txt += `  ${i + 1}. ${s}\n`;
      });
      setLpResult(txt);
    } catch (e) {
      setLpError((e as Error).message || '计算错误');
      setLpResult('');
      toast.error('计算错误');
    }
  };

  return (
    <div className="min-h-screen page-fade-in">
      <PageHeader
        title="现代数学"
        description="组合数学、图论算法、数论高级、博弈论、置换群——前沿数学工具集。"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-6xl mx-auto space-y-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap h-auto py-1">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-2 py-1.5 h-auto">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-5 space-y-4">
                {/* 1. 组合基础 */}
                <TabsContent value="combinatorics" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">n</label>
                      <Input value={combN} onChange={(e) => setCombN(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">k</label>
                      <Input value={combK} onChange={(e) => setCombK(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeCombinatorics} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />排列组合 + 杨辉恒等式
                  </Button>
                  <ResultBox text={combResult} error={combError} />
                </TabsContent>

                {/* 2. 错排问题 */}
                <TabsContent value="derangement" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">n</label>
                    <Input value={derN} onChange={(e) => setDerN(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeDerangement} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算错排数
                  </Button>
                  <ResultBox text={derResult} error={derError} />
                </TabsContent>

                {/* 3. 斯特林数 */}
                <TabsContent value="stirling" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">n</label>
                      <Input value={stirN} onChange={(e) => setStirN(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">k</label>
                      <Input value={stirK} onChange={(e) => setStirK(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeStirling} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />斯特林数 + 贝尔数
                  </Button>
                  <ResultBox text={stirResult} error={stirError} />
                </TabsContent>

                {/* 4. 容斥原理 */}
                <TabsContent value="inclusion" className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">|A|</label>
                      <Input value={incA} onChange={(e) => setIncA(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">|B|</label>
                      <Input value={incB} onChange={(e) => setIncB(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">|C|</label>
                      <Input value={incC} onChange={(e) => setIncC(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">|A∩B|</label>
                      <Input value={incAB} onChange={(e) => setIncAB(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">|A∩C|</label>
                      <Input value={incAC} onChange={(e) => setIncAC(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">|B∩C|</label>
                      <Input value={incBC} onChange={(e) => setIncBC(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">|A∩B∩C|</label>
                      <Input value={incABC} onChange={(e) => setIncABC(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeInclusion} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />三集合容斥原理
                  </Button>
                  <ResultBox text={incResult} error={incError} />
                </TabsContent>

                {/* 5. 递推关系 */}
                <TabsContent value="recurrence" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">c₁ (a_{'{n-1}'} 的系数)</label>
                      <Input value={recC1} onChange={(e) => setRecC1(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">c₂ (a_{'{n-2}'} 的系数)</label>
                      <Input value={recC2} onChange={(e) => setRecC2(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">a₁ (初值)</label>
                      <Input value={recA1} onChange={(e) => setRecA1(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">a₂ (初值)</label>
                      <Input value={recA2} onChange={(e) => setRecA2(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <div className="max-w-[120px]">
                    <label className="text-sm font-medium text-foreground mb-2 block">前 n 项</label>
                    <Input value={recN} onChange={(e) => setRecN(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeRecurrence} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />求解线性递推
                  </Button>
                  <ResultBox text={recResult} error={recError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>线性常系数二阶递推 a_n = c₁·a_{'{n-1}'} + c₂·a_{'{n-2}'}，用特征方程法求解通项公式。</span>
                  </div>
                </TabsContent>

                {/* 6. 卡特兰数 */}
                <TabsContent value="catalan" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">n</label>
                    <Input value={catN} onChange={(e) => setCatN(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeCatalan} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算卡特兰数
                  </Button>
                  <ResultBox text={catResult} error={catError} />
                </TabsContent>

                {/* 7. 勾股数 */}
                <TabsContent value="pythagorean" className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-1">
                      <label className="text-sm font-medium text-foreground mb-2 block">组数</label>
                      <Input value={pythN} onChange={(e) => setPythN(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">a</label>
                      <Input value={pythCheckA} onChange={(e) => setPythCheckA(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">b</label>
                      <Input value={pythCheckB} onChange={(e) => setPythCheckB(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">c</label>
                      <Input value={pythCheckC} onChange={(e) => setPythCheckC(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computePythagorean} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />勾股数判定 + 生成本原勾股数
                  </Button>
                  <ResultBox text={pythResult} error={pythError} />
                </TabsContent>

                {/* 8. 图论算法 */}
                <TabsContent value="graphAlgo" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">邻接矩阵</label>
                    <Textarea value={gaMatrix} onChange={(e) => setGaMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <div className="max-w-[120px]">
                    <label className="text-sm font-medium text-foreground mb-2 block">起点</label>
                    <Input value={gaStart} onChange={(e) => setGaStart(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeGraphAlgo} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />DFS/BFS/拓扑排序/SCC
                  </Button>
                  <ResultBox text={gaResult} error={gaError} />
                </TabsContent>

                {/* 9. 网络流 */}
                <TabsContent value="networkFlow" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">容量矩阵</label>
                    <Textarea value={nfMatrix} onChange={(e) => setNfMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">源点</label>
                      <Input value={nfSource} onChange={(e) => setNfSource(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">汇点</label>
                      <Input value={nfSink} onChange={(e) => setNfSink(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeMaxFlow} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />Ford-Fulkerson 最大流
                  </Button>
                  <ResultBox text={nfResult} error={nfError} />
                </TabsContent>

                {/* 10. 数论高级 */}
                <TabsContent value="numberTheory" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">n</label>
                    <Input value={ntN} onChange={(e) => setNtN(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeNumberTheory} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />欧拉函数 + 莫比乌斯 + 约数
                  </Button>
                  <ResultBox text={ntResult} error={ntError} />
                </TabsContent>

                {/* 11. 中国剩余 */}
                <TabsContent value="crt" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">同余方程组（每行 a,m 表示 x ≡ a (mod m)）</label>
                    <Textarea value={crtInput} onChange={(e) => setCrtInput(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeCRT} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />CRT 求解（支持非互素模）
                  </Button>
                  <ResultBox text={crtResult} error={crtError} />
                </TabsContent>

                {/* 12. 二次剩余 */}
                <TabsContent value="quadratic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">a</label>
                      <Input value={qrA} onChange={(e) => setQrA(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">p (奇素数)</label>
                      <Input value={qrP} onChange={(e) => setQrP(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeQuadratic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />勒让德/雅可比符号
                  </Button>
                  <ResultBox text={qrResult} error={qrError} />
                </TabsContent>

                {/* 13. 素性检测 */}
                <TabsContent value="primality" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">n</label>
                    <Input value={primeN} onChange={(e) => setPrimeN(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computePrimality} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />Miller-Rabin 素性检测
                  </Button>
                  <ResultBox text={primeResult} error={primeError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>对于 n &lt; 2^64，使用确定性基 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37 可保证结果正确。</span>
                  </div>
                </TabsContent>

                {/* 14. Nim博弈 */}
                <TabsContent value="nim" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">各堆石子数（逗号分隔）</label>
                    <Input value={nimPiles} onChange={(e) => setNimPiles(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeNim} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />Nim 游戏分析
                  </Button>
                  <ResultBox text={nimResult} error={nimError} />
                </TabsContent>

                {/* 15. 威佐夫博弈 */}
                <TabsContent value="wythoff" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">第一堆</label>
                      <Input value={wythA} onChange={(e) => setWythA(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">第二堆</label>
                      <Input value={wythB} onChange={(e) => setWythB(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeWythoff} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />威佐夫博弈分析
                  </Button>
                  <ResultBox text={wythResult} error={wythError} />
                </TabsContent>

                {/* 16. 置换群 */}
                <TabsContent value="permutation" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">置换 σ（索引从0开始，逗号分隔）</label>
                    <Input value={permInput} onChange={(e) => setPermInput(e.target.value)} className="font-mono" placeholder="如 2,0,1,4,3" />
                  </div>
                  <Button onClick={computePermutation} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />置换分析（轮换/阶/符号/逆）
                  </Button>
                  <ResultBox text={permResult} error={permError} />
                </TabsContent>

                {/* 17. 杨辉三角 */}
                <TabsContent value="pascal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">显示前 n 行</label>
                      <Input value={pascalN} onChange={(e) => setPascalN(e.target.value)} className="font-mono w-24" />
                      <p className="text-xs text-muted-foreground mt-1">推荐 0~30 行</p>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={computePascal} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                        <Play className="size-4 mr-2" />生成杨辉三角
                      </Button>
                    </div>
                  </div>
                  <ResultBox text={pascalResult} error={pascalError} />
                </TabsContent>

                {/* 18. 整数分拆 */}
                <TabsContent value="integerPartition" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">整数 n</label>
                      <Input value={partN} onChange={(e) => setPartN(e.target.value)} className="font-mono w-24" />
                      <p className="text-xs text-muted-foreground mt-1">0 ≤ n ≤ 100</p>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={computePartition} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                        <Play className="size-4 mr-2" />计算 p(n)
                      </Button>
                    </div>
                  </div>
                  <ResultBox text={partResult} error={partError} />
                  <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 border border-border">
                    <p className="font-medium text-foreground mb-1">💡 整数分拆</p>
                    <p>p(n)：将 n 表示为若干正整数之和的方式数（不计顺序）。欧拉生成函数：∏1/(1-x^k) = Σ p(n) x^n</p>
                  </div>
                </TabsContent>

                {/* 19. 贝尔数 */}
                <TabsContent value="bell" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">n</label>
                      <Input value={bellN} onChange={(e) => setBellN(e.target.value)} className="font-mono w-24" />
                      <p className="text-xs text-muted-foreground mt-1">0 ≤ n ≤ 20</p>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={computeBell} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                        <Play className="size-4 mr-2" />计算贝尔数 B(n)
                      </Button>
                    </div>
                  </div>
                  <ResultBox text={bellResult} error={bellError} />
                </TabsContent>

                {/* 20. RSA密码 */}
                <TabsContent value="rsa" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">素数 p</label>
                      <Input value={rsaP} onChange={(e) => setRsaP(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">素数 q</label>
                      <Input value={rsaQ} onChange={(e) => setRsaQ(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">公钥 e</label>
                      <Input value={rsaE} onChange={(e) => setRsaE(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">明文 m</label>
                      <Input value={rsaMsg} onChange={(e) => setRsaMsg(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeRsa} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Lock className="size-4 mr-2" />RSA 加密 + 解密
                  </Button>
                  <ResultBox text={rsaResult} error={rsaError} />
                </TabsContent>

                {/* 21. 汉明码 */}
                <TabsContent value="hamming" className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant={hamMode === 'encode' ? 'default' : 'secondary'} onClick={() => setHamMode('encode')} className={hamMode === 'encode' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}>
                      编码 (7,4)
                    </Button>
                    <Button variant={hamMode === 'decode' ? 'default' : 'secondary'} onClick={() => setHamMode('decode')} className={hamMode === 'decode' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}>
                      解码 + 纠错
                    </Button>
                  </div>
                  {hamMode === 'encode' ? (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">4 位数据位（逗号分隔）</label>
                      <Input value={hamData} onChange={(e) => setHamData(e.target.value)} className="font-mono" placeholder="1,0,1,1" />
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">7 位接收码字（逗号分隔）</label>
                      <Input value={hamReceived} onChange={(e) => setHamReceived(e.target.value)} className="font-mono" placeholder="0,1,1,0,0,1,1" />
                    </div>
                  )}
                  <Button onClick={computeHamming} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />{hamMode === 'encode' ? '汉明编码' : '汉明译码纠错'}
                  </Button>
                  <ResultBox text={hamResult} error={hamError} />
                </TabsContent>

                {/* 22. 有限域 */}
                <TabsContent value="finiteField" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">素数 p（域特征）</label>
                      <Input value={gfP} onChange={(e) => setGfP(e.target.value)} className="font-mono" placeholder="5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">元素 a</label>
                      <Input value={gfA} onChange={(e) => setGfA(e.target.value)} className="font-mono" placeholder="3" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">元素 b</label>
                      <Input value={gfB} onChange={(e) => setGfB(e.target.value)} className="font-mono" placeholder="4" />
                    </div>
                  </div>
                  <Button onClick={computeGF} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 GF(p) 四则运算
                  </Button>
                  <ResultBox text={gfResult} error={gfError} />
                </TabsContent>

                {/* 23. 线性规划 */}
                <TabsContent value="linearProgram" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">目标函数系数 c (max z = c₁x₁ + c₂x₂)</label>
                    <Input value={lpObj} onChange={(e) => setLpObj(e.target.value)} className="font-mono" placeholder="3, 2" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">约束系数矩阵 A（每行一个约束）</label>
                      <Textarea value={lpA} onChange={(e) => setLpA(e.target.value)} className="font-mono min-h-[80px]" placeholder="1,1\n1,2" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">约束右端 b</label>
                      <Textarea value={lpB} onChange={(e) => setLpB(e.target.value)} className="font-mono min-h-[80px]" placeholder="4,5" />
                      <p className="text-xs text-muted-foreground mt-1">两变量线性规划，约束 ≤ 形式，x₁,x₂ ≥ 0</p>
                    </div>
                  </div>
                  <Button onClick={computeLP} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />单纯形法求解
                  </Button>
                  <ResultBox text={lpResult} error={lpError} />
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
          onSelect={() => {}}
          theme="mint"
          className="mb-4"
        />

      </div>

      <CheatsheetDialog moduleKey="modern" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
