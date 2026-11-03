import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Shuffle, CheckCircle2, Circle, Target, Lightbulb, AlertTriangle, X, Sparkles } from 'lucide-react';
import { scopedStorage } from '@/lib/lark-mock';
import { TEMPLATE_CATEGORIES, type TemplateCard, type TemplateCategory } from '@/data/competition-templates';
import RichTextRenderer from '@/components/RichTextRenderer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { COMPETITION_TOPICS } from '@/data/competition';

const MASTERED_KEY = 'mathforge_template_mastered';

// ============================================================
// 工具函数
// ============================================================

function topicColor(key: string): string {
  const t = COMPETITION_TOPICS.find((x) => x.key === key);
  const color = t?.color ?? 'emerald';
  const map: Record<string, string> = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    sky: 'text-sky-700 bg-sky-50 border-sky-200',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    violet: 'text-primary bg-primary/10 border-primary/20',
    rose: 'text-rose-700 bg-rose-50 border-rose-200',
    teal: 'text-teal-700 bg-teal-50 border-teal-200',
    indigo: 'text-teal-700 bg-teal-50 border-teal-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
  };
  return map[color] ?? map.emerald;
}

function difficultyLabel(d: 1 | 2 | 3) {
  if (d === 1) return { text: '基础', cls: 'bg-emerald-100 text-emerald-700' };
  if (d === 2) return { text: '进阶', cls: 'bg-amber-100 text-amber-700' };
  return { text: '困难', cls: 'bg-rose-100 text-rose-700' };
}

interface Props {
  /** 薄弱专题 key 列表（按薄弱度排序），用于今日推荐 */
  weakTopicKeys?: string[];
}

export default function TemplateLibraryTab({ weakTopicKeys = [] }: Props) {
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [todayCards, setTodayCards] = useState<TemplateCard[]>([]);
  const [todayKey, setTodayKey] = useState(0);
  const [sprintMode, setSprintMode] = useState(false);
  const [sprintIndex, setSprintIndex] = useState(0);
  const [detailCard, setDetailCard] = useState<TemplateCard | null>(null);

  // 所有卡片（扁平）
  const allCards = useMemo(
    () => TEMPLATE_CATEGORIES.flatMap((c) => c.cards),
    [],
  );

  // 读取掌握进度
  useEffect(() => {
    try {
      const raw = scopedStorage.getItem(MASTERED_KEY);
      if (raw) {
        setMasteredIds(new Set(JSON.parse(raw) as string[]));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveMastered = useCallback((ids: Set<string>) => {
    setMasteredIds(ids);
    scopedStorage.setItem(MASTERED_KEY, JSON.stringify([...ids]));
  }, []);

  const toggleMaster = useCallback(
    (id: string) => {
      const next = new Set(masteredIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveMastered(next);
    },
    [masteredIds, saveMastered],
  );

  const totalCount = allCards.length;
  const masteredCount = masteredIds.size;
  const progressPct = Math.round((masteredCount / totalCount) * 100);

  // 今日套路：薄弱优先 + 随机
  useEffect(() => {
    const pool = [...allCards];
    // 按薄弱度加权：薄弱专题的卡片排前面
    const weakSet = new Set(weakTopicKeys);
    const weakRankMap = new Map<string, number>();
    weakTopicKeys.forEach((k, i) => weakRankMap.set(k, i));

    pool.sort((a, b) => {
      const aWeak = weakSet.has(a.topicKey);
      const bWeak = weakSet.has(b.topicKey);
      if (aWeak && !bWeak) return -1;
      if (!aWeak && bWeak) return 1;
      if (aWeak && bWeak) {
        return (weakRankMap.get(a.topicKey) ?? 0) - (weakRankMap.get(b.topicKey) ?? 0);
      }
      return 0;
    });

    // 从薄弱专题池子里随机 3 张（优先未掌握的）
    const notMastered = pool.filter((c) => !masteredIds.has(c.id));
    const basePool = notMastered.length >= 3 ? notMastered : pool;
    const shuffled = [...basePool].sort(() => Math.random() - 0.5);
    setTodayCards(shuffled.slice(0, 3));
  }, [todayKey, weakTopicKeys, allCards, masteredIds]);

  const refreshToday = () => setTodayKey((k) => k + 1);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const filteredCategories = useMemo(() => {
    if (activeCategory === 'all') return TEMPLATE_CATEGORIES;
    return TEMPLATE_CATEGORIES.filter((c) => c.topicKey === activeCategory);
  }, [activeCategory]);



  // 速刷模式
  const sprintCard = allCards[sprintIndex] ?? null;
  const goSprintPrev = () => setSprintIndex((i) => Math.max(0, i - 1));
  const goSprintNext = () => setSprintIndex((i) => Math.min(allCards.length - 1, i + 1));

  return (
    <div className="space-y-6">
      {/* 顶部概览 + 今日套路 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 border-border/60 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="size-5 text-primary" />
              掌握进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tabular-nums mb-1">
              {masteredCount}
              <span className="text-base font-normal text-muted-foreground"> / {totalCount}</span>
            </div>
            <Progress value={progressPct} className="h-2 mb-3" />
            <div className="text-sm text-muted-foreground">
              已掌握 {progressPct}%，共 8 大专题 {totalCount} 个套路
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="size-5 text-amber-500" />
                今日套路
                {weakTopicKeys.length > 0 && (
                  <Badge variant="outline" className="text-xs ml-1 bg-amber-50 text-amber-700 border-amber-200">
                    薄弱优先
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={refreshToday}>
                <Shuffle className="size-3.5 mr-1" />
                换一批
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayCards.map((card, i) => (
              <TodayCard
                key={card.id + todayKey}
                index={i}
                card={card}
                colorClass={topicColor(card.topicKey)}
                isMastered={masteredIds.has(card.id)}
                onToggleMaster={() => toggleMaster(card.id)}
                onClick={() => setDetailCard(card)}
                difficultyLabel={difficultyLabel(card.difficulty)}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 模式切换：浏览 / 速刷 */}
      <div className="flex items-center justify-between">
        <Tabs
          value={sprintMode ? 'sprint' : 'browse'}
          onValueChange={(v) => {
            setSprintMode(v === 'sprint');
            if (v === 'sprint') {
              // 从第一张未掌握的开始
              const firstNotMastered = allCards.findIndex((c) => !masteredIds.has(c.id));
              setSprintIndex(firstNotMastered >= 0 ? firstNotMastered : 0);
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="browse" className="flex items-center gap-1.5">
              <BookOpen className="size-4" />
              浏览全部
            </TabsTrigger>
            <TabsTrigger value="sprint" className="flex items-center gap-1.5">
              <Zap className="size-4" />
              考前速刷
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 速刷模式 */}
      {sprintMode && sprintCard && (
        <motion.div
          key={sprintIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={topicColor(sprintCard.topicKey)}>
                {TEMPLATE_CATEGORIES.find((c) => c.topicKey === sprintCard.topicKey)?.name}
              </Badge>
              <Badge variant="outline" className={difficultyLabel(sprintCard.difficulty).cls}>
                {difficultyLabel(sprintCard.difficulty).text}
              </Badge>
              <span className="text-sm text-muted-foreground">
                第 {sprintIndex + 1} / {allCards.length} 张
              </span>
            </div>
            <Button
              variant={masteredIds.has(sprintCard.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleMaster(sprintCard.id)}
            >
              {masteredIds.has(sprintCard.id) ? (
                <><CheckCircle2 className="size-4 mr-1.5" />已掌握</>
              ) : (
                <><Circle className="size-4 mr-1.5" />标记掌握</>
              )}
            </Button>
          </div>

          <TemplateCardDetail
            card={sprintCard}
            expanded={expandedIds.has(sprintCard.id)}
            onToggleExpand={() => toggleExpand(sprintCard.id)}
            isMastered={masteredIds.has(sprintCard.id)}
            onToggleMaster={() => toggleMaster(sprintCard.id)}
            colorClass={topicColor(sprintCard.topicKey)}
          />

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goSprintPrev} disabled={sprintIndex === 0}>
              上一张
            </Button>
            <Button onClick={goSprintNext} disabled={sprintIndex === allCards.length - 1}>
              下一张
            </Button>
          </div>

          <Progress
            value={((sprintIndex + 1) / allCards.length) * 100}
            className="h-1"
          />
        </motion.div>
      )}

      {/* 浏览模式 */}
      {!sprintMode && (
        <>
          {/* 专题筛选 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              全部
            </Button>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <Button
                key={cat.topicKey}
                variant={activeCategory === cat.topicKey ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.topicKey)}
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-70">{cat.count}</span>
              </Button>
            ))}
          </div>

          {/* 各专题目录 */}
          <div className="space-y-6">
            {filteredCategories.map((cat) => (
              <CategorySection
                key={cat.topicKey}
                category={cat}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                masteredIds={masteredIds}
                onToggleMaster={toggleMaster}
                topicColorClass={topicColor(cat.topicKey)}
              />
            ))}
          </div>
         </>
       )}
 
       {/* 套路详情弹层 */}
       <TemplateDetailSheet
         card={detailCard}
         open={!!detailCard}
         onOpenChange={(open) => {
           if (!open) setDetailCard(null);
         }}
         isMastered={detailCard ? masteredIds.has(detailCard.id) : false}
         onToggleMaster={() => {
           if (detailCard) toggleMaster(detailCard.id);
         }}
       />
     </div>
   );
 }
 
 // ============================================================
 // 今日套路卡片（紧凑版）
// ============================================================

function TodayCard({
  index,
  card,
  colorClass,
  isMastered,
  onToggleMaster,
  onClick,
  difficultyLabel,
}: {
  index: number;
  card: TemplateCard;
  colorClass: string;
  isMastered: boolean;
  onToggleMaster: () => void;
  onClick: () => void;
  difficultyLabel: { text: string; cls: string };
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:border-border/80 hover:bg-accent/30 transition-colors cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={`size-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm ${colorClass.split(' ').slice(0, 2).join(' ')}`}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-foreground truncate">{card.name}</span>
          <Badge variant="outline" className={`shrink-0 text-xs ${difficultyLabel.cls}`}>
            {difficultyLabel.text}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground truncate">{card.cue}</div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMaster();
        }}
        aria-label={isMastered ? '取消掌握' : '标记掌握'}
      >
        {isMastered ? (
          <CheckCircle2 className="size-4 text-emerald-600" />
        ) : (
          <Circle className="size-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

// ============================================================
// 专题分组
// ============================================================

function CategorySection({
  category,
  expandedIds,
  onToggleExpand,
  masteredIds,
  onToggleMaster,
  topicColorClass,
}: {
  category: TemplateCategory;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  masteredIds: Set<string>;
  onToggleMaster: (id: string) => void;
  topicColorClass: string;
}) {
  const masteredInCat = category.cards.filter((c) => masteredIds.has(c.id)).length;
  const catProgress = Math.round((masteredInCat / category.count) * 100);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`text-sm px-3 py-1 ${topicColorClass}`}>
            {category.name}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {masteredInCat}/{category.count} 已掌握
          </span>
        </div>
        <div className="w-32">
          <Progress value={catProgress} className="h-1.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence initial={false}>
          {category.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
            >
              <TemplateCardDetail
                card={card}
                expanded={expandedIds.has(card.id)}
                onToggleExpand={() => onToggleExpand(card.id)}
                isMastered={masteredIds.has(card.id)}
                onToggleMaster={() => onToggleMaster(card.id)}
                colorClass={topicColorClass}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ============================================================
// 套路详情内容（共享：弹层 + 展开卡片都用）
// ============================================================

function TemplateDetailBody({ card }: { card: TemplateCard }) {
  return (
    <div className="space-y-4">
      {/* 适用场景 */}
      <div className="p-3 rounded-lg bg-accent/40">
        <div className="text-xs font-semibold text-foreground/70 mb-1.5 flex items-center gap-1.5">
          <Target className="size-3.5 text-primary" />
          适用场景
        </div>
        <div className="text-sm text-foreground/90 leading-relaxed">
          <RichTextRenderer text={card.cue} />
        </div>
      </div>

      {/* 核心步骤 */}
      <div>
        <div className="text-xs font-semibold text-foreground/70 mb-2 flex items-center gap-1.5">
          <BookOpen className="size-3.5" />
          核心步骤
        </div>
        <ol className="space-y-2">
          {card.steps.map((step, i) => (
            <li key={i} className="text-sm text-foreground/90 flex gap-2">
              <span className="shrink-0 size-5 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center justify-center">
                {i + 1}
              </span>
              <span className="flex-1 leading-relaxed">
                <RichTextRenderer text={step} />
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* 典型例题 */}
      <div>
        <div className="text-xs font-semibold text-foreground/70 mb-2 flex items-center gap-1.5">
          <Lightbulb className="size-3.5 text-amber-500" />
          典型例题
        </div>
        <div className="p-3 rounded-lg bg-accent/40 space-y-2">
          <div className="text-sm font-medium text-foreground">
            <RichTextRenderer text={card.exampleProblem} />
          </div>
          <div className="text-sm text-foreground/90 space-y-1.5">
            {card.exampleSolution.map((line, i) => (
              <div key={i} className="leading-relaxed">
                <RichTextRenderer text={line} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 易错点 */}
      <div className="p-3 rounded-lg bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30">
        <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1.5">
          <AlertTriangle className="size-3.5" />
          易错点
        </div>
        <div className="text-sm text-rose-800/90 dark:text-rose-200/90 leading-relaxed">
          <RichTextRenderer text={card.pitfall} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 套路详情弹层（Sheet，右侧滑出，手机全宽）
// ============================================================

function TemplateDetailSheet({
  card,
  open,
  onOpenChange,
  isMastered,
  onToggleMaster,
}: {
  card: TemplateCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMastered: boolean;
  onToggleMaster: () => void;
}) {
  if (!card) return null;

  const difficultyLabelText =
    card.difficulty === 1
      ? { text: '基础', cls: 'bg-emerald-100 text-emerald-700' }
      : card.difficulty === 2
        ? { text: '进阶', cls: 'bg-amber-100 text-amber-700' }
        : { text: '困难', cls: 'bg-rose-100 text-rose-700' };
  const topicName =
    TEMPLATE_CATEGORIES.find((c) => c.topicKey === card.topicKey)?.name ?? '';
  const topicColorClass = topicColor(card.topicKey);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant="outline" className={`text-xs ${topicColorClass}`}>
                  {topicName}
                </Badge>
                <Badge variant="outline" className={`text-xs ${difficultyLabelText.cls}`}>
                  {difficultyLabelText.text}
                </Badge>
                {isMastered && (
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="size-3 mr-0.5" />已掌握
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-lg leading-snug">{card.name}</SheetTitle>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="shrink-0 -mt-1 -mr-2">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <TemplateDetailBody card={card} />
        </div>

        <div className="px-5 py-3 border-t border-border/50">
          <Button
            variant={isMastered ? 'default' : 'outline'}
            className="w-full"
            onClick={onToggleMaster}
          >
            {isMastered ? (
              <>
                <CheckCircle2 className="size-4 mr-1.5" />
                已掌握
              </>
            ) : (
              <>
                <Circle className="size-4 mr-1.5" />
                标记掌握
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================
// 套路卡片详情（手风琴式展开，用于浏览列表）
// ============================================================

function TemplateCardDetail({
  card,
  expanded,
  onToggleExpand,
  isMastered,
  onToggleMaster,
  colorClass,
}: {
  card: TemplateCard;
  expanded: boolean;
  onToggleExpand: () => void;
  isMastered: boolean;
  onToggleMaster: () => void;
  colorClass: string;
}) {
  const difficultyLabelText =
    card.difficulty === 1
      ? { text: '基础', cls: 'bg-emerald-100 text-emerald-700' }
      : card.difficulty === 2
        ? { text: '进阶', cls: 'bg-amber-100 text-amber-700' }
        : { text: '困难', cls: 'bg-rose-100 text-rose-700' };

  return (
    <Card className="h-full border-border/50 hover:border-border/80 transition-colors">
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="outline" className={`text-xs ${colorClass}`}>
                {TEMPLATE_CATEGORIES.find((c) => c.topicKey === card.topicKey)?.name}
              </Badge>
              <Badge variant="outline" className={`text-xs ${difficultyLabelText.cls}`}>
                {difficultyLabelText.text}
              </Badge>
              {isMastered && (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="size-3 mr-0.5" />已掌握
                </Badge>
              )}
            </div>
            <CardTitle className="text-base leading-snug">{card.name}</CardTitle>
          </div>
        </div>
        <div className="mt-1.5 flex items-start gap-1.5 text-sm text-foreground/80">
          <Target className="size-4 shrink-0 text-primary mt-0.5" />
          <span className="flex-1">{card.cue}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* 标准步骤 */}
        <div>
          <div className="text-xs font-semibold text-foreground/70 mb-2 flex items-center gap-1.5">
            <BookOpen className="size-3.5" />
            标准步骤
          </div>
          <ol className="space-y-1">
            {card.steps.map((step, i) => (
              <li key={i} className="text-sm text-foreground/90 flex gap-2">
                <span className="shrink-0 size-5 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="flex-1 leading-relaxed">
                  <RichTextRenderer text={step} />
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* 展开：例题 + 易错 */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-1 border-t border-border/40">
                <div>
                  <div className="text-xs font-semibold text-foreground/70 mb-2 flex items-center gap-1.5">
                    <Lightbulb className="size-3.5 text-amber-500" />
                    例题
                  </div>
                  <div className="p-3 rounded-lg bg-accent/40 space-y-2">
                    <div className="text-sm font-medium text-foreground">
                      <RichTextRenderer text={card.exampleProblem} />
                    </div>
                    <div className="text-sm text-foreground/90 space-y-1.5">
                      {card.exampleSolution.map((line, i) => (
                        <div key={i} className="leading-relaxed">
                          <RichTextRenderer text={line} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30">
                  <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5" />
                    易错提醒
                  </div>
                  <div className="text-sm text-rose-800/90 dark:text-rose-200/90 leading-relaxed">
                    <RichTextRenderer text={card.pitfall} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 底部操作 */}
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="text-primary hover:text-primary"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-3.5 mr-1" />
                收起例题
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5 mr-1" />
                看例题
              </>
            )}
          </Button>
          <Button
            variant={isMastered ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleMaster}
          >
            {isMastered ? (
              <>
                <CheckCircle2 className="size-3.5 mr-1" />
                已掌握
              </>
            ) : (
              <>
                <Circle className="size-3.5 mr-1" />
                标记掌握
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 重新导出 Zap（已在 lucide-react 里）
import { Zap } from 'lucide-react';
