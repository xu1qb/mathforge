// EXPORTS: useFormulaFavorites, FAVORITES_KEY

import { useState, useEffect, useCallback } from 'react';
import { scopedStorage } from '@/lib/lark-mock';

export const FAVORITES_KEY = 'mathforge:formula-favorites';

export function useFormulaFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // 初始加载
  useEffect(() => {
    try {
      const raw = scopedStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const addFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev;
      const next = [id, ...prev];
      try {
        scopedStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f !== id);
      try {
        scopedStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((f) => f !== id);
      } else {
        next = [id, ...prev];
      }
      try {
        scopedStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite };
}
