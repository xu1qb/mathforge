// EXPORTS: wrapNakedLatex
// 把「中文里夹着的裸 LaTeX 片段」包成 $...$，交给 MathRenderer 渲染

const CJK = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/;
const GREEK = /[\u0370-\u03ff]/;

function isMathChar(ch: string): boolean {
  if (GREEK.test(ch)) return true;
  return /[A-Za-z0-9+\-*/^_={}()[\]]/.test(ch) || ch === ' ' || ch === ',' || ch === '.';
}

function isInnerChar(ch: string): boolean {
  if (isMathChar(ch)) return true;
  return '\\|<>,.'.includes(ch);
}

const MATH_SYMBOL_START = /[Σ∑∏∫√∞πλθαβγσ≤≥≠±]/;

function startsMath(s: string, i: number): boolean {
  if (s[i] === '\\') return true;
  if ((s[i] === '^' || s[i] === '_') && s[i + 1] === '{') return true;
  if (MATH_SYMBOL_START.test(s[i])) return true;
  return false;
}

export function wrapNakedLatex(text: string): string {
  if (!text) return text;
  // 有反斜杠命令，或出现 ^{ / _{ 才可能有裸公式
  if (!text.includes('\\') && !/\^\{|_\{/.test(text)) return text;
  const parts = text.split(/(\$[^$]*\$)/g);
  return parts
    .map((seg) => {
      if (seg.startsWith('$') && seg.endsWith('$')) return seg;
      const ranges: Array<[number, number]> = [];
      let i = 0;
      while (i < seg.length) {
        if (!startsMath(seg, i)) {
          i++;
          continue;
        }
        let start = i;
        while (start > 0 && isInnerChar(seg[start - 1]) && !CJK.test(seg[start - 1])) start--;
        // 去掉开头的空格与标点
        while (start < i && /[\s,;:]/.test(seg[start])) start++;
        let end = i;
        let depth = 0;
        while (end < seg.length) {
          const ch = seg[end];
          if (depth === 0 && CJK.test(ch)) break;
          if (ch === '{') depth++;
          else if (ch === '}') depth--;
          if (depth < 0) break;
          if (depth === 0 && !isInnerChar(ch)) break;
          end++;
        }
        while (end > start && /[\s,。；;:]/.test(seg[end - 1])) end--;
        if (end - start >= 2) {
          ranges.push([start, end]);
          i = end;
        } else {
          i++;
        }
      }
      if (ranges.length === 0) return seg;
      let out = '';
      let cursor = 0;
      for (const [a, b] of ranges) {
        out += seg.slice(cursor, a) + '$' + seg.slice(a, b) + '$';
        cursor = b;
      }
      return out + seg.slice(cursor);
    })
    .join('');
}
