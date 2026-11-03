import { Link } from "react-router-dom";
import { Home, Compass, BookMarked, Flame } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="text-6xl font-bold text-muted-foreground/40 mb-2">404</div>
      <div className="text-2xl font-serif text-foreground mb-1">∅ 空集</div>
      <p className="text-sm text-muted-foreground mb-8">这个页面不存在，就像发散的级数一样找不到收敛点</p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
        >
          <Home className="size-4" /> 返回首页
        </Link>
        <Link
          to="/competition"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-card border border-border text-sm hover:bg-muted transition-colors"
        >
          <Flame className="size-4" /> 竞赛备战
        </Link>
        <Link
          to="/formulas"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-card border border-border text-sm hover:bg-muted transition-colors"
        >
          <BookMarked className="size-4" /> 公式速查
        </Link>
        <Link
          to="/practice"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-card border border-border text-sm hover:bg-muted transition-colors"
        >
          <Compass className="size-4" /> 开始练习
        </Link>
      </div>
    </div>
  );
}
