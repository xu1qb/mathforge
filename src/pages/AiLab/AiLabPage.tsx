// EXPORTS: AiLabPage
// AI 出题实验室：调用后端模型生成题目，服务端已做 LaTeX/书写校验

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, Save, Cpu } from 'lucide-react';
import PageShell from '@/components/PageShell';
import MathRenderer from '@/components/MathRenderer';
import RichTextRenderer from '@/components/RichTextRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  fetchAiHealth,
  fetchAiQuestions,
  streamAiQuestions,
  fetchPoolStatus,
  fillPool,
  type FillJob,
  getApiBase,
  isNativeApp,
  setApiBase,
  type AiQuestion,
  type AiHealth,
} from '@/lib/ai-client';
import { PRACTICE_TOPICS } from '@/data/practice-topics';
import { AI_TOPICS, FUSION_COMBOS, INNOVATION_STYLES } from '@/data/ai-topics';
import { toast } from 'sonner';

const STORAGE_KEY = 'mathforge_ai_questions';

const desktop = (typeof window !== 'undefined'
  ? (window as unknown as { mfDesktop?: { getConfig: () => Promise<DesktopConfigShape>; setConfig: (c: unknown) => Promise<{ ok: boolean; hasKey: boolean; mode?: string }> } }).mfDesktop
  : undefined);

interface DesktopConfigShape {
  hasKey: boolean;
  model: string;
  baseUrl: string;
  agentMode: boolean;
}

function MobileServerConfig({ onSaved }: { onSaved: () => void }) {
  const [url, setUrl] = useState(getApiBase());
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      setApiBase(url.trim());
      const h = await fetchAiHealth();
      toast(h.mode === 'live' ? '已连接（在线模型）' : '已连接（mock 模式）');
      onSaved();
    } catch {
      toast.error('连不上这个地址，检查手机和电脑是否在同一 Wi-Fi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Cpu className="size-4 text-primary" />
          移动端后端地址
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">
          手机跑不了 Node 后端，需要连到电脑上跑的 <code>npm run server</code>（同一 Wi-Fi）。
          电脑 IP 可在「系统设置 → 网络」查看。
        </p>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://192.168.1.10:8787/api"
            className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
          <Button size="sm" onClick={() => void save()} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            保存并测试
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          只影响 AI 功能；练习、课程、题库等离线功能不需要后端。
        </p>
      </CardContent>
    </Card>
  );
}

function DesktopConfig({ onSaved }: { onSaved: () => void }) {
  const [cfg, setCfg] = useState<DesktopConfigShape | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    desktop?.getConfig().then(setCfg).catch(() => setCfg(null));
  }, []);

  const save = async () => {
    if (!desktop) return;
    setSaving(true);
    try {
      const res = await desktop.setConfig({
        apiKey: apiKey.trim() || undefined,
        model: cfg?.model,
        baseUrl: cfg?.baseUrl,
        agentMode: cfg?.agentMode,
      });
      toast(
        res.ok
          ? '已保存，后端已切换为 ' + (res.mode === 'live' ? '在线模型' : 'mock 模式')
          : '已保存，但后端未响应'
      );
      setApiKey('');
      setCfg(await desktop.getConfig());
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Cpu className="size-4 text-primary" />
          桌面端模型配置
          {cfg?.hasKey ? (
            <Badge variant="default" className="text-[10px]">已配置</Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px]">未配置（mock 模式）</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid gap-2 md:grid-cols-3">
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={cfg?.hasKey ? '已保存，留空则不修改' : 'sk-...'}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">模型</span>
            <input
              value={cfg?.model ?? ''}
              onChange={(e) => setCfg((c) => (c ? { ...c, model: e.target.value } : c))}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">接口地址</span>
            <input
              value={cfg?.baseUrl ?? ''}
              onChange={(e) => setCfg((c) => (c ? { ...c, baseUrl: e.target.value } : c))}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => void save()} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            保存并重启后端
          </Button>
          <span className="text-[11px] text-muted-foreground">
            密钥保存在系统应用数据目录，不进代码仓库
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

const DIFFICULTIES = [
  { key: 'basic', label: '基础' },
  { key: 'advanced', label: '进阶' },
  { key: 'competition', label: '竞赛' },
] as const;

export default function AiLabPage() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<AiHealth | null>(null);
  const [pool, setPool] = useState<{ total: number; byTopic: Record<string, number>; job: FillJob | null } | null>(null);
  const [poolBusy, setPoolBusy] = useState(false);

  const refreshPool = useCallback(async () => {
    const st = await fetchPoolStatus().catch(() => null);
    if (st) setPool({ total: st.total, byTopic: st.byTopic, job: st.job });
  }, []);
  const [topic, setTopic] = useState('极限计算');
  const [difficulty, setDifficulty] = useState<'basic' | 'advanced' | 'competition'>('basic');
  const [count, setCount] = useState(3);
  const [verifyMode, setVerifyMode] = useState<'strict' | 'balanced' | 'off'>('balanced');
  const [fusion, setFusion] = useState('');
  const [style, setStyle] = useState('');
  const [questionType, setQuestionType] = useState<'auto' | 'calculation' | 'proof' | 'comprehensive'>('auto');
  const [parts, setParts] = useState(3);
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(true);
  const [stages, setStages] = useState<{ stage: string; detail?: string }[]>([]);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<AiQuestion[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [meta, setMeta] = useState<{ agent: boolean; toolCalls: number; autoApproved: boolean }>({
    agent: false,
    toolCalls: 0,
    autoApproved: false,
  });

  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const t of AI_TOPICS) set.add(t.label);
    for (const t of PRACTICE_TOPICS) set.add(t.label);
    return [...set];
  }, []);

  useEffect(() => {
    fetchAiHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
    void refreshPool();
  }, [refreshPool]);

  const generate = async () => {
    setLoading(true);
    setError('');
    setStages([]);
    const req = {
      topic,
      difficulty,
      count,
      fusion: fusion.split(/[，,、\s×]+/).filter(Boolean),
      questionType,
      parts: questionType === 'comprehensive' ? parts : undefined,
      style: style.trim() || undefined,
      verifyMode,
    };
    try {
      const batch = stream
        ? await streamAiQuestions(req, {
            onStatus: (stage, detail) => setStages((prev) => [...prev.slice(-6), { stage, detail }]),
          })
        : await fetchAiQuestions(req);
      setQuestions(batch.questions);
      setMeta({ agent: Boolean(batch.agent), toolCalls: batch.toolCalls ?? 0, autoApproved: Boolean(batch.autoApproved) });
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
      description="严格档：机器验证通过的题直接可用；平衡/关闭档：生成的题进人工审核队列"
      width="wide"
      back
    >
      <div className="space-y-5">
        {desktop && <DesktopConfig onSaved={() => fetchAiHealth().then(setHealth).catch(() => setHealth(null))} />}
        {isNativeApp() && <MobileServerConfig onSaved={() => fetchAiHealth().then(setHealth).catch(() => setHealth(null))} />}

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
                {health.verifyModel && (
                  <span className="text-xs text-emerald-600">异构校验：{health.verifyModel}</span>
                )}
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

        {/* 讲解草稿入口 */}
        <Card className="border-border/60">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">讲解草稿</div>
              <div className="text-xs text-muted-foreground">
                让模型产出定义 / 步骤 / 例题 / 易错点，人工校对后再入库
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/explain-lab')}>
              <Sparkles className="size-3.5" />
              去生成
            </Button>
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
                <span className="text-muted-foreground">题型</span>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as typeof questionType)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                >
                  <option value="auto">自动（融合时优先大题）</option>
                  <option value="calculation">计算/求值题</option>
                  <option value="proof">证明题</option>
                  <option value="comprehensive">综合大题（多问）</option>
                </select>
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">校验档位</span>
                <select
                  value={verifyMode}
                  onChange={(e) => setVerifyMode(e.target.value as typeof verifyMode)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                >
                  <option value="strict">严格（不可验证就拒绝）</option>
                  <option value="balanced">平衡（放行但标记未验证）</option>
                  <option value="off">关闭（只查格式）</option>
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

              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">综合大题小问数</span>
                <input
                  type="number"
                  min={2}
                  max={4}
                  value={parts}
                  disabled={questionType !== 'comprehensive'}
                  onChange={(e) => setParts(Math.min(4, Math.max(2, Number(e.target.value) || 3)))}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm disabled:opacity-50"
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="space-y-1 text-xs">
                  <span className="text-muted-foreground">融合知识点（可选，用逗号分隔）</span>
                  <input
                    value={fusion}
                    onChange={(e) => setFusion(e.target.value)}
                    placeholder="例如：数列, 数论"
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                  />
                </label>
                <div className="flex flex-wrap gap-1">
                  {FUSION_COMBOS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setFusion(c.parts.join(', '))}
                      className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      {c.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const combo = FUSION_COMBOS[Math.floor(Math.random() * FUSION_COMBOS.length)];
                      setFusion(combo.parts.join(', '));
                      setStyle('多问综合');
                    }}
                    className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] text-primary transition-colors hover:bg-primary/15"
                  >
                    随机融合
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="space-y-1 text-xs">
                  <span className="text-muted-foreground">创新风格（可选）</span>
                  <input
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="例如：应用题背景 / 含参数讨论"
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                  />
                </label>
                <div className="flex flex-wrap gap-1">
                  {INNOVATION_STYLES.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setStyle(s.text)}
                      className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={stream}
                  onChange={(e) => setStream(e.target.checked)}
                  className="size-3.5 accent-primary"
                />
                流式进度
              </label>
              <Button variant="outline" onClick={() => navigate('/ai-review')} className="gap-1.5">
                审核队列
              </Button>
              <Button onClick={generate} disabled={loading} className="gap-1.5">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {loading ? '生成中…' : '生成题目'}
              </Button>
              {questions.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  本次 {questions.length} 道
                  {meta.agent && meta.toolCalls > 0 && ' · 工具调用 ' + meta.toolCalls + ' 次'}
                </span>
              )}
            </div>

            {stages.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                {stages.map((s, i) => (
                  <span
                    key={i}
                    className={
                      'rounded-md border border-border px-1.5 py-0.5 ' +
                      (i === stages.length - 1 && loading ? 'border-primary/40 text-foreground' : '')
                    }
                  >
                    {s.stage}
                    {s.detail ? ' · ' + s.detail : ''}
                  </span>
                ))}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 预生成池 */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-violet-500" />
              预生成池
              <span className="text-xs font-normal text-muted-foreground">
                已入库 {pool?.total ?? 0} 道，练习时秒开
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {pool && Object.keys(pool.byTopic).length > 0 ? (
                Object.entries(pool.byTopic)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([k, v]) => (
                    <Badge key={k} variant="secondary" className="text-[11px]">
                      {k} · {v}
                    </Badge>
                  ))
              ) : (
                <span className="text-xs text-muted-foreground">还没有预生成题目</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={poolBusy || health?.mode !== 'live'}
                onClick={async () => {
                  setPoolBusy(true);
                  try {
                    const { job } = await fillPool(topic, 'basic', 10);
                    toast(job.error ?? '已启动后台补题：' + topic);
                    for (let i = 0; i < 40; i++) {
                      await new Promise((r) => setTimeout(r, 3000));
                      const st = await fetchPoolStatus(topic).catch(() => null);
                      if (st) setPool(st);
                      if (!st?.job?.running) break;
                    }
                    toast.success('补题结束，见上方统计');
                  } catch {
                    toast.error('补题失败，检查后端是否在线');
                  } finally {
                    setPoolBusy(false);
                  }
                }}
              >
                {poolBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                给「{topic}」补 10 道
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void refreshPool()} disabled={poolBusy}>
                刷新
              </Button>
              <span className="text-[11px] text-muted-foreground">只收严格档验证通过的题</span>
            </div>
          </CardContent>
        </Card>

        {/* 结果去向 */}
        {questions.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-wrap items-center gap-3 p-3 text-sm">
              <span className="text-foreground">
                本批 {questions.length} 道已入库
                {meta.autoApproved ? '（机器验证通过，可直接练习）' : '（待人工审核）'}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => navigate('/practice?topic=' + (PRACTICE_TOPICS.find((t) => t.label === topic)?.key ?? 'limit-basic'))}
              >
                去练习这个知识点
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => navigate('/ai-review')}>
                查看题库
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 结果 */}
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id} className="border-border/60">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                  {q.questionType === 'proof' && (
                    <Badge variant="outline" className="border-sky-500/50 text-[10px] text-sky-600">证明题</Badge>
                  )}
                  {q.questionType === 'comprehensive' && (
                    <Badge variant="outline" className="border-amber-500/50 text-[10px] text-amber-600">
                      综合大题{q.parts ? ` · ${q.parts} 问` : ''}
                    </Badge>
                  )}
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
                  {q.validation.dualSolve === 'match' && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                      <CheckCircle2 className="size-3" /> 双解一致
                    </span>
                  )}
                  {q.validation.dualSolve === 'judged' && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                      <CheckCircle2 className="size-3" /> 复算确认
                    </span>
                  )}
                  {q.validation.unverified && (
                    <span className="text-[11px] text-amber-600">未验证 · 待人工</span>
                  )}
                  {q.validation.dualSolve === 'skipped' && !q.validation.unverified && (
                    <span className="text-[11px] text-muted-foreground">未做双解</span>
                  )}
                  {q.status === 'approved' ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                      <CheckCircle2 className="size-3" /> 已自动入库，可直接练习
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-600">待人工审核</span>
                  )}
                  <span className="text-[11px] text-muted-foreground">第 {q.validation.attempts} 次生成</span>
                </div>

                <div className="rounded-lg bg-muted/40 p-3 text-sm">
                  <MathRenderer expression={q.questionLatex} displayMode />
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">答案：</span>
                  <span className="font-medium text-foreground">
                    <RichTextRenderer text={q.answerDisplay ?? q.answer} />
                  </span>
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
