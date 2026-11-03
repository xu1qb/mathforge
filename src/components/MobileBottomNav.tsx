import { NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart3, BookOpen, Flame, Menu, Search } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NAV_GROUPS } from '@/components/AppSidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const BOTTOM_ITEMS = [
  { path: '/', label: '首页', icon: Home },
  { path: '/practice', label: '练习', icon: BarChart3 },
  { path: '/formulas', label: '公式', icon: BookOpen },
  { path: '/competition', label: '竞赛', icon: Flame },
];

export default function MobileBottomNav() {
  const { skin } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleSidebar } = useSidebar();

  const activeColor =
    skin === 'night' ? 'hsl(42 90% 55%)' :
    skin === 'paper' ? 'hsl(28 40% 35%)' :
    skin === 'pixel' ? '#7dff9a' :
    skin === 'journal' ? '#c0392b' :
    'hsl(170 60% 32%)';

  const bgColor =
    skin === 'night' ? 'hsl(222 25% 11%)' :
    skin === 'paper' ? 'hsl(45 35% 92%)' :
    skin === 'pixel' ? '#1a2f23' :
    skin === 'journal' ? '#f6efe2' :
    '#f8fafc';

  const dividerColor =
    skin === 'night' ? 'rgba(245,158,11,0.15)' :
    skin === 'paper' ? 'rgba(74,63,53,0.12)' :
    skin === 'pixel' ? '#0d120e' :
    skin === 'journal' ? 'rgba(242,196,196,0.4)' :
    'rgba(0,0,0,0.06)';

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch pl-2 pr-1 pt-1 select-none"
        style={{
          backgroundColor: bgColor,
          borderTop: `1px solid ${dividerColor}`,
          minHeight: '56px',
          paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
          boxShadow:
            skin === 'pixel'
              ? '0 -4px 0 0 #0d120e'
              : '0 -1px 3px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 relative rounded-md',
                'active:translate-y-[1px] transition-transform',
              )}
              style={{
                color: isActive ? activeColor : 'currentColor',
                opacity: isActive ? 1 : 0.6,
              }}
            >
              <div
                className="flex items-center justify-center rounded-md"
                style={{
                  width: '36px',
                  height: '32px',
                  background:
                    skin === 'pixel'
                      ? isActive
                        ? '#1f3a2b'
                        : 'transparent'
                      : isActive
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.04) 100%)'
                      : 'transparent',
                  boxShadow:
                    skin === 'pixel'
                      ? isActive
                        ? '2px 2px 0 0 #0d120e'
                        : 'none'
                      : isActive
                      ? 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.08)'
                      : 'none',
                  border: isActive && skin !== 'pixel' ? `1px solid ${activeColor}30` : 'none',
                }}
              >
                <Icon className="size-5" style={{ strokeWidth: 2 }} />
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 500,
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* 更多菜单 */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              className="w-14 flex flex-col items-center justify-center gap-0.5 relative rounded-md active:translate-y-[1px] transition-transform"
              style={{ opacity: 0.6 }}
              onClick={() => toggleSidebar?.()}
            >
              <div
                className="flex items-center justify-center rounded-md"
                style={{ width: '36px', height: '32px' }}
              >
                <Menu className="size-5" style={{ strokeWidth: 2 }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 500, lineHeight: 1 }}>更多</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="py-4 space-y-4 overflow-y-auto h-full">
              {/* 快捷动作：搜索 */}
              <div className="px-3">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('mathforge:open-search'));
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                >
                  <Search className="size-4" />
                  <span className="flex-1 text-left font-medium">全局搜索 / 命令</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-background/60 text-xs font-mono text-muted-foreground">⌘K</kbd>
                </button>
              </div>
              {NAV_GROUPS.map((group) => (
                <div key={group.name} className="px-3">
                  <div className="text-xs font-medium text-muted-foreground px-3 mb-2">{group.name}</div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon ?? Home;
                      const isActive =
                        item.path === '/'
                          ? location.pathname === '/'
                          : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.path === '/'}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-accent',
                          )}
                        >
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
}
