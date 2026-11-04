import { useState, memo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, History, Trash2, Clock, Calculator, Type, Lightbulb, Copy, Check, ListOrdered } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import { toast } from 'sonner';
import { FavoriteStar } from '@/components/FavoritesPanel';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp?: number;
}

interface ComputationResultProps {
  result: string;
  error: string | null;
  /** 空状态标题 */
  emptyTitle?: string;
  /** 空状态描述 */
  emptyDescription?: string;
  /** 示例提示 */
  exampleHint?: string;
  /** 点击示例回调 */
  onExampleClick?: () => void;
  /** 历史记录 */
  history?: HistoryItem[];
  /** 历史面板是否打开 */
  historyOpen?: boolean;
  /** 切换历史面板 */
  onToggleHistory?: () => void;
  /** 清空历史 */
  onClearHistory?: () => void;
  /** 选中历史项 */
  onSelectHistory?: (item: HistoryItem) => void;
  /** 默认视图模式 */
  defaultViewMode?: 'formatted' | 'text';
  /** 是否显示历史按钮 */
  showHistory?: boolean;
  /** 结果对齐方向 */
  align?: 'left' | 'right';
  /** 步骤详解数据 */
  steps?: { description: string; formula: string; latex?: string }[] | null;
  /** 步骤是否展开 */
  showSteps?: boolean;
  /** 切换步骤展开 */
  onToggleSteps?: () => void;
  /** 收藏相关：模块 key */
  moduleKey?: string;
  /** 收藏相关：模块名 */
  moduleLabel?: string;
  /** 收藏相关：表达式（用于收藏内容） */
  favoriteExpression?: string;
  /** 收藏相关：结果 LaTeX 版 */
  favoriteResultLatex?: string;
  /** 是否显示收藏按钮 */
  showFavorite?: boolean;
}

function ComputationResultInner({
  result,
  error,
  emptyTitle = '等待计算',
  emptyDescription = '输入表达式后点击「计算」查看结果',
  exampleHint,
  onExampleClick,
  history = [],
  historyOpen = false,
  onToggleHistory,
  onClearHistory,
  onSelectHistory,
  defaultViewMode = 'formatted',
  showHistory = true,
  align = 'left',
  steps,
  showSteps = false,
  onToggleSteps,
  moduleKey = '',
  moduleLabel = '',
  favoriteExpression = '',
  favoriteResultLatex,
  showFavorite = true,
}: ComputationResultProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>(defaultViewMode);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 1500);
    });
  }, [result]);

  const hasResult = !!result && !error;

  return (
    <Card className="board-surface board-surface bg-[var(--board-bg)] border-0 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-emerald-400/70 font-medium tracking-wider flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            计算结果
          </div>
          <div className="flex items-center gap-1">
            {hasResult && (
              <button
                onClick={() => setViewMode((m) => (m === 'formatted' ? 'text' : 'formatted'))}
                className="h-7 px-2 text-xs text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-md transition-colors flex items-center gap-1"
                title={viewMode === 'formatted' ? '切换到文本模式' : '切换到公式排版'}
              >
                {viewMode === 'formatted' ? (
                  <><Calculator className="size-3" /> 排版</>
                ) : (
                  <><Type className="size-3" /> 文本</>
                )}
              </button>
            )}
            {hasResult && (
              <button
                onClick={handleCopy}
                className="h-7 px-2 text-xs text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-md transition-colors flex items-center gap-1"
                title="复制结果"
              >
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? '已复制' : '复制'}
              </button>
            )}
             {hasResult && showFavorite && moduleKey && favoriteExpression && (
               <FavoriteStar
                 moduleKey={moduleKey}
                 moduleLabel={moduleLabel}
                 expression={favoriteExpression}
                 result={result}
                 resultLatex={favoriteResultLatex}
                 size="sm"
               />
             )}
             {hasResult && steps && steps.length > 0 && onToggleSteps && (
              <button
                type="button"
                onClick={onToggleSteps}
                className="h-7 px-2 text-xs text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 rounded-md transition-colors flex items-center gap-1"
              >
                <ListOrdered className="size-3.5" />
                {showSteps ? '隐藏步骤' : '显示步骤'}
                <span className="text-amber-500/60">({steps.length})</span>
              </button>
            )}
            {showHistory && onToggleHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleHistory}
                className="!h-7 px-2.5 text-xs text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-500/10"
              >
                <History className="w-3.5 h-3.5 mr-1.5" />
                历史 ({history.length})
              </Button>
            )}
          </div>
        </div>

        {/* 历史记录展开面板 */}
        {historyOpen && onClearHistory && onSelectHistory && (
          <div className="mb-4 border border-emerald-900/40 rounded-lg bg-emerald-950/30 p-3 max-h-52 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-emerald-400/60 font-medium">历史记录</span>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearHistory}
                  className="!h-6 px-2 text-xs text-red-400/70 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  清空
                </Button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="text-xs text-emerald-500/50 text-center py-4 italic">
                暂无历史记录
              </div>
            ) : (
              <div className="space-y-1.5">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectHistory(item)}
                    className="w-full text-left p-2 rounded-md hover:bg-emerald-900/30 transition-colors group"
                  >
                    <div className="text-xs text-emerald-400/60 truncate font-mono flex items-center gap-1.5">
                      <Clock className="size-3 shrink-0" />
                      {item.expression}
                    </div>
                    <div className="text-sm text-emerald-200/90 font-mono truncate mt-0.5 group-hover:text-emerald-100">
                      {item.result.split('\n')[0]}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 结果内容 */}
        {error ? (
          <div className="text-red-400 font-mono leading-relaxed">{error}</div>
        ) : hasResult ? (
          <div className="space-y-3">
            {viewMode === 'formatted' ? (
              <div className={`text-emerald-300 text-base leading-relaxed space-y-1.5 overflow-x-auto ${align === 'right' ? 'text-right' : 'text-left'}`}>
                {result.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (trimmed === '') return <div key={i} className="h-2" />;
                  // 中文行或包含冒号的标签行，直接当文字显示
                  if (/^[\u4e00-\u9fa5]/.test(trimmed) || /^[a-zA-Z\s]*[：:]/.test(trimmed)) {
                    return (
                      <div key={i} className="text-xs text-emerald-400/70">
                        {line}
                      </div>
                    );
                  }
                  // 普通表达式行，走公式渲染
                  return (
                    <div key={i} className={align === 'right' ? 'text-right' : 'text-left'}>
                      <MathRenderer expression={line} isInput />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-emerald-300 font-mono text-lg whitespace-pre-wrap break-all leading-relaxed">
                {result}
              </div>
            )}

            {showSteps && steps && steps.length > 0 && (
              <div className="pt-4 border-t border-emerald-800/40 space-y-2 page-fade-in">
                <p className="text-xs text-amber-400/80 font-medium flex items-center gap-1.5">
                  <ListOrdered className="size-3.5" />
                  计算步骤详解
                </p>
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 bg-emerald-900/20 border border-emerald-800/30 rounded-lg p-3"
                  >
                    <div className="shrink-0 size-5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-emerald-200/90 mb-1.5">
                        {step.description}
                      </p>
                      <div className="bg-muted rounded px-2.5 py-1.5 border border-border">
                        <MathRenderer expression={step.latex ?? step.formula} isInput={!step.latex} className="text-emerald-300 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-emerald-500/40 italic text-center py-6 flex flex-col items-center gap-1">
            <Lightbulb className="size-5 text-emerald-500/30" />
            <p>{emptyTitle}</p>
            <p className="text-xs text-emerald-500/50">{emptyDescription}</p>
            {exampleHint && onExampleClick && (
              <button
                type="button"
                onClick={onExampleClick}
                className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              >
                试试示例：{exampleHint}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const ComputationResult = memo(ComputationResultInner);
export default ComputationResult;
