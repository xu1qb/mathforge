import type { LocalSnapshot } from './data-backup';
import { supabase } from './supabase';

export const LAST_USER_KEY = 'mathforge:meta:last-user-id';

export interface CloudLoadResult {
  snapshot: LocalSnapshot | null;
  updatedAt: string | null;
  error?: string;
}

export async function loadCloudSnapshot(userId: string): Promise<CloudLoadResult> {
  if (!supabase) return { snapshot: null, updatedAt: null, error: '云同步未配置' };
  const { data, error } = await supabase
    .from('user_data')
    .select('snapshot, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return { snapshot: null, updatedAt: null, error: error.message };
  if (!data?.snapshot) return { snapshot: null, updatedAt: data?.updated_at ?? null };
  return { snapshot: data.snapshot as LocalSnapshot, updatedAt: data.updated_at ?? null };
}

export async function saveCloudSnapshot(
  userId: string,
  snapshot: LocalSnapshot
): Promise<{ error?: string }> {
  if (!supabase) return { error: '云同步未配置' };
  const { error } = await supabase.from('user_data').upsert(
    { user_id: userId, snapshot, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  return error ? { error: error.message } : {};
}
