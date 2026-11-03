import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const MATH_QUOTES = [
  { text: '数学是科学的皇后，而数论是数学的皇后。', author: '高斯' },
  { text: '上帝创造了整数，所有其余的数都是人造的。', author: '克罗内克' },
  { text: '数学中的一些美丽定理具有这样的特性：它们极易从事实中归纳出来，但证明却隐藏得极深。', author: '高斯' },
  { text: '时间是个常数，但对勤奋者来说，是个变数。用"分"来计算时间的人比用"小时"来计算时间的人时间多59倍。', author: '雷巴柯夫' },
  { text: '在数学的天地里，重要的不是我们知道什么，而是我们怎么知道什么。', author: '毕达哥拉斯' },
  { text: '一门科学，只有当它成功地运用数学时，才能达到真正完善的地步。', author: '马克思' },
  { text: '一个国家的科学水平可以用它消耗的数学来度量。', author: '拉奥' },
  { text: '数学是无穷的科学。', author: '赫尔曼外尔' },
  { text: '问题是数学的心脏。', author: 'P.R.哈尔莫斯' },
  { text: '数学是研究现实世界中数量关系和空间形式的科学。', author: '恩格斯' },
  { text: '数统治着宇宙。', author: '毕达哥拉斯' },
  { text: '数学，科学的女皇；数论，数学的女皇。', author: 'C.F.高斯' },
  { text: '上帝创造了整数，所有其余的数都是人造的。', author: 'L.克隆内克' },
  { text: '无限！再也没有其他问题如此深刻地打动过人类的心灵。', author: 'D.希尔伯特' },
  { text: '发现每一个新的群体在形式上都是数学的，因为我们不可能有其他的指导。', author: 'C.G.达尔文' },
];

export default function MathQuoteCard() {
  const quote = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return MATH_QUOTES[dayOfYear % MATH_QUOTES.length];
  }, []);

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-800/30">
      <CardContent className="py-4 px-4">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
            <Quote className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed text-foreground/90 italic">
              "{quote.text}"
            </p>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              —— {quote.author}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
