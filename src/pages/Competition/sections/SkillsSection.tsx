// EXPORTS: SkillsTab, SkillDetailPage, MustMemoTab
// 竞赛知识卡片库 + 必背结论速记 + 三态掌握自评系统

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Lightbulb, Target, AlertTriangle, BookOpen, ChevronRight,
  Search, CheckCircle2, Circle, Filter, Sparkles, Zap, BrainCircuit,
  ThumbsUp, HelpCircle, XCircle, Eye, AlertCircle, Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import MathRenderer from '@/components/MathRenderer';
import RichTextRenderer from '@/components/RichTextRenderer';
import {
  KNOWLEDGE_CARDS,
  MUST_MEMO_ITEMS,
  type KnowledgeCard,
  type CardMasteryLevel,
  type MasteryMap,
  setCardMastery,
  migrateMasteredToMastery,
} from '@/data/competition-knowledge';

// ============================================================
// 常量
// ============================================================

const CATEGORIES = [
  '全部',
  '极限',
  '一元微分',
  '一元积分',
  '多元微分',
  '多元积分',
  '级数',
  'ODE',
  '解析几何',
  '跨专题方法',
];

const MASTERY_META: Record<CardMasteryLevel, { label: string; color: string; bg: string; border: string; dot: string }> = {
  proficient: {
    label: '熟练',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-300/60 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
  },
  half: {
    label: '半生',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-300/60 dark:border-amber-800/50',
    dot: 'bg-amber-500',
  },
  'not-yet': {
    label: '不会',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-300/60 dark:border-rose-800/50',
    dot: 'bg-rose-500',
  },
};

// ============================================================
// 知识卡片库 Tab
// ============================================================
interface SkillsTabProps {
  masteredIds: string[];
  onToggleMaster: (id: string) => void;
  masteryMap: MasteryMap;
  onMasteryChange: (map: MasteryMap) => void;
  onGoHotPoints?: () => void;
}

export function SkillsTab({ masteredIds, onToggleMaster, masteryMap, onMasteryChange, onGoHotPoints }: SkillsTabProps) {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('全部');
  const [masteryFilter, setMasteryFilter] = useState<'all' | 'not-yet' | 'half' | 'proficient' | 'unmarked'>('all');
  const [selectedCard, setSelectedCard] = useState<KnowledgeCard | null>(null);

  // 进入时迁移旧数据
  useEffect(() => {
    const map = migrateMasteredToMastery();
    if (Object.keys(map).length !== Object.keys(masteryMap).length) {
      onMasteryChange(map);
    }
     
  }, []);

  const filtered = useMemo(() => {
    return KNOWLEDGE_CARDS.filter((c) => {
      if (category !== '全部' && c.category !== category) return false;
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase();
        return (
          c.title.toLowerCase().includes(k) ||
          c.core.toLowerCase().includes(k) ||
          c.scenario.toLowerCase().includes(k) ||
          c.pitfalls.toLowerCase().includes(k)
        );
      }
      if (masteryFilter === 'all') return true;
      const m = masteryMap[c.id]?.level;
      if (masteryFilter === 'unmarked') return !m;
      return m === masteryFilter;
    });
  }, [keyword, category, masteryFilter, masteryMap]);

  // 掌握度统计
  const masteryStats = useMemo(() => {
    let proficient = 0;
    let half = 0;
    let notYet = 0;
    let unmarked = 0;
    for (const c of KNOWLEDGE_CARDS) {
      const m = masteryMap[c.id]?.level;
      if (m === 'proficient') proficient++;
      else if (m === 'half') half++;
      else if (m === 'not-yet') notYet++;
      else unmarked++;
    }
    const total = KNOWLEDGE_CARDS.length;
    const marked = total - unmarked;
    return { total, proficient, half, notYet, unmarked, marked, markedPct: (marked / total) * 100 };
  }, [masteryMap]);

  // 按类别分组的掌握度（用于仪表盘）
  const categoryStats = useMemo(() => {
    const cats = CATEGORIES.filter((c) => c !== '全部');
    return cats
      .map((cat) => {
        const cards = KNOWLEDGE_CARDS.filter((c) => c.category === cat);
        let proficient = 0;
        let half = 0;
        let notYet = 0;
        for (const c of cards) {
          const m = masteryMap[c.id]?.level;
          if (m === 'proficient') proficient++;
          else if (m === 'half') half++;
          else if (m === 'not-yet') notYet++;
        }
        return {
          category: cat,
          total: cards.length,
          proficient,
          half,
          notYet,
          unmarked: cards.length - proficient - half - notYet,
        };
      })
      .sort((a, b) => b.notYet - a.notYet); // 按不会数量降序
  }, [masteryMap]);

  const weakestCategory = categoryStats[0];

  const handleSetMastery = useCallback((id: string, level: CardMasteryLevel | null) => {
    const newMap = setCardMastery(id, level);
    onMasteryChange(newMap);
    const label = level ? MASTERY_META[level].label : '已清除标记';
    toast.success(level ? `已标记为「${label}」` : label);
  }, [onMasteryChange]);

  if (selectedCard) {
    const m = masteryMap[selectedCard.id]?.level;
    return (
      <KnowledgeCardDetail
        card={selectedCard}
        mastered={masteredIds.includes(selectedCard.id)}
        mastery={m ?? null}
        onBack={() => setSelectedCard(null)}
        onToggleMaster={() => {
          onToggleMaster(selectedCard.id);
          toast.success(masteredIds.includes(selectedCard.id) ? '已取消掌握标记' : '已标记为掌握');
        }}
        onSetMastery={(level) => handleSetMastery(selectedCard.id, level)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* 标题 + 总览 */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BrainCircuit className="size-5 text-primary" />
            竞赛知识卡片库
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {masteryStats.total} 张结构化知识卡片，按专题分类，覆盖公式、方法、例题与易错点
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            已标 {masteryStats.marked} / {masteryStats.total}
          </Badge>
          <div className="text-xs text-muted-foreground">
            熟练度 {Math.round((masteryStats.proficient / masteryStats.total) * 100)}%
          </div>
        </div>
      </div>

      {/* 掌握度仪表盘 */}
      <Card className="border-border/60 bg-gradient-to-br from-primary/5 via-background to-accent/30">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Target className="size-4 text-primary" />
              掌握度仪表盘
            </h3>
            {weakestCategory && weakestCategory.notYet > 0 && (
              <Badge variant="outline" className="text-xs text-rose-600 border-rose-300 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50">
                <AlertCircle className="size-3 mr-1" />
                最薄弱：{weakestCategory.category}（{weakestCategory.notYet} 题不会）
              </Badge>
            )}
          </div>

          {/* 总进度 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">总进度</span>
              <span className="tabular-nums text-foreground">
                {masteryStats.marked} / {masteryStats.total}
                <span className="text-muted-foreground ml-1">
                  ({Math.round(masteryStats.markedPct)}%)
                </span>
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${(masteryStats.proficient / masteryStats.total) * 100}%` }}
              />
              <div
                className="h-full bg-amber-500"
                style={{ width: `${(masteryStats.half / masteryStats.total) * 100}%` }}
              />
              <div
                className="h-full bg-rose-500"
                style={{ width: `${(masteryStats.notYet / masteryStats.total) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" />熟练 {masteryStats.proficient}</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" />半生 {masteryStats.half}</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-rose-500" />不会 {masteryStats.notYet}</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-muted-foreground/30" />未标 {masteryStats.unmarked}</span>
            </div>
          </div>

          {/* 各分类进度 */}
          <div className="space-y-2">
            {categoryStats.map((cs) => (
              <div key={cs.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={cn(
                    'font-medium',
                    cs.notYet === weakestCategory?.notYet && cs.notYet > 0 && 'text-rose-600 dark:text-rose-400'
                  )}>
                    {cs.category}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {cs.proficient + cs.half + cs.notYet}/{cs.total}
                    {cs.notYet > 0 && (
                      <span className="text-rose-500 ml-1.5">· {cs.notYet} 不会</span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(cs.proficient / cs.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${(cs.half / cs.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${(cs.notYet / cs.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 搜索 + 筛选 */}
      <Card className="border-border/60">
        <CardContent className="p-4 space-y-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索知识点、公式、方法..."
              className="pl-9"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="size-4 text-muted-foreground shrink-0" />
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={category === cat ? 'default' : 'outline'}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'h-7 px-2.5 text-xs',
                    category === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Eye className="size-4 text-muted-foreground shrink-0" />
              {[
                { value: 'all', label: '全部' },
                { value: 'not-yet', label: '只看不会' },
                { value: 'half', label: '只看半生' },
                { value: 'proficient', label: '只看熟练' },
                { value: 'unmarked', label: '未标记' },
              ].map((f) => (
                <Button
                  key={f.value}
                  size="sm"
                  variant={masteryFilter === f.value ? 'default' : 'outline'}
                  onClick={() => setMasteryFilter(f.value as typeof masteryFilter)}
                  className={cn(
                    'h-7 px-2.5 text-xs',
                    masteryFilter === f.value
                      ? f.value === 'not-yet' ? 'bg-rose-500 text-white'
                      : f.value === 'half' ? 'bg-amber-500 text-white'
                      : f.value === 'proficient' ? 'bg-emerald-500 text-white'
                      : 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f.label}
                </Button>
              ))}
              {onGoHotPoints && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onGoHotPoints}
                  className="h-7 px-2.5 text-xs ml-auto text-orange-600 dark:text-orange-300 border-orange-300 dark:border-orange-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <Flame className="size-3.5 mr-1" />
                  考点热力榜
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 卡片列表 */}
      {filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-10 text-center">
            <Lightbulb className="size-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">没有找到匹配的知识卡片</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((card, i) => {
            const m = masteryMap[card.id]?.level;
            const meta = m ? MASTERY_META[m] : null;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.3) }}
              >
                <Card
                  className={cn(
                    'border-border/60 h-full cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm relative',
                    meta && meta.border,
                    meta && meta.bg
                  )}
                  onClick={() => setSelectedCard(card)}
                >
                  {/* 掌握度角标 */}
                  {meta && (
                    <div
                      className={cn(
                        'absolute top-3 right-3 size-2 rounded-full',
                        meta.dot
                      )}
                      title={meta.label}
                    />
                  )}
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMaster(card.id);
                        }}
                        className="shrink-0 mt-0.5 text-emerald-500 hover:text-emerald-600 transition-colors"
                        aria-label={masteredIds.includes(card.id) ? '取消掌握' : '标记掌握'}
                      >
                        {masteredIds.includes(card.id) ? (
                          <CheckCircle2 className="size-5 fill-emerald-100" />
                        ) : (
                          <Circle className="size-5 text-muted-foreground/50" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 pr-4">
                          <h3 className="text-sm font-semibold text-foreground truncate flex-1">
                            {card.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className="shrink-0 text-xs h-5 px-1.5 text-muted-foreground"
                          >
                            {card.category.replace('专题', '')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {card.scenario}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="size-3" />
                        <span>{card.examples.length} 道例题</span>
                        {m && (
                          <span className={cn('ml-2 flex items-center gap-1', meta?.color)}>
                            <span className={cn('size-1.5 rounded-full', meta?.dot)} />
                            {meta?.label}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/60" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// 知识卡片详情页
// ============================================================
interface KnowledgeCardDetailProps {
  card: KnowledgeCard;
  mastered: boolean;
  mastery: CardMasteryLevel | null;
  onBack: () => void;
  onToggleMaster: () => void;
  onSetMastery: (level: CardMasteryLevel | null) => void;
}

function KnowledgeCardDetail({ card, mastered, mastery, onBack, onToggleMaster, onSetMastery }: KnowledgeCardDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4 mr-1" />
          返回卡片库
        </Button>
        <Badge variant="outline" className="ml-auto">
          {card.category}
        </Badge>
      </div>

      {/* 标题卡 */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BrainCircuit className="size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground mb-1">{card.title}</h2>
              <p className="text-sm text-muted-foreground">{card.scenario}</p>
            </div>
          </div>

          {/* 三态自评按钮 */}
          <div className="pt-3 border-t border-border/40">
            <div className="text-xs text-muted-foreground mb-2.5">掌握自评</div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={mastery === 'proficient' ? 'default' : 'outline'}
                onClick={() => onSetMastery(mastery === 'proficient' ? null : 'proficient')}
                className={cn(
                  'flex-1 min-w-[88px] h-9',
                  mastery === 'proficient'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                )}
              >
                <ThumbsUp className="size-4 mr-1.5" />
                熟练
              </Button>
              <Button
                size="sm"
                variant={mastery === 'half' ? 'default' : 'outline'}
                onClick={() => onSetMastery(mastery === 'half' ? null : 'half')}
                className={cn(
                  'flex-1 min-w-[88px] h-9',
                  mastery === 'half'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                )}
              >
                <HelpCircle className="size-4 mr-1.5" />
                半生
              </Button>
              <Button
                size="sm"
                variant={mastery === 'not-yet' ? 'default' : 'outline'}
                onClick={() => onSetMastery(mastery === 'not-yet' ? null : 'not-yet')}
                className={cn(
                  'flex-1 min-w-[88px] h-9',
                  mastery === 'not-yet'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'text-rose-600 dark:text-rose-300 border-rose-300 dark:border-rose-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                )}
              >
                <XCircle className="size-4 mr-1.5" />
                不会
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <span className="text-xs text-muted-foreground">
                {card.examples.length} 道例题 · 易错提醒
              </span>
              <Button
                size="sm"
                variant={mastered ? 'outline' : 'default'}
                onClick={onToggleMaster}
                className={cn(mastered && 'text-emerald-600 border-emerald-300')}
              >
                {mastered ? (
                  <><CheckCircle2 className="size-4 mr-1" />已掌握</>
                ) : (
                  <><Circle className="size-4 mr-1" />标记掌握</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 核心公式/结论 */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            核心公式 / 结论
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground leading-relaxed">
          <RichTextRenderer text={card.core} />
        </CardContent>
      </Card>

      {/* 典型例题 */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="size-5 text-sky-600" />
            典型例题
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {card.examples.map((ex, i) => (
            <div key={i} className="space-y-2">
              <div className="p-3 rounded-lg bg-sky-50/60 dark:bg-sky-900/10 border border-sky-200/40">
                <div className="text-xs text-sky-600 dark:text-sky-400 font-semibold mb-1.5">
                  例题 {i + 1}
                </div>
                <div className="text-sm text-foreground">
                  <RichTextRenderer text={ex.problem} />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/40">
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1.5">
                  解析
                </div>
                <div className="text-sm text-foreground leading-relaxed">
                  <RichTextRenderer text={ex.solution} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 易错提醒 */}
      <Card className="border-rose-200/50 bg-rose-50/30 dark:bg-rose-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="size-5" />
            易错提醒
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-rose-800 dark:text-rose-300 leading-relaxed">
          <RichTextRenderer text={card.pitfalls} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// 必背结论速记 Tab
// ============================================================
interface MustMemoTabProps {
  masteredIds: string[];
  onToggleMaster: (id: string) => void;
}

const MEMO_GROUPS = [
  '常用不等式',
  '常用极限',
  '常用展开',
  '积分结论',
  '特殊常数',
  '导数积分速记',
  '级数结论',
];

export function MustMemoTab({ masteredIds, onToggleMaster }: MustMemoTabProps) {
  const [activeGroup, setActiveGroup] = useState(MEMO_GROUPS[0]);
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    return MUST_MEMO_ITEMS.filter((item) => {
      if (item.group !== activeGroup && activeGroup !== '全部') return false;
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase();
        return (
          item.content.toLowerCase().includes(k) ||
          item.formula.toLowerCase().includes(k) ||
          item.hint.toLowerCase().includes(k)
        );
      }
      return true;
    });
  }, [activeGroup, keyword]);

  const stats = useMemo(() => ({
    total: MUST_MEMO_ITEMS.length,
    mastered: MUST_MEMO_ITEMS.filter((i) => masteredIds.includes(i.id)).length,
  }), [masteredIds]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* 标题 */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="size-5 text-amber-500" />
            必背结论速记
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            考前必背 {stats.total} 条核心结论，一句话 + 公式 + 考场提示
          </p>
        </div>
        <Badge variant="secondary" className="text-xs w-fit">
          已记 {stats.mastered} / {stats.total}
        </Badge>
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索结论名称、公式..."
          className="pl-9"
        />
      </div>

      {/* 分组 Tab */}
      <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full">
        <TabsList className="flex-wrap h-auto p-1 gap-1 bg-muted/50">
          {MEMO_GROUPS.map((g) => {
            const count = MUST_MEMO_ITEMS.filter((i) => i.group === g).length;
            return (
              <TabsTrigger
                key={g}
                value={g}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-7 px-2.5 text-xs"
              >
                {g}
                <span className="ml-1 opacity-60 text-xs">({count})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* 结论列表 */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="py-10 text-center">
              <Zap className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">没有找到匹配的结论</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((item, i) => {
            const isMastered = masteredIds.includes(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.2) }}
              >
                <Card
                  className={cn(
                    'border-border/60 transition-all',
                    isMastered && 'border-amber-300/60 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-900/10'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleMaster(item.id)}
                        className="shrink-0 mt-0.5 text-amber-500 hover:text-amber-600 transition-colors"
                        aria-label={isMastered ? '取消记住' : '标记记住'}
                      >
                        {isMastered ? (
                          <CheckCircle2 className="size-5 fill-amber-100" />
                        ) : (
                          <Circle className="size-5 text-muted-foreground/50" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-sm font-semibold text-foreground">
                            {item.content}
                          </h3>
                        </div>
                        <div className="text-sm text-foreground font-medium mb-2 overflow-x-auto py-1">
                          <MathRenderer expression={item.formula} displayMode />
                        </div>
                        <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <Lightbulb className="size-3 mt-0.5 shrink-0 text-amber-500" />
                          <span className="leading-relaxed">{item.hint}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

// 兼容旧接口
export function SkillDetailPage() {
  return null;
}
