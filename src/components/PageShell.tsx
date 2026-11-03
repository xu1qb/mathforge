// EXPORTS: PageShell
// 页面骨架：统一「返回 / 标题 / 说明 / 右侧动作 / 内容宽度」。
// 用法：
//   <PageShell title="解题流程图" description="…" width="reading" back actions={<Button/>}>
//     …
//   </PageShell>
// 宽度三档，别再用裸 max-w-*：
//   reading 3xl（讲解、流程、阅读型）
//   tool    4xl（计算器、学科工具）
//   wide    6xl（总览、竞赛、看板）

import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export type PageWidth = 'reading' | 'tool' | 'wide';

const WIDTH: Record<PageWidth, string> = {
  reading: 'max-w-3xl',
  tool: 'max-w-4xl',
  wide: 'max-w-6xl',
};

interface PageShellProps {
  title: string;
  description?: string;
  width?: PageWidth;
  /** 是否显示返回按钮 */
  back?: boolean;
  /** 右侧动作区（语法速查、打印、切换等） */
  actions?: ReactNode;
  /** 标题下方/上方的额外一行（标签、筛选等） */
  subheader?: ReactNode;
  /** 标题上的小字前缀，如「第三讲 · 分析学」 */
  eyebrow?: string;
  /** 语法速查回调：传入则在右侧渲染按钮（旧 PageHeader 的能力） */
  onCheatsheet?: () => void;
  /** 是否在右侧显示主题切换（默认显示，与旧 PageHeader 对齐） */
  showThemeToggle?: boolean;
  /** 不传 children 时进入「仅页头」模式：不包外层 padding/宽度，供沿用自有内容容器的页面使用 */
  children?: ReactNode;
  className?: string;
}

export default function PageShell({
  title,
  description,
  width = 'tool',
  back = false,
  actions,
  subheader,
  eyebrow,
  onCheatsheet,
  showThemeToggle = true,
  children,
  className,
}: PageShellProps) {
  const navigate = useNavigate();
  const headerOnly = children === undefined;

  return (
    <div
      className={cn(
        'mx-auto w-full px-4 md:px-6',
        WIDTH[width],
        !headerOnly && 'py-6',
        className
      )}
    >
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> 返回
        </button>
      )}

      <header className="mb-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </div>
            )}
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {onCheatsheet && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onCheatsheet}>
                <BookOpen className="size-4" />
                <span className="hidden sm:inline">语法速查</span>
              </Button>
            )}
            {actions}
            {showThemeToggle && (
              <>
                <div className="hidden md:block">
                  <ThemeToggle variant="header" />
                </div>
                <div className="md:hidden">
                  <ThemeToggle variant="header" size="icon" />
                </div>
              </>
            )}
          </div>
        </div>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
        {subheader && <div className="mt-3">{subheader}</div>}
      </header>

      {children}
    </div>
  );
}
