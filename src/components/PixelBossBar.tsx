import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { scopedStorage } from '@/lib/lark-mock';
import { Skull, Swords, Trophy, Coins, Star, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PixelBossBarProps {
  totalWrong: number;
  pendingWrong: number;
  onCorrectOne: () => void; // 父级触发答对时调用
}

const STORAGE_KEY = 'mathforge_pixel_boss_state';

interface BossState {
  maxHp: number;
  currentHp: number;
  defeated: boolean;
  weekStart: number; // timestamp
  totalDefeated: number;
}

function getWeekStart(): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1; // Monday as start
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - diff);
  return monday.getTime();
}

export default function PixelBossBar({ totalWrong, pendingWrong }: PixelBossBarProps) {
  const { skin } = useTheme();
  const [bossState, setBossState] = useState<BossState>(() => {
    try {
      const raw = scopedStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BossState;
        const ws = getWeekStart();
        // 新的一周则重置
        if (parsed.weekStart !== ws) {
          const maxHp = Math.max(totalWrong * 10, 10);
          return { maxHp, currentHp: maxHp, defeated: false, weekStart: ws, totalDefeated: parsed.totalDefeated || 0 };
        }
        return parsed;
      }
    } catch {
      /* ignore */
    }
    const maxHp = Math.max(totalWrong * 10, 10);
    return { maxHp, currentHp: maxHp, defeated: false, weekStart: getWeekStart(), totalDefeated: 0 };
  });

  const [showVictory, setShowVictory] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);

  // 持久化
  useEffect(() => {
    scopedStorage.setItem(STORAGE_KEY, JSON.stringify(bossState));
  }, [bossState]);

  // 外部答对 → 扣血
  useEffect(() => {
    const handler = () => {
      setBossState((prev) => {
        if (prev.defeated) return prev;
        const newHp = Math.max(0, prev.currentHp - 10);
        const defeated = newHp <= 0;
        if (defeated) {
          setShowVictory(true);
          return { ...prev, currentHp: 0, defeated: true, totalDefeated: prev.totalDefeated + 1 };
        }
        return { ...prev, currentHp: newHp };
      });
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 400);
    };
    window.addEventListener('mathforge:boss-damage', handler as EventListener);
    return () => window.removeEventListener('mathforge:boss-damage', handler as EventListener);
  }, []);

  // total 变化且未击败时，同步最大 HP（新增错题时同步增长）
  useEffect(() => {
    if (!bossState.defeated) {
      const expectedMax = Math.max(totalWrong * 10, 10);
      if (expectedMax !== bossState.maxHp) {
        const diff = expectedMax - bossState.maxHp;
        setBossState((prev) => ({
          ...prev,
          maxHp: expectedMax,
          currentHp: Math.max(0, Math.min(expectedMax, prev.currentHp + diff)),
        }));
      }
    }
  }, [totalWrong, bossState.maxHp, bossState.defeated]);

  const hpPercent = useMemo(() => {
    if (bossState.maxHp <= 0) return 0;
    return (bossState.currentHp / bossState.maxHp) * 100;
  }, [bossState.currentHp, bossState.maxHp]);

  const handleReset = useCallback(() => {
    const maxHp = Math.max(totalWrong * 10, 10);
    setBossState((prev) => ({
      maxHp,
      currentHp: maxHp,
      defeated: false,
      weekStart: getWeekStart(),
      totalDefeated: prev.totalDefeated,
    }));
    setShowVictory(false);
  }, [totalWrong]);

  if (skin !== 'pixel') return null;

  return (
    <>
      <div
        className="w-full"
        style={{
          backgroundColor: '#141a16',
          border: '4px solid #0d120e',
          boxShadow: '4px 4px 0 #0d120e',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          imageRendering: 'pixelated',
        }}
      >
        {/* BOSS 头部信息 */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Skull
              className="size-6 md:size-7"
              style={{
                color: '#ff4d4d',
                animation: damageFlash ? 'boss-shake 0.3s steps(3)' : undefined,
              }}
            />
            <div>
              <div
                className="text-xs md:text-sm font-bold tracking-wider"
                style={{ color: '#ff4d4d', textShadow: '2px 2px 0 #0d120e' }}
              >
                周常 BOSS · 错题魔王
              </div>
              <div className="text-xs" style={{ color: '#5db877' }}>
                剩余 {pendingWrong} 道错题待攻克
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: '#ffd93d' }}>
              累计击败 {bossState.totalDefeated} 次
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs mt-1 px-2 py-0.5 ml-auto"
              style={{
                backgroundColor: '#ffd93d',
                color: '#141a16',
                border: '2px solid #0d120e',
                fontWeight: 'bold',
              }}
            >
              <RefreshCcw className="size-3" />
              下周再来
            </button>
          </div>
        </div>

        {/* HP 血条 */}
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between text-xs mb-1" style={{ color: '#ffd93d' }}>
            <span className="tracking-wider">HP</span>
            <span className="font-bold tabular-nums">
              {bossState.currentHp} / {bossState.maxHp}
            </span>
          </div>
          <div
            className="w-full h-4 relative overflow-hidden"
            style={{
              backgroundColor: '#0d120e',
              border: '2px solid #0d120e',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            <motion.div
              className="h-full"
              initial={{ width: '100%' }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                backgroundColor: hpPercent > 50 ? '#ff4d4d' : hpPercent > 25 ? '#ff9f43' : '#ff4d4d',
                backgroundImage:
                  'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.3) 100%)',
                imageRendering: 'pixelated',
              }}
            />
            {/* 像素分段线 */}
            <div className="absolute inset-0 flex pointer-events-none">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ borderRight: i < 9 ? '1px solid rgba(0,0,0,0.4)' : 'none' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOSS 击败弹窗 */}
      <AnimatePresence>
        {showVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(13,18,14,0.85)' }}
            onClick={() => setShowVictory(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full max-w-sm text-center"
              style={{
                backgroundColor: '#1a2f23',
                border: '4px solid #0d120e',
                boxShadow: '6px 6px 0 #0d120e',
                fontFamily: 'ui-monospace, monospace',
                imageRendering: 'pixelated',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 爆炸星花 */}
              <div className="relative py-6">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: 360 }}
                    transition={{
                      delay: 0.1 + i * 0.05,
                      duration: 0.6,
                      type: 'spring',
                    }}
                    className="absolute"
                    style={{
                      left: `${15 + (i % 4) * 25}%`,
                      top: i < 4 ? '10%' : '60%',
                    }}
                  >
                    <Star
                      className="size-6 md:size-8"
                      fill="#ffd93d"
                      style={{ color: '#ffd93d' }}
                    />
                  </motion.div>
                ))}

                <div className="relative z-10">
                  <Trophy
                    className="size-16 md:size-20 mx-auto mb-3"
                    style={{ color: '#ffd93d', filter: 'drop-shadow(3px 3px 0 #0d120e)' }}
                  />
                  <div
                    className="text-2xl md:text-3xl font-black tracking-wider mb-1"
                    style={{
                      color: '#7dff9a',
                      textShadow: '3px 3px 0 #0d120e, 0 0 12px rgba(125,255,154,0.5)',
                    }}
                  >
                    BOSS 击败！
                  </div>
                  <div className="text-xs mb-5" style={{ color: '#5db877' }}>
                    本周错题全部攻克，魔王败退！
                  </div>
                </div>
              </div>

              {/* 奖励 */}
              <div
                className="mx-4 mb-4 p-3 space-y-2"
                style={{
                  backgroundColor: '#141a16',
                  border: '2px solid #0d120e',
                }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5" style={{ color: '#ffd93d' }}>
                    <Coins className="size-4" />
                    金币奖励
                  </span>
                  <span className="font-bold tabular-nums" style={{ color: '#ffd93d' }}>
                    +100
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5" style={{ color: '#7dff9a' }}>
                    <Star className="size-4 fill-current" />
                    经验奖励
                  </span>
                  <span className="font-bold tabular-nums" style={{ color: '#7dff9a' }}>
                    +200 EXP
                  </span>
                </div>
              </div>

              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => setShowVictory(false)}
                  className="flex-1 py-2 text-sm font-bold"
                  style={{
                    backgroundColor: '#7dff9a',
                    color: '#141a16',
                    border: '2px solid #0d120e',
                    boxShadow: '2px 2px 0 #0d120e',
                  }}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Swords className="size-4" />
                    继续探索
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 工具函数：外部答对时派发事件，让 BOSS 扣血
export function dispatchBossDamage() {
  window.dispatchEvent(new CustomEvent('mathforge:boss-damage'));
}
