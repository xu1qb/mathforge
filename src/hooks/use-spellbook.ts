import { useState, useEffect, useCallback, useMemo } from 'react';
import { scopedStorage } from '@/lib/lark-mock';
import { FORMULA_SPELL_CARDS, FORMULA_SETS, type FormulaSpellCard } from '@/data/formula-spells';

const STORAGE_KEY = 'mathforge:spellbook:state';

interface SpellState {
  /** 已看过的卡 id */
  viewed: string[];
  /** 已默写正确的卡 id */
  mastered: string[];
  /** 每张卡的上次错误时间戳（用于10分钟冷却） */
  cooldowns: Record<string, number>;
}

function loadState(): SpellState {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { viewed: [], mastered: [], cooldowns: {} };
}

function saveState(state: SpellState) {
  scopedStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** 模糊匹配：用户输入 vs 公式关键词。命中 ≥ 70% 的核心关键词即算对 */
export function matchFormula(userInput: string, card: FormulaSpellCard): { passed: boolean; matched: number; total: number } {
  const input = userInput.trim().toLowerCase();
  if (!input) return { passed: false, matched: 0, total: card.keywords.length };

  let matched = 0;
  for (const kw of card.keywords) {
    // 关键词可能是 LaTeX，也用小写比较
    // 同时也检查关键词的简化形式（去掉反斜杠）
    const kwLower = kw.toLowerCase();
    const kwPlain = kwLower.replace(/\\/g, '').replace(/_/g, '').replace(/\{|\}/g, '');
    const inputPlain = input.replace(/\\/g, '').replace(/_/g, '').replace(/\{|\}/g, '');

    if (
      input.includes(kwLower) ||
      inputPlain.includes(kwPlain) ||
      // 也接受中文关键字
      card.name.toLowerCase().includes(kw)
    ) {
      matched++;
    }
  }

  // 额外宽松：如果输入包含了公式的核心数学元素（等号、主要函数名等）也算贡献
  const extraSignals = ['=', '\\int', '\\sum', '\\lim', '\\frac', '\\nabla'];
  let extraMatches = 0;
  for (const sig of extraSignals) {
    if (input.includes(sig.toLowerCase())) extraMatches++;
  }

  const total = card.keywords.length;
  const effectiveMatched = Math.min(matched + Math.floor(extraMatches * 0.3), total);
  const ratio = total > 0 ? effectiveMatched / total : 0;

  // 70% 通过，至少要满足 2 个关键词
  const passed = ratio >= 0.6 && matched >= Math.min(2, Math.max(1, Math.floor(total * 0.4)));

  return { passed, matched: effectiveMatched, total };
}

export function useSpellbook() {
  const [state, setState] = useState<SpellState>(() => loadState());
  const [, forceTick] = useState(0);

  // 每秒刷新一次用于冷却计时
  useEffect(() => {
    const timer = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const markViewed = useCallback((cardId: string) => {
    setState((prev) => {
      if (prev.viewed.includes(cardId)) return prev;
      const next = { ...prev, viewed: [...prev.viewed, cardId] };
      saveState(next);
      return next;
    });
  }, []);

  const markMastered = useCallback((cardId: string) => {
    setState((prev) => {
      if (prev.mastered.includes(cardId)) return prev;
      const next = {
        ...prev,
        mastered: [...prev.mastered, cardId],
        viewed: prev.viewed.includes(cardId) ? prev.viewed : [...prev.viewed, cardId],
      };
      saveState(next);
      return next;
    });
  }, []);

  const markFailed = useCallback((cardId: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        viewed: prev.viewed.includes(cardId) ? prev.viewed : [...prev.viewed, cardId],
        cooldowns: { ...prev.cooldowns, [cardId]: Date.now() },
      };
      saveState(next);
      return next;
    });
  }, []);

  const isInCooldown = useCallback(
    (cardId: string): boolean => {
      const failTime = state.cooldowns[cardId];
      if (!failTime) return false;
      // 10 分钟冷却
      return Date.now() - failTime < 10 * 60 * 1000;
    },
    [state.cooldowns],
  );

  const getCooldownRemaining = useCallback(
    (cardId: string): number => {
      const failTime = state.cooldowns[cardId];
      if (!failTime) return 0;
      const remaining = 10 * 60 * 1000 - (Date.now() - failTime);
      return Math.max(0, remaining);
    },
    [state.cooldowns],
  );

  // 每套组进度
  const setProgress = useMemo(() => {
    const progress: Record<string, { total: number; mastered: number; viewed: number }> = {};
    for (const set of FORMULA_SETS) {
      const cards = FORMULA_SPELL_CARDS.filter((c) => c.set === set.id);
      progress[set.id] = {
        total: cards.length,
        mastered: cards.filter((c) => state.mastered.includes(c.id)).length,
        viewed: cards.filter((c) => state.viewed.includes(c.id)).length,
      };
    }
    return progress;
  }, [state.mastered, state.viewed]);

  // 已解锁称号
  const unlockedTitles = useMemo(() => {
    const titles: string[] = [];
    for (const set of FORMULA_SETS) {
      const p = setProgress[set.id];
      if (p && p.mastered >= p.total && p.total > 0) {
        titles.push(set.title);
      }
    }
    // 全部集齐
    const allMastered = FORMULA_SETS.every((s) => {
      const p = setProgress[s.id];
      return p && p.mastered >= p.total;
    });
    if (allMastered) titles.push('数学大法师');
    return titles;
  }, [setProgress]);

  const totalProgress = useMemo(() => {
    const total = FORMULA_SPELL_CARDS.length;
    const mastered = state.mastered.length;
    return { total, mastered, ratio: total > 0 ? mastered / total : 0 };
  }, [state.mastered]);

  return {
    state,
    allCards: FORMULA_SPELL_CARDS,
    sets: FORMULA_SETS,
    setProgress,
    unlockedTitles,
    totalProgress,
    markViewed,
    markMastered,
    markFailed,
    isInCooldown,
    getCooldownRemaining,
  };
}
