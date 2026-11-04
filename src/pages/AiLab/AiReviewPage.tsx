// EXPORTS: AiReviewPage
// 审核队列：AI 生成的题必须人工通过后才算数

import { useCallback, useEffect, useState } from 'react';
import { Check, X, RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import PageShell from '@/components/PageShell';
import MathRenderer from '@/components/MathRenderer';
import RichTextRenderer from '@/components/RichTextRenderer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchQueue, reviewQuestion, type StoredQuestion, type ReviewStatus } from '@/lib/ai-client';
import { toast } from 'sonner';

const TABS: Array<{ key: ReviewStatus | 'all'; label: string; icon: typeof Clock }> = [
  { key: 'pending', label: '待审核', icon: Clock },
  { key: 'approved', label: '已通过', icon: CheckCircle2 },
  { key: 'rejected', label: '已驳回', icon: XCircle },
];

export default function AiReviewPage() {
  const [tab, setTab] = useState<ReviewStatus | 'all'>('pending');
  const [questions, setQuestions] = useState<StoredQuestion[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchQueue(tab);
      setQuestions(data.questions);
      setStats(data.stats);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await reviewQuestion(id, action);
      setStats(res.stats);
      setQuestions((list) => list.filter((q) => q.id !== id));
      toast.success(action === 'approve' ? '已通过' : '已驳回');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '操作失败');
    }
  };

  return (
    <PageShell
      title="AI 题库审核"
      eyebrow="质量把关"
      description="严格档机器验证通过的题已自动入库（可撤销）；平衡/关闭档的题在此人工审核"
      width="wide"
      back
    >
      <div className="space-y-4">
        <Card className="border-border/60">
          <CardContent className="flex flex-wrap items-center gap-2 p-3">
            {TABS.map((t) => (
              <Button
                key={t.key}
                size="sm"
                variant={tab === t.key ? 'default' : 'outline'}
                className="gap-1.5"
                onClick={() => setTab(t.key)}
              >
                <t.icon className="size-3.5" />
                {t.label}
                {t.key !== 'all' && stats[t.key] != null && (
                  <span className="ml-1 opacity-70">{stats[t.key]}</span>
                )}
              </Button>
            ))}
            <Button size="sm" variant="ghost" className="ml-auto gap-1.5" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={'size-3.5 ' + (loading ? 'animate-spin' : '')} />
              刷新
            </Button>
          </CardContent>
        </Card>

        {questions.length === 0 && !loading && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            这个列表是空的。去「AI 出题」生成几道题，它们会自动进入待审核。
          </div>
        )}

        {questions.map((q) => (
          <Card key={q.id} className="border-border/60">
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <Badge variant="outline">{q.difficulty}</Badge>
                <Badge variant="secondary">{q.topic}</Badge>
                {q.fusion?.map((f) => (
                  <Badge key={f} variant="outline">{f}</Badge>
                ))}
                <span>来源 {q.source}</span>
                <span>{new Date(q.createdAt).toLocaleString()}</span>
              </div>

              <div className="rounded-lg bg-muted/40 p-3">
                <MathRenderer expression={q.questionLatex} displayMode />
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">答案：</span>
                <span className="font-medium text-foreground">
                  <RichTextRenderer text={q.answerDisplay ?? q.answer} />
                </span>
                {q.validation.dualSolve === 'match' && (
                  <Badge variant="secondary" className="ml-2 text-[10px]">双解一致</Badge>
                )}
                {q.validation.dualSolve === 'skipped' && (
                  <Badge variant="outline" className="ml-2 text-[10px]">未做双解</Badge>
                )}
                {q.validation.secondAnswer && (
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    独立解：{q.validation.secondAnswer}
                  </span>
                )}
                {q.validation.noveltyScore != null && (
                  <Badge variant={q.validation.novelty === 'novel' ? 'secondary' : 'outline'} className="ml-2 text-[10px]">
                    新颖度 {Math.round((1 - q.validation.noveltyScore) * 100)}%
                  </Badge>
                )}
              </div>

              <ol className="space-y-1 text-xs text-muted-foreground">
                {q.steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 font-mono opacity-60">{i + 1}.</span>
                    <span className="min-w-0">
                      <RichTextRenderer text={s} />
                    </span>
                  </li>
                ))}
              </ol>

              {q.status === 'pending' && (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => void act(q.id, 'reject')}>
                    <X className="size-3.5" /> 驳回
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={() => void act(q.id, 'approve')}>
                    <Check className="size-3.5" /> 通过
                  </Button>
                </div>
              )}
              {q.status === 'approved' && (
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {q.note ?? '已通过'}
                  </span>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-destructive" onClick={() => void act(q.id, 'reject')}>
                    <X className="size-3.5" /> 撤销
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
