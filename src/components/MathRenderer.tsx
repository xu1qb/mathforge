import { memo, useState, useEffect } from 'react';
import katex from 'katex';
import { logger } from '@/lib/lark-mock';
import { cn } from '@/lib/utils';
import { expressionToLatex } from '@/lib/expression-to-latex';
import { useTheme } from '@/hooks/useTheme';
import { copyToClipboard } from '@/lib/lark-mock';
import { toast } from 'sonner';

interface MathRendererProps {
  /** LaTeX 或 math.js 表达式字符串 */
  expression: string;
  /** 是否用 display 模式（块级、居中、更大） */
  displayMode?: boolean;
  /** 是否是输入模式（用 math.js 语法，需转换为 LaTeX） */
  isInput?: boolean;
  className?: string;
  /** 是否允许点击复制（display 公式和非输入态允许） */
  copyable?: boolean;
}

/**
 * 括号匹配完整性检查
 */
function checkBracketBalance(expr: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { '{': '}', '(': ')', '[': ']' };
  const closing = new Set(['}', ')', ']']);
  let i = 0;
  while (i < expr.length) {
    if (expr[i] === '\\') {
      i += 2;
      continue;
    }
    const ch = expr[i];
    if (pairs[ch]) {
      stack.push(pairs[ch]);
    } else if (closing.has(ch)) {
      if (stack.length === 0 || stack.pop() !== ch) {
        return false;
      }
    }
    i++;
  }
  return stack.length === 0;
}

function MathRendererInner({ expression, displayMode = false, isInput = false, className, copyable }: MathRendererProps) {
  const [html, setHtml] = useState<string>('');
  const [renderFailed, setRenderFailed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { skin } = useTheme();

  // 是否可复制：display 模式且渲染成功且非输入态；或显式传 copyable
  const canCopy = copyable !== undefined ? copyable : (displayMode && !isInput);

  useEffect(() => {
    if (!expression) {
      setHtml('');
      setRenderFailed(false);
      return;
    }

    let latex = expression;
    if (isInput) {
      latex = expressionToLatex(expression);
    }

    const bracketsOk = checkBracketBalance(latex);
    if (!bracketsOk) {
      setHtml('');
      setRenderFailed(true);
      return;
    }

    try {
      const result = katex.renderToString(latex, {
        displayMode,
        throwOnError: true,
        strict: false,
        output: 'html',
      });
      setHtml(result);
      setRenderFailed(false);
    } catch (err) {
      logger.warn('MathRenderer render failed:', String(err));
      // 二次兜底：非严格模式渲染，KaTeX 会把出错片段标红内联，避免整题显示“公式渲染失败”
      try {
        const fallback = katex.renderToString(latex, {
          displayMode,
          throwOnError: false,
          strict: false,
          output: 'html',
        });
        setHtml(fallback);
        setRenderFailed(false);
        return;
      } catch (fallbackErr) {
        logger.warn('MathRenderer fallback render failed:', String(fallbackErr));
      }
      setHtml('');
      setRenderFailed(true);
    }
  }, [expression, displayMode, isInput]);

  const handleCopy = async () => {
    // 复制 LaTeX 源码
    let latex = expression;
    if (isInput) {
      latex = expressionToLatex(expression);
    }
    try {
      await copyToClipboard(latex);
      toast.success('已复制 LaTeX', { duration: 1500 });
    } catch {
      toast.error('复制失败');
    }
  };

  if (!expression) {
    return <span className="text-muted-foreground dark:text-muted-foreground italic text-sm">—</span>;
  }

  // 渲染失败降级
  if (renderFailed || !html) {
    const fallback = (
      <span
        className={cn(
          'math-renderer math-renderer-fallback',
          'text-muted-foreground/60 text-xs italic',
          displayMode && 'block text-center py-2',
          className,
        )}
      >
        公式渲染失败
      </span>
    );
    if (displayMode) {
      return <div className="overflow-x-auto w-full">{fallback}</div>;
    }
    return fallback;
  }

  // 粉笔式下划线颜色
  const underlineColor =
    skin === 'night' ? 'hsl(42 90% 55%)' :
    skin === 'paper' ? 'hsl(28 40% 35%)' :
    skin === 'pixel' ? '#7dff9a' :
    skin === 'journal' ? '#c0392b' :
    'hsl(170 60% 35%)';

  const rendered = (
    <span
      className={cn(
        'math-renderer text-foreground relative inline-block align-middle',
        displayMode && 'block text-center py-1',
        'min-h-[1.5em]',
        !html && renderFailed === false && expression && 'text-transparent',
        canCopy && 'cursor-pointer select-none',
        className,
      )}
      onMouseEnter={() => canCopy && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={canCopy ? handleCopy : undefined}
      title={canCopy ? '点击复制 LaTeX' : undefined}
    >
      <span dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />
      {/* 粉笔手绘感下划线：hover 时显现 */}
      {canCopy && isHovered && (
        <span
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            bottom: '-2px',
            height: '3px',
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 4' preserveAspectRatio='none'>
                <path d='M1,2 Q30,0.8 60,2 T120,2 T180,2 T200,2' fill='none' stroke='${underlineColor}' stroke-width='2' stroke-linecap='round'/>
              </svg>`,
            )}")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '100% 100%',
            opacity: 0.85,
          }}
          aria-hidden
        />
      )}
    </span>
  );

  // display 模式自动包横向滚动容器
  if (displayMode) {
    return (
      <div className={cn(
        'overflow-x-auto w-full min-h-[2.5em]',
        !html && renderFailed === false && expression && 'bg-muted/20 rounded-md',
      )}>
        {rendered}
      </div>
    );
  }

  return rendered;
}

const MathRenderer = memo(MathRendererInner);
export default MathRenderer;
