import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  ListOrdered,
  AlertTriangle,
  Lightbulb,
  Info,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EXAM_STRATEGY_CONTENT, type ExamStrategySection } from '@/data/competition-strategy';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  ListOrdered,
  AlertTriangle,
  Lightbulb,
  Info,
};

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  emerald: {
    bg: 'bg-emerald-50/60',
    text: 'text-emerald-700',
    border: 'border-emerald-200/60',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  sky: {
    bg: 'bg-sky-50/60',
    text: 'text-sky-700',
    border: 'border-sky-200/60',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  rose: {
    bg: 'bg-rose-50/60',
    text: 'text-rose-700',
    border: 'border-rose-200/60',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  amber: {
    bg: 'bg-amber-50/60',
    text: 'text-amber-700',
    border: 'border-amber-200/60',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  violet: {
    bg: 'bg-primary/5',
    text: 'text-primary',
    border: 'border-primary/20',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
};

export default function ExamStrategyPanel() {
  const [expandedId, setExpandedId] = useState<string>('time-allocation');

  return (
    <div className="space-y-3">
      {EXAM_STRATEGY_CONTENT.map((section, i) => (
        <StrategyCard
          key={section.id}
          section={section}
          expanded={expandedId === section.id}
          onToggle={() => setExpandedId(expandedId === section.id ? '' : section.id)}
          delay={i * 0.05}
        />
      ))}
    </div>
  );
}

function StrategyCard({
  section,
  expanded,
  onToggle,
  delay,
}: {
  section: ExamStrategySection;
  expanded: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const Icon = iconMap[section.icon] ?? Info;
  const color = colorMap[section.color] ?? colorMap.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className={`${color.border} ${color.bg} overflow-hidden`}>
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/40 transition-colors"
        >
          <div className={`size-10 rounded-lg bg-white/70 flex items-center justify-center ${color.text}`}>
            <Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground flex items-center gap-2">
              {section.title}
              <Badge variant="outline" className={`text-xs ${color.badge}`}>
                {section.items.length} 条
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              点击展开详细策略
            </div>
          </div>
          {expanded ? (
            <ChevronDown className="size-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="size-5 text-muted-foreground shrink-0" />
          )}
        </button>

        {expanded && (
          <CardContent className="pt-0 pb-4 space-y-3 border-t border-white/60">
            {section.items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-white/60 border border-white/80"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className={`size-4 mt-0.5 shrink-0 ${color.text}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {item.desc}
                    </div>
                    {item.tip && (
                      <div className={`mt-2 text-xs px-2 py-1.5 rounded-md ${color.bg} ${color.text}`}>
                        <span className="flex items-start gap-1.5">
                          <Lightbulb className="size-3.5 mt-0.5 shrink-0 text-amber-500" />
                          <span>{item.tip}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
