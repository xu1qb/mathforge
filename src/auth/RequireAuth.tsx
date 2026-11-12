import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { LoginPage } from './LoginPage';
import { SetupPage } from './SetupPage';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { configured, loading, session } = useAuth();

  if (import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === '1') return <>{children}</>;

  if (!configured) return <SetupPage />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          正在检查登录状态…
        </div>
      </div>
    );
  }

  if (!session) return <LoginPage />;

  return <>{children}</>;
}
