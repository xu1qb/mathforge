// EXPORTS: AiLabPage
// AI 出题实验室：调用后端模型生成题目，服务端已做 LaTeX/书写校验

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, Save, Cpu } from 'lucide-react';
import PageShell from '@/components/PageShell';
import MathRenderer from '@/components/MathRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchAiHealth, fetchAiQuestions, type AiQuestion, type AiHealth } from '@/lib/ai-client';
import { PRACTICE_TOPICS } from '@/data/practice-topics';
import { toast } from 'sonner';

const STORAGE_KEY = 'mathforge_ai_questions';

const DIFFICULTIES = [
  { key: 'basic', label: '基础' },
  { key: 'advanced', label: '进阶' },
  { key: 'competition', label: '竞赛' },
] as const;

export default function AiLabPage() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<AiHealth | null>(null);
  const [topic, setTopic] = useState('极限计算');
  const [difficulty, setDifficulty] = useState<'basic' | 'advanced' | 'competition'>('basic');
  const [count, setCount] = useState(3);
  const [fusion, setFusion] = useState('');
  const [style, setStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<AiQuestion[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const topics = useMemo(() => PRACTICE_TOPICS.map((t) => t.label), []);

  useEffect(() => {
    fetchAiHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const batch = await fetchAiQuestions({
        topic,
        difficulty,
        count,
        fusion: fusion.split(/[，,、\\s]+/).filter(Boolean),
        style: style.trim() || undefined,
      });
      setQuestions(batch.questions);
      if (batch.cached > 0) toast('命中缓存，没有重复调用模型');
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const save = (q: AiQuestion) => {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AiQuestion[];
    const next = [q, ...prev.filter((x) => x.id !== q.id)].slice(0, 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedIds((ids) => [...ids, q.id]);
    toast.success('已保存到我的题库');
  };

  return (
    <PageShell
      title="AI 出题实验室"
      eyebrow="模型驱动"
      description="由后端调用模型生成题目，服务端会校验 LaTeX 能否渲染、书写是否规范，不合格会自动重试"
      width="wide"
      back
    >
      <div className="space-y-5">
        {/* 服务状态 */}
        <Card className="border-border/60">
          <CardContent className="flex flex-wrap items-center gap-3 p-3">
            <Cpu className="size-4 text-muted-foreground" />
            {health ? (
              <>
                <Badge variant={health.mode === 'live' ? 'default' : 'secondary'} className="text-xs">
                  {health.mode === 'live' ? '在线模型' : 'Mock 模式'}
                </Badge>
                <span className="text-xs text-muted-foreground">模型：{health.model}</span>
                {health.mode === 'mock' && (
                  <span className="text-xs text-amber-600">
                    未配置 LLM_API_KEY，当前用固定样例跑通链路
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-destructive">
                后端未启动：请在项目根目录运行 npm run server（或 npm run dev:full）
              </span>
            )}
          </CardContent>
        </Card>

        {/* 参数 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" />
              出题参数
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">知识点</span>
                <input
                  list="ai-topics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                />
                <datalist id="ai-topics">
                  {topics.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">难度</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.key} value={d.key}>{d.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">数量（1–10）</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">融合知识点（可选，用逗号分隔）</span>
                <input
                  value={fusion}
                  onChange={(e) => setFusion(e.target.value)}
                  placeholder="例如：数列, 数论"
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">风格要求（可选）</span>
                <input
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="例如：应用题背景 / 含参数讨论"
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/ai-review')} className="gap-1.5">
                审核队列
              </Button>
              <Button onClick={generate} disabled={loading} className="gap-1.5">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {loading ? '生成中…' : '生成题目'}
              </Button>
              {questions.length > 0 && (
                <span className="text-xs text-muted-foreground">本次 {questions.length} 道</span>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 结果 */}
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id} className="border-border/60">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                  {q.fusion?.map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                  ))}
                  {q.validation.latexOk && q.validation.notationOk ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                      <CheckCircle2 className="size-3" /> 校验通过
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-600">校验告警</span>
                  )}
                  <span className="text-[11px] text-muted-foreground">第 {q.validation.attempts} 次生成</span>
                </div>

                <div className="rounded-lg bg-muted/40 p-3 text-sm">
                  <MathRenderer expression={q.questionLatex} displayMode />
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">答案：</span>
                  <span className="font-medium text-foreground">{q.answerDisplay ?? q.answer}</span>
                </div>

                <ol className="space-y-1 text-xs text-muted-foreground">
                  {q.steps.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="shrink-0 font-mono opacity-60">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={savedIds.includes(q.id)}
                    onClick={() => save(q)}
                  >
                    <Save className="size-3.5" />
                    {savedIds.includes(q.id) ? '已保存' : '保存到我的题库'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
