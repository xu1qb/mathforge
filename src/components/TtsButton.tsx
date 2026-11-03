import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Pause, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { extractLatexAndConvert } from '@/lib/latex-to-speech';

interface TtsButtonProps {
  text: string;
  /** 是否为纯 LaTeX（不走 $...$ 提取，直接转） */
  isLatex?: boolean;
  size?: 'sm' | 'default' | 'icon';
  variant?: 'ghost' | 'secondary' | 'outline';
  className?: string;
}

export default function TtsButton({ text, isLatex = false, size = 'icon', variant = 'ghost', className }: TtsButtonProps) {
  const [supported, setSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    setSupported(ok);
    if (!ok) return;
    // 读语速
    try {
      const saved = localStorage.getItem('mathforge:tts-rate');
      if (saved) {
        const r = parseFloat(saved);
        if (!isNaN(r) && r >= 0.5 && r <= 2) setRate(r);
      }
    } catch {
      // ignore
    }
    // 监听全局 rate 变化（通过自定义事件）
    const handleRateChange = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.rate) setRate(custom.detail.rate);
    };
    window.addEventListener('mathforge:tts-rate-change', handleRateChange);
    return () => {
      window.removeEventListener('mathforge:tts-rate-change', handleRateChange);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const getChineseVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!isSpeechSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    const zhCN = voices.find((v) => v.lang === 'zh-CN' || v.lang === 'zh_CN');
    if (zhCN) return zhCN;
    const zh = voices.find((v) => v.lang.toLowerCase().startsWith('zh'));
    return zh ?? null;
  }, []);

  const isSpeechSupported = () =>
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  const handleClick = useCallback(() => {
    if (!supported || !text) return;
    const synth = window.speechSynthesis;

    // 如果正在播，点一下暂停/继续
    if (isPlaying) {
      if (synth.paused) {
        synth.resume();
      } else {
        synth.pause();
      }
      setIsPlaying(!synth.paused);
      return;
    }

    // 开始新的朗读
    synth.cancel();
    const speechText = isLatex ? extractLatexAndConvert(text) : text;
    try {
      const utter = new SpeechSynthesisUtterance(speechText);
      utter.rate = rate;
      utter.lang = 'zh-CN';
      const voice = getChineseVoice();
      if (voice) utter.voice = voice;

      utter.onstart = () => setIsPlaying(true);
      utter.onend = () => {
        setIsPlaying(false);
        utteranceRef.current = null;
      };
      utter.onerror = () => {
        setIsPlaying(false);
        utteranceRef.current = null;
      };
      utteranceRef.current = utter;
      synth.speak(utter);
    } catch {
      setIsPlaying(false);
    }
  }, [supported, text, isLatex, isPlaying, rate, getChineseVoice]);

  if (!supported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size={size} variant={variant} className={className} disabled>
              <VolumeX className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>当前设备不支持语音朗读</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={size}
            variant={variant}
            onClick={handleClick}
            className={className}
            aria-label={isPlaying ? '暂停朗读' : '朗读解析'}
          >
            {isPlaying ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isPlaying ? '暂停朗读' : '朗读解析'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
