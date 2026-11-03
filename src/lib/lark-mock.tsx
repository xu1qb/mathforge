// Local mock for @lark-apaas/client-toolkit-lite
// Replaces lark platform APIs with browser-safe fallbacks

import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

export { Link, NavLink, useLocation, useNavigate };

export function AppContainer({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ErrorRender({ error }: { error: Error }) {
  return <div>Error: {error.message}</div>;
}

export const logger = {
  info: (...args: unknown[]) => console.log('[info]', ...args),
  warn: (...args: unknown[]) => console.warn('[warn]', ...args),
  error: (...args: unknown[]) => console.error('[error]', ...args),
};

export const capabilityClient = {
  request: async () => ({}),
};

export const scopedStorage = {
  getItem: (key: string) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  },
  setItem: (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val)),
  removeItem: (key: string) => localStorage.removeItem(key),
};

export function resolveAppUrl(url: string) {
  return url;
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}
