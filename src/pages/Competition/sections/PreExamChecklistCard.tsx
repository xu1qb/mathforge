import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  CalendarDays,
  Zap,
  Backpack,
  Clock,
  Lightbulb,
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  readChecklistProgress,
  writeChecklistProgress,
  getPreExamChecklist,
  getSprintStatusText,
  type PreExamChecklistItem,
  type ChecklistProgress,
} from '@/data/competition-weekly';

interface PreExamChecklistCardProps {
  daysLeft: number;
}

const CATEGORY_ICONS: Record<string, typeof Backpack> = {
  items: Backpack,
  time: Clock,
  strategy: Lightbulb,
  mindset: Heart,
};

const CATEGORY_LABELS: Record<string, string> = {
  items: '物品',
  time: '时间',
  strategy: '策略',
  mindset: '心态',
};

export default function PreExamChecklistCard({ daysLeft }: PreExamChecklistCardProps) {
  const [phases, setPhases] = useState<PreExamChecklistItem[]>(() => getPreExamChecklist(daysLeft));
  const [progress, setProgress] = useState<ChecklistProgress>(() => readChecklistProgress());
  const [examDayExpanded, setExamDayExpanded] = useState(daysLeft <= 1);

  useEffect(() => {
    setPhases(getPreExamChecklist(daysLeft));
  }, [daysLeft]);

  const toggleTask = (phaseId: string, taskIdx: number) => {
    setProgress((prev) => {
      const arr = prev[phaseId]
        ? [...prev[phaseId]]
        : phases.find((p) => p.id === phaseId)?.tasks.map(() => false) ?? [];
      arr[taskIdx] = !arr[taskIdx];
      const next = { ...prev, [phaseId]: arr };
      writeChecklistProgress(next);
      return next;
    });
  };

  const dailyPhases = phases.filter((p) => !p.category);
  const examDayPhases = phases.filter((p) => p.category !== undefined);

  // 考试当日全部任务
  const examDayTotal = examDayPhases.reduce((s, p) => s + p.tasks.length, 0);
  const examDayDone = examDayPhases.reduce(
    (s, p) => s + (progress[p.id]?.filter(Boolean).length ?? 0),
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <Card className="border-border/60 bg-gradient-to-br from-rose-50/50 via-background to-amber-50/30 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-5 text-rose-600" />
            考前冲刺清单
            <Badge
              variant="outline"
              className="ml-auto text-xs bg-rose-100 text-rose-700 border-rose-200"
            >
              <Zap className="size-3 mr-1" />
              {getSprintStatusText(daysLeft)}
            </Badge>
          </CardTitle>
          <CardDescription>
            按剩余天数每日推进，考试当日 checklist 逐项核对不遗漏
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* D-7 ~ D-1 每日清单 */}
          {dailyPhases.map((phase, i) => {
            const checked = progress[phase.id] ?? phase.tasks.map(() => false);
            const doneCount = checked.filter(Boolean).length;
            const isPast = !phase.isCurrentPhase && i < dailyPhases.findIndex((p) => p.isCurrentPhase);
            return (
              <div
                key={phase.id}
                className={`p-3 rounded-lg border transition-all ${
                  phase.isCurrentPhase
                    ? 'bg-card/80 border-rose-200 shadow-sm shadow-rose-200/30'
                    : isPast
                      ? 'bg-emerald-50/40 dark:bg-emerald-900/15 border-emerald-100/60 dark:border-emerald-800/40 opacity-70'
                      : 'bg-card/40 border-border/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {phase.isCurrentPhase && (
                    <Badge className="text-xs bg-rose-600 text-white border-rose-700">
                      今日
                    </Badge>
                  )}
                  <span className="text-xs font-bold tabular-nums text-foreground w-10">
                    {phase.daysLabel}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{phase.phase}</span>
                  <span className="ml-auto text-xs font-mono tabular-nums text-muted-foreground">
                    {doneCount}/{phase.tasks.length}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{phase.description}</div>
                <ul className="space-y-1.5">
                  {phase.tasks.map((task, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => toggleTask(phase.id, idx)}
                        className="w-full flex items-start gap-2 text-left group"
                      >
                        {checked[idx] ? (
                          <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground/60 shrink-0 mt-0.5 group-hover:text-rose-500 transition-colors" />
                        )}
                        <span
                          className={`text-xs leading-relaxed ${
                            checked[idx] ? 'line-through text-muted-foreground' : 'text-foreground/90'
                          }`}
                        >
                          {task}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* 考试当日 checklist */}
          <div
            className={`p-3 rounded-lg border transition-all ${
              daysLeft <= 0
                ? 'bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 border-rose-300 shadow-md shadow-rose-200/40'
                : 'bg-card/40 border-border/40 opacity-80'
            }`}
          >
            <button
              onClick={() => setExamDayExpanded((v) => !v)}
              className="w-full flex items-center gap-2 text-left"
            >
              {daysLeft <= 0 && (
                <Badge className="text-xs bg-amber-500 text-white border-amber-600">考试日</Badge>
              )}
              <span className="text-xs font-bold text-foreground">考试当日 Checklist</span>
              <span className="ml-auto text-xs font-mono tabular-nums text-muted-foreground">
                {examDayDone}/{examDayTotal}
              </span>
              {examDayExpanded ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </button>

            {examDayExpanded && (
              <div className="mt-3 space-y-3">
                {examDayPhases.map((phase) => {
                  const CatIcon = CATEGORY_ICONS[phase.category!] ?? Lightbulb;
                  const catLabel = CATEGORY_LABELS[phase.category!] ?? '';
                  const checked = progress[phase.id] ?? phase.tasks.map(() => false);
                  const doneCount = checked.filter(Boolean).length;
                  return (
                    <div key={phase.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="size-5 rounded flex items-center justify-center bg-rose-100 text-rose-600">
                          <CatIcon className="size-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">{catLabel}</span>
                        <span className="text-xs text-muted-foreground">{phase.description}</span>
                        <span className="ml-auto text-xs font-mono tabular-nums text-muted-foreground">
                          {doneCount}/{phase.tasks.length}
                        </span>
                      </div>
                      <ul className="space-y-1.5 pl-7">
                        {phase.tasks.map((task, idx) => (
                          <li key={idx}>
                            <button
                              onClick={() => toggleTask(phase.id, idx)}
                              className="w-full flex items-start gap-2 text-left group"
                            >
                              {checked[idx] ? (
                                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="size-4 text-muted-foreground/60 shrink-0 mt-0.5 group-hover:text-rose-500 transition-colors" />
                              )}
                              <span
                                className={`text-xs leading-relaxed ${
                                  checked[idx]
                                    ? 'line-through text-muted-foreground'
                                    : 'text-foreground/90'
                                }`}
                              >
                                {task}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
