// 命题规律面板 - 竞赛备战总览页用
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { COMPETITION_TOPICS, type CompetitionTopic } from '@/data/competition';
import { getTopicIcon } from '../helpers/topic-icons';
import { cn } from '@/lib/utils';

interface ExamPatternPanelProps {
  onGoTopic: (topic: CompetitionTopic) => void;
}

export default function ExamPatternPanel({ onGoTopic }: ExamPatternPanelProps) {
  const highFreq = COMPETITION_TOPICS.filter((t) => t.frequency === 'high');
  const midFreq = COMPETITION_TOPICS.filter((t) => t.frequency === 'medium');
  const lowFreq = COMPETITION_TOPICS.filter((t) => t.frequency === 'low');

  const groups = [
    { label: '高频必考', desc: '几乎每年都考，务必吃透', topics: highFreq, color: 'rose' },
    { label: '常考', desc: '出现频率较高，需掌握', topics: midFreq, color: 'amber' },
    { label: '低频', desc: '考查较少，了解即可', topics: lowFreq, color: 'muted' },
  ];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="size-5 text-rose-600" />
          命题规律
          <Badge variant="outline" className="ml-auto text-xs bg-background">
            8 大专题频率分布
          </Badge>
        </CardTitle>
        <CardDescription>基于竞赛命题规律总结，针对性备考效率更高</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group, gi) => (
          <div key={group.label}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  'size-2 rounded-full',
                  group.color === 'rose'
                    ? 'bg-rose-500'
                    : group.color === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-muted-foreground/40',
                )}
              />
              <span className="text-sm font-medium text-foreground">{group.label}</span>
              <span className="text-xs text-muted-foreground">
                {group.topics.length} 个专题 · {group.desc}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-4">
              {group.topics.map((topic, i) => {
                const Icon = getTopicIcon(topic.icon);
                return (
                  <motion.button
                    key={topic.key}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: gi * 0.05 + i * 0.03 }}
                    onClick={() => onGoTopic(topic)}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 hover:border-emerald-200 dark:hover:border-emerald-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/15 transition-colors text-left"
                  >
                    <div
                      className={cn(
                        'size-7 rounded-md flex items-center justify-center shrink-0',
                        topic.color === 'emerald' && 'bg-emerald-100 text-emerald-700',
                        topic.color === 'sky' && 'bg-sky-100 text-sky-700',
                        topic.color === 'amber' && 'bg-amber-100 text-amber-700',
                        topic.color === 'violet' && 'bg-primary/10 text-primary',
                        topic.color === 'rose' && 'bg-rose-100 text-rose-700',
                        topic.color === 'indigo' && 'bg-teal-100 text-teal-700',
                        topic.color === 'teal' && 'bg-teal-100 text-teal-700',
                        topic.color === 'orange' && 'bg-orange-100 text-orange-700',
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-foreground truncate">
                        专题{topic.index}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {topic.title.replace(/^.+?·/, '').trim().split(' · ')[0].slice(0, 8)}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
