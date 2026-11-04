// EXPORTS: RichMath
// 把混排文本里的 $...$ 片段交给 KaTeX 渲染，其余原样输出。
import MathRenderer from '@/components/MathRenderer';
import { cn } from '@/lib/utils';

interface RichMathProps {
  text: string;
  className?: string;
}

export default function RichMath({ text, className }: RichMathProps) {
  const parts = text.split(/(\$[^$]+\$)/g).filter((p) => p !== '');
  return (
    <span className={cn(className)}>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          return <MathRenderer key={i} expression={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
