import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Sigma,
  Lightbulb,
  Shapes,
  RotateCcw,
  Download,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/PageHeader';
import {
  MATHEMATICIAN_QUIZ,
  MATHEMATICIAN_TYPES,
  computeQuizResult,
  type typeQuizResult,
} from '@/data/mathematician-quiz';
import { useWrongBook } from '@/hooks/use-learning';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { isThisMonth } from 'date-fns';
import {
  loadHistory,
  saveRecord,
  canRetake,
  daysUntilRetake,
  type QuizRecord,
} from './quiz-history';

const TYPE_ICON_MAP: Record<string, typeof Sigma> = {
  gauss: Sigma,
  euler: Lightbulb,
  ramanujan: Sparkles,
  archimedes: Shapes,
};

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; ring: string; gradient: string }> = {
  gauss: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-400/40',
    ring: 'ring-emerald-400/30',
    gradient: 'bg-emerald-50/60 dark:bg-emerald-950/20',
  },
  euler: {
    bg: 'bg-sky-500/15',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-400/40',
    ring: 'ring-sky-400/30',
    gradient: 'bg-sky-50/60 dark:bg-sky-950/20',
  },
  ramanujan: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-400/40',
    ring: 'ring-rose-400/30',
    gradient: 'bg-rose-50/60 dark:bg-rose-950/20',
  },
  archimedes: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-400/40',
    ring: 'ring-amber-400/30',
    gradient: 'bg-amber-50/60 dark:bg-amber-950/20',
  },
};

export default function MathematicianQuizPage() {
  const navigate = useNavigate();
  const { wrongReasonStats } = useWrongBook();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<typeQuizResult | null>(null);
  const [history] = useState<QuizRecord[]>(() => loadHistory());
  const cardRef = useRef<HTMLDivElement>(null);

  const totalQuestions = MATHEMATICIAN_QUIZ.length;
  const progress = (Object.keys(answers).length / totalQuestions) * 100;
  const currentQuestion = MATHEMATICIAN_QUIZ[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (optionKey: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionKey }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    const r = computeQuizResult(answers);
    setResult(r);
    setShowResult(true);
    saveRecord({ date: Date.now(), result: r });
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    setResult(null);
  };

  const handleCopyShare = () => {
    if (!result) return;
    const primary = MATHEMATICIAN_TYPES[result.primary];
    const secondary = result.secondary ? MATHEMATICIAN_TYPES[result.secondary] : null;
    const typeName = secondary ? `${primary.name} × ${secondary.name}` : primary.name;
    const text = `我在 MathForge 测出了我的数学家人格：${typeName}！${primary.tagline}，快来测测你是哪种数学家～`;
    navigator.clipboard?.writeText(text).then(() => {
      toast.success('分享文案已复制');
    });
  };

  const handleDownloadCard = () => {
    toast.info('保存图片功能开发中，先复制分享文案吧～');
  };

  // 错因关联的学习建议
  const learningAdvice = useMemo(() => {
    if (!result) return null;
    const stats = wrongReasonStats;
    const tips: string[] = [];

    if (result.primary === 'gauss') {
      if (stats.totalWithReason > 0 && stats.counts['calc-mistake'] / stats.totalWithReason > 0.3) {
        tips.push('你是高斯型但计算失误偏多，建议每步写完回头扫一眼，培养"自检肌肉记忆"。');
      } else {
        tips.push('你的计算能力扎实，是高斯型的优势。可以挑战更复杂的综合题。');
      }
    } else if (result.primary === 'euler') {
      if (stats.totalWithReason > 0 && stats.counts['concept'] / stats.totalWithReason > 0.25) {
        tips.push('你是欧拉型但概念类错误偏多，建议每条定理先默写条件和结论再用。');
      } else {
        tips.push('你的直觉敏锐，建议多挑战需要"先猜后证"的证明题。');
      }
    } else if (result.primary === 'ramanujan') {
      if (stats.totalWithReason > 0 && stats.counts['method'] / stats.totalWithReason > 0.3) {
        tips.push('你是拉马努金型但方法类错误偏多，建议多积累题型，建立"方法索引"。');
      } else {
        tips.push('你善于从例子中发现规律，可以试试自己猜想命题并验证。');
      }
    } else if (result.primary === 'archimedes') {
      if (stats.totalWithReason > 0 && stats.counts['calc-mistake'] / stats.totalWithReason > 0.3) {
        tips.push('你是阿基米德型但计算细节容易丢分，建议画图后再用代数验证。');
      } else {
        tips.push('你的几何直觉出色，可以挑战需要数形结合的难题。');
      }
    }

    if (result.isMixed && result.secondary) {
      tips.push(`同时具备${MATHEMATICIAN_TYPES[result.secondary].name}的特征，说明你的思维方式比较均衡。`);
    }

    return tips;
  }, [result, wrongReasonStats]);

  // 历史类型变化
  const lastMonthType = history.find(
    (r) => !isThisMonth(new Date(r.date)),
  )?.result.primary;

  if (showResult && result) {
    const primaryType = MATHEMATICIAN_TYPES[result.primary];
    const secondaryType = result.secondary ? MATHEMATICIAN_TYPES[result.secondary] : null;
    const color = TYPE_COLORS[result.primary];
    const Icon = TYPE_ICON_MAP[result.primary];

    return (
      <div className="min-h-screen">
        <div className="px-4 md:px-6 lg:px-8 py-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            返回
          </button>
        </div>
        <PageHeader
          title="测试结果"
          description="你的数学家人格"
          onCheatsheet={() => {}}
        />

        <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-3xl mx-auto space-y-6">
          {/* 结果卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              ref={cardRef}
              className={cn(
                'overflow-hidden border-2',
                color.gradient,
                color.border,
              )}
            >
              <CardContent className="pt-8 pb-6 px-6 md:px-8 text-center">
                <div
                  className={cn(
                    'size-20 mx-auto rounded-full flex items-center justify-center mb-4',
                    color.bg,
                    color.text,
                  )}
                >
                  <Icon className="size-10" strokeWidth={1.5} />
                </div>

                <Badge variant="outline" className={cn('mb-3', color.text, color.border)}>
                  {result.isMixed ? '混合型' : '纯粹型'}
                </Badge>

                <h2 className="text-3xl md:text-4xl font-black text-foreground mb-1">
                  {primaryType.name}
                  {secondaryType && (
                    <span className="text-muted-foreground text-2xl mx-1">×</span>
                  )}
                  {secondaryType && <span className="text-2xl">{secondaryType.name}</span>}
                </h2>

                <p className={cn('text-lg font-medium mt-2', color.text)}>
                  「{primaryType.nickname}」{primaryType.tagline}
                </p>

                {/* 得分分布 */}
                <div className="mt-6 grid grid-cols-4 gap-2 text-center">
                  {Object.entries(result.scores).map(([key, score]) => {
                    const t = MATHEMATICIAN_TYPES[key];
                    const c = TYPE_COLORS[key];
                    const I = TYPE_ICON_MAP[key];
                    const isPrimary = key === result.primary;
                    return (
                      <div key={key} className="space-y-1">
                        <div
                          className={cn(
                            'size-10 mx-auto rounded-xl flex items-center justify-center',
                            isPrimary ? c.bg : 'bg-muted/50',
                            isPrimary ? c.text : 'text-muted-foreground',
                          )}
                        >
                          <I className="size-4" />
                        </div>
                        <div className="text-xs text-muted-foreground">{t.name.replace('型', '')}</div>
                        <div className={cn('text-lg font-bold tabular-nums', isPrimary ? c.text : 'text-muted-foreground')}>
                          {score}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 小传 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  关于 {primaryType.name.replace('型', '')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">生卒年</div>
                  <div className="text-sm font-medium text-foreground">
                    {primaryType.birth} — {primaryType.death}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-sm text-muted-foreground shrink-0">领域</div>
                  <div className="text-sm font-medium text-foreground">{primaryType.field}</div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-sm text-muted-foreground shrink-0">代表贡献</div>
                  <ul className="text-sm text-foreground space-y-1">
                    {primaryType.contributions.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed bg-muted/40 rounded-xl p-4">
                  {primaryType.bio}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 推荐章节 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">推荐主攻方向</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {primaryType.recommendedTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(topic.path)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-accent/30 transition-all group"
                  >
                    <span className="text-sm font-medium text-foreground">{topic.label}</span>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* 学习建议 */}
          {learningAdvice && learningAdvice.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-amber-50/60 dark:bg-amber-950/15 border-amber-200/60 dark:border-amber-700/40">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Lightbulb className="size-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      专属学习建议
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {learningAdvice.map((tip, i) => (
                      <li
                        key={i}
                        className="text-sm text-amber-700 dark:text-amber-400/90 leading-relaxed flex gap-2"
                      >
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 历史变化 */}
          {lastMonthType && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">类型变化</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-6 py-2">
                    <div className="text-center">
                      <div
                        className={cn(
                          'size-14 mx-auto rounded-xl flex items-center justify-center mb-2',
                          TYPE_COLORS[lastMonthType].bg,
                          TYPE_COLORS[lastMonthType].text,
                        )}
                      >
                        {(() => {
                          const I = TYPE_ICON_MAP[lastMonthType];
                          return <I className="size-6" />;
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground">上次</div>
                      <div className="text-sm font-semibold text-foreground">
                        {MATHEMATICIAN_TYPES[lastMonthType].name}
                      </div>
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground" />
                    <div className="text-center">
                      <div
                        className={cn(
                          'size-14 mx-auto rounded-xl flex items-center justify-center mb-2 ring-2',
                          color.bg,
                          color.text,
                          color.ring,
                        )}
                      >
                        <Icon className="size-6" />
                      </div>
                      <div className="text-xs text-muted-foreground">这次</div>
                      <div className="text-sm font-semibold text-foreground">{primaryType.name}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3 pb-8">
            <Button onClick={handleCopyShare} variant="secondary" className="flex-1 min-w-[140px]">
              <Copy className="size-4 mr-1.5" />
              复制分享
            </Button>
            <Button onClick={handleDownloadCard} variant="secondary" className="flex-1 min-w-[140px]">
              <Download className="size-4 mr-1.5" />
              保存卡片
            </Button>
            {canRetake() && (
              <Button onClick={handleReset} variant="outline" className="flex-1 min-w-[140px]">
                <RotateCcw className="size-4 mr-1.5" />
                重新测试
              </Button>
            )}
            {!canRetake() && (
              <Button variant="outline" disabled className="flex-1 min-w-[140px]">
                距下次重测还有 {daysUntilRetake()} 天
              </Button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-6 lg:px-8 py-4 max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回
        </button>
      </div>
      <PageHeader
        title="你是哪种数学家？"
        description="10 道小测试，发现你的数学人格"
        onCheatsheet={() => {}}
      />

      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-2xl mx-auto">
        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              第 {currentIndex + 1} / {totalQuestions} 题
            </span>
            <span className="text-muted-foreground">
              已答 {answeredCount} 题
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* 题目卡 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-8 pb-6 px-6 md:px-8">
                <div className="flex items-start gap-3 mb-8">
                  <Badge variant="outline" className="shrink-0 text-primary border-primary/30">
                    Q{currentIndex + 1}
                  </Badge>
                  <h2 className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt) => {
                    const selected = answers[currentQuestion.id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelect(opt.key)}
                        className={cn(
                          'w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3',
                          selected
                            ? 'border-primary bg-primary/8 ring-2 ring-primary/20'
                            : 'border-border/50 hover:border-primary/40 hover:bg-accent/20',
                        )}
                      >
                        <span
                          className={cn(
                            'size-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                            selected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {opt.key}
                        </span>
                        <span
                          className={cn(
                            'text-sm md:text-base pt-0.5',
                            selected ? 'text-foreground font-medium' : 'text-foreground/80',
                          )}
                        >
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* 导航按钮 */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            <ArrowLeft className="size-4 mr-1.5" />
            上一题
          </Button>
          {currentIndex < totalQuestions - 1 ? (
            <Button onClick={handleNext} disabled={!answers[currentQuestion.id]} className="flex-1">
              下一题
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < totalQuestions}
              className="flex-1"
            >
              <Sparkles className="size-4 mr-1.5" />
              查看结果
            </Button>
          )}
        </div>

        {/* 题目快捷跳转 */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {MATHEMATICIAN_QUIZ.map((q, i) => {
            const answered = answers[q.id];
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'size-8 rounded-lg text-xs font-medium transition-all',
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : answered
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-muted/50 text-muted-foreground border border-border/50',
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
