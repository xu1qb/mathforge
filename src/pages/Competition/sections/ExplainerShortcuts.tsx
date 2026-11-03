// EXPORTS: ExplainerShortcuts
// 竞赛专区里的「原理讲解」入口：按标签分组的 14 个考点，直链到 /explainer?topic=xxx

import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EXPLAINER_TOPICS, type ExplainerTopic } from '@/data/explainers';

interface TagGroup {
  tag: string;
  items: ExplainerTopic[];
}

function groupByTag(): TagGroup[] {
  const groups: TagGroup[] = [];
  for (const t of EXPLAINER_TOPICS) {
    const hit = groups.find((g) => g.tag === t.tag);
    if (hit) hit.items.push(t);
    else groups.push({ tag: t.tag, items: [t] });
  }
  return groups;
}

const GROUPS = groupByTag();

export default function ExplainerShortcuts() {
  const navigate = useNavigate();

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="size-5 text-amber-600" />
          原理讲解
        </CardTitle>
        <CardDescription>
          {EXPLAINER_TOPICS.length} 个高频考点：一句话本质、什么时候用、完整例子
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {GROUPS.map((g) => (
          <div key={g.tag} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <span className="w-16 shrink-0 pt-1.5 text-xs font-medium text-muted-foreground">
              {g.tag}
            </span>
            <div className="flex flex-wrap gap-2">
              {g.items.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate('/explainer?topic=' + t.id)}
                  className="group inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card px-2.5 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  {t.title.replace(/：.*$/, '')}
                  <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
