import { useEffect, useRef, useState } from 'react';

interface BankItem {
  id: number;
  question: string;
  grade: 'correct' | 'wrong-answer' | 'wrong-step' | null;
  timestamp: number;
  caught: boolean;
  category: string;
}

const CATEGORIES = ['全部', '极限', '导数', '积分', '级数', '线代', '其他'];

function categorize(q: string): string {
  const s = q.toLowerCase();
  if (s.includes('lim') || s.includes('极限')) return '极限';
  if (s.includes('导') || s.includes("f'") || s.includes('求导')) return '导数';
  if (s.includes('∫') || s.includes('积分') || s.includes('dx')) return '积分';
  if (s.includes('级数') || s.includes('σ') || s.includes('sum') || s.includes('收敛')) return '级数';
  if (s.includes('矩阵') || s.includes('逆') || s.includes('线性')) return '线代';
  return '其他';
}

const THINK_STEPS = [
  '先读一遍题目，把条件和问的是什么圈出来……',
  '条件里有哪些已知量？要求什么？',
  '这道题属于哪一类？极限？导数？积分？中值定理？',
  '试试能不能直接套公式？不行的话换元还是分部？',
  '先算一个简单的特殊值验证方向对不对……',
  '好，思路有了，开始写步骤。',
];

const GENERIC_SOLUTION =
  '根据题目条件，先列出已知关系。观察结构后选择合适的方法：将表达式整理为标准形式，利用相关定理（如中值定理、洛必达法则或泰勒展开）逐步化简。关键一步是识别出可以转化的部分，代入后得到中间结果。最后回代验证，检查边界情况和特殊值，确认结论成立。';

const SAMPLE_QUESTIONS = [
  '求 lim(x→0) (sinx - x) / x³',
  '∫ x·e^x dx',
  'f(x)=x³-3x 在 [0,2] 上的最值',
  '判断级数 Σ 1/n² 收敛性',
  '矩阵 [[1,2],[3,4]] 的逆矩阵',
];

export default function TeacherPage() {
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState<'idle' | 'thinking' | 'done' | 'grading'>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [caught, setCaught] = useState(false);
  const [filter, setFilter] = useState('全部');
  const [bank, setBank] = useState<BankItem[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mathforge-teacher-bank');
    if (saved) setBank(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('mathforge-teacher-bank', JSON.stringify(bank));
  }, [bank]);

  const startSolve = () => {
    if (!question.trim()) return;
    setPhase('thinking');
    setStepIdx(0);
    setDisplayed('');
    setCaught(false);
  };

  useEffect(() => {
    if (phase !== 'thinking') return;
    if (stepIdx >= THINK_STEPS.length) {
      const roll = Math.random();
      const willFlop = roll < 0.2;
      setCaught(willFlop);
      setPhase('done');
      return;
    }
    const step = THINK_STEPS[stepIdx];
    let i = 0;
    timerRef.current = window.setInterval(() => {
      i++;
      setDisplayed((prev) => (prev === step ? prev : step.slice(0, i)));
      if (i >= step.length) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setTimeout(() => {
          setDisplayed('');
          setStepIdx((s) => s + 1);
        }, 400);
      }
    }, 40);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [phase, stepIdx]);

  const grade = (g: 'correct' | 'wrong-answer' | 'wrong-step') => {
    const item: BankItem = {
      id: Date.now(),
      question: question.trim(),
      grade: g,
      timestamp: Date.now(),
      caught: caught && g === 'wrong-answer',
      category: categorize(question.trim()),
    };
    setBank((b) => [item, ...b]);
    setPhase('grading');
  };

  const reset = () => {
    setQuestion('');
    setPhase('idle');
    setStepIdx(0);
    setDisplayed('');
    setCaught(false);
  };

  const caughtCount = bank.filter((b) => b.caught).length;
  const teacherCount = bank.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div>
        <h1 className="page-title">我当老师</h1>
        <p className="text-sm text-muted-foreground mt-1">
          你出题，AI 限时作答，你批改。抓它翻车有成就。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <label className="text-sm font-medium block">出一道题</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="比如：求 lim(x→0) (sinx - x) / x³"
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="button"
          onClick={startSolve}
          disabled={phase === 'thinking' || !question.trim()}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
        >
          {phase === 'thinking' ? '思考中…' : '让 AI 做'}
        </button>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center">没题出？试试：</span>
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuestion(q)}
              className="text-xs px-2 py-1 rounded-md bg-muted/60 hover:bg-muted transition-colors text-muted-foreground"
            >
              {q.length > 18 ? q.slice(0, 18) + '…' : q}
            </button>
          ))}
        </div>
      </div>

      {phase === 'thinking' && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-muted-foreground">AI 思考过程</div>
            <button
              type="button"
              onClick={() => {
                if (timerRef.current) window.clearInterval(timerRef.current);
                const roll = Math.random();
                setCaught(roll < 0.2);
                setStepIdx(THINK_STEPS.length);
                setDisplayed('');
                setPhase('done');
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              跳过 ⏭
            </button>
          </div>
          <div className="font-mono text-sm min-h-[3rem] text-foreground/90">
            {displayed}
            <span className="animate-pulse">▋</span>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">你的题</div>
            <div className="text-sm font-mono bg-muted/40 rounded-lg px-3 py-2">{question}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">AI 的解答</div>
            <div className="text-sm leading-relaxed font-body">
              {caught ? (
                <div className="space-y-2">
                  <p>{GENERIC_SOLUTION}</p>
                  <p className="text-destructive font-semibold">
                    结论：原式 = 42。（看起来不太对？）
                  </p>
                </div>
              ) : (
                <p>{GENERIC_SOLUTION}</p>
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">你批改：</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => grade('correct')}
              className="h-9 px-4 rounded-lg bg-emerald-500/15 text-emerald-600 text-sm hover:bg-emerald-500/25"
            >
              做对了
            </button>
            <button
              type="button"
              onClick={() => grade('wrong-answer')}
              className="h-9 px-4 rounded-lg bg-rose-500/15 text-rose-600 text-sm hover:bg-rose-500/25"
            >
              答案错了
            </button>
            <button
              type="button"
              onClick={() => grade('wrong-step')}
              className="h-9 px-4 rounded-lg bg-amber-500/15 text-amber-600 text-sm hover:bg-amber-500/25"
            >
              步骤有问题
            </button>
          </div>
        </div>
      )}

      {phase === 'grading' && (
        <div className="rounded-xl border border-border bg-card p-5 text-center space-y-3">
          {caught && (
            <div className="text-lg font-semibold text-rose-600">
              🎉 抓到 AI 翻车！已解锁成就
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            累计出题 {teacherCount} 道，抓包 {caughtCount} 次
            {teacherCount > 0 && (
              <span className="ml-1">（翻车率 {Math.round((caughtCount / teacherCount) * 100)}%）</span>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm"
          >
            再出一道
          </button>
        </div>
      )}

      {bank.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">我的题库（{bank.length}）</div>
            <button
              type="button"
              onClick={() => {
                if (confirm('确定清空题库？')) {
                  setBank([]);
                  localStorage.removeItem('mathforge-teacher-bank');
                }
              }}
              className="text-xs text-muted-foreground hover:text-rose-600 transition-colors"
            >
              清空
            </button>
            <button
              type="button"
              onClick={() => {
                const text = bank
                  .map((b, i) => `${i + 1}. [${b.category}] ${b.question}（${b.caught ? '翻车' : b.grade === 'correct' ? 'AI对' : 'AI错'}）`)
                  .join('\n');
                navigator.clipboard.writeText(text);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              复制全部
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {CATEGORIES.map((c) => {
              const count = c === '全部' ? bank.length : bank.filter((b) => b.category === c).length;
              if (count === 0 && c !== '全部') return null;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className={`text-xs px-2 py-1 rounded-md transition-colors ${
                    filter === c
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {c} {count}
                </button>
              );
            })}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bank
              .filter((b) => filter === '全部' || b.category === filter)
              .map((b) => (
                <div key={b.id} className="flex items-center justify-between text-xs gap-2">
                  <span className="flex-1 truncate font-mono">{b.question}</span>
                  <span className="text-muted-foreground/60">{b.category}</span>
                  <span
                    className={
                      b.grade === 'correct'
                        ? 'text-emerald-600'
                        : b.grade === 'wrong-answer'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                    }
                  >
                    {b.caught ? '🐟 抓包' : b.grade === 'correct' ? '✓' : '✗'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
