// EXPORTS: CoursePage
// 课程页：/course/:subject 课程首页，/course/:subject/:chapterId 展开某章
// 结构：课程信息 → 学科介绍 → 章节树（知识点 + 练习） → 应用 → 交叉

import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Target,
  Clock,
  ChevronRight,
  Wrench,
  Compass,
  Network,
  ListTree,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageShell from '@/components/PageShell';
import RichMath from '@/components/RichMath';
import { getCourse } from '@/data/courses';
import { EXPLAINER_TOPICS } from '@/data/explainers';
import { cn } from '@/lib/utils';

export default function CoursePage() {
  const { subject, chapterId } = useParams();
  const navigate = useNavigate();
  const course = getCourse(subject);

  const lessons = useMemo(() => {
    const map = new Map(EXPLAINER_TOPICS.map((t) => [t.id, t]));
    return map;
  }, []);

  if (!course) {
    return (
      <PageShell title="课程不存在" description="这个学科还没有课程包" width="reading" back>
        <Button variant="outline" onClick={() => navigate('/branches')}>
          去学科总览看看
        </Button>
      </PageShell>
    );
  }

  const activeChapter = chapterId ? course.chapters.find((c) => c.id === chapterId) : undefined;
  const totalLessons = course.chapters.reduce((n, c) => n + c.lessonIds.length, 0);
  const totalExercises = course.chapters.reduce((n, c) => n + c.exercises.length, 0);

  // 从目录点进来时，滚动到对应章节
  const chapterRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    if (!activeChapter) return;
    const el = chapterRefs.current[activeChapter.id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeChapter]);

  return (
    <PageShell
      title={course.title}
      eyebrow="课程"
      description={course.tagline}
      width="wide"
      back
      actions={
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(course.toolPath)}>
          <Wrench className="size-4" />
          <span className="hidden sm:inline">打开工具箱</span>
        </Button>
      }
    >
      <div className="space-y-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
        {/* 左侧章节目录（宽屏粘性） */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ListTree className="size-3.5" />
              目录
            </div>
            <nav className="space-y-0.5">
              {course.chapters.map((ch, i) => {
                const isActive = activeChapter?.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => navigate('/course/' + course.id + '/' + ch.id)}
                    className={cn(
                      'flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                      isActive
                        ? 'bg-primary/10 font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-[10px] opacity-70">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate">{ch.title}</span>
                      <span className="block text-[10px] opacity-70">
                        {ch.lessonIds.length} 知识点 · {ch.exercises.length} 题
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="rounded-md border border-border/60 p-2 text-[11px] text-muted-foreground">
              共 {course.chapters.length} 章 · {totalLessons} 知识点 · {totalExercises} 题
            </div>
          </div>
        </aside>

        <div className="space-y-6">
        {/* 课程信息 */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: BookOpen, label: '教材', value: course.textbook.name + ' · ' + course.textbook.edition },
            { icon: Clock, label: '预计学时', value: course.hours + ' 小时' },
            { icon: GraduationCap, label: '章节', value: course.chapters.length + ' 章' },
            { icon: Target, label: '知识点', value: totalLessons + ' 个' },
          ].map((item) => (
            <Card key={item.label} className="border-border/60">
              <CardContent className="flex items-start gap-2.5 p-3">
                <item.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="truncate text-sm font-medium text-foreground">{item.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 教材对照 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-primary" />
              教材对照
            </CardTitle>
            <CardDescription className="text-xs">
              {course.textbook.name}（{course.textbook.edition}）· 下表可对照纸质书使用
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {course.chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => navigate('/course/' + course.id + '/' + ch.id)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent/60"
                >
                  <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">{i + 1}</span>
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">{ch.textbookRef}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{ch.title}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {ch.lessonIds.length} 知识点 · {ch.exercises.length} 题
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 学科介绍 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Compass className="size-4 text-primary" />
              这门课在讲什么
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{course.intro.what}</p>

            <div>
              <div className="mb-1.5 text-xs font-medium text-foreground">核心对象</div>
              <div className="flex flex-wrap gap-1.5">
                {course.intro.objects.map((o) => (
                  <Badge key={o} variant="secondary" className="text-xs font-normal">
                    {o}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-foreground">发展脉络</div>
              <ul className="space-y-1">
                {course.intro.history.map((h) => (
                  <li key={h} className="flex gap-2 text-xs text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>先修：</span>
              {course.prerequisites.map((p) => (
                <Badge key={p} variant="outline" className="text-[10px] font-normal">
                  {p}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 章节树 */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">章节</h2>
          <div className="space-y-2">
            {course.chapters.map((ch, idx) => {
              const isActive = activeChapter?.id === ch.id;
              return (
                <Card
                  key={ch.id}
                  ref={(el) => {
                    chapterRefs.current[ch.id] = el;
                  }}
                  className={cn(
                    'scroll-mt-4 border-border/60 transition-colors',
                    isActive && 'border-primary/50'
                  )}
                >
                  <CardContent className="p-0">
                    <button
                      onClick={() => navigate('/course/' + course.id + '/' + ch.id)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{ch.title}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {ch.textbookRef}
                          </Badge>
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          <RichMath text={ch.summary} />
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                          {ch.lessonIds.length} 个知识点 · {ch.exercises.length} 道题
                        </div>
                      </div>
                      <ChevronRight
                        className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isActive && 'rotate-90')}
                      />
                    </button>

                    {isActive && (
                      <div className="space-y-3 border-t border-border/60 p-4">
                        <div>
                          <div className="mb-1 text-xs font-medium text-foreground">学完能做到</div>
                          <ul className="space-y-0.5">
                            {ch.goals.map((g) => (
                              <li key={g} className="flex gap-2 text-xs text-muted-foreground">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="mb-1.5 text-xs font-medium text-foreground">知识点</div>
                          <div className="flex flex-wrap gap-1.5">
                            {ch.lessonIds.map((id) => {
                              const t = lessons.get(id);
                              if (!t) return null;
                              return (
                                <button
                                  key={id}
                                  onClick={() => navigate('/explainer?topic=' + id)}
                                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-left text-xs transition-colors hover:border-primary/40 hover:bg-accent"
                                >
                                  <span>{t.title}</span>
                                  <span className="text-[10px] text-muted-foreground">{t.level}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <div className="mb-1.5 text-xs font-medium text-foreground">
                            本章练习（{ch.exercises.length} 题，点开看解答）
                          </div>
                          <div className="space-y-2">
                            {ch.exercises.map((ex, i) => (
                              <details
                                key={ex.id}
                                className="rounded-lg border border-border bg-card px-3 py-2"
                              >
                                <summary className="flex cursor-pointer items-start gap-2 text-xs">
                                  <span className="mt-0.5 shrink-0 font-mono text-muted-foreground">
                                    {i + 1}.
                                  </span>
                                  <span className="flex-1 text-foreground">
                                    <RichMath text={ex.question} />
                                  </span>
                                  <span
                                    className={cn(
                                      'shrink-0 text-[10px]',
                                      ex.level === '竞赛'
                                        ? 'text-rose-500'
                                        : ex.level === '进阶'
                                          ? 'text-amber-500'
                                          : 'text-muted-foreground/70'
                                    )}
                                  >
                                    {ex.level}
                                  </span>
                                </summary>
                                <div className="mt-2 space-y-1.5 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                                  {ex.hint && (
                                    <div>
                                      <span className="font-medium text-foreground">思路：</span>
                                      <RichMath text={ex.hint} />
                                    </div>
                                  )}
                                  <ol className="space-y-1">
                                    {ex.steps.map((s, k) => (
                                      <li key={k}>
                                        {k + 1}. <RichMath text={s} />
                                      </li>
                                    ))}
                                  </ol>
                                  <div className="text-foreground">
                                    <span className="font-medium">答案：</span>
                                    <RichMath text={ex.answer} />
                                  </div>
                                </div>
                              </details>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() =>
                              navigate('/practice?topic=' + (ch.practiceTopics[0] ?? 'matrix-op'))
                            }
                          >
                            <Target className="size-3.5" />
                            本章练习
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(course.toolPath)}
                          >
                            用工具箱算一算
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 应用 */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">应用在哪</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {course.applications.map((a) => (
              <Card key={a.title} className="border-border/60">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-foreground">{a.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    <RichMath text={a.scene} />
                  </div>
                  <div className="mt-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                    <RichMath text={a.example} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 交叉 */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
            <Network className="size-4 text-primary" />
            和其他学科怎么连
          </h2>
          <div className="space-y-2">
            {course.crossings.map((c) => (
              <Card key={c.subject} className="border-border/60">
                <CardContent className="flex items-start gap-3 p-3">
                  <Badge variant="secondary" className="mt-0.5 shrink-0 text-xs">
                    {c.subject}
                  </Badge>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <RichMath text={c.relation} />
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <CardDescription className="text-center text-xs">
          本课程按「同济大学《线性代数》第七版」章节组织，讲解与例题为原创内容
        </CardDescription>
        </div>
      </div>
    </PageShell>
  );
}
