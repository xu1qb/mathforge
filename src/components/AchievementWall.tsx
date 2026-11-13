import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLearningStats, useWrongBook, useFavorites, formatDateKey } from '@/hooks/use-learning';
import {
  Award, Target, Flame, Star, BookOpen, Trophy, Sword, Brain, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: string;
}

export default function AchievementWall() {
  const { stats } = useLearningStats();
  const { mastered } = useWrongBook();
  const { items: favorites } = useFavorites();

  const achievements = useMemo<Achievement[]>(() => {
    // 计算总做题数
    let total = 0;
    Object.values(stats.dailyRecords || {}).forEach((r) => { total += r.total; });

    // 计算连续学习天数
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const rec = stats.dailyRecords?.[formatDateKey(d)];
      if (rec && rec.total > 0) streak++;
      else if (i === 0) continue;
      else break;
    }

    // 已掌握专题数
    const masteredTopics = new Set(mastered.map((w) => w.topicKey)).size;

    return [
      {
        id: 'first-question',
        name: '初出茅庐',
        description: '做第一道题',
        icon: <Target className="size-5" />,
        unlocked: total >= 1,
        progress: total >= 1 ? '1/1' : '0/1',
      },
      {
        id: '100-questions',
        name: '小有所成',
        description: '累计做100道题',
        icon: <BookOpen className="size-5" />,
        unlocked: total >= 100,
        progress: `${Math.min(total, 100)}/100`,
      },
      {
        id: '500-questions',
        name: '百题斩',
        description: '累计做500道题',
        icon: <Award className="size-5" />,
        unlocked: total >= 500,
        progress: `${Math.min(total, 500)}/500`,
      },
      {
        id: '1000-questions',
        name: '千题斩',
        description: '累计做1000道题',
        icon: <Trophy className="size-5" />,
        unlocked: total >= 1000,
        progress: `${Math.min(total, 1000)}/1000`,
      },
      {
        id: 'streak-7',
        name: '连续一周',
        description: '连续学习7天',
        icon: <Flame className="size-5" />,
        unlocked: streak >= 7,
        progress: `${Math.min(streak, 7)}/7`,
      },
      {
        id: 'streak-30',
        name: '月度坚持',
        description: '连续学习30天',
        icon: <Crown className="size-5" />,
        unlocked: streak >= 30,
        progress: `${Math.min(streak, 30)}/30`,
      },
      {
        id: 'mastered-10',
        name: '错题克星',
        description: '掌握10道错题',
        icon: <CheckCircle2 className="size-5" />,
        unlocked: mastered.length >= 10,
        progress: `${Math.min(mastered.length, 10)}/10`,
      },
      {
        id: 'mastered-topics-5',
        name: '多面手',
        description: '掌握5个专题',
        icon: <Brain className="size-5" />,
        unlocked: masteredTopics >= 5,
        progress: `${Math.min(masteredTopics, 5)}/5`,
      },
      {
        id: 'favorites-10',
        name: '公式收藏家',
        description: '收藏10个公式',
        icon: <Star className="size-5" />,
        unlocked: favorites.length >= 10,
        progress: `${Math.min(favorites.length, 10)}/10`,
      },
      {
        id: 'adventurer',
        name: '冒险家',
        description: '在冒险模式击败怪物',
        icon: <Sword className="size-5" />,
        unlocked: false,
        progress: '去错题本试试',
      },
    ];
  }, [stats.dailyRecords, mastered, favorites]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          成就墙
          <span className="text-xs text-muted-foreground ml-auto">{unlockedCount}/{achievements.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={cn(
                'rounded-xl p-3 border transition-all',
                a.unlocked
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                  : 'bg-muted/30 border-border opacity-50',
              )}
            >
              <div className={cn('size-8 rounded-lg flex items-center justify-center mb-2',
                a.unlocked ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-muted text-muted-foreground'
              )}>
                {a.icon}
              </div>
              <div className="text-xs font-medium text-foreground">{a.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.description}</div>
              <div className="text-xs text-muted-foreground mt-1 tabular-nums">{a.progress}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 补一个 CheckCircle2
import { CheckCircle2 } from 'lucide-react';
