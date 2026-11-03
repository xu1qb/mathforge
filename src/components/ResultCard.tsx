import { useState, memo, useCallback } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Download,
  Share2,
  FileText,
  Code,
  Calculator,
  Type,
  Clock,
  Loader2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ListOrdered,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { resolveAppUrl } from '@/lib/lark-mock';
import MathRenderer from '@/components/MathRenderer';
import { copyAsText, copyAsLatex, copyAsMarkdown, exportTextFile } from '@/lib/export-utils';
import type { StepItem } from '@/lib/step-by-step';
import CardActions from '@/components/CardActions';

export interface ResultCardProps {
  /** 符号形式结果（精确表达式字符串） */
  exactValue: string;
  /** 小数形式结果（数值字符串） */
  decimalValue: string;
  /** 是否有精确形式 */
  hasExact?: boolean;
  /** 标题，如"计算结果" */
  title?: string;
  /** 副标题/公式说明 */
  subtitle?: string;
  /** 多行结果时用 pre-wrap，单行用 truncate */
  multiline?: boolean;
  /** 自定义结果区高度 */
  minHeight?: string;
  /** 额外 className */
  className?: string;
  /** 是否显示复制按钮 */
  showCopy?: boolean;
  /** 是否显示导出下拉 */
  showExport?: boolean;
  /** 是否显示分享按钮（URL 参数编码） */
  showShare?: boolean;
  /** 分享用的输入字符串，用于拼到 URL 参数里 */
  shareInput?: string;
  /** 当前模块路径，分享时用 */
  modulePath?: string;
  /** 结果是否是 LaTeX 格式（决定导出选项） */
  isLatex?: boolean;
  /** 是否启用公式排版显示 */
  showFormatted?: boolean;
  /** 计算完成时间戳 */
  timestamp?: number;
  /** 是否 loading */
  loading?: boolean;
  /** 空状态标题 */
  emptyTitle?: string;
  /** 空状态描述 */
  emptyDescription?: string;
  /** 空状态示例提示 */
  emptyExample?: string;
  /** 空状态示例点击回调 */
  onEmptyExample?: () => void;
  /** 步骤详解数据（可选） */
  steps?: StepItem[];
  /** 步骤标题（如"求解步骤"） */
  stepsTitle?: string;
  /** 计算表达式（用于 Markdown 复制） */
  expression?: string;
}

export default memo(function ResultCard({
  exactValue,
  decimalValue,
  hasExact = true,
  title = '计算结果',
  subtitle,
  multiline = true,
  minHeight = '3rem',
  className,
  showCopy = true,
  showExport = true,
  showShare = false,
  shareInput = '',
  modulePath = '',
  showFormatted = true,
  timestamp,
  loading = false,
  emptyTitle = '等待计算',
  emptyDescription = '输入表达式后点击计算，结果将显示在这里',
  emptyExample,
  onEmptyExample,
  steps,
  stepsTitle = '计算步骤',
  expression = '',
}: ResultCardProps) {
  const [showExact] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted');
  const [showSteps, setShowSteps] = useState(false);

  const displayValue = showExact ? exactValue : decimalValue;
  const hasContent = displayValue !== '';

  const handleCopyText = useCallback(async () => {
    if (!displayValue) return;
    setCopied(true);
    await copyAsText(displayValue);
    setTimeout(() => setCopied(false), 1500);
  }, [displayValue]);

  const handleCopyLatex = useCallback(async () => {
    const latex = showExact ? exactValue : decimalValue;
    if (!latex) return;
    await copyAsLatex(latex);
  }, [showExact, exactValue, decimalValue]);

  const handleCopyMarkdown = useCallback(() => {
    if (!displayValue) return;
    const body = expression ? `${expression}\n\n结果: ${displayValue}` : displayValue;
    copyAsMarkdown(title, displayValue, subtitle || body);
  }, [displayValue, title, subtitle, expression]);

  const handleDownload = useCallback(() => {
    if (!displayValue) return;
    const lines: string[] = [`MathForge - ${title}`];
    if (subtitle) lines.push(`说明: ${subtitle}`);
    if (expression) lines.push(`表达式: ${expression}`);
    lines.push(`时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push('');
    lines.push('--- 结果 ---');
    if (hasExact) lines.push(`精确形式: ${exactValue}`);
    lines.push(`小数形式: ${decimalValue}`);
    if (steps && steps.length > 0) {
      lines.push('');
      lines.push(`--- ${stepsTitle} ---`);
      steps.forEach((s, i) => {
        lines.push(`${i + 1}. ${s.description}`);
        lines.push(`   ${s.formula}`);
      });
    }
    lines.push('');
    exportTextFile(lines.join('\n'), `mathforge-result-${Date.now()}.txt`);
  }, [displayValue, title, subtitle, expression, hasExact, exactValue, decimalValue, steps, stepsTitle]);

  const handleShare = useCallback(async () => {
    if (!modulePath || !shareInput) return;
    try {
      const params = new URLSearchParams();
      params.set('input', shareInput);
      params.set('result', displayValue);
      const shareUrl = `${window.location.origin}${resolveAppUrl(modulePath)}?${params.toString()}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('分享链接已复制');
    } catch {
      toast.error('生成分享链接失败');
    }
  }, [modulePath, shareInput, displayValue]);

  return (
    <div
      className={cn(
        'journal-card bg-card border-border rounded-xl overflow-hidden transition-all',
        className,
      )}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h3 className="text-sm font-semibold text-foreground truncate">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* 统一卡片操作：复制/收藏/打印 */}
          {hasContent && (
            <CardActions
              text={decimalValue}
              latex={hasExact ? exactValue : undefined}
              favoriteModuleKey={modulePath ? modulePath.replace(/^\//, '') : ''}
              favoriteModuleLabel={title}
              favoriteExpression={expression}
              favoriteResult={decimalValue}
              favoriteResultLatex={hasExact ? exactValue : undefined}
              printTitle={title}
              size="sm"
              showFavorite={!!modulePath}
            />
          )}
          {showFormatted && hasContent && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode((m) => (m === 'formatted' ? 'text' : 'formatted'))}
              className="h-7 px-2 text-xs text-muted-foreground dark:text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              title={viewMode === 'formatted' ? '切换到文本模式' : '切换到公式排版'}
            >
              {viewMode === 'formatted' ? (
                <Calculator className="size-3.5" />
              ) : (
                <Type className="size-3.5" />
              )}
            </Button>
          )}
          {showExport && hasContent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-muted-foreground dark:text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                >
                  <Download className="size-3.5 mr-1" />
                  导出
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                 <DropdownMenuLabel>复制 / 导出</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleCopyText}>
                   <FileText className="size-4 mr-2 text-muted-foreground" />
                   <span>复制纯文本</span>
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleCopyLatex}>
                   <Code className="size-4 mr-2 text-muted-foreground" />
                   <span>复制 LaTeX</span>
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleCopyMarkdown}>
                   <Copy className="size-4 mr-2 text-muted-foreground" />
                   <span>复制 Markdown</span>
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleDownload}>
                   <Download className="size-4 mr-2 text-muted-foreground" />
                   <span>下载 .txt 文件</span>
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showShare && shareInput && hasContent && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="h-7 px-2 text-xs text-muted-foreground dark:text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              title="生成分享链接"
            >
              <Share2 className="size-3.5" />
            </Button>
          )}
           {showCopy && !showExport && hasContent && (
             <Button
               size="sm"
               variant="ghost"
               onClick={handleCopyText}
               className="h-7 px-2 text-xs text-muted-foreground dark:text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
             >
               {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5 mr-1" />}
               {copied ? '已复制' : '复制'}
             </Button>
           )}
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-4 py-4">
        {subtitle && (
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-2 font-medium">
            {subtitle}
          </p>
        )}
        <div
          className={cn(
            'bg-muted/50 rounded-lg px-3 py-2.5',
            'border border-border',
            multiline ? 'min-h-[3rem]' : 'min-h-[2.5rem] flex items-center',
          )}
          style={{ minHeight }}
        >
          {hasContent ? (
            viewMode === 'formatted' && showFormatted ? (
              <div className="overflow-x-auto py-1">
                <MathRenderer expression={displayValue} displayMode={!multiline ? false : true} isInput />
              </div>
            ) : (
              <code
                className={cn(
                  'text-sm font-mono text-emerald-700 dark:text-emerald-400',
                  multiline ? 'whitespace-pre-wrap break-all leading-relaxed block' : 'truncate flex-1',
                )}
              >
                {displayValue}
              </code>
            )
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground dark:text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">计算中...</span>
            </div>
          ) : emptyExample ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <Lightbulb className="size-5 text-muted-foreground dark:text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">{emptyTitle}</p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-2">{emptyDescription}</p>
              {onEmptyExample && (
                <button
                  type="button"
                  onClick={onEmptyExample}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2"
                >
                  试试示例：{emptyExample}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground dark:text-muted-foreground italic text-center py-3">
              {emptyDescription}
            </p>
          )}
        </div>
        {/* 步骤详解展开区 */}
        {steps && steps.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setShowSteps((s) => !s)}
              className="w-full flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors px-1 py-1"
            >
              <span className="flex items-center gap-1.5">
                <ListOrdered className="size-3.5" />
                {showSteps ? '隐藏步骤' : '显示步骤'}
                <span className="text-muted-foreground dark:text-muted-foreground font-normal">
                  ({steps.length} 步)
                </span>
              </span>
              {showSteps ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
            {showSteps && (
              <div className="mt-3 space-y-2 page-fade-in">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-3"
                  >
                    <div className="shrink-0 size-5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground mb-1.5">
                        {step.description}
                      </p>
                      <div className="bg-card rounded px-2.5 py-1.5 border border-emerald-100 dark:border-emerald-900/20 overflow-x-auto">
                        <MathRenderer
                          expression={step.formula}
                          isInput
                          className="text-xs text-emerald-700 dark:text-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {timestamp && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground dark:text-muted-foreground">
            <Clock className="size-3" />
            <span>计算时间：{new Date(timestamp).toLocaleString('zh-CN')}</span>
          </div>
        )}
      </div>
    </div>
  );
});
