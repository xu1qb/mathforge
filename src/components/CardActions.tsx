// EXPORTS: CardActions
import { useState, useCallback, memo } from 'react';
import { Copy, Check, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { copyAsLatex, copyAsText } from '@/lib/export-utils';
import { FavoriteStar } from '@/components/FavoritesPanel';

export interface CardActionsProps {
  /** 要复制的文本（纯文本） */
  text: string;
  /** LaTeX 源码（优先复制 LaTeX） */
  latex?: string;
  /** 收藏时的模块 key（传了才显示收藏按钮） */
  favoriteModuleKey?: string;
  /** 收藏时的模块 label */
  favoriteModuleLabel?: string;
  /** 收藏时的表达式标题 */
  favoriteExpression?: string;
  /** 收藏时的结果文本 */
  favoriteResult?: string;
  /** 收藏时的结果 LaTeX */
  favoriteResultLatex?: string;
  /** 打印时的标题 */
  printTitle?: string;
  /** 打印时的额外内容节点（如果不传则只打印 text） */
  printContent?: React.ReactNode;
  /** 额外 className */
  className?: string;
  /** 图标大小 */
  size?: 'sm' | 'md';
  /** 是否显示打印按钮 */
  showPrint?: boolean;
  /** 是否显示收藏按钮 */
  showFavorite?: boolean;
}

function CardActionsInner({
  text,
  latex,
  favoriteModuleKey,
  favoriteModuleLabel,
  favoriteExpression,
  favoriteResult,
  favoriteResultLatex,
  printTitle = 'MathForge',
  printContent,
  className,
  size = 'sm',
  showPrint = true,
  showFavorite = true,
}: CardActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text && !latex) return;
    setCopied(true);
    try {
      if (latex) {
        await copyAsLatex(latex);
      } else {
        await copyAsText(text);
      }
    } catch {
      toast.error('复制失败');
    }
    setTimeout(() => setCopied(false), 1500);
  }, [text, latex]);

  const handlePrint = useCallback(() => {
    // 创建只含卡片内容的打印窗口
    const printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) {
      toast.error('无法打开打印窗口，请检查弹窗拦截');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${printTitle} - MathForge</title>
        <style>
          @media print { body { margin: 0; } }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${typeof printContent === 'string' ? printContent : ''}
        ${!printContent ? `<div style="padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px;">${printTitle}</h2>
          <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.6; padding: 16px; background: #f5f5f5; border-radius: 8px;">${text}</pre>
        </div>` : ''}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  }, [text, printTitle, printContent]);

  const iconSize = size === 'md' ? 'size-4' : 'size-3.5';
  const btnHeight = size === 'md' ? 'h-8 w-8' : 'h-7 w-7';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 复制 */}
      <Button
        size="icon"
        variant="ghost"
        className={cn(btnHeight, 'text-muted-foreground hover:text-foreground hover:bg-accent')}
        onClick={handleCopy}
        title={copied ? '已复制' : latex ? '复制 LaTeX' : '复制'}
        aria-label="复制"
      >
        {copied ? <Check className={cn(iconSize, 'text-emerald-600 dark:text-emerald-400')} /> : <Copy className={iconSize} />}
      </Button>

      {/* 收藏 */}
      {showFavorite && favoriteModuleKey && (
        <FavoriteStar
          moduleKey={favoriteModuleKey}
          moduleLabel={favoriteModuleLabel || favoriteModuleKey}
          expression={favoriteExpression || text}
          result={favoriteResult || text}
          resultLatex={favoriteResultLatex || latex}
          size={size === 'md' ? 'md' : 'sm'}
        />
      )}

      {/* 打印 */}
      {showPrint && (
        <Button
          size="icon"
          variant="ghost"
          className={cn(btnHeight, 'text-muted-foreground hover:text-foreground hover:bg-accent')}
          onClick={handlePrint}
          title="打印"
          aria-label="打印"
        >
          <Printer className={iconSize} />
        </Button>
      )}
    </div>
  );
}

const CardActions = memo(CardActionsInner);
export default CardActions;
