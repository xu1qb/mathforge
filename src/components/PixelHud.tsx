import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { scopedStorage, logger } from '@/lib/lark-mock';
import { computeDashboardData } from '@/data/competition-dashboard';
import { Heart, Skull, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

const COINS_KEY = 'mathforge_pixel_coins';
const HP_KEY = 'mathforge_pixel_hp';
const MAX_HP = 100;

// 监听做题/答题事件，金币 +10
function useCoins() {
  const [coins, setCoins] = useState(0);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    try {
      const saved = scopedStorage.getItem(COINS_KEY);
      if (saved) setCoins(parseInt(saved, 10) || 0);
    } catch { /* ignore */ }
  }, []);

  // 监听答题正确事件
  useEffect(() => {
    const onAnswerCorrect = () => {
      setCoins((prev) => {
        const next = prev + 10;
        try {
          scopedStorage.setItem(COINS_KEY, String(next));
        } catch { /* ignore */ }
        return next;
      });
      setBump(true);
      setTimeout(() => setBump(false), 400);
    };

    window.addEventListener('mathforge:answer-correct', onAnswerCorrect);
    return () => window.removeEventListener('mathforge:answer-correct', onAnswerCorrect);
  }, []);

  return { coins, bump };
}

function useLevel() {
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        const data = computeDashboardData();
        setTotalQuestions(data.totalQuestions ?? 0);
      } catch (e) {
        logger.warn('computeDashboardData failed:', String(e));
      }
    };
    update();
    const interval = setInterval(update, 5000);
    window.addEventListener('storage', update);
    window.addEventListener('mathforge:practice-update', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', update);
      window.removeEventListener('mathforge:practice-update', update);
    };
  }, []);

  const level = Math.floor(totalQuestions / 100) + 1;
  const currentExp = totalQuestions % 100;
  const expNeeded = 100;

  return { level, currentExp, expNeeded, totalQuestions };
}

// HP 系统：答错 -15，答对 +2（最多回满），HP 归零弹休息提示并回血
export function usePixelHp() {
  const [hp, setHp] = useState(MAX_HP);
  const [damageFlash, setDamageFlash] = useState(false);
  const [healFlash, setHealFlash] = useState(false);
  const [dead, setDead] = useState(false);

  // 初始化
  useEffect(() => {
    try {
      const saved = scopedStorage.getItem(HP_KEY);
      if (saved) {
        const v = parseInt(saved, 10);
        if (!isNaN(v) && v > 0 && v <= MAX_HP) setHp(v);
      }
    } catch { /* ignore */ }
  }, []);

  // 持久化
  useEffect(() => {
    try {
      scopedStorage.setItem(HP_KEY, String(hp));
    } catch { /* ignore */ }
  }, [hp]);

  // 监听答题事件
  useEffect(() => {
    const onCorrect = () => {
      setHp((prev) => {
        const next = Math.min(MAX_HP, prev + 2);
        return next;
      });
      setHealFlash(true);
      setTimeout(() => setHealFlash(false), 300);
    };

    const onWrong = () => {
      setHp((prev) => {
        const next = Math.max(0, prev - 15);
        if (next <= 0 && prev > 0) {
          setDead(true);
          // 派发 HP 耗尽事件，答题面板监听后强制结束
          setTimeout(() => {
            try {
              window.dispatchEvent(new CustomEvent('mathforge:hp-dead'));
            } catch { /* ignore */ }
          }, 0);
        }
        return next;
      });
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 400);
    };

    const onAnswer = (e: Event) => {
      const ce = e as CustomEvent<{ correct: boolean }>;
      if (ce.detail?.correct) onCorrect();
      else onWrong();
    };

    window.addEventListener('mathforge:answer-result', onAnswer);
    return () => window.removeEventListener('mathforge:answer-result', onAnswer);
  }, []);

  // 休息回血
  const restHeal = useMemo(() => () => {
    setHp(MAX_HP);
    setDead(false);
    setHealFlash(true);
    setTimeout(() => setHealFlash(false), 500);
    try {
      window.dispatchEvent(new CustomEvent('mathforge:hp-rest'));
    } catch { /* ignore */ }
  }, []);

  return { hp, maxHp: MAX_HP, damageFlash, healFlash, dead, restHeal };
}

export default function PixelHud() {
  const { skin } = useTheme();
  const { level, currentExp, expNeeded } = useLevel();
  const { coins, bump } = useCoins();
  const { hp, maxHp, damageFlash, healFlash, dead, restHeal } = usePixelHp();

  if (skin !== 'pixel') return null;

  // 经验条分段（8-bit 跳跃式，每 10% 一格）
  const expSegments = 10;
  const filledExp = Math.floor((currentExp / expNeeded) * expSegments);

  // HP 分段（10 格）
  const hpSegments = 10;
  const filledHp = Math.ceil((hp / maxHp) * hpSegments);
  const hpLow = hp <= maxHp * 0.3;
  const hpColor = hpLow ? '#ff4d4d' : '#7dff9a';

  return (
    <div
      className={cn(
        'w-full px-2 md:px-4 py-2 flex items-center justify-between gap-3 relative overflow-hidden',
        damageFlash && 'pixel-damage-flash',
        healFlash && 'pixel-heal-flash',
      )}
      style={{
        backgroundColor: '#1a2f23',
        borderBottom: '4px solid #141a16',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        imageRendering: 'pixelated',
      }}
    >
      {/* 左侧：等级 + 经验条 + HP */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Lv 标签 */}
        <div
          className="px-2 py-1 text-xs md:text-sm font-bold tracking-wide"
          style={{
            backgroundColor: '#141a16',
            border: '3px solid #7dff9a',
            color: '#7dff9a',
            letterSpacing: '0.05em',
          }}
        >
          Lv.{level}
        </div>

        {/* 经验条 */}
        <div className="flex flex-col gap-0.5 hidden sm:flex">
          <div
            className="flex gap-px"
            style={{
              width: '120px',
              height: '14px',
              padding: '2px',
              backgroundColor: '#141a16',
              border: '2px solid #0d120e',
            }}
          >
            {Array.from({ length: expSegments }).map((_, i) => (
              <div
                key={i}
                className="flex-1"
                style={{
                  backgroundColor: i < filledExp ? '#7dff9a' : '#2a4a36',
                  transition: 'none',
                }}
              />
            ))}
          </div>
          <div
            className="text-xs font-mono tracking-wider"
            style={{ color: '#5db877' }}
          >
            EXP {currentExp}/{expNeeded}
          </div>
        </div>

        {/* HP 条 */}
        <div className="flex flex-col gap-0.5">
          <div
            className="flex gap-px"
            style={{
              width: '100px',
              height: '14px',
              padding: '2px',
              backgroundColor: '#141a16',
              border: '2px solid #0d120e',
            }}
          >
            {Array.from({ length: hpSegments }).map((_, i) => (
              <div
                key={i}
                className="flex-1"
                style={{
                  backgroundColor: i < filledHp ? hpColor : '#2a4a36',
                  transition: 'none',
                  animation: hpLow && i < filledHp
                    ? 'pixel-hp-blink 0.5s steps(2) infinite'
                    : undefined,
                }}
              />
            ))}
          </div>
          <div
            className="text-xs font-mono tracking-wider flex items-center gap-1"
            style={{ color: hpColor }}
          >
            <Heart className="size-3 fill-current" style={{ color: hpColor }} />
            HP {hp}/{maxHp}
          </div>
        </div>
      </div>

      {/* 右侧：金币 */}
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            'size-6 md:size-7 flex items-center justify-center relative',
            bump && 'animate-bounce',
          )}
          style={{
            backgroundColor: '#ffd93d',
            border: '3px solid #b8860b',
            borderRadius: '50%',
            boxShadow: bump ? '0 0 8px #ffd93d' : 'none',
          }}
        >
          <span
            className="text-xs font-bold"
            style={{ color: '#8b6914', fontFamily: 'monospace' }}
          >
            ¢
          </span>
        </div>
        <span
          className="text-sm md:text-base font-bold font-mono tracking-wider"
          style={{ color: '#ffd93d', textShadow: '2px 2px 0 #141a16' }}
        >
          {coins.toLocaleString()}
        </span>
      </div>

      {/* HP 耗尽休息弹窗 */}
      {dead && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(20,26,22,0.92)' }}
        >
          <div
            className="px-6 py-4 text-center"
            style={{
              backgroundColor: '#1a2f23',
              border: '4px solid #ff4d4d',
              boxShadow: '4px 4px 0 #141a16',
            }}
          >
            <div
              className="text-lg font-bold font-mono mb-2"
              style={{ color: '#ff4d4d' }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Skull className="size-5" style={{ color: '#ff4d4d' }} />
                <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>HP 耗尽！</span>
              </div>
            </div>
            <div
              className="text-xs font-mono mb-4"
              style={{ color: '#7dff9a' }}
            >
              少侠请休息一下，喝口药水～
            </div>
            <button
              type="button"
              onClick={restHeal}
              className="px-4 py-2 text-sm font-bold font-mono"
              style={{
                backgroundColor: '#7dff9a',
                color: '#141a16',
                border: '3px solid #141a16',
                boxShadow: '2px 2px 0 #141a16',
              }}
            >
              <span className="flex items-center gap-1.5">
                <FlaskConical className="size-4" />
                喝药水回血
              </span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pixel-hp-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .pixel-damage-flash::after {
          content: '';
          position: absolute;
          inset: 0;
          background-color: rgba(255, 77, 77, 0.3);
          pointer-events: none;
          animation: pixel-red-flash 0.4s steps(2);
        }
        .pixel-heal-flash::after {
          content: '';
          position: absolute;
          inset: 0;
          background-color: rgba(125, 255, 154, 0.15);
          pointer-events: none;
          animation: pixel-green-flash 0.3s steps(2);
        }
        @keyframes pixel-red-flash {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes pixel-green-flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
