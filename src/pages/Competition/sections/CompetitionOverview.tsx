import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useChallengeMode } from '@/hooks/use-challenge-mode';
import DungeonMapSection from '@/components/DungeonMapSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Infinity as InfinityIcon,
  FileText,
  Sparkles,
  GraduationCap,
  BookMarked,
  ListChecks,
  Award,
  BarChart3,
  AlertTriangle,
  Home,
  Zap,
  AlertTriangle as AlertTriangleIcon,
  LineChart,
  NotebookPen,
  BrainCircuit,
  Flame,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { scopedStorage } from '@/lib/lark-mock';
import {
  COMPETITION_TOPICS,
  COMPETITION_BOOKS,
  type CompetitionTopic,
} from '@/data/competition';
import {
  KNOWLEDGE_CARDS,
  type MasteryMap,
  migrateMasteredToMastery,
} from '@/data/competition-knowledge';
import {
  type ExamHistoryRecord,
  computeWeakTopics,
} from '@/data/competition-mock';
import ExamCountdownLcd from '@/components/ExamCountdownLcd';
import { getTopicIcon } from '../helpers/topic-icons';
import DailyPracticeCard from './DailyPracticeCard';
import ExamPatternPanel from './ExamPatternPanel';
import SprintPlanPanel from './SprintPlanPanel';
import WeeklyReportCard from './WeeklyReportCard';
import PreExamChecklistCard from './PreExamChecklistCard';
import { computeWeeklyReport } from '@/data/competition-weekly';
import { type DailyPracticeRecord, readDailyRecord } from '@/data/competition-sprint';
import { STATS_KEY, type StatsRecord } from '@/hooks/use-learning';
import { useExamCountdown } from '@/hooks/use-exam-countdown';
import AchievementBadgesSection from './AchievementBadgesSection';
import FlowShortcuts from './FlowShortcuts';
import ExplainerShortcuts from './ExplainerShortcuts';
import PropositionTrendsPanel from './PropositionTrendsPanel';
import DiagnosticReportPanel from './DiagnosticReportPanel';
import TodayDashboard from './TodayDashboard';
import { useAchievements, computeBadgeProgress } from '@/hooks/use-achievements';
import { getTotalCheckInDays } from '@/data/competition-sprint';
import { PROBLEM_GENERATORS } from '@/data/problem-generators';

// 非默认 Tab 按需懒加载：仅切换到对应标签时才下载组件与其独有题库数据，压缩竞赛页首屏 chunk
const TopicDetailPageLazy = lazy(() => import('./TopicDetailPage'));
const MockExamTabLazy = lazy(() => import('./MockExamTab'));
const SkillsTabLazy = lazy(() => import('./SkillsSection').then((m) => ({ default: m.SkillsTab })));
const MustMemoTabLazy = lazy(() => import('./SkillsSection').then((m) => ({ default: m.MustMemoTab })));
const FormulaReferenceTabLazy = lazy(() => import('./FormulaReferenceTab'));
const SprintCardsTabLazy = lazy(() => import('./SprintCardsTab'));
const CompetitionPracticeModeLazy = lazy(() => import('./CompetitionPracticeMode'));
const ExamStrategyPanelLazy = lazy(() => import('./ExamStrategyPanel'));
const RealExamsTabLazy = lazy(() => import('./RealExamsTab'));
const HotPointsPanelLazy = lazy(() => import('./HotPointsPanel'));
const SprintPlanTabLazy = lazy(() => import('./SprintPlanTab'));
const CountdownPlanTabLazy = lazy(() => import('./CountdownPlanTab'));
const TrapsTabLazy = lazy(() => import('./TrapsTab'));
const ProofsTabLazy = lazy(() => import('./ProofsTab'));
const DashboardTabLazy = lazy(() => import('./DashboardTab'));
const TemplateLibraryTabLazy = lazy(() => import('./TemplateLibraryTab'));

// 懒加载 Tab 统一占位：与全站扁平风格一致，颜色走 token，不引新样式
function LazyTabFallback() {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      加载中…
    </div>
  );
}

// ============================================================
// 竞赛备战中心主页面
// ============================================================

const PROGRESS_KEY = 'mathforge:competition:progress';
const KNOWLEDGE_PROGRESS_KEY = 'mathforge:competition:knowledge-progress';
  const CARDS_MASTER_KEY = 'mathforge:competition:cards-master';
  const MASTERY_V1_KEY = 'mathforge:competition:cards-mastery:v1';
  const EXAM_HISTORY_KEY = 'mathforge:competition:exam-history';

export default function CompetitionOverview() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [challengeMode] = useChallengeMode();

  // 开启闯关模式时直接落在专题地图，避免开了开关却看不到变化
  useEffect(() => {
    if (challengeMode) setActiveTab('topics');
  }, [challengeMode]);
  const [selectedTopic, setSelectedTopic] = useState<CompetitionTopic | null>(null);
  // 知识卡片 + 必背结论 的掌握状态（旧版二进制）
  const [masteredCards, setMasteredCards] = useState<string[]>(() => {
    try {
      const raw = scopedStorage.getItem(CARDS_MASTER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // 知识卡片三态掌握自评（v1）
  const [masteryMap, setMasteryMap] = useState<MasteryMap>(() => {
    try {
      const raw = scopedStorage.getItem(MASTERY_V1_KEY);
      if (raw) return JSON.parse(raw) as MasteryMap;
      // 首次加载尝试迁移旧数据
      return migrateMasteredToMastery();
    } catch { return {}; }
  });

  const toggleCardMaster = useCallback((id: string) => {
    setMasteredCards((prev) => {
      const next = prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id];
      try { scopedStorage.setItem(CARDS_MASTER_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleMasteryChange = useCallback((map: MasteryMap) => {
    setMasteryMap(map);
  }, []);

  // 从 URL query 初始化 tab / topic / skill（支持搜索跳转）
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const topicKey = params.get('topic');
    if (tab) setActiveTab(tab);
    if (topicKey) {
      const t = COMPETITION_TOPICS.find((x) => x.key === topicKey);
      if (t) {
        setSelectedTopic(t);
        setActiveTab('topic-detail');
      }
    }
     
  }, [location.search]);

  // 进度：已掌握的专题
  const [masteredTopics, setMasteredTopics] = useState<string[]>(() => {
    try {
      const raw = scopedStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const saveProgress = useCallback((next: string[]) => {
    setMasteredTopics(next);
    try { scopedStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const toggleMaster = useCallback((key: string) => {
    setMasteredTopics((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      saveProgress(next);
      return next;
    });
  }, [saveProgress]);

  // 模拟考试历史
  const [examHistory] = useState<ExamHistoryRecord[]>(() => {
    try {
      const raw = scopedStorage.getItem(EXAM_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // 薄弱专题 keys（解题模板今日推荐用）
  const weakTopicKeys = useMemo(() => {
    const weak = computeWeakTopics(examHistory, COMPETITION_TOPICS.map((t) => t.key));
    return weak.filter((w) => w.isWeak).map((w) => w.topic);
  }, [examHistory]);

  // 知识点级进度
  const [masteredKnowledgePoints, setMasteredKnowledgePoints] = useState<string[]>(() => {
    try {
      const raw = scopedStorage.getItem(KNOWLEDGE_PROGRESS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // 学习统计 & 错题本 & 每日一练（用于周报）
  const [weeklyStats, setWeeklyStats] = useState<StatsRecord | null>(null);
  const [dailyRecords, setDailyRecords] = useState<DailyPracticeRecord[]>([]);
  const [wrongBookCount, setWrongBookCount] = useState(0);
  const [realExamHistory, setRealExamHistory] = useState<
    { examId: string; score: number; totalScore: number; date: number }[]
  >([]);

  useEffect(() => {
    try {
      const raw = scopedStorage.getItem(STATS_KEY);
      if (raw) setWeeklyStats(JSON.parse(raw));
    } catch { /* ignore */ }

    try {
      const d = readDailyRecord();
      if (d) setDailyRecords([d]);
    } catch { /* ignore */ }

    try {
      const raw = scopedStorage.getItem('mathforge_wrong_book');
      if (raw) {
        const arr = JSON.parse(raw);
        setWrongBookCount(Array.isArray(arr) ? arr.length : 0);
      }
    } catch { /* ignore */ }

    // 真题考试历史
    try {
      const raw = scopedStorage.getItem('competition:real-exam-history');
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) setRealExamHistory(data);
      }
    } catch { /* ignore */ }
  }, []);

  const saveKnowledgeProgress = useCallback((next: string[]) => {
    setMasteredKnowledgePoints(next);
    try { scopedStorage.setItem(KNOWLEDGE_PROGRESS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const toggleKnowledgePoint = useCallback((pointId: string) => {
    setMasteredKnowledgePoints((prev) => {
      const next = prev.includes(pointId)
        ? prev.filter((k) => k !== pointId)
        : [...prev, pointId];
      saveKnowledgeProgress(next);
      return next;
    });
  }, [saveKnowledgeProgress]);

  const { isExamOver, daysLeft } = useExamCountdown();

  const goTopic = useCallback((topic: CompetitionTopic) => {
    setSelectedTopic(topic);
    setActiveTab('topic-detail');
  }, []);

  const backFromTopic = useCallback(() => {
    setSelectedTopic(null);
    setActiveTab('topics');
  }, []);

  return (
    <div className="min-h-full page-fade-in pb-12">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 space-y-6">
        {/* 桌角倒计时牌 */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-serif font-semibold text-foreground tracking-wide">
              备战工作台
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              每日一练、每周一测，向着目标推进
            </p>
          </div>
          <div className="shrink-0">
            <ExamCountdownLcd />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-nowrap overflow-x-auto w-full mb-6 bg-card/50 border border-border/60 p-1.5 gap-1.5 rounded-lg [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
            <TabsTrigger value="overview" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Home className="size-4 mr-1.5" />总览
            </TabsTrigger>
            <TabsTrigger value="formulas" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookMarked className="size-4 mr-1.5" />公式速查
            </TabsTrigger>
            <TabsTrigger value="topics" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="size-4 mr-1.5" />8 大专题
            </TabsTrigger>
            <TabsTrigger value="practice" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ListChecks className="size-4 mr-1.5" />专项练习
            </TabsTrigger>
            <TabsTrigger value="mock" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="size-4 mr-1.5" />模拟卷
            </TabsTrigger>
            <TabsTrigger value="sprint-cards" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <GraduationCap className="size-4 mr-1.5" />冲刺卡
            </TabsTrigger>
            <TabsTrigger value="skills" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BrainCircuit className="size-4 mr-1.5" />知识卡片
            </TabsTrigger>
            <TabsTrigger value="must-memo" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Zap className="size-4 mr-1.5" />必背结论
            </TabsTrigger>
            <TabsTrigger value="templates" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="size-4 mr-1.5" />解题模板
            </TabsTrigger>
            <TabsTrigger value="strategy" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="size-4 mr-1.5" />应试策略
            </TabsTrigger>
            <TabsTrigger value="real-exams" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Award className="size-4 mr-1.5" />历年真题
            </TabsTrigger>
            <TabsTrigger value="hot-points" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Flame className="size-4 mr-1.5" />考点热力
            </TabsTrigger>
            <TabsTrigger value="sprint-plan" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Zap className="size-4 mr-1.5" />冲刺计划
            </TabsTrigger>
            <TabsTrigger value="countdown" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="size-4 mr-1.5" />倒排计划
            </TabsTrigger>
            <TabsTrigger value="traps" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <AlertTriangleIcon className="size-4 mr-1.5" />陷阱题集
            </TabsTrigger>
            <TabsTrigger value="proofs" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <NotebookPen className="size-4 mr-1.5" />证明题专项
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="whitespace-nowrap shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LineChart className="size-4 mr-1.5" />数据看板
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-0">
            <OverviewTab
              isExamOver={isExamOver}
              daysLeft={daysLeft}
              masteredTopics={masteredTopics}
              examHistory={examHistory}
              weeklyStats={weeklyStats}
              dailyRecords={dailyRecords}
              wrongBookCount={wrongBookCount}
              realExamHistory={realExamHistory}
              onGoTopic={goTopic}
              onStartMock={() => setActiveTab('mock')}
              onGoSkills={() => setActiveTab('skills')}
              onGoMustMemo={() => setActiveTab('must-memo')}
              onGoFormulas={() => setActiveTab('formulas')}
              onGoPractice={() => setActiveTab('practice')}
              onGoWrongBook={() => setActiveTab('dashboard')}
              onGoTemplates={() => setActiveTab('templates')}
            />
          </TabsContent>

          <TabsContent value="formulas" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <FormulaReferenceTabLazy />
            </Suspense>
          </TabsContent>

          <TabsContent value="topics" className="space-y-6 mt-0">
            <TopicsTabContent
              topics={COMPETITION_TOPICS}
              mastered={masteredTopics}
              onSelect={goTopic}
            />
          </TabsContent>

          <TabsContent value="practice" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <CompetitionPracticeModeLazy
                onBack={() => setActiveTab('overview')}
                answerMode={'self-eval'}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="topic-detail" className="space-y-6 mt-0">
            {selectedTopic && (
              <Suspense fallback={<LazyTabFallback />}>
                <TopicDetailPageLazy
                  topic={selectedTopic}
                  isMastered={masteredTopics.includes(selectedTopic.key)}
                  onBack={backFromTopic}
                  onToggleMaster={() => toggleMaster(selectedTopic.key)}
                  masteredKnowledgeIds={masteredKnowledgePoints}
                  onToggleKnowledge={toggleKnowledgePoint}
                />
              </Suspense>
            )}
          </TabsContent>

          <TabsContent value="mock" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <MockExamTabLazy onGoTopic={(key) => {
                const t = COMPETITION_TOPICS.find((x) => x.key === key);
                if (t) goTopic(t);
              }} />
            </Suspense>
          </TabsContent>

          <TabsContent value="sprint-cards" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <SprintCardsTabLazy />
            </Suspense>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <SkillsTabLazy
                masteredIds={masteredCards}
                onToggleMaster={toggleCardMaster}
                masteryMap={masteryMap}
                onMasteryChange={handleMasteryChange}
                onGoHotPoints={() => setActiveTab('hot-points')}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="must-memo" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <MustMemoTabLazy masteredIds={masteredCards} onToggleMaster={toggleCardMaster} />
            </Suspense>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <TemplateLibraryTabLazy weakTopicKeys={weakTopicKeys} />
            </Suspense>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <ExamStrategyPanelLazy />
            </Suspense>
          </TabsContent>

          <TabsContent value="real-exams" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <RealExamsTabLazy onGoTopic={(key) => {
                const t = COMPETITION_TOPICS.find((x) => x.key === key);
                if (t) goTopic(t);
              }} />
            </Suspense>
          </TabsContent>

          <TabsContent value="hot-points" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <HotPointsPanelLazy
                masteryMap={masteryMap}
                onGoPractice={(topicKey) => {
                  // 跳转到专项练习并过滤专题
                  setActiveTab('practice');
                  // 通过 URL 参数或 state 传递专题过滤（这里用 toast 提示 + 后续可优化）
                  const t = COMPETITION_TOPICS.find((x) => x.key === topicKey);
                  if (t) {
                    // 先简单切换到练习 tab，让用户手动选择专题
                    toast.info(`已为你定位到「${t.title}」专题，开始练习该考点`);
                  }
                }}
                onGoKnowledge={(cardId) => {
                  // 跳转到知识卡片 tab，滚动到对应卡片
                  setActiveTab('skills');
                  // 简单提示用户搜索
                  const card = KNOWLEDGE_CARDS.find((c) => c.id === cardId);
                  if (card) {
                    toast.info(`已跳转到知识卡片库，搜索「${card.title}」定位卡片`);
                  }
                }}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="sprint-plan" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <SprintPlanTabLazy onNavigateTab={(tabKey, detailKey) => {
                setActiveTab(tabKey);
                if (detailKey && tabKey === 'topics') {
                  const t = COMPETITION_TOPICS.find((x) => x.key === detailKey);
                  if (t) { setSelectedTopic(t); setActiveTab('topic-detail'); }
                }
              }} />
            </Suspense>
          </TabsContent>

          <TabsContent value="countdown" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <CountdownPlanTabLazy />
            </Suspense>
          </TabsContent>

          <TabsContent value="traps" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <TrapsTabLazy onGoTopic={(key) => {
                const t = COMPETITION_TOPICS.find((x) => x.key === key);
                if (t) goTopic(t);
              }} />
            </Suspense>
          </TabsContent>

          <TabsContent value="proofs" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <ProofsTabLazy />
            </Suspense>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6 mt-0">
            <Suspense fallback={<LazyTabFallback />}>
              <DashboardTabLazy />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================
// 薄弱专题面板
// ============================================================

function WeakTopicsPanel({
  history,
  onGoTopic,
}: {
  history: ExamHistoryRecord[];
  onGoTopic: (t: CompetitionTopic) => void;
}) {
  const weakTopics = useMemo(() => computeWeakTopics(history, COMPETITION_TOPICS.map((t) => t.key)), [history]);
  const weakOnes = weakTopics.filter((w) => w.isWeak);
  const lowestOnes = weakTopics.filter((w) => w.accuracy >= 0).slice(0, 2);
  const displayOnes = weakOnes.length > 0 ? weakOnes.slice(0, 2) : lowestOnes;

  if (history.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="flex justify-center mb-2">
          <NotebookPen className="size-10 stroke-[1.5] text-foreground" />
        </div>
        <div className="text-sm text-foreground font-medium">还没有考试记录</div>
        <div className="text-xs text-muted-foreground mt-1">完成一次模拟考试后，自动分析薄弱专题</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {displayOnes.length === 0
        ? COMPETITION_TOPICS.slice(0, 2).map((t) => (
            <div
              key={t.key}
              className="p-5 rounded-xl border border-border/40 bg-card hover:border-emerald-300/60 transition-colors cursor-pointer"
              onClick={() => onGoTopic(t)}
            >
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40">
                  推荐
                </Badge>
                <span className="text-xs text-muted-foreground">专题 {t.index}</span>
              </div>
              <div className="font-medium text-foreground mb-0.5">{t.title}</div>
              <div className="text-xs text-muted-foreground mb-2">{t.subtitle}</div>
              <Button size="sm" variant="outline" className="w-full">
                开始学习 <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          ))
        : displayOnes.map((w) => {
            const topic = COMPETITION_TOPICS.find((t) => t.key === w.topic);
            if (!topic) return null;
            return (
              <div
                key={w.topic}
                className={cn(
                  'p-5 rounded-xl border transition-colors cursor-pointer',
                  w.isWeak
                    ? 'border-red-200 dark:border-red-800/40 bg-red-50/30 dark:bg-red-900/15 hover:bg-red-50/50 dark:hover:bg-red-900/20'
                    : 'border-border/40 bg-card hover:border-emerald-300/60',
                )}
                onClick={() => onGoTopic(topic)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      w.isWeak
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40'
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
                    )}
                  >
                    {w.isWeak ? <AlertTriangle className="size-3 mr-1" /> : null}
                    正确率 {Math.round(w.accuracy * 100)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">专题 {topic.index}</span>
                </div>
                <div className="font-medium text-foreground mb-0.5">{topic.title}</div>
                <div className="text-xs text-muted-foreground mb-2">{topic.subtitle}</div>
                <Button
                  size="sm"
                  variant={w.isWeak ? 'destructive' : 'outline'}
                  className={cn('w-full', w.isWeak && 'bg-red-600 hover:bg-red-700')}
                >
                  重点攻克 <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </div>
            );
          })}
    </div>
  );
}

// ============================================================
// 总览 Tab
// ============================================================

interface OverviewProps {
  isExamOver: boolean;
  daysLeft: number;
  masteredTopics: string[];
  examHistory: ExamHistoryRecord[];
  weeklyStats: StatsRecord | null;
  dailyRecords: DailyPracticeRecord[];
  wrongBookCount: number;
  realExamHistory: { examId: string; score: number; totalScore: number; date: number }[];
  onGoTopic: (t: CompetitionTopic) => void;
  onStartMock: () => void;
  onGoSkills: () => void;
  onGoMustMemo: () => void;
  onGoFormulas: () => void;
  onGoPractice: () => void;
  onGoWrongBook: () => void;
  onGoTemplates: () => void;
}

function OverviewTab({ isExamOver, daysLeft, masteredTopics, examHistory, weeklyStats, dailyRecords, wrongBookCount, realExamHistory, onGoTopic, onStartMock, onGoSkills, onGoMustMemo, onGoFormulas, onGoPractice, onGoWrongBook, onGoTemplates }: OverviewProps) {
  // 成就徽章
  const { badges, unlockedCount, totalBadges, updateProgress } = useAchievements();

  // 计算徽章进度（从现有数据推断）
  useEffect(() => {
    if (!weeklyStats) return;
    // 从各 topic bestStreak 取最大值作为全局 bestStreak
    const globalBestStreak = Object.values(weeklyStats.topics || {}).reduce(
      (max, t) => Math.max(max, t.bestStreak || 0),
      0,
    );
    const examData = examHistory.map((e) => ({
      score: e.score,
      presetKey: e.configId,
      difficultyTier: e.difficultyTier,
      examKind: e.examKind,
    }));
    const totalCheckIn = getTotalCheckInDays();
    const prog = computeBadgeProgress(
      { totalAttempts: weeklyStats.totalAttempts, streakDays: weeklyStats.streakDays, bestStreak: globalBestStreak, totalCheckInDays: totalCheckIn },
      masteredTopics.length,
      8,
      examData,
      wrongBookCount,
    );
    updateProgress(prog);
     
  }, [weeklyStats?.totalAttempts, weeklyStats?.streakDays, examHistory.length, masteredTopics.length, wrongBookCount, realExamHistory.length]);
  const weeklyReport = useMemo(
    () => computeWeeklyReport(weeklyStats, examHistory, dailyRecords, wrongBookCount, masteredTopics.length, realExamHistory),
    [weeklyStats, examHistory, dailyRecords, wrongBookCount, masteredTopics.length, realExamHistory],
  );
  // 题库规模统计（动态从生成器数组计算）
  const libraryStats = useMemo(() => {
    const total = PROBLEM_GENERATORS.length;
    const byTopic: Record<string, number> = {};
    PROBLEM_GENERATORS.forEach((g) => {
      byTopic[g.topic] = (byTopic[g.topic] || 0) + 1;
    });
    const totalVariants = PROBLEM_GENERATORS.reduce((s, g) => s + (g.variantCount || 10), 0);
    // 估算随机变体：每个模板平均 10 variantCount × 参数组合 → 万级
    const estimatedVariants = totalVariants * 50; // 粗略估算
    return { total, byTopic, totalVariants, estimatedVariants, realExams: 2 };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* 今日冲刺仪表盘 */}
      <TodayDashboard
        isExamOver={isExamOver}
        onGoMock={onStartMock}
        onGoPractice={onGoPractice}
        onGoWrongBook={onGoWrongBook}
        onGoTemplates={onGoTemplates}
        onGoTopics={(key) => {
          const t = COMPETITION_TOPICS.find((x) => x.key === key);
          if (t) onGoTopic(t);
        }}
      />

      {/* 本周重点 · 薄弱专题 + 考试趋势 */}
      <Card className="border-border/60 bg-gradient-to-br from-amber-50/40 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="size-5 text-amber-600" />
            本周重点
            <Badge variant="outline" className="ml-auto text-xs bg-background">
              基于 {examHistory.length} 次模考分析
            </Badge>
          </CardTitle>
          <CardDescription>自动识别薄弱专题，针对性复习效率更高</CardDescription>
        </CardHeader>
        <CardContent>
          <WeakTopicsPanel history={examHistory} onGoTopic={onGoTopic} />
        </CardContent>
      </Card>

      {/* 每日一练 */}
      <DailyPracticeCard examHistory={examHistory} onGoTopic={(key) => {
        const t = COMPETITION_TOPICS.find((x) => x.key === key);
        if (t) onGoTopic(t);
      }} />

      {/* 学习周报 + 考前清单（考试结束后考前清单隐藏，周报独占一行） */}
      <div className={cn(isExamOver ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2', 'grid gap-4')}>
        <WeeklyReportCard
          report={weeklyReport}
          onStartPractice={onStartMock}
        />
        {!isExamOver && <PreExamChecklistCard daysLeft={daysLeft} />}
      </div>

      {/* 命题规律 */}
      <ExamPatternPanel onGoTopic={onGoTopic} />

      {/* 题库规模 */}
      <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <InfinityIcon className="size-5 text-primary" />
            题库规模
            <Badge variant="outline" className="ml-auto text-xs bg-background border-primary/20 text-primary">
              动态统计
            </Badge>
          </CardTitle>
          <CardDescription>
            题目随参数无限生成，换一题即新题
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile
              label="题型模板"
              value={`${libraryStats.total}`}
              unit="种"
              accent="primary"
            />
            <StatTile
              label="参数变体"
              value="10,000+"
              unit="道"
              accent="emerald"
            />
            <StatTile
              label="真题套卷"
              value={`${libraryStats.realExams}`}
              unit="套"
              accent="amber"
            />
            <StatTile
              label="专题覆盖"
              value="8"
              unit="大"
              accent="sky"
            />
          </div>
          <div className="space-y-2.5">
            <div className="text-xs font-medium text-foreground/80">各专题模板分布</div>
            <div className="space-y-2">
              {COMPETITION_TOPICS.map((t) => {
                const count = libraryStats.byTopic[t.key] || 0;
                const max = Math.max(...Object.values(libraryStats.byTopic));
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={t.key} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">{t.title.replace(/（.*/, '').replace(/（.*/, '').replace('函数、', '')}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-emerald-500"
                      />
                    </div>
                    <span className="text-xs font-medium tabular-nums w-8 text-right text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 考试信息卡 */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="size-5 text-emerald-600" />
            考试信息
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <InfoCard
            icon={<Award className="size-5 text-emerald-600" />}
            title="初赛"
            desc="仅考高等数学（占100%）"
            sub="时间 150 分钟 / 满分 100 分"
          />
          <InfoCard
            icon={<GraduationCap className="size-5 text-sky-600" />}
            title="决赛"
            desc="高等数学 80% + 线性代数 20%"
            sub="含证明题与综合大题"
          />
          <InfoCard
            icon={<BarChart3 className="size-5 text-amber-600" />}
            title="A 类"
            desc="理工科本科"
            sub="难度较高，面向数学基础扎实的理工科学生"
          />
          <InfoCard
            icon={<Sparkles className="size-5 text-primary" />}
            title="智能题库"
            desc="参数化随机生成"
            sub="80 种题型 · 3000+ 变体 · 无限刷新"
          />
        </CardContent>
      </Card>

      {/* 冲刺计划（动态，考试结束后隐藏） */}
      {!isExamOver && <SprintPlanPanel daysLeft={daysLeft} />}

      {/* 快速入口：知识卡片 / 必背结论 / 公式速查 / 专项练习 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/60 hover:border-primary/40 transition-colors cursor-pointer" onClick={onGoSkills}>
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <BrainCircuit className="size-5" />
            </div>
            <div className="font-semibold text-sm text-foreground">知识卡片库</div>
            <div className="text-xs text-muted-foreground -mt-1">161 张结构化卡片</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-amber-300/60 transition-colors cursor-pointer" onClick={onGoMustMemo}>
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm">
              <Zap className="size-5" />
            </div>
            <div className="font-semibold text-sm text-foreground">必背结论</div>
            <div className="text-xs text-muted-foreground -mt-1">63 条考前速记</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-emerald-300/60 transition-colors cursor-pointer" onClick={onGoFormulas}>
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
              <BookMarked className="size-5" />
            </div>
            <div className="font-semibold text-sm text-foreground">公式速查</div>
            <div className="text-xs text-muted-foreground -mt-1">8 专题 · 62 条</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-sky-300/60 transition-colors cursor-pointer" onClick={onGoPractice}>
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <ListChecks className="size-5" />
            </div>
            <div className="font-semibold text-sm text-foreground">专项练习</div>
            <div className="text-xs text-muted-foreground -mt-1">286 题型模板</div>
          </CardContent>
        </Card>
      </div>

      {/* 学习工具入口：流程图 + 原理讲解 */}
      <div className="grid grid-cols-1 gap-3">
        <FlowShortcuts />
        <ExplainerShortcuts />
      </div>

      {/* 成就徽章 */}
      <AchievementBadgesSection
        badges={badges}
        unlockedCount={unlockedCount}
        totalBadges={totalBadges}
      />

      {/* 8 大专题概览 */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="size-5 text-emerald-600" />
            8 大核心专题
          </CardTitle>
          <CardDescription>点击进入专题详情，勾选"已掌握"记录进度</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMPETITION_TOPICS.map((topic, i) => (
            <TopicCard key={topic.key} topic={topic} isMastered={masteredTopics.includes(topic.key)} onClick={() => onGoTopic(topic)} delay={i * 0.04} />
          ))}
        </CardContent>
      </Card>

      {/* 命题趋势 */}
      <PropositionTrendsPanel />

      {/* 备考诊断报告 */}
      <DiagnosticReportPanel
        daysLeft={daysLeft}
        inputData={{
          practiceStats: {
            totalAnswered: weeklyStats?.totalQuestions ?? 0,
            correctCount: weeklyStats?.totalCorrect ?? 0,
            topicStats: Object.fromEntries(
              Object.entries(weeklyStats?.topics ?? {}).map(([k, v]) => [
                k,
                { answered: v.questions, correct: v.correct },
              ]),
            ),
          },
          mockExamHistory: examHistory,
          dailyStreakDays: weeklyStats?.streakDays ?? 0,
          wrongBookCount,
          remainingDays: daysLeft,
        }}
      />

      {/* 官方参考书 */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookMarked className="size-5 text-emerald-600" />
            官方参考书目
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {COMPETITION_BOOKS.map((book, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/40 hover:border-emerald-200/60 transition-colors">
              <div className="size-12 shrink-0 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <BookOpen className="size-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{book.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{book.author} · {book.publisher}</div>
                <div className="text-xs text-emerald-700 mt-1">{book.note}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoCard({ icon, title, desc, sub }: { icon: React.ReactNode; title: string; desc: string; sub: string }) {
  return (
    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
      <div className="flex items-center gap-3 mb-3">{icon}<span className="font-semibold">{title}</span></div>
      <div className="text-sm text-foreground">{desc}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function StatTile({ label, value, unit, accent }: { label: string; value: string; unit: string; accent: string }) {
  const colorMap: Record<string, string> = {
    primary: 'from-primary/10 to-primary/5 text-primary',
    emerald: 'from-emerald-500/10 to-emerald-50 text-emerald-700',
    amber: 'from-amber-500/10 to-amber-50 text-amber-700',
    sky: 'from-sky-500/10 to-sky-50 text-sky-700',
  };
  return (
    <div className={cn(
      'p-3 md:p-4 rounded-xl bg-gradient-to-br border border-border/50',
      colorMap[accent] || colorMap.primary,
    )}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl md:text-3xl font-bold tabular-nums leading-tight">
        {value}
        <span className="text-sm font-normal ml-0.5 opacity-70">{unit}</span>
      </div>
    </div>
  );
}

function TopicCard({ topic, isMastered, onClick, delay = 0 }: { topic: CompetitionTopic; isMastered: boolean; onClick: () => void; delay?: number }) {
  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200/50 hover:border-emerald-300',
    sky: 'from-sky-50 to-sky-100/50 text-sky-700 border-sky-200/50 hover:border-sky-300',
    amber: 'from-amber-50 to-amber-100/50 text-amber-700 border-amber-200/50 hover:border-amber-300',
    violet: 'from-primary/5 to-primary/10 text-primary border-primary/20 hover:border-primary/30',
    rose: 'from-rose-50 to-rose-100/50 text-rose-700 border-rose-200/50 hover:border-rose-300',
    indigo: 'from-teal-50 to-teal-100/50 text-teal-700 border-teal-200/50 hover:border-teal-300',
    teal: 'from-teal-50 to-teal-100/50 text-teal-700 border-teal-200/50 hover:border-teal-300',
    orange: 'from-orange-50 to-orange-100/50 text-orange-700 border-orange-200/50 hover:border-orange-300',
  };
  const Icon = getTopicIcon(topic.icon);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className={cn(
        'text-left p-4 rounded-xl border bg-gradient-to-br transition-all',
        colorMap[topic.color] || colorMap.emerald,
        isMastered && 'ring-2 ring-emerald-500/50',
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="size-9 rounded-lg bg-card/60 backdrop-blur flex items-center justify-center shadow-sm">
          {Icon && <Icon className="size-5" />}
        </div>
        {isMastered ? (
          <CheckCircle2 className="size-5 opacity-80" />
        ) : (
          <span className="text-xs opacity-60">专题 {topic.index}</span>
        )}
      </div>
      <div className="font-semibold text-sm mb-0.5">{topic.title}</div>
      <div className="text-xs opacity-80 leading-relaxed line-clamp-2">{topic.subtitle}</div>
    </motion.button>
  );
}

// ============================================================
// 专题列表 Tab
// ============================================================

function TopicsTabContent({ topics, mastered, onSelect }: {
  topics: CompetitionTopic[];
  mastered: string[];
  onSelect: (t: CompetitionTopic) => void;
}) {
  const [challengeMode] = useChallengeMode();

  if (challengeMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DungeonMapSection masteredTopics={mastered} onSelectTopic={onSelect} />
      </motion.div>
    );
  }

  return (
    <TopicsTab
      topics={topics}
      mastered={mastered}
      onSelect={onSelect}
    />
  );
}

function TopicsTab({ topics, mastered, onSelect }: {
  topics: CompetitionTopic[];
  mastered: string[];
  onSelect: (t: CompetitionTopic) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="size-5 text-emerald-600" />
          8 大核心专题
        </h2>
        <span className="text-sm text-muted-foreground">
          已掌握 {mastered.length} / {topics.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {topics.map((topic, i) => (
          <TopicCard key={topic.key} topic={topic} isMastered={mastered.includes(topic.key)} onClick={() => onSelect(topic)} delay={i * 0.04} />
        ))}
      </div>
      <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/15 border border-amber-200/50 dark:border-amber-800/40 rounded-xl p-4 mt-3">
        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
        <div>
          <span className="font-medium text-amber-800 dark:text-amber-300">说明：</span>
          每个专题包含考纲对应知识点、常考题型、例题和专项练习。本轮先上线框架和知识点清单，后续逐轮深化内容。
        </div>
      </div>
    </motion.div>
  );
}
