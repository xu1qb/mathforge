import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '@/lib/supabase';

export interface AuthResult {
  error?: string;
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return '邮箱或密码不正确';
  if (m.includes('email not confirmed')) return '邮箱还没验证，请先点开邮件里的确认链接';
  if (m.includes('user already registered')) return '这个邮箱已经注册过了，直接登录即可';
  if (m.includes('password should be at least')) return '密码至少 6 位';
  if (m.includes('unable to validate email address')) return '邮箱格式不正确';
  if (m.includes('email rate limit exceeded')) return '邮件发送太频繁，请稍后再试';
  if (m.includes('signup is disabled')) return '当前暂不开放注册';
  if (m.includes('failed to fetch') || m.includes('network')) return '网络连接失败，请检查网络后重试';
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return;
      setSession(next);
      setLoading(false);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: '云同步未配置' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: friendlyAuthError(error.message) } : {};
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: '云同步未配置' };
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) return { error: friendlyAuthError(error.message) };
    return { needsConfirmation: !data.session };
  };

  const signOut = async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        configured: supabaseConfigured,
        loading,
        session,
        user: session?.user ?? null,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
