import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Printer, XCircle } from 'lucide-react';
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

const KIND_LABEL: Record<FlowKind, string> = {
  start: '起点',
  decision: '判断',
  process: '步骤',
  warn: '易错',
  end: '结论',
};

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

        <div className="flex flex-col items-center">
          {chart.nodes.map((n, i) => (
            <div key={n.id} className="flex w-full flex-col items-center">
              <Card className={cn('flow-node w-full border-2', KIND_STYLE[n.kind])}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{n.title}</span>
                        {n.tag && (
                          <Badge variant="outline" className="text-xs">
                            {n.tag}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{KIND_LABEL[n.kind]}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{n.desc}</p>
                      {n.formula && (
                        <div className="mt-2 overflow-x-auto rounded-md bg-background/60 p-2">
                          <MathRenderer expression={n.formula} displayMode />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {i < chart.nodes.length - 1 && (
                <div className="my-1 flex flex-col items-center">
                  <div className="h-5 w-px bg-border" />
                  <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

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
