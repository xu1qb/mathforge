import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Flame,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen,
  Trophy,
  CalendarDays,
  Clock,
  TrendingUp,
  Award,
  Zap,
  AlertTriangle,
  Ruler,
} from 'lucide-react';
import {
  generateDailyQuestions,
  replaceDailyQuestion,
  markDailyDone,
  readDailyRecord,
  readStreak,
  readDailySource,
  writeDailySource,
  getCheckInCalendar,
  getTotalCheckInDays,
  getDailyWarReport,
  type DailyPracticeQuestion,
  type DailySourceMode,
  type DailyWarReport,
} from '@/data/competition-sprint';
import { computeWeakTopics, type ExamHistoryRecord } from '@/data/competition-mock';
import { normalizeCompetitionAnswer } from '@/data/competition-mock';
import { COMPETITION_TOPICS } from '@/data/competition';
import RichTextRenderer from '@/components/RichTextRenderer';
import { useWrongBook } from '@/hooks/use-learning';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DailyPracticeCardProps {
  examHistory: ExamHistoryRecord[];
  onGoTopic: (topicKey: string) => void;
}

const SOURCE_LABELS: Record<DailySourceMode, { label: string; icon: React.ReactNode }> = {
  mixed: { label: '混合模式', icon: <Target className="size-3.5" /> },
  real: { label: '真题模式', icon: <Trophy className="size-3.5" /> },
  generated: { label: '生成模式', icon: <Sparkles className="size-3.5" /> },
  traps: { label: '陷阱题', icon: <AlertTriangle className="size-3.5" /> },
  proof: { label: '证明题', icon: <Ruler className="size-3.5" /> },
};

export default function DailyPracticeCard({ examHistory, onGoTopic }: DailyPracticeCardProps) {
  const [questions, setQuestions] = useState<DailyPracticeQuestion[]>([]);
  const { addWrong } = useWrongBook();
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [correctMap, setCorrectMap] = useState<Record<string, boolean>>({});
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [todayDone, setTodayDone] = useState(false);
  const [sourceMode, setSourceMode] = useState<DailySourceMode>('mixed');
  const [showCalendar, setShowCalendar] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [warReport, setWarReport] = useState<DailyWarReport | null>(null);
  const [showWarReport, setShowWarReport] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);

  const weakTopicKeys = useMemo(() => {
    const allKeys = COMPETITION_TOPICS.map((t) => t.key);
    const weak = computeWeakTopics(examHistory, allKeys);
    return weak.filter((w) => w.isWeak).slice(0, 3).map((w) => w.topic);
  }, [examHistory]);

  const calendarData = useMemo(() => getCheckInCalendar(30), [todayDone, sourceMode]);

  // 加载今日题目
  useEffect(() => {
    const mode = readDailySource();
    setSourceMode(mode);
    const { questions: qs } = generateDailyQuestions(weakTopicKeys, mode);
    setQuestions(qs);
    const record = readDailyRecord();
    setTodayDone(record?.allDone ?? false);

    const s = readStreak();
    setStreak({ current: s.current, longest: s.longest });
    setTotalDays(getTotalCheckInDays());

    // 如果今日已完成，显示战报数据
    if (record?.allDone) {
      const wrongTopics: string[] = [];
      if (record.fillBlankDone && !record.fillBlankCorrect) {
        const fb = qs.find((q) => q.question.type === 'fill-blank');
        if (fb) wrongTopics.push(fb.question.topic);
      }
      if (record.bigProblemDone && !record.bigProblemCorrect) {
        const bp = qs.find((q) => q.question.type !== 'fill-blank');
        if (bp) wrongTopics.push(bp.question.topic);
      }
      setWarReport(
        getDailyWarReport(
          record,
          wrongTopics,
          { streak: s.current, longest: s.longest, isNew: false },
        ),
      );
    }
  }, [weakTopicKeys]);

  // 用时计时器
  useEffect(() => {
    if (todayDone) return;
    const timer = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [todayDone]);

  // 切换题目来源
  const handleSourceChange = useCallback((mode: DailySourceMode) => {
    setSourceMode(mode);
    writeDailySource(mode);
    const { questions: qs } = generateDailyQuestions(weakTopicKeys, mode);
    setQuestions(qs);
    const record = readDailyRecord();
    setTodayDone(record?.allDone ?? false);
    startTimeRef.current = Date.now();
    setElapsedSec(0);
  }, [weakTopicKeys]);

  // 计算今日战报
  const computeTodayWarReport = useCallback(
    (streakInfo?: { streak: number; longest: number; isNew: boolean }) => {
      const record = readDailyRecord();
      if (!record?.allDone) return;

      const wrongTopics: string[] = [];
      if (record.fillBlankDone && !record.fillBlankCorrect) {
        const fb = questions.find((q) => q.question.type === 'fill-blank');
        if (fb) wrongTopics.push(fb.question.topic);
      }
      if (record.bigProblemDone && !record.bigProblemCorrect) {
        const bp = questions.find((q) => q.question.type !== 'fill-blank');
        if (bp) wrongTopics.push(bp.question.topic);
      }

      const info = streakInfo ?? { streak: streak.current, longest: streak.longest, isNew: false };
      const report = getDailyWarReport(record, wrongTopics, info);
      setWarReport(report);
      setTotalDays(getTotalCheckInDays());
      setShowWarReport(true);

      // 新徽章提示
      if (report.isNewBadge) {
        report.newBadgeNames.forEach((name, i) => {
          setTimeout(() => {
            toast.success(`🎉 解锁新徽章：${name}`, {
              duration: 3500,
            });
          }, i * 1500);
        });
      }
    },
    [questions, streak],
  );

  // 大题自评模式
  const handleSelfEval = useCallback(
    (q: DailyPracticeQuestion, result: 'correct' | 'wrong') => {
      setSubmitted((prev) => ({ ...prev, [q.question.id]: true }));
      setCorrectMap((prev) => ({ ...prev, [q.question.id]: result === 'correct' }));

      const position = q.question.type === 'fill-blank' ? 'fillBlank' : 'bigProblem';
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const markResult = markDailyDone(position, result === 'correct', duration);
      if (markResult) {
        setTodayDone(markResult.record.allDone);
      }

      const nextSubmitted = { ...submitted, [q.question.id]: true };
      const allDone = questions.every((qq) => nextSubmitted[qq.question.id]);
      if (allDone) {
        setTodayDone(true);
        const streakInfo = markResult?.streakInfo;
        if (streakInfo?.isNew) {
          setStreak({ current: streakInfo.streak, longest: streakInfo.longest });
        }
        // 显示战报
        setTimeout(() => computeTodayWarReport(streakInfo), 300);
      } else {
        if (result === 'correct') {
          toast.success('自评正确！继续加油～');
        } else {
          toast.info('已记录，记得复习解析');
        }
      }
    },
    [submitted, questions, computeTodayWarReport],
  );

  const handleSubmit = useCallback(
    (q: DailyPracticeQuestion) => {
      const answer = userAnswers[q.question.id] ?? '';
      // 标准化后比较
      const normUser = normalizeCompetitionAnswer(answer);
      const normRef = normalizeCompetitionAnswer(q.question.answer);
      const isCorrect = normUser === normRef;

      setSubmitted((prev) => ({ ...prev, [q.question.id]: true }));
      setCorrectMap((prev) => ({ ...prev, [q.question.id]: isCorrect }));

      // 答错 → 写入错题本
      if (!isCorrect) {
        const cq = q.question;
        const pq = {
          id: cq.id,
          topicKey: cq.topic,
          question: cq.problem,
          questionLatex: cq.problem,
          answer: cq.answer,
          answerDisplay: cq.answer,
          answerType: 'expression' as const,
          steps: cq.solution ? cq.solution.split('\n') : [],
          difficulty: (cq.difficulty === 1 ? 'basic' : cq.difficulty === 2 ? 'advanced' : 'competition') as 'basic' | 'advanced' | 'competition',
        };
        addWrong(pq, answer, 'auto');
      }

      // 判断位置（填空/大题）
      const position = q.question.type === 'fill-blank' ? 'fillBlank' : 'bigProblem';
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const markResult = markDailyDone(position, isCorrect, duration);
      if (markResult) {
        setTodayDone(markResult.record.allDone);
      }

      // 检查是否两题都完成了
      const nextSubmitted = { ...submitted, [q.question.id]: true };
      const allDone = questions.every((qq) => nextSubmitted[qq.question.id]);
      if (allDone) {
        setTodayDone(true);
        const streakInfo = markResult?.streakInfo;
        if (streakInfo?.isNew) {
          setStreak({ current: streakInfo.streak, longest: streakInfo.longest });
        }
        // 显示战报
        setTimeout(() => computeTodayWarReport(streakInfo), 300);
      } else {
        if (isCorrect) {
          toast.success('回答正确！继续加油～');
        } else {
          toast.error('回答错误，查看解析学习一下');
        }
      }
    },
    [userAnswers, submitted, questions, addWrong, computeTodayWarReport],
  );

  const handleReplace = useCallback(
    (index: number) => {
      const q = questions[index];
      const position = q.question.type === 'fill-blank' ? 'fillBlank' : 'bigProblem';
      const newQ = replaceDailyQuestion(position, weakTopicKeys);
      if (newQ) {
        setQuestions((prev) => {
          const next = [...prev];
          next[index] = newQ;
          return next;
        });
        setSubmitted((prev) => {
          const next = { ...prev };
          delete next[q.question.id];
          return next;
        });
        setCorrectMap((prev) => {
          const next = { ...prev };
          delete next[q.question.id];
          return next;
        });
        setUserAnswers((prev) => {
          const next = { ...prev };
          delete next[q.question.id];
          return next;
        });
        toast.info('已更换题目');
      }
    },
    [questions, weakTopicKeys],
  );

  const toggleSolution = useCallback((id: string) => {
    setShowSolution((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const fillBlank = questions.find((q) => q.question.type === 'fill-blank');
  const bigProblem = questions.find((q) => q.question.type !== 'fill-blank');
  const orderedQuestions = [fillBlank, bigProblem].filter(Boolean) as DailyPracticeQuestion[];

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}分${s}秒`;
  };

  return (
    <Card className="border-border/60 bg-gradient-to-br from-teal-50/50 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          每日一练
          <Badge variant="outline" className="ml-auto text-xs bg-background">
            每天 2 题 · 0 点更新
          </Badge>
        </CardTitle>
        <CardDescription>
          根据薄弱专题智能推荐，保持手感，培养题感
        </CardDescription>

        {/* 题目来源切换 */}
        <div className="flex flex-wrap items-center gap-1 mt-2 bg-muted/50 rounded-md p-1">
          {(Object.keys(SOURCE_LABELS) as DailySourceMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleSourceChange(mode)}
              className={cn(
                'px-2.5 py-1 text-xs rounded transition-all flex items-center gap-1',
                sourceMode === mode
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span>{SOURCE_LABELS[mode].icon}</span>
              {SOURCE_LABELS[mode].label}
            </button>
          ))}
        </div>

        {/* 连续打卡 + 用时 */}
        <div className="flex items-center gap-3 mt-2 pt-3 border-t border-border/40 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Flame className={cn('size-5', streak.current > 0 ? 'text-orange-500' : 'text-muted-foreground')} />
            <div>
              <div className="text-sm font-semibold text-foreground">
                {streak.current} 天
              </div>
              <div className="text-xs text-muted-foreground">连续打卡</div>
            </div>
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div className="text-xs text-muted-foreground">
            最长 <span className="font-semibold text-foreground">{streak.longest}</span> 天
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div className="text-xs text-muted-foreground">
            累计 <span className="font-semibold text-foreground">{totalDays}</span> 天
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3.5" />
            {todayDone ? '已完成' : formatDuration(elapsedSec)}
          </div>

          {todayDone && (
            <Badge className="ml-auto bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="size-3 mr-1" />
              今日已完成
            </Badge>
          )}
        </div>

        {/* 打卡日历折叠 */}
        <button
          onClick={() => setShowCalendar((s) => !s)}
          className="flex items-center justify-between w-full text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            近 30 天打卡日历
          </span>
          {showCalendar ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>

        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <div className="grid grid-cols-7 gap-1.5">
                  {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs text-muted-foreground font-medium"
                    >
                      {d}
                    </div>
                  ))}
                  {calendarData.map((day) => (
                    <div
                      key={day.date}
                      className={cn(
                        'aspect-square rounded-md flex items-center justify-center text-xs relative',
                        day.checkedIn
                          ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                          : day.isToday
                            ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                            : 'bg-muted/40 text-muted-foreground',
                      )}
                      title={`${day.date}${day.checkedIn ? ' · 已打卡' : ''}`}
                    >
                      {day.dayOfMonth}
                      {day.checkedIn && day.correctCount !== undefined && (
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[9px]">
                          {day.correctCount === 2 ? '🌟' : day.correctCount === 1 ? '⭐' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>⭐ 部分正确 🌟 全对</span>
                  <span>{calendarData.filter((d) => d.checkedIn).length} / 30 天</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="space-y-3">
        {orderedQuestions.map((q, idx) => {
          const isSubmitted = submitted[q.question.id];
          const isCorrect = correctMap[q.question.id];
          const topic = COMPETITION_TOPICS.find((t) => t.key === q.question.topic);

          return (
            <motion.div
              key={q.question.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={cn(
                'p-5 rounded-xl border transition-all',
                 isSubmitted
                   ? isCorrect
                     ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                     : 'border-rose-200 dark:border-rose-800/40 bg-rose-50/50 dark:bg-rose-950/20'
                   : 'border-border/60 dark:border-border/40 bg-background dark:bg-card hover:border-primary/30 dark:hover:border-primary/40',
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      q.source === 'weak'
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                        : q.source === 'generated'
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                          : 'bg-primary/10 text-primary hover:bg-primary/20',
                    )}
                  >
                    {q.source === 'weak' ? (
                       <Target className="size-3 mr-1" />
                     ) : q.source === 'generated' ? (
                       <Sparkles className="size-3 mr-1" />
                     ) : q.source === 'real-exam' ? (
                       <Trophy className="size-3 mr-1" />
                     ) : (
                       <BookOpen className="size-3 mr-1" />
                     )}
                     {q.source === 'weak'
                       ? '薄弱专题'
                       : q.source === 'generated'
                         ? '随机生成'
                         : q.source === 'real-exam'
                           ? '真题演练'
                           : '轮换练习'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {idx === 0 ? '填空题' : '大题'}
                  </Badge>
                  {q.realExamMeta && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                      title={q.realExamMeta.sourceLabel}
                    >
                      {q.realExamMeta.session} · 第{q.realExamMeta.number}题
                    </Badge>
                  )}
                  {topic && (
                    <button
                      onClick={() => onGoTopic(topic.key)}
                      className="text-xs text-primary hover:underline"
                    >
                      {topic.title}
                    </button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => handleReplace(idx)}
                  disabled={todayDone}
                >
                  <RefreshCw className="size-3 mr-1" />
                  换一题
                </Button>
              </div>

              <div className="text-sm text-foreground mb-3 leading-relaxed">
                <RichTextRenderer text={q.question.problem} />
              </div>

              {!isSubmitted ? (
                <div className="space-y-3">
                  {/* 填空：输入提交；大题：自评 */}
                  {q.question.type === 'fill-blank' ? (
                    <>
                      <Input
                        placeholder="输入你的答案..."
                        value={userAnswers[q.question.id] ?? ''}
                        onChange={(e) =>
                          setUserAnswers((prev) => ({ ...prev, [q.question.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmit(q);
                          }
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmit(q)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          提交答案
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSolution(q.question.id)}
                          className="text-xs"
                        >
                          查看解析
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        💡 大题采用自评模式：先自己在草稿纸上完成 → 点「看答案」对照 → 自评
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleSolution(q.question.id)}
                        >
                          {showSolution[q.question.id] ? '收起答案' : '👁 看答案 & 解析'}
                        </Button>
                      </div>
                      {/* 答案展开后显示自评按钮 */}
                      {showSolution[q.question.id] && (
                        <div className="space-y-2 pt-2">
                          <div className="text-xs text-muted-foreground">对照答案后，你做对了吗？</div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSelfEval(q, 'correct')}
                              className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                            >
                              ✓ 做对了
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSelfEval(q, 'wrong')}
                              className="bg-rose-600 hover:bg-rose-700 flex-1"
                            >
                              ✗ 做错了
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    {isCorrect ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="size-4" />回答正确
                      </span>
                    ) : (
                      <span className="text-rose-700 font-medium flex items-center gap-1">
                        <XCircle className="size-4" />回答错误
                      </span>
                    )}
                    {q.question.type !== 'fill-blank' && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        自评
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      参考答案：<RichTextRenderer text={q.question.answer} />
                    </span>
                  </div>
                  <button
                    onClick={() => toggleSolution(q.question.id)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {showSolution[q.question.id] ? (
                      <>
                        <ChevronUp className="size-3" />收起解析
                      </>
                    ) : (
                      <>
                        <ChevronDown className="size-3" />查看详细解析
                      </>
                    )}
                  </button>
                </div>
              )}

              <AnimatePresence>
                {showSolution[q.question.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-border/40">
                      <div className="text-xs font-medium text-foreground mb-1">解析：</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        <RichTextRenderer text={q.question.solution} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* 今日战报入口 */}
        {todayDone && warReport && (
          <Button
            variant="outline"
            className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-800 hover:bg-amber-100"
            onClick={() => setShowWarReport(true)}
          >
            <Trophy className="size-4 mr-2" />
            查看今日战报
          </Button>
        )}
      </CardContent>

      {/* 今日战报弹窗 */}
      <Dialog open={showWarReport} onOpenChange={setShowWarReport}>
        <DialogContent className="max-w-md">
          {warReport && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trophy className="size-5 text-amber-500" />
                  今日战报
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* 正确率 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center border border-emerald-100">
                    <div className="text-3xl font-bold text-emerald-600">
                      {Math.round(warReport.accuracy * 100)}%
                    </div>
                    <div className="text-xs text-emerald-700 mt-1">正确率</div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 p-4 text-center border border-teal-100 dark:from-teal-950/30 dark:to-emerald-950/30 dark:border-teal-800/50">
                    <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                      {warReport.correctCount}/{warReport.totalCount}
                    </div>
                    <div className="text-xs text-teal-700 dark:text-teal-300 mt-1">对/总题数</div>
                  </div>
                </div>

                {/* 用时 & 打卡 */}
                <div className="rounded-lg border border-border/60 p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="size-4" /> 用时
                    </span>
                    <span className="font-medium">
                      {formatDuration(warReport.durationSec)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Flame className="size-4 text-orange-500" /> 连续打卡
                    </span>
                    <span className="font-medium text-orange-600">
                      {warReport.streakNow} 天
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="size-4" /> 历史最长
                    </span>
                    <span className="font-medium">{warReport.streakLongest} 天</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CalendarDays className="size-4" /> 累计打卡
                    </span>
                    <span className="font-medium">{warReport.totalDays} 天</span>
                  </div>
                </div>

                {/* 新徽章 */}
                {warReport.isNewBadge && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 p-4 text-center border border-amber-200"
                  >
                    <div className="text-3xl mb-2">🎉</div>
                    <div className="font-bold text-amber-800 mb-1">解锁新徽章！</div>
                    <div className="text-sm text-amber-700">
                      {warReport.newBadgeNames.join(' · ')}
                    </div>
                  </motion.div>
                )}

                {/* 明日预告 */}
                {warReport.tomorrowTopic && (
                  <div className="rounded-lg bg-muted/50 p-4 border border-border/40">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Zap className="size-4 text-primary" />
                      明日预告
                    </div>
                    <div className="text-sm text-muted-foreground">
                      明天重点复习{' '}
                      <span className="font-semibold text-primary">
                        {COMPETITION_TOPICS.find((t) => t.key === warReport.tomorrowTopic)?.title ??
                          warReport.tomorrowTopic}
                      </span>{' '}
                      专题，记得来打卡哦～
                    </div>
                  </div>
                )}

                {/* 无错误时的鼓励 */}
                {warReport.wrongTopics.length === 0 && (
                  <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-center">
                    <Award className="size-8 text-emerald-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-emerald-700">
                      全对！今日状态满分 💪
                    </div>
                    <div className="text-xs text-emerald-600 mt-1">
                      保持手感，明天继续加油
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => setShowWarReport(false)}
                >
                  好的，继续加油
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
