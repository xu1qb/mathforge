import { useState, useEffect } from 'react';
import { Sword, Heart, Star, RotateCcw, Trophy, Skull } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWrongBook } from '@/hooks/use-learning';
import MathRenderer from '@/components/MathRenderer';
import { toast } from 'sonner';

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

function getMonsterName(topic: string, index: number): string {
  const pool = MONSTER_NAMES[topic] || ['数学小怪'];
  return pool[index % pool.length];
}

function getMonsterEmoji(index: number): string {
  const emojis = ['👾', '👹', '👺', '🐲', '🦇', '👻', '💀', '🤖'];
  return emojis[index % emojis.length];
}

export default function AdventureMode() {
  const { pending, markReviewRemembered } = useWrongBook();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hp, setHp] = useState(100);
  const [exp, setExp] = useState(0);
  const [level, setLevel] = useState(1);
  const [kills, setKills] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>(['冒险开始！击败错题怪物！']);

  const currentQuestion = pending[currentIndex];
  const monsterName = currentQuestion ? getMonsterName(currentQuestion.topicKey, currentIndex) : '';
  const monsterHp = 30 + level * 10;
  const [monsterCurrentHp, setMonsterCurrentHp] = useState(monsterHp);

  useEffect(() => {
    if (currentQuestion) {
      setMonsterCurrentHp(monsterHp);
      setShowAnswer(false);
    }
  }, [currentIndex, currentQuestion]);

  const addLog = (msg: string) => {
    setBattleLog((prev) => [...prev.slice(-5), msg]);
  };

  const handleCorrect = () => {
    if (!currentQuestion) return;
    const damage = 20 + Math.floor(Math.random() * 15);
    const newMonsterHp = monsterCurrentHp - damage;
    addLog(`你造成 ${damage} 点伤害！`);

    if (newMonsterHp <= 0) {
      addLog(`⚔️ 击败了 ${monsterName}！`);
      setKills((k) => k + 1);
      const gainedExp = 20 + Math.floor(Math.random() * 10);
      const newExp = exp + gainedExp;
      setExp(newExp);
      addLog(`获得 ${gainedExp} 经验值`);

      // 升级
      if (newExp >= level * 50) {
        setLevel((l) => l + 1);
        setHp(100);
        addLog(`🎉 升级到 Lv.${level + 1}！血量回满！`);
        toast.success(`升级到 Lv.${level + 1}！`);
      }

      // 推进复习阶段
      markReviewRemembered(currentQuestion.id);

      // 下一题
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % pending.length);
      }, 1500);
    } else {
      setMonsterCurrentHp(newMonsterHp);
    }
  };

  const handleWrong = () => {
    if (!currentQuestion) return;
    const damage = 10 + Math.floor(Math.random() * 10);
    const newHp = hp - damage;
    addLog(`${monsterName} 反击！你受到 ${damage} 点伤害`);
    setHp(newHp);

    if (newHp <= 0) {
      setGameOver(true);
      addLog('💀 你被打败了...回城休息吧');
    }
  };

  const restart = () => {
    setHp(100);
    setExp(0);
    setLevel(1);
    setKills(0);
    setCurrentIndex(0);
    setGameOver(false);
    setBattleLog(['冒险重新开始！']);
  };

  if (pending.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <Trophy className="size-12 mx-auto text-primary mb-4" />
          <div className="text-lg font-medium text-foreground mb-2">没有待复习的错题</div>
          <div className="text-sm text-muted-foreground">去做几道题攒点怪物吧！</div>
        </CardContent>
      </Card>
    );
  }

  if (gameOver) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <Skull className="size-16 mx-auto text-destructive mb-4" />
          <div className="text-xl font-medium text-foreground mb-2">冒险结束</div>
          <div className="text-sm text-muted-foreground mb-1">击败怪物：{kills}</div>
          <div className="text-sm text-muted-foreground mb-4">最终等级：Lv.{level}</div>
          <Button onClick={restart}>
            <RotateCcw className="size-4 mr-2" />
            重新冒险
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 状态栏 */}
      <Card className="bg-card border-border">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-primary" />
              <span className="text-sm font-medium">Lv.{level}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              第 {currentIndex + 1}/{pending.length} 只怪物
            </div>
          </div>
          {/* 血条 */}
          <div className="flex items-center gap-2 mb-2">
            <Heart className="size-4 text-red-500 shrink-0" />
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${hp}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{hp}</span>
          </div>
          {/* 经验条 */}
          <div className="flex items-center gap-2">
            <Sword className="size-4 text-amber-500 shrink-0" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${(exp % 50) / 50 * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{exp % 50}/50</span>
          </div>
        </CardContent>
      </Card>

      {/* 怪物信息 */}
      <Card className="bg-card border-border">
        <CardContent className="py-4 px-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{getMonsterEmoji(currentIndex)}</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{monsterName}</div>
              <div className="text-xs text-muted-foreground">{currentQuestion?.topicKey}</div>
            </div>
          </div>
          {/* 怪物血条 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${(monsterCurrentHp / monsterHp) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {monsterCurrentHp}/{monsterHp}
            </span>
          </div>
          {/* 题目 */}
          <div className="bg-muted/50 rounded-xl p-3 mb-3">
            <MathRenderer expression={currentQuestion?.question.questionLatex || ''} displayMode />
          </div>
          {/* 答案区 */}
          {showAnswer ? (
            <div className="space-y-2">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3">
                <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">正确答案</div>
                <MathRenderer expression={currentQuestion?.question.answerDisplay || ''} displayMode />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleCorrect}
                >
                  <Sword className="size-4 mr-1" />
                  我答对了
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={handleWrong}
                >
                  我答错了
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowAnswer(true)}
            >
              查看答案
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 战斗日志 */}
      <Card className="bg-card border-border">
        <CardContent className="py-2 px-4">
          {battleLog.map((log, i) => (
            <div key={i} className="text-xs text-muted-foreground py-0.5">
              {log}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
