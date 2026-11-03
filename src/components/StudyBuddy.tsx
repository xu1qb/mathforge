import { useEffect, useRef, useState } from 'react';

const QUIPS = [
  '这题你行的。',
  '别急，先把条件抄一遍。',
  '想想单位圆。',
  '洛必达不是万能的，但很好用。',
  '你已经做对一半了。',
  '先试个特殊值？',
  '罗尔定理三个条件，你漏了哪个？',
  '泰勒展开真香。',
  '喝口水，再看一眼。',
  '这步换元，试试 t = tan(x/2)？',
  '积分不行就分部积分。',
  '你比昨天强了。',
];

type BuddyState = 'reading' | 'stretching' | 'sleeping' | 'cheer';

const COLLAPSE_KEY = 'mathforge:buddy-collapsed';

/** 手机屏幕小，默认收成一个小圆点，避免压住正文；桌面保持展开 */
function initialCollapsed(): boolean {
  try {
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved !== null) return saved === '1';
  } catch {
    /* 隐私模式下读不到 localStorage，按默认来 */
  }
  return window.innerWidth < 768;
}

export default function StudyBuddy() {
  const [state, setState] = useState<BuddyState>('reading');
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);

  const setCollapsedPersist = (next: boolean) => {
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
    } catch {
      /* 存不进去也不影响本次会话 */
    }
  };
  const [quip, setQuip] = useState<string | null>(null);
  const activeTimeRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<number | null>(null);

  // 25 分钟连续学习 → 伸懒腰 + 弹鼓励
  useEffect(() => {
    const stretch = window.setInterval(() => {
      if (Date.now() - activeTimeRef.current >= 25 * 60 * 1000) {
        setState('stretching');
        setQuip('已经学了 25 分钟，起来伸个懒腰喝口水吧！');
      }
    }, 30000);
    return () => window.clearInterval(stretch);
  }, []);

  // 监听用户活动（点击/滚动/按键），重置活跃时间；30 分钟无操作 → 打瞌睡
  useEffect(() => {
    const bump = () => {
      activeTimeRef.current = Date.now();
      setState((s) => (s === 'sleeping' ? 'reading' : s));
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        setState('sleeping');
      }, 30 * 60 * 1000);
    };
    const cheer = () => {
      setState('cheer');
      window.setTimeout(() => setState('reading'), 1500);
    };
    bump();
    window.addEventListener('click', bump);
    window.addEventListener('scroll', bump);
    window.addEventListener('keydown', bump);
    window.addEventListener('mathforge:answer-correct', cheer);
    return () => {
      window.removeEventListener('click', bump);
      window.removeEventListener('scroll', bump);
      window.removeEventListener('keydown', bump);
      window.removeEventListener('mathforge:answer-correct', cheer);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  const handleClick = () => {
    setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)]);
    activeTimeRef.current = Date.now();
    setState('reading');
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsedPersist(false)}
        aria-label="展开学习搭子"
        className="fixed bottom-20 left-3 z-40 size-8 rounded-full bg-primary/15 text-primary text-xs shadow-sm flex items-center justify-center hover:scale-110 transition-transform md:left-auto md:right-24"
      >
        🧮
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-3 z-40 flex flex-col items-end gap-1 select-none md:right-24">
      {quip && (
        <div className="max-w-[180px] rounded-xl bg-popover text-popover-foreground text-xs px-3 py-2 shadow-md border border-border animate-in fade-in slide-in-from-bottom-2">
          {quip}
          <button
            type="button"
            onClick={() => setQuip(null)}
            className="ml-2 text-muted-foreground hover:text-foreground"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        aria-label="学习搭子"
        className="study-buddy"
      >
        <BuddyFigure state={state} />
      </button>
      <button
        type="button"
        onClick={() => setCollapsedPersist(true)}
        aria-label="收起学习搭子"
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        收起
      </button>
    </div>
  );
}

function BuddyFigure({ state }: { state: BuddyState }) {
  return (
    <div className={`buddy-figure buddy-${state}`}>
      {/* 头 */}
      <div className="buddy-head">
        <div className="buddy-eye" />
        <div className="buddy-eye buddy-eye-r" />
      </div>
      {/* 身体 + 书 */}
      <div className="buddy-body">
        <div className="buddy-book" />
      </div>
    </div>
  );
}
