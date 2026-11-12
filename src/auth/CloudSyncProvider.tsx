import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, Cloud, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  applyLocalSnapshot,
  buildLocalSnapshot,
  clearLocalAppData,
  exportAllData,
  type LocalSnapshot,
} from '@/lib/data-backup';
import { LAST_USER_KEY, loadCloudSnapshot, saveCloudSnapshot } from '@/lib/cloud-sync';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface CloudConflict {
  local: LocalSnapshot;
  cloud: LocalSnapshot;
  cloudUpdatedAt: string | null;
}

interface CloudSyncContextValue {
  status: CloudSyncStatus;
  lastSyncedAt: Date | null;
  lastError: string | null;
  conflict: CloudConflict | null;
  syncNow: () => Promise<void>;
  resolveConflict: (choice: 'cloud' | 'local') => Promise<void>;
}

const CloudSyncContext = createContext<CloudSyncContextValue | null>(null);

function formatTime(value: string | Date | null): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function entryCount(snapshot: LocalSnapshot | null | undefined): number {
  return snapshot ? Object.keys(snapshot.entries).length : 0;
}

export function CloudSyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [status, setStatus] = useState<CloudSyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<CloudConflict | null>(null);
  const [ready, setReady] = useState(false);
  const initializedFor = useRef<string | null>(null);
  const lastJson = useRef('');
  const busy = useRef(false);
  const initializing = useRef(false);
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const runInitialSync = useCallback(async () => {
    if (!supabase || !userId || initializing.current) return;
    initializing.current = true;
    setStatus('syncing');
    setLastError(null);

    try {
      const lastUser = localStorage.getItem(LAST_USER_KEY);
      if (lastUser && lastUser !== userId) clearLocalAppData();
      localStorage.setItem(LAST_USER_KEY, userId);

      const local = buildLocalSnapshot({ excludeUi: true });
      const cloud = await loadCloudSnapshot(userId);
      if (userIdRef.current !== userId) return;
      if (cloud.error) {
        setStatus('error');
        setLastError(cloud.error);
        return;
      }

      const cloudEntries = cloud.snapshot?.entries ?? {};
      const cloudCount = Object.keys(cloudEntries).length;
      const localCount = Object.keys(local.entries).length;

      if (cloudCount === 0) {
        if (localCount > 0) {
          const { error } = await saveCloudSnapshot(userId, local);
          if (userIdRef.current !== userId) return;
          if (error) {
            setStatus('error');
            setLastError(error);
            return;
          }
        }
        lastJson.current = JSON.stringify(local.entries);
        setReady(true);
        setStatus(localCount > 0 ? 'synced' : 'idle');
        if (localCount > 0) setLastSyncedAt(new Date());
        return;
      }

      if (localCount === 0) {
        applyLocalSnapshot(cloudEntries);
        window.location.reload();
        return;
      }

      if (JSON.stringify(local.entries) === JSON.stringify(cloudEntries)) {
        lastJson.current = JSON.stringify(local.entries);
        setReady(true);
        setStatus('synced');
        setLastSyncedAt(cloud.updatedAt ? new Date(cloud.updatedAt) : new Date());
        return;
      }

      lastJson.current = JSON.stringify(local.entries);
      setConflict({ local, cloud: cloud.snapshot as LocalSnapshot, cloudUpdatedAt: cloud.updatedAt });
      setStatus('idle');
    } finally {
      initializing.current = false;
    }
  }, [userId]);

  useEffect(() => {
    if (!supabase || !userId) {
      initializedFor.current = null;
      setReady(false);
      setConflict(null);
      setStatus('idle');
      setLastError(null);
      lastJson.current = '';
      return;
    }
    if (initializedFor.current === userId) return;
    initializedFor.current = userId;
    void runInitialSync();
  }, [userId, runInitialSync]);

  useEffect(() => {
    if (!supabase || !userId || !ready || conflict) return;

    const tick = async () => {
      if (busy.current) return;
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }
      const snapshot = buildLocalSnapshot({ excludeUi: true });
      const json = JSON.stringify(snapshot.entries);
      if (json === lastJson.current) return;
      busy.current = true;
      setStatus('syncing');
      const { error } = await saveCloudSnapshot(userId, snapshot);
      busy.current = false;
      if (error) {
        setStatus('error');
        setLastError(error);
        return;
      }
      lastJson.current = json;
      setLastSyncedAt(new Date());
      setStatus('synced');
    };

    const timer = window.setInterval(tick, 5000);
    const onOnline = () => {
      setStatus('idle');
      void tick();
    };
    const onOffline = () => setStatus('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [userId, ready, conflict]);

  const syncNow = useCallback(async () => {
    if (!supabase || !userId) return;
    if (!ready) {
      await runInitialSync();
      return;
    }
    setStatus('syncing');
    setLastError(null);
    const snapshot = buildLocalSnapshot({ excludeUi: true });
    const { error } = await saveCloudSnapshot(userId, snapshot);
    if (error) {
      setStatus('error');
      setLastError(error);
      return;
    }
    lastJson.current = JSON.stringify(snapshot.entries);
    setLastSyncedAt(new Date());
    setStatus('synced');
  }, [userId, ready, runInitialSync]);

  const resolveConflict = useCallback(
    async (choice: 'cloud' | 'local') => {
      if (!conflict || !userId) return;
      if (choice === 'cloud') {
        applyLocalSnapshot(conflict.cloud.entries);
        window.location.reload();
        return;
      }
      setStatus('syncing');
      setLastError(null);
      const { error } = await saveCloudSnapshot(userId, conflict.local);
      if (error) {
        setStatus('error');
        setLastError(error);
        return;
      }
      lastJson.current = JSON.stringify(conflict.local.entries);
      setConflict(null);
      setReady(true);
      setLastSyncedAt(new Date());
      setStatus('synced');
    },
    [conflict, userId]
  );

  return (
    <CloudSyncContext.Provider
      value={{ status, lastSyncedAt, lastError, conflict, syncNow, resolveConflict }}
    >
      {children}
      <Dialog open={Boolean(conflict)} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              发现两份不同的数据
            </DialogTitle>
            <DialogDescription>
              云端和本机都保存了学习数据，但内容不一样。请选择要保留的一份，另一份会被覆盖。为避免数据丢失，需要先做出选择。
            </DialogDescription>
          </DialogHeader>
          {conflict && (
            <div className="space-y-3 py-2 text-sm">
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2 font-medium">
                  <Cloud className="size-4" /> 云端
                </div>
                <div className="mt-1 text-muted-foreground">
                  {entryCount(conflict.cloud)} 项数据 · 更新于 {formatTime(conflict.cloudUpdatedAt)}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2 font-medium">
                  <Download className="size-4" /> 本机
                </div>
                <div className="mt-1 text-muted-foreground">
                  {entryCount(conflict.local)} 项数据 · 备份于 {formatTime(conflict.local.exportedAt)}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={exportAllData}>
                先导出本机备份
              </Button>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => void resolveConflict('local')}>
              <Upload className="size-4" /> 用本机覆盖云端
            </Button>
            <Button onClick={() => void resolveConflict('cloud')}>
              <Cloud className="size-4" /> 使用云端数据
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CloudSyncContext.Provider>
  );
}

export function useCloudSync(): CloudSyncContextValue {
  const ctx = useContext(CloudSyncContext);
  if (!ctx) throw new Error('useCloudSync must be used within CloudSyncProvider');
  return ctx;
}
