import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  Play,
  RotateCcw,
  Check,
  X,
  SkipForward,
  Flame,
  Target,
  Sparkles,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MathRenderer from '@/components/MathRenderer';
import {
  generatePracticeQuestion,
  checkPracticeAnswer,
  PRACTICE_TOPICS,
  type PracticeQuestion,
} from '@/lib/math-practice';
import { scopedStorage } from '@/lib/lark-mock';
import { useWrongBook, useLearningStats } from '@/hooks/use-learning';

const CHALLENGE_DURATION = 60; // 60 秒
const CHALLENGE_BEST_KEY = 'mathforge_challenge_best';

interface ChallengeBestRecord {
  score: number;
  topicKey: string;
  correct: number;
  wrong: number;
  skipped: number;
}

function getChallengeBest(topicKey: string): ChallengeBestRecord | null {
  try {
    const raw = scopedStorage.getItem(CHALLENGE_BEST_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, ChallengeBestRecord>;
    return all[topicKey] || null;
  } catch {
    return null;
  }
}

function saveChallengeBest(topicKey: string, record: ChallengeBestRecord) {
  try {
    const raw = scopedStorage.getItem(CHALLENGE_BEST_KEY);
    const all = raw ? JSON.parse(raw) : {};
    if (!all[topicKey] || record.score > all[topicKey].score) {
      all[topicKey] = record;
      scopedStorage.setItem(CHALLENGE_BEST_KEY, JSON.stringify(all));
    }
  } catch {
    // ignore
  }
}

function ChallengeMode() {
  const [topicKey, setTopicKey] = useState('all');
  const [phase, setPhase] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_DURATION);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const { addWrong } = useWrongBook();
  const { recordAnswer, recordQuestion, recordChallengeBest } = useLearningStats();
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'skip'; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  const best = getChallengeBest(topicKey);

  // 选择知识点
  const topicOptions = [
    { key: 'all', label: '全部知识点（混合）' },
    ...PRACTICE_TOPICS.map((t) => ({ key: t.key, label: t.label })),
  ];

  // 生成新题目
  const nextQuestion = useCallback(() => {
    const actualTopic = topicKey === 'all'
      ? PRACTICE_TOPICS[Math.floor(Math.random() * PRACTICE_TOPICS.length)].key
      : topicKey;
    const q = generatePracticeQuestion(actualTopic, 'basic');
    setQuestion(q);
    setUserAnswer('');
    setFeedback(null);
    recordQuestion(actualTopic);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [topicKey]);

  // 开始挑战
  const startChallenge = () => {
    setPhase('playing');
    setTimeLeft(CHALLENGE_DURATION);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setSkipped(0);
    nextQuestion();
  };

  // 结束挑战
  const finishChallenge = useCallback(() => {
    setPhase('finished');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    // 保存最高分
    saveChallengeBest(topicKey, {
      score,
      topicKey,
      correct,
      wrong,
      skipped,
    });
    // 学习统计：记录挑战
    recordChallengeBest(topicKey, score);
  }, [topicKey, score, correct, wrong, skipped]);

  // 倒计时
  useEffect(() => {
    if (phase !== 'playing') return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // 时间到 → 结束
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      finishChallenge();
    }
  }, [timeLeft, phase, finishChallenge]);

  // 提交答案
  const handleSubmit = () => {
    if (!question || phase !== 'playing') return;
    if (!userAnswer.trim()) {
      handleSkip();
      return;
    }

    const result = checkPracticeAnswer(question, userAnswer);
    if (result.correct) {
      setScore((s) => s + 10);
      setCorrect((c) => c + 1);
      setFeedback({ type: 'correct', message: '+10 分！' });
    } else {
      setScore((s) => Math.max(0, s - 2));
      setWrong((w) => w + 1);
      setFeedback({ type: 'wrong', message: `-2 分，正确答案：${question.answerDisplay}` });
      // 错题本收录
      addWrong(question, userAnswer);
    }
    // 学习统计
    recordAnswer(topicKey, result.correct);

    // 短暂反馈后自动下一题
    feedbackTimerRef.current = window.setTimeout(() => {
      nextQuestion();
    }, 900);
  };

  // 跳过
  const handleSkip = () => {
    if (phase !== 'playing') return;
    setSkipped((s) => s + 1);
    setFeedback({ type: 'skip', message: '跳过' });
    feedbackTimerRef.current = window.setTimeout(() => {
      nextQuestion();
    }, 500);
  };

  // 键盘回车提交
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleSkip();
    }
  };

  // 进度百分比
  const progressPercent = (timeLeft / CHALLENGE_DURATION) * 100;
  const isLowTime = timeLeft <= 10;

  const accuracy = correct + wrong === 0 ? 0 : Math.round((correct / (correct + wrong)) * 100);

  // 环形进度 SVG
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* 选择栏 */}
      {phase === 'idle' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Flame className="size-4 text-rose-500" />
              限时挑战
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              60 秒内尽量多答对题目。答对 <span className="font-semibold text-emerald-600 dark:text-emerald-400">+10 分</span>，
              答错 <span className="font-semibold text-rose-600 dark:text-rose-400">-2 分</span>，
              跳过 <span className="font-semibold text-muted-foreground">不扣分</span>。
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">知识点：</span>
                <Select value={topicKey} onValueChange={setTopicKey}>
                  <SelectTrigger className="w-52 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {topicOptions.map((t) => (
                      <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {best && (
                <Badge variant="outline" className="gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40">
                  <Trophy className="size-3.5" />
                  最佳纪录：{best.score} 分
                </Badge>
              )}
            </div>

            <Button
              onClick={startChallenge}
              className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white w-full md:w-auto h-11 px-8"
            >
              <Play className="size-4 mr-2" />
              开始 60 秒挑战
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 进行中 */}
      {phase === 'playing' && question && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            {/* 顶部进度条 */}
            <div className="h-1.5 w-full bg-muted">
              <motion.div
                className={`h-full ${isLowTime ? 'bg-rose-500' : 'bg-emerald-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <CardContent className="pt-5 space-y-5">
              {/* 顶部信息栏 */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* 环形倒计时 */}
                <div className="relative size-16 shrink-0">
                  <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      strokeWidth="5"
                      fill="none"
                      className="stroke-muted"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      strokeWidth="5"
                      fill="none"
                      className={`transition-all duration-300 ${isLowTime ? 'stroke-rose-500' : 'stroke-emerald-500'}`}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold tabular-nums ${isLowTime ? 'text-rose-500 animate-pulse' : 'text-foreground'}`}>
                      {timeLeft}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40">
                      <Trophy className="size-3" />
                      <span className="font-bold">{score}</span> 分
                    </Badge>
                    <Badge variant="outline" className="gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40">
                      <Check className="size-3" /> {correct}
                    </Badge>
                    <Badge variant="outline" className="gap-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40">
                      <X className="size-3" /> {wrong}
                    </Badge>
                    <Badge variant="outline" className="gap-1 bg-muted/50 dark:bg-slate-800 text-foreground dark:text-muted-foreground border-border dark:border-slate-700">
                      <SkipForward className="size-3" /> {skipped}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Target className="size-3.5" />
                    当前知识点：{PRACTICE_TOPICS.find((t) => t.key === question.topicKey)?.label || question.topicKey}
                  </div>
                </div>
              </div>

              {/* 题目 */}
              <div className="bg-muted/40 rounded-lg p-5 text-center">
                <div className="text-lg font-semibold text-foreground mb-1">{question.question}</div>
                <div className="text-2xl font-mono text-foreground mt-2 overflow-x-auto">
                  <MathRenderer expression={question.questionLatex} isInput />
                </div>
              </div>

              {/* 输入区 */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入答案，回车提交，Esc 跳过"
                    className="font-mono text-base h-11 flex-1"
                    autoFocus
                  />
                  <Button
                    onClick={handleSubmit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-5"
                  >
                    <Check className="size-4 mr-2" />
                    提交
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="h-11 px-4"
                  >
                    <SkipForward className="size-4" />
                  </Button>
                </div>
              </div>

              {/* 反馈 */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm font-medium ${
                      feedback.type === 'correct'
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40'
                        : feedback.type === 'wrong'
                        ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40'
                        : 'bg-muted dark:bg-slate-800 text-foreground dark:text-foreground'
                    }`}
                  >
                    {feedback.type === 'correct' && <Check className="size-4 shrink-0" />}
                    {feedback.type === 'wrong' && <X className="size-4 shrink-0" />}
                    {feedback.type === 'skip' && <SkipForward className="size-4 shrink-0" />}
                    <span>{feedback.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 结束结算 */}
      {phase === 'finished' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto size-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg">
                <Award className="size-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold">挑战结束！</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {/* 得分 */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">最终得分</div>
                <div className="text-5xl font-black text-amber-500 dark:text-amber-400 tabular-nums tracking-tight">
                  {score}
                </div>
                {best && score >= best.score && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                    <Sparkles className="size-3.5" />
                    新纪录！
                  </div>
                )}
              </div>

              {/* 统计 */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{correct}</div>
                  <div className="text-xs text-muted-foreground">答对</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{wrong}</div>
                  <div className="text-xs text-muted-foreground">答错</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-muted-foreground">{skipped}</div>
                  <div className="text-xs text-muted-foreground">跳过</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{accuracy}%</div>
                  <div className="text-xs text-muted-foreground">正确率</div>
                </div>
              </div>

              {/* 历史最佳 */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Trophy className="size-4 text-amber-500" />
                <span className="text-muted-foreground">历史最佳：</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {Math.max(score, best?.score || 0)} 分
                </span>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={startChallenge}
                  className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white h-10 px-6"
                >
                  <RotateCcw className="size-4 mr-2" />
                  再来一局
                </Button>
                <Button variant="outline" onClick={() => setPhase('idle')} className="h-10 px-6">
                  返回
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default memo(ChallengeMode);
