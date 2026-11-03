// EXPORTS: PracticeHelpLinks
// 答错之后的「去看原理 / 去看流程」入口，按题目所属专题给对应资源

import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Lightbulb } from 'lucide-react';
import { EXPLAINER_TOPICS } from '@/data/explainers';
import { getFlowChart } from '@/data/flows';
import { getStudyLinks } from '@/data/study-links';
import { cn } from '@/lib/utils';

interface PracticeHelpLinksProps {
  /** 题目所属专题，如 limit-continuity */
  topicKey?: string;
  className?: string;
}

export default function PracticeHelpLinks({ topicKey, className }: PracticeHelpLinksProps) {
  const navigate = useNavigate();
  const { flowId, explainerId } = getStudyLinks(topicKey);

  const explainer = explainerId
    ? EXPLAINER_TOPICS.find((t) => t.id === explainerId)
    : undefined;
  const flow = flowId ? getFlowChart(flowId) : undefined;

  if (!explainer && !flow) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs',
        className
      )}
    >
      <span className="text-muted-foreground">这题卡住的话，先补这一步：</span>
      {explainer && (
        <button
          onClick={() => navigate('/explainer?topic=' + explainer.id)}
          className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Lightbulb className="size-3.5 text-amber-600" />
          {explainer.title.replace(/：.*$/, '')}
          <ArrowRight className="size-3 text-muted-foreground" />
        </button>
      )}
      {flow && (
        <button
          onClick={() => navigate('/flow?chart=' + flow.id)}
          className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Compass className="size-3.5 text-sky-600" />
          {flow.title}
          <ArrowRight className="size-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
