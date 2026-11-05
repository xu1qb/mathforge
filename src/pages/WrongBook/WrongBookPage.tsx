// EXPORTS: WrongBookPage
// 错题本：待复习 / 待重做 / 已掌握，按知识点筛选，支持"记住了/还是不会"推进复习阶段

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '@/components/PageShell';
import ProblemText from '@/components/ProblemText';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useWrongBook,
  REVIEW_STAGE_LABELS,
  WRONG_REASON_LABELS,
  type WrongItem,
} from '@/hooks/use-learning';
import { PRACTICE_TOPICS } from '@/data/practice-topics';
import { AlertTriangle, CheckCircle2, RotateCcw, Sparkles, Trash2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'due' | 'pending' | 'mastered';

const TOPIC_LABEL = new Map(PRACTICE_TOPICS.map((t) => [t.key, t.label]));

export default function WrongBookPage() {
  const navigate = useNavigate();
  const { dueToday, pending, trulyMastered, markReviewRemembered, markReviewForgotten, markMastered, removeItem } =
    useWrongBook();
  const [tab, setTab] = useState<Tab>('due');
  const [topic, setTopic] = useState('all');

  const list = tab === 'due' ? dueToday : tab === 'pending' ? pending : trulyMastered;
  const filtered = useMemo(
    () => (topic === 'all' ? list : list.filter((w) => w.topicKey === topic)),
    [list, topic],
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
                {TOPIC_LABEL.get(key) ?? key}
                <span className="ml-1 opacity-60">{count}</span>
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <BookOpen className="size-8 opacity-40" />
              {tab === 'due'
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
  onMastered,
  onRemove,
}: {
  item: WrongItem;
  masteredView: boolean;
  onRemembered: () => void;
  onForgotten: () => void;
  onMastered: () => void;
  onRemove: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const days = Math.max(0, Math.ceil((item.nextReviewDate - Date.now()) / 86400000));

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary">{TOPIC_LABEL.get(item.topicKey) ?? item.topicKey}</Badge>
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

        <div className="flex flex-wrap items-center gap-2">
          {!masteredView && (
            <>
              <Button size="sm" className="gap-1.5" onClick={onRemembered}>
                <CheckCircle2 className="size-3.5" /> 回忆起来了
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={onForgotten}>
                <RotateCcw className="size-3.5" /> 还是不会
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={onMastered}>
                <Sparkles className="size-3.5" /> 直接标记掌握
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="size-3.5" /> 删除
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
