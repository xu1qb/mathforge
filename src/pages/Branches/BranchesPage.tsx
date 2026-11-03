// EXPORTS: BranchesPage
// 学科总览：11 个大类 × 全部分支，显示覆盖状态（有页面 / 仅考点 / 待补）

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Circle, CircleDot, CircleSlash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PageShell from '@/components/PageShell';
import { Badge } from '@/components/ui/badge';
import { BRANCH_CATEGORIES, branchStatus, type Branch } from '@/data/branches';
import { EXPLAINER_TOPICS } from '@/data/explainers';
import { cn } from '@/lib/utils';

const ACCENT: Record<string, string> = {
  amber: 'text-amber-600',
  sky: 'text-sky-600',
  rose: 'text-rose-600',
  violet: 'text-violet-600',
  emerald: 'text-emerald-600',
  teal: 'text-teal-600',
  cyan: 'text-cyan-600',
  orange: 'text-orange-600',
  slate: 'text-slate-500',
  pink: 'text-pink-600',
  yellow: 'text-yellow-600',
};

export default function BranchesPage() {
  const navigate = useNavigate();

  const topicTags = useMemo(
    () => new Set(EXPLAINER_TOPICS.map((t) => t.tag)),
    []
  );

  const stats = useMemo(() => {
    let page = 0;
    let topic = 0;
    let empty = 0;
    for (const c of BRANCH_CATEGORIES) {
      for (const b of c.branches) {
        const s = branchStatus(b, topicTags);
        if (s === 'page') page += 1;
        else if (s === 'topic') topic += 1;
        else empty += 1;
      }
    }
    return { page, topic, empty, total: page + topic + empty };
  }, [topicTags]);

  const openBranch = (b: Branch, status: ReturnType<typeof branchStatus>) => {
    if (status === 'page' && b.pagePath) navigate(b.pagePath);
    else if (status === 'topic' && b.tags && b.tags.length > 0) {
      navigate('/explainer?tag=' + encodeURIComponent(b.tags[0]));
    }
  };

  return (
    <PageShell
      title="学科总览"
      description="按 11 个大类浏览全部分支，看得见边界，也看得见还没做的部分"
      width="wide"
      back
    >

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: '大类', value: BRANCH_CATEGORIES.length, icon: BookOpen },
          { label: '分支总数', value: stats.total, icon: Circle },
          { label: '已有页面', value: stats.page, icon: CircleDot },
          { label: '待补', value: stats.empty, icon: CircleSlash },
        ].map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className="size-5 text-muted-foreground" />
              <div>
                <div className="text-xl font-semibold tabular-nums">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        {BRANCH_CATEGORIES.map((cat) => {
          const pageCount = cat.branches.filter((b) => branchStatus(b, topicTags) === 'page').length;
          return (
            <section key={cat.id}>
              <div className="mb-3 flex flex-wrap items-baseline gap-2">
                <h2 className={cn('text-base font-semibold', ACCENT[cat.accent] ?? '')}>{cat.zh}</h2>
                <span className="text-xs text-muted-foreground">{cat.en}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {cat.branches.length} 个分支 · {pageCount} 个有页面
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cat.branches.map((b) => {
                  const status = branchStatus(b, topicTags);
                  const clickable = status !== 'empty';
                  return (
                    <div
                      key={b.id}
                      role={clickable ? 'button' : undefined}
                      tabIndex={clickable ? 0 : undefined}
                      onClick={() => clickable && openBranch(b, status)}
                      onKeyDown={(e) => {
                        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          openBranch(b, status);
                        }
                      }}
                      className={cn(
                        'flex items-start justify-between gap-3 rounded-xl border p-3 text-left transition-colors',
                        clickable
                          ? 'border-border bg-card hover:border-primary/40 hover:bg-accent'
                          : 'cursor-default border-dashed border-border/60 bg-muted/20'
                      )}
                    >
                      <div className="min-w-0">
                        <div
                          className={cn(
                            'text-sm font-medium',
                            clickable ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {b.zh}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{b.en}</div>
                        {b.note && (
                          <div className="mt-1 text-[11px] text-muted-foreground/70">{b.note}</div>
                        )}
                      </div>
                      <Badge
                        variant={status === 'page' ? 'default' : status === 'topic' ? 'secondary' : 'outline'}
                        className="shrink-0 text-[10px]"
                      >
                        {status === 'page' ? '页面' : status === 'topic' ? '考点' : '待补'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
