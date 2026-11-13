import { useEffect, useMemo, useState } from 'react';
import {
  Lightbulb,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  ListChecks,
  Printer,
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  Sigma,
  Dumbbell,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MathRenderer from '@/components/MathRenderer';
import PageShell from '@/components/PageShell';
import ExplainersCheatsheet from '@/components/print/ExplainersCheatsheet';
import { EXPLAINER_TOPICS, groupExplainersByBucket, type ExplainerTopic } from '@/data/explainers';
import { PRACTICE_TOPICS } from '@/data/practice-topics';
import { practiceLinksFor } from '@/data/topic-practice-links';
import { cn } from '@/lib/utils';

export default function ExplainerPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // ?topic=lhopital 之类的深链；?tag=概率 表示只看某个分支
  const activeId = params.get('topic');
  const tagFilter = params.get('tag');

  const scopedTopics = tagFilter
    ? EXPLAINER_TOPICS.filter((t) => t.tag === tagFilter)
    : EXPLAINER_TOPICS;

  const topic: ExplainerTopic =
    scopedTopics.find((t) => t.id === activeId) ?? scopedTopics[0] ?? EXPLAINER_TOPICS[0];

  const handleSelect = (id: string) =>
    setParams(tagFilter ? { topic: id, tag: tagFilter } : { topic: id }, { replace: true });

  const clearTagFilter = () => setParams({}, { replace: true });

  const practiceLinks = practiceLinksFor(topic);

  // 44 条平铺已经不好找，改成「搜索 + 按标签分组折叠」
  const [query, setQuery] = useState('');
  const [openTags, setOpenTags] = useState<Record<string, boolean>>({});
  const [levelFilter, setLevelFilter] = useState<'全部' | '基础' | '进阶' | '竞赛'>('全部');

  const groups = useMemo(() => groupExplainersByBucket(), []);
  const visibleGroups = useMemo(() => {
    const q = query.trim();
    let result = groups;
    if (tagFilter) {
      result = result
        .map((g) => ({ tag: g.tag, items: g.items.filter((t) => t.tag === tagFilter) }))
        .filter((g) => g.items.length > 0);
    }
    if (levelFilter !== '全部') {
      result = result
        .map((g) => ({ tag: g.tag, items: g.items.filter((t) => t.level === levelFilter) }))
        .filter((g) => g.items.length > 0);
    }
    if (!q) return result;
    return result
      .map((g) => ({
        tag: g.tag,
        items: g.items.filter(
          (t) => t.title.includes(q) || t.tag.includes(q) || t.essence.includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query, tagFilter, levelFilter]);

  const toggleTag = (tag: string) =>
    setOpenTags((prev) => ({ ...prev, [tag]: !prev[tag] }));

  // 章节快捷导航：只显示当前考点实际有的板块，点击平滑滚动到对应卡片
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const sectionNav: { id: string; label: string; Icon: typeof Lightbulb; show: boolean }[] = [
    { id: 'explainer-essence', label: '本质', Icon: Lightbulb, show: true },
    { id: 'explainer-definition', label: '定义', Icon: BookOpen, show: Boolean(topic.definition) },
    {
      id: 'explainer-theorems',
      label: '定理',
      Icon: Sigma,
      show: Boolean(topic.theorems && topic.theorems.length > 0),
    },
    { id: 'explainer-when', label: '何时用', Icon: CheckCircle2, show: true },
    { id: 'explainer-steps', label: '步骤', Icon: ListChecks, show: true },
    { id: 'explainer-example', label: '例题', Icon: GraduationCap, show: true },
    {
      id: 'explainer-pitfalls',
      label: '易错',
      Icon: AlertTriangle,
      show: Boolean(topic.pitfalls && topic.pitfalls.length > 0),
    },
    {
      id: 'explainer-practice',
      label: '练习',
      Icon: Dumbbell,
      show: practiceLinks.length > 0,
    },
  ].filter((s) => s.show);

  // 打印小抄：先挂载打印版，再唤起打印对话框
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    if (!printing) return;
    const timer = window.setTimeout(() => window.print(), 80);
    const reset = () => setPrinting(false);
    window.addEventListener('afterprint', reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', reset);
    };
  }, [printing]);

  return (
    <>
    <PageShell
      title="原理讲解"
      description="数竞高频考点拆解：一句话本质、什么时候用、完整例子"
      width="wide"
      back
      className={printing ? 'print:hidden' : undefined}
      actions={
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPrinting(true)}>
          <Printer className="h-4 w-4" /> 打印小抄
        </Button>
      }
    >

      <div className="flex flex-col gap-5 md:flex-row">
        {/* 左侧：搜索 + 按标签折叠 */}
        <aside className="md:w-64 md:shrink-0">
          <div className="space-y-3 md:sticky md:top-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索考点…"
                className="w-full rounded-lg border border-border bg-card py-2 pl-8 pr-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {(['全部', '基础', '进阶', '竞赛'] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLevelFilter(lv)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                    levelFilter === lv
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  {lv}
                </button>
              ))}
            </div>

            {tagFilter && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  只看：{tagFilter}
                </Badge>
                <button
                  onClick={clearTagFilter}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  显示全部
                </button>
              </div>
            )}

            {/* 手机上只让分组列表滚动，搜索框始终可见 */}
            <div className="max-h-[42vh] space-y-1.5 overflow-y-auto pr-1 md:max-h-none md:overflow-visible">
              {visibleGroups.map((g) => {
                // 搜索时全部展开；否则展开用户点开的和当前考点所在的分组
                const isOpen = Boolean(query.trim()) || !!openTags[g.tag] || g.tag === topic.tag;
                return (
                  <div
                    key={g.tag}
                    className="overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <button
                      onClick={() => toggleTag(g.tag)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                    >
                      <span className="text-sm font-medium text-foreground">{g.tag}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {g.items.length}
                        {isOpen ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="space-y-0.5 px-1.5 pb-1.5">
                        {g.items.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handleSelect(t.id)}
                            className={cn(
                              'block w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                              t.id === topic.id
                                ? 'bg-primary/10 font-medium text-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                          >
                            <span className="flex items-center justify-between gap-1">
                              <span className="truncate">{t.title.replace(/：.*$/, '')}</span>
                              <span
                                className={cn(
                                  'shrink-0 text-[10px]',
                                  t.level === '竞赛'
                                    ? 'text-rose-500'
                                    : t.level === '进阶'
                                      ? 'text-amber-500'
                                      : 'text-muted-foreground/70'
                                )}
                              >
                                {t.level}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {visibleGroups.length === 0 && (
                <p className="px-1 text-xs text-muted-foreground">没有匹配的考点</p>
              )}
            </div>
          </div>
        </aside>

        {/* 右侧讲解内容 */}
        <main className="min-w-0 flex-1 space-y-4">
          {/* 当前考点标题 */}
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">{topic.title}</h2>
            <Badge
              variant={topic.level === '竞赛' ? 'destructive' : 'secondary'}
              className="text-[10px]"
            >
              {topic.level}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {topic.tag}
            </Badge>
          </div>

          {/* 章节快捷导航：这条考点讲了哪些板块，点击直达 */}
          <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
            {sectionNav.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <s.Icon className="h-3 w-3" />
                {s.label}
              </button>
            ))}
          </div>

          {/* 本质 */}
          <Card id="explainer-essence" className="scroll-mt-20 border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-primary">一句话本质</div>
                  <p className="mt-1 text-[15px] leading-relaxed text-foreground">{topic.essence}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 严格定义 */}
          {topic.definition && (
            <Card id="explainer-definition" className="scroll-mt-20">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">严格定义</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{topic.definition}</p>
              </CardContent>
            </Card>
          )}

          {/* 定理与公式 */}
          {topic.theorems && topic.theorems.length > 0 && (
            <Card id="explainer-theorems" className="scroll-mt-20">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Sigma className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">定理与公式</span>
                </div>
                <div className="space-y-3">
                  {topic.theorems.map((t, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-border/60 border-l-2 border-l-primary p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-medium text-primary">
                          T{i + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">{t.name}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{t.statement}</p>
                      {t.formula && (
                        <div className="mt-2 overflow-x-auto rounded bg-muted/50 p-2">
                          <MathRenderer expression={t.formula} displayMode />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 什么时候用 */}
          <Card id="explainer-when" className="scroll-mt-20">
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

          {/* 步骤：纵向时间轴，连起来的才是路线 */}
          <Card id="explainer-steps" className="scroll-mt-20">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">解题步骤</span>
                <span className="text-xs text-muted-foreground">{topic.steps.length} 步</span>
              </div>
              <div className="relative space-y-4">
                <div className="absolute bottom-3 left-3 top-3 w-px bg-border" aria-hidden />
                {topic.steps.map((s, i) => (
                  <div key={i} className="relative flex gap-3">
                    <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-card bg-primary text-xs font-semibold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
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
          <Card id="explainer-example" className="scroll-mt-20">
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

          {/* 更多例题 */}
          {topic.moreExamples && topic.moreExamples.length > 0 && (
            <Card id="explainer-more" className="scroll-mt-20">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">更多例题</span>
                  <span className="text-xs text-muted-foreground">{topic.moreExamples.length} 道</span>
                </div>
                {topic.moreExamples.map((e2, i) => (
                  <div key={i} className="border-t border-border/60 pt-4 first:border-0 first:pt-0">
                    <p className="mb-2 rounded-md bg-muted/50 p-3 text-sm">{e2.problem}</p>
                    <ul className="space-y-1.5">
                      {e2.walkthrough.map((w, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {w}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 overflow-x-auto rounded-md bg-primary/10 p-3">
                      <MathRenderer expression={e2.result} displayMode />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 易错点 */}
          {topic.pitfalls && topic.pitfalls.length > 0 && (
            <Card id="explainer-pitfalls" className="scroll-mt-20 border-red-500/30">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold">易错点</span>
                  <span className="text-xs text-muted-foreground">{topic.pitfalls.length} 条</span>
                </div>
                <ul className="space-y-1.5">
                  {topic.pitfalls.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 配套练习 */}
          {practiceLinks.length > 0 && (
            <Card id="explainer-practice" className="scroll-mt-20 border-primary/20 bg-primary/5">
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  看完去练几道
                </div>
                <div className="flex flex-wrap gap-2">
                  {practiceLinks.map((key) => {
                    const pt = PRACTICE_TOPICS.find((t) => t.key === key);
                    if (!pt) return null;
                    return (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => navigate('/practice?topic=' + key + '&from=' + topic.id)}
                      >
                        {pt.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </PageShell>
    {printing && <ExplainersCheatsheet />}
    </>
  );
}
