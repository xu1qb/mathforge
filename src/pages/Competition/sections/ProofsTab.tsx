// 证明题专项训练 Tab
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  BookOpen,
  Award,
  Zap,
  HelpCircle,
  ArrowLeft,
  Shuffle,
  Target,
} from 'lucide-react';
import RichTextRenderer from '@/components/RichTextRenderer';
import { PROOF_CATEGORIES, generateProofProblem, type ProofProblem, type ProofCategory } from '@/data/competition-proofs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ViewMode = 'category-list' | 'method-study' | 'practice';

export default function ProofsTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('category-list');
  const [activeCategory, setActiveCategory] = useState<ProofCategory | null>(null);
  const [currentProblem, setCurrentProblem] = useState<ProofProblem | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [revealedStep, setRevealedStep] = useState(0);
  const [selfEval, setSelfEval] = useState<'correct' | 'partial' | 'wrong' | null>(null);

  const handleSelectCategory = useCallback((cat: ProofCategory) => {
    setActiveCategory(cat);
    setViewMode('method-study');
    setShowSteps(false);
    setRevealedStep(0);
    setSelfEval(null);
  }, []);

  const handleBack = useCallback(() => {
    if (viewMode === 'practice') {
      setViewMode('method-study');
      setCurrentProblem(null);
    } else if (viewMode === 'method-study') {
      setViewMode('category-list');
      setActiveCategory(null);
    }
    setShowSteps(false);
    setRevealedStep(0);
    setSelfEval(null);
  }, [viewMode]);

  const handleStartRandom = useCallback((cat: ProofCategory) => {
    const problem = generateProofProblem(cat.key, 2);
    setCurrentProblem(problem);
    setViewMode('practice');
    setShowSteps(false);
    setRevealedStep(0);
    setSelfEval(null);
  }, []);

  const handleNextProblem = useCallback(() => {
    if (!activeCategory) return;
    const problem = generateProofProblem(activeCategory.key, 2);
    setCurrentProblem(problem);
    setShowSteps(false);
    setRevealedStep(0);
    setSelfEval(null);
    toast.success('已生成新的证明题');
  }, [activeCategory]);

  const handleClassicClick = useCallback((problem: ProofProblem) => {
    setCurrentProblem(problem);
    setViewMode('practice');
    setShowSteps(false);
    setRevealedStep(0);
    setSelfEval(null);
  }, []);

  const handleRevealNextStep = useCallback(() => {
    if (!currentProblem) return;
    if (revealedStep < currentProblem.steps.length) {
      setRevealedStep((prev) => prev + 1);
    }
  }, [currentProblem, revealedStep]);

  const handleRevealAll = useCallback(() => {
    if (!currentProblem) return;
    setRevealedStep(currentProblem.steps.length);
  }, [currentProblem]);

  const handleSelfEval = useCallback((val: 'correct' | 'partial' | 'wrong') => {
    setSelfEval(val);
    const labels = { correct: '完全正确', partial: '部分正确', wrong: '答错了' };
    toast.success(`已记录：${labels[val]}`);
  }, []);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {viewMode === 'category-list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className="size-5 text-primary" />
                  证明题专项训练
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  5 类证明方法 · 参数化随机出题 · 步骤展开式学习
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                大题拉分项 · 70 分
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROOF_CATEGORIES.map((cat) => (
                <Card
                  key={cat.key}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleSelectCategory(cat)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                          {cat.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          难度：{cat.difficulty}
                        </CardDescription>
                      </div>
                      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        {cat.key === 'mvt' && <ChevronRight className="size-5" />}
                        {cat.key === 'inequality' && <Target className="size-5" />}
                        {cat.key === 'series' && <Zap className="size-5" />}
                        {cat.key === 'integral' && <BookOpen className="size-5" />}
                        {cat.key === 'multivar' && <Shuffle className="size-5" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p className="line-clamp-2">{cat.coreIdea}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {cat.templates.length} 类模板 · {cat.classics.length} 道经典题
                      </span>
                      <span className="text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                        开始学习 <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {viewMode === 'method-study' && activeCategory && (
          <motion.div
            key="method"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="size-4 mr-1" />返回
              </Button>
              <h2 className="text-xl font-bold">{activeCategory.name}</h2>
              <Badge variant="outline">{activeCategory.difficulty}</Badge>
            </div>

            {/* 方法总纲 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="size-4 text-primary" /> 核心思想
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {activeCategory.coreIdea}
              </CardContent>
            </Card>

            {/* 辅助函数构造表 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="size-4 text-primary" /> 常用辅助函数构造
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeCategory.auxiliaryFunctions.map((af, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-1.5"
                  >
                    <div className="text-sm font-medium text-foreground">
                      模式：<span className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{af.pattern}</span>
                    </div>
                    <div className="text-sm">
                      构造：<span className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{af.construct}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{af.note}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 技巧列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="size-4 text-primary" /> 常见技巧
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {activeCategory.techniques.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 随机生成器入口 */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <Shuffle className="size-4 text-primary" />
                    随机证明题生成器
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {activeCategory.templates.length} 类模板 · 参数化变体 · 每次生成不同题目
                  </div>
                </div>
                <Button onClick={() => handleStartRandom(activeCategory)}>
                  <Zap className="size-4 mr-1.5" /> 开始练习
                </Button>
              </CardContent>
            </Card>

            {/* 经典题 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" /> 经典证明题
                </CardTitle>
                <CardDescription>竞赛高频题型，固定题面，详解步骤</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeCategory.classics.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                    onClick={() => handleClassicClick(p)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-primary font-medium mb-1">
                          {p.method}
                        </div>
                        <div className="text-sm font-medium line-clamp-2"><RichTextRenderer text={p.problem.split('\n')[0]} /></div>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {p.score} 分
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {viewMode === 'practice' && currentProblem && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="size-4 mr-1" />返回
              </Button>
              <Badge variant="secondary">{activeCategory?.name}</Badge>
              <Badge variant="outline">{currentProblem.method}</Badge>
              <div className="text-xs text-muted-foreground ml-auto">
                {currentProblem.sourceLabel}
              </div>
            </div>

            {/* 题干 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="size-4 text-primary" /> 题目
                  <Badge variant="outline" className="ml-auto text-xs">
                    {currentProblem.score} 分
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base leading-relaxed bg-muted/30 p-4 rounded-lg whitespace-pre-line">
                  <RichTextRenderer text={currentProblem.problem} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="size-4 text-warning" />
                  <span>核心思路：{currentProblem.keyIdea}</span>
                </div>
              </CardContent>
            </Card>

            {/* 证明步骤 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" /> 证明步骤
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSteps(!showSteps)}
                    >
                      {showSteps ? <EyeOff className="size-4 mr-1" /> : <Eye className="size-4 mr-1" />}
                      {showSteps ? '隐藏' : '展开全部'}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  已展开 {showSteps ? currentProblem.steps.length : revealedStep} / {currentProblem.steps.length} 步
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {showSteps
                  ? currentProblem.steps.map((step, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg bg-primary/5"
                      >
                        {step.title && (
                          <div className="font-semibold text-sm text-primary mb-2">
                            第 {i + 1} 步：{step.title}
                          </div>
                        )}
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          <RichTextRenderer text={step.content} />
                        </div>
                      </div>
                    ))
                  : currentProblem.steps.slice(0, revealedStep).map((step, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg bg-primary/5"
                      >
                        {step.title && (
                          <div className="font-semibold text-sm text-primary mb-2">
                            第 {i + 1} 步：{step.title}
                          </div>
                        )}
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          <RichTextRenderer text={step.content} />
                        </div>
                      </div>
                    ))}

                {!showSteps && revealedStep < currentProblem.steps.length && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRevealNextStep}>
                      <Eye className="size-4 mr-1.5" />
                      显示下一步
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRevealAll}>
                      直接显示全部
                    </Button>
                  </div>
                )}

                {currentProblem.conclusion && (showSteps || revealedStep === currentProblem.steps.length) && (
                  <div className="mt-4 p-4 rounded-lg bg-accent/50 border border-accent">
                    <div className="font-semibold text-sm text-accent-foreground mb-1">
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Lightbulb className="size-4" />
                        总结
                      </span>
                    </div>
                    <div className="text-sm">{currentProblem.conclusion}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 自评 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">自评结果</CardTitle>
                <CardDescription>证明题无标准答案输入，看完步骤后自评掌握程度</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant={selfEval === 'correct' ? 'default' : 'outline'}
                    className={cn('flex-1', selfEval === 'correct' && 'bg-success hover:bg-success/90')}
                    onClick={() => handleSelfEval('correct')}
                  >
                    <CheckCircle2 className="size-4 mr-1.5" /> 完全掌握
                  </Button>
                  <Button
                    variant={selfEval === 'partial' ? 'default' : 'outline'}
                    className={cn('flex-1', selfEval === 'partial' && 'bg-warning hover:bg-warning/90')}
                    onClick={() => handleSelfEval('partial')}
                  >
                    <HelpCircle className="size-4 mr-1.5" /> 部分掌握
                  </Button>
                  <Button
                    variant={selfEval === 'wrong' ? 'default' : 'outline'}
                    className={cn('flex-1', selfEval === 'wrong' && 'bg-destructive hover:bg-destructive/90')}
                    onClick={() => handleSelfEval('wrong')}
                  >
                    <XCircle className="size-4 mr-1.5" /> 还需练习
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 操作 */}
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleNextProblem}>
                <RefreshCw className="size-4 mr-1.5" /> 换一题
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
