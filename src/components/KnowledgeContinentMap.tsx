import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Building2,
  Mountain,
  TreeDeciduous,
  Castle,
  Ship,
  Crown,
  ChevronRight,
  Target,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PRACTICE_TOPICS } from '@/lib/math-practice';
import { useMastery } from '@/hooks/use-mastery';
import { useWrongBook, useLearningStats } from '@/hooks/use-learning';
import { cn } from '@/lib/utils';

// ===== 类型定义 =====
type RegionState = 'mastered' | 'partial' | 'unexplored';

interface ContinentRegion {
  key: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  topics: string[];
  position: { x: number; y: number };
  size: number;
}

interface RegionData {
  region: ContinentRegion;
  state: RegionState;
  ratio: number | null;
  trulyMastered: number;
  total: number;
  attempts: number;
  correct: number;
}

interface ColorTokens {
  bg: string;
  text: string;
  border: string;
  ring: string;
  glow: string;
}

// ===== 7 大区域配置 =====
const CONTINENT_REGIONS: ContinentRegion[] = [
  {
    key: 'limit',
    name: '极限村',
    subtitle: '极限与连续',
    icon: Home,
    color: 'teal',
    topics: ['limit-basic', 'sequence-limit'],
    position: { x: 14, y: 22 },
    size: 110,
  },
  {
    key: 'derivative',
    name: '微分镇',
    subtitle: '一元微分 + 中值定理',
    icon: Building2,
    color: 'sky',
    topics: ['derivative-basic'],
    position: { x: 18, y: 52 },
    size: 110,
  },
  {
    key: 'integral',
    name: '积分谷',
    subtitle: '一元积分 + 反常积分',
    icon: TreeDeciduous,
    color: 'emerald',
    topics: ['integral-basic'],
    position: { x: 14, y: 82 },
    size: 110,
  },
  {
    key: 'series',
    name: '级数岭',
    subtitle: '数项级数 + 幂级数 + 傅里叶',
    icon: Mountain,
    color: 'violet',
    topics: ['series-convergence', 'fourier-basic'],
    position: { x: 48, y: 18 },
    size: 120,
  },
  {
    key: 'linear',
    name: '线代城堡',
    subtitle: '线性代数',
    icon: Castle,
    color: 'amber',
    topics: ['matrix-op'],
    position: { x: 80, y: 42 },
    size: 120,
  },
  {
    key: 'probability',
    name: '概率港',
    subtitle: '概率统计',
    icon: Ship,
    color: 'orange',
    topics: ['probability-classical', 'random-variable', 'combinatorics-basic'],
    position: { x: 76, y: 76 },
    size: 120,
  },
  {
    key: 'competition',
    name: '竞赛王座',
    subtitle: '综合 · 真题 · 模拟卷',
    icon: Crown,
    color: 'rose',
    topics: ['inequality-amgm'],
    position: { x: 48, y: 82 },
    size: 130,
  },
];

const CONNECTIONS: [string, string][] = [
  ['limit', 'derivative'],
  ['derivative', 'integral'],
  ['limit', 'series'],
  ['series', 'linear'],
  ['derivative', 'competition'],
  ['integral', 'competition'],
  ['linear', 'probability'],
  ['series', 'competition'],
  ['competition', 'probability'],
];

// ===== 颜色映射 =====
const COLOR_MAP: Record<string, ColorTokens> = {
  teal: {
    bg: 'bg-teal-500/20',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-400/60',
    ring: 'ring-teal-400/30',
    glow: 'shadow-[0_0_40px_rgba(20_184_166_0.4)]',
  },
  sky: {
    bg: 'bg-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-400/60',
    ring: 'ring-sky-400/30',
    glow: 'shadow-[0_0_40px_rgba(56_189_248_0.4)]',
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-400/60',
    ring: 'ring-emerald-400/30',
    glow: 'shadow-[0_0_40px_rgba(52_211_153_0.4)]',
  },
  violet: {
    bg: 'bg-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-400/60',
    ring: 'ring-violet-400/30',
    glow: 'shadow-[0_0_40px_rgba(167_139_250_0.4)]',
  },
  amber: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-400/60',
    ring: 'ring-amber-400/30',
    glow: 'shadow-[0_0_40px_rgba(251_191_36_0.4)]',
  },
  orange: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-400/60',
    ring: 'ring-orange-400/30',
    glow: 'shadow-[0_0_40px_rgba(251_146_60_0.4)]',
  },
  rose: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-400/60',
    ring: 'ring-rose-400/30',
    glow: 'shadow-[0_0_40px_rgba(251_113_133_0.4)]',
  },
};

function getRegionState(ratio: number | null): RegionState {
  if (ratio === null) return 'unexplored';
  if (ratio >= 0.8) return 'mastered';
  if (ratio >= 0.3) return 'partial';
  return 'unexplored';
}

// ===== 缩略地图组件 =====
function CompactMap({
  regionData,
  nextSuggestion,
  onClick,
}: {
  regionData: RegionData[];
  nextSuggestion: { region: string; reason: string } | null;
  onClick: (key: string) => void;
}) {
  return (
    <div className="relative w-full aspect-[16/10] rounded-xl bg-muted/30 dark:bg-muted/10 border border-border/60 overflow-hidden">
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.6) 0, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.4) 0, transparent 40%)',
        }}
      />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {CONNECTIONS.map(([a, b], i) => {
          const ra = regionData.find((r) => r.region.key === a);
          const rb = regionData.find((r) => r.region.key === b);
          if (!ra || !rb) return null;
          const bothMastered = ra.state === 'mastered' && rb.state === 'mastered';
          return (
            <line
              key={i}
              x1={ra.region.position.x}
              y1={ra.region.position.y}
              x2={rb.region.position.x}
              y2={rb.region.position.y}
              className={cn(
                'transition-all duration-500',
                bothMastered
                  ? 'stroke-emerald-400/60 dark:stroke-emerald-500/50'
                  : 'stroke-muted-foreground/40',
              )}
              strokeWidth="0.4"
              strokeDasharray="1.5 1"
            />
          );
        })}
      </svg>

      {regionData.map(({ region, state }) => {
        const color = COLOR_MAP[region.color];
        const Icon = region.icon;
        const isSuggested = nextSuggestion?.region === region.key;
        return (
          <motion.button
            key={region.key}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onClick(region.key)}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center transition-all duration-300',
              state === 'mastered'
                ? `${color.bg} ${color.text} ring-2 ${color.ring}`
                : state === 'partial'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-2 ring-amber-400/30'
                  : 'bg-border/60 dark:bg-muted text-muted-foreground',
            )}
            style={{
              left: `${region.position.x}%`,
              top: `${region.position.y}%`,
              width: `${Math.round(region.size * 0.52)}px`,
              height: `${Math.round(region.size * 0.52)}px`,
            }}
          >
            <Icon className="size-5" strokeWidth={1.8} />
            {isSuggested && (
              <span className="absolute -top-1 -right-1 size-3 rounded-full bg-amber-500 animate-pulse ring-2 ring-background" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ===== 完整地图节点 =====
function MapNode({
  data,
  isHovered,
  isSuggested,
  onHover,
  onClick,
}: {
  data: RegionData;
  isHovered: boolean;
  isSuggested: boolean;
  onHover: (k: string | null) => void;
  onClick: (k: string) => void;
}) {
  const { region, state, ratio, trulyMastered, total, correct, attempts } = data;
  const color = COLOR_MAP[region.color];
  const Icon = region.icon;
  const pct = ratio !== null ? Math.round(ratio * 100) : 0;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${region.position.x}%`, top: `${region.position.y}%` }}
      onMouseEnter={() => onHover(region.key)}
      onMouseLeave={() => onHover(null)}
    >
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onClick(region.key)}
        className={cn(
          'relative rounded-full flex flex-col items-center justify-center transition-all duration-400',
          state === 'mastered'
            ? `${color.bg} ${color.text} ring-2 ${color.ring} ${color.glow}`
            : state === 'partial'
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 ring-2 ring-amber-400/30'
              : 'bg-muted/50 text-muted-foreground backdrop-blur-sm',
        )}
        style={{ width: `${region.size}px`, height: `${region.size}px` }}
      >
        {state === 'unexplored' && (
          <div className="absolute inset-0 rounded-full bg-muted/30 dark:bg-muted/60 backdrop-blur-[2px]" />
        )}

        <Icon className="size-8 relative z-10" strokeWidth={1.5} />
        <div className="text-xs font-semibold mt-1 relative z-10">{region.name}</div>
        {state !== 'unexplored' && (
          <div className="text-xs font-medium opacity-70 relative z-10">{pct}%</div>
        )}

        {state === 'mastered' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg z-20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-3.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}

        {isSuggested && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <Badge
              variant="secondary"
              className="bg-amber-500 text-white border-amber-400 text-xs px-2 py-0.5 animate-pulse"
            >
              <Target className="size-2.5 mr-1" />
              下一步
            </Badge>
            <div className="mx-auto w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-500" />
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-30 pointer-events-none"
          >
            <div className="w-44 rounded-xl bg-card border border-border shadow-lg p-3 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={cn(
                    'size-7 rounded-lg flex items-center justify-center shrink-0',
                    color.bg,
                    color.text,
                  )}
                >
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{region.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{region.subtitle}</div>
                </div>
              </div>

              {state === 'unexplored' ? (
                <div className="text-xs text-muted-foreground italic">未探索，去练题点亮它 →</div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">真掌握</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {trulyMastered}/{total} 题
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={cn(
                      'h-1.5',
                      state === 'mastered' ? '[&>div]:bg-emerald-500' : '[&>div]:bg-amber-500',
                    )}
                  />
                  {attempts > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">正确率</span>
                      <span className="font-medium text-foreground tabular-nums">
                        {Math.round((correct / attempts) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-card border-l border-t border-border" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== 完整地图 =====
function FullMap({
  regionData,
  hoveredRegion,
  setHoveredRegion,
  nextSuggestion,
  onClick,
}: {
  regionData: RegionData[];
  hoveredRegion: string | null;
  setHoveredRegion: (k: string | null) => void;
  nextSuggestion: { region: string; reason: string } | null;
  onClick: (key: string) => void;
}) {
  return (
    <div className="relative w-full h-full rounded-xl bg-muted/30 dark:bg-muted/10 border border-border/60 overflow-hidden">
      <div
        className="absolute inset-0 opacity-50 dark:opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 15% 20%, rgba(20, 184, 166, 0.12) 0%, transparent 40%),
            radial-gradient(ellipse at 18% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 45%),
            radial-gradient(ellipse at 15% 80%, rgba(52, 211, 153, 0.12) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 18%, rgba(167, 139, 250, 0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 78% 45%, rgba(251, 191, 36, 0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 75% 75%, rgba(251, 146, 60, 0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 48% 82%, rgba(251, 113, 133, 0.1) 0%, transparent 35%)
          `,
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30 dark:opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, transparent 30%, rgba(100, 116, 139, 0.3) 100%)',
          }}
        />
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {CONNECTIONS.map(([a, b], i) => {
          const ra = regionData.find((r) => r.region.key === a);
          const rb = regionData.find((r) => r.region.key === b);
          if (!ra || !rb) return null;
          const bothMastered = ra.state === 'mastered' && rb.state === 'mastered';
          const anyHovered = hoveredRegion === a || hoveredRegion === b;
          return (
            <line
              key={i}
              x1={ra.region.position.x}
              y1={ra.region.position.y}
              x2={rb.region.position.x}
              y2={rb.region.position.y}
              className={cn(
                'transition-all duration-500',
                bothMastered
                  ? 'stroke-emerald-400/70 dark:stroke-emerald-500/60'
                  : anyHovered
                    ? 'stroke-muted-foreground/50'
                    : 'stroke-muted-foreground/30',
              )}
              strokeWidth={anyHovered ? '0.5' : '0.35'}
              strokeDasharray="2 1.2"
            />
          );
        })}
      </svg>

      {regionData.map((data) => (
        <MapNode
          key={data.region.key}
          data={data}
          isHovered={hoveredRegion === data.region.key}
          isSuggested={nextSuggestion?.region === data.region.key}
          onHover={setHoveredRegion}
          onClick={onClick}
        />
      ))}
    </div>
  );
}

// ===== 主组件 =====
interface KnowledgeContinentMapProps {
  compact?: boolean;
}

export default function KnowledgeContinentMap({ compact = false }: KnowledgeContinentMapProps) {
  const navigate = useNavigate();
  const { masteryByTopic, trulyMasteredCount } = useMastery();
  const { guessedDueToday, stats: wrongStats } = useWrongBook();
  const { stats: learningStats } = useLearningStats();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const regionData = useMemo<RegionData[]>(() => {
    return CONTINENT_REGIONS.map((region) => {
      let totalMasteredTopics = 0;
      let totalTopics = 0;
      let attempts = 0;
      let correct = 0;

      region.topics.forEach((topicKey) => {
        const m = masteryByTopic[topicKey];
        const s = learningStats.topics[topicKey];

        if (m && m.total > 0) {
          totalTopics += m.total;
          totalMasteredTopics += m.mastered;
        }

        if (s) {
          attempts += s.attempts;
          correct += s.correct;
        }
      });

      const trulyMastered = totalMasteredTopics;

      let ratio: number | null = null;
      const learnedCount = Object.keys(masteryByTopic).filter((k) => region.topics.includes(k)).length;
      if (learnedCount > 0 || attempts > 0) {
        const denominator = totalTopics > 0 ? totalTopics : Math.max(1, Math.ceil(attempts / 3));
        ratio = denominator > 0 ? Math.min(1, trulyMastered / denominator) : 0;
      }

      return {
        region,
        state: getRegionState(ratio),
        ratio,
        trulyMastered,
        total: totalTopics || attempts,
        attempts,
        correct,
      };
    });
  }, [masteryByTopic, learningStats.topics]);

  const overallProgress = useMemo(() => {
    let totalMastered = 0;
    let totalSeen = 0;
    regionData.forEach((r) => {
      if (r.ratio !== null) {
        totalMastered += r.trulyMastered;
        totalSeen += r.total || 1;
      }
    });
    if (totalSeen === 0) return 0;
    return Math.round((totalMastered / totalSeen) * 100);
  }, [regionData]);

  const nextSuggestion = useMemo(() => {
    let bestRegion: string | null = null;
    let bestScore = -1;
    let bestReason = '';

    for (const r of regionData) {
      let dueCount = 0;
      let guessCount = 0;

      for (const topicKey of r.region.topics) {
        const topicData = wrongStats.byTopic.get(topicKey);
        if (topicData) {
          dueCount += topicData.dueToday;
        }
        guessedDueToday.forEach((w) => {
          if (w.topicKey === topicKey) guessCount++;
        });
      }

      const score = dueCount * 3 + guessCount * 2;
      if (score > bestScore) {
        bestScore = score;
        bestRegion = r.region.key;
        if (guessCount > 0 && dueCount > 0) {
          bestReason = `你有 ${dueCount} 道错题待做 + ${guessCount} 道蒙对题待验证`;
        } else if (guessCount > 0) {
          bestReason = `你有 ${guessCount} 道蒙对题待验证`;
        } else if (dueCount > 0) {
          bestReason = `你有 ${dueCount} 道题今天该复习了`;
        }
      }
    }

    if (bestScore <= 0) {
      let weakest: RegionData | null = null;
      let weakestAccuracy = 1;
      for (const r of regionData) {
        if (r.attempts > 0 && r.ratio !== null) {
          const acc = r.correct / r.attempts;
          if (acc < weakestAccuracy && r.attempts >= 2) {
            weakestAccuracy = acc;
            weakest = r;
          }
        }
      }
      if (weakest) {
        bestRegion = weakest.region.key;
        const acc = Math.round(weakestAccuracy * 100);
        bestReason = `正确率 ${acc}%，建议加强练习`;
      }
    }

    if (!bestRegion) return null;
    return { region: bestRegion, reason: bestReason };
  }, [regionData, wrongStats.byTopic, guessedDueToday]);

  const handleRegionClick = (regionKey: string) => {
    if (regionKey === 'competition') {
      navigate('/competition?tab=practice');
    } else {
      navigate('/practice');
    }
  };

  if (compact) {
    return (
      <Card className="overflow-hidden bg-card border-border/60">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="size-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">知识大陆</h3>
                <p className="text-xs text-muted-foreground">点亮你的数学版图</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary tabular-nums">{overallProgress}%</div>
              <div className="text-xs text-muted-foreground">总点亮率</div>
            </div>
          </div>

          <CompactMap
            regionData={regionData}
            nextSuggestion={nextSuggestion}
            onClick={handleRegionClick}
          />

          <button
            onClick={() => navigate('/knowledge-map')}
            className="w-full mt-3 text-xs text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1"
          >
            查看完整地图
            <ChevronRight className="size-3" />
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            知识大陆
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            7 大区域，{PRACTICE_TOPICS.length} 个知识点，{trulyMasteredCount} 道题已真掌握
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-primary tabular-nums">{overallProgress}%</div>
          <div className="text-xs text-muted-foreground">总点亮率</div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto hide-scrollbar pb-2">
        <div className="relative min-w-[680px] aspect-[16/10]">
          <FullMap
            regionData={regionData}
            hoveredRegion={hoveredRegion}
            setHoveredRegion={setHoveredRegion}
            nextSuggestion={nextSuggestion}
            onClick={handleRegionClick}
          />
        </div>
      </div>

      {nextSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-700/40"
        >
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Target className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                下一步建议：
                {CONTINENT_REGIONS.find((r) => r.key === nextSuggestion.region)?.name}
              </div>
              <div className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                {nextSuggestion.reason}
              </div>
            </div>
            <button
              onClick={() => handleRegionClick(nextSuggestion.region)}
              className="shrink-0 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              去练习
            </button>
          </div>
        </motion.div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-500/60" />
          已点亮（≥80%）
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-500/50" />
          探索中（30-80%）
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-muted-foreground/40" />
          未探索（不足30%）
        </div>
      </div>
    </div>
  );
}
