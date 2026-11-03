import { memo } from 'react';
import RichTextRenderer from './RichTextRenderer';

interface ProblemTextProps {
  /** 题目/答案/解析文本，支持 $...$ / $$...$$ LaTeX 公式 + **粗体** + 多行换行 */
  text: string;
  /** 公式是否 display 模式 */
  displayMath?: boolean;
  className?: string;
}

/**
 * 全局统一的题目文本渲染组件 —— 所有展示 problem/answer/solution/hint 的地方
 * 都应使用本组件，避免 LaTeX 源码泄漏。
 *
 * 底层使用 RichTextRenderer，自动识别：
 * - $...$ 行内公式
 * - $$...$$ 块级公式
 * - \displaystyle 等 LaTeX 命令
 * - **粗体**
 * - 多行换行
 *
 * 渲染失败时降级为可读文本（不会显示 \frac \lim 等原始源码）
 */
function ProblemText({ text, displayMath = false, className }: ProblemTextProps) {
  return <RichTextRenderer text={text} displayMath={displayMath} className={className} />;
}

export default memo(ProblemText);
