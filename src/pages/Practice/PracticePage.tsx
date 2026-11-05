import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MathInputField from '@/components/MathInputField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { EXPLAINER_TOPICS } from '@/data/explainers';
import { practiceLinksFor } from '@/data/topic-practice-links';
import { SidebarTrigger } from '@/components/AppSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Trophy,
  Play,
  RefreshCw,
  Check,
  X,
  ArrowRight,
  Flame,
  Target,
  Eye,
  Sparkles,
  Lightbulb,
  ChevronRight,
  BookOpen,
  BarChart3,
  Sigma,
  Activity,
  FunctionSquare,
  Hash,
  Shapes,
  MoveUpRight,
  Grid3X3,
  PlusSquare,
  Puzzle,
  TrendingUp,
  LogIn,
  MoveHorizontal,
  Circle,
  Box,
  Dices,
  GitBranch,
  ListOrdered,
  Waves,
  Spline,
  Repeat,
  Clock,
  Flag,
  SkipForward,
   Star,
   StarOff,
   AlertTriangle,
 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MathRenderer from '@/components/MathRenderer';
import HintPanel from '@/components/HintPanel';
import WrongReasonPicker from '@/components/WrongReasonPicker';
import VariantPanel from '@/components/VariantPanel';
import TtsButton from '@/components/TtsButton';
import { useMastery } from '@/hooks/use-mastery';
import ChallengeMode from './ChallengeMode';
import WrongBookSection from './WrongBookSection';
import StatsSection from './StatsSection';
import {
  generatePracticeQuestion,
  checkPracticeAnswer,
  PRACTICE_TOPICS,
  generateHintsFromSteps,
  type PracticeQuestion,
  type Difficulty,
} from '@/lib/math-practice';
import { fetchQueue, fetchPool, fillPool, fetchPoolStatus, reviewQuestion, type AiQuestion, type FillJob } from '@/lib/ai-client';
import { getCourseExercises } from '@/lib/course-exercises';
import { toast } from 'sonner';
import { scopedStorage } from '@/lib/lark-mock';
import { useWrongBook, useLearningStats, usePracticeSettings, useQuestionFavorites, WRONG_REASON_LABELS } from '@/hooks/use-learning';
import type { WrongReason } from '@/hooks/use-learning';
import { cn } from '@/lib/utils';

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string }[] = [
  { value: 'basic', label: '基础', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  { value: 'advanced', label: '进阶', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  { value: 'competition', label: '竞赛', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' },
];

const QUIZ_SIZE_OPTIONS = [5, 10, 20];

const STREAK_KEY = 'mathforge_practice_streak';
const BEST_STREAK_KEY = 'mathforge_practice_best_streak';

const iconMap: Record<string, typeof Sigma> = {
  Sigma,
  Activity,
  FunctionSquare,
  Target,
  Hash,
  Trophy,
  Puzzle,
  TrendingUp,
  LogIn,
  MoveUpRight,
  Grid3X3,
  PlusSquare,
  Shapes,
  MoveHorizontal,
  Circle,
  Box,
  Dices,
  BarChart3,
  GitBranch,
  ListOrdered,
  Waves,
  Spline,
  NotEqual: Sigma,
  Repeat,
};

const TOPIC_CATEGORIES = [
  { key: 'algebra', label: '代数', icon: Sigma },
  { key: 'geometry', label: '几何', icon: Shapes },
  { key: 'trigonometry', label: '三角函数', icon: Activity },
  { key: 'analysis', label: '数学分析', icon: FunctionSquare },
  { key: 'equations', label: '微分方程', icon: GitBranch },
  { key: 'probability', label: '概率统计', icon: BarChart3 },
  { key: 'number-theory', label: '数论', icon: Hash },
];

export default function PracticePage() {
  const navigate = useNavigate();
  // 支持 /practice?topic=xxx 深链（从原理讲解的「配套练习」进来）
  // 注意：HashRouter 下参数在 hash 内，必须用 useSearchParams 而不是 window.location.search
  const [searchParams] = useSearchParams();
  const [activeTopic, setActiveTopic] = useState(() => {
    const fromUrl = searchParams.get('topic');
    if (fromUrl && PRACTICE_TOPICS.some((t) => t.key === fromUrl)) return fromUrl;
    return PRACTICE_TOPICS[0].key;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('basic');
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  // AI 题库：只使用审核通过的题
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiPool, setAiPool] = useState<AiQuestion[]>([]);
  const [aiCursor, setAiCursor] = useState(0);
  const [fillJob, setFillJob] = useState<FillJob | null>(null);
  // 课程习题模式：直接刷三门课程的课后题
  const [courseMode, setCourseMode] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');
  // 当前答错的错题 id（用于选错因）
  const [currentWrongKey, setCurrentWrongKey] = useState<{ topicKey: string; question: string } | null>(null);

  // 变式面板
   const [variantOpen, setVariantOpen] = useState(false);
   const { markMotherCorrect, markGuessed, getRecord } = useMastery();
 
   // 蒙对检测器
   const [showGuessPrompt, setShowGuessPrompt] = useState(false);
   const [answerTimeSpent, setAnswerTimeSpent] = useState(0);

  // 计分系统
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // 刷题模式
  const [quizMode, setQuizMode] = useState(false);
  const [quizSize, setQuizSize] = useState(10);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  // 刷题会话：记录每题的答题详情（用于结束页专题分布）
  const [quizDetails, setQuizDetails] = useState<Array<{
    topicKey: string;
    topicLabel: string;
    category: string;
    correct: boolean;
    timeSpent: number;
    isGuessed: boolean;
    isSkipped: boolean;
  }>>([]);

  // 每题计时器（秒），填空题 180s，自评模式不计时
  const [timeLeft, setTimeLeft] = useState(180);
  const timerRef = useRef<number | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // 标记为不确定（蒙的）
  const [isGuessed, setIsGuessed] = useState(false);

  // 苏格拉底式提示层级：0=未用 1=方向 2=中间步 3=完整解析
  const [hintLevel, setHintLevel] = useState(0);

  // 错题本 & 学习统计
  const { addWrong, addGuessedCorrect, items, setWrongReason, guessedDueToday } = useWrongBook();
  const { recordAnswer, recordSelfEvalAnswer, recordQuestion, recordSession, recordHintUsage, stats } = useLearningStats();
  const { answerMode, setAnswerMode } = usePracticeSettings();
  const { toggleFavorite, isFavorited } = useQuestionFavorites();

  // 自评模式：答案是否已展开
  const [showAnswer, setShowAnswer] = useState(false);
  // 自评结果：'correct' | 'wrong' | null
  const [selfEvalResult, setSelfEvalResult] = useState<'correct' | 'wrong' | null>(null);

  // 各知识点做题统计
  const statsByTopic = stats.topics;

  // 当前知识点的历史正确率 → 给难度建议
  const topicStat = statsByTopic[activeTopic];
  const topicAccuracy = topicStat && topicStat.attempts > 0 ? topicStat.correct / topicStat.attempts : null;
  const difficultyHint =
    topicAccuracy === null || (topicStat?.attempts ?? 0) < 2
      ? null
      : topicAccuracy >= 0.85 && difficulty !== 'competition'
        ? { text: '正确率 ' + Math.round(topicAccuracy * 100) + '%，可以试试' + (difficulty === 'basic' ? '进阶' : '竞赛') + '了', next: (difficulty === 'basic' ? 'advanced' : 'competition') as Difficulty, label: difficulty === 'basic' ? '切到进阶' : '切到竞赛' }
        : topicAccuracy <= 0.5 && difficulty !== 'basic'
          ? { text: '正确率 ' + Math.round(topicAccuracy * 100) + '%，先打牢基础更稳', next: 'basic' as Difficulty, label: '切到基础' }
          : null;

  // 初始加载连胜记录
  useEffect(() => {
    try {
      const s = scopedStorage.getItem(STREAK_KEY);
      const b = scopedStorage.getItem(BEST_STREAK_KEY);
      if (s) setStreak(parseInt(s, 10) || 0);
      if (b) setBestStreak(parseInt(b, 10) || 0);
    } catch {
      // ignore
    }
  }, []);

  // 统一应用一道题：重置答题状态
  const applyQuestion = useCallback(
    (q: PracticeQuestion) => {
      setQuestion(q);
      setUserAnswer('');
      setIsChecked(false);
      setIsCorrect(false);
      setFeedback('');
      setShowAnswer(false);
      setSelfEvalResult(null);
      setIsGuessed(false);
      setHintLevel(0);
      setCurrentWrongKey(null);
      setTimeLeft(180);
      questionStartTimeRef.current = Date.now();
      recordQuestion(activeTopic);
    },
    [activeTopic, recordQuestion]
  );

  // 生成新题目
  const newQuestion = useCallback(() => {
    let q: PracticeQuestion;
    if (courseMode) {
      const pool = getCourseExercises();
      const item = pool[Math.floor(Math.random() * pool.length)];
      q = { ...item };
    } else if (aiEnabled && aiPool.length > 0) {
      const item = aiPool[aiCursor % aiPool.length];
      q = {
        id: item.id,
        topicKey: activeTopic,
        question: item.question,
        questionLatex: item.questionLatex,
        answer: item.answer,
        answerDisplay: item.answerDisplay ?? item.answer,
        answerType: item.answerType,
        steps: item.steps,
        difficulty: item.difficulty,
      };
      setAiCursor((c) => c + 1);
    } else {
      q = generatePracticeQuestion(activeTopic, difficulty);
    }
    applyQuestion(q);
  }, [activeTopic, difficulty, recordQuestion, aiEnabled, aiPool, aiCursor, courseMode, applyQuestion]);

  // 切换课程题模式时立刻换题（setState 异步，不能在同一次点击里读新值）
  const prevCourseModeRef = useRef(courseMode);
  useEffect(() => {
    if (courseMode === prevCourseModeRef.current) return;
    prevCourseModeRef.current = courseMode;
    if (courseMode) {
      const pool = getCourseExercises();
      if (pool.length > 0) {
        applyQuestion({ ...pool[Math.floor(Math.random() * pool.length)] });
      }
    } else {
      applyQuestion(generatePracticeQuestion(activeTopic, difficulty));
    }
  }, [courseMode, applyQuestion, activeTopic, difficulty]);

  // 拉取「当前知识点」审核通过的 AI 题
  // 后台补题：预生成 10 道，跑完自动刷新题库
  const handleFillPool = useCallback(async () => {
    const label = PRACTICE_TOPICS.find((t) => t.key === activeTopic)?.label;
    if (!label) return;
    try {
      const { job } = await fillPool(label, difficulty, 10);
      if (job.error) {
        toast.error(job.error);
        return;
      }
      setFillJob(job);
      toast('开始后台补题：' + label + '（严格档，验证通过才入库）');
      // 轮询进度
      for (let i = 0; i < 120; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const status = await fetchPoolStatus(label).catch(() => null);
        const cur = status?.job;
        if (cur) setFillJob(cur);
        if (!cur?.running) {
          if (cur?.filled) {
            toast.success('补题完成：新增 ' + cur.filled + ' 道');
            setAiEnabled(true);
            setAiCursor(0);
          } else if (cur?.error) {
            toast.error(cur.error);
          }
          break;
        }
      }
    } catch (e) {
      toast.error('补题失败：' + String(e).slice(0, 60));
    } finally {
      setFillJob(null);
    }
  }, [activeTopic, difficulty]);

  const loadAiPool = useCallback(async () => {
    const label = PRACTICE_TOPICS.find((t) => t.key === activeTopic)?.label;
    if (!label) return;
    try {
      // 优先用预生成池（本地已入库，秒开、不打模型）
      const pool = await fetchPool(activeTopic, difficulty).catch(() => null);
      let mine = (pool?.questions ?? []) as typeof aiPool;
      let fromPool = mine.length > 0;

      if (mine.length === 0) {
        const data = await fetchQueue('approved');
        mine = data.questions.filter((q) => q.topic === label);
      }

      setAiPool(mine);
      setAiCursor(0);
      if (mine.length === 0) {
        setAiEnabled(false);
        toast('这个知识点还没有 AI 题，可以先用「补题」预生成', { description: '需要有在线模型配置' });
      } else {
        setAiEnabled(true);
        toast(
          fromPool ? '已切换到 AI 题库（' + mine.length + ' 题，秒开）' : '已切换到 AI 题库（' + mine.length + ' 题）',
        );
      }
    } catch {
      toast('后端未启动，无法加载 AI 题库');
    }
  }, [activeTopic, difficulty]);

  // 切换知识点时生成新题
  useEffect(() => {
    newQuestion();
  }, [newQuestion]);

  // 填空题计时器：自动判分模式下倒计时 3 分钟
  useEffect(() => {
    if (answerMode !== 'auto' || isChecked || !question) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    setTimeLeft(180);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // 时间到自动判错
          setTimeout(() => handleTimeUp(), 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [question?.id, answerMode, isChecked]);

  // 时间到自动判错
  const handleTimeUp = () => {
    if (isChecked || !question) return;
    setIsChecked(true);
    setIsCorrect(false);
    setFeedback('时间到，已自动判错');
    addWrong(question, '', 'timeout', { timeSpent: 180, isGuessed, hintLevel: hintLevel || undefined });
    recordAnswer(activeTopic, false);
    setStreak(0);
    try { scopedStorage.setItem(STREAK_KEY, '0'); } catch {}
    toast.info('时间到', { description: '已自动收录到错题本' });
    if (quizMode) {
      recordQuizDetail(false, false);
    }
  };

  // 跳过当前题
  const handleSkip = () => {
    if (!question || isChecked) return;
    setIsChecked(true);
    setIsCorrect(false);
    setFeedback('已跳过');
    recordAnswer(activeTopic, false);
    if (quizMode) {
      recordQuizDetail(false, true);
    }
  };

  // 收藏 / 取消收藏
  const handleToggleFavorite = () => {
    if (!question) return;
    const topic = PRACTICE_TOPICS.find((t) => t.key === question.topicKey);
    const { added } = toggleFavorite({
      id: question.id,
      topicKey: question.topicKey,
      topicLabel: topic?.label || question.topicKey,
      category: topic?.category || 'other',
      difficulty: question.difficulty,
      question: question.question,
      questionLatex: question.questionLatex,
      answer: question.answer,
      answerDisplay: question.answerDisplay,
      steps: question.steps,
    });
    toast.success(added ? '已收藏本题' : '已取消收藏');
  };

  // 开始刷题模式
  const startQuiz = () => {
    setQuizMode(true);
    setQuizIndex(0);
    setQuizCorrect(0);
    setQuizFinished(false);
    setQuizDetails([]);
    newQuestion();
  };

  const exitQuiz = () => {
    setQuizMode(false);
    setQuizFinished(false);
    setQuizDetails([]);
  };

  // 记录本题答题详情到刷题会话
  const recordQuizDetail = useCallback((correct: boolean, isSkipped: boolean) => {
    if (!question || !quizMode) return;
    const topic = PRACTICE_TOPICS.find((t) => t.key === question.topicKey);
    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    setQuizDetails((prev) => [
      ...prev,
      {
        topicKey: question.topicKey,
        topicLabel: topic?.label || question.topicKey,
        category: topic?.category || 'other',
        correct,
        timeSpent,
        isGuessed,
        isSkipped,
      },
    ]);
  }, [question, quizMode, isGuessed]);

  // 检查答案
  const handleCheck = () => {
    if (!question) return;
    if (!userAnswer.trim()) {
      toast.info('请输入答案');
      return;
    }

    const result = checkPracticeAnswer(question, userAnswer);
    setIsChecked(true);
    setIsCorrect(result.correct);
    setFeedback(result.message);

    // 学习统计
    recordAnswer(activeTopic, result.correct);

    // 像素皮肤 HUD / 地下城地图 刷新事件
    try {
      window.dispatchEvent(new CustomEvent('mathforge:practice-update'));
      window.dispatchEvent(new CustomEvent('mathforge:answer-result', { detail: { correct: result.correct } }));
      if (result.correct) {
        window.dispatchEvent(new CustomEvent('mathforge:answer-correct'));
      }
    } catch {
      // ignore
    }

    // 错题本：答错自动收录
    if (!result.correct) {
      addWrong(question, userAnswer, 'auto', { timeSpent: Math.round((Date.now() - questionStartTimeRef.current) / 1000), isGuessed, hintLevel: hintLevel || undefined });
      setCurrentWrongKey({ topicKey: question.topicKey, question: question.question });
    } else {
      setCurrentWrongKey(null);
    }

    if (result.correct) {
       const newStreak = streak + 1;
       setStreak(newStreak);
       try { scopedStorage.setItem(STREAK_KEY, String(newStreak)); } catch {}
       if (newStreak > bestStreak) {
         setBestStreak(newStreak);
         try { scopedStorage.setItem(BEST_STREAK_KEY, String(newStreak)); } catch {}
       }
       // 母题做对，更新掌握记录
       markMotherCorrect(question);
       toast.success('回答正确！🎉', { description: `当前连击：${newStreak}` });
 
       // 蒙对检测：用时 < 8 秒且非自证模式
       const tSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
       setAnswerTimeSpent(tSpent);
       if (tSpent < 8 && !quizMode) {
         setShowGuessPrompt(true);
       }
     } else {
      setStreak(0);
      try { scopedStorage.setItem(STREAK_KEY, '0'); } catch {}
      toast.error('答案不正确', { description: '看看解析，再试一题' });
    }

    if (quizMode) {
      if (result.correct) setQuizCorrect((c) => c + 1);
      recordQuizDetail(result.correct, false);
    }
  };

  // 蒙对：用户确认真会了 → 关闭弹层，正常掌握
  const handleGuessConfirm = () => {
    setShowGuessPrompt(false);
  };

  // 蒙对：用户标记其实没想到这步 → 加入蒙对重考队列
  const handleGuessMark = () => {
    if (!question) return;
    setShowGuessPrompt(false);
    // 加入蒙对重考队列
    addGuessedCorrect(question, userAnswer, { timeSpent: answerTimeSpent });
    // 母题掌握标记为待验证
    markGuessed(question);
    toast.info('已标记为待验证', { description: '3 天后重考，看看是不是真会啦' });
  };

  // 苏格拉底式提示层级变化
  const handleHintLevelChange = (level: number) => {
    if (level > hintLevel) {
      setHintLevel(level);
      recordHintUsage(activeTopic, level);
    }
  };

  // 右侧 tab（支持 URL hash 跳转）
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#wrong-book') return 'wrong';
    if (typeof window !== 'undefined' && window.location.hash === '#stats') return 'stats';
    return 'practice';
  });

  // 监听 hash 变化切 tab
  useEffect(() => {
    if (location.hash === '#wrong-book') setActiveTab('wrong');
    else if (location.hash === '#stats') setActiveTab('stats');
  }, [location.hash]);

  // 选择错因
  const handleWrongReasonSelect = (reason: WrongReason) => {
    if (!currentWrongKey) return;
    const matched = items.find(
      (w) => w.topicKey === currentWrongKey.topicKey && w.question.question === currentWrongKey.question,
    );
    if (matched) {
      setWrongReason(matched.id, reason);
      toast.success(`已标记：${WRONG_REASON_LABELS[reason]}`);
    }
  };

  // 自评模式：展开答案
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  // 自评模式：用户自评对错
  const handleSelfEval = (result: 'correct' | 'wrong') => {
    if (!question) return;
    setSelfEvalResult(result);
    setIsChecked(true); // 复用反馈面板的显示逻辑
    setIsCorrect(result === 'correct');

    // 统计
    recordSelfEvalAnswer(activeTopic, result);

    // 错题本：自评做错自动收录（source=self-eval）
    if (result === 'wrong') {
      addWrong(question, '自评错误', 'self-eval', { timeSpent: Math.round((Date.now() - questionStartTimeRef.current) / 1000), isGuessed, hintLevel: hintLevel || undefined });
      setCurrentWrongKey({ topicKey: question.topicKey, question: question.question });
    } else {
      setCurrentWrongKey(null);
    }

    if (result === 'correct') {
       const newStreak = streak + 1;
       setStreak(newStreak);
       try { scopedStorage.setItem(STREAK_KEY, String(newStreak)); } catch {}
       if (newStreak > bestStreak) {
         setBestStreak(newStreak);
         try { scopedStorage.setItem(BEST_STREAK_KEY, String(newStreak)); } catch {}
       }
       toast.success('自评正确！继续加油 💪', { description: `当前连击：${newStreak}` });
 
       // 蒙对检测：用时 < 8 秒
       const tSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
       setAnswerTimeSpent(tSpent);
       if (tSpent < 8 && !quizMode) {
         setShowGuessPrompt(true);
       }
     } else {
      setStreak(0);
      try { scopedStorage.setItem(STREAK_KEY, '0'); } catch {}
      toast.info('已记录为错题', { description: '记得复习解析步骤' });
    }

    if (quizMode && result === 'correct') {
      setQuizCorrect((c) => c + 1);
    }
    if (quizMode) {
      recordQuizDetail(result === 'correct', false);
    }
  };

  // 下一题 / 刷题模式下一题
  const handleNext = () => {
    if (quizMode) {
      if (quizIndex + 1 >= quizSize) {
        setQuizFinished(true);
        // 记录本次刷题会话（quizCorrect 已在 handleCheck 中更新）
        recordSession(quizCorrect, quizSize);
        return;
      }
      setQuizIndex((i) => i + 1);
    }
    newQuestion();
  };

  // 答题后按 Enter 进入下一题
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (!isChecked) handleCheck();
      else handleNext();
    }
  };

  const currentTopic = PRACTICE_TOPICS.find((t) => t.key === activeTopic)!;

  // 反查：优先用地址栏带过来的考点（from=xxx），否则取第一个关联考点
  const fromExplainer = searchParams.get('from');
  const relatedExplainer = useMemo(
    () =>
      EXPLAINER_TOPICS.find((t) => t.id === fromExplainer) ??
      EXPLAINER_TOPICS.find((t) => practiceLinksFor(t).includes(activeTopic)),
    [activeTopic, fromExplainer]
  );

  // 知识点多了以后平铺太长，加搜索过滤
  const [topicQuery, setTopicQuery] = useState('');
  const [topicLevel, setTopicLevel] = useState<'全部' | '基础' | '进阶' | '竞赛'>('全部');
  const filteredTopics = useMemo(() => {
    const q = topicQuery.trim();
    let list = PRACTICE_TOPICS;
    if (topicLevel !== '全部') list = list.filter((t) => t.level === topicLevel);
    if (!q) return list;
    return list.filter(
      (t) => t.label.includes(q) || t.category.includes(q) || t.key.includes(q)
    );
  }, [topicQuery, topicLevel]);
  const diffInfo = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)!;

  // 结束页：按专题分类统计
  const categoryStats = useMemo(() => {
    if (quizDetails.length === 0) return [];
    const map = new Map<string, { total: number; correct: number; label: string }>();
    for (const d of quizDetails) {
      const cat = d.category;
      if (!map.has(cat)) {
        const catInfo = TOPIC_CATEGORIES.find((c) => c.key === cat);
        map.set(cat, { total: 0, correct: 0, label: catInfo?.label || cat });
      }
      const s = map.get(cat)!;
      s.total += 1;
      if (d.correct) s.correct += 1;
    }
    return Array.from(map.entries()).map(([key, s]) => ({
      key,
      label: s.label,
      total: s.total,
      correct: s.correct,
      accuracy: Math.round((s.correct / s.total) * 100),
    }));
  }, [quizDetails]);

  // 结束页：总用时（秒）
  const totalTimeSpent = useMemo(
    () => quizDetails.reduce((s, d) => s + d.timeSpent, 0),
    [quizDetails],
  );
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}分${s}秒`;
  };

  return (
    <div className="space-y-6">
      {/* 页面顶栏 */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2 px-3 md:px-5 lg:px-7 h-14">
          <SidebarTrigger className="md:inline-flex" />
          <div className="flex-1 min-w-0 ml-1">
            <h1 className="text-base md:text-lg font-bold text-foreground truncate">
              练习训练
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40">
              <Flame className="size-3.5" />
              连击 {streak}
            </Badge>
            <Badge variant="outline" className="gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40">
              <Trophy className="size-3.5" />
              最佳 {bestStreak}
            </Badge>
            <ThemeToggle variant="header" />
          </div>
          <div className="md:hidden">
            <ThemeToggle variant="header" size="icon" />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 py-4 max-w-6xl mx-auto">
        <p className="text-sm text-muted-foreground">
          {PRACTICE_TOPICS.length} 大知识点随机出题，即时判分，附步骤详解。支持难度选择和刷题模式。
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-4">
        {/* 知识点分类选择（手机端排在题目之后） */}
        <div id="topic-panel" className="order-2 lg:order-1 lg:col-span-1 space-y-4">
          {/* 竞赛模拟快捷入口 */}
          <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Trophy className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">竞赛模拟</div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                    全国大学生数学竞赛风格模拟卷，限时答题
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 h-8"
                onClick={() => navigate('/competition?tab=mock')}
              >
                前往模拟卷 <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* 蒙对待验证提示 */}
          {guessedDueToday.length > 0 && (
            <Card className="border-orange-200/60 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 overflow-hidden cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              onClick={() => {
                // 跳转到错题本的 due tab，并打开蒙对重考
                navigate('/practice?tab=wrongbook#guess-review');
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-orange-900 dark:text-orange-100 text-sm">蒙对验证</div>
                    <div className="text-xs text-orange-700 dark:text-orange-300/80 mt-0.5">
                      你有 <span className="font-bold">{guessedDueToday.length}</span> 道题疑似蒙对，来验证一下是不是真会？
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="size-4 text-emerald-600 dark:text-emerald-400" />
                知识点
              </CardTitle>
              <CardDescription className="text-xs">选择练习的知识点</CardDescription>
              {relatedExplainer && (
                <button
                  onClick={() => navigate('/explainer?topic=' + relatedExplainer.id)}
                  className="mt-1 text-left text-xs text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  看「{relatedExplainer.title}」原理讲解 →
                </button>
              )}
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="relative">
                <Hash className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={topicQuery}
                  onChange={(e) => setTopicQuery(e.target.value)}
                  placeholder="搜索知识点…"
                  className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:border-emerald-400"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {(['全部', '基础', '进阶', '竞赛'] as const).map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setTopicLevel(lv)}
                    className="rounded-full border px-2.5 py-0.5 text-[11px] transition-colors"
                    style={{
                      borderColor: topicLevel === lv ? 'rgb(16 185 129)' : undefined,
                      color: topicLevel === lv ? 'rgb(5 150 105)' : undefined,
                    }}
                  >
                    {lv}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {TOPIC_CATEGORIES.map((cat) => {
                const topics = filteredTopics.filter((t) => t.category === cat.key);
                if (topics.length === 0) return null;
                const CatIcon = cat.icon;
                return (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex items-center gap-1.5 px-1 py-1.5">
                      <CatIcon className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {cat.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {topics.length}
                      </span>
                    </div>
                    <div className="space-y-1 pl-1">
                      {topics.map((topic) => {
                        const Icon = iconMap[topic.icon] || Sigma;
                        const stats = statsByTopic[topic.key];
                        const accuracy = stats && stats.attempts > 0
                          ? Math.round((stats.correct / stats.attempts) * 100)
                          : null;
                        return (
                          <button
                            key={topic.key}
                            onClick={() => {
                              setActiveTopic(topic.key);
                              // 手机端选完滚回题目，免得用户还要手动往回滑
                              if (window.matchMedia('(max-width: 1023px)').matches) {
                                document.getElementById('practice-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                              activeTopic === topic.key
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-800/40'
                                : 'hover:bg-accent border border-transparent'
                            }`}
                          >
                            <div className={`size-7 rounded-md flex items-center justify-center shrink-0 ${
                              activeTopic === topic.key
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                                : 'bg-accent text-muted-foreground'
                            }`}>
                              <Icon className="size-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${
                                activeTopic === topic.key
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : 'text-foreground'
                              }`}>
                                {topic.label}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {stats?.questions ?? 0}题
                                </span>
                                <span className="text-[10px] text-muted-foreground/70">
                                  {topic.level}
                                </span>
                                {accuracy !== null && (
                                  <span className={`text-xs font-medium ${
                                    accuracy >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                                      : accuracy >= 40 ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }`}>
                                  {accuracy}% 正确
                                </span>
                                )}
                              </div>
                            </div>
                            {activeTopic === topic.key && (
                              <ChevronRight className="size-3.5 text-emerald-500 shrink-0 mt-1.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {filteredTopics.length === 0 && (
                <p className="px-1 py-3 text-xs text-muted-foreground">没有匹配的知识点</p>
              )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：练习区 */}
        <div className="order-1 lg:order-2 lg:col-span-3 space-y-4">
           {/* 手机端：当前知识点 + 换题入口（知识点列表在下方） */}
           <div className="lg:hidden flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2">
             <div className="min-w-0">
               <p className="text-[11px] text-muted-foreground">当前知识点</p>
               <p className="truncate text-sm font-medium text-foreground">{currentTopic.label}</p>
             </div>
             <Button
               size="sm"
               variant="outline"
               className="shrink-0 gap-1"
               onClick={() =>
                 document.getElementById('topic-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
               }
             >
               <BookOpen className="size-3.5" />
               换知识点
             </Button>
           </div>

           <Tabs id="practice-tabs" value={activeTab} onValueChange={setActiveTab} className="w-full">
             <TabsList className="mb-4 w-full grid grid-cols-2 md:grid-cols-4">
               <TabsTrigger value="practice" className="text-sm">练习模式</TabsTrigger>
               <TabsTrigger value="challenge" className="text-sm">限时挑战</TabsTrigger>
               <TabsTrigger value="wrong" className="text-sm">错题本</TabsTrigger>
               <TabsTrigger value="stats" className="text-sm">学习统计</TabsTrigger>
             </TabsList>

             <TabsContent value="practice" className="space-y-4 mt-0">
              {/* 设置栏 */}
          <Card>
            <CardContent className="py-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">出题难度：</span>
                <div className="flex gap-1">
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                        difficulty === d.value
                          ? d.color + ' ring-1 ring-current/30'
                          : 'text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (aiEnabled) {
                      setAiEnabled(false);
                      newQuestion();
                    } else {
                      void loadAiPool();
                    }
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                    aiEnabled
                      ? 'bg-violet-600 text-white'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                  title="只使用已审核通过的 AI 生成题"
                >
                  AI 题{aiEnabled ? '（开）' : ''}
                </button>
                <button
                  onClick={() => {
                    setCourseMode((v) => !v);
                    setAiEnabled(false);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                    courseMode ? 'bg-sky-600 text-white' : 'text-muted-foreground hover:bg-accent'
                  }`}
                  title="使用三本教材的课后习题"
                >
                  课程题{courseMode ? '（开）' : ''}
                </button>
                <button
                  onClick={() => void handleFillPool()}
                  disabled={Boolean(fillJob)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-50"
                  title="后台预生成 10 道该知识点的 AI 题（需在线模型）"
                >
                  {fillJob ? `补题中 ${fillJob.filled}/${fillJob.target}` : '补题'}
                </button>
              </div>

              {topicAccuracy !== null && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">
                    本知识点正确率
                    <span
                      className={
                        topicAccuracy >= 0.8
                          ? 'ml-1 font-medium text-emerald-600'
                          : topicAccuracy >= 0.5
                            ? 'ml-1 font-medium text-amber-600'
                            : 'ml-1 font-medium text-rose-500'
                      }
                    >
                      {Math.round(topicAccuracy * 100)}%
                    </span>
                    <span className="ml-1 opacity-60">（{topicStat?.attempts} 题）</span>
                  </span>
                  {difficultyHint && (
                    <button
                      onClick={() => setDifficulty(difficultyHint.next)}
                      className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                    >
                      {difficultyHint.label}
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">答题模式：</span>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setAnswerMode('self-eval')}
                    className={`px-3 py-1.5 text-sm font-medium transition-all ${answerMode === 'self-eval' ? 'bg-emerald-600 text-white' : 'bg-card text-foreground hover:bg-accent'}`}
                  >
                    自评模式
                  </button>
                  <button
                    onClick={() => setAnswerMode('auto')}
                    className={`px-3 py-1.5 text-sm font-medium transition-all ${answerMode === 'auto' ? 'bg-emerald-600 text-white' : 'bg-card text-foreground hover:bg-accent'}`}
                  >
                    输入判分
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {!quizMode ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">刷题：</span>
                    <Select value={String(quizSize)} onValueChange={(v) => setQuizSize(Number(v))}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUIZ_SIZE_OPTIONS.map((n) => (
                          <SelectItem key={n} value={String(n)}>{n} 题</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={startQuiz} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Play className="size-3.5 mr-1.5" />
                      开始刷题
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs font-mono">
                      {quizIndex + 1} / {quizSize}
                    </Badge>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${((quizIndex + (isChecked ? 1 : 0)) / quizSize) * 100}%` }}
                      />
                    </div>
                    <Button size="sm" variant="ghost" onClick={exitQuiz}>
                      退出
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 题目卡片 */}
          {quizFinished ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/50 to-card dark:from-emerald-900/20 dark:to-card/60">
                <CardContent className="py-10 text-center">
                  <div className="size-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                    <Trophy className="size-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    本轮完成！
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {currentTopic.label} · {diffInfo.label}难度 · {quizSize} 题
                  </p>
                  <div className="flex items-center justify-center gap-6 md:gap-8 mb-8 flex-wrap">
                    <div>
                      <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
                        {quizCorrect}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">答对</div>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div>
                      <div className="text-4xl font-bold text-foreground tabular-nums font-mono">
                        {Math.round((quizCorrect / quizSize) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">正确率</div>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div>
                      <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 tabular-nums font-mono">
                        {streak}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">当前连击</div>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div>
                      <div className="text-4xl font-bold text-muted-foreground tabular-nums font-mono">
                        {formatTime(totalTimeSpent)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">总用时</div>
                    </div>
                  </div>

                  {/* 专题分布 */}
                  {categoryStats.length > 1 && (
                    <div className="max-w-md mx-auto mb-8 text-left">
                      <div className="text-sm font-medium text-muted-foreground mb-3">
                        各专题正确率
                      </div>
                      <div className="space-y-2">
                        {categoryStats.map((s) => (
                          <div key={s.key} className="flex items-center gap-3">
                            <span className="text-sm text-foreground w-20 shrink-0">
                              {s.label}
                            </span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  s.accuracy >= 70 ? 'bg-emerald-500' : s.accuracy >= 40 ? 'bg-amber-500' : 'bg-rose-500',
                                )}
                                style={{ width: `${s.accuracy}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono tabular-nums w-12 text-right text-muted-foreground">
                              {s.correct}/{s.total} · {s.accuracy}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Button onClick={startQuiz} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <RefreshCw className="size-4 mr-2" />
                      再来一轮
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        exitQuiz();
                        // 切到错题本 tab 通过 DOM 触发 Tabs 太 hack，直接退出由用户手动切
                      }}
                    >
                      复习错题
                    </Button>
                    <Button variant="ghost" onClick={exitQuiz}>
                      返回自由练习
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : question ? (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={diffInfo.color}>
                          {diffInfo.label}
                        </Badge>
                        <Badge variant="secondary" className="font-normal">
                          {courseMode && (question as { courseTitle?: string }).courseTitle
                            ? (question as { courseTitle?: string }).courseTitle
                            : currentTopic.label}
                        </Badge>
                        {courseMode && (question as { chapterTitle?: string }).chapterTitle && (
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {(question as { chapterTitle?: string }).chapterTitle}
                          </Badge>
                        )}
                        {relatedExplainer && (
                          <button
                            onClick={() => navigate('/explainer?topic=' + relatedExplainer.id)}
                            className="text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                          >
                            看原理讲解
                          </button>
                        )}
                        {answerMode === 'auto' && (
                          <Badge variant="outline" className={cn(
                            'font-mono tabular-nums',
                            timeLeft <= 30 ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40 animate-pulse' : 'bg-muted text-muted-foreground border-border',
                          )}>
                            <Clock className="size-3 mr-1" />
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleToggleFavorite}
                          className="text-muted-foreground hover:text-amber-500"
                          title={isFavorited(question.id) ? '取消收藏' : '收藏本题'}
                        >
                          {isFavorited(question.id) ? (
                            <Star className="size-4 fill-amber-400 text-amber-500" />
                          ) : (
                            <StarOff className="size-4" />
                          )}
                        </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={newQuestion}
                           className="text-muted-foreground hover:text-foreground"
                         >
                           <RefreshCw className="size-4 mr-1.5" />
                           换一题
                         </Button>
                         {aiEnabled && question && question.id.startsWith('ai-') && (
                           <Button
                             variant="ghost"
                             size="sm"
                             className="text-muted-foreground hover:text-destructive"
                             title="题目或答案有问题？点一下让它下架"
                             onClick={async () => {
                               try {
                                 await reviewQuestion(question.id, 'reject', '用户报错');
                                 toast('已下架这道题，换一道新的');
                                 newQuestion();
                               } catch {
                                 toast.error('报错失败，请稍后再试');
                               }
                             }}
                           >
                             <Flag className="size-4 mr-1.5" />
                             报错
                           </Button>
                         )}
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => setVariantOpen(true)}
                           className="text-muted-foreground hover:text-primary"
                           title="出变式训练"
                         >
                           <GitBranch className="size-4 mr-1.5" />
                            出变式
                            {question && (() => {
                              const rec = getRecord(question);
                              if (rec?.guessedCorrect) {
                                return (
                                  <span className="ml-1.5 inline-flex items-center gap-1 px-1.5 h-4 rounded bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-medium">
                                    <AlertTriangle className="size-3" />
                                    待验证
                                  </span>
                                );
                              }
                              if (rec?.mastered) {
                                return (
                                  <span className="ml-1.5 inline-flex items-center justify-center size-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold">✓</span>
                                );
                              }
                              return null;
                            })()}
                         </Button>
                       </div>
                    </div>
                  </CardHeader>
                <CardContent className="space-y-6">
                  {/* 题目 */}
                  <div className="board-surface board-surface bg-[var(--board-bg)] rounded-xl p-6 text-center">
                    <div className="text-xs text-emerald-400/70 font-medium tracking-wider mb-3">题目</div>
                    <div className="text-emerald-100 text-lg leading-relaxed">
                      <MathRenderer expression={question.questionLatex} displayMode />
                    </div>
                  </div>

                  {/* 苏格拉底式提示（题目下方、答案输入区上方） */}
                  {question && !isChecked && (
                    <HintPanel
                      hints={question.hints ?? generateHintsFromSteps(question.steps)}
                      disabled={isChecked}
                      hintLevel={hintLevel}
                      onHintLevelChange={handleHintLevelChange}
                    />
                  )}

                  {/* 答题区：按模式切换 */}
                  <div className="space-y-3">
                    {answerMode === 'auto' ? (
                      <>
                        <MathInputField
                          value={userAnswer}
                          onChange={setUserAnswer}
                          onKeyDown={handleKeyDown}
                          label="你的答案"
                          placeholder={
                            question.answer.trim().startsWith('[[')
                              ? '矩阵请按 [[1,2],[3,4]] 输入'
                              : currentTopic.answerPlaceholder
                          }
                          disabled={isChecked}
                          showPalette
                          topicKey={activeTopic}
                          defaultPreview
                        />
                        <div className="flex gap-3">
                          {!isChecked ? (
                            <>
                              <Button
                                onClick={handleCheck}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 flex-1"
                              >
                                <Check className="size-4 mr-2" />
                                检查答案
                              </Button>
                              <Button
                                variant="outline"
                                onClick={handleSkip}
                                className="h-11"
                                title="跳过本题"
                              >
                                <SkipForward className="size-4 mr-2" />
                                跳过
                              </Button>
                              <Button
                                variant={isGuessed ? 'secondary' : 'ghost'}
                                onClick={() => setIsGuessed((g) => !g)}
                                className={cn('h-11', isGuessed ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400' : '')}
                                title="标记为蒙的"
                              >
                                <Flag className="size-4 mr-2" />
                                {isGuessed ? '已标记' : '蒙的'}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={handleNext}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 flex-1"
                              >
                                {quizMode ? '下一题' : '换一题'}
                                <ChevronRight className="size-4 ml-2" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={handleToggleFavorite}
                                className="h-11"
                              >
                                {isFavorited(question.id) ? (
                                  <Star className="size-4 fill-amber-400 text-amber-500" />
                                ) : (
                                  <StarOff className="size-4" />
                                )}
                                <span className="ml-2">
                                  {isFavorited(question.id) ? '已收藏' : '收藏'}
                                </span>
                              </Button>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <Lightbulb className="size-3.5 inline mr-1 -mt-0.5" />
                          支持符号输入：√、π、x²、×、÷ 等
                        </p>
                      </>
                    ) : (
                      <>
                        {/* 自评模式：看答案按钮 + 展开后自评 */}
                        {!showAnswer && !isChecked && (
                          <Button
                            onClick={handleShowAnswer}
                            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white text-base"
                          >
                            <Eye className="size-5 mr-2" />
                            看答案 & 解析
                          </Button>
                        )}

                        {/* 答案展开后显示自评按钮 */}
                        {(showAnswer || selfEvalResult) && !isChecked && (
                          <div className="space-y-4">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/40">
                              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">参考答案</div>
                              <div className="text-emerald-900 dark:text-emerald-100 font-mono text-lg">
                                {question.answerDisplay}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground text-center">
                              对照答案，你做对了吗？
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                onClick={() => handleSelfEval('correct')}
                                className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-base"
                              >
                                <Check className="size-5 mr-1.5" />
                                做对了
                              </Button>
                              <Button
                                onClick={() => handleSelfEval('wrong')}
                                className="h-12 bg-rose-600 hover:bg-rose-700 text-white text-base"
                                variant="destructive"
                              >
                                <X className="size-5 mr-1.5" />
                                做错了
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* 自评完成后显示下一题按钮 */}
                        {isChecked && selfEvalResult && (
                          <Button
                            onClick={handleNext}
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {quizMode ? '下一题' : '换一题'}
                            <ChevronRight className="size-4 ml-2" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* 反馈与解析（自动判分模式 or 自评完成后显示） */}
                  <AnimatePresence>
                    {isChecked && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        {/* 对错反馈 */}
                        <div
                          className={`rounded-xl p-4 mb-4 flex items-center gap-3 ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40'
                              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40'
                          }`}
                        >
                          <div
                            className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                            }`}
                          >
                            {isCorrect ? <Check className="size-5" /> : <X className="size-5" />}
                          </div>
                          <div className="flex-1">
                            <div className={`font-semibold ${
                              isCorrect
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : 'text-red-700 dark:text-red-300'
                            }`}>
                              {selfEvalResult
                                ? isCorrect ? '自评正确，太棒了！' : '已记录为错题，记得复习'
                                : feedback}
                            </div>
                            {!isCorrect && (
                              <div className="text-sm text-muted-foreground mt-0.5">
                                正确答案：<span className="font-mono">{question.answerDisplay}</span>
                              </div>
                            )}
                            {selfEvalResult && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                判分来源：{isCorrect ? '自评 · 正确' : '自评 · 错误'}
                              </div>
                            )}
                          </div>
                          {isCorrect && (
                            <div className="text-right">
                              <div className="text-xs text-emerald-600 dark:text-emerald-400">+1 连击</div>
                              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                <span className="inline-flex items-center gap-1">
                                  {streak}
                                  <Flame className="size-4 text-orange-500" />
                                </span>
                              </div>
                            </div>
                            )}
                          </div>

                          {/* 蒙对提示弹层 */}
                          <AnimatePresence>
                            {showGuessPrompt && isChecked && isCorrect && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="mb-4 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20 p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="size-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="size-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-amber-800 dark:text-amber-300">
                                      这么快？是真会还是蒙的？
                                    </div>
                                    <div className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                                      用时 {answerTimeSpent} 秒，要不要 3 天后再来验证一下？
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleGuessConfirm}
                                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border-0"
                                      >
                                        我真会！
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleGuessMark}
                                        className="bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border-0"
                                      >
                                        其实没想到这步…
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 答对时手动标记入口（常驻小字） */}
                          {isChecked && isCorrect && !showGuessPrompt && (
                            <div className="mb-3 flex justify-end">
                              <button
                                type="button"
                                onClick={handleGuessMark}
                                className="text-xs text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors underline-offset-2 hover:underline"
                              >
                                其实没想到这步
                              </button>
                            </div>
                          )}

                          {/* 错因选择（仅答错时显示） */}
                         {!isCorrect && currentWrongKey && (
                           <WrongReasonPicker
                             open={true}
                             value={items.find(
                               (w) => w.topicKey === currentWrongKey.topicKey && w.question.question === currentWrongKey.question,
                             )?.wrongReason}
                             onSelect={handleWrongReasonSelect}
                             className="mb-4"
                           />
                         )}

                         {/* 解析步骤 */}
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                             <div className="flex items-center gap-2">
                               <Sparkles className="size-4 text-amber-500" />
                               <span className="text-sm font-semibold text-foreground">
                                 解析步骤
                               </span>
                             </div>
                             <TtsButton
                               text={question.steps.join('。')}
                               isLatex
                               size="sm"
                               variant="ghost"
                             />
                           </div>
                          <div className="space-y-2">
                            {question.steps.map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {i + 1}
                                </div>
                                <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
                                  {step.includes('\\') || step.match(/[=<>]/) ? (
                                    <MathRenderer expression={step} isInput />
                                  ) : (
                                    step
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
            ) : null}

            {/* 变式训练面板 */}
            <VariantPanel
              open={variantOpen}
              onOpenChange={setVariantOpen}
              question={question}
            />
            </TabsContent>

            <TabsContent value="challenge" className="mt-0">
              <ChallengeMode />
            </TabsContent>

            <TabsContent value="wrong" className="mt-0">
              <WrongBookSection />
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
              <StatsSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
