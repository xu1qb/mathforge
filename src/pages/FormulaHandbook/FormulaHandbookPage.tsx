import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  Dices,
  ArrowUp,
  Copy,
  Check,
  Lightbulb,
  Sigma,
  Activity,
  FunctionSquare,
  Grid3x3,
  BarChart3,
  PlusSquare,
  Globe,
  Sparkles,
  Heart,
  BookMarked,
  Download,
  Share2,
  ExternalLink,
  Hash,
  GitBranch,
  ToggleLeft,
  Trophy,
  Filter,
  Paperclip,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { FORMULA_CATEGORIES, type IFormulaItem } from '@/data/formulas';
import { normalizeMathInput } from '@/lib/math-normalize';
import PageShell from '@/components/PageShell';
import { cn } from '@/lib/utils';
import { useFormulaFavorites } from '@/hooks/useFormulaFavorites';
import { copyAsText, copyAsLatex, copyAsMarkdown, exportTextFile } from '@/lib/export-utils';
import MathRenderer from '@/components/MathRenderer';

// 模块路径 → 中文名称 & 颜色 映射
const MODULE_INFO: Record<string, { label: string; color: string }> = {
  '/calculator': { label: '科学计算器', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40' },
  '/symbolic': { label: '符号代数', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200/60 dark:border-teal-800/40' },
  '/calculus': { label: '微积分', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40' },
  '/linear-algebra': { label: '线性代数', color: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90 border-primary/20 dark:border-primary/30' },
  '/probability': { label: '概率统计', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40' },
  '/number-theory': { label: '数论基础', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/60 dark:border-orange-800/40' },
  '/plot-2d': { label: '二维绘图', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/40' },
  '/plot-3d': { label: '三维曲面', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/40' },
  '/multivariable': { label: '多元微积分', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200/60 dark:border-teal-800/40' },
  '/ode': { label: '常微分方程', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40' },
  '/numerical': { label: '数值分析', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400 border-lime-200/60 dark:border-lime-800/40' },
  '/fourier': { label: '傅里叶级数', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/40' },
  '/complex': { label: '复变函数', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 border-fuchsia-200/60 dark:border-fuchsia-800/40' },
  '/discrete': { label: '离散数学', color: 'bg-muted text-foreground border-border/60' },
  '/modern': { label: '现代数学', color: 'bg-muted text-foreground border-border/60' },
  '/pde': { label: '偏微分方程', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200/60 dark:border-pink-800/40' },
  '/diff-geo': { label: '微分几何', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200/60 dark:border-yellow-800/40' },
  '/competition': { label: '数学竞赛', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40' },
  '/special': { label: '特殊函数', color: 'bg-muted text-muted-foreground border-border/60' },
};

const iconMap: Record<string, typeof Sigma> = {
  Sigma,
  Activity,
  FunctionSquare,
  Grid3x3,
  BarChart3,
  PlusSquare,
  Globe,
  Sparkles,
  Hash,
  GitBranch,
  ToggleLeft,
  Trophy,
};

export default function FormulaHandbookPage() {
  const [activeCategory, setActiveCategory] = useState('algebra');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchMode, setSearchMode] = useState<'name' | 'description' | 'all'>('all');
  const [showBackTop, setShowBackTop] = useState(false);
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite } = useFormulaFavorites();

  // 监听滚动显示回到顶部
  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const allItems = useMemo(() => {
    return FORMULA_CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({ ...item, categoryId: cat.id, categoryName: cat.name })),
    );
  }, []);

  const favoriteItems = useMemo(() => {
    return allItems.filter((i) => favorites.includes(i.id));
  }, [allItems, favorites]);

  const filteredItems = useMemo(() => {
    const qRaw = search.trim();
    // 搜索词也做符号归一化，支持 √、π、x² 等直接搜
    const q = normalizeMathInput(qRaw).toLowerCase();

    // 计算匹配分数，用于排序
    const scoreItem = (item: IFormulaItem): number => {
      if (!q) return 1;
      const nameLower = item.name.toLowerCase();
      const descLower = item.description.toLowerCase();
      const tagsLower = item.tags?.map(t => t.toLowerCase()) || [];
      const scenarioLower = (item.scenario || '').toLowerCase();
      const latexPlain = item.latex.replace(/\\/g, '').toLowerCase();

      let score = 0;
      // 精确匹配名字：最高权重
      if (nameLower === q || nameLower === qRaw.toLowerCase()) score += 100;
      // 名字包含
      else if (nameLower.includes(q) || nameLower.includes(qRaw.toLowerCase())) score += 50;
      // 标签精确匹配
      if (tagsLower.some(t => t === q || t === qRaw.toLowerCase())) score += 40;
      // 标签包含
      if (tagsLower.some(t => t.includes(q) || t.includes(qRaw.toLowerCase()))) score += 25;
      // 描述包含
      if (descLower.includes(q) || descLower.includes(qRaw.toLowerCase())) score += 20;
      // 场景包含（反查核心）
      if (scenarioLower.includes(q) || scenarioLower.includes(qRaw.toLowerCase())) score += 30;
      // LaTeX 包含
      if (latexPlain.includes(q)) score += 10;

      // 反查模式：描述/场景关键词匹配加分
      if (searchMode === 'description' || searchMode === 'all') {
        // 常见问题关键词 → 场景/描述匹配加强
        const descKeywords = ['求', '计算', '已知', '证明', '公式', '定理', '等于', '最值', '积分', '导数', '极限', '求和', '面积', '距离', '概率', '期望', '方程'];
        const matchedKeywords = descKeywords.filter(kw => q.includes(kw) || qRaw.toLowerCase().includes(kw));
        if (matchedKeywords.length > 0 && (descLower.includes(q.replace(new RegExp(matchedKeywords.join('|'), 'g'), '').trim()) || scenarioLower.includes(q.replace(new RegExp(matchedKeywords.join('|'), 'g'), '').trim()))) {
          score += 15 * matchedKeywords.length;
        }
      }

      return score;
    };

    const matchItem = (item: IFormulaItem) => {
      if (!q) return true;
      if (searchMode === 'name') {
        const nameLower = item.name.toLowerCase();
        const tagsLower = item.tags?.map(t => t.toLowerCase()) || [];
        return nameLower.includes(q) || nameLower.includes(qRaw.toLowerCase()) ||
          tagsLower.some(t => t.includes(q) || t.includes(qRaw.toLowerCase()));
      }
      if (searchMode === 'description') {
        const descLower = item.description.toLowerCase();
        const scenarioLower = (item.scenario || '').toLowerCase();
        return descLower.includes(q) || descLower.includes(qRaw.toLowerCase()) ||
          scenarioLower.includes(q) || scenarioLower.includes(qRaw.toLowerCase());
      }
      // all 模式
      const nameLower = item.name.toLowerCase();
      const descLower = item.description.toLowerCase();
      const tagsLower = item.tags?.map(t => t.toLowerCase()) || [];
      const latexPlain = item.latex.replace(/\\/g, '').toLowerCase();
      const scenarioLower = (item.scenario || '').toLowerCase();
      
      return (
        nameLower.includes(q) ||
        nameLower.includes(qRaw.toLowerCase()) ||
        descLower.includes(q) ||
        descLower.includes(qRaw.toLowerCase()) ||
        scenarioLower.includes(q) ||
        scenarioLower.includes(qRaw.toLowerCase()) ||
        latexPlain.includes(q) ||
        tagsLower.some(t => t.includes(q) || t.includes(qRaw.toLowerCase()))
      );
    };

    type FormulaItemWithCategory = IFormulaItem & { categoryId: string; categoryName: string };
    let items: FormulaItemWithCategory[] = [];
    // 收藏模式
    if (showFavorites) {
      items = q ? favoriteItems.filter(matchItem) : favoriteItems;
    } else if (activeCategory === 'all' || q) {
      items = allItems.filter(matchItem);
    } else {
      items = allItems.filter((i) => i.categoryId === activeCategory);
      if (q) items = items.filter(matchItem);
    }

    // 有搜索词时按相关度排序
    if (q) {
      items = [...items].sort((a, b) => scoreItem(b) - scoreItem(a));
    }

    return items;
  }, [allItems, activeCategory, search, showFavorites, searchMode, favoriteItems]);

  const handleCopyLatex = useCallback(
    (item: IFormulaItem) => {
      copyAsLatex(item.latex);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    },
    [],
  );

  const handleCopyMarkdown = useCallback((item: IFormulaItem) => {
    copyAsMarkdown(item.name, item.latex, item.description);
  }, []);

  const handleCopyText = useCallback((item: IFormulaItem) => {
    copyAsText(`${item.name}: ${item.latex}`, '文本');
  }, []);

  const handleJumpToModule = useCallback(
    (item: IFormulaItem) => {
      if (item.modulePath) {
        const target = item.moduleTab ? `${item.modulePath}#${encodeURIComponent(item.moduleTab)}` : item.modulePath;
        navigate(target);
      } else {
        toast.info('暂无对应模块');
      }
    },
    [navigate],
  );

  const handleCheatsheet = useCallback(() => {
    toast.info('提示：左侧分类浏览，顶部搜索，点击公式卡片可复制 LaTeX');
  }, []);

  const handleExportAll = useCallback(() => {
    const lines: string[] = ['# MathForge 公式手册', ''];
    FORMULA_CATEGORIES.forEach((cat) => {
      lines.push(`## ${cat.name}`);
      lines.push('');
      cat.items.forEach((item) => {
        lines.push(`### ${item.name}`);
        lines.push('');
        lines.push(`$$${item.latex}$$`);
        lines.push('');
        lines.push(item.description);
        if (item.scenario) {
          lines.push(`**场景**: ${item.scenario}`);
        }
        lines.push('');
      });
    });
    exportTextFile(lines.join('\n'), 'mathforge-formulas.md');
  }, []);

  const activeCat = FORMULA_CATEGORIES.find((c) => c.id === activeCategory);
  const totalFormulas = allItems.length;

  return (
    <TooltipProvider>
      <div className="page-fade-in min-h-screen">
      <PageShell
        title="公式手册"
        eyebrow="计算工具"
        width="tool"
        onCheatsheet={handleCheatsheet}
      />

        <div className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
            {/* 左侧分类 */}
            <aside className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="搜索公式、按描述反查..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-24"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    title="随机看一个公式"
                    onClick={() => {
                      const all = FORMULA_CATEGORIES.flatMap((cat) => cat.items);
                      const random = all[Math.floor(Math.random() * all.length)];
                      setSearch(random.name);
                    }}
                    className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Dices className="size-3.5" />
                  </button>
                  <select
                    value={searchMode}
                    onChange={(e) => setSearchMode(e.target.value as 'name' | 'description' | 'all')}
                    className="text-xs bg-transparent text-muted-foreground outline-none cursor-pointer pr-1"
                    title="搜索范围"
                  >
                    <option value="all">全部</option>
                    <option value="name">名称</option>
                    <option value="description">反查</option>
                  </select>
                </div>
              </div>

              {/* 横向分类快捷标签（手机端） */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 lg:hidden">
                {FORMULA_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id && !showFavorites && !search.trim();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setShowFavorites(false);
                        setSearch('');
                      }}
                      className={cn(
                        'shrink-0 px-2.5 py-1 rounded-full text-xs transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80',
                      )}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* 我的收藏 */}
              <button
                onClick={() => {
                  setShowFavorites(true);
                  setSearch('');
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border',
                  showFavorites
                    ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 font-medium'
                    : 'bg-card border-border text-foreground hover:border-rose-200',
                )}
              >
                <Heart className={cn('size-4 shrink-0', showFavorites && 'fill-rose-500')} />
                <span className="text-sm flex-1">我的收藏</span>
                <span className="text-xs text-muted-foreground dark:text-muted-foreground">{favorites.length}</span>
              </button>

              <div className="flex items-center gap-2 px-1 pt-2">
                <Filter className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">公式分类</span>
              </div>

              <ScrollArea className="h-[calc(100vh-360px)] pr-1">
                <div className="space-y-1">
                  {FORMULA_CATEGORIES.map((cat) => {
                    const Icon = iconMap[cat.icon] || Sigma;
                    const isActive = activeCategory === cat.id && !showFavorites && !search.trim();
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setShowFavorites(false);
                          setSearch('');
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                          'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'text-foreground dark:text-foreground',
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="text-sm flex-1 truncate">{cat.name}</span>
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground tabular-nums">
                          {cat.items.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* 导出按钮 */}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-border text-foreground"
                onClick={handleExportAll}
              >
                <Download className="size-3.5 mr-1.5" />
                导出全部 Markdown
              </Button>
            </aside>

            {/* 右侧公式列表 */}
            <main className="space-y-4 journal-notebook">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {showFavorites
                      ? '我的收藏'
                      : search.trim()
                      ? `搜索结果 (${filteredItems.length})`
                      : activeCat?.name}
                  </h2>
                  {!search.trim() && !showFavorites && activeCat && (
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-0.5">
                      {activeCat.description} · 共 {activeCat.items.length} 条
                    </p>
                  )}
                  {showFavorites && (
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-0.5">
                      已收藏 {favoriteItems.length} 条公式
                    </p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                  共 <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalFormulas}</span> 条公式
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground dark:text-muted-foreground">
                  {showFavorites ? (
                    <>
                      <BookMarked className="size-10 mb-3 opacity-40" />
                      <p className="text-sm">还没有收藏的公式</p>
                      <p className="text-xs mt-1">点击公式卡片右上角 ♥ 图标收藏</p>
                    </>
                  ) : (
                    <>
                      <Search className="size-10 mb-3 opacity-40" />
                      <p className="text-sm">未找到相关公式</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredItems.map((item) => (
                    <FormulaCard
                      key={item.id}
                      item={item}
                      copied={copiedId === item.id}
                      isFav={isFavorite(item.id)}
                      onCopyLatex={() => handleCopyLatex(item)}
                      onCopyText={() => handleCopyText(item)}
                      onCopyMarkdown={() => handleCopyMarkdown(item)}
                      onToggleFav={() => toggleFavorite(item.id)}
                      onJump={() => handleJumpToModule(item)}
                      showCategory={!!search.trim() || showFavorites}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* 回到顶部 */}
      {showBackTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-4 z-40 size-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          title="回到顶部"
        >
          <ArrowUp className="size-5" />
        </button>
      )}
    </TooltipProvider>
  );
}

interface FormulaCardProps {
  item: IFormulaItem & { categoryId: string; categoryName: string };
  copied: boolean;
  isFav: boolean;
  onCopyLatex: () => void;
  onCopyText: () => void;
  onCopyMarkdown: () => void;
  onToggleFav: () => void;
  onJump: () => void;
  showCategory: boolean;
}

function FormulaCard({
  item,
  copied,
  isFav,
  onCopyLatex,
  onCopyText,
  onCopyMarkdown,
  onToggleFav,
  onJump,
  showCategory,
}: FormulaCardProps) {
  return (
    <div className="group bg-card border-border rounded-xl p-4 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-sm transition-all relative journal-card paper-fall">
      {/* 手账皮肤回形针 */}
      <Paperclip className="paperclip-icon size-5" aria-hidden />
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {showCategory && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant="outline" className="text-xs font-normal border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                {item.categoryName}
              </Badge>
              {item.modulePath && MODULE_INFO[item.modulePath] && (
                <Badge variant="outline" className={`text-xs font-normal ${MODULE_INFO[item.modulePath].color}`}>
                  {MODULE_INFO[item.modulePath].label}
                </Badge>
              )}
            </div>
          )}
          <h3 className="font-semibold text-foreground text-sm">
            {item.name}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={onToggleFav}
                className={cn(
                  'size-7 shrink-0 -mt-1',
                  isFav
                    ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30'
                    : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30',
                )}
                aria-label={isFav ? '取消收藏' : '收藏'}
              >
                <Heart className={cn('size-4', isFav && 'fill-current')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFav ? '取消收藏' : '收藏公式'}</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 shrink-0 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 -mt-1 -mr-1"
                aria-label="复制/分享"
              >
                {copied ? <Check className="size-4 text-emerald-500" /> : <Share2 className="size-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onCopyLatex}>
                <Copy className="size-4 mr-2" />
                复制 LaTeX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopyMarkdown}>
                <Copy className="size-4 mr-2" />
                复制 Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopyText}>
                <Copy className="size-4 mr-2" />
                复制文本
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 公式展示区 */}
      <div
        className="bg-muted/50 rounded-lg px-4 py-4 mb-3 overflow-x-auto cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors min-h-[3rem] flex items-center justify-center"
        onClick={onCopyLatex}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onCopyLatex()}
      >
        <MathRenderer expression={item.latex} displayMode className="text-base" />
      </div>

      <p className="text-xs text-foreground leading-relaxed mb-2">
        {item.description}
      </p>

      {item.scenario && (
        <div className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400/80 mb-2">
          <Lightbulb className="size-3.5 shrink-0 mt-0.5" />
          <span>{item.scenario}</span>
        </div>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 跳转模块 */}
      {item.modulePath && (
        <button
          onClick={onJump}
          className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium py-1.5 border-t border-border transition-colors"
        >
          去模块练习
          <ExternalLink className="size-3" />
        </button>
      )}
    </div>
  );
}
