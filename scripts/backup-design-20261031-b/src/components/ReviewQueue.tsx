import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight, RotateCcw, Trophy, Brain, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MathRenderer from '@/components/MathRenderer';
import { checkPracticeAnswer } from '@/lib/math-practice';
import type { WrongItem } from '@/hooks/use-learning';
import TtsButton from '@/components/TtsButton';

interface ReviewQueueProps {
  /** 待重做的错题列表（已按到期排序） */
  items: WrongItem[];
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onOpenChange: (open: boolean) => void;
  /** 答对回调（推进复习阶段） */
  onCorrect: (id: string) => void;
  /** 答错回调（重置复习阶段 + 错因） */
   onWrong: (id: string, userAnswer: string) => void;
   /** 是否为蒙对重考模式（答对后让用户选「验证通过」或「还是没完全掌握」） */
   guessMode?: boolean;
   /** 蒙对重考：用户确认验证通过 */
   onGuessVerified?: (id: string) => void;
   /** 蒙对重考：用户标记还是不会 → 再隔 3 天 */
   onGuessAgain?: (id: string, userAnswer: string) => void;
 }

function ReviewQueue({ items, open, onOpenChange, onCorrect, onWrong, guessMode = false, onGuessVerified, onGuessAgain }: ReviewQueueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentItem = useMemo(() => items[currentIndex] ?? null, [items, currentIndex]);

  const resetState = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswer('');
    setIsChecked(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setWrongCount(0);
    setFinished(false);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  const handleSubmit = useCallback(() => {
     if (!currentItem || isChecked) return;
     const result = checkPracticeAnswer(currentItem.question, userAnswer);
     setIsChecked(true);
     setIsCorrect(result.correct);
     if (result.correct) {
       setCorrectCount((c) => c + 1);
       // 蒙对模式：不自动调用 onCorrect，等用户手动确认
       if (!guessMode) {
         onCorrect(currentItem.id);
         toast.success('回答正确！复习阶段 +1');
       }
     } else {
       setWrongCount((w) => w + 1);
       onWrong(currentItem.id, userAnswer);
       toast.error('再看看解析，下次加油');
     }
    }, [currentItem, userAnswer, isChecked, onCorrect, onWrong, guessMode]);

  const handleNext = useCallback(() => {
    if (!currentItem) return;
    if (currentIndex + 1 >= items.length) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setUserAnswer('');
    setIsChecked(false);
    setIsCorrect(false);
  }, [currentIndex, items.length, currentItem]);

   const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
     if (e.key === 'Enter') {
       if (!isChecked) handleSubmit();
       else handleNext();
     }
   }, [isChecked, handleSubmit, handleNext]);
 
   const handleGuessVerified = useCallback(() => {
     if (!currentItem) return;
     onGuessVerified?.(currentItem.id);
     toast.success('验证通过！真掌握了 🎉');
     handleNext();
   }, [currentItem, onGuessVerified, handleNext]);
 
   const handleGuessAgain = useCallback(() => {
     if (!currentItem) return;
     onGuessAgain?.(currentItem.id, userAnswer);
     toast.info('已记录，3 天后再来验证', { description: '多练习几次就真会啦' });
     handleNext();
   }, [currentItem, userAnswer, onGuessAgain, handleNext]);
 
   if (items.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        {finished ? (
          <div className="p-8 text-center space-y-4">
            <div className="size-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Trophy className="size-8 text-emerald-500" />
            </div>
            <div className="text-xl font-bold">重做完成！</div>
            <div className="text-sm text-muted-foreground">
              共 {items.length} 道 · 答对 {correctCount} 道 · 答错 {wrongCount} 道
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                返回
              </Button>
              <Button onClick={() => handleOpenChange(false)}>
                完成
              </Button>
            </div>
          </div>
        ) : currentItem ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-3">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base flex items-center gap-2">
                   <RotateCcw className="size-4 text-primary" />
                   {guessMode ? '蒙对重考验证' : '错题重做'}
                   <Badge variant="outline" className="ml-1 text-xs">
                    {currentIndex + 1} / {items.length}
                  </Badge>
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenChange(false)}
                  className="h-8 w-8"
                  aria-label="关闭"
                >
                  <X className="size-4" />
                </Button>
              </div>
              {/* 进度条 */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + (isChecked ? 1 : 0)) / items.length) * 100}%` }}
                />
              </div>
            </DialogHeader>

            <div className="px-6 pb-6 space-y-4">
              {/* 题目 */}
              <Card className="p-4 bg-muted/30">
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Brain className="size-3.5" />
                  来自「{currentItem.topicKey}」
                </div>
                <div className="text-base font-medium text-foreground leading-relaxed">
                  <MathRenderer expression={currentItem.question.question} isInput />
                </div>
              </Card>

              {/* 答题区 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">你的答案</label>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isChecked}
                  placeholder="输入答案，按 Enter 提交"
                  className="text-base h-12"
                  autoFocus
                />
              </div>

              {/* 反馈与解析 */}
              <AnimatePresence initial={false}>
                {isChecked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`rounded-xl p-4 mb-3 flex items-center gap-3 ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40'
                      }`}
                    >
                      <div
                        className={`size-9 rounded-full flex items-center justify-center shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                        }`}
                      >
                        {isCorrect ? <Check className="size-4" /> : <X className="size-4" />}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-semibold ${
                            isCorrect
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-red-700 dark:text-red-300'
                          }`}
                        >
                          {isCorrect ? '答对了！继续保持' : '答错了，看看解析'}
                        </div>
                        {!isCorrect && (
                          <div className="text-sm text-foreground dark:text-muted-foreground mt-0.5">
                            正确答案：<span className="font-mono">{currentItem.question.answerDisplay}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 解析步骤 */}
                    {!isCorrect && currentItem.question.steps && (
                       <div className="bg-muted/50 dark:bg-slate-800/40 rounded-xl p-4">
                         <div className="flex items-center justify-between mb-3">
                           <div className="text-sm font-semibold text-foreground dark:text-foreground">
                             解析步骤
                           </div>
                           <TtsButton
                             text={currentItem.question.steps.join('。')}
                             isLatex
                             size="sm"
                             variant="ghost"
                           />
                         </div>
                        <div className="space-y-2">
                          {currentItem.question.steps.map((step: string, i: number) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <div className="flex-1 text-sm text-foreground dark:text-muted-foreground leading-relaxed">
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
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 操作按钮 */}
               <div className="flex items-center gap-3">
                 <Button
                   variant="outline"
                   onClick={() => handleOpenChange(false)}
                   className="flex-1"
                 >
                   退出
                 </Button>
                 {!isChecked ? (
                   <Button onClick={handleSubmit} className="flex-1">
                     提交答案
                   </Button>
                 ) : guessMode && isCorrect ? (
                   <div className="flex-1 flex gap-2">
                     <Button onClick={handleGuessVerified} variant="secondary" className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border-0">
                       <Check className="size-4 mr-1" />
                       真掌握了
                     </Button>
                     <Button onClick={handleGuessAgain} variant="secondary" className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border-0">
                       <AlertTriangle className="size-4 mr-1" />
                       还需再练
                     </Button>
                   </div>
                 ) : (
                   <Button onClick={handleNext} className="flex-1">
                     {currentIndex + 1 >= items.length ? '完成' : '下一题'}
                     <ChevronRight className="size-4 ml-1" />
                   </Button>
                 )}
               </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default ReviewQueue;
