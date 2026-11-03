import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Clock } from 'lucide-react';

interface ExamCountdownLcdProps {
  examDate?: Date;
}

function getExamDate(): Date {
  // 默认 2026-11-14 09:00
  return new Date('2026-11-14T09:00:00+08:00');
}

function calcRemain(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds };
}

export default function ExamCountdownLcd({ examDate }: ExamCountdownLcdProps) {
  const { skin } = useTheme();
  const target = examDate ?? getExamDate();
  const [remain, setRemain] = useState(() => calcRemain(target));
  const [colonOn, setColonOn] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemain(calcRemain(target));
      setColonOn((v) => !v); // 冒号每秒闪烁
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (!remain) return null; // 已考试后隐藏

  const isPixel = skin === 'pixel';
  const isJournal = skin === 'journal';
  const isPaper = skin === 'paper';
  const isNight = skin === 'night';

  const lcdColor =
    isNight ? 'hsl(42 90% 55%)' :
    isPaper ? '#4a3f35' :
    isPixel ? '#7dff9a' :
    isJournal ? '#c0392b' :
    '#0f766e';

  const bgColor =
    isPixel ? '#0d120e' :
    isJournal ? '#fffdf5' :
    isPaper ? '#f0e6c8' :
    '#0a0f12';

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-2 select-none"
      style={{
        backgroundColor: bgColor,
        borderRadius: isPixel ? '0' : '6px',
        border: isPixel ? '3px solid #0d120e' : 'none',
        boxShadow:
          'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(255,255,255,0.05)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      }}
    >
      <Clock
        className="size-3.5 shrink-0"
        style={{ color: lcdColor, opacity: 0.8 }}
      />
      <span
        className="text-sm font-bold tabular-nums tracking-wider leading-none"
        style={{
          color: lcdColor,
          textShadow: isNight || isPixel ? `0 0 6px ${lcdColor}40` : 'none',
          opacity: 0.9,
        }}
      >
        {remain.days > 0 ? (
          <>
            D-{remain.days}
            <span style={{ opacity: colonOn ? 1 : 0.3, margin: '0 2px' }}>·</span>
            {String(remain.hours).padStart(2, '0')}
            <span style={{ opacity: colonOn ? 1 : 0.3 }}>:</span>
            {String(remain.minutes).padStart(2, '0')}
            <span style={{ opacity: colonOn ? 1 : 0.3 }}>:</span>
            {String(remain.seconds).padStart(2, '0')}
          </>
        ) : (
          <>
            {String(remain.hours).padStart(2, '0')}
            <span style={{ opacity: colonOn ? 1 : 0.3 }}>:</span>
            {String(remain.minutes).padStart(2, '0')}
            <span style={{ opacity: colonOn ? 1 : 0.3 }}>:</span>
            {String(remain.seconds).padStart(2, '0')}
          </>
        )}
      </span>
    </div>
  );
}
