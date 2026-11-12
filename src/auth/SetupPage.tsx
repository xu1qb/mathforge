import { Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const DOC_URL = 'https://github.com/xu1qb/mathforge/blob/main/docs/cloud-sync.md';

export function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <Card className="w-full max-w-lg p-8">
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Cloud className="size-5" />
          云同步尚未配置
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          这个版本需要登录后使用。请先创建 Supabase 项目，并在构建环境里填入以下两个变量：
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs leading-relaxed">
          {'VITE_SUPABASE_URL=https://<project>.supabase.co\nVITE_SUPABASE_ANON_KEY=<anon-key>'}
        </pre>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          本地开发可先运行 <code className="rounded bg-muted px-1 py-0.5">npx supabase start</code>，再把
          <code className="mx-1 rounded bg-muted px-1 py-0.5">npx supabase status -o env</code>
          输出的 API_URL 与 ANON_KEY 写进 <code className="rounded bg-muted px-1 py-0.5">.env</code>。
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <a href={DOC_URL} target="_blank" rel="noreferrer">
              查看接入文档
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://github.com/xu1qb/mathforge" target="_blank" rel="noreferrer">
              返回仓库
            </a>
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          开发时想跳过登录，可设置 <code className="rounded bg-muted px-1 py-0.5">VITE_AUTH_BYPASS=1</code>。
        </p>
      </Card>
    </div>
  );
}
