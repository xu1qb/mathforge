// EXPORTS: DataSettingsDialog
// 数据备份与导入设置弹窗

import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  exportLearningData,
  importLearningData,
  exportFavorites,
  importFavorites,
  exportFormulaFavoritesAsMarkdown,
} from '@/lib/data-backup';
import { toast } from 'sonner';
import {
  Download,
  Upload,
  FileJson,
  BookMarked,
  GraduationCap,
  Star,
  AlertTriangle,
} from 'lucide-react';

interface DataSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DataSettingsDialog({ open, onOpenChange }: DataSettingsDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const favFileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleImportLearning = async (file: File) => {
    setImporting(true);
    try {
      const result = await importLearningData(file);
      if (result.ok) {
        toast.success('学习数据导入成功，请刷新页面查看');
        onOpenChange(false);
      } else {
        toast.error(`导入失败：${result.error}`);
      }
    } finally {
      setImporting(false);
    }
  };

  const handleImportFavorites = async (file: File) => {
    setImporting(true);
    try {
      const result = await importFavorites(file);
      if (result.ok) {
        toast.success(`收藏夹导入成功（${result.items?.length || 0} 条）`);
        onOpenChange(false);
      } else {
        toast.error(`导入失败：${result.error}`);
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-lg">数据备份与恢复</DialogTitle>
          <DialogDescription>
            导出或导入你的学习数据、收藏夹、公式收藏。数据以 JSON 格式存储在本地浏览器中。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 学习数据 */}
          <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <GraduationCap className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">学习数据</div>
                <div className="text-xs text-muted-foreground">练习统计、错题本、限时挑战最高分</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportLearningData}>
                <Download className="size-4 mr-1.5" />
                导出 JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                <Upload className="size-4 mr-1.5" />
                导入 JSON
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImportLearning(f);
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          {/* 计算收藏夹 */}
          <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Star className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">计算收藏夹</div>
                <div className="text-xs text-muted-foreground">保存的计算结果（各模块）</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportFavorites}>
                <Download className="size-4 mr-1.5" />
                导出 JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => favFileInputRef.current?.click()}
                disabled={importing}
              >
                <Upload className="size-4 mr-1.5" />
                导入 JSON
              </Button>
              <input
                ref={favFileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImportFavorites(f);
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          {/* 公式收藏 */}
          <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <BookMarked className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">公式收藏</div>
                <div className="text-xs text-muted-foreground">已收藏的公式条目</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportFormulaFavoritesAsMarkdown}>
                <FileJson className="size-4 mr-1.5" />
                导出 Markdown
              </Button>
            </div>
          </div>

          {/* 提示 */}
          <div className="flex gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200/50 dark:border-amber-800/40">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium mb-0.5">注意</div>
              <div className="text-amber-700/80">
                导入会与现有数据合并（去重），不会覆盖。建议导出前先确认当前数据完整性。
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
