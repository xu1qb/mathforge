import { Fragment, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Flag,
  GitBranch,
  ListChecks,
  Play,
  Printer,
  XCircle,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MathRenderer from '@/components/MathRenderer';
import PageShell from '@/components/PageShell';
import { FLOW_CHARTS, getFlowChart, flowPracticeTopics, type FlowKind } from '@/data/flows';
import { PRACTICE_TOPICS } from '@/data/practice-topics';
import { cn } from '@/lib/utils';

const KIND_STYLE: Record<FlowKind, string> = {
  start: 'border-primary bg-primary/10',
  decision: 'border-amber-500/60 bg-amber-500/10',
  process: 'border-border bg-card',
  warn: 'border-red-500/60 bg-red-500/10',
  end: 'border-emerald-500/60 bg-emerald-500/10',
};

/** 每个节点类型左侧的色条（token 色，不用渐变） */
const KIND_BAR: Record<FlowKind, string> = {
  start: 'bg-primary',
  decision: 'bg-amber-500',
  process: 'bg-border',
  warn: 'bg-red-500',
  end: 'bg-emerald-500',
};

const KIND_LABEL: Record<FlowKind, string> = {
  start: '起点',
  decision: '判断',
  process: '步骤',
  warn: '易错',
  end: '结论',
};

const KIND_ICON: Record<FlowKind, typeof Play> = {
  start: Play,
  decision: GitBranch,
  process: ListChecks,
  warn: AlertTriangle,
  end: Flag,
};

/** 图例用的小圆点颜色 */
const KIND_DOT: Record<FlowKind, string> = {
  start: 'bg-primary',
  decision: 'bg-amber-500',
  process: 'bg-border',
  warn: 'bg-red-500',
  end: 'bg-emerald-500',
};

const KIND_ORDER: FlowKind[] = ['start', 'decision', 'process', 'warn', 'end'];

/** 题型切换条：手机上横向滚动，桌面上整排铺开 */
function ChartPicker({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="-mx-4 mb-5 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
      <div className="flex w-max gap-2 md:w-full md:flex-wrap">
        {FLOW_CHARTS.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              'shrink-0 rounded-lg border px-3 py-2 text-sm transition-colors',
              c.id === activeId
                ? 'border-primary bg-primary/10 font-medium text-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-accent'
            )}
          >
            {c.title}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 节点类型图例：一眼看懂五种节点颜色 */
function KindLegend() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">图例</span>
      {KIND_ORDER.map((k) => {
        const Icon = KIND_ICON[k];
        return (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-full', KIND_DOT[k])} />
            <Icon className="h-3 w-3" />
            {KIND_LABEL[k]}
          </span>
        );
      })}
    </div>
  );
}

/** 打印专用的紧凑版：不带交互、不带箭头，每张图一页 */
function PrintableCharts() {
  return (
    <div className="hidden print:block">
      {FLOW_CHARTS.map((c) => (
        <section key={c.id} className="print-page flow-print-section">
          <h2 className="flow-print-title text-base font-bold">{c.title}</h2>
          <p className="mt-1 text-xs">{c.subtitle}</p>
          <p className="mt-2 border-l-2 border-gray-400 pl-2 text-xs">
            数竞提醒：{c.examNote}
          </p>
          <div className="mt-3 space-y-2">
            {c.nodes.map((n, i) => (
              <div key={n.id} className="flow-node border border-gray-400 px-3 py-2">
                <div className="text-sm font-medium">
                  {i + 1}. {n.title}
                  <span className="ml-2 text-xs font-normal">[{KIND_LABEL[n.kind]}]</span>
                </div>
                <div className="mt-0.5 text-xs">{n.desc}</div>
                {n.formula && (
                  <div className="mt-1 overflow-x-auto text-xs">
                    <MathRenderer expression={n.formula} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function FlowPage() {
  const [params, setParams] = useSearchParams();

  // ?chart=limit 之类的深链，来自竞赛专区的入口；非法 id 自动回落到第一张
  const chart = getFlowChart(params.get('chart') ?? FLOW_CHARTS[0].id);
  const handleSelect = (id: string) => setParams({ chart: id }, { replace: true });

  // 打印范围：null 表示不在打印流程里
  const [printScope, setPrintScope] = useState<'current' | 'all' | null>(null);
  useEffect(() => {
    if (!printScope) return;
    // 等 React 把打印版渲染完再唤起打印对话框
    const timer = window.setTimeout(() => window.print(), 80);
    const reset = () => setPrintScope(null);
    window.addEventListener('afterprint', reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', reset);
    };
  }, [printScope]);

  const jumpToNode = (i: number) => {
    document
      .getElementById('flow-node-' + i)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <PageShell
      title="解题流程图"
      description="按题型给思路，考前可以一键打印成 A4"
      width="reading"
      back
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPrintScope('current')}
          >
            <Printer className="h-4 w-4" /> 打印本张
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPrintScope('all')}
          >
            <Printer className="h-4 w-4" /> 打印全部
          </Button>
        </>
      }
    >

      {/* 屏幕上看到的交互版；打印“全部”时整块隐藏 */}
      <div className={printScope === 'all' ? 'print:hidden' : undefined}>
        <ChartPicker activeId={chart.id} onSelect={handleSelect} />

        {/* 这张图解决什么问题 */}
        <Card className="mb-5">
          <CardContent className="p-5">
            <div className="text-sm font-semibold">{chart.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{chart.subtitle}</p>
            <p className="mt-3 rounded-md bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">数竞提醒：</span>
              {chart.examNote}
            </p>

            {/* 这张图对应的练习题：点进去直接刷同类题 */}
            {(() => {
              const keys = flowPracticeTopics(chart.id);
              if (keys.length === 0) return null;
              return (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">配套练习：</span>
                  {keys.map((key) => {
                    const topic = PRACTICE_TOPICS.find((t) => t.key === key);
                    return (
                      <Link
                        key={key}
                        to={'/practice?topic=' + key}
                        className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {topic?.label ?? key}
                      </Link>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <KindLegend />

        {/* 路线总览：整条思路的迷你地图，点击直达对应节点 */}
        <div className="mb-5 overflow-x-auto rounded-xl border border-border/60 bg-card p-3">
          <div className="flex w-max items-start gap-0.5">
            {chart.nodes.map((n, i) => {
              const Icon = KIND_ICON[n.kind];
              return (
                <Fragment key={n.id}>
                  {i > 0 && <div className="mt-3 h-px w-4 shrink-0 bg-border" />}
                  <button
                    onClick={() => jumpToNode(i)}
                    title={'第 ' + (i + 1) + ' 步 · ' + n.title}
                    className="group flex w-16 flex-col items-center gap-1"
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-medium transition-colors',
                        n.kind === 'warn' && 'border-red-500/60 bg-red-500/10 text-foreground',
                        n.kind === 'decision' && 'border-amber-500/60 bg-amber-500/10 text-foreground',
                        n.kind === 'end' && 'border-emerald-500/60 bg-emerald-500/10 text-foreground',
                        n.kind === 'start' && 'border-primary bg-primary text-primary-foreground',
                        n.kind === 'process' && 'border-border bg-muted/40 text-muted-foreground group-hover:border-primary/50 group-hover:text-foreground'
                      )}
                    >
                      {n.kind === 'warn' || n.kind === 'decision' ? (
                        <Icon className="h-3.5 w-3.5" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="w-full truncate text-center text-[11px] leading-tight text-muted-foreground group-hover:text-foreground">
                      {n.title}
                    </span>
                  </button>
                </Fragment>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center">
          {chart.nodes.map((n, i) => {
            const Icon = KIND_ICON[n.kind];
            return (
              <div key={n.id} id={'flow-node-' + i} className="flex w-full scroll-mt-24 flex-col items-center">
                <Card className={cn('flow-node relative w-full border-2', KIND_STYLE[n.kind])}>
                  {/* 左侧类型色条 */}
                  <span
                    className={cn('absolute left-0 top-3 bottom-3 w-1 rounded-r-full', KIND_BAR[n.kind])}
                    aria-hidden
                  />
                  <CardContent className="p-4 pl-5">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                          n.kind === 'warn' || n.kind === 'end'
                            ? 'bg-background text-foreground'
                            : 'bg-primary text-primary-foreground'
                        )}
                      >
                        {n.kind === 'decision' ? <GitBranch className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{n.title}</span>
                          {n.tag && (
                            <Badge variant="outline" className="text-xs">
                              {n.tag}
                            </Badge>
                          )}
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]',
                              n.kind === 'warn'
                                ? 'bg-red-500/10 text-foreground'
                                : n.kind === 'end'
                                  ? 'bg-emerald-500/10 text-foreground'
                                  : n.kind === 'decision'
                                    ? 'bg-amber-500/10 text-foreground'
                                    : 'bg-muted/60 text-muted-foreground'
                            )}
                          >
                            <Icon className="h-3 w-3" />
                            {KIND_LABEL[n.kind]}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{n.desc}</p>
                        {n.formula && (
                          <div className="mt-2 overflow-x-auto rounded-md bg-background/60 p-2">
                            <MathRenderer expression={n.formula} displayMode />
                          </div>
                        )}
                        {/* 判断节点的分支出口：可视化“分岔” */}
                        {n.kind === 'decision' && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              对上号 → 沿这条路走
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-xs text-foreground">
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                              对不上 → 退回换一条路
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {i < chart.nodes.length - 1 && (
                  <div className="flex flex-col items-center py-0.5">
                    <div className="h-4 w-px bg-border" />
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    <div className="h-4 w-px bg-border" />
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <XCircle className="h-3.5 w-3.5 text-red-500" />
            条件不满足就退回上一步换方法
            <ArrowRight className="h-3.5 w-3.5" />
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            满足就往下走
          </div>
        </div>
      </div>

      {/* 只在“打印全部”时挂载，避免平时多渲染一份 */}
      {printScope === 'all' && <PrintableCharts />}
    </PageShell>
  );
}
