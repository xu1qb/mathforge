import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { scopedStorage } from '@/lib/lark-mock';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type SkinType = 'night' | 'paper' | 'pixel' | 'journal';

interface ThemeContextValue {
  /** 用户选择的主题模式 */
  mode: ThemeMode;
  /** 实际生效的主题（system 模式下解析为 light/dark） */
  theme: ResolvedTheme;
  /** 在 light/dark 之间切换（保持 system 兼容） */
  toggleTheme: () => void;
  /** 直接设置主题模式 */
  setMode: (m: ThemeMode) => void;
  /** 当前皮肤 */
  skin: SkinType;
  /** 设置皮肤 */
  setSkin: (s: SkinType) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'mathforge_theme';
const SKIN_STORAGE_KEY = 'mathforge_skin';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const saved = scopedStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {
      // ignore
    }
    return 'system';
  });

  const [skin, setSkinState] = useState<SkinType>(() => {
    try {
      const saved = scopedStorage.getItem(SKIN_STORAGE_KEY);
      if (saved === 'night' || saved === 'paper' || saved === 'pixel' || saved === 'journal') return saved;
    } catch {
      // ignore
    }
    return 'night';
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());
  const theme = resolveTheme(mode);

  // 应用主题到 DOM
  useEffect(() => {
    const root = document.documentElement;
    // 添加过渡类，使主题切换平滑
    root.style.setProperty('color-scheme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      scopedStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore quota
    }
  }, [theme, mode]);

  // 应用皮肤到 DOM
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-skin', skin);
    try {
      scopedStorage.setItem(SKIN_STORAGE_KEY, skin);
    } catch {
      // ignore quota
    }
    // 触发自定义事件，便于图表/KaTeX 监听重绘
    window.dispatchEvent(new CustomEvent('skinchange', { detail: { skin } }));
  }, [skin]);

  // 监听系统主题变化（仅 system 模式下影响解析结果）
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    // toggle 在 light/dark 间切换，若是 system 则先切到相反的具体主题
    setModeState((prev) => {
      const current = prev === 'system' ? systemTheme : prev;
      return current === 'light' ? 'dark' : 'light';
    });
  }, [systemTheme]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
  }, []);

  const setSkin = useCallback((s: SkinType) => {
    setSkinState(s);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleTheme, setMode, skin, setSkin }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
