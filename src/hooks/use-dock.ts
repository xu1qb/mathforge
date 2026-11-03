// EXPORTS: useDock, DOCK_KEY, DOCK_LIMIT, DOCK_DEFAULT
import { useState, useEffect, useCallback } from 'react';
import { scopedStorage, logger } from '@/lib/lark-mock';
import { toast } from 'sonner';

export const DOCK_KEY = 'mathforge:dock';
export const DOCK_LIMIT = 8;

/** 默认 Dock 项（path 必须与 NAV_GROUPS 中的 path 完全一致） */
export const DOCK_DEFAULT: string[] = [
  '/',
  '/calculator',
  '/competition',
  '/practice',
];

function readDock(): string[] {
  try {
    const raw = scopedStorage.getItem(DOCK_KEY);
    if (!raw) return [...DOCK_DEFAULT];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((p) => typeof p === 'string')) {
      return parsed.slice(0, DOCK_LIMIT);
    }
    return [...DOCK_DEFAULT];
  } catch (err) {
    logger.warn('读取 Dock 失败:', String(err));
    return [...DOCK_DEFAULT];
  }
}

function writeDock(items: string[]) {
  try {
    scopedStorage.setItem(DOCK_KEY, JSON.stringify(items.slice(0, DOCK_LIMIT)));
  } catch (err) {
    logger.error('保存 Dock 失败:', String(err));
  }
}

export function useDock() {
  const [dockItems, setDockItems] = useState<string[]>(() => readDock());

  // 跨标签页同步
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === DOCK_KEY || e.key?.includes(DOCK_KEY)) {
        setDockItems(readDock());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isPinned = useCallback((path: string) => dockItems.includes(path), [dockItems]);

  const pinToDock = useCallback((path: string) => {
    setDockItems((prev) => {
      if (prev.includes(path)) return prev;
      if (prev.length >= DOCK_LIMIT) {
        toast.warning(`常用栏已满（最多 ${DOCK_LIMIT} 个），请先移除部分项`);
        return prev;
      }
      const next = [...prev, path];
      writeDock(next);
      toast.success('已添加到常用栏');
      return next;
    });
  }, []);

  const removeFromDock = useCallback((path: string) => {
    setDockItems((prev) => {
      const next = prev.filter((p) => p !== path);
      writeDock(next);
      return next;
    });
  }, []);

  const resetDock = useCallback(() => {
    setDockItems([...DOCK_DEFAULT]);
    writeDock(DOCK_DEFAULT);
  }, []);

  return {
    dockItems,
    isPinned,
    pinToDock,
    removeFromDock,
    resetDock,
    limit: DOCK_LIMIT,
  };
}
