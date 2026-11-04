import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import PageShell from '@/components/PageShell';
import RelatedExplainers from '@/components/RelatedExplainers';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Sparkles, History, Trash2, Clock, Calculator, Type, Lightbulb, ListOrdered, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MathRenderer from '@/components/MathRenderer';
import LearningSection from '@/components/LearningSection';
import { useHistory } from '@/hooks/useHistory';
import { evaluate } from 'mathjs';
import {
  formatResult,
  matrixToString,
  gaussElimination,
  vectorDot,
  vectorCross,
  vectorNorm,
  gramSchmidt,
  isOrthogonalMatrix,
  positiveDefiniteTest,
  quadraticFormCanonical,
  luDecomposition,
  adjugateMatrix,
  vectorDependence,
  diagonalizableTest,
  matrixAdd,
  matrixSub,
  matrixScalarMul,
  matrixPower,
  rowEchelonForm,
  reducedRowEchelonForm,
  maxLinearlyIndependent,
  qrDecomposition,
  leastSquares,
  isOrthogonalTransformation,
  vectorAngleCos,
  vectorAngleDeg,
  basisTransitionMatrix,
  detMatrix,
} from '@/lib/math-utils';
import { toast } from 'sonner';
import { svd, jordanForm, isNormalMatrix } from '@/lib/math-advanced';
import { stepByStepDeterminant, stepByStepMatrixInverse, stepByStepEigenvalue } from '@/lib/step-by-step';
import type { StepItem } from '@/lib/step-by-step';

const EXAMPLES = [
  { label: '矩阵加法', op: 'arithmetic', sub: 'add' },
  { label: '矩阵数乘', op: 'arithmetic', sub: 'scalar' },
  { label: '矩阵幂', op: 'arithmetic', sub: 'power' },
  { label: '行列式', op: 'basic', sub: 'det' },
  { label: '逆矩阵', op: 'basic', sub: 'inv' },
  { label: '特征值', op: 'basic', sub: 'eigs' },
];

// 智能解析矩阵输入：优先用换行/空格格式，兼容旧格式 [1,2;3,4]
function parseMatrixInput(s: string): number[][] {
  const trimmed = s.trim();
  if (!trimmed) throw new Error('矩阵不能为空');
  // 如果包含 [ ] 或分号较多，尝试 mathjs 格式
  if (trimmed.startsWith('[') && trimmed.includes(';')) {
    try {
      const raw = evaluate(trimmed);
      const size = raw.size();
      const rows = size[0], cols = size.length > 1 ? size[1] : 1;
      const data: number[][] = [];
      for (let i = 0; i < rows; i++) {
        const row: number[] = [];
        for (let j = 0; j < cols; j++) row.push(raw.get([i, j]));
        data.push(row);
      }
      return data;
    } catch {
      // 解析失败，fallthrough 到换行格式
    }
  }
  // 标准行列格式：换行分号都行，空格逗号都行
  const lines = trimmed.split(/[;\n]+/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    const nums = line.split(/[\s,]+/).map(x => x.trim()).filter(Boolean);
    if (nums.length === 0) throw new Error('空行');
    return nums.map(x => {
      const v = parseFloat(x);
      if (isNaN(v)) throw new Error(`无效数字: ${x}`);
      return v;
    });
  });
}

// 解析向量：空格/逗号分隔
function parseVector(s: string): number[] {
  const parts = s.split(/[,\s;]+/).map(x => x.trim()).filter(Boolean);
  return parts.map(p => {
    const v = parseFloat(p);
    if (isNaN(v)) throw new Error(`无效数字: ${p}`);
    return v;
  });
}

// 格式化矩阵为标准对齐字符串
function fmtMatrix(mat: number[][]): string {
  return matrixToString(mat);
}

export default function LinearAlgebraPage() {
  const navigate = useNavigate();
  const [result, setResultState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>('text');
  const [steps, setSteps] = useState<StepItem[] | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const { history, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_linalg_history', maxItems: 30 });
  const lastOpRef = useRef('');

  const setResult = useCallback((value: string, op?: string) => {
    setResultState(value);
    if (value && op) {
      addItem(op, value);
      lastOpRef.current = op;
    } else if (value && lastOpRef.current) {
      addItem(lastOpRef.current, value);
    }
  }, [addItem]);

  // 基本运算（单一矩阵）
  const [basicInput, setBasicInput] = useState('1 2\n3 4');

  // 矩阵算术（A+B、A-B、kA、A^n）
  const [arithA, setArithA] = useState('1 2\n3 4');
  const [arithB, setArithB] = useState('5 6\n7 8');
  const [arithK, setArithK] = useState('2');
  const [arithN, setArithN] = useState('3');

  // 线性方程组
  const [eqA, setEqA] = useState('1 2\n3 4');
  const [eqB, setEqB] = useState('5 11');

  // 向量运算
  const [vecA, setVecA] = useState('1 2 3');
  const [vecB, setVecB] = useState('4 5 6');
  const [vecP, setVecP] = useState('2');

  // 施密特
  const [gsInput, setGsInput] = useState('1 1 0\n1 0 1\n0 1 1');

  // 行变换
  const [refInput, setRefInput] = useState('1 2 3\n2 4 6\n1 0 1');

  // 矩阵判定
  const [matrixInput, setMatrixInput] = useState('1 2\n3 4');

  // LU / QR / 伴随
  const [luInput, setLuInput] = useState('2 1\n4 3');

  // 向量组（极大无关组 / 相关性）
  const [vsInput, setVsInput] = useState('1 2 3\n2 4 6\n1 0 1');

  // 最小二乘
  const [lsA, setLsA] = useState('1 1\n2 2\n3 3');
  const [lsB, setLsB] = useState('2 4 6');

  // 基变换
  const [basisA, setBasisA] = useState('1 0\n0 1');
  const [basisB, setBasisB] = useState('1 1\n1 -1');

  // SVD / Jordan 输入
  const [svdInput, setSvdInput] = useState('3 0\n0 2');

  const computeBasic = (op: string) => {
    setError(null);
    try {
      const A = parseMatrixInput(basicInput);
      const rows = A.length, cols = A[0].length;
      if (op === 'det') {
        if (rows !== cols) throw new Error('行列式仅对方阵有定义');
        const d = detMatrix(A);
        setResult(`|A| = ${formatResult(d)}`);
        try { setSteps(stepByStepDeterminant(A).steps); setShowSteps(false); } catch { setSteps(null); }
      } else if (op === 'inv') {
        if (rows !== cols) throw new Error('逆矩阵仅对方阵有定义');
        const d = detMatrix(A);
        if (Math.abs(d) < 1e-12) throw new Error('矩阵奇异，行列式为 0，不可逆');
        const adj = adjugateMatrix(A);
        const inv = adj.map(row => row.map(v => v / d));
        setResult(`A⁻¹ =\n${fmtMatrix(inv)}\n\n验证：A · A⁻¹ = I`);
        try { setSteps(stepByStepMatrixInverse(A).steps); setShowSteps(false); } catch { setSteps(null); }
      } else if (op === 'transpose') {
        const T: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
        for (let i = 0; i < rows; i++)
          for (let j = 0; j < cols; j++)
            T[j][i] = A[i][j];
        setResult(`Aᵀ =\n${fmtMatrix(T)}`);
      } else if (op === 'trace') {
        if (rows !== cols) throw new Error('迹仅对方阵有定义');
        let t = 0;
        for (let i = 0; i < rows; i++) t += A[i][i];
        setResult(`tr(A) = ${formatResult(t)}`);
      } else if (op === 'rank') {
        const { rank } = rowEchelonForm(A);
        setResult(`rank(A) = ${rank}`);
      } else if (op === 'eigs') {
        if (rows !== cols) throw new Error('特征值仅对方阵有定义');
        const res = diagonalizableTest(A);
        setResult(`特征值：${res.eigenValues.map(v => formatResult(v)).join(', ')}\n${res.diagonalizable ? '✓ 可相似对角化' : '✗ 不可相似对角化（近似判定）'}`);
        try { setSteps(stepByStepEigenvalue(A).steps); setShowSteps(false); } catch { setSteps(null); }
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      setSteps(null);
      setShowSteps(false);
      toast.error('计算错误');
    }
  };

  const computeArithmetic = (op: string) => {
    setError(null);
    try {
      const A = parseMatrixInput(arithA);
      if (op === 'add') {
        const B = parseMatrixInput(arithB);
        const C = matrixAdd(A, B);
        setResult(`A + B =\n${fmtMatrix(C)}`);
      } else if (op === 'sub') {
        const B = parseMatrixInput(arithB);
        const C = matrixSub(A, B);
        setResult(`A - B =\n${fmtMatrix(C)}`);
      } else if (op === 'scalar') {
        const k = parseFloat(arithK);
        if (isNaN(k)) throw new Error('标量 k 无效');
        const C = matrixScalarMul(k, A);
        setResult(`${formatResult(k)} · A =\n${fmtMatrix(C)}`);
      } else if (op === 'power') {
        const n = parseInt(arithN, 10);
        if (!Number.isInteger(n) || n < 0) throw new Error('幂次必须是非负整数');
        const C = matrixPower(A, n);
        setResult(`A^${n} =\n${fmtMatrix(C)}`);
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeEq = () => {
    setError(null);
    try {
      const A = parseMatrixInput(eqA);
      const b = parseVector(eqB);
      const res = gaussElimination(A, b);
      if (res.type === 'unique') {
        setResult(`唯一解：\nx = [${res.solution!.map(v => formatResult(v)).join(', ')}]\n系数矩阵秩：${res.rank}`);
      } else if (res.type === 'none') {
        setResult(`无解\n系数矩阵秩：${res.rank}，增广矩阵秩：${res.rankAug}`);
      } else {
        setResult(`无穷多解\n系数矩阵秩：${res.rank} < 未知数个数 ${A[0].length}\n基础解系含 ${A[0].length - res.rank} 个自由变量`);
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeVector = (op: string) => {
    setError(null);
    try {
      const a = parseVector(vecA);
      const b = parseVector(vecB);
      if (op === 'dot') {
        setResult(`a·b = ${formatResult(vectorDot(a, b))}`);
      } else if (op === 'cross') {
        const c = vectorCross(a, b);
        setResult(`a × b = [${c.map(v => formatResult(v)).join(', ')}]`);
      } else if (op === 'norm') {
        const p = parseFloat(vecP);
        if (isNaN(p)) throw new Error('p 无效');
        setResult(`‖a‖_${p} = ${formatResult(vectorNorm(a, p))}\n‖b‖_${p} = ${formatResult(vectorNorm(b, p))}`);
      } else if (op === 'angle') {
        const cos = vectorAngleCos(a, b);
        const deg = vectorAngleDeg(a, b);
        setResult(`cos θ = ${formatResult(cos)}\nθ = ${formatResult(deg)}°\nθ = ${formatResult((deg * Math.PI) / 180)} rad`);
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeGS = () => {
    setError(null);
    try {
      const vecs = parseMatrixInput(gsInput);
      const result = gramSchmidt(vecs);
      setResult('Gram-Schmidt 正交单位化结果：\n' + result.map((v, i) => `e${i + 1} = [${v.map(x => formatResult(x)).join(', ')}]`).join('\n'));
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeRowOp = (op: string) => {
    setError(null);
    try {
      const A = parseMatrixInput(refInput);
      if (op === 'ref') {
        const { matrix, rank } = rowEchelonForm(A);
        setResult(`行阶梯形 (REF)：\n${fmtMatrix(matrix)}\n\n秩 r = ${rank}`);
      } else if (op === 'rref') {
        const { matrix, rank } = reducedRowEchelonForm(A);
        setResult(`行最简形 (RREF)：\n${fmtMatrix(matrix)}\n\n秩 r = ${rank}`);
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeMatrixTest = (op: string) => {
    setError(null);
    try {
      const A = parseMatrixInput(matrixInput);
      if (op === 'orthogonal') {
        const isOrtho = isOrthogonalMatrix(A);
        setResult(isOrtho ? '✓ 是正交矩阵：A^T · A = I' : '✗ 不是正交矩阵：A^T · A ≠ I');
      } else if (op === 'orthoTrans') {
        const isOrtho = isOrthogonalTransformation(A);
        setResult(isOrtho ? '✓ 是正交变换：保持内积与长度' : '✗ 不是正交变换');
      } else if (op === 'positive') {
        const res = positiveDefiniteTest(A);
        const label = res.definite === 'positive' ? '正定' : res.definite === 'negative' ? '负定' : '不定';
        setResult(`正定性判定：${label}\n顺序主子式：[${res.leadingMinors.map(v => formatResult(v)).join(', ')}]`);
      } else if (op === 'quadratic') {
        const res = quadraticFormCanonical(A);
        setResult(`二次型标准形：\nf = ${res.canonical}\n正惯性指数：正特征值个数\n负惯性指数：负特征值个数\n类型：${res.definite}`);
      } else if (op === 'diagonalize') {
        const res = diagonalizableTest(A);
        setResult(`${res.diagonalizable ? '✓ 可相似对角化' : '✗ 不可相似对角化（或特征值有重根且几何重数<代数重数）'}\n特征值：${res.eigenValues.map(v => formatResult(v)).join(', ')}\n对角矩阵：diag(${res.diag.map(v => formatResult(v)).join(', ')})`);
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeLU = () => {
    setError(null);
    try {
      const A = parseMatrixInput(luInput);
      const { L, U } = luDecomposition(A);
      setResult(`L =\n${fmtMatrix(L)}\n\nU =\n${fmtMatrix(U)}\n\nA = L · U`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeQR = () => {
    setError(null);
    try {
      const A = parseMatrixInput(luInput);
      const { Q, R } = qrDecomposition(A);
      setResult(`Q =\n${fmtMatrix(Q)}\n\nR =\n${fmtMatrix(R)}\n\nA = Q · R`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeAdjugate = () => {
    setError(null);
    try {
      const A = parseMatrixInput(luInput);
      const adj = adjugateMatrix(A);
      setResult(`伴随矩阵 adj(A) =\n${fmtMatrix(adj)}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeDependence = (op: string) => {
    setError(null);
    try {
      const vecs = parseMatrixInput(vsInput);
      if (op === 'dependence') {
        const res = vectorDependence(vecs);
        setResult(`${res.dependent ? '✗ 线性相关' : '✓ 线性无关'}\n向量个数：${res.count}\n秩：${res.rank}\n极大线性无关组含 ${res.rank} 个向量`);
      } else if (op === 'maxli') {
        const { indices, rank } = maxLinearlyIndependent(vecs);
        const list = indices.map(idx => `α${idx + 1} = [${vecs[idx].map(v => formatResult(v)).join(', ')}]`).join('\n');
        setResult(`极大线性无关组（${rank} 个向量）：\n${list}\n\n索引：第 ${indices.map(i => i + 1).join(', ')} 个向量`);
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeLeastSquares = () => {
    setError(null);
    try {
      const A = parseMatrixInput(lsA);
      const b = parseVector(lsB);
      const x = leastSquares(A, b);
      // 计算残差
      let resSum = 0;
      for (let i = 0; i < A.length; i++) {
        let pred = 0;
        for (let j = 0; j < A[0].length; j++) pred += A[i][j] * x[j];
        resSum += (pred - b[i]) * (pred - b[i]);
      }
      setResult(`最小二乘解：\nx = [${x.map(v => formatResult(v)).join(', ')}]\n\n残差平方和 = ${formatResult(resSum)}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeBasis = () => {
    setError(null);
    try {
      const A = parseMatrixInput(basisA);
      const B = parseMatrixInput(basisB);
      const P = basisTransitionMatrix(A, B);
      setResult(`从基 A 到基 B 的过渡矩阵 P：\nP =\n${fmtMatrix(P)}\n\n满足：B = A · P\n坐标变换：[x]_A = P · [x]_B`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeSVD = () => {
    setError(null);
    try {
      const A = parseMatrixInput(svdInput);
      const res = svd(A);
      setResult(`奇异值分解 (SVD)：A = U · Σ · Vᵀ\n\n奇异值 σ：[${res.S.map(v => formatResult(v)).join(', ')}]\n\nU =\n${fmtMatrix(res.U)}\n\nVᵀ =\n${fmtMatrix(res.V)}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeJordan = () => {
    setError(null);
    try {
      const A = parseMatrixInput(svdInput);
      const res = jordanForm(A);
      setResult(`约当标准形：\n\n特征值：${res.eigenvalues.map(v => formatResult(v)).join(', ')}\n\n约当块：\n${res.blocks.map((b, i) => `J${i + 1} (λ=${formatResult(b.eigenvalue)}, ${b.size}×${b.size})`).join('\n')}\n\n约当矩阵 J =\n${fmtMatrix(res.J)}`);
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const computeAdvTest = (op: string) => {
    setError(null);
    try {
      const A = parseMatrixInput(svdInput);
      if (op === 'normal') {
        const res = isNormalMatrix(A);
        setResult(res.normal ? `✓ 是正规矩阵：${res.reason}` : `✗ 不是正规矩阵：${res.reason}`);
      } else if (op === 'orthogonal2') {
        const res = isOrthogonalMatrix(A);
        setResult(res ? '✓ 是正交矩阵：Aᵀ · A = I' : '✗ 不是正交矩阵：Aᵀ · A ≠ I');
      }
    } catch (e) {
      setError((e as Error).message || '计算错误');
      setResult('');
      toast.error('计算错误');
    }
  };

  const loadExample = (ex: { label: string; op: string; sub: string }) => {
    setActiveTab(ex.op);
    setError(null);
    setResult('');
    // 延时执行等 tab 切换，实际只是跳 tab
    setTimeout(() => {
      if (ex.op === 'basic') {
        if (ex.sub === 'det') { computeBasic('det'); }
        else if (ex.sub === 'inv') { computeBasic('inv'); }
        else if (ex.sub === 'eigs') { computeBasic('eigs'); }
      } else if (ex.op === 'arithmetic') {
        if (ex.sub === 'add') { computeArithmetic('add'); }
        else if (ex.sub === 'scalar') { computeArithmetic('scalar'); }
        else if (ex.sub === 'power') { computeArithmetic('power'); }
      }
    }, 0);
  };

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="线性代数"
        description="矩阵运算、线性方程组、向量空间、二次型、矩阵分解。每行输入一行元素，空格分隔列。"
        eyebrow="学科 · 基础数学"
        onCheatsheet={() => setCheatsheetOpen(true)}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/course/linear-algebra')}>
            <BookOpen className="size-4" />
            <span className="hidden sm:inline">去上课程</span>
          </Button>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-4xl mx-auto space-y-8">
        <RelatedExplainers ids={['rank', 'positive-definite']} />
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <LearningSection moduleKey="linear" />
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="arithmetic">矩阵运算</TabsTrigger>
                <TabsTrigger value="basic">矩阵分析</TabsTrigger>
                <TabsTrigger value="equation">方程组</TabsTrigger>
                <TabsTrigger value="vector">向量</TabsTrigger>
                <TabsTrigger value="row-op">行变换</TabsTrigger>
                <TabsTrigger value="gs">施密特</TabsTrigger>
                <TabsTrigger value="matrix-test">矩阵判定</TabsTrigger>
                <TabsTrigger value="decompose">矩阵分解</TabsTrigger>
                <TabsTrigger value="dependence">向量组</TabsTrigger>
                <TabsTrigger value="least-squares">最小二乘</TabsTrigger>
                <TabsTrigger value="basis">基变换</TabsTrigger>
                <TabsTrigger value="advanced">SVD/约当</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                {/* 矩阵运算：加、减、数乘、幂 */}
                <TabsContent value="arithmetic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">矩阵 A（每行一行元素，空格分隔列）</label>
                      <Textarea value={arithA} onChange={e => setArithA(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={4} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">矩阵 B</label>
                      <Textarea value={arithB} onChange={e => setArithB(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={4} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">标量 k</label>
                      <Input value={arithK} onChange={e => setArithK(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">幂次 n</label>
                      <Input value={arithN} onChange={e => setArithN(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => computeArithmetic('add')} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />A + B
                    </Button>
                    <Button onClick={() => computeArithmetic('sub')} variant="secondary">A - B</Button>
                    <Button onClick={() => computeArithmetic('scalar')} variant="secondary">k · A</Button>
                    <Button onClick={() => computeArithmetic('power')} variant="secondary">Aⁿ</Button>
                  </div>
                </TabsContent>

                {/* 矩阵分析：det / inv / transpose / trace / rank / eigs */}
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">矩阵 A（每行一行元素，空格分隔列）</label>
                    <Textarea value={basicInput} onChange={e => setBasicInput(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={4} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => computeBasic('det')} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />行列式 |A|
                    </Button>
                    <Button onClick={() => computeBasic('inv')} variant="secondary">逆矩阵 A⁻¹</Button>
                    <Button onClick={() => computeBasic('transpose')} variant="secondary">转置 Aᵀ</Button>
                    <Button onClick={() => computeBasic('trace')} variant="secondary">迹 tr(A)</Button>
                    <Button onClick={() => computeBasic('rank')} variant="secondary">秩 rank(A)</Button>
                    <Button onClick={() => computeBasic('eigs')} variant="secondary">特征值</Button>
                  </div>
                </TabsContent>

                {/* 线性方程组 */}
                <TabsContent value="equation" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">系数矩阵 A（每行一行元素，空格分隔列）</label>
                    <Textarea value={eqA} onChange={e => setEqA(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={3} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">右端向量 b（空格分隔）</label>
                    <Input value={eqB} onChange={e => setEqB(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeEq} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />解 Ax = b
                  </Button>
                </TabsContent>

                {/* 向量 */}
                <TabsContent value="vector" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">向量 a（空格分隔）</label>
                      <Input value={vecA} onChange={e => setVecA(e.target.value)} className="font-mono" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">向量 b（空格分隔）</label>
                      <Input value={vecB} onChange={e => setVecB(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">范数 p</label>
                    <Input value={vecP} onChange={e => setVecP(e.target.value)} className="font-mono w-24" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => computeVector('dot')} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />内积 a·b
                    </Button>
                    <Button onClick={() => computeVector('cross')} variant="secondary">叉积 a×b (3D)</Button>
                    <Button onClick={() => computeVector('norm')} variant="secondary">向量范数</Button>
                    <Button onClick={() => computeVector('angle')} variant="secondary">向量夹角</Button>
                  </div>
                </TabsContent>

                {/* 行变换 */}
                <TabsContent value="row-op" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">矩阵 A（每行一行元素，空格分隔列）</label>
                    <Textarea value={refInput} onChange={e => setRefInput(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={4} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => computeRowOp('ref')} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />行阶梯形 (REF)
                    </Button>
                    <Button onClick={() => computeRowOp('rref')} variant="secondary">行最简形 (RREF)</Button>
                  </div>
                </TabsContent>

                {/* 施密特 */}
                <TabsContent value="gs" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">向量组（每行一个向量，空格分隔）</label>
                    <Textarea value={gsInput} onChange={e => setGsInput(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={4} />
                  </div>
                  <Button onClick={computeGS} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />正交单位化
                  </Button>
                </TabsContent>

                {/* 矩阵判定 */}
                <TabsContent value="matrix-test" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">方阵 A（每行一行元素，空格分隔列）</label>
                    <Textarea value={matrixInput} onChange={e => setMatrixInput(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={3} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => computeMatrixTest('orthogonal')} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      正交矩阵判定
                    </Button>
                    <Button onClick={() => computeMatrixTest('orthoTrans')} variant="secondary">正交变换判定</Button>
                    <Button onClick={() => computeMatrixTest('positive')} variant="secondary">正定判定</Button>
                    <Button onClick={() => computeMatrixTest('quadratic')} variant="secondary">二次型标准形</Button>
                    <Button onClick={() => computeMatrixTest('diagonalize')} variant="secondary">对角化判定</Button>
                  </div>
                </TabsContent>

                {/* 矩阵分解：LU / QR / 伴随 */}
                <TabsContent value="decompose" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">方阵 A（每行一行元素，空格分隔列）</label>
                    <Textarea value={luInput} onChange={e => setLuInput(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={3} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={computeLU} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />LU 分解
                    </Button>
                    <Button onClick={computeQR} variant="secondary">QR 分解</Button>
                    <Button onClick={computeAdjugate} variant="secondary">伴随矩阵</Button>
                  </div>
                </TabsContent>

                {/* 向量组：相关性 + 极大无关组 */}
                <TabsContent value="dependence" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">向量组（每行一个向量，空格分隔）</label>
                    <Textarea value={vsInput} onChange={e => setVsInput(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={4} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => computeDependence('dependence')} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />相关性判定
                    </Button>
                    <Button onClick={() => computeDependence('maxli')} variant="secondary">极大线性无关组</Button>
                  </div>
                </TabsContent>

                {/* 最小二乘法 */}
                <TabsContent value="least-squares" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">系数矩阵 A（每行一行元素，空格分隔列）</label>
                    <Textarea value={lsA} onChange={e => setLsA(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={4} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">观测向量 b（空格分隔）</label>
                    <Input value={lsB} onChange={e => setLsB(e.target.value)} className="font-mono" />
                  </div>
                  <Button onClick={computeLeastSquares} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />最小二乘解
                  </Button>
                </TabsContent>

                {/* 基变换 */}
                <TabsContent value="basis" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">基 A（每行一个基向量）</label>
                      <Textarea value={basisA} onChange={e => setBasisA(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={3} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">基 B（每行一个基向量）</label>
                      <Textarea value={basisB} onChange={e => setBasisB(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={3} />
                    </div>
                  </div>
                  <Button onClick={computeBasis} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Play className="size-4 mr-2" />求过渡矩阵 P
                  </Button>
                </TabsContent>

                {/* SVD / 约当 / 正规矩阵 */}
                <TabsContent value="advanced" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">矩阵 A（2×2 或 3×3，每行一行元素，空格分隔列）</label>
                    <Textarea value={svdInput} onChange={e => setSvdInput(e.target.value)} className="font-mono bg-card" spellCheck={false} rows={3} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={computeSVD} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Play className="size-4 mr-2" />SVD 分解
                    </Button>
                    <Button onClick={computeJordan} variant="secondary">约当标准形</Button>
                    <Button onClick={() => computeAdvTest('normal')} variant="secondary">正规矩阵判定</Button>
                    <Button onClick={() => computeAdvTest('orthogonal2')} variant="secondary">正交矩阵判定</Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    提示：SVD 支持任意 m×n 矩阵；约当标准形适用于 2×2/3×3 方阵。
                  </div>
                </TabsContent>
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
                    {steps && steps.length > 0 && result && !error && (
                      <button
                        type="button"
                        onClick={() => setShowSteps((s) => !s)}
                        className="h-7 px-2 text-xs text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 rounded-md transition-colors flex items-center gap-1"
                      >
                        <ListOrdered className="size-3.5" />
                        {showSteps ? '隐藏步骤' : '显示步骤'}
                        <span className="text-amber-500/60">({steps.length})</span>
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
                          setResultState(item.result);
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
                {viewMode === 'formatted' ? (
                  <div className="text-emerald-300 text-base leading-relaxed space-y-1.5 overflow-x-auto">
                    {result.split('\n').map((line, i) => (
                      <div key={i} className="text-right">
                        {line.trim() === '' ? (
                          <div className="h-2" />
                        ) : /^[\u4e00-\u9fa5]/.test(line.trim()) || /[：:]/.test(line) ? (
                          <span className="text-xs text-emerald-400/70 block mb-0.5">{line}</span>
                        ) : (
                          <span className="font-mono text-sm">{line}</span>
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
                  <div className="pt-4 border-t border-emerald-800/40 space-y-2 page-fade-in">
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
                <p>输入矩阵后点击「计算」查看结果</p>
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
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => loadExample(ex)}>
                  {ex.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CheatsheetDialog moduleKey="linearAlgebra" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
