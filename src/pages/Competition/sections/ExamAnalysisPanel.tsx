import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  Lightbulb,
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from 'lucide-react';
import {
  analyzeTopicFrequency,
  analyzeTypeDistribution,
  REAL_EXAM_HOT_POINTS,
  REAL_EXAM_PROPOSITION_RULES,
  type RealExamQuestion,
  type RealExamHotPoint,
} from '@/data/competition-real-exams';
import { COMPETITION_TOPICS } from '@/data/competition';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Props {
  questions: RealExamQuestion[];
  onGoTopic?: (topicKey: string) => void;
  onGoSkill?: (skillId: string) => void;
}

export default function ExamAnalysisPanel({ questions, onGoTopic, onGoSkill }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const topicFreq = useMemo(() => analyzeTopicFrequency(questions), [questions]);
  const typeDist = useMemo(() => analyzeTypeDistribution(questions), [questions]);

  const maxCount = Math.max(...topicFreq.map((t) => t.count), 1);
  const totalScore = questions.reduce((s, q) => s + q.score, 0);

  const getTopicTitle = (key: string) =>
    COMPETITION_TOPICS.find((t) => t.key === key)?.title ?? key;

  const hotPointsByImportance = useMemo(() => {
    return [...REAL_EXAM_HOT_POINTS].sort((a, b) => b.importance - a.importance);
  }, []);

  if (collapsed) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-transparent">
        <CardHeader className="pb-3">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-between text-left"
          >
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              真题考点分析
              <Badge variant="outline" className="text-xs font-normal">
                {questions.length} 题 · {topicFreq.length} 个专题
              </Badge>
            </CardTitle>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* 标题栏 */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              真题考点分析
              <Badge variant="outline" className="text-xs font-normal">
                基于 {questions.length} 道真题
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(true)}
              className="h-8 px-2"
            >
              <ChevronUp className="size-4" />
              收起
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 专题频次分布 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="size-4 text-emerald-600" />
              <h4 className="text-sm font-medium text-foreground">专题频次分布</h4>
              <span className="text-xs text-muted-foreground">（出现次数）</span>
            </div>
            <div className="space-y-2">
              {topicFreq.map((item, idx) => (
                <motion.div
                  key={item.topic}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span
                    className="text-xs text-muted-foreground w-20 shrink-0 truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onGoTopic?.(item.topic)}
                    title={getTopicTitle(item.topic)}
                  >
                    {getTopicTitle(item.topic)}
                  </span>
                  <div className="flex-1 h-6 bg-muted/60 rounded-md overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-md"
                    />
                    <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-foreground/80">
                      {item.count} 次
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 题型分布 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="size-4 text-blue-600" />
              <h4 className="text-sm font-medium text-foreground">题型分值分布</h4>
              <span className="text-xs text-muted-foreground">（满分 {totalScore}）</span>
            </div>
            <div className="space-y-3">
              {typeDist.map((item, idx) => (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="bg-card border border-border/60 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-semibold text-primary">
                      {item.score} 分
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.count} 题</span>
                    <span>·</span>
                    <span>占比 {Math.round(item.percentage * 100)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                      className={cn(
                        'h-full rounded-full',
                        item.type === 'fill-blank' && 'bg-blue-500',
                        item.type === 'calculation' && 'bg-emerald-500',
                        item.type === 'proof' && 'bg-amber-500',
                      )}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 高频考点清单 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="size-4 text-amber-500" />
            真题高频考点
            <Badge variant="secondary" className="text-xs font-normal">
              {hotPointsByImportance.length} 个核心考点
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {hotPointsByImportance.map((point, idx) => (
              <HotPointCard
                key={point.title}
                point={point}
                index={idx}
                topicTitle={getTopicTitle(point.topic)}
                onGoTopic={onGoTopic}
                onGoSkill={onGoSkill}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 命题规律速览 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-500" />
            命题规律速览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {REAL_EXAM_PROPOSITION_RULES.map((rule, idx) => (
              <motion.div
                key={rule.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-3 rounded-lg border border-border/60 bg-gradient-to-br from-card to-muted/20"
              >
                <div className="flex items-start gap-2">
                  <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="size-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground mb-1">
                      {rule.title}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function HotPointCard({
  point,
  index,
  topicTitle,
  onGoTopic,
  onGoSkill,
}: {
  point: RealExamHotPoint;
  index: number;
  topicTitle: string;
  onGoTopic?: (key: string) => void;
  onGoSkill?: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="p-3 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all group"
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            'size-5 rounded shrink-0 flex items-center justify-center text-xs font-bold mt-0.5',
            point.importance === 3 && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            point.importance === 2 && 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
            point.importance === 1 && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
          )}
        >
          {point.importance === 3 ? '★★' : point.importance === 2 ? '★' : '☆'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-foreground">{point.title}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <button
              onClick={() => onGoTopic?.(point.topic)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {topicTitle}
            </button>
            <span className="text-xs text-muted-foreground/60">·</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-500">
              {point.appearedSessions.join('、')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {point.tip}
          </p>
          {point.relatedSkillId && onGoSkill && (
            <button
              onClick={() => onGoSkill(point.relatedSkillId!)}
              className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              查看技巧
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// 简化版 cn 避免 import 循环
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
