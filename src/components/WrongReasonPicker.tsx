import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Brain, Lightbulb, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WrongReason } from '@/hooks/use-learning';
import { WRONG_REASON_LABELS, WRONG_REASON_COLORS } from '@/hooks/use-learning';

interface WrongReasonPickerProps {
  /** 是否显示 */
  open: boolean;
  /** 当前选中的错因 */
  value?: WrongReason;
  /** 选择回调 */
  onSelect: (reason: WrongReason) => void;
  /** 关闭回调 */
  onClose?: () => void;
  /** 像素风样式（战斗模式用） */
  pixelStyle?: boolean;
  className?: string;
}

const REASON_ITEMS: { key: WrongReason; icon: typeof Calculator; description: string }[] = [
  { key: 'calc-mistake', icon: Calculator, description: '算错了数字' },
  { key: 'concept', icon: Brain, description: '概念理解错' },
  { key: 'method', icon: Lightbulb, description: '方法没掌握' },
  { key: 'misread', icon: Eye, description: '没看清题目' },
];

function WrongReasonPicker({ open, value, onSelect, onClose, pixelStyle = false, className }: WrongReasonPickerProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn('overflow-hidden', className)}
        >
          <div className={cn(
            'rounded-xl p-4 border space-y-3',
            pixelStyle
              ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700/50'
              : 'bg-card border-border'
          )}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">
                这道题做错的主要原因是？
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  <span className="sr-only">关闭</span>
                  <span className="text-lg leading-none">×</span>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {REASON_ITEMS.map((item) => {
                const Icon = item.icon;
                const isSelected = value === item.key;
                const colors = WRONG_REASON_COLORS[item.key];
                return (
                  <Button
                    key={item.key}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => onSelect(item.key)}
                    className={cn(
                      'h-auto py-3 px-3 flex flex-col items-center gap-1 text-center',
                      isSelected && colors.bg,
                      isSelected && colors.text,
                      !isSelected && 'hover:bg-muted/50'
                    )}
                    style={isSelected ? undefined : undefined}
                  >
                    <Icon className="size-5" />
                    <div className="text-sm font-medium">{WRONG_REASON_LABELS[item.key]}</div>
                    <div className="text-xs opacity-70 normal-case">{item.description}</div>
                  </Button>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              选一个原因，帮你更好地复习
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(WrongReasonPicker);
