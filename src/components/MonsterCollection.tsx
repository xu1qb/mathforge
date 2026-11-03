import { useMemo } from 'react';
import { BookOpen, Trophy, Skull, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWrongBook } from '@/hooks/use-learning';
import { cn } from '@/lib/utils';

// 怪物名按专题映射
const MONSTER_NAMES: Record<string, string[]> = {
  '极限与连续': ['极限史莱姆', '连续幽灵', '无穷大巨人'],
  '一元微分': ['导数哥布林', '微分蝙蝠', '中值定理巨魔'],
  '一元积分': ['积分史莱姆', '原像骷髅', '换元术士'],
  '多元微分': ['偏导妖精', '梯度石像鬼', '链式蛇'],
  '多元积分': ['重积分巨人', '极坐标狼', '格林恶魔'],
  '级数': ['级数幽灵', '收敛凤凰', '泰勒术士'],
  '线性代数': ['矩阵石像', '行列式骑士', '特征值魔王'],
  '概率统计': ['概率妖精', '分布幽灵', '期望恶魔'],
};

const MONSTER_EMOJIS = ['👾', '👹', '👺', '🐲', '🦇', '👻', '💀', '🤖', '👽', '🎃'];

interface Monster {
  topic: string;
  name: string;
  emoji: string;
  defeated: number;
  total: number;
}

export default function MonsterCollection() {
  const { mastered, pending } = useWrongBook();

  // 统计每个专题击败的怪物数量
  const monsters = useMemo<Monster[]>(() => {
    const result: Monster[] = [];
    
    // 所有专题的怪物池
    Object.entries(MONSTER_NAMES).forEach(([topic, names]) => {
      // 已击败的数量 = 该专题已掌握的错题数
      const masteredInTopic = mastered.filter(w => w.topicKey === topic).length;
      // 遇到过的数量 = 已掌握 + 待复习
      const encounteredInTopic = masteredInTopic + pending.filter(w => w.topicKey === topic).length;
      
      names.forEach((name, idx) => {
        result.push({
          topic,
          name,
          emoji: MONSTER_EMOJIS[(idx + Object.keys(MONSTER_NAMES).indexOf(topic)) % MONSTER_EMOJIS.length],
          defeated: Math.min(masteredInTopic, idx + 1), // 粗略统计
          total: encounteredInTopic,
        });
      });
    });
    
    return result;
  }, [mastered, pending]);

  const totalDefeated = mastered.length;
  const totalEncountered = mastered.length + pending.length;
  const discoveryRate = totalEncountered > 0 ? Math.round((totalDefeated / totalEncountered) * 100) : 0;

  // 按专题分组
  const monstersByTopic = useMemo(() => {
    const grouped: Record<string, Monster[]> = {};
    monsters.forEach(m => {
      if (!grouped[m.topic]) grouped[m.topic] = [];
      grouped[m.topic].push(m);
    });
    return grouped;
  }, [monsters]);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <Skull className="size-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold tabular-nums">{totalDefeated}</div>
            <div className="text-xs text-muted-foreground mt-1">已击败怪物</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <BookOpen className="size-6 mx-auto mb-2 text-amber-500" />
            <div className="text-2xl font-bold tabular-nums">{totalEncountered}</div>
            <div className="text-xs text-muted-foreground mt-1">遇到过的怪物</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Trophy className="size-6 mx-auto mb-2 text-emerald-500" />
            <div className="text-2xl font-bold tabular-nums">{discoveryRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">收集进度</div>
          </CardContent>
        </Card>
      </div>

      {/* 怪物图鉴 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            怪物图鉴
          </CardTitle>
          <CardDescription>
            击败错题怪物就能收集它们！每个专题都有 3 只专属怪物
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.entries(monstersByTopic).map(([topic, topicMonsters]) => (
            <div key={topic} className="mb-6 last:mb-0">
              <div className="text-sm font-semibold mb-3 text-foreground">{topic}</div>
              <div className="grid grid-cols-3 gap-3">
                {topicMonsters.map((monster, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'relative p-4 rounded-xl border text-center transition-all',
                      monster.defeated > 0
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-muted/30 border-border/50 opacity-60'
                    )}
                  >
                    <div className="text-4xl mb-2">{monster.emoji}</div>
                    <div className="text-sm font-medium">{monster.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {monster.defeated > 0 ? `已击败 ×${monster.defeated}` : '未发现'}
                    </div>
                    {monster.defeated > 0 && (
                      <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
