import { memo, useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_GROUPS } from '@/components/AppSidebar';
import MathRenderer from '@/components/MathRenderer';
import { useLastVisited } from '@/hooks/use-last-visited';
import { useRecentModules, recordModuleUsage } from '@/hooks/use-recent-modules';
import { useWrongBook } from '@/hooks/use-learning';
import AchievementWall from '@/components/AchievementWall';
import DailyCheckin from '@/components/DailyCheckin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FORMULA_CATEGORIES } from '@/data/formulas';
import {
   ArrowRight,
   Sparkles,
   Zap,
   BookOpen,
  CheckCircle2,
  Award,
   Layers,
   BookMarked,
   Palette,
   History,
   CalendarDays,
   Sigma,
   Lightbulb,
   Clock,
   Keyboard,
   Trophy,
   BookText,
   Target,
   GraduationCap,
   Map,
   Camera,
   RotateCcw,
   AlertTriangle,
   BarChart3,
   Flame,
  Gift,
  WandSparkles,
  PenSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import KnowledgeContinentMap from '@/components/KnowledgeContinentMap';
import { daysUntilRetake, loadHistory } from '@/pages/MathematicianQuiz/quiz-history';
import { useBlindBox } from '@/hooks/use-blind-box';
import { useSpellbook } from '@/hooks/use-spellbook';
import { useLearningStats } from '@/hooks/use-learning';
import AnnualReportCard from '@/components/AnnualReportCard';
import MathQuoteCard from '@/components/MathQuoteCard';
// 考前冲刺首页仅在考试前 60 天内渲染，按需懒加载，避免把冲刺看板数据打进首屏主包
const SprintHomePage = lazy(() => import('./SprintHomePage'));

function SprintFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
      <p className="text-sm">加载冲刺首页...</p>
    </div>
  );
}
import { differenceInDays, startOfDay } from 'date-fns';

const EXAM_DATE = '2026-11-14';

const FEATURES = [
  { icon: Zap, title: '实时计算', desc: '基于 math.js 引擎，表达式即时求值，支持复数、矩阵、符号运算' },
  { icon: Sparkles, title: '精确显示', desc: '结果优先展示分数、根号、π 等精确形式，一键切换小数近似' },
  { icon: BookOpen, title: '语法速查', desc: '每个模块内置完整语法速查表，含函数签名、数学定义、示例' },
  { icon: BookMarked, title: '公式手册', desc: '16 大分类 190+ 经典数学公式，LaTeX 渲染，支持搜索、收藏和一键跳转模块' },
  { icon: Palette, title: '深色模式', desc: '支持浅色/深色主题切换，自动持久化，保护长时间使用的眼睛' },
  { icon: History, title: '计算历史', desc: '各模块自动保存最近 50 条历史，支持一键复用和清空' },
  { icon: Trophy, title: '步骤详解', desc: '二次方程、导数、积分等高频计算支持逐步推导，理解解题过程' },
];

function useDailyFormula() {
  const [formula, setFormula] = useState<{ name: string; latex: string; category: string } | null>(null);

  useEffect(() => {
    // 根据日期选择"今日公式"，同一天展示同一条
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // 收集所有公式
    const all: { name: string; latex: string; category: string }[] = [];
    FORMULA_CATEGORIES.forEach((cat) => {
      cat.items.forEach((f) => {
        all.push({ name: f.name, latex: f.latex, category: cat.name });
      });
    });

    if (all.length > 0) {
      const idx = seed % all.length;
      setFormula(all[idx]);
    }
  }, []);

  return formula;
}

function HomePageInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lastPath } = useLastVisited();
  const recent = useRecentModules(5);
  const dailyFormula = useDailyFormula();
  const { dueToday, guessedDueToday, pending, mastered } = useWrongBook();
  const [studySeconds, setStudySeconds] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mathforge-study-time');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.date === new Date().toDateString()) setStudySeconds(data.seconds);
      }
    } catch {}
  }, []);
  const studyMinutes = Math.floor(studySeconds / 60);
  const [showGuide, setShowGuide] = useState(() => {
    try { return localStorage.getItem('mathforge-guide-seen') !== '1'; } catch { return false; }
  });

  const dismissGuide = () => {
    setShowGuide(false);
    try { localStorage.setItem('mathforge-guide-seen', '1'); } catch {}
  };
  const {
    todayBox,
    isOpened,
    openedCount,
    totalCount,
  } = useBlindBox();
  const { totalProgress: spellProgress, unlockedTitles } = useSpellbook();
  const { stats } = useLearningStats();
  const today = new Date().toDateString();
  const todayRecord = stats.dailyRecords?.[today];
  const todayTotal = todayRecord?.total ?? 0;
  const todayCorrect = todayRecord?.correct ?? 0;
  const todayRate = todayTotal > 0 ? Math.round(todayCorrect / todayTotal * 100) : 0;
  const [todayGoal, setTodayGoal] = useState(() => {
    const saved = localStorage.getItem('mathforge_daily_goal');
    return saved ? parseInt(saved, 10) : 10;
  });
  const goalProgress = Math.min(todayTotal / todayGoal, 1);

  // 统计信息
  const totalModules = NAV_GROUPS.reduce((sum, g) => sum + g.items.length, 0);
  const totalFormulas = FORMULA_CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);
  const totalCategories = NAV_GROUPS.length;

  // 本周统计（最近7天）
  const weekStats = useMemo(() => {
    let total = 0, correct = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const rec = stats.dailyRecords?.[key];
      if (rec) { total += rec.total; correct += rec.correct; }
    }
    return { total, correct, rate: total > 0 ? Math.round(correct / total * 100) : 0 };
  }, [stats.dailyRecords]);

  // 连续学习天数 streak
  const streakDays = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const rec = stats.dailyRecords?.[key];
      if (rec && rec.total > 0) streak++;
      else if (i === 0) continue; // 今天还没做不算断
      else break;
    }
    return streak;
  }, [stats.dailyRecords]);

  // 累计做题总数
  const totalAllTime = useMemo(() => {
    let total = 0;
    Object.values(stats.dailyRecords || {}).forEach((r) => { total += r.total; });
    return total;
  }, [stats.dailyRecords]);

  // 本月做题数
  const monthTotal = useMemo(() => {
    let total = 0;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    Object.entries(stats.dailyRecords || {}).forEach(([key, r]) => {
      const d = new Date(key);
      if (d.getFullYear() === year && d.getMonth() === month) total += r.total;
    });
    return total;
  }, [stats.dailyRecords]);

  // 已掌握专题数
  const masteredTopics = useMemo(() => {
    const topics = new Set<string>();
    mastered.forEach((w) => topics.add(w.topicKey));
    return topics.size;
  }, [mastered]);

  // 推荐专题：错题最多的专题
  const recommendedTopic = useMemo(() => {
    if (pending.length === 0) return null;
    const counts: Record<string, number> = {};
    pending.forEach((w) => { counts[w.topicKey] = (counts[w.topicKey] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { topic: sorted[0][0], count: sorted[0][1] };
  }, [pending]);

  // 今日数学小知识（按日期选）
  const mathFacts = [
    '0.999… 严格等于 1，不是约等于',
    '自然数之和 1+2+3+… = -1/12（解析延拓意义下）',
    '所有三角形内角和不一定是 180°——球面上大于 180°',
    'e^(iπ) + 1 = 0，被称为最美的数学公式',
    '洛必达法则是约翰·伯努利发明的，洛必达只是买了冠名权',
    '泰勒展开的本质：用多项式局部逼近任意光滑函数',
    '积分从几何上看就是曲线下的面积',
    '中值定理：连续函数在区间内必取到中间值',
    '无穷大有不同层级：可数无穷 < 连续统',
    '傅里叶级数：任何周期函数都能拆成正弦波之和',
    '格林公式把线积分变成面积分，是斯托克斯定理的二维版',
    '夹逼准则：两边的极限夹住中间的，中间必收敛',
  ];
  const todayFact = mathFacts[new Date().getDate() % mathFacts.length];

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  } as const;
  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  } as const;

  const goModule = useCallback(
    (path: string) => {
      recordModuleUsage(path);
      navigate(path);
    },
    [navigate],
  );

  // 考前冲刺首页：考试日期前 60 天内显示冲刺版
  const daysLeft = differenceInDays(startOfDay(new Date(EXAM_DATE)), startOfDay(new Date()));
  const showSprint = daysLeft > 0 && daysLeft <= 60;

  if (showSprint) {
    return (
      <Suspense fallback={<SprintFallback />}>
        <SprintHomePage />
      </Suspense>
    );
  }

  return (
    <div className="min-h-full page-fade-in">
      {/* 首次使用引导 */}
      {showGuide && (
        <div className="sticky top-0 z-40 bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center gap-3">
          <Lightbulb className="size-4 text-primary shrink-0" />
          <p className="text-sm text-foreground flex-1">
            新手提示：按 <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">G</kbd> 再按 <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">H</kbd> 快速跳转首页，按 <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">G</kbd> 再按 <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">P</kbd> 去练习。
          </p>
          <button onClick={dismissGuide} className="text-xs text-muted-foreground hover:text-foreground shrink-0" aria-label="关闭引导">知道了</button>
        </div>
      )}
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute top-32 -left-20 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl" />

        <div className="relative px-4 md:px-6 lg:px-8 py-12 md:py-20 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/60 border border-emerald-200/50 text-emerald-700 text-sm font-medium mb-6">
              <Sparkles className="size-4" />
              全面升级 · {totalModules} 个专业数学模块
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-4">
              MathForge
              <span className="block text-2xl md:text-3xl lg:text-4xl font-normal text-muted-foreground mt-2">
                数学计算工作台
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
              从基础算术到微分几何，从符号代数到数值分析，一站式数学计算与可视化平台。
              <br className="hidden md:block" />
              精确推导、数值求解、函数绘图，全部在浏览器中完成。
            </p>

            {/* 竞赛倒计时 */}
            {daysLeft > 0 && (
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-card border-border mb-8">
                <Target className="size-5 text-primary" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">距离全国大学生数学竞赛</div>
                  <div className="text-2xl font-bold text-primary tabular-nums">{daysLeft} <span className="text-sm font-normal text-muted-foreground">天</span></div>
                </div>
              </div>
            )}
             <div className="flex items-center justify-center gap-3 flex-wrap">
               <Button
                 onClick={() => goModule('/calculator')}
                 size="lg"
                 className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 h-11 px-6"
               >
                 开始计算
                 <ArrowRight className="size-4 ml-1.5" />
               </Button>
               {lastPath && location.pathname === '/' && lastPath !== '/' && (
                 <Button
                   onClick={() => goModule(lastPath)}
                   size="lg"
                   variant="outline"
                   className="border-amber-300 text-amber-700 dark:text-amber-400 dark:border-amber-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 h-11 px-6"
                 >
                   <History className="size-4 mr-1.5" />
                   继续上次
                 </Button>
               )}
               <Button
                 onClick={() => goModule('/formulas')}
                 size="lg"
                 variant="outline"
                 className="border-emerald-300 text-emerald-700 dark:text-emerald-400 dark:border-emerald-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 h-11 px-6"
               >
                 <BookText className="size-4 mr-1.5" />
                 公式手册
               </Button>
               <Button
                 onClick={() => goModule('/plot-2d')}
                 size="lg"
                 variant="outline"
                 className="h-11 px-6"
               >
                 体验函数绘图
               </Button>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 今日重做提醒 */}
      {dueToday.length > 0 && (
        <section className="px-4 md:px-6 lg:px-8 -mt-2 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card
              className="bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-700/40 cursor-pointer hover:shadow-md transition-all"
              onClick={() => navigate('/practice#review-queue')}
            >
              <CardContent className="py-4 px-5 flex items-center gap-4">
                <div className="size-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <RotateCcw className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    今天要重做 {dueToday.length} 道错题
                  </div>
                  <div className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">
                    艾宾浩斯复习到期，趁热打铁巩固一下 →
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {dueToday.length}
                  </div>
                  <div className="text-xs text-amber-600/60 dark:text-amber-400/60">道</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
       )}

      {/* 今日学习时长 */}
      <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
        <Card className="bg-card border-border">
          <CardContent className="py-3 px-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">今日已学习</div>
              <div className="text-xs text-muted-foreground mt-0.5">保持专注，竞赛倒计时冲刺中</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xl font-bold text-primary tabular-nums">{studyMinutes}<span className="text-xs font-normal text-muted-foreground ml-1">分钟</span></div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 每日签到 */}
      <section className="px-4 md:px-6 lg:px-8 pt-4 max-w-6xl mx-auto">
        <DailyCheckin />
      </section>

      {/* 数学名言 */}
      <section className="px-4 md:px-6 lg:px-8 pt-4 max-w-6xl mx-auto">
        <MathQuoteCard />
      </section>

      {/* 今日目标进度 */}
      <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
        <Card className="bg-card border-border">
          <CardContent className="py-3 px-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-foreground">今日目标</div>
              <button
                type="button"
                onClick={() => {
                  const input = prompt('设置每日目标题数：', String(todayGoal));
                  if (input && !isNaN(parseInt(input, 10)) && parseInt(input, 10) > 0) {
                    setTodayGoal(parseInt(input, 10));
                    localStorage.setItem('mathforge_daily_goal', String(parseInt(input, 10)));
                  }
                }}
                className="text-xs text-muted-foreground tabular-nums hover:text-foreground transition-colors"
                title="点击修改目标"
              >
                {todayTotal} / {todayGoal} 题
              </button>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${goalProgress * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {todayTotal >= todayGoal ? '目标达成，继续保持！' : `再做 ${todayGoal - todayTotal} 道题完成今日目标`}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 本周统计 */}
      <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
        <Card className="bg-card border-border">
          <CardContent className="py-3 px-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BarChart3 className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">本周学习</div>
              <div className="text-xs text-muted-foreground mt-0.5">最近7天的做题情况</div>
            </div>
            <div className="shrink-0 text-right flex gap-4">
              <div>
                <div className="text-xl font-bold text-foreground tabular-nums">{weekStats.total}</div>
                <div className="text-xs text-muted-foreground">题</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary tabular-nums">{weekStats.rate}%</div>
                <div className="text-xs text-muted-foreground">正确率</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 连续学习 streak */}
      <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
        <Card className="bg-card border-border">
          <CardContent className="py-3 px-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Flame className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">连续学习</div>
              <div className="text-xs text-muted-foreground mt-0.5">{streakDays > 0 ? '保持住，别断！' : '今天做一题开始 streak'}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xl font-bold text-primary tabular-nums">{streakDays}<span className="text-xs font-normal text-muted-foreground ml-1">天</span></div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 累计做题总数 */}
      <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
        <Card className="bg-card border-border">
          <CardContent className="py-3 px-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">累计做题</div>
              <div className="text-xs text-muted-foreground mt-0.5">从开始到现在的总题数</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xl font-bold text-primary tabular-nums">{totalAllTime}</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 本月做题数 */}
      <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
        <Card className="bg-card border-border">
          <CardContent className="py-3 px-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarDays className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">本月做题</div>
              <div className="text-xs text-muted-foreground mt-0.5">本月累计做题数</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xl font-bold text-primary tabular-nums">{monthTotal}</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 今日正确率 */}
      <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
        <Card className="bg-card border-border">
          <CardContent className="py-3 px-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">今日正确率</div>
              <div className="text-xs text-muted-foreground mt-0.5">今天做对的比例</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xl font-bold text-primary tabular-nums">{todayRate}%</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 已掌握专题数 */}
      <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
        <Card className="bg-card border-border">
          <CardContent className="py-3 px-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Award className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">已掌握专题</div>
              <div className="text-xs text-muted-foreground mt-0.5">错题本里已掌握的专题数</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xl font-bold text-primary tabular-nums">{masteredTopics}</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 今日推荐专题 */}
      {recommendedTopic && (
        <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
          <Card
            className="bg-card border-border cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(`/practice?topic=${recommendedTopic.topic}`)}
          >
            <CardContent className="py-3 px-5 flex items-center gap-4">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Target className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">推荐练习</div>
                <div className="text-xs text-muted-foreground mt-0.5">你在「{recommendedTopic.topic}」有 {recommendedTopic.count} 道错题，趁热打铁</div>
              </div>
              <div className="shrink-0">
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 今日数学小知识 */}
      <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
        <Card className="bg-card border-border">
          <CardContent className="py-3 px-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lightbulb className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">今日数学小知识</div>
              <div className="text-xs text-muted-foreground mt-0.5">{todayFact}</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 成就墙 */}
      <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
        <AchievementWall />
      </section>

       {/* 蒙对重考提醒 */}
       {guessedDueToday.length > 0 && (
         <section className="px-4 md:px-6 lg:px-8 -mt-2 pt-3 max-w-6xl mx-auto">
           <motion.div
             initial={{ opacity: 0, y: 12 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4, delay: 0.25 }}
           >
             <Card
               className="bg-orange-50/60 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-700/40 cursor-pointer hover:shadow-md transition-all"
               onClick={() => navigate('/practice?tab=wrongbook#guess-review')}
             >
               <CardContent className="py-4 px-5 flex items-center gap-4">
                 <div className="size-11 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                   <AlertTriangle className="size-5" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                     你有 {guessedDueToday.length} 道题疑似蒙对，该验证了
                   </div>
                   <div className="text-xs text-orange-700/70 dark:text-orange-400/70 mt-0.5">
                     3 天重考期到了，看看是不是真掌握了 →
                   </div>
                 </div>
                 <div className="shrink-0 text-right">
                   <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                     {guessedDueToday.length}
                   </div>
                   <div className="text-xs text-orange-600/60 dark:text-orange-400/60">道</div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
         </section>
       )}

        {/* 数学家测试入口 */}
        <section className="px-4 md:px-6 lg:px-8 -mt-1 pt-3 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {/* 数学家人格 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card
                className="h-full bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-700/40 cursor-pointer hover:shadow-md transition-all group overflow-hidden"
                onClick={() => goModule('/mathematician-quiz')}
              >
                <CardContent className="py-4 px-5 flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                      你是哪种数学家？
                    </div>
                    <div className="text-xs text-rose-700/70 dark:text-rose-400/70 mt-0.5 truncate">
                      10 道题测出你的数学人格
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {(() => {
                      const history = loadHistory();
                      const lastRecord = history[0];
                      const retakeDays = daysUntilRetake();
                      if (lastRecord && retakeDays > 0) {
                        const primaryKey = lastRecord.result.primary;
                        const typeNames: Record<string, string> = {
                          gauss: '高斯', euler: '欧拉', ramanujan: '拉马努金', archimedes: '阿基米德',
                        };
                        return (
                          <>
                            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
                              {typeNames[primaryKey]}型
                            </div>
                            <div className="text-xs text-rose-600/60 dark:text-rose-400/60">
                              {retakeDays} 天后可重测
                            </div>
                          </>
                        );
                      }
                      return (
                        <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                          去测试
                          <ArrowRight className="size-3.5 inline ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 今日盲盒 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <Card
                className="h-full bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-700/40 cursor-pointer hover:shadow-md transition-all group overflow-hidden"
                onClick={() => goModule('/blind-box')}
              >
                <CardContent className="py-4 px-5 flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Gift className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      今日数学盲盒
                    </div>
                    <div className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5 truncate">
                      {isOpened ? todayBox.title : '一个未知的反直觉结论…'}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {openedCount}/{totalCount}
                    </div>
                    <div className="text-xs text-amber-600/60 dark:text-amber-400/60">
                      已收集
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 公式咒语 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card
                className="h-full bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-700/40 cursor-pointer hover:shadow-md transition-all group overflow-hidden"
                onClick={() => goModule('/spellbook')}
              >
                <CardContent className="py-4 px-5 flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <WandSparkles className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      公式咒语收集
                    </div>
                    <div className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 truncate">
                      默写点亮 {spellProgress.mastered}/{spellProgress.total} 张技能卡
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {unlockedTitles.length > 0 ? unlockedTitles[0] : '去收集'}
                    </div>
                    <div className="text-xs text-emerald-600/60 dark:text-emerald-400/60">
                      {unlockedTitles.length > 0 ? `${unlockedTitles.length} 个称号` : '首称号待解锁'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 我当老师 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.42 }}
            >
              <Card
                className="h-full bg-cyan-50/60 dark:bg-cyan-950/20 border-cyan-200/60 dark:border-cyan-700/40 cursor-pointer hover:shadow-md transition-all group overflow-hidden"
                onClick={() => goModule('/teacher')}
              >
                <CardContent className="py-4 px-5 flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <PenSquare className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-cyan-800 dark:text-cyan-300">
                      我当老师
                    </div>
                    <div className="text-xs text-cyan-700/70 dark:text-cyan-400/70 mt-0.5 truncate">
                      你出题，AI 来做，你来批改
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 年度报告 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <AnnualReportCard stats={stats} variant="compact" />
            </motion.div>
          </div>
        </section>

          {/* 快捷入口 */}
         <section className="px-4 md:px-6 lg:px-8 pb-2 max-w-6xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <motion.div
             initial={{ opacity: 0, y: 16 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4 }}
           >
             <Card
               className="h-full bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200/60 dark:border-emerald-800/30 cursor-pointer hover:shadow-md hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20 transition-all group"
               onClick={() => goModule('/formulas')}
             >
               <CardContent className="pt-6 pb-5">
                 <div className="flex items-start gap-4">
                   <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                     <BookMarked className="size-6" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                       公式手册
                       <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                         {totalFormulas}+ 公式
                       </span>
                     </h3>
                     <p className="text-sm text-muted-foreground mb-3">
                       16 大分类全覆盖，搜索、收藏、一键跳转对应模块
                     </p>
                     <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium group-hover:gap-2 transition-all">
                       立即浏览
                       <ArrowRight className="size-3.5" />
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, y: 16 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4, delay: 0.1 }}
           >
             <Card
               className="h-full bg-amber-50/50 dark:bg-amber-950/15 border-amber-200/60 dark:border-amber-800/30 cursor-pointer hover:shadow-md hover:shadow-amber-100/50 dark:hover:shadow-amber-900/20 transition-all group"
               onClick={() => goModule('/competition')}
             >
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Trophy className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                         竞赛备战中心
                         <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                           倒计时·8大专题·模拟卷
                         </span>
                       </h3>
                       <p className="text-sm text-muted-foreground mb-3">
                         全国大学生数学竞赛非数学类A类系统备考，8大专题+10条核心技巧+模拟试卷
                      </p>
                      <div className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 font-medium group-hover:gap-2 transition-all">
                        开始挑战
                        <ArrowRight className="size-3.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 练习训练 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Card
                className="h-full bg-sky-50/50 dark:bg-sky-950/15 border-sky-200/60 dark:border-sky-800/30 cursor-pointer hover:shadow-md hover:shadow-sky-100/50 dark:hover:shadow-sky-900/20 transition-all group"
                onClick={() => goModule('/practice')}
              >
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                        练习训练
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                          刷题模式
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        8 大知识点随机出题，即时判分，附步骤详解
                      </p>
                      <div className="flex items-center gap-1 text-sm text-sky-600 dark:text-sky-400 font-medium group-hover:gap-2 transition-all">
                        开始练习
                        <ArrowRight className="size-3.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card
                className="h-full bg-rose-50/50 dark:bg-rose-950/15 border-rose-200/60 dark:border-rose-800/30 cursor-pointer hover:shadow-md hover:shadow-rose-100/50 dark:hover:shadow-rose-900/20 transition-all group"
                onClick={() => goModule('/photo-solve')}
              >
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <Camera className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                        拍照识题
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          AI 解题
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        上传题目图片，AI 智能识别并给出分步解答
                      </p>
                      <div className="flex items-center gap-1 text-sm text-rose-600 dark:text-rose-400 font-medium group-hover:gap-2 transition-all">
                        立即体验
                        <ArrowRight className="size-3.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 知识大陆 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="lg:col-span-2"
            >
              <KnowledgeContinentMap compact />
            </motion.div>
          </div>
        </section>

        <section className="px-4 md:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 模块统计 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Card className="h-full bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-800/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Layers className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">功能模块</div>
                    <div className="text-2xl font-bold text-foreground">
                      {totalModules}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        个
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <div>
                    <Sigma className="size-3.5 inline mr-1 text-emerald-500" />
                    {totalCategories} 大类
                  </div>
                  <div>
                    <BookMarked className="size-3.5 inline mr-1 text-amber-500" />
                    {totalFormulas} 公式
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 今日公式 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="h-full bg-card border-border cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all"
              onClick={() => goModule('/formulas')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="size-4 text-amber-500" />
                  <span className="text-xs font-medium text-muted-foreground">今日公式</span>
                </div>
                {dailyFormula && (
                  <>
                    <div className="text-base font-semibold text-foreground mb-1">
                      {dailyFormula.name}
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {dailyFormula.category}
                    </div>
                    <div className="bg-muted/50 rounded-lg px-3 py-2 text-center text-sm min-h-[2.5rem] flex items-center justify-center">
                      <MathRenderer expression={dailyFormula.latex} displayMode />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 最近使用 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="h-full bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="size-4 text-emerald-500" />
                  <span className="text-xs font-medium text-muted-foreground">最近使用</span>
                </div>
                {recent.length > 0 ? (
                  <div className="space-y-1.5">
                    {recent.map((r) => (
                      <button
                        key={r.path}
                        onClick={() => goModule(r.path)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                      >
                        <span className="truncate">{r.label}</span>
                        <ArrowRight className="size-3.5 opacity-50" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic py-3 text-center">
                    <Lightbulb className="size-4 mx-auto mb-1 opacity-50" />
                    使用过的模块会显示在这里
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 模块分类卡片 */}
      <section className="px-4 md:px-6 lg:px-8 py-10 md:py-14 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-end justify-between gap-4 flex-wrap"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">功能模块</h2>
            <p className="text-muted-foreground">按分类浏览，点击卡片进入对应模块</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goModule('/knowledge-map')}
            className="gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <Map className="size-4" />
            知识地图
          </Button>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        >
          {NAV_GROUPS.map((group) => (
            <motion.div key={group.name} variants={item}>
              <Card
                className="h-full border-border bg-card/60 backdrop-blur-sm hover:border-emerald-300/60 hover:shadow-md hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20 transition-all duration-300 cursor-pointer group"
                onClick={() => {
                  if (group.items.length > 0) {
                    goModule(group.items[0].path);
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      {group.items[0] && (() => {
                        const IconComponent = group.items[0].icon;
                        return <IconComponent className="size-3.5" />;
                      })()}
                    </span>
                    {group.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    {group.items.length} 个子模块
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            goModule(item.path);
                          }}
                          className={cn(
                            'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm',
                            'text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 transition-colors',
                          )}
                        >
                          <Icon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-emerald-500" />
                          <span className="truncate">{item.label}</span>
                          <ArrowRight className="size-3.5 ml-auto opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 核心特性 */}
      <section className="px-4 md:px-6 lg:px-8 py-10 md:py-14 border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">核心特性</h2>
            <p className="text-muted-foreground">专为数学学习与研究打造</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-xl bg-card/80 border border-border p-5 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all"
                >
                  <div className="size-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-16" />

      {/* 快捷键提示 */}
      <section className="px-4 md:px-6 lg:px-8 pb-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card/60 border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Keyboard className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">键盘快捷键</h3>
                    <p className="text-xs text-muted-foreground">高效计算，双手不离开键盘</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'Ctrl/⌘ + K', desc: '搜索模块' },
                    { key: 'Enter', desc: '触发计算' },
                    { key: 'Esc', desc: '关闭/清空' },
                    { key: 'Ctrl/⌘ + Shift + C', desc: '复制结果' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50"
                    >
                      <kbd className="shrink-0 px-2 py-0.5 text-xs font-mono bg-muted border border-border rounded text-muted-foreground shadow-sm">
                        {item.key}
                      </kbd>
                      <span className="text-xs text-muted-foreground pt-0.5">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const HomePage = memo(HomePageInner);
export default HomePage;
