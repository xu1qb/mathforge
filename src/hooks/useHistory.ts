import { useState, useEffect, useCallback, useRef } from 'react';
import { scopedStorage } from '@/lib/lark-mock';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

interface UseHistoryOptions {
  storageKey: string;
  maxItems?: number;
}

/**
 * 统一计算历史记录 hook，使用 scopedStorage 持久化
 */
export function useHistory({ storageKey, maxItems = 30 }: UseHistoryOptions) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const loadedRef = useRef(false);

  // 初始加载
  useEffect(() => {
    try {
      const raw = scopedStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryItem[];
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, maxItems));
        }
      }
    } catch {
      // ignore parse errors
    }
    loadedRef.current = true;
  }, [storageKey, maxItems]);

  // 持久化保存
  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      scopedStorage.setItem(storageKey, JSON.stringify(history));
    } catch {
      // ignore storage errors
    }
  }, [history, storageKey]);

  const addItem = useCallback((expression: string, result: string) => {
    if (!expression.trim() || !result) return;
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      expression,
      result,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      // 去重：如果最后一条完全相同则不加
      if (prev.length > 0 && prev[0].expression === expression && prev[0].result === result) {
        return prev;
      }
      return [item, ...prev].slice(0, maxItems);
    });
  }, [maxItems]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      scopedStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return {
    history,
    addItem,
    clearHistory,
    isEmpty: history.length === 0,
  };
}
