import { memo } from 'react';
import { SidebarTrigger } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, Calculator, Sigma, FunctionSquare, Grid3X3, BarChart3, Hash, LineChart, Box, Layers, GitBranch, Target, Activity, ToggleLeft, Flame, GraduationCap, CircleDot } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import ThemeToggle from './ThemeToggle';
import PixelHud from './PixelHud';
import { BattleFeedbackOverlay } from './PixelBattlePanel';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description: string;
  onCheatsheet: () => void;
}

// 路由 → "第几讲"编号 + 模块名 + 图标
const LECTURE_MAP: Record<string, { index: string; module: string; icon: typeof Calculator }> = {
  '/': { index: '第一讲', module: '科学计算器', icon: Calculator },
  '/symbolic': { index: '第二讲', module: '符号代数', icon: Sigma },
  '/calculus': { index: '第三讲', module: '一元微分学', icon: FunctionSquare },
  '/linear-algebra': { index: '第四讲', module: '线性代数', icon: Grid3X3 },
  '/probability': { index: '第五讲', module: '概率统计', icon: BarChart3 },
  '/number-theory': { index: '第六讲', module: '数论基础', icon: Hash },
  '/plot-2d': { index: '第七讲', module: '二维绘图', icon: LineChart },
  '/plot-3d': { index: '第八讲', module: '三维曲面', icon: Box },
  '/multivariable': { index: '第九讲', module: '多元微积分', icon: Layers },
  '/ode': { index: '第十讲', module: '常微分方程', icon: GitBranch },
  '/numerical': { index: '第十一讲', module: '数值分析', icon: Target },
  '/fourier': { index: '第十二讲', module: '傅里叶级数', icon: Activity },
  '/complex': { index: '第十三讲', module: '复变函数', icon: CircleDot },
  '/discrete': { index: '第十四讲', module: '离散数学', icon: ToggleLeft },
  '/pde': { index: '第十五讲', module: '偏微分方程', icon: Layers },
  '/diff-geo': { index: '第十六讲', module: '微分几何', icon: FunctionSquare },
  '/modern': { index: '第十七讲', module: '现代数学', icon: Flame },
  '/tools': { index: '第十八讲', module: '实用工具', icon: Target },
  '/formulas': { index: '附录A', module: '公式手册', icon: BookOpen },
  '/knowledge-map': { index: '附录B', module: '知识地图', icon: GraduationCap },
  '/competition': { index: '专题', module: '竞赛备战', icon: Flame },
  '/practice': { index: '专题', module: '每日练习', icon: BarChart3 },
};



function PageHeaderInner({ title, description, onCheatsheet }: PageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { skin } = useTheme();
  const isHome = location.pathname === '/';

  // 精确匹配，或者取第一段路径
  const pathKey = location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`;
  const lecture = LECTURE_MAP[pathKey] ?? { index: '专题', module: title, icon: BookOpen };

  const Icon = lecture.icon;

  return (
    <div className="sticky top-0 z-40">
      <PixelHud />
      <BattleFeedbackOverlay />
      {/* 页眉区 */}
      <div
        className="backdrop-blur-md border-b"
        style={{
          backgroundColor:
            skin === 'night' ? 'rgba(18,22,30,0.8)' :
            skin === 'paper' ? 'rgba(245,237,214,0.85)' :
            skin === 'pixel' ? 'rgba(26,47,35,0.9)' :
            skin === 'journal' ? 'rgba(246,239,226,0.85)' :
            'rgba(245,243,237,0.8)',
          borderBottomColor:
            skin === 'night' ? 'rgba(245,158,11,0.25)' :
            skin === 'paper' ? 'rgba(74,63,53,0.15)' :
            skin === 'pixel' ? 'rgba(125,255,154,0.2)' :
            skin === 'journal' ? 'rgba(242,196,196,0.5)' :
            'rgba(231,229,220,0.6)',
        }}
      >
        <div className="flex items-center gap-2 px-3 md:px-5 lg:px-7 h-14">
          <SidebarTrigger className="md:inline-flex" />
          {!isHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className={cn(
                'shrink-0 hover:bg-accent',
                skin === 'night' ? 'text-amber-400/70 hover:text-amber-400' :
                skin === 'paper' ? 'text-foreground hover:text-stone-900' :
                skin === 'pixel' ? 'text-[#7dff9a]/80 hover:text-[#7dff9a]' :
                skin === 'journal' ? 'text-foreground hover:text-stone-900' :
                'text-muted-foreground dark:text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400',
              )}
              title="返回首页"
              aria-label="返回首页"
            >
              <Home className="size-4" />
            </Button>
          )}

          {/* 讲义页眉标题 */}
          <div className="flex-1 min-w-0 ml-1 flex items-center gap-3">
            <h1
              className="font-bold truncate leading-tight"
              style={{
                fontSize: 'clamp(1rem, 1.2vw + 0.6rem, 1.5rem)',
                color:
                  skin === 'night' ? 'hsl(45 30% 92%)' :
                  skin === 'paper' ? 'hsl(25 20% 22%)' :
                  skin === 'pixel' ? '#7dff9a' :
                  skin === 'journal' ? '#4a3f35' :
                  '#1e293b',
                letterSpacing: '0.02em',
                fontFamily:
                  skin === 'journal'
                    ? "'Kaiti SC', 'STKaiti', 'KaiTi', 'Songti SC', serif"
                    : skin === 'night' || skin === 'paper'
                      ? "'Songti SC', 'Source Han Serif SC', serif"
                      : undefined,
              }}
            >
              <span
                className="opacity-70 mr-2"
                style={{
                  color:
                    skin === 'night' ? 'hsl(42 90% 65%)' :
                    skin === 'paper' ? 'hsl(28 30% 35%)' :
                    skin === 'pixel' ? '#ffd93d' :
                    skin === 'journal' ? '#c0392b' :
                    'hsl(170 60% 32%)',
                }}
              >
                {lecture.index}
              </span>
              · {lecture.module}
            </h1>
            <Icon
              className={cn(
                'size-5 shrink-0 hidden sm:block',
                skin === 'night' ? 'text-amber-500/60' :
                skin === 'paper' ? 'text-muted-foreground/60' :
                skin === 'pixel' ? 'text-[#ffd93d]' :
                skin === 'journal' ? 'text-[#c0392b]/60' :
                'text-emerald-600/60',
              )}
            />
          </div>

          <div className="hidden md:block">
            <ThemeToggle variant="header" />
          </div>
          <div className="md:hidden">
            <ThemeToggle variant="header" size="icon" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onCheatsheet}
            className={cn(
              'shrink-0',
              skin === 'night'
                ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                : skin === 'paper'
                ? 'border-border text-foreground hover:bg-muted'
                : skin === 'pixel'
                ? 'border-[#7dff9a]/40 text-[#7dff9a] hover:bg-[#7dff9a]/10'
                : skin === 'journal'
                ? 'border-[#c0392b]/40 text-[#c0392b] hover:bg-[#f2c4c4]/30'
                : 'border-emerald-700/30 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-900 dark:hover:text-emerald-300',
            )}
          >
            <BookOpen className="size-4 mr-1.5" />
            <span className="hidden sm:inline">语法速查</span>
          </Button>
        </div>

        {/* 细分割线 + 简介 */}
        <div className="px-4 md:px-6 lg:px-8 pb-3">
          {description && (
            <p
              className="text-xs leading-relaxed mb-2"
              style={{
                color:
                  skin === 'night' ? 'rgba(245,224,180,0.6)' :
                  skin === 'paper' ? 'rgba(74,63,53,0.6)' :
                  skin === 'pixel' ? 'rgba(125,255,154,0.6)' :
                  skin === 'journal' ? 'rgba(74,63,53,0.65)' :
                  'rgba(100,116,139,0.8)',
              }}
            >
              {description}
            </p>
          )}
          {/* 粉笔手绘感分割线（波浪/SVG 抖动） */}
          <div
            className="w-full h-px relative overflow-hidden"
            style={{
              backgroundColor:
                skin === 'night' ? 'rgba(245,158,11,0.25)' :
                skin === 'paper' ? 'rgba(74,63,53,0.15)' :
                skin === 'pixel' ? 'rgba(125,255,154,0.2)' :
                skin === 'journal' ? 'rgba(242,196,196,0.5)' :
                'rgba(231,229,220,0.6)',
            }}
          >
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 2"
              aria-hidden
            >
              <path
                d="M0,1 Q25,0.4 50,1 T100,1"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                style={{
                  color:
                    skin === 'night' ? 'rgba(245,158,11,0.4)' :
                    skin === 'paper' ? 'rgba(74,63,53,0.3)' :
                    skin === 'pixel' ? 'rgba(125,255,154,0.4)' :
                    skin === 'journal' ? 'rgba(192,57,43,0.4)' :
                    'rgba(16,185,129,0.25)',
                }}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

const PageHeader = memo(PageHeaderInner);
export default PageHeader;
