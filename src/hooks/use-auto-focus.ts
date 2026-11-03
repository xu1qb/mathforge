// EXPORTS: useAutoFocusFirstInput
// 进入页面时自动聚焦第一个输入框（移动端除外，避免弹出键盘）

import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * 进入模块时自动聚焦第一个可见输入框
 * 移动端默认关闭，避免进入即弹键盘
 * @param enabled 是否启用，默认 true
 * @param deps 触发重新聚焦的依赖（如 tab 切换）
 */
export function useAutoFocusFirstInput(enabled = true, deps: unknown[] = []) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!enabled) return;
    if (isMobile) return; // 移动端不强制聚焦

    // 等 DOM 渲染完成
    const timer = setTimeout(() => {
      // 找 main 区域内第一个可见的 input/textarea
      const main = document.querySelector('main');
      if (!main) return;
      const inputs = main.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input:not([type="hidden"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'
      );
      for (const el of inputs) {
        if (el.offsetParent !== null) {
          // 元素可见
          try {
            el.focus({ preventScroll: true });
          } catch {
            // ignore
          }
          break;
        }
      }
    }, 100);

    return () => clearTimeout(timer);
     
  }, [isMobile, enabled, ...deps]);
}
