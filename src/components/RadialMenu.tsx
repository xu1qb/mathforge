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

export default function RadialMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 点击其他地方关闭
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    setTimeout(() => document.addEventListener('click', handler), 100);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const radius = 80;

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* 轮盘项 */}
      {MENU_ITEMS.map((item, i) => {
        const angle = (i / MENU_ITEMS.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={(e) => {
              e.stopPropagation();
              navigate(item.path);
              setOpen(false);
            }}
            className={cn(
              'absolute size-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ease-out',
              item.color,
              open
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-0 pointer-events-none',
              isActive && 'ring-2 ring-offset-2 ring-offset-background',
            )}
            style={{
              transform: open
                ? `translate(${x}px, ${y}px) scale(1)`
                : 'translate(0, 0) scale(0)',
              transitionDelay: open ? `${i * 30}ms` : '0ms',
            }}
            title={item.label}
          >
            {item.icon}
          </button>
        );
      })}

      {/* 中心按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={cn(
          'relative size-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105',
          open && 'rotate-90',
        )}
      >
        {open ? <X className="size-6" /> : <Flame className="size-6" />}
      </button>
    </div>
  );
}
