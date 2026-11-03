import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AppSidebar, { SidebarProvider, SidebarInset } from '@/components/AppSidebar';
import FavoritesPanel from '@/components/FavoritesPanel';
import FormulaQuickSheet from '@/components/FormulaQuickSheet';
import MobileBottomNav from '@/components/MobileBottomNav';
import StudyBuddy from '@/components/StudyBuddy';
import RadialMenu from '@/components/RadialMenu';
import { useLastVisited } from '@/hooks/use-last-visited';
import { useAutoFocusFirstInput } from '@/hooks/use-auto-focus';
import { recordModuleUsage } from '@/hooks/use-recent-modules';
import { BookOpenText } from 'lucide-react';

const IGNORED_PATHS = new Set(['/', '/home', '/404', '/not-found']);

/** 记录今日学习时长（秒），每分钟更新一次 */
function useStudyTimer() {
  useEffect(() => {
    const today = new Date().toDateString();
    let timer: number | null = null;

    const tick = () => {
      try {
        const raw = localStorage.getItem('mathforge-study-time');
        const data = raw ? JSON.parse(raw) : { date: today, seconds: 0 };
        if (data.date !== today) {
          data.date = today;
          data.seconds = 0;
        }
        data.seconds += 60;
        localStorage.setItem('mathforge-study-time', JSON.stringify(data));
      } catch { /* ignore storage errors */ }
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (timer) { clearInterval(timer); timer = null; }
      } else if (!timer) {
        timer = window.setInterval(tick, 60000);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    timer = window.setInterval(tick, 60000);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (timer) clearInterval(timer);
    };
  }, []);
}

export function Layout() {
  const location = useLocation();
  const { recordVisit } = useLastVisited();
  useStudyTimer();

  useEffect(() => {
    // 忽略首页和 404 等非模块路径
    if (IGNORED_PATHS.has(location.pathname)) return;
    // 只记录模块级路径（一级路径）
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length >= 1) {
      recordVisit(location.pathname);
      // 同步更新全局最近使用列表
      recordModuleUsage(location.pathname);
    }
  }, [location.pathname, recordVisit]);

  // 公式速查卡（全局单例，支持侧边栏按钮 / 快捷键 / 移动端浮动按钮打开）
  const [quickSheetOpen, setQuickSheetOpen] = useState(false);
  useEffect(() => {
    const handler = () => setQuickSheetOpen(true);
    window.addEventListener('mathforge:open-quick-sheet', handler);
    return () => window.removeEventListener('mathforge:open-quick-sheet', handler);
  }, []);

  // 全局键盘快捷键（GitHub 风格双键导航）
  const navigate = useNavigate();
  const pendingKey = useRef<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 输入框/文本域里不触发
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // ? 显示快捷键帮助
      if (e.key === '?') { setShowShortcuts(v => !v); return; }

      // Esc 关闭帮助
      if (e.key === 'Escape') { setShowShortcuts(false); pendingKey.current = null; return; }

      // g 开头的导航快捷键
      if (pendingKey.current === 'g') {
        pendingKey.current = null;
        const routes: Record<string, string> = {
          h: '/',
          p: '/practice',
          f: '/formulas',
          c: '/competition',
          k: '/knowledge-map',
          t: '/teacher',
        };
        const route = routes[e.key];
        if (route) { e.preventDefault(); navigate(route); }
        return;
      }
      if (e.key === 'g') { pendingKey.current = 'g'; setTimeout(() => { pendingKey.current = null; }, 1500); return; }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  // 进入模块时自动聚焦第一个输入框（移动端除外）
  useAutoFocusFirstInput(!IGNORED_PATHS.has(location.pathname), [location.pathname]);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-w-0 overflow-x-hidden bg-background skin-pattern-bg">
        <main className="flex-1 w-full overflow-y-auto">
          <div className="page-content py-6 md:py-8 pb-20 md:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20, rotateY: 3 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -10, rotateY: -1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ transformOrigin: 'right center', perspective: 800 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* 移动端浮动速查按钮（仅 md 以下显示） */}
        <button
          type="button"
          onClick={() => setQuickSheetOpen(true)}
          className="md:hidden fixed right-4 bottom-[152px] z-40 size-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="公式速查"
        >
          <BookOpenText className="size-5" />
        </button>

        {/* 移动端底部导航 */}
        <MobileBottomNav />

        <FavoritesPanel />
        <FormulaQuickSheet open={quickSheetOpen} onOpenChange={setQuickSheetOpen} />
        <StudyBuddy />
        <RadialMenu />

        {/* 快捷键帮助弹窗 */}
        {showShortcuts && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowShortcuts(false)}
          >
            <div
              className="w-80 rounded-xl border bg-card p-5 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="mb-3 text-sm font-semibold">键盘快捷键</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>回首页</span><kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">g h</kbd></div>
                <div className="flex justify-between"><span>练习</span><kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">g p</kbd></div>
                <div className="flex justify-between"><span>公式速查</span><kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">g f</kbd></div>
                <div className="flex justify-between"><span>竞赛备战</span><kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">g c</kbd></div>
                <div className="flex justify-between"><span>知识图谱</span><kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">g k</kbd></div>
                <div className="flex justify-between"><span>我当老师</span><kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">g t</kbd></div>
                <div className="flex justify-between"><span>显示/隐藏本帮助</span><kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">?</kbd></div>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">按 Esc 关闭</p>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
