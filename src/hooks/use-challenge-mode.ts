// EXPORTS: useChallengeMode
// 闯关模式开关：与皮肤解耦，独立持久化。开启后竞赛专区/错题本切换到像素闯关界面。

import { useCallback, useEffect, useState } from 'react';
import { scopedStorage } from '@/lib/lark-mock';

const KEY = 'mathforge_challenge_mode';
const EVENT = 'mathforge:challenge-mode';

function read(): boolean {
  try {
    return scopedStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function useChallengeMode(): [boolean, (next: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(read);

  useEffect(() => {
    const sync = () => setEnabled(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const set = useCallback((next: boolean) => {
    try {
      scopedStorage.setItem(KEY, next ? '1' : '0');
    } catch {
      // ignore quota
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [enabled, set];
}
