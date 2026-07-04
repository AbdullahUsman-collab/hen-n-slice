import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@hen-n-slice/config';
import { getAccessToken } from './auth-token';

export function createClient() {
  console.log('[HenNSlice] Creating Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  return createSupabaseClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    accessToken: async () => getAccessToken() ?? null,
  });
}
