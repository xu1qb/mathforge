import { useRef, useState, useEffect, useCallback } from 'react';
import PageShell from '@/components/PageShell';
import { Camera, Upload, Loader2, RefreshCw, BookMarked, CheckCircle2, XCircle, MinusCircle, History, Trash2, ChevronRight } from 'lucide-react';
import { capabilityClient, scopedStorage, logger } from '@/lib/lark-mock';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProblemText from '@/components/ProblemText';
import { useWrongBook } from '@/hooks/use-learning';
import { toast } from 'sonner';
import type { Difficulty, PracticeQuestion } from '@/lib/math-practice';
import { Image } from '@/components/ui/image';

const PLUGIN_ID = 'math_photo_question_solver_1';
const HISTORY_KEY = 'mathforge_photo_solve_history';
const MAX_HISTORY = 20;

interface PhotoSolveHistoryItem {
  id: string;
  imageUrl: string;
  questionText: string;
  solution: string;
  answer: string;
  topic: string;
  difficulty: string;
  timestamp: number;
  selfEval?: 'correct' | 'partial' | 'wrong';
}

function readHistory(): PhotoSolveHistoryItem[] {
  try {
    const raw = scopedStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHistory(items: PhotoSolveHistoryItem[]) {
  try {
    scopedStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch (err) {
    logger.error('保存拍照识题历史失败:', String(err));
  }
}

/**
 * 从 AI 返回的文本中提取题目、解答、答案、专题、难度
 * 流式输出是 markdown 格式，这里做启发式提取
 */
function parseAiContent(content: string) {
  const lines = content.split('\n').map((l) => l.trim());

  let question = '';
  let solution = '';
  let answer = '';
  let topic = '';
  let difficulty = '';

  // 启发式：找各部分标题
  let section = '';
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (line.match(/^#{1,4}\s*(题目|题目内容|原题|题干)/) || lowerLine.includes('题目内容') || lowerLine.includes('题目原文')) {
      section = 'question';
      continue;
    }
    if (line.match(/^#{1,4}\s*(解答|解题|步骤|解题过程|分步解答)/) || lowerLine.includes('解题过程') || lowerLine.includes('分步解答')) {
      section = 'solution';
      continue;
    }
    if (line.match(/^#{1,4}\s*(答案|最终答案|结果)/) || lowerLine.includes('最终答案')) {
      section = 'answer';
      continue;
    }
    if (line.match(/^#{1,4}\s*(专题|分类|知识点|所属)/) || lowerLine.includes('专题分类') || lowerLine.includes('知识点类别')) {
      section = 'topic';
      continue;
    }
    if (line.match(/^#{1,4}\s*(难度|评级)/) || lowerLine.includes('难度判断') || lowerLine.includes('难度评级')) {
      section = 'difficulty';
      continue;
    }

    if (!line && !section) continue;

    if (section === 'question') {
      question += (question ? '\n' : '') + line;
    } else if (section === 'solution') {
      solution += (solution ? '\n' : '') + line;
    } else if (section === 'answer') {
      answer += (answer ? '\n' : '') + line;
    } else if (section === 'topic') {
      topic += (topic ? ' ' : '') + line.replace(/^[-*•]\s*/, '').trim();
    } else if (section === 'difficulty') {
      difficulty += (difficulty ? ' ' : '') + line.replace(/^[-*•]\s*/, '').trim();
    }
  }

  // 兜底：如果没有解析到各部分，全文当解答
  if (!solution && content.length > 0) {
    solution = content;
  }

  return {
    question: question.trim() || content.slice(0, 200) + '...',
    solution: solution.trim() || content,
    answer: answer.trim(),
    topic: topic.trim() || '数学综合',
    difficulty: difficulty.trim() || '中等',
  };
}

function mapDifficulty(diff: string): Difficulty {
  if (diff.includes('简单') || diff.includes('易') || diff.includes('基础')) return 'basic';
  if (diff.includes('困难') || diff.includes('难') || diff.includes('高') || diff.includes('竞赛')) return 'competition';
  return 'advanced';
}

function mapTopicKey(topic: string): string {
  const t = topic.toLowerCase();
  if (t.includes('极限') || t.includes('连续')) return 'limit-continuity';
  if (t.includes('导数') || t.includes('微分') || t.includes('一元函数') || t.includes('求导')) return 'single-var-diff';
  if (t.includes('积分') && !t.includes('重积分') && !t.includes('多元') && !t.includes('曲面积') && !t.includes('曲线')) return 'single-var-int';
  if (t.includes('偏导') || t.includes('多元函数') || (t.includes('多元') && t.includes('微分'))) return 'multi-var-diff';
  if (t.includes('重积分') || t.includes('曲面积') || t.includes('曲线积分') || t.includes('多元积分')) return 'multi-var-int';
  if (t.includes('级数') || t.includes('数列求和')) return 'infinite-series';
  if (t.includes('微分方程') || t.includes('ode') || t.includes('常微分')) return 'ode';
  if (t.includes('几何') || t.includes('平面') || t.includes('空间') || t.includes('向量')) return 'space-geo';
  if (t.includes('矩阵') || t.includes('行列式') || t.includes('线性')) return 'linear-algebra';
  if (t.includes('概率') || t.includes('统计')) return 'probability';
  if (t.includes('代数') || t.includes('方程') || t.includes('多项式')) return 'algebra';
  return 'misc';
}

export default function PhotoSolvePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [hasResult, setHasResult] = useState(false);
  const [editableQuestion, setEditableQuestion] = useState('');
  const [selfEval, setSelfEval] = useState<'correct' | 'partial' | 'wrong' | null>(null);
  const [addedToWrongBook, setAddedToWrongBook] = useState(false);
  const [history, setHistory] = useState<PhotoSolveHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'solve' | 'history'>('solve');
  const [confirmClear, setConfirmClear] = useState(false);

  // 确认态 3 秒后自动恢复
  useEffect(() => {
    if (!confirmClear) return;
    const t = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(t);
  }, [confirmClear]);

  const { addWrong } = useWrongBook();

  // 加载历史
  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const handleFileSelected = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      return;
    }
    setImageFile(file);
    setAddedToWrongBook(false);
    setSelfEval(null);
    setHasResult(false);
    setAiContent('');
    setEditableQuestion('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const startRecognition = useCallback(async () => {
    if (!imageFile) return;

    setIsRecognizing(true);
    setAiContent('');
    setHasResult(false);
    setSelfEval(null);
    setAddedToWrongBook(false);

    try {
      const executor = (capabilityClient as any).load(PLUGIN_ID);
      const stream = (executor as any).callStream('imageUnderstanding', {
        question_image: [imageFile],
      });

      let full = '';
      for await (const chunk of stream) {
        const piece = chunk.content ?? '';
        if (piece) {
          full += piece;
          setAiContent(full);
        }
      }

      if (!full.trim()) {
        toast.error('识别失败，请重试或更换更清晰的图片');
        return;
      }

      const parsed = parseAiContent(full);
      setEditableQuestion(parsed.question);
      setHasResult(true);

      // 保存到历史
      const item: PhotoSolveHistoryItem = {
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        imageUrl: imagePreview,
        questionText: parsed.question,
        solution: parsed.solution || full,
        answer: parsed.answer,
        topic: parsed.topic,
        difficulty: parsed.difficulty,
        timestamp: Date.now(),
      };
      const newHistory = [item, ...history].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      writeHistory(newHistory);
    } catch (err) {
      logger.error('拍照识题失败:', String(err));
      toast.error('识别失败，请检查网络后重试');
    } finally {
      setIsRecognizing(false);
    }
  }, [imageFile, imagePreview, history]);

  const reSolve = useCallback(async () => {
    if (!editableQuestion.trim()) {
      toast.error('题目内容不能为空');
      return;
    }
    toast.info('重新解答功能开发中');
  }, [editableQuestion]);

  const handleSelfEval = useCallback(
    (evalResult: 'correct' | 'partial' | 'wrong') => {
      setSelfEval(evalResult);

      // 更新历史记录中的自评
      if (history.length > 0) {
        const newHistory = history.map((item, idx) =>
          idx === 0 ? { ...item, selfEval: evalResult } : item,
        );
        setHistory(newHistory);
        writeHistory(newHistory);
      }

      if (evalResult === 'wrong') {
        toast.message('可点击下方"加入错题本"收藏此题', {
          description: '方便后续复习巩固',
        });
      } else {
        toast.success(evalResult === 'correct' ? '太棒了！继续保持 🎉' : '继续加油，错题记得复习哦');
      }
    },
    [history],
  );

  const addToWrongBook = useCallback(() => {
    if (!hasResult) return;

    const parsed = parseAiContent(aiContent);
    const topicKey = mapTopicKey(parsed.topic);
    const diff = mapDifficulty(parsed.difficulty);

    const question: PracticeQuestion = {
      id: `photo-${Date.now()}`,
      topicKey,
      question: parsed.question.slice(0, 200),
      questionLatex: parsed.question,
      answer: parsed.answer || '见解析',
      answerDisplay: parsed.answer || '见解答过程',
      answerType: 'expression',
      steps: [parsed.solution || aiContent],
      difficulty: diff as Difficulty,
    };

    addWrong(question, '', 'self-eval');
    setAddedToWrongBook(true);
    toast.success('已加入错题本');
  }, [hasResult, aiContent, addWrong]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    writeHistory([]);
    toast.success('历史记录已清空');
  }, []);

  const loadFromHistory = useCallback((item: PhotoSolveHistoryItem) => {
    setImagePreview(item.imageUrl);
    setImageFile(null);
    setAiContent(item.solution);
    setEditableQuestion(item.questionText);
    setHasResult(true);
    setSelfEval(item.selfEval ?? null);
    setAddedToWrongBook(false);
    setActiveTab('solve');
  }, []);

  const parsed = parseAiContent(aiContent);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <PageShell
          title="拍照识题"
          description="上传题目图片，AI 自动识别并给出详细解答"
          eyebrow="计算工具"
          width="tool"
        />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'solve' | 'history')}>
          <TabsList className="mb-4">
            <TabsTrigger value="solve">解题</TabsTrigger>
            <TabsTrigger value="history">
              历史记录
              {history.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {history.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solve" className="space-y-6">
            {/* 上传区域 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">上传题目图片</CardTitle>
                <CardDescription>支持拍照或从相册选择，图片越清晰识别越准确</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={onFileChange}
                />

                {!imagePreview ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent/30 transition-colors"
                    >
                      <Camera className="size-8 text-primary" />
                      <div className="text-sm font-medium">拍照</div>
                      <div className="text-xs text-muted-foreground">调用相机实时拍摄</div>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-accent/30 transition-colors"
                    >
                      <Upload className="size-8 text-primary" />
                      <div className="text-sm font-medium">从相册选择</div>
                      <div className="text-xs text-muted-foreground">支持 JPG/PNG 格式</div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-muted max-h-[400px] flex items-center justify-center">
                      <Image
                        src={imagePreview}
                        alt="题目预览"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                      {isRecognizing && (
                        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                          <Loader2 className="size-8 text-primary animate-spin" />
                          <div className="text-sm font-medium">正在识别题目…</div>
                          <div className="text-xs text-muted-foreground">AI 正在读题和解答，请稍候</div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="size-4 mr-1.5" />
                        重新选择
                      </Button>
                      {!isRecognizing && !hasResult && (
                        <Button onClick={startRecognition}>
                          开始识别
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 识别结果 */}
            {hasResult && (
              <>
                {/* 识别题目（可编辑） */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">识别题目</CardTitle>
                      <Button variant="ghost" size="sm" onClick={reSolve}>
                        <RefreshCw className="size-4 mr-1.5" />
                        重新解答
                      </Button>
                    </div>
                    <CardDescription>如识别有误，可手动修改后重新解答</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={editableQuestion}
                      onChange={(e) => setEditableQuestion(e.target.value)}
                      className="min-h-[80px] font-mono text-sm resize-y"
                      placeholder="识别的题目内容..."
                    />
                  </CardContent>
                </Card>

                {/* 解答过程 */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-lg">解答过程</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{parsed.topic || '数学综合'}</Badge>
                        <Badge variant="secondary">{parsed.difficulty || '中等'}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ProblemText text={parsed.solution || aiContent} displayMath />
                    </div>
                    {parsed.answer && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="text-sm font-medium text-muted-foreground mb-1">最终答案</div>
                        <div className="text-base font-semibold text-primary">
                          <ProblemText text={parsed.answer} displayMath />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 用户自评 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">我的作答情况</CardTitle>
                    <CardDescription>做完后自评一下，帮助安排复习</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant={selfEval === 'correct' ? 'default' : 'secondary'}
                        className={selfEval === 'correct' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                        onClick={() => handleSelfEval('correct')}
                      >
                        <CheckCircle2 className="size-4 mr-1.5" />
                        做对了
                      </Button>
                      <Button
                        variant={selfEval === 'partial' ? 'default' : 'secondary'}
                        className={selfEval === 'partial' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                        onClick={() => handleSelfEval('partial')}
                      >
                        <MinusCircle className="size-4 mr-1.5" />
                        部分对
                      </Button>
                      <Button
                        variant={selfEval === 'wrong' ? 'default' : 'secondary'}
                        className={selfEval === 'wrong' ? 'bg-red-600 hover:bg-red-700' : ''}
                        onClick={() => handleSelfEval('wrong')}
                      >
                        <XCircle className="size-4 mr-1.5" />
                        做错了
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 加入错题本 */}
                <Card>
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <BookMarked className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm">加入错题本</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            按艾宾浩斯曲线自动安排复习，巩固薄弱知识点
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={addedToWrongBook ? 'secondary' : 'default'}
                        disabled={addedToWrongBook}
                        onClick={addToWrongBook}
                        size="sm"
                      >
                        {addedToWrongBook ? (
                          <>
                            <CheckCircle2 className="size-4 mr-1.5" />
                            已加入
                          </>
                        ) : (
                          <>加入错题本</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <History className="size-10 text-muted-foreground/50 mb-3" />
                  <div className="text-sm text-muted-foreground mb-1">暂无识题记录</div>
                  <div className="text-xs text-muted-foreground/70">上传图片解题后，记录会保存在这里</div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">最近 {history.length} 条记录</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={confirmClear ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                    onClick={() => {
                      if (confirmClear) {
                        clearHistory();
                        setConfirmClear(false);
                      } else {
                        setConfirmClear(true);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5 mr-1.5" />
                    {confirmClear ? '确认清空？' : '清空'}
                  </Button>
                </div>
                <div className="space-y-2">
                  {history.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => loadFromHistory(item)}
                    >
                      <CardContent className="p-4 flex gap-3">
                        <div className="size-16 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                          <Image
                            src={item.imageUrl}
                            alt="题目缩略图"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium line-clamp-2 mb-1">{item.questionText}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.topic}</span>
                            <span>·</span>
                            <span>{new Date(item.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            {item.selfEval && (
                              <>
                                <span>·</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    item.selfEval === 'correct'
                                      ? 'text-emerald-600 border-emerald-200'
                                      : item.selfEval === 'partial'
                                        ? 'text-amber-600 border-amber-200'
                                        : 'text-red-600 border-red-200'
                                  }
                                >
                                  {item.selfEval === 'correct' ? '做对了' : item.selfEval === 'partial' ? '部分对' : '做错了'}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground shrink-0 self-center" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
