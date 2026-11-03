import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import {
  FORMULA_CATEGORIES,
  FORMULA_ITEMS,
} from '@/data/competition-formulas';
import MathRenderer from '@/components/MathRenderer';

interface FormulaPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FormulaPrintDialog({ open, onOpenChange }: FormulaPrintDialogProps) {
  const handlePrint = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 100);
    });
  };

  const todayStr = format(new Date(), 'yyyy 年 M 月 d 日');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print-content">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            打印公式手册
          </DialogTitle>
          <DialogDescription>
            按 8 大专题分组，A4 双列紧凑排版，黑白打印友好
          </DialogDescription>
        </DialogHeader>

        <div className="no-print text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          共 {FORMULA_CATEGORIES.length} 个专题 · {FORMULA_ITEMS.length} 条公式 · A4 双列 · 黑白打印
        </div>

        {/* 打印内容 */}
        <div className="print-content hidden print:block">
          <div className="print-page">
            {/* 页眉 */}
            <div className="print-header">
              <div>
                <span className="print-title">数学竞赛公式速查手册</span>
                <span className="ml-3 text-xs text-muted-foreground">
                  8 大专题 · {FORMULA_ITEMS.length} 条核心公式
                </span>
              </div>
              <div className="text-right">{todayStr}</div>
            </div>

            {/* 双列公式列表 */}
            <div className="print-formula-book">
              {FORMULA_CATEGORIES.map((cat) => {
                const items = FORMULA_ITEMS.filter((f) => f.category === cat.key);
                if (items.length === 0) return null;
                return (
                  <div key={cat.key} className="print-formula-category">
                    <h3>{cat.label}</h3>
                    {items.map((f) => (
                      <div key={f.id} className="print-formula-item">
                        <div className="print-formula-name">{f.title}</div>
                        <div className="print-formula-latex">
                          <MathRenderer expression={f.latex} displayMode />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* 页脚 */}
            <div className="print-footer">
              <span>数学竞赛公式速查手册</span>
              <span>第 1 页</span>
            </div>
          </div>
        </div>

        <DialogFooter className="no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="size-4 mr-1.5" />
            开始打印
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
