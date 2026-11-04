import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, GraduationCap, BookOpen, Flame, BookMarked,
  Brain, Gift, PenSquare, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const MENU_ITEMS: MenuItem[] = [
  { path: '/', label: '首页', icon: <Home className="size-5" />, color: 'bg-rose-500' },
  { path: '/practice', label: '练习', icon: <GraduationCap className="size-5" />, color: 'bg-emerald-500' },
  { path: '/formulas', label: '公式', icon: <BookOpen className="size-5" />, color: 'bg-sky-500' },
  { path: '/competition', label: '竞赛', icon: <Flame className="size-5" />, color: 'bg-amber-500' },
  { path: '/spellbook', label: '咒语', icon: <BookMarked className="size-5" />, color: 'bg-violet-500' },
  { path: '/mathematician-quiz', label: '测试', icon: <Brain className="size-5" />, color: 'bg-pink-500' },
  { path: '/blind-box', label: '盲盒', icon: <Gift className="size-5" />, color: 'bg-teal-500' },
  { path: '/teacher', label: '出题', icon: <PenSquare className="size-5" />, color: 'bg-orange-500' },
];

// 曾经是半径 80 的环形菜单：锚在右下角，展开后右侧必然出屏
// （环形最右点 = 圆心 + 半径 + 半个按钮 = 超出视口 60px+），
// 往左推又会压到中间的开关按钮上。改成上方弹出 2x4 网格，位置永远确定。
export default function RadialMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 点击其他地方关闭
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    const timer = window.setTimeout(() => document.addEventListener('click', handler), 100);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('click', handler);
    };
  }, [open]);

  return (
    <div className="radial-menu fixed bottom-24 right-4 z-50">
      {/* 弹出面板：4 列 x 2 行，右对齐到按钮上方，永远在视口内 */}
      <div
        className={cn(
          'absolute bottom-full right-0 mb-3 grid grid-cols-[repeat(4,3rem)] gap-2 rounded-2xl border border-border',
          'bg-popover/95 p-2 shadow-xl backdrop-blur transition-all duration-200 ease-out',
          open ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'
        )}
      >
        {MENU_ITEMS.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={(e) => {
                e.stopPropagation();
                navigate(item.path);
                setOpen(false);
              }}
              title={item.label}
              aria-label={item.label}
              className={cn(
                'size-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform duration-200 hover:scale-110',
                item.color,
                isActive && 'ring-2 ring-offset-2 ring-offset-background'
              )}
              style={{ transitionDelay: open ? String(i * 25) + 'ms' : '0ms' }}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* 中心按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={open ? '收起导航' : '打开导航'}
        className={cn(
          'relative size-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105',
          open && 'rotate-90'
        )}
      >
        {open ? <X className="size-6" /> : <Flame className="size-6" />}
      </button>
    </div>
  );
}
