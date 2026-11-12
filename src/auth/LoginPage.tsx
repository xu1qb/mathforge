import { useState, type FormEvent } from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from './AuthProvider';

type Mode = 'login' | 'signup';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNeedsConfirmation(false);
    setConfirm('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('请输入邮箱');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    if (mode === 'signup' && password !== confirm) {
      setError('两次输入的密码不一致');
      return;
    }

    setSubmitting(true);
    const result =
      mode === 'login'
        ? await signIn(trimmed, password)
        : await signUp(trimmed, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === 'signup' && result.needsConfirmation) {
      setNeedsConfirmation(true);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="skin-pattern-bg pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src="./icon.svg" alt="" className="size-14 rounded-2xl shadow-lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">MathForge</h1>
            <p className="mt-1 text-sm text-muted-foreground">登录后，学习记录会自动同步到云端</p>
          </div>
        </div>

        <Card className="p-6 shadow-xl sm:p-8">
          {needsConfirmation ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MailCheck className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">确认邮件已发送</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  请打开 {email} 的收件箱，点击确认链接后再回来登录。
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setNeedsConfirmation(false);
                  switchMode('login');
                }}
              >
                返回登录
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/50 p-1">
                {(['login', 'signup'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => switchMode(item)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition',
                      mode === item
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {item === 'login' ? '登录' : '注册'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">邮箱</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      placeholder="至少 6 位"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? '隐藏密码' : '显示密码'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm">确认密码</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="再输入一次"
                        className="pl-10"
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  {mode === 'login' ? '登录' : '创建账号'}
                </Button>
              </form>

              <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <span>
                  学习数据保存在你的 Supabase 项目里，只有登录账号能访问。换设备登录即可继续。
                </span>
              </div>
            </>
          )}
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          MathForge · 开源数学计算工作台
        </p>
      </div>
    </div>
  );
}
