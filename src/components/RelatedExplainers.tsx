// EXPORTS: RelatedExplainers
// 工具页顶部的「相关原理」入口：把对应的原理讲解考点串过来，避免学完算法不知道原理在哪

import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { EXPLAINER_TOPICS } from '@/data/explainers';

interface RelatedExplainersProps {
  /** 要展示的考点 id，顺序即展示顺序 */
  ids: string[];
  className?: string;
}

export default function RelatedExplainers({ ids, className }: RelatedExplainersProps) {
  const navigate = useNavigate();
  const items = ids
    .map((id) => EXPLAINER_TOPICS.find((t) => t.id === id))
    .filter((t): t is (typeof EXPLAINER_TOPICS)[number] => Boolean(t));

  if (items.length === 0) return null;

  return (
    <div
      className={
        'flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 ' +
        (className ?? '')
      }
    >
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Lightbulb className="size-3.5 text-amber-600" />
        相关原理
      </span>
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => navigate('/explainer?topic=' + t.id)}
          className="group inline-flex items-center gap-1 rounded-lg bg-muted/60 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-accent"
        >
          {t.title.replace(/：.*$/, '')}
          <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary" />
        </button>
      ))}
    </div>
  );
}
