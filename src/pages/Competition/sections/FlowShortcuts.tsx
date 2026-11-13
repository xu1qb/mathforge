// EXPORTS: FlowShortcuts
// 竞赛专区里的「解题流程图」入口：六类高频题型直链到 /flow?chart=xxx

import { useNavigate } from 'react-router-dom';
import { ArrowRight, Workflow } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FLOW_CHARTS, type FlowKind } from '@/data/flows';
import { cn } from '@/lib/utils';

/** 节点类型的迷你色点，构成每张图的“路线指纹” */
const KIND_DOT: Record<FlowKind, string> = {
  start: 'bg-primary',
  decision: 'bg-amber-500',
  process: 'bg-border',
  warn: 'bg-red-500',
  end: 'bg-emerald-500',
};

export default function FlowShortcuts() {
  const navigate = useNavigate();

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Workflow className="size-5 text-primary" />
          解题流程图
        </CardTitle>
        <CardDescription>
          拿到题先走一遍思路，{FLOW_CHARTS.length} 张高频题型思路图
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {FLOW_CHARTS.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/flow?chart=${c.id}`)}
            className="group flex flex-col justify-between gap-2 rounded-lg border border-border/60 bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{c.title}</span>
                <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                  {c.subtitle}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            </span>
            {/* 路线指纹：一列色点 = 起点→判断→步骤→易错→结论 */}
            <span className="flex items-center gap-1" aria-hidden>
              {c.nodes.map((n, i) => (
                <span key={n.id} className="flex items-center gap-1">
                  {i > 0 && <span className="h-px w-1.5 bg-border" />}
                  <span
                    className={cn('h-1.5 w-1.5 rounded-full', KIND_DOT[n.kind])}
                    title={n.title}
                  />
                </span>
              ))}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
