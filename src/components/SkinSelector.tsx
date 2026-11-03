import { useTheme, type SkinType } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette, Check, Moon, FileText, Gamepad2, StickyNote } from 'lucide-react';

const SKINS: { key: SkinType; label: string; desc: string; icon: typeof Moon; colors: string[] }[] = [
  {
    key: 'night',
    label: '夜航',
    desc: '墨蓝黑底 · 台灯琥珀',
    icon: Moon,
    colors: ['hsl(222 25% 9%)', 'hsl(42 90% 55%)', 'hsl(45 30% 92%)'],
  },
  {
    key: 'paper',
    label: '草稿纸',
    desc: '米黄纸色 · 横线纹理',
    icon: FileText,
    colors: ['hsl(45 35% 94%)', 'hsl(170 45% 30%)', 'hsl(25 20% 22%)'],
  },
  {
    key: 'pixel',
    label: '像素闯关',
    desc: '8-bit 游戏风 · 荧光绿',
    icon: Gamepad2,
    colors: ['#1a2f23', '#7dff9a', '#ffd93d'],
  },
  {
    key: 'journal',
    label: '手账拼贴',
    desc: '便签纸 · 胶带贴纸',
    icon: StickyNote,
    colors: ['#f6efe2', '#c0392b', '#f2c4c4'],
  },
];

interface SkinSelectorProps {
  variant?: 'sidebar' | 'header';
}

export default function SkinSelector({ variant = 'header' }: SkinSelectorProps) {
  const { skin, setSkin } = useTheme();

  const current = SKINS.find((s) => s.key === skin) ?? SKINS[0];

  if (variant === 'sidebar') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-sidebar-foreground/50">皮肤</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Palette className="size-3.5 mr-1" />
                {current.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>选择皮肤</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SKINS.map((s) => {
                const active = skin === s.key;
                return (
                  <DropdownMenuItem
                    key={s.key}
                    onClick={() => setSkin(s.key)}
                    className="gap-2"
                  >
                    <div className="flex gap-0.5">
                      {s.colors.map((c, i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 rounded-sm border border-border"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.desc}</div>
                    </div>
                    {active && <Check className="size-3 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // header variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="切换皮肤">
          <Palette className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>选择皮肤</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SKINS.map((s) => {
          const active = skin === s.key;
          return (
            <DropdownMenuItem
              key={s.key}
              onClick={() => setSkin(s.key)}
              className="gap-3 py-2"
            >
              <div className="size-8 rounded-md border border-border flex items-center justify-center overflow-hidden shrink-0">
                <div className="w-full h-full flex">
                  {s.colors.map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
              {active && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
