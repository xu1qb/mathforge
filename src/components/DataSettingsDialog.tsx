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
  exportAllData,
  importAllData,
  clearLocalAppData,
} from '@/lib/data-backup';
import { LAST_USER_KEY } from '@/lib/cloud-sync';
import { useAuth } from '@/auth/AuthProvider';
import { useCloudSync, type CloudSyncStatus } from '@/auth/CloudSyncProvider';
import { toast } from 'sonner';
import {
  Database,
  Download,
  Upload,
  FileJson,
  BookMarked,
  GraduationCap,
  Star,
  AlertTriangle,
  Cloud,
  LogOut,
  RefreshCw,
  UserRound,
} from 'lucide-react';

interface DataSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SYNC_LABEL: Record<CloudSyncStatus, string> = {
  idle: '待同步',
  syncing: '同步中…',
  synced: '已同步',
  offline: '离线',
  error: '同步失败',
};

export default function DataSettingsDialog({ open, onOpenChange }: DataSettingsDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const favFileInputRef = useRef<HTMLInputElement>(null);
  const allFileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { user, signOut } = useAuth();
  const { status, lastSyncedAt, lastError, syncNow } = useCloudSync();

  const handleSignOut = async () => {
    const confirmed = window.confirm(
      '退出登录后会清除本机缓存，云端数据会保留。下次登录会重新从云端恢复，确定退出吗？'
    );
    if (!confirmed) return;
    setSigningOut(true);
    try {
      await signOut();
      clearLocalAppData();
      localStorage.removeItem(LAST_USER_KEY);
      window.location.reload();
    } finally {
      setSigningOut(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await syncNow();
    } finally {
      setSyncing(false);
    }
  };

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

  const handleImportAll = async (file: File) => {
    const confirmed = window.confirm(
      '恢复会用备份覆盖当前的全部进度（错题本、掌握标记、打卡、统计、收藏等），确定继续吗？'
    );
    if (!confirmed) return;
    setImporting(true);
    try {
      const result = await importAllData(file);
      if (result.ok) {
        toast.success('已恢复 ' + result.count + ' 项数据，正在刷新…');
        window.setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error('恢复失败：' + result.error);
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
            导出或导入你的学习数据、收藏夹、公式收藏。登录后学习数据会自动同步到云端，本地仍保留一份缓存。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 账号与云同步 */}
          <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <Cloud className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">账号与云同步</div>
                <div className="truncate text-xs text-muted-foreground">
                  {user ? user.email : '未登录'}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className={`size-2 rounded-full ${
                    status === 'error'
                      ? 'bg-destructive'
                      : status === 'syncing'
                        ? 'bg-amber-500'
                        : status === 'offline'
                          ? 'bg-muted-foreground'
                          : 'bg-emerald-500'
                  }`}
                />
                {SYNC_LABEL[status]}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncNow}
                disabled={syncing || status === 'syncing' || !user}
              >
                <RefreshCw
                  className={`size-4 mr-1.5 ${syncing || status === 'syncing' ? 'animate-spin' : ''}`}
                />
                立即同步
              </Button>
              <Button size="sm" variant="ghost" onClick={handleSignOut} disabled={signingOut || !user}>
                <LogOut className="size-4 mr-1.5" />
                {signingOut ? '正在退出…' : '退出登录'}
              </Button>
              <span className="text-xs text-muted-foreground">
                上次同步：{lastSyncedAt ? lastSyncedAt.toLocaleString() : '尚未同步'}
              </span>
            </div>
            {lastError && <div className="text-xs text-destructive">同步失败：{lastError}</div>}
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <UserRound className="size-3.5 mt-0.5 shrink-0" />
              退出登录会清除本机缓存，云端数据保留。
            </div>
          </div>

          {/* 完整备份 */}
          <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Database className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">完整备份（推荐）</div>
                <div className="text-xs text-muted-foreground">
                  一次性打包全部进度，换设备或清缓存前先导一份
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={exportAllData}>
                <Download className="size-4 mr-1.5" />
                导出全部数据
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => allFileInputRef.current?.click()}
                disabled={importing}
              >
                <Upload className="size-4 mr-1.5" />
                从备份恢复
              </Button>
              <input
                ref={allFileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImportAll(f);
                  e.target.value = '';
                }}
              />
            </div>
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-amber-600" />
              恢复会<b className="mx-0.5">覆盖</b>当前数据，请确认备份文件是最新的一份。
            </div>
          </div>

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
