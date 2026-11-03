import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Volume2, Pause, SkipBack, SkipForward, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { extractLatexAndConvert } from '@/lib/latex-to-speech';
import { cn } from '@/lib/utils';

export interface ReviewAudioItem {
  id: string;
  topic: string;
  question: string;
  correctAnswer: string;
  yourAnswer: string;
  analysisSummary: string;
  wrongReason: string;
}

interface ReviewAudioQueueProps {
  items: ReviewAudioItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RATE_KEY = 'mathforge:tts-rate';
const RATES = [0.75, 1, 1.25, 1.5];

export default function ReviewAudioQueue({ items, open, onOpenChange }: ReviewAudioQueueProps) {
  const isMobile = useIsMobile();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rate, setRateState] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const queueRef = useRef<ReviewAudioItem[]>(items);
  const currentIdxRef = useRef(0);

  // 同步 items
  useEffect(() => {
    queueRef.current = items;
  }, [items]);

  // 读语速
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RATE_KEY);
      if (saved) {
        const r = parseFloat(saved);
        if (!isNaN(r) && RATES.includes(r)) setRateState(r);
      }
    } catch {
      // ignore
    }
  }, []);

  const setRate = useCallback((r: number) => {
    setRateState(r);
    try {
      localStorage.setItem(RATE_KEY, String(r));
      // 通知全局
      window.dispatchEvent(new CustomEvent('mathforge:tts-rate-change', { detail: { rate: r } }));
    } catch {
      // ignore
    }
    if (utteranceRef.current) {
      utteranceRef.current.rate = r;
    }
  }, []);

  const getChineseVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const zhCN = voices.find((v) => v.lang === 'zh-CN' || v.lang === 'zh_CN');
    if (zhCN) return zhCN;
    const zh = voices.find((v) => v.lang.toLowerCase().startsWith('zh'));
    return zh ?? null;
  }, []);

  const buildSpeechText = useCallback((item: ReviewAudioItem, idx: number): string => {
    const q = extractLatexAndConvert(item.question);
    const a = extractLatexAndConvert(item.correctAnswer);
    const ya = item.yourAnswer ? extractLatexAndConvert(item.yourAnswer) : '未作答';
    const summary = extractLatexAndConvert(item.analysisSummary);
    const reason = item.wrongReason || '未标注错因';
    return `第${idx + 1}题，${item.topic}。题目：${q}。正确答案：${a}。你的答案：${ya}。解析：${summary}。错因提醒：${reason}。`;
  }, []);

  const playIndex = useCallback((idx: number) => {
    if (idx < 0 || idx >= queueRef.current.length) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    currentIdxRef.current = idx;
    setCurrentIndex(idx);

    const item = queueRef.current[idx];
    const text = buildSpeechText(item, idx);

    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utter.lang = 'zh-CN';
      const voice = getChineseVoice();
      if (voice) utter.voice = voice;

      utter.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
      utter.onend = () => {
        // 下一题
        const next = currentIdxRef.current + 1;
        if (next >= queueRef.current.length) {
          setIsPlaying(false);
          setIsPaused(false);
        } else {
          setTimeout(() => playIndex(next), 400);
        }
      };
      utter.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current = utter;
      synth.speak(utter);
    } catch {
      setIsPlaying(false);
    }
  }, [rate, getChineseVoice, buildSpeechText]);

  const togglePlay = useCallback(() => {
    const synth = window.speechSynthesis;
    if (isPlaying) {
      if (isPaused) {
        synth.resume();
        setIsPaused(false);
      } else {
        synth.pause();
        setIsPaused(true);
      }
    } else {
      // 从头或从当前开始
      const idx = currentIdxRef.current;
      playIndex(idx);
    }
  }, [isPlaying, isPaused, playIndex]);

  const handleNext = useCallback(() => {
    const next = currentIdxRef.current + 1;
    if (next < queueRef.current.length) {
      playIndex(next);
    }
  }, [playIndex]);

  const handlePrev = useCallback(() => {
    const prev = currentIdxRef.current - 1;
    if (prev >= 0) {
      playIndex(prev);
    }
  }, [playIndex]);

  const handleJump = useCallback((idx: number) => {
    playIndex(idx);
  }, [playIndex]);

  // 关闭时停止
  useEffect(() => {
    if (!open && isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [open, isPlaying]);

  // 进度
  const progress = useMemo(() => {
    if (items.length === 0) return 0;
    return ((currentIndex + 1) / items.length) * 100;
  }, [currentIndex, items.length]);

  if (items.length === 0) {
    return null;
  }

  // 桌面端：卡片式面板；移动端：底部固定播放条 + Sheet 展开
  if (isMobile) {
    return (
      <>
        {/* 底部固定播放条 */}
        <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-2">
          <Card className="shadow-lg border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Volume2 className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    第 {currentIndex + 1} / {items.length} 题 · {items[currentIndex]?.topic}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {items[currentIndex]?.question.slice(0, 30)}...
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={handlePrev} disabled={currentIndex === 0} aria-label="上一题">
                    <SkipBack className="size-4" />
                  </Button>
                  <Button size="icon" variant="secondary" onClick={togglePlay} aria-label={isPlaying && !isPaused ? '暂停' : '播放'}>
                    {isPlaying && !isPaused ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleNext} disabled={currentIndex === items.length - 1} aria-label="下一题">
                    <SkipForward className="size-4" />
                  </Button>
                  <Sheet open={open} onOpenChange={onOpenChange}>
                    <SheetTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="播放设置">
                        <Settings className="size-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[70vh]">
                      <SheetHeader>
                        <SheetTitle>今日复盘队列</SheetTitle>
                      </SheetHeader>
                      <QueueList
                        items={items}
                        currentIndex={currentIndex}
                        onJump={handleJump}
                        rate={rate}
                        setRate={setRate}
                      />
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
              {/* 进度条 */}
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // 桌面端
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="size-4 text-primary" />
            今日复盘音频队列
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)} aria-label="关闭">
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 播放控制 */}
        <div className="flex items-center gap-3">
          <Button size="icon" variant="secondary" onClick={togglePlay} aria-label={isPlaying && !isPaused ? '暂停' : '播放'}>
            {isPlaying && !isPaused ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
          </Button>
          <Button size="icon" variant="outline" onClick={handlePrev} disabled={currentIndex === 0} aria-label="上一题">
            <SkipBack className="size-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={handleNext} disabled={currentIndex === items.length - 1} aria-label="下一题">
            <SkipForward className="size-4" />
          </Button>
          <div className="flex-1 text-sm text-muted-foreground">
            {currentIndex + 1} / {items.length}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings className="size-4 mr-1" />
                {rate}×
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {RATES.map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRate(r)} className={cn(rate === r && 'bg-accent')}>
                  {r}× 语速
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* 进度条 */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        {/* 题列表 */}
        <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleJump(idx)}
              className={cn(
                'w-full text-left p-2 rounded-md text-sm transition-colors',
                idx === currentIndex
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-muted'
              )}
            >
              <div className="font-medium">
                第 {idx + 1} 题 · {item.topic}
              </div>
              <div className="text-xs text-muted-foreground truncate">{item.question.slice(0, 50)}</div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QueueList({
  items,
  currentIndex,
  onJump,
  rate,
  setRate,
}: {
  items: ReviewAudioItem[];
  currentIndex: number;
  onJump: (idx: number) => void;
  rate: number;
  setRate: (r: number) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">语速</span>
        <div className="flex gap-1">
          {RATES.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={rate === r ? 'default' : 'outline'}
              onClick={() => setRate(r)}
              className="flex-1"
            >
              {r}×
            </Button>
          ))}
        </div>
      </div>
      <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-1">
        {items.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => onJump(idx)}
            className={cn(
              'w-full text-left p-3 rounded-md text-sm transition-colors',
              idx === currentIndex
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'hover:bg-muted'
            )}
          >
            <div className="font-medium">
              第 {idx + 1} 题 · {item.topic}
            </div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.question}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
