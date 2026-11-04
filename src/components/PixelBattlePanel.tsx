import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { CompetitionQuestion } from '@/data/competition-questions';
import { COMPETITION_TOPICS } from '@/data/competition';
import RichTextRenderer from '@/components/RichTextRenderer';
import { SkipForward, Trophy, Swords, Skull, Castle, Sparkles, Coins, ScrollText } from 'lucide-react';
import { usePixelHp } from '@/components/PixelHud';
import type { AnswerMode, WrongReason } from '@/hooks/use-learning';
import { WRONG_REASON_LABELS } from '@/hooks/use-learning';
import { Calculator, Brain, Lightbulb, Eye } from 'lucide-react';

interface PixelBattlePanelProps {
  question: CompetitionQuestion;
  index: number;
  total: number;
  answered: boolean;
  answer?: { correct: boolean; partial?: boolean };
  showAnswer: boolean;
  onShowAnswer: () => void;
  onSubmit: (correct: boolean, partial?: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  elapsed: number;
  correctCount: number;
  answeredCount: number;
  answerMode: AnswerMode;
  questionStartTime: number;
  /** 答错后选错因回调（像素战斗模式用） */
  onWrongReasonSelect?: (reason: WrongReason) => void;
  /** 当前题的错因（已选） */
  wrongReason?: WrongReason;
}

export default function PixelBattlePanel(props: PixelBattlePanelProps) {
  const { skin } = useTheme();
  const { dead } = usePixelHp();

  if ((skin as string) !== 'pixel') return null;
  if (dead) return null; // HP 耗尽时不显示题目

  return (
    <div
      className="w-full px-2 md:px-4 py-2 flex flex-col lg:flex-row lg:items-center gap-3 relative overflow-hidden"
      style={{
        backgroundColor: '#1a2f23',
        borderBottom: '4px solid #141a16',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        imageRendering: 'pixelated',
      }}
    >
      {/* 手机端：顶部紧凑信息条 */}
      <div className="lg:hidden w-full">
        <MobileBattleHeader {...props} />
      </div>
      {/* 桌面端左侧：完整遭遇卡 */}
      <div className="hidden lg:block shrink-0">
        <BattleHeader {...props} />
      </div>
      {/* 中间主内容：对话框 */}
      <div className="flex-1 min-w-0 w-full lg:w-auto">
        <BattleDialog {...props} />
      </div>
      {/* 底部/右侧：指令菜单 */}
      <div className="w-full lg:w-auto lg:shrink-0 lg:max-w-[260px]">
        <BattleCommandMenu {...props} />
      </div>
      <BattleFeedbackOverlay />
    </div>
  );
}

// ========== 战斗头部：遭遇信息 + 进度 ==========
function BattleHeader({
  question,
  index,
  total,
  elapsed,
  correctCount,
  answeredCount,
}: PixelBattlePanelProps) {
  const topic = COMPETITION_TOPICS.find((t) => t.key === question.topicKey);
  const m = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  const timeStr = `${m}:${String(sec).padStart(2, '0')}`;
  const acc = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div
      className="px-3 py-2 flex flex-wrap items-center gap-2 text-xs font-mono"
      style={{
        backgroundColor: '#141a16',
        border: '4px solid #0d120e',
        boxShadow: '3px 3px 0 #0d120e',
      }}
    >
      <div
        className="px-2 py-0.5"
        style={{ backgroundColor: '#ff4d4d', color: '#fff', border: '2px solid #141a16' }}
      >
      <div className="flex items-center gap-2">
          <Swords className="size-4" style={{ color: '#ff4d4d' }} />
          <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>BATTLE</span>
        </div>
      </div>
      <div style={{ color: '#ffd93d' }}>
        遭遇：{topic?.title?.split('、')[0] || question.topicKey}
      </div>
      <div className="ml-auto flex items-center gap-3" style={{ color: '#5db877' }}>
        <span>
          {index + 1}/{total}
        </span>
        <span>⏱ {timeStr}</span>
        <span style={{ color: '#7dff9a' }}>
          ✓ {correctCount}/{answeredCount} ({acc}%)
        </span>
      </div>
    </div>
  );
}

// ========== 战斗头部（手机端紧凑版） ==========
function MobileBattleHeader({
  question,
  index,
  total,
  elapsed,
  correctCount,
  answeredCount,
}: PixelBattlePanelProps) {
  const topic = COMPETITION_TOPICS.find((t) => t.key === question.topicKey);
  const m = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  const timeStr = `${m}:${String(sec).padStart(2, '0')}`;
  const acc = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const difficultyLabel = {
    easy: 'SLIME',
    medium: 'GOBLIN',
    hard: 'BOSS',
  }[question.difficulty] || 'ENEMY';
  const difficultyColor = {
    easy: '#7dff9a',
    medium: '#ffd93d',
    hard: '#ff4d4d',
  }[question.difficulty] || '#7dff9a';

  return (
    <div
      className="px-2.5 py-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono"
      style={{
        backgroundColor: '#141a16',
        border: '3px solid #0d120e',
      }}
    >
      <div className="flex items-center gap-1.5">
        <Swords className="size-3" style={{ color: '#ff4d4d' }} />
        <span style={{ color: '#ffd93d', fontWeight: 'bold' }}>
          {topic?.title?.split('、')[0] || question.topicKey}
        </span>
      </div>
      <span style={{ color: '#7dff9a' }}>
        {index + 1}/{total}
      </span>
      <span style={{ color: '#5db877' }}>⏱{timeStr}</span>
      <span style={{ color: '#7dff9a' }}>
        ✓{correctCount}/{answeredCount}({acc}%)
      </span>
      <div
        className="ml-auto px-1.5 py-0.5 text-xs font-bold"
        style={{
          backgroundColor: difficultyColor,
          color: '#141a16',
          border: '1px solid #0d120e',
        }}
      >
        {difficultyLabel} · Lv.{question.points}
      </div>
    </div>
  );
}

// ========== 题目 = RPG 对话框 ==========
function BattleDialog({
  question,
  showAnswer,
  answered,
  answer,
  onWrongReasonSelect,
  wrongReason,
}: PixelBattlePanelProps) {
  const difficultyLabel = {
    easy: 'SLIME',
    medium: 'GOBLIN',
    hard: 'BOSS',
  }[question.difficulty] || 'ENEMY';

  const difficultyColor = {
    easy: '#7dff9a',
    medium: '#ffd93d',
    hard: '#ff4d4d',
  }[question.difficulty] || '#7dff9a';

  return (
    <div className="relative">
      {/* 对话框主体 */}
      <div
        className="relative p-4 md:p-5"
        style={{
          backgroundColor: '#1a2f23',
          border: '4px solid #141a16',
          boxShadow: '4px 4px 0 #141a16',
        }}
      >
        {/* 敌人信息栏（桌面端显示，手机端由顶部信息条承担） */}
        <div className="hidden md:flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '3px solid #141a16' }}>
          <div
            className="px-2 py-0.5 text-xs font-bold font-mono"
            style={{
              backgroundColor: difficultyColor,
              color: '#141a16',
              border: '2px solid #141a16',
            }}
          >
            {difficultyLabel}
          </div>
          <div className="text-xs font-mono" style={{ color: '#7dff9a' }}>
            Lv.{question.points} · {question.difficulty === 'hard' ? '困难' : question.difficulty === 'medium' ? '中等' : '基础'}
          </div>
          <div className="ml-auto text-xs font-mono" style={{ color: '#ffd93d' }}>
            {question.points} PTS
          </div>
        </div>

        {/* 题目内容 */}
        <div
          className="text-sm md:text-base leading-relaxed overflow-x-auto"
          style={{
            color: '#e0ffe6',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          <RichTextRenderer text={question.questionLatex} className="space-y-2" />
        </div>

        {/* 答对/答错标记 */}
        {answered && (
          <div
            className="mt-3 pt-2 flex items-center gap-2"
            style={{ borderTop: '3px dashed #141a16' }}
          >
            {answer?.correct ? (
              <span className="text-sm font-bold font-mono" style={{ color: '#7dff9a' }}>
                ▶ HIT! 命中！
              </span>
            ) : answer?.partial ? (
              <span className="text-sm font-bold font-mono" style={{ color: '#ffd93d' }}>
                ▶ PARTIAL! 擦伤！
              </span>
            ) : (
              <span className="text-sm font-bold font-mono" style={{ color: '#ff4d4d' }}>
                ▶ MISS! 未命中！
              </span>
            )}
          </div>
        )}

        {/* 答错后错因选择（像素风） */}
        {answered && answer && !answer.correct && !answer.partial && onWrongReasonSelect && (
          <PixelWrongReasonPicker
            value={wrongReason}
            onSelect={onWrongReasonSelect}
          />
        )}

        {/* 答案解析 */}
        {showAnswer && (
          <div
            className="mt-3 pt-3 space-y-2"
            style={{ borderTop: '3px dashed #141a16' }}
          >
            <div
              className="text-xs font-bold font-mono"
              style={{ color: '#ffd93d' }}
            >
              <ScrollText className="size-3.5" style={{ color: '#ffd93d' }} />
              <span style={{ color: '#ffd93d', fontWeight: 'bold' }}>战斗记录 · 正确答案</span>
            </div>
            <div style={{ color: '#e0ffe6' }}>
              <RichTextRenderer text={question.answerLatex} />
            </div>
            {question.solution && (
              <>
                <div
                  className="text-xs font-bold font-mono pt-2"
                  style={{ color: '#ffd93d' }}
                >
                <ScrollText className="size-3.5" style={{ color: '#ffd93d' }} />
                <span style={{ color: '#ffd93d', fontWeight: 'bold' }}>战斗记录 · 解题过程</span>
                </div>
                <div
                  className="text-sm"
                  style={{ color: '#b5e0bf' }}
                >
                  <RichTextRenderer text={question.solution} className="space-y-1" />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 对话框小三角（指向玩家=底部中间） */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: '-10px' }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid #141a16',
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #1a2f23',
            transform: 'translate(-50%, -4px)',
          }}
        />
      </div>
    </div>
  );
}

// ========== 战斗指令菜单 ==========
function BattleCommandMenu(props: PixelBattlePanelProps) {
  const { answered, answerMode, showAnswer, onShowAnswer, onSubmit, onNext, onPrev, index, total, onFinish } = props;

  if (!answered) {
    if (answerMode === 'self-eval') {
      // 自评模式：查看答案 + 对/错
      return (
        <div className="space-y-2">
          <div className="text-xs font-mono" style={{ color: '#5db877' }}>
            ▼ 选择指令
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            style={{ fontFamily: 'ui-monospace, monospace' }}
          >
            <PixelCommandButton
              num={1}
              label="查看答案"
              sub="SCOUT"
              color="#4dc9ff"
              onClick={onShowAnswer}
              disabled={showAnswer}
              icon={<Eye className="size-4" />}
            />
            <PixelCommandButton
              num={2}
              label="我做对了！"
              sub="ATTACK"
              color="#7dff9a"
              onClick={() => onSubmit(true)}
              disabled={!showAnswer}
            />
            <PixelCommandButton
              num={3}
              label="做错了…"
              sub="DAMAGED"
              color="#ff4d4d"
              onClick={() => onSubmit(false)}
              disabled={!showAnswer}
            />
          </div>
        </div>
      );
    }

    // 输入判分模式（显示答案按钮）
    return (
      <div className="space-y-2">
        <div className="text-xs font-mono" style={{ color: '#5db877' }}>
          ▼ 选择指令
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          style={{ fontFamily: 'ui-monospace, monospace' }}
        >
          <PixelCommandButton
            num={1}
            label="直接看答案"
            sub="SCOUT"
            color="#4dc9ff"
            onClick={onShowAnswer}
            disabled={showAnswer}
            icon={<Eye className="size-4" />}
          />
          <PixelCommandButton
            num={2}
            label="显示解题过程"
            sub="ANALYZE"
            color="#ffd93d"
            onClick={onShowAnswer}
            disabled={showAnswer}
          />
        </div>
        <div className="text-xs font-mono text-center mt-1" style={{ color: '#5db877' }}>
          <div className="text-xs font-mono text-center mt-1 flex items-center justify-center gap-1" style={{ color: '#5db877' }}>
            <Lightbulb className="size-3" />
            先在草稿纸上演算，再看答案判分
          </div>
        </div>
      </div>
    );
  }

  // 已答题：上下题 / 完成
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono" style={{ color: '#5db877' }}>
        ▼ 继续冒险
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-2"
        style={{ fontFamily: 'ui-monospace, monospace' }}
      >
        <PixelCommandButton
          num={1}
          label="上一题"
          sub="PREV"
          color="#4dc9ff"
          onClick={onPrev}
          disabled={index === 0}
        />
        {index < total - 1 ? (
          <PixelCommandButton
            num={2}
            label="下一题"
            sub="NEXT →"
            color="#ffd93d"
            onClick={onNext}
            primary
          />
        ) : (
          <PixelCommandButton
            num={2}
            label="完成战斗"
            sub="VICTORY"
            color="#7dff9a"
            onClick={onFinish}
            primary
            icon={<Trophy className="size-4" />}
          />
        )}
        <PixelCommandButton
          num={3}
          label="跳过此题"
          sub="FLEE"
          color="#ff4d4d"
          onClick={onNext}
          icon={<SkipForward className="size-4" />}
        />
      </div>
    </div>
  );
}

// ========== 像素指令按钮 ==========
function PixelCommandButton({
  num,
  label,
  sub,
  color,
  onClick,
  disabled,
  primary,
  icon,
}: {
  num: number;
  label: string;
  sub: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="relative text-left flex items-center gap-2 px-3 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none"
      style={{
        backgroundColor: primary ? color : '#141a16',
        color: primary ? '#141a16' : color,
        border: `3px solid ${color}`,
        boxShadow: '3px 3px 0 #0d120e',
      }}
    >
      <div
        className="shrink-0 size-6 flex items-center justify-center text-xs font-bold"
        style={{
          backgroundColor: color,
          color: '#141a16',
          border: '2px solid #141a16',
        }}
      >
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold leading-tight">{label}</div>
        <div className="text-xs opacity-70 leading-tight">{sub}</div>
      </div>
      {icon && <div className="shrink-0">{icon}</div>}
    </button>
  );
}

// ========== 像素风错因选择 ==========
const WRONG_REASON_ITEMS: { key: WrongReason; icon: typeof Calculator; label: string; sub: string }[] = [
  { key: 'calc-mistake', icon: Calculator, label: '算错数字', sub: 'CALC ERROR' },
  { key: 'concept', icon: Brain, label: '概念理解错', sub: 'WRONG CONCEPT' },
  { key: 'method', icon: Lightbulb, label: '方法没掌握', sub: 'UNKNOWN METHOD' },
  { key: 'misread', icon: Eye, label: '没看清题', sub: 'MISREAD' },
];

function PixelWrongReasonPicker({
  value,
  onSelect,
}: {
  value?: WrongReason;
  onSelect: (reason: WrongReason) => void;
}) {
  return (
    <div
      className="mt-3 pt-3 space-y-2"
      style={{ borderTop: '3px dashed #141a16' }}
    >
      <div className="text-xs font-bold font-mono" style={{ color: '#ff4d4d' }}>
        ▼ 错误原因分析
      </div>
      <div className="grid grid-cols-2 gap-2">
        {WRONG_REASON_ITEMS.map((item) => {
          const Icon = item.icon;
          const selected = value === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className="relative text-left flex items-center gap-2 px-2.5 py-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none"
              style={{
                backgroundColor: selected ? '#ff4d4d' : '#141a16',
                color: selected ? '#141a16' : '#ff4d4d',
                border: `3px solid #ff4d4d`,
                boxShadow: '2px 2px 0 #0d120e',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              <Icon className="size-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold leading-tight">{item.label}</div>
                <div className="text-[9px] opacity-60 leading-tight">{item.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
      {value && (
        <div className="text-xs font-mono text-center mt-1" style={{ color: '#7dff9a' }}>
          ▶ 已记录：{WRONG_REASON_LABELS[value]}
        </div>
      )}
    </div>
  );
}

// ========== 战斗反馈覆盖层（金星 + HIT/MISS 文字） ==========
export function BattleFeedbackOverlay() {
  const { skin } = useTheme();
  const [showHit, setShowHit] = useState<'hit' | 'critical' | 'miss' | null>(null);
  const [stars, setStars] = useState(0);
  const [answerTime, setAnswerTime] = useState(0);

  useEffect(() => {
    const onResult = (e: Event) => {
      const ce = e as CustomEvent<{ correct: boolean; partial?: boolean; timeSeconds?: number }>;
      const elapsed = ce.detail?.timeSeconds ?? 0;
      setAnswerTime(elapsed);

      if (ce.detail?.correct) {
        const s = elapsed > 0 && elapsed < 30 ? 3 : elapsed < 90 ? 2 : 1;
        setStars(s);
        setShowHit(s === 3 ? 'critical' : 'hit');
      } else if (ce.detail?.partial) {
        setStars(1);
        setShowHit('hit');
      } else {
        setStars(0);
        setShowHit('miss');
      }

      const t = setTimeout(() => setShowHit(null), 1200);
      return () => clearTimeout(t);
    };

    window.addEventListener('mathforge:answer-result', onResult);
    return () => window.removeEventListener('mathforge:answer-result', onResult);
  }, []);

  if ((skin as string) !== 'pixel') return null;
  if (!showHit) return null;

  const isCritical = showHit === 'critical';
  const isMiss = showHit === 'miss';
  const text = isMiss ? 'MISS!' : isCritical ? 'CRITICAL!!' : 'HIT!';
  const color = isMiss ? '#ff4d4d' : isCritical ? '#ffd93d' : '#7dff9a';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 答错：全屏红闪 2 次 */}
      {isMiss && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(255,77,77,0.35)',
            animation: 'pixel-screen-red-flash 0.6s steps(2) 2',
          }}
        />
      )}
      {/* 答对/暴击：绿色闪光 */}
      {!isMiss && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: isCritical ? 'rgba(255,217,61,0.15)' : 'rgba(125,255,154,0.1)',
            animation: 'pixel-screen-green-flash 0.4s steps(2)',
          }}
        />
      )}
      {/* 命中文字 */}
      <div
        className="absolute"
        style={{
          animation: 'pixel-battle-text 1.2s steps(8) forwards',
        }}
      >
        <div
          className="text-4xl md:text-6xl font-black font-mono tracking-widest"
          style={{
            color,
            textShadow: `4px 4px 0 #141a16, 0 0 20px ${color}`,
          }}
        >
          {text}
        </div>
      </div>

      {/* 金星 */}
      {!isMiss && stars > 0 && (
        <div
          className="absolute flex gap-3"
          style={{
            transform: 'translateY(-80px)',
            animation: 'pixel-stars-pop 1.2s steps(8) forwards',
          }}
        >
          {Array.from({ length: stars }).map((_, i) => (
            <PixelStar key={i} delay={i * 0.15} />
          ))}
        </div>
      )}

      {/* 用时提示 */}
      {!isMiss && (
        <div
          className="absolute text-xs font-mono"
          style={{
            transform: 'translateY(60px)',
            color: '#ffd93d',
            textShadow: '2px 2px 0 #141a16',
            animation: 'pixel-subtitle 1.2s steps(6) forwards',
          }}
        >
          用时 {answerTime.toFixed(1)}s · +{isCritical ? 30 : isMiss ? 0 : 20} EXP · +10 ¢
        </div>
      )}

      <style>{`
        @keyframes pixel-battle-text {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          20% { transform: scale(1.2) rotate(2deg); opacity: 1; }
          40% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) translateY(-20px); opacity: 0; }
        }
        @keyframes pixel-stars-pop {
          0% { transform: translateY(-80px) scale(0); opacity: 0; }
          30% { transform: translateY(-80px) scale(1.3); opacity: 1; }
          60% { transform: translateY(-80px) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(0.8); opacity: 0; }
        }
        @keyframes pixel-subtitle {
          0% { opacity: 0; transform: translateY(80px); }
          50% { opacity: 0; transform: translateY(70px); }
          70% { opacity: 1; transform: translateY(60px); }
          100% { opacity: 0; transform: translateY(50px); }
        }
        @keyframes pixel-screen-red-flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes pixel-screen-green-flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ========== 像素金星 ==========
function PixelStar({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="size-8 md:size-10"
      style={{
        animation: `pixel-star-spin 0.8s steps(4) infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg viewBox="0 0 16 16" shapeRendering="crispEdges" style={{ width: '100%', height: '100%' }}>
        {/* 8-bit 像素星：黄色主体 + 橙色边 + 白色高光 */}
        {/* 用 16x16 像素格 */}
        <rect x="7" y="1" width="2" height="1" fill="#ffd93d" />
        <rect x="6" y="2" width="4" height="1" fill="#ffd93d" />
        <rect x="5" y="3" width="6" height="1" fill="#ffd93d" />
        <rect x="4" y="4" width="8" height="1" fill="#ffd93d" />
        <rect x="1" y="5" width="14" height="2" fill="#ffd93d" />
        <rect x="4" y="7" width="8" height="1" fill="#ffd93d" />
        <rect x="5" y="8" width="6" height="1" fill="#ffd93d" />
        <rect x="4" y="9" width="8" height="1" fill="#ffd93d" />
        <rect x="3" y="10" width="10" height="1" fill="#ffd93d" />
        <rect x="2" y="11" width="4" height="1" fill="#ffd93d" />
        <rect x="10" y="11" width="4" height="1" fill="#ffd93d" />
        <rect x="1" y="12" width="3" height="1" fill="#ffd93d" />
        <rect x="12" y="12" width="3" height="1" fill="#ffd93d" />
        {/* 高光 */}
        <rect x="6" y="3" width="2" height="1" fill="#fff59d" />
        <rect x="5" y="4" width="1" height="1" fill="#fff59d" />
        <rect x="6" y="5" width="1" height="1" fill="#fff59d" />
        {/* 橙色描边 */}
        <rect x="7" y="0" width="2" height="1" fill="#b8860b" />
        <rect x="0" y="5" width="1" height="2" fill="#b8860b" />
        <rect x="15" y="5" width="1" height="2" fill="#b8860b" />
        <rect x="0" y="12" width="1" height="1" fill="#b8860b" />
        <rect x="15" y="12" width="1" height="1" fill="#b8860b" />
      </svg>
    </div>
  );
}

// ========== 战斗结算面板 ==========
interface BattleResultProps {
  total: number;
  correct: number;
  partial: number;
  accuracy: number;
  elapsed: number;
  onRestart: () => void;
  onBack: () => void;
}

export function PixelBattleResult({
  total,
  correct,
  partial,
  accuracy,
  elapsed,
  onRestart,
  onBack,
}: BattleResultProps) {
  const { skin } = useTheme();
  const victory = accuracy >= 60;
  const m = Math.floor(elapsed / 60);
  const sec = Math.floor(elapsed % 60);
  const expGain = correct * 20 + partial * 10;
  const coinGain = correct * 10 + partial * 5;

  // 评星（按正确率）
  const rankStars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
  const rankText = accuracy >= 90 ? 'S' : accuracy >= 70 ? 'A' : accuracy >= 50 ? 'B' : 'C';

  if ((skin as string) !== 'pixel') return null;

  return (
    <div
      className="p-5 md:p-6 space-y-4"
      style={{
        backgroundColor: '#1a2f23',
        border: '4px solid #141a16',
        boxShadow: '4px 4px 0 #141a16',
        fontFamily: 'ui-monospace, monospace',
        imageRendering: 'pixelated',
      }}
    >
      {/* 标题 */}
      <div className="text-center pt-2 pb-4">
        <div
          className="text-3xl md:text-4xl font-black tracking-wider"
          style={{
            color: victory ? '#7dff9a' : '#ff4d4d',
            textShadow: `3px 3px 0 #141a16, 0 0 16px ${victory ? '#7dff9a' : '#ff4d4d'}`,
            animation: 'pixel-title-bounce 1s steps(4) infinite',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            {victory ? (
              <><Swords className="size-6 md:size-7" style={{ color: '#7dff9a' }} /><span>战斗胜利！</span></>
            ) : (
              <><Skull className="size-6 md:size-7" style={{ color: '#ff4d4d' }} /><span>撤退……</span></>
            )}
          </div>
        </div>
        <div
          className="text-xs mt-2"
          style={{ color: victory ? '#5db877' : '#b85050' }}
        >
          {victory
            ? `击败了 ${correct} 只怪物，获得丰厚战利品！`
            : `只击败了 ${correct}/${total}，下次再来挑战！`}
        </div>
      </div>

      {/* 星级评价 */}
      <div
        className="flex items-center justify-center gap-3 py-3"
        style={{ borderTop: '3px dashed #141a16', borderBottom: '3px dashed #141a16' }}
      >
        <div
          className="text-5xl font-black"
          style={{
            color: '#ffd93d',
            textShadow: '3px 3px 0 #b8860b',
          }}
        >
          {rankText}
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="size-6 md:size-8"
              style={{
                opacity: i < rankStars ? 1 : 0.2,
                animation: i < rankStars
                  ? `pixel-star-spin 1s steps(4) infinite`
                  : undefined,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              <svg viewBox="0 0 16 16" shapeRendering="crispEdges" style={{ width: '100%', height: '100%' }}>
                <rect x="7" y="1" width="2" height="1" fill="#ffd93d" />
                <rect x="6" y="2" width="4" height="1" fill="#ffd93d" />
                <rect x="5" y="3" width="6" height="1" fill="#ffd93d" />
                <rect x="4" y="4" width="8" height="1" fill="#ffd93d" />
                <rect x="1" y="5" width="14" height="2" fill="#ffd93d" />
                <rect x="4" y="7" width="8" height="1" fill="#ffd93d" />
                <rect x="5" y="8" width="6" height="1" fill="#ffd93d" />
                <rect x="4" y="9" width="8" height="1" fill="#ffd93d" />
                <rect x="3" y="10" width="10" height="1" fill="#ffd93d" />
                <rect x="2" y="11" width="4" height="1" fill="#ffd93d" />
                <rect x="10" y="11" width="4" height="1" fill="#ffd93d" />
                <rect x="1" y="12" width="3" height="1" fill="#ffd93d" />
                <rect x="12" y="12" width="3" height="1" fill="#ffd93d" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* 战利品统计 */}
      <div className="space-y-2 text-sm">
        <StatRow label="击败敌人" value={`${correct} / ${total}`} color="#7dff9a" />
        {partial > 0 && <StatRow label="擦伤" value={`${partial}`} color="#ffd93d" />}
        <StatRow label="命中率" value={`${accuracy}%`} color="#7dff9a" />
        <StatRow label="战斗时长" value={`${m}:${String(sec).padStart(2, '0')}`} color="#4dc9ff" />
        <div className="h-1" style={{ backgroundColor: '#141a16' }} />
        <StatRow label="获得经验" value={`+${expGain} EXP`} color="#7dff9a" icon={<Sparkles className="size-4" />} />
        <StatRow label="获得金币" value={`+${coinGain} ¢`} color="#ffd93d" icon={<Coins className="size-4" />} />
      </div>

      {/* 操作 */}
      <div
        className="grid grid-cols-2 gap-2 pt-2"
        style={{ borderTop: '3px dashed #141a16' }}
      >
        <button
          type="button"
          onClick={onRestart}
          className="px-3 py-2.5 text-sm font-bold flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none"
          style={{
            backgroundColor: '#7dff9a',
            color: '#141a16',
            border: '3px solid #141a16',
            boxShadow: '3px 3px 0 #141a16',
          }}
        >
          <span className="flex items-center gap-1.5">
            <Swords className="size-4" />
            再战一局
          </span>
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-2.5 text-sm font-bold flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none"
          style={{
            backgroundColor: '#141a16',
            color: '#4dc9ff',
            border: '3px solid #4dc9ff',
            boxShadow: '3px 3px 0 #141a16',
          }}
        >
          <span className="flex items-center gap-1.5">
            <Castle className="size-4" />
            回地图
          </span>
        </button>
      </div>

      <style>{`
        @keyframes pixel-title-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes pixel-star-spin {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(15deg) scale(1.1); }
          50% { transform: rotate(0deg) scale(1); }
          75% { transform: rotate(-15deg) scale(1.1); }
          100% { transform: rotate(0deg) scale(1); }
        }
      `}</style>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5" style={{ color: '#5db877' }}>
        {icon && <span className="shrink-0">{icon}</span>}
        {label}
      </span>
      <span className="font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
