// EXPORTS: SymbolPalette, MATH_SYMBOL_TOPIC_MAP
// 数学键盘：按知识点推荐符号组，插入位置跟随光标

import { useState, useCallback, useMemo } from 'react';
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
  Percent,
  Grid3x3,
  Divide,
  Braces,
  Trash2,
  CornerDownLeft,
} from 'lucide-react';

export interface SymbolItem {
  label: string;
  insert: string;
  /** 插入后光标相对末尾的偏移（-1 = 停在右括号前） */
  cursorOffset?: number;
  tooltip?: string;
}

interface SymbolGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  items: SymbolItem[];
}

const fn = (label: string, insert: string, tooltip?: string): SymbolItem => ({
  label,
  insert: insert + '()',
  cursorOffset: -1,
  tooltip: tooltip ?? label,
});

/** 知识点 → 优先展示的符号组 */
export const MATH_SYMBOL_TOPIC_MAP: Record<string, string> = {
  'limit-basic': 'calc',
  'sequence-limit': 'calc',
  'derivative-basic': 'calc',
  'integral-basic': 'calc',
  'series-convergence': 'calc',
  'ode-solving': 'calc',
  'fourier-basic': 'calc',
  'trig-special': 'trig',
  'trig-identity': 'trig',
  'hyperbolic-func': 'trig',
  'matrix-op': 'lin',
  'vector-op': 'lin',
  'complex-equation': 'lin',
  'probability-classical': 'prob',
  'random-variable': 'prob',
  'algebra-quad': 'frac',
  'algebra-factor': 'frac',
  'inequality-solve': 'frac',
  'log-equation': 'frac',
  'exp-power': 'power',
  'sequence-recurrence': 'calc',
};

const SYMBOL_GROUPS: SymbolGroup[] = [
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
      { label: '·', insert: '*' },
      { label: '|', insert: '|' },
    ],
  },
  {
    id: 'frac',
    name: '分式根式',
    icon: Divide,
    items: [
      { label: 'a/b', insert: '()/()', cursorOffset: -4, tooltip: '分式，光标停在分子' },
      { label: '½', insert: '1/2' },
      { label: '⅓', insert: '1/3' },
      { label: '¼', insert: '1/4' },
      { label: '⅔', insert: '2/3' },
      { label: '¾', insert: '3/4' },
      fn('√', 'sqrt', '平方根'),
      fn('∛', 'cbrt', '立方根'),
      { label: '√3/2', insert: 'sqrt(3)/2' },
      { label: '√2/2', insert: 'sqrt(2)/2' },
      { label: 'π', insert: 'pi' },
      { label: '≤', insert: '<=' },
      { label: '≥', insert: '>=' },
      { label: '≠', insert: '!=' },
      { label: '±', insert: '±' },
    ],
  },
  {
    id: 'power',
    name: '幂与指数',
    icon: Hash,
    items: [
      { label: 'x²', insert: '^2' },
      { label: 'x³', insert: '^3' },
      { label: 'xⁿ', insert: '^' },
      { label: 'x⁻¹', insert: '^(-1)' },
      { label: 'eˣ', insert: 'e^' },
      { label: '10ˣ', insert: '10^' },
      { label: '2ˣ', insert: '2^' },
      { label: 'x^½', insert: '^(1/2)' },
      fn('ln', 'log', '自然对数'),
      fn('lg', 'log10', '常用对数'),
      { label: 'e', insert: 'e' },
      { label: '∞', insert: 'Infinity' },
    ],
  },
  {
    id: 'trig',
    name: '三角',
    icon: FunctionSquare,
    items: [
      fn('sin', 'sin'),
      fn('cos', 'cos'),
      fn('tan', 'tan'),
      fn('cot', 'cot'),
      fn('sec', 'sec'),
      fn('csc', 'csc'),
      fn('asin', 'asin'),
      fn('acos', 'acos'),
      fn('atan', 'atan'),
      { label: '°', insert: 'deg' },
      { label: 'π', insert: 'pi' },
      { label: 'π/6', insert: 'pi/6' },
      { label: 'π/4', insert: 'pi/4' },
      { label: 'π/3', insert: 'pi/3' },
      { label: 'π/2', insert: 'pi/2' },
      { label: '2π', insert: '2*pi' },
    ],
  },
  {
    id: 'calc',
    name: '微积分',
    icon: Sigma,
    items: [
      { label: 'lim', insert: 'lim(' },
      { label: '→', insert: '->' },
      { label: '∞', insert: 'Infinity' },
      fn('√', 'sqrt'),
      { label: 'd/dx', insert: 'd/dx ' },
      { label: '∫', insert: 'integral(' },
      { label: '∑', insert: 'sum(' },
      { label: '∏', insert: 'product(' },
      { label: 'eˣ', insert: 'e^' },
      fn('ln', 'log'),
      { label: 'dx', insert: 'dx' },
      { label: 'x²', insert: '^2' },
      { label: '≤', insert: '<=' },
      { label: '≥', insert: '>=' },
      { label: 'aₙ', insert: 'a_' },
      { label: 'Sₙ', insert: 'S_' },
    ],
  },
  {
    id: 'lin',
    name: '线代矩阵',
    icon: Grid3x3,
    items: [
      { label: '[ ]', insert: '[]', cursorOffset: -1 },
      { label: '[[ ]]', insert: '[[],[]]', cursorOffset: -5, tooltip: '2×2 矩阵' },
      fn('det', 'det'),
      fn('inv', 'inv'),
      { label: 'ᵀ', insert: '^T' },
      { label: '·', insert: '*' },
      { label: '×', insert: 'x', tooltip: '叉乘（向量积）' },
      fn('|v|', 'abs'),
      { label: 'i', insert: 'i' },
      fn('Re', 'Re'),
      fn('Im', 'Im'),
      fn('√', 'sqrt'),
    ],
  },
  {
    id: 'prob',
    name: '概率统计',
    icon: Percent,
    items: [
      fn('C(n,k)', 'combinations', '组合数'),
      fn('A(n,k)', 'permutations', '排列数'),
      { label: 'n!', insert: '!' },
      { label: 'E(X)', insert: 'E(X)' },
      { label: 'D(X)', insert: 'D(X)' },
      { label: 'P(', insert: 'P(' },
      { label: '|', insert: '|' },
      { label: '≤', insert: '<=' },
      { label: '≥', insert: '>=' },
      { label: '/', insert: '/' },
      { label: 'λ', insert: 'lambda' },
      { label: 'σ', insert: 'sigma' },
    ],
  },
  {
    id: 'sets',
    name: '集合逻辑',
    icon: Braces,
    items: [
      { label: '∈', insert: ' in ' },
      { label: '∉', insert: ' not in ' },
      { label: '∪', insert: ' union ' },
      { label: '∩', insert: ' intersect ' },
      { label: '⊆', insert: ' subset ' },
      { label: '∅', insert: '{}' },
      { label: '{ }', insert: '{}', cursorOffset: -1 },
      { label: '∀', insert: 'forall ' },
      { label: '∃', insert: 'exists ' },
      { label: '¬', insert: 'not ' },
      { label: '∧', insert: ' and ' },
      { label: '∨', insert: ' or ' },
    ],
  },
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
      { label: 'ω', insert: 'omega' },
      { label: 'Δ', insert: 'Delta' },
      { label: 'Σ', insert: 'Sigma' },
      { label: 'Ω', insert: 'Omega' },
      { label: 'π', insert: 'pi' },
    ],
  },
];

interface SymbolPaletteProps {
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  defaultOpen?: boolean;
  inline?: boolean;
  className?: string;
  /** 当前知识点：用于把相关符号组排到前面 */
  topicKey?: string;
}

export default function SymbolPalette({
  inputRef,
  value,
  onChange,
  defaultOpen = false,
  inline = false,
  className,
  topicKey,
}: SymbolPaletteProps) {
  const preferred = topicKey ? MATH_SYMBOL_TOPIC_MAP[topicKey] : undefined;
  const groups = useMemo(() => {
    if (!preferred) return SYMBOL_GROUPS;
    const first = SYMBOL_GROUPS.find((g) => g.id === preferred);
    if (!first) return SYMBOL_GROUPS;
    return [first, ...SYMBOL_GROUPS.filter((g) => g.id !== preferred)];
  }, [preferred]);

  const [isOpen, setIsOpen] = useState(inline || defaultOpen);
  const [activeGroup, setActiveGroup] = useState(preferred ?? 'basic');

  const togglePanel = useCallback(() => setIsOpen((v) => !v), []);

  const insertAtCursor = useCallback(
    (text: string, cursorOffset: number = 0) => {
      const input = inputRef.current;
      if (!input) {
        onChange(value + text);
        return;
      }
      input.focus();
      const start = input.selectionStart ?? value.length;
      const end = input.selectionEnd ?? value.length;
      const newValue = value.substring(0, start) + text + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        if (!inputRef.current) return;
        const pos = Math.max(0, Math.min(newValue.length, start + text.length + cursorOffset));
        inputRef.current.setSelectionRange(pos, pos);
        inputRef.current.focus();
      });
    },
    [inputRef, value, onChange],
  );

  const backspace = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      onChange(value.slice(0, -1));
      return;
    }
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    if (start !== end) {
      const nv = value.substring(0, start) + value.substring(end);
      onChange(nv);
      requestAnimationFrame(() => inputRef.current?.setSelectionRange(start, start));
      return;
    }
    if (start === 0) return;
    const nv = value.substring(0, start - 1) + value.substring(start);
    onChange(nv);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(start - 1, start - 1));
  }, [inputRef, value, onChange]);

  const moveCursor = useCallback(
    (delta: number) => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      const pos = Math.max(0, Math.min(value.length, (input.selectionStart ?? 0) + delta));
      input.setSelectionRange(pos, pos);
    },
    [inputRef, value.length],
  );

  const currentGroup = groups.find((g) => g.id === activeGroup) ?? groups[0];
  const panelVisible = inline || isOpen;

  return (
    <div className={cn('w-full', className)}>
      {!inline && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={togglePanel}
          className="w-full h-8 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/60 rounded-lg"
        >
          <Sigma className="size-3.5 mr-1.5" />
          数学键盘
          {isOpen ? <ChevronUp className="size-3.5 ml-1.5" /> : <ChevronDown className="size-3.5 ml-1.5" />}
        </Button>
      )}

      {panelVisible && (
        <div
          className={cn(
            inline ? '' : 'mt-2 border border-border/60 rounded-lg bg-card/50 backdrop-blur-sm',
            'overflow-hidden',
          )}
        >
          <div className="flex overflow-x-auto border-b border-border/60 bg-muted/30">
            {groups.map((group) => {
              const Icon = group.icon;
              const isActive = activeGroup === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroup(group.id)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-2 text-xs whitespace-nowrap transition-colors border-b-2 -mb-px',
                    isActive
                      ? 'text-primary border-primary font-medium bg-background/60'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-background/30',
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{group.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-2 grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-56 overflow-y-auto">
            {currentGroup.items.map((item, idx) => (
              <button
                key={item.label + '-' + idx}
                type="button"
                onClick={() =>
                  insertAtCursor(item.insert, item.cursorOffset ?? (item.insert.endsWith('(') ? -1 : 0))
                }
                title={item.tooltip ?? item.label}
                className="h-9 rounded-md text-sm font-mono bg-background hover:bg-primary/10 hover:text-primary border border-border/50 transition-all active:scale-95 flex items-center justify-center"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 border-t border-border/60 px-2 py-1.5">
            <button
              type="button"
              onClick={() => moveCursor(-1)}
              className="h-8 flex-1 rounded-md border border-border/50 text-xs text-muted-foreground hover:bg-muted/60"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => moveCursor(1)}
              className="h-8 flex-1 rounded-md border border-border/50 text-xs text-muted-foreground hover:bg-muted/60"
            >
              →
            </button>
            <button
              type="button"
              onClick={backspace}
              className="h-8 flex-[2] rounded-md border border-border/50 text-xs text-muted-foreground hover:bg-muted/60 flex items-center justify-center gap-1"
            >
              <CornerDownLeft className="size-3.5" />
              退格
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="h-8 flex-[2] rounded-md border border-border/50 text-xs text-destructive hover:bg-destructive/10 flex items-center justify-center gap-1"
            >
              <Trash2 className="size-3.5" />
              清空
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
