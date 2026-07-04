import { createClient } from './client';

const supabase = createClient();

export async function signInWithPhone(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

export async function verifyOtp(
  phone: string,
  token: string,
): Promise<{ user: unknown; session: unknown }> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
