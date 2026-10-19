import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '../config/index.js';

let _client: SupabaseClient | null = null;

/**
 * Returns the Supabase server-side client.
 * Uses the service-role key if configured (bypasses RLS for backend operations),
 * otherwise falls back to the anon key (relies on RLS).
 * Returns null when Supabase is not configured (development/in-memory mode).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!_client) {
    const key = config.supabase.serviceRoleKey || config.supabase.anonKey;
    _client = createClient(config.supabase.url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _client;
}

/**
 * Verifies a Supabase JWT access token and returns the authenticated user.
 * Returns null if the token is invalid or Supabase is not configured.
 */
export async function verifySupabaseToken(
  token: string
): Promise<{ id: string; email: string } | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email ?? '',
  };
}
