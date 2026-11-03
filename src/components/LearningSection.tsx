import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { LEARNING_CARDS, type LearningCard } from '@/data/math-learning';
import MathRenderer from '@/components/MathRenderer';

interface LearningSectionProps {
  moduleKey: string;
}

export default function LearningSection({ moduleKey }: LearningSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const cards = LEARNING_CARDS.filter((c) => c.moduleKey === moduleKey);

  if (cards.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="text-sm font-semibold text-foreground">知识点学习</span>
          <span className="text-xs text-muted-foreground">({cards.length} 张卡片)</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3">
          {cards.map((card) => (
            <LearnCardInline key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

function LearnCardInline({ card }: { card: LearningCard }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border/70 bg-card/80 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{card.title}</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2.5 text-sm border-t border-border/50 pt-2.5">
          <div>
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">定义</div>
            <p className="text-foreground/90 leading-relaxed text-xs">{card.definition}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">核心公式</div>
            <ul className="space-y-1">
              {card.formulas.map((f, i) => (
                <li key={i} className="bg-muted/50/70 px-3 py-2 rounded border border-border/50 overflow-x-auto">
                  <MathRenderer expression={f} displayMode />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">注意事项</div>
            <ul className="space-y-0.5">
              {card.notes.map((n, i) => (
                <li key={i} className="text-xs text-foreground/90 pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-emerald-500">
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">经典示例</div>
            <p className="text-xs text-foreground/90 mb-1">{card.example.description}</p>
            <div className="bg-muted/50/70 px-3 py-2 rounded border border-border/50 overflow-x-auto">
              <MathRenderer expression={card.example.formula} displayMode />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
