// EXPORTS: TopicDetailPage
// 竞赛专题详情页（含知识点细项、题型例题、易错点、变式练习）

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ListChecks,
  ExternalLink,
  BookOpen,
  Lightbulb,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Shuffle,
  Check,
  X,
  Zap,
  Flame,
  Star,
  Minus,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTopicIcon } from '../helpers/topic-icons';
import { getTopicDetail } from '@/data/competition-topic-detail';
import { getFlowChart } from '@/data/flows';
import { TOPIC_EXPLAINER_MAP, TOPIC_FLOW_MAP } from '@/data/study-links';
import MathRenderer from '@/components/MathRenderer';
import RichTextRenderer from '@/components/RichTextRenderer';
import HintPanel from '@/components/HintPanel';
import type { CompetitionTopic } from '@/data/competition';
import { generateProblem, type GeneratedProblem } from '@/data/problem-generators';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface TopicDetailPageProps {
  topic: CompetitionTopic;
  isMastered: boolean;
  onBack: () => void;
  onToggleMaster: () => void;
  masteredKnowledgeIds?: string[];
  onToggleKnowledge?: (pointId: string) => void;
}

export default function TopicDetailPage({
  topic,
  isMastered,
  onBack,
  onToggleMaster,
  masteredKnowledgeIds = [],
  onToggleKnowledge,
}: TopicDetailPageProps) {
  const navigate = useNavigate();
  const Icon = getTopicIcon(topic.icon);
  const detail = getTopicDetail(topic.key);
  const flowChart = TOPIC_FLOW_MAP[topic.key]
    ? getFlowChart(TOPIC_FLOW_MAP[topic.key])
    : undefined;
  const explainerId = TOPIC_EXPLAINER_MAP[topic.key];

  const handleToggleMaster = () => {
    onToggleMaster();
    toast.success(
      isMastered
        ? `已取消"${topic.title}"的掌握标记`
        : `恭喜！已标记"${topic.title}"为已掌握`,
    );
  };

  const masteredCount = detail
    ? detail.knowledgePoints.filter((k) => masteredKnowledgeIds.includes(k.id)).length
    : 0;
  const totalCount = detail?.knowledgePoints.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* 返回按钮 + 标题 */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4 mr-1" />
          返回专题列表
        </Button>
        {(flowChart || explainerId) && (
          <div className="ml-auto flex items-center gap-2">
            {explainerId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/explainer?topic=' + explainerId)}
              >
                <BookOpen className="size-4 mr-1" />
                看原理讲解
              </Button>
            )}
            {flowChart && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/flow?chart=' + flowChart.id)}
              >
                <Workflow className="size-4 mr-1" />
                看解题流程
              </Button>
            )}
          </div>
        )}
        <Badge variant="outline" className={flowChart || explainerId ? '' : 'ml-auto'}>
          专题 {topic.index} / 8
        </Badge>
      </div>

      {/* 专题头部 */}
      <Card className="border-border/60 overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${gradientFor(topic.color)}`} />
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
              {Icon && <Icon className="size-7 text-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">{topic.title}</h2>
                {topic.frequency === 'high' && (
                  <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 text-xs">
                    <Flame className="size-3 mr-1" />高频必考
                  </Badge>
                )}
                {topic.frequency === 'medium' && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                    <Star className="size-3 mr-1" />常考
                  </Badge>
                )}
                {topic.frequency === 'low' && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    <Minus className="size-3 mr-1" />低频
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{topic.subtitle}</p>
            </div>
            <Button
              variant={isMastered ? 'default' : 'outline'}
              size="sm"
              className={isMastered ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={handleToggleMaster}
            >
              {isMastered ? (
                <>
                  <CheckCircle2 className="size-4 mr-1.5" />
                  已掌握
                </>
              ) : (
                <>
                  <Circle className="size-4 mr-1.5" />
                  标记掌握
                </>
              )}
            </Button>
          </div>
          {detail && (
            <div className="flex items-center gap-3 pt-2 border-t border-border/40">
              <span className="text-sm text-muted-foreground shrink-0">知识点进度</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: totalCount > 0 ? `${(masteredCount / totalCount) * 100}%` : '0%',
                  }}
                />
              </div>
              <span className="text-sm font-medium text-foreground shrink-0 tabular-nums">
                {masteredCount}/{totalCount}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {detail ? (
        <>
          {/* 知识点清单（细项可勾选） */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="size-5 text-emerald-600" />
                考点清单
                <Badge variant="outline" className="ml-auto">
                  {detail.knowledgePoints.length} 个核心考点
                </Badge>
              </CardTitle>
              <CardDescription>对照考纲，逐一攻克。点击圆圈标记掌握</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {detail.knowledgePoints.map((point, i) => {
                const mastered = masteredKnowledgeIds.includes(point.id);
                return (
                  <div
                    key={point.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors group cursor-pointer ${
                      mastered ? 'bg-emerald-50/60 dark:bg-emerald-900/10' : 'hover:bg-muted/40'
                    }`}
                    onClick={() => onToggleKnowledge?.(point.id)}
                  >
                    <div
                      className={`size-5 shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                        mastered
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}
                    >
                      {mastered ? <Check className="size-3" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium leading-relaxed ${
                          mastered ? 'text-emerald-700 dark:text-emerald-400 line-through/50' : 'text-foreground'
                        }`}
                      >
                        {point.name}
                      </div>
                      {point.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">{point.description}</div>
                      )}
                      {point.formulas && point.formulas.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {point.formulas.map((f, idx) => (
                            <code
                              key={idx}
                              className="text-xs px-2 py-1 rounded-md bg-muted/80 text-foreground/80 font-mono"
                            >
                              <MathRenderer expression={f} />
                            </code>
                          ))}
                        </div>
                      )}
                    </div>
                    {mastered ? (
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-1" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground/40 group-hover:text-emerald-500 shrink-0 mt-1" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 常考题型 + 例题 */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="size-5 text-amber-500" />
                常考题型与竞赛技巧
                <Badge variant="outline" className="ml-auto">
                  {detail.questionTypes.length} 类题型
                </Badge>
              </CardTitle>
              <CardDescription>
                每类题型含解题方法 + 经典例题，点击展开查看详细解析
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {detail.questionTypes.map((qt, idx) => (
                <QuestionTypeCard key={qt.id} qIndex={idx} questionType={qt} />
              ))}
            </CardContent>
          </Card>

          {/* 易错点警示 */}
          {/* 易错点警示 */}
          <div className="journal-trap-sticky">
            <div className="flex items-center gap-2 font-bold mb-2 text-red-800/80">
              <AlertTriangle className="size-4" />
              <span>易错点警示</span>
            </div>
            <div className="space-y-1.5 text-sm text-red-900/80 leading-relaxed">
              {detail.pitfalls.map((pitfall, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="shrink-0 font-bold text-red-700/70">·</span>
                  <span>{pitfall}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // 占位（专题尚未深化）
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/60 border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="size-5 text-amber-500" />
                常考题型与竞赛技巧
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              本模块正在建设中。后续会补充每个考点的典型题型、解题套路和易错点。
              <div className="mt-3 p-3 rounded-lg bg-amber-50/60 dark:bg-amber-900/15 border border-amber-200/40 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
                可先前往「竞赛技巧库」查看通用解题技巧。
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="size-5 text-sky-500" />
                经典例题
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              竞赛级例题与详细解析将在后续版本中补充。
              <div className="mt-3 p-3 rounded-lg bg-sky-50/60 dark:bg-sky-900/15 border border-sky-200/40 dark:border-sky-800/40 text-sky-800 dark:text-sky-300 text-xs">
                当前可使用「模拟试卷」功能练习竞赛风格题目。
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 变式练习（仅限有详细内容的专题） */}
      {detail && <PracticeCard topic={topic} />}

      {/* 关联模块跳转 */}
      {topic.relatedModules.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="size-5 text-emerald-600" />
              关联计算模块
            </CardTitle>
            <CardDescription>跳转到对应工具进行计算验证</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topic.relatedModules.map((m) => (
              <Button
                key={m.path}
                variant="outline"
                size="sm"
                onClick={() => navigate(m.path)}
                className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-800/40 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                {m.label}
                <ExternalLink className="size-3 ml-1.5 opacity-60" />
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 专项练习入口 */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="size-5 text-emerald-600" />
            专项练习
          </CardTitle>
          <CardDescription>跳转到练习训练模块，针对本专题刷题</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => navigate(`/practice?topic=${topic.relatedPracticeTopics[0] || ''}`)}
            className="w-full justify-center"
          >
            前往练习训练 · {topic.title} 专项
            <ExternalLink className="size-4 ml-2" />
          </Button>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            系统会自动匹配难度较高的竞赛风格题目
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============ 题型 + 例题展开卡片 ============

import type { TopicQuestionType } from '@/data/competition-topic-detail';

interface QuestionTypeCardProps {
  qIndex: number;
  questionType: TopicQuestionType;
}

function QuestionTypeCard({ qIndex, questionType }: QuestionTypeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="size-6 shrink-0 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center text-xs font-bold mt-0.5">
          {qIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground text-sm">{questionType.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {questionType.method}
          </div>
        </div>
        <Badge variant="outline" className="shrink-0">
          {questionType.examples.length} 例题
        </Badge>
        {expanded ? (
          <ChevronDown className="size-4 text-muted-foreground shrink-0 mt-1" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-1" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/40 bg-muted/20">
              <p className="text-sm text-foreground/80 leading-relaxed pt-2">
                <span className="font-medium text-amber-700 dark:text-amber-400">解题方法：</span>
                {questionType.method}
              </p>
              {questionType.examples.map((ex, i) => (
                <ExampleCard key={ex.id} index={i + 1} problem={ex.problem} steps={ex.steps} tip={ex.tip} answer={ex.answer} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ 单道例题 ============

interface ExampleCardProps {
  index: number;
  problem: string;
  steps: string[];
  tip?: string;
  answer: string;
}

function ExampleCard({ index, problem, steps, tip, answer }: ExampleCardProps) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="size-5 rounded bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 flex items-center justify-center text-xs font-bold">
            例{index}
          </span>
          题目
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 rounded-lg bg-muted/50 text-base font-mono">
          <MathRenderer expression={problem} displayMode />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowSolution((s) => !s)}
          className="w-full"
        >
          {showSolution ? (
            <>
              <ChevronDown className="size-4 mr-1.5" />
              收起解析
            </>
          ) : (
            <>
              <BookOpen className="size-4 mr-1.5" />
              查看解析
            </>
          )}
        </Button>
        <AnimatePresence>
          {showSolution && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-2 border-t border-border/40">
                <div className="text-sm font-medium text-foreground">解析步骤：</div>
                <ol className="space-y-2.5 pl-1">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="size-5 shrink-0 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 text-sm text-foreground leading-relaxed font-mono">
                        <MathRenderer expression={step} />
                      </div>
                    </li>
                  ))}
                </ol>
                {tip && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/60 dark:bg-amber-900/20 dark:border-amber-800/30">
                    <div className="flex items-start gap-2">
                      <Zap className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{tip}</div>
                    </div>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/30">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">最终答案</div>
                  <div className="text-base font-mono font-semibold text-emerald-800 dark:text-emerald-300">
                    <MathRenderer expression={answer} displayMode />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ============ 变式练习卡片 ============

interface PracticeCardProps {
  topic: CompetitionTopic;
}

function PracticeCard({ topic }: PracticeCardProps) {
  const detail = getTopicDetail(topic.key);

  const [currentQ, setCurrentQ] = useState<GeneratedProblem | null>(() =>
    generateProblem(topic.key, 2, Date.now()),
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  // 从竞赛题 hint + solution 生成三层提示
  const generateCompetitionHints = (q: GeneratedProblem): string[] => {
    const hint = q.hint || '先观察题目条件，回忆相关定理和公式';
    const solution = q.solution || '';
    // 第二层：取 solution 的第一句话（句号前）
    let middleStep = '';
    const firstSentence = solution.split(/[。\n]/)[0];
    if (firstSentence && firstSentence.length < 80) {
      middleStep = firstSentence + '...';
    } else {
      middleStep = '试试把已知条件代入，先写出第一步';
    }
    return [hint, middleStep, solution];
  };

  const handleHintLevelChange = (level: number) => {
    if (level > hintLevel) {
      setHintLevel(level);
    }
  };

  const handleCheck = useCallback(() => {
    if (!currentQ) return;
    setChecked(true);
    setShowSolution(true);
    // 尝试数值比较（如果答案是纯数字/分数）
    const ans = currentQ.answer.trim();
    const evalFrac = (s: string): number | null => {
      const m = s.match(/^(-?\d+)\/(\d+)$/);
      if (m) return parseInt(m[1], 10) / parseInt(m[2], 10);
      const n = parseFloat(s);
      return isNaN(n) ? null : n;
    };
    const correctVal = evalFrac(ans);
    const userVal = evalFrac(userAnswer.trim());
    if (correctVal !== null && userVal !== null && Math.abs(correctVal - userVal) < 1e-4) {
      setIsCorrect(true);
      toast.success('回答正确！');
      return;
    }
    setIsCorrect(false);
    toast.info('请对照答案检查自己的解题过程');
  }, [currentQ, userAnswer]);

  const handleNext = useCallback(() => {
    const next = generateProblem(topic.key, 2, Date.now() + Math.floor(Math.random() * 1e6));
    setCurrentQ(next);
    setUserAnswer('');
    setChecked(false);
    setIsCorrect(false);
    setShowSolution(false);
    setHintLevel(0);
  }, [topic.key]);

  if (!currentQ) {
    // 生成失败兜底：用 detail 里的例题
    const examples = detail?.questionTypes.flatMap((qt) => qt.examples) || [];
    if (examples.length === 0) return null;
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">变式练习</CardTitle>
          <CardDescription>从本专题例题中随机抽取</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 border-emerald-200/60 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-900/10 dark:to-teal-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <Sparkles className="size-5" />
          变式练习
          <Badge variant="outline" className="ml-auto text-xs bg-muted/60 border-emerald-200 text-emerald-600">
            智能生成 · 无限刷新
          </Badge>
        </CardTitle>
        <CardDescription>
          基于参数化模板随机生成，每次都是新题
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-5 rounded-xl bg-card border border-border/60">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            <span>题目</span>
            <Badge variant="outline" className="text-xs ml-auto">
              难度 {currentQ.difficulty === 1 ? '基础' : currentQ.difficulty === 2 ? '中等' : '困难'}
            </Badge>
          </div>
          <div className="text-base">
            <RichTextRenderer text={currentQ.problem} />
          </div>
        </div>

        {/* 苏格拉底式提示 */}
        {!checked && currentQ && (
          <HintPanel
            hints={generateCompetitionHints(currentQ)}
            disabled={checked}
            hintLevel={hintLevel}
            onHintLevelChange={handleHintLevelChange}
          />
        )}

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">你的答案（数值或表达式）</label>
          <div className="flex gap-2">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="输入答案，如 1/2 或 0.5"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCheck();
              }}
              className="flex-1"
            />
            <Button onClick={handleCheck} disabled={!userAnswer.trim() || checked}>
              {checked ? '已判分' : '提交判分'}
            </Button>
          </div>
        </div>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg border ${
              isCorrect
                ? 'bg-emerald-100/70 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700/40'
                : 'bg-amber-50 border-amber-200/60 dark:bg-amber-900/20 dark:border-amber-800/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <X className="size-4 text-amber-600 dark:text-amber-400" />
              )}
              <span
                className={`text-sm font-medium ${
                  isCorrect
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {isCorrect ? '回答正确！' : '参考答案：'}
              </span>
            </div>
            {!isCorrect && (
              <div className="space-y-2 ml-6">
                <div className="text-sm font-medium">参考答案</div>
                <div className="text-base">
                  <RichTextRenderer text={currentQ.answer} />
                </div>
                {showSolution && currentQ.solution && (
                  <div className="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/30">
                    <div className="text-xs font-medium mb-1 text-amber-700 dark:text-amber-400">解析</div>
                    <div className="text-sm text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
                      <RichTextRenderer text={currentQ.solution} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleNext} className="flex-1">
            <Shuffle className="size-4 mr-1.5" />
            换一题
          </Button>
          {checked && !showSolution && currentQ.solution && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSolution(true)}
              className="gap-1"
            >
              <Lightbulb className="size-4" />
              看解析
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function gradientFor(color: string): string {
  const map: Record<string, string> = {
    emerald: 'from-emerald-400 to-teal-500',
    sky: 'from-sky-400 to-blue-500',
    amber: 'from-amber-400 to-orange-500',
    violet: 'from-primary to-teal-500',
    rose: 'from-rose-400 to-pink-500',
    indigo: 'from-primary to-teal-500',
    teal: 'from-teal-400 to-cyan-500',
    orange: 'from-orange-400 to-red-500',
  };
  return map[color] || map.emerald;
}
