// 陷阱题集 tab：6 大类陷阱点 + 24 道配套陷阱题 + 自评模式

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Target,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  TRAP_CATEGORIES,
  getAllTrapQuestions,
  type TrapCategory,
  type TrapQuestion,
} from '@/data/competition-traps';
import { COMPETITION_TOPICS } from '@/data/competition';
import RichTextRenderer from '@/components/RichTextRenderer';

interface TrapsTabProps {
  onGoTopic?: (topicKey: string) => void;
}

export default function TrapsTab({ onGoTopic }: TrapsTabProps) {
  const [view, setView] = useState<'points' | 'questions'>('points');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('limit');
  const [expandedPoint, setExpandedPoint] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [selfEval, setSelfEval] = useState<Record<string, 'correct' | 'wrong' | null>>({});

  const allQuestions = useMemo(() => getAllTrapQuestions(), []);

  const totalTraps = TRAP_CATEGORIES.reduce((s, c) => s + c.trapPoints.length, 0);
  const totalQuestions = allQuestions.length;

  function toggleCategory(id: string) {
    setExpandedCategory(expandedCategory === id ? null : id);
  }

  function togglePoint(id: string) {
    setExpandedPoint(expandedPoint === id ? null : id);
  }

  function toggleAnswer(id: string) {
    setShowAnswer((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function setEval(id: string, val: 'correct' | 'wrong') {
    setSelfEval((prev) => ({ ...prev, [id]: val }));
  }

  return (
    <div className="space-y-6">
      {/* 顶部统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="陷阱类别" value={TRAP_CATEGORIES.length} icon={Target} color="text-rose-500" />
        <StatCard label="陷阱考点" value={totalTraps} icon={AlertTriangle} color="text-amber-500" />
        <StatCard label="配套陷阱题" value={totalQuestions} icon={BookOpen} color="text-sky-500" />
        <StatCard
          label="覆盖专题"
          value={new Set(TRAP_CATEGORIES.map((c) => c.topicKey)).size}
          icon={Lightbulb}
          color="text-emerald-500"
        />
      </div>

      {/* Tab 切换 */}
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList>
          <TabsTrigger value="points" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <AlertTriangle className="size-4 mr-1.5" />
            陷阱考点
          </TabsTrigger>
          <TabsTrigger value="questions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="size-4 mr-1.5" />
            陷阱题集
          </TabsTrigger>
        </TabsList>

        {/* 陷阱考点 */}
        <TabsContent value="points" className="mt-4 space-y-3">
          {TRAP_CATEGORIES.map((cat, idx) => (
            <CategoryAccordion
              key={cat.id}
              category={cat}
              expanded={expandedCategory === cat.id}
              onToggle={() => toggleCategory(cat.id)}
              expandedPoint={expandedPoint}
              onTogglePoint={togglePoint}
              index={idx}
            />
          ))}
        </TabsContent>

        {/* 陷阱题集 */}
        <TabsContent value="questions" className="mt-4 space-y-4">
          {TRAP_CATEGORIES.map((cat) => {
            const qs = allQuestions.filter((q) => q.categoryId === cat.id);
            if (qs.length === 0) return null;
            return (
              <Card key={cat.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose-500" />
                    {cat.name} 陷阱题
                    <Badge variant="outline" className="text-xs font-normal ml-auto">
                      {qs.length} 题
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {qs.map((q, i) => (
                    <TrapQuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      showAnswer={!!showAnswer[q.id]}
                      onToggleAnswer={() => toggleAnswer(q.id)}
                      selfEval={selfEval[q.id] ?? null}
                      onSelfEval={(v) => setEval(q.id, v)}
                      onGoTopic={onGoTopic}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---- 统计卡片 ----

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof AlertTriangle;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center gap-3">
        <div className={`size-10 rounded-lg bg-muted/50 flex items-center justify-center ${color}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ---- 分类手风琴 ----

function CategoryAccordion({
  category,
  expanded,
  onToggle,
  expandedPoint,
  onTogglePoint,
  index,
}: {
  category: TrapCategory;
  expanded: boolean;
  onToggle: () => void;
  expandedPoint: string | null;
  onTogglePoint: (id: string) => void;
  index: number;
}) {
  const topic = COMPETITION_TOPICS.find((t) => t.key === category.topicKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-border rounded-xl bg-card overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="size-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{category.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>{category.trapPoints.length} 条陷阱点</span>
            {topic && <Badge variant="outline" className="text-xs h-4 px-1 font-normal">{topic.title}</Badge>}
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border p-3 space-y-2 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-2 px-1">{category.description}</p>
          {category.trapPoints.map((point, i) => {
            const isOpen = expandedPoint === point.id;
            return (
              <div
                key={point.id}
                className="bg-card border border-border/70 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => onTogglePoint(point.id)}
                  className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/20 transition-colors"
                >
                  <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium px-1.5 py-0.5 rounded shrink-0">
                    陷阱 {i + 1}
                  </span>
                  <span className="text-sm font-medium flex-1 min-w-0 truncate">
                    {point.title}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-border/50 p-3 space-y-3 text-sm">
                    <div>
                      <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-1 flex items-center gap-1">
                        <XCircle className="size-3.5" />
                        错误示范
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/50 rounded-md p-3 text-xs leading-relaxed">
                        <RichTextRenderer text={point.wrongExample} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1 flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" />
                        正确解法
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/50 rounded-md p-3 text-xs leading-relaxed">
                        <RichTextRenderer text={point.correctExample} />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 pt-1">
                      <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                        <span className="flex items-start gap-1.5">
                          <Lightbulb className="size-3.5 mt-0.5 shrink-0 text-amber-500" />
                          <span>{point.reminder}</span>
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ---- 单道陷阱题卡片 ----

function TrapQuestionCard({
  question,
  index,
  showAnswer,
  onToggleAnswer,
  selfEval,
  onSelfEval,
  onGoTopic,
}: {
  question: TrapQuestion;
  index: number;
  showAnswer: boolean;
  onToggleAnswer: () => void;
  selfEval: 'correct' | 'wrong' | null;
  onSelfEval: (v: 'correct' | 'wrong') => void;
  onGoTopic?: (key: string) => void;
}) {
  const topic = COMPETITION_TOPICS.find((t) => t.key === question.topicKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border border-border/80 rounded-lg p-4 bg-card"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge variant="outline" className="text-xs font-normal">
          {question.type === 'fill-blank' ? '填空题' : '计算题'}
        </Badge>
        <Badge
          variant="secondary"
          className="text-xs font-normal"
        >
          难度 {question.difficulty === 1 ? '易' : question.difficulty === 2 ? '中' : '难'}
        </Badge>
        {topic && (
          <Badge variant="outline" className="text-xs font-normal cursor-pointer hover:bg-accent"
            onClick={() => onGoTopic?.(topic.key)}
          >
            {topic.title}
          </Badge>
        )}
        <Badge className="text-xs font-normal ml-auto bg-rose-500/10 text-rose-600 hover:bg-rose-500/10 border-rose-200 dark:border-rose-800 dark:text-rose-400">
          陷阱题
        </Badge>
      </div>

      <div className="text-sm leading-relaxed mb-3 overflow-x-auto">
        <RichTextRenderer text={question.problem} />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleAnswer}
          className="h-8"
        >
          {showAnswer ? (
            <>
              <EyeOff className="size-3.5 mr-1.5" />
              隐藏答案
            </>
          ) : (
            <>
              <Eye className="size-3.5 mr-1.5" />
              查看答案
            </>
          )}
        </Button>

        {showAnswer && (
          <>
            <div className="text-xs text-muted-foreground ml-2">
              分值：{question.score} 分
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">自评：</span>
              <Button
                size="sm"
                variant={selfEval === 'correct' ? 'default' : 'outline'}
                className="h-7 px-3 text-xs"
                onClick={() => onSelfEval('correct')}
              >
                <CheckCircle2 className="size-3.5 mr-1" />
                对了
              </Button>
              <Button
                size="sm"
                variant={selfEval === 'wrong' ? 'destructive' : 'outline'}
                className="h-7 px-3 text-xs"
                onClick={() => onSelfEval('wrong')}
              >
                <XCircle className="size-3.5 mr-1" />
                错了
              </Button>
            </div>
          </>
        )}
      </div>

      {showAnswer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-border/60 space-y-3"
        >
          <div>
            <div className="text-xs font-medium text-primary mb-1">答案</div>
            <div className="text-sm bg-primary/5 rounded-md p-3 border border-primary/10">
              <RichTextRenderer text={question.answer} />
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-foreground mb-1">解析</div>
            <div
              className="text-sm leading-relaxed text-muted-foreground bg-muted/30 rounded-md p-3 border border-border/50"
            >
              <RichTextRenderer text={question.solution} />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
