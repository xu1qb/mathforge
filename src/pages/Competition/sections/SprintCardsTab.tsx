// 竞赛定理学习卡 Tab（10 张冲刺卡片）
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  KeyRound,
  Brain,
  FileQuestion,
} from 'lucide-react';
import { COMPETITION_SPRINT_CARDS, type SprintCard } from '@/data/competition-sprint-cards';
import MathRenderer from '@/components/MathRenderer';
import RichTextRenderer from '@/components/RichTextRenderer';

export default function SprintCardsTab() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = COMPETITION_SPRINT_CARDS[activeIndex];
  const total = COMPETITION_SPRINT_CARDS.length;

  const goPrev = () => {
    setFlipped(false);
    setActiveIndex((i) => (i - 1 + total) % total);
  };

  const goNext = () => {
    setFlipped(false);
    setActiveIndex((i) => (i + 1) % total);
  };

  const goTo = (idx: number) => {
    setFlipped(false);
    setActiveIndex(idx);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="size-5 text-primary" />
          竞赛定理学习卡
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          冲刺分类 {total} 张核心定理卡，点击卡片翻转查看关键要点
        </p>
      </div>

      {/* 卡片主体 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 左侧卡片 */}
        <div className="flex-1">
          <div
            className="relative cursor-pointer perspective-1000"
            onClick={() => setFlipped((f) => !f)}
            style={{ perspective: '1000px' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeIndex}-${flipped ? 'back' : 'front'}`}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {!flipped ? (
                  <CardFront card={card} index={activeIndex} total={total} />
                ) : (
                  <CardBack card={card} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 导航按钮 */}
          <div className="flex items-center justify-between mt-3">
            <Button variant="outline" size="sm" onClick={goPrev} className="gap-1">
              <ChevronLeft className="size-4" /> 上一张
            </Button>
            <div className="text-sm text-muted-foreground">
              {activeIndex + 1} / {total}
            </div>
            <Button variant="outline" size="sm" onClick={goNext} className="gap-1">
              下一张 <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* 右侧卡片列表 */}
        <div className="lg:w-64 shrink-0">
          <Card className="border-border/60">
            <CardHeader className="py-3 px-3">
              <CardTitle className="text-xs text-muted-foreground font-medium">
                卡片目录
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <ScrollArea className="h-[320px] pr-1">
                <div className="space-y-1">
                  {COMPETITION_SPRINT_CARDS.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => goTo(i)}
                      className={`w-full text-left px-2.5 py-2 rounded-md text-sm transition-colors ${
                        i === activeIndex
                          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/90'
                          : 'hover:bg-muted/50 text-foreground/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs h-4 min-w-[18px] justify-center px-1"
                        >
                          {i + 1}
                        </Badge>
                        <span className="truncate">{c.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function CardFront({ card, index, total }: { card: SprintCard; index: number; total: number }) {
  return (
    <Card className="min-h-[400px] bg-gradient-to-br from-teal-50 via-background to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-200/60 dark:border-teal-800/40 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary hover:bg-primary/90">{card.category}</Badge>
          <Badge variant="outline" className="ml-auto">
            {index + 1} / {total}
          </Badge>
        </div>
        <CardTitle className="text-xl mt-2 flex items-center gap-2">
          <Lightbulb className="size-5 text-amber-500" />
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-card/70 backdrop-blur-sm p-5 border border-border/40">
          <div className="text-sm text-muted-foreground mb-2">核心公式</div>
          <div className="min-h-[80px] flex items-center justify-center">
            <MathRenderer expression={card.coreLatex} displayMode />
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Brain className="size-4" />
          点击卡片查看关键要点与记忆口诀
        </div>
      </CardContent>
    </Card>
  );
}

function CardBack({ card }: { card: SprintCard }) {
  return (
    <Card className="min-h-[400px] bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200/60 dark:border-emerald-800/40 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <KeyRound className="size-5 text-emerald-600" />
          {card.title}
          <span className="text-xs text-muted-foreground font-normal ml-auto">（背面）</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 关键点 */}
        <div>
          <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
            <KeyRound className="size-3.5 text-emerald-600" /> 关键点
          </div>
          <ul className="space-y-1.5">
            {card.keyPoints.map((p, i) => (
              <li key={i} className="text-sm text-foreground/80 flex gap-2">
                <span className="text-emerald-500 shrink-0">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 记忆口诀 */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 p-3">
          <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
            <Lightbulb className="size-3.5" /> 记忆口诀
          </div>
          <p className="text-sm text-amber-900 dark:text-amber-200">{card.mnemonic}</p>
        </div>

        {/* 示例 */}
        <div>
          <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
            <FileQuestion className="size-3.5 text-blue-600" /> 示例
          </div>
          <div className="text-sm text-foreground/80 leading-relaxed"><RichTextRenderer text={card.example} /></div>
        </div>
      </CardContent>
    </Card>
  );
}
