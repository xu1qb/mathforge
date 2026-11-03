import { useState, useRef, useCallback } from 'react';
import { Eye, EyeOff, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MathRenderer from '@/components/MathRenderer';
import SymbolPalette from './SymbolPalette';
import { cn } from '@/lib/utils';

interface MathInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  label?: string;
  /** 多行模式 */
  multiline?: boolean;
  rows?: number;
  className?: string;
  /** 默认是否显示预览 */
  defaultPreview?: boolean;
  /** 是否显示符号面板（可展开） */
  showPalette?: boolean;
  /** 面板默认展开 */
  paletteDefaultOpen?: boolean;
  /** 输入框 id，方便 label 关联 */
  id?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

export default function MathInputField({
  value,
  onChange,
  onKeyDown,
  placeholder,
  label,
  multiline = false,
  rows = 3,
  className,
  defaultPreview = true,
  showPalette = true,
  paletteDefaultOpen = false,
  id,
  disabled = false,
}: MathInputFieldProps) {
  const [showPreview, setShowPreview] = useState(defaultPreview);
  const [paletteOpen, setPaletteOpen] = useState(paletteDefaultOpen);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const togglePreview = useCallback(() => {
    setShowPreview((v) => !v);
  }, []);

  const togglePalette = useCallback(() => {
    setPaletteOpen((v) => !v);
  }, []);

  const ref = (multiline ? textareaRef : inputRef) as React.RefObject<HTMLInputElement | HTMLTextAreaElement>;

  const hasContent = value.trim().length > 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-foreground/90"
          >
            {label}
          </label>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={togglePreview}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title={showPreview ? '关闭公式预览' : '开启公式预览'}
            disabled={disabled}
          >
            {showPreview ? (
              <><Eye className="size-3.5 mr-1" /> 预览</>
            ) : (
              <><EyeOff className="size-3.5 mr-1" /> 预览</>
            )}
          </Button>
          {showPalette && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePalette}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              title={paletteOpen ? '收起符号面板' : '展开符号面板'}
              disabled={disabled}
            >
              <Keyboard className="size-3.5 mr-1" />
              符号
              {paletteOpen ? ' ▲' : ' ▼'}
            </Button>
          )}
        </div>
      </div>

      {/* 自然书写预览 */}
      {showPreview && hasContent && (
        <div className="bg-muted/50 border border-border rounded-lg px-3 py-2 overflow-x-auto">
          <div className="text-xs text-muted-foreground mb-1 font-medium">自然书写预览</div>
          <div className="min-h-[28px] flex items-center justify-center">
            <MathRenderer expression={value} isInput displayMode={false} />
          </div>
        </div>
      )}

      {/* 输入框 */}
      {multiline ? (
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 rounded-lg',
            'bg-card border border-input',
            'text-sm font-mono text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'transition-colors resize-y',
            disabled && 'opacity-60 cursor-not-allowed',
          )}
          spellCheck={false}
        />
      ) : (
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 h-10 rounded-lg',
            'bg-card border border-input',
            'text-sm font-mono text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'transition-colors',
            disabled && 'opacity-60 cursor-not-allowed',
          )}
          spellCheck={false}
        />
      )}

      {/* 符号面板 */}
      {showPalette && paletteOpen && !disabled && (
        <SymbolPalette
          inputRef={ref}
          value={value}
          onChange={onChange}
          inline
          className="border border-border/60 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden p-0"
        />
      )}
    </div>
  );
}
