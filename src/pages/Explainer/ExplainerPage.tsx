import { ArrowLeft, Lightbulb, CheckCircle2, ListChecks } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MathRenderer from '@/components/MathRenderer';
import { EXPLAINER_TOPICS, type ExplainerTopic } from '@/data/explainers';
import { cn } from '@/lib/utils';

export default function ExplainerPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // ?topic=lhopital 之类的深链，来自竞赛专区的入口；非法 id 回落到第一条
  const activeId = params.get('topic');
  const topic: ExplainerTopic =
    EXPLAINER_TOPICS.find((t) => t.id === activeId) ?? EXPLAINER_TOPICS[0];
  const handleSelect = (id: string) => setParams({ topic: id }, { replace: true });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* 头部 */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> 返回
        </button>
        <h1 className="text-xl font-semibold">原理讲解</h1>
        <Badge variant="secondary">数竞高频考点拆解</Badge>
      </div>

      <div className="flex flex-col gap-5 md:flex-row">
        {/* 左侧知识点列表 */}
        <aside className="md:w-60 md:shrink-0">
          <div className="flex flex-col gap-2">
            {EXPLAINER_TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-colors',
                  t.id === topic.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:bg-accent'
                )}
              >
                <div className="text-sm font-medium">{t.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{t.tag}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* 右侧讲解内容 */}
        <main className="min-w-0 flex-1 space-y-4">
          {/* 本质 */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">一句话本质</span>
              </div>
              <p className="text-sm leading-relaxed">{topic.essence}</p>
            </CardContent>
          </Card>

          {/* 什么时候用 */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">什么时候用它</span>
              </div>
              <ul className="space-y-1.5">
                {topic.whenToUse.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 步骤 */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">解题步骤</span>
              </div>
              <div className="space-y-4">
                {topic.steps.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{s.title}</div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
                      {s.formula && (
                        <div className="mt-2 overflow-x-auto rounded-md bg-muted/50 p-2">
                          <MathRenderer expression={s.formula} displayMode />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 例子 */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-2 text-sm font-semibold">完整例子</div>
              <p className="mb-3 rounded-md bg-muted/50 p-3 text-sm">{topic.example.problem}</p>
              <ul className="space-y-1.5">
                {topic.example.walkthrough.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {w}
                  </li>
                ))}
              </ul>
              <div className="mt-3 overflow-x-auto rounded-md bg-primary/10 p-3">
                <MathRenderer expression={topic.example.result} displayMode />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
