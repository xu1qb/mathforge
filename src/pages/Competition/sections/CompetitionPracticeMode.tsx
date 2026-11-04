// 竞赛专项练习模式
import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Sparkles,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Layers,
  BookOpen,
  AlertTriangle,
  Dumbbell,
} from 'lucide-react';
import { toast } from 'sonner';
import { useChallengeMode } from '@/hooks/use-challenge-mode';
import RichTextRenderer from '@/components/RichTextRenderer';
import { COMPETITION_QUESTIONS } from '@/data/competition-questions';
import type { CompetitionQuestion, CompetitionDifficulty } from '@/data/competition-questions';
import { COMPETITION_TOPICS as COMP_TOPICS_META } from '@/data/competition';
import { useWrongBook, useLearningStats } from '@/hooks/use-learning';
import PracticeHelpLinks from '@/components/PracticeHelpLinks';
import type { AnswerMode, WrongItemSource, WrongReason } from '@/hooks/use-learning';
import {
  generateProblemSet,
  countTotalProblemVariants,
  type GeneratedProblem,
} from '@/data/problem-generators';
import { getAllTrapQuestions, type TrapQuestion } from '@/data/competition-traps';
import PixelBattlePanel, { PixelBattleResult } from '@/components/PixelBattlePanel';

type CompMode = 'setup' | 'practicing' | 'result';
type QuestionSource = 'fixed' | 'generated' | 'mixed' | 'trap';

const DIFFICULTIES: { value: CompetitionDifficulty | 'all'; label: string }[] = [
  { value: 'all', label: '全部难度' },
  { value: 'easy', label: '基础' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

const COUNTS = [5, 10, 20, 30];

export default function CompetitionPracticeMode({
  onBack,
  answerMode,
}: {
  onBack: () => void;
  answerMode: AnswerMode;
}) {
  const [challengeMode] = useChallengeMode();
  const [mode, setMode] = useState<CompMode>('setup');
  const [topicKey, setTopicKey] = useState('all');
  const [difficulty, setDifficulty] = useState<CompetitionDifficulty | 'all'>('all');
  const [count, setCount] = useState(10);
  const [source, setSource] = useState<QuestionSource>('mixed');
  const [, setGeneratedCount] = useState(0);

  const [questions, setQuestions] = useState<CompetitionQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { correct: boolean; partial?: boolean }>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  // 每道题的错因（像素战斗模式答错后选择）
  const [wrongReasonMap, setWrongReasonMap] = useState<Record<number, WrongReason>>({});

  const { addWrong, setWrongReason, items: wrongBookItems } = useWrongBook();
  const { recordAnswer, recordSelfEvalAnswer } = useLearningStats();

  // 计时
  useEffect(() => {
    if (mode !== 'practicing') return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, startTime]);

  // 闯关模式 HP 耗尽 → 强制结束本组练习
  useEffect(() => {
    if (!challengeMode || mode !== 'practicing') return;
    const onHpDead = () => {
      // 延迟一下，让玩家看到 MISS 动画和 HP 弹窗
      setTimeout(() => {
        setMode('result');
      }, 1500);
    };
    window.addEventListener('mathforge:hp-dead', onHpDead);
    return () => window.removeEventListener('mathforge:hp-dead', onHpDead);
  }, [challengeMode, mode]);

  // GeneratedProblem → CompetitionQuestion 适配
  const adaptGenerated = useCallback(
    (gp: GeneratedProblem): CompetitionQuestion => {
      const diffMap: Record<number, CompetitionDifficulty> = {
        1: 'easy',
        2: 'medium',
        3: 'hard',
      };
      return {
        id: gp.id,
        topicKey: gp.topic,
        questionLatex: gp.problem,
        questionText: gp.problem,
        answerLatex: gp.answer,
        answerText: gp.answer,
        solution: gp.solution,
        difficulty: diffMap[gp.difficulty] ?? 'medium',
        points: gp.score,
        tags: [gp.templateId, gp.sourceLabel],
      };
    },
    [],
  );

  // TrapQuestion → CompetitionQuestion 适配
  const adaptTrapQuestion = useCallback(
    (tq: TrapQuestion, idx: number): CompetitionQuestion => {
      const diffMap: Record<number, CompetitionDifficulty> = {
        1: 'easy',
        2: 'medium',
        3: 'hard',
      };
      return {
        id: `trap-${tq.id}-${idx}`,
        topicKey: tq.topicKey,
        questionLatex: tq.problem,
        questionText: tq.problem,
        answerLatex: tq.answer,
        answerText: tq.answer,
        solution: tq.solution,
        difficulty: diffMap[tq.difficulty] ?? 'medium',
        points: tq.score,
        tags: ['陷阱题', tq.categoryId],
      };
    },
    [],
  );

  // 抽取题目
  const startPractice = useCallback(() => {
    const selected: CompetitionQuestion[] = [];

    // 陷阱模式：陷阱题 + 易错题型混合出题
    if (source === 'trap') {
      const allTraps = getAllTrapQuestions();
      let trapPool = allTraps;
      if (topicKey !== 'all') {
        trapPool = allTraps.filter((q) => q.topicKey === topicKey);
      }
      if (difficulty !== 'all') {
        const diffNum = difficulty === 'easy' ? 1 : difficulty === 'hard' ? 3 : 2;
        trapPool = trapPool.filter((q) => q.difficulty === diffNum);
      }
      trapPool.sort(() => Math.random() - 0.5);

      // 陷阱题占 40%，剩余用易错生成题（中等+偏难）
      const trapCount = Math.min(trapPool.length, Math.max(2, Math.floor(count * 0.4)));
      trapPool.slice(0, trapCount).forEach((tq, i) => {
        selected.push(adaptTrapQuestion(tq, i));
      });

      const genCount = Math.max(1, count - selected.length);
      const diffNum: 1 | 2 | 3 =
        difficulty === 'easy' ? 1 : difficulty === 'hard' ? 3 : 2;

      if (topicKey !== 'all') {
        const gens = generateProblemSet(topicKey, genCount, diffNum);
        gens.forEach((gp) => selected.push(adaptGenerated(gp)));
      } else {
        const perTopic = Math.ceil(genCount / COMP_TOPICS_META.length);
        let added = 0;
        for (const t of COMP_TOPICS_META) {
          if (added >= genCount) break;
          const take = Math.min(perTopic, genCount - added);
          const gens = generateProblemSet(t.key, take, diffNum);
          gens.forEach((gp) => selected.push(adaptGenerated(gp)));
          added += gens.length;
        }
      }

      // 打乱顺序
      selected.sort(() => Math.random() - 0.5);

      if (selected.length === 0) {
        toast.error('没有符合条件的陷阱题');
        return;
      }

      setQuestions(selected);
      setGeneratedCount(selected.filter((q) => q.id?.startsWith('gen-')).length);
      setCurrentIdx(0);
      setAnswers({});
      setShowAnswer(false);
      setStartTime(Date.now());
      setElapsed(0);
      setQuestionStartTime(Date.now());
      setMode('practicing');
      return;
    }

    // 1. 固定题库部分
    if (source === 'fixed' || source === 'mixed') {
      let pool = [...COMPETITION_QUESTIONS];
      if (topicKey !== 'all') {
        pool = pool.filter((q) => q.topicKey === topicKey);
      }
      if (difficulty !== 'all') {
        pool = pool.filter((q) => q.difficulty === difficulty);
      }
      pool.sort(() => Math.random() - 0.5);

      const fixedCount =
        source === 'fixed'
          ? count
          : Math.max(1, Math.floor(count * 0.4)); // mixed: 40% 固定题
      selected.push(...pool.slice(0, fixedCount));
    }

    // 2. 随机生成部分
    if (source === 'generated' || source === 'mixed') {
      const genCount =
        source === 'generated'
          ? count
          : Math.max(1, count - selected.length); // mixed: 补足剩余

      const diffNum: 1 | 2 | 3 =
        difficulty === 'easy' ? 1 : difficulty === 'hard' ? 3 : 2;

      // 单专题直接生成；多专题则均匀分配
      if (topicKey !== 'all') {
        const gens = generateProblemSet(topicKey, genCount, diffNum);
        gens.forEach((gp) => selected.push(adaptGenerated(gp)));
      } else {
        const perTopic = Math.ceil(genCount / COMP_TOPICS_META.length);
        let added = 0;
        for (const t of COMP_TOPICS_META) {
          if (added >= genCount) break;
          const take = Math.min(perTopic, genCount - added);
          const gens = generateProblemSet(t.key, take, diffNum);
          gens.forEach((gp) => selected.push(adaptGenerated(gp)));
          added += gens.length;
        }
      }
    }

    // 打乱顺序
    selected.sort(() => Math.random() - 0.5);

    if (selected.length === 0) {
      toast.error('没有符合条件的题目');
      return;
    }

    setQuestions(selected);
    setGeneratedCount(selected.filter((q) => q.id?.startsWith('gen-')).length);
    setCurrentIdx(0);
    setAnswers({});
    setShowAnswer(false);
    setStartTime(Date.now());
    setElapsed(0);
    setQuestionStartTime(Date.now());
    setMode('practicing');
  }, [topicKey, difficulty, count, source, adaptGenerated]);

  const q = questions[currentIdx];
  const answered = answers[currentIdx] !== undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const partialCount = Object.values(answers).filter((a) => a.partial).length;

  const handleSubmit = (correct: boolean, partial = false) => {
    if (!q) return;

    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: { correct, partial },
    }));

    // 答错 → 写入错题本（统一适配为 PracticeQuestion 格式）
    if (!correct) {
      const pq = {
        id: q.id,
        topicKey: q.topicKey,
        question: q.questionText ?? q.questionLatex ?? '',
        questionLatex: q.questionLatex ?? q.questionText ?? '',
        answer: q.answerText ?? q.answerLatex ?? '',
        answerDisplay: q.answerLatex ?? q.answerText ?? '',
        answerType: 'expression' as const,
        steps: q.solution ? q.solution.split('\n') : [],
        difficulty: 'advanced' as const,
      };
      const source: WrongItemSource = answerMode === 'self-eval' ? 'self-eval' : 'auto';
      addWrong(pq, '', source);
    }

    if (answerMode === 'self-eval') {
      const result = correct ? 'correct' : partial ? 'partial' : 'wrong';
      recordSelfEvalAnswer(q.topicKey, result);
    } else {
      recordAnswer(q.topicKey, correct);
    }

    // 像素皮肤 HUD / 地下城地图 刷新事件
    try {
      const qTime = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0;
      window.dispatchEvent(new CustomEvent('mathforge:practice-update'));
      window.dispatchEvent(new CustomEvent('mathforge:answer-result', { detail: { correct, partial, timeSeconds: qTime } }));
      if (correct) {
        window.dispatchEvent(new CustomEvent('mathforge:answer-correct'));
      }
    } catch {
      // ignore
    }

    if (answerMode === 'self-eval') {
      setShowAnswer(false);
    }
  };

  // 像素战斗模式：答错后选错因
  const handleWrongReason = useCallback((reason: WrongReason) => {
    const q = questions[currentIdx];
    if (!q) return;
    setWrongReasonMap((prev) => ({ ...prev, [currentIdx]: reason }));
    // 在错题本中找到对应题目并设置错因
    const questionText = q.questionText ?? q.questionLatex ?? '';
    const item = wrongBookItems.find(
      (w) => w.topicKey === q.topicKey && w.question.question === questionText && !w.mastered,
    );
    if (item) {
      setWrongReason(item.id, reason);
    }
  }, [questions, currentIdx, wrongBookItems, setWrongReason]);

  const goNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setShowAnswer(false);
      setQuestionStartTime(Date.now());
    } else {
      setMode('result');
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setShowAnswer(false);
      setQuestionStartTime(Date.now());
    }
  };

  const finish = () => setMode('result');

  const restart = () => {
    setMode('setup');
  };

  // 按专题统计
  const topicStats = useMemo(() => {
    const map = new Map<string, { total: number; correct: number; partial: number }>();
    questions.forEach((qn, idx) => {
      const a = answers[idx];
      if (!map.has(qn.topicKey)) {
        map.set(qn.topicKey, { total: 0, correct: 0, partial: 0 });
      }
      const t = map.get(qn.topicKey)!;
      t.total++;
      if (a?.correct) t.correct++;
      if (a?.partial) t.partial++;
    });
    return map;
  }, [questions, answers]);

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ChevronLeft className="size-4" /> 返回
        </Button>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="size-5 text-amber-500" />
          竞赛专项练习
          <Badge variant="outline" className="ml-2">
            {answerMode === 'self-eval' ? '自评模式' : '输入判分'}
          </Badge>
        </h2>
      </div>

      {mode === 'setup' && (
        <SetupPanel
          topicKey={topicKey}
          setTopicKey={setTopicKey}
          difficulty={difficulty}
          setDifficulty={(v) => setDifficulty(v as CompetitionDifficulty | 'all')}
          count={count}
          setCount={setCount}
          source={source}
          setSource={setSource}
          fixedTotal={COMPETITION_QUESTIONS.length}
          generatedTotal={countTotalProblemVariants()}
          onStart={startPractice}
        />
      )}

      {mode === 'practicing' && q && (
        challengeMode ? (
          <PixelBattlePanel
            question={q}
            index={currentIdx}
            total={questions.length}
            answered={answered}
            answer={answers[currentIdx]}
            showAnswer={showAnswer}
            onShowAnswer={() => setShowAnswer(true)}
            onSubmit={handleSubmit}
            onNext={goNext}
            onPrev={goPrev}
            onFinish={finish}
            elapsed={elapsed}
            correctCount={correctCount}
            answeredCount={answeredCount}
            answerMode={answerMode}
            questionStartTime={questionStartTime}
            onWrongReasonSelect={handleWrongReason}
            wrongReason={wrongReasonMap[currentIdx]}
          />
        ) : (
          <PracticePanel
            question={q}
            index={currentIdx}
            total={questions.length}
            answered={answered}
            answer={answers[currentIdx]}
            showAnswer={showAnswer}
            onShowAnswer={() => setShowAnswer(true)}
            onSubmit={handleSubmit}
            onNext={goNext}
            onPrev={goPrev}
            onFinish={finish}
            elapsed={elapsed}
            correctCount={correctCount}
            answeredCount={answeredCount}
            answerMode={answerMode}
          />
        )
      )}

      {mode === 'result' && (
        challengeMode ? (
          <PixelBattleResult
            total={questions.length}
            correct={correctCount}
            partial={partialCount}
            accuracy={accuracy}
            elapsed={elapsed}
            onRestart={restart}
            onBack={onBack}
          />
        ) : (
          <ResultPanel
            total={questions.length}
            correct={correctCount}
            partial={partialCount}
            accuracy={accuracy}
            elapsed={elapsed}
            topicStats={topicStats}
            onRestart={restart}
          />
        )
      )}
    </motion.div>
  );
}

// ============================================================
// 设置面板
// ============================================================
function SetupPanel({
  topicKey,
  setTopicKey,
  difficulty,
  setDifficulty,
  count,
  setCount,
  source,
  setSource,
  fixedTotal,
  generatedTotal,
  onStart,
}: {
  topicKey: string;
  setTopicKey: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  count: number;
  setCount: (v: number) => void;
  source: QuestionSource;
  setSource: (v: QuestionSource) => void;
  fixedTotal: number;
  generatedTotal: number;
  onStart: () => void;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="size-5 text-emerald-600" />
          练习配置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              题目来源
            </label>
            <Select value={source} onValueChange={(v) => setSource(v as QuestionSource)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">
                  <span className="flex items-center gap-2">
                    <Layers className="size-4" />
                    混合模式（固定 + 随机生成）
                  </span>
                </SelectItem>
                <SelectItem value="generated">
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" />
                    仅随机生成题（{generatedTotal.toLocaleString()}+ 变体）
                  </span>
                </SelectItem>
                <SelectItem value="fixed">
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4" />
                    仅固定题库（{fixedTotal} 道经典题）
                  </span>
                </SelectItem>
                <SelectItem value="trap">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-rose-500" />
                    陷阱模式（24 道陷阱题 + 易错生成题）
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">题量</label>
            <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTS.map((c) => (
                  <SelectItem key={c} value={String(c)}>
                    {c} 题
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">专题</label>
            <Select value={topicKey} onValueChange={setTopicKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部专题</SelectItem>
                {COMP_TOPICS_META.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">难度</label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as CompetitionDifficulty | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="text-sm text-muted-foreground">
            固定题库 <span className="font-medium text-foreground">{fixedTotal}</span> 道
            <span className="mx-2 text-border">·</span>
            随机生成 <span className="font-medium text-amber-600">{generatedTotal.toLocaleString()}+</span> 变体
          </div>
          <Button onClick={onStart} className="gap-2">
            <PlayCircle className="size-4" /> 开始练习
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 练习面板
// ============================================================
function PracticePanel({
  question,
  index,
  total,
  answered,
  answer,
  showAnswer,
  onShowAnswer,
  onSubmit,
  onNext,
  onPrev,
  onFinish,
  elapsed,
  correctCount,
  answeredCount,
  answerMode,
}: {
  question: CompetitionQuestion;
  index: number;
  total: number;
  answered: boolean;
  answer?: { correct: boolean; partial?: boolean };
  showAnswer: boolean;
  onShowAnswer: () => void;
  onSubmit: (correct: boolean, partial?: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  elapsed: number;
  correctCount: number;
  answeredCount: number;
  answerMode: AnswerMode;
}) {
  const progress = (index / total) * 100;

  const m = formatMinutes(elapsed);
  const acc = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 进度条 */}
      <Card className="border-border/60">
        <CardContent className="py-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Target className="size-3.5" />
              第 {index + 1} / {total} 题
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" /> {m}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
              <CheckCircle className="size-3.5 text-emerald-500" />
              {correctCount} 对 / {answeredCount} 答 ({acc}%)
            </div>
          </div>
          <Progress value={progress} className="mt-2 h-1" />
        </CardContent>
      </Card>

      {/* 题目 */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{question.topicKey}</Badge>
            <Badge
              variant={
                question.difficulty === 'hard'
                  ? 'destructive'
                  : question.difficulty === 'medium'
                  ? 'default'
                  : 'secondary'
              }
            >
              {question.difficulty === 'hard' ? '困难' : question.difficulty === 'medium' ? '中等' : '基础'}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              分值：{question.points} 分
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/30 p-5">
            <RichTextRenderer text={question.questionLatex} className="text-base" />
          </div>

          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 p-5"
            >
              <div className="font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                ✅ 参考答案
              </div>
              <RichTextRenderer text={question.answerLatex} />
              <div className="mt-4 text-sm text-emerald-900/80 dark:text-emerald-200/80">
                <div className="font-medium mb-2">解题过程：</div>
                <RichTextRenderer text={question.solution} className="space-y-1" />
              </div>
              {answer && !answer.correct && (
                <PracticeHelpLinks topicKey={question.topicKey} className="mt-4" />
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* 操作区 */}
      {!answered ? (
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {answerMode === 'self-eval' ? (
            <>
              <Button variant="outline" onClick={onShowAnswer} className="gap-2">
                <Eye className="size-4" /> 查看答案
              </Button>
              <Button
                variant="default"
                onClick={() => onSubmit(true)}
                disabled={!showAnswer}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <ThumbsUp className="size-4" /> 我做对了
              </Button>
              <Button
                variant="destructive"
                onClick={() => onSubmit(false)}
                disabled={!showAnswer}
                className="gap-2"
              >
                <ThumbsDown className="size-4" /> 做错了
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onShowAnswer} className="gap-2">
                <Eye className="size-4" /> 直接看答案
              </Button>
              <Button onClick={onShowAnswer} className="gap-2">
                <Sparkles className="size-4" /> 显示解答
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <Badge
            variant={
              answer?.correct
                ? 'default'
                : answer?.partial
                ? 'secondary'
                : 'destructive'
            }
            className="text-sm px-3 py-1"
          >
            {answer?.correct ? (
              <><CheckCircle className="size-3.5 mr-1" /> 答对了</>
            ) : answer?.partial ? (
              <>部分正确</>
            ) : (
              <><XCircle className="size-3.5 mr-1" /> 答错了</>
            )}
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onPrev} disabled={index === 0} className="gap-1">
              <ChevronLeft className="size-4" /> 上一题
            </Button>
            {index < total - 1 ? (
              <Button size="sm" onClick={onNext} className="gap-1">
                下一题 <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={onFinish} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                完成练习 <Trophy className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatMinutes(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ============================================================
// 结果面板
// ============================================================
function ResultPanel({
  total,
  correct,
  partial,
  accuracy,
  elapsed,
  topicStats,
  onRestart,
}: {
  total: number;
  correct: number;
  partial: number;
  accuracy: number;
  elapsed: number;
  topicStats: Map<string, { total: number; correct: number; partial: number }>;
  onRestart: () => void;
}) {
  const t = formatMinutes(elapsed);
  const getScoreLabel = () => {
    if (accuracy >= 90) return { icon: Trophy, text: '太棒了！', color: 'text-amber-500' };
    if (accuracy >= 70) return { icon: ThumbsUp, text: '不错哦', color: 'text-emerald-600' };
    if (accuracy >= 50) return { icon: Dumbbell, text: '继续加油', color: 'text-blue-600' };
    return { icon: BookOpen, text: '多练习', color: 'text-muted-foreground' };
  };
  const scoreLabel = getScoreLabel();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <Card className="border-border/60 bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardContent className="py-8 text-center">
          <div className="mb-4 flex justify-center">
            {(() => {
              const Icon = scoreLabel.icon;
              return <Icon className={`size-16 ${scoreLabel.color} stroke-[1.5]`} />;
            })()}
          </div>
          <h3 className={`text-2xl font-bold ${scoreLabel.color} mb-1`}>
            {scoreLabel.text}
          </h3>
          <div className="text-4xl font-black text-foreground my-4 tabular-nums">
            {accuracy}<span className="text-2xl text-muted-foreground">%</span>
          </div>
          <div className="text-sm text-muted-foreground">
            正确率 · {correct} 对 / {total} 题 · 用时 {t}
            {partial > 0 && ` · ${partial} 部分正确`}
          </div>
        </CardContent>
      </Card>

      {/* 按专题统计 */}
      {topicStats.size > 1 && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm">按专题统计</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from(topicStats.entries()).map(([topic, data]) => {
              const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
              const topicInfo = COMP_TOPICS_META.find((t) => t.key === topic);
              return (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{topicInfo?.title || topic}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {data.correct}/{data.total} ({acc}%)
                      {data.partial > 0 && <span className="ml-1 text-xs">+{data.partial} 部分对</span>}
                    </span>
                  </div>
                  <Progress value={acc} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={onRestart} className="gap-2">
          <RotateCcw className="size-4" /> 再来一组
        </Button>
      </div>
    </motion.div>
  );
}
