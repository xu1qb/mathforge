// EXPORTS: GeometryDrillPage
// 几何攻坚：塞瓦、梅涅劳斯、圆幂三组专题训练，每题给提示与完整解答。
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import PageShell from '@/components/PageShell';
import RichTextRenderer from '@/components/RichTextRenderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GEOMETRY_DRILLS, getGeometryDrill, type DrillProblem } from '@/data/geometry-drills';
import { cn } from '@/lib/utils';

function ProblemCard({ problem, index }: { problem: DrillProblem; index: number }) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="text-muted-foreground">第 {index + 1} 题</span>
          </div>
          <Badge variant="outline" className="text-[11px]">{problem.level}</Badge>
        </div>

        <div className="text-sm leading-relaxed text-foreground">
          <RichTextRenderer text={problem.statement} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => setShowHint((v) => !v)}
          >
            <Lightbulb className="size-3" />
            {showHint ? '收起提示' : '看提示'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => setShowSolution((v) => !v)}
          >
            {showSolution ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            {showSolution ? '收起解答' : '看解答'}
          </Button>
        </div>

        {showHint && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            <RichTextRenderer text={problem.hint} />
          </div>
        )}

        {showSolution && (
          <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
            <ol className="space-y-1.5 text-sm text-muted-foreground">
              {problem.steps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 font-mono opacity-60">{i + 1}.</span>
                  <span className="min-w-0">
                    <RichTextRenderer text={step} />
                  </span>
                </li>
              ))}
            </ol>
            <div className="border-t border-border pt-2 text-sm text-foreground">
              <span className="text-muted-foreground">答案：</span>
              <RichTextRenderer text={problem.answer} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GeometryDrillPage() {
  const [params, setParams] = useSearchParams();
  const drill = getGeometryDrill(params.get('drill') ?? GEOMETRY_DRILLS[0].id);

  return (
    <PageShell
      title="几何攻坚"
      eyebrow="专题训练"
      description="塞瓦、梅涅劳斯、圆幂三组题：先看提示，再展开完整解答"
      width="tool"
      back
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {GEOMETRY_DRILLS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setParams({ drill: d.id }, { replace: true })}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                d.id === drill.id
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {d.title}
              <span className="ml-1.5 text-[11px] opacity-70">{d.problems.length} 题</span>
            </button>
          ))}
        </div>

        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-sm font-semibold text-foreground">{drill.subtitle}</div>
            <p className="mt-1 text-xs text-muted-foreground">{drill.method}</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {drill.problems.map((problem, i) => (
            <ProblemCard key={problem.id} problem={problem} index={i} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
