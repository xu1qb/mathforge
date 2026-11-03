import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdventureMode from './AdventureMode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  BookX,
  CheckCircle2,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  X,
  Eye,
  Check,
  Brain,
  Swords,
  AlertCircle,
  CalendarDays,
  Printer,
  Lightbulb,
  GitBranch,
  Volume2,
  Download,
  Shuffle,
} from 'lucide-react';
import WrongReasonChart from '@/components/WrongReasonChart';
import ReviewQueue from '@/components/ReviewQueue';
import type { WrongReason } from '@/hooks/use-learning';
import { motion, AnimatePresence } from 'framer-motion';
import MathRenderer from '@/components/MathRenderer';
import MathInputField from '@/components/MathInputField';
import RichTextRenderer from '@/components/RichTextRenderer';
import WrongBookPrintDialog from '@/components/print/WrongBookPrintDialog';
import VariantPanel from '@/components/VariantPanel';
import TtsButton from '@/components/TtsButton';
import { downloadFile } from '@/lib/export-utils';
import ReviewAudioQueue from '@/components/ReviewAudioQueue';
import type { ReviewAudioItem } from '@/components/ReviewAudioQueue';
import PixelBossBar, { dispatchBossDamage } from '@/components/PixelBossBar';
import { useWrongBook, usePracticeSettings } from '@/hooks/use-learning';
import { REVIEW_STAGE_LABELS, isReviewDue, WRONG_REASON_LABELS } from '@/hooks/use-learning';
import { useMastery } from '@/hooks/use-mastery';
import { PRACTICE_TOPICS, checkPracticeAnswer, type PracticeQuestion } from '@/lib/math-practice';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 专题分类（与其他页面保持一致）
const TOPIC_CATEGORIES = [
  { key: 'algebra', label: '代数' },
  { key: 'geometry', label: '几何' },
  { key: 'trigonometry', label: '三角函数' },
  { key: 'analysis', label: '数学分析' },
  { key: 'equations', label: '微分方程' },
  { key: 'probability', label: '概率统计' },
  { key: 'number-theory', label: '数论' },
];

export default function WrongBookSection() {
  const navigate = useNavigate();
  const {
     items,
     pending,
     mastered,
     dueToday,
     guessedPending,
     guessedDueToday,
     stats,
     wrongReasonStats,
     markMastered,
     markGuessVerified,
     markGuessWrong,
     markGuessAgain,
     removeItem,
     clearAll,
     incrementRetry,
     addWrong,
     markReviewRemembered,
     markReviewForgotten,
   } = useWrongBook();
  const { markGuessVerified: markMasteryGuessVerified } = useMastery();
  const { answerMode } = usePracticeSettings();
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterReason, setFilterReason] = useState<WrongReason | null>(null);
   const [filterGuess, setFilterGuess] = useState<'all' | 'guessed' | 'normal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
   const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'due'>('newest');
  const [activeTab, setActiveTab] = useState<'pending' | 'mastered' | 'due'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [retryMode, setRetryMode] = useState<{ id: string; answer: string } | null>(null);
  const [retryResult, setRetryResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [adventureMode, setAdventureMode] = useState(false);
  // 自评模式：每道题的答案展开状态
  const [showAnswerMap, setShowAnswerMap] = useState<Record<string, boolean>>({});
  // 复习模式：每道题的自评状态
  const [reviewResultMap, setReviewResultMap] = useState<Record<string, 'remembered' | 'forgotten' | null>>({});
  // 删除确认：第一次点击进入确认态，第二次真正删除
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // 确认态 3 秒后自动恢复
  useEffect(() => {
    if (!confirmDeleteId) return;
    const t = setTimeout(() => setConfirmDeleteId(null), 3000);
    return () => clearTimeout(t);
  }, [confirmDeleteId]);

  // 导出错题为文本文件
  const handleExport = () => {
    const list = activeTab === 'mastered' ? mastered : pending;
    if (list.length === 0) {
      toast.info('当前没有可导出的题目');
      return;
    }
    const date = new Date().toLocaleDateString('zh-CN');
    const lines: string[] = [
      '数学竞赛错题本导出',
      '='.repeat(30),
      `导出时间：${date}`,
      `题目数量：${list.length} 道`,
      '',
    ];
    list.forEach((item, i) => {
      const reasonLabel = item.wrongReason ? WRONG_REASON_LABELS[item.wrongReason] : '未分类';
      lines.push(`【第${i + 1}题】${item.topicKey}`);
      lines.push(`题目：${item.question.question}`);
      lines.push(`我的答案：${item.userAnswer}`);
      lines.push(`正确答案：${item.question.answerDisplay || item.question.answer}`);
      lines.push(`错因：${reasonLabel}`);
      lines.push(`复习次数：${item.reviewCount}`);
      lines.push('');
    });
    downloadFile(lines.join('\n'), `错题本_${date}.txt`);
    toast.success(`已导出 ${list.length} 道错题`);
  };

  // 随机抽一道待复习错题，跳转到练习页对应专题
  const handleRandomPractice = () => {
    const pool = activeTab === 'due' ? dueToday : pending;
    if (pool.length === 0) {
      toast.info('当前没有可练习的错题');
      return;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    toast.success(`随机抽中：${item.topicKey}，去练一题 →`);
    navigate(`/practice?topic=${item.topicKey}`);
  };
  const [printOpen, setPrintOpen] = useState(false);
  const [reviewQueueOpen, setReviewQueueOpen] = useState(false);
  const [guessReviewOpen, setGuessReviewOpen] = useState(false);
  // 变式面板：当前选中的错题
  const [variantQuestion, setVariantQuestion] = useState<PracticeQuestion | null>(null);
  const [variantOpen, setVariantOpen] = useState(false);
  const [audioQueueOpen, setAudioQueueOpen] = useState(false);
  const [audioQueueItems, setAudioQueueItems] = useState<ReviewAudioItem[]>([]);

  // URL hash 触发自动打开重做队列
   useEffect(() => {
     if (typeof window === 'undefined') return;
     if (window.location.hash === '#review-queue' && dueToday.length > 0) {
       setReviewQueueOpen(true);
       // 清掉 hash 避免刷新重复触发
       history.replaceState(null, '', window.location.pathname + window.location.search);
     }
     if (window.location.hash === '#guess-review' && guessedDueToday.length > 0) {
       setGuessReviewOpen(true);
       history.replaceState(null, '', window.location.pathname + window.location.search);
     }
   }, [dueToday.length, guessedDueToday.length]);

  // 所有专题分类（从 PRACTICE_TOPICS 聚合）
  const topicCategories = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of PRACTICE_TOPICS) {
      if (!map.has(t.category)) {
        const c = TOPIC_CATEGORIES.find((c) => c.key === t.category);
        map.set(t.category, c?.label ?? t.category);
      }
    }
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, []);

  // 当前分类下的知识点列表（用于按知识点筛选下拉）
  const filteredTopics = useMemo(() => {
    if (filterCategory === 'all') return PRACTICE_TOPICS;
    return PRACTICE_TOPICS.filter((t) => t.category === filterCategory);
  }, [filterCategory]);

  // 错题中实际出现的知识点（用于知识点下拉只显示有错题的）
  const availableTopicKeys = useMemo(() => {
    const all = [...pending, ...mastered, ...dueToday];
    return new Set(all.map((w) => w.topicKey));
  }, [pending, mastered, dueToday]);

  const displayItems = useMemo(() => {
    let items: typeof pending;
    if (activeTab === 'pending') items = pending;
    else if (activeTab === 'mastered') items = mastered;
    else items = dueToday;
    if (filterCategory !== 'all') {
      items = items.filter((w) => {
        const t = PRACTICE_TOPICS.find((topic) => topic.key === w.topicKey);
        return t?.category === filterCategory;
      });
    }
    if (filterTopic !== 'all') {
      items = items.filter((w) => w.topicKey === filterTopic);
    }
    if (filterReason) {
       items = items.filter((w) => w.wrongReason === filterReason);
     }
     if (filterGuess === 'guessed') {
       items = items.filter((w) => w.guessedCorrect);
     } else if (filterGuess === 'normal') {
       items = items.filter((w) => !w.guessedCorrect);
     }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((w) =>
        w.question.question.toLowerCase().includes(q) ||
        w.userAnswer.toLowerCase().includes(q)
      );
    }
    items = [...items].sort((a, b) => {
      if (sortOrder === 'due') {
        return a.nextReviewDate - b.nextReviewDate;
      }
      return sortOrder === 'newest' ? b.wrongTime - a.wrongTime : a.wrongTime - b.wrongTime;
    });
    return items;
  }, [activeTab, pending, mastered, dueToday, filterCategory, filterTopic, filterReason, filterGuess, sortOrder, searchQuery]);

  // 切换分类时重置知识点筛选
  const handleCategoryChange = (cat: string) => {
    setFilterCategory(cat);
    setFilterTopic('all');
  };

  // 清空所有筛选
  const resetFilters = () => {
    setFilterCategory('all');
    setFilterTopic('all');
    setFilterReason(null);
    setSortOrder('newest');
  };

  // 生成今日复盘音频队列
  const handleGenerateReviewQueue = () => {
    const today = new Date();
    const todayStr = today.toDateString();
    const queueItems: ReviewAudioItem[] = [];

    const getTopicLabel = (topicKey: string): string => {
      const found = PRACTICE_TOPICS.find((t) => t.key === topicKey);
      return found?.label || '数学题';
    };

    const getWrongReasonLabel = (w: (typeof pending)[number]): string => {
      if (!w.wrongReason) return '未标注错因';
      return WRONG_REASON_LABELS[w.wrongReason] || w.wrongReason;
    };

    const seenIds = new Set<string>();

    // 1. 今日错题（今日 wrongTime 的）
    const todayWrong = pending.filter((w) => new Date(w.wrongTime).toDateString() === todayStr);
    for (const w of todayWrong) {
      if (seenIds.has(w.id)) continue;
      seenIds.add(w.id);
      queueItems.push({
        id: `wrong-${w.id}`,
        topic: getTopicLabel(w.question.topicKey),
        question: w.question.question,
        correctAnswer: w.question.answerDisplay,
        yourAnswer: w.userAnswer || '未作答',
        analysisSummary: w.question.steps?.slice(0, 2).join('。') || '暂无解析',
        wrongReason: getWrongReasonLabel(w),
      });
    }

    // 2. 今日重做到期的题（非今日新增的）
    const dueTodayItems = dueToday.filter((w) => {
      const wrongDate = new Date(w.wrongTime).toDateString();
      return wrongDate !== todayStr && !seenIds.has(w.id);
    });
    for (const w of dueTodayItems) {
      if (seenIds.has(w.id)) continue;
      seenIds.add(w.id);
      queueItems.push({
        id: `due-${w.id}`,
        topic: getTopicLabel(w.question.topicKey),
        question: w.question.question,
        correctAnswer: w.question.answerDisplay,
        yourAnswer: w.userAnswer || '上次做错',
        analysisSummary: w.question.steps?.slice(0, 2).join('。') || '暂无解析',
        wrongReason: getWrongReasonLabel(w),
      });
    }

    // 3. 今日做错的变式题（source 中 self-eval/auto 都可能来自变式，通过 wrongTime 今日 + question id 含 variant 前缀判断）
    // 简化：变式题通过 question.id 含 'variant' 前缀来识别
    const todayVariantWrong = pending.filter(
      (w) =>
        new Date(w.wrongTime).toDateString() === todayStr &&
        w.question.id.includes('variant') &&
        !seenIds.has(w.id),
    );
    for (const w of todayVariantWrong) {
      seenIds.add(w.id);
      queueItems.push({
        id: `variant-${w.id}`,
        topic: getTopicLabel(w.question.topicKey) + ' · 变式',
        question: w.question.question,
        correctAnswer: w.question.answerDisplay,
        yourAnswer: w.userAnswer || '未作答',
        analysisSummary: w.question.steps?.slice(0, 2).join('。') || '暂无解析',
        wrongReason: getWrongReasonLabel(w),
      });
    }

    setAudioQueueItems(queueItems);
    setAudioQueueOpen(true);
    if (queueItems.length === 0) {
      toast.info('今日暂无错题可复盘');
    } else {
      toast.success(`已生成 ${queueItems.length} 道题的复盘队列`);
    }
  };

  const handleRetry = (wrongId: string, question: PracticeQuestion) => {
    if (!retryMode || retryMode.id !== wrongId) {
      setRetryMode({ id: wrongId, answer: '' });
      setRetryResult(null);
      return;
    }
    // 提交答案
    const result = checkPracticeAnswer(question, retryMode.answer);
    setRetryResult(result);
    incrementRetry(wrongId, result.correct);
    if (result.correct) {
      markReviewRemembered(wrongId); // 答对，推进复习阶段
      dispatchBossDamage();
      toast.success('重做正确！复习阶段 +1');
    } else {
      // 答错了又加回去，但同一题只更新次数（addWrong 内部会去重）
      addWrong(question, retryMode.answer);
      markReviewForgotten(wrongId); // 答错，重置复习阶段
      toast.error('还是错了，复习阶段已重置');
    }
  };

  // 自评模式：重做时的自评
  const handleSelfEvalRetry = (wrongId: string, question: PracticeQuestion, result: 'correct' | 'wrong') => {
    const isCorrect = result === 'correct';
    setRetryResult({
      correct: isCorrect,
      message: isCorrect ? '自评正确！做得不错' : '自评错误，再复习一下解析',
    });
    incrementRetry(wrongId, isCorrect);
    if (isCorrect) {
      markReviewRemembered(wrongId);
      dispatchBossDamage();
      toast.success('重做正确！复习阶段 +1');
    } else {
      addWrong(question, '自评错误', 'self-eval');
      markReviewForgotten(wrongId);
      toast.info('已记录，复习阶段已重置');
    }
  };

  const closeRetry = () => {
    setRetryMode(null);
    setRetryResult(null);
  };

  const handleClearAll = () => {
    const label = activeTab === 'pending' ? '待复习错题' : '已掌握题目';
    const count = activeTab === 'pending' ? pending.length : mastered.length;
    if (count === 0) return;
    if (confirm(`确定要清空所有 ${count} 条${label}吗？`)) {
      clearAll();
      toast.success('已清空');
    }
  };

  const getTopicLabel = (key: string) => {
    return PRACTICE_TOPICS.find((t) => t.key === key)?.label || key;
  };

  return (
    <div className="space-y-4">
      {/* 统计概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-4 px-4">
            <div className="text-xs text-muted-foreground mb-1">错题总数</div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
           <CardContent className="py-4 px-4">
             <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
               <AlertCircle className="size-3" />
               今日待复习
             </div>
             <div className={cn('text-2xl font-bold', dueToday.length > 0 ? 'text-amber-500' : 'text-emerald-500')}>
               {dueToday.length}
             </div>
           </CardContent>
         </Card>
         {guessedPending.length > 0 && (
           <Card
             className="cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
             onClick={() => setGuessReviewOpen(true)}
           >
             <CardContent className="py-4 px-4">
               <div className="text-xs text-orange-600 dark:text-orange-400 mb-1 flex items-center gap-1 font-medium">
                 <AlertCircle className="size-3" />
                 待验证（蒙对）
               </div>
               <div className="text-2xl font-bold text-orange-500">
                 {guessedPending.length}
               </div>
               <div className="text-xs text-muted-foreground mt-1">
                 今日到期 {guessedDueToday.length} 道 · 点击验证
               </div>
             </CardContent>
           </Card>
         )}
        <Card>
          <CardContent className="py-4 px-4">
            <div className="text-xs text-muted-foreground mb-1">待复习</div>
            <div className="text-2xl font-bold text-rose-500">{stats.pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 px-4">
            <div className="text-xs text-muted-foreground mb-1">已掌握</div>
            <div className="text-2xl font-bold text-emerald-500">{stats.masteredCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* 像素皮肤：BOSS 血条 */}
      <PixelBossBar
        totalWrong={stats.total}
        pendingWrong={pending.length}
        onCorrectOne={() => {}}
      />

      {/* 冒险模式 */}
      {adventureMode && pending.length > 0 && <AdventureMode />}

      {/* 错因分布 */}
      {stats.pendingCount > 0 && (
        <WrongReasonChart
          counts={wrongReasonStats.counts}
          totalWithReason={wrongReasonStats.totalWithReason}
          topReason={wrongReasonStats.topReason}
          selectedReason={filterReason}
          onSelectReason={setFilterReason}
        />
      )}

      {/* 按专题统计 */}
      {pending.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4 pb-2">
            <CardTitle className="text-sm font-medium">各专题错题数</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-3">
            {(() => {
              const topicCounts: Record<string, number> = {};
              pending.forEach((w) => {
                topicCounts[w.topicKey] = (topicCounts[w.topicKey] || 0) + 1;
              });
              const max = Math.max(...Object.values(topicCounts));
              const entries = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
              return (
                <div className="space-y-1.5">
                  {entries.map(([topic, count]) => (
                    <div key={topic} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20 truncate shrink-0">{topic}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-foreground tabular-nums w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* 筛选栏 */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'mastered' | 'due')}>
              <TabsList className="grid grid-cols-3 w-60">
                <TabsTrigger value="pending" className="text-sm">
                  <BookX className="size-3.5 mr-1.5" />
                  待复习 ({pending.length})
                </TabsTrigger>
                <TabsTrigger value="due" className="text-sm">
                  <Brain className="size-3.5 mr-1.5" />
                  今日 ({dueToday.length})
                </TabsTrigger>
                <TabsTrigger value="mastered" className="text-sm">
                  <CheckCircle2 className="size-3.5 mr-1.5" />
                  已掌握 ({mastered.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 flex-1 justify-end flex-wrap">
              <Button
                size="sm"
                variant={adventureMode ? 'default' : 'outline'}
                className="h-8"
                onClick={() => setAdventureMode((v) => !v)}
              >
                <Swords className="size-3.5 mr-1.5" />
                {adventureMode ? '退出冒险' : '冒险模式'}
              </Button>
              {activeTab === 'due' && dueToday.length > 0 && (
                <Button size="sm" onClick={() => setReviewQueueOpen(true)} className="h-8">
                  <RotateCcw className="size-3.5 mr-1.5" />
                  开始重做
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleExport} className="h-8">
                <Download className="size-3.5 mr-1.5" />
                导出
              </Button>
              <Button size="sm" variant="outline" onClick={handleRandomPractice} className="h-8">
                <Shuffle className="size-3.5 mr-1.5" />
                随机练
              </Button>
              {activeTab === 'mastered' && mastered.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(`确定要清空所有 ${mastered.length} 道已掌握题目吗？`)) {
                      mastered.forEach((w) => removeItem(w.id));
                      toast.success(`已清空 ${mastered.length} 道已掌握题目`);
                    }
                  }}
                >
                  <Trash2 className="size-3.5 mr-1.5" />
                  清空已掌握
                </Button>
              )}
              <Input
                placeholder="搜索题目关键词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 h-8 text-xs"
              />
              <Select value={filterCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue placeholder="按专题" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部专题</SelectItem>
                  {topicCategories.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTopic} onValueChange={setFilterTopic}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="按知识点" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部知识点</SelectItem>
                  {filteredTopics
                    .filter((t) => availableTopicKeys.has(t.key))
                    .map((t) => (
                      <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={filterGuess} onValueChange={(v) => setFilterGuess(v as 'all' | 'guessed' | 'normal')}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部题目</SelectItem>
                  <SelectItem value="guessed">蒙对重考</SelectItem>
                  <SelectItem value="normal">普通错题</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'newest' | 'oldest' | 'due')}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">最新收录</SelectItem>
                  <SelectItem value="oldest">最早收录</SelectItem>
                  <SelectItem value="due">复习到期优先</SelectItem>
                </SelectContent>
              </Select>

              {(filterCategory !== 'all' || filterTopic !== 'all') && (
                <Button size="sm" variant="ghost" onClick={resetFilters} className="h-8 px-2 text-xs">
                  <X className="size-3.5 mr-1" />
                  清空筛选
                </Button>
              )}

              <Button size="sm" variant="outline" onClick={() => setPrintOpen(true)}>
                 <Printer className="size-3.5 mr-1" />
                 打印错题
               </Button>

               <Button size="sm" variant="secondary" onClick={handleGenerateReviewQueue} disabled={displayItems.length === 0}>
                 <Volume2 className="size-3.5 mr-1" />
                 今日复盘
               </Button>

              <Button size="sm" variant="ghost" onClick={handleClearAll}>
                <Trash2 className="size-3.5 mr-1" />
                清空
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 今日复盘音频队列 */}
      {audioQueueOpen && audioQueueItems.length > 0 && (
        <ReviewAudioQueue
          items={audioQueueItems}
          open={audioQueueOpen}
          onOpenChange={setAudioQueueOpen}
        />
      )}

      {/* 错题列表 */}
      {displayItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="size-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
              <BookX className="size-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">
              {activeTab === 'pending' ? '暂无错题，继续加油！' : '还没有掌握的题目'}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {activeTab === 'pending' ? '答错的题目会自动收录到这里' : '重做答对后可标记为已掌握'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayItems.map((w) => {
            const isExpanded = expandedId === w.id;
            const isRetrying = retryMode?.id === w.id;
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={cn(
                    'overflow-hidden transition-all relative',
                    'journal-wrong-card sticky-pop',
                    w.mastered && 'border-emerald-200 dark:border-emerald-800/40',
                    !w.mastered && 'wrong-card-correction',
                  )}
                >
                  {/* 手账皮肤重做印章 */}
                  <div className={cn('stamp-redo', w.mastered && 'stamp-done')}>
                    {w.mastered ? '已重做' : '重做'}
                  </div>
                  {/* 红笔批改边 */}
                  {!w.mastered && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none"
                      aria-hidden
                      style={{
                        background: 'linear-gradient(180deg, #c0392b 0%, #d35400 50%, #c0392b 100%)',
                        borderRadius: '2px 0 0 2px',
                        opacity: 0.85,
                      }}
                    />
                  )}
                  {/* 批改印章 */}
                  {!w.mastered && (
                    <div
                      className="absolute top-2 right-2 pointer-events-none select-none"
                      style={{
                        transform: 'rotate(-5deg)',
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#c0392b',
                        border: '2px solid #c0392b',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        opacity: 0.75,
                        fontFamily: 'ui-serif, Songti SC, serif',
                      }}
                      aria-hidden
                    >
                      批
                    </div>
                  )}
                  <CardContent className="p-4 pl-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {getTopicLabel(w.topicKey)}
                        </Badge>
                        {!w.mastered && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              isReviewDue(w) && 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20',
                            )}
                          >
                            <Brain className="size-3 mr-1" />
                            {REVIEW_STAGE_LABELS[w.reviewStage] ?? '新错题'}
                          </Badge>
                        )}
                        {w.reviewCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            已复习 {w.reviewCount} 次
                          </Badge>
                        )}
                        {w.mastered && (
                          <Badge className="bg-emerald-500 text-white text-xs">已掌握</Badge>
                        )}
                        {!w.mastered && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            下次：{format(new Date(w.nextReviewDate), 'MM-dd')}
                          </span>
                        )}
                         <span className="text-xs text-muted-foreground flex items-center gap-1">
                           <Clock className="size-3" />
                           收录：{format(w.wrongTime, 'MM-dd HH:mm')}
                         </span>
                         {w.source === 'timeout' && (
                           <Badge variant="outline" className="text-xs border-rose-200 text-rose-600 dark:border-rose-800 dark:text-rose-400">
                             超时
                           </Badge>
                         )}
                         {w.source === 'self-eval' && (
                           <Badge variant="outline" className="text-xs border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400">
                             自评
                           </Badge>
                         )}
                          {w.isGuessed && (
                             <Badge variant="outline" className="text-xs border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400">
                               蒙的
                             </Badge>
                           )}
                          {w.guessedCorrect && (
                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-300 bg-orange-50/50 dark:bg-orange-950/20">
                              <AlertCircle className="size-3 mr-1" />
                              待验证
                            </Badge>
                          )}
                          {w.hintLevel && w.hintLevel > 0 && (
                            <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20">
                              <Lightbulb className="size-3 mr-1" />
                              提示依赖 L{w.hintLevel}
                            </Badge>
                          )}
                          {w.wrongReason && (
                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20">
                              <Brain className="size-3 mr-1" />
                              {WRONG_REASON_LABELS[w.wrongReason]}
                            </Badge>
                          )}
                         {typeof w.timeSpent === 'number' && w.timeSpent > 0 && (
                           <span className="text-xs text-muted-foreground flex items-center gap-1">
                             ⏱ {w.timeSpent}s
                           </span>
                         )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!w.mastered && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => {
                              markMastered(w.id);
                              toast.success('已标记为掌握');
                            }}
                          >
                            <CheckCircle2 className="size-3.5 mr-1" />
                            掌握
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            'h-7 px-2 text-xs',
                            confirmDeleteId === w.id
                              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                              : 'text-destructive hover:bg-destructive/10'
                          )}
                          onClick={() => {
                            if (confirmDeleteId === w.id) {
                              removeItem(w.id);
                              setConfirmDeleteId(null);
                              toast.success('已删除');
                            } else {
                              setConfirmDeleteId(w.id);
                            }
                          }}
                        >
                          {confirmDeleteId === w.id ? '确认删除？' : <Trash2 className="size-3.5" />}
                        </Button>
                      </div>
                    </div>

                    {/* 题目 */}
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : w.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 text-sm font-medium text-foreground">
                          <RichTextRenderer text={w.question.questionLatex} />
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-muted-foreground shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground shrink-0 mt-1" />
                        )}
                      </div>
                    </div>

                    {/* 答案对比 */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/50">
                            <div>
                              <div className="text-xs text-rose-500 mb-1 font-medium">我的答案</div>
                              <div className="text-sm font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-md">
                                {w.userAnswer || '(空)'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-emerald-600 mb-1 font-medium">正确答案</div>
                              <div className="text-sm font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-md">
                                <RichTextRenderer text={w.question.answerDisplay} />
                              </div>
                            </div>
                          </div>

                          {/* 步骤解析 */}
                           {w.question.steps && w.question.steps.length > 0 && (
                             <div className="mt-3 pt-3 border-t border-border/50">
                               <div className="flex items-center justify-between mb-2">
                                 <div className="text-xs text-muted-foreground font-medium">解析步骤</div>
                                 <TtsButton
                                   text={w.question.steps.join('。')}
                                   isLatex
                                   size="sm"
                                   variant="ghost"
                                 />
                               </div>
                              <div className="space-y-2">
                                {w.question.steps.map((step, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                      {i + 1}
                                    </div>
                                     <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
                                       <RichTextRenderer text={step} />
                                     </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 重做区 */}
                          {!w.mastered && (
                            <div className="mt-4 pt-3 border-t border-border/50">
                              {!isRetrying ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRetry(w.id, w.question)}
                                  className="w-full"
                                >
                                  <RotateCcw className="size-3.5 mr-1.5" />
                                  重做此题
                                </Button>
                              ) : (
                                <div className="space-y-4">
                                  {/* 重做题目面板 */}
                                  <div className="bg-[var(--board-bg)] rounded-xl p-4 text-center">
                                    <div className="text-xs text-emerald-400/70 font-medium tracking-wider mb-2">重做题目</div>
                                    <div className="text-emerald-100 text-base leading-relaxed">
                                      <MathRenderer expression={w.question.questionLatex} displayMode />
                                    </div>
                                  </div>

                                  {answerMode === 'auto' ? (
                                    <>
                                      <MathInputField
                                        value={retryMode.answer}
                                        onChange={(val) => setRetryMode({ id: w.id, answer: val })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleRetry(w.id, w.question);
                                        }}
                                        label="你的答案"
                                        placeholder={PRACTICE_TOPICS.find((t) => t.key === w.topicKey)?.answerPlaceholder ?? '输入答案'}
                                        disabled={retryResult !== null}
                                        showPalette
                                      />
                                      <div className="flex gap-2">
                                        {retryResult === null ? (
                                          <>
                                            <Button
                                              onClick={() => handleRetry(w.id, w.question)}
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-5 flex-1"
                                            >
                                              <Check className="size-4 mr-2" />
                                              检查答案
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={closeRetry}>
                                              <X className="size-4" />
                                            </Button>
                                          </>
                                        ) : (
                                          <Button onClick={closeRetry} variant="outline" className="flex-1 h-10">
                                            完成重做
                                          </Button>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="text-xs font-medium text-muted-foreground">
                                        自评模式：先在草稿纸完成 → 看答案 → 自评
                                      </div>
                                      {!showAnswerMap[w.id] && retryResult === null && (
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            onClick={() =>
                                              setShowAnswerMap((prev) => ({ ...prev, [w.id]: !prev[w.id] }))
                                            }
                                            className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                                          >
                                            <Eye className="size-4 mr-2" />
                                            看答案 & 解析
                                          </Button>
                                          <Button variant="ghost" onClick={closeRetry}>
                                            <X className="size-4" />
                                          </Button>
                                        </div>
                                      )}
                                      {(showAnswerMap[w.id] || retryResult) && retryResult === null && (
                                        <div className="space-y-3">
                                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800/40">
                                            <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">参考答案</div>
                                            <div className="text-emerald-900 dark:text-emerald-100 font-mono">
                                              <RichTextRenderer text={w.question.answerDisplay} />
                                            </div>
                                          </div>
                                          <div className="text-sm text-muted-foreground text-center">对照答案，你做对了吗？</div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <Button
                                              onClick={() => handleSelfEvalRetry(w.id, w.question, 'correct')}
                                              className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                              <Check className="size-4 mr-1.5" />
                                              做对了
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              onClick={() => handleSelfEvalRetry(w.id, w.question, 'wrong')}
                                              className="h-10 bg-rose-600 hover:bg-rose-700"
                                            >
                                              <X className="size-4 mr-1.5" />
                                              做错了
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                      {retryResult && (
                                        <Button onClick={closeRetry} variant="outline" className="w-full h-10">
                                          完成重做
                                        </Button>
                                      )}
                                    </div>
                                  )}

                                  {/* 重做结果反馈 */}
                                  <AnimatePresence>
                                    {retryResult && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                      >
                                        <div
                                          className={cn(
                                            'rounded-xl p-3 mb-3 flex items-center gap-2',
                                            retryResult.correct
                                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40'
                                              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40',
                                          )}
                                        >
                                          <div
                                            className={cn(
                                              'size-7 rounded-full flex items-center justify-center shrink-0',
                                              retryResult.correct
                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
                                            )}
                                          >
                                            {retryResult.correct ? <Check className="size-4" /> : <X className="size-4" />}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium">{retryResult.message}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {retryResult.correct
                                                ? `第 ${(w.retryCount ?? 0) + 1} 次重做成功 · 复习阶段 +1`
                                                : `已重新加入错题本 · 复习阶段已重置`}
                                            </div>
                                          </div>
                                        </div>

                                        {/* 解析步骤 */}
                                        {w.question.steps && w.question.steps.length > 0 && (
                                          <div className="bg-muted/30 rounded-xl p-3">
                                            <div className="text-xs text-muted-foreground mb-2 font-medium">解析步骤</div>
                                            <div className="space-y-1.5">
                                              {w.question.steps.map((step, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                  <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                    {i + 1}
                                                  </div>
                                                  <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
                                                    <RichTextRenderer text={step} />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          )}

                             {/* 变式训练入口 */}
                             {isExpanded && (
                               <div className="mt-4 pt-3 border-t border-border/50">
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   onClick={() => {
                                     setVariantQuestion(w.question);
                                     setVariantOpen(true);
                                   }}
                                   className="w-full justify-center"
                                 >
                                   <GitBranch className="size-3.5 mr-1.5" />
                                   出变式训练 · 练透这类题
                                 </Button>
                               </div>
                             )}

                             {/* 艾宾浩斯复习自评区 */}
                            {!w.mastered && isExpanded && (
                             <div className="mt-4 pt-3 border-t border-border/50">
                               <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                 <Brain className="size-3.5 text-primary" />
                                 艾宾浩斯间隔复习 · {REVIEW_STAGE_LABELS[w.reviewStage] ?? '新错题'}
                                 <span className="ml-auto text-muted-foreground/70">
                                   {w.reviewCount > 0 ? `已复习 ${w.reviewCount} 次` : '首次复习'}
                                 </span>
                               </div>
                               {reviewResultMap[w.id] ? (
                                 <div className={cn(
                                   'text-sm px-3 py-2 rounded-md flex items-center justify-between',
                                   reviewResultMap[w.id] === 'remembered'
                                     ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                     : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
                                 )}>
                                   <span>
                                     {reviewResultMap[w.id] === 'remembered'
                                       ? `✓ 已推进到下一阶段：${REVIEW_STAGE_LABELS[Math.min(w.reviewStage + 1, 6)]}`
                                       : '✗ 已重置回第 1 阶段（1 天后再复习）'}
                                   </span>
                                   <button
                                     onClick={() => setReviewResultMap((prev) => ({ ...prev, [w.id]: null }))}
                                     className="underline underline-offset-2 text-xs opacity-70 hover:opacity-100"
                                   >
                                     撤回
                                   </button>
                                 </div>
                               ) : (
                                 <div className="flex gap-2">
                                   <Button
                                     size="sm"
                                     onClick={() => {
                                       markReviewRemembered(w.id);
                                       setReviewResultMap((prev) => ({ ...prev, [w.id]: 'remembered' }));
                                       toast.success('记住了！已推进到下一阶段');
                                     }}
                                     className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                   >
                                     <Check className="size-3.5 mr-1" />
                                     记住了
                                   </Button>
                                   <Button
                                     size="sm"
                                     variant="destructive"
                                     onClick={() => {
                                       markReviewForgotten(w.id);
                                       setReviewResultMap((prev) => ({ ...prev, [w.id]: 'forgotten' }));
                                       toast.info('已重置，1 天后再复习');
                                     }}
                                     className="flex-1 bg-rose-600 hover:bg-rose-700"
                                   >
                                     <X className="size-3.5 mr-1" />
                                     没记住
                                   </Button>
                                 </div>
                               )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 打印对话框 */}
      <WrongBookPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        items={[...pending, ...mastered]}
        pendingItems={pending}
      />

      {/* 变式训练面板 */}
      <VariantPanel
        open={variantOpen}
        onOpenChange={setVariantOpen}
        question={variantQuestion}
      />

      {/* 重做队列 */}
      <ReviewQueue
        items={dueToday}
        open={reviewQueueOpen}
        onOpenChange={setReviewQueueOpen}
        onCorrect={markReviewRemembered}
        onWrong={(id, ans) => {
          markReviewForgotten(id);
          const item = items.find((w) => w.id === id);
          if (item) addWrong(item.question, ans, 'auto', {});
        }}
      />

      {/* 蒙对重考队列 */}
      <ReviewQueue
        items={guessedDueToday}
        open={guessReviewOpen}
        onOpenChange={setGuessReviewOpen}
        guessMode
        onCorrect={() => {}}
        onWrong={(id) => {
          markGuessWrong(id);
        }}
        onGuessVerified={(id) => {
           markGuessVerified(id);
           const item = items.find((w) => w.id === id);
           if (item) markMasteryGuessVerified(item.question);
         }}
        onGuessAgain={(id, ans) => {
          markGuessAgain(id, ans);
        }}
      />
    </div>
  );
}
