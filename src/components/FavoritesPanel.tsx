import { useState, memo, useEffect } from 'react';
import { Star, StarOff, X, Copy, Trash2, Bookmark, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useFavorites, FAVORITES_KEY, FAVORITES_LIMIT, type FavoriteItem } from '@/hooks/use-learning';
import { scopedStorage } from '@/lib/lark-mock';
import MathRenderer from '@/components/MathRenderer';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FavoritesPanelProps {
  /** 触发方式：floating 浮动按钮 / inline 内联按钮 */
  trigger?: 'floating' | 'inline';
  /** 当 trigger=inline 时，自定义 trigger 按钮 */
  children?: React.ReactNode;
}

function FavoritesPanel({ trigger = 'floating', children }: FavoritesPanelProps) {
  const { items, grouped, removeFavorite, clearFavorites, limit } = useFavorites();
  const [open, setOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // 监听全局打开事件
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('mathforge:open-favorites', handler);
    return () => window.removeEventListener('mathforge:open-favorites', handler);
  }, []);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  const handleClear = () => {
    if (items.length === 0) return;
    if (confirm(`确定要清空所有 ${items.length} 条收藏吗？`)) {
      clearFavorites();
      toast.success('已清空收藏夹');
    }
  };

  const moduleLabels: Record<string, string> = {
    calculator: '科学计算器',
    symbolic: '符号代数',
    calculus: '微积分',
    'linear-algebra': '线性代数',
    probability: '概率统计',
    'number-theory': '数论',
    'plot-2d': '2D 绘图',
    'plot-3d': '3D 绘图',
    multivariable: '多元微积分',
    ode: '常微分方程',
    numerical: '数值分析',
    fourier: '傅里叶分析',
    complex: '复变函数',
    discrete: '离散数学',
    modern: '现代数学',
    pde: '偏微分方程',
    'diff-geo': '微分几何',
    competition: '数学竞赛',
    practice: '练习训练',
  };

  const triggerBtn = children ?? (
    <Button variant="outline" size="icon" className="relative" aria-label="收藏夹">
      <Bookmark className="size-4" />
      {items.length > 0 && (
        <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center font-bold">
          {items.length > 99 ? '99+' : items.length}
        </span>
      )}
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger === 'floating' ? (
          <button className="hidden md:flex fixed right-4 bottom-4 z-40 size-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all items-center justify-center">
            <Bookmark className="size-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center font-bold">
                {items.length > 99 ? '99+' : items.length}
              </span>
            )}
          </button>
        ) : (
          triggerBtn
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Star className="size-5 text-amber-500" />
              我的收藏
              <span className="text-sm font-normal text-muted-foreground">
                {items.length}/{limit}
              </span>
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClear} disabled={items.length === 0}>
              <Trash2 className="size-3.5 mr-1" />
              清空
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
              <StarOff className="size-12 text-muted-foreground/40" />
              <div className="text-muted-foreground">
                <p className="font-medium text-foreground">暂无收藏</p>
                <p className="text-sm mt-1">在各模块结果卡片点击星标即可收藏</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(grouped.entries()).map(([moduleKey, favItems]) => {
                const label = moduleLabels[moduleKey] || moduleKey;
                const isExpanded = expandedModule === moduleKey || expandedModule === null;
                return (
                  <div key={moduleKey} className="rounded-lg border border-border/50 bg-card/50">
                    <button
                      onClick={() => setExpandedModule(isExpanded ? moduleKey : null)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                      <span>
                        {label}
                        <span className="text-xs text-muted-foreground ml-2">
                          {favItems.length} 条
                        </span>
                      </span>
                      <ChevronDown
                        className={cn('size-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')}
                      />
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border/30 p-3 space-y-2">
                        {favItems.map((fav) => (
                          <div
                            key={fav.id}
                            className="p-3 rounded-md bg-muted/30 hover:bg-muted/60 transition-colors group relative"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="text-xs text-muted-foreground shrink-0">
                                {format(fav.savedAt, 'MM-dd HH:mm')}
                              </div>
                              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-6"
                                  onClick={() => handleCopy(`${fav.expression} = ${fav.result}`)}
                                  title="复制"
                                >
                                  <Copy className="size-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-6 text-destructive"
                                  onClick={() => {
                                    removeFavorite(fav.id);
                                    toast.success('已移除收藏');
                                  }}
                                  title="删除"
                                  aria-label="删除收藏"
                                >
                                  <X className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground font-mono truncate mb-1">
                              {fav.expression}
                            </div>
                            <div className="text-base font-semibold text-foreground">
                              {fav.resultLatex ? (
                                <MathRenderer expression={fav.resultLatex} isInput />
                              ) : (
                                fav.result
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default memo(FavoritesPanel);

/** 收藏按钮：在结果卡片上使用（自维护本地状态，直接读写 scopedStorage） */
interface FavoriteStarProps {
  moduleKey: string;
  moduleLabel: string;
  expression: string;
  result: string;
  resultLatex?: string;
  size?: 'sm' | 'md';
}

export function FavoriteStar({ moduleKey, moduleLabel, expression, result, resultLatex, size = 'sm' }: FavoriteStarProps) {
  const [favorited, setFavorited] = useState(false);

  // 初始读取
  useEffect(() => {
    try {
      const raw = scopedStorage.getItem(FAVORITES_KEY);
      if (!raw) return;
      const items: FavoriteItem[] = JSON.parse(raw);
      const found = items.some(
        (f) => f.moduleKey === moduleKey && f.expression === expression && f.result === result,
      );
      setFavorited(found);
    } catch {
      // ignore
    }
  }, [moduleKey, expression, result]);

  const handleClick = () => {
    try {
      const raw = scopedStorage.getItem(FAVORITES_KEY);
      const items: FavoriteItem[] = raw ? JSON.parse(raw) : [];

      if (favorited) {
        // 取消收藏：找到并删除
        const filtered = items.filter(
          (f) => !(f.moduleKey === moduleKey && f.expression === expression && f.result === result),
        );
        scopedStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
        setFavorited(false);
        toast.success('已取消收藏');
      } else {
        // 添加收藏
        if (items.length >= FAVORITES_LIMIT) {
          toast.error(`收藏夹已满（上限 ${FAVORITES_LIMIT} 条）`);
          return;
        }
        const dup = items.some(
          (f) => f.moduleKey === moduleKey && f.expression === expression && f.result === result,
        );
        if (dup) {
          setFavorited(true);
          return;
        }
        const fav: FavoriteItem = {
          id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          moduleKey,
          moduleLabel,
          expression,
          result,
          resultLatex,
          savedAt: Date.now(),
        };
        scopedStorage.setItem(FAVORITES_KEY, JSON.stringify([fav, ...items]));
        setFavorited(true);
        toast.success('已加入收藏');
      }
    } catch {
      toast.error('操作失败');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center rounded-md transition-all duration-200',
        size === 'sm' ? 'size-7' : 'size-8',
        favorited
          ? 'text-amber-400 hover:text-amber-300 favorite-sticker'
          : 'text-emerald-300/70 hover:text-amber-400 hover:bg-amber-500/10',
      )}
      title={favorited ? '取消收藏' : '收藏结果'}
    >
      <Star className={cn(size === 'sm' ? 'size-3.5' : 'size-4', favorited && 'fill-current')} />
    </button>
  );
}
