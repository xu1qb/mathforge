import { useMemo, useState, useEffect, useCallback } from 'react';
import { scopedStorage } from '@/lib/lark-mock';
import { MATH_BLIND_BOXES, type MathBlindBox } from '@/data/blind-box';

const STORAGE_KEY = 'mathforge:blindbox:opened';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seedFromDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTodayBoxIndex(openedIds: string[]): number {
  const total = MATH_BLIND_BOXES.length;
  const today = getTodayKey();
  const seed = seedFromDate(today);

  // 优先选未拆过的
  const unopened = MATH_BLIND_BOXES.filter((b) => !openedIds.includes(b.id));
  if (unopened.length > 0) {
    const idx = seed % unopened.length;
    const chosen = unopened[idx];
    return MATH_BLIND_BOXES.findIndex((b) => b.id === chosen.id);
  }

  // 全拆过了就按日期循环
  return seed % total;
}

export function getOpenedIds(): string[] {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

export function setOpenedIds(ids: string[]) {
  scopedStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useBlindBox() {
  const [openedIds, setOpenedIdsState] = useState<string[]>(() => getOpenedIds());
  const [isFlipped, setIsFlipped] = useState(false);

  const todayIndex = useMemo(
    () => getTodayBoxIndex(openedIds),
    [openedIds],
  );
  const todayBox: MathBlindBox = MATH_BLIND_BOXES[todayIndex];
  const isOpened = openedIds.includes(todayBox.id);
  const openedCount = openedIds.length;
  const totalCount = MATH_BLIND_BOXES.length;

  const openBox = useCallback(() => {
    if (!openedIds.includes(todayBox.id)) {
      const next = [...openedIds, todayBox.id];
      setOpenedIdsState(next);
      setOpenedIds(next);
    }
    setIsFlipped(true);
  }, [openedIds, todayBox.id]);

  const resetFlip = useCallback(() => {
    setIsFlipped(false);
  }, []);

  // 已拆过的今天自动翻开
  useEffect(() => {
    if (isOpened) {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [isOpened, todayIndex]);

  return {
    todayBox,
    todayIndex,
    isOpened,
    isFlipped,
    openedIds,
    openedCount,
    totalCount,
    allBoxes: MATH_BLIND_BOXES,
    openBox,
    resetFlip,
  };
}
