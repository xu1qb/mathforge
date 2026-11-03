import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { memo } from 'react';

export interface ThemeToggleProps {
  variant?: 'sidebar' | 'header';
  size?: 'sm' | 'default' | 'icon';
}

function ThemeToggle({ variant = 'header', size = 'icon' }: ThemeToggleProps) {
  const { theme, mode, setMode } = useTheme();

  const Icon = mode === 'system' ? Monitor : theme === 'dark' ? Moon : Sun;

  const label =
    mode === 'system' ? '跟随系统' : theme === 'dark' ? '深色模式' : '浅色模式';

  if (variant === 'sidebar') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
             type="button"
             className="flex items-center justify-center size-8 rounded-lg bg-sidebar-accent/60 border border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-primary hover:border-sidebar-primary/40 transition-colors"
             title={`主题：${label}`}
           >
            <Icon className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-36">
          <DropdownMenuItem onClick={() => setMode('light')} className="gap-2">
            <Sun className="size-4" />
            <span>浅色模式</span>
            {mode === 'light' && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode('dark')} className="gap-2">
            <Moon className="size-4" />
            <span>深色模式</span>
            {mode === 'dark' && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode('system')} className="gap-2">
            <Monitor className="size-4" />
            <span>跟随系统</span>
            {mode === 'system' && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} className="size-9 px-0" title={`主题：${label}`}>
          <Icon className="size-4" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={() => setMode('light')} className="gap-2">
          <Sun className="size-4" />
          <span>浅色模式</span>
          {mode === 'light' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('dark')} className="gap-2">
          <Moon className="size-4" />
          <span>深色模式</span>
          {mode === 'dark' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('system')} className="gap-2">
          <Monitor className="size-4" />
          <span>跟随系统</span>
          {mode === 'system' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default memo(ThemeToggle);
