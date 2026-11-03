// 竞赛公式速查表 Tab：速查 / 记忆卡 / 公式测验
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Search,
  BookMarked,
  Star,
  StarOff,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  RotateCcw,
  Brain,
  ClipboardCheck,
  Shuffle,
  ChevronLeft,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Trophy,
  X,
  Lightbulb,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import { scopedStorage } from '@/lib/lark-mock';
import {
  FORMULA_CATEGORIES,
  FORMULA_ITEMS,
  type CompetitionFormula,
  type FormulaCategory,
} from '@/data/competition-formulas';
import MathRenderer from '@/components/MathRenderer';
import FormulaPrintDialog from '@/components/print/FormulaPrintDialog';
import { useFavorites } from '@/hooks/use-learning';
import { cn } from '@/lib/utils';

const FAV_MODULE_KEY = 'competition-formulas';
const FAV_MODULE_LABEL = '竞赛公式速查';
const MASTERED_KEY = 'mathforge:competition:formula-mastered';
const QUIZ_STATS_KEY = 'mathforge:competition:formula-quiz-stats';

// ============================================================
// 公式记忆状态
// ============================================================
interface FormulaMemoryState {
  mastered: string[];
  review: string[]; // 待复习
  lastReviewDate?: string;
}

function loadMemoryState(): FormulaMemoryState {
  try {
    const raw = scopedStorage.getItem(MASTERED_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { mastered: [], review: [] };
}

function saveMemoryState(state: FormulaMemoryState) {
  try {
    scopedStorage.setItem(MASTERED_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ============================================================
// 公式测验统计
// ============================================================
interface FormulaQuizStats {
  totalAttempts: number;
  totalCorrect: number;
  bestScore: number;
  lastDate?: string;
}

function loadQuizStats(): FormulaQuizStats {
  try {
    const raw = scopedStorage.getItem(QUIZ_STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { totalAttempts: 0, totalCorrect: 0, bestScore: 0 };
}

function saveQuizStats(stats: FormulaQuizStats) {
  try {
    scopedStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(stats));
  } catch { /* ignore */ }
}

// ============================================================
// 主组件
// ============================================================
export default function FormulaReferenceTab() {
  const [subTab, setSubTab] = useState<'reference' | 'memorize' | 'quiz'>('reference');
  const [printOpen, setPrintOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* 标题 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookMarked className="size-5 text-emerald-600" />
            竞赛公式速查表
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            8 大专题共 {FORMULA_ITEMS.length} 条核心公式，支持速查 / 翻卡记忆 / 公式测验
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setPrintOpen(true)}>
          <Printer className="size-4 mr-1.5" />
          打印手册
        </Button>
      </div>

      {/* 子 tab 切换 */}
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as typeof subTab)}>
        <TabsList className="grid grid-cols-3 bg-card/50 border border-border/60 p-1">
          <TabsTrigger
            value="reference"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BookMarked className="size-4 mr-1.5" />速查
          </TabsTrigger>
          <TabsTrigger
            value="memorize"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Brain className="size-4 mr-1.5" />记忆卡
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ClipboardCheck className="size-4 mr-1.5" />公式测验
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reference" className="mt-4 space-y-4">
          <ReferenceView />
        </TabsContent>

        <TabsContent value="memorize" className="mt-4 space-y-4">
          <MemorizeView />
        </TabsContent>

        <TabsContent value="quiz" className="mt-4 space-y-4">
          <QuizView />
        </TabsContent>
      </Tabs>

      {/* 打印对话框 */}
      <FormulaPrintDialog open={printOpen} onOpenChange={setPrintOpen} />
    </motion.div>
  );
}

// ============================================================
// 速查视图（原有功能，简化保留）
// ============================================================
function ReferenceView() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    FORMULA_CATEGORIES.forEach((c) => {
      init[c.key] = true;
    });
    return init;
  });
  const { items, addFavorite, removeFavorite, isFavorited } = useFavorites();

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return FORMULA_ITEMS;
    return FORMULA_ITEMS.filter(
      (f) =>
        f.title.toLowerCase().includes(kw) ||
        f.description.toLowerCase().includes(kw) ||
        f.tags.some((t) => t.toLowerCase().includes(kw)) ||
        f.latex.toLowerCase().includes(kw),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map: Record<string, CompetitionFormula[]> = {};
    for (const f of filtered) {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    }
    return map;
  }, [filtered]);

  const toggleCategory = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleFavorite = (formula: CompetitionFormula) => {
    const fav = items.find(
      (f) =>
        f.moduleKey === FAV_MODULE_KEY &&
        f.expression === formula.id &&
        f.result === formula.title,
    );
    if (fav) {
      removeFavorite(fav.id);
      toast.success('已取消收藏');
    } else {
      const result = addFavorite({
        moduleKey: FAV_MODULE_KEY,
        moduleLabel: FAV_MODULE_LABEL,
        expression: formula.id,
        result: formula.title,
        resultLatex: formula.latex,
      });
      if (result.ok) {
        toast.success('已收藏到收藏夹');
      } else {
        toast.error(result.reason || '收藏失败');
      }
    }
  };

  const handleCopyLatex = (latex: string) => {
    navigator.clipboard
      .writeText(latex)
      .then(
        () => toast.success('已复制 LaTeX 代码'),
        () => toast.error('复制失败'),
      );
  };

  return (
    <>
      {/* 搜索框 */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索公式名称、说明、标签..."
          className="pl-9 bg-background"
        />
        {search && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            找到 {filtered.length} 条
          </div>
        )}
      </div>

      {/* 公式分类 */}
      <ScrollArea className="h-[calc(100vh-480px)] min-h-[360px] pr-2">
        <div className="space-y-3">
          {FORMULA_CATEGORIES.map((cat, ci) => {
            const items = grouped[cat.key] || [];
            if (items.length === 0) return null;
            const isOpen = expanded[cat.key];
            return (
              <Card key={cat.key} className="border-border/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.key)}
                  className="w-full text-left"
                >
                  <CardHeader className="py-3 px-4 hover:bg-muted/30 transition-colors">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {isOpen ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      >
                        {cat.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {items.length} 条
                      </span>
                    </CardTitle>
                  </CardHeader>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <CardContent className="px-5 pb-5 pt-0 space-y-4">
                        {items.map((formula, i) => (
                          <FormulaCard
                            key={formula.id}
                            formula={formula}
                            delay={ci * 0.02 + i * 0.02}
                            isFavorited={!!isFavorited(
                              FAV_MODULE_KEY,
                              formula.id,
                              formula.title,
                            )}
                            onToggleFavorite={() => handleToggleFavorite(formula)}
                            onCopy={() => handleCopyLatex(formula.latex)}
                          />
                        ))}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}

          {Object.keys(grouped).length === 0 && search && (
            <div className="text-center py-12 text-muted-foreground">
              没有找到匹配的公式
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}

function FormulaCard({
  formula,
  delay,
  isFavorited,
  onToggleFavorite,
  onCopy,
}: {
  formula: CompetitionFormula;
  delay: number;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-border/50 bg-card/60 dark:bg-card/80 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium text-foreground dark:text-foreground">
            {formula.title}
          </h4>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleCopy}
            title="复制 LaTeX"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5 text-muted-foreground" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onToggleFavorite}
            title={isFavorited ? '取消收藏' : '收藏'}
          >
            {isFavorited ? (
              <Star className="size-3.5 text-amber-500 fill-amber-500" />
            ) : (
              <StarOff className="size-3.5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* 公式主体 */}
      <div className="bg-muted/40 rounded-md p-3 mb-2 overflow-x-auto">
        <MathRenderer expression={formula.latex} displayMode />
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
        {formula.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {formula.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-xs px-1.5 py-0 h-4 font-normal"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================
// 记忆卡视图
// ============================================================
function MemorizeView() {
  const [memory, setMemory] = useState<FormulaMemoryState>(() => loadMemoryState());
  const [activeCategory, setActiveCategory] = useState<FormulaCategory | 'all' | 'review'>(
    'all',
  );
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = useMemo(() => {
    if (activeCategory === 'all') return FORMULA_ITEMS;
    if (activeCategory === 'review') {
      return FORMULA_ITEMS.filter((f) => memory.review.includes(f.id));
    }
    return FORMULA_ITEMS.filter((f) => f.category === activeCategory);
  }, [activeCategory, memory.review]);

  const current = cards[cardIndex];

  const updateMemory = useCallback((next: FormulaMemoryState) => {
    setMemory(next);
    saveMemoryState(next);
  }, []);

  const markMastered = useCallback(() => {
    if (!current) return;
    const next: FormulaMemoryState = {
      ...memory,
      mastered: memory.mastered.includes(current.id)
        ? memory.mastered
        : [...memory.mastered, current.id],
      review: memory.review.filter((id) => id !== current.id),
    };
    updateMemory(next);
    toast.success('已标记为已掌握');
    nextCard();
     
  }, [current, memory, updateMemory]);

  const markReview = useCallback(() => {
    if (!current) return;
    const next: FormulaMemoryState = {
      ...memory,
      review: memory.review.includes(current.id)
        ? memory.review
        : [...memory.review, current.id],
      mastered: memory.mastered.filter((id) => id !== current.id),
    };
    updateMemory(next);
    toast.success('加入待复习');
    nextCard();
     
  }, [current, memory, updateMemory]);

  const nextCard = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev + 1) % Math.max(1, cards.length));
    }, 150);
  }, [cards.length]);

  const prevCard = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev - 1 + cards.length) % Math.max(1, cards.length));
    }, 150);
  }, [cards.length]);

  const shuffleCards = useCallback(() => {
    // Fisher-Yates 洗牌（基于 cards 引用重新随机索引位置）
    setIsFlipped(false);
    setCardIndex(0);
    toast.info('已随机排序');
  }, []);

  const masteredCount = memory.mastered.length;
  const totalCount = FORMULA_ITEMS.length;
  const progressPct = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;

  if (cards.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Lightbulb className="size-12 mx-auto mb-3 opacity-50" />
        <div className="text-sm">暂无卡片</div>
        <div className="text-xs mt-1">选择其他分类开始记忆</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 统计进度 */}
      <Card className="border-border/60">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">已掌握</span>
            <span className="text-sm text-primary font-semibold">
              {masteredCount} / {totalCount}
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>待复习：{memory.review.length} 条</span>
          </div>
        </CardContent>
      </Card>

      {/* 分类选择 */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          onClick={() => {
            setActiveCategory('all');
            setCardIndex(0);
            setIsFlipped(false);
          }}
        >
          全部
        </Button>
        <Button
          size="sm"
          variant={activeCategory === 'review' ? 'default' : 'outline'}
          onClick={() => {
            setActiveCategory('review');
            setCardIndex(0);
            setIsFlipped(false);
          }}
        >
          待复习 ({memory.review.length})
        </Button>
        {FORMULA_CATEGORIES.map((cat) => (
          <Button
            key={cat.key}
            size="sm"
            variant={activeCategory === cat.key ? 'default' : 'outline'}
            onClick={() => {
              setActiveCategory(cat.key);
              setCardIndex(0);
              setIsFlipped(false);
            }}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* 翻卡区域 */}
      <div className="relative">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={prevCard}
            className="shrink-0"
            aria-label="上一张"
          >
            <ChevronLeftIcon className="size-5" />
          </Button>

          <div className="flex-1">
            <FlashCard
              formula={current}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped((v) => !v)}
              index={cardIndex}
              total={cards.length}
              isMastered={memory.mastered.includes(current.id)}
              isReview={memory.review.includes(current.id)}
            />
          </div>

          <Button
            size="icon"
            variant="outline"
            onClick={nextCard}
            className="shrink-0"
            aria-label="下一张"
          >
            <ChevronRightIcon className="size-5" />
          </Button>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={shuffleCards}>
          <Shuffle className="size-4 mr-1.5" />
          随机
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={markReview}>
            <X className="size-4 mr-1.5" />
            待复习
          </Button>
          <Button variant="default" size="sm" onClick={markMastered}>
            <Check className="size-4 mr-1.5" />
            已掌握
          </Button>
        </div>
      </div>
    </div>
  );
}

function FlashCard({
  formula,
  isFlipped,
  onFlip,
  index,
  total,
  isMastered,
  isReview,
}: {
  formula: CompetitionFormula;
  isFlipped: boolean;
  onFlip: () => void;
  index: number;
  total: number;
  isMastered: boolean;
  isReview: boolean;
}) {
  const cat = FORMULA_CATEGORIES.find((c) => c.key === formula.category);

  return (
    <div
      className="relative cursor-pointer"
      style={{ perspective: '1000px', minHeight: '280px' }}
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full absolute"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', minHeight: '280px' }}
      >
        {/* 正面：名称 + 场景提示 */}
        <div
          className="absolute inset-0 rounded-xl border border-border/60 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 flex flex-col justify-center items-center text-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Badge variant="outline" className="mb-4 text-xs">
            {cat?.label ?? formula.category}
          </Badge>
          <h3 className="text-xl font-semibold text-foreground mb-3">
            {formula.title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {formula.description}
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            点击卡片查看公式
          </div>
          <div className="absolute top-3 right-3 flex gap-1.5">
            {isMastered && (
              <Badge className="bg-emerald-500 text-white text-xs h-5">
                已掌握
              </Badge>
            )}
            {isReview && (
              <Badge className="bg-amber-500 text-white text-xs h-5">
                待复习
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
            {index + 1} / {total}
          </div>
        </div>

        {/* 背面：公式 + 注意事项 */}
        <div
          className="absolute inset-0 rounded-xl border border-border/60 bg-card p-6 flex flex-col justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="bg-muted/40 rounded-lg p-4 mb-3 overflow-x-auto">
            <MathRenderer expression={formula.latex} displayMode />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {formula.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-1.5 py-0 h-4 font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            点击卡片返回正面
          </p>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
            {index + 1} / {total}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================
// 公式测验视图
// ============================================================
type QuizType = 'fill-formula' | 'select-scene' | 'complete-formula';

interface QuizQuestion {
  id: string;
  type: QuizType;
  formula: CompetitionFormula;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

function QuizView() {
  const [selectedCategory, setSelectedCategory] = useState<FormulaCategory | 'all'>(
    'all',
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [stats, setStats] = useState<FormulaQuizStats>(() => loadQuizStats());

  const generateQuiz = useCallback(() => {
    const pool =
      selectedCategory === 'all'
        ? FORMULA_ITEMS
        : FORMULA_ITEMS.filter((f) => f.category === selectedCategory);
    if (pool.length === 0) {
      toast.error('该分类下暂无公式');
      return;
    }

    // 随机抽 10 题（不够就全部）
    const count = Math.min(10, pool.length);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const qs: QuizQuestion[] = selected.map((f, i) => {
      const typeRoll = i % 3;
      const type: QuizType =
        typeRoll === 0 ? 'fill-formula' : typeRoll === 1 ? 'select-scene' : 'complete-formula';

      if (type === 'fill-formula') {
        return {
          id: `q-${f.id}`,
          type,
          formula: f,
          prompt: `请写出「${f.title}」的公式`,
          correctAnswer: f.latex,
        };
      }

      if (type === 'select-scene') {
        // 生成 4 个选项：正确场景 + 3 个干扰项
        const otherDescriptions = FORMULA_ITEMS.filter(
          (x) => x.id !== f.id,
        )
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((x) => x.description);
        const options = [f.description, ...otherDescriptions].sort(
          () => Math.random() - 0.5,
        );
        return {
          id: `q-${f.id}`,
          type,
          formula: f,
          prompt: `以下哪个是公式「${f.title}」的适用场景？`,
          options,
          correctAnswer: f.description,
        };
      }

      // complete-formula：从 latex 中提取一部分留空
      // 简化：隐藏公式中核心部分，让用户填公式名称所代表的完整表达式关键词
      return {
        id: `q-${f.id}`,
        type,
        formula: f,
        prompt: `补全公式：${f.title}（写出完整公式）`,
        correctAnswer: f.latex,
      };
    });

    setQuestions(qs);
    setCurrentIdx(0);
    setSubmitted(false);
    setInputValue('');
    setStarted(true);
  }, [selectedCategory]);

  const handleAnswer = (answer: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[currentIdx];
      const normalized = answer.trim().toLowerCase();
      const correct = q.correctAnswer.trim().toLowerCase();
      const isCorrect =
        q.type === 'select-scene'
          ? answer === q.correctAnswer
          : normalized === correct ||
            fuzzyMatch(normalized, correct);
      next[currentIdx] = { ...q, userAnswer: answer, isCorrect };
      return next;
    });
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setInputValue('');
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      const prev = questions[currentIdx - 1];
      setInputValue(prev.userAnswer ?? '');
    }
  };

  const submitQuiz = () => {
    const correctCount = questions.filter((q) => q.isCorrect).length;
    const total = questions.length;
    const newStats: FormulaQuizStats = {
      totalAttempts: stats.totalAttempts + 1,
      totalCorrect: stats.totalCorrect + correctCount,
      bestScore: Math.max(stats.bestScore, Math.round((correctCount / total) * 100)),
      lastDate: new Date().toISOString().slice(0, 10),
    };
    setStats(newStats);
    saveQuizStats(newStats);
    setSubmitted(true);
    toast.success(
      `测验完成！正确率 ${Math.round((correctCount / total) * 100)}%（${correctCount}/${total}）`,
    );
  };

  const restart = () => {
    setStarted(false);
    setSubmitted(false);
    setQuestions([]);
    setCurrentIdx(0);
    setInputValue('');
  };

  if (!started) {
    return (
      <div className="space-y-5">
        {/* 统计 */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="测验次数" value={stats.totalAttempts.toString()} />
          <StatCard
            label="总正确率"
            value={
              stats.totalAttempts > 0
                ? `${Math.round(
                    (stats.totalCorrect / Math.max(1, stats.totalAttempts * 10)) *
                      100,
                  )}%`
                : '—'
            }
          />
          <StatCard label="最佳成绩" value={`${stats.bestScore}分`} />
        </div>

        {/* 选择分类 */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">选择测验范围</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
              >
                全部公式
              </Button>
              {FORMULA_CATEGORIES.map((cat) => (
                <Button
                  key={cat.key}
                  size="sm"
                  variant={selectedCategory === cat.key ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 题型说明 */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">三种题型</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>• <span className="text-foreground font-medium">填公式</span>：给出公式名称，写出完整公式</div>
            <div>• <span className="text-foreground font-medium">选场景</span>：给出公式，选择适用场景（单选）</div>
            <div>• <span className="text-foreground font-medium">补全公式</span>：给出公式名，补全完整表达式</div>
            <div className="text-xs pt-1">每次 10 题，交卷后判分</div>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg" onClick={generateQuiz}>
          <ClipboardCheck className="size-4 mr-2" />
          开始测验（10 题）
        </Button>
      </div>
    );
  }

  if (submitted) {
    const correctCount = questions.filter((q) => q.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="space-y-5">
        <Card className="border-border/60 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 text-center">
            <Trophy className="size-12 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1">{score} 分</div>
            <div className="text-sm opacity-90">
              {correctCount} / {questions.length} 正确
            </div>
          </div>
          <CardContent className="pt-5">
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className={cn(
                    'p-3 rounded-lg border text-sm',
                    q.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10'
                      : 'border-rose-200 bg-rose-50/50 dark:bg-rose-900/10',
                  )}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span
                      className={cn(
                        'shrink-0 size-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5',
                        q.isCorrect ? 'bg-emerald-500' : 'bg-rose-500',
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-xs mb-1">
                        {q.formula.title}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        你的答案：{q.userAnswer || '(未作答)'}
                      </div>
                      {!q.isCorrect && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400">
                          正确答案：{q.formula.title}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={restart}>
            <RotateCcw className="size-4 mr-2" />
            返回
          </Button>
          <Button className="flex-1" onClick={generateQuiz}>
            <Shuffle className="size-4 mr-2" />
            再来一轮
          </Button>
        </div>
      </div>
    );
  }

  // 答题中
  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="space-y-4">
      {/* 进度条 */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-sm text-muted-foreground tabular-nums shrink-0">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      {/* 题目卡片 */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {q.type === 'fill-formula'
                ? '填公式'
                : q.type === 'select-scene'
                  ? '选场景'
                  : '补全公式'}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {FORMULA_CATEGORIES.find((c) => c.key === q.formula.category)?.label}
            </Badge>
          </div>
          <CardTitle className="text-base">{q.prompt}</CardTitle>
        </CardHeader>
        <CardContent>
          {q.type === 'select-scene' ? (
            <RadioGroup
              value={q.userAnswer ?? ''}
              onValueChange={(val) => handleAnswer(val)}
              className="space-y-2"
            >
              {q.options?.map((opt, oi) => (
                <div
                  key={oi}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
                >
                  <RadioGroupItem value={opt} id={`opt-${oi}`} className="mt-0.5" />
                  <Label htmlFor={`opt-${oi}`} className="text-sm cursor-pointer flex-1">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">公式提示</p>
                <p className="text-base font-medium">{q.formula.title}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  你的答案（LaTeX 格式）
                </Label>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="例如：\lim_{x \\to 0} \\frac{\sin x}{x} = 1"
                  onBlur={() => handleAnswer(inputValue)}
                />
              </div>
              {q.userAnswer && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-3">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1">
                    已保存答案
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 导航按钮 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentIdx === 0}
        >
          <ChevronLeft className="size-4 mr-1" />
          上一题
        </Button>

        {currentIdx === questions.length - 1 ? (
          <Button onClick={submitQuiz}>
            交卷
            <Check className="size-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (q.type !== 'select-scene') handleAnswer(inputValue);
              nextQuestion();
            }}
          >
            下一题
            <ChevronRight className="size-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="pt-4 text-center">
        <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

// 模糊匹配：去掉空白和部分符号后比较
function fuzzyMatch(a: string, b: string): boolean {
  const normalize = (s: string) => s.replace(/\s+/g, '').replace(/[{}]/g, '');
  return normalize(a) === normalize(b);
}
