import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import MathInputField from '@/components/MathInputField';
import { Textarea } from '@/components/ui/textarea';
import PageShell from '@/components/PageShell';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Info, Calculator, Type } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import { toast } from 'sonner';
import { useHistory } from '@/hooks/useHistory';
import HistoryPanel from '@/components/HistoryPanel';
import {
  evaluateLogic,
  logicalEquivalence,
  principalDNF,
  principalCNF,
  isValidInference,
  setSymmetricDifference,
  setPowerSet,
  setCartesianProduct,
  relationProperties,
  reflexiveClosure,
  symmetricClosure,
  transitiveClosureWarshall,
  equivalenceClasses,
  isEquivalenceRelation,
  partialOrderAnalysis,
  hasseDiagram,
  graphDegreeSequence,
  graphConnectedComponents,
  hasEulerianPath,
  diracTheoremCheck,
  isBipartiteGraph,
  primMST,
  kruskalMST,
  isTree,
  treeLeaves,
  treeCenter,
  planarCheckEuler,
  bfsTraversal,
  dfsTraversal,
  topologicalSort,
  stronglyConnectedComponents,
  checkGroupProperties,
  isLattice,
  prenexNormalForm,
  relationComposition,
  ringCheck,
  adjMatrixPower,
  criticalPath,
  generatingFunctionExpand,
} from '@/lib/math-advanced';
import { formatResult } from '@/lib/math-utils';

const TABS = [
  // 逻辑
  { value: 'truthTable', label: '真值表' },
  { value: 'equivalence', label: '逻辑等价' },
  { value: 'normalForm', label: '主范式' },
  { value: 'inference', label: '推理规则' },
  // 集合
  { value: 'setOps', label: '集合运算' },
  { value: 'relationProps', label: '关系性质' },
  { value: 'relationClosure', label: '关系闭包' },
  { value: 'equivalenceRel', label: '等价关系' },
  { value: 'partialOrder', label: '偏序与哈斯图' },
  // 图论
  { value: 'graphBasic', label: '图基本参数' },
  { value: 'eulerHamilton', label: '欧拉图/哈密顿' },
  { value: 'shortestPath', label: '最短路径' },
  { value: 'mst', label: '最小生成树' },
  { value: 'bipartite', label: '二部图' },
  { value: 'planar', label: '平面图' },
  { value: 'tree', label: '树' },
  { value: 'traversal', label: 'DFS/BFS' },
  { value: 'topoScc', label: '拓扑/强连通' },
  // 代数结构
  { value: 'groupCheck', label: '群判定' },
  { value: 'lattice', label: '格与布尔' },
  { value: 'prenex', label: '前束范式' },
  { value: 'relationComp', label: '关系复合' },
  { value: 'ringField', label: '环/域判定' },
  { value: 'adjPower', label: '邻接矩阵幂' },
  { value: 'criticalPath', label: '关键路径' },
  { value: 'genFunc', label: '母函数展开' },
];

// 工具：解析矩阵字符串
function parseMatrix(str: string): number[][] {
  const rows = str.trim().split(/[\n;]/).map(r => r.trim()).filter(r => r.length > 0);
  return rows.map(row =>
    row.split(/[, \t]+/).map(c => parseInt(c.trim())).filter(c => !isNaN(c))
  );
}

function formatMatrix(m: number[][]): string {
  return m.map(row => row.join(' ')).join('\n');
}

// 结果框
function ResultBox({ text, error }: { text: string; error: string | null }) {
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted');
  return (
    <>
      {text && (
        <div className="board-surface board-surface bg-[var(--board-bg)] rounded-xl p-4">
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

export default function DiscreteMathPage() {
  const [activeTab, setActiveTab] = useState('truthTable');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_discrete_history' });
  const lastResultRef = useRef('');

  // ---------- 1. 真值表 ----------
  const [ttExpr, setTtExpr] = useState('p and q or not r');
  const [ttResult, setTtResult] = useState('');

  // 监听真值表结果变化，自动记录历史
  useEffect(() => {
    if (ttResult && ttResult !== lastResultRef.current) {
      addItem(activeTab, ttResult);
      lastResultRef.current = ttResult;
    }
  }, [ttResult, activeTab, addItem]);
  const [ttError, setTtError] = useState<string | null>(null);

  const computeTruthTable = () => {
    setTtError(null);
    try {
      // 提取变量
      const matches = ttExpr.match(/\b([a-z][a-zA-Z0-9]*)\b/g) || [];
      const keywords = new Set(['and', 'or', 'not', 'xor', 'true', 'false', 'nand', 'nor', 'implies', 'iff']);
      const vars: string[] = [];
      const seen = new Set<string>();
      for (const m of matches) {
        if (!keywords.has(m) && !/^\d+$/.test(m) && !seen.has(m)) {
          seen.add(m);
          vars.push(m);
        }
      }
      vars.sort();
      const n = vars.length;
      if (n > 10) throw new Error('变量过多（最多 10 个）');
      let txt = `命题公式: ${ttExpr}\n变量: ${vars.join(', ')}\n\n`;
      txt += vars.join(' | ') + ' | 结果\n';
      txt += '-'.repeat(vars.length * 4 + 6) + '\n';
      let trueCount = 0;
      for (let i = 0; i < (1 << n); i++) {
        const assignment: Record<string, boolean> = {};
        const row: string[] = [];
        for (let j = 0; j < n; j++) {
          const val = Boolean((i >> (n - 1 - j)) & 1);
          assignment[vars[j]] = val;
          row.push(val ? 'T' : 'F');
        }
        const result = evaluateLogic(ttExpr, assignment);
        if (result) trueCount++;
        row.push(result ? 'T' : 'F');
        txt += row.join(' | ') + '\n';
      }
      txt += `\n真值指派总数: ${1 << n}\n`;
      txt += `成真指派: ${trueCount}\n`;
      if (trueCount === 0) txt += '类型: 永假式（矛盾式）';
      else if (trueCount === (1 << n)) txt += '类型: 永真式（重言式）';
      else txt += '类型: 可满足式';
      setTtResult(txt);
    } catch (e) {
      setTtError((e as Error).message || '计算错误');
      setTtResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 2. 逻辑等价 ----------
  const [eq1, setEq1] = useState('not (p and q)');
  const [eq2, setEq2] = useState('not p or not q');
  const [eqResult, setEqResult] = useState('');
  const [eqError, setEqError] = useState<string | null>(null);

  const computeEquivalence = () => {
    setEqError(null);
    try {
      const r = logicalEquivalence(eq1, eq2);
      let txt = `公式1: ${eq1}\n公式2: ${eq2}\n变量: ${r.vars.join(', ')}\n\n`;
      if (r.equivalent) {
        txt += '✅ 两个公式逻辑等价（重言式）';
      } else {
        txt += '❌ 两个公式不等价\n\n';
        txt += '反例（使得公式1和公式2真值不同）:\n';
        if (r.counterexample) {
          for (const v of r.vars) {
            txt += `  ${v} = ${r.counterexample[v] ? 'T' : 'F'}\n`;
          }
        }
      }
      setEqResult(txt);
    } catch (e) {
      setEqError((e as Error).message || '计算错误');
      setEqResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 3. 主范式 ----------
  const [nfExpr, setNfExpr] = useState('p and (q or r)');
  const [nfResult, setNfResult] = useState('');
  const [nfError, setNfError] = useState<string | null>(null);

  const computeNormalForm = () => {
    setNfError(null);
    try {
      const dnf = principalDNF(nfExpr);
      const cnf = principalCNF(nfExpr);
      let txt = `公式: ${nfExpr}\n变量: ${dnf.vars.join(', ')}\n\n`;
      txt += `【主析取范式 (DNF)】\n${dnf.dnf}\n\n`;
      txt += `小项数: ${dnf.minterms.length}\n\n`;
      txt += `【主合取范式 (CNF)】\n${cnf.cnf}\n\n`;
      txt += `大项数: ${cnf.maxterms.length}`;
      setNfResult(txt);
    } catch (e) {
      setNfError((e as Error).message || '计算错误');
      setNfResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 4. 推理规则 ----------
  const [infPremises, setInfPremises] = useState('p -> q\np');
  const [infConclusion, setInfConclusion] = useState('q');
  const [infResult, setInfResult] = useState('');
  const [infError, setInfError] = useState<string | null>(null);

  const computeInference = () => {
    setInfError(null);
    try {
      const premises = infPremises.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      const r = isValidInference(premises, infConclusion);
      let txt = '前提:\n';
      premises.forEach((p, i) => { txt += `  ${i + 1}. ${p}\n`; });
      txt += `结论: ${infConclusion}\n\n`;
      if (r.valid) {
        txt += '✅ 推理有效（前提全真时结论必真）';
      } else {
        txt += '❌ 推理无效\n\n反例:\n';
        if (r.counterexample) {
          for (const v of r.vars) {
            txt += `  ${v} = ${r.counterexample[v] ? 'T' : 'F'}\n`;
          }
        }
      }
      setInfResult(txt);
    } catch (e) {
      setInfError((e as Error).message || '计算错误');
      setInfResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 5. 集合运算 ----------
  const [setA, setSetA] = useState('1,2,3,4');
  const [setB, setSetB] = useState('3,4,5,6');
  const [setResult, setSetResult] = useState('');
  const [setError, setSetError] = useState<string | null>(null);

  const computeSetOps = () => {
    setSetError(null);
    try {
      const a = setA.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const b = setB.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const sa = new Set(a);
      const sb = new Set(b);
      const union = Array.from(new Set([...sa, ...sb])).sort((x, y) => x - y);
      const inter = Array.from(sa).filter(x => sb.has(x)).sort((x, y) => x - y);
      const diff = Array.from(sa).filter(x => !sb.has(x)).sort((x, y) => x - y);
      const symDiff = setSymmetricDifference(a, b);
      const cartProd = setCartesianProduct(a.slice(0, 6), b.slice(0, 6)); // 限制数量
      const powerSet = setPowerSet(a.slice(0, 6)); // 限制数量

      let txt = `A = {${Array.from(sa).sort((x, y) => x - y).join(', ')}}\n`;
      txt += `B = {${Array.from(sb).sort((x, y) => x - y).join(', ')}}\n\n`;
      txt += `A ∪ B = {${union.join(', ')}}  (|A∪B| = ${union.length})\n`;
      txt += `A ∩ B = {${inter.join(', ')}}  (|A∩B| = ${inter.length})\n`;
      txt += `A − B = {${diff.join(', ')}}\n`;
      txt += `A △ B = {${symDiff.join(', ')}}  (对称差)\n`;
      txt += `|A × B| = ${sa.size * sb.size}  (笛卡尔积)\n`;
      if (cartProd.length <= 30) {
        txt += `A × B = {${cartProd.map(([x, y]) => `(${x},${y})`).join(', ')}}\n`;
      }
      txt += `|P(A)| = 2^${sa.size} = ${Math.pow(2, sa.size)}  (幂集)\n`;
      if (powerSet.length <= 32) {
        txt += `P(A) = {${powerSet.map(s => `{${s.join(',')}}`).join(', ')}}`;
      }
      setSetResult(txt);
    } catch (e) {
      setSetError((e as Error).message || '计算错误');
      setSetResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 6. 关系性质 ----------
  const [relMatrix, setRelMatrix] = useState('1,1,0\n1,1,1\n0,0,1');
  const [relResult, setRelResult] = useState('');
  const [relError, setRelError] = useState<string | null>(null);

  const computeRelationProps = () => {
    setRelError(null);
    try {
      const m = parseMatrix(relMatrix);
      const r = relationProperties(m);
      let txt = '关系矩阵 M:\n' + formatMatrix(m) + '\n\n';
      txt += '性质判断:\n';
      txt += `  自反性: ${r.reflexive ? '✓ 是' : '✗ 否'}\n`;
      txt += `  反自反性: ${r.irreflexive ? '✓ 是' : '✗ 否'}\n`;
      txt += `  对称性: ${r.symmetric ? '✓ 是' : '✗ 否'}\n`;
      txt += `  反对称性: ${r.antisymmetric ? '✓ 是' : '✗ 否'}\n`;
      txt += `  传递性: ${r.transitive ? '✓ 是' : '✗ 否'}\n`;
      if (r.reflexive && r.symmetric && r.transitive) txt += '\n✅ 这是一个等价关系';
      if (r.reflexive && r.antisymmetric && r.transitive) txt += '\n✅ 这是一个偏序关系';
      setRelResult(txt);
    } catch (e) {
      setRelError((e as Error).message || '计算错误');
      setRelResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 7. 关系闭包 ----------
  const [closureMatrix, setClosureMatrix] = useState('1,0,0\n0,0,1\n0,0,0');
  const [closureResult, setClosureResult] = useState('');
  const [closureError, setClosureError] = useState<string | null>(null);

  const computeClosures = () => {
    setClosureError(null);
    try {
      const m = parseMatrix(closureMatrix);
      const r = reflexiveClosure(m);
      const s = symmetricClosure(m);
      const t = transitiveClosureWarshall(m);
      let txt = '原关系矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += '【自反闭包 r(R)】\n' + formatMatrix(r) + '\n\n';
      txt += '【对称闭包 s(R)】\n' + formatMatrix(s) + '\n\n';
      txt += '【传递闭包 t(R)】（Warshall 算法）\n' + formatMatrix(t);
      setClosureResult(txt);
    } catch (e) {
      setClosureError((e as Error).message || '计算错误');
      setClosureResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 8. 等价关系 ----------
  const [eqRelMatrix, setEqRelMatrix] = useState('1,1,0,0\n1,1,0,0\n0,0,1,1\n0,0,1,1');
  const [eqRelResult, setEqRelResult] = useState('');
  const [eqRelError, setEqRelError] = useState<string | null>(null);

  const computeEquivalenceRel = () => {
    setEqRelError(null);
    try {
      const m = parseMatrix(eqRelMatrix);
      const isEq = isEquivalenceRelation(m);
      const classes = equivalenceClasses(m);
      let txt = '关系矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += `是否等价关系: ${isEq ? '✅ 是' : '❌ 否'}\n\n`;
      txt += `等价类个数: ${classes.length}\n`;
      classes.forEach((cls) => {
        txt += `  [${cls[0]}] = {${cls.join(', ')}}\n`;
      });
      txt += `\n商集 A/R = {${classes.map((_, i) => `[${classes[i][0]}]`).join(', ')}}`;
      setEqRelResult(txt);
    } catch (e) {
      setEqRelError((e as Error).message || '计算错误');
      setEqRelResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 9. 偏序与哈斯图 ----------
  const [poMatrix, setPoMatrix] = useState('1,1,1,1\n0,1,0,1\n0,0,1,1\n0,0,0,1');
  const [poResult, setPoResult] = useState('');
  const [poError, setPoError] = useState<string | null>(null);

  const computePartialOrder = () => {
    setPoError(null);
    try {
      const m = parseMatrix(poMatrix);
      const r = partialOrderAnalysis(m);
      const edges = hasseDiagram(m);
      let txt = '偏序集关系矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += `是否偏序关系: ${r.isPartialOrder ? '✅ 是' : '❌ 否'}\n\n`;
      txt += `极大元: {${r.maximal.join(', ')}}\n`;
      txt += `极小元: {${r.minimal.join(', ')}}\n`;
      txt += `最大元: ${r.greatest !== null ? r.greatest : '不存在'}\n`;
      txt += `最小元: ${r.least !== null ? r.least : '不存在'}\n`;
      txt += `上界: {${r.upperBounds.join(', ')}}\n`;
      txt += `下界: {${r.lowerBounds.join(', ')}}\n\n`;
      txt += `哈斯图边数: ${edges.edges.length}\n`;
      edges.edges.forEach(([u, v]) => {
        txt += `  ${u} → ${v}\n`;
      });
      setPoResult(txt);
    } catch (e) {
      setPoError((e as Error).message || '计算错误');
      setPoResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 10. 图基本参数 ----------
  const [gBasicMatrix, setGBasicMatrix] = useState('0,1,1,0\n1,0,1,1\n1,1,0,1\n0,1,1,0');
  const [gBasicResult, setGBasicResult] = useState('');
  const [gBasicError, setGBasicError] = useState<string | null>(null);

  const computeGraphBasic = () => {
    setGBasicError(null);
    try {
      const m = parseMatrix(gBasicMatrix);
      const { degrees, edgeCount, isSimple } = graphDegreeSequence(m);
      const components = graphConnectedComponents(m);
      let txt = '邻接矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += `顶点数 V = ${m.length}\n`;
      txt += `边数 E = ${edgeCount}\n`;
      txt += `各顶点度数: [${degrees.join(', ')}]\n`;
      txt += `总度数和 = ${degrees.reduce((a, b) => a + b, 0)} (握手定理: 2E = ${2 * edgeCount})\n`;
      txt += `奇度顶点数 = ${degrees.filter(d => d % 2 !== 0).length}\n`;
      txt += `是否简单图: ${isSimple ? '是' : '否（含自环或重边）'}\n`;
      txt += `连通分量数: ${components.count}\n`;
      txt += `是否连通图: ${components.count === 1 ? '是' : '否'}`;
      setGBasicResult(txt);
    } catch (e) {
      setGBasicError((e as Error).message || '计算错误');
      setGBasicResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 11. 欧拉图/哈密顿图 ----------
  const [ehMatrix, setEhMatrix] = useState('0,1,1,1,1,1\n1,0,1,1,1,1\n1,1,0,1,1,1\n1,1,1,0,1,1\n1,1,1,1,0,1\n1,1,1,1,1,0');
  const [ehResult, setEhResult] = useState('');
  const [ehError, setEhError] = useState<string | null>(null);

  const computeEulerHamilton = () => {
    setEhError(null);
    try {
      const m = parseMatrix(ehMatrix);
      const ep = hasEulerianPath(m);
      const dirac = diracTheoremCheck(m);
      let txt = '邻接矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += '【欧拉相关】\n';
      txt += `  奇度顶点数: ${ep.oddDegreeCount}\n`;
      txt += `  欧拉回路: ${ep.hasCircuit ? '✅ 存在（所有顶点度数为偶数且连通）' : '❌ 不存在'}\n`;
      txt += `  欧拉通路: ${ep.hasPath ? '✅ 存在（0或2个奇度顶点）' : '❌ 不存在'}\n\n`;
      txt += '【哈密顿相关】\n';
      txt += `  顶点数 n = ${dirac.n}\n`;
      txt += `  最小度数 δ = ${dirac.minDegree}\n`;
      txt += `  狄拉克定理条件 (δ ≥ n/2): ${dirac.satisfiesDirac ? '✓ 满足' : '✗ 不满足'}\n`;
      txt += `  结论: ${dirac.isHamiltonian === 'yes' ? '✅ 是哈密顿图（狄拉克定理保证）' : '⚠️ 无法确定（狄拉克定理仅是充分条件）'}`;
      setEhResult(txt);
    } catch (e) {
      setEhError((e as Error).message || '计算错误');
      setEhResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 12. 最短路径 Dijkstra ----------
  const [spMatrix, setSpMatrix] = useState('0,7,9,0,0,14\n7,0,10,15,0,0\n9,10,0,11,0,2\n0,15,11,0,6,0\n0,0,0,6,0,9\n14,0,2,0,9,0');
  const [spStart, setSpStart] = useState('0');
  const [spResult, setSpResult] = useState('');
  const [spError, setSpError] = useState<string | null>(null);

  const computeShortestPath = () => {
    setSpError(null);
    try {
      const m = parseMatrix(spMatrix);
      const start = parseInt(spStart);
      const n = m.length;
      // Dijkstra
      const dist = new Array(n).fill(Infinity);
      const prev = new Array(n).fill(-1);
      const visited = new Array(n).fill(false);
      dist[start] = 0;
      for (let count = 0; count < n - 1; count++) {
        let u = -1, minD = Infinity;
        for (let v = 0; v < n; v++) {
          if (!visited[v] && dist[v] < minD) { minD = dist[v]; u = v; }
        }
        if (u === -1) break;
        visited[u] = true;
        for (let v = 0; v < n; v++) {
          if (m[u][v] > 0 && !visited[v] && dist[u] + m[u][v] < dist[v]) {
            dist[v] = dist[u] + m[u][v];
            prev[v] = u;
          }
        }
      }
      let txt = `带权邻接矩阵 (${n}×${n}):\n起点: v${start}\n\n`;
      txt += '顶点 | 最短距离 | 路径\n';
      txt += '------------------------\n';
      for (let v = 0; v < n; v++) {
        // 重建路径
        const path: number[] = [];
        let cur = v;
        while (cur !== -1) { path.unshift(cur); cur = prev[cur]; }
        const distStr = dist[v] === Infinity ? '∞' : String(dist[v]);
        const pathStr = dist[v] === Infinity ? '不可达' : path.join(' → ');
        txt += `v${v}    | ${distStr.padEnd(7)} | ${pathStr}\n`;
      }
      setSpResult(txt);
    } catch (e) {
      setSpError((e as Error).message || '计算错误');
      setSpResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 13. 最小生成树 ----------
  const [mstMatrix, setMstMatrix] = useState('0,2,0,6,0\n2,0,3,8,5\n0,3,0,0,7\n6,8,0,0,9\n0,5,7,9,0');
  const [mstResult, setMstResult] = useState('');
  const [mstError, setMstError] = useState<string | null>(null);

  const computeMST = () => {
    setMstError(null);
    try {
      const m = parseMatrix(mstMatrix);
      const prim = primMST(m);
      const kruskal = kruskalMST(m);
      let txt = '带权邻接矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += '【Prim 算法】\n';
      txt += `总权重: ${prim.totalWeight}\n`;
      txt += `边: ${prim.mst.map(([u, v, w]) => `v${u}-v${v}(${w})`).join(', ')}\n\n`;
      txt += '【Kruskal 算法】\n';
      txt += `总权重: ${kruskal.totalWeight}\n`;
      txt += `边: ${kruskal.mst.map(([u, v, w]) => `v${u}-v${v}(${w})`).join(', ')}\n\n`;
      txt += `两种算法结果${prim.totalWeight === kruskal.totalWeight ? '一致 ✓' : '不一致 ✗'}`;
      setMstResult(txt);
    } catch (e) {
      setMstError((e as Error).message || '计算错误');
      setMstResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 14. 二部图 ----------
  const [bpMatrix, setBpMatrix] = useState('0,1,1,0,0,0\n1,0,1,1,0,0\n1,1,0,0,1,0\n0,1,0,0,1,1\n0,0,1,1,0,1\n0,0,0,1,1,0');
  const [bpResult, setBpResult] = useState('');
  const [bpError, setBpError] = useState<string | null>(null);

  const computeBipartite = () => {
    setBpError(null);
    try {
      const m = parseMatrix(bpMatrix);
      const r = isBipartiteGraph(m);
      let txt = '邻接矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += `是否二部图: ${r.bipartite ? '✅ 是' : '❌ 否（含奇环）'}\n`;
      if (r.bipartite && r.partitions && r.partitions.length === 2) {
        txt += `划分 X = {${r.partitions[0].map(v => 'v' + v).join(', ')}}\n`;
        txt += `划分 Y = {${r.partitions[1].map(v => 'v' + v).join(', ')}}\n`;
        txt += `|X| = ${r.partitions[0].length}, |Y| = ${r.partitions[1].length}\n`;
      }
      setBpResult(txt);
    } catch (e) {
      setBpError((e as Error).message || '计算错误');
      setBpResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 15. 平面图 ----------
  const [planarMatrix, setPlanarMatrix] = useState('0,1,1,1,1\n1,0,1,1,1\n1,1,0,1,1\n1,1,1,0,1\n1,1,1,1,0');
  const [planarResult, setPlanarResult] = useState('');
  const [planarError, setPlanarError] = useState<string | null>(null);

  const computePlanar = () => {
    setPlanarError(null);
    try {
      const m = parseMatrix(planarMatrix);
      const r = planarCheckEuler(m);
      const { edgeCount } = graphDegreeSequence(m);
      let txt = '邻接矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += `V = ${m.length} (顶点数)\n`;
      txt += `E = ${edgeCount} (边数)\n`;
      txt += `F = ${r.faces} (面数，由欧拉公式推出)\n\n`;
      txt += `欧拉公式: V - E + F = ${m.length - edgeCount + r.faces}\n`;
      txt += `(连通平面图 V - E + F = 2)\n\n`;
      txt += `必要条件 E ≤ 3V - 6: ${edgeCount} ≤ ${3 * m.length - 6} → ${edgeCount <= 3 * m.length - 6 ? '✓ 满足' : '✗ 不满足 → 非平面图'}\n\n`;
      if (r.kuratowskiViolation) {
        txt += `❌ ${r.kuratowskiViolation}\n`;
      } else {
        txt += `⚠️ 通过必要条件检查，但不保证可平面（需进一步验证 K5/K3,3 子图）\n`;
        txt += `结论: ${r.likelyPlanar ? '可能是平面图' : '不是平面图'}`;
      }
      setPlanarResult(txt);
    } catch (e) {
      setPlanarError((e as Error).message || '计算错误');
      setPlanarResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 16. 树 ----------
  const [treeMatrix, setTreeMatrix] = useState('0,1,0,0,0\n1,0,1,1,0\n0,1,0,0,1\n0,1,0,0,0\n0,0,1,0,0');
  const [treeResult, setTreeResult] = useState('');
  const [treeError, setTreeError] = useState<string | null>(null);

  const computeTree = () => {
    setTreeError(null);
    try {
      const m = parseMatrix(treeMatrix);
      const isTreeGraph = isTree(m);
      const leaves = treeLeaves(m);
      const center = treeCenter(m);
      const { edgeCount, degrees } = graphDegreeSequence(m);
      let txt = '邻接矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += `V = ${m.length}, E = ${edgeCount}\n`;
      txt += `是否树 (连通且 V = E + 1): ${isTreeGraph.isTree ? '✅ 是' : '❌ 否'}\n\n`;
      txt += `叶子节点: {${leaves.map(v => 'v' + v).join(', ')}}  (共 ${leaves.length} 个)\n`;
      txt += `树的中心: {${center.map(v => 'v' + v).join(', ')}}  (${center.length === 1 ? '唯一中心' : '双中心'})\n`;
      txt += `各顶点度数: [${degrees.join(', ')}]`;
      setTreeResult(txt);
    } catch (e) {
      setTreeError((e as Error).message || '计算错误');
      setTreeResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 17. DFS/BFS 遍历 ----------
  const [travMatrix, setTravMatrix] = useState('0,1,1,0,0,0,0\n1,0,0,1,1,0,0\n1,0,0,0,0,1,1\n0,1,0,0,0,0,0\n0,1,0,0,0,0,0\n0,0,1,0,0,0,0\n0,0,1,0,0,0,0');
  const [travStart, setTravStart] = useState('0');
  const [travResult, setTravResult] = useState('');
  const [travError, setTravError] = useState<string | null>(null);

  const computeTraversal = () => {
    setTravError(null);
    try {
      const m = parseMatrix(travMatrix);
      const start = parseInt(travStart);
      const bfs = bfsTraversal(m, start);
      const dfs = dfsTraversal(m, start);
      let txt = '邻接矩阵:\n' + formatMatrix(m) + '\n';
      txt += `起点: v${start}\n\n`;
      txt += `BFS (广度优先): v${bfs.order.join(' → v')}\n`;
      txt += `DFS (深度优先): v${dfs.order.join(' → v')}`;
      setTravResult(txt);
    } catch (e) {
      setTravError((e as Error).message || '计算错误');
      setTravResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 18. 拓扑排序 / 强连通分量 ----------
  const [tsMatrix, setTsMatrix] = useState('0,1,1,0,0,0\n0,0,0,1,1,0\n0,0,0,0,1,0\n0,0,0,0,0,1\n0,0,0,0,0,1\n0,0,0,0,0,0');
  const [tsResult, setTsResult] = useState('');
  const [tsError, setTsError] = useState<string | null>(null);

  const computeTopoSCC = () => {
    setTsError(null);
    try {
      const m = parseMatrix(tsMatrix);
      const topo = topologicalSort(m);
      const scc = stronglyConnectedComponents(m);
      let txt = '有向图邻接矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += '【拓扑排序 (Kahn 算法)】\n';
      if (topo.hasCycle) {
        txt += '❌ 图中存在环，无法拓扑排序\n';
      } else if (topo.order) {
        txt += `排序结果: v${topo.order.join(' → v')}\n`;
      }
      txt += `\n【强连通分量 (Kosaraju 算法)】\n`;
      txt += `分量个数: ${scc.length}\n`;
      scc.forEach((comp, i) => {
        txt += `  SCC-${i + 1}: {${comp.map(v => 'v' + v).join(', ')}}\n`;
      });
      setTsResult(txt);
    } catch (e) {
      setTsError((e as Error).message || '计算错误');
      setTsResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 19. 群判定 ----------
  const [groupTable, setGroupTable] = useState('0,1,2,3\n1,2,3,0\n2,3,0,1\n3,0,1,2');
  const [groupResult, setGroupResult] = useState('');
  const [groupError, setGroupError] = useState<string | null>(null);

  const computeGroup = () => {
    setGroupError(null);
    try {
      const table = parseMatrix(groupTable);
      const r = checkGroupProperties(table);
      let txt = '运算表 Cayley:\n' + formatMatrix(table) + '\n\n';
      txt += `封闭性: ${r.closed ? '✓ 满足' : '✗ 不满足'}\n`;
      txt += `结合律: ${r.associative ? '✓ 满足' : '✗ 不满足（或元素数>8未验证）'}\n`;
      txt += `单位元: ${r.identity !== null ? 'e = ' + r.identity : '不存在'}\n`;
      txt += `逆元存在: ${r.hasInverses ? '✓ 满足' : '✗ 不满足'}\n\n`;
      txt += `是否构成群: ${r.isGroup ? '✅ 是' : '❌ 否'}\n`;
      if (r.isGroup) {
        txt += `是否交换群 (Abel): ${r.isAbelian ? '✓ 是（运算表对称）' : '✗ 否'}\n`;
        txt += `群的阶: ${table.length}\n`;
      }
      setGroupResult(txt);
    } catch (e) {
      setGroupError((e as Error).message || '计算错误');
      setGroupResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 20. 格与布尔代数 ----------
  const [latMatrix, setLatMatrix] = useState('1,0,0,0\n1,1,0,0\n1,0,1,0\n1,1,1,1');
  const [latResult, setLatResult] = useState('');
  const [latError, setLatError] = useState<string | null>(null);

  const computeLattice = () => {
    setLatError(null);
    try {
      const m = parseMatrix(latMatrix);
      const lattice = isLattice(m);
      const props = relationProperties(m);
      let txt = '偏序集关系矩阵:\n' + formatMatrix(m) + '\n\n';
      txt += `自反: ${props.reflexive ? '✓' : '✗'}\n`;
      txt += `反对称: ${props.antisymmetric ? '✓' : '✗'}\n`;
      txt += `传递: ${props.transitive ? '✓' : '✗'}\n`;
      txt += `是否偏序集: ${props.reflexive && props.antisymmetric && props.transitive ? '✅ 是' : '❌ 否'}\n\n`;
      txt += `是否格: ${lattice ? '✅ 是（任意两元素有上确界和下确界）' : '❌ 否（存在元素对无确界）'}\n`;
      if (lattice) {
        const n = m.length;
        let hasTop = false, hasBottom = false;
        let top = -1, bottom = -1;
        for (let i = 0; i < n; i++) {
          let allAbove = true, allBelow = true;
          for (let j = 0; j < n; j++) {
            if (m[j][i] !== 1) allAbove = false; // j ≤ i 对所有 j → i是最大元
            if (m[i][j] !== 1) allBelow = false; // i ≤ j 对所有 j → i是最小元
          }
          if (allAbove) { hasTop = true; top = i; }
          if (allBelow) { hasBottom = true; bottom = i; }
        }
        txt += `有界格: ${hasTop && hasBottom ? '✓ 是' : '✗ 否'}\n`;
        if (hasTop) txt += `  最大元 (⊤): ${top}\n`;
        if (hasBottom) txt += `  最小元 (⊥): ${bottom}\n`;
        txt += `\n布尔代数需满足：有界、分配、有补元。此处仅验证格的存在。`;
      }
      setLatResult(txt);
    } catch (e) {
      setLatError((e as Error).message || '计算错误');
      setLatResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 21. 前束范式 ----------
  const [prenexInput, setPrenexInput] = useState('¬∀x P(x) → ∃x Q(x)');
  const [prenexResult, setPrenexResult] = useState('');
  const [prenexError, setPrenexError] = useState<string | null>(null);

  const computePrenex = () => {
    setPrenexError(null);
    try {
      const r = prenexNormalForm(prenexInput);
      let txt = `原公式: ${prenexInput}\n\n`;
      txt += `转换结果:\n  ${r.result}\n\n`;
      if (r.steps && r.steps.length > 0) {
        txt += `转换步骤:\n`;
        r.steps.forEach((s: string, i: number) => {
          txt += `  ${i + 1}. ${s}\n`;
        });
      }
      txt += `\n前束范式: 所有量词都提到公式最前面，母式为合式公式。`;
      setPrenexResult(txt);
    } catch (e) {
      setPrenexError((e as Error).message || '计算错误');
      setPrenexResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 22. 关系复合 ----------
  const [relR, setRelR] = useState('1,1\\n0,1');
  const [relS, setRelS] = useState('1,0\\n1,1');
  const [relCompResult, setRelCompResult] = useState('');
  const [relCompError, setRelCompError] = useState<string | null>(null);

  const computeRelComp = () => {
    setRelCompError(null);
    try {
      const R = parseMatrix(relR);
      const S = parseMatrix(relS);
      const r = relationComposition(R, S);
      let txt = `R 关系矩阵:\n${formatMatrix(R)}\n\n`;
      txt += `S 关系矩阵:\n${formatMatrix(S)}\n\n`;
      txt += `R∘S（R 后复合 S）:\n${formatMatrix(r.matrix)}\n\n`;
      txt += `定义: (R∘S)[i][j] = ∨_k (R[i][k] ∧ S[k][j])\n`;
      txt += `即：存在 k 使得 iRk 且 kSj，则 i(R∘S)j`;
      setRelCompResult(txt);
    } catch (e) {
      setRelCompError((e as Error).message || '计算错误');
      setRelCompResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 23. 环/域判定 ----------
  const [ringAdd, setRingAdd] = useState('0,1\\n1,0');
  const [ringMul, setRingMul] = useState('0,0\\n0,1');
  const [ringResult, setRingResult] = useState('');
  const [ringError, setRingError] = useState<string | null>(null);

  const computeRing = () => {
    setRingError(null);
    try {
      const add = parseMatrix(ringAdd);
      const mul = parseMatrix(ringMul);
      const r = ringCheck(add, mul);
      let txt = `加法运算表:\n${formatMatrix(add)}\n\n`;
      txt += `乘法运算表:\n${formatMatrix(mul)}\n\n`;
      txt += `判定结果:\n`;
      txt += `  是环: ${r.isRing ? '✅ 是' : '❌ 否'}\n`;
      txt += `  是交换环: ${r.isCommutativeRing ? '✅ 是' : '❌ 否'}\n`;
      txt += `  有乘法单位元: ${r.hasUnity ? '✅ 是' : '❌ 否'}\n`;
      txt += `  是域: ${r.isField ? '✅ 是（非零元都有逆元）' : '❌ 否'}\n\n`;
      txt += `${r.description}\n\n`;
      txt += `环的定义: <R,+,·> 满足 ①<R,+>是Abel群 ②乘法结合 ③左右分配律\n`;
      txt += `域的定义: 交换环 + 乘法单位元 + 每个非零元有乘法逆元`;
      setRingResult(txt);
    } catch (e) {
      setRingError((e as Error).message || '计算错误');
      setRingResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 24. 邻接矩阵幂 ----------
  const [adjMat, setAdjMat] = useState('0,1,1\\n1,0,1\\n1,1,0');
  const [adjPower, setAdjPower] = useState('2');
  const [adjResult, setAdjResult] = useState('');
  const [adjError, setAdjError] = useState<string | null>(null);

  const computeAdjPower = () => {
    setAdjError(null);
    try {
      const A = parseMatrix(adjMat);
      const k = parseInt(adjPower);
      const r = adjMatrixPower(A, k);
      let txt = `邻接矩阵 A:\n${formatMatrix(A)}\n\n`;
      txt += `A^${k}:\n${formatMatrix(r.matrix)}\n\n`;
      txt += `含义: A^k [i][j] = 从顶点 i 出发走 k 步到顶点 j 的路径数目\n\n`;
      if (r.reachable) {
        txt += `可达矩阵 (A+I)^{n-1} 的 0/1 形式:\n`;
        txt += r.reachable.map(row => row.map(v => v ? 1 : 0).join(' ')).join('\n');
        txt += `\n\n（存在路径即标记为 1，不关心长度）`;
      }
      setAdjResult(txt);
    } catch (e) {
      setAdjError((e as Error).message || '计算错误');
      setAdjResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 25. 关键路径 ----------
  const [cpEdges, setCpEdges] = useState('0,1,3\\n0,2,2\\n1,3,1\\n2,3,5');
  const [cpN, setCpN] = useState('4');
  const [cpResult, setCpResult] = useState('');
  const [cpError, setCpError] = useState<string | null>(null);

  const computeCriticalPath = () => {
    setCpError(null);
    try {
      const lines = cpEdges.trim().split(/[\\n;]/).map(l => l.trim()).filter(l => l.length > 0);
      const edges = lines.map(line => {
        const parts = line.split(/[, \t]+/);
        return { from: parseInt(parts[0]), to: parseInt(parts[1]), weight: parseFloat(parts[2]) };
      });
      const n = parseInt(cpN);
      const r = criticalPath(edges, n);
      let txt = `AOE 网（活动边，顶点为事件）:\n`;
      edges.forEach((e, i) => {
        txt += `  活动 ${String.fromCharCode(65 + i)}: v${e.from} → v${e.to}, 耗时 = ${e.weight}\n`;
      });
      txt += `\n最早开始时间 (ve): ${r.earliest.map(v => formatResult(v)).join(', ')}\n`;
      txt += `最迟开始时间 (vl): ${r.latest.map(v => formatResult(v)).join(', ')}\n\n`;
      txt += `关键活动（总时差 = 0）:\n`;
      r.criticalEdges.forEach(e => {
        txt += `  ${e}\n`;
      });
      txt += `\n关键路径: ${r.criticalPath}\n`;
      txt += `工程最短时间 = ${formatResult(r.totalTime)}`;
      setCpResult(txt);
    } catch (e) {
      setCpError((e as Error).message || '计算错误');
      setCpResult('');
      toast.error('计算错误');
    }
  };

  // ---------- 26. 母函数展开 ----------
  const [gfNum, setGfNum] = useState('1');
  const [gfDen, setGfDen] = useState('1, -1');
  const [gfTerms, setGfTerms] = useState('8');
  const [gfResult, setGfResult] = useState('');
  const [gfError, setGfError] = useState<string | null>(null);

  const computeGenFunc = () => {
    setGfError(null);
    try {
      const num = gfNum.split(',').map(s => parseFloat(s.trim()));
      const den = gfDen.split(',').map(s => parseFloat(s.trim()));
      const n = parseInt(gfTerms);
      const r = generatingFunctionExpand(num, den, n);
      let txt = `母函数 G(x) = (${num.join(', ')}) / (${den.join(', ')})\n\n`;
      txt += `前 ${n + 1} 项展开系数 (a₀, a₁, ..., a_${n}):\n  `;
      txt += r.sequence.map(v => formatResult(v)).join(', ');
      txt += `\n\n递推关系: 由分母系数确定的线性齐次递推\n`;
      txt += `应用: 组合计数、递推求解、整数分拆、错排等组合问题`;
      setGfResult(txt);
    } catch (e) {
      setGfError((e as Error).message || '计算错误');
      setGfResult('');
      toast.error('计算错误');
    }
  };

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="离散数学"
        description="数理逻辑、集合论、图论、代数结构——完整的离散数学计算工具集。"
        eyebrow="学科 · 几何与离散"
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
                {/* 1. 真值表 */}
                <TabsContent value="truthTable" className="space-y-4">
                    <MathInputField
                      value={ttExpr}
                      onChange={setTtExpr}
                      label="命题公式（用 and/or/not/xor）"
                      placeholder="如 p and q or not r"
                      showPalette
                      defaultPreview
                    />
                  <Button onClick={computeTruthTable} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />生成真值表
                  </Button>
                  <ResultBox text={ttResult} error={ttError} />
                </TabsContent>

                {/* 2. 逻辑等价 */}
                <TabsContent value="equivalence" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">公式 1</label>
                      <Input value={eq1} onChange={(e) => setEq1(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">公式 2</label>
                      <Input value={eq2} onChange={(e) => setEq2(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeEquivalence} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />验证逻辑等价
                  </Button>
                  <ResultBox text={eqResult} error={eqError} />
                </TabsContent>

                {/* 3. 主范式 */}
                <TabsContent value="normalForm" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">命题公式</label>
                    <Input value={nfExpr} onChange={(e) => setNfExpr(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeNormalForm} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />求主析取/合取范式
                  </Button>
                  <ResultBox text={nfResult} error={nfError} />
                </TabsContent>

                {/* 4. 推理规则 */}
                <TabsContent value="inference" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">前提（每行一个，用 and/or/not 等）</label>
                    <Textarea value={infPremises} onChange={(e) => setInfPremises(e.target.value)} className="font-mono min-h-[80px]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">结论</label>
                    <Input value={infConclusion} onChange={(e) => setInfConclusion(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeInference} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />验证推理有效性
                  </Button>
                  <ResultBox text={infResult} error={infError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>用真值表法验证：所有使前提全真的指派是否都使结论为真。</span>
                  </div>
                </TabsContent>

                {/* 5. 集合运算 */}
                <TabsContent value="setOps" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">集合 A（逗号分隔）</label>
                      <Input value={setA} onChange={(e) => setSetA(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">集合 B（逗号分隔）</label>
                      <Input value={setB} onChange={(e) => setSetB(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <Button onClick={computeSetOps} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算所有集合运算
                  </Button>
                  <ResultBox text={setResult} error={setError} />
                </TabsContent>

                {/* 6. 关系性质 */}
                <TabsContent value="relationProps" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">关系矩阵（行用换行分隔，列用逗号分隔）</label>
                    <Textarea value={relMatrix} onChange={(e) => setRelMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeRelationProps} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />判断关系性质
                  </Button>
                  <ResultBox text={relResult} error={relError} />
                </TabsContent>

                {/* 7. 关系闭包 */}
                <TabsContent value="relationClosure" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">关系矩阵</label>
                    <Textarea value={closureMatrix} onChange={(e) => setClosureMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeClosures} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算三种闭包
                  </Button>
                  <ResultBox text={closureResult} error={closureError} />
                </TabsContent>

                {/* 8. 等价关系 */}
                <TabsContent value="equivalenceRel" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">关系矩阵</label>
                    <Textarea value={eqRelMatrix} onChange={(e) => setEqRelMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeEquivalenceRel} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />判断等价关系 + 求等价类
                  </Button>
                  <ResultBox text={eqRelResult} error={eqRelError} />
                </TabsContent>

                {/* 9. 偏序与哈斯图 */}
                <TabsContent value="partialOrder" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">偏序关系矩阵</label>
                    <Textarea value={poMatrix} onChange={(e) => setPoMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computePartialOrder} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />偏序分析 + 哈斯图
                  </Button>
                  <ResultBox text={poResult} error={poError} />
                </TabsContent>

                {/* 10. 图基本参数 */}
                <TabsContent value="graphBasic" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">邻接矩阵</label>
                    <Textarea value={gBasicMatrix} onChange={(e) => setGBasicMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeGraphBasic} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算图基本参数
                  </Button>
                  <ResultBox text={gBasicResult} error={gBasicError} />
                </TabsContent>

                {/* 11. 欧拉图/哈密顿 */}
                <TabsContent value="eulerHamilton" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">邻接矩阵</label>
                    <Textarea value={ehMatrix} onChange={(e) => setEhMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeEulerHamilton} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />判定欧拉图与哈密顿图
                  </Button>
                  <ResultBox text={ehResult} error={ehError} />
                </TabsContent>

                {/* 12. 最短路径 */}
                <TabsContent value="shortestPath" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">带权邻接矩阵（无边写0）</label>
                    <Textarea value={spMatrix} onChange={(e) => setSpMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <div className="max-w-[120px]">
                    <label className="text-sm font-medium text-foreground mb-2 block">起点</label>
                    <Input value={spStart} onChange={(e) => setSpStart(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeShortestPath} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />Dijkstra 最短路径
                  </Button>
                  <ResultBox text={spResult} error={spError} />
                </TabsContent>

                {/* 13. 最小生成树 */}
                <TabsContent value="mst" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">带权邻接矩阵</label>
                    <Textarea value={mstMatrix} onChange={(e) => setMstMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeMST} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />Prim + Kruskal 双算法
                  </Button>
                  <ResultBox text={mstResult} error={mstError} />
                </TabsContent>

                {/* 14. 二部图 */}
                <TabsContent value="bipartite" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">邻接矩阵</label>
                    <Textarea value={bpMatrix} onChange={(e) => setBpMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeBipartite} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />染色法判定二部图
                  </Button>
                  <ResultBox text={bpResult} error={bpError} />
                </TabsContent>

                {/* 15. 平面图 */}
                <TabsContent value="planar" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">邻接矩阵</label>
                    <Textarea value={planarMatrix} onChange={(e) => setPlanarMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computePlanar} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />欧拉公式 + 必要条件检验
                  </Button>
                  <ResultBox text={planarResult} error={planarError} />
                </TabsContent>

                {/* 16. 树 */}
                <TabsContent value="tree" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">邻接矩阵</label>
                    <Textarea value={treeMatrix} onChange={(e) => setTreeMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeTree} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />树判定 + 叶子 + 中心
                  </Button>
                  <ResultBox text={treeResult} error={treeError} />
                </TabsContent>

                {/* 17. DFS/BFS */}
                <TabsContent value="traversal" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">邻接矩阵</label>
                    <Textarea value={travMatrix} onChange={(e) => setTravMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <div className="max-w-[120px]">
                    <label className="text-sm font-medium text-foreground mb-2 block">起点</label>
                    <Input value={travStart} onChange={(e) => setTravStart(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeTraversal} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />DFS + BFS 遍历
                  </Button>
                  <ResultBox text={travResult} error={travError} />
                </TabsContent>

                {/* 18. 拓扑/强连通 */}
                <TabsContent value="topoScc" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">有向图邻接矩阵</label>
                    <Textarea value={tsMatrix} onChange={(e) => setTsMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeTopoSCC} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />拓扑排序 + 强连通分量
                  </Button>
                  <ResultBox text={tsResult} error={tsError} />
                </TabsContent>

                {/* 19. 群判定 */}
                <TabsContent value="groupCheck" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">运算表（元素用 0..n-1 索引）</label>
                    <Textarea value={groupTable} onChange={(e) => setGroupTable(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeGroup} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />群性质验证
                  </Button>
                  <ResultBox text={groupResult} error={groupError} />
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <span>验证封闭性、结合律（n≤8时全量验证）、单位元、逆元。群的四大公理全部满足则构成群。</span>
                  </div>
                </TabsContent>

                {/* 20. 格与布尔 */}
                <TabsContent value="lattice" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">偏序集关系矩阵</label>
                    <Textarea value={latMatrix} onChange={(e) => setLatMatrix(e.target.value)} className="font-mono min-h-[100px]" />
                  </div>
                  <Button onClick={computeLattice} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />格判定
                  </Button>
                  <ResultBox text={latResult} error={latError} />
                </TabsContent>

                {/* 21. 前束范式 */}
                <TabsContent value="prenex" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">谓词公式（支持 ∀∃¬∧∨→，变量 P(x), Q(x) 等）</label>
                    <Input value={prenexInput} onChange={(e) => setPrenexInput(e.target.value)} className="font-mono" placeholder="¬∀x P(x) → ∃y Q(x,y)" />
                    <p className="text-xs text-muted-foreground mt-1">符号：¬ 否定 / ∀ 全称量词 / ∃ 存在量词 / ∧ 合取 / ∨ 析取 / → 蕴涵</p>
                  </div>
                  <Button onClick={computePrenex} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />化为前束范式
                  </Button>
                  <ResultBox text={prenexResult} error={prenexError} />
                </TabsContent>

                {/* 22. 关系复合 */}
                <TabsContent value="relationComp" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">关系 R 矩阵（换行分隔行，逗号分隔列）</label>
                      <Textarea value={relR} onChange={(e) => setRelR(e.target.value)} className="font-mono min-h-[80px]" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">关系 S 矩阵</label>
                      <Textarea value={relS} onChange={(e) => setRelS(e.target.value)} className="font-mono min-h-[80px]" />
                    </div>
                  </div>
                  <Button onClick={computeRelComp} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 R∘S 复合关系
                  </Button>
                  <ResultBox text={relCompResult} error={relCompError} />
                </TabsContent>

                {/* 23. 环/域判定 */}
                <TabsContent value="ringField" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">加法运算表</label>
                      <Textarea value={ringAdd} onChange={(e) => setRingAdd(e.target.value)} className="font-mono min-h-[100px]" placeholder="0,1\n1,0" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">乘法运算表</label>
                      <Textarea value={ringMul} onChange={(e) => setRingMul(e.target.value)} className="font-mono min-h-[100px]" placeholder="0,0\n0,1" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 border border-border">行/列索引为 0..n-1，表示集合元素编号。表格值为运算结果元素编号。</p>
                  <Button onClick={computeRing} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />判定环/域
                  </Button>
                  <ResultBox text={ringResult} error={ringError} />
                </TabsContent>

                {/* 24. 邻接矩阵幂 */}
                <TabsContent value="adjPower" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">邻接矩阵 A</label>
                      <Textarea value={adjMat} onChange={(e) => setAdjMat(e.target.value)} className="font-mono min-h-[100px]" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">幂次 k</label>
                      <Input value={adjPower} onChange={(e) => setAdjPower(e.target.value)} className="font-mono w-24" />
                      <p className="text-xs text-muted-foreground mt-3">A^k[i][j] = 从 i 走 k 步到 j 的路径数</p>
                    </div>
                  </div>
                  <Button onClick={computeAdjPower} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />计算 A^k + 可达矩阵
                  </Button>
                  <ResultBox text={adjResult} error={adjError} />
                </TabsContent>

                {/* 25. 关键路径 */}
                <TabsContent value="criticalPath" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground mb-2 block">AOE 边列表（每行 from,to,weight）</label>
                      <Textarea value={cpEdges} onChange={(e) => setCpEdges(e.target.value)} className="font-mono min-h-[120px]" placeholder="0,1,3\n0,2,2" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">顶点数 n</label>
                      <Input value={cpN} onChange={(e) => setCpN(e.target.value)} className="font-mono w-24" />
                      <p className="text-xs text-muted-foreground mt-3">AOE 网：顶点=事件，有向边=活动，权重=活动持续时间</p>
                    </div>
                  </div>
                  <Button onClick={computeCriticalPath} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />求关键路径
                  </Button>
                  <ResultBox text={cpResult} error={cpError} />
                </TabsContent>

                {/* 26. 母函数展开 */}
                <TabsContent value="genFunc" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">分子系数（a₀, a₁...）</label>
                      <Input value={gfNum} onChange={(e) => setGfNum(e.target.value)} className="font-mono" placeholder="1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">分母系数（1, -a₁, -a₂...）</label>
                      <Input value={gfDen} onChange={(e) => setGfDen(e.target.value)} className="font-mono" placeholder="1, -1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">展开到第几项</label>
                      <Input value={gfTerms} onChange={(e) => setGfTerms(e.target.value)} className="font-mono" placeholder="8" />
                    </div>
                  </div>
                  <Button onClick={computeGenFunc} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />母函数展开
                  </Button>
                  <ResultBox text={gfResult} error={gfError} />
                  <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 border border-border">
                    <p className="font-medium text-foreground mb-1">💡 母函数</p>
                    <p>G(x) = (b₀ + b₁x + ...) / (1 - a₁x - a₂x² - ...) 对应线性递推 aₙ = a₁·aₙ₋₁ + a₂·aₙ₋₂ + ...</p>
                    <p>应用：组合计数、递推求解、整数分拆、错排问题等。</p>
                  </div>
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
          theme="stone"
          className="mb-4"
        />

      </div>

      <CheatsheetDialog moduleKey="discrete" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
