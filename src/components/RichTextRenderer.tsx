import { memo } from 'react';
import MathRenderer from './MathRenderer';
import { wrapNakedLatex } from '@/lib/math-text';

interface RichTextRendererProps {
  /** 支持 $...$ 公式 + **粗体** + 换行的富文本 */
  text: string;
  /** 公式是否 display 模式 */
  displayMath?: boolean;
  className?: string;
}

/**
 * 通用富文本渲染器：解析 $...$（KaTeX）+ **粗体** + 多行换行
 * 用于解析、答案、解题过程等混排文本
 */
function RichTextRenderer({ text: rawText, displayMath = false, className }: RichTextRendererProps) {
  if (!rawText) return null;
  // 中文里夹着的裸 LaTeX 片段先包成 $...$，避免显示成源码
  const text = wrapNakedLatex(rawText);

  // 启发式：文本不含 $ 且包含典型 LaTeX 命令 → 整段是裸 LaTeX，直接公式渲染
  const LATEX_CMD_PATTERN = /\\(frac|dfrac|cfrac|lim|sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|log|ln|lg|sqrt|int|oint|sum|prod|mathbf|mathbb|mathcal|mathrm|text|textrm|textit|textbf|binom|begin|end|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|pi|varpi|rho|varrho|sigma|varsigma|tau|upsilon|phi|varphi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|infty|cdots|ldots|vdots|ddots|ge|le|neq|ne|approx|equiv|pm|mp|times|div|cdot|circ|partial|nabla|to|rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|uparrow|downarrow|updownarrow|forall|exists|neg|land|lor|implies|iff|in|notin|subset|supset|subseteq|supseteq|cup|cap|emptyset|varnothing|mathbb|mathcal|mathfrak|mathtt|mathit|mathbf|mathrm|left\.|right\.|\{|\}|\||\||\[|\])/.test(text);
  const looksLikeRawLatex = !text.includes('$') && LATEX_CMD_PATTERN;
  if (looksLikeRawLatex) {
    return (
      <div className={className}>
        <MathRenderer expression={text} displayMode={displayMath} />
      </div>
    );
  }

  const lines = text.split('\n');

  return (
    <div className={className}>
      {lines.map((line, lineIdx) => {
        // 空行 => 间距
        if (line.trim() === '') {
          return <div key={lineIdx} className="h-3" />;
        }
        return (
          <div key={lineIdx} className="leading-relaxed">
            <InlineRenderer text={line} displayMath={displayMath} />
          </div>
        );
      })}
    </div>
  );
}

interface InlineRendererProps {
  text: string;
  displayMath?: boolean;
}

function InlineRenderer({ text, displayMath }: InlineRendererProps) {
  const parts: React.ReactNode[] = [];
  let key = 0;

  // 先处理 $$...$$ 块级公式，再处理 $...$ 行内公式
  const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;

  // 使用分割法处理整行：先按 $$ 分块
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockMathRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      // $$ 之间的普通文本，再解析 $...$ 行内公式
      const beforeText = text.slice(lastIndex, match.index);
      parts.push(
        <InlineMathOnlyRenderer key={`bi-${key++}`} text={beforeText} displayMath={displayMath} />,
      );
    }
    // $$ 块级公式
    parts.push(
      <div key={`bm-${key++}`} className="my-2">
        <MathRenderer expression={match[1].trim()} displayMode />
      </div>,
    );
    lastIndex = blockMathRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    parts.push(
      <InlineMathOnlyRenderer key={`bi-${key++}`} text={remaining} displayMath={displayMath} />,
    );
  }

  return <>{parts}</>;
}

/** 仅处理 $...$ 行内公式 + 粗体 */
function InlineMathOnlyRenderer({ text, displayMath }: InlineRendererProps) {
  const parts: React.ReactNode[] = [];
  let key = 0;

  const mathRegex = /\$([^$]+)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      parts.push(
        <span key={`t-${key++}`}>
          <BoldRenderer text={beforeText} />
        </span>,
      );
    }
    parts.push(
      <MathRenderer key={`m-${key++}`} expression={match[1]} displayMode={displayMath} />,
    );
    lastIndex = mathRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={`t-${key++}`}>
        <BoldRenderer text={text.slice(lastIndex)} />
      </span>,
    );
  }

  return <>{parts}</>;
}

function BoldRenderer({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`b-t-${key++}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(
      <strong key={`b-${key++}`} className="font-semibold text-foreground dark:text-foreground">
        {match[1]}
      </strong>,
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`b-t-${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
}

export default memo(RichTextRenderer);
