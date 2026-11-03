import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import MathInputField from '@/components/MathInputField';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import { Play, Calculator, Type } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import { evaluate } from 'mathjs';
import { bisect, newtonMethod, trapezoidal, simpson, linearInterpolation } from '@/lib/math-utils';
import { formatScientificExact } from '@/lib/symbolic-format';
import { useHistory } from '@/hooks/useHistory';
import HistoryPanel from '@/components/HistoryPanel';
import {
  newtonInterpolation,
  hermiteInterpolation,
  cubicSplineNatural,
  leastSquaresFit,
  legendrePolynomial,
  chebyshevPolynomial,
  gaussLegendreQuadrature,
  rombergIntegration,
  jacobiIteration,
  gaussSeidelIteration,
  powerMethod,
  inversePowerMethod,
  qrEigenvalues,
  secantMethod,
  fixedPointIteration,
  newtonCotesQuadrature,
  numericalDerivative,
  sorIteration,
  errorAnalysis,
  hornerScheme,
} from '@/lib/numerical-advanced';
import { toast } from 'sonner';

// 解析辅助
function parseMatrix(s: string): number[][] {
  return s.split(';').map((row) =>
    row.split(',').map((x) => parseFloat(x.trim())).filter((x) => !isNaN(x))
  ).filter((row) => row.length > 0);
}

function parseNumList(s: string): number[] {
  return s.split(/[,\\s]+/).map((x) => parseFloat(x.trim())).filter((x) => !isNaN(x));
}

export default function NumericalAnalysisPage() {
  const [activeTab, setActiveTab] = useState('bisect');
  const [result, setResult] = useState('');
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted');
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history: calcHistory, addItem, clearHistory } = useHistory({ storageKey: 'mathforge_num_history' });
  const lastResultRef = useRef('');

  // 监听结果变化，自动记录历史
  useEffect(() => {
    if (result && result !== lastResultRef.current && !error) {
      addItem(activeTab, result);
      lastResultRef.current = result;
    }
  }, [result, error, activeTab, addItem]);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

  // --- 已有 ---
  const [bisectExpr, setBisectExpr] = useState('x^3 - 2*x - 5');
  const [bisectA, setBisectA] = useState('2');
  const [bisectB, setBisectB] = useState('3');

  const [newtonExpr, setNewtonExpr] = useState('x^3 - 2*x - 5');
  const [newtonX0, setNewtonX0] = useState('2');

  const [trapExpr, setTrapExpr] = useState('sin(x)/x');
  const [trapA, setTrapA] = useState('1');
  const [trapB, setTrapB] = useState('5');
  const [trapN, setTrapN] = useState('100');

  const [simpExpr, setSimpExpr] = useState('exp(-x^2)');
  const [simpA, setSimpA] = useState('-1');
  const [simpB, setSimpB] = useState('1');
  const [simpN, setSimpN] = useState('100');

  const [x1, setX1] = useState('0');
  const [y1, setY1] = useState('1');
  const [x2, setX2] = useState('2');
  const [y2, setY2] = useState('5');
  const [xi, setXi] = useState('1');

  // --- 新增: 插值 ---
  const [newtonXs, setNewtonXs] = useState('-2, 1, 2');
  const [newtonYs, setNewtonYs] = useState('0, 1, 2');

  const [hermiteX0, setHermiteX0] = useState('0');
  const [hermiteY0, setHermiteY0] = useState('1');
  const [hermiteM0, setHermiteM0] = useState('0');
  const [hermiteX1, setHermiteX1] = useState('1');
  const [hermiteY1, setHermiteY1] = useState('2');
  const [hermiteM1, setHermiteM1] = useState('2');

  const [splineXs, setSplineXs] = useState('0, 1, 2, 3');
  const [splineYs, setSplineYs] = useState('0, 1, 1, 0');

  // --- 新增: 拟合 ---
  const [fitXs, setFitXs] = useState('0, 1, 2, 3, 4');
  const [fitYs, setFitYs] = useState('1, 2, 3, 4, 5');
  const [fitType, setFitType] = useState<'linear' | 'quadratic' | 'exponential'>('linear');

  // --- 新增: 正交多项式 ---
  const [polyType, setPolyType] = useState<'legendre' | 'chebyshev'>('legendre');
  const [polyOrder, setPolyOrder] = useState('4');

  // --- 新增: 高斯求积 ---
  const [gaussExpr, setGaussExpr] = useState('x^2');
  const [gaussA, setGaussA] = useState('0');
  const [gaussB, setGaussB] = useState('1');
  const [gaussPoints, setGaussPoints] = useState('3');

  // --- 新增: 龙贝格 ---
  const [rombergExpr, setRombergExpr] = useState('exp(x)');
  const [rombergA, setRombergA] = useState('0');
  const [rombergB, setRombergB] = useState('1');

  // --- 新增: 迭代法 ---
  const [iterMatrix, setIterMatrix] = useState('4, 1; 2, 3');
  const [iterB, setIterB] = useState('3, 2');
  const [iterX0, setIterX0] = useState('0, 0');

  // --- 新增: 特征值 ---
  const [eigenMatrix, setEigenMatrix] = useState('2, 1; 1, 2');

  // --- 新增: 弦截法 ---
  const [secantExpr, setSecantExpr] = useState('x^3 - 2*x - 5');
  const [secantX0, setSecantX0] = useState('2');
  const [secantX1, setSecantX1] = useState('3');

  // --- 新增: 不动点 ---
  const [fpExpr, setFpExpr] = useState('cos(x)');
  const [fpX0, setFpX0] = useState('0.5');

  // --- 牛顿-科茨求积 ---
  const [ncExpr, setNcExpr] = useState('x^3');
  const [ncA, setNcA] = useState('0');
  const [ncB, setNcB] = useState('1');
  const [ncN, setNcN] = useState('2');

  // --- 数值微分 ---
  const [ndExpr, setNdExpr] = useState('sin(x)');
  const [ndX0, setNdX0] = useState('1');
  const [ndH, setNdH] = useState('0.001');
  const [ndType, setNdType] = useState<'forward' | 'central' | 'three-point'>('central');

  // --- SOR 迭代 ---
  const [sorMatrix, setSorMatrix] = useState('4, 1; 2, 3');
  const [sorB, setSorB] = useState('3, 2');
  const [sorOmega, setSorOmega] = useState('1.2');
  const [sorX0, setSorX0] = useState('0, 0');

  // --- 误差分析 ---
  const [errApprox, setErrApprox] = useState('3.14');
  const [errExact, setErrExact] = useState('pi');

  // --- 秦九韶算法 ---
  const [hornerCoeffs, setHornerCoeffs] = useState('2, -3, 1, -5');
  const [hornerX, setHornerX] = useState('2');

  const compute = useCallback(() => {
    setError(null);
    setResult('');
    try {
      let res = '';
      switch (activeTab) {
        // ---------- 基础方法 ----------
        case 'bisect': {
          const a = parseFloat(bisectA);
          const b = parseFloat(bisectB);
          if (isNaN(a) || isNaN(b)) throw new Error('请输入有效数字');
          const { root, iterations } = bisect(bisectExpr, a, b, 1e-10, 100);
          if (root === null) {
            res = `未找到根：f(a) 和 f(b) 同号或函数不连续\nf(${a}) = ${evaluate(bisectExpr, { x: a })}\nf(${b}) = ${evaluate(bisectExpr, { x: b })}`;
          } else {
            res = `根 ≈ ${root}\n迭代次数: ${iterations}`;
          }
          break;
        }
        case 'newton': {
          const x0v = parseFloat(newtonX0);
          if (isNaN(x0v)) throw new Error('请输入有效数字');
          const { root, iterations } = newtonMethod(newtonExpr, x0v, 100, 1e-10);
          if (root === null) {
            res = '未收敛：可能导数为 0 或超出迭代次数';
          } else {
            res = `根 ≈ ${root}\n迭代次数: ${iterations}`;
          }
          break;
        }
        case 'trapezoid': {
          const a = parseFloat(trapA), b = parseFloat(trapB);
          const n = parseInt(trapN, 10);
          if (isNaN(a) || isNaN(b) || isNaN(n)) throw new Error('请输入有效数字');
          const val = trapezoidal(trapExpr, a, b, n);
          res = `∫(${trapExpr}) dx 在 [${a}, ${b}] 上的梯形法近似\n  ≈ ${formatScientificExact(val)}\n  划分: ${n} 份`;
          break;
        }
        case 'simpson': {
          const a = parseFloat(simpA), b = parseFloat(simpB);
          const n = parseInt(simpN, 10);
          if (isNaN(a) || isNaN(b) || isNaN(n)) throw new Error('请输入有效数字');
          const nEven = n % 2 === 0 ? n : n + 1;
          const val = simpson(simpExpr, a, b, nEven);
          res = `∫(${simpExpr}) dx 在 [${a}, ${b}] 上的辛普森法近似\n  ≈ ${formatScientificExact(val)}\n  划分: ${nEven} 份`;
          break;
        }
        case 'interpolate': {
          const x1v = parseFloat(x1), y1v = parseFloat(y1);
          const x2v = parseFloat(x2), y2v = parseFloat(y2);
          const xiv = parseFloat(xi);
          if ([x1v, y1v, x2v, y2v, xiv].some((v) => isNaN(v))) throw new Error('请输入有效数字');
          if (x1v === x2v) throw new Error('x1 不能等于 x2');
          const y = linearInterpolation(x1v, y1v, x2v, y2v, xiv);
          const slope = (y2v - y1v) / (x2v - x1v);
          res = `两点 (${x1v}, ${y1v}) 和 (${x2v}, ${y2v}) 插值\n斜率 k = ${formatScientificExact(slope)}\n直线方程: y = ${formatScientificExact(y1v - slope * x1v)} + ${formatScientificExact(slope)}x\n\n在 x = ${xiv} 处: y = ${formatScientificExact(y)}`;
          break;
        }

        // ---------- 牛顿插值 ----------
        case 'newton-interp': {
          const xs = parseNumList(newtonXs);
          const ys = parseNumList(newtonYs);
          if (xs.length < 2 || xs.length !== ys.length) throw new Error('请输入至少 2 个点，且 x 和 y 数量一致');
          const { dividedDifferences, polynomial } = newtonInterpolation(xs, ys);
          // 生成差商表
          let table = '【差商表】\n';
          table += 'k   x_k     f[x_k]   ' + Array.from({ length: xs.length - 1 }, (_, i) => `${i + 1}阶差商`).join('   ') + '\n';
          for (let i = 0; i < xs.length; i++) {
            const row = [
              i.toString(),
              xs[i].toFixed(4),
              ...dividedDifferences[i].map((v) => v.toFixed(4)),
            ];
            table += row.join('  ') + '\n';
          }
          res = table + `\n【牛顿插值多项式】\n${polynomial}`;
          break;
        }

        // ---------- 埃尔米特插值 ----------
        case 'hermite': {
          const x0v = parseFloat(hermiteX0), y0v = parseFloat(hermiteY0), m0v = parseFloat(hermiteM0);
          const x1v = parseFloat(hermiteX1), y1v = parseFloat(hermiteY1), m1v = parseFloat(hermiteM1);
          if ([x0v, y0v, m0v, x1v, y1v, m1v].some((v) => isNaN(v))) throw new Error('请输入有效数字');
          if (x0v === x1v) throw new Error('x0 不能等于 x1');
          const { polynomial, evaluate: evalFn } = hermiteInterpolation(x0v, y0v, m0v, x1v, y1v, m1v);
          res = `${polynomial}\n\n验证: H(${x0v}) = ${evalFn(x0v).toFixed(6)}, H'(${x0v}) ≈ ${((evalFn(x0v + 0.001) - evalFn(x0v - 0.001)) / 0.002).toFixed(6)}\nH(${x1v}) = ${evalFn(x1v).toFixed(6)}, H'(${x1v}) ≈ ${((evalFn(x1v + 0.001) - evalFn(x1v - 0.001)) / 0.002).toFixed(6)}`;
          break;
        }

        // ---------- 三次样条 ----------
        case 'spline': {
          const xs = parseNumList(splineXs);
          const ys = parseNumList(splineYs);
          if (xs.length < 3 || xs.length !== ys.length) throw new Error('请输入至少 3 个点，且 x 和 y 数量一致');
          const { segments, evaluate: evalFn } = cubicSplineNatural(xs, ys);
          let segs = '【分段三次多项式】（自然样条，两端二阶导为 0）\n';
          segments.forEach((s, i) => {
            segs += `S_${i}(x) = ${s.a.toFixed(4)} + ${s.b.toFixed(4)}(x-${s.x.toFixed(4)}) + ${s.c.toFixed(4)}(x-${s.x.toFixed(4)})² + ${s.d.toFixed(4)}(x-${s.x.toFixed(4)})³\n  区间: [${xs[i]}, ${xs[i + 1]}]\n`;
          });
          // 验证中点
          const mid = (xs[0] + xs[xs.length - 1]) / 2;
          res = segs + `\n验证: 中点 x=${mid.toFixed(2)} 处 S(x) = ${evalFn(mid).toFixed(6)}`;
          break;
        }

        // ---------- 最小二乘拟合 ----------
        case 'least-squares': {
          const xs = parseNumList(fitXs);
          const ys = parseNumList(fitYs);
          if (xs.length < 2 || xs.length !== ys.length) throw new Error('请输入至少 2 个数据点');
          const { formula, error: err } = leastSquaresFit(xs, ys, fitType);
          res = `【拟合结果】\n${formula}\n\n【误差平方和】${formatScientificExact(err)}\n【相关系数说明】共 ${xs.length} 个数据点，最小二乘拟合`;
          break;
        }

        // ---------- 正交多项式 ----------
        case 'ortho-poly': {
          const n = parseInt(polyOrder, 10);
          if (isNaN(n) || n < 0) throw new Error('请输入非负整数阶数');
          if (polyType === 'legendre') {
            const { formula, evaluate: evalFn } = legendrePolynomial(n);
            res = `【勒让德多项式 P_${n}(x)】\n${formula}\n\n递推关系: (n+1)P_{n+1} = (2n+1)x·P_n - n·P_{n-1}\n验证: P_${n}(1) = ${evalFn(1).toFixed(6)}（应为 1）`;
          } else {
            const { formula, roots, evaluate: evalFn } = chebyshevPolynomial(n);
            res = `【第一类切比雪夫多项式 T_${n}(x)】\n${formula}\n\n递推关系: T_{n+1} = 2x·T_n - T_{n-1}\n零点: ${roots.map((r) => r.toFixed(6)).join(', ')}\n验证: T_${n}(1) = ${evalFn(1).toFixed(6)}（应为 1）`;
          }
          break;
        }

        // ---------- 高斯-勒让德求积 ----------
        case 'gauss-legendre': {
          const a = parseFloat(gaussA), b = parseFloat(gaussB);
          const nPts = parseInt(gaussPoints, 10);
          if (isNaN(a) || isNaN(b) || isNaN(nPts)) throw new Error('请输入有效数字');
          const { nodes, weights, result: val } = gaussLegendreQuadrature(gaussExpr, a, b, nPts);
          res = `【${nPts} 点 Gauss-Legendre 求积】\n∫(${gaussExpr}) dx 在 [${a}, ${b}]\n\n节点: ${nodes.map((x) => x.toFixed(8)).join(', ')}\n权重: ${weights.map((w) => w.toFixed(8)).join(', ')}\n\n积分值 ≈ ${formatScientificExact(val)}`;
          break;
        }

        // ---------- 龙贝格积分 ----------
        case 'romberg': {
          const a = parseFloat(rombergA), b = parseFloat(rombergB);
          if (isNaN(a) || isNaN(b)) throw new Error('请输入有效数字');
          const { table, result: val, iterations } = rombergIntegration(rombergExpr, a, b);
          let tableStr = '【Romberg 表】 R[i][j]\n';
          table.forEach((row, i) => {
            tableStr += `h=${((b - a) / Math.pow(2, i)).toExponential(2)}  `;
            row.forEach((v) => { tableStr += v.toFixed(8) + '  '; });
            tableStr += '\n';
          });
          res = tableStr + `\n结果 ≈ ${formatScientificExact(val)}\n迭代次数: ${iterations}`;
          break;
        }

        // ---------- 雅可比迭代 ----------
        case 'jacobi': {
          const A = parseMatrix(iterMatrix);
          const b = parseNumList(iterB);
          const x0Arr = parseNumList(iterX0);
          if (A.length < 2 || A.some((r) => r.length !== A.length)) throw new Error('请输入有效的方阵');
          if (b.length !== A.length || x0Arr.length !== A.length) throw new Error('向量维度需与矩阵阶数匹配');
          const { solution, iterations, converged, history } = jacobiIteration(A, b, x0Arr, 1e-8, 200);
          res = `【雅可比迭代】\n${converged ? '✓ 收敛' : '✗ 未收敛'}\n迭代次数: ${iterations}\n\n解: [${solution.map((v) => v.toFixed(8)).join(', ')}]\n\n迭代历史（前 5 步）:\n${history.slice(0, 5).map((h, i) => `  第 ${i} 步: [${h.map((v) => v.toFixed(4)).join(', ')}]`).join('\n')}`;
          break;
        }

        // ---------- 高斯-赛德尔迭代 ----------
        case 'gauss-seidel': {
          const A = parseMatrix(iterMatrix);
          const b = parseNumList(iterB);
          const x0Arr = parseNumList(iterX0);
          if (A.length < 2 || A.some((r) => r.length !== A.length)) throw new Error('请输入有效的方阵');
          if (b.length !== A.length || x0Arr.length !== A.length) throw new Error('向量维度需与矩阵阶数匹配');
          const { solution, iterations, converged, history } = gaussSeidelIteration(A, b, x0Arr, 1e-8, 200);
          res = `【高斯-赛德尔迭代】\n${converged ? '✓ 收敛' : '✗ 未收敛'}\n迭代次数: ${iterations}\n\n解: [${solution.map((v) => v.toFixed(8)).join(', ')}]\n\n迭代历史（前 5 步）:\n${history.slice(0, 5).map((h, i) => `  第 ${i} 步: [${h.map((v) => v.toFixed(4)).join(', ')}]`).join('\n')}`;
          break;
        }

        // ---------- 幂法 ----------
        case 'power-method': {
          const A = parseMatrix(eigenMatrix);
          if (A.length < 2 || A.some((r) => r.length !== A.length)) throw new Error('请输入有效的方阵');
          const n = A.length;
          const x0Arr = new Array(n).fill(1);
          const { eigenvalue, eigenvector, iterations, converged } = powerMethod(A, x0Arr);
          res = `【幂法求最大特征值】\n${converged ? '✓ 收敛' : '✗ 未收敛'}\n迭代次数: ${iterations}\n\n按模最大特征值 ≈ ${eigenvalue.toFixed(8)}\n\n对应特征向量:\n[${eigenvector.map((v) => v.toFixed(6)).join(', ')}]`;
          break;
        }

        // ---------- 反幂法 ----------
        case 'inv-power-method': {
          const A = parseMatrix(eigenMatrix);
          if (A.length < 2 || A.some((r) => r.length !== A.length)) throw new Error('请输入有效的方阵');
          const n = A.length;
          const x0Arr = new Array(n).fill(1);
          try {
            const { eigenvalue, eigenvector, iterations, converged } = inversePowerMethod(A, x0Arr);
            res = `【反幂法求最小特征值】\n${converged ? '✓ 收敛' : '✗ 未收敛'}\n迭代次数: ${iterations}\n\n按模最小特征值 ≈ ${eigenvalue.toFixed(8)}\n\n对应特征向量:\n[${eigenvector.map((v) => v.toFixed(6)).join(', ')}]`;
          } catch (e) {
            res = `反幂法失败: ${(e as Error).message}\n（矩阵可能奇异或接近奇异）`;
          }
          break;
        }

        // ---------- QR 算法 ----------
        case 'qr-method': {
          const A = parseMatrix(eigenMatrix);
          if (A.length < 2 || A.some((r) => r.length !== A.length)) throw new Error('请输入有效的方阵');
          const evs = qrEigenvalues(A, 300, 1e-10);
          res = `【QR 算法求全部特征值】\n（基于 QR 迭代，适用于实矩阵）\n\n特征值:\n${evs.map((v, i) => `  λ_${i + 1} ≈ ${v.toFixed(8)}`).join('\n')}`;
          break;
        }

        // ---------- 弦截法 ----------
        case 'secant': {
          const x0v = parseFloat(secantX0), x1v = parseFloat(secantX1);
          if (isNaN(x0v) || isNaN(x1v)) throw new Error('请输入有效数字');
          const { root, iterations, history } = secantMethod(secantExpr, x0v, x1v);
          if (root === null) {
            res = '弦截法未收敛：可能两点处函数值接近或导数为零';
          } else {
            res = `【弦截法（割线法）】\n根 ≈ ${root}\n迭代次数: ${iterations}\n\n迭代历史:\n${history.slice(0, 8).map((x, i) => `  x_${i} = ${x.toFixed(8)}`).join('\n')}`;
          }
          break;
        }

        // ---------- 不动点迭代 ----------
        case 'fixed-point': {
          const x0v = parseFloat(fpX0);
          if (isNaN(x0v)) throw new Error('请输入有效初始值');
          const { root, iterations, converged, history } = fixedPointIteration(fpExpr, x0v);
          if (root === null) {
            res = '不动点迭代失败：迭代过程中出现非有限值';
          } else {
            res = `【不动点迭代 x = g(x)】\ng(x) = ${fpExpr}\n\n${converged ? '✓ 收敛' : '✗ 未收敛'}\n迭代次数: ${iterations}\n\n不动点 ≈ ${root.toFixed(10)}\n\n迭代历史（前 10 步）:\n${history.slice(0, 10).map((x, i) => `  x_${i} = ${x.toFixed(8)}`).join('\n')}`;
          }
          break;
        }
        // ---------- 牛顿-科茨求积 ----------
        case 'newton-cotes': {
          const a = parseFloat(ncA), b = parseFloat(ncB), n = parseInt(ncN, 10);
          if (isNaN(a) || isNaN(b) || isNaN(n)) throw new Error('请输入有效数字');
          const { value, formula, degree } = newtonCotesQuadrature(ncExpr, a, b, n);
          res = `【${formula}】\n代数精度：${degree} 次\n积分区间：[${a}, ${b}]\n\n积分值 ≈ ${value.toFixed(12)}`;
          break;
        }
        // ---------- 数值微分 ----------
        case 'numerical-derivative': {
          const x0v = parseFloat(ndX0), hv = parseFloat(ndH);
          if (isNaN(x0v) || isNaN(hv)) throw new Error('请输入有效数字');
          const { value, formula, error } = numericalDerivative(ndExpr, x0v, hv, ndType);
          const typeName = ndType === 'forward' ? '前向差商' : ndType === 'central' ? '中心差商' : '三点公式';
          res = `【数值微分 - ${typeName}】\n公式：${formula}\n步长 h = ${hv}\n截断误差：${error}\n\nf'(${x0v}) ≈ ${value.toFixed(12)}`;
          break;
        }
        // ---------- SOR 迭代 ----------
        case 'sor': {
          const A = parseMatrix(sorMatrix);
          const b = sorB.split(',').map((s) => parseFloat(s.trim()));
          const x0v = sorX0.split(',').map((s) => parseFloat(s.trim()));
          const omega = parseFloat(sorOmega);
          if (A.length === 0 || A.some((r) => r.length !== A.length)) throw new Error('请输入有效的方阵');
          if (b.length !== A.length) throw new Error('b 维数与矩阵不匹配');
          const { solution, iterations, converged } = sorIteration(A, b, omega, x0v);
          if (!solution) throw new Error('SOR 迭代失败');
          res = `【SOR 超松弛迭代】\n松弛因子 ω = ${omega}\n\n${converged ? '✓ 收敛' : '✗ 未收敛'}\n迭代次数: ${iterations}\n\n解: x = [${solution.map((x) => x.toFixed(8)).join(', ')}]`;
          break;
        }
        // ---------- 误差分析 ----------
        case 'error-analysis': {
          const approx = parseFloat(errApprox);
          const exact = evaluate(errExact) as number;
          if (isNaN(approx) || isNaN(exact)) throw new Error('请输入有效数字');
          const { absError, relError, significantDigits, hint } = errorAnalysis(approx, exact);
          res = hint + `\n\n近似值: ${approx}\n精确值: ${exact.toFixed(10)}`;
          res += `\n\n绝对误差 = ${absError.toExponential(6)}\n相对误差 = ${relError.toExponential(6)}\n有效数字 ≈ ${significantDigits} 位`;
          break;
        }
        // ---------- 秦九韶算法 ----------
        case 'horner': {
          const coeffs = hornerCoeffs.split(',').map((s) => parseFloat(s.trim()));
          const x = parseFloat(hornerX);
          if (coeffs.some((c) => isNaN(c)) || isNaN(x)) throw new Error('请输入有效数字');
          const { value, steps } = hornerScheme(coeffs, x);
          const polyStr = coeffs.map((c, i) => {
            const pow = coeffs.length - 1 - i;
            const sign = i === 0 ? (c < 0 ? '-' : '') : c >= 0 ? ' + ' : ' - ';
            const absC = Math.abs(c);
            if (pow === 0) return `${sign}${absC}`;
            if (pow === 1) return `${sign}${absC}x`;
            return `${sign}${absC}x^${pow}`;
          }).join('').replace(/^\+ /, '');
          res = `【秦九韶算法（霍纳法则）】\nP(x) = ${polyStr}\nP(${x}) = ?\n\n递推过程：\n${steps.map((s) => `  k=${s.k}: b = ${s.intermediate.toFixed(8)}`).join('\n')}\n\nP(${x}) = ${value.toFixed(12)}`;
          break;
        }
      }
      setResult(res);
    } catch (e) {
      const msg = (e as Error).message || '计算错误';
      setError(msg);
      setResult('');
      toast.error(msg);
    }
  }, [activeTab, bisectExpr, bisectA, bisectB, newtonExpr, newtonX0,
      trapExpr, trapA, trapB, trapN, simpExpr, simpA, simpB, simpN,
      x1, y1, x2, y2, xi, newtonXs, newtonYs, hermiteX0, hermiteY0, hermiteM0,
      hermiteX1, hermiteY1, hermiteM1, splineXs, splineYs, fitXs, fitYs, fitType,
      polyType, polyOrder, gaussExpr, gaussA, gaussB, gaussPoints, rombergExpr,
      rombergA, rombergB, iterMatrix, iterB, iterX0, eigenMatrix, secantExpr,
      secantX0, secantX1, fpExpr, fpX0,
      ncExpr, ncA, ncB, ncN, ndExpr, ndX0, ndH, ndType,
      sorMatrix, sorB, sorOmega, sorX0, errApprox, errExact,
      hornerCoeffs, hornerX]);

  return (
    <div className="min-h-screen page-fade-in">
      <PageHeader
        title="数值分析"
        description="数值方法大全：方程求根（二分法、牛顿法、弦截法、不动点），数值积分（梯形/辛普森/高斯/龙贝格），插值与拟合，线性方程组迭代，特征值计算。"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-4xl mx-auto space-y-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex-wrap h-auto">
                <div className="text-xs font-medium text-muted-foreground w-full mb-1 px-2">方程求根</div>
                <TabsTrigger value="bisect">二分法</TabsTrigger>
                <TabsTrigger value="newton">牛顿法</TabsTrigger>
                <TabsTrigger value="secant">弦截法</TabsTrigger>
                <TabsTrigger value="fixed-point">不动点</TabsTrigger>

                <div className="text-xs font-medium text-muted-foreground w-full mb-1 px-2 mt-2">数值积分</div>
                <TabsTrigger value="trapezoid">梯形法</TabsTrigger>
                <TabsTrigger value="simpson">辛普森法</TabsTrigger>
                <TabsTrigger value="gauss-legendre">高斯求积</TabsTrigger>
                <TabsTrigger value="romberg">龙贝格</TabsTrigger>
                <TabsTrigger value="newton-cotes">牛顿-科茨</TabsTrigger>
                <TabsTrigger value="numerical-derivative">数值微分</TabsTrigger>

                <div className="text-xs font-medium text-muted-foreground w-full mb-1 px-2 mt-2">插值与拟合</div>
                <TabsTrigger value="interpolate">线性插值</TabsTrigger>
                <TabsTrigger value="newton-interp">牛顿插值</TabsTrigger>
                <TabsTrigger value="hermite">埃尔米特</TabsTrigger>
                <TabsTrigger value="spline">三次样条</TabsTrigger>
                <TabsTrigger value="least-squares">最小二乘</TabsTrigger>

                <div className="text-xs font-medium text-muted-foreground w-full mb-1 px-2 mt-2">线性代数迭代</div>
                <TabsTrigger value="jacobi">雅可比</TabsTrigger>
                <TabsTrigger value="gauss-seidel">高斯-赛德尔</TabsTrigger>
                <TabsTrigger value="sor">SOR 迭代</TabsTrigger>
                <TabsTrigger value="power-method">幂法</TabsTrigger>
                <TabsTrigger value="inv-power-method">反幂法</TabsTrigger>
                <TabsTrigger value="qr-method">QR算法</TabsTrigger>

                <div className="text-xs font-medium text-muted-foreground w-full mb-1 px-2 mt-2">正交多项式</div>
                <TabsTrigger value="ortho-poly">Legendre/Chebyshev</TabsTrigger>
                <TabsTrigger value="error-analysis">误差分析</TabsTrigger>
                <TabsTrigger value="horner">秦九韶算法</TabsTrigger>
              </TabsList>

              <div className="mt-5 space-y-4">
                {/* 二分法 */}
                {activeTab === 'bisect' && (
                  <>
                    <MathInputField
                      value={bisectExpr}
                      onChange={setBisectExpr}
                      label="f(x)"
                      showPalette
                      defaultPreview
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">区间左端点 a</label><Input value={bisectA} onChange={(e) => setBisectA(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">区间右端点 b</label><Input value={bisectB} onChange={(e) => setBisectB(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {/* 牛顿法 */}
                {activeTab === 'newton' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">f(x)</label><Input value={newtonExpr} onChange={(e) => setNewtonExpr(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">初始值 x₀</label><Input value={newtonX0} onChange={(e) => setNewtonX0(e.target.value)} className="font-mono w-40" /></div>
                  </>
                )}

                {/* 弦截法 */}
                {activeTab === 'secant' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">f(x)</label><Input value={secantExpr} onChange={(e) => setSecantExpr(e.target.value)} className="font-mono" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">初始点 x₀</label><Input value={secantX0} onChange={(e) => setSecantX0(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">初始点 x₁</label><Input value={secantX1} onChange={(e) => setSecantX1(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {/* 不动点 */}
                {activeTab === 'fixed-point' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">求解 x = g(x) 形式的不动点</div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">g(x)</label><Input value={fpExpr} onChange={(e) => setFpExpr(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">初始值 x₀</label><Input value={fpX0} onChange={(e) => setFpX0(e.target.value)} className="font-mono w-40" /></div>
                  </>
                )}

                {/* 梯形法 */}
                {activeTab === 'trapezoid' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">被积函数 f(x)</label><Input value={trapExpr} onChange={(e) => setTrapExpr(e.target.value)} className="font-mono" /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={trapA} onChange={(e) => setTrapA(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">b</label><Input value={trapB} onChange={(e) => setTrapB(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">n (份数)</label><Input value={trapN} onChange={(e) => setTrapN(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {/* 辛普森法 */}
                {activeTab === 'simpson' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">被积函数 f(x)</label><Input value={simpExpr} onChange={(e) => setSimpExpr(e.target.value)} className="font-mono" /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={simpA} onChange={(e) => setSimpA(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">b</label><Input value={simpB} onChange={(e) => setSimpB(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">n (偶数)</label><Input value={simpN} onChange={(e) => setSimpN(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {/* 高斯求积 */}
                {activeTab === 'gauss-legendre' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">被积函数 f(x)</label><Input value={gaussExpr} onChange={(e) => setGaussExpr(e.target.value)} className="font-mono" /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={gaussA} onChange={(e) => setGaussA(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">b</label><Input value={gaussB} onChange={(e) => setGaussB(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">节点数</label>
                        <Select value={gaussPoints} onValueChange={setGaussPoints}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 点</SelectItem>
                            <SelectItem value="3">3 点</SelectItem>
                            <SelectItem value="5">5 点</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {/* 龙贝格 */}
                {activeTab === 'romberg' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">被积函数 f(x)</label><Input value={rombergExpr} onChange={(e) => setRombergExpr(e.target.value)} className="font-mono" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={rombergA} onChange={(e) => setRombergA(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">b</label><Input value={rombergB} onChange={(e) => setRombergB(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {/* 牛顿-科茨求积 */}
                {activeTab === 'newton-cotes' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">被积函数 f(x)</label><Input value={ncExpr} onChange={(e) => setNcExpr(e.target.value)} className="font-mono" /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">a</label><Input value={ncA} onChange={(e) => setNcA(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">b</label><Input value={ncB} onChange={(e) => setNcB(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">n (1~4)</label><Input value={ncN} onChange={(e) => setNcN(e.target.value)} className="font-mono" /></div>
                    </div>
                    <p className="text-xs text-muted-foreground">n=1 梯形、n=2 辛普森、n=3 辛普森3/8、n=4 柯茨公式</p>
                  </>
                )}

                {/* 数值微分 */}
                {activeTab === 'numerical-derivative' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">函数 f(x)</label><Input value={ndExpr} onChange={(e) => setNdExpr(e.target.value)} className="font-mono" /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">x₀</label><Input value={ndX0} onChange={(e) => setNdX0(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">步长 h</label><Input value={ndH} onChange={(e) => setNdH(e.target.value)} className="font-mono" /></div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">方法</label>
                        <Select value={ndType} onValueChange={(v) => setNdType(v as any)}>
                          <SelectTrigger className="font-mono"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="forward">前向差商</SelectItem>
                            <SelectItem value="central">中心差商</SelectItem>
                            <SelectItem value="three-point">三点公式</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {/* 线性插值 */}
                {activeTab === 'interpolate' && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">x₁</label><Input value={x1} onChange={(e) => setX1(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">y₁</label><Input value={y1} onChange={(e) => setY1(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">x₂</label><Input value={x2} onChange={(e) => setX2(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">y₂</label><Input value={y2} onChange={(e) => setY2(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">插值点 x</label><Input value={xi} onChange={(e) => setXi(e.target.value)} className="font-mono" /></div>
                  </div>
                )}

                {/* 牛顿插值 */}
                {activeTab === 'newton-interp' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">x 值（逗号分隔）</label><Input value={newtonXs} onChange={(e) => setNewtonXs(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">y 值（逗号分隔）</label><Input value={newtonYs} onChange={(e) => setNewtonYs(e.target.value)} className="font-mono" /></div>
                    </div>
                    <p className="text-xs text-muted-foreground">牛顿插值法基于差商表，构造 N_n(x) = f[x0] + f[x0,x1](x-x0) + ... + f[x0,...,xn](x-x0)...(x-x_n-1)</p>
                  </>
                )}

                {/* 埃尔米特插值 */}
                {activeTab === 'hermite' && (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">两点三次埃尔米特插值 H₃(x)：满足 H(x_i)=y_i, H'(x_i)=m_i</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">x₀</label><Input value={hermiteX0} onChange={(e) => setHermiteX0(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">y₀</label><Input value={hermiteY0} onChange={(e) => setHermiteY0(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">y'(x₀)</label><Input value={hermiteM0} onChange={(e) => setHermiteM0(e.target.value)} className="font-mono" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">x₁</label><Input value={hermiteX1} onChange={(e) => setHermiteX1(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">y₁</label><Input value={hermiteY1} onChange={(e) => setHermiteY1(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">y'(x₁)</label><Input value={hermiteM1} onChange={(e) => setHermiteM1(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {/* 三次样条 */}
                {activeTab === 'spline' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">x 值（逗号分隔）</label><Input value={splineXs} onChange={(e) => setSplineXs(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">y 值（逗号分隔）</label><Input value={splineYs} onChange={(e) => setSplineYs(e.target.value)} className="font-mono" /></div>
                    </div>
                    <p className="text-xs text-muted-foreground">自然三次样条：S''(x₀) = S''(x_n) = 0，分段三次多项式拼接处 C² 连续</p>
                  </>
                )}

                {/* 最小二乘 */}
                {activeTab === 'least-squares' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">x 值</label><Input value={fitXs} onChange={(e) => setFitXs(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">y 值</label><Input value={fitYs} onChange={(e) => setFitYs(e.target.value)} className="font-mono" /></div>
                    </div>
                    <div className="max-w-xs">
                      <label className="text-sm font-medium text-foreground mb-2 block">拟合类型</label>
                      <Select value={fitType} onValueChange={(v) => setFitType(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">一次直线 y = ax + b</SelectItem>
                          <SelectItem value="quadratic">二次抛物线 y = ax² + bx + c</SelectItem>
                          <SelectItem value="exponential">指数 y = a·e^(bx)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* 正交多项式 */}
                {activeTab === 'ortho-poly' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">多项式类型</label>
                        <Select value={polyType} onValueChange={(v) => setPolyType(v as any)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="legendre">勒让德 P_n(x)</SelectItem>
                            <SelectItem value="chebyshev">切比雪夫 T_n(x)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">阶数 n</label><Input value={polyOrder} onChange={(e) => setPolyOrder(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {/* 误差分析 */}
                {activeTab === 'error-analysis' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">近似值</label><Input value={errApprox} onChange={(e) => setErrApprox(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">精确值（表达式）</label><Input value={errExact} onChange={(e) => setErrExact(e.target.value)} className="font-mono" /></div>
                  </div>
                )}

                {/* 秦九韶算法 */}
                {activeTab === 'horner' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2"><label className="text-sm font-medium text-foreground mb-2 block">系数（高次到低次，逗号分隔）</label><Input value={hornerCoeffs} onChange={(e) => setHornerCoeffs(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">x = </label><Input value={hornerX} onChange={(e) => setHornerX(e.target.value)} className="font-mono" /></div>
                  </div>
                )}

                {/* 雅可比 / 高斯-赛德尔 */}
                {(activeTab === 'jacobi' || activeTab === 'gauss-seidel') && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">系数矩阵 A（行用分号，列用逗号）</label><Input value={iterMatrix} onChange={(e) => setIterMatrix(e.target.value)} className="font-mono" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">右端向量 b</label><Input value={iterB} onChange={(e) => setIterB(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">初始向量 x₀</label><Input value={iterX0} onChange={(e) => setIterX0(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {/* SOR 迭代 */}
                {activeTab === 'sor' && (
                  <>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">系数矩阵 A（行用分号，列用逗号）</label><Input value={sorMatrix} onChange={(e) => setSorMatrix(e.target.value)} className="font-mono" /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-sm font-medium text-foreground mb-2 block">右端向量 b</label><Input value={sorB} onChange={(e) => setSorB(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">松弛因子 ω</label><Input value={sorOmega} onChange={(e) => setSorOmega(e.target.value)} className="font-mono" /></div>
                      <div><label className="text-sm font-medium text-foreground mb-2 block">初始向量 x₀</label><Input value={sorX0} onChange={(e) => setSorX0(e.target.value)} className="font-mono" /></div>
                    </div>
                  </>
                )}

                {/* 幂法 / 反幂法 / QR */}
                {(activeTab === 'power-method' || activeTab === 'inv-power-method' || activeTab === 'qr-method') && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">矩阵 A（行用分号，列用逗号）</label>
                    <Input value={eigenMatrix} onChange={(e) => setEigenMatrix(e.target.value)} className="font-mono" />
                  </div>
                )}

                <Button onClick={compute} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                  <Play className="size-4 mr-2" />计算
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <HistoryPanel
          open={historyOpen}
          history={calcHistory}
          onToggle={() => setHistoryOpen((o) => !o)}
          onClear={clearHistory}
          onSelect={(item) => setResult(item.result)}
          theme="violet"
          className="mb-4"
        />

        {result || error ? (
          <Card className="bg-[var(--board-bg)] border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-emerald-400/70 font-medium tracking-wider">计算结果</div>
                {result && !error && (
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
                )}
              </div>
              {error ? (
                <div className="text-red-400 font-mono">{error}</div>
              ) : viewMode === 'formatted' ? (
                <div className="text-emerald-300 text-sm leading-relaxed space-y-1 overflow-x-auto">
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
                <div className="text-emerald-300 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
                  {result}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <CheatsheetDialog moduleKey="numerical" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
