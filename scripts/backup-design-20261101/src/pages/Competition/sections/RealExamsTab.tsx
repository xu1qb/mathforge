import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Star,
  Tag,
  Clock,
  Award,
  FileText,
  Layers,
  Eye,
  ArrowLeft,
  Lightbulb,
  BookmarkX,
  BookmarkCheck,
  ChevronRight,
  Play,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  REAL_EXAM_QUESTIONS,
  groupRealExamsBySession,
  filterRealExamQuestions,
  type RealExamQuestion,
  type RealExamFilter,
  type RealExamMeta,
} from '@/data/competition-real-exams';
import { COMPETITION_TOPICS } from '@/data/competition';
import { normalizeCompetitionAnswer } from '@/data/competition-mock';
import RichTextRenderer from '@/components/RichTextRenderer';
import { cn } from '@/lib/utils';
import { scopedStorage } from '@/lib/lark-mock';
import RealExamPractice from './RealExamPractice';
import ExamAnalysisPanel from './ExamAnalysisPanel';

// ============================================================
// 历年真题主面板
// ============================================================

const WRONG_BOOK_KEY = 'competition:real-wrong-book';

interface Props {
  onGoTopic?: (topicKey: string) => void;
}

type ViewMode = 'browse' | 'detail' | 'exam';

export default function RealExamsTab({ onGoTopic }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [selectedExam, setSelectedExam] = useState<RealExamMeta | null>(null);
  const [examModeExam, setExamModeExam] = useState<RealExamMeta | null>(null);
  const [filter, setFilter] = useState<RealExamFilter>({ topic: 'all', type: 'all', difficulty: 0 });
  const [wrongBook, setWrongBook] = useState<string[]>(() => {
    try {
      const raw = scopedStorage.getItem(WRONG_BOOK_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // 真题考试历史记录（用于卡片显示最近成绩）
  const [examHistory] = useState<
    { examId: string; score: number; totalScore: number; date: number }[]
  >(() => {
    try {
      const raw = scopedStorage.getItem('competition:real-exam-history');
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data)
        ? data.map((r: { examId: string; score: number; totalScore: number; date: number }) => ({
            examId: r.examId,
            score: r.score,
            totalScore: r.totalScore,
            date: r.date,
          }))
        : [];
    } catch {
      return [];
    }
  });

  const sessionGroups = useMemo(() => groupRealExamsBySession(), []);
  const allQuestions = useMemo(() => REAL_EXAM_QUESTIONS.slice(), []);

  const filteredQuestions = useMemo(
    () => filterRealExamQuestions(allQuestions, filter),
    [allQuestions, filter]
  );

  const toggleWrongBook = useCallback((qid: string) => {
    setWrongBook((prev) => {
      const next = prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid];
      try {
        scopedStorage.setItem(WRONG_BOOK_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      toast.success(prev.includes(qid) ? '已移出错题本' : '已加入错题本');
      return next;
    });
  }, []);

  const openExam = (meta: RealExamMeta) => {
    setSelectedExam(meta);
    setViewMode('detail');
  };

  const startExamMode = (meta: RealExamMeta) => {
    setExamModeExam(meta);
    setViewMode('exam');
  };

  const backToBrowse = () => {
    setViewMode('browse');
    setSelectedExam(null);
    setExamModeExam(null);
  };

  if (viewMode === 'exam' && examModeExam) {
    return (
      <RealExamPractice
        exam={examModeExam}
        onBack={backToBrowse}
        onGoTopic={onGoTopic}
      />
    );
  }

  if (viewMode === 'detail' && selectedExam) {
    return (
          <ExamDetailView
            exam={selectedExam}
            wrongBook={wrongBook}
            onBack={backToBrowse}
            onToggleWrong={toggleWrongBook}
            onGoTopic={onGoTopic}
            onStartExam={startExamMode}
          />
    );
  }

  return (
    <div className="space-y-6">
      {/* 考点分析面板 */}
      <ExamAnalysisPanel questions={allQuestions} onGoTopic={onGoTopic} />

      {/* 顶部：试卷列表 */}
      <PaperListSection
        sessionGroups={sessionGroups}
        onOpenExam={openExam}
        onStartExam={startExamMode}
        examHistory={examHistory}
      />

      {/* 筛选 + 题目列表 */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="size-4 text-primary" />
              真题题库（共 {allQuestions.length} 题）
            </CardTitle>
            <CardDescription>
              按专题、题型、难度筛选，查看真题解析
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookmarkX className="size-4" />
            错题本 {wrongBook.length} 题
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 筛选条 */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">专题</span>
              <Select
                value={filter.topic || 'all'}
                onValueChange={(v) => setFilter((f) => ({ ...f, topic: v }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="全部专题" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部专题</SelectItem>
                  {COMPETITION_TOPICS.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">题型</span>
              <Select
                value={filter.type || 'all'}
                onValueChange={(v) =>
                  setFilter((f) => ({ ...f, type: v as RealExamFilter['type'] }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="全部题型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="fill-blank">填空题</SelectItem>
                  <SelectItem value="big-problem">大题（计算+证明）</SelectItem>
                  <SelectItem value="calculation">计算题</SelectItem>
                  <SelectItem value="proof">证明题</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">难度</span>
              <Select
                value={String(filter.difficulty || 0)}
                onValueChange={(v) =>
                  setFilter((f) => ({ ...f, difficulty: Number(v) as number }))
                }
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="全部难度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">全部</SelectItem>
                  <SelectItem value="1">★ 简单</SelectItem>
                  <SelectItem value="2">★★ 中等</SelectItem>
                  <SelectItem value="3">★★★ 困难</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* 结果列表 */}
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              没有找到符合条件的题目
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i + 1}
                  isWrong={wrongBook.includes(q.id)}
                  onToggleWrong={() => toggleWrongBook(q.id)}
                  onGoTopic={onGoTopic}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// 试卷列表（按届数分组）
// ============================================================

function PaperListSection({
  sessionGroups,
  onOpenExam,
  onStartExam,
  examHistory,
}: {
  sessionGroups: Map<string, { meta: RealExamMeta; questions: RealExamQuestion[] }[]>;
  onOpenExam: (meta: RealExamMeta) => void;
  onStartExam: (meta: RealExamMeta) => void;
  examHistory: { examId: string; score: number; totalScore: number; date: number }[];
}) {
  return (
    <div className="space-y-4">
      {Array.from(sessionGroups.entries()).sort((a, b) => {
        // 按届数倒序（第16届在第14届前面）
        const numA = parseInt(a[0].replace(/[^0-9]/g, ''), 10) || 0;
        const numB = parseInt(b[0].replace(/[^0-9]/g, ''), 10) || 0;
        return numB - numA;
      }).map(([session, papers]) => (
        <div key={session}>
          <div className="flex items-center gap-2 mb-3">
            <Award className="size-4 text-primary" />
            <h3 className="font-semibold text-foreground">{session}</h3>
            <span className="text-xs text-muted-foreground">{papers.length} 套试卷</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {papers.map(({ meta }) => (
              <motion.div
                key={meta.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="w-full bg-card hover:bg-accent/20 border border-border hover:border-primary/30 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenExam(meta)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-medium">
                        {session}
                      </Badge>
                      <h4 className="font-medium text-foreground truncate">
                        {meta.stage}
                        {meta.subtitle && `·${meta.subtitle}`} · {meta.category}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {meta.year} 年 · {meta.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="size-3" />
                        {meta.totalQuestions} 题
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {meta.duration} 分钟
                      </span>
                    </div>
                    {/* 最近成绩 */}
                    {(() => {
                      const best = examHistory
                        .filter((h) => h.examId === meta.id)
                        .sort((a, b) => b.date - a.date)[0];
                      if (!best) return null;
                      const rate = Math.round((best.score / best.totalScore) * 100);
                      return (
                        <div className="mt-2 flex items-center gap-2">
                          <Trophy className="size-3.5 text-amber-500" />
                          <span className="text-xs text-foreground font-medium">
                            最近：{best.score}/{best.totalScore} 分
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs h-4 px-1.5',
                              rate >= 70 && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
                              rate >= 50 && rate < 70 && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
                              rate < 50 && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                            )}
                          >
                            {rate}%
                          </Badge>
                        </div>
                      );
                    })()}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        满分 {meta.fullScore}
                      </Badge>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'size-3',
                              i < meta.difficulty
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-border'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenExam(meta);
                    }}
                  >
                    <Eye className="size-3.5 mr-1" />
                    查看详情
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartExam(meta);
                    }}
                  >
                    <Play className="size-3.5 mr-1" />
                    套卷实战
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 题目卡片（浏览模式）
// ============================================================

function QuestionCard({
  question,
  index,
  isWrong,
  onToggleWrong,
  onGoTopic,
}: {
  question: RealExamQuestion;
  index: number;
  isWrong: boolean;
  onToggleWrong: () => void;
  onGoTopic?: (topicKey: string) => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const topic = COMPETITION_TOPICS.find((t) => t.key === question.topic);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    const userNorm = normalizeCompetitionAnswer(userAnswer);
    const answerNorm = normalizeCompetitionAnswer(question.answer);
    const isCorrect = userNorm === answerNorm;
    setResult(isCorrect ? 'correct' : 'wrong');
    setShowAnswer(true);
    if (!isCorrect && !isWrong) {
      onToggleWrong();
    }
  };

  const typeLabel =
    question.type === 'fill-blank' ? '填空' : question.type === 'calculation' ? '计算' : '证明';

  return (
    <Card className="overflow-hidden transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* 题号 */}
          <div className="shrink-0 size-8 rounded-lg bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
            {index}
          </div>

          <div className="flex-1 min-w-0">
            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {typeLabel}题
              </Badge>
              <Badge variant="outline" className="text-xs font-normal bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                第{question.number}题
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                {question.score} 分
              </Badge>
              {topic && (
                <button
                  type="button"
                  onClick={() => onGoTopic?.(question.topic)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Tag className="size-3" />
                  {topic.title}
                </button>
              )}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'size-3',
                      i < question.difficulty
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-border'
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={onToggleWrong}
                className={cn(
                  'ml-auto flex items-center gap-1 text-xs transition-colors',
                  isWrong ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                )}
                title={isWrong ? '已加入错题本' : '加入错题本'}
              >
                {isWrong ? (
                  <BookmarkCheck className="size-3.5" />
                ) : (
                  <BookmarkX className="size-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isWrong ? '已收藏' : '收藏错题'}
                </span>
              </button>
            </div>

            {/* 题干 */}
            <div className="text-foreground leading-relaxed mb-3 question-katex-scroll">
              <RichTextRenderer text={question.problem} />
            </div>

            {/* 来源 */}
            <div className="text-xs text-muted-foreground mb-3">
              来源：{question.sourceLabel}
            </div>

            {/* 填空题输入判分 */}
            {question.type === 'fill-blank' && !showAnswer && (
              <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
                <Input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => {
                    setUserAnswer(e.target.value);
                    setResult(null);
                  }}
                  placeholder="输入你的答案…"
                  className="font-mono max-w-xs"
                />
                <Button type="submit" size="sm" variant="secondary">
                  提交判分
                </Button>
              </form>
            )}

            {/* 结果提示 */}
            {result === 'correct' && (
              <div className="flex items-center gap-2 text-sm text-success mb-3">
                <CheckCircle2 className="size-4" />
                回答正确！
              </div>
            )}
            {result === 'wrong' && (
              <div className="flex items-center gap-2 text-sm text-destructive mb-3">
                <XCircle className="size-4" />
                答案有误，已加入错题本
              </div>
            )}

            {/* 答案展开 */}
            <Accordion type="single" collapsible>
              <AccordionItem value="answer" className="border-0">
                <AccordionTrigger className="py-2 text-sm text-primary hover:no-underline">
                  {showAnswer ? '收起解析' : '查看参考答案与解析'}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0">
                  <div className="bg-accent/30 rounded-lg p-3 mb-3">
                    <div className="text-xs text-muted-foreground mb-1">参考答案</div>
                    <div className="font-medium text-foreground question-katex-scroll">
                      <RichTextRenderer text={question.answer} />
                    </div>
                  </div>
                  {question.hint && (
                    <div className="flex items-start gap-2 mb-3 text-sm">
                      <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-muted-foreground">
                        提示：{question.hint}
                      </div>
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      详细解答
                    </div>
                    <div className="text-foreground leading-relaxed space-y-2 question-katex-scroll">
                      <SolutionRenderer text={question.solution} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 试卷详情视图（整套卷子浏览）
// ============================================================

function ExamDetailView({
  exam,
  wrongBook,
  onBack,
  onToggleWrong,
  onGoTopic,
  onStartExam,
}: {
  exam: RealExamMeta;
  wrongBook: string[];
  onBack: () => void;
  onToggleWrong: (qid: string) => void;
  onGoTopic?: (topicKey: string) => void;
  onStartExam: (meta: RealExamMeta) => void;
}) {
  const questions = useMemo(() => {
    return REAL_EXAM_QUESTIONS.filter((q) => q.examId === exam.id).sort(
      (a, b) => a.number - b.number
    );
  }, [exam.id]);

  const fillBlankCount = questions.filter((q) => q.type === 'fill-blank').length;
  const calculationCount = questions.filter((q) => q.type === 'calculation').length;
  const proofCount = questions.filter((q) => q.type === 'proof').length;

  return (
    <div className="space-y-6">
      {/* 顶部返回 + 试卷信息 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1 h-9 min-h-[44px] px-3"
          >
            <ArrowLeft className="size-4" />
            返回
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {exam.session}{exam.stage}
              {exam.subtitle && ` · ${exam.subtitle}`} · {exam.category}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {exam.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {exam.duration} 分钟
              </span>
              <span className="flex items-center gap-1">
                <FileText className="size-3" />
                满分 {exam.fullScore}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => onStartExam(exam)}
          >
            <Play className="size-4 mr-1" />
            套卷实战
          </Button>
        </div>

      {/* 题型分布 */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground tabular-nums">
                {fillBlankCount}
              </div>
              <div className="text-xs text-muted-foreground mt-1">填空题</div>
              <div className="text-xs text-muted-foreground">
                {fillBlankCount * (questions[0]?.score || 6)} 分
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground tabular-nums">
                {calculationCount}
              </div>
              <div className="text-xs text-muted-foreground mt-1">计算题</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground tabular-nums">
                {proofCount}
              </div>
              <div className="text-xs text-muted-foreground mt-1">证明题</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={(fillBlankCount / questions.length) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 题目列表 */}
      <div className="space-y-4">
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={q.number}
            isWrong={wrongBook.includes(q.id)}
            onToggleWrong={() => onToggleWrong(q.id)}
            onGoTopic={onGoTopic}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 解答文本渲染器：支持 **粗体** 和 $...$ 公式 混排
// ============================================================

function SolutionRenderer({ text }: { text: string }) {
  return <RichTextRenderer text={text} className="space-y-2" />;
}
