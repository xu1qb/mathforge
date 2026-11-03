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
  Eye,
  BookOpen,
  Layers,
  Shuffle,
  ShieldCheck,
  ScrollText,
  FileText,
  Lightbulb,
  Dumbbell,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  COMPETITION_MOCK_EXAMS,
  MOCK_EXAM_PRESETS,
  QUESTION_SCORE_POINTS,
  SPECIAL_EXAM_PRESETS,
  generateSpecialExam,
  generateRandomMockExam,
  EXAM_DIFFICULTY_TIERS,
  type CompetitionQuestion,
  type MockExamConfig,
  type QuestionType,
  type ExamHistoryRecord,
  type DifficultyBias,
  type SpecialExamConfig,
  type ExamDifficultyTier,
  normalizeCompetitionAnswer,
} from '@/data/competition-mock';
import { COMPETITION_TOPICS } from '@/data/competition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { scopedStorage } from '@/lib/lark-mock';
import { useWrongBook } from '@/hooks/use-learning';
import MathInputField from '@/components/MathInputField';
import RichTextRenderer from '@/components/RichTextRenderer';

const EXAM_HISTORY_KEY = 'competition:exam-history';

interface Props {
  onGoTopic: (topicKey: string) => void;
}

type ExamPhase = 'select' | 'intro' | 'taking' | 'result';
type PauseState = 'running' | 'paused';
type ExamMode = 'practice' | 'full';

export default function MockExamTab({ onGoTopic }: Props) {
  const [phase, setPhase] = useState<ExamPhase>('select');
  const [currentConfig, setCurrentConfig] = useState<MockExamConfig | null>(null);
  const [questions, setQuestions] = useState<CompetitionQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [pauseState, setPauseState] = useState<PauseState>('running');
  const [startTime, setStartTime] = useState<number>(0);
  const [, setElapsedBeforePause] = useState<number>(0);
  const [examResult, setExamResult] = useState<ExamHistoryRecord | null>(null);
  const [history, setHistory] = useState<ExamHistoryRecord[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [difficultyBias, setDifficultyBias] = useState<DifficultyBias>('all');
  const [partialScoreMap, setPartialScoreMap] = useState<Record<string, number>>({});
  const [selectSubTab, setSelectSubTab] = useState<'comprehensive' | 'special'>('comprehensive');
  const [randomTier, setRandomTier] = useState<ExamDifficultyTier>('intermediate');
  const [historyTierFilter, setHistoryTierFilter] = useState<'all' | ExamDifficultyTier>('all');
  // 全真模式相关
  const [examMode, setExamMode] = useState<ExamMode>('practice');
  const { addWrong } = useWrongBook();

  const [currentSpecialConfig, setCurrentSpecialConfig] = useState<SpecialExamConfig | null>(null);
  const [isRandomExam, setIsRandomExam] = useState(false);
  const [currentRandomTier, setCurrentRandomTier] = useState<ExamDifficultyTier | null>(null);

  // 读取历史记录
  useEffect(() => {
    try {
      const raw = scopedStorage.getItem(EXAM_HISTORY_KEY);
      if (raw) {
        setHistory(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  // 保存历史记录
  const saveHistory = useCallback((record: ExamHistoryRecord) => {
    try {
      const updated = [record, ...history].slice(0, 20); // 保留最近 20 次
      setHistory(updated);
      scopedStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, [history]);

  // 计时器
  useEffect(() => {
    if (phase !== 'taking' || pauseState !== 'running') return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
     
  }, [phase, pauseState]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const shuffle = <T,>(arr: T[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // 按题型、数量和难度偏好从题库抽题
  const selectQuestions = useCallback(
    (config: MockExamConfig, bias: DifficultyBias = 'all'): CompetitionQuestion[] => {
      const selected: CompetitionQuestion[] = [];
      const effectiveBias = config.difficultyBias ?? bias;

      config.structure.forEach((sec) => {
        let pool = COMPETITION_MOCK_EXAMS.filter(
          (q) => q.type === sec.type && !selected.find((s) => s.id === q.id),
        );

        // 难度偏好过滤
        if (effectiveBias === 'basic') {
          pool = pool.filter((q) => q.difficulty <= 1);
        } else if (effectiveBias === 'advanced') {
          pool = pool.filter((q) => q.difficulty >= 2);
        } else if (effectiveBias === 'challenge') {
          // 挑战：优先难度 3，不够再取 2
          const hardPool = pool.filter((q) => q.difficulty >= 2);
          if (hardPool.length >= sec.count) {
            pool = hardPool;
          }
        }

        // 如果过滤后题量不够，回退到全部同题型
        if (pool.length < sec.count) {
          pool = COMPETITION_MOCK_EXAMS.filter(
            (q) => q.type === sec.type && !selected.find((s) => s.id === q.id),
          );
        }

        const picked = shuffle(pool).slice(0, sec.count);
        selected.push(...picked);
      });
      return selected;
    },
    [],
  );

  const startExam = useCallback(
    (config: MockExamConfig) => {
      const qs = selectQuestions(config, difficultyBias);
      if (qs.length === 0) {
        toast.error('题库中暂无符合条件的题目');
        return;
      }
      setCurrentConfig(config);
      setCurrentSpecialConfig(null);
      setQuestions(qs);
      setAnswers({});
      setTimeLeft(config.duration * 60);
      setPauseState('running');
      setStartTime(Date.now());
      setElapsedBeforePause(0);
      setCurrentQIndex(0);
      setExamResult(null);
      if (examMode === 'full') {
        setPhase('intro');
      } else {
        setPhase('taking');
      }
    },
    [selectQuestions, difficultyBias, examMode],
  );

  const startSpecialExam = useCallback(
    (config: SpecialExamConfig) => {
      const qs = generateSpecialExam(config.topicKey);
      if (qs.length === 0) {
        toast.error('该专题题库暂未准备好');
        return;
      }
      // 构造一个兼容 MockExamConfig 结构的配置
      const pseudoConfig: MockExamConfig = {
        id: config.id,
        title: config.title,
        description: config.description,
        duration: config.duration,
        totalScore: config.totalScore,
        structure: config.structure,
        difficultyBias: 'all',
      };
      setCurrentSpecialConfig(config);
      setCurrentConfig(pseudoConfig);
      setIsRandomExam(false);
      setQuestions(qs);
      setAnswers({});
      setTimeLeft(config.duration * 60);
      setPauseState('running');
      setStartTime(Date.now());
      setElapsedBeforePause(0);
      setCurrentQIndex(0);
      setExamResult(null);
      if (examMode === 'full') {
        setPhase('intro');
      } else {
        setPhase('taking');
      }
    },
    [examMode],
  );

  const startRandomExam = useCallback(() => {
    const result = generateRandomMockExam(randomTier);
    if (result.questions.length === 0) {
      toast.error('随机组卷失败，请稍后重试');
      return;
    }
    const tierInfo = result.tierInfo;
    const structure = result.questions.reduce(
      (acc, q) => {
        acc[q.type] = (acc[q.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const pseudoConfig: MockExamConfig = {
      id: `random-${result.examNumber}`,
      title: result.title,
      description: `${tierInfo.shortName} · ${tierInfo.description}`,
      duration: result.duration,
      totalScore: result.totalScore,
      structure: Object.entries(structure).map(([type, count]) => ({
        type: type as QuestionType,
        count,
        scorePerQuestion: Math.round(result.totalScore / result.questions.length),
      })),
      difficultyBias: tierInfo.key === 'basic' ? 'basic' : tierInfo.key === 'sprint' ? 'challenge' : 'advanced',
    };
    setCurrentConfig(pseudoConfig);
    setCurrentSpecialConfig(null);
    setIsRandomExam(true);
    setCurrentRandomTier(randomTier);
    setQuestions(result.questions);
    setAnswers({});
    setTimeLeft(result.duration * 60);
    setPauseState('running');
    setStartTime(Date.now());
    setElapsedBeforePause(0);
    setCurrentQIndex(0);
    setExamResult(null);
    if (examMode === 'full') {
      setPhase('intro');
    } else {
      setPhase('taking');
    }
    toast.success(`${result.title} 已生成，祝你好运！`);
  }, [randomTier, examMode]);

  const togglePause = useCallback(() => {
    if (examMode === 'full') return; // 全真模式不可暂停
    if (pauseState === 'running') {
      setPauseState('paused');
      setElapsedBeforePause((prev) => prev + (Date.now() - startTime) / 1000);
    } else {
      setStartTime(Date.now());
      setPauseState('running');
    }
  }, [pauseState, startTime, examMode]);

  // 从考前说明页进入全真考试
  const startFullExam = useCallback(() => {
    setPhase('taking');
    setStartTime(Date.now());
  }, []);

  const gradeExam = useCallback(
    (qs: CompetitionQuestion[], ans: Record<string, string>, config: MockExamConfig): ExamHistoryRecord => {
      const details = qs.map((q) => {
        const userAns = ans[q.id] || '';
        let earned = 0;
        let isCorrect = false;

        if (q.type === 'fill-blank') {
          // 填空题精确匹配
          const u = normalizeCompetitionAnswer(userAns);
          const c = normalizeCompetitionAnswer(q.answer);
          isCorrect = u === c;
          earned = isCorrect ? q.score : 0;
        } else {
          // 计算/证明题：有内容给 50%，内容较多（>30 字符）给 70%
          const len = userAns.trim().length;
          if (len === 0) {
            earned = 0;
            isCorrect = false;
          } else if (len > 80) {
            earned = Math.floor(q.score * 0.7);
            isCorrect = false;
          } else {
            earned = Math.floor(q.score * 0.5);
            isCorrect = false;
          }
        }

        return {
          questionId: q.id,
          topic: q.topic,
          type: q.type,
          score: q.score,
          earned,
          userAnswer: userAns,
          correctAnswer: q.answer,
          isCorrect,
          gradingSource: 'auto' as const,
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

      const actualDuration = Math.floor(config.duration * 60 - timeLeft);

      const examKind: 'preset' | 'random' | 'special' = isRandomExam
        ? 'random'
        : currentSpecialConfig
          ? 'special'
          : 'preset';

      return {
        id: `exam-${Date.now()}`,
        configId: config.id,
        configTitle: config.title,
        score,
        totalScore,
        correctCount,
        totalCount: qs.length,
        duration: actualDuration,
        durationTotal: config.duration * 60,
        date: Date.now(),
        topicStats,
        questionDetails: details,
        hasSelfEval: false,
        examKind,
        difficultyTier: isRandomExam && currentRandomTier ? currentRandomTier : undefined,
        isFullMode: examMode === 'full',
      };
    },
    [timeLeft, isRandomExam, currentRandomTier, examMode],
  );

  const handleFinish = useCallback(() => {
    if (!currentConfig) return;
    const result = gradeExam(questions, answers, currentConfig);
    setExamResult(result);
    saveHistory(result);
    setPhase('result');
    toast.success(
      `交卷完成！得分 ${result.score}/${result.totalScore}，正确率 ${Math.round((result.correctCount / result.totalCount) * 100)}%`,
    );

    // 答错的题批量写入错题本
    const wrongDetails = result.questionDetails.filter((d) => !d.isCorrect);
    if (wrongDetails.length > 0) {
      wrongDetails.forEach((d) => {
        const q = questions.find((qq) => qq.id === d.questionId);
        if (!q) return;
        const pq = {
          id: q.id,
          topicKey: q.topic,
          question: q.problem,
          questionLatex: q.problem,
          answer: q.answer,
          answerDisplay: q.answer,
          answerType: 'expression' as const,
          steps: q.solution ? q.solution.split('\n') : [],
          difficulty: (q.difficulty === 1 ? 'basic' : q.difficulty === 2 ? 'advanced' : 'competition') as 'basic' | 'advanced' | 'competition',
        };
        addWrong(pq, d.userAnswer, 'auto');
      });
    }
  }, [currentConfig, questions, answers, gradeExam, saveHistory, addWrong]);

  const currentQ = questions[currentQIndex];

  // ====== 选择阶段 ======
  if (phase === 'select') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 模式切换：练习模式 / 全真模式 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={examMode} onValueChange={(v) => v && setExamMode(v as ExamMode)}>
              <ToggleGroupItem value="practice" aria-label="练习模式">
                <BookOpen className="size-3.5 mr-1.5" />
                练习模式
              </ToggleGroupItem>
              <ToggleGroupItem value="full" aria-label="全真模式">
                <ShieldCheck className="size-3.5 mr-1.5" />
                全真模式
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {examMode === 'full' && (
            <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-md px-2.5 py-1 flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" />
              严格考场流程：不可暂停、不可跳题、不显示答案
            </div>
          )}
        </div>

        <Tabs value={selectSubTab} onValueChange={(v) => setSelectSubTab(v as 'comprehensive' | 'special')}>
          <TabsList className="w-full grid grid-cols-2 mb-1">
            <TabsTrigger value="comprehensive" className="flex items-center gap-1.5">
              <Trophy className="size-4" />
              综合模拟
            </TabsTrigger>
            <TabsTrigger value="special" className="flex items-center gap-1.5">
              <BookOpen className="size-4" />
              专题专项卷
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comprehensive" className="space-y-6 mt-4">
            {/* 随机组卷：三档难度 */}
            <Card className="border-border/60 bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="size-5 text-primary" />
                      随机模拟卷 · 三档难度
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        NEW
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      由 134 题型模板按竞赛命题权重随机抽题，三档难度按需选择，每次生成全新一套
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 三档难度卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {EXAM_DIFFICULTY_TIERS.map((tier) => {
                    const isActive = randomTier === tier.key;
                    const colorMap: Record<string, string> = {
                      emerald: 'border-emerald-300 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-300',
                      violet: 'border-primary/30 bg-primary/10 text-primary',
                      rose: 'border-rose-300 dark:border-rose-800/40 bg-rose-50/60 dark:bg-rose-900/15 text-rose-700 dark:text-rose-300',
                    };
                    return (
                      <button
                        key={tier.key}
                        onClick={() => setRandomTier(tier.key)}
                        className={`text-left rounded-lg border-2 p-4 transition-all ${
                          isActive
                            ? `${colorMap[tier.color] || ''} ring-2 ring-offset-1 ring-current/40`
                            : 'border-border/60 bg-card hover:border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold ${isActive ? '' : 'text-foreground'}`}>
                            {tier.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            难度 {tier.coefficient}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {tier.description}
                        </p>
                        <p className="text-xs text-muted-foreground">{tier.targetPhase}</p>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          150 分钟 · 满分 100
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 当前档位说明 + 生成按钮 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-border/40">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {EXAM_DIFFICULTY_TIERS.find((t) => t.key === randomTier)?.name}
                    </span>
                    · {EXAM_DIFFICULTY_TIERS.find((t) => t.key === randomTier)?.targetPhase}
                  </div>
                  <Button
                    className={`${
                      randomTier === 'basic'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : randomTier === 'sprint'
                          ? 'bg-rose-600 hover:bg-rose-700'
                          : 'bg-primary hover:bg-primary/90'
                    } text-white`}
                    onClick={startRandomExam}
                  >
                    <Shuffle className="size-4 mr-1.5" />
                    生成{EXAM_DIFFICULTY_TIERS.find((t) => t.key === randomTier)?.shortName}卷
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 全真模拟卷 */}
            <Card className="border-border/60 bg-gradient-to-br from-emerald-50/50 to-transparent">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="size-5 text-amber-500" />
                      全真模拟卷
                    </CardTitle>
                    <CardDescription>仿照初赛结构组卷，5 填空 + 5 大题，150 分钟 100 分</CardDescription>
                  </div>
                  {/* 难度偏好 */}
                  <div className="shrink-0">
                    <label className="text-xs text-muted-foreground mb-1 block">难度偏好</label>
                    <Select value={difficultyBias} onValueChange={(v) => setDifficultyBias(v as DifficultyBias)}>
                      <SelectTrigger className="w-[140px] h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部难度</SelectItem>
                        <SelectItem value="basic">基础为主</SelectItem>
                        <SelectItem value="advanced">进阶为主</SelectItem>
                        <SelectItem value="challenge">挑战为主</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MOCK_EXAM_PRESETS.filter((p) =>
                  p.id === 'standard' || p.id === 'standard-b' || p.id === 'standard-c',
                ).map((preset) => (
                  <Card
                    key={preset.id}
                    className={`border-border/50 hover:border-emerald-300/60 transition-colors ${preset.id === 'standard-c' ? 'bg-gradient-to-br from-rose-50/50 to-amber-50/30 border-rose-200/60' : ''}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{preset.title}</CardTitle>
                        {preset.difficultyLabel && (
                          <Badge className="text-xs bg-rose-600 text-white border-rose-700 shrink-0">
                            {preset.difficultyLabel}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{preset.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {preset.duration} 分钟
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="size-4" />
                          满分 {preset.totalScore}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {preset.structure.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {s.type === 'fill-blank' ? '填空' : s.type === 'calculation' ? '计算' : '证明'} ×
                            {s.count}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        className={`w-full ${preset.id === 'standard-c' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        onClick={() => startExam(preset)}
                      >
                        <Play className="size-4 mr-1.5" />
                        开始模考
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* 专项训练 */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="size-5 text-emerald-600" />
                  专项训练
                </CardTitle>
                <CardDescription>针对特定题型或时间强度的训练模式</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_EXAM_PRESETS.filter((p) => p.id !== 'standard' && p.id !== 'standard-b').map(
                  (preset) => (
                    <Card key={preset.id} className="border-border/50 hover:border-emerald-300/60 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{preset.title}</CardTitle>
                        <CardDescription>{preset.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-4" />
                            {preset.duration} 分钟
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="size-4" />
                            满分 {preset.totalScore}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => startExam(preset)}
                        >
                          <Play className="size-4 mr-1.5" />
                          开始
                        </Button>
                      </CardContent>
                    </Card>
                  ),
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="special" className="space-y-6 mt-4">
            {/* 专题专项卷 */}
            <Card className="border-border/60 bg-gradient-to-br from-teal-50/40 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="size-5 text-teal-600" />
                  专题专项卷
                  <Badge variant="outline" className="bg-teal-100/60 text-teal-700 border-teal-200 text-xs h-5">
                    随机生成
                  </Badge>
                </CardTitle>
                <CardDescription>每卷聚焦单一专题，从生成引擎随机抽题，每次全新一套，快速检测单专题掌握度</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SPECIAL_EXAM_PRESETS.map((preset) => (
                  <Card
                    key={preset.id}
                    className="border-border/50 hover:border-teal-300/60 transition-colors"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="size-6 rounded bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {COMPETITION_TOPICS.find((t) => t.key === preset.topicKey)?.title.slice(0, 2) ?? '专'}
                        </span>
                        {preset.title}
                      </CardTitle>
                      <CardDescription>{preset.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {preset.duration} 分钟
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="size-3.5" />
                          {preset.totalScore} 分
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {preset.structure.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs px-1.5 py-0 h-5">
                            {s.type === 'fill-blank' ? '填空' : s.type === 'calculation' ? '计算' : '证明'}×{s.count}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        onClick={() => startSpecialExam(preset)}
                      >
                        <Play className="size-3.5 mr-1" />
                        开始专练
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 历史成绩 */}
        {history.length > 0 && (
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="flex items-center gap-2">
                  <History className="size-5 text-emerald-600" />
                  考试记录（最近 {history.length} 次）
                </CardTitle>
                <Select
                  value={historyTierFilter}
                  onValueChange={(v) => setHistoryTierFilter(v as typeof historyTierFilter)}
                >
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部档位</SelectItem>
                    <SelectItem value="basic">基础巩固</SelectItem>
                    <SelectItem value="intermediate">提高强化</SelectItem>
                    <SelectItem value="sprint">全真冲刺</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {history
                .filter(
                  (r) =>
                    historyTierFilter === 'all' ||
                    r.difficultyTier === historyTierFilter,
                )
                .slice(0, 6)
                .map((record) => {
                  const tier = EXAM_DIFFICULTY_TIERS.find(
                    (t) => t.key === record.difficultyTier,
                  );
                  return (
                    <div
                      key={record.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border/40 hover:bg-accent/30 transition-colors"
                    >
                      <div className="size-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {Math.round((record.score / record.totalScore) * 100)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {record.configTitle}
                          </span>
                          {record.isFullMode && (
                            <Badge variant="outline" className="text-xs shrink-0 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40">
                              全真
                            </Badge>
                          )}
                          {tier && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {tier.shortName}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(record.date).toLocaleString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          · 用时 {Math.floor(record.duration / 60)} 分{' '}
                          {record.duration % 60} 秒
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'shrink-0',
                          record.score / record.totalScore >= 0.7 &&
                            'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
                          record.score / record.totalScore < 0.5 &&
                            'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40',
                        )}
                      >
                        {record.score}/{record.totalScore}
                      </Badge>
                    </div>
                  );
                })}
              {history.filter((r) => historyTierFilter === 'all' || r.difficultyTier === historyTierFilter)
                .length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  该档位暂无考试记录
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  }

  // ====== 考前说明（全真模式） ======
  if (phase === 'intro' && currentConfig) {
    const totalQuestions = questions.length;
    const structureSummary = currentConfig.structure
      .map((s) => {
        const typeLabel = s.type === 'fill-blank' ? '填空题' : s.type === 'calculation' ? '计算题' : '证明题';
        return `${typeLabel} ${s.count}题`;
      })
      .join(' · ');

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <Card className="border-border/60 bg-gradient-to-br from-rose-50/60 via-background to-amber-50/30 border-rose-200/50">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="size-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <CardTitle className="text-xl">全真模拟考试</CardTitle>
                <CardDescription>严格考场流程 · 不可暂停 · 不可跳题</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 试卷信息 */}
            <div className="p-4 rounded-lg border border-border/50 bg-background/60 space-y-2">
              <div className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <FileText className="size-4" />
                试卷信息
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">试卷名称</div>
                <div className="text-foreground font-medium">{currentConfig.title}</div>
                <div className="text-muted-foreground">考试时长</div>
                <div className="text-foreground font-medium">{currentConfig.duration} 分钟</div>
                <div className="text-muted-foreground">题目数量</div>
                <div className="text-foreground font-medium">{totalQuestions} 题</div>
                <div className="text-muted-foreground">满分</div>
                <div className="text-foreground font-medium">{currentConfig.totalScore} 分</div>
                <div className="text-muted-foreground">题型分布</div>
                <div className="text-foreground font-medium text-sm">{structureSummary}</div>
              </div>
            </div>

            {/* 考试规则 */}
            <div className="p-4 rounded-lg border border-border/50 bg-background/60 space-y-3">
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ScrollText className="size-4" />
                考试规则
              </div>
              <ul className="space-y-2 text-sm text-foreground/90">
                <li className="flex gap-2">
                  <span className="text-rose-600 shrink-0 mt-0.5">●</span>
                  <span>点击「开始考试」后立即计时，<strong>不可暂停</strong>，请确保环境安静。</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-600 shrink-0 mt-0.5">●</span>
                  <span>到达 {currentConfig.duration} 分钟时限将<strong>自动交卷</strong>，请合理分配时间。</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-600 shrink-0 mt-0.5">●</span>
                  <span>考试过程中<strong>无法查看答案和解析</strong>，交卷后可逐题回顾。</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-600 shrink-0 mt-0.5">●</span>
                  <span>答题按顺序进行，支持前进 / 后退，但<strong>不显示题号总览</strong>，模拟真实试卷翻页。</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-600 shrink-0 mt-0.5">●</span>
                  <span>交卷后成绩将存入历史记录，并标注「全真模式」。</span>
                </li>
              </ul>
            </div>

            {/* 确认 + 开始 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                请确认已准备好再开始，开始后不可中途退出重考。
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setPhase('select')}>
                  返回选卷
                </Button>
                <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={startFullExam}>
                  <Play className="size-4 mr-1.5" />
                  开始考试
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ====== 答题阶段 ======
  if (phase === 'taking' && currentQ) {
    const timeProgress = timeLeft / (currentConfig?.duration ? currentConfig.duration * 60 : 1);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {/* 顶部信息栏 */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 -mx-2 px-2 pt-2 pb-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="shrink-0">
              第 {currentQIndex + 1} / {questions.length} 题
            </Badge>
            {examMode === 'full' && (
              <Badge variant="outline" className="shrink-0 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40">
                <ShieldCheck className="size-3.5 mr-1" />
                全真模式
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                'shrink-0',
                timeProgress < 0.2 && 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40 animate-pulse',
              )}
            >
              <Clock className="size-3.5 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
            <div className="flex-1" />
            {examMode !== 'full' && (
              <Button variant="outline" size="sm" onClick={togglePause}>
                {pauseState === 'running' ? (
                  <>
                    <Pause className="size-4 mr-1.5" />
                    暂停
                  </>
                ) : (
                  <>
                    <Play className="size-4 mr-1.5" />
                    继续
                  </>
                )}
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleFinish}
            >
              交卷
            </Button>
          </div>
          {/* 进度条 */}
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 暂停遮罩（仅练习模式） */}
        <AnimatePresence>
          {pauseState === 'paused' && examMode !== 'full' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            >
              <Card className="w-80">
                <CardHeader>
                  <CardTitle className="text-center">考试已暂停</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={togglePause}>
                    <Play className="size-4 mr-1.5" />
                    继续答题
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 题目内容 */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={currentQ.type === 'fill-blank' ? 'default' : 'outline'}
                className={cn(
                  currentQ.type === 'fill-blank' && 'bg-blue-600',
                  currentQ.type === 'calculation' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
                  currentQ.type === 'proof' && 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800',
                )}
              >
                {currentQ.type === 'fill-blank' ? '填空题' : currentQ.type === 'calculation' ? '计算题' : '证明题'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {currentQ.score} 分
              </Badge>
              <Badge variant="outline" className="text-xs">
                难度 {'★'.repeat(currentQ.difficulty)}{'☆'.repeat(3 - currentQ.difficulty)}
              </Badge>
              <div className="ml-auto text-xs text-muted-foreground">
                {COMPETITION_TOPICS.find((t) => t.key === currentQ.topic)?.title}
              </div>
            </div>
            <CardTitle className="text-lg leading-relaxed"><RichTextRenderer text={currentQ.problem} /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQ.type === 'fill-blank' ? (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  答案：
                </label>
                <MathInputField
                  value={answers[currentQ.id] || ''}
                  onChange={(v) => setAnswers((prev) => ({ ...prev, [currentQ.id]: v }))}
                  placeholder="输入答案，如 √2 / 3.14 / pi/4"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    我的作答要点（选填，可空白）：
                  </label>
                  <textarea
                    className="w-full min-h-[160px] p-3 rounded-lg border border-input bg-background text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                    }
                    placeholder="可选：写下你的解题思路或关键步骤..."
                  />
              </div>

              {/* 自评模式：查看参考答案 + 自评按钮（仅练习模式） */}
              {examMode !== 'full' && (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Eye className="size-4" />
                    大题采用自评模式：先做题 → 看答案 → 自评分
                  </div>

                  {/* 查看参考答案 */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="reference" className="border rounded-lg px-3">
                      <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="size-3.5" />
                          查看参考答案与解析
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm space-y-3 pb-4 pt-2">
                        <div>
                          <span className="text-muted-foreground">最终答案：</span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 ml-1">
                            <RichTextRenderer text={currentQ.answer} />
                          </span>
                        </div>
                        {currentQ.solution && (
                          <div className="mt-3 space-y-2">
                            <div className="text-xs font-medium text-muted-foreground mb-1">解题过程：</div>
                            <div className="text-foreground/90">
                              <RichTextRenderer text={currentQ.solution} />
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* 踩点给分提示 */}
                  {QUESTION_SCORE_POINTS[currentQ.id] && (
                    <div className="p-4 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                      <div className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                        <Target className="size-3.5" />
                        踩点给分要点（共 {currentQ.score} 分）
                      </div>
                      <ul className="space-y-1">
                        {QUESTION_SCORE_POINTS[currentQ.id]!.map((sp, idx) => (
                        <li key={idx} className="text-xs text-amber-900/80 dark:text-amber-100/80 flex gap-2">
                            <span className="font-mono text-amber-600 shrink-0">{sp.points} 分</span>
                            <span>{sp.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 自评按钮（在交卷后结果页展示，这里只提示答题中可以对照） */}
                  <div className="text-xs text-muted-foreground">
                    <span className="flex items-start gap-1.5">
                      <Lightbulb className="size-3.5 mt-0.5 shrink-0" />
                      <span>交卷后可在结果页逐题自评「对 / 部分对 / 错」，得分将自动更新</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            )}

            {currentQ.hint && examMode !== 'full' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-emerald-700">
                    <span className="flex items-center gap-1.5">
                      <Lightbulb className="size-3.5" />
                      查看提示
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>解题提示</DialogTitle>
                  </DialogHeader>
                  <div className="text-sm text-foreground leading-relaxed"><RichTextRenderer text={currentQ.hint} /></div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* 导航按钮 */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
            disabled={currentQIndex === 0}
          >
            上一题
          </Button>

          {/* 题号选择器（仅练习模式 + 允许跳题） */}
          {examMode !== 'full' && (
            <div className="flex-1 flex flex-wrap gap-1.5 justify-center">
              {questions.map((q, i) => (
                <Button
                  key={q.id}
                  variant={answers[q.id] ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'w-10 h-10 md:w-9 md:h-9 p-0 text-sm md:text-xs',
                    i === currentQIndex && 'ring-2 ring-emerald-400 ring-offset-1',
                    answers[q.id] && 'bg-emerald-600 hover:bg-emerald-700',
                  )}
                  onClick={() => setCurrentQIndex(i)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}

          {examMode === 'full' && <div className="flex-1" />}

          {currentQIndex < questions.length - 1 ? (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setCurrentQIndex((i) => Math.min(questions.length - 1, i + 1))}
            >
              下一题 <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleFinish}>
              交卷 <CheckCircle2 className="size-4 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // ====== 结果阶段 ======
  // 自评某道大题（更新 examResult）
  const handleSelfEvalQuestion = (questionId: string, result: 'correct' | 'wrong' | 'partial', partialScore?: number) => {
    setExamResult((prev) => {
      if (!prev) return prev;
      const details = prev.questionDetails.map((d) => {
        if (d.questionId !== questionId) return d;
        const score = d.score;
        let earned = 0;
        let isCorrect = false;
        let gradingSource: 'auto' | 'self-eval' | 'self-eval-partial' = 'self-eval';
        if (result === 'correct') {
          earned = score;
          isCorrect = true;
        } else if (result === 'partial') {
          earned = Math.max(0, Math.min(score, partialScore ?? Math.floor(score * 0.5)));
          isCorrect = false;
          gradingSource = 'self-eval-partial';
        } else {
          earned = 0;
          isCorrect = false;
        }
        return { ...d, earned, isCorrect, gradingSource };
      });
      const score = details.reduce((s, d) => s + d.earned, 0);
      const correctCount = details.filter((d) => d.isCorrect).length;
      const hasSelfEval = details.some((d) => d.gradingSource !== 'auto');

      // 重新计算 topicStats
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

      return { ...prev, questionDetails: details, score, correctCount, topicStats, hasSelfEval };
    });
    toast.success('已更新自评结果');
  };

  if (phase === 'result' && examResult && currentConfig) {
    const percent = Math.round((examResult.score / examResult.totalScore) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 总分卡 */}
        <Card className="border-border/60 bg-gradient-to-br from-emerald-50/50 via-background to-amber-50/30">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative size-32 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="hsl(160 60% 45%)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${percent * 2.64} 264`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-emerald-700 tabular-nums">{percent}</div>
                  <div className="text-xs text-muted-foreground">得分率</div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {percent >= 80 ? (
                    <span className="flex items-center gap-1.5"><Trophy className="size-4" />优秀！继续保持</span>
                  ) : percent >= 60 ? (
                    <span className="flex items-center gap-1.5"><Dumbbell className="size-4" />不错，还有提升空间</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><BookOpen className="size-4" />加油，再接再厉</span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {examResult.configTitle} · 用时 {Math.floor(examResult.duration / 60)} 分{' '}
                  {examResult.duration % 60} 秒
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {examResult.isFullMode && (
                    <Badge variant="outline" className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40">
                      <ShieldCheck className="size-3 mr-1" />全真模式
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-background">
                    得分 {examResult.score}/{examResult.totalScore}
                  </Badge>
                  <Badge variant="outline" className="bg-background">
                    正确 {examResult.correctCount}/{examResult.totalCount} 题
                  </Badge>
                  <Badge variant="outline" className="bg-background">
                    正确率 {Math.round((examResult.correctCount / examResult.totalCount) * 100)}%
                  </Badge>
                  {examResult.hasSelfEval && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                      含自评得分
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 专题分析 */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-emerald-600" />
              专题正确率分析
            </CardTitle>
            <CardDescription>按专题统计答题情况，薄弱专题（低于50%）已标红</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {examResult.topicStats.map((ts) => {
              const acc = ts.totalQuestions > 0 ? ts.correctQuestions / ts.totalQuestions : 0;
              const isWeak = acc < 0.5 && ts.totalQuestions > 0;
              const topicObj = COMPETITION_TOPICS.find((t) => t.key === ts.topic);
              return (
                <div key={ts.topic} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground min-w-[5rem]">
                      {topicObj?.title ?? ts.topic}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ts.correctQuestions}/{ts.totalQuestions} 题 · {ts.score}/{ts.totalScore} 分
                    </span>
                    {isWeak && (
                      <Badge variant="outline" className="ml-auto bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40 text-xs">
                        <AlertTriangle className="size-3 mr-1" />
                        薄弱专题
                      </Badge>
                    )}
                    <span className="ml-auto font-mono text-xs tabular-nums">
                      {Math.round(acc * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        acc >= 0.7 && 'bg-emerald-500',
                        acc >= 0.5 && acc < 0.7 && 'bg-amber-500',
                        acc < 0.5 && 'bg-red-500',
                      )}
                      style={{ width: `${acc * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 题目回顾 */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              题目回顾
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {examResult.questionDetails.map((detail, idx) => {
              const q = questions.find((qq) => qq.id === detail.questionId);
              if (!q) return null;
              return (
                <div
                  key={detail.questionId}
                  className={cn(
                    'p-3 rounded-xl border transition-colors',
                    detail.isCorrect
                      ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-900/10'
                      : 'border-red-200/60 dark:border-red-800/40 bg-red-50/20 dark:bg-red-900/10',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        detail.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white',
                      )}
                    >
                      {detail.isCorrect ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                    </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">第 {idx + 1} 题</span>
                          <Badge variant="outline" className="text-xs">
                            {detail.type === 'fill-blank' ? '填空' : detail.type === 'calculation' ? '计算' : '证明'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {detail.earned}/{detail.score} 分
                          </span>
                          {/* 判分来源 */}
                          {detail.gradingSource !== 'auto' && (
                            <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                              {detail.gradingSource === 'self-eval' ? '自评' : '自评·部分对'}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-foreground mb-2 line-clamp-2"><RichTextRenderer text={q.problem} /></div>
                        <div className="text-xs space-y-1">
                          <div>
                            <span className="text-muted-foreground">你的答案：</span>
                            <span className="font-mono">{detail.userAnswer || '(未作答)'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">参考答案：</span>
                            <span className="font-mono text-emerald-700 dark:text-emerald-400"><RichTextRenderer text={detail.correctAnswer} /></span>
                          </div>
                        </div>

                        {/* 大题自评按钮 */}
                        {detail.type !== 'fill-blank' && (
                          <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                            <div className="text-xs text-muted-foreground">自评结果：</div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant={detail.gradingSource === 'self-eval' && detail.isCorrect ? 'default' : 'outline'}
                                className={detail.gradingSource === 'self-eval' && detail.isCorrect ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                                onClick={() => handleSelfEvalQuestion(detail.questionId, 'correct')}
                              >
                                ✓ 做对了
                              </Button>
                              <Button
                                size="sm"
                                variant={detail.gradingSource === 'self-eval-partial' ? 'default' : 'outline'}
                                className={detail.gradingSource === 'self-eval-partial' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                                onClick={() => {
                                  const current = partialScoreMap[detail.questionId];
                                  const score = current !== undefined ? current : Math.floor(detail.score * 0.5);
                                  handleSelfEvalQuestion(detail.questionId, 'partial', score);
                                }}
                              >
                                ◐ 部分对
                              </Button>
                              <Button
                                size="sm"
                                variant={detail.gradingSource === 'self-eval' && !detail.isCorrect ? 'destructive' : 'outline'}
                                className={detail.gradingSource === 'self-eval' && !detail.isCorrect ? 'bg-rose-600 hover:bg-rose-700' : ''}
                                onClick={() => handleSelfEvalQuestion(detail.questionId, 'wrong')}
                              >
                                ✗ 做错了
                              </Button>
                            </div>
                            {/* 部分对分数调整 */}
                            {detail.gradingSource === 'self-eval-partial' && (
                              <div className="flex items-center gap-3 pt-1">
                                <span className="text-xs text-muted-foreground shrink-0">得分：</span>
                                <input
                                  type="range"
                                  min={0}
                                  max={detail.score}
                                  value={detail.earned}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setPartialScoreMap((prev) => ({ ...prev, [detail.questionId]: val }));
                                    handleSelfEvalQuestion(detail.questionId, 'partial', val);
                                  }}
                                  className="flex-1 h-2 accent-amber-500"
                                />
                                <span className="text-xs font-mono font-semibold w-10 text-right">{detail.earned}分</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-3">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => currentConfig && startExam(currentConfig)}
          >
            <RotateCcw className="size-4 mr-1.5" />
            再来一套（重新抽题）
          </Button>
          <Button variant="outline" onClick={() => setPhase('select')}>
            返回模拟卷列表
          </Button>

          {/* 薄弱专题一键复习 */}
          {examResult.topicStats
            .filter((t) => t.totalQuestions > 0 && t.correctQuestions / t.totalQuestions < 0.5)
            .slice(0, 2)
            .map((t) => {
              const topicObj = COMPETITION_TOPICS.find((tt) => tt.key === t.topic);
              if (!topicObj) return null;
              return (
                <Button
                  key={t.topic}
                  variant="outline"
                  className="ml-auto border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => onGoTopic(t.topic)}
                >
                  <AlertTriangle className="size-4 mr-1.5" />
                  复习「{topicObj.title}」<ArrowRight className="size-4 ml-1" />
                </Button>
              );
            })}
        </div>
      </motion.div>
    );
  }

  return null;
}

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
