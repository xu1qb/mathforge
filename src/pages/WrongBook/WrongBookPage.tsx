// EXPORTS: WrongBookPage
// 错题本：待复习 / 待重做 / 已掌握，按知识点筛选，支持"记住了/还是不会"推进复习阶段

import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import ProblemText from '@/components/ProblemText';
import MathInputField from '@/components/MathInputField';
import { checkPracticeAnswer } from '@/lib/math-practice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useWrongBook,
  REVIEW_STAGE_LABELS,
  WRONG_REASON_LABELS,
  type WrongItem,
  type WrongReason,
} from '@/hooks/use-learning';
import { topicLabelOf } from '@/lib/topic-label';
import { AlertTriangle, CheckCircle2, RotateCcw, Sparkles, Trash2, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'due' | 'pending' | 'mastered';


export default function WrongBookPage() {
  const navigate = useNavigate();
  const {
    dueToday,
    pending,
    trulyMastered,
    markReviewRemembered,
    markReviewForgotten,
    markMastered,
    removeItem,
    incrementRetry,
  } = useWrongBook();
  const [tab, setTab] = useState<Tab>('due');
  const [topic, setTopic] = useState('all');

  // 从学习报告错因图下钻：/wrong-book?reason=concept
  const [searchParams, setSearchParams] = useSearchParams();
  const reasonParam = searchParams.get('reason') as WrongReason | null;
  const reasonFilter = reasonParam && reasonParam in WRONG_REASON_LABELS ? reasonParam : null;
  const clearReason = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('reason');
    setSearchParams(next, { replace: true });
  };

  const list = tab === 'due' ? dueToday : tab === 'pending' ? pending : trulyMastered;
  const filtered = useMemo(
    () =>
      list
        .filter((w) => (topic === 'all' ? true : w.topicKey === topic))
        .filter((w) => (reasonFilter ? w.wrongReason === reasonFilter : true)),
    [list, topic, reasonFilter],
  );
  const topics = useMemo(() => {
    const set = new Map<string, number>();
    for (const w of list) set.set(w.topicKey, (set.get(w.topicKey) ?? 0) + 1);
    return [...set.entries()].sort((a, b) => b[1] - a[1]);
  }, [list]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'due', label: '今日复习', count: dueToday.length },
    { key: 'pending', label: '待重做', count: pending.length },
    { key: 'mastered', label: '已掌握', count: trulyMastered.length },
  ];

  return (
    <PageShell
      title="错题本"
      description="做错的题自动收录，按遗忘曲线安排复习；答对两次才算真正掌握"
      width="tool"
      back
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setTopic('all');
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm transition-colors',
                tab === t.key
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted/60',
              )}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-70">{t.count}</span>
            </button>
          ))}
        </div>

        {reasonFilter && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearReason}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-foreground transition-colors hover:bg-primary/15"
            >
              只看错因：{WRONG_REASON_LABELS[reasonFilter]}
              <X className="size-3" />
            </button>
          </div>
        )}

        {topics.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setTopic('all')}
              className={cn(
                'rounded-md border px-2 py-1 text-xs',
                topic === 'all' ? 'border-primary text-foreground' : 'border-border text-muted-foreground',
              )}
            >
              全部知识点
            </button>
            {topics.map(([key, count]) => (
              <button
                key={key}
                onClick={() => setTopic(key)}
                className={cn(
                  'rounded-md border px-2 py-1 text-xs',
                  topic === key ? 'border-primary text-foreground' : 'border-border text-muted-foreground',
                )}
              >
                {topicLabelOf(key)}
                <span className="ml-1 opacity-60">{count}</span>
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <BookOpen className="size-8 opacity-40" />
              {reasonFilter
                ? '没有该错因的错题，换个错因或清除筛选看看'
                : tab === 'due'
                ? '今天没有到期的错题，去练几道新题吧'
                : tab === 'pending'
                  ? '没有待重做的错题'
                  : '还没有已掌握的错题'}
              <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/practice')}>
                去练习
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((w) => (
              <WrongCard
                key={w.id}
                item={w}
                masteredView={tab === 'mastered'}
                onRemembered={() => markReviewRemembered(w.id)}
                onForgotten={() => markReviewForgotten(w.id)}
                onRetry={(correct) => incrementRetry(w.id, correct)}
                onMastered={() => markMastered(w.id)}
                onRemove={() => removeItem(w.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function WrongCard({
  item,
  masteredView,
  onRemembered,
  onForgotten,
  onRetry,
  onMastered,
  onRemove,
}: {
  item: WrongItem;
  masteredView: boolean;
  onRemembered: () => void;
  onForgotten: () => void;
  onRetry: (correct: boolean) => void;
  onMastered: () => void;
  onRemove: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const days = Math.max(0, Math.ceil((item.nextReviewDate - Date.now()) / 86400000));

  // 真实判分：答对推进复习阶段，答错重置回第一轮
  const handleCheck = () => {
    const r = checkPracticeAnswer(item.question, answer);
    setResult(r);
    onRetry(r.correct);
    if (r.correct) {
      onRemembered();
      setShowAnswer(true);
    } else {
      onForgotten();
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary">{topicLabelOf(item.topicKey, item.question)}</Badge>
          {item.wrongReason && (
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="size-3" />
              {WRONG_REASON_LABELS[item.wrongReason]}
            </Badge>
          )}
          <span className="text-muted-foreground">
            {masteredView ? '已掌握' : REVIEW_STAGE_LABELS[item.reviewStage]}
            {!masteredView && item.reviewStage < 6 && (
              <span className="ml-1 opacity-70">
                （{days === 0 ? '今天' : days + ' 天后'}复习）
              </span>
            )}
          </span>
          <span className="text-muted-foreground">错 {item.retryCount} 次</span>
        </div>

        <ProblemText text={item.question.question} className="text-sm text-foreground" />

        {showAnswer ? (
          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
            <div>
              <span className="text-muted-foreground">你的答案：</span>
              <ProblemText text={item.userAnswer || '（未作答）'} className="inline" />
            </div>
            <div>
              <span className="text-muted-foreground">正确答案：</span>
              <ProblemText text={item.question.answer} className="inline" />
            </div>
            {item.question.steps?.length > 0 && (
              <ol className="space-y-1 text-xs text-muted-foreground">
                {item.question.steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 opacity-60">{i + 1}.</span>
                    <ProblemText text={s} className="min-w-0" />
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setShowAnswer(true)}>
            看答案与解析
          </Button>
        )}

        {!masteredView && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <MathInputField
                  value={answer}
                  onChange={setAnswer}
                  topicKey={item.topicKey}
                  label="重做一遍"
                  placeholder="输入答案，支持 sqrt / pi / ^"
                  showPalette
                  defaultPreview={false}
                  disabled={result?.correct === true}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && answer.trim() && result?.correct !== true) {
                      e.preventDefault();
                      handleCheck();
                    }
                  }}
                />
              </div>
              <Button
                size="sm"
                className="mt-6 shrink-0 gap-1.5"
                onClick={handleCheck}
                disabled={!answer.trim() || result?.correct === true}
              >
                <CheckCircle2 className="size-3.5" /> 检查
              </Button>
            </div>

            {result && (
              <p
                className={cn(
                  'rounded-md px-2 py-1.5 text-xs',
                  result.correct ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600',
                )}
              >
                {result.correct ? '答对了，已推进到下一轮复习' : result.message || '答案不对，再看看解析'}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <button className="text-emerald-600 hover:underline" onClick={onRemembered}>
                想起来了（跳过输入，直接进入下一轮）
              </button>
              <button className="text-muted-foreground hover:underline" onClick={onForgotten}>
                还是不会
              </button>
              <button className="text-muted-foreground hover:underline" onClick={onMastered}>
                标记掌握
              </button>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto gap-1.5 text-muted-foreground hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="size-3.5" /> 删除
              </Button>
            </div>
          </div>
        )}
        {masteredView && (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="size-3.5" /> 删除
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
