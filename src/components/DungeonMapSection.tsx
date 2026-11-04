import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { COMPETITION_TOPICS, type CompetitionTopic } from '@/data/competition';
import { computeDashboardData, type TopicStat } from '@/data/competition-dashboard';
import {
  Infinity as InfinityIcon,
  FunctionSquare,
  BookOpen,
  Layers,
  BarChart3,
  Sigma,
  GitBranch,
  Shapes,
  Flag,
  Lock,
  Skull,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NODE_ICONS: Record<string, typeof InfinityIcon> = {
  'limit-continuity': InfinityIcon,
  'single-var-diff': FunctionSquare,
  'single-var-int': BookOpen,
  'multi-var-diff': Layers,
  'multi-var-int': BarChart3,
  'infinite-series': Sigma,
  'ode': GitBranch,
  'space-geo': Shapes,
};

const getNodeIcon = (key: string) => NODE_ICONS[key] ?? Sparkles;

interface DungeonNode {
  topic: CompetitionTopic;
  stat?: TopicStat;
  state: 'cleared' | 'current' | 'locked';
  accuracy: number;
  x: number; // 0-100 百分比
  y: number; // 0-100 百分比
}

interface DungeonMapSectionProps {
  masteredTopics: string[];
  onSelectTopic: (t: CompetitionTopic) => void;
}

export default function DungeonMapSection({ masteredTopics, onSelectTopic }: DungeonMapSectionProps) {
  const { skin } = useTheme();
  const [stats, setStats] = useState<TopicStat[]>([]);

  // 读取统计数据（会刷新）
  useEffect(() => {
    const update = () => {
      try {
        const data = computeDashboardData();
        setStats(data.topicDistribution);
      } catch { /* ignore */ }
    };
    update();
    const interval = setInterval(update, 3000);
    window.addEventListener('storage', update);
    window.addEventListener('mathforge:practice-update', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', update);
      window.removeEventListener('mathforge:practice-update', update);
    };
  }, []);

  const nodes: DungeonNode[] = useMemo(() => {
    // S 形路径：第 1 行左 → 右，第 2 行右 → 左，第 3 行左 → 右
    const positions: { x: number; y: number }[] = [
      { x: 10, y: 12 },  // 1 左上
      { x: 40, y: 8 },   // 2 中上
      { x: 72, y: 14 },  // 3 右上
      { x: 88, y: 42 },  // 4 右中
      { x: 60, y: 52 },  // 5 中下（右往回）
      { x: 30, y: 48 },  // 6 左中
      { x: 12, y: 75 },  // 7 左下
      { x: 50, y: 85 },  // 8 中下（BOSS 关）
    ];

    // 找正确率最低的作为"当前关卡"
    let lowestKey: string | null = null;
    let lowestAcc = 1;
    COMPETITION_TOPICS.forEach((t) => {
      const stat = stats.find((s) => s.topicKey === t.key);
      const acc = stat?.accuracy ?? 0;
      const cleared = masteredTopics.includes(t.key) || acc >= 0.8;
      if (!cleared && acc > 0 && acc < lowestAcc) {
        lowestAcc = acc;
        lowestKey = t.key;
      }
    });
    // 如果没有做过题，第一个未掌握的当当前关卡
    if (!lowestKey) {
      const firstUncleared = COMPETITION_TOPICS.find(
        (t) => !masteredTopics.includes(t.key),
      );
      lowestKey = firstUncleared?.key ?? null;
    }

    return COMPETITION_TOPICS.map((topic, i) => {
      const stat = stats.find((s) => s.topicKey === topic.key);
      const acc = stat?.accuracy ?? 0;
      const cleared = masteredTopics.includes(topic.key) || acc >= 0.8;
      const isCurrent = topic.key === lowestKey;
      let state: 'cleared' | 'current' | 'locked';
      if (cleared) state = 'cleared';
      else if (isCurrent) state = 'current';
      else state = 'locked';

      return {
        topic,
        stat,
        state,
        accuracy: acc,
        x: positions[i]?.x ?? 50,
        y: positions[i]?.y ?? 50,
      };
    });
  }, [stats, masteredTopics]);

  if ((skin as string) !== 'pixel') return null;

  const handleNodeClick = (node: DungeonNode) => {
    if (node.state === 'locked') {
      // 允许直接进入但给提示
      onSelectTopic(node.topic);
      return;
    }
    onSelectTopic(node.topic);
  };

  return (
    <div
      className="relative w-full rounded-sm overflow-hidden"
      style={{
        backgroundColor: '#1a2f23',
        border: '4px solid #141a16',
        boxShadow: '4px 4px 0 0 #141a16',
        minHeight: '480px',
        // 像素点阵地面背景
        backgroundImage: `
          radial-gradient(circle, #141a16 1px, transparent 1px),
          linear-gradient(180deg, rgba(125,255,154,0.03) 0%, transparent 50%)
        `,
        backgroundSize: '16px 16px, 100% 100%',
      }}
    >
      {/* 顶部标题栏 */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{
          backgroundColor: '#141a16',
          borderBottom: '4px solid #0d120e',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-bold font-mono tracking-wider"
            style={{ color: '#7dff9a' }}
          >
            ▶ CHAPTER MAP
          </span>
        </div>
        <div className="text-xs font-mono" style={{ color: '#ffd93d' }}>
          {nodes.filter((n) => n.state === 'cleared').length} / {nodes.length} CLEARED
        </div>
      </div>

      {/* 地图区 */}
      <div className="relative w-full" style={{ height: '440px' }}>
        {/* 连接线（SVG 像素路径） */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* 虚线像素路径 - 用小线段模拟像素感 */}
          {nodes.slice(0, -1).map((n, i) => {
            const next = nodes[i + 1];
            return (
              <line
                key={i}
                x1={n.x}
                y1={n.y}
                x2={next.x}
                y2={next.y}
                stroke={n.state === 'cleared' ? '#7dff9a' : '#2a4a36'}
                strokeWidth="0.8"
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {/* 方向箭头 */}
          {nodes.slice(0, -1).map((n, i) => {
            const next = nodes[i + 1];
            const mx = (n.x + next.x) / 2;
            const my = (n.y + next.y) / 2;
            const angle = Math.atan2(next.y - n.y, next.x - n.x);
            return (
              <g
                key={`arr-${i}`}
                transform={`translate(${mx} ${my}) rotate(${(angle * 180) / Math.PI})`}
              >
                <polygon
                  points="2,0 -2,-1.5 -2,1.5"
                  fill={n.state === 'cleared' ? '#7dff9a' : '#2a4a36'}
                />
              </g>
            );
          })}
        </svg>

        {/* 节点 */}
        {nodes.map((node) => {
          const Icon = getNodeIcon(node.topic.key);
          const isCleared = node.state === 'cleared';
          const isCurrent = node.state === 'current';
          const isLocked = node.state === 'locked';

          return (
            <button
              key={node.topic.key}
              type="button"
              onClick={() => handleNodeClick(node)}
              className={cn(
                'absolute flex flex-col items-center gap-1 transition-none group',
              )}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                animation: isCurrent ? 'pixel-bounce 1s steps(2) infinite' : undefined,
              }}
            >
              {/* 关卡号 */}
              <div
                className="px-1.5 py-0.5 text-xs font-bold font-mono leading-none"
                style={{
                  backgroundColor: isCleared
                    ? '#7dff9a'
                    : isCurrent
                      ? '#ffd93d'
                      : '#2a4a36',
                  color: isCleared || isCurrent ? '#141a16' : '#5db877',
                  border: '2px solid #141a16',
                }}
              >
                STAGE {node.topic.index}
              </div>

              {/* 主节点方块 */}
              <div
                className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center"
                style={{
                  backgroundColor: isCleared
                    ? '#1f3a2b'
                    : isCurrent
                      ? '#2a4a36'
                      : '#141a16',
                  border: `4px solid ${
                    isCleared
                      ? '#7dff9a'
                      : isCurrent
                        ? '#ffd93d'
                        : '#2a4a36'
                  }`,
                  boxShadow: isCurrent
                    ? '0 0 0 2px #141a16, 0 0 12px rgba(255,217,61,0.6)'
                    : isCleared
                      ? '3px 3px 0 0 #141a16'
                      : '2px 2px 0 0 #0d120e',
                }}
              >
                <Icon
                  className="size-6 md:size-7"
                  style={{
                    color: isCleared
                      ? '#7dff9a'
                      : isCurrent
                        ? '#ffd93d'
                        : '#2a4a36',
                  }}
                  strokeWidth={2}
                />

                {/* 已通关：角落挂旗帜 */}
                {isCleared && (
                  <div
                    className="absolute -top-2 -right-2 size-5 flex items-center justify-center"
                    style={{
                      backgroundColor: '#7dff9a',
                      border: '2px solid #141a16',
                    }}
                  >
                    <Flag className="size-3" style={{ color: '#141a16' }} fill="currentColor" />
                  </div>
                )}

                {/* 当前关卡：感叹号徽章 */}
                {isCurrent && (
                  <div
                    className="absolute -top-2 -right-2 size-5 flex items-center justify-center font-bold font-mono text-xs"
                    style={{
                      backgroundColor: '#ff4d4d',
                      color: '#fff',
                      border: '2px solid #141a16',
                    }}
                  >
                    !
                  </div>
                )}

                {/* 锁定：锁图标 */}
                {isLocked && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(20,26,22,0.7)' }}
                  >
                    <Lock className="size-5" style={{ color: '#2a4a36' }} />
                  </div>
                )}
              </div>

              {/* 关卡名 */}
              <div
                className="text-xs font-bold font-mono text-center max-w-24 leading-tight"
                style={{
                  color: isCleared
                    ? '#7dff9a'
                    : isCurrent
                      ? '#ffd93d'
                      : '#5db877',
                  textShadow: '1px 1px 0 #141a16',
                }}
              >
                {node.topic.title.split('、')[0].split('·')[0]}
              </div>

              {/* 正确率 */}
              {(node.stat?.questions ?? 0) > 0 && (
                <div
                  className="text-xs font-mono"
                  style={{ color: isCleared ? '#7dff9a' : '#5db877' }}
                >
                  {Math.round(node.accuracy * 100)}%
                </div>
              )}
            </button>
          );
        })}

        {/* 右下角 BOSS 标记（最后一关） */}
        <div
          className="absolute bottom-2 right-3 flex items-center gap-1.5 text-xs font-mono"
          style={{ color: '#ff4d4d' }}
        >
          <Skull className="size-3.5" />
          FINAL BOSS
        </div>
      </div>

      {/* 底部图例 */}
      <div
        className="px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1"
        style={{
          backgroundColor: '#141a16',
          borderTop: '4px solid #0d120e',
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="size-3" style={{ backgroundColor: '#7dff9a', border: '2px solid #141a16' }} />
          <span className="text-xs font-mono" style={{ color: '#7dff9a' }}>CLEARED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3" style={{ backgroundColor: '#ffd93d', border: '2px solid #141a16' }} />
          <span className="text-xs font-mono" style={{ color: '#ffd93d' }}>CURRENT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3" style={{ backgroundColor: '#2a4a36', border: '2px solid #141a16' }} />
          <span className="text-xs font-mono" style={{ color: '#5db877' }}>LOCKED</span>
        </div>
      </div>

      {/* 像素弹跳 keyframes */}
      <style>{`
        @keyframes pixel-bounce {
          0% { transform: translate(-50%, -50%); }
          50% { transform: translate(-50%, calc(-50% - 6px)); }
          100% { transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
}
