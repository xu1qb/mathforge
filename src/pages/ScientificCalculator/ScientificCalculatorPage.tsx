import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PageShell from '@/components/PageShell';
import CheatsheetDialog from '@/components/CheatsheetDialog';
import MathRenderer from '@/components/MathRenderer';
import { Trash2, Clock, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { scopedStorage } from '@/lib/lark-mock';
import { evaluate } from 'mathjs';
import { formatResult, simpson } from '@/lib/math-utils';
import { formatScientificExact, toExactForm } from '@/lib/symbolic-format';
import { normalizeMathInput } from '@/lib/math-normalize';
import {
  solveLinear2x2,
  degToDMS,
  dmsToDeg,
  fixDecimal,
  degToRad,
  radToDeg,
} from '@/lib/math-advanced';
import { toast } from 'sonner';

const STORAGE_KEY = 'mathforge_calc_history';

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

// 按键配置：卡西欧 fx 风格
// shiftLabel: SHIFT 模式下显示的第二功能（黄色小字在上）
interface KeyDef {
  label: string;
  type?: 'num' | 'op' | 'fn' | 'ctrl' | 'mem';
  span?: number;
  color?: 'red' | 'green' | 'amber' | 'purple' | 'default';
  shiftLabel?: string;
  alphaLabel?: string;
}

const KEYPAD_ROWS: KeyDef[][] = [
  // 第一行：功能键 + 操作符
  [
    { label: 'SHIFT', type: 'ctrl', color: 'amber' },
    { label: 'ALPHA', type: 'ctrl', color: 'purple' },
    { label: 'x²', type: 'fn', shiftLabel: '√' },
    { label: 'x³', type: 'fn', shiftLabel: '∛' },
    { label: 'x!', type: 'fn' },
  ],
  // 第二行：函数
  [
    { label: 'sin', type: 'fn', shiftLabel: 'sin⁻¹', alphaLabel: 'x' },
    { label: 'cos', type: 'fn', shiftLabel: 'cos⁻¹', alphaLabel: 'y' },
    { label: 'tan', type: 'fn', shiftLabel: 'tan⁻¹', alphaLabel: 'z' },
    { label: 'π', type: 'fn' },
    { label: 'e', type: 'fn' },
  ],
  // 第三行：数字 7-9
  [
    { label: '7', type: 'num', alphaLabel: 'a' },
    { label: '8', type: 'num', alphaLabel: 'b' },
    { label: '9', type: 'num', alphaLabel: 'c' },
    { label: 'DEL', type: 'ctrl', color: 'red' },
    { label: 'AC', type: 'ctrl', color: 'red' },
  ],
  // 第四行：数字 4-6
  [
    { label: '4', type: 'num', alphaLabel: 'd' },
    { label: '5', type: 'num', alphaLabel: 'e' },
    { label: '6', type: 'num', alphaLabel: 'f' },
    { label: '×', type: 'op' },
    { label: '÷', type: 'op' },
  ],
  // 第五行：数字 1-3
  [
    { label: '1', type: 'num', alphaLabel: 'g' },
    { label: '2', type: 'num', alphaLabel: 'h' },
    { label: '3', type: 'num', alphaLabel: 'i' },
    { label: '+', type: 'op' },
    { label: '−', type: 'op' },
  ],
  // 第六行：0 + 小数
  [
    { label: '0', type: 'num', alphaLabel: 'k' },
    { label: '.', type: 'num' },
    { label: '±', type: 'op' },
    { label: 'EXP', type: 'fn' },
    { label: 'Ans', type: 'fn' },
  ],
  // 第七行：记忆键 + 对数
  [
    { label: 'M+', type: 'mem' },
    { label: 'M-', type: 'mem' },
    { label: 'MR', type: 'mem' },
    { label: 'MC', type: 'mem' },
    { label: '%', type: 'op' },
  ],
  // 第八行：函数扩展
  [
    { label: 'ln', type: 'fn', shiftLabel: 'eˣ' },
    { label: 'lg', type: 'fn', shiftLabel: '10ˣ' },
    { label: '|x|', type: 'fn' },
    { label: '√', type: 'fn', shiftLabel: 'xʸ' },
    { label: 'a b/c', type: 'fn' },
  ],
  // 第九行：组合/排列 + 双曲
  [
    { label: 'nCr', type: 'fn' },
    { label: 'nPr', type: 'fn' },
    { label: 'sinh', type: 'fn', shiftLabel: 'asinh' },
    { label: 'cosh', type: 'fn', shiftLabel: 'acosh' },
    { label: 'tanh', type: 'fn', shiftLabel: 'atanh' },
  ],
  // 第十行：随机数 + = 
  [
    { label: 'RAN#', type: 'fn' },
    { label: 'RANDI', type: 'fn' },
    { label: 'mod', type: 'fn' },
    { label: '=', type: 'ctrl', color: 'green', span: 2 },
  ],
];

// 第二页按键（扩展功能）
const KEYPAD_ROWS_EXT: KeyDef[][] = [
  [
    { label: 'floor', type: 'fn' },
    { label: 'ceil', type: 'fn' },
    { label: 'round', type: 'fn' },
    { label: 'i', type: 'fn' },
    { label: 'conj', type: 'fn' },
  ],
  [
    { label: 'deriv', type: 'fn' },
    { label: 'numInt', type: 'fn' },
    { label: 'Σ sum', type: 'fn' },
    { label: 'abs', type: 'fn' },
    { label: 'arg', type: 'fn' },
  ],
  [
    { label: 're(', type: 'fn' },
    { label: 'im(', type: 'fn' },
    { label: 'log(', type: 'fn' },
    { label: 'cbrt(', type: 'fn' },
    { label: 'sign(', type: 'fn' },
  ],
  [
    { label: '1/x', type: 'fn' },
    { label: 'eˣ', type: 'fn' },
    { label: '10ˣ', type: 'fn' },
    { label: 'rand', type: 'fn' },
    { label: 'π', type: 'fn' },
  ],
];

export default function ScientificCalculatorPage() {
  const { skin } = useTheme();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [exactResult, setExactResult] = useState('');
  const [hasExact, setHasExact] = useState(false);
  const [showExact, setShowExact] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [ans, setAns] = useState<string>('0');
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('RAD');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!confirmClear) return;
    const t = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(t);
  }, [confirmClear]);
  const [fixDigits, setFixDigits] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('calc'); // calc / poly / system / dms
  const [keypadPage, setKeypadPage] = useState<'basic' | 'extended'>('basic');
  const [shiftMode, setShiftMode] = useState(false);
  const [alphaMode, setAlphaMode] = useState(false);
  const [memory, setMemory] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 记忆功能
  const memoryAdd = useCallback(() => {
    if (result) {
      const val = parseFloat(result);
      if (!isNaN(val)) setMemory((m) => m + val);
    }
  }, [result]);

  const memorySubtract = useCallback(() => {
    if (result) {
      const val = parseFloat(result);
      if (!isNaN(val)) setMemory((m) => m - val);
    }
  }, [result]);

  const memoryRecall = useCallback(() => {
    setExpression((prev) => prev + String(memory));
  }, [memory]);

  const memoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  // 随机数
  const insertRandom = useCallback(() => {
    const rand = Math.random().toFixed(6);
    setExpression((prev) => prev + rand);
  }, []);

  const insertRandomInt = useCallback(() => {
    const rand = Math.floor(Math.random() * 100);
    setExpression((prev) => prev + String(rand));
  }, []);

  // 多项式求解器状态
  const [polyA, setPolyA] = useState('1');
  const [polyB, setPolyB] = useState('-5');
  const [polyC, setPolyC] = useState('6');
  const [polyResult, setPolyResult] = useState<string>('');

  // 二元一次方程组状态
  const [eqA1, setEqA1] = useState('2');
  const [eqB1, setEqB1] = useState('3');
  const [eqC1, setEqC1] = useState('7');
  const [eqA2, setEqA2] = useState('4');
  const [eqB2, setEqB2] = useState('-1');
  const [eqC2, setEqC2] = useState('1');
  const [sysResult, setSysResult] = useState<string>('');

  // DMS 转换
  const [dmsDeg, setDmsDeg] = useState('45.5');
  const [dmsResult, setDmsResult] = useState('');
  const [dmsD, setDmsD] = useState('30');
  const [dmsM, setDmsM] = useState('15');
  const [dmsS, setDmsS] = useState('0');
  const [degResult, setDegResult] = useState('');

  // 加载历史记录
  useEffect(() => {
    try {
      const saved = scopedStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // 保存历史记录
  const saveHistory = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try {
      scopedStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
    } catch {
      // ignore
    }
  }, []);

  // 格式化结果（考虑 fix 精度）
  const formatWithFix = useCallback((value: number | string): string => {
    if (fixDigits === null) return formatResult(value);
    if (typeof value === 'number') return fixDecimal(value, fixDigits);
    // 字符串尝试解析
    try {
      const num = Number(value);
      if (Number.isFinite(num)) return fixDecimal(num, fixDigits);
      return String(value);
    } catch {
      return String(value);
    }
  }, [fixDigits]);

  const calculate = useCallback(() => {
    if (!expression.trim()) return;
    try {
      const scope: Record<string, unknown> = {
        ans: evaluate(ans),
        // 角度模式下的三角函数包装
        sin: angleMode === 'DEG' ? (x: number) => Math.sin(degToRad(x)) : Math.sin,
        cos: angleMode === 'DEG' ? (x: number) => Math.cos(degToRad(x)) : Math.cos,
        tan: angleMode === 'DEG' ? (x: number) => Math.tan(degToRad(x)) : Math.tan,
        asin: angleMode === 'DEG' ? (x: number) => radToDeg(Math.asin(x)) : Math.asin,
        acos: angleMode === 'DEG' ? (x: number) => radToDeg(Math.acos(x)) : Math.acos,
        atan: angleMode === 'DEG' ? (x: number) => radToDeg(Math.atan(x)) : Math.atan,
        sinh: Math.sinh,
        cosh: Math.cosh,
        tanh: Math.tanh,
        asinh: Math.asinh,
        acosh: Math.acosh,
        atanh: Math.atanh,
        // 数值导数：deriv(f, x, a)
        deriv: (fStr: string, varName: string, a: number) => {
          const h = 1e-5;
          const f1 = evaluate(fStr, { [varName]: a + h } as Record<string, unknown>) as number;
          const f2 = evaluate(fStr, { [varName]: a - h } as Record<string, unknown>) as number;
          return (f1 - f2) / (2 * h);
        },
        // 数值积分：numInt(f, a, b)
        numInt: (fStr: string, a: number, b: number) => simpson(fStr, a, b, 200),
        // 级数求和
        sum: (fStr: string, varName: string, start: number, end: number) => {
          let total = 0;
          for (let n = start; n <= end; n++) {
            total += evaluate(fStr, { [varName]: n } as Record<string, unknown>) as number;
          }
          return total;
        },
        // 随机数
        rand: () => Math.random(),
        // 取整
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        // 复数辅助
        re: (z: { re: number; im: number }) => z.re,
        im: (z: { re: number; im: number }) => z.im,
        arg: (z: { re: number; im: number }) => Math.atan2(z.im, z.re),
        conj: (z: { re: number; im: number }) => ({ re: z.re, im: -z.im }),
        sign: Math.sign,
      };

      // 第一步：Unicode 数学符号预处理
      let processedExpr = normalizeMathInput(expression);

      // 处理 50+10% 这种百分数计算（简易版：把 +N% / -N% 替换）
      // 匹配 "数字+数字%" 或 "数字-数字%"
      processedExpr = processedExpr.replace(/(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)%/g,
        (_, num, op, pct) => `${num} ${op} ${num} * ${pct} / 100`);
      // 匹配 "数字*数字%"
      processedExpr = processedExpr.replace(/(\d+(?:\.\d+)?)\s*\*\s*(\d+(?:\.\d+)?)%/g,
        (_, num, pct) => `${num} * ${pct} / 100`);

      const raw = evaluate(processedExpr, scope);
      // 复数结果额外处理
      let res: string;
      let exactStr = '';
      let isExact = false;
      if (typeof raw === 'object' && raw !== null && 're' in raw) {
        const z = raw as { re: number; im: number };
        const mag = Math.sqrt(z.re * z.re + z.im * z.im);
        const arg = Math.atan2(z.im, z.re);
        const reExact = formatScientificExact(z.re);
        const imExact = formatScientificExact(z.im);
        const imSign = z.im >= 0 ? '+' : '-';
        const mainExact = `${reExact}${imSign}${imExact.replace(/^-/, '')}i`;
        const magExact = formatScientificExact(mag);
        const argExact = formatScientificExact(arg);
        exactStr = `${mainExact}\n|z| = ${magExact}, arg(z) = ${argExact} rad`;
        const mainFix = `${formatWithFix(z.re)}${z.im >= 0 ? '+' : ''}${formatWithFix(z.im)}i`;
        res = `${mainFix}\n|z| = ${formatWithFix(mag)}, arg(z) = ${formatWithFix(arg)} rad`;
        isExact = false; // 复数整体不精确切换（简化处理）
      } else if (typeof raw === 'number') {
        // 数值结果：生成精确形式和小数形式
        const exact = toExactForm(raw);
        exactStr = exact.isExact ? exact.exact : `≈ ${exact.exact}`;
        isExact = exact.isExact;
        res = formatWithFix(raw);
      } else {
        res = formatWithFix(raw as number | string);
        exactStr = res;
        isExact = false;
      }
      setResult(res);
      setExactResult(exactStr);
      setHasExact(isExact);
      setError(null);
      const plainAns = typeof raw === 'number' ? String(raw) : String(raw);
      setAns(plainAns);
      const newItem: HistoryItem = { expression, result: exactStr || res, timestamp: Date.now() };
      saveHistory([newItem, ...history].slice(0, 20));
    } catch (e) {
      const msg = (e as Error).message || '计算错误';
      // 友好错误提示
      let friendly = msg;
      if (msg.includes('Undefined symbol') || msg.includes('undefined symbol')) {
        friendly = '表达式中包含未定义的函数或变量，请检查拼写';
      } else if (msg.includes('Parenthesis') || msg.includes('parenthesis')) {
        friendly = '括号不匹配，请检查左右括号';
      } else if (msg.includes('Unexpected') || msg.includes('unexpected')) {
        friendly = '语法错误：存在意外的字符或运算符';
      } else if (msg.includes('Division by zero') || msg.includes('division by zero')) {
        friendly = '除零错误：除数不能为 0';
      } else if (msg.includes('factorial') && msg.includes('negative')) {
        friendly = '阶乘错误：负数没有阶乘';
      } else if (msg.length > 80) {
        friendly = msg.slice(0, 80) + '…';
      }
      setError(friendly);
      setResult('');
      toast.error(friendly, { duration: 3000 });
    }
  }, [expression, ans, history, saveHistory, angleMode, formatWithFix]);

  // 在光标位置插入文本
  const insertAtCursor = useCallback(
    (text: string, cursorOffset: number = 0) => {
      const input = inputRef.current;
      if (!input || document.activeElement !== input) {
        setExpression((prev) => prev + text);
        return;
      }
      const start = input.selectionStart ?? expression.length;
      const end = input.selectionEnd ?? expression.length;
      const before = expression.substring(0, start);
      const after = expression.substring(end);
      const newValue = before + text + after;
      setExpression(newValue);
      const pos = start + text.length + cursorOffset;
      const clamped = Math.max(0, Math.min(newValue.length, pos));
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(clamped, clamped);
          inputRef.current.focus();
        }
      });
    },
    [expression],
  );

  const handleKey = (label: string) => {
    setError(null);
    // SHIFT 状态点击后自动关闭
    const consumeShift = () => setShiftMode(false);
    const consumeAlpha = () => setAlphaMode(false);

    if (label === 'SHIFT') {
      setShiftMode((v) => !v);
      setAlphaMode(false);
      return;
    }
    if (label === 'ALPHA') {
      setAlphaMode((v) => !v);
      setShiftMode(false);
      return;
    }
    if (label === 'AC') {
      setExpression('');
      setResult('');
      setError(null);
      return;
    }
    if (label === 'DEL') {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }
    if (label === '=') {
      calculate();
      return;
    }
    // 记忆键
    if (label === 'M+') { memoryAdd(); return; }
    if (label === 'M-') { memorySubtract(); return; }
    if (label === 'MR') { memoryRecall(); return; }
    if (label === 'MC') { memoryClear(); return; }
    // 随机数
    if (label === 'RAN#') { insertRandom(); return; }
    if (label === 'RANDI') { insertRandomInt(); return; }
    // 分数键
    if (label === 'a b/c') {
      insertAtCursor('/');
      return;
    }

    // 基础映射
    let mapped = label;
    let cursorOffset = 0;

    // SHIFT 模式切换（黄色第二功能）
    if (shiftMode) {
      const shiftMap: Record<string, string> = {
        'sin': 'asin(',
        'cos': 'acos(',
        'tan': 'atan(',
        '√': 'x^',
        'x²': '√(',
        'x³': '∛(',
        '10ˣ': 'log10(',
        'eˣ': 'ln(',
        'sinh': 'asinh(',
        'cosh': 'acosh(',
        'tanh': 'atanh(',
      };
      if (shiftMap[label]) {
        mapped = shiftMap[label];
        consumeShift();
      }
    } else if (alphaMode) {
      // ALPHA 模式：输入变量/常量字母
      const alphaMap: Record<string, string> = {
        'sin': 'x',
        'cos': 'y',
        'tan': 'z',
        '7': 'a',
        '8': 'b',
        '9': 'c',
        '4': 'd',
        '5': 'e',
        '6': 'f',
        '1': 'g',
        '2': 'h',
        '3': 'i',
        '0': 'k',
        '.': '.',
      };
      if (alphaMap[label]) {
        mapped = alphaMap[label];
        consumeAlpha();
      }
    } else {
      // 正常模式映射
      const mapping: Record<string, string> = {
        '×': '*',
        '÷': '/',
        '−': '-',
        'π': 'pi',
        '√': 'sqrt(',
        'x²': '^2',
        'x³': '^3',
        'eˣ': 'exp(',
        '10ˣ': '10^',
        '1/x': '1/',
        '|x|': 'abs(',
        'x!': '!',
        'nCr': 'combinations(',
        'nPr': 'permutations(',
        'lg': 'log10(',
        'ln': 'log(',
        'mod': ' mod ',
        '%': '%',
        'sin': 'sin(',
        'cos': 'cos(',
        'tan': 'tan(',
        'sinh': 'sinh(',
        'cosh': 'cosh(',
        'tanh': 'tanh(',
        'Ans': 'ans',
        'e': 'e',
        'i': 'i',
        'conj': 'conj(',
        'abs': 'abs(',
        'arg': 'arg(',
        're(': 're(',
        'im(': 'im(',
        'log(': 'log(',
        'cbrt(': 'cbrt(',
        'sign(': 'sign(',
        'floor': 'floor(',
        'ceil': 'ceil(',
        'round': 'round(',
        'EXP': 'e',
        'rand': 'rand()',
        'deriv': 'deriv(',
        'numInt': 'numInt(',
        'Σ sum': 'sum(',
        '±': '-',
      };
      mapped = mapping[label] ?? label;
    }

    // 如果以 ( 结尾，光标放在括号内
    if (mapped.endsWith('(')) {
      cursorOffset = -1;
    }

    insertAtCursor(mapped, cursorOffset);
  };

  const clearHistory = () => {
    saveHistory([]);
    toast.success('历史记录已清空');
  };

  const recallHistory = (item: HistoryItem) => {
    setExpression(item.expression);
    setResult(item.result);
    setError(null);
  };

  const getKeyClass = (type?: string, color?: string, span?: number, shiftLabel?: string) => {
    const base = 'h-10 md:h-11 rounded-lg font-medium transition-all active:scale-95 shadow-sm text-xs relative ';
    const width = span === 2 ? 'col-span-2' : '';
    // SHIFT / ALPHA 激活态
    const shiftActive = shiftMode && shiftLabel ? 'bg-amber-100 text-amber-900 border-amber-300' : '';
    if (color === 'red') return base + width + ' bg-red-50 text-red-600 border border-red-200 hover:bg-red-100';
    if (color === 'green') return base + width + ' bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-base';
    if (color === 'amber') return base + width + ' bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100';
    if (color === 'purple') return base + width + ' bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100';
    if (type === 'fn') return base + width + ' ' + (shiftActive || 'bg-emerald-50/70 text-emerald-700 border border-emerald-100 hover:bg-emerald-100');
    if (type === 'op') return base + width + ' bg-muted text-foreground border border-border hover:bg-border text-base';
    if (type === 'num') return base + width + ' bg-card text-foreground border border-border hover:bg-muted/50 text-base font-semibold';
    if (type === 'mem') return base + width + ' bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100';
    return base + width + ' bg-card text-foreground border border-border';
  };

  // 多项式求解
  const solvePoly = () => {
    try {
      const a = parseFloat(polyA);
      const b = parseFloat(polyB);
      const c = parseFloat(polyC);
      if (isNaN(a) || isNaN(b) || isNaN(c)) throw new Error('请输入有效的数值');
      if (Math.abs(a) < 1e-12) {
        // 一次方程
        const x = -c / b;
        setPolyResult(`一次方程：x = ${formatWithFix(x)}`);
        return;
      }
      const disc = b * b - 4 * a * c;
      if (disc > 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        setPolyResult(`两个实根：\nx₁ = ${formatWithFix(x1)}\nx₂ = ${formatWithFix(x2)}\n判别式 Δ = ${formatWithFix(disc)}`);
      } else if (Math.abs(disc) < 1e-10) {
        const x = -b / (2 * a);
        setPolyResult(`重根：x = ${formatWithFix(x)}\n判别式 Δ = 0`);
      } else {
        const real = -b / (2 * a);
        const imag = Math.sqrt(-disc) / (2 * a);
        setPolyResult(`两个共轭复根：\nx₁ = ${formatWithFix(real)} + ${formatWithFix(imag)}i\nx₂ = ${formatWithFix(real)} - ${formatWithFix(imag)}i\n判别式 Δ = ${formatWithFix(disc)}`);
      }
    } catch (e) {
      setPolyResult('错误：' + (e as Error).message);
    }
  };

  // 线性方程组求解
  const solveSystem = () => {
    try {
      const a1 = parseFloat(eqA1), b1 = parseFloat(eqB1), c1 = parseFloat(eqC1);
      const a2 = parseFloat(eqA2), b2 = parseFloat(eqB2), c2 = parseFloat(eqC2);
      const r = solveLinear2x2(a1, b1, c1, a2, b2, c2);
      if (!r) {
        setSysResult('方程组无解或有无穷多解（系数行列式为 0）');
        return;
      }
      setSysResult(`解：\nx = ${formatWithFix(r.x)}\ny = ${formatWithFix(r.y)}`);
    } catch (e) {
      setSysResult('错误：' + (e as Error).message);
    }
  };

  // DMS 转换
  const calcDegToDms = () => {
    try {
      const deg = parseFloat(dmsDeg);
      const r = degToDMS(deg);
      setDmsResult(`${Math.abs(r.degrees)}° ${r.minutes}' ${r.seconds.toFixed(2)}"${r.sign < 0 ? ' （负）' : ''}`);
    } catch (e) {
      setDmsResult('错误');
    }
  };

  const calcDmsToDeg = () => {
    try {
      const d = parseFloat(dmsD), m = parseFloat(dmsM), s = parseFloat(dmsS);
      const r = dmsToDeg(d, m, s);
      setDegResult(`${formatWithFix(r)}°`);
    } catch (e) {
      setDegResult('错误');
    }
  };

  // 切换 Fix 精度
  const cycleFix = () => {
    if (fixDigits === null) setFixDigits(2);
    else if (fixDigits < 9) setFixDigits(fixDigits + 1);
    else setFixDigits(null);
  };

  const [showFormulaPreview, setShowFormulaPreview] = useState(false);

  return (
    <div className="min-h-screen page-fade-in">
      <PageShell
        title="科学计算器"
        description="通用表达式求值：算术、三角函数、对数、指数、复数 i、阶乘、组合、概率分布函数……输入后回车或点 =，结果实时显示。支持 DEG/RAD 切换、Fix 精度、多项式求解、方程组求解、DMS 转换。"
        eyebrow="计算工具"
        onCheatsheet={() => setCheatsheetOpen(true)}
      />

      <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-5xl mx-auto space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-muted/70">
            <TabsTrigger value="calc">计算器</TabsTrigger>
            <TabsTrigger value="poly">多项式</TabsTrigger>
            <TabsTrigger value="system">方程组</TabsTrigger>
            <TabsTrigger value="dms">DMS转换</TabsTrigger>
          </TabsList>

          <TabsContent value="calc">
            <Card className="bg-card border-border shadow-sm overflow-hidden">
              <CardContent className="p-4 md:p-6 space-y-4">
                {/* 顶部模式栏 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
                    className={angleMode === 'DEG'
                      ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800'
                      : 'text-foreground'}
                  >
                    {angleMode}
                  </Button>
                  <Badge variant="outline" className="bg-muted/50 text-foreground font-mono text-xs">
                    {angleMode === 'DEG' ? '角度模式' : '弧度模式'}
                  </Badge>
                  <div className="flex-1" />
                  <Button variant="outline" size="sm" onClick={cycleFix} className="text-foreground">
                    Fix {fixDigits === null ? 'OFF' : fixDigits}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setKeypadPage(keypadPage === 'basic' ? 'extended' : 'basic')}
                    className="text-foreground"
                  >
                    {keypadPage === 'basic' ? '更多功能 →' : '← 基础'}
                  </Button>
                </div>

                {/* 输入与结果 */}
                <div className="space-y-3">
                  <div
                    className="rounded-xl p-4 md:p-6"
                    style={{
                      // 按皮肤切换 LCD 屏样式
                      backgroundColor:
                        skin === 'night' ? '#1a2f1a' :
                        skin === 'paper' ? '#f5edd6' :
                        skin === 'pixel' ? '#141a16' :
                        skin === 'journal' ? '#fffdf5' :
                        '#0d1b21',
                      color:
                        skin === 'night' ? '#f59e0b' :
                        skin === 'paper' ? '#4a3f35' :
                        skin === 'pixel' ? '#7dff9a' :
                        skin === 'journal' ? '#4a3f35' :
                        undefined,
                      boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35), inset 0 -1px 2px rgba(255,255,255,0.05)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                      border: skin === 'pixel' ? '4px solid #0d120e' : 'none',
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={expression}
                      onChange={(e) => { setExpression(e.target.value); setError(null); }}
                      onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === 'Enter') { calculate(); e.preventDefault(); }
                        else if (e.key === 'Enter') { calculate(); }
                        else if (e.key === 'Escape') { setExpression(''); setError(null); setResult(''); setExactResult(''); e.preventDefault(); }
                      }}
                      placeholder="输入 √2 + π/3 或点击符号按键"
                      className="w-full bg-transparent text-right text-xl md:text-2xl font-mono outline-none placeholder:opacity-40"
                      style={{
                        color: skin === 'night' ? '#f59e0b' : skin === 'paper' ? '#4a3f35' : skin === 'pixel' ? '#7dff9a' : skin === 'journal' ? '#4a3f35' : '#cbd5e1',
                      }}
                      spellCheck={false}
                    />
                    {showFormulaPreview && expression && !error && (
                      <div className="mt-2 pt-2 border-t border-emerald-800/30 text-right">
                        <span className="text-xs text-emerald-400/60 mr-2">公式预览</span>
                        <MathRenderer expression={expression} isInput />
                      </div>
                    )}
                    <div className="h-px bg-emerald-800/40 my-3" />
                    {/* 结果行 + 切换按钮 */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1 text-right text-2xl md:text-3xl font-mono min-h-[2.5rem] whitespace-pre-line break-all" style={{ color: error ? (skin === 'night' || skin === 'pixel' ? '#ff6b6b' : '#c0392b') : skin === 'night' ? '#f59e0b' : skin === 'paper' ? '#4a3f35' : skin === 'pixel' ? '#7dff9a' : skin === 'journal' ? '#4a3f35' : '#6ee7b7' }}>
                        {error
                          ? error
                          : result || exactResult
                            ? (showExact ? exactResult : result)
                            : <span className="text-muted-foreground italic text-lg">等待输入...</span>}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          onClick={() => setShowFormulaPreview(!showFormulaPreview)}
                          className="text-xs text-emerald-400/70 hover:text-emerald-300 transition-colors flex items-center gap-1"
                          title={showFormulaPreview ? '关闭公式预览' : '开启公式预览'}
                        >
                          {showFormulaPreview ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        {!error && result && hasExact && exactResult !== result && (
                          <button
                            onClick={() => setShowExact(!showExact)}
                            className="text-xs text-emerald-400/70 hover:text-emerald-300 transition-colors flex items-center gap-1"
                            title={showExact ? '切换为小数形式' : '切换为精确形式'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            {showExact ? '小数' : '精确'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 状态指示行 */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mb-1">
                  <div className="flex gap-3">
                    <span className={shiftMode ? 'text-amber-600 font-bold' : ''}>SHIFT</span>
                    <span className={alphaMode ? 'text-purple-600 font-bold' : ''}>ALPHA</span>
                    {memory !== 0 && <span className="text-sky-600 font-bold">M</span>}
                  </div>
                  <span>{angleMode}</span>
                </div>

                {/* 按键面板 - 卡西欧风格 */}
                <div className="grid grid-cols-5 gap-1.5 md:gap-2">
                  {(keypadPage === 'basic' ? KEYPAD_ROWS : KEYPAD_ROWS_EXT).map((row, rowIdx) =>
                    row.map((key, keyIdx) => (
                      <Button
                        key={`${rowIdx}-${keyIdx}`}
                        variant="ghost"
                        className={getKeyClass(key.type, key.color, key.span, key.shiftLabel)}
                        onClick={() => handleKey(key.label)}
                        type="button"
                      >
                        {key.shiftLabel && (
                          <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[8px] text-amber-500 leading-none">
                            {key.shiftLabel}
                          </span>
                        )}
                        <span className="relative z-10">{key.label}</span>
                      </Button>
                    )),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="poly">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-foreground">一元二次方程求解器</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">求解 ax² + bx + c = 0，返回全部根（实根或复根）</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">a</label>
                    <Input value={polyA} onChange={(e) => setPolyA(e.target.value)} className="font-mono" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">b</label>
                    <Input value={polyB} onChange={(e) => setPolyB(e.target.value)} className="font-mono" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">c</label>
                    <Input value={polyC} onChange={(e) => setPolyC(e.target.value)} className="font-mono" />
                  </div>
                </div>
                <Button onClick={solvePoly} className="bg-emerald-700 hover:bg-emerald-800">求解</Button>
                {polyResult && (
                  <div className="bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-4 font-mono text-sm text-emerald-900 dark:text-emerald-300 whitespace-pre-line">
                    {polyResult}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-foreground">二元一次方程组</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  a₁x + b₁y = c₁<br />
                  a₂x + b₂y = c₂
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">a₁</label><Input value={eqA1} onChange={(e) => setEqA1(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">b₁</label><Input value={eqB1} onChange={(e) => setEqB1(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">c₁</label><Input value={eqC1} onChange={(e) => setEqC1(e.target.value)} className="font-mono" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">a₂</label><Input value={eqA2} onChange={(e) => setEqA2(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">b₂</label><Input value={eqB2} onChange={(e) => setEqB2(e.target.value)} className="font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">c₂</label><Input value={eqC2} onChange={(e) => setEqC2(e.target.value)} className="font-mono" /></div>
                </div>
                <Button onClick={solveSystem} className="bg-emerald-700 hover:bg-emerald-800">求解</Button>
                {sysResult && (
                  <div className="bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-4 font-mono text-sm text-emerald-900 dark:text-emerald-300 whitespace-pre-line">
                    {sysResult}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dms">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-foreground">角度/DMS 转换</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">十进制度 → 度分秒</div>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">十进制度</label>
                      <Input value={dmsDeg} onChange={(e) => setDmsDeg(e.target.value)} className="font-mono" />
                    </div>
                    <Button onClick={calcDegToDms} variant="outline">→ DMS</Button>
                  </div>
                  {dmsResult && <div className="bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3 font-mono text-sm text-emerald-900 dark:text-emerald-300">{dmsResult}</div>}
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">度分秒 → 十进制度</div>
                  <div className="grid grid-cols-4 gap-3 items-end">
                    <div><label className="text-xs text-muted-foreground mb-1 block">度</label><Input value={dmsD} onChange={(e) => setDmsD(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">分</label><Input value={dmsM} onChange={(e) => setDmsM(e.target.value)} className="font-mono" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">秒</label><Input value={dmsS} onChange={(e) => setDmsS(e.target.value)} className="font-mono" /></div>
                    <Button onClick={calcDmsToDeg} variant="outline">→ DEG</Button>
                  </div>
                  {degResult && <div className="bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3 font-mono text-sm text-emerald-900 dark:text-emerald-300">{degResult}</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 历史记录 */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="size-4" />
              历史记录
            </CardTitle>
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
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8'
                  : 'text-muted-foreground hover:text-red-600 h-8'}
              >
                <Trash2 className="size-3.5 mr-1" />
                {confirmClear ? '确认清空？' : '清空'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                暂无计算记录
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => recallHistory(item)}
                    className="w-full text-left px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/40 group"
                  >
                    <div className="text-sm text-muted-foreground font-mono truncate">{item.expression}</div>
                    <div className="text-lg text-emerald-700 font-mono font-medium group-hover:text-emerald-800">= {item.result}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CheatsheetDialog moduleKey="scientific" open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
