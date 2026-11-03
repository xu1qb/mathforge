import { differenceInDays } from 'date-fns';
import { scopedStorage } from '@/lib/lark-mock';
import type { typeQuizResult } from '@/data/mathematician-quiz';

const STORAGE_KEY = 'mathforge:mathematician-quiz:history';
const COOLDOWN_DAYS = 30;

export interface QuizRecord {
  date: number;
  result: typeQuizResult;
}

export function loadHistory(): QuizRecord[] {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

export function saveRecord(record: QuizRecord) {
  const history = loadHistory();
  history.unshift(record);
  scopedStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 12)));
}

export function canRetake(): boolean {
  const history = loadHistory();
  if (history.length === 0) return true;
  const lastDate = new Date(history[0].date);
  return differenceInDays(new Date(), lastDate) >= COOLDOWN_DAYS;
}

export function daysUntilRetake(): number {
  const history = loadHistory();
  if (history.length === 0) return 0;
  const lastDate = new Date(history[0].date);
  const daysPassed = differenceInDays(new Date(), lastDate);
  return Math.max(0, COOLDOWN_DAYS - daysPassed);
}
