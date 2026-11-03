import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, Lightbulb, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MathRenderer from '@/components/MathRenderer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HintPanelProps {
  /** 三层提示内容（0=方向 1=中间步 2=完整解析） */
  hints: string[];
  /** 是否禁用（已作答后不需要提示了） */
  disabled?: boolean;
  /** 提示层级变化回调：用户看到了第几层（1/2/3） */
  onHintLevelChange?: (level: number) => void;
  /** 当前已达到的最高层级（外部控制，用于记录） */
  hintLevel?: number;
}

const LEVEL_CONFIG = [
  {
    icon: Lightbulb,
    label: '第一层 · 给个方向',
    description: '先自己想想，一句话点破思路',
    buttonText: '还不会，再给一步',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40',
    iconBgClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  },
  {
    icon: Sparkles,
    label: '第二层 · 关键一步',
    description: '给你一个中间步骤，自己往后推',
    buttonText: '还是不会，看完整解析',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40',
    iconBgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  },
  {
    icon: BookOpen,
    label: '第三层 · 完整解析',
    description: '完整解题思路，下次记得三步走',
    buttonText: '',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40',
    iconBgClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
];

function HintPanel({ hints, disabled = false, onHintLevelChange, hintLevel = 0 }: HintPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localLevel, setLocalLevel] = useState(0); // 当前展开到第几层 0=未展开 1=方向 2=中间步 3=完整解析

  const visibleLevel = isOpen ? Math.max(localLevel, hintLevel) : 0;

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((v) => !v);
    if (!isOpen) {
      // 打开时展开到第一层
      if (localLevel === 0) {
        setLocalLevel(1);
        onHintLevelChange?.(1);
      }
    }
  };

  const handleNextLevel = () => {
    if (localLevel < 3) {
      const next = localLevel + 1;
      setLocalLevel(next);
      onHintLevelChange?.(next);
    }
  };

  const handleCopyHint = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('已复制');
    }).catch(() => {
      toast.error('复制失败');
    });
  };

  if (disabled) return null;

  return (
    <div className="space-y-2">
      {/* 提示按钮 */}
      <Button
        variant="ghost"
        onClick={handleToggle}
        className={cn(
          'w-full h-10 text-sm font-medium',
          isOpen
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/40'
            : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-300'
        )}
      >
        <HelpCircle className="size-4 mr-2" />
        {isOpen ? '收起提示' : '卡住了？要提示'}
      </Button>

      {/* 提示面板 */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              {LEVEL_CONFIG.slice(0, hints.length).map((cfg, idx) => {
                const level = idx + 1;
                const isVisible = visibleLevel >= level;
                const Icon = cfg.icon;

                return (
                  <motion.div
                    key={level}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -8 }}
                    transition={{ duration: 0.2, delay: isVisible ? idx * 0.05 : 0 }}
                    style={{ display: isVisible ? 'block' : 'none' }}
                  >
                    <div className={cn('rounded-xl p-4 border', cfg.bgClass)}>
                      <div className="flex items-start gap-3">
                        <div className={cn('size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.iconBgClass)}>
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn('text-sm font-semibold mb-1', cfg.colorClass)}>
                            {cfg.label}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {cfg.description}
                          </div>
                          <div
                            className="text-sm leading-relaxed cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleCopyHint(hints[idx])}
                            title="点击复制"
                          >
                            <MathRenderer expression={hints[idx]} displayMode={false} />
                          </div>

                          {/* 下一步按钮 */}
                          {level < hints.length && localLevel === level && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleNextLevel}
                              className="mt-3 h-8 text-xs"
                            >
                              {cfg.buttonText}
                              <ChevronRight className="size-3.5 ml-1" />
                            </Button>
                          )}

                          {/* 第三层复盘提示 */}
                          {level === 3 && isVisible && (
                            <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                              💡 下次先想想这三步：方向 → 关键步 → 完整解
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(HintPanel);
