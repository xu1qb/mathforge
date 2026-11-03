// 成就徽章展示区（总览页）
import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Lock } from 'lucide-react';
import type { AchievementBadge } from '@/hooks/use-achievements';

interface AchievementBadgesSectionProps {
  badges: AchievementBadge[];
  unlockedCount: number;
  totalBadges: number;
  /** 新解锁的徽章 id 列表，用于播放入场动画 */
  newlyUnlocked?: string[];
}

const RARITY_STYLES: Record<string, { bg: string; border: string; text: string; glow: string; label: string }> = {
  common: {
    bg: 'bg-muted/50',
    border: 'border-border/70',
    text: 'text-muted-foreground',
    glow: '',
    label: '普通',
  },
  rare: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-300 dark:border-sky-700',
    text: 'text-sky-600 dark:text-sky-400',
    glow: 'shadow-sky-200/50 dark:shadow-sky-900/30',
    label: '稀有',
  },
  epic: {
    bg: 'bg-primary/5 dark:bg-primary/10',
    border: 'border-primary/30 dark:border-primary/40',
    text: 'text-primary dark:text-primary/90',
    glow: 'shadow-primary/20 dark:shadow-primary/20',
    label: '史诗',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40',
    border: 'border-amber-400 dark:border-amber-600',
    text: 'text-amber-700 dark:text-amber-300',
    glow: 'shadow-lg shadow-amber-200/60 dark:shadow-amber-900/40',
    label: '传说',
  },
};

export default memo(function AchievementBadgesSection({
  badges,
  unlockedCount,
  totalBadges,
  newlyUnlocked = [],
}: AchievementBadgesSectionProps) {
  const progressPct = Math.round((unlockedCount / totalBadges) * 100);
  const [justUnlocked, setJustUnlocked] = useState<string[]>(newlyUnlocked);

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setJustUnlocked(newlyUnlocked);
      const timer = setTimeout(() => setJustUnlocked([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked]);

  return (
    <Card className="border-border/60 bg-gradient-to-br from-amber-50/40 via-background to-teal-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="size-5 text-amber-500" />
          成就徽章
          <Badge variant="outline" className="ml-auto text-xs bg-background">
            {unlockedCount} / {totalBadges} 已解锁
          </Badge>
        </CardTitle>
        <Progress value={progressPct} className="h-1.5 bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge, i) => {
            const style = RARITY_STYLES[badge.rarity];
            const isJustUnlocked = justUnlocked.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                animate={isJustUnlocked ? { scale: [1, 1.1, 1] } : {}}
                className={`relative rounded-xl border ${style.border} ${style.bg} p-3 text-center transition-all ${
                  badge.unlocked ? `shadow-md ${style.glow}` : 'opacity-70'
                }`}
                title={badge.description}
              >
                {/* 新解锁光效 */}
                <AnimatePresence>
                  {isJustUnlocked && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 rounded-xl border-2 border-amber-400 pointer-events-none"
                      style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)' }}
                    />
                  )}
                </AnimatePresence>

                <div className="text-3xl mb-1.5 relative">
                  {badge.unlocked ? (
                    <span className="inline-block">{badge.icon}</span>
                  ) : (
                    <span className="inline-block grayscale opacity-50">
                      <Lock className="size-5 mx-auto text-muted-foreground" />
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium text-foreground leading-tight mb-1 line-clamp-1">
                  {badge.name}
                </div>
                <div className={`text-xs ${style.text} font-medium mb-1.5`}>
                  {style.label}
                </div>
                {!badge.unlocked && (
                  <div className="space-y-1">
                    <Progress
                      value={(badge.current / badge.target) * 100}
                      className="h-1 bg-muted"
                    />
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {badge.current} / {badge.target} {badge.unit}
                    </div>
                  </div>
                )}
                {badge.unlocked && badge.unlockedAt && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(badge.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
