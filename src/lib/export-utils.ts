// EXPORTS: copyAsText, copyAsLatex, copyAsMarkdown, exportTextFile, downloadFile

import { toast } from 'sonner';

/**
 * 复制文本到剪贴板
 */
export async function copyAsText(text: string, label = '文本'): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`已复制${label}`);
    return true;
  } catch {
    // 兜底
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(`已复制${label}`);
      return true;
    } catch {
      toast.error('复制失败');
      return false;
    }
  }
}

/**
 * 复制 LaTeX 格式
 */
export function copyAsLatex(latex: string): Promise<boolean> {
  return copyAsText(latex, 'LaTeX');
}

/**
 * 复制 Markdown 格式（标题 + LaTeX 公式块 + 说明）
 */
export function copyAsMarkdown(title: string, latex: string, description?: string): Promise<boolean> {
  const md = `## ${title}\n\n$$${latex}$$\n\n${description || ''}`.trim();
  return copyAsText(md, 'Markdown');
}

/**
 * 触发浏览器下载文件
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/plain'): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`已导出 ${filename}`);
  } catch {
    toast.error('导出失败');
  }
}

/**
 * 导出文本文件（矩阵、级数展开等长结果）
 */
export function exportTextFile(content: string, filename: string): void {
  downloadFile(content, filename, 'text/plain;charset=utf-8');
}
