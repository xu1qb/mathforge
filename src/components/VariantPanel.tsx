import { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, GitBranch, Lightbulb, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MathRenderer from '@/components/MathRenderer';
import MathInputField from '@/components/MathInputField';
import {
  generatePracticeQuestion,
  checkPracticeAnswer,
  type PracticeQuestion,
  type Difficulty,
} from '@/lib/math-practice';
import { useMastery, VARIANT_TYPE_LABELS, type VariantType } from '@/hooks/use-mastery';
import { useLearningStats } from '@/hooks/use-learning';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VariantPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 母题 */
  question: PracticeQuestion | null;
}

interface VariantItem {
  question: PracticeQuestion;
  variantType: VariantType;
  variantIndex: number;
}

const VARIANT_TYPES: VariantType[] = ['number', 'condition', 'approach'];

/** 生成 3 道变式题：同 topic 同难度，不同参数 */
function generateVariants(mother: PracticeQuestion): VariantItem[] {
  const variants: VariantItem[] = [];
  for (let i = 0; i < 3; i++) {
    const q = generatePracticeQuestion(mother.topicKey, mother.difficulty as Difficulty);
    variants.push({
      question: { ...q, id: `${mother.id}_v${i + 1}` },
      variantType: VARIANT_TYPES[i],
      variantIndex: i + 1,
    });
  }
  return variants;
}

export default function VariantPanel({ open, onOpenChange, question }: VariantPanelProps) {
  const { markMotherCorrect, markVariantCorrect, getRecord, isMastered } = useMastery();
  const { recordAnswer } = useLearningStats();

  // 变式题列表（打开时生成，关闭时清空）
  const [variants, setVariants] = useState<VariantItem[]>([]);
  // 当前激活的变式索引
  const [activeIndex, setActiveIndex] = useState(0);
  // 每道变式的答题状态
  const [answers, setAnswers] = useState<string[]>([]);
  const [checkedList, setCheckedList] = useState<boolean[]>([]);
  const [correctList, setCorrectList] = useState<boolean[]>([]);
  // 母题是否做对过（用于掌握判定）
  const [motherDone, setMotherDone] = useState(false);
  // 掌握提示
  const [showMasteredToast, setShowMasteredToast] = useState(false);

  // 打开时生成变式
  const handleOpen = useCallback(
    (isOpen: boolean) => {
      if (isOpen && question) {
        const vs = generateVariants(question);
        setVariants(vs);
        setAnswers(vs.map(() => ''));
        setCheckedList(vs.map(() => false));
        setCorrectList(vs.map(() => false));
        setActiveIndex(0);
        // 检查母题是否已做对
        const rec = getRecord(question);
        setMotherDone(rec?.motherCorrect ?? false);
        setShowMasteredToast(false);
      }
      onOpenChange(isOpen);
    },
    [question, onOpenChange, getRecord],
  );

  const activeVariant = variants[activeIndex];

  // 提交变式答案
  const handleCheck = useCallback(() => {
    if (!activeVariant || !question) return;
    const userAns = answers[activeIndex];
    if (!userAns.trim()) {
      toast.info('请输入答案');
      return;
    }
    const result = checkPracticeAnswer(activeVariant.question, userAns);
    const newChecked = [...checkedList];
    const newCorrect = [...correctList];
    newChecked[activeIndex] = true;
    newCorrect[activeIndex] = result.correct;
    setCheckedList(newChecked);
    setCorrectList(newCorrect);

    if (result.correct) {
      const record = markVariantCorrect(question, activeVariant.question.id, activeVariant.variantType);
      // 变式答对计入知识点统计
      if (question) {
        recordAnswer(question.topicKey, true);
      }
      if (record.mastered && !showMasteredToast) {
        setShowMasteredToast(true);
        toast.success('已掌握！', {
          description: '母题 + 2 道变式全部做对，这类题你已掌握',
          icon: <Sparkles className="size-4" />,
        });
      } else {
        toast.success('变式答对了！', { description: `第 ${activeIndex + 1} 变式 · ${VARIANT_TYPE_LABELS[activeVariant.variantType]}` });
      }
    } else {
      // 变式答错计入知识点薄弱统计，但不进错题本
      if (question) {
        recordAnswer(question.topicKey, false);
      }
      toast.error('变式答错了', { description: '已计入薄弱点，继续加油' });
    }
  }, [activeVariant, activeIndex, answers, checkedList, correctList, question, markVariantCorrect, recordAnswer, showMasteredToast]);

  // 标记母题已做对（用户主动确认）
  const handleMarkMother = useCallback(() => {
    if (!question) return;
    const record = markMotherCorrect(question);
    setMotherDone(true);
    if (record.mastered && !showMasteredToast) {
      setShowMasteredToast(true);
      toast.success('已掌握！', {
        description: '母题 + 2 道变式全部做对，这类题你已掌握',
        icon: <Sparkles className="size-4" />,
      });
    } else {
      toast.success('母题已标记正确', { description: '再做对 2 道变式即可掌握' });
    }
  }, [question, markMotherCorrect, showMasteredToast]);

  const completedCount = useMemo(
    () => correctList.filter(Boolean).length,
    [correctList],
  );

  const mastered = question ? isMastered(question) : false;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="size-5 text-primary" />
            同源变式训练
            {mastered && (
              <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40">
                <Check className="size-3 mr-1" />
                已掌握
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm">
            换数 · 换条件 · 换问法，三道变式练透一类题
          </DialogDescription>
        </DialogHeader>

        {/* 掌握进度 */}
        <div className="px-5 py-3 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              掌握进度：母题 {motherDone ? '✓' : '○'} + 变式 {completedCount}/3
            </span>
            <span className={cn(
              'font-medium',
              mastered ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
            )}>
              {mastered ? '已掌握' : `还差 ${Math.max(0, 2 - completedCount - (motherDone ? 0 : 1))} 道`}
            </span>
          </div>
          <div className="flex gap-1">
            {/* 母题进度条 */}
            <div
              className={cn(
                'h-2 flex-1 rounded-full',
                motherDone ? 'bg-primary' : 'bg-muted',
              )}
              style={{ flexBasis: '25%' }}
            />
            {/* 变式进度条 */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full',
                  correctList[i] ? 'bg-primary' : 'bg-muted',
                )}
                style={{ flexBasis: '25%' }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
            <span style={{ flexBasis: '25%', textAlign: 'center' }}>母题</span>
            <span style={{ flexBasis: '25%', textAlign: 'center' }}>变式1</span>
            <span style={{ flexBasis: '25%', textAlign: 'center' }}>变式2</span>
            <span style={{ flexBasis: '25%', textAlign: 'center' }}>变式3</span>
          </div>
        </div>

        {/* 母题状态 & 操作 */}
        {!motherDone && question && (
          <div className="px-5 py-3 border-b border-border bg-amber-50/50 dark:bg-amber-900/10 shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium text-amber-800 dark:text-amber-300">母题尚未标记正确</div>
                <div className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  如果你在练习页已经做对了这道题，点这里确认
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleMarkMother}>
                <Check className="size-3.5 mr-1" />
                标记做对
              </Button>
            </div>
          </div>
        )}

        {/* 变式选择 tabs */}
        <div className="px-5 py-3 border-b border-border flex gap-2 shrink-0">
          {variants.map((v, i) => (
            <Button
              key={i}
              variant={activeIndex === i ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'flex-1 h-auto py-2 flex-col gap-0.5',
                checkedList[i] && correctList[i] && activeIndex !== i && 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40 hover:bg-emerald-100',
              )}
            >
              <span className="text-xs font-normal opacity-70">第 {i + 1} 变式</span>
              <span className="text-sm font-medium">
                {VARIANT_TYPE_LABELS[v.variantType]}
              </span>
              {checkedList[i] && (
                correctList[i]
                  ? <Check className="size-3 mt-0.5" />
                  : <X className="size-3 mt-0.5 text-destructive" />
              )}
            </Button>
          ))}
        </div>

        {/* 变式答题区（可滚动） */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait">
            {activeVariant && (
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* 变式标签 */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    <Lightbulb className="size-3 mr-1" />
                    同源母题 · 第 {activeVariant.variantIndex} 变式
                  </Badge>
                  <Badge variant="secondary" className="font-normal">
                    {VARIANT_TYPE_LABELS[activeVariant.variantType]}
                  </Badge>
                </div>

                {/* 题目 */}
                <div className="text-foreground">
                  <MathRenderer expression={activeVariant.question.questionLatex} displayMode />
                </div>

                {/* 输入框 */}
                {!checkedList[activeIndex] ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleCheck(); }} className="space-y-3">
                    <MathInputField
                      value={answers[activeIndex]}
                      onChange={(val) => {
                        const next = [...answers];
                        next[activeIndex] = val;
                        setAnswers(next);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCheck();
                        }
                      }}
                      placeholder={
                        activeVariant.question.answerType === 'numeric'
                          ? '输入数值答案，如 42 或 3π/2'
                          : '输入表达式答案，如 x^2 + C'
                      }
                    />
                    <Button type="submit" className="w-full h-11">
                      提交答案
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </form>
                ) : (
                  // 反馈
                  <div className={cn(
                    'rounded-xl p-4 border',
                    correctList[activeIndex]
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40',
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      {correctList[activeIndex] ? (
                        <Check className="size-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <X className="size-5 text-red-600 dark:text-red-400" />
                      )}
                      <span className={cn(
                        'font-semibold',
                        correctList[activeIndex]
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-red-700 dark:text-red-300',
                      )}>
                        {correctList[activeIndex] ? '回答正确！' : '答案不正确'}
                      </span>
                    </div>
                    <div className="text-sm text-foreground dark:text-muted-foreground">
                      正确答案：<span className="font-mono">{activeVariant.question.answerDisplay}</span>
                    </div>
                    {/* 解析步骤 */}
                    {activeVariant.question.steps.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-current/10">
                        <div className="text-xs font-semibold text-foreground dark:text-muted-foreground mb-2">
                          解题步骤
                        </div>
                        <div className="space-y-1.5">
                          {activeVariant.question.steps.map((step, si) => (
                            <div key={si} className="text-sm text-foreground dark:text-muted-foreground leading-relaxed">
                              {step.includes('\\') || step.match(/[=<>]/) ? (
                                <MathRenderer expression={step} isInput />
                              ) : (
                                step
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部操作 */}
        <div className="px-5 py-3 border-t border-border bg-card shrink-0 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
          >
            上一题
          </Button>
          <div className="text-xs text-muted-foreground">
            {activeIndex + 1} / {variants.length}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveIndex(Math.min(variants.length - 1, activeIndex + 1))}
            disabled={activeIndex === variants.length - 1}
          >
            下一题
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
