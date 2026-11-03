import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Clock,
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Pause,
  ChevronRight,
  AlertTriangle,
  BarChart3,
  Target,
  History,
  BookOpen,
  ArrowLeft,
  Send,
  Flag,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getRealExamQuestions,
  type RealExamQuestion,
  type RealExamMeta,
} from '@/data/competition-real-exams';
import { COMPETITION_TOPICS } from '@/data/competition';
import { normalizeCompetitionAnswer } from '@/data/competition-mock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { scopedStorage } from '@/lib/lark-mock';
import { cn } from '@/lib/utils';
import RichTextRenderer from '@/components/RichTextRenderer';

const REAL_EXAM_HISTORY_KEY = 'competition:real-exam-history';
// 同时写入 mock exam history，实现统计联动（模拟考试趋势 + 薄弱专题）
const MOCK_EXAM_HISTORY_KEY = 'competition:exam-history';

// ================== 类型定义 ==================

export interface RealExamHistoryRecord {
  id: string;
  examId: string;
  examTitle: string;
  session: string;
  category: string;
  score: number;
  totalScore: number;
  correctCount: number;
  totalCount: number;
  duration: number; // 实际用时（秒）
  durationTotal: number; // 总时长（秒）
  date: number;
  topicStats: {
    topic: string;
    totalQuestions: number;
    correctQuestions: number;
    score: number;
    totalScore: number;
  }[];
  questionDetails: {
    questionId: string;
    topic: string;
    type: string;
    number: number;
    score: number;
    earned: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    selfEval?: 'correct' | 'partial' | 'wrong';
  }[];
}

type ExamPhase = 'intro' | 'taking' | 'result';
type PauseState = 'running' | 'paused';
type SelfEvalValue = 'correct' | 'partial' | 'wrong';

interface Props {
  exam: RealExamMeta;
  onBack: () => void;
  onGoTopic?: (topicKey: string) => void;
}

// ================== 主组件 ==================

export default function RealExamPractice({ exam, onBack, onGoTopic }: Props) {
  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [questions, setQuestions] = useState<RealExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selfEvals, setSelfEvals] = useState<Record<string, SelfEvalValue>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [pauseState, setPauseState] = useState<PauseState>('running');
  const [startTime, setStartTime] = useState<number>(0);
  const [, setElapsedBeforePause] = useState<number>(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [examResult, setExamResult] = useState<RealExamHistoryRecord | null>(null);
  const [history, setHistory] = useState<RealExamHistoryRecord[]>([]);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // 读取历史记录
  useEffect(() => {
    try {
      const raw = scopedStorage.getItem(REAL_EXAM_HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const saveHistory = useCallback((record: RealExamHistoryRecord) => {
    try {
      const updated = [record, ...history].slice(0, 20);
      setHistory(updated);
      scopedStorage.setItem(REAL_EXAM_HISTORY_KEY, JSON.stringify(updated));

      // 同时写入 mock exam history，用于统计联动（模拟考试趋势 + 薄弱专题）
      try {
        const raw = scopedStorage.getItem(MOCK_EXAM_HISTORY_KEY);
        const mockHistory = raw ? JSON.parse(raw) : [];
        const mockRecord = {
          id: record.id,
          configId: record.examId,
          configTitle: `[真题]${record.session}·${record.category}`,
          score: record.score,
          totalScore: record.totalScore,
          correctCount: record.correctCount,
          totalCount: record.totalCount,
          duration: record.duration,
          durationTotal: record.durationTotal,
          date: record.date,
          topicStats: record.topicStats,
          questionDetails: record.questionDetails.map((d) => ({
            questionId: d.questionId,
            topic: d.topic,
            type: d.type,
            score: d.score,
            earned: d.earned,
            userAnswer: d.userAnswer,
            correctAnswer: d.correctAnswer,
            isCorrect: d.isCorrect,
          })),
        };
        const updatedMock = [mockRecord, ...mockHistory].slice(0, 30);
        scopedStorage.setItem(MOCK_EXAM_HISTORY_KEY, JSON.stringify(updatedMock));
      } catch {
        // 联动失败不影响主流程
      }
    } catch {
      // ignore
    }
  }, [history]);

  // 开始考试
  const startExam = () => {
    const qs = getRealExamQuestions(exam.id);
    setQuestions(qs);
    setAnswers({});
    setSelfEvals({});
    setTimeLeft(exam.duration * 60);
    setPauseState('running');
    setStartTime(Date.now());
    setElapsedBeforePause(0);
    setCurrentQIndex(0);
    setPhase('taking');
  };

  // 计时器
  useEffect(() => {
    if (phase !== 'taking' || pauseState !== 'running') return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleFinish(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
     
  }, [phase, pauseState]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const togglePause = useCallback(() => {
    if (pauseState === 'running') {
      setPauseState('paused');
      setElapsedBeforePause((prev) => prev + (Date.now() - startTime) / 1000);
    } else {
      setStartTime(Date.now());
      setPauseState('running');
    }
  }, [pauseState, startTime]);

  // 判分 + 生成报告
  const gradeExam = useCallback(
    (qs: RealExamQuestion[], ans: Record<string, string>, evals: Record<string, SelfEvalValue>): RealExamHistoryRecord => {
      const details = qs.map((q) => {
        const userAns = ans[q.id] || '';
        let earned = 0;
        let isCorrect = false;

        if (q.type === 'fill-blank') {
          const u = normalizeCompetitionAnswer(userAns);
          const c = normalizeCompetitionAnswer(q.answer);
          isCorrect = u === c;
          earned = isCorrect ? q.score : 0;
        } else {
          // 计算/证明题：按自评给分
          const eval_ = evals[q.id];
          if (eval_ === 'correct') {
            earned = q.score;
            isCorrect = true;
          } else if (eval_ === 'partial') {
            earned = Math.floor(q.score * 0.5);
            isCorrect = false;
          } else {
            earned = 0;
            isCorrect = false;
          }
        }

        return {
          questionId: q.id,
          topic: q.topic,
          type: q.type,
          number: q.number,
          score: q.score,
          earned,
          userAnswer: userAns,
          correctAnswer: q.answer,
          isCorrect,
          selfEval: q.type !== 'fill-blank' ? (evals[q.id] ?? 'wrong') : undefined,
        };
      });

      const totalScore = details.reduce((s, d) => s + d.score, 0);
      const score = details.reduce((s, d) => s + d.earned, 0);
      const correctCount = details.filter((d) => d.isCorrect).length;

      // 按专题统计
      const topicMap = new Map<
        string,
        { totalQuestions: number; correctQuestions: number; score: number; totalScore: number }
      >();
      details.forEach((d) => {
        const cur = topicMap.get(d.topic) ?? { totalQuestions: 0, correctQuestions: 0, score: 0, totalScore: 0 };
        cur.totalQuestions += 1;
        if (d.isCorrect) cur.correctQuestions += 1;
        cur.score += d.earned;
        cur.totalScore += d.score;
        topicMap.set(d.topic, cur);
      });

      const topicStats = Array.from(topicMap.entries()).map(([topic, s]) => ({ topic, ...s }));

      const actualDuration = Math.floor(exam.duration * 60 - timeLeft);

      return {
        id: `real-exam-${Date.now()}`,
        examId: exam.id,
        examTitle: `${exam.session}·${exam.category}`,
        session: exam.session,
        category: exam.category,
        score,
        totalScore,
        correctCount,
        totalCount: qs.length,
        duration: actualDuration,
        durationTotal: exam.duration * 60,
        date: Date.now(),
        topicStats,
        questionDetails: details,
      };
    },
    [exam, timeLeft],
  );

  const handleFinish = useCallback((autoSubmit = false) => {
    const result = gradeExam(questions, answers, selfEvals);
    setExamResult(result);
    saveHistory(result);
    setPhase('result');
    if (autoSubmit) {
      toast.warning('时间到，已自动交卷');
    } else {
      toast.success(
        `交卷完成！得分 ${result.score}/${result.totalScore}，正确率 ${Math.round((result.correctCount / result.totalCount) * 100)}%`,
      );
    }
  }, [questions, answers, selfEvals, gradeExam, saveHistory]);

  const currentQ = questions[currentQIndex];
  const isLastMinute = timeLeft <= 600; // 最后10分钟
  const isCritical = timeLeft <= 60; // 最后1分钟

  // ====== 介绍页 ======
  if (phase === 'intro') {
    const fillCount = questions.filter((q) => q.type === 'fill-blank').length;
    const calcCount = questions.filter((q) => q.type === 'calculation').length;
    const proofCount = questions.filter((q) => q.type === 'proof').length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* 返回 */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回真题浏览
        </button>

        {/* 试卷信息卡 */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-transparent">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-2 bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
                  真题实战
                </Badge>
                <CardTitle className="text-xl">{exam.session} {exam.stage}</CardTitle>
                <CardDescription className="mt-1">
                  {exam.subtitle} · {exam.category} · {exam.date}
                </CardDescription>
              </div>
              <div className="size-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Trophy className="size-7" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{exam.totalQuestions}</div>
                <div className="text-xs text-muted-foreground mt-0.5">题目总数</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{exam.fullScore}</div>
                <div className="text-xs text-muted-foreground mt-0.5">满分</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{exam.duration}</div>
                <div className="text-xs text-muted-foreground mt-0.5">分钟</div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm font-medium text-foreground mb-2">试卷结构</div>
              <div className="flex flex-wrap gap-2">
                {fillCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    填空题 × {fillCount}（{fillCount * 6} 分）
                  </Badge>
                )}
                {calcCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    计算题 × {calcCount}（{calcCount * 14} 分）
                  </Badge>
                )}
                {proofCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    证明题 × {proofCount}（{proofCount * 14} 分）
                  </Badge>
                )}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-medium">答题说明</p>
                  <ul className="space-y-0.5 list-disc pl-4">
                    <li>填空题：系统自动判分，答案需精确匹配</li>
                    <li>计算题/证明题：交卷后请自评（对 / 部分对 / 错）</li>
                    <li>倒计时结束自动交卷，考试可暂停</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
              onClick={startExam}
            >
              <Play className="size-4 mr-2" />
              开始答题
            </Button>
          </CardContent>
        </Card>

        {/* 历史记录 */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-4 text-emerald-600" />
                本卷历史成绩（最近 {history.filter((h) => h.examId === exam.id).length} 次）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {history
                .filter((h) => h.examId === exam.id)
                .slice(0, 5)
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border/40 hover:bg-accent/30 transition-colors"
                  >
                    <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0">
                      {Math.round((record.score / record.totalScore) * 100)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">
                        {record.score} / {record.totalScore} 分
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleString('zh-CN', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · 用时 {Math.floor(record.duration / 60)} 分 {record.duration % 60} 秒
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0',
                        record.score / record.totalScore >= 0.7 &&
                          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
                        record.score / record.totalScore < 0.5 &&
                          'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                      )}
                    >
                      {Math.round((record.score / record.totalScore) * 100)}%
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  }

  // ====== 答题阶段 ======
  if (phase === 'taking' && currentQ) {
    const timeProgress = timeLeft / (exam.duration * 60);
    const fillQuestions = questions.filter((q) => q.type === 'fill-blank');
    const calcQuestions = questions.filter((q) => q.type !== 'fill-blank');

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* 顶部：返回 + 计时器 + 暂停 + 交卷 */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 -mx-4 md:-mx-6 px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              退出
            </button>

            <div
              className={cn(
                'flex items-center gap-2 font-mono font-bold text-lg',
                isCritical && 'text-red-600 dark:text-red-500 animate-pulse',
                isLastMinute && !isCritical && 'text-amber-600 dark:text-amber-500',
                !isLastMinute && 'text-foreground',
              )}
            >
              <Clock className="size-5" />
              {formatTime(timeLeft)}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={togglePause}>
                {pauseState === 'running' ? (
                  <>
                    <Pause className="size-3.5 mr-1" /> 暂停
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 mr-1" /> 继续
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setConfirmSubmit(true)}
              >
                <Send className="size-3.5 mr-1" />
                交卷
              </Button>
            </div>
          </div>

          <div className="mt-2">
            <Progress value={timeProgress * 100} className={cn(
              'h-1',
              isCritical && '[&>div]:bg-red-500',
              isLastMinute && !isCritical && '[&>div]:bg-amber-500',
            )} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 pt-2">
          {/* 左侧：题号导航 */}
          <Card className="h-fit sticky top-24">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flag className="size-4 text-primary" />
                题号导航
              </CardTitle>
              <CardDescription className="text-xs">
                已答 {Object.values(answers).filter((a) => a.trim()).length} / {questions.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 填空题 */}
              {fillQuestions.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">
                    填空题（{fillQuestions.length}题）
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {fillQuestions.map((q) => {
                      const idx = questions.findIndex((x) => x.id === q.id);
                      const answered = (answers[q.id] || '').trim().length > 0;
                      const isCurrent = idx === currentQIndex;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQIndex(idx)}
                          className={cn(
                            'aspect-square rounded-md text-xs font-medium transition-all',
                            isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                            !isCurrent && answered && 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700',
                            !isCurrent && !answered && 'bg-card border border-border hover:border-primary/40 text-foreground/70',
                          )}
                        >
                          {q.number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 计算/证明题 */}
              {calcQuestions.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">
                    解答题（{calcQuestions.length}题）
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {calcQuestions.map((q) => {
                      const idx = questions.findIndex((x) => x.id === q.id);
                      const answered = (answers[q.id] || '').trim().length > 0;
                      const isCurrent = idx === currentQIndex;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQIndex(idx)}
                          className={cn(
                            'aspect-square rounded-md text-xs font-medium transition-all',
                            isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                            !isCurrent && answered && 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700',
                            !isCurrent && !answered && 'bg-card border border-border hover:border-primary/40 text-foreground/70',
                          )}
                        >
                          {q.number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700" />
                  <span>已作答</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-card border border-border" />
                  <span>未作答</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-primary" />
                  <span>当前题</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 右侧：题目内容 */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    第 {currentQ.number} 题
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {currentQ.type === 'fill-blank' ? '填空题' : currentQ.type === 'calculation' ? '计算题' : '证明题'}
                    {' · '}{currentQ.score} 分
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {COMPETITION_TOPICS.find((t) => t.key === currentQ.topic)?.title ?? currentQ.topic}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentQIndex + 1} / {questions.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <RichTextRenderer text={currentQ.problem} className="text-base leading-7" />

              <div className="mt-6">
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  你的答案
                </Label>
                {currentQ.type === 'fill-blank' ? (
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                    }
                    className="w-full h-12 px-4 rounded-lg border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                    placeholder="请输入答案，如 √2、π/4 等"
                  />
                ) : (
                  <Textarea
                    value={answers[currentQ.id] || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                    }
                    placeholder="请写下你的解题过程和答案（交卷后自评）"
                    className="min-h-[200px] text-sm leading-relaxed resize-y font-mono"
                  />
                )}
              </div>

              {/* 上下题切换 */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="size-4 mr-1" />
                  上一题
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQIndex === questions.length - 1}
                  onClick={() => setCurrentQIndex((i) => Math.min(questions.length - 1, i + 1))}
                >
                  下一题
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 暂停遮罩 */}
        <AnimatePresence>
          {pauseState === 'paused' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            >
              <Card className="max-w-md w-full mx-4 text-center">
                <CardHeader>
                  <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Pause className="size-8 text-primary" />
                  </div>
                  <CardTitle>考试已暂停</CardTitle>
                  <CardDescription>剩余时间已暂停计时，请准备好后继续</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={togglePause}
                  >
                    <Play className="size-4 mr-2" />
                    继续答题
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 交卷确认 */}
        <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="size-5 text-amber-500" />
                确认交卷
              </DialogTitle>
              <DialogDescription>
                已作答 {Object.values(answers).filter((a) => a.trim()).length} / {questions.length} 题
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {questions.some((q) => !(answers[q.id] || '').trim()) && (
                <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>还有未作答的题目，确定要交卷吗？</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                交卷后将显示答案解析和成绩报告，无法继续答题。
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmSubmit(false)}>
                继续答题
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setConfirmSubmit(false);
                  handleFinish(false);
                }}
              >
                确认交卷
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  // ====== 结果页 ======
  if (phase === 'result' && examResult) {
    const scorePercent = (examResult.score / examResult.totalScore) * 100;
    const weakTopics = examResult.topicStats
      .filter((s) => s.totalQuestions > 0 && s.score / s.totalScore < 0.5)
      .sort((a, b) => a.score / a.totalScore - b.score / b.totalScore);

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* 总分卡 */}
        <Card
          className={cn(
            'border-2 overflow-hidden',
            scorePercent >= 70
              ? 'border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50/80 via-background to-background dark:from-emerald-950/20'
              : scorePercent >= 50
                ? 'border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50/80 via-background to-background dark:from-amber-950/20'
                : 'border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50/80 via-background to-background dark:from-red-950/20',
          )}
        >
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div
                className={cn(
                  'size-28 rounded-full flex flex-col items-center justify-center shrink-0',
                  scorePercent >= 70 && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
                  scorePercent >= 50 && scorePercent < 70 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
                  scorePercent < 50 && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
                )}
              >
                <span className="text-3xl font-bold">{Math.round(scorePercent)}</span>
                <span className="text-xs opacity-70">得分率</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {examResult.score} <span className="text-lg text-muted-foreground font-normal">/ {examResult.totalScore} 分</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>正确 {examResult.correctCount} / {examResult.totalCount} 题</p>
                  <p>
                    用时 {Math.floor(examResult.duration / 60)} 分 {examResult.duration % 60} 秒
                    {' · '}
                    满分 {examResult.totalScore}，限时 {Math.floor(examResult.durationTotal / 60)} 分钟
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="size-4 mr-1" />
                  返回真题
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={startExam}
                >
                  <RotateCcw className="size-4 mr-1" />
                  再考一次
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 专题统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4 text-primary" />
              按专题统计
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {examResult.topicStats.map((s) => {
              const rate = s.score / s.totalScore;
              const topic = COMPETITION_TOPICS.find((t) => t.key === s.topic);
              return (
                <div key={s.topic} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{topic?.title ?? s.topic}</span>
                    <span className="text-muted-foreground">
                      {s.score}/{s.totalScore} 分 · {s.correctQuestions}/{s.totalQuestions} 题
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        rate >= 0.7 && 'bg-emerald-500',
                        rate >= 0.5 && rate < 0.7 && 'bg-amber-500',
                        rate < 0.5 && 'bg-red-500',
                      )}
                      style={{ width: `${rate * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 薄弱专题 */}
        {weakTopics.length > 0 && (
          <Card className="border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-400">
                <Target className="size-4" />
                薄弱专题（得分率 &lt; 50%）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weakTopics.map((s) => {
                const topic = COMPETITION_TOPICS.find((t) => t.key === s.topic);
                return (
                  <div
                    key={s.topic}
                    className="flex items-center justify-between p-3 rounded-lg bg-card/60 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-bold">
                        {topic?.title.slice(0, 2) ?? '专'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{topic?.title ?? s.topic}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.score}/{s.totalScore} 分 · 正确率 {Math.round((s.score / s.totalScore) * 100)}%
                        </div>
                      </div>
                    </div>
                    {onGoTopic && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onGoTopic(s.topic)}
                      >
                        去复习 <ArrowRight className="size-3 ml-1" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* 逐题解析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-primary" />
              逐题解析与自评
            </CardTitle>
            <CardDescription>
              共 {examResult.totalCount} 题，答对 {examResult.correctCount} 题
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {examResult.questionDetails.map((d) => {
                const q = questions.find((q) => q.id === d.questionId);
                const topic = COMPETITION_TOPICS.find((t) => t.key === d.topic);
                return (
                  <AccordionItem key={d.questionId} value={d.questionId}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className={cn(
                            'size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                            d.isCorrect
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
                          )}
                        >
                          {d.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {d.type === 'fill-blank' ? '填空题' : d.type === 'calculation' ? '计算题' : '证明题'}
                            {' · '}{topic?.title ?? d.topic}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {d.earned}/{d.score} 分
                            {d.selfEval && ` · 自评：${d.selfEval === 'correct' ? '对' : d.selfEval === 'partial' ? '部分对' : '错'}`}
                          </div>
                        </div>
                        {d.isCorrect ? (
                          <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="size-5 text-red-500 shrink-0" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      {q && (
                        <>
                          <div className="bg-muted/30 rounded-lg p-4">
                            <div className="text-xs text-muted-foreground mb-2">题目</div>
                            <RichTextRenderer text={q.problem} className="text-sm leading-6" />
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">你的答案</div>
                            <div className="text-sm text-foreground bg-card border border-border rounded-lg p-3 whitespace-pre-wrap">
                              {d.userAnswer || <span className="text-muted-foreground italic">（未作答）</span>}
                            </div>
                          </div>

                          {/* 大题自评 */}
                          {d.type !== 'fill-blank' && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                              <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                                自评（点击修改）
                              </div>
                              <RadioGroup
                                value={selfEvals[d.questionId] ?? d.selfEval ?? 'wrong'}
                                onValueChange={(v: SelfEvalValue) =>
                                  setSelfEvals((prev) => ({ ...prev, [d.questionId]: v }))
                                }
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="correct" id={`${d.questionId}-correct`} />
                                  <Label htmlFor={`${d.questionId}-correct`} className="text-sm cursor-pointer">
                                    完全对
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="partial" id={`${d.questionId}-partial`} />
                                  <Label htmlFor={`${d.questionId}-partial`} className="text-sm cursor-pointer">
                                    部分对
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="wrong" id={`${d.questionId}-wrong`} />
                                  <Label htmlFor={`${d.questionId}-wrong`} className="text-sm cursor-pointer">
                                    错
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">参考答案</div>
                            <div className="text-sm text-foreground font-medium">
                              <RichTextRenderer text={q.answer} />
                            </div>
                          </div>

                          {q.solution && (
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">详细解析</div>
                              <div className="text-sm bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-4">
                                <RichTextRenderer text={q.solution} className="text-sm leading-6" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
}
