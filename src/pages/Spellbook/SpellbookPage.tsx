import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Sigma,
  Orbit,
  EqualNot,
  Star,
  Sparkles,
  Crown,
  X,
  Eye,
  CheckCircle2,
  Lock,
  RefreshCw,
  Clock,
  HelpCircle,
  Award,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import MathRenderer from '@/components/MathRenderer';
import {
  FORMULA_SPELL_CARDS,
  FORMULA_SETS,
  type FormulaSpellCard,
} from '@/data/formula-spells';
import { useSpellbook, matchFormula } from '@/hooks/use-spellbook';
import { cn } from '@/lib/utils';

// 临时积分图标（没有 Integral icon，用 FunctionSquare 代替）
import { FunctionSquare as Integral } from 'lucide-react';

const SET_ICONS: Record<string, typeof TrendingUp> = {
  differential: TrendingUp,
  integral: Integral,
  series: Sigma,
  advanced: Orbit,
  inequality: EqualNot,
};

const SET_COLORS: Record<string, string> = {
  differential: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  integral: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  series: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  advanced: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  inequality: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
};

const SET_GLOW: Record<string, string> = {
  differential: 'shadow-[0_0_20px_rgba(99_102_241_0.4)] border-indigo-400/50',
  integral: 'shadow-[0_0_20px_rgba(16_185_129_0.4)] border-emerald-400/50',
  series: 'shadow-[0_0_20px_rgba(139_92_246_0.4)] border-violet-400/50',
  advanced: 'shadow-[0_0_20px_rgba(245_158_11_0.4)] border-amber-400/50',
  inequality: 'shadow-[0_0_20px_rgba(244_63_94_0.4)] border-rose-400/50',
};

export default function SpellbookPage() {
  const navigate = useNavigate();
  const {
    state,
    sets,
    setProgress,
    unlockedTitles,
    totalProgress,
    markViewed,
    markMastered,
    markFailed,
    isInCooldown,
    getCooldownRemaining,
  } = useSpellbook();

  const [activeSet, setActiveSet] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<FormulaSpellCard | null>(null);
  const [dictateMode, setDictateMode] = useState(false);
  const [dictateInput, setDictateInput] = useState('');
  const [dictateResult, setDictateResult] = useState<null | { passed: boolean; matched: number; total: number }>(null);
  const [justMastered, setJustMastered] = useState(false);

  const filteredCards = useMemo(() => {
    if (activeSet === 'all') return FORMULA_SPELL_CARDS;
    return FORMULA_SPELL_CARDS.filter((c) => c.set === activeSet);
  }, [activeSet]);

  const openCard = (card: FormulaSpellCard) => {
    setSelectedCard(card);
    setDictateMode(false);
    setDictateInput('');
    setDictateResult(null);
    setJustMastered(false);
    markViewed(card.id);
  };

  const startDictate = () => {
    setDictateMode(true);
    setDictateInput('');
    setDictateResult(null);
  };

  const submitDictate = () => {
    if (!selectedCard) return;
    const result = matchFormula(dictateInput, selectedCard);
    setDictateResult(result);

    if (result.passed) {
      markMastered(selectedCard.id);
      setJustMastered(true);
    } else {
      markFailed(selectedCard.id);
    }
  };

  const formatCooldown = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    if (min > 0) return `${min}分${sec}秒`;
    return `${sec}秒`;
  };

  return (
    <div className="min-h-screen">
      {/* 返回条 */}
      <div className="px-4 md:px-6 lg:px-8 py-4 max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回
        </button>
      </div>

      <main className="px-4 md:px-6 lg:px-8 pb-16 max-w-6xl mx-auto space-y-8">
        {/* 顶部标题 + 进度 + 称号 */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
            <Sparkles className="size-4" />
            公式咒语图鉴
          </div>
          <h1 className="page-title">公式咒语</h1>
          <p className="text-sm text-muted-foreground">
            已点亮 {totalProgress.mastered} / {totalProgress.total} 张
          </p>
          <div className="w-full max-w-sm mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress.ratio * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>

          {/* 已解锁称号 */}
          {unlockedTitles.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {unlockedTitles.map((title) => (
                <div
                  key={title}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold',
                    title === '数学大法师'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-card border border-primary/20 text-primary',
                  )}
                >
                  {title === '数学大法师' ? <Crown className="size-3.5" /> : <Award className="size-3.5" />}
                  {title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 套组切换 */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveSet('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              activeSet === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            全部
          </button>
          {sets.map((set) => {
            const Icon = SET_ICONS[set.id] || Star;
            const p = setProgress[set.id];
            const isFull = p && p.mastered >= p.total;
            return (
              <button
                key={set.id}
                onClick={() => setActiveSet(set.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all inline-flex items-center gap-1.5',
                  activeSet === set.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon className="size-3.5" />
                {set.name}
                <span className="opacity-70">
                  {p?.mastered}/{p?.total}
                </span>
                {isFull && <Crown className="size-3 text-amber-400 fill-amber-400" />}
              </button>
            );
          })}
        </div>

        {/* 套组卡片（全部模式下） */}
        {activeSet === 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sets.map((set, i) => {
              const Icon = SET_ICONS[set.id] || Star;
              const p = setProgress[set.id];
              const pct = p.total > 0 ? (p.mastered / p.total) * 100 : 0;
              const isFull = p.mastered >= p.total;
              return (
                <motion.div
                  key={set.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card
                    className={cn(
                      'cursor-pointer hover:shadow-md transition-all overflow-hidden border-2',
                      isFull && SET_GLOW[set.id],
                    )}
                    onClick={() => setActiveSet(set.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn('size-10 rounded-xl flex items-center justify-center border', SET_COLORS[set.id])}>
                          <Icon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground">{set.name}</h3>
                            {isFull && <Crown className="size-3.5 text-amber-500 fill-amber-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {set.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>进度 {p.mastered}/{p.total}</span>
                        {isFull && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <Award className="size-3" />
                            {set.title}
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', {
                            'bg-cyan-500': set.id === 'differential',
                            'bg-emerald-500': set.id === 'integral',
                            'bg-rose-500': set.id === 'series',
                            'bg-amber-500': set.id === 'advanced',
                            'bg-rose-400': set.id === 'inequality',
                          })}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 技能卡网格 */}
        {activeSet !== 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredCards.map((card, i) => {
                const isMastered = state.mastered.includes(card.id);
                const isViewed = state.viewed.includes(card.id);
                const Icon = SET_ICONS[card.set] || Star;
                const cdRemaining = getCooldownRemaining(card.id);
                const onCooldown = isInCooldown(card.id) && !isMastered;

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                  >
                    <button
                      onClick={() => openCard(card)}
                      className={cn(
                        'w-full text-left rounded-xl border-2 transition-all relative overflow-hidden group',
                        isMastered
                          ? cn('bg-card border-primary/40 hover:border-primary/60', SET_GLOW[card.set])
                          : isViewed
                            ? 'bg-card/70 border-border/60 hover:border-border'
                            : 'bg-muted/50 border-border/30 hover:border-border/60',
                      )}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={cn(
                              'size-10 rounded-xl flex items-center justify-center border transition-all',
                              isMastered
                                ? SET_COLORS[card.set]
                                : isViewed
                                  ? 'bg-muted text-muted-foreground border-border/60'
                                  : 'bg-muted/50 text-muted-foreground/50 border-border/30',
                            )}
                          >
                            {isMastered ? (
                              <Icon className="size-5" />
                            ) : isViewed ? (
                              <Eye className="size-4" />
                            ) : (
                              <HelpCircle className="size-4 opacity-50" />
                            )}
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: card.difficulty }).map((_, j) => (
                              <Star
                                key={j}
                                className={cn(
                                  'size-3',
                                  isMastered ? 'fill-amber-400 text-amber-400' : 'text-border',
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        <h3
                          className={cn(
                            'font-bold mb-1',
                            isMastered || isViewed
                              ? 'text-foreground'
                              : 'text-muted-foreground/60',
                          )}
                        >
                          {isMastered || isViewed ? card.name : '??? 未知咒语'}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                          {isMastered || isViewed ? card.mantra : '查看卡牌后解锁咒语描述'}
                        </p>

                        {/* 状态标签 */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {isMastered && (
                              <Badge variant="outline" className="text-xs border-emerald-400/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                                <CheckCircle2 className="size-3 mr-0.5" />
                                已掌握
                              </Badge>
                            )}
                            {!isMastered && isViewed && (
                              <Badge variant="outline" className="text-xs border-amber-400/40 text-amber-600 dark:text-amber-400 bg-amber-500/5">
                                <Eye className="size-3 mr-0.5" />
                                已浏览
                              </Badge>
                            )}
                            {!isMastered && !isViewed && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                <Lock className="size-3 mr-0.5" />
                                未解锁
                              </Badge>
                            )}
                          </div>

                          {onCooldown && (
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatCooldown(cdRemaining)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 装饰：掌握了的卡有发光边 */}
                      {isMastered && (
                        <div
                          className={cn(
                            'absolute inset-0 pointer-events-none opacity-60',
                            card.set === 'differential' && 'bg-cyan-500/5',
                            card.set === 'integral' && 'bg-emerald-500/5',
                            card.set === 'series' && 'bg-rose-500/5',
                            card.set === 'advanced' && 'bg-amber-500/5',
                            card.set === 'inequality' && 'bg-rose-500/5',
                          )}
                        />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* 卡牌详情弹窗 */}
      <Dialog
        open={!!selectedCard}
        onOpenChange={(o) => {
          if (!o) {
            setSelectedCard(null);
            setDictateMode(false);
            setJustMastered(false);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0">
          {selectedCard && (
            <>
              <DialogHeader className="px-5 md:px-6 pt-5 pb-0">
                <div className="flex items-start gap-3">
                  <div className={cn('size-11 rounded-xl flex items-center justify-center border shrink-0', SET_COLORS[selectedCard.set])}>
                    {(() => {
                      const Icon = SET_ICONS[selectedCard.set] || Star;
                      return <Icon className="size-5" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg font-black text-foreground">
                      {selectedCard.name}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {FORMULA_SETS.find((s) => s.id === selectedCard.set)?.name}
                      </Badge>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: selectedCard.difficulty }).map((_, j) => (
                          <Star key={j} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                        {Array.from({ length: 5 - selectedCard.difficulty }).map((_, j) => (
                          <Star key={j} className="size-3 text-border" />
                        ))}
                      </div>
                      {state.mastered.includes(selectedCard.id) && (
                        <Badge className="text-xs bg-emerald-500 hover:bg-emerald-600">
                          <CheckCircle2 className="size-3 mr-0.5" />
                          已掌握
                        </Badge>
                      )}
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
                {/* 公式展示（大字） */}
                {!dictateMode && (
                  <div className="bg-card border border-border/60 rounded-xl p-5 text-center formula-scroll">
                    <MathRenderer expression={selectedCard.formula} displayMode />
                  </div>
                )}

                {/* 默写模式 */}
                {dictateMode && (
                  <div className="space-y-3">
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                      <div className="text-muted-foreground text-xs mb-2">📝 默写模式</div>
                      <div className="text-2xl font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-widest">
                        ? ? ?
                      </div>
                      <div className="text-muted-foreground text-xs mt-2">
                        在下方输入框默写出公式（LaTeX 或自然语言描述均可）
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1.5">
                        💡 提示：{selectedCard.condition.substring(0, 30)}…
                      </div>
                      <Input
                        value={dictateInput}
                        onChange={(e) => setDictateInput(e.target.value)}
                        placeholder="输入公式，如：f(x) = sum f^{(n)}(x0)/n! * (x-x0)^n"
                        className="font-mono text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !dictateResult) {
                            e.preventDefault();
                            submitDictate();
                          }
                        }}
                        disabled={dictateResult?.passed || isInCooldown(selectedCard.id)}
                      />
                    </div>

                    {dictateResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'rounded-xl p-4 text-sm',
                          dictateResult.passed
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200/60 dark:border-rose-700/40 text-rose-700 dark:text-rose-400',
                        )}
                      >
                        {dictateResult.passed ? (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold">默写正确！🎉</div>
                              <div className="text-xs mt-1 opacity-80">
                                匹配度 {dictateResult.matched}/{dictateResult.total} 关键词，咒语已点亮
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <RefreshCw className="size-5 shrink-0 mt-0.5 animate-spin-slow" />
                            <div>
                              <div className="font-bold">还差一点~</div>
                              <div className="text-xs mt-1 opacity-80">
                                匹配度 {dictateResult.matched}/{dictateResult.total} 关键词，冷却 10 分钟后可再试
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* 咒语口诀 */}
                {(!dictateMode || dictateResult?.passed) && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/60 dark:border-amber-700/40 rounded-xl p-4">
                    <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                      <Zap className="size-3.5" />
                      咒语口诀
                    </div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                      「{selectedCard.mantra}」
                    </p>
                  </div>
                )}

                {/* 适用条件 */}
                {(!dictateMode || dictateResult?.passed) && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      适用条件
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {selectedCard.condition}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="px-5 md:px-6 pb-5 pt-0 gap-2">
                {!dictateMode && (
                  <>
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">
                        关闭
                      </Button>
                    </DialogClose>
                    {!state.mastered.includes(selectedCard.id) && !isInCooldown(selectedCard.id) && (
                      <Button size="sm" onClick={startDictate} className="gap-1.5">
                        <Sparkles className="size-3.5" />
                        我要默写
                      </Button>
                    )}
                    {isInCooldown(selectedCard.id) && (
                      <Button size="sm" variant="secondary" disabled className="gap-1.5">
                        <Clock className="size-3.5" />
                        {formatCooldown(getCooldownRemaining(selectedCard.id))} 后可重试
                      </Button>
                    )}
                    {state.mastered.includes(selectedCard.id) && (
                      <Button size="sm" variant="secondary" disabled className="gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        已掌握
                      </Button>
                    )}
                  </>
                )}
                {dictateMode && !dictateResult && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setDictateMode(false)}>
                      返回
                    </Button>
                    <Button size="sm" onClick={submitDictate} disabled={!dictateInput.trim()} className="gap-1.5">
                      <Sparkles className="size-3.5" />
                      提交默写
                    </Button>
                  </>
                )}
                {dictateMode && dictateResult && (
                  <DialogClose asChild>
                    <Button size="sm" className="gap-1.5">
                      {dictateResult.passed ? '太棒了' : '我再想想'}
                    </Button>
                  </DialogClose>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 刚点亮动画 */}
      <AnimatePresence>
        {justMastered && selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-card border-2 border-primary/50 shadow-2xl rounded-xl p-8 text-center max-w-sm mx-4"
            >
              <div className="size-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Star className="size-8 text-white fill-white" />
              </div>
              <div className="text-lg font-black text-foreground mb-1">咒语解锁！</div>
              <div className="text-base font-bold text-primary mb-2">{selectedCard.name}</div>
              <div className="text-xs text-muted-foreground">
                「{selectedCard.mantra.substring(0, 20)}…」
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
