// EXPORTS: BranchPage
// 分支页：/branch/:id 列出该分支下的课程（已建 / 待建）

import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, GraduationCap, ArrowRight, Clock } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBranch, BRANCHES } from '@/data/catalog';
import { getCourse } from '@/data/courses';
import { cn } from '@/lib/utils';

export default function BranchPage() {
  const { id } = useParams<{ id: string }>();
  const branch = useMemo(() => getBranch(id), [id]);

  if (!branch) {
    return (
      <PageShell title="分支不存在" description="请从左侧学科目录重新选择" back>
        <div className="space-y-2">
          {BRANCHES.map((b) => (
            <Link key={b.id} to={'/branch/' + b.id} className="block text-sm text-primary hover:underline">
              {b.name}
            </Link>
          ))}
        </div>
      </PageShell>
    );
  }

  const ready = branch.courses.filter((c) => c.courseId && getCourse(c.courseId)).length;

  return (
    <PageShell
      title={branch.name}
      description={branch.summary + ' · ' + branch.en}
      back
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">{branch.courses.length} 门课程</Badge>
        <Badge variant="outline">{ready} 门已建</Badge>
        <span>{branch.courses.length - ready} 门待补</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {branch.courses.map((c) => {
          const course = c.courseId ? getCourse(c.courseId) : undefined;
          const inner = (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {course ? (
                    <GraduationCap className="h-4 w-4 text-primary" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={cn('text-sm font-medium', !course && 'text-muted-foreground')}>
                    {c.name}
                  </span>
                </div>
                {course ? (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Badge variant="outline" className="shrink-0 text-[10px]">待补</Badge>
                )}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {course ? course.tagline : c.note ?? '内容建设中'}
              </p>
              {course && (
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  {course.chapters.length} 章 ·{' '}
                  {course.chapters.reduce((a, ch) => a + ch.lessonIds.length, 0)} 讲
                </p>
              )}
            </>
          );

          return course ? (
            <Link key={c.id} to={'/course/' + course.id}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="p-4">{inner}</CardContent>
              </Card>
            </Link>
          ) : (
            <Card key={c.id} className="h-full border-dashed">
              <CardContent className="p-4">{inner}</CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> 分支与课程按参考视频的十分类组织</span>
      </div>
    </PageShell>
  );
}
