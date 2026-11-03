import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Calculator,
  Sigma,
  FunctionSquare,
  Sparkles,
  Hash,
  ChevronDown,
  ChevronUp,
  Grid3x3,
} from 'lucide-react';

// 符号分组定义：label 是显示的符号，insert 是实际插入到输入框的文本
// cursorOffset: 插入后光标相对插入位置的偏移（负数 = 向左移动，用于函数括号内）
interface SymbolItem {
  label: string;
  insert: string;
  cursorOffset?: number;
  tooltip?: string;
}

interface SymbolGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  items: SymbolItem[];
}

const SYMBOL_GROUPS: SymbolGroup[] = [
  // 基础运算
  {
    id: 'basic',
    name: '基础',
    icon: Calculator,
    items: [
      { label: '+', insert: '+' },
      { label: '−', insert: '-' },
      { label: '×', insert: '*' },
      { label: '÷', insert: '/' },
      { label: '(', insert: '(' },
      { label: ')', insert: ')' },
      { label: '=', insert: '=' },
      { label: ',', insert: ',' },
      { label: '%', insert: '%' },
      { label: '°', insert: 'deg' },
      { label: '!', insert: '!' },
      { label: '·', insert: '*' },
    ],
  },
  // 常用符号
  {
    id: 'common',
    name: '常用',
    icon: Sigma,
    items: [
      { label: '√', insert: 'sqrt(', cursorOffset: 0, tooltip: '平方根' },
      { label: '∛', insert: 'cbrt(', cursorOffset: 0, tooltip: '立方根' },
      { label: 'π', insert: 'pi', tooltip: '圆周率' },
      { label: '∞', insert: 'Infinity', tooltip: '无穷大' },
      { label: '≤', insert: '<=', tooltip: '小于等于' },
      { label: '≥', insert: '>=', tooltip: '大于等于' },
      { label: '≠', insert: '!=', tooltip: '不等于' },
      { label: '±', insert: '±', tooltip: '正负号' },
      { label: '≈', insert: '≈', tooltip: '约等于' },
      { label: '→', insert: '→', tooltip: '箭头' },
      { label: '∑', insert: 'sum(', cursorOffset: 0, tooltip: '求和' },
      { label: '∫', insert: 'integral(', cursorOffset: 0, tooltip: '积分' },
    ],
  },
  // 上标
  {
    id: 'superscript',
    name: '上标',
    icon: Hash,
    items: [
      { label: 'x²', insert: '^2', tooltip: '平方' },
      { label: 'x³', insert: '^3', tooltip: '立方' },
      { label: 'x⁴', insert: '^4', tooltip: '4次方' },
      { label: 'xⁿ', insert: '^', tooltip: 'n次方' },
      { label: 'x⁻¹', insert: '^(-1)', tooltip: '倒数/负一次方' },
      { label: '10ˣ', insert: '10^', tooltip: '10的x次方' },
      { label: 'eˣ', insert: 'exp(', cursorOffset: 0, tooltip: 'e的x次方' },
      { label: '√x', insert: '^(1/2)', tooltip: '平方根(指数形式)' },
    ],
  },
  // 希腊字母
  {
    id: 'greek',
    name: '希腊',
    icon: Sparkles,
    items: [
      { label: 'α', insert: 'alpha' },
      { label: 'β', insert: 'beta' },
      { label: 'γ', insert: 'gamma' },
      { label: 'δ', insert: 'delta' },
      { label: 'ε', insert: 'epsilon' },
      { label: 'θ', insert: 'theta' },
      { label: 'λ', insert: 'lambda' },
      { label: 'μ', insert: 'mu' },
      { label: 'σ', insert: 'sigma' },
      { label: 'τ', insert: 'tau' },
      { label: 'φ', insert: 'phi' },
      { label: 'ψ', insert: 'psi' },
      { label: 'ω', insert: 'omega' },
      { label: 'η', insert: 'eta' },
      { label: 'ξ', insert: 'xi' },
      { label: 'ζ', insert: 'zeta' },
      { label: 'ρ', insert: 'rho' },
      { label: 'κ', insert: 'kappa' },
      { label: 'ν', insert: 'nu' },
      { label: 'χ', insert: 'chi' },
      { label: 'Δ', insert: 'Delta', tooltip: '大写Delta' },
      { label: 'Σ', insert: 'Sigma', tooltip: '大写Sigma' },
      { label: 'Ω', insert: 'Omega', tooltip: '大写Omega' },
      { label: 'Φ', insert: 'Phi', tooltip: '大写Phi' },
    ],
  },
  // 函数
  {
    id: 'functions',
    name: '函数',
    icon: FunctionSquare,
    items: [
      { label: 'sin', insert: 'sin(', cursorOffset: 0 },
      { label: 'cos', insert: 'cos(', cursorOffset: 0 },
      { label: 'tan', insert: 'tan(', cursorOffset: 0 },
      { label: 'log', insert: 'log10(', cursorOffset: 0, tooltip: '常用对数' },
      { label: 'ln', insert: 'log(', cursorOffset: 0, tooltip: '自然对数' },
      { label: 'abs', insert: 'abs(', cursorOffset: 0, tooltip: '绝对值' },
      { label: 'sqrt', insert: 'sqrt(', cursorOffset: 0, tooltip: '平方根' },
      { label: 'nthroot', insert: 'nthRoot(', cursorOffset: 0, tooltip: 'n次方根' },
      { label: 'floor', insert: 'floor(', cursorOffset: 0, tooltip: '向下取整' },
      { label: 'ceil', insert: 'ceil(', cursorOffset: 0, tooltip: '向上取整' },
      { label: 'round', insert: 'round(', cursorOffset: 0, tooltip: '四舍五入' },
      { label: 'asin', insert: 'asin(', cursorOffset: 0, tooltip: '反正弦' },
      { label: 'acos', insert: 'acos(', cursorOffset: 0, tooltip: '反余弦' },
      { label: 'atan', insert: 'atan(', cursorOffset: 0, tooltip: '反正切' },
      { label: 'sinh', insert: 'sinh(', cursorOffset: 0, tooltip: '双曲正弦' },
      { label: 'cosh', insert: 'cosh(', cursorOffset: 0, tooltip: '双曲余弦' },
    ],
  },
  // 常量与分数
  {
    id: 'const',
    name: '常量',
    icon: Grid3x3,
    items: [
      { label: 'e', insert: 'e', tooltip: '自然常数' },
      { label: 'π', insert: 'pi', tooltip: '圆周率' },
      { label: 'i', insert: 'i', tooltip: '虚数单位' },
      { label: '∞', insert: 'Infinity', tooltip: '无穷大' },
      { label: '½', insert: '1/2', tooltip: '二分之一' },
      { label: '⅓', insert: '1/3', tooltip: '三分之一' },
      { label: '¼', insert: '1/4', tooltip: '四分之一' },
      { label: '⅔', insert: '2/3', tooltip: '三分之二' },
      { label: '¾', insert: '3/4', tooltip: '四分之三' },
    ],
  },
];

interface SymbolPaletteProps {
  /** 输入框的 ref（必须是 HTMLInputElement 或 HTMLTextAreaElement） */
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  /** 当前输入框的值 */
  value: string;
  /** 值变更回调 */
  onChange: (value: string) => void;
  /** 面板默认展开状态（仅非 inline 模式） */
  defaultOpen?: boolean;
  /** 内联模式：直接显示符号网格，不显示展开/收起按钮 */
  inline?: boolean;
  className?: string;
}

export default function SymbolPalette({
  inputRef,
  value,
  onChange,
  defaultOpen = false,
  inline = false,
  className,
}: SymbolPaletteProps) {
  const [isOpen, setIsOpen] = useState(inline || defaultOpen);
  const [activeGroup, setActiveGroup] = useState('basic');

  const togglePanel = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  /**
   * 在光标位置插入文本
   * 若 inputRef 不可用（如 input 未挂载），追加到末尾
   */
  const insertAtCursor = useCallback(
    (text: string, cursorOffset: number = 0) => {
      const input = inputRef.current;
      if (!input) {
        onChange(value + text);
        return;
      }

      // 确保 input 获得焦点
      input.focus();

      const start = input.selectionStart ?? value.length;
      const end = input.selectionEnd ?? value.length;

      const before = value.substring(0, start);
      const after = value.substring(end);
      const newValue = before + text + after;

      onChange(newValue);

      // 设置新的光标位置
      // cursorOffset: 0 表示光标在插入文本之后（默认）
      // 负数表示向左移动（如函数括号内，光标放在括号里）
      requestAnimationFrame(() => {
        if (inputRef.current) {
          const pos = start + text.length + cursorOffset;
          const clampedPos = Math.max(0, Math.min(newValue.length, pos));
          inputRef.current.setSelectionRange(clampedPos, clampedPos);
          inputRef.current.focus();
        }
      });
    },
    [inputRef, value, onChange],
  );

  const handleSymbolClick = useCallback(
    (item: SymbolItem) => {
      // cursorOffset 默认为 0（光标在插入文本之后）
      // 如果是函数/带括号的，我们希望光标在括号内，所以 offset 为 -1
      const offset =
        item.cursorOffset !== undefined
          ? item.cursorOffset
          : item.insert.endsWith('(')
            ? -1
            : 0;
      insertAtCursor(item.insert, offset);
    },
    [insertAtCursor],
  );

  const currentGroup = SYMBOL_GROUPS.find((g) => g.id === activeGroup) ?? SYMBOL_GROUPS[0];

  // inline 模式始终展开，且不显示顶部展开按钮
  const panelVisible = inline || isOpen;

  return (
    <div className={cn('w-full', className)}>
      {/* 展开/收起按钮（inline 模式隐藏） */}
      {!inline && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={togglePanel}
          className="w-full h-8 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/60 rounded-lg"
        >
          <Sigma className="size-3.5 mr-1.5" />
          符号面板
          {isOpen ? (
            <ChevronUp className="size-3.5 ml-1.5" />
          ) : (
            <ChevronDown className="size-3.5 ml-1.5" />
          )}
        </Button>
      )}

      {/* 面板主体 */}
      {panelVisible && (
        <div className={cn(
          inline ? '' : 'mt-2 border border-border/60 rounded-lg bg-card/50 backdrop-blur-sm',
          'overflow-hidden'
        )}>
          {/* 分类 tab */}
          <div className="flex overflow-x-auto border-b border-border/60 bg-muted/30">
            {SYMBOL_GROUPS.map((group) => {
              const Icon = group.icon;
              const isActive = activeGroup === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroup(group.id)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap transition-colors border-b-2 -mb-px',
                    isActive
                      ? 'text-primary border-primary font-medium bg-background/60'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-background/30',
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline">{group.name}</span>
                </button>
              );
            })}
          </div>

          {/* 符号网格 */}
          <div className="p-2 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto">
            {currentGroup.items.map((item, idx) => (
              <button
                key={`${item.label}-${idx}`}
                type="button"
                onClick={() => handleSymbolClick(item)}
                title={item.tooltip ?? item.label}
                className="h-8 rounded-md text-sm font-mono bg-background hover:bg-primary/10 hover:text-primary border border-border/50 transition-all active:scale-95 flex items-center justify-center"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
