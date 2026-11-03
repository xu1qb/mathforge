// EXPORTS: useLastVisitedModule, recordModuleVisit, useLastVisited

import { useState, useEffect, useCallback } from 'react';
import { scopedStorage } from '@/lib/lark-mock';

const STORAGE_KEY = 'mathforge:last-visited';

interface LastVisited {
  modulePath: string;
  tab?: string;
  timestamp: number;
}

function readLast(): LastVisited | null {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && typeof d === 'object' ? d : null;
  } catch {
    return null;
  }
}

function writeLast(data: LastVisited) {
  try {
    scopedStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * 记住用户上次访问的模块和 tab，刷新后恢复
 */
export function useLastVisitedModule() {
  const [last, setLast] = useState<LastVisited | null>(null);

  useEffect(() => {
    setLast(readLast());
  }, []);

  const recordVisit = useCallback((modulePath: string, tab?: string) => {
    const rec: LastVisited = { modulePath, tab, timestamp: Date.now() };
    setLast(rec);
    writeLast(rec);
  }, []);

  return { last, recordVisit };
}

/** 简化版：只返回上次访问的路径字符串 */
export function useLastVisited() {
  const [lastPath, setLastPath] = useState<string | null>(null);

  useEffect(() => {
    const last = readLast();
    if (last?.modulePath) setLastPath(last.modulePath);
  }, []);

  const recordVisit = useCallback((modulePath: string, tab?: string) => {
    const rec: LastVisited = { modulePath, tab, timestamp: Date.now() };
    writeLast(rec);
  }, []);

  return { lastPath, recordVisit };
}
