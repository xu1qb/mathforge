// EXPORTS: BranchesPage
// 学科总览：学科 → 分支 → 课程 三层，全部对齐参考视频的十分类

import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Clock, ArrowRight, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PageShell from '@/components/PageShell';
import { Badge } from '@/components/ui/badge';
import { DISCIPLINE, BRANCHES } from '@/data/catalog';
import { getCourse } from '@/data/courses';
import { cn } from '@/lib/utils';

export default function BranchesPage() {
  const totalCourses = BRANCHES.reduce((a, b) => a + b.courses.length, 0);
  const readyCourses = BRANCHES.reduce(
    (a, b) => a + b.courses.filter((c) => c.courseId && getCourse(c.courseId)).length,
    0
  );

  return (
    <PageShell
      title="学科总览"
      description={'一个学科 · ' + BRANCHES.length + ' 个分支 · ' + totalCourses + ' 个课程位置'}
      back
    >
      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
            <div>
              <div className="text-base font-semibold">{DISCIPLINE.name}</div>
              <div className="text-xs text-muted-foreground">{DISCIPLINE.en}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary">{BRANCHES.length} 个分支</Badge>
            <Badge variant="outline">{readyCourses} 门已建</Badge>
            <Badge variant="outline">{totalCourses - readyCourses} 门待补</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {BRANCHES.map((b) => {
          const ready = b.courses.filter((c) => c.courseId && getCourse(c.courseId)).length;
          return (
            <Card key={b.id} className="flex h-full flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <Link to={'/branch/' + b.id} className="group flex items-center gap-2">
                    <span className="text-sm font-semibold group-hover:text-primary">{b.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {ready}/{b.courses.length} 已建
                  </span>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{b.summary}</p>

                <div className="mt-auto flex flex-wrap gap-1.5">
                  {b.courses.map((c) => {
                    const course = c.courseId ? getCourse(c.courseId) : undefined;
                    return course ? (
                      <Link key={c.id} to={'/course/' + course.id}>
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] text-primary transition-colors hover:bg-primary/20">
                          <GraduationCap className="h-3 w-3" />
                          {c.name}
                        </span>
                      </Link>
                    ) : (
                      <span
                        key={c.id}
                        className={cn('inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-[11px] text-muted-foreground')}
                      >
                        <Clock className="h-3 w-3" />
                        {c.name}
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        分支与课程按参考视频的十分类组织；虚线框为待补内容，实心标签可直接进入课程。
      </div>
    </PageShell>
  );
}
