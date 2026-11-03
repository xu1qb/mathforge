import { memo } from 'react';
import { History, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HistoryItem } from '@/hooks/useHistory';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  open: boolean;
  history: HistoryItem[];
  onToggle: () => void;
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
  /** 主题色：emerald / amber / blue / purple / rose / cyan / violet */
  theme?: string;
  /** 按钮位置：放在头部还是内嵌 */
  showButton?: boolean;
  className?: string;
}

const themeMap: Record<string, {
  btn: string;
  panel: string;
  border: string;
  text: string;
  textMuted: string;
  hover: string;
  clear: string;
}> = {
  emerald: {
    btn: 'text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-500/10',
    panel: 'border-emerald-900/40 bg-emerald-950/30',
    border: 'border-emerald-900/40',
    text: 'text-emerald-200/90',
    textMuted: 'text-emerald-400/60',
    hover: 'hover:bg-emerald-900/30',
    clear: 'text-red-400/70 hover:text-red-300 hover:bg-red-500/10',
  },
  amber: {
    btn: 'text-amber-600 hover:text-amber-700 dark:text-amber-400/80 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10',
    panel: 'border-amber-200/50 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-900/20',
    border: 'border-amber-200/50 dark:border-amber-800/40',
    text: 'text-amber-900 dark:text-amber-200',
    textMuted: 'text-amber-700/60 dark:text-amber-400/60',
    hover: 'hover:bg-amber-100/70 dark:hover:bg-amber-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  blue: {
    btn: 'text-blue-600 hover:text-blue-700 dark:text-blue-400/80 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10',
    panel: 'border-blue-200/50 dark:border-blue-800/40 bg-blue-50/60 dark:bg-blue-900/20',
    border: 'border-blue-200/50 dark:border-blue-800/40',
    text: 'text-blue-900 dark:text-blue-200',
    textMuted: 'text-blue-700/60 dark:text-blue-400/60',
    hover: 'hover:bg-blue-100/70 dark:hover:bg-blue-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  purple: {
    btn: 'text-primary hover:text-primary/90 dark:text-primary/90 dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10',
    panel: 'border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10',
    border: 'border-primary/20 dark:border-primary/30',
    text: 'text-foreground dark:text-foreground',
    textMuted: 'text-muted-foreground dark:text-muted-foreground',
    hover: 'hover:bg-primary/10 dark:hover:bg-primary/20',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  rose: {
    btn: 'text-rose-600 hover:text-rose-700 dark:text-rose-400/80 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10',
    panel: 'border-rose-200/50 dark:border-rose-800/40 bg-rose-50/60 dark:bg-rose-900/20',
    border: 'border-rose-200/50 dark:border-rose-800/40',
    text: 'text-rose-900 dark:text-rose-200',
    textMuted: 'text-rose-700/60 dark:text-rose-400/60',
    hover: 'hover:bg-rose-100/70 dark:hover:bg-rose-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  cyan: {
    btn: 'text-cyan-600 hover:text-cyan-700 dark:text-cyan-400/80 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10',
    panel: 'border-cyan-200/50 dark:border-cyan-800/40 bg-cyan-50/60 dark:bg-cyan-900/20',
    border: 'border-cyan-200/50 dark:border-cyan-800/40',
    text: 'text-cyan-900 dark:text-cyan-200',
    textMuted: 'text-cyan-700/60 dark:text-cyan-400/60',
    hover: 'hover:bg-cyan-100/70 dark:hover:bg-cyan-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  violet: {
    btn: 'text-primary hover:text-primary/90 dark:text-primary/90 dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10',
    panel: 'border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10',
    border: 'border-primary/20 dark:border-primary/30',
    text: 'text-foreground dark:text-foreground',
    textMuted: 'text-muted-foreground dark:text-muted-foreground',
    hover: 'hover:bg-primary/10 dark:hover:bg-primary/20',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  stone: {
    btn: 'text-foreground hover:text-foreground dark:text-muted-foreground/80 dark:hover:text-stone-300 hover:bg-muted dark:hover:bg-stone-700/30',
    panel: 'border-border/70 dark:border-stone-700/50 bg-muted/50/60 dark:bg-stone-800/40',
    border: 'border-border/70 dark:border-stone-700/50',
    text: 'text-foreground dark:text-stone-200',
    textMuted: 'text-muted-foreground/70 dark:text-muted-foreground/60',
    hover: 'hover:bg-muted/70 dark:hover:bg-stone-700/40',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  teal: {
    btn: 'text-teal-600 hover:text-teal-700 dark:text-teal-400/80 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10',
    panel: 'border-teal-200/50 dark:border-teal-800/40 bg-teal-50/60 dark:bg-teal-900/20',
    border: 'border-teal-200/50 dark:border-teal-800/40',
    text: 'text-teal-900 dark:text-teal-200',
    textMuted: 'text-teal-700/60 dark:text-teal-400/60',
    hover: 'hover:bg-teal-100/70 dark:hover:bg-teal-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  indigo: {
    btn: 'text-teal-600 hover:text-teal-700 dark:text-teal-400/80 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10',
    panel: 'border-teal-200/50 dark:border-teal-800/40 bg-teal-50/60 dark:bg-teal-900/20',
    border: 'border-teal-200/50 dark:border-teal-800/40',
    text: 'text-teal-900 dark:text-teal-100',
    textMuted: 'text-teal-700/60 dark:text-teal-400/60',
    hover: 'hover:bg-teal-100/70 dark:hover:bg-teal-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  pink: {
    btn: 'text-pink-600 hover:text-pink-700 dark:text-pink-400/80 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-500/10',
    panel: 'border-pink-200/50 dark:border-pink-800/40 bg-pink-50/60 dark:bg-pink-900/20',
    border: 'border-pink-200/50 dark:border-pink-800/40',
    text: 'text-pink-900 dark:text-pink-200',
    textMuted: 'text-pink-700/60 dark:text-pink-400/60',
    hover: 'hover:bg-pink-100/70 dark:hover:bg-pink-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  sky: {
    btn: 'text-sky-600 hover:text-sky-700 dark:text-sky-400/80 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-500/10',
    panel: 'border-sky-200/50 dark:border-sky-800/40 bg-sky-50/60 dark:bg-sky-900/20',
    border: 'border-sky-200/50 dark:border-sky-800/40',
    text: 'text-sky-900 dark:text-sky-200',
    textMuted: 'text-sky-700/60 dark:text-sky-400/60',
    hover: 'hover:bg-sky-100/70 dark:hover:bg-sky-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  lime: {
    btn: 'text-lime-700 hover:text-lime-800 dark:text-lime-400/80 dark:hover:text-lime-300 hover:bg-lime-50 dark:hover:bg-lime-500/10',
    panel: 'border-lime-200/50 dark:border-lime-800/40 bg-lime-50/60 dark:bg-lime-900/20',
    border: 'border-lime-200/50 dark:border-lime-800/40',
    text: 'text-lime-900 dark:text-lime-200',
    textMuted: 'text-lime-700/60 dark:text-lime-400/60',
    hover: 'hover:bg-lime-100/70 dark:hover:bg-lime-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  fuchsia: {
    btn: 'text-fuchsia-600 hover:text-fuchsia-700 dark:text-fuchsia-400/80 dark:hover:text-fuchsia-300 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10',
    panel: 'border-fuchsia-200/50 dark:border-fuchsia-800/40 bg-fuchsia-50/60 dark:bg-fuchsia-900/20',
    border: 'border-fuchsia-200/50 dark:border-fuchsia-800/40',
    text: 'text-fuchsia-900 dark:text-fuchsia-200',
    textMuted: 'text-fuchsia-700/60 dark:text-fuchsia-400/60',
    hover: 'hover:bg-fuchsia-100/70 dark:hover:bg-fuchsia-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  yellow: {
    btn: 'text-yellow-700 hover:text-yellow-800 dark:text-yellow-400/80 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-500/10',
    panel: 'border-yellow-200/50 dark:border-yellow-800/40 bg-yellow-50/60 dark:bg-yellow-900/20',
    border: 'border-yellow-200/50 dark:border-yellow-800/40',
    text: 'text-yellow-900 dark:text-yellow-200',
    textMuted: 'text-yellow-700/60 dark:text-yellow-400/60',
    hover: 'hover:bg-yellow-100/70 dark:hover:bg-yellow-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
  orange: {
    btn: 'text-orange-600 hover:text-orange-700 dark:text-orange-400/80 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10',
    panel: 'border-orange-200/50 dark:border-orange-800/40 bg-orange-50/60 dark:bg-orange-900/20',
    border: 'border-orange-200/50 dark:border-orange-800/40',
    text: 'text-orange-900 dark:text-orange-200',
    textMuted: 'text-orange-700/60 dark:text-orange-400/60',
    hover: 'hover:bg-orange-100/70 dark:hover:bg-orange-800/30',
    clear: 'text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-300 dark:hover:bg-red-500/10',
  },
};

function HistoryPanelInner({
  open,
  history,
  onToggle,
  onClear,
  onSelect,
  theme = 'emerald',
  showButton = true,
  className,
}: HistoryPanelProps) {
  const t = themeMap[theme] || themeMap.emerald;

  return (
    <div className={cn(className)}>
      {showButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn('!h-7 px-2.5 text-xs', t.btn)}
        >
          <History className="w-3.5 h-3.5 mr-1.5" />
          历史 ({history.length})
        </Button>
      )}

      {open && (
        <div className={cn('mb-4 border rounded-lg p-3 max-h-52 overflow-y-auto', t.panel)}>
          <div className="flex items-center justify-between mb-2">
            <span className={cn('text-xs font-medium', t.textMuted)}>历史记录</span>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className={cn('!h-6 px-2 text-xs', t.clear)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                清空
              </Button>
            )}
          </div>
          {history.length === 0 ? (
            <div className={cn('text-xs text-center py-4 italic', t.textMuted)}>
              暂无历史记录
            </div>
          ) : (
            <div className="space-y-1.5">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    'w-full text-left p-2 rounded-md transition-colors group',
                    t.hover,
                  )}
                >
                  <div className={cn('text-xs truncate font-mono flex items-center gap-1.5', t.textMuted)}>
                    <Clock className="size-3 shrink-0" />
                    {item.expression}
                  </div>
                  <div className={cn('text-sm font-mono truncate mt-0.5 group-hover:opacity-90', t.text)}>
                    {item.result.split('\n')[0]}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(HistoryPanelInner);
