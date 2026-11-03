import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, Mic, Square, Sparkles, Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { capabilityClient, logger } from '@/lib/lark-mock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProblemText from '@/components/ProblemText';
import { toast } from 'sonner';

const PLUGIN_ID = 'math_ai_quiz_maker_1';

interface QuizResult {
  question: string;
  solution: string;
  answer: string;
  topic: string;
}

/** 本地兜底：按关键词生成一道带 LaTeX 的示例题，保证本地开发不白屏 */
function localFallback(prompt: string, difficulty: string): QuizResult {
  const p = prompt.toLowerCase();
  const diffLabel = difficulty === '简单' ? '基础' : difficulty === '竞赛' ? '竞赛难度' : '中等';
  if (p.includes('洛必达') || p.includes('极限') || p.includes('连续')) {
    return {
      topic: '函数、极限与连续',
      question: `求极限 $\\displaystyle \\lim_{x \\to 0} \\frac{x - \\sin x}{x^3}$（${diffLabel}）。`,
      solution:
        '这是 $\\frac{0}{0}$ 型，使用洛必达法则：\n\n$\\displaystyle \\lim_{x \\to 0} \\frac{x - \\sin x}{x^3} = \\lim_{x \\to 0} \\frac{1 - \\cos x}{3x^2}$\n\n再次使用洛必达法则：$\\displaystyle \\lim_{x \\to 0} \\frac{\\sin x}{6x} = \\frac{1}{6}$。',
      answer: '$\\displaystyle \\frac{1}{6}$',
    };
  }
  if (p.includes('积分') || p.includes('定积分') || p.includes('微元')) {
    return {
      topic: '一元函数积分学',
      question: `计算定积分 $\\displaystyle \\int_0^1 x e^x \\, dx$（${diffLabel}）。`,
      solution:
        '使用分部积分法 $\\int u \\, dv = uv - \\int v \\, du$，取 $u = x$，$dv = e^x dx$：\n\n$\\displaystyle \\int_0^1 x e^x dx = \\left. x e^x \\right|_0^1 - \\int_0^1 e^x dx = e - (e - 1) = 1$。',
      answer: '$1$',
    };
  }
  if (p.includes('级数') || p.includes('收敛') || p.includes('求和')) {
    return {
      topic: '无穷级数',
      question: `判断级数 $\\displaystyle \\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)}$ 的敛散性，若收敛求其和（${diffLabel}）。`,
      solution:
        '裂项：$\\displaystyle \\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}$。\n\n部分和 $S_N = 1 - \\frac{1}{N+1} \\to 1$，故级数收敛。',
      answer: '$\\displaystyle 1$',
    };
  }
  if (p.includes('偏导') || p.includes('多元') || p.includes('梯度')) {
    return {
      topic: '多元函数微分学',
      question: `设 $z = x^2 y + \\sin(xy)$，求 $\\displaystyle \\frac{\\partial z}{\\partial x}$ 与 $\\frac{\\partial z}{\\partial y}$（${diffLabel}）。`,
      solution:
        '对 $x$ 求偏导（视 $y$ 为常数）：\n\n$\\displaystyle \\frac{\\partial z}{\\partial x} = 2xy + y\\cos(xy)$。\n\n对 $y$ 求偏导：\n\n$\\displaystyle \\frac{\\partial z}{\\partial y} = x^2 + x\\cos(xy)$。',
      answer: '$\\displaystyle \\frac{\\partial z}{\\partial x} = 2xy + y\\cos(xy)$，$\\frac{\\partial z}{\\partial y} = x^2 + x\\cos(xy)$',
    };
  }
  return {
    topic: '数学综合',
    question: `设 $f(x) = x^3 - 3x + 1$，求其单调区间与极值（${diffLabel}）。`,
    solution:
        "求导 $f'(x) = 3x^2 - 3 = 3(x-1)(x+1)$。\n\n$x < -1$ 时 $f'(x) > 0$，单调递增；$-1 < x < 1$ 时递减；$x > 1$ 时递增。\n\n极大值 $f(-1) = 3$，极小值 $f(1) = -1$。",
    answer: '单调增区间 $(-\\infty,-1)$ 与 $(1,+\\infty)$，减区间 $(-1,1)$；极大值 $3$，极小值 $-1$',
  };
}

/** 从 AI 流式返回的 markdown 中启发式提取题目/解答/答案 */
function parseAiContent(content: string): QuizResult {
  const lines = content.split('\n');
  let question = '', solution = '', answer = '', topic = '';
  let section = '';
  for (const raw of lines) {
    const line = raw.trim();
    const low = line.toLowerCase();
    if (/^#{1,4}\s*(题目|题干|出题)/.test(line) || low.includes('题目内容')) { section = 'question'; continue; }
    if (/^#{1,4}\s*(解答|解题|步骤)/.test(line) || low.includes('解题过程')) { section = 'solution'; continue; }
    if (/^#{1,4}\s*(答案|最终答案)/.test(line) || low.includes('最终答案')) { section = 'answer'; continue; }
    if (/^#{1,4}\s*(专题|知识点|分类)/.test(line)) { section = 'topic'; continue; }
    if (!line && !section) continue;
    if (section === 'question') question += (question ? '\n' : '') + line;
    else if (section === 'solution') solution += (solution ? '\n' : '') + line;
    else if (section === 'answer') answer += (answer ? '\n' : '') + line;
    else if (section === 'topic') topic += (topic ? ' ' : '') + line.replace(/^[-*•]\s*/, '');
  }
  return {
    question: question.trim() || content,
    solution: solution.trim() || '',
    answer: answer.trim(),
    topic: topic.trim() || '数学综合',
  };
}

export default function AIQuizPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState('');
  const [difficulty, setDifficulty] = useState('中等');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [streaming, setStreaming] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  const handleImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('请选择图片文件'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const toggleListen = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error('当前浏览器不支持语音输入');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop?.();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'zh-CN';
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setPrompt(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
    toast.info('正在聆听，请说出出题要求…');
  }, [listening]);

  const generate = useCallback(async () => {
    const need = prompt.trim();
    if (!need && !imageFile) {
      toast.error('请先输入出题要求，或拍一张参考图');
      return;
    }
    setLoading(true);
    setResult(null);
    setStreaming('');

    const client = capabilityClient as any;
    // 平台运行时注入了真实 AI 能力时走流式；否则本地兜底
    if (typeof client?.load === 'function') {
      try {
        const executor = client.load(PLUGIN_ID);
        const systemPrompt = `你是大学数学竞赛出题老师。根据用户要求出一道全国大学生数学竞赛（非数学类 A 类）风格的题目，难度：${difficulty}。\n请按以下 markdown 结构输出：\n## 题目\n（含 $...$ LaTeX 行内公式）\n## 解答\n（分步，含 LaTeX）\n## 答案\n（最终结果）\n## 专题\n（所属知识点）`;
        const stream = executor.callStream('textGeneration', {
          prompt: systemPrompt + '\n\n用户要求：' + need,
          ...(imageFile ? { question_image: [imageFile] } : {}),
        });
        let full = '';
        for await (const chunk of stream) {
          const piece = chunk.content ?? '';
          if (piece) { full += piece; setStreaming(full); }
        }
        if (full.trim()) {
          setResult(parseAiContent(full));
          setStreaming('');
        } else {
          setResult(localFallback(need, difficulty));
        }
      } catch (err) {
        logger.error('AI 出题失败，使用本地兜底：', String(err));
        setResult(localFallback(need, difficulty));
      }
    } else {
      // 本地开发：模拟一点点延迟后给兜底题
      await new Promise((r) => setTimeout(r, 500));
      setResult(localFallback(need, difficulty));
    }
    setLoading(false);
  }, [prompt, difficulty, imageFile]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-7 text-primary" />
            你出题，AI 来做
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            文字描述、拍照或语音说出想要的题型，AI 现场出题并给出完整解答。
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">出题要求</CardTitle>
            <CardDescription>例如：出一道洛必达法则的极限题，中等难度</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想要的知识点、题型或难度…"
              rows={3}
              className="resize-none"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={listening ? 'destructive' : 'secondary'}
                size="sm"
                onClick={toggleListen}
              >
                {listening ? <Square className="size-4 mr-1.5" /> : <Mic className="size-4 mr-1.5" />}
                {listening ? '停止录音' : '语音输入'}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => cameraInputRef.current?.click()}>
                <Camera className="size-4 mr-1.5" />拍照参考
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="size-4 mr-1.5" />上传图片
              </Button>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="难度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="简单">基础</SelectItem>
                  <SelectItem value="中等">中等</SelectItem>
                  <SelectItem value="竞赛">竞赛难度</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ''; }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ''; }}
            />

            {imagePreview && (
              <div className="relative inline-block">
                <img src={imagePreview} alt="参考图" className="max-h-32 rounded-lg border border-border/60" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(''); }}
                  className="absolute -top-2 -right-2 size-5 rounded-full bg-destructive text-destructive-foreground text-xs"
                  aria-label="移除图片"
                >×</button>
              </div>
            )}

            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Sparkles className="size-4 mr-1.5" />}
              {loading ? 'AI 出题中…' : '让 AI 出题并解答'}
            </Button>
          </CardContent>
        </Card>

        {streaming && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{streaming}</div>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />题目
                </CardTitle>
                <Badge variant="secondary">{result.topic}</Badge>
              </CardHeader>
              <CardContent>
                <ProblemText text={result.question} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">参考解答</CardTitle></CardHeader>
              <CardContent>
                <ProblemText text={result.solution} />
              </CardContent>
            </Card>

            {result.answer && (
              <Card>
                <CardHeader><CardTitle className="text-base">最终答案</CardTitle></CardHeader>
                <CardContent>
                  <ProblemText text={result.answer} />
                </CardContent>
              </Card>
            )}

            <Button variant="outline" onClick={() => setResult(null)}>
              <RefreshCw className="size-4 mr-1.5" />再出一道
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
