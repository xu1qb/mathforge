// 冲刺计划面板 - 竞赛备战总览页用
import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Target,
  BookOpen,
  BookMarked,
  Coffee,
  Check,
  ChevronRight,
  Rocket,
} from 'lucide-react';
import { generateSprintPlan } from '@/data/competition-sprint';
import { scopedStorage } from '@/lib/lark-mock';
import { cn } from '@/lib/utils';

const SPRINT_PROGRESS_KEY = 'mathforge:competition:sprint-progress';

const ICON_MAP: Record<string, typeof Zap> = {
  Zap,
  Target,
  BookOpen,
  BookMarked,
  Coffee,
  Rocket,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
};

interface SprintPlanPanelProps {
  daysLeft: number;
}

export default function SprintPlanPanel({ daysLeft }: SprintPlanPanelProps) {
  const phases = useMemo(() => generateSprintPlan(daysLeft), [daysLeft]);
  const [completedGoals, setCompletedGoals] = useState<Set<string>>(() => {
    try {
      const raw = scopedStorage.getItem(SPRINT_PROGRESS_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch { /* ignore */ }
    return new Set();
  });

  useEffect(() => {
    try {
      scopedStorage.setItem(SPRINT_PROGRESS_KEY, JSON.stringify([...completedGoals]));
    } catch { /* ignore */ }
  }, [completedGoals]);

  const toggleGoal = useCallback((phaseIdx: number, goalIdx: number) => {
    const key = `${phaseIdx}-${goalIdx}`;
    setCompletedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const totalGoals = phases.reduce((sum, p) => sum + p.goals.length, 0);
  const completedCount = completedGoals.size;
  const progressPct = totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : 0;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Rocket className="size-5 text-teal-600" />
          冲刺计划
          <Badge variant="outline" className="ml-auto text-xs bg-background">
            {phases.length} 阶段 · {totalGoals} 项目标
          </Badge>
        </CardTitle>
        <CardDescription>
          根据剩余 {daysLeft} 天自动生成 · 完成度 {progressPct}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {phases.map((phase, pIdx) => {
          const Icon = ICON_MAP[phase.icon] || Zap;
          const colors = COLOR_MAP[phase.color] || COLOR_MAP.emerald;
          const phaseCompleted = phase.goals.filter((_, gIdx) =>
            completedGoals.has(`${pIdx}-${gIdx}`),
          ).length;

          return (
            <motion.div
              key={phase.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: pIdx * 0.06 }}
              className={cn(
                'rounded-xl border transition-colors',
                colors.border,
                'bg-background/80',
              )}
            >
              <div className="p-4 pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className={cn('size-9 rounded-lg flex items-center justify-center', colors.bg)}>
                    <Icon className={cn('size-4.5', colors.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm">{phase.name}</div>
                    <div className="text-xs text-muted-foreground">{phase.duration}</div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {phaseCompleted}/{phase.goals.length} 完成
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 pl-12">{phase.description}</p>
              </div>

              <div className="px-4 pb-4 space-y-1.5">
                {phase.goals.map((goal, gIdx) => {
                  const key = `${pIdx}-${gIdx}`;
                  const done = completedGoals.has(key);
                  return (
                    <button
                      key={gIdx}
                      onClick={() => toggleGoal(pIdx, gIdx)}
                      className={cn(
                        'w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-sm transition-all',
                        done
                          ? 'bg-emerald-50/70 text-emerald-800'
                          : 'hover:bg-muted/50 text-foreground',
                      )}
                    >
                      <div
                        className={cn(
                          'size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                          done
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-muted-foreground/30',
                        )}
                      >
                        {done && <Check className="size-3" />}
                      </div>
                      <span className={cn('flex-1', done && 'line-through opacity-70')}>
                        {goal}
                      </span>
                      <ChevronRight
                        className={cn(
                          'size-3.5 shrink-0 transition-opacity',
                          done ? 'text-emerald-500' : 'opacity-0',
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
