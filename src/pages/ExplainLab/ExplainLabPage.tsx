// EXPORTS: ExplainLabPage
// 讲解实验室：让模型产出「定义 / 定理 / 例题 / 易错点」草稿，人工审完再落盘。
import { useState } from 'react';
import { AlertTriangle, Copy, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import PageShell from '@/components/PageShell';
import MathRenderer from '@/components/MathRenderer';
import RichTextRenderer from '@/components/RichTextRenderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchExplainer, type ExplainerResult } from '@/lib/ai-client';

const LEVELS = ['基础', '进阶', '竞赛'] as const;
type Level = (typeof LEVELS)[number];

const EXAMPLES = ['洛必达法则', '泰勒展开', '贝叶斯公式', '特征值与对角化'];

export default function ExplainLabPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<Level>('基础');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainerResult | null>(null);
  const [error, setError] = useState('');

  async function run() {
    const name = topic.trim();
    if (!name) {
      toast.error('先写一个考点名，比如「洛必达法则」');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchExplainer(name, level);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  }

  async function copyDraft() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result.draft, null, 2));
      toast.success('已复制 JSON，粘贴进 explainers.ts 前请人工过一遍');
    } catch {
      toast.error('复制失败，请手动选中');
    }
  }

  return (
    <PageShell
      title="讲解实验室"
      eyebrow="模型驱动"
      description="生成「本质 / 步骤 / 例题 / 易错点」草稿；只产出草稿，入库前必须人工校对"
      width="tool"
      back
    >
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" />
              生成参数
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') run();
                }}
                placeholder="考点名，例如「洛必达法则」"
                className="min-w-0 flex-1"
              />
              <div className="flex gap-2">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                  aria-label="难度"
                >
                  {LEVELS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <Button onClick={run} disabled={loading} className="gap-1.5">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {loading ? '生成中' : '生成草稿'}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground">试试：</span>
              {EXAMPLES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setTopic(name)}
                  className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {name}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              草稿只是起点：数学表述是否严谨、例子是否贴题，仍要人读一遍；公式要补 sympy 断言。
            </p>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="flex items-start gap-2 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0 break-words">{error}</span>
            </CardContent>
          </Card>
        )}

        {!result && !error && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              还没有草稿。填一个考点名，选难度，点「生成草稿」。
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  <RichTextRenderer text={result.draft.title} />
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px]">
                    {result.mode === 'mock' ? '示例草稿 · 未配置模型' : result.model}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={copyDraft} className="h-7 gap-1 px-2 text-xs">
                    <Copy className="size-3" />
                    复制 JSON
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <RichTextRenderer text={result.draft.essence} />
              </p>
            </CardHeader>

            <CardContent className="space-y-5">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">步骤</h3>
                <ol className="space-y-2">
                  {result.draft.steps.map((step, i) => (
                    <li key={i} className="rounded-lg border border-border bg-card p-3">
                      <div className="text-sm font-medium text-foreground">
                        {i + 1}. <RichTextRenderer text={step.title} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <RichTextRenderer text={step.body} />
                      </p>
                      {step.formula && (
                        <div className="mt-2 overflow-x-auto rounded-md bg-muted/40 p-2">
                          <MathRenderer expression={step.formula} displayMode />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">例题</h3>
                <div className="rounded-lg border border-border bg-card p-3 text-sm">
                  <p className="text-foreground">
                    <RichTextRenderer text={result.draft.example.problem} />
                  </p>
                  <ol className="mt-2 space-y-1 text-muted-foreground">
                    {result.draft.example.walkthrough.map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="shrink-0 font-mono opacity-60">{i + 1}.</span>
                        <span className="min-w-0">
                          <RichTextRenderer text={line} />
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-foreground">
                    <span className="text-muted-foreground">结果：</span>
                    <RichTextRenderer text={result.draft.example.result} />
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">易错点</h3>
                <ul className="space-y-1.5">
                  {result.draft.pitfalls.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                      <span className="min-w-0">
                        <RichTextRenderer text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {result.issues.length > 0 && (
                <p className="text-xs text-amber-600">提示：{result.issues.join('；')}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
