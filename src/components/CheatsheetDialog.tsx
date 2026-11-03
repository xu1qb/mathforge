import { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CHEATSHEETS, type ICheatsheetItem } from '@/data/cheatsheets';

interface CheatsheetDialogProps {
  moduleKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CheatsheetDialogInner({ moduleKey, open, onOpenChange }: CheatsheetDialogProps) {
  const data = CHEATSHEETS[moduleKey];

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 bg-card text-card-foreground">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogTitle className="text-xl font-bold text-foreground">
            函数与语法速查
            <span className="text-sm font-normal text-muted-foreground ml-3">当前工具：{data.title}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            {data.intro}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {data.categories.map((cat) => (
            <div key={cat.name}>
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {cat.name}
              </h3>
              <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/30">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted text-muted-foreground">
                      <th className="text-left font-medium px-4 py-2.5 w-2/5">语法</th>
                      <th className="text-left font-medium px-4 py-2.5 w-2/5">说明</th>
                      <th className="text-left font-medium px-4 py-2.5 w-1/5">示例</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.items.map((item: ICheatsheetItem, idx: number) => (
                      <tr key={idx} className="border-t border-border/40">
                        <td className="px-4 py-2.5">
                          <code className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-mono">
                            {item.syntax}
                          </code>
                        </td>
                        <td className="px-4 py-2.5 text-foreground">{item.description}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">{item.example ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const CheatsheetDialog = memo(CheatsheetDialogInner);
export default CheatsheetDialog;
