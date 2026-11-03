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

/** 本地兜底题库：每个知识点三档难度递进，竞赛档达到竞赛/考研压轴水平 */
interface BankItem {
  topic: string;
  question: string;
  solution: string;
  answer: string;
}
type Tier = 'basic' | 'advanced' | 'competition';
interface BankGroup {
  keys: string[];
  basic: BankItem;
  advanced: BankItem;
  competition: BankItem;
}

const BANK: BankGroup[] = [
  {
    keys: ['洛必达', '极限', '连续', '递推', 'stolz'],
    basic: {
      topic: '函数、极限与连续',
      question: '求极限 $\\displaystyle \\lim_{x \\to 0} \\frac{\\sin x - x}{x^3}$。',
      solution: '用 Taylor 展开 $\\sin x = x - \\frac{x^3}{6} + o(x^3)$：\n\n$\\displaystyle \\sin x - x = -\\frac{x^3}{6} + o(x^3)$，除以 $x^3$ 取极限得 $-\\frac{1}{6}$。',
      answer: '$\\displaystyle -\\frac{1}{6}$',
    },
    advanced: {
      topic: '函数、极限与连续',
      question: '设 $x_1=\\sqrt{2}$，$x_{n+1}=\\sqrt{2+x_n}$。证明数列 $\\{x_n\\}$ 收敛，并求其极限。',
      solution: '归纳可证 $x_n < 2$：若 $x_n<2$ 则 $x_{n+1}=\\sqrt{2+x_n}<\\sqrt{4}=2$。又 $x_{n+1}^2 - x_n^2 = 2+x_n-x_n^2 = (2-x_n)(1+x_n)>0$，故单调递增。由单调有界准则极限存在，设为 $A$。\n\n对递推式取极限：$A=\\sqrt{2+A}$，即 $A^2-A-2=0$，正根 $A=2$。',
      answer: '$\\displaystyle \\lim_{n\\to\\infty} x_n = 2$',
    },
    competition: {
      topic: '函数、极限与连续',
      question: '求极限 $\\displaystyle \\lim_{x \\to 0} \\frac{(1+x)^{1/x} - e}{x}$。',
      solution: '取对数展开：$(1+x)^{1/x} = \\exp\\!\\left(\\frac{\\ln(1+x)}{x}\\right)$。\n\n$\\displaystyle \\frac{\\ln(1+x)}{x} = 1 - \\frac{x}{2} + \\frac{x^2}{3} + o(x^2)$，故 $(1+x)^{1/x} = e\\cdot e^{-x/2+o(x)} = e\\left(1 - \\frac{x}{2} + o(x)\\right)$。\n\n于是分子 $= -\\frac{e}{2}x + o(x)$，除以 $x$ 得 $-\\frac{e}{2}$。',
      answer: '$\\displaystyle -\\frac{e}{2}$',
    },
  },
  {
    keys: ['积分', '定积分', '反常', '微元', '换元'],
    basic: {
      topic: '一元函数积分学',
      question: '计算定积分 $\\displaystyle \\int_0^1 x e^x \\, dx$。',
      solution: '分部积分，取 $u=x$，$dv=e^x dx$：\n\n$\\displaystyle \\int_0^1 x e^x dx = \\left. x e^x \\right|_0^1 - \\int_0^1 e^x dx = e - (e-1) = 1$。',
      answer: '$\\displaystyle 1$',
    },
    advanced: {
      topic: '一元函数积分学',
      question: '计算 $\\displaystyle \\int_0^{\\pi/2} \\sin^2 x \\, dx$。',
      solution: '降幂公式 $\\sin^2 x = \\frac{1-\\cos 2x}{2}$：\n\n$\\displaystyle \\int_0^{\\pi/2} \\sin^2 x dx = \\frac{1}{2}\\cdot\\frac{\\pi}{2} - \\frac{1}{4}\\int_0^{\\pi/2}\\cos 2x\\,d(2x) = \\frac{\\pi}{4}$。',
      answer: '$\\displaystyle \\frac{\\pi}{4}$',
    },
    competition: {
      topic: '一元函数积分学',
      question: '证明：$\\displaystyle \\int_0^{\\pi/2} \\ln(\\sin x)\\,dx = -\\frac{\\pi}{2}\\ln 2$。',
      solution: '记 $I=\\int_0^{\\pi/2}\\ln(\\sin x)dx$。由对称性 $x\\mapsto \\frac{\\pi}{2}-x$ 知 $I=\\int_0^{\\pi/2}\\ln(\\cos x)dx$。\n\n两式相加：$2I=\\int_0^{\\pi/2}\\ln(\\sin x\\cos x)dx = \\int_0^{\\pi/2}\\!\\left[\\ln(\\sin 2x)-\\ln 2\\right]dx$。\n\n其中 $\\int_0^{\\pi/2}\\ln(\\sin 2x)dx \\overset{t=2x}{=}\\frac{1}{2}\\int_0^\\pi\\ln(\\sin t)dt = I$（关于 $t=\\pi/2$ 对称）。故 $2I=I-\\frac{\\pi}{2}\\ln2$，即 $I=-\\frac{\\pi}{2}\\ln2$。',
      answer: '$\\displaystyle -\\frac{\\pi}{2}\\ln 2$',
    },
  },
  {
    keys: ['级数', '收敛', '求和', '幂级数', '展开'],
    basic: {
      topic: '无穷级数',
      question: '判断 $\\displaystyle \\sum_{n=1}^{\\infty}\\frac{1}{n(n+1)}$ 的敛散性，收敛则求和。',
      solution: '裂项 $\\frac{1}{n(n+1)}=\\frac{1}{n}-\\frac{1}{n+1}$，部分和 $S_N=1-\\frac{1}{N+1}\\to 1$，故收敛。',
      answer: '$\\displaystyle 1$',
    },
    advanced: {
      topic: '无穷级数',
      question: '判别 $\\displaystyle \\sum_{n=1}^{\\infty}\\frac{n!}{n^n}$ 的敛散性。',
      solution: '用比值法：$\\displaystyle \\frac{a_{n+1}}{a_n} = \\frac{(n+1)!}{(n+1)^{n+1}}\\cdot\\frac{n^n}{n!} = \\left(\\frac{n}{n+1}\\right)^n = \\left(1+\\frac{1}{n}\\right)^{-n} \\to \\frac{1}{e} < 1$。故级数收敛。',
      answer: '收敛',
    },
    competition: {
      topic: '无穷级数',
      question: '求幂级数 $\\displaystyle \\sum_{n=1}^{\\infty}\\frac{x^n}{n}$ 的收敛域与和函数。',
      solution: '收敛半径 $R=\\lim_{n\\to\\infty}\\frac{n}{n+1}=1$。$x=1$ 时为调和级数发散，$x=-1$ 时为交错级数收敛，故收敛域 $[-1,1)$。\n\n设和函数 $S(x)$，则 $S\'(x)=\\sum_{n=1}^{\\infty}x^{n-1}=\\frac{1}{1-x}$，且 $S(0)=0$。积分得 $S(x)=-\\ln(1-x)$。',
      answer: '收敛域 $[-1,1)$，和函数 $\\displaystyle S(x)=-\\ln(1-x)$',
    },
  },
  {
    keys: ['偏导', '多元', '梯度', '极值', '条件极值', '重积分'],
    basic: {
      topic: '多元函数微分学',
      question: '设 $z=x^2y+\\sin(xy)$，求 $\\displaystyle \\frac{\\partial z}{\\partial x}$ 与 $\\frac{\\partial z}{\\partial y}$。',
      solution: '对 $x$ 求偏导：$\\displaystyle \\frac{\\partial z}{\\partial x}=2xy+y\\cos(xy)$。\n\n对 $y$ 求偏导：$\\displaystyle \\frac{\\partial z}{\\partial y}=x^2+x\\cos(xy)$。',
      answer: '$\\displaystyle z_x=2xy+y\\cos(xy)$，$z_y=x^2+x\\cos(xy)$',
    },
    advanced: {
      topic: '多元函数微分学',
      question: '设 $z=f(u,v)$，$u=x^2-y^2$，$v=e^{xy}$，$f$ 具有连续偏导数。求 $\\displaystyle \\frac{\\partial z}{\\partial x}$。',
      solution: '由链式法则：\n\n$\\displaystyle \\frac{\\partial z}{\\partial x} = f_u\\cdot\\frac{\\partial u}{\\partial x} + f_v\\cdot\\frac{\\partial v}{\\partial x} = 2x\\,f_u + y e^{xy}\\,f_v$。',
      answer: '$\\displaystyle z_x = 2x\\,f_u(x^2-y^2,e^{xy}) + y e^{xy}\\,f_v(x^2-y^2,e^{xy})$',
    },
    competition: {
      topic: '多元函数微分学',
      question: '在椭球面 $\\displaystyle \\frac{x^2}{a^2}+\\frac{y^2}{b^2}+\\frac{z^2}{c^2}=1$ 内，求各面平行于坐标面且体积最大的内接长方体体积。',
      solution: '由对称性，设长方体在第一卦限顶点为 $(x,y,z)$，体积 $V=8xyz$。作 Lagrange 函数 $L=xyz-\\lambda\\!\\left(\\frac{x^2}{a^2}+\\frac{y^2}{b^2}+\\frac{z^2}{c^2}-1\\right)$。\n\n由 $L_x=L_y=L_z=0$ 得 $\\frac{x^2}{a^2}=\\frac{y^2}{b^2}=\\frac{z^2}{c^2}=\\frac{1}{3}$，即 $x=\\frac{a}{\\sqrt3}$ 等。\n\n代回 $V=8\\cdot\\frac{a}{\\sqrt3}\\cdot\\frac{b}{\\sqrt3}\\cdot\\frac{c}{\\sqrt3}=\\frac{8abc}{3\\sqrt3}$。',
      answer: '$\\displaystyle V_{\\max} = \\frac{8abc}{3\\sqrt3}$',
    },
  },
  {
    keys: ['微分方程', '通解', '初值', '欧拉'],
    basic: {
      topic: '常微分方程',
      question: '求初值问题 $y\'=2xy$，$y(0)=1$ 的解。',
      solution: '分离变量 $\\frac{dy}{y}=2x\\,dx$，积分得 $\\ln|y|=x^2+C$。由 $y(0)=1$ 得 $C=0$。',
      answer: '$\\displaystyle y=e^{x^2}$',
    },
    advanced: {
      topic: '常微分方程',
      question: '求一阶线性方程 $y\'+y=e^{-x}$ 的通解。',
      solution: '积分因子 $\\mu=e^{\\int 1\\,dx}=e^x$，乘两边：$(ye^x)\'=1$。积分得 $ye^x=x+C$。',
      answer: '$\\displaystyle y=(x+C)e^{-x}$',
    },
    competition: {
      topic: '常微分方程',
      question: '解欧拉方程 $x^2 y\'\' + x y\' - y = 0\\;(x>0)$。',
      solution: '令 $x=e^t$，记 $D=\\frac{d}{dt}$，则 $x y\'=Dy$，$x^2y\'\'=D(D-1)y$。方程化为 $D(D-1)y+Dy-y=(D^2-1)y=0$。\n\n特征方程 $r^2-1=0$，根 $r=\\pm1$，故 $y=C_1 e^t+C_2 e^{-t}$。换回 $x$。',
      answer: '$\\displaystyle y=C_1 x + \\frac{C_2}{x}$',
    },
  },
];

const DEFAULT_BANK: Record<Tier, BankItem> = {
  basic: {
    topic: '一元微分学',
    question: '设 $f(x)=x^3-3x+1$，求单调区间与极值。',
    solution: "$f'(x)=3x^2-3=3(x-1)(x+1)$。$x<-1$ 增，$-1<x<1$ 减，$x>1$ 增。\n\n极大值 $f(-1)=3$，极小值 $f(1)=-1$。",
    answer: '增区间 $(-\\infty,-1)\\cup(1,+\\infty)$，减区间 $(-1,1)$；极大值 $3$，极小值 $-1$',
  },
  advanced: {
    topic: '一元微分学',
    question: '证明：当 $x>0$ 时，$\\displaystyle e^x > 1+x+\\frac{x^2}{2}$。',
    solution: "令 $g(x)=e^x-1-x-\\frac{x^2}{2}$。$g(0)=0$，$g'(x)=e^x-1-x$，$g''(x)=e^x-1>0\\;(x>0)$。\n\n故 $g'$ 在 $x>0$ 单调增，$g'(x)>g'(0)=0$，从而 $g(x)>0$。",
    answer: '不等式成立',
  },
  competition: {
    topic: '一元微分学',
    question: '设 $f(x)$ 在 $[0,1]$ 上连续，在 $(0,1)$ 内可导，$f(0)=0$，$f(1)=1$。证明：存在 $\\xi\\in(0,1)$，使 $\\displaystyle f\'(\\xi)=2\\xi$。',
    solution: "构造辅助函数 $g(x)=f(x)-x^2$。则 $g(0)=f(0)-0=0$，$g(1)=f(1)-1=0$。\n\n由 Rolle 定理，存在 $\\xi\\in(0,1)$ 使 $g'(\\xi)=0$。而 $g'(x)=f'(x)-2x$，故 $f'(\\xi)-2\\xi=0$。",
    answer: '存在 $\\xi\\in(0,1)$ 使命题成立',
  },
};

/** 本地兜底：按关键词选知识点、按难度取对应题，保证本地开发不白屏 */
function localFallback(prompt: string, difficulty: string): QuizResult {
  const p = prompt.toLowerCase();
  const tier: Tier = difficulty === '简单' ? 'basic' : difficulty === '竞赛' ? 'competition' : 'advanced';
  const tierLabel = tier === 'basic' ? '基础' : tier === 'competition' ? '竞赛难度' : '中等';
  const group = BANK.find((g) => g.keys.some((k) => p.includes(k)));
  const item = group ? group[tier] : DEFAULT_BANK[tier];
  return {
    topic: item.topic,
    question: `${item.question}（${tierLabel}）。`,
    solution: item.solution,
    answer: item.answer,
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
