// 公式速查卡：高频公式精选抽屉面板
// 快捷键 Ctrl/Cmd + ' 唤起，Esc 关闭，右侧滑出

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Copy, Check, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { FORMULA_CATEGORIES, type IFormulaItem } from '@/data/formulas';
import MathRenderer from '@/components/MathRenderer';
import { cn } from '@/lib/utils';

interface FormulaQuickSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 高频公式分类配置：源分类名 → 速查分类 key/label + 选取条数（前 N 条最常用）
const FREQUENT_CONFIG: { sourceCategory: string; quickKey: string; quickLabel: string; count: number }[] = [
  { sourceCategory: '极限', quickKey: 'limit', quickLabel: '极限', count: 8 },
  { sourceCategory: '导数', quickKey: 'derivative', quickLabel: '导数', count: 12 },
  { sourceCategory: '积分', quickKey: 'integral', quickLabel: '积分', count: 12 },
  { sourceCategory: '级数', quickKey: 'series', quickLabel: '级数', count: 8 },
  { sourceCategory: '微分方程', quickKey: 'ode', quickLabel: 'ODE', count: 6 },
  { sourceCategory: '三角', quickKey: 'trig', quickLabel: '三角', count: 6 },
  { sourceCategory: '代数', quickKey: 'algebra', quickLabel: '代数', count: 4 },
  { sourceCategory: '线性代数', quickKey: 'linear', quickLabel: '线代', count: 4 },
];

const CATEGORY_TABS = [
  { key: 'all', label: '全部' },
  ...FREQUENT_CONFIG.map((c) => ({ key: c.quickKey, label: c.quickLabel })),
];

// 构建高频公式分组（从全量公式里按分类取前 N 条）
function buildFrequentFormulas(): { category: string; categoryKey: string; items: (IFormulaItem & { category: string })[] }[] {
  const result: { category: string; categoryKey: string; items: (IFormulaItem & { category: string })[] }[] = [];
  
  for (const cfg of FREQUENT_CONFIG) {
    const source = FORMULA_CATEGORIES.find((c) => c.name === cfg.sourceCategory);
    if (!source) continue;
    const items = source.items.slice(0, cfg.count).map((item) => ({
      ...item,
      category: source.name,
    }));
    result.push({
      category: cfg.quickLabel,
      categoryKey: cfg.quickKey,
      items,
    });
  }
  
  return result;
}

const frequentFormulas = buildFrequentFormulas();
const totalCount = frequentFormulas.reduce((s, g) => s + g.items.length, 0);

export default function FormulaQuickSheet({ open, onOpenChange }: FormulaQuickSheetProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 重置状态
  useEffect(() => {
    if (open) {
      setActiveTab('all');
      setQuery('');
    }
  }, [open]);

  // 快捷键：Esc 关闭（Sheet 自带，这里补一个复制反馈清理）
  useEffect(() => {
    if (!copiedId) return;
    const t = setTimeout(() => setCopiedId(null), 1500);
    return () => clearTimeout(t);
  }, [copiedId]);

  const handleCopy = useCallback(async (formula: IFormulaItem & { category: string }) => {
    try {
      await navigator.clipboard.writeText(formula.latex);
      setCopiedId(formula.id);
      toast.success('已复制 LaTeX 公式');
    } catch {
      toast.error('复制失败，请手动选择复制');
    }
  }, []);

  // 过滤：按分类 tab + 搜索词
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = activeTab === 'all'
      ? frequentFormulas
      : frequentFormulas.filter((g) => g.categoryKey === activeTab);

    if (!q) return groups;

    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q) ||
            (f.scenario && f.scenario.toLowerCase().includes(q)) ||
            (f.tags && f.tags.some((t) => t.toLowerCase().includes(q))),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeTab, query]);

  const filteredCount = filtered.reduce((s, g) => s + g.items.length, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4 text-primary" />
            公式速查卡
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              共 {totalCount} 条
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* 搜索框 */}
        <div className="px-4 pt-3 pb-2 border-b border-border/50">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索公式名称、说明、标签…"
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* 分类 tab */}
        <div className="px-2 pt-2 border-b border-border/50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex overflow-x-auto flex-nowrap bg-transparent h-auto p-0 gap-1 pb-2 hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]">
              {CATEGORY_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className={cn(
                    'shrink-0 h-7 px-3 text-xs rounded-md whitespace-nowrap',
                    'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
                    'data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-accent/50',
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* 公式列表 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {filteredCount === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {query ? '未找到匹配公式' : '暂无公式'}
            </div>
          ) : (
            filtered.map((group) => (
              <div key={group.categoryKey} className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground px-1">
                  {group.category}（{group.items.length}）
                </div>
                {group.items.map((f) => {
                  const isCopied = copiedId === f.id;
                  return (
                    <div
                      key={f.id}
                      className={cn(
                        'group relative rounded-lg border border-border bg-card p-3',
                        'hover:border-primary/30 hover:bg-accent/20 transition-colors',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-sm font-medium text-foreground truncate">
                          {f.name}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            '!absolute right-2 top-2 z-20 h-7 w-7',
                            isCopied ? 'text-success bg-success/10' : 'text-muted-foreground opacity-0 group-hover:opacity-100',
                          )}
                          onClick={() => handleCopy(f)}
                          aria-label={isCopied ? '已复制' : '复制公式'}
                        >
                          {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {f.description}
                      </div>
                      <div
                        className="bg-muted/30 rounded-md px-2 py-2 cursor-pointer"
                        onClick={() => handleCopy(f)}
                        title="点击复制 LaTeX 源码"
                      >
                        <MathRenderer expression={f.latex} displayMode={false} className="text-sm" />
                      </div>
                      {f.scenario && (
                        <div className="mt-2 text-xs text-muted-foreground/70">
                          适用：{f.scenario}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* 底部提示 */}
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">⌘'</kbd> 开关
          </span>
          <span>点击公式卡片复制 LaTeX</span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Esc</kbd> 关闭
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
