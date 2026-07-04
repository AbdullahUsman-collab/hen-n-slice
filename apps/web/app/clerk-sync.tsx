'use client';

import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useAuthStore } from '../store/auth-store';
import { setAccessToken } from '@hen-n-slice/api-client';

export default function ClerkSync() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      setAccessToken(undefined);
      setUser(null);
      return;
    }

    const clerkId = clerkUser.id;
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ?? null;

    async function sync() {
      const token = await getToken().catch(() => null);
      setAccessToken(token ?? undefined);
      console.log('[ClerkSync] Token set:', !!token, token ? `len=${token.length} prefix=${token.slice(0, 10)}...` : '');

      try {
        const { createClient } = await import('@hen-n-slice/api-client');
        console.log('[ClerkSync] SUPABASE_URL being used:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('[ClerkSync] ANON_KEY prefix:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) + '...');
        const supabase = createClient();

        console.log('[ClerkSync] QUERY: supabase.from("users").select("*").eq("id", clerkId).single()');
        console.log('[ClerkSync] clerkId type:', typeof clerkId, 'value:', clerkId);

        const { data: existing, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', clerkId)
          .single();

        console.log('[ClerkSync] SELECT result:', JSON.stringify(existing), 'error:', JSON.stringify(error));

        if (existing) {
          console.log('[ClerkSync] Role from DB:', existing.role);
          setUser(existing);
        } else {
          console.log('[ClerkSync] No row found — inserting');
          const newUser = {
            id: clerkId,
            email,
            role: 'customer' as const,
            created_at: new Date().toISOString(),
          };
          console.log('[ClerkSync] INSERT payload:', JSON.stringify(newUser));
          console.log('[ClerkSync] INSERT into: supabase.from("users")');

          const { data: insertResult, error: insertError } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single();

          console.log('[ClerkSync] INSERT result:', JSON.stringify(insertResult), 'error:', JSON.stringify(insertError));

          if (insertError) {
            console.error('[ClerkSync] INSERT FAILED — full error:', JSON.stringify(insertError, null, 2));
            console.error('[ClerkSync] Error code:', insertError.code, 'details:', insertError.details, 'hint:', insertError.hint);
            return;
          }

          setUser(newUser);
        }
      } catch (err) {
        console.error('[ClerkSync] UNEXPECTED ERROR — full object:', err);
        console.error('[ClerkSync] Error constructor:', err?.constructor?.name);
        console.error('[ClerkSync] Error keys:', Object.keys(err as object));
        if (err instanceof Error) {
          console.error('[ClerkSync] Error stack:', err.stack);
        }
      }
    }

    sync();
  }, [isLoaded, isSignedIn, clerkUser, getToken, setUser]);

  return null;
}
