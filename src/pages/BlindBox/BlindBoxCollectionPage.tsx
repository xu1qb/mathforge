import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sigma,
  Shapes,
  Dices,
  Brain,
  Hash,
  Infinity as InfinityIcon,
  FunctionSquare,
  HelpCircle,
  Lock,
  Star,
  ArrowRight,
  Sparkles,
  X,
  CheckCircle2,
  Gift,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import MathRenderer from '@/components/MathRenderer';
import {
  MATH_BLIND_BOXES,
  BLIND_BOX_CATEGORIES,
  type MathBlindBox,
} from '@/data/blind-box';
import { getOpenedIds, useBlindBox } from '@/hooks/use-blind-box';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, typeof Sigma> = {
  'series': Sigma,
  'geometry': Shapes,
  'probability': Dices,
  'paradox': Brain,
  'constants': Hash,
  'set-theory': InfinityIcon,
  'calculus': FunctionSquare,
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '入门',
  2: '简单',
  3: '中等',
  4: '进阶',
  5: '挑战',
};

export default function BlindBoxCollectionPage() {
  const navigate = useNavigate();
  const [openedIds] = useState<string[]>(() => getOpenedIds());
  const [selectedBox, setSelectedBox] = useState<MathBlindBox | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const {
    todayBox,
    isFlipped,
    openedCount,
    totalCount,
    openBox,
  } = useBlindBox();
  const isTodayOpened = openedIds.includes(todayBox.id);

  const categories = Object.entries(BLIND_BOX_CATEGORIES);

  const filteredBoxes = useMemo(() => {
    if (activeCategory === 'all') return MATH_BLIND_BOXES;
    return MATH_BLIND_BOXES.filter((b) => b.category === activeCategory);
  }, [activeCategory]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; opened: number }> = {};
    for (const cat of Object.keys(BLIND_BOX_CATEGORIES)) {
      const boxes = MATH_BLIND_BOXES.filter((b) => b.category === cat);
      stats[cat] = {
        total: boxes.length,
        opened: boxes.filter((b) => openedIds.includes(b.id)).length,
      };
    }
    return stats;
  }, [openedIds]);


  return (
    <div className="min-h-screen">
      {/* 返回条 */}
      <div className="px-4 md:px-6 lg:px-8 py-4 max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回
        </button>
      </div>

      <main className="px-4 md:px-6 lg:px-8 pb-12 max-w-5xl mx-auto space-y-6">
        {/* 顶部标题 + 进度 */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
            <Sparkles className="size-4" />
            盲盒图鉴
          </div>
          <h1 className="page-title">
            已收集 {openedCount} / {totalCount}
          </h1>
          <div className="w-full max-w-xs mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(openedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              每天解锁一个新结论，收集你的数学宇宙
            </p>
          </div>
        </div>

        {/* 今日盲盒翻转卡 */}
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              今日盲盒
            </span>
            <span className="text-xs text-muted-foreground">
              {isTodayOpened ? '已拆开 ✓' : '未拆开'}
            </span>
          </div>
          <div
            className="relative w-full aspect-[4/3] cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => !isFlipped && openBox()}
          >
            <motion.div
              className="w-full h-full relative"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* 背面 */}
              <div
                className="absolute inset-0 rounded-xl bg-amber-500 shadow-lg flex items-center justify-center overflow-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="absolute inset-0 bg-white/10" />
                <div className="relative text-center text-white z-10">
                  <Gift className="size-14 mx-auto mb-2 drop-shadow-md" />
                  <div className="text-lg font-black drop-shadow-md">？</div>
                  <div className="text-xs opacity-80 mt-1">点击拆开今日盲盒</div>
                </div>
                {/* 装饰点 */}
                <div className="absolute top-4 left-4 size-3 rounded-full bg-white/30" />
                <div className="absolute top-8 right-6 size-2 rounded-full bg-white/40" />
                <div className="absolute bottom-6 left-8 size-2.5 rounded-full bg-white/30" />
                <div className="absolute bottom-4 right-4 size-3 rounded-full bg-white/25" />
              </div>

              {/* 正面 */}
              <div
                className="absolute inset-0 rounded-xl bg-card border-2 border-amber-300/50 shadow-lg overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="h-full p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      {(() => {
                        const Icon = CATEGORY_ICONS[todayBox.category];
                        return <Icon className="size-4" />;
                      })()}
                    </div>
                    <Badge variant="outline" className="text-xs border-amber-400/40 text-amber-700 dark:text-amber-400">
                      {BLIND_BOX_CATEGORIES[todayBox.category]?.label}
                    </Badge>
                  </div>
                  <h3 className="text-base font-black text-foreground leading-tight mb-1">
                    {todayBox.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mb-auto">
                    {todayBox.hook}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: todayBox.difficulty }).map((_, j) => (
                        <Star key={j} className="size-3 fill-amber-400 text-amber-400" />
                      ))}
                      {Array.from({ length: 5 - todayBox.difficulty }).map((_, j) => (
                        <Star key={j} className="size-3 text-border" />
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBox(todayBox);
                      }}
                      className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 inline-flex items-center gap-0.5"
                    >
                      查看详情
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            全部
          </button>
          {categories.map(([key, cat]) => {
            const Icon = CATEGORY_ICONS[key];
            const stat = categoryStats[key];
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all inline-flex items-center gap-1.5',
                  activeCategory === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon className="size-3.5" />
                {cat.label}
                <span className="opacity-70">
                  {stat.opened}/{stat.total}
                </span>
              </button>
            );
          })}
        </div>

        {/* 卡片网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          <AnimatePresence>
            {filteredBoxes.map((box, i) => {
              const isOpened = openedIds.includes(box.id);
              const Icon = CATEGORY_ICONS[box.category];

              return (
                <motion.div
                  key={box.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                >
                  <button
                    onClick={() => isOpened && setSelectedBox(box)}
                    disabled={!isOpened}
                    className={cn(
                      'w-full aspect-[3/4] rounded-xl border-2 transition-all relative overflow-hidden text-left',
                      isOpened
                        ? 'bg-card border-border hover:border-primary/50 hover:shadow-md cursor-pointer'
                        : 'bg-muted/50 border-border/40 cursor-default',
                    )}
                  >
                    {isOpened ? (
                      <div className="h-full flex flex-col p-3 md:p-4">
                        <div
                          className={cn(
                            'size-9 rounded-lg flex items-center justify-center mb-2 shrink-0',
                            'bg-primary/10 text-primary',
                          )}
                        >
                          <Icon className="size-4.5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight mb-1">
                          {box.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mb-auto">
                          {box.hook}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          {Array.from({ length: box.difficulty }).map((_, j) => (
                            <Star key={j} className="size-3 fill-amber-400 text-amber-400" />
                          ))}
                          {Array.from({ length: 5 - box.difficulty }).map((_, j) => (
                            <Star key={j} className="size-3 text-border" />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <div className="size-10 mb-2 opacity-40">
                          <HelpCircle className="size-10" />
                        </div>
                        <span className="text-xs font-medium opacity-50">未解锁</span>
                        <Lock className="size-3 mt-1 opacity-40" />
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* 详情弹窗 */}
      <Dialog open={!!selectedBox} onOpenChange={(o) => !o && setSelectedBox(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          {selectedBox && (
            <>
              <DialogHeader className="px-5 md:px-6 pt-5 pb-0">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = CATEGORY_ICONS[selectedBox.category];
                      return <Icon className="size-5" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg font-black text-foreground">
                      {selectedBox.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {BLIND_BOX_CATEGORIES[selectedBox.category]?.label}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        难度 {DIFFICULTY_LABELS[selectedBox.difficulty]}
                      </Badge>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: selectedBox.difficulty }).map((_, j) => (
                          <Star key={j} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogClose asChild>
                    <Button size="icon" variant="ghost" className="size-8 shrink-0">
                      <X className="size-4" />
                    </Button>
                  </DialogClose>
                </div>
              </DialogHeader>

              <div className="overflow-y-auto px-5 md:px-6 py-4 space-y-4">
                {/* 钩子 */}
                <p className="text-sm font-medium text-primary bg-primary/5 rounded-xl p-3 leading-relaxed">
                  💡 {selectedBox.hook}
                </p>

                {/* 解释 */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    通俗解释
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {selectedBox.explanation}
                  </p>
                </div>

                {/* 证明/思路 */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sigma className="size-4 text-primary" />
                    关键思路
                  </h4>
                  <div className="space-y-2.5">
                    {selectedBox.proof.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="shrink-0 size-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1 formula-scroll text-sm text-foreground/90">
                          <MathRenderer expression={step} displayMode={false} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 边界说明 */}
                {selectedBox.boundary && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 rounded-xl p-3">
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      ⚠️ <span className="font-semibold">注意：</span>
                      {selectedBox.boundary}
                    </p>
                  </div>
                )}

                {/* 相关章节 */}
                <button
                  onClick={() => {
                    setSelectedBox(null);
                    navigate(selectedBox.chapterPath);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-accent/30 transition-all group"
                >
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">相关章节</div>
                    <div className="text-sm font-medium text-foreground">
                      去学 {selectedBox.chapter}
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
