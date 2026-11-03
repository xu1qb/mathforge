import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer, FileText, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { PRACTICE_TOPICS, type PracticeQuestion } from '@/lib/math-practice';
import type { WrongItem } from '@/hooks/use-learning';
import MathRenderer from '@/components/MathRenderer';
import RichTextRenderer from '@/components/RichTextRenderer';

interface WrongBookPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: WrongItem[];
  pendingItems: WrongItem[];
}

type PrintScope = 'all' | 'pending' | 'topic';
type PrintMode = 'question' | 'answer';

const PROBLEMS_PER_PAGE = 3;
const STUDENT_NAME = '徐秋博';

export default function WrongBookPrintDialog({
  open,
  onOpenChange,
  items,
  pendingItems,
}: WrongBookPrintDialogProps) {
  const [scope, setScope] = useState<PrintScope>('all');
  const [topicKey, setTopicKey] = useState('all');
  const [mode, setMode] = useState<PrintMode>('question');

  const filteredItems = useMemo(() => {
    let list: WrongItem[];
    if (scope === 'pending') {
      list = pendingItems;
    } else {
      list = items;
    }
    if (scope === 'topic' && topicKey !== 'all') {
      list = list.filter((w) => w.topicKey === topicKey);
    }
    // 按知识点分组再按时间排序，便于打印后装订
    return [...list].sort((a, b) => {
      if (a.topicKey !== b.topicKey) return a.topicKey.localeCompare(b.topicKey);
      return b.wrongTime - a.wrongTime;
    });
  }, [scope, topicKey, items, pendingItems]);

  // 分页
  const pages = useMemo(() => {
    const result: WrongItem[][] = [];
    for (let i = 0; i < filteredItems.length; i += PROBLEMS_PER_PAGE) {
      result.push(filteredItems.slice(i, i + PROBLEMS_PER_PAGE));
    }
    if (result.length === 0) result.push([]);
    return result;
  }, [filteredItems]);

  const handlePrint = () => {
    // 等一帧让 DOM 渲染完整再打印
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 100);
    });
  };

  const getTopicLabel = (key: string) =>
    PRACTICE_TOPICS.find((t) => t.key === key)?.label ?? key;

  const todayStr = format(new Date(), 'yyyy 年 M 月 d 日');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto print-content">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            打印错题本
          </DialogTitle>
          <DialogDescription>
            选择打印范围和模式，生成 A4 友好的打印视图
          </DialogDescription>
        </DialogHeader>

        {/* 设置区 */}
        <div className="no-print space-y-5 py-2">
          {/* 范围 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">打印范围</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => setScope(v as PrintScope)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="cursor-pointer font-normal">
                  全部错题（{items.length} 道）
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="scope-pending" />
                <Label htmlFor="scope-pending" className="cursor-pointer font-normal">
                  仅待复习（{pendingItems.length} 道）
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="topic" id="scope-topic" />
                <Label htmlFor="scope-topic" className="cursor-pointer font-normal">
                  按专题筛选
                </Label>
              </div>
            </RadioGroup>

            {scope === 'topic' && (
              <div className="mt-3">
                <Select value={topicKey} onValueChange={setTopicKey}>
                  <SelectTrigger className="w-56 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部知识点</SelectItem>
                    {PRACTICE_TOPICS.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* 模式 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">打印模式</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as PrintMode)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="question" id="mode-question" />
                <Label htmlFor="mode-question" className="cursor-pointer font-normal flex items-center gap-1.5">
                  <FileText className="size-4 text-muted-foreground" />
                  做题模式（题目 + 留白横线）
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="answer" id="mode-answer" />
                <Label htmlFor="mode-answer" className="cursor-pointer font-normal flex items-center gap-1.5">
                  <CheckSquare className="size-4 text-muted-foreground" />
                  答案模式（题目 + 完整解析）
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            共 {filteredItems.length} 道题，分 {pages.length} 页 · A4 黑白打印友好 ·
            {mode === 'question' ? ' 适合重做自测' : ' 适合复习对照'}
          </div>
        </div>

        {/* 打印预览（仅打印时输出） */}
        <div className="print-content hidden print:block">
          {pages.map((pageItems, pageIdx) => (
            <div key={pageIdx} className="print-page">
              {/* 页眉 */}
              <div className="print-header">
                <div>
                  <span className="print-title">数学竞赛错题本</span>
                  <span className="ml-3 text-xs text-muted-foreground">
                    第 {pageIdx + 1} 页 / 共 {pages.length} 页
                  </span>
                </div>
                <div className="text-right">
                  <div>姓名：{STUDENT_NAME}</div>
                  <div>{todayStr}</div>
                </div>
              </div>

              {/* 题目列表 */}
              <div>
                {pageItems.length === 0 ? (
                  <div className="text-center text-muted-foreground py-20">暂无错题</div>
                ) : (
                  pageItems.map((w, idx) => (
                    <PrintProblem
                      key={w.id}
                      index={pageIdx * PROBLEMS_PER_PAGE + idx + 1}
                      topicLabel={getTopicLabel(w.topicKey)}
                      question={w.question}
                      userAnswer={w.userAnswer}
                      mode={mode}
                    />
                  ))
                )}
              </div>

              {/* 页脚 */}
              <div className="print-footer">
                <span>数学竞赛错题本 · {STUDENT_NAME}</span>
                <span>第 {pageIdx + 1} 页</span>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handlePrint} disabled={filteredItems.length === 0}>
            <Printer className="size-4 mr-1.5" />
            开始打印
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 单题打印渲染
// ============================================================

function PrintProblem({
  index,
  topicLabel,
  question,
  userAnswer,
  mode,
}: {
  index: number;
  topicLabel: string;
  question: PracticeQuestion;
  userAnswer: string | undefined;
  mode: PrintMode;
}) {
  return (
    <div className="print-problem">
      <div className="print-problem-index">
        第 {index} 题
        <span className="print-problem-topic">{topicLabel}</span>
      </div>
      <div className="print-problem-body">
        <RichTextRenderer text={question.questionLatex} />
      </div>

      {userAnswer && (
        <div className="print-user-answer">
          <span className="label">我的错误答案：</span>
          {userAnswer}
        </div>
      )}

      {mode === 'question' ? (
        <div className="print-blank-lines" aria-label="订正留白区" />
      ) : (
        <div className="print-solution">
          <span className="label">正确答案</span>
          <div className="mb-2">
            <RichTextRenderer text={question.answerDisplay} />
          </div>
          {question.steps && question.steps.length > 0 && (
            <div>
              <div className="label mt-2">解析</div>
              <ol className="list-decimal list-inside space-y-1">
                {question.steps.map((step, i) => (
                  <li key={i}>
                    <MathRenderer expression={step} displayMode={false} />
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
