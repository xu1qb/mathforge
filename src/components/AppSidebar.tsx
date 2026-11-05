import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { NavLink, useLocation } from 'react-router-dom';
import { useState, useMemo, useEffect, memo, lazy, Suspense } from 'react';
import {
  Calculator,
  Sigma,
  FunctionSquare,
  Grid3x3,
  BarChart3,
  NotebookPen,
  Hash,
  LineChart,
  Box,
  Layers,
  GitBranch,
  Target,
  Activity,
  PlusSquare,
  ToggleLeft,
  Info,
  Sparkles,
  ShieldCheck,
  Waves,
  Globe,
  Trophy,
  Search,
  ChevronDown,
  Home,
  BookOpenText,
  Wrench,
  GraduationCap,
  Lightbulb,
  Workflow,
  Map,
  Database,
  Star,
  Camera,
  AreaChart,
  PieChart,
  Pin,
  PinOff,
  PenSquare,
  Gift,
  Brain,
  BookMarked,
  Library,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';
import SkinSelector from './SkinSelector';
import { useDock } from '@/hooks/use-dock';

// 弹窗仅在用户主动打开时才加载，避免搜索索引与设置面板随侧边栏进入首屏主包
const GlobalSearchDialogLazy = lazy(() => import('./GlobalSearchDialog'));
const DataSettingsDialogLazy = lazy(() => import('./DataSettingsDialog'));

export interface NavItem {
  path: string;
  label: string;
   
  icon: any;
}

export interface NavGroup {
  name: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    name: '学习与备考',
    items: [
      { path: '/', label: '首页', icon: Home },
      { path: '/competition', label: '竞赛备战中心', icon: Trophy },
      { path: '/practice', label: '练习训练', icon: GraduationCap },
      { path: '/wrong-book', label: '错题本', icon: NotebookPen },
      { path: '/progress', label: '学习报告', icon: BarChart3 },
      { path: '/about', label: '关于', icon: Info },
      { path: '/privacy', label: '隐私政策', icon: ShieldCheck },
      { path: '/ai-lab', label: 'AI 出题', icon: Sparkles },
      { path: '/ai-review', label: 'AI 审核', icon: ShieldCheck },
      { path: '/explainer', label: '原理讲解', icon: Lightbulb },
      { path: '/flow', label: '解题流程图', icon: Workflow },
    ],
  },
  {
    name: '计算工具',
    items: [
      { path: '/calculator', label: '科学计算器', icon: Calculator },
      { path: '/symbolic', label: '符号代数', icon: Sigma },
      { path: '/formulas', label: '公式手册', icon: BookOpenText },
      { path: '/photo-solve', label: '拍照识题', icon: Camera },
      { path: '/tools', label: '实用工具', icon: Wrench },
    ],
  },
  {
    name: '学科',
    items: [
      { path: '/branches', label: '分支总览', icon: Library },
      { path: '/course/linear-algebra', label: '线性代数课程', icon: GraduationCap },
    ],
  },
  {
    name: '基础数学',
    items: [
      { path: '/number-theory', label: '数论基础', icon: Hash },
      { path: '/linear-algebra', label: '线性代数', icon: Grid3x3 },
    ],
  },
  {
    name: '分析学',
    items: [
      { path: '/calculus', label: '微积分', icon: FunctionSquare },
      { path: '/multivariable', label: '多元微积分', icon: Layers },
      { path: '/ode', label: '常微分方程', icon: GitBranch },
      { path: '/pde', label: '偏微分方程', icon: Waves },
      { path: '/fourier', label: '傅里叶级数', icon: Activity },
      { path: '/complex', label: '复变函数', icon: PlusSquare },
    ],
  },
  {
    name: '几何 · 离散 · 现代',
    items: [
      { path: '/diff-geo', label: '微分几何', icon: Globe },
      { path: '/discrete', label: '离散数学', icon: ToggleLeft },
      { path: '/modern', label: '现代数学', icon: Sparkles },
    ],
  },
  {
    name: '概率 · 计算',
    items: [
      { path: '/probability', label: '概率统计', icon: BarChart3 },
      { path: '/numerical', label: '数值分析', icon: Target },
    ],
  },
  {
    name: '可视化',
    items: [
      { path: '/plot-2d', label: '二维绘图', icon: LineChart },
      { path: '/plot-3d', label: '三维曲面', icon: Box },
      { path: '/data-chart', label: '数据图表', icon: PieChart },
      { path: '/integral-visualization', label: '微积分可视化', icon: AreaChart },
      { path: '/knowledge-map', label: '知识地图', icon: Map },
    ],
  },
  {
    name: '成长与趣味',
    items: [
      { path: '/blind-box', label: '每日盲盒', icon: Gift },
      { path: '/spellbook', label: '公式咒语', icon: BookMarked },
      { path: '/mathematician-quiz', label: '数学家测试', icon: Brain },
      { path: '/teacher', label: '我当老师', icon: PenSquare },
    ],
  },
];

function AppSidebarInner() {
  const { pathname } = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    // 默认只展开「备考主线」和当前页面所在分组，其余收起，避免侧栏过长
    NAV_GROUPS.forEach((g) => {
      init[g.name] = g.name === '备考主线' || g.items.some((i) => i.path === pathname);
    });
    return init;
  });
  const { dockItems, isPinned, pinToDock, removeFromDock, limit: dockLimit } = useDock();

  const allItems = useMemo(() => NAV_GROUPS.flatMap((g) => g.items), []);

  // Dock 项对应的 NavItem 对象（按 dockItems 顺序）
  const dockNavItems = useMemo(() => {
    const lookup: Record<string, NavItem> = {};
    allItems.forEach((item) => { lookup[item.path] = item; });
    return dockItems
      .map((p) => lookup[p])
      .filter((item): item is NavItem => !!item);
  }, [dockItems, allItems]);

  // 数据设置弹窗
  const [dataSettingsOpen, setDataSettingsOpen] = useState(false);

  // Ctrl/Cmd+K 打开全局搜索弹窗
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      if (ctrlOrCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Ctrl/Cmd + ' 打开公式速查卡（通过自定义事件通知全局实例）
      if (ctrlOrCmd && e.key === "'") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('mathforge:open-quick-sheet'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // 外部组件通过自定义事件打开搜索（如移动端更多菜单）
  useEffect(() => {
    const handler = () => setSearchOpen(true);
    window.addEventListener('mathforge:open-search', handler);
    return () => window.removeEventListener('mathforge:open-search', handler);
  }, []);

  const filteredGroups = useMemo(() => NAV_GROUPS, []);

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isItemActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname === '';
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <>
    <Sidebar
      collapsible="icon"
      className="border-r-0"
    >
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-3 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0">
          <div className="size-10 shrink-0 rounded-xl bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center text-sidebar-primary">
            <FunctionSquare className="size-5" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0 group-data-[state=collapsed]:hidden">
            <div className="text-lg font-bold text-sidebar-foreground tracking-wide font-['Noto_Serif_SC']">MathForge</div>
            <div className="text-xs text-sidebar-foreground/60">数学计算工作台</div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className={cn('mt-4', collapsed && 'hidden')}>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 h-9 px-2.5 bg-sidebar-accent/60 border border-sidebar-border rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">全局搜索…</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-sidebar-border/70 text-xs font-mono text-sidebar-foreground/50">⌘K</kbd>
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {/* Dock 常用栏（仅桌面端展开时显示） */}
        {!collapsed && dockNavItems.length > 0 && (
          <SidebarGroup className="px-2 pb-1">
            <div className="px-2.5 py-1.5 text-sm font-medium text-sidebar-foreground/60 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Pin className="size-3" />
                常用
              </span>
              <span className="text-xs normal-case tracking-normal text-sidebar-foreground/50">{dockNavItems.length}/{dockLimit}</span>
            </div>
            <SidebarMenu>
              {dockNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.path);
                return (
                  <SidebarMenuItem key={`dock-${item.path}`}>
                    <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                      <NavLink
                        to={item.path}
                        end={item.path === '/'}
                        className="flex items-center gap-3 h-9 rounded-lg transition-colors group/dockitem"
                      >
                        <Icon className="size-4 shrink-0 text-sidebar-primary" />
                        <span className="flex-1 text-sm truncate">{item.label}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFromDock(item.path);
                          }}
                          className="shrink-0 size-6 rounded flex items-center justify-center text-sidebar-foreground/30 hover:text-sidebar-foreground hover:bg-sidebar-accent opacity-0 group-hover/dockitem:opacity-100 transition-opacity"
                          title="移出常用栏"
                          aria-label="移出常用栏"
                        >
                          <PinOff className="size-3.5" />
                        </button>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup className="px-2">
          <SidebarMenu>
            {filteredGroups.length === 0 && !collapsed && (
              <div className="text-xs text-sidebar-foreground/60 px-3 py-6 text-center">
                未找到匹配的模块
              </div>
            )}
            {filteredGroups.map((group) => (
              <div key={group.name} className="mb-1">
                {/* 分组标题 */}
                {!collapsed && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.name)}
                     className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider hover:text-sidebar-primary transition-colors"
                  >
                    <ChevronDown
                      className={cn(
                        'size-3 shrink-0 transition-transform duration-200',
                        expandedGroups[group.name] ? 'rotate-0' : '-rotate-90',
                      )}
                    />
                    <span className="truncate">{group.name}</span>
                  </button>
                )}
                {/* 分组菜单项 */}
                <div
                  className={cn(
                    'overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out',
                    collapsed || expandedGroups[group.name]
                      ? 'max-h-[800px] opacity-100'
                      : 'max-h-0 opacity-0',
                  )}
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item.path);
                    const pinned = isPinned(item.path);
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                          <NavLink
                            to={item.path}
                            end={item.path === '/'}
                            className="flex items-center gap-3 h-10 rounded-lg transition-colors group/navitem"
                          >
                            <Icon className="size-4 shrink-0" />
                            <span className="group-data-[state=collapsed]:hidden text-sm flex-1 min-w-0 truncate">{item.label}</span>
                            {/* Pin 按钮：hover 显示，已固定常显 */}
                            {!collapsed && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (pinned) {
                                    removeFromDock(item.path);
                                  } else {
                                    pinToDock(item.path);
                                  }
                                }}
                                className={cn(
                                  'shrink-0 size-6 rounded flex items-center justify-center transition-all',
                                  pinned
                                    ? 'text-sidebar-primary opacity-100'
                                    : 'text-sidebar-foreground/30 hover:text-sidebar-foreground hover:bg-sidebar-accent opacity-0 group-hover/navitem:opacity-100',
                                )}
                                title={pinned ? '移出常用栏' : '固定到常用栏'}
                                aria-label={pinned ? '移出常用栏' : '固定到常用栏'}
                              >
                                <Pin className={cn('size-3.5', pinned && 'fill-current')} />
                              </button>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              </div>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-4 group-data-[state=collapsed]:px-2">
        {/* 主题切换 + 数据设置 + 速查 */}
        <div className="mb-2 flex items-center justify-between">
          <span className={cn('text-xs text-sidebar-foreground/50', collapsed && 'hidden')}>
            主题
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('mathforge:open-quick-sheet'))}
              className="size-8 rounded-lg flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              title="公式速查（⌘'）"
            >
              <BookOpenText className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('mathforge:open-favorites'))}
              className="size-8 rounded-lg flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              title="我的收藏"
            >
              <Star className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setDataSettingsOpen(true)}
              className="size-8 rounded-lg flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              title="数据备份"
            >
              <Database className="size-4" />
            </button>
            <ThemeToggle variant="sidebar" />
          </div>
        </div>

        {/* 皮肤选择 */}
        <div className={cn('mb-2', collapsed && 'hidden')}>
          <SkinSelector variant="sidebar" />
        </div>
        <div className={cn('text-xs text-sidebar-foreground/50 leading-relaxed', collapsed && 'hidden')}>
          <div className="flex items-center gap-1.5 mb-1.5 text-sidebar-primary/80">
            <Info className="size-3" />
            <span>提醒</span>
          </div>
          <p>表达式统一用 math.js 语法：幂 ^、乘法 *、自然对数 ln()、圆周率 pi。</p>
        </div>
      </SidebarFooter>
    </Sidebar>
    <Suspense fallback={null}>
      {/* 只在真正打开时才挂载：它会把 search-index 乃至 math.js 一并拉进来，
          常驻挂载等于让首屏多背 2MB+ */}
      {searchOpen && <GlobalSearchDialogLazy open={searchOpen} onOpenChange={setSearchOpen} />}
    </Suspense>
    <Suspense fallback={null}>
      <DataSettingsDialogLazy open={dataSettingsOpen} onOpenChange={setDataSettingsOpen} />
    </Suspense>
    </>
  );
}

const AppSidebar = memo(AppSidebarInner);

export { AppSidebar, SidebarProvider, SidebarInset, SidebarTrigger, useSidebar, NAV_GROUPS };
export default AppSidebar;
